using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Drawing;
using System.IO;
using System.Runtime.InteropServices;
using System.Text.Json;
using System.Windows.Forms;
using Microsoft.Web.WebView2.Core;
using Microsoft.Web.WebView2.WinForms;

namespace SAPatcher;

public sealed class GameOverlayForm : Form
{
    private readonly WebView2 _webView;
    private readonly System.Windows.Forms.Timer _syncTimer;
    private readonly System.Windows.Forms.Timer _mediaPollTimer;
    private bool _isOpen = false;
    private bool _wasF11Down = false;
    private IntPtr _lastGameHwnd = IntPtr.Zero;
    private int _audioTick = 0;

    #region Win32 API
    private static readonly IntPtr HWND_TOPMOST = new IntPtr(-1);
    private const uint SWP_NOSIZE = 0x0001;
    private const uint SWP_NOMOVE = 0x0002;
    private const uint SWP_NOACTIVATE = 0x0010;
    private const uint SWP_SHOWWINDOW = 0x0040;
    private const uint SWP_HIDEWINDOW = 0x0080;

    private const int WS_EX_TOPMOST = 0x00000008;
    private const int WS_EX_TOOLWINDOW = 0x00000080;
    private const int WS_EX_NOACTIVATE = 0x08000000;

    private const int WM_MOUSEACTIVATE = 0x0021;
    private const int MA_NOACTIVATE = 3;

    private const byte VK_VOLUME_DOWN = 0xAE;
    private const byte VK_VOLUME_UP = 0xAF;
    private const uint KEYEVENTF_KEYUP = 0x0002;

    [StructLayout(LayoutKind.Sequential)]
    public struct RECT
    {
        public int Left;
        public int Top;
        public int Right;
        public int Bottom;
        public int Width => Right - Left;
        public int Height => Bottom - Top;
    }

    [StructLayout(LayoutKind.Sequential)]
    public struct MARGINS
    {
        public int cxLeftWidth;
        public int cxRightWidth;
        public int cyTopHeight;
        public int cyBottomHeight;
    }

    [DllImport("user32.dll")]
    private static extern bool SetWindowPos(IntPtr hWnd, IntPtr hWndInsertAfter, int X, int Y, int cx, int cy, uint uFlags);

    [DllImport("user32.dll")]
    private static extern IntPtr FindWindow(string? lpClassName, string? lpWindowName);

    [DllImport("user32.dll")]
    private static extern bool GetWindowRect(IntPtr hWnd, out RECT lpRect);

    [DllImport("user32.dll")]
    private static extern bool IsWindow(IntPtr hWnd);

    [DllImport("user32.dll")]
    private static extern bool IsWindowVisible(IntPtr hWnd);

    [DllImport("user32.dll")]
    private static extern bool IsIconic(IntPtr hWnd);

    [DllImport("user32.dll")]
    private static extern short GetAsyncKeyState(int vKey);

    [DllImport("user32.dll")]
    private static extern void keybd_event(byte bVk, byte bScan, uint dwFlags, UIntPtr dwExtraInfo);

    [DllImport("user32.dll")]
    private static extern bool ClipCursor(IntPtr lpRect);

    [DllImport("dwmapi.dll")]
    private static extern int DwmExtendFrameIntoClientArea(IntPtr hWnd, ref MARGINS pMarInset);

    private delegate bool EnumWindowsProc(IntPtr hWnd, IntPtr lParam);

    [DllImport("user32.dll")]
    private static extern bool EnumWindows(EnumWindowsProc lpEnumFunc, IntPtr lParam);

    [DllImport("user32.dll")]
    private static extern uint GetWindowThreadProcessId(IntPtr hWnd, out uint lpdwProcessId);
    #endregion

    protected override bool ShowWithoutActivation => true;

    public GameOverlayForm()
    {
        SetStyle(ControlStyles.SupportsTransparentBackColor, true);

        FormBorderStyle = FormBorderStyle.None;
        ShowInTaskbar = false;
        TopMost = true;
        StartPosition = FormStartPosition.Manual;
        BackColor = Color.Black;
        Opacity = 1.0;
        Size = new Size(1280, 720);

        _webView = new WebView2
        {
            Dock = DockStyle.Fill,
            DefaultBackgroundColor = Color.Transparent
        };
        Controls.Add(_webView);

        _syncTimer = new System.Windows.Forms.Timer
        {
            Interval = 35 // ~30 FPS sync
        };
        _syncTimer.Tick += OnSyncTimerTick;

        _mediaPollTimer = new System.Windows.Forms.Timer
        {
            Interval = 1000 // Poll active Windows media every 1 sec
        };
        _mediaPollTimer.Tick += async (s, e) =>
        {
            if (_isOpen)
            {
                await WindowsMediaSessionService.FetchAndBroadcastStateAsync();
            }
        };

        InitializeOverlayAsync();
    }

    protected override void WndProc(ref Message m)
    {
        if (m.Msg == WM_MOUSEACTIVATE)
        {
            // Crucial: deliver clicks to WebView2 without deactivating the game window!
            m.Result = (IntPtr)MA_NOACTIVATE;
            return;
        }
        base.WndProc(ref m);
    }

    protected override void SetVisibleCore(bool value)
    {
        // Enforce: Form CANNOT be visible unless _isOpen is explicitly true
        base.SetVisibleCore(_isOpen && value);
    }

    protected override void OnHandleCreated(EventArgs e)
    {
        base.OnHandleCreated(e);

        try
        {
            // DWM glass extension for true hardware transparency
            MARGINS margins = new MARGINS { cxLeftWidth = -1, cxRightWidth = -1, cyTopHeight = -1, cyBottomHeight = -1 };
            DwmExtendFrameIntoClientArea(Handle, ref margins);
        }
        catch {}

        // By default on startup, overlay is CLOSED and COMPLETELY HIDDEN
        SetWindowPos(Handle, IntPtr.Zero, 0, 0, 0, 0, SWP_NOSIZE | SWP_NOMOVE | SWP_NOACTIVATE | SWP_HIDEWINDOW);
    }

    protected override CreateParams CreateParams
    {
        get
        {
            CreateParams cp = base.CreateParams;
            // WS_EX_NOACTIVATE prevents Windows from stealing foreground activation from the game
            cp.ExStyle |= WS_EX_TOPMOST | WS_EX_TOOLWINDOW | WS_EX_NOACTIVATE;
            return cp;
        }
    }

    private async void InitializeOverlayAsync()
    {
        try
        {
            string localApp = Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData);
            string userDataDir = Path.Combine(localApp, "SAPatcher", "OverlayWebView2Data");
            Directory.CreateDirectory(userDataDir);

            var env = await CoreWebView2Environment.CreateAsync(null, userDataDir);
            await _webView.EnsureCoreWebView2Async(env);

            _webView.DefaultBackgroundColor = Color.Transparent;
            _webView.CoreWebView2.Settings.IsStatusBarEnabled = false;
            _webView.CoreWebView2.Settings.AreDevToolsEnabled = false;
            _webView.CoreWebView2.Settings.AreDefaultContextMenusEnabled = false;

            _webView.CoreWebView2.WebMessageReceived += OnWebMessageReceived;

            string overlayHtmlPath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "wwwroot", "overlay.html");
            if (!File.Exists(overlayHtmlPath))
            {
                overlayHtmlPath = Path.Combine(AppContext.BaseDirectory, "..", "..", "..", "wwwroot", "overlay.html");
            }

            if (File.Exists(overlayHtmlPath))
            {
                _webView.CoreWebView2.Navigate(new Uri(overlayHtmlPath).AbsoluteUri);
            }

            // Initialize Windows Media Session Service
            await WindowsMediaSessionService.InitializeAsync(payload =>
            {
                BroadcastMediaToWeb(payload);
            });

            _syncTimer.Start();
            _mediaPollTimer.Start();
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[GameOverlay] Init error: {ex.Message}");
        }
    }

    private static readonly JsonSerializerOptions _jsonOpts = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase
    };

    private void BroadcastMediaToWeb(MediaStatePayload payload)
    {
        if (IsDisposed || !IsHandleCreated || _webView?.CoreWebView2 == null) return;

        try
        {
            BeginInvoke(new Action(() =>
            {
                try
                {
                    string json = JsonSerializer.Serialize(payload, _jsonOpts);
                    string js = $"if (typeof window.updateMediaSession === 'function') window.updateMediaSession({json});";
                    _webView?.CoreWebView2?.ExecuteScriptAsync(js);
                }
                catch {}
            }));
        }
        catch {}
    }

    public void ToggleOverlay()
    {
        if (IsDisposed || Handle == IntPtr.Zero) return;

        if (!_isOpen)
        {
            // Try to open overlay
            IntPtr gameHwnd = FindGameWindow();
            if (gameHwnd == IntPtr.Zero || !IsWindow(gameHwnd) || !IsWindowVisible(gameHwnd) || IsIconic(gameHwnd))
            {
                // Game is not running -> DO NOT OPEN
                return;
            }

            _isOpen = true;
            _lastGameHwnd = gameHwnd;

            if (GetWindowRect(gameHwnd, out RECT rect) && rect.Width > 100 && rect.Height > 100)
            {
                SetBounds(rect.Left, rect.Top, rect.Width, rect.Height);
                SetWindowPos(Handle, HWND_TOPMOST, rect.Left, rect.Top, rect.Width, rect.Height, SWP_SHOWWINDOW | SWP_NOACTIVATE);
            }
            else
            {
                SetWindowPos(Handle, HWND_TOPMOST, 0, 0, 0, 0, SWP_NOSIZE | SWP_NOMOVE | SWP_SHOWWINDOW | SWP_NOACTIVATE);
            }

            Show();

            // Unclip cursor and show it so mouse moves freely
            try
            {
                ClipCursor(IntPtr.Zero);
                Cursor.Show();
            }
            catch {}

            string js = "if (typeof window.setOverlayOpen === 'function') window.setOverlayOpen(true);";
            _webView?.CoreWebView2?.ExecuteScriptAsync(js);

            int sysVol = WindowsAudioDeviceService.GetMasterVolumePercent();
            _webView?.CoreWebView2?.ExecuteScriptAsync($"if(typeof window.setSystemVolume==='function')window.setSystemVolume({sysVol});");

            _ = WindowsMediaSessionService.FetchAndBroadcastStateAsync();
        }
        else
        {
            // Close overlay
            CloseOverlay();
        }
    }

    public void CloseOverlay()
    {
        if (!_isOpen) return;

        _isOpen = false;

        try
        {
            string js = "if (typeof window.setOverlayOpen === 'function') window.setOverlayOpen(false);";
            _webView?.CoreWebView2?.ExecuteScriptAsync(js);
        }
        catch {}

        Hide();
    }

    private void OnSyncTimerTick(object? sender, EventArgs e)
    {
        // 1. Check F11 Hotkey globally with debounce
        short f11State = GetAsyncKeyState((int)Keys.F11);
        bool isF11Down = (f11State & 0x8000) != 0;

        if (isF11Down && !_wasF11Down)
        {
            ToggleOverlay();
        }
        _wasF11Down = isF11Down;

        // 2. If overlay is closed, ensure it stays completely hidden and do nothing else
        if (!_isOpen)
        {
            return;
        }

        // 3. If overlay is open, verify game window is still alive and visible
        IntPtr gameHwnd = FindGameWindow();

        if (gameHwnd == IntPtr.Zero || !IsWindow(gameHwnd) || !IsWindowVisible(gameHwnd) || IsIconic(gameHwnd))
        {
            // Game closed or minimized -> close overlay immediately
            CloseOverlay();
            return;
        }

        // Only update overlay position if game window moved/resized
        if (GetWindowRect(gameHwnd, out RECT rect) && rect.Width > 100 && rect.Height > 100)
        {
            if (Left != rect.Left || Top != rect.Top || Width != rect.Width || Height != rect.Height)
            {
                SetBounds(rect.Left, rect.Top, rect.Width, rect.Height);
                SetWindowPos(Handle, HWND_TOPMOST, rect.Left, rect.Top, rect.Width, rect.Height, SWP_NOACTIVATE);
            }
        }

        // 4. Sample real audio peak from Windows default playback device and drive 5 reactive bars
        try
        {
            _audioTick++;
            float peak = WindowsAudioDeviceService.GetAudioPeak();
            float b0 = Math.Clamp(peak * 0.70f + (float)Math.Sin(_audioTick * 0.35) * 0.12f * peak, 0.05f, 1f);
            float b1 = Math.Clamp(peak * 0.50f + (float)Math.Cos(_audioTick * 0.45) * 0.15f * peak, 0.05f, 1f);
            float b2 = Math.Clamp(peak * 0.95f + (float)Math.Sin(_audioTick * 0.60) * 0.10f * peak, 0.05f, 1f);
            float b3 = Math.Clamp(peak * 0.45f + (float)Math.Cos(_audioTick * 0.50) * 0.15f * peak, 0.05f, 1f);
            float b4 = Math.Clamp(peak * 0.75f + (float)Math.Sin(_audioTick * 0.40) * 0.12f * peak, 0.05f, 1f);

            if (peak < 0.015f)
            {
                b0 = 0.05f; b1 = 0.05f; b2 = 0.05f; b3 = 0.05f; b4 = 0.05f;
            }

            string jsBars = string.Create(System.Globalization.CultureInfo.InvariantCulture,
                $"if(typeof window.updateAudioBars==='function')window.updateAudioBars([{b0:0.##},{b1:0.##},{b2:0.##},{b3:0.##},{b4:0.##}]);");
            _webView?.CoreWebView2?.ExecuteScriptAsync(jsBars);
        }
        catch {}
    }

    private IntPtr FindGameWindow()
    {
        // 1. Process search: motion.exe, gta_sa.exe, samp.exe
        string[] targetProcessNames = new[] { "motion", "gta_sa", "samp" };
        var pids = new HashSet<uint>();

        foreach (var name in targetProcessNames)
        {
            try
            {
                var procs = Process.GetProcessesByName(name);
                foreach (var p in procs)
                {
                    pids.Add((uint)p.Id);
                    if (p.MainWindowHandle != IntPtr.Zero && IsWindow(p.MainWindowHandle) && IsWindowVisible(p.MainWindowHandle) && !IsIconic(p.MainWindowHandle))
                    {
                        if (GetWindowRect(p.MainWindowHandle, out RECT r) && r.Width > 200 && r.Height > 200)
                        {
                            return p.MainWindowHandle;
                        }
                    }
                }
            }
            catch {}
        }

        // 2. If MainWindowHandle was 0, enumerate all visible windows for these process IDs
        IntPtr foundHwnd = IntPtr.Zero;
        if (pids.Count > 0)
        {
            EnumWindows((hWnd, lParam) =>
            {
                if (IsWindow(hWnd) && IsWindowVisible(hWnd) && !IsIconic(hWnd))
                {
                    GetWindowThreadProcessId(hWnd, out uint pid);
                    if (pids.Contains(pid))
                    {
                        if (GetWindowRect(hWnd, out RECT r) && r.Width > 200 && r.Height > 200)
                        {
                            foundHwnd = hWnd;
                            return false; // Stop enumeration
                        }
                    }
                }
                return true;
            }, IntPtr.Zero);

            if (foundHwnd != IntPtr.Zero) return foundHwnd;
        }

        // 3. Fallback: Search by known GTA class name or window titles
        IntPtr hwnd = FindWindow("Grand theft auto San Andreas", null);
        if (hwnd != IntPtr.Zero && IsWindow(hwnd) && IsWindowVisible(hwnd) && !IsIconic(hwnd)) return hwnd;

        hwnd = FindWindow(null, "GTA: San Andreas");
        if (hwnd != IntPtr.Zero && IsWindow(hwnd) && IsWindowVisible(hwnd) && !IsIconic(hwnd)) return hwnd;

        hwnd = FindWindow(null, "Motion");
        if (hwnd != IntPtr.Zero && IsWindow(hwnd) && IsWindowVisible(hwnd) && !IsIconic(hwnd)) return hwnd;

        return IntPtr.Zero;
    }

    private async void OnWebMessageReceived(object? sender, CoreWebView2WebMessageReceivedEventArgs e)
    {
        try
        {
            using var doc = JsonDocument.Parse(e.WebMessageAsJson);
            var root = doc.RootElement;
            if (!root.TryGetProperty("action", out var actionProp)) return;

            string action = actionProp.GetString() ?? "";

            switch (action)
            {
                case "media_play_pause":
                    await WindowsMediaSessionService.TogglePlayPauseAsync();
                    await WindowsMediaSessionService.FetchAndBroadcastStateAsync();
                    break;

                case "media_next":
                    await WindowsMediaSessionService.SkipNextAsync();
                    await WindowsMediaSessionService.FetchAndBroadcastStateAsync();
                    break;

                case "media_prev":
                    await WindowsMediaSessionService.SkipPreviousAsync();
                    await WindowsMediaSessionService.FetchAndBroadcastStateAsync();
                    break;

                case "set_volume":
                    if (root.TryGetProperty("value", out var valProp))
                    {
                        int vol = valProp.GetInt32();
                        WindowsAudioDeviceService.SetMasterVolumePercent(vol);
                    }
                    break;

                case "media_volume_up":
                    int up = Math.Min(100, WindowsAudioDeviceService.GetMasterVolumePercent() + 5);
                    WindowsAudioDeviceService.SetMasterVolumePercent(up);
                    _webView?.CoreWebView2?.ExecuteScriptAsync($"if(typeof window.setSystemVolume==='function')window.setSystemVolume({up});");
                    break;

                case "media_volume_down":
                    int down = Math.Max(0, WindowsAudioDeviceService.GetMasterVolumePercent() - 5);
                    WindowsAudioDeviceService.SetMasterVolumePercent(down);
                    _webView?.CoreWebView2?.ExecuteScriptAsync($"if(typeof window.setSystemVolume==='function')window.setSystemVolume({down});");
                    break;

                case "close_overlay":
                    CloseOverlay();
                    break;
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[GameOverlay] Message error: {ex.Message}");
        }
    }

    protected override void Dispose(bool disposing)
    {
        if (disposing)
        {
            _syncTimer.Stop();
            _syncTimer.Dispose();
            _mediaPollTimer.Stop();
            _mediaPollTimer.Dispose();
            _webView.Dispose();
        }
        base.Dispose(disposing);
    }
}

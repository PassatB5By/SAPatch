using System;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Threading;
using System.Windows.Forms;

namespace SAPatcher;

public static class TrayService
{
    private static NotifyIcon? _trayIcon;
    private static Thread? _trayThread;
    private static Action? _onShowWindow;
    private static Action? _onExit;

    public static void Initialize(Action onShowWindow, Action onExit)
    {
        _onShowWindow = onShowWindow;
        _onExit = onExit;

        _trayThread = new Thread(() =>
        {
            try
            {
                var icon = CreateAppIcon();

                var contextMenu = new ContextMenuStrip();
                bool isRu = SettingsManager.Current.Language != "en";

                var headerItem = new ToolStripMenuItem(isRu ? "SAPatcher v1.0.0 (Служба активна)" : "SAPatcher v1.0.0 (Daemon Active)")
                {
                    Enabled = false,
                    Font = new Font("Segoe UI", 9f, FontStyle.Bold)
                };

                var showItem = new ToolStripMenuItem(isRu ? "Открыть SAPatcher" : "Open SAPatcher", null, (s, e) =>
                {
                    _onShowWindow?.Invoke();
                });

                var testWidgetItem = new ToolStripMenuItem(isRu ? "Тест виджета (5 сек)" : "Test Popup Widget (5s)", null, (s, e) =>
                {
                    LauncherPopupWidget.ShowPopup("Motion Launcher", "v1.0.0 Stable");
                });

                var statusItem = new ToolStripMenuItem(isRu ? "Фоновая служба: Порт 49742" : "Background Daemon: Port 49742")
                {
                    Enabled = false
                };

                var exitItem = new ToolStripMenuItem(isRu ? "Выход" : "Exit", null, (s, e) =>
                {
                    _trayIcon?.Dispose();
                    _onExit?.Invoke();
                    Application.ExitThread();
                });

                contextMenu.Items.Add(headerItem);
                contextMenu.Items.Add(new ToolStripSeparator());
                contextMenu.Items.Add(showItem);
                contextMenu.Items.Add(testWidgetItem);
                contextMenu.Items.Add(statusItem);
                contextMenu.Items.Add(new ToolStripSeparator());
                contextMenu.Items.Add(exitItem);

                _trayIcon = new NotifyIcon
                {
                    Icon = icon,
                    Text = "SAPatcher — Служба оптимизации игр (Активна)",
                    Visible = true,
                    ContextMenuStrip = contextMenu
                };

                _trayIcon.DoubleClick += (s, e) =>
                {
                    _onShowWindow?.Invoke();
                };

                Application.Run();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[TrayService] Error: {ex.Message}");
            }
        });

        _trayThread.SetApartmentState(ApartmentState.STA);
        _trayThread.IsBackground = true;
        _trayThread.Start();
    }

    public static void Shutdown()
    {
        try
        {
            if (_trayIcon != null)
            {
                _trayIcon.Visible = false;
                _trayIcon.Dispose();
                _trayIcon = null;
            }
        }
        catch {}
    }

    private static Icon CreateAppIcon()
    {
        using var bmp = new Bitmap(32, 32);
        using var g = Graphics.FromImage(bmp);
        g.SmoothingMode = SmoothingMode.AntiAlias;
        g.Clear(Color.Transparent);

        using (var brush = new LinearGradientBrush(new Rectangle(0, 0, 32, 32), Color.FromArgb(0, 229, 255), Color.FromArgb(121, 40, 202), 45f))
        {
            g.FillEllipse(brush, 1, 1, 30, 30);
        }

        using (var darkBrush = new SolidBrush(Color.FromArgb(11, 14, 23)))
        {
            g.FillEllipse(darkBrush, 3, 3, 26, 26);
        }

        using (var font = new Font("Segoe UI", 10.5f, FontStyle.Bold, GraphicsUnit.Pixel))
        using (var textBrush = new SolidBrush(Color.FromArgb(0, 229, 255)))
        {
            var sf = new StringFormat
            {
                Alignment = StringAlignment.Center,
                LineAlignment = StringAlignment.Center
            };
            g.DrawString("SA", font, textBrush, new RectangleF(0, 0, 32, 32), sf);
        }

        IntPtr hIcon = bmp.GetHicon();
        return Icon.FromHandle(hIcon);
    }
}

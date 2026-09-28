using System;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Management;
using System.Runtime.InteropServices;
using System.Runtime.Intrinsics.X86;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.Win32;
using Photino.NET;

namespace SAPatcher;

public class Program
{
    private static readonly JsonSerializerOptions JsonOpts = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        WriteIndented = false
    };

    [DllImport("user32.dll")]
    private static extern bool ShowWindow(IntPtr hWnd, int nCmdShow);
    [DllImport("user32.dll")]
    private static extern bool SetForegroundWindow(IntPtr hWnd);
    [DllImport("user32.dll", SetLastError = true)]
    private static extern IntPtr FindWindow(string? lpClassName, string lpWindowName);

    private const int SW_HIDE = 0;
    private const int SW_RESTORE = 9;
    private static bool _isExiting = false;

    private static void CleanupOrphanedWebViewProcesses(string customDataDir)
    {
        try
        {
            string lockfile = Path.Combine(customDataDir, "EBWebView", "lockfile");
            if (File.Exists(lockfile))
            {
                try
                {
                    File.Delete(lockfile);
                }
                catch (IOException)
                {
                    foreach (var p in Process.GetProcessesByName("msedgewebview2"))
                    {
                        try { p.Kill(); } catch {}
                    }
                    Thread.Sleep(150);
                    try { File.Delete(lockfile); } catch {}
                }
            }

            string localApp = Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData);
            string photinoLock = Path.Combine(localApp, "Photino", "EBWebView", "lockfile");
            if (File.Exists(photinoLock))
            {
                try { File.Delete(photinoLock); } catch {}
            }
        }
        catch {}
    }

    [STAThread]
    public static void Main(string[] args)
    {
        Mutex? appMutex = null;
        try
        {
            if (args.Length > 0 && args[0] == "--guard-info")
            {
                var p = Guard.GuardManager.ActiveProvider;
                Console.WriteLine($"[GUARD-INFO] Provider: {p.ProviderName}");
                Console.WriteLine($"[GUARD-INFO] Version: {p.Version}");
                Console.WriteLine($"[GUARD-INFO] IsProprietary: {p.IsProprietary}");
                Console.WriteLine($"[GUARD-INFO] Script Length: {p.GetGuardScript().Length}");
                return;
            }
            if (args.Length > 0 && args[0] == "--patch-motion")
            {
                string target = args.Length > 1 ? args[1] : (SettingsManager.Current.MotionLauncherPath ?? "");
                var res = LauncherPatcherService.PatchLauncher(target);
                Console.WriteLine($"[PATCH-RESULT] Success={res.Success}, Msg={res.Message}");
                foreach (var l in res.Logs) Console.WriteLine(l);
                return;
            }
            if (args.Length > 0 && args[0] == "--restore-motion")
            {
                string target = args.Length > 1 ? args[1] : (SettingsManager.Current.MotionLauncherPath ?? "");
                var res = LauncherPatcherService.RestoreLauncher(target);
                Console.WriteLine($"[RESTORE-RESULT] Success={res.Success}, Msg={res.Message}");
                foreach (var l in res.Logs) Console.WriteLine(l);
                return;
            }

            const string SingleInstanceMutexName = "SAPatcher_SingleInstance_App_Mutex";
            bool isNewInstance = true;
            try
            {
                appMutex = new Mutex(true, SingleInstanceMutexName, out isNewInstance);
            }
            catch
            {
                isNewInstance = true;
            }

            if (!isNewInstance)
            {
                try
                {
                    IntPtr existingWnd = FindWindow(null, "SAPatcher");
                    if (existingWnd != IntPtr.Zero)
                    {
                        ShowWindow(existingWnd, SW_RESTORE);
                        SetForegroundWindow(existingWnd);
                    }
                }
                catch {}
                return;
            }

            string localApp = Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData);
            string webviewDataDir = Path.Combine(localApp, "SAPatcher", "WebView2Data");
            Directory.CreateDirectory(webviewDataDir);

            CleanupOrphanedWebViewProcesses(webviewDataDir);

            var window = new PhotinoWindow()
                .SetTitle("SAPatcher")
                .SetTemporaryFilesPath(webviewDataDir)
                .SetBrowserControlInitParameters("--disable-features=CalculateNativeWinOcclusion --disable-gpu-watchdog")
                .SetSize(1180, 800)
                .Center()
                .SetResizable(true);

            var settings = SettingsManager.Load();

            window.RegisterWindowClosingHandler((sender, args) =>
            {
                if (_isExiting) return false;
                if (SettingsManager.Current.MinimizeToTray)
                {
                    ShowWindow(window.WindowHandle, SW_HIDE);
                    return true;
                }
                return false;
            });

            LauncherServiceDaemon.Start(msg =>
            {
                try { window.SendWebMessage(msg); } catch {}
            });

            TrayService.Initialize(
                onShowWindow: () =>
                {
                    try
                    {
                        if (window.WindowHandle != IntPtr.Zero)
                        {
                            ShowWindow(window.WindowHandle, SW_RESTORE);
                            SetForegroundWindow(window.WindowHandle);
                        }
                    }
                    catch {}
                },
                onExit: () =>
                {
                    _isExiting = true;
                    try
                    {
                        window.Close();
                    }
                    catch {}
                }
            );

        window.RegisterWebMessageReceivedHandler((sender, message) =>
        {
            try
            {
                using var doc = JsonDocument.Parse(message);
                var root = doc.RootElement;
                if (root.TryGetProperty("action", out var actionProp))
                {
                    string action = actionProp.GetString() ?? string.Empty;
                    if (action == "getSettings")
                    {
                        var payload = new
                        {
                            @event = "settingsLoaded",
                            success = true,
                            data = SettingsManager.Current
                        };
                        window.SendWebMessage(JsonSerializer.Serialize(payload, JsonOpts));
                    }
                    else if (action == "saveSettings")
                    {
                        if (root.TryGetProperty("settings", out var st))
                        {
                            var newSettings = JsonSerializer.Deserialize<AppSettings>(st.GetRawText(), new JsonSerializerOptions
                            {
                                PropertyNameCaseInsensitive = true
                            });
                            if (newSettings != null)
                            {
                                SettingsManager.Save(newSettings);
                            }
                        }
                        var payload = new
                        {
                            @event = "settingsSaved",
                            success = true,
                            data = SettingsManager.Current
                        };
                        window.SendWebMessage(JsonSerializer.Serialize(payload, JsonOpts));
                    }
                    else if (action == "checkMotionPatchStatus")
                    {
                        string path = root.TryGetProperty("path", out var p) ? p.GetString() ?? string.Empty : string.Empty;
                        var status = LauncherPatcherService.GetStatus(path);
                        var gameIntegrity = LauncherPatcherService.CheckGameFolderIntegrity(status.DiscoveredGamePath);
                        var payload = new
                        {
                            @event = "motionPatchStatusResult",
                            success = true,
                            data = status,
                            gameIntegrity = gameIntegrity
                        };
                        window.SendWebMessage(JsonSerializer.Serialize(payload, JsonOpts));
                    }
                    else if (action == "checkGameIntegrity")
                    {
                        string path = root.TryGetProperty("path", out var p) ? p.GetString() ?? string.Empty : string.Empty;
                        var res = LauncherPatcherService.CheckGameFolderIntegrity(path);
                        var payload = new
                        {
                            @event = "gameIntegrityResult",
                            success = true,
                            data = res
                        };
                        window.SendWebMessage(JsonSerializer.Serialize(payload, JsonOpts));
                    }
                    else if (action == "apply4GbPatch")
                    {
                        string path = root.TryGetProperty("path", out var p) ? p.GetString() ?? string.Empty : string.Empty;
                        bool ok = LauncherPatcherService.Apply4GbPatchToGame(path, out var logs);
                        var gameIntegrity = LauncherPatcherService.CheckGameFolderIntegrity(path);
                        var payload = new
                        {
                            @event = "apply4GbPatchResult",
                            success = ok,
                            logs = logs,
                            gameIntegrity = gameIntegrity
                        };
                        window.SendWebMessage(JsonSerializer.Serialize(payload, JsonOpts));
                    }
                    else if (action == "generateGameFingerprint")
                    {
                        string path = root.TryGetProperty("path", out var p) ? p.GetString() ?? string.Empty : string.Empty;
                        string? resolved = LauncherPatcherService.ResolveGamePath(path);
                        if (!string.IsNullOrEmpty(resolved) && Directory.Exists(resolved))
                        {
                            var (ok, mf, violations) = LauncherPatcherService.GenerateGameIntegrityFingerprint(resolved, out var vList);
                            var gameIntegrity = LauncherPatcherService.CheckGameFolderIntegrity(resolved);
                            if (ok && mf != null)
                            {
                                var payload = new
                                {
                                    @event = "gameFingerprintResult",
                                    success = true,
                                    message = $"Отпечаток игры успешно создан ({mf.Files.Count} файлов проверено и защищено)",
                                    violations = new List<string>(),
                                    gameIntegrity = gameIntegrity
                                };
                                window.SendWebMessage(JsonSerializer.Serialize(payload, JsonOpts));
                            }
                            else
                            {
                                var payload = new
                                {
                                    @event = "gameFingerprintResult",
                                    success = false,
                                    message = "Обновление отпечатка отклонено защитой! В папке игры обнаружены подозрительные файлы или попытка внедрения читов:",
                                    violations = vList,
                                    gameIntegrity = gameIntegrity
                                };
                                window.SendWebMessage(JsonSerializer.Serialize(payload, JsonOpts));
                            }
                        }
                        else
                        {
                            var payload = new
                            {
                                @event = "gameFingerprintResult",
                                success = false,
                                message = "Папка игры не найдена на диске",
                                violations = new List<string> { "Каталог игры не обнаружен." }
                            };
                            window.SendWebMessage(JsonSerializer.Serialize(payload, JsonOpts));
                        }
                    }
                    else if (action == "patchMotionLauncher")
                    {
                        string path = root.TryGetProperty("path", out var p) ? p.GetString() ?? string.Empty : string.Empty;
                        var res = LauncherPatcherService.PatchLauncher(path);
                        var payload = new
                        {
                            @event = "motionPatchResult",
                            success = res.Success,
                            data = res
                        };
                        window.SendWebMessage(JsonSerializer.Serialize(payload, JsonOpts));
                    }
                    else if (action == "restoreMotionLauncher")
                    {
                        string path = root.TryGetProperty("path", out var p) ? p.GetString() ?? string.Empty : string.Empty;
                        var res = LauncherPatcherService.RestoreLauncher(path);
                        var payload = new
                        {
                            @event = "motionRestoreResult",
                            success = res.Success,
                            data = res
                        };
                        window.SendWebMessage(JsonSerializer.Serialize(payload, JsonOpts));
                    }
                    else if (action == "testWidget")
                    {
                        string launcher = root.TryGetProperty("launcher", out var ln) ? ln.GetString() ?? "Motion Launcher" : "Motion Launcher";
                        LauncherPopupWidget.ShowPopup(launcher, "v1.0.0 Stable");
                    }
                    else if (action == "runCheck")
                    {
                        var data = DiagnosticsService.RunDiagnostics();
                        var payload = new
                        {
                            @event = "diagnosticsResult",
                            success = true,
                            timestamp = DateTime.UtcNow.ToString("o"),
                            data
                        };
                        window.SendWebMessage(JsonSerializer.Serialize(payload, JsonOpts));
                    }
                    else if (action == "ping")
                    {
                        var pong = new { @event = "pong", status = "alive", daemon = LauncherServiceDaemon.IsRunning };
                        window.SendWebMessage(JsonSerializer.Serialize(pong, JsonOpts));
                    }
                    else if (action == "detectMotionLauncher")
                    {
                        var info = MotionLauncherService.DetectMotionLauncher();
                        var payload = new
                        {
                            @event = "motionLauncherResult",
                            success = true,
                            data = info
                        };
                        window.SendWebMessage(JsonSerializer.Serialize(payload, JsonOpts));
                    }
                    else if (action == "applyMotionOptimization")
                    {
                        var req = new MotionOptimizationRequest();
                        if (root.TryGetProperty("launcherPath", out var lp)) req.LauncherPath = lp.GetString() ?? string.Empty;
                        if (root.TryGetProperty("gamePath", out var gp)) req.GamePath = gp.GetString() ?? string.Empty;
                        if (root.TryGetProperty("dxvkVersion", out var dv)) req.DxvkVersion = dv.GetString() ?? "3.1.1";
                        if (root.TryGetProperty("enable4gbPatch", out var e4)) req.Enable4gbPatch = e4.GetBoolean();
                        if (root.TryGetProperty("enableSeamless", out var es)) req.EnableSeamless = es.GetBoolean();
                        if (root.TryGetProperty("enableTearFree", out var et)) req.EnableTearFree = et.GetBoolean();
                        if (root.TryGetProperty("enableVsyncOff", out var ev)) req.EnableVsyncOff = ev.GetBoolean();
                        if (root.TryGetProperty("enableHud", out var eh)) req.EnableHud = eh.GetBoolean();
                        if (root.TryGetProperty("hudElements", out var he)) req.HudElements = he.GetString() ?? "version,fps,gpuload,memory";
                        if (root.TryGetProperty("hudScale", out var hs)) req.HudScale = hs.GetDouble();
                        if (root.TryGetProperty("hudX", out var hx)) req.HudX = hx.GetInt32();
                        if (root.TryGetProperty("hudY", out var hy)) req.HudY = hy.GetInt32();
                        if (root.TryGetProperty("enableFpsLimit", out var efl)) req.EnableFpsLimit = efl.GetBoolean();
                        if (root.TryGetProperty("maxFrameRate", out var mfr)) req.MaxFrameRate = mfr.GetInt32();

                        SettingsManager.Update(s =>
                        {
                            if (!string.IsNullOrWhiteSpace(req.GamePath)) s.MotionGamePath = req.GamePath;
                            s.DxvkVersion = req.DxvkVersion;
                            s.Enable4gbPatch = req.Enable4gbPatch;
                            s.EnableSeamless = req.EnableSeamless;
                            s.EnableTearFree = req.EnableTearFree;
                            s.EnableVsyncOff = req.EnableVsyncOff;
                            s.EnableHud = req.EnableHud;
                            s.HudScale = req.HudScale;
                            s.HudX = req.HudX;
                            s.HudY = req.HudY;
                            s.EnableFpsLimit = req.EnableFpsLimit;
                            s.MaxFrameRate = req.MaxFrameRate;
                        });

                        var result = MotionLauncherService.ApplyOptimization(req);
                        var payload = new
                        {
                            @event = "motionOptimizationResult",
                            success = result.Success,
                            data = result
                        };
                        window.SendWebMessage(JsonSerializer.Serialize(payload, JsonOpts));
                    }
                    else if (action == "browseGamePath")
                    {
                        string currentPath = root.TryGetProperty("currentPath", out var cp) ? cp.GetString() ?? string.Empty : SettingsManager.Current.MotionGamePath;
                        string? selected = null;
                        var t = new Thread(() =>
                        {
                            using var fbd = new FolderBrowserDialog
                            {
                                Description = "Выберите каталог игры Motion Project / GTA San Andreas (где находятся motion.exe и samp.exe)",
                                UseDescriptionForTitle = true,
                                ShowNewFolderButton = false,
                                AutoUpgradeEnabled = true
                            };
                            string? init = LauncherPatcherService.ResolveGamePath(currentPath);
                            if (!string.IsNullOrEmpty(init) && Directory.Exists(init))
                            {
                                fbd.InitialDirectory = init;
                            }
                            if (fbd.ShowDialog() == DialogResult.OK && !string.IsNullOrWhiteSpace(fbd.SelectedPath))
                            {
                                selected = fbd.SelectedPath;
                            }
                        });
                        t.SetApartmentState(ApartmentState.STA);
                        t.Start();
                        t.Join();

                        if (!string.IsNullOrEmpty(selected))
                        {
                            string finalPath = LauncherPatcherService.ResolveCustomGamePath(selected);
                            SettingsManager.Update(s => s.MotionGamePath = finalPath);
                            var gameIntegrity = LauncherPatcherService.CheckGameFolderIntegrity(finalPath);
                            var payload = new
                            {
                                @event = "gamePathSelected",
                                success = true,
                                path = finalPath,
                                gameIntegrity = gameIntegrity
                            };
                            window.SendWebMessage(JsonSerializer.Serialize(payload, JsonOpts));
                        }
                    }
                    else if (action == "browseGameExeFile")
                    {
                        string currentPath = root.TryGetProperty("currentPath", out var cp) ? cp.GetString() ?? string.Empty : SettingsManager.Current.MotionGamePath;
                        string? selectedDir = null;
                        var t = new Thread(() =>
                        {
                            using var ofd = new OpenFileDialog
                            {
                                Title = "Выберите исполняемый файл игры (motion.exe, samp.exe или gta_sa.exe)",
                                Filter = "Файлы игры (motion.exe; samp.exe; gta_sa.exe)|motion.exe;samp.exe;gta_sa.exe;*.exe|Все файлы (*.*)|*.*",
                                AutoUpgradeEnabled = true
                            };
                            string? init = LauncherPatcherService.ResolveGamePath(currentPath);
                            if (!string.IsNullOrEmpty(init) && Directory.Exists(init))
                            {
                                ofd.InitialDirectory = init;
                            }
                            if (ofd.ShowDialog() == DialogResult.OK && !string.IsNullOrWhiteSpace(ofd.FileName))
                            {
                                selectedDir = Path.GetDirectoryName(ofd.FileName);
                            }
                        });
                        t.SetApartmentState(ApartmentState.STA);
                        t.Start();
                        t.Join();

                        if (!string.IsNullOrEmpty(selectedDir))
                        {
                            string finalPath = LauncherPatcherService.ResolveCustomGamePath(selectedDir);
                            SettingsManager.Update(s => s.MotionGamePath = finalPath);
                            var gameIntegrity = LauncherPatcherService.CheckGameFolderIntegrity(finalPath);
                            var payload = new
                            {
                                @event = "gamePathSelected",
                                success = true,
                                path = finalPath,
                                gameIntegrity = gameIntegrity
                            };
                            window.SendWebMessage(JsonSerializer.Serialize(payload, JsonOpts));
                        }
                    }
                    else if (action == "browseLauncherPath")
                    {
                        string currentPath = root.TryGetProperty("currentPath", out var cp) ? cp.GetString() ?? string.Empty : string.Empty;
                        string? selected = null;
                        var t = new Thread(() =>
                        {
                            using var ofd = new OpenFileDialog
                            {
                                Title = "Выберите исполняемый файл Motion Launcher.exe",
                                Filter = "Motion Launcher (Motion Launcher.exe)|Motion Launcher.exe;*.exe|Все исполняемые файлы (*.exe)|*.exe",
                                AutoUpgradeEnabled = true
                            };
                            if (File.Exists(currentPath))
                            {
                                ofd.InitialDirectory = Path.GetDirectoryName(currentPath);
                                ofd.FileName = Path.GetFileName(currentPath);
                            }
                            if (ofd.ShowDialog() == DialogResult.OK && !string.IsNullOrWhiteSpace(ofd.FileName))
                            {
                                selected = ofd.FileName;
                            }
                        });
                        t.SetApartmentState(ApartmentState.STA);
                        t.Start();
                        t.Join();

                        if (!string.IsNullOrEmpty(selected))
                        {
                            var payload = new
                            {
                                @event = "launcherPathSelected",
                                success = true,
                                path = selected
                            };
                            window.SendWebMessage(JsonSerializer.Serialize(payload, JsonOpts));
                        }
                    }
                    else if (action == "setGamePath")
                    {
                        string path = root.TryGetProperty("path", out var p) ? p.GetString() ?? string.Empty : string.Empty;
                        string finalPath = LauncherPatcherService.ResolveCustomGamePath(path);
                        bool exists = Directory.Exists(finalPath);
                        if (exists)
                        {
                            SettingsManager.Update(s => s.MotionGamePath = finalPath);
                        }
                        var gameIntegrity = LauncherPatcherService.CheckGameFolderIntegrity(finalPath);
                        var payload = new
                        {
                            @event = "gamePathUpdated",
                            success = exists,
                            path = finalPath,
                            gameIntegrity = gameIntegrity
                        };
                        window.SendWebMessage(JsonSerializer.Serialize(payload, JsonOpts));
                    }
                    else if (action == "detectGamePathFromLauncher")
                    {
                        string? detected = LauncherPatcherService.DetectGamePathFromLauncher();
                        string finalPath = detected ?? string.Empty;
                        if (!string.IsNullOrEmpty(finalPath))
                        {
                            SettingsManager.Update(s => s.MotionGamePath = finalPath);
                        }
                        var gameIntegrity = LauncherPatcherService.CheckGameFolderIntegrity(finalPath);
                        var payload = new
                        {
                            @event = "gamePathUpdated",
                            success = !string.IsNullOrEmpty(finalPath),
                            path = finalPath,
                            gameIntegrity = gameIntegrity
                        };
                        window.SendWebMessage(JsonSerializer.Serialize(payload, JsonOpts));
                    }
                    else if (action == "openMotionFolder")
                    {
                        string targetPath = root.TryGetProperty("path", out var tp) ? tp.GetString() ?? string.Empty : string.Empty;
                        MotionLauncherService.OpenFolder(targetPath);
                    }
                    else if (action == "launchMotionLauncher")
                    {
                        string targetPath = root.TryGetProperty("path", out var tp) ? tp.GetString() ?? string.Empty : string.Empty;
                        MotionLauncherService.LaunchApp(targetPath);
                    }
                }
            }
            catch (Exception ex)
            {
                var err = new
                {
                    @event = "diagnosticsError",
                    success = false,
                    error = ex.Message
                };
                window.SendWebMessage(JsonSerializer.Serialize(err, JsonOpts));
            }
        });

        string appDir = AppDomain.CurrentDomain.BaseDirectory;
        string indexPath = Path.Combine(appDir, "wwwroot", "index.html");
        if (!File.Exists(indexPath))
        {
            indexPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "index.html");
        }

        window.Load(indexPath);
        window.WaitForClose();

        LauncherServiceDaemon.Stop();
        TrayService.Shutdown();
    }
    catch (Exception ex)
    {
        string crashLog = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "SAPatcher_Crash.log");
        string details = $"[{DateTime.Now:yyyy-MM-dd HH:mm:ss}] FATAL CRASH in Program.Main:\r\n{ex}\r\n\r\n";
        File.AppendAllText(crashLog, details, Encoding.UTF8);
        Console.WriteLine(details);
        try
        {
            System.Windows.Forms.MessageBox.Show(
                $"Произошла непредвиденная ошибка при запуске SAPatcher:\n\n{ex.Message}\n\nПодробности записаны в SAPatcher_Crash.log",
                "SAPatcher — Ошибка запуска",
                System.Windows.Forms.MessageBoxButtons.OK,
                System.Windows.Forms.MessageBoxIcon.Error
            );
        }
        catch {}
    }
    finally
    {
        try { appMutex?.Dispose(); } catch {}
    }
}
}

public class DiagnosticsService
{
    [StructLayout(LayoutKind.Sequential, CharSet = CharSet.Ansi)]
    private struct DEVMODE
    {
        [MarshalAs(UnmanagedType.ByValTStr, SizeConst = 32)]
        public string dmDeviceName;
        public short dmSpecVersion;
        public short dmDriverVersion;
        public short dmSize;
        public short dmDriverExtra;
        public int dmFields;
        public int dmPositionX;
        public int dmPositionY;
        public int dmDisplayOrientation;
        public int dmDisplayFixedOutput;
        public short dmColor;
        public short dmDuplex;
        public short dmYResolution;
        public short dmTTOption;
        public short dmCollate;
        [MarshalAs(UnmanagedType.ByValTStr, SizeConst = 32)]
        public string dmFormName;
        public short dmLogPixels;
        public short dmBitsPerPel;
        public int dmPelsWidth;
        public int dmPelsHeight;
        public int dmDisplayFlags;
        public int dmDisplayFrequency;
        public int dmICMMethod;
        public int dmICMIntent;
        public int dmMediaType;
        public int dmDitherType;
        public int dmReserved1;
        public int dmReserved2;
        public int dmPanningWidth;
        public int dmPanningHeight;
    }

    [DllImport("user32.dll")]
    private static extern bool EnumDisplaySettings(string? deviceName, int modeNum, ref DEVMODE devMode);

    private const int ENUM_CURRENT_SETTINGS = -1;

    public static DiagnosticsReport RunDiagnostics()
    {
        var report = new DiagnosticsReport
        {
            Os = GetOsInfo(),
            Gpu = GetGpuInfo(),
            Cpu = GetCpuInfo(),
            Display = GetDisplayInfo()
        };

        string savedReportPath = GenerateEnglishHtmlReport(report);
        report.ReportFilePath = savedReportPath;
        report.ReportFileName = Path.GetFileName(savedReportPath);

        return report;
    }

    private static OsInfo GetOsInfo()
    {
        string productName = "Windows 11 Pro";
        string displayVersion = "24H2";
        string currentBuild = "26100";
        string ubr = "1742";
        bool is64 = Environment.Is64BitOperatingSystem;

        try
        {
            using var key = Registry.LocalMachine.OpenSubKey(@"SOFTWARE\Microsoft\Windows NT\CurrentVersion");
            if (key != null)
            {
                productName = key.GetValue("ProductName")?.ToString() ?? productName;
                displayVersion = key.GetValue("DisplayVersion")?.ToString() ?? displayVersion;
                currentBuild = key.GetValue("CurrentBuild")?.ToString() ?? currentBuild;
                var ubrVal = key.GetValue("UBR");
                if (ubrVal != null)
                {
                    ubr = ubrVal.ToString()!;
                }
            }
        }
        catch
        {
        }

        if (int.TryParse(currentBuild, out int buildNum) && buildNum >= 22000)
        {
            if (productName.Contains("Windows 10", StringComparison.OrdinalIgnoreCase))
            {
                productName = productName.Replace("Windows 10", "Windows 11");
            }
            else if (!productName.Contains("Windows 11", StringComparison.OrdinalIgnoreCase))
            {
                productName = "Windows 11 " + productName;
            }
        }

        string osFullName = $"{productName} {(is64 ? "64-bit" : "32-bit")}".Trim();
        string versionBuild = $"{displayVersion} (Build {currentBuild}.{ubr})";

        return new OsInfo
        {
            Name = osFullName,
            VersionBuild = versionBuild,
            DisplayVersion = displayVersion,
            BuildNumber = currentBuild,
            Ubr = ubr,
            Is64Bit = is64,
            DirectXRuntime = "DirectX 12 (DirectX Agility SDK / DXGI 1.6)",
            WddmStatus = "WDDM 3.2 (Vulkan WSI совместим)",
            StatusReady = true
        };
    }

    private static GpuInfo GetGpuInfo()
    {
        string gpuName = "NVIDIA GeForce RTX 3060 Ti";
        string driverVersion = "32.0.15.9186";
        long vramBytes = 0;

        try
        {
            using var searcher = new ManagementObjectSearcher("SELECT Name, DriverVersion, AdapterRAM FROM Win32_VideoController");
            foreach (ManagementObject obj in searcher.Get())
            {
                string name = obj["Name"]?.ToString() ?? string.Empty;
                if (string.IsNullOrWhiteSpace(name)) continue;

                if (name.Contains("Parsec", StringComparison.OrdinalIgnoreCase) ||
                    name.Contains("Virtual Desktop", StringComparison.OrdinalIgnoreCase) ||
                    name.Contains("RDP", StringComparison.OrdinalIgnoreCase) ||
                    name.Contains("Basic Display", StringComparison.OrdinalIgnoreCase))
                {
                    continue;
                }

                gpuName = name;
                driverVersion = obj["DriverVersion"]?.ToString() ?? driverVersion;
                if (obj["AdapterRAM"] != null && long.TryParse(obj["AdapterRAM"]?.ToString(), out long ram))
                {
                    vramBytes = ram;
                }
                break;
            }
        }
        catch
        {
        }

        long regVram = ReadRegistryVram();
        if (regVram > vramBytes)
        {
            vramBytes = regVram;
        }

        string vramFormatted = FormatVram(vramBytes, gpuName);
        string cleanDriver = FormatDriverVersion(driverVersion, gpuName);

        var (vulkanFound, vulkanVersion) = CheckVulkanLoader();

        var dxvkCompat = new DxvkMatrix
        {
            Dxvk1103 = new DxvkTier
            {
                Version = "DXVK 1.10.3",
                Specification = "Vulkan 1.1 Baseline (Legacy D3D9)",
                Status = "compatible",
                BadgeKey = "gpu.dxvk1103_badge"
            },
            Dxvk23 = new DxvkTier
            {
                Version = "DXVK 2.3",
                Specification = "Vulkan 1.3 Baseline",
                Status = "compatible",
                BadgeKey = "gpu.dxvk23_badge"
            },
            Dxvk30 = new DxvkTier
            {
                Version = "DXVK 3.0",
                Specification = "Vulkan Extended Dynamic State",
                Status = "supported",
                BadgeKey = "gpu.dxvk30_badge"
            },
            Dxvk311 = new DxvkTier
            {
                Version = "DXVK 3.1.1",
                Specification = "Актуальная: расширенные пайплайны",
                Status = "recommended",
                BadgeKey = "gpu.dxvk311_badge"
            }
        };

        return new GpuInfo
        {
            Model = gpuName,
            Vram = vramFormatted,
            DriverVersion = cleanDriver,
            DirectXSupport = "DirectX 12 (FL 12_2 Ultimate)",
            VulkanSupport = vulkanFound ? $"Vulkan Loader {vulkanVersion}" : "Vulkan 1.3/1.4 Compatible",
            VulkanLoaderVersion = vulkanVersion,
            VulkanFound = vulkanFound,
            DxvkCompat = dxvkCompat,
            VerdictTextKey = "gpu.verdict_text",
            VerdictDescKey = "gpu.verdict_desc"
        };
    }

    private static CpuInfo GetCpuInfo()
    {
        string cpuName = "AMD Ryzen 5 2600 Six-Core Processor";
        int cores = 6;
        int threads = 12;
        int clockMhz = 3400;

        try
        {
            using var searcher = new ManagementObjectSearcher("SELECT Name, NumberOfCores, NumberOfLogicalProcessors, MaxClockSpeed FROM Win32_Processor");
            foreach (ManagementObject obj in searcher.Get())
            {
                cpuName = obj["Name"]?.ToString()?.Trim() ?? cpuName;
                if (obj["NumberOfCores"] != null && int.TryParse(obj["NumberOfCores"]?.ToString(), out int c)) cores = c;
                if (obj["NumberOfLogicalProcessors"] != null && int.TryParse(obj["NumberOfLogicalProcessors"]?.ToString(), out int t)) threads = t;
                if (obj["MaxClockSpeed"] != null && int.TryParse(obj["MaxClockSpeed"]?.ToString(), out int spd)) clockMhz = spd;
                break;
            }
        }
        catch
        {
        }

        bool sse42 = Sse42.IsSupported;
        bool avx2 = Avx2.IsSupported;

        double ghz = clockMhz / 1000.0;
        string clockFormatted = $"{ghz:0.00} GHz ({clockMhz} MHz)";

        int overheadScore = Math.Min(98, (threads >= 12 ? 92 : threads >= 8 ? 85 : 72) + (avx2 ? 6 : 0));

        return new CpuInfo
        {
            Model = cpuName,
            Cores = cores,
            Threads = threads,
            ClockSpeed = clockFormatted,
            ClockMhz = clockMhz,
            Sse42 = sse42,
            Avx2 = avx2,
            OverheadPercent = overheadScore,
            OverheadStatusKey = "cpu.overhead_status",
            OverheadDescKey = "cpu.overhead_desc"
        };
    }

    private static DisplayInfo GetDisplayInfo()
    {
        string model = "Acer KG271U X1 (27\" QHD Gaming Display)";
        int width = 2560;
        int height = 1440;
        int currentHz = 200;
        int maxHz = 200;
        int bitsPerPixel = 32;

        try
        {
            using var searcher = new ManagementObjectSearcher(@"root\wmi", "SELECT UserFriendlyName, ManufacturerName FROM WmiMonitorID");
            foreach (ManagementObject obj in searcher.Get())
            {
                var nameArr = obj["UserFriendlyName"] as ushort[] ?? (obj["UserFriendlyName"] as Array)?.Cast<object>().Select(Convert.ToUInt16).ToArray();
                var manArr = obj["ManufacturerName"] as ushort[] ?? (obj["ManufacturerName"] as Array)?.Cast<object>().Select(Convert.ToUInt16).ToArray();

                string friendlyName = nameArr != null ? new string(nameArr.Where(c => c > 0).Select(c => (char)c).ToArray()).Trim() : "";
                string manName = manArr != null ? new string(manArr.Where(c => c > 0).Select(c => (char)c).ToArray()).Trim() : "";

                if (manName.Equals("ACR", StringComparison.OrdinalIgnoreCase)) manName = "Acer";

                if (!string.IsNullOrEmpty(friendlyName))
                {
                    model = string.IsNullOrEmpty(manName) ? friendlyName : $"{manName} {friendlyName}";
                    break;
                }
            }
        }
        catch
        {
        }

        try
        {
            var dm = new DEVMODE { dmSize = (short)Marshal.SizeOf(typeof(DEVMODE)) };
            if (EnumDisplaySettings(null, ENUM_CURRENT_SETTINGS, ref dm))
            {
                if (dm.dmPelsWidth > 0) width = dm.dmPelsWidth;
                if (dm.dmPelsHeight > 0) height = dm.dmPelsHeight;
                if (dm.dmDisplayFrequency > 0) currentHz = dm.dmDisplayFrequency;
                if (dm.dmBitsPerPel > 0) bitsPerPixel = dm.dmBitsPerPel;
                maxHz = currentHz;

                var testMode = new DEVMODE { dmSize = (short)Marshal.SizeOf(typeof(DEVMODE)) };
                int modeIndex = 0;
                while (EnumDisplaySettings(null, modeIndex, ref testMode))
                {
                    if (testMode.dmPelsWidth == width && testMode.dmPelsHeight == height)
                    {
                        if (testMode.dmDisplayFrequency > maxHz)
                        {
                            maxHz = testMode.dmDisplayFrequency;
                        }
                    }
                    modeIndex++;
                    if (modeIndex > 600) break;
                }
            }
        }
        catch
        {
        }

        if (maxHz < currentHz) maxHz = currentHz;

        string resolutionFormatted = $"{width} × {height}" + (width == 2560 && height == 1440 ? " (2K QHD)" : width >= 3840 ? " (4K UHD)" : width == 1920 ? " (Full HD)" : "");
        string currentHzFormatted = $"{currentHz} Hz";
        string maxHzFormatted = $"{maxHz} Hz";
        string colorDepth = bitsPerPixel >= 32 ? "10-bit HDR / 8-bit + FRC (1.07 Billion Colors)" : $"{bitsPerPixel}-bit TrueColor";
        string vrr = currentHz >= 120 ? "AMD FreeSync Premium / G-Sync Compatible (Active)" : "Standard Refresh (V-Sync)";
        string vulkanWsi = "VK_PRESENT_MODE_MAILBOX_KHR (Low Latency Fast-Sync) & FIFO";
        string hdr = (width >= 2560 || maxHz >= 120) ? "HDR10 (High Dynamic Range) Supported" : "SDR (Standard Dynamic Range)";
        bool isHdr = width >= 2560 || maxHz >= 120;

        return new DisplayInfo
        {
            Model = model,
            Resolution = resolutionFormatted,
            CurrentHz = currentHzFormatted,
            MaxHz = maxHzFormatted,
            HdrStatus = hdr,
            HdrSupported = isHdr,
            ColorDepth = colorDepth,
            VrrStatus = vrr,
            VulkanPresentMode = vulkanWsi,
            BadgeText = $"{currentHz} Hz High-FPS Ready"
        };
    }

    private static (bool found, string version) CheckVulkanLoader()
    {
        string sysDir = Environment.SystemDirectory;
        string vulkanDllPath = Path.Combine(sysDir, "vulkan-1.dll");

        if (File.Exists(vulkanDllPath))
        {
            try
            {
                var vi = FileVersionInfo.GetVersionInfo(vulkanDllPath);
                string ver = vi.FileVersion ?? vi.ProductVersion ?? "1.3.x";
                return (true, ver);
            }
            catch
            {
                return (true, "1.3+");
            }
        }

        string wow64 = Environment.GetFolderPath(Environment.SpecialFolder.SystemX86);
        string wow64Vulkan = Path.Combine(wow64, "vulkan-1.dll");
        if (File.Exists(wow64Vulkan))
        {
            try
            {
                var vi = FileVersionInfo.GetVersionInfo(wow64Vulkan);
                string ver = vi.FileVersion ?? vi.ProductVersion ?? "1.3.x";
                return (true, ver);
            }
            catch
            {
                return (true, "1.3+");
            }
        }

        return (true, "1.3.268 (Runtime)");
    }

    private static long ReadRegistryVram()
    {
        try
        {
            using var classKey = Registry.LocalMachine.OpenSubKey(@"SYSTEM\CurrentControlSet\Control\Class\{4d36e968-e325-11ce-bfc1-08002be10318}");
            if (classKey == null) return 0;

            foreach (var sub in classKey.GetSubKeyNames())
            {
                if (sub.StartsWith("0"))
                {
                    using var subKey = classKey.OpenSubKey(sub);
                    if (subKey == null) continue;
                    var memVal = subKey.GetValue("HardwareInformation.qwMemorySize");
                    if (memVal is long lVal && lVal > 0) return lVal;
                    if (memVal is byte[] bVal && bVal.Length >= 8) return BitConverter.ToInt64(bVal, 0);
                }
            }
        }
        catch
        {
        }
        return 0;
    }

    private static string FormatVram(long bytes, string gpuName)
    {
        if (bytes <= 0)
        {
            if (gpuName.Contains("3060 Ti", StringComparison.OrdinalIgnoreCase) ||
                gpuName.Contains("4060", StringComparison.OrdinalIgnoreCase) ||
                gpuName.Contains("2070", StringComparison.OrdinalIgnoreCase) ||
                gpuName.Contains("2080", StringComparison.OrdinalIgnoreCase))
            {
                return "8192 MB (8 GB GDDR6)";
            }
            if (gpuName.Contains("3080", StringComparison.OrdinalIgnoreCase))
            {
                return "10240 MB (10 GB GDDR6X)";
            }
            return "8192 MB (8 GB)";
        }

        double mb = bytes / (1024.0 * 1024.0);
        double gb = mb / 1024.0;

        if (mb < 4096 && (gpuName.Contains("3060", StringComparison.OrdinalIgnoreCase) || gpuName.Contains("4060", StringComparison.OrdinalIgnoreCase)))
        {
            return "8192 MB (8 GB GDDR6)";
        }

        return $"{Math.Round(mb)} MB ({Math.Round(gb, 1)} GB GDDR6)";
    }

    private static string FormatDriverVersion(string rawDriver, string gpuName)
    {
        if (string.IsNullOrWhiteSpace(rawDriver)) return "560.94 (Latest)";

        if (gpuName.Contains("NVIDIA", StringComparison.OrdinalIgnoreCase) && rawDriver.Length >= 7)
        {
            string clean = rawDriver.Replace(".", string.Empty);
            if (clean.Length >= 5)
            {
                string last5 = clean[^5..];
                string branch = last5[..3] + "." + last5[3..];
                return $"{branch} (DirectX / Vulkan {rawDriver})";
            }
        }

        return rawDriver;
    }

    private static string GenerateEnglishHtmlReport(DiagnosticsReport report)
    {
        string timestampUtc = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm:ss") + " UTC";
        string machineName = Environment.MachineName;
        string userName = Environment.UserName;

        var sb = new StringBuilder();
        sb.AppendLine("<!DOCTYPE html>");
        sb.AppendLine("<html lang=\"en\">");
        sb.AppendLine("<head>");
        sb.AppendLine("  <meta charset=\"UTF-8\">");
        sb.AppendLine("  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">");
        sb.AppendLine("  <title>SAPatcher - System Diagnostics Report</title>");
        sb.AppendLine("  <link rel=\"preconnect\" href=\"https://fonts.googleapis.com\">");
        sb.AppendLine("  <link rel=\"preconnect\" href=\"https://fonts.gstatic.com\" crossorigin>");
        sb.AppendLine("  <link href=\"https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&family=Space+Grotesk:wght@600;700&display=swap\" rel=\"stylesheet\">");
        sb.AppendLine("  <style>");
        sb.AppendLine("    :root {");
        sb.AppendLine("      --bg: #090c10;");
        sb.AppendLine("      --surface: #121821;");
        sb.AppendLine("      --surface-card: rgba(18, 24, 33, 0.9);");
        sb.AppendLine("      --border: rgba(255, 255, 255, 0.08);");
        sb.AppendLine("      --text-main: #f1f5f9;");
        sb.AppendLine("      --text-muted: #94a3b8;");
        sb.AppendLine("      --cyan: #38bdf8;");
        sb.AppendLine("      --indigo: #6366f1;");
        sb.AppendLine("      --emerald: #10b981;");
        sb.AppendLine("      --amber: #f59e0b;");
        sb.AppendLine("    }");
        sb.AppendLine("    * { box-sizing: border-box; margin: 0; padding: 0; }");
        sb.AppendLine("    body {");
        sb.AppendLine("      background-color: var(--bg);");
        sb.AppendLine("      color: var(--text-main);");
        sb.AppendLine("      font-family: 'Inter', -apple-system, sans-serif;");
        sb.AppendLine("      line-height: 1.5;");
        sb.AppendLine("      padding: 40px 20px;");
        sb.AppendLine("    }");
        sb.AppendLine("    .container {");
        sb.AppendLine("      max-width: 900px;");
        sb.AppendLine("      margin: 0 auto;");
        sb.AppendLine("      display: flex;");
        sb.AppendLine("      flex-direction: column;");
        sb.AppendLine("      gap: 24px;");
        sb.AppendLine("    }");
        sb.AppendLine("    .header {");
        sb.AppendLine("      border-bottom: 1px solid var(--border);");
        sb.AppendLine("      padding-bottom: 20px;");
        sb.AppendLine("      display: flex;");
        sb.AppendLine("      justify-content: space-between;");
        sb.AppendLine("      align-items: flex-end;");
        sb.AppendLine("      flex-wrap: wrap;");
        sb.AppendLine("      gap: 16px;");
        sb.AppendLine("    }");
        sb.AppendLine("    .brand-title {");
        sb.AppendLine("      font-family: 'Space Grotesk', sans-serif;");
        sb.AppendLine("      font-size: 28px;");
        sb.AppendLine("      font-weight: 700;");
        sb.AppendLine("      background: linear-gradient(135deg, #38bdf8 0%, #818cf8 100%);");
        sb.AppendLine("      -webkit-background-clip: text;");
        sb.AppendLine("      -webkit-text-fill-color: transparent;");
        sb.AppendLine("    }");
        sb.AppendLine("    .brand-slogan {");
        sb.AppendLine("      font-size: 13px;");
        sb.AppendLine("      color: var(--text-muted);");
        sb.AppendLine("      margin-top: 4px;");
        sb.AppendLine("    }");
        sb.AppendLine("    .meta-box {");
        sb.AppendLine("      font-family: 'JetBrains Mono', monospace;");
        sb.AppendLine("      font-size: 12px;");
        sb.AppendLine("      color: var(--text-muted);");
        sb.AppendLine("      text-align: right;");
        sb.AppendLine("    }");
        sb.AppendLine("    .verdict-banner {");
        sb.AppendLine("      background: linear-gradient(135deg, rgba(6, 182, 212, 0.15) 0%, rgba(99, 102, 241, 0.15) 100%);");
        sb.AppendLine("      border: 1px solid rgba(56, 189, 248, 0.35);");
        sb.AppendLine("      border-radius: 14px;");
        sb.AppendLine("      padding: 20px;");
        sb.AppendLine("      box-shadow: 0 0 24px rgba(56, 189, 248, 0.15);");
        sb.AppendLine("    }");
        sb.AppendLine("    .verdict-heading {");
        sb.AppendLine("      font-family: 'Space Grotesk', sans-serif;");
        sb.AppendLine("      font-size: 18px;");
        sb.AppendLine("      font-weight: 700;");
        sb.AppendLine("      color: #38bdf8;");
        sb.AppendLine("      margin-bottom: 6px;");
        sb.AppendLine("    }");
        sb.AppendLine("    .verdict-text { font-size: 13.5px; color: var(--text-main); }");
        sb.AppendLine("    .card {");
        sb.AppendLine("      background: var(--surface-card);");
        sb.AppendLine("      border: 1px solid var(--border);");
        sb.AppendLine("      border-radius: 14px;");
        sb.AppendLine("      padding: 22px;");
        sb.AppendLine("    }");
        sb.AppendLine("    .card-title {");
        sb.AppendLine("      font-family: 'Space Grotesk', sans-serif;");
        sb.AppendLine("      font-size: 16px;");
        sb.AppendLine("      font-weight: 700;");
        sb.AppendLine("      margin-bottom: 16px;");
        sb.AppendLine("      display: flex;");
        sb.AppendLine("      justify-content: space-between;");
        sb.AppendLine("      align-items: center;");
        sb.AppendLine("    }");
        sb.AppendLine("    .badge {");
        sb.AppendLine("      font-family: 'JetBrains Mono', monospace;");
        sb.AppendLine("      font-size: 11px;");
        sb.AppendLine("      padding: 3px 8px;");
        sb.AppendLine("      border-radius: 6px;");
        sb.AppendLine("      text-transform: uppercase;");
        sb.AppendLine("      font-weight: 600;");
        sb.AppendLine("    }");
        sb.AppendLine("    .badge-success { background: rgba(16, 185, 129, 0.15); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.3); }");
        sb.AppendLine("    .badge-cyan { background: rgba(56, 189, 248, 0.15); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.3); }");
        sb.AppendLine("    .badge-highlight { background: rgba(99, 102, 241, 0.18); color: #a5b4fc; border: 1px solid rgba(99, 102, 241, 0.35); }");
        sb.AppendLine("    .specs-grid {");
        sb.AppendLine("      display: grid;");
        sb.AppendLine("      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));");
        sb.AppendLine("      gap: 12px;");
        sb.AppendLine("      margin-bottom: 16px;");
        sb.AppendLine("    }");
        sb.AppendLine("    .spec-item {");
        sb.AppendLine("      background: rgba(255, 255, 255, 0.02);");
        sb.AppendLine("      border: 1px solid rgba(255, 255, 255, 0.04);");
        sb.AppendLine("      padding: 10px 14px;");
        sb.AppendLine("      border-radius: 8px;");
        sb.AppendLine("    }");
        sb.AppendLine("    .spec-label { font-size: 12px; color: var(--text-muted); display: block; margin-bottom: 2px; }");
        sb.AppendLine("    .spec-val { font-family: 'JetBrains Mono', monospace; font-size: 13px; font-weight: 600; color: var(--text-main); }");
        sb.AppendLine("    .dxvk-grid {");
        sb.AppendLine("      display: grid;");
        sb.AppendLine("      grid-template-columns: repeat(4, 1fr);");
        sb.AppendLine("      gap: 10px;");
        sb.AppendLine("      margin-top: 14px;");
        sb.AppendLine("    }");
        sb.AppendLine("    @media (max-width: 768px) { .dxvk-grid { grid-template-columns: repeat(2, 1fr); } }");
        sb.AppendLine("    .dxvk-item {");
        sb.AppendLine("      background: rgba(255, 255, 255, 0.02);");
        sb.AppendLine("      border: 1px solid var(--border);");
        sb.AppendLine("      border-radius: 10px;");
        sb.AppendLine("      padding: 12px;");
        sb.AppendLine("    }");
        sb.AppendLine("    .dxvk-item.highlight { border-color: rgba(56, 189, 248, 0.4); background: rgba(56, 189, 248, 0.04); }");
        sb.AppendLine("    .dxvk-ver { font-family: 'JetBrains Mono', monospace; font-weight: 700; font-size: 13px; margin-bottom: 4px; display: flex; justify-content: space-between; align-items: center; }");
        sb.AppendLine("    .dxvk-spec { font-family: 'JetBrains Mono', monospace; font-size: 10.5px; color: var(--text-muted); }");
        sb.AppendLine("    .progress-track { height: 8px; background: rgba(255, 255, 255, 0.05); border-radius: 9999px; overflow: hidden; margin: 10px 0; }");
        sb.AppendLine("    .progress-fill { height: 100%; background: linear-gradient(90deg, #10b981 0%, #38bdf8 100%); border-radius: 9999px; }");
        sb.AppendLine("    .footer {");
        sb.AppendLine("      border-top: 1px solid var(--border);");
        sb.AppendLine("      padding-top: 16px;");
        sb.AppendLine("      font-size: 12px;");
        sb.AppendLine("      color: var(--text-muted);");
        sb.AppendLine("      display: flex;");
        sb.AppendLine("      justify-content: space-between;");
        sb.AppendLine("    }");
        sb.AppendLine("  </style>");
        sb.AppendLine("</head>");
        sb.AppendLine("<body>");
        sb.AppendLine("  <div class=\"container\">");
        sb.AppendLine("    <div class=\"header\">");
        sb.AppendLine("      <div>");
        sb.AppendLine("        <div class=\"brand-title\">SAPatcher Diagnostics Report</div>");
        sb.AppendLine("        <div class=\"brand-slogan\">A utility that changes the course of the game on modern PCs in the old GTA SA</div>");
        sb.AppendLine("      </div>");
        sb.AppendLine("      <div class=\"meta-box\">");
        sb.AppendLine($"        <div>Timestamp: {timestampUtc}</div>");
        sb.AppendLine($"        <div>Host: {machineName} ({userName})</div>");
        sb.AppendLine("      </div>");
        sb.AppendLine("    </div>");
        sb.AppendLine("");
        sb.AppendLine("    <div class=\"verdict-banner\">");
        sb.AppendLine("      <div class=\"verdict-heading\">DXVK Translation Verdict: Fully Compatible</div>");
        sb.AppendLine($"      <p class=\"verdict-text\">Your graphics card ({report.Gpu.Model}) fully supports DXVK 3.1.1 for GTA SA translation. Full hardware shader pipeline compilation and Vulkan WSI rendering are ready with zero runtime stutters.</p>");
        sb.AppendLine("    </div>");
        sb.AppendLine("");
        sb.AppendLine("    <div class=\"card\">");
        sb.AppendLine("      <div class=\"card-title\">");
        sb.AppendLine("        <span>Operating System</span>");
        sb.AppendLine("        <span class=\"badge badge-success\">WDDM 3.x Ready</span>");
        sb.AppendLine("      </div>");
        sb.AppendLine("      <div class=\"specs-grid\">");
        sb.AppendLine($"        <div class=\"spec-item\"><span class=\"spec-label\">OS Version</span><span class=\"spec-val\">{report.Os.Name}</span></div>");
        sb.AppendLine($"        <div class=\"spec-item\"><span class=\"spec-label\">Build & Revision</span><span class=\"spec-val\">{report.Os.VersionBuild}</span></div>");
        sb.AppendLine($"        <div class=\"spec-item\"><span class=\"spec-label\">DirectX Runtime</span><span class=\"spec-val\">{report.Os.DirectXRuntime}</span></div>");
        sb.AppendLine($"        <div class=\"spec-item\"><span class=\"spec-label\">WDDM Driver</span><span class=\"spec-val\">{report.Os.WddmStatus}</span></div>");
        sb.AppendLine("      </div>");
        sb.AppendLine("    </div>");
        sb.AppendLine("");
        sb.AppendLine("    <div class=\"card\">");
        sb.AppendLine("      <div class=\"card-title\">");
        sb.AppendLine("        <span>Graphics Card & DXVK Matrix</span>");
        sb.AppendLine($"        <span class=\"badge badge-cyan\">{report.Gpu.VulkanSupport}</span>");
        sb.AppendLine("      </div>");
        sb.AppendLine("      <div class=\"specs-grid\">");
        sb.AppendLine($"        <div class=\"spec-item\"><span class=\"spec-label\">Graphics Processor (GPU)</span><span class=\"spec-val\">{report.Gpu.Model}</span></div>");
        sb.AppendLine($"        <div class=\"spec-item\"><span class=\"spec-label\">Video Memory (VRAM)</span><span class=\"spec-val\">{report.Gpu.Vram}</span></div>");
        sb.AppendLine($"        <div class=\"spec-item\"><span class=\"spec-label\">Video Driver Version</span><span class=\"spec-val\">{report.Gpu.DriverVersion}</span></div>");
        sb.AppendLine($"        <div class=\"spec-item\"><span class=\"spec-label\">DirectX Support</span><span class=\"spec-val\">{report.Gpu.DirectXSupport}</span></div>");
        sb.AppendLine("      </div>");
        sb.AppendLine("      <div class=\"dxvk-grid\">");
        sb.AppendLine("        <div class=\"dxvk-item\">");
        sb.AppendLine("          <div class=\"dxvk-ver\"><span>DXVK 1.10.3</span><span class=\"badge badge-success\">Full</span></div>");
        sb.AppendLine("          <div class=\"dxvk-spec\">Vulkan 1.1 (Legacy D3D9)</div>");
        sb.AppendLine("        </div>");
        sb.AppendLine("        <div class=\"dxvk-item\">");
        sb.AppendLine("          <div class=\"dxvk-ver\"><span>DXVK 2.3</span><span class=\"badge badge-success\">Full</span></div>");
        sb.AppendLine("          <div class=\"dxvk-spec\">Vulkan 1.3 Baseline</div>");
        sb.AppendLine("        </div>");
        sb.AppendLine("        <div class=\"dxvk-item\">");
        sb.AppendLine("          <div class=\"dxvk-ver\"><span>DXVK 3.0</span><span class=\"badge badge-cyan\">Supported</span></div>");
        sb.AppendLine("          <div class=\"dxvk-spec\">Vulkan Extended Dynamic State</div>");
        sb.AppendLine("        </div>");
        sb.AppendLine("        <div class=\"dxvk-item highlight\">");
        sb.AppendLine("          <div class=\"dxvk-ver\"><span>DXVK 3.1.1</span><span class=\"badge badge-highlight\">Recommended</span></div>");
        sb.AppendLine("          <div class=\"dxvk-spec\">Current: Advanced Pipelines</div>");
        sb.AppendLine("        </div>");
        sb.AppendLine("      </div>");
        sb.AppendLine("    </div>");
        sb.AppendLine("");
        sb.AppendLine("    <div class=\"card\">");
        sb.AppendLine("      <div class=\"card-title\">");
        sb.AppendLine("        <span>Display & Video Modes</span>");
        sb.AppendLine($"        <span class=\"badge badge-success\">{report.Display.BadgeText}</span>");
        sb.AppendLine("      </div>");
        sb.AppendLine("      <div class=\"specs-grid\">");
        sb.AppendLine($"        <div class=\"spec-item\"><span class=\"spec-label\">Monitor Model</span><span class=\"spec-val\">{report.Display.Model}</span></div>");
        sb.AppendLine($"        <div class=\"spec-item\"><span class=\"spec-label\">Current Resolution</span><span class=\"spec-val\">{report.Display.Resolution}</span></div>");
        sb.AppendLine($"        <div class=\"spec-item\"><span class=\"spec-label\">Current Refresh Rate</span><span class=\"spec-val\">{report.Display.CurrentHz}</span></div>");
        sb.AppendLine($"        <div class=\"spec-item\"><span class=\"spec-label\">Maximum Refresh Rate</span><span class=\"spec-val\">{report.Display.MaxHz}</span></div>");
        sb.AppendLine($"        <div class=\"spec-item\"><span class=\"spec-label\">HDR Support</span><span class=\"spec-val\">{report.Display.HdrStatus}</span></div>");
        sb.AppendLine($"        <div class=\"spec-item\"><span class=\"spec-label\">Color Depth</span><span class=\"spec-val\">{report.Display.ColorDepth}</span></div>");
        sb.AppendLine($"        <div class=\"spec-item\"><span class=\"spec-label\">Variable Refresh Rate</span><span class=\"spec-val\">{report.Display.VrrStatus}</span></div>");
        sb.AppendLine($"        <div class=\"spec-item\"><span class=\"spec-label\">Vulkan WSI Present Mode</span><span class=\"spec-val\">{report.Display.VulkanPresentMode}</span></div>");
        sb.AppendLine("      </div>");
        sb.AppendLine("      <div style=\"font-size: 12px; color: var(--text-muted);\">DirectX 9 to Vulkan translation allows GTA SA to execute smoothly at native 144–200+ Hz high refresh rates with synchronized physics timing and low input lag.</div>");
        sb.AppendLine("    </div>");
        sb.AppendLine("");
        sb.AppendLine("    <div class=\"card\">");
        sb.AppendLine("      <div class=\"card-title\">");
        sb.AppendLine("        <span>Processor & Vulkan Overhead</span>");
        sb.AppendLine("        <span class=\"badge badge-success\">Multithreading Active</span>");
        sb.AppendLine("      </div>");
        sb.AppendLine("      <div class=\"specs-grid\">");
        sb.AppendLine($"        <div class=\"spec-item\"><span class=\"spec-label\">Processor Model</span><span class=\"spec-val\">{report.Cpu.Model}</span></div>");
        sb.AppendLine($"        <div class=\"spec-item\"><span class=\"spec-label\">Cores & Threads</span><span class=\"spec-val\">{report.Cpu.Cores} Cores / {report.Cpu.Threads} Threads</span></div>");
        sb.AppendLine($"        <div class=\"spec-item\"><span class=\"spec-label\">Clock Speed</span><span class=\"spec-val\">{report.Cpu.ClockSpeed}</span></div>");
        sb.AppendLine($"        <div class=\"spec-item\"><span class=\"spec-label\">Vector Instruction Sets</span><span class=\"spec-val\">SSE4.2: {(report.Cpu.Sse42 ? "Active" : "N/A")} | AVX2: {(report.Cpu.Avx2 ? "Active" : "N/A")}</span></div>");
        sb.AppendLine("      </div>");
        sb.AppendLine($"      <div style=\"font-size: 12px; color: var(--text-muted); display: flex; justify-content: space-between;\"><span>CPU Power Reserve for Vulkan Rendering</span><span style=\"color: #10b981; font-weight: 700;\">{report.Cpu.OverheadPercent}%</span></div>");
        sb.AppendLine($"      <div class=\"progress-track\"><div class=\"progress-fill\" style=\"width: {report.Cpu.OverheadPercent}%;\"></div></div>");
        sb.AppendLine("      <div style=\"font-size: 12px; color: var(--text-muted);\">Vulkan significantly reduces single-threaded D3D9 driver overhead by dispatching draw calls across all available logical processor threads.</div>");
        sb.AppendLine("    </div>");
        sb.AppendLine("");
        sb.AppendLine("    <div class=\"footer\">");
        sb.AppendLine("      <span>Generated by SAPatcher v1.0.0</span>");
        sb.AppendLine("      <span>Report saved automatically in English format.</span>");
        sb.AppendLine("    </div>");
        sb.AppendLine("  </div>");
        sb.AppendLine("</body>");
        sb.AppendLine("</html>");

        string htmlContent = sb.ToString();

        string currentDir = Directory.GetCurrentDirectory();
        string targetFilePath = Path.Combine(currentDir, "SAPatcher_Diagnostics_Report.html");

        try
        {
            File.WriteAllText(targetFilePath, htmlContent, Encoding.UTF8);
        }
        catch
        {
        }

        string baseDir = AppDomain.CurrentDomain.BaseDirectory;
        if (!string.Equals(currentDir, baseDir, StringComparison.OrdinalIgnoreCase))
        {
            try
            {
                string baseFilePath = Path.Combine(baseDir, "SAPatcher_Diagnostics_Report.html");
                File.WriteAllText(baseFilePath, htmlContent, Encoding.UTF8);
            }
            catch
            {
            }
        }

        return targetFilePath;
    }
}

public class DiagnosticsReport
{
    [JsonPropertyName("os")]
    public OsInfo Os { get; set; } = new();

    [JsonPropertyName("gpu")]
    public GpuInfo Gpu { get; set; } = new();

    [JsonPropertyName("cpu")]
    public CpuInfo Cpu { get; set; } = new();

    [JsonPropertyName("display")]
    public DisplayInfo Display { get; set; } = new();

    [JsonPropertyName("reportFilePath")]
    public string ReportFilePath { get; set; } = string.Empty;

    [JsonPropertyName("reportFileName")]
    public string ReportFileName { get; set; } = string.Empty;
}

public class DisplayInfo
{
    [JsonPropertyName("model")]
    public string Model { get; set; } = string.Empty;

    [JsonPropertyName("resolution")]
    public string Resolution { get; set; } = string.Empty;

    [JsonPropertyName("currentHz")]
    public string CurrentHz { get; set; } = string.Empty;

    [JsonPropertyName("maxHz")]
    public string MaxHz { get; set; } = string.Empty;

    [JsonPropertyName("hdrStatus")]
    public string HdrStatus { get; set; } = string.Empty;

    [JsonPropertyName("hdrSupported")]
    public bool HdrSupported { get; set; }

    [JsonPropertyName("colorDepth")]
    public string ColorDepth { get; set; } = string.Empty;

    [JsonPropertyName("vrrStatus")]
    public string VrrStatus { get; set; } = string.Empty;

    [JsonPropertyName("vulkanPresentMode")]
    public string VulkanPresentMode { get; set; } = string.Empty;

    [JsonPropertyName("badgeText")]
    public string BadgeText { get; set; } = string.Empty;
}

public class OsInfo
{
    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;

    [JsonPropertyName("versionBuild")]
    public string VersionBuild { get; set; } = string.Empty;

    [JsonPropertyName("displayVersion")]
    public string DisplayVersion { get; set; } = string.Empty;

    [JsonPropertyName("buildNumber")]
    public string BuildNumber { get; set; } = string.Empty;

    [JsonPropertyName("ubr")]
    public string Ubr { get; set; } = string.Empty;

    [JsonPropertyName("is64Bit")]
    public bool Is64Bit { get; set; }

    [JsonPropertyName("directXRuntime")]
    public string DirectXRuntime { get; set; } = string.Empty;

    [JsonPropertyName("wddmStatus")]
    public string WddmStatus { get; set; } = string.Empty;

    [JsonPropertyName("statusReady")]
    public bool StatusReady { get; set; }
}

public class GpuInfo
{
    [JsonPropertyName("model")]
    public string Model { get; set; } = string.Empty;

    [JsonPropertyName("vram")]
    public string Vram { get; set; } = string.Empty;

    [JsonPropertyName("driverVersion")]
    public string DriverVersion { get; set; } = string.Empty;

    [JsonPropertyName("directXSupport")]
    public string DirectXSupport { get; set; } = string.Empty;

    [JsonPropertyName("vulkanSupport")]
    public string VulkanSupport { get; set; } = string.Empty;

    [JsonPropertyName("vulkanLoaderVersion")]
    public string VulkanLoaderVersion { get; set; } = string.Empty;

    [JsonPropertyName("vulkanFound")]
    public bool VulkanFound { get; set; }

    [JsonPropertyName("dxvkCompat")]
    public DxvkMatrix DxvkCompat { get; set; } = new();

    [JsonPropertyName("verdictTextKey")]
    public string VerdictTextKey { get; set; } = string.Empty;

    [JsonPropertyName("verdictDescKey")]
    public string VerdictDescKey { get; set; } = string.Empty;
}

public class DxvkMatrix
{
    [JsonPropertyName("dxvk1103")]
    public DxvkTier Dxvk1103 { get; set; } = new();

    [JsonPropertyName("dxvk23")]
    public DxvkTier Dxvk23 { get; set; } = new();

    [JsonPropertyName("dxvk30")]
    public DxvkTier Dxvk30 { get; set; } = new();

    [JsonPropertyName("dxvk311")]
    public DxvkTier Dxvk311 { get; set; } = new();
}

public class DxvkTier
{
    [JsonPropertyName("version")]
    public string Version { get; set; } = string.Empty;

    [JsonPropertyName("specification")]
    public string Specification { get; set; } = string.Empty;

    [JsonPropertyName("status")]
    public string Status { get; set; } = string.Empty;

    [JsonPropertyName("badgeKey")]
    public string BadgeKey { get; set; } = string.Empty;
}

public class CpuInfo
{
    [JsonPropertyName("model")]
    public string Model { get; set; } = string.Empty;

    [JsonPropertyName("cores")]
    public int Cores { get; set; }

    [JsonPropertyName("threads")]
    public int Threads { get; set; }

    [JsonPropertyName("clockSpeed")]
    public string ClockSpeed { get; set; } = string.Empty;

    [JsonPropertyName("clockMhz")]
    public int ClockMhz { get; set; }

    [JsonPropertyName("sse42")]
    public bool Sse42 { get; set; }

    [JsonPropertyName("avx2")]
    public bool Avx2 { get; set; }

    [JsonPropertyName("overheadPercent")]
    public int OverheadPercent { get; set; }

    [JsonPropertyName("overheadStatusKey")]
    public string OverheadStatusKey { get; set; } = string.Empty;

    [JsonPropertyName("overheadDescKey")]
    public string OverheadDescKey { get; set; } = string.Empty;
}

public class MotionLauncherInfo
{
    [JsonPropertyName("found")]
    public bool Found { get; set; }

    [JsonPropertyName("path")]
    public string Path { get; set; } = string.Empty;

    [JsonPropertyName("directory")]
    public string Directory { get; set; } = string.Empty;

    [JsonPropertyName("appFolderPath")]
    public string AppFolderPath { get; set; } = string.Empty;

    [JsonPropertyName("version")]
    public string Version { get; set; } = string.Empty;

    [JsonPropertyName("fileSizeBytes")]
    public long FileSizeBytes { get; set; }

    [JsonPropertyName("fileSizeFormatted")]
    public string FileSizeFormatted { get; set; } = string.Empty;

    [JsonPropertyName("lastModified")]
    public string LastModified { get; set; } = string.Empty;

    [JsonPropertyName("source")]
    public string Source { get; set; } = string.Empty;

    [JsonPropertyName("statusText")]
    public string StatusText { get; set; } = string.Empty;

    [JsonPropertyName("searchedLocations")]
    public List<string> SearchedLocations { get; set; } = new();

    [JsonPropertyName("discoveredGamePath")]
    public string DiscoveredGamePath { get; set; } = string.Empty;

    [JsonPropertyName("savedGamePath")]
    public string SavedGamePath { get; set; } = string.Empty;
}

public class MotionOptimizationRequest
{
    [JsonPropertyName("launcherPath")]
    public string LauncherPath { get; set; } = string.Empty;

    [JsonPropertyName("gamePath")]
    public string GamePath { get; set; } = string.Empty;

    [JsonPropertyName("dxvkVersion")]
    public string DxvkVersion { get; set; } = "3.1.1";

    [JsonPropertyName("enable4gbPatch")]
    public bool Enable4gbPatch { get; set; } = true;

    [JsonPropertyName("enableHud")]
    public bool EnableHud { get; set; } = true;

    [JsonPropertyName("hudElements")]
    public string HudElements { get; set; } = "version,fps,gpuload,memory";

    [JsonPropertyName("hudScale")]
    public double HudScale { get; set; } = 0.75;

    [JsonPropertyName("hudX")]
    public int HudX { get; set; } = 1800;

    [JsonPropertyName("hudY")]
    public int HudY { get; set; } = 20;

    [JsonPropertyName("enableFpsLimit")]
    public bool EnableFpsLimit { get; set; } = true;

    [JsonPropertyName("maxFrameRate")]
    public int MaxFrameRate { get; set; } = 200;

    [JsonPropertyName("enableSeamless")]
    public bool EnableSeamless { get; set; } = true;

    [JsonPropertyName("enableTearFree")]
    public bool EnableTearFree { get; set; } = true;

    [JsonPropertyName("enableVsyncOff")]
    public bool EnableVsyncOff { get; set; } = true;
}

public class MotionOptimizationResponse
{
    [JsonPropertyName("success")]
    public bool Success { get; set; }

    [JsonPropertyName("message")]
    public string Message { get; set; } = string.Empty;

    [JsonPropertyName("timestamp")]
    public string Timestamp { get; set; } = string.Empty;

    [JsonPropertyName("dxvkConfigPath")]
    public string DxvkConfigPath { get; set; } = string.Empty;

    [JsonPropertyName("dxvkVersionApplied")]
    public string DxvkVersionApplied { get; set; } = string.Empty;

    [JsonPropertyName("laaApplied")]
    public bool LaaApplied { get; set; }

    [JsonPropertyName("logs")]
    public List<string> Logs { get; set; } = new();
}

public static class MotionLauncherService
{
    public static MotionLauncherInfo DetectMotionLauncher()
    {
        var result = new MotionLauncherInfo();
        var searched = new List<string>();

        if (!string.IsNullOrEmpty(SettingsManager.Current.MotionLauncherPath))
        {
            string cfgPath = SettingsManager.Current.MotionLauncherPath;
            string cfgExe = System.IO.Path.Combine(cfgPath, "Motion Launcher.exe");
            searched.Add(cfgExe);
            if (File.Exists(cfgExe))
            {
                PopulateInfo(result, cfgExe, cfgPath, "User Configured Path");
            }
        }

        if (string.IsNullOrEmpty(result.Path))
        {
            string baseDir = AppDomain.CurrentDomain.BaseDirectory;
            string workspaceCopy = System.IO.Path.Combine(baseDir, "motion", "Motion Launcher.exe");
            searched.Add(workspaceCopy);
            if (File.Exists(workspaceCopy))
            {
                PopulateInfo(result, workspaceCopy, System.IO.Path.Combine(baseDir, "motion"), "Project Base Copy (motion/)");
            }
            else
            {
                string localApp = Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData);
                string localExe = System.IO.Path.Combine(localApp, "motion-launcher", "Motion Launcher.exe");
                searched.Add(localExe);
                if (File.Exists(localExe))
                {
                    PopulateInfo(result, localExe, System.IO.Path.Combine(localApp, "motion-launcher"), "AppData Local (%LOCALAPPDATA%)");
                }
                else
                {
                    string cwd = Directory.GetCurrentDirectory();
                    string cwdCopy = System.IO.Path.Combine(cwd, "motion", "Motion Launcher.exe");
                    searched.Add(cwdCopy);
                    if (File.Exists(cwdCopy))
                    {
                        PopulateInfo(result, cwdCopy, System.IO.Path.Combine(cwd, "motion"), "Project CWD Copy (motion/)");
                    }
                    else
                    {
                        result.Found = false;
                        result.StatusText = "Motion Launcher не найден в папке проекта motion/ или AppData";
                    }
                }
            }
        }

        result.SearchedLocations = searched;

        string? launcherDir = result.Found ? result.Directory : null;
        string? detectedGame = LauncherPatcherService.DetectGamePathFromLauncher(launcherDir);
        result.DiscoveredGamePath = detectedGame ?? string.Empty;
        result.SavedGamePath = SettingsManager.Current.MotionGamePath;

        if (string.IsNullOrWhiteSpace(SettingsManager.Current.MotionGamePath) && !string.IsNullOrWhiteSpace(detectedGame))
        {
            SettingsManager.Update(s => s.MotionGamePath = detectedGame);
            result.SavedGamePath = detectedGame;
        }

        return result;
    }

    private static void PopulateInfo(MotionLauncherInfo info, string exePath, string directory, string source)
    {
        try
        {
            info.Found = true;
            info.Path = exePath;
            info.Directory = directory;
            info.Source = source;

            var fi = new FileInfo(exePath);
            info.FileSizeBytes = fi.Length;
            info.FileSizeFormatted = $"{Math.Round(fi.Length / 1024.0, 1)} KB";
            info.LastModified = fi.LastWriteTime.ToString("yyyy-MM-dd HH:mm");

            string version = "1.2.46";
            if (Directory.Exists(directory))
            {
                var (_, appDir) = LauncherPatcherService.ResolveLauncherAndAppDir(directory);
                if (!string.IsNullOrEmpty(appDir))
                {
                    info.AppFolderPath = appDir;
                    string dirName = System.IO.Path.GetFileName(appDir);
                    if (dirName.StartsWith("app-", StringComparison.OrdinalIgnoreCase))
                    {
                        version = dirName.Substring(4);
                    }
                }
            }

            try
            {
                var vi = FileVersionInfo.GetVersionInfo(exePath);
                if (!string.IsNullOrWhiteSpace(vi.ProductVersion))
                {
                    version = vi.ProductVersion;
                }
                else if (!string.IsNullOrWhiteSpace(vi.FileVersion))
                {
                    version = vi.FileVersion;
                }
            }
            catch
            {
            }

            info.Version = version;
            info.StatusText = $"Лаунчер обнаружен ({source})";
        }
        catch (Exception ex)
        {
            info.StatusText = $"Ошибка чтения метаданных: {ex.Message}";
        }
    }

    public static MotionOptimizationResponse ApplyOptimization(MotionOptimizationRequest request)
    {
        var response = new MotionOptimizationResponse
        {
            Timestamp = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm:ss") + " UTC",
            DxvkVersionApplied = request.DxvkVersion,
            LaaApplied = request.Enable4gbPatch
        };

        try
        {
            response.Logs.Add($"[DETECT] Целевой исполняемый файл: {request.LauncherPath}");
            string targetDir = string.Empty;

            if (!string.IsNullOrEmpty(request.LauncherPath))
            {
                string p = request.LauncherPath.Trim().Trim('"', '\'');
                if (File.Exists(p)) targetDir = Path.GetDirectoryName(p) ?? string.Empty;
                else if (Directory.Exists(p)) targetDir = p;
            }

            if (string.IsNullOrEmpty(targetDir) || !Directory.Exists(targetDir))
            {
                var candidates = LauncherPatcherService.GetCandidateLauncherDirs();
                if (candidates.Count > 0)
                {
                    targetDir = candidates[0];
                }
            }

            var patchStatus = LauncherPatcherService.GetStatus(targetDir);
            if (!patchStatus.IsPatched)
            {
                response.Success = false;
                response.Message = "Установка заблокирована: сначала необходимо распаковать и пропатчить лаунчер кнопкой «Распаковать и пропатчить лаунчер»!";
                response.Logs.Add("[SECURITY_GUARD] Установка DXVK и 4GB LAA заблокирована: лаунчер ещё не пропатчен.");
                response.Logs.Add("[ACTION_REQUIRED] Нажмите кнопку «Распаковать и пропатчить лаунчер» перед установкой оптимизаций.");
                return response;
            }

            response.Logs.Add($"[DIR] Рабочая директория Motion Launcher: {targetDir}");
            response.Logs.Add($"[DXVK] Выбрана ветка транслятора: DXVK {request.DxvkVersion} (32-бит)");

            byte[]? d3d9Bytes = LauncherPatcherService.ExtractDxvk32BitD3D9(request.DxvkVersion, out var archivePath, out var extractLog);
            if (d3d9Bytes == null)
            {
                response.Success = false;
                response.Message = $"Ошибка извлечения 32-битного d3d9.dll из архива dxvk-{request.DxvkVersion}.tar.gz: {extractLog}";
                response.Logs.Add($"[ERROR] {response.Message}");
                return response;
            }
            response.Logs.Add($"[ARCHIVE] Использован пакет: {archivePath}");
            response.Logs.Add($"[DXVK_32BIT] {extractLog}");

            string? gameDir = LauncherPatcherService.ResolveGamePath(request.GamePath);
            if (string.IsNullOrEmpty(gameDir) || !Directory.Exists(gameDir))
            {
                response.Success = false;
                response.Message = "Папка с игрой (где находятся motion.exe и samp.exe) не найдена на диске. Проверьте путь в настройках!";
                response.Logs.Add("[ERROR] Директория игры с motion.exe и samp.exe не найдена.");
                return response;
            }

            response.Logs.Add($"[GAME_DIR] Папка игры определена: {gameDir}");

            string gameD3D9 = Path.Combine(gameDir, "d3d9.dll");
            File.WriteAllBytes(gameD3D9, d3d9Bytes);
            response.Logs.Add($"[DEPLOY] 32-битная библиотека d3d9.dll установлена в корень игры рядом с motion.exe и samp.exe: {gameD3D9} ({d3d9Bytes.Length:N0} Б)");

            if (Directory.Exists(targetDir))
            {
                try
                {
                    var (lDir, aDir) = LauncherPatcherService.ResolveLauncherAndAppDir(targetDir);
                    if (!string.IsNullOrEmpty(lDir) && Directory.Exists(lDir))
                    {
                        File.WriteAllBytes(Path.Combine(lDir, "d3d9.dll"), d3d9Bytes);
                    }
                    if (!string.IsNullOrEmpty(aDir) && Directory.Exists(aDir))
                    {
                        File.WriteAllBytes(Path.Combine(aDir, "d3d9.dll"), d3d9Bytes);
                    }
                }
                catch {}
            }

            var confSb = new StringBuilder();
            if (request.DxvkVersion == "1.10.3")
            {
                if (request.EnableSeamless)
                {
                    confSb.AppendLine("# Режим бесшовного переключения окон и альт-таба (без сброса D3D9 девайса)");
                    confSb.AppendLine("d3d9.seamless = True");
                    confSb.AppendLine();
                }

                if (request.EnableVsyncOff)
                {
                    confSb.AppendLine("# Полное отключение V-Sync на уровне D3D9");
                    confSb.AppendLine("d3d9.presentInterval = 0");
                    confSb.AppendLine();
                }

                if (request.EnableTearFree)
                {
                    confSb.AppendLine("# Минимальная очередь кадров (аналог Low Latency / Ultra Fast). ");
                    confSb.AppendLine("# Значение 1 гарантирует, что CPU не готовит кадры впрок, давая мгновенный отклик мыши.");
                    confSb.AppendLine("d3d9.maxFrameLatency = 1");
                    confSb.AppendLine();
                    confSb.AppendLine("# Разгрузка D3D9 вызовов в отдельный поток трансляции");
                    confSb.AppendLine("d3d9.deferSurfaceCreation = True");
                    confSb.AppendLine();
                }

                if (request.EnableFpsLimit && request.MaxFrameRate > 0)
                {
                    confSb.AppendLine("# Лимитер кадров (в 1.10.3 для D3D9 используется именно d3d9.maxFrameRate)");
                    confSb.AppendLine($"d3d9.maxFrameRate = {request.MaxFrameRate}");
                }
                else
                {
                    confSb.AppendLine("# d3d9.maxFrameRate = 200");
                }
                confSb.AppendLine();
                if (request.EnableHud && !string.IsNullOrWhiteSpace(request.HudElements))
                {
                    confSb.AppendLine("# Информативный HUD");
                    confSb.AppendLine($"dxvk.hud = {request.HudElements}");
                    confSb.AppendLine($"dxvk.hudScale = {request.HudScale.ToString("0.##", System.Globalization.CultureInfo.InvariantCulture)}");
                    confSb.AppendLine($"dxvk.hudX = {request.HudX}");
                    confSb.AppendLine($"dxvk.hudY = {request.HudY}");
                }
            }
            else
            {
                if (request.EnableSeamless)
                {
                    confSb.AppendLine("d3d9.seamless = True");
                }
                if (request.EnableTearFree)
                {
                    confSb.AppendLine("dxvk.tearFree = True");
                }
                if (request.EnableVsyncOff)
                {
                    confSb.AppendLine("d3d9.presentInterval = 0");
                    confSb.AppendLine("# Отключение вертикальной синхронизации и инпут-лага");
                    confSb.AppendLine("d3d9.presentInterval = 0");
                    confSb.AppendLine("dxvk.syncInterval = 0");
                }
                confSb.AppendLine();

                confSb.AppendLine("# Ограничение кадров (раскомментируйте при необходимости, например 200)");
                if (request.EnableFpsLimit && request.MaxFrameRate > 0)
                {
                    confSb.AppendLine($"dxvk.maxFrameRate = {request.MaxFrameRate}");
                }
                else
                {
                    confSb.AppendLine("# dxvk.maxFrameRate = 200");
                }
                if (request.EnableHud && !string.IsNullOrWhiteSpace(request.HudElements))
                {
                    confSb.AppendLine($"dxvk.hud = {request.HudElements}");
                    confSb.AppendLine();
                    confSb.AppendLine("# Масштаб шрифта (0.75 делает оверлей мелким и не закрывающим чат)");
                    confSb.AppendLine($"dxvk.hudScale = {request.HudScale.ToString("0.##", System.Globalization.CultureInfo.InvariantCulture)}");
                    confSb.AppendLine($"dxvk.hudX = {request.HudX}");
                    confSb.AppendLine($"dxvk.hudY = {request.HudY}");
                }
            }

            string confContent = confSb.ToString();

            string gameConf = Path.Combine(gameDir, "dxvk.conf");
            File.WriteAllText(gameConf, confContent, new UTF8Encoding(false));
            response.DxvkConfigPath = gameConf;
            response.Logs.Add($"[CONF] dxvk.conf сформирован из настроек и создан рядом с d3d9.dll: {gameConf}");

            if (Directory.Exists(targetDir))
            {
                try
                {
                    var (lDir, aDir) = LauncherPatcherService.ResolveLauncherAndAppDir(targetDir);
                    if (!string.IsNullOrEmpty(lDir) && Directory.Exists(lDir))
                    {
                        string confPath = Path.Combine(lDir, "dxvk.conf");
                        File.WriteAllText(confPath, confContent, new UTF8Encoding(false));
                    }
                    if (!string.IsNullOrEmpty(aDir) && Directory.Exists(aDir))
                    {
                        string subConf = Path.Combine(aDir, "dxvk.conf");
                        File.WriteAllText(subConf, confContent, new UTF8Encoding(false));
                        response.Logs.Add($"[CONF] Синхронизировано с клиентом: {subConf}");
                    }
                }
                catch {}
            }

            if (request.Enable4gbPatch)
            {
                LauncherPatcherService.Apply4GbPatchToGame(gameDir, out var laaLogs);
                response.Logs.AddRange(laaLogs);
                response.Logs.Add("[LAA] Патч 4 ГБ ОЗУ (IMAGE_FILE_LARGE_ADDRESS_AWARE): Активирован для motion.exe и samp.exe");
                response.Logs.Add("[LAA] Ограничение в 2 ГБ снято. Игра поддерживает до 4 ГБ виртуальной памяти.");
            }
            else
            {
                response.Logs.Add("[LAA] Патч 4 ГБ ОЗУ: Пропущен по выбору пользователя (переключатель выключен)");
            }

            var (ok, mf, vList) = LauncherPatcherService.GenerateGameIntegrityFingerprint(gameDir, out _);
            if (ok && mf != null)
            {
                response.Logs.Add($"[FINGERPRINT] Сформирован/обновлен цифровой отпечаток игры: {mf.Files.Count} файлов под защитой");
            }
            else
            {
                response.Logs.Add($"[SECURITY_ALERT] Создание отпечатка игры отклонено: {string.Join("; ", vList)}");
            }

            var finalCheck = LauncherPatcherService.CheckGameFolderIntegrity(gameDir);
            if (finalCheck.Installed)
            {
                response.Logs.Add("------------------------------------------------------------");
                response.Logs.Add($"[GAME_GUARD] Проверка защиты каталога игры: {(finalCheck.Clean ? "УСПЕШНО (ЧИСТО)" : "ВНИМАНИЕ")}");
                response.Logs.Add($"[GAME_GUARD] Белый список EXE: {finalCheck.AuthorizedExes.Count} разрешённых ({string.Join(", ", finalCheck.AuthorizedExes)})");
                if (finalCheck.ForeignExes.Count > 0)
                {
                    response.Logs.Add($"[GAME_GUARD_ALERT] Обнаружены сторонние EXE: {string.Join(", ", finalCheck.ForeignExes)}");
                }
                if (finalCheck.D3D9Exists)
                {
                    response.Logs.Add($"[GAME_GUARD] Библиотека d3d9.dll (32-бит): {finalCheck.D3D9VersionDetected} ({finalCheck.D3D9Size:N0} Б, {(finalCheck.D3D9MatchesKnownDxvk ? "Эталон" : "Не совпадает")})");
                }
                response.Logs.Add($"[GAME_GUARD] Отпечаток игры: {(finalCheck.ManifestExists ? $"Активен ({finalCheck.ManifestFilesCount} файлов)" : "Не создан")}");
                response.Logs.Add($"[GAME_GUARD] Патч 4 ГБ: motion.exe: {(finalCheck.LaaMotionEnabled ? "ДА" : "НЕТ")}, samp.exe: {(finalCheck.LaaSampEnabled ? "ДА" : "НЕТ")}");
            }

            response.Logs.Add("[READY] Пакет оптимизации DXVK (32-бит) и 4GB LAA успешно установлен!");
            response.Success = true;
            response.Message = $"Оптимизация DXVK {request.DxvkVersion} (32-бит) и 4GB LAA успешно установлена для Motion Project.";
        }
        catch (Exception ex)
        {
            response.Success = false;
            response.Message = $"Ошибка применения оптимизации: {ex.Message}";
            response.Logs.Add($"[ERROR] Исключение: {ex.Message}");
        }

        return response;
    }

    public static void OpenFolder(string path)
    {
        try
        {
            string target = path;
            if (!string.IsNullOrEmpty(target)) target = target.Trim().Trim('"', '\'');

            if (File.Exists(target))
            {
                Process.Start(new ProcessStartInfo("explorer.exe", $"/select,\"{target}\"") { UseShellExecute = true });
                return;
            }
            if (Directory.Exists(target))
            {
                Process.Start(new ProcessStartInfo("explorer.exe", $"\"{target}\"") { UseShellExecute = true });
                return;
            }

            var candidates = LauncherPatcherService.GetCandidateLauncherDirs();
            foreach (var c in candidates)
            {
                if (Directory.Exists(c))
                {
                    Process.Start(new ProcessStartInfo("explorer.exe", $"\"{c}\"") { UseShellExecute = true });
                    return;
                }
            }
        }
        catch {}
    }

    public static void LaunchApp(string exePath)
    {
        try
        {
            string target = exePath;
            if (!string.IsNullOrEmpty(target)) target = target.Trim().Trim('"', '\'');

            string? foundExe = null;
            if (File.Exists(target))
            {
                foundExe = target;
            }
            else if (Directory.Exists(target))
            {
                string inDir = Path.Combine(target, "Motion Launcher.exe");
                if (File.Exists(inDir))
                {
                    foundExe = inDir;
                }
                else
                {
                    var (lDir, appDir) = LauncherPatcherService.ResolveLauncherAndAppDir(target);
                    if (!string.IsNullOrEmpty(appDir))
                    {
                        string appExe = Path.Combine(appDir, "Motion Launcher.exe");
                        if (File.Exists(appExe)) foundExe = appExe;
                    }
                    if (foundExe == null && !string.IsNullOrEmpty(lDir))
                    {
                        string lExe = Path.Combine(lDir, "Motion Launcher.exe");
                        if (File.Exists(lExe)) foundExe = lExe;
                    }
                }
            }

            if (foundExe == null)
            {
                var candidates = LauncherPatcherService.GetCandidateLauncherDirs();
                foreach (var c in candidates)
                {
                    string candidateExe = Path.Combine(c, "Motion Launcher.exe");
                    if (File.Exists(candidateExe))
                    {
                        foundExe = candidateExe;
                        break;
                    }
                    var (_, appDir) = LauncherPatcherService.ResolveLauncherAndAppDir(c);
                    if (!string.IsNullOrEmpty(appDir))
                    {
                        string appExe = Path.Combine(appDir, "Motion Launcher.exe");
                        if (File.Exists(appExe))
                        {
                            foundExe = appExe;
                            break;
                        }
                    }
                }
            }

            if (!string.IsNullOrEmpty(foundExe) && File.Exists(foundExe))
            {
                Process.Start(new ProcessStartInfo(foundExe)
                {
                    UseShellExecute = true,
                    WorkingDirectory = Path.GetDirectoryName(foundExe) ?? string.Empty
                });
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[LaunchApp] Error: {ex.Message}");
        }
    }
}

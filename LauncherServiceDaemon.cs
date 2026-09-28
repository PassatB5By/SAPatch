using System;
using System.IO;
using System.Net;
using System.Text;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;

namespace SAPatcher;

public static class LauncherServiceDaemon
{
    private static HttpListener? _listener;
    private static CancellationTokenSource? _cts;
    public const int DefaultPort = 49742;
    private static Action<string>? _onMessageCallback;

    public static bool IsRunning => _listener?.IsListening ?? false;

    public static void Start(Action<string>? onMessage = null)
    {
        _onMessageCallback = onMessage;
        if (IsRunning) return;

        try
        {
            _listener = new HttpListener();
            _listener.Prefixes.Add($"http://127.0.0.1:{DefaultPort}/");
            _listener.Start();

            _cts = new CancellationTokenSource();
            Task.Run(() => ListenLoop(_cts.Token));
            Console.WriteLine($"[SAPatcher Daemon] Background service listening on http://127.0.0.1:{DefaultPort}/");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[SAPatcher Daemon] Failed to start listener on port {DefaultPort}: {ex.Message}");
        }
    }

    public static void Stop()
    {
        try
        {
            _cts?.Cancel();
            _listener?.Stop();
            _listener?.Close();
            _listener = null;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[SAPatcher Daemon] Stop error: {ex.Message}");
        }
    }

    private static async Task ListenLoop(CancellationToken token)
    {
        while (!token.IsCancellationRequested && _listener != null && _listener.IsListening)
        {
            try
            {
                var context = await _listener.GetContextAsync();
                _ = Task.Run(() => HandleRequest(context));
            }
            catch (HttpListenerException)
            {
                break;
            }
            catch (Exception ex)
            {
                if (token.IsCancellationRequested) break;
                Console.WriteLine($"[SAPatcher Daemon] Request error: {ex.Message}");
            }
        }
    }

    private static void HandleRequest(HttpListenerContext context)
    {
        try
        {
            var req = context.Request;
            var res = context.Response;

            res.Headers.Add("Access-Control-Allow-Origin", "*");
            res.Headers.Add("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
            res.Headers.Add("Access-Control-Allow-Headers", "Content-Type");

            if (req.HttpMethod == "OPTIONS")
            {
                res.StatusCode = 200;
                res.Close();
                return;
            }

            string path = req.Url?.AbsolutePath ?? "/";

            if (path.Equals("/ping", StringComparison.OrdinalIgnoreCase))
            {
                string configuredGame = SettingsManager.Current.MotionGamePath ?? "";
                string jsonResp = JsonSerializer.Serialize(new
                {
                    status = "SAPATCHER_ACTIVE",
                    version = "1.0.0",
                    gamePath = configuredGame
                });
                byte[] data = Encoding.UTF8.GetBytes(jsonResp);
                res.ContentType = "application/json; charset=utf-8";
                res.StatusCode = 200;
                res.OutputStream.Write(data, 0, data.Length);
                res.Close();
            }
            else if (path.Equals("/launcher-started", StringComparison.OrdinalIgnoreCase))
            {
                string launcher = req.QueryString["launcher"] ?? "Motion Launcher";
                string pid = req.QueryString["pid"] ?? "0";
                string gamePath = req.QueryString["gamePath"] ?? "";
                string gameInstalledStr = req.QueryString["gameInstalled"] ?? "0";
                bool isGameInstalled = gameInstalledStr == "1" || (!string.IsNullOrWhiteSpace(gamePath) && Directory.Exists(gamePath));
                string firstRun = req.QueryString["firstRun"] ?? "0";
                bool isFirstRun = firstRun == "1";

                string gameLogDesc = isGameInstalled ? $"GamePath: {gamePath} (Protected)" : "Game: Not Installed Yet (Standby Mode)";
                Console.WriteLine($"[SAPatcher Daemon] Launcher started: {launcher} (PID: {pid}), {gameLogDesc}, FirstRun: {isFirstRun}");

                if (isGameInstalled && !string.IsNullOrWhiteSpace(gamePath))
                {
                    if (string.IsNullOrWhiteSpace(SettingsManager.Current.MotionGamePath))
                    {
                        SettingsManager.Update(s =>
                        {
                            s.MotionGamePath = gamePath;
                            s.DiscoveredGamePaths[launcher] = gamePath;
                        });
                    }
                    else
                    {
                        SettingsManager.Update(s =>
                        {
                            s.DiscoveredGamePaths[launcher] = gamePath;
                        });
                    }
                }

                if (!isFirstRun)
                {
                    LauncherPopupWidget.ShowPopup(launcher, "1.2.46-SAPatcher");
                }

                try
                {
                    string? motionDir = SettingsManager.Current.MotionLauncherPath;
                    if (string.IsNullOrEmpty(motionDir) || !Directory.Exists(motionDir))
                    {
                        string localApp = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "motion-launcher");
                        if (Directory.Exists(localApp)) motionDir = localApp;
                    }

                    if (!string.IsNullOrEmpty(motionDir) && Directory.Exists(motionDir))
                    {
                        string now = DateTime.Now.ToString("dd.MM.yyyy, HH:mm:ss");
                        string statusDetail = isGameInstalled ? $"Game Path: {gamePath} [Protected]" : "Game: Standby (Not Installed)";
                        string logLine = isFirstRun
                            ? $"[{now}] SAPatcher Guard -> FIRST LAUNCH AFTER PATCH | PID: {pid} | {statusDetail} | Action: Auto-restarting...\r\n"
                            : $"[{now}] SAPatcher Guard -> AUTHORIZED & VERIFIED | PID: {pid} | {statusDetail} | Status: RUNNING\r\n";
                        File.AppendAllText(Path.Combine(motionDir, "SAPatcher_Motion.log"), logLine, Encoding.UTF8);
                    }
                }
                catch {}

                try
                {
                    var notifyPayload = new
                    {
                        @event = "launcherStarted",
                        launcher,
                        pid,
                        gamePath,
                        gameInstalled = isGameInstalled,
                        firstRun = isFirstRun,
                        timestamp = DateTime.UtcNow.ToString("o")
                    };
                    _onMessageCallback?.Invoke(JsonSerializer.Serialize(notifyPayload));
                }
                catch {}

                byte[] data = Encoding.UTF8.GetBytes("{\"status\":\"ok\",\"widget\":\"shown\",\"launcher\":\"" + launcher + "\",\"firstRun\":" + (isFirstRun ? "true" : "false") + ",\"gameInstalled\":" + (isGameInstalled ? "true" : "false") + "}");
                res.ContentType = "application/json; charset=utf-8";
                res.StatusCode = 200;
                res.OutputStream.Write(data, 0, data.Length);
                res.Close();
            }
            else if (path.Equals("/launcher-violation", StringComparison.OrdinalIgnoreCase))
            {
                string launcher = req.QueryString["launcher"] ?? "Motion Launcher";
                string reason = req.QueryString["reason"] ?? "Несанкционированное изменение файлов лаунчера";
                string file = req.QueryString["file"] ?? "";

                Console.WriteLine($"[SAPatcher Daemon] SECURITY VIOLATION: {reason} (File: {file})");

                try
                {
                    string? motionDir = SettingsManager.Current.MotionLauncherPath;
                    if (string.IsNullOrEmpty(motionDir) || !Directory.Exists(motionDir))
                    {
                        string localApp = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "motion-launcher");
                        if (Directory.Exists(localApp)) motionDir = localApp;
                    }

                    if (!string.IsNullOrEmpty(motionDir) && Directory.Exists(motionDir))
                    {
                        string now = DateTime.Now.ToString("dd.MM.yyyy, HH:mm:ss");
                        string breachLog = $"[{now}] SAPatcher Guard -> SECURITY VIOLATION (BLOCKED) | File: {file} | Reason: {reason}\r\n";
                        File.AppendAllText(Path.Combine(motionDir, "SAPatcher_Motion.log"), breachLog, Encoding.UTF8);
                    }
                }
                catch {}

                try
                {
                    var violationPayload = new
                    {
                        @event = "launcherViolation",
                        launcher,
                        reason,
                        file,
                        timestamp = DateTime.UtcNow.ToString("o")
                    };
                    _onMessageCallback?.Invoke(JsonSerializer.Serialize(violationPayload));
                }
                catch {}

                byte[] data = Encoding.UTF8.GetBytes("{\"status\":\"blocked\",\"violation\":\"recorded\"}");
                res.ContentType = "application/json; charset=utf-8";
                res.StatusCode = 200;
                res.OutputStream.Write(data, 0, data.Length);
                res.Close();
            }
            else if (path.Equals("/status", StringComparison.OrdinalIgnoreCase))
            {
                var statusObj = new
                {
                    status = "online",
                    port = DefaultPort,
                    version = "1.0.0",
                    uptime = DateTime.UtcNow.ToString("o"),
                    language = SettingsManager.Current.Language
                };
                byte[] data = Encoding.UTF8.GetBytes(JsonSerializer.Serialize(statusObj));
                res.ContentType = "application/json; charset=utf-8";
                res.StatusCode = 200;
                res.OutputStream.Write(data, 0, data.Length);
                res.Close();
            }
            else
            {
                res.StatusCode = 404;
                res.Close();
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[SAPatcher Daemon] Handle error: {ex.Message}");
            try
            {
                context.Response.StatusCode = 500;
                context.Response.Close();
            }
            catch {}
        }
    }
}

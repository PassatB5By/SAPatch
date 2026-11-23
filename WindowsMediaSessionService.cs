using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Runtime.InteropServices.WindowsRuntime;
using System.Text.Json;
using System.Threading.Tasks;
using Windows.Media.Control;
using Windows.Storage.Streams;

namespace SAPatcher;

public class MediaStatePayload
{
    public string App { get; set; } = "Windows Media";
    public string Title { get; set; } = "Нет трека";
    public string Artist { get; set; } = "Ожидание воспроизведения...";
    public string AlbumTitle { get; set; } = "";
    public string? AlbumArt { get; set; }
    public bool IsPlaying { get; set; } = false;
    public bool HasMedia { get; set; } = false;
}

public static class WindowsMediaSessionService
{
    private static GlobalSystemMediaTransportControlsSessionManager? _manager;
    private static Action<MediaStatePayload>? _onStateChanged;

    public static async Task InitializeAsync(Action<MediaStatePayload> onStateChanged)
    {
        _onStateChanged = onStateChanged;

        try
        {
            _manager = await GlobalSystemMediaTransportControlsSessionManager.RequestAsync();
            if (_manager != null)
            {
                _manager.CurrentSessionChanged += (s, e) => { _ = FetchAndBroadcastStateAsync(); };
                _manager.SessionsChanged += (s, e) => { _ = FetchAndBroadcastStateAsync(); };
            }
            await FetchAndBroadcastStateAsync();
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[WindowsMediaSessionService] Init warning: {ex.Message}");
        }
    }

    private static GlobalSystemMediaTransportControlsSession? PickBestSession()
    {
        if (_manager == null)
        {
            try
            {
                var task = GlobalSystemMediaTransportControlsSessionManager.RequestAsync().AsTask();
                task.Wait(500);
                _manager = task.Result;
            }
            catch {}
        }

        if (_manager == null) return null;

        IReadOnlyList<GlobalSystemMediaTransportControlsSession>? sessions = null;
        try
        {
            sessions = _manager.GetSessions();
        }
        catch {}

        if (sessions == null || sessions.Count == 0)
        {
            try
            {
                return _manager.GetCurrentSession();
            }
            catch
            {
                return null;
            }
        }

        // 1. Any session that is currently PLAYING
        foreach (var s in sessions)
        {
            try
            {
                var pb = s.GetPlaybackInfo();
                if (pb != null && pb.PlaybackStatus == GlobalSystemMediaTransportControlsSessionPlaybackStatus.Playing)
                {
                    return s;
                }
            }
            catch {}
        }

        // 2. Any session from a known media / browser app that is PAUSED
        foreach (var s in sessions)
        {
            try
            {
                var pb = s.GetPlaybackInfo();
                if (pb != null && pb.PlaybackStatus == GlobalSystemMediaTransportControlsSessionPlaybackStatus.Paused)
                {
                    string appId = s.SourceAppUserModelId?.ToLowerInvariant() ?? "";
                    if (IsMediaApp(appId))
                    {
                        return s;
                    }
                }
            }
            catch {}
        }

        // 3. Any session from a known media app
        foreach (var s in sessions)
        {
            string appId = s.SourceAppUserModelId?.ToLowerInvariant() ?? "";
            if (IsMediaApp(appId))
            {
                return s;
            }
        }

        // 4. Any session that has an actual track title
        foreach (var s in sessions)
        {
            try
            {
                var propTask = s.TryGetMediaPropertiesAsync().AsTask();
                if (propTask.Wait(200) && propTask.Result != null && !string.IsNullOrWhiteSpace(propTask.Result.Title))
                {
                    return s;
                }
            }
            catch {}
        }

        // 5. Fallback: GetCurrentSession or first
        try
        {
            return _manager.GetCurrentSession() ?? sessions.FirstOrDefault();
        }
        catch
        {
            return sessions.FirstOrDefault();
        }
    }

    private static bool IsMediaApp(string appId)
    {
        return appId.Contains("chrome") ||
               appId.Contains("spotify") ||
               appId.Contains("yandex") ||
               appId.Contains("music") ||
               appId.Contains("edge") ||
               appId.Contains("firefox") ||
               appId.Contains("opera") ||
               appId.Contains("aimp") ||
               appId.Contains("foobar") ||
               appId.Contains("vlc");
    }

    public static async Task<MediaStatePayload> GetCurrentStateAsync()
    {
        var session = PickBestSession();
        if (session == null)
        {
            return new MediaStatePayload { HasMedia = false };
        }

        var payload = new MediaStatePayload
        {
            HasMedia = true,
            App = FormatAppName(session.SourceAppUserModelId)
        };

        try
        {
            var pbInfo = session.GetPlaybackInfo();
            payload.IsPlaying = pbInfo?.PlaybackStatus == GlobalSystemMediaTransportControlsSessionPlaybackStatus.Playing;
        }
        catch {}

        try
        {
            var props = await session.TryGetMediaPropertiesAsync();
            if (props != null)
            {
                payload.Title = !string.IsNullOrWhiteSpace(props.Title) ? props.Title : "Без названия";
                payload.Artist = !string.IsNullOrWhiteSpace(props.Artist) ? props.Artist : "Неизвестный исполнитель";
                payload.AlbumTitle = props.AlbumTitle ?? "";

                if (props.Thumbnail != null)
                {
                    try
                    {
                        var streamRef = await props.Thumbnail.OpenReadAsync();
                        if (streamRef != null && streamRef.Size > 0)
                        {
                            using var stream = streamRef.AsStreamForRead();
                            using var ms = new MemoryStream();
                            await stream.CopyToAsync(ms);
                            byte[] bytes = ms.ToArray();
                            if (bytes.Length > 0)
                            {
                                string mime = !string.IsNullOrWhiteSpace(streamRef.ContentType) ? streamRef.ContentType : "image/jpeg";
                                payload.AlbumArt = $"data:{mime};base64,{Convert.ToBase64String(bytes)}";
                            }
                        }
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"[SMTC] Thumbnail read error: {ex.Message}");
                    }
                }
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[WindowsMediaSessionService] Props error: {ex.Message}");
        }

        return payload;
    }

    public static async Task FetchAndBroadcastStateAsync()
    {
        try
        {
            var state = await GetCurrentStateAsync();
            _onStateChanged?.Invoke(state);
        }
        catch {}
    }

    public static async Task TogglePlayPauseAsync()
    {
        try
        {
            var session = PickBestSession();
            if (session != null)
            {
                await session.TryTogglePlayPauseAsync();
            }
        }
        catch {}
    }

    public static async Task SkipNextAsync()
    {
        try
        {
            var session = PickBestSession();
            if (session != null)
            {
                await session.TrySkipNextAsync();
            }
        }
        catch {}
    }

    public static async Task SkipPreviousAsync()
    {
        try
        {
            var session = PickBestSession();
            if (session != null)
            {
                await session.TrySkipPreviousAsync();
            }
        }
        catch {}
    }

    private static string FormatAppName(string rawAppId)
    {
        if (string.IsNullOrWhiteSpace(rawAppId)) return "Windows Media";

        string lower = rawAppId.ToLowerInvariant();
        if (lower.Contains("chrome")) return "Google Chrome";
        if (lower.Contains("spotify")) return "Spotify";
        if (lower.Contains("yandexmusic") || lower.Contains("yandex")) return "Яндекс Музыка";
        if (lower.Contains("firefox")) return "Mozilla Firefox";
        if (lower.Contains("msedge") || lower.Contains("edge")) return "Microsoft Edge";
        if (lower.Contains("opera")) return "Opera";
        if (lower.Contains("aimp")) return "AIMP";
        if (lower.Contains("foobar")) return "foobar2000";
        if (lower.Contains("vlc")) return "VLC Media Player";
        if (lower.Contains("zune") || lower.Contains("music")) return "Медиаплеер Windows";
        if (lower.Contains("ayugram") || lower.Contains("telegram")) return "Telegram Audio";

        int slash = rawAppId.LastIndexOf('\\');
        if (slash >= 0 && slash < rawAppId.Length - 1)
        {
            return rawAppId.Substring(slash + 1);
        }

        return rawAppId;
    }
}

using System;
using System.IO;
using System.Text.Json;

namespace SAPatcher;

public class AppSettings
{
    public string Language { get; set; } = "ru";
    public string DxvkVersion { get; set; } = "3.1.1";
    public bool Enable4gbPatch { get; set; } = true;
    public bool EnableSeamless { get; set; } = true;
    public bool EnableTearFree { get; set; } = true;
    public bool EnableVsyncOff { get; set; } = true;
    public bool EnableHud { get; set; } = false;
    public string HudElements { get; set; } = "version,fps,gpuload,memory";
    public double HudScale { get; set; } = 0.75;
    public int HudX { get; set; } = 1800;
    public int HudY { get; set; } = 20;
    public string HudPreset { get; set; } = "custom";
    public bool EnableFpsLimit { get; set; } = false;
    public int MaxFrameRate { get; set; } = 200;
    public bool MinimizeToTray { get; set; } = true;
    public string MotionGamePath { get; set; } = string.Empty;
    public string MotionLauncherPath { get; set; } = string.Empty;
    public System.Collections.Generic.Dictionary<string, string> DiscoveredGamePaths { get; set; } = new();
}

public static class SettingsManager
{
    private static readonly string SettingsFilePath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "settings.json");
    private static readonly object SyncLock = new();
    private static AppSettings? _current;

    public static AppSettings Current
    {
        get
        {
            if (_current == null)
            {
                lock (SyncLock)
                {
                    _current ??= Load();
                }
            }
            return _current;
        }
    }

    public static AppSettings Load()
    {
        lock (SyncLock)
        {
            try
            {
                if (File.Exists(SettingsFilePath))
                {
                    string json = File.ReadAllText(SettingsFilePath);
                    var settings = JsonSerializer.Deserialize<AppSettings>(json, new JsonSerializerOptions
                    {
                        PropertyNameCaseInsensitive = true
                    });
                    if (settings != null)
                    {
                        _current = settings;
                        return settings;
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[SettingsManager] Load error: {ex.Message}");
            }

            _current = new AppSettings();
            Save(_current);
            return _current;
        }
    }

    public static void Save(AppSettings settings)
    {
        lock (SyncLock)
        {
            try
            {
                _current = settings;
                string json = JsonSerializer.Serialize(settings, new JsonSerializerOptions
                {
                    WriteIndented = true
                });
                File.WriteAllText(SettingsFilePath, json);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[SettingsManager] Save error: {ex.Message}");
            }
        }
    }

    public static void Update(Action<AppSettings> updateAction)
    {
        lock (SyncLock)
        {
            var s = Current;
            updateAction(s);
            Save(s);
        }
    }
}

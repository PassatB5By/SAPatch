using System;
using System.Collections.Generic;
using System.IO;
using System.IO.Compression;
using System.Linq;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace SAPatcher;

public class PatchStatusResult
{
    [JsonPropertyName("found")]
    public bool Found { get; set; }

    [JsonPropertyName("launcherPath")]
    public string LauncherPath { get; set; } = string.Empty;

    [JsonPropertyName("launcherDir")]
    public string LauncherDir { get; set; } = string.Empty;

    [JsonPropertyName("appDir")]
    public string AppDir { get; set; } = string.Empty;

    [JsonPropertyName("isUnpacked")]
    public bool IsUnpacked { get; set; }

    [JsonPropertyName("isPatched")]
    public bool IsPatched { get; set; }

    [JsonPropertyName("asarBakExists")]
    public bool AsarBakExists { get; set; }

    [JsonPropertyName("backupExists")]
    public bool BackupExists { get; set; }

    [JsonPropertyName("backupZipPath")]
    public string BackupZipPath { get; set; } = string.Empty;

    [JsonPropertyName("logExists")]
    public bool LogExists { get; set; }

    [JsonPropertyName("logPath")]
    public string LogPath { get; set; } = string.Empty;

    [JsonPropertyName("diagLogPath")]
    public string DiagLogPath { get; set; } = string.Empty;

    [JsonPropertyName("integrityManifestExists")]
    public bool IntegrityManifestExists { get; set; }

    [JsonPropertyName("firstLaunchDone")]
    public bool FirstLaunchDone { get; set; }

    [JsonPropertyName("discoveredGamePath")]
    public string DiscoveredGamePath { get; set; } = string.Empty;

    [JsonPropertyName("candidatePaths")]
    public List<string> CandidatePaths { get; set; } = new();

    [JsonPropertyName("detectedVersion")]
    public string DetectedVersion { get; set; } = string.Empty;

    [JsonPropertyName("isVersionSupported")]
    public bool IsVersionSupported { get; set; } = true;

    [JsonPropertyName("isVersionBlocked")]
    public bool IsVersionBlocked { get; set; }

    [JsonPropertyName("hasCompatibilityWarning")]
    public bool HasCompatibilityWarning { get; set; }

    [JsonPropertyName("versionWarningMessage")]
    public string VersionWarningMessage { get; set; } = string.Empty;
}

public class IntegrityManifestEntry
{
    [JsonPropertyName("size")]
    public long Size { get; set; }

    [JsonPropertyName("hash")]
    public string Hash { get; set; } = string.Empty;
}

public class IntegrityManifest
{
    [JsonPropertyName("version")]
    public string Version { get; set; } = "2.0.0-SAPatcher";

    [JsonPropertyName("createdAt")]
    public string CreatedAt { get; set; } = DateTime.UtcNow.ToString("o");

    [JsonPropertyName("algorithm")]
    public string Algorithm { get; set; } = "SHA256";

    [JsonPropertyName("files")]
    public Dictionary<string, IntegrityManifestEntry> Files { get; set; } = new();
}

public class PatchExecutionResult
{
    [JsonPropertyName("success")]
    public bool Success { get; set; }

    [JsonPropertyName("message")]
    public string Message { get; set; } = string.Empty;

    [JsonPropertyName("logs")]
    public List<string> Logs { get; set; } = new();

    [JsonPropertyName("status")]
    public PatchStatusResult Status { get; set; } = new();

    [JsonPropertyName("isVersionBlocked")]
    public bool IsVersionBlocked { get; set; }

    [JsonPropertyName("hasCompatibilityWarning")]
    public bool HasCompatibilityWarning { get; set; }

    [JsonPropertyName("versionWarningMessage")]
    public string VersionWarningMessage { get; set; } = string.Empty;
}

public class GameIntegrityCheckResult
{
    [JsonPropertyName("gamePath")]
    public string GamePath { get; set; } = string.Empty;

    [JsonPropertyName("installed")]
    public bool Installed { get; set; }

    [JsonPropertyName("clean")]
    public bool Clean { get; set; }

    [JsonPropertyName("message")]
    public string Message { get; set; } = string.Empty;

    [JsonPropertyName("d3d9Exists")]
    public bool D3D9Exists { get; set; }

    [JsonPropertyName("d3d9Size")]
    public long D3D9Size { get; set; }

    [JsonPropertyName("d3d9VersionDetected")]
    public string D3D9VersionDetected { get; set; } = string.Empty;

    [JsonPropertyName("d3d9MatchesKnownDxvk")]
    public bool D3D9MatchesKnownDxvk { get; set; }

    [JsonPropertyName("dxvkConfExists")]
    public bool DxvkConfExists { get; set; }

    [JsonPropertyName("laaMotionEnabled")]
    public bool LaaMotionEnabled { get; set; }

    [JsonPropertyName("laaSampEnabled")]
    public bool LaaSampEnabled { get; set; }

    [JsonPropertyName("laaEnabled")]
    public bool LaaEnabled { get; set; }

    [JsonPropertyName("manifestExists")]
    public bool ManifestExists { get; set; }

    [JsonPropertyName("manifestFilesCount")]
    public int ManifestFilesCount { get; set; }

    [JsonPropertyName("mainExe")]
    public string MainExe { get; set; } = string.Empty;

    [JsonPropertyName("mainExeSize")]
    public long MainExeSize { get; set; }

    [JsonPropertyName("authorizedExes")]
    public List<string> AuthorizedExes { get; set; } = new();

    [JsonPropertyName("foreignExes")]
    public List<string> ForeignExes { get; set; } = new();

    [JsonPropertyName("foreignFiles")]
    public List<string> ForeignFiles { get; set; } = new();

    [JsonPropertyName("corruptedFiles")]
    public List<string> CorruptedFiles { get; set; } = new();

    [JsonPropertyName("missingFiles")]
    public List<string> MissingFiles { get; set; } = new();

    [JsonPropertyName("checkedAt")]
    public string CheckedAt { get; set; } = DateTime.Now.ToString("dd.MM.yyyy HH:mm:ss");
}

public static class LauncherPatcherService
{
    public static string GuardHeader => Guard.GuardManager.GuardHeader;
    public static string GuardFooter => Guard.GuardManager.GuardFooter;
    public static string GuardScript => Guard.GuardManager.GetGuardScript();

    public static readonly string ElectronLoggingHeader = "// === SAPATCHER ELECTRON DEBUG LOGGING START ===";
    public static readonly string ElectronLoggingFooter = "// === SAPATCHER ELECTRON DEBUG LOGGING END ===";

    public static string GetElectronLoggingScript()
    {
        return @"// === SAPATCHER ELECTRON DEBUG LOGGING START ===
(function() {
    try {
        const _fs = require('fs');
        const _path = require('path');
        const _electron = require('electron');
        const _app = _electron.app;

        const _appDir = _path.resolve(__dirname, '..');
        const _resourcesDir = _path.resolve(_appDir, '..');
        const _rootDir = _path.dirname(_resourcesDir);
        const _parentDir = _path.dirname(_rootDir);
        const _logFile = _path.join(_rootDir, 'SAPatcher_Electron.log');

        if (_app && _app.commandLine) {
            try {
                _app.commandLine.appendSwitch('enable-logging');
                _app.commandLine.appendSwitch('log-file', _logFile);
                _app.commandLine.appendSwitch('v', '1');
            } catch(e) {}
        }

        function _sa_format(args) {
            return args.map(a => {
                if (a instanceof Error) return a.stack || a.message;
                if (typeof a === 'object') {
                    try { return JSON.stringify(a); } catch(e) { return String(a); }
                }
                return String(a);
            }).join(' ');
        }

        function _sa_append(level, text) {
            try {
                const time = new Date().toISOString();
                const line = `[${time}] [${level}] ${text}\r\n`;
                _fs.appendFileSync(_logFile, line, 'utf8');
                try {
                    _fs.appendFileSync(_path.join(_appDir, 'SAPatcher_Electron.log'), line, 'utf8');
                } catch(e) {}
                try {
                    _fs.appendFileSync(_path.join(_parentDir, 'SAPatcher_Electron.log'), line, 'utf8');
                } catch(e) {}
            } catch(e) {}
        }

        _sa_append('SYSTEM', '================================================================================');
        _sa_append('SYSTEM', `[SAPatcher] Electron Main Process Starting | PID: ${process.pid}`);
        _sa_append('SYSTEM', `Node: ${process.versions.node} | Electron: ${process.versions.electron} | Chrome: ${process.versions.chrome}`);
        _sa_append('SYSTEM', `ExecPath: ${process.execPath}`);
        _sa_append('SYSTEM', `CWD: ${process.cwd()}`);
        _sa_append('SYSTEM', '================================================================================');

        const _origLog = console.log;
        const _origErr = console.error;
        const _origWarn = console.warn;
        const _origInfo = console.info;

        console.log = function(...args) { _sa_append('INFO', _sa_format(args)); _origLog.apply(console, args); };
        console.error = function(...args) { _sa_append('ERROR', _sa_format(args)); _origErr.apply(console, args); };
        console.warn = function(...args) { _sa_append('WARN', _sa_format(args)); _origWarn.apply(console, args); };
        console.info = function(...args) { _sa_append('INFO', _sa_format(args)); _origInfo.apply(console, args); };

        process.on('uncaughtException', (err) => {
            _sa_append('FATAL_UNCAUGHT_EXCEPTION', err && err.stack ? err.stack : String(err));
        });
        process.on('unhandledRejection', (reason) => {
            _sa_append('UNHANDLED_REJECTION', reason && reason.stack ? reason.stack : String(reason));
        });
    } catch(e) {
        try { console.error('[SAPatcher Logging Harness Error]', e); } catch(_) {}
    }
})();
// === SAPATCHER ELECTRON DEBUG LOGGING END ===";
    }

    public static string StripGuard(string jsCode)
    {
        string result = jsCode;
        if (result.Contains(ElectronLoggingHeader) && result.Contains(ElectronLoggingFooter))
        {
            int s = result.IndexOf(ElectronLoggingHeader, StringComparison.Ordinal);
            int e = result.IndexOf(ElectronLoggingFooter, s, StringComparison.Ordinal);
            if (s >= 0 && e >= 0)
            {
                result = result.Remove(s, (e + ElectronLoggingFooter.Length) - s).Trim();
            }
        }
        foreach (var header in Guard.GuardManager.RecognizedHeaders)
        {
            if (result.Contains(header))
            {
                int sIdx = result.IndexOf(header, StringComparison.Ordinal);
                int eIdx = -1;
                foreach (var footer in Guard.GuardManager.RecognizedFooters)
                {
                    int found = result.IndexOf(footer, sIdx, StringComparison.Ordinal);
                    if (found >= 0)
                    {
                        eIdx = found + footer.Length;
                        break;
                    }
                }
                if (eIdx > sIdx)
                {
                    result = result.Remove(sIdx, eIdx - sIdx).Trim();
                }
            }
        }
        return result;
    }

    public static (string LauncherDir, string AppDir) ResolveLauncherAndAppDir(string? pathOrDir)
    {
        if (string.IsNullOrWhiteSpace(pathOrDir)) return (string.Empty, string.Empty);

        string p = pathOrDir.Trim().Trim('"', '\'');
        if (File.Exists(p))
        {
            p = Path.GetDirectoryName(p) ?? p;
        }

        if (!Directory.Exists(p)) return (string.Empty, string.Empty);

        string folderName = Path.GetFileName(p.TrimEnd(Path.DirectorySeparatorChar, Path.AltDirectorySeparatorChar));

        if (folderName.StartsWith("app-", StringComparison.OrdinalIgnoreCase))
        {
            string appDir = p;
            string parent = Directory.GetParent(p)?.FullName ?? p;
            return (parent, appDir);
        }

        if (Directory.Exists(Path.Combine(p, "resources")))
        {
            string parent = Directory.GetParent(p)?.FullName ?? p;
            return (parent, p);
        }

        try
        {
            var appDirs = Directory.GetDirectories(p, "app-*", SearchOption.TopDirectoryOnly);
            if (appDirs.Length > 0)
            {
                Array.Sort(appDirs);
                return (p, appDirs[^1]);
            }
        }
        catch {}

        return (p, string.Empty);
    }

    public static List<string> GetCandidateLauncherDirs()
    {
        var dirs = new List<string>();

        string localApp = Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData);
        string[] localCandidates = new[]
        {
            Path.Combine(localApp, "motion-launcher"),
            Path.Combine(localApp, "Programs", "motion-launcher")
        };
        foreach (var lCandidate in localCandidates)
        {
            if (Directory.Exists(lCandidate) && !dirs.Contains(lCandidate, StringComparer.OrdinalIgnoreCase))
            {
                dirs.Add(lCandidate);
            }
        }

        string progFiles = Environment.GetFolderPath(Environment.SpecialFolder.ProgramFiles);
        string pfLauncher = Path.Combine(progFiles, "motion-launcher");
        if (Directory.Exists(pfLauncher) && !dirs.Contains(pfLauncher, StringComparer.OrdinalIgnoreCase)) dirs.Add(pfLauncher);

        string? hardcodedProject = SettingsManager.Current.MotionLauncherPath;
        if (Directory.Exists(hardcodedProject) && !dirs.Contains(hardcodedProject, StringComparer.OrdinalIgnoreCase)) dirs.Add(hardcodedProject);

        string baseDir = AppDomain.CurrentDomain.BaseDirectory;
        string projectMotion = Path.Combine(baseDir, "motion");
        if (Directory.Exists(projectMotion) && !dirs.Contains(projectMotion, StringComparer.OrdinalIgnoreCase)) dirs.Add(projectMotion);

        string curMotion = Path.Combine(Directory.GetCurrentDirectory(), "motion");
        if (Directory.Exists(curMotion) && !dirs.Contains(curMotion, StringComparer.OrdinalIgnoreCase)) dirs.Add(curMotion);

        return dirs;
    }

    public class LauncherVersionInfo
    {
        public Version? Version { get; set; }
        public string RawVersion { get; set; } = string.Empty;
        public bool IsVersionBlocked { get; set; }
        public bool HasCompatibilityWarning { get; set; }
        public string WarningMessage { get; set; } = string.Empty;
        public bool IsV2OrHigher => Version != null &&
            new Version(Version.Major, Version.Minor, Math.Max(0, Version.Build), Math.Max(0, Version.Revision)) >= new Version(2, 0, 0, 0);
    }

    public static LauncherVersionInfo EvaluateLauncherVersion(string appDir)
    {
        var info = new LauncherVersionInfo();
        if (string.IsNullOrWhiteSpace(appDir)) return info;

        string rawVer = string.Empty;
        string[] pkgCandidates = new[]
        {
            Path.Combine(appDir, "resources", "app", "package.json"),
            Path.Combine(appDir, "resources", "unpacked", "package.json"),
            Path.Combine(appDir, "resources", "original_backup", "package.json"),
            Path.Combine(appDir, "package.json")
        };

        foreach (var pkg in pkgCandidates)
        {
            if (File.Exists(pkg))
            {
                try
                {
                    string txt = File.ReadAllText(pkg, Encoding.UTF8);
                    using var doc = JsonDocument.Parse(txt);
                    if (doc.RootElement.TryGetProperty("version", out var vElem))
                    {
                        string vStr = vElem.GetString() ?? "";
                        if (!string.IsNullOrWhiteSpace(vStr))
                        {
                            rawVer = vStr.Trim();
                            break;
                        }
                    }
                }
                catch {}
            }
        }

        if (string.IsNullOrWhiteSpace(rawVer))
        {
            string dirName = Path.GetFileName(appDir.TrimEnd(Path.DirectorySeparatorChar, Path.AltDirectorySeparatorChar));
            if (dirName.StartsWith("app-", StringComparison.OrdinalIgnoreCase))
            {
                rawVer = dirName.Substring(4).Trim();
            }
        }

        if (string.IsNullOrWhiteSpace(rawVer))
        {
            string asarPath = Path.Combine(appDir, "resources", "app.asar");
            if (File.Exists(asarPath))
            {
                try
                {
                    using var fs = new FileStream(asarPath, FileMode.Open, FileAccess.Read, FileShare.Read);
                    using var br = new BinaryReader(fs);
                    uint u1 = br.ReadUInt32();
                    uint headerSize = br.ReadUInt32();
                    uint u3 = br.ReadUInt32();
                    uint jsonSize = br.ReadUInt32();
                    if (jsonSize > 0 && jsonSize < 2_000_000)
                    {
                        byte[] jsonBytes = br.ReadBytes((int)jsonSize);
                        string json = Encoding.UTF8.GetString(jsonBytes);
                        var m = System.Text.RegularExpressions.Regex.Match(json, "\"package\\.json\"\\s*:\\s*\\{[^}]*\"size\"\\s*:\\s*(\\d+)[^}]*\"offset\"\\s*:\\s*\"(\\d+)\"");
                        if (m.Success && long.TryParse(m.Groups[1].Value, out long pkgSize) && long.TryParse(m.Groups[2].Value, out long pkgOffset))
                        {
                            long absOffset = 8 + headerSize + pkgOffset;
                            fs.Seek(absOffset, SeekOrigin.Begin);
                            byte[] pkgBytes = br.ReadBytes((int)pkgSize);
                            string pkgJson = Encoding.UTF8.GetString(pkgBytes);
                            using var doc = JsonDocument.Parse(pkgJson);
                            if (doc.RootElement.TryGetProperty("version", out var vElem))
                            {
                                rawVer = vElem.GetString() ?? "";
                            }
                        }
                    }
                }
                catch {}
            }
        }

        if (string.IsNullOrWhiteSpace(rawVer))
        {
            rawVer = "2.0.0";
        }

        info.RawVersion = rawVer;

        string cleaned = rawVer.Trim();
        int dashIdx = cleaned.IndexOf('-');
        if (dashIdx >= 0) cleaned = cleaned.Substring(0, dashIdx).Trim();
        if (cleaned.StartsWith("v", StringComparison.OrdinalIgnoreCase)) cleaned = cleaned.Substring(1).Trim();

        if (Version.TryParse(cleaned, out var parsed))
        {
            info.Version = parsed;
            var norm = new Version(parsed.Major, parsed.Minor, Math.Max(0, parsed.Build), Math.Max(0, parsed.Revision));
            var minVer = new Version(1, 2, 46, 0);
            var maxTestedVer = new Version(2, 0, 1, 0);

            if (norm < minVer)
            {
                info.IsVersionBlocked = true;
                info.WarningMessage = $"Версия лаунчера ({rawVer}) устарела (< 1.2.46). Патчинг заблокирован. Пожалуйста, обновите Motion Launcher.";
            }
            else if (norm > maxTestedVer)
            {
                info.HasCompatibilityWarning = true;
                info.WarningMessage = $"Внимание: версия лаунчера ({rawVer}) новее протестированных (1.2.46, 2.0.0.0 и 2.0.1.0). Возможны проблемы совместимости!";
            }
        }
        else
        {
            info.HasCompatibilityWarning = true;
            info.WarningMessage = $"Не удалось определить точную версию лаунчера ({rawVer}). Патчинг выполняется в режиме совместимости.";
        }

        return info;
    }

    public static PatchStatusResult GetStatus(string? preferredPath = null)
    {
        var status = new PatchStatusResult();
        var candidates = GetCandidateLauncherDirs();
        status.CandidatePaths = candidates;

        string targetInput = string.Empty;
        if (!string.IsNullOrEmpty(preferredPath))
        {
            string p = preferredPath.Trim().Trim('"', '\'');
            if (File.Exists(p)) p = Path.GetDirectoryName(p) ?? p;
            if (Directory.Exists(p)) targetInput = p;
        }

        if (string.IsNullOrEmpty(targetInput) && candidates.Count > 0)
        {
            targetInput = candidates[0];
        }

        if (string.IsNullOrEmpty(targetInput) || !Directory.Exists(targetInput))
        {
            status.Found = false;
            return status;
        }

        var (launcherDir, appDir) = ResolveLauncherAndAppDir(targetInput);
        if (string.IsNullOrEmpty(launcherDir)) launcherDir = targetInput;

        status.Found = true;
        status.LauncherDir = launcherDir;
        string exeCandidate = Path.Combine(launcherDir, "Motion Launcher.exe");
        if (!File.Exists(exeCandidate) && !string.IsNullOrEmpty(appDir))
        {
            string appExe = Path.Combine(appDir, "Motion Launcher.exe");
            if (File.Exists(appExe)) exeCandidate = appExe;
        }
        status.LauncherPath = exeCandidate;
        status.LogPath = Path.Combine(launcherDir, "SAPatcher_Motion.log");
        status.DiagLogPath = Path.Combine(launcherDir, "SAPatcher_Diagnostics.log");
        status.BackupZipPath = Path.Combine(launcherDir, "Motion_Launcher_Original_Backup.zip");
        status.LogExists = File.Exists(status.LogPath);
        status.BackupExists = File.Exists(status.BackupZipPath);
        status.AppDir = appDir;

        if (!string.IsNullOrEmpty(appDir))
        {
            var verInfo = EvaluateLauncherVersion(appDir);
            status.DetectedVersion = verInfo.RawVersion;
            status.IsVersionSupported = !verInfo.IsVersionBlocked;
            status.IsVersionBlocked = verInfo.IsVersionBlocked;
            status.HasCompatibilityWarning = verInfo.HasCompatibilityWarning;
            status.VersionWarningMessage = verInfo.WarningMessage;

            string resourcesDir = Path.Combine(appDir, "resources");
            string appFolder = Path.Combine(resourcesDir, "app");
            string asarBak = Path.Combine(resourcesDir, "app.asar.bak");
            string mainJs = Path.Combine(appFolder, "dist", "main.js");
            string manifestFile = Path.Combine(resourcesDir, "integrity.manifest.json");
            string firstRunMarker = Path.Combine(resourcesDir, ".first_launch_done");

            status.IsUnpacked = Directory.Exists(appFolder);
            status.AsarBakExists = File.Exists(asarBak);
            status.IntegrityManifestExists = File.Exists(manifestFile);
            status.FirstLaunchDone = File.Exists(firstRunMarker);
            status.DiscoveredGamePath = !string.IsNullOrWhiteSpace(SettingsManager.Current.MotionGamePath)
                ? SettingsManager.Current.MotionGamePath
                : (DetectGamePathFromLauncher(launcherDir) ?? DetectGamePathFromLauncher(appDir) ?? string.Empty);

            if (string.IsNullOrWhiteSpace(SettingsManager.Current.MotionGamePath) && !string.IsNullOrWhiteSpace(status.DiscoveredGamePath))
            {
                SettingsManager.Update(s => s.MotionGamePath = status.DiscoveredGamePath);
            }

            if (File.Exists(mainJs))
            {
                try
                {
                    string content = File.ReadAllText(mainJs, Encoding.UTF8);
                    status.IsPatched = Guard.GuardManager.RecognizedHeaders.Any(h => content.Contains(h));
                }
                catch {}
            }
        }

        return status;
    }

    public static bool ExtractAsar(string asarPath, string outputDir, out string error, List<string>? logs = null)
    {
        error = string.Empty;
        if (!File.Exists(asarPath))
        {
            error = $"Файл архива {asarPath} не существует.";
            return false;
        }

        try
        {
            using var fs = new FileStream(asarPath, FileMode.Open, FileAccess.Read, FileShare.Read);
            using var br = new BinaryReader(fs);

            uint u1 = br.ReadUInt32();
            uint headerSize = br.ReadUInt32();
            uint u3 = br.ReadUInt32();
            uint jsonSize = br.ReadUInt32();

            byte[] jsonBytes = br.ReadBytes((int)jsonSize);
            string json = Encoding.UTF8.GetString(jsonBytes);
            long basePayloadOffset = 8 + headerSize;

            using var doc = JsonDocument.Parse(json);
            if (!doc.RootElement.TryGetProperty("files", out var filesElem))
            {
                error = "Некорректная структура архива asar: секция files не найдена.";
                return false;
            }

            Directory.CreateDirectory(outputDir);
            int count = 0;
            ExtractAsarNode(fs, basePayloadOffset, filesElem, outputDir, ref count);

            string asarDir = Path.GetDirectoryName(asarPath) ?? string.Empty;
            string asarName = Path.GetFileName(asarPath);
            string unpackedDir = asarPath + ".unpacked";
            if (!Directory.Exists(unpackedDir) && asarName.Equals("app.asar.bak", StringComparison.OrdinalIgnoreCase))
            {
                string altUnpacked = Path.Combine(asarDir, "app.asar.unpacked");
                if (Directory.Exists(altUnpacked)) unpackedDir = altUnpacked;
            }
            if (Directory.Exists(unpackedDir))
            {
                CopyDirectory(unpackedDir, outputDir);
                logs?.Add($"[ASAR] Интегрированы нативные модули из {Path.GetFileName(unpackedDir)} в {outputDir}");
            }

            logs?.Add($"[ASAR] Распаковано файлов: {count:N0} из {Path.GetFileName(asarPath)} в {outputDir}");
            return true;
        }
        catch (Exception ex)
        {
            error = ex.Message;
            return false;
        }
    }

    private static void ExtractAsarNode(FileStream fs, long basePayloadOffset, JsonElement node, string currentDir, ref int count)
    {
        if (node.ValueKind != JsonValueKind.Object) return;

        foreach (var prop in node.EnumerateObject())
        {
            string name = prop.Name;
            var val = prop.Value;

            if (val.TryGetProperty("files", out var subFiles))
            {
                string subDir = Path.Combine(currentDir, name);
                Directory.CreateDirectory(subDir);
                ExtractAsarNode(fs, basePayloadOffset, subFiles, subDir, ref count);
            }
            else if (val.TryGetProperty("size", out var sizeProp))
            {
                long fileSize = sizeProp.GetInt64();
                string filePath = Path.Combine(currentDir, name);
                string? dir = Path.GetDirectoryName(filePath);
                if (!string.IsNullOrEmpty(dir)) Directory.CreateDirectory(dir);

                if (fileSize == 0)
                {
                    File.WriteAllBytes(filePath, Array.Empty<byte>());
                    count++;
                    continue;
                }

                if (val.TryGetProperty("offset", out var offsetProp))
                {
                    string offsetStr = offsetProp.GetString() ?? "0";
                    if (long.TryParse(offsetStr, out long relOffset))
                    {
                        long absOffset = basePayloadOffset + relOffset;
                        fs.Seek(absOffset, SeekOrigin.Begin);

                        using var outFs = new FileStream(filePath, FileMode.Create, FileAccess.Write, FileShare.None);
                        byte[] buffer = new byte[65536];
                        long remaining = fileSize;
                        while (remaining > 0)
                        {
                            int toRead = (int)Math.Min(buffer.Length, remaining);
                            int read = fs.Read(buffer, 0, toRead);
                            if (read == 0) break;
                            outFs.Write(buffer, 0, read);
                            remaining -= read;
                        }
                        count++;
                    }
                }
            }
        }
    }

    public static PatchExecutionResult PatchLauncher(string? preferredDir = null)
    {
        var result = new PatchExecutionResult();
        var logs = result.Logs;

        try
        {
            var candidates = GetCandidateLauncherDirs();
            if (!string.IsNullOrEmpty(preferredDir))
            {
                string p = preferredDir.Trim().Trim('"', '\'');
                if (File.Exists(p)) p = Path.GetDirectoryName(p) ?? p;
                if (Directory.Exists(p) && !candidates.Contains(p, StringComparer.OrdinalIgnoreCase))
                {
                    candidates.Insert(0, p);
                }
            }

            if (candidates.Count == 0)
            {
                result.Success = false;
                result.Message = "Каталог Motion Launcher не обнаружен в системе (%LOCALAPPDATA% или локально). Укажите путь к лаунчеру вручную.";
                logs.Add("[ERROR] Директория Motion Launcher не найдена.");
                return result;
            }

            string targetInput = candidates[0];
            var (launcherDir, appDir) = ResolveLauncherAndAppDir(targetInput);
            if (string.IsNullOrEmpty(launcherDir)) launcherDir = targetInput;

            logs.Add($"------------------------------------------------------------");
            logs.Add($"[TARGET] Целевой каталог Motion Launcher: {launcherDir}");

            if (string.IsNullOrEmpty(appDir))
            {
                result.Success = false;
                result.Message = $"В каталоге {launcherDir} отсутствует подпапка app-* (версия Squirrel). Запустите официальный лаунчер хотя бы 1 раз для завершения установки.";
                logs.Add($"[ERROR] Подпапка app-* не найдена.");
                return result;
            }

            var verInfo = EvaluateLauncherVersion(appDir);
            logs.Add($"[APP] Версия приложения: {Path.GetFileName(appDir)} (обнаружена версия: {verInfo.RawVersion})");

            if (verInfo.IsVersionBlocked)
            {
                result.Success = false;
                result.IsVersionBlocked = true;
                result.Message = verInfo.WarningMessage;
                logs.Add($"[ERROR] [VERSION_BLOCKED] {verInfo.WarningMessage}");
                result.Status = GetStatus(launcherDir);
                return result;
            }

            if (verInfo.HasCompatibilityWarning)
            {
                result.HasCompatibilityWarning = true;
                result.VersionWarningMessage = verInfo.WarningMessage;
                logs.Add($"[WARN] [COMPATIBILITY] {verInfo.WarningMessage}");
            }

            string resourcesDir = Path.Combine(appDir, "resources");
            string appFolder = Path.Combine(resourcesDir, "app");
            string unpackedFolder = Path.Combine(resourcesDir, "unpacked");
            string asarFile = Path.Combine(resourcesDir, "app.asar");
            string asarBak = Path.Combine(resourcesDir, "app.asar.bak");
            string backupZip = Path.Combine(launcherDir, "Motion_Launcher_Original_Backup.zip");
            string backupDir = Path.Combine(resourcesDir, "original_backup");

            if (!Directory.Exists(appFolder))
            {
                if (Directory.Exists(unpackedFolder))
                {
                    logs.Add($"[UNPACK] Синхронизация чистых оригиналов: unpacked -> app...");
                    CopyDirectory(unpackedFolder, appFolder);
                    logs.Add($"[UNPACK] Базовые файлы приложения подготовлены в resources/app!");
                }
                else if (File.Exists(asarFile) || File.Exists(asarBak))
                {
                    string sourceAsar = File.Exists(asarFile) ? asarFile : asarBak;
                    logs.Add($"[UNPACK] Извлечение официального Electron-архива {Path.GetFileName(sourceAsar)}...");
                    if (ExtractAsar(sourceAsar, appFolder, out string asarErr, logs))
                    {
                        logs.Add($"[UNPACK] Архив app.asar успешно распакован в resources/app!");
                    }
                    else
                    {
                        logs.Add($"[ERROR] Ошибка распаковки app.asar: {asarErr}");
                        result.Success = false;
                        result.Message = $"Ошибка распаковки app.asar: {asarErr}";
                        return result;
                    }
                }
                else
                {
                    Directory.CreateDirectory(appFolder);
                }
            }
            else
            {
                logs.Add($"[UNPACK] Рабочая папка resources/app уже готова.");
            }

            string asarUnpacked = Path.Combine(resourcesDir, "app.asar.unpacked");
            if (Directory.Exists(asarUnpacked))
            {
                CopyDirectory(asarUnpacked, appFolder);
                logs.Add($"[UNPACK] Синхронизированы нативные модули из app.asar.unpacked в resources/app");
            }

            try
            {
                Directory.CreateDirectory(backupDir);
                string pristineMainJs = Path.Combine(unpackedFolder, "dist", "main.js");
                if (!File.Exists(pristineMainJs)) pristineMainJs = Path.Combine(appFolder, "dist", "main.js");

                string backupMainJs = Path.Combine(backupDir, "main.js.original");
                if (File.Exists(pristineMainJs) && !File.Exists(backupMainJs))
                {
                    string rawJs = File.ReadAllText(pristineMainJs, Encoding.UTF8);
                    if (rawJs.Contains(GuardHeader))
                    {
                        int sIdx = rawJs.IndexOf(GuardHeader);
                        int eIdx = rawJs.IndexOf(GuardFooter);
                        if (sIdx >= 0 && eIdx >= 0)
                        {
                            eIdx += GuardFooter.Length;
                            rawJs = rawJs.Remove(sIdx, eIdx - sIdx).TrimStart();
                        }
                    }
                    File.WriteAllText(backupMainJs, rawJs, new UTF8Encoding(false));
                }

                if (!File.Exists(backupZip) && Directory.Exists(backupDir))
                {
                    string pkgJson = Path.Combine(unpackedFolder, "package.json");
                    if (File.Exists(pkgJson)) File.Copy(pkgJson, Path.Combine(backupDir, "package.json"), true);

                    if (File.Exists(backupZip)) File.Delete(backupZip);
                    ZipFile.CreateFromDirectory(backupDir, backupZip, CompressionLevel.Optimal, false);
                    logs.Add($"[BACKUP] Создан архив оригинального лаунчера: Motion_Launcher_Original_Backup.zip");
                }
                else
                {
                    logs.Add($"[BACKUP] Резервный архив Motion_Launcher_Original_Backup.zip сохранён.");
                }
            }
            catch (Exception ex)
            {
                logs.Add($"[WARN] Создание бэкапа: {ex.Message}");
            }

            if (File.Exists(asarFile))
            {
                try
                {
                    if (File.Exists(asarBak)) File.Delete(asarBak);
                    File.Move(asarFile, asarBak);
                    logs.Add($"[ASAR] Архив app.asar переименован в app.asar.bak (задействован resources/app).");
                }
                catch (Exception ex)
                {
                    logs.Add($"[WARN] app.asar: {ex.Message}");
                }
            }

            string apiCompatVer = verInfo.IsV2OrHigher
                ? (verInfo.Version != null && verInfo.Version >= new Version(2, 0, 1)
                    ? $"{verInfo.Version.Major}.{verInfo.Version.Minor}.{Math.Max(0, verInfo.Version.Build)}"
                    : "2.0.0")
                : "1.2.46";

            string packageJsonPath = Path.Combine(appFolder, "package.json");
            if (File.Exists(packageJsonPath))
            {
                try
                {
                    string pkgContent = File.ReadAllText(packageJsonPath, Encoding.UTF8);
                    if (verInfo.IsV2OrHigher)
                    {
                        pkgContent = pkgContent.Replace($"\"version\": \"{apiCompatVer}-SAPatcher\"", $"\"version\": \"{apiCompatVer}\"");
                        pkgContent = pkgContent.Replace("\"version\": \"2.0.0-SAPatcher\"", $"\"version\": \"{apiCompatVer}\"");
                        logs.Add($"[VERSION] Сохранена базовая совместимость с API сервера: {apiCompatVer}");
                    }
                    else
                    {
                        pkgContent = pkgContent.Replace("\"version\": \"1.2.46-SAPatcher\"", "\"version\": \"1.2.46\"");
                        logs.Add($"[VERSION] Сохранена базовая совместимость с API сервера: 1.2.46");
                    }
                    File.WriteAllText(packageJsonPath, pkgContent, new UTF8Encoding(false));
                }
                catch (Exception ex)
                {
                    logs.Add($"[WARN] package.json: {ex.Message}");
                }
            }

            string mainJsPath = Path.Combine(appFolder, "dist", "main.js");
            if (File.Exists(mainJsPath))
            {
                string content = File.ReadAllText(mainJsPath, Encoding.UTF8);
                content = StripGuard(content);

                // Self-heal broken strict-mode globals from earlier patch attempts
                content = content.Replace(";_orig_applyDxvkLatch=function", ";t._orig_applyDxvkLatch=function");
                content = content.Replace(";_orig_isDxvkDllBlocked=function", ";t._orig_isDxvkDllBlocked=function");

                if (verInfo.IsV2OrHigher)
                {
                    // 2.0.0 / 2.0.1 Versioning
                    content = content.Replace(
                        "f.ipcMain.handle(\"getVersion\",()=>f.app.isPackaged?f.app.getVersion():\"DEV\")",
                        $"f.ipcMain.handle(\"getVersion\",()=>\"{apiCompatVer}-SAPatcher\")"
                    );

                    content = content.Replace(
                        "{version:l.app.getVersion()}",
                        $"{{version:\"{apiCompatVer}\"}}"
                    );

                    // 2.0.0 / 2.0.1 Settings Lock
                    content = content.Replace(
                        "getGraphicsMode(){const e=this.store.get(\"graphicsMode\",\"standard\"),t=\"directX_high\"===e?\"directX_med\":e;return(0,h.isGraphicsMode)(t)?t:\"standard\"}",
                        "getGraphicsMode(){return\"standard\"}"
                    );
                    content = content.Replace(
                        "setGraphicsMode(e){this.store.set(\"graphicsMode\",e),this.store.set(\"real_skybox\",(0,h.isRealSkyboxEnabledForMode)(e))}",
                        "setGraphicsMode(e){this.store.set(\"graphicsMode\",\"standard\"),this.store.set(\"real_skybox\",!1)}"
                    );

                    content = content.Replace(
                        "getHighPerformanceEnabled(){return this.store.get(\"high_performance_enabled\",!1)}",
                        "getHighPerformanceEnabled(){return!1}"
                    );
                    content = content.Replace(
                        "setHighPerformanceEnabled(e){this.store.set(\"high_performance_enabled\",e)}",
                        "setHighPerformanceEnabled(e){this.store.set(\"high_performance_enabled\",!1)}"
                    );

                    content = content.Replace(
                        "getShouldClose(){return this.store.get(\"should_close\",!1)}",
                        "getShouldClose(){return!1}"
                    );
                    content = content.Replace(
                        "setShouldClose(e){this.store.set(\"should_close\",e)}",
                        "setShouldClose(e){this.store.set(\"should_close\",!1)}"
                    );
                    content = content.Replace(
                        "case\"shouldCloseOnJoin\":this.settingsStore.setShouldClose(e.value);break",
                        "case\"shouldCloseOnJoin\":this.settingsStore.setShouldClose(!1);break"
                    );
                    content = content.Replace(
                        "this.settingsStore.getShouldClose()&&this.main.hideWindow()",
                        "!1&&this.main.hideWindow()"
                    );
                    content = content.Replace(
                        "hideWindow(){this.window.hide()}",
                        "hideWindow(){}"
                    );
                    content = content.Replace(
                        "case\"graphicsMode\":try{if(this.operationManager.isBusy())",
                        "case\"graphicsMode\":try{if(\"standard\"!==e.mode)return this.main.pushToast(\"Доступна только стандартная графика (SAPatcher)\",\"error\"),!1;if(this.operationManager.isBusy())"
                    );
                    content = content.Replace(
                        "case\"graphicsMode\":if(this.operationManager.isBusy())",
                        "case\"graphicsMode\":if(\"standard\"!==e.mode)return this.main.pushToast(\"Доступна только стандартная графика (SAPatcher)\",\"error\"),!1;if(this.operationManager.isBusy())"
                    );

                    content = content.Replace(
                        "setDefaultGraphics(e){return s(this,void 0,void 0,(function*(){return!1}))}",
                        "setDefaultGraphics(e){return Promise.resolve(!0)}"
                    );
                    content = content.Replace(
                        "setMediumGraphics(e){return s(this,void 0,void 0,(function*(){return!1}))}",
                        "setMediumGraphics(e){return Promise.resolve(!0)}"
                    );
                    content = content.Replace(
                        "checkCurrentGraphics(e,t){return s(this,void 0,void 0,(function*(){return!1}))}",
                        "checkCurrentGraphics(e,t){return Promise.resolve(!0)}"
                    );

                    content = content.Replace(
                        "prepareForPlay(e){if(this.getIsPreparing())",
                        "prepareForPlay(e){return Promise.resolve({status:\"ready\",renderer:\"native\",decisionCode:\"custom_disabled\"})};_orig_prepareForPlay(e){if(this.getIsPreparing())"
                    );

                    content = content.Replace(
                        "recoverInstallation(e){return f(this,void 0,void 0,(function*(){try{if(this.user&&(0,A.isDevModeActive)",
                        "recoverInstallation(e){return Promise.resolve({status:\"ready\"})};_orig_recoverInstallation(e){return f(this,void 0,void 0,(function*(){try{if(this.user&&(0,A.isDevModeActive)"
                    );

                    content = content.Replace(
                        "repairInstalledFiles(e){return f(this,void 0,void 0,(function*(){try{return yield this.repair(e)}",
                        "repairInstalledFiles(e){return Promise.resolve({status:\"ready\"})};_orig_repairInstalledFiles(e){return f(this,void 0,void 0,(function*(){try{return yield this.repair(e)}"
                    );

                    content = content.Replace(
                        "apply(e,t){var i;return f(this,void 0,void 0,(function*(){let n=null,s=null;",
                        "apply(e,t){return Promise.resolve({status:\"completed\",renderer:\"native\"})};_orig_apply(e,t){var i;return f(this,void 0,void 0,(function*(){let n=null,s=null;"
                    );

                    content = content.Replace(
                        "acquirePackage(e,t){if(this.activeWork)return Promise.resolve({status:\"failed\"});",
                        "acquirePackage(e,t){return Promise.resolve({status:\"completed\"})};_orig_acquirePackage(e,t){if(this.activeWork)return Promise.resolve({status:\"failed\"});"
                    );

                    content = content.Replace(
                        "t.applyDxvkLatch=function(e,t){if(!(null==t?void 0:t.latched))return{manifest:e,allBlocked:!1};",
                        "t.applyDxvkLatch=function(e,t){return{manifest:e,allBlocked:!1}};t._orig_applyDxvkLatch=function(e,t){if(!(null==t?void 0:t.latched))return{manifest:e,allBlocked:!1};"
                    );

                    content = content.Replace(
                        "t.isDxvkDllBlocked=function(e,t){if(!(null==e?void 0:e.latched))return!1;",
                        "t.isDxvkDllBlocked=function(e,t){return!1};t._orig_isDxvkDllBlocked=function(e,t){if(!(null==e?void 0:e.latched))return!1;"
                    );

                    content = content.Replace(
                        "t.DXVK_CONFIG=Buffer.from(\"d3d9.countLosableResources = False\\r\\nd3d9.textureMemory = 64\",\"utf8\")",
                        "t.DXVK_CONFIG=Buffer.from(\"# Managed by SAPatcher\\r\\n\",\"utf8\")"
                    );

                    content = content.Replace(
                        "return this.ignoredRelativePaths.has(n)||e.endsWith(\".log\")",
                        "return this.ignoredRelativePaths.has(n)||n.includes(\"d3d9.dll\")||n.includes(\"dxvk.conf\")||n.includes(\"d3d9.dis\")||n.includes(\"sapatcher\")||e.endsWith(\".log\")"
                    );

                    content = content.Replace(
                        "return this.ignoredRelativePaths.has(n)||(0,E.isPreservedGameFile)(t)",
                        "return this.ignoredRelativePaths.has(n)||n.includes(\"d3d9.dll\")||n.includes(\"dxvk.conf\")||n.includes(\"d3d9.dis\")||n.includes(\"sapatcher\")||(0,E.isPreservedGameFile)(t)"
                    );

                    content = content.Replace(
                        "t.isPreservedGameFile=function(e){const t=\"/\"+e.replace(/\\\\/g,\"/\").toLowerCase();return t.endsWith(\".log\")",
                        "t.isPreservedGameFile=function(e){const t=\"/\"+e.replace(/\\\\/g,\"/\").toLowerCase();return t.includes(\"d3d9.dll\")||t.includes(\"dxvk.conf\")||t.includes(\"d3d9.dis\")||t.includes(\"sapatcher\")||t.endsWith(\".log\")"
                    );

                    content = content.Replace(
                        "!t.includes(\"fastload.asi\");",
                        "!t.includes(\"sapatcher\")&&!t.endsWith(\".log\")&&!t.includes(\"dxvk.conf\")&&!t.includes(\"fastload.asi\");"
                    );

                    logs.Add($"[DXVK_CUT] Нативная подсистема DXVK {apiCompatVer} вырезана (скачивание, vkprobe32, d3d9smoke32 и блокировки нейтрализованы).");
                }
                else
                {
                    // 1.2.46 Versioning & Settings Lock
                    content = content.Replace(
                        "f.ipcMain.handle(\"getVersion\",()=>f.app.isPackaged?f.app.getVersion():\"DEV\")",
                        "f.ipcMain.handle(\"getVersion\",()=>\"1.2.46-SAPatcher\")"
                    );

                    content = content.Replace(
                        "{version:c.app.getVersion()}",
                        "{version:\"1.2.46\"}"
                    );

                    content = content.Replace(
                        "i&&(e.news=i),t&&e.servers.forEach(e=>{const i=t.find(t=>Number(t.serverId)===e.id);i&&(e.online=i.online)});",
                        "i&&e&&(e.news=i),t&&e&&Array.isArray(e.servers)&&e.servers.forEach(e=>{const i=t.find(t=>Number(t.serverId)===e.id);i&&(e.online=i.online)});"
                    );

                    content = content.Replace(
                        "getGraphicsMode(){const e=this.store.get(\"graphicsMode\",\"standard\"),t=\"directX_high\"===e?\"directX_med\":e;return(0,h.isGraphicsMode)(t)?t:\"standard\"}",
                        "getGraphicsMode(){return\"standard\"}"
                    );
                    content = content.Replace(
                        "setGraphicsMode(e){this.store.set(\"graphicsMode\",e),this.store.set(\"real_skybox\",(0,h.isRealSkyboxEnabledForMode)(e))}",
                        "setGraphicsMode(e){this.store.set(\"graphicsMode\",\"standard\"),this.store.set(\"real_skybox\",!1)}"
                    );

                    content = content.Replace(
                        "getHighPerformanceEnabled(){return this.store.get(\"high_performance_enabled\",!1)}",
                        "getHighPerformanceEnabled(){return!1}"
                    );
                    content = content.Replace(
                        "setHighPerformanceEnabled(e){this.store.set(\"high_performance_enabled\",e)}",
                        "setHighPerformanceEnabled(e){this.store.set(\"high_performance_enabled\",!1)}"
                    );

                    content = content.Replace(
                        "getShouldClose(){return this.store.get(\"should_close\",!1)}",
                        "getShouldClose(){return!1}"
                    );
                    content = content.Replace(
                        "setShouldClose(e){this.store.set(\"should_close\",e)}",
                        "setShouldClose(e){this.store.set(\"should_close\",!1)}"
                    );
                    content = content.Replace(
                        "case\"shouldCloseOnJoin\":this.settingsStore.setShouldClose(e.value);break",
                        "case\"shouldCloseOnJoin\":this.settingsStore.setShouldClose(!1);break"
                    );
                    content = content.Replace(
                        "this.settingsStore.getShouldClose()&&this.main.hideWindow()",
                        "!1&&this.main.hideWindow()"
                    );
                    content = content.Replace(
                        "hideWindow(){this.window.hide()}",
                        "hideWindow(){}"
                    );
                    content = content.Replace(
                        "case\"graphicsMode\":if(this.operationManager.isBusy())",
                        "case\"graphicsMode\":if(\"standard\"!==e.mode)return this.main.pushToast(\"Доступна только стандартная графика (SAPatcher)\",\"error\"),!1;if(this.operationManager.isBusy())"
                    );

                    content = content.Replace(
                        "setDefaultGraphics(e){return this.updateEnb(e,n.MEDIUM_GRAPHICS_ENB,n.DEFAULT_GRAPHICS_ENB)}",
                        "setDefaultGraphics(e){return Promise.resolve(!0)}"
                    );
                    content = content.Replace(
                        "setMediumGraphics(e){return this.updateEnb(e,n.DEFAULT_GRAPHICS_ENB,n.MEDIUM_GRAPHICS_ENB)}",
                        "setMediumGraphics(e){return Promise.resolve(!0)}"
                    );
                    content = content.Replace(
                        "checkCurrentGraphics(e,t){return s(this,void 0,void 0,(function*(){return t===d.Graphics.DEFAULT?!!(yield(0,c.pathExists)((0,l.join)(e,n.MEDIUM_GRAPHICS_ENB)))&&this.setDefaultGraphics(e):!!(yield(0,c.pathExists)((0,l.join)(e,n.DEFAULT_GRAPHICS_ENB)))&&this.setMediumGraphics(e)}))}",
                        "checkCurrentGraphics(e,t){return Promise.resolve(!0)}"
                    );

                    content = content.Replace(
                        "return this.ignoredRelativePaths.has(n)||e.endsWith(\".log\")",
                        "return this.ignoredRelativePaths.has(n)||n.includes(\"d3d9.dll\")||n.includes(\"dxvk.conf\")||n.includes(\"d3d9.dis\")||n.includes(\"sapatcher\")||e.endsWith(\".log\")"
                    );

                    content = content.Replace(
                        "let i=!t.includes(\"d3d9.dll\")&&!t.includes(\"fastload.asi\");",
                        "let i=!t.includes(\"d3d9.dll\")&&!t.includes(\"dxvk.conf\")&&!t.includes(\"sapatcher\")&&!t.endsWith(\".log\")&&!t.includes(\"fastload.asi\");"
                    );

                    content = content.Replace(
                        "toCachedServers(e){return e.map(e=>{var{host:t,port:i,password:n}=e;return s(e,[\"host\",\"port\",\"password\"])})}}",
                        "toCachedServers(e){return e.map(e=>{var{password:n}=e;return Object.assign(s(e,[\"password\"]),{ip:e.host,host:e.host,port:e.port})})}}"
                    );

                    content = content.Replace(
                        "getSelectedServerIndex(){return this.store.get(\"selected_server\",0)}",
                        "getSelectedServerIndex(){const e=this.store.get(\"selected_server\",0);const t=this.liveServers&&this.liveServers.length>0?this.liveServers:(this.store.get(\"servers\",[])||[]);if(t.length===0)return 0;if(typeof e===\"number\"&&e>=0&&e<t.length)return e;const i=t.findIndex(t=>Number(t.id)===Number(e));return i!==-1?i:0}"
                    );
                    content = content.Replace(
                        "setSelectedServer(e){this.store.set(\"selected_server\",e)}",
                        "setSelectedServer(e){const t=this.liveServers&&this.liveServers.length>0?this.liveServers:(this.store.get(\"servers\",[])||[]);const i=t.findIndex(t=>Number(t.id)===Number(e));this.store.set(\"selected_server\",i!==-1?i:(Number(e)||0))}"
                    );
                    content = content.Replace(
                        "getSelectedServer(){return this.getServers()[this.getSelectedServerIndex()]}",
                        "getSelectedServer(){const e=this.getServers();return e[this.getSelectedServerIndex()]||e[0]||{game_directory_name:\"Motion Project\",server_hash:\"test\"}}"
                    );
                    content = content.Replace(
                        "getSelectedLiveServer(){return this.liveServers[this.getSelectedServerIndex()]}",
                        "getSelectedLiveServer(){return(this.liveServers&&this.liveServers[this.getSelectedServerIndex()])||(this.liveServers&&this.liveServers[0])}"
                    );
                }

                string guard = GuardScript;
                string loggingHarness = SettingsManager.Current.EnableElectronLogging ? GetElectronLoggingScript() : string.Empty;
                string newContent = (!string.IsNullOrWhiteSpace(loggingHarness) ? loggingHarness + "\r\n" : "") +
                                    (!string.IsNullOrWhiteSpace(guard) ? guard + "\r\n" : "") + content;
                File.WriteAllText(mainJsPath, newContent, new UTF8Encoding(false));
                if (SettingsManager.Current.EnableElectronLogging)
                {
                    logs.Add($"[ELECTRON_LOG] Подробное логирование Electron активировано (запись в SAPatcher_Electron.log).");
                }
                if (Guard.GuardManager.IsProprietaryLoaded)
                {
                    logs.Add($"[GUARD] Защитный модуль SAPatcher внедрён в dist/main.js!");
                }
                else
                {
                    logs.Add($"[INTEGRATION] Открытый модуль интеграции SAPatcher внедрён в dist/main.js.");
                }
                logs.Add($"[SETTINGS] Блокировка параметров: доступна только Стандартная графика.");
                logs.Add($"[SETTINGS] Высокая производительность и Авто-закрытие лаунчера отключены.");
                logs.Add($"[FILE_CHECK] Встроенная проверка файлов синхронизирована с DXVK (d3d9.dll / dxvk.conf под защитой).");
            }
            else
            {
                result.Success = false;
                result.Message = $"Файл dist/main.js не найден в {appFolder}";
                logs.Add($"[ERROR] Отсутствует dist/main.js в распакованном лаунчере.");
                return result;
            }

            string[] dxvkConfs = new[]
            {
                Path.Combine(resourcesDir, "dxvk", "dxvk.conf"),
                Path.Combine(appFolder, "dist", "assets", "dxvk", "dxvk.conf")
            };
            foreach (var dxvkConfPath in dxvkConfs)
            {
                if (File.Exists(dxvkConfPath))
                {
                    try
                    {
                        File.WriteAllText(dxvkConfPath, "# Neutralized by SAPatcher - DXVK managed by SAPatcher\r\n", new UTF8Encoding(false));
                        logs.Add($"[DXVK_CONF] Конфигурация {Path.GetFileName(Path.GetDirectoryName(dxvkConfPath))}/dxvk.conf очищена от d3d9.textureMemory = 64.");
                    }
                    catch {}
                }
            }

            SetupAndApplyUiThemes(appFolder, SettingsManager.Current.MotionLauncherUiTheme, logs);

            var manifest = GenerateIntegrityManifest(appFolder, resourcesDir, verInfo.RawVersion);
            logs.Add($"[FINGERPRINT] Сформирован цифровой отпечаток целостности ({manifest.Files.Count} файлов, SHA-256).");
            logs.Add($"[SECURITY] Защита от модификаций активна (двуязычные уведомления RU/EN без утечки белого списка).");
            logs.Add($"[GAME_PROTECT] Защита каталога игры активна: безопасный запуск даже если игра ещё не установлена.");

            CreateDiagnosticLogFiles(launcherDir, appDir, verInfo.RawVersion);
            logs.Add($"[LOG] Диагностические журналы обновлены:");
            logs.Add($"  -> {Path.Combine(launcherDir, "SAPatcher_Motion.log")}");
            logs.Add($"  -> {Path.Combine(launcherDir, "SAPatcher_Diagnostics.log")}");

            result.Success = true;
            if (verInfo.HasCompatibilityWarning)
            {
                result.Message = $"Motion Launcher ({verInfo.RawVersion}) успешно пропатчен в режиме совместимости: нативный DXVK вырезан, настройки зафиксированы, защита активна!";
            }
            else
            {
                result.Message = $"Motion Launcher ({verInfo.RawVersion}) успешно пропатчен: нативный DXVK нейтрализован, настройки зафиксированы, версия {verInfo.RawVersion}-SAPatcher, защита и проверка файлов активны!";
            }
            result.Status = GetStatus(launcherDir);
        }
        catch (Exception ex)
        {
            result.Success = false;
            result.Message = $"Ошибка патчинга: {ex.Message}";
            logs.Add($"[EXCEPTION] {ex.Message}");
            result.Status = GetStatus(preferredDir);
        }

        return result;
    }

    public static PatchExecutionResult RestoreLauncher(string? preferredDir = null)
    {
        var result = new PatchExecutionResult();
        var logs = result.Logs;

        try
        {
            var candidates = GetCandidateLauncherDirs();
            if (candidates.Count == 0)
            {
                result.Success = false;
                result.Message = "Каталог лаунчера не найден.";
                return result;
            }

            string targetInput = candidates[0];
            var (launcherDir, appDir) = ResolveLauncherAndAppDir(targetInput);
            if (string.IsNullOrEmpty(launcherDir)) launcherDir = targetInput;

            logs.Add($"[RESTORE] Восстановление оригинального состояния: {launcherDir}");
            if (string.IsNullOrEmpty(appDir))
            {
                result.Success = false;
                result.Message = "Папка app-* не найдена.";
                return result;
            }

            string resourcesDir = Path.Combine(appDir, "resources");
            string appFolder = Path.Combine(resourcesDir, "app");
            string unpackedFolder = Path.Combine(resourcesDir, "unpacked");
            string asarFile = Path.Combine(resourcesDir, "app.asar");
            string asarBak = Path.Combine(resourcesDir, "app.asar.bak");
            string backupZip = Path.Combine(launcherDir, "Motion_Launcher_Original_Backup.zip");

            if (Directory.Exists(unpackedFolder))
            {
                logs.Add($"[RESTORE] Восстановление всех файлов приложения из чистой копии unpacked...");
                CopyDirectory(unpackedFolder, appFolder);
                logs.Add($"[RESTORE] Файлы приложения resources/app возвращены к первозданному виду.");
            }
            else if (File.Exists(backupZip))
            {
                try
                {
                    string backupDir = Path.Combine(resourcesDir, "original_backup");
                    ZipFile.ExtractToDirectory(backupZip, backupDir, true);
                    string backupMainJs = Path.Combine(backupDir, "main.js.original");
                    string mainJsPath = Path.Combine(appFolder, "dist", "main.js");
                    if (File.Exists(backupMainJs) && File.Exists(mainJsPath))
                    {
                        File.Copy(backupMainJs, mainJsPath, true);
                    }
                    logs.Add($"[RESTORE] Восстановлены файлы из архива бэкапа.");
                }
                catch (Exception ex)
                {
                    logs.Add($"[WARN] Ошибка извлечения бэкапа: {ex.Message}");
                }
            }

            if (File.Exists(asarBak))
            {
                if (File.Exists(asarFile)) File.Delete(asarFile);
                File.Move(asarBak, asarFile);
                logs.Add($"[RESTORE] Восстановлен оригинальный пакет app.asar.");
                if (Directory.Exists(appFolder))
                {
                    try { Directory.Delete(appFolder, true); } catch {}
                    logs.Add($"[RESTORE] Рабочая директория resources/app удалена (активирован официальный app.asar).");
                }
            }

            string manifestFile = Path.Combine(resourcesDir, "integrity.manifest.json");
            if (File.Exists(manifestFile)) File.Delete(manifestFile);
            string appManifest = Path.Combine(appFolder, "integrity.manifest.json");
            if (File.Exists(appManifest)) File.Delete(appManifest);
            string firstRunMarker = Path.Combine(resourcesDir, ".first_launch_done");
            if (File.Exists(firstRunMarker)) File.Delete(firstRunMarker);
            logs.Add($"[RESTORE] Цифровой отпечаток целостности и маркеры запуска сброшены.");

            result.Success = true;
            result.Message = "Оригинальное состояние Motion Launcher успешно восстановлено.";
            result.Status = GetStatus(launcherDir);
        }
        catch (Exception ex)
        {
            result.Success = false;
            result.Message = $"Ошибка восстановления: {ex.Message}";
            logs.Add($"[EXCEPTION] {ex.Message}");
            result.Status = GetStatus(preferredDir);
        }

        return result;
    }

    public static IntegrityManifest GenerateIntegrityManifest(string appFolder, string resourcesDir, string detectedVer = "2.0.0")
    {
        var manifest = new IntegrityManifest
        {
            Version = $"{detectedVer}-SAPatcher"
        };
        if (!Directory.Exists(appFolder)) return manifest;

        using var sha256 = System.Security.Cryptography.SHA256.Create();
        var files = Directory.GetFiles(appFolder, "*", SearchOption.AllDirectories);

        foreach (var file in files)
        {
            string rel = Path.GetRelativePath(appFolder, file).Replace('\\', '/');
            string fileName = Path.GetFileName(file);

            if (fileName.EndsWith(".log", StringComparison.OrdinalIgnoreCase) ||
                fileName.Equals("integrity.manifest.json", StringComparison.OrdinalIgnoreCase) ||
                fileName.Equals(".first_launch_done", StringComparison.OrdinalIgnoreCase) ||
                fileName.Equals("d3d9.dll", StringComparison.OrdinalIgnoreCase) ||
                fileName.Equals("dxvk.conf", StringComparison.OrdinalIgnoreCase) ||
                fileName.Equals("d3d9.dis", StringComparison.OrdinalIgnoreCase))
            {
                continue;
            }

            var fi = new FileInfo(file);
            var entry = new IntegrityManifestEntry { Size = fi.Length };

            if (rel.StartsWith("dist/", StringComparison.OrdinalIgnoreCase) || rel.Equals("package.json", StringComparison.OrdinalIgnoreCase))
            {
                try
                {
                    using var stream = File.OpenRead(file);
                    byte[] hashBytes = sha256.ComputeHash(stream);
                    entry.Hash = Convert.ToHexString(hashBytes).ToLowerInvariant();
                }
                catch {}
            }

            manifest.Files[rel] = entry;
        }

        string json = System.Text.Json.JsonSerializer.Serialize(manifest, new System.Text.Json.JsonSerializerOptions { WriteIndented = true });
        File.WriteAllText(Path.Combine(resourcesDir, "integrity.manifest.json"), json, new UTF8Encoding(false));
        File.WriteAllText(Path.Combine(appFolder, "integrity.manifest.json"), json, new UTF8Encoding(false));

        string firstRunMarker = Path.Combine(resourcesDir, ".first_launch_done");
        if (File.Exists(firstRunMarker)) File.Delete(firstRunMarker);

        return manifest;
    }

    public static (bool Success, string Message) SwitchLauncherUiTheme(string? targetDir, string theme)
    {
        var candidates = GetCandidateLauncherDirs();
        if (!string.IsNullOrEmpty(targetDir))
        {
            string t = targetDir.Trim().Trim('"', '\'');
            if (Directory.Exists(t) || File.Exists(t)) candidates.Insert(0, t);
        }

        foreach (var c in candidates)
        {
            var (launcherDir, appDir) = ResolveLauncherAndAppDir(c);
            if (!string.IsNullOrEmpty(appDir))
            {
                string appFolder = Path.Combine(appDir, "resources", "app");
                if (Directory.Exists(appFolder))
                {
                    return SetupAndApplyUiThemes(appFolder, theme);
                }
            }
        }

        return (false, "Рабочая директория resources/app лаунчера не найдена.");
    }

    public static (bool Success, string Message) SetupAndApplyUiThemes(string appFolder, string requestedTheme, List<string>? logs = null)
    {
        try
        {
            string distDir = Path.Combine(appFolder, "dist");
            string browserDir = Path.Combine(distDir, "browser");
            string browserV1 = Path.Combine(distDir, "browser_v1");
            string browserV2 = Path.Combine(distDir, "browser_v2");
            string browserMetro = Path.Combine(distDir, "browser_metro");
            string browserSapatcher = Path.Combine(distDir, "browser_sapatcher");

            if (!Directory.Exists(browserV2) && Directory.Exists(browserDir))
            {
                string v2Marker = Path.Combine(browserDir, "main.1ee933179b6e07ee7c53.js");
                if (File.Exists(v2Marker) || !File.Exists(Path.Combine(browserDir, "styles.62465b4dbe8c685081f9.css")))
                {
                    CopyDirectory(browserDir, browserV2);
                    logs?.Add("[THEME] Современный интерфейс v2.0.0 зафиксирован в dist/browser_v2");
                }
            }

            if (!Directory.Exists(browserV1))
            {
                string[] v1Candidates = new[]
                {
                    @"C:\games\app-1.2.46 — копия\resources\app\dist\browser",
                    Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "motion", "app-1.2.46", "resources", "app", "dist", "browser"),
                    @"f:\project\SAPatcher\motion\app-1.2.46\resources\app\dist\browser",
                    Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "motion-launcher", "app-1.2.46", "resources", "app", "dist", "browser")
                };

                string? foundV1 = v1Candidates.FirstOrDefault(Directory.Exists);
                if (!string.IsNullOrEmpty(foundV1))
                {
                    CopyDirectory(foundV1, browserV1);
                    logs?.Add($"[THEME] Классический интерфейс v1.2.46 успешно скопирован из {foundV1} в dist/browser_v1");
                }
                else
                {
                    logs?.Add("[WARN] Каталог классического интерфейса v1.2.46 не найден на диске.");
                }
            }

            if (!Directory.Exists(browserMetro))
            {
                string[] metroCandidates = new[]
                {
                    @"f:\project\SAPatcher\themes\browser_metro",
                    Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "themes", "browser_metro"),
                    Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "browser_metro")
                };
                string? foundMetro = metroCandidates.FirstOrDefault(Directory.Exists);
                if (!string.IsNullOrEmpty(foundMetro))
                {
                    CopyDirectory(foundMetro, browserMetro);
                    logs?.Add($"[THEME] Windows 8 Metro UI скопирован в dist/browser_metro");
                }
            }

            if (!Directory.Exists(browserSapatcher))
            {
                string[] sapCandidates = new[]
                {
                    @"f:\project\SAPatcher\themes\browser_sapatcher",
                    Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "themes", "browser_sapatcher"),
                    Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "browser_sapatcher")
                };
                string? foundSap = sapCandidates.FirstOrDefault(Directory.Exists);
                if (!string.IsNullOrEmpty(foundSap))
                {
                    CopyDirectory(foundSap, browserSapatcher);
                    logs?.Add($"[THEME] SAPatcher Cyber Glass UI скопирован в dist/browser_sapatcher");
                }
            }

            if (Directory.Exists(browserV2))
            {
                PatchBrowserDirBundle(browserV2, "2.0.0", logs);
            }
            if (Directory.Exists(browserV1))
            {
                PatchBrowserDirBundle(browserV1, "1.2.46", logs);
            }

            string themeNorm = (requestedTheme ?? "v2").Trim().ToLowerInvariant() switch
            {
                "v1" => "v1",
                "metro" => "metro",
                "sapatcher" => "sapatcher",
                _ => "v2"
            };

            string targetThemeDir = themeNorm switch
            {
                "v1" when Directory.Exists(browserV1) => browserV1,
                "metro" when Directory.Exists(browserMetro) => browserMetro,
                "sapatcher" when Directory.Exists(browserSapatcher) => browserSapatcher,
                _ => Directory.Exists(browserV2) ? browserV2 : (Directory.Exists(browserMetro) ? browserMetro : browserDir)
            };

            string themeDisplayName = themeNorm switch
            {
                "v1" => "Классический (v1.2.46)",
                "metro" => "Windows 8 Live Tiles (Metro UI)",
                "sapatcher" => "SAPatcher Cyberpunk Glass Dark",
                _ => "Современный (v2.0.0)"
            };

            if (Directory.Exists(targetThemeDir))
            {
                if (Directory.Exists(browserDir))
                {
                    try { Directory.Delete(browserDir, true); } catch {}
                }
                CopyDirectory(targetThemeDir, browserDir);

                string uiThemeMarker = Path.Combine(appFolder, "ui_theme.txt");
                File.WriteAllText(uiThemeMarker, themeNorm, new UTF8Encoding(false));
                logs?.Add($"[THEME] Активный интерфейс лаунчера: {themeDisplayName}");
                return (true, $"Интерфейс лаунчера успешно переключен на {themeDisplayName}");
            }

            return (false, "Не удалось найти директорию выбранной темы интерфейса.");
        }
        catch (Exception ex)
        {
            logs?.Add($"[THEME_ERROR] {ex.Message}");
            return (false, $"Ошибка переключения темы: {ex.Message}");
        }
    }

    private static void PatchBrowserDirBundle(string targetBrowserDir, string version, List<string>? logs)
    {
        if (!Directory.Exists(targetBrowserDir)) return;
        var jsFiles = Directory.GetFiles(targetBrowserDir, "main.*.js", SearchOption.TopDirectoryOnly);
        foreach (var jsPath in jsFiles)
        {
            try
            {
                string bContent = File.ReadAllText(jsPath, Encoding.UTF8);

                const string origGraphics1 = "onGraphicsCardClick(t){this.highPerformanceEnabled&&\"standard\"!==t?this._toastService.push(\"error\",this.graphicsHighPerformanceError):t!==this.currentGraphicsMode?(this.expandedGraphicsCard=t,this.setGraphicsMode(t)):this.collapseGraphicsCard()}";
                const string origGraphics2 = "onGraphicsCardClick(t){this.graphicsSavePending||(t!==this.currentGraphicsMode?(this.expandedGraphicsCard=t,this.setGraphicsMode(t)):this.collapseGraphicsCard())}";
                const string newGraphics = "onGraphicsCardClick(t){if(t!==\"standard\"){try{if(this.toastService)this.toastService.push(\"error\",\"Доступна только стандартная графика (SAPatcher)\");else if(this._toastService)this._toastService.push(\"error\",\"Доступна только стандартная графика (SAPatcher)\");}catch(e){}return;}this.expandedGraphicsCard=\"standard\";this.setGraphicsMode(\"standard\");}";

                bContent = bContent.Replace(origGraphics1, newGraphics);
                bContent = bContent.Replace(origGraphics2, newGraphics);

                if (bContent.Contains("confirmGraphicsMode(t){"))
                {
                    bContent = bContent.Replace(
                        "confirmGraphicsMode(t){this.onGraphicsCardClick(t)",
                        "confirmGraphicsMode(t){if(t!==\"standard\"){try{if(this.toastService)this.toastService.push(\"error\",\"Доступна только стандартная графика (SAPatcher)\");else if(this._toastService)this._toastService.push(\"error\",\"Доступна только стандартная графика (SAPatcher)\");}catch(e){}return;}this.onGraphicsCardClick(t)"
                    );
                }

                if (bContent.Contains("saveGraphicsMode(){"))
                {
                    bContent = bContent.Replace(
                        "saveGraphicsMode(){if(this.highPerformanceEnabled&&\"standard\"!==this.graphicsMode)return this._toastService.push(\"error\",this.graphicsHighPerformanceError);",
                        "saveGraphicsMode(){if(this.graphicsMode!==\"standard\"){try{this._toastService.push(\"error\",\"Доступна только стандартная графика (SAPatcher)\");}catch(e){}return;}"
                    );
                    bContent = bContent.Replace(
                        "saveGraphicsMode(){if(this.highPerformanceEnabled",
                        "saveGraphicsMode(){if(this.graphicsMode!==\"standard\"){try{this._toastService.push(\"error\",\"Доступна только стандартная графика (SAPatcher)\");}catch(e){}return;}if(this.highPerformanceEnabled"
                    );
                }

                const string origChecked = "onChecked(t){let e;switch(t){case\"shouldCloseOnJoin\":";
                const string newChecked = "onChecked(t){if(t!==\"wideScreenFix\"){try{if(this.toastService)this.toastService.push(\"info\",\"Параметр заблокирован: лаунчер всегда остаётся открытым\");else if(this._toastService)this._toastService.push(\"info\",\"Параметр заблокирован: лаунчер всегда остаётся открытым\");}catch(e){}return;}let e;switch(t){case\"shouldCloseOnJoin\":";
                bContent = bContent.Replace(origChecked, newChecked);

                bContent = bContent.Replace(
                    "syncLocalStateWithService(){var t,e,n;if(!this._service.data)return;",
                    "syncLocalStateWithService(){var t,e,n;if(!this._service.data)return;this.shouldCloseOnJoin=false;this.highPerformanceEnabled=false;this.isRunnableAsAdmin=false;this.isdevModeToggle=false;"
                );

                File.WriteAllText(jsPath, bContent, new UTF8Encoding(false));
                logs?.Add($"[UI] Пакет интерфейса {version} ({Path.GetFileName(jsPath)}) защищён (только стандартная графика, запрет сворачивания).");
            }
            catch (Exception ex)
            {
                logs?.Add($"[WARN] Ошибка патчинга {Path.GetFileName(jsPath)}: {ex.Message}");
            }
        }

        string htmlPath = Path.Combine(targetBrowserDir, "index.html");
        if (File.Exists(htmlPath))
        {
            try
            {
                string html = File.ReadAllText(htmlPath, Encoding.UTF8);
                const string css = @"<style>
.graphics-option:not(:first-child),
article.graphics-card:not(:first-child),
section div article:not(:first-child) button,
.settings-options-column:nth-of-type(1) .settings-group-section-check:nth-of-type(2),
.settings-options-column:nth-of-type(2) .settings-group-section-check:nth-of-type(1) {
    opacity: 0.42 !important;
    cursor: not-allowed !important;
    pointer-events: none !important;
    filter: grayscale(0.8) !important;
}
</style></head>";
                if (!html.Contains("settings-options-column:nth-of-type(1)"))
                {
                    html = html.Replace("</head>", css);
                    File.WriteAllText(htmlPath, html, new UTF8Encoding(false));
                }
            }
            catch {}
        }
    }

    private static void CreateDiagnosticLogFiles(string launcherDir, string appDir, string detectedVer = "2.0.0")
    {
        try
        {
            string now = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss");
            string motionLog = Path.Combine(launcherDir, "SAPatcher_Motion.log");
            string diagLog = Path.Combine(launcherDir, "SAPatcher_Diagnostics.log");

            string initialLog = $"[{now}] SAPatcher Guard -> PATCH INSTALLED | Status: PROTECTED | Version: {detectedVer}-SAPatcher | Target: {appDir}\r\n";
            File.AppendAllText(motionLog, initialLog, Encoding.UTF8);

            string diagContent = $@"================================================================================
                  SAPATCHER RUNTIME SECURITY & DIAGNOSTICS LOG
================================================================================
Created:          {now}
Launcher:         Motion Project Launcher (app-{detectedVer}-SAPatcher)
Launcher Path:    {Path.Combine(launcherDir, "Motion Launcher.exe")}
App Directory:    {appDir}
Daemon Port:      49742
Protection:       STRICT (Launch disallowed if SAPatcher daemon is offline)
Popup Widget:     5.0 Seconds Centered Floating Relay Glassmorphism Widget
Backup Archive:   {Path.Combine(launcherDir, "Motion_Launcher_Original_Backup.zip")}
Locked Graphics:  Standard Graphics (Low) Enforced
Allowed Switches: Widescreen Fix (Enabled/User controllable)
Locked Switches:  High Performance (OFF), Auto-close Launcher (OFF)
DXVK Subsystem:   Native DXVK neutralized & sanitized (no buggy downloads/latching/textureMemory=64)
File Check:       Full DXVK Harmony (d3d9.dll / dxvk.conf protected from deletion/overwriting)
Game Protection:  Game directory guarded against foreign injector executables
================================================================================
";
            File.WriteAllText(diagLog, diagContent, Encoding.UTF8);

            if (Directory.Exists(appDir))
            {
                File.AppendAllText(Path.Combine(appDir, "SAPatcher_Motion.log"), initialLog, Encoding.UTF8);
                File.WriteAllText(Path.Combine(appDir, "SAPatcher_Diagnostics.log"), diagContent, Encoding.UTF8);
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[LauncherPatcherService] Log creation error: {ex.Message}");
        }
    }

    private static void CopyDirectory(string sourceDir, string destinationDir)
    {
        var dir = new DirectoryInfo(sourceDir);
        if (!dir.Exists) throw new DirectoryNotFoundException($"Source directory not found: {dir.FullName}");

        Directory.CreateDirectory(destinationDir);

        foreach (FileInfo file in dir.GetFiles())
        {
            string targetFilePath = Path.Combine(destinationDir, file.Name);
            file.CopyTo(targetFilePath, true);
        }

        foreach (DirectoryInfo subDir in dir.GetDirectories())
        {
            string newDestinationDir = Path.Combine(destinationDir, subDir.Name);
            CopyDirectory(subDir.FullName, newDestinationDir);
        }
    }

    [System.Runtime.InteropServices.DllImport("imagehlp.dll", SetLastError = true, CharSet = System.Runtime.InteropServices.CharSet.Unicode)]
    private static extern uint MapFileAndCheckSumW(string filename, out uint headerSum, out uint checkSum);

    public static string? DetectGamePathFromLauncher(string? launcherExeOrDir = null)
    {
        var candidates = new List<string>();

        string appData = Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData);
        string localAppData = Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData);
        string userProfile = Environment.GetFolderPath(Environment.SpecialFolder.UserProfile);

        var configPaths = new List<string>
        {
            Path.Combine(appData, "motion-launcher", "config.json"),
            Path.Combine(localAppData, "motion-launcher", "config.json"),
            Path.Combine(userProfile, ".motion-launcher", "config.json")
        };

        if (!string.IsNullOrWhiteSpace(launcherExeOrDir))
        {
            string dir = File.Exists(launcherExeOrDir) ? Path.GetDirectoryName(launcherExeOrDir)! : launcherExeOrDir;
            if (Directory.Exists(dir))
            {
                configPaths.Add(Path.Combine(dir, "config.json"));
                string? parent = Path.GetDirectoryName(dir);
                if (!string.IsNullOrEmpty(parent) && Directory.Exists(parent))
                {
                    configPaths.Add(Path.Combine(parent, "config.json"));
                }
            }
        }

        foreach (var cfg in configPaths)
        {
            try
            {
                if (File.Exists(cfg))
                {
                    string raw = File.ReadAllText(cfg);
                    using var doc = System.Text.Json.JsonDocument.Parse(raw);

                    if (doc.RootElement.TryGetProperty("applied_graphics_modes", out var agm) && agm.ValueKind == System.Text.Json.JsonValueKind.Object)
                    {
                        foreach (var prop in agm.EnumerateObject())
                        {
                            string p = prop.Name.Replace('/', '\\').Trim();
                            if (Directory.Exists(p))
                            {
                                candidates.Add(p);
                            }
                        }
                    }

                    if (doc.RootElement.TryGetProperty("path", out var pElem))
                    {
                        string p = (pElem.GetString() ?? "").Replace('/', '\\').Trim();
                        if (!string.IsNullOrWhiteSpace(p))
                        {
                            string subMp = Path.Combine(p, "Motion Project");
                            if (Directory.Exists(subMp)) candidates.Add(subMp);
                            if (Directory.Exists(p)) candidates.Add(p);
                        }
                    }
                }
            }
            catch {}
        }

        candidates.AddRange(new[]
        {
            @"C:\games\motion\Motion Project",
            @"C:\games\motion",
            @"D:\games\motion\Motion Project",
            @"D:\games\motion",
            @"E:\games\motion\Motion Project",
            @"E:\games\motion"
        });

        foreach (var c in candidates)
        {
            if (Directory.Exists(c))
            {
                if (File.Exists(Path.Combine(c, "motion.exe")) || File.Exists(Path.Combine(c, "samp.exe")))
                {
                    return c;
                }
                string subMp = Path.Combine(c, "Motion Project");
                if (Directory.Exists(subMp) && (File.Exists(Path.Combine(subMp, "motion.exe")) || File.Exists(Path.Combine(subMp, "samp.exe"))))
                {
                    return subMp;
                }
            }
        }

        return candidates.FirstOrDefault(Directory.Exists);
    }

    public static string ResolveCustomGamePath(string rawPath)
    {
        if (string.IsNullOrWhiteSpace(rawPath)) return string.Empty;
        string p = rawPath.Trim().Trim('"', '\'').Replace('/', '\\');
        if (File.Exists(p)) p = Path.GetDirectoryName(p) ?? p;

        if (Directory.Exists(p))
        {
            string subMp = Path.Combine(p, "Motion Project");
            if (Directory.Exists(subMp) && (File.Exists(Path.Combine(subMp, "motion.exe")) || !File.Exists(Path.Combine(p, "motion.exe"))))
            {
                return subMp;
            }
            return p;
        }

        return p;
    }

    public static string? ResolveGamePath(string? preferredPath = null)
    {
        string? gameDir = null;

        if (!string.IsNullOrWhiteSpace(preferredPath))
        {
            string p = preferredPath.Trim().Trim('"', '\'').Replace('/', '\\');
            if (File.Exists(p)) p = Path.GetDirectoryName(p) ?? p;

            if (Directory.Exists(p))
            {
                string subMp = Path.Combine(p, "Motion Project");
                if (Directory.Exists(subMp) && (File.Exists(Path.Combine(subMp, "motion.exe")) || !File.Exists(Path.Combine(p, "motion.exe"))))
                {
                    gameDir = subMp;
                }
                else
                {
                    gameDir = p;
                }
            }
        }

        if (string.IsNullOrEmpty(gameDir) && !string.IsNullOrWhiteSpace(SettingsManager.Current.MotionGamePath))
        {
            string p = SettingsManager.Current.MotionGamePath.Trim().Replace('/', '\\');
            if (Directory.Exists(p))
            {
                string subMp = Path.Combine(p, "Motion Project");
                if (Directory.Exists(subMp) && (File.Exists(Path.Combine(subMp, "motion.exe")) || !File.Exists(Path.Combine(p, "motion.exe"))))
                {
                    gameDir = subMp;
                }
                else
                {
                    gameDir = p;
                }
            }
            else
            {
                gameDir = p;
            }
        }

        if (string.IsNullOrEmpty(gameDir))
        {
            gameDir = DetectGamePathFromLauncher();
        }

        return !string.IsNullOrEmpty(gameDir) && Directory.Exists(gameDir) ? gameDir : null;
    }

    public static bool CheckLaa(string exePath)
    {
        if (!File.Exists(exePath)) return false;
        try
        {
            using var fs = File.OpenRead(exePath);
            using var r = new BinaryReader(fs);
            fs.Seek(0x3C, SeekOrigin.Begin);
            int peOffset = r.ReadInt32();
            fs.Seek(peOffset + 22, SeekOrigin.Begin);
            ushort chars = r.ReadUInt16();
            return (chars & 0x0020) != 0;
        }
        catch
        {
            return false;
        }
    }

    private static List<string> GetGameFiles(string gameDir)
    {
        var res = new List<string>();
        if (!Directory.Exists(gameDir)) return res;

        foreach (var file in Directory.EnumerateFiles(gameDir, "*", SearchOption.AllDirectories))
        {
            string rel = Path.GetRelativePath(gameDir, file).Replace('\\', '/');
            string normRel = rel.ToLowerInvariant();
            string lower = Path.GetFileName(file).ToLowerInvariant();

            if (normRel.StartsWith("cef/library/cache/") || normRel == "cef/library/cache" ||
                normRel.StartsWith("motion/screens/") || normRel == "motion/screens" ||
                normRel.StartsWith("screens/") || normRel == "screens" ||
                lower.EndsWith(".log") ||
                lower.EndsWith(".backup") ||
                lower.EndsWith(".bak") ||
                lower.EndsWith(".dmp") ||
                lower.EndsWith(".tmp") ||
                lower == "dxvk.conf" ||
                lower == "d3d9.dll" ||
                lower == "d3d9.dis" ||
                lower == "game.integrity.manifest.json" ||
                lower == "crashhandler.exe" ||
                lower == "chatlog.txt" ||
                lower == "sa-mp.cfg" ||
                lower == "gta_sa.set")
            {
                continue;
            }

            res.Add(rel);
        }
        return res;
    }

    public static GameIntegrityCheckResult CheckGameFolderIntegrity(string? preferredPath = null)
    {
        var result = new GameIntegrityCheckResult();
        string? gameDir = ResolveGamePath(preferredPath);

        if (string.IsNullOrEmpty(gameDir) || !Directory.Exists(gameDir))
        {
            result.Installed = false;
            result.Clean = true;
            result.Message = "Папка игры ещё не обнаружена (игра не установлена или лаунчер ещё не запускался).";
            return result;
        }

        result.GamePath = gameDir;
        result.Installed = true;

        var allowedExes = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
        {
            "gta_sa.exe", "motion.exe", "samp.exe", "unins000.exe", "uninstall.exe", "motion_updater.exe", "crashhandler.exe"
        };

        var exeFiles = Directory.GetFiles(gameDir, "*.exe", SearchOption.TopDirectoryOnly);
        foreach (var exe in exeFiles)
        {
            string fileName = Path.GetFileName(exe);
            if (allowedExes.Contains(fileName))
            {
                result.AuthorizedExes.Add(fileName);
            }
            else
            {
                result.ForeignExes.Add(fileName);
            }
        }

        string motionExe = Path.Combine(gameDir, "motion.exe");
        string sampExe = Path.Combine(gameDir, "samp.exe");
        string gtaExe = Path.Combine(gameDir, "gta_sa.exe");
        string mainTargetExe = File.Exists(motionExe) ? motionExe : (File.Exists(gtaExe) ? gtaExe : "");

        if (!string.IsNullOrEmpty(mainTargetExe))
        {
            var fi = new FileInfo(mainTargetExe);
            result.MainExe = Path.GetFileName(mainTargetExe);
            result.MainExeSize = fi.Length;
        }

        result.LaaMotionEnabled = CheckLaa(motionExe);
        result.LaaSampEnabled = CheckLaa(sampExe);
        result.LaaEnabled = result.LaaMotionEnabled && result.LaaSampEnabled;

        if (SAPatcher.Guard.GuardManager.IsDeveloperModeActive)
        {
            result.Clean = true;
            result.D3D9MatchesKnownDxvk = true;
            result.Message = "Режим разработчика активен: проверки целостности игры отключены для авторизованного оборудования (MPG B550 GAMING PLUS).";
            return result;
        }

        string d3d9File = Path.Combine(gameDir, "d3d9.dll");
        result.D3D9Exists = File.Exists(d3d9File);
        if (result.D3D9Exists)
        {
            var fi = new FileInfo(d3d9File);
            result.D3D9Size = fi.Length;

            var dxvkMap = new Dictionary<long, string>
            {
                [3305486] = "DXVK 1.10.3 (32-bit)",
                [3858446] = "DXVK 2.3 (32-bit)",
                [7786510] = "DXVK 3.0 (32-bit)",
                [7856142] = "DXVK 3.1.1 (32-bit)",
                [7868416] = "DXVK 3.1.1 (32-bit)",
                [7884800] = "DXVK 3.1.1 (32-bit)",
                [7864320] = "DXVK 3.1.1 (32-bit)"
            };

            if (dxvkMap.TryGetValue(fi.Length, out var detectedVer))
            {
                result.D3D9VersionDetected = detectedVer;
                result.D3D9MatchesKnownDxvk = true;
            }
            else
            {
                result.D3D9VersionDetected = "Неизвестная версия (" + fi.Length + " Б)";
                result.D3D9MatchesKnownDxvk = false;
            }
        }

        result.DxvkConfExists = File.Exists(Path.Combine(gameDir, "dxvk.conf"));

        string manifestFile = Path.Combine(gameDir, "game.integrity.manifest.json");
        result.ManifestExists = File.Exists(manifestFile);

        if (result.ManifestExists)
        {
            try
            {
                string raw = File.ReadAllText(manifestFile, Encoding.UTF8);
                var manifest = System.Text.Json.JsonSerializer.Deserialize<IntegrityManifest>(raw, new System.Text.Json.JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                if (manifest != null && manifest.Files != null)
                {
                    result.ManifestFilesCount = manifest.Files.Count;
                    var currentFiles = GetGameFiles(gameDir);
                    var scannedSet = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

                    using var sha = System.Security.Cryptography.SHA256.Create();

                    foreach (var cur in currentFiles)
                    {
                        scannedSet.Add(cur);
                        if (!manifest.Files.TryGetValue(cur, out var exp))
                        {
                            result.ForeignFiles.Add(cur);
                        }
                        else
                        {
                            string fullPath = Path.Combine(gameDir, cur);
                            var fi = new FileInfo(fullPath);
                            if (fi.Length != exp.Size)
                            {
                                result.CorruptedFiles.Add($"{cur} (размер: {fi.Length} Б != {exp.Size} Б)");
                            }
                            else if (!string.IsNullOrEmpty(exp.Hash))
                            {
                                try
                                {
                                    using var s = File.OpenRead(fullPath);
                                    string h = Convert.ToHexString(sha.ComputeHash(s)).ToLowerInvariant();
                                    if (!string.Equals(h, exp.Hash, StringComparison.OrdinalIgnoreCase))
                                    {
                                        bool isLegitLaa = false;
                                        if (cur.Equals("motion.exe", StringComparison.OrdinalIgnoreCase) ||
                                            cur.Equals("samp.exe", StringComparison.OrdinalIgnoreCase) ||
                                            cur.Equals("gta_sa.exe", StringComparison.OrdinalIgnoreCase))
                                        {
                                            string bPath = fullPath + ".Backup";
                                            if (File.Exists(bPath))
                                            {
                                                try
                                                {
                                                    using var bs = File.OpenRead(bPath);
                                                    string bh = Convert.ToHexString(sha.ComputeHash(bs)).ToLowerInvariant();
                                                    if (string.Equals(bh, exp.Hash, StringComparison.OrdinalIgnoreCase))
                                                    {
                                                        isLegitLaa = true;
                                                    }
                                                }
                                                catch {}
                                            }
                                            if (!isLegitLaa && CheckLaa(fullPath))
                                            {
                                                isLegitLaa = true;
                                            }
                                        }

                                        if (!isLegitLaa)
                                        {
                                            result.CorruptedFiles.Add($"{cur} (контрольная сумма не совпадает)");
                                        }
                                    }
                                }
                                catch {}
                            }
                        }
                    }

                    foreach (var expRel in manifest.Files.Keys)
                    {
                        if (!scannedSet.Contains(expRel))
                        {
                            result.MissingFiles.Add(expRel);
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                result.Message = "Ошибка верификации отпечатка игры: " + ex.Message;
            }
        }

        if (!ValidateGameFolderForAntiCheat(gameDir, out var acViolations) && acViolations.Count > 0)
        {
            foreach (var v in acViolations)
            {
                if (!result.ForeignFiles.Contains(v))
                {
                    result.ForeignFiles.Add(v);
                }
            }
        }

        bool hasForeignFiles = result.ForeignFiles.Count > 0;
        bool hasCorruptedFiles = result.CorruptedFiles.Count > 0;
        bool hasMissingFiles = result.MissingFiles.Count > 0;
        bool exesClean = result.ForeignExes.Count == 0;
        bool d3d9Clean = !result.D3D9Exists || result.D3D9MatchesKnownDxvk;

        result.Clean = exesClean && d3d9Clean && !hasForeignFiles && !hasCorruptedFiles && !hasMissingFiles;

        var issues = new List<string>();
        if (result.ForeignExes.Count > 0)
            issues.Add($"Посторонние исполняемые файлы: {string.Join(", ", result.ForeignExes)}");
        if (result.D3D9Exists && !result.D3D9MatchesKnownDxvk)
            issues.Add($"Размер d3d9.dll ({result.D3D9Size} Б) не соответствует официальным версиям DXVK 32-бит");
        if (hasForeignFiles)
            issues.Add($"Обнаружены сторонние файлы/DLL ({result.ForeignFiles.Count} шт.): {string.Join(", ", result.ForeignFiles.Take(5))}{(result.ForeignFiles.Count > 5 ? "..." : "")}");
        if (hasCorruptedFiles)
            issues.Add($"Повреждены файлы игры ({result.CorruptedFiles.Count} шт.): {string.Join(", ", result.CorruptedFiles.Take(3))}");
        if (hasMissingFiles)
            issues.Add($"Отсутствуют обязательные файлы ({result.MissingFiles.Count} шт.): {string.Join(", ", result.MissingFiles.Take(3))}");

        if (issues.Count > 0)
        {
            result.Message = "Обнаружены нарушения: " + string.Join("; ", issues);
        }
        else if (!result.ManifestExists)
        {
            result.Message = "Папка игры в порядке (белый список .exe чист, DXVK соответствует). Отпечаток файлов ещё не создан.";
        }
        else
        {
            result.Message = $"Папка игры защищена: отпечаток подтверждён ({result.ManifestFilesCount} файлов), посторонние DLL и файлы отсутствуют.";
        }

        return result;
    }

    public static readonly HashSet<string> AllowedRootAsis = new(StringComparer.OrdinalIgnoreCase)
    {
        "!clientside-api.asi", "cef.asi", "fastman92limitadjuster.asi", "flickr.asi",
        "jemalloc.asi", "mixsets.asi", "mousefix.asi", "normalmapfix.asi",
        "normalmap_bydk.asi", "opendooranim.asi", "outfitfix.asi", "ps2shads.asi",
        "realskybox.sa.asi", "refreshratefixbydarkp1xel32.asi", "sampgraphicrestore.asi", "streammemfix.asi"
    };

    public static readonly HashSet<string> AllowedRootDlls = new(StringComparer.OrdinalIgnoreCase)
    {
        "bass.dll", "bass_fx.dll", "d3d9.dll", "dlltricks.dll", "eax.dll",
        "minhook.x86.dll", "msvcr100d.dll", "ogg.dll", "samp.dll",
        "vorbis.dll", "vorbisfile.dll", "vorbishooked.dll", "zlib1.dll"
    };

    public static readonly HashSet<string> AllowedRootExes = new(StringComparer.OrdinalIgnoreCase)
    {
        "motion.exe", "samp.exe", "gta_sa.exe", "unins000.exe", "uninstall.exe", "motion_updater.exe", "crashhandler.exe"
    };

    public static readonly HashSet<long> KnownDxvk32BitSizes = new()
    {
        3305486,
        3858446,
        7786510,
        7856142,
        7868416,
        7884800,
        7864320
    };

    public static readonly string[] ForbiddenDirs = new[]
    {
        "cleo", "cleo_text", "cleo_audio", "cleo_saves", "moonloader", "sampfuncs",
        "modloader", "cheats", "hacks", "ultrafuck", "ultra-fuck", "sobeit"
    };

    public static readonly string[] ForbiddenExts = new[]
    {
        ".cs", ".sf", ".lua", ".luac", ".cleo", ".ahk", ".injector", ".inject"
    };

    public static readonly string[] SuspiciousCheatKeywords = new[]
    {
        "sobeit", "aimbot", "silentaim", "ultrafuck", "ultra-fuck", "stealth",
        "airbreak", "godmode", "damager", "norecoil", "speedhack", "raknet",
        "anticrasher", "wallhack"
    };

    public static bool ValidateGameFolderForAntiCheat(string gameDir, out List<string> violations)
    {
        violations = new List<string>();
        if (SAPatcher.Guard.GuardManager.IsDeveloperModeActive)
        {
            return true;
        }

        if (!Directory.Exists(gameDir))
        {
            violations.Add($"Папка игры не найдена: {gameDir}");
            return false;
        }

        try
        {
            var allSubDirs = Directory.GetDirectories(gameDir, "*", SearchOption.AllDirectories);
            foreach (var dir in allSubDirs)
            {
                string relDir = Path.GetRelativePath(gameDir, dir).Replace('\\', '/').ToLowerInvariant();
                if (relDir == "data/script" || relDir.StartsWith("data/script/") ||
                    relDir == "cef/library/cache" || relDir.StartsWith("cef/library/cache/"))
                {
                    continue;
                }

                string dirName = Path.GetFileName(dir).ToLowerInvariant();
                foreach (var forbidden in ForbiddenDirs)
                {
                    if (dirName == forbidden || dirName.StartsWith(forbidden + "_"))
                    {
                        violations.Add($"Обнаружена запрещённая читерская директория: \"{Path.GetRelativePath(gameDir, dir)}\"");
                        break;
                    }
                }
            }

            var allFiles = GetGameFiles(gameDir);
            foreach (var rel in allFiles)
            {
                string normRel = rel.Replace('\\', '/').ToLowerInvariant();
                if (normRel.StartsWith("data/script")) continue;

                string fullPath = Path.Combine(gameDir, rel);
                string fileName = Path.GetFileName(fullPath).ToLowerInvariant();
                string ext = Path.GetExtension(fullPath).ToLowerInvariant();
                bool isRoot = !normRel.Contains('/');

                if (ForbiddenExts.Contains(ext))
                {
                    violations.Add($"Обнаружен запрещённый читерский скрипт/модуль: \"{rel}\"");
                }

                if (ext == ".asi")
                {
                    if (!isRoot)
                    {
                        violations.Add($"Плагин ASI в неразрешённой директории: \"{rel}\"");
                    }
                    else if (!AllowedRootAsis.Contains(fileName))
                    {
                        violations.Add($"Неразрешённый сторонний ASI-плагин (возможный чит/модификация): \"{rel}\"");
                    }
                }

                if (ext == ".dll" && isRoot)
                {
                    if (!AllowedRootDlls.Contains(fileName))
                    {
                        violations.Add($"Несанкционированная сторонняя DLL в корне игры: \"{rel}\" (риск DLL-инжекции)");
                    }
                    else if (fileName == "d3d9.dll")
                    {
                        var fi = new FileInfo(fullPath);
                        if (!KnownDxvk32BitSizes.Contains(fi.Length))
                        {
                            violations.Add($"Файл d3d9.dll ({fi.Length:N0} Б) не совпадает с официальными версиями DXVK 32-бит. Возможно, это сторонний хук/чит!");
                        }
                    }
                }

                if (ext == ".exe" && isRoot)
                {
                    if (!AllowedRootExes.Contains(fileName))
                    {
                        violations.Add($"Неавторизованный исполняемый файл в корне игры: \"{rel}\"");
                    }
                }

                foreach (var kw in SuspiciousCheatKeywords)
                {
                    if (normRel.Contains(kw))
                    {
                        violations.Add($"Файл содержит подозрительную читерскую сигнатуру \"{kw}\": \"{rel}\"");
                        break;
                    }
                }
            }
        }
        catch (Exception ex)
        {
            violations.Add($"Ошибка античит-сканирования папки игры: {ex.Message}");
            return false;
        }

        return violations.Count == 0;
    }

    public static (bool Success, IntegrityManifest? Manifest, List<string> Violations) GenerateGameIntegrityFingerprint(string gameDir, out List<string> violations)
    {
        violations = new List<string>();
        if (!Directory.Exists(gameDir))
        {
            violations.Add($"Папка игры не найдена: {gameDir}");
            return (false, null, violations);
        }

        if (!ValidateGameFolderForAntiCheat(gameDir, out violations) || violations.Count > 0)
        {
            return (false, null, violations);
        }

        var manifest = new IntegrityManifest
        {
            Version = "1.0.0-SAPatcher",
            CreatedAt = DateTime.UtcNow.ToString("o"),
            Algorithm = "SHA256"
        };

        using var sha256 = System.Security.Cryptography.SHA256.Create();
        var allFiles = GetGameFiles(gameDir);

        foreach (var rel in allFiles)
        {
            string full = Path.Combine(gameDir, rel);
            var fi = new FileInfo(full);
            var entry = new IntegrityManifestEntry { Size = fi.Length };

            string ext = Path.GetExtension(full).ToLowerInvariant();
            if (ext == ".dll" || ext == ".exe" || ext == ".asi" || ext == ".dat" || ext == ".cfg" || ext == ".ini" || fi.Length < 5 * 1024 * 1024)
            {
                try
                {
                    using var stream = File.OpenRead(full);
                    byte[] hashBytes = sha256.ComputeHash(stream);
                    entry.Hash = Convert.ToHexString(hashBytes).ToLowerInvariant();
                }
                catch {}
            }
            manifest.Files[rel] = entry;
        }

        string manifestPath = Path.Combine(gameDir, "game.integrity.manifest.json");
        string json = System.Text.Json.JsonSerializer.Serialize(manifest, new System.Text.Json.JsonSerializerOptions { WriteIndented = true });
        File.WriteAllText(manifestPath, json, new UTF8Encoding(false));

        return (true, manifest, violations);
    }

    public static IntegrityManifest? GenerateGameIntegrityFingerprint(string gameDir)
    {
        var (ok, mf, _) = GenerateGameIntegrityFingerprint(gameDir, out _);
        return ok ? mf : null;
    }

    public static byte[]? ExtractDxvk32BitD3D9(string version, out string archivePathFound, out string logMessage)
    {
        archivePathFound = string.Empty;
        logMessage = string.Empty;

        if (string.Equals(version, "SAPatcher-DXVK 1", StringComparison.OrdinalIgnoreCase) ||
            version.Contains("SAPatcher-DXVK", StringComparison.OrdinalIgnoreCase) ||
            version.Contains("fork", StringComparison.OrdinalIgnoreCase))
        {
            string[] forkCandidates = new[]
            {
                Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "d3d9.dll"),
                Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "SAPatch-DXVK", "build_x86", "src", "d3d9", "d3d9.dll"),
                Path.Combine(Directory.GetCurrentDirectory(), "d3d9.dll"),
                Path.Combine(Path.GetFullPath(Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "..", "..", "..")), "d3d9.dll"),
                @"f:\project\SAPatcher\d3d9.dll",
                @"f:\project\SAPatcher\SAPatch-DXVK\build_x86\src\d3d9\d3d9.dll"
            };

            foreach (var cand in forkCandidates)
            {
                if (File.Exists(cand))
                {
                    try
                    {
                        byte[] bytes = File.ReadAllBytes(cand);
                        archivePathFound = cand;
                        logMessage = $"Использована встроенная библиотека DXVK 3.1.1 ({bytes.Length:N0} байт)";
                        return bytes;
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"[DxvkExtract] Ошибка чтения {cand}: {ex.Message}");
                    }
                }
            }

            logMessage = "Файл d3d9.dll для DXVK 3.1.1 не найден в каталоге проекта.";
            return null;
        }

        string archiveName = $"dxvk-{version}.tar.gz";
        string[] candidateDirs = new[]
        {
            AppDomain.CurrentDomain.BaseDirectory,
            Directory.GetCurrentDirectory(),
            Path.GetFullPath(Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "..", "..", "..")),
            Path.GetDirectoryName(Environment.ProcessPath ?? "") ?? ""
        };

        string foundArchive = string.Empty;
        foreach (var dir in candidateDirs)
        {
            string p = Path.Combine(dir, archiveName);
            if (File.Exists(p))
            {
                foundArchive = p;
                break;
            }
        }

        if (string.IsNullOrEmpty(foundArchive))
        {
            logMessage = $"Архив {archiveName} не найден в каталоге проекта.";
            return null;
        }

        archivePathFound = foundArchive;

        try
        {
            using var fs = File.OpenRead(foundArchive);
            using var gz = new System.IO.Compression.GZipStream(fs, System.IO.Compression.CompressionMode.Decompress);
            using var tar = new System.Formats.Tar.TarReader(gz);
            while (tar.GetNextEntry() is { } entry)
            {
                if ((entry.Name.EndsWith("x32/d3d9.dll", StringComparison.OrdinalIgnoreCase) ||
                     entry.Name.EndsWith("x32\\d3d9.dll", StringComparison.OrdinalIgnoreCase)) && entry.DataStream != null)
                {
                    using var ms = new MemoryStream();
                    entry.DataStream.CopyTo(ms);
                    byte[] bytes = ms.ToArray();
                    logMessage = $"Извлечён 32-битный d3d9.dll из {Path.GetFileName(foundArchive)} ({bytes.Length:N0} байт)";
                    return bytes;
                }
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[DxvkExtract] TarReader exception: {ex.Message}. Falling back to tar.exe...");
        }

        try
        {
            string tempDir = Path.Combine(Path.GetTempPath(), "SAPatcher_dxvk_" + Guid.NewGuid().ToString("N"));
            Directory.CreateDirectory(tempDir);
            string targetInsideTar = $"dxvk-{version}/x32/d3d9.dll";

            var psi = new System.Diagnostics.ProcessStartInfo("tar.exe", $"-C \"{tempDir}\" -xzf \"{foundArchive}\" \"{targetInsideTar}\"")
            {
                UseShellExecute = false,
                CreateNoWindow = true
            };
            var proc = System.Diagnostics.Process.Start(psi);
            proc?.WaitForExit(5000);

            string extractedPath = Path.Combine(tempDir, targetInsideTar.Replace('/', Path.DirectorySeparatorChar));
            if (!File.Exists(extractedPath))
            {
                extractedPath = Directory.GetFiles(tempDir, "d3d9.dll", SearchOption.AllDirectories)
                    .FirstOrDefault(p => p.Replace('\\', '/').EndsWith("x32/d3d9.dll", StringComparison.OrdinalIgnoreCase)) ?? string.Empty;
            }

            if (!string.IsNullOrEmpty(extractedPath) && File.Exists(extractedPath))
            {
                byte[] bytes = File.ReadAllBytes(extractedPath);
                try { Directory.Delete(tempDir, true); } catch {}
                logMessage = $"Извлечён 32-битный d3d9.dll через tar.exe ({bytes.Length:N0} байт)";
                return bytes;
            }
        }
        catch (Exception ex)
        {
            logMessage = $"Ошибка извлечения d3d9.dll: {ex.Message}";
        }

        return null;
    }

    public static bool ApplyLargeAddressAware(string exePath, out string msg)
    {
        try
        {
            if (!File.Exists(exePath))
            {
                msg = $"Файл не найден: {exePath}";
                return false;
            }

            string backupPath = exePath + ".Backup";
            if (!File.Exists(backupPath))
            {
                try
                {
                    File.Copy(exePath, backupPath, false);
                }
                catch {}
            }

            int peOffset;
            bool alreadySet = false;

            using (var fs = new FileStream(exePath, FileMode.Open, FileAccess.ReadWrite, FileShare.Read))
            using (var reader = new BinaryReader(fs))
            using (var writer = new BinaryWriter(fs))
            {
                fs.Seek(0x3C, SeekOrigin.Begin);
                peOffset = reader.ReadInt32();

                fs.Seek(peOffset + 22, SeekOrigin.Begin);
                ushort characteristics = reader.ReadUInt16();

                const ushort IMAGE_FILE_LARGE_ADDRESS_AWARE = 0x0020;
                if ((characteristics & IMAGE_FILE_LARGE_ADDRESS_AWARE) == 0)
                {
                    characteristics |= IMAGE_FILE_LARGE_ADDRESS_AWARE;
                    fs.Seek(peOffset + 22, SeekOrigin.Begin);
                    writer.Write(characteristics);
                    fs.Flush();
                }
                else
                {
                    alreadySet = true;
                }
            }

            try
            {
                if (MapFileAndCheckSumW(exePath, out uint headerSum, out uint checkSum) == 0 && checkSum != 0)
                {
                    using var fs = new FileStream(exePath, FileMode.Open, FileAccess.ReadWrite, FileShare.Read);
                    using var writer = new BinaryWriter(fs);
                    fs.Seek(peOffset + 88, SeekOrigin.Begin);
                    writer.Write(checkSum);
                    fs.Flush();
                }
            }
            catch {}

            string exeName = Path.GetFileName(exePath);
            msg = alreadySet
                ? $"Флаг 4 ГБ ОЗУ (LAA) уже активен в {exeName}"
                : $"Флаг 4 ГБ ОЗУ (LAA) успешно установлен в {exeName} (создан {Path.GetFileName(backupPath)})";
            return true;
        }
        catch (Exception ex)
        {
            msg = $"Ошибка LAA патчинга: {ex.Message}";
            return false;
        }
    }

    public static bool Apply4GbPatchToGame(string? gamePath, out List<string> logs)
    {
        logs = new List<string>();
        string? resolved = ResolveGamePath(gamePath);
        if (string.IsNullOrEmpty(resolved) || !Directory.Exists(resolved))
        {
            logs.Add("[ERROR] Папка игры не найдена на диске.");
            return false;
        }

        logs.Add($"[4GB_PATCH] Применение 4 ГБ патча к папке игры: {resolved}");
        string[] targetExes = new[] { "motion.exe", "samp.exe", "gta_sa.exe" };
        int patchedCount = 0;

        foreach (var exeName in targetExes)
        {
            string exeFile = Path.Combine(resolved, exeName);
            if (File.Exists(exeFile))
            {
                if (ApplyLargeAddressAware(exeFile, out string msg))
                {
                    logs.Add($"[4GB_PATCH] {exeName}: {msg}");
                    patchedCount++;
                }
                else
                {
                    logs.Add($"[ERROR] {exeName}: {msg}");
                }
            }
        }

        if (patchedCount == 0)
        {
            logs.Add("[WARN] Целевые файлы motion.exe и samp.exe не найдены в каталоге игры.");
            return false;
        }

        try
        {
            string manifestPath = Path.Combine(resolved, "game.integrity.manifest.json");
            if (File.Exists(manifestPath))
            {
                string raw = File.ReadAllText(manifestPath, Encoding.UTF8);
                var manifest = System.Text.Json.JsonSerializer.Deserialize<IntegrityManifest>(raw, new System.Text.Json.JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                if (manifest != null && manifest.Files != null)
                {
                    using var sha = System.Security.Cryptography.SHA256.Create();
                    foreach (var exeName in targetExes)
                    {
                        string exeFile = Path.Combine(resolved, exeName);
                        if (File.Exists(exeFile))
                        {
                            var fi = new FileInfo(exeFile);
                            using var s = File.OpenRead(exeFile);
                            string h = Convert.ToHexString(sha.ComputeHash(s)).ToLowerInvariant();
                            manifest.Files[exeName] = new IntegrityManifestEntry { Size = fi.Length, Hash = h };
                        }
                    }
                    string updatedJson = System.Text.Json.JsonSerializer.Serialize(manifest, new System.Text.Json.JsonSerializerOptions { WriteIndented = true });
                    File.WriteAllText(manifestPath, updatedJson, Encoding.UTF8);
                    logs.Add("[4GB_PATCH] Отпечаток game.integrity.manifest.json обновлен новыми хэшами LAA-файлов.");
                }
            }
        }
        catch (Exception ex)
        {
            logs.Add($"[WARN] Не удалось обновить хэши в manifest: {ex.Message}");
        }

        logs.Add($"[4GB_PATCH] Успешно обработано исполняемых файлов: {patchedCount}. Патч 4 ГБ ОЗУ внедрён и активен!");
        return true;
    }

    public static ExeLaaInspection InspectExeLAA(string filePath)
    {
        var res = new ExeLaaInspection { FilePath = filePath ?? string.Empty };
        if (string.IsNullOrWhiteSpace(filePath) || !File.Exists(filePath))
        {
            res.Exists = false;
            res.Message = "Файл не существует или путь не указан.";
            return res;
        }

        try
        {
            var fi = new FileInfo(filePath);
            res.Exists = true;
            res.FileName = fi.Name;
            res.FileSizeBytes = fi.Length;
            res.FileSizeFormatted = FormatBytes(fi.Length);

            string backupPath = filePath + ".Backup";
            if (File.Exists(backupPath))
            {
                var bfi = new FileInfo(backupPath);
                res.BackupExists = true;
                res.BackupPath = backupPath;
                res.BackupSizeBytes = bfi.Length;
                res.BackupSizeFormatted = FormatBytes(bfi.Length);
            }

            using (var fs = new FileStream(filePath, FileMode.Open, FileAccess.Read, FileShare.ReadWrite))
            using (var reader = new BinaryReader(fs))
            {
                if (fs.Length < 0x40)
                {
                    res.Message = "Файл слишком мал для PE-исполняемого файла.";
                    return res;
                }

                ushort mz = reader.ReadUInt16();
                if (mz != 0x5A4D)
                {
                    res.Message = "Файл не является валидным DOS/Windows исполняемым файлом (отсутствует MZ).";
                    return res;
                }

                fs.Seek(0x3C, SeekOrigin.Begin);
                int peOffset = reader.ReadInt32();
                res.PeOffset = peOffset;

                if (peOffset <= 0 || peOffset + 24 > fs.Length)
                {
                    res.Message = "Некорректное смещение заголовка PE.";
                    return res;
                }

                fs.Seek(peOffset, SeekOrigin.Begin);
                uint peSig = reader.ReadUInt32();
                if (peSig != 0x00004550)
                {
                    res.Message = "Отсутствует сигнатура PE (NT Header).";
                    return res;
                }

                fs.Seek(peOffset + 22, SeekOrigin.Begin);
                ushort characteristics = reader.ReadUInt16();
                res.Characteristics = characteristics;

                const ushort IMAGE_FILE_LARGE_ADDRESS_AWARE = 0x0020;
                res.IsLaaActive = (characteristics & IMAGE_FILE_LARGE_ADDRESS_AWARE) != 0;

                if (peOffset + 92 <= fs.Length)
                {
                    fs.Seek(peOffset + 88, SeekOrigin.Begin);
                    res.Checksum = reader.ReadUInt32();
                }

                res.Message = res.IsLaaActive
                    ? "Флаг LAA (IMAGE_FILE_LARGE_ADDRESS_AWARE) активен. Доступно до 4 ГБ памяти."
                    : "Флаг LAA не активен. Приложение ограничено 2 ГБ памяти.";
            }
        }
        catch (Exception ex)
        {
            res.Message = $"Ошибка анализа PE-заголовка: {ex.Message}";
        }

        return res;
    }

    public static bool RestoreExeBackup(string filePath, out string msg)
    {
        if (string.IsNullOrWhiteSpace(filePath) || !File.Exists(filePath))
        {
            msg = "Целевой исполняемый файл не найден.";
            return false;
        }

        string backupPath = filePath + ".Backup";
        if (!File.Exists(backupPath))
        {
            msg = $"Резервная копия не найдена: {backupPath}";
            return false;
        }

        try
        {
            File.Copy(backupPath, filePath, true);
            msg = $"Исполняемый файл успешно восстановлен из резервной копии ({Path.GetFileName(backupPath)}).";
            return true;
        }
        catch (Exception ex)
        {
            msg = $"Ошибка восстановления из бэкапа: {ex.Message}";
            return false;
        }
    }

    public static string FormatBytes(long bytes)
    {
        string[] suffixes = { "B", "KB", "MB", "GB" };
        int i = 0;
        double d = bytes;
        while (d >= 1024 && i < suffixes.Length - 1)
        {
            d /= 1024;
            i++;
        }
        return $"{d:0.##} {suffixes[i]}";
    }
}

public class ExeLaaInspection
{
    [JsonPropertyName("exists")]
    public bool Exists { get; set; }

    [JsonPropertyName("filePath")]
    public string FilePath { get; set; } = string.Empty;

    [JsonPropertyName("fileName")]
    public string FileName { get; set; } = string.Empty;

    [JsonPropertyName("fileSizeBytes")]
    public long FileSizeBytes { get; set; }

    [JsonPropertyName("fileSizeFormatted")]
    public string FileSizeFormatted { get; set; } = string.Empty;

    [JsonPropertyName("isLaaActive")]
    public bool IsLaaActive { get; set; }

    [JsonPropertyName("peOffset")]
    public int PeOffset { get; set; }

    [JsonPropertyName("characteristics")]
    public ushort Characteristics { get; set; }

    [JsonPropertyName("checksum")]
    public uint Checksum { get; set; }

    [JsonPropertyName("backupExists")]
    public bool BackupExists { get; set; }

    [JsonPropertyName("backupPath")]
    public string BackupPath { get; set; } = string.Empty;

    [JsonPropertyName("backupSizeBytes")]
    public long BackupSizeBytes { get; set; }

    [JsonPropertyName("backupSizeFormatted")]
    public string BackupSizeFormatted { get; set; } = string.Empty;

    [JsonPropertyName("message")]
    public string Message { get; set; } = string.Empty;
}

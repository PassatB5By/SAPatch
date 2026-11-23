using System;
using System.IO;
using System.Reflection;

namespace SAPatcher.Guard;

public static class GuardManager
{
    private static IGuardProvider? _activeProvider;
    private static readonly object _lock = new();

    public static readonly string[] RecognizedHeaders = new[]
    {
        "// === SAPATCHER SECURITY & INTEGRATION GUARD START ===",
        "// === SAPATCHER INTEGRATION START ==="
    };

    public static readonly string[] RecognizedFooters = new[]
    {
        "// === SAPATCHER SECURITY & INTEGRATION GUARD END ===",
        "// === SAPATCHER INTEGRATION END ==="
    };

    public static IGuardProvider ActiveProvider
    {
        get
        {
            if (_activeProvider == null)
            {
                lock (_lock)
                {
                    _activeProvider ??= InitializeProvider();
                }
            }
            return _activeProvider;
        }
    }

    public static bool IsProprietaryLoaded => ActiveProvider.IsProprietary;

    public static string GuardHeader => ActiveProvider.GuardHeader;

    public static string GuardFooter => ActiveProvider.GuardFooter;

    public static string GetGuardScript() => ActiveProvider.GetGuardScript();

    public static bool IsDeveloperModeActive => ActiveProvider.IsDeveloperModeActive;

    public static bool CheckHardwareAllowed() => ActiveProvider.CheckHardwareAllowed();

    public static bool AuthenticateDeveloper(string password) => ActiveProvider.AuthenticateDeveloper(password);

    public static void SetDeveloperMode(bool enabled) => ActiveProvider.SetDeveloperMode(enabled);

    public static string GetHardwareSummary() => ActiveProvider.GetHardwareSummary();

    private static IGuardProvider InitializeProvider()
    {
        try
        {
            string baseDir = AppDomain.CurrentDomain.BaseDirectory;
            string curDir = Directory.GetCurrentDirectory();

            string[] candidatePaths = new[]
            {
                Path.Combine(baseDir, "SAPatcher.Security.dll"),
                Path.Combine(curDir, "SAPatcher.Security.dll"),
                Path.Combine(curDir, "SecuritySource", "SAPatcher.Security", "bin", "Release", "net9.0-windows10.0.19041.0", "SAPatcher.Security.dll"),
                Path.Combine(curDir, "SecuritySource", "SAPatcher.Security", "bin", "Debug", "net9.0-windows10.0.19041.0", "SAPatcher.Security.dll"),
                Path.Combine(baseDir, "..", "..", "..", "SecuritySource", "SAPatcher.Security", "bin", "Release", "net9.0-windows10.0.19041.0", "SAPatcher.Security.dll"),
                Path.Combine(baseDir, "..", "..", "..", "SecuritySource", "SAPatcher.Security", "bin", "Debug", "net9.0-windows10.0.19041.0", "SAPatcher.Security.dll"),
                @"f:\project\SAPatcher\SAPatcher.Security.dll",
                @"f:\project\SAPatcher\SecuritySource\SAPatcher.Security\bin\Release\net9.0-windows10.0.19041.0\SAPatcher.Security.dll",
                @"f:\project\SAPatcher\SecuritySource\SAPatcher.Security\bin\Debug\net9.0-windows10.0.19041.0\SAPatcher.Security.dll",
                @"f:\project\SAPatcher\bin\Release\net9.0-windows10.0.19041.0\SAPatcher.Security.dll",
                @"f:\project\SAPatcher\bin\Debug\net9.0-windows10.0.19041.0\SAPatcher.Security.dll"
            };

            foreach (var securityDllPath in candidatePaths)
            {
                if (File.Exists(securityDllPath))
                {
                    try
                    {
                        var asm = Assembly.LoadFrom(securityDllPath);
                        foreach (var type in asm.GetExportedTypes())
                        {
                            if (type.IsAbstract || type.IsInterface) continue;

                            if (typeof(IGuardProvider).IsAssignableFrom(type))
                            {
                                var instance = Activator.CreateInstance(type) as IGuardProvider;
                                if (instance != null)
                                {
                                    Console.WriteLine($"[GuardManager] Успешно загружен закрытый модуль: {instance.ProviderName} v{instance.Version} из {securityDllPath}");
                                    return instance;
                                }
                            }

                            var getScriptMethod = type.GetMethod("GetGuardScript", BindingFlags.Public | BindingFlags.Instance);
                            if (getScriptMethod != null)
                            {
                                var instance = Activator.CreateInstance(type);
                                if (instance != null)
                                {
                                    Console.WriteLine($"[GuardManager] Успешно подключен адаптер закрытого модуля: {type.FullName} из {securityDllPath}");
                                    return new ReflectionGuardAdapter(instance, type);
                                }
                            }
                        }
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"[GuardManager] Предупреждение загрузки {securityDllPath}: {ex.Message}");
                    }
                }
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[GuardManager] Не удалось загрузить SAPatcher.Security.dll: {ex.Message}. Используется открытая версия.");
        }

        Console.WriteLine("[GuardManager] Активен открытый модуль интеграции (Open Source Core).");
        return new OpenSourceGuardProvider();
    }

    private class ReflectionGuardAdapter : IGuardProvider
    {
        private readonly object _instance;
        private readonly MethodInfo _getScript;
        private readonly PropertyInfo? _propName;
        private readonly PropertyInfo? _propVer;
        private readonly PropertyInfo? _propHeader;
        private readonly PropertyInfo? _propFooter;
        private readonly PropertyInfo? _propDevActive;
        private readonly MethodInfo? _methCheckHw;
        private readonly MethodInfo? _methAuthDev;
        private readonly MethodInfo? _methSetDev;
        private readonly MethodInfo? _methGetHw;

        public ReflectionGuardAdapter(object instance, Type type)
        {
            _instance = instance;
            _getScript = type.GetMethod("GetGuardScript", BindingFlags.Public | BindingFlags.Instance)!;
            _propName = type.GetProperty("ProviderName");
            _propVer = type.GetProperty("Version");
            _propHeader = type.GetProperty("GuardHeader");
            _propFooter = type.GetProperty("GuardFooter");
            _propDevActive = type.GetProperty("IsDeveloperModeActive");
            _methCheckHw = type.GetMethod("CheckHardwareAllowed", BindingFlags.Public | BindingFlags.Instance);
            _methAuthDev = type.GetMethod("AuthenticateDeveloper", BindingFlags.Public | BindingFlags.Instance);
            _methSetDev = type.GetMethod("SetDeveloperMode", BindingFlags.Public | BindingFlags.Instance);
            _methGetHw = type.GetMethod("GetHardwareSummary", BindingFlags.Public | BindingFlags.Instance);
        }

        public string ProviderName => _propName?.GetValue(_instance)?.ToString() ?? "SAPatcher Security Module";
        public string Version => _propVer?.GetValue(_instance)?.ToString() ?? "1.0.0";
        public bool IsProprietary => true;
        public string GuardHeader => _propHeader?.GetValue(_instance)?.ToString() ?? "// === SAPATCHER SECURITY & INTEGRATION GUARD START ===";
        public string GuardFooter => _propFooter?.GetValue(_instance)?.ToString() ?? "// === SAPATCHER SECURITY & INTEGRATION GUARD END ===";
        public string GetGuardScript() => _getScript?.Invoke(_instance, null)?.ToString() ?? "";

        public bool IsDeveloperModeActive => (bool)(_propDevActive?.GetValue(_instance) ?? false);
        public bool CheckHardwareAllowed() => (bool)(_methCheckHw?.Invoke(_instance, null) ?? false);
        public bool AuthenticateDeveloper(string password) => (bool)(_methAuthDev?.Invoke(_instance, new object[] { password }) ?? false);
        public void SetDeveloperMode(bool enabled) => _methSetDev?.Invoke(_instance, new object[] { enabled });
        public string GetHardwareSummary() => _methGetHw?.Invoke(_instance, null)?.ToString() ?? "MSI MPG B550 GAMING PLUS (Authorized)";
    }
}


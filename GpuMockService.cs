using System;
using System.Collections.Generic;
using System.IO;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace SAPatcher;

public class GpuMockConfig
{
    [JsonPropertyName("enabled")]
    public bool Enabled { get; set; }

    [JsonPropertyName("preset")]
    public string Preset { get; set; } = "real";

    [JsonPropertyName("customModel")]
    public string CustomModel { get; set; } = string.Empty;

    [JsonPropertyName("customVram")]
    public string CustomVram { get; set; } = string.Empty;

    [JsonPropertyName("customDriver")]
    public string CustomDriver { get; set; } = string.Empty;

    [JsonPropertyName("customVulkan")]
    public string CustomVulkan { get; set; } = string.Empty;
}

public class GpuMockPreset
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = string.Empty;

    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;

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

    [JsonPropertyName("badgeText")]
    public string BadgeText { get; set; } = string.Empty;

    [JsonPropertyName("badgeClass")]
    public string BadgeClass { get; set; } = "badge-success";

    [JsonPropertyName("verdictTitle")]
    public string VerdictTitle { get; set; } = string.Empty;

    [JsonPropertyName("verdictDesc")]
    public string VerdictDesc { get; set; } = string.Empty;

    [JsonPropertyName("dxvkCompat")]
    public DxvkMatrix DxvkCompat { get; set; } = new();
}

public static class GpuMockService
{
    private static readonly object _lock = new();
    private static GpuMockConfig _currentConfig = new();
    private static bool _initialized = false;

    private static string ConfigPath => Path.Combine(
        Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),
        "SAPatcher",
        "dev_gpu_mock.json"
    );

    public static readonly Dictionary<string, GpuMockPreset> Presets = new(StringComparer.OrdinalIgnoreCase)
    {
        ["real"] = new GpuMockPreset
        {
            Id = "real",
            Name = "Реальная видеокарта (Без подмены)",
            Model = "Real GPU",
            VulkanFound = true
        },
        ["rtx4090"] = new GpuMockPreset
        {
            Id = "rtx4090",
            Name = "NVIDIA GeForce RTX 4090 (24 GB • Vulkan 1.4)",
            Model = "NVIDIA GeForce RTX 4090",
            Vram = "24576 MB (24 GB GDDR6X)",
            DriverVersion = "566.14 (DirectX / Vulkan)",
            DirectXSupport = "DirectX 12 (FL 12_2 Ultimate)",
            VulkanSupport = "Vulkan Loader 1.4.304.0 (vulkan-1.dll)",
            VulkanLoaderVersion = "1.4.304.0",
            VulkanFound = true,
            BadgeText = "Vulkan 1.4 Ultra Ready",
            BadgeClass = "badge-success",
            VerdictTitle = "Флагманский GPU: абсолютная совместимость со всеми версиями DXVK.",
            VerdictDesc = "Поддерживаются продвинутые Vulkan 1.4 пайплайны и DXVK 3.1.1 без каких-либо ограничений.",
            DxvkCompat = new DxvkMatrix
            {
                Dxvk1103 = new DxvkTier { Version = "DXVK 1.10.3", Specification = "Vulkan 1.1 (Legacy)", Status = "compatible", BadgeKey = "Полная совместимость" },
                Dxvk23 = new DxvkTier { Version = "DXVK 2.3", Specification = "Vulkan 1.3 Baseline", Status = "compatible", BadgeKey = "Полная совместимость" },
                Dxvk30 = new DxvkTier { Version = "DXVK 3.0", Specification = "Vulkan Extended Dynamic State", Status = "supported", BadgeKey = "Поддерживается" },
                Dxvk311 = new DxvkTier { Version = "DXVK 3.1.1", Specification = "Актуальная: расширенные пайплайны", Status = "recommended", BadgeKey = "Рекомендуется" }
            }
        },
        ["rx7900xtx"] = new GpuMockPreset
        {
            Id = "rx7900xtx",
            Name = "AMD Radeon RX 7900 XTX (24 GB • Vulkan 1.3)",
            Model = "AMD Radeon RX 7900 XTX",
            Vram = "24576 MB (24 GB GDDR6)",
            DriverVersion = "24.12.1 Adrenalin (DirectX / Vulkan)",
            DirectXSupport = "DirectX 12 (FL 12_2 Ultimate)",
            VulkanSupport = "Vulkan Loader 1.3.296.0 (vulkan-1.dll)",
            VulkanLoaderVersion = "1.3.296.0",
            VulkanFound = true,
            BadgeText = "Vulkan 1.3 Ultra Ready",
            BadgeClass = "badge-success",
            VerdictTitle = "Топовый ускоритель AMD RDNA3: максимальный запас VRAM под любые текстуры.",
            VerdictDesc = "Рекомендуется актуальная версия DXVK 3.1.1 с включением FreeSync / TearFree.",
            DxvkCompat = new DxvkMatrix
            {
                Dxvk1103 = new DxvkTier { Version = "DXVK 1.10.3", Specification = "Vulkan 1.1 (Legacy)", Status = "compatible", BadgeKey = "Полная совместимость" },
                Dxvk23 = new DxvkTier { Version = "DXVK 2.3", Specification = "Vulkan 1.3 Baseline", Status = "compatible", BadgeKey = "Полная совместимость" },
                Dxvk30 = new DxvkTier { Version = "DXVK 3.0", Specification = "Vulkan Extended Dynamic State", Status = "supported", BadgeKey = "Поддерживается" },
                Dxvk311 = new DxvkTier { Version = "DXVK 3.1.1", Specification = "Актуальная: расширенные пайплайны", Status = "recommended", BadgeKey = "Рекомендуется" }
            }
        },
        ["gtx1060"] = new GpuMockPreset
        {
            Id = "gtx1060",
            Name = "NVIDIA GeForce GTX 1060 6GB (Pascal • Vulkan 1.3)",
            Model = "NVIDIA GeForce GTX 1060 6GB",
            Vram = "6144 MB (6 GB GDDR5)",
            DriverVersion = "560.94 (DirectX / Vulkan)",
            DirectXSupport = "DirectX 12 (FL 12_1)",
            VulkanSupport = "Vulkan Loader 1.3.277.0 (vulkan-1.dll)",
            VulkanLoaderVersion = "1.3.277.0",
            VulkanFound = true,
            BadgeText = "Vulkan 1.3 Ready",
            BadgeClass = "badge-accent",
            VerdictTitle = "Оптимальный GPU среднего уровня: полная поддержка Vulkan 1.3.",
            VerdictDesc = "Рекомендуется DXVK 2.3 или 3.1.1. Стабильная работа GTA SA / CRMP с лимитом кадров 144 FPS.",
            DxvkCompat = new DxvkMatrix
            {
                Dxvk1103 = new DxvkTier { Version = "DXVK 1.10.3", Specification = "Vulkan 1.1 (Legacy)", Status = "compatible", BadgeKey = "Полная совместимость" },
                Dxvk23 = new DxvkTier { Version = "DXVK 2.3", Specification = "Vulkan 1.3 Baseline", Status = "recommended", BadgeKey = "Рекомендуется" },
                Dxvk30 = new DxvkTier { Version = "DXVK 3.0", Specification = "Vulkan Extended Dynamic State", Status = "supported", BadgeKey = "Поддерживается" },
                Dxvk311 = new DxvkTier { Version = "DXVK 3.1.1", Specification = "Актуальная: расширенные пайплайны", Status = "supported", BadgeKey = "Поддерживается" }
            }
        },
        ["gtx750ti"] = new GpuMockPreset
        {
            Id = "gtx750ti",
            Name = "NVIDIA GeForce GTX 750 Ti 2GB (Kepler/Maxwell • Vulkan 1.2)",
            Model = "NVIDIA GeForce GTX 750 Ti",
            Vram = "2048 MB (2 GB GDDR5)",
            DriverVersion = "474.11 Legacy (DirectX / Vulkan 1.2)",
            DirectXSupport = "DirectX 11 (FL 11_0)",
            VulkanSupport = "Vulkan Loader 1.2.198.0 (vulkan-1.dll)",
            VulkanLoaderVersion = "1.2.198.0",
            VulkanFound = true,
            BadgeText = "Vulkan 1.2 Legacy Only",
            BadgeClass = "badge-warning",
            VerdictTitle = "Видеокарта не поддерживает Vulkan 1.3: используйте только DXVK 1.10.3!",
            VerdictDesc = "Версии DXVK 2.x и 3.x требуют Vulkan 1.3 и вызовут сбой при запуске. Установите DXVK 1.10.3.",
            DxvkCompat = new DxvkMatrix
            {
                Dxvk1103 = new DxvkTier { Version = "DXVK 1.10.3", Specification = "Vulkan 1.1/1.2 (Legacy D3D9)", Status = "recommended", BadgeKey = "Рекомендуется (Legacy)" },
                Dxvk23 = new DxvkTier { Version = "DXVK 2.3", Specification = "Требует Vulkan 1.3 (Недоступно)", Status = "incompatible", BadgeKey = "Не поддерживается" },
                Dxvk30 = new DxvkTier { Version = "DXVK 3.0", Specification = "Требует Vulkan 1.3 (Недоступно)", Status = "incompatible", BadgeKey = "Не поддерживается" },
                Dxvk311 = new DxvkTier { Version = "DXVK 3.1.1", Specification = "Требует Vulkan 1.3 (Недоступно)", Status = "incompatible", BadgeKey = "Не поддерживается" }
            }
        },
        ["intel_uhd630"] = new GpuMockPreset
        {
            Id = "intel_uhd630",
            Name = "Intel UHD Graphics 630 (Встроенная • Vulkan 1.2)",
            Model = "Intel UHD Graphics 630",
            Vram = "1024 MB (Shared System RAM)",
            DriverVersion = "31.0.101.2128",
            DirectXSupport = "DirectX 12 (FL 12_1)",
            VulkanSupport = "Vulkan Loader 1.2.189.0 (vulkan-1.dll)",
            VulkanLoaderVersion = "1.2.189.0",
            VulkanFound = true,
            BadgeText = "Встроенная графика",
            BadgeClass = "badge-warning",
            VerdictTitle = "Встроенный GPU с ограниченным объемом памяти.",
            VerdictDesc = "Рекомендуется DXVK 1.10.3 для снижения расхода ОЗУ и предотвращения вылетов по памяти.",
            DxvkCompat = new DxvkMatrix
            {
                Dxvk1103 = new DxvkTier { Version = "DXVK 1.10.3", Specification = "Vulkan 1.1 (Низкий расход VRAM)", Status = "recommended", BadgeKey = "Рекомендуется" },
                Dxvk23 = new DxvkTier { Version = "DXVK 2.3", Specification = "Vulkan 1.3 (Ограниченная скорость)", Status = "supported", BadgeKey = "Поддерживается" },
                Dxvk30 = new DxvkTier { Version = "DXVK 3.0", Specification = "Vulkan Extended Dynamic State", Status = "incompatible", BadgeKey = "Не рекомендуется" },
                Dxvk311 = new DxvkTier { Version = "DXVK 3.1.1", Specification = "Расширенные пайплайны", Status = "incompatible", BadgeKey = "Не рекомендуется" }
            }
        },
        ["intel_hd4000"] = new GpuMockPreset
        {
            Id = "intel_hd4000",
            Name = "Intel HD Graphics 4000 (Ivy Bridge • Без Vulkan)",
            Model = "Intel HD Graphics 4000",
            Vram = "0 MB (Dynamic Allocation)",
            DriverVersion = "10.18.10.5161 (DirectX 11 Legacy)",
            DirectXSupport = "DirectX 11 (FL 11_0)",
            VulkanSupport = "Vulkan не поддерживается (отсутствует в драйвере)",
            VulkanLoaderVersion = "Недоступно",
            VulkanFound = false,
            BadgeText = "Vulkan отсутствует (D3D9 Only)",
            BadgeClass = "badge-danger",
            VerdictTitle = "Видеокарта не поддерживает Vulkan API: DXVK запустить невозможно!",
            VerdictDesc = "Трансляция DXVK не сможет работать на данном адаптере. Игра запустится исключительно в нативном режиме DirectX 9.",
            DxvkCompat = new DxvkMatrix
            {
                Dxvk1103 = new DxvkTier { Version = "DXVK 1.10.3", Specification = "Требует Vulkan (Отсутствует)", Status = "incompatible", BadgeKey = "Недоступно" },
                Dxvk23 = new DxvkTier { Version = "DXVK 2.3", Specification = "Требует Vulkan (Отсутствует)", Status = "incompatible", BadgeKey = "Недоступно" },
                Dxvk30 = new DxvkTier { Version = "DXVK 3.0", Specification = "Требует Vulkan (Отсутствует)", Status = "incompatible", BadgeKey = "Недоступно" },
                Dxvk311 = new DxvkTier { Version = "DXVK 3.1.1", Specification = "Требует Vulkan (Отсутствует)", Status = "incompatible", BadgeKey = "Недоступно" }
            }
        }
    };

    static GpuMockService()
    {
        EnsureLoaded();
    }

    private static void EnsureLoaded()
    {
        lock (_lock)
        {
            if (_initialized) return;
            _initialized = true;

            try
            {
                if (File.Exists(ConfigPath))
                {
                    string json = File.ReadAllText(ConfigPath);
                    _currentConfig = JsonSerializer.Deserialize<GpuMockConfig>(json) ?? new GpuMockConfig();
                }
            }
            catch
            {
                _currentConfig = new GpuMockConfig();
            }
        }
    }

    public static bool IsMockActive()
    {
        EnsureLoaded();
        return _currentConfig.Enabled &&
               !string.IsNullOrWhiteSpace(_currentConfig.Preset) &&
               !_currentConfig.Preset.Equals("real", StringComparison.OrdinalIgnoreCase);
    }

    public static string GetCurrentPresetId()
    {
        EnsureLoaded();
        return _currentConfig.Enabled ? _currentConfig.Preset : "real";
    }

    public static void SetPreset(string presetId)
    {
        lock (_lock)
        {
            EnsureLoaded();
            if (string.IsNullOrWhiteSpace(presetId) || presetId.Equals("real", StringComparison.OrdinalIgnoreCase))
            {
                _currentConfig.Enabled = false;
                _currentConfig.Preset = "real";
            }
            else if (Presets.ContainsKey(presetId))
            {
                _currentConfig.Enabled = true;
                _currentConfig.Preset = presetId;
            }

            Save();
        }
    }

    public static void Reset()
    {
        lock (_lock)
        {
            _currentConfig.Enabled = false;
            _currentConfig.Preset = "real";
            Save();
        }
    }

    private static void Save()
    {
        try
        {
            string dir = Path.GetDirectoryName(ConfigPath)!;
            Directory.CreateDirectory(dir);
            string json = JsonSerializer.Serialize(_currentConfig, new JsonSerializerOptions { WriteIndented = true });
            File.WriteAllText(ConfigPath, json);
        }
        catch {}
    }

    public static GpuInfo CreateGpuInfo()
    {
        EnsureLoaded();
        string presetId = _currentConfig.Preset;
        if (!Presets.TryGetValue(presetId, out var p))
        {
            p = Presets["rtx4090"];
        }

        return new GpuInfo
        {
            Model = p.Model,
            Vram = p.Vram,
            DriverVersion = p.DriverVersion,
            DirectXSupport = p.DirectXSupport,
            VulkanSupport = p.VulkanSupport,
            VulkanLoaderVersion = p.VulkanLoaderVersion,
            VulkanFound = p.VulkanFound,
            DxvkCompat = p.DxvkCompat,
            VerdictTextKey = p.VerdictTitle,
            VerdictDescKey = p.VerdictDesc,
            BadgeText = p.BadgeText,
            BadgeClass = p.BadgeClass,
            IsMock = true,
            MockPresetId = p.Id
        };
    }

    public static void CalculateRealGpuCompatibility(GpuInfo gpu)
    {
        bool hasVulkan = gpu.VulkanFound;
        string model = gpu.Model.ToUpperInvariant();

        bool isOldKepler = model.Contains("GTX 6") || model.Contains("GTX 7") || model.Contains("GT 7") || model.Contains("GT 6");
        bool isIvyBridge = model.Contains("HD GRAPHICS 4000") || model.Contains("HD GRAPHICS 3000") || model.Contains("HD GRAPHICS 2500");

        if (!hasVulkan || isIvyBridge)
        {
            gpu.BadgeText = "Vulkan отсутствует (D3D9 Only)";
            gpu.BadgeClass = "badge-danger";
            gpu.VerdictTextKey = "gpu.verdict_no_vulkan_title";
            gpu.VerdictDescKey = "gpu.verdict_no_vulkan_desc";
            gpu.DxvkCompat = new DxvkMatrix
            {
                Dxvk1103 = new DxvkTier { Version = "DXVK 1.10.3", Specification = "Требует Vulkan", Status = "incompatible", BadgeKey = "Недоступно" },
                Dxvk23 = new DxvkTier { Version = "DXVK 2.3", Specification = "Требует Vulkan", Status = "incompatible", BadgeKey = "Недоступно" },
                Dxvk30 = new DxvkTier { Version = "DXVK 3.0", Specification = "Требует Vulkan", Status = "incompatible", BadgeKey = "Недоступно" },
                Dxvk311 = new DxvkTier { Version = "DXVK 3.1.1", Specification = "Требует Vulkan", Status = "incompatible", BadgeKey = "Недоступно" }
            };
            return;
        }

        if (isOldKepler)
        {
            gpu.BadgeText = "Vulkan 1.2 Legacy Only";
            gpu.BadgeClass = "badge-warning";
            gpu.VerdictTextKey = "gpu.verdict_legacy_title";
            gpu.VerdictDescKey = "gpu.verdict_legacy_desc";
            gpu.DxvkCompat = new DxvkMatrix
            {
                Dxvk1103 = new DxvkTier { Version = "DXVK 1.10.3", Specification = "Vulkan 1.1/1.2 (Legacy D3D9)", Status = "recommended", BadgeKey = "Рекомендуется (Legacy)" },
                Dxvk23 = new DxvkTier { Version = "DXVK 2.3", Specification = "Требует Vulkan 1.3", Status = "incompatible", BadgeKey = "Не поддерживается" },
                Dxvk30 = new DxvkTier { Version = "DXVK 3.0", Specification = "Требует Vulkan 1.3", Status = "incompatible", BadgeKey = "Не поддерживается" },
                Dxvk311 = new DxvkTier { Version = "DXVK 3.1.1", Specification = "Требует Vulkan 1.3", Status = "incompatible", BadgeKey = "Не поддерживается" }
            };
            return;
        }

        // Modern Vulkan 1.3+ GPU
        gpu.BadgeText = "Vulkan 1.3/1.4 Ready";
        gpu.BadgeClass = "badge-accent";
        gpu.VerdictTextKey = "gpu.verdict_text";
        gpu.VerdictDescKey = "gpu.verdict_desc";
        gpu.DxvkCompat = new DxvkMatrix
        {
            Dxvk1103 = new DxvkTier { Version = "DXVK 1.10.3", Specification = "Vulkan 1.1 (Legacy D3D9)", Status = "compatible", BadgeKey = "gpu.dxvk1103_badge" },
            Dxvk23 = new DxvkTier { Version = "DXVK 2.3", Specification = "Vulkan 1.3 Baseline", Status = "compatible", BadgeKey = "gpu.dxvk23_badge" },
            Dxvk30 = new DxvkTier { Version = "DXVK 3.0", Specification = "Vulkan Extended Dynamic State", Status = "supported", BadgeKey = "gpu.dxvk30_badge" },
            Dxvk311 = new DxvkTier { Version = "DXVK 3.1.1", Specification = "Актуальная: расширенные пайплайны", Status = "recommended", BadgeKey = "gpu.dxvk311_badge" }
        };
    }
}


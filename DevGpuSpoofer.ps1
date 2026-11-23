<#
.SYNOPSIS
    SAPatcher - DEV Mode GPU Spoofer / Emulator CLI & Quick Switcher
    Позволяет быстро подменить определяемую видеокарту в SAPatcher для тестирования поведения оверлея,
    проверки совместимости DXVK версий (1.10.3 / 2.3 / 3.0 / 3.1.1) и вывода рекомендаций на разных GPU.

.EXAMPLE
    .\DevGpuSpoofer.ps1
    .\DevGpuSpoofer.ps1 -Preset rtx4090
    .\DevGpuSpoofer.ps1 -Preset gtx750ti
    .\DevGpuSpoofer.ps1 -Reset
#>

param(
    [ValidateSet("real", "rtx4090", "rx7900xtx", "gtx1060", "gtx750ti", "intel_uhd630", "intel_hd4000", "reset", "status")]
    [string]$Preset = ""
)

$localAppData = [Environment]::GetFolderPath([Environment+SpecialFolder]::LocalApplicationData)
$configDir = Join-Path $localAppData "SAPatcher"
$configFile = Join-Path $configDir "dev_gpu_mock.json"

if (-not (Test-Path $configDir)) {
    New-Item -ItemType Directory -Path $configDir -Force | Out-Null
}

$presetsInfo = @{
    "real"          = @{ Name = "Реальная видеокарта (Сброс эмуляции)"; Enabled = $false }
    "rtx4090"       = @{ Name = "NVIDIA GeForce RTX 4090 24GB (Vulkan 1.4, Top Tier)"; Enabled = $true }
    "rx7900xtx"     = @{ Name = "AMD Radeon RX 7900 XTX 24GB (Vulkan 1.3, Top Tier)"; Enabled = $true }
    "gtx1060"       = @{ Name = "NVIDIA GeForce GTX 1060 6GB (Vulkan 1.3, Mid Tier)"; Enabled = $true }
    "gtx750ti"      = @{ Name = "NVIDIA GeForce GTX 750 Ti 2GB (Vulkan 1.2 Legacy - Только DXVK 1.10.3)"; Enabled = $true }
    "intel_uhd630"  = @{ Name = "Intel UHD Graphics 630 (Shared VRAM, Встроенная)"; Enabled = $true }
    "intel_hd4000"  = @{ Name = "Intel HD Graphics 4000 (Без Vulkan - Только нативный D3D9)"; Enabled = $true }
}

function Set-GpuPreset([string]$id) {
    if ($id -eq "reset" -or $id -eq "real") {
        $data = @{
            enabled = $false
            preset = "real"
        }
        $json = $data | ConvertTo-Json -Depth 3
        Set-Content -Path $configFile -Value $json -Encoding UTF8
        Write-Host "`n[OK] Эмуляция GPU отключена. SAPatcher теперь использует реальное оборудование!`n" -ForegroundColor Green
        return
    }

    if ($presetsInfo.ContainsKey($id)) {
        $info = $presetsInfo[$id]
        $data = @{
            enabled = $true
            preset = $id
        }
        $json = $data | ConvertTo-Json -Depth 3
        Set-Content -Path $configFile -Value $json -Encoding UTF8
        Write-Host "`n[OK] Активирована эмуляция GPU: $($info.Name)" -ForegroundColor Cyan
        Write-Host "[INFO] Настройки сохранены в: $configFile" -ForegroundColor DarkGray
        Write-Host "[HINT] Перейдите в SAPatcher и нажмите 'Повторить проверку' (или перезапустите вкладку диагностики).`n" -ForegroundColor Yellow
    } else {
        Write-Host "`n[ERR] Неизвестный пресет: $id`n" -ForegroundColor Red
    }
}

function Show-Status {
    Write-Host "`n=== SAPATCHER DEV GPU STATUS ===" -ForegroundColor Magenta
    if (Test-Path $configFile) {
        try {
            $current = Get-Content $configFile -Raw | ConvertFrom-Json
            if ($current.enabled -and $current.preset -ne "real") {
                $pName = $presetsInfo[$current.preset].Name
                Write-Host "Статус:      ЭМУЛЯЦИЯ АКТИВНА" -ForegroundColor Green
                Write-Host "Пресет:      $($current.preset) ($pName)" -ForegroundColor Cyan
            } else {
                Write-Host "Статус:      Реальная видеокарта (Эмуляция выключена)" -ForegroundColor Gray
            }
        } catch {
            Write-Host "Статус:      Ошибка чтения конфигурации" -ForegroundColor Red
        }
    } else {
        Write-Host "Статус:      Реальная видеокарта (Файл подмены не создан)" -ForegroundColor Gray
    }
    Write-Host "Конфиг:      $configFile`n" -ForegroundColor DarkGray
}

if ($Preset -eq "reset") {
    Set-GpuPreset "real"
    return
}

if ($Preset -eq "status") {
    Show-Status
    return
}

if ($Preset -ne "") {
    Set-GpuPreset $Preset
    return
}

# Interactive Menu
Clear-Host
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "       SAPatcher — DEV Mode GPU Spoofer / Emulator        " -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Cyan
Show-Status

Write-Host "Выберите видеокарту для эмуляции:" -ForegroundColor White
Write-Host "  1. NVIDIA GeForce RTX 4090 24GB (Vulkan 1.4 • Флагман)" -ForegroundColor Green
Write-Host "  2. AMD Radeon RX 7900 XTX 24GB (Vulkan 1.3 • RDNA3)" -ForegroundColor Green
Write-Host "  3. NVIDIA GeForce GTX 1060 6GB (Vulkan 1.3 • Средний уровень)" -ForegroundColor Cyan
Write-Host "  4. NVIDIA GeForce GTX 750 Ti 2GB (Vulkan 1.2 Legacy • Только DXVK 1.10.3)" -ForegroundColor Yellow
Write-Host "  5. Intel UHD Graphics 630 (Shared VRAM • Встроенная)" -ForegroundColor DarkYellow
Write-Host "  6. Intel HD Graphics 4000 (Без Vulkan • Только DirectX 9)" -ForegroundColor Red
Write-Host "  7. Сбросить эмуляцию на РЕАЛЬНУЮ видеокарту" -ForegroundColor Gray
Write-Host "  0. Выход" -ForegroundColor DarkGray
Write-Host ""

$choice = Read-Host "Введите номер (0-7)"

switch ($choice) {
    "1" { Set-GpuPreset "rtx4090" }
    "2" { Set-GpuPreset "rx7900xtx" }
    "3" { Set-GpuPreset "gtx1060" }
    "4" { Set-GpuPreset "gtx750ti" }
    "5" { Set-GpuPreset "intel_uhd630" }
    "6" { Set-GpuPreset "intel_hd4000" }
    "7" { Set-GpuPreset "real" }
    "0" { Write-Host "Отмена." -ForegroundColor Gray; exit }
    default { Write-Host "Неверный выбор." -ForegroundColor Red }
}

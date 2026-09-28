<p align="center">
  <img src="https://raw.githubusercontent.com/PassatB5By/SAPatch/main/wwwroot/favicon.ico" width="80" height="80" alt="SAPatcher Logo" />
</p>

<h1 align="center">SAPatcher</h1>

<p align="center">
  <b>Универсальный высокопроизводительный оптимизатор и модернизатор для GTA San Andreas, SA-MP, CRMP и Motion Project</b><br>
  <i>Universal high-performance graphics modernizer & 4GB LAA memory expander for GTA SA, SA-MP, CRMP & modern launchers</i>
</p>

<p align="center">
  <a href="https://github.com/PassatB5By/SAPatch/releases"><img src="https://img.shields.io/github/v/release/PassatB5By/SAPatch?color=00e5ff&label=Release&logo=github&style=for-the-badge" alt="Latest Release" /></a>
  <a href="https://passatb5by.github.io/SAPatch/"><img src="https://img.shields.io/badge/Web_Site-passatb5by.github.io%2FSAPatch-00e5ff?style=for-the-badge&logo=googlechrome&logoColor=white" alt="Official Website" /></a>
  <a href="https://pixelsmith.ru"><img src="https://img.shields.io/badge/Studio-PixelSmith_Studio-7c4dff?style=for-the-badge" alt="PixelSmith Studio" /></a>
  <img src="https://img.shields.io/badge/Platform-Windows_x64-blue?style=for-the-badge&logo=windows" alt="Windows x64" />
  <img src="https://img.shields.io/badge/Vulkan_API-DXVK_1.10.3_--_3.1.1-red?style=for-the-badge&logo=vulkan" alt="Vulkan DXVK" />
</p>

---

## 🌟 О проекте / Overview

**SAPatcher** — это программный комплекс нового поколения от **PixelSmith Studio**, предназначенный для глубокой модернизации и устранения аппаратных архитектурных ограничений классического движка **GTA San Andreas** и многопользовательских клиентов (**SA-MP**, **CRMP**, **Radmir**, **Motion Project**).

Утилита переводит графический конвейер игры с устаревшего **Direct3D 9** на современный низкоуровневый **Vulkan API** с помощью кастомных сборок **DXVK**, снимает 32-битный барьер оперативной памяти с помощью **4GB LAA (Large Address Aware)**, полностью предотвращает вылеты *Out of Memory*, а также предоставляет готовые бесшовные интеграции с современными лаунчерами (первой официальной адаптацией стал **Motion Project**).

---

## ⚡ Ключевые возможности / Core Features

### 🚀 1. Трансляция графики в Vulkan API (DXVK)
- Нативная трансляция вызовов **Direct3D 9 ➔ Vulkan API**.
- Радикальное сокращение задержек отрисовки (frametime), устранение микрофризов и стабилизация 0.1% / 1% low FPS.
- Разгрузка однопоточного процессора за счет эффективного асинхронного конвейера Vulkan.
- Выбор из 4 проверенных версий DXVK под любое поколение видеокарт: **3.1.1**, **3.0**, **2.3**, **1.10.3**.

### 🧠 2. Патч расширенной памяти 4GB LAA (Large Address Aware)
- Снятие заводского 2 ГБ ограничения 32-битного адресного пространства `gta_sa.exe`.
- Предоставление игре полных **4096 МБ (4 ГБ)** виртуальной памяти.
- 100% защита от фатальных ошибок `0x00000000`, вылетов из-за переполнения пула текстур и пропадающих текстур при установке тяжелых модификаций, HD-моделей машин и кастомных скриптов.

### 🛡️ 3. Бесшовная адаптация лаунчера: Motion Project
- **Motion Project** стал первым лаунчером, получившим комплексную адаптацию «из коробки».
- **Bypass авто-обновлений**: защита модифицированных файлов игры от перезаписи и принудительного сброса встроенным загрузчиком лаунчера.
- **Фоновый демон и трей**: служба `LauncherServiceDaemon` в режиме реального времени контролирует целостность среды и перехватывает системные события.
- **Управление в 1 клик**: установка оптимизаций, выбор версий DXVK и возможность мгновенного отката до оригинального состояния.

### 🔍 4. Интерактивная самодиагностика и аудит системы
- Встроенный сканер видеодрайверов на совместимость с расширениями Vulkan.
- Проверка валидности PE-заголовков исполняемых файлов на наличие флага `IMAGE_FILE_LARGE_ADDRESS_AWARE`.
- Генерация подробного автономного HTML-отчета (`SAPatcher_Diagnostics_Report.html`) с контрольными суммами SHA256 и статусом всех ключевых библиотек.

---

## 🎮 Матрица совместимости DXVK / Hardware Matrix

| Версия DXVK | Требования к Vulkan | Рекомендуемые видеокарты | Особенности |
|:---|:---:|:---|:---|
| **DXVK 3.1.1** | Vulkan 1.3+ | NVIDIA RTX 20/30/40xx, AMD RX 6000/7000, Intel Arc | Максимальный FPS, новейший компилятор шейдеров, лучшая многопоточность |
| **DXVK 3.0** | Vulkan 1.3 | NVIDIA GTX 10xx, RTX, AMD RX 5000 | Высокая производительность и стабильность |
| **DXVK 2.3** | Vulkan 1.3 | NVIDIA GTX 9xx/7xx (Kepler/Maxwell), AMD RX 4xx/5xx | Идеальный баланс совместимости на более старых драйверах |
| **DXVK 1.10.3** | Vulkan 1.1 | Встроенные видеокарты (Intel UHD, AMD Vega) и старые GPU | Минимальные аппаратные требования, максимальная всеядность |

---

## 🛠️ Архитектура репозитория / Repository Structure

```text
├── docs/                      # Официальный сайт проекта (GitHub Pages)
│   ├── index.html             # Главная страница (двуязычный интерфейс, анимации)
│   ├── styles.css             # Glassmorphism неоновый дизайн-система
│   └── app.js                 # Интеграция с GitHub Releases и GitHub Issues
├── Guard/                     # Модуль защиты и мониторинга лаунчера
├── dxvk-1.10.3/               # Пакет библиотек DXVK v1.10.3
├── dxvk-2.3/                  # Пакет библиотек DXVK v2.3
├── dxvk-3.0/                  # Пакет библиотек DXVK v3.0
├── dxvk-3.1.1/                # Пакет библиотек DXVK v3.1.1
├── LauncherPatcherService.cs  # Сервис модификации и патчинга лаунчеров
├── LauncherServiceDaemon.cs   # Фоновый демон мониторинга процессов
├── SettingsManager.cs         # Конфигуратор параметров оптимизации
├── TrayService.cs             # Трей-агент управления SAPatcher
└── Program.cs                 # Главная точка входа C# .NET приложения
```

---

## 📥 Быстрый старт / Quick Start

1. Скачайте последнюю версию программы со страницы [**GitHub Releases**](https://github.com/PassatB5By/SAPatch/releases) или с официального сайта [**passatb5by.github.io/SAPatch**](https://passatb5by.github.io/SAPatch/).
2. Запустите `SAPatcher.exe` от имени администратора.
3. Программа автоматически определит установленные клиенты (Motion Project / GTA SA / SA-MP).
4. Выберите желаемую версию **DXVK** (по умолчанию рекомендуется последняя поддерживаемая вашей видеокартой).
5. Нажмите **«Применить оптимизацию»**.
6. Запускайте игру и наслаждайтесь стабильным и плавным геймплеем без вылетов!

---

## 💬 Отзывы сообщества / Community Reviews

Все отзывы о SAPatcher загружаются в реальном времени из официального трекера репозитория:
- **Напрямую на сайте**: перейдите в раздел [Отзывы](https://passatb5by.github.io/SAPatch/#reviews) на сайте.
- **Для пользователей GitHub**: отзыв создается как тикет с тегом `review`. Бот автоматически верифицирует его, публикует на сайте и закрывает тикет.
- **Для пользователей без GitHub**: на сайте доступна форма быстрой публикации через GitHub Access бота с указанием контакта (**Email / VK / Discord**).

---

## 👥 Команда и разработка / Credits

- **Разработка**: [PixelSmith Studio](https://pixelsmith.ru)
- **Основной сайт студии**: [pixelsmith.ru](https://pixelsmith.ru)
- **Репозиторий**: [github.com/PassatB5By/SAPatch](https://github.com/PassatB5By/SAPatch)
- **Лицензия**: MIT License

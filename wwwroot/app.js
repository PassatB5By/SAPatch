(function () {
  'use strict';

  const RU_FALLBACK = {
    app: {
      name: "SAPatcher",
      version: "v1.0.0 Stable",
      slogan: "A utility that changes the course of the game on modern PCs in the old GTA SA",
      description: "Оптимизация и подготовка классической GTA SA и сетевых модификаций (CRMP, SAMP) к запуску на современном оборудовании через трансляцию DirectX 9 в Vulkan с помощью DXVK.",
      status_ready: "Готов к работе",
      status_scanning: "Выполняется диагностика...",
      status_updated: "Обновлено"
    },
    nav: {
      compatibility: "Проверка совместимости",
      crmp: "Патчинг CRMP",
      samp: "Патчинг SAMP",
      projects: "Патчинг проектов",
      wip_badge: "В разработке",
      current_lang: "RU",
      alt_lang: "EN",
      theme_dark: "Темная тема",
      theme_light: "Светлая тема"
    },
    diagnostics: {
      title: "Аппаратная диагностика системы",
      subtitle: "Оценка готовности аппаратных и программных компонентов ПК к трансляции DirectX 9 в Vulkan",
      run_btn: "Запустить диагностику",
      running_btn: "Сканирование компонентов...",
      recheck_btn: "Повторить проверку",
      ready_status: "Система готова к диагностике",
      scanning_status: "Анализ драйверов и видеоподсистемы...",
      complete_status: "Диагностика успешно выполнена",
      last_scan_label: "Последняя проверка:",
      never_scanned: "Еще не проводилась",
      system_score_label: "Готовность к DXVK",
      system_score_val: "100%"
    },
    os: {
      card_title: "Операционная система",
      card_subtitle: "Конфигурация ядра Windows и графической подсистемы",
      badge_ready: "WDDM 3.x Готов",
      param_name: "Версия ОС",
      param_build: "Номер сборки",
      param_runtime: "DirectX Runtime",
      param_wddm: "Драйвер WDDM",
      runtime_val: "DirectX 12 (DirectX Agility SDK)",
      wddm_val: "WDDM 3.2 (Vulkan WSI совместим)",
      note: "Подсистема Windows оптимизирована для аппаратных дескрипторов Vulkan и низких задержек кадра."
    },
    gpu: {
      card_title: "Видеокарта и совместимость с DXVK",
      card_subtitle: "Аппаратное ускорение и поддержка расширений Vulkan API",
      badge_ready: "Vulkan 1.3/1.4 Ready",
      param_model: "Графический чип (GPU)",
      param_vram: "Объем видеопамяти (VRAM)",
      param_driver: "Версия видеодрайвера",
      param_directx: "Поддержка DirectX",
      param_vulkan: "Vulkan API Loader",
      grid_title: "Матрица совместимости версий DXVK",
      dxvk1103_title: "DXVK 1.10.3",
      dxvk1103_spec: "Vulkan 1.1 (Legacy D3D9)",
      dxvk1103_badge: "Полная совместимость",
      dxvk23_title: "DXVK 2.3",
      dxvk23_spec: "Vulkan 1.3 Baseline",
      dxvk23_badge: "Полная совместимость",
      dxvk30_title: "DXVK 3.0",
      dxvk30_spec: "Vulkan Extended Dynamic State",
      dxvk30_badge: "Поддерживается",
      dxvk311_title: "DXVK 3.1.1",
      dxvk311_spec: "Актуальная: расширенные пайплайны",
      dxvk311_badge: "Рекомендуется",
      verdict_title: "Вердикт совместимости",
      verdict_text: "Ваша видеокарта полностью поддерживает DXVK 3.1.1 для трансляции GTA SA.",
      verdict_desc: "Доступна полная аппаратная компиляция шейдеров в память GPU без фризов при первом запуске."
    },
    cpu: {
      card_title: "Процессор и готовность к Vulkan",
      card_subtitle: "Многопоточный оверхед и поддержка векторных инструкций",
      badge_ready: "Многопоточность активна",
      param_model: "Модель процессора",
      param_topology: "Ядра и потоки",
      param_clock: "Тактовая частота",
      param_instructions: "Инструкции",
      cores_suffix: "ядер",
      threads_suffix: "потоков",
      overhead_title: "Запас мощности CPU для рендеринга Vulkan",
      overhead_status: "Готов к низкоуровневой обработке Vulkan",
      overhead_desc: "Трансляция DXVK разгружает однопоточный драйвер D3D9 и распределяет вызовы отрисовки по всем логическим ядрам процессора."
    },
    display: {
      card_title: "Дисплей и видеорежимы",
      card_subtitle: "Параметры экрана, частота обновления и поддержка HDR",
      badge_ready: "200 Hz High-FPS Ready",
      param_model: "Модель монитора",
      param_resolution: "Текущее разрешение",
      param_current_hz: "Установленная герцовка",
      param_max_hz: "Максимальная герцовка",
      param_hdr: "Поддержка HDR",
      param_colors: "Глубина цвета",
      param_vrr: "Переменная частота (VRR)",
      param_vulkan_wsi: "Vulkan Present Mode",
      note: "Трансляция DXVK в Vulkan позволяет GTA SA стабильно работать на высокой частоте 144–200 Гц с разблокированным физическим движком."
    },
    patching: {
      wip_badge: "Разработка",
      status_in_dev: "Модуль находится в активной разработке",
      crmp_title: "Патчинг CRMP (GTA Criminal Russia)",
      crmp_desc: "Интеграция DXVK трансляции для клиента CRMP. Включает адаптацию под кастомные интерфейсы, фикс крашей шрифтов и синхронизацию кадровой частоты.",
      samp_title: "Патчинг SAMP (San Andreas Multiplayer)",
      samp_desc: "Инъекция оптимизированных библиотек d3d9.dll и dxvk.conf в директорию клиента SA-MP с поддержкой 2K/4K разрешений и стабильным лимитом 60-144 FPS.",
      projects_title: "Патчинг проектов и лаунчеров",
      projects_desc: "Универсальный профилировщик для лаунчеров Radmir, Province, Amazing, Arizona с автоматическим обходом перезаписи файлов при проверке целостности.",
      field_path_label: "Путь к директории игры:",
      btn_browse: "Обзор...",
      btn_apply: "Применить оптимизацию Vulkan",
      btn_restore: "Восстановить исходные файлы D3D9",
      preset_label: "Рекомендуемый билд транслятора:",
      preset_recommended: "DXVK 3.1.1 (Оптимизирован для GTA SA)",
      preset_legacy: "DXVK 2.3 (Максимальная совместимость со старыми модами)",
      preset_custom: "DXVK 3.0 (Баланс совместимости)"
    },
    motion: {
      btn_patch: "Распаковать и пропатчить лаунчер",
      btn_install: "Установить DXVK и патч 4 ГБ ОЗУ",
      btn_restore: "Восстановить оригиналы",
      btn_launch: "Запустить Motion Launcher",
      btn_test_widget: "Тест виджета (5 сек)",
      section3_title: "Установка и протокол действий",
      toast_widget_triggered: "Всплывающий 5-секундный виджет активирован!",
      status_patched: "Статус лаунчера: Защищён и пропатчен SAPatcher",
      status_unpatched: "Статус лаунчера: Не пропатчен",
      guard_active: "Защита: АКТИВНА",
      guard_inactive: "Защита: Не установлена"
    },
    dialogs: {
      confirm_title: "Подтверждение действия",
      error_title: "Системное уведомление",
      close: "Закрыть",
      proceed: "Продолжить",
      cancel: "Отмена"
    },
    toast: {
      diag_start: "Запущен сбор аппаратных данных...",
      diag_success: "Диагностика успешно завершена. Все системы готовы к DXVK!",
      report_saved: "HTML-отчет успешно сформирован на английском языке: SAPatcher_Diagnostics_Report.html",
      diag_error: "Ошибка при получении данных системы",
      wip_alert: "Этот функционал появится в следующем релизе SAPatcher.",
      lang_changed: "Язык интерфейса переключен на русский",
      theme_changed: "Тема оформления обновлена"
    }
  };

  const EN_FALLBACK = {
    app: {
      name: "SAPatcher",
      version: "v1.0.0 Stable",
      slogan: "A utility that changes the course of the game on modern PCs in the old GTA SA",
      description: "Optimization and preparation of classic GTA SA and multiplayer modifications (CRMP, SAMP) for running on modern hardware by translating DirectX 9 to Vulkan via DXVK.",
      status_ready: "Ready",
      status_scanning: "Running diagnostics...",
      status_updated: "Updated"
    },
    nav: {
      compatibility: "Compatibility Check",
      crmp: "CRMP Patching",
      samp: "SAMP Patching",
      projects: "Projects Patching",
      wip_badge: "WIP",
      current_lang: "EN",
      alt_lang: "RU",
      theme_dark: "Dark Theme",
      theme_light: "Light Theme"
    },
    diagnostics: {
      title: "System Hardware Diagnostics",
      subtitle: "Evaluation of hardware and software components readiness for DirectX 9 to Vulkan translation",
      run_btn: "Run Diagnostics",
      running_btn: "Scanning components...",
      recheck_btn: "Re-run Diagnostics",
      ready_status: "System ready for diagnostics",
      scanning_status: "Analyzing drivers and graphics subsystem...",
      complete_status: "Diagnostics completed successfully",
      last_scan_label: "Last inspection:",
      never_scanned: "Not yet performed",
      system_score_label: "DXVK Readiness",
      system_score_val: "100%"
    },
    os: {
      card_title: "Operating System",
      card_subtitle: "Windows kernel and graphics subsystem configuration",
      badge_ready: "WDDM 3.x Ready",
      param_name: "OS Version",
      param_build: "Build & Revision",
      param_runtime: "DirectX Runtime",
      param_wddm: "WDDM Driver",
      runtime_val: "DirectX 12 (DirectX Agility SDK)",
      wddm_val: "WDDM 3.2 (Vulkan WSI compatible)",
      note: "Windows subsystem is optimized for Vulkan hardware descriptors and low frame latencies."
    },
    gpu: {
      card_title: "Graphics Card & DXVK Compatibility",
      card_subtitle: "Hardware acceleration and Vulkan API extension support",
      badge_ready: "Vulkan 1.3/1.4 Ready",
      param_model: "Graphics Processor (GPU)",
      param_vram: "Video Memory (VRAM)",
      param_driver: "Driver Version",
      param_directx: "DirectX Support",
      param_vulkan: "Vulkan API Loader",
      grid_title: "DXVK Version Compatibility Matrix",
      dxvk1103_title: "DXVK 1.10.3",
      dxvk1103_spec: "Vulkan 1.1 (Legacy D3D9)",
      dxvk1103_badge: "Full Compatibility",
      dxvk23_title: "DXVK 2.3",
      dxvk23_spec: "Vulkan 1.3 Baseline",
      dxvk23_badge: "Full Compatibility",
      dxvk30_title: "DXVK 3.0",
      dxvk30_spec: "Vulkan Extended Dynamic State",
      dxvk30_badge: "Supported",
      dxvk311_title: "DXVK 3.1.1",
      dxvk311_spec: "Current: Advanced shader pipelines",
      dxvk311_badge: "Recommended",
      verdict_title: "Compatibility Verdict",
      verdict_text: "Your graphics card fully supports DXVK 3.1.1 for GTA SA translation.",
      verdict_desc: "Full hardware pipeline compilation into GPU memory is available with zero first-launch stutters."
    },
    cpu: {
      card_title: "Processor & Vulkan Readiness",
      card_subtitle: "Multithreaded overhead and vector instruction set support",
      badge_ready: "Multithreading Active",
      param_model: "Processor Model",
      param_topology: "Cores & Threads",
      param_clock: "Clock Speed",
      param_instructions: "Instruction Sets",
      cores_suffix: "cores",
      threads_suffix: "threads",
      overhead_title: "CPU Power Reserve for Vulkan Rendering",
      overhead_status: "Ready for low-level Vulkan processing",
      overhead_desc: "DXVK translation relieves the single-threaded D3D9 driver, distributing draw calls across all logical CPU cores."
    },
    display: {
      card_title: "Display & Video Modes",
      card_subtitle: "Screen specifications, refresh rates, and HDR capabilities",
      badge_ready: "200 Hz High-FPS Ready",
      param_model: "Monitor Model",
      param_resolution: "Current Resolution",
      param_current_hz: "Current Refresh Rate",
      param_max_hz: "Maximum Refresh Rate",
      param_hdr: "HDR Support",
      param_colors: "Color Depth",
      param_vrr: "Variable Refresh Rate (VRR)",
      param_vulkan_wsi: "Vulkan Present Mode",
      note: "DXVK Vulkan translation allows GTA SA to run smoothly at high refresh rates (144-200 Hz) with synchronized physics."
    },
    patching: {
      wip_badge: "WIP",
      status_in_dev: "Module under active development",
      crmp_title: "CRMP Patching (GTA Criminal Russia)",
      crmp_desc: "DXVK translation integration for the CRMP client. Includes custom UI fixes, font crash prevention, and smooth frame rate synchronization.",
      samp_title: "SAMP Patching (San Andreas Multiplayer)",
      samp_desc: "Injection of optimized d3d9.dll and dxvk.conf libraries into the SA-MP directory with 2K/4K resolution support and rock-solid 60-144 FPS.",
      projects_title: "Projects & Custom Launchers Patching",
      projects_desc: "Universal patcher for Radmir, Province, Amazing, Arizona launchers with automatic bypass of file integrity check overwrites.",
      field_path_label: "Game directory path:",
      btn_browse: "Browse...",
      btn_apply: "Apply Vulkan Optimization",
      btn_restore: "Restore Original D3D9 Files",
      preset_label: "Recommended translator build:",
      preset_recommended: "DXVK 3.1.1 (Optimized for GTA SA)",
      preset_legacy: "DXVK 2.3 (Maximum legacy mods compatibility)",
      preset_custom: "DXVK 3.0 (Balanced compatibility)"
    },
    motion: {
      btn_patch: "Unpack & Patch Launcher",
      btn_install: "Install DXVK & 4GB RAM Patch",
      btn_restore: "Restore Originals",
      btn_launch: "Launch Motion Launcher",
      btn_test_widget: "Test Widget (5s)",
      section3_title: "Installation & Action Protocol",
      toast_widget_triggered: "5-second popup widget activated!",
      status_patched: "Launcher Status: Patched & Protected by SAPatcher",
      status_unpatched: "Launcher Status: Not Patched",
      guard_active: "Guard: ACTIVE",
      guard_inactive: "Guard: INACTIVE"
    },
    dialogs: {
      confirm_title: "Confirm Action",
      error_title: "System Notice",
      close: "Close",
      proceed: "Proceed",
      cancel: "Cancel"
    },
    toast: {
      diag_start: "Gathering hardware diagnostics data...",
      diag_success: "Diagnostics completed successfully. All systems ready for DXVK!",
      report_saved: "HTML report generated automatically in English: SAPatcher_Diagnostics_Report.html",
      diag_error: "Failed to collect system hardware data",
      wip_alert: "This feature will be available in the upcoming SAPatcher release.",
      lang_changed: "Interface language changed to English",
      theme_changed: "Visual theme updated"
    }
  };

  const I18nManager = {
    currentLang: localStorage.getItem('sapatcher_lang') || 'ru',
    locales: {
      ru: RU_FALLBACK,
      en: EN_FALLBACK
    },

    async init() {
      try {
        const ruRes = await fetch('locales/ru.json');
        if (ruRes.ok) this.locales.ru = await ruRes.json();
      } catch (e) {}

      try {
        const enRes = await fetch('locales/en.json');
        if (enRes.ok) this.locales.en = await enRes.json();
      } catch (e) {}

      this.applyLanguage(this.currentLang);
    },

    get(pathKey) {
      const parts = pathKey.split('.');
      let current = this.locales[this.currentLang] || this.locales.ru;
      for (const p of parts) {
        if (current && current[p] !== undefined) {
          current = current[p];
        } else {
          return pathKey;
        }
      }
      return current;
    },

    setLanguage(lang) {
      if (lang !== 'ru' && lang !== 'en') return;
      this.currentLang = lang;
      localStorage.setItem('sapatcher_lang', lang);
      document.documentElement.lang = lang;
      this.applyLanguage(lang);

      try {
        const msg = JSON.stringify({ action: 'saveSettings', settings: { language: lang } });
        if (window.external && typeof window.external.sendMessage === 'function') {
          window.external.sendMessage(msg);
        } else if (window.chrome && window.chrome.webview && typeof window.chrome.webview.postMessage === 'function') {
          window.chrome.webview.postMessage(msg);
        }
      } catch (e) {}

      if (typeof MotionProjectManager !== 'undefined' && typeof MotionProjectManager.checkPatchStatus === 'function') {
        MotionProjectManager.checkPatchStatus();
      }
    },

    toggle() {
      const nextLang = this.currentLang === 'ru' ? 'en' : 'ru';
      this.setLanguage(nextLang);
      Toast.show(this.get('toast.lang_changed'));
    },

    applyLanguage(lang) {
      const elements = document.querySelectorAll('[data-i18n]');
      elements.forEach((el) => {
        const key = el.getAttribute('data-i18n');
        const translation = this.get(key);
        if (translation && translation !== key) {
          if (el.tagName === 'INPUT' && el.type === 'text') {
            el.placeholder = translation;
          } else {
            el.textContent = translation;
          }
        }
      });

      const langCurrent = document.getElementById('langCurrent');
      const langAlt = document.getElementById('langAlt');
      if (langCurrent && langAlt) {
        if (lang === 'ru') {
          langCurrent.textContent = 'RU';
          langAlt.textContent = 'EN';
        } else {
          langCurrent.textContent = 'EN';
          langAlt.textContent = 'RU';
        }
      }
    }
  };

  const CanvasConstellation = {
    canvas: null,
    ctx: null,
    particles: [],
    particleCount: 52,
    maxDistance: 130,
    mouse: { x: null, y: null, radius: 150 },
    animationFrameId: null,

    init() {
      this.canvas = document.getElementById('bgCanvas');
      if (!this.canvas) return;
      this.ctx = this.canvas.getContext('2d');
      this.resize();

      window.addEventListener('resize', () => this.resize());
      window.addEventListener('mousemove', (e) => {
        this.mouse.x = e.clientX;
        this.mouse.y = e.clientY;
      });
      window.addEventListener('mouseleave', () => {
        this.mouse.x = null;
        this.mouse.y = null;
      });

      this.createParticles();
      this.animate();
    },

    resize() {
      if (!this.canvas) return;
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
    },

    createParticles() {
      this.particles = [];
      const w = this.canvas.width;
      const h = this.canvas.height;

      for (let i = 0; i < this.particleCount; i++) {
        this.particles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.45,
          vy: (Math.random() - 0.5) * 0.45,
          radius: Math.random() * 1.5 + 1.0,
          baseAlpha: Math.random() * 0.4 + 0.2
        });
      }
    },

    animate() {
      const ctx = this.ctx;
      const w = this.canvas.width;
      const h = this.canvas.height;

      ctx.clearRect(0, 0, w, h);

      for (let i = 0; i < this.particles.length; i++) {
        const p = this.particles[i];
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        if (p.y > h) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(56, 189, 248, ${p.baseAlpha})`;
        ctx.fill();

        for (let j = i + 1; j < this.particles.length; j++) {
          const p2 = this.particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < this.maxDistance) {
            const alpha = (1 - dist / this.maxDistance) * 0.18;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(99, 102, 241, ${alpha})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }

        if (this.mouse.x !== null && this.mouse.y !== null) {
          const mdx = p.x - this.mouse.x;
          const mdy = p.y - this.mouse.y;
          const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
          if (mdist < this.mouse.radius) {
            const malpha = (1 - mdist / this.mouse.radius) * 0.25;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(this.mouse.x, this.mouse.y);
            ctx.strokeStyle = `rgba(56, 189, 248, ${malpha})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }

      this.animationFrameId = requestAnimationFrame(() => this.animate());
    }
  };

  const Toast = {
    el: null,
    timer: null,

    init() {
      this.el = document.getElementById('toast');
    },

    show(msg, duration = 3400) {
      if (!this.el) return;
      this.el.textContent = msg;
      this.el.classList.add('show');

      if (this.timer) clearTimeout(this.timer);
      this.timer = setTimeout(() => {
        this.el.classList.remove('show');
      }, duration);
    }
  };

  const Dialogs = {
    confirmDialog: null,
    errorDialog: null,

    init() {
      this.confirmDialog = document.getElementById('confirmDialog');
      this.errorDialog = document.getElementById('errorDialog');

      const cancelBtn = document.getElementById('confirmDialogCancelBtn');
      const okBtn = document.getElementById('confirmDialogOkBtn');
      const errorCloseBtn = document.getElementById('errorDialogCloseBtn');

      if (cancelBtn) cancelBtn.addEventListener('click', () => this.confirmDialog.close());
      if (okBtn) okBtn.addEventListener('click', () => this.confirmDialog.close());
      if (errorCloseBtn) errorCloseBtn.addEventListener('click', () => this.errorDialog.close());

      document.querySelectorAll('.trigger-wip-dialog').forEach((btn) => {
        btn.addEventListener('click', () => {
          const feat = btn.getAttribute('data-feature') || 'Feature';
          this.showError(
            'SAP-4041',
            I18nManager.get('patching.status_in_dev'),
            `${feat}: ${I18nManager.get('patching.crmp_desc')}`
          );
        });
      });
    },

    showConfirm(title, msg, onConfirm) {
      if (!this.confirmDialog) return;
      document.getElementById('confirmDialogTitle').textContent = title;
      document.getElementById('confirmDialogMessage').textContent = msg;
      const okBtn = document.getElementById('confirmDialogOkBtn');
      const handler = () => {
        if (onConfirm) onConfirm();
        okBtn.removeEventListener('click', handler);
      };
      okBtn.addEventListener('click', handler);
      this.confirmDialog.showModal();
    },

    showError(code, title, msg) {
      if (!this.errorDialog) return;
      document.getElementById('errorDialogCode').textContent = `Error Code: ${code}`;
      document.getElementById('errorDialogTitle').textContent = title;
      document.getElementById('errorDialogMessage').textContent = msg;
      this.errorDialog.showModal();
    }
  };

  const Diagnostics = {
    isScanning: false,

    init() {
      const runBtn = document.getElementById('runDiagnosticsBtn');
      if (runBtn) {
        runBtn.addEventListener('click', () => this.run());
      }

      this.setupPhotinoBridge();
    },

    setupPhotinoBridge() {
      const handleMessage = (rawMessage) => {
        try {
          const data = typeof rawMessage === 'string' ? JSON.parse(rawMessage) : rawMessage;
          if (!data) return;
          const evt = data.event || data.Event;
          const payloadData = data.data !== undefined ? data.data : (data.Data !== undefined ? data.Data : data);
          if (!evt) return;

          if (evt === 'diagnosticsResult') {
            this.applyReport(payloadData);
          } else if (evt === 'diagnosticsError') {
            this.handleError(data.error || data.Error);
          } else if (evt === 'motionLauncherResult') {
            MotionProjectManager.handleDetectionResult(payloadData);
          } else if (evt === 'motionOptimizationResult') {
            MotionProjectManager.handleOptimizationResult(payloadData);
          } else if (evt === 'motionPatchStatusResult') {
            MotionProjectManager.handlePatchStatusResult(payloadData, data.gameIntegrity || payloadData?.gameIntegrity);
          } else if (evt === 'gameIntegrityResult') {
            MotionProjectManager.handleGameIntegrityResult(payloadData);
          } else if (evt === 'apply4GbPatchResult') {
            MotionProjectManager.handleApply4GbPatchResult(data);
          } else if (evt === 'gameFingerprintResult') {
            MotionProjectManager.handleGameFingerprintResult(data);
          } else if (evt === 'gamePathSelected') {
            MotionProjectManager.handleGamePathSelected(data);
          } else if (evt === 'launcherPathSelected') {
            MotionProjectManager.handleLauncherPathSelected(data);
          } else if (evt === 'gamePathUpdated') {
            MotionProjectManager.handleGamePathUpdated(data);
          } else if (evt === 'motionPatchResult') {
            MotionProjectManager.handlePatchResult(payloadData);
          } else if (evt === 'motionRestoreResult') {
            MotionProjectManager.handleRestoreResult(payloadData);
          } else if (evt === 'settingsLoaded') {
            MotionProjectManager.applyLoadedSettings(payloadData);
          } else if (evt === 'launcherStarted') {
            MotionProjectManager.onLauncherStarted(payloadData);
          } else if (evt === 'launcherViolation') {
            MotionProjectManager.onLauncherViolation(payloadData);
          }
        } catch (e) {
          console.error('Failed to parse IPC message', e);
        }
      };

      if (window.external && typeof window.external.receiveMessage === 'function') {
        window.external.receiveMessage(handleMessage);
      }
      if (window.chrome && window.chrome.webview && typeof window.chrome.webview.addEventListener === 'function') {
        window.chrome.webview.addEventListener('message', (e) => handleMessage(e.data));
      }

      // Initial queries for persistent settings and patch status
      setTimeout(() => {
        try {
          const send = (obj) => {
            const s = JSON.stringify(obj);
            if (window.external && typeof window.external.sendMessage === 'function') {
              window.external.sendMessage(s);
            } else if (window.chrome && window.chrome.webview && typeof window.chrome.webview.postMessage === 'function') {
              window.chrome.webview.postMessage(s);
            }
          };
          send({ action: 'getSettings' });
          send({ action: 'checkMotionPatchStatus' });
        } catch (e) {}
      }, 100);
    },

    run() {
      if (this.isScanning) return;
      this.setLoadingState(true);
      Toast.show(I18nManager.get('toast.diag_start'));

      const msg = JSON.stringify({ action: 'runCheck' });
      if (window.external && typeof window.external.sendMessage === 'function') {
        window.external.sendMessage(msg);
      } else if (window.chrome && window.chrome.webview && typeof window.chrome.webview.postMessage === 'function') {
        window.chrome.webview.postMessage(msg);
      } else {
        setTimeout(() => {
          this.applyReport(this.getMockReport());
        }, 1200);
      }
    },

    setLoadingState(loading) {
      this.isScanning = loading;
      const btn = document.getElementById('runDiagnosticsBtn');
      const dot = document.getElementById('systemStatusDot');
      const text = document.getElementById('systemStatusText');

      if (loading) {
        if (btn) {
          btn.classList.add('loading');
          const btnText = btn.querySelector('.btn-text');
          if (btnText) btnText.textContent = I18nManager.get('diagnostics.running_btn');
        }
        if (dot) {
          dot.className = 'status-dot-inline status-dot--scanning';
        }
        if (text) {
          text.textContent = I18nManager.get('diagnostics.scanning_status');
        }
      } else {
        if (btn) {
          btn.classList.remove('loading');
          const btnText = btn.querySelector('.btn-text');
          if (btnText) btnText.textContent = I18nManager.get('diagnostics.recheck_btn');
        }
        if (dot) {
          dot.className = 'status-dot-inline status-dot--ready';
        }
        if (text) {
          text.textContent = I18nManager.get('diagnostics.complete_status');
        }
      }
    },

    applyReport(report) {
      if (!report) return;

      if (report.os) {
        const osName = document.getElementById('osNameVal');
        const osBuild = document.getElementById('osBuildVal');
        const osRuntime = document.getElementById('osRuntimeVal');
        const osWddm = document.getElementById('osWddmVal');

        if (osName) osName.textContent = report.os.name;
        if (osBuild) osBuild.textContent = report.os.versionBuild;
        if (osRuntime) osRuntime.textContent = report.os.directXRuntime;
        if (osWddm) osWddm.textContent = report.os.wddmStatus;
      }

      if (report.gpu) {
        const gpuModel = document.getElementById('gpuModelVal');
        const gpuVram = document.getElementById('gpuVramVal');
        const gpuDriver = document.getElementById('gpuDriverVal');
        const gpuDirectx = document.getElementById('gpuDirectxVal');
        const gpuVulkan = document.getElementById('gpuVulkanVal');

        if (gpuModel) gpuModel.textContent = report.gpu.model;
        if (gpuVram) gpuVram.textContent = report.gpu.vram;
        if (gpuDriver) gpuDriver.textContent = report.gpu.driverVersion;
        if (gpuDirectx) gpuDirectx.textContent = report.gpu.directXSupport;
        if (gpuVulkan) gpuVulkan.textContent = report.gpu.vulkanSupport;

        const verdictTitle = document.getElementById('gpuVerdictTitle');
        const verdictDesc = document.getElementById('gpuVerdictDesc');
        if (verdictTitle) verdictTitle.textContent = I18nManager.get(report.gpu.verdictTextKey || 'gpu.verdict_text');
        if (verdictDesc) verdictDesc.textContent = I18nManager.get(report.gpu.verdictDescKey || 'gpu.verdict_desc');
      }

      if (report.cpu) {
        const cpuModel = document.getElementById('cpuModelVal');
        const cpuTopology = document.getElementById('cpuTopologyVal');
        const cpuClock = document.getElementById('cpuClockVal');
        const sse42 = document.getElementById('sse42Badge');
        const avx2 = document.getElementById('avx2Badge');
        const overheadScore = document.getElementById('cpuOverheadScore');
        const overheadBar = document.getElementById('cpuOverheadBar');
        const overheadStatus = document.getElementById('cpuOverheadStatus');

        if (cpuModel) cpuModel.textContent = report.cpu.model;
        if (cpuTopology) {
          const cSuffix = I18nManager.get('cpu.cores_suffix');
          const tSuffix = I18nManager.get('cpu.threads_suffix');
          cpuTopology.textContent = `${report.cpu.cores} ${cSuffix} / ${report.cpu.threads} ${tSuffix}`;
        }
        if (cpuClock) cpuClock.textContent = report.cpu.clockSpeed;

        if (sse42) {
          if (report.cpu.sse42) sse42.classList.add('active');
          else sse42.classList.remove('active');
        }
        if (avx2) {
          if (report.cpu.avx2) avx2.classList.add('active');
          else avx2.classList.remove('active');
        }

        const pct = report.cpu.overheadPercent || 92;
        if (overheadScore) overheadScore.textContent = `${pct}%`;
        if (overheadBar) overheadBar.style.width = `${pct}%`;
        if (overheadStatus) overheadStatus.textContent = I18nManager.get(report.cpu.overheadStatusKey || 'cpu.overhead_status');
      }

      if (report.display) {
        const displayModel = document.getElementById('displayModelVal');
        const displayRes = document.getElementById('displayResVal');
        const displayCurrentHz = document.getElementById('displayCurrentHzVal');
        const displayMaxHz = document.getElementById('displayMaxHzVal');
        const displayHdr = document.getElementById('displayHdrVal');
        const displayColor = document.getElementById('displayColorVal');
        const displayVrr = document.getElementById('displayVrrVal');
        const displayVulkanWsi = document.getElementById('displayVulkanWsiVal');
        const displayBadge = document.getElementById('displayBadge');

        if (displayModel) displayModel.textContent = report.display.model;
        if (displayRes) displayRes.textContent = report.display.resolution;
        if (displayCurrentHz) displayCurrentHz.textContent = report.display.currentHz;
        if (displayMaxHz) displayMaxHz.textContent = report.display.maxHz;
        if (displayHdr) displayHdr.textContent = report.display.hdrStatus;
        if (displayColor) displayColor.textContent = report.display.colorDepth;
        if (displayVrr) displayVrr.textContent = report.display.vrrStatus;
        if (displayVulkanWsi) displayVulkanWsi.textContent = report.display.vulkanPresentMode;
        if (displayBadge && report.display.badgeText) displayBadge.textContent = report.display.badgeText;
        if (report.display.currentHz) {
          MotionProjectManager.updateDetectedMonitorHz(report.display.currentHz);
        }
      }

      this.setLoadingState(false);
      Toast.show(I18nManager.get('toast.diag_success') + ' ' + I18nManager.get('toast.report_saved'), 4500);
    },

    handleError(errMsg) {
      this.setLoadingState(false);
      Dialogs.showError('SAP-5020', I18nManager.get('toast.diag_error'), errMsg);
    },

    getMockReport() {
      return {
        os: {
          name: "Windows 11 Pro 64-bit",
          versionBuild: "25H2 (Build 26200.1742)",
          displayVersion: "25H2",
          buildNumber: "26200",
          ubr: "1742",
          is64Bit: true,
          directXRuntime: "DirectX 12 (DirectX Agility SDK)",
          wddmStatus: "WDDM 3.2 (Vulkan WSI совместим)",
          statusReady: true
        },
        gpu: {
          model: "NVIDIA GeForce RTX 3060 Ti",
          vram: "8192 MB (8 GB GDDR6)",
          driverVersion: "591.86 (DirectX / Vulkan)",
          directXSupport: "DirectX 12 (FL 12_2 Ultimate)",
          vulkanSupport: "Vulkan Loader 1.4.321.0 (vulkan-1.dll)",
          vulkanLoaderVersion: "1.4.321.0",
          vulkanFound: true,
          verdictTextKey: "gpu.verdict_text",
          verdictDescKey: "gpu.verdict_desc"
        },
        cpu: {
          model: "AMD Ryzen 5 2600 Six-Core",
          cores: 6,
          threads: 12,
          clockSpeed: "3.40 GHz (3400 MHz)",
          clockMhz: 3400,
          sse42: true,
          avx2: true,
          overheadPercent: 92,
          overheadStatusKey: "cpu.overhead_status",
          overheadDescKey: "cpu.overhead_desc"
        },
        display: {
          model: "Acer KG271U X1 (27\" QHD Gaming Display)",
          resolution: "2560 × 1440 (2K QHD)",
          currentHz: "200 Hz",
          maxHz: "200 Hz",
          hdrStatus: "HDR10 (High Dynamic Range) Supported",
          hdrSupported: true,
          colorDepth: "10-bit HDR / 8-bit + FRC (1.07 Billion Colors)",
          vrrStatus: "AMD FreeSync Premium / G-Sync Compatible (Active)",
          vulkanPresentMode: "VK_PRESENT_MODE_MAILBOX_KHR (Low Latency Fast-Sync) & FIFO",
          badgeText: "200 Hz High-FPS Ready"
        }
      };
    }
  };

  const MotionProjectManager = {
    detectedData: null,
    detectedMonitorHz: 200,
    isInstalling: false,
    updateFpsLimiterUI: null,

    init() {
      this.bindEvents();
      this.detectLauncher();

      const currentHzEl = document.getElementById('displayCurrentHzVal');
      if (currentHzEl && currentHzEl.textContent) {
        this.updateDetectedMonitorHz(currentHzEl.textContent);
      }
    },

    updateDetectedMonitorHz(hz) {
      const numHz = parseInt(hz, 10);
      if (!numHz || isNaN(numHz)) return;
      this.detectedMonitorHz = numHz;

      const autoBtn = document.getElementById('fpsPresetAutoMonitor');
      const hzSpan = document.getElementById('fpsPresetAutoHz');
      if (autoBtn) {
        autoBtn.dataset.fps = numHz.toString();
      }
      if (hzSpan) {
        hzSpan.textContent = numHz.toString();
      }

      const maxFpsInput = document.getElementById('motionMaxFpsInput');
      if (maxFpsInput && !maxFpsInput.dataset.userEdited) {
        maxFpsInput.value = numHz.toString();
        const fpsPresetBtns = document.querySelectorAll('.fps-preset-btn');
        fpsPresetBtns.forEach((b) => {
          if (b.dataset.fps === numHz.toString()) b.classList.add('active');
          else b.classList.remove('active');
        });
        if (typeof this.updateFpsLimiterUI === 'function') {
          this.updateFpsLimiterUI();
        }
      }
    },

    bindEvents() {
      const rescanBtn = document.getElementById('motionRescanBtn');
      const rescanAllBtn = document.getElementById('projectsRescanAllBtn');
      const browseBtn = document.getElementById('motionBrowseBtn');
      const openFolderBtn = document.getElementById('motionOpenFolderBtn');
      const installBtn = document.getElementById('motionInstallBtn');
      const restoreBtn = document.getElementById('motionRestoreBtn');
      const launchBtn = document.getElementById('motionLaunchBtn');
      const clearTerminalBtn = document.getElementById('motionClearTerminalBtn');
      const filterTags = document.querySelectorAll('.filter-tag');

      if (rescanBtn) rescanBtn.addEventListener('click', () => this.detectLauncher(true));
      if (rescanAllBtn) rescanAllBtn.addEventListener('click', () => this.detectLauncher(true));

      if (browseBtn) {
        browseBtn.addEventListener('click', () => {
          const input = document.getElementById('motionLauncherPathInput');
          const currentPath = input ? input.value : '';
          this.sendIpc({ action: 'browseLauncherPath', currentPath });
        });
      }

      const saveGameBtn = document.getElementById('motionSaveGamePathBtn');
      if (saveGameBtn) {
        saveGameBtn.addEventListener('click', () => {
          const input = document.getElementById('motionGamePathInput');
          const path = input ? input.value.trim() : '';
          if (path) {
            this.sendIpc({ action: 'setGamePath', path });
            Toast.show(I18nManager.currentLang === 'en' ? 'Game path applied: ' + path : 'Каталог игры сохранён: ' + path, 3000);
            this.logToTerminal(`[GAME_PATH] Каталог игры зафиксирован: ${path}`, 'success');
          } else {
            Toast.show(I18nManager.currentLang === 'en' ? 'Please enter game folder path' : 'Укажите путь к папке игры', 3000);
          }
        });
      }

      const browseGameBtn = document.getElementById('motionBrowseGamePathBtn');
      if (browseGameBtn) {
        browseGameBtn.addEventListener('click', () => {
          const input = document.getElementById('motionGamePathInput');
          const currentPath = input ? input.value : '';
          this.sendIpc({ action: 'browseGamePath', currentPath });
        });
      }

      const browseGameFileBtn = document.getElementById('motionBrowseGameFileBtn');
      if (browseGameFileBtn) {
        browseGameFileBtn.addEventListener('click', () => {
          const input = document.getElementById('motionGamePathInput');
          const currentPath = input ? input.value : '';
          this.sendIpc({ action: 'browseGameExeFile', currentPath });
        });
      }

      const detectGameBtn = document.getElementById('motionDetectGamePathBtn');
      if (detectGameBtn) {
        detectGameBtn.addEventListener('click', () => {
          Toast.show(I18nManager.currentLang === 'en' ? 'Detecting game path from Motion Launcher config...' : 'Поиск пути к игре в конфиге Motion Launcher...');
          this.sendIpc({ action: 'detectGamePathFromLauncher' });
        });
      }

      const openGameFolderBtn = document.getElementById('motionOpenGameFolderBtn');
      if (openGameFolderBtn) {
        openGameFolderBtn.addEventListener('click', () => {
          const input = document.getElementById('motionGamePathInput');
          const path = input ? input.value : '';
          this.sendIpc({ action: 'openMotionFolder', path });
          Toast.show('Открытие папки игры...');
        });
      }

      const gamePathInput = document.getElementById('motionGamePathInput');
      if (gamePathInput) {
        gamePathInput.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            const path = gamePathInput.value.trim();
            if (path) {
              this.sendIpc({ action: 'setGamePath', path });
              Toast.show(I18nManager.currentLang === 'en' ? 'Game path applied: ' + path : 'Каталог игры сохранён: ' + path, 3000);
              this.logToTerminal(`[GAME_PATH] Каталог игры зафиксирован: ${path}`, 'success');
            }
          }
        });
        gamePathInput.addEventListener('change', () => {
          const path = gamePathInput.value.trim();
          if (path) {
            this.sendIpc({ action: 'setGamePath', path });
          }
        });
      }

      if (openFolderBtn) {
        openFolderBtn.addEventListener('click', () => {
          const input = document.getElementById('motionLauncherPathInput');
          const path = input ? input.value : '';
          this.sendIpc({ action: 'openMotionFolder', path });
          Toast.show('Открытие папки Motion Launcher...');
        });
      }

      if (launchBtn) {
        launchBtn.addEventListener('click', () => {
          const input = document.getElementById('motionLauncherPathInput');
          const path = input ? input.value : '';
          this.sendIpc({ action: 'launchMotionLauncher', path });
          Toast.show(I18nManager.get('toast.motion_launched'));
          this.logToTerminal('[LAUNCH] Запуск исполняемого файла: ' + path, 'info');
        });
      }

      if (installBtn) {
        installBtn.addEventListener('click', () => this.installOptimization());
      }

      const patchBtn = document.getElementById('motionPatchBtn');
      if (patchBtn) {
        patchBtn.addEventListener('click', () => this.patchLauncher());
      }

      const testWidgetBtn = document.getElementById('motionTestWidgetBtn');
      if (testWidgetBtn) {
        testWidgetBtn.addEventListener('click', () => {
          this.sendIpc({ action: 'testWidget', launcher: 'Motion Launcher' });
          Toast.show(I18nManager.currentLang === 'en' ? '5-second popup widget activated!' : 'Всплывающий 5-секундный виджет активирован!');
        });
      }

      const gameGuardVerifyBtn = document.getElementById('gameGuardVerifyBtn');
      if (gameGuardVerifyBtn) {
        gameGuardVerifyBtn.addEventListener('click', () => this.checkGameIntegrity());
      }

      const gameGuardFingerprintBtn = document.getElementById('gameGuardFingerprintBtn');
      if (gameGuardFingerprintBtn) {
        gameGuardFingerprintBtn.addEventListener('click', () => this.generateGameFingerprint());
      }

      if (restoreBtn) {
        restoreBtn.addEventListener('click', () => this.restoreOriginals());
      }

      if (clearTerminalBtn) {
        clearTerminalBtn.addEventListener('click', () => {
          const terminal = document.getElementById('motionTerminalLog');
          if (terminal) terminal.innerHTML = '<div class="log-line log-line--info">[SYSTEM] Консоль очищена.</div>';
        });
      }

      const radioCards = document.querySelectorAll('.dxvk-radio-card');
      const tearFreeOrLatencyLabel = document.getElementById('tearFreeOrLatencyLabel');
      const limiterSyntaxHint = document.getElementById('limiterSyntaxHint');

      const updateDxvkVersionSpecifics = (ver) => {
        if (tearFreeOrLatencyLabel) {
          if (ver === '1.10.3') {
            tearFreeOrLatencyLabel.textContent = 'd3d9.maxFrameLatency = 1 & deferSurfaceCreation = True';
          } else {
            tearFreeOrLatencyLabel.textContent = 'dxvk.tearFree = True & syncInterval = 0';
          }
        }
        updateFpsLimiter();
      };

      radioCards.forEach((card) => {
        card.addEventListener('click', () => {
          radioCards.forEach((c) => c.classList.remove('active'));
          card.classList.add('active');
          const radio = card.querySelector('input[type="radio"]');
          if (radio) radio.checked = true;
          const ver = card.dataset.version;
          updateDxvkVersionSpecifics(ver);
          this.logToTerminal(`[SELECT] Выбрана ветка транслятора: DXVK ${ver}`, 'detect');
        });
      });

      // 1. Independent Frame Rate Limiter Controls
      const fpsLimitCb = document.getElementById('motionEnableFpsLimit');
      const limiterBody = document.getElementById('limiterBody');
      const maxFpsInput = document.getElementById('motionMaxFpsInput');
      const limiterTargetBadge = document.getElementById('limiterTargetBadge');
      const fpsPresetBtns = document.querySelectorAll('.fps-preset-btn');

      const updateFpsLimiter = () => {
        if (!fpsLimitCb || !limiterTargetBadge) return;
        const curVerRadio = document.querySelector('input[name="motionDxvkVer"]:checked');
        const curVer = curVerRadio ? curVerRadio.value : '3.1.1';
        const fps = maxFpsInput ? (maxFpsInput.value || '200') : '200';
        const monitorHz = MotionProjectManager.detectedMonitorHz || 200;

        if (fpsLimitCb.checked) {
          if (limiterBody) limiterBody.classList.remove('disabled');
          if (maxFpsInput) maxFpsInput.disabled = false;
          limiterTargetBadge.textContent = `${fps} FPS`;
          limiterTargetBadge.className = 'badge badge-success font-mono';
          if (limiterSyntaxHint) {
            limiterSyntaxHint.textContent = curVer === '1.10.3'
              ? `DXVK 1.10.3: d3d9.maxFrameRate = ${fps} (низкая задержка / синхронизировано с монитором ${monitorHz} Hz)`
              : `DXVK 2.3+: dxvk.maxFrameRate = ${fps} (плавный рендеринг / синхронизировано с монитором ${monitorHz} Hz)`;
          }
        } else {
          if (limiterBody) limiterBody.classList.add('disabled');
          if (maxFpsInput) maxFpsInput.disabled = true;
          limiterTargetBadge.textContent = 'Без ограничений';
          limiterTargetBadge.className = 'badge badge-ghost font-mono';
          if (limiterSyntaxHint) {
            limiterSyntaxHint.textContent = curVer === '1.10.3'
              ? '# d3d9.maxFrameRate = 200 (лимитер кадров отключен)'
              : '# dxvk.maxFrameRate = 200 (лимитер кадров отключен)';
          }
        }
      };

      this.updateFpsLimiterUI = updateFpsLimiter;

      if (fpsLimitCb) {
        fpsLimitCb.addEventListener('change', updateFpsLimiter);
      }

      fpsPresetBtns.forEach((btn) => {
        btn.addEventListener('click', () => {
          fpsPresetBtns.forEach((b) => b.classList.remove('active'));
          btn.classList.add('active');
          if (maxFpsInput) {
            maxFpsInput.dataset.userEdited = 'true';
            maxFpsInput.value = btn.dataset.fps;
            updateFpsLimiter();
          }
        });
      });

      if (maxFpsInput) {
        maxFpsInput.addEventListener('input', () => {
          maxFpsInput.dataset.userEdited = 'true';
          const val = maxFpsInput.value;
          fpsPresetBtns.forEach((b) => {
            if (b.dataset.fps === val) {
              b.classList.add('active');
            } else {
              b.classList.remove('active');
            }
          });
          updateFpsLimiter();
        });
      }

      // 2. Purely HUD Overlay Controls (Totally independent from Limiter)
      const hudEnableCb = document.getElementById('motionEnableHud');
      const hudOptionsBody = document.getElementById('hudOptionsBody');
      const hudPreviewBadge = document.getElementById('hudPreviewBadge');
      const elemCheckboxes = document.querySelectorAll('.hud-elem-cb');
      const hudScaleSlider = document.getElementById('motionHudScaleSlider');
      const hudScaleVal = document.getElementById('hudScaleVal');
      const hudXInput = document.getElementById('motionHudXInput');
      const hudYInput = document.getElementById('motionHudYInput');
      const coordPresets = document.querySelectorAll('.coord-preset-btn');

      const updateHudPreview = () => {
        if (!hudEnableCb || !hudPreviewBadge) return;
        if (!hudEnableCb.checked) {
          hudPreviewBadge.textContent = 'dxvk.hud = 0 (Оверлей отключен)';
          hudPreviewBadge.className = 'badge badge-ghost font-mono';
          if (hudOptionsBody) hudOptionsBody.classList.add('disabled');
        } else {
          if (hudOptionsBody) hudOptionsBody.classList.remove('disabled');
          const checked = Array.from(document.querySelectorAll('.hud-elem-cb:checked')).map((cb) => cb.value);
          const val = checked.length > 0 ? checked.join(',') : '0';
          hudPreviewBadge.textContent = `dxvk.hud = ${val}`;
          hudPreviewBadge.className = 'badge badge-cyan font-mono';
        }
      };

      if (hudEnableCb) {
        hudEnableCb.addEventListener('change', updateHudPreview);
      }

      elemCheckboxes.forEach((cb) => {
        cb.addEventListener('change', updateHudPreview);
      });

      if (hudScaleSlider && hudScaleVal) {
        hudScaleSlider.addEventListener('input', (e) => {
          hudScaleVal.textContent = parseFloat(e.target.value).toFixed(2);
        });
      }

      coordPresets.forEach((btn) => {
        btn.addEventListener('click', () => {
          coordPresets.forEach((b) => b.classList.remove('active'));
          btn.classList.add('active');
          if (hudXInput) hudXInput.value = btn.dataset.x;
          if (hudYInput) hudYInput.value = btn.dataset.y;
        });
      });

      const handleCoordChange = () => {
        const curX = hudXInput ? hudXInput.value : '';
        const curY = hudYInput ? hudYInput.value : '';
        coordPresets.forEach((b) => {
          if (b.dataset.x === curX && b.dataset.y === curY) {
            b.classList.add('active');
          } else {
            b.classList.remove('active');
          }
        });
      };
      if (hudXInput) hudXInput.addEventListener('input', handleCoordChange);
      if (hudYInput) hudYInput.addEventListener('input', handleCoordChange);
    },

    sendIpc(msgObj) {
      const json = JSON.stringify(msgObj);
      if (window.external && typeof window.external.sendMessage === 'function') {
        window.external.sendMessage(json);
        return true;
      } else if (window.chrome && window.chrome.webview && typeof window.chrome.webview.postMessage === 'function') {
        window.chrome.webview.postMessage(json);
        return true;
      }
      return false;
    },

    detectLauncher(notify = false) {
      if (notify) Toast.show('Поиск Motion Launcher в системе...');
      this.logToTerminal('[SCAN] Поиск Motion Launcher в %LOCALAPPDATA% и папке проекта...', 'detect');

      const sent = this.sendIpc({ action: 'detectMotionLauncher' });
      if (!sent) {
        setTimeout(() => {
          this.handleDetectionResult(this.getMockDetection());
        }, 300);
      }
    },

    handleDetectionResult(data) {
      if (!data) return;
      this.detectedData = data;

      const pathInput = document.getElementById('motionLauncherPathInput');
      const sourceBadge = document.getElementById('motionSourceBadge');
      const tileStatusBadge = document.getElementById('tileMotionStatusBadge');
      const dirVal = document.getElementById('motionDetailDir');
      const verVal = document.getElementById('motionDetailVersion');
      const sizeVal = document.getElementById('motionDetailSize');
      const statusVal = document.getElementById('motionDetailStatus');
      const tileVer = document.getElementById('tileMotionVersion');

      if (data.found) {
        if (pathInput) pathInput.value = data.path;
        if (sourceBadge) {
          sourceBadge.textContent = data.source || 'Обнаружен';
          sourceBadge.className = 'badge badge-success font-mono';
        }
        if (tileStatusBadge) {
          tileStatusBadge.innerHTML = '<span class="status-dot-inline status-dot--ready"></span><span>' + I18nManager.get('projects.motion_status_detected') + '</span>';
        }
        if (dirVal) dirVal.textContent = data.directory || '%LOCALAPPDATA%\\motion-launcher';
        if (verVal) verVal.textContent = (data.version || '1.2.46') + ' (' + (data.appFolderPath ? data.appFolderPath.split('\\').pop() : 'app-1.2.46') + ')';
        if (sizeVal) sizeVal.textContent = data.fileSizeFormatted || '381.5 КБ (Squirrel Launcher)';
        if (statusVal) {
          statusVal.textContent = I18nManager.get('motion.detail_status_ok');
          statusVal.className = 'detail-val font-mono text-emerald';
        }
        if (tileVer) tileVer.textContent = 'v' + (data.version || '1.2.46');

        this.logToTerminal(`[FOUND] Лаунчер обнаружен: ${data.path}`, 'success');
        this.logToTerminal(`[INFO] Версия Squirrel: ${data.version || '1.2.46'} | Размер: ${data.fileSizeFormatted || '381.5 KB'}`, 'info');

        // Check and apply game path: prioritize user-configured saved path, otherwise use discovered path from launcher
        const activeGame = (data.savedGamePath && data.savedGamePath.trim())
          ? data.savedGamePath.trim()
          : (data.discoveredGamePath ? data.discoveredGamePath.trim() : '');
        if (activeGame) {
          this.updateGamePathUI(activeGame);
        }
      } else {
        if (tileStatusBadge) {
          tileStatusBadge.innerHTML = '<span class="status-dot-inline status-dot--scanning"></span><span>' + I18nManager.get('projects.motion_status_not_found') + '</span>';
        }
        if (sourceBadge) {
          sourceBadge.textContent = 'Не найден';
          sourceBadge.className = 'badge badge-ghost font-mono';
        }
        if (statusVal) {
          statusVal.textContent = 'Укажите путь вручную';
          statusVal.className = 'detail-val font-mono';
        }
        this.logToTerminal('[WARN] Motion Launcher не обнаружен по стандартным путям.', 'warn');
      }
    },

    installOptimization() {
      if (this.isInstalling) return;
      this.isInstalling = true;

      const pathInput = document.getElementById('motionLauncherPathInput');
      const launcherPath = pathInput ? pathInput.value : '';

      const selectedVerRadio = document.querySelector('input[name="motionDxvkVer"]:checked');
      const dxvkVersion = selectedVerRadio ? selectedVerRadio.value : '3.1.1';

      const laaCheckbox = document.getElementById('motionEnable4gbPatch');
      const enable4gb = laaCheckbox ? laaCheckbox.checked : true;

      // HUD parameters
      const hudEnableCb = document.getElementById('motionEnableHud');
      const enableHud = hudEnableCb ? hudEnableCb.checked : true;

      const checkedElemCbs = document.querySelectorAll('.hud-elem-cb:checked');
      const hudElements = Array.from(checkedElemCbs).map((cb) => cb.value).join(',');

      const hudScaleSlider = document.getElementById('motionHudScaleSlider');
      const hudScale = hudScaleSlider ? parseFloat(hudScaleSlider.value) : 0.75;

      const hudXInput = document.getElementById('motionHudXInput');
      const hudX = hudXInput ? parseInt(hudXInput.value, 10) : 1800;

      const hudYInput = document.getElementById('motionHudYInput');
      const hudY = hudYInput ? parseInt(hudYInput.value, 10) : 20;

      // FPS Limiter
      const fpsLimitCb = document.getElementById('motionEnableFpsLimit');
      const enableFpsLimit = fpsLimitCb ? fpsLimitCb.checked : true;

      const maxFpsInput = document.getElementById('motionMaxFpsInput');
      const maxFrameRate = maxFpsInput ? parseInt(maxFpsInput.value, 10) : 200;

      // Tweaks checkboxes
      const seamlessCb = document.getElementById('motionSeamless');
      const enableSeamless = seamlessCb ? seamlessCb.checked : true;

      const tearFreeCb = document.getElementById('motionTearFree');
      const enableTearFree = tearFreeCb ? tearFreeCb.checked : true;

      const presentIntervalCb = document.getElementById('motionPresentInterval');
      const enableVsyncOff = presentIntervalCb ? presentIntervalCb.checked : true;

      // STRICT GUARD: Cannot install DXVK & 4GB patch until launcher is patched!
      const isPatched = Boolean(this.patchStatus && (this.patchStatus.isPatched === true || this.patchStatus.IsPatched === true));
      if (!isPatched) {
        const isEn = I18nManager.currentLang === 'en';
        Toast.show(isEn
          ? 'Installation blocked: Please patch the launcher first using "Unpack & Patch Launcher"!'
          : 'Установка заблокирована: Сначала необходимо распаковать и пропатчить лаунчер!', 5000);
        this.logToTerminal('------------------------------------------------------------', 'error');
        this.logToTerminal(isEn
          ? '[SECURITY_ALERT] Installation of DXVK and 4GB LAA is blocked: Launcher is not patched yet!'
          : '[ЗАЩИТА] Установка DXVK и 4GB LAA заблокирована: лаунчер ещё не пропатчен!', 'error');
        this.logToTerminal(isEn
          ? '[HINT] Click "Unpack & Patch Launcher" above to secure and unlock the installer.'
          : '[ПОДСКАЗКА] Нажмите «Распаковать и пропатчить лаунчер» для разблокировки.', 'warn');
        const patchBtn = document.getElementById('motionPatchBtn');
        if (patchBtn) {
          patchBtn.classList.add('animate-pulse');
          setTimeout(() => patchBtn.classList.remove('animate-pulse'), 3000);
        }
        return;
      }

      const btn = document.getElementById('motionInstallBtn');
      if (btn) btn.classList.add('loading');

      this.logToTerminal('------------------------------------------------------------', 'hint');
      this.logToTerminal(`[START] Запуск установки пакета оптимизации Motion Project...`, 'hint');
      this.logToTerminal(`[CONFIG] DXVK ${dxvkVersion} (32-бит) | Патч 4GB ОЗУ (LAA): ${enable4gb ? 'АКТИВЕН' : 'ОТКЛЮЧЕН'}`, 'info');
      this.logToTerminal(`[HUD] ${enableHud ? `dxvk.hud = ${hudElements || '0'} | Scale: ${hudScale} | Pos: (${hudX}, ${hudY})` : 'dxvk.hud отключен'}`, 'info');
      this.logToTerminal(`[LIMITER] ${enableFpsLimit ? `Лимит: ${maxFrameRate} FPS (${dxvkVersion === '1.10.3' ? 'd3d9.maxFrameRate' : 'dxvk.maxFrameRate'})` : 'Лимитер кадров отключен'}`, 'info');
      this.logToTerminal(`[TWEAKS] Seamless: ${enableSeamless} | TearFree/Latency: ${enableTearFree} | V-Sync Off: ${enableVsyncOff}`, 'info');

      const gamePathInput = document.getElementById('motionGamePathInput');
      const gamePath = (gamePathInput && gamePathInput.value.trim()) ? gamePathInput.value.trim() : launcherPath;

      const requestPayload = {
        action: 'applyMotionOptimization',
        launcherPath,
        gamePath,
        dxvkVersion,
        enable4gbPatch: enable4gb,
        enableHud,
        hudElements,
        hudScale,
        hudX,
        hudY,
        enableFpsLimit,
        maxFrameRate,
        enableSeamless,
        enableTearFree,
        enableVsyncOff
      };

      const sent = this.sendIpc(requestPayload);
      if (!sent) {
        setTimeout(() => {
          const limiterParam = dxvkVersion === '1.10.3' ? `d3d9.maxFrameRate = ${maxFrameRate}` : `dxvk.maxFrameRate = ${maxFrameRate}`;
          const tearParam = dxvkVersion === '1.10.3' ? 'd3d9.maxFrameLatency = 1 | d3d9.deferSurfaceCreation = True' : 'dxvk.tearFree = True | dxvk.syncInterval = 0';
          this.handleOptimizationResult({
            success: true,
            dxvkVersionApplied: dxvkVersion,
            laaApplied: enable4gb,
            logs: [
              `[DIR] Рабочая директория: %LOCALAPPDATA%\\motion-launcher`,
              `[DXVK] Развертывание 32-битных библиотек DXVK ${dxvkVersion} (d3d9.dll)`,
              `[CONF] Генерация dxvk.conf (версия ${dxvkVersion}):`,
              `       d3d9.seamless = True | d3d9.presentInterval = 0`,
              `       ${tearParam}`,
              `       ${enableFpsLimit ? limiterParam : '# Frame limiter disabled'}`,
              `       ${enableHud ? `dxvk.hud = ${hudElements} (Scale: ${hudScale}, X: ${hudX}, Y: ${hudY})` : '# HUD disabled'}`,
              `[LAA] ${enable4gb ? 'Патч 4 ГБ ОЗУ (Large Address Aware) успешно применен к игровому образу' : 'Патч 4 ГБ ОЗУ пропущен'}`,
              `[SUCCESS] Оптимизация Motion Project успешно завершена!`
            ]
          });
        }, 800);
      }
    },

    handleOptimizationResult(result) {
      this.isInstalling = false;
      const btn = document.getElementById('motionInstallBtn');
      if (btn) btn.classList.remove('loading');

      if (result && result.logs && Array.isArray(result.logs)) {
        result.logs.forEach((line) => {
          if (line.includes('[SUCCESS]') || line.includes('[READY]') || line.includes('[DEPLOY]') || line.includes('[GAME_GUARD]')) {
            this.logToTerminal(line, 'success');
          } else if (line.includes('[ERROR]') || line.includes('[SECURITY_GUARD]')) {
            this.logToTerminal(line, 'error');
          } else if (line.includes('[WARN]') || line.includes('[ACTION_REQUIRED]')) {
            this.logToTerminal(line, 'warn');
          } else {
            this.logToTerminal(line, 'info');
          }
        });
      }

      if (result && result.success) {
        Toast.show(I18nManager.get('toast.motion_installed'), 5000);
        this.checkGameIntegrity();
      } else {
        Toast.show('Ошибка применения оптимизации: ' + (result?.message || 'Неизвестная ошибка'));
      }
    },

    checkPatchStatus() {
      const input = document.getElementById('motionLauncherPathInput');
      const path = input ? input.value : '';
      this.sendIpc({ action: 'checkMotionPatchStatus', path });
    },

    checkGameIntegrity() {
      const gInput = document.getElementById('motionGamePathInput');
      const lInput = document.getElementById('motionLauncherPathInput');
      const path = (gInput && gInput.value.trim()) ? gInput.value.trim() : (lInput ? lInput.value : '');
      Toast.show(I18nManager.currentLang === 'en' ? 'Verifying game folder integrity and DLL weights...' : 'Проверка целостности папки игры и сверка DLL (32-бит)...');
      this.sendIpc({ action: 'checkGameIntegrity', path });
    },

    apply4GbPatch() {
      const gInput = document.getElementById('motionGamePathInput');
      const lInput = document.getElementById('motionLauncherPathInput');
      const path = (gInput && gInput.value.trim()) ? gInput.value.trim() : (lInput ? lInput.value : '');
      const isEn = I18nManager.currentLang === 'en';
      Toast.show(isEn ? 'Applying 4GB LAA patch to motion.exe and samp.exe...' : 'Применение патча 4 ГБ ОЗУ к motion.exe и samp.exe...');
      this.logToTerminal('------------------------------------------------------------', 'hint');
      this.logToTerminal(isEn ? '[4GB_PATCH] Patching PE headers for motion.exe and samp.exe...' : '[4GB_PATCH] Запуск прямого патчинга PE-заголовков motion.exe и samp.exe...', 'hint');
      this.sendIpc({ action: 'apply4GbPatch', path });
    },

    handleApply4GbPatchResult(res) {
      const isEn = I18nManager.currentLang === 'en';
      const logs = (res && res.logs) || [];
      if (Array.isArray(logs)) {
        logs.forEach(line => {
          this.logToTerminal(line, line.includes('[ERROR]') ? 'error' : (line.includes('[WARN]') ? 'warn' : 'success'));
        });
      }
      if (res && res.success) {
        Toast.show(isEn ? '4GB patch successfully applied to motion.exe and samp.exe!' : 'Патч 4 ГБ ОЗУ успешно внедрён в motion.exe и samp.exe!', 5000);
      } else {
        Toast.show('Ошибка применения патча 4 ГБ: ' + (res?.message || 'Исполняемые файлы не найдены'));
      }
      if (res && res.gameIntegrity) {
        this.handleGameIntegrityResult(res.gameIntegrity);
      }
    },

    generateGameFingerprint() {
      const gInput = document.getElementById('motionGamePathInput');
      const lInput = document.getElementById('motionLauncherPathInput');
      const path = (gInput && gInput.value.trim()) ? gInput.value.trim() : (lInput ? lInput.value : '');
      const isEn = I18nManager.currentLang === 'en';

      const title = isEn ? 'Update Game Fingerprint' : 'Обновление отпечатка игры';
      const msg = isEn
        ? 'Update game folder digital fingerprint?\n\nAttention: The system will run a strict anti-cheat verification. If unauthorized CLEO, Moonloader, SAMPFUNCS, cheat scripts (.cs, .lua, .sf) or unauthorized DLL/ASI files are detected, updating will be BLOCKED.'
        : 'Обновить цифровой отпечаток файлов игры?\n\nВнимание: Система выполнит строгую античит-проверку. При наличии запрещённых папок (CLEO, Moonloader, SAMPFUNCS), читерских скриптов (.cs, .lua, .sf) или сторонних DLL/ASI обновление будет ЗАБЛОКИРОВАНО.';

      Dialogs.showConfirm(title, msg, () => {
        Toast.show(isEn ? 'Scanning game folder and verifying security...' : 'Античит-сканирование и расчёт SHA-256...');
        this.logToTerminal('------------------------------------------------------------', 'hint');
        this.logToTerminal(isEn ? '[FINGERPRINT] Scanning game directory and verifying anti-cheat integrity...' : '[FINGERPRINT] Сканирование каталога игры и античит-проверка файлов...', 'hint');
        this.sendIpc({ action: 'generateGameFingerprint', path });
      });
    },

    handleGameFingerprintResult(res) {
      const isEn = I18nManager.currentLang === 'en';
      if (res && res.success) {
        Toast.show(res.message || (isEn ? 'Game fingerprint updated and secured!' : 'Отпечаток игры успешно сохранён и защищён!'), 4000);
        this.logToTerminal(`[FINGERPRINT_OK] ${res.message}`, 'success');
      } else {
        const violations = (res && res.violations) || [];
        this.logToTerminal(`[SECURITY_BLOCKED] ${res?.message || 'Отклонено защитой'}`, 'error');
        if (violations.length > 0) {
          violations.forEach(v => this.logToTerminal(`  [ЗАПРЕЩЕНО] ${v}`, 'error'));
          Dialogs.showError(
            'ANTI-CHEAT-BLOCKED',
            isEn ? 'SECURITY GUARD: CHEAT DETECTED' : 'ОБНОВЛЕНИЕ ОТПЕЧАТКА ЗАБЛОКИРОВАНО АНТИЧИТОМ!',
            (isEn
              ? 'Security guard blocked fingerprint update: unauthorized cheats or third-party modifications detected in game folder:\n\n• '
              : 'Система безопасности заблокировала обновление отпечатка: в папке игры обнаружены потенциально читерские модули или сторонние модификации:\n\n• ') + violations.join('\n• ')
          );
        } else {
          Toast.show('Ошибка сбора отпечатка: ' + (res?.message || 'Каталог не найден'), 5000);
        }
      }
      if (res && res.gameIntegrity) {
        this.handleGameIntegrityResult(res.gameIntegrity);
      }
    },

    handleGameIntegrityResult(res) {
      const data = (res && res.data) ? res.data : res;
      if (!data) return;

      const pathLabel = document.getElementById('gameGuardPathLabel');
      const statusBadge = document.getElementById('gameGuardStatusBadge');
      const whitelistVal = document.getElementById('gameGuardWhitelistVal');
      const d3d9Val = document.getElementById('gameGuardD3d9Val');
      const motionLaaVal = document.getElementById('gameGuardMotionLaaVal');
      const sampLaaVal = document.getElementById('gameGuardSampLaaVal');
      const fingerprintVal = document.getElementById('gameGuardFingerprintVal');
      const foreignFilesVal = document.getElementById('gameGuardForeignFilesVal');
      const isEn = I18nManager.currentLang === 'en';

      if (pathLabel && data.gamePath) {
        pathLabel.textContent = (isEn ? 'Game Directory: ' : 'Каталог игры: ') + data.gamePath;
      }

      if (statusBadge) {
        if (data.clean) {
          statusBadge.textContent = isEn ? 'PROTECTED / CLEAN' : 'АКТИВНА / ЧИСТО';
          statusBadge.className = 'badge badge-success font-mono';
        } else {
          statusBadge.textContent = isEn ? 'VIOLATION DETECTED' : 'ОБНАРУЖЕНЫ НАРУШЕНИЯ';
          statusBadge.className = 'badge badge-error font-mono';
        }
      }

      if (whitelistVal) {
        const authCount = (data.authorizedExes && data.authorizedExes.length) || 0;
        const foreignCount = (data.foreignExes && data.foreignExes.length) || 0;
        if (foreignCount === 0) {
          whitelistVal.textContent = isEn ? `${authCount} allowed EXEs (Clean)` : `${authCount} разрешённых EXE (Чисто)`;
          whitelistVal.className = 'font-mono text-emerald';
        } else {
          whitelistVal.textContent = isEn ? `Foreign: ${data.foreignExes.join(', ')}` : `Посторонние: ${data.foreignExes.join(', ')}`;
          whitelistVal.className = 'font-mono text-rose';
        }
      }

      if (d3d9Val) {
        if (data.d3d9Exists) {
          const matchText = data.d3d9MatchesKnownDxvk ? ' ✓' : (isEn ? ' [NON-STANDARD]' : ' [НЕСТАНДАРТ]');
          d3d9Val.textContent = `${data.d3d9VersionDetected} (${Number(data.d3d9Size).toLocaleString()} B)${matchText}`;
          d3d9Val.className = data.d3d9MatchesKnownDxvk ? 'font-mono text-cyan' : 'font-mono text-rose';
        } else {
          d3d9Val.textContent = isEn ? 'd3d9.dll missing (Ready to install)' : 'd3d9.dll отсутствует (Готов к установке)';
          d3d9Val.className = 'font-mono text-muted';
        }
      }

      if (motionLaaVal) {
        if (data.laaMotionEnabled) {
          motionLaaVal.textContent = isEn ? '4GB Active (0x12F)' : 'Активен (4 ГБ)';
          motionLaaVal.className = 'font-mono text-emerald';
        } else {
          motionLaaVal.textContent = isEn ? '2GB Limit (Inactive)' : 'Лимит 2 ГБ (Не активен)';
          motionLaaVal.className = 'font-mono text-amber';
        }
      }

      if (sampLaaVal) {
        if (data.laaSampEnabled) {
          sampLaaVal.textContent = isEn ? '4GB Active (0x81AF)' : 'Активен (4 ГБ)';
          sampLaaVal.className = 'font-mono text-emerald';
        } else {
          sampLaaVal.textContent = isEn ? '2GB Limit (Inactive)' : 'Лимит 2 ГБ (Не активен)';
          sampLaaVal.className = 'font-mono text-amber';
        }
      }

      if (fingerprintVal) {
        if (data.manifestExists) {
          fingerprintVal.textContent = isEn ? `${data.manifestFilesCount} files (Protected)` : `${data.manifestFilesCount} файлов (SHA-256)`;
          fingerprintVal.className = 'font-mono text-cyan';
        } else {
          fingerprintVal.textContent = isEn ? 'Not created (Click Update)' : 'Не создан (Нажмите «Обновить»)';
          fingerprintVal.className = 'font-mono text-amber';
        }
      }

      if (foreignFilesVal) {
        const foreignList = data.foreignFiles || [];
        if (foreignList.length === 0) {
          foreignFilesVal.textContent = isEn ? 'None (Clean)' : 'Отсутствуют (Чисто)';
          foreignFilesVal.className = 'font-mono text-emerald';
        } else {
          foreignFilesVal.textContent = isEn ? `Found: ${foreignList.slice(0, 3).join(', ')}` : `Обнаружены: ${foreignList.slice(0, 3).join(', ')}`;
          foreignFilesVal.className = 'font-mono text-rose';
        }
      }
    },

    handlePatchStatusResult(res, gameIntegrityData) {
      const data = (res && res.data) ? res.data : res;
      if (!data) return;
      this.patchStatus = data;

      const isPatched = Boolean(data.isPatched === true || data.IsPatched === true);
      const isUnpacked = Boolean(data.isUnpacked === true || data.IsUnpacked === true);
      const hasIntegrity = Boolean(data.integrityManifestExists === true || data.IntegrityManifestExists === true);
      const titleEl = document.getElementById('motionPatchStatusTitle');
      const descEl = document.getElementById('motionPatchStatusDesc');
      const badgeEl = document.getElementById('motionGuardBadge');
      const integrityBadge = document.getElementById('motionIntegrityBadge');
      const isEn = I18nManager.currentLang === 'en';

      if (isPatched) {
        if (titleEl) titleEl.textContent = isEn ? 'Launcher Status: Patched & Protected by SAPatcher' : 'Статус лаунчера: Защищён и пропатчен SAPatcher';
        if (descEl) descEl.textContent = isEn ? 'Launch disallowed without SAPatcher background service. 5s popup widget active.' : 'Запуск невозможен без фоновой службы SAPatcher. 5-сек виджет активен.';
        if (badgeEl) {
          badgeEl.textContent = isEn ? 'Guard: ACTIVE' : 'Защита: АКТИВНА';
          badgeEl.className = 'badge badge-success font-mono';
        }
      } else {
        if (titleEl) titleEl.textContent = isEn ? 'Launcher Status: Not Patched' : 'Статус лаунчера: Не пропатчен';
        if (descEl) descEl.textContent = isEn ? 'Click "Unpack & Patch Launcher" to link with SAPatcher service & widget.' : 'Нажмите «Распаковать и пропатчить лаунчер» для привязки к службе и виджету.';
        if (badgeEl) {
          badgeEl.textContent = isEn ? 'Guard: INACTIVE' : 'Защита: Не установлена';
          badgeEl.className = 'badge badge-muted font-mono';
        }
      }

      // Dynamic toggle for "Install DXVK & 4GB Patch" button based on patched state
      const installBtn = document.getElementById('motionInstallBtn');
      const prereqBadge = document.getElementById('motionInstallPrereqBadge');
      if (installBtn) {
        if (isPatched) {
          installBtn.disabled = false;
          installBtn.removeAttribute('disabled');
          installBtn.classList.remove('btn-disabled');
          installBtn.title = isEn ? 'Install DXVK (32-bit) and 4GB RAM Patch to game directory' : 'Установить DXVK (32-бит) и патч 4 ГБ ОЗУ в каталог игры';
          if (prereqBadge) {
            prereqBadge.textContent = isEn ? 'Launcher Patched — Ready' : 'Лаунчер пропатчен — Готов к установке';
            prereqBadge.className = 'badge badge-success font-mono';
          }
        } else {
          installBtn.disabled = true;
          installBtn.setAttribute('disabled', 'disabled');
          installBtn.classList.add('btn-disabled');
          installBtn.title = isEn ? 'Unpack and patch launcher first before installing DXVK' : 'Сначала необходимо распаковать и пропатчить лаунчер';
          if (prereqBadge) {
            prereqBadge.textContent = isEn ? 'Requires Launcher Patching' : 'Требуется предварительный патчинг лаунчера';
            prereqBadge.className = 'badge badge-warning font-mono';
          }
        }
      }

      if (integrityBadge) {
        if (hasIntegrity) {
          integrityBadge.textContent = isEn ? 'Fingerprint: ACTIVE' : 'Отпечаток: АКТИВЕН';
          integrityBadge.className = 'badge badge-info font-mono';
        } else {
          integrityBadge.textContent = isEn ? 'Fingerprint: NONE' : 'Отпечаток: Не создан';
          integrityBadge.className = 'badge badge-muted font-mono';
        }
      }

      const gPath = data.discoveredGamePath || data.DiscoveredGamePath || '';
      if (gPath) {
        this.updateGamePathUI(gPath);
      }

      const gameData = gameIntegrityData || res?.gameIntegrity || data?.gameIntegrity;
      if (gameData) {
        this.handleGameIntegrityResult(gameData);
      }
    },

    updateGamePathUI(gamePath) {
      if (!gamePath) return;
      const el = document.getElementById('motionDetailGamePath');
      if (el && gamePath) {
        el.textContent = gamePath;
        el.className = 'detail-val font-mono text-emerald';
      }
      const input = document.getElementById('motionGamePathInput');
      if (input && gamePath) {
        input.value = gamePath;
      }
      const badge = document.getElementById('motionGamePathBadge');
      if (badge && gamePath) {
        badge.textContent = I18nManager.currentLang === 'en' ? 'Game Configured' : 'Каталог задан';
        badge.className = 'badge badge-success font-mono';
      }
      const guardPath = document.getElementById('gameGuardPathLabel');
      if (guardPath && gamePath) {
        guardPath.textContent = (I18nManager.currentLang === 'en' ? 'Game Directory: ' : 'Каталог игры: ') + gamePath;
      }
    },

    handleGamePathSelected(res) {
      if (!res || !res.path) return;
      this.updateGamePathUI(res.path);
      this.logToTerminal(`[GAME_PATH] Каталог игры выбран пользователем: ${res.path}`, 'success');
      Toast.show(`Каталог игры выбран: ${res.path}`, 3000);
      if (res.gameIntegrity) {
        this.handleGameIntegrityResult(res.gameIntegrity);
      }
    },

    handleLauncherPathSelected(res) {
      if (!res || !res.path) return;
      const input = document.getElementById('motionLauncherPathInput');
      if (input) input.value = res.path;
      this.logToTerminal(`[LAUNCHER] Выбран файл лаунчера: ${res.path}`, 'info');
      Toast.show('Файл лаунчера выбран', 2000);
      this.detectLauncher(true);
    },

    handleGamePathUpdated(res) {
      if (!res) return;
      if (res.path) {
        this.updateGamePathUI(res.path);
      }
      if (res.success) {
        this.logToTerminal(`[GAME_PATH] Каталог игры зафиксирован в настройках: ${res.path}`, 'success');
        Toast.show(I18nManager.currentLang === 'en' ? `Game path saved: ${res.path}` : `Каталог игры сохранён: ${res.path}`, 3000);
      } else {
        this.logToTerminal(`[GAME_PATH_WARN] Указанный каталог не найден на диске: ${res.path}`, 'warn');
        Toast.show(I18nManager.currentLang === 'en' ? `Folder not found on disk: ${res.path}` : `Папка не найдена на диске: ${res.path}`, 3500);
      }
      if (res.gameIntegrity) {
        this.handleGameIntegrityResult(res.gameIntegrity);
      }
    },

    patchLauncher() {
      const btn = document.getElementById('motionPatchBtn');
      if (btn) btn.classList.add('loading');
      const input = document.getElementById('motionLauncherPathInput');
      const path = input ? input.value : '';

      this.logToTerminal('------------------------------------------------------------', 'hint');
      this.logToTerminal(I18nManager.currentLang === 'en' ? '[START] Unpacking, computing fingerprint, and injecting SAPatcher Guard...' : '[START] Запуск распаковки, расчёта отпечатка целостности и защиты SAPatcher Guard...', 'hint');
      this.sendIpc({ action: 'patchMotionLauncher', path });
    },

    handlePatchResult(res) {
      const btn = document.getElementById('motionPatchBtn');
      if (btn) btn.classList.remove('loading');

      const isOk = Boolean((res && (res.success === true || res.Success === true)) ||
                           (res && res.data && (res.data.success === true || res.data.Success === true)));
      const data = (res && res.data) ? res.data : res;
      const logs = (data && (data.logs || data.Logs)) || (res && (res.logs || res.Logs)) || [];
      const msg = (data && (data.message || data.Message)) || (res && (res.message || res.Message)) || '';

      if (Array.isArray(logs) && logs.length > 0) {
        logs.forEach(line => {
          if (line.includes('[GUARD]') || line.includes('[SUCCESS]') || line.includes('[LOG]') || line.includes('[BACKUP]') || line.includes('[FINGERPRINT]') || line.includes('[INTEGRITY]') || line.includes('[GAME_PATH]')) {
            this.logToTerminal(line, 'success');
          } else if (line.includes('[WARN]')) {
            this.logToTerminal(line, 'warn');
          } else if (line.includes('[ERROR]') || line.includes('[EXCEPTION]')) {
            this.logToTerminal(line, 'error');
          } else {
            this.logToTerminal(line, 'info');
          }
        });
      }

      if (isOk) {
        Toast.show(I18nManager.currentLang === 'en' ? 'Motion Launcher successfully unpacked and patched!' : 'Motion Launcher успешно распакован и пропатчен!', 5000);
        if (data && (data.status || data.Status)) {
          this.handlePatchStatusResult(data.status || data.Status);
        }
        this.checkPatchStatus();
      } else {
        Toast.show('Ошибка патчинга: ' + (msg || 'Неизвестная ошибка'));
      }
    },

    restoreOriginals() {
      Dialogs.showConfirm(
        I18nManager.get('motion.btn_restore'),
        I18nManager.currentLang === 'en'
          ? 'Are you sure you want to restore original launcher files and disable SAPatcher Guard?'
          : 'Вы уверены, что хотите вернуть оригинальный app.asar и отключить защиту SAPatcher Guard?',
        () => {
          const btn = document.getElementById('motionRestoreBtn');
          if (btn) btn.classList.add('loading');
          const input = document.getElementById('motionLauncherPathInput');
          const path = input ? input.value : '';
          this.sendIpc({ action: 'restoreMotionLauncher', path });
        }
      );
    },

    handleRestoreResult(res) {
      const btn = document.getElementById('motionRestoreBtn');
      if (btn) btn.classList.remove('loading');

      const data = (res && res.data) ? res.data : res;
      const logs = (data && (data.logs || data.Logs)) || (res && (res.logs || res.Logs)) || [];

      if (Array.isArray(logs) && logs.length > 0) {
        logs.forEach(line => {
          this.logToTerminal(line, line.includes('[RESTORE]') ? 'success' : 'info');
        });
      }

      Toast.show(I18nManager.currentLang === 'en' ? 'Original launcher state restored.' : 'Оригинальное состояние лаунчера восстановлено.');
      if (data && (data.status || data.Status)) {
        this.handlePatchStatusResult(data.status || data.Status);
      }
      this.checkPatchStatus();
    },

    onLauncherStarted(data) {
      this.logToTerminal('------------------------------------------------------------', 'hint');
      const gamePath = data?.gamePath || '';
      const isFirst = Boolean(data?.firstRun);

      const input = document.getElementById('motionGamePathInput');
      const hasExistingPath = input && input.value && input.value.trim();

      if (isFirst) {
        this.logToTerminal(`[FIRST_RUN] Первый запуск после патчинга (PID: ${data.pid || 'N/A'}).`, 'hint');
        if (gamePath) {
          this.logToTerminal(`[GAME_PATH] Лаунчер передал путь к игре: ${gamePath}`, 'success');
          if (!hasExistingPath) {
            this.updateGamePathUI(gamePath);
          }
        }
        this.logToTerminal(`[SAVE] Путь к игре зафиксирован в настройках SAPatcher (settings.json).`, 'success');
        this.logToTerminal(`[RESTART] Автоматический перезапуск лаунчера для применения параметров...`, 'info');
        Toast.show(I18nManager.currentLang === 'en' ? 'Game path registered! Launcher auto-restarting...' : 'Путь к игре сохранён! Лаунчер перезапускается...', 4000);
      } else {
        this.logToTerminal(`[DAEMON] Событие запуска: ${data.launcher || 'Motion Launcher'} запущен (PID: ${data.pid || 'N/A'}).`, 'success');
        this.logToTerminal(`[INTEGRITY] Проверка отпечатка лаунчера и игры пройдена (0 нарушений).`, 'success');
        this.logToTerminal(`[WIDGET] Фоновая служба SAPatcher отобразила 5-секундный Relay-виджет.`, 'success');
        const isGameInstalled = Boolean(data?.gameInstalled);
        if (isGameInstalled && gamePath) {
          this.logToTerminal(`[GAME] Каталог игры от лаунчера: ${gamePath} (Защита активна).`, 'success');
          if (!hasExistingPath) {
            this.updateGamePathUI(gamePath);
          }
        } else {
          this.logToTerminal(`[GAME] Игра ещё не установлена или путь не выбран (Режим ожидания установки).`, 'hint');
        }
        this.logToTerminal(`[LOG] Диагностический лог сохранён рядом с исполняемым файлом.`, 'info');
        Toast.show(I18nManager.currentLang === 'en' ? 'Motion Launcher launched under SAPatcher Guard!' : 'Motion Launcher запущен под защитой SAPatcher!');
      }
    },

    onLauncherViolation(data) {
      this.logToTerminal('------------------------------------------------------------', 'error');
      this.logToTerminal(`[SECURITY BREACH] ВНИМАНИЕ: Нарушение целостности лаунчера!`, 'error');
      this.logToTerminal(`[BREACH] ${data?.reason || 'Несанкционированное изменение файлов или веса app'}`, 'error');
      if (data?.file) {
        this.logToTerminal(`[FILE] Модифицированный или сторонний файл: ${data.file}`, 'error');
      }
      this.logToTerminal(`[BLOCK] Запуск немедленно заблокирован службой безопасности SAPatcher.`, 'error');
      Toast.show(I18nManager.currentLang === 'en' ? 'INTEGRITY BREACH! Launcher startup blocked.' : 'НАРУШЕНИЕ ЦЕЛОСТНОСТИ! Запуск лаунчера заблокирован.', 6000);
    },

    applyLoadedSettings(s) {
      if (!s) return;
      if (s.motionGamePath) {
        this.updateGamePathUI(s.motionGamePath);
      }
      if (s.language && s.language !== I18nManager.currentLang) {
        I18nManager.setLanguage(s.language);
      }
      if (s.dxvkVersion) {
        const card = document.querySelector(`.dxvk-radio-card[data-version="${s.dxvkVersion}"]`);
        if (card) card.click();
      }
      if (s.enable4gbPatch !== undefined) {
        const cb = document.getElementById('motionEnable4gbPatch');
        if (cb) cb.checked = s.enable4gbPatch;
      }
      if (s.enableSeamless !== undefined) {
        const cb = document.getElementById('motionSeamless');
        if (cb) cb.checked = s.enableSeamless;
      }
      if (s.enableTearFree !== undefined) {
        const cb = document.getElementById('motionTearFree');
        if (cb) cb.checked = s.enableTearFree;
      }
      if (s.enableVsyncOff !== undefined) {
        const cb = document.getElementById('motionPresentInterval');
        if (cb) cb.checked = s.enableVsyncOff;
      }
      if (s.enableHud !== undefined) {
        const cb = document.getElementById('motionEnableHud');
        if (cb) {
          cb.checked = s.enableHud;
          cb.dispatchEvent(new Event('change'));
        }
      }
      if (s.hudScale !== undefined) {
        const slider = document.getElementById('motionHudScaleSlider');
        if (slider) {
          slider.value = s.hudScale;
          slider.dispatchEvent(new Event('input'));
        }
      }
      if (s.hudX !== undefined) {
        const xIn = document.getElementById('motionHudXInput');
        if (xIn) {
          xIn.value = s.hudX;
          xIn.dispatchEvent(new Event('input'));
        }
      }
      if (s.hudY !== undefined) {
        const yIn = document.getElementById('motionHudYInput');
        if (yIn) {
          yIn.value = s.hudY;
          yIn.dispatchEvent(new Event('input'));
        }
      }
      if (s.enableFpsLimit !== undefined) {
        const cb = document.getElementById('motionEnableFpsLimit');
        if (cb) {
          cb.checked = s.enableFpsLimit;
          cb.dispatchEvent(new Event('change'));
        }
      }
      if (s.maxFrameRate !== undefined) {
        const inp = document.getElementById('motionMaxFpsInput');
        if (inp) {
          inp.value = s.maxFrameRate;
          inp.dispatchEvent(new Event('input'));
        }
      }
    },

    saveCurrentSettings() {
      const selectedVerRadio = document.querySelector('input[name="motionDxvkVer"]:checked');
      const dxvkVersion = selectedVerRadio ? selectedVerRadio.value : '3.1.1';
      const laaCheckbox = document.getElementById('motionEnable4gbPatch');
      const hudEnableCb = document.getElementById('motionEnableHud');
      const hudScaleSlider = document.getElementById('motionHudScaleSlider');
      const hudXInput = document.getElementById('motionHudXInput');
      const hudYInput = document.getElementById('motionHudYInput');
      const fpsLimitCb = document.getElementById('motionEnableFpsLimit');
      const maxFpsInput = document.getElementById('motionMaxFpsInput');
      const seamlessCb = document.getElementById('motionSeamless');
      const tearFreeCb = document.getElementById('motionTearFree');
      const presentIntervalCb = document.getElementById('motionPresentInterval');

      const settings = {
        language: I18nManager.currentLang,
        dxvkVersion,
        enable4gbPatch: laaCheckbox ? laaCheckbox.checked : true,
        enableSeamless: seamlessCb ? seamlessCb.checked : true,
        enableTearFree: tearFreeCb ? tearFreeCb.checked : true,
        enableVsyncOff: presentIntervalCb ? presentIntervalCb.checked : true,
        enableHud: hudEnableCb ? hudEnableCb.checked : false,
        hudScale: hudScaleSlider ? parseFloat(hudScaleSlider.value) : 0.75,
        hudX: hudXInput ? parseInt(hudXInput.value, 10) : 1800,
        hudY: hudYInput ? parseInt(hudYInput.value, 10) : 20,
        enableFpsLimit: fpsLimitCb ? fpsLimitCb.checked : false,
        maxFrameRate: maxFpsInput ? parseInt(maxFpsInput.value, 10) : 200
      };

      this.sendIpc({ action: 'saveSettings', settings });
    },

    logToTerminal(text, type = 'info') {
      const terminal = document.getElementById('motionTerminalLog');
      if (!terminal) return;

      const line = document.createElement('div');
      line.className = `log-line log-line--${type}`;
      line.textContent = text;
      terminal.appendChild(line);
      terminal.scrollTop = terminal.scrollHeight;
    },

    getMockDetection() {
      return {
        found: true,
        path: "C:\\Users\\Gigabyte A320M-H\\AppData\\Local\\motion-launcher\\Motion Launcher.exe",
        directory: "C:\\Users\\Gigabyte A320M-H\\AppData\\Local\\motion-launcher",
        appFolderPath: "C:\\Users\\Gigabyte A320M-H\\AppData\\Local\\motion-launcher\\app-1.2.46",
        version: "1.2.46",
        fileSizeBytes: 390656,
        fileSizeFormatted: "381.5 KB",
        lastModified: "2026-09-23 19:58",
        source: "LocalAppData (Default)",
        statusText: "Лаунчер обнаружен"
      };
    }
  };

  const Navigation = {
    init() {
      const navItems = document.querySelectorAll('.nav-item');
      navItems.forEach((btn) => {
        btn.addEventListener('click', () => {
          const targetTab = btn.getAttribute('data-tab');
          if (!targetTab) return;

          navItems.forEach((n) => n.classList.remove('active'));
          btn.classList.add('active');

          const panels = document.querySelectorAll('.settings-panel');
          panels.forEach((p) => {
            p.classList.remove('active', 'animate-enter');
          });

          const activePanel = document.getElementById(targetTab);
          if (activePanel) {
            activePanel.classList.add('active');
            requestAnimationFrame(() => {
              activePanel.classList.add('animate-enter');
            });
            if (targetTab === 'tab-projects') {
              MotionProjectManager.detectLauncher();
            }
          }
        });
      });
    }
  };

  const Theme = {
    init() {
      const saved = localStorage.getItem('sapatcher_theme') || 'dark';
      document.documentElement.setAttribute('data-theme', saved);

      const btn = document.getElementById('themeToggleBtn');
      if (btn) {
        btn.addEventListener('click', () => {
          const current = document.documentElement.getAttribute('data-theme');
          const next = current === 'dark' ? 'light' : 'dark';
          document.documentElement.setAttribute('data-theme', next);
          localStorage.setItem('sapatcher_theme', next);
          Toast.show(I18nManager.get('toast.theme_changed'));
        });
      }
    }
  };

  document.addEventListener('DOMContentLoaded', () => {
    CanvasConstellation.init();
    Toast.init();
    Dialogs.init();
    Diagnostics.init();
    Navigation.init();
    MotionProjectManager.init();
    Theme.init();
    I18nManager.init();

    const langBtn = document.getElementById('langToggleBtn');
    if (langBtn) {
      langBtn.addEventListener('click', () => {
        I18nManager.toggle();
      });
    }
  });
})();

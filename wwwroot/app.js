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
        runBtn.addEventListener('click', () => this.run(true));
      }

      this.bindGpuMockControls();
      this.setupPhotinoBridge();
    },

    bindGpuMockControls() {
      const applyBtn = document.getElementById('btnApplyGpuMock');
      const resetBtn = document.getElementById('btnResetGpuMock');
      const select = document.getElementById('devGpuPresetSelect');

      if (applyBtn && select) {
        applyBtn.addEventListener('click', () => {
          const val = select.value;
          this.sendIpc({ action: 'setGpuMock', preset: val });
          Toast.show(`Эмуляция GPU изменена: ${select.selectedOptions[0]?.textContent || val}`);
        });
      }

      if (resetBtn) {
        resetBtn.addEventListener('click', () => {
          this.sendIpc({ action: 'resetGpuMock' });
          if (select) select.value = 'real';
          Toast.show('Эмуляция GPU сброшена на реальную видеокарту.');
        });
      }
    },

    sendIpc(obj) {
      const s = JSON.stringify(obj);
      if (window.external && typeof window.external.sendMessage === 'function') {
        window.external.sendMessage(s);
      } else if (window.chrome && window.chrome.webview && typeof window.chrome.webview.postMessage === 'function') {
        window.chrome.webview.postMessage(s);
      }
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
          } else if (evt === 'gpuMockStatusResult') {
            this.handleGpuMockStatus(data);
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
          } else if (evt === 'launcherUiThemeSwitched') {
            const msg = payloadData && (payloadData.message || payloadData.Message) ? (payloadData.message || payloadData.Message) : 'Интерфейс переключен';
            MotionProjectManager.logToTerminal(`[THEME] ${msg}`, payloadData && payloadData.success ? 'success' : 'warn');
          } else if (evt === 'settingsLoaded') {
            MotionProjectManager.applyLoadedSettings(payloadData);
            if (typeof OverlayManager !== 'undefined') {
              OverlayManager.applyLoadedSettings(payloadData);
            }
          } else if (evt === 'deployOverlayDllResult') {
            if (typeof OverlayManager !== 'undefined') {
              OverlayManager.handleDeployResult(data);
            }
          } else if (evt === 'overlayIpcSynced') {
            if (typeof OverlayManager !== 'undefined') {
              OverlayManager.log('[IPC] Настройки успешно синхронизированы в памяти', 'success');
            }
          } else if (evt === 'launcherStarted') {
            MotionProjectManager.onLauncherStarted(payloadData);
          } else if (evt === 'launcherViolation') {
            MotionProjectManager.onLauncherViolation(payloadData);
          } else if (evt === 'developerStatus') {
            if (typeof DeveloperModeManager !== 'undefined') {
              DeveloperModeManager.onStatus(payloadData);
            }
          } else if (evt === 'developerUnlockResult') {
            if (typeof DeveloperModeManager !== 'undefined') {
              DeveloperModeManager.onUnlockResult(payloadData);
            }
          } else if (evt === 'standaloneExeSelected') {
            if (typeof StandaloneLaaManager !== 'undefined') {
              StandaloneLaaManager.onExeSelected(data);
            }
          } else if (evt === 'standaloneExeInspected') {
            if (typeof StandaloneLaaManager !== 'undefined') {
              StandaloneLaaManager.onExeInspected(data);
            }
          } else if (evt === 'applyStandaloneLaaResult') {
            if (typeof StandaloneLaaManager !== 'undefined') {
              StandaloneLaaManager.onApplyResult(data);
            }
          } else if (evt === 'restoreStandaloneExeResult') {
            if (typeof StandaloneLaaManager !== 'undefined') {
              StandaloneLaaManager.onRestoreResult(data);
            }
          } else if (evt === 'launchStandaloneExeResult') {
            if (typeof StandaloneLaaManager !== 'undefined') {
              StandaloneLaaManager.onLaunchResult(data);
            }
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

      setTimeout(() => {
        try {
          const send = (obj) => this.sendIpc(obj);
          send({ action: 'getSettings' });
          send({ action: 'checkMotionPatchStatus' });
          send({ action: 'checkDeveloperStatus' });
          send({ action: 'getGpuMockStatus' });
          send({ action: 'runCheck' });
        } catch (e) {}
      }, 100);
    },

    handleGpuMockStatus(data) {
      if (!data) return;
      const select = document.getElementById('devGpuPresetSelect');
      const badge = document.getElementById('devGpuActiveBadge');
      const bar = document.getElementById('devGpuMockBar');

      if (select && data.currentPreset) {
        select.value = data.currentPreset;
      }
      if (badge) {
        badge.style.display = data.isMock ? 'inline-flex' : 'none';
      }
      if (bar && (data.isMock || (typeof DeveloperModeManager !== 'undefined' && DeveloperModeManager.isActive))) {
        bar.style.display = 'flex';
      }
    },

    run(isManual = false) {
      if (this.isScanning) return;
      this.setLoadingState(true);
      if (isManual) {
        Toast.show(I18nManager.get('toast.diag_start'));
      }

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

        const gpuBadge = document.getElementById('gpuBadge');
        if (gpuBadge) {
          if (report.gpu.badgeText) {
            gpuBadge.textContent = report.gpu.badgeText;
            gpuBadge.className = `badge font-mono ${report.gpu.badgeClass || 'badge-accent'}`;
          } else {
            gpuBadge.textContent = report.gpu.vulkanFound ? 'Vulkan 1.3/1.4 Ready' : 'Vulkan не поддерживается';
            gpuBadge.className = `badge font-mono ${report.gpu.vulkanFound ? 'badge-accent' : 'badge-danger'}`;
          }
        }

        const verdictTitle = document.getElementById('gpuVerdictTitle');
        const verdictDesc = document.getElementById('gpuVerdictDesc');
        if (verdictTitle) {
          const key = report.gpu.verdictTextKey || 'gpu.verdict_text';
          verdictTitle.textContent = key.startsWith('gpu.') ? I18nManager.get(key) : key;
        }
        if (verdictDesc) {
          const key = report.gpu.verdictDescKey || 'gpu.verdict_desc';
          verdictDesc.textContent = key.startsWith('gpu.') ? I18nManager.get(key) : key;
        }

        if (report.gpu.dxvkCompat) {
          const updateTier = (elemId, tier) => {
            const card = document.getElementById(elemId);
            if (!card || !tier) return;
            const badge = card.querySelector('.badge');
            const spec = card.querySelector('.tier-spec');
            if (spec && tier.specification) spec.textContent = tier.specification;
            if (badge) {
              const bKey = tier.badgeKey || '';
              badge.textContent = bKey.startsWith('gpu.') ? I18nManager.get(bKey) : bKey;
              badge.className = 'badge font-mono ' + (
                tier.status === 'recommended' ? 'badge-highlight' :
                tier.status === 'compatible' ? 'badge-success' :
                tier.status === 'supported' ? 'badge-info' : 'badge-danger'
              );
            }
            card.classList.toggle('tier-card--highlight', tier.status === 'recommended');
            card.style.opacity = tier.status === 'incompatible' ? '0.5' : '1.0';
          };

          updateTier('tierDxvk1103', report.gpu.dxvkCompat.dxvk1103);
          updateTier('tierDxvk23', report.gpu.dxvkCompat.dxvk23);
          updateTier('tierDxvk30', report.gpu.dxvkCompat.dxvk30);
          updateTier('tierDxvk311', report.gpu.dxvkCompat.dxvk311);

          this.filterDxvkSelectorByGpu(report.gpu.dxvkCompat);
        }

        const devActiveBadge = document.getElementById('devGpuActiveBadge');
        const devGpuBar = document.getElementById('devGpuMockBar');
        const devPresetSelect = document.getElementById('devGpuPresetSelect');

        if (report.gpu.isMock) {
          if (devActiveBadge) devActiveBadge.style.display = 'inline-flex';
          if (devGpuBar) devGpuBar.style.display = 'flex';
          if (devPresetSelect && report.gpu.mockPresetId) devPresetSelect.value = report.gpu.mockPresetId;
        } else {
          if (devActiveBadge) devActiveBadge.style.display = 'none';
        }
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

    filterDxvkSelectorByGpu(compatMatrix) {
      const selector = document.getElementById('dxvkVersionSelector');
      if (!selector || !compatMatrix) return;

      const versionMap = {
        '3.1.1': compatMatrix.dxvk311,
        '3.0': compatMatrix.dxvk30,
        '2.3': compatMatrix.dxvk23,
        '1.10.3': compatMatrix.dxvk1103
      };

      const cards = selector.querySelectorAll('.dxvk-radio-card[data-version]');
      let visibleCount = 0;
      let hasActiveVisible = false;
      let recommendedCard = null;
      let firstCompatibleCard = null;

      cards.forEach((card) => {
        const ver = card.dataset.version;
        const tier = versionMap[ver];
        const isCompatible = tier && tier.status !== 'incompatible';

        if (isCompatible) {
          card.style.display = '';
          visibleCount++;
          const radio = card.querySelector('input[type="radio"]');
          if (radio) radio.disabled = false;

          if (tier.status === 'recommended') {
            recommendedCard = card;
          }
          if (!firstCompatibleCard) {
            firstCompatibleCard = card;
          }
          if (card.classList.contains('active')) {
            hasActiveVisible = true;
          }
        } else {
          card.style.display = 'none';
          card.classList.remove('active');
          const radio = card.querySelector('input[type="radio"]');
          if (radio) {
            radio.disabled = true;
            radio.checked = false;
          }
        }
      });

      let banner = document.getElementById('dxvkNoCompatWarning');
      if (visibleCount === 0) {
        if (!banner) {
          banner = document.createElement('div');
          banner.id = 'dxvkNoCompatWarning';
          banner.className = 'dxvk-no-compat-banner';
          banner.style.cssText = 'grid-column: 1 / -1; padding: 14px 16px; background: rgba(244, 63, 94, 0.12); border: 1px solid rgba(244, 63, 94, 0.35); border-radius: 12px; display: flex; align-items: center; gap: 12px; color: #f43f5e; font-size: 13px; font-weight: 600;';
          banner.innerHTML = '<span style="font-size: 20px;">⚠️</span><span>Видеокарта не поддерживает Vulkan API. Ни одна версия DXVK не доступна для выбора. Игра будет запускаться исключительно через нативный DirectX 9.</span>';
          selector.appendChild(banner);
        } else {
          banner.style.display = 'flex';
        }
      } else if (banner) {
        banner.style.display = 'none';
      }

      if (!hasActiveVisible && visibleCount > 0) {
        const targetCard = recommendedCard || firstCompatibleCard;
        if (targetCard) {
          cards.forEach((c) => c.classList.remove('active'));
          targetCard.classList.add('active');
          const radio = targetCard.querySelector('input[type="radio"]');
          if (radio) radio.checked = true;
          const targetVer = targetCard.dataset.version;
          if (typeof this.updateDxvkVersionSpecifics === 'function') {
            this.updateDxvkVersionSpecifics(targetVer);
          }
          this.logToTerminal(`[COMPAT-FILTER] Для текущего GPU выбрана совместимая версия: DXVK ${targetVer}`, 'detect');
        }
      }

      const hasVulkanSupport = visibleCount > 0;
      this.hasVulkanSupport = hasVulkanSupport;

      const navOverlay = document.getElementById('navOverlay');
      const navOverlayBadge = document.getElementById('navOverlayBadge');
      const navProjects = document.getElementById('navProjects');
      const navProjectsBadge = document.getElementById('navProjectsBadge');
      const navStandaloneLaa = document.getElementById('navStandaloneLaa');

      if (!hasVulkanSupport) {
        if (navOverlay) {
          navOverlay.style.pointerEvents = 'none';
          navOverlay.style.opacity = '0.35';
          navOverlay.style.cursor = 'not-allowed';
          navOverlay.setAttribute('disabled', 'disabled');
          if (navOverlayBadge) {
            navOverlayBadge.textContent = 'НЕДОСТУПНО';
            navOverlayBadge.className = 'badge badge-wip font-mono';
          }
        }
        if (navProjects) {
          navProjects.style.pointerEvents = 'none';
          navProjects.style.opacity = '0.35';
          navProjects.style.cursor = 'not-allowed';
          navProjects.setAttribute('disabled', 'disabled');
          if (navProjectsBadge) {
            navProjectsBadge.textContent = 'НЕДОСТУПНО';
            navProjectsBadge.className = 'badge badge-wip font-mono';
          }
        }
        if (navStandaloneLaa) {
          navStandaloneLaa.style.display = 'flex';
        }

        const currentActiveNav = document.querySelector('.nav-item.active');
        const activeTabId = currentActiveNav ? currentActiveNav.getAttribute('data-tab') : '';
        if (activeTabId === 'tab-projects' || activeTabId === 'tab-overlay') {
          if (navStandaloneLaa) {
            navStandaloneLaa.click();
          }
        }
      } else {
        if (navOverlay) {
          navOverlay.style.pointerEvents = '';
          navOverlay.style.opacity = '';
          navOverlay.style.cursor = '';
          navOverlay.removeAttribute('disabled');
          if (navOverlayBadge) {
            navOverlayBadge.textContent = 'DXVK';
            navOverlayBadge.className = 'badge badge-cyan font-mono';
          }
        }
        if (navProjects) {
          navProjects.style.pointerEvents = '';
          navProjects.style.opacity = '';
          navProjects.style.cursor = '';
          navProjects.removeAttribute('disabled');
          if (navProjectsBadge) {
            navProjectsBadge.textContent = 'LIVE';
            navProjectsBadge.className = 'badge badge-active font-mono';
          }
        }
        if (navStandaloneLaa) {
          navStandaloneLaa.style.display = 'none';
        }

        const currentActiveNav = document.querySelector('.nav-item.active');
        const activeTabId = currentActiveNav ? currentActiveNav.getAttribute('data-tab') : '';
        if (activeTabId === 'tab-standalone-laa') {
          if (navProjects) {
            navProjects.click();
          }
        }
      }

      if (typeof OverlayManager.updateGpuVulkanState === 'function') {
        OverlayManager.updateGpuVulkanState(hasVulkanSupport);
      }
      if (typeof MotionProjectManager.updateVulkanCompatibilityState === 'function') {
        MotionProjectManager.updateVulkanCompatibilityState(hasVulkanSupport);
      }
      if (typeof StandaloneLaaManager !== 'undefined' && typeof StandaloneLaaManager.updateVulkanState === 'function') {
        StandaloneLaaManager.updateVulkanState(hasVulkanSupport);
      }
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
    hasVulkanSupport: true,

    updateVulkanCompatibilityState(hasVulkan) {
      this.hasVulkanSupport = hasVulkan;
      const limiterCard = document.querySelector('.limiter-config-card');
      const hudCard = document.querySelector('.hud-config-card');
      const fpsLimitToggle = document.getElementById('motionEnableFpsLimit');
      const hudToggle = document.getElementById('motionHudToggle');
      const installBtn = document.getElementById('motionInstallBtn');

      if (!hasVulkan) {
        if (limiterCard) {
          limiterCard.style.opacity = '0.4';
          limiterCard.style.pointerEvents = 'none';
        }
        if (hudCard) {
          hudCard.style.opacity = '0.4';
          hudCard.style.pointerEvents = 'none';
        }
        if (fpsLimitToggle) fpsLimitToggle.checked = false;
        if (hudToggle) hudToggle.checked = false;

        this.updateInstallBtnForNoVulkan();
      } else {
        if (limiterCard) {
          limiterCard.style.opacity = '1';
          limiterCard.style.pointerEvents = 'auto';
        }
        if (hudCard) {
          hudCard.style.opacity = '1';
          hudCard.style.pointerEvents = 'auto';
        }
        if (installBtn) {
          const btnText = installBtn.querySelector('.btn-text');
          if (btnText) btnText.textContent = I18nManager.get('motion.btn_install') || 'Установить DXVK и патч 4 ГБ ОЗУ';
        }
        this.updatePatchStatusUI();
      }
    },

    updateInstallBtnForNoVulkan() {
      const installBtn = document.getElementById('motionInstallBtn');
      const prereqBadge = document.getElementById('motionInstallPrereqBadge');
      if (!installBtn) return;
      const isPatched = Boolean(this.patchStatus && (this.patchStatus.isPatched === true || this.patchStatus.IsPatched === true));
      const laaCheckbox = document.getElementById('motionEnable4gbPatch');
      const enable4gb = laaCheckbox ? laaCheckbox.checked : true;
      const btnText = installBtn.querySelector('.btn-text');

      if (!enable4gb) {
        installBtn.disabled = true;
        installBtn.classList.add('btn-disabled');
        installBtn.title = 'Видеокарта не поддерживает Vulkan API. Установка DXVK заблокирована.';
        if (btnText) btnText.textContent = 'Установка DXVK заблокирована';
        if (prereqBadge) {
          prereqBadge.textContent = 'GPU: Vulkan не поддерживается';
          prereqBadge.className = 'badge badge-danger font-mono';
        }
      } else if (!isPatched) {
        installBtn.disabled = true;
        installBtn.classList.add('btn-disabled');
        installBtn.title = 'Сначала необходимо распаковать и пропатчить лаунчер';
        if (btnText) btnText.textContent = 'Установить патч 4 ГБ ОЗУ (Без DXVK)';
        if (prereqBadge) {
          prereqBadge.textContent = 'Требуется патчинг лаунчера';
          prereqBadge.className = 'badge badge-warning font-mono';
        }
      } else {
        installBtn.disabled = false;
        installBtn.removeAttribute('disabled');
        installBtn.classList.remove('btn-disabled');
        installBtn.title = 'Установка только патча 4 ГБ ОЗУ (DXVK пропущен из-за отсутствия Vulkan на GPU)';
        if (btnText) btnText.textContent = 'Установить патч 4 ГБ ОЗУ (Без DXVK)';
        if (prereqBadge) {
          prereqBadge.textContent = 'Готов: Только 4GB Patch (Без DXVK)';
          prereqBadge.className = 'badge badge-info font-mono';
        }
      }
    },

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

      const openElectronLogBtn = document.getElementById('motionOpenElectronLogBtn');
      if (openElectronLogBtn) {
        openElectronLogBtn.addEventListener('click', () => {
          const input = document.getElementById('motionLauncherPathInput');
          const path = input ? input.value : '';
          this.sendIpc({ action: 'openElectronLog', path });
          Toast.show(I18nManager.currentLang === 'en' ? 'Opening Electron log file...' : 'Открытие лог-файла Electron...');
        });
      }

      const electronLoggingCb = document.getElementById('motionEnableElectronLogging');
      if (electronLoggingCb) {
        electronLoggingCb.addEventListener('change', () => {
          this.saveCurrentSettings();
          const state = electronLoggingCb.checked ? 'включено' : 'отключено';
          this.logToTerminal(`[SETTINGS] Логирование Electron ${state}. Перепатчите лаунчер для применения.`, 'hint');
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
      this.updateDxvkVersionSpecifics = updateDxvkVersionSpecifics;

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

      const uiThemeCards = document.querySelectorAll('.dxvk-radio-card[data-ui-theme]');
      uiThemeCards.forEach((card) => {
        card.addEventListener('click', () => {
          uiThemeCards.forEach((c) => c.classList.remove('active'));
          card.classList.add('active');
          const radio = card.querySelector('input[type="radio"]');
          if (radio) radio.checked = true;
          const theme = card.dataset.uiTheme || 'v2';
          this.currentUiTheme = theme;
          this.saveCurrentSettings();
          const input = document.getElementById('motionLauncherPathInput');
          const path = input ? input.value : '';
          this.sendIpc({ action: 'switchLauncherUiTheme', path, theme });
          const themeNames = {
            'v1': 'Классический (v1.2.46)',
            'v2': 'Современный (v2.0.0)',
            'metro': 'Windows 8 Live Tiles (Metro UI)',
            'sapatcher': 'SAPatcher Dark Cyber Glass'
          };
          const themeName = themeNames[theme] || 'Современный (v2.0.0)';
          this.logToTerminal(`[THEME] Выбран интерфейс: ${themeName}`, 'detect');
          Toast.show(`Активирован интерфейс: ${themeName}`);
        });
      });

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

      const laaToggle = document.getElementById('motionEnable4gbPatch');
      if (laaToggle) {
        laaToggle.addEventListener('change', () => {
          if (!this.hasVulkanSupport) {
            this.updateInstallBtnForNoVulkan();
          }
        });
      }
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

      const laaCheckbox = document.getElementById('motionEnable4gbPatch');
      const enable4gb = laaCheckbox ? laaCheckbox.checked : true;

      let dxvkVersion = '3.1.1';
      if (!this.hasVulkanSupport) {
        if (!enable4gb) {
          Toast.show('Установка заблокирована: видеокарта не поддерживает Vulkan API, а патч 4 ГБ ОЗУ отключен!', 4500);
          this.logToTerminal('------------------------------------------------------------', 'error');
          this.logToTerminal('[GPU_BLOCK] Видеокарта не поддерживает Vulkan API. Установка DXVK заблокирована.', 'error');
          this.isInstalling = false;
          return;
        }
        dxvkVersion = 'none';
        this.logToTerminal('[COMPAT] Обнаружен GPU без поддержки Vulkan. Будет применен ТОЛЬКО патч 4 ГБ ОЗУ (DXVK пропущен).', 'warn');
      } else {
        const selectedVerRadio = document.querySelector('input[name="motionDxvkVer"]:checked');
        dxvkVersion = selectedVerRadio ? selectedVerRadio.value : '3.1.1';
      }

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

      const fpsLimitCb = document.getElementById('motionEnableFpsLimit');
      const enableFpsLimit = fpsLimitCb ? fpsLimitCb.checked : true;

      const maxFpsInput = document.getElementById('motionMaxFpsInput');
      const maxFrameRate = maxFpsInput ? parseInt(maxFpsInput.value, 10) : 200;

      const seamlessCb = document.getElementById('motionSeamless');
      const enableSeamless = seamlessCb ? seamlessCb.checked : true;

      const tearFreeCb = document.getElementById('motionTearFree');
      const enableTearFree = tearFreeCb ? tearFreeCb.checked : true;

      const presentIntervalCb = document.getElementById('motionPresentInterval');
      const enableVsyncOff = presentIntervalCb ? presentIntervalCb.checked : true;

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
          ? '[INFO] Click "Unpack & Patch Launcher" above to secure and unlock the installer.'
          : '[ИНФО] Нажмите «Распаковать и пропатчить лаунчер» для разблокировки.', 'warn');
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

      const ver = data.detectedVersion || data.DetectedVersion || '';
      const isVerBlocked = Boolean(data.isVersionBlocked === true || data.IsVersionBlocked === true);
      const hasWarning = Boolean(data.hasCompatibilityWarning === true || data.HasCompatibilityWarning === true);
      const warningMsg = data.versionWarningMessage || data.VersionWarningMessage || '';
      const isPatched = Boolean(data.isPatched === true || data.IsPatched === true);
      const isUnpacked = Boolean(data.isUnpacked === true || data.IsUnpacked === true);
      const hasIntegrity = Boolean(data.integrityManifestExists === true || data.IntegrityManifestExists === true);
      const titleEl = document.getElementById('motionPatchStatusTitle');
      const descEl = document.getElementById('motionPatchStatusDesc');
      const badgeEl = document.getElementById('motionGuardBadge');
      const verBadge = document.getElementById('motionVersionBadge');
      const integrityBadge = document.getElementById('motionIntegrityBadge');
      const isEn = I18nManager.currentLang === 'en';

      if (verBadge) {
        if (isVerBlocked) {
          verBadge.textContent = isEn ? `v${ver || 'N/A'} (BLOCKED < 1.2.46)` : `v${ver || 'N/A'} (ЗАБЛОКИРОВАНО < 1.2.46)`;
          verBadge.className = 'badge badge-danger font-mono';
        } else if (hasWarning) {
          verBadge.textContent = isEn ? `v${ver || 'N/A'} (Compatibility > 2.0.0)` : `v${ver || 'N/A'} (Предупреждение > 2.0.0)`;
          verBadge.className = 'badge badge-warning font-mono';
        } else if (ver) {
          verBadge.textContent = isEn ? `v${ver} (Compatible)` : `v${ver} (Совместимо)`;
          verBadge.className = 'badge badge-success font-mono';
        } else {
          verBadge.textContent = isEn ? 'Version: N/A' : 'Версия: Не найдена';
          verBadge.className = 'badge badge-muted font-mono';
        }
      }

      const patchBtn = document.getElementById('motionPatchBtn');
      if (patchBtn) {
        if (isVerBlocked) {
          patchBtn.disabled = true;
          patchBtn.setAttribute('disabled', 'disabled');
          patchBtn.classList.add('btn-disabled');
          patchBtn.title = warningMsg || (isEn ? 'Launcher version is blocked (< 1.2.46)' : 'Версия лаунчера заблокирована (< 1.2.46)');
        } else {
          patchBtn.disabled = false;
          patchBtn.removeAttribute('disabled');
          patchBtn.classList.remove('btn-disabled');
          patchBtn.title = isEn ? 'Unpack and patch Motion Launcher' : 'Распаковать и пропатчить Motion Launcher';
        }
      }

      if (isVerBlocked) {
        if (titleEl) titleEl.textContent = isEn ? `Launcher v${ver || 'N/A'} Outdated & Blocked` : `Версия лаунчера v${ver || 'N/A'} устарела и заблокирована`;
        if (descEl) descEl.textContent = warningMsg || (isEn ? 'Launcher versions below 1.2.46 are blocked. Please update official launcher.' : 'Версии лаунчера ниже 1.2.46 заблокированы. Обновите официальный лаунчер.');
        if (descEl) descEl.style.color = 'var(--color-danger, #ef4444)';
      } else if (isPatched) {
        if (titleEl) titleEl.textContent = isEn ? 'Launcher Status: Patched & Protected by SAPatcher' : 'Статус лаунчера: Защищён и пропатчен SAPatcher';
        if (descEl) descEl.textContent = isEn ? 'Launch disallowed without SAPatcher background service. 5s popup widget active.' : 'Запуск невозможен без фоновой службы SAPatcher. 5-сек виджет активен.';
        if (descEl) descEl.style.color = 'var(--color-text-muted)';
        if (badgeEl) {
          badgeEl.textContent = isEn ? 'Guard: ACTIVE' : 'Защита: АКТИВНА';
          badgeEl.className = 'badge badge-success font-mono';
        }
      } else {
        if (titleEl) titleEl.textContent = isEn ? 'Launcher Status: Not Patched' : 'Статус лаунчера: Не пропатчен';
        if (descEl) descEl.textContent = hasWarning ? warningMsg : (isEn ? 'Click "Unpack & Patch Launcher" to link with SAPatcher service & widget.' : 'Нажмите «Распаковать и пропатчить лаунчер» для привязки к службе и виджету.');
        if (descEl) descEl.style.color = hasWarning ? 'var(--color-warning, #f59e0b)' : 'var(--color-text-muted)';
        if (badgeEl) {
          badgeEl.textContent = isEn ? 'Guard: INACTIVE' : 'Защита: Не установлена';
          badgeEl.className = 'badge badge-muted font-mono';
        }
      }

      if (!this.hasVulkanSupport) {
        this.updateInstallBtnForNoVulkan();
      } else {
        const installBtn = document.getElementById('motionInstallBtn');
        const prereqBadge = document.getElementById('motionInstallPrereqBadge');
        if (installBtn) {
          const btnText = installBtn.querySelector('.btn-text');
          if (btnText) btnText.textContent = I18nManager.get('motion.btn_install') || 'Установить DXVK и патч 4 ГБ ОЗУ';
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

      this.saveCurrentSettings();

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

      const isVerBlocked = Boolean(data?.isVersionBlocked || data?.IsVersionBlocked || res?.isVersionBlocked);
      const hasWarning = Boolean(data?.hasCompatibilityWarning || data?.HasCompatibilityWarning || res?.hasCompatibilityWarning);
      const warningMsg = (data && (data.versionWarningMessage || data.VersionWarningMessage)) || '';

      if (isOk) {
        if (hasWarning) {
          Toast.show(I18nManager.currentLang === 'en' ? 'Motion Launcher patched (Compatibility Mode)' : 'Motion Launcher пропатчен в режиме совместимости!', 6000);
        } else {
          Toast.show(I18nManager.currentLang === 'en' ? 'Motion Launcher successfully unpacked and patched!' : 'Motion Launcher успешно распакован и пропатчен!', 5000);
        }
        if (data && (data.status || data.Status)) {
          this.handlePatchStatusResult(data.status || data.Status);
        }
        this.checkPatchStatus();
      } else {
        if (isVerBlocked) {
          Dialogs.showError(
            'VERSION-BLOCKED',
            I18nManager.currentLang === 'en' ? 'LAUNCHER VERSION BLOCKED' : 'ВЕРСИЯ ЛАУНЧЕРА ЗАБЛОКИРОВАНА',
            msg || warningMsg || 'Версия Motion Launcher устарела (< 1.2.46). Патчинг заблокирован.'
          );
        }
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
        let ver = s.dxvkVersion;
        if (ver === 'SAPatcher-DXVK 1') ver = '3.1.1';
        const card = document.querySelector(`.dxvk-radio-card[data-version="${ver}"]`);
        if (card && card.style.display !== 'none') card.click();
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
      if (s.enableElectronLogging !== undefined) {
        const cb = document.getElementById('motionEnableElectronLogging');
        if (cb) cb.checked = s.enableElectronLogging;
      }
      if (s.motionLauncherUiTheme) {
        this.currentUiTheme = s.motionLauncherUiTheme;
        const card = document.querySelector(`.dxvk-radio-card[data-ui-theme="${s.motionLauncherUiTheme}"]`);
        if (card) {
          document.querySelectorAll('.dxvk-radio-card[data-ui-theme]').forEach(c => c.classList.remove('active'));
          card.classList.add('active');
          const radio = card.querySelector('input[type="radio"]');
          if (radio) radio.checked = true;
        }
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
      const electronLoggingCb = document.getElementById('motionEnableElectronLogging');
      const selectedThemeRadio = document.querySelector('input[name="motionUiTheme"]:checked');
      const motionLauncherUiTheme = selectedThemeRadio ? selectedThemeRadio.value : (this.currentUiTheme || 'v2');

      const settings = {
        language: I18nManager.currentLang,
        dxvkVersion,
        motionLauncherUiTheme,
        enable4gbPatch: laaCheckbox ? laaCheckbox.checked : true,
        enableSeamless: seamlessCb ? seamlessCb.checked : true,
        enableTearFree: tearFreeCb ? tearFreeCb.checked : true,
        enableVsyncOff: presentIntervalCb ? presentIntervalCb.checked : true,
        enableElectronLogging: electronLoggingCb ? electronLoggingCb.checked : true,
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

  const OverlayManager = {
    settings: {
      overlayEnabled: true,
      overlayHotkey: 'F11',
      overlayHotkeyCode: 122,
      overlayTitle: 'SAPatcher 2.0',
      overlayShowGear: true,
      overlayShowFps: true,
      overlayPosition: 'top-left',
      overlayPosX: 24,
      overlayPosY: 24,
      overlayScale: 1.0,
      isSettingsOpen: false,
      smtcVisible: true,
      smtcScale: 1.0,
      smtcPlaying: true,
      smtcCurrentTrack: 0,
      smtcCurrentSeconds: 94,
      smtcVolume: 80
    },

    tracks: [
      { title: "DVRST — Close Eyes", artist: "Phonk Master • Spotify", duration: 195, source: "Windows SMTC • Spotify" },
      { title: "Kordhell — Murder In My Mind", artist: "Drift Phonk • Groove", duration: 145, source: "Windows Media • Groove" },
      { title: "Miyagi & Andy Panda — Utopia", artist: "Hajime Records • Yandex", duration: 210, source: "Яндекс Музыка • SMTC" },
      { title: "INTERWORLD — METAMORPHOSIS", artist: "Interworld • SoundCloud", duration: 142, source: "SoundCloud • Windows SMTC" }
    ],

    timerId: null,

    init() {
      this.bindInputs();
      this.bindActions();
      this.bindSmtcWidget();
      this.bindDraggables();
      this.startSimulatedFps();
      this.startSmtcTimer();
      this.updateSimPreview();
      this.updateSmtcUI();
    },

    bindInputs() {
      const enabledToggle = document.getElementById('overlayEnabledToggle');
      const hotkeySelect = document.getElementById('overlayHotkeySelect');
      const showFpsToggle = document.getElementById('overlayShowFpsToggle');
      const positionSelect = document.getElementById('overlayPositionSelect');
      const simGearBtn = document.getElementById('simGearBtn');
      const simAddWidgetBtn = document.getElementById('simAddWidgetBtn');
      const closeWidgetCatalogBtn = document.getElementById('closeWidgetCatalogBtn');
      const btnAddSmtcWidget = document.getElementById('btnAddSmtcWidget');
      const btnToggleSmtcWidget = document.getElementById('btnToggleSmtcWidget');
      const widgetScaleSlider = document.getElementById('widgetScaleSlider');
      const btnResetWidgetPos = document.getElementById('btnResetWidgetPos');
      const linkGoToProjects = document.getElementById('linkGoToProjects');

      if (enabledToggle) {
        enabledToggle.addEventListener('change', (e) => {
          this.settings.overlayEnabled = e.target.checked;
          this.updateSimPreview();
          this.log(`[OVERLAY] Оверлей ${e.target.checked ? 'включен' : 'отключен'}`);
        });
      }

      if (hotkeySelect) {
        hotkeySelect.addEventListener('change', (e) => {
          this.settings.overlayHotkey = e.target.value;
          const opt = e.target.selectedOptions[0];
          this.settings.overlayHotkeyCode = parseInt(opt?.getAttribute('data-code') || '122', 10);
          this.updateSimPreview();
          this.log(`[HOTKEY] Выбрана клавиша вызова: ${this.settings.overlayHotkey} (код: 0x${this.settings.overlayHotkeyCode.toString(16)})`);
        });
      }

      if (showFpsToggle) {
        showFpsToggle.addEventListener('change', (e) => {
          this.settings.overlayShowFps = e.target.checked;
          this.updateSimPreview();
        });
      }

      if (positionSelect) {
        positionSelect.addEventListener('change', (e) => {
          this.settings.overlayPosition = e.target.value;
          const box = document.getElementById('simOverlayBox');
          if (box) {
            box.style.position = 'relative';
            box.style.left = '';
            box.style.top = '';
            box.style.right = '';
            box.style.bottom = '';
            switch (e.target.value) {
              case 'top-left':
                box.style.alignSelf = 'flex-start';
                this.settings.overlayPosX = 24; this.settings.overlayPosY = 24;
                break;
              case 'top-right':
                box.style.alignSelf = 'flex-end';
                this.settings.overlayPosX = 1400; this.settings.overlayPosY = 24;
                break;
              case 'bottom-left':
                box.style.alignSelf = 'flex-start';
                this.settings.overlayPosX = 24; this.settings.overlayPosY = 850;
                break;
              case 'bottom-right':
                box.style.alignSelf = 'flex-end';
                this.settings.overlayPosX = 1400; this.settings.overlayPosY = 850;
                break;
            }
          }
          this.updateSimPreview();
        });
      }

      if (simGearBtn) {
        simGearBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.toggleSettingsMode();
        });
      }

      if (simAddWidgetBtn) {
        simAddWidgetBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.toggleWidgetCatalog();
        });
      }

      if (closeWidgetCatalogBtn) {
        closeWidgetCatalogBtn.addEventListener('click', () => {
          const popover = document.getElementById('widgetCatalogPopover');
          if (popover) popover.style.display = 'none';
        });
      }

      if (btnAddSmtcWidget) {
        btnAddSmtcWidget.addEventListener('click', () => {
          this.setSmtcVisible(true);
          const popover = document.getElementById('widgetCatalogPopover');
          if (popover) popover.style.display = 'none';
          Toast.show('Виджет SMTC плеера добавлен на экран оверлея!');
        });
      }

      if (btnToggleSmtcWidget) {
        btnToggleSmtcWidget.addEventListener('click', () => {
          this.setSmtcVisible(!this.settings.smtcVisible);
          Toast.show(this.settings.smtcVisible ? 'Виджет SMTC добавлен' : 'Виджет SMTC удалён');
        });
      }

      if (widgetScaleSlider) {
        widgetScaleSlider.addEventListener('input', (e) => {
          const scale = parseFloat(e.target.value);
          this.setSmtcScale(scale);
        });
      }

      if (btnResetWidgetPos) {
        btnResetWidgetPos.addEventListener('click', () => {
          this.resetWidgetPositions();
          Toast.show('Расположение и масштаб виджетов сброшены');
        });
      }

      if (linkGoToProjects) {
        linkGoToProjects.addEventListener('click', (e) => {
          e.preventDefault();
          const tabBtn = document.querySelector('.nav-item[data-tab="tab-projects"]');
          if (tabBtn) tabBtn.click();
        });
      }
    },

    toggleSettingsMode() {
      this.settings.isSettingsOpen = !this.settings.isSettingsOpen;
      const simGearBtn = document.getElementById('simGearBtn');
      const simAddWidgetBtn = document.getElementById('simAddWidgetBtn');
      const popover = document.getElementById('widgetCatalogPopover');

      if (simGearBtn) {
        simGearBtn.classList.toggle('active', this.settings.isSettingsOpen);
      }

      if (simAddWidgetBtn) {
        simAddWidgetBtn.style.display = this.settings.isSettingsOpen ? 'inline-flex' : 'none';
      }

      if (!this.settings.isSettingsOpen && popover) {
        popover.style.display = 'none';
      }

      this.log(`[OVERLAY] Режим настроек оверлея ${this.settings.isSettingsOpen ? 'ОТКРЫТ (кнопка [+] активна)' : 'ЗАКРЫТ'}`);
    },

    toggleWidgetCatalog() {
      const popover = document.getElementById('widgetCatalogPopover');
      if (!popover) return;
      const isHidden = popover.style.display === 'none' || !popover.style.display;
      popover.style.display = isHidden ? 'block' : 'none';
    },

    setSmtcVisible(visible) {
      this.settings.smtcVisible = visible;
      const widget = document.getElementById('simSmtcWidget');
      const badge = document.getElementById('smtcActiveBadge');
      const btnText = document.getElementById('btnToggleSmtcText');

      if (widget) {
        widget.style.display = visible ? 'flex' : 'none';
      }
      if (badge) {
        badge.textContent = visible ? '1 активен' : '0 активно';
        badge.className = visible ? 'badge badge-accent font-mono' : 'badge badge-muted font-mono';
      }
      if (btnText) {
        btnText.textContent = visible ? 'Скрыть SMTC плеер' : '+ Добавить SMTC плеер';
      }
    },

    setSmtcScale(scale) {
      this.settings.smtcScale = Math.min(1.8, Math.max(0.6, scale));
      const widget = document.getElementById('simSmtcWidget');
      const scaleBadge = document.getElementById('smtcScaleBadge');
      const slider = document.getElementById('widgetScaleSlider');
      const scaleVal = document.getElementById('widgetScaleVal');

      if (widget) {
        widget.style.transform = `scale(${this.settings.smtcScale.toFixed(2)})`;
      }
      if (scaleBadge) {
        scaleBadge.textContent = `${this.settings.smtcScale.toFixed(2)}x`;
      }
      if (slider) {
        slider.value = this.settings.smtcScale.toFixed(2);
      }
      if (scaleVal) {
        scaleVal.textContent = `${this.settings.smtcScale.toFixed(2)}x`;
      }
    },

    resetWidgetPositions() {
      const widget = document.getElementById('simSmtcWidget');
      const hudBox = document.getElementById('simOverlayBox');
      if (widget) {
        widget.style.left = '';
        widget.style.top = '24px';
        widget.style.right = '24px';
        widget.style.bottom = '';
      }
      if (hudBox) {
        hudBox.style.left = '';
        hudBox.style.top = '';
        hudBox.style.right = '';
        hudBox.style.bottom = '';
        hudBox.style.position = 'relative';
      }
      this.setSmtcScale(1.0);
    },

    bindSmtcWidget() {
      const closeBtn = document.getElementById('smtcWidgetCloseBtn');
      const playBtn = document.getElementById('smtcPlayBtn');
      const prevBtn = document.getElementById('smtcPrevBtn');
      const nextBtn = document.getElementById('smtcNextBtn');
      const seekBar = document.getElementById('smtcSeekBar');
      const volSlider = document.getElementById('smtcVolSlider');
      const resizeHandle = document.getElementById('smtcResizeHandle');

      if (closeBtn) {
        closeBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.setSmtcVisible(false);
          Toast.show('Виджет SMTC удалён. Нажмите [+], чтобы вернуть.');
        });
      }

      if (playBtn) {
        playBtn.addEventListener('click', () => {
          this.togglePlay();
        });
      }

      if (prevBtn) {
        prevBtn.addEventListener('click', () => {
          this.settings.smtcCurrentTrack = (this.settings.smtcCurrentTrack - 1 + this.tracks.length) % this.tracks.length;
          this.settings.smtcCurrentSeconds = 0;
          this.updateSmtcUI();
        });
      }

      if (nextBtn) {
        nextBtn.addEventListener('click', () => {
          this.settings.smtcCurrentTrack = (this.settings.smtcCurrentTrack + 1) % this.tracks.length;
          this.settings.smtcCurrentSeconds = 0;
          this.updateSmtcUI();
        });
      }

      if (seekBar) {
        seekBar.addEventListener('click', (e) => {
          const rect = seekBar.getBoundingClientRect();
          const clickX = e.clientX - rect.left;
          const ratio = Math.max(0, Math.min(1, clickX / rect.width));
          const curTrack = this.tracks[this.settings.smtcCurrentTrack];
          this.settings.smtcCurrentSeconds = Math.floor(ratio * curTrack.duration);
          this.updateSmtcUI();
        });
      }

      if (volSlider) {
        volSlider.addEventListener('input', (e) => {
          this.settings.smtcVolume = parseInt(e.target.value, 10);
        });
      }

      if (resizeHandle) {
        let isResizing = false;
        let startX = 0;
        let startScale = 1.0;

        resizeHandle.addEventListener('mousedown', (e) => {
          e.stopPropagation();
          isResizing = true;
          startX = e.clientX;
          startScale = this.settings.smtcScale;
          document.body.style.cursor = 'se-resize';

          const onMouseMove = (moveEvent) => {
            if (!isResizing) return;
            const deltaX = moveEvent.clientX - startX;
            const newScale = startScale + (deltaX / 250);
            this.setSmtcScale(newScale);
          };

          const onMouseUp = () => {
            isResizing = false;
            document.body.style.cursor = '';
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
          };

          window.addEventListener('mousemove', onMouseMove);
          window.addEventListener('mouseup', onMouseUp);
        });
      }
    },

    togglePlay() {
      this.settings.smtcPlaying = !this.settings.smtcPlaying;
      this.updateSmtcUI();
    },

    startSmtcTimer() {
      if (this.timerId) clearInterval(this.timerId);
      this.timerId = setInterval(() => {
        if (!this.settings.smtcPlaying) return;
        const curTrack = this.tracks[this.settings.smtcCurrentTrack];
        this.settings.smtcCurrentSeconds++;
        if (this.settings.smtcCurrentSeconds >= curTrack.duration) {
          this.settings.smtcCurrentSeconds = 0;
          this.settings.smtcCurrentTrack = (this.settings.smtcCurrentTrack + 1) % this.tracks.length;
        }
        this.updateSmtcUI();
      }, 1000);
    },

    formatTime(sec) {
      const m = Math.floor(sec / 60);
      const s = Math.floor(sec % 60);
      return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
    },

    updateSmtcUI() {
      const curTrack = this.tracks[this.settings.smtcCurrentTrack];
      const titleEl = document.getElementById('smtcTrackTitle');
      const artistEl = document.getElementById('smtcTrackArtist');
      const sourceEl = document.getElementById('smtcSourceText');
      const curTimeEl = document.getElementById('smtcTimeCurrent');
      const totalTimeEl = document.getElementById('smtcTimeTotal');
      const seekFill = document.getElementById('smtcSeekFill');
      const visualizer = document.getElementById('smtcVisualizer');
      const playIcon = document.getElementById('smtcPlayIcon');

      if (titleEl) titleEl.textContent = curTrack.title;
      if (artistEl) artistEl.textContent = curTrack.artist;
      if (sourceEl) sourceEl.textContent = curTrack.source;
      if (curTimeEl) curTimeEl.textContent = this.formatTime(this.settings.smtcCurrentSeconds);
      if (totalTimeEl) totalTimeEl.textContent = this.formatTime(curTrack.duration);

      if (seekFill) {
        const pct = ((this.settings.smtcCurrentSeconds / curTrack.duration) * 100).toFixed(1);
        seekFill.style.width = `${pct}%`;
      }

      if (visualizer) {
        visualizer.classList.toggle('playing', this.settings.smtcPlaying);
      }

      if (playIcon) {
        if (this.settings.smtcPlaying) {
          playIcon.innerHTML = '<rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect>';
        } else {
          playIcon.innerHTML = '<polygon points="5 3 19 12 5 21 5 3"></polygon>';
        }
      }
    },

    bindDraggables() {
      const bg = document.getElementById('simGameBg');
      const hudBox = document.getElementById('simOverlayBox');
      const smtc = document.getElementById('simSmtcWidget');
      if (!bg) return;

      const makeDraggable = (el) => {
        if (!el) return;
        let isDragging = false;
        let startX = 0, startY = 0;
        let origLeft = 0, origTop = 0;

        el.addEventListener('mousedown', (e) => {
          if (['BUTTON', 'INPUT', 'SELECT', 'A'].includes(e.target.tagName)) return;
          if (e.target.classList.contains('widget-resize-handle')) return;

          isDragging = true;
          const bgRect = bg.getBoundingClientRect();
          const elRect = el.getBoundingClientRect();

          startX = e.clientX;
          startY = e.clientY;
          origLeft = elRect.left - bgRect.left;
          origTop = elRect.top - bgRect.top;

          el.style.position = 'absolute';
          el.style.left = `${origLeft}px`;
          el.style.top = `${origTop}px`;
          el.style.right = 'auto';
          el.style.bottom = 'auto';
          el.style.margin = '0';
          el.style.zIndex = '60';

          const onMouseMove = (moveEvent) => {
            if (!isDragging) return;
            const dx = moveEvent.clientX - startX;
            const dy = moveEvent.clientY - startY;
            const maxW = bg.clientWidth - (el.offsetWidth * (el === smtc ? this.settings.smtcScale : 1.0));
            const maxH = bg.clientHeight - (el.offsetHeight * (el === smtc ? this.settings.smtcScale : 1.0));

            const newX = Math.max(0, Math.min(maxW, origLeft + dx));
            const newY = Math.max(0, Math.min(maxH, origTop + dy));

            el.style.left = `${newX}px`;
            el.style.top = `${newY}px`;
          };

          const onMouseUp = () => {
            isDragging = false;
            el.style.zIndex = el === smtc ? '50' : '40';
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
          };

          window.addEventListener('mousemove', onMouseMove);
          window.addEventListener('mouseup', onMouseUp);
        });
      };

      makeDraggable(hudBox);
      makeDraggable(smtc);
    },

    bindActions() {
      const syncBtn = document.getElementById('btnSyncOverlay');
      const saveBtn = document.getElementById('btnSaveOverlaySettings');
      const clearBtn = document.getElementById('overlayClearLogBtn');

      if (syncBtn) {
        syncBtn.addEventListener('click', () => this.syncIpc());
      }
      if (saveBtn) {
        saveBtn.addEventListener('click', () => this.saveSettings());
      }
      if (clearBtn) {
        clearBtn.addEventListener('click', () => {
          const log = document.getElementById('overlayTerminalLog');
          if (log) log.innerHTML = '';
        });
      }
    },

    updateSimPreview() {
      const simBox = document.getElementById('simOverlayBox');
      const simTitle = document.getElementById('simOverlayTitle');
      const simFpsRow = document.getElementById('simFpsRow');
      const simHotkey = document.getElementById('simHotkeyVal');

      if (simTitle) simTitle.textContent = (this.hasVulkan === false) ? 'SAPatcher 2.0 (D3D9 Only)' : (this.settings.overlayTitle || 'SAPatcher 2.0');
      if (simFpsRow) simFpsRow.style.display = this.settings.overlayShowFps ? 'block' : 'none';
      if (simHotkey) simHotkey.textContent = this.settings.overlayHotkey || 'F11';
      if (simBox) {
        simBox.style.opacity = this.settings.overlayEnabled ? '1' : '0.4';
      }
    },

    startSimulatedFps() {
      setInterval(() => {
        const fpsVal = document.getElementById('simFpsVal');
        if (fpsVal && this.settings.overlayShowFps) {
          const fps = (143.5 + Math.random() * 1.5).toFixed(1);
          fpsVal.textContent = fps;
        }
      }, 700);
    },

    syncIpc() {
      this.sendIpcMessage({ action: 'syncOverlayIpc' });
      Toast.show(I18nManager.get('toast.overlay_synced'));
      this.log(`[SYNC] Синхронизировано: hotkey=${this.settings.overlayHotkey}, title=${this.settings.overlayTitle}`);
    },

    saveSettings() {
      this.sendIpcMessage({
        action: 'saveSettings',
        settings: {
          overlayEnabled: this.settings.overlayEnabled,
          overlayHotkey: this.settings.overlayHotkey,
          overlayHotkeyCode: this.settings.overlayHotkeyCode,
          overlayTitle: 'SAPatcher 2.0',
          overlayShowGear: true,
          overlayShowFps: this.settings.overlayShowFps,
          overlayPosition: this.settings.overlayPosition,
          overlayPosX: this.settings.overlayPosX,
          overlayPosY: this.settings.overlayPosY,
          overlayScale: this.settings.overlayScale
        }
      });
      Toast.show(I18nManager.get('toast.overlay_synced'));
      this.log(`[SAVE] Настройки сохранены и переданы в Shared Memory.`);
    },

    applyLoadedSettings(data) {
      if (!data) return;
      if (data.overlayEnabled !== undefined) this.settings.overlayEnabled = data.overlayEnabled;
      if (data.overlayHotkey) this.settings.overlayHotkey = data.overlayHotkey;
      if (data.overlayHotkeyCode) this.settings.overlayHotkeyCode = data.overlayHotkeyCode;
      if (data.overlayShowFps !== undefined) this.settings.overlayShowFps = data.overlayShowFps;
      if (data.overlayPosition) this.settings.overlayPosition = data.overlayPosition;
      if (data.overlayPosX !== undefined) this.settings.overlayPosX = data.overlayPosX;
      if (data.overlayPosY !== undefined) this.settings.overlayPosY = data.overlayPosY;

      const enabledToggle = document.getElementById('overlayEnabledToggle');
      const hotkeySelect = document.getElementById('overlayHotkeySelect');
      const showFpsToggle = document.getElementById('overlayShowFpsToggle');
      const positionSelect = document.getElementById('overlayPositionSelect');

      if (enabledToggle) enabledToggle.checked = this.settings.overlayEnabled;
      if (hotkeySelect) hotkeySelect.value = this.settings.overlayHotkey;
      if (showFpsToggle) showFpsToggle.checked = this.settings.overlayShowFps;
      if (positionSelect) positionSelect.value = this.settings.overlayPosition;

      this.updateSimPreview();
    },

    sendIpcMessage(payload) {
      const msg = JSON.stringify(payload);
      try {
        if (window.external && typeof window.external.sendMessage === 'function') {
          window.external.sendMessage(msg);
        } else if (window.chrome && window.chrome.webview && typeof window.chrome.webview.postMessage === 'function') {
          window.chrome.webview.postMessage(msg);
        }
      } catch (e) {
        console.error('IPC message failed', e);
      }
    },

    log(msg, type = 'info') {
      const term = document.getElementById('overlayTerminalLog');
      if (!term) return;
      const line = document.createElement('div');
      line.className = `log-line log-line--${type}`;
      line.textContent = msg;
      term.appendChild(line);
      term.scrollTop = term.scrollHeight;
    },

    updateGpuVulkanState(hasVulkan) {
      this.hasVulkan = hasVulkan;
      const notice = document.getElementById('overlayGpuNotice');
      const simBox = document.getElementById('simOverlayBox');
      const simTitle = document.getElementById('simOverlayTitle');
      const simWatermark = document.querySelector('.overlay-sim-watermark');
      const statusText = document.getElementById('overlayStatusText');
      const statusDot = document.getElementById('overlayStatusDot');
      const enabledToggle = document.getElementById('overlayEnabledToggle');
      const saveBtn = document.getElementById('btnSaveOverlaySettings');
      const syncBtn = document.getElementById('btnSyncOverlay');
      const simFpsRow = document.getElementById('simFpsRow');
      const subRow = document.querySelector('.overlay-sim-sub');

      if (!hasVulkan) {
        if (notice) notice.style.display = 'flex';
        if (simBox) {
          simBox.style.opacity = '0.35';
          simBox.style.pointerEvents = 'none';
        }
        if (simTitle) simTitle.textContent = 'SAPatcher 2.0 (D3D9 Only)';
        if (statusText) {
          statusText.textContent = 'Vulkan Недоступно • Отключен';
          statusText.style.color = '#f43f5e';
        }
        if (statusDot) {
          statusDot.className = 'status-dot-inline status-dot--error';
        }
        if (enabledToggle) {
          enabledToggle.checked = false;
          enabledToggle.disabled = true;
        }
        if (saveBtn) {
          saveBtn.disabled = true;
          saveBtn.classList.add('btn-disabled');
          saveBtn.title = 'Оверлей заблокирован: видеокарта не поддерживает Vulkan API';
        }
        if (syncBtn) {
          syncBtn.disabled = true;
          syncBtn.classList.add('btn-disabled');
          syncBtn.title = 'Синхронизация недоступна без поддержки Vulkan';
        }
        if (simWatermark) {
          simWatermark.textContent = 'Grand Theft Auto: San Andreas (DirectX 9 Native • Оверлей заблокирован: нет Vulkan)';
        }
        if (simFpsRow) {
          simFpsRow.innerHTML = '<span class="text-rose font-bold">Оверлей не поддерживается на текущем GPU</span>';
        }
        if (subRow) {
          subRow.innerHTML = '<span class="text-rose">Vulkan Не поддерживается</span> <span class="text-muted font-mono">| DXVK оверлей недоступен</span>';
        }
      } else {
        if (notice) notice.style.display = 'none';
        if (simBox) {
          simBox.style.opacity = this.settings.overlayEnabled ? '1' : '0.4';
          simBox.style.pointerEvents = 'auto';
        }
        if (simTitle) simTitle.textContent = 'SAPatcher 2.0';
        if (statusText) {
          statusText.textContent = 'Vulkan HUD • Активен';
          statusText.style.color = '';
        }
        if (statusDot) {
          statusDot.className = 'status-dot-inline status-dot--ready';
        }
        if (enabledToggle) {
          enabledToggle.disabled = false;
        }
        if (saveBtn) {
          saveBtn.disabled = false;
          saveBtn.classList.remove('btn-disabled');
          saveBtn.title = '';
        }
        if (syncBtn) {
          syncBtn.disabled = false;
          syncBtn.classList.remove('btn-disabled');
          syncBtn.title = '';
        }
        if (simWatermark) {
          simWatermark.textContent = 'Grand Theft Auto: San Andreas (DirectX 9 → Vulkan via DXVK 3.1.1)';
        }
        if (simFpsRow) {
          simFpsRow.innerHTML = 'FPS: <span class="text-cyan font-bold" id="simFpsVal">144.2</span> (6.93 ms)';
        }
        if (subRow) {
          subRow.innerHTML = '<span class="text-emerald">Vulkan D3D9 Active</span> <span class="text-muted font-mono">| DXVK 3.1.1</span>';
        }
      }
    }
  };

  const StandaloneLaaManager = {
    currentFilePath: '',
    lastInspection: null,

    init() {
      const btnBrowse = document.getElementById('btnBrowseStandaloneExe');
      if (btnBrowse) {
        btnBrowse.addEventListener('click', () => {
          this.logToTerminal('[BROWSE] Открытие диалога выбора исполняемого файла .exe...', 'info');
          this.sendIpc({ action: 'browseAnyExeFile', currentPath: this.currentFilePath });
        });
      }

      const btnMotion = document.getElementById('btnQuickSelectMotion');
      if (btnMotion) {
        btnMotion.addEventListener('click', () => this.selectQuickExe('motion.exe'));
      }

      const btnSamp = document.getElementById('btnQuickSelectSamp');
      if (btnSamp) {
        btnSamp.addEventListener('click', () => this.selectQuickExe('samp.exe'));
      }

      const btnGtaSa = document.getElementById('btnQuickSelectGtaSa');
      if (btnGtaSa) {
        btnGtaSa.addEventListener('click', () => this.selectQuickExe('gta_sa.exe'));
      }

      const btnReload = document.getElementById('btnQuickInspectReload');
      if (btnReload) {
        btnReload.addEventListener('click', () => {
          if (this.currentFilePath) {
            this.inspectExe(this.currentFilePath);
          } else {
            Toast.show('Сначала выберите .exe файл для проверки', 3000);
          }
        });
      }

      const btnApply = document.getElementById('btnApplyStandaloneLaa');
      if (btnApply) {
        btnApply.addEventListener('click', () => {
          if (!this.currentFilePath) {
            Toast.show('Выберите .exe файл для применения патча!', 3000);
            return;
          }
          this.logToTerminal(`[4GB_PATCH] Запуск применения флага LAA к: ${this.currentFilePath}`, 'detect');
          btnApply.disabled = true;
          this.sendIpc({ action: 'applyStandaloneLaa', filePath: this.currentFilePath });
        });
      }

      const btnRestore = document.getElementById('btnRestoreStandaloneLaa');
      if (btnRestore) {
        btnRestore.addEventListener('click', () => {
          if (!this.currentFilePath) return;
          this.logToTerminal(`[BACKUP_RESTORE] Восстановление из .Backup для: ${this.currentFilePath}`, 'warn');
          btnRestore.disabled = true;
          this.sendIpc({ action: 'restoreStandaloneExeBackup', filePath: this.currentFilePath });
        });
      }

      const btnLaunch = document.getElementById('btnLaunchStandaloneExe');
      if (btnLaunch) {
        btnLaunch.addEventListener('click', () => {
          if (!this.currentFilePath) return;
          this.logToTerminal(`[PROCESS] Запуск приложения: ${this.currentFilePath}`, 'info');
          this.sendIpc({ action: 'launchStandaloneExe', filePath: this.currentFilePath });
        });
      }

      const btnClear = document.getElementById('standaloneClearLogBtn');
      if (btnClear) {
        btnClear.addEventListener('click', () => {
          const logBox = document.getElementById('standaloneTerminalLog');
          if (logBox) logBox.innerHTML = '';
        });
      }
    },

    onTabOpened() {
      if (!this.currentFilePath) {
        const gamePath = (typeof MotionProjectManager !== 'undefined' && MotionProjectManager.detectedGamePath) || 'c:\\games\\motion\\motion project';
        if (gamePath) {
          const defaultMotion = gamePath.replace(/[\\/]+$/, '') + '\\motion.exe';
          this.inspectExe(defaultMotion);
        }
      }
    },

    updateVulkanState(hasVulkan) {
      if (!hasVulkan) {
        this.logToTerminal('[SYSTEM] Видеокарта не поддерживает Vulkan API. Режим оверлея и DXVK заблокирован. Доступен автономный LAA 4 ГБ патчер.', 'warn');
      }
    },

    selectQuickExe(exeName) {
      const gamePath = (typeof MotionProjectManager !== 'undefined' && MotionProjectManager.detectedGamePath) || 'c:\\games\\motion\\motion project';
      const cleanPath = gamePath.replace(/[\\/]+$/, '');
      const fullPath = `${cleanPath}\\${exeName}`;
      this.inspectExe(fullPath);
    },

    inspectExe(filePath) {
      if (!filePath) return;
      this.logToTerminal(`[INSPECT] Проверка структуры PE заголовка: ${filePath}...`, 'info');
      this.sendIpc({ action: 'inspectStandaloneExe', filePath: filePath });
    },

    onExeSelected(data) {
      const inspection = data.inspection || data;
      this.updateInspectionUi(inspection);
      this.logToTerminal(`[SELECT] Выбран файл: ${inspection.filePath} (${inspection.fileSizeFormatted || 'N/A'})`, 'success');
      Toast.show('Файл выбран для LAA анализа', 3000);
    },

    onExeInspected(data) {
      const inspection = data.inspection || data;
      this.updateInspectionUi(inspection);
      if (inspection.exists) {
        const laaText = inspection.isLaaActive ? 'АКТИВЕН (4 ГБ)' : 'НЕ АКТИВЕН (Лимит 2 ГБ)';
        this.logToTerminal(`[INSPECT_DONE] ${inspection.fileName} -> LAA: ${laaText} | PE offset: 0x${(inspection.peOffset || 0).toString(16).toUpperCase()}`, inspection.isLaaActive ? 'success' : 'warn');
      } else {
        this.logToTerminal(`[INSPECT_ERROR] ${inspection.message || 'Файл не найден'}`, 'error');
      }
    },

    onApplyResult(data) {
      const btnApply = document.getElementById('btnApplyStandaloneLaa');
      if (btnApply) btnApply.disabled = false;

      if (data.success) {
        Toast.show(data.message || 'Патч 4 ГБ ОЗУ успешно установлен!', 4500);
        this.logToTerminal(`[SUCCESS] ${data.message}`, 'success');
      } else {
        Toast.show(data.message || 'Ошибка применения LAA патча!', 4500);
        this.logToTerminal(`[ERROR] ${data.message}`, 'error');
      }

      if (data.inspection) {
        this.updateInspectionUi(data.inspection);
      }
    },

    onRestoreResult(data) {
      const btnRestore = document.getElementById('btnRestoreStandaloneLaa');
      if (btnRestore) btnRestore.disabled = false;

      if (data.success) {
        Toast.show(data.message || 'Файл восстановлен из резервной копии!', 4000);
        this.logToTerminal(`[RESTORE_OK] ${data.message}`, 'success');
      } else {
        Toast.show(data.message || 'Ошибка восстановления из бэкапа', 4000);
        this.logToTerminal(`[RESTORE_ERROR] ${data.message}`, 'error');
      }

      if (data.inspection) {
        this.updateInspectionUi(data.inspection);
      }
    },

    onLaunchResult(data) {
      if (data.success) {
        Toast.show(data.message || 'Приложение запущено!', 3500);
        this.logToTerminal(`[LAUNCH_OK] ${data.message}`, 'success');
      } else {
        Toast.show(data.message || 'Ошибка запуска приложения', 4000);
        this.logToTerminal(`[LAUNCH_ERROR] ${data.message}`, 'error');
      }
    },

    updateInspectionUi(insp) {
      if (!insp) return;
      this.lastInspection = insp;
      this.currentFilePath = insp.filePath || '';

      const inputPath = document.getElementById('standaloneExePath');
      if (inputPath) inputPath.value = insp.filePath || '';

      const elName = document.getElementById('standaloneInspectFileName');
      if (elName) elName.textContent = insp.fileName || (insp.exists ? insp.filePath : 'Файл не найден');

      const elSize = document.getElementById('standaloneInspectFileSize');
      if (elSize) elSize.textContent = insp.fileSizeFormatted || (insp.fileSizeBytes ? `${insp.fileSizeBytes} B` : '—');

      const elPeOffset = document.getElementById('standaloneInspectPeOffset');
      if (elPeOffset) elPeOffset.textContent = insp.peOffset ? `0x${insp.peOffset.toString(16).toUpperCase()} (${insp.peOffset})` : '—';

      const elLaa = document.getElementById('standaloneInspectLaaFlag');
      if (elLaa) {
        if (!insp.exists) {
          elLaa.innerHTML = '<span class="text-muted">Недоступно</span>';
        } else if (insp.isLaaActive) {
          elLaa.innerHTML = '<span class="text-emerald" style="font-weight:700;">АКТИВЕН (0x0020)</span>';
        } else {
          elLaa.innerHTML = '<span class="text-amber" style="font-weight:700;">ОТСУТСТВУЕТ (2 ГБ)</span>';
        }
      }

      const elChecksum = document.getElementById('standaloneInspectChecksum');
      if (elChecksum) elChecksum.textContent = insp.checksum ? `0x${insp.checksum.toString(16).toUpperCase()}` : '—';

      const elBackup = document.getElementById('standaloneInspectBackupStatus');
      if (elBackup) {
        if (insp.backupExists) {
          elBackup.innerHTML = `<span class="text-emerald">Создан (${insp.backupSizeFormatted || 'OK'})</span>`;
        } else {
          elBackup.innerHTML = '<span class="text-muted">Отсутствует</span>';
        }
      }

      const msgBox = document.getElementById('standaloneInspectMessageBox');
      if (msgBox) {
        msgBox.textContent = insp.message || '';
        if (insp.isLaaActive) {
          msgBox.style.borderColor = 'rgba(16, 185, 129, 0.4)';
          msgBox.style.color = '#10b981';
        } else if (insp.exists) {
          msgBox.style.borderColor = 'rgba(245, 158, 11, 0.4)';
          msgBox.style.color = '#f59e0b';
        } else {
          msgBox.style.borderColor = 'rgba(244, 63, 94, 0.4)';
          msgBox.style.color = '#f43f5e';
        }
      }

      const badge = document.getElementById('standaloneLaaStatusBadge');
      if (badge) {
        if (!insp.exists) {
          badge.className = 'badge badge-danger font-mono';
          badge.textContent = 'ФАЙЛ НЕ НАЙДЕН';
        } else if (insp.isLaaActive) {
          badge.className = 'badge badge-success font-mono';
          badge.textContent = '✓ АКТИВЕН 4 ГБ';
        } else {
          badge.className = 'badge badge-warning font-mono';
          badge.textContent = '⚠️ ЛИМИТ 2 ГБ';
        }
      }

      const btnApply = document.getElementById('btnApplyStandaloneLaa');
      if (btnApply) {
        btnApply.disabled = !insp.exists;
        const btnText = btnApply.querySelector('.btn-text');
        if (btnText) {
          btnText.textContent = insp.isLaaActive ? 'Обновить 4 ГБ ОЗУ (LAA)' : 'Пропатчить 4 ГБ ОЗУ (LAA)';
        }
      }

      const btnRestore = document.getElementById('btnRestoreStandaloneLaa');
      if (btnRestore) {
        btnRestore.disabled = !insp.backupExists;
      }

      const btnLaunch = document.getElementById('btnLaunchStandaloneExe');
      if (btnLaunch) {
        btnLaunch.disabled = !insp.exists;
      }
    },

    logToTerminal(text, type = 'info') {
      const box = document.getElementById('standaloneTerminalLog');
      if (!box) return;

      const line = document.createElement('div');
      let cssClass = 'log-line--info';
      if (type === 'success') cssClass = 'log-line--success';
      else if (type === 'warn') cssClass = 'log-line--warn';
      else if (type === 'error') cssClass = 'log-line--error';
      else if (type === 'detect') cssClass = 'log-line--detect';
      else if (type === 'hint') cssClass = 'log-line--hint';

      line.className = `log-line ${cssClass}`;
      line.textContent = text;
      box.appendChild(line);
      box.scrollTop = box.scrollHeight;
    },

    sendIpc(obj) {
      const s = JSON.stringify(obj);
      if (window.external && typeof window.external.sendMessage === 'function') {
        window.external.sendMessage(s);
        return true;
      } else if (window.chrome && window.chrome.webview && typeof window.chrome.webview.postMessage === 'function') {
        window.chrome.webview.postMessage(s);
        return true;
      }
      return false;
    }
  };

  const Navigation = {
    init() {
      const navItems = document.querySelectorAll('.nav-item');
      navItems.forEach((btn) => {
        btn.addEventListener('click', () => {
          if (btn.hasAttribute('disabled') || btn.style.pointerEvents === 'none') {
            return;
          }
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
            } else if (targetTab === 'tab-overlay') {
              OverlayManager.updateSimPreview();
            } else if (targetTab === 'tab-standalone-laa') {
              StandaloneLaaManager.onTabOpened();
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

  const DeveloperModeManager = {
    isActive: false,
    hwAllowed: false,
    hwSummary: '',
    pressedKeys: new Set(),

    init() {
      this.bindKeys();
      this.bindDialog();
      this.bindBadge();
    },

    bindKeys() {
      window.addEventListener('keydown', (e) => {
        if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;

        this.pressedKeys.add(e.code);

        const isD = this.pressedKeys.has('KeyD');
        const isE = this.pressedKeys.has('KeyE');
        const isU = this.pressedKeys.has('KeyU');

        if (isD && isE && isU) {
          const activePanel = document.querySelector('.settings-panel.active');
          if (activePanel && activePanel.id === 'tab-projects') {
            this.openDialog();
          }
        }
      });

      window.addEventListener('keyup', (e) => {
        this.pressedKeys.delete(e.code);
      });
    },

    bindDialog() {
      const dialog = document.getElementById('developerModeDialog');
      const cancelBtn = document.getElementById('devModeCancelBtn');
      const unlockBtn = document.getElementById('devModeUnlockBtn');
      const pwdInput = document.getElementById('devModePasswordInput');

      if (cancelBtn && dialog) {
        cancelBtn.addEventListener('click', () => dialog.close());
      }

      if (unlockBtn && pwdInput) {
        unlockBtn.addEventListener('click', () => this.submitUnlock());
      }

      if (pwdInput) {
        pwdInput.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') {
            this.submitUnlock();
          }
        });
      }
    },

    bindBadge() {
      const badge = document.getElementById('projectsDevModeBadge');
      if (badge) {
        badge.addEventListener('click', () => {
          if (this.isActive) {
            Dialogs.showConfirm(
              'Включение защиты',
              'Отключить режим разработчика и вернуть стандартную защиту папки игры и античит?',
              () => {
                this.sendIpc({ action: 'toggleDeveloperMode', enable: false });
                Toast.show('Режим разработчика деактивирован. Защита включена.');
              }
            );
          }
        });
      }
    },

    openDialog() {
      const dialog = document.getElementById('developerModeDialog');
      const titleEl = document.getElementById('developerModeDialogTitle');
      const descEl = document.getElementById('developerModeDialogDesc');
      const btnTextEl = document.getElementById('devModeUnlockBtnText');
      const pwdInput = document.getElementById('devModePasswordInput');
      if (pwdInput) pwdInput.value = '';

      if (this.isActive) {
        if (titleEl) titleEl.textContent = 'Включение защиты (Выход из Dev Mode)';
        if (descEl) descEl.textContent = 'Защита в данный момент ОТКЛЮЧЕНА (Dev Mode активен). Введите пароль разработчика для включения защиты.';
        if (btnTextEl) btnTextEl.textContent = 'Включить защиту';
      } else {
        if (titleEl) titleEl.textContent = 'Режим разработчика (Dev Mode)';
        if (descEl) descEl.textContent = 'Аппаратная аутентификация для отключения систем защиты и античита игры.';
        if (btnTextEl) btnTextEl.textContent = 'Разблокировать';
      }

      this.sendIpc({ action: 'checkDeveloperStatus' });
      if (dialog && typeof dialog.showModal === 'function') {
        dialog.showModal();
        if (pwdInput) pwdInput.focus();
      }
    },

    submitUnlock() {
      const pwdInput = document.getElementById('devModePasswordInput');
      const pwd = pwdInput ? pwdInput.value.trim() : '';
      if (!pwd) {
        Toast.show('Введите ключ доступа разработчика');
        return;
      }

      this.sendIpc({ action: 'unlockDeveloperMode', password: pwd });
    },

    onStatus(data) {
      if (!data) return;
      this.isActive = !!data.active;
      this.hwAllowed = !!data.hwAllowed;
      this.hwSummary = data.hwSummary || '';

      const badge = document.getElementById('projectsDevModeBadge');
      if (badge) {
        badge.style.display = this.isActive ? 'inline-flex' : 'none';
      }

      const titleEl = document.getElementById('developerModeDialogTitle');
      const descEl = document.getElementById('developerModeDialogDesc');
      const btnTextEl = document.getElementById('devModeUnlockBtnText');
      if (this.isActive) {
        if (titleEl) titleEl.textContent = 'Включение защиты (Выход из Dev Mode)';
        if (descEl) descEl.textContent = 'Защита в данный момент ОТКЛЮЧЕНА (Dev Mode активен). Введите пароль разработчика для включения защиты.';
        if (btnTextEl) btnTextEl.textContent = 'Включить защиту';
      } else {
        if (titleEl) titleEl.textContent = 'Режим разработчика (Dev Mode)';
        if (descEl) descEl.textContent = 'Аппаратная аутентификация для отключения систем защиты и античита игры.';
        if (btnTextEl) btnTextEl.textContent = 'Разблокировать';
      }

      const hwInfo = document.getElementById('devHwInfoText');
      if (hwInfo && this.hwSummary) {
        hwInfo.textContent = this.hwSummary;
      }

      const hwStatus = document.getElementById('devHwStatusTag');
      if (hwStatus) {
        if (this.hwAllowed) {
          hwStatus.textContent = '✓ Материнская плата авторизована (MPG B550 GAMING PLUS)';
          hwStatus.className = 'text-emerald';
        } else {
          hwStatus.textContent = '✕ Оборудование не авторизовано';
          hwStatus.className = 'text-amber';
        }
      }

      const devGpuBar = document.getElementById('devGpuMockBar');
      if (devGpuBar && this.isActive) {
        devGpuBar.style.display = 'flex';
      }
    },

    onUnlockResult(data) {
      if (!data) return;
      if (data.success) {
        const dialog = document.getElementById('developerModeDialog');
        if (dialog) dialog.close();

        this.isActive = !!data.active;
        const badge = document.getElementById('projectsDevModeBadge');
        if (badge) {
          badge.style.display = this.isActive ? 'inline-flex' : 'none';
        }

        const devGpuBar = document.getElementById('devGpuMockBar');
        if (devGpuBar) {
          devGpuBar.style.display = this.isActive ? 'flex' : 'none';
        }

        if (data.toggled === 'off' || !this.isActive) {
          Toast.show(data.message || 'Режим разработчика выключен. Защита включена!', 4500);
          MotionProjectManager.logToTerminal('[DEV_MODE] Режим разработчика деактивирован. Защита лаунчера и игры включена.', 'info');
        } else {
          Toast.show(data.message || 'Режим разработчика активирован! Защита отключена.', 5000);
          MotionProjectManager.logToTerminal('[DEV_MODE] Режим разработчика активен. Защита папки игры и античит отключены.', 'success');
          MotionProjectManager.logToTerminal('[DEV_MODE] Авторизованное оборудование: ' + (data.hwSummary || 'MPG B550 GAMING PLUS'), 'hint');
        }
      } else {
        Toast.show(data.message || 'Ошибка активации режима разработчика', 4000);
      }
    },

    sendIpc(obj) {
      const s = JSON.stringify(obj);
      if (window.external && typeof window.external.sendMessage === 'function') {
        window.external.sendMessage(s);
        return true;
      } else if (window.chrome && window.chrome.webview && typeof window.chrome.webview.postMessage === 'function') {
        window.chrome.webview.postMessage(s);
        return true;
      }
      return false;
    }
  };

  document.addEventListener('DOMContentLoaded', () => {
    CanvasConstellation.init();
    Toast.init();
    Dialogs.init();
    Diagnostics.init();
    Navigation.init();
    MotionProjectManager.init();
    OverlayManager.init();
    StandaloneLaaManager.init();
    DeveloperModeManager.init();
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

// Motion Launcher — SAPatcher Dark Cyber Engine IPC Controller
(function() {
  'use strict';

  // Global State
  let state = {
    servers: [],
    selectedServerId: null,
    name: 'Player',
    path: '',
    buttonAction: 'play',
    wideScreenFix: true,
    highPerformanceEnabled: false,
    winter: false,
    isRunnableAsAdmin: false,
    downloadData: null
  };

  // DOM Elements Map
  const el = {
    btnMinimize: document.getElementById('btnMinimize'),
    btnClose: document.getElementById('btnClose'),
    engineVersion: document.getElementById('engineVersion'),
    hudGlobalStatus: document.getElementById('hudGlobalStatus'),
    hudLivePing: document.getElementById('hudLivePing'),
    topNick: document.getElementById('topNick'),
    avatarLetter: document.getElementById('avatarLetter'),
    heroBadge: document.getElementById('heroBadge'),
    heroTitle: document.getElementById('heroTitle'),
    heroOnline: document.getElementById('heroOnline'),
    heroMax: document.getElementById('heroMax'),
    heroIpPort: document.getElementById('heroIpPort'),
    primaryLaunchBtn: document.getElementById('primaryLaunchBtn'),
    launchBtnIcon: document.getElementById('launchBtnIcon'),
    launchBtnLabel: document.getElementById('launchBtnLabel'),
    downSpeed: document.getElementById('downSpeed'),
    downProgressBar: document.getElementById('downProgressBar'),
    downProgressGlow: document.getElementById('downProgressGlow'),
    downStatus: document.getElementById('downStatus'),
    downPercentage: document.getElementById('downPercentage'),
    btnVerifyFiles: document.getElementById('btnVerifyFiles'),
    inputNickname: document.getElementById('inputNickname'),
    btnSubmitNick: document.getElementById('btnSubmitNick'),
    serversCountBadge: document.getElementById('serversCountBadge'),
    serversList: document.getElementById('serversList'),
    gameFolderPath: document.getElementById('gameFolderPath'),
    btnSelectFolder: document.getElementById('btnSelectFolder'),
    btnOpenFolder: document.getElementById('btnOpenFolder'),
    btnScreenshots: document.getElementById('btnScreenshots'),
    btnHwid: document.getElementById('btnHwid'),
    toggleWidescreen: document.getElementById('toggleWidescreen'),
    indWidescreen: document.getElementById('indWidescreen'),
    toggleHighPerf: document.getElementById('toggleHighPerf'),
    indHighPerf: document.getElementById('indHighPerf'),
    toggleWinter: document.getElementById('toggleWinter'),
    indWinter: document.getElementById('indWinter'),
    toggleAdmin: document.getElementById('toggleAdmin'),
    indAdmin: document.getElementById('indAdmin'),
    bannerGraphicsLock: document.getElementById('bannerGraphicsLock'),
    bannerAutocloseLock: document.getElementById('bannerAutocloseLock'),
    bottomStatus: document.getElementById('bottomStatus'),
    btnHelpDesk: document.getElementById('btnHelpDesk'),
    toastArea: document.getElementById('toastArea')
  };

  // Toast Notification System
  function showToast(content, type = 'info') {
    if (!el.toastArea) return;
    const toast = document.createElement('div');
    toast.className = `sap-cyber-toast toast-${type}`;
    toast.innerHTML = `<span>${content}</span>`;
    el.toastArea.appendChild(toast);
    setTimeout(() => {
      toast.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }

  // Format Bytes Utility
  function formatBytes(bytes) {
    if (!bytes || bytes <= 0) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB'];
    const idx = Math.floor(Math.log(bytes) / Math.log(1024));
    return (bytes / Math.pow(1024, idx)).toFixed(1) + ' ' + units[idx];
  }

  // Update Main Action Button Appearance
  function updateLaunchButton(action) {
    state.buttonAction = action || 'play';
    el.primaryLaunchBtn.classList.remove('btn-pause', 'btn-busy');

    switch (state.buttonAction) {
      case 'downloading':
        el.launchBtnIcon.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>`;
        el.launchBtnLabel.textContent = 'ПАУЗА';
        el.primaryLaunchBtn.classList.add('btn-pause');
        el.hudGlobalStatus.textContent = 'ЗАГРУЗКА РЕСУРСОВ';
        el.bottomStatus.textContent = 'Идет скачивание файлов клиента...';
        break;
      case 'preparing':
        el.launchBtnIcon.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`;
        el.launchBtnLabel.textContent = 'ПОДГОТОВКА...';
        el.primaryLaunchBtn.classList.add('btn-busy');
        el.hudGlobalStatus.textContent = 'СИНХРОНИЗАЦИЯ';
        el.bottomStatus.textContent = 'Подготовка локальных файлов...';
        break;
      case 'checking':
        el.launchBtnIcon.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`;
        el.launchBtnLabel.textContent = 'ПРОВЕРКА...';
        el.primaryLaunchBtn.classList.add('btn-busy');
        el.hudGlobalStatus.textContent = 'ХЭШИРОВАНИЕ ФАЙЛОВ';
        el.bottomStatus.textContent = 'Сверка контрольных сумм ресурсов...';
        break;
      case 'playing':
        el.launchBtnIcon.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="6 3 18 3 21 8 21 16 18 21 6 21 3 16 3 8 6 3"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="10" y1="10" x2="14" y2="10"/></svg>`;
        el.launchBtnLabel.textContent = 'В ИГРЕ';
        el.primaryLaunchBtn.classList.add('btn-busy');
        el.hudGlobalStatus.textContent = 'ПРОЦЕСС АКТИВЕН';
        el.bottomStatus.textContent = 'Сессия GTA San Andreas запущена';
        break;
      case 'play':
      default:
        el.launchBtnIcon.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>`;
        el.launchBtnLabel.textContent = 'ИГРАТЬ';
        el.hudGlobalStatus.textContent = 'СИСТЕМА ГОТОВА';
        el.bottomStatus.textContent = 'Готов к подключению к серверу';
        break;
    }
  }

  // Render Server Cards in Middle Deck
  function renderServers() {
    if (!el.serversList) return;
    el.serversList.innerHTML = '';

    if (el.serversCountBadge) {
      el.serversCountBadge.textContent = `${state.servers.length} СЕРВЕРОВ`;
    }

    let selected = state.servers.find(s => Number(s.id) === Number(state.selectedServerId));
    if (!selected && state.servers.length > 0) {
      selected = state.servers[0];
      state.selectedServerId = selected.id;
    }

    if (selected) {
      el.heroTitle.textContent = selected.name || `Сервер #${selected.id}`;
      el.heroOnline.textContent = selected.online !== undefined ? selected.online : '23';
      el.heroMax.textContent = selected.max || selected.max_players || 499;
      const host = selected.host || selected.ip || '185.71.66.22';
      const port = selected.port || '7777';
      el.heroIpPort.textContent = `${host}:${port}`;
    }

    state.servers.forEach((s, idx) => {
      const isSelected = Number(s.id) === Number(state.selectedServerId);
      const host = s.host || s.ip || '185.71.66.22';
      const port = s.port || '7777';
      const card = document.createElement('div');
      card.className = `server-cyber-card ${isSelected ? 'active' : ''}`;
      card.innerHTML = `
        <div class="server-name-block">
          <span class="server-title">${s.name || `Сервер #${s.id}`}</span>
          <span class="server-ip font-mono">${host}:${port}</span>
        </div>
        <div class="server-stats-block font-mono">
          <span class="server-players-badge">${s.online !== undefined ? s.online : 23} / ${s.max || s.max_players || 499}</span>
          <span class="server-status-dot">● ACTIVE</span>
        </div>
      `;
      card.addEventListener('click', () => {
        selectServer(s.id, idx);
      });
      el.serversList.appendChild(card);
    });
  }

  function selectServer(id, index = 0) {
    state.selectedServerId = id;
    renderServers();
    if (window.api && window.api.request) {
      window.api.request('settings', { type: 'selectServer', serverId: index });
    }
  }

  // Update Engine Switch Indicators
  function updateSwitches() {
    if (el.toggleWidescreen && el.indWidescreen) {
      el.toggleWidescreen.classList.toggle('active', !!state.wideScreenFix);
      el.indWidescreen.textContent = state.wideScreenFix ? 'ВКЛ' : 'ВЫКЛ';
    }
    if (el.toggleHighPerf && el.indHighPerf) {
      el.toggleHighPerf.classList.toggle('active', !!state.highPerformanceEnabled);
      el.indHighPerf.textContent = state.highPerformanceEnabled ? 'ВКЛ' : 'ВЫКЛ';
    }
    if (el.toggleWinter && el.indWinter) {
      el.toggleWinter.classList.toggle('active', !!state.winter);
      el.indWinter.textContent = state.winter ? 'ВКЛ' : 'ВЫКЛ';
    }
    if (el.toggleAdmin && el.indAdmin) {
      el.toggleAdmin.classList.toggle('active', !!state.isRunnableAsAdmin);
      el.indAdmin.textContent = state.isRunnableAsAdmin ? 'ВКЛ' : 'ВЫКЛ';
    }
  }

  // Bind UI Handlers
  function initHandlers() {
    // Window Buttons
    el.btnMinimize?.addEventListener('click', () => {
      if (window.api && window.api.request) {
        window.api.request('window', { type: 'hide' });
      }
    });

    el.btnClose?.addEventListener('click', () => {
      if (window.api && window.api.request) {
        window.api.request('window', { type: 'quit' });
      }
    });

    // Main Launch / Pause Button
    el.primaryLaunchBtn?.addEventListener('click', () => {
      if (!window.api || !window.api.request) return;

      if (state.buttonAction === 'downloading') {
        window.api.request('window', { type: 'primaryButtonClick', buttonType: 'pause' });
      } else if (state.buttonAction === 'play') {
        const selected = state.servers.find(s => Number(s.id) === Number(state.selectedServerId)) || state.servers[0];
        const srvIndex = state.servers.indexOf(selected);
        // Sync server selection with main process
        window.api.request('settings', { type: 'selectServer', serverId: srvIndex >= 0 ? srvIndex : 0 });
        window.api.request('window', {
          type: 'primaryButtonClick',
          buttonType: 'play',
          serverId: selected ? selected.id : 1
        });
      }
    });

    // Nickname save
    function saveNick() {
      const val = el.inputNickname ? el.inputNickname.value.trim() : '';
      if (!val || val.length < 4 || !val.includes('_')) {
        showToast('Никнейм должен содержать нижнее подчеркивание (Пример: Ivan_Ivanov)', 'error');
        return;
      }
      state.name = val;
      el.topNick.textContent = val;
      el.avatarLetter.textContent = val.charAt(0).toUpperCase();
      if (window.api && window.api.request) {
        window.api.request('settings', { type: 'saveName', name: val });
        showToast(`Никнейм успешно применен: ${val}`, 'success');
      }
    }

    el.btnSubmitNick?.addEventListener('click', saveNick);
    el.inputNickname?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') saveNick();
    });

    // Directory Buttons
    el.btnSelectFolder?.addEventListener('click', () => {
      if (window.api && window.api.request) {
        window.api.request('settings', { type: 'selectGameFolder' });
      }
    });

    el.btnOpenFolder?.addEventListener('click', () => {
      if (window.api && window.api.request) {
        window.api.request('window', { type: 'openGameFolder' });
      }
    });

    // Integrity Verify
    el.btnVerifyFiles?.addEventListener('click', () => {
      if (window.api && window.api.request) {
        window.api.request('window', { type: 'checkFilesClick' });
        showToast('Запущена проверка манифеста файлов игры...', 'info');
      }
    });

    // Screenshots
    el.btnScreenshots?.addEventListener('click', () => {
      if (window.api && window.api.request) {
        window.api.request('window', { type: 'openDocDir', dir: 'screensPath' });
      }
    });

    // HWID Key
    el.btnHwid?.addEventListener('click', () => {
      if (window.api && window.api.request) {
        window.api.request('window', { type: 'copyKey' });
        showToast('HWID ключ скопирован в буфер обмена', 'success');
      }
    });

    // Engine Toggles
    el.toggleWidescreen?.addEventListener('click', () => {
      const next = !state.wideScreenFix;
      state.wideScreenFix = next;
      updateSwitches();
      if (window.api && window.api.request) {
        window.api.request('settings', { type: 'wideScreenFix', value: next });
      }
    });

    el.toggleHighPerf?.addEventListener('click', () => {
      const next = !state.highPerformanceEnabled;
      state.highPerformanceEnabled = next;
      updateSwitches();
      if (window.api && window.api.request) {
        window.api.request('settings', { type: 'highPerformanceEnabled', value: next });
      }
    });

    el.toggleWinter?.addEventListener('click', () => {
      const next = !state.winter;
      state.winter = next;
      updateSwitches();
      if (window.api && window.api.request) {
        window.api.request('settings', { type: 'winter', value: next });
      }
    });

    el.toggleAdmin?.addEventListener('click', () => {
      const next = !state.isRunnableAsAdmin;
      state.isRunnableAsAdmin = next;
      updateSwitches();
      if (window.api && window.api.request) {
        window.api.request('settings', { type: 'isRunnableAsAdmin', value: next });
      }
    });

    // Locked Guard Banners
    el.bannerGraphicsLock?.addEventListener('click', () => {
      showToast('Стандартная графика зафиксирована SAPatcher. Выбор профилей DXVK производится через конфигуратор SAPatcher.', 'info');
    });

    el.bannerAutocloseLock?.addEventListener('click', () => {
      showToast('Автоматическое закрытие лаунчера заблокировано SAPatcher. Лаунчер остается активным в фоне.', 'info');
    });

    // External Cyber Links
    document.querySelectorAll('.cyber-link-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const url = btn.dataset.url;
        if (url && window.api && window.api.request) {
          window.api.request('window', { type: 'openExternalLink', link: url });
        }
      });
    });

    el.btnHelpDesk?.addEventListener('click', () => {
      if (window.api && window.api.request) {
        window.api.request('window', { type: 'openExternalLink', link: 'https://mn-p.cc/help' });
      }
    });
  }

  // Periodic Server Stats Polling
  function startTelemetryPolling() {
    async function updateOnline() {
      try {
        let resp = await fetch('https://backend.mn-p.com/api/v2/servers/online', { signal: AbortSignal.timeout(3000) });
        if (!resp.ok) {
          resp = await fetch('https://backend2.mn-p.com/api/v2/servers/online', { signal: AbortSignal.timeout(3000) });
        }
        if (resp.ok) {
          const arr = await resp.json();
          if (Array.isArray(arr)) {
            let changed = false;
            arr.forEach(entry => {
              const matched = state.servers.find(s => Number(s.id) === Number(entry.id));
              if (matched && matched.online !== entry.online) {
                matched.online = entry.online;
                changed = true;
              }
            });
            if (changed) renderServers();
          }
        }
      } catch (e) {
        // Telemetry fallback
      }
    }
    updateOnline();
    setInterval(updateOnline, 12000);
  }

  // IPC Connection
  function initIPC() {
    if (!window.api || !window.api.subscribe) {
      console.warn('Motion Launcher API not found (standalone preview mode)');
      return;
    }

    // Version
    if (window.api.getVersion) {
      window.api.getVersion().then(v => {
        if (v && el.engineVersion) {
          el.engineVersion.textContent = `v${v}`;
        }
      }).catch(() => {});
    }

    // Settings
    window.api.subscribe('settings', (e, data) => {
      if (!data) return;

      if (data.name !== undefined) {
        state.name = data.name;
        if (el.topNick) el.topNick.textContent = data.name || 'Player';
        if (el.avatarLetter) el.avatarLetter.textContent = (data.name || 'M').charAt(0).toUpperCase();
        if (el.inputNickname) el.inputNickname.value = data.name || '';
      }

      if (data.path !== undefined) {
        state.path = data.path;
        if (el.gameFolderPath) el.gameFolderPath.textContent = data.path || 'Не выбрана';
      }

      if (data.servers && Array.isArray(data.servers)) {
        state.servers = data.servers;
        state.servers.forEach(s => {
          if (!s.host && !s.ip) s.host = '185.71.66.22';
          if (!s.port) s.port = '7777';
        });

        if (data.selectedServer !== undefined) {
          const srv = state.servers[data.selectedServer] || state.servers.find(s => Number(s.id) === Number(data.selectedServer));
          if (srv) state.selectedServerId = srv.id;
        } else if (state.servers.length > 0) {
          state.selectedServerId = state.servers[0].id;
        }
        renderServers();
      }

      if (data.wideScreenFix !== undefined) state.wideScreenFix = data.wideScreenFix;
      if (data.highPerformanceEnabled !== undefined) state.highPerformanceEnabled = data.highPerformanceEnabled;
      if (data.winter !== undefined) state.winter = data.winter;
      if (data.isRunnableAsAdmin !== undefined) state.isRunnableAsAdmin = data.isRunnableAsAdmin;
      updateSwitches();

      if (data.buttonAction !== undefined) {
        updateLaunchButton(data.buttonAction);
      }
    });

    // Download Progress
    window.api.subscribe('download', (e, data) => {
      if (!data) return;
      state.downloadData = data;

      const pct = Math.min(100, Math.max(0, data.percentage || 0));
      if (el.downProgressBar) el.downProgressBar.style.width = `${pct}%`;
      if (el.downProgressGlow) el.downProgressGlow.style.width = `${pct}%`;
      if (el.downPercentage) el.downPercentage.textContent = `${Math.round(pct)}%`;

      if (el.downSpeed) {
        el.downSpeed.textContent = data.speed || '0 KB/s';
      }

      if (el.downStatus) {
        if (data.isDownloading) {
          el.downStatus.textContent = `Загрузка: ${formatBytes(data.downloaded)} / ${formatBytes(data.totalSize)}`;
        } else {
          el.downStatus.textContent = data.title || 'Проверка файлов...';
        }
      }
    });

    // Toasts
    window.api.subscribe('ui', (e, data) => {
      if (data && data.type === 'toast' && data.toast) {
        showToast(data.toast.content, data.toast.options ? data.toast.options.type : 'info');
      }
    });
  }

  // Initialize
  document.addEventListener('DOMContentLoaded', () => {
    initHandlers();
    initIPC();
    startTelemetryPolling();
  });
})();

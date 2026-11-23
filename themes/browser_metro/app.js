// Motion Launcher Metro 8.1 Edition — IPC Client (Fixed & Verified)
(function() {
  'use strict';

  // State
  let state = {
    servers: [],
    selectedServerId: 1,
    name: 'Player',
    path: '',
    buttonAction: 'play',
    wideScreenFix: true,
    highPerformanceEnabled: false,
    winter: false,
    isRunnableAsAdmin: false,
    downloadData: null
  };

  // DOM Elements
  const el = {
    topUserName: document.getElementById('topUserName'),
    topUserStatus: document.getElementById('topUserStatus'),
    avatarInitial: document.getElementById('avatarInitial'),
    btnMinimize: document.getElementById('btnMinimize'),
    btnClose: document.getElementById('btnClose'),
    heroServerName: document.getElementById('heroServerName'),
    heroOnlineCount: document.getElementById('heroOnlineCount'),
    heroServerIp: document.getElementById('heroServerIp'),
    primaryActionBtn: document.getElementById('primaryActionBtn'),
    actionBtnIcon: document.getElementById('actionBtnIcon'),
    actionBtnText: document.getElementById('actionBtnText'),
    progressTile: document.getElementById('progressTile'),
    progressTitle: document.getElementById('progressTitle'),
    progressSpeed: document.getElementById('progressSpeed'),
    progressBar: document.getElementById('progressBar'),
    progressState: document.getElementById('progressState'),
    progressPercent: document.getElementById('progressPercent'),
    btnCheckFiles: document.getElementById('btnCheckFiles'),
    serverTilesContainer: document.getElementById('serverTilesContainer'),
    nickInput: document.getElementById('nickInput'),
    btnSaveNick: document.getElementById('btnSaveNick'),
    nickStatusHint: document.getElementById('nickStatusHint'),
    gamePathText: document.getElementById('gamePathText'),
    btnSelectGameDir: document.getElementById('btnSelectGameDir'),
    btnOpenGameDir: document.getElementById('btnOpenGameDir'),
    btnOpenScreens: document.getElementById('screensTile'),
    btnCopyHWID: document.getElementById('hwidTile'),
    widescreenTile: document.getElementById('widescreenTile'),
    widescreenStatus: document.getElementById('widescreenStatus'),
    highPerfTile: document.getElementById('highPerfTile'),
    highPerfStatus: document.getElementById('highPerfStatus'),
    winterTile: document.getElementById('winterTile'),
    winterStatus: document.getElementById('winterStatus'),
    adminTile: document.getElementById('adminTile'),
    adminStatus: document.getElementById('adminStatus'),
    graphicsLockTile: document.getElementById('graphicsLockTile'),
    autocloseLockTile: document.getElementById('autocloseLockTile'),
    launcherVersion: document.getElementById('launcherVersion'),
    statusMessage: document.getElementById('statusMessage'),
    btnHelp: document.getElementById('btnHelp'),
    toastContainer: document.getElementById('toastContainer'),
    metroPanorama: document.getElementById('metroPanorama')
  };

  // Toast System
  function showToast(message, type = 'info') {
    if (!el.toastContainer) return;
    const toast = document.createElement('div');
    toast.className = `metro-toast toast-${type}`;
    toast.innerHTML = `<span>${message}</span>`;
    el.toastContainer.appendChild(toast);
    setTimeout(() => {
      toast.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }

  // Formatting helpers
  function formatBytes(bytes) {
    if (!bytes || bytes <= 0) return '0 B';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return (bytes / Math.pow(1024, i)).toFixed(1) + ' ' + sizes[i];
  }

  // Update Action Button State
  function updateActionButton(action) {
    state.buttonAction = action || 'play';
    el.primaryActionBtn.classList.remove('btn-pause', 'btn-disabled');

    switch (state.buttonAction) {
      case 'downloading':
        el.actionBtnIcon.textContent = '⏸';
        el.actionBtnText.textContent = 'ПАУЗА';
        el.primaryActionBtn.classList.add('btn-pause');
        el.topUserStatus.textContent = 'Загрузка ресурсов...';
        el.statusMessage.textContent = 'Загрузка игровых файлов...';
        break;
      case 'preparing':
        el.actionBtnIcon.textContent = '⏳';
        el.actionBtnText.textContent = 'ПОДГОТОВКА...';
        el.primaryActionBtn.classList.add('btn-disabled');
        el.topUserStatus.textContent = 'Подготовка файлов...';
        el.statusMessage.textContent = 'Проверка контрольных сумм...';
        break;
      case 'checking':
        el.actionBtnIcon.textContent = '🔍';
        el.actionBtnText.textContent = 'ПРОВЕРКА...';
        el.primaryActionBtn.classList.add('btn-disabled');
        el.topUserStatus.textContent = 'Проверка файлов...';
        el.statusMessage.textContent = 'Сравнение манифеста ресурсов...';
        break;
      case 'playing':
        el.actionBtnIcon.textContent = '🎮';
        el.actionBtnText.textContent = 'В ИГРЕ';
        el.primaryActionBtn.classList.add('btn-disabled');
        el.topUserStatus.textContent = 'Игра запущена';
        el.statusMessage.textContent = 'Сессия GTA San Andreas активна';
        break;
      case 'play':
      default:
        el.actionBtnIcon.textContent = '▶';
        el.actionBtnText.textContent = 'ИГРАТЬ';
        el.topUserStatus.textContent = 'Готов к игре';
        el.statusMessage.textContent = 'Готов к запуску игры';
        break;
    }
  }

  // Render Server List
  function renderServers() {
    let selected = state.servers.find(s => Number(s.id) === Number(state.selectedServerId));
    if (!selected && state.servers.length > 0) {
      selected = state.servers[0];
      state.selectedServerId = selected.id;
    }

    if (selected) {
      el.heroServerName.textContent = selected.name || `Сервер #${selected.id}`;
      el.heroOnlineCount.textContent = selected.online !== undefined ? selected.online : 23;
      const host = selected.host || selected.ip || '185.71.66.22';
      const port = selected.port || '7777';
      el.heroServerIp.textContent = `${host}:${port}`;
    }

    if (el.serverTilesContainer) {
      el.serverTilesContainer.innerHTML = '';
      state.servers.forEach((s, idx) => {
        const isSelected = Number(s.id) === Number(state.selectedServerId);
        const host = s.host || s.ip || '185.71.66.22';
        const port = s.port || '7777';
        const card = document.createElement('div');
        card.className = `server-metro-card ${isSelected ? 'selected' : ''}`;
        card.innerHTML = `
          <div>
            <div class="smc-name">${s.name || `Сервер #${s.id}`}</div>
            <div class="smc-ip font-mono">${host}:${port}</div>
          </div>
          <div class="smc-stats font-mono">${s.online !== undefined ? s.online : 23} / ${s.max || s.max_players || 499}</div>
        `;
        card.addEventListener('click', () => {
          selectServer(s.id, idx);
        });
        el.serverTilesContainer.appendChild(card);
      });
    }
  }

  function selectServer(serverId, index = 0) {
    state.selectedServerId = serverId;
    renderServers();
    if (window.api && window.api.request) {
      // Send index to preserve compatibility with main.js cache index
      window.api.request('settings', { type: 'selectServer', serverId: index });
    }
  }

  // Update Settings Toggles
  function updateToggles() {
    if (el.widescreenTile && el.widescreenStatus) {
      el.widescreenTile.classList.toggle('active', !!state.wideScreenFix);
      el.widescreenStatus.textContent = state.wideScreenFix ? 'ВКЛ' : 'ВЫКЛ';
    }
    if (el.highPerfTile && el.highPerfStatus) {
      el.highPerfTile.classList.toggle('active', !!state.highPerformanceEnabled);
      el.highPerfStatus.textContent = state.highPerformanceEnabled ? 'ВКЛ' : 'ВЫКЛ';
    }
    if (el.winterTile && el.winterStatus) {
      el.winterTile.classList.toggle('active', !!state.winter);
      el.winterStatus.textContent = state.winter ? 'ВКЛ' : 'ВЫКЛ';
    }
    if (el.adminTile && el.adminStatus) {
      el.adminTile.classList.toggle('active', !!state.isRunnableAsAdmin);
      el.adminStatus.textContent = state.isRunnableAsAdmin ? 'ВКЛ' : 'ВЫКЛ';
    }
  }

  // Bind Event Listeners
  function initListeners() {
    // Mouse Wheel Horizontal Panorama Scroll
    if (el.metroPanorama) {
      el.metroPanorama.addEventListener('wheel', (e) => {
        if (e.deltaY !== 0) {
          e.preventDefault();
          el.metroPanorama.scrollLeft += e.deltaY * 1.5;
        }
      }, { passive: false });
    }

    // Window controls
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

    // Primary Action Button (Play / Pause)
    el.primaryActionBtn?.addEventListener('click', () => {
      if (!window.api || !window.api.request) return;

      if (state.buttonAction === 'downloading') {
        window.api.request('window', { type: 'primaryButtonClick', buttonType: 'pause' });
      } else if (state.buttonAction === 'play') {
        const selected = state.servers.find(s => Number(s.id) === Number(state.selectedServerId)) || state.servers[0];
        const srvIndex = state.servers.indexOf(selected);
        // Ensure valid index is sent
        window.api.request('settings', { type: 'selectServer', serverId: srvIndex >= 0 ? srvIndex : 0 });
        window.api.request('window', {
          type: 'primaryButtonClick',
          buttonType: 'play',
          serverId: selected ? selected.id : 1
        });
      }
    });

    // Save Nickname
    function saveNick() {
      const val = el.nickInput ? el.nickInput.value.trim() : '';
      if (!val || val.length < 4 || !val.includes('_')) {
        showToast('Никнейм должен содержать нижнее подчеркивание (Пример: Ivan_Ivanov)', 'error');
        if (el.nickStatusHint) el.nickStatusHint.textContent = 'Ошибка! Требуется формат: Ivan_Ivanov';
        return;
      }
      state.name = val;
      el.topUserName.textContent = val;
      el.avatarInitial.textContent = val.charAt(0).toUpperCase();
      if (el.nickStatusHint) el.nickStatusHint.textContent = 'Никнейм сохранен!';
      if (window.api && window.api.request) {
        window.api.request('settings', { type: 'saveName', name: val });
        showToast(`Никнейм сохранен: ${val}`, 'success');
      }
    }

    el.btnSaveNick?.addEventListener('click', saveNick);
    el.nickInput?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') saveNick();
    });

    // Game Directory
    el.btnSelectGameDir?.addEventListener('click', (e) => {
      e.stopPropagation();
      if (window.api && window.api.request) {
        window.api.request('settings', { type: 'selectGameFolder' });
      }
    });

    el.btnOpenGameDir?.addEventListener('click', (e) => {
      e.stopPropagation();
      if (window.api && window.api.request) {
        window.api.request('window', { type: 'openGameFolder' });
      }
    });

    // Check files
    el.btnCheckFiles?.addEventListener('click', (e) => {
      e.stopPropagation();
      if (window.api && window.api.request) {
        window.api.request('window', { type: 'checkFilesClick' });
        showToast('Запущена проверка целостности файлов...', 'info');
      }
    });

    // Screenshots
    el.btnOpenScreens?.addEventListener('click', () => {
      if (window.api && window.api.request) {
        window.api.request('window', { type: 'openDocDir', dir: 'screensPath' });
      }
    });

    // Copy HWID
    el.btnCopyHWID?.addEventListener('click', () => {
      if (window.api && window.api.request) {
        window.api.request('window', { type: 'copyKey' });
        showToast('HWID ключ скопирован в буфер обмена', 'success');
      }
    });

    // Toggles
    el.widescreenTile?.addEventListener('click', () => {
      const next = !state.wideScreenFix;
      state.wideScreenFix = next;
      updateToggles();
      if (window.api && window.api.request) {
        window.api.request('settings', { type: 'wideScreenFix', value: next });
      }
    });

    el.highPerfTile?.addEventListener('click', () => {
      const next = !state.highPerformanceEnabled;
      state.highPerformanceEnabled = next;
      updateToggles();
      if (window.api && window.api.request) {
        window.api.request('settings', { type: 'highPerformanceEnabled', value: next });
      }
    });

    el.winterTile?.addEventListener('click', () => {
      const next = !state.winter;
      state.winter = next;
      updateToggles();
      if (window.api && window.api.request) {
        window.api.request('settings', { type: 'winter', value: next });
      }
    });

    el.adminTile?.addEventListener('click', () => {
      const next = !state.isRunnableAsAdmin;
      state.isRunnableAsAdmin = next;
      updateToggles();
      if (window.api && window.api.request) {
        window.api.request('settings', { type: 'isRunnableAsAdmin', value: next });
      }
    });

    el.graphicsLockTile?.addEventListener('click', () => {
      showToast('Стандартная графика зафиксирована SAPatcher. Выбор версий DXVK доступен в SAPatcher.', 'info');
    });

    el.autocloseLockTile?.addEventListener('click', () => {
      showToast('Сворачивание и закрытие лаунчера после старта игры отключено SAPatcher.', 'info');
    });

    // External Link Tiles
    document.querySelectorAll('.link-tile').forEach(tile => {
      tile.addEventListener('click', () => {
        const url = tile.dataset.url;
        if (url && window.api && window.api.request) {
          window.api.request('window', { type: 'openExternalLink', link: url });
        }
      });
    });

    el.btnHelp?.addEventListener('click', () => {
      if (window.api && window.api.request) {
        window.api.request('window', { type: 'openExternalLink', link: 'https://mn-p.cc/help' });
      }
    });
  }

  // Periodic Online Polling
  function startOnlinePolling() {
    async function fetchOnline() {
      try {
        let resp = await fetch('https://backend.mn-p.com/api/v2/servers/online', { signal: AbortSignal.timeout(3000) });
        if (!resp.ok) {
          resp = await fetch('https://backend2.mn-p.com/api/v2/servers/online', { signal: AbortSignal.timeout(3000) });
        }
        if (resp.ok) {
          const list = await resp.json();
          if (Array.isArray(list)) {
            let updated = false;
            list.forEach(item => {
              const s = state.servers.find(srv => Number(srv.id) === Number(item.id));
              if (s && s.online !== item.online) {
                s.online = item.online;
                updated = true;
              }
            });
            if (updated) renderServers();
          }
        }
      } catch (err) {}
    }
    fetchOnline();
    setInterval(fetchOnline, 12000);
  }

  // IPC Subscriptions
  function initIPC() {
    if (!window.api || !window.api.subscribe) return;

    if (window.api.getVersion) {
      window.api.getVersion().then(ver => {
        if (ver && el.launcherVersion) {
          el.launcherVersion.textContent = `v${ver}`;
        }
      }).catch(() => {});
    }

    // Settings Channel
    window.api.subscribe('settings', (event, data) => {
      if (!data) return;

      if (data.name !== undefined) {
        state.name = data.name;
        if (el.topUserName) el.topUserName.textContent = data.name || 'Игрок';
        if (el.avatarInitial) el.avatarInitial.textContent = (data.name || 'M').charAt(0).toUpperCase();
        if (el.nickInput) el.nickInput.value = data.name || '';
      }

      if (data.path !== undefined) {
        state.path = data.path;
        if (el.gamePathText) el.gamePathText.textContent = data.path || 'Не выбрана';
      }

      if (data.servers && Array.isArray(data.servers)) {
        state.servers = data.servers;
        // Ensure server has real host/port
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
      updateToggles();

      if (data.buttonAction !== undefined) {
        updateActionButton(data.buttonAction);
      }
    });

    // Download Progress Channel
    window.api.subscribe('download', (event, data) => {
      if (!data) return;
      state.downloadData = data;

      const pct = Math.min(100, Math.max(0, data.percentage || 0));
      if (el.progressBar) el.progressBar.style.width = `${pct}%`;
      if (el.progressPercent) el.progressPercent.textContent = `${Math.round(pct)}%`;
      if (el.progressSpeed) el.progressSpeed.textContent = data.speed || '0 KB/s';

      if (el.progressState) {
        if (data.isDownloading) {
          el.progressState.textContent = `Загрузка: ${formatBytes(data.downloaded)} / ${formatBytes(data.totalSize)}`;
        } else {
          el.progressState.textContent = data.title || 'Проверка файлов...';
        }
      }
    });

    // UI Toasts Channel
    window.api.subscribe('ui', (event, data) => {
      if (data && data.type === 'toast' && data.toast) {
        showToast(data.toast.content, data.toast.options ? data.toast.options.type : 'info');
      }
    });
  }

  // Initialize
  document.addEventListener('DOMContentLoaded', () => {
    initListeners();
    initIPC();
    startOnlinePolling();
  });
})();

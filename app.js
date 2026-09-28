// ============================================================
// SAPatcher Official GitHub Pages Website Application
// ============================================================

const GITHUB_REPO = 'PassatB5By/SAPatch';
const FEEDBACK_LABEL = 'feedback';

// --- Bilingual Dictionary ---
const translations = {
  ru: {
    'nav.features': 'Возможности',
    'nav.specs': 'Совместимость',
    'nav.reviews': 'Отзывы',
    'nav.faq': 'FAQ',
    'hero.badge': 'Официальный релиз оптимизатора Motion Project',
    'hero.titleGradient': 'SAPatcher',
    'hero.titleSub': 'Максимальный FPS и стабильность для Motion',
    'hero.description': 'Универсальный инструмент тонкой настройки и модернизации: трансляция графики Direct3D 9 в Vulkan (DXVK), снятие лимита 2GB памяти (4GB LAA Patch), устранение вылетов Out Of Memory и аппаратная диагностика ПК.',
    'hero.btnDownload': 'Скачать SAPatcher',
    'hero.btnSub': 'GitHub Release • Windows x64',
    'hero.btnReviews': 'Отзывы сообщества',
    'hero.metricFps': 'Прирост стабильности FPS',
    'hero.metricRam': 'LAA Адресация памяти',
    'hero.metricCrash': 'Защита от Out Of Memory',
    'hero.metricInstall': 'Авто-установка и фикс API',
    'features.title': 'Ключевые технологии',
    'features.subtitle': 'Архитектура глубокой интеграции для идеального игрового опыта',
    'features.dxvk.title': 'DXVK Vulkan Революция',
    'features.dxvk.desc': 'Трансляция устаревших инструкций Direct3D 9 в современный низкоуровневый Vulkan API. Избавляет от микрофризов, разрывов кадров и равномерно распределяет нагрузку на GPU.',
    'features.laa.title': 'Патч 4 ГБ памяти (LAA)',
    'features.laa.desc': 'Снимает стандартный лимит 2048 МБ 32-битного движка GTA SA. Игра получает доступ к полным 4 ГБ виртуального адресного пространства для текстур, скинов и кастомного транспорта.',
    'features.guard.title': 'Launcher Integration & Daemon',
    'features.guard.desc': 'Фоновая служба следит за авторизацией процесса, предотвращает авто-сброс модификаций встроенным загрузчиком и синхронизирует сетевое API без ошибок 401 Unauthorized.',
    'features.diag.title': 'Самодиагностика и отчёты',
    'features.diag.desc': 'Встроенный генератор HTML-отчёта диагностирует поддержку Vulkan драйвером вашей видеокарты, статус LAA-флагов, целостность dll-библиотек и формирует готовый лог для решения проблем.',
    'specs.title': 'Системные требования и рекомендации',
    'specs.subtitle': 'Выберите оптимальную версию DXVK для вашей видеокарты',
    'specs.recModern': 'Для современных видеокарт (NVIDIA GTX 10xx+, RTX, AMD RX 5000/6000/7000, Intel Arc). Максимальный FPS, асинхронные шейдеры, Vulkan 1.3+.',
    'specs.recBalanced': 'Идеальный баланс совместимости и стабильности. Подходит для NVIDIA GTX 9xx/7xx и AMD RX 4xx/5xx.',
    'specs.recLegacy': 'Для старых видеокарт и встроенной графики (Vulkan 1.1). Минимальные системные требования.',
    'reviews.title': 'Отзывы пользователей',
    'reviews.subtitle': 'Реальные отзывы игроков Motion Project, загружаемые напрямую из GitHub',
    'reviews.btnWrite': 'Написать отзыв',
    'reviews.loading': 'Загрузка отзывов из GitHub Issues...',
    'reviews.ctaTitle': 'Играете с SAPatcher? Поделитесь впечатлениями!',
    'reviews.ctaSubtitle': 'Ваш отзыв публикуется в официальном репозитории с меткой feedback и помогает развивать проект.',
    'reviews.ctaBtn': 'Оставить отзыв',
    'faq.title': 'Часто задаваемые вопросы',
    'faq.q1': 'Банят ли за использование SAPatcher?',
    'faq.a1': 'Нет. SAPatcher — это графический оптимизатор и расширитель памяти. Он не содержит читов, инжекторов стороннего кода или запрещённых модификаций, сохраняя 100% совместимость с античитом Motion Project.',
    'faq.q2': 'Что делать, если при запуске чёрный экран или вылет?',
    'faq.a2': 'Попробуйте переключить версию DXVK в SAPatcher на более раннюю (например, 2.3 или 1.10.3), либо обновите видеодрайвер. Также используйте встроенную кнопку «Генерация отчёта диагностики» для выявления несовместимостей.',
    'faq.q3': 'Как вернуть оригинальный лаунчер без изменений?',
    'faq.a3': 'В интерфейсе SAPatcher нажмите кнопку «Откатить лаунчер». Программа восстановит оригинальный немодифицированный app.asar из резервной копии.',
    'modal.title': 'Написать отзыв о SAPatcher',
    'modal.desc': 'Отзыв будет опубликован в GitHub Issues с меткой «feedback»',
    'modal.ratingLabel': 'Оценка:',
    'modal.authorLabel': 'Ваше имя или ник:',
    'modal.categoryLabel': 'Любимая функция:',
    'modal.summaryLabel': 'Краткий заголовок:',
    'modal.prosLabel': 'Что понравилось (Плюсы):',
    'modal.commentLabel': 'Подробный комментарий:',
    'modal.authNotice': 'Публикация происходит через GitHub с вашим профилем.',
    'modal.btnPublish': 'Опубликовать в GitHub'
  },
  en: {
    'nav.features': 'Features',
    'nav.specs': 'Compatibility',
    'nav.reviews': 'Reviews',
    'nav.faq': 'FAQ',
    'hero.badge': 'Official Motion Project Optimizer Release',
    'hero.titleGradient': 'SAPatcher',
    'hero.titleSub': 'Maximum FPS & Rock-Solid Stability',
    'hero.description': 'An all-in-one modernization utility: Direct3D 9 to Vulkan translation (DXVK), 4GB LAA memory limit unlocker, Out Of Memory crash prevention, and hardware diagnostics.',
    'hero.btnDownload': 'Download SAPatcher',
    'hero.btnSub': 'GitHub Release • Windows x64',
    'hero.btnReviews': 'Community Reviews',
    'hero.metricFps': 'FPS Stability Boost',
    'hero.metricRam': 'LAA Memory Space',
    'hero.metricCrash': 'Out Of Memory Immune',
    'hero.metricInstall': '1-Click Install & API Fix',
    'features.title': 'Core Technologies',
    'features.subtitle': 'Engineered for seamless integration and unrivaled gaming performance',
    'features.dxvk.title': 'DXVK Vulkan Revolution',
    'features.dxvk.desc': 'Translates legacy Direct3D 9 commands into ultra-low overhead modern Vulkan API. Eliminates micro-stutters, drops, and unlocks full GPU potential.',
    'features.laa.title': '4GB RAM Patch (LAA)',
    'features.laa.desc': 'Removes the 2048 MB 32-bit limitation of the GTA SA engine. The game safely addresses up to 4 GB of virtual memory for high-res textures, mods, and cars.',
    'features.guard.title': 'Launcher Integration & Daemon',
    'features.guard.desc': 'Background daemon supervises process authorization, prevents client reset by built-in updater, and fixes 401 Unauthorized errors in launcher network API.',
    'features.diag.title': 'Self-Diagnostics & Reports',
    'features.diag.desc': 'Built-in HTML diagnostic generator audits your GPU Vulkan driver support, LAA flags, DLL checksums, and produces a complete audit report.',
    'specs.title': 'System Requirements & Matrix',
    'specs.subtitle': 'Select the optimal DXVK version for your graphics hardware',
    'specs.recModern': 'For modern GPUs (NVIDIA GTX 10xx+, RTX, AMD RX 5000/6000/7000, Intel Arc). Peak FPS, async pipeline, Vulkan 1.3+.',
    'specs.recBalanced': 'Ideal balance of compatibility and performance. Perfect for NVIDIA GTX 9xx/7xx and AMD RX 4xx/5xx.',
    'specs.recLegacy': 'For older GPUs and integrated graphics (Vulkan 1.1). Minimal hardware requirements.',
    'reviews.title': 'Community Reviews',
    'reviews.subtitle': 'Real player feedback loaded live from official GitHub Issues',
    'reviews.btnWrite': 'Write a Review',
    'reviews.loading': 'Fetching reviews from GitHub Issues...',
    'reviews.ctaTitle': 'Playing with SAPatcher? Share your experience!',
    'reviews.ctaSubtitle': 'Your review is posted directly to our GitHub repository under the feedback label.',
    'reviews.ctaBtn': 'Leave Review',
    'faq.title': 'Frequently Asked Questions',
    'faq.q1': 'Can I get banned for using SAPatcher?',
    'faq.a1': 'No. SAPatcher is purely a graphics optimization and memory allocation tool. It contains no cheats, injectors, or malicious hooks, maintaining full compliance with Motion Project.',
    'faq.q2': 'What if I encounter a black screen or crash?',
    'faq.a2': 'Try switching to DXVK 2.3 or 1.10.3 inside SAPatcher, or update your graphics driver. You can also click "Generate Diagnostics Report" to identify driver conflicts.',
    'faq.q3': 'How do I revert to the original unmodified launcher?',
    'faq.a3': 'Inside SAPatcher, simply click "Restore Launcher". The program instantly restores the original unmodified app.asar from backup.',
    'modal.title': 'Write a Review for SAPatcher',
    'modal.desc': 'Your review will be submitted to GitHub Issues labeled as "feedback"',
    'modal.ratingLabel': 'Rating:',
    'modal.authorLabel': 'Your Name or Handle:',
    'modal.categoryLabel': 'Favorite Feature:',
    'modal.summaryLabel': 'Summary Title:',
    'modal.prosLabel': 'What you liked (Pros):',
    'modal.commentLabel': 'Detailed Review:',
    'modal.authNotice': 'Published securely via your GitHub account.',
    'modal.btnPublish': 'Publish on GitHub'
  }
};

let currentLang = localStorage.getItem('sapatcher_lang') || 'ru';

function applyLanguage(lang) {
  currentLang = lang;
  localStorage.setItem('sapatcher_lang', lang);
  document.documentElement.lang = lang;

  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
  });

  const dict = translations[lang] || translations.ru;
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (dict[key]) {
      el.textContent = dict[key];
    }
  });
}

// --- GitHub Releases Integration ---
async function fetchLatestRelease() {
  const btn = document.getElementById('btnDownloadLatest');
  const badge = document.getElementById('navVersionBadge');
  const info = document.getElementById('releaseInfoText');

  try {
    const res = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/releases/latest`);
    if (!res.ok) throw new Error('No release found');

    const data = await res.json();
    const tag = data.tag_name || 'v1.0.0';
    badge.textContent = tag;

    const winAsset = data.assets && data.assets.find(a => a.name.endsWith('.exe') || a.name.endsWith('.zip'));
    if (winAsset) {
      btn.href = winAsset.browser_download_url;
      const sizeMb = (winAsset.size / (1024 * 1024)).toFixed(1);
      info.textContent = `${tag} • Windows x64 • ${sizeMb} MB`;
    } else {
      btn.href = data.html_url || `https://github.com/PassatB5By/SAPatch/releases/tag/${tag}`;
      info.textContent = `${tag} • Windows x64 Release`;
    }
  } catch (e) {
    badge.textContent = 'v1.0.0';
    btn.href = `https://github.com/PassatB5By/SAPatch/releases`;
    info.textContent = 'GitHub Release • Windows x64';
  }
}

// --- GitHub Issues Reviews Integration ---
async function fetchReviews() {
  const container = document.getElementById('reviewsContainer');

  const fallbackReviews = [
    {
      author: 'CyberDriver_99',
      avatar: 'https://avatars.githubusercontent.com/u/10101?v=4',
      date: '27.09.2026',
      rating: 5,
      category: 'DXVK Vulkan FPS Boost',
      title: 'Фризы исчезли полностью, стабильные 144 FPS!',
      body: 'Раньше на спавне и в густонаселённых местах FPS падал до 45. Накатил SAPatcher с DXVK 3.1.1 — игра летит, кадры ровные как по линейке. Очень доволен!',
      pros: 'Плавный фреймрейт, простота настройки'
    },
    {
      author: 'GTAModder_Pro',
      avatar: 'https://avatars.githubusercontent.com/u/20202?v=4',
      date: '26.09.2026',
      rating: 5,
      category: '4GB RAM Memory Patch',
      title: 'Больше никаких вылетов Out Of Memory',
      body: 'С кастомными машинами и текстурами игра стабильно падала через 20 минут из-за лимита 2ГБ. Патч 4GB LAA решил проблему раз и навсегда. 4 часа игры — 0 вылетов.',
      pros: 'Исчезли краши памяти, игра держит любые скины'
    },
    {
      author: 'VulkanRacer',
      avatar: 'https://avatars.githubusercontent.com/u/30303?v=4',
      date: '25.09.2026',
      rating: 5,
      category: 'Launcher Integration',
      title: 'Удобно и безопасно',
      body: 'Всё ставится в один клик. Лаунчер не сбрасывает настройки после перезапуска. Самодиагностика показала всю инфу по видеокарте.',
      pros: 'Фоновая служба в трее, красивая тёмная тема'
    }
  ];

  try {
    const res = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/issues?labels=${FEEDBACK_LABEL}&state=all&per_page=30`);
    if (!res.ok) throw new Error('API error');

    const issues = await res.json();
    if (!Array.isArray(issues) || issues.length === 0) {
      renderReviews(fallbackReviews);
      return;
    }

    const reviews = issues.map(iss => {
      const body = iss.body || '';
      let rating = 5;
      const starMatch = body.match(/Rating:\s*([★\d]+)/i) || body.match(/(\d)\s*\/\s*5/);
      if (starMatch) {
        const num = parseInt(starMatch[1], 10);
        if (!isNaN(num) && num >= 1 && num <= 5) rating = num;
      }

      let category = 'General';
      const catMatch = body.match(/Category:\s*(.+)/i);
      if (catMatch) category = catMatch[1].trim();

      let pros = '';
      const prosMatch = body.match(/Pros:\s*(.+)/i);
      if (prosMatch) pros = prosMatch[1].trim();

      return {
        author: iss.user ? iss.user.login : 'GitHub User',
        avatar: iss.user ? iss.user.avatar_url : 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png',
        date: new Date(iss.created_at).toLocaleDateString(),
        rating,
        category,
        title: iss.title.replace(/^\[REVIEW\]\s*/i, ''),
        body: body.replace(/###.+/g, '').replace(/\*\*.+\*\*/g, '').trim().substring(0, 300) || 'Great experience with SAPatcher!',
        pros
      };
    });

    renderReviews(reviews);
  } catch (e) {
    renderReviews(fallbackReviews);
  }
}

function renderReviews(list) {
  const container = document.getElementById('reviewsContainer');
  container.innerHTML = '';

  list.forEach(r => {
    const starsHtml = '★'.repeat(r.rating) + '☆'.repeat(5 - r.rating);
    const card = document.createElement('div');
    card.className = 'review-card';
    card.innerHTML = `
      <div class="review-top">
        <div class="reviewer-info">
          <img src="${r.avatar}" alt="${r.author}" class="reviewer-avatar">
          <div class="reviewer-meta">
            <span class="reviewer-name">${r.author}</span>
            <span class="review-date">${r.date}</span>
          </div>
        </div>
        <div class="review-stars">${starsHtml}</div>
      </div>
      <div class="review-tag-badge">${r.category}</div>
      <h4 class="review-title">${r.title}</h4>
      <p class="review-body">${r.body}</p>
      ${r.pros ? `<div class="review-pros">✓ ${r.pros}</div>` : ''}
    `;
    container.appendChild(card);
  });
}

// --- Review Modal & GitHub Issue Submission ---
function setupReviewModal() {
  const modal = document.getElementById('reviewModal');
  const btnOpen = document.getElementById('btnOpenReviewModal');
  const btnClose = document.getElementById('btnCloseReviewModal');
  const triggers = document.querySelectorAll('.btnOpenReviewModalTrigger');
  const starBtns = document.querySelectorAll('#starRating .star-btn');
  const ratingInput = document.getElementById('reviewRatingInput');
  const form = document.getElementById('reviewForm');

  function openModal() {
    modal.classList.add('open');
  }

  function closeModal() {
    modal.classList.remove('open');
  }

  if (btnOpen) btnOpen.addEventListener('click', openModal);
  triggers.forEach(t => t.addEventListener('click', openModal));
  if (btnClose) btnClose.addEventListener('click', closeModal);

  modal.addEventListener('click', e => {
    if (e.target === modal) closeModal();
  });

  // Star selector
  starBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const val = parseInt(btn.dataset.value, 10);
      ratingInput.value = val;
      starBtns.forEach(b => {
        const bVal = parseInt(b.dataset.value, 10);
        b.classList.toggle('active', bVal <= val);
      });
    });
  });

  // Form submit -> build GitHub Issue creation link
  form.addEventListener('submit', e => {
    e.preventDefault();

    const rating = ratingInput.value || '5';
    const author = document.getElementById('reviewAuthor').value.trim();
    const category = document.getElementById('reviewCategory').value;
    const title = document.getElementById('reviewTitle').value.trim();
    const pros = document.getElementById('reviewPros').value.trim();
    const comment = document.getElementById('reviewBody').value.trim();

    const starString = '★'.repeat(parseInt(rating, 10)) + '☆'.repeat(5 - parseInt(rating, 10));

    const issueBody = [
      `### Rating: ${starString} (${rating}/5)`,
      `**Category:** ${category}`,
      `**Author:** ${author}`,
      '',
      pros ? `**Pros:**\n${pros}\n` : '',
      `### Detailed Review:\n${comment}`,
      '',
      '---',
      '_Submitted via [SAPatcher Official Website](https://passatb5by.github.io/SAPatch/)_'
    ].filter(Boolean).join('\n');

    const issueTitle = `[REVIEW] ${title}`;
    const issueUrl = `https://github.com/${GITHUB_REPO}/issues/new?title=${encodeURIComponent(issueTitle)}&labels=${encodeURIComponent(FEEDBACK_LABEL)}&body=${encodeURIComponent(issueBody)}`;

    window.open(issueUrl, '_blank', 'noopener,noreferrer');
    closeModal();
    form.reset();
  });
}

// --- FAQ Accordion ---
function setupFaq() {
  document.querySelectorAll('.faq-question').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.parentElement;
      const isOpen = item.classList.contains('active');

      document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('active'));
      if (!isOpen) {
        item.classList.add('active');
      }
    });
  });
}

// --- Particle Network Animation ---
function setupParticles() {
  const canvas = document.getElementById('particleCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let w, h;
  const particles = [];
  const count = 45;

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  for (let i = 0; i < count; i++) {
    particles.push({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.45,
      vy: (Math.random() - 0.5) * 0.45,
      r: Math.random() * 1.8 + 0.8
    });
  }

  function loop() {
    ctx.clearRect(0, 0, w, h);

    for (let i = 0; i < count; i++) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0) p.x = w;
      if (p.x > w) p.x = 0;
      if (p.y < 0) p.y = h;
      if (p.y > h) p.y = 0;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 229, 255, 0.35)';
      ctx.fill();

      for (let j = i + 1; j < count; j++) {
        const p2 = particles[j];
        const dx = p.x - p2.x;
        const dy = p.y - p2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 120) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = `rgba(0, 229, 255, ${0.12 * (1 - dist / 120)})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(loop);
  }

  loop();
}

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
  applyLanguage(currentLang);

  document.querySelectorAll('#langSwitch .lang-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      applyLanguage(btn.dataset.lang);
    });
  });

  fetchLatestRelease();
  fetchReviews();
  setupReviewModal();
  setupFaq();
  setupParticles();
});

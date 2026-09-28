// ============================================================
// SAPatcher Official Website by PixelSmith Studio (pixelsmith.ru)
// ============================================================

const GITHUB_REPO = 'PassatB5By/SAPatch';
const FEEDBACK_LABEL = 'review';
const GUEST_REVIEW_API = 'https://pixelsmith.ru/api/review.php';

// --- Bilingual Dictionary ---
const translations = {
  ru: {
    'nav.features': 'Возможности',
    'nav.specs': 'Совместимость',
    'nav.reviews': 'Отзывы',
    'nav.faq': 'FAQ',
    'hero.badge': 'Проект от PixelSmith Studio',
    'hero.titleGradient': 'SAPatcher',
    'hero.titleSub': 'Универсальный оптимизатор GTA SA, SA-MP, CRMP & Motion',
    'hero.description': 'Комплексная модернизация движка GTA San Andreas и многопользовательских клиентов: трансляция графики в Vulkan API (DXVK), расширение виртуальной памяти до 4 ГБ (LAA), защита от вылетов Out of Memory и бесшовная адаптация лаунчера Motion Project.',
    'hero.btnDownload': 'Скачать SAPatcher',
    'hero.btnReviews': 'Отзывы сообщества',
    'hero.metricFps': 'Стабильность и фреймрейт',
    'hero.metricRam': 'GTA SA, SA-MP, CRMP',
    'hero.metricCrash': 'Защита от Out Of Memory',
    'hero.metricInstall': 'Авто-патч и адаптация',
    'features.title': 'Ключевые возможности',
    'features.subtitle': 'Универсальные решения для всей экосистемы GTA San Andreas и современных лаунчеров',
    'features.dxvk.title': 'DXVK Vulkan Революция',
    'features.dxvk.desc': 'Трансляция устаревших инструкций Direct3D 9 в современный низкоуровневый Vulkan API. Избавляет от микрофризов, разрывов кадров и равномерно распределяет нагрузку на GPU в GTA SA, SA-MP и CRMP.',
    'features.laa.title': 'Патч 4 ГБ памяти (LAA)',
    'features.laa.desc': 'Снимает стандартный лимит 2048 МБ 32-битного движка GTA SA. Игра получает доступ к полным 4 ГБ виртуального адресного пространства для HD-текстур, кастомного транспорта и ресурсоёмких модификаций.',
    'features.guard.title': 'Первая адаптация: Motion Project',
    'features.guard.desc': 'Motion стал первым лаунчером с бесшовной поддержкой «из коробки»: автоматический обход сброса файлов при обновлениях, синхронизация сетевого API и фоновая служба в трее.',
    'features.diag.title': 'Самодиагностика и отчёты',
    'features.diag.desc': 'Встроенный генератор HTML-отчёта диагностирует поддержку Vulkan драйвером вашей видеокарты, статус LAA-флагов, целостность dll-библиотек и формирует готовый лог для решения проблем.',
    'specs.title': 'Системные требования и рекомендации',
    'specs.subtitle': 'Подберите оптимальную версию DXVK для вашей видеокарты',
    'specs.recModern': 'Для современных видеокарт (NVIDIA GTX 10xx+, RTX, AMD RX 5000/6000/7000, Intel Arc). Максимальный FPS, асинхронные шейдеры, Vulkan 1.3+.',
    'specs.recBalanced': 'Идеальный баланс совместимости и стабильности. Подходит для NVIDIA GTX 9xx/7xx и AMD RX 4xx/5xx.',
    'specs.recLegacy': 'Для старых видеокарт и встроенной графики (Vulkan 1.1). Минимальные системные требования.',
    'reviews.title': 'Реальные отзывы игроков',
    'reviews.subtitle': 'Публикуются напрямую в GitHub Issues с меткой «review»',
    'reviews.btnWrite': 'Написать отзыв',
    'reviews.loading': 'Загрузка отзывов из GitHub Issues...',
    'reviews.emptyTitle': 'Пока нет отзывов',
    'reviews.emptyText': 'Будьте первым, кто оставит свой отзыв о SAPatcher!',
    'reviews.ctaTitle': 'Играете с SAPatcher? Поделитесь впечатлениями!',
    'reviews.ctaSubtitle': 'Ваш отзыв публикуется в официальном репозитории с меткой review и помогает развивать проект.',
    'reviews.ctaBtn': 'Оставить отзыв',
    'faq.title': 'Часто задаваемые вопросы',
    'faq.q1': 'Работает ли SAPatcher с обычной GTA SA, SA-MP и CRMP?',
    'faq.a1': 'Да! SAPatcher разработан как универсальное решение для GTA San Andreas, клиентов SA-MP и CRMP. Он снимает лимит памяти 4GB LAA и внедряет Vulkan-транслятор DXVK в любую сборку. Motion Project — это первый лаунчер, для которого реализована полная бесшовная интеграция.',
    'faq.q2': 'Банят ли за использование SAPatcher?',
    'faq.a2': 'Нет. SAPatcher является графическим оптимизатором и расширителем памяти. Он не содержит читов, инжекторов стороннего кода или запрещённых модификаций, сохраняя 100% совместимость с античитами серверов.',
    'faq.q3': 'Что делать, если при запуске чёрный экран или вылет?',
    'faq.a3': 'Попробуйте переключить версию DXVK в SAPatcher на более раннюю (например, 2.3 или 1.10.3), либо обновите видеодрайвер. Также используйте встроенную кнопку «Генерация отчёта диагностики» для выявления несовместимостей.',
    'faq.q4': 'Как вернуть оригинальный лаунчер без изменений?',
    'faq.a4': 'В интерфейсе SAPatcher нажмите кнопку «Откатить лаунчер». Программа восстановит оригинальный немодифицированный app.asar из резервной копии.',
    'modal.title': 'Написать отзыв о SAPatcher',
    'modal.desc': 'Отзыв публикуется напрямую в GitHub Issues с меткой «review»',
    'modal.tabGithub': 'С аккаунтом GitHub',
    'modal.tabGuest': 'Без аккаунта (GitHub Access)',
    'modal.guestNotice': 'Отзыв будет автоматически опубликован ботом через GitHub Access. Пожалуйста, укажите контакт (Email, VK или Discord) для защиты от спама.',
    'modal.contactTypeLabel': 'Связь:',
    'modal.contactValueLabel': 'Почта / VK / Discord *:',
    'modal.ratingLabel': 'Оценка:',
    'modal.authorLabel': 'Ваше имя или ник:',
    'modal.categoryLabel': 'Любимая функция / Клиент:',
    'modal.summaryLabel': 'Краткий заголовок:',
    'modal.prosLabel': 'Что понравилось (Плюсы):',
    'modal.commentLabel': 'Подробный комментарий:',
    'modal.authNotice': 'Публикация происходит через GitHub с вашим профилем.',
    'modal.authNoticeGuest': 'Публикация выполняется автоматически через GitHub Access бота.',
    'modal.btnPublish': 'Опубликовать в GitHub',
    'modal.btnPublishGuest': 'Опубликовать через GitHub Access',
    'modal.submitting': 'Публикация отзыва...',
    'modal.errContact': 'Пожалуйста, укажите ваш контакт (Email, VK или Discord) для связи.',
    'modal.successGuest': '🎉 Спасибо! Ваш отзыв успешно отправлен и опубликован через GitHub Access бота!'
  },
  en: {
    'nav.features': 'Features',
    'nav.specs': 'Compatibility',
    'nav.reviews': 'Reviews',
    'nav.faq': 'FAQ',
    'hero.badge': 'A project by PixelSmith Studio',
    'hero.titleGradient': 'SAPatcher',
    'hero.titleSub': 'Universal GTA SA, SA-MP, CRMP & Motion Optimizer',
    'hero.description': 'Complete modernization engine for GTA San Andreas and multiplayer clients: Vulkan API translation (DXVK), 4GB LAA virtual memory expansion, Out of Memory crash prevention, and turnkey Motion Project launcher adaptation.',
    'hero.btnDownload': 'Download SAPatcher',
    'hero.btnReviews': 'Community Reviews',
    'hero.metricFps': 'FPS Stability & Pacing',
    'hero.metricRam': 'GTA SA, SA-MP, CRMP',
    'hero.metricCrash': 'Out Of Memory Immune',
    'hero.metricInstall': '1-Click Patch & Adapting',
    'features.title': 'Core Capabilities',
    'features.subtitle': 'Universal solutions for the entire GTA San Andreas ecosystem and modern launchers',
    'features.dxvk.title': 'DXVK Vulkan Revolution',
    'features.dxvk.desc': 'Translates legacy Direct3D 9 commands into ultra-low overhead modern Vulkan API. Eliminates micro-stutters, frame drops, and unlocks full GPU potential in GTA SA, SA-MP, and CRMP.',
    'features.laa.title': '4GB RAM Patch (LAA)',
    'features.laa.desc': 'Removes the 2048 MB 32-bit limitation of the GTA SA engine. The game safely addresses up to 4 GB of virtual memory for HD textures, vehicle mods, and custom scripts.',
    'features.guard.title': 'First Adaptation: Motion Project',
    'features.guard.desc': 'Motion Project is the first officially adapted launcher with seamless turnkey integration: auto-updater bypass, network API synchronization, and tray daemon supervision.',
    'features.diag.title': 'Self-Diagnostics & Reports',
    'features.diag.desc': 'Built-in HTML diagnostic generator audits your GPU Vulkan driver support, LAA flags, DLL checksums, and produces a complete audit report.',
    'specs.title': 'System Requirements & Matrix',
    'specs.subtitle': 'Select the optimal DXVK version for your graphics hardware',
    'specs.recModern': 'For modern GPUs (NVIDIA GTX 10xx+, RTX, AMD RX 5000/6000/7000, Intel Arc). Peak FPS, async pipeline, Vulkan 1.3+.',
    'specs.recBalanced': 'Ideal balance of compatibility and performance. Perfect for NVIDIA GTX 9xx/7xx and AMD RX 4xx/5xx.',
    'specs.recLegacy': 'For older GPUs and integrated graphics (Vulkan 1.1). Minimal hardware requirements.',
    'reviews.title': 'Real Player Reviews',
    'reviews.subtitle': 'Loaded live from official GitHub Issues tagged with "review"',
    'reviews.btnWrite': 'Write a Review',
    'reviews.loading': 'Fetching reviews from GitHub Issues...',
    'reviews.emptyTitle': 'No reviews yet',
    'reviews.emptyText': 'Be the first to share your experience with SAPatcher!',
    'reviews.ctaTitle': 'Playing with SAPatcher? Share your experience!',
    'reviews.ctaSubtitle': 'Your review is posted directly to our GitHub repository under the "review" label.',
    'reviews.ctaBtn': 'Leave Review',
    'faq.title': 'Frequently Asked Questions',
    'faq.q1': 'Does SAPatcher work with standard GTA SA, SA-MP, and CRMP?',
    'faq.a1': 'Yes! SAPatcher is engineered as a universal solution for GTA San Andreas, SA-MP, and CRMP clients. It removes the 2GB memory cap (4GB LAA) and installs the DXVK Vulkan layer into any game directory. Motion Project was the first launcher to receive complete out-of-the-box automation.',
    'faq.q2': 'Can I get banned for using SAPatcher?',
    'faq.a2': 'No. SAPatcher is purely a graphics optimization and memory allocation tool. It contains no cheats, injectors, or malicious hooks, maintaining full compliance with server anti-cheats.',
    'faq.q3': 'What if I encounter a black screen or crash?',
    'faq.a3': 'Try switching to DXVK 2.3 or 1.10.3 inside SAPatcher, or update your graphics driver. You can also click "Generate Diagnostics Report" to identify driver conflicts.',
    'faq.q4': 'How do I revert to the original unmodified launcher?',
    'faq.a4': 'Inside SAPatcher, simply click "Restore Launcher". The program instantly restores the original unmodified app.asar from backup.',
    'modal.title': 'Write a Review for SAPatcher',
    'modal.desc': 'Your review will be submitted directly to GitHub Issues labeled as "review"',
    'modal.tabGithub': 'With GitHub Account',
    'modal.tabGuest': 'Without Account (GitHub Access)',
    'modal.guestNotice': 'Your review will be automatically published by the bot via GitHub Access. Please specify your contact handle (Email, VK, or Discord) to prevent spam.',
    'modal.contactTypeLabel': 'Contact:',
    'modal.contactValueLabel': 'Email / VK / Discord *:',
    'modal.ratingLabel': 'Rating:',
    'modal.authorLabel': 'Your Name or Handle:',
    'modal.categoryLabel': 'Favorite Feature / Client:',
    'modal.summaryLabel': 'Summary Title:',
    'modal.prosLabel': 'What you liked (Pros):',
    'modal.commentLabel': 'Detailed Review:',
    'modal.authNotice': 'Published securely via your GitHub account.',
    'modal.authNoticeGuest': 'Published automatically via GitHub Access bot.',
    'modal.btnPublish': 'Publish on GitHub',
    'modal.btnPublishGuest': 'Publish via GitHub Access',
    'modal.submitting': 'Publishing review...',
    'modal.errContact': 'Please provide your contact handle (Email, VK, or Discord).',
    'modal.successGuest': '🎉 Thank you! Your review has been submitted and published via GitHub Access bot!'
  }
};

let currentLang = localStorage.getItem('sapatcher_lang') || 'ru';
let latestReleaseData = null;

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

  updateDownloadButtonUI();
}

// --- GitHub Releases Integration ---
async function fetchLatestRelease() {
  try {
    const res = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/releases/latest`);
    if (!res.ok) throw new Error('No release found');
    latestReleaseData = await res.json();
  } catch (e) {
    latestReleaseData = null;
  }
  updateDownloadButtonUI();
}

function updateDownloadButtonUI() {
  const btn = document.getElementById('btnDownloadLatest');
  const title = document.getElementById('btnDownloadTitle');
  const badge = document.getElementById('navVersionBadge');
  const info = document.getElementById('releaseInfoText');
  const isRu = currentLang === 'ru';

  if (latestReleaseData && latestReleaseData.tag_name) {
    const tag = latestReleaseData.tag_name;
    badge.textContent = tag;

    const winAsset = latestReleaseData.assets && latestReleaseData.assets.find(a => a.name.endsWith('.exe') || a.name.endsWith('.zip'));
    if (winAsset) {
      btn.href = winAsset.browser_download_url;
      const sizeMb = (winAsset.size / (1024 * 1024)).toFixed(1);
      title.textContent = isRu ? `Скачать SAPatcher ${tag}` : `Download SAPatcher ${tag}`;
      info.textContent = `Release ${tag} • Windows x64 • ${sizeMb} MB`;
    } else {
      btn.href = latestReleaseData.html_url || `https://github.com/${GITHUB_REPO}/releases/latest`;
      title.textContent = isRu ? `Скачать SAPatcher ${tag}` : `Download SAPatcher ${tag}`;
      info.textContent = `Release ${tag} • Windows x64`;
    }
  } else {
    badge.textContent = 'v1.0.0';
    btn.href = `https://github.com/${GITHUB_REPO}/releases`;
    title.textContent = isRu ? 'Скачать SAPatcher' : 'Download SAPatcher';
    info.textContent = 'v1.0.0 • Windows x64';
  }
}

// --- GitHub Issues Reviews Integration (Real Reviews Only) ---
async function fetchReviews() {
  const container = document.getElementById('reviewsContainer');
  const isRu = currentLang === 'ru';

  try {
    const res = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/issues?state=all&per_page=100`);
    if (!res.ok) throw new Error('API error');

    const issues = await res.json();
    if (!Array.isArray(issues)) {
      renderEmptyState();
      return;
    }

    // Filter reviews by [REVIEW] title prefix or labels
    const reviewIssues = issues.filter(iss => {
      const isReviewTitle = (iss.title || '').trim().toUpperCase().startsWith('[REVIEW]');
      const hasReviewLabel = iss.labels && Array.isArray(iss.labels) && iss.labels.some(l => {
        const name = (l.name || '').toLowerCase();
        return name === 'отзыв' || name === 'feedback' || name === 'review';
      });
      return isReviewTitle || hasReviewLabel;
    });

    if (reviewIssues.length === 0) {
      renderEmptyState();
      return;
    }

    const reviews = reviewIssues.map(iss => {
      const body = iss.body || '';
      let rating = 5;
      const starMatch = body.match(/\((\d)\s*\/\s*5\)/) || body.match(/Rating:\s*([★\d]+)/i);
      if (starMatch) {
        const num = parseInt(starMatch[1], 10);
        if (!isNaN(num) && num >= 1 && num <= 5) rating = num;
      }

      let category = 'GTA SA & Modding';
      const catMatch = body.match(/\*\*Category:\*\*\s*(.+)/i);
      if (catMatch && catMatch[1]) category = catMatch[1].trim();

      let author = iss.user ? iss.user.login : 'Пользователь';
      const authorMatch = body.match(/\*\*Author:\*\*\s*(.+)/i);
      if (authorMatch && authorMatch[1].trim()) author = authorMatch[1].trim();

      let pros = '';
      const prosMatch = body.match(/\*\*Pros:\*\*\s*([\s\S]*?)(?:###|_Submitted|$)/i);
      if (prosMatch && prosMatch[1].trim()) pros = prosMatch[1].trim();

      let reviewText = '';
      const reviewMatch = body.match(/### Detailed Review:\s*([\s\S]*?)(?:---|###|_Submitted|$)/i);
      if (reviewMatch && reviewMatch[1].trim()) {
        reviewText = reviewMatch[1].trim();
      } else {
        reviewText = body.replace(/###.+/g, '').replace(/\*\*.+\*\*/g, '').replace(/---/g, '').replace(/_Submitted.+/g, '').trim();
      }

      let title = (iss.title || '').replace(/^\[REVIEW\]\s*/i, '').trim();
      if (!title) title = isRu ? 'Отзыв о SAPatcher' : 'Community Review';

      let isAnonymous = false;
      let contact = '';
      const contactMatch = body.match(/\*\*Contact(?:\s*\([^)]+\))?:\*\*\s*(.+)/i);
      if (contactMatch && contactMatch[1].trim()) {
        contact = contactMatch[1].trim().replace(/`/g, '');
        isAnonymous = true;
      }
      if (body.includes('Guest Form') || author.toLowerCase().includes('гость') || author.toLowerCase() === 'anonymous' || author.toLowerCase().includes('аноним')) {
        isAnonymous = true;
      }

      if (isAnonymous) {
        author = 'Anonymous';
      }

      return {
        author,
        isAnonymous,
        avatar: isAnonymous
          ? 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png'
          : (iss.user ? iss.user.avatar_url : 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png'),
        date: new Date(iss.created_at).toLocaleDateString(),
        rating,
        category,
        title,
        body: reviewText || 'Отличный опыт использования SAPatcher.',
        pros,
        contact
      };
    });

    renderReviews(reviews);
  } catch (e) {
    renderEmptyState();
  }
}

function renderEmptyState() {
  const container = document.getElementById('reviewsContainer');
  const isRu = currentLang === 'ru';
  container.innerHTML = `
    <div class="empty-reviews-card">
      <div class="empty-icon">💬</div>
      <h4 class="empty-title">${isRu ? 'Пока нет отзывов' : 'No reviews yet'}</h4>
      <p class="empty-desc">${isRu ? 'Опубликованные через форму отзывы появятся здесь автоматически после создания в GitHub Issues с меткой «review».' : 'Reviews submitted through the form will appear here automatically once created in GitHub Issues with the "review" label.'}</p>
    </div>
  `;
}

function renderReviews(list) {
  const container = document.getElementById('reviewsContainer');
  container.innerHTML = '';

  list.forEach(r => {
    const starsHtml = '★'.repeat(r.rating) + '☆'.repeat(5 - r.rating);
    const card = document.createElement('div');
    card.className = 'review-card';

    const authorHtml = r.isAnonymous
      ? `<span class="anonymous-pill"><svg class="anonymous-gh-icon" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg> Anonymous</span>`
      : `<span class="reviewer-name-text">${r.author}</span>`;

    card.innerHTML = `
      <div class="review-top">
        <div class="reviewer-info">
          <img src="${r.avatar}" alt="${r.author}" class="reviewer-avatar">
          <div class="reviewer-meta">
            <div class="reviewer-name">${authorHtml}</div>
            ${r.contact ? `<span class="review-contact-badge" title="${r.contact}">✓ ${r.contact}</span>` : ''}
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

// --- Review Modal & Review Submission (GitHub + Guest via Access) ---
function setupReviewModal() {
  const modal = document.getElementById('reviewModal');
  const btnOpen = document.getElementById('btnOpenReviewModal');
  const btnClose = document.getElementById('btnCloseReviewModal');
  const triggers = document.querySelectorAll('.btnOpenReviewModalTrigger');
  const starBtns = document.querySelectorAll('#starRating .star-btn');
  const ratingInput = document.getElementById('reviewRatingInput');
  const form = document.getElementById('reviewForm');

  const tabGithub = document.getElementById('tabModeGithub');
  const tabGuest = document.getElementById('tabModeGuest');
  const guestRow = document.getElementById('guestContactRow');
  const guestNotice = document.getElementById('guestNoticeBox');
  const authorGroup = document.getElementById('authorGroup');
  const authorInput = document.getElementById('reviewAuthor');
  const authNoticeText = document.getElementById('authNoticeText');
  const btnSubmitText = document.getElementById('btnSubmitReviewText');
  const submitBtn = document.getElementById('btnSubmitReview');
  const alertBox = document.getElementById('modalStatusAlert');

  let currentMode = 'github'; // 'github' | 'guest'

  function openModal() {
    modal.classList.add('open');
    if (alertBox) {
      alertBox.className = 'modal-status-alert';
      alertBox.style.display = 'none';
    }
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

  function setMode(mode) {
    currentMode = mode;
    const isRu = currentLang === 'ru';
    const dict = translations[currentLang] || translations.ru;

    if (alertBox) alertBox.style.display = 'none';

    if (mode === 'github') {
      tabGithub.classList.add('active');
      tabGuest.classList.remove('active');
      if (authorGroup) authorGroup.style.display = 'block';
      if (authorInput) {
        if (authorInput.value === 'Anonymous') authorInput.value = '';
        authorInput.required = true;
      }
      if (guestRow) guestRow.style.display = 'none';
      if (guestNotice) guestNotice.style.display = 'none';
      if (authNoticeText) authNoticeText.textContent = dict['modal.authNotice'];
      if (btnSubmitText) btnSubmitText.textContent = dict['modal.btnPublish'];
    } else {
      tabGuest.classList.add('active');
      tabGithub.classList.remove('active');
      if (authorGroup) authorGroup.style.display = 'none';
      if (authorInput) {
        authorInput.value = 'Anonymous';
        authorInput.required = false;
      }
      if (guestRow) guestRow.style.display = 'flex';
      if (guestNotice) guestNotice.style.display = 'block';
      if (authNoticeText) authNoticeText.textContent = dict['modal.authNoticeGuest'];
      if (btnSubmitText) btnSubmitText.textContent = dict['modal.btnPublishGuest'];
    }
  }

  if (tabGithub) tabGithub.addEventListener('click', () => setMode('github'));
  if (tabGuest) tabGuest.addEventListener('click', () => setMode('guest'));

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

  // Form submit -> GitHub Issue or Guest API via GitHub Access
  form.addEventListener('submit', async e => {
    e.preventDefault();

    const isRu = currentLang === 'ru';
    const dict = translations[currentLang] || translations.ru;
    const rating = ratingInput.value || '5';
    const author = document.getElementById('reviewAuthor').value.trim();
    const category = document.getElementById('reviewCategory').value;
    const title = document.getElementById('reviewTitle').value.trim();
    const pros = document.getElementById('reviewPros').value.trim();
    const comment = document.getElementById('reviewBody').value.trim();
    const starString = '★'.repeat(parseInt(rating, 10)) + '☆'.repeat(5 - parseInt(rating, 10));

    if (currentMode === 'github') {
      const issueBody = [
        `### Rating: ${starString} (${rating}/5)`,
        `**Category:** ${category}`,
        `**Author:** ${author}`,
        '',
        pros ? `**Pros:**\n${pros}\n` : '',
        `### Detailed Review:\n${comment}`,
        '',
        '---',
        '_Submitted via [SAPatcher Official Website](https://passatb5by.github.io/SAPatch/) by [PixelSmith Studio](https://pixelsmith.ru)_'
      ].filter(Boolean).join('\n');

      const issueTitle = `[REVIEW] ${title}`;
      const issueUrl = `https://github.com/${GITHUB_REPO}/issues/new?title=${encodeURIComponent(issueTitle)}&labels=${encodeURIComponent(FEEDBACK_LABEL)}&body=${encodeURIComponent(issueBody)}`;

      window.open(issueUrl, '_blank', 'noopener,noreferrer');
      closeModal();
      form.reset();
      return;
    }

    // Guest Mode (Without GitHub Account)
    const contactType = document.getElementById('reviewContactType') ? document.getElementById('reviewContactType').value : 'Email';
    const contactValue = document.getElementById('reviewContactValue') ? document.getElementById('reviewContactValue').value.trim() : '';

    if (!contactValue) {
      if (alertBox) {
        alertBox.className = 'modal-status-alert error';
        alertBox.textContent = dict['modal.errContact'];
        alertBox.style.display = 'block';
      }
      return;
    }

    const guestIssueBody = [
      `### Rating: ${starString} (${rating}/5)`,
      `**Category:** ${category}`,
      `**Author:** Anonymous`,
      `**Contact (${contactType}):** \`${contactValue}\``,
      '',
      pros ? `**Pros:**\n${pros}\n` : '',
      `### Detailed Review:\n${comment}`,
      '',
      '---',
      '_Submitted via Guest Form (without GitHub account) on [SAPatcher Official Website](https://passatb5by.github.io/SAPatch/) by [PixelSmith Studio](https://pixelsmith.ru)_'
    ].filter(Boolean).join('\n');

    const guestTitle = `[REVIEW] ${title}`;
    const fallbackIssueUrl = `https://github.com/${GITHUB_REPO}/issues/new?title=${encodeURIComponent(guestTitle)}&labels=${encodeURIComponent(FEEDBACK_LABEL)}&body=${encodeURIComponent(guestIssueBody)}`;

    // Submit to relay API
    if (submitBtn) submitBtn.disabled = true;
    if (btnSubmitText) btnSubmitText.textContent = dict['modal.submitting'];
    if (alertBox) alertBox.style.display = 'none';

    try {
      const res = await fetch(GUEST_REVIEW_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          author,
          rating: parseInt(rating, 10),
          category,
          title,
          pros,
          comment,
          contactType,
          contactValue
        })
      });

      if (res.ok) {
        if (alertBox) {
          alertBox.className = 'modal-status-alert success';
          alertBox.innerHTML = `<strong>${dict['modal.successGuest']}</strong>`;
          alertBox.style.display = 'block';
        }
        setTimeout(() => {
          closeModal();
          form.reset();
          setMode('github');
          fetchReviews();
        }, 2500);
        return;
      }
      throw new Error(`HTTP ${res.status}`);
    } catch (err) {
      if (alertBox) {
        alertBox.className = 'modal-status-alert error';
        alertBox.innerHTML = `
          <strong>⚠️ ${isRu ? 'Шлюз GitHub Access не ответил' : 'GitHub Access Gateway Error'}</strong><br>
          ${isRu ? 'Чтобы бот автоматически создал отзыв в GitHub Issues, убедитесь, что скрипт <code>review.php</code> с токеном GitHub Access загружен на ваш сервер <code>pixelsmith.ru/api/review.php</code>.' : 'To automatically publish reviews directly to GitHub Issues, ensure the <code>review.php</code> script with your GitHub Access token is uploaded to <code>pixelsmith.ru/api/review.php</code>.'}
        `;
        alertBox.style.display = 'block';
      }
    } finally {
      if (submitBtn) submitBtn.disabled = false;
      if (btnSubmitText) btnSubmitText.textContent = dict['modal.btnPublishGuest'];
    }
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

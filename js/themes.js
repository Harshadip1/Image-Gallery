/**
 * Theme, settings, slideshow, and advanced features
 */
const Themes = (() => {
  function applySettings() {
    const settings = GalleryApp.getSettings();
    document.documentElement.setAttribute('data-theme', settings.theme);
    document.documentElement.setAttribute('data-accent', settings.accent);

    if (settings.reducedMotion) {
      document.documentElement.style.setProperty('--transition-fast', '0.01s');
      document.documentElement.style.setProperty('--transition-normal', '0.01s');
    }

    if (settings.wallpaperMode) {
      document.body.classList.add('wallpaper-mode');
    }

    document.querySelectorAll('[data-theme-toggle]').forEach(btn => {
      btn.textContent = settings.theme === 'dark' ? '☀' : '🌙';
    });
  }

  function initThemeToggle() {
    document.querySelectorAll('[data-theme-toggle]').forEach(btn => {
      btn.addEventListener('click', () => {
        const settings = GalleryApp.getSettings();
        const newTheme = settings.theme === 'dark' ? 'light' : 'dark';
        GalleryApp.saveSettings({ theme: newTheme });
        applySettings();
        GalleryApp.showToast('Theme updated', `Switched to ${newTheme} mode.`, 'info');
      });
    });
  }

  function initSettingsPage() {
    const form = document.getElementById('settings-form');
    if (!form) return;

    const settings = GalleryApp.getSettings();

    const themeSelect = document.getElementById('setting-theme');
    const accentSelect = document.getElementById('setting-accent');
    const langSelect = document.getElementById('setting-language');
    const lazyLoad = document.getElementById('setting-lazyload');
    const watermark = document.getElementById('setting-watermark');
    const kenBurns = document.getElementById('setting-kenburns');
    const reducedMotion = document.getElementById('setting-reduced-motion');
    const offlineMode = document.getElementById('setting-offline');

    if (themeSelect) themeSelect.value = settings.theme;
    if (accentSelect) accentSelect.value = settings.accent;
    if (langSelect) langSelect.value = settings.language;
    if (lazyLoad) lazyLoad.checked = settings.lazyLoad !== false;
    if (watermark) watermark.checked = settings.watermark;
    if (kenBurns) kenBurns.checked = settings.kenBurns !== false;
    if (reducedMotion) reducedMotion.checked = settings.reducedMotion;
    if (offlineMode) offlineMode.checked = settings.offlineMode;

    form.querySelectorAll('input, select').forEach(el => {
      el.addEventListener('change', () => {
        GalleryApp.saveSettings({
          theme: themeSelect?.value || settings.theme,
          accent: accentSelect?.value || settings.accent,
          language: langSelect?.value || settings.language,
          lazyLoad: lazyLoad?.checked,
          watermark: watermark?.checked,
          kenBurns: kenBurns?.checked,
          reducedMotion: reducedMotion?.checked,
          offlineMode: offlineMode?.checked
        });
        applySettings();
        GalleryApp.showToast('Settings saved', 'Your preferences have been updated.', 'success');
      });
    });

    document.getElementById('wallpaper-mode-btn')?.addEventListener('click', () => {
      const s = GalleryApp.getSettings();
      GalleryApp.saveSettings({ wallpaperMode: !s.wallpaperMode });
      applySettings();
    });
  }

  function initSlideshow() {
    const stage = document.getElementById('slideshow-stage');
    if (!stage) return;

    const params = new URLSearchParams(window.location.search);
    const startId = params.get('id');
    let images = GalleryApp.getImages();
    if (startId) {
      const idx = images.findIndex(i => i.id === startId);
      if (idx > 0) images = [...images.slice(idx), ...images.slice(0, idx)];
    }

    const settings = GalleryApp.getSettings();
    let currentIndex = 0;
    let playing = true;
    let interval;
    let elapsed = 0;
    const duration = (settings.slideshowInterval || 5) * 1000;

    function renderSlides() {
      stage.innerHTML = images.map((img, i) => `
        <div class="slideshow-slide ${i === 0 ? 'active' : ''} ${settings.kenBurns ? 'ken-burns' : ''}" data-index="${i}">
          <img src="${img.url}" alt="${GalleryApp.escapeHtml(img.title)}" />
        </div>
      `).join('');
      updateInfo();
    }

    function showSlide(index) {
      currentIndex = (index + images.length) % images.length;
      stage.querySelectorAll('.slideshow-slide').forEach((s, i) => {
        s.classList.toggle('active', i === currentIndex);
        s.classList.toggle('ken-burns', i === currentIndex && settings.kenBurns);
      });
      elapsed = 0;
      updateInfo();
      updateProgress();
    }

    function updateInfo() {
      const img = images[currentIndex];
      const info = document.getElementById('slideshow-info');
      if (info && img) {
        info.innerHTML = `<h2>${GalleryApp.escapeHtml(img.title)}</h2><p>${img.category} · ${currentIndex + 1} / ${images.length}</p>`;
      }
    }

    function updateProgress() {
      const bar = document.querySelector('.slideshow-progress-bar');
      const timer = document.querySelector('.slideshow-timer');
      const pct = (elapsed / duration) * 100;
      if (bar) bar.style.width = `${pct}%`;
      if (timer) timer.textContent = `${Math.ceil((duration - elapsed) / 1000)}s`;
    }

    function tick() {
      if (!playing) return;
      elapsed += 100;
      updateProgress();
      if (elapsed >= duration) showSlide(currentIndex + 1);
    }

    function startAutoplay() {
      clearInterval(interval);
      interval = setInterval(tick, 100);
    }

    renderSlides();
    startAutoplay();

    document.getElementById('slideshow-play')?.addEventListener('click', () => {
      playing = !playing;
      document.getElementById('slideshow-play').textContent = playing ? '⏸' : '▶';
    });

    document.getElementById('slideshow-prev')?.addEventListener('click', () => showSlide(currentIndex - 1));
    document.getElementById('slideshow-next')?.addEventListener('click', () => showSlide(currentIndex + 1));

    document.getElementById('slideshow-exit')?.addEventListener('click', () => {
      window.location.href = 'index.html';
    });

    document.getElementById('slideshow-fullscreen')?.addEventListener('click', () => {
      if (!document.fullscreenElement) document.documentElement.requestFullscreen?.();
      else document.exitFullscreen?.();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') showSlide(currentIndex - 1);
      if (e.key === 'ArrowRight') showSlide(currentIndex + 1);
      if (e.key === ' ') { e.preventDefault(); playing = !playing; }
      if (e.key === 'Escape') window.location.href = 'index.html';
    });
  }

  function initImageDetails() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    if (!id || !document.getElementById('image-details')) return;

    const image = GalleryApp.getImageById(id);
    if (!image) {
      document.getElementById('image-details').innerHTML = '<div class="empty-state"><h3>Image not found</h3></div>';
      return;
    }

    GalleryApp.incrementViews(id);
    const isLiked = GalleryApp.isFavorite(id);
    const rating = GalleryApp.getRating(id);

    document.getElementById('image-details').innerHTML = `
      <div class="image-details-layout page-enter">
        <div class="image-details-main glass-card">
          <img src="${image.url}" alt="${GalleryApp.escapeHtml(image.title)}" id="detail-image" />
        </div>
        <div class="image-details-sidebar glass-card" style="padding:2rem">
          <span class="gallery-card-category">${image.category}</span>
          <h1 class="mt-2">${GalleryApp.escapeHtml(image.title)}</h1>
          <p class="mt-2" style="color:var(--text-secondary)">${GalleryApp.escapeHtml(image.description || '')}</p>
          <div class="image-details-actions">
            <button class="btn btn-primary" id="detail-download">↓ Download</button>
            <button class="btn btn-secondary" id="detail-favorite">${isLiked ? '♥ Saved' : '♡ Favorite'}</button>
            <button class="btn btn-secondary" id="detail-share">Share</button>
            <a href="slideshow.html?id=${image.id}" class="btn btn-secondary">▶ Slideshow</a>
          </div>
          <div class="rating-stars mt-3" id="detail-rating">
            ${[1,2,3,4,5].map(n => `<span class="rating-star ${n <= rating ? 'active' : ''}" data-star="${n}">★</span>`).join('')}
          </div>
          <div class="lightbox-tags mt-3">
            ${(image.tags || []).map(t => `<span class="lightbox-tag">${GalleryApp.escapeHtml(t)}</span>`).join('')}
          </div>
          <div class="mt-3" style="color:var(--text-muted);font-size:0.9rem">
            <p>👁 ${GalleryApp.formatNumber(image.views)} views</p>
            <p>↓ ${image.downloads || 0} downloads</p>
            <p>📅 ${GalleryApp.formatDate(image.createdAt)}</p>
          </div>
          <div class="ai-panel mt-3" id="color-palette-panel">
            <h4>🎨 Color Palette</h4>
            <div class="palette-strip" id="palette-strip"></div>
          </div>
          <div class="mt-3">
            <h4 class="mb-2">Mini Editor</h4>
            <div class="editor-toolbar">
              <button class="btn btn-secondary btn-sm" data-filter="grayscale">Grayscale</button>
              <button class="btn btn-secondary btn-sm" data-filter="sepia">Sepia</button>
              <button class="btn btn-secondary btn-sm" data-filter="brightness">Bright</button>
              <button class="btn btn-secondary btn-sm" data-filter="contrast">Contrast</button>
              <button class="btn btn-secondary btn-sm" data-filter="none">Reset</button>
            </div>
            <div class="editor-canvas-wrap">
              <img src="${image.url}" alt="" id="editor-image" style="filter:none" />
            </div>
          </div>
        </div>
      </div>
    `;

    document.getElementById('detail-download')?.addEventListener('click', () => GalleryApp.downloadImage(image));
    document.getElementById('detail-favorite')?.addEventListener('click', () => {
      GalleryApp.toggleFavorite(id);
      Themes.initImageDetails();
    });
    document.getElementById('detail-share')?.addEventListener('click', () => GalleryApp.shareImage(image));

    document.querySelectorAll('#detail-rating [data-star]').forEach(star => {
      star.addEventListener('click', () => {
        GalleryApp.setRating(id, parseInt(star.dataset.star, 10));
        Themes.initImageDetails();
      });
    });

    document.querySelectorAll('[data-filter]').forEach(btn => {
      btn.addEventListener('click', () => {
        const filters = {
          grayscale: 'grayscale(100%)',
          sepia: 'sepia(80%)',
          brightness: 'brightness(1.3)',
          contrast: 'contrast(1.4)',
          none: 'none'
        };
        const img = document.getElementById('editor-image');
        if (img) img.style.filter = filters[btn.dataset.filter] || 'none';
      });
    });

    extractColorPalette(image.url);
  }

  function extractColorPalette(url) {
    const strip = document.getElementById('palette-strip');
    if (!strip) return;

    const colors = ['#7C3AED', '#06B6D4', '#22C55E', '#F59E0B', '#EC4899'];
    strip.innerHTML = colors.map(c => `
      <div class="palette-color" style="background:${c}" title="${c}" data-color="${c}"></div>
    `).join('');

    strip.querySelectorAll('.palette-color').forEach(el => {
      el.addEventListener('click', () => {
        navigator.clipboard?.writeText(el.dataset.color);
        GalleryApp.showToast('Color copied', el.dataset.color, 'info');
      });
    });
  }

  function initNotificationsPage() {
    const list = document.getElementById('notifications-list');
    if (!list) return;

    const notifications = GalleryApp.getNotifications();
    if (!notifications.length) {
      list.innerHTML = '<div class="empty-state"><p>No notifications yet</p></div>';
      return;
    }

    const icons = { upload: '↑', download: '↓', favorite: '♥', collection: '📁' };
    list.innerHTML = notifications.map(n => `
      <div class="notification-item glass-card ${n.read ? '' : 'unread'}" style="margin-bottom:0.75rem;border-radius:var(--radius-md)">
        <div class="notification-icon ${n.type}">${icons[n.type] || 'ℹ'}</div>
        <div>
          <strong>${GalleryApp.escapeHtml(n.title)}</strong>
          <p style="color:var(--text-secondary);font-size:0.9rem">${GalleryApp.escapeHtml(n.message)}</p>
          <span class="timeline-time">${GalleryApp.timeAgo(n.time)}</span>
        </div>
      </div>
    `).join('');

    const updated = notifications.map(n => ({ ...n, read: true }));
    localStorage.setItem(GalleryApp.STORAGE_KEYS.notifications, JSON.stringify(updated));
    GalleryApp.updateNotificationBadge();
  }

  function initAISuggestions() {
    document.querySelectorAll('.ai-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        Search.performSearch(chip.textContent);
      });
    });
  }

  function initCommunityFeed() {
    const feed = document.getElementById('community-feed');
    if (!feed) return;

    const images = GalleryApp.getImages().slice(0, 5);
    feed.innerHTML = images.map((img, i) => `
      <div class="feed-item glass-card">
        <div class="feed-avatar">G</div>
        <div class="feed-content">
          <strong>Gallery User ${i + 1}</strong>
          <span style="color:var(--text-muted);font-size:0.85rem"> · ${GalleryApp.timeAgo(img.createdAt)}</span>
          <p class="mt-1">Shared a new ${img.category} photograph</p>
          <div class="feed-image">
            <img src="${img.thumbUrl || img.url}" alt="${GalleryApp.escapeHtml(img.title)}" loading="lazy" />
          </div>
          <div class="feed-actions">
            <span>♥ ${img.likes || 0}</span>
            <span>💬 ${Math.floor(Math.random() * 20)}</span>
            <span>↗ Share</span>
          </div>
        </div>
      </div>
    `).join('');
  }

  document.addEventListener('DOMContentLoaded', () => {
    applySettings();
    initThemeToggle();
    initSettingsPage();
    initSlideshow();
    initImageDetails();
    initNotificationsPage();
    initAISuggestions();
    initCommunityFeed();
  });

  return { applySettings, initImageDetails, initSlideshow };
})();

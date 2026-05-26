/**
 * Lightbox fullscreen viewer
 */
const Lightbox = (() => {
  let images = [];
  let currentIndex = 0;
  let zoomLevel = 1;
  let overlay = null;

  function createLightbox() {
    if (document.getElementById('lightbox')) return;

    const el = document.createElement('div');
    el.id = 'lightbox';
    el.className = 'lightbox';
    el.innerHTML = `
      <div class="lightbox-backdrop"></div>
      <div class="lightbox-container">
        <button class="lightbox-close" aria-label="Close lightbox">×</button>
        <div class="lightbox-toolbar">
          <button class="lightbox-tool" data-zoom="out" title="Zoom out">−</button>
          <button class="lightbox-tool" data-zoom="in" title="Zoom in">+</button>
          <button class="lightbox-tool" data-zoom="reset" title="Reset zoom">⊙</button>
          <button class="lightbox-tool" data-fullscreen title="Fullscreen">⛶</button>
          <button class="lightbox-tool" data-sidebar title="Details">ℹ</button>
        </div>
        <button class="lightbox-nav prev" aria-label="Previous">‹</button>
        <div class="lightbox-main">
          <div class="lightbox-image-wrap">
            <img src="" alt="" id="lightbox-img" />
          </div>
        </div>
        <button class="lightbox-nav next" aria-label="Next">›</button>
        <aside class="lightbox-sidebar" id="lightbox-sidebar"></aside>
      </div>
    `;
    document.body.appendChild(el);
    overlay = el;
    bindEvents();
  }

  function bindEvents() {
    overlay.querySelector('.lightbox-close').addEventListener('click', close);
    overlay.querySelector('.lightbox-backdrop').addEventListener('click', close);
    overlay.querySelector('.lightbox-nav.prev').addEventListener('click', () => navigate(-1));
    overlay.querySelector('.lightbox-nav.next').addEventListener('click', () => navigate(1));

    overlay.querySelector('[data-zoom="in"]').addEventListener('click', () => setZoom(zoomLevel + 0.5));
    overlay.querySelector('[data-zoom="out"]').addEventListener('click', () => setZoom(Math.max(1, zoomLevel - 0.5)));
    overlay.querySelector('[data-zoom="reset"]').addEventListener('click', () => setZoom(1));
    overlay.querySelector('[data-fullscreen]').addEventListener('click', toggleFullscreen);
    overlay.querySelector('[data-sidebar]').addEventListener('click', toggleSidebar);

    document.addEventListener('keydown', handleKeyboard);
  }

  function handleKeyboard(e) {
    if (!overlay?.classList.contains('active')) return;
    switch (e.key) {
      case 'Escape': close(); break;
      case 'ArrowLeft': navigate(-1); break;
      case 'ArrowRight': navigate(1); break;
      case '+': case '=': setZoom(zoomLevel + 0.5); break;
      case '-': setZoom(Math.max(1, zoomLevel - 0.5)); break;
      case 'f': toggleFullscreen(); break;
      case 'i': toggleSidebar(); break;
    }
  }

  function open(imageList, index = 0) {
    createLightbox();
    images = imageList;
    currentIndex = Math.max(0, Math.min(index, images.length - 1));
    zoomLevel = 1;
    updateImage();
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function close() {
    overlay?.classList.remove('active');
    document.body.style.overflow = '';
    if (document.fullscreenElement) document.exitFullscreen?.();
    overlay?.querySelector('.lightbox-sidebar')?.classList.remove('open');
  }

  function navigate(dir) {
    currentIndex = (currentIndex + dir + images.length) % images.length;
    zoomLevel = 1;
    updateImage();
  }

  function updateImage() {
    const image = images[currentIndex];
    if (!image) return;

    const img = overlay.querySelector('#lightbox-img');
    const wrap = overlay.querySelector('.lightbox-image-wrap');
    img.src = image.url;
    img.alt = image.title;
    wrap.classList.toggle('zoomed', zoomLevel > 1);
    img.style.transform = `scale(${zoomLevel})`;

    renderSidebar(image);
    GalleryApp.incrementViews(image.id);
  }

  function setZoom(level) {
    zoomLevel = level;
    const wrap = overlay.querySelector('.lightbox-image-wrap');
    const img = overlay.querySelector('#lightbox-img');
    wrap.classList.toggle('zoomed', zoomLevel > 1);
    img.style.transform = `scale(${zoomLevel})`;
  }

  function toggleFullscreen() {
    const container = overlay.querySelector('.lightbox-container');
    if (!document.fullscreenElement) {
      container.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  }

  function toggleSidebar() {
    overlay.querySelector('.lightbox-sidebar')?.classList.toggle('open');
  }

  function renderSidebar(image) {
    const sidebar = overlay.querySelector('#lightbox-sidebar');
    const isLiked = GalleryApp.isFavorite(image.id);
    const rating = GalleryApp.getRating(image.id);

    sidebar.innerHTML = `
      <h2>${GalleryApp.escapeHtml(image.title)}</h2>
      <p class="lightbox-sidebar-meta">${GalleryApp.escapeHtml(image.category)} · ${GalleryApp.formatNumber(image.views)} views</p>
      <div class="lightbox-sidebar-section">
        <h4>Description</h4>
        <p>${GalleryApp.escapeHtml(image.description || 'No description available.')}</p>
      </div>
      <div class="lightbox-sidebar-section">
        <h4>Tags</h4>
        <div class="lightbox-tags">
          ${(image.tags || []).map(t => `<span class="lightbox-tag">${GalleryApp.escapeHtml(t)}</span>`).join('')}
        </div>
      </div>
      <div class="lightbox-sidebar-section">
        <h4>Rating</h4>
        <div class="rating-stars" data-rate="${image.id}">
          ${[1,2,3,4,5].map(n => `<span class="rating-star ${n <= rating ? 'active' : ''}" data-star="${n}">★</span>`).join('')}
        </div>
      </div>
      <div class="lightbox-sidebar-section">
        <h4>Actions</h4>
        <div class="flex gap-1 flex-wrap">
          <button class="btn btn-primary btn-sm" data-lb-download>↓ Download</button>
          <button class="btn btn-secondary btn-sm" data-lb-favorite>${isLiked ? '♥ Saved' : '♡ Favorite'}</button>
          <button class="btn btn-secondary btn-sm" data-lb-share>Share</button>
          <a href="image-details.html?id=${image.id}" class="btn btn-secondary btn-sm">View Details</a>
        </div>
      </div>
      <div class="lightbox-sidebar-section">
        <h4>Share</h4>
        <div class="lightbox-share-btns">
          <button class="btn btn-ghost btn-sm" data-share-platform="twitter">Twitter</button>
          <button class="btn btn-ghost btn-sm" data-share-platform="facebook">Facebook</button>
          <button class="btn btn-ghost btn-sm" data-share-platform="copy">Copy Link</button>
        </div>
      </div>
    `;

    sidebar.querySelector('[data-lb-download]')?.addEventListener('click', () => GalleryApp.downloadImage(image));
    sidebar.querySelector('[data-lb-favorite]')?.addEventListener('click', () => {
      GalleryApp.toggleFavorite(image.id);
      renderSidebar(image);
    });
    sidebar.querySelector('[data-lb-share]')?.addEventListener('click', () => GalleryApp.shareImage(image));

    sidebar.querySelectorAll('[data-star]').forEach(star => {
      star.addEventListener('click', () => {
        GalleryApp.setRating(image.id, parseInt(star.dataset.star, 10));
        renderSidebar(image);
      });
    });

    sidebar.querySelector('[data-share-platform="copy"]')?.addEventListener('click', () => GalleryApp.shareImage(image));
  }

  return { open, close, navigate };
})();

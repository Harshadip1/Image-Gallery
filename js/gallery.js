/**
 * Gallery rendering, masonry, infinite scroll
 */
const Gallery = (() => {
  let currentPage = 0;
  const PAGE_SIZE = 12;
  let currentImages = [];
  let observer = null;

  function renderCard(image) {
    const isLiked = GalleryApp.isFavorite(image.id);
    const rating = GalleryApp.getRating(image.id);
    const stars = rating > 0 ? '★'.repeat(rating) : '';

    return `
      <article class="masonry-item gallery-card" data-id="${image.id}">
        <div class="gallery-card-image-wrap" data-lightbox="${image.id}">
          <img src="${image.thumbUrl || image.url}" alt="${GalleryApp.escapeHtml(image.title)}" loading="lazy" />
          <div class="gallery-card-overlay">
            <div class="gallery-card-actions">
              <button class="gallery-card-action ${isLiked ? 'liked' : ''}" data-favorite="${image.id}" title="Favorite" aria-label="Toggle favorite">♥</button>
              <button class="gallery-card-action" data-download="${image.id}" title="Download" aria-label="Download">↓</button>
              <button class="gallery-card-action" data-share="${image.id}" title="Share" aria-label="Share">⤴</button>
            </div>
          </div>
        </div>
        <div class="gallery-card-body">
          <h3 class="gallery-card-title"><a href="image-details.html?id=${image.id}">${GalleryApp.escapeHtml(image.title)}</a></h3>
          <div class="gallery-card-meta">
            <span class="gallery-card-category">${GalleryApp.escapeHtml(image.category)}</span>
            <div class="gallery-card-stats">
              <span>👁 ${GalleryApp.formatNumber(image.views || 0)}</span>
              ${stars ? `<span class="gallery-card-rating">${stars}</span>` : ''}
            </div>
          </div>
        </div>
      </article>
    `;
  }

  function renderGrid(container, images, append = false) {
    if (!container) return;

    if (!append) {
      container.innerHTML = '';
      currentPage = 0;
    }

    currentImages = images;
    const start = currentPage * PAGE_SIZE;
    const slice = images.slice(start, start + PAGE_SIZE);

    if (slice.length === 0 && !append) {
      container.innerHTML = `
        <div class="empty-state" style="column-span: all; width: 100%;">
          <div class="empty-state-icon">🖼</div>
          <h3>No images found</h3>
          <p>Try adjusting your filters or search query.</p>
        </div>
      `;
      return;
    }

    const html = slice.map(renderCard).join('');
    if (append) {
      container.insertAdjacentHTML('beforeend', html);
    } else {
      container.innerHTML = html;
    }

    currentPage++;
    bindCardEvents(container);
    setupInfiniteScroll(container, images);
  }

  function bindCardEvents(container) {
    container.querySelectorAll('[data-lightbox]').forEach(el => {
      el.addEventListener('click', () => {
        const id = el.dataset.lightbox;
        const images = currentImages.length ? currentImages : GalleryApp.getImages();
        Lightbox.open(images, images.findIndex(img => img.id === id));
        GalleryApp.incrementViews(id);
      });
    });

    container.querySelectorAll('[data-favorite]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.dataset.favorite;
        const liked = GalleryApp.toggleFavorite(id);
        btn.classList.toggle('liked', liked);
      });
    });

    container.querySelectorAll('[data-download]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const img = GalleryApp.getImageById(btn.dataset.download);
        if (img) GalleryApp.downloadImage(img);
      });
    });

    container.querySelectorAll('[data-share]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const img = GalleryApp.getImageById(btn.dataset.share);
        if (img) GalleryApp.shareImage(img);
      });
    });
  }

  function setupInfiniteScroll(container, images) {
    const existing = container.parentElement?.querySelector('.scroll-sentinel');
    if (existing) existing.remove();
    if (observer) observer.disconnect();

    const totalLoaded = currentPage * PAGE_SIZE;
    if (totalLoaded >= images.length) return;

    const sentinel = document.createElement('div');
    sentinel.className = 'scroll-sentinel';
    container.parentElement?.appendChild(sentinel);

    observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        const loaded = currentPage * PAGE_SIZE;
        if (loaded < images.length) {
          renderGrid(container, images, true);
        }
        if (loaded >= images.length - PAGE_SIZE) {
          sentinel.remove();
          observer.disconnect();
        }
      }
    }, { rootMargin: '200px' });

    observer.observe(sentinel);
  }

  function renderCategoryTabs(container, activeCategory = 'all', onSelect) {
    if (!container) return;

    const tabs = GalleryApp.CATEGORIES.map(cat => {
      const count = GalleryApp.getCategoryCount(cat);
      const label = GalleryApp.CATEGORY_LABELS[cat] || cat;
      return `
        <button class="category-tab ${cat === activeCategory ? 'active' : ''}" data-category="${cat}">
          ${label} ${cat !== 'all' ? `<span style="opacity:0.7">(${count})</span>` : ''}
        </button>
      `;
    }).join('');

    container.innerHTML = tabs;

    container.querySelectorAll('.category-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        container.querySelectorAll('.category-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const category = tab.dataset.category;
        GalleryApp.trackCategoryView(category);
        onSelect?.(category);
      });
    });
  }

  function renderFeatured(container) {
    if (!container) return;
    const featured = GalleryApp.getImages().filter(img => img.featured).slice(0, 5);
    if (featured.length < 5) {
      featured.push(...GalleryApp.getImages().slice(0, 5 - featured.length));
    }

    container.innerHTML = featured.slice(0, 5).map(img => `
      <div class="featured-item glass-card" data-lightbox-featured="${img.id}">
        <img src="${img.thumbUrl || img.url}" alt="${GalleryApp.escapeHtml(img.title)}" loading="lazy" />
        <div class="featured-item-overlay">
          <h3>${GalleryApp.escapeHtml(img.title)}</h3>
        </div>
      </div>
    `).join('');

    container.querySelectorAll('[data-lightbox-featured]').forEach(el => {
      el.addEventListener('click', () => {
        const images = GalleryApp.getImages().filter(i => i.featured).slice(0, 5);
        const id = el.dataset.lightboxFeatured;
        Lightbox.open(images.length ? images : GalleryApp.getImages(), images.findIndex(i => i.id === id));
      });
    });
  }

  function renderTrending(container) {
    if (!container) return;
    const trending = GalleryApp.filterImages({ trendingOnly: true }).slice(0, 10);
    const images = trending.length ? trending : GalleryApp.getImages().sort((a, b) => b.views - a.views).slice(0, 10);

    container.innerHTML = images.map(img => `
      <div class="trending-card glass-card" data-trending="${img.id}">
        <img src="${img.thumbUrl || img.url}" alt="${GalleryApp.escapeHtml(img.title)}" loading="lazy" />
        <span class="trending-badge">🔥 Trending</span>
        <div class="featured-item-overlay">
          <h3>${GalleryApp.escapeHtml(img.title)}</h3>
        </div>
      </div>
    `).join('');

    container.querySelectorAll('[data-trending]').forEach(el => {
      el.addEventListener('click', () => {
        Lightbox.open(images, images.findIndex(i => i.id === el.dataset.trending));
      });
    });
  }

  function renderCategoryCards(container) {
    if (!container) return;
    const cats = GalleryApp.CATEGORIES.filter(c => c !== 'all');
    const sampleImages = GalleryApp.getImages();

    container.innerHTML = cats.map(cat => {
      const img = sampleImages.find(i => i.category === cat) || sampleImages[0];
      const count = GalleryApp.getCategoryCount(cat);
      return `
        <a href="categories.html?cat=${cat}" class="category-card glass-card reveal">
          <img src="${img?.thumbUrl || img?.url}" alt="${cat}" loading="lazy" />
          <div class="category-card-overlay">
            <h3>${GalleryApp.CATEGORY_LABELS[cat]}</h3>
            <span class="count">${count} images</span>
          </div>
        </a>
      `;
    }).join('');
  }

  function initPage(options = {}) {
    const {
      gridSelector = '#gallery-grid',
      tabsSelector = '#category-tabs',
      category = 'all',
      search = '',
      favoritesOnly = false,
      trendingOnly = false
    } = options;

    const grid = document.querySelector(gridSelector);
    const tabs = document.querySelector(tabsSelector);

    function load(cat) {
      const images = GalleryApp.filterImages({
        category: cat,
        search,
        favoritesOnly,
        trendingOnly
      });
      renderGrid(grid, images);
    }

    if (tabs) {
      renderCategoryTabs(tabs, category, load);
    }
    load(category);
  }

  return {
    renderCard,
    renderGrid,
    renderCategoryTabs,
    renderFeatured,
    renderTrending,
    renderCategoryCards,
    initPage
  };
})();

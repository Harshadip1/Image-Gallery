/**
 * Image Gallery Platform - Core Application
 */
const GalleryApp = (() => {
  const STORAGE_KEYS = {
    images: 'gallery_images',
    favorites: 'gallery_favorites',
    collections: 'gallery_collections',
    recentSearches: 'gallery_recent_searches',
    settings: 'gallery_settings',
    analytics: 'gallery_analytics',
    notifications: 'gallery_notifications',
    uploadHistory: 'gallery_upload_history',
    bookmarks: 'gallery_bookmarks',
    ratings: 'gallery_ratings'
  };

  const CATEGORIES = [
    'all', 'nature', 'technology', 'architecture', 'fashion',
    'cars', 'travel', 'abstract', 'food', 'animals', 'art'
  ];

  const CATEGORY_LABELS = {
    all: 'All',
    nature: 'Nature',
    technology: 'Technology',
    architecture: 'Architecture',
    fashion: 'Fashion',
    cars: 'Cars',
    travel: 'Travel',
    abstract: 'Abstract',
    food: 'Food',
    animals: 'Animals',
    art: 'Art'
  };

  const SAMPLE_TITLES = {
    nature: ['Mountain Vista', 'Forest Dawn', 'Ocean Horizon', 'Wildflower Meadow', 'Aurora Sky'],
    technology: ['Neon Circuit', 'Digital Matrix', 'Smart Interface', 'Code Stream', 'Future Device'],
    architecture: ['Urban Geometry', 'Glass Tower', 'Historic Bridge', 'Modern Facade', 'Skyline View'],
    fashion: ['Runway Elegance', 'Street Style', 'Minimal Wardrobe', 'Bold Patterns', 'Classic Tailoring'],
    cars: ['Sports Velocity', 'Classic Roadster', 'Electric Future', 'Racing Strip', 'Urban Drive'],
    travel: ['Coastal Escape', 'Desert Journey', 'City Explorer', 'Island Paradise', 'Mountain Trek'],
    abstract: ['Color Flow', 'Geometric Dream', 'Fluid Motion', 'Light Play', 'Texture Wave'],
    food: ['Gourmet Plate', 'Fresh Harvest', 'Artisan Bake', 'Coffee Moment', 'Fusion Dish'],
    animals: ['Wild Portrait', 'Ocean Life', 'Forest Creature', 'Bird in Flight', 'Safari Gaze'],
    art: ['Canvas Expression', 'Sculpted Form', 'Digital Creation', 'Street Mural', 'Gallery Piece']
  };

  const SAMPLE_TAGS = [
    'landscape', 'portrait', 'minimal', 'vibrant', 'dark', 'bright',
    'urban', 'rural', 'macro', 'aerial', 'sunset', 'night', 'creative', 'professional'
  ];

  function generateSampleImages() {
    const images = [];
    let id = 1;
    const cats = CATEGORIES.filter(c => c !== 'all');

    cats.forEach(category => {
      const titles = SAMPLE_TITLES[category] || ['Untitled'];
      titles.forEach((title, i) => {
        const seed = `${category}-${i}-${id}`;
        const height = 400 + (id % 5) * 80;
        images.push({
          id: String(id++),
          title,
          category,
          tags: [
            category,
            SAMPLE_TAGS[id % SAMPLE_TAGS.length],
            SAMPLE_TAGS[(id + 3) % SAMPLE_TAGS.length]
          ],
          url: `https://picsum.photos/seed/${seed}/600/${height}`,
          thumbUrl: `https://picsum.photos/seed/${seed}/400/300`,
          author: 'Contributor',
          views: Math.floor(Math.random() * 5000) + 100,
          likes: Math.floor(Math.random() * 500) + 10,
          downloads: Math.floor(Math.random() * 200) + 5,
          trending: Math.random() > 0.6,
          featured: Math.random() > 0.75,
          createdAt: new Date(Date.now() - Math.random() * 30 * 86400000).toISOString(),
          description: `A stunning ${category} photograph showcasing ${title.toLowerCase()}.`
        });
      });
    });
    return images;
  }

  function getImages() {
    const stored = localStorage.getItem(STORAGE_KEYS.images);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return generateSampleImages();
      }
    }
    const samples = generateSampleImages();
    localStorage.setItem(STORAGE_KEYS.images, JSON.stringify(samples));
    return samples;
  }

  function saveImages(images) {
    localStorage.setItem(STORAGE_KEYS.images, JSON.stringify(images));
  }

  function getImageById(id) {
    return getImages().find(img => img.id === String(id));
  }

  function addImage(image) {
    const images = getImages();
    image.id = String(Date.now());
    image.createdAt = new Date().toISOString();
    image.views = 0;
    image.likes = 0;
    image.downloads = 0;
    image.trending = false;
    image.featured = false;
    images.unshift(image);
    saveImages(images);
    return image;
  }

  function incrementViews(id) {
    const images = getImages();
    const img = images.find(i => i.id === String(id));
    if (img) {
      img.views = (img.views || 0) + 1;
      saveImages(images);
    }
  }

  function incrementDownloads(id) {
    const images = getImages();
    const img = images.find(i => i.id === String(id));
    if (img) {
      img.downloads = (img.downloads || 0) + 1;
      saveImages(images);
      trackAnalytics('download');
    }
  }

  function getFavorites() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.favorites) || '[]');
    } catch {
      return [];
    }
  }

  function toggleFavorite(id) {
    let favorites = getFavorites();
    const sid = String(id);
    const index = favorites.indexOf(sid);
    if (index > -1) {
      favorites.splice(index, 1);
      showToast('Removed from favorites', 'Image removed from your favorites.', 'info');
    } else {
      favorites.push(sid);
      showToast('Added to favorites', 'Image saved to your favorites.', 'success');
      addNotification('favorite', 'Favorite Added', 'An image was added to your favorites.');
      trackAnalytics('favorite');
    }
    localStorage.setItem(STORAGE_KEYS.favorites, JSON.stringify(favorites));
    return favorites.includes(sid);
  }

  function isFavorite(id) {
    return getFavorites().includes(String(id));
  }

  function getCollections() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.collections) || '[]');
    } catch {
      return [];
    }
  }

  function saveCollections(collections) {
    localStorage.setItem(STORAGE_KEYS.collections, JSON.stringify(collections));
  }

  function createCollection(name, imageIds = []) {
    const collections = getCollections();
    const collection = {
      id: String(Date.now()),
      name,
      imageIds: imageIds.map(String),
      createdAt: new Date().toISOString()
    };
    collections.push(collection);
    saveCollections(collections);
    addNotification('collection', 'Collection Created', `"${name}" collection was created.`);
    showToast('Collection created', `"${name}" is ready for your images.`, 'success');
    return collection;
  }

  function getSettings() {
    const defaults = {
      theme: 'dark',
      accent: 'cyan',
      language: 'en',
      reducedMotion: false,
      lazyLoad: true,
      offlineMode: false,
      watermark: false,
      wallpaperMode: false,
      slideshowInterval: 5,
      kenBurns: true,
      autoPlayMusic: false
    };
    try {
      return { ...defaults, ...JSON.parse(localStorage.getItem(STORAGE_KEYS.settings) || '{}') };
    } catch {
      return defaults;
    }
  }

  function saveSettings(settings) {
    const current = getSettings();
    localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify({ ...current, ...settings }));
  }

  function getAnalytics() {
    const defaults = {
      uploads: 0,
      downloads: 0,
      favorites: 0,
      views: 0,
      categoryViews: {},
      dailyActivity: [12, 19, 8, 24, 16, 22, 14]
    };
    try {
      return { ...defaults, ...JSON.parse(localStorage.getItem(STORAGE_KEYS.analytics) || '{}') };
    } catch {
      return defaults;
    }
  }

  function trackAnalytics(type) {
    const analytics = getAnalytics();
    if (analytics[type] !== undefined) analytics[type]++;
    analytics.views = (analytics.views || 0) + 1;
    localStorage.setItem(STORAGE_KEYS.analytics, JSON.stringify(analytics));
  }

  function trackCategoryView(category) {
    const analytics = getAnalytics();
    analytics.categoryViews = analytics.categoryViews || {};
    analytics.categoryViews[category] = (analytics.categoryViews[category] || 0) + 1;
    localStorage.setItem(STORAGE_KEYS.analytics, JSON.stringify(analytics));
  }

  function getNotifications() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.notifications) || '[]');
    } catch {
      return [];
    }
  }

  function addNotification(type, title, message) {
    const notifications = getNotifications();
    notifications.unshift({
      id: String(Date.now()),
      type,
      title,
      message,
      read: false,
      time: new Date().toISOString()
    });
    if (notifications.length > 50) notifications.pop();
    localStorage.setItem(STORAGE_KEYS.notifications, JSON.stringify(notifications));
    updateNotificationBadge();
  }

  function getUploadHistory() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.uploadHistory) || '[]');
    } catch {
      return [];
    }
  }

  function addUploadHistory(entry) {
    const history = getUploadHistory();
    history.unshift(entry);
    if (history.length > 20) history.pop();
    localStorage.setItem(STORAGE_KEYS.uploadHistory, JSON.stringify(history));
  }

  function getRecentSearches() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.recentSearches) || '[]');
    } catch {
      return [];
    }
  }

  function addRecentSearch(query) {
    if (!query.trim()) return;
    let recent = getRecentSearches().filter(s => s.toLowerCase() !== query.toLowerCase());
    recent.unshift(query);
    recent = recent.slice(0, 8);
    localStorage.setItem(STORAGE_KEYS.recentSearches, JSON.stringify(recent));
  }

  function getRating(id) {
    try {
      const ratings = JSON.parse(localStorage.getItem(STORAGE_KEYS.ratings) || '{}');
      return ratings[String(id)] || 0;
    } catch {
      return 0;
    }
  }

  function setRating(id, rating) {
    try {
      const ratings = JSON.parse(localStorage.getItem(STORAGE_KEYS.ratings) || '{}');
      ratings[String(id)] = rating;
      localStorage.setItem(STORAGE_KEYS.ratings, JSON.stringify(ratings));
    } catch { /* ignore */ }
  }

  function getCategoryCount(category) {
    const images = getImages();
    if (category === 'all') return images.length;
    return images.filter(img => img.category === category).length;
  }

  function filterImages({ category = 'all', search = '', favoritesOnly = false, trendingOnly = false } = {}) {
    let images = getImages();

    if (category && category !== 'all') {
      images = images.filter(img => img.category === category);
    }
    if (search) {
      const q = search.toLowerCase();
      images = images.filter(img =>
        img.title.toLowerCase().includes(q) ||
        img.category.toLowerCase().includes(q) ||
        (img.tags && img.tags.some(t => t.toLowerCase().includes(q)))
      );
    }
    if (favoritesOnly) {
      const favs = getFavorites();
      images = images.filter(img => favs.includes(img.id));
    }
    if (trendingOnly) {
      images = images.filter(img => img.trending || img.views > 2000);
    }
    return images;
  }

  function showToast(title, message, type = 'info') {
    const container = document.getElementById('toast-container') || createToastContainer();
    const icons = { success: '✓', error: '✕', warning: '⚠', info: 'ℹ' };
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
      <span class="toast-icon">${icons[type] || icons.info}</span>
      <div class="toast-content">
        <div class="toast-title">${escapeHtml(title)}</div>
        <div class="toast-message">${escapeHtml(message)}</div>
      </div>
      <button class="toast-close" aria-label="Close">×</button>
    `;
    toast.querySelector('.toast-close').addEventListener('click', () => toast.remove());
    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(120%)';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }

  function createToastContainer() {
    const container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
    return container;
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function updateNotificationBadge() {
    const unread = getNotifications().filter(n => !n.read).length;
    document.querySelectorAll('[data-notification-badge]').forEach(el => {
      el.textContent = unread > 0 ? unread : '';
      el.style.display = unread > 0 ? 'inline-flex' : 'none';
    });
  }

  function initParticles() {
    const container = document.querySelector('.particles');
    if (!container || container.children.length > 0) return;
    for (let i = 0; i < 20; i++) {
      const p = document.createElement('div');
      p.className = 'particle';
      p.style.left = `${Math.random() * 100}%`;
      p.style.top = `${Math.random() * 100}%`;
      p.style.animationDelay = `${Math.random() * 15}s`;
      p.style.animationDuration = `${10 + Math.random() * 10}s`;
      container.appendChild(p);
    }
  }

  function initScrollReveal() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
  }

  function initMobileNav() {
    const btn = document.querySelector('.mobile-menu-btn');
    const nav = document.querySelector('.mobile-nav');
    if (!btn || !nav) return;

    btn.addEventListener('click', () => {
      nav.classList.toggle('active');
      btn.classList.toggle('active');
    });

    nav.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        nav.classList.remove('active');
        btn.classList.remove('active');
      });
    });
  }

  function setActiveNav() {
    const page = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-link').forEach(link => {
      const href = link.getAttribute('href');
      if (href === page || (page === '' && href === 'index.html')) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }

  function initOfflineDetection() {
    const banner = document.getElementById('offline-banner');
    if (!banner) return;

    function updateOnlineStatus() {
      banner.classList.toggle('visible', !navigator.onLine);
    }
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    updateOnlineStatus();
  }

  function initKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      if (e.key === '?' && !e.target.matches('input, textarea')) {
        e.preventDefault();
        document.getElementById('shortcuts-modal')?.classList.add('active');
      }
      if (e.key === 'Escape') {
        document.getElementById('shortcuts-modal')?.classList.remove('active');
      }
    });

    document.querySelectorAll('[data-close-modal]').forEach(btn => {
      btn.addEventListener('click', () => {
        btn.closest('.modal-overlay')?.classList.remove('active');
      });
    });
  }

  function formatNumber(num) {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return String(num);
  }

  function formatDate(iso) {
    return new Date(iso).toLocaleDateString(undefined, {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  }

  function timeAgo(iso) {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  }

  function downloadImage(image) {
    const link = document.createElement('a');
    link.href = image.url;
    link.download = `${image.title.replace(/\s+/g, '-')}.jpg`;
    link.target = '_blank';
    link.click();
    incrementDownloads(image.id);
    addNotification('download', 'Download Complete', `"${image.title}" was downloaded.`);
    showToast('Download started', 'Your image download has begun.', 'success');
  }

  function shareImage(image) {
    const url = `${window.location.origin}${window.location.pathname.replace(/[^/]+$/, '')}image-details.html?id=${image.id}`;
    if (navigator.share) {
      navigator.share({ title: image.title, text: image.description, url }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(url);
      showToast('Link copied', 'Share link copied to clipboard.', 'success');
    }
  }

  function animateCounter(element, target, duration = 1500) {
    const start = 0;
    const startTime = performance.now();
    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      element.textContent = Math.floor(start + (target - start) * eased);
      if (progress < 1) requestAnimationFrame(update);
      else element.textContent = target;
    }
    requestAnimationFrame(update);
  }

  function seedDemoNotifications() {
    const existing = getNotifications();
    if (existing.length > 0) return;
    addNotification('upload', 'Welcome to GalleryHub', 'Your premium image gallery is ready to explore.');
    addNotification('favorite', 'Tip: Save Favorites', 'Click the heart icon on any image to save it.');
    addNotification('collection', 'Create Collections', 'Organize your favorites into custom collections.');
  }

  function init() {
    initParticles();
    initScrollReveal();
    initMobileNav();
    setActiveNav();
    initOfflineDetection();
    initKeyboardShortcuts();
    seedDemoNotifications();
    updateNotificationBadge();

    if (!document.getElementById('toast-container')) {
      createToastContainer();
    }
  }

  document.addEventListener('DOMContentLoaded', init);

  return {
    STORAGE_KEYS,
    CATEGORIES,
    CATEGORY_LABELS,
    getImages,
    saveImages,
    getImageById,
    addImage,
    incrementViews,
    incrementDownloads,
    getFavorites,
    toggleFavorite,
    isFavorite,
    getCollections,
    saveCollections,
    createCollection,
    getSettings,
    saveSettings,
    getAnalytics,
    trackAnalytics,
    trackCategoryView,
    getNotifications,
    addNotification,
    getUploadHistory,
    addUploadHistory,
    getRecentSearches,
    addRecentSearch,
    getRating,
    setRating,
    getCategoryCount,
    filterImages,
    showToast,
    escapeHtml,
    formatNumber,
    formatDate,
    timeAgo,
    downloadImage,
    shareImage,
    animateCounter,
    updateNotificationBadge
  };
})();

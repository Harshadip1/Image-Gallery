/**
 * Favorites and collections management
 */
const Favorites = (() => {
  function initFavoritesPage() {
    Gallery.initPage({
      gridSelector: '#gallery-grid',
      tabsSelector: '#category-tabs',
      favoritesOnly: true
    });
  }

  function renderCollections() {
    const container = document.getElementById('collections-grid');
    if (!container) return;

    const collections = GalleryApp.getCollections();
    const images = GalleryApp.getImages();

    if (!collections.length) {
      container.innerHTML = `
        <div class="empty-state" style="grid-column: 1/-1;">
          <div class="empty-state-icon">📁</div>
          <h3>No collections yet</h3>
          <p>Create a collection to organize your favorite images.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = collections.map(col => {
      const colImages = col.imageIds.map(id => images.find(i => i.id === id)).filter(Boolean);
      const previews = colImages.slice(0, 3);
      while (previews.length < 3) {
        previews.push(images[previews.length % images.length]);
      }

      return `
        <div class="collection-card glass-card" data-collection="${col.id}">
          <div class="collection-preview">
            ${previews.map(img => `<img src="${img?.thumbUrl || img?.url}" alt="" loading="lazy" />`).join('')}
          </div>
          <div class="collection-info">
            <h3>${GalleryApp.escapeHtml(col.name)}</h3>
            <p>${col.imageIds.length} images · ${GalleryApp.formatDate(col.createdAt)}</p>
          </div>
        </div>
      `;
    }).join('');
  }

  function initCollectionsPage() {
    renderCollections();

    document.getElementById('create-collection-btn')?.addEventListener('click', () => {
      const name = prompt('Collection name:');
      if (name?.trim()) {
        const favs = GalleryApp.getFavorites();
        GalleryApp.createCollection(name.trim(), favs.slice(0, 6));
        renderCollections();
      }
    });
  }

  function initBookmarks() {
    const container = document.getElementById('bookmark-folders');
    if (!container) return;

    const folders = [
      { id: 'inspiration', name: 'Inspiration', icon: '✨' },
      { id: 'wallpapers', name: 'Wallpapers', icon: '🖥' },
      { id: 'references', name: 'References', icon: '📌' },
      { id: 'projects', name: 'Projects', icon: '📂' }
    ];

    container.innerHTML = folders.map(f => `
      <div class="bookmark-folder" data-folder="${f.id}">
        <span>${f.icon}</span>
        <span>${f.name}</span>
      </div>
    `).join('');
  }

  document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('favorites.html')) initFavoritesPage();
    if (window.location.pathname.includes('collections.html')) initCollectionsPage();
    initBookmarks();
  });

  return { initFavoritesPage, renderCollections, initCollectionsPage };
})();

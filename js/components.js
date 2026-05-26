/**
 * Shared header/footer injection
 */
function getHeader(activePage = '') {
  const pages = [
    { href: 'index.html', label: 'Home' },
    { href: 'trending.html', label: 'Trending' },
    { href: 'categories.html', label: 'Categories' },
    { href: 'upload.html', label: 'Upload' },
    { href: 'favorites.html', label: 'Favorites' },
    { href: 'collections.html', label: 'Collections' },
    { href: 'analytics.html', label: 'Analytics' }
  ];

  const navLinks = pages.map(p =>
    `<a href="${p.href}" class="nav-link ${activePage === p.href ? 'active' : ''}">${p.label}</a>`
  ).join('');

  const mobileLinks = pages.map(p =>
    `<a href="${p.href}" class="nav-link">${p.label}</a>`
  ).join('');

  return `
    <div id="offline-banner" class="offline-banner">You are offline — cached content available</div>
    <header class="site-header">
      <div class="container header-inner">
        <a href="index.html" class="logo">
          <span class="logo-icon">◈</span>
          <span>Gallery<span class="text-gradient">Hub</span></span>
        </a>
        <nav class="nav-main">${navLinks}</nav>
        <div class="search-wrapper">
          <span class="search-icon">🔍</span>
          <input type="search" class="search-input" placeholder="Search images, tags..." data-search-input aria-label="Search" />
          <div class="search-suggestions"></div>
          <button class="search-voice-btn" data-voice-search title="Voice search" aria-label="Voice search">🎤</button>
        </div>
        <div class="header-actions">
          <button class="btn btn-ghost btn-icon" data-theme-toggle title="Toggle theme" aria-label="Toggle theme">🌙</button>
          <a href="notifications.html" class="btn btn-ghost btn-icon" title="Notifications" aria-label="Notifications" style="position:relative">
            🔔
            <span class="badge" data-notification-badge style="display:none;position:absolute;top:2px;right:2px;font-size:0.65rem"></span>
          </a>
          <a href="upload.html" class="btn btn-primary btn-sm">+ Upload</a>
          <a href="profile.html" class="btn btn-ghost btn-icon" title="Profile" aria-label="Profile">👤</a>
          <button class="mobile-menu-btn" aria-label="Menu"><span></span><span></span><span></span></button>
        </div>
      </div>
      <nav class="mobile-nav">${mobileLinks}
        <a href="profile.html" class="nav-link">Profile</a>
        <a href="settings.html" class="nav-link">Settings</a>
        <a href="about.html" class="nav-link">About</a>
        <a href="contact.html" class="nav-link">Contact</a>
      </nav>
    </header>
  `;
}

function getFooter() {
  return `
    <footer class="site-footer">
      <div class="container">
        <div class="footer-grid">
          <div class="footer-col">
            <h4>Explore</h4>
            <a href="index.html">Home Gallery</a>
            <a href="trending.html">Trending</a>
            <a href="categories.html">Categories</a>
            <a href="search.html">Search</a>
          </div>
          <div class="footer-col">
            <h4>Library</h4>
            <a href="favorites.html">Favorites</a>
            <a href="collections.html">Collections</a>
            <a href="upload.html">Upload</a>
            <a href="slideshow.html">Slideshow</a>
          </div>
          <div class="footer-col">
            <h4>Platform</h4>
            <a href="analytics.html">Analytics</a>
            <a href="settings.html">Settings</a>
            <a href="about.html">About</a>
            <a href="contact.html">Contact</a>
          </div>
          <div class="footer-col">
            <h4>Features</h4>
            <a href="settings.html">Themes</a>
            <a href="#" onclick="document.getElementById('shortcuts-modal')?.classList.add('active');return false">Keyboard Shortcuts</a>
            <a href="slideshow.html">Wallpaper Mode</a>
          </div>
        </div>
        <div class="footer-bottom">
          <p>Premium Image Gallery Platform · Built with HTML, CSS & JavaScript</p>
        </div>
      </div>
    </footer>
  `;
}

function getShortcutsModal() {
  return `
    <div id="shortcuts-modal" class="modal-overlay">
      <div class="modal">
        <div class="modal-header">
          <h3>Keyboard Shortcuts</h3>
          <button class="btn btn-ghost" data-close-modal aria-label="Close">×</button>
        </div>
        <div class="modal-body">
          <div class="shortcut-row"><span>Open lightbox</span><span class="shortcut-key"><kbd>Click</kbd> image</span></div>
          <div class="shortcut-row"><span>Navigate lightbox</span><span class="shortcut-key"><kbd>←</kbd><kbd>→</kbd></span></div>
          <div class="shortcut-row"><span>Close lightbox</span><span class="shortcut-key"><kbd>Esc</kbd></span></div>
          <div class="shortcut-row"><span>Zoom in/out</span><span class="shortcut-key"><kbd>+</kbd><kbd>-</kbd></span></div>
          <div class="shortcut-row"><span>Fullscreen</span><span class="shortcut-key"><kbd>F</kbd></span></div>
          <div class="shortcut-row"><span>Toggle details</span><span class="shortcut-key"><kbd>I</kbd></span></div>
          <div class="shortcut-row"><span>Show shortcuts</span><span class="shortcut-key"><kbd>?</kbd></span></div>
          <div class="shortcut-row"><span>Slideshow play/pause</span><span class="shortcut-key"><kbd>Space</kbd></span></div>
        </div>
      </div>
    </div>
  `;
}

function injectLayout(activePage) {
  const headerEl = document.getElementById('site-header');
  const footerEl = document.getElementById('site-footer');
  const modalEl = document.getElementById('site-modals');
  if (headerEl) headerEl.innerHTML = getHeader(activePage);
  if (footerEl) footerEl.innerHTML = getFooter();
  if (modalEl) modalEl.innerHTML = getShortcutsModal();
}

document.addEventListener('DOMContentLoaded', () => {
  const page = window.location.pathname.split('/').pop() || 'index.html';
  injectLayout(page);
  Search?.initSearchInputs?.();
});

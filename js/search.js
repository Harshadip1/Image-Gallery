/**
 * Search functionality with suggestions and voice UI
 */
const Search = (() => {
  function initSearchInputs() {
    document.querySelectorAll('[data-search-input]').forEach(input => {
      const wrapper = input.closest('.search-wrapper');
      const suggestions = wrapper?.querySelector('.search-suggestions');
      let debounceTimer;

      input.addEventListener('input', () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => showSuggestions(input, suggestions), 200);
      });

      input.addEventListener('focus', () => showSuggestions(input, suggestions));

      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          performSearch(input.value.trim());
        }
      });

      document.addEventListener('click', (e) => {
        if (!wrapper?.contains(e.target)) {
          suggestions?.classList.remove('active');
        }
      });
    });

    document.querySelectorAll('[data-voice-search]').forEach(btn => {
      btn.addEventListener('click', () => startVoiceSearch(btn));
    });
  }

  function showSuggestions(input, container) {
    if (!container) return;
    const query = input.value.trim().toLowerCase();
    const images = GalleryApp.getImages();
    const recent = GalleryApp.getRecentSearches();

    let matches = [];
    if (query) {
      const titles = new Set();
      images.forEach(img => {
        if (img.title.toLowerCase().includes(query)) titles.add(img.title);
        (img.tags || []).forEach(tag => {
          if (tag.toLowerCase().includes(query)) titles.add(tag);
        });
      });
      matches = [...titles].slice(0, 6);
    }

    let html = '';
    if (!query && recent.length) {
      html += `<div class="recent-searches-label">Recent Searches</div>`;
      recent.forEach(term => {
        html += `<div class="search-suggestion-item" data-search-term="${GalleryApp.escapeHtml(term)}">
          <span>🕐</span> ${GalleryApp.escapeHtml(term)}
        </div>`;
      });
    }

    matches.forEach(term => {
      html += `<div class="search-suggestion-item" data-search-term="${GalleryApp.escapeHtml(term)}">
        <span>🔍</span> ${GalleryApp.escapeHtml(term)}
      </div>`;
    });

    if (!html) {
      container.classList.remove('active');
      return;
    }

    container.innerHTML = html;
    container.classList.add('active');

    container.querySelectorAll('[data-search-term]').forEach(item => {
      item.addEventListener('click', () => {
        input.value = item.dataset.searchTerm;
        performSearch(item.dataset.searchTerm);
        container.classList.remove('active');
      });
    });
  }

  function performSearch(query) {
    if (!query) return;
    GalleryApp.addRecentSearch(query);
    const params = new URLSearchParams({ q: query });
    window.location.href = `search.html?${params.toString()}`;
  }

  function startVoiceSearch(btn) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      GalleryApp.showToast('Voice search unavailable', 'Your browser does not support voice search.', 'warning');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;

    btn.classList.add('listening');
    recognition.start();

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      const input = btn.closest('.search-wrapper')?.querySelector('input') ||
                    document.querySelector('[data-search-input]');
      if (input) input.value = transcript;
      performSearch(transcript);
    };

    recognition.onerror = () => {
      GalleryApp.showToast('Voice search failed', 'Please try again or type your search.', 'error');
    };

    recognition.onend = () => btn.classList.remove('listening');
  }

  function initSearchResultsPage() {
    const params = new URLSearchParams(window.location.search);
    const query = params.get('q') || '';
    const header = document.getElementById('search-results-header');
    const grid = document.querySelector('#gallery-grid');

    if (header) {
      const results = GalleryApp.filterImages({ search: query });
      header.innerHTML = `
        <h1>Search Results</h1>
        <p class="search-results-count">${results.length} results for "<strong>${GalleryApp.escapeHtml(query)}</strong>"</p>
      `;
    }

    const searchInput = document.querySelector('[data-search-input]');
    if (searchInput) searchInput.value = query;

    if (grid) {
      Gallery.renderGrid(grid, GalleryApp.filterImages({ search: query }));
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    initSearchInputs();
    if (window.location.pathname.includes('search.html')) {
      initSearchResultsPage();
    }
  });

  return { performSearch, initSearchInputs, initSearchResultsPage };
})();

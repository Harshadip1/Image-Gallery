/**
 * Analytics dashboard with charts and counters
 */
const Analytics = (() => {
  const CHART_COLORS = ['#7C3AED', '#06B6D4', '#22C55E', '#F59E0B', '#EC4899', '#3B82F6', '#EF4444', '#8B5CF6', '#14B8A6', '#F97316'];

  function init() {
    if (!document.getElementById('analytics-dashboard')) return;
    renderStats();
    renderBarChart();
    renderPieChart();
    renderProgressWidgets();
    renderActivityTimeline();
  }

  function renderStats() {
    const images = GalleryApp.getImages();
    const favorites = GalleryApp.getFavorites();
    const analytics = GalleryApp.getAnalytics();
    const uploads = images.filter(i => i.url?.startsWith('data:')).length + (analytics.uploads || 0);

    const stats = [
      { label: 'Total Images', value: images.length, icon: '🖼', color: 'rgba(124,58,237,0.2)' },
      { label: 'Favorites', value: favorites.length, icon: '♥', color: 'rgba(239,68,68,0.2)' },
      { label: 'Uploads', value: uploads, icon: '↑', color: 'rgba(34,197,94,0.2)' },
      { label: 'Downloads', value: analytics.downloads || images.reduce((s, i) => s + (i.downloads || 0), 0), icon: '↓', color: 'rgba(6,182,212,0.2)' }
    ];

    const container = document.getElementById('analytics-stats');
    if (!container) return;

    container.innerHTML = stats.map(s => `
      <div class="stat-card glass-card reveal">
        <div class="stat-card-icon" style="background:${s.color}">${s.icon}</div>
        <div class="stat-card-value" data-counter="${s.value}">0</div>
        <div class="stat-card-label">${s.label}</div>
      </div>
    `).join('');

    container.querySelectorAll('[data-counter]').forEach(el => {
      GalleryApp.animateCounter(el, parseInt(el.dataset.counter, 10));
    });
  }

  function renderBarChart() {
    const container = document.getElementById('bar-chart');
    if (!container) return;

    const analytics = GalleryApp.getAnalytics();
    const categoryViews = analytics.categoryViews || {};
    const images = GalleryApp.getImages();

    const cats = GalleryApp.CATEGORIES.filter(c => c !== 'all').slice(0, 7);
    const data = cats.map(cat => ({
      label: GalleryApp.CATEGORY_LABELS[cat],
      value: categoryViews[cat] || images.filter(i => i.category === cat).length
    }));
    const max = Math.max(...data.map(d => d.value), 1);

    container.innerHTML = `
      <div class="bar-chart">
        ${data.map(d => `
          <div class="bar-chart-item">
            <div class="bar-chart-bar-wrap">
              <div class="bar-chart-bar" style="height: ${(d.value / max) * 100}%"></div>
            </div>
            <span class="bar-chart-label">${d.label}</span>
          </div>
        `).join('')}
      </div>
    `;
  }

  function renderPieChart() {
    const container = document.getElementById('pie-chart');
    const legend = document.getElementById('pie-legend');
    if (!container) return;

    const images = GalleryApp.getImages();
    const cats = GalleryApp.CATEGORIES.filter(c => c !== 'all').slice(0, 6);
    const data = cats.map(cat => ({
      label: GalleryApp.CATEGORY_LABELS[cat],
      value: images.filter(i => i.category === cat).length
    }));
    const total = data.reduce((s, d) => s + d.value, 0) || 1;

    let gradientParts = [];
    let currentDeg = 0;
    data.forEach((d, i) => {
      const pct = (d.value / total) * 100;
      const endDeg = currentDeg + (pct * 3.6);
      gradientParts.push(`${CHART_COLORS[i % CHART_COLORS.length]} ${currentDeg}deg ${endDeg}deg`);
      currentDeg = endDeg;
    });

    container.style.background = `conic-gradient(${gradientParts.join(', ')})`;

    if (legend) {
      legend.innerHTML = data.map((d, i) => `
        <div class="pie-legend-item">
          <span class="pie-legend-color" style="background:${CHART_COLORS[i]}"></span>
          ${d.label} (${d.value})
        </div>
      `).join('');
    }
  }

  function renderProgressWidgets() {
    const container = document.getElementById('progress-widgets');
    if (!container) return;

    const images = GalleryApp.getImages();
    const totalViews = images.reduce((s, i) => s + (i.views || 0), 0);
    const maxViews = Math.max(...images.map(i => i.views || 0), 1);

    const topCategories = GalleryApp.CATEGORIES.filter(c => c !== 'all')
      .map(cat => ({ cat, count: images.filter(i => i.category === cat).length }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 4);

    container.innerHTML = topCategories.map(item => {
      const pct = Math.round((item.count / images.length) * 100) || 0;
      return `
        <div class="progress-widget">
          <div class="progress-widget-header">
            <span>${GalleryApp.CATEGORY_LABELS[item.cat]}</span>
            <span>${pct}%</span>
          </div>
          <div class="progress-widget-bar">
            <div class="progress-widget-fill" style="width: ${pct}%"></div>
          </div>
        </div>
      `;
    }).join('') + `
      <div class="progress-widget mt-2">
        <div class="progress-widget-header">
          <span>Gallery Engagement</span>
          <span>${GalleryApp.formatNumber(totalViews)} views</span>
        </div>
        <div class="progress-widget-bar">
          <div class="progress-widget-fill" style="width: ${Math.min(100, (totalViews / (maxViews * images.length)) * 100)}%"></div>
        </div>
      </div>
    `;
  }

  function renderActivityTimeline() {
    const container = document.getElementById('activity-timeline');
    if (!container) return;

    const analytics = GalleryApp.getAnalytics();
    const activities = [
      { text: 'Gallery viewed', time: 'Just now' },
      { text: `${analytics.uploads || 0} images uploaded`, time: 'This week' },
      { text: `${analytics.downloads || 0} downloads completed`, time: 'This week' },
      { text: `${GalleryApp.getFavorites().length} favorites saved`, time: 'All time' },
      { text: 'Analytics dashboard accessed', time: 'Today' }
    ];

    container.innerHTML = activities.map(a => `
      <div class="timeline-item">
        <div class="timeline-dot"></div>
        <div class="timeline-content">
          <div>${a.text}</div>
          <div class="timeline-time">${a.time}</div>
        </div>
      </div>
    `).join('');
  }

  document.addEventListener('DOMContentLoaded', init);

  return { init };
})();

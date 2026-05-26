/**
 * Image upload system with drag & drop
 */
const Upload = (() => {
  const MAX_SIZE = 5 * 1024 * 1024;
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

  function init() {
    const zone = document.getElementById('upload-zone');
    const input = document.getElementById('file-input');
    if (!zone || !input) return;

    zone.addEventListener('click', () => input.click());
    zone.addEventListener('dragover', (e) => {
      e.preventDefault();
      zone.classList.add('dragover');
    });
    zone.addEventListener('dragleave', () => zone.classList.remove('dragover'));
    zone.addEventListener('drop', (e) => {
      e.preventDefault();
      zone.classList.remove('dragover');
      handleFiles(e.dataTransfer.files);
    });

    input.addEventListener('change', () => handleFiles(input.files));

    document.getElementById('upload-form')?.addEventListener('submit', handleSubmit);
    renderUploadHistory();
  }

  let pendingFiles = [];

  function handleFiles(files) {
    const preview = document.getElementById('upload-preview');
    if (!preview) return;

    Array.from(files).forEach(file => {
      if (!ALLOWED_TYPES.includes(file.type)) {
        GalleryApp.showToast('Invalid file', `${file.name} is not a supported image format.`, 'error');
        return;
      }
      if (file.size > MAX_SIZE) {
        GalleryApp.showToast('File too large', `${file.name} exceeds 5MB limit.`, 'error');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        pendingFiles.push({ file, dataUrl: e.target.result });
        renderPreviews();
      };
      reader.readAsDataURL(file);
    });
  }

  function renderPreviews() {
    const preview = document.getElementById('upload-preview');
    if (!preview) return;

    preview.innerHTML = pendingFiles.map((item, i) => `
      <div class="upload-preview-item">
        <img src="${item.dataUrl}" alt="Preview" />
        <button class="btn btn-ghost btn-sm" style="position:absolute;top:4px;right:4px" data-remove="${i}">×</button>
      </div>
    `).join('');

    preview.querySelectorAll('[data-remove]').forEach(btn => {
      btn.addEventListener('click', () => {
        pendingFiles.splice(parseInt(btn.dataset.remove, 10), 1);
        renderPreviews();
      });
    });
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (pendingFiles.length === 0) {
      GalleryApp.showToast('No images selected', 'Please add images to upload.', 'warning');
      return;
    }

    const title = document.getElementById('upload-title')?.value || 'Untitled';
    const category = document.getElementById('upload-category')?.value || 'abstract';
    const tagsInput = document.getElementById('upload-tags')?.value || '';
    const tags = tagsInput.split(',').map(t => t.trim()).filter(Boolean);
    const progressBar = document.querySelector('.upload-progress-bar');
    const progressWrap = document.querySelector('.upload-progress');

    progressWrap?.classList.remove('sr-only');
    let progress = 0;

    const interval = setInterval(() => {
      progress += 10;
      if (progressBar) progressBar.style.width = `${progress}%`;
      if (progress >= 100) {
        clearInterval(interval);
        completeUpload(title, category, tags);
      }
    }, 150);
  }

  function completeUpload(title, category, tags) {
    pendingFiles.forEach((item, i) => {
      const image = GalleryApp.addImage({
        title: pendingFiles.length > 1 ? `${title} ${i + 1}` : title,
        category,
        tags: tags.length ? tags : [category],
        url: item.dataUrl,
        thumbUrl: item.dataUrl,
        description: `Uploaded image in ${category} category.`,
        author: 'Contributor'
      });

      GalleryApp.addUploadHistory({
        id: image.id,
        title: image.title,
        thumbUrl: image.thumbUrl,
        status: 'completed',
        date: new Date().toISOString()
      });
    });

    const analytics = GalleryApp.getAnalytics();
    analytics.uploads = (analytics.uploads || 0) + pendingFiles.length;
    localStorage.setItem(GalleryApp.STORAGE_KEYS.analytics, JSON.stringify(analytics));

    GalleryApp.addNotification('upload', 'Upload Complete', `${pendingFiles.length} image(s) uploaded successfully.`);
    GalleryApp.showToast('Upload successful', `${pendingFiles.length} image(s) added to gallery.`, 'success');

    pendingFiles = [];
    document.getElementById('upload-form')?.reset();
    document.getElementById('upload-preview').innerHTML = '';
    document.querySelector('.upload-progress-bar').style.width = '0%';

    const successAnim = document.getElementById('upload-success');
    if (successAnim) {
      successAnim.classList.add('active');
      setTimeout(() => successAnim.classList.remove('active'), 2000);
    }

    renderUploadHistory();
    GalleryApp.trackAnalytics('uploads');
  }

  function renderUploadHistory() {
    const container = document.getElementById('upload-history-list');
    if (!container) return;

    const history = GalleryApp.getUploadHistory();
    if (!history.length) {
      container.innerHTML = '<p class="text-center" style="color:var(--text-muted)">No uploads yet</p>';
      return;
    }

    container.innerHTML = history.map(item => `
      <div class="upload-history-item">
        <img src="${item.thumbUrl}" alt="" />
        <div>
          <strong>${GalleryApp.escapeHtml(item.title)}</strong>
          <div style="font-size:0.8rem;color:var(--text-muted)">${GalleryApp.formatDate(item.date)}</div>
        </div>
        <span class="status">✓ ${item.status}</span>
      </div>
    `).join('');
  }

  document.addEventListener('DOMContentLoaded', init);

  return { init, handleFiles };
})();

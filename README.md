# GalleryHub — Premium Image Gallery Platform

A modern, futuristic image gallery web application built with **HTML5**, **CSS3**, and **Vanilla JavaScript**. Explore curated photography, upload images, manage favorites, and enjoy a production-ready gallery experience inspired by platforms like Pinterest, Unsplash, and Google Photos.

---

## Project Information

| | |
|---|---|
| **Project Name** | GalleryHub |
| **Type** | Frontend Image Gallery Platform |
| **Stack** | HTML5, CSS3, Vanilla JavaScript |
| **Storage** | Browser LocalStorage |
| **License** | Open source — free to use and modify |

---

## Features

### Core Gallery
- Responsive **masonry grid** layout
- **Infinite scroll** with Intersection Observer
- **Lazy loading** images
- Hover zoom effects and floating cards
- **Category filtering** (10 categories)
- **Advanced search** by title, tags, and category

### Viewing Experience
- Fullscreen **lightbox** with zoom, navigation, and sidebar details
- **Keyboard shortcuts** (`←` `→` `Esc` `+` `-` `F` `I` `?`)
- **Slideshow mode** with Ken Burns effect, timer, and play/pause
- Single **image details** page with mini editor and color palette UI

### User Features
- **Favorites** system with LocalStorage persistence
- **Collections** and bookmark folders
- **Drag & drop upload** with preview and progress bar
- **Download** and **share** functionality
- **Image rating** (1–5 stars)

### Dashboard & UI
- **Analytics dashboard** with animated counters, bar chart, pie chart, and activity timeline
- **Toast notifications** for uploads, downloads, favorites
- **Dark / light themes** with accent color options
- **Multi-language UI** selector
- Glassmorphism design, animated gradients, particle backgrounds
- Fully **responsive** (mobile, tablet, desktop)

### Advanced UI
- AI image suggestion chips
- Voice search UI (Web Speech API where supported)
- Community gallery feed
- Offline detection banner
- Wallpaper mode toggle

---

## Technologies Used

- **HTML5** — Semantic markup, accessibility attributes
- **CSS3** — CSS Variables, Flexbox, Grid, Masonry columns, animations, glassmorphism
- **JavaScript (ES6+)** — Modules pattern, LocalStorage, Intersection Observer, FileReader API
- **Picsum Photos** — Sample image placeholders (requires internet on first load)

---

## Folder Structure

```
Image Gallery/
├── index.html              # Home gallery page
├── trending.html           # Trending images
├── categories.html         # Category browser
├── upload.html             # Image upload
├── favorites.html          # Saved favorites
├── collections.html        # Image collections
├── image-details.html      # Single image view
├── slideshow.html          # Fullscreen slideshow
├── search.html             # Search results
├── profile.html            # User profile
├── settings.html           # App settings
├── about.html              # About page
├── contact.html            # Contact form
├── notifications.html      # Notification center
├── analytics.html          # Analytics dashboard
├── README.md
├── css/
│   ├── style.css           # Core styles & layout
│   ├── gallery.css         # Gallery, lightbox, slideshow
│   ├── themes.css          # Theme variations
│   └── responsive.css      # Media queries & charts
├── js/
│   ├── app.js              # Core data store & utilities
│   ├── components.js       # Shared header/footer
│   ├── gallery.js          # Masonry & infinite scroll
│   ├── lightbox.js         # Lightbox viewer
│   ├── search.js           # Search & voice UI
│   ├── upload.js           # Upload system
│   ├── favorites.js        # Favorites & collections
│   ├── analytics.js        # Dashboard charts
│   └── themes.js           # Themes & slideshow
└── assets/
    ├── images/             # Static image assets
    └── uploads/            # Local upload destination
```

---

## How to Run the Project in VS Code

### Step 1: Install Visual Studio Code

1. Download Visual Studio Code from [https://code.visualstudio.com/](https://code.visualstudio.com/)
2. Run the installer and follow the setup wizard
3. Launch VS Code after installation

### Step 2: Open the Project Folder

1. Open VS Code
2. Go to **File → Open Folder**
3. Select the `Image Gallery` project folder
4. Click **Select Folder**

### Step 3: Install Live Server Extension

1. Click the **Extensions** icon in the left sidebar (or press `Ctrl+Shift+X`)
2. Search for **Live Server**
3. Install the extension by **Ritwick Dey**

### Step 4: Launch the Application

1. In the Explorer panel, locate `index.html`
2. **Right-click** on `index.html`
3. Select **"Open with Live Server"**
4. Your default browser will open at `http://127.0.0.1:5500` (port may vary)

### Alternative: Open Without Live Server

You can also open `index.html` directly in a browser, but some features work best with a local server due to CORS policies for external images.

---

## Usage Guide

### Browsing Images
- Visit the **Home** page to explore the full masonry gallery
- Use **category tabs** to filter by theme (Nature, Technology, etc.)
- Click any image to open the **lightbox viewer**

### Searching
- Use the search bar in the header on any page
- Press **Enter** or select a suggestion to view results
- Click the **microphone** icon for voice search (Chrome/Edge)

### Uploading Images
1. Go to **Upload** page
2. Drag & drop images or click to browse
3. Add title, category, and tags
4. Click **Upload Images**
5. Uploaded images are stored in LocalStorage as base64

### Favorites & Collections
- Click **♥** on any image card to save to favorites
- Visit **Favorites** to view saved images
- On **Collections**, click **+ New Collection** to organize images

### Slideshow
- Click **Slideshow** from the home page or image details
- Use **Space** to play/pause, **←** **→** to navigate
- Toggle Ken Burns effect in **Settings**

### Themes
- Click the **moon/sun** icon in the header to toggle dark/light mode
- Visit **Settings** for accent colors, language, and accessibility options

### Keyboard Shortcuts
Press **?** anywhere to view all keyboard shortcuts.

---

## LocalStorage Usage

The app persists data in the browser:

| Key | Purpose |
|-----|---------|
| `gallery_images` | All gallery images (sample + uploads) |
| `gallery_favorites` | Favorite image IDs |
| `gallery_collections` | User-created collections |
| `gallery_recent_searches` | Recent search queries |
| `gallery_settings` | Theme and preferences |
| `gallery_analytics` | Usage statistics |
| `gallery_notifications` | Notification history |
| `gallery_upload_history` | Upload log |
| `gallery_ratings` | Image star ratings |

To reset the gallery, open browser DevTools → **Application** → **Local Storage** → clear keys or run:

```javascript
localStorage.clear();
location.reload();
```

---

## Theme Customization

Edit CSS variables in `css/style.css`:

```css
:root {
  --bg-primary: #0F172A;
  --primary: #7C3AED;
  --accent: #06B6D4;
  --success: #22C55E;
  --text-primary: #F8FAFC;
}
```

Or use the in-app **Settings** page to switch themes without editing code.

---

## Browser Compatibility

| Browser | Support |
|---------|---------|
| Chrome 90+ | Full support |
| Firefox 88+ | Full support |
| Edge 90+ | Full support |
| Safari 14+ | Full support (voice search may vary) |

**Requirements:**
- JavaScript enabled
- LocalStorage enabled
- Internet connection for sample images (Picsum Photos)

---

## Performance Optimization

- Images use `loading="lazy"` attribute
- Infinite scroll loads 12 images per batch
- CSS animations respect `prefers-reduced-motion`
- Efficient DOM updates (no full re-render on append)
- Intersection Observer for scroll reveal and infinite load

---

## Troubleshooting

### Images not loading
- Ensure you have an **internet connection** (sample images load from picsum.photos)
- Check if an ad blocker is blocking external images

### Upload not working
- Maximum file size is **5MB**
- Supported formats: JPG, PNG, GIF, WebP
- Clear LocalStorage if storage quota is exceeded

### Live Server not starting
- Ensure port 5500 is not in use
- Try restarting VS Code
- Reinstall the Live Server extension

### Voice search unavailable
- Voice search requires HTTPS or localhost
- Supported primarily in Chrome and Edge

### Styles look broken
- Verify all CSS files are in the `css/` folder
- Hard refresh with `Ctrl+Shift+R`

---

## Pages Overview

| Page | URL | Description |
|------|-----|-------------|
| Home | `index.html` | Hero, featured, trending, gallery |
| Trending | `trending.html` | Popular images |
| Categories | `categories.html` | Browse by category |
| Upload | `upload.html` | Drag & drop upload |
| Favorites | `favorites.html` | Saved images |
| Collections | `collections.html` | Organized galleries |
| Image Details | `image-details.html?id=1` | Single image view |
| Slideshow | `slideshow.html` | Auto slideshow |
| Search | `search.html?q=query` | Search results |
| Profile | `profile.html` | User profile |
| Settings | `settings.html` | Preferences |
| Analytics | `analytics.html` | Dashboard |
| Notifications | `notifications.html` | Alerts |
| About | `about.html` | Platform info |
| Contact | `contact.html` | Contact form |

---

## Deployment

This is a static site — deploy to any static host:

- **GitHub Pages**
- **Netlify**
- **Vercel**
- **Cloudflare Pages**

Upload all project files maintaining the folder structure. No build step required.

---

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

Built with modern web standards for a premium gallery experience.

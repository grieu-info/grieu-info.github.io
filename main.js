/* ==========================================================================
   main.js
   1. LABS: the project data (edit this to add or change a card)
   2. Rendering of the projects, the AOI locator and the no-image fallback
   3. Category filters
   4. Theme toggle
   5. GoatCounter events, footer year
   ========================================================================== */

/* ---------- 1. Data ------------------------------------------------------

   Each entry renders one project in the Labs section, in array order. Field reference:

   id           Short unique slug. Used in analytics event names.
   title        Card title.
   categories   One or more values from CATEGORIES below.
   description  About two lines of text.
   tags         Stack tags, shown as a list.
   links        [{ label, url, kind }]. kind is "repo", "notebook" or "demo".
                Links with a url of "#" (or empty) are not shown.
   media        null, or { type: "image" | "video", src, alt, poster? }.
                Images: .webp in assets/imgs/. Videos: short muted .mp4 loops.
                null (or a file that fails to load) shows the fallback frame.

   Map-style caption — every field is optional; the caption disappears when all are empty:
   sensor       e.g. "Sentinel-2 L2A"
   date         Acquisition date, e.g. "2023-07-14"
   area         e.g. "Landes, France"
   attribution  e.g. "Contains modified Copernicus Sentinel data (2023)"

   bbox         Optional area of interest [west, south, east, north] in WGS84 degrees.
                Draws a small locator on the image, or a faint graticule when there is no image.
*/

const CATEGORIES = [
  'Computer vision',
  'Foundation models',
  'STAC & platforms',
  'SAR',
  'Teaching',
];

const LABS = [
  {
    id: 'vhr-yolo-sam',
    title: 'Object detection and segmentation on VHR imagery',
    categories: ['Computer vision'],
    description: 'Oriented YOLO detections used as prompts for SAM on very-high-resolution aerial imagery, from bounding boxes to clean vector footprints.',
    tags: ['Python', 'YOLO (OBB)', 'SAM', 'PyTorch', 'GeoPandas'],
    links: [
      { label: 'Repo', url: '#', kind: 'repo' },
      { label: 'Notebook', url: '#', kind: 'notebook' },
    ],
    media: null,
    sensor: 'Aerial orthophoto, 20 cm',
    date: '',
    area: 'Toulouse, France',
    attribution: '',
    bbox: [1.35, 43.55, 1.50, 43.65],
  },
  {
    id: 'embeddings-similarity',
    title: 'Similarity search with Clay / TerraMind embeddings',
    categories: ['Foundation models'],
    description: 'Embed Sentinel-2 chips with geospatial foundation models, index the vectors, then query by example: pick a patch, find its look-alikes across a region.',
    tags: ['Python', 'Clay', 'TerraMind', 'Embeddings', 'Vector search'],
    links: [
      { label: 'Repo', url: '#', kind: 'repo' },
      { label: 'Demo', url: '#', kind: 'demo' },
    ],
    media: null,
    sensor: 'Sentinel-2 L2A',
    date: '2024-06',
    area: 'Occitanie, France',
    attribution: 'Contains modified Copernicus Sentinel data (2024)',
    bbox: [-0.33, 42.33, 4.85, 45.05],
  },
  {
    id: 's1-clear-cuts',
    title: 'Clear-cut detection with Sentinel-1',
    categories: ['SAR'],
    description: 'Detect forest clear-cuts from Sentinel-1 backscatter time series, with change detection that keeps working under cloud cover.',
    tags: ['Python', 'xarray', 'SAR', 'Change detection'],
    links: [
      { label: 'Repo', url: '#', kind: 'repo' },
      { label: 'Notebook', url: '#', kind: 'notebook' },
    ],
    media: null,
    sensor: 'Sentinel-1 GRD (VV/VH)',
    date: '2023-07-14',
    area: 'Landes, France',
    attribution: 'Contains modified Copernicus Sentinel data (2023)',
    bbox: [-1.45, 43.6, -0.1, 44.55],
  },
  {
    id: 'stac-compose',
    title: 'Deployable STAC catalog with Docker Compose',
    categories: ['STAC & platforms'],
    description: 'pgSTAC, the STAC API, TiTiler and STAC Browser wired together in a single Compose file: a working catalog on one VM.',
    tags: ['Docker Compose', 'pgSTAC', 'stac-fastapi', 'TiTiler', 'STAC Browser'],
    links: [
      { label: 'Repo', url: '#', kind: 'repo' },
    ],
    media: null,
    sensor: '',
    date: '',
    area: '',
    attribution: '',
    bbox: null,
  },
  {
    id: 'openeo-cdse',
    title: 'openEO processing chain on Copernicus Data Space Ecosystem',
    categories: ['STAC & platforms'],
    description: 'A chain written once with the openEO Python client and run on CDSE back-ends: cloud masking, temporal composites and spectral indices.',
    tags: ['Python', 'openEO', 'CDSE', 'Sentinel-2'],
    links: [
      { label: 'Repo', url: '#', kind: 'repo' },
      { label: 'Notebook', url: '#', kind: 'notebook' },
    ],
    media: null,
    sensor: 'Sentinel-2 L2A',
    date: '',
    area: 'Haute-Garonne, France',
    attribution: 'Contains modified Copernicus Sentinel data (2024)',
    bbox: [0.44, 42.69, 2.05, 43.92],
  },
  {
    id: 'burned-area-multisensor',
    title: 'Multi-sensor burned area mapping',
    categories: ['Teaching'],
    description: 'Map burn scars by combining Sentinel-2, Landsat and MODIS: dNBR at high resolution, MODIS for timing and the wider picture.',
    tags: ['Python', 'Sentinel-2', 'Landsat', 'MODIS', 'dNBR'],
    links: [
      { label: 'Notebook', url: '#', kind: 'notebook' },
    ],
    media: null,
    sensor: 'Sentinel-2, Landsat 8/9 and MODIS',
    date: '2022-08',
    area: 'Gironde, France',
    attribution: 'Contains modified Copernicus Sentinel data (2022); Landsat courtesy of USGS; MODIS courtesy of NASA',
    bbox: [-0.75, 44.35, -0.35, 44.6],
  },
];

/* ---------- 2. Rendering ------------------------------------------------- */

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

function escapeHTML(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function isValidBbox(b) {
  return Array.isArray(b) && b.length === 4 && b.every(Number.isFinite) && b[0] < b[2] && b[1] < b[3];
}

function describeBbox([w, s, e, n]) {
  const lon = (v) => `${Math.abs(v).toFixed(2)}°${v < 0 ? 'W' : 'E'}`;
  const lat = (v) => `${Math.abs(v).toFixed(2)}°${v < 0 ? 'S' : 'N'}`;
  return `${lon(w)} to ${lon(e)}, ${lat(s)} to ${lat(n)}`;
}

/**
 * SVG graticule centred on a bbox, with the bbox outlined.
 * Equirectangular, longitudes scaled by cos(latitude) so shapes stay honest.
 * pad: how much wider than the bbox the view is.
 * Without a bbox, draws a plain square grid.
 */
function graticuleSVG(bbox, { width, height, pad }) {
  const lines = [];
  let aoi = '';

  if (!isValidBbox(bbox)) {
    const cell = height / 6;
    for (let x = cell; x < width; x += cell) lines.push(`<line x1="${x}" y1="0" x2="${x}" y2="${height}"/>`);
    for (let y = cell; y < height; y += cell) lines.push(`<line x1="0" y1="${y}" x2="${width}" y2="${y}"/>`);
  } else {
    const [w, s, e, n] = bbox;
    const cx = (w + e) / 2;
    const cy = (s + n) / 2;
    const k = Math.cos((cy * Math.PI) / 180);
    const aspect = width / height;

    // view size in "projected degrees"
    const viewH = Math.max(n - s, ((e - w) * k) / aspect, 0.05) * pad;
    const viewW = viewH * aspect;
    const latMax = cy + viewH / 2;
    const latMin = latMax - viewH;
    const lonMin = cx - viewW / (2 * k);
    const lonMax = lonMin + viewW / k;

    const px = (lon) => ((lon - lonMin) * k) / viewW * width;
    const py = (lat) => (latMax - lat) / viewH * height;

    const steps = [0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2, 5, 10, 20];
    const step = steps.find((st) => viewH / st <= 4) || 30;

    for (let lat = Math.ceil(latMin / step) * step; lat <= latMax; lat += step) {
      const y = py(lat).toFixed(1);
      lines.push(`<line x1="0" y1="${y}" x2="${width}" y2="${y}"/>`);
    }
    for (let lon = Math.ceil(lonMin / step) * step; lon <= lonMax; lon += step) {
      const x = px(lon).toFixed(1);
      lines.push(`<line x1="${x}" y1="0" x2="${x}" y2="${height}"/>`);
    }

    // never smaller than a few units, so it stays visible
    const minSize = 4;
    let rx = px(w);
    let ry = py(n);
    let rw = px(e) - rx;
    let rh = py(s) - ry;
    if (rw < minSize) { rx -= (minSize - rw) / 2; rw = minSize; }
    if (rh < minSize) { ry -= (minSize - rh) / 2; rh = minSize; }
    aoi = `<rect class="aoi" x="${rx.toFixed(1)}" y="${ry.toFixed(1)}" width="${rw.toFixed(1)}" height="${rh.toFixed(1)}"/>`;
  }

  return `<svg class="graticule" viewBox="0 0 ${width} ${height}" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">${lines.join('')}${aoi}</svg>`;
}

function fallbackHTML(lab) {
  const where = isValidBbox(lab.bbox) ? `. Area of interest: ${escapeHTML(describeBbox(lab.bbox))}` : '';
  return `
    <div class="project__empty" role="img" aria-label="No image yet${where}">
      ${graticuleSVG(lab.bbox, { width: 640, height: 480, pad: 2.4 })}
    </div>`;
}

function locatorHTML(lab) {
  if (!isValidBbox(lab.bbox)) return '';
  return `
    <div class="project__locator" role="img" aria-label="Area of interest: ${escapeHTML(describeBbox(lab.bbox))}">
      ${graticuleSVG(lab.bbox, { width: 64, height: 48, pad: 3 })}
    </div>`;
}

function mediaHTML(lab) {
  const m = lab.media;
  if (!m || !m.src) return fallbackHTML(lab);

  const alt = escapeHTML(m.alt || lab.title);
  if (m.type === 'video') {
    const poster = m.poster ? ` poster="${escapeHTML(m.poster)}"` : '';
    // Playback is handled in JS (only while visible, never with reduced motion)
    const controls = reducedMotion.matches ? ' controls' : '';
    return `
      <video muted loop playsinline preload="none"${poster}${controls} aria-label="${alt}" width="800" height="600">
        <source src="${escapeHTML(m.src)}" type="video/mp4">
      </video>${locatorHTML(lab)}`;
  }
  return `<img src="${escapeHTML(m.src)}" alt="${alt}" width="800" height="600" loading="lazy" decoding="async">${locatorHTML(lab)}`;
}

// Written as a figure caption: "Sentinel-1 GRD, 2023-07-14, Landes, France. Contains modified…"
function captionHTML(lab) {
  const fields = [lab.sensor, lab.date, lab.area].map((f) => String(f ?? '').trim()).filter(Boolean);
  const attribution = String(lab.attribution ?? '').trim();
  if (!fields.length && !attribution) return '';
  const parts = [];
  if (fields.length) parts.push(`${escapeHTML(fields.join(', '))}.`);
  if (attribution) parts.push(escapeHTML(/[.)]$/.test(attribution) ? attribution : `${attribution}.`));
  return `<figcaption class="caption">${parts.join(' ')}</figcaption>`;
}

function linksHTML(lab) {
  // Links without a real url ("#" or empty) are simply not shown
  const links = (lab.links || []).filter((l) => l.url && l.url !== '#');
  if (!links.length) return '';
  const items = links.map((link) => {
    const kind = escapeHTML(link.kind || 'link');
    return `<li><a href="${escapeHTML(link.url)}" data-gc="outbound-${kind}-${escapeHTML(lab.id)}">${escapeHTML(link.label)}<span class="visually-hidden">: ${escapeHTML(lab.title)}</span></a></li>`;
  });
  return `<ul class="project__links">${items.join('')}</ul>`;
}

function projectHTML(lab) {
  const titleId = `lab-${escapeHTML(lab.id)}`;
  const meta = [(lab.categories || []).join(', '), (lab.tags || []).join(', ')].filter(Boolean);
  return `
    <article class="project" aria-labelledby="${titleId}">
      <figure class="project__figure">
        <div class="project__media">${mediaHTML(lab)}</div>
        ${captionHTML(lab)}
      </figure>
      <h3 class="project__title" id="${titleId}">${escapeHTML(lab.title)}</h3>
      <p class="project__desc">${escapeHTML(lab.description)}</p>
      ${meta.length ? `<p class="project__meta">${meta.map(escapeHTML).join(' — ')}</p>` : ''}
      ${linksHTML(lab)}
    </article>`;
}

function renderProjects() {
  const list = document.getElementById('projects');
  if (!list) return;

  list.innerHTML = LABS.map((lab, i) => {
    const cats = escapeHTML((lab.categories || []).join('|'));
    return `<li data-index="${i}" data-categories="${cats}">${projectHTML(lab)}</li>`;
  }).join('');

  // An image that fails to load falls back to the graticule frame
  list.querySelectorAll('.project__media img').forEach((img) => {
    img.addEventListener('error', () => {
      const lab = LABS[Number(img.closest('li').dataset.index)];
      img.parentElement.innerHTML = fallbackHTML(lab);
    }, { once: true });
  });

  setupVideos(list);
}

// Videos play only while on screen, and never autoplay with reduced motion
function setupVideos(root) {
  const videos = root.querySelectorAll('video');
  if (!videos.length || reducedMotion.matches || !('IntersectionObserver' in window)) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const video = entry.target;
      if (entry.isIntersecting) {
        video.play().catch(() => { /* autoplay refused: poster stays visible */ });
      } else {
        video.pause();
      }
    });
  }, { threshold: 0.25 });

  videos.forEach((v) => observer.observe(v));
}

/* ---------- 3. Filters --------------------------------------------------- */

function setupFilters() {
  const container = document.getElementById('filters');
  const list = document.getElementById('projects');
  const status = document.getElementById('filter-status');
  if (!container || !list) return;

  // Only show categories that have at least one lab
  const used = CATEGORIES.filter((c) => LABS.some((lab) => (lab.categories || []).includes(c)));
  const options = ['All', ...used];

  container.innerHTML = options
    .map((c) => `<button type="button" data-filter="${escapeHTML(c)}" aria-pressed="${c === 'All'}">${escapeHTML(c)}</button>`)
    .join('');

  function apply(filter) {
    let shown = 0;
    [...list.children].forEach((li) => {
      const visible = filter === 'All' || li.dataset.categories.split('|').includes(filter);
      li.hidden = !visible;
      if (visible) shown += 1;
    });
    container.querySelectorAll('button').forEach((b) => {
      b.setAttribute('aria-pressed', String(b.dataset.filter === filter));
    });
    if (status) status.textContent = `Showing ${shown} of ${LABS.length} projects`;
  }

  container.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-filter]');
    if (button) apply(button.dataset.filter);
  });

  apply('All');
}

/* ---------- 4. Theme ----------------------------------------------------- */

function setupTheme() {
  const button = document.getElementById('theme-toggle');
  if (!button) return;
  const root = document.documentElement;
  const systemDark = window.matchMedia('(prefers-color-scheme: dark)');

  const current = () => root.getAttribute('data-theme') || (systemDark.matches ? 'dark' : 'light');

  function updateButton() {
    const next = current() === 'dark' ? 'light' : 'dark';
    button.textContent = next === 'dark' ? 'Dark' : 'Light';
    button.setAttribute('aria-label', `Switch to ${next} theme`);
  }

  button.addEventListener('click', () => {
    const next = current() === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('theme', next); } catch (e) { /* storage unavailable */ }
    updateButton();
  });

  // Follow the system while the visitor has not chosen
  systemDark.addEventListener('change', updateButton);
  updateButton();
}

/* ---------- 5. Analytics events, year ------------------------------------ */

// Links carrying data-gc are sent to GoatCounter as events (CV downloads, outbound links).
function setupAnalytics() {
  document.addEventListener('click', (event) => {
    const link = event.target.closest('a[data-gc]');
    if (!link) return;
    const gc = window.goatcounter;
    if (gc && typeof gc.count === 'function') {
      gc.count({ path: link.dataset.gc, title: link.href, event: true });
    }
  });
}

function setYear() {
  const el = document.getElementById('year');
  if (el) el.textContent = String(new Date().getFullYear());
}

renderProjects();
setupFilters();
setupTheme();
setupAnalytics();
setYear();

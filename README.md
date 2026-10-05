# grieu-info.github.io

Personal technical portfolio of Guillaume Rieu: https://grieu-info.github.io/

Plain HTML, CSS and vanilla JavaScript. No framework, no build step, no dependencies.

```
index.html            page structure, meta tags, Strata and Teaching content
style.css             design tokens (colors, spacing, type) and all styles
main.js               Labs data (LABS array), rendering, filters, theme, analytics events
assets/imgs/          images (.webp), favicon.svg, og-image.png (social preview, 1200×630)
assets/cv/            CV PDFs
assets/fonts/         Archivo variable font, self-hosted (SIL Open Font License 1.1)
```

## Run locally

```sh
python -m http.server 8000
# open http://localhost:8000
```

## Add or edit a project

Projects live in the `LABS` array at the top of `main.js`. Copy an entry and edit it:

```js
{
  id: 's1-clear-cuts',                    // unique slug, used in analytics event names
  title: 'Clear-cut detection with Sentinel-1',
  categories: ['SAR'],                    // one or more of CATEGORIES
  description: 'About two lines of text.',
  tags: ['Python', 'xarray'],
  links: [
    { label: 'Repo', url: 'https://github.com/grieu-info/…', kind: 'repo' },
    { label: 'Notebook', url: '#', kind: 'notebook' },   // "#" shows "Notebook — soon"
  ],
  media: { type: 'image', src: 'assets/imgs/s1-clear-cuts.webp', alt: 'Describe what the image shows' },
  // or a short loop: { type: 'video', src: 'assets/imgs/clip.mp4', poster: 'assets/imgs/clip.webp', alt: '…' }
  // or null: shows the fallback frame
  sensor: 'Sentinel-1 GRD (VV/VH)',       // caption fields: all optional,
  date: '2023-07-14',                     // the caption disappears when they are all empty
  area: 'Landes, France',
  attribution: 'Contains modified Copernicus Sentinel data (2023)',
  bbox: [-1.45, 43.6, -0.1, 44.55],       // optional [west, south, east, north], WGS84
},
```

- **Order**: frames are numbered in array order (01, 02, …). Numbers stay fixed when a filter is applied.
- **Categories**: the filter buttons come from `CATEGORIES`. A category with no project is not shown.
- **bbox**: draws a small locator in the corner of the image. Without an image, the frame shows a graticule with the area outlined. Without a bbox or an image, it shows a plain grid labelled "No data".
- **Images**: export as `.webp` in 4:3 (for example 1600×1200), around 200–400 KB. They are cropped to 4:3. If a file fails to load, the fallback frame is shown instead.
- **Videos**: short `.mp4` (H.264), no audio track, a few MB at most. They play muted and looped only while visible. With "reduced motion" turned on, they don't autoplay and show controls instead.
- **Alt text**: always set `alt` to what the image shows, not the project title.

The Strata and Teaching sections are plain HTML in `index.html`.

## Update the CVs

Replace the two files, keeping the same names:

```
assets/cv/guillaume-rieu-cv-en.pdf
assets/cv/guillaume-rieu-cv-fr.pdf
```

## Portrait and social preview

- `assets/imgs/portrait.webp`: square, at least 480×480. The placeholder is a grey "GR" tile. The page shows it in grayscale.
- `assets/imgs/og-image.png`: 1200×630 preview used by LinkedIn and others. It is PNG because LinkedIn does not reliably support WebP.

## GoatCounter

1. Create a site at https://www.goatcounter.com/ (for example with code `grieu-info`).
2. In `index.html`, replace `<goatcounter-code>` in the script tag:
   ```html
   <script data-goatcounter="https://grieu-info.goatcounter.com/count" async src="https://gc.zgo.at/count.js"></script>
   ```

GoatCounter does not count on `localhost`. The console message "not counting because of: localhost" is expected.

**Events.** Any link with a `data-gc` attribute is sent as a GoatCounter event when clicked:

| Event | Source |
|---|---|
| `cv-download-en`, `cv-download-fr` | CV links (header and footer) |
| `outbound-repo-<id>`, `outbound-notebook-<id>`, `outbound-demo-<id>` | project links (generated from `LABS`) |
| `outbound-github`, `outbound-linkedin`, `outbound-geostratify`, `outbound-strata-demo` | profile links |
| `contact-email` | email links |

To track another link, add `data-gc="your-event-name"`.

## Theme

The site follows the system light/dark setting. The toggle overrides it, and the choice is saved in `localStorage`. Colors are defined as tokens at the top of `style.css`: the light set in `:root`, the dark set twice, once for the system preference and once for the toggle.

## Deploy (GitHub Pages)

```sh
git remote add origin git@github.com:grieu-info/grieu-info.github.io.git
git push -u origin main
```

On GitHub: **Settings → Pages → Build and deployment → Source: Deploy from a branch → Branch: `main`, folder `/ (root)` → Save**. The site is published at https://grieu-info.github.io/ within a minute or two. Later pushes to `main` redeploy it automatically.

`.nojekyll` tells GitHub Pages to serve the files as they are, without Jekyll processing.

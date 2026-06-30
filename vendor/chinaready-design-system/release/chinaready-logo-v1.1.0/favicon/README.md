# Favicon set

Drop the contents of this folder at the **site root** and add the following to every page's `<head>`:

```html
<link rel="icon" type="image/x-icon" href="/favicon.ico" />
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
<link rel="icon" type="image/svg+xml" href="/mark.svg" />
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
<link rel="manifest" href="/site.webmanifest" />
<meta name="theme-color" content="#0C1E3E" />
```

## Inventory

| File | Size | Purpose |
| --- | --- | --- |
| `favicon.ico` | multi-res (16 / 32 / 48) | Legacy browsers, IE, Outlook, email signatures |
| `favicon-16x16.png` | 16 × 16 | Small browser tab icon (fallback for `.ico`) |
| `apple-touch-icon.png` | 180 × 180 | iOS Home Screen, Safari Pinned Tabs, macOS Safari touch bar |
| `android-chrome-192x192.png` | 192 × 192 | Android Chrome / PWA install (small) |
| `android-chrome-512x512.png` | 512 × 512 | Android Chrome / PWA splash, store listings |
| `site.webmanifest` | JSON | PWA install metadata — name, theme color, icon set |

All raster icons render the white watchtower mark on a solid navy ground (`#0C1E3E`). The shape is opaque end-to-end (Apple rejects transparent backgrounds on `apple-touch-icon.png`) and avoids the 1 px hairline issues that would appear at 16 px if the full color logo were used.

## Source

Delivered by the brand designer 2026-05-25. The SVG mark in `../svg/mark.svg` is the canonical vector source; everything here is rasterized from that file.

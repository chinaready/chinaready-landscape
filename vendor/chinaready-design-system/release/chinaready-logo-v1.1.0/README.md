# Chinaready logo system — v1.1.0

Official brand assets for Chinaready. Drop into any product, marketing site, deck, or document.

**Delivered:** 2026-05-25
**Source-of-truth (vector):** `svg/` — use these wherever SVG is supported.

---

## Contents

```
chinaready-logo-v1.1.0/
├── svg/         ← 9 canonical vector files (use first if possible)
├── png/         ← 41 raster exports at 64 / 128 / 256 / 512 / 1024 px heights
├── favicon/     ← .ico, apple-touch, android-chrome, PWA manifest
├── LICENSE.txt  ← internal-use notice
└── README.md    ← this file
```

---

## When to use which file

| Context | Recommended file |
| --- | --- |
| **Web / product UI / app screens** | `svg/logo-horizontal.svg` (light) or `svg/logo-horizontal-reverse.svg` (dark) |
| **Site favicons** | Drop `favicon/*` at site root, paste the `<head>` snippet below |
| **Email signature** | `png/logo-horizontal-256.png` |
| **Slide deck cover / title** | `png/logo-horizontal-512.png` (light) or `-reverse-512.png` (dark) |
| **Business card** | `svg/logo-vertical.svg` |
| **App store / OEM partner directory** | `png/mark-on-navy-1024.png` |
| **LinkedIn / X / Weibo profile picture** | `png/mark-on-navy-512.png` |
| **Mono print / fax / legal documents** | `svg/logo-horizontal-black.svg` or `png/logo-horizontal-black-512.png` |
| **Single-color reverse reproduction** | `svg/logo-horizontal-white.svg` |

---

## SVG inventory

| File | viewBox | Notes |
| --- | --- | --- |
| `logo-horizontal.svg` | 210 × 42 | Navy `#0C1E3E` on transparent — default lockup |
| `logo-horizontal-reverse.svg` | 210 × 42 | White on transparent — use on navy / dark surfaces |
| `logo-horizontal-black.svg` | 210 × 42 | Solid black — mono print |
| `logo-horizontal-white.svg` | 210 × 42 | Solid white — mono reverse |
| `logo-vertical.svg` | 160 × 80 | Navy, mark above wordmark |
| `logo-vertical-reverse.svg` | 160 × 80 | White, mark above wordmark — on dark |
| `logo-wordmark.svg` | 160 × 56 | Wordmark only, no mark |
| `mark.svg` | 200 × 200 | Watchtower mark, **transparent ground** — overlay on any color |
| `mark-on-navy.svg` | 200 × 200 | White watchtower, **solid navy ground** — app icons |

All SVGs carry `role="img"` and `aria-label="Chinaready"` for screen-reader users.

---

## PNG inventory

Naming convention: `<variant>-<height-in-px>.png`. Height drives sizing; width is derived from the SVG viewBox.

### Horizontal (5 : 1 aspect)

- `logo-horizontal-{64,128,256,512,1024}.png`
- `logo-horizontal-reverse-{64,128,256,512,1024}.png`
- `logo-horizontal-black-{128,256,512,1024}.png`
- `logo-horizontal-white-{128,256,512,1024}.png`

### Vertical (2 : 1 aspect)

- `logo-vertical-{128,256,512,1024}.png`
- `logo-vertical-reverse-{128,256,512,1024}.png`

### Wordmark (≈2.86 : 1 aspect)

- `logo-wordmark-{128,256,512,1024}.png`

### Mark (1 : 1 square)

- `mark-{64,128,256,512,1024}.png` — navy on transparent
- `mark-on-navy-{64,128,256,512,1024}.png` — white on solid navy

---

## Favicon — drop-in instructions

1. Copy the contents of `favicon/` into your site root (so `/favicon.ico`, `/site.webmanifest`, etc. are at the root URL).
2. Paste this into every page's `<head>`:

```html
<link rel="icon" type="image/x-icon" href="/favicon.ico" />
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
<link rel="icon" type="image/svg+xml" href="/mark.svg" />
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
<link rel="manifest" href="/site.webmanifest" />
<meta name="theme-color" content="#0C1E3E" />
```

Browsers pick the right asset automatically. The SVG mark loads on modern browsers; `.ico` is the fallback for legacy IE and email clients.

---

## Brand colors

The logo uses exactly two values — solid fills, no gradients.

| Token | Hex | Use |
| --- | --- | --- |
| Primary navy | `#0C1E3E` | Mark + wordmark on light surfaces; navy backdrop for reverse |
| Reverse white | `#FFFFFF` | Mark + wordmark on dark surfaces |

CMYK / Pantone equivalents pending brand-owner ratification.

---

## Don't do this

- **No color edits.** The mark + wordmark are navy or white. Nothing else.
- **No gradients, drop shadows, glows, outlines, or filters** on the logo.
- **No stretching or skewing.** Width follows from height via the source aspect ratio.
- **No clearspace violations.** Each SVG bakes ~12–14 % of its height as native padding. Don't crop into it.
- **Minimum size:** 24 px tall on screen / 12 mm tall in print. Below that, use `mark.svg` alone.
- **No emoji or Unicode dingbats** as substitute marks.

---

## Outstanding (ask the brand designer)

- `.ai` / `.fig` source file — needed for future edits.
- Vector PDF — for print houses and legal documents.
- CMYK / Pantone equivalents for `#0C1E3E` — ratification before any commercial print run.

---

## License

© Chinaready. Internal and partner use. See `LICENSE.txt`.

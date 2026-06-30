# dist — built bundle

> Generated. Do not hand-edit. Re-run the dist build to regenerate.

`chinaready.css` is a single-file bundle of `/colors_and_type.css` with the font URLs rewritten so the file works when linked from anywhere on the same origin. The Phosphor icon font is **not bundled** — it remains a peer CDN dependency (decision: keep CDN for icons).

## Usage

```html
<!-- Tokens, base reset, utilities -->
<link rel="stylesheet" href="path/to/dist/chinaready.css">

<!-- Icon font (peer dependency) -->
<link rel="stylesheet"
      href="https://unpkg.com/@phosphor-icons/web@2.1.1/src/regular/style.css">
```

## Dark theme

Opt in by setting `data-theme="dark"` on `<html>` or any ancestor of the surface you want themed. Marketing pages (Hero / CTABlock / Footer) keep their explicit `--cr-on-dark-*` variants and do NOT need this attribute.

```html
<html data-theme="dark"> ... </html>
```

## What's included

- All `--cr-*` tokens (colors, type, spacing, radii, shadows, motion, layout, z-index, breakpoints)
- `@import` for Noto Sans SC from Google Fonts CDN + offline `local()` fallback chain
- `@font-face` rules for Inter / DM Sans (paths point to `../fonts/`)
- Base reset on `body`, `h1`–`h3`, `p`, `a`, code
- Utility classes: `.cr-focus-ring`, `.cr-is-disabled`, `.cr-is-loading`, `.cr-sr-only`
- `prefers-reduced-motion` honoring

## What's NOT included

- React/JSX components (UI Kit lives in `/ui_kits/website/`)
- Icon font (CDN'd separately, see above)
- Brand SVG assets (linked from `/assets/`)

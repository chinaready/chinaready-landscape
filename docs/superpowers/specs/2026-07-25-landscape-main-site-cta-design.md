# Landscape → Chinaready main-site CTA design

Date: 2026-07-25  
Status: Approved for planning  
Related surface: sitewide header, `/alternatives/<service>.html`  
Primary destinations: `https://chinaready.co/contact/`, `https://chinaready.co/intake/`

## Problem

`landscape.chinaready.co` is meant to drive qualified traffic to the Chinaready main site, specifically two forms:

1. Help / contribute — `https://chinaready.co/contact/`
2. Project assessment — `https://chinaready.co/intake/`

Today those conversion paths are weak in the primary chrome:

- The shared header ends with a GitHub icon; there is no persistent help CTA.
- Alternatives detail pages have research content and a “Next reading” list, but no always-visible assessment CTA after the reader finishes comparing options.
- Footer already links to `/intake` and `/book-call`, but those are easy to miss and `/book-call` is a different contact path than `/contact/`.

## Goals

1. Put a persistent **Get help** CTA in the top-right of **every** landscape page, linking to `/contact/`.
2. Put a bottom **sticky** assessment CTA on every **alternatives detail** page, linking to `/intake/`.
3. Keep the site feeling like a research / landscape tool, not a hard-sell landing page.
4. Reuse existing header / alternatives generation paths (`seo-geo.mjs` shared header, landscape2 header enhancement) rather than inventing a parallel chrome system.

## Non-goals

- Do not change footer `Start Assessment` / `Book a Call` links or copy in this round.
- Do not globally replace `/book-call` with `/contact/`.
- Do not show the sticky assessment bar on `/alternatives/` index, Explore, or Guide.
- Do not make the sticky bar dismissible.
- Do not personalize sticky copy with the current service name.
- Do not add a second mid-page CTA card or floating badge overlays.
- Do not reintroduce a header GitHub icon in this change (README / repo remain the open-source entry).

## Approach

**Lean dual-entry conversion chrome (Approach 1).**

Two high-intent entries only, each with one job:

| Entry | Scope | Job | URL | Copy |
|-------|-------|-----|-----|------|
| Header CTA | All pages | Ask for help or offer help | `https://chinaready.co/contact/` | `Get help` |
| Sticky CTA | Alternatives detail pages only | Start project assessment | `https://chinaready.co/intake/` | Support line + `Start assessment` |

External main-site links open in a new tab (`target="_blank" rel="noopener noreferrer"`), matching existing footer / Next reading behavior.

## Header: Get help

### Placement

Desktop chrome order:

```text
[Logo] [Explore · Guide · Global] …… [Search] [Get help]
```

- Occupies the current `cr-site-header-actions` slot.
- Replaces the GitHub icon entirely.

### Visual treatment

- Solid primary button: background `#005BAC`, white label, rectangular corners (match Chinaready / CNCF sharp geometry; no pill shape).
- Typography roughly aligned with primary nav (~14px, bold).
- Hover background `#004a8f`.
- Minimum tap height about 36–40px.

### Content and semantics

- Visible label: `Get help` (sufficient accessible name; no separate `aria-label` required)
- Href: `https://chinaready.co/contact/`

### Responsive behavior

- On narrow viewports, `Get help` remains visible in the top-right.
- Search may shrink to protect CTA visibility.
- Do not bury `Get help` inside a hamburger-only menu.

### Page coverage

- landscape2 surfaces: Explore, Guide (via existing header enhancement path)
- Static surfaces: `/alternatives/` index and all `/alternatives/<slug>.html` pages (via shared header renderer)

## Alternatives sticky: Start assessment

### Placement

- Only on `/alternatives/<service>.html` (example: `/alternatives/amazon-ses.html`).
- Fixed to the bottom of the viewport for the life of the page visit.
- Not dismissible in this round.

### Layout

Desktop (content aligned to the same max width as page body, ~1440px):

```text
| Not sure which option fits your stack?          [ Start assessment ] |
```

- Left: support copy in secondary text color (`#5a6a80`)
- Right: outline button for `Start assessment` — transparent fill, `#005BAC` border and label, rectangular corners. Intentionally lighter than the solid header `Get help` button so the two CTAs do not compete as equal primary buttons.

Mobile:

- Stack vertically: support line above, full-width control below.
- Keep bar height restrained (support line may wrap to two lines or truncate cleanly).

### Visual treatment

- Surface `#f4f6fa` with a 1px top border `#dde3ee` (no drop shadow)
- No gradients, emoji, floating badges, or promo chips
- `z-index` above body content, below header search dropdowns
- Body bottom padding so “Next reading” and page end are not obscured
- Respect `env(safe-area-inset-bottom)` on notched devices

### Content

Fixed copy (no service-name interpolation):

- Support line: `Not sure which option fits your stack?`
- Control label: `Start assessment`
- Href: `https://chinaready.co/intake/`

### Semantics

- Real `<a>` control (keyboard-focusable, crawlable)
- Landmark: `aside` or equivalent region with an accessible name such as `China stack assessment`

## Out of scope follow-ups

- Unify footer / Next reading `/book-call` paths onto `/contact/`
- Align footer labels with `Get help`
- Dismissible sticky, service-name personalization, or A/B copy tests
- Analytics event wiring beyond normal outbound link behavior

## Acceptance criteria

1. Explore, Guide, `/alternatives/`, and any alternatives detail page show `Get help` in the header top-right, linking to `https://chinaready.co/contact/`, with no header GitHub icon.
2. Sticky assessment bar appears only on alternatives detail pages; index / Explore / Guide do not show it.
3. Sticky uses the fixed support line + `Start assessment` → `https://chinaready.co/intake/`.
4. Page end content remains readable above the sticky bar.
5. Footer conversion links remain unchanged in this round.
6. `npm run validate`, `npm run build`, and `npm run verify` pass.

## File / system touchpoints (planning hint)

| Area | Likely touchpoint |
|------|-------------------|
| Alternatives shared header | `scripts/seo-geo.mjs` (`renderSharedHeader`) |
| Alternatives detail body / shell | `scripts/seo-geo.mjs` (detail page renderer) |
| Alternatives styles | `assets/chinaready-alternatives.css` |
| landscape2 header enhancement | `assets/chinaready-landscape-details.js` + `assets/chinaready-landscape.css` |
| Brand / regression checks | `scripts/verify-chinaready-brand.mjs` |

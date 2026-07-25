# Landscape Main-Site CTA Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a sitewide header `Get help` CTA to `https://chinaready.co/contact/` and a bottom sticky `Start assessment` CTA on alternatives detail pages to `https://chinaready.co/intake/`.

**Architecture:** Replace the header GitHub icon with a solid `Get help` button in both the static alternatives chrome (`scripts/seo-geo.mjs`) and the landscape2 header (via `assets/chinaready-landscape-details.js` enhancement). Append a fixed bottom sticky bar only when rendering `/alternatives/<slug>.html`. Keep footer `/intake` and `/book-call` links unchanged. Lock behavior with assertions in `scripts/verify-chinaready-brand.mjs`.

**Tech Stack:** Node static generators (`scripts/seo-geo.mjs`), landscape2 header enhancement JS/CSS, `npm run validate|build|verify`.

**Spec:** `docs/superpowers/specs/2026-07-25-landscape-main-site-cta-design.md`

## Global Constraints

- Header CTA label must be exactly `Get help`.
- Header CTA URL must be exactly `https://chinaready.co/contact/`.
- Sticky support line must be exactly `Not sure which option fits your stack?`.
- Sticky button label must be exactly `Start assessment`.
- Sticky URL must be exactly `https://chinaready.co/intake/`.
- Sticky appears only on `/alternatives/<slug>.html` — not on `/alternatives/` index, Explore, or Guide.
- Do not change footer `Start Assessment` / `Book a Call` hrefs or labels.
- Do not change existing `CONTACT_CHINAREADY_URL` (`/book-call`) consumers (uncertain pages, Next reading).
- Header GitHub icon must be removed from chrome (repo link may remain in footer / settings footer.links).
- Solid primary for `Get help` (`#005BAC`); outline/secondary for sticky `Start assessment`.
- Rectangular corners; no pills, gradients, emoji, or floating badges.
- External main-site links: `target="_blank" rel="noopener noreferrer"`.
- After each task that changes source: commit with a focused message.
- Final verify requires `docs/` untracked (existing rule); untrack design/plan docs in the last task.

## File map

| File | Responsibility |
|------|----------------|
| `scripts/verify-chinaready-brand.mjs` | Failing-then-passing assertions for header CTA + sticky |
| `scripts/seo-geo.mjs` | Shared header `Get help`; sticky HTML on detail pages |
| `assets/chinaready-alternatives.css` | `Get help` button + sticky bar styles |
| `assets/chinaready-landscape-details.js` | Replace landscape2 header GitHub with `Get help` |
| `assets/chinaready-landscape.css` | landscape2 header `Get help` styles |

---

### Task 1: Add failing verify assertions for CTAs

**Files:**
- Modify: `scripts/verify-chinaready-brand.mjs`

**Interfaces:**
- Consumes: none
- Produces: assertions that Tasks 2–4 must satisfy (`Get help`, `/contact/`, sticky markup classes/copy, no header GitHub in alternatives chrome)

- [ ] **Step 1: Add source assertions after the existing `enhanceHeaderGlobalNav` checks (~line 210)**

Insert:

```javascript
assert(detailsScript.includes("enhanceHeaderGetHelp"), "detail extension must inject Get help into the top header");
assert(detailsScript.includes("https://chinaready.co/contact/"), "detail extension Get help must link to /contact/");
assert(detailsScript.includes(">Get help<") || detailsScript.includes('textContent = "Get help"'), "detail extension must use Get help label");
```

- [ ] **Step 2: Add seo-geo source assertions near other script reads**

After `const detailsScript = read(...)` block is fine, also read seo-geo once if not already loaded. If `seo-geo.mjs` is not already read as a top-level const, add:

```javascript
const seoGeo = read("scripts/seo-geo.mjs");
assert(seoGeo.includes("https://chinaready.co/contact/"), "seo-geo header Get help must link to /contact/");
assert(seoGeo.includes("Get help"), "seo-geo must include Get help label");
assert(seoGeo.includes("cr-site-get-help"), "seo-geo header must use cr-site-get-help class");
assert(!seoGeo.includes("cr-site-github"), "seo-geo shared header must not render the GitHub icon control");
assert(seoGeo.includes("cr-alt-sticky-cta"), "seo-geo must define alternatives sticky CTA markup");
assert(seoGeo.includes("Not sure which option fits your stack?"), "seo-geo sticky must use approved support copy");
assert(seoGeo.includes("Start assessment"), "seo-geo sticky must use Start assessment label");
assert(seoGeo.includes("https://chinaready.co/intake/"), "seo-geo sticky must link to /intake/");
```

Note: footer already contains `https://chinaready.co/intake` without trailing slash — the sticky assertion requires the trailing-slash form `/intake/`.

- [ ] **Step 3: Add build assertions for alternatives index header**

Inside `if (exists("build/alternatives/index.html")) { ... }`, add:

```javascript
assert(alternativesIndex.includes("cr-site-get-help"), "alternatives index header must include Get help CTA");
assert(alternativesIndex.includes("https://chinaready.co/contact/"), "alternatives index Get help must link to /contact/");
assert(alternativesIndex.includes(">Get help</a>"), "alternatives index must show Get help label");
assert(!alternativesIndex.includes("cr-site-github"), "alternatives index header must not include GitHub icon control");
assert(!alternativesIndex.includes("cr-alt-sticky-cta"), "alternatives index must not show sticky assessment CTA");
```

- [ ] **Step 4: Add build assertions for an alternatives detail page sticky**

Inside `if (exists("build/alternatives/amazon-ses.html")) { ... }`, add:

```javascript
assert(sesPage.includes("cr-site-get-help"), "Amazon SES page header must include Get help CTA");
assert(sesPage.includes("https://chinaready.co/contact/"), "Amazon SES Get help must link to /contact/");
assert(sesPage.includes("cr-alt-sticky-cta"), "Amazon SES page must include sticky assessment CTA");
assert(sesPage.includes("Not sure which option fits your stack?"), "Amazon SES sticky must use approved support copy");
assert(sesPage.includes(">Start assessment</a>"), "Amazon SES sticky must show Start assessment");
assert(sesPage.includes('href="https://chinaready.co/intake/"'), "Amazon SES sticky must link to /intake/");
```

- [ ] **Step 5: Run verify to confirm new assertions fail**

Run:

```bash
npm run verify
```

Expected: FAIL on at least one new assertion (e.g. missing `enhanceHeaderGetHelp` or `cr-site-get-help`). If `build/` is missing, source assertions alone should still fail.

- [ ] **Step 6: Commit**

```bash
git add scripts/verify-chinaready-brand.mjs
git commit -m "$(cat <<'EOF'
Assert Get help header and alternatives sticky assessment CTAs.

EOF
)"
```

---

### Task 2: Replace alternatives shared header GitHub with Get help

**Files:**
- Modify: `scripts/seo-geo.mjs` (`CONTACT_CHINAREADY_URL` area + `renderSharedHeader`)
- Modify: `assets/chinaready-alternatives.css` (`.cr-site-github` → `.cr-site-get-help`)

**Interfaces:**
- Consumes: approved copy/URLs from Global Constraints
- Produces: `GET_HELP_URL` constant; `renderSharedHeader()` emits `cr-site-get-help` instead of `cr-site-github`

- [ ] **Step 1: Add constants next to `CONTACT_CHINAREADY_URL` in `scripts/seo-geo.mjs`**

Keep `CONTACT_CHINAREADY_URL` pointing at `/book-call` for existing uncertain / Next reading links. Add:

```javascript
const CONTACT_CHINAREADY_URL = `${MAIN_SITE_URL}/book-call`;
const GET_HELP_URL = `${MAIN_SITE_URL}/contact/`;
const INTAKE_ASSESSMENT_URL = `${MAIN_SITE_URL}/intake/`;
```

- [ ] **Step 2: Replace the GitHub anchor in `renderSharedHeader`**

Replace the entire `<div class="cr-site-header-actions">...</div>` GitHub block with:

```javascript
      <div class="cr-site-header-actions">
        <a
          class="cr-site-get-help"
          href="${GET_HELP_URL}"
          target="_blank"
          rel="noopener noreferrer"
        >Get help</a>
      </div>
```

Do not leave any `cr-site-github` markup or SVG in this function.

- [ ] **Step 3: Replace `.cr-site-github` styles in `assets/chinaready-alternatives.css`**

Remove `.cr-site-github` / `:hover` rules and add:

```css
.cr-site-get-help {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-left: 12px;
  min-height: 36px;
  padding: 0 14px;
  border: 0;
  border-radius: 0;
  background: var(--cr-brand-blue);
  color: #ffffff;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.02em;
  line-height: 1.2;
  text-decoration: none;
  white-space: nowrap;
}

.cr-site-get-help:hover {
  background: var(--cr-brand-blue-hover);
  color: #ffffff;
}
```

Keep `.cr-site-header-actions` flex alignment as-is so the button stays top-right.

- [ ] **Step 4: Commit**

```bash
git add scripts/seo-geo.mjs assets/chinaready-alternatives.css
git commit -m "$(cat <<'EOF'
Replace alternatives header GitHub icon with Get help CTA.

EOF
)"
```

---

### Task 3: Inject Get help into landscape2 Explore/Guide headers

**Files:**
- Modify: `assets/chinaready-landscape-details.js` (`enhanceHeaderGetHelp` + call sites)
- Modify: `assets/chinaready-landscape.css` (header button styles)

**Interfaces:**
- Consumes: landscape2 header GitHub link from `settings.yml` `header.links.github`
- Produces: `enhanceHeaderGetHelp()` that leaves a single `a.cr-site-get-help` in the header actions area

- [ ] **Step 1: Add `enhanceHeaderGetHelp` near `enhanceHeaderGlobalNav` in `assets/chinaready-landscape-details.js`**

```javascript
  function enhanceHeaderGetHelp() {
    const headers = document.querySelectorAll("header, .navbar, .header");
    for (const header of headers) {
      if (header.dataset.chinareadyGetHelp === "ready") continue;

      const githubLink = header.querySelector(
        'a[href*="github.com/chinaready/chinaready-landscape"], a[aria-label="Open GitHub link"]',
      );

      const getHelp = document.createElement("a");
      getHelp.className = "cr-site-get-help";
      getHelp.href = "https://chinaready.co/contact/";
      getHelp.target = "_blank";
      getHelp.rel = "noopener noreferrer";
      getHelp.textContent = "Get help";

      if (githubLink) {
        githubLink.replaceWith(getHelp);
      } else {
        const actions =
          header.querySelector(".cr-site-header-actions") ||
          header.querySelector("nav")?.parentElement ||
          header;
        actions.append(getHelp);
      }

      header.dataset.chinareadyGetHelp = "ready";
    }
  }
```

- [ ] **Step 2: Call `enhanceHeaderGetHelp` wherever `enhanceHeaderGlobalNav` is called**

In `refresh()` and the initial `requestAnimationFrame` boot block, add `enhanceHeaderGetHelp();` immediately after `enhanceHeaderGlobalNav();`.

- [ ] **Step 3: Add matching CSS to `assets/chinaready-landscape.css`**

```css
header a.cr-site-get-help,
.navbar a.cr-site-get-help,
.header a.cr-site-get-help {
  display: inline-flex !important;
  align-items: center;
  justify-content: center;
  margin-left: 12px;
  min-height: 36px;
  padding: 0 14px !important;
  border: 0 !important;
  border-radius: 0 !important;
  background: #005bac !important;
  color: #ffffff !important;
  font-size: 14px !important;
  font-weight: 700 !important;
  letter-spacing: 0.02em;
  line-height: 1.2;
  text-decoration: none !important;
  white-space: nowrap;
}

header a.cr-site-get-help:hover,
.navbar a.cr-site-get-help:hover,
.header a.cr-site-get-help:hover {
  background: #004a8f !important;
  color: #ffffff !important;
}
```

- [ ] **Step 4: Commit**

```bash
git add assets/chinaready-landscape-details.js assets/chinaready-landscape.css
git commit -m "$(cat <<'EOF'
Inject Get help CTA into landscape2 header chrome.

EOF
)"
```

---

### Task 4: Add sticky Start assessment bar on alternatives detail pages

**Files:**
- Modify: `scripts/seo-geo.mjs` (`pageShell`, detail renderer)
- Modify: `assets/chinaready-alternatives.css` (sticky styles + body padding)

**Interfaces:**
- Consumes: `INTAKE_ASSESSMENT_URL` from Task 2
- Produces: `renderStickyAssessmentCta()` HTML; `pageShell({ stickyCta })` optional slot; detail pages pass sticky, index does not

- [ ] **Step 1: Add sticky renderer in `scripts/seo-geo.mjs` near `renderSharedFooter`**

```javascript
function renderStickyAssessmentCta() {
  return `<aside class="cr-alt-sticky-cta" aria-label="China stack assessment">
    <div class="cr-alt-sticky-cta-inner">
      <p class="cr-alt-sticky-cta-copy">Not sure which option fits your stack?</p>
      <a
        class="cr-alt-sticky-cta-button"
        href="${INTAKE_ASSESSMENT_URL}"
        target="_blank"
        rel="noopener noreferrer"
      >Start assessment</a>
    </div>
  </aside>`;
}
```

- [ ] **Step 2: Extend `pageShell` to accept optional `stickyCta`**

Change signature to:

```javascript
function pageShell({
  title,
  description,
  canonicalPath,
  body,
  jsonLd = [],
  breadcrumbs = [],
  activeNav = "global",
  stickyCta = "",
}) {
```

In the returned HTML, insert sticky after footer and before the search script:

```html
  ${renderSharedFooter()}
  ${stickyCta}
  <script defer src="/assets/chinaready-alternatives-search.js"></script>
```

- [ ] **Step 3: Pass sticky only from the alternatives detail renderer**

In the function that returns `pageShell({...})` for a single analog group (the detail page builder that currently ends with `return pageShell({ title, description, canonicalPath: `/alternatives/${group.slug}.html`, ... })`), add:

```javascript
    stickyCta: renderStickyAssessmentCta(),
```

Do **not** pass `stickyCta` from `renderAlternativesIndex`.

- [ ] **Step 4: Add sticky CSS to `assets/chinaready-alternatives.css`**

```css
.cr-alt-body {
  /* existing rules remain; ensure sticky-friendly padding on main */
}

.cr-alt-main {
  padding: 40px 0 120px;
}

.cr-alt-sticky-cta {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 30;
  background: var(--cr-surface);
  border-top: 1px solid var(--cr-border);
  padding-bottom: env(safe-area-inset-bottom, 0);
}

.cr-alt-sticky-cta-inner {
  width: min(1040px, calc(100% - 40px));
  margin: 0 auto;
  min-height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 12px 0;
}

.cr-alt-sticky-cta-copy {
  margin: 0;
  color: var(--cr-text-secondary);
  font-size: 14px;
  line-height: 1.4;
}

.cr-alt-sticky-cta-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  min-height: 36px;
  padding: 0 14px;
  border: 1px solid var(--cr-brand-blue);
  border-radius: 0;
  background: transparent;
  color: var(--cr-brand-blue);
  font-size: 14px;
  font-weight: 700;
  text-decoration: none;
  white-space: nowrap;
}

.cr-alt-sticky-cta-button:hover {
  background: rgba(0, 91, 172, 0.06);
  color: var(--cr-brand-blue-hover);
  border-color: var(--cr-brand-blue-hover);
}

@media (max-width: 720px) {
  .cr-alt-sticky-cta-inner {
    width: min(1040px, calc(100% - 32px));
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
    padding: 12px 0;
  }

  .cr-alt-sticky-cta-button {
    width: 100%;
  }
}
```

If `.cr-alt-body` / `.cr-alt-main` already define `padding`, edit those existing rules instead of duplicating selectors — keep a single `.cr-alt-main` padding declaration with the larger bottom value (`120px`).

- [ ] **Step 5: Commit**

```bash
git add scripts/seo-geo.mjs assets/chinaready-alternatives.css
git commit -m "$(cat <<'EOF'
Add sticky Start assessment CTA on alternatives detail pages.

EOF
)"
```

---

### Task 5: Build, verify, and stop tracking docs for verify

**Files:**
- Modify: git index only for `docs/` (untrack design + plan after implementation is green)
- No product-code changes unless verify reveals a miss

**Interfaces:**
- Consumes: Tasks 1–4 deliverables
- Produces: green `validate` / `build` / `verify`; `docs/` untracked again (matches existing verify rule)

- [ ] **Step 1: Run full validation and build**

```bash
npm run validate && npm run build && npm run verify
```

Expected: FAIL only if `docs/` is still tracked (`docs/ must not contain tracked files`) or a CTA assertion is still red. Fix any CTA assertion failures before continuing.

- [ ] **Step 2: If CTA assertions fail, fix the specific source and recommit**

Re-run:

```bash
npm run build && npm run verify
```

Expected before Step 3: either all green, or only the tracked-`docs/` assertion failing.

- [ ] **Step 3: Stop tracking superpowers docs under `docs/` (same pattern as Kong follow-up)**

```bash
git rm -r --cached docs/superpowers
git commit -m "$(cat <<'EOF'
Stop tracking superpowers docs under docs/ to satisfy verify.

EOF
)"
```

Local files may remain on disk (ignored by `.gitignore`); they must not appear in `git ls-files docs`.

- [ ] **Step 4: Final verify**

```bash
npm run validate && npm run build && npm run verify
```

Expected: all pass. Confirm manually in build output:

- `build/alternatives/index.html` has `Get help` / `/contact/`, no `cr-site-github`, no `cr-alt-sticky-cta`
- `build/alternatives/amazon-ses.html` has sticky copy + `/intake/`
- `assets/chinaready-landscape-details.js` (source and published copy under `build/`) includes `enhanceHeaderGetHelp`

- [ ] **Step 5: Push branch**

```bash
git push -u origin HEAD
```

---

## Spec coverage self-check

| Spec requirement | Task |
|------------------|------|
| Sitewide header `Get help` → `/contact/` | Tasks 2, 3 |
| Replace header GitHub icon | Tasks 2, 3 |
| Sticky only on alternatives detail pages | Task 4 |
| Sticky copy + `Start assessment` → `/intake/` | Task 4 |
| Outline sticky button vs solid header button | Tasks 2, 4 |
| Footer /book-call unchanged | Global Constraints + no task edits footer conversion links |
| `validate` / `build` / `verify` pass | Task 5 |
| Mobile stacking / safe-area | Task 4 CSS |
| No sticky on index | Task 4 (index omits sticky) + Task 1 assertion |

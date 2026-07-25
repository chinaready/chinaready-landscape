# Task 3 Report: Inject Get help into landscape2 Explore/Guide headers

## What I implemented

Per `task-3-brief.md`, updated the landscape2-generated header path only.

### `assets/chinaready-landscape-details.js`

1. Added `enhanceHeaderGetHelp()` immediately above `enhanceHeaderGlobalNav()`, using the brief's implementation:
   - scans `header, .navbar, .header`
   - looks for the landscape GitHub header link via:
     - `a[href*="github.com/chinaready/chinaready-landscape"]`
     - `a[aria-label="Open GitHub link"]`
   - creates a single `a.cr-site-get-help`
   - points it at `https://chinaready.co/contact/`
   - labels it `Get help`
   - replaces the GitHub link when present, otherwise appends into the header actions area fallback
   - marks processed headers with `data-chinaready-get-help="ready"`

2. Called `enhanceHeaderGetHelp()` immediately after `enhanceHeaderGlobalNav()` in both required places:
   - `refresh()`
   - the initial `window.requestAnimationFrame(...)` boot block

### `assets/chinaready-landscape.css`

Added the brief's header-scoped `.cr-site-get-help` and `:hover` styles for:

- `header a.cr-site-get-help`
- `.navbar a.cr-site-get-help`
- `.header a.cr-site-get-help`

No sticky CTA markup was added. No footer conversion links were changed.

## Focused verification

Task requested focused verification for the details-script source assertions, not full GREEN verify.

### Required details.js assertions

**Command:**
```bash
rg -n "function enhanceHeaderGetHelp|https://chinaready\\.co/contact/|textContent = \"Get help\"" assets/chinaready-landscape-details.js
```

**Result: PASS**

- `function enhanceHeaderGetHelp` present
- contiguous `https://chinaready.co/contact/` present
- `textContent = "Get help"` present

### Required call sites

**Command:**
```bash
rg -n "enhanceHeaderGlobalNav\\(|enhanceHeaderGetHelp\\(" assets/chinaready-landscape-details.js
```

**Result: PASS**

Confirmed `enhanceHeaderGetHelp()` is called wherever `enhanceHeaderGlobalNav()` is called:

- inside `refresh()`
- inside the boot `requestAnimationFrame(...)`

### CSS scope check

**Command:**
```bash
rg -n "cr-site-get-help" assets/chinaready-landscape.css
```

**Result: PASS**

Confirmed Task 3 styles were added only in the landscape stylesheet.

## Commit

- `11036b1` — Inject Get help CTA into landscape2 header chrome.

## Self-review

- Implementation matches the task brief closely, including the exact `enhanceHeaderGetHelp` structure and the required literal contact URL.
- Scope stayed within the two requested landscape files.
- Hook placement is correct at both refresh and boot entry points.
- No sticky CTA implementation was introduced.
- No footer CTA / conversion link behavior was changed.

## Concerns

- None for Task 3 scope. Full `npm run verify` may still fail on later-task assertions, which the task brief explicitly allowed.

# Guide SEO & usability improvements

Date: 2026-07-20  
Status: approved approach (curated copy + auto-links)  
Goal: raise click-through from Guide Overview into `/alternatives/`, strengthen internal linking for GEO/SEO, and make category pages more useful for searchers who already know a global vendor.

## Problem

Search Console already shows keyword-driven traffic. Gaps on `/guide#overview`:

1. No prominent link to the crawlable `/alternatives/` index.
2. The injected keyword map’s **Global service** column is plain text, while `/alternatives/` already has per-service pages.
3. Subcategory guide sections explain what belongs there, but do not name the familiar global services teams usually search for.

## Approach

**Curated guide copy + build-time link generation (Approach 1).**

- Authors write typical global service names in `guide.yml` (including empty subcategories).
- `scripts/seo-geo.mjs` keeps generating the Overview keyword map, and adds links from each Global service name to `/alternatives/<slug>.html`.
- Overview copy is tightened for high-intent search phrases and points to `/alternatives/`.

Do **not** auto-derive subcategory “typical services” from `landscape.yml` (noise across multi-module products; empty categories would stay blank).

## Scope

### In scope

| Change | File(s) |
|---|---|
| Overview CTA + SEO-oriented lede + FAQ link to `/alternatives/` | `guide.yml` |
| One “Typical global services” line under every subcategory | `guide.yml` |
| Keyword-map Global service → `/alternatives/<slug>.html` | `scripts/seo-geo.mjs` (`renderGuideKeywordMap`) |
| Light copy polish on Overview for clickability | `guide.yml` |

### Out of scope

- Landscape grid UI / landscape2 frontend changes
- New page templates beyond existing `/alternatives/` surface
- Auto-sync of typical services from product annotations
- Deployment workflow changes
- Changing China-ready candidate column into links (keep text to avoid competing with vendor homepages)

## Overview content design

Update the Overview category in `guide.yml`:

1. **Opening paragraph** — Keep audience clear; front-load high-intent phrases such as China alternatives to Firebase, FCM, AWS, Stripe, and Google Maps.
2. **Path to alternatives** — Explicit sentence with markdown link to `/alternatives/` near the keyword-map intro (and optionally in the opening “start here” paragraph).
3. **Keyword-map intro** — State that each Global service name links to its dedicated alternatives page; mention the full index at `/alternatives/`.
4. **FAQ** — Add one Q&A pointing to `/alternatives/` for the full crawlable keyword index.

Suggested FAQ addition:

- **Where is the full China alternatives keyword index?**  
  The Guide embeds a summary map. The dedicated crawlable index lives at `/alternatives/`, with one page per global service keyword.

## Keyword map linking

In `renderGuideKeywordMap(groups)`:

```html
<td><a href="/alternatives/{slug}.html">{name}</a></td>
```

Behavior:

- Use the existing `group.slug` from `buildAnalogGroups` (same slugs as `/alternatives/` pages and sitemap).
- Escape name and slug for HTML safety.
- Do not change Options or China-ready candidates columns.
- No new CSS required unless links look unbroken in the guide theme after verify; prefer zero CSS change first.

## Subcategory “Typical global services” lines

### Format

One dedicated line at the end of each subcategory `content` block:

```text
Typical global services: Service A, Service B, Service C.
```

Rules:

- Prefer canonical names already used in alternatives pages / `ANALOG_ALIASES` when a page exists (e.g. `AWS`, `Microsoft Azure`, `Firebase Cloud Messaging`, `Google Maps Platform`).
- Where an alternatives page exists after build, use a relative markdown link: `[AWS](/alternatives/aws.html)`.
- For services not yet mapped in `landscape.yml`, keep plain text (still useful for SEO/GEO and contributor guidance).
- Keep 2–5 services per subcategory; curated for search intent, not exhaustive.

### Curated lists by subcategory

#### Infrastructure & Edge

| Subcategory | Typical global services |
|---|---|
| Cloud Platform & Hosting | Amazon AWS, Microsoft Azure, Google Cloud Platform |
| Managed DNS Provider | Cloudflare DNS, AWS Route 53, Google Cloud DNS |
| Content Delivery Network (CDN) | Amazon CloudFront, Cloudflare CDN, Akamai |

#### Application Platform

| Subcategory | Typical global services |
|---|---|
| Cross-Platform UI & Frameworks | React Native, Flutter, Ionic |
| Mobile Backend-as-a-Service (MBaaS) | Firebase, AWS Amplify, Supabase, Heroku |
| Feature Flags & Remote Config | LaunchDarkly, Firebase Remote Config, ConfigCat |

#### Release, Quality & Operations

| Subcategory | Typical global services |
|---|---|
| CI/CD & App Distribution | GitHub Actions, Bitrise, Fastlane |
| Automated Testing & Device Farms | AWS Device Farm, Firebase Test Lab, BrowserStack App Automate |
| Crash Reporting & Performance Monitoring | Sentry, Firebase Crashlytics, Bugsnag |
| Monitoring & Observability (APM / RUM) | Datadog, New Relic, Grafana Cloud |

#### Users, Trust & Monetization

| Subcategory | Typical global services |
|---|---|
| Authentication & Identity | Auth0, Okta, Firebase Authentication, Amazon Cognito |
| Payments & In-App Purchases | Stripe, PayPal, Apple Pay |
| Bot Protection & CAPTCHA | Google reCAPTCHA, hCaptcha, Cloudflare Turnstile |

#### Engagement & Communication

| Subcategory | Typical global services |
|---|---|
| Push Notifications & Multichannel Messaging | Firebase Cloud Messaging, OneSignal, Twilio SMS, SendGrid |
| Real-Time Communication (Voice / Video / Chat) | Twilio Video, Agora, Daily |
| Customer Support & In-App Messaging | Intercom, Zendesk, Freshdesk |

#### Growth, Content & Experience

| Subcategory | Typical global services |
|---|---|
| Product Analytics & User Insights | Mixpanel, Amplitude, PostHog, Firebase Analytics |
| Location & Map Services | Google Maps Platform, Mapbox, Apple MapKit |
| App-Store Intelligence & Attribution (ASO) | AppsFlyer, Adjust, Branch |
| Web Fonts & Iconography | Google Fonts |

Link only names that resolve to an existing alternatives group after the current `landscape.yml` mapping. Implementation should check against `buildAnalogGroups` output (or the known slug list from the last build) so we do not publish dead links.

Practical rule for this change set: link services that already appear in `/alternatives/` today; leave others as plain text even if listed above.

## Architecture / data flow

```text
landscape.yml (global_alternatives)
        │
        ▼
scripts/seo-geo.mjs
  loadLandscapeItems → buildAnalogGroups
        │
        ├─► /alternatives/index.html + /alternatives/<slug>.html
        ├─► sitemap.xml, llms.txt, robots.txt
        └─► injectGuideKeywordMap → build/data/guide.json
              (Overview CR_ALTERNATIVES_KEYWORD_MAP replaced with linked table)

guide.yml
  Overview copy + subcategory Typical global services
        │
        ▼
landscape2 build → guide.json (markdown rendered)
        │
        ▼
seo-geo inject + enhance
```

## Error handling

- If `CR_ALTERNATIVES_KEYWORD_MAP` is missing, keep existing fallback append behavior.
- Never publish markdown links to alternatives pages that do not exist after `buildAnalogGroups`. Use **plain text** for unmapped service names.
- This change set must add a Typical global services line to **every** subcategory listed above before merge.

## Testing / verification

1. `npm run build` succeeds.
2. `npm run verify` succeeds (existing brand/SEO checks).
3. Manual checks against generated `build/`:
   - Overview HTML/content includes `/alternatives/` link.
   - Keyword map Global service cells contain `<a href="/alternatives/...">`.
   - Spot-check at least Cloud Platform & Hosting, Payments, Push, Maps subcategory copy for the Typical global services line.
4. Optionally open local serve and click one Global service link into an alternatives page.

## Success criteria

- Guide Overview surfaces a clear path to `/alternatives/`.
- Every keyword-map Global service name is clickable to its alternatives page.
- Every subcategory guide section names typical international services on its own line.
- Copy remains accurate (research resource, not endorsement) while more search-intent friendly.

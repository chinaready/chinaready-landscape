# Insights competitor content strategy (AppInChina)

Date: 2026-08-07  
Status: Approved for implementation planning  
Primary competitor: [AppInChina Blog](https://appinchina.co/blog/)  
Publishing surface: [chinaready.co/insights](https://chinaready.co/insights)

## 1. Goal

Win SERP parity on AppInChina’s high-value organic URLs with Chinaready Insights pages that are shorter, higher signal-density, and visually clearer—not encyclopedic mirrors.

Differentiation: decision-first structure + diagrams. Avoid matching their bulk, license encyclopedias, or ad-platform factory content.

## 2. Success criteria

1. Every AppInChina **P0/P1** URL has a Chinaready Insights counterpart **or** an explicit `merge` pointer to a live hub page.
2. Articles are decision-readable: direct answer first, low noise, tables over long prose where possible.
3. **P0** posts ship with at least one custom primary diagram; **P1/P2** use template/AI diagrams.
4. Primary CTA on every article: [https://chinaready.co/contact/](https://chinaready.co/contact/).
5. Sprint ends only when the scored gap table has no unfinished P0/P1 rows.

## 3. Scope

### In scope

- Competitive audit of the full AppInChina blog corpus (~150 URLs).
- Scoring with a short-term paid API (**DataForSEO**), then P0/P1/P2/merge/skip.
- Core-cluster coverage at near one-to-one SERP pairing.
- Selective peripheral coverage when the query can naturally lead to contact.
- Same-cluster long-tail merge (especially multi-platform ads).
- Article template, diagram rules, SEO/GEO rules, sprint operating model.
- Spec and implementation plan living in this landscape repo for program tracking; **content ships on chinaready.co Insights** (mvp-1 / main site), not as Landscape guide pages.

### Out of scope (this phase)

- Landscape `/alternatives/` links or Landscape-hosted guide content (deferred; add later).
- Assessment / Diagnose as default CTAs (contact only for now).
- Full mirror of every AppInChina ads-platform or vertical-license encyclopedia.
- Weakly related vertical licenses (e.g. food GACC, travel agency, school/medical licenses) unless scoring later proves exceptional and funnel-fit.
- News/regulatory churn posts unless they update a P0 pillar.

## 4. Approach

**One-to-one SERP pairing with forced within-cluster merge.**

- Core topics: pair high-scoring AppInChina guides with dense Chinaready Insights.
- Peripheral: keep only high-score + funnel-fit URLs.
- When ≥3 overlapping same-cluster posts exist (e.g. many “X Ads in China” guides): publish one map/hub + at most 3–4 platform pages; mark the rest `merge`.

Rejected alternatives:

- Hub-only (too slow for explicit “cover high-SEO URLs” goal).
- Thin-first then thicken (conflicts with readability / density bar).

## 5. Competitive audit pipeline

### Week 0 (1–2 days)

1. Crawl all `https://appinchina.co/blog/` article URLs.
2. Pull per-URL metrics from DataForSEO (estimated organic traffic, head terms, difficulty, coarse SERP/backlink signals as available).
3. Label each row: `core` | `peripheral_keep` | `merge` | `skip`.
4. Freeze a gap table (CSV or equivalent) with: competitor URL, head term(s), score, Chinaready action, target slug, cluster, priority, merge target (if any).

**Why DataForSEO:** API-first, usage-based, easy to batch ~150 URLs from an agent/script for a short sprint. Optional later: Ahrefs UI cross-check; automation stays on DataForSEO.

### Scoring

```text
Score = 0.45*TrafficNorm + 0.25*IntentFit + 0.20*FunnelFit + 0.10*Winnability
```

| Signal | Meaning |
| --- | --- |
| TrafficNorm | Normalized tool traffic estimate |
| IntentFit | Core cluster high; peripheral_keep medium; skip → 0 |
| FunnelFit | Natural path to `/contact/` (foreign team stuck on a China launch decision) |
| Winnability | Non-branded, clear intent, room for decision + measured/engineering angle |

### Priority buckets

| Bucket | Rule | Action |
| --- | --- | --- |
| P0 | High score ∩ core (or rare peripheral with very strong funnel) | One-to-one page; custom primary diagram; first half of sprint |
| P1 | Mid-high core, or high peripheral_keep | Pair or short hub; template/AI diagram |
| P2 | Mid score, mergeable | Absorb into hub FAQ/section; standalone only if post-publish demand appears |
| Skip | Low score or weak brand fit | Document reason; do not write |

Re-check cluster completion with light DataForSEO / GSC sampling; do not declare the sprint done while P0/P1 rows remain open.

## 6. Topic clusters

### Core (primary battlefield)

1. **Filing & licenses (digital product entry):** ICP Filing, ICP License (B25), Mobile App Filing, Mini Program Filing, VATS (app/web-relevant), AIGC Filing, traffic/PSB compliance tied to filing.
2. **Publish & distribute:** publish app/game in China, Apple App Store China, Android store directory, Google Play in China.
3. **WeChat surface (selective):** Mini Program publish/filing/dev, Official Account—keep when contact-funnel clear; merge pure ops encyclopedias.
4. **Access & infra:** website not working in China, China accessibility, Docker Hub, SaaS performance, direct connect / tunnel patterns.
5. **Privacy / data (product-relevant):** PIPIA, cross-border transfer, real-name, age verification, content review—standalone only if high score; else fold into compliance hubs.

### Peripheral keep (few, sharp)

High-score platform marketing/ads queries where a foreign company still needs a clear “how to start” answer (e.g. WeChat Ads, Douyin Ads, Baidu Ads). All other platform-ads URLs merge into one China ads map (+ ≤3–4 platform pages).

### Skip (default)

Food GACC, travel/education/medical vertical licenses, pure news churn, weak SaaS/app-entry relevance.

## 7. Article format

Default: English Insights **Guide**, ~1,200–2,200 words.

1. **Direct answer** (40–80 words): verdict / who needs this.
2. **Decision diagram** (P0 custom; P1/P2 template).
3. **Critical path:** steps or option comparison (tables preferred).
4. **China-specific failure points** only (filing entity, traffic termination, store rules, etc.).
5. **Chinaready difference block** (short): engineering / measured angle—not a long sales pitch.
6. **FAQ** (3–6): long-tail + GEO-quotable facts.
7. **CTA:** [https://chinaready.co/contact/](https://chinaready.co/contact/) only.

### Titles

Target the head term; prefer question or outcome phrasing over empty “Complete Guide” spam. Subtitle may carry the full intent.

### Diagrams

- P0: 1 primary custom diagram (flow / decision / architecture); optional second comparison figure.
- P1/P2: 1 template or AI figure in the existing Insights visual language.
- Diagram copy in English; Chinese product names as `English (中文)` when useful.

## 8. SEO and GEO

### SEO

- One primary keyword per URL; H2s cover secondary intents without synonym stuffing.
- Internal links within Insights clusters (hub ↔ children).
- **No Landscape links in this phase.**
- P0 regulatory/store pages: refresh on policy change; keep a visible “Last verified” date.

### GEO

- Lead with short, citable fact sentences.
- Explicit definition blocks where competitors blur terms (e.g. ICP Filing vs ICP License).
- FAQ structured for extraction.
- Minimal disclaimer noise.
- Ensure Insights URLs remain crawlable on chinaready.co; align with any existing site-level AI/index surfaces when those exist on the main site.

## 9. Sprint operations

| Phase | Output |
| --- | --- |
| W0 | Full crawl + DataForSEO scores + frozen P0/P1/P2/merge/skip table |
| Sprint loop | ~20 Insights assets/week until P0/P1 clear (mix of new pages + merge expansions into hubs) |
| Cluster order | Filing → Publish → Access/Infra → WeChat → Privacy/Data → peripheral ads |
| Stop | No open P0/P1 in the gap table |
| Steady state | Decide cadence only after the list is cleared (not locked in this design) |

Weekly quality sample: 3 random new posts checked for direct answer, noise, primary diagram, CTA=`/contact/`.

## 10. Metrics

| Metric | Definition |
| --- | --- |
| Coverage | P0/P1 completion rate = 100% (merge-to-live-hub counts) |
| Quality | Weekly sample pass rate on format checklist |
| SEO | GSC impressions/clicks on target queries 2–4 weeks post-publish; optional tool rank checks |
| GEO | Quarterly: 5 P0 questions—do models cite Chinaready definition sentences? |

## 11. Deliverables after this design

1. This design spec (committed).
2. Implementation plan via writing-plans (audit script, gap table schema, article template, diagram templates, first sprint batch order).
3. Gap table populated with DataForSEO (execution phase).
4. Insights articles published on chinaready.co (execution phase; main site repo).

## 12. Explicit non-goals / deferrals

- Landscape cross-linking and alternatives co-strategy: **later**.
- Default CTA to Assessment or Diagnose: **later** if contact conversion data warrants.
- Steady-state publishing frequency: **after** P0/P1 clearance.

# Insights Competitor Content Strategy Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Score AppInChina’s blog with DataForSEO, freeze a P0/P1/P2 gap table, switch Insights CTAs to `/contact/`, and publish dense SERP-parity Guides on `chinaready.co/insights` until P0/P1 rows are cleared (~20/week).

**Architecture:** Program tooling and the gap table live in `china-landscape` (`research/appinchina-gap/`). Article shipping happens in sibling repo `mvp-1` (`site/src/content/insights/<slug>/`). No Landscape links this phase. Closing CTA is always `/contact/`.

**Tech Stack:** Node.js 22+ (landscape scripts), DataForSEO REST API, Astro content collections (mvp-1), Vitest (mvp-1 + landscape script tests), English Insights Guides with co-located `cover.webp` + diagram assets.

## Global Constraints

- Spec: `docs/superpowers/specs/2026-08-07-insights-competitor-content-strategy-design.md`
- Publishing surface: `https://chinaready.co/insights/<slug>/` only (mvp-1).
- Primary CTA on every Insights article chrome: `https://chinaready.co/contact/` (path `/contact/`).
- No Landscape `/alternatives/` links in this phase.
- English audience copy; Chinese product names as `English (中文)` on first useful mention.
- Article body target: ~1,200–2,200 words; decision-first; FAQ max 6 (prefer frontmatter `faq`).
- Diagrams: P0 custom primary; P1/P2 template/AI; one primary figure minimum.
- Cadence: ~20 Insights assets/week until gap table has zero open P0/P1.
- `docs/` is gitignored in landscape — commit specs/plans/research CSVs with `git add -f`.
- Do not edit Explore (`landscape.yml`) or Guide (`guide.yml`) for this program.

## File map

| Path | Responsibility |
| --- | --- |
| `research/appinchina-gap/README.md` | How to run audit + interpret columns |
| `research/appinchina-gap/urls.json` | Crawled competitor article URLs |
| `research/appinchina-gap/gap-table.csv` | Frozen scored backlog (source of truth) |
| `research/appinchina-gap/existing-coverage.json` | Map competitor URL → existing Chinaready slug or null |
| `scripts/appinchina-gap/crawl-blog.mjs` | Fetch blog index → `urls.json` |
| `scripts/appinchina-gap/score-urls.mjs` | DataForSEO pull + Score formula → CSV |
| `scripts/appinchina-gap/label-and-prioritize.mjs` | Cluster labels, merge/skip, P0–P2 |
| `scripts/appinchina-gap/lib/scoring.mjs` | Pure scoring helpers (unit-tested) |
| `scripts/appinchina-gap/lib/scoring.test.mjs` | Scoring unit tests |
| `../mvp-1/site/src/pages/insights/[slug].astro` | Article closing CTA → `/contact/` |
| `../mvp-1/site/src/pages/insights.astro` | Index CTA → `/contact/` (aligned) |
| `../mvp-1/site/src/content/insights/<slug>/` | New Guides (`index.en.md`, `cover.webp`, diagrams) |
| `../mvp-1/docs/editorial/insights-competitor-guide-template.md` | Authoring template + QA checklist |

---

### Task 1: Gap-table schema + blog URL crawl

**Files:**
- Create: `research/appinchina-gap/README.md`
- Create: `scripts/appinchina-gap/crawl-blog.mjs`
- Create: `research/appinchina-gap/urls.json` (generated)
- Test: run script; assert URL count ≥ 140

**Interfaces:**
- Consumes: `https://appinchina.co/blog/` HTML
- Produces: `urls.json` as `{ "fetchedAt": ISO, "source": "https://appinchina.co/blog/", "urls": string[] }` where each URL is absolute `https://appinchina.co/blog/<slug>/`

- [ ] **Step 1: Write README column contract**

Create `research/appinchina-gap/README.md` with exact CSV columns:

```text
competitor_url,title,head_term,traffic,keyword_count,traffic_norm,intent_fit,funnel_fit,winnability,score,cluster,label,priority,chinaready_slug,chinaready_action,merge_target,notes
```

`chinaready_action` enum: `write` | `expand` | `merge` | `skip` | `done`  
`priority` enum: `P0` | `P1` | `P2` | `skip`  
`label` enum: `core` | `peripheral_keep` | `merge` | `skip`  
`cluster` enum: `filing` | `publish` | `wechat` | `access_infra` | `privacy_data` | `ads_peripheral` | `other_skip`

- [ ] **Step 2: Implement crawler**

Create `scripts/appinchina-gap/crawl-blog.mjs`:

```js
#!/usr/bin/env node
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outPath = join(__dirname, "../../research/appinchina-gap/urls.json");
const SOURCE = "https://appinchina.co/blog/";

const res = await fetch(SOURCE, {
  headers: { "user-agent": "ChinareadyGapAudit/1.0 (+https://chinaready.co)" },
});
if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
const html = await res.text();
const urls = [
  ...new Set(
    [...html.matchAll(/https?:\/\/appinchina\.co\/blog\/[a-z0-9-]+\/?/gi)].map((m) => {
      const u = m[0].replace(/\/?$/, "/");
      return u.startsWith("http") ? u : `https://appinchina.co${u}`;
    }),
  ),
].filter((u) => !u.includes("/blog/page/") && u !== SOURCE);

if (urls.length < 140) {
  throw new Error(`Expected ≥140 blog URLs, got ${urls.length}`);
}

mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(
  outPath,
  JSON.stringify({ fetchedAt: new Date().toISOString(), source: SOURCE, urls: urls.sort() }, null, 2) + "\n",
);
console.log(`Wrote ${urls.length} URLs → ${outPath}`);
```

- [ ] **Step 3: Run crawl**

Run: `node scripts/appinchina-gap/crawl-blog.mjs`  
Expected: `Wrote N URLs` with N ≥ 140; `research/appinchina-gap/urls.json` exists.

- [ ] **Step 4: Commit**

```bash
git add -f research/appinchina-gap/README.md research/appinchina-gap/urls.json scripts/appinchina-gap/crawl-blog.mjs
git commit -m "Add AppInChina blog crawl and gap-table schema."
```

---

### Task 2: Scoring library (unit-tested)

**Files:**
- Create: `scripts/appinchina-gap/lib/scoring.mjs`
- Create: `scripts/appinchina-gap/lib/scoring.test.mjs`
- Modify: `package.json` (add `"test:appinchina-gap": "node --test scripts/appinchina-gap/lib/scoring.test.mjs"`)

**Interfaces:**
- Produces:
  - `normalizeTraffic(traffic: number, maxTraffic: number): number` → 0..1
  - `intentFit(label: string): number` → core=1, peripheral_keep=0.6, merge=0.3, skip=0
  - `computeScore({ trafficNorm, intentFit, funnelFit, winnability }): number`  
    `0.45*trafficNorm + 0.25*intentFit + 0.20*funnelFit + 0.10*winnability`, rounded to 4 decimals
  - `priorityFrom({ score, label }): "P0"|"P1"|"P2"|"skip"`

- [ ] **Step 1: Write failing tests**

```js
import test from "node:test";
import assert from "node:assert/strict";
import { normalizeTraffic, intentFit, computeScore, priorityFrom } from "./scoring.mjs";

test("normalizeTraffic scales to 0..1", () => {
  assert.equal(normalizeTraffic(50, 100), 0.5);
  assert.equal(normalizeTraffic(0, 100), 0);
  assert.equal(normalizeTraffic(100, 100), 1);
});

test("intentFit maps labels", () => {
  assert.equal(intentFit("core"), 1);
  assert.equal(intentFit("peripheral_keep"), 0.6);
  assert.equal(intentFit("merge"), 0.3);
  assert.equal(intentFit("skip"), 0);
});

test("computeScore uses published weights", () => {
  const s = computeScore({ trafficNorm: 1, intentFit: 1, funnelFit: 1, winnability: 1 });
  assert.equal(s, 1);
  const mid = computeScore({ trafficNorm: 0, intentFit: 1, funnelFit: 0, winnability: 0 });
  assert.equal(mid, 0.25);
});

test("priorityFrom buckets", () => {
  assert.equal(priorityFrom({ score: 0.75, label: "core" }), "P0");
  assert.equal(priorityFrom({ score: 0.55, label: "core" }), "P1");
  assert.equal(priorityFrom({ score: 0.4, label: "merge" }), "P2");
  assert.equal(priorityFrom({ score: 0.9, label: "skip" }), "skip");
});
```

- [ ] **Step 2: Run tests (expect fail)**

Run: `npm run test:appinchina-gap`  
Expected: FAIL — `Cannot find module` or assertion failures.

- [ ] **Step 3: Implement scoring.mjs**

```js
export function normalizeTraffic(traffic, maxTraffic) {
  if (!maxTraffic || maxTraffic <= 0) return 0;
  return Math.min(1, Math.max(0, traffic / maxTraffic));
}

export function intentFit(label) {
  return { core: 1, peripheral_keep: 0.6, merge: 0.3, skip: 0 }[label] ?? 0;
}

export function computeScore({ trafficNorm, intentFit: i, funnelFit, winnability }) {
  return Number((0.45 * trafficNorm + 0.25 * i + 0.2 * funnelFit + 0.1 * winnability).toFixed(4));
}

export function priorityFrom({ score, label }) {
  if (label === "skip") return "skip";
  if (label === "merge") return score >= 0.35 ? "P2" : "skip";
  if (score >= 0.65 && (label === "core" || label === "peripheral_keep")) return "P0";
  if (score >= 0.45) return "P1";
  if (score >= 0.3) return "P2";
  return "skip";
}
```

- [ ] **Step 4: Run tests (expect pass)**

Run: `npm run test:appinchina-gap`  
Expected: PASS (all 4 tests).

- [ ] **Step 5: Commit**

```bash
git add package.json scripts/appinchina-gap/lib/scoring.mjs scripts/appinchina-gap/lib/scoring.test.mjs
git commit -m "Add AppInChina gap scoring helpers with unit tests."
```

---

### Task 3: DataForSEO score script + labeled gap CSV

**Files:**
- Create: `scripts/appinchina-gap/score-urls.mjs`
- Create: `scripts/appinchina-gap/label-and-prioritize.mjs`
- Create: `research/appinchina-gap/gap-table.csv` (generated)
- Requires: env `DATAFORSEO_LOGIN`, `DATAFORSEO_PASSWORD` (or `DATAFORSEO_API_KEY` basic auth pair)

**Interfaces:**
- Consumes: `urls.json`, DataForSEO `dataforseo_labs/google/bulk_traffic_estimation/live` + optional ranked keywords per domain path
- Produces: `gap-table.csv` with every URL labeled and prioritized

- [ ] **Step 1: Implement `score-urls.mjs`**

```js
#!/usr/bin/env node
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { normalizeTraffic } from "./lib/scoring.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "../..");
const { urls } = JSON.parse(readFileSync(join(root, "research/appinchina-gap/urls.json"), "utf8"));
const login = process.env.DATAFORSEO_LOGIN;
const password = process.env.DATAFORSEO_PASSWORD;
if (!login || !password) throw new Error("Set DATAFORSEO_LOGIN and DATAFORSEO_PASSWORD");

const auth = Buffer.from(`${login}:${password}`).toString("base64");

async function dfs(path, payload) {
  const res = await fetch(`https://api.dataforseo.com/v3/${path}`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  const json = await res.json();
  if (json.status_code !== 20000) {
    throw new Error(`DataForSEO ${path} failed: ${json.status_message || res.status}`);
  }
  return json;
}

// Batch targets (DataForSEO allows multiple tasks; keep chunks ≤ 100).
const trafficByUrl = new Map();
for (let i = 0; i < urls.length; i += 50) {
  const chunk = urls.slice(i, i + 50);
  const json = await dfs("dataforseo_labs/google/bulk_traffic_estimation/live", [
    {
      targets: chunk,
      language_code: "en",
      location_code: 2840, // United States — English research demand for China-entry queries
    },
  ]);
  for (const task of json.tasks || []) {
    for (const item of task.result || []) {
      const target = item.target || item.url;
      const etv = item.metrics?.organic?.etv ?? item.etv ?? 0;
      if (target) trafficByUrl.set(target.replace(/\/?$/, "/"), Number(etv) || 0);
    }
  }
}

const maxTraffic = Math.max(1, ...trafficByUrl.values());
const rows = urls.map((url) => {
  const u = url.replace(/\/?$/, "/");
  const traffic = trafficByUrl.get(u) ?? 0;
  return {
    competitor_url: u,
    traffic,
    traffic_norm: normalizeTraffic(traffic, maxTraffic),
  };
});

writeFileSync(
  join(root, "research/appinchina-gap/traffic-raw.json"),
  JSON.stringify({ fetchedAt: new Date().toISOString(), maxTraffic, rows }, null, 2) + "\n",
);
console.log(`Traffic rows: ${rows.length}; maxTraffic=${maxTraffic}`);
```

If `bulk_traffic_estimation` rejects full URLs in the account plan, switch targets to `appinchina.co` ranked keywords live endpoint and aggregate `etv` by `url` path — keep the same `traffic-raw.json` shape.

- [ ] **Step 2: Implement `label-and-prioritize.mjs`**

Rules (encode literally):

```js
function classify(url, title = "") {
  const t = `${url} ${title}`.toLowerCase();
  if (/(gacc|travel-agency|school-license|medical-device|drug-information|education-business|food-into-china|negative-list|administrative-licensing)/.test(t)) {
    return { cluster: "other_skip", label: "skip", funnelFit: 0, winnability: 0.2 };
  }
  if (/(icp|filing|vats|aigc|psb|license-b25|app-filing|mini-program-filing)/.test(t)) {
    return { cluster: "filing", label: "core", funnelFit: 0.9, winnability: 0.85 };
  }
  if (/(publish.*(app|game)|app-store|android|google-play|apple-app-store|top-15-app-stores|official-chinese-app-stores)/.test(t)) {
    return { cluster: "publish", label: "core", funnelFit: 0.85, winnability: 0.8 };
  }
  if (/(wechat-mini|wechat-official|mini-program)/.test(t)) {
    return { cluster: "wechat", label: "core", funnelFit: 0.8, winnability: 0.75 };
  }
  if (/(website-not-work|accessible-in-china|docker-hub|saas-performance|direct-connect|http-tunnel)/.test(t)) {
    return { cluster: "access_infra", label: "core", funnelFit: 0.9, winnability: 0.9 };
  }
  if (/(pipia|cross-border-data|real-name|age-verification|content-review|privacy)/.test(t)) {
    return { cluster: "privacy_data", label: "core", funnelFit: 0.7, winnability: 0.7 };
  }
  if (/(wechat-ads|douyin-ads|baidu-search-ads|baidu-ppc|xiaohongshu-ads|rednote-ads)/.test(t)) {
    return { cluster: "ads_peripheral", label: "peripheral_keep", funnelFit: 0.65, winnability: 0.7 };
  }
  if (/(-ads-in-china|ads-in-china|tmall-ads|taobao-ads|jd-ads|zhihu-ads|taptap-ads|maimai-ads|kuaishou-ads|bilibili-ads|weibo-ads|meta-ads|google-ads)/.test(t)) {
    return { cluster: "ads_peripheral", label: "merge", funnelFit: 0.4, winnability: 0.5, merge_target: "china-ads-stack-map" };
  }
  return { cluster: "other_skip", label: "skip", funnelFit: 0.2, winnability: 0.3 };
}
```

Then `computeScore` + `priorityFrom`, set:

- `chinaready_action`: `skip` if priority skip; `merge` if label merge; else `write`
- `chinaready_slug`: kebab suggestion from URL path (prefix nothing; human edits later)
- Write CSV with header from Task 1

- [ ] **Step 3: Run score + label**

```bash
export DATAFORSEO_LOGIN=...
export DATAFORSEO_PASSWORD=...
node scripts/appinchina-gap/score-urls.mjs
node scripts/appinchina-gap/label-and-prioritize.mjs
```

Expected: `research/appinchina-gap/gap-table.csv` with ≥140 data rows; at least one `P0` in `filing` and `access_infra`.

- [ ] **Step 4: Human freeze pass (same session)**

Open CSV; for each `ads_peripheral` `merge` row confirm `merge_target=china-ads-stack-map`; bump any obvious brand-fit misses; do not delete rows.

- [ ] **Step 5: Commit**

```bash
git add -f research/appinchina-gap/traffic-raw.json research/appinchina-gap/gap-table.csv \
  scripts/appinchina-gap/score-urls.mjs scripts/appinchina-gap/label-and-prioritize.mjs
git commit -m "Score AppInChina blog URLs and freeze gap-table priorities."
```

---

### Task 4: Map existing Chinaready Insights coverage

**Files:**
- Create: `research/appinchina-gap/existing-coverage.json`
- Modify: `research/appinchina-gap/gap-table.csv` (`chinaready_action`/`chinaready_slug`/`priority` updates)

**Interfaces:**
- Consumes: mvp-1 folders under `../mvp-1/site/src/content/insights/*`
- Produces: coverage JSON + CSV rows marked `expand` or `done` where an existing Guide already owns the SERP

- [ ] **Step 1: Inventory live Insights slugs**

Run from landscape repo:

```bash
ls ../mvp-1/site/src/content/insights
```

Expected folders include at least:

```text
china-icp-and-psb-filing-explained
china-android-app-stores-for-foreign-publishers
apple-app-store-in-china-what-changed
firebase-alternatives-for-china
aws-china-what-works
azure-china-what-works
cloudflare-and-china-what-works
vercel-and-china-what-works
netlify-and-china-what-works
```

- [ ] **Step 2: Write existing-coverage.json**

```json
{
  "mappedAt": "2026-08-07",
  "maps": [
    {
      "competitor_url_substr": "chinas-icp-filing",
      "chinaready_slug": "china-icp-and-psb-filing-explained",
      "action": "expand",
      "note": "Owns ICP+PSB; may still need Mobile App Filing / License splits as new pages"
    },
    {
      "competitor_url_substr": "top-15-app-stores",
      "chinaready_slug": "china-android-app-stores-for-foreign-publishers",
      "action": "expand"
    },
    {
      "competitor_url_substr": "official-chinese-app-stores",
      "chinaready_slug": "china-android-app-stores-for-foreign-publishers",
      "action": "merge"
    },
    {
      "competitor_url_substr": "apple-app-store-china",
      "chinaready_slug": "apple-app-store-in-china-what-changed",
      "action": "expand"
    },
    {
      "competitor_url_substr": "how-can-i-publish-on-the-apple-app-store-china",
      "chinaready_slug": "apple-app-store-in-china-what-changed",
      "action": "expand"
    }
  ]
}
```

- [ ] **Step 3: Apply maps into gap-table.csv**

For each map: set `chinaready_slug`, set `chinaready_action` to `expand` or `merge`, keep priority unless competitor traffic is negligible (then `done` only after expand ships).

- [ ] **Step 4: Commit**

```bash
git add -f research/appinchina-gap/existing-coverage.json research/appinchina-gap/gap-table.csv
git commit -m "Map existing Insights coverage onto AppInChina gap table."
```

---

### Task 5: Switch Insights chrome CTA to `/contact/` (mvp-1)

**Files:**
- Modify: `../mvp-1/site/src/pages/insights/[slug].astro` (cta object ~lines 76–81)
- Modify: `../mvp-1/site/src/pages/insights.astro` (index cta ~line 53)
- Test: `../mvp-1/site` vitest acceptance or grep-based assertion

**Interfaces:**
- Produces: ClosingCta primary → `{ label: 'Contact us', to: '/contact/' }` (trailing slash OK if site convention uses `/contact`; match `contact.astro` routing — use `/contact` if that is the live path)

- [ ] **Step 1: Update article template CTA**

In `mvp-1/site/src/pages/insights/[slug].astro` replace:

```js
const cta = {
  title: 'Tell us where you are stuck in China.',
  subtitle: 'Share your product, stack, and timeline — we will point you to the next concrete step.',
  primaryCta: { label: 'Contact us', to: '/contact' },
  secondaryCta: { label: 'Explore all insights', to: '/insights' },
};
```

- [ ] **Step 2: Update insights index CTA**

In `mvp-1/site/src/pages/insights.astro`, set the same `primaryCta: { label: 'Contact us', to: '/contact' }`.

- [ ] **Step 3: Verify locally**

```bash
cd ../mvp-1/site && npm run build
rg -n "primaryCta|/intake|/contact" src/pages/insights
```

Expected: Insights pages’ `primaryCta.to` is `/contact`; article chrome no longer defaults to `/intake`.

- [ ] **Step 4: Commit in mvp-1**

```bash
cd ../mvp-1
git add site/src/pages/insights/\[slug\].astro site/src/pages/insights.astro
git commit -m "Point Insights primary CTA to contact for competitor-content sprint."
```

---

### Task 6: Authoring template + QA checklist (mvp-1)

**Files:**
- Create: `../mvp-1/docs/editorial/insights-competitor-guide-template.md`

**Interfaces:**
- Produces: copy-paste frontmatter + section order agents must follow for every `write`/`expand` row

- [ ] **Step 1: Write template file**

Include exactly:

```markdown
# Competitor-parity Insights Guide template

## Frontmatter

~~~yaml
---
title: "<≤ ~70 chars; question or outcome; avoid empty Complete Guide>"
excerpt: "<≤ card limits; include verdict>"
topic: Compliance | Distribution | Stack Readiness | Operations | Method
contentType: Guide
tags: []
cover: ./cover.webp
coverAlt: "<describe diagram/cover>"
date: YYYY-MM-DD
draft: true
faq:
  - q: "..."
    a: "..."
---
~~~

## Body order (required)

1. Direct answer (40–80 words)
2. Primary diagram image (`![...](./diagram-primary.webp)`)
3. Critical path (numbered steps or comparison table)
4. China-specific failure points only
5. Short Chinaready difference block (≤120 words; no hard sell)
6. FAQ via frontmatter `faq` (3–6)
7. Do **not** add Landscape links
8. Inline CTA language may mention contact once; chrome CTA is `/contact`

## QA gate (must pass before `draft: false`)

- [ ] Opens with a verdict, not background history
- [ ] 1,200–2,200 words (expand jobs may be shorter if adding a section)
- [ ] ≥1 primary diagram
- [ ] No AppInChina-style license encyclopedia dump
- [ ] English-first product names
- [ ] `draft: false` only after local `npm run build` in `mvp-1/site`
```

- [ ] **Step 2: Commit in mvp-1**

```bash
cd ../mvp-1
git add docs/editorial/insights-competitor-guide-template.md
git commit -m "Add Insights competitor-parity authoring template and QA gate."
```

---

### Task 7: Diagram production pack

**Files:**
- Create: `../mvp-1/docs/editorial/insights-diagram-pack.md`
- Create: `../mvp-1/site/public/images/insights/_templates/` (optional PNG/WebP starters) OR document AI prompt pack only if assets generated per article

**Interfaces:**
- Produces: three reusable diagram patterns + P0 vs P1/P2 rules

- [ ] **Step 1: Document patterns**

```markdown
# Insights diagram pack

## Patterns
1. **Decision tree** — yes/no filing or publish path
2. **Sequence** — ordered compliance / launch steps
3. **Compare** — two-path table visual (offshore vs Mainland)

## Rules
- P0: custom primary diagram (unique to article), deep-navy Insights visual language
- P1/P2: reuse pattern 1–3 with swapped labels; AI OK
- Export WebP; co-locate as `./diagram-primary.webp` in the article bundle
- Text in English; Chinese only inside parentheses when needed
```

- [ ] **Step 2: Commit in mvp-1**

```bash
cd ../mvp-1
git add docs/editorial/insights-diagram-pack.md
git commit -m "Document Insights diagram patterns for competitor sprint."
```

---

### Task 8: Sprint batch — Filing cluster (first ~8 assets)

**Files:**
- Create/Modify under `../mvp-1/site/src/content/insights/<slug>/`
- Update: `research/appinchina-gap/gap-table.csv` actions → `done` when shipped

**Interfaces:**
- Consumes: all `priority in (P0,P1)` AND `cluster=filing` AND `chinaready_action in (write,expand)` from gap-table
- Produces: live Guides with `draft: false`

Seed order if CSV not yet sorted (replace with CSV order after Task 3):

| slug | action | competitor intent |
| --- | --- | --- |
| `china-icp-and-psb-filing-explained` | expand | ICP Filing hub — tighten direct answer + diagram if missing |
| `china-mobile-app-filing` | write | Mobile App Filing complete guide |
| `china-icp-license-b25` | write | Commercial ICP License (B25) |
| `wechat-mini-program-filing` | write | WeChat Mini Program Filing |
| `china-aigc-filing` | write | AIGC Filing |
| `china-vats-licenses-for-digital-products` | write | VATS only as it affects apps/websites |
| `china-icp-filing-traffic-compliance` | write | Traffic must terminate on filed servers |
| `china-ads-stack-map` | write | Hub for merged ads URLs (create early for merge targets) |

- [ ] **Step 1: For each slug — scaffold bundle**

```bash
cd ../mvp-1/site/src/content/insights
mkdir -p china-mobile-app-filing
# add index.en.md from template + cover.webp + diagram-primary.webp
```

Frontmatter must validate against `content.config.ts` (title/excerpt length limits).

- [ ] **Step 2: Author body using Task 6 order**

Each article must include a direct-answer opening, primary diagram, failure-points section, and frontmatter `faq` (3–6).

- [ ] **Step 3: Build + set `draft: false`**

```bash
cd ../mvp-1/site && npm run build
```

Expected: build success; new routes under `dist/insights/<slug>/`.

- [ ] **Step 4: Mark CSV done + commit both repos**

```bash
# landscape
git add -f research/appinchina-gap/gap-table.csv
git commit -m "Mark filing-cluster gap rows done after Insights publish."

# mvp-1
git add site/src/content/insights
git commit -m "Publish filing-cluster Insights for AppInChina SERP parity."
```

- [ ] **Step 5: Deploy mvp-1 per that repo’s normal apex deploy path** when the batch is ready to ship (follow mvp-1 deploy rules / user ship preference).

---

### Task 9: Sprint loop — remaining clusters until P0/P1 clear

**Files:**
- Same Insights bundles in mvp-1
- `research/appinchina-gap/gap-table.csv` status updates in landscape

**Interfaces:**
- Consumes: open P0/P1 rows ordered `publish` → `access_infra` → `wechat` → `privacy_data` → `ads_peripheral`
- Produces: ~20 assets/week (new pages + merge expansions count)

- [ ] **Step 1: Export weekly queue**

```bash
# example: list open P0/P1
node -e "
const fs=require('fs');
const [h,...rows]=fs.readFileSync('research/appinchina-gap/gap-table.csv','utf8').trim().split(/\r?\n/);
const cols=h.split(',');
const i=Object.fromEntries(cols.map((c,idx)=>[c,idx]));
for (const line of rows) {
  const c=line.split(',');
  if (['P0','P1'].includes(c[i.priority]) && c[i.chinaready_action]!=='done') {
    console.log(c[i.priority], c[i.cluster], c[i.chinaready_action], c[i.chinaready_slug]||c[i.competitor_url]);
  }
}
"
```

- [ ] **Step 2: Author batch of ~20 using Task 6–7**

Merge rows: add FAQ/section to hub (`china-ads-stack-map` or cluster hub), do not create standalone pages.

- [ ] **Step 3: Weekly QA sample (3 articles)**

Check: direct answer, noise, diagram, chrome CTA `/contact`, no Landscape links.

- [ ] **Step 4: Commit + deploy batch; update CSV**

Repeat Step 1–4 until the export prints zero lines.

- [ ] **Step 5: Final freeze commit**

```bash
git add -f research/appinchina-gap/gap-table.csv
git commit -m "Close AppInChina P0/P1 gap table after Insights sprint."
```

---

### Task 10: Measurement snapshot (post-sprint)

**Files:**
- Create: `research/appinchina-gap/measurement-2026-Q3.md` (date as needed)

- [ ] **Step 1: Record coverage**

Document: total competitor URLs, P0/P1 done count, merge count, skip count, Insights URLs shipped.

- [ ] **Step 2: GSC notes**

After 2–4 weeks, paste top queries/impressions for new `/insights/` URLs (manual export OK).

- [ ] **Step 3: Commit**

```bash
git add -f research/appinchina-gap/measurement-2026-Q3.md
git commit -m "Record AppInChina Insights sprint coverage and early GSC notes."
```

---

## Spec coverage check

| Spec requirement | Task |
| --- | --- |
| DataForSEO full-corpus audit | 1–3 |
| P0/P1/P2/merge/skip | 2–3 |
| Core + selective peripheral + ads merge | 3, 8–9 |
| Insights-only surface; no Landscape links | 5–9 (template forbids) |
| Dense Guide format + diagrams | 6–8 |
| CTA `/contact/` | 5 |
| ~20/week until clear | 9 |
| Existing coverage reuse | 4 |
| Metrics | 10 |

## Placeholder / consistency self-review

- Scoring weights match spec (0.45 / 0.25 / 0.20 / 0.10).
- CTA path standardized to `/contact` to match mvp-1 routing.
- Cluster order matches spec: Filing → Publish → Access/Infra → WeChat → Privacy/Data → Ads.
- No Assessment/Diagnose default CTA; no Landscape link tasks.

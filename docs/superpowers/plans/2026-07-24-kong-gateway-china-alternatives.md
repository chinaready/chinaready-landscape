# Kong Gateway China Alternatives Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix `/alternatives/kong-gateway.html` so it maps Kong to Apache APISIX, Flomesh, and Higress, and explain that self-hosted Kong is viable in China while Konnect / cross-border control planes are Limited.

**Architecture:** Add a new `Service Mesh & Gateway` subcategory under `Infrastructure & Edge` with three landscape items whose `global_analogs` include `Kong Gateway`. Add an `EDITORIAL_OVERRIDES["kong-gateway"]` block in `scripts/seo-geo.mjs` (same pattern as Stripe / OneSignal). Refresh gap-catalog overrides so research data stays aligned. Update `guide.yml` and bump the verify subcategory count from 21 to 22.

**Tech Stack:** `landscape.yml` + `hosted_logos/` SVGs, `guide.yml`, Node `scripts/seo-geo.mjs` / `scripts/verify-chinaready-brand.mjs`, Python `scripts/generate-gap-catalog.py`, `npm run validate|build|verify`.

**Spec:** `docs/superpowers/specs/2026-07-24-kong-gateway-china-alternatives-design.md`

## Global Constraints

- Keep Kong availability labeled **Limited** (self-host viable; Konnect / cross-border / compliance constrained).
- Do not add Kong Gateway itself as a China landscape product.
- Do not add Aliyun/Tencent managed API Gateway SaaS in this change.
- Subcategory name must be exactly `Service Mesh & Gateway`.
- Shortlist must be exactly Apache APISIX, Flomesh, Higress.
- Higress homepage: use `https://higress.ai/` (official; corrects design-doc `higress.io`).
- Follow existing annotation field set and Chinaready logo SVG conventions (simple wordmark OK).
- Tone: research resource, not endorsement.
- After each task that changes data/scripts: commit with a focused message.

## File map

| File | Responsibility |
|------|----------------|
| `hosted_logos/apache-apisix.svg` | Logo for Apache APISIX |
| `hosted_logos/flomesh.svg` | Logo for Flomesh |
| `hosted_logos/higress.svg` | Logo for Higress |
| `landscape.yml` | New subcategory + three items |
| `guide.yml` | Overview table + Infrastructure category copy + new subcategory guidance |
| `scripts/seo-geo.mjs` | `EDITORIAL_OVERRIDES["kong-gateway"]` |
| `scripts/generate-gap-catalog.py` | `OVERRIDES` entry for Kong → three products |
| `research/global-services-gap-catalog.json` | Regenerated Kong candidates / confidence |
| `scripts/verify-chinaready-brand.mjs` | Subcategory count 22 + Kong page assertions |

---

### Task 1: Add SVG logos

**Files:**
- Create: `hosted_logos/apache-apisix.svg`
- Create: `hosted_logos/flomesh.svg`
- Create: `hosted_logos/higress.svg`

**Interfaces:**
- Consumes: none
- Produces: logo filenames referenced by Task 2 (`apache-apisix.svg`, `flomesh.svg`, `higress.svg`)

- [ ] **Step 1: Create `hosted_logos/apache-apisix.svg`**

```svg
<svg xmlns="http://www.w3.org/2000/svg" width="320" height="180" viewBox="0 0 320 180" role="img" aria-labelledby="title">
  <title>Apache APISIX</title>
  <rect width="320" height="180" fill="#ffffff"/>
  <rect x="24" y="72" width="8" height="36" rx="2" fill="#E8433A"/>
  <text x="44" y="100" fill="#0C1E3E" font-family="Arial, Helvetica, sans-serif" font-size="34" font-weight="700">Apache APISIX</text>
</svg>
```

- [ ] **Step 2: Create `hosted_logos/flomesh.svg`**

```svg
<svg xmlns="http://www.w3.org/2000/svg" width="320" height="180" viewBox="0 0 320 180" role="img" aria-labelledby="title">
  <title>Flomesh</title>
  <rect width="320" height="180" fill="#ffffff"/>
  <rect x="24" y="72" width="8" height="36" rx="2" fill="#005BAC"/>
  <text x="44" y="100" fill="#0C1E3E" font-family="Arial, Helvetica, sans-serif" font-size="42" font-weight="700">Flomesh</text>
</svg>
```

- [ ] **Step 3: Create `hosted_logos/higress.svg`**

```svg
<svg xmlns="http://www.w3.org/2000/svg" width="320" height="180" viewBox="0 0 320 180" role="img" aria-labelledby="title">
  <title>Higress</title>
  <rect width="320" height="180" fill="#ffffff"/>
  <rect x="24" y="72" width="8" height="36" rx="2" fill="#FF6A00"/>
  <text x="44" y="100" fill="#0C1E3E" font-family="Arial, Helvetica, sans-serif" font-size="42" font-weight="700">Higress</text>
</svg>
```

- [ ] **Step 4: Commit**

```bash
git add hosted_logos/apache-apisix.svg hosted_logos/flomesh.svg hosted_logos/higress.svg
git commit -m "$(cat <<'EOF'
Add wordmark logos for APISIX, Flomesh, and Higress.

EOF
)"
```

---

### Task 2: Add `Service Mesh & Gateway` landscape entries

**Files:**
- Modify: `landscape.yml` — insert new subcategory after `Content Delivery Network (CDN)` (after the Cloudflare China Network item, before `Application Platform`)

**Interfaces:**
- Consumes: logo filenames from Task 1
- Produces: landscape items with `global_analogs: Kong Gateway` so `buildAnalogGroups` creates mapped Kong candidates

- [ ] **Step 1: Insert the subcategory and three items**

Place this block after the CDN subcategory closes and before `- category: Application Platform`:

```yaml
      - subcategory:
        name: Service Mesh & Gateway
        items:
          - item:
            name: Apache APISIX
            homepage_url: https://apisix.apache.org/
            logo: apache-apisix.svg
            description: Apache APISIX is a high-performance open-source API gateway built on OpenResty and Nginx, widely used for mainland China self-hosted API traffic management.
            extra:
              annotations:
                global_analogs: Kong Gateway
                replacement_fit: direct
                china_context: Closest common Kong substitute in China. Same OpenResty/Nginx lineage and Lua plugin model; strong mainland community adoption and commercial support ecosystem.
                vendor_type: china-saas
                evidence_level: medium
                availability_status: generally-available
                global_availability_in_china: limited
                metadata_name: "Apache APISIX"
                primary_category: "Infrastructure & Edge"
                official_website: "https://apisix.apache.org/"
                github: "https://github.com/apache/apisix"
                social_media: "to-be-supplied-by-contributor"
                product_overview: "Apache APISIX is a high-performance open-source API gateway built on OpenResty and Nginx, widely used for mainland China self-hosted API traffic management."
                alternative_to: "China-market alternative or deployment route for: Kong Gateway."
                global_alternatives: "Kong Gateway"
                organization: "Apache Software Foundation / API7"
                organization_overview: "Apache APISIX is an Apache top-level project with strong China-origin community and commercial ecosystem around API gateway and traffic management."
                developer_docs: "https://apisix.apache.org/docs/"
          - item:
            name: Flomesh
            homepage_url: https://flomesh.io/
            logo: flomesh.svg
            description: Flomesh provides China-origin service mesh and API gateway capabilities using a Pipy dataplane for east-west and north-south traffic management.
            extra:
              annotations:
                global_analogs: Kong Gateway
                replacement_fit: partial
                china_context: China vendor option when teams need gateway plus service-mesh traffic management rather than a pure Kong-style edge gateway replacement.
                vendor_type: china-saas
                evidence_level: medium
                availability_status: generally-available
                global_availability_in_china: limited
                metadata_name: "Flomesh"
                primary_category: "Infrastructure & Edge"
                official_website: "https://flomesh.io/"
                github: "https://github.com/flomesh-io/fsm"
                social_media: "to-be-supplied-by-contributor"
                product_overview: "Flomesh provides China-origin service mesh and API gateway capabilities using a Pipy dataplane for east-west and north-south traffic management."
                alternative_to: "China-market alternative or deployment route for: Kong Gateway."
                global_alternatives: "Kong Gateway"
                organization: "Flomesh"
                organization_overview: "Flomesh builds cloud-native traffic management products spanning API gateway and service mesh use cases for China and global Kubernetes environments."
                developer_docs: "https://flomesh.io/"
          - item:
            name: Higress
            homepage_url: https://higress.ai/
            logo: higress.svg
            description: Higress is a cloud-native API gateway based on Envoy, commonly evaluated in Alibaba Cloud-native stacks as a Kong-style traffic entry alternative.
            extra:
              annotations:
                global_analogs: Kong Gateway
                replacement_fit: partial
                china_context: Strong fit for teams already on Alibaba Cloud-native infrastructure who want an Envoy-based API gateway rather than an OpenResty/Kong stack.
                vendor_type: china-cloud
                evidence_level: medium
                availability_status: generally-available
                global_availability_in_china: limited
                metadata_name: "Higress"
                primary_category: "Infrastructure & Edge"
                official_website: "https://higress.ai/"
                github: "https://github.com/alibaba/higress"
                social_media: "to-be-supplied-by-contributor"
                product_overview: "Higress is a cloud-native API gateway based on Envoy, commonly evaluated in Alibaba Cloud-native stacks as a Kong-style traffic entry alternative."
                alternative_to: "China-market alternative or deployment route for: Kong Gateway."
                global_alternatives: "Kong Gateway"
                organization: "Alibaba Cloud / Higress"
                organization_overview: "Higress is an Alibaba-origin open-source cloud-native API gateway project used for AI and microservice traffic management."
                developer_docs: "https://higress.cn/en/docs/latest/overview/what-is-higress/"
```

- [ ] **Step 2: Validate landscape data**

Run: `npm run validate:data`  
Expected: exit 0 (no schema errors for the new subcategory/items)

- [ ] **Step 3: Commit**

```bash
git add landscape.yml
git commit -m "$(cat <<'EOF'
Add Service Mesh & Gateway entries for APISIX, Flomesh, and Higress.

EOF
)"
```

---

### Task 3: Update Guide taxonomy copy

**Files:**
- Modify: `guide.yml`

**Interfaces:**
- Consumes: subcategory name `Service Mesh & Gateway`
- Produces: Overview table + Infrastructure category docs listing the new subcategory and Kong as a typical global service

- [ ] **Step 1: Update Overview taxonomy table row**

Change the Infrastructure & Edge row from:

```html
<td>Cloud Platform & Hosting; Managed DNS Provider; Content Delivery Network (CDN)</td>
```

to:

```html
<td>Cloud Platform & Hosting; Managed DNS Provider; Content Delivery Network (CDN); Service Mesh & Gateway</td>
```

- [ ] **Step 2: Expand Infrastructure & Edge category intro**

Replace the category `content` opening so it mentions gateways/mesh as well as cloud/DNS/CDN. Exact replacement:

```yaml
  - category: "Infrastructure & Edge"
    content: |
      Chinaready tracks infrastructure and edge services that global software teams need when preparing a China launch. This category covers cloud platforms, DNS, CDN, and service mesh / API gateway products used to host and route applications for mainland China users. China deployments often require region-specific cloud accounts, ICP filing, CDN choices, and in-country traffic-management stacks that differ from a global default.
```

- [ ] **Step 3: Add subcategory guide block after CDN**

Insert after the CDN subcategory block:

```yaml
      - subcategory: "Service Mesh & Gateway"
        content: |
          Use this category for API gateways, service mesh dataplanes, and cloud-native traffic-management products.

          For Kong Gateway, treat mainland self-hosted Kong OSS/Enterprise as generally workable, and treat Kong Konnect / cross-border control-plane sync as the Limited path. Prefer in-country self-hosting when staying on Kong; otherwise evaluate Apache APISIX, Flomesh, or Higress. See the [Kong Gateway alternatives map](/alternatives/kong-gateway.html).

          Typical global services: [Kong Gateway](/alternatives/kong-gateway.html).
```

- [ ] **Step 4: Commit**

```bash
git add guide.yml
git commit -m "$(cat <<'EOF'
Document Service Mesh & Gateway in the landscape guide.

EOF
)"
```

---

### Task 4: Fail-first verify assertions for Kong + subcategory count

**Files:**
- Modify: `scripts/verify-chinaready-brand.mjs`

**Interfaces:**
- Consumes: expected built page `build/alternatives/kong-gateway.html` and `base.json` subcategory count
- Produces: failing assertions until Tasks 5–6 land and build succeeds

- [ ] **Step 1: Bump subcategory count assertion**

Replace:

```js
assert(subcategoryCount === 21, "base.json must expose all 21 subcategories");
```

with:

```js
assert(subcategoryCount === 22, "base.json must expose all 22 subcategories");
```

- [ ] **Step 2: Add Kong alternatives page assertions**

Near other alternatives page checks (after gap-catalog / grpc checks is fine), add:

```js
assert(exists("build/alternatives/kong-gateway.html"), "Kong Gateway must have a dedicated alternatives page");
const kongPage = read("build/alternatives/kong-gateway.html");
assert(kongPage.includes("Apache APISIX"), "Kong page must list Apache APISIX");
assert(kongPage.includes("Flomesh"), "Kong page must list Flomesh");
assert(kongPage.includes("Higress"), "Kong page must list Higress");
assert(!kongPage.includes("AWS China Regions"), "Kong page must not use cloud-platform heuristic candidates");
assert(
  kongPage.includes("self-host") || kongPage.includes("self-hosted") || kongPage.includes("On-Premise") || kongPage.includes("on-premise"),
  "Kong page must explain self-hosted Kong viability",
);
assert(
  kongPage.includes("Konnect") || kongPage.includes("control plane") || kongPage.includes("control-plane"),
  "Kong page must call out Konnect / control-plane constraints",
);
assert(kongPage.includes("cr-alt-guidance") || kongPage.includes("id=\"guidance\""), "Kong page must include editorial guidance");
```

- [ ] **Step 3: Run verify to confirm failure before editorial/build catch up**

If `build/` is stale from a prior run, either skip this step or expect failure on subcategory count / Kong content. Prefer:

Run: `npm run build && npm run verify`  
Expected after Tasks 1–3 only (before editorial): subcategory count may pass (22), but Kong page assertions about guidance / Konnect should **FAIL** until Task 5.

If build is not run yet, at minimum confirm the assertion source changes are saved.

- [ ] **Step 4: Commit**

```bash
git add scripts/verify-chinaready-brand.mjs
git commit -m "$(cat <<'EOF'
Assert Kong alternatives map APISIX/Flomesh/Higress and self-host guidance.

EOF
)"
```

---

### Task 5: Add Kong editorial override

**Files:**
- Modify: `scripts/seo-geo.mjs` — add `EDITORIAL_OVERRIDES["kong-gateway"]` inside the existing `EDITORIAL_OVERRIDES` object (place after `env0` or beside other infrastructure-adjacent entries)

**Interfaces:**
- Consumes: `group.slug === "kong-gateway"`, availability label, candidate names from landscape-mapped items
- Produces: custom description, lede, guidance section, FAQ for `/alternatives/kong-gateway.html`

- [ ] **Step 1: Insert the editorial override**

```js
  "kong-gateway": {
    description: (availability, names) =>
      clipMeta(
        `Kong Gateway self-host works in China; Kong Konnect and cross-border control planes are Limited. Compare ${names.slice(0, 3).join(", ")}. Availability: ${availability}.`,
      ),
    lede: (availability, names) =>
      `<strong>Quick answer:</strong> Self-hosted Kong Gateway OSS/Enterprise is fully usable in mainland China. Availability is <strong>${escapeHtml(availability)}</strong> mainly because <strong>Kong Konnect</strong> and overseas control-plane sync are fragile across the border. If you replace Kong, compare <strong>${escapeHtml(names.slice(0, 3).join(", "))}</strong>.`,
    guidanceTitle: "Kong Gateway in mainland China: self-host vs Konnect",
    sectionTitle: "Mapped China-ready candidates",
    guidanceHtml: `
        <p>For China launches, separate <strong>self-hosted Kong</strong> from <strong>Kong Konnect / cross-border control planes</strong>. Do not treat “Limited” as “Kong cannot run in China.”</p>
        <h3>Local and private-cloud deployment (fully usable)</h3>
        <ul>
          <li><strong>OSS and Enterprise software:</strong> Download Kong OSS or run Enterprise on-prem or on China-region clouds (Alibaba Cloud, Tencent Cloud, AWS China, Azure China).</li>
          <li><strong>Performance and ecosystem:</strong> OpenResty/Nginx lineage, Lua plugins, and mainland community adoption are unaffected by geography.</li>
          <li><strong>Localization:</strong> From Kong 2.3 onward, UTF-8 naming supports Chinese characters for routes and services.</li>
        </ul>
        <h3>Managed SaaS and cross-border networking (constrained)</h3>
        <ul>
          <li><strong>Kong Konnect:</strong> Official hosted control planes sit on Western cloud infrastructure and can see high latency, instability, or blocking from mainland China.</li>
          <li><strong>Split planes:</strong> Overseas control plane + China data plane sync is fragile under Great Firewall network conditions.</li>
        </ul>
        <h3>Compliance notes</h3>
        <ul>
          <li><strong>ICP filing:</strong> Public mainland API endpoints on China-hosted domains need ICP filing; without it, cloud providers cut ports 80/443.</li>
          <li><strong>Data residency:</strong> Sensitive personal data on overseas Kong SaaS may conflict with China’s Data Security Law and PIPL export rules.</li>
        </ul>
        <h3>Recommendation</h3>
        <p>For mainland operations, prefer in-country self-hosted Kong (Docker/Kubernetes) over Konnect. If you want a China-native substitute stack, evaluate the mapped options below — <strong>Apache APISIX</strong> as the closest OpenResty-lineage substitute, <strong>Flomesh</strong> for gateway plus mesh, and <strong>Higress</strong> for Envoy/cloud-native stacks.</p>`,
    faq: (availability, namesText) => [
      {
        question: "Does Kong Gateway work in China?",
        answer: `Yes for self-hosted deployments. Kong Gateway OSS and Enterprise run well on-prem or on China-region clouds. Chinaready labels Kong Gateway as ${availability} because Kong Konnect and cross-border control-plane architectures are unreliable or non-compliant for many mainland production stacks.`,
      },
      {
        question: "Why is Kong Gateway labeled Limited if self-hosting works?",
        answer:
          "Limited refers to the Kong Konnect / overseas control-plane path and related compliance constraints, not to local Kong Gateway software. Mainland teams that self-host Kong inside China usually avoid the Limited failure modes.",
      },
      {
        question: "What are the best China alternatives to Kong Gateway?",
        answer: `Chinaready Landscape currently maps Kong Gateway to ${namesText}. Prefer Apache APISIX when you want the closest OpenResty/Nginx-style substitute, Flomesh when you need gateway plus service-mesh traffic management, and Higress for Envoy-based cloud-native stacks. Replacement fit varies, so treat this as a research shortlist rather than a one-to-one endorsement.`,
      },
      {
        question: "Should teams use Kong Konnect with data planes in China?",
        answer:
          "Usually no. Syncing an overseas hosted control plane to China data planes is fragile under cross-border network conditions and can create data-residency risk. Prefer an in-country control plane and data plane, or a China-ready substitute gateway.",
      },
      {
        question: "Where should teams go after shortlisting Kong Gateway alternatives?",
        answer: `Use the interactive Chinaready Landscape to compare adjacent infrastructure services, then read Chinaready's main site for launch operating guidance covering ICP filing, data residency, distribution, and go-to-market constraints beyond vendor selection. If the path remains unclear, book a call with Chinaready.`,
      },
    ],
  },
```

- [ ] **Step 2: Commit**

```bash
git add scripts/seo-geo.mjs
git commit -m "$(cat <<'EOF'
Add Kong Gateway editorial guidance for China self-host vs Konnect.

EOF
)"
```

---

### Task 6: Refresh gap catalog Kong candidates

**Files:**
- Modify: `scripts/generate-gap-catalog.py` (`OVERRIDES`)
- Modify: `research/global-services-gap-catalog.json` (regenerated)

**Interfaces:**
- Consumes: landscape item names `Apache APISIX`, `Flomesh`, `Higress`
- Produces: Kong gap-catalog entry with researched candidates (landscape mapping still drives the live page; catalog stays consistent)

- [ ] **Step 1: Add override**

Inside `OVERRIDES = { ... }`, add:

```python
    "kong gateway": ["Apache APISIX", "Flomesh", "Higress"],
    "kong": ["Apache APISIX", "Flomesh", "Higress"],
```

- [ ] **Step 2: Regenerate catalog**

Run: `python3 scripts/generate-gap-catalog.py`  
Expected: prints counts JSON and `wrote .../research/global-services-gap-catalog.json`

- [ ] **Step 3: Spot-check Kong entry**

Run:

```bash
python3 - <<'PY'
import json
from pathlib import Path
catalog = json.loads(Path("research/global-services-gap-catalog.json").read_text())
kong = next(s for s in catalog["services"] if s["name"] == "Kong Gateway")
print(kong["confidence"])
print([c["name"] for c in kong["china_candidates"]])
assert kong["confidence"] == "researched"
assert [c["name"] for c in kong["china_candidates"]] == ["Apache APISIX", "Flomesh", "Higress"]
print("ok")
PY
```

Expected: `researched`, the three names, then `ok`

- [ ] **Step 4: Commit**

```bash
git add scripts/generate-gap-catalog.py research/global-services-gap-catalog.json
git commit -m "$(cat <<'EOF'
Map Kong Gateway gap-catalog candidates to APISIX, Flomesh, and Higress.

EOF
)"
```

---

### Task 7: Build, verify, and smoke-check the Kong page

**Files:**
- None new (consumes all prior tasks)
- Test: `build/alternatives/kong-gateway.html`, `build/data/base.json`

**Interfaces:**
- Consumes: landscape items, editorial override, verify assertions
- Produces: green `npm run validate && npm run build && npm run verify`

- [ ] **Step 1: Validate**

Run: `npm run validate`  
Expected: all validate:* scripts exit 0

- [ ] **Step 2: Build**

Run: `npm run build`  
Expected: landscape2 build + seo-geo generation complete; `build/alternatives/kong-gateway.html` exists

- [ ] **Step 3: Verify**

Run: `npm run verify`  
Expected: exit 0, including subcategory count 22 and Kong page assertions

- [ ] **Step 4: Smoke-read key strings**

Run:

```bash
rg -n "Apache APISIX|Flomesh|Higress|Konnect|self-host|AWS China Regions" build/alternatives/kong-gateway.html
```

Expected:
- Matches for Apache APISIX, Flomesh, Higress, Konnect, self-host
- **No** AWS China Regions candidate card content

- [ ] **Step 5: Final commit only if build artifacts are intentionally tracked**

Do **not** commit `build/` (gitignored). If any source files changed during smoke fixes, commit those fixes separately with a focused message. Otherwise stop here with a clean verify.

---

## Spec coverage checklist

| Spec requirement | Task |
|------------------|------|
| New subcategory `Service Mesh & Gateway` under Infrastructure & Edge | Task 2 |
| Items APISIX / Flomesh / Higress with Kong `global_analogs` | Task 2 |
| Logos | Task 1 |
| Guide taxonomy + subcategory docs | Task 3 |
| Kong editorial: self-host vs Konnect / ICP / PIPL / recommendation | Task 5 |
| Gap catalog refresh | Task 6 |
| Acceptance: page lists three products, not cloud platforms | Tasks 4 + 7 |
| Acceptance: validate/build/verify pass | Task 7 |
| Non-goal: no Kong product entry, no Aliyun/Tencent API Gateway SaaS | All tasks omit them |

## Plan self-review notes

- No TBD/placeholder steps; full YAML/JS/SVG included.
- Higress URL corrected to `https://higress.ai/` vs design-doc `higress.io`.
- Verify count bump 21 → 22 is explicit.
- Landscape mapping (not gap heuristic) is what removes AWS/Azure/Alibaba Cloud cards once items exist.

# Kong Gateway China Alternatives Design

Date: 2026-07-24  
Status: Approved for planning  
Related surface: `/alternatives/kong-gateway.html`, `landscape.yml`, `guide.yml`

## Problem

The current Kong Gateway alternatives page is wrong for China launch guidance:

- Availability is correctly labeled **Limited**, but the research shortlist maps to AWS China / Azure China / Alibaba Cloud (cloud platforms), not API gateway or mesh products.
- Editorial copy is generic and does not explain the real split: **self-hosted Kong OSS/Enterprise is fully usable in mainland China**, while **Kong Konnect / cross-border control-plane sync** is the constrained path.
- China-relevant open-source alternatives (Apache APISIX, Flomesh, Higress) are not first-class landscape entries, so they cannot appear as mapped candidates.

## Goals

1. Correct Kong China guidance: self-host available; Konnect / cross-border control plane limited; ICP and data-residency constraints called out.
2. Map Kong Gateway to three China-relevant alternatives: **Apache APISIX**, **Flomesh**, **Higress**.
3. Add those products as first-class landscape items under a new subcategory.
4. Keep the existing `landscape2` + `/alternatives/` generation workflow (editorial override pattern used by Stripe / OneSignal / Amazon SES).

## Non-goals

- Do not add Kong Gateway itself as a China landscape product entry.
- Do not add managed China cloud API Gateway SaaS products (Aliyun/Tencent API Gateway) in this change.
- Do not create a custom frontend outside `landscape2` / `seo-geo.mjs`.
- Do not change global availability taxonomy values beyond Kong remaining `limited`.

## Approach

**Landscape-first + Kong editorial override.**

1. Add subcategory `Service Mesh & Gateway` under `Infrastructure & Edge`.
2. Add three landscape items with `global_analogs: Kong Gateway` so `/alternatives/kong-gateway.html` picks them up automatically from landscape mapping.
3. Add `EDITORIAL_OVERRIDES["kong-gateway"]` in `scripts/seo-geo.mjs` for decision guidance and FAQ.
4. Refresh gap-catalog Kong entry so confidence/candidates stay consistent after landscape mapping exists.
5. Update `guide.yml` category/subcategory docs to include the new subcategory.

## Taxonomy

### Category / subcategory

- Category: `Infrastructure & Edge`
- New subcategory: `Service Mesh & Gateway`

Guide copy should describe this subcategory as covering API gateways, service mesh data planes, and cloud-native traffic-management products used when replacing or coexisting with Kong-style edge/API gateways in mainland China.

Update the Infrastructure & Edge overview table/list in `guide.yml` to include the new subcategory alongside Cloud Platform & Hosting, Managed DNS Provider, and CDN.

### Landscape items

| Product | Homepage (expected) | `global_analogs` | `replacement_fit` | `vendor_type` | `availability_status` | `global_availability_in_china` | Notes |
|---------|---------------------|------------------|-------------------|---------------|----------------------|--------------------------------|-------|
| Apache APISIX | https://apisix.apache.org/ | Kong Gateway | direct | china-saas | generally-available | limited | Closest OpenResty/Nginx-lineage Kong substitute; strong China community / commercial ecosystem |
| Flomesh | https://flomesh.io/ | Kong Gateway | partial | china-saas | generally-available | limited | Gateway + mesh / Pipy dataplane; China vendor |
| Higress | https://higress.io/ | Kong Gateway | partial | china-cloud | generally-available | limited | Cloud-native Envoy-based API gateway; common in Alibaba Cloud-native stacks |

Shared annotation expectations (same pattern as existing entries):

- `evidence_level`: `medium` unless a stronger public source is already on hand during implementation
- `china_context`: product-specific mainland deployment / ecosystem notes
- `description` / `product_overview`: one-sentence product definition
- logos under `hosted_logos/` as SVG
- remaining metadata fields (`metadata_name`, `primary_category`, `official_website`, `github`, `organization`, `developer_docs`, etc.) follow existing entry conventions

`global_availability_in_china: limited` on these items refers to the **listed global analog (Kong Gateway)** availability signal, matching CONTRIBUTING.md field semantics.

## Kong alternatives page editorial

Slug: `kong-gateway`  
Availability label: remain **Limited**

### Narrative

Lead with decision framing, not “Kong does not work”:

1. **Self-host / private cloud:** Kong Gateway OSS and Enterprise are fully usable on-prem or on China-region clouds (Aliyun, Tencent, AWS China, Azure China). OpenResty/Nginx lineage, Lua plugins, and UTF-8 naming are unaffected by geography.
2. **Managed / cross-border:** Kong Konnect and overseas control-plane ↔ China data-plane sync face latency, instability, and possible blocking.
3. **Compliance:** Public mainland API endpoints need ICP filing; sensitive personal data on overseas Kong SaaS may conflict with DSL / PIPL data-export rules.
4. **Recommendation:** For mainland operations, prefer in-country self-hosted Kong (Docker/Kubernetes). If replacing Kong, evaluate APISIX (closest), Flomesh (gateway+mesh), Higress (cloud-native Envoy).

### Page sections (via editorial override)

- Custom meta description and lede summarizing the self-host vs Konnect split
- `guidanceTitle` + `guidanceHtml` covering the three buckets above plus the shortlist framing
- FAQ covering:
  - Does Kong Gateway work in China?
  - Why is availability Limited if self-host works?
  - What are the best China alternatives?
  - Should teams use Kong Konnect for mainland data planes?
  - Where to go after shortlisting

Candidate cards come from landscape-mapped items (APISIX, Flomesh, Higress), not the old cloud-platform heuristic shortlist.

## File / system changes

| File | Change |
|------|--------|
| `landscape.yml` | Add `Service Mesh & Gateway` subcategory and three items |
| `hosted_logos/` | Add SVG logos for Apache APISIX, Flomesh, Higress |
| `guide.yml` | Extend Infrastructure & Edge overview + subcategory guidance; mention Kong alternatives page |
| `scripts/seo-geo.mjs` | Add `EDITORIAL_OVERRIDES["kong-gateway"]` |
| `research/global-services-gap-catalog.json` | Refresh Kong entry candidates/confidence after landscape mapping (regenerate or manual align) |
| Build artifacts | Regenerated via `npm run validate && npm run build && npm run verify` |

## Acceptance criteria

1. `/alternatives/kong-gateway.html` lists Apache APISIX, Flomesh, and Higress as mapped China candidates (not AWS/Azure/Alibaba Cloud platforms).
2. Page editorial clearly states self-hosted Kong is viable and Limited mainly applies to Konnect / cross-border control plane / compliance constraints.
3. Interactive landscape shows the new `Service Mesh & Gateway` subcategory with the three products.
4. Guide documents the new subcategory.
5. `npm run validate`, `npm run build`, and `npm run verify` pass.

## Out-of-scope follow-ups

- Broader mesh catalog (Istio, Linkerd, Open Service Mesh China routes)
- China managed API Gateway SaaS entries
- Separate alternatives pages for Envoy Gateway / NGINX Ingress if needed later

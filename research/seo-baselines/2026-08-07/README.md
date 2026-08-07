# SEO baseline — 2026-08-07

Reference point for **week-later comparison** (target: **2026-08-14+**).

## What was measured

| Metric | Source |
|---|---|
| Domain organic ETV / keyword count | DataForSEO Labs `bulk_traffic_estimation` |
| Page organic ETV | DataForSEO Labs `bulk_traffic_estimation` on pair URLs |
| SERP position | DataForSEO `serp_organic_live_advanced` (US/en/desktop, depth 20) |
| Composite `seo_score` | `page_etv*10 + position_weight + AI Overview bonus` |

Scope: **22 P0+P1 pairs** (Chinaready `/alternatives/<slug>` vs AppInChina `does-*-work-in-china`).

## Headline baseline

| | Chinaready Landscape | AppInChina |
|---|---:|---:|
| Domain organic ETV | **0** | **693.491** |
| Pair page ETV sum | **0** | **37.521** |
| Composite SEO score sum | **0** | **638.21** |
| Keywords where site ranks organic (sampled) | **0** / 9 | **7** / 9 |

Interpretation: Chinaready starts near **zero Labs organic signal** on these URLs; AppInChina already ranks/captures ETV on several hub pages (esp. Zoom, Mailchimp SERP).

## Top AIC advantages (baseline)

- **Zoom**: AIC score 296.14 vs CR 0 (gap 296.14); AIC SERP #6, ETV 27.614
- **Mailchimp**: AIC score 100 vs CR 0 (gap 100); AIC SERP #1, ETV 0
- **Webex**: AIC score 55 vs CR 0 (gap 55); AIC SERP #3, ETV 0
- **Microsoft Teams**: AIC score 31.83 vs CR 0 (gap 31.83); AIC SERP #9, ETV 2.383
- **DocuSign**: AIC score 30 vs CR 0 (gap 30); AIC SERP #5, ETV 0
- **HubSpot**: AIC score 30 vs CR 0 (gap 30); AIC SERP #5, ETV 0
- **Google Maps**: AIC score 24.32 vs CR 0 (gap 24.32); AIC SERP #None, ETV 1.932
- **Spotify for Podcasters**: AIC score 22.68 vs CR 0 (gap 22.68); AIC SERP #None, ETV 2.268

## Files

- `baseline.json` — full machine-readable snapshot
- `baseline.csv` — spreadsheet-friendly pair table
- `pairs.json` — URL pairing definition
- `raw-summary.json` — condensed raw metrics
- `../compare.md` — how to re-measure in one week

## Re-measure command

```bash
# After 2026-08-14, create research/seo-baselines/2026-08-14/ the same way,
# then:
node scripts/seo-baseline-compare.mjs \
  --before research/seo-baselines/2026-08-07/baseline.json \
  --after research/seo-baselines/YYYY-MM-DD/baseline.json
```

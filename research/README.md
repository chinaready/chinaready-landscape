# Research snapshots

## `global-services-gap-catalog.json`

Chinaready research shortlist of taxonomy-relevant global services that are not yet fully covered as first-class `global_analogs` / `global_alternatives` entries in `landscape.yml`.

Each service includes:

- `availability` / `global_availability_in_china` — Chinaready mainland China availability signal (`Available` / `Limited` / `Unavailable`)
- `china_candidates` — research shortlist mapped to Chinaready Landscape products when possible
- `confidence` — `researched` | `heuristic` | `uncertain`
- `research_note` — including the Chinaready contact CTA when a precise alternative is not yet confirmed

Refresh candidate mappings from the current landscape with:

```bash
python3 scripts/generate-gap-catalog.py
```

`scripts/seo-geo.mjs` merges this catalog into `/alternatives/` at build time.

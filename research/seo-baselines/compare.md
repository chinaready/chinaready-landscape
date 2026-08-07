# SEO baseline comparison guide

1. Keep each dated folder under `research/seo-baselines/YYYY-MM-DD/`.
2. Re-run DataForSEO with the same `pairs.json` targets / keywords / US-en-desktop settings.
3. Write a new `baseline.json` using the same `seo_score` formula.
4. Diff with:

```bash
node scripts/seo-baseline-compare.mjs \
  --before research/seo-baselines/2026-08-07/baseline.json \
  --after research/seo-baselines/YYYY-MM-DD/baseline.json
```

Success signals after one week:
- Chinaready domain or page ETV > 0 in Labs
- Any primary keyword where CR gains organic `rank_group` ≤ 20
- Gap `aic_seo_score - cr_seo_score` shrinks on Zoom / Teams / Maps / Mailchimp

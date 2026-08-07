#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

function arg(flag, fallback) {
  const i = process.argv.indexOf(flag);
  return i >= 0 ? process.argv[i + 1] : fallback;
}

const beforePath = arg("--before");
const afterPath = arg("--after");
if (!beforePath || !afterPath) {
  console.error("Usage: node scripts/seo-baseline-compare.mjs --before <baseline.json> --after <baseline.json>");
  process.exit(1);
}

const before = JSON.parse(fs.readFileSync(beforePath, "utf8"));
const after = JSON.parse(fs.readFileSync(afterPath, "utf8"));
const byProduct = (snap) => Object.fromEntries(snap.pairs.map((p) => [p.product, p]));
const b = byProduct(before);
const a = byProduct(after);

console.log(`Compare ${before.snapshot_id} → ${after.snapshot_id}`);
console.log("Domain ETV CR:", before.domains["landscape.chinaready.co"]?.organic_etv, "→", after.domains["landscape.chinaready.co"]?.organic_etv);
console.log("Domain ETV AIC:", before.domains["appinchina.co"]?.organic_etv, "→", after.domains["appinchina.co"]?.organic_etv);
console.log("Score sum CR:", before.totals.cr_seo_score_sum, "→", after.totals.cr_seo_score_sum);
console.log("Score sum AIC:", before.totals.aic_seo_score_sum, "→", after.totals.aic_seo_score_sum);
console.log("");
console.log("product\tcr_score_delta\taic_score_delta\tgap_delta\tcr_pos_before\tcr_pos_after");
for (const product of Object.keys(b)) {
  const x = b[product];
  const y = a[product];
  if (!y) continue;
  const crDelta = (y.cr_seo_score ?? 0) - (x.cr_seo_score ?? 0);
  const aicDelta = (y.aic_seo_score ?? 0) - (x.aic_seo_score ?? 0);
  const gapDelta = (y.score_gap_aic_minus_cr ?? 0) - (x.score_gap_aic_minus_cr ?? 0);
  console.log([
    product,
    crDelta.toFixed(2),
    aicDelta.toFixed(2),
    gapDelta.toFixed(2),
    x.cr_serp_organic_rank_group ?? "-",
    y.cr_serp_organic_rank_group ?? "-",
  ].join("\t"));
}

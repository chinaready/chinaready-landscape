// Submit sitemap URLs to IndexNow (Bing, Yandex, Seznam, Naver...).
// Run after a production deploy: `node scripts/indexnow-submit.mjs`
// Google does not participate in IndexNow; it keeps crawling via sitemap.xml.
import fs from "node:fs";
import path from "node:path";
import { INDEXNOW_KEY } from "./seo-geo.mjs";

const SITE_URL = "https://landscape.chinaready.co";
const ENDPOINT = `https://api.indexnow.org/indexnow?url=${SITE_URL}&key=${INDEXNOW_KEY}`;
const BATCH_SIZE = 2000;

const root = process.cwd();
const sitemapPath = path.join(root, "build", "sitemap.xml");
if (!fs.existsSync(sitemapPath)) {
  console.error(`Missing ${sitemapPath}. Run \`npm run build\` first.`);
  process.exit(1);
}

const urls = [...fs.readFileSync(sitemapPath, "utf8").matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
if (urls.length === 0) {
  console.error("No URLs found in sitemap.xml.");
  process.exit(1);
}

for (let i = 0; i < urls.length; i += BATCH_SIZE) {
  const batch = urls.slice(i, i + BATCH_SIZE);
  const response = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({ host: new URL(SITE_URL).host, key: INDEXNOW_KEY, keyLocation: `${SITE_URL}/${INDEXNOW_KEY}.txt`, urlList: batch }),
  });
  // 200 = accepted, 202 = key check pending, 422 = rejected (bad key/URLs)
  console.log(`Batch ${i / BATCH_SIZE + 1}: ${batch.length} URLs -> HTTP ${response.status}`);
  if (!response.ok && response.status !== 202) {
    console.error(await response.text().catch(() => ""));
    process.exit(1);
  }
}
console.log(`Submitted ${urls.length} URLs to IndexNow.`);

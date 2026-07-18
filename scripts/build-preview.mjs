import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { applySeoGeoEnhancements } from "./seo-geo.mjs";

const root = process.cwd();
const buildDir = path.join(root, "build");
const indexPath = path.join(buildDir, "index.html");
const placeholderLogo = "logos/chinaready-empty-category.svg";
const missingSearchValues = new Set(["", "-", "not-applicable", "not-collected", "to-be-supplied-by-contributor"]);
const acronymStopWords = new Set(["a", "an", "and", "as", "for", "in", "of", "or", "the", "to", "with"]);
const searchableAnnotationKeys = [
  "metadata_name",
  "primary_category",
  "product_overview",
  "china_context",
  "alternative_to",
  "global_alternatives",
  "global_analogs",
  "organization",
  "organization_overview",
  "vendor_type",
  "replacement_fit",
  "evidence_level",
];

function run(command, args) {
  const result = spawnSync(command, args, {
    cwd: root,
    stdio: "inherit",
  });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

fs.rmSync(buildDir, { recursive: true, force: true });

run(process.execPath, [
  "scripts/landscape2.mjs",
  "build",
  "--data-file",
  "landscape.yml",
  "--settings-file",
  "settings.yml",
  "--guide-file",
  "guide.yml",
  "--games-file",
  "games.yml",
  "--logos-path",
  "hosted_logos",
  "--output-dir",
  "build",
]);

function normalizeId(value) {
  return value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function hasSearchValue(value) {
  return value !== undefined && value !== null && !missingSearchValues.has(String(value).trim());
}

function addSearchValue(terms, seen, value) {
  if (!hasSearchValue(value)) return;
  const text = String(value).trim();
  const key = text.toLowerCase();
  if (seen.has(key)) return;
  seen.add(key);
  terms.push(text);
}

function acronymFor(value) {
  const text = String(value).trim();
  if (/^https?:\/\//i.test(text)) return null;
  const words = text
    .replace(/[()]/g, " ")
    .split(/[^a-zA-Z0-9]+/)
    .map((word) => word.trim())
    .filter((word) => word && !acronymStopWords.has(word.toLowerCase()));
  if (words.length < 2 || words.length > 5) return null;

  const acronym = words.map((word) => word[0]).join("").toUpperCase();
  if (acronym.length < 2 || acronym.length > 8) return null;
  if (acronym === text.toUpperCase()) return null;
  return acronym;
}

function addSearchList(terms, seen, value) {
  if (Array.isArray(value)) {
    value.forEach((entry) => addSearchList(terms, seen, entry));
    return;
  }
  if (!hasSearchValue(value)) return;
  String(value)
    .split(/\s*(?:,|;|\|)\s*/)
    .forEach((entry) => {
      addSearchValue(terms, seen, entry);
      addSearchValue(terms, seen, acronymFor(entry));
    });
}

function searchTagsForItem(item) {
  const annotations = item.annotations || {};
  const terms = [];
  const seen = new Set();

  [
    item.name,
    item.category,
    item.subcategory,
    item.description,
    item.homepage_url,
    item.website,
  ].forEach((value) => addSearchValue(terms, seen, value));

  for (const key of searchableAnnotationKeys) {
    addSearchList(terms, seen, annotations[key]);
  }

  return terms;
}

function enrichBaseSearchTags(base, full) {
  const fullItemsById = new Map(full.items.map((item) => [item.id, item]));
  for (const item of full.items) {
    const tags = searchTagsForItem(item);
    if (tags.length === 0) continue;
    item.summary = {
      ...(item.summary || {}),
      tags,
    };
  }
  for (const item of base.items) {
    const fullItem = fullItemsById.get(item.id);
    if (!fullItem) continue;
    const tags = fullItem.summary?.tags || [];
    if (tags.length === 0) continue;
    item.summary = {
      ...(item.summary || {}),
      tags,
    };
  }
}

function addEmptyCategoryPlaceholders() {
  const basePath = path.join(buildDir, "data", "base.json");
  const fullPath = path.join(buildDir, "data", "full.json");
  const base = JSON.parse(fs.readFileSync(basePath, "utf8"));
  const full = JSON.parse(fs.readFileSync(fullPath, "utf8"));
  const visible = new Set();

  for (const item of base.items) {
    visible.add(`${item.category} / ${item.subcategory}`);
    for (const additional of item.additional_categories || []) {
      visible.add(`${additional.category} / ${additional.subcategory}`);
    }
  }

  const placeholders = [];
  for (const category of base.categories) {
    for (const subcategory of category.subcategories) {
      const key = `${category.name} / ${subcategory.name}`;
      if (visible.has(key)) continue;
      const id = `${normalizeId(category.name)}--${normalizeId(subcategory.name)}--empty-category`;
      placeholders.push({
        category: category.name,
        homepage_url: "#",
        id,
        logo: placeholderLogo,
        name: "No entries yet",
        subcategory: subcategory.name,
        website: "#",
        annotations: {
          evidence_level: "empty",
          china_context: "This subcategory is part of the taxonomy but does not yet have a source-backed product entry.",
          replacement_fit: "not-applicable",
          vendor_type: "taxonomy-placeholder",
        },
        description: "This subcategory is ready for source-backed China-market product entries.",
      });
    }
  }

  if (placeholders.length > 0) {
    base.items.push(
      ...placeholders.map(({ homepage_url, website, annotations, description, ...item }) => item),
    );
    full.items.push(...placeholders);

    const logoPath = path.join(buildDir, placeholderLogo);
    fs.mkdirSync(path.dirname(logoPath), { recursive: true });
    fs.writeFileSync(
      logoPath,
      '<svg xmlns="http://www.w3.org/2000/svg" width="320" height="180" viewBox="0 0 320 180" role="img" aria-labelledby="title"><title>No entries yet</title><rect width="320" height="180" rx="8" fill="#FFFFFF"/><rect x="18" y="18" width="284" height="144" rx="8" fill="#F4F6FA" stroke="#DDE3EE" stroke-width="2"/><rect x="38" y="56" width="68" height="68" rx="8" fill="#DDE3EE"/><text x="72" y="99" text-anchor="middle" font-family="Inter, Arial, Helvetica, sans-serif" font-size="24" font-weight="700" fill="#5A6A80">0</text><text x="126" y="84" font-family="Inter, Arial, Helvetica, sans-serif" font-size="21" font-weight="700" fill="#0D1B2A">No entries yet</text><text x="126" y="112" font-family="Inter, Arial, Helvetica, sans-serif" font-size="17" fill="#5A6A80">Open for contribution</text><rect x="126" y="124" width="54" height="4" fill="#005BAC"/></svg>',
    );
  }

  enrichBaseSearchTags(base, full);

  fs.writeFileSync(basePath, JSON.stringify(base));
  fs.writeFileSync(fullPath, JSON.stringify(full));
  return base;
}

const patchedBase = addEmptyCategoryPlaceholders();

function restoreGuideTables() {
  const guidePath = path.join(buildDir, "data", "guide.json");
  const guide = JSON.parse(fs.readFileSync(guidePath, "utf8"));
  const tableTagPattern = /&lt;(\/?)(table|thead|tbody|tr|th|td)&gt;/g;

  for (const category of guide.categories) {
    if (category.category !== "Overview") continue;
    category.content = category.content.replace(tableTagPattern, "<$1$2>");
  }

  fs.writeFileSync(guidePath, JSON.stringify(guide));
}

restoreGuideTables();

let index = fs.readFileSync(indexPath, "utf8");
index = index.replace(
  /window\.baseDS = .*?;\n/s,
  `window.baseDS = ${JSON.stringify(patchedBase)};\n`,
);
const links = [
  '<link rel="stylesheet" href="assets/chinaready-landscape.css?v=20260718-hide-native-tags">',
];
const scripts = [
  '<script defer src="assets/chinaready-landscape-details.js?v=20260718-hide-native-tags"></script>',
];

for (const link of links) {
  if (!index.includes(link)) {
    index = index.replace("</head>", `  ${link}\n</head>`);
  }
}

for (const script of scripts) {
  if (!index.includes(script)) {
    index = index.replace("</body>", `  ${script}\n</body>`);
  }
}

const assetsTarget = path.join(buildDir, "assets", "chinaready-landscape.css");
fs.mkdirSync(path.dirname(assetsTarget), { recursive: true });
fs.copyFileSync(path.join(root, "assets", "chinaready-landscape.css"), assetsTarget);

const detailsTarget = path.join(buildDir, "assets", "chinaready-landscape-details.js");
fs.copyFileSync(path.join(root, "assets", "chinaready-landscape-details.js"), detailsTarget);

const seo = applySeoGeoEnhancements({ root, buildDir, indexHtml: index });
fs.writeFileSync(indexPath, seo.indexHtml);
console.log(
  `Chinaready landscape preview built at build/ (SEO/GEO: ${seo.groupCount} alternative pages from ${seo.itemCount} items)`,
);

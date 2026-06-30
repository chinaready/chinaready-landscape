import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const buildDir = path.join(root, "build");
const indexPath = path.join(buildDir, "index.html");
const placeholderLogo = "logos/chinaready-empty-category.svg";

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

  if (placeholders.length === 0) return base;

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

  fs.writeFileSync(basePath, JSON.stringify(base));
  fs.writeFileSync(fullPath, JSON.stringify(full));
  return base;
}

const patchedBase = addEmptyCategoryPlaceholders();

let index = fs.readFileSync(indexPath, "utf8");
index = index.replace(
  /window\.baseDS = .*?;\n/s,
  `window.baseDS = ${JSON.stringify(patchedBase)};\n`,
);
const links = [
  '<link rel="stylesheet" href="vendor/chinaready-design-system/dist/chinaready.css">',
  '<link rel="stylesheet" href="assets/chinaready-landscape.css">',
];

for (const link of links) {
  if (!index.includes(link)) {
    index = index.replace("</head>", `  ${link}\n</head>`);
  }
}

const vendorTarget = path.join(buildDir, "vendor", "chinaready-design-system");
fs.rmSync(vendorTarget, { recursive: true, force: true });
fs.mkdirSync(path.dirname(vendorTarget), { recursive: true });
fs.cpSync(path.join(root, "vendor", "chinaready-design-system"), vendorTarget, { recursive: true });

const assetsTarget = path.join(buildDir, "assets", "chinaready-landscape.css");
fs.mkdirSync(path.dirname(assetsTarget), { recursive: true });
fs.copyFileSync(path.join(root, "assets", "chinaready-landscape.css"), assetsTarget);

fs.writeFileSync(indexPath, index);
console.log("Chinaready landscape preview built at build/");

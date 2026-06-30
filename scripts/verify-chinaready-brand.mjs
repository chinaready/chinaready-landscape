import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function read(file) {
  return fs.readFileSync(path.join(root, file), "utf8");
}

function exists(file) {
  return fs.existsSync(path.join(root, file));
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

const settings = read("settings.yml");

assert(settings.includes("foundation: Chinaready"), "settings.yml must use Chinaready as the foundation name");
assert(settings.includes("rgba(12, 30, 62, 1)"), "settings.yml must use Chinaready deep navy");
assert(settings.includes("rgba(0, 91, 172, 1)"), "settings.yml must use Chinaready brand blue");
assert(!settings.includes("rgba(198, 40, 40"), "settings.yml must not keep the previous red placeholder theme");
assert(settings.includes("url: https://landscape.chinaready.co"), "settings.yml must use the production landscape.chinaready.co URL");
assert(settings.includes("assets/chinaready-landscape-logo.svg"), "settings.yml must use the Chinaready Landscape header lockup");
assert(settings.includes("homepage: \"https://chinaready.co\""), "settings.yml footer must link back to the Chinaready main site");
assert(settings.includes("vendor/chinaready-design-system/release/chinaready-logo-v1.1.0/svg/logo-horizontal-white.svg"), "settings.yml must use the vendored Chinaready footer logo");
assert(!settings.match(/^groups:/m), "settings.yml must not define groups so the default view shows the full landscape");

assert(exists("vendor/chinaready-design-system/dist/chinaready.css"), "vendored Chinaready CSS is missing");
assert(exists("vendor/chinaready-design-system/release/chinaready-logo-v1.1.0/svg/logo-horizontal.svg"), "vendored Chinaready logo is missing");
assert(exists("assets/chinaready-landscape.css"), "Chinaready landscape override CSS is missing");
assert(exists("scripts/build-preview.mjs"), "build-preview wrapper is missing");

const brandCss = read("assets/chinaready-landscape.css");
assert(brandCss.includes("footer[role=\"contentinfo\"].bg-black"), "Chinaready CSS must override the landscape2 bg-black footer");

if (exists("build/index.html")) {
  const index = read("build/index.html");
  assert(index.includes("vendor/chinaready-design-system/dist/chinaready.css"), "build/index.html must link the Chinaready DS CSS");
  assert(index.includes("assets/chinaready-landscape.css"), "build/index.html must link the Chinaready landscape override CSS");
}

if (exists("build/assets/chinaready-landscape.css")) {
  const buildCss = read("build/assets/chinaready-landscape.css");
  assert(buildCss.includes("footer[role=\"contentinfo\"].bg-black"), "published CSS must override the landscape2 bg-black footer");
}

if (exists("build/data/base.json")) {
  const base = JSON.parse(read("build/data/base.json"));
  const subcategoryCount = base.categories.reduce((total, category) => total + category.subcategories.length, 0);
  assert(base.categories.length === 6, "base.json must expose all 6 top-level categories");
  assert(subcategoryCount === 20, "base.json must expose all 20 subcategories");
  assert(!base.groups || base.groups.length === 0, "base.json must not define groups so no group tab is selected by default");

  const visibleSubcategories = new Set();
  for (const item of base.items) {
    visibleSubcategories.add(`${item.category} / ${item.subcategory}`);
    for (const additional of item.additional_categories || []) {
      visibleSubcategories.add(`${additional.category} / ${additional.subcategory}`);
    }
  }
  for (const category of base.categories) {
    for (const subcategory of category.subcategories) {
      const key = `${category.name} / ${subcategory.name}`;
      assert(visibleSubcategories.has(key), `preview must render subcategory: ${key}`);
    }
  }
}

console.log("Chinaready brand verification passed");

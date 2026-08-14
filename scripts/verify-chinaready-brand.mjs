import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

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
const landscape = read("landscape.yml");
const guide = read("guide.yml");
const gitignore = read(".gitignore");
const headerLogo = read("assets/chinaready-landscape-logo.svg");
const repositoryUrl = "https://github.com/chinaready/chinaready-landscape.git";
const legacySourceBrandPattern = new RegExp(`\\b${["A", "IC"].join("")}\\b|${["App", "In", "China"].join("")}`, "i");
const requiredProfileFields = [
  "metadata_name",
  "primary_category",
  "official_website",
  "github",
  "social_media",
  "product_overview",
  "alternative_to",
  "global_alternatives",
  "organization",
  "organization_overview",
  "developer_docs",
  "availability_status",
  "global_availability_in_china",
];
const allowedAvailabilityStatus = new Set([
  "generally-available",
  "china-region-only",
  "invite-or-restricted",
  "deprecated-or-sunset",
  "unverified",
]);
const allowedGlobalAvailabilityInChina = new Set(["available", "limited", "unavailable", "unknown"]);

function unquote(value) {
  return value.trim().replace(/^["']|["']$/g, "");
}

function collectLandscapeItems(source) {
  const items = [];
  let currentCategory = "";
  let currentSubcategory = "";
  let currentItem = null;

  function finishItem() {
    if (currentItem) {
      items.push(currentItem);
      currentItem = null;
    }
  }

  for (const line of source.split("\n")) {
    const categoryMatch = line.match(/^    name: (.+)$/);
    const subcategoryMatch = line.match(/^        name: (.+)$/);
    const itemNameMatch = line.match(/^            name: (.+)$/);
    const homepageMatch = line.match(/^            homepage_url: (.+)$/);
    const logoMatch = line.match(/^            logo: (.+)$/);
    const annotationMatch = line.match(/^                ([a-zA-Z0-9_]+):\s*(.*)$/);

    if (line.match(/^          - item:/)) {
      finishItem();
      currentItem = {
        name: "",
        homepageUrl: "",
        category: currentCategory,
        subcategory: currentSubcategory,
        annotations: {},
      };
      continue;
    }
    if (categoryMatch) {
      finishItem();
      currentCategory = unquote(categoryMatch[1]);
      continue;
    }
    if (subcategoryMatch) {
      finishItem();
      currentSubcategory = unquote(subcategoryMatch[1]);
      continue;
    }
    if (currentItem && itemNameMatch) {
      currentItem.name = unquote(itemNameMatch[1]);
      continue;
    }
    if (currentItem && homepageMatch) {
      currentItem.homepageUrl = unquote(homepageMatch[1]);
      continue;
    }
    if (currentItem && logoMatch) {
      currentItem.logo = unquote(logoMatch[1]);
      continue;
    }
    if (currentItem && annotationMatch) {
      currentItem.annotations[annotationMatch[1]] = unquote(annotationMatch[2]);
    }
  }

  finishItem();
  return items;
}

assert(settings.includes("foundation: Chinaready"), "settings.yml must use Chinaready as the foundation name");
assert(settings.includes("rgba(12, 30, 62, 1)"), "settings.yml must use Chinaready deep navy");
assert(settings.includes("rgba(0, 91, 172, 1)"), "settings.yml must use Chinaready brand blue");
assert(!settings.includes("rgba(198, 40, 40"), "settings.yml must not keep the previous red placeholder theme");
assert(settings.includes("url: https://landscape.chinaready.co"), "settings.yml must use the production landscape.chinaready.co URL");
assert(settings.includes("assets/chinaready-landscape-logo.svg"), "settings.yml must use the Chinaready Landscape header lockup");
assert(settings.includes("homepage: \"https://chinaready.co\""), "settings.yml footer must link back to the Chinaready main site");
assert(settings.includes(`github: "${repositoryUrl}"`), "settings.yml GitHub links must point to the Chinaready landscape repository");
assert(!settings.includes("https://github.com/cncf/landscape2"), "settings.yml must not link header or footer GitHub actions to upstream landscape2");
assert(settings.includes("assets/chinaready-logo-horizontal-white.svg"), "settings.yml must use the copied Chinaready footer logo asset");
assert(!settings.includes("vendor/chinaready-design-system"), "settings.yml must not reference the removed vendored design system");
assert(!settings.match(/^groups:/m), "settings.yml must not define groups so the default view shows the full landscape");
assert(!settings.match(legacySourceBrandPattern), "settings.yml must not contain legacy source brand text");
assert(!landscape.match(legacySourceBrandPattern), "landscape.yml must not contain legacy source brand text");
assert(landscape.includes("Chinaready Google Fonts Hosting"), "landscape.yml must use Chinaready Google Fonts Hosting");
assert(!landscape.match(/Archive feedback|in the Archive|referenced in the Archive|archive_rows|archive_files|source_hint/i), "landscape.yml must not expose Archive extraction context");
assert(guide.includes('category: "Overview"'), "guide.yml must include a top-level Overview section");
assert(!guide.includes('subcategory: "README"'), "guide.yml Overview must not expose a README submenu");
assert(guide.includes("<table>") && guide.includes("<th>Level 1 Category</th>"), "guide.yml Overview must include a taxonomy table");
assert(guide.includes("company profiles"), "guide.yml Overview must explain how companies can contribute profiles");
assert(!guide.includes("CR_ALTERNATIVES_KEYWORD_MAP"), "guide.yml Overview must not embed the alternatives keyword map marker");
assert(!guide.includes("## China alternatives keyword map"), "guide.yml Overview must not include the China alternatives keyword map section");
assert(guide.includes("/alternatives/"), "guide.yml Overview must link to the /alternatives/ index");
assert(!guide.includes("landscape.chinaready.co/alternatives"), "guide.yml must use relative /alternatives/ paths, not absolute landscape host URLs");
assert((guide.match(/Typical global services:/g) || []).length >= 19, "guide.yml must list typical global services under every subcategory");
assert(guide.includes("AI Models & Platforms"), "guide.yml must document AI Models & Platforms");
assert(guide.includes("Foundation Models & LLM APIs"), "guide.yml must list Foundation Models & LLM APIs");
assert(guide.includes("Embeddings & Reranking"), "guide.yml must list Embeddings & Reranking");
assert(guide.includes("Vector Databases & Retrieval"), "guide.yml must list Vector Databases & Retrieval");
assert(guide.includes("Agent / RAG Frameworks"), "guide.yml must list Agent / RAG Frameworks");
assert(guide.includes("## FAQ"), "guide.yml Overview must include an FAQ section for GEO-friendly answers");
assert(guide.includes("chinaready.co"), "guide.yml Overview must route readers to the Chinaready main site");
assert(guide.includes("Level 1"), "guide.yml Overview must emphasize the Level 1 taxonomy framing");
assert(exists("scripts/seo-geo.mjs"), "SEO/GEO generator script is missing");
const seoGeoScript = read("scripts/seo-geo.mjs");
assert(seoGeoScript.includes('GA_MEASUREMENT_ID = "G-4BXLJXM1DY"'), "SEO/GEO script must define the Google Analytics measurement ID");
assert(seoGeoScript.includes("googleTagSnippet"), "SEO/GEO script must inject the Google tag snippet");
assert(seoGeoScript.includes("AVAILABILITY_STATUS_LABELS"), "SEO/GEO generator must label availability_status on alternatives pages");
assert(seoGeoScript.includes("GLOBAL_AVAILABILITY_LABELS"), "SEO/GEO generator must label global_availability_in_china on alternatives pages");
assert(seoGeoScript.includes("CHINA_AVAILABILITY_LABELS"), "SEO/GEO generator must expose China availability labels");
assert(seoGeoScript.includes("mergeAnalogGroups"), "SEO/GEO generator must merge gap-catalog global services into alternatives");
assert(seoGeoScript.includes("availability_status"), "SEO/GEO generator must read availability_status from landscape.yml");
assert(seoGeoScript.includes("global_availability_in_china"), "SEO/GEO generator must read global_availability_in_china from landscape.yml");
assert(seoGeoScript.includes("function brandedTitle"), "SEO/GEO generator must define brandedTitle for SERP-safe titles");
assert(seoGeoScript.includes("function ensureBrandedPageTitle"), "SEO/GEO generator must enforce Chinaready branding on pageShell titles");
assert(seoGeoScript.includes("MAX_SERP_TITLE_LENGTH = 60"), "SEO/GEO generator must cap titles so | Chinaready survives Google truncation");
assert(seoGeoScript.includes('TITLE_BRAND_SUFFIX = " | Chinaready"'), "SEO/GEO generator must use the | Chinaready title suffix");
assert(
  !seoGeoScript.includes("Alternatives in China (${availability})"),
  "SEO/GEO alternatives titles must not embed availability status (causes SERP truncation before | Chinaready)",
);
assert(!seoGeoScript.match(legacySourceBrandPattern), "SEO/GEO generator must not reference legacy competitor brand text");
assert(seoGeoScript.includes("https://chinaready.co/contact/"), "seo-geo header Get help must link to /contact/");
assert(seoGeoScript.includes("Get help"), "seo-geo must include Get help label");
assert(seoGeoScript.includes("cr-site-get-help"), "seo-geo header must use cr-site-get-help class");
assert(!seoGeoScript.includes("cr-site-github"), "seo-geo shared header must not render the GitHub icon control");
assert(seoGeoScript.includes("cr-alt-sticky-cta"), "seo-geo must define alternatives sticky CTA markup");
assert(seoGeoScript.includes("Not sure which option fits your stack?"), "seo-geo sticky must use approved support copy");
assert(seoGeoScript.includes("Start assessment"), "seo-geo sticky must use Start assessment label");
assert(seoGeoScript.includes("https://chinaready.co/intake/"), "seo-geo sticky must link to /intake/");
assert(!seoGeoScript.includes("Next reading"), "seo-geo alternatives detail pages must not render Next reading");
assert(!seoGeoScript.includes("cr-alt-next"), "seo-geo must not emit the Next reading section class");
assert(exists("research/global-services-gap-catalog.json"), "gap catalog for taxonomy-relevant global services is missing");
assert(!exists("research/aic-technologies-hub.json"), "legacy third-party research snapshot must be removed");
const gapCatalogSource = read("research/global-services-gap-catalog.json");
assert(!gapCatalogSource.match(legacySourceBrandPattern), "gap catalog must not contain legacy competitor brand text");
assert(!gapCatalogSource.includes("aic_"), "gap catalog must not keep legacy research field prefixes");
assert(exists("assets/chinaready-alternatives.css"), "alternatives page stylesheet is missing");
assert(exists("assets/chinaready-alternatives-search.js"), "alternatives shared search script is missing");
const alternativesCss = read("assets/chinaready-alternatives.css");
assert(
  /\.cr-site-header\s*\{[^}]*position:\s*sticky/s.test(alternativesCss),
  "alternatives header must be position:sticky like Explore/Guide",
);
assert(alternativesCss.includes("top: 0"), "alternatives sticky header must pin to top: 0");
assert(alternativesCss.includes(".cr-alt-sticky-cta.is-away"), "alternatives CSS must hide sticky CTA when footer is visible");
assert(
  alternativesCss.includes(".cr-alt-body--sticky.cr-alt-sticky-cta-away .cr-site-footer"),
  "alternatives CSS must clear footer padding while sticky CTA is away",
);
const alternativesSearchJs = read("assets/chinaready-alternatives-search.js");
assert(
  alternativesSearchJs.includes("bindStickyCtaHideOnFooter"),
  "alternatives search script must bind sticky CTA hide-on-footer behavior",
);
assert(
  alternativesSearchJs.includes("IntersectionObserver"),
  "sticky CTA hide-on-footer must use IntersectionObserver against the footer",
);
assert(
  alternativesSearchJs.includes('classList.toggle("is-away"') || alternativesSearchJs.includes("classList.toggle('is-away'"),
  "sticky CTA hide-on-footer must toggle is-away class",
);
assert(settings.includes("Firebase, FCM, AWS, Stripe"), "settings.yml description must target high-intent alternative keywords");
assert(headerLogo.includes('font-size="24"'), "header logo must use a larger Chinaready Landscape wordmark");
assert(!headerLogo.includes(">Chinaready</text>"), "header logo text must be a single-line Chinaready Landscape lockup");

assert(!exists("vendor/chinaready-design-system"), "vendor/chinaready-design-system must be removed");
assert(exists("assets/chinaready-logo-horizontal-white.svg"), "copied Chinaready footer logo asset is missing");
assert(exists("assets/chinaready-landscape.css"), "Chinaready landscape override CSS is missing");
assert(exists("scripts/build-preview.mjs"), "build-preview wrapper is missing");

const brandCss = read("assets/chinaready-landscape.css");
assert(brandCss.includes("footer[role=\"contentinfo\"].bg-black"), "Chinaready CSS must override the landscape2 bg-black footer");
assert(brandCss.includes("header img"), "Chinaready CSS must tune the landscape header logo rendering");
assert(brandCss.includes("main table th") && brandCss.includes("border: 1px solid var(--cr-border)"), "Chinaready CSS must render visible table separators");
assert(brandCss.includes(".cr-landscape-profile"), "Chinaready CSS must style item profile sections");
assert(brandCss.includes(".cr-native-summary-hidden"), "Chinaready CSS must hide the landscape2 native Summary/TAGS block");
assert(brandCss.includes("border: 1px solid #d9dfe7"), "Chinaready CSS must use CNCF-style thin section borders");
assert(brandCss.includes("font-size: 13px") && brandCss.includes("letter-spacing: 0"), "Chinaready CSS must tune CNCF-style summary heading typography");
assert(brandCss.includes("min-height: 22px") && brandCss.includes("border-radius: 0"), "Chinaready CSS must render CNCF-style rectangular blue badges");
assert(!brandCss.includes(".cr-summary-more"), "Chinaready CSS must not render a Show more truncation control");
assert(brandCss.includes(".cr-detail-dialog") && brandCss.includes("max-height: 72vh"), "Chinaready CSS must shorten the item detail modal height");
assert(brandCss.includes(".cr-hover-use-case"), "Chinaready CSS must style hover card use-case content");
assert(brandCss.includes(".cr-hover-badge"), "Chinaready CSS must style hover card global alternative badges");
assert(brandCss.includes(".cr-hover-row") && brandCss.includes(".cr-hover-extra"), "Chinaready CSS must keep the hover website link inline with alternative tags");
assert(!brandCss.includes(".cr-hover-card [class*=\"_extra_\"]"), "Chinaready CSS must not absolutely position the hover website link away from tags");
assert(brandCss.includes("text-transform: none"), "Chinaready CSS must allow hover card badges to render title case");
assert(!brandCss.includes(".cr-hover-card {\n  position:"), "Chinaready CSS must not override landscape2 hover card positioning");
assert(brandCss.includes(".cr-footer-grid"), "Chinaready CSS must render the custom footer grid");
assert(
  brandCss.includes("grid-template-columns: repeat(4, minmax(0, 1fr))"),
  "Chinaready footer grid must use four equal-width columns",
);
assert(brandCss.includes(".cr-footer-description"), "Chinaready CSS must place the project description under the footer logo");
assert(brandCss.includes(".cr-guide-global-link") || brandCss.includes("cr-guide-global-link"), "Chinaready CSS must style the Guide Global menu link");
assert(brandCss.includes("cr-global-nav-link"), "Chinaready CSS must style the header Global nav link");

assert(gitignore.match(/^docs\/$/m), ".gitignore must exclude docs/");
const trackedDocs = spawnSync("git", ["ls-files", "docs"], { cwd: root, encoding: "utf8" });
assert(trackedDocs.status === 0, "git ls-files docs must run successfully");
assert(trackedDocs.stdout.trim() === "", "docs/ must not contain tracked files");
assert(exists("assets/chinaready-landscape-details.js"), "Chinaready item detail extension script is missing");
const detailsScript = read("assets/chinaready-landscape-details.js");
assert(detailsScript.includes("Summary"), "detail extension must render a CNCF-style Summary section");
assert(detailsScript.includes("removeNativeSummary"), "detail extension must remove the landscape2 native Summary/TAGS block");
assert(detailsScript.includes(".summaryBlock"), "detail extension must hide the current landscape2 Tags summaryBlock");
assert(detailsScript.includes("forceStaticPageNavigation"), "detail extension must force full navigation to static /alternatives pages");
assert(detailsScript.includes('pathname === "/guide"') || detailsScript.includes('startsWith("/guide")'), "detail extension must force full navigation to static /guide");
assert(detailsScript.includes("enhanceHeaderGlobalNav"), "detail extension must inject Global into the top navigation");
assert(detailsScript.includes("enhanceHeaderGetHelp"), "detail extension must inject Get help into the top header");
assert(detailsScript.includes("https://chinaready.co/contact/"), "detail extension Get help must link to /contact/");
assert(detailsScript.includes(">Get help<") || detailsScript.includes('textContent = "Get help"'), "detail extension must use Get help label");
assert(detailsScript.includes("enhanceGuideGlobalMenu"), "detail extension must inject Global into the Guide sidebar");
assert(detailsScript.includes("absoluteAssetUrl"), "detail extension must use root-absolute footer logo URLs");
assert(detailsScript.includes("/images/chinaready-logo-horizontal-white.svg"), "detail extension footer logo must use a root-absolute path");
assert(detailsScript.includes("textBlock(annotations.product_overview"), "detail extension must render product overview without a USE CASE subheading");
assert(detailsScript.includes("textBlock(annotations.china_context"), "detail extension must render China context without a CHINA MARKET FIT subheading");
assert(detailsScript.includes("annotations.availability_status"), "detail extension must surface availability_status");
assert(detailsScript.includes("annotations.global_availability_in_china"), "detail extension must surface global_availability_in_china");
assert(!detailsScript.includes('summaryBlock("ALTERNATIVE TO"'), "detail extension must not render an Alternative To text block");
assert(!detailsScript.includes("DEVELOPER RESOURCES"), "detail extension must not render a developer resources subheading");
assert(detailsScript.includes("cr-profile-badge"), "detail extension must render badge-style metadata");
assert(detailsScript.includes("candidateHoverCards"), "detail extension must detect landscape2 hover cards");
assert(detailsScript.includes("titleCase"), "detail extension must format hover card badges as title case");
assert(detailsScript.includes("cr-hover-card"), "detail extension must mark landscape2 hover cards for Chinaready styling");
assert(detailsScript.includes("moveHoverLinksIntoTagRow"), "detail extension must move the hover website link into the tag row");
assert(detailsScript.includes("cr-hover-use-case"), "detail extension must render hover card use-case content under the product name");
assert(!detailsScript.includes('heading.textContent = "USE CASE"'), "hover card must not render a USE CASE heading");
assert(!detailsScript.includes('compactBadgeBlock("GLOBAL ALTERNATIVES"'), "hover card must not render a GLOBAL ALTERNATIVES heading");
assert(!detailsScript.includes("Show more") && !detailsScript.includes("cr-summary-more"), "detail extension must show full text without truncation");
assert(detailsScript.includes("section(\"Organization\""), "detail extension must render organization as a standalone fieldset");
assert(!detailsScript.includes('summaryBlock("ORGANIZATION"'), "detail extension must render organization copy without an ORGANIZATION subheading");
assert(detailsScript.includes("Official Website") && detailsScript.includes("Developer Docs"), "detail extension must render link labels in title case");
assert(!detailsScript.includes("gridSection(\"Metadata\""), "detail extension must not render a Metadata fieldset");
assert(!detailsScript.includes("gridSection(\"Archive Evidence\""), "detail extension must not render an Archive Evidence fieldset");
assert(detailsScript.includes("modal-body"), "detail extension must mount profile fields inside the visible modal body");
assert(detailsScript.includes("enhanceFooter"), "detail extension must enhance the landscape2 footer");
assert(detailsScript.includes('footerColumn("Learn"'), "detail extension footer must include a Learn column");
assert(detailsScript.includes('footerColumn("Chinaready"'), "detail extension footer must title the Chinaready column correctly");
assert(detailsScript.includes('href: "/alternatives/"'), "detail extension footer must route China Alternatives to /alternatives/");
assert(detailsScript.includes('href: "/guide"'), "detail extension footer must keep Landscape Guide on /guide");
assert(detailsScript.includes("China Launch Guides"), "detail extension footer must include a content link to the main site");
assert(!detailsScript.includes('{ label: "Chinaready", href: "https://chinaready.co" }'), "detail extension footer must not duplicate the Chinaready home link");
assert(
  detailsScript.includes("Start Assessment") &&
    detailsScript.includes("Book a Call") &&
    detailsScript.includes("All Services") &&
    detailsScript.includes("https://chinaready.co/services/"),
  "detail extension footer must include Chinaready conversion and services links",
);
assert(detailsScript.includes("Stackbreak Lab"), "detail extension footer must include the Stackbreak Lab column");
assert(detailsScript.includes("Beijing View") && detailsScript.includes("https://stackbreak.launchready.cn/demos/beijing-view.html"), "detail extension footer must include the Stackbreak Beijing View link");
assert(detailsScript.includes("https://stackbreak.launchready.cn/public/results/firebase.html"), "detail extension footer must include Stackbreak Firebase results");

if (exists("build/index.html")) {
  const index = read("build/index.html");
  assert(!index.includes("vendor/chinaready-design-system"), "build/index.html must not link the removed vendored design system");
  assert(index.includes("assets/chinaready-landscape.css"), "build/index.html must link the Chinaready landscape override CSS");
  assert(index.includes("assets/chinaready-landscape-details.js?v=20260720-seo-geo-ctr"), "build/index.html must load the cache-busted Chinaready item detail extension");
  assert(index.includes('<link rel="icon" href="/favicon.ico" sizes="any">'), "build/index.html must declare the ICO favicon with sizes=any");
  assert(index.includes('href="/favicon-48x48.png"'), "build/index.html must declare the 48x48 PNG favicon for Google Search");
  assert(index.includes('href="/favicon-96x96.png"'), "build/index.html must declare the 96x96 PNG favicon for search engines");
  assert(index.includes('<link rel="apple-touch-icon" href="/apple-touch-icon.png"'), "build/index.html must declare the apple-touch-icon PNG");
  assert(!index.includes('href="/favicon.svg"'), "build/index.html must not prefer SVG favicon over Google-eligible PNG/ICO");
  assert(index.includes('"logo": "https://landscape.chinaready.co/favicon-192x192.png"') || index.includes('"logo":"https://landscape.chinaready.co/favicon-192x192.png"'), "build/index.html Organization JSON-LD must declare the brand logo");
  assert(index.includes(repositoryUrl), "build/index.html must include the Chinaready landscape repository link");
  assert(!index.match(legacySourceBrandPattern), "build/index.html must not contain legacy source brand text");
  assert(index.includes("China Alternatives to Firebase, AWS, Stripe"), "build/index.html title must target alternative long-tail queries");
  assert(index.includes('"@type": "WebSite"'), "build/index.html must include WebSite JSON-LD");
  assert(index.includes('"@type": "Organization"'), "build/index.html must include Organization JSON-LD");
  assert(index.includes("/llms.txt"), "build/index.html must advertise llms.txt");
  assert(index.includes("/alternatives/"), "build/index.html must advertise the alternatives index");
  assert(
    index.includes("googletagmanager.com/gtag/js?id=G-4BXLJXM1DY"),
    "build/index.html must include the Google tag",
  );
  assert(index.includes("gtag('config', 'G-4BXLJXM1DY')"), "build/index.html must configure GA measurement ID");
  assert(
    index.includes('rel="canonical" href="https://landscape.chinaready.co/"'),
    "build/index.html canonical must use the trailing-slash home URL",
  );
  assert(
    index.includes('property="og:image" content="https://landscape.chinaready.co/favicon-512x512.png"'),
    "build/index.html must declare og:image",
  );
}

if (exists("build/robots.txt")) {
  const robots = read("build/robots.txt");
  assert(robots.includes("Sitemap: https://landscape.chinaready.co/sitemap.xml"), "robots.txt must declare the sitemap");
  assert(robots.includes("GPTBot"), "robots.txt must explicitly allow major AI crawlers");
  assert(robots.includes("Disallow: /embed"), "robots.txt must disallow thin embed pages");
  assert(
    robots.includes("Content-Signal: ai-train=no, search=yes, ai-input=yes"),
    "robots.txt must declare Content-Signal preferences",
  );
}

if (exists("build/sitemap.xml")) {
  const sitemap = read("build/sitemap.xml");
  assert(sitemap.includes("https://landscape.chinaready.co/alternatives/"), "sitemap.xml must include the alternatives index");
  assert(sitemap.includes("<loc>https://landscape.chinaready.co/</loc>"), "sitemap.xml must include the trailing-slash home URL");
  assert(sitemap.includes("https://landscape.chinaready.co/guide"), "sitemap.xml must include the Guide URL");
  assert(sitemap.includes("https://landscape.chinaready.co/alternatives/firebase"), "sitemap.xml must include the Firebase alternatives page");
  assert(sitemap.includes("https://landscape.chinaready.co/alternatives/firebase-cloud-messaging"), "sitemap.xml must include the FCM alternatives page");
  assert(sitemap.includes("https://landscape.chinaready.co/alternatives/sentry"), "sitemap.xml must include the restored Sentry alternatives page");
  assert(!sitemap.includes("https://landscape.chinaready.co/alternatives/firebase.html"), "sitemap.xml must use extensionless Firebase URL (Cloudflare Pages pretty URL)");
  assert(!/\/alternatives\/[a-z0-9-]+\.html</.test(sitemap), "sitemap.xml must not list .html alternatives URLs that 308 to extensionless");
  const sitemapLocs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
  const altHtmlPages = fs
    .readdirSync("build/alternatives")
    .filter((name) => name.endsWith(".html") && name !== "index.html");
  assert(
    sitemapLocs.length === 3 + altHtmlPages.length,
    `sitemap.xml loc count must equal home+guide+alt-index+${altHtmlPages.length} detail pages (got ${sitemapLocs.length})`,
  );
}

if (exists("build/llms.txt")) {
  const llms = read("build/llms.txt");
  assert(llms.includes("# Chinaready Landscape"), "llms.txt must identify the project");
  assert(llms.includes("https://chinaready.co"), "llms.txt must cite the Chinaready main site");
  assert(llms.includes("High-intent questions"), "llms.txt must expose high-intent question framing for GEO");
  assert(llms.includes("Does Firebase"), "llms.txt must include common Firebase availability questions");
  assert(llms.includes("/alternatives/sentry"), "llms.txt high-intent list must link the Sentry page when present");
}

if (exists("build/guide.html")) {
  const guidePage = read("build/guide.html");
  assert(guidePage.includes("Chinaready Landscape Guide"), "static guide page must use a Guide H1/title");
  assert(
    guidePage.includes('rel="canonical" href="https://landscape.chinaready.co/guide"'),
    "static guide page canonical must be /guide, not the homepage",
  );
  assert(guidePage.includes('property="og:image"'), "static guide page must declare og:image");
  assert(guidePage.includes("/alternatives/"), "static guide page must link to alternatives");
  assert(guidePage.includes('id="menu"'), "static guide page must keep the left category Index menu");
  assert(guidePage.includes('id="btn_overview"'), "static guide Index must include Overview");
  assert(
    guidePage.includes('data-guide-target="infrastructure-edge--cloud-platform-hosting"'),
    "static guide Index must use Explore-compatible category--subcategory anchors",
  );
  assert(
    guidePage.includes('id="infrastructure-edge--cloud-platform-hosting"'),
    "static guide content must expose Explore deep-link targets",
  );
  assert(
    guidePage.includes('data-chinaready-global-menu="true"'),
    "static guide Index must include the Global peer menu link",
  );
  assert(guidePage.includes("cr-guide-toc-card"), "static guide Index must use the CNCF-style bordered Index card");
}

if (exists("build/404.html")) {
  const notFound = read("build/404.html");
  assert(notFound.includes("noindex"), "404.html must be noindex");
  assert(notFound.includes("Page not found"), "404.html must explain the miss");
  assert(notFound.includes("/alternatives/"), "404.html must link back to alternatives");
}

if (exists("build/_redirects")) {
  const redirects = read("build/_redirects");
  assert(redirects.includes("No SPA catch-all") || redirects.includes("pretty URLs"), "_redirects must document no SPA catch-all policy");
  assert(!redirects.includes("/* /index.html"), "_redirects must not SPA-fallback all routes to index.html");
  assert(!/^\s*\/guide\s+\/guide\.html\s+200\s*$/m.test(redirects), "_redirects must not rewrite /guide to /guide.html (pretty-URL loop risk)");
}

{
  const headers = exists("build/_headers") ? read("build/_headers") : "";
  assert(headers.includes('rel="api-catalog"'), "_headers must advertise api-catalog Link relation on homepage");
  assert(headers.includes("/.well-known/api-catalog"), "_headers must Link to api-catalog");
  assert(headers.includes("/openapi.json"), "_headers must Link to OpenAPI service-desc");
}

{
  assert(exists("build/.well-known/api-catalog"), "must publish /.well-known/api-catalog");
  const catalog = JSON.parse(read("build/.well-known/api-catalog"));
  assert(Array.isArray(catalog.linkset) && catalog.linkset.length > 0, "api-catalog must include a linkset array");
  assert(
    catalog.linkset.some((entry) => Array.isArray(entry["service-desc"])),
    "api-catalog entries must include service-desc links",
  );
  assert(exists("build/openapi.json"), "must publish /openapi.json");
  const openapi = JSON.parse(read("build/openapi.json"));
  assert(openapi.openapi && openapi.paths?.["/data/full.json"], "openapi.json must describe public landscape data paths");
  assert(exists("build/auth.md"), "must publish /auth.md");
  const authMd = read("build/auth.md");
  assert(/^#\s*auth\.md\b/m.test(authMd), "auth.md must use an Auth.md H1 heading");
  assert(authMd.includes("agentic registration"), "auth.md must describe agentic registration");
  assert(authMd.includes("Step 3 — Register") || authMd.includes("## Step 3"), "auth.md must include a Register step");
  assert(authMd.includes("anonymous"), "auth.md must document the anonymous registration method");
  assert(authMd.includes("oauth-protected-resource"), "auth.md must point agents at Protected Resource Metadata");
  assert(exists("build/.well-known/oauth-protected-resource"), "must publish OAuth Protected Resource Metadata");
  const prm = JSON.parse(read("build/.well-known/oauth-protected-resource"));
  assert(prm.resource && Array.isArray(prm.authorization_servers), "PRM must include resource and authorization_servers");
  assert(Array.isArray(prm.bearer_methods_supported) && prm.bearer_methods_supported.includes("header"), "PRM must support header bearer method");
  assert(exists("build/.well-known/oauth-authorization-server"), "must publish OAuth Authorization Server metadata");
  const asMeta = JSON.parse(read("build/.well-known/oauth-authorization-server"));
  assert(asMeta.issuer, "AS metadata must include issuer");
  assert(
    prm.authorization_servers.includes(asMeta.issuer),
    "AS issuer must be listed exactly in PRM authorization_servers",
  );
  assert(asMeta.agent_auth?.skill && asMeta.agent_auth?.register_uri, "AS agent_auth must include skill and register_uri");
  assert(Array.isArray(asMeta.agent_auth.identity_types_supported), "AS agent_auth must list identity_types_supported");
  if (asMeta.agent_auth.identity_assertion?.assertion_types_supported?.includes("verified_email")) {
    assert(
      asMeta.agent_auth.identity_types_supported.includes("identity_assertion"),
      "verified_email requires identity_assertion in identity_types_supported",
    );
  }
  assert(asMeta.agent_auth.claim_uri || asMeta.agent_auth.claim_endpoint, "AS agent_auth must include claim URI");
  assert(asMeta.agent_auth.revocation_uri || asMeta.revocation_endpoint, "AS agent_auth/metadata must include revocation URI");
  assert(exists("build/.well-known/agent-skills/index.json"), "must publish agent-skills discovery index");
  const skillsIndex = JSON.parse(read("build/.well-known/agent-skills/index.json"));
  assert(skillsIndex.$schema, "agent-skills index must declare $schema");
  assert(Array.isArray(skillsIndex.skills) && skillsIndex.skills[0]?.digest?.startsWith("sha256:"), "agent-skills entries must include sha256 digests");
  assert(exists("build/.well-known/agent-skills/chinaready-landscape/SKILL.md"), "must publish chinaready-landscape SKILL.md");
  assert(exists("build/assets/chinaready-webmcp.js"), "must publish WebMCP tools script");
  assert(read("assets/chinaready-webmcp.js").includes("registerTool"), "WebMCP script must call registerTool");
  const indexHtml = exists("build/index.html") ? read("build/index.html") : "";
  assert(indexHtml.includes("chinaready-webmcp.js"), "homepage must load WebMCP tools script");
}

{
  const searchJs = read("assets/chinaready-alternatives-search.js");
  assert(searchJs.includes("URLSearchParams"), "alternatives search must read URLSearchParams for SearchAction ?q=");
  assert(searchJs.includes('params.get("q")') || searchJs.includes("params.get('q')"), "alternatives search must apply the q query param");
}

{
  const guideSource = read("guide.yml");
  const guideAltSlugs = [...guideSource.matchAll(/\]\(\/alternatives\/([a-z0-9-]+)\)/g)].map((match) => match[1]);
  assert(guideAltSlugs.length > 0, "guide.yml must link to alternatives pages");
  for (const slug of new Set(guideAltSlugs)) {
    assert(exists(`build/alternatives/${slug}.html`), `guide.yml link /alternatives/${slug} must have a built page`);
  }
  const popularSlugs = [
    "firebase",
    "firebase-cloud-messaging",
    "aws",
    "stripe",
    "google-maps-platform",
    "sentry",
    "datadog",
    "google-analytics",
  ];
  for (const slug of popularSlugs) {
    assert(exists(`build/alternatives/${slug}.html`), `popular lookup /alternatives/${slug} must have a built page`);
  }
}

if (exists("build/alternatives/index.html")) {
  const alternativesIndex = read("build/alternatives/index.html");
  assert(alternativesIndex.includes("China alternatives to global developer services"), "alternatives index must use a clear H1 topic");
  assert(alternativesIndex.includes("Firebase"), "alternatives index must include Firebase mappings");
  assert(alternativesIndex.includes("Availability in China"), "alternatives index must include Availability in China column");
  assert(alternativesIndex.includes("cr-alt-availability"), "alternatives index must style availability labels");
  assert(alternativesIndex.includes("Popular China alternative lookups"), "alternatives index must surface high-intent internal links");
  assert(alternativesIndex.includes("Firebase alternatives in China"), "alternatives index must link popular Firebase lookup");
  assert(alternativesIndex.includes('href="/alternatives/firebase"'), "alternatives index must link Firebase with the extensionless public URL");
  assert(!alternativesIndex.includes('href="/alternatives/firebase.html"'), "alternatives index must not link the .html redirect alias");
  assert(alternativesIndex.includes("chinaready.co"), "alternatives index must route to the main site");
  assert(alternativesIndex.includes('"@type":"FAQPage"') || alternativesIndex.includes('"@type": "FAQPage"'), "alternatives index must include FAQPage JSON-LD");
  assert(
    alternativesIndex.includes('href="/favicon.ico" sizes="any"') &&
      alternativesIndex.includes('href="/favicon-48x48.png"') &&
      alternativesIndex.includes('href="/favicon-96x96.png"'),
    "alternatives index must declare the ICO and Google-eligible PNG favicons",
  );
  assert(!alternativesIndex.includes('href="/favicon.svg"'), "alternatives index must not prefer SVG favicon over PNG/ICO");
  assert(alternativesIndex.includes("/images/chinaready-landscape-logo.svg"), "alternatives index must use the shared landscape header logo");
  assert(alternativesIndex.includes('role="contentinfo"'), "alternatives index must use the shared contentinfo footer");
  assert(alternativesIndex.includes("cr-footer-grid"), "alternatives index must reuse the homepage footer grid");
  assert(alternativesIndex.includes("cr-site-header"), "alternatives index must use the shared site header");
  assert(alternativesIndex.includes("/assets/chinaready-landscape.css"), "alternatives index must load shared landscape CSS");
  assert(alternativesIndex.includes("cr-site-search"), "alternatives index must include the shared Guide-style header search");
  assert(alternativesIndex.includes("chinaready-alternatives-search.js"), "alternatives index must load the shared search script");
  assert(alternativesIndex.includes("Type"), "alternatives search must show the Type / to search items affordance");
  assert(alternativesIndex.includes(">Global</a>") || alternativesIndex.includes(">Global</"), "alternatives chrome must label the Global nav item");
  assert(alternativesIndex.includes('"@type":"ItemList"') || alternativesIndex.includes('"@type": "ItemList"'), "alternatives index must include ItemList JSON-LD");
  assert(alternativesIndex.includes('property="og:image"'), "alternatives index must declare og:image");
  assert(alternativesIndex.includes('href="/guide"'), "alternatives index must use a relative Guide link");
  assert(
    alternativesIndex.includes("googletagmanager.com/gtag/js?id=G-4BXLJXM1DY"),
    "alternatives index must include the Google tag",
  );
  assert(alternativesIndex.includes("gtag('config', 'G-4BXLJXM1DY')"), "alternatives index must configure GA measurement ID");
  assert(alternativesIndex.includes("cr-site-get-help"), "alternatives index header must include Get help CTA");
  assert(alternativesIndex.includes("https://chinaready.co/contact/"), "alternatives index Get help must link to /contact/");
  assert(alternativesIndex.includes(">Get help</a>"), "alternatives index must show Get help label");
  assert(!alternativesIndex.includes("cr-site-github"), "alternatives index header must not include GitHub icon control");
  assert(!alternativesIndex.includes("cr-alt-sticky-cta"), "alternatives index must not show sticky assessment CTA");
  const gapCatalog = JSON.parse(read("research/global-services-gap-catalog.json"));
  assert(gapCatalog.services?.length >= 100, "gap catalog must include the taxonomy-relevant unmapped global services");
  assert(alternativesIndex.includes("Dynatrace") || alternativesIndex.includes("BunnyCDN"), "alternatives index must include gap-catalog research services");
  assert(exists("build/alternatives/airtable.html"), "researched gap services such as Airtable must get a dedicated alternatives page");
  assert(exists("build/alternatives/dynatrace.html") || exists("build/alternatives/bunnycdn.html"), "researched gap services must get dedicated alternatives pages");
  const airtablePage = read("build/alternatives/airtable.html");
  assert(airtablePage.includes("Feishu Base"), "Airtable alternatives must list Feishu Base");
  assert(airtablePage.includes("Mingdao Cloud"), "Airtable alternatives must list Mingdao Cloud");
  assert(airtablePage.includes("Teable"), "Airtable alternatives must list Teable");
  assert(airtablePage.includes("Mapped China-ready candidates"), "Airtable alternatives must show Mapped China-ready candidates");
  assert(airtablePage.includes("Contact Chinaready"), "Airtable alternatives page must invite readers to contact Chinaready");
  assert(airtablePage.includes("Availability in China"), "gap alternatives pages must show Availability in China");
  assert(exists("build/alternatives/smile-io.html"), "Smile.io must get a dedicated alternatives page");
  const smilePage = read("build/alternatives/smile-io.html");
  assert(smilePage.includes("Youzan"), "Smile.io alternatives must list Youzan");
  assert(smilePage.includes("Weimob"), "Smile.io alternatives must list Weimob");
  assert(smilePage.includes("Mapped China-ready candidates"), "Smile.io alternatives must show Mapped China-ready candidates");
  assert(smilePage.includes("Limited"), "Smile.io alternatives must label Limited availability");
  assert(alternativesIndex.includes("Youzan, Weimob"), "alternatives index must show Youzan, Weimob for Smile.io");
  assert(exists("build/alternatives/commerce-layer.html"), "Commerce Layer must get a dedicated alternatives page");
  const commerceLayerPage = read("build/alternatives/commerce-layer.html");
  assert(commerceLayerPage.includes("Wanmi Shangyun"), "Commerce Layer alternatives must list Wanmi Shangyun");
  assert(commerceLayerPage.includes("Shushangyun"), "Commerce Layer alternatives must list Shushangyun");
  assert(commerceLayerPage.includes("Youzan"), "Commerce Layer alternatives must list Youzan");
  assert(commerceLayerPage.includes("Weimob"), "Commerce Layer alternatives must list Weimob");
  assert(commerceLayerPage.includes("Raycloud"), "Commerce Layer alternatives must list Raycloud");
  assert(commerceLayerPage.includes("Mapped China-ready candidates"), "Commerce Layer alternatives must show Mapped China-ready candidates");
  assert(commerceLayerPage.includes("Limited"), "Commerce Layer alternatives must label Limited availability");
  assert(
    alternativesIndex.includes("Wanmi Shangyun, Shushangyun, Youzan, Weimob, Raycloud"),
    "alternatives index must show Commerce Layer mapped candidates",
  );
  assert(exists("build/alternatives/marketo.html"), "Marketo must get a dedicated alternatives page");
  const marketoPage = read("build/alternatives/marketo.html");
  assert(marketoPage.includes("Fxiaoke"), "Marketo alternatives must list Fxiaoke");
  assert(marketoPage.includes("Tencent Qidian"), "Marketo alternatives must list Tencent Qidian");
  assert(marketoPage.includes("Weimob Marketing Cloud"), "Marketo alternatives must list Weimob Marketing Cloud");
  assert(marketoPage.includes("Zoho CRM"), "Marketo alternatives must list Zoho CRM");
  assert(marketoPage.includes("Mapped China-ready candidates"), "Marketo alternatives must show Mapped China-ready candidates");
  assert(marketoPage.includes("Limited"), "Marketo alternatives must label Limited availability");
  assert(
    alternativesIndex.includes("Fxiaoke, Tencent Qidian, Weimob Marketing Cloud, Zoho CRM"),
    "alternatives index must show Marketo mapped candidates",
  );
  assert(exists("build/alternatives/zoho-crm.html"), "Zoho CRM must get a dedicated alternatives page");
  const zohoCrmPage = read("build/alternatives/zoho-crm.html");
  assert(zohoCrmPage.includes("Zoho CRM alternatives in China"), "Zoho CRM page must use an intent-matching H1");
  assert(
    zohoCrmPage.includes('cr-alt-availability-available">Available</span>'),
    "Zoho CRM page must label mainland China availability as Available",
  );
  assert(zohoCrmPage.includes("Fxiaoke"), "Zoho CRM alternatives must list Fxiaoke");
  assert(zohoCrmPage.includes("Neocrm"), "Zoho CRM alternatives must list Neocrm");
  assert(zohoCrmPage.includes("Mapped China-ready candidates"), "Zoho CRM alternatives must show Mapped China-ready candidates");
  assert(zohoCrmPage.includes("Tencent Cloud"), "Zoho CRM page must mention Tencent Cloud data centers");
  assert(zohoCrmPage.includes("京ICP备15015257号-1"), "Zoho CRM page must mention ICP filing");
  assert(!zohoCrmPage.includes("Why Chinaready does not list these as Landscape products"), "Zoho CRM must not use empty uncertain framing");
  assert(alternativesIndex.includes("Fxiaoke, Neocrm"), "alternatives index must show Zoho CRM mapped candidates");
  assert(exists("build/alternatives/bigmarker.html"), "BigMarker must get a dedicated alternatives page");
  const bigmarkerPage = read("build/alternatives/bigmarker.html");
  assert(bigmarkerPage.includes("VHall"), "BigMarker alternatives must list VHall");
  assert(bigmarkerPage.includes("Polyv"), "BigMarker alternatives must list Polyv");
  assert(bigmarkerPage.includes("INMUU Live"), "BigMarker alternatives must list INMUU Live");
  assert(bigmarkerPage.includes("Nuoyun Live"), "BigMarker alternatives must list Nuoyun Live");
  assert(bigmarkerPage.includes("JD Cloud Enterprise Live"), "BigMarker alternatives must list JD Cloud Enterprise Live");
  assert(bigmarkerPage.includes("Tencent Meeting"), "BigMarker alternatives must list Tencent Meeting");
  assert(bigmarkerPage.includes("DingTalk Meeting"), "BigMarker alternatives must list DingTalk Meeting");
  assert(bigmarkerPage.includes("Feishu Meeting"), "BigMarker alternatives must list Feishu Meeting");
  assert(bigmarkerPage.includes("Huawei Cloud Meeting"), "BigMarker alternatives must list Huawei Cloud Meeting");
  assert(bigmarkerPage.includes("Haoshitong"), "BigMarker alternatives must list Haoshitong");
  assert(bigmarkerPage.includes("XYLink"), "BigMarker alternatives must list XYLink");
  assert(bigmarkerPage.includes("OrayMeeting"), "BigMarker alternatives must list OrayMeeting");
  assert(bigmarkerPage.includes("Mapped China-ready candidates"), "BigMarker alternatives must show Mapped China-ready candidates");
  assert(bigmarkerPage.includes("Unavailable"), "BigMarker alternatives must label Unavailable availability");
  assert(
    alternativesIndex.includes(
      "VHall, Polyv, INMUU Live, Nuoyun Live, JD Cloud Enterprise Live, Tencent Meeting, Haoshitong",
    ),
    "alternatives index must show BigMarker mapped candidates",
  );
  assert(exists("build/alternatives/on24.html"), "ON24 must get a dedicated alternatives page");
  const on24Page = read("build/alternatives/on24.html");
  assert(on24Page.includes("Polyv"), "ON24 alternatives must list Polyv");
  assert(on24Page.includes("VHall"), "ON24 alternatives must list VHall");
  assert(on24Page.includes("Feishu Webinar"), "ON24 alternatives must list Feishu Webinar");
  assert(on24Page.includes("NetEase Meeting"), "ON24 alternatives must list NetEase Meeting");
  assert(on24Page.includes("Lark"), "ON24 alternatives must list Lark");
  assert(on24Page.includes("Mapped China-ready candidates"), "ON24 alternatives must show Mapped China-ready candidates");
  assert(on24Page.includes("Unavailable"), "ON24 alternatives must label Unavailable availability");
  assert(
    alternativesIndex.includes("Polyv, VHall, Feishu Webinar, NetEase Meeting, Lark"),
    "alternatives index must show ON24 mapped candidates",
  );
  assert(exists("build/alternatives/kaltura.html"), "Kaltura must get a dedicated alternatives page");
  const kalturaPage = read("build/alternatives/kaltura.html");
  assert(kalturaPage.includes("Polyv"), "Kaltura alternatives must list Polyv");
  assert(kalturaPage.includes("Haoshitong"), "Kaltura alternatives must list Haoshitong");
  assert(kalturaPage.includes("Agora"), "Kaltura alternatives must list Agora");
  assert(kalturaPage.includes("Tencent Cloud TRTC"), "Kaltura alternatives must list Tencent Cloud TRTC");
  assert(kalturaPage.includes("ZEGO"), "Kaltura alternatives must list ZEGO");
  assert(kalturaPage.includes("Mapped China-ready candidates"), "Kaltura alternatives must show Mapped China-ready candidates");
  assert(kalturaPage.includes("Unavailable"), "Kaltura alternatives must label Unavailable availability");
  assert(
    alternativesIndex.includes("Polyv, Haoshitong, Agora, Tencent Cloud TRTC, ZEGO"),
    "alternatives index must show Kaltura mapped candidates",
  );
  assert(exists("build/alternatives/middleware-io.html"), "Middleware.io must get a dedicated alternatives page");
  const middlewarePage = read("build/alternatives/middleware-io.html");
  assert(middlewarePage.includes("Alibaba Cloud Observability"), "Middleware.io alternatives must list Alibaba Cloud Observability");
  assert(middlewarePage.includes("Tencent Cloud Observability Platform"), "Middleware.io alternatives must list Tencent Cloud Observability Platform");
  assert(middlewarePage.includes("Guance"), "Middleware.io alternatives must list Guance");
  assert(middlewarePage.includes("Cloudwise"), "Middleware.io alternatives must list Cloudwise");
  assert(!middlewarePage.includes("uni-app"), "Middleware.io alternatives must not list uni-app");
  assert(middlewarePage.includes("Mapped China-ready candidates"), "Middleware.io alternatives must show Mapped China-ready candidates");
  assert(middlewarePage.includes("Unavailable"), "Middleware.io alternatives must label Unavailable availability");
  assert(
    alternativesIndex.includes(
      "Alibaba Cloud Observability, Tencent Cloud Observability Platform, Guance, Cloudwise",
    ),
    "alternatives index must show Middleware.io mapped candidates",
  );
  assert(exists("build/alternatives/mia-platform.html"), "Mia Platform must get a dedicated alternatives page");
  const miaPlatformPage = read("build/alternatives/mia-platform.html");
  assert(miaPlatformPage.includes("API7"), "Mia Platform alternatives must list API7");
  assert(miaPlatformPage.includes("RestCloud"), "Mia Platform alternatives must list RestCloud");
  assert(miaPlatformPage.includes("CEC Cloud CSP"), "Mia Platform alternatives must list CEC Cloud CSP");
  assert(miaPlatformPage.includes("Snowy-Cloud"), "Mia Platform alternatives must list Snowy-Cloud");
  assert(miaPlatformPage.includes("Kingdee Cloud Cosmic gPaaS"), "Mia Platform alternatives must list Kingdee Cloud Cosmic gPaaS");
  assert(miaPlatformPage.includes("iSoftStone Cloud iPaaS"), "Mia Platform alternatives must list iSoftStone Cloud iPaaS");
  assert(miaPlatformPage.includes("Huawei Cloud DevCloud"), "Mia Platform alternatives must list Huawei Cloud DevCloud");
  assert(miaPlatformPage.includes("Mapped China-ready candidates"), "Mia Platform alternatives must show Mapped China-ready candidates");
  assert(miaPlatformPage.includes("Unavailable"), "Mia Platform alternatives must label Unavailable availability");
  assert(
    alternativesIndex.includes(
      "API7, RestCloud, CEC Cloud CSP, Snowy-Cloud, Kingdee Cloud Cosmic gPaaS, iSoftStone Cloud iPaaS, Huawei Cloud DevCloud",
    ),
    "alternatives index must show Mia Platform mapped candidates",
  );
  assert(exists("build/alternatives/aweber.html"), "AWeber must get a dedicated alternatives page");
  const aweberPage = read("build/alternatives/aweber.html");
  assert(aweberPage.includes("Fengyou EDM"), "AWeber alternatives must list Fengyou EDM");
  assert(aweberPage.includes("Zoho Campaigns"), "AWeber alternatives must list Zoho Campaigns");
  assert(aweberPage.includes("Mapped China-ready candidates"), "AWeber alternatives must show Mapped China-ready candidates");
  assert(aweberPage.includes("Unavailable"), "AWeber alternatives must label Unavailable availability");
  assert(!aweberPage.includes("Why Chinaready does not list these as Landscape products"), "AWeber must not use empty uncertain framing");
  assert(alternativesIndex.includes("Fengyou EDM, Zoho Campaigns"), "alternatives index must show AWeber mapped candidates");
  assert(exists("build/alternatives/sendspark.html"), "Sendspark must get a dedicated alternatives page");
  const sendsparkPage = read("build/alternatives/sendspark.html");
  assert(sendsparkPage.includes("Dongli Wuxian"), "Sendspark alternatives must list Dongli Wuxian");
  assert(sendsparkPage.includes("U-Mail"), "Sendspark alternatives must list U-Mail");
  assert(sendsparkPage.includes("Alibaba Cloud Sendify"), "Sendspark alternatives must list Alibaba Cloud Sendify");
  assert(sendsparkPage.includes("Mapped China-ready candidates"), "Sendspark alternatives must show Mapped China-ready candidates");
  assert(sendsparkPage.includes("Unavailable"), "Sendspark alternatives must label Unavailable availability");
  assert(!sendsparkPage.includes("Why Chinaready does not list these as Landscape products"), "Sendspark must not use empty uncertain framing");
  assert(
    alternativesIndex.includes("Dongli Wuxian, U-Mail, Alibaba Cloud Sendify"),
    "alternatives index must show Sendspark mapped candidates",
  );
  assert(exists("build/alternatives/streamlit-community-cloud.html"), "Streamlit Community Cloud must get a dedicated alternatives page");
  const streamlitPage = read("build/alternatives/streamlit-community-cloud.html");
  assert(streamlitPage.includes("Pyecharts"), "Streamlit alternatives must list Pyecharts");
  assert(streamlitPage.includes("NiceGUI"), "Streamlit alternatives must list NiceGUI");
  assert(streamlitPage.includes("Dash (Plotly)"), "Streamlit alternatives must list Dash (Plotly)");
  assert(streamlitPage.includes("Gradio"), "Streamlit alternatives must list Gradio");
  assert(streamlitPage.includes("Taipy"), "Streamlit alternatives must list Taipy");
  assert(streamlitPage.includes("Mapped China-ready candidates"), "Streamlit alternatives must show Mapped China-ready candidates");
  assert(streamlitPage.includes("Unavailable"), "Streamlit alternatives must label Unavailable availability");
  assert(!streamlitPage.includes("Why Chinaready does not list these as Landscape products"), "Streamlit must not use empty uncertain framing");
  assert(
    alternativesIndex.includes("Pyecharts, NiceGUI, Dash (Plotly), Gradio, Taipy"),
    "alternatives index must show Streamlit mapped candidates",
  );
  for (const file of fs.readdirSync(path.join(root, "build/alternatives")).filter((name) => name.endsWith(".html"))) {
    const page = read(`build/alternatives/${file}`);
    assert(
      !page.includes("Why Chinaready does not list these as Landscape products"),
      `${file} must not use empty uncertain framing when candidates are named`,
    );
    assert(
      !page.includes("No landscape product mappings by design"),
      `${file} must not use empty uncertain card title when candidates are named`,
    );
    const titleMatch = page.match(/<title>(.*?)<\/title>/s);
    assert(titleMatch, `${file} must declare a <title>`);
    const title = titleMatch[1].replace(/\s+/g, " ").trim().replace(/&amp;/g, "&");
    assert(
      title.endsWith("| Chinaready"),
      `${file} title must end with "| Chinaready" (got: ${title})`,
    );
    assert(
      title.length <= 60,
      `${file} title must stay ≤60 chars so Google SERPs keep | Chinaready (got ${title.length}: ${title})`,
    );
    assert(
      !/\((?:Available|Limited|Unavailable|Unknown)\)\s*\|\s*Chinaready$/i.test(title),
      `${file} title must not put availability status before | Chinaready`,
    );
  }
  assert(!exists("build/alternatives/grpc.html"), "gRPC must be removed from Global alternatives");
  assert(!exists("build/alternatives/flutter.html"), "Flutter must be removed from Global alternatives");
  assert(!exists("build/alternatives/react-native.html"), "React Native must be removed from Global alternatives");
  assert(!exists("build/alternatives/ionic.html"), "Ionic must be removed from Global alternatives");
  assert(!exists("build/alternatives/acast.html"), "Acast must be removed from Global alternatives");
  assert(!exists("build/alternatives/castos.html"), "Castos must be removed from Global alternatives");
  assert(!exists("build/alternatives/liftoff-monetize.html"), "Liftoff Monetize must be removed from Global alternatives");
  assert(!exists("build/alternatives/callkit.html"), "CallKit must be removed from Global alternatives");
  // GSC 404 drilldown (2026-08): removed pages must 301, not soft-404.
  const redirects = read("build/_redirects");
  assert(redirects.includes("/alternatives/acast.html /alternatives/buzzsprout 301"), "Acast 404 must redirect to Buzzsprout");
  assert(redirects.includes("/alternatives/castos.html /alternatives/buzzsprout 301"), "Castos 404 must redirect to Buzzsprout");
  assert(redirects.includes("/alternatives/callkit.html /alternatives/agora 301"), "CallKit 404 must redirect to Agora");
  assert(redirects.includes("/alternatives/amazon-route-53.html / 301"), "Amazon Route 53 404 must redirect home");
  assert(!exists("build/alternatives/vmware-vsphere.html"), "VMware vSphere must be removed from Global alternatives");
  assert(!exists("build/alternatives/sentence-bert.html"), "Sentence-BERT must be removed from Global alternatives");
  assert(!exists("build/alternatives/pangle-ads.html"), "Pangle Ads must be removed from Global alternatives");
  assert(!exists("build/alternatives/apollo-kotlin.html"), "Apollo Kotlin must be removed from Global alternatives");
  assert(!alternativesIndex.includes("gRPC"), "alternatives index must not list gRPC");
  assert(!alternativesIndex.includes("Flutter"), "alternatives index must not list Flutter");
  assert(!alternativesIndex.includes("React Native"), "alternatives index must not list React Native");
  assert(!alternativesIndex.includes(">Ionic<") && !alternativesIndex.includes("Ionic alternatives"), "alternatives index must not list Ionic");
  assert(!alternativesIndex.includes("Acast"), "alternatives index must not list Acast");
  assert(!alternativesIndex.includes("Castos"), "alternatives index must not list Castos");
  assert(!alternativesIndex.includes("Liftoff Monetize"), "alternatives index must not list Liftoff Monetize");
  assert(!alternativesIndex.includes("CallKit"), "alternatives index must not list CallKit");
  assert(!alternativesIndex.includes("VMware vSphere"), "alternatives index must not list VMware vSphere");
  assert(!alternativesIndex.includes("Sentence-BERT"), "alternatives index must not list Sentence-BERT");
  assert(!alternativesIndex.includes("Pangle Ads"), "alternatives index must not list Pangle Ads");
  assert(!alternativesIndex.includes("Apollo Kotlin"), "alternatives index must not list Apollo Kotlin");
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
}

if (exists("build/alternatives/firebase.html")) {
  const firebasePage = read("build/alternatives/firebase.html");
  assert(firebasePage.includes("Firebase alternatives in China"), "Firebase alternatives page must use an intent-matching H1");
  assert(firebasePage.includes("Does Firebase work in China"), "Firebase alternatives page must answer the primary GEO question");
  assert(firebasePage.includes("Quick answer"), "Firebase alternatives page must lead with a direct answer for CTR/GEO");
  assert(firebasePage.includes('"@type":"FAQPage"') || firebasePage.includes('"@type": "FAQPage"'), "Firebase alternatives page must include FAQPage JSON-LD");
  assert(firebasePage.includes("https://chinaready.co"), "Firebase alternatives page must link to the main site");
  assert(
    firebasePage.includes('rel="canonical" href="https://landscape.chinaready.co/alternatives/firebase"'),
    "Firebase canonical must be the Cloudflare Pages extensionless URL",
  );
  assert(!firebasePage.includes('rel="canonical" href="https://landscape.chinaready.co/alternatives/firebase.html"'), "Firebase canonical must not point at the .html redirect alias");
  assert(firebasePage.includes('property="og:image"'), "Firebase page must declare og:image");
  assert(firebasePage.includes("Related lookups"), "Firebase page must include related internal links");
}

if (exists("build/embed/embed.html")) {
  const embed = read("build/embed/embed.html");
  assert(embed.includes("noindex"), "embed.html must be noindex");
}

if (exists("build/alternatives/sentry.html")) {
  const sentryPage = read("build/alternatives/sentry.html");
  assert(sentryPage.includes("Sentry alternatives in China"), "Sentry page must use an intent-matching H1");
  assert(
    sentryPage.includes("Alibaba Cloud EMAS") || sentryPage.includes("Alibaba Cloud ARMS"),
    "Sentry page must map China observability options",
  );
}

if (exists("build/alternatives/stripe.html")) {
  const stripePage = read("build/alternatives/stripe.html");
  assert(stripePage.includes("Stripe alternatives in China"), "Stripe alternatives page must use an intent-matching H1");
  assert(stripePage.includes("Decide by deployment location first"), "Stripe page must lead with the deployment-location decision");
  assert(stripePage.includes("recommends not using Stripe"), "Stripe page must state Chinaready's mainland China Stripe recommendation");
  assert(stripePage.includes("Product stays outside China"), "Stripe page must explain when Stripe can still work globally");
  assert(stripePage.includes("WeChat Pay"), "Stripe page must map to WeChat Pay");
  assert(stripePage.includes("Alipay"), "Stripe page must map to Alipay");
  assert(stripePage.includes("Youzan Cloud"), "Stripe page must map to Youzan Cloud");
}

if (exists("build/alternatives/onesignal.html")) {
  const oneSignalPage = read("build/alternatives/onesignal.html");
  assert(
    oneSignalPage.includes("cr-alt-availability-limited\">Limited</span>"),
    "OneSignal page must label mainland China availability as Limited",
  );
}

assert(exists("build/alternatives/openai.html"), "OpenAI alternatives page must exist after AI model entries are added");
assert(exists("build/alternatives/anthropic.html"), "Anthropic alternatives page must exist after AI model entries are added");
assert(exists("build/alternatives/google-gemini.html"), "Google Gemini alternatives page must exist after AI model entries are added");
assert(exists("build/alternatives/pinecone.html"), "Pinecone alternatives page must exist after vector DB entries are added");
if (exists("build/alternatives/pinecone.html")) {
  const pineconePage = read("build/alternatives/pinecone.html");
  assert(
    pineconePage.includes("cr-alt-availability-limited\">Limited</span>"),
    "Pinecone page must label mainland China availability as Limited",
  );
  assert(pineconePage.includes("no mainland China nodes"), "Pinecone page must note the lack of mainland nodes");
  assert(pineconePage.includes("default gRPC"), "Pinecone page must note the default gRPC / DNS failure mode");
}
if (exists("build/alternatives/shopify.html")) {
  const shopifyPage = read("build/alternatives/shopify.html");
  assert(
    shopifyPage.includes("cr-alt-availability-unavailable\">Unavailable</span>"),
    "Shopify page must label mainland China availability as Unavailable",
  );
  assert(shopifyPage.includes("Shoplazza"), "Shopify page must list Shoplazza");
  assert(shopifyPage.includes("Taoify"), "Shopify page must list Taoify");
  assert(shopifyPage.includes("ShopsSea"), "Shopify page must list ShopsSea");
  assert(shopifyPage.includes("no mainland China servers or CDN nodes"), "Shopify page must note the lack of mainland CDN");
}
if (exists("build/alternatives/microsoft-azure.html")) {
  const azurePage = read("build/alternatives/microsoft-azure.html");
  assert(
    azurePage.includes("cr-alt-availability-limited\">Limited</span>"),
    "Microsoft Azure page must label mainland China availability as Limited",
  );
  assert(azurePage.includes("Alibaba Cloud"), "Microsoft Azure page must list Alibaba Cloud");
  assert(azurePage.includes("Tencent Cloud"), "Microsoft Azure page must list Tencent Cloud");
  assert(azurePage.includes("azure-china-what-works"), "Microsoft Azure page must link the Azure China insight");
  assert(
    azurePage.includes("physically isolated Azure instance"),
    "Microsoft Azure page must summarize the 21Vianet partition point",
  );
  assert(
    !/<h3><a href="https:\/\/www\.azure\.cn\/">Azure China<\/a><\/h3>/.test(azurePage),
    "Microsoft Azure page must not list Azure China as a candidate card",
  );
}

for (const googleSlug of [
  "google-maps-platform",
  "google-analytics",
  "google-fonts",
  "google-cloud",
  "google-cloud-dns",
  "google-sign-in",
  "google-recaptcha",
]) {
  const googlePagePath = `build/alternatives/${googleSlug}.html`;
  if (!exists(googlePagePath)) continue;
  const googlePage = read(googlePagePath);
  assert(
    googlePage.includes("presence in mainland China"),
    `${googleSlug} page must include shared Google China presence guidance`,
  );
  assert(
    googlePage.includes("Chinese corporate entity in April 2006"),
    `${googleSlug} page must mention Google's April 2006 China entity`,
  );
  assert(googlePage.includes("Blocked products"), `${googleSlug} page must list blocked Google products`);
  assert(googlePage.includes("Google Search"), `${googleSlug} page must list Google Search as blocked`);
  assert(googlePage.includes("YouTube"), `${googleSlug} page must list YouTube as blocked`);
  assert(googlePage.includes("Active business"), `${googleSlug} page must list active Google business lines`);
  assert(googlePage.includes("Google Ads"), `${googleSlug} page must list Google Ads as active`);
  assert(googlePage.includes("TensorFlow"), `${googleSlug} page must list TensorFlow as active`);
  assert(googlePage.includes("Flutter"), `${googleSlug} page must list Flutter as active`);
}

if (exists("build/alternatives/amazon-ses.html")) {
  const sesPage = read("build/alternatives/amazon-ses.html");
  assert(sesPage.includes("Amazon SES alternatives in China"), "Amazon SES alternatives page must use an intent-matching H1");
  assert(
    sesPage.includes("cr-alt-availability-unavailable\">Unavailable</span>"),
    "Amazon SES page must label mainland China availability as Unavailable",
  );
  assert(sesPage.includes("not available</strong> in AWS China regions"), "Amazon SES page must state AWS China does not offer SES");
  assert(sesPage.includes("Alibaba Cloud DirectMail"), "Amazon SES page must map to Alibaba Cloud DirectMail");
  assert(sesPage.includes("SendCloud"), "Amazon SES page must map to SendCloud");
  assert(sesPage.includes("Tencent Cloud SES"), "Amazon SES page must map to Tencent Cloud SES");
  assert(!sesPage.includes("Submail"), "Amazon SES page must not list Submail as a candidate");
  assert(!sesPage.includes("NetEase"), "Amazon SES page must not list NetEase email push as a candidate");
  assert(!/<h3><a[^>]*>Mailgun<\/a><\/h3>/.test(sesPage), "Amazon SES page must not list Mailgun as a China candidate");
  assert(sesPage.includes("cr-site-get-help"), "Amazon SES page header must include Get help CTA");
  assert(sesPage.includes("https://chinaready.co/contact/"), "Amazon SES Get help must link to /contact/");
  assert(sesPage.includes("cr-alt-sticky-cta"), "Amazon SES page must include sticky assessment CTA");
  assert(sesPage.includes("Not sure which option fits your stack?"), "Amazon SES sticky must use approved support copy");
  assert(sesPage.includes(">Start assessment</a>"), "Amazon SES sticky must show Start assessment");
  assert(sesPage.includes('href="https://chinaready.co/intake/"'), "Amazon SES sticky must link to /intake/");
  assert(!sesPage.includes("Next reading"), "Amazon SES page must not include Next reading");
  assert(!sesPage.includes("cr-alt-next"), "Amazon SES page must not include Next reading section markup");
}

if (exists("build/alternatives/amazon-cloudfront.html")) {
  const cloudfrontPage = read("build/alternatives/amazon-cloudfront.html");
  assert(
    cloudfrontPage.includes("Amazon CloudFront alternatives in China"),
    "Amazon CloudFront page must use an intent-matching H1",
  );
  assert(
    cloudfrontPage.includes('cr-alt-availability-available">Available</span>'),
    "Amazon CloudFront page must label mainland China availability as Available",
  );
  assert(cloudfrontPage.includes("Beijing (cn-north-1)"), "Amazon CloudFront page must mention Beijing region");
  assert(cloudfrontPage.includes("Ningxia (cn-northwest-1)"), "Amazon CloudFront page must mention Ningxia region");
  assert(cloudfrontPage.includes("光环新网"), "Amazon CloudFront page must mention Sinnet operator");
  assert(cloudfrontPage.includes("西云数据") || cloudfrontPage.includes("NWCD"), "Amazon CloudFront page must mention NWCD operator");
  assert(cloudfrontPage.includes("Zhongwei"), "Amazon CloudFront page must mention Zhongwei POP");
  assert(cloudfrontPage.includes("Lambda@Edge"), "Amazon CloudFront page must note Lambda@Edge limits");
  assert(cloudfrontPage.includes("Tencent Cloud CDN"), "Amazon CloudFront page must map to Tencent Cloud CDN");
  assert(cloudfrontPage.includes("Alibaba Cloud CDN"), "Amazon CloudFront page must map to Alibaba Cloud CDN");
  assert(cloudfrontPage.includes("ICP filing"), "Amazon CloudFront page must mention ICP filing requirements");
}

if (exists("build/alternatives/twilio-sms.html")) {
  const twilioSmsPage = read("build/alternatives/twilio-sms.html");
  assert(twilioSmsPage.includes("Twilio SMS alternatives in China"), "Twilio SMS alternatives page must use an intent-matching H1");
  assert(
    twilioSmsPage.includes("cr-alt-availability-unavailable\">Unavailable</span>"),
    "Twilio SMS page must label mainland China availability as Unavailable",
  );
  assert(twilioSmsPage.includes("March 30, 2021"), "Twilio SMS page must cite the March 30, 2021 PRC messaging cutoff");
  assert(
    twilioSmsPage.includes(
      "https://www.twilio.com/en-us/legal/service-country-specific-terms/prc-messaging-restrictions",
    ),
    "Twilio SMS page must link to Twilio PRC messaging restrictions",
  );
  assert(twilioSmsPage.includes("Alibaba Cloud SMS"), "Twilio SMS page must map to Alibaba Cloud SMS");
  assert(twilioSmsPage.includes("JPush SMS"), "Twilio SMS page must map to JPush SMS");
}

if (exists("build/alternatives/barracuda.html")) {
  const barracudaPage = read("build/alternatives/barracuda.html");
  assert(barracudaPage.includes("Barracuda alternatives in China"), "Barracuda alternatives page must use an intent-matching H1");
  assert(
    barracudaPage.includes('cr-alt-availability-limited">Limited</span>'),
    "Barracuda page must label mainland China availability as Limited",
  );
  assert(
    barracudaPage.includes("can be used in mainland China"),
    "Barracuda page must state the product can be used in mainland China",
  );
  assert(
    barracudaPage.includes("government, finance, and critical-infrastructure") ||
      barracudaPage.includes("government, finance, and critical infrastructure"),
    "Barracuda page must call out regulated-industry caution for new projects",
  );
  assert(barracudaPage.includes("Scenario"), "Barracuda page must include the scenario recommendation table");
  assert(barracudaPage.includes("Coremail (CACTER邮件安全网关)"), "Barracuda page must map to Coremail CACTER");
  assert(barracudaPage.includes("Topsec"), "Barracuda page must map to Topsec");
}

assert(exists("build/alternatives/azure-devops.html"), "Azure DevOps alternatives page must exist");
{
  const azureDevOpsPage = read("build/alternatives/azure-devops.html");
  assert(azureDevOpsPage.includes("Azure DevOps alternatives in China"), "Azure DevOps page must use an intent-matching H1");
  assert(
    azureDevOpsPage.includes('cr-alt-availability-limited">Limited</span>'),
    "Azure DevOps page must label mainland China availability as Limited",
  );
  assert(
    azureDevOpsPage.includes("do not offer Azure DevOps") || azureDevOpsPage.includes("do <strong>not</strong> offer Azure DevOps"),
    "Azure DevOps page must state Azure China does not host Azure DevOps",
  );
  assert(
    azureDevOpsPage.includes("deployment target") && azureDevOpsPage.includes("Azure DevOps (Global)"),
    "Azure DevOps page must explain Global Azure DevOps can target Azure China",
  );
  assert(
    azureDevOpsPage.includes("reuse") && azureDevOpsPage.includes("pipeline"),
    "Azure DevOps page must note existing pipelines can usually be reused",
  );
  assert(!azureDevOpsPage.includes("labels Azure DevOps as Unavailable"), "Azure DevOps FAQ must not claim Unavailable");
  assert(azureDevOpsPage.includes("Alibaba Cloud Yunxiao"), "Azure DevOps page must map to Yunxiao");
  assert(azureDevOpsPage.includes("Tencent Cloud DevOps (CODING)"), "Azure DevOps page must map to CODING");
}

assert(exists("build/alternatives/apple-pay.html"), "Apple Pay alternatives page must exist");
{
  const applePayPage = read("build/alternatives/apple-pay.html");
  assert(applePayPage.includes("Apple Pay alternatives in China"), "Apple Pay page must use an intent-matching H1");
  assert(
    applePayPage.includes('cr-alt-availability-available">Available</span>'),
    "Apple Pay page must label mainland China availability as Available",
  );
  assert(!applePayPage.includes("labels Apple Pay as Unavailable"), "Apple Pay FAQ must not claim Unavailable");
  assert(
    applePayPage.includes("Chinese internet users") && applePayPage.includes("Alipay") && applePayPage.includes("WeChat Pay"),
    "Apple Pay page must explain local payment preference for Alipay and WeChat Pay",
  );
  assert(
    applePayPage.includes("Should teams remove Apple Pay") || applePayPage.includes("Keep Apple Pay"),
    "Apple Pay page must advise keeping Apple Pay while adding local rails",
  );
}

assert(exists("build/alternatives/sign-in-with-apple.html"), "Apple Login must keep the stable sign-in-with-apple URL");
{
  const appleLoginPage = read("build/alternatives/sign-in-with-apple.html");
  assert(appleLoginPage.includes("Apple Login alternatives in China"), "Apple Login page must use Apple Login in the H1");
  assert(!appleLoginPage.includes("<h1>Sign in with Apple"), "Apple Login page must not keep Sign in with Apple as the H1 name");
  assert(
    appleLoginPage.includes('cr-alt-availability-limited">Limited</span>'),
    "Apple Login page must label mainland China availability as Limited",
  );
  assert(
    appleLoginPage.includes("functionally usable") || appleLoginPage.includes("feature works"),
    "Apple Login page must state the feature remains usable despite Limited status",
  );
  assert(
    appleLoginPage.includes("Chinaready labels it") || appleLoginPage.includes("so Chinaready labels"),
    "Apple Login page must explain why Chinaready sets Limited",
  );
  assert(appleLoginPage.includes("AuthenticationServices"), "Apple Login page must note AuthenticationServices does not need replacing");
  assert(appleLoginPage.includes("PIPL"), "Apple Login page must cover PIPL / personal-information storage");
  assert(appleLoginPage.includes("ICP"), "Apple Login page must cover ICP / China deployment context");
  assert(appleLoginPage.includes("WeChat Login"), "Apple Login page must map to WeChat Login");
  assert(appleLoginPage.includes("Alibaba Cloud SMS"), "Apple Login page must map phone OTP to Alibaba Cloud SMS");
  assert(
    appleLoginPage.includes("Common China login options to add alongside Apple Login"),
    "Apple Login page must frame candidates as additive login options",
  );
  assert(appleLoginPage.includes("sign in with apple") || appleLoginPage.includes("Sign in with Apple"), "Apple Login page must keep Sign in with Apple as an alias/search term");
}

if (exists("build/alternatives/twilio-video.html")) {
  const twilioVideoPage = read("build/alternatives/twilio-video.html");
  assert(twilioVideoPage.includes("Twilio Video alternatives in China"), "Twilio Video alternatives page must use an intent-matching H1");
  assert(
    twilioVideoPage.includes("cr-alt-availability-unavailable\">Unavailable</span>"),
    "Twilio Video page must label mainland China availability as Unavailable",
  );
  assert(twilioVideoPage.includes("Alibaba Cloud RTC"), "Twilio Video page must map to Alibaba Cloud RTC");
}

if (exists("build/alternatives/twilio-voice.html")) {
  const twilioVoicePage = read("build/alternatives/twilio-voice.html");
  assert(twilioVoicePage.includes("Twilio Voice alternatives in China"), "Twilio Voice alternatives page must use an intent-matching H1");
  assert(
    twilioVoicePage.includes("cr-alt-availability-unavailable\">Unavailable</span>"),
    "Twilio Voice page must label mainland China availability as Unavailable",
  );
  assert(
    twilioVoicePage.includes("https://help.twilio.com/articles/360016488474-Calling-Limitations-to-China"),
    "Twilio Voice page must link to Twilio Calling Limitations to China",
  );
  assert(twilioVoicePage.includes("Alibaba Cloud VMS"), "Twilio Voice page must map to Alibaba Cloud VMS");
  assert(twilioVoicePage.includes("Tencent Cloud VMS"), "Twilio Voice page must map to Tencent Cloud VMS");
  assert(
    twilioVoicePage.includes("http://help.aliyun.com/zh/vms/product-overview/what-is-voice-service"),
    "Twilio Voice page must link to Alibaba Cloud VMS overview",
  );
  assert(twilioVoicePage.includes("enterprise"), "Twilio Voice page must note Tencent Cloud VMS is enterprise-only");
}

if (exists("build/alternatives/google-admob.html")) {
  const admobPage = read("build/alternatives/google-admob.html");
  assert(admobPage.includes("Google AdMob alternatives in China"), "AdMob alternatives page must use an intent-matching H1");
  assert(
    admobPage.includes("cr-alt-availability-unavailable\">Unavailable</span>"),
    "AdMob page must label mainland China availability as Unavailable",
  );
  assert(admobPage.includes("strongly discouraged"), "AdMob page must state AdMob is strongly discouraged for mainland China");
  assert(admobPage.includes("Personal Information Protection Law"), "AdMob page must mention PIPL risk");
  assert(admobPage.includes("Pure domestic monetization checklist"), "AdMob page must include the domestic monetization checklist");
  assert(admobPage.includes("Pangle"), "AdMob page must map to Pangle");
  assert(admobPage.includes("Tencent Ads") || admobPage.includes("优量汇"), "AdMob page must map to Tencent Ads");
  assert(admobPage.includes("Baidu Union") || admobPage.includes("百度联盟"), "AdMob page must map to Baidu Union");
  assert(admobPage.includes("Kuaishou Union") || admobPage.includes("快手联盟"), "AdMob page must map to Kuaishou Union");
  assert(admobPage.includes("Huawei Ads") || admobPage.includes("鲸鸿动能"), "AdMob page must map to Huawei Ads");
  assert(admobPage.includes("Chinese corporate entity in April 2006"), "AdMob page must keep shared Google China presence context");
  assert(admobPage.includes("Ad Monetization") || admobPage.includes("Users, Trust & Monetization"), "AdMob candidates must sit under Users, Trust & Monetization");
  assert(!admobPage.includes(">Umeng+</"), "AdMob page must not list Umeng+ as the primary monetization candidate");
}

if (exists("build/alternatives/meta-ads.html")) {
  const metaAdsPage = read("build/alternatives/meta-ads.html");
  assert(metaAdsPage.includes("Ocean Engine"), "Meta Ads page must map to Ocean Engine");
  assert(metaAdsPage.includes("Tencent Advertising"), "Meta Ads page must map to Tencent Advertising");
  assert(metaAdsPage.includes("Kuaishou Ads"), "Meta Ads page must map to Kuaishou Ads");
}

if (exists("build/alternatives/liftoff.html")) {
  const liftoffPage = read("build/alternatives/liftoff.html");
  assert(liftoffPage.includes("Liftoff alternatives in China"), "Liftoff page must use an intent-matching H1");
  assert(liftoffPage.includes("Ocean Engine (巨量引擎)"), "Liftoff guidance must use English-first Ocean Engine heading");
  assert(liftoffPage.includes("Tencent Advertising (腾讯广告)"), "Liftoff guidance must use English-first Tencent Advertising heading");
  assert(liftoffPage.includes("Pangle (穿山甲)"), "Liftoff guidance must use English-first Pangle heading");
  assert(liftoffPage.includes("Kuaishou Ads (快手磁力引擎)"), "Liftoff guidance must use English-first Kuaishou Ads heading");
  assert(!liftoffPage.includes("<h3>巨量引擎"), "Liftoff guidance must not lead headings with Chinese names");
  assert(!liftoffPage.includes("Huawei Ads"), "Liftoff UA page must not list Huawei Ads among the four primary alternatives");
}

if (exists("build/alternatives/tiktok-ads.html")) {
  const tiktokAdsPage = read("build/alternatives/tiktok-ads.html");
  assert(tiktokAdsPage.includes("Ocean Engine"), "TikTok Ads page must map to Ocean Engine");
}

if (exists("build/alternatives/google-analytics.html")) {
  const gaPage = read("build/alternatives/google-analytics.html");
  assert(gaPage.includes("Google Analytics alternatives in China"), "GA alternatives page must use an intent-matching H1");
  assert(
    gaPage.includes("cr-alt-availability-unavailable\">Unavailable</span>"),
    "GA page must label mainland China availability as Unavailable",
  );
  assert(gaPage.includes("Choose by surface"), "GA page must include web vs App surface guidance");
  assert(gaPage.includes("Baidu Tongji") || gaPage.includes("百度统计"), "GA page must map to Baidu Tongji");
  assert(gaPage.includes("Umeng+") || gaPage.includes("友盟+"), "GA page must map to Umeng+");
  assert(gaPage.includes("GrowingIO"), "GA page must keep GrowingIO as a product-analytics option");
  assert(gaPage.includes("Chinese corporate entity in April 2006"), "GA page must keep shared Google China presence context");
  assert(gaPage.includes("SEO effect tracking") || gaPage.includes("channel-source"), "GA page must mention SEO/channel analytics use cases");
}

if (exists("build/alternatives/firebase-analytics.html")) {
  const firebaseAnalyticsPage = read("build/alternatives/firebase-analytics.html");
  assert(
    firebaseAnalyticsPage.includes("Firebase Analytics alternatives in China"),
    "Firebase Analytics alternatives page must use an intent-matching H1",
  );
  assert(
    firebaseAnalyticsPage.includes("cr-alt-availability-unavailable\">Unavailable</span>"),
    "Firebase Analytics page must label mainland China availability as Unavailable",
  );
  assert(
    firebaseAnalyticsPage.includes("https://stackbreak.launchready.cn/public/results/firebase.html#backend"),
    "Firebase Analytics page must link to Stack Break Lab Firebase backend results",
  );
  assert(
    firebaseAnalyticsPage.includes("does not recommend") || firebaseAnalyticsPage.includes("not recommend"),
    "Firebase Analytics page must state that reachable Firebase hosts are not recommended",
  );
  assert(
    firebaseAnalyticsPage.includes("compliance risk") || firebaseAnalyticsPage.includes("Personal Information Protection Law"),
    "Firebase Analytics page must call out mainland China compliance risk",
  );
  assert(firebaseAnalyticsPage.includes("Umeng+") || firebaseAnalyticsPage.includes("友盟+"), "Firebase Analytics page must map to Umeng+");
  assert(firebaseAnalyticsPage.includes("Alibaba Cloud EMAS"), "Firebase Analytics page must map to Alibaba Cloud EMAS");
}

if (exists("build/alternatives/joy-rewards-loyalty-program.html")) {
  const joyRewardsPage = read("build/alternatives/joy-rewards-loyalty-program.html");
  assert(
    joyRewardsPage.includes("Joy Rewards Loyalty Program alternatives in China"),
    "Joy Rewards page must use an intent-matching H1",
  );
  assert(
    joyRewardsPage.includes("cr-alt-availability-limited\">Limited</span>"),
    "Joy Rewards page must label mainland China availability as Limited",
  );
  assert(
    joyRewardsPage.includes("almost never shop on Shopify") || joyRewardsPage.includes("almost never use Shopify"),
    "Joy Rewards page must explain Shopify is not how mainland consumers shop",
  );
  assert(
    joyRewardsPage.includes("ecosystem-embedded") || joyRewardsPage.includes("WeChat"),
    "Joy Rewards page must explain China loyalty is ecosystem-embedded",
  );
  assert(joyRewardsPage.includes("88VIP"), "Joy Rewards page must mention platform membership examples");
  assert(joyRewardsPage.includes("Mapped China-ready candidates"), "Joy Rewards page must list mapped candidates");
  assert(joyRewardsPage.includes("Platform membership"), "Joy Rewards page must map platform membership");
  assert(joyRewardsPage.includes("WeChat-first membership"), "Joy Rewards page must map WeChat-first membership");
  assert(joyRewardsPage.includes("Native-app membership"), "Joy Rewards page must map native-app membership");
  assert(joyRewardsPage.includes("Coalition loyalty"), "Joy Rewards page must map coalition loyalty");
  assert(
    joyRewardsPage.includes("does <strong>not</strong> add them as Explore") ||
      joyRewardsPage.includes("does not add them as Explore"),
    "Joy Rewards page must keep Explore disclaimer",
  );
  assert(!joyRewardsPage.includes("homepage_url"), "Joy Rewards page must not invent landscape product candidate URLs");
  assert(joyRewardsPage.includes("Does Joy Rewards"), "Joy Rewards page must include loyalty FAQ");
}

assert(exists("build/assets/chinaready-alternatives.css"), "published alternatives stylesheet must exist");
assert(exists("assets/chinaready-mark.svg"), "Chinaready mark favicon source asset is missing");
assert(exists("assets/favicons/favicon.ico"), "pre-rendered favicon.ico asset is missing");
assert(exists("assets/favicons/favicon-48x48.png"), "pre-rendered 48x48 favicon asset is missing");
assert(exists("assets/favicons/favicon-96x96.png"), "pre-rendered 96x96 favicon asset is missing");
assert(exists("assets/favicons/favicon-192x192.png"), "pre-rendered 192x192 favicon asset is missing");
assert(exists("assets/favicons/apple-touch-icon.png"), "pre-rendered apple-touch-icon asset is missing");
if (exists("build")) {
  assert(exists("build/images/chinaready-mark.svg"), "published build must include /images/chinaready-mark.svg");
  assert(exists("build/favicon.ico"), "published build must serve a real /favicon.ico");
  assert(exists("build/favicon-48x48.png"), "published build must serve /favicon-48x48.png");
  assert(exists("build/favicon-96x96.png"), "published build must serve /favicon-96x96.png");
  assert(exists("build/favicon-192x192.png"), "published build must serve /favicon-192x192.png");
  assert(exists("build/apple-touch-icon.png"), "published build must serve /apple-touch-icon.png");
}

assert(!exists("build/vendor/chinaready-design-system"), "build output must not contain the removed vendored design system");

if (exists("build/assets/chinaready-landscape.css")) {
  const buildCss = read("build/assets/chinaready-landscape.css");
  assert(buildCss.includes("footer[role=\"contentinfo\"].bg-black"), "published CSS must override the landscape2 bg-black footer");
  assert(buildCss.includes("header img"), "published CSS must tune the landscape header logo rendering");
  assert(buildCss.includes("main table th") && buildCss.includes(".cr-landscape-profile"), "published CSS must include table and profile section styles");
  assert(buildCss.includes(".cr-native-summary-hidden"), "published CSS must hide the landscape2 native Summary/TAGS block");
  assert(buildCss.includes("border: 1px solid #d9dfe7") && !buildCss.includes(".cr-summary-more"), "published CSS must include refined detail styles without Show more truncation");
  assert(buildCss.includes(".cr-detail-dialog") && buildCss.includes("max-height: 72vh"), "published CSS must shorten the item detail modal height");
  assert(buildCss.includes(".cr-hover-use-case") && buildCss.includes(".cr-hover-badge"), "published CSS must include hover card styles");
  assert(buildCss.includes(".cr-hover-row") && buildCss.includes(".cr-hover-extra"), "published CSS must keep the hover website link inline with alternative tags");
  assert(!buildCss.includes(".cr-hover-card [class*=\"_extra_\"]"), "published CSS must not absolutely position the hover website link away from tags");
  assert(!buildCss.includes(".cr-hover-card {\n  position:"), "published CSS must not override landscape2 hover card positioning");
  assert(buildCss.includes(".cr-footer-grid"), "published CSS must include the custom footer grid");
  assert(
    buildCss.includes("grid-template-columns: repeat(4, minmax(0, 1fr))"),
    "published footer grid must use four equal-width columns",
  );
  assert(buildCss.includes(".cr-footer-description"), "published CSS must place the project description under the footer logo");
  assert(buildCss.includes("cr-guide-global-link"), "published CSS must style the Guide Global menu link");
  assert(buildCss.includes("cr-global-nav-link"), "published CSS must style the header Global nav link");
}

if (exists("build/assets/chinaready-landscape-details.js")) {
  const buildDetailsScript = read("build/assets/chinaready-landscape-details.js");
  assert(buildDetailsScript.includes("Summary"), "published detail extension must render a CNCF-style Summary section");
  assert(buildDetailsScript.includes("removeNativeSummary"), "published detail extension must remove the landscape2 native Summary/TAGS block");
  assert(buildDetailsScript.includes("forceStaticPageNavigation"), "published detail extension must force full navigation to static /alternatives pages");
  assert(
    buildDetailsScript.includes('pathname === "/guide"') || buildDetailsScript.includes('startsWith("/guide")'),
    "published detail extension must force full navigation to static /guide",
  );
  assert(buildDetailsScript.includes("enhanceHeaderGlobalNav"), "published detail extension must inject Global into the top navigation");
  assert(buildDetailsScript.includes("enhanceGuideGlobalMenu"), "published detail extension must inject Global into the Guide sidebar");
  assert(buildDetailsScript.includes("/images/chinaready-logo-horizontal-white.svg"), "published footer logo must use a root-absolute path");
  assert(buildDetailsScript.includes("textBlock(annotations.product_overview"), "published detail extension must render product overview without a USE CASE subheading");
  assert(buildDetailsScript.includes("textBlock(annotations.china_context"), "published detail extension must render China context without a CHINA MARKET FIT subheading");
  assert(buildDetailsScript.includes("annotations.availability_status"), "published detail extension must surface availability_status");
  assert(buildDetailsScript.includes("annotations.global_availability_in_china"), "published detail extension must surface global_availability_in_china");
  assert(!buildDetailsScript.includes('summaryBlock("ALTERNATIVE TO"'), "published detail extension must not render an Alternative To text block");
  assert(!buildDetailsScript.includes("DEVELOPER RESOURCES"), "published detail extension must not render a developer resources subheading");
  assert(buildDetailsScript.includes("cr-profile-badge"), "published detail extension must render badge-style metadata");
  assert(buildDetailsScript.includes("candidateHoverCards"), "published detail extension must detect landscape2 hover cards");
  assert(buildDetailsScript.includes("titleCase"), "published detail extension must format hover card badges as title case");
  assert(buildDetailsScript.includes("cr-hover-card"), "published detail extension must mark landscape2 hover cards for Chinaready styling");
  assert(buildDetailsScript.includes("moveHoverLinksIntoTagRow"), "published detail extension must move the hover website link into the tag row");
  assert(buildDetailsScript.includes("cr-hover-use-case"), "published detail extension must render hover card use-case content under the product name");
  assert(!buildDetailsScript.includes('heading.textContent = "USE CASE"'), "published hover card must not render a USE CASE heading");
  assert(!buildDetailsScript.includes('compactBadgeBlock("GLOBAL ALTERNATIVES"'), "published hover card must not render a GLOBAL ALTERNATIVES heading");
  assert(!buildDetailsScript.includes("Show more") && !buildDetailsScript.includes("cr-summary-more"), "published detail extension must show full text without truncation");
  assert(buildDetailsScript.includes("section(\"Organization\""), "published detail extension must render organization as a standalone fieldset");
  assert(!buildDetailsScript.includes('summaryBlock("ORGANIZATION"'), "published detail extension must render organization copy without an ORGANIZATION subheading");
  assert(buildDetailsScript.includes("Official Website") && buildDetailsScript.includes("Developer Docs"), "published detail extension must render link labels in title case");
  assert(!buildDetailsScript.includes("gridSection(\"Metadata\""), "published detail extension must not render a Metadata fieldset");
  assert(!buildDetailsScript.includes("gridSection(\"Archive Evidence\""), "published detail extension must not render an Archive Evidence fieldset");
  assert(buildDetailsScript.includes("enhanceFooter"), "published detail extension must enhance the landscape2 footer");
  assert(buildDetailsScript.includes('footerColumn("Learn"'), "published footer must include a Learn column");
  assert(buildDetailsScript.includes('footerColumn("Chinaready"'), "published footer must title the Chinaready column correctly");
  assert(buildDetailsScript.includes('href: "/alternatives/"'), "published footer must route China Alternatives to /alternatives/");
  assert(buildDetailsScript.includes('href: "/guide"'), "published footer must keep Landscape Guide on /guide");
  assert(buildDetailsScript.includes("China Launch Guides"), "published footer must include a content link to the main site");
  assert(!buildDetailsScript.includes('{ label: "Chinaready", href: "https://chinaready.co" }'), "published footer must not duplicate the Chinaready home link");
  assert(
    buildDetailsScript.includes("Start Assessment") &&
      buildDetailsScript.includes("Book a Call") &&
      buildDetailsScript.includes("All Services") &&
      buildDetailsScript.includes("https://chinaready.co/services/"),
    "published footer must include Chinaready conversion and services links",
  );
  assert(buildDetailsScript.includes("Stackbreak Lab"), "published footer must include the Stackbreak Lab column");
  assert(buildDetailsScript.includes("Beijing View") && buildDetailsScript.includes("https://stackbreak.launchready.cn/demos/beijing-view.html"), "published footer must include the Stackbreak Beijing View link");
  assert(buildDetailsScript.includes("https://stackbreak.launchready.cn/public/results/firebase.html"), "published footer must include Stackbreak Firebase results");
}

if (exists("build/data/base.json")) {
  const base = JSON.parse(read("build/data/base.json"));
  const baseSearchText = (name) => {
    const item = base.items.find((candidate) => candidate.name === name);
    return (item?.summary?.tags || []).join(" ");
  };
  assert(baseSearchText("SendCloud").match(/Amazon SES/i), "base.json search index tags must let SES find SendCloud");
  assert(baseSearchText("Alibaba Cloud DirectMail").match(/Amazon SES/i), "base.json search index tags must let SES find Alibaba Cloud DirectMail");
  assert(baseSearchText("Tencent Cloud SES").match(/Amazon SES/i), "base.json search index tags must let SES find Tencent Cloud SES");
  assert(baseSearchText("JPush").match(/\bFCM\b/i), "base.json search index tags must let FCM find JPush");
  const subcategoryCount = base.categories.reduce((total, category) => total + category.subcategories.length, 0);
  assert(base.categories.length === 7, "base.json must expose all 7 top-level categories");
  assert(subcategoryCount === 27, "base.json must expose all 27 subcategories");
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

if (exists("build/data/guide.json")) {
  const guideData = JSON.parse(read("build/data/guide.json"));
  const overview = guideData.categories.find((category) => category.category === "Overview");
  assert(overview, "guide.json must include Overview");
  assert(!overview.subcategories || overview.subcategories.length === 0, "guide.json Overview must not expose README or other submenu entries");
  assert(overview.content.includes("<table>"), "guide.json Overview content must render a real taxonomy table");
  assert(overview.content.includes("foreign developer and product teams"), "guide.json Overview must name foreign developer and product teams as the audience");
  assert(!overview.content.includes("cr-guide-keyword-map"), "guide.json Overview must not embed the China alternatives keyword map");
  assert(!overview.content.includes("CR_ALTERNATIVES_KEYWORD_MAP"), "guide.json Overview must not keep the keyword map marker");
  assert(overview.content.includes("FAQ"), "guide.json Overview must include FAQ content");
  assert(overview.content.includes("/alternatives/"), "guide.json Overview must link to the /alternatives/ index");
  assert(overview.content.includes("Level 1"), "guide.json Overview must keep Level 1 taxonomy framing");
  assert(!overview.content.includes("<img"), "guide.json Overview content must not render a logo image");
}

if (exists("build/data/full.json")) {
  const full = JSON.parse(read("build/data/full.json"));
  const alibabaCloud = full.items.find((item) => item.name === "Alibaba Cloud");
  const jpush = full.items.find((item) => item.name === "JPush");
  const fullSearchText = (name) => {
    const item = full.items.find((candidate) => candidate.name === name);
    return (item?.summary?.tags || []).join(" ");
  };
  assert(alibabaCloud, "full.json must include Alibaba Cloud");
  assert(alibabaCloud.annotations?.product_overview, "Alibaba Cloud details must include product_overview");
  assert(alibabaCloud.annotations?.developer_docs, "Alibaba Cloud details must include developer_docs");
  assert(alibabaCloud.annotations?.organization_overview, "Alibaba Cloud details must include organization_overview");
  assert(jpush?.annotations?.china_context === "JPush provides a China-market alternative to Firebase Cloud Messaging for mobile push notifications.", "JPush China context must be direct product copy");
  assert(fullSearchText("SendCloud").match(/Amazon SES/i), "full.json search index tags must let SES find SendCloud");
  assert(fullSearchText("Alibaba Cloud DirectMail").match(/Amazon SES/i), "full.json search index tags must let SES find Alibaba Cloud DirectMail");
  assert(fullSearchText("Tencent Cloud SES").match(/Amazon SES/i), "full.json search index tags must let SES find Tencent Cloud SES");
  assert(fullSearchText("JPush").match(/\bFCM\b/i), "full.json search index tags must let FCM find JPush");
}

if (exists("hosted_logos/alibaba-cloud.svg")) {
  const alibabaLogo = read("hosted_logos/alibaba-cloud.svg");
  assert(alibabaLogo.includes("Alibaba Cloud (member) logo"), "Alibaba Cloud logo must use the CNCF hosted logo asset");
  assert(!alibabaLogo.includes("China-ready"), "Alibaba Cloud logo must not use the placeholder Chinaready generated logo");
}

const items = collectLandscapeItems(landscape);
assert(items.length > 0, "landscape.yml must contain product entries");
for (const item of items) {
  assert(item.logo, `${item.name} must define a logo`);
  const logoPath = `hosted_logos/${item.logo}`;
  assert(exists(logoPath), `${item.name} logo file must exist: ${logoPath}`);
  const logoSource = read(logoPath);
  assert(!logoSource.includes("China-ready"), `${item.name} logo must not use the generated China-ready placeholder`);
  assert(!logoSource.includes("Open for contribution"), `${item.name} logo must not use the empty-category placeholder`);
  assert(!logoSource.includes("@import url("), `${item.name} logo must not import external fonts or styles`);
  for (const field of requiredProfileFields) {
    assert(
      item.annotations[field] && item.annotations[field] !== "not-collected",
      `${item.name} must define product profile field: ${field}`,
    );
  }
  assert(item.annotations.metadata_name === item.name, `${item.name} metadata_name must match the item name`);
  assert(item.annotations.primary_category === item.category, `${item.name} primary_category must match its main category`);
  assert(item.annotations.official_website === item.homepageUrl, `${item.name} official_website must match homepage_url`);
  assert(
    allowedAvailabilityStatus.has(item.annotations.availability_status),
    `${item.name} availability_status must be one of: ${[...allowedAvailabilityStatus].join(", ")}`,
  );
  assert(
    allowedGlobalAvailabilityInChina.has(item.annotations.global_availability_in_china),
    `${item.name} global_availability_in_china must be one of: ${[...allowedGlobalAvailabilityInChina].join(", ")}`,
  );
}

// AppInChina Technologies Hub P0/P1 cover set (high-traffic / high-demand pages).
{
  const hubPages = {
    "microsoft-teams": ["DingTalk", "Feishu", "WeCom", "Tencent Meeting"],
    docusign: ["eSignBao", "Fadada", "BestSign", "Tencent eSign"],
    webex: ["Tencent Meeting", "DingTalk", "Feishu", "WeCom"],
    qualtrics: ["WJX", "Jinshuju", "Tencent Questionnaire", "Credamo"],
    surveymonkey: ["WJX", "Jinshuju", "Tencent Questionnaire"],
    typeform: ["Jinshuju", "WJX", "Tencent Questionnaire"],
    wordpress: ["PageAdmin", "Baklib"],
    "dropbox-sign": ["eSignBao", "Fadada", "BestSign"],
    gumroad: ["Youzan Cloud", "Afdian"],
    shopify: ["Shoplazza", "Taoify", "ShopsSea"],
    "adobe-acrobat-sign": ["eSignBao", "Fadada", "BestSign"],
    n8n: ["Jijyun", "Jiandaoyun", "DingTalk Yida", "Qingflow"],
    "zoom-sdk": ["Tencent Meeting", "Feishu Meeting"],
  };
  for (const [slug, markers] of Object.entries(hubPages)) {
    const file = `build/alternatives/${slug}.html`;
    assert(exists(file), `${slug} must have a dedicated alternatives page`);
    const page = read(file);
    assert(page.includes("Mapped China-ready candidates"), `${slug} must show Mapped China-ready candidates`);
    assert(page.includes("Does ") && page.includes("work in China"), `${slug} must answer Does X work in China`);
    for (const marker of markers) {
      assert(page.includes(marker), `${slug} must list ${marker}`);
    }
  }
  const zoomPage = read("build/alternatives/zoom-sdk.html");
  assert(zoomPage.includes("<title>Does Zoom work in China? | Chinaready</title>"), "Zoom page title must target Does Zoom work in China");
  const redirects = read("build/_redirects");
  assert(redirects.includes("/alternatives/zoom /alternatives/zoom-sdk 301"), "zoom must redirect to zoom-sdk");
  assert(redirects.includes("/alternatives/hellosign /alternatives/dropbox-sign 301"), "hellosign must redirect to dropbox-sign");
  assert(redirects.includes("/alternatives/adobe-sign /alternatives/adobe-acrobat-sign 301"), "adobe-sign must redirect to adobe-acrobat-sign");
}

console.log("Chinaready brand verification passed");

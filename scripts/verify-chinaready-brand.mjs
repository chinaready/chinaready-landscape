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
const legacySourceBrandPattern = new RegExp(`${["A", "IC"].join("")}|${["App", "In", "China"].join("")}`, "i");
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
assert(!seoGeoScript.match(legacySourceBrandPattern), "SEO/GEO generator must not reference legacy competitor brand text");
assert(exists("research/global-services-gap-catalog.json"), "gap catalog for taxonomy-relevant global services is missing");
assert(!exists("research/aic-technologies-hub.json"), "legacy third-party research snapshot must be removed");
const gapCatalogSource = read("research/global-services-gap-catalog.json");
assert(!gapCatalogSource.match(legacySourceBrandPattern), "gap catalog must not contain legacy competitor brand text");
assert(!gapCatalogSource.includes("aic_"), "gap catalog must not keep legacy research field prefixes");
assert(exists("assets/chinaready-alternatives.css"), "alternatives page stylesheet is missing");
assert(exists("assets/chinaready-alternatives-search.js"), "alternatives shared search script is missing");
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
assert(detailsScript.includes("enhanceHeaderGlobalNav"), "detail extension must inject Global into the top navigation");
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
  assert(index.includes('<link rel="icon" href="/favicon.ico"'), "build/index.html must declare the ICO favicon");
  assert(index.includes('href="/favicon-96x96.png"'), "build/index.html must declare the 96x96 PNG favicon for search engines");
  assert(index.includes('<link rel="apple-touch-icon" href="/apple-touch-icon.png"'), "build/index.html must declare the apple-touch-icon PNG");
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
}

if (exists("build/robots.txt")) {
  const robots = read("build/robots.txt");
  assert(robots.includes("Sitemap: https://landscape.chinaready.co/sitemap.xml"), "robots.txt must declare the sitemap");
  assert(robots.includes("GPTBot"), "robots.txt must explicitly allow major AI crawlers");
}

if (exists("build/sitemap.xml")) {
  const sitemap = read("build/sitemap.xml");
  assert(sitemap.includes("https://landscape.chinaready.co/alternatives/"), "sitemap.xml must include the alternatives index");
  assert(sitemap.includes("https://landscape.chinaready.co/alternatives/firebase.html"), "sitemap.xml must include the Firebase alternatives page");
  assert(sitemap.includes("https://landscape.chinaready.co/alternatives/firebase-cloud-messaging.html"), "sitemap.xml must include the FCM alternatives page");
}

if (exists("build/llms.txt")) {
  const llms = read("build/llms.txt");
  assert(llms.includes("# Chinaready Landscape"), "llms.txt must identify the project");
  assert(llms.includes("https://chinaready.co"), "llms.txt must cite the Chinaready main site");
  assert(llms.includes("High-intent questions"), "llms.txt must expose high-intent question framing for GEO");
  assert(llms.includes("Does Firebase"), "llms.txt must include common Firebase availability questions");
}

if (exists("build/alternatives/index.html")) {
  const alternativesIndex = read("build/alternatives/index.html");
  assert(alternativesIndex.includes("China alternatives to global developer services"), "alternatives index must use a clear H1 topic");
  assert(alternativesIndex.includes("Firebase"), "alternatives index must include Firebase mappings");
  assert(alternativesIndex.includes("Availability in China"), "alternatives index must include Availability in China column");
  assert(alternativesIndex.includes("cr-alt-availability"), "alternatives index must style availability labels");
  assert(alternativesIndex.includes("Popular China alternative lookups"), "alternatives index must surface high-intent internal links");
  assert(alternativesIndex.includes("Firebase alternatives in China"), "alternatives index must link popular Firebase lookup");
  assert(alternativesIndex.includes("chinaready.co"), "alternatives index must route to the main site");
  assert(alternativesIndex.includes('"@type":"FAQPage"') || alternativesIndex.includes('"@type": "FAQPage"'), "alternatives index must include FAQPage JSON-LD");
  assert(alternativesIndex.includes('href="/favicon.ico"') && alternativesIndex.includes('href="/favicon-96x96.png"'), "alternatives index must declare the ICO and PNG favicons");
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
  assert(
    alternativesIndex.includes("googletagmanager.com/gtag/js?id=G-4BXLJXM1DY"),
    "alternatives index must include the Google tag",
  );
  assert(alternativesIndex.includes("gtag('config', 'G-4BXLJXM1DY')"), "alternatives index must configure GA measurement ID");
  const gapCatalog = JSON.parse(read("research/global-services-gap-catalog.json"));
  assert(gapCatalog.services?.length >= 100, "gap catalog must include the taxonomy-relevant unmapped global services");
  assert(alternativesIndex.includes("Dynatrace") || alternativesIndex.includes("BunnyCDN"), "alternatives index must include gap-catalog research services");
  assert(exists("build/alternatives/grpc.html"), "uncertain gap services such as gRPC must get a dedicated alternatives page");
  assert(exists("build/alternatives/dynatrace.html") || exists("build/alternatives/bunnycdn.html"), "researched gap services must get dedicated alternatives pages");
  const grpcPage = read("build/alternatives/grpc.html");
  assert(grpcPage.includes("Contact Chinaready"), "uncertain alternatives pages must invite readers to contact Chinaready");
  assert(grpcPage.includes("Availability in China"), "gap alternatives pages must show Availability in China");
}

if (exists("build/alternatives/firebase.html")) {
  const firebasePage = read("build/alternatives/firebase.html");
  assert(firebasePage.includes("Firebase alternatives in China"), "Firebase alternatives page must use an intent-matching H1");
  assert(firebasePage.includes("Does Firebase work in China"), "Firebase alternatives page must answer the primary GEO question");
  assert(firebasePage.includes("Quick answer"), "Firebase alternatives page must lead with a direct answer for CTR/GEO");
  assert(firebasePage.includes('"@type":"FAQPage"') || firebasePage.includes('"@type": "FAQPage"'), "Firebase alternatives page must include FAQPage JSON-LD");
  assert(firebasePage.includes("https://chinaready.co"), "Firebase alternatives page must link to the main site");
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
  assert(admobPage.includes("Chinese corporate entity in April 2006"), "AdMob page must keep shared Google China presence context");
  assert(admobPage.includes("Ad Monetization") || admobPage.includes("Users, Trust & Monetization"), "AdMob candidates must sit under Users, Trust & Monetization");
  assert(!admobPage.includes(">Umeng+</"), "AdMob page must not list Umeng+ as the primary monetization candidate");
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

assert(exists("build/assets/chinaready-alternatives.css"), "published alternatives stylesheet must exist");
assert(exists("assets/chinaready-mark.svg"), "Chinaready mark favicon source asset is missing");
assert(exists("assets/favicons/favicon.ico"), "pre-rendered favicon.ico asset is missing");
assert(exists("assets/favicons/favicon-96x96.png"), "pre-rendered 96x96 favicon asset is missing");
assert(exists("assets/favicons/apple-touch-icon.png"), "pre-rendered apple-touch-icon asset is missing");
if (exists("build")) {
  assert(exists("build/images/chinaready-mark.svg"), "published build must include /images/chinaready-mark.svg");
  assert(exists("build/favicon.ico"), "published build must serve a real /favicon.ico");
  assert(exists("build/favicon-96x96.png"), "published build must serve /favicon-96x96.png");
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
  assert(base.categories.length === 6, "base.json must expose all 6 top-level categories");
  assert(subcategoryCount === 21, "base.json must expose all 21 subcategories");
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

console.log("Chinaready brand verification passed");

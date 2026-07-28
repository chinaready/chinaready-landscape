/**
 * WebMCP tools for Chinaready Landscape (browser agent discovery).
 * Uses navigator.modelContext.registerTool when available.
 */
(function () {
  function getModelContext() {
    if (typeof navigator === "undefined") return null;
    return navigator.modelContext || navigator.modelContextTesting || null;
  }

  function register(tool) {
    const ctx = getModelContext();
    if (!ctx || typeof ctx.registerTool !== "function") return false;
    try {
      ctx.registerTool(tool);
      return true;
    } catch (error) {
      console.warn("[Chinaready WebMCP] registerTool failed", error);
      return false;
    }
  }

  function init() {
    register({
      name: "search_china_alternatives",
      description:
        "Search Chinaready Landscape China alternatives by global service name or keyword. Navigates to the alternatives index with a query.",
      inputSchema: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "Global service or keyword (e.g. Firebase, Stripe, Sentry)",
          },
        },
        required: ["query"],
      },
      async execute({ query }) {
        const q = String(query || "").trim();
        const url = q
          ? `/alternatives/?q=${encodeURIComponent(q)}`
          : "/alternatives/";
        window.location.assign(url);
        return { ok: true, navigatedTo: url };
      },
    });

    register({
      name: "open_china_alternative_page",
      description:
        "Open a China alternatives detail page for a global service slug (e.g. firebase, stripe, amazon-cloudfront).",
      inputSchema: {
        type: "object",
        properties: {
          slug: {
            type: "string",
            description: "URL slug under /alternatives/{slug}",
          },
        },
        required: ["slug"],
      },
      async execute({ slug }) {
        const normalized = String(slug || "")
          .trim()
          .toLowerCase()
          .replace(/^\/+/, "")
          .replace(/\.html$/, "");
        if (!normalized) return { ok: false, error: "slug is required" };
        const url = `/alternatives/${encodeURIComponent(normalized)}`;
        window.location.assign(url);
        return { ok: true, navigatedTo: url };
      },
    });

    register({
      name: "open_landscape_guide",
      description: "Open the Chinaready Landscape Guide taxonomy page.",
      inputSchema: { type: "object", properties: {} },
      async execute() {
        window.location.assign("/guide");
        return { ok: true, navigatedTo: "/guide" };
      },
    });

    register({
      name: "fetch_landscape_llms_overview",
      description:
        "Fetch the machine-readable llms.txt overview of Chinaready Landscape for agent citation.",
      inputSchema: { type: "object", properties: {} },
      async execute() {
        const response = await fetch("/llms.txt");
        if (!response.ok) {
          return { ok: false, error: `HTTP ${response.status}` };
        }
        const text = await response.text();
        return { ok: true, contentType: "text/plain", text };
      },
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();

(function () {
  const SEARCH_LIMIT = 12;
  let itemsPromise;

  function $(selector, root) {
    return (root || document).querySelector(selector);
  }

  function loadItems() {
    if (!itemsPromise) {
      itemsPromise = fetch("/data/full.json")
        .then((response) => {
          if (!response.ok) throw new Error(`Unable to load search index: ${response.status}`);
          return response.json();
        })
        .then((data) =>
          (data.items || []).filter((item) => item && item.name && item.name !== "No entries yet" && item.id),
        )
        .catch((error) => {
          console.warn("[Chinaready Landscape] Search index unavailable", error);
          return [];
        });
    }
    return itemsPromise;
  }

  function itemSearchText(item) {
    const tags = item.summary && Array.isArray(item.summary.tags) ? item.summary.tags.join(" ") : "";
    return `${item.name} ${item.category || ""} ${item.subcategory || ""} ${tags}`.toLowerCase();
  }

  function filterTable(query) {
    const table = $("#cr-alt-index-table");
    const meta = $("#cr-alt-search-meta");
    if (!table) return;
    const rows = Array.from(table.tBodies[0].rows);
    const normalized = query.trim().toLowerCase();
    let visible = 0;
    for (const row of rows) {
      const match = !normalized || row.textContent.toLowerCase().includes(normalized);
      row.hidden = !match;
      if (match) visible += 1;
    }
    if (!meta) return;
    if (!normalized) {
      meta.hidden = true;
      meta.textContent = "";
      return;
    }
    meta.hidden = false;
    meta.textContent = visible === 1 ? "1 matching service" : `${visible} matching services`;
  }

  function renderResults(root, matches, query) {
    const panel = $(".cr-site-search-results", root);
    if (!panel) return;
    panel.replaceChildren();
    if (!query.trim()) {
      panel.hidden = true;
      return;
    }
    if (matches.length === 0) {
      const empty = document.createElement("div");
      empty.className = "cr-site-search-empty";
      empty.textContent = "No matching items";
      panel.append(empty);
      panel.hidden = false;
      return;
    }

    for (const item of matches) {
      const link = document.createElement("a");
      link.className = "cr-site-search-result";
      link.href = `/?item=${encodeURIComponent(item.id)}`;
      link.setAttribute("role", "option");

      const name = document.createElement("span");
      name.className = "cr-site-search-result-name";
      name.textContent = item.name;

      const meta = document.createElement("span");
      meta.className = "cr-site-search-result-meta";
      meta.textContent = [item.category, item.subcategory].filter(Boolean).join(" / ");

      link.append(name, meta);
      panel.append(link);
    }
    panel.hidden = false;
  }

  async function applyQuery(root, query) {
    filterTable(query);
    const items = await loadItems();
    const normalized = query.trim().toLowerCase();
    const matches = !normalized
      ? []
      : items
          .filter((item) => itemSearchText(item).includes(normalized))
          .sort((a, b) => a.name.length - b.name.length || a.name.localeCompare(b.name))
          .slice(0, SEARCH_LIMIT);
    renderResults(root, matches, query);
  }

  function bindSearch(root) {
    const input = $(".cr-site-search-input", root);
    const placeholder = $(".cr-site-search-placeholder", root);
    const panel = $(".cr-site-search-results", root);
    if (!input) return;

    const syncPlaceholder = () => {
      if (!placeholder) return;
      placeholder.hidden = Boolean(input.value) || document.activeElement === input;
    };

    input.addEventListener("focus", syncPlaceholder);
    input.addEventListener("blur", () => {
      window.setTimeout(() => {
        syncPlaceholder();
        if (panel) panel.hidden = true;
      }, 150);
    });
    input.addEventListener("input", () => {
      syncPlaceholder();
      applyQuery(root, input.value);
    });
    input.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        input.blur();
        if (panel) panel.hidden = true;
      }
    });

    syncPlaceholder();
    const params = new URLSearchParams(window.location.search);
    const initialQuery = params.get("q");
    if (initialQuery) {
      input.value = initialQuery;
      syncPlaceholder();
      applyQuery(root, initialQuery);
    }
  }

  function bindSlashShortcut() {
    document.addEventListener("keydown", (event) => {
      if (event.key !== "/" || event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) {
        return;
      }
      const input = $(".cr-site-search-input");
      if (!input) return;
      event.preventDefault();
      input.focus();
    });
  }

  function bindStickyCtaHideOnFooter() {
    const sticky = $(".cr-alt-sticky-cta");
    const footer = $(".cr-site-footer");
    if (!sticky || !footer || typeof IntersectionObserver === "undefined") return;

    const setAway = (away) => {
      sticky.classList.toggle("is-away", away);
      sticky.setAttribute("aria-hidden", away ? "true" : "false");
      document.body.classList.toggle("cr-alt-sticky-cta-away", away);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        setAway(Boolean(entry && entry.isIntersecting));
      },
      { root: null, threshold: 0 },
    );
    observer.observe(footer);
  }

  function init() {
    const root = $("[data-cr-site-search]");
    if (root) {
      bindSearch(root);
      bindSlashShortcut();
    }
    bindStickyCtaHideOnFooter();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();

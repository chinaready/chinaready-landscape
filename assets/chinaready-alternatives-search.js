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

  // Facet state shared by the text query and the three facet groups
  // (availability / category / deployment). Grouped tbody headers hide when
  // every row under them is filtered out.
  const indexFilterState = { query: "", availability: "", category: "", deployment: "" };

  function facetBucket(raw) {
    if (raw === "available" || raw === "supported-terraform" || raw === "available-not-recommended") return "available";
    if (raw === "limited") return "limited";
    if (raw === "unavailable") return "unavailable";
    return "unknown";
  }

  function rowMatches(row, normalized) {
    const textMatch = !normalized || row.textContent.toLowerCase().includes(normalized);
    if (!textMatch) return false;
    if (indexFilterState.availability && facetBucket(row.dataset.availability || "") !== indexFilterState.availability) return false;
    if (indexFilterState.category && (row.dataset.category || "") !== indexFilterState.category) return false;
    if (indexFilterState.deployment && !(row.dataset.deployment || "").split(" ").includes(indexFilterState.deployment)) return false;
    return true;
  }

  function syncFacetUrl() {
    const params = new URLSearchParams(window.location.search);
    const keys = { q: indexFilterState.query, availability: indexFilterState.availability, category: indexFilterState.category, deployment: indexFilterState.deployment };
    for (const [key, value] of Object.entries(keys)) {
      if (value) params.set(key, value);
      else params.delete(key);
    }
    const qs = params.toString();
    window.history.replaceState(null, "", qs ? `?${qs}` : window.location.pathname);
  }

  function applyIndexFilters() {
    const table = $("#cr-alt-index-table");
    const meta = $("#cr-alt-search-meta");
    if (!table) return;
    const normalized = indexFilterState.query.trim().toLowerCase();
    let visible = 0;
    for (const tbody of Array.from(table.tBodies)) {
      let tbodyVisible = 0;
      for (const row of Array.from(tbody.rows)) {
        if (row.classList.contains("cr-alt-group-head")) continue;
        const match = rowMatches(row, normalized);
        row.hidden = !match;
        if (match) {
          visible += 1;
          tbodyVisible += 1;
        }
      }
      const head = tbody.querySelector(".cr-alt-group-head");
      if (head) head.hidden = tbodyVisible === 0;
    }
    syncFacetUrl();
    if (!meta) return;
    const anyFilter = normalized || indexFilterState.availability || indexFilterState.category || indexFilterState.deployment;
    if (!anyFilter) {
      meta.hidden = true;
      meta.textContent = "";
      return;
    }
    meta.hidden = false;
    meta.textContent =
      visible === 1
        ? "1 matching service"
        : visible === 0
          ? "No matching services — clear the search or a filter."
          : `${visible} matching services`;
  }

  function setFacetChips(facet, value) {
    const chips = Array.from(document.querySelectorAll(`[data-facet="${facet}"]`));
    for (const chip of chips) {
      const active = (chip.dataset.facetValue || "") === value;
      chip.classList.toggle("is-active", active);
      chip.setAttribute("aria-pressed", active ? "true" : "false");
    }
  }

  function bindFacetBar() {
    const chips = Array.from(document.querySelectorAll("[data-facet]"));
    if (!chips.length) return;
    chips.forEach((chip) => {
      chip.setAttribute("aria-pressed", chip.classList.contains("is-active") ? "true" : "false");
      chip.addEventListener("click", () => {
        const facet = chip.dataset.facet;
        const value = chip.dataset.facetValue || "";
        indexFilterState[facet] = value;
        setFacetChips(facet, value);
        applyIndexFilters();
      });
    });
    const params = new URLSearchParams(window.location.search);
    let restored = false;
    for (const facet of ["availability", "category", "deployment"]) {
      const initial = params.get(facet);
      if (initial) {
        indexFilterState[facet] = initial;
        setFacetChips(facet, initial);
        restored = true;
      }
    }
    if (restored) applyIndexFilters();
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
    indexFilterState.query = query;
    applyIndexFilters();
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
    bindFacetBar();
    bindStickyCtaHideOnFooter();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();

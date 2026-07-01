(function () {
  const missingValues = new Set(["", "-", "not-applicable", "not-collected", "to-be-supplied-by-contributor"]);
  let dataPromise;

  function hasValue(value) {
    return value !== undefined && value !== null && !missingValues.has(String(value).trim());
  }

  function fullDataUrl() {
    const basePath = window.baseDS && window.baseDS.base_path ? window.baseDS.base_path.replace(/\/$/, "") : "";
    return `${basePath}/data/full.json`;
  }

  function loadFullData() {
    if (!dataPromise) {
      dataPromise = fetch(fullDataUrl()).then((response) => {
        if (!response.ok) {
          throw new Error(`Unable to load full landscape data: ${response.status}`);
        }
        return response.json();
      });
    }
    return dataPromise;
  }

  function visible(element) {
    const style = window.getComputedStyle(element);
    const rect = element.getBoundingClientRect();
    return style.display !== "none" && style.visibility !== "hidden" && rect.width > 0 && rect.height > 0;
  }

  function candidateDialogs() {
    return Array.from(document.querySelectorAll('[role="dialog"], .modal, [class*="modal"], [class*="Modal"]')).filter(visible);
  }

  function candidateHoverCards() {
    return Array.from(document.querySelectorAll('[role="complementary"].popover.show')).filter(visible);
  }

  function currentItem(items, dialogs) {
    const itemId = new URLSearchParams(window.location.search).get("item");
    if (itemId) {
      const byId = items.find((item) => item.id === itemId);
      if (byId) return byId;
    }

    const dialogText = dialogs.map((dialog) => dialog.textContent || "").join("\n");
    return items
      .slice()
      .sort((a, b) => b.name.length - a.name.length)
      .find((item) => dialogText.includes(item.name));
  }

  function itemForText(items, source) {
    const sourceText = source.textContent || "";
    return items
      .slice()
      .sort((a, b) => b.name.length - a.name.length)
      .find((item) => sourceText.includes(item.name));
  }

  function text(value) {
    return document.createTextNode(String(value));
  }

  function linkOrText(value) {
    const raw = String(value);
    if (/^https?:\/\//i.test(raw)) {
      const anchor = document.createElement("a");
      anchor.href = raw;
      anchor.target = "_blank";
      anchor.rel = "noreferrer";
      anchor.textContent = raw;
      return anchor;
    }
    return text(raw);
  }

  function footerLink(label, href) {
    const item = document.createElement("li");
    const anchor = document.createElement("a");
    anchor.href = href;
    anchor.textContent = label;
    anchor.className = "cr-footer-link";
    if (/^https?:\/\//i.test(href)) {
      anchor.target = "_blank";
      anchor.rel = "noreferrer";
    }
    item.append(anchor);
    return item;
  }

  function footerColumn(title, links) {
    const column = document.createElement("section");
    column.className = "cr-footer-column";

    const heading = document.createElement("h2");
    heading.className = "cr-footer-heading";
    heading.textContent = title;

    const list = document.createElement("ul");
    list.className = "cr-footer-list";
    for (const { label, href } of links) {
      list.append(footerLink(label, href));
    }

    column.append(heading, list);
    return column;
  }

  function enhanceFooter() {
    const footer = document.querySelector('footer[role="contentinfo"]');
    if (!footer || footer.dataset.chinareadyFooter === "ready") return;

    const existingLogo = footer.querySelector("img");
    const logoSrc = existingLogo?.getAttribute("src") || "images/chinaready-logo-horizontal-white.svg";
    const poweredLink = footer.querySelector('a[href="https://github.com/cncf/landscape2"]')?.cloneNode(true);

    const inner = document.createElement("div");
    inner.className = "cr-footer-inner";

    const grid = document.createElement("div");
    grid.className = "cr-footer-grid";

    const brand = document.createElement("section");
    brand.className = "cr-footer-brand";

    const logoLink = document.createElement("a");
    logoLink.href = "https://chinaready.co";
    logoLink.className = "cr-footer-logo-link";
    logoLink.setAttribute("aria-label", "Chinaready home");

    const logo = document.createElement("img");
    logo.src = logoSrc;
    logo.alt = "Chinaready";
    logo.className = "cr-footer-logo";
    logoLink.append(logo);

    const description = document.createElement("p");
    description.className = "cr-footer-description";
    description.textContent =
      "Chinaready Landscape is an open-source landscape2 site for global software teams evaluating China-market developer services.";

    brand.append(logoLink, description);

    grid.append(
      brand,
      footerColumn("Chinaready", [
        { label: "Start Assessment", href: "https://chinaready.co/intake" },
        { label: "Book a Call", href: "https://chinaready.co/book-call" },
        { label: "All Services", href: "https://chinaready.co/services/" },
      ]),
      footerColumn("Stackbreak Lab", [
        { label: "Beijing View", href: "https://stackbreak.launchready.cn/demos/beijing-view.html" },
        { label: "Firebase", href: "https://stackbreak.launchready.cn/public/results/firebase.html" },
        {
          label: "Netlify",
          href: "https://stackbreak.launchready.cn/public/results/netlify.html#netlify-latency",
        },
        { label: "Vercel", href: "https://stackbreak.launchready.cn/public/results/vercel.html" },
      ]),
    );

    const bottom = document.createElement("div");
    bottom.className = "cr-footer-bottom";
    const powered = document.createElement("p");
    powered.className = "cr-footer-powered";
    powered.append("Powered by ");
    if (poweredLink) {
      powered.append(poweredLink);
    } else {
      powered.append("CNCF interactive landscapes generator.");
    }
    bottom.append(powered);

    inner.append(grid, bottom);
    footer.replaceChildren(inner);
    footer.dataset.chinareadyFooter = "ready";
  }

  function splitValues(value) {
    if (!hasValue(value)) return [];
    return String(value)
      .split(/\s*(?:,|;|\|)\s*/)
      .map((entry) => entry.trim())
      .filter(hasValue);
  }

  function titleCase(value) {
    return String(value)
      .toLowerCase()
      .replace(/\b([a-z0-9])([a-z0-9+\-]*)/g, (_, first, rest) => `${first.toUpperCase()}${rest}`);
  }

  function row(label, value) {
    if (!hasValue(value)) return null;
    const labelNode = document.createElement("div");
    labelNode.className = "cr-profile-label";
    labelNode.textContent = label;

    const valueNode = document.createElement("div");
    valueNode.className = "cr-profile-value";
    valueNode.append(linkOrText(value));

    return [labelNode, valueNode];
  }

  function summaryBlock(label, value) {
    if (!hasValue(value)) return null;

    const block = document.createElement("div");
    block.className = "cr-summary-block";

    const heading = document.createElement("h3");
    heading.className = "cr-summary-heading";
    heading.textContent = label;

    const content = document.createElement("p");
    content.className = "cr-profile-text";
    content.append(linkOrText(value));

    block.append(heading, content);
    return block;
  }

  function textBlock(value) {
    if (!hasValue(value)) return null;

    const block = document.createElement("div");
    block.className = "cr-summary-block";

    const content = document.createElement("p");
    content.className = "cr-profile-text";
    content.append(linkOrText(value));

    block.append(content);
    return block;
  }

  function badgeBlock(label, values) {
    const entries = Array.isArray(values) ? values.filter(hasValue) : splitValues(values);
    if (entries.length === 0) return null;

    const block = document.createElement("div");
    block.className = "cr-summary-block";

    const heading = document.createElement("h3");
    heading.className = "cr-summary-heading";
    heading.textContent = label;

    const badges = document.createElement("div");
    badges.className = "cr-profile-badges";
    for (const entry of entries) {
      const badge = document.createElement("span");
      badge.className = "cr-profile-badge";
      badge.textContent = String(entry);
      badges.append(badge);
    }

    block.append(heading, badges);
    return block;
  }

  function compactBadgeBlock(values) {
    const entries = Array.isArray(values) ? values.filter(hasValue) : splitValues(values);
    if (entries.length === 0) return null;

    const block = document.createElement("div");
    block.className = "cr-hover-block";

    const row = document.createElement("div");
    row.className = "cr-hover-row";

    const badges = document.createElement("div");
    badges.className = "cr-hover-badges";
    for (const entry of entries) {
      const badge = document.createElement("span");
      badge.className = "cr-profile-badge cr-hover-badge";
      badge.textContent = titleCase(entry);
      badges.append(badge);
    }

    row.append(badges);
    block.append(row);
    return block;
  }

  function moveHoverLinksIntoTagRow(card, alternatives) {
    const row = alternatives.querySelector(".cr-hover-row");
    const extra = card.querySelector('[class*="_extra_"]');
    if (!row || !extra || row.contains(extra)) return;

    extra.classList.add("cr-hover-extra");
    row.append(extra);
  }

  function linkBlock(label, links) {
    const visibleLinks = links.filter(({ value }) => hasValue(value));
    if (visibleLinks.length === 0) return null;

    const block = document.createElement("div");
    block.className = "cr-summary-block";

    const list = document.createElement("div");
    list.className = "cr-profile-links";
    for (const { label: linkLabel, value } of visibleLinks) {
      const item = document.createElement("div");
      item.className = "cr-profile-link";
      const strong = document.createElement("strong");
      strong.textContent = linkLabel;
      const content = document.createElement("span");
      content.append(linkOrText(value));
      item.append(strong, content);
      list.append(item);
    }

    if (hasValue(label)) {
      const heading = document.createElement("h3");
      heading.className = "cr-summary-heading";
      heading.textContent = label;
      block.append(heading);
    }
    block.append(list);
    return block;
  }

  function section(title, children) {
    const visibleChildren = children.filter(Boolean);
    if (visibleChildren.length === 0) return null;

    const fieldset = document.createElement("fieldset");
    fieldset.className = "cr-profile-section";

    const legend = document.createElement("legend");
    legend.textContent = title;
    fieldset.append(legend);

    for (const child of visibleChildren) {
      fieldset.append(child);
    }
    return fieldset;
  }

  function profileFor(item) {
    const annotations = item.annotations || {};
    const wrapper = document.createElement("div");
    wrapper.className = "cr-landscape-profile";
    wrapper.dataset.chinareadyProfileFor = item.id;

    const alternativeBadges = splitValues(annotations.global_alternatives || annotations.global_analogs);
    const metadataBadges = [
      annotations.replacement_fit,
      annotations.vendor_type,
      annotations.evidence_level,
    ];

    const sections = [
      section("Summary", [
        textBlock(annotations.product_overview || item.description),
        textBlock(annotations.china_context),
        badgeBlock("GLOBAL ALTERNATIVES", alternativeBadges),
      ]),
      section("Organization", [
        textBlock(annotations.organization_overview || annotations.organization),
        linkBlock("", [
          { label: "Official Website", value: annotations.official_website || item.homepage_url || item.website },
          { label: "Developer Docs", value: annotations.developer_docs },
          { label: "GitHub", value: annotations.github },
          { label: "Social Media", value: annotations.social_media },
        ]),
        badgeBlock("TAGS", metadataBadges),
      ]),
    ].filter(Boolean);

    for (const profileSection of sections) {
      wrapper.append(profileSection);
    }
    return wrapper;
  }

  function removeNativeSummary(root) {
    const nativeSections = Array.from(root.querySelectorAll(".position-relative.border")).filter((section) => {
      if (section.closest(".cr-landscape-profile")) return false;
      if (section.id === "item-view" || section.classList.contains("modal-content")) return false;
      const sectionText = (section.textContent || "").toLowerCase();
      return sectionText.includes("summary") && sectionText.includes("tags");
    });

    for (const section of nativeSections) {
      section.classList.add("cr-native-summary-hidden");
      section.setAttribute("aria-hidden", "true");
    }
  }

  function mountContainer(dialog, item) {
    const selectors = [".modal-body", "[class*=\"modalBody\"]", ".modal-content", "[class*=\"modalContent\"]"];
    for (const selector of selectors) {
      const containers = Array.from(dialog.querySelectorAll(selector)).filter((element) => {
        const rect = element.getBoundingClientRect();
        const style = window.getComputedStyle(element);
        return rect.width > 0 &&
          rect.height > 0 &&
          style.display !== "none" &&
          style.visibility !== "hidden" &&
          (element.textContent || "").includes(item.name);
      });
      if (containers.length > 0) {
        return containers[0];
      }
    }
    return dialog;
  }

  function appendProfile(dialog, item) {
    dialog.classList.add("cr-detail-dialog");
    removeNativeSummary(document);
    removeNativeSummary(dialog);
    const existing = dialog.querySelector(`[data-chinaready-profile-for="${CSS.escape(item.id)}"]`);
    const mount = mountContainer(dialog, item);
    if (existing) {
      if (!mount.contains(existing)) {
        existing.remove();
        mount.append(profileFor(item));
      }
      return;
    }
    mount.append(profileFor(item));
  }

  function enhanceHoverCard(card, item) {
    const annotations = item.annotations || {};
    card.classList.add("cr-hover-card");
    const itemInfo = card.querySelector('[class*="_itemInfo_"]');
    const title = itemInfo && itemInfo.querySelector('[class*="_title_"]');
    const description = card.querySelector('[class*="_description_"]');
    if (!itemInfo || !title || !description) return;

    const existingUseCase = itemInfo.querySelector(".cr-hover-use-case");
    if (!existingUseCase) {
      const useCase = document.createElement("div");
      useCase.className = "cr-hover-use-case";

      const content = document.createElement("div");
      content.className = "cr-hover-text";
      content.textContent = annotations.product_overview || item.description || "";

      useCase.append(content);
      title.insertAdjacentElement("afterend", useCase);
    }

    const alternatives = compactBadgeBlock(annotations.global_alternatives || annotations.global_analogs);
    if (alternatives) {
      alternatives.dataset.chinareadyHoverAlternativesFor = item.id;
      description.replaceWith(alternatives);
      moveHoverLinksIntoTagRow(card, alternatives);
    }
  }

  async function refresh() {
    enhanceFooter();

    const dialogs = candidateDialogs();
    const hoverCards = candidateHoverCards();
    if (dialogs.length > 0) {
      removeNativeSummary(document);
      for (const dialog of dialogs) {
        removeNativeSummary(dialog);
      }
    }
    if (dialogs.length === 0 && hoverCards.length === 0) return;

    try {
      const data = await loadFullData();
      const items = data.items || [];
      if (dialogs.length > 0) {
        const item = currentItem(items, dialogs);
        if (item && item.annotations) {
          const dialog = dialogs.find((candidate) => (candidate.textContent || "").includes(item.name)) || dialogs[0];
          appendProfile(dialog, item);
        }
      }
      for (const hoverCard of hoverCards) {
        const item = itemForText(items, hoverCard);
        if (item && item.annotations) {
          enhanceHoverCard(hoverCard, item);
        }
      }
    } catch (error) {
      console.warn("[Chinaready Landscape] Unable to render item profile fields", error);
    }
  }

  const observer = new MutationObserver(() => {
    window.requestAnimationFrame(refresh);
  });

  observer.observe(document.documentElement, { childList: true, subtree: true });
  window.addEventListener("popstate", refresh);
  window.addEventListener("hashchange", refresh);
  window.addEventListener("click", () => window.setTimeout(refresh, 0), true);
  window.addEventListener("load", refresh);
  window.requestAnimationFrame(enhanceFooter);
})();

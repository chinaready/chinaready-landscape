---
name: gsc-digest
description: >-
  Parse Google Search Console Page indexing (Coverage) exports that include
  landscape.chinaready.co URLs, triage issues, and fix this landscape repo.
  Use when the user asks for GSC indexing digest, 索引摘要, Coverage reasons,
  landscape indexing, or similar.
---

# GSC Digest (China Landscape)

## When to use

User wants indexing triage for URLs on **landscape.chinaready.co** (same GSC property as chinaready.co — exports live under the shared Coverage folder).

## Prerequisite CLI

This repo does **not** vendor the parser. Run the shared CLI from mvp-1:

```bash
node /Users/martinliu/code/mvp-1/scripts/gsc-digest/cli.mjs --dir /Users/martinliu/Documents/Chinaready/ga-digest/
```

If that path is missing, tell the user to open mvp-1 or sync `scripts/gsc-digest` from there. Ops notes: `.cursor/skills/gsc-digest/README.md`.

## Do this

1. Run the command above from any cwd (absolute paths).
2. Show CLI **stdout** unchanged (do not invent reasons, counts, or URLs).
3. Filter commentary to **`https://landscape.chinaready.co/...`** rows first (redirects, Discovered/Crawled alternatives, soft-404s). Ignore chinaready.co marketing/`wb` URLs unless the user asks — those belong in mvp-1 `site/`.
4. Short Chinese commentary: landscape-relevant Fixable vs intentional redirects vs Google systems.

## Fix loop (batch then deploy)

1. Batch-fix actionable **landscape** issues in this repo (`landscape.yml`, `guide.yml`, redirects/build scripts, item pages under `build/` sources — follow existing landscape conventions).
2. Do **not** deploy mid-batch unless the user asks. When ready: commit → `git push origin main` → CI/Pages (per this repo’s normal ship path).
3. After go-live, user runs GSC **Validate fix** and pastes results. Append confirmed rules to `.cursor/rules/landscape-seo-indexing.mdc`.

Intentional `.html` aliases / redirects that correctly canonicalize should **not** be deleted just to shrink GSC “Page with redirect” counts.

## Failures

- CLI non-zero → missing Coverage export in `--dir`; see `.cursor/skills/gsc-digest/README.md`.
- Never fabricate URL lists.
- Do not promise Validate clears Discovered/Crawled queues.

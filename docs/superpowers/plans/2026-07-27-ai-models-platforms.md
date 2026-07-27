# AI Models & Platforms Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a seventh Level-1 category `AI Models & Platforms` with four populated Level-2 subcategories and 23 China-ready AI developer-stack items, plus matching Guide copy.

**Architecture:** Extend CNCF landscape2 data only—no landscape2 fork. Append one Level-1 block to `landscape.yml`, add SVG wordmark/logo files under `hosted_logos/`, mirror taxonomy and “Typical global services” copy in `guide.yml`. Alternatives pages for OpenAI / Anthropic / Pinecone / etc. are generated automatically from `global_analogs` during `npm run build` via `scripts/seo-geo.mjs`.

**Tech Stack:** YAML (`landscape.yml`, `guide.yml`), SVG logos, Node 22+ (`npm run validate|build|verify`), landscape2 CLI via `scripts/landscape2.mjs`.

## Global Constraints

- Category role: developer alternative catalog for mainland China (not chip/robotics industry map).
- Level-1 name exactly: `AI Models & Platforms`.
- Level-2 names exactly: `Foundation Models & LLM APIs`; `Embeddings & Reranking`; `Vector Databases & Retrieval`; `Agent / RAG Frameworks`.
- Append as **7th** Level-1 after `Growth, Content & Experience` (do not reshuffle existing categories).
- Item display names must match the approved shortlists in `docs/superpowers/specs/2026-07-27-ai-models-platforms-design.md`.
- `vendor_type` only from existing enums: China cloud managed → `china-cloud`; China SaaS / China-origin OSS with product homepage → `china-saas`.
- No new featured filter chips; no LangChain/LlamaIndex/OpenSearch items; no Ascend/robotics items.
- Every item needs the full `extra.annotations` block used by existing entries (`global_analogs`, `replacement_fit`, `china_context`, `vendor_type`, `evidence_level`, `availability_status`, `global_availability_in_china`, plus profile metadata fields).
- Logos: SVG under `hosted_logos/`, prefer 320×180 white canvas + brand mark or Chinaready-navy wordmark (`#0C1E3E`); no gradients; no red except brand-true logo colors.
- Guide “Typical global services” may link to `/alternatives/<slug>.html` only for analogs that exist after build (derived from landscape `global_analogs`); otherwise plain text.
- Ship rule for this repo: when implementation is done, commit, push `main`, deploy; reply with a short acceptance checklist + URLs.
- `docs/` is gitignored; plans/specs already committed with `git add -f` when needed.

## File map

| File | Responsibility |
|---|---|
| `landscape.yml` | New L1 + 4 L2 + 23 items |
| `hosted_logos/*.svg` | One logo per item (kebab-case filename matching `logo:` field) |
| `guide.yml` | Overview table row + full Guide category/subcategory copy |
| `scripts/verify-chinaready-brand.mjs` | Optional assertions that new L1 appears in guide Overview table / built output |
| `docs/superpowers/specs/2026-07-27-ai-models-platforms-design.md` | Source of truth for names (read-only during impl) |

## Item → logo filename map (canonical)

| Item name | `logo` |
|---|---|
| DeepSeek | `deepseek.svg` |
| Moonshot AI (Kimi) | `moonshot-ai-kimi.svg` |
| Qwen (Alibaba Cloud Model Studio) | `qwen-alibaba-cloud-model-studio.svg` |
| Zhipu AI (GLM) | `zhipu-ai-glm.svg` |
| Baichuan | `baichuan.svg` |
| MiniMax | `minimax.svg` |
| Volcengine Ark (Doubao) | `volcengine-ark-doubao.svg` |
| BGE (BAAI FlagEmbedding) | `bge-baai-flagembedding.svg` |
| Qwen Embeddings (DashScope) | `qwen-embeddings-dashscope.svg` |
| Zhipu Embeddings | `zhipu-embeddings.svg` |
| BCE (NetEase Youdao) | `bce-netease-youdao.svg` |
| GTE (Alibaba) | `gte-alibaba.svg` |
| Baidu Qianfan Embeddings | `baidu-qianfan-embeddings.svg` |
| Milvus | `milvus.svg` |
| Zilliz Cloud | `zilliz-cloud.svg` |
| Tencent Cloud VectorDB | `tencent-cloud-vectordb.svg` |
| Alibaba Cloud DashVector | `alibaba-cloud-dashvector.svg` |
| Baidu VectorDB | `baidu-vectordb.svg` |
| Dify | `dify.svg` |
| RAGFlow | `ragflow.svg` |
| FastGPT | `fastgpt.svg` |
| Coze | `coze.svg` |
| MaxKB | `maxkb.svg` |

## Annotation defaults (apply unless a step overrides)

- `evidence_level`: `medium` for first ship (raise to `high` only when homepage + docs were opened and match the description).
- `availability_status`: `generally-available`.
- `global_availability_in_china` for OpenAI / Anthropic / Gemini / Azure OpenAI / Pinecone / Cohere / Voyage / OpenAI GPTs class analogs: `unavailable` (or `limited` if the note truly describes constrained access—not drop-in).
- `github` / `social_media`: `"to-be-supplied-by-contributor"` unless a stable official URL is known.
- `primary_category`: always `"AI Models & Platforms"`.
- `metadata_name`: same as `item.name`.
- `product_overview`: same sentence as `description`.
- `global_alternatives`: same comma list as `global_analogs`.
- `alternative_to`: `China-market alternative or deployment route for: <global_analogs>.`

## YAML item template

Use this skeleton for every item (fill fields per task tables):

```yaml
          - item:
            name: EXAMPLE
            homepage_url: https://example.com/
            logo: example.svg
            description: One sentence English product description for foreign developers.
            extra:
              annotations:
                global_analogs: OpenAI, Anthropic
                replacement_fit: direct
                china_context: One or two sentences on mainland China relevance for global teams.
                vendor_type: china-saas
                evidence_level: medium
                availability_status: generally-available
                global_availability_in_china: unavailable
                metadata_name: "EXAMPLE"
                primary_category: "AI Models & Platforms"
                official_website: "https://example.com/"
                github: "to-be-supplied-by-contributor"
                social_media: "to-be-supplied-by-contributor"
                product_overview: "One sentence English product description for foreign developers."
                alternative_to: "China-market alternative or deployment route for: OpenAI, Anthropic."
                global_alternatives: "OpenAI, Anthropic"
                organization: "Org Name"
                organization_overview: "One sentence about the organization."
                developer_docs: "https://example.com/docs"
```

## Wordmark SVG template

When an official SVG mark is not available, create a Chinaready-style wordmark:

```svg
<svg xmlns="http://www.w3.org/2000/svg" width="320" height="180" viewBox="0 0 320 180" role="img" aria-labelledby="title">
  <title>ITEM_NAME</title>
  <rect width="320" height="180" fill="#ffffff"/>
  <text x="160" y="100" text-anchor="middle" fill="#0C1E3E" font-family="Arial, Helvetica, sans-serif" font-size="28" font-weight="700">ITEM_NAME</text>
</svg>
```

Prefer a real brand mark when it fits the white 320×180 frame without gradients.

---

### Task 1: Skeleton Level-1 / Level-2 in `landscape.yml`

**Files:**
- Modify: `landscape.yml` (append after final `Growth, Content & Experience` category, after the Web Fonts item ends ~line 1381)
- Test: `npm run validate:data`

**Interfaces:**
- Consumes: existing `landscape:` root list
- Produces: empty-ready category shell with four `subcategories` and `items: []` (or omit items until Task 2—if landscape2 rejects empty items arrays, add a temporary single placeholder item and remove it in Task 2)

- [ ] **Step 1: Append category shell**

Append exactly:

```yaml

  - category:
    name: AI Models & Platforms
    subcategories:
      - subcategory:
        name: Foundation Models & LLM APIs
        items: []
      - subcategory:
        name: Embeddings & Reranking
        items: []
      - subcategory:
        name: Vector Databases & Retrieval
        items: []
      - subcategory:
        name: Agent / RAG Frameworks
        items: []
```

If `npm run validate:data` fails on empty `items`, replace each `items: []` with no `items` key only if schema allows; otherwise leave shell and immediately proceed to Task 2 before committing Task 1 alone.

- [ ] **Step 2: Validate data**

Run: `npm run validate:data`  
Expected: exit 0 (or a clear schema error about empty items—then merge Task 2 foundation items before commit).

- [ ] **Step 3: Commit**

```bash
git add landscape.yml
git commit -m "$(cat <<'EOF'
Add AI Models & Platforms category skeleton to the landscape.

EOF
)"
```

---

### Task 2: Foundation Models & LLM APIs (7 items + logos)

**Files:**
- Modify: `landscape.yml` → subcategory `Foundation Models & LLM APIs`
- Create: `hosted_logos/deepseek.svg`, `moonshot-ai-kimi.svg`, `qwen-alibaba-cloud-model-studio.svg`, `zhipu-ai-glm.svg`, `baichuan.svg`, `minimax.svg`, `volcengine-ark-doubao.svg`
- Test: `npm run validate:data`

**Interfaces:**
- Consumes: Task 1 category shell
- Produces: 7 items listed below

| name | homepage_url | vendor_type | replacement_fit | global_analogs | organization | developer_docs (suggested) |
|---|---|---|---|---|---|---|
| DeepSeek | https://www.deepseek.com/ | china-saas | direct | OpenAI, Anthropic | DeepSeek | https://api-docs.deepseek.com/ |
| Moonshot AI (Kimi) | https://www.moonshot.cn/ | china-saas | direct | OpenAI, Anthropic | Moonshot AI | https://platform.moonshot.cn/docs |
| Qwen (Alibaba Cloud Model Studio) | https://www.alibabacloud.com/product/model-studio | china-cloud | direct | OpenAI, Google Gemini, Azure OpenAI | Alibaba Cloud | https://www.alibabacloud.com/help/en/model-studio/ |
| Zhipu AI (GLM) | https://www.zhipuai.cn/ | china-saas | direct | OpenAI, Anthropic | Zhipu AI | https://open.bigmodel.cn/dev/api |
| Baichuan | https://www.baichuan-ai.com/ | china-saas | direct | OpenAI | Baichuan Intelligence | https://platform.baichuan-ai.com/ |
| MiniMax | https://www.minimaxi.com/ | china-saas | direct | OpenAI | MiniMax | https://platform.minimaxi.com/document/guides/introduction |
| Volcengine Ark (Doubao) | https://www.volcengine.com/product/ark | china-cloud | partial | OpenAI, Azure OpenAI | ByteDance / Volcengine | https://www.volcengine.com/docs/82379 |

- [ ] **Step 1: Create the seven SVG logos** using the wordmark template (or official marks). Filenames must match the logo map.

- [ ] **Step 2: Add the seven YAML items** under `Foundation Models & LLM APIs` using the item template. Example for DeepSeek:

```yaml
          - item:
            name: DeepSeek
            homepage_url: https://www.deepseek.com/
            logo: deepseek.svg
            description: DeepSeek provides open-weight and API-accessible foundation models optimized for reasoning and coding with competitive inference cost.
            extra:
              annotations:
                global_analogs: OpenAI, Anthropic
                replacement_fit: direct
                china_context: DeepSeek offers mainland-reachable APIs and widely used open weights as a practical alternative when OpenAI or Anthropic are unavailable for China production stacks.
                vendor_type: china-saas
                evidence_level: medium
                availability_status: generally-available
                global_availability_in_china: unavailable
                metadata_name: "DeepSeek"
                primary_category: "AI Models & Platforms"
                official_website: "https://www.deepseek.com/"
                github: "to-be-supplied-by-contributor"
                social_media: "to-be-supplied-by-contributor"
                product_overview: "DeepSeek provides open-weight and API-accessible foundation models optimized for reasoning and coding with competitive inference cost."
                alternative_to: "China-market alternative or deployment route for: OpenAI, Anthropic."
                global_alternatives: "OpenAI, Anthropic"
                organization: "DeepSeek"
                organization_overview: "DeepSeek builds efficient foundation models and developer APIs with a strong open-weight strategy."
                developer_docs: "https://api-docs.deepseek.com/"
```

Repeat for the other six rows with accurate one-sentence descriptions (long-context for Kimi; Model Studio/DashScope for Qwen; bilingual enterprise for Zhipu; enterprise private deploy for Baichuan; multimodal/API for MiniMax; Volcengine-hosted Doubao for Ark).

- [ ] **Step 3: Validate**

Run: `npm run validate:data`  
Expected: exit 0.

- [ ] **Step 4: Commit**

```bash
git add landscape.yml hosted_logos/deepseek.svg hosted_logos/moonshot-ai-kimi.svg hosted_logos/qwen-alibaba-cloud-model-studio.svg hosted_logos/zhipu-ai-glm.svg hosted_logos/baichuan.svg hosted_logos/minimax.svg hosted_logos/volcengine-ark-doubao.svg
git commit -m "$(cat <<'EOF'
Add China foundation model API entries under AI Models & Platforms.

EOF
)"
```

---

### Task 3: Embeddings & Reranking (6 items + logos)

**Files:**
- Modify: `landscape.yml` → `Embeddings & Reranking`
- Create: logos for BGE, Qwen Embeddings, Zhipu Embeddings, BCE, GTE, Baidu Qianfan Embeddings
- Test: `npm run validate:data`

| name | homepage_url | vendor_type | replacement_fit | global_analogs | organization |
|---|---|---|---|---|---|
| BGE (BAAI FlagEmbedding) | https://github.com/FlagOpen/FlagEmbedding | china-saas | partial | OpenAI Embeddings, Sentence-BERT | BAAI |
| Qwen Embeddings (DashScope) | https://help.aliyun.com/zh/model-studio/developer-reference/text-embedding-quick-start-1 | china-cloud | direct | OpenAI Embeddings, Voyage | Alibaba Cloud |
| Zhipu Embeddings | https://open.bigmodel.cn/dev/api#embedding | china-saas | direct | OpenAI Embeddings, Cohere | Zhipu AI |
| BCE (NetEase Youdao) | https://github.com/netease-youdao/BCEmbedding | china-saas | partial | OpenAI Embeddings, Cohere Rerank | NetEase Youdao |
| GTE (Alibaba) | https://huggingface.co/Alibaba-NLP | china-saas | partial | OpenAI Embeddings, Voyage | Alibaba |
| Baidu Qianfan Embeddings | https://cloud.baidu.com/product/wenxinworkshop | china-cloud | direct | OpenAI Embeddings | Baidu Cloud |

- [ ] **Step 1: Create six SVG logos** (filenames from logo map).

- [ ] **Step 2: Add six YAML items** with `china_context` explaining RAG/retrieval use in mainland stacks. For OSS GitHub homepages, keep `vendor_type: china-saas` per spec rule.

- [ ] **Step 3: Validate** — `npm run validate:data` → exit 0.

- [ ] **Step 4: Commit**

```bash
git add landscape.yml hosted_logos/bge-baai-flagembedding.svg hosted_logos/qwen-embeddings-dashscope.svg hosted_logos/zhipu-embeddings.svg hosted_logos/bce-netease-youdao.svg hosted_logos/gte-alibaba.svg hosted_logos/baidu-qianfan-embeddings.svg
git commit -m "$(cat <<'EOF'
Add China embeddings and reranking options for RAG stacks.

EOF
)"
```

---

### Task 4: Vector Databases & Retrieval (5 items + logos)

**Files:**
- Modify: `landscape.yml` → `Vector Databases & Retrieval`
- Create: five logos
- Test: `npm run validate:data`

| name | homepage_url | vendor_type | replacement_fit | global_analogs | organization |
|---|---|---|---|---|---|
| Milvus | https://milvus.io/ | china-saas | direct | Pinecone, Weaviate, Qdrant | Zilliz / LF AI |
| Zilliz Cloud | https://zilliz.com/ | china-saas | direct | Pinecone, Weaviate Cloud | Zilliz |
| Tencent Cloud VectorDB | https://cloud.tencent.com/product/vdb | china-cloud | direct | Pinecone | Tencent Cloud |
| Alibaba Cloud DashVector | https://www.aliyun.com/product/dashvector | china-cloud | direct | Pinecone, Amazon OpenSearch Serverless | Alibaba Cloud |
| Baidu VectorDB | https://cloud.baidu.com/product/vdb.html | china-cloud | direct | Pinecone | Baidu Cloud |

Do **not** add OpenSearch.

- [ ] **Step 1: Create five SVG logos.**

- [ ] **Step 2: Add five YAML items.** Use `global_availability_in_china: unavailable` for Pinecone-class analogs.

- [ ] **Step 3: Validate** — `npm run validate:data` → exit 0.

- [ ] **Step 4: Commit**

```bash
git add landscape.yml hosted_logos/milvus.svg hosted_logos/zilliz-cloud.svg hosted_logos/tencent-cloud-vectordb.svg hosted_logos/alibaba-cloud-dashvector.svg hosted_logos/baidu-vectordb.svg
git commit -m "$(cat <<'EOF'
Add China vector database options as Pinecone-class alternatives.

EOF
)"
```

---

### Task 5: Agent / RAG Frameworks (5 items + logos)

**Files:**
- Modify: `landscape.yml` → `Agent / RAG Frameworks`
- Create: five logos
- Test: `npm run validate:data`

| name | homepage_url | vendor_type | replacement_fit | global_analogs | organization |
|---|---|---|---|---|---|
| Dify | https://dify.ai/ | china-saas | direct | LangChain, LlamaIndex, OpenAI GPTs | LangGenius / Dify |
| RAGFlow | https://ragflow.io/ | china-saas | partial | LlamaIndex, LangChain | InfiniFlow |
| FastGPT | https://fastgpt.in/ | china-saas | partial | OpenAI GPTs, LangChain | Labring |
| Coze | https://www.coze.cn/ | china-saas | partial | OpenAI GPTs, Botpress | ByteDance |
| MaxKB | https://maxkb.cn/ | china-saas | partial | LangChain, OpenAI GPTs | 1Panel / FIT2CLOUD |

Do **not** add LangChain or LlamaIndex as items. They may appear only in `global_analogs`.

- [ ] **Step 1: Create five SVG logos.**

- [ ] **Step 2: Add five YAML items.** Note Coze China homepage `coze.cn` (not only the international coze.com).

- [ ] **Step 3: Validate** — `npm run validate:data` → exit 0.

- [ ] **Step 4: Commit**

```bash
git add landscape.yml hosted_logos/dify.svg hosted_logos/ragflow.svg hosted_logos/fastgpt.svg hosted_logos/coze.svg hosted_logos/maxkb.svg
git commit -m "$(cat <<'EOF'
Add China agent and RAG application platforms.

EOF
)"
```

---

### Task 6: Guide Overview table + AI category copy

**Files:**
- Modify: `guide.yml` (Overview `<table>` tbody + new category block after Growth)
- Test: `npm run validate:guide`

**Interfaces:**
- Consumes: landscape items so build can create `/alternatives/openai.html`, `anthropic.html`, `pinecone.html`, etc.
- Produces: Guide taxonomy docs matching landscape names exactly

- [ ] **Step 1: Add Overview table row** inside the existing Level 1 / Level 2 table (after Growth row):

```html
          <tr>
            <td>AI Models & Platforms</td>
            <td>Foundation Models & LLM APIs; Embeddings & Reranking; Vector Databases & Retrieval; Agent / RAG Frameworks</td>
          </tr>
```

- [ ] **Step 2: Optionally extend Overview “Common global stack translations”** with one bullet:

```markdown
      - OpenAI, Anthropic, Gemini, and Pinecone-style AI stacks often need China-reachable model APIs, embeddings, vector databases, and agent/RAG platforms instead of a global default.
```

- [ ] **Step 3: Append Guide category** after `Growth, Content & Experience`:

```yaml
  - category: "AI Models & Platforms"
    content: |
      AI Models & Platforms maps China-reachable generative AI developer services for global teams adapting LLM apps for mainland China. Use this category for foundation model APIs, embeddings/reranking, vector retrieval, and agent/RAG application platforms. Chinaready deliberately excludes AI chips, training clusters, and embodied robotics from this taxonomy—those are industry layers, not drop-in developer-service alternatives for app stacks.
    subcategories:
      - subcategory: "Foundation Models & LLM APIs"
        content: |
          Use this subcategory for mainland-reachable foundation model APIs and Model-as-a-Service consoles that can substitute chat/completions-style workloads.

          Typical global services: OpenAI, Anthropic Claude, Google Gemini, Azure OpenAI.
      - subcategory: "Embeddings & Reranking"
        content: |
          Use this subcategory for embedding and reranking models or APIs used in semantic search and RAG pipelines.

          Typical global services: OpenAI Embeddings, Cohere, Voyage, Sentence-BERT.
      - subcategory: "Vector Databases & Retrieval"
        content: |
          Use this subcategory for vector databases and managed vector retrieval services used to store and query embeddings.

          Typical global services: Pinecone, Weaviate, Qdrant.
      - subcategory: "Agent / RAG Frameworks"
        content: |
          Use this subcategory for China-origin agent builders and RAG application platforms. Global orchestration libraries may appear as analogs in profiles but are not listed as landscape items here.

          Typical global services: OpenAI GPTs, LangChain, LlamaIndex, Botpress.
```

After the first full `npm run build`, if alternatives pages exist for these names, upgrade the Typical global services lines to markdown links (example):

```markdown
Typical global services: [OpenAI](/alternatives/openai.html), [Anthropic](/alternatives/anthropic.html), [Google Gemini](/alternatives/google-gemini.html), [Azure OpenAI](/alternatives/azure-openai.html).
```

Only link slugs that exist under `build/alternatives/`. Keep plain text for any missing page.

- [ ] **Step 4: Validate guide**

Run: `npm run validate:guide`  
Expected: exit 0.

- [ ] **Step 5: Commit**

```bash
git add guide.yml
git commit -m "$(cat <<'EOF'
Document AI Models & Platforms taxonomy in the Guide.

EOF
)"
```

---

### Task 7: Verify assertions + full build gate

**Files:**
- Modify: `scripts/verify-chinaready-brand.mjs` (source `guide.yml` checks)
- Test: `npm run validate && npm run build && npm run verify`

- [ ] **Step 1: Add source assertions** near other `guide.yml` checks:

```js
assert(guide.includes("AI Models & Platforms"), "guide.yml must document AI Models & Platforms");
assert(guide.includes("Foundation Models & LLM APIs"), "guide.yml must list Foundation Models & LLM APIs");
assert(guide.includes("Embeddings & Reranking"), "guide.yml must list Embeddings & Reranking");
assert(guide.includes("Vector Databases & Retrieval"), "guide.yml must list Vector Databases & Retrieval");
assert(guide.includes("Agent / RAG Frameworks"), "guide.yml must list Agent / RAG Frameworks");
```

- [ ] **Step 2: Add a post-build sanity check** (only if `build/data.json` or equivalent exposes categories—if not, skip and rely on landscape item presence via alternatives pages):

```js
assert(exists("build/alternatives/openai.html"), "OpenAI alternatives page must exist after AI model entries are added");
assert(exists("build/alternatives/pinecone.html"), "Pinecone alternatives page must exist after vector DB entries are added");
```

If slug canonicalization renames Anthropic → something else, discover actual filenames with `ls build/alternatives | rg -i 'openai|anthropic|pinecone|gemini'` and assert those paths.

- [ ] **Step 3: Full gate**

```bash
npm run validate
npm run build
npm run verify
```

Expected: all exit 0. Fix any logo path, YAML indent, or verify assertion failures before continuing.

- [ ] **Step 4: Commit**

```bash
git add scripts/verify-chinaready-brand.mjs guide.yml
git commit -m "$(cat <<'EOF'
Verify AI Models & Platforms appears in Guide and alternatives pages.

EOF
)"
```

---

### Task 8: Ship to production

**Files:** none (git + Cloudflare Pages)

- [ ] **Step 1: Confirm clean status for intended files**

```bash
git status
git log -5 --oneline
```

- [ ] **Step 2: Push main**

```bash
git push origin main
```

- [ ] **Step 3: Deploy** (follow README / existing Actions; if local deploy is the project norm):

```bash
npx wrangler pages deploy build --project-name chinaready-landscape --branch main
```

Or wait for GitHub Actions deploy on `main` if that is the current pipeline—do not double-deploy unless the repo currently expects local wrangler after push.

- [ ] **Step 4: Acceptance checklist reply** (minimal, with URLs)

Check:

- https://landscape.chinaready.co/ — grid shows **AI Models & Platforms**
- Foundation Models subcategory includes DeepSeek, Qwen, Moonshot AI (Kimi)
- https://landscape.chinaready.co/guide — Overview table lists the new Level-1 / Level-2 names
- https://landscape.chinaready.co/alternatives/openai.html — lists China model candidates

---

## Spec coverage checklist

| Spec requirement | Task |
|---|---|
| L1 `AI Models & Platforms` appended 7th | Task 1 |
| Four L2 names | Task 1 + Task 6 |
| Foundation 7 items | Task 2 |
| Embeddings 6 items | Task 3 |
| Vector DB 5 items (no OpenSearch) | Task 4 |
| Agent/RAG 5 China products (no LangChain/LlamaIndex items) | Task 5 |
| Guide Overview + subcategory copy + out-of-scope chips/robotics note | Task 6 |
| Logos + validate/build/verify | Tasks 2–5, 7 |
| No new vendor_type / AI filter chip | Global Constraints + all item tables |
| Deploy + acceptance URLs | Task 8 |

## Self-review notes

- No placeholders left for item names, logo filenames, or homepage URLs.
- Guide linking is gated on post-build slug existence (matches existing Guide SEO constraint).
- Empty `items: []` may fail landscape2 schema—Task 1 explicitly handles merge-forward into Task 2.
- Count: 7 + 6 + 5 + 5 = 23 items.

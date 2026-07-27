# AI Models & Platforms category

Date: 2026-07-27  
Status: approved  
Goal: add a Level-1 category that maps familiar global generative-AI developer services to mainland China–ready model APIs, embeddings, vector retrieval, and agent/RAG platforms—without turning the landscape into a full Chinese AI industry map.

## Problem

Chinaready Landscape today covers six Level-1 categories focused on app launch infrastructure (cloud, auth, payments, push, maps, etc.). Global teams increasingly also need China-reachable AI stack choices (OpenAI / Claude / Gemini / Pinecone / GPTs-style builders), but:

1. There is no AI Level-1 or Level-2 taxonomy in `landscape.yml` / `guide.yml`.
2. No items exist for Qwen, DeepSeek, Kimi, Zhipu, Milvus, Dify, and similar products.
3. A reference-style “global AI ecosystem” poster (LLMs → frameworks → vector DBs → …) does not match this project’s replacement-catalog framing.

## Decisions (confirmed)

| Decision | Choice |
|---|---|
| Category role | **A — Developer alternative catalog**: what to use in mainland China instead of OpenAI / Anthropic / Gemini-class services |
| Coverage depth | **B — Models + developer AI infra** (not chips, not embodied robotics) |
| Taxonomy shape | **A — `AI Models & Platforms`** with four Level-2 subcategories below |
| Inclusion bar | **B — Mainland commercial access + key open-source self-host** (no pure overseas SaaS as primary items) |
| First-ship density | **Approach 2 — balanced shortlist** (~5–7 items per subcategory; incomplete by design) |

## Taxonomy

### Level 1

`AI Models & Platforms`

Place as a new top-level category in `landscape.yml` and mirror it in `guide.yml` (Overview table + Guide sections). **Grid order:** append as the **7th** Level-1 category after `Growth, Content & Experience` (do not reshuffle existing categories in v1).

### Level 2

1. **Foundation Models & LLM APIs**
2. **Embeddings & Reranking**
3. **Vector Databases & Retrieval**
4. **Agent / RAG Frameworks**

## Inclusion / exclusion rules

### Include

- Mainland China–reachable commercial APIs, China cloud MaaS consoles, or China SaaS products a foreign team can evaluate for production use.
- Key open-source projects that are commonly self-hosted in China as part of a RAG/LLM stack (e.g. Milvus, BGE, RAGFlow), when they clearly serve as alternatives to a global hosted service.

### Exclude (v1)

- Compute silicon and full-stack chip ecosystems (Huawei Ascend, Cambricon, Hygon, Kunlunxin).
- Embodied AI / robotics (Agibot, UBTECH, Fourier, etc.).
- Evaluation-only tooling as its own subcategory (Giskard, Ragas, Trulens).
- Pure overseas SaaS primaries (OpenAI, Anthropic, Pinecone Cloud, Cohere, Voyage, Jina Cloud as landscape items).
- Global orchestration libraries as landscape items when a China product covers the same job (**LangChain** and **LlamaIndex** explicitly out of v1 item list).
- Generic “Postgres/OpenSearch can do vectors” stretch entries (**OpenSearch** explicitly removed from v1).

## First-ship item lists

Canonical display names below should be used as `item.name` unless validation/logo constraints force a shorter form. Each item needs SVG under `hosted_logos/`, homepage, description, and the standard `extra.annotations` block used elsewhere in this repo.

### Foundation Models & LLM APIs

Typical global analogs for the subcategory: OpenAI, Anthropic Claude, Google Gemini, Azure OpenAI.

| Item | Suggested `vendor_type` | Suggested `global_analogs` |
|---|---|---|
| DeepSeek | china-saas | OpenAI, Anthropic |
| Moonshot AI (Kimi) | china-saas | OpenAI, Anthropic |
| Qwen (Alibaba Cloud Model Studio) | china-cloud | OpenAI, Google Gemini, Azure OpenAI |
| Zhipu AI (GLM) | china-saas | OpenAI, Anthropic |
| Baichuan | china-saas | OpenAI |
| MiniMax | china-saas | OpenAI |
| Volcengine Ark (Doubao) | china-cloud | OpenAI, Azure OpenAI |

Deferred: Baidu Qianfan/ERNIE as a standalone foundation-model card (embeddings may still reference Qianfan), StepFun, 01.AI, iFlytek Spark, Tencent Hunyuan.

### Embeddings & Reranking

Typical global analogs: OpenAI Embeddings, Cohere Embed/Rerank, Voyage, Sentence-BERT hosted offerings.

| Item | Suggested `vendor_type` | Suggested `global_analogs` |
|---|---|---|
| BGE (BAAI FlagEmbedding) | china-saas | OpenAI Embeddings, Sentence-BERT |
| Qwen Embeddings (DashScope) | china-cloud | OpenAI Embeddings, Voyage |
| Zhipu Embeddings | china-saas | OpenAI Embeddings, Cohere |
| BCE (NetEase Youdao) | china-saas | OpenAI Embeddings, Cohere Rerank |
| GTE (Alibaba) | china-saas | OpenAI Embeddings, Voyage |
| Baidu Qianfan Embeddings | china-cloud | OpenAI Embeddings |

Notes:

- **`vendor_type` rule for v1 (no new enum):** China cloud managed APIs → `china-cloud`; China-origin commercial SaaS or China-origin OSS with a product/org homepage → `china-saas`. Do not add a dedicated open-source filter value in v1.
- Deferred: Jina, Voyage, Cohere as items; older M3E-class models.

### Vector Databases & Retrieval

Typical global analogs: Pinecone, Weaviate Cloud, Qdrant Cloud.

| Item | Suggested `vendor_type` | Suggested `global_analogs` |
|---|---|---|
| Milvus | china-saas | Pinecone, Weaviate, Qdrant |
| Zilliz Cloud | china-saas | Pinecone, Weaviate Cloud |
| Tencent Cloud VectorDB | china-cloud | Pinecone |
| Alibaba Cloud DashVector | china-cloud | Pinecone, Amazon OpenSearch Serverless |
| Baidu VectorDB | china-cloud | Pinecone |

Explicitly removed from v1: OpenSearch (self-host).

### Agent / RAG Frameworks

Typical global analogs: LangChain/LlamaIndex-style app platforms, OpenAI GPTs builders, hosted RAG suites—named as analogs only; LangChain/LlamaIndex are **not** landscape items in v1.

| Item | Suggested `vendor_type` | Suggested `global_analogs` |
|---|---|---|
| Dify | china-saas | LangChain, LlamaIndex, OpenAI GPTs |
| RAGFlow | china-saas | LlamaIndex, LangChain |
| FastGPT | china-saas | OpenAI GPTs, LangChain |
| Coze | china-saas | OpenAI GPTs, Botpress |
| MaxKB | china-saas | LangChain, OpenAI GPTs |

Deferred: Haystack, Alibaba Bailian / Qianfan “app studio” cards (overlap with model MaaS entries), Txtai.

## Data & Guide requirements

### `landscape.yml`

- Add the Level-1 category and four Level-2 subcategories.
- Add all first-ship items with required fields per `CONTRIBUTING.md`.
- Prefer one primary subcategory per product; use `second_path` only if a single product genuinely spans two AI subcategories and existing repo practice supports it.
- `replacement_fit` defaults: `direct` or `partial` for China SaaS/cloud AI APIs; use `ecosystem-specific` only when the product is tightly tied to a China cloud console.

### `guide.yml`

- Add Overview table row for `AI Models & Platforms` and the four subcategories.
- Add Guide category prose: audience framing (China-reachable AI developer stack), and per-subcategory “what belongs here” plus typical global services (OpenAI, Anthropic, Pinecone, GPTs, etc.), consistent with the 2026-07-20 Guide SEO pattern.
- Mention that chips/robotics are out of scope so contributors do not PR them into this category by mistake.

### Logos & validation

- SVG logos in `hosted_logos/` following existing brand rules.
- Pass `npm run validate`, `npm run build`, and `npm run verify`.

### Filters / settings

- Reuse existing `vendor_type` featured filters; do not add an “AI” filter chip or a new open-source `vendor_type` in v1.

## Non-goals

- Redesigning landscape2 grid UI to mimic the reference infographic’s “beads on a wire” layout.
- Building a parallel Chinese-language taxonomy (names stay English to match the rest of the site).
- Exhaustive coverage of every China model vendor.
- Claiming regulatory or ICP advice beyond existing `china_context` / availability annotation style.

## Success criteria

1. Landscape grid shows `AI Models & Platforms` with four populated subcategories and no empty placeholders for the first-ship set.
2. Each item has source-backed annotations and at least one meaningful `global_analogs` string usable by Guide / alternatives surfaces.
3. Guide Overview lists the new Level-1/Level-2 names and explains typical global → China mapping for AI.
4. Validate/build/verify succeed; live site after deploy shows the new category.

## Implementation notes (for planning)

Primary files: `landscape.yml`, `guide.yml`, `hosted_logos/*`, possibly `settings.yml` if filter copy needs a one-line mention. No landscape2 fork required.

Suggested implementation sequence:

1. Skeleton L1/L2 in YAML (empty or with placeholders only if build requires).
2. Add Foundation Models items + logos.
3. Add Embeddings, Vector DB, Agent/RAG items + logos.
4. Guide Overview + subcategory copy.
5. validate → build → verify → commit → push main → deploy per Chinaready ship rule.

请加载并遵循本仓库的 gsc-digest skill，优化 landscape.chinaready.co 的 Google 索引问题。

必读（按顺序）：
1. `.cursor/skills/gsc-digest/SKILL.md`
2. `.cursor/rules/landscape-seo-indexing.mdc`
3. `.cursor/skills/gsc-digest/README.md`

立即执行：
1. 运行：`npm run gsc:digest`（或 skill 里的 mvp-1 CLI 命令）
2. 原样展示 stdout
3. 只处理 URL 属于 `https://landscape.chinaready.co/` 的问题；chinaready.co / wb 交给 mvp-1，不要改
4. 批量修复本仓库可改项（landscape.yml / guide / redirects / build 相关），不要中途要求我逐条审核
5. 修完后按本仓库惯例 commit → push origin main 并部署；上线后我在 GSC Validate，结果稍后再贴

共享导出目录（已有 Coverage + Drilldown）：
`/Users/martinliu/Documents/Chinaready/ga-digest/`

若 skill 文件缺失：确认本仓库存在 `.cursor/skills/gsc-digest/SKILL.md`；CLI 依赖本机 mvp-1 路径 `/Users/martinliu/code/mvp-1/scripts/gsc-digest/cli.mjs`。

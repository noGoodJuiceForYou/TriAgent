# 任务

## 1. 修正 Git 条目

- [x] 1.1 用 `git update-index --cacheinfo` 把 `docs/openspec` 从 `100644` 普通文件改为 `120000` 符号链接，blob 保持 `../openspec`。

## 2. 规格

- [x] 2.1 `openspec-wiki` 增补 source 链接要求与「空章节」反例场景。

## 3. 验证

- [x] 3.1 `git ls-files -s docs/openspec` 返回 `120000`。
- [x] 3.2 `docs/openspec` 在 `core.symlinks=false` 的检出中仍表现为同内容文本文件，`git status` 只有索引类型变更、无工作区改动。
- [x] 3.3 临时将 `docs/openspec` 指向 `openspec` 后执行 `npm run docs:build`，抽查归档页 HTML 确认 include 已注入源文件正文（空章节缺陷消失）。
- [x] 3.4 `openspec validate --all` 与 `npm run docs:build` 通过。

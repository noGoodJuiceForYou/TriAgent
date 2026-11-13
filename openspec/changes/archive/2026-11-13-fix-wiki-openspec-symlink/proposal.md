# 修正 WIKI 源链接：docs/openspec 必须是符号链接

## Why

变更 WIKI 页面通过相对 `@include` 引用 OpenSpec 源文件：

```text
docs/changes/archive/{name}/index.md
  → <!--@include: ../../../openspec/changes/archive/{name}/proposal.md-->
```

`../../../` 从 `docs/changes/archive/{name}/` 上溯到 `docs/`，因此 include 的真实目标是 `docs/openspec/...`。仓库预期 `docs/openspec` 是**指向 `../openspec` 的符号链接**，但它在 Git 里被提交成普通文件（mode `100644`，内容就是字符串 `../openspec`）。

后果：`npm run docs:build` 仍然成功，但所有 include 静默解析失败，渲染出的每个变更页面只有「提案 / 设计 / 任务 / 规格变更」四个空标题。构建不报错，内容全丢，属于最难发现的文档缺陷。

## What Changes

- 将 `docs/openspec` 在 Git 索引中改为符号链接（mode `120000`），目标 `../openspec`。blob 内容不变，因此现有检出在 `core.symlinks=false` 的 Windows 上仍表现为同名文本文件，行为与修改前一致。
- 在 `openspec-wiki` 主规格中记录该约束：变更页面的 include MUST 能从 `docs/openspec` 解析到真实 OpenSpec 源文件，且 WIKI 构建 MUST NOT 因源链接失效而渲染空章节。

## Impact

- 受影响规格：`openspec-wiki`。
- 受影响文件：`docs/openspec`（仅 Git 类型）、`openspec/specs/openspec-wiki/spec.md`。
- 无源代码、API、数据模型或构建脚本变更。
- 未启用符号链接的 Windows 检出仍需以 WSL 或管理员/开发者模式检出才能本地看到 WIKI 正文；这不是本次变更能消除的限制，但仓库在其他平台上从此正确。

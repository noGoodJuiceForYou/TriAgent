# 设计：把 docs/openspec 恢复为符号链接

## 为什么不是改 include 路径

`sync_wiki.py` 生成的 include 前缀是相对路径 `../../../openspec/changes/...`，从 `docs/changes/{active|archive}/{name}/index.md` 出发，`../../../` 落在 `docs/`。两条可选路线：

1. 常量前缀改写成 `../../../openspec/...` → 已经如此；真正的问题是 `docs/openspec` 不是目录。
2. 把前缀改成 `../../../../openspec/...`，绕开 `docs/openspec`。

方案 2 会改动生成器与全部 70 个页面，且与 `sync_wiki.py` 的 `validate_layout()`（明确要求 `docs/openspec` 是 symlink）冲突。方案 1 只需修正一个 Git 条目，保持生成器、页面、校验逻辑三者一致。

## 实现方式

Git 用 mode `120000` + blob 内容（符号链接目标文本）表示符号链接。原文件内容恰好就是目标路径 `../openspec`（11 字节），所以可以复用同一个 blob：

```bash
git update-index --add --cacheinfo 120000,95543ef31665865cd00a79ca22e943876d471f53,docs/openspec
```

不需要在磁盘上真正创建链接，也不需要管理员权限，索引即为事实来源。

## 兼容性

- **启用符号链接的检出（Linux/macOS、开启 Developer Mode 的 Windows）**：得到真实目录链接，VitePress 能解析 include，WIKI 正文正常渲染。
- **`core.symlinks=false` 的 Windows 检出**：Git 把链接目标写成普通文件，与修改前完全一致，因此不会引入新的本地破坏；这些环境下的 WIKI 正文仍然为空，需要改用 WSL 或开启符号链接。
- **构建期不受影响**：VitePress 对无法解析的 include 不报错，所以该缺陷不会让 CI 失败；因此规格里显式要求「MUST NOT 渲染空章节」，把它变成可验证的约束。

## 验证策略

- `git ls-files -s docs/openspec` 必须显示 `120000`。
- 在可解析链接的环境中执行 `docs:build` 后，抽查任一归档页面的 HTML 体积与正文关键字，确认 include 已注入内容（本次以临时 junction 验证：页面从空章节变为 111 KB 正文，含源文件内容）。

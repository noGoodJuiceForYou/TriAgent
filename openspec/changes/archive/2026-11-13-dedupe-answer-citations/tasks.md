# 任务

## 1. 后端按 chunk 去重

- [x] 1.1 在流式服务中维护已引用 chunk ID 集合，重复引用不再追加也不再下发 `reference.source`。
- [x] 1.2 无 ID 的引用保持原样追加，避免误合并。
- [x] 1.3 新增回归测试：同一回答内重复返回同一 chunk 时，SSE 与持久化引用均只保留一次。

## 2. 前端共享去重

- [x] 2.1 `chat/citationPanels.ts` 导出 `dedupeReferences`（按 ID 去重、按分数降序、截断到 5）。
- [x] 2.2 chat store 改用该函数，删除私有 `uniqueReferences` 与重复的 `referenceScore`。
- [x] 2.3 引用面板在写入状态前去重，历史消息中的重复引用不再重复展示。

## 3. 分片可区分

- [x] 3.1 引用面板新增分片标签：优先标题路径末端，其次「分片 N」，最后 chunk ID。
- [x] 3.2 补充对应样式，保持窄屏可换行。

## 4. 测试

- [x] 4.1 后端：重复 chunk 的引用去重（SSE 与持久化）。
- [x] 4.2 前端：跨调用重复、按分数排序截断、面板打开时去重。

## 5. 验证

- [x] 5.1 `ruff check`、`pyright` 通过。
- [x] 5.2 后端 `pytest`：151 passed / 3 failed（失败集合与本次改动无关，为既有环境与模板问题）。
- [x] 5.3 前端 `frontend:typecheck`、`frontend:test`、`frontend:build` 通过。
- [x] 5.4 实测：真实回答此前 10 条引用仅 8 个唯一 chunk，修复后 13 条引用对应 13 个唯一 chunk；面板显示 5 条互不重复且带分片标签。

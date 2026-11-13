# 设计：引用按 chunk 去重

## 判定：这是重复，还是同文档的不同分片

先区分两件事，避免误判：

| 现象 | 是否重复 | 位置 |
|---|---|---|
| 同一次检索里向量与 BM25 都召回同一个 chunk | 否，RRF 已按 chunk ID 合并 | `retrieval/hybrid.py` |
| 一次回答内多次调用 `knowledge_retrieval`，不同调用返回同一个 chunk | **是，未去重** | `chat/streaming.py` |
| 同一文档的多个不同 chunk | 否，是不同分片 | 前端展示问题 |

因此修复分两处：后端去重真实重复；前端补充分片标识以消除"看起来像重复"的观感。

## 后端去重

在 `ChatStreamingService.stream` 内维护 `cited_ids: set[str]`：

- 引用事件到达时取 `reference["id"]`；已存在则 `continue`，既不追加到 `citations`，也不下发 `reference.source`。
- ID 为空的引用不参与去重（保持原样追加），避免把无法识别的引用误合并。

保留**第一次出现**的顺序，而不是按分数重排：流式事件顺序应与模型调用顺序一致，便于在时间线上回溯"哪次检索带来了这条引用"。

## 前端去重

`chat/citationPanels.ts` 导出 `dedupeReferences(items, limit = 5)`：

1. 按 `id` 保留首次出现；
2. 按 `rerankScore ?? score` 降序排序；
3. 截断到 `limit`。

`chat` store 原先私有的 `uniqueReferences` 删除，改用该函数；`toggleCitationPanel` 在写入面板状态前同样调用它。这样即使历史消息中已存在重复引用，面板也不会重复展示。

`limit = 5` 沿用既有上限，与 rerank 阶段的最多 5 条结果保持一致。

## 分片标识

`ChatCitationPanel` 为每个条目增加第三行标签，取值顺序：

1. `metadata.headingPath` 的最后一段（最可读，例如「5. 日志事件字典」）；
2. `metadata.chunkIndex` 换算为「分片 N」；
3. `chunkId` 原值；
4. 兜底「分片」。

这样同一文档的多个分片在列表中可区分，且不改变标题字段本身的语义。

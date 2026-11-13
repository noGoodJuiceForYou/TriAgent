# 引用按 chunk 去重并区分同文档分片

## Why

混合检索**单次调用**已按 chunk ID 去重（RRF 用字典聚合向量与 BM25 的排名），但**一次回答内多次检索**的结果是直接拼接的，导致同一 chunk 被重复写入 `citations` 并重复下发 `reference.source`。

实测证据：修复前一条真实回答持久化了 10 条引用但只有 8 个不同 chunk，其中 2 个 chunk 各出现两次；前端引用面板因此出现两个同时高亮的相同条目。

此外，同一文档的不同 chunk 共用文件名标题，面板里连续出现多条同样的文档名，看起来像重复数据，实际上是没有展示区分信息。

## What Changes

- 后端在流式过程中按引用 ID 去重：重复 chunk 只保留第一次，并且不再重复下发 `reference.source`。
- 前端把去重逻辑收敛为共享的 `dedupeReferences`，同时用于 chat store 的引用列表与引用面板，避免面板直接读原始 `citations` 时重新引入重复。
- 引用面板为每个条目补充分片标识（标题路径末端，其次分片序号，最后 chunk ID），使同一文档的多个 chunk 可区分。

## Impact

- 受影响规格：`stream-rag-chat`、`knowledge-answer-citation-view`。
- 受影响代码：`apps/backend/src/triagent_ops/chat/streaming.py`、`apps/frontend/src/chat/citationPanels.ts`、`apps/frontend/src/stores/chat.ts`、`apps/frontend/src/components/ChatCitationPanel.vue`。
- 无 API 契约、数据模型或迁移变更；历史消息中的重复引用会在读取时被前端去重。

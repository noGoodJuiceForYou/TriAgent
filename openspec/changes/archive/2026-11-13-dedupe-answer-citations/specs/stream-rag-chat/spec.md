## MODIFIED Requirements

### Requirement: Chat stream event sequence

聊天流 SHALL 会根据需要发出标记增量、工具生命周期事件、详细参考源事件、完成事件和错误事件。同一回答内重复出现的引用 MUST 只下发一次。

#### Scenario: Token delta is streamed

- **WHEN** 的 Agent 会发出最终答案文本
- **THEN** 的后端 MUST 按顺序流式传输 `content.delta` 事件

#### Scenario: Tool call lifecycle is streamed

- **WHEN** Agent 启动并完成或失败一个工具调用
- **THEN** 后端 MUST 流式传输 `tool.call` 事件，带有 `started`、`completed` 或 `failed` 状态和稳定的工具调用 ID。

#### Scenario: References are streamed

- **WHEN** 知识检索工具返回答案所使用的引用来源
- **THEN** 后端 MUST 流 `reference.source` 从这些引用来源中派生的事件，包括有限的 chunk 引用片段、元数据、相关性分数和知识类型（如果可用的话）。

#### Scenario: Repeated chunk citations are collapsed

- **WHEN** 一次回答内多次工具调用返回同一个 chunk 引用
- **THEN** 后端 MUST 只下发一次该 chunk 的 `reference.source` 事件
- **AND** MUST 在持久化的消息引用中只保留一条该 chunk
- **AND** MUST 保持首次出现的位置顺序

#### Scenario: Completion is streamed

- **WHEN** 最终的助手回答已完全生成并保存
- **THEN** 后端 MUST 流式传输一个 `complete` 事件，其中包含已保存的消息和会话摘要。

#### Scenario: Errors are streamed safely

- **WHEN** 在流式传输期间 Agent 执行、工具执行或持久化失败
- **THEN** 使用统一的错误消息格式，通过后端 MUST 流式传输 `error` 事件，而不会泄露敏感信息。

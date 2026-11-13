# 设计：按会话记忆的引用面板

## 状态模型

面板状态以会话 id 为键：

```ts
interface SessionCitationState {
  messageId: string;              // 打开该面板的回答
  references: readonly ChatReference[];  // 该回答的引用快照
  selectedReferenceId: string;    // 面板内选中的 chunk
}
type CitationStateBySession = Readonly<Record<string, SessionCitationState>>;
```

活动面板通过 `activeCitationPanel(state, chat.activeSessionId)` 读取。会话切换时 `activeSessionId` 变化，计算属性自然重算——切到未展开的会话即收起，切回已展开的会话即恢复，不需要额外监听。

## 纯函数边界

`chat/citationPanels.ts` 只承担状态变换，便于单测：

| 函数 | 语义 |
|---|---|
| `toggleCitationPanel` | 同一回答 → 收起；另一回答 → 切换内容并选中首条；无活动会话或无引用 → 原样返回 |
| `selectCitedChunk` | 只改选中 chunk，不改归属消息；重复选中返回原引用以保持引用等价 |
| `closeCitationPanel` | 删除该会话条目 |
| `pruneCitationPanels` | 会话列表变化时丢弃已删除会话的条目 |

所有函数在无变更时返回**同一个对象引用**，避免无关重渲染。

## 幂等切换

按钮事件从 `open-references` 改名为 `toggle-references`，由视图统一决定开合，组件保持无状态。按钮 `aria-expanded` 仍由当前展开的消息 id 驱动，并据此切换 `aria-label`（查看 / 收起）。

## 满宽正文

- `.chat-transcript__message` 由 `max-width: min(46rem, 90%)` 改为 `max-width: 100%`，助手正文与工具调用区块随之占满。
- 用户消息的收缩行为改由外层 `li` 承担：`.chat-transcript__message--user { max-width: min(46rem, 92%); margin-left: auto; }`，保持靠右与内容宽度，不引入独立气泡样式。
- 转录与输入框的水平内边距统一为 `clamp(1rem, 2.5vw, 2rem)`，避免正文与输入框左右边界错位。

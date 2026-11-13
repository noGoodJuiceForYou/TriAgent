# 任务

## 1. 面板按会话记忆

- [x] 1.1 新增 `chat/citationPanels.ts`，以会话 id 为键保存 `messageId`、`references` 与 `selectedReferenceId`。
- [x] 1.2 对话视图改用该状态：活动面板由 `activeSessionId` 派生，切换会话即恢复或收起。
- [x] 1.3 会话列表变化时清理已删除会话的面板状态。

## 2. 再次点击收起

- [x] 2.1 转录组件事件由 `open-references` 改为 `toggle-references`。
- [x] 2.2 同一回答再次点击收起，另一回答则切换内容并选中首条引用。
- [x] 2.3 按钮 `aria-label` 随展开状态在「查看」与「收起」之间切换。

## 3. 正文占满

- [x] 3.1 助手正文与工具调用区块取消 `46rem` 上限，改为 `max-width: 100%`。
- [x] 3.2 用户消息改由外层列表项限制宽度并保持靠右。
- [x] 3.3 转录与输入框水平内边距统一为 `clamp(1rem, 2.5vw, 2rem)`。

## 4. 测试

- [x] 4.1 覆盖开合、同会话切换、跨会话隔离、无活动会话/无引用、选中 chunk、关闭与清理。
- [x] 4.2 覆盖转录按钮的 toggle 事件与「收起」标签。
- [x] 4.3 覆盖正文满宽与内边距的布局断言。

## 5. 验证

- [x] 5.1 `npm run frontend:typecheck` 通过。
- [x] 5.2 `npm run frontend:test` 通过。
- [x] 5.3 `npm run frontend:build` 通过。
- [x] 5.4 浏览器实测：点击展开（`824px + 352px`，`aria-expanded=true`）→ 再次点击收起（单列，`aria-expanded=false`）；切到其他会话面板收起，切回恢复；助手正文宽度约 1097px（板块内容宽 1176px，扣除内边距与滚动条），无水平溢出。

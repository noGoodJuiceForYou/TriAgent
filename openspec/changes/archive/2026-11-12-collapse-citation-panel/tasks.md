# 任务

## 1. 面板改为按需展开

- [x] 1.1 对话视图以 `openReferencesMessageId`、`openReferences`、`selectedReference` 三个状态控制面板显隐与选中项。
- [x] 1.2 基础网格改为单列，仅在 `.chat-view--with-citations` 时追加右侧列。
- [x] 1.3 面板关闭时清空展开与选中状态。

## 2. 引用来源按钮

- [x] 2.1 `ChatTranscript` 在含引用的助手消息结尾渲染「引用来源（N）」按钮并抛出 `open-references`。
- [x] 2.2 按钮以 `aria-expanded` 反映面板状态。
- [x] 2.3 无引用的回答不渲染该按钮。
- [x] 2.4 移除回答下方的引用 chip 列表，避免重复入口。

## 3. 测试

- [x] 3.1 覆盖按钮文案、事件载荷与 `aria-expanded` 两种状态。
- [x] 3.2 覆盖无引用回答不渲染按钮。
- [x] 3.3 更新对话布局断言：基础单列、展开态两列、面板条件渲染。

## 4. 验证

- [x] 4.1 `npm run frontend:typecheck` 通过。
- [x] 4.2 `npm run frontend:test` 通过。
- [x] 4.3 `npm run frontend:build` 通过。
- [x] 4.4 浏览器实测：默认单列无面板；点击按钮后两列并列出 5 个分片；关闭后恢复单列；窄屏面板位于对话下方且无横向滚动。

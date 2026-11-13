# 设计：设置页拆分与右侧引用面板

## 路由与导航

- 新增 `/settings`，`meta.title` 为「系统设置」，与其余工作区路由同属 `WorkspaceLayout` 的子路由，沿用同一套认证守卫。
- `WorkspaceNavigation` 增加「系统设置」条目；移动端底部导航从 4 列改为 5 列，保持单行且不产生水平溢出。
- 设置页不复制 store 逻辑：复用现有 `ChatPromptSidebar`、`ChatSkillSidebar` 组件与 `chat` store 的既有动作。

## 配置加载

对话页原先在 `chat.initialize()` 中顺带读取装配配置。设置页可能被直接访问，因此 store 增加 `loadConfiguration()`，仅拉取配置，不重载会话与消息；设置页在 `configuration` 为空时调用它。

## 引用面板

- 新增 `ChatCitationPanel`，作为受控组件：`references` 展示当前回答命中的 chunk，`selected` 由对话视图持有，`select`、`close`、`open-document` 向上抛出。
- `ChatTranscript` 不再渲染「本次回答引用」列表与内联详情，只保留每条消息的引用 chip；chip 通过 `select-reference` 把引用与消息 id 抛给视图，保证引用反馈仍绑定到正确的消息。
- 对话视图监听 `chat.references` 变化，把首条引用设为默认选中，避免面板出现空态闪烁。

## 打开来源

- 新增 `chat/referenceLink.ts`：`referenceDocumentQuery` 只对同时具备 `documentId` 与 `knowledgeBaseId` 的引用返回查询参数，`openReferenceInNewTab` 以 `_blank` 加 `noopener,noreferrer` 打开，并在被浏览器拦截时返回 `false`。
- 对话视图用 `router.resolve` 生成 `/knowledge?documentId=...&knowledgeBaseId=...` 的绝对路径后交给上述函数，因此新标签页仍走已认证路由。

## 响应式

- 桌面：`minmax(0, 1fr) minmax(18rem, 22rem)` 两列，引用面板在右。
- 窄屏：单列，引用面板置于对话下方并限制最大高度，避免页面级水平滚动。

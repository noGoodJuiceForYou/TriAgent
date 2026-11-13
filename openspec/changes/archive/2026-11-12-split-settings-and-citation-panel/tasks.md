# 任务

## 1. 设置页

- [x] 1.1 新增 `/settings` 路由与 `SettingsView`，承载系统提示词与 Skill 两个面板。
- [x] 1.2 `WorkspaceNavigation` 增加「系统设置」入口，移动端底部导航改为 5 列。
- [x] 1.3 chat store 增加 `loadConfiguration()`，设置页在配置为空时拉取。

## 2. 引用面板

- [x] 2.1 新增 `ChatCitationPanel`，列出当前回答命中的 chunk 并显示选中详情。
- [x] 2.2 对话视图右列改为引用面板，移除两个配置面板。
- [x] 2.3 `ChatTranscript` 移除列表与内联详情，改为通过 `select-reference` 抛出选中的引用与消息 id。

## 3. 新标签页打开来源

- [x] 3.1 新增 `chat/referenceLink.ts`，提供文档查询解析与新标签页打开。
- [x] 3.2 对话视图改用 `router.resolve` 加新标签页打开，不再使用路由跳转。

## 4. 测试

- [x] 4.1 覆盖引用面板的列表、空状态、选择与文档打开事件。
- [x] 4.2 覆盖引用文档查询解析与新标签页打开（含被拦截场景）。
- [x] 4.3 覆盖设置页与路由存在性、对话页不再包含配置面板、移动导航 5 列。
- [x] 4.4 更新对话转录测试以匹配新的选择事件与选中态。

## 5. 验证

- [x] 5.1 `npm run frontend:typecheck` 通过。
- [x] 5.2 `npm run frontend:test` 通过。
- [x] 5.3 `npm run frontend:build` 通过。
- [x] 5.4 浏览器实测桌面两列、窄屏单列、底部导航五项无溢出，且打开来源触发新标签页。

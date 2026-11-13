## MODIFIED Requirements

### Requirement: Route-based application shell

认证后的应用 SHALL 提供 `/chat`、`/knowledge`、`/aiops`、`/mcp` 和 `/settings` 工作区，并在桌面侧栏与移动导航中提供一致入口。

#### Scenario: 用户打开 MCP 管理

- **WHEN** 已认证用户访问 `/mcp`
- **THEN** 应用 MUST 在共享工作区框架中显示 MCP 连接管理页面。

#### Scenario: 用户打开系统设置

- **WHEN** 已认证用户访问 `/settings`
- **THEN** 应用 MUST 在共享工作区框架中显示系统设置页面
- **AND** 桌面侧栏与移动导航 MUST 各提供一个可访问的「系统设置」入口

#### Scenario: 移动导航容纳全部工作区

- **WHEN** 窄视口渲染底部导航
- **THEN** 全部工作区入口 MUST 在同一行内排布
- **AND** 页面 MUST NOT 产生水平滚动

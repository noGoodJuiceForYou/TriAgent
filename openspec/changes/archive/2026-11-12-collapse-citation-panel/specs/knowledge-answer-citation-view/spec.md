## MODIFIED Requirements

### Requirement: Right-hand answer citation panel

对话工作区 SHALL 默认折叠引用面板，仅在操作员请求时于桌面右列展开，并在窄视口置于对话下方。

#### Scenario: Assistant answer lists its chunks

- **WHEN** 引用面板因操作员的请求而展开
- **THEN** 引用面板 MUST 列出该回答命中的全部 chunk 的来源类型与标题
- **AND** MUST 显示选中 chunk 的检索阶段排名、分数、摘录与元数据

#### Scenario: Answer has no citations

- **WHEN** 当前回答没有任何引用
- **THEN** 引用来源按钮 MUST NOT 渲染
- **AND** MUST NOT 渲染空的引用面板

#### Scenario: Operator selects a citation chip

- **WHEN** 操作员通过回答结尾的引用来源按钮打开某条回答的引用
- **THEN** 引用面板 MUST 选中该回答的首条 chunk 并展示其详情
- **AND** 引用反馈 MUST 仍然绑定到该回答对应的消息

#### Scenario: Citation panel stays collapsed by default

- **WHEN** 已认证用户打开对话路由或收到新的回答
- **THEN** 引用面板 MUST NOT 渲染
- **AND** 对话内容 MUST 占满可用宽度

#### Scenario: Answer exposes a single reference entry

- **WHEN** 当前回答包含一个或多个引用
- **THEN** 该回答结尾 MUST 渲染一个「引用来源（N）」按钮，N 为引用数量
- **AND** 按钮 MUST 通过 `aria-expanded` 反映引用面板的展开状态

#### Scenario: Operator expands the reference panel

- **WHEN** 操作员点击某条回答的引用来源按钮
- **THEN** 引用面板 MUST 在桌面右列展开并列出该回答命中的全部 chunk
- **AND** MUST 默认选中第一条 chunk
- **AND** 在窄视口 MUST 置于对话下方，且 MUST NOT 产生页面水平滚动

#### Scenario: Operator collapses the reference panel

- **WHEN** 操作员关闭引用面板
- **THEN** 面板 MUST 卸载，对话内容 MUST 恢复占满可用宽度
- **AND** 对应的引用来源按钮 MUST 回到未展开状态

#### Scenario: Operator selects another chunk

- **WHEN** 操作员在引用面板中选择另一个 chunk
- **THEN** 面板 MUST 展示该 chunk 的详情
- **AND** 引用反馈 MUST 仍然绑定到打开该面板的那条回答

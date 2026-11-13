## MODIFIED Requirements

### Requirement: Right-hand answer citation panel

对话工作区 SHALL 默认折叠引用面板，仅在操作员请求时于桌面右列展开，并在窄视口置于对话下方。面板状态 MUST 与其所属会话绑定。面板中的引用项 MUST 按 chunk 唯一。

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
- **THEN** 该回答结尾 MUST 渲染一个「引用来源（N）」按钮，N 为去重后的 chunk 数量
- **AND** 按钮 MUST 通过 `aria-expanded` 反映引用面板的展开状态

#### Scenario: Operator toggles the same answer twice

- **WHEN** 操作员点击某条已展开引用的回答的引用来源按钮
- **THEN** 引用面板 MUST 收起，对话内容 MUST 恢复占满可用宽度
- **AND** 该按钮 MUST 回到未展开状态

#### Scenario: Operator opens another answer in the same conversation

- **WHEN** 引用面板已展开，操作员点击同一会话中另一条回答的引用来源按钮
- **THEN** 面板 MUST 保持展开并切换为该回答的引用内容
- **AND** MUST 选中该回答的首条 chunk

#### Scenario: Reference panel follows the active conversation

- **WHEN** 会话 A 的引用面板处于展开状态，操作员切换到未展开面板的会话 B
- **THEN** 引用面板 MUST 收起，且 MUST NOT 展示会话 A 的引用内容
- **WHEN** 操作员切回会话 A
- **THEN** 引用面板 MUST 恢复会话 A 之前的展开状态与选中 chunk

#### Scenario: Deleted conversation drops its panel state

- **WHEN** 一个持有引用面板状态的会话被删除
- **THEN** 前端 MUST 清理该会话的面板状态，且 MUST NOT 影响其他会话的面板

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

#### Scenario: Duplicate chunks are shown once

- **WHEN** 一条回答的持久化引用中包含重复的同一个 chunk
- **THEN** 引用面板 MUST 只渲染该 chunk 一次
- **AND** 引用来源按钮的计数 MUST 使用去重后的数量
- **AND** 面板中 MUST 至多有一个引用项处于选中状态

#### Scenario: Chunks of the same document are distinguishable

- **WHEN** 面板列出同一源文档的多个 chunk
- **THEN** 每个引用项 MUST 展示其分片标识，取值依次为标题路径末端、分片序号或 chunk ID
- **AND** MUST NOT 因缺少标题路径而省略该标识

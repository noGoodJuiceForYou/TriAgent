## MODIFIED Requirements

### Requirement: Citation source classification and navigation

聊天工作区 SHALL 用于区分普通文档、SOP 和诊断案例，并为可访问的基于文档的引用提供文档导航。

#### Scenario: Knowledge type is supplied

- **WHEN** 引用标识其知识类型
- **THEN** 前端 MUST 可视地区分 `document`、`sop` 和 `diagnostic-case` 来源。

#### Scenario: Operator opens a cited document

- **WHEN** 一个操作员选择一个包含文档和知识库标识符的引用
- **THEN** 前端 MUST 在新浏览器标签页中打开已认证的知识工作区，并通过其现有的 owner 范围的 API 边界定位该文档
- **AND** MUST 保持当前对话页面及其选中状态不变

#### Scenario: Citation has no document target

- **WHEN** 引用没有可访问的文档标识符
- **THEN** 前端 MUST 保留其证据详情和 MUST NOT 显示损坏的导航操作。

## ADDED Requirements

### Requirement: Right-hand answer citation panel

对话工作区 SHALL 在桌面右列展示当前回答命中的 chunk，并在窄视口置于对话下方。

#### Scenario: Assistant answer lists its chunks

- **WHEN** 当前回答包含一个或多个引用
- **THEN** 引用面板 MUST 列出全部命中 chunk 的来源类型与标题
- **AND** MUST 显示选中 chunk 的检索阶段排名、分数、摘录与元数据

#### Scenario: Answer has no citations

- **WHEN** 当前回答没有任何引用
- **THEN** 引用面板 MUST 显示说明性空状态
- **AND** MUST NOT 展示任何 chunk 条目或详情

#### Scenario: Operator selects a citation chip

- **WHEN** 操作员点击某条消息中的引用 chip
- **THEN** 引用面板 MUST 选中对应 chunk 并展示其详情
- **AND** 引用反馈 MUST 仍然绑定到该 chip 所属的消息

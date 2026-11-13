## MODIFIED Requirements

### Requirement: Answer context presentation

聊天工作区 SHALL 渲染安全的 Markdown 答案，并从共享消息和 SSE 合同中暴露源和工具调用上下文。

#### Scenario: Assistant answer contains Markdown

- **WHEN** 一个助手消息包含 Markdown 语法
- **THEN** 前端 MUST 在移除不可信的原始 HTML 的同时渲染支持的格式

#### Scenario: Answer uses knowledge references

- **WHEN** 一个流或持久化消息包含引用参考
- **THEN** 前端 MUST 显示源标题，并将其与工具调用活动区分开来。

#### Scenario: Tool call progresses

- **WHEN** 一个流发出 `tool.call` 事件，或者活动会话有工具调用审计
- **THEN** 前端 MUST 显示每个工具名称、生命周期状态以及可用的绑定结果或错误摘要。

#### Scenario: Assistant answer fills the conversation column

- **WHEN** 一个助手回答在桌面或窄视口渲染
- **THEN** 其正文、引用来源按钮与工具调用区块 MUST 使用对话板块的完整可用宽度，不得施加固定字符宽度上限
- **AND** user 消息 MUST 保持内容宽度与靠右对齐
- **AND** 页面 MUST NOT 因此产生水平溢出

### Requirement: Chat assembly controls

经过身份验证的工作区 SHALL 让 user 可以在中文中查看、选择、确认和恢复其基于服务器的系统提示和多选标准 Skill 配置，并 SHALL 将该配置呈现为系统设置路由中的两个独立面板。

#### Scenario: User opens split chat configuration sidebars

- **WHEN** 已认证的 user 打开系统设置工作区
- **THEN** 前端 MUST 通过共享合约加载当前配置，并显示“对话系统提示词设置”和“Skill 设置”两个独立面板，而不以 localStorage 作为事实来源
- **AND** 对话工作区 MUST NOT 渲染这两个面板

#### Scenario: User manages collapsible system prompts

- **WHEN** user 在“对话系统提示词设置”面板查看提示词
- **THEN** 每个提示词 MUST 可折叠和展开，展开后可以编辑名称和正文、保存、删除，并且界面 MUST 只允许单选一个后续对话使用的系统提示词。

#### Scenario: User manages multi-select standard Skills

- **WHEN** user 在“Skill 设置”面板查看 Skill
- **THEN** 界面 MUST 显示标准 `SKILL.md` 上传规范、每个 Skill 的 name 和 description，允许上传、删除，并允许多选零个或多个 Skill 供后续对话 Agent 按需加载

#### Scenario: User confirms an updated assembly

- **WHEN** 选择提示或技能并确认
- **THEN** 前端 MUST 通过类型化 API 客户端保存配置，显示保存的装配摘要，并用于后续消息。

#### Scenario: Configuration action fails

- **WHEN** 提示词或 Skill 的创建、保存、删除、上传或配置保存失败
- **THEN** 前端 MUST 在相关面板中显示中文错误，说明可恢复动作，MUST NOT 静默保留一个看似已保存的状态。

## ADDED Requirements

### Requirement: Assembly configuration surface location

用户对话装配配置 SHALL 在独立的系统设置工作区中编辑，而不是占用对话工作区的固定栏位。

#### Scenario: Prompt configuration lives on the settings route

- **WHEN** 已认证用户打开 `/settings`
- **THEN** 系统提示词面板 MUST 在该路由中可编辑、创建、删除与选用

#### Scenario: Skill configuration lives on the settings route

- **WHEN** 已认证用户打开 `/settings`
- **THEN** Skill 面板 MUST 在该路由中可上传、删除与保存选用

#### Scenario: Conversation keeps the full width

- **WHEN** 已认证用户打开 `/chat`
- **THEN** 对话工作区 MUST NOT 渲染系统提示词或 Skill 配置面板
- **AND** 其右侧栏 MUST 仅用于展示当前回答的引用

#### Scenario: Direct visit loads the saved configuration

- **WHEN** 用户直接访问 `/settings` 且本地尚未加载装配配置
- **THEN** 前端 MUST 通过现有的 owner 范围配置接口读取已保存的提示词、Skill 与当前选用状态

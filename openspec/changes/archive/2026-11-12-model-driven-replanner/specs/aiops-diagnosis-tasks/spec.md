## MODIFIED Requirements

### Requirement: Plan-Execute-Replan diagnostic graph

后端 SHALL 通过具有命名 `Planner`、`Executor`、`Replanner` 和 `Report` 节点的 LangGraph 工作流执行每个经过身份验证的 AIOps 诊断。`Replanner` SHALL 依据已落库的执行证据决定继续、调整计划或收敛到报告，并且该循环 MUST 保持有界。

#### Scenario: Diagnostic follows the graph lifecycle

- **WHEN** 已认证的 user 启动诊断任务
- **THEN** 后端 MUST 将任务保存为运行中，并在终端成功或失败前执行 Planner、Executor、Replanner 和 Report 节点。

#### Scenario: Replanner continues only when warranted

- **WHEN** Executor 返回需要其他限定诊断步骤的证据
- **THEN** Replanner MUST 调整计划并返回到 Executor；否则它 MUST 返回到 Report。

#### Scenario: Replanner revises the plan from recorded evidence

- **WHEN** Replanner 判定已落库证据表明剩余计划无法回答告警，且仍有重规划额度
- **THEN** Replanner MUST 产出替换剩余计划的新步骤并返回 Executor
- **AND** 新步骤 MUST 仅使用该用户已发现的 MCP 工具或本 tenant 的知识检索工具
- **AND** Replanner MUST 在步骤 payload 与 checkpoint 中记录决策、理由与决策来源

#### Scenario: Replanner stops with an explicit reason

- **WHEN** 已落库证据足以支撑结论
- **THEN** Replanner MUST 返回 Report
- **AND** MUST 在步骤 payload 中记录停止理由

#### Scenario: Replanning stays bounded

- **WHEN** 重规划轮数达到上限，或某次 Executor 步骤已失败
- **THEN** Replanner MUST 不再请求模型重新规划
- **AND** MUST 按确定性规则推进剩余计划或收敛到 Report

#### Scenario: Unusable model decision falls back safely

- **WHEN** 模型返回的决策无法解析、决策名非法，或 `revise` 未给出任何通过校验的步骤
- **THEN** Replanner MUST 使用确定性兜底决策继续流程
- **AND** MUST 将该轮决策来源标记为兜底，而不是模型决策

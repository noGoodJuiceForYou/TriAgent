# 任务

## 1. 实现有界重规划

- [x] 1.1 在 `AiopsDiagnosticState` 中新增 `available_tools` 与 `replan_count`，并由 Planner 写入已发现的工具清单。
- [x] 1.2 新增 `_ReplanDecision`、`MAX_REPLAN_ROUNDS`、`MAX_REPLAN_STEPS`，并抽出可复用的 `_validated_steps`。
- [x] 1.3 新增 `_validated_replan_decision`，校验决策名、理由与重规划步骤。
- [x] 1.4 新增 `_deterministic_replan_decision` 作为兜底推进逻辑。
- [x] 1.5 重写 `_replanner`：决策解析 → 计划替换或停止 → 记录步骤 payload 与 checkpoint 并联动 `replan_count`。
- [x] 1.6 新增 `_request_model_replan`，把已执行步骤、证据摘要、剩余计划与可用工具送入模型。

## 2. 测试

- [x] 2.1 覆盖 `revise` 决策解析，并验证未知工具被过滤、缺少步骤时判定为不可用。
- [x] 2.2 覆盖单轮步骤数上限与 `stop`、空/非空剩余计划的确定性兜底。
- [x] 2.3 覆盖「模型 revoke 计划 → 执行新步骤 → 模型停止 → 出报告」的完整链路，断言阶段顺序、`decisionSource` 与执行工具。
- [x] 2.4 覆盖模型返回不可用决策时回落到确定性推进。

## 3. 验证

- [x] 3.1 `uv run ruff check .` 通过。
- [x] 3.2 `uv run pyright` 通过。
- [x] 3.3 `uv run pytest` 通过，且失败集合与改动前一致。
- [x] 3.4 使用真实 LLM 跑通 `stop` 与 `revise` 两条重规划路径。

## 4. 文档

- [x] 4.1 更新 `aiops-diagnosis-tasks` 主规格中的 Replanner 场景，写明模型决策、有界轮数与兜底行为。
- [x] 4.2 同步 README 中智能运维的描述。

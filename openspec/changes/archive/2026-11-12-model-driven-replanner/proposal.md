# 让 Replanner 真正基于证据重规划

## Why

`openspec/specs/aiops-diagnosis-tasks/spec.md` 的 `Replanner continues only when warranted` 场景要求：当 Executor 返回需要补充诊断步骤的证据时，Replanner **必须调整计划**并回到 Executor；否则进入 Report。

而当前实现只是顺序推进计划指针：

```python
continue_execution = plan_index < len(plan) and not execution_failed
```

`_replanner` 内部没有任何模型调用，因此计划一旦生成就不会再变化。只要首轮计划执行完，即使证据明显不足以支撑结论，流程也会直接进入 Report。这使 Plan-Execute-**Replan** 名不副实，也无法在证据显示方向错误时改查其他工具。

## What Changes

- Replanner 每轮读取**已执行步骤、已落库证据摘要、剩余计划、可用工具**，调用模型返回三选一决策：`continue`、`revise`、`stop`。
- `revise` 时模型给出替换的新步骤，系统校验工具白名单、参数结构与非空后替换计划的剩余部分，并从当前索引继续执行。
- 增加有界约束：最多 `MAX_REPLAN_ROUNDS` 轮重规划，单轮最多 `MAX_REPLAN_STEPS` 个步骤。
- 模型输出不合法、调用失败、超出重规划上限或执行步骤已失败时，回落到原有的确定性推进逻辑，保证既有行为不被破坏。
- Replanner 在步骤 `payload` 中记录决策来源，便于前端与审计区分模型决策与兜底决策。

## Impact

- 受影响规格：`aiops-diagnosis-tasks`。
- 受影响代码：`apps/backend/src/triagent_ops/aiops/diagnostics.py`。
- 受影响测试：`apps/backend/tests/test_aiops_diagnostics.py`。
- 无 API 契约变更：`replanner` 步骤 `payload` 是内部结构，前端按执行链展示，不新增必填字段。
- 无数据模型或迁移变更：重规划次数与决策记录写入现有步骤 `payload` 与 checkpoint。

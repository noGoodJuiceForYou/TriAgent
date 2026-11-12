# 设计：基于证据的有界重规划

## 决策

Replanner 由一个「模型决策 + 确定性兜底」的组合构成，而不是把控制权整体交给模型。

理由：

- 诊断必须**有界**。纯模型驱动的循环在证据反复不足时可能无限扩展工具调用，既烧配额也可能让单次诊断超时。
- 兜底逻辑必须保留，否则模型输出异常会让整个诊断直接失败，而旧行为至少能保证「有计划就执行完、执行完就出报告」。
- 决策来源要可观察，否则出问题时无法区分「模型判断失误」还是「兜底路径」。

## 决策结构

```python
@dataclass(frozen=True, slots=True)
class _ReplanDecision:
    continue_execution: bool
    reason: str
    revised_steps: list[JsonDict]
```

模型被要求只返回 JSON：

```json
{"decision": "continue", "reason": "..."}
{"decision": "revise", "reason": "...", "steps": [{"id": "...", "tool": "...", "arguments": {}, "purpose": "..."}]}
{"decision": "stop", "reason": "..."}
```

## 判定顺序

1. **执行步骤已失败** → 直接收敛到 Report。不重试同类步骤，避免故障时反复调用同一工具。
2. **已达 `MAX_REPLAN_ROUNDS`** → 使用确定性推进，防止无界循环。
3. **调用模型**：
   - 输出无法解析、决策名非法、`revise` 但步骤全部被校验过滤 → 判定为不可用。
   - `continue` 但已无剩余步骤且未给出新步骤 → 判定为不可用。
   - 不可用时回落到确定性推进。
4. **应用决策**：
   - `revise`：`plan = plan[:plan_index] + revised_steps`，`plan_index` 保持不变，`replan_count + 1`。
   - `continue`：计划不变，`replan_count` 不变。
   - `stop`：进入 Report。

## 校验

复用 Planner 的步骤校验逻辑并抽出 `_validated_steps`：

- 工具必须属于该用户已发现的 MCP 工具集合或 `knowledge_retrieval`；未知工具静默丢弃，防止模型幻觉出不存在的能力。
- `arguments` 必须是对象；`id` 与 `purpose` 缺失时补默认值。
- 单轮步骤数截断到 `MAX_REPLAN_STEPS`。

## 可观察性

`replanner` 步骤的 `payload` 新增：

- `decisionSource`：`model` 或 `fallback`。
- `reason`：模型或兜底给出的判断理由。
- `replanCount`：本轮之前已使用的重规划轮数。
- `remainingSteps` / `revisedSteps` / `revisedPlanLength`：便于回放「模型看到了什么、改成了什么」。

checkpoint 与步骤 payload 保持同构，保证断线重连后能还原决策轨迹。

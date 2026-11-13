# QuantRiskPricingLatencyHigh 告警技术文档

> 量化风险定价链路 P99 延迟超出 2s SLO 的告警处置手册。

| 项目 | 内容 |
|---|---|
| 告警名称 | `QuantRiskPricingLatencyHigh` |
| 服务 | `quant-risk-service` |
| 命名空间 | `ecommerce-quant` |
| 严重级别 | `critical` |
| 责任团队 | `quant-platform` |
| 依赖服务 | 行情数据服务 `market-data-service` |
| 核心类 | `com.ecommerce.quant.risk.PricingEngine` |
| 核心指标 | `quant_pricing_latency` |
| SLO | 单次估值请求端到端 ≤ 2000 ms |
| SOP 标识 | `ecommerce-quant-pricing-latency-sop` |
| 环境 | `test`、`prod` |

---

## 1. 告警概述

`QuantRiskPricingLatencyHigh` 表示量化风险服务的**估值计算**在给定时间窗口内超出了 2 秒的响应 SLO。

该告警关注"报价算不出来"这一现象本身，而不是某一个具体故障。触发它的情况至少有三种：上游行情数据慢、定价执行器线程池被占满、风险缓存出现内存压力导致 GC 停顿。因此不要把告警名称当作根因结论，必须回到日志和指标里寻找证据。

判断顺序建议固定为：先确认影响面——多少请求受影响、是否仍在恶化；再定位瓶颈环节——行情拉取、计算执行、缓存；最后决定处置动作。诊断报告中的结论必须能对应到具体证据，不得基于告警名称直接推断根因。

## 2. 告警规则与触发条件

参考触发规则如下，实际阈值以 Prometheus 规则文件为准：

```promql
# 估值延迟 P99 连续 5 分钟超过 2s SLO
histogram_quantile(
  0.99,
  sum by (le, service) (
    rate(quant_pricing_latency_bucket{service="quant-risk-service"}[5m])
  )
) > 2
```

| 条件 | 取值 | 说明 |
|---|---|---|
| 统计指标 | P99 端到端耗时 | 包含行情拉取与定价计算 |
| 阈值 | 大于 2000 ms | 与 SLO 一致 |
| 持续时间 | 连续 5 分钟 | 避免单次抖动误报 |
| 评估间隔 | 1 分钟 | — |

告警标签 `sop` 指向 `ecommerce-quant-pricing-latency-sop`，用于把告警与本文档关联起来。

## 3. 业务影响评估

| 影响对象 | 表现形式 |
|---|---|
| 估值接口 | 报价返回超时或降级，调用方收到 5xx 或空报价 |
| 风控链路 | 估值缺失导致风险敞口计算延后，影响盘中断面刷新 |
| 交易决策 | 依赖实时估值的策略可能使用上一周期价格，产生偏差 |
| 组合场景 | 标的 `CSI300-202607` 等大额组合的估值耗时为全链路最长 |

按影响确定优先级：

- 全部估值请求超时：立即升级，按 P1 处理
- 部分标的超时且可降级返回：按 P2 处理，30 分钟内给出方向
- 仅个别请求抖动且已自动恢复：记录为观察项，不打断当前发布

## 4. 关键指标与证据清单

排查时优先采集以下证据，全部应带时间窗口与筛选条件：

| 证据类型 | 指标或字段 | 判读要点 |
|---|---|---|
| 延迟 | `quant_pricing_latency` 的 P50、P95、P99 | P99 升高但 P50 正常，通常是长尾依赖抖动；两者同时升高多为资源饱和 |
| 队列 | 定价执行器队列深度 | 持续超过阈值说明计算线程不足或单请求耗时变长 |
| 依赖 | 行情服务响应时间与错误率 | 错误率上升且延迟同步上升，优先怀疑上游 |
| 资源 | 堆内存、GC 停顿时间 | 停顿接近或超过 1 秒时，延迟大多由 GC 引起 |
| 错误码 | `TimeoutException`、`UpstreamUnavailable` | 决定是"算得慢"还是"拿不到数据" |

## 5. 日志事件字典

`quant-risk-service` 在告警窗口内的典型事件序列如下。检索日志时直接使用 `event` 字段过滤，比全文搜索更稳定。

| 事件 | 级别 | 含义 | 是否根因线索 |
|---|---|---|---|
| `quote_request_received` | INFO | 收到估值请求 | 否，用于确认流量基线 |
| `market_data_retry` | WARN | 行情请求失败后进入重试 | 是，上游抖动的第一信号 |
| `pricing_executor_saturated` | WARN | 定价执行器队列超过阈值 | 是，本地资源饱和 |
| `quote_calculation_timeout` | ERROR | 单次报价计算超时 | 是，直接对应告警现象 |
| `upstream_market_data_unavailable` | ERROR | 行情服务返回 503 | 是，外部依赖故障 |
| `risk_cache_memory_pressure` | WARN | 风险缓存出现内存压力 | 是，GC 相关诱因 |
| `quote_retry_succeeded` | INFO | 重试后以降级行情完成计算 | 否，说明降级链路可用 |
| `pricing_engine_recovered` | INFO | 执行器恢复到阈值以下 | 否，用于确认恢复 |

判读规则：

1. `market_data_retry` 出现在 `quote_calculation_timeout` **之前**，且同一 `trace_id` 内可见，优先定位上游。
2. `pricing_executor_saturated` 先于超时出现，且上游指标正常，优先定位本地线程池。
3. 只有 `upstream_market_data_unavailable` 与超时处于同一相关窗口时，才能把它作为依赖故障证据；跨窗口的孤立错误不算。
4. 出现 `pricing_engine_recovered` 说明已恢复，但仍需统计超时期间的受影响请求数，不能直接关闭告警。

## 6. 典型根因

按历史发生频率排序：

**一、上游行情数据抖动**

行情接口超时或返回 503，定价逻辑进入重试，单请求耗时从百毫秒级涨到 2 秒以上。特征是 `market_data_retry` 密集出现，且上游错误率同步升高。

**二、定价执行器饱和**

单请求变长后请求在队列中堆积，线程池无法及时消化，形成正反馈。特征是 `pricing_executor_saturated` 持续出现、队列深度单调上升，而上游延迟正常。

**三、风险缓存内存压力**

缓存条目膨胀引发频繁 Full GC，表现为周期性延迟尖峰而非持续高位。特征是 `risk_cache_memory_pressure` 与 GC 停顿时间同步上升。

**四、发布引起的配置变更**

超时时间、连接池大小或降级开关被调整后出现。需核对告警开始时间与最近一次发布、配置推送时间是否吻合。

## 7. 排查步骤

1. **确认告警上下文**：读取告警标签，核对服务、严重级别、命名空间与告警开始时间，避免处理到已结束的事件。
2. **划定时间窗口**：以告警开始时间为中心，前后各取 10 分钟作为检索范围。
3. **检索服务日志**：按 `service=quant-risk-service` 与时间窗口查询 CLS，再按 `trace_id` 与 `order_id` 分组，还原单个请求的完整链路。
4. **确认事件顺序**：对照第 5 节的事件字典，判断超时之前最后一个异常事件是什么。
5. **取指标佐证**：拉取同窗口的 `quant_pricing_latency` P99、执行器队列深度、上游响应时间与 GC 停顿，验证日志推断。
6. **判定瓶颈环节**：上游慢走处置一，执行器饱和走处置二，GC 停顿走处置三。
7. **评估影响面**：统计超时请求数与涉及标的，确认是否存在大额组合。

排查过程中的每条结论都要能指回一条证据，即一条日志事件、一段指标曲线或一条告警记录。不要把推测写进最终报告。

## 8. 处置与恢复

**处置一：上游行情异常**

1. 检查行情服务健康检查与响应延迟，确认是否整体不可用。
2. 若上游已确认故障，开启降级：使用上一周期收盘价计算估值，并在响应中标注 `degraded=true`。
3. 上游恢复后关闭降级，观察 10 分钟再判定恢复。

**处置二：执行器饱和**

1. 暂停或排队非紧急的批量估值任务，优先保障实时报价。
2. 确认是否存在单请求异常耗时，例如超大组合，必要时对标的做分批计算。
3. 长期方案是调整线程池与队列上限，需走变更流程，不在故障中直接改配置。

**处置三：内存压力**

1. 确认缓存条目数量与堆占用趋势。
2. 临时下调缓存 TTL 或按标的维度淘汰，缓解 GC 压力。
3. 若已进入 Full GC 循环，按预案重启实例，并保留堆快照用于复盘。

**通用禁令**：不要在故障中直接修改风险模型参数；不要把行情凭证、客户信息或交易明细写入日志、工单或诊断报告。

## 9. 验证与关闭

满足以下全部条件才可关闭告警：

- `quant_pricing_latency` P99 连续 15 分钟低于 2000 ms
- 执行器队列恢复到阈值以下，日志出现 `pricing_engine_recovered`
- 超时错误事件在最近 5 分钟内不再新增
- 降级开关已关闭，估值结果恢复正常精度

关闭时在诊断报告中记录：告警名称、`trace_id` 样本、观测到的最大延迟、根因结论、处置动作与恢复时间。

## 10. 升级路径

| 阶段 | 时限 | 动作 |
|---|---|---|
| 一级响应 | 发现后 5 分钟 | 值班同学确认影响面并启动排查 |
| 二级升级 | 15 分钟未定位 | 升级至 `quant-platform` 负责人 |
| 三级升级 | 30 分钟未恢复 | 升级至平台主管，评估是否降级或回滚 |

升级时必须同步：当前影响面、已排除的根因、已执行的处置动作。

## 11. 复盘要求

P1 事件需在 3 个工作日内完成复盘，包含：

1. 时间线：告警触发、发现、定位、恢复各时间点
2. 根因：基于证据的结论，区分直接原因与诱因
3. 影响：受影响请求数、标的范围、对外表现
4. 改进项：监控缺口、告警阈值合理性、降级链路有效性、应急预案可执行性
5. 遗留问题：未在本次修复中解决的问题及其负责人

## 12. 常见误判

| 误判 | 实际情况 |
|---|---|
| 看到 `upstream_market_data_unavailable` 就断定上游故障 | 该错误可能来自跨窗口的孤立请求，需与超时处于同一相关窗口 |
| 直接把告警名称当作根因 | 告警只描述现象，根因必须由日志与指标证据确定 |
| 出现 `pricing_engine_recovered` 就立即关闭 | 恢复不代表影响消失，仍需统计受影响请求数 |
| 认为扩容线程池就能解决 | 上游慢导致请求堆积时，扩容只会放大对上游的压力 |

## 附录 A：检索语句速查

```text
# 服务维度
service: "quant-risk-service" AND environment: "test"

# 只看超时事件
service: "quant-risk-service" AND event: "quote_calculation_timeout"

# 只看上游依赖异常
event: "upstream_market_data_unavailable" OR event: "market_data_retry"

# 本地资源饱和
event: "pricing_executor_saturated" OR event: "risk_cache_memory_pressure"

# 按链路追踪
trace_id: "<trace-id>"
```

## 附录 B：文档关系

- 本文档是 `QuantRiskPricingLatencyHigh` 的唯一处置手册，SOP 标识 `ecommerce-quant-pricing-latency-sop` 与该告警的 `sop` 标签一一对应。
- 场景构造与日志样例见 `docs/aiops/ecommerce-aiops-fixture.md`。
- 告警发布脚本与日志上传脚本分别见 `apps/backend/scripts/publish_ecommerce_quant_alert.py` 与 `apps/backend/scripts/generate_and_upload_cls_logs.py`。

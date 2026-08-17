# TASK-SLICE-198

任务类型：
- `TASK-SLICE`

功能条线：
- `LINE-PRE-STAGE-2-3-PRESENTATION`（Active；Planned）

目标机制/切片：
- `M-015`、`M-041`、`M-049`、`M-052`、`VS-069`

规模预算：
- 主工作包：2
- 预计上下文压缩：0
- 独立验收批次：2

拆分触发：
- 若 P1/P2 需要不同恢复源/根实现，或技能 HUD 接入要求同时修改绑定/冷却业务 owner，立即拆 task；本 task 只做可见原生投影。

协作计划：
- 模式：单 agent
- 并行工作包：无
- 写入 owner：主 agent
- 归并检查点：验收前
- 方法观测：无

输入资料：
- 197 战斗技能 HUD 显示列表/verified manifest/基准、当前 `Stage1CombatHudSystem/Bridge`、skill snapshot 和图标资源 owner。

输出产物：
- 正式五关 HUD 中 P1/P2 五槽技能的原生图标/键位/空槽/状态投影，运行直接消费 197 真值。
- 五角色、单/双人、空槽/已绑定、进关/返回/重试的可见差异与零重复层证据。

UI 原生化合同：
- 显示列表清单：只消费 197 冻结的 HUD 根/五槽/图标/键位/状态 child/depth/矩阵，不复制坐标。
- 原版机器真值 JSON：运行断言 197 truthId/status/状态集/完整性，view 直接消费或消费可重复生成投影。
- 原版视觉基准：使用 197 的 940×590、五角色、P1/P2 基准。
- 允许的现代视觉例外：空清单。
- 逐状态验收：五角色、P1/P2、空槽/已绑定、可用/不可用的纯视觉子集、进关/返回/重试。
- 差异证据：并排/叠图、几何/边缘/对象差异和零重复 HUD 层。

完成定义：
- 战斗 HUD 稳定可见显示当前角色五槽技能的原生视觉，P1/P2 不串号，不用文本技能名/矩形占位。

验收标准：
- skill HUD truth/HUD/五关/P1-P2 专项、全系统、build、structure、annotations、workflow、diff check 和 940×590 零 console 通过。

禁止范围：
- 不实现 MP/冷却/绑定实时联动，不改 183 功能页、技能规则或存档。

状态更新：
- 更新 HUD/技能索引、机制/切片状态、本线台账、task-board/history 与适用 PG 反馈。

推荐后续任务：
- `TASK-SLICE-199`

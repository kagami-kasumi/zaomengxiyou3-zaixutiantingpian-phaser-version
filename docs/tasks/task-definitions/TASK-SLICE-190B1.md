# TASK-SLICE-190B1

任务类型：
- `TASK-SLICE`

功能条线：
- `LINE-PRE-STAGE-2-3-PRESENTATION`（Active；Ready）

目标机制/切片：
- `M-036`、`M-037`、`M-052`、`VS-066`

规模预算：
- 主工作包：2
- 预计上下文压缩：0
- 独立验收批次：2

拆分触发：
- 若强化页需要修改装备事务/存档 schema，或 tooltip 不能复用 190A 的只读投影接缝，立即拆同线任务。

协作计划：
- 模式：单 agent
- 并行工作包：无
- 写入 owner：主 agent
- 归并检查点：实现前、验收前
- 方法观测：无

输入资料：
- 189 证据/manifest、190A 投影接缝、`task-settings-167-workshop-strength` 与当前强化 session/view。

输出产物：
- 强化页共享右侧装备 grid 与目标槽 hover；石、幸运符、神恩符保持非装备排除。
- P1/P2、放入/取回、成功/失败/拒绝、返回后零残留的专项和 940×590 差异证据。

UI 原生化合同：
- 显示列表清单：tooltip 使用 189；强化页只使用 167 strength 显示列表、槽位、depth 与 hit area。
- 原版机器真值 JSON：直接消费 `task-settings-189.equipment-tooltip` 与 `task-settings-167-workshop-strength`，运行断言 verified/unresolved=[]。
- 原版视觉基准：189 source-replay + 167 强化页 940×590 基准。
- 允许的现代视觉例外：空清单。
- 逐状态验收：normal/hover/out、目标放入/取回、成功/失败/拒绝、P1/P2、返回/重开。
- 差异证据：强化页单独并排/叠图/对象差异与字体容差。

组件化合同：
- 组件家族：190A 已试点的装备 tooltip 行为/只读 view-model。
- 权威 owner：`EquipmentCatalog` + 当前 `EquipmentInstance`；强化 session 只持事务引用。
- 共享行为：hover、边缘定位、实例刷新、销毁。
- 页面保留项：强化 119/198 与 strength truth 的原皮肤/几何/层级。
- 消费者迁移矩阵：本 task 只迁移强化页与其共享右 grid。
- 防复发门禁：禁止强化页私有属性拼装、第二坐标源和非装备 tooltip 扩张。

完成定义：
- 强化页所有装备位置显示同一实例的原字段/格式，事务刷新无陈旧面板且无第二 owner。

验收标准：
- tooltip/strength/formal-workshop 专项、全系统、build、structure、annotations、workflow、diff check 与 940×590 零 console。

禁止范围：
- 不进入熔合/分解/打造/商城，不修改装备数值、事务或存档。

状态更新：
- 更新覆盖台账、机制/切片、task-board/history 与适用 PG 反馈。

推荐后续任务：
- `TASK-SLICE-190B2`

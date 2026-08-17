# TASK-SLICE-190B2

任务类型：
- `TASK-SLICE`

功能条线：
- `LINE-PRE-STAGE-2-3-PRESENTATION`（Active；Planned）

目标机制/切片：
- `M-036`、`M-037`、`M-052`、`VS-066`

规模预算：
- 主工作包：2
- 预计上下文压缩：0
- 独立验收批次：2

拆分触发：
- 若熔合 preview 与正式产物不是同一可证明实例字段模型，先拆补证任务，不在本 task 猜值。

协作计划：
- 模式：单 agent
- 并行工作包：无
- 写入 owner：主 agent
- 归并检查点：实现前、验收前
- 方法观测：无

输入资料：
- 189/190A/190B1 接缝、`task-settings-167-workshop-fusion`、当前 crafting session/view。

输出产物：
- 熔合页共享 grid、装备材料、预览与成功产物 hover；基础随机/继承 `baseStatsOverride` 与强化后缀保持同源。

UI 原生化合同：
- 显示列表清单：189 tooltip + 167 fusion 材料/preview/produce 父子链。
- 原版机器真值 JSON：直接消费两个 verified manifest，禁止复制 bounds。
- 原版视觉基准：189 source-replay + 167 fusion 940×590 基准。
- 允许的现代视觉例外：空清单。
- 逐状态验收：空/材料/preview/成功/拒绝/返还、hover/out、P1/P2、返回。
- 差异证据：熔合页独立并排/叠图/对象差异。

组件化合同：
- 组件家族：装备 tooltip 只读 view-model。
- 权威 owner：crafting session 的实例引用与 product result；属性来自 catalog/instance。
- 共享行为：hover、边缘定位、事务后刷新与销毁。
- 页面保留项：fusion 原 Symbol、槽、preview/produce 几何和皮肤。
- 消费者迁移矩阵：本 task 只迁移熔合页与其共享 right grid。
- 防复发门禁：禁止 preview 私有数值复制、截图裁片或第二 tooltip 坐标。

完成定义：
- 熔合装备材料/预览/产物显示权威实例值，成功/返还/返回后无陈旧 tooltip。

验收标准：
- tooltip/fusion/formal-workshop 专项、全系统、build、structure、annotations、workflow、diff check 与 940×590 零 console。

禁止范围：
- 不进入强化、分解、打造或商城，不改变配方/随机/事务/存档。

状态更新：
- 更新覆盖台账、机制/切片、task-board/history 与适用 PG 反馈。

推荐后续任务：
- `TASK-SLICE-190B3`

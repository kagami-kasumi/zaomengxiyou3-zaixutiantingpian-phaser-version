# TASK-SLICE-190B3

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
- 若分解结果出现装备实例而非 189 已确认的非装备材料，先回写消费者矩阵并拆补证任务。

协作计划：
- 模式：单 agent
- 并行工作包：无
- 写入 owner：主 agent
- 归并检查点：实现前、验收前
- 方法观测：无

输入资料：
- 189 与先前 tooltip 接缝、`task-settings-167-workshop-resolution`、当前 resolution session/view。

输出产物：
- 分解页共享 grid 与目标装备 hover；六个结果材料保持非装备排除。

UI 原生化合同：
- 显示列表清单：189 tooltip + 167 resolution material/resu 父子链。
- 原版机器真值 JSON：直接消费两个 verified manifest。
- 原版视觉基准：189 source-replay + 167 resolution 940×590 基准。
- 允许的现代视觉例外：空清单。
- 逐状态验收：空/目标/拒绝/成功/结果、hover/out、P1/P2、返回。
- 差异证据：分解页独立并排/叠图/对象差异。

组件化合同：
- 组件家族：装备 tooltip 只读 view-model。
- 权威 owner：resolution target 实例；结果材料不是本组件消费者。
- 共享行为：hover、定位、事务后销毁。
- 页面保留项：resolution 原皮肤、目标/结果槽几何与层级。
- 消费者迁移矩阵：本 task 只迁移分解页与其共享 right grid。
- 防复发门禁：禁止给非装备结果扩张本 task tooltip 或复制数值源。

完成定义：
- 分解目标装备显示原字段/实例值，成功、拒绝、返还和返回后零残留。

验收标准：
- tooltip/resolution/formal-workshop 专项、全系统、build、structure、annotations、workflow、diff check 与 940×590 零 console。

禁止范围：
- 不进入打造/商城，不修改分解概率、产物、事务或存档。

状态更新：
- 更新覆盖台账、机制/切片、task-board/history 与适用 PG 反馈。

推荐后续任务：
- `TASK-SLICE-190B4`

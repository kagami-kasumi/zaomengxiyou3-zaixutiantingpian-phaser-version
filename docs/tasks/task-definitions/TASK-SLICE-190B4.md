# TASK-SLICE-190B4

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
- 若商城 49 商品集合新增 `zblist` 装备正向消费者，立即拆独立商城 task；当前只验证时装禁用与非装备排除。

协作计划：
- 模式：单 agent
- 并行工作包：无
- 写入 owner：主 agent
- 归并检查点：实现前、验收前
- 方法观测：无

输入资料：
- 189 与先前 tooltip 接缝、`task-settings-167-workshop-making`、175F 商城真值、当前 making session/view 和商城 49 项集合。

输出产物：
- 打造页共享 grid 与最终装备产物 hover；书/材料/宝石排除。
- 消费者闭合审计：商城时装保持原版无 hover，其他商品不因装备范围获得 tooltip；随后归档 Split 父任务 190B。

UI 原生化合同：
- 显示列表清单：189 tooltip + 167 making；商城负态只引用 175F/ShopThing 祖先门禁。
- 原版机器真值 JSON：直接消费 189/167-making，商城断言 175F 商品集合与 `shop-fashion-disabled` 状态。
- 原版视觉基准：189 source-replay + making/商城各自 940×590 基准。
- 允许的现代视觉例外：空清单。
- 逐状态验收：打造空/书/材料/宝石/产物/拒绝/成功/返回；商城时装 hover 不出现面板。
- 差异证据：打造页独立并排/叠图；商城负态对象差异。

组件化合同：
- 组件家族：装备 tooltip 只读 view-model。
- 权威 owner：making lastProduct 实例与现有 catalog/instance。
- 共享行为：hover、定位、事务刷新、销毁。
- 页面保留项：making 原皮肤/槽/产物几何；商城皮肤不迁移。
- 消费者迁移矩阵：完成打造正向项并双向搜索所有 189 消费者；商城只做负回归。
- 防复发门禁：禁止非装备 tooltip 扩张、商城时装回填、页面私有属性或第二坐标源。

完成定义：
- 打造装备产物正确 hover，商城负合同保持，189 全消费者矩阵无漏项；B1..B4 完成后归档 190B。

验收标准：
- tooltip/making/shop-negative 专项、全系统、build、structure、annotations、workflow、diff check 与 940×590 零 console。

禁止范围：
- 不实现非装备物品 tooltip，不改变打造/商城事务、价格、存档或页面皮肤。

状态更新：
- 更新覆盖台账、机制/切片、task-board/history，归档 Split 父任务 190B 与适用 PG 反馈。

推荐后续任务：
- `TASK-SETTINGS-191`

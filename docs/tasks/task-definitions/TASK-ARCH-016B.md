# TASK-ARCH-016B

任务类型：

- `TASK-ARCH`

功能条线：

- `LINE-PRE-STAGE-2-3-COMPLETION`（Active，当前为 Planned）


目标机制/切片：

- `M-014`、`M-026`、`M-027`、`M-029`、`M-035`、`M-044`、`VS-065`、`PG-013`

规模预算：

- 主工作包：2
- 预计上下文压缩：0
- 独立验收批次：2

拆分触发：

- 若公共 Runtime 与 TransferDoorView 不能分别验收，或 Stage 1-2/1-3 暴露第三种未登记运行 owner，拆为 016B1/016B2，不扩入 Stage 2。

输入资料：

- 016A 合同/矩阵、Stage 1-2/1-3 现有实现、level12/13 门 Symbol/动画与各关既有自动/视觉基线。

输出产物：

- 公共 Runtime 首版、Definition 校验、TransferDoorView/VisualDefinition、兼容 adapter。
- Stage 1-2/1-3 迁移，删除对应同义 Scene/门/结果/保存/销毁 owner。

完成定义：

- 两关消费同一公共 Runtime 和门组件，波次、特殊 `fbEnter`、解锁/路由与表现不变。
- 公共框架不拥有两关专属波次、Boss、机关或实体内部规则。

UI 原生化合同：

- 显示列表清单：消费 016A 的两关地面/场景/门/HUD/结果清单，保持原层级、矩阵和命中区。
- 原版视觉基准：level12 character 52/48/51、level13 character 40/36/39 与既有 940×590 基线。
- 允许的现代视觉例外：只保留 016A 已登记项，不统一两关不同皮肤为新现代外观。
- 逐状态验收：门 hidden/show/animated/overlap/W或上键、fbEnter、失败、胜利、下一关/重试/返回。
- 差异证据：两关迁移前后并排/叠图、可见对象清单和 console。

组件化合同：

- 组件家族：PlayableLevelRuntime 与 TransferDoorView。
- 权威 owner：Runtime 统一共同流程，Flow/Encounter 保留关卡内容，VisualDefinition 只定义视觉。
- 共享行为：两关初始化、交互门、生命周期、结果、保存、路由和销毁。
- 页面保留项：1-2 fbEnter、各自场景/门 Symbol、波次/Boss 和布局。
- 消费者迁移矩阵：完成 1-2/1-3 两行，Stage 2 与 1-1 保持待迁移。
- 防复发门禁：两关不得恢复私有共同 Runtime 或直接控制结果/保存；门视觉状态只有一个组件 owner。

验收标准：

- 专项、两关 flow/资源/旅程、全系统、structure、build、workflow、diff check；940×590 两关门/结果/返回零 console。

禁止范围：

- 不迁移 Stage 2/1-1，不改关卡数值、波次、怪物、机关、存档 schema 或原版视觉。

状态更新：

- 更新 PG-013、M-014/M-026/M-027/M-029、VS-065、task-board/task-history 与本线覆盖；激活 016C。

推荐后续任务：

- `TASK-ARCH-016C`。

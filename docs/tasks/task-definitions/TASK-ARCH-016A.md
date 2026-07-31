# TASK-ARCH-016A

任务类型：

- `TASK-ARCH`

功能条线：

- `LINE-PRE-STAGE-2-3-COMPLETION`（Active，当前为 Ready）


目标机制/切片：

- `M-014`、`M-026`、`M-027`、`M-029`、`VS-065`、`PG-013`

规模预算：

- 主工作包：2
- 预计上下文压缩：0
- 独立验收批次：1

拆分触发：

- 若五关消费者审计之外还需读取新的关卡资源族或直接迁移运行时代码，停止并留给 016B；本 task 不实施消费者迁移。

输入资料：

- PG-013 证据、五关 Scene/World/Gameplay/Flow/Layout、公共生命周期/结果/移动/战斗/奖励/HUD、原版公共门登记/碰撞与各关差异，以及 Stage 1-1 借用 Stage 1-3 门静态图并由 `stage-1-common` 临时补齐依赖的兼容路径。

输出产物：

- `PlayableLevelRuntime`、`LevelDefinition`、`LevelWorldAdapter`、`LevelEncounter`、`TransferDoorVisualDefinition` 的 ADR/边界合同。
- 五关逐职责消费者矩阵、权威 owner、页面/关卡保留项、迁移顺序、兼容 facade 和静态防回填检查。
- 临时兼容删除条件：016D 接入 Stage 1-1 character 45/41/44 后删除跨关 `Stage13AssetKeys.transferDoor` 引用及其公共 bundle 兼容。

完成定义：

- 队伍、镜头、玩家、HUD、移动/战斗调度、失败、出口、结果、保存、路由和销毁均有唯一目标 owner。
- 地形/遭遇/机关/特殊入口与英雄/怪物内部规则的边界可执行，未把原 SWF 打包位置误当现代 owner。
- 016B..D 的迁移输入无未决架构分歧。

UI 原生化合同：

- 显示列表清单：冻结五关 floor/background/foreground/door/HUD/result 的根、层级、矩阵、动态 child、命中区和资源 provenance。
- 原版视觉基准：沿用各关已闭合 940×590 原 SWF/现代对照；1-1 门回溯 level11 character 45/41/44。
- 允许的现代视觉例外：只登记既有获批差异；审计 task 不新增可见替代层。
- 逐状态验收：定义进入、战斗、Boss/波次、门隐藏/显示/交互、失败、结果、重试、返回的迁移状态矩阵。
- 差异证据：每关列出迁移前基线、必须保持对象和允许差异，供 016B..D 对照。

组件化合同：

- 组件家族：PlayableLevelRuntime、TransferDoorView 与关卡 Scene/World/Gameplay adapter。
- 权威 owner：公共 Runtime 持有共同生命周期；关卡定义/遭遇持有内容差异；实体系统持有英雄/怪物内部规则。
- 共享行为：初始化、队伍/玩家、镜头、HUD、调度、失败、出口、结果、保存、路由和销毁。
- 页面保留项：各关地形、矩阵、波次、Boss、机关、特殊入口、原始 Symbol/动画皮肤。
- 消费者迁移矩阵：Stage 1-1/1-2/1-3/2-1/2-2 每个职责逐项标记 owner、重复点、迁移 task 和测试。
- 防复发门禁：禁止新增同义 Scene 生命周期、私有门/结果/保存 owner，以及关卡内英雄/怪物内部算法。

验收标准：

- 架构文档、消费者矩阵和静态检查自身测试通过；运行 `check:workflow` 与 `git diff --check`。

禁止范围：

- 不修改运行时代码、视觉资源、关卡内容或存档 schema；不提前宣称 PG-013 已治理。

状态更新：

- 更新 PG-013、M-026/M-029、VS-065、task-board/task-history 与本线覆盖；激活 016B。

推荐后续任务：

- `TASK-ARCH-016B`。

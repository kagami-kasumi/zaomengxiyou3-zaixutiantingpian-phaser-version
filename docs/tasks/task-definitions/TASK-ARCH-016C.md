# TASK-ARCH-016C

任务类型：

- `TASK-ARCH`

功能条线：

- `LINE-PRE-STAGE-2-3-COMPLETION`（Active，当前为 Planned）


目标机制/切片：

- `M-014`、`M-026`、`M-027`、`M-029`、`M-035`、`M-044`、`VS-065`、`PG-013`

规模预算：

- 主工作包：1
- 预计上下文压缩：0
- 独立验收批次：2

拆分触发：

- 若冰刺与火焰/Monster16 需要改变公共合同而非窄 adapter，先回写 016A 合同并拆为 2-1、2-2 两个 task。

输入资料：

- 016A/B 合同与试点、Stage 2-1/2-2 Scene/World/Gameplay/Flow、机关/怪物/结果现有证据和回归。

输出产物：

- Stage 2-1/2-2 LevelDefinition、Encounter 与冰刺/火焰/QA 窄 adapter；删除两关同义共同 Runtime owner。

完成定义：

- 两个 Stage 2 关卡消费公共 Runtime/门/结果/保存；专属机关与 Boss 仍由专属系统拥有。
- QA 路径不能成为正式 Runtime 分叉，既有 1P/2P 与 2-3 解锁语义不变。

UI 原生化合同：

- 显示列表清单：消费 016A 的 Stage 2 场景、门、机关、HUD、结果清单。
- 原版视觉基准：沿用 Stage 2-1/2-2 已闭合原 SWF 与 940×590 基线。
- 允许的现代视觉例外：只保留已登记 Stage 2 差异，不因框架迁移新增可见层。
- 逐状态验收：冰刺/火焰、Boss、门 hidden/show/interaction、失败、胜利、返回/重试、QA/正式隔离。
- 差异证据：迁移前后并排/叠图、机关/门逐状态与 console。

组件化合同：

- 组件家族：PlayableLevelRuntime、TransferDoorView 与 Stage 2 adapter。
- 权威 owner：公共 Runtime 统一共同流程；冰刺/火焰/Monster16 保持专属 owner。
- 共享行为：Stage 2 初始化、玩家/镜头/HUD、生命周期、结果/保存/路由和销毁。
- 页面保留项：2-1 冰刺、2-2 火焰/Monster16、各自布局/视觉/QA 配置。
- 消费者迁移矩阵：完成 2-1/2-2 两行，1-1 保持待迁移。
- 防复发门禁：Stage 2 不得恢复共同流程副本或把机关/怪物算法塞入 Runtime。

验收标准：

- Stage 2 专项、全系统、structure、build、workflow、diff check；940×590 两关正式/QA 代表旅程零 console。

禁止范围：

- 不迁移 1-1/TestScene，不改机关/怪物算法、资源、数值、门条件或存档 schema。

状态更新：

- 更新 PG-013、相关机制/切片、task-board/task-history 与本线覆盖；激活 016D。

推荐后续任务：

- `TASK-ARCH-016D`。

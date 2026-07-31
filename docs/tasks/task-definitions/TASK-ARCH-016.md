# TASK-ARCH-016

任务类型：

- `TASK-ARCH`（Split 父任务）

功能条线：

- `LINE-PRE-STAGE-2-3-COMPLETION`（Active）


目标机制/切片：

- `M-014`、`M-026`、`M-027`、`M-029`、`M-035`、`M-044`、`VS-065`、`PG-013`

规模预算：

- 主工作包：0
- 预计上下文压缩：0
- 独立验收批次：0

拆分触发：

- 已固定拆为合同审计、横向双关试点、Stage 2 迁移、Stage 1-1/TestScene 收束；父任务不得直接执行。

输入资料：

- `PG-013`、`设计模式.md`、`src-boundaries.md`、`levels-index.md`、原版 `PhysicsWorld/BaseHero/StageListener*` 与五关现代 Scene/World/Gameplay/Flow/资源/测试。

输出产物：

- 组合式公共可玩关卡框架、关卡定义/遭遇/视觉边界、五关迁移、静态防回填与后续关卡默认模板。

完成定义：

- `016A..D` 全部归档；五关公共职责只有一个 Runtime owner，关卡只保留定义、遭遇与有证据的窄 adapter。
- 关卡不承载英雄/怪物动画、AI、物理、伤害或奖励内部规则；PG-013 具备存量关闭证据与未来关卡观察入口。

验收标准：

- 以各子 task 的自动、架构、运行和视觉验收全集为准；父任务只在全部子 task 完成后收束。

禁止范围：

- 不建立万能 `BaseLevel`，不一次性重写五关，不改变原版关卡内容、数值、手感和可见表现。

状态更新：

- 子 task 完成后更新 M-014/M-026/M-027/M-029、VS-065、本线覆盖、task-board/task-history 与 PG-013。

推荐后续任务：

- `TASK-ARCH-016A`。

# TASK-SETTINGS-069

任务类型：

- `TASK-SETTINGS`（Split 父任务，不直接执行）

功能条线：

- `LINE-PRE-STAGE-2-3-COMPLETION`（Active）


目标机制/切片：

- `M-018..M-025`、`M-034`、`M-035`、`M-047`、`M-049`、`VS-062`

规模预算：

- 主工作包：0；父任务只聚合子任务
- 预计上下文压缩：0
- 独立验收批次：0

拆分触发：

- 已触发：资源分散在角色本体、`Role1Effect`、`SpecialUI/*` 和独立武器包；固定按 `TASK-SETTINGS-069A..E` 调查，禁止恢复为五角色一次逆向。

输入资料：

- `reverse-engineering-protocol.md`、角色/技能/弹体/普攻资源索引、正式 HUD 索引、恢复角色与技能源 SWF、Role1..5 及实际附属对象 AS3。

输出产物：

- `hero-combat-visuals-index.md` 的共享矩阵/显示列表/六段证据模板；`069A..E` 与 `158A..E` 的独立合同。

完成定义：

- 全部 `069A..E` 归档并汇总五角色矩阵；行为已实现与视觉已完成分开记录。

UI 原生化合同：

- 显示列表清单：角色战斗 UI/头顶动态层、HUD 槽与状态对象的父子、depth、矩阵、文字、按钮/动态图层和命中区。
- 原版视觉基准：五角色单人，至少一个合法双人组合，普攻与每个已实现技能的关键状态帧。
- 允许的现代视觉例外：空清单；证据缺失项保持阻塞，除非用户另行批准。
- 逐状态验收：idle/run/jump/attack/hit/death、技能起手/持续/命中/结束、朝向、P1/P2 与 HUD 更新。
- 差异证据：关键帧并排/叠图、对象/帧序/原点差异和容差。

验收标准：

- 恢复源与 AS3 交叉确认；`check:annotations`、`check:workflow`、`git diff --check` 通过。

禁止范围：

- 不一次实现五角色，不以占位 projectile 或状态文字替代真动画，不扩大到宠物动画。

状态更新：

- 更新角色机制、M-034/M-035/M-047/M-049、VS-062、本线覆盖、资源标注、task-board/task-history 与适用 PG 反馈。

推荐后续任务：

- 执行 `TASK-SETTINGS-069A`，完成 Role1 逐动作/逐技能证据后再执行 `TASK-SLICE-158A`。

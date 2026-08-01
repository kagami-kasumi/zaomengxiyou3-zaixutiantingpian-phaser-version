# TASK-SETTINGS-069B

任务类型：

- `TASK-SETTINGS`

功能条线：

- `LINE-PRE-STAGE-2-3-COMPLETION`（Active，当前为 Ready）

目标机制/切片：

- `M-019`、`M-023..M-025`、`M-034`、`M-035`、`M-047`、`M-049`、`VS-062`

规模预算：

- 主工作包：2
- 预计上下文压缩：0
- 独立验收批次：2

拆分触发：

- 若 TangSeng 本体、Shadow 或 SpecialUI 不能共同验收，只拆 Role2 内部范围；不得进入 Role3 或实现。

输入资料：

- 父索引、`Role2.as/Role2Shadow.as`、Role2 技能/弹体索引、`TangSeng/TangSeng1/SpecialUI` 恢复包、标注与现代消费者。

输出产物：

- Role2 本体、战斗 UI、普攻、全部已实现技能、Shadow 与附属对象矩阵；三个包的精确职责与 `158B` 输入。

完成定义：

- 六段证据、Symbol/帧/几何/触发/生命周期和标注无影响实现的未知。

UI 原生化合同：

- 显示列表清单：本体/Shadow、头顶状态、HUD 与五槽的 parent/depth/矩阵/文字/按钮/命中区。
- 原版视觉基准：940×590 Role2 单人和合法双人组合的本体及全部技能关键状态。
- 允许的现代视觉例外：空清单。
- 逐状态验收：idle/run/jump/attack/hit/death、技能全生命周期、方向、P1/P2、HUD。
- 差异证据：并排/叠图计划与对象/帧序/原点差异。

验收标准：

- `check:annotations`、`check:workflow`、`git diff --check` 通过。

禁止范围：

- 不实现动画，不跨角色或宠物，不把行为测试当视觉证据。

状态更新：

- 更新 M-019/M-034/M-047、VS-062、本线覆盖、标注、看板与 PG 反馈。

推荐后续任务：

- `TASK-SLICE-158B`。

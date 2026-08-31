# TASK-SLICE-212

任务类型：
- `TASK-SLICE`

功能条线：
- `LINE-PRE-STAGE-2-3-PRESENTATION`（Active；Planned）

执行前置：
- `TASK-SETTINGS-211` 已 verified；`TASK-SLICE-210` 已让马系与猴系都具备正式宠物命中/扣血链。

目标机制/切片：
- `M-032`、`M-035`、`M-049`、`M-053`、`VS-071`

规模预算：
- 主工作包：2
- 预计上下文压缩：0
- 独立验收批次：2

拆分触发：
- 若接入要求同时重构怪物架构、重写各攻击伤害公式、扩到玩家/宠物受伤数字或治疗/回蓝反馈，立即拆后续 task；本 task 只建立成功怪物伤害的共享反馈闭环。

协作计划：
- 模式：单 agent
- 并行工作包：无
- 写入 owner：主 agent
- 归并检查点：共享事件合同落地后、验收前
- 方法观测：无

输入资料：
- 211 的 `combat-hit-feedback-index.md`、verified manifest、940×590 基准与同集合同。
- 209/210 马系、207/208A 猴系的 verified hit/source owner 合同，当前英雄、宠物、法宝 `DamageEvent` producer 和五关正式 Runtime/怪物 visual/HUD/result 消费者。

输出产物：
- 统一 `CombatFeedbackEvent`：只由成功伤害结算按实际 HP delta 派生，携带稳定事件 id、来源/owner、目标、暴击与 211 需要的世界锚点；不复制或重算伤害公式。
- 五关正式怪物共享消费同一反馈：source-agnostic hurt/HP 可见反馈、原版普通/暴击伤害数字和命中后清理；Role、猴系、马系与法宝不再各自旁路。
- 按 211 原版合同接入连击累计、显示、超时清零和最高连击，并让结果页读取实际最高连击，移除“无 producer 固定 0”的现代例外。
- 来源隔离 trace 与负场景：Role/猴/马/法宝、P1/P2、普通/暴击、同时命中、miss、0 伤害、重复 attack id、dead target、返回/重试/重载；每个可见数字都能反查唯一实际 HP decrease。

UI 原生化合同：
- 显示列表清单：直接消费 211 冻结的伤害数字与连击对象/父子链/depth/矩阵/锚点/生命周期，不复制坐标或建立现代可见覆盖层。
- 原版机器真值 JSON：运行时断言 211 truthId/status/状态集/完整性，view 直接消费或消费可重复生成的投影。
- 原版视觉基准：使用 211 的 940×590、来源/暴击/位数/连击/P1-P2/时间点基准。
- 允许的现代视觉例外：稳定事件 id 与同帧确定性排序；只影响内部去重，不改变玩家可见时序和数值。
- 逐状态验收：Role/猴/马/法宝、普通/暴击、个位/多位/多击、hurt/dead、2/9/10/99/100 连击、超时清零、P1/P2、五关、返回/重试/重载。
- 差异证据：逐帧并排/叠图、对象/几何/字形/时间线差异，以及“可见事件 ↔ DamageEvent ↔ HP delta”一一对应 trace。

完成定义：
- 玩家能从怪物 hurt/HP、伤害数字和连击面板明确判断每次 Role/宠物/法宝攻击是否实际命中；攻击动画不能在无 HP decrease 时制造命中反馈。

验收标准：
- 211 truth、战斗反馈/英雄/宠物/法宝/五关怪物/HUD/结果页专项，source-isolated trace 与关键 mutation-kill、全系统、build、structure、annotations、workflow、problem audit、diff check 和 940×590 正式 P1/P2 零 console 通过。

禁止范围：
- 不改攻击伤害数值、攻击范围、技能选择、怪物 AI/架构、存档 schema；不加入玩家/宠物受伤数字、治疗/回蓝数字或无原版证据的震屏/粒子。

状态更新：
- 更新战斗反馈索引、机制/切片、本线覆盖台账、task-board/history、结果页现代例外与适用 PG 反馈；完成后按第二家族裁决继续生成下一完整宠物家族，全部家族完成后才进入 `TASK-SLICE-194`。

推荐后续任务：
- 依据 209/210 的第二家族裁决和经验证 `$pet-family-reverse` 生成下一完整宠物家族；九家族全部完成后执行 `TASK-SLICE-194`。

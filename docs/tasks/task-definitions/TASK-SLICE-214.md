# TASK-SLICE-214

任务类型：
- `TASK-SLICE`

任务模型：
- `常规任务`

逆向子类型：
- 不适用

逆向方案：
- 不适用

功能条线：
- `LINE-PRE-STAGE-2-3-PRESENTATION`（Active；Planned，等待 213 verified）

目标机制/切片：
- `M-032`、`M-034`、`M-035`、`M-042`、`M-044`、`VS-067`

规模预算：
- 主工作包：2
- 预计上下文压缩：0
- 独立验收批次：2

拆分触发：
- 若 213 留下实现影响 unresolved、需要改变存档 schema/公共宠物设计、引入第二宠物家族或新增独立正式旅程，先拆同线解除项；不得用现代猜测补证据。

协作计划：
- 模式：单 agent
- 并行工作包：无
- 写入 owner：主 agent
- 归并检查点：共享 Runtime/命中链完成后、正式运行验收前
- 方法观测：`MO-003`（只记录第三家族实施差异）

输入资料：
- 213 的 verified manifest、family evidence、逐状态原版基准、字段级 handoff verifier 与完整 acceptance matrix。
- `docs/architecture/system-designs/pet.md`、当前 `PetCombatRuntime`、Dragon Behavior/技能、Projectile/Stage1 damage、统一 `CombatFeedbackEvent`、TestScene 与正式五关消费者。

输出产物：
- dragon1..4 共用公共 `PetCombatRuntime`，从各自 verified 范围外追击到真普通攻击；`fs/sdcc/ltwj/qlaoyi` 及继承组合以 action token 驱动真实 effect/projectile、collision/tracking、hit frame、pet-source damage/heal 与 cleanup。
- 原版本体/分身/技能对象直接消费 213 真值；正式 P1/P2 与 TestScene 使用同一 Runtime/source snapshots，无第二 visual owner 或场景技能直连。
- source-isolated 黑盒 trace：frame/time、owner/runtime key、宠物/目标坐标与距离、action/token、projectile/attack、damage/heal、HP before/after 与 cleanup reason；覆盖四形态、全部技能和生命周期。
- 新增 task-specific `pet P1G` system-design gate、family/runtime/visual/formal tests、runtime audit 与 940×590 差异证据。

UI 原生化合同：
- 显示列表清单：直接消费 213 冻结的本体、普攻、分身、冲锋、多段雷霆、奥义显示树/depth/矩阵/时序与生命周期。
- 原版机器真值 JSON：运行时和测试断言 `task-settings-213.pet-dragon-family` 的 truthId/status/完整性并消费其投影；不得复制坐标表。
- 原版视觉基准：使用 213 的逐形态/动作/技能/P1-P2 940×590 基准。
- 允许的现代视觉例外：只允许稳定 runtime/action/attack id；不新增可见替代层。
- 逐状态验收：四形态正常/移动/攻击/技能/hurt/dead，全部继承组合、P1/P2、TestScene/五关、换宠/休息/retry/return/reload。
- 差异证据：逐状态并排/叠图、对象/帧/几何/时序差异及视觉对象→action token→projectile→HP delta/heal→cleanup 一一对应 trace。

完成定义：
- 青龙四形态从范围外追击、真普攻、全部技能、命中/治疗、动画与 P1/P2 生命周期在 TestScene 和正式五关同源闭合；不能以字符串事件、动画播放或 isolated mock 自证完成。

验收标准：
- 213 generator/check、独立 field-level verifier、range/hit/source mutation-kill 与 `npm run check:system-design -- pet P1G` 通过。
- 青龙 family/behavior/animation/formal pets/journey、战斗反馈、全系统、build、structure、annotations、workflow、problem audit、diff check 通过。
- 940×590 正式 P1/P2 至少一关覆盖范围外追击→普攻命中和每类技能可见链，返回/重试/重载后 owner/状态无残留，console warning/error 为 0。

禁止范围：
- 不改青龙伤害/治疗数值、攻击范围、技能选择和存档 schema；不触及其他宠物家族、角色/怪物架构、Stage 2-3 或战斗反馈视觉合同。

状态更新：
- 更新 pet 设计验收矩阵、机制/切片、pets/corpus、当前线覆盖台账、task-board/history；完成后生成下一未闭合完整宠物家族的证据/实现对，不跨 task 续跑。

推荐后续任务：
- 依据青龙完成结果生成下一未闭合完整宠物家族；九家族全部完成后执行 `TASK-SLICE-194`。

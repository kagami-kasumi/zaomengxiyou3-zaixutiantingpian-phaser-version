# TASK-SLICE-214B

任务类型：
- `TASK-SLICE`

任务模型：
- `常规任务`

逆向子类型：
- 不适用

逆向方案：
- 不适用

功能条线：
- `LINE-PRE-STAGE-2-3-PRESENTATION`（Active；Split；首次 compact 后由 214C/214D/214E 连续承接）

目标机制/切片：
- `M-032`、`M-034`、`M-035`、`M-042`、`M-044`、`VS-067`

规模预算：
- 主工作包：0（Split 父级合同，由 214C/214D/214E 执行）
- 预计上下文压缩：0
- 独立验收批次：0

拆分触发：
- 若 213 留下实现影响 unresolved、需要改变存档 schema/公共宠物设计、引入第二宠物家族或新增独立正式旅程，先拆同线解除项；不得用现代猜测补证据。

协作计划：
- 模式：单 agent
- 并行工作包：无
- 写入 owner：主 agent
- 归并检查点：共享 Runtime/命中链完成后、正式运行验收前
- 方法观测：`MO-003`（只记录第三家族实施差异）

输入资料：
- `docs/tasks/evidence/TASK-SLICE-214A/handoff.md`：153文件、生产查询API、345状态零差异和裁边注册点规则。
- `TASK-SLICE-214A` 交付的可重复生成青龙现代资源、manifest 直连查询、对象级差异报告和完整性检查；资源准备通过后才激活本项。
- 213 的 verified manifest、family evidence、逐状态原版基准、字段级 handoff verifier 与完整 acceptance matrix。
- `docs/architecture/system-designs/pet.md`、当前 `PetCombatRuntime`、Dragon Behavior/技能、Projectile/Stage1 damage、统一 `CombatFeedbackEvent`、TestScene 与正式五关消费者。

完整合同集：
- `CONTRACT_SET:owner.body|owner.effects|owner.collision|visual.states|visual.baselines|runtime.update-order|runtime.target-order|runtime.target-loss|runtime.follow-owner|runtime.follow-target|runtime.warp|runtime.action-priority|runtime.normal-roll|runtime.cooldown-order|runtime.hurt|runtime.death|runtime.destroy|runtime.projectile-collision|runtime.attack-id-dedup|runtime.damage-pipeline|runtime.heal-on-hit|runtime.clone-owner|runtime.p1-p2|dragon1.normal|dragon1.fs|dragon1.fs-expiry-heal|dragon2.normal|dragon2.fs|dragon2.sdcc|dragon3.normal|dragon3.fs|dragon3.sdcc|dragon3.ltwj|dragon3.ltwj-nine-object-wave|dragon4.normal|dragon4.fs|dragon4.sdcc|dragon4.ltwj|dragon4.qlaoyi|dragon4.qlaoyi-trigger|dragon4.qlaoyi-clones|dragon4.qlaoyi-chain|dragon4.qlaoyi-no-mp-debit|dragon4.cleanup`

输出产物：
- dragon1..4 共用公共 `PetCombatRuntime`，统一从 `attackRange=150` 的范围外追击到真普通攻击；`fs/sdcc/ltwj/qlaoyi` 及继承组合以 action token 驱动真实 effect/projectile、collision/tracking、hit frame、pet-source damage/heal 与 cleanup。
- `ltwj` 必须按 213 冻结的 `1+2+2+2+2=9` 对象与 0/0.2/0.4/0.6/0.8 秒时序实现；`qlaoyi` 的 30 MP 仅作原版门禁，不得实际扣蓝，首个 host tick（剩余计数 48）trigger 与四次可选分身链分别保留身份。
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
- 213 generator/check、独立 field-level verifier、range/hit/source、ltwj-count、qlaoyi-MP mutation-kill 与 `npm run check:system-design -- pet P1G` 通过。
- 青龙 family/behavior/animation/formal pets/journey、战斗反馈、全系统、build、structure、annotations、workflow、problem audit、diff check 通过。
- 940×590 正式 P1/P2 至少一关覆盖范围外追击→普攻命中和每类技能可见链，返回/重试/重载后 owner/状态无残留，console warning/error 为 0。

禁止范围：
- 不新增资源派生工作包；发现 214A 产物缺失/几何或时序错误时先修订同线解除项，不带缺口完成本项。
- 不改青龙伤害/治疗数值、攻击范围、技能选择和存档 schema；不触及其他宠物家族、角色/怪物架构、Stage 2-3 或战斗反馈视觉合同。

状态更新：
- 更新 pet 设计验收矩阵、机制/切片、pets/corpus、当前线覆盖台账、task-board/history；完成后激活用户反证生成的 `TASK-SETTINGS-215`，不跨 task 续跑。

推荐后续任务：
- `TASK-SETTINGS-215`：冻结角色/宠物承伤 `pnum` 的原版真值与全链路行为合同；216 完成后再恢复下一未闭合宠物家族。

执行边界：
- 本项是 Split 父任务 `TASK-SLICE-214` 的完整行为与正式运行承接项；父任务全部 44 项合同、UI 原生化合同、P1G 和最终验收标准原样保留。214A 通过不等于任何形态战斗完成。
- 通过后同次归档 214B 与 Split 父任务 214，激活 `TASK-SETTINGS-215`；家族闭合前不跨族。

213A 时钟修正合同：
- 必须直接消费 visualTruth.bodyTimelines/bodyClock；getCurFrameCount 是剩余持帧数，普通/技能 emitTiming 使用 remainingHoldCount 与 elapsedHostTick，不再消费歧义 holdTick。
- qlaoyi 的剩余计数 48/36/24/12 对应从动作起算第 1/13/25/37 次 enter 回调，分身依次 left/right/left/right；trigger 在第 1 次回调置于 pet 根坐标且随后跟随，不是第 48 tick。


执行记录（2026-09-05 compact 安全检查点）：
- 当前执行合同为本文件；首次 compact 已触发，停止新增实现与资源派生。214B 尚未修改 Runtime/Behavior/正式消费者，不能计完成。
- 已完成且未提交的改动归属 213A 真值修复和 214A 资源准备：`docs/tasks/evidence/TASK-SETTINGS-213A/repair-audit.json`、`docs/tasks/evidence/TASK-SLICE-214A/handoff.md`、`src/assets/PetDragonAnimationAssets.ts`、`src/assets/PetDragonAssetFiles.json`、对应 public assets、生成/验证工具、真值与基准以及任务/治理记录。所有改动保留原归属。
- 最近通过范围：213 真值检查（345 基准、15 类独立变异）、214A 153 资源/627 host ticks/345 状态零像素差/4 类视觉变异、资源所有权、build、structure、workflow、problem audit 和 diff check；不代表正式战斗验收。运行中命令和会话：无，既有检查均已结束。
- 已定位公共 PetCombatRuntime、PetBehavior、默认 registry、Horse Combat/BodyBridge、HeroPartyRuntimeBridge 和 TestScene effect 消费者。公共 runtime 在 dead-playing 提前返回；当前 Context 没有明确命中治疗反馈及分身状态投影入口。真实分身如何在既有 pet 设计的私有召唤物 owner 下复用公共规则，仍待实现合同核对，不能先复制另一份跟随/目标/死亡生命周期。未据此改变公共设计。
- 尚未完成：DragonBehavior、真实分身、正常攻击、fs/sdcc/ltwj/qlaoyi、伤害治疗、正式/TestScene 同源视图、P1/P2 清理、全 44 项合同和 P1G。无正式战斗通过结论。
- 拆分后的下一允许动作：新对话执行唯一 Ready `TASK-SLICE-214C`；随后 214D、214E。214C 初阶完整纵向链，214D 二三阶增量链，214E 四阶奥义及全家族闭合；本对话仅完成检查点、任务索引与检查。
- 最终 214E 通过后同次归档 214B 和 214；保留上文完整合同作为父级要求。归档时须把 `tools/validate-pet-dragon-family-handoff.mjs` 对 214 活跃定义的读取迁移到持久合同位置，避免删除定义后校验断链。

规则变更注记（2026-09-05）：上方首次 compact 停止与新对话要求记录的是当时旧规则。用户现批准允许一次 compact、第二次交接，后续执行遵循更新后的 agent-protocol；保留本项 Split 与214C/214D/214E调度，不回滚已完成拆分。

2026-09-13当前进度：214C5已完成并归档父C2/C，初阶P1GC=0。下一执行项为214D，随后214E；上方首次compact及未实现初阶的描述是历史状态。全44项和P1G仍由214E完成，不提前归档本父任务。交接见 `docs/tasks/evidence/TASK-SLICE-214C5/handoff.md`。

2026-09-13当前进度更新：214D已完成并归档，二三阶P1GD=0，174状态与6448原版碰撞、真实双人伤害/清理通过（219批准近似仍单列）。下一执行项214E，继续四阶及全44项/P1G；父214/214B保持Split。见214D/handoff.md。

# TASK-SLICE-240

任务类型：`TASK-SLICE`

任务模型：`常规任务`

功能条线：`LINE-PRE-STAGE-2-3-PRESENTATION`（Active；本任务 Ready）

目标机制/切片：`M-030`、`M-032`、`M-034`、`M-042`、`VS-067`

要解决的问题：232已证明Monster30身体回调应先于目标效果，生成的独立攻击在下一world tick检测，源HP归零不立即清攻击、destroy才清理。现代1-1/TestScene与1-3仍在效果后读取身体，伤害绑定源activeAttack；只补显示会留下致死时攻击无伤害的错误。

范围：Monster30同一行为在1-1/TestScene与1-3的两条现有owner路径，身体回调→独立攻击记录→真正英雄/宠物伤害→只读显示→死亡/销毁/退出。其他11类型仅保留232消费者矩阵和兼容回归，不扩大为所有怪物技能重做。

规模预算：
- 主工作包：1
- 预计上下文压缩：0
- 独立验收批次：1

拆分触发：
- 消费预检若缺Monster30Bullet1对实际英雄/宠物的必要空间/像素命中机器真值，先标记输入缺口，生成同线有界补证任务；不能拿现有矩形/横向距离或218目标壳真值替代。
- 如必须同时重做其他怪物专属行为/新视觉资源全集，另列任务并保留本合同；不得把Monster16 follow/hurt-cut或Monster2纯视觉/Tween套成Monster30默认。

协作计划：
- 模式：主 agent + subagent（可独立返回且主agent有并行工作时）。
- 模型分工：按agent-protocol准入表；主agent负责共享运行时边界，简单只读源/消费者核对优先可用Luna。
- 并行工作包：有界输入适用性或独立回归核对；不增加主工作包。
- 写入 owner：主 agent独占运行时/状态文档；子agent默认只读。
- 归并检查点：实现前核定输入、完成前核定全部真实消费者。
- 方法观测：无。

输入资料：
- `docs/reverse-engineering/monster-body-attack-lifecycle-contract.md` 与 `reference/monster-body-attack-lifecycle-contract.json`，BA-01..08；原源locator必须窄读。
- `tools/monster-body-order-source/`、`tools/monster-body-timeline/`及232本地证据；注意受控collision sink、注入效果到期、显式MovieClip帧边界，不能当作生产验收。
- `tools/pet-target-body-order-preflight.ts`与226原84责任承接矩阵；原现代三fps失败反例必须转为真实通过。
- `Monster30System`、`Stage1CombatSystem`、`MonsterPetTargetEffectSystem`、Stage11/13视觉与正式/TestScene实际伤害consumer；`src-boundaries.md`。
- 既有恢复 `assets/1.swf` character21、068视觉资料及218目标碰撞真值，只按已证明范围复用。

输出产物：
- 既有owner下的Monster30独立攻击生命周期与只读显示投影，逐一删除本范围对源activeAttack存活的错误依赖；不把玩法放进Phaser view。
- 同帧火焰/冰冻、受伤、源死亡/销毁、暂停、退出重入、P1/P2英雄与宠物的实际伤害及逐状态显示证据。
- 232 BA-01..07与226相关组合责任回填；其他类型/公共责任保持明确未完成。

完成定义：两条正式owner路径都使用同一已证Monster30顺序与独立攻击合同；HP真实变化、去重、首次命中、来源身份、出生根和清理可复验。源死亡后的可见攻击与伤害一致，不以事件数量或普通build代替。

验收标准：
- 实现前运行check:structure；Monster30System现有warning优先拆分，仅拆本范围，不能顺手大重构。
- 对20/24/30fps、致死/非致死火焰、冰冻首尾、直接hurt/dead/destroy、暂停/恢复、同Scene重试及返回重载执行独立expected；拒绝232六类反例。
- 同时检查真实DamageEvent、英雄/宠物HP、attackId去重和双owner来源，证明显示图不是唯一改变；不伪造目标位置来声称自然碰撞通过。
- 适用视觉/空间输入按reverse-engineering-protocol核对机器真值、原版基准和逐状态差异；无新增可见替代层，轻微容差按长期授权记录。
- 相关系统专项、build、check:workflow、audit:problems通过；结构无新error；原公共经验/击退与五关兼容保持。

禁止范围：不改原始提取结果，不迁移整套怪物系统，不新增设计模式验收方案，不关闭全部五关/猴马完整家族/204/all/VS-067，不删除226其余84责任。

状态更新：Ready（2026-09-27，232完成后激活）。

推荐后续任务：依据本次输入和消费者证据生成同线其他怪物公共顺序消费项，或在本范围闭合且无新增阻塞后恢复TASK-SLICE-233；未覆盖类型的公共责任必须先明确承接，不能用Monster30通过替代。

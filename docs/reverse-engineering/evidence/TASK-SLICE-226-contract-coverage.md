# TASK-SLICE-226 原84合同承接矩阵

当前：226本项整改通过完整P1R/P1H/P1G/P1T及目标投影增量后的P1R/P1H；公共后续项仍未关闭。本表追踪原207的41项与209的43项，既不修改历史真值状态，也不把合同ID存在等同于实现通过。

测试名均指 `tools/<名称>.ts`。伤害/目标夹具使用明确受控输入；原始关卡生成时机不在本项重新核定。完整家族、Canvas及公共怪物/捕获/被动责任按后续列保留。

| 家族/原合同 | 本项可执行证据 | 公共后续与完成证据 |
| --- | --- | --- |
| monkey/owner.body | `pet-monkey-horse-asset-tests`、`asset-bundle-tests` | — |
| monkey/owner.effects | `pet-monkey-horse-asset-tests`、`asset-bundle-tests` | — |
| monkey/owner.collision | `pet-monkey-horse-collision-field-tests`、`pet-monkey-horse-asset-tests` | — |
| monkey/visual.states | `pet-monkey-horse-body-clock-tests`、`pet-monkey-pause-display-tests`、`pet-horse-sp-display-tests` | 233已完成：850态Canvas/WebGL零残差及正式回退，见Canvas验收 |
| monkey/visual.baselines | `pet-monkey-pause-display-tests`、`pet-horse-falling-display-tests`、`pet-horse-sp-display-tests` | 233已完成：850态Canvas/WebGL零残差及正式回退，见Canvas验收 |
| monkey/runtime.update-order | `pet-source-phase-tests`、`pet-monkey-horse-body-clock-tests`、`pet-monkey-horse-dead-step-tests` | — |
| monkey/runtime.target-order | `pet-monkey-horse-target-order-tests`、`pet-monkey-horse-formal-target-tests` | — |
| monkey/runtime.target-loss | `pet-monkey-horse-target-order-tests`、`pet-monkey-horse-formal-target-tests` | — |
| monkey/runtime.follow-owner | `pet-monkey-horse-ground-motion-tests`、`pet-monkey-horse-ground-runtime-tests` | — |
| monkey/runtime.follow-target | `pet-normal-attack-session-tests`、`pet-monkey-behavior-contract-runtime-tests`、`pet-horse-behavior-contract-runtime-tests` | — |
| monkey/runtime.warp | `pet-monkey-horse-ground-runtime-tests` | — |
| monkey/runtime.action-priority | `pet-monkey-source-gate-tests`、`pet-monkey-horse-hurt-release-tests` | — |
| monkey/runtime.normal-roll | `pet-normal-attack-session-tests`、`pet-source-phase-tests` | — |
| monkey/runtime.cooldown-order | `pet-source-phase-tests`、`pet-monkey-horse-dead-step-tests` | — |
| monkey/runtime.auto-buff | 数值/会话子范围242A/B通过：1717源样本、24双owner会话、真实技能及五关HUD；六特效视觉未核销 | 244视觉真值及后续消费 |
| monkey/runtime.hurt | `pet-monkey-horse-incoming-tests`、`pet-monkey-horse-hurt-release-tests` | 230证据已交接、236实现、232补证完成/240 Monster30两条owner消费完成；其他11类型与人偶消费仍待 |
| monkey/runtime.death | `pet-monkey-horse-party-lifecycle-tests`、`pet-monkey-horse-dead-step-tests` | 231/239补证及238经验消费已完成；232补证完成；240 Monster30两条owner消费完成；其他11类型与人偶消费仍待 |
| monkey/runtime.destroy | `pet-monkey-horse-party-lifecycle-tests`、`pet-horse-retired-parent-tests` | 234已完成：`pet-capture-identity-tests`（猴马真实捕获双owner清理、正式保存通知与来源）及3生产变异；见捕获身份验收 |
| monkey/runtime.projectile-collision | `pet-monkey-horse-collision-field-tests`、`pet-monkey-horse-normal-runtime-tests`、`pet-monkey-skill-projectile-tests`、`pet-horse-skill-projectile-tests` | — |
| monkey/runtime.attack-id-dedup | `pet-monkey-horse-normal-runtime-tests`、`pet-monkey-skill-projectile-tests`、`pet-horse-skill-projectile-tests` | — |
| monkey/runtime.damage-pipeline | `pet-monkey-horse-damage-tests`、`pet-monkey-horse-normal-runtime-tests`、`pet-monkey-aoyi-combat-tests`、`pet-horse-aoyi-runtime-tests` | 230证据已交接、236实现、231/239补证及238经验消费已完成；232补证完成；240 Monster30两条owner消费完成；其他11类型与人偶消费仍待 |
| monkey/runtime.p1-p2 | `pet-monkey-horse-party-lifecycle-tests`、`pet-monkey-horse-normal-runtime-tests` | 234已完成：`pet-capture-identity-tests`（猴马真实捕获双owner清理、正式保存通知与来源）及3生产变异；见捕获身份验收 |
| monkey/monkey1.normal | `pet-monkey-horse-normal-runtime-tests`、`pet-monkey-body-emission-tests` | — |
| monkey/monkey1.xj | `pet-monkey-body-emission-tests`、`pet-monkey-skill-projectile-tests`、`pet-monkey-effect-follow-tests` | — |
| monkey/monkey1.hurt-release | `pet-monkey-horse-hurt-release-tests`、`pet-monkey-horse-incoming-tests` | — |
| monkey/monkey2.normal | `pet-monkey-horse-normal-runtime-tests`、`pet-monkey-body-emission-tests` | — |
| monkey/monkey2.lj | `pet-monkey-body-emission-tests`、`pet-monkey-skill-projectile-tests`、`pet-monkey-effect-follow-tests` | — |
| monkey/monkey2.xj | `pet-monkey-body-emission-tests`、`pet-monkey-skill-projectile-tests`、`pet-monkey-effect-follow-tests` | — |
| monkey/monkey2.hurt-release | `pet-monkey-horse-hurt-release-tests`、`pet-monkey-horse-incoming-tests` | — |
| monkey/monkey3.normal | `pet-monkey-horse-normal-runtime-tests`、`pet-monkey-body-emission-tests` | — |
| monkey/monkey3.lyq | `pet-monkey-body-emission-tests`、`pet-monkey-skill-projectile-tests`、`pet-monkey-effect-follow-tests` | — |
| monkey/monkey3.xj | `pet-monkey-body-emission-tests`、`pet-monkey-skill-projectile-tests`、`pet-monkey-effect-follow-tests` | — |
| monkey/monkey3.lj | `pet-monkey-body-emission-tests`、`pet-monkey-skill-projectile-tests`、`pet-monkey-effect-follow-tests` | — |
| monkey/monkey3.hurt-release | `pet-monkey-horse-hurt-release-tests`、`pet-monkey-horse-incoming-tests` | — |
| monkey/monkey4.normal | `pet-monkey-horse-normal-runtime-tests`、`pet-monkey-body-emission-tests` | — |
| monkey/monkey4.lyq | `pet-monkey-body-emission-tests`、`pet-monkey-skill-projectile-tests`、`pet-monkey-effect-follow-tests` | — |
| monkey/monkey4.xj | `pet-monkey-body-emission-tests`、`pet-monkey-skill-projectile-tests`、`pet-monkey-effect-follow-tests` | — |
| monkey/monkey4.lj | `pet-monkey-body-emission-tests`、`pet-monkey-skill-projectile-tests`、`pet-monkey-effect-follow-tests` | — |
| monkey/monkey4.jgaoyi | `pet-monkey-aoyi-ground-tests`、`pet-monkey-aoyi-combat-tests`、`pet-monkey-aoyi-mutation-tests` | — |
| monkey/monkey4.hurt-release | `pet-monkey-horse-hurt-release-tests`、`pet-monkey-horse-incoming-tests` | — |
| monkey/monkey4.jgaoyi-chain | `pet-monkey-aoyi-ground-tests`、`pet-monkey-aoyi-combat-tests`、`pet-monkey-aoyi-mutation-tests` | — |
| horse/owner.body | `pet-monkey-horse-asset-tests`、`asset-bundle-tests` | — |
| horse/owner.effects | `pet-monkey-horse-asset-tests`、`asset-bundle-tests` | — |
| horse/owner.collision | `pet-monkey-horse-collision-field-tests`、`pet-monkey-horse-asset-tests` | — |
| horse/visual.states | `pet-monkey-horse-body-clock-tests`、`pet-monkey-pause-display-tests`、`pet-horse-sp-display-tests` | 233已完成：850态Canvas/WebGL零残差及正式回退，见Canvas验收 |
| horse/visual.baselines | `pet-monkey-pause-display-tests`、`pet-horse-falling-display-tests`、`pet-horse-sp-display-tests` | 233已完成：850态Canvas/WebGL零残差及正式回退，见Canvas验收 |
| horse/runtime.update-order | `pet-source-phase-tests`、`pet-monkey-horse-body-clock-tests`、`pet-monkey-horse-dead-step-tests` | — |
| horse/runtime.target-order | `pet-monkey-horse-target-order-tests`、`pet-monkey-horse-formal-target-tests` | — |
| horse/runtime.target-loss | `pet-monkey-horse-target-order-tests`、`pet-monkey-horse-formal-target-tests` | — |
| horse/runtime.follow-owner | `pet-monkey-horse-ground-motion-tests`、`pet-monkey-horse-ground-runtime-tests` | — |
| horse/runtime.follow-target | `pet-normal-attack-session-tests`、`pet-monkey-behavior-contract-runtime-tests`、`pet-horse-behavior-contract-runtime-tests` | — |
| horse/runtime.warp | `pet-monkey-horse-ground-runtime-tests` | — |
| horse/runtime.action-priority | `pet-monkey-source-gate-tests`、`pet-monkey-horse-hurt-release-tests` | — |
| horse/runtime.normal-roll | `pet-normal-attack-session-tests`、`pet-source-phase-tests` | — |
| horse/runtime.cooldown-order | `pet-source-phase-tests`、`pet-monkey-horse-dead-step-tests` | — |
| horse/runtime.hurt | `pet-monkey-horse-incoming-tests`、`pet-monkey-horse-hurt-release-tests` | 230证据已交接、236实现、232补证完成/240 Monster30两条owner消费完成；其他11类型与人偶消费仍待 |
| horse/runtime.death | `pet-monkey-horse-party-lifecycle-tests`、`pet-monkey-horse-dead-step-tests` | 231/239补证及238经验消费已完成；232补证完成；240 Monster30两条owner消费完成；其他11类型与人偶消费仍待 |
| horse/runtime.destroy | `pet-monkey-horse-party-lifecycle-tests`、`pet-horse-retired-parent-tests` | 234已完成：`pet-capture-identity-tests`（猴马真实捕获双owner清理、正式保存通知与来源）及3生产变异；见捕获身份验收 |
| horse/runtime.projectile-collision | `pet-monkey-horse-collision-field-tests`、`pet-monkey-horse-normal-runtime-tests`、`pet-monkey-skill-projectile-tests`、`pet-horse-skill-projectile-tests` | — |
| horse/runtime.attack-id-dedup | `pet-monkey-horse-normal-runtime-tests`、`pet-monkey-skill-projectile-tests`、`pet-horse-skill-projectile-tests` | — |
| horse/runtime.damage-pipeline | `pet-monkey-horse-damage-tests`、`pet-monkey-horse-normal-runtime-tests`、`pet-monkey-aoyi-combat-tests`、`pet-horse-aoyi-runtime-tests` | 230证据已交接、236实现、231/239补证及238经验消费已完成；232补证完成；240 Monster30两条owner消费完成；其他11类型与人偶消费仍待 |
| horse/runtime.ice-effect | `pet-target-ice-tests`、`pet-target-ice-body-tests`、`pet-target-ice-display-tests`、`pet-horse-aoyi-multi-combat-tests` | 232补证完成/240 Monster30两条owner消费完成；其他11类型与人偶消费仍待 |
| horse/runtime.p1-p2 | `pet-monkey-horse-party-lifecycle-tests`、`pet-monkey-horse-normal-runtime-tests` | 234已完成：`pet-capture-identity-tests`（猴马真实捕获双owner清理、正式保存通知与来源）及3生产变异；见捕获身份验收 |
| horse/horse1.normal | `pet-monkey-horse-normal-runtime-tests`、`pet-horse-body-emission-tests` | — |
| horse/horse1.sp | `pet-horse-body-emission-tests`、`pet-horse-skill-projectile-tests`、`pet-horse-effect-follow-tests` | — |
| horse/horse2.normal | `pet-monkey-horse-normal-runtime-tests`、`pet-horse-body-emission-tests` | — |
| horse/horse2.bd | `pet-horse-body-emission-tests`、`pet-horse-skill-projectile-tests`、`pet-horse-effect-follow-tests` | — |
| horse/horse2.sp | `pet-horse-body-emission-tests`、`pet-horse-skill-projectile-tests`、`pet-horse-effect-follow-tests` | — |
| horse/horse2.hurt-release | `pet-monkey-horse-hurt-release-tests`、`pet-monkey-horse-incoming-tests` | — |
| horse/horse3.normal | `pet-monkey-horse-normal-runtime-tests`、`pet-horse-body-emission-tests` | — |
| horse/horse3.bd | `pet-horse-body-emission-tests`、`pet-horse-skill-projectile-tests`、`pet-horse-effect-follow-tests` | — |
| horse/horse3.sp | `pet-horse-body-emission-tests`、`pet-horse-skill-projectile-tests`、`pet-horse-effect-follow-tests` | — |
| horse/horse3.bz | `pet-horse-body-emission-tests`、`pet-horse-skill-projectile-tests`、`pet-horse-effect-follow-tests` | — |
| horse/horse3.hurt-release | `pet-monkey-horse-hurt-release-tests`、`pet-monkey-horse-incoming-tests` | — |
| horse/horse4.normal | `pet-monkey-horse-normal-runtime-tests`、`pet-horse-body-emission-tests` | — |
| horse/horse4.bd | `pet-horse-body-emission-tests`、`pet-horse-skill-projectile-tests`、`pet-horse-effect-follow-tests` | — |
| horse/horse4.sp | `pet-horse-body-emission-tests`、`pet-horse-skill-projectile-tests`、`pet-horse-effect-follow-tests` | — |
| horse/horse4.bz | `pet-horse-body-emission-tests`、`pet-horse-skill-projectile-tests`、`pet-horse-effect-follow-tests` | — |
| horse/horse4.tmaoyi | `pet-horse-aoyi-birth-tests`、`pet-horse-aoyi-runtime-tests`、`pet-horse-aoyi-multi-combat-tests`、`pet-horse-retired-parent-tests` | — |
| horse/horse4.hurt-release | `pet-monkey-horse-hurt-release-tests`、`pet-monkey-horse-incoming-tests` | — |
| horse/horse4.tmaoyi-targeting | `pet-horse-aoyi-birth-tests`、`pet-horse-aoyi-runtime-tests`、`pet-horse-aoyi-multi-combat-tests`、`pet-horse-retired-parent-tests` | — |
| horse/horse4.tmaoyi-ice | `pet-horse-aoyi-birth-tests`、`pet-horse-aoyi-runtime-tests`、`pet-horse-aoyi-multi-combat-tests`、`pet-horse-retired-parent-tests` | — |
| horse/horse4.tmaoyi-explosion | `pet-horse-aoyi-birth-tests`、`pet-horse-aoyi-runtime-tests`、`pet-horse-aoyi-multi-combat-tests`、`pet-horse-retired-parent-tests` | — |
| horse/horse4.tmaoyi-cleanup | `pet-horse-aoyi-birth-tests`、`pet-horse-aoyi-runtime-tests`、`pet-horse-aoyi-multi-combat-tests`、`pet-horse-retired-parent-tests` | — |

公共后续编号：230/237击退证据及236实际消费已完成（2026-09-26；仅公共击退，完整身体/死亡/家族组合仍保留）、231/239补证及238死亡经验消费已完成（2026-09-27；仅经验，不包含完整身体/死亡组合）、232怪物身体/攻击/目标效果顺序证据完成，241补证及240 Monster30两条owner消费完成（2026-09-28）；其他11类型与人偶责任保留在204公共承接范围，按232消费者矩阵继续有界生成、233Canvas尺寸取整已完成、234实时捕获身份已完成（2026-09-28；仅身份，不扩大为历史损坏存档修复）、235共享被动回复与六增益。后续任务必须继续消费受影响的原合同，不以本矩阵登记作为修复。

实际画布证据沿用226进度中原版PNG与正式WebGL逐状态对照；233已将850态Canvas与WebGL残差清零；仅该有限全集，不宣称全部场景跨渲染器像素一致。

240子范围核销证据见[Monster30验收](../monster30-runtime-acceptance.md)：真实英雄/宠物HP、66生命周期、216原生显示相位、93920命中与双Scene回归。仅上述七行的Monster30子范围完成，原41/43条目仍完整保留；233..235、其他类型/目标与完整家族不得据此关闭。

233共享后端核销见[Canvas验收](../canvas-sprite-extent-acceptance.md)，四条visual责任的本次Canvas缺口关闭；原84其余公共责任仍保留。

242B共享被动数值核销见[验收](../pet-passive-runtime-acceptance.md)：猴马共用实际session与伤害消费者，青龙/玄龟公共接缝回归；六特效视觉交244，原41+43条目及其他公共责任完整保留。

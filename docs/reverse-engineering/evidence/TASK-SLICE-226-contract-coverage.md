# TASK-SLICE-226 原84合同承接矩阵

当前：226本项整改通过完整P1R/P1H/P1G/P1T及目标投影增量后的P1R/P1H；公共后续项仍未关闭。本表追踪原207的41项与209的43项，既不修改历史真值状态，也不把合同ID存在等同于实现通过。

测试名均指 `tools/<名称>.ts`。伤害/目标夹具使用明确受控输入；原始关卡生成时机不在本项重新核定。完整家族、Canvas及公共怪物/捕获/被动责任按后续列保留。

| 家族/原合同 | 本项可执行证据 | 公共后续（尚未修复） |
| --- | --- | --- |
| monkey/owner.body | `pet-monkey-horse-asset-tests`、`asset-bundle-tests` | — |
| monkey/owner.effects | `pet-monkey-horse-asset-tests`、`asset-bundle-tests` | — |
| monkey/owner.collision | `pet-monkey-horse-collision-field-tests`、`pet-monkey-horse-asset-tests` | — |
| monkey/visual.states | `pet-monkey-horse-body-clock-tests`、`pet-monkey-pause-display-tests`、`pet-horse-sp-display-tests` | 233 |
| monkey/visual.baselines | `pet-monkey-pause-display-tests`、`pet-horse-falling-display-tests`、`pet-horse-sp-display-tests` | 233 |
| monkey/runtime.update-order | `pet-source-phase-tests`、`pet-monkey-horse-body-clock-tests`、`pet-monkey-horse-dead-step-tests` | — |
| monkey/runtime.target-order | `pet-monkey-horse-target-order-tests`、`pet-monkey-horse-formal-target-tests` | — |
| monkey/runtime.target-loss | `pet-monkey-horse-target-order-tests`、`pet-monkey-horse-formal-target-tests` | — |
| monkey/runtime.follow-owner | `pet-monkey-horse-ground-motion-tests`、`pet-monkey-horse-ground-runtime-tests` | — |
| monkey/runtime.follow-target | `pet-normal-attack-session-tests`、`pet-monkey-behavior-contract-runtime-tests`、`pet-horse-behavior-contract-runtime-tests` | — |
| monkey/runtime.warp | `pet-monkey-horse-ground-runtime-tests` | — |
| monkey/runtime.action-priority | `pet-monkey-source-gate-tests`、`pet-monkey-horse-hurt-release-tests` | — |
| monkey/runtime.normal-roll | `pet-normal-attack-session-tests`、`pet-source-phase-tests` | — |
| monkey/runtime.cooldown-order | `pet-source-phase-tests`、`pet-monkey-horse-dead-step-tests` | — |
| monkey/runtime.auto-buff | 未核销：共享被动独立源合同与消费待235 | 235 |
| monkey/runtime.hurt | `pet-monkey-horse-incoming-tests`、`pet-monkey-horse-hurt-release-tests` | 230、232 |
| monkey/runtime.death | `pet-monkey-horse-party-lifecycle-tests`、`pet-monkey-horse-dead-step-tests` | 231、232 |
| monkey/runtime.destroy | `pet-monkey-horse-party-lifecycle-tests`、`pet-horse-retired-parent-tests` | 234 |
| monkey/runtime.projectile-collision | `pet-monkey-horse-collision-field-tests`、`pet-monkey-horse-normal-runtime-tests`、`pet-monkey-skill-projectile-tests`、`pet-horse-skill-projectile-tests` | — |
| monkey/runtime.attack-id-dedup | `pet-monkey-horse-normal-runtime-tests`、`pet-monkey-skill-projectile-tests`、`pet-horse-skill-projectile-tests` | — |
| monkey/runtime.damage-pipeline | `pet-monkey-horse-damage-tests`、`pet-monkey-horse-normal-runtime-tests`、`pet-monkey-aoyi-combat-tests`、`pet-horse-aoyi-runtime-tests` | 230、231、232 |
| monkey/runtime.p1-p2 | `pet-monkey-horse-party-lifecycle-tests`、`pet-monkey-horse-normal-runtime-tests` | 234 |
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
| horse/visual.states | `pet-monkey-horse-body-clock-tests`、`pet-monkey-pause-display-tests`、`pet-horse-sp-display-tests` | 233 |
| horse/visual.baselines | `pet-monkey-pause-display-tests`、`pet-horse-falling-display-tests`、`pet-horse-sp-display-tests` | 233 |
| horse/runtime.update-order | `pet-source-phase-tests`、`pet-monkey-horse-body-clock-tests`、`pet-monkey-horse-dead-step-tests` | — |
| horse/runtime.target-order | `pet-monkey-horse-target-order-tests`、`pet-monkey-horse-formal-target-tests` | — |
| horse/runtime.target-loss | `pet-monkey-horse-target-order-tests`、`pet-monkey-horse-formal-target-tests` | — |
| horse/runtime.follow-owner | `pet-monkey-horse-ground-motion-tests`、`pet-monkey-horse-ground-runtime-tests` | — |
| horse/runtime.follow-target | `pet-normal-attack-session-tests`、`pet-monkey-behavior-contract-runtime-tests`、`pet-horse-behavior-contract-runtime-tests` | — |
| horse/runtime.warp | `pet-monkey-horse-ground-runtime-tests` | — |
| horse/runtime.action-priority | `pet-monkey-source-gate-tests`、`pet-monkey-horse-hurt-release-tests` | — |
| horse/runtime.normal-roll | `pet-normal-attack-session-tests`、`pet-source-phase-tests` | — |
| horse/runtime.cooldown-order | `pet-source-phase-tests`、`pet-monkey-horse-dead-step-tests` | — |
| horse/runtime.hurt | `pet-monkey-horse-incoming-tests`、`pet-monkey-horse-hurt-release-tests` | 230、232 |
| horse/runtime.death | `pet-monkey-horse-party-lifecycle-tests`、`pet-monkey-horse-dead-step-tests` | 231、232 |
| horse/runtime.destroy | `pet-monkey-horse-party-lifecycle-tests`、`pet-horse-retired-parent-tests` | 234 |
| horse/runtime.projectile-collision | `pet-monkey-horse-collision-field-tests`、`pet-monkey-horse-normal-runtime-tests`、`pet-monkey-skill-projectile-tests`、`pet-horse-skill-projectile-tests` | — |
| horse/runtime.attack-id-dedup | `pet-monkey-horse-normal-runtime-tests`、`pet-monkey-skill-projectile-tests`、`pet-horse-skill-projectile-tests` | — |
| horse/runtime.damage-pipeline | `pet-monkey-horse-damage-tests`、`pet-monkey-horse-normal-runtime-tests`、`pet-monkey-aoyi-combat-tests`、`pet-horse-aoyi-runtime-tests` | 230、231、232 |
| horse/runtime.ice-effect | `pet-target-ice-tests`、`pet-target-ice-body-tests`、`pet-target-ice-display-tests`、`pet-horse-aoyi-multi-combat-tests` | 232 |
| horse/runtime.p1-p2 | `pet-monkey-horse-party-lifecycle-tests`、`pet-monkey-horse-normal-runtime-tests` | 234 |
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

公共后续编号：230击退、231死亡奖励归属、232怪物身体/攻击/目标效果顺序、233Canvas尺寸取整、234实时捕获身份、235共享被动回复与六增益。后续任务必须继续消费受影响的原合同，不以本矩阵登记作为修复。

实际画布证据沿用226进度中原版PNG与正式WebGL逐状态对照；Canvas差异明确保留233，不宣称跨渲染器像素一致。

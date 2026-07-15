# 五角色战斗资源缺口与接入计划

本文是 `TASK-ASSET-001` 的交付清单。范围只覆盖现代侧已经完成的 Role1、Role4、Role5 战斗占位资源，不修改 `extracted_flash/`。

> 2026-07-15 更新：`TASK-ASSET-003` 已从 EVB 容器恢复原始命名资源包，`D:\flash-restored-swfs\assets\WuKong.swf`、`ShaShen.swf`、`bailongSword.swf`、`Role1Effect.swf` 等现在可用于选择性 FFDec 导出。下文的 `missing-original` 是旧提取集/当前工作区状态，不再表示源包缺失。完整证据见 [`evb-extraction-report.md`](evb-extraction-report.md)。

## 检索结论

本轮按现代代码实际引用的稳定 key 和 AS3 源符号做了窄检索：

- 检索范围：`extracted_flash/resources_by_swf`
- 检索方式：文件路径、导出图片名、`symbolClass/symbols.csv` 和资源文本命中
- 抽样复核符号：`Role1Bullet1`、`Role1Bullet6`、`Role4Bullet4`、`Role4Bullet12`、`Role4BulletArrow12_3`、`attack1_spear`、`attack1_sword`、`Role5runattack`、`swordhit1`、`sword_xlc`、`Role5Bullet9`、`swordskill5_2`、`sword_jrjljq`

结论：Role1、Role4、Role5 当前战斗占位 key 对应的真素材在现有导出资源中均未命中，不能直接接入。下一步不是重复扫 `[172845].swf` / `[25034429].swf` 主包，而是需要用户手工补提供或补提取角色资源包，例如 `WuKong`、`ShaShen`、`bailongSword`、`Role1Effect` 或对应 `SpecialUI/*` 资源包。

## 缺口清单

| 范围 | 现代占位 key 族 | AS3 资源名 | 当前资源状态 | 后续接入方向 |
| --- | --- | --- | --- | --- |
| Role1 普攻 | `normal-attack-effect.hero1.hit1/3/4/5` | `Role1Bullet1/3/4/5` | `missing-original` | 补 `WuKong` / `Role1Effect` |
| Role1 基础技能 | `skill-projectile.role1.slz/hytj/lyfb/lys/jdy` | `Role1Bullet6/7/8_1/8_2/9/11_1/11_2` | `missing-original` | 同上 |
| Role1 分身/终结 | `skill-projectile.role1.qsez/zz/hmz/hyjj`、`skill-effect.role1.hyjj.hit12_1` | `Role1Bullet10_2/10_4/12/12_1_1/13/14_1/14_2`、`ROLE1_SHALLDOW` | `missing-original` | 同上 |
| Role4 普攻 | `normal-attack-effect.hero4.shovel.*`、`normal-attack-effect.hero4.arrow.*` | `Role4Bullet1/2/3`、`Role4BulletArrow1/2` | `missing-original` | 补 `ShaShen` / `SpecialUI/ShaShen` |
| Role4 毒系/娃娃/毒链 | `skill-projectile.role4.zq.*`、`skill-effect.role4.jdz/wdww.*`、`skill-summon.role4.wdww.doll`、`skill-projectile.role4.mbyj.hit6` | `Role4Bullet4/5/6/7_1/7_2`、`Role4BulletArrow4`、`Role4Hit5` | `missing-original` | 同上 |
| Role4 位移/终结 | `skill-projectile.role4.qlj/tkj/dzj/mmw.*`、`skill-effect.role4.lybj.marker` | `Role4Bullet8/9_1/9_2/10/11/12`、`Role4BulletArrow8_1/8_2/9_1/9_2/10_1/10_2/12_1/12_2/12_3` | `missing-original` | 同上 |
| Role5 本体动作 | 白龙枪/剑普攻动作 key | `attack1..4_spear`、`jumpattack_spear`、`runattack_spear`、`attack1..4_sword`、`jumpattack_sword`、`runattack_sword` | `missing-original` | 补 `bailongSword` / ZM4 动作资源 |
| Role5 普攻附属 | `normal-attack-effect.hero5.sword.*`、`normal-attack-effect.hero5.spear.unresolved` | `swordhit1..6`、`swordhit1_1..6_1`、`Role5runattack`；枪形态 `doSingleHit(...)` 未恢复 | `missing-original` / `unresolved` | 补 `bailongSword`，枪形态需 P-code 或更完整导出 |
| Role5 枪系/状态 | `skill-projectile.role5.xlc/lxuanj/xkjz.*`、`skill-effect.role5.yyb/tlj.*` | `sword_xlc`、`sword_lxuanj1/2`、`sword_xkjz`、`Role5Bullet9`、`role5_tlj` | `missing-original` | 同上 |
| Role5 剑系/随身箭 | `skill-projectile.role5.pkz/mlsz/lysh/jrjl.*`、`skill-effect.role5.lxj/lysh/jrjl.*` | `swordskill2_1/2/3`、`swordqhskill2_1`、`swordskill4`、`sword_mlsz1..5`、`swordskill5_2/3`、`sword_jrjlsf`、`sword_jrjljq` | `missing-original` | 同上 |

## 最小后续切片

旧 `extracted_flash/` 中没有可直接接入的 Role1/4/5 真素材；EVB 新提取已解除源包阻塞。推荐后续任务为：

- `TASK-ASSET-002`：从 `D:\flash-restored-swfs` 选择性导出 `WuKong` / `Role1Effect`、`ShaShen` 或 `bailongSword` 的一个最小资源族并接入。
- 优先级建议：先接 Role1 普攻 `Role1Bullet1/3/4/5` 或 Role4 普攻 `Role4Bullet1/2/3 + Role4BulletArrow1/2`，因为它们只替换现有普攻特效占位，不改变技能数值或战斗流程。
- 如果补到的是 Role5 包，先接剑形态本体动作和 `swordhit1..6`；枪形态 `doSingleHit(...)` 仍需 P-code 或更完整导出证据。

关闭标准：只替换一个角色的一组真资源，并用 `npm run build` 加最小场景观察验收。


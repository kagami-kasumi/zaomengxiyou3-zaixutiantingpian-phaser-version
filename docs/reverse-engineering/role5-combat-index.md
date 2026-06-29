# Role5 白龙完整战斗逆向

本文记录 `export.hero.Role5` 的本地可达战斗行为，供现代实现拆分使用。主证据为 `extracted_flash/resources_by_swf/[172845].swf/scripts/export/hero/Role5.as`；随身特殊对象另查 `export/hero/BLMSkill5.as`、`export/hero/JRJL.as`，状态视觉和清理入口查 `base/BaseAddEffect.as`。

## 1. 形态、输入和基础动作

- 白龙有枪/剑两套形态，源码字段为 `isSword`。默认构造值为 `true`，即剑形态；枪形态速度 `horizenSpeed = 6`、跑速 `10`，剑形态速度 `7`、跑速 `11`。
- 资源由 `BaseBitmapDataPool.build/loadZm4RoleResources()` 加载，动作名按 `*_spear`、`*_sword` 拆分，例如 `idle_spear`、`idle_sword`、`walk_*`、`run_*`、`attack*_spear/sword`。
- `myKeyDown()` 常规处理普攻、跳跃、下落和传送门；`0101` 是白龙特化组合键：若已学习 `yyb` 且 MP 足够，会翻转 `_invert` 并释放 `skill_yyb()`。
- 跳跃输入通常在攻击/受击时拒绝，但 `curAction == "hit29"` 例外，允许 `mlsz` 动作中跳跃。
- `ToSpear()` / `ToSword()` 只在非攻击且非普攻状态下切换；`normalHit()` 发现带 `ROLE5SKILL5` 标记的怪物时，剑形态会先 `ToSpear()` 再瞬移。

## 2. 普攻、能量和标记瞬移

| 场景 | 枪形态 | 剑形态 | 关键边界 |
| --- | --- | --- | --- |
| 地面普攻 | `hit1 -> hit2 -> hit3 -> hit4` | `hit18 -> hit19 -> hit20 -> hit21` | 1200ms 内连段，超时回第一段；`timers = 0`。 |
| 空中普攻 | `hit5` | `hit22` | 普攻后清 `hitNum`，新攻击编号。 |
| 跑动普攻 | `hit114` | `hit114_1` | 按面向设置 `speed.x = +/-10`，并生成跑攻跟随弹体。 |
| 标记瞬移 | `doNormalhitEscape()` | 先转枪再瞬移 | 从带 `ROLE5SKILL5` 且存活时间大于 0 的怪中选择 HP/最大 HP 比例最低者，瞬移到其坐标，`y` 最大钳到 450，生成 `Role5escapeEffect` 并清除所有怪身上的该标记。 |

枪形态每次 `normalHit()` 末尾调用 `addRole5Energy()`，递增 `_role5hitadd`；超过 `AllConsts.ROLE5MAXENERGY` 后清零并给自身添加 `ROLE5HITADD`，持续 `2.4s`。当前导出的 AS3 文本能定位常量名，但未检出常量定义，现代实现不得猜具体阈值；首切片可把阈值做成待校准配置并在文档中标明来源缺口。

## 3. 正式技能输入

MP 基础表与其他角色相同：

```text
[66,160,208,276,364,493,703,759,801,921,1085,1133,1318,1771,1884,1954,2320,2667]
```

Role5 没有 Role2/3/4 的角色总系数，直接乘技能自身系数。除 `lysh` 的常驻箭对象重入外，主动技能统一拒绝攻击中或受击中。

| 技能 | 心法树 | MP | 动作 | 本地可达行为 |
| --- | --- | --- | --- | --- |
| `xlc` | 千刀万刃 | `* 0.5` | `hit6` | 枪系突刺，生成 `sword_xlc` 跟随弹体；角色 `speed.x = +/-35`，`speed.y = 0`，动作中 `setYourFather(8)`。 |
| `yyb` | 千刀万刃 | `* 0.55` | `hit9` | 添加 `ROLE5SKILL4` 状态，持续取 `skill4time[yybLevel-1]`，生成 `Role5Bullet9` 禁碰撞视觉；`0101` 组合键同样释放并翻转 `_invert`。 |
| `pkz` | 千刀万刃 | 剑形 `* 0.62`，非剑形沿用绑定返回值 | `hit24_1` | 三段链：`swordskill2_1` / `swordskill2_2` / `swordskill2_3`；空中帧点会维持二段对象，落地/指定帧点结束并销毁二段。龙魂剑状态下第一段资源改为 `swordqhskill2_1`。 |
| `tlj` | 千刀万刃 | `* 0.72` | `hit11` | 给自身添加 `ROLE5TLJ`，持续误用 `yyb` 等级索引取 `skill4time`；动作表 `hit11` 是多段物理参数。 |
| `lysh` | 千刀万刃 | 剑形 `* 1.1`，非剑形沿用绑定返回值 | `hit27_1` / `hit27_2` | 首次创建 `BLMSkill5` 四枚随身箭并扣 MP；随身箭充满后再次释放转 `hit27_2` 并发射 `swordskill5_2`；全部射空后再次释放可重建并扣 MP。 |
| `lxj` | 龙魂的夜宴 | 剑形 `* 0.6`，非剑形沿用绑定返回值 | `hit26` | 添加 `ROLE5LOONGSWORD`，持续取 `skill4time[lxjLevel-1]`，生成 `swordskill4` 禁碰撞视觉；状态期间普攻和多项技能使用强化资源/伤害，并多处 25% 调用 `dolxjfeijian()`。该函数在当前源码为空。 |
| `lxuanj` | 龙魂的夜宴 | `* 0.6` | `hit7` | 枪系双向高速弹：首段 `sword_lxuanj1` 从角色前方约 188、上方 97 以 `36px/frame` 向面向侧飞行；`hit8` 另有反向段 `sword_lxuanj2`。 |
| `xkjz` | 龙魂的夜宴 | `* 0.72` | `hit10` | 前方/面向侧选怪定点生成 `sword_xkjz`，默认位置约前方 486、上方 465；有面向侧怪时改到目标旁约 208、上方 465。 |
| `jrjl` | 龙魂的夜宴 | `* 0.7` | `hit28` | 添加 `ROLE5JRJL`，生成 `sword_jrjlsf` 禁碰撞视觉；只要玩家学过 `jrjl`，`step()` 会创建 `JRJL` 三枚随身箭，充能后由普攻/技能触发 `sword_jrjljq`。 |
| `mlsz` | 龙魂的夜宴 | `* 1.0` | `hit29` | 五段阵列，帧点 2..6 分别生成 `sword_mlsz1..5`；龙魂剑状态下改用 `_1` 强化资源。动作中 `speed.y = 0`，且跳跃键例外可用。 |

`skill_xlj()` 存在并进入 `hit23`，但 `Config.allSklName` 和 `showSkill()` 都没有 `xlj` 分支；当前按不可达遗留函数处理，不拆实现任务。

## 4. Projectile 和特殊对象映射

| 对象/资源 | 创建入口 | 类型 | 结算/生命周期 |
| --- | --- | --- | --- |
| `swordhit1..5` / `swordhit*_1` | 剑普攻、空中、龙魂剑强化 | `FollowBaseObjectBullet`，强化 1..3 另有 `EnemyMoveBullet` 追加段 | 普攻物理伤害。龙魂剑状态下 1..3 段额外生成 `swordhitN_1` 移动剑气，速度 `8`、加速度 `2.4`、距离 700。 |
| `Role5runattack` / `swordhit6(_1)` | 跑动普攻 | `FollowBaseObjectBullet` | 枪跑攻用 `hit114`，剑跑攻用 `hit115`/`hit115_1`。 |
| `sword_xlc` | `xlc/hit6` | `FollowBaseObjectBullet` | 物理单段，击退 `[-1,-1]`；释放时角色高速前冲。 |
| `sword_lxuanj1` / `sword_lxuanj2` | `lxuanj/hit7`、`hit8` | `EnemyMoveBullet` | 速度 `36`、距离 999；`hit7_1` 和 `hit8` 都按 5 段口径结算。 |
| `sword_xkjz` | `xkjz/hit10` | `SpecialEffectBullet` | `hit10` 物理，`attackInterval = 9`，7 段口径。 |
| `Role5Bullet9` | `yyb/hit9` | `FollowBaseObjectBullet`，禁碰撞 | 主要承载 `ROLE5SKILL4` 状态视觉。 |
| `Role5Bullet10_1/10_2/10_3`、`Role5lmjly1/2` | 枪系链式遗留 helper | 跟随、移动和特效组合 | 与 `ROLE5HITADD`、`ROLE5SKILL5` 标记相关；需要后续实现时重点复核可达入口。 |
| `Role5escapeEffect`、`Role5cloneEf2` | 标记瞬移 | 跟随/特效 | 瞬移前后视觉；`Role5escapeEffect` 使用 `hit13`，带 1 秒眩晕参数。 |
| `swordskill2_1/2/3`、`swordqhskill2_1` | `pkz` | 跟随/特效 | 三段链共用 `hit24_1/2/3`，二段 `setDestroyWhenLastFrame(false)`，三段触发时销毁二段。 |
| `swordskill3_1/2`、`jianqi` | `hit25_1/2` 与龙魂剑 | 跟随/移动 | `showSkill()` 没有主动技能名进入 `skill_nlj()`，当前只登记对象事实。龙魂剑时释放 `jianqi`，速度 `34`、距离 999。 |
| `swordskill4` | `lxj` | `FollowBaseObjectBullet`，禁碰撞 | 添加 `ROLE5LOONGSWORD`；本体不直接作为伤害段。 |
| `sword_jrjlsf` / `sword_jrjljq` | `jrjl` 与 `JRJL.toShoot()` | 禁碰撞视觉 / `EnemyMoveBullet` | `jrjljq` 速度 `60`、距离 2000、动作 `hit30`；`JRJL` 每次只检测第一枚箭是否充满。 |
| `swordskill5_3` / `swordskill5_2` / `swordskill5_1` | `lysh` 和 `BLMSkill5` | 随身 MC / 移动弹 / 禁碰撞跟随 | `BLMSkill5` 四枚箭随主人，充满后 `toShoot()` 逐枚隐藏并调用 `addSkill5_3()` 发射 `swordskill5_2`，速度 `22`、距离 2000、动作 `hit27_3`。 |
| `sword_mlsz1..5` / `*_1` | `mlsz/hit29` | `SpecialEffectBullet` | 五个帧点依次生成；全部使用 `hit29` 结算，龙魂剑状态改用强化资源名。 |

当前 `dolxjfeijian()` 是空函数。虽然 `lxj` 状态下许多动作有 25% 调用它，但没有可观察 projectile 证据，现代实现不应猜造“飞剑追加弹体”；只能在 UI/反馈层记录触发机会或暂留缺口。

## 5. 伤害和状态边界

- `getRealPower()` 末尾统一乘 `1.21`。若处于 GXP，另乘 `1.3`。
- `ROLE5LOONGSWORD` 使伤害乘 `1.09 + lxjLevel * 0.008`；学习 `jrjl` 后再乘 `1.045 + jrjlLevel * 0.0036`。
- 剑普攻 `hit18/19/20/22` 系数约 `2.729 * hurt`；`hit21` 为三段口径，`2.729 / 3`；跑动剑攻 `hit115` 为 `4.1 * hurt`。
- 主动技使用 `SkillFixedDamage`、`FixedDamageCount`、`SkillFactor` 共同派生固定伤害和攻击系数；现代实现应锁定每个动作的最终等价伤害，避免重复套固定伤害表和末尾倍率。
- `reduceHp()` 和 `setAttackBack()` 为多项白龙动作提供抗硬直或减伤：`hit7`、`hit10_1/2`、`hit23`、`hit24_*`、`hit25_*`、`hit27_2`、`hit28`、`hit29` 等不触发受击硬直；`hit10_1/2` 受伤乘 `0.75`，`hit25_1` 受伤乘 `0.9`。
- `ROLE5TLJ`、`ROLE5JRJL`、`ROLE5SKILL4` 在 `BaseAddEffect` 中有显示和隐藏函数，主要是状态视觉；具体数值效果主要由 `Role5.getRealPower()` 和白龙自身动作逻辑读取。

## 6. 现代拆分建议

建议按以下顺序拆成可验收切片：

1. 枪/剑形态、速度差异、两套普攻、跑攻、空中普攻和枪形态能量 `ROLE5HITADD`。
2. `xlc/lxuanj/xkjz` 枪系三项主动技能，覆盖突进、双向移动弹体和目标侧定点特效。
3. `yyb/tlj` 状态技能和 `ROLE5SKILL5` 标记瞬移闭环，明确 `ROLE5MAXENERGY` 数值缺口。
4. `pkz/lxj/mlsz` 剑系链式与龙魂剑状态，包含强化资源、五段阵列和 `dolxjfeijian()` 空函数边界。
5. `lysh/jrjl` 两套随身箭对象，覆盖充能、发射、重建、与普攻/技能触发的协同。

每个切片都应覆盖正式五槽输入、P1/P2 隔离、MP 扣除、动作门禁、projectile 清理、受击/击退边界和真实资源缺口。Role5 真素材未在当前资源索引中形成可直接接入的完整导出，现代实现继续使用稳定占位 key。



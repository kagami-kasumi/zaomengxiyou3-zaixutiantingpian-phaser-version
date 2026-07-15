# Role4 沙僧完整战斗逆向

本文记录 `export.hero.Role4` 的本地可达战斗行为，供后续现代实现拆分使用。主证据为 `local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts/export/hero/Role4.as`；巫毒娃娃另查 `export/monster/MonsterRole4Hit5.as`，猛毒素联动另查 `base/BaseAddEffect.as`。

## 1. 武器形态与基础输入

- 当前武器 id 不属于 `4/5/9/998` 时为铲形（`isNotArrow=true`），使用 `ROLE4_SHOVEL_<clothId>`；否则为弓形，使用 `ROLE4_ARROW_<clothId>`。装备层统一使用 `ROLE4_EQUIP_<weaponId>`。
- 两形态共用 `hit1..hit12` 动作名，但帧表、位移、projectile 和部分最终伤害不同。现代侧应把“武器形态”建成显式运行时状态，不复制两套角色类。
- `myKeyDown()` 只有普攻、跳跃、下落和传送门，没有 Role1/Role3/Role5 式 `0101` 组合技。
- 地面普攻为 `hit1 -> hit2 -> hit3`，1500ms 后重置；空中铲形使用 `hit2`，弓形使用 `hit3`。
- 源码存在私有 `runAttack()`，会以 20 MP 进入 `hit6`，但 Role4 内没有调用点；可达证据不足，不能把“跑动普攻触发 hit6”写成现代需求。`normalHit()` 的跑动分支只清空 `doubleCount` 后回到普通普攻。

## 2. 正式技能输入

MP 基础表为 `[66,160,208,276,364,493,703,759,801,921,1085,1133,1318,1771,1884,1954,2320,2667]`，索引为技能等级减一，统一再乘 `26483 / 25958` 并按 `uint` 截断。

| 技能 | 分类与 MP | 动作 | 本地可达行为 |
| --- | --- | --- | --- |
| `zq` | 主动，`* 0.5` | `hit4` | 铲/弓两种毒击；铲形跟随范围、弓形定点特效，均附 5 秒毒与毒层。 |
| `mbyj` | 主动，`* 0.286` | `hit6` | 500 距离内按数组顺序选择面向侧目标，最多递归跳转 8 次；每跳只排除刚命中的目标，不维护全链去重表，因此可出现 A→B→A。每次叠 7 秒毒层，78% 概率眩晕约 0.42 秒。该链自身 `hit6` 伤害为 0。 |
| `wdww` | 主动，`* 0.55` | `hit5` | 选面向侧最近敌人，创建 10 秒 `MonsterRole4Hit5` 巫毒娃娃；新娃娃会替换旧娃娃。攻击娃娃会按等级倍率把伤害转移给绑定目标。 |
| `jdz` | 主动，`* 0.82`，仅地面 | `hit7` | 先生成禁用碰撞的前置视觉，再在前方生成 3 个 `Role4Bullet7_2`；魔法多段、5 秒毒与毒层。 |
| `mds` | 被动 | 无 | `showSkill()` 分支和 `skill_mds()` 为空；真正逻辑位于 `BaseAddEffect`：已学习时，Role4 造成的毒层超过 2 会触发 `poison_times_bomb()`，并给自身 3 秒 `SPEEDUP` 视觉状态。该状态只创建/移除特效，没有移动数值修改。不是废弃主动技。 |
| `qlj` | 主动，`* 0.55`，另固定多扣 15 MP | `hit8` | 铲形前方跟随重击；弓形生成前置视觉和伤害特效，并以 `±25/-25` 斜向跃进。源码先检查动态 MP，却实际扣 `15 + 动态 MP`，现代实现应保留此双扣事实。 |
| `tkj` | 主动，`* 0.55` | `hit9` | 铲形原地前置后上跳并在上方结算；弓形前置后向上发射多段伤害，两形态伤害段数不同。 |
| `dzj` | 主动，`* 0.82` | `hit10` | 铲形生成范围特效并以 `±20` 突进；弓形先前置视觉，后在前方约 225、上方 80 结算。源码函数名拼作 `skill_dcj()`，技能名仍是 `dzj`。 |
| `lybj` | 主动/固定等级边界，`最大 MP * 0.015` | `hit11` | 首次放置最多 10 秒的标记；标记存在时再次释放传送到标记，扣首次消耗的 10%。标记离屏则先销毁，不传送。技能 UI 禁止升级。 |
| `mmw` | 主动；铲形 `* 0.64`，弓形 `* 1.1` | `hit12` | 铲形创建持续约 3.4 秒的前方多段特效；弓形执行分段位移并在三个时点各生成 10 个环形 projectile。`hit12` 期间免击退，但不免伤。 |

除 `lybj` 的“已有标记”二次入口外，主动技能统一拒绝 MP 不足、攻击中或受击中；`jdz` 额外拒绝空中。Role4 没有统一技能 CD。

## 3. Projectile 与结算映射

| 动作 | 铲形 | 弓形 | 关键结算 |
| --- | --- | --- | --- |
| 普攻 1 | `Role4Bullet1` 跟随 | `Role4BulletArrow1` 特效 | 均为魔法；弓形单段更远。 |
| 普攻 2 | `Role4Bullet2` 跟随 | 再用 `Role4BulletArrow1` | 弓形第二动作仍复用第一箭对象。 |
| 普攻 3 | `Role4Bullet3` 跟随并令角色 `±8` | `Role4BulletArrow2` 特效 | 铲形三段口径；弓形多段箭。 |
| `zq/hit4` | `Role4Bullet4` 跟随，前方约 245/上方 110 | `Role4BulletArrow4` 特效，前方约 30 | 5 秒毒；铲形伤害按 2 段口径，弓形单段。 |
| `wdww/hit5` | `Role4Bullet5` 禁碰撞视觉 | 同对象、不同帧点 | 第 14 帧选择目标并创建 `MonsterRole4Hit5`。 |
| `mbyj/hit6` | `Role4Bullet6` 禁碰撞、跨目标 Tween | 同 | 最多 8 跳；无直接伤害，叠毒层/概率眩晕。 |
| `jdz/hit7` | `Role4Bullet7_1` 前置 + 3 个 `Role4Bullet7_2` | 同 | `hit7` 魔法多段、毒和毒层。 |
| `qlj/hit8` | `Role4Bullet8` 跟随 | `Role4BulletArrow8_1` 禁碰撞 + `Arrow8_2` 特效 | 两形态同总系数，弓形伴随斜向位移。 |
| `tkj/hit9` | `Role4Bullet9_1` 禁碰撞 + `9_2` 跟随 | `Role4BulletArrow9_1` 禁碰撞 + `Arrow9_2` 跟随 | 铲形单段总伤；弓形按 5 段口径。 |
| `dzj/hit10` | `Role4Bullet10` 特效 | `Role4BulletArrow10_1` 禁碰撞 + `Arrow10_2` 特效 | 铲形按 5 段口径并突进；弓形单段远端结算。 |
| `lybj/hit11` | `Role4Bullet11` 禁碰撞、最多 10 秒 | 同 | 首次放标记，二次传送；对象本身伤害为 0。 |
| `mmw/hit12` | `Role4Bullet12` 特效，寿命约 3.4 秒 | `Arrow12_1` 前置、`Arrow12_2` 跟随伤害、每波 10 个 `Arrow12_3` 环阵 | 铲形按约 4.6 段口径；弓形按 34 段口径。 |

所有 Role4 攻击类型在 `attackBackInfoDict` 中均标为 `magic`。技能最终伤害还会统一乘 `getRealPower()` 末尾的 `1.154`；现代实现应锁定“最终等价伤害”，避免把固定伤害表、技能系数、分段除数和末尾倍率重复套用。

## 4. 支援、控制与状态边界

- 巫毒娃娃生命按目标最大生命、技能等级和 `x_num=0.28098` 派生；继承目标物防/魔防，持续 10 秒或目标死亡后销毁。攻击娃娃时，娃娃先按原伤害承伤，再把等级缩放后的伤害转移给目标；娃娃无击退。
- `mds` 毒爆只在毒层刷新且来源角色为 Role4 时检查。毒层上限按 6 参与公式；爆炸会伤害怪物、给 Role4 治疗约最大生命 15%，并提供约同值的 6.6 秒护盾。`MonsterRole4Hit5` 作为效果来源时明确拒绝毒爆，避免娃娃递归触发。
- `lybj` 标记由 `step()` 计时，正好到 `gc.frameClips * 10` 时销毁；没有跨场景持久化证据。
- `reduceHp()` 在 `isGXP`、`hit12` 或 `tjgl_Shield` 时只关闭受击硬直参数；真正伤害仍会结算。`setAttackBack()` 在这些状态下拒绝击退。
- 当前提取资源中未检出 `Role4Bullet*` 名称，现代实现需要稳定占位 key；不要伪造“已找到真素材”。

## 5. 现代拆分建议

建议按以下顺序拆成窄切片：

1. 武器形态 + 两套三段普攻。
2. `zq/jdz/mds` 毒层与毒爆闭环。
3. `wdww` 巫毒娃娃与伤害转移。
4. `mbyj/qlj/tkj/dzj` 链式控制和形态位移。
5. `lybj/mmw` 标记传送与终结技。

每个切片都应覆盖铲/弓差异、P1/P2 隔离、MP 实际扣除、动作恢复、projectile 清理和无目标边界。像素级碰撞与真实素材继续后置。

现代实现状态：`TASK-SLICE-100..104` 已完成上述五段拆分。对应系统为 `Role4PoisonSkillSystem.ts`、`Role4VoodooDollSystem.ts`、`Role4PoisonChainSystem.ts`、`Role4MobilitySkillSystem.ts`、`Role4FinisherSkillSystem.ts`，并接入 Role4 场景桥接和独立 system tests；真实角色/技能素材仍按全局资源任务后置。



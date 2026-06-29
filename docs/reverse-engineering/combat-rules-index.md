# 基础互伤规则索引

本文记录 `TASK-SETTINGS-007` 的逆向结果，目标是支撑 `VS-006 基础伤害闭环`：在已完成的五角色普攻切片和 `Monster30` 受击死亡切片之上，实现“玩家能伤怪、怪能伤玩家、受击/死亡可观察”的第一版闭环。

范围只覆盖首个互伤切片所需规则。完整技能、复杂子弹、装备特效、掉落、经验、boss 反击和联网同步不是本文实现范围。

## 证据入口

- `extracted_flash/resources_by_swf/[172845].swf/scripts/base/BaseBullet.as`
- `extracted_flash/resources_by_swf/[172845].swf/scripts/base/BaseObject.as`
- `extracted_flash/resources_by_swf/[172845].swf/scripts/base/BaseHero.as`
- `extracted_flash/resources_by_swf/[172845].swf/scripts/base/BaseMonster.as`
- `extracted_flash/resources_by_swf/[172845].swf/scripts/export/monster/Monster30.as`
- `extracted_flash/resources_by_swf/[172845].swf/scripts/export/hero/Role1.as` 至 `Role5.as`
- `docs/reverse-engineering/roles-index.md`
- `docs/reverse-engineering/monsters-index.md`
- `docs/reverse-engineering/attack-effects-index.md`

## 总结论

原版互伤的核心链路是：

1. 攻击方调用 `newAttackId()` 后切换 `hit*` 动作。
2. 动作帧中创建 `BaseBullet` 子类，例如 `SpecialEffectBullet` 或 `FollowBaseObjectBullet`。
3. 子弹 `setRole(source)` 记录攻击来源和当前攻击编号。
4. 子弹 `setAction(action)` 从来源的 `attackBackInfoDict[action]` 读取命中次数、命中间隔、攻击类型、击退和保护分。
5. `BaseBullet.checkAttack()` 选取敌对目标数组，按 `target.beAttackIdArray` 做同一攻击去重。
6. 目标侧 `beMagicAttack(bullet, source)` 做碰撞、闪避、伤害、防御、击退、扣血、受击反馈和死亡状态。
7. 命中成功后，子弹把 `attackId` 写进目标 `beAttackIdArray`，并减少 `maxAttackCount`。

现代首个互伤切片不需要照搬 Flash 子弹对象结构，但必须保留这些可观察规则：

- 每次攻击实例有唯一 `attackId`。
- 同一攻击实例对同一目标只结算一次，除非该攻击有明确的多段/间隔规则。
- 伤害来源动作有 `attackKind`、`power/hurt`、`attackBackSpeed` 和命中次数等配置。
- 受击方扣 HP 后进入受击反馈；HP 归零进入死亡流程。
- 短暂无敌/保护用于防止连续受击过密，但第一版可用简化值。

## 命中目标选择

`BaseBullet.checkAttack()` 根据攻击来源决定目标数组：

| 来源 | 目标 |
| --- | --- |
| `BaseHero` 或 `BasePet` | `monsterArray + likeMonsterArray` |
| 普通 `BaseMonster` | 玩家数组 + `likeMonsterArray` |
| 部分特殊怪 `Monster70` 至 `Monster78` | 玩家数组 |
| PK 模式 | 对手玩家 |
| 房间/联网模式 | 其他玩家与 `likeMonsterArray` |

首个现代切片只需要单机规则：

- 玩家普攻命中怪物。
- `Monster30` 攻击命中玩家。
- 暂不处理宠物、`likeMonsterArray`、PK、房间/联网。

## 命中去重与命中次数

证据：

- `BaseObject.newAttackId()` 每次攻击递增攻击编号。
- `BaseBullet.setRole(source)` 把 `attackId` 设为来源当前编号。
- `BaseBullet.getAttackId()` 返回 `name + attackId`，以子弹显示对象名和攻击编号组合成去重 key。
- `BaseBullet.checkAttack()` 在目标 `beAttackIdArray` 中查找当前 `attackId`；不存在才调用 `beMagicAttack()`。
- 命中成功后，目标写入 `beAttackIdArray`，子弹 `maxAttackCount--`。
- 当 `attackIntervalCount == attackInterval` 时，子弹会 `newAttackId()` 并重置间隔计数，因此支持同一个持续攻击每隔一段时间再次命中。

首个现代切片建议：

- 为每次 `HeroNormalAttack` 和 `Monster30` 攻击生成 `attackId`。
- 用 `Set<attackerId + attackId + targetId>` 或目标侧 `recentAttackIds` 防止重复命中。
- 首批普攻可把 `attackInterval = 999` 视为单次命中。
- 保留 `maxAttackCount` 字段，但首批只需要 `1` 或当前占位系统已有的一次命中。

## 攻击参数来源

攻击参数来自攻击方 `attackBackInfoDict[action]`。核心字段：

| 字段 | 含义 | 首批取舍 |
| --- | --- | --- |
| `hitMaxCount` | 一个攻击对象最大命中次数 | 保留为 `maxHits` |
| `attackBackSpeed` | 受击方击退速度 `[x, y]` | 首批可用于简单击退 |
| `attackInterval` | 持续攻击再次命中的间隔计数 | 首批普攻/`Monster30` 可近似单次 |
| `power` | 怪物攻击的基础伤害 | `Monster30 hit1` 必须使用 |
| `attackKind` | `physics` 或 `magic` | 保留，用于防御公式分支 |
| `addprotection` | boss/怪物受击蓄积条用保护分 | 首批可记录但不实现 boss 反击 |
| `addEffect` | 附加 debuff/buff | 后置 |

### 玩家普攻参数

五角色普攻都经 `getRealPower(action)` 计算最终 `hurt/qixue/atk`。首批无需完整复刻装备、暴击和吸血，只要保留“动作决定基础伤害系数”的事实。

| 角色 | 普攻动作 | `attackKind` | 关键参数 |
| --- | --- | --- | --- |
| Role1 悟空 | `hit1` 至 `hit5` | `physics` | `hit1-3` 伤害约 `2.0875 * Hurt`；`hit4/5`略高；可暴击 |
| Role2 唐僧 | `hit1` | `magic` | `hit1` 约 `3.97 * 0.81 * 6201 / 6550 * Hurt`；首个魔法普攻候选 |
| Role3 八戒 | `hit1/hit2/hit3` | `physics` | 三段普攻约 `3.119 * 6201 / 6782 * Hurt`；可暴击 |
| Role4 沙僧 | `hit1/hit2/hit3`、箭形 `hit1Arrow/hit2Arrow` | `magic` | 铲形和弓形动作名/特效分开；弓形多段会按 `/3` 分摊 |
| Role5 白龙 | 枪形 `hit1-5/hit114`、剑形 `hit18-22/hit114_1` | `physics` | 剑形 `hit18/19/20/22` 约 `2.729 * Hurt`；`hit21` 多段 `/3` |

首个 `VS-006` 实现建议不要直接引入玩家属性系统；可用当前占位普攻系统的 `damage` 作为 `hurt`，但结构上保留 `attackKind` 和动作 key，后续再接 `getRealPower()` 等价计算。

### Monster30 攻击参数

`Monster30` 构造函数中：

```text
attackBackInfoDict["hit1"] = {
  hitMaxCount: 99,
  attackBackSpeed: [6, -5],
  attackInterval: 999,
  power: 15,
  attackKind: "physics"
}
```

`Monster30.enterFrameFunc()` 在 `hit1` 的停顿计数为 10 时创建 `SpecialEffectBullet("Monster30Bullet1")`，位置为怪物当前 `x/y`，随后 `setRole(this)`、`setDirect(...)`、`setAction("hit1")`。

首个现代切片应把 `Monster30 hit1` 从“仅状态表现”推进为：

- 进入 `hit1` 后在动作中段生成一个攻击窗口。
- 攻击窗口使用 `power = 15`、`attackKind = physics`。
- 命中玩家时扣 HP，并用 `[6, -5]` 或等价占位击退。

## 玩家攻击怪物链路

原版链路：

1. 角色 `normalHit()` 或技能设置 `hit*`，调用 `newAttackId()`。
2. 角色帧回调 `enterFrameFunc()` 在指定帧创建普攻附属对象，例如 `Role2.doHit1()` 创建 `SpecialEffectBullet("Role2Bullet1")`。
3. 子弹 `setRole(hero)`、`setAction("hit1")` 后读取 `Role2.attackBackInfoDict["hit1"]`。
4. `BaseBullet.checkAttack()` 选择 `monsterArray + likeMonsterArray`。
5. 怪物 `BaseMonster.beMagicAttack()`：
   - 若 `isYourFather` 保护中，返回 false。
   - 做碰撞和闪避判定。
   - 设置 `curAttackTarget = attacker`。
   - 读取 `sourceRoleAttackInfoObject`，计算击退并 `setAttackBack()`。
   - 计算真实伤害 `getRealHurt()`。
   - 调用 `reduceHp(hurt, true/false)`。
   - 累加 `beattackedtimes`；boss 达阈值时短暂无敌和可能反击。
   - 死亡时 `setYourFather(frameClips * 99)` 并 `setAction("dead")`。
   - 未死亡时显示血条和受击特效。

`BaseMonster.getRealHurt()` 对怪物防御的核心规则：

- `physics`：按 `(bullet.atk - monster.def) / bullet.atk` 修正，结果上限约 `1.1 * hurt`，低于 0 时最低为 `1`。
- `magic`：按 `1 - monster.mDef` 修正，上限约 `1.1 * hurt`，低于 0 时最低为 `1`。

首个现代切片建议：

- 继续使用当前 `HeroNormalAttackSystem` 的命中框作为玩家攻击源。
- 保留每次攻击唯一 `attackId` 和目标命中去重。
- 对 `Monster30` 先用简化防御公式：
  - `physics`: `max(1, damage - def)` 或后续再升级为比例公式。
  - `magic`: `max(1, floor(damage * (1 - mDef)))`。
- 命中后 `Monster30` 进入 `hurt`；HP 归零进入 `dead`，沿用现有死亡移除。
- `beattackedtimes`、boss 受击条、吸血、暴击、闪避、守护、debuff 全部后置。

## 怪物攻击玩家链路

原版链路：

1. 怪物 AI 在范围内调用 `attackTarget()`：`newAttackId()`、`setAction("hit1")`、`lastHit = "hit1"`、`faceToTarget()`。
2. `Monster30.enterFrameFunc()` 在 `hit1` 中段创建 `Monster30Bullet1`。
3. `BaseBullet.checkAttack()` 对怪物来源选择玩家数组作为目标。
4. 玩家 `BaseHero.beMagicAttack()`：
   - 若 `isYourFather`、`hmzFather` 或 `lysFather` 保护中，返回 false。
   - 做碰撞判定。
   - 计算玩家闪避；闪避时显示 miss 并写入 `beAttackIdArray`。
   - 读取怪物 `getRealPower("hit1").hurt`，`Monster30` 即 `power 15`，可能暴击。
   - 读取怪物 `attackBackInfoDict["hit1"]`。
   - `countHurt()` 按玩家防御或魔防修正：
     - `physics`: `hurt - totalDefense`，最低 `1`。
     - `magic`: 按玩家魔防比例修正，上限约 `1.1 * hurt`。
   - `reduceHp(hurt, true)` 扣玩家 HP，未死时切 `hurt`，死亡时 `destroy()` 并派发 `heroDead`。
   - `setAttackBack()` 施加击退。
   - `beAttackDoing()` 累计玩家受击条，超过阈值后短暂无敌。

玩家 `reduceHp()` 的首批可观察结果：

- HP 减少。
- 未死亡且参数允许时 `setAction("hurt")`，并清空 `doubleCount`。
- HP 归零后触发死亡流程；原版还有复活装备、法宝、联网同步，首批后置。

`beAttackDoing()`：

- 记录本次受击时间。
- 按两次受击间隔累加 `beattackedtimes`，越密集加得越多，上限步进为 3。
- UI 受击条超过 19 时，调用 `setYourFather(frameClips * 3)`，约 3 秒保护，并清空受击条。

首个现代切片建议：

- 给玩家模型增加 `hp/maxHp/state/hurtUntilMs/invulnerableUntilMs`。
- `Monster30 hit1` 命中玩家时造成 `15` 基础物理伤害；首版可直接扣 `15` 或扣除简单防御后最低 `1`。
- 命中后玩家进入短受击状态，显示受击反馈，移动可暂时中断或保持最小击退。
- 受击后给一个短保护窗口，例如 300 至 500 ms；密集受击条与 3 秒保护可后续细化。
- HP 归零后进入死亡状态；首批可显示死亡/禁用输入，不接复活装备。

## 击退与保护

### 击退方向

`BaseObject.getBeattackBackSpeed()` 从攻击参数复制 `attackBackSpeed`，再根据子弹类型、子弹方向和攻击者位置修正 x 方向。`BaseObject.setAttackBack()` 最终：

- 根据 x 正负设置受击方左右方向。
- 对怪物靠近屏幕边界时限制水平击退。
- `speed.x = attackBackSpeed.x * 2`。
- `speed.y = attackBackSpeed.y`。
- 用 0.4 秒 tween 把 `speed.x` 衰减到 20%。

首个现代切片建议：

- 玩家与怪物都保留一个 `knockbackVelocity` 或直接复用移动速度。
- x 方向按攻击来源相对位置决定，y 方向使用攻击参数。
- 怪物被玩家打中时可以先只播放 `hurt`，击退可做弱占位。
- 玩家被 `Monster30` 打中时建议实现明显击退，因为 `[6, -5]` 是原版 `Monster30` 的关键反馈。

### 保护/短暂无敌

`BaseObject.setYourFather(frames, transparent)` 设置 `isYourFather = true`，并通过 `fatherCount` 倒计时清除。目标处于保护时：

- 怪物 `beMagicAttack()` 直接返回 false。
- 玩家 `beMagicAttack()` 在 `isYourFather/hmzFather/lysFather` 任一为 true 时返回 false。
- 怪物死亡后会获得 `frameClips * 99` 保护，避免尸体继续受击。
- 玩家受击条满后会获得 `frameClips * 3` 保护。

首个现代切片建议：

- 玩家受击后设置 `invulnerableUntilMs`，避免 `Monster30` 同一攻击或连续攻击快速多次扣血。
- 怪物死亡后不再接受伤害。
- 不实现透明闪烁也可以，但需要有调试状态显示。

## VS-006 最小实现边界

建议新增 `TASK-SLICE-004` 实现以下内容：

- `DamageEvent`：包含 `sourceId`、`targetId`、`attackId`、`amount`、`attackKind`、`knockback`。
- 命中去重：目标记录近期 `attackId`，同一攻击实例只结算一次。
- 玩家生命模型：`hp/maxHp/state/hurtUntilMs/invulnerableUntilMs`。
- 玩家攻击怪物：复用 `HeroNormalAttackSystem` 的 hitbox，命中 `Monster30` 后扣 HP、触发 `hurt/dead`。
- 怪物攻击玩家：让 `Monster30 hit1` 生成占位攻击窗口，命中玩家后扣 HP、击退、短受击/保护。
- 调试显示：玩家和怪物 HP、状态、最近一次 `DamageEvent`。
- 验证：`npm run build` 通过；测试场景中玩家能打死怪物，怪物也能把玩家 HP 打低或打到死亡状态。

明确后置：

- 完整 `getRealPower()` 数值公式和角色属性系统。
- 暴击、闪避、吸血、守护、韧性、装备/法宝/宠物联动。
- boss 受击条、保护条反击和技能释放。
- 所有技能子弹与持续多段攻击。
- 真实像素级碰撞与 `HitTest.complexHitTestObject()`。
- 联网、PK、房间模式目标选择。

## 仍需后续任务的缺口

- `M-034 子弹/技能飞行物` 已在后续 `projectiles-index.md` 补到部分已扒；`VS-006` 当时只需要 `Monster30Bullet1` 和普攻占位窗口，不扩成完整 `ProjectileSystem`。
- 玩家属性、装备、暴击、吸血和防御的完整公式依赖装备/成长系统，当前只记录接口和第一版取舍。
- `Role5` 枪形态普攻 `doSingleHit(...)` 仍是反编译缺口；这不阻塞 `VS-006`，因为现代侧已有占位攻击窗口。
- 复活装备、死亡 UI、失败流程不属于 `VS-006`，后续关卡或存档/UI 阶段再处理。



# 怪物系统索引

本文是 `TASK-SETTINGS-004A` 的产物，先记录 `BaseMonster` 基类和怪物运行链路。范围不包含具体怪物候选排序，也不细扒某一个怪物；后续由 `TASK-SETTINGS-004B/004C` 扩展。

## 结论

- 怪物由 `MainGame.createMonster(kind, x, y)` 动态创建 `export.monster.Monster{kind}`，加入 `gc.pWorld.monsterArray`，再放进当前 `gameSence`。
- 每帧由 `PhysicsWorld.step()` 驱动：先更新怪物自己的 `magicBulletArray`，再调用怪物 `step()`，最后把 `isReadyToDestroy` 的怪物从 `monsterArray` 移除。
- `BaseMonster` 继承 `BaseObject`。`BaseObject.step()` 负责动画、速度、碰撞、移动、buff、法宝、飘字等通用行为；`BaseMonster.step()` 在此基础上追加 AI、技能冷却、目标有效性、回血、boss 受击条和飞行怪位置限制。
- 基础 AI 是“无目标随机走动/等待 -> 找最近玩家 -> 进入警戒后追踪 -> 攻击范围内按概率普攻或释放技能”。
- 怪物受击入口是 `BaseMonster.beMagicAttack(bullet, source, forceHit = false)`；子弹命中检查在 `BaseBullet.checkAttack()` 中调用，并用 `beAttackIdArray` 防止同一个攻击实例重复命中。
- HP 归零时 `BaseMonster.reduceHp()` 切到 `dead` 动作并发经验。真正掉落和销毁通常不是基类立即执行，而是具体 `Monster*` 的 `scriptFrameOverFunc()` 在 `dead` 动画结束时调用 `dropAura()` 和 `destroy()`。
- 掉落入口分三层：`dropAura()` 先调用药品和装备掉落，再生成红/白 aura；`fallEquip()` 按 `fallList` 和 `probability` 掉装备/道具；`fallStone()` 是强化石掉落入口，但不是所有死亡流程都调用。

## AS3 证据

主要文件：

- `extracted_flash/scripts/172845/scripts/base/BaseMonster.as`
- `extracted_flash/scripts/172845/scripts/base/BaseObject.as`
- `extracted_flash/scripts/172845/scripts/base/BaseBullet.as`
- `extracted_flash/scripts/172845/scripts/my/MainGame.as`
- `extracted_flash/scripts/172845/scripts/World/PhysicsWorld.as`
- `extracted_flash/scripts/172845/scripts/export/monster/Monster1.as`
- `extracted_flash/scripts/172845/scripts/export/monster/`

## 创建和世界循环

### 创建入口

`MainGame.createMonster(kind, x, y)`：

1. 通过 `AUtils.getNewObj("export.monster.Monster" + kind)` 创建具体怪物类。
2. 设置 `x/y` 和 `sid = getTimer()`。
3. 推入 `gc.pWorld.monsterArray`。
4. 通过 `gc.getMinIdxInHeroAndPet()` 计算显示层插入位置。
5. `gc.gameSence.addChildAt(monster, minIdx)`。

这说明现代版不应让关卡直接 new 具体显示对象。更合适的映射是：

- `MainGame.createMonster -> EntityFactory.createMonster()`
- `monsterArray -> EntityManager.monsters`
- 显示层插入顺序 -> 渲染系统按 y 或层级排序

### 每帧更新入口

`PhysicsWorld.step()` 对 `monsterArray` 的处理顺序：

1. 如果 `isSourceReady == false`，直接返回。
2. 遍历 `monsterArray`。
3. 对未 `isReadyToDestroy` 的怪物，先更新其 `magicBulletArray` 中的子弹 `step2()`。
4. 清理怪物子弹数组中 `isReadyToDestroy` 的子弹。
5. 调用怪物 `step()`。
6. 如果怪物 `isReadyToDestroy`，放进待清理数组。
7. 遍历后从 `monsterArray` 移除待清理怪物。

注意：`destroy()` 会渐隐并延后从显示列表移除，而 `PhysicsWorld.step()` 会先从逻辑数组移除。现代版可以拆成 `dead`、`dying`、`removed` 三个阶段，避免“逻辑已移除但显示还在淡出”的状态混在一个布尔值里。

## BaseMonster 字段

### 战斗属性

`protectedParamsObject` 是怪物属性大杂烩，默认包含：

| 字段 | 含义 |
| --- | --- |
| `exp` | 击杀经验 |
| `gxp` | aura/成长类收益 |
| `def` | 物理防御 |
| `mDef` | 魔法减伤比例，默认 `0.2` |
| `Dodge` | 闪避 |
| `Critical` | 暴击 |
| `Hit` | 命中 |
| `Toughness` | 韧性，影响被暴击 |
| `Guardian` | 守护/减伤 |
| `ReduceMagicDef` | 降低魔防相关 |
| `rehp` | 每秒回血 |
| `probability` | 装备/道具掉落基础概率，默认 `0.15` |
| `stoneFallRate` | 强化石掉落概率 |

HP 和等级不是普通字段，而是拆成两段保存：

- `setHp()` 写入 `hp1/hp2`
- `getHp()` 返回 `hp1 + hp2`
- `setSHp()` 写入 `sHp1/sHp2`
- `getSHp()` 返回 `sHp1 + sHp2`
- `setLevel()`/`getLevel()` 同理

这是旧版反作弊写法，现代版不用照搬拆字段；保留可观察属性即可。

### AI 和攻击

| 字段 | 默认或用途 |
| --- | --- |
| `alertRange` | 警戒范围，默认 `1000` |
| `attackRange` | 攻击范围，默认 `100`，具体怪物会覆盖 |
| `normalAttackRate` | 普攻概率；非 boss 默认约 `0.366`，boss 默认约 `0.423` |
| `waitRateWhenNoTarget` | 无目标时等待概率，默认 `0.137` |
| `curAttackTarget` | 当前攻击目标 |
| `lastAttackTarget` | 上一个攻击目标 |
| `skillCD1` 至 `skillCD5` | 技能冷却 `[当前剩余, 冷却间隔]` |
| `isBoss` | boss 标记 |
| `monsterName` | boss 血条/显示用名称 |
| `fallList` | 掉落候选列表 |

构造函数还给怪物写入默认 `attackBackInfoDict["hit1"]`，具体怪物通常在自己的构造函数中覆盖 `hit1/hit2/...` 的 `power`、`attackKind`、`attackBackSpeed` 和附加效果。

## 初始化和难度修正

`BaseMonster.__added()` 在怪物加入显示列表后执行：

- 调用 `BaseObject.__added()`。
- boss 会向 `gc.gameInfo` 添加 boss 血条和受击蓄积条。
- 初始化 `skillCD1` 至 `skillCD5`。boss 默认 CD 是 `2.5s/5s`，普通怪默认 `3s/5s`，但具体怪物可先写入自己的 CD。
- 初始化 `normalAttackRate`。boss默认约 `0.423`，普通怪默认约 `0.366`。
- 根据 `gc.difficulity` 修正属性：
  - 难度 1：HP * 1.45，防御/经验/成长提高，魔防 + 0.12，掉率提高，普攻率提高到 `0.85`。
  - 难度 2：经验/成长和掉率大幅压低，普攻率约三倍但上限 `0.89`。
- `gc.isLWYP && isBoss` 时，boss 掉率强制为 `1`。

现代版建议把这些作为 `MonsterStatsSystem.applyDifficulty()`，不要藏在显示对象 `ADDED_TO_STAGE` 事件里。

## AI 更新

`BaseMonster.step()` 的怪物侧流程：

1. 调用 `super.step()`，执行 `BaseObject` 的动画、移动、碰撞、buff 和飘字。
2. `addcount()` 递增 `count`，超过 `gc.frameClips * 10` 后归零。
3. 未死亡时调用 `IntelligenceTime()`，默认进入 `myIntelligence()`。
4. 每秒检查 `protectedParamsObject.rehp`，有回血时恢复 HP，boss 同步 boss 血条。
5. `countCD()` 递减 `skillCD1` 至 `skillCD5` 的当前剩余时间。
6. boss 和普通怪分别衰减 `beattackedtimes`，boss 同步受击条。
7. 如果当前目标死亡或将被移除，清空 `curAttackTarget`。
8. 飞行怪会做额外 y 速度衰减和屏幕 y 限制。

### 无目标行为

`myIntelligence()` 会先判断冰冻、眩晕等 debuff。如果没有限制：

- `curAttackTarget == null`：调用 `normalWalk()`，再 `selectTarget()`。
- 目标死亡：清空目标。
- 有目标：调用 `hasAttackTarget()`。

`normalWalk()`：

- 如果站在平台 `standInObj` 上，接近平台左右边缘会转向。
- 每秒根据 `waitRateWhenNoTarget` 选择等待或 `randomWalk()`。

`randomWalk()`：

- 如果屏幕坐标超过左右边界，转回屏幕内。
- 否则随机左右转向。

`selectTarget()`：

- 用 `AUtils.GetNearestObj("dist", this, gc.getPlayerArray())` 找最近玩家。
- 距离小于等于 `alertRange` 才设置 `curAttackTarget`。

### 有目标行为

`hasAttackTarget()`：

- 如果正在受击或攻击，直接返回。
- 依次检查 `beforeSkill1Start()` 至 `beforeSkill5Start()`，对应 CD 为 0 时释放 `releSkill*()` 并重置 CD。
- 飞行怪会尝试维持在目标上方约 `150` 像素。
- 每秒判断一次：
  - x 距离在 `attackRange` 内：按 `normalAttackRate` 普攻，否则等待或飞行跟随。
  - x 距离超出范围：地面怪 `followTarget()`，飞行怪 `flyFollowTarget()`。

默认普攻 `attackTarget()`：

- `newAttackId()`
- `setAction("hit1")`
- `lastHit = "hit1"`
- `faceToTarget()`

`beforeSkill*Start()` 和 `releSkill*()` 在基类中都是空/false，具体怪物覆写。也就是说，普通基类只能提供一套默认追踪和 `hit1` 普攻框架，真正攻击帧、子弹、技能都在具体怪物类。

## 受击和伤害

### 命中链路

典型链路：

1. 角色或怪物创建 `BaseBullet` / `SpecialEffectBullet` 等攻击显示对象。
2. 子弹 `setRole(sourceRole)` 记录来源实体和来源攻击编号。
3. 子弹 `setAction(action)` 后读取 `sourceRole.attackBackInfoDict[action]`，得到伤害、攻击类型、击退、命中间隔等信息。
4. `BaseBullet.checkAttack()` 遍历目标数组；如果目标 `beAttackIdArray` 不含当前 `bullet.getAttackId()`，调用目标 `beMagicAttack(bullet, sourceRole)`。
5. 命中成功后把攻击 id 写入目标 `beAttackIdArray`，并递减子弹 `maxAttackCount`。

怪物侧受击入口是 `BaseMonster.beMagicAttack()`。

### BaseMonster.beMagicAttack()

关键行为：

- 如果怪物处于 `isYourFather` 保护状态，直接不受击。
- 使用 `HitTest.complexHitTestObject()` 或 `AUtils.testIntersects()` 检查子弹和怪物 `colipse`。
- 根据怪物 `Dodge` 和攻击者的深度命中属性判断闪避；闪避时显示 `miss` 并记录攻击 id。
- 设置 `curAttackTarget = attacker`，怪物会转向/追击攻击者。
- 根据子弹来源攻击信息计算击退 `getBeattackBackSpeed()` 并调用 `setAttackBack()`。
- 追加攻击附带 debuff 到 `curAddEffect`。
- 计算真实伤害 `getRealHurt()`：
  - `attackKind == "physics"` 使用攻击者 `atk` 和怪物 `def` 做比例修正，下限至少 1，上限约 1.1 倍。
  - `attackKind == "magic"` 使用 `1 - mDef` 做比例修正，下限至少 1，上限约 1.1 倍。
- 处理暴击、韧性、守护、吸血、特殊角色/子弹效果。
- 调用 `reduceHp(hurt, shouldShowHurtAction)`。
- 更新 boss 受击条 `beattackedtimes`，达到阈值时给 boss 短暂无敌并可能触发技能反击。
- 死亡时切 `dead` 动作并取消效果；未死亡时显示血条和受击特效。
- 派发 `MonsterIsBeat` 事件，播放受击音效。

现代版首个切片可以先保留：

- 命中去重：`attackId` / `hitRegistry`
- HP 扣减
- 受击硬直或动作切换
- 死亡动作

可以后置：

- 闪避、暴击、韧性、守护
- boss 受击条和反击技能
- 吸血、宠物经验、复杂角色联动
- 像素级 `complexHitTestObject`

## 死亡、经验和销毁

`BaseMonster.reduceHp()`：

- 未死亡时 `setHp(getHp() - hurt)` 并重画怪物血条。
- HP 归零后：
  - 若当前动作不是 `dead`，切到 `dead`。
  - 如果 `curAttackTarget` 是英雄，给英雄或英雄宠物增加经验。
  - 如果 `curAttackTarget` 是宠物，给宠物增加经验。
  - boss 同步 boss 血条。
- 未死亡且参数允许时切到 `hurt` 动作。

`isDead()`：

- `getHp() <= 0`

具体怪物一般在 `scriptFrameOverFunc()` 的 `dead` 分支里做：

- `dropAura()`
- `destroy()`

`Monster1` 是标准例子：

- `hit1/hit2/hurt` 动画结束后回到 `wait`。
- `dead` 动画结束后调用 `dropAura()` 和 `destroy()`。

`BaseMonster.destroy()`：

- 派发 `MONSTER_DESTROY` 事件。
- 如果是 boss，从 `GameInfo` 移除 boss 血条和受击条。
- 销毁 `curAddEffect`。
- Tween 透明度到 0，完成后从显示列表移除并销毁 `bbdc`。
- 设置 `isReadyToDestroy = true`，让 `PhysicsWorld.step()` 从 `monsterArray` 移除。
- 销毁自身 `magicBulletArray` 中的子弹。
- 清空目标、掉落列表、保护属性、技能 CD、血条引用。
- 从 `gc.protectedPerproty` 移除属性。

现代版建议：

- `hp <= 0 -> state = DeadAnimating`
- 死亡动画完成事件 -> `DropSystem.spawnDrops()` -> `EntityManager.markRemoving()`
- 淡出只影响渲染，不影响逻辑数组清理规则

## 掉落入口

### dropAura()

怪物死亡后的主掉落入口。非 `curStage == 98` 时先调用：

- `addMedicine()`
- `fallEquip()`

随后按击杀者生成 aura：

- 红色 aura：`2 + floor(random * 3)` 个，`power = gxp * 2`。
- 白色 aura：小概率生成 1 至 3 个。

`curAttackTarget` 可能是宠物；此时会映射回宠物来源英雄。

### fallEquip()

装备/道具掉落入口：

- 用 `getQualifiedClassName(this)` 得到怪物类名，非难度 2 时调用 `gc.allTask.killMonster(className)`。
- 基础概率来自 `protectedParamsObject.probability`，boss 额外乘 `1.5`。
- 玩家时装掉落加成会提高概率。
- 掉落内容来自 `fallList`，通过 `getMonsterDrop(fallList, user)` 做动态权重选择。
- 生成 `FallEquipObj`，加入 `gameSence` 和 `gc.otherList`。

### fallStone()

强化石掉落入口：

- 概率来自 `protectedParamsObject.stoneFallRate`，也受玩家时装掉落加成影响。
- 成功时生成 `wpqhs1` 的 `FallEquipObj`。

注意：本次只确认入口和职责，不确认所有怪物是否调用 `fallStone()`。装备、掉落表和背包权重后续应由装备/掉落任务单独处理。

## 具体怪物类职责

`BaseMonster` 只提供通用行为。具体 `Monster*` 通常负责：

- 设置移动速度、HP、SHp、防御、魔防、经验、成长值、掉率、掉落列表。
- 设置 `attackRange`、`alertRange`、`isBoss`、`monsterName`。
- 覆写 `initBBDC()`，从 `BaseBitmapDataPool.getBitmapDataArrayByName("MonsterX")` 读取动画资源。
- 覆写 `newColipse()`，创建碰撞盒。
- 覆写 `setAction()`，把 `wait/walk/hurt/hit*/dead` 映射到 `BaseBitmapDataClip` 的帧行。
- 覆写 `scriptFrameOverFunc()`，处理动作结束后的状态回退和死亡销毁。
- 覆写 `enterFrameFunc()`，在指定帧创建攻击子弹或特效。
- 按需覆写 `beforeSkill*Start()`、`releSkill*()`、`myIntelligence()`、`destroy()`。

这意味着 `TASK-SETTINGS-004B` 选第一个怪物时，应该优先找：

- `setAction()` 状态少。
- `enterFrameFunc()` 攻击帧少。
- 不覆写或少覆写 `myIntelligence()`。
- 不在 `destroy()` 中召唤下一阶段或其他怪物。
- 掉落列表简单。

## 现代实现建议

首个现代怪物基础应拆成这些小系统：

| 旧入口 | 现代建议 |
| --- | --- |
| `BaseMonster` | `Monster` 数据模型 + `MonsterController` |
| `protectedParamsObject` | 类型化 `MonsterStats` |
| `curAction` 字符串 | `MonsterState` 枚举或 FSM |
| `skillCD1..5` | `CooldownSet` |
| `curAttackTarget` | `TargetingSystem` 输出 |
| `myIntelligence()` | `MonsterAISystem` |
| `beMagicAttack()` | `CombatSystem.applyHit()` |
| `dropAura()/fallEquip()` | `DropSystem` |
| `magicBulletArray` | `ProjectileSystem` |
| `isReadyToDestroy` | `LifecycleState` |

首个可实现子集：

- 生成怪物。
- 每帧目标选择和简单追踪。
- `hit1` 普攻状态。
- 简单命中去重、扣 HP、受击、死亡。
- 死亡后移除实体。

后置内容：

- boss 血条和受击蓄积反击。
- 完整掉落、药品、aura。
- 难度修正和时装掉率。
- 宠物经验、任务击杀统计。
- 所有角色特殊联动。
- 复杂子弹、阶段召唤、多段 boss。

## 后续任务提示

- `TASK-SETTINGS-004B` 已完成：首选 `Monster30`，地面备选 `Monster7`。
- `TASK-SETTINGS-004C`：细扒 `Monster30`，记录移动、攻击帧、子弹、受击、死亡和清理入口。
- `VS-005` 仍不能开始实现，因为 `Monster30` 尚未细扒到可实现验收粒度。

## 具体怪物候选扫描

本节由 `TASK-SETTINGS-004B` 补充。目标是给第一个现代怪物切片选择候选，不完整扫描所有怪物行为。

### 筛选方法

初筛指标：

- 文件长度和覆写方法数量。
- 是否 `isBoss = true` 或有 boss 分支。
- 是否 `isFly = true`。
- 是否覆写 `destroy()` 并召唤阶段怪或改关卡对象。
- 是否调用 `MainGame.createMonster()`。
- 是否只有 `hit1`，还是有 `hit2/hit3` 或 `beforeSkill*Start()` 技能入口。
- 是否使用普通 `SpecialEffectBullet`，还是移动弹、跟随弹、连锁弹、多段回调。
- 是否在早期关卡或 `levels-index.md` 的第一主线关出现。

### 推荐排序

| 排名 | 怪物 | 推荐度 | 复杂度 | 关卡/来源线索 | 攻击方式 | 主要风险 |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | `Monster30` | 首选 | 低 | `StageListener11` 周期刷怪；`StageListener13/981` 注册 | 飞行怪，只有 `hit1`，创建 `SpecialEffectBullet("Monster30Bullet1")` | 是飞行怪，现代切片要支持 `isFly/graity = 0` 或先用固定悬浮简化 |
| 2 | `Monster7` | 地面备选 | 中低 | `StageListener12/13` 注册，任务表也引用 | 地面怪，`hit1` 创建 `SpecialEffectBullet("Monster7Bullet1")` | 有 `hit2` 动作映射和 `beforeSkill1Start()`，但未覆写 `releSkill1()`，细扒时要确认是否原版空技能/反编译缺口 |
| 3 | `Monster8` | 备选 | 中 | `StageListener12/13` 注册 | 地面怪，`hit1` 和 `hit2` 都创建 `SpecialEffectBullet` | 有真正 `beforeSkill1Start()` + `releSkill1()`，比 `Monster7/30` 多一个技能动作 |
| 4 | `Monster78` | 技术备选 | 中低 | 非主线普通怪线索；使用宠物兔资源 `PetPetRabbitBmd1` | 地面怪，`hit1` 发 `EnemyMoveBullet("PetPetRabbitBullet1")` | 更像宠物/特殊系统复用怪；死亡只 `destroy()`，不走 `dropAura()` |
| 5 | `Monster77` | 技术备选 | 中低 | 非主线普通怪线索；使用宠物龙资源 `PetDragonBmd1` | 地面怪，`hit1` 发 `SpecialEffectBullet("PetDragon1Bullet1")` | 更像宠物/特殊系统复用怪；有 `hit2` 映射但 `isAttacking()` 只认 `hit1` |

### 不推荐作为第一怪物的早期怪

| 怪物 | 原因 |
| --- | --- |
| `Monster2` | 早期关卡会注册，但存在 boss 分支、`hit2`、`beforeSkill1Start()`、覆写 `destroy()` 并可能显示传送门。 |
| `Monster4` | 早期关卡会注册，但存在 boss 分支、`hit2` 多段攻击和覆写 `destroy()`。 |
| `Monster5` | 早期关卡会注册，但有 `hit1/hit2/hit3` 和两个技能入口，复杂度高于首个切片需求。 |
| `Monster55/56/57` | 文件不长但属于后期高数值怪，含中毒、连锁、死亡攻击或多弹体回调，不适合第一怪物。 |
| `Monster35/36/37/38` | `StageListener01` 的 PK/特殊模式可用，但都是 boss/多技能结构，复杂度偏高。 |

### 首选：Monster30

推荐 `TASK-SETTINGS-004C` 细扒 `Monster30.as`。

选择理由：

- 它是默认第一主线关 `1-1 / StageListener11` 的过程怪，和 `levels-index.md` 的第一关事实直接相连。
- 类体较短，只有 `wait/walk/hurt/hit1/dead` 状态。
- 无 `beforeSkill*Start()`、无 `releSkill*()`、无 `destroy()` 覆写、无召唤其他怪物。
- HP 150、防御 3、攻击力 15，数值低，适合调试“生成 -> 追踪/攻击 -> 受击 -> 死亡”。
- `fallList = []` 且 `probability = 0`，死亡掉落可以先只保留 `dropAura()/destroy()` 链路或直接空掉落。

需要在 `004C` 细读确认：

- `isFly = true`、`graity = 0` 与 `BaseMonster.flyFollowTarget()` 的现代实现范围。
- `Monster30Bullet1` 的碰撞盒/资源名、命中帧和是否需要完整飞行动画。
- `setAction()` 中 `walk` 与 `wait` 共用帧行的表现。
- `dead` 动画结束时 `dropAura()` 对空 `fallList` 的实际副作用。

## Monster30 详细索引

本节由 `TASK-SETTINGS-004C` 补充。目标是给 `VS-005` 的“第一个怪物受击死亡”实现提供可验收事实，不扩展到完整怪物系统。

### AS3 证据

主要文件：

- `extracted_flash/scripts/172845/scripts/export/monster/Monster30.as`
- `extracted_flash/scripts/172845/scripts/export/level/StageListener11.as`
- `extracted_flash/scripts/172845/scripts/base/BaseMonster.as`
- `extracted_flash/scripts/172845/scripts/base/BaseObject.as`
- `extracted_flash/scripts/172845/scripts/base/BaseBullet.as`
- `extracted_flash/scripts/172845/scripts/export/bullet/SpecialEffectBullet.as`

资源和符号线索：

- 动画位图池名：`BaseBitmapDataPool.getBitmapDataArrayByName("Monster30")`。
- 攻击特效/子弹名：`SpecialEffectBullet("Monster30Bullet1")`。
- 碰撞盒类名：`ObjectBaseSprite7`，`scaleX = 0.5`。
- `resources/[172845].swf/symbolClass/symbols.csv` 未直接列出 `Monster30` 或 `Monster30Bullet1`，说明这些资源更可能经 `BaseBitmapDataPool` 或时间轴/二进制资源间接注册；首个现代切片可先用占位帧和显式碰撞盒复现行为。

### 关卡刷怪入口

`StageListener11.step()` 是第一主线关 `1-1` 的过程刷怪入口：

- `monsterAppearCount` 初始为 `72` 帧。
- 倒计时归零后，选择一个玩家作为刷怪锚点；双人时在 `hero1/hero2` 中随机选一个，单人时使用存在的 `hero1`。
- 单人每轮刷 `2` 只，双人每轮刷 `4` 只。
- 位置为 `x = randHero.x + (Math.random() - 0.5) * 300`，`y = randHero.y - (100 + Math.random() * 200)`，也就是在玩家上方约 100 至 300 像素生成。
- 刷完后 `monsterAppearCount = gc.frameClips * 6`，约每 6 秒再刷一轮。
- 玩家到达顶部触发 boss 段时，`callBoss()` 创建 `Monster3`，但这不属于 `Monster30` 首个切片范围。

现代 `VS-005` 可以不复现周期刷怪，只需要支持在调试场景中生成一只 `Monster30`，并保留“原版会在玩家上方生成”的验收参考。

### 基础数值

`Monster30` 构造函数设置：

| 字段 | 原版值 | 说明 |
| --- | --- | --- |
| `horizenSpeed` | `7` | 水平移动速度 |
| `hp/sHp` | `150/150` | 当前生命和最大生命 |
| `normalAttackRate` | `0.5` | 每秒攻击决策时 50% 概率普攻 |
| `protectedParamsObject.mysee` | `5 * 60` | 视野/显示类遗留字段，首切片可暂缓 |
| `protectedParamsObject.isattback` | `50` | 受击/击退相关遗留字段，首切片可暂缓 |
| `attackRange` | `250` | x 轴攻击范围 |
| `alertRange` | `1000` | 索敌警戒范围 |
| `mDef` | `0.2` | 魔法减伤比例 |
| `def` | `3` | 物理防御 |
| `exp` | `4`，若任一玩家等级 `>= 10` 则为 `0` | 击杀经验 |
| `gxp` | `1` | 红色 aura power 计算基础 |
| `isBoss` | `false` | 普通怪 |
| `isFly` | `true` | 飞行怪 |
| `graity` | `0` | 无重力 |
| `probability` | `0` | 装备/道具掉率为 0 |
| `fallList` | `[]` | 无装备/道具掉落表 |

难度修正仍由 `BaseMonster.__added()` 统一处理。首个现代切片可以先使用普通难度基准值，不接入难度修正。

### 动作和动画行

`initBBDC()` 使用 150x150 的 `BaseBitmapDataClip`，偏移为 `(5, -2)`，帧配置如下：

| 动作 | 帧行 y | 帧数/停顿 | 结束行为 |
| --- | --- | --- | --- |
| `wait` | `0` | 6 帧，停顿 `[2,2,2,2,2,2]` | 循环回第 0 帧 |
| `walk` | `0` | 与 `wait` 共用第 0 行 | 循环回第 0 帧 |
| `hurt` | `1` | 1 帧，停顿 `[15]` | `setStatic()` 后回 `wait` |
| `hit1` | `3` | 1 帧，停顿 `[10]` | 回 `wait` |
| `dead` | `2` | 5 帧，停顿 `[2,2,2,2,6]` | `dropAura()` 后 `destroy()` |

注意：`hit1` 只有 1 个图像帧，但停顿 10 个逻辑帧；攻击生成逻辑正是挂在这段停顿上。

### 移动和索敌

`Monster30` 没有覆写完整 AI，只覆写了一个保护：

- `myIntelligence()`：如果 `!isBeAttacking()` 才调用 `super.myIntelligence()`；受击和死亡状态不会继续跑 AI。

移动主要来自 `BaseMonster`：

- 无目标时先 `normalWalk()`，再 `selectTarget()`。
- `selectTarget()` 选择 `gc.getPlayerArray()` 中最近的玩家；距离小于等于 `alertRange = 1000` 才成为 `curAttackTarget`。
- 有目标时，如果正在受击或攻击，`hasAttackTarget()` 直接返回。
- 飞行怪会尝试维持在目标上方约 150 像素：
  - 若 `y == target.y - 150`，`speed.y = 0`。
  - 若 `y < target.y - 150`，在 `hasAttackTarget()` 中 `speed.y = 2`，向下靠近。
  - 若 `y > target.y - 150`，在 `flyFollowTarget()` 中 `speed.y = -2.2`，向上靠近。
- 每秒决策一次：
  - 若 x 距离在 `250` 内，按 `normalAttackRate = 0.5` 触发 `attackTarget()`，否则等待或飞行跟随。
  - 若 x 距离超出 `250`，调用 `flyFollowTarget()`。
- `flyFollowTarget()` 通过 `moveLeft()/moveRight()` 调整横向方向，实际速度由 `BaseObject.setSpeed()` 使用 `horizenSpeed = 7` 写入。
- `BaseMonster.step()` 还对飞行怪做屏幕 y 限制：全局 y 大于 300 时拉回，低于 0 时贴近上边界；`y >= 800` 时回到 `200`。

现代首切片建议实现最小等价：

- 选择最近玩家。
- 在 x 距离超过 250 时以 7 px/帧级别向玩家靠近。
- y 方向尝试保持在玩家上方 150 像素，可用 `+2/-2.2` 或等效速度。
- 攻击、受击、死亡时暂停 AI 移动。

### 普攻和子弹

`Monster30` 只有一个攻击动作 `hit1`：

- `attackTarget()` 来自基类：`newAttackId()`、`setAction("hit1")`、`lastHit = "hit1"`、`faceToTarget()`。
- `isCannotMoveWhenAttack()` 在 `curAction == "hit1"` 时返回 true，因此攻击期间 `BaseObject.setSpeed()` 会把 `speed.x/y` 置 0。
- `enterFrameFunc()` 在 `hit1` 状态且 `param1.x == 0`、当前帧停顿计数 `getCurFrameCount() == 10` 时调用 `doHi1()`。
- `doHi1()` 创建 `SpecialEffectBullet("Monster30Bullet1")`：
  - `x/y` 等于怪物当前 `x/y`。
  - `setRole(this)` 记录来源怪物和当前攻击 id。
  - `setDirect(param1)` 使用怪物当前朝向。
  - `setAction("hit1")` 读取怪物 `attackBackInfoDict["hit1"]`。
  - 加入 `gc.gameSence` 和怪物自己的 `magicBulletArray`。

`attackBackInfoDict["hit1"]`：

| 字段 | 值 |
| --- | --- |
| `hitMaxCount` | `99` |
| `attackBackSpeed` | `[6, -5]` |
| `attackInterval` | `999` |
| `power` | `15` |
| `attackKind` | `physics` |

`SpecialEffectBullet` 本身不覆写伤害逻辑，主要使用 `BaseBullet`：

- 根据来源是怪物，目标数组是玩家数组加 `likeMonsterArray`。
- `setAction("hit1")` 后把最大命中数和命中间隔从来源怪物的 `attackBackInfoDict` 取出。
- 用目标的 `beAttackIdArray` 防止同一个攻击 id 重复命中。
- 命中后调用目标 `beMagicAttack(bullet, sourceRole)`，成功则把攻击 id 写入目标。
- 默认在特效播放到最后一帧时销毁。

首个 `VS-005` 的范围是“怪物可被玩家打死”，所以可以暂不实现 `Monster30Bullet1` 对玩家造成伤害；但文档已给出后续 `VS-006` 需要的怪物攻击入口。

### 受击、死亡和清理

`Monster30` 不覆写受击和扣血，全部走 `BaseMonster`：

- 玩家/宠物子弹命中后调用 `beMagicAttack()`。
- 命中成功时设置 `curAttackTarget = attacker`，怪物会把攻击者作为后续追击目标。
- 根据来源攻击信息执行击退 `setAttackBack()`，再计算真实伤害并调用 `reduceHp(hurt, true)`。
- 未死亡且允许受击动作时切到 `hurt`；`Monster30.scriptFrameOverFunc()` 在 `hurt` 结束后 `setStatic()` 并回 `wait`。
- HP 归零时 `reduceHp()` 切到 `dead`，给击杀者或宠物发经验。
- `beMagicAttack()` 在死亡后还会 `setYourFather(gc.frameClips * 99, false)` 并取消当前效果。
- `Monster30.scriptFrameOverFunc()` 在 `dead` 结束后调用 `dropAura()` 和 `destroy()`。
- 因 `probability = 0` 且 `fallList = []`，`fallEquip()` 不会掉装备/道具；`addMedicine()` 仍可能生成药品，`dropAura()` 在有击杀者时生成红色 aura 和小概率白色 aura。
- `destroy()` 派发 `monsterdestroy` 事件，销毁自身特效和 `magicBulletArray`，设置 `isReadyToDestroy = true`，清空目标、掉落表、属性对象和 CD 引用，并通过 tween 淡出后移出显示列表。
- `PhysicsWorld.step()` 后续会把 `isReadyToDestroy` 的怪物从 `monsterArray` 移除。

现代 `VS-005` 最小验收可以保留：

- HP 150。
- 玩家攻击命中后扣 HP，切 `hurt` 或显示受击反馈。
- HP 归零后进入 `dead`，死亡动画/延时结束后移除实体。
- 不实现药品、aura、装备掉落，只记录为后续掉落任务。

### VS-005 验收依据

`Monster30` 已足够支撑第一个怪物受击死亡切片，建议验收写成：

- 场景能生成一只 `Monster30`，初始 HP 为 150。
- 怪物能选择玩家作为目标，并在 x 距离超过 250 时靠近；接近后能进入 `hit1` 或至少暂停攻击状态。
- 玩家调试攻击能命中怪物，命中后 HP 降低并有受击状态/反馈。
- HP 归零后怪物进入死亡状态，死亡结束后从实体列表和显示中移除。
- 首切片允许使用占位图形、占位攻击特效和矩形碰撞；不得把掉落、经验、药品、aura、完整玩家受伤一起做进本任务。

### 地面备选：Monster7

如果第一切片想避开飞行怪，可以改选 `Monster7`。

优点：

- 早期关卡 `StageListener12/13` 注册，资源和流程相对靠前。
- 低 HP 地面怪，移动和碰撞更贴近后续常规小怪。
- 实际攻击帧只创建 `Monster7Bullet1`。

风险：

- 类中存在 `hit2` 动作映射和 `attackBackInfoDict["hit2"]`。
- `beforeSkill1Start()` 在距离小于 200 时返回 true，但没有覆写 `releSkill1()`；按 `BaseMonster.hasAttackTarget()` 会触发一次空技能并重置 CD。这可能是原版行为，也可能是反编译/遗留缺口。

结论：

- `Monster30` 更适合作为“第一主线关相关”的首个怪物。
- `Monster7` 更适合作为“第一个地面普通小怪”的备选。

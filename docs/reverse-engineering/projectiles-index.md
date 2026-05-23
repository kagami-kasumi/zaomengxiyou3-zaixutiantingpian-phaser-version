# 子弹/技能飞行物索引

本文记录 `TASK-SETTINGS-008` 的逆向结果，目标是支撑 `VS-008 一个技能/子弹`。范围只覆盖进入第一个技能切片前必须明确的生命周期、创建入口、命中去重、目标选择和首个技能候选 `Role2.sgq -> hit5`。

不处理技能 UI、学习/绑定、冷却显示、完整属性成长、装备、掉落、关卡闭环、联网/PK 和所有角色的完整技能表。

## 证据入口

- `extracted_flash/scripts/172845/scripts/base/BaseBullet.as`
- `extracted_flash/scripts/172845/scripts/World/PhysicsWorld.as`
- `extracted_flash/scripts/172845/scripts/base/BaseObject.as`
- `extracted_flash/scripts/172845/scripts/base/BaseHero.as`
- `extracted_flash/scripts/172845/scripts/base/BaseMonster.as`
- `extracted_flash/scripts/172845/scripts/export/bullet/`
- `extracted_flash/scripts/172845/scripts/export/hero/Role2.as`
- `docs/reverse-engineering/roles-index.md`
- `docs/reverse-engineering/combat-rules-index.md`

备用包 `extracted_flash/scripts/25034429/scripts` 本次未读；主包证据足够支撑首个切片。

## 总结论

原版把普攻特效、怪物攻击窗口、角色技能、远程飞行物都抽象成 `BaseBullet` 或其派生对象。`BaseBullet` 不只是视觉对象，它同时承担：

- 显示资源入口：构造参数 `imcName`，例如 `Role2Bullet5`。
- 来源绑定：`setRole(source)` 保存攻击来源，并复制来源当前攻击编号。
- 动作绑定：`setAction(action)` 从来源 `attackBackInfoDict[action]` 读取命中次数、命中间隔、攻击类型、击退等参数。
- 每帧更新：`step2()` 在暂停状态外调用 `step()`，再按资源最后一帧、命中次数或显式倒计时销毁。
- 命中检测：`checkAttack()` 根据来源阵营选择目标，并调用目标 `beMagicAttack(bullet, source)`。
- 命中去重：目标 `beAttackIdArray` 记录 `bullet.getAttackId()`；命中成功才减少 `maxAttackCount`。
- 持续命中：`attackIntervalCount == attackInterval` 时，子弹 `newAttackId()`，同一个持续特效可以再次命中同一目标。

现代实现不需要复刻 Flash 的显示对象继承结构，但 `ProjectileSystem` 至少要保留这些可观察规则：

- 每个技能/飞行物实例有唯一 `projectileId` 和来源 `attackId`。
- 每个实例按生命周期更新位置、动画和销毁。
- 命中事件复用 `DamageEvent`，但命中去重要支持“同一个持续特效按间隔再次命中”。
- 来源为玩家时，首批目标只需要怪物；来源为怪物时，首批目标只需要玩家。

## `BaseBullet` 生命周期

### 创建和挂载

角色或怪物动作帧中创建 bullet，典型流程：

1. `new SpecialEffectBullet("Role2Bullet5")` 或其他派生类。
2. 设置 `x/y`。
3. `setRole(this)`。
4. `setDirect(direct)`。
5. `setAction("hit5")`。
6. `gc.gameSence.addChild(bullet)`。
7. `source.magicBulletArray.push(bullet)`。

`PhysicsWorld.step()` 每帧先遍历怪物、玩家、其他玩家、类怪物对象的 `magicBulletArray`，对未销毁 bullet 调用 `step2()`，随后清理 `isReadyToDestroy` 的对象，再更新来源对象自身 `step()`。

### 更新和销毁

`BaseBullet.step2()` 的关键规则：

- 游戏暂停时不调用 `step()`，但会按暂停状态停/播子显示对象。
- 默认 `isDestroyWhenLastFrame = true`，显示资源播放到最后一帧后销毁。
- `destroyInCount > 0` 时倒计时销毁。
- `isDisabled && imgMc1 == null` 时不进行命中检测。
- 如果 `isHurtCanCutDownEffect = true` 且来源动作变为 `hurt`，bullet 会销毁。
- 命中次数耗尽且 `isDestroyWhenMaxHitCountLessThenZero = true` 时销毁；例外包括 `Role2Bullet1`。
- 来源死亡/销毁时，`BaseHero.clearAllBullets()` 或 `BaseMonster.destroy()` 会销毁其 `magicBulletArray`。

现代建议：

- `ProjectileSystem` 维护独立实例数组，不绑定到 Phaser 显示对象继承。
- 实例字段包含 `sourceId`、`projectileId`、`action`、`assetKey`、`position`、`facing`、`lifetimeFrames`、`maxHits`、`hitIntervalFrames`、`hitSerial`、`destroyOnAnimationEnd`、`destroyWhenSourceHurt`。
- 来源死亡、切场景或角色清理时，释放来源创建的所有 projectile。

## 目标选择和命中去重

`BaseBullet.checkAttack()` 的原版目标选择：

| 来源 | 目标 |
| --- | --- |
| `BaseHero` 或 `BasePet` | `monsterArray + likeMonsterArray` |
| 普通 `BaseMonster` | 玩家数组 + `likeMonsterArray` |
| `Monster70` 至 `Monster78` | 玩家数组 |
| PK 模式 | 对手玩家 |
| 房间/联网 | 其他玩家与 `likeMonsterArray` |

`VS-008` 首批只需要单机：

- 玩家技能命中怪物。
- 不处理宠物、`likeMonsterArray`、PK、联网、友军和怪物互打。

原版命中去重：

- `BaseObject.newAttackId()` 在攻击动作开始时递增来源攻击编号。
- `BaseBullet.setRole(source)` 复制来源当前编号。
- `BaseBullet.getAttackId()` 返回 `this.name + this.attackId`。
- 目标 `beAttackIdArray` 没有该 key 时才尝试 `beMagicAttack()`。
- 命中成功后写入目标数组，并 `maxAttackCount--`。
- `attackInterval` 到点后，bullet 自己 `newAttackId()`，因此持续特效可以再次命中同一目标。

现代建议：

- 继续复用 `DamageEvent` 和 `HitRegistry`，但 `ProjectileSystem` 应生成可重复命中的去重 key：

```text
projectileId + ":" + sourceAttackId + ":" + hitSerial + ":" + targetId
```

- `hitSerial` 在 `hitIntervalFrames` 到点时递增；单次攻击窗口则固定为 `0`。
- `maxHits` 对应原版 `hitMaxCount`。首个 `Role2Bullet5` 原版为 `999`，但受动画生命周期和 `attackInterval = 16` 限制，不代表无限存在。

## 派生类概览

| AS3 类 | 作用 | 首批取舍 |
| --- | --- | --- |
| `SpecialEffectBullet` | 静态或局部跟随特效；默认依赖动画帧销毁，可选跟随 `ThroughWallBullet` | `Role2Bullet5` 使用它，`VS-008` 必须支持 |
| `FollowBaseObjectBullet` | 跟随来源对象位置和朝向，来源受击时默认可销毁 | 普攻/贴身技能常用；后续通用化 |
| `EnemyMoveBullet` | 按速度/距离移动，可追踪目标，可切换最低/最高 HP 目标 | 首批可不做，后续远程弹体需要 |
| `EnemyMoveBullet1/2/3` | 移动弹体变体，含目标转向或旋转逻辑 | 后置 |
| `FastAndSlowBullet` | 移动一段后降速 | 后置 |
| `ParabolaBullet` | 带重力的抛物线弹体 | 后置 |
| `ReflectiveBullet` | 碰墙反弹弹体 | 后置 |
| `BounceBullet` | 基于地面/墙体法线反弹 | 后置 |
| `S_ShapeMoveBullet` | S 形摆动移动 | 后置 |
| `StabBullet` | 朝目标点突刺/下坠 | 后置 |
| `TraceTargetBullet` | 带锁定帧、转向角限制、自动选最近怪的追踪弹 | 后置 |
| `TrailBullet` | `TraceTargetBullet` 的拖尾表现 | 后置 |
| `NetBullet` | `SpecialEffectBullet` 特化，带附加对象清理 | 后置 |
| `Monster186Bullet` | `EnemyMoveBullet` 特化 | 后置 |
| `ThroughWallBullet` | 继承 `ThroughWall`，不是 `BaseBullet`；可和 `SpecialEffectBullet.setFollowObj()` 组合 | 不进首个伤害切片 |

## 首个技能候选：`Role2.sgq -> hit5`

### 技能入口

`Role2.showSkill(key)` 从 `User.returnSkillNameBySkillKey(key)` 得到技能代号。代号为 `sgq` 时：

- 技能等级索引：`levelIndex = returnSkillLevelBySkillName("sgq") - 1`。
- MP 消耗：`consumeMP[levelIndex] * 0.55 * 35173 / 25958`。
- 调用 `skill_sgq(needMp)`。

`skill_sgq(needMp)` 的门禁：

- MP 不足直接返回。
- 正在攻击或正在受击直接返回。
- 通过后 `setAction("hit5")`，`curAction = "hit5"`，`hitNum = 0`。
- 调用 `newAttackId()`。
- 本地玩家会 `gc.sendPosition(this)`。
- 扣除 MP。

首批实现可以暂不接技能学习/绑定 UI，但调试触发 `sgq` 时应保留“不能在攻击/受击中重入”和“每次释放生成新攻击实例”的规则。MP 消耗可先用占位资源模型记录，不必接完整成长系统。

### 动作帧和生成位置

`Role2.setAction("hit5")` 使用 Role2 位图行 `y = 10`。

`Role2.enterFrameFunc()` 在 `hit5` 中：

- 当帧点 `x == 0` 时递增 `hit5CurrentCount`，并由 `ExceedPowerSprite` 显示进度。
- 当 `bbdc.getCurFrameCount() == 15` 且帧点 `x == 2` 时，清空 `hit5CurrentCount` 并创建技能特效。
- 朝左时生成点为 `x - 175`，朝右时为 `x + 175`。
- 生成点 `y = hero.y - 110`。
- 调用 `doHit5(direct, point)`。
- 联网时发送 `sendAttack(roleId, "hit5", direct, x, y, [])`。

`sjt` 技能会把 `hit5NeedCount` 从 48 改为 12，并调整 `hit5` 对应的帧停顿配置；这属于后续技能联动，不阻塞 `VS-008`。

### 创建的 bullet

`Role2.doHit5(direct, point)`：

- 播放音效 `Role2_hit5`。
- 创建 `SpecialEffectBullet("Role2Bullet5")`。
- 设置位置为传入点。
- `setRole(this)`。
- `setDirect(direct)`。
- `setAction("hit5")`。
- 加入 `gc.gameSence`。
- 推入 `magicBulletArray`。

当前 `extracted_flash/resources/[172845].swf/symbolClass/symbols.csv` 未列出 `Role2Bullet5` 或 `Role2_hit5`，主包导出的 PNG/JPG 也未直接暴露该素材。现代侧首批可使用占位视觉，稳定资源 key 建议：

```text
skill-projectile.role2.sgq.hit5
```

并在后续资源任务补真实动画/音效。

### 攻击参数

`Role2` 构造函数中 `attackBackInfoDict["hit5"]`：

| 字段 | 值 |
| --- | --- |
| `hitMaxCount` | `999` |
| `attackBackSpeed` | `[5, -2]` |
| `attackInterval` | `16` |
| `attackKind` | `magic` |
| `addprotection` | `1000 * 0.1 / 12` |

`Role2.getRealPower("hit5")`：

- 技能等级索引：`returnSkillLevelBySkillName("sgq") - 1`。
- 基础伤害按 `SkillFixedDamage`、`FixedDamageCount`、`SkillFactor`、`roleProperies.getHurt()` 计算。
- 分母 `/ 12` 表明这是多段技能之一。
- 返回值最后整体乘 `1.178`。
- 攻击类型是魔法，怪物侧走 `BaseMonster.getRealHurt()` 的魔防分支。

`VS-008` 首批可以继续沿用当前占位伤害数值，但事件上必须标记：

```text
sourceAction = "hit5"
attackKind = "magic"
knockback = { x: 5, y: -2 }
hitIntervalFrames = 16
maxHits = 999
assetKey = "skill-projectile.role2.sgq.hit5"
```

### 首批现代实现边界

可直接复用现有系统：

- `DamageEvent` 的来源、目标、攻击类型、伤害量、击退字段。
- `HitRegistry` 的命中去重思路。
- 现有怪物 HP、受击、死亡反馈。
- 测试场景中的占位可视化和调试文本。

需要 `ProjectileSystem` 新增的规则：

- projectile 实例生命周期，而不是一帧 hitbox。
- 动画/持续时间结束后销毁。
- `hitIntervalFrames` 驱动的重复命中去重 key。
- 来源受击/死亡时清理来源 projectile。
- `SpecialEffectBullet` 等价的“固定位置技能特效”类型。
- 后续扩展移动、跟随、追踪、抛物线、反弹等派生运动。

`VS-008` 首批不需要：

- 完整 `getRealPower("hit5")` 数值公式。
- `sjt` 对蓄力/帧停顿的联动。
- 技能学习、绑定、冷却 UI、MP UI。
- 真实 `Role2Bullet5` 素材。
- 联网 `sendAttack`/远端同步。
- 其他角色技能。

## VS-008 建议实现

首个可玩切片建议做“Role2 调试释放 `sgq`”：

- 由测试输入或调试键触发，不接正式技能槽 UI。
- 触发时创建 `ProjectileInstance`，位置在角色前方约 175、上方约 110。
- 显示占位动画或特效，持续到占位动画结束。
- 每 16 帧允许对同一怪物再次命中，命中事件走 `DamageEvent`。
- 使用 `magic` 攻击类型和 `[5, -2]` 击退。
- 同一次释放的同一命中周期对同一怪物只结算一次。
- 角色死亡、受击或切场景时清理 projectile。

这样可以在不引入完整技能系统的前提下，验证技能动作、持续特效、重复命中、命中去重和伤害闭环。

## TASK-SETTINGS-009 资源定位结果

### `Role2Bullet5` / `Role2_hit5`

结论：当前工作区没有可直接接入的 `Role2Bullet5` 真动画，也没有 `Role2_hit5` 真音效。

已查证范围：

- 主参考资源：`extracted_flash/resources/[172845].swf/symbolClass/symbols.csv`
- 主参考图片：`extracted_flash/resources/[172845].swf/images/`
- 备用资源：`extracted_flash/resources/[25034429].swf/symbolClass/symbols.csv`
- 备用图片：`extracted_flash/resources/[25034429].swf/images/`
- 全资源目录文本/路径检索：`Role2Bullet5`、`Role2_hit5`、`Role2Bullet*`、`TangSeng`、`ROLE2`
- AS3 证据：`Role2.doHit5()`、`AssetsLoader.getRolesAndPetsAssets()`

查证结果：

| 项 | 当前状态 | 证据/说明 |
| --- | --- | --- |
| `Role2Bullet5` symbol | 未导出 | 主包 `symbols.csv` 只列出 `export.bullet.ThroughWallBullet` 等通用类符号，没有 `Role2Bullet5` |
| `Role2Bullet5` 图片帧 | 未导出 | 主包和备用包图片都是数字/UI/零散对象名，没有 `Role2Bullet5` 或 `Role2Bullet*` 路径 |
| `Role2_hit5` 音效 | 未导出 | 当前导出的声音文件没有能对应 `Role2_hit5` 的文件；`Role2.as` 只证明运行时会调用 `SoundManager.play("Role2_hit5")` |
| 可能所属资源包 | `TangSeng` 或 `SpecialUI/TangSeng`，另可能依赖全局 `Role1Effect` | `AssetsLoader.getRoleNameByID(2)` 返回 `TangSeng`/`SpecialUI/TangSeng`；加载器还把 `Role1Effect` 放进 `mustLoadAsset` |
| 现代稳定 key | `skill-projectile.role2.sgq.hit5` | 继续使用 `TASK-SLICE-005` 已接入的占位 key，等真资源补导出后替换来源文件 |

因此，`Role2Bullet5` 不是一个已经能从当前 `resources/` 直接接入的 PNG/JPG/SymbolClass 项。后续若要接真素材，需要用户补提供或重新导出角色资源包，优先目标名是 `TangSeng.swf` / `SpecialUI/TangSeng.swf` 中的 `Role2Bullet5` 与 `Role2_hit5`，而不是再次全量翻主包 `[172845].swf`。

### Role2 技能飞行物映射

`Role2` 的技能入口和 bullet 资源名已经足够支持下一批实现选择。下表只记录 `BaseBullet`/显示对象相关项；纯角色状态、影分身和空函数不当作 projectile 首选。

| 技能代号 | 动作/方法 | bullet 类 | 资源名 | 运动/作用类型 | 攻击参数线索 | 首批实现价值 |
| --- | --- | --- | --- | --- | --- | --- |
| `sgq` | `hit5` / `doHit5()` | `SpecialEffectBullet` | `Role2Bullet5` | 固定位置持续伤害特效，生成于角色前方约 175、上方约 110 | `magic`、`attackInterval = 16`、`hitMaxCount = 999`、击退 `[5,-2]` | 已用占位完成 `VS-008`；真资源仍缺 |
| `xbz` | `hit3` / `doHit3()`、`doHit3_2()` | `SpecialEffectBullet` | `Role2Bullet3` | 固定/局部范围魔法特效；释放时角色 `setStatic()`、`setLostGraity()`，受击不打断特效 | `hit3/hit3_2` 均为 `magic`，`attackInterval = 250`，击退 `[4,-4]` | 适合作为第二个“固定范围伤害技能”占位切片，运动复杂度低 |
| `smb` | `hit4_1` / `doHit4_1()` | `EnemyMoveBullet` | `Role2Bullet4_1`，实例名被改为 `Role1Bullet4_1` | 水平移动弹体；朝左速度 `-10`，朝右 `10`，距离 `9999`，先 `setDisable()` | `hit4` 为 `magic`，`hitMaxCount = 100`，击退 `[0,-3]` | 适合作为第一个“移动 projectile”切片；需同时处理异常实例名 |
| `smb` | `hit4_2` / `doHit4_2()` | `SpecialEffectBullet` | `Role2Bullet4_2` | 二段触发，围绕运行时名 `Role1Bullet4_1` 的位置记录生成：`y - 320`，朝左时 `x + 50`，朝右时 `x - 50`；结束后恢复重力并震屏 | 同用 `hit4` 参数 | 已由 `TASK-SLICE-007` 用占位资源实现 |
| `myhc` | `hit6` / `doHit6()` | `SpecialEffectBullet` | `Role2Bullet6` | 角色层级后的支援特效，`setDisable()`，延迟给附近玩家回血 | `hit6` 表内为 `magic`，但实际主要是治疗 | 不适合作为伤害 projectile 首批；适合后续治疗/队友目标规则 |
| `jgz` | `hit7` / `doHit7()` | `SpecialEffectBullet` | `Role2Bullet7` | `setDisable()` 的控制特效；对半径约 240 内目标做拉拽/浮空 Tween | `hit7` 为 `magic`，`attackInterval = 4`，击退 `[15,0]` | 控制逻辑复杂，后置到状态/位移控制任务 |
| `tjgl` / `shy` | `hit8`、`hit8_2` / `doHit8*()` | `SpecialEffectBullet` | `Role2Bullet8` | 治疗/护盾特效，`setDisable()`，在玩家/宠物半径约 150 内生效 | `hit8/hit8_2` 表内为 `magic`，但实际主要是治疗/护盾 | 后置到治疗、护盾和宠物/队友目标规则 |
| `jhsj` | `hit9` 系列 / `doHit9_1*()`、`doHit9_2*()` | `SpecialEffectBullet` | `Role2Bullet9_1`、`Role2Bullet9_2` | 多段特效，释放时角色静止/失重，部分子段插入角色层级前 | `hit9_1/2` 与 `_2` 变体均为 `magic`，含 `attackInterval = 5/999` | 动作链较长，后置到多段技能 |
| `shy` | `doHit10()` | 非 `BaseBullet`，创建 `Role2Shadow` | `Role2Shadow` | 影子/分身对象 | 不走常规 projectile 表 | 不属于本轮 projectile 首选 |
| `blb` | `skill_blb()` | 无 | 无 | 空函数 | 无 | 无实现价值 |

### 其他角色高价值 projectile 线索

这批映射来自 `Role1.as` 至 `Role5.as` 的 `new *Bullet(...)` 调用扫描，目的是给后续选择“第二个 projectile 切片”时不用重新全量扫目录。

| 角色 | 资源名/动作 | bullet 类 | 运动/作用类型 | 首批实现建议 |
| --- | --- | --- | --- | --- |
| Role1 | `Role1Bullet8_2` / `hit8_2`、`hit8_2_1` | `EnemyMoveBullet` | 悟空技能移动弹体 | 可作为后续移动弹体参考，但 Role1 完整技能链比 Role2 首切片更散 |
| Role1 | `Role1Bullet10_2/10_3/10_4_tmp`、`Role1Bullet12/13/14_*` | `SpecialEffectBullet` | 多段/爆发类技能特效 | 资源缺失且动作链较长，后置 |
| Role3 | `Role3Bullet7_2` / `hit7_2` | `EnemyMoveBullet` | 八戒技能移动弹体 | 可作为移动弹体第二梯队 |
| Role3 | `Role3Bullet12_2` / `hit12` | `StabBullet` | 朝目标点突刺/下坠类弹体 | 适合在通用移动 projectile 后再做 |
| Role4 | `Role4BulletArrow1/2/4/8_2/10_2/12_3` | `SpecialEffectBullet` | 沙僧弓形态箭/技能附属对象 | 适合弓形态任务；真资源同样未导出 |
| Role4 | `Role4Bullet6/7_* /10/11/12` | `SpecialEffectBullet` | 沙僧铲形态技能特效 | 多段和形态分支明显，后置 |
| Role5 | `jianqi` / `hit25_3` | `EnemyMoveBullet` | 白龙剑气飞行物 | 适合“真正飞行剑气”任务，但 Role5 枪/剑形态前置较重 |
| Role5 | `sword_lxuanj1/2`、`swordskill5_2`、`sword_jrjljq`、`Role5Bullet10_3` | `EnemyMoveBullet` | 多个剑/枪形态移动弹体 | 适合白龙专题，不建议抢在 Role2 第二技能前 |
| Role5 | `sword_mlsz1..5`、`fhf*ly*_spear`、`zxcly*_spear` | `SpecialEffectBullet` | 多段阵列或枪形态范围特效 | 真资源和形态状态依赖重，后置 |

`TASK-SLICE-006` 已复现 `Role2.smb -> hit4_1` 的 `EnemyMoveBullet("Role2Bullet4_1")` 占位移动 projectile。`TASK-SLICE-007` 已继续实现 `hit4_2`：读取第一段运行时名 `Role1Bullet4_1` 的当前位置记录，在其上方约 320 像素、横向按朝向反向约 50 像素生成 `Role2Bullet4_2` 二段特效。

## 现代实现状态

`TASK-SLICE-005` 已完成 `VS-008` 第一个窄切片：

- `src/systems/ProjectileSystem.ts` 已实现 `Role2.sgq -> hit5` 等价固定位置 projectile，使用 `skill-projectile.role2.sgq.hit5` 占位 key。
- 生成位置按原版证据落在角色前方约 175、上方约 110。
- 命中 `Monster30` 时复用 `DamageEvent`，标记 `attackKind = magic`，击退为 `[5, -2]`。
- 通过 `projectileId + sourceAttackId + hitSerial` 形成每 16 帧刷新的命中去重周期，同一周期不会对同一目标重复结算。
- `Role2Bullet5` 与 `Role2_hit5` 真资源已在 `TASK-SETTINGS-009` 中确认缺失于当前主包/备用包导出；后续应补 `TangSeng` / `SpecialUI/TangSeng` 角色包，或继续用占位 key 扩展第二个 projectile。
- `TASK-SLICE-006` 已实现 `Role2.smb -> hit4_1` 等价移动 projectile：使用 `skill-projectile.role2.smb.hit4_1` 占位 key、来源符号 `Role2Bullet4_1`、运行时兼容名 `Role1Bullet4_1`，朝角色面向水平移动并以 `magic`、`[0,-3]` 击退命中 `Monster30`。
- `TASK-SLICE-007` 已实现 `Role2.smb -> hit4_2` 等价二段 projectile：第一段仍活跃且尚未触发二段时，再按第二技能键会用 `skill-projectile.role2.smb.hit4_2` 占位 key 生成 `Role2Bullet4_2`，位置来自第一段当前记录点而不是角色当前位置，命中继续复用 `DamageEvent` 与现有命中去重。

## 正式技能输入边界

`TASK-SETTINGS-010` 已确认正式输入不应继续使用无条件调试释放。详见 `docs/reverse-engineering/skills-input-index.md`。

对现有 `Role2` projectile 切片的最小改造边界：

- `sgq -> hit5` 必须由普通技能槽 `0..4` 触发，槽位绑定值为 `sgq` 时才释放。
- `smb -> hit4_1/hit4_2` 同样由绑定槽触发；第一次释放扣 MP 并创建 `hit4_1`，`hit4_1` 活跃时再次按同一技能槽才允许生成 `hit4_2`。
- Space/小键盘 0 的 `showSkillKongGe()` 与 H/小键盘 7 的 `showSkillFaBao()` 不是普通 projectile 技能槽，本索引现有 `Role2.sgq`/`smb` 切片不接这两个入口。
- 原版没有统一释放 CD；`attackInterval` 仍只表示 projectile 持续命中的重复命中间隔，不表示再次按键释放技能的冷却时间。

## 未决问题

- `Role2Bullet5` 真资源已确认不在当前主包/备用包导出的 `symbols.csv` 或图片目录中；下一步不是继续翻同一批目录，而是补 `TangSeng` / `SpecialUI/TangSeng` 等角色资源包导出。
- `hit5CurrentCount` 与 `sjt` 对 `hit5NeedCount` 的联动只记录到入口；首个切片不复现蓄力条数值。
- 像素级 `HitTest.complexHitTestObject()` 暂不复刻；现代侧先用稳定矩形/圆形 hitbox，后续有真素材后再校准。

# 法宝系统索引

本文记录法宝系统的 AS3 逆向结果。`TASK-SETTINGS-019` 已先覆盖宣花葫芦捕捉链路；`TASK-SETTINGS-020` 扩展到完整法宝基础表、触发边界、首批技能效果和强化 UI。

## 资料状态

主要 AS3 证据：

- `extracted_flash/scripts/172845/scripts/base/BaseMagicWeapon.as`
- `extracted_flash/scripts/172845/scripts/base/BaseHero.as`
- `extracted_flash/scripts/172845/scripts/export/magicWeapon/`
- `extracted_flash/scripts/172845/scripts/export/strength/SutraInterface.as`
- `extracted_flash/scripts/172845/scripts/my/AllEquipment.as`
- `extracted_flash/scripts/172845/scripts/my/MyEquipObj.as`
- `extracted_flash/scripts/172845/scripts/export/pack/BackPack.as`
- `extracted_flash/scripts/172845/scripts/export/RoleInfo.as`
- `extracted_flash/scripts/172845/scripts/my/KeyBoardControl.as`

相关前置文档：

- `docs/reverse-engineering/equipment-index.md`
- `docs/reverse-engineering/pets-index.md`
- `docs/reverse-engineering/skills-input-index.md`

## 装备与创建入口

法宝装备槽类型是 `zbfb`。`AllEquipment.initSutraEquipment()` 定义 20 个法宝装备，均进入 `sutraEquipment` 表。

| fillName | 名称 | 品质 | AS3 类 | 原说明 |
| --- | --- | --- | --- | --- |
| `kyl` | 枯叶灵 | 优秀 | `MagicLeaf` | 缓慢回复少许生命 |
| `xhhl` | 宣花葫芦 | 精良 | `MagicBottle` | 有一定概率捕捉宠物 |
| `qyj` | 青云剑 | 精良 | `MagicSword` | 御剑飞行 |
| `hyzzs` | 混元珍珠伞 | 精良 | `MagicUmbrella` | 抵挡一定伤害 |
| `zjld` | 紫金铃铛 | 史诗 | `MagicRing` | 提供人物无敌时间以及恢复部分生命值 |
| `syl` | 神叶灵 | 魂器 | `MagicLeaf2` | 缓慢回复生命与魔法 |
| `lxj` | 戮仙剑 | 魂器 | `MagicSword2` | 释放多支剑，对敌人造成多重伤害 |
| `hywjs` | 混元无极伞 | 魂器 | `MagicUmbrella2` | 抵挡大量伤害以及反弹部分伤害，剩余盾量部分转化生命 |
| `zsTimer` | 烛时金轮 | 传说 | `MagicTimer` | 记录当前时刻的位置、生命、魔法，再次使用回溯 |
| `jyhl` | 九佑魂莲 | 灵器 | `MagicFlower` | 玩家增攻，敌方降攻 |
| `qljfb` | 青龙剑 | 魂器 | `MagicBigBottle` | 御剑飞行 |
| `mdhf` | 摩多魂幡 | 神器 | `MagicFlag` | 召唤恶魂环绕自身 |
| `tjbg` | 太极八卦 | 传说 | `MagicBagua` | 起死回生能力；当前技能表现为全屏眩晕 |
| `xhmt` | 血海魔童 | 史诗 | `MagicPearl` | 多段随机打击，结束后随机效果 |
| `lxfb` | 流邪 | 邪灵 | `MagicLXFB` | 入魔后攻击暴击小幅提升，持续扣血 |
| `sxfb` | 沙邪 | 邪灵 | `MagicSXFB` | 入魔后攻击暴击中幅提升，持续扣血 |
| `yxfb` | 渊邪 | 邪灵 | `MagicYXFB` | 扣除一半生命，攻击和暴击大幅提升 |
| `stlp` | 奢天化雪令 | 神器 | `Ling` | 大雪飞落攻击 |
| `zltc` | 震雷天锤 | 神器 | `MagicZLHummer` | 雷锤前方攻击 |
| `fbqpj` | 青萍剑 | 神器 | `MagicQPJ` | 多支飞剑追踪最近敌人 |

`BaseHero.initMagicWeapon()` 读取当前 `getPlayer().getCurEquipByType("zbfb")`，按 `fillName` 创建对应 `BaseMagicWeapon` 子类，并加到 `gc.gameSence`。本地装备表中没有 `hxyb`，但 `initMagicWeapon()` 仍保留 `hxyb -> MagicYuban` 分支，应视为旧活动或未进当前 `sutraEquipment` 表的残留法宝。

背包装备切换会调用 `hero.changeMagicWeapon()`，先销毁旧法宝再重新 `initMagicWeapon()`。当当前法宝处于 `hit` 使用动作时，`BackPack` 会阻止穿脱 `zbfb` 并提示当前法宝正在使用。

`RoleInfo.fbClick()` 打开的是法宝强化界面入口，不是法宝释放入口。没有装备 `zbfb` 时提示未装备法宝。

## 触发输入

法宝释放使用技能数组第 7 项，不属于 0 至 4 的普通技能槽，也不是 Space 特殊技：

| 玩家 | 技能数组 | 法宝键 |
| --- | --- | --- |
| P1 | `[Y, L, U, I, O, Space, H]` | `H` / keyCode `72` |
| P2 | `[num8, num3, num4, num5, num6, num0, num7]` | 小键盘 `7` / keyCode `103` |

`KeyBoardControl.__keyBoardDown()` 找到数组下标后调用 `role.sendSkill(index)`。当 index 为 `6` 时，`BaseHero.sendSkill(6)` 调用 `showSkillFaBao()`。

`showSkillFaBao()` 先检查 `gc.isSingleGame()`，非单机直接返回；单机且存在 `curMagicWeapon` 时调用 `curMagicWeapon.useSkill()`。源码里有攻击/受击判断空块，但没有实际阻止释放。

## 基础生命周期

`BaseMagicWeapon` 保存 `sourceRole`、`bbdc`、`bmwId` 和当前动作。构造时初始化动画，进入 `wait`，并在 `step()` 中：

- 推进自身动画。
- 每隔半轮动画调用 `setPosition()`，让法宝漂浮在英雄左右侧约 60 像素、上方约 15/25 像素。
- 按英雄朝向调整自身方向。

`useSkill()` 的通用规则：

- 当前动作已是 `hit` 时，普通法宝直接返回，避免重入。
- `MagicTimer` 是特殊例外：如果已在 `hit` 且存在 `wait` 记录点，再次使用会销毁 `wait`，触发回溯。
- 可释放时切到 `hit` 并调用子类 `showSkill()`。

`destroy()` 会释放英雄当前法宝引用、销毁动画并从父容器移除。大多数子类通过 `TweenMax.delayedCall(...)` 把动作切回 `wait`；持续效果本身由 buff、bullet 或 wall 对象管理。

## 首批技能效果

| 类 | 资源/特效名 | 消耗/门禁 | 主要效果 | 结束条件 |
| --- | --- | --- | --- | --- |
| `MagicBottle` | `MagicBottleBmd`、`MagicBottleEffect3` | 玩家灵魂值至少 5000；命中后扣 5000 | 捕捉 `Monster70-78` 宠物怪，概率和宠物名见 `pets-index.md` | 约 2 秒回 `wait`；捕捉特效自行销毁 |
| `MagicLeaf` | `MagicLeafBmd` | 无显式 MP 消耗 | 给自身 `MAGIC_LEAF_CURE`，持续 `8s`；木五行延长 1.5 倍 | 30 帧后回 `wait` |
| `MagicLeaf2` | `MagicLeafBmd2` | 无显式 MP 消耗 | 给自身 `MAGIC_LEAF_CURE2`，持续 `8s`；木五行延长 1.5 倍 | 30 帧后回 `wait` |
| `MagicRing` | `MagicRingBmd`、`MagicRingEffect` | 无显式 MP 消耗 | 自身无敌 `2s`，回复 `最大生命 * 等级 * 0.00904` 与一半比例 MP；木五行回复翻倍、无敌延长 1.5 倍 | 30 帧后回 `wait` |
| `MagicUmbrella` | `MagicUmbrellaBmd` | 无显式 MP 消耗 | `MAGIC_UMBRELLA_DEFEND` 护盾 `10s`，盾量 `物防 * 法宝等级`；木五行盾量 1.5 倍 | 30 帧后回 `wait` |
| `MagicUmbrella2` | `MagicUmbrellaBmd2` | 无显式 MP 消耗 | `MAGIC_UMBRELLA_DEFEND2` 护盾 `10s`，盾量 `物防*等级 + 魔防*等级*20`；木五行盾量 2 倍 | 30 帧后回 `wait` |
| `MagicSword` | `MagicSwordBmd`、`SwordEffect`、`MagicUmbrellaHit1` | 无显式 MP 消耗 | 创建穿墙弹体；木五行调用 `setStopDoubleCount()` | 弹体 `destroy` 后回 `wait` 并销毁跟随特效 |
| `MagicSword2` | `MagicSwordBmd2`、`MagicSword2_1/2` | 无显式 MP 消耗 | 起手特效后锁定最近怪物，在目标处生成剑击 | 30 帧后回 `wait` |
| `MagicTimer` | `MagicTime`、`MagicTimeStart/Wait/Over` | 无显式 MP 消耗 | 记录释放时生命、魔法、坐标；第二次释放或等待物销毁后把角色 tween 回记录点并恢复 HP/MP；木五行等待 27 秒，否则 30 秒 | 记录物销毁触发回溯；延迟后动作回 `wait` |
| `MagicFlag` | `MagicFlagBmd`、`MagicFlagStart/Effect` | 无显式 MP 消耗 | 生成跟随自身的恶魂环绕效果，效果物存在 `10s` | 木五行 50 帧回 `wait`，否则 60 帧 |
| `MagicFlower` | `MagicFlowerBmd`、`MagicFlowereffect` | 无显式 MP 消耗 | 所有玩家和宠物获得 `MAGIC_FLOWER_ADDBUFF`；所有怪物获得 `MAGIC_FLOWER_DEBUFF`；持续 `5 + 等级/2` 秒 | 木五行 27 帧回 `wait`，否则 30 帧 |
| `MagicPearl` | `MagicPearlBmd2`、`MagicPearlBegin/Run/Back/Effect/Bullet1-3` | 无显式 MP 消耗；内部 `mp = 100 + 最大MP*0.02` 只记录 | 攻击最近怪物 `3 + 等级/3` 次，木五行 +2 次；结束随机回蓝、全怪眩晕或全怪中毒 | 30 帧回 `wait`；攻击链结束后随机结算 |
| `MagicLXFB` | `MagicLXFBBmd` | 无显式 MP 消耗 | 给自身 `XLFB_BUFF`，默认 `7s`，木五行 `10s` | 21 帧后回 `wait` |
| `MagicSXFB` | `MagicSXFBBmd` | 无显式 MP 消耗 | 给自身 `SXFB_BUFF`，默认 `7s`，木五行 `11s` | 21 帧后回 `wait` |
| `MagicYXFB` | `MagicYXFBBmd` | 使用时扣当前生命一半 | 给自身 `YXFB_BUFF2`，默认 `8s`，木五行翻倍 | 21 帧后回 `wait` |
| `MagicBagua` | `MagicBaguaBmd`、`baguaEffect` | 法宝等级至少 1 | 所有非无敌、未死亡怪物眩晕 `6s`；木五行 `8s` | 24 帧后回 `wait` |
| `MagicZLHummer` | `ZLHummerBmd`、`zltcskill` | 法宝等级至少 1 | 在角色前方生成雷锤 hitbox 弹体 | 木五行 20 帧回 `wait`，否则 25 帧 |
| `MagicQPJ` | `QPJBmd`、`qpjeffect` | 法宝等级至少 1 | 主动释放生成 6 支追踪最近怪物的飞剑；空闲每约 `11.225s` 自动生成 1 支飞剑 | 主动木五行 24 帧回 `wait`，否则 27 帧；弹体 7.5/8.8 秒销毁 |
| `MagicBigBottle` | `MagicBigSwordBmd`、`StageBoat` | 无显式 MP 消耗 | 创建持续 `20s` 的墙/船对象加入世界墙数组 | 木五行 40 帧回 `wait`，否则 60 帧 |
| `MagicYuban` | `MagicYubanBmd`、`yubanEffect` | 装备存在即可 | 固定 Y=420 生成 5 秒效果，碰到怪物 bullet 时按 `攻击源真实伤害 * 法宝等级 * 20` 反击怪物 | 20 帧后回 `wait`；当前装备表未列出入口 |
| `Ling` | 奢天化雪令相关雪花对象 | 无显式 MP 消耗 | 屏幕上方随机落雪攻击；等级影响效果 | 子弹/雪花自行销毁，动作回 `wait` |

当前 AS3 子类大量依赖 `SpecialEffectBullet`、`TrailBullet`、`FollowBaseObjectBullet`、`ThroughWallBullet` 和 buff 常量。现代实现不应照搬类层级，建议先抽成数据驱动的 `MagicWeaponSystem`：装备槽决定当前法宝，`H` 触发能力，能力内部复用现有 combat/projectile/buff 查询接口。

## 强化 UI

`SutraInterface` 是法宝强化界面：

- `setRole(hero)` 读取 `hero.getPlayer().getCurEquipByType("zbfb")` 作为 `currentSura`。
- 打开时 `MainGame.stopGame()`，关闭时把旧装备从属性中移除、把强化后的 `currentSura` 加回属性，并 `setCurrentByType("zbfb", currentSura)`。
- 面板显示法宝名、等级、成长率、五行、攻击、防御、血、蓝和灵魂进度。
- 基础升级消耗灵魂：`getNextGradeLHValue(level) = level * level * 1000`。
- 常规法宝 1 至 10 级走灵魂消耗；10 至 15 级走 `龙女的眼泪`，数量 `阶段^2 * 3`。
- `zsTimer` 特殊：最高 10 级，消耗 `zsTimerup1/zsTimerup2`。
- `mdhf`、`jyhl`、`tjbg` 走神器材料：`kly4/kly5`，其中 `tjbg` 最高 9 级。
- `fbqpj` 最高 9 级：前两级可用灵魂，3 级后消耗 `qpjy`。
- `stlp`、`xhmt` 最高 10 级。
- 重置五行消耗 3 个 `wpccfq` 传承法器：重新取 `allEquip.findByName(fillName)`，再按原等级重跑成长，达到保留等级但重置随机五行的效果。

`MyEquipObj.getGrowthByName(fillName)` 提供法宝每次成长的基础增量，字段为 `fdef/fmp/fatk/fhp`。这些增量和装备自带初始属性共同决定强化后的装备属性；现代侧可以先把强化 UI 后置，只在法宝实现切片中保留 `level`、`wx` 和必要属性读取。

## 宣花葫芦捕捉

`MagicBottle` 是宣花葫芦的法宝类，构造中设置 `bmwId = BMW_Bottle`、`mp = 20`，但当前捕捉链路实际门禁和消耗使用玩家灵魂值。

`MagicBottle.showSkill()`：

- 玩家灵魂值 `< 5000` 时提示 `灵魂不足5000，无法捕捉！`，葫芦回到 `wait`，不生成捕捉特效。
- 灵魂足够时创建 `SpecialEffectBullet("MagicBottleEffect3")`，按英雄朝向放在英雄左右 70 像素处，加入 `sourceRole.magicBulletArray` 和 `gc.gameSence`。
- 约 2 秒后葫芦动作回到 `wait`。

`MagicBottle.step()`：

- 仅在 `gc.isSingleGame()` 时处理捕捉。
- 检查 `gc.pWorld.likeMonsterArray` 中的 `Monster70` 至 `Monster78`。
- 用捕捉特效和怪物 `colipse` 做复杂碰撞检测。
- 命中后立即扣除 `5000` 灵魂，并按怪物类型设置宠物名和概率。
- 成功时调用 `sourceRole.getPlayer().catchNewPet(petName, bm.getLevel())`；返回 true 后延迟提示成功并销毁怪物。
- 满栏或随机失败时不销毁怪物，但灵魂已经扣除。

详细怪物映射、概率、等级来源和现代捕捉切片边界见 `docs/reverse-engineering/pets-index.md`。

## 摩多魂幡 / MagicFlag

`mdhf` 由 `BaseHero.initMagicWeapon()` 创建 `MagicFlag`，仍通过 `H` / 小键盘 7 走 `BaseMagicWeapon.useSkill()`。释放时没有显式 MP、灵魂或等级门禁；通用 `useSkill()` 会先把法宝动作切到 `hit`，使用中再次按键直接返回。

`MagicFlag.showSkill()` 的可观察链路：

- 在法宝当前位置创建 `SpecialEffectBullet("MagicFlagStart")`，`setDisable()`、`setRole(sourceRole)`、`setAction("wait")`，只作为起手表现加入 `sourceRole.magicBulletArray`。
- 在英雄当前位置创建 `FollowBaseObjectBullet("MagicFlagEffect")`，同样 `setDisable()`、`setAction("wait")`，但设置 `destroyInCount = gc.frameClips * 10`、`setHurtCanCutDownEffect(false)`、`setDestroyWhenLastFrame(false)`，因此效果物会跟随英雄存在约 `10s`，不会因为英雄受击而中断，也不等动画末帧销毁。
- 动作回待机时间默认 `60` 帧；装备五行包含 `木` 时改为 `50` 帧。这个时间只影响法宝自身 `hit -> wait`，不改变 `MagicFlagEffect` 的 10 秒持续。

`MagicFlagEffect` 本身被禁用，不主动 `checkAttack()`，也没有独立伤害 action。它的实际效果在玩家受击链路中触发：`BaseHero.beMagicAttack()` 遍历被攻击玩家自己的 `magicBulletArray`，只要存在 `getImcName() == "MagicFlagEffect"`，就给攻击者 `param2` 添加：

```text
BaseAddEffect.MAGIC_FLAG_DEBUFF
time = gc.frameClips * 5
```

`MAGIC_FLAG_DEBUFF` 的后续效果：

- `BaseAddEffect` 每秒对 `BaseMonster` 扣 `怪物最大生命 * 0.02`，并显示怪物伤害数字；死亡怪不再扣。
- `BaseMonster.Hit` getter 中，普通怪命中值变为原值一半；boss 变为原值一半后再加 3。
- 视觉上挂 `MagicFlagDebuff` 子对象，到期时移除。

现代最小实现边界：

- `TASK-SLICE-031` 可以先做 `mdhf`：H 触发 10 秒护体状态，木五行只缩短动作窗口；玩家被 `Monster30 hit1` 命中时，给该怪添加 5 秒 debuff。
- 首切片可把 `Hit` 降低记录为状态展示，先实现每秒按最大 HP 2% 扣血和到期清理；等怪物命中/闪避系统细化后再把命中值减半接进真实 miss 判定。
- 起手/环绕/减益视觉继续使用占位 key；真实 `MagicFlagStart/Effect/Debuff` 资源后置。
- 不需要新增 projectile 伤害窗口，因为原版 `MagicFlagEffect` 的反制发生在玩家受击链路，而不是主动环绕命中怪物。

## 血海魔童 / MagicPearl

`xhmt` 由 `BaseHero.initMagicWeapon()` 创建 `MagicPearl`。构造时设置 `bmwId = BaseMagicWeapon.BMW_pearl`；`showSkill()` 内部会写入 `mp = 100 + 最大MP * 0.02`，但本轮证据中没有实际扣 MP 或用该字段做门禁，应视为旧记录字段或后续未接线字段。

释放起手：

- 创建 `SpecialEffectBullet("MagicPearlBegin")`，位置为法宝当前位置，`setDisable()`、`setRole(sourceRole)`、`setAction("wait")`，朝向跟英雄一致。
- 从当前 `zbfb` 装备读取等级和五行：`attacktimes = 3 + equip.getELevel() / 3`；五行包含 `木` 时 `attacktimes += 2`。AS3 变量是 `int`，现代侧建议用向下取整后的总次数。
- `MagicPearlBegin` 销毁时调用 `run()` 开始攻击链；同时 30 帧后法宝自身回 `wait`。攻击链不依赖法宝自身继续保持 `hit`。

`run()` 每轮重新扫描 `gc.pWorld.monsterArray`，按与英雄距离选最近怪物。没有怪物，或 `times > attacktimes`，都会进入 `dowhendestroy()` 做结束随机效果。每次有效轮次：

- 第 1 轮创建 `SpecialEffectBullet("MagicPearlRun")`，从法宝当前位置飞向目标附近。
- 第 2 轮起创建 `SpecialEffectBullet("MagicPearlBack")`，从上一目标位置飞向新目标附近。
- 飞行 Tween 固定 `0.5s`，目标点为怪物 `x +/- 30, y`；左右方向由起点和目标 x 比较决定。
- 飞行特效销毁后调用 `attack()`，在记录的目标点创建 `SpecialEffectBullet("MagicPearlEffect")`。

`MagicPearlEffect` 在自身动画第 3、12、28 帧分别只触发一次：

- 第 3 帧：创建 `MagicPearlBullet1`，位置 `targetY - 15`。
- 第 12 帧：创建 `MagicPearlBullet2`，位置 `targetY`。
- 第 28 帧：创建 `MagicPearlBullet3`，位置 `targetY + 10`。
- 三个 bullet 都 `setRole(sourceRole)`、`setAction("fabao-pearl")`、按方向 `setDirect(dir)`，进入普通 `BaseBullet` 命中链路。

`BaseHero.attackBackInfoDict["fabao-pearl"]`：

| 字段 | 值 |
| --- | --- |
| `hitMaxCount` | `999` |
| `attackBackSpeed` | `[2, -2]` |
| `attackInterval` | `2` |
| `attackKind` | `magic` |
| `addprotection` | `0` |

五角色 `getRealPower("fabao-pearl")` 都按 `装备等级 * 0.0315 * Hurt` 计算基础伤害，并乘各角色既有修正系数；反编译代码里木五行的 `0.0473` 分支随后被无条件默认分支覆盖，所以现代实现不应擅自给命中伤害加木倍率。`BaseMonster.beMagicAttack()` 对 `MagicPearlBullet1/2/3` 有特判：伤害直接取 bullet 原始 `hurt`，不再走怪物防御修正 `getRealHurt()`。

攻击链结束后 `dowhendestroy()` 随机三选一：

- `0.00..0.33`：给英雄回复 `最大MP * 等级 * 0.01`。
- `0.34..0.66`：若没有怪物，改为回蓝；否则给所有非无敌、未死亡怪物添加 `STUN`，持续 `gc.frameClips * (等级 / 8)`。
- `>= 0.67`：若没有怪物，改为回蓝；否则给所有非无敌、未死亡怪物添加 `POISON` 和 `POISON_TIMES`，持续 `gc.frameClips * (等级 / 4)`，毒伤 power 为 `英雄Hurt * 等级 * 0.0413`。

如果装备五行包含 `木`，结束随机效果中的等级系数先乘 `1.5`，因此回蓝量、眩晕持续、毒持续和毒伤都会随之放大。

现代最小实现边界：

- 建议把 `xhmt` 拆成 `TASK-SLICE-032`，不要和 `mdhf` 同切片完成。它需要一个小型法宝攻击链状态机：起手、最近目标选择、0.5 秒飞行段、三段命中、循环次数、结束随机效果。
- 首切片可用占位线段/闪光表现 `MagicPearlRun/Back/Effect/Bullet1-3`，但必须保留三段 bullet 的帧序和 `fabao-pearl` 参数。
- 伤害可先接现有法宝 projectile 结算，但需要标记“MagicPearl 三 bullet 不走怪物防御修正”这一差异；完整五角色 `getRealPower` 和吸血/qixue 可后置。
- 结束随机效果首版可以先实现回蓝、Monster30 眩晕状态、Monster30 中毒 tick；全怪物通用 AddEffect、真实概率 UI、联网同步后置。

## 现代实现建议

现代侧已经完成首个非葫芦治疗法宝切片：

- `TASK-SLICE-023` 已新增 `MagicWeaponSystem`，范围包括 `zbfb` 装备切换、`H` 触发、`hit/wait` 重入、治疗持续效果、木五行持续时间加成和 UI 状态反馈。
- `kyl` 枯叶灵按 `MagicLeaf` 等价恢复 HP；`syl` 神叶灵按 `MagicLeaf2` 等价恢复 HP/MP；`xhhl` 继续交由宣花葫芦捕捉链路处理。
- `TASK-SLICE-024` 已新增 `lxj` 戮仙剑/MagicSword2 伤害法宝最小切片，范围包括最近怪物锁定、`MagicSword2_2` 占位 projectile/特效、伤害结算和重入边界。
- `TASK-SLICE-025` 已新增 `fbqpj` 青萍剑/MagicQPJ 多剑与自动飞剑最小切片，范围包括主动 6 个 `qpjeffect` projectile、空闲约 `11.225s` 自动 1 剑、最近未死亡目标锁定、无目标边界和重入拒绝。
- `TASK-SLICE-026` 已新增 `hyzzs` 混元珍珠伞/MagicUmbrella 与 `hywjs` 混元无极伞/MagicUmbrella2 护盾法宝最小切片，范围包括 H 触发、30 帧回待机、10 秒护盾、木五行盾量加成、扣 HP 前吸收、耗尽/过期边界；`MagicUmbrella2` 的反弹、吸血暂不实现。
- `TASK-SLICE-027` 已新增 `zjld` 紫金铃铛/MagicRing 无敌与回复法宝最小切片，范围包括 H 触发、30 帧回待机、基础 `2s` 无敌、木五行 `1.5` 倍无敌、HP/MP 回复公式和无敌期间免伤。
- `TASK-SLICE-028` 已新增 `zsTimer` 烁时金轮/MagicTimer 时间回溯法宝最小切片，范围包括第一次记录 HP/MP/坐标、等待期间第二次 H 特殊回溯、基础 30 秒等待、木五行 27 秒等待和过期失效。
- `TASK-SLICE-029` 已新增 `lxfb` 流邪/MagicLXFB、`sxfb` 沙邪/MagicSXFB 与 `yxfb` 渊邪/MagicYXFB 入魔 buff 法宝最小切片，范围包括 H 触发、21 帧回待机等价动作窗口、攻击/暴击增益、流邪/沙邪持续扣血、渊邪半血消耗、木五行持续时间和到期清理。
- `TASK-SLICE-030` 已新增 `jyhl` 九佑魂莲/MagicFlower 全体增减益法宝最小切片，范围包括玩家/出战宠物增益、`Monster30` 攻击减益、持续时间公式、木五行动作边界和到期清理。
- `TASK-SLICE-031` 已新增 `mdhf` 摩多魂幡/MagicFlag 反制 debuff 法宝最小切片，范围包括 H 触发 10 秒护体、木五行动作边界、玩家受击反制 `Monster30`、每秒最大 HP 2% 扣血、Hit 降低倍率记录和到期/死亡清理。
- `TASK-SLICE-032` 已新增 `xhmt` 血海魔童/MagicPearl 多段随机打击法宝最小切片，范围包括 H 触发 `MagicPearlBegin` 等价起手、`3 + floor(level / 3)` 且木五行 `+2` 的攻击次数、每轮最近目标选择、`MagicPearlBullet1/2/3` 三段 `fabao-pearl` projectile，以及结束随机回蓝/Monster30 眩晕/Monster30 中毒。
- `TASK-SLICE-033` 已新增 `tjbg` 太极八卦/MagicBagua 全屏眩晕法宝最小切片，范围包括 H 触发等级门禁、全体存活 `Monster30` 眩晕、普通 `6s`/木五行 `8s` 持续、约 24 帧动作回待机、重入拒绝和到期恢复。
- 下一步推荐 `TASK-SLICE-034`：震雷天锤/MagicZLHummer 前方雷锤法宝最小切片。
- 强化 UI 独立成后续 `TASK-SLICE` 或 `TASK-SETTINGS`，不要和首个能力切片混在一起。

后置范围：

- 剩余未实现法宝的技能表现，尤其 `zltc/stlp/qljfb` 等特殊表现。
- `xhmt` 后置完整五角色 `getRealPower("fabao-pearl")`、吸血/qixue、全怪物通用 AddEffect 泛化和真资源校准。
- 法宝强化面板、材料消耗和五行重置。
- 真实法宝资源接入。
- P2/联机法宝同步。

# 关卡流程索引

本文是 `TASK-SETTINGS-003` 的产物，记录第一个主线关卡、场景加载、地图标记、刷怪和通关入口。范围只覆盖能支撑最小战斗/关卡闭环的首批事实，不完整扒所有地图。

## 结论

- 默认新档第一主线关是 `curStage = 1`、`curLevel = 1`，对应 `export.level.StageListener11`、`export.gameSence.sl11`、背景资源 `bg11`。
- `StageListener01` 对应 `curStage = 0`、`curLevel = 1` 的任务/PK 门场景和 `klsmode` 特殊刷怪，不是默认第一主线战斗关。
- `1-1` 是纵向爬升关：过程中按玩家位置周期性刷 `Monster30`；到达 `y <= -1900` 后镜头锁定并进入 boss 区；`callBoss()` 生成 `Monster3`；`Monster3` 在 `1-1` 中作为 boss 死亡后显示传送门。
- 现代最小关卡切片建议以 `1-1 / StageListener11` 为第一个关卡依据，但实现时先取“`1-1` boss 区域 + `Monster3` + 可见传送门/通关”的窄切片；完整纵向爬升和随机飞行怪可后续扩展。

## AS3 证据

主要文件：

- `local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts/config/Config.as`
- `local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts/my/MainGame.as`
- `local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts/base/BaseGameSence.as`
- `local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts/World/PhysicsWorld.as`
- `local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts/base/BaseLevelListenering.as`
- `local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts/export/level/StageListener01.as`
- `local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts/export/level/StageListener11.as`
- `local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts/export/monster/Monster3.as`
- `local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts/base/MonsterAppearPoint.as`
- `local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts/export/StopPoint.as`
- `local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts/base/BaseHero.as`
- `local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts/export/hero/Role1.as` 至 `Role5.as`

## 场景加载链路

默认关卡值：

- `Config.initData()` 初始化 `curBigStage = 1`、`curBigLevel = 1`、`curStage = 1`、`curLevel = 1`。

进入战斗：

1. `MainGame.GameStart()` 按当前 `curStage/curLevel` 调用 `Assetsloader.loadByName(stage, level, this.newGame)`。
2. `MainGame.newGame()` 创建 `floorBg{curStage}`，再创建 `export.gameSence.sl{curStage}{curLevel}`。
3. `BaseGameSence` 构造时创建 `bg{curStage}{curLevel}` 放入 `bgContainer`，并把场景子对象交给 `gc.pWorld.addSubObj()` 识别为碰撞、门或停点等标记。
4. `MainGame.nextDoAfterLoad()` 把场景加入主显示层，播放关卡音乐，调用 `gc.pWorld.pWorldInit()`。
5. `PhysicsWorld.pWorldInit()` 创建 `export.level.StageListener{curStage}{curLevel}` 并调用 `init()`。
6. `BaseLevelListenering.init()` 注册 `waitForRegisterDataArray` 中的位图数据，完成后 `start()`。
7. `BaseLevelListenering.start()` 调用 `gc.pWorld.pWorldStart()`，后者创建 `KeyBoardControl`、`ViewControllor`、英雄和 `GameInfo`，并为停点编号。

资源/类名约定：

| 类型 | 命名 |
| --- | --- |
| 场景类 | `export.gameSence.sl{stage}{level}` |
| 背景资源 | `bg{stage}{level}` |
| 地板背景 | `floorBg{stage}` |
| 关卡监听器 | `export.level.StageListener{stage}{level}` |

## 地图标记

`PhysicsWorld.addSubObj()` 通过场景子对象的命名子节点判断用途：

| 标记子节点 | 归类 | 用途 |
| --- | --- | --- |
| `isWall` | `wallArray` | 普通墙/碰撞 |
| `isThroughWall` | `wallArray` | 可穿类墙体 |
| `isThroughUpButDownWall` | `wallArray` | 单向平台类墙体 |
| `isThroughDownButUpWall` | `wallArray` | 单向平台类墙体 |
| `noContinueGo` | `continueArray` | 阻止继续前进/镜头推进相关 |
| `isTransferDoor` | `transferDoorArray` | 通关或切换入口；非 `curStage == 0` 时初始隐藏 |
| `monsterDisapperaPoint` | `monsterDisappertPointArray` | 怪物出现点数组的来源，名称拼写保留原版 |
| `isHideWall` | `otherArray` | 隐藏墙或其他调试对象 |
| `stophere` | `StopPoint` | 横向关卡停点，按 x 坐标排序并编号 |

`StopPoint.touch()` 会遍历 `gc.pWorld.getMonsterAppearArray()`，启动 `stopPointIdx` 等于当前停点编号的 `MonsterAppearPoint`。所有对应刷怪点完成且 `monsterArray` 清空后，停点销毁并恢复镜头推进。这个流程适合后续横向刷怪关，但 `StageListener11` 自己用脚本刷怪，不依赖停点。

## 刷怪入口

通用刷怪：

- `MainGame.createMonster(kind, x, y)` 创建 `export.monster.Monster{kind}`，设置坐标和朝向，加入 `gc.pWorld.monsterArray`，并插入到场景显示层。

停点刷怪：

- `MonsterAppearPoint.start()` 按 `delay`、`interval`、`totalNum`、`enemyType` 和 `stopPointIdx` 控制生成。
- 生成前检查 `gc.pWorld.monsterArray.length < gc.maxMonsterPerScreen`。
- 调用 `MainGame.getInstance().createMonster(enemyType, x, y)`。

`1-1` 脚本刷怪：

- `StageListener11.step()` 的 `monsterAppearCount` 初值是 `72`。
- 计数归零后选择一个玩家作为中心。
- 单人每轮刷 `2` 个 `Monster30`；双人每轮刷 `4` 个 `Monster30`。
- 位置是玩家附近：`x = hero.x + (random - 0.5) * 300`，`y = hero.y - (100 + random * 200)`。
- 下一轮间隔为 `gc.frameClips * 6`。

## 通关/交互入口

通用传送门检查：

- `BaseHero.checkTransferDoor()` 遍历 `gc.pWorld.getTransferDoorArray()`，要求传送门与英雄 `colipse` 碰撞且 `visible == true`。

按上键/交互：

- 五个角色的 `myKeyDown()` 都有 `case "0001"` 分支。
- 如果 `checkTransferDoor()` 为真，先调用当前关卡监听器的 `keyBoardDownForW(hero)`，给特殊关卡覆写机会。
- 普通关卡中，如果仍未通关且 `checkTransferDoor()` 为真，会设置 `gc.isLevelClear = true`、销毁键盘控制、淡出 UI 和场景，然后派发 `LevelVictor` 并调用 `MainGame.levelClear()`。

`MainGame.levelClear()`：

- 播放胜利/开始音效相关逻辑。
- 更新 `curBigStage/curBigLevel` 等进度。
- 销毁当前游戏场景并保存。

失败入口：

- `TASK-SETTINGS-050` 已补齐死亡、全员失败、重开和返回目标；详见下方“Stage 1-1 正式流程合同”。

## 第一个主线关卡：Stage 1-1

类：

- 监听器：`export.level.StageListener11`
- 场景：`export.gameSence.sl11`
- 背景：`bg11`
- boss：`export.monster.Monster3`
- 过程怪：`export.monster.Monster30`

流程：

1. 新档默认进入 `curStage = 1`、`curLevel = 1`。
2. `StageListener11.start()` 不注册额外 `waitForRegisterDataArray`，只创建 `CloudSprite`。
3. 每帧 `StageListener11.step()` 更新云层 y，并周期性在玩家附近刷 `Monster30`。
4. 当单人玩家或双人任一玩家 `y <= -1900` 时：
   - 所有玩家/宠物若还在 `y >= -1862`，被移到 `y = -1950`。
   - `gc.gameSence.y` tween 到 `2370`。
   - 清理 `Role2` 影子和 `Role4` 标记。
   - 调用 `gc.vControllor.setStopStep()` 停止镜头推进。
5. tween 完成后 `callBoss()` 生成 `Monster3`，坐标 `(750, -2050)`。
6. `Monster3` 在 `curStage == 1 && curLevel == 1` 时 `isBoss = true`，HP/SHp 为 `926`。
7. boss 死亡后，`Monster3.destroy()` 把所有 transfer door 设为 `visible = true`。
8. 玩家站到可见传送门并按上，走通用 `LevelVictor + MainGame.levelClear()`。

### Stage 1-1 正式流程合同（TASK-SETTINGS-050）

本节只描述从关卡选择到退出结果页的状态迁移。AS3 证据来自 `[172845].swf/scripts` 下的 `config/Config.as`、`export/SelectPLace.as`、`GMain.as`、`my/MainGame.as`、`base/BaseHero.as`、`export/hero/Role1.as`（Role2—Role5 同构）、`export/win/GameWin.as`、`export/lose/GameFail.as` 与 `storage/MemoryClass.as`。

#### 正式进入

1. 新档初始化 `curBigStage/curBigLevel/curStage/curLevel = 1/1/1/1`。
2. `SelectPLace.added()` 只给已解锁关卡按钮注册点击；当前最高可玩按钮停在 frame 2。点击 `s1_1` 后，`onSelected()` 从按钮名写入 `curStage = 1`、`curLevel = 1`，派发同步事件 `selectStageOver` 并移除选择页。
3. `GMain.selectStageOver()` 调用 `switchSence("startFighting")`；该分支先 `clearStageMap()`，再 `startGame(curStage, curLevel)`。
4. `MainGame.GameStart()` 按当前关卡调用 `Assetsloader.loadByName("1", "1", newGame)`；`newGame()` 重置暂停/计时状态，依次创建根层地面、`sl11` 场景并完成玩家/世界初始化。正式控制只在该初始化结束后进入战斗循环。

#### 全员死亡与失败

1. `BaseHero` 在复活道具门禁均失败后先标记死亡并 `destroy()`，清除角色显示、输入/重力、效果、子弹、法宝和宠物，再派发 `heroDead(this)`。
2. `GMain.heroDead()` 先在死亡点创建 `PlayerDeadMc`。仅 `gc.isSingleGame()` 为真时，它才延迟 2.5 秒调用 `MainGame.checkGameOver()`。
3. `checkGameOver()` 以 `gc.getPlayerArray().length == 0` 作为全队死亡谓词；命中后先 `destroyGame()`，再派发 `GameOver`。`destroyGame()` 清除帧循环、世界/背景/键盘/镜头、玩家与宠物引用和 tween。
4. `GMain.gameOver()` 切换到 `gameOver`，播放失败音效并创建 `GameFail`。Stage 1-1 的“重玩”按钮可见：点击后派发 `ReStart`，重新走 `startFighting`，保留当前 `curStage/curLevel = 1/1`；“返回”按 `whichlastworld` 回对应关卡地图。失败不推进关卡，也没有显式存档副作用。

恢复源码存在一个必须保留的证据缺口：`checkGameOver()` 只有上述单人延迟调用点，双人本地模式的 `heroDead()` 没有直接触发它。因此“任一角色死亡后，延迟检查全部已配置玩家是否死亡，并且整局只触发一次失败”是现代实现对原版全队死亡谓词的明确修复，不伪称为源码原样行为。

#### 胜利、进度、存档与结果导航

1. 玩家碰到已显示的传送门并按上后，角色先把 `isLevelClear` 置真、销毁键盘控制，再用 1 秒 tween 淡出 `gameInfo` 与 `gameSence`。
2. tween 完成回调先同步派发 `LevelVictor`，`GMain.levelVictor()` 创建仍位于主场景的 `GameWin`；随后同一回调才调用 `MainGame.levelClear()`。因此结果页先读取仍存活的英雄/计时/连击并计算评分，之后战斗场景才销毁。
3. `levelClear()` 对非联机主机路径推进最高解锁进度：仅当前关卡等于最高解锁关卡时推进。首次完成 1-1 会把 `curBigLevel` 从 1 增到 2；当前游玩坐标仍保持 `curStage/curLevel = 1/1`。
4. 接着播放胜利音效、调用 `destroyGame()` 清理战斗运行时；若 `saveId >= 0`，最后调用 `memory.saveGame(saveId, true)`。`MemoryClass.setStorage()` 把 `curBigStage/curBigLevel` 与玩家数据写入存档对象，再压缩、加密并写入对应槽位。
5. 1-1 结果页的“下一关”把 `curLevel` 改为 2，再派发 `selectStageOver` 进入 1-2；“返回”按 `whichlastworld` 回关卡地图。两者均在移除结果页前清空最大连击。现代 Stage 1-1 单线不实现 1-2 内容，下一关导航必须明确为暂不可进入，不能伪造 1-2。

#### 原版与现代实现差异矩阵（TASK-SETTINGS-050 基线）

| 维度 | 原版合同 | TASK-SETTINGS-050 时的现代实现 | TASK-SLICE-124 门禁 |
| --- | --- | --- | --- |
| 正式入口 | 已解锁的 `s1_1` → `selectStageOver` → 清地图 → 加载 1-1 → 初始化控制 | `BootScene` 直接启动 `TestScene`，没有玩家可见的 1-1 入口 | 增加只服务本线的 1-1 入口页；不是全局菜单重构 |
| 玩家控制 | 关卡资源与玩家/世界初始化完成后进入战斗；门触发立刻销毁键盘控制 | debug 场景按 URL/默认配置进入，通关覆盖层出现后未形成正式输入门禁 | 入口选择 1P/2P；失败/胜利态冻结关卡控制和重复迁移 |
| 失败判定 | 单人死亡后延迟 2.5 秒，以存活玩家数组为空判失败；双人调用缺失是源码缺口 | 没有全员失败页、重玩或返回流程 | 对全部已配置玩家统一执行一次延迟全灭检查，补正双人缺口 |
| 场景清理 | 失败先销毁战斗再建失败页；胜利先建结果页取数，再推进进度并销毁战斗 | `LEVEL CLEAR` 仅覆盖显示，既有运行时对象没有完整退出边界 | 结果快照先于清理；随后停止更新/输入，并通过场景切换完成清理 |
| 关卡进度 | 首次完成 1-1 解锁最高关卡 1-2；失败不推进 | 无关卡最高进度状态 | 存储 `unlockedStage/unlockedLevel`，胜利幂等解锁 1-2；不加载 1-2 |
| 存档 | 胜利清理后显式保存当前槽；失败无保存 | V2 自动存档只含玩家/宠物，没有关卡进度或胜利提交 | 升级存档结构并迁移 V1/V2；胜利显式提交进度，失败不提交 |
| 返回目标 | 失败/胜利返回对应关卡地图；胜利可下一关 | 无正式返回目标 | 返回本线 1-1 入口页；标明它是关卡地图的最小替代壳 |

`TASK-SLICE-124` 的最小闭环据此固定为：1-1 玩家可见入口、1P/2P 全灭失败、可重玩/返回、门胜利结果、1-2 解锁进度与显式持久化、场景清理和专项测试。它不得扩张到其他关卡、Monster3/Monster30 真素材或全局菜单体系。

实现状态（2026-07-19）：`TASK-SLICE-124` 已完成并归档。入口点击、1P/2P 进入、单人/双人全灭、失败重玩/返回、胜利结果/返回和刷新后 1-2 解锁显示均通过浏览器验收；结果页按钮的滚动相机命中问题也已修复。

为什么它适合作为第一个现代关卡依据：

- 它是默认新档第一主线关，有明确入口和通关闭环。
- 关卡脚本显式写出了过程刷怪、boss 触发和通关门显示，不依赖完整地图数据才能理解。
- 可拆出较小实现范围：先做 boss 区、一个 boss、传送门通关；之后再补纵向爬升、云层、随机 `Monster30`。

实现风险：

- 完整 `1-1` 需要纵向镜头和原图尺寸/碰撞边界，不能在没有资源索引时一次性做到接近原版。
- `Monster3` 和 `Monster30` 的行为仍需怪物系统索引支撑；下一步应先扒 `BaseMonster`。
- 传送门和墙体坐标嵌在 SWF 时间轴/场景对象里，现代实现需要资源/地图提取策略或手工数据化。

## 非首关但相关场景

### Stage 0-1：StageListener01

- `StageListener01` 是 `curStage = 0`、`curLevel = 1`。
- `klsmode == 1` 时加载并排生成一批普通怪；`klsmode == 2` 时生成另一组怪。
- 场景中读取 `rwDoor` 和 `pkDoor`：`rwDoor` 触发任务界面，`pkDoor` 触发竞技场 UI。
- 该场景可作为调试/功能入口参考，不作为默认第一主线战斗关。

### Stage 1-2 / 1-3

- `StageListener12`、`StageListener13` 都注册若干怪物资源。
- `StageListener12` 有 `fbEnter` 特殊入口：玩家弹体击中 `fbEnter.colipse` 累计五次后播放动画，玩家站入后调用 `MainGame.fbEnter()`。
- 这两个关卡应在怪物基础索引之后再细扒，不纳入本任务范围。

## 1-1 Boss：Monster3 详细数据

本节由 `TASK-SETTINGS-012` 补充。目标是给 `VS-007` 第一个关卡闭环实现提供 Monster3 的完整可验收数据。

### AS3 证据

- `local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts/export/monster/Monster3.as`
- `local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts/export/level/StageListener11.as`
- `local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts/World/PhysicsWorld.as`

### 基础数值

`Monster3` 构造函数：

| 字段 | 1-1 boss 值 | 非 boss 值 | 说明 |
| --- | --- | --- | --- |
| `hp/sHp` | `926/926` | `400/400` | 1-1 中 `isBoss = true` |
| `horizenSpeed` | `4` | `4` | 水平移动速度 |
| `attackRange` | `150` | `150` | x 轴攻击范围 |
| `alertRange` | `1000` | `1000` | 索敌警戒范围 |
| `def` | `5` | `5` | 物理防御 |
| `mDef` | `0.2` | `0.2` | 魔法减伤比例 |
| `exp` | `7` | `7` | 击杀经验 |
| `gxp` | `4` | `4` | 红色 aura power 基础 |
| `probability` | `1` | `0.15` | 装备/道具掉落概率 |
| `monsterName` | `"巫鹰"` | `"巫鹰"` | boss 血条显示名称 |
| `isBoss` | `true` | `false` | `curStage==1 && curLevel==1` 时 |

### 攻击数据

`attackBackInfoDict`：

| 动作 | power | attackKind | attackInterval | hitMaxCount | 击退 | 说明 |
| --- | --- | --- | --- | --- | --- | --- |
| `hit1` | `40` | `physics` | `999` | `99` | `[6, -5]` | 普攻，近身概率触发 |
| `hit2` | `18` | `magic` | `4` | `99` | `[-5, 0]` | 技能，距离 < 200 时通过 CD 触发 |

### 技能 CD

`skillCD1 = [gc.frameClips * 2, gc.frameClips * 4]` 即冷却 2s、间隔 4s（按 24fps：`[48, 96]` 帧）。

`beforeSkill1Start()`：当 `curAttackTarget` 存在且距离 `< 200` 时返回 `true`，触发 `releSkill1()` → `setAction("hit2")`。

### 动作和动画行

`initBBDC()`：位图池名 `"Monster3"`，帧大小 180x180（`3*60`），偏移 `(20, -5)`。

| 动作 | 帧行 y | 帧数 | 停顿 | 结束行为 |
| --- | --- | --- | --- | --- |
| `wait` | `0` | 6 | `[2,2,2,3,2,4]` | 循环回第 0 帧 |
| `walk` | `1` | 4 | `[4,4,4,4]` | 循环回第 0 帧 |
| `hurt` | `2` | 1 | `[15]` | `setStatic()` 后回 `wait` |
| `dead` | `3` | 6 | `[2,2,2,2,2,5]` | `dropAura()` 后 `destroy()` |
| `hit1` | `4` | 6 | `[2,2,2,2,2,5]` | 回 `wait` |
| `hit2` | `5` | 4 | `[2,2,1,26]` | 回 `wait` |

### 攻击帧

`enterFrameFunc()`：

- **hit1**：`param1.x == 3` 且 `getCurFrameCount() == 1` → `doHi1(direct)` → 创建 `SpecialEffectBullet("Monster3Bullet1")`：
  - x = 怪物 x ± 105（朝向），y = 怪物 y - 60
  - 读取 `attackBackInfoDict["hit1"]`
- **hit2**：`param1.x == 3` 且 `getCurFrameCount() == 26` → `doHi2(direct)` → 创建 `SpecialEffectBullet("Monster3Bullet2")`：
  - x = 怪物 x ± 155（朝向），y = 怪物 y - 30
  - 读取 `attackBackInfoDict["hit2"]`

### AI

`myIntelligence()`：受击中（`isBeAttacking()`）时跳过 AI，否则走基类完整 AI（追踪、距离决策、普攻/技能）。

### Boss 死亡 → 传送门显示

`destroy()` override：

1. 调用 `super.destroy()`（淡出、清理子弹、标记 `isReadyToDestroy`）。
2. 如果 `isBoss == true`，遍历 `gc.pWorld.getTransferDoorArray()`，全部设为 `visible = true`。

### Boss 掉落

boss 模式下 `probability = 1` 且 `fallList` 包含 10 件普通装备（`ptdxzg/ptdxzf/ptdcz/ptdjs/ptddp/ptdcs/ptdyyc/ptdcp/ptdtj/ptdcf`，bigtype 均为 `zb`）。首个现代切片可暂不实现掉落。

## VS-007 实现数据汇总

本节是 `TASK-SETTINGS-012` 为 `VS-007` 关卡闭环实现准备的最小数据清单。

### Boss 区参数

| 参数 | 值 | 来源 |
| --- | --- | --- |
| 触发条件 | 任一玩家 `y <= -1900` | `StageListener11.step()` |
| 玩家传送 | `y >= -1862` 的玩家/宠物 → `y = -1950` | 同上 |
| 镜头移动 | `gc.gameSence.y` tween 到 `2370`（2 秒） | 同上 |
| Boss 生成位置 | `(750, -2050)` | `StageListener11.callBoss()` |
| 镜头停止 | `gc.vControllor.setStopStep()` | boss 触发后 |

坐标系说明：原版 Flash 坐标系 y 轴向下为正。`1-1` 是纵向爬升关，玩家从下方出发向上爬，y 值逐渐减小。到达 `y = -1900` 时触发 boss，镜头锁定，boss 在 `y = -2050`（玩家上方约 100 像素）生成。

### 传送门

| 参数 | 值 | 来源 |
| --- | --- | --- |
| 来源 | SWF 场景中 `isTransferDoor` 子节点 | `PhysicsWorld.addSubObj()` |
| 初始状态 | `visible = false`（`curStage != 0` 时） | 同上 |
| 显示触发 | `Monster3.destroy()` 且 `isBoss == true` | `Monster3.destroy()` |
| 通关条件 | 玩家 `colipse` 碰撞可见传送门 + 按上键 | `BaseHero.checkTransferDoor()` |
| 通关流程 | `gc.isLevelClear = true` → 销毁键盘 → 派发 `LevelVictor` → `MainGame.levelClear()` | `levels-index.md` |

### Stage 1-1 真资源定位

`TASK-SETTINGS-046` 从 RegiMA 恢复源包闭合了旧提取集没有提供的三个符号。旧 `local-resources/regima/legacy-extraction/resources_by_swf` 仍只作 AS3 历史对照：

| 资源 | 精确源包 / character | tag 与时间轴 | 尺寸/边界 | 结构结论 |
| --- | --- | --- | --- | --- |
| `export.gameSence.sl11` | `assets/levels/level11.swf` / 46 | `DefineSprite` tag 39，1 帧，帧标签 `1-1` | 1297.2×2970.45；坐标边界约 `x=-200..1097.2`、`y=-2379.4..591.05` | 空 `bgContainer`、1 个静态前景 shape、3 个 `ObsWall`、15 个 `ThroughWall`、1 个 `ThroughUpButDownWall`、1 个 `FallDownWhenStandingWall`、1 个 transfer door |
| `bg11` | `assets/1.swf` / 141 | `DefineSprite` tag 39，1 帧；内含 character 140 `DefineShape` → character 139 `DefineBitsJPEG2` | 1132×3051；坐标边界 `x=-59..1073`、`y=-2370..681` | 不嵌在 `sl11`；`BaseGameSence` 运行时实例化并以 `x=-20` 加入 `bgContainer` |
| `floorBg1` | `assets/1.swf` / 1 | `DefineBitsJPEG2` tag 21；无 MovieClip 时间轴 | 1440×690 | `MainGame.createFloorBg()` 包成 Bitmap，并在创建 `sl11` 之前加到根节点 |

`sl11` 自身只有 1 帧，但 transfer door 外层 character 45 内含 character 41（20 帧）和 character 44（19 帧）的动画子时间轴及 `isTransferDoor` 标记。三项资源均可按 character 选择性派生；场景实现必须保留“根节点地面 → 场景布局 → `bgContainer` 动态背景”的组合边界，不能把它们误记为 `level11.swf` 内的单一平面图。

- `sl11` 场景布局：包含 `bgContainer`、墙体标记、传送门标记和碰撞标记
- `bg11` 背景资源：位于 Stage 1 公共资源包 `assets/1.swf`
- `floorBg1` 地板背景：同样位于 `assets/1.swf`，由 `MainGame.createFloorBg()` 加载，容器类为 `export.FloorBg`
- `Monster3` 位图资源：不在当前导出中
- `Monster3Bullet1`/`Monster3Bullet2`：不在当前导出中

**VS-007 当前实现策略**：

- `TASK-SLICE-123` 已从精确 character 选择性派生真地面、背景和 character 18 前景；20 个墙标记矩阵与 character 45 门独立数据化。
- 传送门仍用现代占位视图表达动画，但碰撞边界和位置取自 character 45；Boss/Monster30 本体仍使用占位图形，行为按本文数据复现。
- 纵向爬升、周期刷怪、boss 触发和按上传送门通关均已实现；正式进入、失败和胜利持久化差异由 `TASK-SETTINGS-050` 继续闭合。

### 建议最小实现范围

1. 玩家从固定出生点开始（例如 `y = -1800`，boss 触发线下方）
2. 简单平台/地面（手工坐标）
3. 到达 `y <= -1900` → 镜头锁定 → boss 生成
4. Boss 追踪玩家，hit1/hit2 攻击
5. Boss HP 归零 → 传送门可见
6. 玩家站上传送门按上 → 通关（显示 "Level Clear" 或等价提示）

## 后续建议

- `TASK-SETTINGS-050` 精查正式进入、全员失败、胜利进度推进、存档和场景清理顺序，再生成同线实现切片。
- Monster3/Monster30 真素材保持独立资源范围，不与关卡流程证据混做。



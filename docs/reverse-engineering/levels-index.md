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
   - 因而玩家最终屏幕坐标为 `-1950 + 2370 = 420`，即原版 590px 视口高度的约 71%；tween 时长为 2 秒。
   - 清理 `Role2` 影子和 `Role4` 标记。
   - 调用 `gc.vControllor.setStopStep()` 停止镜头推进。
5. tween 完成后 `callBoss()` 生成 `Monster3`，坐标 `(750, -2050)`。
6. `Monster3` 在 `curStage == 1 && curLevel == 1` 时 `isBoss = true`，HP/SHp 为 `926`。
7. boss 死亡后，`Monster3.destroy()` 把所有 transfer door 设为 `visible = true`。
8. 玩家站到可见传送门并按上，走通用 `LevelVictor + MainGame.levelClear()`。

现代映射（`TASK-SLICE-149`）：到达现代 `bossTriggerY = 470` 时，相机目标按原版 `420 / 590` 屏幕比例计算为 `scrollY = 50`，并在 Boss 已立即触发后继续用 2 秒过渡收敛；普通爬升阶段仍保持角色位于屏幕高度 40% 的跟随构图。

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

- `StageListener13` 仍待后续独立调查，不属于 `LINE-STAGE-1-2`。
- `TASK-SETTINGS-051` 已闭合 Stage 1-2 的恢复源包、地图标记、普通推进、双 boss/门、失败/胜利与 `fbEnter` 特殊入口；下文为权威实现输入。

#### Stage 1-2 真资源与组合层级

| 资源 | 精确源包 / character | tag 与时间轴 | 尺寸/边界 | 组合结论 |
| --- | --- | --- | --- | --- |
| `export.gameSence.sl12` | `assets/levels/level12.swf` / 53 | `DefineSprite` tag 39，1 帧，帧标签 `1-2` | 5377.75×1000.35 | character 25 前景、空 `bgContainer`、`fbEnter`、3 个墙体、1 个单向坠落墙、5 个停点、13 个刷怪点和 character 52 门 |
| 前景 | 同包 / 25 | `DefineShape2` tag 22，无时间轴 | 边界 `x=-200..5177.75`、`y=494..589.4` | 应从 `sl12` 的调试/碰撞标记中独立选择性派生 |
| `bg12` | `assets/1.swf` / 135 | `DefineSprite` tag 39，1 帧；内含 character 134 `DefineShape2` tag 22 | 4889.65×595.8 | `BaseGameSence` 运行时以 `x=-20` 加入 `bgContainer`；`bgContainer` 自身位于 `x=60.75`，故背景场景坐标起点为 `x=40.75` |
| `floorBg1` | `assets/1.swf` / 1 | `DefineBitsJPEG2` tag 21，无时间轴 | 1440×690 | 与 1-1 共用；`MainGame.createFloorBg()` 在创建 `sl12` 前加到根节点 |
| `fbEnter` | `assets/levels/level12.swf` / 22 | `DefineSprite` tag 39，30 帧；内部 character 17 为 25 帧并在第 25 帧停止 | 第 1 帧导出边界 1536.8×184；实例原点 `(1760, 334.65)` | character 21 的 `colipse` 实例位于入口局部 `(339.55, 95.95)`；入口始终独立于普通传送门 |
| 普通传送门 | 同包 / 52 | `DefineSprite` tag 39，1 帧；内含 character 48（20 帧）和 51（19 帧） | 185.8×165；实例原点 `(4611.65, 452.35)` | 含 `isTransferDoor` 标记；非 Stage 0 初始隐藏，双 boss 全灭后显示 |

运行时层级与 1-1 相同：根节点 `floorBg1` → `sl12` → `sl12.bgContainer` 内动态 `bg12`。调查派生物位于 Git 忽略的 `local-resources/regima/task-outputs/task-settings-051-stage12/`，包含精确 SymbolClass、character 25 前景、30 帧 `fbEnter`、门的 20/19 帧子时间轴和背景 SVG；未修改恢复源包或旧提取集。

#### 地图标记全集

Flash 坐标均已除以 20 转为场景像素；墙体保留原始矩阵，避免用轴对齐近似覆盖旋转边界。

| 类型 / character | 数量 | 原点或矩阵 |
| --- | ---: | --- |
| `ObsWall` / 10 | 3 | `(2419.35,511.05)` scale `(17.567429,0.3030243)`；`(4917.55,89)` scale `(0.3896942,15.1515045)`；`(-184.35,211.4)` matrix `[a=0,b=2.364746,c=-0.35295105,d=0]` |
| `FallDownWhenStandingWall` / 9 | 1 | `(2415.35,-128.5)`，外层 scale `(17.333298,1)`；character 9 内部对 296×66 基形再应用 `(1.0135193,0.3030243)` |
| `StopPoint` / 7 | 5 | `(1147.4,215.25)` idx 0；`(1809.7,208.55)` idx 1；`(2813.95,189.35)` idx 2；`(3790.2,258.35)` idx 3；`(4661.55,240.7)` idx 4 / `isBoss=true` |
| `MonsterAppearPoint` / 5 | 13 | 见下表；所有实例 `interval=1`、`isRandom=false` |
| 普通传送门 / 52 | 1 | `(4611.65,452.35)` |
| `fbEnter` / 22 | 1 | `(1760,334.65)` |

停点由 `PhysicsWorld.addSubObj()` 按 x 排序，`pWorldStart()` 再以排序结果覆盖 `idx`；这里的实例属性 idx 与排序结果一致。横向推进的关键条件在通用 `ViewControllor.step()`，不在 `StageListener12`：英雄的屏幕 x 由 `BaseHero.step()` 限制在 `20..920`；队伍满足单人等价的 `x >= 940 * 2 / 3` 后推动场景；当当前首停点的全局 x 进入屏幕右侧 `900..980` 时，记录当前场景位置并调用 `StopPoint.touch()` 锁住该波推进。该批刷完且全场怪物为 0 时移除停点，再恢复镜头推进。

`TASK-SLICE-128` 按用户实测将这一可观察合同收紧为：镜头先跟随，每个未触发停点是当前世界右边界；最后一段由角色移动到屏幕 `x=920` 后被挡住并触发该波。这保留了原版“停点在屏幕右端触发 + 战斗期锁屏”的可观察行为，不再用 `stopPoint.x - 90` 的纯世界坐标提前刷怪。

| 实例 | 位置 | stop idx | delay | enemyType | totalNum |
| --- | --- | ---: | ---: | ---: | ---: |
| `__id52_` | `(347.6,328.85)` | 0 | 2 | 8 | 4 |
| `__id59_` | `(967.55,323.2)` | 0 | 2 | 8 | 4 |
| `__id53_` | `(1266.7,328.85)` | 1 | 6 | 7 | 3 |
| `__id54_` | `(1521.4,396)` | 1 | 2 | 8 | 5 |
| `__id60_` | `(1783.5,333)` | 1 | 6 | 7 | 3 |
| `__id55_` | `(1948.8,343.2)` | 2 | 2 | 7 | 6 |
| `__id61_` | `(2661.45,343.2)` | 2 | 2 | 7 | 6 |
| `__id56_` | `(2945.25,387.2)` | 3 | 2 | 7 | 3 |
| `__id57_` | `(2888.95,387.2)` | 3 | 6 | 8 | 3 |
| `__id58_` | `(3559.3,388)` | 3 | 2 | 7 | 4 |
| `__id62_` | `(3635.4,388)` | 3 | 6 | 8 | 3 |
| `__id51_` | `(4009.8,343.2)` | 4 | 2 | 4 | 1 |
| `__id63_` | `(4606.85,351.2)` | 4 | 2 | 2 | 1 |

五批数量依次为 8、11、12、13、2，总计 46 只。`StageListener12.waitForRegisterDataArray` 注册 `Monster8/7/4/2`；普通批使用 7/8，末批同时生成 `Monster4`（千里眼，1481 HP）与 `Monster2`（顺风耳，1500 HP）。两者在 1-2 均为 boss：任一死亡时会检查另一类型是否仍存活，只有二者均死亡才把全部普通传送门设为可见。

#### 普通完成、失败与进度

- 出生点沿用 `Config.createHero()`：已配置的 P1/P2 显示对象注册点均位于 `(100,350)`；Stage 1-2 没有专属出生覆盖。该 y 是原角色 MovieClip 注册点，不能直接当成现代占位 SVG 的脚底 y。水平 `ObsWall` 由 `ty=511.05`、高 `66 * 0.3030243` 推导出可站立顶面 `y=501.0501981`；现代角色与怪物占位视图都应以脚底/底边对齐该线。
- P1 按键表在 `KeyBoardControl` 中为 `[S,J,K,W]`，五个角色的 `myKeyDown("0010")` 都调用 `BaseHero.jump()`；`jumpCount < 2` 表明 K 是跳跃且支持二段跳。
- 玩家碰撞已显示的 character 52 门并按上，角色层锁定 `gc.isLevelClear`、销毁键盘并做 1 秒淡出；淡出完成同步派发 `LevelVictor` 后调用 `MainGame.levelClear()`。
- 若 `curStage/curLevel == curBigStage/curBigLevel == 1/2`，`levelClear()` 把 `curBigLevel` 推进到 3，销毁关卡并显式保存。`GameWin` 的“下一关”把当前关卡改为 1-3 后派发 `selectStageOver`；“返回”按 `whichlastworld` 回对应关卡地图。
- 失败谓词和 1-1 相同：玩家数组为空时 `checkGameOver()` 清战斗并派发 `GameOver`；失败页可保持 `1/2` 重玩，或回关卡地图，且不推进/保存解锁。恢复源码仍只有单人死亡路径延迟 2.5 秒调用该检查；现代侧应复用 `Stage11FlowSystem` 已补正的统一 1P/2P 全灭门禁。

#### `fbEnter` 特殊入口

1. `StageListener12.start()` 从 `gc.gameSence` 直属子项按实例名找到 character 22 `fbEnter`。
2. 入口外层停在第 1 帧时，每位玩家的每个 `magicBulletArray` 弹体都会与局部 `colipse` 做复杂命中检测。一次成立使 `fbCount` 从 5 减 1、生成 `HeroBeHurt` 反馈，并用 `fbFatherCount = gc.frameClips * 1` 建立 1 秒防重复计数；弹体本身不会在这里被消费。
3. 五次有效命中后从第 2 帧播放到总帧 30。只有外层到第 30 帧后才检查玩家碰撞。
4. 任一玩家持续与入口 `colipse` 重叠 72 帧后调用 `MainGame.fbEnter()`；所有玩家均离开时 `stayCount` 重置为 72。双人不要求同时进入，同一共享计数可由任一/交替重叠玩家递减。
5. `MainGame.fbEnter(0)` 先完整销毁 Stage 1-2，再把 `curStage/curLevel` 改为 `5/1`，派发 `ReStart` 重新走 `startFighting`。它不是普通通关，不推进 `curBigLevel`，也不显示 1-2 胜利页。
6. Stage 5-1 由 `StageListener51` 驱动，没有返回 1-2 的专属脚本。其普通完成走通用 `LevelVictor` / `GameWin`，失败走 `GameFail`；二者的返回按钮均按 `whichlastworld` 回关卡地图。因此现代实现不得伪造“副本结束原地回 1-2”。

#### 与 Stage 1-1 现代边界的差异

| 边界 | 可复用 | Stage 1-2 必须新增 |
| --- | --- | --- |
| 正式入口/结果壳 | `Stage11EntryScene` 的 1P/2P 选择、结果导航形态 | 解锁后可选 1-2，并把当前 stage/level 写为 1/2 |
| 失败 | `Stage11FlowSystem` 的统一全员失败、2.5 秒等待、重玩全新场景 | 配置为 1-2，失败不改变 `LevelUnlockProgress` |
| 胜利/存档 | 一次性胜利状态、V3 幂等保存 | 普通门胜利解锁 1-3；特殊入口不得触发胜利或解锁 |
| 场景资源 | 根地面 → 场景 → `bgContainer` 背景层级 | character 25/135/22/52 与 3+1 墙、5 停点、13 刷怪点数据 |
| 关卡推进 | `LevelSystem` 的停点/门概念 | 横向五停点、46 怪、7/8 普通批与 4+2 双 boss 门禁 |
| 特殊入口 | 无 | 五次带 1 秒防抖的弹体命中、30 帧动画、72 帧驻留、切至 5-1 |

`TASK-SLICE-125` 已完成布局基础接入：character 25/135/22/52/48/51 转换为 72 张 PNG，`Stage12Layout.ts` 保存全部 3+1 墙、5 停点、13 刷怪点与两入口数据，独立场景桥接保留根地面 → `sl12` → `bgContainer` 组合边界；已解锁 1-2 可从现有入口选择 1P/2P 进入。波次、门禁、普通结果和特殊入口行为仍按后续切片实现。

### Stage 1-3 权威实现输入

`TASK-SETTINGS-052` 从恢复源包与共享运行时闭合了 Stage 1-3；以下事实不得从 1-2 外推替换。

#### 待证明问题与资源组合

| 问题 | 结论 |
| --- | --- |
| 关卡身份 | `AssetsLoader.getAssetsMap("1","3") -> levels/level13`；`MainGame.newGame()` 实例化 `export.gameSence.sl13`，`PhysicsWorld.pWorldInit()` 实例化 `StageListener13` |
| 真场景 | `assets/levels/level13.swf` character 41 / `export.gameSence.sl13`，单帧标签 `1-3`；character 13 是前景，边界 `x=-30..5629.35`、`y=494..589` |
| 真背景 | `assets/1.swf` character 119 / `bg13`，包裹 character 118；边界 `x=-70..4833.15`、`y=0..677.85`；`BaseGameSence` 以局部 `x=-20` 加到位于 `(0,0)` 的 `bgContainer` |
| 地面 | 复用 `assets/1.swf` character 1 / `floorBg1`；`MainGame.createFloorBg()` 在 `sl13` 前创建 |
| 普通门 | `level13.swf` character 40，实例原点 `(4150.05,453.15)`；内部 character 36/39 分别为 20/19 帧，并含 character 4 `isTransferDoor` 标记；非 Stage 0 初始隐藏 |
| 专属交互 | `StageListener13` 没有 override，也没有 `fbEnter`、门外脚本或其他专属交互；只注册 `Monster8/7/5/30` 位图数据 |

调查派生元数据位于 Git 忽略的 `local-resources/regima/task-outputs/task-settings-052-stage13/`：`level13.xml`、`stage1.xml`、SymbolClass 和源包自带脚本。源 SWF 与旧提取集均未修改；视觉 PNG 留给后续实现 task 选择性导出。

#### 地图标记全集

Flash twip 已除以 20 转为场景像素；墙体矩阵保持原值。character 10/9 共享 296×66 基形，因此水平地面顶为 `521 - 66 × 0.6060486 / 2 = 501.0003962`。

| 类型 / character | 数量 | 原点或矩阵 |
| --- | ---: | --- |
| `ObsWall` / 10 | 3 | `(2496.35,521)` scale `(16.891891,0.6060486)`；`(4804.65,77)` scale `(0.3896942,15.1515045)`；`(-13.35,199.4)` matrix `[a=0,b=2.364746,c=-0.35295105,d=0]` |
| `FallDownWhenStandingWall` / 9 | 1 | `(2496.35,-140.6)`，外层 scale `(16.66655,1)`，内部仍为 `(1.0135193,0.3030243)` |
| `StopPoint` / 7 | 5 | `(1088.1,196.05)` idx 0；`(1834.35,189.35)` idx 1；`(2838.6,170.15)` idx 2；`(3566.75,239.15)` idx 3；`(4310.45,258.7)` idx 4 / `isBoss=true` / `betweenRandL=940` |
| `MonsterAppearPoint` / 5 | 14 | 见下表；全部 `isRandom=false` |
| 普通传送门 / 40 | 1 | `(4150.05,453.15)` |

停点仍由 `PhysicsWorld.addSubObj()` 按 x 排序，并由 `ViewControllor` 在屏幕右端触发。前四个停点 `betweenRandL=1150`，boss 停点是本关唯一 `betweenRandL=940`；现代遍历继续保持“未触发停点是世界右边界、停点进入屏幕右端才开战”的可观察合同。

| 实例 | 位置 | stop idx | delay | interval | enemyType | totalNum |
| --- | --- | ---: | ---: | ---: | ---: | ---: |
| `__id73_` | `(172.65,304)` | 0 | 2 | 2 | 8 | 3 |
| `__id74_` | `(565.2,286.45)` | 0 | 2 | 2 | 7 | 3 |
| `__id75_` | `(933.75,318.5)` | 0 | 2 | 2 | 3 | 3 |
| `__id76_` | `(1166.05,334.5)` | 1 | 2 | 1 | 3 | 5 |
| `__id77_` | `(1734.9,334.5)` | 1 | 2 | 1 | 7 | 5 |
| `__id78_` | `(1927.25,334.5)` | 2 | 6 | 1 | 7 | 4 |
| `__id79_` | `(2684.3,334.5)` | 2 | 6 | 1 | 7 | 4 |
| `__id80_` | `(2295.75,334.5)` | 2 | 2 | 1 | 3 | 4 |
| `__id81_` | `(2926.75,334.5)` | 3 | 6 | 1 | 7 | 4 |
| `__id82_` | `(3491.55,334.5)` | 3 | 6 | 1 | 3 | 5 |
| `__id83_` | `(3227.2,334.5)` | 3 | 2 | 1 | 3 | 4 |
| `__id84_` | `(4148.65,340)` | 4 | 2 | 1 | 5 | 1 |
| `__id85_` | `(3842,334.5)` | 4 | 5 | 4 | 30 | 30 |
| `__id86_` | `(4224.15,336)` | 4 | 5 | 4 | 30 | 30 |

五批定义总数为 9、10、12、13、61，总计 105。`MonsterAppearPoint` 的首只生成时刻是 `delay + interval` 秒；单人/双人的全局同屏上限分别为 6/8，达到上限时已 ready 的刷怪点暂停计数，直到出现空位。

#### Boss、完成、失败与存档

- 前四批必须等所属刷怪点全部生成且全场怪物为 0，当前停点才销毁并恢复推进。
- 末批 `Monster5` 在 1-3 使用 2788 HP 且 `isBoss=true`；其死亡 `destroy()` 立即显示全部普通门。两路 `Monster30` 各 30 只、150 HP、飞行，不参与开门门禁。因此玩家可在小怪仍生成/存活时进门，这与“必须清 61 只”不同。
- 普通怪数值输入：Monster8 300 HP、Monster7 200 HP、Monster3 在非 1-1 时 400 HP、Monster30 150 HP。现代首切片保留这些生命值和地面/飞行区分；完整怪物动作与真素材仍不属于本关场景资源任务。
- 玩家与已显示门碰撞并按上后仍走通用 `LevelVictor -> MainGame.levelClear()`。当最大解锁正好是 1-3 时，进度推进为 `curBigStage=2, curBigLevel=1` 并保存；`GameWin.nextClick()` 把当前关卡改为 2-1，返回按钮回关卡地图。
- 失败沿用统一全灭合同：玩家数组为空后销毁战斗并派发 `GameOver`；现代侧继续使用已补正的 1P/2P 全员倒地 2.5 秒门禁，失败不推进 2-1。
- Stage 2-1 内容不属于 `LINE-STAGE-1-3`；结果页可以记录“已解锁 2-1”，但不得伪造可玩的 2-1 场景。

#### 六段证据矩阵

| 行为合同项 | 局部证据 | 共享调用链 | 几何/坐标证据 | 证据等级 | 未知与反证条件 | 验证方式 |
| --- | --- | --- | --- | --- | --- | --- |
| 场景组合 | `level13.swf` char 41/13；`assets/1.swf` char 119/118 | `AssetsLoader -> MainGame.newGame -> BaseGameSence` | `bgContainer (0,0)`、背景局部 `x=-20`、前景/背景精确边界 | 交叉确认 | 若选择性导出边界与 XML 不同则降级复核 | 资源测试 + 浏览器视觉观察 |
| 墙/停点/刷怪点 | 恢复 `sl13.as` 与 character 41 时间轴 | `PhysicsWorld.addSubObj -> ViewControllor -> StopPoint -> MonsterAppearPoint` | 3+1 墙矩阵、5 停点和 14 点均为场景坐标 | 交叉确认 | 若运行时停点排序不按 x 则复核 | 布局快照测试 + 实际遍历五停点 |
| 波次与同屏上限 | `sl13.__setProp_*`、各怪物构造函数 | `MonsterAppearPoint.__step`、`PhysicsWorld.pWorldStart` | 出生坐标为场景坐标；地面脚底 `y=501.0003962` | 确认事实 | SummonMonsterSpeed 非 1 的存档/作弊态不纳入首切片 | 定时状态机测试 + 1P/2P试玩 |
| Boss 显门 | `Monster5.destroy()`、末批三个刷怪点 | `transferDoorArray -> BaseHero` 上键门交互 -> `levelClear` | 门原点 `(4150.05,453.15)`；选择性导出后记录可见/碰撞边界 | 确认事实 | 若原版实测要求清飞怪才进门则降级复核 | boss 单杀测试 + 小怪仍在时实际进门 |
| 失败/解锁 | `MainGame.checkGameOver/levelClear`、`GameWin.nextClick` | 通用结果页、存档和场景销毁链 | 不适用：流程状态 | 确认事实 | 双人原 AS3 死亡回调缺失沿用已记录现代补正 | 失败/胜利/存档测试 + 运行时结果页 |
| 现代 owner | 不适用 | `Stage13Layout/Flow/Traversal` 与独立场景 bridge | 真场景保持原 MovieClip 注册点，角色/怪物视图按脚底映射 | 现代设计选择 | 不宣称占位怪物外观为原版 | TypeScript 测试 + 浏览器视觉/输入验收 |

影响首个实现切片的未知项为零。`TASK-SLICE-129` 已在 manifest/布局测试中机械记录实际 PNG 像素边界、纹理 key、门的 5px 栅格留白和碰撞宽度；实现与上述 SWF XML 一致。

### Stage 2-1 权威实现输入

`TASK-SETTINGS-053` 从恢复源包、局部与共享 AS3、SWF 几何和正式结果流程闭合 Stage 2-1。调查派生物位于 Git 忽略的 `local-resources/regima/task-outputs/task-settings-053-stage21/`；源 SWF 与旧提取集均未修改。

#### 待证明问题与场景组合

| 问题 | 结论 |
| --- | --- |
| 关卡身份 | `AssetsLoader.getAssetsMap("2","1") -> levels/level21`；`MainGame.newGame()` 实例化 `export.gameSence.sl21`，`PhysicsWorld.pWorldInit()` 实例化 `StageListener21` |
| 真场景 | `assets/levels/level21.swf` character 49 / `export.gameSence.sl21`，单帧标签 `2-1`；可见 child 为 character 19 中景条带和 character 21 前景/地面 |
| 真背景 | `assets/2.swf` character 282 / `bg21`，包裹 character 281；边界 `x=-30..4670`、`y=0..590`；`BaseGameSence` 以局部 `x=-20` 加到位于 `(0.25,0)` 的 `bgContainer` |
| 根地面 | `assets/2.swf` character 3 / `floorBg2`，`DefineBitsLossless2` 为 631×549；`MainGame.createFloorBg()` 在 `sl21` 前创建 |
| 普通门 | `level21.swf` character 48，实例原点 `(4387.85,467.6)`；内部 character 44/47 分别为 20/19 帧，并含 `isTransferDoor` 标记；非 Stage 0 初始隐藏 |
| 专属交互 | character 16 / `export.mapObject.IceThron` 共 38 个；`StageListener21` 收集直属冰刺并逐帧驱动，详见下方冰刺合同 |

可见场景边界：

- character 19：`x=113.85..2667.45`、`y=254.65..358.45`，选择性 SVG 为 2553.6×103.8。
- character 21：`x=-30..4670`、`y=513.15..607.15`，选择性 SVG 为 4700×94。
- character 48 门的无滤镜局部边界为 `x=-83.75..83.25`、`y=-109.15..54.3`，因此世界可见边界约为 `x=4304.1..4471.1`、`y=358.45..521.9`；FFDec 含滤镜导出为 196×175，现代纹理原点不能直接按导出左上角替换 MovieClip 注册点。
- 主水平 `ObsWall` 使用 character 10 内 character 8 的 `296×66` 基形，原点 `(2497,529.05)`、`scale=(16.891891,0.3030243)`；可站立顶面为 `529.05 - 33 × 0.3030243 = 519.0501981`。

#### 地图标记与冰刺全集

Flash twip 已除以 20 转为 `sl21` 场景像素；旋转墙保留原始矩阵。

| 类型 / character | 数量 | 原点或矩阵 |
| --- | ---: | --- |
| `ObsWall` / 10 | 3 | `(2497,529.05)` scale `(16.891891,0.3030243)`；`(4647.15,101)` scale `(0.3896942,15.1515045)`；`(-12.7,211.4)` matrix `[a=0,b=2.364746,c=-0.35295105,d=0]` |
| `FallDownWhenStandingWall` / 9 | 1 | `(2490.9,-129)`，外层 scale `(16.66655,1)` |
| `ThroughWall` / 11 | 4 | `(217.85,266.65)`、`(713.3,317.45)`、`(2079.1,277.55)`、`(2563.45,281.55)`；均 `scaleX=0.6933594`，由 296×66 基形得到约 205.23×66 的单向/可穿平台 |
| `StopPoint` / 7 | 5 | `(1031.4,189.65)` idx 0；`(1849.7,182.95)` idx 1；`(2717.75,163.75)` idx 2；`(3573.85,232.75)` idx 3；`(4549.5,252.3)` idx 4；全部 `betweenRandL=1150`、`isBoss=false` |
| `MonsterAppearPoint` / 5 | 25 | 见下表；全部 `interval=1`、`isRandom=false`，实例 scaleX 为 `1.1534119` |
| `IceThron` / 16 | 38 | 19 个顶部触发刺 + 19 个 `scale=(-1,-1)` 地面静态刺，坐标见下方 |
| 普通传送门 / 48 | 1 | `(4387.85,467.6)` |

顶部 19 个冰刺都满足 `y < 100`，在任一玩家与其水平距离 `<= 200` 且当前为帧 1 时播放 66 帧时间轴：

| 组 | 坐标 |
| --- | --- |
| A | `(364.95,16.55)`、`(413.8,16.55)`、`(460.25,16.55)`、`(507.7,16.55)` |
| B | `(1336.25,14.7)`、`(1382.7,14.7)`、`(1430.15,14.7)` |
| C | `(2862.4,22.55)`、`(2902.1,22.55)`、`(2942.8,22.55)` |
| D | `(3093.9,22.55)`、`(3133.6,22.55)`、`(3174.3,22.55)` |
| E | `(3341.35,22.55)`、`(3381.05,22.55)`、`(3421.75,22.55)` |
| F | `(3602.75,22.55)`、`(3642.45,22.55)`、`(3683.15,22.55)` |

地面 19 个冰刺均为 `scale=(-1,-1)`；它们的 `y >= 100`，不会走顶部近距播放分支，停在帧 1 作为静态危险物：

| 组 | 坐标 |
| --- | --- |
| A | `(1155.7,509.65)`、`(1195.2,510.15)`、`(1234.7,510.65)` |
| B | `(1508.75,512.5)`、`(1548.25,513)`、`(1587.75,513.5)` |
| C | `(1923.1,513)`、`(1962.6,513.5)`、`(2002.1,514)` |
| D | `(2308.55,512)`、`(2348.05,512.5)`、`(2387.55,513)`、`(2427.05,513.5)` |
| E | `(2640.65,512)`、`(2680.15,512.5)`、`(2719.65,513)` |
| F | `(3222.35,510.15)`、`(3261.85,510.65)`、`(3301.35,511.15)` |

`IceThron` 行为合同：

1. 帧 1 有 `stop()`；顶部刺被触发后，帧 2..32 向下运动，帧 33..66 透明，播放回帧 1 后再次停止。SWF 和 `Config.frameClips` 均为 30 fps。
2. 每个冰刺每 `gc.frameClips * 2 = 60` 帧递增自己的攻击 id。每名玩家的 `beAttackIdArray` 使同一冰刺/攻击 id 对该玩家最多结算一次。
3. 当前冰刺可见像素与玩家 `colipse` 的复杂命中成立时，扣除 `15 + (Math.random() - 0.5) * 10`，即 `[10,20)` HP，并按玩家朝向施加水平 `+10` 或 `-10` 击退和受击反馈。
4. 38 个实例都由 `StageListener21.step()` 驱动；场景销毁时监听器清空引用。现代实现必须以独立环境危险 owner 结算，不能把它伪装成怪物接触伤害。

#### 五批怪物与 Boss 门禁

停点仍由 `PhysicsWorld.addSubObj()` 按 x 排序；`pWorldStart()` 重写连续 idx。`ViewControllor` 在停点进入屏幕 `x=900..980` 时触发并锁住推进，刷怪点遵循 1P/2P 同屏上限 6/8。首只生成时刻为 `delay + interval` 秒；达到上限时 ready 状态保留，直到出现空位。

| 实例 | 位置 | stop idx | delay | enemyType | totalNum |
| --- | --- | ---: | ---: | ---: | ---: |
| `__id100_` | `(230.3,414.05)` | 0 | 6 | 9 | 3 |
| `__id101_` | `(788.45,414.05)` | 0 | 6 | 9 | 3 |
| `__id102_` | `(509.8,414.05)` | 0 | 2 | 9 | 2 |
| `__id103_` | `(174.9,176.45)` | 0 | 6 | 9 | 1 |
| `__id104_` | `(733.05,214.05)` | 0 | 6 | 9 | 1 |
| `__id105_` | `(1117.85,280.55)` | 1 | 6 | 9 | 3 |
| `__id106_` | `(1634.3,280.55)` | 1 | 6 | 9 | 3 |
| `__id107_` | `(1062.45,422.15)` | 1 | 2 | 10 | 2 |
| `__id108_` | `(1390.5,422.15)` | 1 | 2 | 10 | 2 |
| `__id109_` | `(1710.6,422.15)` | 1 | 2 | 10 | 2 |
| `__id110_` | `(1858.7,414.05)` | 2 | 2 | 10 | 2 |
| `__id111_` | `(2786.85,414.05)` | 2 | 2 | 10 | 2 |
| `__id112_` | `(2154.75,414.05)` | 2 | 2 | 9 | 2 |
| `__id113_` | `(2522.8,414.05)` | 2 | 2 | 9 | 2 |
| `__id114_` | `(2082.7,156.15)` | 2 | 6 | 10 | 1 |
| `__id115_` | `(2522.8,188.15)` | 2 | 6 | 10 | 1 |
| `__id116_` | `(2006.7,187.2)` | 2 | 6 | 19 | 2 |
| `__id117_` | `(2635.45,211.2)` | 2 | 6 | 19 | 2 |
| `__id118_` | `(2962.35,270.05)` | 3 | 6 | 19 | 4 |
| `__id119_` | `(3491.4,286.05)` | 3 | 6 | 19 | 4 |
| `__id120_` | `(2899,398.1)` | 3 | 2 | 10 | 2 |
| `__id121_` | `(3615.1,450.1)` | 3 | 2 | 10 | 2 |
| `__id122_` | `(3127.75,398.1)` | 3 | 2 | 9 | 2 |
| `__id123_` | `(3383.05,402.1)` | 3 | 2 | 9 | 2 |
| `__id124_` | `(4470,354.05)` | 4 | 3 | 6 | 1 |

五批定义数量依次为 10、12、14、16、1，总计 53 只。末批 `Monster6` 是本关唯一 boss；其构造函数在非 Stage 3-3/8 时设置 4957 HP、19 物防、0.25 魔防、70 经验、35 魂值、`isBoss=true`。死亡时直接显示全部普通门，因此没有“再清空其他怪物才开门”的额外条件。

首个可玩切片需要保留的怪物合同：

| 类型 | Stage 2-1 数值/行为 |
| --- | --- |
| Monster9 | 1613 HP、3 水平速度、27 物防、0.2 魔防、6 经验、3 魂值；3 秒技能 CD，目标距离 `<200` 才开始 `hit1`，帧点 `(3,6)` 从水平 `±85`、垂直 `-82` 发射物理 90 的 `Monster9Bullet1` |
| Monster10 | 1500 HP、3 水平速度、27 物防、0.2 魔防、6 经验、2 魂值；3 秒技能 CD，目标距离 `<200` 才开始 `hit1`，帧点 `(3,6)` 从水平 `±65`、垂直 `-71` 发射物理 90 的 `Monster10Bullet1` |
| Monster19 | 1531 HP、3 水平速度、27 物防；源码写入小写 `mdef=0.2`，基类默认 `mDef=0.2`，因此可观察值仍为 0.2；28 经验、14 魂值；3 秒 CD，帧点 `(3,1)` 从水平 `±105`、垂直 `-30` 发射魔法 36 的 `Monster19Bullet1` |
| Monster6 | 4957 HP、5 水平速度、19 物防、0.25 魔防、70 经验、35 魂值；普通物理 157；技能 `hit2` 含魔法 112 近身段与三个 `x=0/±200,y=-500`、魔法 22/4 帧间隔落击；`hit3` 为魔法 37/12 帧间隔；技能距离门槛 `<600` / `<400`，两个技能 CD 均为 2..8 秒 |

上述数值闭合 Stage 2-1 首个占位怪物实现输入；Monster6/9/10/19 的真动作图集、弹体真视觉和逐帧像素对照不属于 `TASK-SETTINGS-053`。现代首切片必须显式标注这些视觉仍为占位，不能宣称怪物外观已复现。

#### 正式进入、失败、胜利与存档

- 1-3 首次胜利把最高进度推进到 `2/1`；`SelectPLace` 此时允许点击 `s2_1`，写入 `curStage=2`、`curLevel=1`，随后仍走 `GMain -> MainGame.GameStart -> AssetsLoader -> newGame` 正式链路。
- Stage 2-1 出生沿用 `Config.createHero()` 的通用 `(100,350)` MovieClip 注册点；现代角色视图仍需按脚底映射到平台/地面，不能把 350 当作脚底。
- 玩家与已显示 character 48 门的包围盒相交并按上后，走通用 `LevelVictor -> MainGame.levelClear()`。当最高进度正好是 2-1 时，`curBigLevel` 从 1 推进到 2 并保存；`GameWin.nextClick()` 把当前关卡改为 2-2，返回按钮回对应关卡地图。
- 失败沿用统一全灭合同：玩家数组为空后销毁战斗并派发 `GameOver`；现代侧继续使用已闭合的 1P/2P 全员倒地 2.5 秒门禁，失败不推进或保存 2-2。

#### 六段证据矩阵

| 行为合同项 | 局部证据 | 共享调用链 | 几何/坐标证据 | 证据等级 | 未知与反证条件 | 验证方式 |
| --- | --- | --- | --- | --- | --- | --- |
| 场景组合 | `level21.swf` char 49/19/21；`assets/2.swf` char 282/281/3 | `AssetsLoader -> MainGame.newGame -> BaseGameSence` | `bgContainer (0.25,0)`、背景局部 `x=-20`、两层场景与背景精确边界 | 交叉确认 | 若选择性派生与 XML 边界不一致则降级复核 | manifest/布局测试 + 940×590 浏览器视觉观察 |
| 墙/停点/刷怪点 | 恢复 `sl21.as` 与 character 49 时间轴 | `PhysicsWorld.addSubObj -> ViewControllor -> StopPoint -> MonsterAppearPoint` | 3+1 墙、4 平台、5 停点、25 点均为场景坐标；地面顶 `519.0501981` | 交叉确认 | 若运行时停点排序或单向平台语义不同则复核 | 布局快照 + 五停点实际遍历 |
| 波次与同屏上限 | `sl21.__setProp_*`、Monster6/9/10/19 | `MonsterAppearPoint.__step`、`PhysicsWorld.pWorldStart` | 出生坐标为场景坐标；怪物按脚底落到墙/平台 | 确认事实 | `SummonMonsterSpeed != 1` 的存档/作弊态不纳入首切片 | 定时状态机测试 + 1P/2P 试玩 |
| 冰刺 | character 16 时间轴、`StageListener21`、`IceThron.as` | listener 直属 child 扫描 -> 每帧 `IceThron.step()` -> 玩家伤害/击退 | 19 顶部 + 19 翻转地面坐标；MovieClip 注册点与 59×588 导出画布分离 | 交叉确认 | 若浏览器视觉表明滤镜裁切或脚底碰撞偏移则只校准现代原点，不改写原坐标事实 | 触发/循环/每玩家去重测试 + 逐组试玩与叠图 |
| Boss 显门 | `Monster6.destroy()`、末批 `__id124_` | `transferDoorArray -> BaseHero.checkTransferDoor -> levelClear` | 门原点、无滤镜边界与 196×175 导出均已记录 | 交叉确认 | 若原版运行态显示门还受其他条件控制则降级复核 | boss 单杀开门测试 + 实际按上通关 |
| 失败/解锁 | `MainGame.checkGameOver/levelClear`、`GameWin.nextClick` | 通用结果页、当前槽保存与场景销毁链 | 不适用：流程状态 | 确认事实 | 双人原 AS3 死亡回调缺口继续沿用已记录现代补正 | 失败/胜利/存档 round-trip + 运行时结果页 |
| 现代 owner | 不适用 | 复用 Stage 1 scene/flow/traversal/combat owners，新增 Stage 2-1 layout 与 ice hazard owner | 真场景保持 MovieClip 注册点；现代 PNG/SVG 记录独立原点 | 现代设计选择 | 怪物/弹体真视觉仍明确排除首切片 | TypeScript 专项 + 浏览器视觉/输入验收 |

影响 `TASK-SLICE-144` 首个可玩实现切片的未知项为零。真怪物动作与弹体视觉是公开排除项，不得据此关闭 `LINE-STAGE-2-1` 的所有视觉工作；但场景、布局、波次、冰刺、Boss 门、失败/胜利与 2-2 解锁已足够生成不猜测规则的实现 Goal。

#### TASK-SLICE-145 运行校准结果

- 940×590 正式地图 1P/2P 入口、双人独立移动、首停点锁屏/刷怪、顶部冰刺伤害、全员失败、重载和返回均通过浏览器复验。
- 开发环境显式 QA 参数保持真实停点、刷怪调度、镜头、冰刺动画、Boss 门与结果逻辑，仅跳过伤害和耗时清怪；五停点、地面/顶部冰刺、门前按上、胜利页和 2-2 当前槽保存均得到运行证据。
- 没有观察到需要反改 MovieClip 注册点、世界坐标、地面顶、背景滚动或门命中范围的偏差；console 无 warning/error。
- Monster6/9/10/19 与弹体仍是现代占位。由于未取得用户把占位列为本线排除的批准，`LINE-STAGE-2-1` 保持 Active，并由 `TASK-SETTINGS-062` 补真视觉证据。

### Stage 2-2 权威实现输入

`TASK-SETTINGS-063` 从恢复源包、局部/共享 AS3、P-code、SWF 时间轴与选择性几何派生闭合 Stage 2-2。派生产物位于 Git 忽略的 `local-resources/regima/task-outputs/task-settings-063-stage22/`；恢复源和 `legacy-extraction/` 原始结果均未修改。

#### 身份、显示列表与真视觉裁决

| 问题 | 结论 |
| --- | --- |
| 关卡身份 | `AssetsLoader.getAssetsMap("2","2") -> levels/level22`；`MainGame.newGame()` 实例化 `export.gameSence.sl22`，`PhysicsWorld.pWorldInit()` 实例化 `StageListener22`。`StageListener221/222/223` 属于 Stage 22-x，不是本关 |
| 真场景 | `assets/levels/level22.swf` character 64 / `export.gameSence.sl22`，单帧标签 `2-2`；根时间轴共 50 个放置对象 |
| 真背景 | `assets/2.swf` character 279 / `bg22`，包裹 character 278，选择性 SVG 为 4700×590；character 32 `bgContainer` 在 `(-25,0)`，`BaseGameSence` 再把背景局部置于 `x=-20` |
| 根地面 | `assets/2.swf` character 3 / `floorBg2`，原位图 631×549；`MainGame.createFloorBg()` 在 `sl22` 前创建 |
| 场景可见层 | character 34 前景/地面条带为 4701×94，原场景边界约 `x=-7.15..4693.85`、`y=496..590`；character 36 中景条带为 1745.1×52.45，原边界 `x=230.7..1975.8`、`y=286.85..339.3` |
| 普通门 | character 63，实例原点 `(4316.75,450.75)`；内部含 character 59/62 和 `isTransferDoor`。局部可见边界 `x=-90.75..95.05`、`y=-110.7..54.3`，世界可见边界约 `x=4226..4411.8`、`y=340.05..505.05`；非 Stage 0 初始隐藏 |
| 专属机关 | character 31 / `FireThron` 共 9 个；本地时间轴 130 帧。`StageListener22` 扫描直属 child 的 `isFireThron` 标记并逐帧驱动 |
| Boss 真视觉 | `assets/2.swf` character 6 / `Monster16` 为 1800×2400 RGBA atlas，300×300 cell、8 个动作行、36 个可达关键帧；六个攻击对象 character `235/229/225/191/160/143` 共 104 帧 |

场景根的 FFDec 全边界为 5033.25×1014.95，导出根平移 `(25,424.95)`，即包含调试墙与场景外对象的边界约为 `x=-25..5008.25`、`y=-424.95..590`。实现可视裁切仍是主舞台 940×590，不能用根导出画布替换世界宽度。

Stage 2-2 的首个实现应直接使用真场景、真火焰、既有 Stage 2-1 真 Monster9/10/19 与本批 Monster16/六攻击对象。源符号、逐帧时间轴和注册点均已定位，不批准新增现代可见占位层。

#### 墙、平台、停点与火焰

Flash twip 已除以 20 转为 `sl22` 场景像素；旋转墙保留原矩阵。

| 类型 / character | 数量 | 原点或矩阵 |
| --- | ---: | --- |
| `ObsWall` / 11 | 3 | 主水平 `(2508.3,511.05)` scale `(16.891891,0.3030243)`；右竖墙 `(4692.55,75)` scale `(0.3896942,15.1515045)`；左竖墙 `(6.6,197.4)` matrix `[a=0,b=2.364746,c=-0.35295105,d=0]` |
| `FallDownWhenStandingWall` / 9 | 1 | `(2508.3,-142.6)`，scaleX `16.66655` |
| `ThroughWall` / 10 | 3 | `(347.7,304.9)`、`(1404.35,304.85)`、`(1856.8,303.3)`；均 `scaleX=0.80682373` |
| `StopPoint` / 7 | 5 | `(1267.3,189.65)` idx 0；`(2147.55,182.95)` idx 1；`(3017.8,163.75)` idx 2；`(3769.95,189.65)` idx 3；`(4581.7,252.3)` idx 4 / `isBoss=true`；全部 `betweenRandL=1150` |
| `MonsterAppearPoint` / 5 | 25 | 见下表；全部 `interval=1`、`isRandom=false`、scaleX `1.1534119` |
| `FireThron` / 31 | 9 | `(450.75,491.05)`、`(1310.6,491.8)`、`(1655.55,491.35)`、`(2241.65,489.55)`、`(2468.3,491.35)`、`(2693.85,493.55)`、`(2900.85,495.05)`、`(3127.55,490.9)`、`(3367.85,492.7)`；scaleX `0.74472046` |
| 普通传送门 / 63 | 1 | `(4316.75,450.75)` |

主水平墙使用 296×66 基形，可站立顶面为 `511.05 - 33 × 0.3030243 = 501.0501981`。三段 `ThroughWall` 是单向/可穿平台；`FallDownWhenStandingWall` 继续走共享站立后下落语义。

`FireThron` 行为合同：

1. 帧 1 `stop()`；任一玩家与实例水平距离 `<=200` 时从帧 2 开始播放，130 帧时间轴回到帧 1 后再次停止。
2. character 31 首帧选择性 SVG 为 143×314.35，本地可见边界 `x=-71.5..71.5`、`y=-285.7..28.65`；应用实例 scaleX 后可见宽约 106.5。碰撞使用当前动画可见像素与玩家 `colipse` 的复杂命中，不得简化成整根矩形。
3. 每 60 tick 换攻击 id；每名玩家通过自己的 `beAttackIdArray` 对同一火焰/攻击 id 最多结算一次。
4. 命中造成 `45 + (Math.random() - 0.5) × 10`，即 `[40,50)` HP，并按玩家朝向施加水平 `+10/-10` 击退和受击反馈；`isYourFather` 状态免疫。
5. 9 个实例由 `StageListener22.step()` 驱动，销毁时清空引用。现代侧必须作为独立环境危险 owner，不得伪装成怪物接触伤害。

#### 五批怪物

停点由 `PhysicsWorld.addSubObj()` 按 x 排序并在 `pWorldStart()` 重写连续 idx。`ViewControllor` 在停点进入屏幕右端 `x=900..980` 时触发并锁住推进。`MonsterAppearPoint` 首只生成时刻为 `delay + interval` 秒；1P/2P 同屏上限分别为 6/8，达到上限时 ready 状态保留。

| 实例 | 位置 | stop idx | delay | enemyType | totalNum |
| --- | --- | ---: | ---: | ---: | ---: |
| `__id137` | `(257.25,222.25)` | 0 | 6 | 9 | 2 |
| `__id138` | `(1001.55,387.6)` | 0 | 2 | 19 | 2 |
| `__id139` | `(829.8,387.6)` | 0 | 2 | 10 | 1 |
| `__id140` | `(335.7,222.25)` | 0 | 6 | 10 | 2 |
| `__id141` | `(1094.7,217.05)` | 0 | 6 | 9 | 2 |
| `__id142` | `(1173.15,217.05)` | 0 | 6 | 10 | 2 |
| `__id143` | `(1650,387.6)` | 1 | 2 | 19 | 3 |
| `__id144` | `(1854.05,231.05)` | 1 | 2 | 19 | 2 |
| `__id145` | `(1429.95,217.05)` | 1 | 2 | 10 | 2 |
| `__id146` | `(1351.9,199.05)` | 1 | 6 | 9 | 3 |
| `__id147` | `(1938.05,199.05)` | 1 | 6 | 10 | 3 |
| `__id148` | `(2338.4,357.1)` | 2 | 2 | 19 | 3 |
| `__id149` | `(2928.95,346.9)` | 2 | 2 | 19 | 3 |
| `__id150` | `(2474.2,357.1)` | 2 | 2 | 19 | 1 |
| `__id151` | `(2626.25,357.1)` | 2 | 2 | 19 | 1 |
| `__id152` | `(2756.3,357.1)` | 2 | 2 | 19 | 1 |
| `__id153` | `(2269.75,217.05)` | 2 | 6 | 10 | 2 |
| `__id154` | `(2954.45,217.05)` | 2 | 6 | 10 | 2 |
| `__id155` | `(3168.4,387.6)` | 3 | 2 | 10 | 4 |
| `__id156` | `(3682.5,387.6)` | 3 | 2 | 10 | 4 |
| `__id157` | `(3100.25,294.25)` | 3 | 6 | 9 | 2 |
| `__id158` | `(3182.4,285.1)` | 3 | 6 | 19 | 2 |
| `__id159` | `(3624.45,299.3)` | 3 | 6 | 9 | 2 |
| `__id160` | `(3706.6,290.15)` | 3 | 6 | 19 | 2 |
| `__id161` | `(4416.7,357.1)` | 4 | 3 | 16 | 1 |

五批定义数量依次为 11、13、13、16、1，总计 54。`StageListener22.waitForRegisterDataArray` 精确为 `Monster16/9/10/19`；前三类普通怪复用已闭合、已接入的 Stage 2-1 真视觉与行为合同。

#### Monster16 Boss 与六攻击对象

末批 `Monster16` 是本关唯一 Boss：24189 HP、5 水平速度、视距 300、攻击范围 150、警戒 1000、34 物防、0.2 魔防、100 经验、50 魂值、0.55 掉落概率，掉落池 `qysz/hylk/chilj`。非 Stage 3-3/8 时 `isBoss=true`；死亡直接显示所有传送门。

本体 atlas cell 为 300×300，`bbdc` offset `(0,-20)`，碰撞盒为共享 `ObjectBaseSprite2`。动作行与 30 fps hold：

| 动作 | 关键帧 hold | 总 tick | 左向联合可见边界（相对怪物根） |
| --- | --- | ---: | --- |
| wait | `2,2,2,3,2,4` | 15 | `-51,-144..84,70` |
| walk | `4,4,4,4` | 16 | `-107,-69..120,88` |
| hurt | `15` | 15 | `-22,-122..133,74` |
| dead | `2,2,2,2,7` | 15 | `-113,-170..135,99` |
| hit1 | `2,2,2,2,2,10` | 20 | `-150,-70..119,70` |
| hit2 | `2,2,2,30` | 36 | `-137,-124..102,76` |
| hit3 | `2,2,2,2,2,20` | 30 | `-66,-140..73,72` |
| hit4 | `2,2,2,25` | 31 | `-150,-68..140,71` |

精确 36 行见 `monster16-frame-geometry.csv`；alpha 阈值 8 只用于几何审阅，不改变真 RGBA。右向沿用 `BaseBitmapDataPool/BaseBitmapDataClip` 围绕根的水平镜像合同。

| 来源动作 | 技能/创建时机 | 左/右生成点（相对 Boss 根） | 对象与真时间轴 | 伤害合同 |
| --- | --- | --- | --- | --- |
| hit1 | 普通攻击；keyframe 2 的 hold=2 | `(-240,-40)/(240,-40)` | `Monster16Bullet1` / char 235 / 20 帧 | physics 185，interval 999，击退 `[6,-5]` |
| hit2 | CD 2..6 秒、距离 `<200`、霸体 15；keyframe 4 hold=30/27 | `(-210,-105)/(210,-105)` 与 `(-260,-40)/(260,-40)` | Bullet2_1 char 229 / 4 帧；Bullet2_2 char 225 / 29 帧 | magic 68，interval 999，击退 `[10,0]` |
| hit3 | CD 4..13 秒、距离 `<800`、霸体 42；keyframe 6 hold=20 | `(-140,-210)/(140,-210)` | 跟随 Boss 的 Bullet3 char 191 / 15 帧；不在末帧销毁，固定 7 秒寿命 | magic 47.6，interval 24，击退 `[10,2]` |
| hit4 | CD 3..6 秒、距离 `<800`、霸体 30；keyframe 1 hold=2、keyframe 4 hold=25 | `(-200,-150)/(200,-150)` 与 `(-200,-140)/(200,-140)` | Bullet4_1 char 160 / 16 帧；Bullet4_2 char 143 / 20 帧 | magic 57.6，interval 24，击退 `[10,2]` |

六对象全时间轴注册点联合可见边界分别为：Bullet1 `11.55,-59.2..268.05,113.5`；Bullet2_1 `0,0..247,182`；Bullet2_2 `-120.5,-123.15..120.5,148.3`；Bullet3 `0,0..304,304`；Bullet4_1 `0,0..100,100`；Bullet4_2 `-427.25,0..200,200`。精确 104 行见 `monster16-bullet-frame-geometry.csv`；裁切图左上角不得替代 MovieClip 注册点。

#### 正式进入、失败、胜利与存档

- 2-1 胜利把最高进度推进到 `2/2`；正式地图选择 2-2 后仍走 `GMain -> MainGame.GameStart -> AssetsLoader -> newGame`。
- 出生沿用通用 `(100,350)` MovieClip 注册点；现代角色仍按碰撞盒脚底映射到世界地面。
- Boss 死亡后 character 63 显示；玩家与门命中并按上，走 `LevelVictor -> MainGame.levelClear()`。最高进度正好为 2-2 时，`curBigLevel` 从 2 推进到 3 并保存当前槽；`GameWin.nextClick()` 把当前关卡改为 2-3。
- 失败沿用统一全灭合同：1P/2P 玩家数组清空后进入失败结果，不推进或保存 2-3。现代侧保留已闭合的全员倒地 2.5 秒门禁。

#### 六段证据矩阵

| 行为合同项 | 局部证据 | 共享调用链 | 几何/坐标证据 | 证据等级 | 未知与反证条件 | 验证方式 |
| --- | --- | --- | --- | --- | --- | --- |
| 场景组合 | level22 char 64/34/36/32/63；assets/2 char 279/278/3 | `AssetsLoader -> MainGame.newGame -> BaseGameSence` | 背景、两可见层、门与根场景精确边界 | 交叉确认 | 若现代选择性派生与 XML 边界不一致则只复核派生原点 | manifest/布局测试 + 940×590 叠图 |
| 墙/停点/刷怪点 | `sl22.__setProp_*` 与根时间轴 | `PhysicsWorld.addSubObj -> ViewControllor -> StopPoint -> MonsterAppearPoint` | 3+1 墙、3 平台、5 停点、25 点；地面顶 501.0501981 | 交叉确认 | 若停点排序或单向平台运行语义不同则复核共享 owner | 布局快照 + 五停点 1P/2P 遍历 |
| 波次与同屏上限 | 25 个实例属性、StageListener22 注册表 | `MonsterAppearPoint.__step`、`PhysicsWorld.pWorldStart` | 五批 11/13/13/16/1，共 54；出生为场景坐标 | 确认事实 | `SummonMonsterSpeed != 1` 的作弊/存档态不纳入首切片 | 定时状态机测试 + 1P/2P 试玩 |
| 火焰机关 | char 31 130 帧、`StageListener22`、`FireThron.as` | listener 直属 child 扫描 -> `FireThron.step()` -> 玩家伤害/击退 | 9 坐标、实例缩放、首帧可见边界 | 交叉确认 | 浏览器若出现滤镜裁切只校准现代原点，不改写世界坐标 | 触发/循环/去重/伤害测试 + 逐个穿越 |
| Boss 真视觉/显门 | Monster16 AS3、char 6 atlas、六攻击时间轴 | BBDC -> 六攻击对象 -> `Monster16.destroy -> transferDoorArray` | 36 本体帧、104 攻击帧、生成点与注册边界 | 交叉确认 | 运行若出现脚底漂移先检查 atlas 根/碰撞中心，不改写 spawn | tick 测试 + 左右逐动作/开门复验 |
| 失败/解锁/保存 | `BaseHero.checkTransferDoor`、`MainGame.levelClear`、`GameWin.nextClick` | 通用结果页、当前槽保存与场景销毁 | 门世界边界；其余为流程状态 | 确认事实 | 双人原 AS3 死亡回调缺口沿用已记录现代补正 | 失败/胜利/2-3 round-trip + 运行结果页 |
| 现代 owner | 不适用 | 复用 Stage 2-1 flow/traversal/combat/native-visual owners；新增 Stage 2-2 layout、fire hazard 与 Monster16 行为/视觉适配 | 世界坐标与 MovieClip 注册点保持分离 | 现代设计选择（受原合同约束） | 不得以重构共享战斗为实现前置条件 | 专项、全系统、build + 940×590 视觉/输入验收 |

影响 `VS-056` 首个可玩实现切片的原版未知项为零。剩余风险是现代接入与运行校准：130 帧火焰生命周期、Monster16 36 个本体关键帧、104 个攻击帧、跟随型 Bullet3 的 7 秒寿命、54 怪资源复用与 2-3 存档 round-trip；这些风险已转入同线实现 Goal，不阻塞生成任务。

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



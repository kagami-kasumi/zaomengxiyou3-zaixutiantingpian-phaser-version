# 关卡流程索引

本文是 `TASK-SETTINGS-003` 的产物，记录第一个主线关卡、场景加载、地图标记、刷怪和通关入口。范围只覆盖能支撑最小战斗/关卡闭环的首批事实，不完整扒所有地图。

## 结论

- 默认新档第一主线关是 `curStage = 1`、`curLevel = 1`，对应 `export.level.StageListener11`、`export.gameSence.sl11`、背景资源 `bg11`。
- `StageListener01` 对应 `curStage = 0`、`curLevel = 1` 的任务/PK 门场景和 `klsmode` 特殊刷怪，不是默认第一主线战斗关。
- `1-1` 是纵向爬升关：过程中按玩家位置周期性刷 `Monster30`；到达 `y <= -1900` 后镜头锁定并进入 boss 区；`callBoss()` 生成 `Monster3`；`Monster3` 在 `1-1` 中作为 boss 死亡后显示传送门。
- 现代最小关卡切片建议以 `1-1 / StageListener11` 为第一个关卡依据，但实现时先取“`1-1` boss 区域 + `Monster3` + 可见传送门/通关”的窄切片；完整纵向爬升和随机飞行怪可后续扩展。

## AS3 证据

主要文件：

- `extracted_flash/scripts/172845/scripts/config/Config.as`
- `extracted_flash/scripts/172845/scripts/my/MainGame.as`
- `extracted_flash/scripts/172845/scripts/base/BaseGameSence.as`
- `extracted_flash/scripts/172845/scripts/World/PhysicsWorld.as`
- `extracted_flash/scripts/172845/scripts/base/BaseLevelListenering.as`
- `extracted_flash/scripts/172845/scripts/export/level/StageListener01.as`
- `extracted_flash/scripts/172845/scripts/export/level/StageListener11.as`
- `extracted_flash/scripts/172845/scripts/export/monster/Monster3.as`
- `extracted_flash/scripts/172845/scripts/base/MonsterAppearPoint.as`
- `extracted_flash/scripts/172845/scripts/export/StopPoint.as`
- `extracted_flash/scripts/172845/scripts/base/BaseHero.as`
- `extracted_flash/scripts/172845/scripts/export/hero/Role1.as` 至 `Role5.as`

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

- 本任务未系统细扒死亡/失败 UI。当前只确认了通关入口；失败逻辑需要在战斗/生命系统任务中继续追踪。

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

- `extracted_flash/scripts/172845/scripts/export/monster/Monster3.as`
- `extracted_flash/scripts/172845/scripts/export/level/StageListener11.as`
- `extracted_flash/scripts/172845/scripts/World/PhysicsWorld.as`

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

### 资源缺口

传送门和墙体坐标嵌在 SWF 时间轴/场景对象中，当前 `extracted_flash/resources` 没有 `sl11`/`bg11`/`floorBg1` 的导出：

- `sl11` 场景 SWF：包含背景 `bgContainer`、墙体标记（`isWall`/`isThroughWall` 等）、传送门标记（`isTransferDoor`）和碰撞标记
- `bg11` 背景资源：关卡背景图
- `floorBg1` 地板背景：`MainGame.createFloorBg()` 加载，类为 `export.FloorBg`
- `Monster3` 位图资源：不在当前导出中
- `Monster3Bullet1`/`Monster3Bullet2`：不在当前导出中

**VS-007 最小实现策略**：

- 不等待真实 SWF 场景数据，用手工参数定义 boss 区：地面 y、平台位置、传送门位置
- 传送门使用占位矩形 + 碰撞检测，手工设定坐标（例如 boss 区上方中央）
- Boss 用占位图形（复用 Monster30 的占位策略），行为按本文 Monster3 数据复现
- 背景和地板用纯色矩形占位
- 不实现完整纵向爬升、云层、周期刷怪；只做 boss 区窄切片

### 建议最小实现范围

1. 玩家从固定出生点开始（例如 `y = -1800`，boss 触发线下方）
2. 简单平台/地面（手工坐标）
3. 到达 `y <= -1900` → 镜头锁定 → boss 生成
4. Boss 追踪玩家，hit1/hit2 攻击
5. Boss HP 归零 → 传送门可见
6. 玩家站上传送门按上 → 通关（显示 "Level Clear" 或等价提示）

## 后续建议

- 下一任务可执行 `VS-007` 第一个关卡闭环切片实现（boss 区 + Monster3 + 传送门通关）。
- 实现时使用占位图形和手工坐标，不等待真实资源导出。
- Monster3 行为已充分记录，可直接按本文数据创建 `Monster3System.ts`。
- 传送门和平台坐标需要实现任务中手工设定，本文标记为资源缺口而非数据缺口。

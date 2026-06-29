# TASK-001：AS3 入口和运行时索引

本文只记录源码索引和迁移建议，不包含现代游戏代码实现。

重要原则：本项目只复刻原版的外观、玩法、数值、手感和流程，不复刻原版代码结构。AS3 源码用于回答“原版表现是什么”，不是用于规定“现代代码必须怎么写”。凡是全局状态膨胀、资源重复创建、Flash 时间轴强耦合、手写字符串状态机、多人/活动遗留逻辑、内存释放不可靠等技术债，都应转译为现代、清晰、可维护的实现。

## 阅读范围

主参考源码：

- `extracted_flash/resources_by_swf/[172845].swf/scripts/GMain.as`
- `extracted_flash/resources_by_swf/[172845].swf/scripts/config/Config.as`
- `extracted_flash/resources_by_swf/[172845].swf/scripts/base/BaseObject.as`

为理解入口链路，额外只读：

- `extracted_flash/resources_by_swf/[172845].swf/scripts/my/MainGame.as`
- `extracted_flash/resources_by_swf/[172845].swf/scripts/World/PhysicsWorld.as`
- `extracted_flash/resources_by_swf/[172845].swf/scripts/base/BaseGameSence.as`
- `extracted_flash/resources_by_swf/[172845].swf/scripts/my/KeyBoardControl.as`
- `extracted_flash/resources_by_swf/[172845].swf/scripts/my/ViewControllor.as`
- `extracted_flash/resources_by_swf/[172845].swf/scripts/base/BaseHero.as` 的方法索引

备用包状态：

- `25034429` 包中同名入口文件存在。
- `GMain.as`、`Config.as`、`BaseObject.as` 与 `172845` 包 hash 不同，说明不是完全相同文件。
- 本任务未发现需要逐段对照的阻塞疑点；后续迁移到具体行为时，应对可疑方法再用备用包逐段比较。

## 总体运行链路

原版入口是 `GMain extends MovieClip`，它相当于现代工程里的应用根节点。

启动和进入战斗的大致链路：

1. `GMain()` 构造。
2. 创建 `Config`、`Aloader`、`AssetsLoader`、`PhysicsWorld`、`mainSence`、`topSence`。
3. 加载 `fonts.swf`，注册字体 `fonts.FZCY`。
4. `ADDED_TO_STAGE` 后注册全局事件监听，并把 `gc.stage = stage`。
5. `LoadOver -> loaderOver() -> doLoadOK()`。
6. `doLoadOK()` 清空并重新登记 `PhysicsWorld` 子对象，然后 `switchSence("GameMenu")`。
7. 菜单、选人、地图选择通过 `gc.eventManger` 派发事件流转。
8. 地图选择完成后 `selectStageOver() -> switchSence("startFighting")`。
9. `startFighting` 调用 `clearStageMap()`，然后 `startGame(gc.curStage, gc.curLevel)`。
10. `startGame()` 创建 `new MainGame(mainSence).GameStart()`。
11. `MainGame.GameStart()` 使用 `AssetsLoader.loadByName(stage, level, newGame)` 加载关卡资源。
12. `MainGame.newGame()` 创建地板背景和 `export.gameSence.sl{curStage}{curLevel}`。
13. `BaseGameSence` 构造时扫描自身子对象，交给 `gc.pWorld.addSubObj()` 建立墙体、停止点、传送门等索引。
14. `MainGame.nextDoAfterLoad()` 把场景加入 `mainSence`，播放 BGM，调用 `gc.pWorld.pWorldInit()`，再注册 `ENTER_FRAME`。
15. 每帧 `MainGame.__enterFrame()` 调用：
    - `gc.pWorld.step()`
    - `MainGame.updateOther()`
    - `MainGame.setFource()`

注意：`PhysicsWorld.pWorldInit()` 只创建并初始化 `StageListener{curStage}{curLevel}`。`PhysicsWorld.pWorldStart()` 才会创建键盘控制、镜头控制、玩家角色和 GameInfo。需要在后续任务里追踪 `StageListener*.init()` 何时调用 `pWorldStart()`。

## 代码质量评审

这批 AS3 适合做行为索引，但不适合直接照搬架构。后续实现时应把“可观察行为”和“历史实现方式”分开看。

原版明显技术债：

- `Config` 是全局大杂烩，混合了运行时、玩家、存档、多人、活动、UI、支付和调试状态。现代版不要做一个同样巨大的单例。
- `GMain.switchSence()` 使用字符串状态驱动大分支。现代版应使用明确的 Scene key、流程控制器和类型化事件。
- `BaseObject` 同时承担显示对象、物理移动、碰撞、动画、伤害、buff、法宝、飘字和多人 id。现代版应拆成实体数据、组件和系统。
- 原版大量依赖 Flash 时间轴子对象名称，例如 `isWall`、`stophere`、`bgContainer`。现代版应把这些转成地图数据或资源 manifest。
- 原版在运行中频繁 new 显示对象、BitmapData、Tween，并靠手动 destroy 清理。现代版应复用资源，必要时使用对象池，并让 Scene 生命周期统一释放。
- `magicBulletArray` 挂在每个实体上，世界循环反复遍历并从数组中删除。现代版应由 ProjectileSystem 或 EntityManager 统一管理。
- 多人、活动、礼包、支付、聊天等逻辑混在核心运行时里。现代版先做单机核心，相关逻辑后置或不迁移。
- 旧代码里有反编译痕迹和疑似 bug，例如部分未定义变量、空方法、拼写错误。遇到这类内容不要复刻错误，只记录疑点并用可验证行为重写。

现代实现底线：

- 行为一致优先于代码一致。
- 数据和逻辑分离：配置、运行时状态、渲染对象、输入、伤害结算各有边界。
- 每个系统有明确生命周期：create/update/destroy，不把清理散落到各处。
- 资源只加载一次，按 key 引用，不在战斗中重复生成大贴图。
- 战斗状态用有限状态机或类型化枚举，不用任意字符串到处传。
- 伤害、碰撞、掉落等核心规则写成可测试函数。
- 对象数量高的类型，如子弹、飘字、掉落，可以在需要时使用对象池。

## GMain.as 索引

职责：

- 应用根节点。
- 资源加载入口。
- 全局事件转场中心。
- 菜单、选人、地图、战斗、胜败界面的容器管理。
- FPS 和内存调试显示。

关键字段：

- `gc:Config`：全局状态中心。
- `_loader:Aloader`：基础加载器。
- `_AssetsLoader:AssetsLoader`：按关卡加载资源。
- `mainSence:Sprite`：主显示层。菜单、地图选择、游戏场景都挂在这里。
- `topSence:Sprite`：顶层显示层。
- `curState:String`：当前转场状态。
- `_GM:GameMenu`：菜单实例缓存。

关键方法：

- `getInstance()`：静态单例访问。
- `added()`：注册 `gc.eventManger` 事件，设置 `gc.stage`，开启 FPS/内存显示。
- `removed()`：移除事件监听。
- `switchSence(state:String)`：核心状态机，处理 `GameMenu`、`SelectRole`、`showStageMap`、`startFighting`、`gameOver` 等状态。
- `showGameMenu()`：显示主菜单。
- `showSelectRolw()`：显示选人界面。
- `showStageMap()` / `showNewStageMap()` / `showThirdStageMap()`：显示不同世界地图选择。
- `selectStageOver()`：地图选择完成后进入战斗。
- `startGame(stage, level)`：进入 `MainGame`。
- `heroDead()`：角色死亡表现，单人模式下延迟检查 GameOver。
- `levelVictor()`：显示胜利界面。

现代映射建议：

- `GMain.as -> Phaser 的 BootScene/PreloadScene/MenuScene/WorldScene 组合`，不要做一个包办所有界面的根类。
- `mainSence/topSence -> Phaser Scene 层级或 Container`。
- `switchSence -> GameFlowController`，用常量或枚举表达场景 key。
- `gc.eventManger -> src/core/EventBus.ts`，事件 payload 要有类型，不用裸字符串传复杂数据。

## Config.as 索引

职责：

- 全局单例状态中心。
- 保存玩家、角色、场景、物理世界、输入、镜头、装备、任务、存档、多人与活动状态。
- 创建和销毁角色。
- 提供玩家数组、宠物数组、对手查询、存档 XML 和多人同步消息。

评审：

- 这是原版最需要拆开的类。它把几乎所有系统都塞进一个全局对象，方便旧 Flash 脚本互相访问，但会让现代代码变得难测、难释放、难并行开发。
- 后续不要实现一个“全量 GameContext 单例”。`GameContext` 只保留当前运行切片必须共享的少量状态，其他能力拆到独立 store 或 system。

关键字段分组：

- 运行时核心：
  - `eventManger:AEventDispatcher`
  - `stage:Stage`
  - `pWorld:PhysicsWorld`
  - `gameSence:BaseGameSence`
  - `keyboardControl:KeyBoardControl`
  - `vControllor:ViewControllor`
  - `gameInfo:GameInfo`
  - `bg1:FloorBg`
- 玩家与角色：
  - `hero1:BaseHero`
  - `hero2:BaseHero`
  - `player1:User`
  - `player2:User`
  - `heroBuffArray:Array`
- 关卡进度：
  - `curStage:uint`
  - `curLevel:uint`
  - `curBigStage:uint`
  - `curBigLevel:uint`
  - `curStageAndCurLevel:Antiwear`
  - `isLevelClear:Boolean`
  - `maxMonsterPerScreen:int`
- 数据系统：
  - `allEquip:AllEquipment`
  - `allTask:GameTask`
  - `memory:MemoryClass`
  - `Objectdata:Antiwear`
  - `protectedPerproty:MyProtectedProperty`
- 多人/网络：
  - `server:Client`
  - `sid:int`
  - `nodeFloor:uint`
  - `roomInfo:String`
  - `otherList:Array`
  - `isPK:Boolean`
- UI/流程标志：
  - `isinthegame`
  - `isingamemenu`
  - `isintheselectmap`
  - `isStopGame`
  - `gameinwhere`

关键方法：

- `getInstance()`：全局单例访问。
- `initData()`：重置存档、玩家、任务、进度、保护属性、活动数据。
- `isSingleGame()` / `isInRoom()` / `isInHost()`：当前模式判断。
- `createHero()`：根据 `player1.roleid` 和 `player2.roleid` 实例化 `Role*`，注入玩家数据，加入 `pWorld.heroArray`，绑定键盘和镜头控制，放进 `gameSence`。
- `destroyHero()`：销毁 hero 和属性对象。
- `getPlayerArray()`：返回未死亡的 `hero1/hero2`。
- `getPlayerArray1()`：返回已选角色的 `User` 数据。
- `getPetArray()` / `getPlayerAndPetArray()`：战斗目标集合。
- `getRandomPlayer()` / `getRivalPlayer()`：怪物 AI 和技能选目标会用到。
- `getSaveInfo()`：把当前角色、位置、等级、装备、宠物、法宝等拼成 XML。
- `sendPosition()` / `sendWalkInfo()` / `sendHurt()` 等：多人同步，最小单机切片暂不迁移。

现代映射建议：

- `Config.as -> src/core/GameContext.ts`，只存当前切片共享状态，不复制全字段。
- `eventManger -> src/core/EventBus.ts`。
- `createHero() -> src/systems/EntityFactory.ts` 或 `WorldScene.createHero()`。
- `getPlayerArray()` 等目标查询 -> `src/systems/TargetingSystem.ts`。
- `getSaveInfo()` 后续映射到 `src/systems/SaveSystem.ts`，早期不要迁移 XML 格式。

推荐拆分：

- `RunState`：暂停、当前关卡、当前模式。
- `PlayerStore`：玩家选择、等级、经验、装备引用。
- `EntityManager`：heroes、monsters、projectiles、drops。
- `TargetingSystem`：玩家、宠物、怪物目标查询。
- `SaveSystem`：存档序列化和反序列化。
- `NetworkSystem`：多人逻辑，早期不实现。

最小切片需要先迁移的 `Config` 子集：

- 当前关卡：`curStage`、`curLevel`。
- 运行对象集合：heroes、monsters、bullets、walls。
- 输入和镜头引用。
- `isStopGame`。
- 一个简单事件总线。

暂不迁移：

- 多人网络同步。
- 活动、礼包、聊天、支付、商城。
- 加密和旧存档 XML。
- `Antiwear` / `MyProtectedProperty` 的完整防改机制。可先用普通字段表达。
- `Config` 的全局单例访问风格。

## MainGame.as 索引

职责：

- 战斗流程控制器。
- 按关卡加载资源。
- 创建地图、背景、怪物。
- 注册和移除 `ENTER_FRAME` 主循环。
- 暂停、继续、胜利、失败、销毁战斗。

关键方法：

- `GameStart()`：按 `gc.curStage/gc.curLevel` 调用 `AssetsLoader.loadByName()`。
- `newGame()`：创建 `FloorBg` 和 `BaseGameSence`。
- `nextDoAfterLoad()`：把场景加入 root，播放关卡音乐，初始化 `PhysicsWorld`，注册帧循环。
- `__enterFrame()`：每帧调用 `pWorld.step()`、`updateOther()` 和焦点修正。
- `createMonster(kind, x, y)`：动态创建 `export.monster.Monster{kind}`，加入 `pWorld.monsterArray` 和 `gameSence`。
- `stopGame()` / `continueGame()`：暂停或恢复帧循环、键盘控制和 TweenMax。
- `destroyGame()`：销毁场景、物理世界、背景、控制器、角色和 Tween。
- `checkGameOver()`：没有存活玩家时派发 `GameOver`。

现代映射建议：

- `MainGame.as -> src/scenes/WorldScene.ts + src/systems/*`，不要把加载、生成、暂停、胜负、实体更新都塞进一个类。
- `ENTER_FRAME -> Phaser.Scene.update(time, delta)`。
- `createMonster -> EntityFactory.createMonster()`。
- `stopGame/continueGame -> Scene pause/resume + systems enabled flag`。

推荐写法：

- `WorldScene.preload/create/update` 只负责场景生命周期编排。
- `CombatRuntime` 或多个 system 负责实体、碰撞、伤害和胜负。
- 暂停时通过统一 `runtime.paused` 或 Phaser scene pause 控制，不逐个停止所有子对象。

## BaseGameSence.as 索引

职责：

- 原版地图 MovieClip 基类。
- 构造时创建背景 `bg{curStage}{curLevel}`，挂到 `bgContainer`。
- 扫描子对象，并交给 `PhysicsWorld.addSubObj()` 分类索引。

关键点：

- 地图碰撞、停止点、传送门等不是代码里硬编码生成，而是 Flash 时间轴里的子对象标记。
- `getChildByName("isWall")`、`isThroughWall`、`stophere` 等标记由 `PhysicsWorld.addSubObj()` 识别。

现代映射建议：

- `BaseGameSence.as -> src/scenes/WorldScene.ts + src/data/maps/*`。
- 碰撞/传送/停止点可先手写 JSON，后续再从资源或 SymbolClass 中恢复。
- 不继续依赖“子对象名字就是逻辑标记”的写法。现代版应使用显式 map object schema，例如 `{ type: "wall", x, y, width, height }`。

## PhysicsWorld.as 索引

职责：

- 原版战斗世界管理器。
- 持有墙体、停止点、传送门、怪物、玩家、类怪物、光环、其他玩家等数组。
- 驱动每帧实体、子弹、GameInfo、镜头、关卡监听器。

关键集合：

- `wallArray`
- `stopPointArray`
- `monsterDisappertPointArray`
- `continueArray`
- `transferDoorArray`
- `auraArray`
- `monsterArray`
- `heroArray`
- `likeMonsterArray`
- `otherHeroArray`

关键方法：

- `addSubObj(obj)`：根据子对象标记分类到墙、穿透墙、停止点、传送门、怪物消失点等数组。
- `pWorldInit()`：创建 `StageListener{curStage}{curLevel}` 并调用 `init()`。
- `pWorldStart()`：创建键盘控制、镜头控制、角色、GameInfo，并设置 `maxMonsterPerScreen`。
- `mapChange()` / `mutiMapChange()`：切换地图并重建场景。
- `step()`：每帧更新怪物、英雄、其他英雄、类怪物、墙、光环、镜头和关卡监听器。
- `destroyWhenChangeMap()` / `destroy()`：清理各类集合和对象。

现代映射建议：

- `PhysicsWorld.as -> src/systems/WorldSystem.ts`。
- `addSubObj -> src/systems/MapObjectIndexer.ts`。
- `step -> WorldScene.update()` 中按系统顺序调用。
- `monsterArray/heroArray/bullet arrays -> EntityManager`。
- 更新顺序应显式写清楚，例如 input -> AI -> movement -> collision -> combat -> projectiles -> cleanup -> camera，避免像原版一样在一个大 `step()` 里交错处理。

## BaseObject.as 索引

职责：

- 所有战斗对象的基础类，继承 `MovieClip`。
- 负责位置速度、方向、动作状态、重力、碰撞、击退、攻击编号、受击状态、治疗数字、buff/法宝 tick 等基础行为。
- `BaseHero`、`BaseMonster` 等在此基础上覆写伤害、死亡、攻击、动画和属性逻辑。

评审：

- 原版 `BaseObject` 过重，职责横跨实体、显示、动画、物理、战斗和特效。现代版不要创建一个同样巨大的 `GameEntity`。
- `GameEntity` 应只保存身份、位置、速度、朝向、状态、碰撞盒等最小公共数据；战斗、动画、buff、法宝、飘字由独立系统处理。
- `curAction` 这类字符串状态可以作为 AS3 映射笔记保留，实际代码应使用枚举或有限状态机。
- `selfBitmap/wallBitmap` 每次碰撞创建或重绘位图的方式容易产生内存和性能问题。现代首版优先矩形/多边形碰撞，确实需要像素级碰撞时也应缓存数据。

核心字段分组：

- 方向和移动：
  - `isRight:Boolean`
  - `isLeft:Boolean`
  - `isFly:Boolean`
  - `speed:Point`
  - `enforceSpeed:Point`
  - `horizenSpeed:Number = 5`
  - `horizenRunSpeed:Number = 10`
  - `graity:Number = 1.5`
  - `jumpPower:Number = -20`
- 碰撞：
  - `colipse:Sprite`
  - `standInObj:MovieClip`
  - `headInObj:MovieClip`
  - `leftInObj:MovieClip`
  - `rightInObj:MovieClip`
  - `lastStandingObj:MovieClip`
  - `selfBitmap` / `wallBitmap`：用于斜面或复杂墙体像素碰撞。
- 状态：
  - `curAction:String = "wait"`
  - `isReadyToDestroy:Boolean`
  - `isAlreadyDead:Boolean`
  - `sid:int`
  - `lastHit:String`
  - `moveAttack:Boolean`
- 攻击和受击：
  - `attackId:int`
  - `beAttackIdArray:Array`
  - `magicBulletArray:Array`
  - `attackBackArray`
  - `attackBackSpeedArray`
  - `hitMaxAttackCountArray`
  - `attackBackInfoDict:Dictionary`
- 渲染和动画：
  - `body:Sprite`
  - `bbdc:BaseBitmapDataClip`
  - `nameTextField:TextField`
- 效果：
  - `cureHpQueue:CureHpQueue`
  - `curAddEffect:BaseAddEffect`
  - `curMagicWeapon:BaseMagicWeapon`
  - `fatherCount` / `hmzfatherCount` / `lysfatherCount`：特殊无敌或保护状态计时。

关键方法：

- `step()`：基础每帧逻辑。顺序大致为动画 step、速度计算、碰撞/移动、特殊保护计时、死亡检查、附加效果、法宝、治疗数字。
- `setSpeed()`：根据左右输入、跑步状态和攻击限制设置速度。
- `checkCanMove()`：遍历 `gc.pWorld.getWallArray()`，用包围盒和像素碰撞检测下一帧是否撞墙。
- `nearToWall(wall)`：根据上下左右碰撞修正位置、速度和落地状态。
- `move()`：按 `speed`、重力和 `enforceSpeed` 更新 `x/y`。
- `moveLeft()` / `moveRight()` / `turnLeft()` / `turnRight()`：设置方向和动画方向。
- `stopMoveL()` / `stopMoveR()` / `stopMove()`：停止移动并回到等待动作。
- `setAttackBack(point)`：应用击退速度，并用 Tween 衰减水平速度。
- `jump()`：设置 `speed.y = jumpPower`。
- `getNextFrameBounds()` / `getNextFrameXBounds()`：碰撞预测。
- `setAction(action)`：更新 `curAction`，死亡时确保动画继续播放。
- `newAttackId()` / `getAttackId()`：攻击实例编号，用于防止同一攻击重复命中。
- `isJump()` / `isInSky()` / `isAttacking()` / `isBeAttacking()` / `isWaiting()` / `isStatic()`：状态查询。
- `reduceHp()`、`isDead()`、`beMagicAttack()`、`getRealPower()`：基类占位，具体逻辑由子类覆写。

`BaseObject.step()` 的现代伪流程：

```text
InputSystem / AISystem writes intent
StateMachine decides action transitions
MovementSystem applies velocity and gravity
CollisionSystem resolves stage collision
CombatSystem opens/closes hit windows and applies damage
ProjectileSystem updates bullets
EffectSystem updates buffs, magic weapons, floating numbers
CleanupSystem removes dead or expired entities
```

现代实体基类应优先保留的字段：

- `id/sid`
- `position`
- `velocity`
- `forceVelocity`
- `facing`
- `isLeft/isRight` 或输入方向状态
- `action/state`
- `isFlying`
- `isReadyToDestroy`
- `attackId`
- `hitRegistry`，对应 `beAttackIdArray`
- `body/collisionBox`
- `standingOn/headHit/leftHit/rightHit`
- `gravity`
- `walkSpeed`
- `runSpeed`
- `jumpPower`
- `projectiles`

注意：这些是“数据含义”迁移，不是要求字段名和 AS3 一致。比如 `isLeft/isRight` 可以重写成 `moveIntent: -1 | 0 | 1` 和 `facing: "left" | "right"`。

暂不迁移或后置：

- `BaseBitmapDataClip` 的完整帧动画系统。
- 斜面像素级碰撞。最小切片可先用矩形碰撞。
- `TweenMax` 击退缓动的精确曲线。最小切片可先线性衰减。
- `CureHpQueue` 飘字队列。可先用调试文本或控制台。
- `curAddEffect`、`curMagicWeapon`。
- 三套 `father` 特殊保护状态，等对应技能迁移时再处理。
- 多人同步相关 `sid` 语义的完整实现。单机切片只需要本地 id。
- 把所有行为继续塞进 `GameEntity.step()` 的写法。

## 输入和镜头索引

`KeyBoardControl.as`：

- 构造时监听 `Stage` 的 `KEY_DOWN` 和 `KEY_UP`。
- 提供 `setRole1()` / `setRole2()` 绑定角色。
- 提供 `destroy()` 移除键盘监听。
- 具体按键到技能的映射留到 Role1 任务再细读。

现代映射：

- `KeyBoardControl.as -> src/systems/InputSystem.ts`。
- Phaser 中使用 `this.input.keyboard`，先支持移动和普攻。
- 输入系统只产生命令或 intent，不直接修改复杂战斗状态。角色状态机再消费这些输入。

`ViewControllor.as`：

- 每帧根据角色碰撞盒在屏幕中的位置推动 `gameSence.x/y` 和 `bg1.x`。
- 处理前进、后退限制、关卡 stop point、双人镜头、上下跟随和简单震屏。

现代映射：

- `ViewControllor.as -> src/systems/CameraSystem.ts`。
- 最小切片可先让相机跟随单个角色，后续再迁移 stop point 和双人逻辑。
- 镜头不应直接依赖全局 `gc.hero1/hero2`，而应接收目标实体或目标查询结果。

## 建议的新 TypeScript 文件映射

- `GMain.as -> src/core/GameApp.ts`
- `Config.as -> src/core/GameContext.ts`，只保留薄上下文
- `AEventDispatcher -> src/core/EventBus.ts`
- `MainGame.as -> src/scenes/WorldScene.ts + src/systems/CombatRuntime.ts`
- `BaseGameSence.as -> src/scenes/WorldScene.ts + src/data/maps/*`
- `PhysicsWorld.as -> src/systems/WorldSystem.ts`
- `PhysicsWorld.addSubObj -> src/systems/MapObjectIndexer.ts`
- `BaseObject.as -> src/entities/GameEntity.ts + src/systems/*`
- `BaseHero.as -> src/entities/Hero.ts`
- `BaseMonster.as -> src/entities/Monster.ts`
- `KeyBoardControl.as -> src/systems/InputSystem.ts`
- `ViewControllor.as -> src/systems/CameraSystem.ts`
- `AssetsLoader/Aloader -> src/assets/AssetManifest.ts + Phaser preload()`

## 第一阶段最小运行时建议

为避免一次性搬完整 `Config` 和 `BaseObject`，TASK-004 可以只做这些，并按现代结构写：

1. `GameContext`
   - 当前 stage/level。
   - 对 `EntityManager`、`EventBus` 的引用。
   - 不存装备、存档、活动、商城、多人的字段。
2. `GameEntity`
   - `position`、`velocity`、`gravity`。
   - `facing`、`action`。
   - `collisionBox`。
   - 只放通用生命周期，不把伤害、输入、AI 都写进去。
3. `WorldSystem`
   - 编排系统更新顺序。
   - 调用 movement/collision/combat/projectile/cleanup 等系统。
4. `MapData`
   - 用显式 JSON 或 TS 对象描述地面、墙、出生点。
   - 不依赖 Flash 子对象名字。
5. `WorldScene`
   - 创建测试场景。
   - 创建一个调试实体。
   - 输入驱动移动。

这个切片不需要：

- 装备属性。
- 存档。
- 技能树。
- 多人。
- 完整地图资源。
- 完整动画系统。

## 待确认问题

- `StageListener*.init()` 到 `PhysicsWorld.pWorldStart()` 的调用点需要在关卡任务中细读。
- `BaseBitmapDataClip` 如何驱动动作标签、帧事件和 `scriptFrameOverFunc()` 需要在 Role1 动作任务中细读。
- Flash 地图中碰撞标记对象如何从导出资源还原到现代地图数据，需要在资源索引任务中单独处理。
- `BaseObject.checkCanMove()` 包含斜面/像素碰撞，现代首版是否要接近原版，需要等最小战斗切片手感验证后决定。

## 下一步建议

推荐下一个对话执行 `TASK-002：创建 Phaser + TypeScript 脚手架`。

如果用户想继续只做逆向笔记，则执行：

- 细化 `StageListener` 和 `pWorldStart()` 链路。
- 或细化 `BaseHero + Role1` 的移动、普攻、动作状态和输入映射。



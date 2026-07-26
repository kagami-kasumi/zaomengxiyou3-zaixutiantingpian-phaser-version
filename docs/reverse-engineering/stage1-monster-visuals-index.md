# Stage 1 怪物与攻击对象真视觉索引

本文是 `TASK-SETTINGS-068` 的权威实现输入，覆盖已完成关卡 Stage 1-1 / 1-2 / 1-3 的全部实际怪物本体、动作和攻击对象，并回归核对 Stage 2-1 / 2-2 的既有关闭证据。范围不包含角色、宠物、Stage 2-3 或现代动画接入。

## 待证明问题与结论

| 待证明问题 | 结论 | 证据等级 |
| --- | --- | --- |
| 五关实际生成哪些怪物 | 1-1 为 Monster30 与 Boss Monster3；1-2 为 Monster7/8 与双 Boss Monster4/2；1-3 为 Monster8/7/3、Boss Monster5 与 Monster30；2-1 为 Monster6/9/10/19；2-2 复用 Monster9/10/19 并增加 Monster16 | 交叉确认 |
| Stage 1 真资源是否存在 | 7 个本体 atlas 与 16 个攻击/效果对象全部位于恢复源 `assets/1.swf`，SymbolClass character id 精确闭合 | 交叉确认 |
| 动作、帧、原点和朝向 | 7 个本体共 167 个独立视觉帧；动作行、hold tick、BBDC offset、可见边界和左右镜像均已落表 | 交叉确认 |
| 攻击创建时机与生命周期 | 16 个对象共 171 个时间轴帧；创建动作、1-based 触发 tick、生成点、是否伤害、末帧销毁/移除均已闭合 | 交叉确认 |
| 碰撞根 | Monster2/3/4/7/8 使用 ObjectBaseSprite；Monster5 使用 ObjectBaseSprite2；Monster30 使用 scaleX=0.5 的 ObjectBaseSprite7 | 交叉确认 |
| Stage 2 是否回归 | Stage 2-1 的 4 本体 94 帧/7 对象 132 帧和 Stage 2-2 的 Monster16 36 帧/6 对象 104 帧仍为 `ready`，源包、public 资产和运行证据一致 | 交叉确认 |

影响逐关实现的原版未知项为零。

## 关卡实际生成全集

| 关卡 | 实际怪物 | 生成与门禁 | 真视觉状态 |
| --- | --- | --- | --- |
| Stage 1-1 | Monster30、Monster3 | StageListener11 每 6 秒按 1P/2P 生成 2/4 个 Monster30；最高层 2 秒镜头过渡后生成 Monster3 | 本索引已定位，现代仍为占位 |
| Stage 1-2 | Monster7、Monster8、Monster4、Monster2 | 五批 8/11/12/13/2，共 46；末批 Monster4+Monster2 双 Boss，二者均死亡才显门 | 本索引已定位，现代仍为占位 |
| Stage 1-3 | Monster8、Monster7、Monster3、Monster5、Monster30 | 五批 9/10/12/13/61，共 105；Monster5 死亡立即显门，60 个 Monster30 不阻塞门 | 本索引已定位，现代仍为占位 |
| Stage 2-1 | Monster6、Monster9、Monster10、Monster19 | 五批 53，Monster6 显门 | 已接入并逐状态验收 |
| Stage 2-2 | Monster9、Monster10、Monster19、Monster16 | 五批 54，Monster16 显门 | 已接入并逐状态验收 |

Stage 1-3 的 `StageListener13.waitForRegisterDataArray` 只列 `Monster8/7/5/30`，但恢复 `sl13` 的实际刷怪点明确包含 Monster3；关卡实际内容以刷怪点和 `MainGame.createMonster(enemyType)` 调用链为准，不能把注册等待数组误当作怪物全集。

## 源包、atlas 与碰撞

本体都来自 `assets/1.swf` 的 DefineBitsJPEG3，FFDec 选择性派生位于 `local-resources/regima/task-outputs/task-settings-068-stage1-monsters/derived/images/`。几何明细为 `monster-frame-geometry.csv`。

| 怪物 | character / atlas | cell / BBDC offset | 可达动作与独立视觉帧 | 碰撞根 |
| --- | --- | --- | --- | --- |
| Monster2 | 2 / 1140×1140 | 190×190 / `(-20,-10)` | wait 6、walk 4、hurt 1、dead 6、hit1 4、hit2 4，共 25 | ObjectBaseSprite |
| Monster3 | 4 / 1080×1080 | 180×180 / `(20,-5)` | wait 6、walk 4、hurt 1、dead 6、hit1 6、hit2 4，共 27 | ObjectBaseSprite |
| Monster4 | 3 / 1140×1140 | 190×190 / `(0,-10)` | wait 5、walk 4、hurt 1、dead 5、hit1 5、hit2 6，共 26 | ObjectBaseSprite |
| Monster5 | 5 / 2100×2450 | 350×350 / `(30,-55)` | wait 6、walk 4、hurt 1、dead 6、hit1 5、hit2 5、hit3 4，共 31 | ObjectBaseSprite2 |
| Monster7 | 7 / 900×750 | 150×150 / `(3,0)` | wait 6、walk 4、hurt 1、dead 5、hit1 4，共 20 | ObjectBaseSprite |
| Monster8 | 6 / 900×900 | 150×150 / `(14,7)` | wait 6、walk 4、hurt 1、dead 5、hit1 5、hit2 4，共 25 | ObjectBaseSprite |
| Monster30 | 8 / 900×600 | 150×150 / `(5,-2)` | wait/walk 共用 6、hurt 1、dead 5、hit1 1，共 13；hit1 本体帧全透明 | ObjectBaseSprite7，scaleX 0.5 |

原 BBDC 以 `(-cellWidth/2-offsetX, -cellHeight/2+offsetY)` 放置 cell；右向从 BaseBitmapDataPool 的镜像源取帧，注册根不变。裁切图左上角不得替代怪物根。

碰撞符号来自 `assets/StageCommon.swf`：

| Symbol / character | 原注册边界 | 实际使用 |
| --- | --- | --- |
| ObjectBaseSprite / 105 | `x=-25..24.95`、`y=-50..49.95` | Monster2/3/4/7/8 |
| ObjectBaseSprite2 / 107 | `x=-30..29.95`、`y=-65..64.95` | Monster5 |
| ObjectBaseSprite7 / 95 | `x=-57..56.95`、`y=-21..20.95` | Monster30；应用 scaleX 0.5 后为 `x=-28.5..28.475` |

## 动作时序

tick 以 BBDC 30 fps `step()` 的 1-based 状态 tick 记录。wait/walk 循环；hurt 结束后回 wait；dead 结束时 `dropAura()` 再 `destroy()`；攻击结束后回 wait。

| 怪物 | wait | walk | hurt | dead | hit1 | hit2 | hit3 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Monster2 | 15 | 16 | 15 | 17 | 35 | 20 | — |
| Monster3 | 15 | 16 | 15 | 15 | 15 | 31 | — |
| Monster4 | 15 | 16 | 15 | 16 | 21 | 60 | — |
| Monster5 | 15 | 16 | 15 | 24 | 15 | 27 | 16 | 
| Monster7 | 15 | 16 | 15 | 15 | 10 | 不可达 | — |
| Monster8 | 15 | 16 | 15 | 15 | 13 | 8 | — |
| Monster30 | 12 | 与 wait 共用 | 15 | 14 | 10 | — | — |

Monster5 `hit3` 的 `frameCount=16`，但 `frameStopCount` 和 atlas 只有 4 张视觉帧；BBDC 每 4 帧回卷一次，合计循环 4 次。Monster8 `hit2` 同理用 4 张视觉帧循环 2 次。Monster7 虽保留 `setAction("hit2")` 分支，但没有 hit2 atlas 行且 `releSkill1()` 未覆写，真实 AI 调用链不会进入该动作。

## 攻击对象、注册点与生命周期

全部对象来自 `assets/1.swf`。逐帧注册边界位于 `attack-object-frame-geometry.csv`；下表边界为所有时间轴帧相对 MovieClip 注册点的联合边界。触发 tick 由 `BaseBitmapDataClip.step()` 的 enter callback 顺序与怪物精确谓词交叉计算。

| 来源 | 触发 tick / 生成点（左向） | 对象 / character / 帧 | 联合注册边界 | 可观察合同与生命周期 |
| --- | --- | --- | --- | --- |
| Monster2 hit1 | 5 / `(x+75,y-100)` | Bullet1_1 / 49 / 14 | `-71.45,8.4..54.55,144.9` | SpecialEffectBullet；末帧销毁 |
| Monster2 hit1 | 20 / `(x-90,y-35)` | Bullet1_2 / 34 / 20 | `-68.4,0.2..88.1,67.6` | SpecialEffectBullet；末帧销毁 |
| Monster2 hit2 | 7 / `(x-35,y-80)` | Bullet2 / 30 / 14 | `-13.6,-12.7..17.1,12.45` | 纯 MovieClip，同时将玩家 tween 到怪物附近；frame14 自移除并 stop |
| Monster3 hit1 | 7 / `(x-105,y-60)` | Bullet1 / 70 / 5 | `0,0..126.85,106.35` | SpecialEffectBullet；末帧销毁 |
| Monster3 hit2 | 6 / `(x-155,y-30)` | Bullet2 / 74 / 10 | `-13.7,-4.45..121.2,56.4` | SpecialEffectBullet；末帧销毁 |
| Monster4 hit1 | 14 / `(x-155,y)` | Bullet1 / 52 / 13 | `-418.95,0..83,7.9` | SpecialEffectBullet；末帧销毁 |
| Monster4 hit2 | 7 / `(x-40,y-70)` | Bullet2_1 / 61 / 35 | `-1486.95,-172.7..1424.95,307.2` | `setDisable()`，只承担开场视觉，不结算攻击；末帧销毁 |
| Monster4 hit2 | 29 / `(x-195,y-50)` | Bullet2_2 / 65 / 20 | `-1683.1,-0.05..1150,70` | SpecialEffectBullet；末帧销毁 |
| Monster5 hit1 | 7 / `(x-155,y-165)` | Bullet1 / 105 / 4 | `0,0..189.25,204.6` | SpecialEffectBullet；末帧销毁 |
| Monster5 hit2 | 5 / `(x-75,y-280)` | Bullet2_1 / 102 / 10 | `0,13.45..162,142.4` | SpecialEffectBullet；末帧销毁 |
| Monster5 hit2 | 15 / `(x-245,y-95)` | Bullet2_2 / 93 / 6 | `0,-4.2..256,175.8` | SpecialEffectBullet；末帧销毁 |
| Monster5 hit3 | 1 / `(x-210,y-80)` | Bullet3 / 80 / 4 | `6.55,0..396.3,133.8` | SpecialEffectBullet；末帧销毁 |
| Monster7 hit1 | 5 / `(x-80,y-86)` | Bullet1 / 75 / 1 | `0,0..150,150` | SpecialEffectBullet；单帧到末帧即销毁 |
| Monster8 hit1 | 9 / `(x-97,y-85)` | Bullet1 / 23 / 1 | `0,0..150,150` | SpecialEffectBullet；单帧到末帧即销毁 |
| Monster8 hit2 | 1 / `(x-46,y-30)` | Bullet2 / 28 / 4 | `-51.85,23.3..143.2,63.2` | SpecialEffectBullet；末帧销毁 |
| Monster30 hit1 | 1 / `(x,y)` | Bullet1 / 21 / 10 | `-185.5,-60.45..68,82.9` | 本体攻击帧透明；该对象承担全部可见攻击，末帧销毁 |

右向生成点按各 AS3 分支取相反横向偏移，并由 `setDirect()` 围绕对象注册根水平翻转。攻击命中使用 BaseBullet 对当前可见对象与目标的复杂像素命中，不得把导出矩形直接当作统一 hitbox。

## Stage 2 防回归

- Stage 2-1：`stage21-monster-visuals-index.md` 与 `asset-annotation/annotations/stage21-monsters.csv` 仍记录 Monster6/9/10/19 的 94 个本体关键帧、7 个攻击对象 132 帧、碰撞根、触发、镜像和运行证据，11 条 stable key 均为 `ready`。
- Stage 2-2：`asset-annotation/annotations/stage22.csv` 仍记录 Monster16 的 36 个本体关键帧与 6 个攻击对象 104 帧，Monster9/10/19 复用 Stage 2-1 owner；14 条场景/机关/Boss stable key 均为 `ready`。
- 本 task 没有重新导出、复制或注册 Stage 2 资源，也没有修改其现代 bundle owner。

## 六段证据矩阵

| 行为合同项 | 局部证据 | 共享调用链 | 几何/坐标证据 | 证据等级 | 未知与反证条件 | 验证方式 |
| --- | --- | --- | --- | --- | --- | --- |
| 关卡怪物全集 | StageListener11/12/13、sl12/sl13 刷怪点、Monster2/3/4/5/7/8/30 | MonsterAppearPoint / StageListener11 -> MainGame.createMonster -> PhysicsWorld | 出生为关卡世界坐标；本 task 不改关卡布局 | 交叉确认 | 若现代关卡生成表与原布局不一致，修实现表而不改资源全集 | 逐关生成目录测试 + 940×590 遍历 |
| 本体动作 | 7 个 Monster AS3 的 BBDC frameCount/frameStopCount/setAction | BaseObject.step -> BaseBitmapDataClip.step -> enter/frame-over callback | 7 个 DefineBitsJPEG3、cell、offset、167 行几何 | 交叉确认 | alpha 阈值 8 仅用于审阅边界，不裁改源图 | atlas 目录测试 + 左右逐状态观察 |
| 攻击时序 | 各 Monster enterFrameFunc/doHi* | BBDC enter callback -> BaseBullet/SpecialEffectBullet -> PhysicsWorld.step | 16 个 SymbolClass、171 行时间轴几何、生成点与注册根 | 交叉确认 | 运行若出现 1 tick 差异，先核对 Phaser update 相位，不改 AS3 tick | 确定性 tick 测试 + 逐攻击录帧 |
| 碰撞与朝向 | newColipse、setDirect、BaseBullet.checkAttack | BaseObject/BaseBullet/HitTest 共享消费者 | StageCommon char 95/105/107；MovieClip 注册边界与世界生成点分离 | 交叉确认 | 不以裁切左上角或联合外包框替代复杂命中 | 碰撞快照 + 左右命中/未命中边界 |
| 生命周期 | scriptFrameOverFunc、BaseBullet last-frame destroy、Monster2Bullet2 frame14 | PhysicsWorld 清理 magicBulletArray；raw MovieClip 自移除 | 本体 dead tick 与对象 timeline 帧数 | 交叉确认 | 无影响实现未知 | 死亡/对象末帧/重入无残留测试 |
| 现代映射 | 不适用 | 每关独立 visual bridge 复用共享 atlas/animation descriptor | 保留 Flash 根、BBDC offset、镜像和对象注册点 | 现代设计选择（受原合同约束） | 不以通用 Arc/Text、单帧或代表性怪物关闭全集 | 专项、全系统、build、annotations + 940×590 |

## 逐关实现拆分

`TASK-SLICE-157` 固定拆为：

1. `TASK-SLICE-157A / GOAL-060`：Stage 1-1 Monster30、Monster3 与 3 个攻击对象。
2. `TASK-SLICE-157B / GOAL-061`：Stage 1-2 Monster7/8/4/2 与 8 个攻击/效果对象。
3. `TASK-SLICE-157C / GOAL-062`：Stage 1-3 复用 Monster30/3/7/8，并新增 Monster5 与 4 个攻击对象；逐批关闭 105 怪运行状态。
4. `TASK-SLICE-157D / GOAL-063`：五关共享资源 owner、Stage 2-1/2-2 防回归与父任务关闭验收。

实现不得从运行截图切怪物，不得把 atlas cell 左上角当注册点，不得以单帧、代表性怪物或现代 Arc/Text 替代任一可达动作/攻击对象。

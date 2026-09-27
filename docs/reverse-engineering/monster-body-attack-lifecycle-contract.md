# 公共怪物身体、攻击对象与死亡顺序

`TASK-SETTINGS-232`，范围为 Monster30 代表的公共顺序与正式五关同类消费者。本文不核销完整怪物技能、猴马84项组合合同或VS-067。公共顺序与代表性生命周期已由原方法AIR样本交叉确认；行为sidecar为 `reference/monster-body-attack-lifecycle-contract.json`，`contractId=task-settings-232.monster-body-attack-lifecycle`，关键字段 `/contracts/BA-01` 至 `/contracts/BA-08`。BA-08的其他类型只做静态映射，不外推代表样本。

## 待证明问题

1. 已准备的身体回调与同帧火焰致死谁先发生？
2. 回调生成的显示对象是否同时成为独立伤害对象，何时第一次检测？
3. HP归零、死亡动作结束、显式destroy分别怎样影响已发出的攻击？
4. 受伤、冰冻首尾、世界暂停是否停止身体、弹体逻辑和MovieClip播放？
5. 五关/TestScene哪些消费者仍用源activeAttack替代独立攻击？

## 六段证据链

所有AS3相对路径均以 `local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts/` 为根。源码只读；原生运行采用游戏随包AIR，不能描述为旧Flash Player实测。

| 合同 | 局部与共享证据 | 空间/视觉证据 | 等级与反证 | 验证/现代映射 |
| --- | --- | --- | --- | --- |
| BA-01 身体先于效果 | `base/BaseObject.as:165` step先bbdc、移动、checkOver，再curAddEffect；`base/BaseMonster.as:305` super.step先于AI/CD | 不新增像素或碰撞几何 | 确认事实；顺序反转即反证 | 三帧率现代反例；动态probe与后续运行owner验收 |
| BA-02 一次回调创建独立对象 | `base/BaseBitmapDataClip.as:461` enter→hold递减/换帧→exit；`export/monster/Monster30.as:154` hit1/x=0/hold=10调用doHi1；:171创建SpecialEffectBullet并push | 出生复制怪物根x/y，设置方向后挂到同一gameSence；不取裁片角点 | 确认事实；重画重复发射、仅显示无对象均反证 | 后续攻击owner同时提供伤害实体和只读显示投影 |
| BA-03 新弹下一世界步才检测 | `World/PhysicsWorld.as:489` 捕获当前弹体数组长度，step2→清理→monster.step | 非碰撞几何结论 | 确认事实；新弹当次伤害检测即反证 | 调度probe；不得用事件数量代替实际伤害 |
| BA-04 死亡不等于销毁 | `base/BaseMonster.as:1433` reduceHp切dead，不清magicBulletArray；`Monster30.as:127` dead动作末尾dropAura/destroy；`BaseMonster.as:751` destroy清弹/置ready，之后Tween延迟移除 | 死亡显示根与弹体注册根各自独立 | 确认事实；HP零立即删除攻击或destroy仍留攻击均反证 | 后续区分dead、ready/removed和显示淡出 |
| BA-05 弹体自己负责命中与结束 | `base/BaseBullet.as:105` step2，:153 step，:224 checkAttack，:403 destroy；攻击ID去重，不以sourceRole.isDead拒绝 | 本任务不证明像素命中；受控目标sink必须明确标记 | 确认事实；重复命中、源动作改变清攻击均反证 | 真实伤害消费者的独立验证交下项 |
| BA-06 冰冻影响身体，非普遍清弹 | `BaseAddEffect.as:2944/2973` show/hide horse ice停止/恢复BBDC；`BaseBullet.as:77` hurt-cut默认false | show资源创建失败会return；不能用失败分支代表正常冰冻 | 确认事实；需要冰冻首尾动态样本 | 原方法probe；保留body/effect先后 |
| BA-07 世界暂停与底层弹体暂停不同 | `my/MainGame.as:620/674/824` stop移除ENTER_FRAME并停子MovieClip/Tween，continue恢复；`BaseBullet.as:105` 仅step受isStopGame门禁 | 原生MovieClip播放时钟；非现代delta=0推断 | 确认事实；仍调用world.step不能冒充完整世界暂停 | 分别核对正常调度停止与单独step2门禁 |
| BA-08 分支不可一概而论 | 五关12类型扫描见source-caller-map；所有destroy覆写都super.destroy | 复用各家已有视觉资料，不扩成全集重新提取 | 确认事实，仅静态分支清单 | 特殊分支见下文，动态代表不外推专属技能 |

## 空间与资源边界

源 `Monster30.doHi1` 复制 `this.x/y` 到弹体，两者同挂 `gc.gameSence`，故是同父坐标的注册根复制。之后源的移动不会移动已创建的SpecialEffectBullet（未设置followObject）；不得从裁片中心反算出生点。`setDirect` 对弹体根做水平翻转，不改变出生根。

恢复源是 `local-resources/regima/source/restored-swfs/assets/1.swf` 的 `Monster30Bullet1` character 21。已有068资料在 `stage1-monster-visuals-index.md` 与 `local-resources/regima/task-outputs/task-settings-068-stage1-monsters/`，它们仅供既有图层/时间轴定位，不在本项重新宣称完整UI真值或像素命中verified。目标碰撞的既有机器真值引用 `task-settings-218.dragon1-target-collision`，该真值不覆盖本攻击对英雄的全像素命中合同。

本项不修改外观、注册点、资源、碰撞或UI，不新增视觉容差。动态样本的坐标是受控输入，用来观察出生根复制与后续源移动隔离，不是关卡自然出生坐标采样。后续若发现缺少所需攻击像素/时间轴机器真值，必须先补输入，不能拿联合bounds代替命中或以当前代码反推原版。

## 必须保留的源分支

- 普通SpecialEffectBullet默认 `isHurtCanCutDownEffect=false`，Monster30不覆写；受伤和死亡本身不清它。`BaseBullet.step2` 会先执行step/检测，再检查末帧及hurt中断，不能把这两个结束检查都提前到伤害前。
- `Monster2.doHi2`（:267）是纯MovieClip `Monster2Bullet2` 加玩家Tween，不进入magicBulletArray，不能变成伤害弹体或声称会被公共清弹循环销毁。
- `Monster4.doHi2_1` 的 `setDisable()` 只承担视觉。伤害职责不能由“屏幕上有攻击图”推出。
- `Monster16.doHit3`（:371）创建FollowBaseObjectBullet，禁用末帧销毁，使用 `gc.frameClips*7` 寿命；该类构造设置hurt-cut=true，step2先super再跟随。不得用Monster30默认结论覆盖。
- 12类型为2/3/4/5/6/7/8/9/10/16/19/30。静态映射工具 `python tools/monster-body-order-map.py` 保存源hash、88个调用locator与五关名单；它不是动态验收。

## 现代反例

`tools/pet-target-body-order-preflight.ts` 使用真实Monster30模型和Stage11动画函数。2026-09-27重跑20/24/30fps：准备hit1后，身体先行比较路径各产生1个事件；现行world先效果致死、view后读取dead路径各产生0个事件。结果位于 `docs/tasks/evidence/TASK-SLICE-226/target-body-order-preflight.json`。

该诊断明确不是源AIR、正式Scene、真实碰撞或画布验收。先绘图只能修复显示症状；伤害仍依赖源activeAttack时，不能关闭BA-02..05。

## 五关现代消费者矩阵

| 正式消费者 | 目标效果与身体 | 实际伤害 | 显示与清理 |
| --- | --- | --- | --- |
| 1-1/TestScene：30、3 | `Monster30System.ts:210` effects先行且致死返回；`TestSceneUpdatePipeline.ts:68` 模型后才:76视图 | `TestSceneCombatBridge.ts:170` 源activeAttack+hitbox；`Monster30System.ts:603`要求源hit1；独立远程弹走`TestSceneWorldBridge.ts:625`，不能混为此近战攻击 | `Stage11MonsterVisualBridge.ts:128`后读snapshot；攻击Image独立播放，但不是伤害对象；:162销毁残图 |
| 1-2：2/4/7/8 | `MonsterRuntimeRegistrySystem.ts:94` physics→effects→combat，`MonsterRuntimeRegistryBridge.ts:80`随后view | Registry bridge:81调用party resolver；`Stage1CombatSystem.ts:348/391`英雄/宠物均要求phase=active与activeAttack | Stage12视图持有显示事件；Registry bridge:95死亡视觉完成后移除 |
| 1-3：3/5/7/8/30 | `Stage13GameplayBridge.ts:184`同样effects→combat→syncView | :204调用同一party resolver | Stage13视图分别路由Stage11、Stage12、Monster5；不能据3/30同视图推断伤害同owner |
| 2-1：6/9/10/19 | `Stage21GameplayBridge.ts:240`effects在身体同步前，recovery还受视图完成状态约束 | :262同一party resolver | Stage21 view维护攻击图，视觉完成不会使图成为独立伤害对象 |
| 2-2：9/10/16/19 | `Stage22GameplayBridge.ts:261`effects→combat→view，保留recovery等待 | :280同一party resolver | 9/10/19复用Stage21；16有followOwner/lifetime分支，不能以30默认替代 |

主agent复读Registry、Stage13/21/22实际调用点以及 `HeroPartyRuntimeBridge.ts:355`：该入口分别调用英雄和宠物伤害resolver。现代 `Stage1CombatSystem.ts:490/574` 清activeAttack，故仅补显示回调不能完成死亡后独立伤害。上述是当前消费者事实，不代表本任务已修改它们。

## 动态验收与边界

2026-09-27 原包AIR **51.1.1.5** 执行45组、810个状态；SDK51.3.4仅作为编译器/ADL，不把SDK版本误记为实际runtime。20/24/30 host设置各15场景：自然结束、同帧致死/非致死火焰、发射后hurt/dead/destroy、发射前dead/destroy、已冰冻、效果阶段解冻、首帧加冰、世界暂停、重复重绘、低层弹体暂停、显式hurt-cut。出生根固定后持续移动源，弹体保持原根。

- baseline执行原 `BaseObject.step/setAction`、BBDC推进/hold/回调、Monster30动作/发射/结束、BaseMonster.reduceHp、BaseBullet构造/step2/step/checkAttack/结束及PhysicsWorld怪物循环。显式destroy只抽取ready与清弹原片段；AI、物理、奖励、UI和淡出不属于本样本。
- 火焰使用原伤害分支，但到期时点由fixture注入；冰冻调用原show/hide方法并预置同名冰效对象。没有把效果计时全集或冰效视觉宣称为本次验证范围。
- 目标 `beMagicAttack` 为接受/计数sink，验证原checkAttack真实调用、ID去重、首次检测和源死亡后的调用；不验证英雄HP算式、真实碰撞或自然追击。后续实现必须另验真正伤害消费者。
- 生命周期probe中的弹体使用恢复SWF真实MovieClip，但逐帧输入由fixture显式gotoAndStop；独立 `tools/monster-body-timeline/capture.py` 另以真实ENTER_FRAME观察三帧率66态，确认10帧与stop/play恢复。二者不合称完整原游戏调度/像素回放。
- 世界暂停样本停止调用world.step，低层暂停样本只设置isStopGame，分别验证；MainGame暂停调用链由静态源支撑。未运行完整原游戏菜单暂停，不宣称菜单旅程通过。
- 六类真实编译源变异全部拒绝：效果提前、只挂显示未入弹体列表、HP死即清弹、每hold重复发射、destroy保留子弹、当次先body再命中新弹。四类报告损坏反例亦拒绝，但不混算源变异。baseline重复运行45组全等。

复验：`python tools/monster-body-order-map.py`；`python tools/monster-body-order-source/capture.py`；`python tools/monster-body-order-source/verify.py --mutations`；`python tools/monster-body-timeline/capture.py`。已有输入/hash未变时可用verify的`--existing`重验保存的变异报告，不能替代首次真实运行。

证据：`docs/tasks/evidence/TASK-SETTINGS-232/{source-baseline,verification,repeat,timeline,source-caller-map}.json`。早期24case `source-trace.json` 被审查为手写模型且顺序错误，标为 `rejected-non-source`，完全不参与结论；保留失败日志供反证追踪。源码/fixture在tools可交付，本地语料和完整日志不承诺随Git提供。

## 后续消费边界

下一项 `TASK-SLICE-240` 只消费Monster30在1-1/TestScene及1-3两条owner路径：身体回调、独立伤害对象、显示投影与死亡/销毁。先核对所需攻击空间/碰撞输入，缺口必须有界补证，不得用现有矩形或横向距离作为原版像素真值。其他11类型保留本表与源分支责任，240不得宣称五关全怪完成。原226相关组合验收必须验证真实伤害，仍不核销其余公共231..235及84项剩余责任。

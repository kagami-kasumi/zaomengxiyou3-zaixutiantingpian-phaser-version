# 宠物命中后的公共怪物击退合同（230）

范围：原版 1.1 的宠物弹体 → `BaseMonster.beMagicAttack` → `BaseObject.setAttackBack/step`，以及当前五关/TestScene 的消费缺口。本文不宣称现代击退、完整怪物动画、死亡或整族玩法已复现。

2026-09-26 / 236消费预检限定：下述230运动观测仅为通用方法受控壳，不能直接当12实际怪物构造profile的轨迹。230壳未执行BaseMonster构造中的colipse.scaleX*=2，11类地面宽度为50/60而218实际为100/120；Monster30局部.5×父类2后的宽114与壳一致，但实际gravity=0、壳=1.5。相同初始vy=-5的首步，壳实测-2.8，真实profile按源公式推导-4（当时尚非新原生采样，后由下节237确证）。独立诊断见 `tools/monster-knockback-profile-preflight.mjs`。217/218几何与230通用壳观测保留；当时实际profile联合输入待TASK-SETTINGS-237、236保持Blocked；解除证据见下节。以下gravity=1.5、horizenSpeed=5及按三shape分组的运动结论均不得外推全部实际类型；Monster16/30的动作运动谓词也须在实际profile补证中核对。

## 237 实际构造 profile 补证（2026-09-26）

236消费增量纠正：原237探针每host强制renderTime末值，Tween完成后会复活被墙清零的vx。TweenLite.as:296原cachedTime相等且!force时直接返回；已将循环改为force=false，重跑七原变异，新增force-endpoint源变异影响336轨迹且被拒绝，恢复正常源观测重复一致。旧强制末值报告仅留本地diagnostic-forced-endpoint.json，不再作为实现oracle；当前sidecar已按修正探针再发布。此为原采样合同修正，不是降低现代物理容差。

上述236预检缺口现由 `task-settings-237.monster-knockback-profiles` 闭合，237收尾时236恢复Ready，当时仅解除原版输入阻塞；236后续消费见文末。机器输入为 `ground-truth/manifests/behavior/task-settings-237-monster-knockback-profiles.json`，Schema为 `schema/monster-knockback-profile.schema.json`。230的通用壳轨迹不改写；实现应按237实际类型/构造上下文消费profile和轨迹，继续按230消费方向、入口、去重、自然Tween覆盖与原世界顺序。

| 六段证据 | 237输入与边界 |
| --- | --- |
| 局部对象 | 原12个Monster派生构造器和newColipse方法完整执行；Monster16.isAttacking、Monster30.isCannotMoveWhenAttack原方法执行。`/methods`保留源文件/方法hash与行号。 |
| 共享调用链 | 原BaseMonster构造器完整执行；BaseObject物理字段声明及构造赋值、虚拟newColipse顺序按源片段保留。继承230原step/setSpeed/checkCanMove/move及飞行后处理，另保留BaseMonster.isWalkOrRun（仅walk/run）和checkOver（y≥3000复位300）的实际覆盖；HP/等级/UI/附加效果构造服务显式为空接收端，setAction仅写动作，不宣称完整身体/AI。 |
| 几何与空间 | `/inputReferences`复用218恢复StageCommon三Symbol及12运行实例bounds，并与原生构造后colipse逐项比较；父类scaleX*=2与Monster30局部.5得到最终几何。受控墙坐标来自独立218 bounds，变异不重新贴合变小的身体。另以`/environmentInputs`复用217全部43墙、marker、class及顺序，`/environmentMotion`保存3096条/77400态原方法输入重放；getBounds返回217精确几何，不宣称完整原关卡SWF播放。 |
| 可观察合同 | `/profiles`有288组实际构造状态（12类型×8上下文×3fps），保留完整分支与运动谓词；`/motion`发布1890条代表轨迹×25状态。完整7560组/189000受控状态先比较owner/boss标签等价再去重，另有五关墙数组输入重放的77400态；owner标签只核对不依赖owner的共享运动，不冒充双英雄完整场景。 |
| 现代映射 | 236按monsterId、实际curStage/curLevel查询profile，以Sprite根点/原host步速度接真实model；保留早/晚命中相位和TestScene独立owner。237不写现代实现，不替代236生产变异、五关与可见验收。 |
| 独立核验 | 218独立几何、人工源字段/分支清单与原生构造观测对账；69120自由运动状态独立解析式核对，墙分支/原native全轨迹保存。8类实际编译源变异均同时改变轨迹并被拒绝；正常源恢复后全部确定性观测重复一致，8类Schema坏数据拒绝。 |

交叉确认的实际字段：所有类型继承runSpeed=10；Monster30 gravity=0/isFly=true，其他11类gravity=1.5/isFly=false。水平速度按各自构造执行结果消费，Monster9/10/19在curStage=9有分支，不能以首个字面量替代构造结束值。三个恢复Symbol最终边界仍严格使用218：地面100×100或120×130，Monster30为114×42。Monster30受击首步原生实测vy=-4，230通用壳为-2.8的适用性差异已确证。

fixture上下文：正式1-1/1-2/1-3/2-1/2-2及源构造的3-3、8-1、9-1分支；轨迹保留12基准类型和9/10/19的stage9速度分支，20/24/30host。21种受控状态包括空中、墙顶/底/左右、三marker、屏幕严格/等号边缘、stun、wait、dead、hit1/hit4、贴地hit1/hit4、recover/unfreeze。后两者固定第5步切换只作为测试输入，不是原版恢复时长。受控模式世界平移(-100,0)；五关墙数组每个anchor对应worldOffset保存在各行，Sprite根点由原AIR赋值。Tween在第n步前按min((n-1)/fps,0.4)秒采样，使用force=false保留完成后不再赋值语义；Point保持double，Sprite赋值由原AIR落twip。物理没有引入视觉容差。iswor壳固定写walk：已核对原BaseObject.isRunning=false且12类无覆盖，因此与本范围原分支等价；不外推到其他类型。checkOver保留原y≥3000复位300方法，但本批没有单列越界阈值专项，不能把方法存在当边界专项通过。

变异拒绝的原生差异轨迹数：漏父scale 340、飞行gravity=1.5 432、统一速度5 1392、忽略stage9 432、Monster30允许hit1移动48、Monster16漏hit4谓词24。错误沿用BaseObject恒true行走谓词360、缓动完成后强制重复末值336。运动谓词不因构造profile字段已通过而跳过：必须比较实际source-step轨迹，不能仅比较方法是否存在。原生使用游戏附带AIR 51.1.1.5；不是旧Flash Player实测或原游戏整场景验收。

复验：`python tools/monster-knockback-profile-source/capture.py` → `python tools/monster-knockback-profile-source/verify.py --mutations` → `python tools/monster-knockback-profile-source/generate.py --check`；首次发布最后一步去掉`--check`。源与工具输入未变时复用本批源证据，236只验证现代消费者。237原始报告、原生变异、验证/发布结果和编译运行产物分别保留在 `docs/tasks/evidence/TASK-SETTINGS-237/` 与 `local-resources/regima/task-outputs/TASK-SETTINGS-237/air/`；没有图像中间批次。行为sidecar保存源定位、fixture脚本hash及独立217/218/230引用，不依赖本地报告才能读取profile与轨迹。

## 可复验输入（230）

- 行为机器输入：`ground-truth/manifests/behavior/task-settings-230-monster-knockback.json`，`truthId=task-settings-230.monster-knockback`。`/motion` 为原生采样的 270 条受控轨迹；`/entryAndScheduler` 保留入口、去重与世界顺序；`/methods` 保存源文件/方法指纹及行号。P1/P2、普通/Boss 的重复观测先核对相等，再由 `/applicability` 无损合并。
- 空间输入直接复用 verified `task-settings-217.pet-ground-environment` 的 `/displayObjects`（正式五关墙）和 `task-settings-218.dragon1-target-collision` 的 `/displayObjects`（ObjectBaseSprite/2/7 注册点、嵌套矩阵、碰撞形状）及其原版基准。230 不新增或替换视觉资料族，也不把纯运动字段塞进 UI schema；行为 sidecar 使用 `schema/monster-knockback.schema.json`，空间引用仍按 UI schema 校验。
- 原始运行采样：`docs/tasks/evidence/TASK-SETTINGS-230/native.json`；SWF/生成壳/编译和运行日志：`local-resources/regima/task-outputs/TASK-SETTINGS-230/air/`。使用原游戏附带 AIR 51.1.1.5；SDK 51.3.4 仅编译/启动。主恢复包 `1_MainLoad__main1.swf` 的原 DoABC/FileAttributes 原样保留为无文档根的测试库，使用其中真正的 TweenMax；Cubic 为原 AS3 原样编译。没有重新提取旧语料。
- 复验：`python tools/monster-knockback-source/capture.py` → `python tools/monster-knockback-source/verify.py --mutations` → `python tools/monster-knockback-source/generate.py --check`。变异只改测试壳；结束重新生成正常壳并核对全部确定性观测。首次生成去掉 `--check`。
- 现代反例：`node tools/run-system-tests.mjs pet-monster-knockback-preflight`，输出 `docs/tasks/evidence/TASK-SLICE-226/monster-knockback-preflight.json`。退出 0 表示诊断运行结束，**不是击退通过**。

## 六段证据矩阵

下表源路径均相对 `local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts/`；精确哈希由生成器维护，不手抄另一份数值表。

| 合同 | 局部/共享证据 | 空间/机器入口 | 等级与验证边界 |
| --- | --- | --- | --- |
| 弹体决定横向符号 | `base/BaseObject.as:742` getBeattackBackSpeed；227/228/229 已证宠物弹体类型与字典 | 230 `/methods`，432 个方向样本 | 交叉确认：5 类运动弹用 speed.x，SpecialEffect/Follow 用 getDirect；x=0 也明确采样。没有用目标朝向替代弹体方向 |
| 成功入口才写速度 | `base/BaseMonster.as:847-940`，`base/BaseBullet.as:301-325` | 230 `/entryAndScheduler` | 交叉确认：保护拒绝不消耗 id；闪避拒绝消耗 id；几何不命中不写速度；强制 param3 可越过几何但不能越过保护/闪避。运行的是原函数前缀与原去重成功块；随机输入固定0.5、YUESEMENGLONG关闭，原有该buff分支的闪避额外+0.2只作静态确认，不宣称buff全集实测；HitTest 布尔受控，真实碰撞沿用 218/228/229 |
| 原速度与缓动 | `base/BaseObject.as:840-879`，原 `Cubic.easeOut`，主包 TweenMax | 230 `/motion` 和 `/naturalTweenOutcome` | 交叉确认：x 乘二、y 直接覆盖，0.4 秒 Cubic.easeOut 到初始 x 的 20%；每步位移不是 px/s。原生 Point 与 Sprite 坐标分开观测 |
| 屏幕边界 | `BaseObject.as:840-871`、`:899-905` | 217/218 + 230 屏幕边界状态 | 交叉确认：gameSence.localToGlobal 的根点严格 `<20`/`>920`，等号仍创建缓动；飞行 move 另受整个 colipse 的预测屏幕范围门控。受控 world.x=-100 检查了根/屏幕转换 |
| 地面/空中/墙 | `BaseObject.as:165-186,417-610`；`BaseMonster.as:552-562` | 230 `/motion` 三形状和墙 marker 分支；217 正式墙 | 交叉确认：先判墙再 move，先 y 位移再 gravity，最后 enforceSpeed；落地 y 使用原 colipse 高度/2 和 -0.1。冻/晕阻止 BaseMonster.move，不等于整个 step 停止 |
| 普通/Boss/飞行 | 十二个 `export/monster/Monster*.as` 继承和构造；`BaseMonster.as:305-405` | 230 `/applicability`，三形状原生实例 | 共享 setAttackBack 无 Boss 豁免；当前十二类不重写该函数。Monster30 飞行后处理含 hurt 0.8、abs(vy)>4 的 0.7、y 边界；控制 isBoss/P1/P2 输入得到相同物理轨迹，不冒充真实十二种 Boss 关卡运行 |
| 命中/运动/AI顺序 | `World/PhysicsWorld.as:470-647`、`BaseHero.as:1679-1701,964-987`、`BasePet.as:141-161`、`BaseMonster.as:305-335` | 230 `/entryAndScheduler` schedule | 原世界 step 原样执行，hero.step 为明确的宠物命中观察口：怪物先运动，英雄后触发宠物命中，因此新速度通常下次怪物 step 才消耗；BaseMonster 本身是父 step 后 AI。没有把此观察口称作完整英雄/宠物场景 |
| 现代映射与反例 | Stage1CombatSystem、MonsterPhysicsSystem、各 GameplayBridge 与 TestScene adapter | 下节路径矩阵和 226 诊断 | 已确认消费缺口，未实现；数值/轨迹、正式浏览器与组合验收交 236，身体/死亡时序交 232 |

## 可观察规则与排除依据

1. 运动弹（EnemyMoveBullet/1/2、S_ShapeMoveBullet、FastAndSlowBullet）按速度符号乘原字典 x；SpecialEffectBullet/FollowBaseObjectBullet 的宠物对象按 getDirect。负字典值反向，速度零落非负分支；未识别的 BaseBullet 保持字典符号。四个英雄专名分支不适用于当前宠物，明确排除；Role1Bullet12 跳过 setAttackBack 的入口作为排除反例采样。
2. 成功命中且字典存在时，在 addEffect 和扣 HP **之前**调用 setAttackBack。速度是覆盖，不是累加。没有字典则不写；零向量有字典仍执行，x=0 会把 isRight 设 true。0 伤害也不能仅按 HP 差值过滤击退。
3. `(6,-5)` 在非边界命中当下变成 `(12,-5)`；第一次受控空中物理步位移为 `(12,-5)`，随后 vy=-3.5。原 gravity=1.5/host step。现代若用秒单位，必须绑定实际源 host fps 和相位；直接写 6/-5 或继续叠加现代 2400px/s²都不能等价。原缓动使用秒，不可按固定帧数外推到所有 fps。
4. 越界向外命中只写 vx=0/vy=输入并早退；不创建新 tween，也不取消旧 tween。原生真实计时确认：普通第二次命中覆盖旧 x tween；边界早退后旧 tween 可把 x 速度恢复到原方向并最终到旧目标值。**暂停 tween 后手动 renderTime 的覆盖行为不同**；`repeat` 行仅作诊断，`natural-tween` 才是覆盖结论。不得用暂停探针推断运行中覆盖策略。
5. 同 target/attackId 的成功命中只应用一次；新 id 再覆盖。Dodge 消耗 id，保护不消耗；具体重发间隔仍消费原弹体 id 更新机制，不能按伤害事件每渲染帧重放。P1/P2不改变物理公式；不同宠物事件仍须按现有明确的更新顺序处理，不能按 owner 分桶重排。
6. BaseObject.step 在非 hurt/dead 等受击态会先 setSpeed，恢复动作可改写 vx；不能把 0.4 秒看作独立于动作的保证移动时长。当前 Monster30 的 `isCannotMoveWhenAttack`（`:195`）在 hit1 返回 true；Monster16 扩展 isAttacking。其余当前类继承默认运动判断。Boss 在本次击退写入之后还可能因 beattackedtimes>1000 触发保护/反击动作；普通阈值为 >2500。**这不是免受本次击退的前置门控**。下一步依实际动作重写速度；阈值、HP、回调和动作恢复全集是 232 的身体/攻击生命周期范围，230 不赋予其新运行通过声明。
7. 受击保护（isYourFather）与冻结/眩晕不同：前者拒绝命中，后者可已有受击速度但 move 不执行，tween 不因此停止；墙修正/后处理仍由各自调用顺序决定。飞行在屏幕移动门控失败时连 y/gravity 都不执行，然后仍有 BaseMonster 飞行后处理。
8. 死亡动作属于 isBeAttacking；是否继续 step 取决于 isReadyToDestroy/实际死亡生命周期。230 只采样固定 dead 动作下的物理，未将它当作实际致死/尸体轨迹。死亡奖励归属由 231 补证；身体回调、效果先后、恢复/释放由 232 补证。
9. 受控墙为轴对齐静态 Wall/ThroughWall 与三类 marker；斜墙、运动墙、新怪物类型不在本项。五关墙几何继续消费217，不能从受控墙坐标生成正式地图。此排除不批准忽略未来关卡所需的斜墙/运动墙证据。

原点说明：采样 x/y 是原 Sprite 根注册坐标，colipse 原实例是其 child；速度保持 Point 的完整精度，Sprite 赋值会落到 twip。现代 physics.y 也以模型中心和 height/2 求底部，但**height=100 的默认值不是所有怪物的原版高度**。必须用218/既有怪物投影核对各类型与相机转换；不得把画布图片左上角当根点。230没有修改已有几何真值或扩大碰撞/视觉容差。

## 现代消费交接（236执行前的历史基线）

| 入口 | 现有 owner/位置 | 已确认事实及所需接线 |
| --- | --- | --- |
| 原生host宠物弹体 | `src/systems/PetProjectileCombatSystem.ts:38` → `Stage1CombatSystem.ts:479` | 接受/去重、HP、hurt、事件由现有 combat owner 持有；速度仅写 DamageEvent。击退应从成功结算单次转交运动 owner，不能另建 HP/去重副本 |
| 旧猴/马弹体兼容入口 | `PetMonkeyCombatSystem.ts:114-150`、`PetHorseCombatSystem.ts:204-248` → 同一 `resolveStage1PetHit`；`HeroPartyRuntimeBridge.ts:321-340` | `resolveAttacks`在物理之后调用；两者显式跳过`petHostTick !== undefined`的新路径。晚阶段接受的新id必须核对，但不据代码存在宣称当前正常新宠物会走旧路径；remainingHits/recordProjectileHit仍由原弹体owner处理 |
| 共享物理 | `src/systems/MonsterPhysicsSystem.ts:34` | 只处理 y/2400重力/顶面落地，飞行直接 return；没有 vx/tween/完整墙/源相位消费。既有物理模块是共享接缝，不能只把 event 值写到 velocityY 后宣称闭合 |
| Stage1-2 | `stage12/Stage12GameplayBridge.ts:77`、`MonsterRuntimeRegistrySystem.ts:64`、`src/scenes/MonsterRuntimeRegistryBridge.ts:53` | 每个 registry entry 已有 combat/physics 同一配对。出生默认 grounded/100 须按类型接已有定义；236预检纠正：Stage1-1走TestScene独立owner，不属于此registry |
| Stage1-3/2-1/2-2 | 各 `Stage13/21/22GameplayBridge.ts` 的 create/updateMonsterCombat | 当前自有 Map 持有配对，复用同一个共享消费方法；不为本任务强制迁移整套 registry 或复制三套规则 |
| Stage1-1 / TestScene | `TestSceneStage11RuntimeAdapter.ts`、`TestSceneWorldBridge.ts:112`、`TestScenePetEnemyAdapter.ts:29`、`Monster30System.ts` | 正式1-1的LevelRuntime调用TestScene update pipeline；adapter的x/y只有getter，HP setter落真实模型，没有速度写回。必须让实际Monster30模型消费击退，不能写facade临时字段。Monster3 arena为另一owner，WorldBridge:747旧弹体分支显式跳过petHostTick，只核销实际可达宠物入口，不伪造原生host入口 |
| 每帧实际顺序 | `HeroPartyRuntimeBridge.ts:283,419`；各 GameplayBridge heroes.update在monster update之前 | **现代原生host宠物命中早于怪物物理**，与原世界顺序相反；兼容旧弹体入口则在物理之后。实现要有明确待消费相位/队列或等价调度，分别记录早/晚入口，既保证下一原host步，又不重复应用或给晚入口多延迟一帧；不得简单把当前调用顺序当原版 |

没有全项目唯一怪物实例 owner：共享模块、registry配对、各 Map 和 TestScene 模型都是现有真实入口。236应保持每实体唯一状态与共享算法，不能用“统一owner”口号扩成怪物架构线010A/B。

输入清单：成功攻击身份、弹体原类型/方向或已确认的带符号原速度、源 host fps/相位、世界到屏幕矩阵、colipse/墙输入、当前动作/受击与禁移动状态、生命周期有效性。输出应写回该怪物真实 x/y/速度，供同帧碰撞、目标投影和显示读取。不同次命中覆盖与边界旧 tween行为必须可测；退出/重试清理 pending与tween，不能串实体或slot。

## 230验证结论和边界（历史）

27,000原生运动态（1,080组）及432方向输入通过；14入口、4重复/拒绝链、4世界调度状态和3真实计时覆盖模式通过。独立解析式核对自由运动、Point速度、Sprite twip赋值、飞行后处理；墙全轨迹来自原方法，独立断言覆盖接触/marker分支和owner/Boss等价，不把这些断言称为另一个完整墙求解器。

五类实际源壳变异必须被拒绝：不消费、错误秒单位、先加重力、重复位移、宠物命中先于怪物物理。此处是原函数/观察口变异，不是未来生产源码变异；236还必须对真正实现运行同类负向门禁。正常源再次生成的全部确定性行一致；真实时钟时间戳不要求逐字节一致，但自然覆盖结论逐次断言。

现代诊断再次复现 HP 200→193、事件(6,-5)、x始终300，下一帧 y=420.6666666666667/vy=40。该样本只有共享函数链，没有启动场景，不能证明浏览器手感。236须完成五关与TestScene实际怪物、P1/P2、重复命中/冻结/边界/飞行/重试退出的确定性检查及940×590可见轨迹；未完成前M-030/032/042、VS-067、猴马原84公共责任与整线状态都不提升。


## 236实际消费与验证（2026-09-26）

生产由 `MonsterKnockbackSystem` 消费237的实际类型、动作谓词和217墙；`MonsterKnockbackBinding` 附着原有每实体owner，保留Point原host单位、Sprite twip写入、毫秒Tween、边界旧Tween和实体释放。`MonsterPhysicsSystem.updateCombatMonsterPhysics` 是既有physics配对入口，未受宠物击退前保留既有移动；受击后同一实体只有一条位移路径，不遍历damage audit重放。Stage12 registry、Stage13/21/22 Map及TestScene实际Monster30分别接线，未新增全局实体注册表。

原生pet host成功结算排入早入口，在本次monster物理之后提交；旧猴马兼容弹体成功结算立即提交晚入口。拒绝/闪避/去重仍由既有结算owner处理，0伤害也消费合法字典；无字典与零向量字典不同。`PetProjectileKnockback` 保留raw/direct/velocity三种源方向，玄龟原direct不借用可强制镜像的render-facing。TestScene facade只转发binding和HP，运动写回真实模型；Monster3只核销旧弹体实际可达入口。

- 237源探针在本任务修正完成Tween被force反复写末值的错误，8源变异（新增force-endpoint）拒绝，正常恢复重复一致，Schema八反例拒绝；完整JSON8,918,937字节。原237完成记录的七变异/旧字节数是历史结果，不是本批最终输入。
- `monster-knockback-tests`：124650原生受控/五关墙运动态，Sprite坐标/接触/动作精确相等，Point只允许1e-8数值比较误差；不放宽twip边界。
- `monster-knockback-binding-tests`：5184原生状态经真实hit/physics端口，12类型、20/24/30host、1/2/4渲染分片、P1/P2；另测早晚入口、保护/闪避/去重、0伤害、新ID覆盖、边缘旧Tween、缺字典、释放和AI恢复。432原方向记录另由本地230源报告比较。
- `run-monster-knockback-mutations.mjs`：8类真正生产代码变异全部拒绝，包括无消费、错误单位、早入口提前、重复位移、漏清理、完成Tween重复写、边缘取消旧Tween、错误direct。
- 五关真实应用使用本地观察构建运行，不替代scene/physics；夹具仅推进英雄、注入0伤害结算，并对2-2已有Boss展示取消QA冻结以进入生产update。自然原生弹体及夹具P1/P2均记录；五关模型/显示逐帧同步与真实restart/返回SaveSlot释放通过。JSON及验证汇总位于 `docs/tasks/evidence/TASK-SLICE-236/`，940×590画布截图 `stage22-visible.png`。截图不单独充当轨迹或原版UI一致性证明。

AI交接修正限于现有owner的意图：进入攻击范围/无目标清追击方向；Monster30在既有hurt结束后恢复原有现代hover并同步motion，避免首次受击后永久禁用。不得把Tween的400ms等同身体恢复时点；当前hurt180/250ms、Boss反击、完整身体回调、死亡/奖励、自然AI目标组合仍未原版化，继续交231/232。未受击既有速度/物理也不因本任务获原版一致性结论。原84仅回填公共击退责任；猴马完整家族、204/all、VS-067与功能线均不关闭。

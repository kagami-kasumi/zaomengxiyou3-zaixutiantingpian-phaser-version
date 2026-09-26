# 宠物命中后的公共怪物击退合同（230）

范围：原版 1.1 的宠物弹体 → `BaseMonster.beMagicAttack` → `BaseObject.setAttackBack/step`，以及当前五关/TestScene 的消费缺口。本文不宣称现代击退、完整怪物动画、死亡或整族玩法已复现。

## 可复验输入

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

## 现代消费交接（236）

| 入口 | 现有 owner/位置 | 已确认事实及所需接线 |
| --- | --- | --- |
| 原生host宠物弹体 | `src/systems/PetProjectileCombatSystem.ts:38` → `Stage1CombatSystem.ts:479` | 接受/去重、HP、hurt、事件由现有 combat owner 持有；速度仅写 DamageEvent。击退应从成功结算单次转交运动 owner，不能另建 HP/去重副本 |
| 旧猴/马弹体兼容入口 | `PetMonkeyCombatSystem.ts:114-150`、`PetHorseCombatSystem.ts:204-248` → 同一 `resolveStage1PetHit`；`HeroPartyRuntimeBridge.ts:321-340` | `resolveAttacks`在物理之后调用；两者显式跳过`petHostTick !== undefined`的新路径。晚阶段接受的新id必须核对，但不据代码存在宣称当前正常新宠物会走旧路径；remainingHits/recordProjectileHit仍由原弹体owner处理 |
| 共享物理 | `src/systems/MonsterPhysicsSystem.ts:34` | 只处理 y/2400重力/顶面落地，飞行直接 return；没有 vx/tween/完整墙/源相位消费。既有物理模块是共享接缝，不能只把 event 值写到 velocityY 后宣称闭合 |
| Stage1-1/1-2 | `MonsterRuntimeRegistrySystem.ts:64`、`src/scenes/MonsterRuntimeRegistryBridge.ts:53` | 每个 registry entry 已有 combat/physics 同一配对。出生默认 grounded/100 须按类型接已有定义，不能让飞行沿默认地面路径 |
| Stage1-3/2-1/2-2 | 各 `Stage13/21/22GameplayBridge.ts` 的 create/updateMonsterCombat | 当前自有 Map 持有配对，复用同一个共享消费方法；不为本任务强制迁移整套 registry 或复制三套规则 |
| TestScene | `TestSceneWorldBridge.ts:112`、`TestScenePetEnemyAdapter.ts:29`、`Monster30System.ts` | adapter 的 x/y 只有 getter，HP setter落真实模型；没有速度写回。必须让实际 Monster30 模型消费击退，不能写 facade 临时字段。Monster3 arena为另一 owner，只验证其实际可达宠物入口；没有入口不能伪造一条作通过证据 |
| 每帧实际顺序 | `HeroPartyRuntimeBridge.ts:283,419`；各 GameplayBridge heroes.update在monster update之前 | **现代原生host宠物命中早于怪物物理**，与原世界顺序相反；兼容旧弹体入口则在物理之后。实现要有明确待消费相位/队列或等价调度，分别记录早/晚入口，既保证下一原host步，又不重复应用或给晚入口多延迟一帧；不得简单把当前调用顺序当原版 |

没有全项目唯一怪物实例 owner：共享模块、registry配对、各 Map 和 TestScene 模型都是现有真实入口。236应保持每实体唯一状态与共享算法，不能用“统一owner”口号扩成怪物架构线010A/B。

输入清单：成功攻击身份、弹体原类型/方向或已确认的带符号原速度、源 host fps/相位、世界到屏幕矩阵、colipse/墙输入、当前动作/受击与禁移动状态、生命周期有效性。输出应写回该怪物真实 x/y/速度，供同帧碰撞、目标投影和显示读取。不同次命中覆盖与边界旧 tween行为必须可测；退出/重试清理 pending与tween，不能串实体或slot。

## 验证结论和边界

27,000原生运动态（1,080组）及432方向输入通过；14入口、4重复/拒绝链、4世界调度状态和3真实计时覆盖模式通过。独立解析式核对自由运动、Point速度、Sprite twip赋值、飞行后处理；墙全轨迹来自原方法，独立断言覆盖接触/marker分支和owner/Boss等价，不把这些断言称为另一个完整墙求解器。

五类实际源壳变异必须被拒绝：不消费、错误秒单位、先加重力、重复位移、宠物命中先于怪物物理。此处是原函数/观察口变异，不是未来生产源码变异；236还必须对真正实现运行同类负向门禁。正常源再次生成的全部确定性行一致；真实时钟时间戳不要求逐字节一致，但自然覆盖结论逐次断言。

现代诊断再次复现 HP 200→193、事件(6,-5)、x始终300，下一帧 y=420.6666666666667/vy=40。该样本只有共享函数链，没有启动场景，不能证明浏览器手感。236须完成五关与TestScene实际怪物、P1/P2、重复命中/冻结/边界/飞行/重试退出的确定性检查及940×590可见轨迹；未完成前M-030/032/042、VS-067、猴马原84公共责任与整线状态都不提升。

# Monster2 身体、攻击与聚拢控制行为合同

`TASK-SETTINGS-256`，2026-10-04。仅完成 Monster2 有界行为证据；不代表空间/像素、真实 HP、Tween 插值或现代实现完成。行为 sidecar：`reference/monster2-body-attack-contract.json`，`contractId=task-settings-256.monster2-body-attack`，状态 `verified-bounded-behavior`。原生运行是游戏随包 **AIR 51.1.1.5**；SDK 51.3.4 只用于编译/启动，不称为旧 Flash Player 实测。

## 待证明问题与结论

- 普攻究竟有几个伤害对象？`hit1` 身体持帧 `[2,2,15,16]`，从动作初始状态起第5、20个 host 步分别创建 `Monster2Bullet1_1`、`Monster2Bullet1_2`；均为独立 `SpecialEffectBullet`，动作均为 `hit1`，间隔999。不是一次 active 窗口，也不是两次重画。
- `hit2` 是否造成魔法伤害？身体持帧 `[2,2,2,14]`，第7步只创建裸 `Monster2Bullet2`，随后对 `Config.getPlayerArray()` 返回的英雄请求一秒 Tween。此分支没有登记弹体或调用伤害。构造字典里虽然存在 hit2 的 power28/interval4/fix，不能据此创造一个没有 producer 的伤害弹体。
- 首末检测如何排队？原 PhysicsWorld 先处理已有弹体，后推进身体；新对象下个世界步第一次查询，此时原 MovieClip 仍为第1帧。普攻自然序列第6/21步首次查询，第19/40步查询末帧后销毁。
- 死亡和显式销毁有何不同？默认 hurt/HP死不删除已发弹体，但中断身体后续发射；显式 destroy 清登记弹体。裸 MovieClip 不受该清弹循环影响，原 frame14 在 EXIT 前执行 removeChild/stop，自行消失。
- 暂停会冻结所有效果吗？原 `MainGame.stopGame/continueGame` 只遍历登记弹体子树并调用 Tween 全局暂停/恢复。裸 MovieClip 不在登记列表，暂停时仍推进并自移除。不得用整个场景递归 stop 替代原调用范围。
- 自然技能如何选择？初始 CD=1×fps，释放重置5×fps；严格欧氏距离<500，技能先于普攻。CD在决策之后递减，忙态/受伤不暂停该递减；ready才返回。普攻每 `count % fps == 0`，水平距离≤250，再用原普通攻击概率。技能不自动面向目标，普攻会面向目标；不使用现代 attackSerial 奇偶轮换。

## 六段证据链

以下 AS3 相对路径以 `local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts/` 为根。完整文件/方法 SHA、locator、实际消费者 SHA 见 sidecar `/sources`、`/staticSources`、`/modernConsumers`。

| 合同 | 局部与共享证据 | 空间/视觉证据 | 等级、未知与反证 | 验证及现代映射 |
| --- | --- | --- | --- | --- |
| M2-01 身体先效果 | `export/monster/Monster2.as:83/111/183`；`BaseObject.step:165`、BBDC.step:461 | 本项只验证动作行/列和持帧；不是身体位图投影 | 交叉确认；effects-first/repeat-spawn拒绝 | 648场景；Stage12需身体先效果，不能先读dead吞掉已到期回调 |
| M2-02 两独立普攻 | Monster2:229/248；BaseBullet.setRole/setAction；SpecialEffectBullet.step | 同父gameSence注册根复制，方向0偏移(+75,-100)/(-90,-35)，方向1反号；完整矩阵未知 | 交叉确认；display-only/wrong-offset/wrong-direction拒绝 | 只冻结行为根运算，不能用偏移/外包框代替碰撞真值 |
| M2-03 世界与末帧 | PhysicsWorld.step:489..522；BaseBullet.step2:105/checkAttack:224 | 恢复assets/1.swf character49/34，14/20帧；实时ENTER/world/EXIT | 交叉确认；same-tick-hit与相位损坏拒绝 | 下一世界步帧1；检测末帧后清理parent/source/数组 |
| M2-04 死亡/中断 | BaseMonster.reduceHp:1433/destroy:751；Monster2.scriptFrameOverFunc:156/destroy:305 | 身体dead持帧[2,2,2,2,2,7]；淡出插值未执行 | 交叉确认（销毁清弹前缀及Monster2覆写）；death-clears/destroy-keeps拒绝 | 火焰致死/非致死、hurt、冰冻、前置与发射后清理；奖励/UI/淡出不是本次关闭范围 |
| M2-05 聚拢请求 | Monster2.doHi2:267；Config.getPlayerArray:1122 | 受控根复制(-35,-80)/双向；Tween终点source x/y-50；不是轨迹真值 | 交叉确认（请求服务）；tween-duration/tween-target拒绝；插值/冲突未知 | 96原玩家列表例；只选非空且!isDead的P1/P2，不选宠物，ready本身不排除 |
| M2-06 裸对象结束 | 恢复assets/1.swf `Monster2Bullet2` char30，原ABC `addFrameScript(13,frame14)` | 原生第14帧脚本removeChild/stop；第21步ENTER/world仍挂载，EXIT移除 | 交叉确认；覆盖自然、源致死、显式destroy、暂停；raw-no-remove运行变异拒绝 | 不持有BaseBullet/sourceRole；源销毁不替代原时间轴结束 |
| M2-07 暂停与退出 | MainGame.stopGame:620/continueGame:674/destroyGame:721；BaseHero.destroy:2386 | 暂停原方法与原MC实测；Tween为记录调用的服务，不证明实际插值 | 暂停作用域交叉确认；pause-raw拒绝；退出killAll(false)仅静态确认 | 不因world停而冻住裸视觉；源/英雄destroy未发现杀该英雄Tween的调用，实际库行为仍未知 |
| M2-08 自然选择 | Monster2构造:12/beforeSkill1Start:217/releSkill1:222/myIntelligence:297；BaseMonster.step:305/__added:149/hasAttackTarget:564 | 距离为源同父根欧氏运算；真实路径/墙体不在本域 | 交叉确认；9编译决策变异拒绝 | 1764例/27936态；保留一次未使用random的消耗、技能优先/CD末相位 |
| M2-09 传送门与清理 | Monster2.destroy:305，实际扫描Monster4存活；PhysicsWorld ready清理 | 门只观察visible，不验证门UI/关卡胜利全流程 | 交叉确认（6门例）；活Monster4或非boss不得开门 | 后续保留现有flow owner，禁止把source HP零当成全部清理完成 |

所有适用空间、完整显示列表和像素输入仍属下一项；本项纯行为sidecar不套UI Schema、不晋升视觉manifest。六段中现代映射为实际消费缺口，双重验证为确定性原方法断言与真实原生时钟观察，**不是现代正式场景验收**。

## 时钟与服务边界

| 样本 | 普攻首次/末次 | 裸视觉 | 使用边界 |
| --- | --- | --- | --- |
| 同步受控原方法 | fixture下步主动goto第2帧；自然末次第18/39步 | 无真实事件时钟，停留第1帧；即使源destroy也仍在parent | 仅用于hurt/dead/ice/数组/服务请求分支，不作生产时钟 |
| 原生ENTER/world/EXIT | 第6/21步帧1开始；第19/40步末帧检测后删除 | 第7步出生，第21步到14帧，EXIT自移除 | 真实MovieClip时序输入；20/24/30三档相同host步关系 |
| 原暂停3步 | 登记弹体末次延后至22/43；第二次发射延后至23 | 保持第21步EXIT移除，未延后 | 原stopGame/continueGame方法；Tween pauseAll(true,true)/resumeAll只验证调用 |

目标 `beMagicAttack` 是接受/拒绝计数服务，`getRealPower` 是明确桩，不能由调用次数推算真实HP、暴击、防御、保护或像素命中。原数据字典的power29/28是声明输入，未用桩的15当作原伤害。冰火到期由fixture注入；不把该样本外推为完整效果时长。自然决策执行源构造、__added、AI/CD/目标选择/朝向方法，固定根及random输入；物理位移、追踪墙体和完整场景仍未验证。

原Config会过滤死亡英雄，因此聚拢请求只针对释放时仍存活的英雄。已请求后英雄死亡、移动输入与Tween竞争、连续聚拢覆盖、默认ease、计时量化和暂停恢复插值均保留unknown。`MainGame.destroyGame` 的 `killAll(false)` 和英雄/怪物destroy的调用审计只有静态证据，不能改写为已运行完整退出旅程。

## 现代消费者与剩余输入

| 实际消费者 | 当前行为与缺口 |
| --- | --- |
| Stage12Scene → MonsterRuntimeRegistryBridge/System | Registry仍调度Monster2通用combat，再同步视图并交party接收；没有Monster2独立攻击owner/聚拢owner |
| MonsterDefinitionCatalog.ts:24 / Stage1CombatSystem.ts:294..420 | Monster2只声明hit1物理29与现代距离/毫秒窗口；非3/30路径仍靠activeAttack及横向范围，没有原两弹生命周期、原500技能选择或Tween |
| Stage12MonsterVisualSystem.ts:142..147/215..221 | 以serial奇偶选择hit1/hit2；发射显示tick已有5/20/7，但不能据此认定原技能选择或伤害成立 |
| Stage12MonsterVisualBridge | 攻击Image独立显示/清理，既不是BaseBullet伤害实体，也不是控制英雄坐标的Tween |
| HeroPartyRuntimeBridge.ts:347..374 | 已有英雄/宠物接收owner可复用；必须补Monster2实际producer、目标profile与HP证据，不能复制新的HP owner |

已归并Luna只读审计并复核源/消费者。纠正其“身体第2/3行”表述为动作内零基列 `Point.x=2/3`；其裸MC末帧/暂停未知已由本次原生实测解除；Tween插值未知保留。原Monster3/30完成结果只作现代接缝参考，不替代Monster2源证据。

## 验收、复验与保留

- 身体：648例、45,360态；两动作×双向×P1/P2/双方×20/24/30×18场景；19类编译反证中的10类验证身体/生命周期/请求。
- 自然选择：1,764例、27,936态、1,344决策；boss/普通构造、三难度概率边界、500与250阈值、纵向距离、忙态、CD=1、冻结/恢复、死亡/ready目标；另9类编译反证。
- 原生：3,456个三相位状态、246个真实checkAttack入口；自然/致死/暂停/显式destroy，三档fps。2类原生运行变异（扩大暂停作用域、移除原frame14脚本）拒绝；后者为已加载原MC的脚本替换，不冒称源码字节变异。
- 玩家列表96例、Boss门6例。正常身体/决策及原生序列各独立重复完全一致；7类报告损坏拒绝。编译/运行失败不算语义反证。
- 初次并行AIR重复app id产生转发失败，后改为每fixture/变体独立id并完整重跑；初次roster未开debug导致trace被编译器省略，修正后重跑。没有把这两次失败计入反证。

复验命令：

```text
python tools/monster2-source/capture.py
python tools/monster2-source/selection.py
python tools/monster2-source/identity.py
python tools/monster2-source/phase.py
python tools/monster2-source/phase.py pause-raw
python tools/monster2-source/phase.py raw-no-remove
python tools/monster2-source/roster.py
python tools/monster2-source/validate.py
python tools/monster2-source/validate_native.py
python tools/monster2-source/finalize.py --check
```

首次生成用 `finalize.py` 无参数。输入与fixture未变时，两个validate支持`--existing`复核保存结果；不代替首次真实变异与重复运行。完整trace/编译源位于 `local-resources/regima/task-outputs/TASK-SETTINGS-256/`，摘要和JSON位于 `docs/tasks/evidence/TASK-SETTINGS-256/`。它们是后续复验输入，保留至Monster2正式消费完成再评估清理；Git交付tools、本文与精简reference，游戏运行不依赖本地证据。

下一项 `TASK-SETTINGS-257` 补Monster2三对象空间/显示及聚拢Tween的运行投影输入，随后才可生成有界实现任务。若Tween引出独立共享接收机制，按257拆分触发另行冻结，不能扩大本行为任务。232其他10类型静态清单、Role4人偶、未迁移家族、完整公共责任、204/all/194/VS-067与整线仍未关闭。

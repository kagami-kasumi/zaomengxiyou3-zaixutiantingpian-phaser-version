# Monster3 身体与两个独立攻击合同

`TASK-SETTINGS-247`。仅闭合 Monster3 的有界行为证据，不修改现代游戏代码。机器行为 reference 为 [monster3-body-attack-contract.json](reference/monster3-body-attack-contract.json)，`contractId=task-settings-247.monster3-body-attack`、`status=verified-bounded-behavior`。攻击像素/显示列表真值仍缺失，下一项 `TASK-SETTINGS-248` 补证；本文件不是可直接宣布完整视觉或伤害复现的输入。

## 待证明问题与结论

1. 两种攻击何时发射、首次何时查询目标？从动作初始状态逐次调用源 BBDC，hit1 第7步、hit2 第6步生成；新弹下一世界步才查询。真实 MovieClip 在首次查询时仍是第1帧。
2. 出生点是否随源运动？源 `doHi1/doHi2` 复制同父坐标加方向偏移，之后源移动不牵动攻击根；二者没有设置 followObject。
3. 一次攻击能否多次命中？hit1 间隔999，hit2 间隔4。目标接受服务下，hit2 在检测序号1/5/9调用英雄及其宠物；这不是最终 HP 损失或真实像素命中次数。
4. 火焰同帧致死是否吞发射？身体先于效果，所以已到回调的攻击仍生成。HP 死亡、默认 hurt、源身体冻结不清已发出的弹体；显式 destroy 清理。
5. 暂停、数组与 parent 如何收口？正式 MainGame 暂停停世界监听并停止已有弹体子树；恢复两者。世界循环在身体后再次检查 ready，并在同一步移出怪物。弹体末帧先检测再销毁，parent/source 引用随 destroy 清空。

## 六段证据链

AS3 路径基于 `local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts/`。下表行号以本次源哈希为准；方法与文件 SHA-256 全集由 reference `/sources` 自动记录。

| 合同 | 局部与共享证据 | 几何/坐标证据及等级 | 反证、验证与现代映射 |
| --- | --- | --- | --- |
| M3-01 身体与效果顺序 | `Monster3.as:103/132/215`；`BaseBitmapDataClip.as:461` enter→hold/换帧→exit；`BaseObject.as:165` 身体→运动→效果 | 行4/5持帧表为代码行为输入，不声明身体位图投影；交叉确认 | effects-first、repeat-spawn编译变异被拒；现代Boss与Stage13均须保留回调先行 |
| M3-02 两出生路径 | `Monster3.as:241/272` 两个SpecialEffectBullet；`BaseBullet.as:469`方向；`SpecialEffectBullet.as:15`未设置follow则无位移 | 同父`gameSence`注册根，加源代码有符号偏移；不是裁片左上角。受控坐标与双方向交叉确认，完整嵌套矩阵未知 | wrong-offset/wrong-direction拒绝；只可消费行为偏移，不能由此构造矩形碰撞 |
| M3-03 世界首次检测 | `PhysicsWorld.as:489..522`先已有弹体step2/清理再怪物step；`BaseBullet.as:105` | 恢复assets/1.swf真实MovieClip联动，首次查询第1帧；交叉确认 | same-tick-hit拒绝；native before-world/after-world/EXIT三相位明确，不用现代画帧推原版 |
| M3-04 去重与目标服务 | `Monster3.as:24..38`；`BaseBullet.as:225..378`候选、ID、间隔、英雄后宠物；`BaseHero.as:1208/1227`与`BasePet.as:566/585`真实入口 | 两攻击character70/74可见时间轴身份确认；真实colipse像素/受伤公式未在fixture执行 | wrong-interval拒绝；双owner、两owner同时、接受/拒绝服务覆盖。Boss矩形及Stage13横向范围均非像素真值 |
| M3-05 死亡与销毁 | `BaseMonster.as:1433`reduceHp；`Monster3.as:188/303`dead完成、super.destroy、boss传送门；`BaseMonster.as:751`清弹；`BaseBullet.as:403`清parent/source | 同帧致死/非致死、发射前后hurt/dead/destroy已交叉确认；身体一秒Tween淡出不在此fixture | death-clears/destroy-keeps拒绝；只验证销毁前缀与Monster3覆写，不宣称完整奖励/UI/Tween |
| M3-06 冰火 | `BaseObject.step`、`BaseAddEffect.step`的PETMONKEY_FIRE片段、show/hide_pethorse_ice原方法 | 冰冻前置、效果相位解冻、发射步加冰为受控输入；交叉确认 | 显式注入效果到期，不宣称效果全时长/视觉。保留已发对象独立更新 |
| M3-07 暂停 | `my/MainGame.as:632..718`移除/恢复ENTER监听、stop/start弹体子树；`BaseBullet.step2`底层isStopGame分支 | 原MovieClip三fps自由与stop/play；原方法在实时ENTER/EXIT联动，交叉确认 | 仅跳过world、仅设底层flag、正式暂停式停子树分别列证；非完整菜单操作 |
| M3-08 重入/清理 | BBDC enter及refresh接缝、PhysicsWorld.clearWaitFromParentArray | 只读重画不调用enter；动作结束后第40步重入；交叉确认 | display-only/repeat-spawn拒绝；不能将持帧、重绘或受击动作当新弹 |

## 原方法执行与独立预期

入口：`python tools/monster3-source/capture.py`、`python tools/monster3-source/timeline.py`、`python tools/monster3-source/phase.py`、`python tools/monster3-source/verify_phase.py`、`python tools/monster3-source/verify.py --mutations`。

- 编译器/启动器来自本机 AIR SDK 51.3.4；实际运行使用原解包 **AIR 51.1.1.5**，不是旧Flash Player实测。源Monster3 SHA-256为reference中自动计算的`3e094ce63f532cd906f5262e071fa5c33ddaa7414742d9b502f6dd8ed3774629`。
- `capture.py`复用232的明确服务壳，但覆盖为实际Monster3方法、源构造攻击参数、源initBBDC持帧表、SpecialEffectBullet.step与Monster3.destroy；执行来源中不保留Monster30。源原文件和恢复SWF不修改。
- 648组＝3fps×2攻击×2方向×3目标配置（P1/P2/双方）×18场景，每组70步，共45,360态。目标分别带自己的宠物；目标拒绝时原checkAttack每步重新调用服务，未误登记命中ID。
- 18场景：自然、发射步致死/非致死火焰、发射后hurt/dead/destroy、前置冰冻、效果阶段解冻、发射步加冰、暂停、只读重画、底层暂停、发射前dead/destroy/hurt、显式hurt-cut、完成后重入、目标拒绝。hurt-cut是低层可配置对照；Monster3默认未启用，不能写成原怪默认规则。
- 独立verifier从源持帧和调用链推导有限预期，不导入AS3生成算法；核对出生、方向、稳定根、英雄/宠物调用顺序、源死亡标志、逐步累计命中、数组移除、parent/source、boss门与世界清理。target.beMagicAttack为可接受/拒绝服务，`getRealPower`及移动/AI/奖励/墙体/UI/Tween为明确stub，不证明真实HP和自然追击。
- 九类真实编译源变异必须成功编译运行后改变观察并被拒：效果提前、只显示不入数组、HP死清弹、持帧重复发射、destroy不清弹、新弹同次检测、出生偏移错、方向错、hit2间隔错。另有四报告损坏、四reference字段损坏和三native相位损坏，分别计数，不冒充源变异。

## 受控帧与真实时钟必须分开

`timeline.json`由恢复SWF的SymbolClass/DefineSprite和288次真实ENTER_FRAME采样交叉确认：Monster3Bullet1 character70为5帧，Monster3Bullet2 character74为10帧；自由播放循环，显式stop保持，play后续进。此处仅确认时间轴身份/帧数，不是完整显示列表与像素投影真值。

`phase.json`在实际stage上运行同一原方法世界循环与真实攻击MovieClip，3fps×2攻击×正常/同帧致死/正式暂停式子树控制，30帧×before-world/after-world/EXIT，共1,620态；另记录135次真实checkAttack入口。

| 输入类型 | 发射与首次检测 | 末次检测/清理 | 使用边界 |
| --- | --- | --- | --- |
| 实时原MovieClip联动 | hit1第7步/hit2第6步发射；下一步检测第1帧 | 无暂停时hit1第12步、hit2第16步检测末帧后清理；暂停3步相应后移3步 | 生产时序输入，reference `/nativePhase` |
| 显式帧输入的大场景矩阵 | 出生同上；fixture下步主动提供第2帧 | hit1第11步、hit2第15步清理 | 仅受控行为分支，不可覆盖实时phase或据此删去末帧检测 |

这是一种输入相位差，已显式保留；不能将大矩阵的结束tick套到生产MovieClip。hit2真实检测第1/5/9帧的服务接受，与末帧第10帧的去重检查分别记录。完整场景自然AI/镜头/碰撞及正式游戏菜单没有运行，不声明通过。

## 现代消费者与缺口

| 消费者 | 当前精确路径 | 剩余责任 |
| --- | --- | --- |
| Stage1-1/TestScene Boss | `TestSceneBossArena.ts:58` updateMonster3；`:137` applyBossAttack；`Monster3System.ts:61..80/263`矩形/毫秒窗口；`LevelSystem.ts:55`创建 | 存在两攻击activeAttack，但无源独立对象语义；矩形命中、单ID去重、源死亡清理、真实宠物承伤与boss门时点需后续消费 |
| Stage1-3普通Monster3 | `Stage13Layout.ts:80..95`的五生成点；`Stage13GameplayBridge.ts:201..212`物理→效果→通用combat→view→party；`Stage1CombatSystem.ts:358`非30仍依赖phase/activeAttack | 类型3走通用owner；不能仅迁移专用Monster3System而漏掉此消费者。`Stage13MonsterVisualBridge.ts:78`按attackSerial奇偶选hit2，不能证明真实hit2技能决策/伤害已接通 |
| 显示共有桥 | `Stage11MonsterVisualBridge.ts:58/65..67`本体及两攻击资源；Stage13复用该桥 | 原显示资源存在，不代表独立伤害对象存在；现代矩形宽高和800ms不是原版证据 |

已归并Luna只读发射/消费者报告，主agent复读上述源码并用LSP核对updateMonster3调用。其原始“仅TestScene专用owner”结论保留，但Stage1-3通用consumer必须列入后续，不能因未调用createMonster3而排除。

## 未知、下一项与交付边界

`TASK-SETTINGS-248`只补两个攻击的显示列表、注册点/双方向/逐帧原生基准、实际英雄与宠物colipse像素命中、与本次真实phase的绑定。沿用已核实目标profile必须验证构造/哈希适用，不以241 Monster30攻击像素或218宠物攻击反推本攻击。

本次纯行为sidecar不用UI Schema伪装完整几何。坐标只证明受控注册根运算；未生成完整空间manifest，也不提升原几何/现代碰撞状态。补证后再生成有界实现合同，覆盖两条owner和真实HP/生命周期；尚未实现的其他10类型、人偶、原226其余公共责任、完整家族、204/all/194/VS-067及功能线仍未关闭（247前“其他11类型”包含Monster3；其现代消费仍未完成）。

本地原始日志/trace/编译fixture：`local-resources/regima/task-outputs/TASK-SETTINGS-247/`；本地摘要、source-baseline、九变异、timeline、phase与repeat：`docs/tasks/evidence/TASK-SETTINGS-247/`。这些是后续复验输入，暂不清理；后续Monster3消费验收完成再按生命周期规则评估。Git交付工具、本文与精简reference，游戏运行不依赖本地证据；换机源级复验仍需本地语料、AIR和FFDec。

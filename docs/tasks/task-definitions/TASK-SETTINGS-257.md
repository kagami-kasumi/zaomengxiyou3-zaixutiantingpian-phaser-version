# TASK-SETTINGS-257

任务类型：`TASK-SETTINGS`

任务模型：`逆向任务`

逆向子类型：`视觉真值逆向`

逆向方案：`docs/reverse-engineering/plans/ground-truth-fine-grained-generation.md`

功能条线：`LINE-PRE-STAGE-2-3-PRESENTATION`（Active）

目标机制/切片：`M-030`、`M-034`、`M-042`、`VS-067`

要解决的问题：256已闭合Monster2有界行为，但三对象只有Symbol/帧数/原生结束相位，缺逐帧显示树、实际英雄/宠物像素命中，以及聚拢Tween实际轨迹/暂停/覆盖的输入。现代奇偶视觉与activeAttack不构成这些原版事实；在补齐前不能直接接生产玩法。

规模预算：
- 主工作包：2（三对象递归空间/显示与两普攻碰撞输入；聚拢Tween原运行投影及交接）
- 预计上下文压缩：0
- 独立验收批次：2（原空间/显示与相位核对；原Tween有限轨迹/生命周期与消费者缺口）

拆分触发：
- Tween引出新的公共英雄坐标/受控接收机制，或原库反编译不能直接执行而需独立修复/重建时，保留未完成输入、另设同线有界代码补证，不研发新引擎、不以手写ease代替原库。
- 目标profile复核发现新构造/受击分支，或原像素残差超出可解释域时，冻结当前已证范围并生成同线补证；不扩大为其他怪物/完整家族/全人物空间全集。

协作计划：
- 模式：主agent + 有界subagent。
- 模型分工：主agent负责原生提取/规范化；Luna只读审计实际目标profile与Tween调用范围。
- 并行工作包：主agent采样时核对256未知项、已有241/248目标profile的源hash/构造适用性，返回证据/未知/反证。
- 写入 owner：主agent。
- 归并检查点：真值晋升前。
- 方法观测：无。

待证明的可观察问题：
- 两普攻14/20帧与裸MC14帧的递归显示树、双向注册点、mask/filter、屏外完整性是什么？
- 两普攻在256真实checkAttack相位对实际P1/P2英雄及宠物colipse的像素命中是什么？拒绝/末帧/源死后不能由矩形或可见身体替代。
- 一秒聚拢的默认ease/量化、暂停恢复、两次请求覆盖、玩家移动冲突、英雄死/源destroy/Scene退出分别怎样影响轨迹？不把API请求sink当坐标结果。

有限范围、入口与fixture：
- 原版再续天庭1.1恢复包，舞台940×590；Stage1-2 Monster2的hit1与hit2入口，20/24/30 host档。
- `assets/1.swf`：Monster2Bullet1_1 character49/14帧，Monster2Bullet1_2 character34/20帧，Monster2Bullet2 character30/14帧；不扩大完整身体atlas审计。
- 三对象双向，原生出生/首检测/末检测/EXIT移除、普通/暂停恢复/源hurt/dead/destroy；精确绑定256 `/nativePhase`，不能套同步goto输入较早结束tick。
- 两普攻目标为P1/P2实际英雄及当前宠物受击profile；按源构造确认241/248既有profile适用后复用目标，枚举帧×方向×目标构造×边界坐标。采样前冻结有限坐标域，不根据现代通过率缩域。
- 聚拢分别P1/P2/双方，alive/dead/ready过滤沿用256；初始水平/垂直差、1秒终点、暂停中间/恢复、第二次聚拢、英雄移动/死亡、源destroy与退出。原库时间输入可控则精确重放，否则明确真实采样时刻/抖动及未解项，不伪称固定帧Tween。

输入资料：
- `docs/workflow/reverse-engineering-protocol.md`、`docs/workflow/reverse-engineering-task-protocol.md`及本定义唯一逆向方案。
- `docs/reverse-engineering/monster2-body-attack-contract.md`、`reference/monster2-body-attack-contract.json`及`tools/monster2-source/`。
- `docs/reverse-engineering/evb-extraction-report.md`、`docs/reverse-engineering/asset-annotation/workflow.md`、`ground-truth/README.md`与UI Schema。
- `local-resources/regima/source/restored-swfs/assets/1.swf`、实际colipse所属恢复包，以及256明确调用的Monster2/BaseBullet/BaseHero/BasePet/Config/MainGame/TweenMax及其实际依赖。
- 241/248仅复用经源hash/构造复核的目标profile与工具；Monster30/3攻击像素及已批准碰撞残差不适用于Monster2。
- Stage12/Registry/Stage1Combat/HeroParty及现有英雄位置owner，只作消费者映射，不修改src。

输出产物：`docs/reverse-engineering/monster2-attack-space-contract.md`；`docs/reverse-engineering/ground-truth/manifests/monster2-attack-space.json`（truthId=`task-settings-257.monster2-attack-space`）；原生独立基准/碰撞/轨迹、可重复工具与反证；Tween有限行为sidecar；明确消费者及唯一同线后续任务。原始产物保存`local-resources/regima/task-outputs/TASK-SETTINGS-257/`，报告保存`docs/tasks/evidence/TASK-SETTINGS-257/`。

完成定义：按唯一方案与六段证据链生成三对象verified逐状态空间/显示真值、两普攻实际colipse命中和原Tween有限运行投影输入，字段/来源/完整性/独立原生交叉验证齐全；实现所需未知未清零则拆分/阻塞，不生成无阻塞实现合同。

UI 原生化合同：
- 显示列表清单：三根逐帧/双向递归到实际叶节点，保存原字符/父子/depth/矩阵/注册点/滤镜遮罩；无菜单按钮/文字者明确不适用。
- 原版机器真值 JSON：上述truthId/manifest按UI Schema生成，所有原生状态可追溯；Tween纯行为数据独立sidecar，不滥用UI字段。
- 原版视觉基准：恢复SWF原生AIR直绘，940×590舞台及明确裁切/屏外包络，逐状态PNG/hash，不用现代图片反推原版。
- 允许的现代视觉例外：初始空；仅按用户长期授权如实记录轻微像素/抗锯齿/颜色舍入，碰撞布尔/伤害/时序不得套视觉容差。
- 逐状态验收：双向、P1/P2目标、出生/首次/末次/暂停/恢复/死亡/销毁/EXIT；hover等业务UI状态不适用。
- 差异证据：独立原生与候选投影逐状态像素/边缘、完整显示树差异；真实HitTest对比，失败及域外边界保留。

验收标准：
- 保留256全部M2-01..09及未知清单，原裸MC暂停继续/EXIT移除不可被统一弹体模型抹平。
- 显示、碰撞、Tween各自记录源hash/locator、有限状态域、重复稳定结果与实际源/运行变异；Schema或编译通过不能代替事实验证。
- 真正原库或已验证原ABC执行生成Tween轨迹，未知冲突不得以默认现代ease猜补；HP接收若仍未知，明确建立同线代码补证而非宣称生产就绪。
- 工具/精简必要数据随Git交付，本地原基准独立保留；不依赖ignored报告运行游戏。
- 运行check:workflow、适用真值Schema检查与audit:problems，更新覆盖台账；不提升其他类型、204/all/194/VS-067或整线完成度。

禁止范围：不实现Monster2，不改src/public或原提取结果，不扩其他类型/完整家族，不用Monster3/30容差、不新增现代可见替代层。

状态更新：Ready（2026-10-04；256完成后承接其明确空间/显示及Tween投影未知）。

推荐后续任务：依本项实际证据生成唯一同线Monster2有界实现；若真实HP或Tween公共分支仍缺输入，先生成相应代码补证，不越过verified门禁。

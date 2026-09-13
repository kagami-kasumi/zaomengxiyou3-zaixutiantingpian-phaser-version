# TASK-SLICE-214C2

任务类型：
- `TASK-SLICE`

任务模型：
- `常规任务`

逆向子类型：
- 不适用

逆向方案：
- 不适用

功能条线：
- `LINE-PRE-STAGE-2-3-PRESENTATION`（Active；Split）

目标机制/切片：
- `M-032`、`M-034`、`M-035`、`M-042`、`M-044`、`VS-067`

规模预算：
- 主工作包：0（Split 父级合同，由 214C3/214C4/214C5 承接）
- 预计上下文压缩：0
- 独立验收批次：0

拆分触发：
- 若需要重选公共 pet 设计模式/职责归属、改变存档 schema、新增逆向资料族、第三独立工作包，停止新增实现并拆分同线承接项；不得削减父级合同。既有职责内的实现修复、原版速度单位换算及必要窄接口适配不因触及公共文件而自动归为重设计。

协作计划：
- 模式：主 agent + subagent（有独立有界验证包时启用；否则串行）
- 并行工作包：由 subagent 只读核对本项原版合同或差异证据，主 agent 同时推进实现；派发前记录精确输入与输出，不增加主工作包总数
- 写入 owner：主 agent
- 归并检查点：战斗链实现后、正式验证前
- 方法观测：`MO-003`；仅记录当前实际差异，最终整家族验收前不计成功样本。

输入资料：
- `docs/tasks/evidence/TASK-SLICE-214C1/handoff.md`：P1GS已通过，私有实体API、旧token语义、来源/cleanup及C2剩余合同。
- `TASK-SLICE-214C1` 的公共实体接缝与回归交接；`docs/tasks/evidence/TASK-SLICE-214C/preflight.md` 的精确源核对。
- `docs/tasks/task-definitions/TASK-SLICE-214B.md` 的完整 44 项合同、UI 原生化合同、时钟修正和 compact 检查点；父级合同未完成，最终由 214E 全量关闭。
- `TASK-SLICE-214A` 交付；`docs/tasks/evidence/TASK-SLICE-214A/handoff.md`、213 verified 真值和 source evidence。
- `docs/architecture/system-designs/pet.md`（实施中）；当前公共 Runtime/Behavior、Projectile/正式伤害、HeroPartyRuntimeBridge、TestScene 消费者。

输出产物：
- dragon1 的公共 Runtime 注册、原版动作时钟、范围外追击/正常攻击、真实 fs 分身及命中/到期治疗；正式与 TestScene 同源显示及 P1/P2 生命周期。
- source-isolated trace、逐状态 940×590 原版/现代差异及可重跑测试，落在 `docs/tasks/evidence/TASK-SLICE-214C2/`。

UI 原生化合同：
- 直接继承 214B 的显示列表清单、verified 机器真值、原版基准与允许例外；只消费 214A 生产查询，不复制坐标表。视图不得拥有另一套战斗状态或场景技能直连。

完成定义：
- 初阶青龙完整战斗链在正式游戏与 TestScene 同源可运行，有真实命中/HP delta/heal/cleanup 证据；只关闭本项覆盖，不提前宣称整家族完成。

验收标准：
- dragon1.normal、dragon1.fs、dragon1.fs-expiry-heal 和适用公共合同；分身须有真实攻击/伤害/治疗与销毁证据。
- 消费 213 倒计时时钟与完成路由，持帧/动作/命中对应，不以 isolated mock 或动画播放替代真实链。
- 新增与本项范围相符的设计 gate 并执行 `npm run check:system-design -- pet P1GC`；退出码必须 0，范围不覆盖的父级项保持未完成。
- 真值/资源检查、相关行为/动画/正式旅程与反馈回归、build、structure、annotations、workflow、problem audit、diff check 通过；正式 940×590 P1/P2 可见链、清理与 console warning/error 为 0。

禁止范围：
- 不跨宠物家族、不改变原版数值、不擅自重选设计模式或职责归属、不新增资源派生，不执行 215。允许在既有职责内修复与原版证据不符的实现、速度换算及必要窄接口。不得把真实分身改成视觉假对象，也不得复制公共移动/目标/生命周期算法。

状态更新：
- 更新本项覆盖、设计验收矩阵、机制/切片、任务/功能线记录；本项通过后同次归档本项和Split父任务 `TASK-SLICE-214C`，激活 `TASK-SLICE-214D` 后结束本项。

推荐后续任务：
- `TASK-SLICE-214D`。

执行边界补充：
- 本项承接214C的全部验收合同；C1只提供公共接缝，不替代本项真实分身伤害/治疗/正式可见证据。fs局部门禁不查目标不代表无目标自动释放，须保留BasePet有效目标分支和search帧边界。

## Compact 安全检查点（2026-09-05，第 1 次）

- 本轮首次 compact；继续当前214C2，不重新执行C1，不扩张父级范围。
- C1公共实体接缝与P1GS已经交付；214C2尚未新增实现，Ready，原始214C完整目标仍未完成。
- 已窄读214C2、214A资源查询、正式HeroParty桥和TestScene入口；只读subagent已核实普通弹末帧碰撞、10tick换ID、命中治疗自身、clone到期先step后治疗原身及动作持帧。
- 下一步：核对直接消费者和正式伤害接口，实施dragon1同源行为/时钟/分身/视图，新增P1GC，再完成两批验收与940×590证据。
- 当前无运行中的检查或preview服务；所有未提交改动均属本次任务。不得修改legacy-extraction原始提取物。
- 第二次compact触发规模门禁：只结束检查、落盘和拆分交接，不恢复新增实现。

## 速度修复前检查点（历史）

- 214C2未完成，父214C未归档，214D未激活。公共移动预检存在可重跑反证：`node tools/run-system-tests.mjs pet-dragon1-movement-preflight`退出1；报告与具体修复边界见 `docs/tasks/evidence/TASK-SLICE-214C2/preflight-decision.md`。
- 24fps原版地面walk每tick水平5px，现有公共chase为18.75px；Frame缺宠物地面/墙输入。不能直接复用并宣布原生复现，也不能在Behavior复制物理。
- 下一执行动作：按用户已授权修正速度及换算，在现有公共移动owner内完成必要修复与验证，再继续本项完整战斗链；不再把触及公共接口本身当作审批条件。现有214C1验收不回滚，全部原始C2合同保留，不把本次预检当作另一个已完成游戏task。

## 2026-09-05 用户授权与限制更正

用户已明确允许修正。此前“禁止改变公共设计”是agent拆分任务时自行写入的过宽约束，并非用户直接要求；将速度/单位及既有职责内的实现修复视作重设计而反复等待确认，是agent误判。本文已收窄该限制。214C2完整合同继续有效，任务仍未完成。

## 2026-09-05 实现中检查点：速度与原版动作时钟

- 用户授权后的速度修复已落地：公共follow/chase改为moveSpeed×hostFps，正式及TestScene P1/P2传入场景帧率；保持每宠物独立moveSpeed。20/24/30fps一步均5px；修复前报告保留为214C2/movement-preflight-before.json，当前报告movement-preflight.json为matched。
- PetAnimationClock负责公共倒计时，PetDragonAnimationClock只由213/214A查询构造初阶青龙定义；Session可选持有时钟，逐hosttick执行公共算法，接入同步typed hit/complete/dead-complete与只读snapshot。Behavior只提供定义，不持公共时钟；尚未注册dragon1生产Behavior。
- 同row状态切换有独立keyFrameIndex：切换wait/walk重置逻辑计数但保留物理column/remaining，重复同state不重置；子代理发现的遗漏已修正。新分身在发射tick之后才step，半帧子事件保留，长render帧不丢中间hit，hurt completion静止指令由Session消费。
- 新增pet-movement-clock-tests、pet-dragon1-clock-tests、pet-animation-session-tests并纳入默认系统测试；P1GS及10类既有mutation已再次通过。已完成速度批次的全系统/build；最终时钟接缝变更继续执行build/完整系统及文档检查。
- 下一执行工作仍为同一214C2：精确公共水平/垂直/地面墙移动、dragon1普攻/fs/真实来源伤害治疗和自然到期、正式/TestScene同源视图、P1GC和940×590差异证据。当前只完成速度修复和时钟接入，不能宣称青龙可玩或归档C2/C。
- 当前对话首次compact已使用，未发生第二次；若第二次发生，严格仅结束检查和落盘拆分交接，不恢复新增实现。

本批检查已结束：最终build、包含三组新测试的完整test:systems、P1GS（含10类mutation）、check:workflow和check:structure均退出0；结构仍为原9项warning，build仍有原大chunk提示。当前无运行中的build/test/preview；未执行Git提交或上传。

## Compact 安全检查点（2026-09-05，第 2 次）

- 本次已实际发生第二次 compact，执行规模门禁；只结束检查、保存现有工作和拆分交接，不再新增实现或读取新源资料。先前“未发生第二次”是历史记录。
- C2 改为 Split；214C3 唯一 Ready，214C4/214C5 Planned。全部原 C2/C 合同保留；只有 214C5 完成 P1GC 和正式可见验收后才能归档 C2/C、激活 214D。
- 已完成速度单位、可选动作时钟与公共会话逐 tick 接缝；dragon1 尚未注册生产 Behavior，普攻/fs/真实命中治疗/到期/正式视图与 P1GC 未完成。
- 新增 PetGroundMovementSystem 仅为未集成的静态轴对齐墙求解器；目标测试通过，尚无场景环境/运行时接入，不覆盖斜坡、移动墙、外力或飞行界限。不得把它当作原版完整移动已实现。
- 新增恢复主包 pcode 证据纠正四青龙 attackRate 最终值为 0.7，旧 0.8 是构造早期值；生成器、真值测试和资源测试已通过，PG-017 记录方案不充分，未外推其他家族。
- 精确交接和最终检查结果见 `docs/tasks/evidence/TASK-SLICE-214C2/handoff.md`；未提交/上传，无运行中的开发服务。下一对话从 214C3 继续，不从 C1 重做，也不以 goal 自动续行绕过本对话门禁。

# TASK-SETTINGS-257B

任务类型：`TASK-SETTINGS`

任务模型：`逆向任务`

逆向子类型：`代码逆向`

逆向方案：不适用；沿用通用六段证据链，不新增方案。

功能条线：`LINE-PRE-STAGE-2-3-PRESENTATION`（Active）

目标机制/切片：`M-030`、`M-034`、`M-042`、`VS-067`

要解决的问题：257预检已用原doHi2、原BaseHero.move、原Tween ABC证明同一x/y的148对受控写入顺序差异；真实ENTER_FRAME、英雄运动/边界修正与Tween生命周期尚未知，单独ease曲线不能作为实际坐标轨迹。见 `docs/reverse-engineering/monster2-space-preflight.md`。原库可直接执行，无需重建。

规模预算：
- 主工作包：2（原Tween有限时间/覆盖/暂停合同；原英雄公共坐标调度/生命周期及父联合交接）
- 预计上下文压缩：0
- 独立验收批次：2（独立原库轨迹；原共享调用链组合与父合同核销）

拆分触发：
- 公共英雄输入超出聚拢所需的移动/边界/生命周期而要求重建完整角色、网络、全关卡物理时，只冻结必要未解项并生成同线有界补证。
- 原ABC不能保持实际行为而需修复/重建引擎时停止该路径，不手写ease替代；真实HP接收若仍缺输入另生成同线代码补证，不夹带实现。

协作计划：
- 模式：主agent + 有界subagent。
- 模型分工：主agent原运行与时序判断；Luna只读审计MainGame/PhysicsWorld/BaseHero位置写入与销毁路径。
- 并行工作包：主agent运行时，子agent返回精确调用/写入/清理范围、既有证据适用性和反证。
- 写入 owner：主agent。
- 归并检查点：行为合同晋升及父联合核销前。
- 方法观测：无。

待证明的可观察问题：
- 原Tween默认ease、x/y写入量化、启动/终点及真实时间来源是什么？
- 原世界与Tween实际调度顺序怎样决定玩家移动时的位置？不能选择preflight任一种顺序充当原版。
- 暂停恢复、第二次聚拢覆盖、英雄移动/死亡、源destroy、Scene退出分别怎样影响已有Tween和实际英雄？

有限范围、入口与fixture：
- 再续天庭1.1 Stage1-2 Monster2 `doHi2`，20/24/30 host，P1/P2/双方；alive/dead/ready过滤复用256原Config列表输入。
- 水平/垂直初始差、1秒端点、暂停中间/恢复、第二次请求、玩家移动冲突、英雄死亡、源destroy与退出，完整保留父257Tween状态集合。
- 最小真实BaseHero运动/基础step/必要墙体与屏幕修正、MainGame/PhysicsWorld和原Tween时间线组合；既有空间输入引用257A，不扩完整身体atlas或全人物动作系统。
- 原库可控时间精确重放与真实事件调度分别记录；不可控时记录真实采样时刻/抖动与未解项，不伪称固定帧Tween。preflight 462态只是回归反例，不是本项完成域。

输入资料：
- 父 `TASK-SETTINGS-257.md`、257A已完成空间合同/manifest及 `docs/reverse-engineering/monster2-space-preflight.md`。
- `docs/workflow/reverse-engineering-protocol.md`、`docs/workflow/air-runtime-verification.md`。
- `docs/reverse-engineering/monster2-body-attack-contract.md`、`reference/monster2-body-attack-contract.json`、`tools/monster2-source/`、`tools/monster2-space-preflight/`。
- 原Monster2/Config/BaseHero/BaseObject/BBDC、MainGame/PhysicsWorld/TweenMax/TweenLite及必要直接依赖；恢复 `1_MainLoad__main1.swf`原ABC。
- `tools/monster-knockback-source/`已存在原ABC执行支架仅按适用性复用；不借用怪物击退ease或轨迹。
- Stage12/Registry/Stage1Combat/HeroParty及英雄位置owner只作消费者映射，不改src。

输出产物：`docs/reverse-engineering/monster2-gather-coordinate-contract.md`、`docs/reverse-engineering/reference/monster2-gather-coordinate-contract.json`（纯行为sidecar）；原运行轨迹、时钟/顺序、方法与ABC哈希、有限fixture与源/运行变异；父257完整合同核销矩阵与唯一后续任务。原始产物 `local-resources/regima/task-outputs/TASK-SETTINGS-257B/`，报告 `docs/tasks/evidence/TASK-SETTINGS-257B/`。

完成定义：原库与真实公共英雄坐标链在父有限域全部有可重复可消费输入、关键未知清零；纯行为sidecar不滥用UI对象字段，空间/注册点由257A verified真值引用。联合核销A+B并归档父257；真实HP缺口独立保持并生成同线补证，不宣称Monster2实现就绪。

验收标准：
- 保留256M2-01..09、裸MC暂停继续/EXIT、自身无伤害producer及真实HP未知边界；确认父257所有空间/碰撞责任已有A独立通过。
- 原DoABC/库函数执行；记录源hash/locator/有限域、独立预期、重复稳定结果、实际源/运行变异；禁止手写现代ease当原库。
- 原真实事件顺序与受控renderTime分别核定；消除148顺序敏感差异对应的生产输入未知，不能忽略英雄自运动或只记录Tween API请求。
- 暂停恢复/覆盖/移动/死亡/源销毁/Scene退出与双owner逐项有结果，不以Tween曲线测试代替共享生命周期。
- 完成六段矩阵、现代消费者映射；纯行为无新UI/PNG，若新空间事实出现须交同线视觉补证而非手抄坐标。
- 运行 `check:workflow`、sidecar独立验证与 `audit:problems`；Git交付精简合同/工具，不让游戏依赖ignored trace。

禁止范围：不实现Monster2、不改src/public或原提取/恢复包，不重建Tween引擎，不扩其他类型/完整英雄或家族，不取消真实HP补证门禁，不关闭204/all/194/VS-067或整线。

状态更新：Ready（2026-10-04；257A空间真值已verified并归档，接续原Tween与公共英雄坐标调度补证）。

推荐后续任务：按父联合结果生成唯一同线真实HP代码补证；只有实现所需未知清零才生成Monster2有界实现。

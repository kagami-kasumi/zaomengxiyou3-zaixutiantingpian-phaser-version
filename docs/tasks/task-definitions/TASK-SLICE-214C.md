# TASK-SLICE-214C

任务类型：
- `TASK-SLICE`

任务模型：
- `常规任务`

逆向子类型：
- 不适用

逆向方案：
- 不适用

功能条线：
- `LINE-PRE-STAGE-2-3-PRESENTATION`（Active；Split；由214C1/214C2连续承接）

目标机制/切片：
- `M-032`、`M-034`、`M-035`、`M-042`、`M-044`、`VS-067`

规模预算：
- 主工作包：0（Split父级合同，由214C1/214C2执行）
- 预计上下文压缩：0
- 独立验收批次：0

拆分触发：
- 若需要重选公共 pet 设计模式/职责归属、改变存档 schema、新增逆向资料族、第三独立工作包，停止新增实现并拆分同线承接项；不得削减父级合同。用户已授权既有职责内修复、速度换算与必要窄接口，不因触及公共文件而自动视为重设计。

协作计划：
- 模式：主 agent + subagent（有独立有界验证包时启用；否则串行）
- 并行工作包：由 subagent 只读核对本项原版合同或差异证据，主 agent 同时推进实现；派发前记录精确输入与输出，不增加主工作包总数
- 写入 owner：主 agent
- 归并检查点：战斗链实现后、正式验证前
- 方法观测：`MO-003`；仅记录当前实际差异，最终整家族验收前不计成功样本。

输入资料：
- `docs/tasks/task-definitions/TASK-SLICE-214B.md` 的完整 44 项合同、UI 原生化合同、时钟修正和 compact 检查点；父级合同未完成，最终由 214E 全量关闭。
- `TASK-SLICE-214A` 交付；`docs/tasks/evidence/TASK-SLICE-214A/handoff.md`、213 verified 真值和 source evidence。
- `docs/architecture/system-designs/pet.md`（实施中）；当前公共 Runtime/Behavior、Projectile/正式伤害、HeroPartyRuntimeBridge、TestScene 消费者。

输出产物：
- dragon1 的公共 Runtime 注册、原版动作时钟、范围外追击/正常攻击、真实 fs 分身及命中/到期治疗；正式与 TestScene 同源显示及 P1/P2 生命周期。
- source-isolated trace、逐状态 940×590 原版/现代差异及可重跑测试，落在 `docs/tasks/evidence/TASK-SLICE-214C/`。

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
- 不跨宠物家族、不改变原版数值或公共设计、不新增资源派生，不执行 215。不得把真实分身改成视觉假对象，也不得复制公共移动/目标/生命周期算法。

状态更新：
- 更新本项覆盖、设计验收矩阵、机制/切片、任务/功能线记录；激活 `TASK-SLICE-214D` 后结束本项。

推荐后续任务：
- `TASK-SLICE-214D`。

执行记录（2026-09-05规模预检）：
- compact次数0；只读子代理原版核对已归并，精确证据与裁决见 `docs/tasks/evidence/TASK-SLICE-214C/preflight.md`。
- 公共步骤绑定唯一出战项，提取私有实体共用步骤及猴马回归构成第三工作包；按规模门禁标记Split。现有设计允许私有召唤物，不因原版new同类擅自改为每slot多个顶层Runtime。
- 唯一Ready为 `TASK-SLICE-214C1`，随后 `TASK-SLICE-214C2` 完整关闭上文原合同/P1GC并归档本项，再进入214D；不执行215，不提高青龙复现状态。
- 未改src、资源或原始提取；初始工作区干净；仅有本次任务拆分文档，未提交。无运行中服务。
- 收尾检查：generate:harness、check:workflow（含15个harness自测、annotations、level architecture）、audit:problems、git diff --check均通过；check:structure退出0、9项既有warning。workflow保留既有PlayerSlot词汇warning；未运行P1GC/build/正式浏览器，因为本次没有实现。活跃PG只命中PG-004，集中记录于problem-audit.md，未满足长期归档条件。

续行记录（2026-09-05）：
- 自动goal续行已完成并归档214C1，实际公共Session/Context及私有句柄接缝、P1GS/10类mutation、猴马门禁/五关/全系统/build均通过。上方“未改src”只描述此前规模预检，不描述当前工作区。
- 下一执行项为214C2（Ready），交接入口 `docs/tasks/evidence/TASK-SLICE-214C1/handoff.md`；本父任务仍Split、P1GC未通过，不得把接缝批次当成原214C玩法完成。代码和两轮任务文档均未提交。

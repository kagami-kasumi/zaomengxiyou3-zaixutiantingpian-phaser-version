# TASK-SETTINGS-230

任务类型：`TASK-SETTINGS`

任务模型：`逆向任务`

逆向子类型：`代码逆向`

逆向方案：不适用。

功能条线：`LINE-PRE-STAGE-2-3-PRESENTATION`（Active；本任务 Ready）

目标机制/切片：`M-030`、`M-032`、`M-042`、`VS-067`

要解决的问题：226核查确认宠物命中的击退只写入 DamageEvent，正式怪物物理未消费。最小运行样本从 (300,420) 命中扣血200→193，事件为(6,-5)，命中后位置/速度不变；下一帧仅重力使 y=420.6666666666667、velocityY=40，x仍300。该样本证明消费缺口，尚不构成原版全部击退轨迹真值。

范围：只补齐宠物弹体→BaseMonster→BaseObject受击运动的行为合同及现有正式消费者映射。原版入口包含 getBeattackBackSpeed、setAttackBack、横向倍数、边界修正，以及命中/物理/AI先后。不能直接把事件(6,-5)作为现代每秒速度；不能用英雄受击路径替代怪物证据。

规模预算：
- 主工作包：1
- 预计上下文压缩：0
- 独立验收批次：1

拆分触发：
- 若必须新增怪物视觉/空间资料族或涉及非宠物命中公共机制实现，保留未知并生成独立后续任务；本项不实现怪物架构重构。

协作计划：
- 模式：主 agent + subagent
- 模型分工：主agent整理源行为合同；Luna只读核对现有正式消费者与独立反例。
- 并行工作包：同一受击合同内，源调度与现代消费入口可独立返回路径/调用序/反例。
- 写入 owner：主 agent
- 归并检查点：验收前
- 方法观测：无

输入资料：
- `docs/reverse-engineering/pet-monkey-horse-gap-audit.md`、226进展记录与 `tools/pet-monster-knockback-preflight.ts` 可重放击退反例（诊断退出0不表示验收通过）。
- 只读原版 `local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts/base/BaseMonster.as`、`BaseObject.as`、`BaseBullet.as` 及必要step消费者。
- `Stage1CombatSystem.ts`、`MonsterRuntimeRegistrySystem.ts`、`MonsterPhysicsSystem.ts`、正式Registry与Stage21消费者，沿真实调用链窄查。
- 227/228/229既有宠物命中及击退字典证据，复用已证输入。

输出产物：
- 六段证据链的有界怪物受击运动合同、源级独立轨迹样本及现代失败反例；区分普通怪/Boss与受击免疫、落地/空中、边界、P1/P2和重复命中。
- 实现交接清单：现有唯一monster owner、所需输入、调用顺序、源速度单位、去重/覆盖规则、正式五关/TestScene适用入口。
- 根据已证范围生成同线最小公共受击消费实现task，不抢占怪物架构线。

完成定义：源击退行为与现代消费缺口可独立复验，必要分支无未标注推断，后续实现合同明确。

验收标准：
- 原版独立expected必须能拒绝无消费、速度单位错误、命中前后顺序错误及重复应用；不能只检查event字段。
- 列明每个原版受击运动分支的覆盖/排除依据；有未知则阻塞相应完成声明。
- 反例在正式函数链可重放，并说明样本没有覆盖的完整场景行为；不把headless样本宣称为浏览器体验验收。
- `npm run check:workflow`、`npm run audit:problems`及相关源证据校验通过。

禁止范围：不修改原始提取结果，不实现新怪物架构，不重做猴马资源，不据局部样本提升猴马完整家族或整线完成度。

状态更新：Ready，当前唯一执行项；226本地整改已归档，本项公共机制尚未修复，须继续核销原84承接矩阵中的相关责任。

推荐后续任务：依据已闭合证据生成同线公共怪物受击消费实现task；完成后回到尚未核销的猴马联合验收或下一完整家族。

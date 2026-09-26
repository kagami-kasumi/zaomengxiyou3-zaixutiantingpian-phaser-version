# TASK-SLICE-234

任务类型：`TASK-SLICE`

任务模型：`常规任务`

功能条线：`LINE-PRE-STAGE-2-3-PRESENTATION`（Active；本任务 Planned）

目标机制/切片：`M-032`、`M-042`、`M-044`、`VS-067`

要解决的问题：普通初始/存档恢复会给P2宠物加前缀，但catchNewPet按名称和roster长度生成ID，实时捕获不带owner。实际两slot同时捕获monkey1得到相同pet-monkey1-2；两真实Runtime各出生弹体后销毁P1，Session.release按sourceId过滤共享数组，P2弹体也被删除而P2仍存活。

范围：修正公共捕获、实时roster更新和战斗清理的身份保证；覆盖同名捕获、放生后重捕、P1/P2及保存重载。沿用现有身份/归属owner，不为猴马增加专用前缀补丁，不改变成长或捕获概率。

规模预算：
- 主工作包：1
- 预计上下文压缩：0
- 独立验收批次：1

拆分触发：
- 若需要存档schema迁移或全领域身份重构，先冻结兼容边界再拆出独立工作；本项不扩张为所有实体ID改造。

协作计划：
- 模式：单 agent
- 模型分工：普通捕获与实时roster消费同一身份合同，由主agent完成。
- 并行工作包：无
- 写入 owner：主 agent
- 归并检查点：验收前
- 方法观测：无

输入资料：
- `tools/pet-capture-owner-preflight.ts`及本地`docs/tasks/evidence/TASK-SLICE-226/capture-owner-preflight.json`；退出0仅表示采集成功。
- PetOwnershipSystem、PetRosterSystem.catchNewPet、PetMagicBottleSystem、TestSceneMagicOwnershipBridge、HeroPartyRuntimeBridge.syncPets、SaveSystem.decodePetId及PetCombatEntitySession.release。
- 226双slot生命周期测试只证明唯一ID下的隔离，不替代本项。

输出产物：公共身份保证修正；真实捕获→即时激活→攻击→一侧释放→另一侧继续的回归，兼容重载与同owner重捕检查。

完成定义：原反例被拒绝，真实捕获与保存流程不会产生跨owner清理/伤害归属混淆；不凭修ID宣称全部家族闭合。

验收标准：
- 保留旧反例：两对象同ID，2个弹体变0，P2仍活；修正后只清理P1且P2原弹体/Runtime身份保留。
- 通过真实魔法瓶/捕获与正式roster通知路径，禁止仅给fixture加slot前缀。
- 检查同owner放生后重捕、既有存档、P2重载不重复加前缀及来源归属。
- 相关所有权/存档/生命周期测试、build、workflow、problem audit和diff通过。

禁止范围：不修改原版资料、捕获概率、成长数值，不按物种维护另一份身份表，不丢弃或静默替换既有宠物记录。

状态更新：Planned，当前唯一Ready为TASK-SETTINGS-230；226本地整改已归档，本项公共机制尚未修复，须继续核销原84承接矩阵中的相关责任。

推荐后续任务：回填同线双owner宠物生命周期验收，再按覆盖台账执行剩余项。

# TASK-SLICE-259

任务类型：`TASK-SLICE`

任务模型：`常规任务`

功能条线：`LINE-PRE-STAGE-2-3-PRESENTATION`（Active）

目标机制/切片：`M-030`、`M-034`、`M-042`、`VS-067`

要解决的问题：258真实destroy链及双owner生产诊断反证：英雄被同次怪物命中致死后，当前缓存的pet接收端口仍扣宠物HP并减少弹体remaining；原版先destroy/clearPet，随后getPet为空。251有限数值域不能替代这条同步生命周期。先修公共owner，避免Monster2继续接入错误边界。

规模预算：
- 主工作包：1（既有英雄/宠物owner同步退休及真实消费者联合验证）
- 预计上下文压缩：0
- 独立验收批次：1（原258关键序列、生产变异与正式双owner清理回归）

拆分触发：
- 若发现实际复活装备、额外公共生命周期或缺原版时序/视觉输入，冻结精确入口并生成同线补证；不猜测、不扩Monster2实现。
- 若需新增独立世界/宠物owner或重建完整怪物架构，先核定并拆分，禁止复制第二套HP/销毁规则。

协作计划：
- 模式：主agent + 有界subagent。
- 模型分工：主agent修改实际owner；Luna只读核对258原合同与生产调用/清理顺序。
- 并行工作包：P1/P2同次致死、保护拒绝、非致死及过期端口的消费者清单和反证条件。
- 写入 owner：主agent。
- 归并检查点：最终源合同核销前。
- 方法观测：无。

输入资料：
- `docs/reverse-engineering/monster2-reception-contract.md`及`reference/monster2-reception-contract.json`；`tools/monster2-reception-owner-diagnostic.ts`、本地258/modern-retirement-diagnostic.json。
- 原BaseHero.reduceHp/destroy/clearAllBullets/clearPet、BasePet.destroy、BaseBullet.checkAttack、Config.getPlayerArray精确源locator；258源/原生已闭合，不重做完整逆向。
- `monster3-reception-contract.md`、`monster3-receiver-runtime-acceptance.md`、`monster3-runtime-acceptance.md`、`pet-reception-body-runtime-acceptance.md`相关同步生命周期范围。
- `src/scenes/HeroPartyMonster3Reception.ts`、`HeroPartyRuntimeBridge.ts`；`MonsterAttackReception.ts`、`HeroMonsterDamageReception.ts`、当前PetCombatRuntime/EntitySession/兼容身体owner及其真实消费者。
- `docs/architecture/src-boundaries.md`；`docs/workflow/problems/PG-017-真值表不管用.md`中的258反证只作问题背景，执行步骤以本合同为准。

关联具体系统设计：`docs/architecture/system-designs/pet.md`；若仍未已完成/已退出，本批必须执行 `npm run check:system-design -- pet P1GS`；已退出按协议不重开。

输出产物：既有公共owner修复、实际生产测试/变异、正式双owner清理证据、`docs/reverse-engineering/monster-party-retirement-acceptance.md`及下一Monster2有界任务。原始观察与报告放 `docs/tasks/evidence/TASK-SLICE-259/`。

完成定义：英雄该次真正致死且进入销毁时，先通过现有owner同步清理宠物/session/旧接收引用，随后同次怪物遍历不再结算该宠；宠物不被误记为受击死亡、不得额外扣HP/lifetime/弹体remaining；其他slot不受影响。盾吸收、非致死、保护/闪避等没有执行英雄destroy的情况仍允许有效宠物独立接收。由真实owner和正式路径证明，不以仅检查hpBefore/hpAfter替代退休与引用清理。

验收标准：
- 258无复活致死源序列直接消费，P1/P2/双方×20/24/30；英雄1HP/29HP/30HP、保护拒绝后宠物命中、宠物先致死、盾/转移不致死、双弹及旧端口再次访问分别保留。
- 使用实际party函数、真实已迁移Session和兼容pet身体owner；退休时主/私有实体、弹体、显示生命周期沿用现有服务，不改原宠物受击死亡lifetime语义。
- 新测试拒绝延后一tick清理、仅HP判断而旧端口继续、错误扣pet lifetime、跨slot清理以及把英雄拒绝当宠物拒绝等生产变异；不要求原受控ready裸状态直接映射为现代已退休端口可接受。
- 正式Stage1-3/TestScene已有Monster3消费者验证同次致死、失败重试/返回、P1/P2与另一slot继续，必要可见证据；同时保留251数值/255身体回归及原Monster3有限资源/行为合同。
- `check:structure`、相关系统测试、`build`、适用pet gate、`check:workflow`与`audit:problems`通过；PG-017补强结果回写，不因单项修复关闭整PG。

禁止范围：不实现Monster2攻击/聚拢、不修改258原expected迎合生产；不扩其他怪物行为、全装备/复活系统或完整宠物家族；不新增owner、不改变碰撞许可；不关闭204/all/194/VS-067或功能线。

状态更新：Ready（2026-10-04；258有限原版接收完成，实际同步退休反例成为前置实现项）。

推荐后续任务：本项通过后，以256/257A/257B/258完整输入生成同线Monster2有界实现；明确两弹/身体/自然选择与聚拢坐标owner的工作包边界，必要按独立交付边界拆分。原M2-01..09、234像素精确许可、裸MC暂停/EXIT及全部未完成公共责任不丢失。

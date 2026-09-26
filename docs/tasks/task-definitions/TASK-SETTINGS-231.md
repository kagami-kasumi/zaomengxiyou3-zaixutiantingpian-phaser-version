# TASK-SETTINGS-231

任务类型：`TASK-SETTINGS`

任务模型：`逆向任务`

逆向子类型：`代码逆向`

逆向方案：不适用。

功能条线：`LINE-PRE-STAGE-2-3-PRESENTATION`（Active；本任务 Planned）

目标机制/切片：`M-030`、`M-032`、`M-040`、`VS-067`

要解决的问题：226冰火接线暴露公共怪物击杀归属映射缺口。正式TestScene适配链中P1宠物直接命中、P2为AI目标，随后目标火焰致死，现有经验claim得到P2；诊断见`tools/pet-target-owner-preflight.ts`。原BaseMonster.beMagicAttack更新curAttackTarget，reduceHp不重设它，并按BaseHero/BasePet分支分配经验；现代targetSlot、owner slot和源对象种类不是同一事实。

范围：只核定普通/持续伤害后的怪物攻击者对象、死亡经验接收者和消费者映射，区分英雄、宠物、P1/P2、后续直接命中、AI重选、攻击者死亡/离场/换宠。复用已证弹体命中和火焰时序，不扩展为所有战利品/怪物AI重构。

规模预算：
- 主工作包：1
- 预计上下文压缩：0
- 独立验收批次：1

拆分触发：
- 若需新增掉落视觉/随机分布资料族或修改全怪物AI，保留未知并另行拆分；本项只补行为合同并生成最小公共消费实现task。

协作计划：
- 模式：主 agent + subagent
- 模型分工：主agent整理源对象/经验合同；Luna只读核对正式五关/TestScene消费者和反例。
- 并行工作包：同一归属合同中的原版分支与现代输入/消费者映射可独立返回。
- 写入 owner：主 agent
- 归并检查点：验收前
- 方法观测：无

输入资料：
- 226进度记录、`tools/pet-target-owner-preflight.ts`与本地`docs/tasks/evidence/TASK-SLICE-226/target-owner-preflight.json`；诊断退出0不是正确性通过。
- 原`BaseMonster.as`的beMagicAttack/curAttackTarget/myIntelligence/reduceHp、BasePet/hero相关伤害入口，沿真实调用链窄读。
- `PetBattleOwnershipSystem.ts`、`MonsterDefeatRewardSystem.ts`、`Stage1RewardBridge.ts`、`TestScenePetEnemyAdapter.ts`、`TestSceneHeroPartyRuntimeBridge.ts`与`TestSceneWorldBridge.ts`的owner ledger/经验消费者。

输出产物：
- 六段证据链的有界击杀归属合同及原版独立动态样本，明确对象种类、对象身份、owner和分配时机。
- 正式五关/TestScene消费者矩阵，标出已证一致、反例和未知；不得只把targetSlot改为火焰源owner。
- 根据证据生成同线最小公共归属消费实现task。

完成定义：相关源归属/经验分支与现代缺口可独立复验，后续实现输入与关闭合同明确。

验收标准：
- 独立expected拒绝“始终AI最近目标”“固定火焰来源”“统一英雄/宠物经验比例”“换宠后把旧宠经验给新宠”“重复奖励”。
- 区分显式攻击者重设、原AI合法重选、纯效果tick；源证据缺失则标未知，不把slot相同当对象相同。
- 不以受控sink、最终经验变多或map存在证明完整消费者；必要分支与生命周期边界逐项交接。
- `npm run check:workflow`、`npm run audit:problems`与相应源证据校验通过。

禁止范围：不修改原始提取结果，不自行实现未证归属规则，不重做宠物资源/冰火视觉，不据本项提升整线完成度。

状态更新：Planned，当前唯一Ready为TASK-SETTINGS-230；226本地整改已归档，本项公共机制尚未修复，须继续核销原84承接矩阵中的相关责任。

推荐后续任务：依据证据生成同线公共击杀归属实现task，完成后回到尚未核销的猴马联合验收或下一完整家族。

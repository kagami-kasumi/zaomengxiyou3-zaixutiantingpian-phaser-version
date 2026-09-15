# TASK-SLICE-216 规模预检与交接

日期：2026-09-14。结论：Split；216A唯一Ready，216B/C Planned，当前功能线继续Active。无src、生产资源或伤害公式改动。215 verified输入有效，本次不是重新逆向或功能完成。

## 拆分依据

`docs/workflow/task-generation.md` 规定：“新资料族/资源派生、多个运行时 owner、端到端运行校准中任意三类同时出现时，必须拆成连续 task。”三项均有代码证据：

| 工作类别 | 当前证据 | 连续交付 |
| --- | --- | --- |
| 资源派生与投影 | CombatHitFeedbackAssets.ts只声明hurtnum/bnum/combo；SceneAssetBundles.ts:313..316只加载这些资源；src/assets和public/assets/ui/combat-feedback无pnum接入。215 handoff明确未接生产资源 | 216A从恢复OtherMat1和215生成十字形、唯一bundle与真值驱动显示API，独立原版逐状态对照 |
| 多个结算owner | HeroCombatSystem.ts:122结算角色减伤/盾；PetCombatEntitySession.ts:283直接扣宠物HP；HeroPartyRuntimeSystem.ts:264环境直接扣HP；TestSceneCombatBridge.ts:196与TestSceneBossArena.ts:178先调用已有玄龟转嫁 | 216B统一incoming事件、来源与显示生命周期；不修改现有公式 |
| 端到端运行校准 | 父216要求五关/TestScene、P1/P2、source-isolated trace、真实HP与pnum及返回/重试/重载；5173另有fixture旅程 | 216B承担战斗全部运行验收；216C承担本地QA入口及父合同核销 |

## 必须保留的实现风险

- PetBehavior.ts:31的PetCombatDamageEvent目前只有runtimeKey/amount/sourceId；Stage1CombatSystem.ts:342的宠物攻击返回值没有attack id。应从实际攻击轮次传递来源，不在view通过HP快照或时间猜id。
- HeroPartyEnvironmentHit（HeroPartyRuntimeSystem.ts:79）没有环境source/轮次；环境实际扣血入口不经过applyHeroDamage。保留既有公式和保护裁决，向上追踪Stage21/22的真实冰刺/火焰来源。
- TestScene玄龟转嫁已存在：PetBattleOwnershipSystem.ts:20调用PetTurtleSkillSystem。不能因整家族未完成将该消费者列为不适用。若发现源数值与现有公式冲突，216B按拆分触发处理，不擅改公式或伪称源一致。
- 致死显示值、直接0、Role3 GXP显示除二、满盾和溢出、显式多producer仍按215分开；现有防御能力与未实现能力必须逐项核对。
- 5173入口由BootScene.ts:52调用seedAllPetsQaSave；PetVisualQaFixtureSystem.ts:16只在local与隐藏查询参数下执行，且已有槽保护。216C不得将默认发现变成默认覆写存档。

## 父合同分配与关闭

| 父216条款 | owner | 关闭证据 |
| --- | --- | --- |
| pnum十glyph、单一combat-common、truthId/完整性、显示树/矩阵/锚点/时序/销毁 | 216A | 215源检查 + 可再生生产资产 + 940×590显示API差异/变异 |
| 全部当前producer、typed数值/owner/id/ordinal、拒绝与例外、真实五关/TestScene、怪物数字/连击不回归 | 216B | 独立黑盒trace + 负场景 + 正式双人可见链 + 全系统与运行审计 |
| 5173无隐藏知识、创建/刷新、4174/非localhost/正式槽隔离 | 216C | 本地入口浏览器旅程 + 存档/环境负测试 |
| 机制/切片/功能线台账、完整父合同、下一完整宠物家族 | 216C最终核销 | A/B/C通过报告逐项映射；未齐不得归档216 |

三子任务均保留原版视觉零例外、独立源基准、mutation-kill及父合同禁止范围。A的显示重放不等于B的伤害执行；C的存档成功不等于战斗验收。

只读子agent结果已归并：确认上述三类owner与TestScene Monster30/Monster3转嫁路径。PetTurtleSkillSystem.ts:316..343实际扣宠物HP；TestSceneWorldBridge.ts:566..583只记录怪物target反馈，当前没有独立怪物→宠物碰撞事件。PetPhoenixSkillSystem的incoming辅助函数没有实际消费者，不据此新增玩法；联网/队列仅源对照。主agent复核关键调用链后采用，未把调查当实现或运行通过证据。

下一具体动作：执行216A，读取215的glyphs/animation/visualTruth和native基准，窄查恢复OtherMat1字形、建立可再生生产资源及显示投影。原始提取结果与215原版输入全部保留。当前预检只需文档调度检查，不运行无代码变化的全系统/build或原AIR采样。

验证结果：check:structure通过（9项既存warning）；generate:harness通过；check:workflow通过（16项harness测试、7活跃PG合同、1250资源标注及关卡架构检查，保留既存PlayerSlot命名warning）；audit:problems完成7项语义审阅并集中记录PG-004/017；git diff --check通过。首次harness读取文件出现临时UNKNOWN，重试成功；初版子合同章节顺序/父Split预算已按校验要求纠正后全套文档检查通过。未执行Git提交或上传。

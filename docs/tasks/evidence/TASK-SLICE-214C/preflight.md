# TASK-SLICE-214C 执行前核对

日期：2026-09-05。结论：规模超出声明，拆分交接；未实现青龙，不计 P1GC 或家族成功。

## 原版与现代接缝

原版路径均相对于 `local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts/`，只读复核。

| 事实 | 一手定位 | 实现影响 |
| --- | --- | --- |
| 普攻第7 host tick发射，16 tick结束；fs第17 tick生成，18 tick结束 | `export/pet/PetDragon1.as:75,159-164,181-243`；213 manifest dragon1 actions | 直接消费213/214A剩余持帧数和完成路由 |
| 分身复制当前HP/MP作为自身上限，以及atk/def/level；同sourceRole，alpha .5，x随机±150、y-50 | `export/pet/PetDragon1.as:275-292` | 独立临时数值引用，不进入持久roster，不共享原身HP |
| 原身逐个调用分身step，分身复用BasePet AI，拥有独立目标/动作/攻击id/子弹 | `export/pet/PetDragon1.as:329,366-394` | 必须复用公共实体更新，不能在Behavior复制AI/CD/死亡算法 |
| 命中治疗实际攻击宠物；分身自然到期给原身宠物3.6% SHp，提前死亡不给到期治疗 | `export/pet/PetDragon1.as:246-264,375-412` | 伤害回调须保留实体source，不能只按P1/P2或pet species回填原身 |
| 原身销毁私有分身；分身销毁不调用BasePet.destroy，不清主人出战槽 | `export/pet/PetDragon1.as:423-472` | 子实体cleanup不能走顶层roster释放副作用 |
| beforeSkill1Start不查目标，但公共AI仅在既有有效目标分支调用技能检查 | `base/BasePet.as:316-337`；`export/pet/PetDragon1.as:218-224` | manifest的“target not required”是局部门禁，不能推出无目标自动fs；首次search所在分支不在同tick释放 |

现代证据：`src/systems/PetCombatRuntime.ts:62-171,192-276,286-366` 的目标、动作、CD、事件与释放均绑定唯一 `this.pet/this.runtime`，castSkill闭包消费 `frame.roster`；`src/systems/PetBehavior.ts:53-91` 没有私有实体、命中治疗或子实体snapshot端口；`src/scenes/HeroPartyRuntimeBridge.ts:173-177,392-414` 按slot消费单一快照。

## 设计判断与拆分理由

已归并只读子代理 `dragon1_contract` 的源核对。退回“原版new同类所以必须多个PetCombatRuntime”的推断：冻结pet设计允许Behavior私有召唤句柄和窄端口。保持每slot一个顶层Runtime，内部复用公共实体步骤是可行方向，不需重设计。

但当前公共步骤没有可供私有实体复用的输入/状态接缝；若直接写Dragon Behavior，需要复制公共算法，或让Behavior自行管理目标/CD/死亡，均违反冻结职责。提取公共步骤、保持猴马现有行为与门禁是独立的结构迁移及回归工作包；它不同于214C原列的“本项战斗链实现”和“同源消费者与验收”。实际三包超出最多两包，因此按agent-protocol/task-generation在新增实现前拆分。

- `TASK-SLICE-214C1`：在既有设计内提取公共私有实体接缝并验证猴马回归；不实现第二家族、不改存档/设计角色，不宣称分身可玩。
- `TASK-SLICE-214C2`：消费C1，完整关闭原C的dragon1.normal/fs/fs-expiry-heal、适用公共合同、正式/TestScene及P1GC；完成后归档C并激活214D。
- 214/214B全44项合同继续由214E最终验收；本次没有降低真值状态或把局部门禁简写判为整份真值失效。

## 交接状态

本对话compact次数0；无运行中游戏服务或检查会话。初始Git工作区干净。本次仅修改任务/覆盖/观测/审计文档及生成索引，不改src、原始提取或资源。结构预检退出0，有9项既有warning。其他校验结果见当前任务执行记录；不得用文档校验推定战斗通过。

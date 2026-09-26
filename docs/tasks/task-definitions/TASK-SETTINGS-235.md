# TASK-SETTINGS-235

任务类型：`TASK-SETTINGS`

任务模型：`逆向任务`

逆向子类型：`代码逆向`

逆向方案：不适用。

功能条线：`LINE-PRE-STAGE-2-3-PRESENTATION`（Active；本任务 Planned）

目标机制/切片：`M-032`、`M-034`、`M-042`、`VS-067`

要解决的问题：226通过真实 HeroPartyRuntimeBridge.updatePets 与双 Runtime 的96个受控样本，确认猴马已学习的自动增益在计时显式就绪时仍未触发。当前正式会话缺少公共入口，旧 TestScene helper 对这些家族提前返回，helper 自身一次只触发一项也不同于原 BasePet 的逐项检查。原被动回复、增益计数与效果到期是独立共享机制，227的显式 sink 未提供完整原生合同，不能在226中凭静态片段补成事实。

范围：核定 BasePet.step/doPassive/checkBuffSkill、PetInfo.upPassive 与六种自动增益的数值、计时、学习/MP门禁、同帧多项触发、效果更新及出战会话生命周期。猴马四形态作为已复现消费者，列出其他现有家族的继承/覆盖与正式入口影响；不扩大为全部宠物技能逆向。

规模预算：
- 主工作包：1
- 预计上下文压缩：0
- 独立验收批次：1

拆分触发：
- 若需要新的视觉资源族或某家族独立专属机制，保留未知并另列有界任务；本项只交付共享被动/自动增益合同及最小实现任务，不同时重构所有家族。

输入资料：
- `tools/pet-monkey-horse-passive-preflight.ts`、本地 `docs/tasks/evidence/TASK-SLICE-226/passive-party-preflight.json` 与226进度记录。该诊断显式把计时置零，不代表原构造默认300或默认首帧触发。
- 原 `BasePet.step/doPassive/checkBuffSkill`、`PetInfo.upPassive/getPetHarmObj/findPetUsedMagic`、六种增益的真实效果调用者与清理入口。
- 正式 `HeroPartyRuntimeBridge`、`PetCombatRuntime`、`PetCombatEntitySession`、既有自动增益 helper、`TestScenePetMagicBridge` 及五关消费者。

输出产物：
- 六段证据链、可复验原生动态报告与源指纹；明确替身边界，不把计时事件 sink 当实际增益或治疗结果。
- 原构造计数、逐帧检查顺序、HP/MP回复、增益叠加/到期与受伤/死亡/暂停/替换的合同矩阵，区分事实与未知。
- 现有正式消费者与唯一数值/计时 owner 映射，依据证据生成同线最小共享实现 task，保留226相关组合验收的回填责任。

完成定义：共享被动/自动增益有独立原生 expected，已复现入口缺口及后续修复范围明确；补证完成不等于现代功能已修复。

验收标准：
- 覆盖20/24/30 fps、默认计数与受控就绪计数、未学习/不足MP/多项足额MP、同帧多增益、被动回复周期与刷新顺序。
- 实测原 `tCount++ >= frameClips` 的周期及 upPassive 对本轮/下轮的影响；核定 stun 对 AI/增益计时的作用，不把受伤与整个宿主暂停混为一谈。
- 独立expected必须拒绝“每秒固定毫秒回复”“首项成功后跳过其他增益”“所有roster继续tick”“原生默认立即触发”等错误；以源实际结果决定条件，不为列举反例改写源。
- 后续实现合同必须覆盖真实party P1/P2、实际HP/MP与增益效果、休息/换宠/死亡/暂停及正式五关入口；当前96例只证明受控入口缺失。
- `npm run check:workflow`、`npm run audit:problems`与相应源证据检查通过。

禁止范围：不修改原始提取结果，不新建第二宠物 Runtime 或第二时钟，不以旧 helper 名称当接入证据，不把增益视觉占位当原生完成，不删除226原84合同。

状态更新：Planned，当前唯一Ready为TASK-SETTINGS-230；226本地整改已归档，本项公共机制尚未修复，须继续核销原84承接矩阵中的相关责任。

推荐后续任务：依据结果生成同线共享被动/自动增益实现 task，并回填猴马及受影响家族的正式组合验收。

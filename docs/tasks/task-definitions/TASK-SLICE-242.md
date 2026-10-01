# TASK-SLICE-242

任务类型：`TASK-SLICE`

任务模型：`常规任务`

逆向子类型：不适用。

逆向方案：不适用。

功能条线：`LINE-PRE-STAGE-2-3-PRESENTATION`（Active；本任务 Ready）

目标机制/切片：`M-032`、`M-034`、`M-042`、`VS-067`

要解决的问题：235已补齐720原生expected，但正式party仍缺回复/六自动增益入口。旧helper按24fps换算毫秒、首成功即return，并把给主人的效果计时放在PetState；直接接helper不能满足原版多项同帧、整数数值、会话替换及主人独立到期合同。

范围：在既有每slot Runtime/EntitySession原host tick与party英雄属性owner内，接公共回复与六增益数值/计时；猴马四形态为主验收消费者，并回归已接入青龙/玄龟、显式防止青龙type1私有分身误获公共增益。五正式入口复用同一调用。六项特效的显示列表/时间轴/资源投影是独立后续，当前只使用既有原生HUD/伤害反馈验证实际数值，不添加视觉占位，不声明自动增益视觉完整。

关联具体系统设计：`docs/architecture/system-designs/pet.md`（实施中，尚未退出）。

本批设计验收 gate：`npm run check:system-design -- pet P1GS P1G P1T`。将本批生产消费和实现变异测试接入对应公共gate；不以旧gate绿灯替代新增被动合同，不运行all关闭全系统。

规模预算：
- 主工作包：1（共享数值/会话接入与五关联合消费）
- 预计上下文压缩：0
- 独立验收批次：1

拆分触发：
- 出现235声明外的数字/时序输入，或需要新的效果视觉真值、专属技能或新的owner迁移时，先保持完整合同并另列有界补证项；不得猜补，也不在本批重构所有家族。

协作计划：
- 模式：主 agent + subagent（环境允许时）
- 模型分工：主agent负责共享实现与最终归并；Luna只读核对生产消费者/原expected，按agent-protocol准入执行
- 并行工作包：本批内部有界消费者/合同核对，输出精确来源、遗漏与反例
- 写入 owner：主 agent
- 归并检查点：实现前、验收前
- 方法观测：无

输入资料：
- `docs/reverse-engineering/pet-passive-auto-buff-contract.md`、`docs/reverse-engineering/reference/pet-passive-auto-buff-contract.json`的PB-01..10与`/expectedCases`。
- `tools/pet-passive-source/`；本地235原生报告和226的96例诊断（只证明入口缺失）。
- `HeroPartyRuntimeBridge`、`PetCombatRuntime`、`PetCombatEntitySession`、既有hero combat/skill/baseStats/持续效果owner、`PetAutoBuffSystem`、`TestScenePetMagicBridge`及五关消费者。
- `docs/reverse-engineering/evidence/TASK-SLICE-226-contract-coverage.md`原41+43承接矩阵；已 verified 家族输入与生死/暂停合同。

输出产物：
- 唯一公共数值/时钟接入，真实HP/MP回复、六项门禁/MP扣减/顺序/数值/到期与效果实际技能消费者。
- 原720expected对实际生产trace的独立比较；覆盖缺少case、二次1.05、首成功return、固定秒计时、错误活动对象、换宠重置/主人到期、stun/hurt混淆等实际生产变异。
- 正式五关P1/P2可见HUD数值、真实技能/伤害结果、休息/换宠/死亡/暂停/重试返回与当前存档临时字段排除证据。
- 回填226相关数值/会话责任，并生成同线六增益视觉补证/消费任务；未覆盖视觉和其他公共责任保持未完成。

完成定义：共享数值在真实party双owner与五关正式入口消费，计时/学习/MP/属性生效与到期均由独立原版expected核销，实际技能伤害和HP/MP结果通过；不是六特效或完整家族关闭。

验收标准：
- 20/24/30fps：回复fps+1周期、旧值本轮/新值下轮；300默认、受控ready、4320/5400再次触发；多项同帧与MP19/20/119/120边界。
- stun冻结AI内计数而回复仍推进；hurt仍检查；世界暂停不推进任何逻辑；死亡仅依原家族stepsWhileDying和真实destroy边界推进，不无限tick死亡实体。
- sxkb/fsnl进入真实暴击/技能加值端口；四项主人int属性按源比例与转换生效和到期；同名刷新保留旧value。不能用最终HP下降单独证明每条效果。
- 每slot唯一活动会话；休息roster不tick、再出战/替换重置默认；宠物销毁清自身效果，已经加入主人效果由主人继续到期，主人死亡/关卡退出由既有hero owner清理。
- 五关正式双人实际入口与真实双方数值隔离，失败重试/返回释放，无第二Runtime、第二时钟或逐关数值实现；保持猴马/青龙/玄龟原合同及P1GS/P1G/P1T。
- 使用既有HUD真值与940×590逐状态数值可见证据；不修改UI布局或用现代图形替代原增益符号；六特效视觉独立待补。
- `npm run test:systems`与受影响专项、build、structure、workflow、audit:problems和本批硬设计gate通过。

禁止范围：不修改原提取结果，不把300默认清零伪装正式首帧；不把旧helper直接多次调用当六项原版顺序；不把PetState持久字段作为独立会话时钟；不提前关闭204/all/194/VS-067、六特效或其余家族；不删除原84合同。

状态更新：Ready（2026-10-01；235补证完成后激活），以看板及派生推荐为准。

推荐后续任务：生成同线六增益视觉真值与投影有界任务；公共怪物其他11类型/人偶与完整家族责任继续由204承接，全部满足前不进入下一家族或194。

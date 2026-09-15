# TASK-SETTINGS-221

任务类型：
- `TASK-SETTINGS`

任务模型：
- `逆向任务`

逆向子类型：
- `代码逆向`

逆向方案：
- 不适用

功能条线：
- `LINE-PRE-STAGE-2-3-PRESENTATION`（Active）

目标机制/切片：
- `M-032`、`M-034`、`M-035`、`M-042`、`M-054`、`VS-012`、`VS-067`

规模预算：
- 主工作包：1
- 预计上下文压缩：0
- 独立验收批次：1

拆分触发：
- 本包为玄龟四形态完整行为合同与源级反例，不修改生产实现。不把完整家族缩成一个技能；新视觉资源派生/像素真值采样或正式运行实施必须单独生成同线后续task。若源行为包仍超出2独立批次，先保留完整家族父合同并按继承/消费者边界拆分。

协作计划：
- 模式：主 agent + subagent
- 模型分工：主 agent负责完整合同与归并；有界继承链/消费者只读核对按agent-protocol准入表优先Luna
- 并行工作包：同一玄龟包内源码继承覆盖与现代消费者适用性核对
- 写入 owner：主 agent
- 归并检查点：合同全集冻结前、源级验收前
- 方法观测：无；只有命中既有精确方法触发时按对应规则读取

输入资料：
- 当前线覆盖台账：猴/马/青龙三族完成，玄龟是其余六族之一；216B已明确TestScene转嫁存在而正式Stage1重定向缺失。
- `docs/tasks/evidence/TASK-SLICE-216B/handoff.md`、216B1整数/盾/保护交接、215承伤源索引；这些仅为转嫁/显示输入，不能替代整族行为证据。
- `local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts/export/pet/PetTurtle1.as` 至 `PetTurtle4.as`，按调用窄读BasePet/BaseHero/相关效果与命中消费者；另一旧包只作交叉对照。
- 视觉源优先 `local-resources/regima/source/restored-swfs/` 窄查原命名目标包；本task只登记后续视觉输入需求，不使用旧提取缺失判定视觉缺失。
- 现代 `PetTurtleSkillSystem`、`PetBattleOwnershipSystem`、`PetCombatRuntime`、TestScene与正式HeroParty/Stage1消费者；按LSP+精确源码定位。

输出产物：
- `docs/reverse-engineering/pet-turtle-family-index.md` 和 `docs/tasks/evidence/TASK-SETTINGS-221/handoff.md`：四形态完整普通攻击、每个继承/自有技能、目标/owner优先级、命中与伤害时机、MP/CD/触发、盾/转嫁/反击、hurt/dead与P1/P2/更换/返回/重试生命周期六段证据链。
- 有限合同全集与独立源执行/反例trace：显示量与HP差分离、整数舍入、免疫/盾/转嫁时序，正确区分原代码事实、推断、未知和现代缺口；不得把216的101样本外推为整个家族完成。
- 每合同指向源行/实际caller、执行fixture/期望来源和现代消费者，登记后续视觉矩阵/源SWF时间轴/空间真值需求；机器行为数据有Schema/完整性约束，expected不得从现代实现反算。
- 下一视觉真值与正式运行任务的明确交接边界，保证整族普通攻击及全部技能最终一次完整核销，不把单技能包当完整族样本。

完成定义：
- 四形态当前行为合同全集可独立验证并交接；只关闭本代码证据包，不宣称玄龟现代复现、视觉verified或P1门禁完成。未知若影响行为验收则本task不通过，先治理证据缺口。

验收标准：
- 正反源级执行覆盖关键目标/owner、hit/miss/重复、整数/致死/保护、继承/触发/销毁合同；关键source/owner/timing/分支变异必须拒绝。
- 当前消费者矩阵覆盖TestScene与正式五关，清楚指出已有与尚缺路径；无mock现代场景完成声明。
- 原始提取不变；check:workflow、check:annotations、audit:problems和git diff --check通过；按实际新增工具运行专项。

禁止范围：
- 不实现生产家族、不改战斗公式/存档，不重新提取旧目录，不跨六族批量逆向，不提前进入194，不新建系统设计方案。

状态更新：
- 归档本包并生成同线玄龟视觉真值/正式实现接续合同；所有视觉/行为/正式消费者齐备前，玄龟与TASK-ARCH-204/VS-067保持未闭合。

推荐后续任务：
- 依据本包完整玄龟合同与视觉缺口生成同线下一有界任务；不能跳过源视觉真值直接宣称整族实现。

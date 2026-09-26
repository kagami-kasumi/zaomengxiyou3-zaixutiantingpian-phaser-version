# TASK-SLICE-238

任务类型：`TASK-SLICE`

任务模型：`常规任务`

功能条线：`LINE-PRE-STAGE-2-3-PRESENTATION`（Active；本任务 Ready）

目标机制/切片：`M-030`、`M-032`、`M-040`、`VS-067`

要解决的问题：231核定原版curAttackTarget是有生命周期的英雄/宠物对象，而当前TestScene以AI slot发经验、正式四关只向hero发全额经验、宠物身份在命中后丢失，Stage1-1 Boss弹体路径还未写归属。公共奖励去重不能证明接收者正确；PG-006 V2由本项落实，不另起治理执行项。

范围：以231的XP-01..08为唯一输入，完成同一公共怪物经验归属合同的命中写入、合法AI重选/清理、死亡快照、hero/pet分配、幂等与实际进度/存档消费；覆盖当前12类型、五关与TestScene普通怪/Boss。保留当前怪物/奖励/宠物owner，关卡只适配；不按关卡复制分配规则，不重做整套AI或掉落系统。经验与dropAura的读取时机分别保留，不顺手把XP快照强加给掉落。

规模预算：
- 主工作包：1
- 预计上下文压缩：0
- 独立验收批次：1

拆分触发：
- 若需要新增任意AI排序、删除宠物数据、非当前12类型的奖励覆写、升级视觉或掉落资料族，先保留当前合同并补证/拆分；不凭slot补猜对象或扩大为全怪物AI改造。
- 现有入口合并与同一合同五关联合验收属于一包；若出现独立存档架构改造而非既有owner接线，核对预算后先拆分，不能降级为只测helper。

协作计划：
- 模式：主 agent + subagent。
- 模型分工：主agent实现公共归属和真实消费者；简单独立入口核查/反例复验优先Luna只读。
- 并行工作包：subagent核对五关/TestScene入口和原expected，主agent完成共享owner接线。
- 写入 owner：主 agent。
- 归并检查点：联合验收前。
- 方法观测：无。

输入资料：
- `docs/reverse-engineering/monster-death-experience-contract.md`（XP-01..08、六段证据链、现代消费者矩阵）。
- `tools/monster-reward-source/` 与本地231 `source-trace.json/source-audit.json/verification.json`；原包AIR264例是有界方法运行，不是完整游戏回放。源哈希不变时复用，不反复重采。
- `tools/pet-target-owner-preflight.ts` 与226 `target-owner-preflight.json`（当前诊断明确断言错误P2，不得把退出0当修复）。
- `docs/architecture/src-boundaries.md`、`docs/workflow/problems/PG-006-怪物物理与死亡奖励按关卡漂移.md` V2；沿231矩阵窄读命中、AI、死亡、进度与存档真实消费者。
- 226原41/43承接责任、236击退相位，以及未完成232身体/死亡责任；不得因修归属取消其他责任。

输出产物：
- 公共对象归属与一次性经验结算接入全部上述入口；种类、slot、运行实体身份和持久宠物身份分开，不靠同slot当前宠代替旧宠。
- 独立expected驱动的生产trace、关键生产变异、正式五关/TestScene及真实存档消费者结果。
- 每条矩阵的关闭证据及反例更新，原诊断保留历史并转为修复后的严格断言或迁移到专项。

完成定义：XP-01..08在正式入口/真实模型/真实roster与持久层联合通过；当前12类型和双owner没有遗漏消费者，不以字面map、受控sink或总经验变多代替闭合。

验收标准：
- 有效直击先写具体对象再死亡结算；保护/闪避/碰撞失败不改；接受零伤害或空attackInfo时按源写入时点处理；纯效果tick不改归属。
- 保持合法AI重选，拒绝“始终最近AI”“固定火焰来源”；明确受击/debuff门禁和效果→AI→目标清理相位，不用死亡时fallback伪造原目标。
- 英雄无宠100%，英雄有实际当前宠双方各60%并按int边界；宠物仅原petInfo100%，英雄0。当前宠不得仅从roster的出战标记推断存在，必须符合实际hero.getPet语义。
- 攻击者死亡/离场/换宠、晚到弹体、目标已清理/未清理、再一帧合法AI重选、无存活英雄、P1/P2、重复死亡与重复效果分别有正反样本。失效或不存在petId绝不回退新activePet。
- 真实hero经验、pet经验与保存/重载一一核对；界面读数由现有视图显示，不新增可见UI。死亡时已结算的经验不能在重试/返回/新场景重复发放。
- 五关实际创建的consumer与TestScene普通怪/Boss均走真实攻击；Stage1-1 Boss pet-*通用弹体路径必须单独覆盖。正式四关不能仅测Stage1RewardBridge受控sink。
- 保留既有掉落概率、掉落幂等、怪物物理、击退与玩法生命周期；运行对应窄回归、build、check:structure、check:workflow、audit:problems及正式P1/P2可见经验/重载验证。验收报告明确232未核销边界，不能据本项关闭整线/猴马全族。

禁止范围：不改原始提取结果，不替换原版视觉，不实现231排除的完整掉落/全怪物AI，不自行改经验比例或放宽264源expected，不以受控碰撞为正式攻击验收。

状态更新：Ready（2026-09-26，231归属补证完成后唯一Ready）。

推荐后续任务：`TASK-SETTINGS-232`；继续核定公共身体/攻击/死亡顺序。232..235及完整家族剩余责任保持，不在本次238请求跨task执行。

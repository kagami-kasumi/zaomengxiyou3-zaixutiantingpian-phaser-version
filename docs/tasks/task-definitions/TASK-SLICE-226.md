# TASK-SLICE-226

任务类型：`TASK-SLICE`

任务模型：`常规任务`

功能条线：`LINE-PRE-STAGE-2-3-PRESENTATION`（Active；本任务Ready）

目标机制/切片：`M-032`、`M-034`、`M-042`、`VS-012`、`VS-067`

要解决的问题：猴/马当前普攻在一次决策后启动1000ms倒计时，原版BasePet按连续timeCount取模触发。把这两种现代实现解释成家族原生差异没有依据；现有P1R/P1H通过没有覆盖决策相位。重做两族共同调度及受影响行为绑定，不重做已确认的资源全集，不按技能拆任务。

范围澄清：目前只确认上述偏差，不等于猴马只有这一项问题。工作包1先对两族四形态做一次有界source→正式消费者缺口核查，覆盖step/动画回调和命中先后、技能CD/优先级、攻击/受伤状态门禁、目标/追击/移动、伤害来源/去重、死亡/换宠与双owner。结果在本任务执行记录区分已确认偏差、尚未验证和已证一致，禁止把现代代码差异自行解释为原版差异。依赖同一时序修正的偏差在本项闭合；独立资料/机制缺口按拆分触发交接，不无限扩大为全项目审计。既有素材/正确技能数据按证据复用，不默认全部推倒。

规模预算：
- 主工作包：2
- 预计上下文压缩：0
- 独立验收批次：2

拆分触发：
- 若出现两族之外的独立原版资料缺口或需要另行交付的公共机制改造，必须先核定是否超出范围，超出后拆分；四形态、技能和测试场景是两族验收内部清单，不触发机械拆分。

协作计划：
- 模式：主 agent + subagent
- 模型分工：主agent唯一写入；Luna只读核对原版调度链与独立反例
- 并行工作包：主agent处理公共时序时，子agent核对两族继承/重写方法及相位反例
- 写入 owner：主 agent
- 归并检查点：实现前、验收前
- 方法观测：无

前置与排期：224C已完成全32合同/P1T，本项唯一Ready，先于下一新宠物家族和194。224C猴马回归只证明未新增回归，不能核销本项的原版相位反证。

输入资料：
- `docs/workflow/reverse-engineering-protocol.md`、`docs/architecture/src-boundaries.md`、`docs/architecture/system-designs/pet.md`（实施中、未退出）。
- 原版根：`local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts/`；`base/BasePet.as:159-165`先myIntelligence、后CD/计数递增与59999归零，`:305-382`目标/技能优先级及`:354`的`timeCount % gc.frameClips == 0`。
- 同根`export/pet/PetMonkey1.as:335`、`PetHorse1.as:356`、`PetDragon1.as:366`、`PetTurtle1.as:324`均调用super.myIntelligence；四阶猴699/马722亦调用。执行前沿真实step调用者、frameClips来源、各形态override继续核对，不能把初阶或摘录外推成全族运行证明。
- `docs/reverse-engineering/ground-truth/manifests/task-settings-207-pet-monkey-family.json`、`task-settings-209-pet-horse-family.json`及既有源引用/视觉基准；只修正受反证影响的时序合同和生成入口，保留其他已证事实。适用视觉输入优先窄查restored-swfs。
- `PetCombatRuntime.ts`、`PetCombatEntitySession.ts`、`PetNormalAttackDecision.ts`、猴/马Behavior、Registry、动画/Projectile与正式五关/TestScene消费者；`tools/check-system-design.mjs`中的P1R/P1H和现有两族行为verifier。

输出产物：
- 工作包1：原版调度证据与旧实现失败反例；在既有Runtime/Session中统一原版tick语义，移除或改造PetNormalAttackDecision的无依据倒计时。不得直接把青龙地面物理套给猴马；只复用经证实的调度共性。时钟起点、step先后、暂停/死亡/换宠及59999归零按源核对。
- 工作包2：猴、马各一次完整家族联合验收。两族四形态全部继承/专属技能、普攻、动画命中/实际伤害、双owner与清理回归；补齐时间相位黑盒合同、修正旧测试预期与P1R/P1H门禁。两族结果分别可判，任务在两者全部闭合后完成。

完成定义：两族共享帧时序按源修正，旧实现反例及两族完整联合验收全部通过。

验收标准：
- 先证明旧1000ms实现至少在错相位入范围/技能结束或受伤恢复后可被原版独立expected拒绝，再修改生产代码；expected不得读取现代倒计时或由现代实现生成。
- 覆盖初始计数、非周期节点入范围/获得目标、技能优先占用节点、攻击/受伤恢复、换目标、暂停恢复、计数归零，以及实际支持的host帧率和不同render delta；随机调用次数、两次条件随机边界、首次普攻和后续普攻tick与源一致。未证事实保持未知并阻塞相应完成声明。
- 实际调用公共Runtime/正式消费者取trace，而非只测试新helper；注入重置计时、相位提前/推迟、CD先后和错误owner变异，门禁必须拒绝。
- 两族既有41/43项合同不删减，新增时序责任并明确映射；P1/P2四形态的攻击/技能/命中/伤害/清理联合通过。时序影响的可见状态使用既有显示列表、verified视觉真值和原版基准逐状态对比；资源未变不重复全量提取，无新增视觉例外授权。
- `npm run check:system-design -- pet P1R P1H`必须为0且已包含新增相位反例/变异；青龙/玄龟相关公共时钟回归按改动范围执行；全系统、build、workflow、problem audit和diff通过。未变检查按去重规则复用，不能以当前旧gate=0宣称原版时序正确。

禁止范围：不修改原始提取结果，不新增平行Runtime/Scene时钟，不改存档/成长/装备，不取消原版随机、技能优先级、双人或视觉合同，不宣布pet all/整线完成，不以减少任务为由省略原版证据。

状态更新：完成后同步两族覆盖台账、设计验收记录、M-032/M-042/VS-067及历史纠正备注；PG-017反馈必须以新增语义拒绝能力复核，不能仅恢复旧绿色状态。

推荐后续任务：两族全部闭合后，依据当前线覆盖台账生成下一未完成完整家族任务；194仍等待全部家族闭合。

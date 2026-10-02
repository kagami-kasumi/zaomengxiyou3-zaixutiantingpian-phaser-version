# TASK-SETTINGS-248

任务类型：`TASK-SETTINGS`

任务模型：`逆向任务`

逆向子类型：`视觉真值逆向`

逆向方案：`docs/reverse-engineering/plans/monster3-attack-collision-truth.md`

功能条线：`LINE-PRE-STAGE-2-3-PRESENTATION`（Active）

目标机制/切片：`M-030`、`M-034`、`M-042`、`VS-067`

要解决的问题：247已核实Monster3两独立攻击行为及真实MovieClip相位，但现代两owner仍使用矩形/横向范围和源activeAttack。既有241仅覆盖Monster30Bullet1，不能作为本攻击的像素输入。本项补足Monster3Bullet1/2的显示、注册与实际英雄/宠物colipse命中真值。

规模预算：
- 主工作包：2（两攻击显示树/原生基准；实际目标profile碰撞/相位联合真值）
- 预计上下文压缩：0
- 独立验收批次：2（显示树/Schema/原生重复；命中oracle/变异/消费合同）

拆分触发：
- 出现两个攻击之外的新怪物/技能、公共碰撞算法研发、完整本体动画审计或生产实现需求时，记录缺口并有界拆分，不夹带实施。
- 目标profile若与241已核实构造不同，先列确切构造与所缺输入，再判断独立补证；不得用可见身体或bounding rectangle顶替colipse。

协作计划：
- 模式：主agent + 有界subagent。
- 模型分工：主agent负责原生真值/唯一写入；Luna只读核对目标profile构造适用性与两owner消费清单。
- 并行工作包：只读profile/SHA/消费者差异，与主agent的恢复SWF采样并行。
- 写入 owner：主agent。
- 归并检查点：状态集冻结前、最终验收前。
- 方法观测：仅按实际校验读取触发MO-004，不为采样增加验证。

待证明的可观察问题：
- 两攻击在5/10帧、双方向、原生出生注册点下的实际显示列表、嵌套矩阵、遮罩/滤镜及透明像素是什么？
- 两攻击在真实首次检测第1帧、末帧先检测后销毁、暂停恢复时，对实际英雄/宠物colipse是否命中？
- 247行为偏移与现代独立资源原点怎样无歧义映射；哪些有限栅格差异可说明，哪些命中布尔差异必须拒绝？

输入资料：
- `docs/reverse-engineering/monster3-body-attack-contract.md`、`reference/monster3-body-attack-contract.json`及247本地phase/timeline/source-baseline。
- `docs/workflow/reverse-engineering-protocol.md`、`docs/workflow/reverse-engineering-task-protocol.md`、本项唯一逆向方案、`docs/reverse-engineering/evb-extraction-report.md`、`docs/reverse-engineering/asset-annotation/workflow.md`。
- `local-resources/regima/source/restored-swfs/assets/1.swf`：Monster3Bullet1 character70、5帧；Monster3Bullet2 character74、10帧，均含其实际依赖闭包。
- `docs/reverse-engineering/monster30-attack-collision-contract.md`与241目标profile/原方法HitTest工具，仅复用已核实适用输入；不复用Monster30攻击像素结论。
- AS3窄入口：Monster3.doHi1/doHi2、BaseBullet.step2/checkAttack、BaseHero.beMagicAttack、BasePet.beMagicAttack及目标colipse实际构造。
- 两正式消费者：TestSceneBossArena/Monster3System与Stage13GameplayBridge/Stage1CombatSystem/Stage13MonsterVisualBridge。

状态/fixture：
- 2×(5+10)=30个静态攻击方向/帧状态，保留完整显示依赖；940×590舞台以及明确记录的碰撞ROI，不裁掉原攻击/目标有效像素。
- 沿247三fps、正常/同帧致死/暂停恢复真实相位绑定原native序列，不用受控gotoAndStop矩阵的提前末帧替代。
- 实际英雄/宠物profile逐个列名、源构造与SHA；双方向、命中/不命中/边缘、整数和源可达小数位置必须独立核对。

输出产物：
- `docs/reverse-engineering/monster3-attack-collision-contract.md`与`ground-truth/manifests/monster3-attack-collision.json`（实际生成后才创建），truthId为`task-settings-248.monster3-attack-collision`。
- 原生显示列表/PNG基准、独立源命中oracle、Schema/完整性/源与查询变异、重复生成和适用残差清单。
- 本地大证据位于`local-resources/regima/task-outputs/TASK-SETTINGS-248/`及`docs/tasks/evidence/TASK-SETTINGS-248/`；消费所需输入与生成入口明确。

完成定义：两个攻击的有限显示/空间/真实目标命中合同verified，可直接交给两条现代owner的有界实现；247所有行为合同、原226剩余责任继续保留。

验收标准：
- 恢复源SHA/SymbolClass/依赖闭包、30态显示树/原生基准、注册点/矩阵/方向/层级完整，适用Schema通过；不以整张PNG或总bounds代替命中。
- 原HitTest及实际colipse构造得到独立布尔oracle；查询/帧/矩阵/源输入变异确实改变结果并被拒绝；命中布尔无未解释差异。
- 247实时phase直接引用并核对，不以MovieClip总帧数推出首帧检测；暂停、死后保留、destroy状态有可定位联合输入。
- 重复生成一致，细微视觉例外可按长期授权如实记录，但不扩大为碰撞/时序容差。
- `check:workflow`、`audit:problems`及本项源/Schema/证据验证通过；完整原生基准保留本地，运行资源不得依赖被忽略证据目录。

禁止范围：不修改src/public、原提取与恢复SWF；不消费生产怪物、不做系统重设计、不扩展其他类型/人偶；不关闭204/all/194/VS-067或整线。

状态更新：Ready（2026-10-02；247有界行为证据完成，明确几何/像素输入缺口后承接）。

推荐后续任务：输入verified后生成同线Monster3两条owner独立攻击/实际HP/生命周期实现任务；若本项发现独立输入缺口，先有界补证。

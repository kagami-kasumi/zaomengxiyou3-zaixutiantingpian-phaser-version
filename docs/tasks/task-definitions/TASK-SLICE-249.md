# TASK-SLICE-249

任务类型：`TASK-SLICE`

任务模型：`常规任务`

功能条线：`LINE-PRE-STAGE-2-3-PRESENTATION`（Active）

目标机制/切片：`M-030`、`M-034`、`M-042`、`VS-067`

要解决的问题：247/248已闭合Monster3两攻击的有界行为与空间输入；TestScene Boss及Stage1-3普通Monster3仍依赖activeAttack、矩形/横向范围和旧显示选择。两条正式owner必须共同消费独立攻击合同，不以单条专用Monster3System完成代替通用Stage13消费者。

规模预算：
- 主工作包：2（两owner共享独立攻击/空间资源消费；真实HP/显示/生命周期联合验收）
- 预计上下文压缩：0
- 独立验收批次：2（独立源oracle与生产变异；双owner正式旅程及工程回归）

拆分触发：
- 缺少影响实际HP、自然技能选择或投影的原版输入时，先列确切缺口并生成同线有界补证，不猜补。
- 需要新公共碰撞算法、完整Monster3本体动画重审或其他怪物/人偶迁移时，保留本合同并拆分；不扩张本项。

协作计划：
- 模式：主agent + 有界subagent。
- 模型分工：主agent负责实现/唯一写入；Luna只读核查247 M3-01..08与两owner消费者覆盖。
- 并行工作包：源合同到生产消费者/测试覆盖矩阵，与主agent实现并行。
- 写入 owner：主agent。
- 归并检查点：实现前和最终验收前。
- 方法观测：仅命中实际校验触发时读取MO-004，不为采样增加验证。

输入资料：
- `docs/reverse-engineering/monster3-natural-attack-contract.md`及`reference/monster3-natural-attack-contract.json`，contractId=`task-settings-250.monster3-natural-attack`；两owner共同消费构造/难度、CD相位、自然动作与方向，保留有界移动/效果服务边界。
- `docs/reverse-engineering/monster3-body-attack-contract.md`、`reference/monster3-body-attack-contract.json`及247真实phase/source-baseline。
- `docs/reverse-engineering/monster3-attack-collision-contract.md`、`reference/monster3-attack-collision-contract.json`、`ground-truth/manifests/monster3-attack-collision.json`，truthId=`task-settings-248.monster3-attack-collision`。
- `tools/monster3-collision/`与248本地原生oracle、字段、PNG、精确批准清单；用户只批准428case/451像素，布尔必须零差异。
- `docs/architecture/src-boundaries.md`，既有Monster30独立攻击消费仅作现代接缝参考，不复用其攻击像素/批准清单。
- 两owner：TestSceneBossArena/Monster3System；Stage13GameplayBridge/Stage1CombatSystem/Stage13MonsterVisualBridge及共享Stage11MonsterVisualBridge。
- 226剩余公共责任按既有承接矩阵保留，不据此关闭其他类型或完整家族。

输出产物：
- 两owner共享的Monster3独立攻击生产实现、可重复生成到正式src/public的必要碰撞/显示输入。
- `docs/reverse-engineering/monster3-runtime-acceptance.md`、本地`docs/tasks/evidence/TASK-SLICE-249/`独立覆盖/差异/正式旅程证据。

完成定义：两攻击在两owner下按247/248源合同形成真实英雄/宠物承伤、原生时序与只读显示，源死亡与弹体生命周期解耦；源oracle、生产反证及正式旅程通过，无运行时ignored evidence依赖。

验收标准：
- 247 M3-01..08逐项映射：身体先效果，hit1第7步/hit2第6步发射；原同父偏移与方向；出生下一world步首次第1帧检测；末帧先检测后销毁；hit1间隔999/hit2间隔4；英雄后宠物及拒绝后重试。
- 真实生产HP/保护/闪避/去重由已有权威owner结算，P1/P2和各自宠物均覆盖；不能以服务sink/手动HP写入或仅伤害事件计数验收。
- HP死亡、默认hurt保留已发攻击；显式destroy/退出/重试清空对象与parent/source引用；冰火、同帧致死、暂停子树/恢复、只读重画/持帧/重入不重复发射。
- 全140880原生空间case由正式生产查询复验，命中布尔零差异；精确批准元组外不允许新增碰撞残差，不把任意坐标等价写成已证事实。
- 全30原生状态的两方向显示/注册点/嵌套alpha与135真实检测相位直接消费；正式940×590两owner可见、暂停/死后保留与清理逐状态核对，不用普通怪外观或无console报错代替两攻击可见证据。
- 实际生产源/帧/方向/原点/profile、错误首帧/去重、源死清弹和destroy留弹等变异应被拒绝；独立expected不得由被测实现生成。
- 两owner正式入口/双人/英雄宠物受伤/返回与重进、失败重试；Monster30及已闭合宠物家族相关回归保持。运行build、相关系统回归、check:structure、check:workflow、audit:problems；新运行数据必须随Git交付。

禁止范围：不修改原提取/恢复源，不做系统重设计，不扩展其他怪物或人偶，不关闭204/all/194/VS-067、未迁移家族或整线。

状态更新：Ready（2026-10-02；250自然选择/CD输入verified后恢复；全部原合同保留）。

前置补证已解除：250提供1764组27936态、1644次决策、744自然发射、九源变异与重复；自然选择/CD从本次reference消费，不沿用现代水平<=200、统一0.42或Stage13奇偶猜测。

执行记录（2026-10-02）：
- 主agent与Luna只读核查已归并；247直接指定动作，不含自然技能/CD决策原生trace。239仅目标选择，旧monsters/levels摘要不能填补此边界。
- `node tools/monster3-input-preflight.mjs`：P1/P2共8生产观察，Boss水平含等号判定、攻击中CD停计，Stage13第二攻击伤害hit1/显示映射hit2；这是受控现代诊断，不是原生或正式Scene验收。
- 证据与下一动作：`docs/reverse-engineering/monster3-runtime-preflight.md`；执行250后恢复本项全部两owner/HP/显示/生命周期合同。未修改src/public、247/248真值或原语料。
- `npm run check:structure`通过，8项既有warning；工作流补齐阻塞字段并重生成推荐后通过（保留PlayerSlot别名warning），PG审计8活跃项已集中记录；MO-004到第三批按指标不足停止，PG-019复盘。249未完成，不归档历史。

推荐后续任务：按226公共剩余责任生成同线下一有界类型/输入任务；不得越过剩余公共责任直接宣布全族完成或切线。

250完成补充（2026-10-02）：自然技能输入已解除；原预检记录作为历史保留。两owner实际HP、独立碰撞/显示与全生命周期仍未实施，不把250的接受服务和固定位置当完整场景。下一步执行本项全部验收。

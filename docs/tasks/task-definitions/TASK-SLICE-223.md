# TASK-SLICE-223

当前状态：Ready（2026-09-17）。225独立资源投影已verified，11,572状态全量验收，用户仅批准28状态308像素精确清单；原132态nearest/flip失败候选仍不可消费。本定义全13符号/32合同与两包范围保留，交接见 `docs/tasks/evidence/TASK-SETTINGS-225/handoff.md`。

任务类型：
- `TASK-SLICE`

任务模型：
- `常规任务`

功能条线：
- `LINE-PRE-STAGE-2-3-PRESENTATION`（Active）

目标机制/切片：
- `M-032`、`M-034`、`M-035`、`M-042`、`VS-012`、`VS-067`

规模预算：
- 主工作包：2
- 预计上下文压缩：0
- 独立验收批次：2

拆分触发：
- 两包为完整玄龟视觉资源派生及碰撞字段消费格式。发现新资料族、需要另造 Flash 栅格器或进入正式战斗行为实现时，保留32合同并在执行前拆出同线任务；不得退化为单技能交付。

协作计划：
- 模式：主 agent + subagent
- 模型分工：主agent唯一写入；Luna只读核对源集合与资源消费覆盖
- 并行工作包：主agent派生资源时，子agent核对13对象与32合同无遗漏
- 写入 owner：主 agent
- 归并检查点：派生前、验收前
- 方法观测：无

输入资料：
- 父222 verified `docs/reverse-engineering/ground-truth/manifests/task-settings-222-pet-turtle-family.json`，221行为合同，222A/B原生基准、精确残差许可及完整消费者矩阵。
- `docs/tasks/evidence/TASK-SETTINGS-222B/handoff.md` 与 native corpus。先核定归档完整性，不重新逆向其他宠物。
- `docs/tasks/evidence/TASK-SETTINGS-225/handoff.md`、225补充资源投影manifest、独立owner/paintParts归档与精确视觉许可。225须先verified；完整11,572状态直接消费，禁止退回已失败的nearest/flip候选或使用整fixture贴图。

输出产物：
- 四形态全行/cell/持帧与四攻击、双owner链接buff、奥义buff的可消费资源，递归相位与注册点/透明边界保真；宠物colipse三对象与怪物目标映射分开保存。
- 可重生成的资源manifest与field转换器，源hash、状态ID、尺寸、方向、scale、host tick和消费者映射完整。32合同无独立资源的项目须显式N/A，不能删除。
- 独立解码与逐态差异报告；后续正式Runtime实现合同及消费路径。

完成定义：
- 已核定有限源集合全部可被现代资源层直接消费，原生视觉及碰撞基准逐项对账；本任务不关闭玄龟正式玩法或VS-067。

验收标准：
- 视觉与碰撞分别对账，不用业务测试替代像素。视觉仅允许225的用户精确白名单28状态308像素，须匹配原状态/坐标/双方RGBA，其他零差异；碰撞只有批准的原20案例70像素可近似，不得扩大坐标、状态、算法或宠物范围。
- 原版940×590、P1/P2与所有声明相位逐态覆盖；透明裁切须可逆还原原注册点，不能联合bounds冒充碰撞。
- 重复生成一致，独立变异拒绝source/state/owner/timing/scale/mask/collision，删除一帧/一field必须失败。
- check:structure、check:workflow、check:annotations、audit:problems、git diff --check与资源专项通过。

禁止范围：
- 不改原始提取与恢复SWF；不实现战斗公式、技能调度、存档或其他家族；不提前进入194。

状态更新：
- 完成后归档223，激活同线正式实现首任务；全部32合同继续由后续联合核销，204/VS-067保持未完成。

推荐后续任务：
- 玄龟正式Runtime分批实现：先公共入口/普攻/SLD/TXLJ，再SYBH/奥义/受伤反击与完整双人生命周期，最后按全32合同与视觉碰撞资源在TestScene及五关联合验收。具体有界定义由父222本次交接冻结。

UI 原生化合同：
- 显示列表清单：父222内嵌222A的displayObjects及states，保留13符号递归child、depth、注册点、矩阵、mask/filter和原始命中区。
- 原版机器真值 JSON：`task-settings-222.pet-turtle-family`，`docs/reverse-engineering/ground-truth/manifests/task-settings-222-pet-turtle-family.json`，pet-family-ground-truth Schema；未verified阻塞执行。资源层/Canvas直接消费派生且可回溯状态ID，不另造事实表。
- 原版视觉基准：222A原生24fps、940×590未裁切RGBA与动态host-tick基准；来源/哈希及重放入口见222A/B handoff。
- 允许的现代视觉例外：2026-09-17用户批准225的28状态308像素精确清单，见 `docs/tasks/evidence/TASK-SETTINGS-225/visual-exception-approval.json`；不是通道容差或整个状态豁免。222B批准的20案例70碰撞像素仍独立，不外推为视觉例外。
- 逐状态验收：本批全部声明动作/cell、方向、P1/P2、递归相位、进入/退出与适用技能组合；hover/pressed无对应战斗对象，记N/A。
- 差异证据：原版/现代同态叠图、像素与可见对象差异、原注册点还原；不得以零console或HP变化替代视觉验收。

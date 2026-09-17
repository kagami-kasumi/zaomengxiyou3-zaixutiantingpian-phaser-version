# TASK-SLICE-224A

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
- 新资料族、第三运行时owner或第三独立验收批次须执行前拆分；保留全部32合同及后续联合核销，不缩成单技能完成。

协作计划：
- 模式：主 agent + subagent
- 模型分工：主agent唯一写入；Luna只读核对完整消费者/独立验收
- 并行工作包：主agent实现时，子agent核对本批合同及负例
- 写入 owner：主 agent
- 归并检查点：实现前、验收前
- 方法观测：无

具体系统设计：
- `docs/architecture/system-designs/pet.md`；沿用当前唯一Runtime/EntitySession/Registry/bridge，不新增平行时钟、目标、HP、CD、朝向或移动owner。按设计验收协议执行，本批通过不能退出完整宠物设计。

禁止范围：
- 不修改原始提取/恢复SWF、其他家族或存档格式，不提前进入194，不以旧版1009异常制造现代错误。

输入资料：上述共同证据和当前正式宠物消费者。两工作包为公共玄龟行为/形态定义接入，以及SLD/TXLJ与已有伤害/治疗端口集成。

输出产物：四形态公共初始化与普通攻击，真实范围判断/追击后攻击，SLD释放/follow/hurt不断/自疗，TXLJ双owner效果与盾后伤害转嫁、双向治疗；生产代码直接消费verified资源与碰撞字段，未来技能分支不以占位实现冒充完成。

合同责任：entry.forms、ai.priority、ai.range、ai.owner、ai.target、ai.follow、normal.1..4、sld.gates、sld.release、sld.effect、sld.link-heal、txlj.release、txlj.damage、txlj.heal。ai.priority先保留完整已学技能优先级输入，并明确SYBH/奥义最终由224B验收；不改变原版选择事实。

完成定义：

验收标准：独立源预期验证四形态×P1/P2从范围外追击至范围内才攻击；真实怪物HP变化、miss不计成功、去重/刷新、双方治疗和盾后转嫁顺序，不能只把目标放到弹体中心制造命中。TestScene与正式场景共用生产入口，940×590原版逐态差异、资源/时钟/owner变异拒绝；npm check:structure、build、相关行为/系统回归、check:workflow、check:annotations、audit:problems和diff检查通过。只关闭本批17合同实现责任，完整32合同仍由224C联合验收。

状态更新：

推荐后续任务：归档224A、激活224B；204/VS-067继续未完成。

UI 原生化合同：
- 显示列表清单：父222内嵌222A的displayObjects及states，保留13符号递归child、depth、注册点、矩阵、mask/filter和原始命中区。
- 原版机器真值 JSON：`task-settings-222.pet-turtle-family`，`docs/reverse-engineering/ground-truth/manifests/task-settings-222-pet-turtle-family.json`，pet-family-ground-truth Schema；未verified阻塞执行。资源层/Canvas直接消费派生且可回溯状态ID，不另造事实表。
- 原版视觉基准：222A原生24fps、940×590未裁切RGBA与动态host-tick基准；来源/哈希及重放入口见222A/B handoff。
- 允许的现代视觉例外：空。222B批准的20案例70碰撞像素仅属有限采样，不是视觉例外。
- 逐状态验收：本批全部声明动作/cell、方向、P1/P2、递归相位、进入/退出与适用技能组合；hover/pressed无对应战斗对象，记N/A。
- 差异证据：原版/现代同态叠图、像素与可见对象差异、原注册点还原；不得以零console或HP变化替代视觉验收。

设计验收命令：
- `npm run check:system-design -- pet P1TA`。本批实现并注册该有界gate；独立语义/变异/生产trace支撑，非零阻塞结项。P1TA/P1TB只证明各批，P1T必须联合全部32合同；不降低既有P1R/P1H/P1G。

# TASK-SLICE-224B

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

输入资料：224A生产集成、全部源行为与原生动态/碰撞证据。两工作包为三四阶SYBH与奥义8组合，及受伤反击/伤害快照与结算接入。

输出产物：SYBH scale1/2与原命中间隔；奥义0/2/4/5秒链、跨末帧持续、hurt保护与清理；原始1009缺陷只记录，不复制现代异常。宠物受伤触发QLFJ而非英雄受伤误触发，真实power/快照/去重/防御结算。

合同责任：sybh.release、sybh.effects、aoyi.gate、aoyi.chain、aoyi.damage-window、aoyi.hurt、aoyi.cleanup、damage.power、damage.snapshot、damage.dedup、damage.defense、hurt.counter、hurt.death。与224A的ai.priority、SLD/TXLJ组合同时回归。

完成定义：

验收标准：8种已学组合×P1/P2实际生产时钟/HP/MP/CD/技能顺序和碰撞，最后帧攻击与TTL到期次序，三四阶范围与间隔、反击条件及负例；独立expected不从实现反推，错owner/scale/时点/mask/技能顺序变异必须失败。执行当批设计gate、相关系统回归/build、940×590逐态视觉及项目必需检查。不得以本批技能通过宣布全族生命周期或五关联合完成。

状态更新：

推荐后续任务：归档224B、激活224C；204/VS-067继续未完成。

UI 原生化合同：
- 显示列表清单：父222内嵌222A的displayObjects及states，保留13符号递归child、depth、注册点、矩阵、mask/filter和原始命中区。
- 原版机器真值 JSON：`task-settings-222.pet-turtle-family`，`docs/reverse-engineering/ground-truth/manifests/task-settings-222-pet-turtle-family.json`，pet-family-ground-truth Schema；未verified阻塞执行。资源层/Canvas直接消费派生且可回溯状态ID，不另造事实表。
- 原版视觉基准：222A原生24fps、940×590未裁切RGBA与动态host-tick基准；来源/哈希及重放入口见222A/B handoff。
- 允许的现代视觉例外：空。222B批准的20案例70碰撞像素仅属有限采样，不是视觉例外。
- 逐状态验收：本批全部声明动作/cell、方向、P1/P2、递归相位、进入/退出与适用技能组合；hover/pressed无对应战斗对象，记N/A。
- 差异证据：原版/现代同态叠图、像素与可见对象差异、原注册点还原；不得以零console或HP变化替代视觉验收。

设计验收命令：
- `npm run check:system-design -- pet P1TB`。本批实现并注册该有界gate；独立语义/变异/生产trace支撑，非零阻塞结项。P1TA/P1TB只证明各批，P1T必须联合全部32合同；不降低既有P1R/P1H/P1G。

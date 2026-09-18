# TASK-SLICE-224C

223资源交接：`public/assets/pets/turtle/manifest.json`、`tools/turtle-assets/README.md` 与本地 `docs/tasks/evidence/TASK-SLICE-223/handoff.md`。完整13符号/32合同、独立owner/paintParts、显示树、源时序和碰撞相位均已派生；消费不得依赖被忽略的证据文件，原生复验仍需本地语料。

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

输入资料：224A/B生产代码及父222全32合同/视觉/碰撞矩阵。两工作包为生产全生命周期闭合，以及独立完整家族验收。

输出产物：lifecycle.destroy、lifecycle.replace在换宠/休息/死亡/重试/返回/重载中资源、子弹、定时回调、owner引用完整清理；全部32合同逐项正式消费者和证据落点，四形态P1/P2在TestScene与五关共用入口，无旧玄龟平行路径。

完成定义：

验收标准：所有32合同集合严格相等且不存在pending或未解释N/A；原版视觉与批准的有限碰撞例外分开对账；范围外负例、实际伤害/治疗/反击、8组合、替换与退出后零残留，独立consumer路径变异拒绝。完整玄龟设计gate必须机器返回0，猴/马/青龙回归、全系统/build/正式940×590与零console错误及workflow/annotations/problem audit/diff通过。机器gate不得仅检查字段存在、类型编译或自回放。

状态更新：

推荐后续任务：仅此批满足完整证据时关闭玄龟家族；宠物总设计/204/VS-067仍按其余家族与旧入口实际缺口保持未完成。依据当前线覆盖台账生成下一完整家族任务，不提前进入194。

UI 原生化合同：
- 显示列表清单：父222内嵌222A的displayObjects及states，保留13符号递归child、depth、注册点、矩阵、mask/filter和原始命中区。
- 原版机器真值 JSON：`task-settings-222.pet-turtle-family`，`docs/reverse-engineering/ground-truth/manifests/task-settings-222-pet-turtle-family.json`，pet-family-ground-truth Schema；未verified阻塞执行。资源层/Canvas直接消费派生且可回溯状态ID，不另造事实表。
- 原版视觉基准：222A原生24fps、940×590未裁切RGBA与动态host-tick基准；来源/哈希及重放入口见222A/B handoff。
- 允许的现代视觉例外：225已批准的28状态308像素精确清单，由223资源manifest保留原状态/坐标/双方RGBA；其他零差异。222B批准的20案例70碰撞像素独立，不外推。
- 逐状态验收：本批全部声明动作/cell、方向、P1/P2、递归相位、进入/退出与适用技能组合；hover/pressed无对应战斗对象，记N/A。
- 差异证据：原版/现代同态叠图、像素与可见对象差异、原注册点还原；不得以零console或HP变化替代视觉验收。

设计验收命令：
- `npm run check:system-design -- pet P1T`。本批实现并注册该有界gate；独立语义/变异/生产trace支撑，非零阻塞结项。P1TA/P1TB只证明各批，P1T必须联合全部32合同；不降低既有P1R/P1H/P1G。

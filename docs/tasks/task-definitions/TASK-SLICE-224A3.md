# TASK-SLICE-224A3

玄龟TXLJ双owner结算与224A联合验收。父任务：`TASK-SLICE-224A`（Split）。

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
- 新资料族、第三独立工作包或第三独立验收批次出现时，先窄查证据再拆分；文件数量和实际compact不作触发。不得新增平行Runtime、时钟、HP、CD或目标owner。

协作计划：
- 模式：主 agent + subagent
- 模型分工：主agent唯一写入；Luna只读核对合同/独立预期和负例
- 并行工作包：主agent实现时，子agent核对本批输入及验收覆盖
- 写入 owner：主 agent
- 归并检查点：实现前、验收前
- 方法观测：无

具体系统设计：
- `docs/architecture/system-designs/pet.md`；沿用唯一Runtime/EntitySession/Registry及正式公共bridge，按设计验收协议执行，本批不得退出完整宠物设计。

输入资料：
- 父 `TASK-SLICE-224A` 全部17责任与UI合同；`docs/reverse-engineering/pet-turtle-family-index.md`、221行为合同、222/225 verified输入与223交接。
- `public/assets/pets/turtle/manifest.json`、`tools/turtle-assets/README.md`、`docs/tasks/evidence/TASK-SLICE-223/handoff.md`。
- `docs/tasks/evidence/TASK-SLICE-224A/preflight.md` 的已核对接缝与拆分依据。只窄读本批涉及的源码/原生输入；不得把历史最小技能建议当成完整家族事实。

禁止范围：
- 不修改原始提取/恢复SWF，不重做223资源派生，不改存档格式，不提前执行224B/C或194；不降低猴/马/青龙门禁，不以旧1009缺陷制造现代错误。
- 运行只依赖Git交付数据；原生复验可依赖本地语料。全部13符号/32合同继续保留，不以本批有限通过宣布整族完成。

要解决的问题：正式enemy→hero路径未传盾后转嫁，公共Context无主人治疗端口；旧TestScene玄龟入口不能证明正式双owner合同。

前置依赖：224A1/224A2通过且仍可回归；缺口修复归属原子项，不用联合验收掩盖前置失败。

主工作包：
1. 通过既有HeroCombat/PetCombat/Party owner的窄端口接通TXLJ双buff、刷新/去重、盾后转嫁、SLD链接治疗和双方治疗；不新增平行HP或buff owner。
2. 生产P1/P2/TestScene/正式消费者核销A全部17责任，整合源预期、行为/视觉/碰撞和负例，关闭父A后交B。

合同责任：sld.link-heal、txlj.release、txlj.damage、txlj.heal，共4项；与A2的13项并集严格等于父A的17项，无丢失/重复核销。全部32合同仍由224C最终联合验收。

输出产物：正式双owner治疗/伤害适配、真实链接显示及生命周期、P1TA完整语义gate、父A联合合同矩阵与B/C交接。

完成定义：四项在真实生产路径核销，并运行P1TA=0同次验证A1/A2与全部17项。父A仍不能据此宣称SYBH/奥义或玄龟家族完整；A3完成才同次归档父A并激活224B。

验收标准：双buff/单边buff/过期/刷新、盾完全吸收/部分吸收后101伤害pet6/hero95、101治疗双方106及截断顺序、P1/P2互不串线、SLD二三四阶owner治疗差异、正式与TestScene共享入口/真实HP；错owner、盾前转嫁、假命中、重复治疗和错误buff有效条件变异拒绝。940×590链接双owner逐态原生差异、重复进入/替换/退出清理，P1TA、猴马龙回归、相关系统/build、structure、workflow、annotations、audit/diff通过。

设计验收命令：`npm run check:system-design -- pet P1TA`。本批注册完整有界gate，强制组合P1TA0/P1TA1与4项结算语义；P1TB/P1T和all继续未完成。

状态更新：2026-09-18，Planned；本批尚未实施。

推荐后续任务：TASK-SLICE-224B；保持功能线Active。

UI 原生化合同：
- 显示列表清单：父222内嵌222A的displayObjects及states，保留13符号递归child、depth、注册点、矩阵、mask/filter和原始命中区。
- 原版机器真值 JSON：`task-settings-222.pet-turtle-family`，`docs/reverse-engineering/ground-truth/manifests/task-settings-222-pet-turtle-family.json`，pet-family-ground-truth Schema；未verified阻塞执行。资源层/Canvas直接消费派生且可回溯状态ID，不另造事实表。
- 原版视觉基准：222A原生24fps、940×590未裁切RGBA与动态host-tick基准；来源/哈希及重放入口见222A/B handoff。
- 允许的现代视觉例外：225已批准的28状态308像素精确清单，由223资源manifest保留原状态/坐标/双方RGBA；其他零差异。222B批准的20案例70碰撞像素独立，不外推。
- 逐状态验收：本批全部声明动作/cell、方向、P1/P2、递归相位、进入/退出与适用技能组合；hover/pressed无对应战斗对象，记N/A。
- 差异证据：原版/现代同态叠图、像素与可见对象差异、原注册点还原；不得以零console或HP变化替代视觉验收。


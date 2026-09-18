# TASK-SLICE-224A2

玄龟公共行为、四形态普攻与SLD战斗链。父任务：`TASK-SLICE-224A`（Split）。

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
- 已完成A1：`tools/turtle-runtime/README.md`、`docs/tasks/evidence/TASK-SLICE-224A1/handoff.md`；直接消费同一pet-turtle bundle、bodyAnimation/fieldAt及只读presenter，不另建加载或owner。
- 父 `TASK-SLICE-224A` 全部17责任与UI合同；`docs/reverse-engineering/pet-turtle-family-index.md`、221行为合同、222/225 verified输入与223交接。
- `public/assets/pets/turtle/manifest.json`、`tools/turtle-assets/README.md`、`docs/tasks/evidence/TASK-SLICE-223/handoff.md`。
- `docs/tasks/evidence/TASK-SLICE-224A/preflight.md` 的已核对接缝与拆分依据。只窄读本批涉及的源码/原生输入；不得把历史最小技能建议当成完整家族事实。

禁止范围：
- 不修改原始提取/恢复SWF，不重做223资源派生，不改存档格式，不提前执行224B/C或194；不降低猴/马/青龙门禁，不以旧1009缺陷制造现代错误。
- 运行只依赖Git交付数据；原生复验可依赖本地语料。全部13符号/32合同继续保留，不以本批有限通过宣布整族完成。

要解决的问题：Registry没有turtle；公共步骤尚未消费四形态范围/动画/真实攻击，旧SLD把效果放到目标位置不能证明原版命中链。

前置依赖：224A1生产资源API、投影与位平面验收通过。

主工作包：
1. 同一Registry/Runtime/EntitySession接入四形态初始化、AI/范围/跟随和实际本体时钟，不复制公共步骤。
2. 普攻与SLD真实效果、原生碰撞到怪物HP、自疗和hurt不断；正式/TestScene共用生产入口与224A1投影。

合同责任：entry.forms、ai.priority、ai.range、ai.owner、ai.target、ai.follow、normal.1、normal.2、normal.3、normal.4、sld.gates、sld.release、sld.effect，共13项。ai.priority保留完整已学技能顺序的输入合同，TXLJ由A3、SYBH/奥义由B补齐；不得把未来分支假成功或改写原版选择顺序。

输出产物：四形态生产Behavior、真实普通攻击/SLD、独立源expected和生产trace。sld.link-heal及TXLJ四项明确交A3，不把它们描述为本批完成。

完成定义：上述13项经生产入口和P1TA1有界语义gate核销；真实P1/P2范围外追击、范围内攻击、原生mask命中、miss拒绝、攻击去重和SLD创建时自疗全部有正反证据。

验收标准：四形态×P1/P2，40/120/150/150范围边界、SLD49/50/200/201、非最近目标/旧目标失效、真实cell倒计时回调、hurt期间SLD继续、自疗不依赖命中；效果位置由源根偏移得出，不能摆到目标中心。测试取源独立expected，对range/时钟/mask/owner/source变异拒绝。940×590正式与TestScene可见及进入退出通过；build、相关系统/既有家族回归、structure、workflow、annotations、audit及diff通过。

设计验收命令：`npm run check:system-design -- pet P1TA1`。本批注册并实现有界gate，组合P1TA0；本批不替代最终P1TA。

状态更新：2026-09-18，Ready；A1资源消费P1TA0已通过，本批行为尚未实施。

推荐后续任务：TASK-SLICE-224A3；保持功能线Active。

UI 原生化合同：
- 显示列表清单：父222内嵌222A的displayObjects及states，保留13符号递归child、depth、注册点、矩阵、mask/filter和原始命中区。
- 原版机器真值 JSON：`task-settings-222.pet-turtle-family`，`docs/reverse-engineering/ground-truth/manifests/task-settings-222-pet-turtle-family.json`，pet-family-ground-truth Schema；未verified阻塞执行。资源层/Canvas直接消费派生且可回溯状态ID，不另造事实表。
- 原版视觉基准：222A原生24fps、940×590未裁切RGBA与动态host-tick基准；来源/哈希及重放入口见222A/B handoff。
- 允许的现代视觉例外：225已批准的28状态308像素精确清单，由223资源manifest保留原状态/坐标/双方RGBA；其他零差异。222B批准的20案例70碰撞像素独立，不外推。
- 逐状态验收：本批全部声明动作/cell、方向、P1/P2、递归相位、进入/退出与适用技能组合；hover/pressed无对应战斗对象，记N/A。
- 差异证据：原版/现代同态叠图、像素与可见对象差异、原注册点还原；不得以零console或HP变化替代视觉验收。


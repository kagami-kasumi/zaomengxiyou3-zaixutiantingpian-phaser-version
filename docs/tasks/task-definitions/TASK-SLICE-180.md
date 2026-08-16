# TASK-SLICE-180

任务类型：
- `TASK-SLICE`

功能条线：
- `LINE-CORE-PROGRESSION-COMPLETION`（Active；Planned）

目标机制/切片：
- `M-035`、`M-042`、`M-052`、`VS-054`

规模预算：
- 主工作包：2
- 预计上下文压缩：0
- 独立验收批次：2

拆分触发：
- 若消费 932 真值之外还需派生新源包资源、修改宠物业务 owner 或迁移第二页面，立即拆分；本 task 只原生化宠物单页。

协作计划：
- 模式：单 agent
- 并行工作包：无
- 写入 owner：主 agent
- 归并检查点：不适用
- 方法观测：无

输入资料：
- `TASK-SETTINGS-175A-pet-page.md`、truthId `task-settings-175a.pet-page`、`FormalPetPageView.ts`、现有宠物页面/owner 专项。

输出产物：
- `FormalPetPageView` 直接消费 manifest 或其可重复只读投影；删除现代暗层、矩形、Arial 标题/按钮和摘要。
- 原版/现代 940×590 并排、50% 叠图、逐对象差异、P1/P2/分页/确认/洗练/进化/关闭运行证据。

UI 原生化合同：
- 显示列表清单：直接消费 manifest 74 对象的父子/depth/matrix/bounds/命中和动态 child；不复制坐标表。
- 原版机器真值 JSON：`task-settings-175a.pet-page`，`verified`；实现和专项回测对象/状态/舞台坐标。
- 原版视觉基准：`docs/tasks/evidence/TASK-SETTINGS-175A/original-*-940x590.png`，RegiMA 1.1、940×590。
- 允许的现代视觉例外：空。
- 逐状态验收：16 个 manifest 状态及 normal/hover/pressed/selected、两页、8 技能、P1/P2、进入/返回。
- 差异证据：同尺寸并排/叠图、对象级差异与字体边缘容差；额外现代可见层零容差。

完成定义：
- 宠物页不再存在未经批准的现代覆盖层，真值被实现与测试直接消费，业务 owner、双玩家隔离和当前存档行为保持。

验收标准：
- `test:pet-page-truth`、宠物页面/owner/存档专项、全系统、build、structure/workflow/annotations、940×590 逐状态与零 console 通过。

禁止范围：
- 不重写宠物成长/战斗/道具/存档；不处理法宝或其他功能页；不引入通用现代按钮皮肤。

状态更新：
- 更新覆盖台账、mechanics/vertical slices、看板/history；本页实现完成不代表 VS-054 或功能线关闭。

推荐后续任务：
- 按 175A..I 证据链与同线调度结果继续，不切入 Stage 2-3。


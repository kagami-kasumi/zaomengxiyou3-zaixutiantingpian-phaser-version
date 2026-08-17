# TASK-SLICE-188

任务类型：
- `TASK-SLICE`
功能条线：
- `LINE-CORE-PROGRESSION-COMPLETION`（Active；Ready）
目标机制/切片：
- `M-035`、`M-044`、`M-052`、`VS-059`
规模预算：
- 主工作包：2
- 预计上下文压缩：0
- 独立验收批次：2
拆分触发：
- 若 990/969/1006 真值直连外还需修改丹药事务、存档 schema、派生新视觉族或迁移第二页面，立即拆分。
协作计划：
- 模式：单 agent
- 并行工作包：无
- 写入 owner：主 agent
- 归并检查点：不适用
- 方法观测：无
输入资料：
- `TASK-SETTINGS-175E-immortality-page.md`、truthId `task-settings-175e.immortality-page`、`ImmortalityScene.ts`、`FormalImmortalityPageSystem.ts` 与现有丹药专项。
输出产物：
- `ImmortalityScene` 直接消费 manifest 或可重复只读投影，删除页面内手写槽位、角色 selector、字段、按钮与 overlay 视觉真值源。
- 原版/现代 940×590 并排、50% 叠图、逐对象差异与 owner/服用/炼制/拒绝/关闭运行证据。
UI 原生化合同：
- 显示列表清单：直接消费 132 对象的父子/depth/matrix/bounds/命中、25 个 969 槽、五 owner selector、动态已服用图与 1006 overlay，不复制坐标表。
- 原版机器真值 JSON：`task-settings-175e.immortality-page`，`verified`；实现和专项回测 26 状态。
- 原版视觉基准：`docs/tasks/evidence/TASK-SETTINGS-175E/original-*-940x590.png`，RegiMA 1.1、940×590、OtherMat1.swf 990/969/1006。
- 允许的现代视觉例外：成功后即时保存为既有离线可靠性选择；宿主反馈不冒充页面 child；新增可见例外为空。
- 逐状态验收：normal/owner、槽 hover/pressed/selected/locked/eaten、1006 打开/材料拒绝/容量拒绝/成功/关闭、P1/P2、页面关闭/重开。
- 差异证据：同尺寸并排/叠图、对象级差异与透明边缘容差；额外现代可见层零容差。
完成定义：
- 丹药实现与测试直接消费真值，页面手写视觉真值源删除，既有五类五阶、背包/灵魂、P1/P2、当前 schema 与路由保持。
验收标准：
- `test:immortality-page-truth`、丹药业务/存档专项、全系统、build、structure/workflow/annotations、940×590 逐状态与零 console 通过。
禁止范围：
- 不改丹药配方/数值、背包事务、存档 schema、其他功能页或 Stage 2-3；不新增现代可见标题、面板、确认层或通用按钮。
状态更新：
- 更新覆盖台账、mechanics/vertical slices、看板/history，并审查本功能线关闭合同；本 task 不在同一次 `/goal` 执行 Stage 2-3。
推荐后续任务：
- 完成后审查当前功能线关闭合同；若全部满足，则关闭本线并激活 `LINE-STAGE-2-3 / TASK-SETTINGS-064` 后结束当次 `/goal`。

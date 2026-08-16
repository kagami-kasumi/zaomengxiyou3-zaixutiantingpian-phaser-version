# TASK-SLICE-187

任务类型：
- `TASK-SLICE`
功能条线：
- `LINE-CORE-PROGRESSION-COMPLETION`（Active；Planned）
目标机制/切片：
- `M-005`、`M-006`、`M-050`、`M-052`、`VS-052`
规模预算：
- 主工作包：2
- 预计上下文压缩：0
- 独立验收批次：2
拆分触发：
- 若 1149/901 真值直连外还需修改存档 schema/建档事务、派生新视觉族或迁移第二页面，立即拆分。
协作计划：
- 模式：单 agent
- 并行工作包：无
- 写入 owner：主 agent
- 归并检查点：不适用
- 方法观测：无
输入资料：
- `TASK-SETTINGS-175I-party-creation.md`、truthId `task-settings-175i.party-creation`、`SavePartyCreationView.ts`、现有 save-party flow 专项。
输出产物：
- `SavePartyCreationView` 直接消费 manifest 或可重复只读投影，删除手写 RoleImageX/registration/hit bounds 与人数命中真值源。
- 原版/现代 940×590 并排、50% 叠图、逐对象差异与 1P/2P/取消/完成/重载运行证据。
UI 原生化合同：
- 显示列表清单：直接消费 20 对象的父子/depth/matrix/bounds/命中/隐藏对象/marker，不复制坐标表。
- 原版机器真值 JSON：`task-settings-175i.party-creation`，`verified`；实现和专项回测 30 状态。
- 原版视觉基准：`docs/tasks/evidence/TASK-SETTINGS-175I/original-*-940x590.png`，RegiMA 1.1、940×590、901 导出裁切 y=189..778。
- 允许的现代视觉例外：角色 Escape 为不可见输入；最终点击原子建槽为用户批准流程映射；可见例外为空。
- 逐状态验收：人数 normal/hover/pressed、五卡 normal/hover/pressed/selected、P1→P2、取消/完成/重载。
- 差异证据：同尺寸并排/叠图、对象级差异与透明边缘容差；额外现代可见层零容差。
完成定义：
- 建档/选角实现与测试直接消费真值，手写视觉真值源删除，既有原子事务、单 schema、路由与 owner 保持。
验收标准：
- `test:party-creation-truth`、save-party flow/存档专项、全系统、build、structure/workflow/annotations、940×590 逐状态与零 console 通过。
禁止范围：
- 不改存档 schema、迁移策略、建档业务或其他功能页；不新增可见确认/取消/标题/边框。
状态更新：
- 更新覆盖台账、mechanics/vertical slices、看板/history；本页直连不代表功能线关闭。
推荐后续任务：
- 按 180..187 的同线实现批次继续，不切入 Stage 2-3。

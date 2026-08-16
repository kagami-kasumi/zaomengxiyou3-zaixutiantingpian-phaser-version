# TASK-SLICE-181

任务类型：
- `TASK-SLICE`

功能条线：
- `LINE-CORE-PROGRESSION-COMPLETION`（Active；Ready）

目标机制/切片：
- `M-035`、`M-043`、`M-052`、`VS-054`

规模预算：
- 主工作包：2
- 预计上下文压缩：0
- 独立验收批次：2

拆分触发：
- 若消费 596 真值之外还需派生第二视觉源包、改写强化/重置业务 owner 或迁移第二页面，立即拆分；本 task 只原生化法宝单页。

协作计划：
- 模式：单 agent
- 并行工作包：无
- 写入 owner：主 agent
- 归并检查点：不适用
- 方法观测：无

输入资料：
- `TASK-SETTINGS-175B-magic-weapon-page.md`、truthId `task-settings-175b.magic-weapon-page`、`FormalMagicWeaponPageView.ts` 与现有法宝页面/owner 专项。

输出产物：
- `FormalMagicWeaponPageView` 直接消费 manifest 或其可重复只读投影；删除现代暗层、矩形、Arial 标题/按钮和摘要。
- 原版/现代 940×590 并排、50% 叠图、逐对象差异、升级/重置/确认/拒绝/关闭运行证据。

UI 原生化合同：
- 显示列表清单：直接消费 manifest 28 对象的父子/depth/matrix/bounds/命中和动态确认 child；不复制坐标表。
- 原版机器真值 JSON：`task-settings-175b.magic-weapon-page`，`verified`；实现和专项回测 21 状态、舞台坐标和 P2 负向边界。
- 原版视觉基准：`docs/tasks/evidence/TASK-SETTINGS-175B/original-*-940x590.png`，RegiMA 1.1、940×590。
- 允许的现代视觉例外：空。
- 逐状态验收：manifest 21 状态及三个根按钮/确认按钮 normal/hover/pressed、动态字段、普通/特殊升级确认、取消、重置、拒绝、进入/返回。
- 差异证据：同尺寸并排/叠图、对象级差异与字体边缘容差；额外现代可见层零容差。

完成定义：
- 法宝页不再存在未经批准的现代覆盖层，真值被实现与测试直接消费，既有 P1 owner、强化/重置事务和当前存档行为保持；不伪造 P2 原版入口。

验收标准：
- `test:magic-weapon-page-truth`、法宝页面/owner/存档专项、全系统、build、structure/workflow/annotations、940×590 逐状态与零 console 通过。

禁止范围：
- 不重写法宝战斗、强化/重置、库存、灵魂或存档；不处理宠物/host/其他功能页；不引入通用现代按钮皮肤。

状态更新：
- 更新覆盖台账、mechanics/vertical slices、看板/history；本页实现完成不代表 VS-054 或功能线关闭。

推荐后续任务：
- 按 175A..I 证据链与同线调度结果继续，不切入 Stage 2-3。

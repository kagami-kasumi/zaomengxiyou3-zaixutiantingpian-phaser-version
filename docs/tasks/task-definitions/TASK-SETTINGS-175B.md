# TASK-SETTINGS-175B

任务类型：
- `TASK-SETTINGS`
功能条线：
- `LINE-CORE-PROGRESSION-COMPLETION`（Active；Planned）
目标机制/切片：
- `M-035`、`M-043`、`M-052`、`VS-054`
规模预算：
- 主工作包：2
- 预计上下文压缩：0
- 独立验收批次：2
拆分触发：
- 若 596 外还需第二视觉源包或进入可见实现，立即拆分；只闭合法宝页真值。
协作计划：
- 模式：单 agent
- 并行工作包：无
- 写入 owner：主 agent
- 归并检查点：不适用
- 方法观测：无
输入资料：
- 协议/Schema、175 审计、`magic-weapons-index.md`、`full-function-ui-index.md`；恢复源 `assets/backpack1.swf` SHA-256 `70C1F1B535EA789AD9C77556F90C7C107084278A4D1773E31471F2B4D7454936` character 596 与 `SutraInterface` 调用链。
输出产物：
- 596 显示列表/证据矩阵/逐状态基准及 `ground-truth/manifests/task-settings-175b-magic-weapon-page.json`；冻结单页实现合同。
UI 原生化合同：
- 显示列表清单：596 根、字段、装备/材料投影、按钮/确认态、动态 child、命中区和矩阵。
- 原版机器真值 JSON：truthId `task-settings-175b.magic-weapon-page`；未装备、normal、升级可用/拒绝、确认/取消、重置、反馈、关闭；Schema、SHA/locator、对象/状态完整性和 `unresolved=[]`。
- 原版视觉基准：原版 1.1、940×590、596 各状态。
- 允许的现代视觉例外：空；现有现代标题、面板、摘要和通用按钮均待整改。
- 逐状态验收：normal/hover/pressed、动态字段、确认/取消、进入/返回。
- 差异证据：同尺寸并排/叠图、逐对象差异及容差入口。
完成定义：
- manifest verified 且无影响实现未知；未修改可见实现。
验收标准：
- Schema/哈希/locator/完整性/回测、`check:workflow`、适用标注、`git diff --check` 通过。
禁止范围：
- 不重写强化规则，不进入宠物/host 或 `src/`。
状态更新：
- 更新审计、台账、机制/切片、看板/history；verified 后生成法宝实现 task。
推荐后续任务：
- `TASK-SETTINGS-175C`。

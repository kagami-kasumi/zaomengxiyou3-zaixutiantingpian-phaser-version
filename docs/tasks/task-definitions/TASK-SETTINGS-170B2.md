# TASK-SETTINGS-170B2

任务类型：

- `TASK-SETTINGS`

功能条线：

- `LINE-CORE-PROGRESSION-COMPLETION`（Active；170B 因来源族拆分，170B1 已归档）

目标机制/切片：

- `M-035`、`M-036`、`M-037`、`M-052`、`VS-064`

规模预算：

- 主工作包：1
- 预计上下文压缩：0
- 独立验收批次：1

拆分触发：

- 若五角色穿戴资源必须派生大量现代文件、需要运行原 EXE/GUI 消歧、修改 `src/`、事务或存档，立即停止并拆出后续资源接入 task；本 task 只生成 provenance 目录和可复查证据。

协作计划：

- 模式：单 agent
- 并行工作包：无
- 写入 owner：主 agent
- 归并检查点：164 `fillName` 与图标/适用穿戴资源覆盖核对后
- 方法观测：无

输入资料：

- `docs/workflow/reverse-engineering-protocol.md`、`evb-extraction-report.md`、`asset-annotation/workflow.md`。
- 170A `equipment-data-catalog-1.1.json`、`inventory-resource-catalog-1.1.json`、170B1 verified manifest 与证据矩阵。
- restored `EIcon1/EIcon2`、`MagicWeapon2`、`1_MainLoad__main1`、五角色主包及 2012 补丁包；`ShowObj.as`、`HeadSprite.as`、五角色装备消费者。

输出产物：

- 164 件装备图标与适用角色穿戴/称号资源的一对一机器目录和生成器。
- 每项源 SWF hash、SymbolClass/character id、时间轴/注册点/可见边界、locator、证据等级、缺陷与反证条件。
- 资源族批次/annotation、完整性统计、代表性原资源基准和后续 170C 接入合同。

完成定义：

- 164 个 170A `fillName` 与图标一一对应；武器/防具/称号明确对应 `HeadSprite` 消费资源，法宝/饰品明确标记“不改变角色预览”。
- 五角色、默认/特殊 showId、Role4 shovel/arrow 分支、Role5 动态换装以及 520/521 等目录缺陷均有确认事实或明确反证；影响接入的未知为零。
- 父任务 170B 的资源工作包完成后归档，并生成 `TASK-SLICE-170C`。

UI 原生化合同：

- 显示列表清单：直接引用 170B1 `task-settings-170b1.equipment-page` 的 `HeadSprite`、六槽与 `ShowObj` 清单；本 task 不复制页面坐标。
- 原版机器真值 JSON：资源目录以独立 Schema/生成器闭合，页面几何继续消费 170B1 verified manifest。
- 原版视觉基准：保存原 Symbol/时间轴代表性接触表或 940×590 source-derived fixture；现代截图不得充当原版来源。
- 允许的现代视觉例外：无；原版缺陷记录为缺陷，不派生替代图。
- 逐状态验收：五角色、武器/防具/称号、默认/特殊 showId、Role4 双分支、Role5 动态换装、图标别名与不适用槽位。
- 差异证据：逐项列出存在/缺失/别名/跨包/不可见资源及反证条件；未闭合时保持 Ready/Blocked，不标 verified。

验收标准：

- 自动校验 164 唯一身份、图标覆盖、适用穿戴资源、源 hash、SymbolClass/character id、父目录与未知/缺陷统计。
- 运行 equipment/inventory catalog、annotation、workflow、problem audit 与 `git diff --check`。

禁止范围：

- 不修改 `src/`、现代资产 bundle、装备事务、数值、存档或正式页面。
- 不修改/重新生成 `legacy-extraction`，不从现代截图反推原资源，不为原版缺陷制作替代层。

状态更新：

- 更新 mechanics、功能线覆盖、task-board/task-history；170B2 完成后归档 Split 父任务 170B 并生成同线 170C。

推荐后续任务：

- `TASK-SLICE-170C`：消费 170A 数据、170B1 verified UI 真值与 170B2 资源目录，接入唯一 equipment/inventory owner。


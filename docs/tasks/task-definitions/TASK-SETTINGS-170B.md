# TASK-SETTINGS-170B

任务类型：

- `TASK-SETTINGS`

功能条线：

- `LINE-CORE-PROGRESSION-COMPLETION`（Active；`TASK-SETTINGS-170A` 已归档）

目标机制/切片：

- `M-035`、`M-036`、`M-037`、`M-052`、`VS-064`

规模预算：

- 主工作包：2
- 预计上下文压缩：0
- 独立验收批次：2

拆分触发：

- 如果正式背包/穿戴显示列表与 164 项图标/角色穿戴资源不能由同一恢复源族和可重复生成管线闭合，立即拆成 170B1/170B2；发现需要派生大量现代资源、修改 `src/`、接入 170A 数值、调整事务或升级存档时只登记并拆给后续 task。

协作计划：

- 模式：单 agent
- 并行工作包：无
- 写入 owner：主 agent
- 归并检查点：显示列表与动态状态集冻结后、164 项视觉资源覆盖核对前
- 方法观测：无

输入资料：

- `docs/workflow/reverse-engineering-protocol.md`、`docs/reverse-engineering/ground-truth/README.md`、`evb-extraction-report.md`、`asset-annotation/workflow.md`。
- `equipment-data-catalog.md`、`reference/equipment-data-catalog-1.1.json`、`inventory-resource-catalog.md`、正式背包 165B/166A..D 与 165D 的既有证据。
- `local-resources/regima/source/restored-swfs/` 中优先窄查 `backpack1.swf`、`EIcon1/EIcon2` 和由 164 `fillName`/SymbolClass 定位的角色穿戴源包；`BackPack.as`、`PackThings.as`、`ShowObj.as`、`HeadSprite.as` 与角色外观共享消费者。

输出产物：

- 正式背包/装备页根、六槽、动态 TextField、按钮/操作层、角色切换与穿脱状态的显示列表清单和 `verified` 原版机器真值 JSON。
- 164 件装备图标与适用角色穿戴资源的一对一 provenance 目录，记录源 SWF hash、SymbolClass/character id、时间轴/注册点、可见边界、缺陷、locator、证据等级和反证条件。
- 原版 940×590 基准、逐状态并排/叠图所需 fixture、可见对象差异和后续现代接入合同；已有证据可复用但必须升级为本 task 的完整性闭环。

完成定义：

- 待证明问题逐项回答：正式背包与穿戴槽实际显示哪些原对象、动态字段由谁写入、164 图标/适用穿戴资源如何定位、五角色/P1/P2/穿脱/显示时装各状态如何变化。
- 固定显示列表、动态状态集、164 视觉身份、源哈希/locator、坐标/注册点/边界和未知/反证可自动复查；影响后续实现的未知为零，或按来源族拆分而不越级归档。
- 证据只建立原版 UI/资源输入，不据此宣称现代全装备页面、数值接入、事务重放或存档扩展已经完成。

UI 原生化合同：

- 显示列表清单：冻结正式背包/装备页根、六槽、角色外观、25 格、操作层、动态文字、按钮状态、父子/depth、注册点、嵌套矩阵和命中区；动态 `ShowObj/HeadSprite` 调用链与 164 资源目录交叉。
- 原版机器真值 JSON：按 UI ground-truth Schema 生成 `task-settings-170b-equipment-page` manifest，固定 940×590、角色/P1/P2/空态/穿脱/时装显示/操作层状态集，记录源 hash/locator、完整性统计和 `unresolved=[]` 后方可 `verified`。
- 原版视觉基准：使用可追溯 Flash/SWF 渲染的 940×590 正式背包入口与适用逐状态基准；现代截图只能用于差异侧，不能反向充当原版基准。
- 允许的现代视觉例外：不新增；原版资源缺陷只记录，不在证据 task 内修图或添加可见替代层。
- 逐状态验收：覆盖五角色、P1/P2、空/已穿戴、选择/操作层、穿上/卸下、显示/隐藏时装、分页与进入/关闭；164 资源以自动目录覆盖，代表性槽位/角色基准证明空间合同。
- 差异证据：保存原版/当前并排与 50% 叠图、稳定区域差异、可见对象差异清单和字体/抗锯齿容差；未闭合项保持 `draft/blocked`。

验收标准：

- 遵循六段证据链；显示列表、SWF 时间轴/矩阵、共享消费者、动态资源和原版基准均有精确 locator，不能用 431 图标存在替代穿戴 UI 结论。
- 自动核对 manifest Schema/状态/对象/父子链/尺寸、164 图标与角色资源覆盖、源哈希、未知/反证和与 170A `fillName` 一对一关系。
- 运行适用的 UI ground-truth、inventory catalog、annotation、workflow、problem audit 与 `git diff --check`；不修改现代页面来迎合证据。

禁止范围：

- 不修改正式背包/装备 UI、现代 registry/数值、四功能事务、角色战斗视觉、资产 bundle 或存档 schema。
- 不重新生成 `legacy-extraction`，不以现代截图或 1.0 表覆盖 1.1 恢复 SWF/AS3，不建立第二套 equipment/inventory identity owner。
- 不在本 task 执行 164 件现代穿脱回放或派生全部现代资源；这些属于证据闭合后的接入 task。

状态更新：

- 更新 mechanics、功能线覆盖、task-board/task-history；完成后生成同线全装备数据与 UI 接入 task。

推荐后续任务：

- `TASK-SLICE-170C`：直接消费 170A 权威数据和 170B verified UI/资源证据，把全集接入既有唯一 equipment/inventory owner，并为后续四事务全量重放提供现代输入。


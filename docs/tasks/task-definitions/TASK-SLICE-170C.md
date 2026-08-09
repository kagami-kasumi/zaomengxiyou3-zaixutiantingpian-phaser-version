# TASK-SLICE-170C

任务类型：

- `TASK-SLICE`

功能条线：

- `LINE-CORE-PROGRESSION-COMPLETION`（Active；170A 数据、170B1 页面真值与 170B2 视觉资源证据均已闭合）

目标机制/切片：

- `M-035`、`M-036`、`M-037`、`M-044`、`M-052`、`VS-064`

规模预算：

- 主工作包：2（权威目录接入；选择性资源与正式页面接入）
- 预计上下文压缩：0
- 独立验收批次：2

拆分触发：

- 若需要新增第二套装备/背包 owner、重新调查未在 170B2 闭合的源资源族、独立升级存档 schema，或无法在两个验收批次内完成 164 项自动覆盖与代表性正式旅程，立即保留 170C 为数据/资源接入并拆出同线 170D UI 校准任务。

协作计划：

- 模式：单 agent
- 并行工作包：无
- 写入 owner：主 agent
- 归并检查点：164 项目录接入通过后、正式页面逐状态验收前
- 方法观测：无

输入资料：

- `docs/architecture/src-boundaries.md`、`docs/workflow/reverse-engineering-protocol.md` 与 UI ground-truth 校验协议。
- 170A `reference/equipment-data-catalog-1.1.json`、170B1 `task-settings-170b1-equipment-page.json` 和证据矩阵、170B2 `reference/equipment-visual-resource-catalog-1.1.json` 与 `equipment-visual-resource-catalog.md`。
- 既有 `EquipmentSystem`、`InventoryResourceCatalog`、`FormalInventoryPageSystem/View`、`InventoryGridProjection/View`、`AssetManifest`、`SceneAssetBundles` 与 V6 owner；restored SWF 只按 170B2 已确认 locator 选择性派生。

输出产物：

- 由 170A 生成或直接消费的唯一现代装备目录，覆盖 164 身份、五槽、角色/品质门禁、基础 12 属性、强化成长与原字段单位，不复制 inventory identity。
- 由 170B2 目录驱动的选择性现代资源、manifest/bundle 注册与预览映射，复用 163 真图标和 111 个唯一穿戴/称号 character，保留两个原查找缺陷。
- 正式背包/装备页对 170B1 verified 页面真值的直接消费、五角色/P1/P2/穿脱/时装/分页/操作层逐状态证据和自动全集回归。

完成定义：

- 164 件装备均由单一目录进入既有 equipment/inventory owner；身份、槽位、门禁、数值和图标无手抄分叉，穿上/卸下只经既有事务改变当前 owner。
- 武器、防具、称号按 170B2 `preview.mode/resources` 显示；Role4 shovel/arrow、Role5 动态 frame、520/521 跨包、13 个正常称号和 37 个不改变预览项全部按目录回放。
- `fmtstx` 背包图标和 `mksddf` 称号 overlay 保持原版缺陷；未经用户批准不补替代层。影响下一项四功能事务收口的装备数据/UI 未知为零。
- 自动全集、确定性事务和 940×590 正式旅程共同通过；本 task 不据此宣称四功能事务、人物成长或整条功能线完成。

UI 原生化合同：

- 显示列表清单：直接消费 170B1 的 63 对象、六槽、动态字段、`HeadSprite/ShowObj`、操作层、父子/depth、矩阵、命中区和关闭生命周期；不维护第二份坐标表。
- 原版机器真值 JSON：实现与测试直接读取 `task-settings-170b1-equipment-page` verified manifest；视觉映射直接读取 170B2 Schema 目录，任何 hash/完整性/`unresolved` 变化均阻塞闭合。
- 原版视觉基准：以 170B1 character 304 的 940×590 源渲染和 170B2 source-derived 940×590 接触表为原版侧，保存本 task 同尺寸现代逐状态截图。
- 允许的现代视觉例外：空清单；`fmtstx`、`mksddf` 只记录并保留原缺陷，不新增可见修复。
- 逐状态验收：五角色、P1/P2、空/已穿戴、穿上/卸下、显示/隐藏时装、page 1/2、操作层、关闭/再入；代表性覆盖普通/特殊 showId、Role4 双分支、Role5 动态换装、520/521、称号与不变槽位。
- 差异证据：保存原版/现代并排、50% 叠图、可见对象差异和字体/抗锯齿容差；164 项身份/资源由自动目录回归覆盖，不能用少量截图替代全集检查。

验收标准：

- 执行前运行 `npm run check:structure`；修改触发 error 的目标文件必须先拆分。
- 运行 equipment data/visual catalog、inventory catalog、equipment page truth、正式背包/装备事务、asset bundle、V6 兼容、systems、build、annotation、UI ground-truth、workflow、problem audit 与 `git diff --check`。
- 内置浏览器以 940×590 完成 P1/P2、五角色代表项、Role4/Role5/520/521/称号/不变槽位、分页/操作/关闭再入，console warning/error 为 0。

禁止范围：

- 不收口 Fusion 9 条时装配方或打造百分数单位，不实现人物等级成长，不升级存档 schema，不复验关卡左下五入口或处理用户 UI 整改清单。
- 不修改/重新生成 `legacy-extraction`，不从现代截图反推原资源，不建立第二套 equipment/inventory identity、slot、坐标或事务 owner。
- 不为原版缺陷制作替代图，不顺手迁移共享 UI 组件。

状态更新：

- 更新 mechanics、功能线覆盖、task-board/task-history；完成后生成同线四功能事务收口 task。

推荐后续任务：

- 依据 170C 的完整装备目录和实例回放结果生成同线四功能事务收口 task，处理 Fusion 9 条时装配方、打造百分数单位与全量事务重放。

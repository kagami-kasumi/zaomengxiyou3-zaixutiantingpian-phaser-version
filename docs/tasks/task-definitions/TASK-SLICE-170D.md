# TASK-SLICE-170D

任务类型：

- `TASK-SLICE`

功能条线：

- `LINE-CORE-PROGRESSION-COMPLETION`（Active；170C 已完成 164 项唯一目录、111 character 选择性资源与正式穿脱 owner 接入）

目标机制/切片：

- `M-035`、`M-036`、`M-037`、`M-044`、`M-052`、`VS-064`

规模预算：

- 主工作包：2（170B1 页面真值直接消费与动态加载闭合；五角色/双 owner 逐状态校准）
- 预计上下文压缩：0
- 独立验收批次：2

拆分触发：

- 若发现 170A/170B2 权威目录或已派生 character 错误、需要重新调查源 SWF，或五角色 QA fixture 之外还需升级存档 schema，立即只记录反证并拆出同线证据修复任务；本 task 不扩回数据/资源调查。

协作计划：

- 模式：单 agent
- 并行工作包：无
- 写入 owner：主 agent
- 归并检查点：页面真值消费回归通过后、逐状态截图验收前
- 方法观测：无

输入资料：

- `docs/architecture/src-boundaries.md`、`docs/workflow/reverse-engineering-protocol.md` 与 UI ground-truth 校验协议。
- `task-settings-170b1-equipment-page.json`、170B1 证据矩阵、170B2 视觉目录/原版 940×590 接触表。
- 170C `EquipmentCatalog`、`EquipmentPreviewSystem/Assets`、选择性动态资源队列、`FormalInventoryPageSystem/View` 和既有 V6 owner。

输出产物：

- 正式页面布局、显示对象、动态字段、操作层和生命周期直接消费 170B1 verified manifest，不维护第二份坐标表。
- 可重复五角色/P1/P2 QA fixture，只使用 170C 的 164 项目录与既有穿脱事务；覆盖 Role4 双分支、Role5 动态 frame、520/521、称号与不变槽位。
- `docs/tasks/evidence/TASK-SLICE-170D/` 下原版/现代并排、50% 叠图、可见对象差异和 940×590 逐状态现代截图。

完成定义：

- 63 对象、六槽、动态字段、`HeadSprite/ShowObj`、操作层、父子/depth、矩阵、命中区与关闭生命周期由 verified manifest 直接驱动并自动回测。
- 五角色、P1/P2、空/已穿戴、穿上/卸下、时装显示/隐藏、page 1/2、操作层、关闭/再入全部通过；代表项含普通/特殊 showId、Role4 双分支、Role5 动态换装、520/521、13 个正常称号和 37 个不变项。
- `fmtstx` 背包图标和 `mksddf` 称号 overlay 继续保持原缺陷；允许的现代视觉例外为空。
- 本 task 只闭合全装备 UI 校准，不据此宣称四功能事务、人物成长或整条功能线完成。

UI 原生化合同：

- 显示列表清单：直接消费 `task-settings-170b1.equipment-page` 的 63 对象、六槽、动态字段、操作层、父子/depth、矩阵、命中区与关闭生命周期。
- 原版机器真值 JSON：`truthId=task-settings-170b1.equipment-page`，路径 `docs/reverse-engineering/ground-truth/manifests/task-settings-170b1-equipment-page.json`；状态必须保持 `verified`，Schema/hash/完整性/`unresolved` 变化立即阻塞。
- 原版视觉基准：170B1 character 304 的 940×590 源渲染和 `docs/tasks/evidence/TASK-SETTINGS-170B2/representative-original-resources-940x590.png`。
- 允许的现代视觉例外：空清单；两个原缺陷只记录和保留，不新增替代层。
- 逐状态验收：五角色、P1/P2、空/已穿戴、穿上/卸下、显示/隐藏时装、page 1/2、操作层、关闭/再入及全部代表资源分支。
- 差异证据：保存原版/现代并排、50% 叠图、可见对象差异和字体/抗锯齿容差；164 身份/111 character/138 资源记录继续由全集测试覆盖。

验收标准：

- 执行前运行 `npm run check:structure`；触发 error 的目标先拆分。
- 运行 equipment data/visual/preview、inventory catalog、equipment page truth、formal inventory、asset bundle、V6、systems、build、annotations、UI truth、workflow、problem audit 与 `git diff --check`。
- 内置浏览器以 940×590 完成合同中的逐状态矩阵，console warning/error 为 0，并保存差异证据。

禁止范围：

- 不重新生成 170A/170B1/170B2 权威证据，不修改 `legacy-extraction`，不新增第二 equipment/inventory owner。
- 不处理 Fusion 9 条时装配方、打造百分数单位、人物成长、存档 schema、关卡左下五入口或用户 UI 整改清单。
- 不为原版缺陷制作替代视觉，不顺手迁移共享 UI 组件。

状态更新：

- 更新 mechanics、功能线覆盖、task-board/task-history；完成后生成同线四功能事务收口 task。

推荐后续任务：

- 依据 170C 完整装备目录与 170D 正式页面回放结果，生成同线四功能事务收口 task。

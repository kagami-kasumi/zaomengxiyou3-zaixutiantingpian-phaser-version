# TASK-ARCH-014A

任务类型：

- `TASK-ARCH`

功能条线：

- `LINE-SHARED-UI-COMPONENTS`（Planned；不得抢占当前 Active 线）


目标机制/切片：

- `M-035`、`M-037`、`M-052`、`VS-059`、`VS-064`

规模预算：

- 主工作包：2
- 预计上下文压缩：0
- 独立验收批次：2

拆分触发：

- 若审计发现第四个独立组件族、需要读取新的恢复源包，或任一候选同时跨三个以上业务 owner，立即只冻结已知三族合同，并将新增族/补证拆成同线下一 task。

输入资料：

- `PG-011`、本线覆盖台账、`task-generation.md`、`src-boundaries.md`、PG-007/009/010。
- feature UI systems/views、asset manifest/bundles、灵魂与 inventory 相关专项；只读审计，不修改页面实现。

输出产物：

- 共享组件目录、命名/分层 ADR、owner/消费者/页面保留项/资源 provenance 矩阵。
- 每个组件族的输入输出、生命周期、错误/空状态、bundle 归属、迁移顺序和防回填搜索。
- 工作流/结构校验的组件合同门禁及正负样例；B..F 执行前置清单。

完成定义：

- 灵魂余额、原生按钮/关闭、背包基础三族的存量实现和已知消费者均有明确归属。
- 共享行为与页面原生视觉的边界可执行；不存在“整页万能组件”或仅凭命名相似合并。
- 审计本身不迁移 `src/` 消费者，不越级宣称组件化完成。

UI 原生化合同：

- 显示列表清单：矩阵逐消费者引用现有根/子 Symbol、按钮态、动态 child、命中区与页面证据。
- 原版视觉基准：登记每个消费者已有 940×590 基准及缺口；缺基准项阻塞其后续迁移。
- 允许的现代视觉例外：只记录已获批准项；组件化不新增可见例外。
- 逐状态验收：为 B..F 定义 normal/hover/pressed/disabled/selected、分页、P1/P2、返回/重开的适用状态。
- 差异证据：冻结逐消费者对象差异模板，不以共享组件截图代替页面差异证据。

组件化合同：

- 组件家族：SoulBalance、NativeButton/CloseLifecycle、Inventory item/grid/selection/tooltip。
- 权威 owner：domain/system 持有业务事实，shared Phaser component 持有只读投影/交互生命周期，page composition 持有原生显示列表。
- 共享行为：审计并冻结刷新、交互状态、选择/分页、关闭/销毁与资源使用合同。
- 页面保留项：源 Symbol、皮肤、矩阵、坐标、命中区、页面字段和专属业务流程。
- 消费者迁移矩阵：列出全部已知消费者、当前 owner、目标组件、迁移 task、阻塞与排除理由。
- 防复发门禁：工作流字段校验、重复 owner 窄查、截图裁片/provenance 检查和结构边界测试。

验收标准：

- `npm run check:workflow`、组件合同正负样例、`git diff --check` 通过；审计搜索结果可复查。
- 执行前先运行 `npm run check:structure`；若后续预定目标文件已有 error，必须在矩阵中登记先拆分。

禁止范围：

- 不修改 `src/` 页面实现，不派生视觉资源，不迁移消费者，不改变 UI、业务或存档。
- 不建立 `GenericButton`、`GenericPanel` 或万能背包页。

状态更新：

- 更新本线覆盖、PG-011 测试结果/反馈、task-board/task-history 与涉及的 PG-007/008/009/010 样本。

推荐后续任务：

- `TASK-ARCH-014B`。

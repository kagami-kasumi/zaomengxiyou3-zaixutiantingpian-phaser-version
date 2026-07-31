# TASK-ARCH-014D

任务类型：

- `TASK-ARCH`

功能条线：

- `LINE-SHARED-UI-COMPONENTS`（Planned；须待 014C 归档）


目标机制/切片：

- `M-035`、`M-037`、`M-052`、`VS-064`

规模预算：

- 主工作包：2
- 预计上下文压缩：0
- 独立验收批次：2

拆分触发：

- 若 item cell、grid/pagination 与 tooltip/selection 不能在两个工作包内形成稳定无页面合同，立即保留 item cell/grid 核心，把 tooltip/selection 拆为同线下一 task；不压缩为万能组件。

输入资料：

- 014A inventory 矩阵、431 项目录、`FormalInventoryPageView/System`、炼丹炉/商城/任务消费者及现有专项。

输出产物：

- 有类型的只读 item view-model、InventoryItemCell、Grid/Pagination、Selection/Tooltip 接缝和生命周期合同。
- 空格、实例/堆叠数量、selected/disabled、页边界、稳定 ID、刷新与销毁的确定性测试。
- 不连接正式页面的组件 harness；页面 skin/geometry 通过 adapter 注入。

完成定义：

- 基础组件不读取存档、不执行物品事务、不决定分类/筛选或页面动作。
- 正式背包与嵌入式消费者所需的共同语义有显式交集；不同语义留给页面 adapter。
- 本 task 只建立基础层和 harness，不迁移正式背包或其他消费者。

UI 原生化合同：

- 显示列表清单：以现有消费者矩阵定义 cell/icon/count/selected/tooltip/分页对象，不宣称单一显示列表。
- 原版视觉基准：harness 只验证组件状态；各页面迁移仍绑定自己的 940×590 原版基准。
- 允许的现代视觉例外：harness 可使用仅测试可见容器，不能进入 production 或正式截图。
- 逐状态验收：empty/item、实例/堆叠、selected/disabled、首末页、刷新、清空和销毁。
- 差异证据：本 task 提供组件对象/几何断言；页面像素差异留给 014E/F。

组件化合同：

- 组件家族：InventoryItemCell、InventoryGrid/Pagination、Selection/Tooltip 接缝。
- 权威 owner：Inventory catalog/transaction 与页面 system 持有业务；组件只读 view-model。
- 共享行为：稳定 item 投影、空/数量/选中状态、页边界、刷新与生命周期。
- 页面保留项：格子皮肤、行列/间距、图标缩放、文字样式、tooltip 字段和点击业务。
- 消费者迁移矩阵：合同覆盖 014A 证明的交集；迁移分别由 014E/F 执行。
- 防复发门禁：组件禁止 import Save/transaction/page route；禁止 production 万能皮肤和页面业务分支。

验收标准：

- 先运行 `check:structure`；组件确定性专项、类型检查、`test:systems`、`build`、`check:workflow`、`git diff --check` 通过。

禁止范围：

- 不迁移正式页面，不改变 431 目录/事务/V6，不派生新可见资源，不实现物品专属使用效果。

状态更新：

- 更新本线覆盖、PG-011、task-board/task-history 与 `src-boundaries.md`。

推荐后续任务：

- `TASK-ARCH-014E`。

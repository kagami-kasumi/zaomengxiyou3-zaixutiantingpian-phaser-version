# TASK-ARCH-014E

任务类型：

- `TASK-ARCH`

功能条线：

- `LINE-SHARED-UI-COMPONENTS`（Planned；须待 014D 归档）


目标机制/切片：

- `M-035`、`M-037`、`M-044`、`M-052`、`VS-064`

规模预算：

- 主工作包：2
- 预计上下文压缩：0
- 独立验收批次：2

拆分触发：

- 若正式背包迁移需要修改 catalog/transaction/V6，或同时重做四分类之外的物品专属效果，立即停止并拆出同线阻塞治理；本 task 只做视图组件试点。

输入资料：

- 014D 基础组件、正式背包 304/246/628 显示列表、431 目录/428 真图标、`TASK-SLICE-160` 视觉审计和专项。

输出产物：

- `FormalInventoryPageView` 通过页面 adapter 组合共享基础组件，删除被替代的私有 grid/page/selection 生命周期实现。
- 四分类、5×25、实例/99 堆叠、selected/tooltip、穿脱/使用入口、P1/P2 与 V6 回归。
- 正式背包 940×590 逐状态差异证据和私有重复实现负向门禁。

完成定义：

- 玩家可见外观、布局、按钮状态、图标和业务与迁移前一致；组件替换不改变 inventory owner。
- 431 身份、428 真图标、3 项原版缺陷排除、容量/原子事务和双 owner 全部保持。
- 正式背包成为唯一试点，不在本 task 迁移炼丹炉、商城或任务奖励。

UI 原生化合同：

- 显示列表清单：直接继承 304/246/628、22 个原生控件、cell/icon/count/selected/tooltip 与分页层级。
- 原版视觉基准：复用 `TASK-SLICE-160` 的 940×590 四分类/分页/选择基准并补迁移后同状态。
- 允许的现代视觉例外：零新增；3 项缺陷继续按权威目录排除而非占位。
- 逐状态验收：四分类、首/末页、empty/stack/instance、selected、tooltip、P1/P2、返回和重载。
- 差异证据：迁移前后稳定区域叠图、对象差异清单及容差说明。

组件化合同：

- 组件家族：InventoryItemCell、InventoryGrid/Pagination、Selection/Tooltip。
- 权威 owner：catalog/transaction/page system 保持业务 owner；shared view primitives 只读投影。
- 共享行为：cell 刷新、数量/选中、分页、详情投影和销毁。
- 页面保留项：304/246/628 原生皮肤、5×25 几何、四分类筛选、按钮/tooltip 字段和业务动作。
- 消费者迁移矩阵：本 task 只关闭正式背包行，嵌入式消费者保持待 014F。
- 防复发门禁：禁止正式背包重新声明私有 grid/page/selection owner；目录/事务/V6 不得迁入 view。

验收标准：

- 先运行 `check:structure`；背包专项、全量目录/事务/V6、`test:systems`、`build`、`check:workflow`、`git diff --check` 通过。
- 940×590 P1/P2 四分类/分页/选择/返回/重载复验，console 无 warning/error。

禁止范围：

- 不改变目录、容量、事务、存档 schema、资源缺陷裁决或物品专属效果；不迁移其他页面。

状态更新：

- 更新本线覆盖、M-037/M-052、VS-064、PG-007/009/011、task-board/task-history。

推荐后续任务：

- `TASK-ARCH-014F`。

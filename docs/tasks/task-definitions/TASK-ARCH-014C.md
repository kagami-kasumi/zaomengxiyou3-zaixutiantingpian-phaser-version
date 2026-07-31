# TASK-ARCH-014C

任务类型：

- `TASK-ARCH`

功能条线：

- `LINE-SHARED-UI-COMPONENTS`（Planned；须待 014B 归档）


目标机制/切片：

- `M-035`、`M-052`、`VS-059`

规模预算：

- 主工作包：2
- 预计上下文压缩：0
- 独立验收批次：2

拆分触发：

- 若代表性 overlay 与整页页面存在两套不可兼容 host 生命周期，或迁移需覆盖三个以上额外页面，立即保留两个小组件/adapter，并将额外消费者拆成同线后续 task。

输入资料：

- 014A 按钮/关闭矩阵，设置 overlay、炼丹炉、商城、背包等原生按钮 helpers、`FeatureUiHost` 与页面关闭/销毁专项。

输出产物：

- 共享 NativeButton 状态/命中适配与 CloseLifecycle 的 Escape、回调解绑、重复打开和幂等销毁合同。
- 一个 overlay 与一个整页页面试点；页面通过 skin/geometry adapter 提供原生帧、矩阵和命中区。
- 组件状态、host 返回和销毁专项及重复 helper 防回填检查。

完成定义：

- 共享的是交互/生命周期，不是统一皮肤；试点页面可见外观与行为无回归。
- 按钮回调不会因重复打开叠加，Escape/关闭只触发一次，销毁后没有悬挂对象或输入监听。
- 未纳入本 task 的页面保留在矩阵，不被顺手批量迁移。

UI 原生化合同：

- 显示列表清单：试点逐按钮记录源 Symbol/帧、矩阵、命中区、depth 与关闭根关系。
- 原版视觉基准：overlay 与整页各使用现有 940×590 normal/hover/pressed/关闭基准。
- 允许的现代视觉例外：无新增可见例外；透明 hit area 仅在原证据支持时使用。
- 逐状态验收：normal/hover/pressed/disabled、Escape、点击关闭、重复打开、返回和销毁。
- 差异证据：逐试点按钮并排/叠图、命中范围和对象差异清单。

组件化合同：

- 组件家族：NativeButton / CloseLifecycle。
- 权威 owner：组件拥有输入状态和监听生命周期；页面/host 拥有业务回调与路由。
- 共享行为：状态切换、命中、单次激活、Escape、解绑、重复打开和幂等销毁。
- 页面保留项：按钮皮肤/Symbol 帧、矩阵、坐标、命中几何、音效和返回语义。
- 消费者迁移矩阵：本 task 只迁移 014A 选定的一 overlay + 一整页，其余明确排期或排除。
- 防复发门禁：禁止新页面复制状态/关闭 helper；组件不得内置通用可见皮肤。

验收标准：

- 先运行 `check:structure`；组件/试点专项、`test:systems`、`build`、`check:workflow`、`git diff --check` 通过。
- 940×590 两类试点逐状态及返回/重复打开复验，console 无 warning/error。

禁止范围：

- 不迁移全部页面，不改页面路由/业务动作，不建立现代通用按钮皮肤，不进入 inventory 组件。

状态更新：

- 更新本线覆盖、PG-007/011、task-board/task-history 与试点页面视觉审计。

推荐后续任务：

- `TASK-ARCH-014D`。

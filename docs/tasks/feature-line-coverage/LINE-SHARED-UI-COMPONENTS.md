# LINE-SHARED-UI-COMPONENTS 覆盖台账

## 当前范围

- 用户确认目标：把灵魂余额、背包/物品展示、原生按钮与关闭生命周期纳入正式组件化治理，并按多个 TASK 分批完成。
- 本线治理共享边界、试点迁移、已知消费者迁移和防复发门禁，不改变原版页面可见外观、业务规则或存档事实。
- 组件化只共享稳定行为、只读投影与生命周期；每个页面继续持有自己的原生 Symbol、皮肤、矩阵、坐标、命中区和专属流程。
- 本线当前为 `Planned`。唯一 Active 仍是 `LINE-PRE-STAGE-2-3-COMPLETION`，不得提前执行本线代码迁移。

## 权威输入

- `PG-011-共享UI组件边界与迁移门禁缺失.md`
- `PG-007-UI原生化缺少统一门禁.md`
- `PG-009-启动资源加载边界缺失.md`
- `PG-010-灵魂货币所有权错误.md`
- `docs/workflow/task-generation.md` 的 UI 原生化与共享 UI 组件化门禁
- `docs/architecture/src-boundaries.md`
- `docs/reverse-engineering/full-function-ui-index.md`
- `docs/reverse-engineering/inventory-resource-catalog.md`
- `docs/reverse-engineering/map-service-ui-index.md`
- 当前 feature UI systems/views、`PlayerSoulSystem`、inventory catalog/transaction 和场景 bundle owner

## 组件族覆盖矩阵

| 组件族 | 已知消费者 | 共享边界 | 页面必须保留 | 当前状态 | 关闭要求 |
| --- | --- | --- | --- | --- | --- |
| SoulBalance | 技能、炼丹炉、商城及后续灵魂消费页 | 当前玩家只读余额投影、嵌入字形/数字布局、透明图标资源、刷新/销毁 | 页面坐标、是否显示 owner 标签、父容器层级与原显示列表关系 | 局部共享，商城曾绕过透明资产合同 | 全部已知消费者迁移；无截图裁片、黑底、系统字体回退或页面私有余额投影 |
| NativeButton / CloseLifecycle | 设置 overlay、炼丹炉、商城、背包、技能、任务等 | normal/hover/pressed/disabled、命中、Escape/返回、重复打开、回调解绑和销毁幂等 | 每页原生皮肤、Symbol 帧、矩阵、命中区和 host 返回语义 | 页面 helper 分散 | 至少一个 overlay 和一个整页试点；矩阵内消费者分批迁移且外观零越权统一 |
| InventoryItemCell | 正式背包、炼丹炉材料/产物、商城商品/购买确认、任务奖励 | item identity、图标 key、数量/实例、selected/disabled/empty 的只读 view-model 与对象生命周期 | 格子皮肤、尺寸、图标缩放、数量字段、tooltip/点击语义 | 多种页面 composition，各有重复片段 | 形成有类型的最小合同；语义不等价消费者明确排除或适配 |
| InventoryGrid / Pagination | 正式背包及实际具有分页格阵的消费者 | 稳定 cell 列表、页码边界、空格、selected、刷新和销毁 | 行列数、间距、坐标、分页按钮皮肤和页面业务筛选 | 正式背包已完整，未抽离基础层 | 正式背包试点无回归；其他消费者只在审计确认同构时迁移 |
| Tooltip / Selection | 背包、炼丹炉、商城、任务奖励 | 选择稳定 ID、空选择、更新/清理和只读详情投影 | 页面详情字段、位置、文字样式、确认/消费动作 | 页面语义分散 | 不建立万能 tooltip；只共享被证实相同的选择生命周期和 view-model 接缝 |

## owner 分层合同

| 层 | 持有内容 | 禁止内容 |
| --- | --- | --- |
| domain/system | 灵魂余额与消费、inventory definition/transaction、页面业务动作与存档 | Phaser 对象、原版皮肤和页面坐标 |
| shared Phaser component | 可销毁 view 对象、交互状态、只读 view-model 投影、稳定资源 key | 第二份余额/背包状态、业务扣费/发奖、整页路由 |
| page composition | 原版显示列表、源 Symbol、皮肤、矩阵、坐标、命中区、页面专属流程 | 复制共享 owner、从截图临时派生共享资产 |
| asset bundle/manifest | provenance、透明 alpha、尺寸、稳定 key、bundle owner | 隐式跨 bundle 依赖、Boot 回填或运行截图裁片 |

## 调度

1. `TASK-ARCH-014A`：审计存量候选和消费者，冻结组件分层、命名、页面保留项、provenance、迁移矩阵与静态门禁。
2. `TASK-ARCH-014B`：收敛 SoulBalance 组件族并迁移全部已知灵魂消费者。
3. `TASK-ARCH-014C`：建立 NativeButton/CloseLifecycle 组件族，在代表性 overlay 与整页页面试点。
4. `TASK-ARCH-014D`：建立 inventory item cell/grid/pagination/selection/tooltip 的最小基础组件。
5. `TASK-ARCH-014E`：迁移正式背包页，回归 431 身份、428 真图标、P1/P2 与 V6。
6. `TASK-ARCH-014F`：按冻结矩阵迁移嵌入式消费者，完成跨页面旅程、防回填和整线关闭审计。

## 明确排除

- 不建立统一现代皮肤的 `GenericButton`、`GenericPanel`、`GenericInventoryPage`。
- 不把不同源 SWF、不同显示列表或不同业务语义的对象仅因外形相似而强制合并。
- 不修改灵魂价格/奖励、物品目录/事务、任务奖励、存档 schema 或既有玩法数值。
- 不从运行截图、整页背景或带舞台底色的裁片生成共享视觉子件。
- 不在单一 Goal 同时完成组件合同、全部页面迁移和最终运行旅程。
- 不在本线获得唯一 WIP 前修改 `src/` 实现。

## 关闭检查

- [ ] `TASK-ARCH-014A..F` 全部归档，Split 父任务收束。
- [ ] 组件目录、owner 分层、消费者迁移矩阵与页面保留项无未解释缺口。
- [ ] SoulBalance 全部已知消费者复用唯一共享投影和权威透明资产/字形。
- [ ] NativeButton/CloseLifecycle 共享行为但未覆盖页面原生皮肤、矩阵和命中几何。
- [ ] inventory 基础组件通过正式背包试点，431 身份、428 真图标、P1/P2、V6 和事务无回归。
- [ ] 审计矩阵中的嵌入式消费者全部迁移或有用户确认的排除理由。
- [ ] 静态防回填、确定性专项、全系统、build、workflow 与逐页面视觉门禁通过。
- [ ] 940×590 跨页面正式旅程覆盖进入、交互、owner 切换、返回、重复打开、销毁和重载，console 无 warning/error。
- [ ] `PG-011` 关闭标准全部满足，相关 PG-007/009/010 效果样本已回写。
- [ ] 无未完成同线 task。

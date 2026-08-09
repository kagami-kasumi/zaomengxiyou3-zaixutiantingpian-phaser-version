# TASK-SLICE-165D 视觉验收

## 范围与基准

- 舞台：`940×590`，正式地图炼丹炉入口。
- 原版根基准：`local-resources/regima/task-outputs/task-slice-117-crafting-ui/backpack1/DefineSprite_119_export.strength.StrengthEquipment/1.png`，按舞台裁为 `940×590`。
- 原版机器真值：`task-slice-165d.workshop-inventory`，路径 `docs/reverse-engineering/ground-truth/manifests/task-slice-165d-workshop-inventory.json`；`verified`，34 个本 task 范围内显示对象，`unresolved=[]`。
- 现代前态基准：`docs/tasks/evidence/TASK-SLICE-142-p1-strength-original-ui-940x590.png`，仅用于证明逐行文字列表已被移除，不冒充原版运行态。
- 用户批准边界：只在 character 119 右栏恢复/组合既有 BackPackElement 分类、628 格、真图标、数量与分页；左侧四业务页和 119 外观不重做。

对照图：

- `original-modern-side-by-side.png`：原版 119 静态根 / 165D P1 装备第一页。
- `original-modern-overlay-50.png`：原版根与 165D 的 50% 叠图。
- `original-right-panel-difference.png`：原版静态空右栏与动态背包投影差异；差异预期集中于 246/628 动态 child。
- `before-after-side-by-side.png`：任务前文字列表 / 任务后背包格。
- `before-after-overlay-50.png` 与 `right-panel-difference.png`：任务前后稳定区域复核。

## 显示列表清单

| 对象 | 原版身份/几何 | 165D 映射 | 裁决 |
| --- | --- | --- | --- |
| 工坊根 | character 119，舞台 `940×590` | `craftingAssets.container` | 原资源复用 |
| 左侧业务页 | 198 / 169 / 177 / 152 | 既有四页与透明原命中区 | 保留，未重做 |
| 右栏动态根 | character 246，stage `(512.8,130)` | 真值 JSON `inventory-root` | 原显示列表恢复 |
| 四分类 | 230 / 235 / 240 / 245，步距 74 | 原生 up/over/down，selected=down | 原资源复用 |
| 25 格 | character 628，`50×51`，step `61×60` | `InventoryGridProjection` + `InventoryGridView` | 原资源复用 |
| 图标/数量 | `ShowObj` + 数量 TextField | 统一 431 身份/428 真图标；数量大于 1 才显示 | 等价动态重建 |
| 空格/实例/堆叠 | 628 常驻，动态 child 可空 | 固定 25 格，不因无条目删除格 | 行为一致 |
| 选中/放入 | `PackThings -> SimpleClick -> 当前子页` | 点击格先选择，再直接调用既有页签暂存命令；成功后条目离格，拒绝保留 | 等价行为重建 |
| 翻页 | 78 / 83 / 117 | 固定 5 页，动态 `${n}/5` | 原控件复用 |
| owner | 原版角色选择器；现代既有 P1/P2 工坊标签 | 切 owner 返还上一 owner 暂存并重建当前投影 | 既有现代映射保留 |
| 灵魂 | 103 动态字段 | 共享原生灵魂数字投影 | 原资源复用 |

## 逐状态证据

| 状态 | 证据 | 结果 |
| --- | --- | --- |
| P1 装备第一页 | `p1-equipment-page-1-940x590.png` | 25 格、实例、空格、第一页与左业务页同时可见 |
| P1 道具第一页 | `p1-items-page-1-940x590.png` | 分类 selected、堆叠数量与空格通过 |
| P1 道具第二页 | `p1-items-page-2-940x590.png` | 第二页重建，无叠字，页码 `2/5` |
| 拒绝态 | `p1-items-rejected-940x590.png` | 非强化材料不移出 owner，左侧反馈，右栏不被文字覆盖 |
| 成功暂存 | `p1-equipment-staged-940x590.png` | 点击实例后从格中移出并进入既有强化 session |
| 关闭返还/再入 | `p1-equipment-returned-940x590.png` | 关闭返回地图，再入后暂存实例恢复到 owner 背包 |
| P2 + 打造页 | `p2-making-page-1-940x590.png` | P2 selected，打造 152 与同一背包格投影共存 |
| 四业务页 | 浏览器依次观察强化/合成/分解/打造 | 四页均保留右栏分类/格/分页，未串页 |
| console | 内置浏览器 `warn/error=[]` | 通过 |

## 对象差异与现代例外

- 任务前右栏的现代标题、`第 x/y 页` 和逐行物品文字全部删除。
- 165D 没有新增页面皮肤、矩形格、第二库存 owner、专属物品用途或跨页面资源裁片。
- 动态物品内容由当前 V6 owner 决定，原版 119 静态根不含运行时 fixture；因此像素差不把“空原版右栏 vs 当前条目”判为错误，而以真值 JSON 的 246/628 几何、原生子资源和逐状态现代运行证据共同裁决。
- 左侧底部事务摘要属于既有业务页反馈，已移出右栏，未改变四事务规则；它不作为“原版视觉已复现”的证据。
- 原目录中 3 项已确认原版图标缺陷继续保持无伪造图标；不影响 165D 的组件、owner 或分页合同。

结论：右栏已从文字列表替换为可交互的原生背包格投影；P1/P2、四分类、五页、空/实例/堆叠、成功暂存、拒绝、关闭返还、四业务页与零 console 均通过。

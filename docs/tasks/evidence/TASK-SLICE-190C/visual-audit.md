# TASK-SLICE-190C 视觉验收

## 结论

- 正式背包和炼丹炉右栏继续读取同一 P1/P2 inventory owner、同一四分类与同一 5×5 grid；它们不是两套背包。
- 两页底部现在共同消费 `createInventoryPagerObjects`：原生 character 78/83 previous/next 三态按钮、相同 pointer 生命周期及完整 `n/5` 文本。
- 各页仍直接读取自身 verified manifest 的 stage bounds；没有把 304/119 整页皮肤、事务或页码 model 合并。

## 运行证据

- [正式背包第二页](formal-page-2.png)：关卡背包从 `1/5` 点击下一页后显示 `2/5`，空页与按钮布局正常。
- [炼丹炉第二页](workshop-page-2.png)：相同 fixture 从 `1/5` 点击下一页后显示 `2/5`，无重复 `/5`、透明命中按钮或重叠残留。
- 2026-08-17 在既有 `0.0.0.0:4174` preview 的 1214×720 浏览器画布中验收（内部游戏舞台仍为 940×590）；炼丹炉 previous hover 使用原三态资源，两个页面的第一页/第二页切换均通过。
- QA fixture：`qaEquipmentRole=1&qaEquipmentOwner=p1&qaEquipmentCase=equipped&qaEquipmentSoul=12345`；炼丹炉另加 `qaEquipmentPage=workshop`。

## 差异裁决

- 已删除：container SVG 中旧 `nowpage`、`txtlh`、previous/next 背景对象和 character 118 静态 `/5`；运行时不再叠加静态后缀。
- 保留：两页不同的宿主坐标和根 Symbol；炼丹炉页码使用 number 与原 `/5` truth bounds 的联合中心，正式背包继续使用 170B1 page bounds。
- 允许的现代例外：用户明确要求两页分页 UI 一致；统一只发生在已有原生按钮/文本投影层，没有新增现代可见皮肤。

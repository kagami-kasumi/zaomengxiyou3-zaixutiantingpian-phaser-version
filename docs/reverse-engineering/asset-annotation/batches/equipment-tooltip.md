# 标注批次：equipment-tooltip

## 范围

- 资源族：`ShowObj -> AttributeCon` 装备悬停动态显示列表。
- 影响：`TASK-SLICE-190A` 与拆分后的 `190B1..190B4`。
- 排除：非装备物品 tooltip、页面皮肤、现代实现、商城时装的原版禁用态。

## 输入与调查

- 恢复源：`local-resources/regima/source/restored-swfs/1_MainLoad__main1.swf`。
- 行为交叉对照：legacy `AttributeCon.as`、`ShowObj.as`、`MyEquipObj.as`；恢复源选择性 FFDec 导出与 legacy 对应文件 SHA 完全一致。
- 页面父显示列表：170B1 正式背包、167 工坊四页、175F 商城 verified manifests。
- tooltip 没有 SymbolClass/character id；所有可见对象均由 AS3 Graphics/TextField 动态创建，不能伪造 symbolId。

## 结论与去向

- confirmed：1；probable：0；unknown：0。
- 已生成 `task-settings-189.equipment-tooltip`、12 个 940×590 source-replay 基准和六段证据矩阵。
- 当前状态：`derived-ready`；唯一去向 `integrate`，先由 190A 在正式背包试点，再按页面真值分别迁移工坊四页。
- 人工动作：无。source replay 不是 Flash 运行截图；现代实现后的正式运行差异由各实现 task 验收。

## 关闭检查

- [x] 恢复源、AS3、父页面与现代 owner 已交叉确认。
- [x] 无 character id 的原因已显式记录，没有猜测编号。
- [x] status/confidence/nextAction 合法且唯一。
- [x] 未修改恢复源或 legacy extraction。
- [x] 后续页面拆分边界已冻结。


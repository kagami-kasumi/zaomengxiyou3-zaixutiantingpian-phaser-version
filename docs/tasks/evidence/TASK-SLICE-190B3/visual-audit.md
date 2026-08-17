# TASK-SLICE-190B3 分解页装备 tooltip 视觉验收

## 验收环境

- 现代运行：`npm run preview`，`http://localhost:4174/`，940×590，2026-08-17。
- 可重复入口：`?qaEquipmentPage=workshop&qaEquipmentRole={1|2}&qaEquipmentOwner={p1|p2}&qaEquipmentCase=tooltip-instance&qaEquipmentSoul={5000|0}`；仅 localhost QA 生效。
- tooltip 真值：`task-settings-189.equipment-tooltip`，12 状态 / 32 对象，`verified`，`unresolved=[]`。
- 分解页真值：`task-settings-167.workshop-left-pages.resolution`；右栏真值：`task-slice-165d.workshop-inventory`。
- 允许的现代可见例外：无。

## 原版基准与现代状态

| 状态 | 原版 source replay / 显示列表基准 | 现代正式 view/model 运行结果 |
| --- | --- | --- |
| 空态 | [`original-source-replay-normal-hidden-940x590.svg`](../TASK-SETTINGS-189/original-source-replay-normal-hidden-940x590.svg) + 167 resolution empty | 无 tooltip；material 与六个 resu 保持原槽位空态 |
| 右 grid | [`original-source-replay-inventory-random-strength-hover-940x590.svg`](../TASK-SETTINGS-189/original-source-replay-inventory-random-strength-hover-940x590.svg) | grid 装备显示当前实例字段；stack 与空格不绑定 |
| P1 目标 | 189 tooltip + 167 `material` bounds | `_clj(+3)` 显示攻击 234(+78)、暴击/回避/魔抗与价值 640，目标几何来自 manifest |
| 成功与结果 | 167 `resu1..6` | 成功后目标 tooltip 销毁、灵魂 5000→4900；结果材料显示但悬停不出现装备 tooltip |
| P2 拒绝/返还/重开 | [`original-source-replay-p2-hover-940x590.svg`](../TASK-SETTINGS-189/original-source-replay-p2-hover-940x590.svg)、[`original-source-replay-move-out-hidden-940x590.svg`](../TASK-SETTINGS-189/original-source-replay-move-out-hidden-940x590.svg)、[`original-source-replay-reopened-hover-940x590.svg`](../TASK-SETTINGS-189/original-source-replay-reopened-hover-940x590.svg) | 0 灵魂拒绝后同一目标实例保留；移出隐藏、点击返还、关闭/C 重开无残留 |

## 生命周期与差异

- 右侧 5×5 grid 继续由 `InventoryGridView` 投影，只给 `entry.kind === 'equipment'` 绑定 hover。
- 目标槽命中范围直接读取 167 verified manifest 的 `material`；旧 `FormalWorkshopStageHitAreas.resolution` 不再作为该目标的 tooltip/点击几何。
- tooltip 直接读取 `EquipmentResolutionSession.target`；拒绝不替换实例，成功将 target 置空，返还/切页/关闭由既有 session 生命周期清理。
- `resu1..6` 只渲染 `session.results` 的非装备 stack 图标，没有创建 tooltip target，符合 189 消费者矩阵的排除结论。
- P1/P2 均完成目标 hover；另覆盖成功、0 灵魂拒绝、pointerout、返还、关闭/C 重开。fresh console warning/error 为 0。

## 字体与对象差异

- tooltip 背景、名称、品质/类型/条件、非零属性、说明和灵魂价值继续由 189 运行投影生成；resolution 的 177 Symbol、material、六结果槽、字段、按钮、右栏几何和皮肤未替换。
- Phaser Canvas 与 Flash 的字体栅格化、抗锯齿和 GlowFilter 边缘属于既有容差；字段内容、25px 行距、单位、对象层级、根边界与实例刷新不纳入容差。

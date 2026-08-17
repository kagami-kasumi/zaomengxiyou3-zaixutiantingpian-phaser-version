# TASK-SLICE-190B1 强化页装备 tooltip 视觉验收

## 验收环境

- 现代运行：`npm run preview` 既有 `http://localhost:4174/` 服务，940×590，2026-08-17。
- 可重复入口：`?qaEquipmentPage=workshop&qaEquipmentRole={1|2}&qaEquipmentOwner={p1|p2}&qaEquipmentCase=tooltip-instance&qaEquipmentSoul=50000`；仅 localhost QA 生效。
- tooltip 真值：`task-settings-189.equipment-tooltip`，12 状态 / 32 对象，`verified`，`unresolved=[]`。
- 强化页真值：`task-settings-167.workshop-left-pages.strength`；右栏真值：`task-slice-165d.workshop-inventory`。
- 允许的现代可见例外：无。

## 原版基准与现代证据

| 状态 | 原版 source replay | 现代正式 view/model 运行 |
| --- | --- | --- |
| P1 随机基值 +3 目标槽 | [`original-source-replay-inventory-random-strength-hover-940x590.svg`](../TASK-SETTINGS-189/original-source-replay-inventory-random-strength-hover-940x590.svg) | [`modern-p1-target-random-strength-hover-940x590.png`](modern-p1-target-random-strength-hover-940x590.png) |
| P1 失败后实例刷新 | [`original-source-replay-page-refresh-hidden-940x590.svg`](../TASK-SETTINGS-189/original-source-replay-page-refresh-hidden-940x590.svg) | [`modern-p1-failed-refresh-grid-hover-940x590.png`](modern-p1-failed-refresh-grid-hover-940x590.png) |
| P2 同实例目标槽 | [`original-source-replay-p2-hover-940x590.svg`](../TASK-SETTINGS-189/original-source-replay-p2-hover-940x590.svg) | [`modern-p2-target-random-strength-hover-940x590.png`](modern-p2-target-random-strength-hover-940x590.png) |
| P2 关闭重开零残留 | [`original-source-replay-reopened-hover-940x590.svg`](../TASK-SETTINGS-189/original-source-replay-reopened-hover-940x590.svg) | [`modern-p2-reopened-no-residue-940x590.png`](modern-p2-reopened-no-residue-940x590.png) |

## 状态差异与生命周期

- 强化页右侧 5×5 grid 继续由 `InventoryGridView` 投影；只有 `entry.kind === 'equipment'` 的格绑定 tooltip，石、幸运符、神恩符和其他 stack 均不绑定。
- 左页只给 167 强化真值的第 3 个 hit area（装备目标槽）绑定 tooltip；其余五个石/符槽保持原命中和层级，不扩张属性面板。
- `_clj` fixture 的当前实例为 `baseStatsOverride.power=234`、`strengthLevel=3`；目标槽显示 `攻击：234(+78)`，未将有效总值写回第二 owner。
- P1 使用 1 级强化石提交，0% 分支失败后实例降为 +2 并返回装备第 2 页；立即 hover 显示 `攻击：234(+52)`，证明 rerender 从同一实例重建，没有陈旧 +3 面板。
- P1/P2 分别从独立 QA storage 打开同一正式 workshop view/model；P2 目标槽同样显示随机基值 +3。关闭时 session 返回目标并销毁 tooltip 根，按 C 重开后无残留面板。
- grid hover、target hover、pointerout、提交重绘、关闭/重开各状态的 console warning/error 均为 0。

## 字体与对象差异

- tooltip 背景、名称、品质/类型/条件、非零属性、说明和灵魂价值继续由 189 运行投影生成；强化页的 198 Symbol、槽位、按钮、字段、右栏 119/246/628 几何和皮肤未被替换。
- Phaser Canvas 与 Flash 的 FZCuYuan 栅格化、抗锯齿和 GlowFilter 边缘属于既有字体容差；字段内容、25px 行距、单位、对象层级、根边界和实例刷新不纳入容差。

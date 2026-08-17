# TASK-SLICE-190A 正式背包装备 tooltip 视觉验收

## 验收环境

- 现代运行：`npm run preview`，`http://localhost:4174/`，940×590，2026-08-17。
- 原版真值：`task-settings-189.equipment-tooltip`，12 状态 / 32 对象，`verified`，`unresolved=[]`。
- 页面真值：`task-settings-170b1.equipment-page`。
- 允许的现代可见例外：无。

## 并排基准

| 状态 | 原版 source replay | 现代正式运行 |
| --- | --- | --- |
| 随机基值 +3 实例 | [`original-source-replay-inventory-random-strength-hover-940x590.svg`](../TASK-SETTINGS-189/original-source-replay-inventory-random-strength-hover-940x590.svg) | [`modern-p1-random-strength-equipped-hover-940x590.png`](modern-p1-random-strength-equipped-hover-940x590.png) |
| P1 背包格 | [`original-source-replay-inventory-base-hover-940x590.svg`](../TASK-SETTINGS-189/original-source-replay-inventory-base-hover-940x590.svg) | [`modern-p1-inventory-hover-940x590.png`](modern-p1-inventory-hover-940x590.png) |
| P2 已穿戴槽 | [`original-source-replay-p2-hover-940x590.svg`](../TASK-SETTINGS-189/original-source-replay-p2-hover-940x590.svg) | [`modern-p2-equipped-hover-940x590.png`](modern-p2-equipped-hover-940x590.png) |

## 差异与状态证据

- 首次运行对照暴露 189 生成器遗漏 `drawInfo()` 在名称后的 `++i`；旧基准使名称/品质重叠。本轮按 `AttributeCon.as:46-101` 修正为品质从第 2 个 25px 行开始，重生 manifest 与 12 张 source replay，Schema 和完整性重新通过。
- 随机/+3 fixture 为 `_clj`，`baseStatsOverride.power=234`、`strengthLevel=3`；正文保留 `攻击：234`，强化只以 `(+78)` 后缀投影，没有把总值写回第二 owner。
- 自动几何回测把同 fixture 现代宽/高与 manifest 根边界直接比较：`182.6×247`（浮点容差 `<0.0001`）。右侧格实测向左翻转，底行实测下沿夹到 590。
- 移出格/槽后根容器隐藏；切到第 2 页时页面重建且旧 tooltip 清空；`Esc -> C`关闭重开后再次 hover 创建新投影。
- P1 背包格、P1 已穿戴槽、P2 背包格/已穿戴槽均使用同一 `EquipmentTooltipSystem/View`；两个 fresh 浏览器页的 console warning/error 均为 0。
- 可见对象差异：背景、名称、品质/类型/条件字段、非零属性、说明、灵魂价值均由原对象等价重建；无新增现代标题、面板、按钮或例外文字。

## 字体容差

Phaser/Canvas 与 Flash 的 FZCuYuan 栅格化、抗锯齿和 GlowFilter 边缘不作像素全等断言；对象数、行距、字段、单位、层级、根边界和 930/590 边缘公式不纳入字体容差。

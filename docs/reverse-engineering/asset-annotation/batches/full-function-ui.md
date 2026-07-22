# 标注批次：full-function-ui

## 范围

- 背包/装备、技能总页与三子页、宠物页、法宝页、装备强化/分解/制作子页。
- 影响 `TASK-SETTINGS-058`、`M-052`、`VS-054` 及后续同线实现 task。
- 复用既有 `crafting-ui.container` 119 与 `crafting-ui.fusion-panel` 169，不创建重复 stableKey。

## 输入与结论

- 恢复源包：`assets/backpack1.swf`、`assets/OtherMat1.swf`、`assets/pet1.swf`。
- SymbolClass：304/246、250/868/417/213、932、596、198/177/152。
- FFDec 26.0.0 只读选择性导出 symbolClass 与组合 SVG 到 `local-resources/regima/task-outputs/task-settings-058-ui/`。
- 11 条视觉资源均确认源包、character、用途与边界，状态为 `derived-ready`。
- `BackPack` 全导出被离台子件扩到 2095.2×1070.7，正式实现必须裁为 940×590；其余根页与原舞台一致或仅有 0.05 像素导出误差。

## 去向

- `TASK-SLICE-135/136/137/139` 分别接入背包、技能、宠物和法宝资源。
- `TASK-SETTINGS-059` 先闭合 Strength/Resolution/Making 行为，再由后续实现 task 接入三条子页资源。
- 页面动态文本、格子、状态和交互由现代运行时生成，不把组合 SVG 当作整页静态截图。

## 关闭检查

- [x] 11 条记录均有唯一 stableKey、精确源包/symbol id、状态与后续去向。
- [x] 视觉存在性以 restored SWF 为准，legacy extraction 只用于 AS3 行为交叉确认。
- [x] 舞台、子页边界和 BackPack 离台异常已记录。
- [x] 派生物只写入新 task-output，未修改恢复源与 legacy extraction。

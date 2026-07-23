# TASK-SLICE-143 技能 UI 原生化视觉验收

## 验收边界

- 舞台固定为 940×590。
- 原版视觉基准来自 `skill-ui-native-index.md` 锁定的 `OtherMat1.swf` character 250/868/417/213 与 `task-settings-061-skill-native` 逐帧 SVG。
- 现代截图全部从地图正式入口进入共享 `FeatureUiHost`，没有使用独立静态演示页。
- 新增可见现代例外：无。

## 证据

| 状态 | 现代截图 | 原版基准 | 结果 |
| --- | --- | --- | --- |
| P1 主动默认/拒绝 | `TASK-SLICE-143-active-p1.png` | 250 frame 1 + 868 frame 1 + selector 218 frame 2 + 865 frame 1 | 根页、主动页、按钮、文字和槽位均直接复用原资源；灵魂/等级写入原 TextField 矩形 |
| P2 owner | `TASK-SLICE-143-active-p2.png` | selector 218 frame 1/2 | 第二个原角色选择器承担 selected；没有 P1/P2 现代文字按钮 |
| 主动学习成功 | `TASK-SLICE-143-active-learned.png` | skill icon 630 frame 3、动态 `LV.n` child | learned 帧、`LV.1` 与灵魂/心法等级进入原槽位 |
| 绑定默认 | `TASK-SLICE-143-binding.png` | 417 frame 1、source addChild、393/398/403/408/413 frame 1 | 原 506×356 模态、source、五键槽和 337 关闭按钮直接承担视觉 |
| 绑定重载 | `TASK-SLICE-143-binding-reload.png` | slot `+ (5,5)` 动态 child | 中间槽保存后重开仍显示已绑定技能；x_btn 是唯一提交/返回控件 |
| 被动默认/拒绝 | `TASK-SLICE-143-passive-p1.png` | 213 frame 1 + 212 frame 1..5 | 五行原背景、名称、207 升级按钮与动态字段保持原坐标 |
| 被动成功 | `TASK-SLICE-143-passive-success.png` | 212 字段公式 | 当前/下级效果、灵魂成本与等级更新在原 TextField 矩形内 |

## 差异与容差

- 稳定背景、烘焙中文字、技能说明、原按钮图形和槽位均为同一恢复 SVG 全 alpha 复用；这些区域不存在现代重绘差异。
- 动态 TextField 的占位 glyph 在派生 base/row SVG 中按原实例 id 移除，再由 Phaser 文字写回相同矩形；允许浏览器与 Flash 的字体栅格化/抗锯齿差异，不容差字段位置、对齐、颜色或是否存在。
- Phaser image 无法让 SVG 内 CSS `:hover/:active` 驱动贴图，因此生成器从同一 DefineButton2 分离 up/over/down 三张静态状态图；事件只切换原状态纹理，透明命中区不绘制任何替代视觉。
- 绑定页保留原拖放路径，并支持证据合同批准的“点击原 76×76 槽位”非视觉等价；没有新增 focus outline、标签、提交按钮或外框。

## 可见对象差异清单

| 对象 | 结论 |
| --- | --- |
| 全屏暗层、900×548 外框、现代标题 | 已删除 |
| P1/P2 通用文字按钮 | 已删除，改用角色选择器两帧 |
| 顶部四个现代 tab | 已删除，改用原主动/被动、心法、设置与 x_btn 路径 |
| 主动通用技能按钮/动作按钮 | 已删除，改用 865、50×3 技能帧、580/638 |
| 绑定文字列表/五槽文字按钮/“绑定到选中槽” | 已删除，改用 source、五原槽和 x_btn 提交 |
| 被动五大按钮/“升级选中被动” | 已删除，改用五个 212 行与各自 207 |
| 永久摘要/现代关闭按钮 | 已删除；反馈保留为非可见状态，关闭使用 240 |
| 现代可见例外 | 无 |

## 运行结果

- P1/P2 owner、主动/被动、成功/拒绝、绑定提交、关闭和重开均从正式入口完成。
- 新鲜浏览器标签页 console `error/warning` 为 0。
- 浏览器成功态使用临时本地 QA 新档种子；种子源码在截图后立即还原，`src/systems/SaveSlotSystem.ts` 最终无 diff。保存/重载的确定性合同另由 `formal-skill-tests.ts` 覆盖。

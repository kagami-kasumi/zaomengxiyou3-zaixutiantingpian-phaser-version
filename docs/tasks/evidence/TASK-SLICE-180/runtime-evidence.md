# TASK-SLICE-180 运行证据

## 真值与来源

- 直接消费 `task-settings-175a.pet-page`；状态为 `verified`，共 74 个 scoped display object、16 个状态，`unresolved=[]`。
- manifest SHA-256：`84eb4c2ee00ccc174263230807333d723f3f444411dc1c1ffeea2d2bbc9dd044`。
- 页面根使用恢复源 `pet1.swf` character 932；列表行、tooltip、放生确认和按钮状态均来自同一恢复源导出。
- 宠物头像从 `pet1.swf` 的 BitmapData SymbolClass 首帧裁切；技能图标从 `EIcon1.swf` 的 `petskill_*` SymbolClass 提取。
- 生成入口：`npm run generate:pet-page-native-assets`；运行对比入口：`npm run generate:pet-page-runtime-evidence`。

## 显示列表与现代例外

- `FormalPetPageTruth.ts` 在运行时直接导入并断言 verified manifest，视图以 manifest bounds 投影 932 根、动态字段和 16 状态命中区。
- 列表行使用原 1224 结构；头像、八技能、进度帧、品质帧、tooltip、按钮 normal/hover/pressed 和 1221 放生确认均使用恢复源资产。
- 旧的深色面板、矩形卡片、Arial 标题、摘要和现代按钮已删除。
- 允许的新增可见现代例外：无。动态文字仅填入原显示列表字段，不新增现代 chrome。

## 状态覆盖

| 状态族 | 证据 |
| --- | --- |
| empty-p1 / empty-p2 | manifest 投影测试；共用原坐标，owner 专项覆盖 P1/P2 隔离 |
| page1 / page2 | 分页与列表行运行测试，原 1224 行结构 |
| selected-resting / selected-fighting | `modern-selected-p1-940x590.png` 代表截图；业务专项覆盖休息/出战 |
| skills-0 / skills-8 | 八槽运行投影与原技能图标资产计数 |
| skill-hover | `modern-skill-hover-p1-940x590.png`，原 tooltip 可见 |
| button-hover / button-pressed | 四组原按钮状态资产与 truth hit zone 回测 |
| release-confirm | `modern-release-confirm-p1-940x590.png`，原 1221 确认层；验收只执行取消，未破坏存档 |
| reroll-success / evolution-success | `formal-pet-tests` 覆盖事务、owner、持久化与重新渲染 |
| p2-owner | 自动化 owner/存档回归；视图与 P1 使用同一 manifest 几何。浏览器控制器无法注入小键盘减号，因此未伪造错误按键截图 |
| closed | 原关闭命中区直接转发 `onClose`，运行投影测试覆盖 |

## 逐状态视觉差异

- selected：`comparison-selected-p1-1880x590.png`、`overlay-50-selected-p1-940x590.png`、`difference-selected-p1-940x590.png`。
- skill-hover：`comparison-skill-hover-p1-1880x590.png`、`overlay-50-skill-hover-p1-940x590.png`、`difference-skill-hover-p1-940x590.png`。
- release-confirm：`comparison-release-confirm-p1-1880x590.png`、`overlay-50-release-confirm-p1-940x590.png`、`difference-release-confirm-p1-940x590.png`。
- 浏览器固定 940×590；最终页、技能 tooltip 和放生确认均人工核对，console warning/error 为 0。

## 结论

宠物页的原版显示列表、动态运行字段和业务 owner 已闭合为同一运行入口。`M-035/M-042/M-052` 仍受更广功能 UI 范围约束，不因本单页完成而整体提升；`VS-054` 继续等待 181..183。

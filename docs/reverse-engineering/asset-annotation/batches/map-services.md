# 标注批次：map-services

## 范围

- 天庭地图“丹药 / 商城 / 设置 / 任务”四个服务页根显示列表。
- 对应 `TASK-SETTINGS-066` 拆分检查点、`M-044/M-046/M-052` 与 `VS-059`。

## 输入与结论

- 恢复源包：`assets/OtherMat1.swf`、`assets/backpack1.swf`、`assets/StageCommon.swf`。
- SymbolClass：990 `ImmortalityInterface`、721 `Micropayment`、148 `gameSetting`、85 `TaskInterface`。
- FFDec 只读选择性导出 SVG/PNG 到 `local-resources/regima/task-outputs/task-settings-066-map-services/`。
- 四条根资源均已确认精确源包、character、用途与 normal 视觉基准，状态为 `derived-ready`。
- `TASK-SETTINGS-066A` 又补齐丹药格、炼制弹窗、四个按钮和五职业 owner 选择器共 11 条深层资源；本批次现有 15 条 `derived-ready`。
- `TASK-SETTINGS-066B` 补齐商城商品卡 717、确认弹窗 624 和 16 个按钮四态，共新增 18 条深层资源；本批次现有 33 条 `derived-ready`。
- 四页跨三包与四套事务 owner；丹药、商城页深层显示列表已闭合，其余按钮状态、动态 child 与内容全集分别交给 `066C..D`。

## 去向

- `TASK-SETTINGS-066A/B` 的丹药/商城证据见 `../../immortality-ui-index.md` 与 `../../shop-ui-index.md`；`066C..D` 继续闭合设置、任务。
- `TASK-SLICE-155A..D` 在对应证据未知清零后选择性接入；不得把根 SVG 当作可交互整页截图。

## 关闭检查

- [x] 33 条记录均有唯一 stableKey、精确源包、symbol id、状态与唯一后续去向。
- [x] 视觉存在性以 restored SWF 为准，legacy extraction 仅作行为交叉确认。
- [x] 原舞台、商城导出越界与 normal 基准已记录。
- [x] 派生物只写入新 task-output，未修改恢复源与 legacy extraction。
- [x] 丹药/商城页在各自完整六段证据后标记深层显示列表闭合；设置/任务页仍未越权关闭。

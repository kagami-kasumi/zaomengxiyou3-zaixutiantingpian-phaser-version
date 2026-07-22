# 标注批次：save-slots

## 范围

- 资源族：启动主菜单、六槽存档面板、覆盖/删除确认框。
- 影响：`TASK-SETTINGS-056`、`TASK-SLICE-132`、`VS-052`。
- 排除：角色选择、开场动画、天庭地图、外部存档导入。

## 输入和证据

- AS3：`GMain.as`、`GameMenu.as`、`SaveInter.as`、`MemoryClass.as`、`MapMenu.as`。
- 恢复源包：`assets/OtherMat1.swf`、`assets/Common1.swf`。
- FFDec：确认 `GameMenu` character 1149、`SaveInter` character 69、`IsCover` character 18，并选择性导出单帧 SVG/PNG 到 `local-resources/regima/task-outputs/task-settings-056-save-slots/`。
- 人工证据：无；三份 PNG 已逐张目检。

## Agent 调查结论

- 3 条资源均确认精确源包、SymbolClass、character id 和 940×590 舞台语义。
- `GameMenu` 组合导出宽 1574.8，原因是 1P/2P 子菜单被时间轴移到舞台右侧；现代启动页只使用 940×590 主菜单区。
- 原版 `IsCover` 文案是覆盖存档；现代删除确认可复用同一框体，但删除文案是现代文本，不冒充原版字形事实。
- 对应标注表：`../annotations/save-slots.csv`。

## 去向

- 3 条均已由 `TASK-SLICE-132` 选择性复制到 `public/assets/ui/save-slots/`、注册 manifest provenance 并转为 `ready + none`。
- 无待消歧、缺源或拆分评估项。

## 关闭检查

- [x] 每条记录有唯一 stableKey、精确源包、symbol id、状态和去向。
- [x] 恢复 SWF 是视觉存在性的最终依据。
- [x] 原版覆盖与现代删除语义已区分。
- [x] 派生物写入新 task-output，未修改源语料库与 legacy extraction。
- [x] 正式六槽页、损坏反馈和删除确认在 940×590 浏览器样本中可读且不遮挡交互。

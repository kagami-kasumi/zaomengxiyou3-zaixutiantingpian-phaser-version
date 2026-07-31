# 标注批次：level-results

## 范围

- 所有关卡共享的 `export.win.GameWin` 与 `export.lose.GameFail`。
- 包含根视觉、四个动态成绩字段、下一关/重玩/返回按钮及逐状态。
- 排除完整计分 producer、怪物/波次/门和 Stage 2-3 内容。

## 输入与结论

- 恢复源包：`assets/OtherMat1.swf`。
- SymbolClass：330 `export.win.GameWin`、313 `export.lose.GameFail`。
- 根显示列表：330 = 320、321..324、312、329；313 = 302、307、312。
- FFDec 26.0.0 精确导出写入 `local-resources/regima/task-outputs/task-slice-161-level-results/`，源 SWF 与 legacy extraction 未修改。
- 302/320 为 940×590 原版基础视觉；307/312/329 均有 up/over/down/hittest，现代接入前三态并复用原命中尺寸。

## 去向

- `TASK-SLICE-161` 接入五关唯一共享结果 presenter。
- 四个动态字段使用既有同包 `FZCuYuan-M03` 字体；现代尚未实现的最高连击/总积分 producer 显示 0 并保留数据缺口。

## 关闭检查

- [x] 五条记录具有唯一 stableKey、精确源包、symbol id 与 public 去向。
- [x] 视觉存在性以 restored SWF 为准，legacy AS3 只作行为交叉确认。
- [x] 派生物只写入新 task-output，未修改恢复源或 legacy extraction。
- [x] 根、depth、矩阵、动态字段和按钮逐状态已记录。

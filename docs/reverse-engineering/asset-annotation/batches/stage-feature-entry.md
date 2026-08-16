# 标注批次：stage-feature-entry

## 范围

- 正式关卡 `RoleInfo` 五入口、关卡 `SetMenu` 及其 `Help` 子页。
- 对应 `TASK-SETTINGS-067`、`M-016/M-035/M-052` 与 `VS-060`。
- 排除背包、技能、宠物和法宝页面内部业务与资源；这些继续引用既有专项索引。

## 输入与结论

- 恢复源包：`assets/OtherMat1.swf`。
- SymbolClass：574 `export.RoleInfo`、371 `export.setmenu.SetMenu`、444 `export.Help`。
- FFDec 26.0.0 只读 `swf2xml` 与精确 `-selectid` 派生物位于 `local-resources/regima/task-outputs/task-settings-067-stage-feature-entry/`。
- 574 的 549/555/561/567/573 五按钮、共享 hittest 418、371 的八个按钮/三帧 `huazhi`、444 的两帧/三按钮均已定位。
- 五个 HUD 按钮的 over/down 共帧且没有独立 disabled；设置按钮按各自 DefineButton2 记录保留真实状态差异。

## 去向

- `TASK-SLICE-156A` 选择性接入五个 HUD 按钮、P2 镜像和入口 router。
- `TASK-SLICE-156B` 接入 371/444、全局设置 owner、单页互斥和原版关闭/路由语义。
- `TASK-SLICE-156C` 在五个正式关卡做 940×590 P1/P2 逐状态运行校准。

## 关闭检查

- [x] 16 条记录具有唯一 stableKey、精确源包、symbol id、状态与唯一后续去向。
- [x] 视觉存在性以 restored SWF 为准，legacy extraction 只作行为交叉确认。
- [x] 派生物只写入新的 Git 忽略 task-output，未修改恢复源或 legacy extraction。
- [x] 574/371/444 的根、depth、矩阵、按钮状态、动态 child 和 940×590 normal 基准已记录。
- [x] P2 镜像、owner、暂停、互斥、返回、原版/现代差异和后续双重验证已落盘。

## 175C 机器真值升级

2026-08-16 已将本批次的 574/371/444 证据机械升级为 `task-settings-175c.stage-feature-host` verified manifest：本轮选择性 SVG/PNG/button 与上述精确 XML 显示列表交叉核对，25 对象、42 状态、`unresolved=[]`。地图态共享 chrome 以“原版无对象”的负向状态序列化，没有为当前现代层伪造 stableKey 或 locator。

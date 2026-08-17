# TASK-SLICE-188 视觉与运行验收

## 范围

- 原版基准：`../TASK-SETTINGS-175E/original-*-940x590.png`，OtherMat1.swf character 990/969/1006。
- 现代入口：940×590 preview 正式存档 → 天庭地图 → 丹药。
- 允许的新增可见现代例外：无；即时保存仅为既有非可见离线可靠性选择。

## 对照结果

| 状态族 | 原版对象 | 现代结果 | 差异结论 |
| --- | --- | --- | --- |
| normal / owner | 990、五 selector、动态字段 | 根、P1 selector、灵魂与五效果字段均按 manifest bounds 投影 | 无额外标题、面板或按钮；当前正式存档为 1P，P2 几何与 owner 事务由专项覆盖 |
| 25 格 | 25×969、968、动态已服用图 | 槽根保留静态资源，服用按钮和已服用图按各自对象 ID 投影 | locked/eaten 的 42×47 与 51×51 边界直接来自真值 |
| make / back | 989、973 三态 | hover/down/up 使用原按钮资源和 manifest bounds | 正式 pointer 可达；返回天庭地图通过 |
| craft dialog | 1006、五个 989、997 | 全舞台阻挡、五炼制按钮与关闭均按 manifest bounds 投影 | 打开、hover、关闭后根页恢复；无现代确认层 |
| 拒绝 / 成功 | 共享提示，不属于 990/1006 child | 既有 toast 保持宿主反馈，不计入页内显示列表 | 未冒充原版页面 child；事务顺序与即时保存未改 |

## 运行记录

- 2026-08-17 以 940×590 内置浏览器对照 `original-normal-p1-wk-940x590.png` 与 `original-craft-dialog-940x590.png`，检查 normal、make hover、craft dialog、dialog close、back return。
- 页面与弹层稳定帧的对象位置、尺寸、depth 关系与原版基准一致；指针纹理切换瞬时截图可能处于 WebGL 重绘中间帧，因此关闭结论以稳定帧和自动按钮状态/坐标门禁为准。
- 浏览器 console warning/error：0。
- `test:immortality` 覆盖 132/26 完整性、990/1006 身份、首末格/动态图、P2 selector 投影、P1/P2 服用/炼制/拒绝与当前存档重载；`test:immortality-page-truth` 复核生成器与 Schema。

# TASK-SLICE-181 法宝页运行差异证据

## 验收范围

- 原版真值：`task-settings-175b.magic-weapon-page`，`verified`，28 对象、21 状态、`unresolved=[]`。
- 现代入口：940×590 正式 Stage 2-2，P1 存档，`N` 打开法宝页。
- 现代可见例外：空。
- 业务 owner：`FormalMagicWeaponPageSystem`、装备、库存、灵魂和当前存档保持不变。

## 视觉产物

- `modern-normal-level1-p1-940x590.png`：正式关卡 normal 页，596 根与九个动态字段。
- `modern-reset-refused-material-p1-940x590.png`：character 34 重置确认；材料不足确认后 overlay 保留。
- `comparison-normal-level1-p1-side-by-side.png`：左侧恢复源 940×590 基准，右侧现代正式运行态。
- `comparison-normal-level1-p1-overlay-50.png`：恢复源与现代运行态 50% 叠图；恢复源透明舞台外区域不参与页面对象差异结论。

## 逐对象差异

| 对象族 | 现代投影 | 差异结论 |
| --- | --- | --- |
| 596 根与 17 个 child | `fullFeatureUiAssets.magicWeaponPage`，alpha 1，原舞台矩阵 | 原资源复用；额外暗层/矩形/chrome 为 0 |
| 368/436/31 | 直接使用 manifest bounds、character id 与 up/over/down PNG | 原资源复用；命中与按钮态直接消费真值 |
| 九个动态字段 | 直接使用 manifest TextField bounds 与 FZCuYuan 字体栈 | 等价动态重建；仅允许字体栅格化边缘差异 |
| 200/34 overlay | 同源 SVG 根、manifest bounds 与动态 `txt` | 原资源复用 + 等价动态文字；共享 overlay 不使用现代弹窗 |
| 19/24 确认按钮 | 直接使用 manifest bounds 与原按钮三态 | 原资源复用；拒绝后 character 34 保留符合原状态 |
| 未装备/P2/关闭 | 页对象数 0；不构造现代替代页 | 负向真值保持 |

## 状态回测

- normal、升级/重置/关闭 hover、重置确认、确认按钮、取消、材料不足保留、关闭返回已在 940×590 正式关卡回测。
- 灵魂升级、普通/特殊材料确认、升级/重置事务、P1 owner 与当前存档由 `test:formal-magic-weapon` 确定性覆盖。
- 页面真值生成、Schema、28 对象/21 状态完整性由 `test:magic-weapon-page-truth` 覆盖。
- fresh 浏览器 console warning/error 为 0。

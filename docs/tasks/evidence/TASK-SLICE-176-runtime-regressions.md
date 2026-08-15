# TASK-SLICE-176 运行回归证据

## 用户反馈与根因

- 背包 `soul-value`：verified TextField 为 `(664.7,450.5,100×24)`。用户用原版长数字截图澄清“黑色区域右侧”是指“灵魂”标签右侧的黑色输入区，并非数字右对齐。直接解析恢复包 `backpack1.swf` 后确认 `DefineEditText 214 / txt_lh` 使用 font 25、15px、白色、左对齐、outline；`DefineFont3 25` 名为 `FZCuYuan-M03`。
- HUD 574：`role-info.svg` 已含五个按钮的 up child，`FormalFeatureUiEntryBridge` 又常驻绘制同一批 up 图，形成两份错位可见层。
- 设置 371/444：整帧 PNG 已含 normal 按钮/文字，`StageSettingsScene` 又常驻绘制 up 图和默认 `x1`，形成用户截图中的白字重影。
- Role5：`jidle/jwalk/jattack...` 的外层帧是衣装选择帧；现代实现误把它们当连续动作帧按时钟循环。浏览器逐帧直读 `jidle` 1..6 显示白/蓝/金/红/紫/绿六套衣装，直接确认用户所述“自主换装”。

## 修复映射

- 灵魂值直接消费 verified `txt_lh` 文本样式：从字段左上各加 2px 的 Flash 文本内边距起笔，使用 `FZCuYuan-M03` 15px 白字左对齐，长数字向右自然展开。运行时不再维护右锚点或垂直居中的第二套推断坐标。
- 574 shell 移除五个已拆出的 button instance，交互层继续绘制唯一按钮及其 hover/down 状态。
- 371 设置根中已含 up 的六行文字和 `x1` 先以固定黑底区一次性清除，再按各 PNG 的透明像素边距补偿常驻唯一 up 图并原位切换 over/down；倍率帧始终唯一重绘。不再用 `alpha=0.001` 伪隐藏层。关闭按钮使用其中心注册点清除和绘制，普通态无第二个 X 或残留遮罩。声音/倍率动态状态保留原 owner；444 帮助页未扩大整改范围。
- Role5 剑形每个动作继续保留原时长与动作切换，但同一动作的外层 selector 固定为当前默认衣装帧，不再随时间轮换。

## 940×590 运行观察

- `?qaStage=1-1-role5`：连续四帧中 Role5 均保持白色默认衣装；移动/位置变化不再切换衣装。画面中的飞鸟是 Stage 1-1 敌人，不属于 Role5 body。
- 同一路径 Escape 打开设置：普通态只有一个关闭 X；前四行左边界一致，长文本沿原中心线展开；声音与出怪速度 hover/移出均在同一位置切换，`x1 → x2` 后仍无底字、残边或第二份倍率。
- 灵魂专项 fixture 支持 `?qaEquipmentRole=1&qaEquipmentOwner=p1&qaEquipmentCase=empty&qaEquipmentSoul=12896360`，可精确回放用户目标长数字。最终更正后的实现由原 SWF 字段事实、machine-truth 与自动测试闭合；本轮浏览器在首次预览连接失败后停留于受安全策略保护的错误页，无法重新导航，因此没有伪报新的视觉观察。
- 更正前的 HUD、设置和 Role5 三次 940×590 观察 console warning/error 均为 0；这些结论不受灵魂文本对齐更正影响。

## 自动验证

- `npm run test:formal-inventory`
- `npm run test:equipment-page-truth`
- `npm run test:equipment-page-runtime-truth`
- `npm run test:equipment-page-qa`
- `npm run test:stage-feature-entry`
- `npm run test:role5-visuals`
- `npm run test:systems`
- `npm run build`

本证据只关闭用户确认的四项运行态回归；HUD/设置新版 machine-truth manifest 债务仍由 `TASK-SETTINGS-175` 分级，不据此重新宣称整页视觉已闭合。

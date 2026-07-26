# TASK-SLICE-155C 设置 overlay 视觉审计

## 验收环境

- 现代版：2026-07-25 production build，内置浏览器，940×590。
- 原版基准：`StageCommon.swf` character 148 的 940×590 PNG/SVG 导出；叠加到同一张现代天庭地图基底，只用于比较 overlay。
- 入口：正式六槽存档 → 天庭地图 → 原菜单“设置”按钮。

## 可见对象差异清单

| 对象 | 现代映射 | 判定 |
| --- | --- | --- |
| 134 全舞台透明命中面与中央面板 | 148 根 SVG 派生静态底图 + 940×590 透明交互 blocker | 原资源复用；底层地图不可穿透 |
| 136..139/147 五个静态标签 | 按原坐标、边界、22px 方正粗圆 TextField 等价重建 | 等价重建；FFDEC SVG 的嵌入中文字形在浏览器为空 |
| 145/146 五个值 wrapper | 按原 `(x+2,y+2)`、104×34.1、25px、白/黄状态动态绘制 | 等价重建；前四项显示运行值，第五项保持“示 例” |
| 144 关闭按钮 | 原 DefineButton2 up/over/down 三态 SVG 与原 hittest | 原资源复用 |
| 提示文字 | 按原点击文案短时显示 | 等价重建；不新增设置说明或存档提示 |
| 跨重启保存 | 独立全局 localStorage codec，无可见新增对象 | 用户批准的现代例外；不进入 V6/player schema |

未新增现代标题、暗罩、通用按钮、P1/P2 选择器、恢复默认功能或替代标签。

## 逐状态证据

- `TASK-SLICE-155C-normal.png`：默认 normal 与五行实际值。
- `TASK-SLICE-155C-hover.png`：难度值 yellow hover；按住不增加视觉帧。
- `TASK-SLICE-155C-changed.png`：困难、BGM 关、技能音效关、质量中；默认音量点击后仍为“示 例”。
- `TASK-SLICE-155C-close-hover.png`：关闭按钮原 over 帧。
- `TASK-SLICE-155C-restart.png`：浏览器重载后保持全局设置。
- `TASK-SLICE-155C-original-modern.png`：同 940×590 原版/现代并排。

## 几何与差异

- 根、面板、五行和关闭命中区使用 `settings-ui-index.md` 的舞台坐标，无额外缩放或页面偏移。
- 稳定面板区域排除五行文字和关闭按钮后，原版/现代 RGB 平均每通道绝对差为 `3.4953`；差异主要来自 SVG/Canvas 栅格和地图基底压缩边缘，没有观察到整体位移、缩放、面板缺失或透明区域错误。
- 动态/静态文字使用项目内 FZCuYuan 字体，但 Flash 嵌入轮廓与浏览器 TTF 的抗锯齿仍存在可见容差；字位、字号、颜色、对齐和命中边界与证据一致。

## 结果

- normal、hover、click 后 hover、关闭 hover、完整循环、关闭重开、底层阻挡和跨重载均通过。
- console warning/error 为 0。
- 本审计只闭合设置单页，不提升任务页或整个 VS-059。

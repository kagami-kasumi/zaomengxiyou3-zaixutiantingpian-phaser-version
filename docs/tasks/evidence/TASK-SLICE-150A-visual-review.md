# TASK-SLICE-150A Stage 2-2 视觉与遍历验收

## 验收范围

- 940×590，本地显式入口 `?qaStage=2-2-layout`。
- 只验收真场景、3 个单向平台、左右边界和 9 个 FireThron。
- 不显示波次、怪物、Boss、胜利或存档占位；普通门按原非 Stage 0 初始状态保持隐藏。

## 原版视觉基准与显示列表

权威源为恢复 `assets/levels/level22.swf` character 64 和 `assets/2.swf` character 279/3。现代场景直接消费选择性派生物，没有重画玩家可见层。

| 原显示对象 | depth / 父级 | 原点、边界与状态 | 现代映射 |
| --- | --- | --- | --- |
| character 32 `bgContainer` / 279 `bg22` | 1 / `sl22` | 容器 `(-25,0)`，背景 local `(-20,0)`，4700×590 | `Stage22WorldBridge.bgContainer` / `background.svg` |
| character 34 前景/地面 | 3 / `sl22` | 世界 `(-7.15,496)`，4701×94 | `foreground.svg` |
| character 31 `FireThron` ×9 | 4..36 / `sl22` | 原点见 `Stage22Layout`；local `(-71.5,-285.7)..(71.5,28.65)`；scaleX `0.74472046`；130 帧 | 130 个真 SVG 帧与 9 个 `stage22-fire-*` view |
| character 36 中景 | 51 / `sl22` | 世界 `(230.7,286.85)`，1745.1×52.45 | `midground.svg` |
| character 63 普通门 | 84 / `sl22` | 原点 `(4316.75,450.75)`；local `(-90.75,-110.7)..(95.05,54.3)`；初始隐藏 | `transfer-door.svg`，保持隐藏 |
| character 3 `floorBg2` | `sl22` 创建前 | 631×549，固定舞台背景 | 复用 `stage.stage2.floor` |

文本、按钮、mask、filter 和玩家可操作 UI：本切片场景根不适用。顶部 QA 文本、占位玩家和 `qaX/qaNoDamage/qaFireFrame` 只在本地显式 QA 入口出现，属于批准的现代验收控制；正式地图没有 Stage 2-2 路由。

## 原点、注册点与静态差异

| 对象 | 源边界 / 原点 | 现代放置 | 差异 |
| --- | --- | --- | --- |
| 背景 | container `-25` + local `-20` | 同矩阵 | 0 世界单位 |
| 前景 | left `-7.15`, top `496` | 同坐标 | 0 世界单位 |
| 中景 | left `230.7`, top `286.85` | 同坐标 | 0 世界单位 |
| 火焰 | instance `(x,y)` + local bounds + scaleX | `x - 71.5×0.74472046`, `y - 285.7` | 0 世界单位；纹理由同一选择性 SVG 直接栅格化 |
| 门 | instance + local bounds | `(4316.75-90.75, 450.75-110.7)` | 0 世界单位；本切片不可见 |

静态层与原版选择性派生物是一一映射，几何叠合采用同一源 SVG 和源矩阵，因此稳定区域的源/现代几何差为 0；浏览器抗锯齿只发生于 Phaser 对 SVG 的运行时栅格化。右侧自由遍历 QA 可走到原右墙，背景在 `x=4655` 后出现约 37.55px 空带；正式停点镜头的末端由后续 `150B` 锁在 Boss 停点，不会进入该 QA 专用超程区域。

## 逐状态运行证据

- 初始/左边界：[TASK-SLICE-150A-scene-left-boundary.png](./TASK-SLICE-150A-scene-left-boundary.png)
- 右边界：[TASK-SLICE-150A-right-boundary.png](./TASK-SLICE-150A-right-boundary.png)
- 第一处火焰活动帧：[TASK-SLICE-150A-fire-first-active.png](./TASK-SLICE-150A-fire-first-active.png)
- 真像素命中后的 HP/击退反馈：[TASK-SLICE-150A-fire-hit-feedback.png](./TASK-SLICE-150A-fire-hit-feedback.png)
- 中段代表火焰：[TASK-SLICE-150A-fire-middle.png](./TASK-SLICE-150A-fire-middle.png)
- 右段代表火焰：[TASK-SLICE-150A-fire-right.png](./TASK-SLICE-150A-fire-right.png)
- 单向平台 1/2/3：[platform-1](./TASK-SLICE-150A-platform-1.png)、[platform-2](./TASK-SLICE-150A-platform-2.png)、[platform-3](./TASK-SLICE-150A-platform-3.png)

运行观察确认：

- frame 1 停止；玩家进入 200px 后从 frame 2 开始，frame 130 后回 frame 1 并可再次触发。
- 只有 frame 2..19 读取当前 SVG 纹理 alpha；整张 143×314.35 画布重叠但无可见像素时不会命中。
- 三个平台均需二段跳穿过后从上方落脚，脚底分别稳定在 `271.9 / 271.85 / 270.3`。
- 左右移动边界生效；三处代表火焰、平台与背景层没有观察到注册点漂移。
- 新标签页最终 console warning/error：0。

## 可见差异清单

| 项目 | 裁决 |
| --- | --- |
| 背景、中景、前景、地面 | 原资源直接复用 |
| FireThron 130 帧 | 原资源直接复用 |
| 普通门 | 原资源直接复用但按原流程隐藏，显门留给 `150C` |
| QA 顶栏、HP、占位玩家 | 本地显式入口的现代验收控制；正式不可见 |
| 波次、Monster16、结果页 | 未完成且无占位；分别属于 `150B/150C` |

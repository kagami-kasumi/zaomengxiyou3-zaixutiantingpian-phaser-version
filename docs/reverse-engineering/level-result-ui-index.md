# 公共关卡结果页证据

## 待证明问题

1. Stage 1-1 通关后的黑框是否来自原版资源？否；它由现代 `Rectangle/Text` 私有桥绘制。
2. 原版结果页是否逐关定义？否；所有普通关卡共享 `GameWin/GameFail`。
3. 胜利/失败分别有哪些可见 child、按钮、动态字段和路由？

## 显示列表

舞台尺寸均为 940×590，坐标由 twip 除以 20 得到。

| 根 | depth | child | character | 实例/用途 | 舞台坐标与边界 |
| --- | ---: | --- | ---: | --- | --- |
| GameWin 330 | 7 | 基础视觉 | 320 | 背景、人物、挑战成功、成绩标签 | (0,0)，940×590 |
| GameWin 330 | 8 | 动态文字 | 321 | `txt_allscore`，总积分 | x 727.2..861.95，y 394.1..437.1，右对齐 |
| GameWin 330 | 9 | 动态文字 | 322 | `txt_hight`，最高连击数 | x 767.1..861.95，y 334.1..377.1，右对齐 |
| GameWin 330 | 10 | 动态文字 | 323 | `txt_state`，过关状态 | x 743.1..861.95，y 270.05..313.05，右对齐 |
| GameWin 330 | 11 | 动态文字 | 324 | `txt_usertime`，过关用时 | x 743.1..861.95，y 210.05..253.05，右对齐 |
| GameWin 330 | 12 | SimpleButton | 312 | `backTochooseButton` | 注册 (268.45,386)，160×61 |
| GameWin 330 | 14 | SimpleButton | 329 | `nextStageButton` | 注册 (120.55,384.1)，131×61 |
| GameFail 313 | 2 | 基础视觉 | 302 | 背景、灰色人物、挑战失败 | (0,0)，940×590 |
| GameFail 313 | 3 | SimpleButton | 307 | `rePlayButton` | 注册 (305.95,394)，160×61 |
| GameFail 313 | 5 | SimpleButton | 312 | `backTochooseButton` | 注册 (470.95,394)，160×61 |

四个 EditText 均使用 character 200 `FZCuYuan-M03`、32px、白色、右对齐。307/312/329 均有 up/over/down/hittest；up 内部 y=-2px 校正已包含在 FFDec 导出的 61px PNG。

## 六段证据矩阵

| 合同项 | 局部证据 | 共享调用链 | 几何/坐标 | 等级 | 未知/例外 | 验证 |
| --- | --- | --- | --- | --- | --- | --- |
| 胜利页 | `GameWin.as`、330 | `LevelVictor -> GMain.levelVictor -> GameWin -> MainGame.levelClear` | 上表 | 交叉确认 | 无 | 资源测试 + 运行 |
| 失败页 | `GameFail.as`、313 | `GMain.gameOver -> GameFail` | 上表 | 交叉确认 | 无 | 资源测试 + 运行 |
| 下一关 | `GameWin.nextClick()`、329 | 更新当前关卡后 `selectStageOver` | 131×61 | 确认事实 | Stage 2-3 未实现，2-2 暂返回已解锁地图 | 路由测试 |
| 重玩 | `GameFail.rePlay()`、307 | `ReStart` | 160×61 | 确认事实 | 无 | 路由测试 |
| 返回 | 两类 `backClick/backToMap`、312 | 按 `whichlastworld` 回地图 | 160×61 | 确认事实 | 当前范围统一 HeavenMapScene | 路由测试 |
| 成绩字段 | `setUserTime/setState/setHigh/setAllScore`、321..324 | 读取时间、英雄 HP/MP、最大连击和 score | 上表 | 确认事实 | 212 已让共享战斗反馈会话产出并传入实际最大连击；总积分仍无 producer，显示 0 | 文本/几何测试 |

## 现代实现映射与差异

- `LevelResultView` 是五关唯一 presenter；生命周期只给出 `cleared/failed`，view 不反向拥有战斗规则。
- 302/320 和按钮三态全部直接复用恢复源派生资源。
- 动态数字使用已接入的同包 `FZCuYuan-M03`；字体抗锯齿差异是渲染器差异。
- 允许的现代例外只有：暂无 producer 的总积分显示 0；Stage 2-2 下一关暂返回已解锁地图。最大连击已由 212 的共享战斗反馈会话真实提供，不再属于例外。
- 禁止差异：全屏黑 Rectangle、现代标题/说明文字、矩形通用按钮、逐关私有 ResultBridge。

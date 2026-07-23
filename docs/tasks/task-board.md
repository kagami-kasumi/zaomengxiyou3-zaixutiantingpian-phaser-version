# 游戏任务看板

本文只记录未完成的游戏复现 task。完整系统范围和激活状态以 `docs/tasks/feature-lines.md` 为准；一次 `/goal` 的边界以 `docs/tasks/goal-board.md` 为准；task 是最小验收单位。完成 task 或 Goal 都不等于完成功能条线。

## 当前推荐

`TASK-SLICE-143` 是唯一当前推荐，属于唯一 `Active` Goal `GOAL-012` 和 `LINE-UI-NATIVE-SKILLS`。严格消费 `skill-ui-native-index.md`，移除技能四页现代覆盖层并完成原生化正式流程验收。

## 待完成任务

| Task | 状态 | Goal | 功能条线 | 类型 | 目标 | 目标机制/切片 | 输出 | 下一步 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| TASK-SLICE-143 | Ready | GOAL-012 | LINE-UI-NATIVE-SKILLS | UI 原生化整改 | 移除技能四页现代外层 UI，直接复用原图片中文字、按钮、状态和布局 | M-016、M-041、M-052、VS-055 | 四页原生化 view、业务回归、P1/P2/V4 与 940×590 逐状态证据 | 关闭本线并回写 PG-007 |

## 任务完成定义

### TASK-SLICE-143

任务类型：

- `TASK-SLICE`

功能条线：

- `LINE-UI-NATIVE-SKILLS`（Active）

Goal 包：

- `GOAL-012`（Active）

目标机制/切片：

- `M-016`、`M-041`、`M-052`、`VS-055`

输入资料：

- `docs/reverse-engineering/skill-ui-native-index.md` 闭合的四页 UI 原生化证据矩阵。
- `FormalSkillPageView.ts`、`FormalSkillPageSystem.ts`、`FeatureUiScene.ts`、技能业务 systems、四页真资源及正式入口 bridge。

UI 原生化合同：

- 显示列表清单：实现必须逐项消费 `TASK-SETTINGS-061` 闭合的根/子 Symbol、depth、矩阵、文字字段、按钮状态、动态 child 和命中区映射。
- 原版视觉基准：以证据 task 落盘的四页基准为唯一视觉比较源，不用现有现代页面截图反推原版。
- 允许的现代视觉例外：默认空清单；任何新增可见文字、面板、矩形、暗层或通用按钮都必须先记录证据缺口、最小边界并取得用户批准。
- 逐状态验收：normal/hover/pressed/selected、主动/被动/绑定、动态状态、P1/P2、关闭与重载。
- 差异证据：940×590 同尺寸并排/半透明叠图、稳定区域像素或边缘差异、可见对象逐项差异和容差说明。

输出产物：

- 移除四页全屏暗层、外层现代面板、现代标题和通用替代按钮。
- 直接复用原图片中的中文字、按钮、按钮状态和页面布局；透明命中区只绑定事件，不绘制替代视觉。
- 将灵魂、等级、技能说明、学习/升级状态、已学列表和五槽等动态内容放入原版槽位；现代例外严格使用已批准清单。
- 保持既有技能学习、升级、五槽绑定、被动、P1/P2、HUD 同步和 V4 保存系统 owner。

完成定义：

- 250/868/417/213 四页均完成原生化，不再把真资源当背景后覆盖一套外层 UI。
- 正式入口、P1/P2 owner、主动/被动切换、学习/升级、绑定、关闭、HUD 同步和保存/重载无回归。
- PG-007 存量矩阵将技能页标为已原生化，并留下可供后续宠物/法宝任务复用的实现样本。

验收标准：

- 实现前运行 `npm run check:structure`；目标文件 warning/error 按门禁处理。
- 原生资源/状态/命中区专项、技能专项、`npm run test:systems`、`npm run build`、`npm run check:workflow` 和 `git diff --check` 通过。
- 从地图与 Stage 正式入口完成 P1/P2 四页 normal/hover/pressed/selected、成功/拒绝、关闭、HUD 同步与重载；940×590 截图齐全且 console 无 error/warning。

禁止范围：

- 不重写技能数值、MP、冷却、学习成本、等级上限、五槽顺序或存档 schema。
- 不以现代文字、矩形、通用按钮覆盖原图片中文字；不顺带整改其他功能页或 Stage 2-1。
- 不用单页静态截图替代正式流程、按钮状态和双 owner 运行验收。

状态更新：

- 更新本线覆盖台账、`M-052`、`VS-055`、Goal/task/history、PG-007 效果样本；关闭合同满足后才关闭 `LINE-UI-NATIVE-SKILLS`。

推荐后续任务：

- 关闭本线后按用户批准的调度恢复内容线；宠物/法宝原生化另行生成 Planned 功能线，不在本 task 顺带执行。

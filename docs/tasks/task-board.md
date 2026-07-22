# 游戏任务看板

本文只记录未完成的游戏复现 task。完整系统范围和激活状态以 `docs/tasks/feature-lines.md` 为准；一次 `/goal` 的边界以 `docs/tasks/goal-board.md` 为准；task 是最小验收单位。完成 task 或 Goal 都不等于完成功能条线。

## 当前推荐

`TASK-SLICE-138D` 是唯一当前推荐，属于唯一 `Active` Goal `GOAL-004` 和功能线 `LINE-FORMAL-GAME-LOOP`。上一 Goal 已完成真分解页、100 灵魂、可注入随机产物和双 owner 原子事务；本 Goal 只接 78 本可达制作书、材料/宝石事务与产物实例持久化。

## 待完成任务

| Task | 状态 | Goal | 功能条线 | 类型 | 目标 | 目标机制/切片 | 输出 | 下一步 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| TASK-SLICE-138D | Ready | GOAL-004 | LINE-FORMAL-GAME-LOOP | 制作书 UI | 接入 78 本可达制作书、材料与宝石事务 | M-036、M-039、M-052、VS-054 | 真制作页、registry、产物实例和 V4 round-trip | `TASK-SLICE-139` |
| TASK-SLICE-139 | Planned | GOAL-005 | LINE-FORMAL-GAME-LOOP | 法宝 UI | 接入真法宝页、装备门禁、强化/重置和保存 | M-016、M-036、M-043、M-052、VS-054 | 真页面、P1 owner、特殊分支、存档与浏览器验收 | `TASK-SLICE-140` |
| TASK-SLICE-140 | Planned | GOAL-006 | LINE-FORMAL-GAME-LOOP | 端到端闭环 | 验收完整功能 UI 与正式主循环旅程 | M-005、M-016、M-044、M-050、M-051、M-052、VS-054 | 自动旅程、P1/P2 浏览器验收、覆盖台账与功能线关闭证据 | 关闭本线后恢复 `TASK-SETTINGS-053` |
| TASK-SETTINGS-053 | Planned | GOAL-007 | LINE-STAGE-2-1 | 关卡逆向 | 正式游戏主循环关闭后，闭合 Stage 2-1 真场景、地图标记、怪物/专属机制和结果流程 | M-026、M-027、M-030、M-035、M-044、VS-049 | 六段证据矩阵、资源标注、覆盖台账与最小可玩切片任务 | 等待 `LINE-FORMAL-GAME-LOOP` 关闭后恢复 |

## 任务完成定义

### TASK-SLICE-138D

任务类型：
- `TASK-SLICE`

功能条线：
- `LINE-FORMAL-GAME-LOOP`（Active，Ready）

Goal 包：
- `GOAL-004`（Active）

目标机制/切片：
- `M-036`、`M-039`、`M-052`、`VS-054`

输入资料：
- `equipment-workshop-index.md` 制作书 case/材料/宝石合同、FUI-14/152 真资源、工坊 host/V4。

输出产物：
- 78 本可达制作书 registry、真制作页、材料/灵魂/可选宝石事务与产物实例持久化。

完成定义：
- 78 本可达 case 全覆盖，1 个死分支保持不可达；可选宝石加成、取消/关闭返还和 V4 重载一致。

验收标准：
- registry 全覆盖、材料/宝石/产物实例专项、系统/build、浏览器和 `git diff --check`。

禁止范围：
- 不把死分支补成原版事实，不接入法宝页。

状态更新：
- Goal/功能线/覆盖台账、任务/历史、资源标注、`M-036/M-039/M-052`、`VS-054`。

推荐后续任务：
- `GOAL-005` / `TASK-SLICE-139`。

### TASK-SLICE-139

任务类型：
- `TASK-SLICE`

功能条线：
- `LINE-FORMAL-GAME-LOOP`（Active，Planned）

Goal 包：
- `GOAL-005`（Planned）

目标机制/切片：
- `M-016`、`M-036`、`M-043`、`M-052`、`VS-054`

输入资料：
- `full-function-ui-index.md` FUI-09、`magic-weapons-index.md`、596 真资源、共享 host/V4。

输出产物：
- 真法宝页、装备门禁、等级/五行/属性、强化/重置/特殊分支、P1 owner 与保存。

完成定义：
- 正式入口、未装备拒绝、提交/取消、关闭重算和重载一致；P2 面板入口作为现代选择或明确排除。

验收标准：
- 法宝 UI/装备/保存专项、系统/build、浏览器和 `git diff --check`。

禁止范围：
- 不改法宝战斗技能，不伪造原版 P2 快捷键，不推进 Stage 2-1。

状态更新：
- 功能线/覆盖台账、任务/历史、资源标注、`M-043/M-052`、`VS-054`。

推荐后续任务：
- `TASK-SLICE-140`。

### TASK-SLICE-140

任务类型：
- `TASK-SLICE`

功能条线：
- `LINE-FORMAL-GAME-LOOP`（Active，Planned）

Goal 包：
- `GOAL-006`（Planned）

目标机制/切片：
- `M-005`、`M-016`、`M-044`、`M-050`、`M-051`、`M-052`、`VS-054`

输入资料：
- 本线完整覆盖台账、正式启动/存档/地图/关卡/功能页实现与所有专项测试。

输出产物：
- 启动读档、地图、P1/P2 功能页、关卡、结算、解锁、返回、重载的自动旅程与浏览器证据。

完成定义：
- 覆盖台账无未解释缺口、同线无未完成 task、完整玩家旅程通过后才允许关闭本线。

验收标准：
- `check:all`、端到端专项、940×590 人工/浏览器旅程、console 和 `git diff --check` 通过。

禁止范围：
- 不用单页截图替代旅程，不顺带实现 Stage 2-1，不在缺口存在时关闭本线。

状态更新：
- 功能线关闭证据、覆盖台账、任务/历史、`M-052`、`VS-054`；关闭后才恢复 `LINE-STAGE-2-1`。

推荐后续任务：
- 条线关闭后激活 `TASK-SETTINGS-053`。

### TASK-SETTINGS-053

任务类型：

- `TASK-SETTINGS`

功能条线：

- `LINE-STAGE-2-1`（Planned；等待 `LINE-FORMAL-GAME-LOOP` 关闭）

Goal 包：

- `GOAL-007`（Planned；等待所属功能线激活）

目标机制/切片：

- `M-026`、`M-027`、`M-030`、`M-035`、`M-044`、`VS-049`

输入资料：

- `local-resources/regima/source/restored-swfs/` 中与 Stage 2-1 对应的窄源包、SymbolClass 和 MovieClip。
- 对应局部 AS3、共享关卡/物理/镜头/刷怪/结果调用链，以及 `docs/workflow/reverse-engineering-protocol.md`。
- `docs/reverse-engineering/levels-index.md`、`mechanics-index.md` 和本线覆盖台账。

输出产物：

- 按六段证据链记录局部配置、共享消费者、SWF 几何/坐标、行为合同、现代映射和双重验证计划。
- 定位真场景资源族并新增/更新资源标注；区分确认事实、推断、未知和现代设计选择。
- 清零影响首切片的未知项后，生成一个同线最小可玩实现 task；若证据缺失则明确阻塞，不补成原版事实。

完成定义：

- Stage 2-1 的场景符号、地图标记、波次/怪物、专属机制、进入/失败/胜利/解锁边界均有可追溯证据或明确未知。
- 视觉/空间结论包含矩阵、注册点、边界和坐标语义；行为结论追踪到共享运行时消费者。
- 覆盖台账和 `VS-049` 可据此生成不扩张范围的可玩切片任务。

验收标准：

- `npm run check:workflow`、`npm run check:annotations` 与 `git diff --check` 通过。
- 六段证据矩阵满足逆向协议；影响实现的推断/未知未清零时不得标记闭合。

禁止范围：

- `LINE-FORMAL-GAME-LOOP` 未关闭前不得执行本 task。
- 不修改或重新生成恢复源包与 `local-resources/regima/legacy-extraction/` 原始提取结果。
- 不提前修改 `src/`，不从 Stage 1 外推 Stage 2-1 的布局、波次、boss、视觉或流程。

状态更新：

- `docs/tasks/feature-lines.md`、`docs/tasks/feature-line-coverage/LINE-STAGE-2-1.md`、`docs/tasks/task-board.md`、`docs/tasks/task-history.md`（完成时）。

推荐后续任务：

- 等待 `LINE-FORMAL-GAME-LOOP` 关闭后恢复；完成证据矩阵时依据结果生成同线实现 task。

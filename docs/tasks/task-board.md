# 游戏任务看板

本文只记录未完成的游戏复现 task。完整系统范围和激活状态以 `docs/tasks/feature-lines.md` 为准；task 是功能条线内部执行单位，完成 task 不等于完成功能条线。

## 当前推荐

`TASK-SLICE-135` 是唯一当前推荐，属于唯一 `Active` 功能线 `LINE-FORMAL-GAME-LOOP`。V4 已完整保存双方成长、技能、库存/装备和宠物；当前接入真背包/格子页与 P1/P2 正式交互。

## 待完成任务

| Task | 状态 | 功能条线 | 类型 | 目标 | 目标机制/切片 | 输出 | 下一步 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| TASK-SLICE-135 | Ready | LINE-FORMAL-GAME-LOOP | 背包/装备 UI | 接入真背包/格子页、P1/P2 分类分页穿脱与保存 | M-016、M-036、M-037、M-052、VS-054 | 正式页面、真资源、owner 命令、存档与浏览器验收 | `TASK-SLICE-136` |
| TASK-SLICE-136 | Planned | LINE-FORMAL-GAME-LOOP | 技能 UI | 接入真技能总页、主动/被动/绑定子页和双玩家保存 | M-016、M-041、M-052、VS-054 | 四页真资源、学习/升级/绑定、HUD 刷新、owner/存档验收 | `TASK-SLICE-137` |
| TASK-SLICE-137 | Planned | LINE-FORMAL-GAME-LOOP | 宠物 UI | 接入真宠物页、完整管理交互、双玩家 runtime 与保存 | M-016、M-042、M-052、VS-054 | 分页/属性/技能/出战/成长页面与 P1/P2 验收 | `TASK-SETTINGS-059` |
| TASK-SETTINGS-059 | Planned | LINE-FORMAL-GAME-LOOP | 装备工坊逆向 | 闭合强化/分解/制作书三子页的完整行为合同 | M-036、M-037、M-052、VS-054 | 六段证据矩阵、资源/交互/实例/返还/保存合同 | 生成同线工坊实现 task |
| TASK-SLICE-138 | Planned | LINE-FORMAL-GAME-LOOP | 装备工坊 UI | 接入强化/分解/制作三页并把现有 Fusion 纳入正式 host | M-036、M-037、M-039、M-052、VS-054 | 四标签正式页面、双 owner 事务、保存与浏览器验收 | `TASK-SLICE-139` |
| TASK-SLICE-139 | Planned | LINE-FORMAL-GAME-LOOP | 法宝 UI | 接入真法宝页、装备门禁、强化/重置和保存 | M-016、M-036、M-043、M-052、VS-054 | 真页面、P1 owner、特殊分支、存档与浏览器验收 | `TASK-SLICE-140` |
| TASK-SLICE-140 | Planned | LINE-FORMAL-GAME-LOOP | 端到端闭环 | 验收完整功能 UI 与正式主循环旅程 | M-005、M-016、M-044、M-050、M-051、M-052、VS-054 | 自动旅程、P1/P2 浏览器验收、覆盖台账与功能线关闭证据 | 关闭本线后恢复 `TASK-SETTINGS-053` |
| TASK-SETTINGS-053 | Planned | LINE-STAGE-2-1 | 关卡逆向 | 正式游戏主循环关闭后，闭合 Stage 2-1 真场景、地图标记、怪物/专属机制和结果流程 | M-026、M-027、M-030、M-035、M-044、VS-049 | 六段证据矩阵、资源标注、覆盖台账与最小可玩切片任务 | 等待 `LINE-FORMAL-GAME-LOOP` 关闭后恢复 |

## 任务完成定义

### TASK-SLICE-135

任务类型：
- `TASK-SLICE`

功能条线：
- `LINE-FORMAL-GAME-LOOP`（Active，Ready）

目标机制/切片：
- `M-016`、`M-036`、`M-037`、`M-052`、`VS-054`

输入资料：
- `full-function-ui-index.md` FUI-02/03、`equipment-index.md`、304/246 真资源、共享 host 与 V4 存档。

输出产物：
- 940×590 真背包/装备页、四分类/分页/格子、属性/槽位、P1/P2 穿脱与安全物品反馈。

完成定义：
- 地图和三关可达；owner、分类、分页、穿脱、关闭与重载一致；不支持的完整物品效果明确反馈。

验收标准：
- 背包/装备/owner/保存专项、系统/build、P1/P2 浏览器验收和 `git diff --check` 通过。

禁止范围：
- 不实现工坊剩余三页，不补造完整 1.1 物品表，不推进其他页面。

状态更新：
- 功能线/覆盖台账、任务/历史、资源标注、`M-036/M-037/M-052`、`VS-054`。

推荐后续任务：
- `TASK-SLICE-136`。

### TASK-SLICE-136

任务类型：
- `TASK-SLICE`

功能条线：
- `LINE-FORMAL-GAME-LOOP`（Active，Planned）

目标机制/切片：
- `M-016`、`M-041`、`M-052`、`VS-054`

输入资料：
- `full-function-ui-index.md` FUI-04..07、`skills-input-index.md`、250/868/417/213 真资源、共享 host/V4。

输出产物：
- 真技能总页、主动/被动/绑定子页；学习/升级/五槽绑定、P1/P2 owner、HUD 刷新与保存。

完成定义：
- 两玩家可从正式入口独立操作并重载；五槽顺序和灵魂/等级门禁保持既有权威规则。

验收标准：
- 技能 UI/owner/保存专项、系统/build、P1/P2 浏览器验收和 `git diff --check`。

禁止范围：
- 不改变战斗技能数值，不新增统一 CD，不推进宠物/法宝页面。

状态更新：
- 功能线/覆盖台账、任务/历史、资源标注、`M-041/M-052`、`VS-054`。

推荐后续任务：
- `TASK-SLICE-137`。

### TASK-SLICE-137

任务类型：
- `TASK-SLICE`

功能条线：
- `LINE-FORMAL-GAME-LOOP`（Active，Planned）

目标机制/切片：
- `M-016`、`M-042`、`M-052`、`VS-054`

输入资料：
- `full-function-ui-index.md` FUI-08、`pets-index.md`、932 真资源、共享 host/V4。

输出产物：
- 真宠物页、5×2 分页、完整属性/8 技能、出战/休息/放生/成长操作与双 owner runtime/save。

完成定义：
- P1/P2 可各管理并同时出战一只宠物，页面操作只影响 owner，关闭/关卡/重载后状态一致。

验收标准：
- 宠物 UI/owner/保存/runtime 专项、系统/build、P1/P2 浏览器验收和 `git diff --check`。

禁止范围：
- 不补真实宠物战斗素材，不实现网络/活动宠物入口。

状态更新：
- 功能线/覆盖台账、任务/历史、资源标注、`M-042/M-052`、`VS-054`。

推荐后续任务：
- `TASK-SETTINGS-059`。

### TASK-SETTINGS-059

任务类型：
- `TASK-SETTINGS`

功能条线：
- `LINE-FORMAL-GAME-LOOP`（Active，Planned）

目标机制/切片：
- `M-036`、`M-037`、`M-052`、`VS-054`

输入资料：
- `full-function-ui-index.md` FUI-10..14、`Strength/Resolution/Making/StrengthEquipment.as`、恢复 `backpack1.swf` 119/198/177/152。

输出产物：
- 强化/分解/制作书的六段证据矩阵：材料/概率、实例字段、失败/返还、owner、保存、几何与双重验证。

完成定义：
- 影响实现的推断/未知清零；若证据不足则明确阻塞，不把资源定位冒充行为闭合。

验收标准：
- `check:workflow`、`check:annotations`、`git diff --check`；矩阵满足逆向协议。

禁止范围：
- 不修改 `src/`，不重复已关闭的 112 配方，不推进 Stage 2-1。

状态更新：
- 功能线/覆盖台账、任务/历史、相关逆向/标注文档与 `M-052/VS-054`。

推荐后续任务：
- 依据证据生成/确认同线 `TASK-SLICE-138`。

### TASK-SLICE-138

任务类型：
- `TASK-SLICE`

功能条线：
- `LINE-FORMAL-GAME-LOOP`（Active，Planned）

目标机制/切片：
- `M-036`、`M-037`、`M-039`、`M-052`、`VS-054`

输入资料：
- `TASK-SETTINGS-059` 行为合同、FUI-10..14 真资源、既有完整 Fusion 实现、共享 host/V4。

输出产物：
- 正式工坊四标签、强化/分解/制作事务、Fusion 迁入 host、P1/P2 owner/save。

完成定义：
- 四标签从正式地图入口可达，事务关闭返还与重载一致；不重复或回归 112 配方。

验收标准：
- 工坊事务/owner/保存专项、crafting 全覆盖、系统/build、浏览器和 `git diff --check`。

禁止范围：
- 不扩展未经证据闭合的材料规则，不推进法宝/Stage 2-1。

状态更新：
- 功能线/覆盖台账、任务/历史、资源标注、`M-036/M-037/M-039/M-052`、`VS-054`。

推荐后续任务：
- `TASK-SLICE-139`。

### TASK-SLICE-139

任务类型：
- `TASK-SLICE`

功能条线：
- `LINE-FORMAL-GAME-LOOP`（Active，Planned）

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

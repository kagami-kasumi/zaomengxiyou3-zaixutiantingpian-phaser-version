# 游戏任务看板

本文只记录未完成的游戏复现 task。完整系统范围和激活状态以 `docs/tasks/feature-lines.md` 为准；task 是功能条线内部执行单位，完成 task 不等于完成功能条线。

## 当前推荐

`TASK-SLICE-131` 是唯一当前推荐，属于唯一 `Active` 功能线 `LINE-FORMAL-GAME-LOOP`。正式战斗 HUD 的字段、940×590 布局、P1/P2 镜像/键位映射、恢复资源和 Boss 状态合同已由前一逆向任务闭合，当前进入 Stage 1 三关共享 HUD 实现。

## 待完成任务

| Task | 状态 | 功能条线 | 类型 | 目标 | 目标机制/切片 | 输出 | 下一步 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| TASK-SLICE-131 | Ready | LINE-FORMAL-GAME-LOOP | 可玩切片 | 在正式 Stage 1 关卡接入 P1/P2 核心战斗 HUD | M-015、M-016、M-040、M-049、VS-051 | HP/MP/经验/等级/技能/重要敌人状态 HUD 与验证 | `TASK-SETTINGS-056` |
| TASK-SETTINGS-056 | Planned | LINE-FORMAL-GAME-LOOP | 主流程逆向 | 闭合 EXE 启动、存档槽新建/读取/删除、迁移和损坏反馈 | M-005、M-044、M-050、VS-052 | 六段证据矩阵、存档槽状态机、真资源标注与路由合同 | `TASK-SLICE-132` |
| TASK-SLICE-132 | Planned | LINE-FORMAL-GAME-LOOP | 可玩切片 | 实现正式启动页与多存档槽并接入现有 V3 进度 | M-005、M-044、M-050、VS-052 | 启动/存档场景、迁移/损坏保护、自动与运行时验证 | `TASK-SETTINGS-057` |
| TASK-SETTINGS-057 | Planned | LINE-FORMAL-GAME-LOOP | 主流程/视觉逆向 | 闭合天庭地图节点、解锁视觉、点击交互和关卡往返流程 | M-005、M-027、M-044、M-051、VS-053 | 六段证据矩阵、地图资源/坐标标注、节点与路由合同 | `TASK-SLICE-133` |
| TASK-SLICE-133 | Planned | LINE-FORMAL-GAME-LOOP | 可玩切片 | 实现天庭地图到 Stage 1 三关的正式选关、结算返回与持久化 | M-005、M-027、M-044、M-051、VS-053 | 地图场景、锁定/解锁/通关状态、路由和端到端验证 | `TASK-SETTINGS-058` |
| TASK-SETTINGS-058 | Planned | LINE-FORMAL-GAME-LOOP | UI 覆盖盘点 | 盘点背包、装备、宠物、心法/技能和法宝完整 UI，生成同线连续小任务 | M-016、M-036、M-037、M-041、M-042、M-043、M-052、VS-054 | 页面全集、资源/交互/双玩家/存档覆盖矩阵与后续 task 拆分 | 依据矩阵生成同线下一 task |
| TASK-SETTINGS-053 | Planned | LINE-STAGE-2-1 | 关卡逆向 | 正式游戏主循环关闭后，闭合 Stage 2-1 真场景、地图标记、怪物/专属机制和结果流程 | M-026、M-027、M-030、M-035、M-044、VS-049 | 六段证据矩阵、资源标注、覆盖台账与最小可玩切片任务 | 等待 `LINE-FORMAL-GAME-LOOP` 关闭后恢复 |

## 任务完成定义

### TASK-SLICE-131

任务类型：

- `TASK-SLICE`

功能条线：

- `LINE-FORMAL-GAME-LOOP`（Active，Ready）

目标机制/切片：

- `M-015`、`M-016`、`M-040`、`M-049`、`VS-051`

输入资料：

- `TASK-SETTINGS-055` 的证据矩阵、资源标注与 HUD 数据合同；Stage 1 正式 scene/bridge 边界。

输出产物：

- 正式 P1/P2 战斗 HUD、共享数据适配层、资源接入和专项测试。

完成定义：

- Stage 1 三关中 HP/MP/经验/等级、技能状态与重要敌人状态实时可读；P1/P2 不串号，场景切换后无残留。

验收标准：

- `check:structure` 前置；专项测试、`test:systems`、`build`、`check:workflow`、运行时视觉验收和 `git diff --check` 通过。

禁止范围：

- 不扩成完整背包/宠物/心法页面，不实现启动存档或地图。

状态更新：

- 功能线台账、覆盖台账、任务看板/历史、`vertical-slices.md` 和 `mechanics-index.md`。

推荐后续任务：

- `TASK-SETTINGS-056`。

### TASK-SETTINGS-056

任务类型：

- `TASK-SETTINGS`

功能条线：

- `LINE-FORMAL-GAME-LOOP`（Planned）

目标机制/切片：

- `M-005`、`M-044`、`M-050`、`VS-052`

输入资料：

- `SaveInter.as`、`User.getSaveObj()`、`MemoryClass.setStorage()` 及共享启动/读档/删档调用链；恢复源包中的启动与存档 UI；现代 `SaveSystem` V3。

输出产物：

- 启动、空槽/有效槽/损坏槽、新建/读取/删除、版本迁移和后续地图路由的六段证据矩阵与状态机。

完成定义：

- EXE 启动后的页面顺序、存档槽字段/交互、异常边界和现代持久化映射均闭合或明确未知。

验收标准：

- 逆向协议、资源标注、`check:workflow`、`check:annotations` 与 `git diff --check` 通过。

禁止范围：

- 不在逆向阶段修改 `src/`；不把浏览器 localStorage 细节冒充原版存储事实。

状态更新：

- 功能线台账、覆盖台账、任务看板/历史、主流程/存档逆向文档和 `mechanics-index.md`。

推荐后续任务：

- `TASK-SLICE-132`。

### TASK-SLICE-132

任务类型：

- `TASK-SLICE`

功能条线：

- `LINE-FORMAL-GAME-LOOP`（Planned）

目标机制/切片：

- `M-005`、`M-044`、`M-050`、`VS-052`

输入资料：

- `TASK-SETTINGS-056` 证据矩阵；`SaveSystem` V3、现有入口/结果路由和真 UI 资源。

输出产物：

- 正式启动/存档场景、多槽持久化、删除确认、迁移/损坏反馈与测试。

完成定义：

- 新建、读取、删除和重新启动恢复可用；选择的槽位隔离，旧版本可迁移，损坏数据不会导致黑屏或误覆盖。

验收标准：

- `check:structure` 前置；存档专项测试、`test:systems`、`build`、`check:workflow`、运行时验收和 `git diff --check` 通过。

禁止范围：

- 不实现云存档、网络账户、Steam 集成或 Stage 2-1。

状态更新：

- 功能线台账、覆盖台账、任务看板/历史、`vertical-slices.md` 和 `mechanics-index.md`。

推荐后续任务：

- `TASK-SETTINGS-057`。

### TASK-SETTINGS-057

任务类型：

- `TASK-SETTINGS`

功能条线：

- `LINE-FORMAL-GAME-LOOP`（Planned）

目标机制/切片：

- `M-005`、`M-027`、`M-044`、`M-051`、`VS-053`

输入资料：

- 原版天庭地图/关卡选择相关 AS3、共享主流程与存档消费者；恢复源包中的地图、节点和状态资源；现代 Stage 1 路由与 V3 解锁数据。

输出产物：

- 地图组合层级、节点坐标/注册点/命中区、锁定/解锁/通关视觉、点击进入和结算/退出返回的六段证据矩阵。

完成定义：

- Stage 1 三节点的视觉、交互、解锁读取/写入和往返状态机足以无猜测进入实现；Stage 2-1 节点只按已证实边界呈现。

验收标准：

- 逆向协议、资源标注、`check:workflow`、`check:annotations` 和 `git diff --check` 通过。

禁止范围：

- 不修改 `src/`；不从关卡内 `M-027` 外推天庭地图坐标，不提前复现 Stage 2-1 内容。

状态更新：

- 功能线台账、覆盖台账、任务看板/历史、主流程/地图逆向文档和 `mechanics-index.md`。

推荐后续任务：

- `TASK-SLICE-133`。

### TASK-SLICE-133

任务类型：

- `TASK-SLICE`

功能条线：

- `LINE-FORMAL-GAME-LOOP`（Planned）

目标机制/切片：

- `M-005`、`M-027`、`M-044`、`M-051`、`VS-053`

输入资料：

- `TASK-SETTINGS-057` 证据矩阵、真地图资源、存档槽选择和 Stage 1 入口/结果路由。

输出产物：

- 天庭地图场景、节点状态/点击交互、Stage 1 三关往返、进度持久化与端到端测试。

完成定义：

- 读取存档后地图正确显示 1-1/1-2/1-3 状态；锁定节点不可进入，已解锁节点可点击进入，胜利/失败/退出返回后状态一致。

验收标准：

- `check:structure` 前置；地图/路由专项测试、`test:systems`、`build`、`check:workflow`、运行时视觉验收和 `git diff --check` 通过。

禁止范围：

- 不制作 Stage 2-1 内容，不把炼丹炉菜单等价为天庭关卡地图，不扩展完整功能 UI。

状态更新：

- 功能线台账、覆盖台账、任务看板/历史、`vertical-slices.md` 和 `mechanics-index.md`。

推荐后续任务：

- `TASK-SETTINGS-058`。

### TASK-SETTINGS-058

任务类型：

- `TASK-SETTINGS`

功能条线：

- `LINE-FORMAL-GAME-LOOP`（Planned）

目标机制/切片：

- `M-016`、`M-036`、`M-037`、`M-041`、`M-042`、`M-043`、`M-052`、`VS-054`

输入资料：

- 背包、装备、宠物、心法/技能和法宝相关逆向索引、AS3 与恢复源包；现有最小 UI/system 实现和存档边界。

输出产物：

- 页面全集与逐页覆盖矩阵：入口/退出、字段/交互、真资源、双玩家所有权、运行时状态、存档字段、已有实现和缺口。
- 按页面或共享基础拆成同线小 task；每个实现 task 有独立完成定义，禁止生成一个“完成全部 UI”的巨型 task。

完成定义：

- 用户点名的背包、宠物等系统均进入权威覆盖矩阵；最小切片与完整页面承诺被明确区分。
- 影响首批实现的证据缺口已清零或生成同线逆向子任务，后续顺序由正式导航依赖而非文件方便程度决定。

验收标准：

- 六段证据矩阵和资源标注满足协议；`check:workflow`、`check:annotations` 与 `git diff --check` 通过。

禁止范围：

- 本 task 不修改 `src/`、不一次性实现所有页面、不把占位测试面板标记为完整 UI、不推进 Stage 2-1。

状态更新：

- 功能线台账、覆盖台账、任务看板/历史、相关 UI 逆向文档、`mechanics-index.md` 和 `vertical-slices.md`。

推荐后续任务：

- 依据覆盖矩阵生成 `LINE-FORMAL-GAME-LOOP` 同线下一 task。

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

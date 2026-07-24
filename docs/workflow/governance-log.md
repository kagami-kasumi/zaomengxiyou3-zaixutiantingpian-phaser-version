# 工作流治理日志

本文记录 AI 工作流、任务体系和文档脚手架的维护历史。它不是游戏任务看板。

## 2026-07-24

### 回写 GOAL-022 问题治理效果样本

变更内容：

- `TASK-SLICE-150B` 收尾按问题治理协议扫描未关闭/观察中问题，并向 PG-002/003/004/005/006/008 回写单线状态、共享移动/怪物 owner、六段证据消费、反馈执行与 0 compact 样本。
- 本次只追加效果反馈，不改变治理问题状态、方案、关闭标准或工作流规则。

影响范围：

- `docs/workflow/problems/PG-002-功能条线提前关闭.md`
- `docs/workflow/problems/PG-003-关卡角色移动接入边界不统一.md`
- `docs/workflow/problems/PG-004-问题治理缺少效果反馈闭环.md`
- `docs/workflow/problems/PG-005-逆向证据链不完整却宣布闭合.md`
- `docs/workflow/problems/PG-006-怪物物理与死亡奖励按关卡漂移.md`
- `docs/workflow/problems/PG-008-Goal包缺少可执行规模门禁.md`
- `docs/workflow/governance-log.md`

验证：

- `npm run check:workflow` 通过；唯一 Active Goal 为 `GOAL-023`，唯一推荐 task 为 `TASK-SLICE-150C`。
- 仅保留既有 `PlayerSlot` 禁止别名 warning。

## 2026-07-23

### 将 Goal 看板收敛为仅保存未完成项

变更内容：

- `goal-board.md` 移除 `GOAL-001..020` 的 `Done` 行和“最近完成 Goal”摘要；完成事实继续由绑定 task 的 `task-history.md` 承担。
- Goal 总览移除冗余的“下一 Goal”列，只保留 `Active`、`Planned`、`Blocked` 未完成状态；当前未完成 `GOAL-021..024` 保持原调度状态。
- Goal 完成流程改为从看板直接移除；功能线未关闭时再激活或生成同线后续 Goal，并停止当次 `/goal`。
- 校验器拒绝 `Done` Goal 留在执行看板，并继续强制所有未完成 Goal 使用预计 0 次 compact 的规模预算。
- PG-008 增加本次适用反馈，确认历史旧预算不再稀释当前 Goal 规模门禁信号。

影响范围：

- `AGENTS.md`
- `TASK_OUTLINE.md`
- `docs/tasks/goal-board.md`
- `docs/workflow/README.md`
- `docs/workflow/document-map.md`
- `docs/workflow/agent-protocol.md`
- `docs/workflow/task-generation.md`
- `docs/workflow/code-quality-gates.md`
- `docs/workflow/problems/PG-008-Goal包缺少可执行规模门禁.md`
- `docs/workflow/governance-log.md`
- `tools/validate-workflow.mjs`

验证：

- `node --check tools/validate-workflow.mjs` 通过。
- `npm run check:workflow` 通过：5 个未完成 task / 5 个定义、4 个未完成 Goal、唯一 Active `GOAL-021`。
- 仅保留既有 `PlayerSlot` 禁止别名 warning。

### 建立 Goal 规模预算门禁并拆分 Stage 2-2 实现包

变更内容：

- 将用户指出的“Goal 形式单 task、实际包含过多工作包”登记为 `PG-008`；结论不是纯偶发，而是旧规则只限制 task 数和最多一次 compact、未限制 task 内部规模造成的可复发现象。
- 新 Goal 改为预计 0 次上下文压缩；未完成 task 必须声明主工作包、预计 compact、独立验收批次和可执行拆分触发，工作包与验收批次均最多 2。
- 第一次 compact 被定义为规模超限信号：只能收束当前检查、安全交接并拆分剩余范围，不再读取新资料族、派生资源或新增实现。
- 校验器新增规模预算正/负样例，并拒绝新非 Done Goal 继续使用历史“最多 1 次”预算。
- 原 `TASK-SLICE-150` 在实现前拆为 `150A..150D`，由 `GOAL-021..024` 依次关闭场景/机关、普通波次、Boss/结果和全程运行校准；功能线保持唯一 Active。

影响范围：

- `AGENTS.md`
- `CLAUDE.md`
- `.claude/agents/workflow-steward.md`
- `docs/workflow/README.md`
- `docs/workflow/document-map.md`
- `docs/workflow/agent-protocol.md`
- `docs/workflow/task-generation.md`
- `docs/workflow/code-quality-gates.md`
- `docs/workflow/review-protocol.md`
- `docs/workflow/problem-governance.md`
- `docs/workflow/problems/PG-002-功能条线提前关闭.md`
- `docs/workflow/problems/PG-004-问题治理缺少效果反馈闭环.md`
- `docs/workflow/problems/PG-008-Goal包缺少可执行规模门禁.md`
- `docs/tasks/goal-board.md`
- `docs/tasks/task-board.md`
- `docs/tasks/feature-lines.md`
- `docs/tasks/feature-line-coverage/LINE-STAGE-2-2.md`
- `docs/tasks/vertical-slices.md`
- `docs/tasks/task-history.md`
- `tools/validate-workflow.mjs`

验证：

- `node --check tools/validate-workflow.mjs` 通过。
- `npm run check:workflow` 通过：5 个未完成 task / 5 个定义、24 个 Goal、唯一推荐 `TASK-SLICE-150A`、唯一 Active `GOAL-021`。
- 规模预算正样例通过；缺少字段、主工作包超限、预计 compact 非 0、独立验收批次超限四类负向样例均被拒绝。
- 仅保留既有 `PlayerSlot` 禁止别名 warning。

### 固化内置浏览器视觉验收入口

变更内容：

- 将 Vite 生产预览固定为 `0.0.0.0:4174` 并启用 `strictPort`，避免隔离的内置浏览器无法访问 loopback-only 监听，也避免端口被占用时静默漂移。
- 保留 `npm run dev` 的 loopback-only 默认值；自动视觉验收统一使用构建后的 `npm run preview`，不扩大开发服务器暴露面。
- 将用户对该项目级监听的长期授权写入 Agent、Claude 和质量门禁入口；预览服务允许跨验收保持运行，只有端口冲突、用户要求或确有必要时才停止。
- 在 README 明示局域网可访问构建产物的边界。

影响范围：

- `vite.config.ts`
- `package.json`
- `AGENTS.md`
- `CLAUDE.md`
- `README.md`
- `docs/workflow/README.md`
- `docs/workflow/agent-protocol.md`
- `docs/workflow/code-quality-gates.md`
- `docs/workflow/governance-log.md`

验证：

- `npm run check:workflow` 通过，仅保留既有 `PlayerSlot` 禁止别名 warning。
- `npm run build` 通过，仅保留既有大 chunk warning。
- 主机侧确认 `0.0.0.0:4174` 正在监听且 HTTP 返回 `200`；内置浏览器成功打开 `http://127.0.0.1:4174/`，识别到标题“再续天庭 现代化”和单个 Phaser canvas，console 无 warning/error。
- 预览服务按用户授权保持运行。

### 落地 UI 显示列表与原版视觉基准治理门禁

变更内容：

- 将既有 `PG-007 UI 原生化缺少统一门禁` 从“已确认，待治理”推进为“规则已落地，运行观察中”，不重复创建新问题编号。
- 复核工坊后撤销“无矩形/通用按钮即可视为原生化参考样本”的错误结论；明确扁平真背景、透明命中、业务测试和零 console error 都不能证明视觉复原。
- `reverse-engineering-protocol.md` 新增 UI 显示列表分支，强制 root/child/depth、嵌套矩阵、mask/filter、TextField、按钮状态、动态 child、原版视觉基准和逐状态差异证据。
- `task-generation.md` 新增固定 `UI 原生化合同` 字段；现有技能证据/实现 task 已补齐显示列表、原版基准、现代例外、逐状态验收和差异证据。
- `code-quality-gates.md`、`review-protocol.md`、`AGENTS.md`、工作流入口和三个专业 agent 同步接入门禁。
- `validate-workflow.mjs` 自动发现未完成 UI task，拒绝缺少任一合同字段的定义；内置六个 UI 合同负向样例，并扩展逆向协议负向样例。

影响范围：

- `AGENTS.md`
- `.claude/agents/reverse-engineering-researcher.md`
- `.claude/agents/modern-implementation-engineer.md`
- `.claude/agents/engineering-reviewer.md`
- `docs/workflow/reverse-engineering-protocol.md`
- `docs/workflow/task-generation.md`
- `docs/workflow/code-quality-gates.md`
- `docs/workflow/review-protocol.md`
- `docs/workflow/README.md`
- `docs/workflow/document-map.md`
- `docs/workflow/problem-governance.md`
- `docs/workflow/problems/PG-004-问题治理缺少效果反馈闭环.md`
- `docs/workflow/problems/PG-005-逆向证据链不完整却宣布闭合.md`
- `docs/workflow/problems/PG-007-UI原生化缺少统一门禁.md`
- `docs/tasks/task-board.md`
- `tools/validate-workflow.mjs`

验证：

- `npm run check:workflow` 通过；3 个未完成 task / 3 个定义、12 个 Goal、唯一 Active `GOAL-009` 保持一致。
- UI 合同六个必填字段的正样例通过，逐字段删除的六个负向样例均被拒绝。
- 逆向协议原有三类退化样例及新增 UI 门禁/原版视觉基准退化样例均被拒绝。
- 仅保留既有 `PlayerSlot` 禁止别名 warning。

### 登记技能页面 UI 原生化计划功能线

变更内容：

- 根据用户要求新增 Planned `LINE-UI-NATIVE-SKILLS`，覆盖技能总页 250、主动页 868、绑定页 417 和被动页 213。
- 新增 `TASK-SETTINGS-061` / `GOAL-011` 先闭合原生文字、按钮状态、命中区和动态槽位证据；新增 `TASK-SLICE-143` / `GOAL-012` 再执行四页原生化实现。
- 保留现有技能业务、P1/P2 owner、HUD 同步和 V4 存档，不把 UI 重做扩张成技能系统重写。
- 当前 `LINE-STAGE-2-1` / `GOAL-009` 继续唯一 Active；技能线保持 Planned，等待用户单独批准调度。
- 回写 PG-002/004/005/007 适用性样本，并将 `M-052` 降为部分复现、增加 `VS-055` 追踪新的视觉合同。

影响范围：

- `docs/tasks/feature-lines.md`、`goal-board.md`、`task-board.md`、`vertical-slices.md`
- `docs/tasks/feature-line-coverage/LINE-UI-NATIVE-SKILLS.md`
- `docs/reverse-engineering/full-function-ui-index.md`、`mechanics-index.md`
- `docs/workflow/problems/PG-002-功能条线提前关闭.md`
- `docs/workflow/problems/PG-004-问题治理缺少效果反馈闭环.md`
- `docs/workflow/problems/PG-005-逆向证据链不完整却宣布闭合.md`
- `docs/workflow/problems/PG-007-UI原生化缺少统一门禁.md`
- `docs/workflow/governance-log.md`

验证：

- `npm run check:workflow` 与 `git diff --check` 在本条记录落盘后运行。

### 登记 UI 原生化系统性问题

变更内容：

- 新增 `PG-007 UI 原生化缺少统一门禁`，把“原图中的文字/按钮直接承担视觉与交互，不在其上重造外层 UI”确立为统一问题定义。
- 区分已完成页面的存量迁移和未实现页面的增量防复发，技能页作为下一候选整改样本，炼丹炉作为首个已验证参考。
- 记录任务生成、逆向证据、代码质量、评审和工作流校验的拟治理落点；本次只登记问题，不修改游戏代码或当前 Stage 2-1 调度。
- 明确 skill 不能代替仓库内门禁，待至少三个稳定样本后再评估跨项目抽取。
- 回写 PG-002/004/005 适用性样本，记录既有真 UI 关闭合同不足、治理反馈执行和视觉证据门禁。

影响范围：

- `docs/workflow/problem-governance.md`
- `docs/workflow/problems/PG-002-功能条线提前关闭.md`
- `docs/workflow/problems/PG-004-问题治理缺少效果反馈闭环.md`
- `docs/workflow/problems/PG-005-逆向证据链不完整却宣布闭合.md`
- `docs/workflow/problems/PG-007-UI原生化缺少统一门禁.md`
- `docs/workflow/governance-log.md`

验证：

- `npm run check:workflow` 与 `git diff --check` 在本条记录落盘后运行。

### 根据用户验收重排炼丹炉原生按钮整改 Goal

变更内容：

- 将炼丹炉现代顶层导航与暗色覆盖层从“完整功能 UI 已覆盖”退回待整改，保留 `LINE-FORMAL-GAME-LOOP` 为唯一 Active。
- 新增 `TASK-SETTINGS-060` / `GOAL-006`，先按六段证据链闭合左下侧“强化 / 合成 / 打造 / 分解”原生按钮的时间轴、几何、命中区、帧状态和切页调用链。
- 新增 `TASK-SLICE-141` / `GOAL-007`，要求移除现代替代导航、直接复用原生位置和原生按钮；原端到端 `TASK-SLICE-140` 后移至 `GOAL-008`，Stage 2-1 后移至 `GOAL-009`。
- 回写 PG-002/004/005：记录用户反馈触发覆盖退回、问题治理扫描和逆向证据门禁。

影响范围：

- `docs/tasks/feature-lines.md`、`goal-board.md`、`task-board.md`、`vertical-slices.md`
- `docs/tasks/feature-line-coverage/LINE-FORMAL-GAME-LOOP.md`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/workflow/problems/PG-002-功能条线提前关闭.md`、`PG-004-问题治理缺少效果反馈闭环.md`、`PG-005-逆向证据链不完整却宣布闭合.md`
- `docs/workflow/governance-log.md`

验证：

- `npm run check:workflow` 与 `git diff --check` 在本条记录落盘后重跑。

## 2026-07-22

### 新增 Goal 包层并限制单次 `/goal` 上下文预算

变更内容：

- 在功能线与 task 之间新增 `docs/tasks/goal-board.md`：功能线继续负责完整系统范围和单线 WIP，Goal 包专门负责一次 `/goal` 的停止与交接边界。
- 规定 Goal 默认只绑定一个 task，只有共用同一产物/验证批次时才可书面说明后绑定最多两个；每个 Goal 最多承受一次 compact。
- Goal 完成后激活同线下一 Goal，但必须停止当次 `/goal` 并交接；第一次 compact 后禁止扩展范围，估计需要第二次时必须回写安全检查点并拆分。
- 将跨工坊容器、Fusion、强化、分解、制作书和 V4 迁移的 `TASK-SLICE-138` 标为 `Split`，拆成 `138A..138D`，并分别由 `GOAL-001..004` 承载。
- 当前唯一可执行单元改为 `GOAL-001` / `TASK-SLICE-138A`；后续工坊子页、法宝、端到端闭环和 Stage 2-1 逆向各自占用独立 Goal。
- 更新 Agent/Claude/总任务书、详细执行协议、任务生成规范、README、文档地图、功能线与覆盖/机制/切片/逆向索引。
- 扩展 `tools/validate-workflow.mjs`，自动拒绝多 Active Goal、跨功能线 Goal、Active Goal 外可执行 task、task/Goal 映射不一致、超过两个 task 或未声明最多一次 compact 的 Goal。

影响范围：

- `AGENTS.md`、`CLAUDE.md`、`TASK_OUTLINE.md`
- `docs/tasks/goal-board.md`、`feature-lines.md`、`task-board.md`、`vertical-slices.md`、`feature-line-coverage/LINE-FORMAL-GAME-LOOP.md`
- `docs/workflow/README.md`、`document-map.md`、`agent-protocol.md`、`task-generation.md`、`governance-log.md`
- `docs/reverse-engineering/equipment-workshop-index.md`、`full-function-ui-index.md`、`mechanics-index.md`
- `docs/workflow/problems/PG-002-功能条线提前关闭.md`、`PG-004-问题治理缺少效果反馈闭环.md`
- `tools/validate-workflow.mjs`

验证：

- 已在修改前运行 `npm run check:structure`，仅报告既有 `src/`/测试大文件 warning，本次不修改这些目标。
- `npm run check:workflow` 和 `git diff --check` 在本条记录落盘后运行。

### 归档 Stage 1 战斗校准切片并继续正式游戏循环

变更内容：

- `TASK-SLICE-130` 在三关共享战斗回归、1-2/1-3 代表失败分类及 1-1 三次完整通关后归档，VS-050 与 M-048 同步更新。
- `LINE-FORMAL-GAME-LOOP` 继续保持唯一 Active；仅把同线 `TASK-SETTINGS-055` 提升为唯一 Ready，没有提前关闭功能线或切到 Stage 2-1。
- 回写 PG-002/003/004/005 最终效果样本；现代预警、可达性校正与自动审计 watchdog 均保持证据分级，其中 watchdog 不属于原版或现代游戏波次规则。

影响范围：

- `docs/tasks/feature-lines.md`、本线覆盖台账、`task-board.md`、`task-history.md`、`vertical-slices.md`
- `docs/reverse-engineering/stage1-combat-calibration.md`、`mechanics-index.md`
- `docs/workflow/problems/PG-002-功能条线提前关闭.md` 至 `PG-005-逆向证据链不完整却宣布闭合.md`

验证：

- `npm run test:systems`、`npm run check:structure` 与 `npm run build` 已通过；工作流和 diff 检查在本条记录落盘后重跑。

## 2026-07-21

### 将正式游戏主循环前置到更多关卡复现之前

变更内容：

- 根据用户在 Stage 1 三关后的试玩反馈，把“容易死亡、攻击/UI 不完整、缺少启动存档和天庭地图”确认为继续批量制作关卡前的主流程缺口。
- 新增唯一 Active 功能线 `LINE-FORMAL-GAME-LOOP` 及覆盖台账；依赖顺序固定为战斗证据/校准、核心 HUD、启动存档、天庭地图、完整功能 UI。
- 保留 `LINE-STAGE-2-1` 与 `TASK-SETTINGS-053`，从 Active/Ready 降为 Planned；这是用户明确重定向，不是遇到阻塞后绕过当前线，也没有删除 Stage 2-1 资料。
- 新增 `M-048..052` 与 `VS-050..054`，并生成 `TASK-SETTINGS-054..058`、`TASK-SLICE-130..133`；只有 `TASK-SETTINGS-054` 为当前 Ready，其余同线工作保持 Planned。
- 把“完整 UI”先定义为覆盖盘点和连续小 task，不生成一次性实现全部页面的巨型任务；最小测试面板不得作为整页关闭证据。
- 更新阶段路线，在 Stage 1 三关后加入正式游戏主循环检查点，关闭后才恢复 Stage 2-1 内容扩展。

影响范围：

- `TASK_OUTLINE.md`
- `docs/tasks/feature-lines.md`
- `docs/tasks/feature-line-coverage/LINE-FORMAL-GAME-LOOP.md`
- `docs/tasks/feature-line-coverage/LINE-STAGE-2-1.md`
- `docs/tasks/task-board.md`
- `docs/tasks/vertical-slices.md`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/workflow/problems/PG-002-功能条线提前关闭.md`
- `docs/workflow/problems/PG-004-问题治理缺少效果反馈闭环.md`
- `docs/workflow/problems/PG-005-逆向证据链不完整却宣布闭合.md`
- `docs/workflow/governance-log.md`

验证：

- 已运行 `npm run check:workflow`，通过：10 个未完成 task/10 个完成定义、174 个已完成 task/174 个完成定义、唯一推荐 `TASK-SETTINGS-054` 和 376 条资源标注一致。
- 已运行 `git diff --check`，通过；仅输出仓库既有 CRLF/LF 转换提示，无空白错误。

### 重构玩法逆向为六段证据链

变更内容：

- 新增 `reverse-engineering-protocol.md`，把逆向固定为“局部证据 → 共享运行时调用链 → SWF 几何/坐标语义 → 可观察行为合同 → 现代实现映射 → 双重验证”。
- 统一区分确认事实、交叉确认、推断、未知和现代设计选择；影响实现的推断/未知未清零时，禁止宣称“权威实现输入、已闭合、已复现”。
- 视觉/空间结论必须记录 local/world/screen 坐标、注册点、碰撞盒、嵌套矩阵、推导公式和现代素材原点，防止把 MovieClip 注册坐标直接解释为脚底或中心。
- 逆向产物必须落盘证据矩阵；实现任务在 compact、新对话或人员切换后必须重新窄读矩阵引用，不能只依赖聊天摘要。
- 同步 AGENTS、CLAUDE、执行协议、任务生成、代码质量门禁、README、文档地图和逆向 researcher；`TASK-SETTINGS-*` 只完成文件定位或推断时不得越级解除实现阻塞。
- 新增 `PG-005 逆向证据链不完整却宣布闭合`，以 Stage 1-2 的 K、地面坐标和停点屏幕触发作为治理前历史反例。
- 工作流校验器新增逆向协议结构、入口路由和三类负向样例：缺共享运行时调用链、缺证据矩阵或缺推断分级时必须失败。

影响范围：

- `AGENTS.md`
- `CLAUDE.md`
- `.claude/agents/reverse-engineering-researcher.md`
- `docs/workflow/README.md`
- `docs/workflow/agent-protocol.md`
- `docs/workflow/code-quality-gates.md`
- `docs/workflow/document-map.md`
- `docs/workflow/governance-log.md`
- `docs/workflow/problem-governance.md`
- `docs/workflow/reverse-engineering-protocol.md`
- `docs/workflow/task-generation.md`
- `docs/workflow/problems/PG-005-逆向证据链不完整却宣布闭合.md`
- `tools/validate-workflow.mjs`

验证：

- `npm run check:structure` 通过，仅保留 8 个未修改旧大文件的既有 warning。
- `node --check tools/validate-workflow.mjs` 通过。
- `npm run check:workflow` 通过：动态验证 PG-001—05；缺共享调用链、证据矩阵或推断分级的三个逆向协议负向样例均被拒绝；任务、历史与 372 条资源标注保持一致。

### 为问题治理增加效果反馈闭环

变更内容：

- 新增 `PG-004 问题治理缺少效果反馈闭环`，把“方案存在”与“方案持续有效”拆成两个必须分别举证的状态。
- 所有 `PG-*` 统一增加“适用触发与反馈记录”，同时检查旧有缺口的解决程度和新代码的防复发效果；反馈结论统一为通过、复发、方案不充分或不适用。
- 代码、架构、游戏 task 和工作流变更收尾必须扫描未关闭或效果观察中的问题；命中时回写证据，复发或方案不足时退回治理，已关闭问题必须重开。
- 回审 PG-001—03：PG-001 对本轮关卡代码明确记为不适用；PG-002 因 Stage 1-2 在核心交互错误下曾被关闭，退回“方案补强中”；PG-003 记录本次移动接入遗漏为治理前复发基线。
- 工作流校验器改为动态发现全部 `PG-*.md`，校验问题索引、状态、第 7 节、触发条件和反馈表，并内置缺失第 7 节、触发条件或反馈表的负向样例。

影响范围：

- `AGENTS.md`
- `CLAUDE.md`
- `docs/workflow/README.md`
- `docs/workflow/agent-protocol.md`
- `docs/workflow/code-quality-gates.md`
- `docs/workflow/document-map.md`
- `docs/workflow/problem-governance.md`
- `docs/workflow/problems/PG-001-共享技能规则重复定义.md`
- `docs/workflow/problems/PG-002-功能条线提前关闭.md`
- `docs/workflow/problems/PG-003-关卡角色移动接入边界不统一.md`
- `docs/workflow/problems/PG-004-问题治理缺少效果反馈闭环.md`
- `tools/validate-workflow.mjs`

验证：

- `node --check tools/validate-workflow.mjs` 通过。
- `npm run check:workflow` 通过：动态验证 PG-001—04 及三类反馈契约负向样例；任务、历史和 372 条资源标注保持一致。

### 登记关卡角色移动接入边界问题

变更内容：

- 新增 `PG-003 关卡角色移动接入边界不统一`，记录 Stage 1-2 遗漏 K 跳跃所暴露的系统性接线缺口。
- 明确问题不是 `HeroMovementSystem` 底层算法重复，而是 scene/bridge 分别持有移动模型、上一帧输入、调度和视图同步边界。
- 提出关卡无关的玩家队伍移动运行时 owner，关卡仅提供平台/边界环境，关卡流程只观察位置处理镜头、停点、出怪和通关。
- 固定了现有两个消费者迁移、共享系统回归、运行时验收、窄搜索门禁和两个后续关卡样本等关闭标准。
- 本次只登记问题治理记录，不修改 `src/`、不启动跨关卡重构，也不改变当前唯一 `Active` 功能线。

影响范围：

- `docs/workflow/problem-governance.md`
- `docs/workflow/problems/PG-003-关卡角色移动接入边界不统一.md`
- `docs/workflow/governance-log.md`

验证：

- `npm run check:workflow` 通过：1 个未完成 task、172 个已完成 task、唯一推荐 `TASK-SETTINGS-052` 和 372 条资源标注一致。

### 将 Stage 1-2 专项测试纳入默认代码门禁

变更内容：

- 扩展 `tools/run-system-tests.mjs` 的默认测试清单，把 Stage 1-2 普通流程与 `fbEnter` 两组专项测试纳入 `npm run test:systems`，从而自动进入 `check:code` / `check:all`。
- 保留 `test:stage12-flow` 和 `test:stage12-fb` 作为快速专项入口；没有修改工作流协议、任务状态校验规则或游戏任务定义。

影响范围：

- `tools/run-system-tests.mjs`
- `docs/workflow/governance-log.md`

验证：

- `npm run check:all` 应同时输出 Stage 1-2 resource、flow 与 fbEnter 三组通过结果。
- `npm run check:workflow` 应不再报告当日治理日志缺失。

## 2026-07-18

### 修正评审证据时效并复核 PG-001 方案

变更内容：

- 复核当日工程评审，确认其中 CH1-CH3 和 Role1 `_tmp` 结论沿用了 2026-06-26 的旧证据；当前代码已在 2026-06-29 建立共享 owner，资产 key 也已修正。
- 在 `review-protocol.md` 增加“证据时效与遗留发现复核”：旧评审只作为线索，必须按当前工作树标记“仍存在/已解决/部分解决/证据不足”，并纠正结构 warning 的整改语义。
- 更新 PG-001 测试结果：当前快照无旧重复模式，但 owner 抽取后尚无新的相关代码生成任务，因此 3 个长期样本仍为 0，保持“方案试行中”。
- 重写 `docs/评审/评审-2026-07-18.md` 为整改复核报告，逐项说明实施、保留或不采纳的原因。

影响范围：

- `docs/workflow/review-protocol.md`
- `docs/workflow/problems/PG-001-共享技能规则重复定义.md`
- `docs/评审/评审-2026-07-18.md`

验证：

- `npm run check:workflow` 通过：2 个未完成 task、150 个已完成 task 和 172 条资源标注一致；保留 1 条 `needs-annotation` 和 1 条 `unknown` 的已知状态。
- 本轮不修改 `src/`，因此不重复运行系统测试和构建。

### 评审归档自动化

变更内容：

- 在 `docs/workflow/review-protocol.md` 新增「评审归档约定」章节：用户要求评审时自动按当日日期生成 `docs/评审/评审-YYYY-MM-DD.md`，同一天多次独立评审追加 `-2`/`-3` 后缀。
- 评审流程新增归档步骤，确保评审结论不会只停留在对话中。
- 当日产出 `docs/评审/评审-2026-07-18.md`（全项目工程评审）。

影响范围：

- `docs/workflow/review-protocol.md`
- `docs/评审/评审-2026-07-18.md`

### 落地严格单线功能条线任务系统

变更内容：

- 新增 `docs/tasks/feature-lines.md` 和 `feature-line-coverage/LINE-CRAFTING.md`，把完整玩家系统设为承诺单位，把 task 保留为小而可验收的执行单位。
- 建立严格单线 `WIP=1`：`LINE-CRAFTING` 是唯一 Active，Stage 1-1 保持 Planned；task 完成后必须继续同线下一 task，阻塞时不得切线。
- 重写任务生成规范并更新 Agent、Claude、总任务书、详细协议、README 和文档地图，让正式 task 与 `/goal` 先恢复功能线所有权。
- 新增 `TASK-SETTINGS-047`，先盘点 112 个权威配方的物品定义、库存类别、入口、真图标、UI 和测试覆盖；保留 `TASK-SETTINGS-046` 但禁止在合成线关闭前执行。
- 纠正 `TASK-SLICE-118`、`M-039` 和资源状态中的整线完成外推，保留 `VS-042..044` 的局部完成事实。
- 扩展 `validate-workflow.mjs`，校验功能线字段、唯一 Active、跨线 Ready/Blocked、跨线推荐、当前 task、Done 关闭证据和覆盖台账；增加五类内置负向样例。
- 将 PG-002 更新为“治理规则已落地，运行观察中”；待合成线完整运行和下一条线切换样本完成后再判断关闭。

影响范围：

- `AGENTS.md`、`CLAUDE.md`、`TASK_OUTLINE.md`、`README.md`
- `docs/tasks/feature-lines.md`、`docs/tasks/feature-line-coverage/LINE-CRAFTING.md`
- `docs/tasks/task-board.md`、`docs/tasks/task-history.md`
- `docs/workflow/agent-protocol.md`、`docs/workflow/task-generation.md`
- `docs/workflow/README.md`、`docs/workflow/document-map.md`
- `docs/workflow/problem-governance.md`、`docs/workflow/problems/PG-002-功能条线提前关闭.md`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/reverse-engineering/asset-annotation/project-status.md`
- `tools/validate-workflow.mjs`

验证：

- `npm run check:structure` 通过，仅报告 8 个既有无关 warning。
- `npm run check:workflow` 通过；2 个未完成 task、唯一推荐 `TASK-SETTINGS-047`、150 个已完成 task 和 172 条资源标注均一致。
- `npm run check:all` 通过；系统测试、合成专项测试和生产构建通过，保留既有 8 个结构 warning 与 Vite 大 chunk 提示。

### 拆分问题治理记录并确认 PG-002 的单线方案

变更内容：

- 将 `PG-001`、`PG-002` 从总协议拆到 `docs/workflow/problems/` 下的独立问题文档；总协议只保留治理规则、问题索引和模板。
- 根据用户确认修正 `PG-002` 方案：完整玩家系统是承诺单位，task 是内部执行单位；全项目严格保持单条功能线 `WIP=1`。
- 明确同一功能线的 task 必须连续推进；遇到阻塞时生成并解决同线阻塞任务，不得切换到其他功能线。
- 以炼丹炉为首个治理对象：只有真 UI、权威合成表全覆盖、正式可达流程和验证闭合后才能关闭，任一局部切片完成都不能结束条线。
- 撤回本轮新增的“第二阶段”纪念文档及入口；等未来出现更大规模突破后再重新总结项目阶段。

影响范围：

- `docs/workflow/document-map.md`
- `docs/workflow/governance-log.md`
- `docs/workflow/problem-governance.md`
- `docs/workflow/problems/PG-001-共享技能规则重复定义.md`
- `docs/workflow/problems/PG-002-功能条线提前关闭.md`
- `tools/validate-workflow.mjs`

验证：

- `npm run check:workflow` 通过；新增独立问题文档的结构与索引校验已生效，150 个已完成 task 和 172 条资源标注继续通过。

## 2026-07-16

### 登记纵向切片被越级解释为功能条线完成的问题

变更内容：

- 新增 `PG-002`，将问题定义为现有任务体系缺少功能条线层、覆盖台账和关闭门禁，而不是单句任务状态写错。
- 记录炼丹炉案例证据：112 个唯一配方已注册，但只有土灵珠和枯叶灵两个配方族形成完整真图标/UI 闭环；已完成纵向切片不足以证明“合成所有物质”已经覆盖。
- 提出 `LINE-*` 功能条线台账、条线级 `/goal` 持续推进语义、工作流负向校验和当前炼丹炉覆盖盘点方案。
- 明确治理问题与游戏内容分别关闭：PG-002 负责修任务模型和防复发门禁，`LINE-CRAFTING` 后续负责追踪所有合成物质的实际完成度。
- 本次只登记问题与方案，不修改游戏代码、不生成剩余炼丹炉实现 task，也不撤销已真实完成的 `VS-042..044`。

影响范围：

- `docs/workflow/problem-governance.md`
- `docs/workflow/governance-log.md`

验证：

- `npm run check:workflow` 通过；现有校验报告 1 个未完成 task、1 个定义、当前推荐 `TASK-SETTINGS-046`，资源标注 172 条全部通过。

## 2026-07-15

### 将 RegiMA 恢复语料库迁入项目本地资源根并强制视觉路由

变更内容：

- 将 D 盘根目录的 EVB 原始解包、174 个恢复 SWF、验证图片、清单审计和既有资源任务输出迁入 `local-resources/regima/`，并由 `.gitignore` 排除整个本地资源根。
- 将项目根的旧提取目录整体迁入 `local-resources/regima/legacy-extraction/`，删除旧根入口，并机械更新全部 54 个受版本控制文件中的路径引用。
- 明确行为证据继续读取只读 `local-resources/regima/legacy-extraction/` AS3；视觉资源、SymbolClass、MovieClip 和原始命名 SWF 必须优先检索 `local-resources/regima/source/restored-swfs/`。
- 更新入口、资源标注文档和 `TASK-SETTINGS-044`，禁止仅依据旧数字包宣告视觉资源缺失。
- 扩展工作流校验，防止 RegiMA 视觉路由从入口和任何引用 `crafting-ui-index.md` 的未完成任务中回退，并禁止任何受版本控制文件重新引用已退役的旧根名称；检查按任务语义而非固定任务号生效，归档/换号后仍保留门禁。

影响范围：

- `.gitignore`
- `AGENTS.md`、`CLAUDE.md`、`TASK_OUTLINE.md`、`.claude/agents/reverse-engineering-researcher.md`
- `docs/workflow/`、`docs/reverse-engineering/`、`docs/tasks/task-board.md`
- `tools/validate-workflow.mjs`

验证：

- `npm run check:structure` 通过，仅报告既有无关文件 warning。
- `npm run check:workflow` 通过，包含 RegiMA 路由门禁与资源标注校验。

### 将资源标注工程升级为 EVB 源包到现代接入的分阶段台账

变更内容：

- 把旧的“缺来源登记”模型改为 `source-corpus-ready -> export-ready -> derived-ready -> ready` 获取链，分别对应待定位符号、可选择性导出、派生素材待接入和现代工程可用。
- 为 CSV 新增 `sourcePackage` 字段，并新增 `locate-symbol`、`export-selectively` 去向；只有检索恢复语料库后仍确认缺文件时，才允许 `missing-original + request-source`。
- 将现有 152 条 `missing-original` 机械迁移为 `source-corpus-ready + locate-symbol`，不凭文件名批量猜具体源包；保留 1 条 unknown 和 1 条非视觉资源 rejected。
- 更新八个既有批次与项目状态，明确角色、技能、法宝、宠物、怪物、Stage 1-1 和 UI 的下一步均从现 `local-resources/regima/source/restored-swfs/` 做窄定位与选择性导出。
- UI 批次继续保持 0 个现代图片 key，但登记 `backpack1.swf`、`Common1.swf`、`EIcon*.swf`、`shop.swf` 等已恢复候选包；后续按单个完整界面建 stableKey，不做全量 UI 导出。
- 扩展资源标注校验器，强制新状态与下一步配对，并要求 `export-ready` 必须填写 `sourcePackage`。

影响范围：

- `docs/reverse-engineering/asset-annotation/`
- `docs/workflow/document-map.md`
- `docs/workflow/governance-log.md`
- `tools/validate-asset-annotations.mjs`

验证：

- `npm run check:annotations` 通过。
- `npm run check:workflow` 通过。

### 完成资源标注工程第一批并增加自动校验

变更内容：

- 恢复原审阅稿的完整第一批范围，完成五角色普攻/本体动作、已实现英雄技能、法宝、宠物效果、`Monster30`、Stage 1-1 和现代 UI 审计。
- 交付 154 条标注和 8 份批次记录：152 条缺原素材、1 条待补证据、1 条确认为非视觉资产；当前没有拆分候选或必须立即执行的人工标注。
- 新增 `project-status.md` 汇总覆盖、人工待办和后续边界，新增 `implementation-findings.md` 交接现代 sourceSymbol 与 AS3 不一致等代码侧发现。
- 新增 `npm run check:annotations`，校验 manifest 131 个效果 key、固定范围、CSV 字段/枚举、证据路径、stableKey 唯一性和必需批次。
- 将资源标注校验接入 `npm run check:workflow`。

影响范围：

- `docs/reverse-engineering/asset-annotation/`
- `docs/workflow/README.md`
- `docs/workflow/governance-log.md`
- `tools/validate-asset-annotations.mjs`
- `package.json`

验证：

- 已运行 `npm run check:all`，工作流校验、资源标注校验、结构检查、系统测试和生产构建均通过；结构检查仅报告既有无关文件 warning。

## 2026-07-14

### 将资源标注工程重构为独立目录

变更内容：

- 将单篇 `asset-annotation-and-splitting-plan.md` 重构为 `docs/reverse-engineering/asset-annotation/` 目录；原文件保留为兼容入口。
- 在入口中明确“标注”的最小定义、实际产物，以及人工与 Agent 的责任边界；人工不再被隐含要求为全量数字资源命名。
- 新增单资源族执行流程、CSV 字段/状态/可信度规范、批次模板和 annotations/batches 目录职责。
- 将帧拆分降为标注后的例外决策，明确判定门、人工操作点和最小交付。
- 明确已安装的 FFDec CLI 可由 Agent 在用户授权后从项目外目录调用；人工只负责安装、CLI 无法完成的 GUI 操作和视觉决策。
- 更新文档职责地图，避免把缺口事实、标注执行记录和游戏接入 task 混为一体。

影响范围：

- `docs/reverse-engineering/asset-annotation-and-splitting-plan.md`
- `docs/reverse-engineering/asset-annotation/`
- `docs/workflow/document-map.md`
- `docs/workflow/governance-log.md`

验证：

- 已运行 `npm run check:workflow`，通过。

## 2026-07-04

### 增加资源标注与帧拆分审阅入口

变更内容：

- 新增 `docs/reverse-engineering/asset-annotation-and-splitting-plan.md`，作为后续标注工程和拆分必要性评估的重开对话入口。
- 明确资源工作后续不再围绕同一 EXE 重复抽取，而是转入标注、归类、缺口登记和必要时选择性拆分。
- 明确拆分工程默认不处理几十万帧；只有 Phaser 参数化重建无法达到接近原版视觉，且目标能限定到单个符号或动作族时，才进入选择性拆分。
- 在 `docs/workflow/document-map.md` 登记该文档职责，便于新 agent 冷启动时定位。

影响范围：

- `docs/reverse-engineering/asset-annotation-and-splitting-plan.md`
- `docs/workflow/document-map.md`
- `docs/workflow/governance-log.md`

验证：

- 已运行 `npm run check:workflow`，通过。

### 修正 PG-001 的问题定义和验证方式

变更内容：

- 将 `PG-001` 的问题本体从“数值校准需要跨文件同步”修正为“共享技能规则重复定义”。
- 明确“数值校准容易遗漏”只是重复定义带来的影响，不是问题本体。
- 将解决方案从单次代码抽取调整为 harness 生成约束：共享定义所有权约束。
- 在 `docs/workflow/code-quality-gates.md` 中新增 Shared definition ownership 门禁，要求 AI 生成共享表、公式或 helper 前先搜索 owner，已有 owner 必须复用。
- 将 PG-001 的测试结果改为长期可行性验证：后续至少 3 次相关代码生成任务不新增重复定义，才说明方案初步可行。
- 将 Shared definition ownership 接入 `tools/validate-workflow.mjs`，避免该门禁从脚手架中漂移。

影响范围：

- `docs/workflow/problem-governance.md`
- `docs/workflow/code-quality-gates.md`
- `docs/workflow/governance-log.md`
- `tools/validate-workflow.mjs`

验证：

- 已运行 `npm run check:workflow`，通过。

## 2026-06-29

### 增加问题治理协议

变更内容：

- 新增 `docs/workflow/problem-governance.md`，定义系统性工程问题的适用范围、问题定义、证据、解决方案、测试方案、测试结果和关闭标准。
- 登记首个问题治理记录 `PG-001`：技能系统共享规则重复与 `HeroSkillModel` runtime 耦合。
- 在 `AGENTS.md`、`CLAUDE.md`、`docs/workflow/README.md`、`docs/workflow/document-map.md` 和 `docs/workflow/agent-protocol.md` 中登记问题治理入口。
- 将 `problem-governance.md` 接入 `tools/validate-workflow.mjs` 的必备文件和内容校验，避免问题治理协议从脚手架中漂移。
- 在 `面试.md` 中补充问题治理作为 Harness Engineering 的可讲述实践。

影响范围：

- `AGENTS.md`
- `CLAUDE.md`
- `docs/workflow/README.md`
- `docs/workflow/document-map.md`
- `docs/workflow/agent-protocol.md`
- `docs/workflow/problem-governance.md`
- `docs/workflow/governance-log.md`
- `tools/validate-workflow.mjs`
- `面试.md`

验证：

- 已运行 `npm run check:workflow`，通过。

## 2026-06-14

### 增加工程评审协议

变更内容：

- 新增 `docs/workflow/review-protocol.md`，统一 Codex、Claude、DeepSeek 或人工 reviewer 的工程评审流程。
- 明确评审适用范围、必读资料、评审流程、严重程度、输出格式、评分维度和整改落点。
- 在 `AGENTS.md`、`CLAUDE.md`、`docs/workflow/README.md` 和 `docs/workflow/document-map.md` 中登记评审入口。
- 将 `review-protocol.md` 接入 `tools/validate-workflow.mjs` 的必备文件和内容校验，避免评审协议从脚手架中漂移。

影响范围：

- `AGENTS.md`
- `CLAUDE.md`
- `docs/workflow/README.md`
- `docs/workflow/document-map.md`
- `docs/workflow/review-protocol.md`
- `docs/workflow/governance-log.md`
- `tools/validate-workflow.mjs`

验证：

- 已运行 `npm run check:workflow`，通过。

### 调整结构门禁和现代架构路线

变更内容：

- 将结构 warning 从“绝对阻塞”调整为“目标文件优先拆分、轻量小修可说明理由后局部修改、无关 warning 不阻塞当前任务”。
- 为 `src/scenes/test-scene/*Bridge.ts` 增加独立 warn 阈值：800 行 warn、1200 行 error，承认桥接层短期偏厚但仍禁止承载领域规则。
- 在 `src` 边界文档中明确 `test-scene` bridge 是过渡层，后续增长优先把纯规则下沉到 `src/systems/`。
- 将阶段 3 的 `GameContext` / `EntityManager` 路线调整为：保留薄 `GameContext`，等统一生命周期需求明确后再引入轻量 `EntityManager`，不提前上完整 ECS。

影响范围：

- `AGENTS.md`
- `TASK_OUTLINE.md`
- `docs/workflow/code-quality-gates.md`
- `docs/architecture/src-boundaries.md`
- `tools/check-structure.mjs`
- `docs/workflow/governance-log.md`

后续规则：

- error 仍是硬阻塞，必须先拆。
- warning 是维护信号，不再让无关文件阻塞当前任务。
- bridge 文件只能做场景和系统的适配，不作为新领域规则的归宿。

## 2026-06-08

### 增加结构性代码门禁（check:structure）

变更内容：

- 新增 `tools/check-structure.mjs`，对 `src/` 和 `tools/` 执行四项结构性检查：
  - **文件行数上限**：system > 800 行 warn、> 1500 行 error；scene > 600 行 warn、> 1200 行 error；test > 6000 行 warn、> 10000 行 error。
  - **代码重复检测**：基于结构指纹（归一化标识符、字符串、数值后的行级相似度比较），同一文件中超过 3 个相似代码块时告警。
  - **Scene 导入耦合度**：scene 导入超过 10 个 system 文件时 warn、超过 15 个时 error。
  - **Scene 边界注释**：超过 300 行的 scene 文件必须有文档化边界注释。
- 脚本始终 exit 0；强制力来自 agent protocol 规则。
- 新增 `npm run check:structure` 脚本。
- `npm run check:all` 扩展为 `check:workflow && check:structure && check:code`。
- 更新 `docs/workflow/code-quality-gates.md`，新增 Structural Gates 章节（文件大小限制表、代码重复规则、scene 导入耦合度和边界注释要求）。
- 更新 `docs/workflow/agent-protocol.md` 代码任务规则，要求修改现有文件前先运行 `check:structure`。
- 更新 `AGENTS.md` 必须遵守规则，新增第 6 条：新增逻辑前先运行 `check:structure`。
- 更新 `CLAUDE.md` Code Quality Gates 章节，加入 structural check 步骤。
- 扩展 `tools/validate-workflow.mjs`：校验 `check:structure` 脚本存在、`package.json` 包含所需 script、`code-quality-gates.md` 包含 Structural Gates 章节、`CLAUDE.md` 和 `agent-protocol.md` 引用 structural gate。

影响范围：

- `AGENTS.md`
- `CLAUDE.md`
- `package.json`
- `docs/workflow/agent-protocol.md`
- `docs/workflow/code-quality-gates.md`
- `docs/workflow/document-map.md`
- `docs/workflow/governance-log.md`
- `tools/check-structure.mjs`
- `tools/validate-workflow.mjs`

验证：

- 已运行 `npm run check:workflow`，通过。
- 已运行 `npm run check:structure`，预期输出当前超标文件的 warning/error 列表。

## 2026-06-02

### 固化 PowerShell rg 低风险命令模板

变更内容：

- 在 `AGENTS.md` 的读取与编码约束中新增低风险 `rg` 模板：中文、代码片段或含引号内容优先搜短而窄的固定字符串，再按行号读取小范围上下文。
- 明确不要手拼包含转义双引号的 regex alternation，也不要把宽关键词和窄关键词混进一个 `a|b|c` 或多个 `-e` 中造成海量输出；多个 `-e` 只用于每个关键词都足够窄的情况。
- 目标从“失败后少汇报”调整为“命令一次成功，避免浪费 token 和时间”。
- 在 `docs/workflow/README.md` 同步读取纪律摘要。

影响范围：

- `AGENTS.md`
- `docs/workflow/README.md`
- `docs/workflow/governance-log.md`

验证：

- 已运行 `npm run check:workflow`，通过。

### 固定 1.0 装备资料表位置和使用边界

变更内容：

- 将根目录 `再续1.0装备属性合成掉落表.xlsx` 移动到 `docs/reverse-engineering/reference/`。
- 新增 `docs/reverse-engineering/reference/equipment-spreadsheet.md`，说明该表只能作为 1.0 辅助索引和交叉校验资料，1.1 事实仍以 AS3 为准。
- 将工作簿四个 sheet 拆分为 `docs/reverse-engineering/reference/equipment-spreadsheet/*.csv`，并新增拆分索引 README，方便 agent 按任务读取小文件。
- 更新 `TASK_OUTLINE.md` 和 `docs/workflow/document-map.md` 的资源入口。
- 更新装备、掉落和合成相关逆向索引中的 xlsx 资料状态。

影响范围：

- `TASK_OUTLINE.md`
- `docs/reverse-engineering/reference/equipment-spreadsheet.md`
- `docs/reverse-engineering/reference/equipment-spreadsheet/README.md`
- `docs/reverse-engineering/reference/equipment-spreadsheet/equipment-attributes.csv`
- `docs/reverse-engineering/reference/equipment-spreadsheet/crafting-recipes.csv`
- `docs/reverse-engineering/reference/equipment-spreadsheet/gem-attributes.csv`
- `docs/reverse-engineering/reference/equipment-spreadsheet/drop-reference.csv`
- `docs/reverse-engineering/reference/再续1.0装备属性合成掉落表.xlsx`
- `docs/reverse-engineering/equipment-index.md`
- `docs/reverse-engineering/drops-index.md`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/workflow/document-map.md`
- `docs/workflow/governance-log.md`

验证：

- 已运行 `npm run check:workflow`，通过。

### 增加 UTF-8 读取纪律与片段读取约束

变更内容：

- 在 `AGENTS.md` 新增读取与编码约束，要求 PowerShell 读取中文/Markdown 文档时显式使用 `Get-Content -Encoding UTF8 -LiteralPath ...`。
- 明确遇到乱码输出时不能继续基于该输出推理，必须用 UTF-8 重新读取。
- 明确优先用 `rg -n` 和小范围片段读取，避免为了定位单条记录全文读入大型 Markdown、AS3 或历史文档。
- 在 `CLAUDE.md` 和 `docs/workflow/README.md` 同步入口摘要。
- 扩展 `tools/validate-workflow.mjs`，校验入口文档是否保留 UTF-8 读取纪律和片段读取要求。

影响范围：

- `AGENTS.md`
- `CLAUDE.md`
- `docs/workflow/README.md`
- `docs/workflow/governance-log.md`
- `tools/validate-workflow.mjs`

验证：

- 已运行 `npm run check:workflow`，通过。

## 2026-06-01

### 重做项目 README 与脚手架 README

变更内容：

- 重写根目录 `README.md`，面向 GitHub 访问者说明项目目标、当前进度、快速开始、仓库结构、提取资料边界和检索关键词。
- 重写 `docs/workflow/README.md`，面向 AI agent 接手者说明脚手架目标、文档分工、冷启动路由、维护规则和验证入口。
- 从 `.gitignore` 移除 `面试.md`，允许将 Harness Engineering 面试准备文档纳入版本管理。

影响范围：

- `.gitignore`
- `README.md`
- `docs/workflow/README.md`
- `docs/workflow/governance-log.md`
- `面试.md`

验证：

- 已运行 `npm run check:workflow`，通过。

## 2026-05-31

### 增加 `/goal` 自动推进与收尾提醒规则

变更内容：

- 在 `docs/workflow/agent-protocol.md` 新增 `Goal 管理协议`，明确 `/goal` 按任务文档自动推进到可交接点，不因普通阶段性进展要求用户手动“继续”。
- 明确 `/goal` 的停止条件：完成定义达成、验证失败且无法自行修复、任务过大需要拆分、权限/资料缺口，或需要用户确认 Git / 对话边界。
- 明确正式 task 或 `/goal` 收尾时必须输出下一步、验证结果、对话管理判断、commit 建议和 push 建议。
- 将 Git 规则扩展为：AI 必须主动给出是否建议 commit / push，但 `git add`、`git commit` 和 `git push` 仍必须由用户明确授权。
- 同步更新 `AGENTS.md`、`TASK_OUTLINE.md`、`CLAUDE.md`、`docs/workflow/README.md` 和 `docs/workflow/document-map.md` 的摘要规则。

影响范围：

- `AGENTS.md`
- `TASK_OUTLINE.md`
- `CLAUDE.md`
- `docs/workflow/agent-protocol.md`
- `docs/workflow/README.md`
- `docs/workflow/document-map.md`
- `docs/workflow/governance-log.md`

验证：

- 已运行 `npm run check:workflow`，通过。

## 2026-05-30

### 增加 TestScene / sandbox 增长约束

变更内容：

- 在 `docs/architecture/src-boundaries.md` 新增 `TestScene` / sandbox 增长约束。
- 明确 `TestScene.ts` 是集成验证场景，不作为最终正式游戏架构承载点。
- 明确新增切片若预计让 `TestScene.ts` 增加超过约 150 行，应先判断是否抽到 `src/scenes/test-scene/` helper 或 `src/systems/`。
- 明确同类职责第二次出现时优先抽 helper：视图创建、调试键、命中桥接、UI 面板桥接、运行时查询、系统调度。
- 明确不为“彻底架构化”做大重构，每次只拆一个职责簇，并保持 `npm run build` 通过。

影响范围：

- `docs/architecture/src-boundaries.md`
- `docs/workflow/governance-log.md`

验证：

- 已运行 `npm run check:workflow`，通过。

## 2026-05-27

### 收缩 AGENTS 入口并外移详细协议

变更内容：

- 将 `AGENTS.md` 收缩为高频硬规则、任务分级、冷启动阅读分流和对话收束摘要。
- 新增 `docs/workflow/agent-protocol.md`，承接正式游戏 task 工作流、代码任务规则、Git 维护、对话收束、任务生成和统一语言细则。
- 更新 `docs/workflow/README.md` 和 `docs/workflow/document-map.md`，登记新协议文档及读取时机。

影响范围：

- `AGENTS.md`
- `docs/workflow/agent-protocol.md`
- `docs/workflow/README.md`
- `docs/workflow/document-map.md`
- `docs/workflow/governance-log.md`

验证：

- 已运行 `npm run check:workflow`，通过。

### 明确新开对话与 compact 的权衡

变更内容：

- 在 `AGENTS.md` 中明确：同一个正式游戏 task 未完成时默认继续当前对话，上下文过长时优先依赖 compact。
- 明确 compact 后应重新检查当前 task 的关键文档和正在修改的文件，避免只凭摘要继续。
- 明确不要因为只完成少量工作、仍在同一 task 的验证/修 bug/补文档阶段，就建议用户新开对话。
- 明确只有完成 task、切换明显不同机制/切片/子系统，或已阅读大量 AS3/逆向文档/历史记录时，才在文档收尾后温和建议新开对话。
- 同步更新 `TASK_OUTLINE.md`、`CLAUDE.md` 和 `docs/workflow/README.md` 的入口规则摘要。

影响范围：

- `AGENTS.md`
- `TASK_OUTLINE.md`
- `CLAUDE.md`
- `docs/workflow/README.md`
- `docs/workflow/governance-log.md`

验证：

- 已运行 `npm run check:workflow`，通过。

## 2026-05-24

### 降低轻量请求的启动和收束成本

变更内容：

- 重写 `AGENTS.md` 为更短的协作入口，新增“轻量请求 / 正式游戏 task / 脚手架维护”三档分流。
- 明确轻量请求只读入口和直接相关文件，不进入完整看板流程，不归档 `task-history.md`，完成后不要求建议新开对话。
- 将正式游戏 task 的完整看板、机制表、切片表和历史归档流程限制在用户指定 task 或明确执行游戏任务时。
- 同步更新 `TASK_OUTLINE.md`、`CLAUDE.md`、`README.md`、`docs/workflow/README.md` 和 `docs/workflow/document-map.md` 的入口说明。

影响范围：

- `AGENTS.md`
- `TASK_OUTLINE.md`
- `CLAUDE.md`
- `README.md`
- `docs/workflow/README.md`
- `docs/workflow/document-map.md`
- `docs/workflow/governance-log.md`

验证：

- 已运行 `npm run check:workflow`，通过。

### 加入 Git 维护规则

变更内容：

- 在 `AGENTS.md` 中新增 Git 维护规则，明确 Codex 默认不自动提交。
- 明确只有用户要求“提交/commit”时才执行 `git add` 和 `git commit`。
- 明确提交前必须区分本次改动和已有未提交改动，不提交无关文件，不回滚用户改动。
- 在 `docs/workflow/README.md` 中同步 Git 规则摘要。

影响范围：

- `AGENTS.md`
- `docs/workflow/README.md`
- `docs/workflow/governance-log.md`

验证：

- 已运行 `npm run check:workflow`，通过。

## 2026-05-23

### 明确 dev server 与编译检查分工

变更内容：

- 在 `AGENTS.md` 中明确：Codex 默认不启动 `npm run dev`，开发服务器由用户每次打开项目时自行运行，视觉效果由用户手工查看。
- 明确 Codex 修改代码后仍应优先运行可自动结束的编译/检查命令（如 `npm run build` 或更小范围检查）来发现新增代码编译错误。
- 明确用户在 `npm run dev` 中看到的编译或运行报错，可以直接反馈给 Codex 作为修复输入。
- 在 `docs/workflow/README.md` 中同步该脚手架协作规则。

影响范围：

- `AGENTS.md`
- `docs/workflow/README.md`
- `docs/workflow/governance-log.md`

验证：

- 已运行 `npm run check:workflow`，通过。

## 2026-05-19

### 补齐轻量 DDD 统一语言维护规则

变更内容：

- 确认本项目采用轻量 DDD：统一语言、上下文边界和命名约束，不引入完整 DDD 架构。
- 在 `AGENTS.md` 新增对话管理规则：一个对话默认只执行一个 task，上下文变长或任务切换时先收尾并建议新开对话。
- 新增或更新 `docs/domain/glossary.md`，维护推荐代码名和禁止别名。
- 新增或更新 `docs/domain/ubiquitous-language-process.md`，维护统一语言更新流程。
- 将统一语言和对话管理规则接入 `AGENTS.md`、`docs/workflow/document-map.md`、`docs/workflow/README.md` 和 `docs/architecture/src-boundaries.md`。
- `tools/validate-workflow.mjs` 接入领域词汇表检查，并对 `src/` 中出现的禁止别名给出 warning。
- 根据现有代码命名，将单玩家输入状态登记为 `PlayerInputState`，将 P1/P2 输入快照登记为 `InputState`。

影响范围：

- `AGENTS.md`
- `TASK_OUTLINE.md`
- `docs/domain/glossary.md`
- `docs/domain/ubiquitous-language-process.md`
- `docs/architecture/src-boundaries.md`
- `docs/workflow/README.md`
- `docs/workflow/document-map.md`
- `docs/workflow/governance-log.md`
- `tools/validate-workflow.mjs`

验证：

- 已运行 `npm run check:workflow`；允许 `TASK-SLICE-001` 依赖 `M-047` 部分已扒的 warning 保留，因为看板已明确真实资源缺失和占位策略。

## 2026-05-15

### 清理失效来源表述并收紧 `AGENTS.md` 职责边界

变更内容：

- 删除项目文档中已经失效的来源文件相关表述。
- 将“方向键属于玩家 2”这类玩法观察从 `AGENTS.md` 移出，避免把入口协作规约写成玩法事实清单。
- 将 `docs/FFDEC_EXTRACTION_GUIDE.md` 收缩为现有提取资料维护说明，不再保留围绕外部源文件的命令模板。

影响范围：

- `AGENTS.md`
- `CLAUDE.md`
- `TASK_OUTLINE.md`
- `docs/FFDEC_EXTRACTION_GUIDE.md`
- `docs/workflow/document-map.md`
- `docs/tasks/task-board.md`
- `docs/reverse-engineering/mechanics-index.md`
- `local-resources/regima/legacy-extraction/README_extract.md`
- `docs/workflow/governance-log.md`

验证：

- 已运行 `npm run check:workflow`，通过。

## 2026-05-13

### 建立轻量 DDD 统一语言

变更内容：

- 新增 `docs/domain/glossary.md`，维护领域概念、推荐代码名、上下文和禁止别名。
- 新增 `docs/domain/ubiquitous-language-process.md`，维护统一语言更新流程、命名规则和例外处理。
- 在 `AGENTS.md` 中加入统一语言规则和冷启动分流入口。
- 在 `docs/architecture/src-boundaries.md` 中要求现代代码命名遵循领域词汇表。
- 在 `tools/validate-workflow.mjs` 中加入领域词汇表结构校验和 `src/` 禁止别名 warning。

影响范围：

- `AGENTS.md`
- `TASK_OUTLINE.md`
- `docs/domain/glossary.md`
- `docs/domain/ubiquitous-language-process.md`
- `docs/architecture/src-boundaries.md`
- `docs/workflow/README.md`
- `docs/workflow/document-map.md`
- `docs/workflow/governance-log.md`
- `tools/validate-workflow.mjs`

后续规则：

- 新增核心领域命名前，先查 `docs/domain/glossary.md`。
- 如果需要新增或调整领域概念，按 `docs/domain/ubiquitous-language-process.md` 更新。
- 现代代码使用推荐代码名；AS3 原名只作为证据或映射说明。

### 强化工作流校验和代码边界文档

变更内容：

- `mechanics-index.md` 的总览表增加 `M-*` 机制 ID。
- `task-board.md` 的目标机制/切片改为 `M-*` / `VS-*` 强引用，并补齐标准任务字段。
- `vertical-slices.md` 的依赖机制补充 `M-*` 引用。
- `AGENTS.md` 改为冷启动阅读决策表，降低小任务阅读负担。
- 新增 `docs/architecture/src-boundaries.md`，记录 `src/` 模块边界、输入系统约束和 TypeScript/Phaser 参数约定。
- `tools/validate-workflow.mjs` 重构为 error/warning 两级校验，并增加必填字段、Blocked 阻塞原因、M/VS 引用、Ready 依赖、推荐遗漏、治理日志和 `src` 边界检查。

影响范围：

- `AGENTS.md`
- `TASK_OUTLINE.md`
- `docs/tasks/task-board.md`
- `docs/tasks/vertical-slices.md`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/workflow/task-generation.md`
- `docs/workflow/document-map.md`
- `docs/architecture/src-boundaries.md`
- `tools/validate-workflow.mjs`

验证：

- 已运行 `npm run check:workflow`，通过。

### 增加工作流一致性校验

变更内容：

- 新增 `tools/validate-workflow.mjs`。
- 在 `package.json` 中新增 `npm run check:workflow`。
- 校验未完成任务表、历史任务表、任务完成定义、当前推荐任务、旧路径和工作流条目是否一致。
- 在 `AGENTS.md` 和 `docs/workflow/README.md` 中要求修改任务/工作流文档后运行校验。

影响范围：

- `tools/validate-workflow.mjs`
- `package.json`
- `AGENTS.md`
- `docs/workflow/README.md`
- `docs/workflow/governance-log.md`

后续规则：

- 文档脚手架调整后优先运行 `npm run check:workflow`。
- 该脚本只做一致性校验，不替代 Markdown 任务文档。

### 拆分未完成任务和已完成任务

变更内容：

- 新增 `docs/tasks/task-history.md`。
- `docs/tasks/task-board.md` 改为只保存未完成游戏任务和完成定义。
- 已完成游戏任务、历史完成定义和执行记录迁移到 `task-history.md`。
- `AGENTS.md` 增加规则：新对话默认不读 `task-history.md`；任务完成后从看板移入历史。
- `TASK_OUTLINE.md` 和 `docs/workflow/document-map.md` 更新文档职责。
- `docs/workflow/task-generation.md` 更新任务归档规则。

影响范围：

- `AGENTS.md`
- `TASK_OUTLINE.md`
- `docs/tasks/task-board.md`
- `docs/tasks/task-history.md`
- `docs/workflow/task-generation.md`
- `docs/workflow/document-map.md`
- `docs/workflow/governance-log.md`

后续规则：

- 新对话默认读取 `task-board.md`，不读取 `task-history.md`。
- 完成任务时，将任务条目、完成定义和执行记录归档到 `task-history.md`。
- 只有追溯历史、修改已完成任务或处理历史依赖时，才读取 `task-history.md`。

### 拆分游戏任务和工作流脚手架

变更内容：

- 新增 `docs/workflow/` 目录。
- 将任务生成规范迁移为工作流脚手架文档。
- 新增文档职责地图。
- 将 `docs/tasks/task-board.md` 定位为游戏任务看板。
- 从游戏任务看板移除 `TASK-DOCS-*` 文档治理任务。
- 明确脚手架维护只记录在 `governance-log.md`，不再进入游戏任务看板。

影响范围：

- `AGENTS.md`
- `TASK_OUTLINE.md`
- `docs/tasks/task-board.md`
- `docs/workflow/README.md`
- `docs/workflow/document-map.md`
- `docs/workflow/task-generation.md`
- `docs/workflow/governance-log.md`
- `docs/reverse-engineering/mechanics-index.md`

后续规则：

- 游戏复现任务使用 `docs/tasks/task-board.md`。
- 任务生成规则使用 `docs/workflow/task-generation.md`。
- AI 工作流和文档脚手架维护记录在本文件。

## 历史整理

以下事项原先曾以 `TASK-DOCS-*` 记录在游戏任务看板中，现归档为工作流治理历史：

- 建立机制表和纵向切片表。
- 建立任务看板并重构总任务书。
- 固化跨对话工作流并补齐任务完成定义。
- 建立任务生成规范并拆分看板待办/已完成。

## 2026-05-23

### 建立代码质量门禁和系统测试入口

变更内容：
- 新增 `docs/workflow/code-quality-gates.md`，明确视觉测试不能替代自动验证，要求 `src/` 改动运行 `npm run test:systems` 和 `npm run build`。
- 新增 `npm run test:systems`、`npm run check:code`、`npm run check:all`，用无新增依赖的 esbuild 打包方式运行系统级断言。
- 更新 `CLAUDE.md`、`docs/workflow/README.md` 和 `docs/workflow/document-map.md`，把代码质量门禁接入 AI 交接入口和文档职责图。
- 扩展 `tools/validate-workflow.mjs`，校验代码质量门禁文档、Claude 入口和 package scripts 是否存在。

影响范围：
- `CLAUDE.md`
- `docs/workflow/README.md`
- `docs/workflow/document-map.md`
- `docs/workflow/code-quality-gates.md`
- `docs/workflow/governance-log.md`
- `tools/validate-workflow.mjs`
- `package.json`
- `tools/run-system-tests.mjs`
- `tools/system-tests.ts`

验证：
- 运行 `npm run test:systems`，通过。
- 运行 `npm run build`，通过。

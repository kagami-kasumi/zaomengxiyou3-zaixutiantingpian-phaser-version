# 再续天庭现代化：AI 总任务书

本文是项目的战略导航。它回答“目标是什么、路线是什么、文档如何分工、任务类型有哪些”。完整系统范围和激活状态看 `docs/tasks/feature-lines.md`，具体 task 状态看 `docs/tasks/task-board.md`。

新的 AI 接手时，默认先读：

1. `AGENTS.md`
2. `TASK_OUTLINE.md`

随后按 `AGENTS.md` 的“任务分级”和“冷启动阅读分流”读取最小必读集。只有正式游戏 task 才默认读取 `docs/tasks/feature-lines.md`、当前线覆盖台账、`docs/tasks/task-board.md`、`docs/reverse-engineering/mechanics-index.md`、`docs/tasks/vertical-slices.md`；行为逆向读取旧提取集中的 AS3，视觉资源逆向优先读取 RegiMA 恢复语料库。

## 0. 项目目标

基于现有 Flash 游戏提取资料，用现代技术重写为外观、玩法、数值、手感和流程尽量一致的 2D 动作 RPG。

关键认知：

- 第一轮资料提取已经完成。
- 不在本项目路径内重新提取 Flash 资料。
- `local-resources/regima/legacy-extraction/` 是只读参考资料，除非用户明确要求，不修改、不删除、不重生成。
- `local-resources/regima/` 是 Git 忽略的本地 RegiMA 资源根；原始命名视觉源包以其中的 `source/restored-swfs/` 为准。
- AS3 源码是行为参考，不是现代架构模板。
- 现代版追求体验一致，不追求代码一致。
- 原版支持本地双人，方向键属于玩家 2。正式输入设计不能把方向键分给玩家 1。

推荐技术路线：Phaser 3 + TypeScript。

## 1. 资料入口

行为与机制主参考：

- `local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts`

备用参考：

- `local-resources/regima/legacy-extraction/resources_by_swf/[25034429].swf/scripts`

视觉资源主参考：

- `local-resources/regima/source/restored-swfs/`
- `local-resources/regima/manifests/`
- `docs/reverse-engineering/evb-extraction-report.md`
- `docs/reverse-engineering/asset-annotation/workflow.md`

旧提取对照和数据：

- `local-resources/regima/legacy-extraction/resources_by_swf`
- `docs/reverse-engineering/reference/再续1.0装备属性合成掉落表.xlsx`
- `docs/reverse-engineering/reference/equipment-spreadsheet/`
- `docs/reverse-engineering/reference/equipment-spreadsheet.md`
- `gameData`（如存在本地存档样本）

提取说明：

- `local-resources/regima/legacy-extraction/README_extract.md`
- `docs/FFDEC_EXTRACTION_GUIDE.md`

视觉资源是否存在不能只依据 `local-resources/regima/legacy-extraction/resources_by_swf`；必须先在 RegiMA 恢复语料库中按目标资源名、源包、SymbolClass 或 MovieClip 做窄查。

## 2. 文档分工

这几个文档职责必须正交：

- `TASK_OUTLINE.md`：战略导航。维护目标、原则、阶段路线和任务类型，不维护具体任务状态。
- `docs/tasks/task-board.md`：未完成游戏任务看板。维护当前游戏复现任务、状态、产物、拆分和下一步。
- `docs/tasks/feature-lines.md`：完整玩家系统台账。维护唯一 Active 功能线、用户确认范围、当前 task、阻塞和关闭证据。
- `docs/tasks/feature-line-coverage/LINE-*.md`：单条功能线的权威内容全集、覆盖矩阵和关闭检查。
- `docs/tasks/task-history.md`：已完成游戏任务历史。默认不读，除非需要追溯、修改已完成任务或处理历史依赖。
- `docs/workflow/task-generation.md`：游戏任务生成规范。维护如何从机制、切片或工程缺口生成标准任务。
- `docs/workflow/*.md`：AI 工作流脚手架。维护任务体系、文档职责和治理日志，不进入游戏任务看板。
- `docs/reverse-engineering/mechanics-index.md`：总机制表。维护每个机制的逆向状态和复现状态。
- `docs/tasks/vertical-slices.md`：纵向切片表。维护可玩切片、依赖机制和实现状态。
- `docs/reverse-engineering/*.md`：逆向笔记。记录 AS3 证据、行为事实和现代建议。
- `docs/architecture/src-boundaries.md`：现代代码模块边界和 TypeScript/Phaser 约定。
- `docs/domain/glossary.md`：轻量 DDD 统一语言表。维护领域概念的唯一推荐代码名。
- `docs/domain/ubiquitous-language-process.md`：统一语言更新流程。

更新规则：

- 改路线或任务类型：更新 `TASK_OUTLINE.md`。
- 开始/拆分具体任务：先确认唯一 Active 功能线，再更新 `task-board.md` 和对应覆盖台账。
- 完成具体 task：从 `task-board.md` 移到 `task-history.md`，随后继续同线下一 task；不得据此自动关闭功能线。
- 完成功能线：只有覆盖合同全部满足后更新 `feature-lines.md`，再激活下一条线。
- 新增游戏任务或规范任务定义：遵循 `docs/workflow/task-generation.md`。
- 维护 AI 工作流脚手架：更新 `docs/workflow/governance-log.md`。
- 扒出机制：更新 `mechanics-index.md` 的逆向状态。
- 完成实现：更新 `vertical-slices.md`，并同步 `mechanics-index.md` 的复现状态。

## 3. 工作原则

普通执行一次处理一个清晰 task；`/goal` 持有一个完整功能线并连续推进多个同线 task。`TASK_OUTLINE.md` 中的任务类型可以较大，实际调度以 `feature-lines.md` 和 `task-board.md` 为准。

执行代码任务时：

- 先定位对应 AS3 类和关键字段，再实现现代版本。
- 先理解玩法，再写系统。
- 新代码以现代重写为目标，不维护 Flash 工程。
- 遇到原版低质量或 Flash 特有写法时，只保留可观察行为，用现代方式重写。
- 不照搬全局大对象、字符串状态乱跳、重复创建资源、时间轴强耦合、手写内存清理、多人与活动遗留逻辑等技术债。
- 优先使用清晰模块边界、显式数据模型、资源 manifest、对象池、有限状态机、可测试的伤害结算和可释放的生命周期。
- 实现任务开始前，检查 `vertical-slices.md` 中对应切片依赖是否满足。
- 依赖机制没扒清楚时，先执行逆向任务，不边猜边写。

禁止事项：

- 不改 `local-resources/regima/legacy-extraction/` 原始提取结果。
- 不在本路径内重新提取 Flash 资料。
- 不因为一个小任务顺手重构无关系统。
- 不把 AS3 的类结构、内存管理方式或 Flash 时间轴写法当作必须继承的设计。
- 不以“完全一致”为一次任务目标；完全一致需要用户提供原版录屏或实测反馈逐步校准。

## 4. 工作流

具体执行协议以 `AGENTS.md` 的“任务分级”和“正式游戏 task 工作流”为准。本文只保留路线判断。

轻量请求不进入完整看板流程，不归档 task-history，也不要求完成后切换对话。正式游戏 task 才执行看板、机制表、切片表和历史归档流程。

用户使用 `/goal` 时，AI 持有 `feature-lines.md` 中唯一 Active 功能线，完成一个 task 后自动继续同线下一 task，遇到阻塞只解决本线阻塞。只有完整功能线关闭或确需用户输入时才停；任务文档仍受 `docs/workflow/agent-protocol.md` 约束。

同一个正式游戏 task 未完成时优先继续当前对话；上下文过长时优先 compact，并在 compact 后复查关键文档和当前改动文件。只有完成 task、切换明显不同机制/切片/子系统，或已读取大量 AS3/逆向/历史资料时，才在文档收尾后建议新开对话。

默认选择：

```text
先扒够一个纵向切片
-> 复现该切片
-> 验证和校准
-> 再扒下一个机制或扩展切片
```

不建议等整个游戏全部扒完再开始建设，也不建议边猜边写。

## 5. 阶段路线

### 阶段 0：资料冻结和任务体系

目标：

- 明确首轮资料提取已完成。
- 明确 `local-resources/regima/legacy-extraction/` 只读。
- 建立总任务书、FFDec 文档、机制表、切片表、任务看板。

### 阶段 1：游戏设定逆向

目标：

- 先弄清楚原版游戏怎么玩，再决定怎么实现。
- 优先确认双人、按键、角色、流程、战斗、关卡、成长、UI、存档。

重点：

- 五个角色的普攻、组合键、技能槽、特殊机制。
- 第一个地图和 `StageListener` 如何开始战斗、刷怪、通关。
- `BaseMonster` 和一个简单怪物。
- 装备、背包、掉落、存档的系统边界。

### 阶段 2：现代项目脚手架

目标：

- 建立可运行的新游戏工程。
- 验证 Phaser、TypeScript、场景、资源加载和键盘读取。

注意：

- 当前 `InputSystem.ts` 是技术验证，不代表正式玩法设计。
- 正式输入系统必须改为双玩家输入，方向键归玩家 2。

### 阶段 3：现代架构修正

目标：

- 根据玩法索引修正阶段 2 的脚手架。
- 在正式战斗切片前建立正确系统边界。

重点：

- 双玩家输入。
- `InputBindings`。
- 保留薄 `GameContext`：只做运行时查询和系统调度上下文，不承载玩法规则。
- 轻量 `EntityManager`：等怪物、掉落、宠物、投射物等实体需要统一生命周期时再引入，不为架构洁癖提前上完整 ECS。
- 系统更新顺序。
- 资源 manifest。

### 阶段 4：最小可玩战斗切片

目标：

- 在机制足够清楚后，做第一个可玩的闭环。

切片队列见：

- `docs/tasks/vertical-slices.md`

### 阶段 5：扩展战斗

目标：

- 技能、子弹、碰撞、怪物 AI。

### 阶段 6：成长循环

目标：

- 装备、背包、掉落、合成、等级、经验。

### 阶段 7：内容扩展

目标：

- 多角色、多地图、多怪物、多 boss。

阶段检查点：

- Stage 1-1、1-2、1-3 已提供足够的关卡样本后，暂停继续堆叠关卡，先完成“战斗可读/可通关 → 核心 HUD → 启动存档 → 天庭地图 → 完整功能 UI”的正式游戏主循环。
- 只有该主循环功能线关闭后才恢复 Stage 2-1 和更多内容扩展，避免把数值、反馈、导航和持久化缺口复制到更多关卡。

### 阶段 8：UI、存档和完整流程

目标：

- 主菜单、选人、地图选择、背包、装备、技能、宠物、商店、任务、存档。

执行顺序：

- 战斗可读性与数值/续航校准。
- HP/MP/经验/技能等核心战斗 HUD。
- EXE 启动后的新建/读取/删除存档槽。
- 天庭地图节点、关卡解锁和结算返回。
- 背包、装备、宠物、心法/技能、法宝等完整功能 UI；商店和任务仍按后续独立范围生成。

### 阶段 9：校准、打包和发布

目标：

- 手感校准、资源补齐、性能优化、桌面打包、玩家说明。

## 6. 任务类型

实际任务以 `task-board.md` 为准。本文只定义任务类型。

### TASK-SETTINGS：玩法逆向任务

目标：

- 只读 AS3 和资料。
- 输出或更新 `docs/reverse-engineering/*.md`。
- 更新 `mechanics-index.md`。
- 不写现代游戏代码。

例子：

- 角色动作索引。
- 关卡刷怪索引。
- 怪物基础索引。
- 装备/背包/存档索引。

### TASK-ARCH：现代架构任务

目标：

- 根据已确认机制修正现代工程基础设施。
- 可以改 `src/`，但不做完整战斗内容。
- 更新 `vertical-slices.md` 和 `mechanics-index.md` 的复现状态。

例子：

- 双玩家输入系统。
- 资源 manifest。
- 薄上下文和实体管理。

### TASK-SLICE：纵向切片任务

目标：

- 做一个可试玩或可验证的小闭环。
- 必须先检查 `vertical-slices.md` 中依赖机制是否满足。
- 完成后更新切片表和机制表。

例子：

- 第一个角色移动。
- 第一个角色普攻。
- 第一个怪物受击死亡。
- 基础伤害闭环。

## 7. 当前下一步

当前完整目标、具体 task 和推荐下一步依次看：

- `docs/tasks/feature-lines.md`
- `docs/tasks/task-board.md`

默认不读取：

- `docs/tasks/task-history.md`

推荐开场：

```text
请按 AGENTS.md 的“正式游戏 task 工作流”执行一个 task。
如果我没有指定 task id，请从 docs/tasks/feature-lines.md 的唯一 Active 线选择 task-board 当前推荐项。
```

自动推进推荐开场：

```text
/goal 按任务文档连续执行当前 Active 功能线，task 完成后继续同线下一 task，阻塞时不切线，直到完整关闭或确需我输入；收尾时请给出 Git 和对话管理建议。
```

创建任务时推荐开场：

```text
请按 docs/workflow/task-generation.md，从机制表/切片表中发现缺口并创建标准游戏 task。
只更新任务和相关文档，不写游戏代码。
```

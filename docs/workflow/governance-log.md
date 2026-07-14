# 工作流治理日志

本文记录 AI 工作流、任务体系和文档脚手架的维护历史。它不是游戏任务看板。

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
- `extracted_flash/README_extract.md`
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

# 工作流治理日志

本文记录 AI 工作流、任务体系和文档脚手架的维护历史。它不是游戏任务看板。

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

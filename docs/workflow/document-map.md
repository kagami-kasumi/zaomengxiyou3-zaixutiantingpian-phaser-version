# 文档职责地图

本文说明各类文档的边界，避免游戏复现任务和 AI 工作流脚手架混在一起。

## 游戏复现层

- `TASK_OUTLINE.md`
  - 项目战略导航。
  - 维护目标、路线、阶段和任务类型。
  - 不维护具体任务状态。
- `docs/tasks/task-board.md`
  - 游戏任务看板。
  - 只维护未完成的游戏逆向、现代架构、纵向切片、资源和实现任务。
  - 不记录 AI 工作流治理任务。
- `docs/tasks/task-history.md`
  - 游戏任务历史。
  - 维护已完成游戏任务、完成定义和执行记录。
  - 新对话默认不读取；只在追溯历史、修改已完成任务或处理依赖冲突时读取。
- `docs/tasks/vertical-slices.md`
  - 纵向切片表。
  - 维护可玩切片、依赖机制和实现状态。
- `docs/reverse-engineering/mechanics-index.md`
  - 总机制表。
  - 维护游戏机制的逆向状态和复现状态。
  - 不记录 AI 工作流脚手架状态。
- `docs/reverse-engineering/*.md`
  - 逆向笔记。
  - 记录 AS3 证据、行为事实和现代实现建议。
- `docs/architecture/src-boundaries.md`
  - 现代代码模块边界。
  - 维护 `src/` 目录职责、输入系统约束和 TypeScript/Phaser 参数约定。
- `docs/domain/glossary.md`
  - 领域统一语言表。
  - 维护中文概念、推荐代码名、上下文、说明和禁止别名。
- `docs/domain/ubiquitous-language-process.md`
  - 统一语言维护流程。
  - 维护轻量 DDD 的更新规则、命名规则和例外处理。

## 工作流脚手架层

- `AGENTS.md`
  - Agent 强规则入口。
  - 维护任务分级、冷启动阅读分流、正式游戏 task 执行协议和禁止事项。
- `CLAUDE.md`
  - Claude Code 快速入口。
  - 摘要列出启动校验、核心约束和代码质量门禁。
- `docs/workflow/task-generation.md`
  - 标准游戏任务生成规范。
  - 说明如何从机制缺口、切片缺口或工程基础缺口生成任务。
- `docs/workflow/agent-protocol.md`
  - Agent 详细执行协议。
  - 维护正式游戏 task、代码任务、Git、对话收束、任务生成和统一语言的细则，避免 `AGENTS.md` 过长。
- `docs/workflow/code-quality-gates.md`
  - AI 代码质量门禁。
  - 规定自动验证、系统测试触发条件、场景层边界和 Git 工作要求。
- `docs/workflow/governance-log.md`
  - 工作流脚手架维护日志。
  - 记录任务体系、文档职责、AI 交接协议和代码质量门禁等变化。
- `docs/workflow/document-map.md`
  - 本文件。
  - 维护各文档职责边界。

## 资源和提取层

- `extracted_flash/README_extract.md`
  - 提取结果说明。
  - 只读参考。
- `docs/FFDEC_EXTRACTION_GUIDE.md`
  - FFDec 提取资料维护说明。
  - 记录现有提取结果的维护边界。

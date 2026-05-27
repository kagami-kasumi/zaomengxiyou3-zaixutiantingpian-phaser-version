# 工作流脚手架

本目录维护 AI 协作和项目治理规则，不记录游戏复现任务。

## 分工

- `task-generation.md`：如何从机制、切片或工程缺口生成标准游戏任务。
- `agent-protocol.md`：正式游戏 task、代码任务、Git、对话收束和统一语言的详细执行协议。
- `document-map.md`：项目文档职责地图。
- `code-quality-gates.md`：AI 写代码时必须遵守的工程质量门禁。
- `governance-log.md`：AI 工作流、任务体系和文档脚手架维护记录。
- `../domain/glossary.md`：轻量 DDD 统一语言表。
- `../domain/ubiquitous-language-process.md`：统一语言更新流程。

## 规则

- 新对话默认只读 `AGENTS.md` 和 `TASK_OUTLINE.md`，再按任务分级读取最小必读集。
- 只有执行正式游戏 task 或需要细则时，才读取 `docs/workflow/agent-protocol.md`。
- 轻量请求不进入完整游戏 task 流程，不更新 `task-board.md`，不归档 `task-history.md`，完成后不要求建议新开对话。
- 游戏逆向、实现、切片和现代架构任务写入 `docs/tasks/task-board.md`。
- 已完成游戏任务从 `task-board.md` 归档到 `docs/tasks/task-history.md`。
- 新对话默认不读取 `task-history.md`，除非需要追溯历史或修改已完成任务。
- 工作流、任务体系、文档职责、AI 交接协议和代码质量门禁等脚手架维护写入本目录，不新增 `TASK-DOCS-*` 到游戏任务看板。
- 脚手架维护必须在 `governance-log.md` 留下日期、变更内容和影响范围。
- 修改任务或工作流文档后运行 `npm run check:workflow`。
- 修改 `src/` 后运行 `npm run test:systems` 和 `npm run build`；混合代码和工作流改动后运行 `npm run check:all`。
- 默认不要要求 Codex 或 Claude 启动 `npm run dev`；开发服务器和视觉检查由用户本地完成。
- 新增核心领域命名前，先更新 `docs/domain/glossary.md` 和 `docs/domain/ubiquitous-language-process.md`。
- 一个正式游戏 task 对话默认只执行一个 task；同一 task 未完成时默认继续当前对话，上下文过长时优先依赖 compact，并在 compact 后重新检查关键文件。
- 不要因为只完成少量工作、仍在同一 task 的验证/修 bug/补文档阶段，就建议新开对话；只有完成 task、切换明显不同机制/切片/子系统，或已读取大量 AS3/逆向/历史资料时，才在文档收尾后温和建议新开对话。
- Codex 默认不自动提交；只有用户明确要求提交时才运行 `git add` 和 `git commit`。
- 提交前必须检查工作区，区分本次改动和已有未提交改动，不提交无关文件，不回滚用户改动。

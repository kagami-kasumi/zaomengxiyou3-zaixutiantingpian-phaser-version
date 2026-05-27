# Agent 详细执行协议

本文承接 `AGENTS.md` 中不适合常驻入口的细则。只有执行正式游戏 task、代码实现、任务生成、Git 操作或对话收束时按需读取。

## 正式游戏 task 工作流

本项目依靠文档维护跨对话记忆。只有正式游戏 task 才执行完整看板流程。

1. 先读 `AGENTS.md`、`TASK_OUTLINE.md`，再按冷启动阅读分流读取该 task 的必读文档。
2. 如果用户指定了 task id，只执行该 task。
3. 如果用户要求执行 task 但没有指定 task id，从 `docs/tasks/task-board.md` 中选择一个 `Ready` 任务；优先选择看板“当前推荐”中的任务。
4. 开始执行前，确认该 task 有独立的“完成定义”。如果没有，先按 `docs/workflow/task-generation.md` 在 `task-board.md` 为它补齐完成定义，再执行。
5. 如果任务实际过大，不硬做完；按 `docs/workflow/task-generation.md` 把原任务标为 `Split`，拆出更小子任务，只完成其中一个可验收子任务。
6. 任务结束时必须更新 `task-board.md` 的状态和推荐后续任务。
7. 如果任务完成，把该任务从 `task-board.md` 移到 `docs/tasks/task-history.md`，并在历史中记录完成内容、产物和必要验证。
8. 逆向任务还必须同步更新 `docs/reverse-engineering/mechanics-index.md`。
9. 实现任务还必须同步更新 `docs/tasks/vertical-slices.md`，并更新 `mechanics-index.md` 的复现状态。

每个 task 的完成定义必须写在 `task-board.md`，并尽量包含：要解决的问题、必读资料、输出产物、验收标准、禁止范围和推荐后续任务。

## 代码任务规则

- 先定位对应 AS3 参考类，再实现现代版本。
- 遵循 `docs/architecture/src-boundaries.md` 的模块边界和 TypeScript/Phaser 参数约定。
- 遵循 `docs/domain/glossary.md` 的统一语言；新增核心领域命名前先按 `docs/domain/ubiquitous-language-process.md` 更新词汇表。
- 记录关键映射关系，例如 AS3 类名对应的新 TypeScript 文件。
- 实现任务开始前检查 `docs/tasks/vertical-slices.md` 中对应切片依赖是否满足；依赖机制未确认时，先做逆向任务。
- 能验证就运行验证，不能验证要说明原因。
- 默认不启动 `npm run dev`；开发服务器由用户自行运行。修改代码后优先运行可自动结束的检查命令，如 `npm run build`、`npm run test:systems` 或更小范围检查。

## Git 维护规则

- Codex 默认不自动提交。
- 完成一个明确 task、切片或脚手架维护节点后，Codex 应汇总本次改动和验证结果，并可建议 commit message。
- 只有用户明确要求“提交”或 “commit” 时，Codex 才执行 `git add` 和 `git commit`。
- 提交前必须检查工作区，区分本次改动和已有未提交改动；不得提交无关文件。
- 如果工作区已有不属于当前任务的改动，Codex 只提交本次任务相关文件，或先询问用户如何处理。
- 不要为了整理 Git 状态而回滚、删除或覆盖用户已有改动，除非用户明确要求。

## 对话收束规则

轻量请求完成后直接给结果，不需要建议新开对话。

同一个正式游戏 task 尚未完成时，默认继续当前对话；如果上下文过长，优先依赖系统 compact 继续推进。compact 后应重新检查当前 task 的关键文档和正在修改的文件，不要只凭摘要继续。

不要因为只完成了少量工作、刚做完一个小修、还在同一 task 的验证/修 bug/补文档阶段，就建议用户新开对话。

正式游戏 task 或大范围脚手架维护完成后，只有在继续下一个 task 需要读取新一批资料、切换到明显不同的机制/切片/子系统，或已经阅读大量 AS3/逆向文档/历史记录时，才先完成文档收尾，再温和建议用户新开对话。

收束回复应包含：已完成或暂停的 task id（如有）、更新文件、剩余风险、推荐下一个 task id（如有）、建议的新对话开场 prompt（仅正式 task 需要）。

## 任务生成规则

当用户要求新增游戏任务、拆分游戏任务、重排游戏任务或从机制生成任务时，必须先读 `docs/workflow/task-generation.md`。

新任务必须来自以下来源之一：

- `mechanics-index.md` 中的机制缺口。
- `vertical-slices.md` 中的切片缺口。
- 现代工程基础设施缺口。

新任务必须写入 `task-board.md`，并包含目标机制/切片、输入资料、输出产物、完成定义、验收标准、禁止范围、状态更新和推荐后续任务。已完成任务应归档到 `docs/tasks/task-history.md`。

## 统一语言规则

本项目采用轻量 DDD：只执行统一语言、上下文边界和命名约束，不引入完整 DDD 架构。

- 领域概念以 `docs/domain/glossary.md` 为准。
- 统一语言更新流程以 `docs/domain/ubiquitous-language-process.md` 为准。
- 同一个领域概念只能有一个推荐代码名。
- AS3 原名可以作为证据记录，但现代代码优先使用推荐代码名。
- 修改领域词汇表后运行 `npm run check:workflow`。

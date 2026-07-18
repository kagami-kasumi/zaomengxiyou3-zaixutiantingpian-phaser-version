# Agent 详细执行协议

本文承接 `AGENTS.md` 中不适合常驻入口的细则。只有执行正式游戏 task、代码实现、任务生成、Git 操作或对话收束时按需读取。

## 正式游戏 task 工作流

本项目依靠文档维护跨对话记忆。只有正式游戏 task 才执行完整看板流程。
功能线调度严格保持 `WIP=1`：当前完整系统关闭前不得切线，遇到阻塞只生成和处理同线解除任务。

1. 先读 `AGENTS.md`、`TASK_OUTLINE.md`、`docs/tasks/feature-lines.md`，确认唯一 `Active` 功能线，再按冷启动阅读分流读取该 task 的必读文档。
2. 如果用户指定了 task id，先确认它属于当前 `Active` 功能线；非激活线 task 不得直接执行，必须继续当前线，或由用户明确决定放弃/重定向当前完整目标并同步台账。
3. 如果用户要求执行 task 但没有指定 task id，只能选择看板“当前推荐”的同线 `Ready` task；不得从其他功能线的 `Planned` task 中挑选。
4. 开始执行前，确认该 task 有独立的“完成定义”。如果没有，先按 `docs/workflow/task-generation.md` 在 `task-board.md` 为它补齐完成定义，再执行。
5. 如果任务实际过大，不硬做完；按 `docs/workflow/task-generation.md` 把原任务标为 `Split`，拆出更小子任务，只完成其中一个可验收子任务。
6. 任务结束时必须更新功能线覆盖台账、`task-board.md` 的状态和同线推荐后续任务；条线未关闭时禁止推荐其他系统。
7. 如果任务完成，把该任务从 `task-board.md` 移到 `docs/tasks/task-history.md`，并在历史中记录完成内容、产物和必要验证。
8. 逆向任务还必须同步更新 `docs/reverse-engineering/mechanics-index.md`。
9. 实现任务还必须同步更新 `docs/tasks/vertical-slices.md`，并更新 `mechanics-index.md` 的复现状态。
10. task 完成只代表工作单元归档；只有 `feature-lines.md` 的完整关闭合同满足后，才能关闭功能线并切换到下一条线。

每个 task 的完成定义必须写在 `task-board.md`，并尽量包含：要解决的问题、必读资料、输出产物、验收标准、禁止范围和推荐后续任务。

## Goal 管理协议

`/goal` 用于让 AI 按任务文档自动推进到一个可交接点，减少用户手动反复输入“继续”。任务文档的生成、维护和归档仍由本脚手架监督。

触发 `/goal` 时：

1. 先读取 `feature-lines.md`，恢复唯一 `Active` 功能线和系统级 goal。
2. 如果用户指定了同线 task id，先执行该 task；如果指定非激活线 task，停止切线并说明当前完整目标。
3. 如果用户没有指定 task id，从 `task-board.md` 选择当前推荐的同线 task。
4. 如果当前没有可执行 task，先从当前线覆盖缺口或阻塞生成同线 task；不得切换到另一条线寻找 Ready 工作。
5. 一个 task 完成后自动归档并继续同线下一 task，不因局部完成要求用户输入“继续”，也不结束系统级 goal。
6. 遇到阻塞时先生成并解决同线解除阻塞 task；只有确实需要用户权限、材料或裁决时才停下来请求输入，等待期间不推进其他功能线。
7. 只有当前功能线完整关闭，或用户明确决定放弃/重定向该线，系统级 `/goal` 才结束或切线。

`/goal` 的承诺粒度是当前完整功能线，执行粒度仍是小而可验收的 task。AI 不把整条线硬塞进一个巨大 task，而是在同一 goal 内连续拆分、执行、验证和归档，直到完整关闭合同满足。

`/goal` 收尾必须输出：

- 当前功能线、已完成/暂停/拆分的 task id，以及功能线是否仍为 `Active`。
- 本次更新的代码和文档。
- 已运行的验证命令和结果。
- 下一步同线推荐 task；功能线未关闭时不得推荐其他系统。
- 对话管理判断：继续当前对话、优先 compact，或建议新开对话。
- Git 管理判断：是否建议 commit、建议 commit message；是否建议 push。

AI 可以主动建议 commit / push / 新开对话，但不能把这些建议当作用户授权。

## 代码任务规则

- 先定位对应 AS3 参考类，再实现现代版本。
- 遵循 `docs/architecture/src-boundaries.md` 的模块边界和 TypeScript/Phaser 参数约定。
- 遵循 `docs/domain/glossary.md` 的统一语言；新增核心领域命名前先按 `docs/domain/ubiquitous-language-process.md` 更新词汇表。
- 记录关键映射关系，例如 AS3 类名对应的新 TypeScript 文件。
- 实现任务开始前检查 `docs/tasks/vertical-slices.md` 中对应切片依赖是否满足；依赖机制未确认时，先做逆向任务。
- 能验证就运行验证，不能验证要说明原因。
- 默认不启动 `npm run dev`；开发服务器由用户自行运行。修改代码后优先运行可自动结束的检查命令，如 `npm run build`、`npm run test:systems` 或更小范围检查。
- **在现有文件中新增逻辑前**，先运行 `npm run check:structure`。如果目标文件出现在 warning 列表中，应先拆分再添加新功能。如果出现在 error 列表中，禁止在拆分前向该文件添加任何新逻辑。

## Git 维护规则

- Codex 默认不自动提交。
- 完成一个明确 task、切片或脚手架维护节点后，Codex 应汇总本次改动和验证结果，并可建议 commit message。
- 正式 task 或 `/goal` 收尾时，Codex 必须明确说明当前是否建议 commit；如果建议提交，给出建议 commit message。
- 只有用户明确要求“提交”或 “commit” 时，Codex 才执行 `git add` 和 `git commit`。
- Codex 默认不自动 push；只有用户明确要求“push”或“上传”时，才执行 `git push`。
- 只有已提交且远端同步是合理下一步时，才建议 push；未提交、验证失败或工作区混杂时不要建议 push。
- 提交前必须检查工作区，区分本次改动和已有未提交改动；不得提交无关文件。
- 如果工作区已有不属于当前任务的改动，Codex 只提交本次任务相关文件，或先询问用户如何处理。
- 不要为了整理 Git 状态而回滚、删除或覆盖用户已有改动，除非用户明确要求。

## 对话收束规则

轻量请求完成后直接给结果，不需要建议新开对话。

同一个正式游戏 task 尚未完成时，默认继续当前对话；如果上下文过长，优先依赖系统 compact 继续推进。compact 后应重新检查当前 task 的关键文档和正在修改的文件，不要只凭摘要继续。

不要因为只完成了少量工作、刚做完一个小修、还在同一 task 的验证/修 bug/补文档阶段，就建议用户新开对话。

正式游戏 task 或大范围脚手架维护完成后，只有在继续下一个 task 需要读取新一批资料、切换到明显不同的机制/切片/子系统，或已经阅读大量 AS3/逆向文档/历史记录时，才先完成文档收尾，再温和建议用户新开对话。

正式 task 或 `/goal` 收尾时必须明确给出对话判断：

- 继续当前对话：同一 task 还在验证、修 bug、补文档或仍未完成。
- 优先 compact：同一 task 仍需继续，但上下文已经偏长。
- 建议新开对话：task 已完成，且下一步切换到明显不同机制/切片/子系统，或已读取大量 AS3/逆向/历史资料。

收束回复应包含：已完成或暂停的 task id（如有）、更新文件、剩余风险、推荐下一个 task id（如有）、Git 建议、对话管理建议、建议的新对话开场 prompt（仅正式 task 需要）。

## 问题治理规则

当用户要求确认或治理系统性工程问题时，必须先读 `docs/workflow/problem-governance.md`。

问题治理不等于普通 bugfix。只有跨文件重复、模块耦合、边界漂移、测试盲区、数据源分裂、生命周期规则不统一等会持续伤害系统演进能力的结构性缺口，才进入问题治理流程。

治理前应先明确问题定义和证据；治理后必须给出解决方案、测试方案、测试结果和关闭标准。若问题来自工程评审，再结合 `docs/workflow/review-protocol.md`；若问题应沉淀为质量门禁，再更新 `docs/workflow/code-quality-gates.md` 或校验脚本，并记录到 `docs/workflow/governance-log.md`。

## 任务生成规则

当用户要求新增游戏任务、拆分游戏任务、重排游戏任务或从机制生成任务时，必须先读 `docs/workflow/task-generation.md`。

新任务必须首先属于当前唯一 `Active` 功能线，并来自以下来源之一：

- `feature-line-coverage/LINE-*.md` 中的覆盖缺口或当前阻塞。
- `mechanics-index.md` 中的机制缺口。
- `vertical-slices.md` 中的切片缺口。
- 现代工程基础设施缺口。

新任务必须写入 `task-board.md`，并包含功能条线、目标机制/切片、输入资料、输出产物、完成定义、验收标准、禁止范围、状态更新和同线推荐后续任务。已完成 task 应归档到 `docs/tasks/task-history.md`，但不得因此关闭功能线或切线。

## 统一语言规则

本项目采用轻量 DDD：只执行统一语言、上下文边界和命名约束，不引入完整 DDD 架构。

- 领域概念以 `docs/domain/glossary.md` 为准。
- 统一语言更新流程以 `docs/domain/ubiquitous-language-process.md` 为准。
- 同一个领域概念只能有一个推荐代码名。
- AS3 原名可以作为证据记录，但现代代码优先使用推荐代码名。
- 修改领域词汇表后运行 `npm run check:workflow`。

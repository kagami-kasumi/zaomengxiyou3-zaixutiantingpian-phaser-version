# CLAUDE.md

本项目用文档体系驱动多 AI agent 协作。完整规则见 [AGENTS.md](./AGENTS.md)，本文作为 Claude Code 的快速入口。

## 启动校验

涉及 workflow/task/domain/harness 文档变更时，运行一致性校验：

```bash
npm run check:workflow
```

如果校验失败，先修问题再继续。普通解释、小修或只读排查不需要在启动时先跑校验。

## 必读文档

| 优先级 | 文档 | 何时读 |
| --- | --- | --- |
| 条件必读 | [AGENTS.md](./AGENTS.md) | 项目指令未由客户端注入时读取；已注入则视为已读，不再 shell 全文读取 |
| 执行必读 | [docs/tasks/execution-queue.md](./docs/tasks/execution-queue.md) | `/goal` 或正式执行请求先检查全局治理项；无可执行治理项时才进入游戏看板 |
| 按需 | [TASK_OUTLINE.md](./TASK_OUTLINE.md) | 正式游戏 task、`/goal`、游戏任务生成/重排或路线判断时 |
| 按需 | [docs/tasks/task-board.md](./docs/tasks/task-board.md) | 执行正式游戏 task 时读取状态索引 |
| 按需 | `docs/tasks/task-definitions/TASK-*.md` | 只读取当前 Ready task 的完整执行合同 |
| 按需 | [docs/tasks/feature-lines.md](./docs/tasks/feature-lines.md) | 确认唯一 Active 功能线、连续 task 和关闭合同 |
| 按需 | [docs/reverse-engineering/mechanics-index.md](./docs/reverse-engineering/mechanics-index.md) | 涉及玩法/机制时 |
| 按需 | [docs/tasks/vertical-slices.md](./docs/tasks/vertical-slices.md) | 涉及实现时 |
| 按需 | [docs/workflow/review-protocol.md](./docs/workflow/review-protocol.md) | 执行工程评审时 |
| 按需 | [docs/workflow/problem-governance.md](./docs/workflow/problem-governance.md) | 确认或治理系统性工程问题时 |
| 收尾必读 | [docs/workflow/problem-audit.md](./docs/workflow/problem-audit.md) | 代码、架构、游戏 task 或工作流变更收尾时 |
| 按需 | [docs/workflow/method-observation.md](./docs/workflow/method-observation.md) | 提出、试验或裁决可重复改进方法时 |
| 人工触发 | [docs/workflow/system-design-protocol.md](./docs/workflow/system-design-protocol.md) | 仅当用户明确要求为具体系统设计或重设计设计模式时 |
| 关联 task | [docs/workflow/system-design-acceptance-protocol.md](./docs/workflow/system-design-acceptance-protocol.md) | 当前 task 链接尚未完成且未退出的具体系统设计时，每批重复验收 |
| 按需 | [docs/workflow/reverse-engineering-protocol.md](./docs/workflow/reverse-engineering-protocol.md) | 逆向原版行为或依据逆向结论实现时 |
| 视觉真值逆向 task | [docs/workflow/reverse-engineering-task-protocol.md](./docs/workflow/reverse-engineering-task-protocol.md) | 仅视觉真值逆向读取，并继续读取 task 唯一链接的方案；代码逆向沿用既有入口 |
| 按需 | [docs/workflow/](./docs/workflow/) | 涉及脚手架维护时 |

## Subagents

项目内置 4 个 Claude Code subagent，定义在 [`.claude/agents/`](./.claude/agents/)：

| Agent | 何时使用 | 写入权限边界 |
| --- | --- | --- |
| `reverse-engineering-researcher` | 需要 AS3/提取资料证据、机制事实确认、逆向索引前置调研 | 只读；不改 `local-resources/regima/legacy-extraction/` 或项目文件 |
| `modern-implementation-engineer` | 机制事实已明确，需要实现一个现代 TypeScript/Phaser 任务或纵向切片 | 可改当前任务所需 `src/`、测试和状态文档 |
| `engineering-reviewer` | 评审实现结果、阶段成果或 `docs/评审/` 文档 | 默认只读；按 `review-protocol.md` 输出发现 |
| `workflow-steward` | 维护 AGENTS/CLAUDE、workflow 文档、任务规则、校验脚本或治理规则 | 可改脚手架文件；不把治理任务写入游戏看板 |

默认由主 agent 负责最终整合、编辑确认和收尾。subagent 优先承担只读调研、受限实现、独立评审或脚手架维护，避免多个 agent 同时改同一批状态文档。具体派发、单写者、归并和规模预算统一遵循 `docs/workflow/agent-protocol.md` 的“单 task 多 agent 协作协议”；代理数量不增加 task 工作包预算。

## 核心约束

1. 轻量请求不进入完整游戏 task 流程，不更新看板，不要求切换对话。
2. 普通正式游戏请求一次处理一个 task；task 必须属于 `feature-lines.md` 的唯一 Active 功能线。
3. 用户使用 `/goal` 时先读取 `execution-queue.md`；存在治理 `Ready`/`Blocked` 时只处理该项并停止，无可执行治理项时才执行游戏唯一 `Ready` task。游戏 task 只读取其独立定义，预计 0 次 compact，执行前核对规模预算和拆分触发，完成后交接而不连续跨 task。功能线仍严格 `WIP=1`，遇到阻塞不切线。
4. 同一正式游戏 task 未完成时优先继续当前对话；若发生第一次 compact，只完成当前检查、回写安全检查点并拆分剩余工作，不再扩张范围。
5. 不要因为只完成少量工作、仍在同一 task 的验证/修 bug/补文档阶段，就建议新开对话。
6. 正式游戏 task 或 `/goal` 收尾时，必须明确给出继续/compact/新开对话判断，以及 commit / push 建议；Git 操作只有用户明确要求时才执行。
7. 正式游戏 task 完成后必须更新相关文档并按项目规则归档。
8. 不修改 `local-resources/regima/legacy-extraction/`。
9. 视觉资源优先从 Git 忽略的 `local-resources/regima/source/restored-swfs/` 定位；旧 `local-resources/regima/legacy-extraction/` 不能作为视觉资源缺失的最终依据。
10. AS3 源码是行为参考，不是架构模板。逆向遵循 `docs/workflow/reverse-engineering-protocol.md`：从局部证据追踪共享运行时、SWF 几何和坐标语义，区分确认事实、推断、未知与现代设计选择；适用的 UI/视觉/空间事实必须生成有溯源、Schema 与完整性校验的原版机器真值 JSON，再用现代方式重写并自动回测可观察行为。
11. 执行工程评审时遵循 `docs/workflow/review-protocol.md`，输出可比较、可执行的结论。
12. 治理系统性工程问题时遵循 `docs/workflow/problem-governance.md`；代码、架构、游戏 task 或工作流变更收尾时按 `problem-audit.md` 运行 `npm run audit:problems`，正常结果集中记录一次。复发或方案不充分则回写 PG 并转入复盘；通过样本满足全部关闭条件时同次归档。
13. 试验人或 AI 提出的可重复改进方法时遵循 `docs/workflow/method-observation.md`；`MO-*` 不抢占任务，只在明确关联的真实工作中采样，并在截止点裁决采纳、修订或停止。治理型 MO 可以执行 PG 校验，同一份证据可同时作为 MO 样本与 PG 关闭样本。
14. 只有用户明确要求为具体系统设计、类化或重设计设计模式时，才读取 `docs/workflow/system-design-protocol.md`；Agent 不得自行触发。只产出一套当前方案，冻结角色、入口、扩展点、消费者、禁止路径和验收合同，并交接后续验收。
15. 具体系统设计完成后，关联实现/评审 task 必须按 `docs/workflow/system-design-acceptance-protocol.md` 重复验收，执行本批 `npm run check:system-design -- <system> <gate>`；非零退出不得记为通过。只有 `all` gate 为 0 才能同批标记 `验收状态：已完成`、`验收退出：已退出`。退出后普通任务不再读取或检查该设计模式，不扫描、不自动重开；只有用户明确要求时才重开。

## 读取约束

- 优先 `rg -n` 或小范围片段读取。
- 先判定任务类型再读取资料；轻量请求、局部评审/排错和脚手架局部讨论默认不读 `TASK_OUTLINE.md`。
- 控制无关输出、重复输出和多个大型全文聚合，不以减少工具调用次数为目标；已读且未修改的文件不重复全文读取。
- TypeScript 定义、引用、符号和诊断优先使用可用的 LSP，必要时降级为 `rg`；修改前仍须窄读目标实现与必要消费者。

## Code Quality Gates

修改 `src/` 后，不要只靠视觉测试。必须运行：

```bash
npm run test:systems
npm run build
```

在现有文件中新增逻辑前，先运行 `npm run check:structure`，确认目标文件不在 warning/error 列表中。若在列表中，必须先拆分再添加新功能。

修改 workflow/task/domain/harness 文档后，必须运行：

```bash
npm run check:workflow
npm run audit:problems
```

混合代码和工作流改动时，运行：

```bash
npm run check:all
```

完成代码任务前，确认：

- 可受击、可交互、可结算的运行时实体都有稳定 ID；
- 复杂战斗、关卡、技能、背包、存档或 AI 规则不要堆进 `src/scenes/`；
- 命中去重、刷怪、停点、输入、技能槽、状态机等规则更新时，同步更新 `tools/system-tests.ts`；
- 视觉测试通过不等于完成，必须有可自动结束的命令验证；
- 修改过的文件不触发 `npm run check:structure` 的新 warning/error。

详见 [docs/workflow/code-quality-gates.md](./docs/workflow/code-quality-gates.md)。

## 技术栈

Phaser 3 + TypeScript + Vite。`npm run dev` 由用户本地启动，Claude 默认不启动开发服务器；自动视觉验收使用用户长期批准的 `npm run preview`（固定 `0.0.0.0:4174`），并可在验收后保持运行。

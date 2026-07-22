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
| 必须 | [AGENTS.md](./AGENTS.md) | 每次对话 |
| 必须 | [TASK_OUTLINE.md](./TASK_OUTLINE.md) | 每次对话 |
| 按需 | [docs/tasks/task-board.md](./docs/tasks/task-board.md) | 执行正式游戏 task 时 |
| 按需 | [docs/tasks/feature-lines.md](./docs/tasks/feature-lines.md) | 确认唯一 Active 功能线、连续 task 和关闭合同 |
| 按需 | [docs/tasks/goal-board.md](./docs/tasks/goal-board.md) | 使用 `/goal` 时确认本次唯一 Active Goal 和 compact 预算 |
| 按需 | [docs/reverse-engineering/mechanics-index.md](./docs/reverse-engineering/mechanics-index.md) | 涉及玩法/机制时 |
| 按需 | [docs/tasks/vertical-slices.md](./docs/tasks/vertical-slices.md) | 涉及实现时 |
| 按需 | [docs/workflow/review-protocol.md](./docs/workflow/review-protocol.md) | 执行工程评审时 |
| 按需 | [docs/workflow/problem-governance.md](./docs/workflow/problem-governance.md) | 确认或治理系统性工程问题时 |
| 按需 | [docs/workflow/reverse-engineering-protocol.md](./docs/workflow/reverse-engineering-protocol.md) | 逆向原版行为或依据逆向结论实现时 |
| 按需 | [docs/workflow/](./docs/workflow/) | 涉及脚手架维护时 |

## Subagents

项目内置 4 个 Claude Code subagent，定义在 [`.claude/agents/`](./.claude/agents/)：

| Agent | 何时使用 | 写入权限边界 |
| --- | --- | --- |
| `reverse-engineering-researcher` | 需要 AS3/提取资料证据、机制事实确认、逆向索引前置调研 | 只读；不改 `local-resources/regima/legacy-extraction/` 或项目文件 |
| `modern-implementation-engineer` | 机制事实已明确，需要实现一个现代 TypeScript/Phaser 任务或纵向切片 | 可改当前任务所需 `src/`、测试和状态文档 |
| `engineering-reviewer` | 评审实现结果、阶段成果或 `docs/评审/` 文档 | 默认只读；按 `review-protocol.md` 输出发现 |
| `workflow-steward` | 维护 AGENTS/CLAUDE、workflow 文档、任务规则、校验脚本或治理规则 | 可改脚手架文件；不把治理任务写入游戏看板 |

默认由主 agent 负责最终整合、编辑确认和收尾。subagent 优先承担只读调研、受限实现、独立评审或脚手架维护，避免多个 agent 同时改同一批状态文档。

## 核心约束

1. 轻量请求不进入完整游戏 task 流程，不更新看板，不要求切换对话。
2. 普通正式游戏请求一次处理一个 task；task 必须属于 `feature-lines.md` 的唯一 Active 功能线。
3. 用户使用 `/goal` 时，一次只执行唯一 `Active` Goal；Goal 默认绑定一个 task、最多一次 compact，完成后交接而不连续跨 Goal。功能线仍严格 `WIP=1`，遇到阻塞不切线。
4. 同一正式游戏 task 未完成时优先继续当前对话；上下文过长时优先 compact，compact 后复查关键文件。
5. 不要因为只完成少量工作、仍在同一 task 的验证/修 bug/补文档阶段，就建议新开对话。
6. 正式游戏 task 或 `/goal` 收尾时，必须明确给出继续/compact/新开对话判断，以及 commit / push 建议；Git 操作只有用户明确要求时才执行。
7. 正式游戏 task 完成后必须更新相关文档并按项目规则归档。
8. 不修改 `local-resources/regima/legacy-extraction/`。
9. 视觉资源优先从 Git 忽略的 `local-resources/regima/source/restored-swfs/` 定位；旧 `local-resources/regima/legacy-extraction/` 不能作为视觉资源缺失的最终依据。
10. AS3 源码是行为参考，不是架构模板。逆向遵循 `docs/workflow/reverse-engineering-protocol.md`：从局部证据追踪共享运行时、SWF 几何和坐标语义，区分确认事实、推断、未知与现代设计选择，再用现代方式重写可观察行为。
11. 执行工程评审时遵循 `docs/workflow/review-protocol.md`，输出可比较、可执行的结论。
12. 治理系统性工程问题时遵循 `docs/workflow/problem-governance.md`，先确认问题定义、证据、方案、测试和关闭标准；代码、架构、游戏 task 或工作流变更收尾时执行问题适用性扫描，命中则回写效果样本，复发或方案不充分则退回治理。

## 读取约束

- PowerShell 读取中文/Markdown 文档时使用 `Get-Content -Encoding UTF8 -LiteralPath ...`。
- 优先 `rg -n` 或小范围片段读取；遇到乱码时不要继续推理，改用 UTF-8 重新读取。

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

Phaser 3 + TypeScript + Vite。`npm run dev` 由用户本地启动，Claude 默认不启动开发服务器。

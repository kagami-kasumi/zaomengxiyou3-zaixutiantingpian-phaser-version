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
| 按需 | [docs/reverse-engineering/mechanics-index.md](./docs/reverse-engineering/mechanics-index.md) | 涉及玩法/机制时 |
| 按需 | [docs/tasks/vertical-slices.md](./docs/tasks/vertical-slices.md) | 涉及实现时 |
| 按需 | [docs/workflow/](./docs/workflow/) | 涉及脚手架维护时 |

## 核心约束

1. 轻量请求不进入完整游戏 task 流程，不更新看板，不要求切换对话。
2. 正式游戏 task 一次对话只做一个，除非用户明确要求合并处理。
3. 用户使用 `/goal` 时，按任务文档自动推进到可交接点，不因普通阶段性进展要求用户手动“继续”。
4. 同一正式游戏 task 未完成时优先继续当前对话；上下文过长时优先 compact，compact 后复查关键文件。
5. 不要因为只完成少量工作、仍在同一 task 的验证/修 bug/补文档阶段，就建议新开对话。
6. 正式游戏 task 或 `/goal` 收尾时，必须明确给出继续/compact/新开对话判断，以及 commit / push 建议；Git 操作只有用户明确要求时才执行。
7. 正式游戏 task 完成后必须更新相关文档并按项目规则归档。
8. 不修改 `extracted_flash/`。
9. AS3 源码是行为参考，不是架构模板。保留可观察行为，用现代方式重写。

## 读取约束

- PowerShell 读取中文/Markdown 文档时使用 `Get-Content -Encoding UTF8 -LiteralPath ...`。
- 优先 `rg -n` 或小范围片段读取；遇到乱码时不要继续推理，改用 UTF-8 重新读取。

## Code Quality Gates

修改 `src/` 后，不要只靠视觉测试。必须运行：

```bash
npm run test:systems
npm run build
```

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
- 视觉测试通过不等于完成，必须有可自动结束的命令验证。

详见 [docs/workflow/code-quality-gates.md](./docs/workflow/code-quality-gates.md)。

## 技术栈

Phaser 3 + TypeScript + Vite。`npm run dev` 由用户本地启动，Claude 默认不启动开发服务器。

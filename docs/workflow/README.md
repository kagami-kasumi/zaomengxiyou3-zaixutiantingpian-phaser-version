# AI 协作脚手架

本目录维护 AI agent 在本项目中的协作协议、质量门禁和文档治理规则。它服务于游戏现代化重写，但不记录具体游戏复现任务。

## 设计目标

这套脚手架解决三个问题：

- 新 agent 如何在没有人工交接的情况下冷启动。
- 任务、逆向、实现、历史和治理文档如何保持边界清晰。
- AI 产出的文档和代码如何通过自动校验及时反馈。

核心原则是 **Map, Not Manual**：入口文件只给阅读路由和硬规则，细节按任务类型逐层打开，避免把上下文窗口浪费在无关材料上。

## 读取纪律

- 在 PowerShell 中读取中文/Markdown 文档时，必须显式使用 `Get-Content -Encoding UTF8 -LiteralPath ...`，避免 mojibake 输出污染上下文。
- 如果已经看到乱码输出，不能继续基于该输出总结或修改文档；应改用 UTF-8 重新读取。
- 优先用 `rg -n` 定位关键词，再读取命中附近的小范围片段；大型 Markdown、AS3 和历史文档不做无差别全文读入。
- 在 PowerShell 中执行 `rg` 时，中文、代码片段或含引号内容优先搜“短而窄”的固定字符串，例如 `rg -n -F -e '枯叶灵' path`，再按行号读取小范围上下文。不要手拼含转义双引号的 regex alternation，也不要把宽关键词和窄关键词混在多个 `-e` 中造成海量输出；多个 `-e` 只用于每个关键词都足够窄的情况。
- 需要硬性约束时，把入口文档中的 UTF-8 读取要求接入 `tools/validate-workflow.mjs` 或本地 agent hook，确保约束被删除时能失败。

## 文档分工

| 文档 | 职责 |
| --- | --- |
| `agent-protocol.md` | 正式游戏 task、`/goal`、代码任务、Git、对话收束和统一语言的详细协议 |
| `task-generation.md` | 从机制缺口、切片缺口或工程基础缺口生成标准游戏任务 |
| `code-quality-gates.md` | AI 修改代码时必须遵守的验证、边界和测试要求 |
| `document-map.md` | 全仓库文档职责地图，区分游戏任务层和脚手架层 |
| `governance-log.md` | 工作流、任务体系、文档职责和质量门禁的维护历史 |
| `../domain/glossary.md` | 轻量 DDD 统一语言表 |
| `../domain/ubiquitous-language-process.md` | 统一语言更新流程 |

## 冷启动路由

新对话默认只读：

1. `AGENTS.md`
2. `TASK_OUTLINE.md`

随后按任务类型补读最小集合：

- **轻量请求**：只读直接相关文件。
- **正式游戏 task**：补读 `agent-protocol.md`、`task-board.md`、`mechanics-index.md`、`vertical-slices.md`。
- **代码实现**：在正式 task 基础上补读 `docs/architecture/src-boundaries.md` 和目标源码。
- **玩法逆向**：在正式 task 基础上补读 `extracted_flash/README_extract.md` 和对应 AS3 路径。
- **脚手架维护**：补读本 README、`document-map.md` 和 `governance-log.md`。
- **历史追溯**：只有需要追溯或修改已完成任务时才读 `task-history.md`。

## 维护规则

- 游戏逆向、实现、切片和现代架构任务写入 `docs/tasks/task-board.md`。
- 已完成游戏任务从 `task-board.md` 归档到 `docs/tasks/task-history.md`。
- 工作流、任务体系、文档职责、AI 交接协议和代码质量门禁只写入 `docs/workflow/`，不新增 `TASK-DOCS-*` 到游戏任务看板。
- 脚手架维护必须在 `governance-log.md` 留下日期、变更内容、影响范围和验证结果。
- 新增核心领域命名前，先更新 `docs/domain/glossary.md` 和 `docs/domain/ubiquitous-language-process.md`。
- 同一个正式游戏 task 未完成时默认继续当前对话；上下文过长时优先 compact，并在 compact 后复查关键文档和当前改动文件。
- 只有完成 task、切换明显不同机制/切片/子系统，或已读取大量 AS3/逆向/历史资料时，才建议新开对话。
- Codex 默认不自动提交或 push；只有用户明确要求时才执行 Git 提交和上传。
- 提交前必须检查工作区，区分本次改动和已有未提交改动，不回滚用户改动。

## 验证入口

修改任务或工作流文档后运行：

```bash
npm run check:workflow
```

修改 `src/` 后运行：

```bash
npm run test:systems
npm run build
```

混合代码和工作流改动后运行：

```bash
npm run check:all
```

默认不启动 `npm run dev`。开发服务器和视觉检查由用户本地需要时手动运行。

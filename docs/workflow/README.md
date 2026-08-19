# AI 协作脚手架

本目录维护 AI agent 在本项目中的协作协议、质量门禁和文档治理规则。它服务于游戏现代化重写，但不记录具体游戏复现任务。

## 设计目标

这套脚手架解决三个问题：

- 新 agent 如何在没有人工交接的情况下冷启动。
- 任务、逆向、实现、历史和治理文档如何保持边界清晰。
- AI 产出的文档和代码如何通过自动校验及时反馈。

核心原则是 **Map, Not Manual**：入口文件只给阅读路由和硬规则，细节按任务类型逐层打开，避免把上下文窗口浪费在无关材料上。

## 读取纪律

- 优先用 `rg -n` 定位关键词，再读取命中附近的小范围片段；大型 Markdown、AS3 和历史文档不做无差别全文读入。
- 搜中文、代码或含引号内容时，优先 `rg -n -F '稳定关键词' path` 后按行号窄读；避免宽关键词、复杂 alternation 和海量输出。
- 优化目标是降低无关输出、重复输出和多个大型全文聚合，而不是减少 `Get-Content` 或工具调用次数；禁止用一次聚合全文替代数次窄读。
- 已读取且未修改的文件不重复全文读取；compact 后关键合同复核、实现证据精读或文件变化时允许重新窄读。
- TypeScript 定义、引用、符号和诊断在 LSP 可用时优先定位，结果不足或不可用时降级为 `rg`；LSP 不代替修改前对目标实现和必要消费者的精确阅读。

## 文档分工

| 文档 | 职责 |
| --- | --- |
| `agent-protocol.md` | 正式游戏 task、`/goal`、代码任务、Git、对话收束和统一语言的详细协议 |
| `../tasks/execution-queue.md` | `/goal` 第一调度入口；治理 Ready/Blocked 抢占游戏 Ready，无治理执行项时回退游戏看板 |
| `../tasks/task-board.md` | 未完成游戏 task 的轻量状态索引；只在全局执行队列无可执行治理项时提供游戏 Ready |
| `../tasks/task-definitions/TASK-*.md` | 单个未完成 task 的完整执行合同；执行时只读取当前文件 |
| `task-generation.md` | 从机制缺口、切片缺口或工程基础缺口生成标准游戏任务 |
| `code-quality-gates.md` | AI 修改代码时必须遵守的验证、边界和测试要求 |
| `review-protocol.md` | 工程评审的统一流程、严重程度、输出格式和整改落点 |
| `problem-governance.md` | 系统性工程问题的定义、验证、效果反馈、复盘换案、关闭出清与活跃/归档索引 |
| `problem-audit.md` | 任务收尾时的活跃 PG 集中扫描、单点样本记录、归档评估及 `MO-002` 试验入口 |
| `method-observation.md` | 人或 AI 提出的改进方法如何建立基线、采集真实样本并裁决采纳、修订或停止 |
| `system-design-protocol.md` | 用户手动触发的具体系统设计模式机制：单方案设计、模式规约和实施验收交接 |
| `system-design-acceptance-protocol.md` | 具体系统设计模式的重复验收机制：逐实现批次检查代码规约，系统完成后硬退出 |
| `reverse-engineering-protocol.md` | 玩法逆向的六段证据链、证据分级、原版机器真值 JSON、坐标语义、上下文交接和关闭门禁 |
| `problems/PG-*.md` | 每个已登记系统性问题的独立定义、证据、方案版本、测试结果、反馈/复盘样本和归档信息 |
| `methods/MO-*.md` | 每个实验性改进方法的假设、指标、样本、护栏、裁决和沉淀记录 |
| `document-map.md` | 全仓库文档职责地图，区分游戏任务层和脚手架层 |
| `governance-log.md` | 工作流、任务体系、文档职责和质量门禁的维护历史 |
| `../domain/glossary.md` | 轻量 DDD 统一语言表 |
| `../domain/ubiquitous-language-process.md` | 统一语言更新流程 |

## 冷启动路由

先用当前已生效的项目指令判定任务类型，再按任务类型补读最小集合。客户端已经注入 `AGENTS.md` 时视为已读，不再 shell 全文读取；未注入时才读取它。`TASK_OUTLINE.md` 只用于正式游戏 task、`/goal`、游戏任务生成/重排或路线判断。

- **轻量请求**：只读直接相关文件。
- **正式游戏 task / `/goal`**：先读 `docs/tasks/execution-queue.md`；存在治理 Ready/Blocked 时只读其 PG 合同和脚手架资料，无可执行治理项时再补读 `TASK_OUTLINE.md`、`agent-protocol.md`、`feature-lines.md`、当前线覆盖台账、`task-board.md`、当前 `task-definitions/TASK-*.md`、`mechanics-index.md`、`vertical-slices.md`。
- **代码实现**：在正式 task 基础上补读 `docs/architecture/src-boundaries.md` 和目标源码。
- **工程评审**：补读 `review-protocol.md`；涉及代码质量再读 `code-quality-gates.md`，涉及 `src/` 边界再读 `docs/architecture/src-boundaries.md`。
- **问题治理**：补读 `problem-governance.md` 和 `problem-audit.md`；若问题来自评审，再读 `review-protocol.md`，若涉及代码质量，再读 `code-quality-gates.md`。
- **方法观测**：只有当前工作明确提出、试验或命中某个 `MO-*` 时才读 `method-observation.md` 和该方法记录；不扫描全部方法。
- **具体系统设计/设计模式**：只有用户明确要求时才读 `system-design-protocol.md`、`src-boundaries.md` 和目标 `architecture/system-designs/<system>.md`；Agent 不得根据代码形态自行触发，也不扫描其他系统设计。
- **具体系统设计验收**：当前实现/评审 task 明确链接尚未 `已完成/已退出` 的具体设计时，读 `system-design-acceptance-protocol.md` 和该设计，执行 `npm run check:system-design -- <system> <gate>`；非零退出即不通过，最终 `all` 为 0 才能退出。已退出设计不再读取或自动重开。
- **行为逆向**：在正式 task 基础上补读 `reverse-engineering-protocol.md`、`local-resources/regima/legacy-extraction/README_extract.md`，从目标局部 AS3 继续追踪共享运行时消费者；疑点再交叉检查 `[25034429].swf/scripts`。
- **视觉资源逆向**：补读 `docs/reverse-engineering/evb-extraction-report.md`、`docs/reverse-engineering/asset-annotation/workflow.md` 和 `docs/reverse-engineering/ground-truth/README.md`，优先在 `local-resources/regima/source/restored-swfs/` 窄查；旧 `local-resources/regima/legacy-extraction/` 只作交叉对照。
- **脚手架维护**：补读本 README、`document-map.md` 和 `governance-log.md`。
- **历史追溯**：只有需要追溯或修改已完成任务时才读 `task-history.md`。

## 维护规则

- 游戏逆向、实现、切片和现代架构任务在 `docs/tasks/task-board.md` 维护轻量索引，完整合同分别写入 `docs/tasks/task-definitions/TASK-*.md`。
- 会抢占游戏工作的脚手架治理项在 `docs/tasks/execution-queue.md` 维护优先级和 Ready/Blocked 状态，合同仍写在对应 `docs/workflow/problems/PG-*.md`；不得复制为游戏 task。
- 完整玩家系统的范围、唯一 Active 状态和关闭证据写入 `docs/tasks/feature-lines.md` 及 `feature-line-coverage/`；严格单线 `WIP=1`。
- `/goal` 是执行命令，不是持久化实体；它一次只执行一个全局执行项。治理队列优先，无治理执行项时才执行游戏唯一 Ready task，并由对应合同的规模与拆分触发约束本次边界。
- 已完成游戏任务从 `task-board.md` 和 `task-definitions/` 归档到 `docs/tasks/task-history.md`。
- 工作流合同、文档职责、AI 交接协议和代码质量门禁写入 `docs/workflow/`，不新增 `TASK-DOCS-*` 到游戏任务看板；只有跨范围执行优先级与活跃治理指针写入 `docs/tasks/execution-queue.md`。
- 每个 `PG-*` 问题只占 `docs/workflow/problems/` 下一个独立文档；`problem-governance.md` 只维护通用协议、活跃问题索引和问题归档索引。
- 每个 `MO-*` 方法只占 `docs/workflow/methods/` 下一个独立文档；方法不进入游戏看板或执行队列，只附着在真实工作上采样并在截止点裁决。
- 用户手动触发的具体系统设计规则写入 `system-design-protocol.md`；当前设计写入 `docs/architecture/system-designs/`，只保留一套方案并冻结后续验收合同。未被用户触发时不读取或生成。
- 设计完成后的代码符合性由 `system-design-acceptance-protocol.md` 独立负责；关联 task 每批验收，只有消费者、旧路径、合同和正式运行全部闭合时才同批标记完成并退出。退出后停止设计模式专项检查，只保留普通功能与回归验证。
- 逆向结论必须按 `reverse-engineering-protocol.md` 落盘证据矩阵；适用的 UI/视觉/空间事实还必须在 `docs/reverse-engineering/ground-truth/` 生成带溯源、Schema 和完整性校验的原版机器真值 JSON。缺少共享调用链、适用的 SWF 几何/坐标语义、`verified` 真值 JSON 或双重验证时，不得宣称“权威实现输入、已闭合、已复现”。UI/HUD/菜单还必须有显示列表清单、原版视觉基准、允许的现代视觉例外和逐状态差异证据，整页真背景不等于 UI 原生化。
- 代码、架构、游戏 task 或工作流变更收尾时运行 `npm run audit:problems`，只按活跃问题索引执行适用性扫描；正常样本在 `problem-audit.md` 集中记录一次，同一证据可兼作 MO/PG 样本。复发或方案不充分时回写 PG 并转入复盘，满足全部出清门禁时同次归档。
- 脚手架维护必须在 `governance-log.md` 留下日期、变更内容、影响范围和验证结果。
- 新增核心领域命名前，先更新 `docs/domain/glossary.md` 和 `docs/domain/ubiquitous-language-process.md`。
- 同一个正式游戏 task 未完成时默认继续当前对话；第一次 compact 即视为规模超限，只完成当前检查、复查关键文件、回写安全检查点并拆分剩余 task，不继续读取新资料或新增实现。
- 只有完成 task、切换明显不同机制/切片/子系统，或已读取大量 AS3/逆向/历史资料时，才建议新开对话。
- Codex 默认不自动提交或 push；只有用户明确要求时才执行 Git 提交和上传。
- 提交前必须检查工作区，区分本次改动和已有未提交改动，不回滚用户改动。

## 验证入口

修改任务或工作流文档后运行：

```bash
npm run check:workflow
```

代码、架构、游戏 task 或工作流变更收尾时再运行：

```bash
npm run audit:problems
```

单独修改资源标注 CSV 或批次记录时可以先运行：

```bash
npm run check:annotations
```

`check:workflow` 已包含资源标注校验。

修改 `src/` 后运行：

```bash
npm run test:systems
npm run build
```

混合代码和工作流改动后运行：

```bash
npm run check:all
```

默认不启动 `npm run dev`。需要自动视觉验收时，先运行可自动结束的构建，再直接启动 `npm run preview`；该入口固定监听用户长期批准的 `0.0.0.0:4174`，供隔离的内置浏览器访问。预览服务可以跨验收保持运行，只有端口冲突、用户要求或确有必要时才停止。

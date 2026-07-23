# Agent 工作说明

本文件是协作入口，只保留高频硬规则和阅读路由。详细执行协议见 `docs/workflow/agent-protocol.md`，项目路线见 `TASK_OUTLINE.md`。

## 必须遵守

1. 需要安装复杂软件时，直接结束任务，让用户手工完成。复杂软件指需要从 GitHub 下载的软件；普通 `npm` 命令可以运行。
2. 不要修改、删除或重新生成 `local-resources/regima/legacy-extraction/` 中的原始提取结果，除非用户明确要求重新提取。
3. RegiMA 恢复语料库位于 Git 忽略的 `local-resources/regima/`。视觉资源、SymbolClass、MovieClip 和原始命名 SWF 必须优先从 `local-resources/regima/source/restored-swfs/` 窄查；`local-resources/regima/legacy-extraction/` 只作为旧 AS3、旧提取结果和历史对照，不能再作为视觉资源是否缺失的最终依据。
4. 现代实现只追求外观、玩法、数值、手感和流程尽量接近原版；AS3 源码是行为参考，不是现代架构模板。逆向必须遵循 `docs/workflow/reverse-engineering-protocol.md` 的六段证据链；证据缺环时标记推断/未知，禁止自行补成原版事实。
5. 不要一次性重构大量系统。每次任务选择一个清晰子系统或一个可玩的纵向切片。
6. 默认不启动 `npm run dev`；修改代码后优先运行可自动结束的检查命令。需要用内置浏览器做视觉验收时，可直接启动 `npm run preview`：它固定监听 `0.0.0.0:4174`，这是用户长期批准的项目级视觉验收入口；服务可在验收后保持运行，只有端口冲突、用户要求或确有必要时才停止。
7. 在现有文件中新增逻辑前，先运行 `npm run check:structure`；若目标文件触发 error，必须先拆分。若目标文件仅触发 warning，优先拆分；轻量小修可写明理由后局部修改。无关文件的 warning 不阻塞当前任务。
8. 涉及 UI、HUD、菜单、页面或按钮的逆向/实现，必须按 `docs/workflow/reverse-engineering-protocol.md` 建立显示列表清单、原版视觉基准、允许的现代视觉例外和逐状态差异证据。整页真背景、业务测试、路由可用或零 console error 不能单独证明 UI 原生化；未经用户批准不得用现代可见层替代原版已有视觉。

## 读取与编码约束

- PowerShell 读取中文/Markdown 文档必须显式使用 `Get-Content -Encoding UTF8 -LiteralPath ...`；如果输出出现乱码，立刻停止基于该输出推理，改用 UTF-8 重新读取。
- 优先用 `rg -n`、`Select-Object -First/-Skip/-Last` 或精确路径读取相关片段；不要为了找一条记录全文读入大型 Markdown、AS3 或历史文档。
- 在 PowerShell 中用 `rg` 搜中文、代码片段或含引号内容时，优先搜“短而窄”的稳定关键词，再按行号读取上下文；不要手拼包含转义双引号的正则串，不要把宽关键词和窄关键词塞进一个 `a|b|c` 或多个 `-e` 里导致海量输出。首选模板：`rg -n -F -e '枯叶灵' path`，命中后 `Get-Content -Encoding UTF8 -LiteralPath path | Select-Object -Skip <n> -First <m>`。多个 `-e` 只用于每个关键词都足够窄的情况。目标是让 `rg` 命令一次成功且输出很小。
- `task-history.md`、大型 reverse-engineering 文档和 AS3 文件默认先关键词定位，再读取命中的小范围上下文。

## 默认入口

新对话默认先读：

1. `AGENTS.md`
2. `TASK_OUTLINE.md`

随后按任务类型读取最小必读集，不要无差别读取历史文档。

## 任务分级

### 轻量请求

适用：解释问题、查配置、typo、注释、单个常量、明显小修、单文件局部问题、用户只问“为什么/是否/怎么做”。

规则：只读直接相关文件；不进完整游戏 task 流程；不更新 task-board；不归档 task-history；不推荐新开对话。修改 workflow/task/domain 文档时仍运行 `npm run check:workflow`。

### 工程评审

适用：用户要求评审代码、阶段性实现、任务结果或 `docs/评审/` 中的评审文档。

规则：按 `docs/workflow/review-protocol.md` 输出可比较、可执行的评审结论；评审本身不等于完成整改，若结论需要新增游戏复现工作，再按任务生成规则进入 task-board。

### 问题治理

适用：用户或评审提出系统性工程问题，例如跨文件重复、模块耦合、边界漂移、测试盲区、数据源分裂或生命周期规则不统一。

规则：按 `docs/workflow/problem-governance.md` 先确认问题定义、证据、解决方案、测试方案、测试结果、关闭标准和适用触发/反馈记录；局部小修不升级为问题治理，只有会持续伤害系统演进能力的结构性缺口才进入该流程。代码、架构、游戏 task 或工作流变更收尾前，必须扫描未关闭或效果观察中 `PG-*` 的触发条件；命中时回写效果样本，复发时退回治理。

### 正式游戏 task

适用：用户指定 task id、要求执行 task、玩法逆向、修改 `src/` 实现玩法、生成/拆分/重排游戏任务、完成一个可交接切片。

规则：按阅读分流补齐必读文档；普通执行一次只处理一个 task，`/goal` 一次只处理 `docs/tasks/goal-board.md` 的唯一 `Active` Goal 包；Goal 默认只绑定一个 task，最多承受一次上下文压缩。功能线仍保持唯一 `Active` 并跨 Goal 连续；任务完成必须留下可交接产物，并更新 Goal、功能线、覆盖台账和 task 状态。详细流程见 `docs/workflow/agent-protocol.md`。

用户使用 `/goal` 时，先恢复唯一 `Active` 功能线，再只执行 `goal-board.md` 的唯一 `Active` Goal。Goal 完成后激活同线下一 Goal 并结束当次 `/goal`，不在同一次请求中连续跨 Goal；遇到阻塞仍只治理本线阻塞，不切换系统。第一次 compact 后禁止扩展范围，预计需要第二次时必须在安全检查点拆分并交接。收尾必须明确给出下一 Goal、Git 提交/上传建议和对话管理建议。

### 脚手架维护

适用：修改 AI 工作流、任务体系、文档职责、AGENTS/CLAUDE 入口、校验脚本或治理规则。

规则：读 `docs/workflow/README.md`、`docs/workflow/document-map.md` 和相关 workflow 文档；更新 `docs/workflow/governance-log.md`；运行 `npm run check:workflow`；不新增 `TASK-DOCS-*` 到游戏任务看板。

## 冷启动阅读分流

| 任务类型 | 额外必读文档 |
| --- | --- |
| 轻量请求：解释、typo、注释、单个常量、明显配置、小范围排错 | 无。只在改动涉及具体系统时再读相关文件。 |
| 游戏任务执行：用户指定 task 或使用 `/goal` | `docs/workflow/agent-protocol.md`、`docs/tasks/feature-lines.md`、`docs/tasks/goal-board.md`、当前线覆盖台账、`docs/tasks/task-board.md`、`docs/reverse-engineering/mechanics-index.md`、`docs/tasks/vertical-slices.md` |
| 玩法逆向：AS3、调用链、行为合同 | 游戏任务执行必读集 + `docs/workflow/reverse-engineering-protocol.md` + `local-resources/regima/legacy-extraction/README_extract.md` + 对应局部与共享 AS3 路径；视觉/空间结论还必须补 SWF 几何和坐标语义 |
| 视觉资源逆向：symbol、位图、时间轴、资源族 | 游戏任务执行必读集 + `docs/reverse-engineering/evb-extraction-report.md` + `docs/reverse-engineering/asset-annotation/workflow.md` + `local-resources/regima/source/restored-swfs/` 中的目标源包；旧 `local-resources/regima/legacy-extraction/` 仅作交叉对照 |
| 代码实现：修改 `src/` | 游戏任务执行必读集 + `docs/architecture/src-boundaries.md` + 对应 `src/` 文件 |
| 工程评审：评审代码、阶段成果或评审文档 | `docs/workflow/review-protocol.md`，涉及代码质量再读 `docs/workflow/code-quality-gates.md`，涉及 `src/` 边界再读 `docs/architecture/src-boundaries.md` |
| 问题治理：确认或治理系统性工程问题 | `docs/workflow/problem-governance.md`；若问题来自评审，再读 `docs/workflow/review-protocol.md`；若涉及代码质量，再读 `docs/workflow/code-quality-gates.md` |
| 新增核心领域命名、系统、实体、类型或数据模型 | `docs/domain/glossary.md`、`docs/domain/ubiquitous-language-process.md` |
| 新增/拆分/重排游戏任务 | `docs/workflow/task-generation.md`、`docs/tasks/feature-lines.md`、当前线覆盖台账、`docs/tasks/task-board.md`、`docs/reverse-engineering/mechanics-index.md`、`docs/tasks/vertical-slices.md` |
| AI 工作流、任务体系、文档职责或脚手架维护 | `docs/workflow/README.md`、`docs/workflow/document-map.md`、`docs/workflow/governance-log.md` |
| 追溯历史、修改已完成任务、处理历史依赖 | `docs/tasks/task-history.md` |

默认不要读取 `docs/tasks/task-history.md`。只有用户要求追溯历史、当前任务需要修改已完成任务、或需要确认历史决策时才读取。

## 对话收束

- 轻量请求完成后直接给结果，不建议新开对话。
- 同一个正式游戏 task 未完成时，默认继续当前对话；上下文过长时优先 compact，compact 后复查关键文档和当前改动文件。
- 不要因为只完成少量工作、仍在同一 task 的验证/修 bug/补文档阶段，就建议新开对话。
- 只有完成 task、切换明显不同机制/切片/子系统，或已阅读大量 AS3/逆向/历史资料时，才在文档收尾后温和建议新开对话。
- 正式 task 或 `/goal` 收尾时必须明确告诉用户：是否建议继续当前对话、compact 或新开对话；是否建议 commit；已提交后是否建议 push。Git 操作只有用户明确要求时才执行。

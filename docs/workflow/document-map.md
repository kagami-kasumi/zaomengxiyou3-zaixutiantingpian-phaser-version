# 文档职责地图

本文说明各类文档的边界，避免游戏复现任务和 AI 工作流脚手架混在一起。

## 游戏复现层

- `TASK_OUTLINE.md`
  - 项目战略导航。
  - 维护目标、路线、阶段和任务类型。
  - 不维护具体任务状态。
- `docs/tasks/task-board.md`
  - 游戏任务看板。
  - 只维护未完成的游戏逆向、现代架构、纵向切片、资源和实现 task；每个 task 必须属于一个功能条线。
  - 不记录 AI 工作流治理任务。
- `docs/tasks/feature-lines.md`
  - 完整玩家系统的范围、唯一 Active 条线、当前 task、阻塞和关闭证据的权威台账。
  - 严格单线 `WIP=1`；task/切片完成不能隐式关闭功能线。
- `docs/tasks/feature-line-coverage/LINE-*.md`
  - 单条功能线的权威内容全集、覆盖矩阵、缺口和关闭检查。
  - 为连续 task 生成提供输入，不代替 task-board 的执行状态。
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
  - 按逆向证据协议记录 AS3/共享调用链、SWF 几何、行为合同、证据等级、未知项和现代实现建议。
- `docs/reverse-engineering/asset-annotation/`
  - 资源标注工程目录。
  - 维护 AS3/stableKey 到 EVB 源 SWF、选择性导出物和现代接入状态的分阶段台账，以及人工/Agent 边界、批次记录和拆分策略。
  - `asset-annotation-and-splitting-plan.md` 仅作为旧链接的兼容入口。
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
- `.claude/agents/`
  - Claude Code subagent 定义目录。
  - 维护 `reverse-engineering-researcher`、`modern-implementation-engineer`、`engineering-reviewer` 和 `workflow-steward` 的职责、读取路线、写入边界和输出格式。
  - 不记录具体游戏任务状态。
- `docs/workflow/task-generation.md`
  - 标准游戏任务生成规范。
  - 说明如何从机制缺口、切片缺口或工程基础缺口生成任务。
- `docs/workflow/agent-protocol.md`
  - Agent 详细执行协议。
  - 维护正式游戏 task、`/goal` 管理、代码任务、Git、对话收束、任务生成和统一语言的细则，避免 `AGENTS.md` 过长。
- `docs/workflow/code-quality-gates.md`
  - AI 代码质量门禁。
  - 规定自动验证、系统测试触发条件、结构性门禁（文件大小上限、代码重复、scene 耦合度）、场景层边界和 Git 工作要求。
- `docs/workflow/review-protocol.md`
  - 工程评审协议。
  - 规定评审适用范围、必读资料、流程、严重程度、输出格式、评分维度和整改落点。
- `docs/workflow/problem-governance.md`
  - 问题治理协议。
  - 规定系统性工程问题的定义、治理流程、效果反馈闭环、记录结构和索引，不堆叠具体问题正文。
- `docs/workflow/reverse-engineering-protocol.md`
  - 玩法逆向证据协议。
  - 规定局部证据、共享运行时、SWF 几何/坐标语义、可观察合同、现代映射和双重验证的六段证据链，以及证据分级和关闭用语门禁。
- `docs/workflow/problems/PG-*.md`
  - 独立问题治理记录。
  - 一个问题一个文档，分别维护问题定义、证据、解决方案、测试方案、测试结果、关闭标准、适用触发和反馈样本。
- `docs/workflow/governance-log.md`
  - 工作流脚手架维护日志。
  - 记录任务体系、文档职责、AI 交接协议和代码质量门禁等变化。
- `docs/workflow/document-map.md`
  - 本文件。
  - 维护各文档职责边界。

## 资源和提取层

- `docs/reverse-engineering/evb-extraction-report.md`
  - EVB 原始目录恢复、176-byte SWF 还原、哈希清单和 FFDec 验证报告。
  - RegiMA 恢复目录位于 Git 忽略的 `local-resources/regima/`；现代工程按资源族选择性导出和接入。
- `local-resources/regima/`
  - 本机 RegiMA 资源根，整目录由 `.gitignore` 排除。
  - `source/unpacked/` 保存 EVB 原始文件系统，`local-resources/regima/source/restored-swfs/` 保存可解析的原始命名 SWF，`manifests/` 保存哈希与审计清单，`validation/` 和 `task-outputs/` 保存本地派生产物。
  - 视觉资源任务优先读取这里；不得把整个目录提交或批量复制到 `public/assets`。
- `local-resources/regima/legacy-extraction/README_extract.md`
  - 提取结果说明。
  - 只读旧提取参考；行为脚本仍可使用，但不能作为视觉源包是否缺失的最终依据。
- `local-resources/regima/legacy-extraction/resources_by_swf/`
  - 二次抽取后的逐 SWF 核心资源目录。
  - AS3、图片、shape、SymbolClass 和声音容器均从对应 `[...].swf/` 子目录读取。
- `local-resources/regima/legacy-extraction/reports/EXTRACTION_REPORT.md`
  - `再续天庭1.1.exe` 二次抽取与校验报告。
  - 记录资源可用性、坏图、声音导出结论和后续资源边界。
- `docs/reverse-engineering/reference/equipment-spreadsheet.md`
  - 1.0 装备属性、合成、宝石和掉落工作簿的使用说明。
  - 规定该工作簿只能作为 1.1 AS3 逆向的辅助索引和交叉校验资料。
- `docs/reverse-engineering/reference/equipment-spreadsheet/`
  - 从 1.0 工作簿拆分出的 CSV 小文件。
  - 供装备、合成、宝石和掉落任务按需读取，避免每次解析完整 xlsx。
- `docs/reverse-engineering/reference/再续1.0装备属性合成掉落表.xlsx`
  - 1.0 装备资料工作簿。
  - 只读参考；现代实现数据必须先经 AS3 校验。
- `docs/FFDEC_EXTRACTION_GUIDE.md`
  - FFDec 提取资料维护说明。
  - 记录现有提取结果的维护边界。

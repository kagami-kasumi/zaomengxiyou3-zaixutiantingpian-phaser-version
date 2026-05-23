# Agent 工作说明

## 必须遵守

1. 需要安装复杂软件时，直接结束任务，让用户手工完成。复杂软件指需要从github上下载的软件，通过命令可以跑的，如npm命令可以运行。
2. 不要修改、删除或重新生成 `extracted_flash/` 中的原始提取结果，除非用户明确要求重新提取。
3. 后续代码实现应以现代重写为目标，不追求继续维护 Flash 工程。
4. 不要一次性重构大量系统。每次任务应选择一个清晰子系统或一个可玩的纵向切片。
5. 只追求外观、玩法、数值、手感和流程尽量接近原版，不追求代码结构一致。AS3 源码是行为参考，不是现代架构模板；遇到原版内存浪费、全局状态混乱、重复创建对象、Flash 时间轴耦合等技术债时，应保留可观察行为，用现代方式重写。

## 当前项目目标

本项目是基于现有 Flash 游戏提取资料，用现代技术重写一个功能和体验尽量一致的版本。

已完成阶段：

- 已使用 FFDec 提取 SWF 候选。
- 已导出 ActionScript 源码、图片资源、SymbolClass 映射等资料。
- 提取结果说明见 `extracted_flash/README_extract.md`。

下一阶段：

- 从 `extracted_flash/scripts/172845/scripts` 阅读和迁移核心逻辑。
- 先把玩法设定扒清楚，尤其是单人/双人、按键、角色动作、关卡流程、怪物、装备、背包、存档等系统边界。
- 在玩法事实明确后，再做可玩的最小战斗切片。

## 主要参考目录

- `extracted_flash/scripts/172845/scripts`: 主参考源码，优先读取。
- `extracted_flash/scripts/25034429/scripts`: 备用参考源码，和主包高度相似，遇到缺失或疑似差异时再对照。
- `extracted_flash/resources`: 已导出的图片、声音、SymbolClass 等资源。
- `gameData`: 原游戏存档样本，可用于理解存档结构和数据字段。
- `再续1.0装备属性合成掉落表.xlsx`: 装备、属性、合成、掉落资料表。

## 推荐实现路线

默认技术路线建议为 Phaser 3 + TypeScript。原因：

- 原游戏是 Flash 2D 游戏，Phaser 的显示对象、动画、场景、输入和资源加载模型更接近。
- 更适合逐步迁移 AS3 逻辑。
- 易于在浏览器中快速调试，也可后续用 Electron 或 Tauri 打包桌面版。

如用户明确要求 Unity，再切换路线。

## 工作方式

### 冷启动阅读分流

默认先读本文件 `AGENTS.md` 和 `TASK_OUTLINE.md`。随后按任务类型选择最小必读集，不要无差别读取全部历史文档。

| 任务类型 | 额外必读文档 |
| --- | --- |
| 小修小改：typo、注释、单个常量、明显配置 | 无。只在改动涉及具体系统时再读相关文件。 |
| 游戏任务执行：用户指定或要求执行 task | `docs/tasks/task-board.md`、`docs/reverse-engineering/mechanics-index.md`、`docs/tasks/vertical-slices.md` |
| 玩法逆向：阅读 AS3、建立索引 | 上一行 + `extracted_flash/README_extract.md` + 对应 AS3 路径 |
| 代码实现：修改 `src/` | 游戏任务执行必读集 + `docs/architecture/src-boundaries.md` + 对应 `src/` 文件 |
| 新增核心领域命名、系统、实体、类型或数据模型 | `docs/domain/glossary.md`、`docs/domain/ubiquitous-language-process.md` |
| 新增/拆分/重排游戏任务 | `docs/workflow/task-generation.md`、`docs/tasks/task-board.md`、`docs/reverse-engineering/mechanics-index.md`、`docs/tasks/vertical-slices.md` |
| AI 工作流、任务体系、文档职责或脚手架维护 | `docs/workflow/README.md`、`docs/workflow/document-map.md`、`docs/workflow/governance-log.md` |
| 追溯历史、修改已完成任务、处理历史依赖 | `docs/tasks/task-history.md` |

默认不要读取 `docs/tasks/task-history.md`。只有用户要求追溯历史、当前任务需要修改已完成任务、或需要确认历史决策时才读取。

做代码任务时应遵循：

- 先定位对应 AS3 参考类，再实现现代版本。
- 遵循 `docs/architecture/src-boundaries.md` 的模块边界和 TypeScript/Phaser 参数约定。
- 遵循 `docs/domain/glossary.md` 的统一语言；新增核心领域命名前先按 `docs/domain/ubiquitous-language-process.md` 更新词汇表。
- 记录关键映射关系，例如 AS3 类名对应的新 TypeScript 文件。
- 不照搬 AS3 的坏结构。优先使用清晰模块边界、显式数据模型、资源复用、对象池、有限状态机和可测试的系统函数。
- 任务选择、任务拆分、收尾更新和推荐后续任务，统一遵循下方“跨对话任务工作流”。
- 实现任务开始前检查 `docs/tasks/vertical-slices.md` 中对应切片依赖是否满足；依赖机制未确认时，先做逆向任务。
- 保持小步提交式改动，一个任务只完成一个明确目标。
- 能验证就运行验证，不能验证要说明原因。
- 默认不启动 `npm run dev`；开发服务器由用户每次打开项目时自行运行，视觉效果由用户手工查看。Codex 修改代码后仍应优先运行可自动结束的编译/检查命令（如 `npm run build` 或更小范围检查）来发现新增代码的编译错误；用户在 `npm run dev` 中看到的编译或运行报错，可直接上报给 Codex 作为修复输入。

## 跨对话任务工作流

本项目依靠文档维护跨对话记忆。每个新对话都应能独立接手一个任务、完成它、更新文档，并推荐下一个任务。

新对话启动规则：

1. 先读 `AGENTS.md`、`TASK_OUTLINE.md`、`docs/tasks/task-board.md`、`docs/reverse-engineering/mechanics-index.md`、`docs/tasks/vertical-slices.md`、`extracted_flash/README_extract.md`。
2. 如果用户指定了 task id，只执行该 task。
3. 如果用户没有指定 task id，从 `docs/tasks/task-board.md` 中选择一个 `Ready` 任务；优先选择看板“当前推荐”中的任务。
4. 一次对话只完成一个 task。不要在同一轮顺手做下一个任务。
5. 开始执行前，确认该 task 有独立的“完成定义”。如果没有，先按 `docs/workflow/task-generation.md` 在 `task-board.md` 为它补齐完成定义，再执行。
6. 如果任务实际过大，不硬做完；按 `docs/workflow/task-generation.md` 把原任务标为 `Split`，拆出更小子任务，只完成其中一个可验收子任务。
7. 任务结束时必须更新 `task-board.md` 的状态和推荐后续任务。
8. 如果任务完成，把该任务从 `task-board.md` 移到 `docs/tasks/task-history.md`，并在历史中记录完成内容、产物和必要验证。
9. 逆向任务还必须同步更新 `docs/reverse-engineering/mechanics-index.md`。
10. 实现任务还必须同步更新 `docs/tasks/vertical-slices.md`，并更新 `mechanics-index.md` 的复现状态。

每个 task 的完成定义必须写在 `task-board.md`，并尽量包含：

- 本任务要解决什么问题。
- 必须读取哪些文档或 AS3 路径。
- 必须产出或更新哪些文件。
- 明确的验收标准。
- 禁止顺手扩展的范围。
- 完成后应推荐哪个后续任务。

任务完成不等于“读过一些代码”。必须留下可交接的文档、代码、状态更新或验证结果，让下一个新对话不用依赖上一段聊天上下文。

## 对话管理规则

一个对话默认只执行一个 task。完成当前 task 后，不要自动继续执行下一个 task，除非用户明确要求。

出现以下情况时，应主动收束并建议用户新开对话：

- 当前 task 已完成，后续 task 需要读取新的大批资料。
- 已经阅读大量 AS3、逆向文档或历史记录。
- 对话开始依赖很多早先上下文，而不是依赖已更新文档。
- 需要从逆向切换到实现，或从实现切换到另一个大系统。
- 发现自己准备“顺手再做下一个 task”。

建议新开对话前，必须先完成当前 task 的文档收尾：

- 更新 `task-board.md` 或把完成任务归档到 `task-history.md`。
- 同步更新相关 `mechanics-index.md`、`vertical-slices.md` 或逆向文档。
- 运行必要验证；脚手架/任务文档变化后运行 `npm run check:workflow`。

收束回复应包含：

- 已完成或正在暂停的 task id。
- 更新了哪些文件。
- 剩余风险或未决问题。
- 推荐下一个 task id。
- 建议的新对话开场 prompt。

## 任务生成规则

当用户要求新增游戏任务、拆分游戏任务、重排游戏任务或从机制生成任务时，必须先读 `docs/workflow/task-generation.md`。

新任务必须来自以下来源之一：

- `mechanics-index.md` 中的机制缺口。
- `vertical-slices.md` 中的切片缺口。
- 现代工程基础设施缺口。

新任务必须写入 `task-board.md`，并包含目标机制/切片、输入资料、输出产物、完成定义、验收标准、禁止范围、状态更新和推荐后续任务。

已完成任务不保留在 `task-board.md`，应归档到 `docs/tasks/task-history.md`。

## 脚手架维护规则

AI 工作流、任务体系、文档职责、任务生成规范等脚手架维护，不作为游戏任务写入 `docs/tasks/task-board.md`。

脚手架维护时：

- 读取 `docs/workflow/README.md` 和 `docs/workflow/document-map.md`。
- 直接更新相关工作流文档。
- 在 `docs/workflow/governance-log.md` 记录日期、变更内容和影响范围。
- 修改任务/工作流文档后，运行 `npm run check:workflow` 校验一致性；如果无法运行，要说明原因。
- 脚手架维护只要求可终止的校验命令；不要求启动 `npm run dev`，视觉确认由用户承担。
- 不新增 `TASK-DOCS-*` 到游戏任务看板。

## 统一语言规则

本项目采用轻量 DDD：只执行统一语言、上下文边界和命名约束，不引入完整 DDD 架构。

- 领域概念以 `docs/domain/glossary.md` 为准。
- 统一语言更新流程以 `docs/domain/ubiquitous-language-process.md` 为准。
- 同一个领域概念只能有一个推荐代码名。
- AS3 原名可以作为证据记录，但现代代码优先使用推荐代码名。
- 修改领域词汇表后运行 `npm run check:workflow`。

## 优先级

1. 玩法设定逆向：单人/双人、按键、角色动作、技能、关卡、怪物、装备、背包、存档。
2. 资源索引和加载策略。
3. 现代架构修正：双玩家输入、薄上下文、实体管理、系统更新顺序。
4. 最小战斗切片：一个角色、一个怪物、一个场景、移动、攻击、受击、死亡。
5. 技能、子弹、碰撞、怪物 AI。
6. 装备、背包、掉落、合成。
7. 存档读取和写入。
8. 多角色、多地图、多 boss。
9. UI、音效、打包和体验校准。

## 注意事项

- 反编译源码可能存在乱码类名或 FFDec 反编译错误。遇到可疑逻辑时，优先查看 P-code、相邻类、运行表现或备用 SWF 包。
- `extracted_flash/ffdec_extract_all` 中有不少误命中 SWF，不要把所有 SWF 都当作有效源码。
- 主参考源码以 `[172845].swf` 的导出目录为准。
- 任何“完全一致”的目标都需要用户通过原版游戏录屏或实测协助校准。

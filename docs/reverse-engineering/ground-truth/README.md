# 原版机器真值 JSON

本目录保存从原始 SWF、AS3 调用链和可追溯运行态中提取的、可由程序直接消费的原版真值。它是逆向证据矩阵与现代实现之间的结构化交接物，不是对逆向结论的人工改写。

## 目录边界

- `schema/ui-ground-truth.schema.json`：UI、HUD、菜单、页面、按钮及其他视觉/空间对象的规范结构。
- `manifests/<task-or-scope>.json`：经 Schema 校验、可供实现和测试消费的版本化真值；实际产生后才创建。
- `local-resources/regima/task-outputs/<task-id>/`：FFDec XML、原始导出、运行截图和中间计算结果；该目录由 Git 忽略，不得反向写入 `legacy-extraction/`。

真值 JSON 可以引用本地一手证据路径，但必须同时保存源文件哈希和精确 locator，使换机器或重新提取时可以确认是同一份原版输入。二进制截图和大体积导出不内嵌到 JSON。

## 生成流程

1. **冻结范围**：声明原版版本、入口、舞台尺寸、目标 Symbol/MovieClip、状态集和固定测试数据。
2. **锁定一手来源**：优先从 `local-resources/regima/source/restored-swfs/` 选择源 SWF，记录 SHA-256、SymbolClass/character id、帧号和 AS3 动态写入路径；旧提取结果只作交叉对照。
3. **提取原始事实**：用可重复的工具命令导出显示列表、时间轴、局部矩阵、注册点、可见边界、按钮状态、TextField、mask/filter 和动态 child。不得手工目测补坐标。
4. **归一化坐标**：保留原 local matrix，再计算嵌套后的 stage bounds；明确 Flash 注册点、导出素材原点和 CSS/Canvas 左上角之间的转换。
5. **枚举状态**：为 normal/hover/pressed/selected、分页、动态内容、P1/P2、进入/退出等适用状态建立状态 id、fixture 和原版基准图引用。
6. **序列化与溯源**：按 Schema 生成 JSON；每个对象保留原始身份、父子/depth、逐状态布置和证据引用。计算值必须声明推导方法，不得伪装成直接提取值。
7. **Schema 与完整性校验**：校验 JSON 结构、状态引用、对象计数、父子链、深度、基准图尺寸和未解项。影响实现的 `unresolved` 非空时只能保持 `draft`/`blocked`。
8. **交叉确认**：高风险坐标、时序和视觉结论至少用两类独立证据核对；显示列表和状态集完整匹配后才可标记 `verified`。
9. **自动消费与回测**：TS/CSS/Canvas 可直接读取或由构建脚本编译该 JSON；测试将现代 DOM/Canvas 测量结果换算回原舞台坐标，并逐对象、逐状态与真值及基准图比较。

## 权威性规则

- `draft`：结构可用，但仍有未闭合证据或完整性缺口，不能作为无阻塞实现输入。
- `blocked`：缺少原 SWF、运行基准、动态写入路径或其他必要一手证据。
- `verified`：Schema、溯源、显示列表/状态完整性与交叉确认全部通过，影响实现的未解项为零。

证据矩阵必须引用 `truthId`、JSON 路径和关键 JSON Pointer。如果现代实现需要转换真值，转换公式和测试必须落盘；不得在文档、TS 和 CSS 中分别维护三份手抄坐标。

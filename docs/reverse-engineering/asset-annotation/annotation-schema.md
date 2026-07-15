# 标注数据规范

标注表使用 UTF-8 CSV，每个资源族一份文件，放在 `annotations/`。CSV 是可查询记录，批次 Markdown 负责解释过程和人工审阅，不要把长篇分析塞进单元格。

## 字段

| 字段 | 必填 | 规则 |
| --- | --- | --- |
| `stableKey` | 是 | 现代工程稳定 key；尚未确定时填候选 key，并将 `confidence` 设为 `unknown`。 |
| `as3Name` | 否 | AS3 运行时资源名；多个紧密组成一个资源时用 `;` 分隔。 |
| `sourceKind` | 是 | 见下方枚举。 |
| `sourcePath` | 条件必填 | `confirmed` / `probable` 必须有仓库相对路径或 `human:<evidence-id>`。多个路径用 `;` 分隔。 |
| `sourcePackage` | 否 | 已定位时填写 EVB 虚拟路径，如 `assets/WuKong.swf`；多个候选用 `;` 分隔。不得因为包名相似而猜填。 |
| `symbolId` | 否 | Flash character id；不确定时留空，禁止猜数字。 |
| `scope` | 是 | `hero`、`monster`、`projectile`、`effect`、`ui`、`scene`、`audio`。 |
| `usage` | 是 | 简短、可观察的用途，例如“Role1 第一段普攻附属对象”。 |
| `status` | 是 | 见下方状态枚举。 |
| `confidence` | 是 | `confirmed`、`probable`、`unknown`。 |
| `nextAction` | 是 | 见工作流中的去向枚举。 |
| `note` | 否 | 只记录关键歧义、缺失条件或拒绝原因。 |

推荐表头：

```csv
stableKey,as3Name,sourceKind,sourcePath,sourcePackage,symbolId,scope,usage,status,confidence,nextAction,note
```

## `sourceKind`

- `script-reference`：AS3 创建、查询或引用资源名。
- `symbol-class`：`symbols.csv` 或等价符号映射。
- `image`：当前工作区内的可用图片。
- `svg-shape`：FFDec 已导出的 shape。
- `frame-capture`：原版截图或录屏帧。
- `manual`：人工给出的判断或手工制作资源。
- `restored-swf`：EVB 新恢复 SWF 中的直接符号、时间轴或导出证据。

若同一条有多种证据，填写最直接的来源类型，其他证据保留在 `sourcePath` 和批次记录中。

## `status`

- `ready`：现代工程可直接使用的真素材已存在。
- `source-corpus-ready`：EVB 源 SWF 语料库已恢复，但本条目的精确源包/符号尚未定位。
- `export-ready`：精确源 SWF 和符号已确认，可以做选择性导出。
- `derived-ready`：`local-resources/regima/task-outputs/` 中的派生图片、SVG、序列或 atlas 已生成并验收，尚未注册到现代工程。
- `placeholder`：有可运行的现代占位，但不代表原版素材。
- `missing-original`：查过恢复语料库后仍确认源文件不存在，或 EVB 提取确有缺失；不能再用来表示“尚未导出”。
- `needs-annotation`：文件存在，但含义或映射尚未确认。
- `needs-splitting`：已通过拆分必要性判定，等待选择性拆分。
- `rejected`：候选经证据确认不属于该资源或不可用。

状态和可信度描述不同维度。例如“AS3 名称已确认，EVB 语料库可用，但尚未定位精确符号”应写：

```text
status = source-corpus-ready
confidence = confirmed
nextAction = locate-symbol
```

## 可信度证据门槛

- `confirmed`：有直接代码/符号映射，或人工通过原版画面明确确认。
- `probable`：至少两条相互独立线索一致，但仍缺直接映射或视觉确认。
- `unknown`：只有单条弱线索、候选冲突，或当前无证据。

文件名相似、序号相邻、视觉颜色接近都不能单独支持 `confirmed`。

## 示例

```csv
stableKey,as3Name,sourceKind,sourcePath,sourcePackage,symbolId,scope,usage,status,confidence,nextAction,note
normal-attack-effect.hero1.hit1,Role1Bullet1,script-reference,local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts/export/hero/Role1.as,,,effect,Role1 第一段普攻附属对象,source-corpus-ready,confirmed,locate-symbol,EVB 语料库已恢复；下一步定位精确包和 MovieClip
```

示例表达的是“语义映射已标注，源语料库已取得，符号级定位尚未完成”，不是缺少来源。

## 文件命名和审阅

- 文件名按窄资源族命名，如 `role1-normal-attack.csv`、`monster30.csv`。
- 一行对应一个现代可独立引用的资源或紧密动作单元。
- stableKey 必须唯一；更新状态时修改原行，不追加冲突副本。
- 批次关闭前，Agent 检查表头、枚举、路径存在性和 stableKey 重复。
- 人工审阅 CSV 时只需关注 `probable`、`unknown`、`review-candidate` 和 `evaluate-splitting` 条目。

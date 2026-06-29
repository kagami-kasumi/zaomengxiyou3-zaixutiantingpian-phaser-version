# 1.0 装备资料表使用说明

本文说明 `再续1.0装备属性合成掉落表.xlsx` 在逆向任务中的用途和边界。

## 文件位置

- `docs/reverse-engineering/reference/再续1.0装备属性合成掉落表.xlsx`
- `docs/reverse-engineering/reference/equipment-spreadsheet/`

原始工作簿保留为只读备份；日常逆向优先读取拆分后的 CSV 小文件。

## 表格内容

工作簿包含四个 sheet：

| CSV | 来源 sheet | 用途 |
| --- | --- | --- |
| `docs/reverse-engineering/reference/equipment-spreadsheet/equipment-attributes.csv` | `装备属性` | 装备名、职业、品质、基础属性、浮动区间、强化增加属性和描述。 |
| `docs/reverse-engineering/reference/equipment-spreadsheet/crafting-recipes.csv` | `合成` | 三件材料合成一个成品的配方线索。 |
| `docs/reverse-engineering/reference/equipment-spreadsheet/gem-attributes.csv` | `宝石属性` | 宝石等级、属性类型和数值区间。 |
| `docs/reverse-engineering/reference/equipment-spreadsheet/drop-reference.csv` | `掉落` | BOSS、副本和掉落物线索。 |

## 逆向使用规则

这份表来自 1.0 资料，当前游戏目标是 1.1 版本复现。Agent 使用它时必须遵守：

1. 表格是辅助索引和交叉校验资料，不是 1.1 权威数据源。
2. 装备、合成、强化、掉落等最终事实以 `extracted_flash/resources_by_swf/[172845].swf/scripts` 中的 AS3 代码为准。
3. 如果表格和 AS3 冲突，在对应逆向笔记中记录为版本差异，并优先采用 AS3。
4. 不要把表格内容直接转成现代实现数据；先用表格关键词定位 AS3，再确认字段含义、随机区间、概率和条件。
5. 不要修改原始工作簿或拆分 CSV；需要结构化结果时，在新的逆向笔记或现代配置文件中记录经 AS3 验证后的数据。

## 推荐流程

装备、合成、宝石或掉落任务可以按以下顺序使用：

1. 先从对应 CSV 提取候选名称、配方、属性字段或掉落关系。
2. 用候选中文名、`fillName` 线索或 BOSS 名在 AS3 中精确搜索。
3. 读取命中附近的小范围代码，确认构造参数、概率、条件分支和版本差异。
4. 将已确认事实写入对应逆向笔记，例如 `equipment-index.md`、`drops-index.md` 或合成系统笔记。
5. 现代实现只消费已确认的逆向结果，不直接消费 1.0 表格。

## 适合加速的任务

- 补全装备中文名、属性字段和强化字段。
- 定位合成配方入口，例如 `export/strength/` 下的制作、融合、强化和分解逻辑。
- 为掉落表扫描提供 BOSS/副本/掉落物关键词。
- 作为系统测试样本来源，但测试样本仍需先经过 AS3 校验。



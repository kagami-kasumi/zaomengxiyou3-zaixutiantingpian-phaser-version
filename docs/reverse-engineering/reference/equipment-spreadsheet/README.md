# 1.0 装备资料表拆分索引

本目录从 `../再续1.0装备属性合成掉落表.xlsx` 拆分而来，供 agent 按任务读取小文件。

## 文件用途

| 文件 | 来源 sheet | 用途 |
| --- | --- | --- |
| `equipment-attributes.csv` | `装备属性` | 装备中文名、职业、品质、属性区间、强化增加属性和描述的候选索引。 |
| `crafting-recipes.csv` | `合成` | 合成材料和成品的候选索引，用于定位 `export/strength/` 中的 1.1 合成逻辑。 |
| `gem-attributes.csv` | `宝石属性` | 宝石等级、属性类型和数值区间的候选索引，用于定位宝石/强化相关 AS3。 |
| `drop-reference.csv` | `掉落` | BOSS、副本和掉落物中文名的候选索引，用于辅助怪物掉落表和关卡事实校验。 |

## 读取规则

- 这些 CSV 是 1.0 资料拆分件，只能作为 1.1 AS3 逆向的辅助索引和交叉校验资料。
- 最终事实以 `extracted_flash/scripts/172845/scripts` 中的 AS3 为准。
- `equipment-attributes.csv` 第一行保留原 sheet 注释，第二行才是字段头。
- PowerShell 读取时使用 `Get-Content -Encoding UTF8 -LiteralPath ...`。
- 优先用 `rg -n "关键词" docs/reverse-engineering/reference/equipment-spreadsheet/*.csv` 定位，再读取小范围上下文。

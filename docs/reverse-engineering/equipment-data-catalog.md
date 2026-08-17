# 原版 1.1 全可穿戴装备数据全集

本文是 `TASK-SETTINGS-170A` 的证据与消费合同。机器可消费事实位于
`reference/equipment-data-catalog-1.1.json`，结构约束位于
`reference/equipment-data-catalog.schema.json`，可重复生成与校验入口为
`npm run generate:equipment-data-catalog` 和
`npm run test:equipment-data-catalog`。

## 待证明的可观察问题

1. 原版 1.1 的 431 项可入包身份中，哪些是 `zblist` 的 164 件装备？
2. 每件装备的显示身份、原类型、槽位、角色门禁、品质、tooltip 说明/类型/价值和 12 个基础属性是什么？
3. 随机基础值的原表达式、运行时取值边界和 AS3 `int/Number` 单位是什么？
4. 每级强化读取哪个 `aStrengthen` 字段，缺字段是零还是存在原版特判？
5. 164 项能否与既有 431 身份目录一对一复查，并保留 1.0 辅助表的版本差异？

结论：上述问题均已结构化回答。目录固定为 164 个唯一 `fillName`，覆盖
59 武器、54 防具、17 饰品、20 法宝和 14 头衔；12 基础字段与强化字段的
解析未知均为 0。它是后续实现输入，不表示现代 registry、四事务或 UI 已完成。

## 六段证据链

| 段 | 本任务证据 | 结论与边界 |
| --- | --- | --- |
| 局部数据 | `my/AllEquipment.as:909-3330` 的 `MyEquipObj` 注册；每条 JSON 记录保存精确变量与行号 | 以 1.1 构造参数为权威，不从现代种子 definition 或 1.0 表反推 |
| 共享调用链 | `AllEquipment.as:3357-3400` 查找优先级；`MyEquipObj.as:238-479` 构造字段、`:484-615` 强化、`:1007-1125` 实例保存；`PackThings.as:294-297` 角色门禁；`BackPack.as:468-562` 五槽穿脱；`BaseRoleProperies.as:892-930` 属性消费 | 身份、实例、槽位、角色、强化与单位均追到实际消费者 |
| SWF 几何 | 不适用 | 本 task 只冻结非视觉数据。图标、穿戴显示、注册点、页面显示列表和逐状态视觉由 170B 回到恢复 SWF 证明 |
| 可观察合同 | `equipment-data-catalog-1.1.json#/fieldContract` 与每项 `baseStats/strengthening/source` | 保留原表达式、范围、上下界开闭、运行时强制类型、单位、locator、证据等级和反证条件 |
| 现代映射 | 后续装备 definition owner、强化/Fusion/分解/打造重放和 UI 动态字段只读消费本目录 | 本 task 不修改 `src/`，不建立第二身份 owner，不升级存档 schema |
| 双重验证 | 生成器比较 164/431、唯一性、12 字段、类型/槽位映射、未知值、1.0 名称差异和源哈希；`--check` 比较可重复输出 | 纯数据无运行视觉批次；UI/穿戴运行观察留给 170B 和后续现代接入 task |

反证总条件：1.1 `AllEquipment.as`、`MyEquipObj.as`、`PackThings.as`、
`BackPack.as`、`BaseRoleProperies.as` 或 431 身份目录的哈希、构造顺序、
`findByName` 优先级、槽位/角色门禁、属性单位发生变化时，必须重新生成并复核。

## 字段与单位合同

| JSON 字段 | 原构造参数/强化键 | 原单位与消费 |
| --- | --- | --- |
| `hp/mp/attack/defense` | `param8..11`；`hp/mp/att/def` | 点数；基础构造参数为 AS3 `int` |
| `criticalChance/evasionChance` | `param12..13`；`crit/miss` | 0..1 比例；角色属性消费时乘 100 后取整 |
| `hpRegen/mpRegen` | `param14..15`；`ehp/emp` | 点数；基础构造参数为 AS3 `int` |
| `lifeSteal/magicDefense/armorPenetration` | `param16..18`；`ebol/mdef/dhit` | 0..1 比例；角色属性消费时乘 100 后取整 |
| `haveBlood` | `param23`；`haveblood` | 原数值点数；角色属性消费时取整 |
| `tooltip.instruction` | `param20` | `AttributeCon` 的 135px、14px 换行说明；保留原文本/HTML |
| `tooltip.typeLabel` | `MyEquipObj.trans(type)` | 武器/防具/饰品/法宝/头衔 |
| `tooltip.soulValue` | `MyEquipObj.transValue()` | 品质到灵魂价值；`魔 王` 无分支，原初始化结果为 0 |

基础值若使用 `Math.round(Math.random() * n)`，目录保存含两端范围；若直接
使用 `Math.random() * n`，`Number` 字段保留上界不含语义，`int/uint` 构造
参数保存经 AS3 截断后的实际整数范围。生成器不抽样随机数，因此重复生成稳定。

强化目录保存原 `aStrengthen` 系数；`MyEquipObj.strengthenEquip()` 以
`strengthLevel * coefficient` 写入强化附加值。缺键确认为 0，唯一 `dgg`
（独孤狗）按原硬编码特判记录 111/1111/11/0.01 等成长，不把缺键误写成 0。

## 164/431 覆盖与 1.0 对照

- 431 身份目录中 `inventoryCategory=equipment` 恰为 164 项，唯一
  `fillName` 也是 164；无缺失、无重复、无未映射类型。
- 类型/槽位为 `zbwq/weapon 59`、`zbfj/armor 54`、
  `zbsp/accessory 17`、`zbfb/magicWeapon 20`、`zbtx/title 14`。
- 角色门禁为悟空 24、唐僧 22、八戒 22、沙僧 27、白龙 18、通用 51。
- 1.0 辅助表按显示名与 1.1 集合交叉命中 150 项；14 项未出现在 1.0 表，
  详见 `#/coverage/version1_0AuxiliaryComparison/absentFromVersion1_0Reference`。
  这些是版本/参考差异，不是 1.1 未知值；所有最终字段仍取 1.1 AS3。
- `AllEquipment.findByName` 的实际反向数组搜索裁决已由既有 431 目录执行；
  本 164 子集直接引用其 `sourceDefinition.variable/source`，没有另建优先级。

## 未知、反证与后续输入

- 数据 schema 内未知字段：0。
- 纯数据几何：不适用；任何穿戴空间或 UI 结论仍是 170B 的待证明项。
- 现代字段换算：本目录保留原比例，不能直接把 0.01 当成现代百分数点 0.01；
  后续接入必须显式消费 `unit` 与 `runtimeCoercion`。
- 1.0 表中的同名数值只能用于人工反证；即使冲突也不能覆盖 1.1 记录。
- 目录可供强化、Fusion、分解、打造和 V6 兼容分析共同消费，但没有替代
  这些系统各自的事务、UI、穿戴视觉或存档迁移验收。

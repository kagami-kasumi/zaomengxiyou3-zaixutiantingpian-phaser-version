# 装备/背包系统索引

本文记录 `TASK-SETTINGS-013` 对装备和背包系统的首轮逆向结果。范围只覆盖足够支撑现代最小背包/装备切片的事实：装备类型、属性字段、槽位、穿戴/卸下、背包分类、容量、存取、物品使用与存档字段。合成、掉落、强化、法宝细节和完整道具效果只记录入口，不在本任务展开。

## 资料状态

主要 AS3 证据：

- `extracted_flash/scripts/172845/scripts/my/AllEquipment.as`
- `extracted_flash/scripts/172845/scripts/my/MyEquipObj.as`
- `extracted_flash/scripts/172845/scripts/user/User.as`
- `extracted_flash/scripts/172845/scripts/export/pack/BackPack.as`
- `extracted_flash/scripts/172845/scripts/export/pack/BackPackElement.as`
- `extracted_flash/scripts/172845/scripts/export/pack/PackThings.as`
- `extracted_flash/scripts/172845/scripts/config/Config.as`
- `extracted_flash/scripts/172845/scripts/base/BaseRoleProperies.as`

资料缺口：

- 任务定义提到的 `再续1.0装备属性合成掉落表.xlsx` 当前不在项目根目录；本轮没有表格数据可读。装备静态数据先以 `AllEquipment.as` 的 `new MyEquipObj(...)` 初始化为准。
- `User.as` 实际路径是 `extracted_flash/scripts/172845/scripts/user/User.as`，不是看板中旧写法 `my/User.as`。

## 核心对象

### `AllEquipment`

`AllEquipment` 是全局装备/物品目录。构造时初始化五组数组：

- `normalEquipment`：基础普通装备。
- `otherEquipment`：大部分可穿戴装备、饰品、头衔等。
- `wpEquipment`：道具、材料、制作书、宝石、传送石、技能书等。
- `sutraEquipment`：法宝/经书相关装备。
- `sellEquipment`：时装等可售卖或商城类装备。

`findByName(fillName)` 会先 `reNewAll()`，再按 `normalEquipment -> otherEquipment -> wpEquipment -> sellEquipment -> sutraEquipment` 查找。现代实现应避免每次查询重建全表，改为启动时构建只读 registry，并保留原版 `fillName` 作为稳定 id。

### `MyEquipObj`

`MyEquipObj` 是装备和物品的统一实例对象。构造参数顺序是原版数据表的核心映射：

| 参数 | 字段 | 含义 |
| --- | --- | --- |
| `param1` | `showid` | 显示/外观 id，也被部分逻辑用于制作书、特殊类别 |
| `param2` | `ename` | 中文显示名 |
| `param3` | `fillName` | 稳定物品 id |
| `param4` | `type` | 装备/物品类型 |
| `param5` | `user` | 限定角色，如 `悟空`、`唐僧`；空字符串表示通用 |
| `param6` | `quality` | 品质 |
| `param7` | `color` | UI 颜色字符串 |
| `param8..18` | 属性 | HP、MP、攻击、防御、暴击、闪避、回血、回蓝、吸血、魔抗、穿透 |
| `param19` | `aStrengthen` | 强化成长字段 |
| `param20` | `instruction` | 描述文本 |
| `param21` | `elevel/eupdata` | 装备等级和成长比例 |
| `param22` | 五行 | 金木水火土布尔值 |
| `param23` | `haveblood` | 护盾/生命类附加值 |

原版大量字段用随机拆分值保存，例如 `ehp1 + ehp2`、`fillName1 + fillName2`，这是反作弊/混淆性质。现代实现不需要照搬拆分，只保留可观察数值。

## 类型和槽位

`MyEquipObj.trans(type)` 将类型转成 UI 文案：

| type | 文案 | 现代建议 |
| --- | --- | --- |
| `zbfj` | 防具 | `armor` 槽 |
| `zbwq` | 武器 | `weapon` 槽 |
| `zbsp` | 饰品 | `accessory` 槽 |
| `zbfb` | 法宝 | `magicWeapon` 槽，完整法宝机制后置 |
| `zbsz` | 时装 | `fashion` 槽，有过期时间 |
| `zbcb` | 时装类 | 原版视作 fashion，但 `BackPack.equip()` 禁止穿戴 |
| `zbtx` | 头衔 | `title` 槽 |
| `zbwp` | 道具 | 背包堆叠物；按 `fillName` 细分宝石、材料、传送石、丹药、技能书等 |
| `wpqhs` | 强化石 | 原版类型中存在，但多数强化石也用 `zbwp` + `fillName` 判定 |

`User.setSaveObj()` 加载已穿戴装备时使用槽位白名单：

```text
["zbwq", "zbfj", "zbsp", "zbfb", "zbsz", "zbcb", "zbtx"]
```

同一类型只允许一个已穿戴对象进入 `curarray`。重复槽位或过期时装会退回背包列表。

## 属性结算

`BaseRoleProperies.addEquip()` 将装备属性加到角色属性：

- `geteatt()` -> `basePower`
- `getedef()` -> `defense`
- `getecrit() * 100` -> 暴击
- `getemiss() * 100` -> 闪避
- `geteahp()` -> 回血
- `geteamp()` -> 回蓝
- `geteatblood() * 100` -> 吸血
- `getmagicdef() * 100` -> 魔抗
- `getdeephit() * 100` -> 穿透
- `getehp()` -> 最大 HP
- `getemp()` -> 最大 MP
- `gethaveblood()` -> 护盾/额外生命类字段

`removeEquip()` 做反向扣除，并在最大 HP/MP 低于当前值时裁剪当前 HP/MP。现代实现应把装备属性结算做成纯函数或可撤销 modifier，而不是直接读写角色属性对象。

## 穿戴和卸下

### 穿戴

入口主要在 `PackThings.usezb()` 和 `BackPack.equip(type, equip)`：

1. 背包格子触发装备按钮或双击。
2. `usezb()` 用 `gc.allEquip.findByName(fillName)` 验证当前实例类型与静态目录类型一致。
3. 法宝如果正在使用，禁止替换。
4. 从背包列表删除该物品。
5. `BackPack.equip()` 如果目标槽位已有 `curzb`：
   - 从 `player.curarray` 删除旧装备；
   - 调 `hero.roleProperies.removeEquip(oldEquip)`；
   - 旧装备按类型退回 `szlist` 或 `zblist`。
6. 新装备 `player.curarray.push(equip)`。
7. 调 `hero.roleProperies.addEquip(equip)`。
8. 刷新装备显示、头像外观和属性文本。

角色限制：

- 如果装备 `user` 非空且不等于当前角色 `userType`，背包菜单会禁用装备按钮。

### 卸下

入口是点击装备槽 `BackPack.szClick()`：

1. 取槽位上的 `curzb`。
2. 法宝正在使用时禁止卸下。
3. 从显示槽位移除。
4. 从 `player.curarray` 删除。
5. 调 `hero.roleProperies.removeEquip(equip)`。
6. `zbsz/zbcb` 回 `szlist`，其他回 `zblist`。
7. 刷新背包、装备显示和属性文本。

现代首切片建议只实现 `zbwq/zbfj/zbsp/zbsz/zbtx` 的穿脱和属性结算；`zbfb` 可先显示槽位但不实现使用中限制以外的法宝效果。

## 背包结构

`User` 持有四个主要背包列表：

| 列表 | UI 标签 | 内容 |
| --- | --- | --- |
| `zblist` | 装备 | 武器、防具、饰品、法宝、头衔以及部分从道具加载出的头衔 |
| `djlist` | 道具 | 普通道具、材料、强化石、传送石等可堆叠物 |
| `szlist` | 时装 | 时装/翅膀类 |
| `jnslist` | 技能书 | `fillName` 包含 `jns` 的物品 |

`curarray` 是已穿戴装备列表，不属于背包页，但会单独存档。

容量和分页：

- `BackPackElement.allPage = 5`。
- `BackPackElement.pageNum = 25`。
- UI 每页画 `5 x 5` 个格子。
- 每个分类理论显示容量是 125 格。
- 代码没有发现硬性阻止超过 125 个对象进入列表；超出部分只是 UI 翻页不可见。现代实现应显式做容量限制或至少显示溢出状态。

新增物品：

- `BackPackElement.addMyEquipmentToList()`：`zbwq/zbfj/zbfb/zbsp` 进 `zblist`，`zbsz` 进 `szlist`，其他通过 `Config.putQhsInBackPack()` 堆叠到 `djlist` 或 `jnslist`。
- `Config.putQhsInBackPack()`：`fillName` 包含 `jns` 进 `jnslist`，否则进 `djlist`。
- `Config.putQHsInArray()`：如果已有相同 `fillName`，只增加 `num`；否则从 `AllEquipment.findByName()` 拿模板、设置数量后 push。

删除/消耗：

- `User.removeEquipFormBack(fillName, category, count)` 按 `category` 删除：`1` 删除装备列表，`2` 删除道具列表，`4` 删除技能书列表。堆叠数量大于消耗数时减少数量，否则移除对象。
- `PackThings.removeDaoJuSobj()` 是 UI 使用后的道具/技能书消耗入口：数量大于 1 减 1，否则从对应列表删除。
- `PackThings.removeSobj()` 用于丢弃/转移完整对象，会从当前分类列表 splice。

## 物品使用

`PackThings.clickHandler()` 对道具/技能书显示使用、丢弃、给予按钮；只有一批 `fillName` 白名单允许使用，否则使用按钮禁用。已确认的首批使用类型：

- 传送石：`css6/css12/css18/css24/css_2/css_3/css_4`。
- 关卡/入口类：`yll`、`jtl`。
- 特殊道具：`lwyp`、`mpyj`、`wphhd`、`wpcsd`、`wplvdyl`、`sbjyd`、`jyys`、`jyd3`、`djyys`、`xjyys`、`lhys`、`ghyb`、`wwdgl`、`bx` 等。
- 技能书：原版提示“技能书不再有用”，不可使用。

现代首切片不需要实现这些效果；只需做到道具显示、堆叠数量、不可使用/可使用状态可见。真正道具效果应拆后续任务。

## 存档字段

`User.getSaveObj()` 记录装备/背包相关字段：

- `bagSaveString`：`zblist`
- `curSaveString`：`curarray`
- `bagdjSaveString`：`djlist`
- `bagszSaveString`：`szlist`
- `bagjnsSaveString`：`jnslist`
- `isshowfashion`：是否显示时装

`MyEquipObj.getEquipSaveObj()` 用 `|` 拼出单个物品字段，并用 `}` 分隔多个物品。字段顺序包含：

```text
showid, ename, fillName, type, user, quality, color,
ehp, emp, eatt, edef, emiss, ecrit, eahp, eamp,
jin, mu, shui, huo, tu,
elevel, eupdata, enum, strengthValue,
magicdef, eatblood, deephit, haveblood,
fashionTime? (仅 zbsz/zbcb)
```

加载时每个对象先用第 3 段 `fillName` 到 `AllEquipment.findByName()` 校验存在，再 `setEquipSaveObj()` 恢复实例。

## 现代实现建议

首个现代切片建议拆成 `InventoryStore + EquipmentStore + EquipmentUISystem`：

- `EquipmentDefinition`：只读静态数据，来源先写入少量种子装备，字段名保留 `fillName/type/user/quality` 映射。
- `InventoryItemStack`：用于 `zbwp`、技能书等可堆叠物。
- `EquipmentInstance`：用于武器、防具、饰品、时装、头衔等非堆叠实例。
- `EquipmentLoadout`：按槽位保存当前穿戴。
- `equip(itemId)`：校验类型、角色限制、槽位占用，把旧装备退回背包并重算属性。
- `unequip(slot)`：从槽位退回背包并重算属性。
- UI 首批只做可打开面板、分页显示、装备/卸下、数量显示和属性预览；不做合成、强化、掉落、商城、仓库、赠送、真实美术。

关键边界：

- 不照搬 `User` 中四个可变数组到处被 UI 直接 splice 的结构；现代侧应由单一 store 负责变更。
- 不照搬随机拆分字段；只保留数值。
- 保留原版分类和 `fillName`，便于后续接表、存档和掉落。

## 后续缺口

- `M-038 掉落`：需要细读 `BaseMonster.fallEquip()`、怪物 loot 表和 `FallEquipObj`。
- `M-039 合成`：需要细读 `export/strength/Making.as`、`Fusion.as`、`Strength.as`、`Resolution.as`，并补 xlsx 资料表。
- `M-043 法宝`：需要细读 `export/magicWeapon/` 与 `SutraInterface.as`。
- `M-044 存档`：装备字段已确认，但现代读写格式还未实现。

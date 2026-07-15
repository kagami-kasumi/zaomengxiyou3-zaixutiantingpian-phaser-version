# 合成机制索引

本文记录 `TASK-SETTINGS-041` 对 1.1 合成机制的逆向结果。范围只覆盖足够支撑现代首个合成切片的事实：入口、配方匹配、材料暂存、灵魂消耗、产物生成、失败边界，以及与背包/装备系统的关系。强化、制作、分解、完整配方数据化和存档不在本任务展开。

## 资料与权威边界

主要 AS3 证据：

- `extracted_flash/resources_by_swf/[172845].swf/scripts/export/strength/StrengthEquipment.as`
- `extracted_flash/resources_by_swf/[172845].swf/scripts/export/strength/Fusion.as`
- `extracted_flash/resources_by_swf/[172845].swf/scripts/my/AllEquipment.as`
- `extracted_flash/resources_by_swf/[172845].swf/scripts/export/pack/PackThings.as`
- `extracted_flash/resources_by_swf/[172845].swf/scripts/GMain.as`

辅助资料 `docs/reverse-engineering/reference/equipment-spreadsheet/crafting-recipes.csv` 来自 1.0，只作为中文配方索引。1.1 的权威配方表是 `AllEquipment.mixProduce()` 中以 `fillName` 表示的分支；现代实现不能直接消费 CSV。

## UI 入口与玩家边界

地图菜单通过 `showStrengthEquip` 事件打开 `StrengthEquipment`。该界面同时承载强化、合成、分解和制作四个页签；点击 `mixturebtn` 才创建当前玩家对应的 `Fusion`。

`StrengthEquipment` 根据 `gc.playNum` 显示 P1/P2 角色按钮，并把所选 `User` 作为 `currentPlayer` 传入 `Fusion`。因此合成所读取和修改的背包、灵魂值与临时材料均属于当前选中的玩家，不是全局共享数据。

`Fusion` 有三个材料槽 `material1..3`、一个只读预览槽 `preview` 和一个待领取产物槽 `produce`。背包中的 `PackThings` 检测到父界面是 `StrengthEquipment` 时派发 `SimpleClick`；技能书（`fillName` 含 `jns`）在此入口被拒绝。

## 材料暂存与退还

`Fusion.receiveObj()` 按第一个空槽依次放入材料，并立即从当前玩家的原背包列表扣除一个：

| 原版类型 | 来源/退回列表 | 规则 |
| --- | --- | --- |
| `zbwq/zbfj/zbsp/zbfb/zbtx/空类型` | `zblist` | 堆叠数大于 1 时减 1，否则移除实例；退还前校验静态装备目录 |
| `zbsz` | `szlist` | 同上 |
| `wpqhs/zbwp` | `djlist` | 同上；退还时按 `fillName` 重新堆叠 |

点击已放入的材料会把它退回对应列表。关闭或切换掉 `Fusion` 时也会退还三个槽中的材料。每次材料变化都会刷新背包并重新计算预览。

现代实现应使用显式 `CraftingSession` 暂存材料，不让 UI 直接操作玩家数组。放入、移除、取消和确认必须是原子命令，确保关闭界面或取消时材料无损退还。

## 配方数据与匹配规则

`AllEquipment.mixProduce(materials)` 先把材料转成 `fillName[]`，再逐条与三项配方调用 `transName()`。`transName()` 对每个输入 id 从候选数组中找到并删除一个同名项；候选最终为空即匹配。因此：

- 配方固定需要恰好三个槽位材料。
- 材料顺序无关。
- 重复材料按数量匹配，不是拥有一个堆叠即可。
- 未匹配返回 `["", ""]`，界面不产生预览，也不执行合成。
- 配方结果只有产物 `fillName` 和中文显示名；不存在独立配方 id、概率或配方书解锁字段。

1.1 配方按用途可分为：基础法宝、法宝升级、强化石/宝石升级、灵珠碎片、邪灵装备转换石、时装升品、饰品/法宝链、制作书、流邪链、八卦/青萍剑和后期诛邪装备制作书。完整权威映射集中在 `mixProduce()`；后续数据化任务应从该函数一次性转录并用测试校验。

### 首个实现配方

首切片采用以下 1.1 明确分支：

```text
tlzsp + tlzsp + tlzsp -> wptlz（土灵珠）
```

该配方只涉及 `zbwp` 堆叠物，不触发装备属性继承、时装期限、制作书或法宝特殊继承，适合验证库存事务、配方匹配和灵魂门禁。

## 预览、消耗与产出

每次材料变化，`previewFun()` 都调用 `mixProduce()`：

- 匹配成功时显示产物图标和名称。
- 所有配方当前都显示需要 `1000` 灵魂和 `100%` 成功率；代码中的两条分支赋值完全相同。
- 匹配失败时产物 id 为空，合成按钮不消耗任何东西。

点击合成后 `doFusion()`：

1. 没有有效产物时直接结束。
2. 当前玩家灵魂值 `< 1000` 时提示“灵魂值不够”，不扣灵魂、不移除槽中材料。
3. 门禁通过后先扣 `1000` 灵魂。
4. 生成产物实例、显示“合成成功”，清空三个材料槽并把产物送回玩家背包。
5. 全路径没有随机失败分支，成功率固定为 100%。

产物回包按类型路由：装备/法宝/头衔进 `zblist`，`wpqhs/zbwp` 合并到 `djlist`，时装进 `szlist`。首切片的 `wptlz` 因而合并到道具堆叠。

## 高级产物边界

普通宝石/强化石类直接 `findByName(productFillName)`。其他合成物可能读取三个材料的实例属性：

- 默认 `getSutraValue()`：产物 HP/MP/攻击/防御取三材料对应属性总和的三分之一。
- `_dzj/dzjj/hy`：走 `getSunSutraValueEquip()`，合并更多属性并带上限/特例。
- `sq*`：走 `getShenzhuValue()`。
- `mdhy`：走 `getMingDingHuaYanEquip()`，正属性按 1.5 倍汇总并限制闪避/魔抗。
- 时装设置期限；`yxfb/tjbg/fbqpj` 和制作书直接取静态定义。

这些都属于后续高级配方边界，首切片不应引入。

## 失败与生命周期结论

- 技能书不能从炼丹炉背包入口放入。
- 材料不足三个或组合无配方：没有预览、没有消耗、没有随机失败产物。
- 灵魂不足：材料仍暂存在槽中，可移除或关闭界面退回。
- 成功：固定消耗三个单件材料和 1000 灵魂，固定生成一个产物。
- 原版没有背包容量拒绝逻辑；现代首切片应复用现有库存策略，并保证产物无法入包时整个事务不扣材料和灵魂。

## 现代首切片边界

建议拆为 `CraftingRecipeRegistry + CraftingSystem`：

- `CraftingRecipe`：三个无序 `fillName` 和一个 `productFillName`，首批只登记 `tlzsp x3 -> wptlz`。
- `preview(materialIds)`：纯函数，精确按多重集合匹配。
- `craft(playerInventory, soul, recipe)`：先校验材料、灵魂和产物入包能力，再原子扣除三个材料与 1000 灵魂并加入一个产物。
- UI：复用现有背包面板或测试入口，能观察配方预览、灵魂不足和成功后的堆叠数量与灵魂变化。
- 测试：覆盖顺序无关、重复数量、无配方、材料不足、灵魂不足、成功原子事务和双玩家隔离。

禁止在首切片中实现完整配方表、装备属性继承、制作、强化、分解、五行重置、存档或真实炼丹炉美术。

## 1.1 权威配方数据清单

`TASK-SETTINGS-042` 已把 `AllEquipment.mixProduce()` 完整转录为 `reference/crafting-recipes-1.1.json`。该 JSON 是 1.1 三材料配方的权威结构化清单；1.0 `crafting-recipes.csv` 仍只作中文辅助索引。

字段与语义：

- `materials`：恰好三个 `fillName`，保留重复项；匹配时作为无序多重集合。
- `productFillName` / `productDisplayName`：逐分支保留源码返回值。
- `sourceBranch` / `sourceLine`：回溯 `mixProduce()` 中对应的 `transName()` 调用。
- `productionBehavior`：按 `Fusion.doFusion()` 的实际分支分类，而不是按物品名称推测类型。
- `duplicateOfSourceBranch`：源码中完全重复输入的显式追踪字段。

数量与冲突校验：

- 源码 `transName()` 分支数：122；结构化记录数：122。
- 唯一材料多重集合：121；每条记录均为三个非空材料和非空产物。
- 唯一源码重复是分支 86/87：`mdcqg + wpdh + wpbp -> cs_wq_llzzs`，两条返回完全一致；没有同一输入映射到不同产物的冲突。
- 行为分类计数：`direct_static` 68、`direct_fashion_timestamp` 9、`get_sutra_value` 41、`get_sun_sutra_value` 3、`get_mingding_huayan` 1。
- `yxsmsrsz/jlsmsrsz/sssmsrsz` 虽是时装名称，但产物 id 含 `sms`，会先命中 `Fusion.doFusion()` 的宝石/强化石直接生成判断，因此按源码事实标为 `direct_static`，不会进入时装时间戳分支。
- 清单中没有 `get_shenzhu_value` 记录；当前唯一含 `sq` 的产物 `sqmdcqgzzs` 会先命中 `zzs` 直接生成分支。

现代版差异决策：

- 不复现 `direct_fashion_timestamp` 的时钟/生成时间字段，也不为此引入时间源、期限消耗或存档迁移。
- 这 9 条记录仍保留在权威 JSON 中，确保原版源码事实不丢失；若后续接入对应时装配方，产物按普通永久时装处理。
- 原计划的 `TASK-SLICE-112` 已撤销，后续直接推进 `get_sutra_value` 属性继承切片。

## 现代默认属性继承首切片

`TASK-SLICE-113` 选择源码分支 1：`kyg + kyz + kys -> kyl` 作为首个 `get_sutra_value` 配方。现代实现按三个具体装备实例读取 `maxHp/maxMp/power/defense`，每项求和后除以 3 并向零取整，再写入新产物实例；材料输入顺序不影响结果。

该路径只消费装备实例，不允许同名堆叠物冒充属性来源。产物入包能力、灵魂和全部材料在预检通过后才统一提交；失败不产生部分扣除。

## 现代默认属性继承全量注册

`TASK-SLICE-114` 已把权威 JSON 中全部 41 条 `get_sutra_value` 记录按无序材料多重集合注册；清单内没有重复组合，因此现代唯一注册表也是 41 条。三同材料、两同一异和三种不同材料均复用首切片确认的装备实例选择、四属性平均继承与原子事务。

`direct_fashion_timestamp`、`get_sun_sutra_value` 和 `get_mingding_huayan` 仍不进入默认继承注册表；这些分类的属性来源或时间语义不同，必须独立评估。

## 特殊属性继承分类

`TASK-SETTINGS-043` 确认权威 JSON 中四条特殊记录与 `Fusion.doFusion()` 的分支严格对应：分支 66～68 的 `_dzj/dzjj/hy` 调用 `getSunSutraValueEquip()`，分支 69 的 `mdhy` 调用 `getMingDingHuaYanEquip()`。分派证据见 `Fusion.as:493-520`；配方输入和产物见 `crafting-recipes-1.1.json` 的源码分支 66～69（原 `mixProduce()` 行 3698、3702、3706、3710）。这四条不能落入默认四属性三材料平均继承。

| 分类 | 权威配方 | 产物 | 属性来源 |
| --- | --- | --- | --- |
| `get_sun_sutra_value` | `mgzh + tflj + tdlzj` | `_dzj` 地藏戒 | 三个具体装备实例的 10 项正属性 |
| `get_sun_sutra_value` | `shsjt + _dzj + lly` | `dzjj` 地藏金戒 | 三个具体装备实例的 10 项正属性 |
| `get_sun_sutra_value` | `bxhy + zhhz + phhl` | `hy` 花宴 | 三个具体装备实例的 10 项正属性 |
| `get_mingding_huayan` | `hy + wpxih + wpjt` | `mdhy` 命定花宴 | 三个具体装备实例的 10 项正属性 |

### `getSunSutraValueEquip()`

完整循环和赋值见 `AllEquipment.as:4083-4174`。对每个材料、每项属性都先判断 `> 0`；零值和负值不参与。令 `S(x)` 为三个材料中正值之和：

| AS3 字段 | 现代字段 | AS3 原始结果公式 |
| --- | --- | --- |
| `ehp` | `maxHp` | `trunc(S / 1.5)` |
| `emp` | `maxMp` | `trunc(S / 1.5)` |
| `eatt` | `power` | `trunc(S / 1.5)` |
| `edef` | `defense` | `trunc(S / 1.5)` |
| `ecrit` | `critPercent` | `round2(S / 1.5)`，无上限 |
| `emiss` | `missPercent` | `min(round2(S / 1.5), 0.15)` |
| `eahp` | `hpRegen` | `trunc(S / 1.5)` |
| `eamp` | `mpRegen` | `trunc(S / 1.5)` |
| `haveblood` | `lifeStealPercent` | 默认 `trunc(S / 1.5)`；`dzjj` 强制为 `0`，`hy` 强制为 `18` |
| `magicdef` | `magicDefensePercent` | `min(round2(S / 1.5), 0.24)` |

这里的 `trunc` 对应 AS3 `int()` 向零截断，`round2` 对应 `Number(value.toFixed(2))`。HP、MP、攻击、防御、回血、回蓝和吸血在最终除法后截断；暴击、闪避和魔抗只在最终除法后保留两位。闪避与魔抗使用 `>=` 判断封顶，等于上限也得到上限。产物由静态定义克隆后，上述 10 项全部被覆盖；`piercePercent`、`shield` 以及装备身份/类型等其他字段保持静态产物定义。

### `getMingDingHuaYanEquip()`

完整循环和赋值见 `AllEquipment.as:3997-4080`。同样只读取每个材料的正值，但倍率在逐材料累加时施加：

| AS3 字段 | 现代字段 | AS3 原始结果公式 |
| --- | --- | --- |
| `ehp` | `maxHp` | `sum(trunc(x * 1.5))` |
| `emp` | `maxMp` | `sum(trunc(x * 1.5))` |
| `eatt` | `power` | `sum(trunc(x * 1.5))` |
| `edef` | `defense` | `sum(trunc(x * 1.5))` |
| `ecrit` | `critPercent` | `round2(sum(x * 1.5))`，无上限 |
| `emiss` | `missPercent` | `min(round2(sum(x * 1.5)), 0.18)` |
| `eahp` | `hpRegen` | `sum(trunc(x * 1.5))` |
| `eamp` | `mpRegen` | `sum(trunc(x * 1.5))` |
| `haveblood` | `lifeStealPercent` | `sum(trunc(x * 1.5))` |
| `magicdef` | `magicDefensePercent` | `min(round2(sum(x * 1.5)), 0.24)` |

整数类必须逐材料截断后再求和，不能简化为 `trunc(S * 1.5)`；例如三个 `1` 应得到 `3`，不是 `4`。浮点类先完整求和，最后统一保留两位。`mdhy` 没有产物名特例。

### 现代实现与确定性测试边界

现有 `EquipmentStats` 已承载全部 10 项：`maxHp/maxMp/power/defense/critPercent/missPercent/hpRegen/mpRegen/lifeStealPercent/magicDefensePercent`，无需增加字段。单位适配必须显式处理：AS3 的 `ecrit/emiss/magicdef` 使用 `0.15 = 15%` 一类小数比例，而现代 `*Percent` 字段使用百分数点，因此写入 `critPercent/missPercent/magicDefensePercent` 前乘 `100`；测试中的 Sun 闪避/魔抗封顶应分别断言 `15/24`，MingDing 应断言 `18/24`。`haveblood` 已是百分数点，`hy = 18` 直接写入 `lifeStealPercent`，不能再乘 `100`。`piercePercent` 和 `shield` 不参与特殊继承；实现时应从产物静态定义保留它们。四条配方仍复用现有装备实例选择、无序多重集合匹配、1000 灵魂、容量预检、失败无副作用和 P1/P2 隔离事务，只新增独立行为枚举和继承纯函数。

最低测试矩阵：

- 注册表恰有三条 `get_sun_sutra_value` 和一条 `get_mingding_huayan`，且不进入 `get_sutra_value` 注册表。
- Sun 普通十属性、负值忽略、整数除 1.5 后截断、浮点最终两位、闪避 0.15 与魔抗 0.24 上限。
- Sun 的 `_dzj` 默认吸血、`dzjj -> 0`、`hy -> 18` 三种产物分支。
- MingDing 的整数逐材料乘 1.5 再截断、浮点最终两位、闪避 0.18 与魔抗 0.24 上限，无吸血特例。
- 材料乱序结果一致；材料实例不足、灵魂不足或容量不足时 10 项属性、库存与灵魂均无部分提交；P1/P2 互不影响。

## 现代特殊属性继承实现

`TASK-SLICE-115` 已把权威 JSON 的三条 `get_sun_sutra_value` 和一条 `get_mingding_huayan` 接入独立注册表分类。`CraftingSystem` 将三种属性继承行为统一走具体装备实例选择与原子消费，再按行为分派到默认四属性平均、Sun 十属性或 MingDing 十属性纯函数。

现代实现显式完成 AS3 小数比例与现代百分数点之间的转换，Sun 的 `dzjj/hy` 吸血覆盖发生在通用公式之后；产物的 `piercePercent/shield` 保留静态定义。测试已覆盖权威数量、分类隔离、四条乱序合成、正值过滤、整数截断顺序、浮点两位、两类上限、三种 Sun 吸血结果、材料实例不足失败无副作用和 P1/P2 隔离。

## 现代材料暂存会话

`TASK-SLICE-116` 新增 owner 明确的 `CraftingSession`。每位玩家各有三个材料槽；装备以原实例从背包移入，堆叠物每次拆出一个单位。移除单槽或关闭面板会把材料原样退回来源分类，装备保持对象身份，堆叠按 `fillName` 合并。

三个槽位填满后，预览直接按槽位的无序 `fillName` 多重集合匹配现有注册表并显示产物、1000 灵魂门禁或无配方原因。确认时会话把暂存材料交给既有 `craft()` 原子事务：成功后清空槽位；灵魂、配方、实例或容量预检失败时重新暂存全部材料，玩家可继续移除或关闭退回。

测试场景背包面板提供最小可观察入口：`X` 放入当前背包条目、`R` 退回末槽、`F` 确认，P1 `C` / P2 小键盘 `/` 关闭时退回全部。技能书仍不能放入；完整炼丹炉视觉和拖拽动画后置。

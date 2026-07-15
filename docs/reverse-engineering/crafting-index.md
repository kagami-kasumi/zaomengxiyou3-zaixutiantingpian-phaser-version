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

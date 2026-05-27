# 掉落/拾取系统索引

本文记录 `TASK-SETTINGS-014` 和 `TASK-SETTINGS-015` 对怪物掉落和拾取系统的逆向结果。范围覆盖 `VS-009` 已实现的最小装备/道具掉落，也补齐药品、aura、强化石和 `Monster3` 至 `Monster30` 掉落表边界。不展开合成、商城、法宝、存档或完整装备属性实现。

## 资料状态

主要 AS3 证据：

- `extracted_flash/scripts/172845/scripts/base/BaseMonster.as`
- `extracted_flash/scripts/172845/scripts/my/FallEquipObj.as`
- `extracted_flash/scripts/172845/scripts/config/Config.as`
- `extracted_flash/scripts/172845/scripts/user/User.as`
- `extracted_flash/scripts/172845/scripts/export/monster/Monster3.as`
- `extracted_flash/scripts/172845/scripts/export/monster/Monster7.as`
- `extracted_flash/scripts/172845/scripts/export/cure/SmallHP.as`
- `extracted_flash/scripts/172845/scripts/export/cure/BigHP.as`
- `extracted_flash/scripts/172845/scripts/export/cure/SmallMP.as`
- `extracted_flash/scripts/172845/scripts/base/BaseAura.as`
- `extracted_flash/scripts/172845/scripts/export/aura/auraRed.as`
- `extracted_flash/scripts/172845/scripts/export/aura/auraWhile.as`
- `extracted_flash/scripts/172845/scripts/export/monster/Monster3.as`
- `extracted_flash/scripts/172845/scripts/export/monster/Monster7.as` 至 `Monster30.as`

相关前置文档：

- `docs/reverse-engineering/monsters-index.md`
- `docs/reverse-engineering/equipment-index.md`

资料缺口和疑点：

- 当前没有读取项目外的 `再续1.0装备属性合成掉落表.xlsx`；本轮掉落表事实来自怪物类中的 `fallList`。
- `FallEquipObj.colwho()` 未看到显式 `hitTestObject()` 或像素级碰撞判定；药品掉落 `SmallHP.colwho()` 有明确碰撞检测。装备/道具拾取的可观察距离建议后续用原版实测或录屏校准。
- `FallEquipObj` 的 `bigtype` 分支只处理 `zb/dj/sz`；扫描中存在 `cwzb` 等掉落类型，首个切片不覆盖。
- 主源码中只发现 `BaseMonster.fallStone()` 定义，未发现 `fallStone()` 调用点；强化石可按入口实现，但需要继续确认原版何时触发。

## 死亡后的掉落入口

怪物死亡通常不是 `BaseMonster.reduceHp()` 里立刻生成掉落，而是具体 `Monster*` 在 `dead` 动画结束时调用：

```text
scriptFrameOverFunc(dead) -> dropAura() -> destroy()
```

`dropAura()` 的顺序：

1. 如果 `gc.curStage != 98`，先调用 `addMedicine()`。
2. 如果 `gc.curStage != 98`，再调用 `fallEquip()`。
3. 根据击杀者生成红色 aura 和小概率白色 aura。

`curStage == 98` 会跳过药品和装备掉落，但仍可能生成 aura。`curAttackTarget` 如果是宠物，会映射回宠物来源英雄；如果是英雄则直接作为 aura 目标。

首个 `VS-009` 只需要接 `fallEquip()` 等价链路。药品和 aura 都是相邻掉落机制，但不是本切片必须项。

## 装备/道具掉落概率

`BaseMonster.fallEquip()` 的核心流程：

1. 用 `getQualifiedClassName(this)` 取怪物类名。
2. 非难度 2 时调用 `gc.allTask.killMonster(className)`，顺带统计任务击杀。
3. 从 `protectedParamsObject.probability` 取基础掉率。
4. boss 额外乘 `1.5`。
5. 读取两名玩家当前时装的掉落加成，取较大者。
6. 最终概率为 `baseProbability * (1 + maxFashionBonus)`。
7. `Math.random() > probability` 时不掉落。
8. 掉落成功后从 `fallList` 中选择一个候选，创建 `FallEquipObj`。

难度修正来自 `BaseMonster.__added()`：

- 难度 1：`probability *= 1.5`，再 `+ 0.06`。
- 难度 2：`probability *= 0`，且 `fallEquip()` 不统计击杀任务。
- `gc.isLWYP && isBoss`：boss 掉率强制为 `1`。

时装掉落加成来自 `User.getCurFashionEquipFallThingProbability()`：

| 时装 `fillName` | 加成 |
| --- | --- |
| `wkwdg/tswdg/bjwdg` | `0.1` |
| `wkbsz/tsbsz/bjbsz` | `0.18` |
| `wkzyf/tszyf/bjzyf` | `0.2` |

## 掉落候选选择

`fallList` 是怪物类中的候选数组，每项至少包含：

| 字段 | 含义 |
| --- | --- |
| `name` | 物品 `fillName`，同时用于查找图标 `fall_${name}` |
| `bigtype` | 地面拾取后进入哪类背包，常见为 `zb/dj/sz` |

`BaseMonster.getMonsterDrop(fallList, user)` 并非简单等概率。它会先统计当前玩家背包中每个候选物的已有数量，再做动态权重：

- 统计范围使用 `User.getSomeEquipInPackBackByName1(name)`，会查 `djlist/zblist/szlist/jnslist`。
- 计算候选平均持有数 `avgCount`。
- 数量越少的候选权重越高：`pow(avgCount / (currentCount + 1), 2.4)`。
- 单项权重最大为基础权重的 `5` 倍。
- 最终用 `weightedRandomSelect()` 抽取。

因此原版倾向于掉玩家当前更缺的候选物。首个现代切片可以先实现等概率或固定掉落，但如果要更贴近原版，应保留“按已有数量提高稀缺物权重”的接口。

双人细节：

- `fallEquip()` 在存在 `gc.hero2` 时只用 `hero2.getPlayer()` 计算动态权重；否则用 `hero1`。
- 时装加成则取 P1/P2 的最大值。

## 地面掉落对象

掉落成功后创建 `new FallEquipObj(item)`：

- 先尝试加载 `AUtils.getImageObj("fall_" + item.name)`。
- 失败时有少量名字回退，例如 `xlnyzzs/xltqzzs -> xlthzzs`、`_cljzzs/clpzzs -> qlgzzs`。
- 再失败则尝试 `AUtils.getImageObj(item.name)`。
- 图片居中放进 `colipse`，自身加入 `gc.gameSence` 和 `gc.otherList`。

生成位置：

- `x = monster.x`，但怪物屏幕 x 大于 `930` 时左偏 `200`，小于等于 `10` 时右偏 `200`。
- `y = monster.y - 100`。

`fallStone()` 也是 `FallEquipObj` 链路，但固定生成 `wpqhs1`：

- 概率来自 `protectedParamsObject.stoneFallRate * (1 + fashionBonus)`。
- 屏幕边缘 x 偏移为 `150`。
- 并非所有死亡流程都调用 `fallStone()`，首个切片不需要实现强化石独立入口。

## 拾取和进入背包

`FallEquipObj.step()` 每帧：

1. 调 `checkCanMove()`，让掉落物受地形/移动逻辑影响。
2. 遍历 `gc.getPlayerArray()`，调用 `colwho(hero)`。
3. 如果 `curStage == 98`，非 `bosslist` 物品 15 秒后移除。
4. 其他关卡中非 `bosslist` 物品理论上 `99999` 秒后移除，等价于几乎不自然消失。

`bosslist`：

```text
tdlzjzzs, shsjt, wpqhs1, tlzsp, llzsp, hlzsp, flzsp, slzsp
```

这些物品在上述超时分支中不会被自动移除。

`colwho(hero)` 入包规则：

| `bigtype` | 容量判断 | 入包路径 | 结果 |
| --- | --- | --- | --- |
| `zb` | `hero.player.zblist.length < 125` | `gc.allEquip.findByName(name)` 后 `zblist.push(equip)` | 装备页 |
| `dj` | `hero.player.djlist.length < 125` | `Config.putQhsInBackPack(player, name)` | 道具页或技能书页 |
| `sz` | `hero.player.djlist.length < 125` | `gc.allEquip.findByName(name)` 后 `szlist.push(equip)` | 时装页 |

注意：

- `dj` 会继续由 `putQhsInBackPack()` 判断 `fillName` 是否包含 `jns`，包含则进入 `jnslist`，否则进入 `djlist`。
- `sz` 分支用 `djlist.length < 125` 做容量判断，未直接检查 `szlist.length`；现代实现可以保留分类容量语义，不必照搬这个疑似旧 bug。
- 背包满时 `colwho()` 直接 `return`，地面掉落不会消失，也没有看到提示文本。
- `zb` 中 `shsjt` 有唯一性保护：如果背包已有 `shsjt`，或当前饰品槽已穿戴 `shsjt`，则不拾取、不消失。
- 成功入包后 `isfirst = false`，掉落物向上漂移 `100` 像素并 `alpha -> 0`，`0.8s` 后移除。

`Config.putQhsInBackPack()`：

- `fillName` 包含 `jns`：`player.jnslist = putQHsInArray(name, jnslist, count)`。
- 否则：`player.djlist = putQHsInArray(name, djlist, count)`。

`Config.putQHsInArray()`：

- 已有同 `fillName` 堆叠时调用 `setNum(count)`，实际是增加数量。
- 没有同名物品时从 `AllEquipment.findByName(name)` 取模板，调用 `setnum(count)` 设置数量，然后 push。

## 药品掉落

`BaseMonster.addMedicine()` 与 `FallEquipObj` 是不同对象链路：

- 入口：`dropAura()` 在 `gc.curStage != 98` 时先调用 `addMedicine()`，再调用 `fallEquip()`。
- 生成概率：
  - 第一分支 `Math.random() >= 0.5` 后再抽 `_loc2_`，`_loc2_ <= 0.2` 才生成 HP 药。
  - `0 <= _loc2_ <= 0.1` 时再抽一次，约 45% 为 `SmallHP`，约 55% 为 `BigHP`。
  - `0.1 < _loc2_ <= 0.2` 时生成 `SmallHP`。
  - 第二分支 `Math.random() < 0.5` 且下一次 `Math.random() <= 0.25` 时生成 `SmallMP`。
- 生成位置：`x = monster.x`，`y = monster.y - medicine.height`。
- 地面对象：药品直接加入 `gc.gameSence` 和 `gc.otherList`，不是 `FallEquipObj`，不会入背包。
- 拾取检测：`SmallHP.step()` 会过滤距离，x 差不超过 `700`、y 差小于 `200`；`colwho()` 先 `hitTestObject(hero.colipse)`，再 `HitTest.complexHitTestObject(this, hero.colipse)`。
- 有效期：`SmallHP.step()` 中 `tcount >= gc.frameClips * 60` 后移除，约 60 秒。
- 成功效果：药品向上漂移 `100` 像素并 `alpha -> 0`，`0.8s` 后移除。

药品效果：

| 类 | `cname` | 效果 |
| --- | --- | --- |
| `SmallHP` | `SHp` | 恢复玩家最大 HP 的 `25%` |
| `BigHP` | `BHp` | 恢复玩家最大 HP 的 `50%` |
| `SmallMP` | `SMp` | 恢复玩家最大 MP 的 `25%` |

未发现 `BigMP` 类；当前主包只有 `SmallHP/BigHP/SmallMP` 三个药品类。后续药品切片可以独立实现，不需要依赖装备掉落表。

## Aura 掉落与收集

`BaseMonster.dropAura()` 在药品和装备/道具掉落之后继续生成 aura。`gc.curStage == 98` 只跳过 `addMedicine()` 和 `fallEquip()`，不会跳过 aura。

击杀者归属：

- `curAttackTarget is BasePet` 时取 `BasePet.getSourceRole()`。
- `curAttackTarget is BaseHero` 时直接取英雄。
- 无法取得英雄时直接返回，不生成 aura。

生成规则：

| 类型 | 类 | 数量 | 初始偏移 | power | 收集事件 |
| --- | --- | --- | --- | --- | --- |
| 红色 aura | `auraRed` | `2 + floor(random * 3)`，即 2 至 4 个 | x/y 各 `±5` 像素 | `monster.gxp * 2` | `AuraEvent [hero, 0, 0, power, 0]` |
| 白色 aura | `auraWhile` | 随机：`<0.04` 为 3 个，`<0.08` 为 2 个，`<0.12` 为 1 个，否则 0 个 | x/y 各 `±20` 像素 | 固定 `5` | `AuraEvent [hero, 0, 0, 0, power]` |

`BaseAura.step()` 行为：

- 初始等待 `20` 帧。
- 先上浮约 `30` 至 `50` 像素。
- 然后朝 `sourceHero` 移动，初始速度约 `4` 至 `6`，每帧加 `2`，上限 `20`。
- 与英雄距离 `<= 10` 时 `destroy()` 并派发收益事件。
- 超过 `gc.frameClips * 15` 未收集会销毁。

现代边界：

- aura 是自动吸附收益，不是背包物品，也不走 `FallEquipObj`。
- `curStage == 98` 是“只保留 aura”的特殊分支，可作为后续 aura 切片的验收点。
- 现代实现应把收益事件接到成长/资源系统；在成长系统未实现前，aura 切片可先显示收集反馈和记录收益数值。

## 强化石 `fallStone()` 边界

`BaseMonster.fallStone()` 是独立入口，不在 `dropAura()` 内调用。主参考源码扫描只发现这一个定义，未发现调用点。

生成规则：

- 概率来自 `protectedParamsObject.stoneFallRate`。
- 时装掉率加成同装备/道具掉落，取 P1/P2 当前时装掉落加成最大值。
- 最终概率为 `stoneFallRate * (1 + maxFashionBonus)`。
- 成功时创建 `new FallEquipObj({ name: "wpqhs1", bigtype: "dj" })`。
- 位置为 `x = monster.x`，`y = monster.y - 100`；屏幕 x 大于 `930` 左偏 `150`，小于 `10` 右偏 `150`。
- 入包路径与普通 `dj` 相同：`FallEquipObj.colwho()` -> `Config.putQhsInBackPack(player, "wpqhs1")` -> `djlist` 堆叠。

现代边界：

- `wpqhs1` 已能作为普通道具掉落或 `fallStone()` 固定产物。
- 因调用点未确认，强化石切片不应默认挂到所有怪物死亡；应先选明确触发入口，或把它作为测试/配置化掉落入口实现。
- 完整强化系统、强化 UI、装备强化数值和合成不属于掉落任务。

## `Monster3` 至 `Monster30` 掉落表扫描

本表只记录怪物构造函数中的 `protectedParamsObject.probability` 和 `fallList`。实际掉率还会经过难度、boss 乘 `1.5`、`gc.isLWYP` 和时装加成修正。

| 怪物 | 条件/身份 | `probability` | `fallList` 摘要 | 边界说明 |
| --- | --- | --- | --- | --- |
| `Monster3` | `curStage == 1 && curLevel == 1` 时 boss，否则普通怪 | boss `1`；普通 `0.15` | boss 掉 `ptdxzg/ptdxzf/ptdcz/ptdjs/ptddp/ptdcs/ptdyyc/ptdcp/ptdtj/ptdcf`（全 `zb`）；普通掉 `wptm/wpxt/wpsc`（`dj`） | boss 分支实际必掉；普通分支是材料池 |
| `Monster7` | 普通怪 | `0.15` | `wptm/wpxt/wpsc`（`dj`）+ `ptdxzg/ptdxzf/ptdcz/ptdjs/ptddp/ptdcs/ptdyyc/ptdcp`（`zb`） | 早期地面怪装备/材料混合池 |
| `Monster8` | 普通怪 | `0.15` | 同 `Monster7` | 与 `Monster7` 掉落池一致 |
| `Monster9` | `curStage == 9` 时掉率改为正值 | 默认 `-1`；`curStage == 9` 时 `0.05` | `wpqhs1/gjs1/fys1/mfs1/sms1`（全 `dj`） | 非 9 关卡时负掉率等价不掉；9 关卡才可掉 |
| `Monster10` | `curStage == 9` 时掉率改为正值 | 默认 `-1`；`curStage == 9` 时 `0.05` | 同 `Monster9` | 与 `Monster9` 同类 |
| `Monster11` | 普通怪 | `0.12` | `wptm/wpxt/wpsc`（`dj`） | 材料池 |
| `Monster12` | 普通怪 | `0.12` | `wptm/wpxt/wpsc`（`dj`） | 材料池 |
| `Monster13` | 普通怪 | `0.12` | `wptm/wpxt/wpsc`（`dj`） | 材料池 |
| `Monster14` | 普通怪 | `0.12` | `wptm/wpxt/wpsc`（`dj`） | 材料池 |
| `Monster15` | 多数场景 boss；`curStage == 3 && curLevel == 3` 或 `curStage == 8` 时非 boss | `0.5` | `hylc/hylz`（`zb`） | boss 与非 boss 共用掉落池 |
| `Monster16` | boss 条件见类内分支 | `0.55` | `qysz/hylk/chilj`（`zb`） | 高阶装备池 |
| `Monster17` | `curStage == 9` 时掉率改为正值 | 默认 `-1`；`curStage == 9` 时 `0.05` | `wpqhs1/gjs1/fys1/mfs1/sms1`（`dj`） | 同 9 关卡道具池 |
| `Monster18` | `curStage == 9` 时掉率改为正值 | 默认 `-1`；`curStage == 9` 时 `0.05` | `wpqhs1/gjs1/fys1/mfs1/sms1`（`dj`） | 同 9 关卡道具池 |
| `Monster19` | `curStage == 9` 时掉率改为正值 | 默认 `-1`；`curStage == 9` 时 `0.05` | `wpqhs1/gjs1/fys1/mfs1/sms1`（`dj`） | 同 9 关卡道具池 |
| `Monster20` | 多数场景 boss；`curStage == 3 && curLevel == 3` 或 `curStage == 8` 时非 boss | `0.5` | `zjbtg/jllm/smz/jxqtj`（`zb`） | boss 与非 boss 共用掉落池 |
| `Monster21` | boss 条件见类内分支 | `0.5` | `zjksf/zjqj/zjxmc/jxztp`（`zb`） | 高阶装备池 |
| `Monster22` | boss | `0.45` | `shsjt`（`zb`） | `FallEquipObj` 对 `shsjt` 有唯一性保护 |
| `Monster23` | 普通/召唤类 | `0` | 空 | 不掉装备/道具 |
| `Monster24` | boss | `0.4` | `mgzhzzs`（`dj`） | 特殊道具池 |
| `Monster25` | boss | `0.42` | `tfljzzs`（`dj`） | 特殊道具池 |
| `Monster26` | boss | `0.25` | `tdlzjzzs`（`dj`） | `tdlzjzzs` 在 `bosslist` 中，不自动超时移除 |
| `Monster27` | 普通怪 | `0.05` | `wptm/wpxt/wpsc`（`dj`） | 低掉率材料池 |
| `Monster28` | 普通怪 | `0.05` | `wptm/wpxt/wpsc`（`dj`） | 低掉率材料池 |
| `Monster29` | 普通怪 | `0.02` | `wpqhs1`（`dj`） | 强化石也可作为普通掉落表道具出现 |
| `Monster30` | 普通飞行怪 | `0` | 空 | 死亡仍走 `dropAura()`，但不会掉装备/道具 |

完整表可实现所需字段：

- `monsterId` 或 AS3 类名。
- 场景条件：如 `curStage/curLevel`、boss/非 boss 分支。
- `probability` 基础掉率。
- `fallList[]` 的 `name` 和 `bigtype`。
- 是否 boss，用于 `fallEquip()` 中额外 `* 1.5`。
- 是否存在特殊拾取规则，如 `shsjt` 唯一性、`bosslist` 不超时、`probability = -1` 的条件掉落。

仍需 xlsx 或实测补证：

- `fillName` 对应的中文名、装备部位、等级、属性、合成材料和强化关系。
- 各关卡实际会刷哪些怪、哪些分支会触发 boss/非 boss 版本。
- `FallEquipObj` 原版拾取距离或碰撞体表现。
- `cwzb` 等不在本段 `Monster3` 至 `Monster30` 中出现的 `bigtype` 如何入包。

## 首批掉落表形状

第一关相关例子：

### `Monster30`

- `probability = 0`
- `fallList = []`
- 死亡仍走 `dropAura()`，但不会掉装备/道具。

### `Monster3`

第一关 boss 时：

- `probability = 1`，随后 boss 分支在 `fallEquip()` 中再乘 `1.5`，实际必掉。
- `fallList` 为一批普通装备：`ptdxzg/ptdxzf/ptdcz/ptdjs/ptddp/ptdcs/ptdyyc/ptdcp/ptdtj/ptdcf`，`bigtype = "zb"`。

非 boss 时：

- `probability = 0.15`
- 掉落 `wptm/wpxt/wpsc`，`bigtype = "dj"`。

### `Monster7`

- `probability = 0.15`
- `fallList` 包含材料 `wptm/wpxt/wpsc`（`dj`）和一批普通装备 `ptdxzg/ptdxzf/ptdcz/ptdjs/ptddp/ptdcs/ptdyyc/ptdcp`（`zb`）。

这些数据足够支撑首个现代切片：用已在装备/背包切片出现过的 `ptdcz/ptdjs`、`wptm/wpxt/wpsc` 做最小物品集；如果需要 boss 必掉体验，可用 `Monster3` 的 `probability = 1` 规则或测试专用固定掉落。

## 首个 VS-009 需要的事实

最小实现数据：

- 至少 1 个装备定义：建议复用 `ptdcz` 或 `ptdjs`。
- 至少 1 个可堆叠道具定义：建议复用 `wptm/wpxt/wpsc` 之一。
- 掉落记录字段：`id/fillName`、`bigtype`、`x/y`、`picked`。
- 背包入口：`zb -> zblist`，`dj -> putQhsInBackPack()` 等价堆叠，`sz -> szlist` 可后置。
- 容量：每类首批按 125 格或现代现有 `InventorySystem` 容量处理。
- 反馈：地面物显示、成功拾取后向上淡出；可以用简洁文本或数量变化作为现代 UI 验收，但原版 `FallEquipObj` 本身未看到拾取 toast。

建议验收：

- 怪物死亡后生成一个可见地面物，位置在怪物上方约 100 像素。
- 玩家与地面物满足现代拾取判定后，物品进入对应背包分类。
- 道具同名时堆叠数量增加；装备作为独立实例加入装备背包。
- 背包满时不拾取，地面物保留并给出现代 UI 反馈。
- 不实现药品、aura、强化石、完整随机权重、所有怪物掉落表、合成、商城或存档。

## 现代实现建议

现代侧建议拆成：

| 原版入口 | 现代建议 |
| --- | --- |
| `BaseMonster.dropAura()/fallEquip()` | `DropSystem.spawnMonsterDrops(monster, killer, context)` |
| `fallList` | `MonsterDropTable` |
| `protectedParamsObject.probability` | `dropChance` |
| `FallEquipObj` | `WorldDrop` 数据模型 + 渲染对象 |
| `Config.putQhsInBackPack()` | `InventoryStore.addStackable(fillName, count)` |
| `User.zblist/djlist/szlist/jnslist` | 现有 `InventorySystem` 分类 store |

不要照搬原版 UI 和全局数组互相直接 `push/splice` 的结构。可观察行为上保留：死亡触发、概率和掉落候选、地面可见物、拾取入包、堆叠和背包满处理。

## 后续任务拆分

后续实现不要把药品、aura、强化石和完整掉落表混成一个大切片。推荐拆分为：

| 推荐任务 | 范围 | 前置已足够吗 | 不做 |
| --- | --- | --- | --- |
| `TASK-SLICE-015` | 药品掉落和即时恢复最小切片 | 足够：`addMedicine()`、`SmallHP/BigHP/SmallMP` 已扒 | 不入背包，不做 aura/强化石 |
| 后续 aura 切片 | 红/白 aura 生成、吸附、收益反馈 | 足够支撑最小表现；成长系统收益可先记录 | 不做经验/成长完整 UI |
| 后续强化石切片 | `wpqhs1` 作为 `dj` 掉落和入包 | 入包路径足够；触发入口不足 | 不做强化 UI/数值 |
| 后续完整表任务 | 把怪物掉落表转成现代配置 | `Monster3..30` 足够作首批；全怪物仍需继续扫描 | 不做装备属性和合成 |

## 后续缺口

- `VS-009` 已完成最小装备/道具掉落和拾取切片；本文新增事实只作为后续扩展任务依据。
- 如果要做全怪物完整掉落表，还需要系统扫描所有 `export/monster/Monster*.as` 的 `probability/fallList`，并补 `cwzb` 等非首批类型。
- 如果要校准原版装备/道具拾取距离，需要原版实测，因为 `FallEquipObj` 代码中未看到明确碰撞检查。
- 药品、aura、强化石应拆成后续小任务，避免把掉落切片做成成长系统大杂烩。

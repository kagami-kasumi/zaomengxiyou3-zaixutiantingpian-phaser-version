# 掉落/拾取系统索引

本文记录 `TASK-SETTINGS-014`、`TASK-SETTINGS-015` 和 `TASK-SETTINGS-016` 对怪物掉落和拾取系统的逆向结果。范围覆盖 `VS-009` 已实现的最小装备/道具掉落，也补齐药品、aura、强化石、`Monster3` 至 `Monster30` 掉落表边界，以及主参考包中其他 `Monster*.as` 的掉落表扫描。不展开合成、商城、法宝、存档或完整装备属性实现。

## 资料状态

主要 AS3 证据：

- `local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts/base/BaseMonster.as`
- `local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts/my/FallEquipObj.as`
- `local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts/config/Config.as`
- `local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts/user/User.as`
- `local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts/export/monster/Monster3.as`
- `local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts/export/monster/Monster7.as`
- `local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts/export/cure/SmallHP.as`
- `local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts/export/cure/BigHP.as`
- `local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts/export/cure/SmallMP.as`
- `local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts/base/BaseAura.as`
- `local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts/export/aura/auraRed.as`
- `local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts/export/aura/auraWhile.as`
- `local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts/export/monster/Monster3.as`
- `local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts/export/monster/Monster7.as` 至 `Monster30.as`
- `local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts/export/monster/Monster*.as`

相关前置文档：

- `docs/reverse-engineering/monsters-index.md`
- `docs/reverse-engineering/equipment-index.md`

资料缺口和疑点：

- 1.0 资料表位于 `docs/reverse-engineering/reference/再续1.0装备属性合成掉落表.xlsx`，拆分 CSV 位于 `docs/reverse-engineering/reference/equipment-spreadsheet/`，使用规则见 `docs/reverse-engineering/reference/equipment-spreadsheet.md`。其中 `drop-reference.csv` 可辅助定位 BOSS、副本和掉落物中文名；1.1 掉落事实仍以怪物类中的 `fallList` 为准。
- `FallEquipObj.colwho()` 未看到显式 `hitTestObject()` 或像素级碰撞判定；药品掉落 `SmallHP.colwho()` 有明确碰撞检测。装备/道具拾取的可观察距离建议后续用原版实测或录屏校准。
- `FallEquipObj` 的 `bigtype` 分支只处理 `zb/dj/sz`；全怪物扫描中发现 `Monster2001` 写入 `cwzb`，但 `TASK-SETTINGS-017` 确认主参考源码没有可用入包路径，现代配置时应继续标为 unsupported。
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

## `cwzb` 与 `Monster2001` 追踪结论

`TASK-SETTINGS-017` 只确认到一个 `cwzb` 来源：

- `local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts/export/monster/Monster2001.as`
- `local-resources/regima/legacy-extraction/resources_by_swf/[25034429].swf/scripts/export/monster/Monster2001.as`

两套源码中 `cwzb/p_cykljl/cykljl` 的全文检索结果一致：`p_cykljl` 只出现在 `Monster2001`，未在 `AllEquipment.as`、`Config.putQhsInBackPack()`、`User` 背包列表、`PetInfo` 或 `PetInterface` 中发现对应定义或处理分支。资源目录只额外发现 `score_cw_yuetu` 这类宠物积分/活动图标线索，未发现 `p_cykljl` 对应图标或 symbol。

`Monster2001` 还有一个实现层面的断点：

- 它写入的是 `protectedParamsObject.fallProbability = 0.1` 和 `protectedParamsObject.fallList = [{ name: "p_cykljl", bigtype: "cwzb" }]`。
- 可见的 `BaseMonster.fallEquip()` 读取的是 `protectedParamsObject.probability` 和 `this.fallList`。
- 主参考 `BaseMonster.as` 中未发现把 `protectedParamsObject.fallList` 复制到 `this.fallList`、或把 `fallProbability` 复制到 `probability` 的桥接代码。

因此按当前 AS3 可见路径，`Monster2001` 的 `cwzb` 更像未接通字段或遗留配置，而不是完整可拾取掉落。

即便未来有隐藏桥接让它创建 `new FallEquipObj({ name: "p_cykljl", bigtype: "cwzb" })`，`FallEquipObj.colwho()` 也没有 `cwzb` 分支。`switch` 不匹配后没有任何 `petsAry`、`zblist/djlist/szlist/jnslist` 或特殊列表写入；随后仍会执行 `isfirst = false` 和淡出移除逻辑。这意味着它最多会表现为“碰到后消失但不入包”，不是可靠奖励路径。

宠物系统本身已确认存在，但不通过 `cwzb`：

- 玩家宠物保存在 `User.petsAry`，单只宠物由 `PetInfo` 保存 `petName/hp/mp/level/lifetime/isFight/skill` 等字段。
- 宠物 UI 入口是 `RoleInfo.btn_cw -> PetInterface`。
- 宠物相关消耗品如 `cwzzxld`、`cwjnxld`、`djyys`、`wpcsd`、`wphhd`、`wphtd` 都是 `AllEquipment` 中的普通 `zbwp` 道具，走 `dj`/道具背包和 `PackThings` 使用逻辑。
- 新宠物主要通过 `User.catchNewPet()`、活动、商城、任务或法宝捕捉链路进入 `petsAry`，本轮未发现 `cwzb` 参与这些入口。

现代边界：

- 目前不新增现代 `DropBigType = "cwzb"`。
- `Monster2001` 在现代掉落表中继续保留为 `unsupported` 空分支，不伪装成 `dj/zb`，也不生成 `p_cykljl` 占位物。
- 若后续要实现宠物奖励，应先做宠物系统逆向/现代数据模型任务，而不是从 `cwzb` 直接接入掉落背包。

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

## 全 `Monster*.as` 掉落表扫描

`TASK-SETTINGS-016` 扫描主参考包 `export/monster/Monster*.as` 共 146 个文件；其中 `Monster3` 至 `Monster30` 已在上一节覆盖，下面只列新增扫描结果。

通用判定：

- `BaseMonster` 构造函数默认 `protectedParamsObject.probability = 0.15`，默认 `fallList = []`。表中“未显式赋值”表示该怪物构造函数没有覆盖默认值；如果 `fallList` 有候选，则基础掉率按默认 `0.15` 继续理解。
- `fallList` 空、无有效候选、`probability = 0` 或 `probability = -1` 时，不产生装备/道具掉落，但死亡仍可能走药品和 aura 逻辑。
- 扫描只记录构造函数里的 `probability`、`fallList`、`isBoss` 和明显条件分支；完整装备属性、中文名、合成/强化关系仍需用拆分 CSV 辅助定位，并回到装备系统 AS3 继续逆向。
- `MonsterRole4Hit5.as` 文件名匹配 `Monster*.as`，但没有同名构造函数，疑似角色技能辅助对象，不作为标准怪物掉落表处理。

| 怪物 | 条件/身份 | `probability` | `fallList` 摘要 | 边界说明 |
| --- | --- | --- | --- | --- |
| `Monster1` | 普通怪 | `0.18` | `wptm/wpxt/wpsc`（`dj`） | 材料池 |
| `Monster2` | `curStage == 3 && curLevel == 3` 或 `curStage == 8` 时普通，否则 boss | `0.8` | `kys/xhz/kyp`（`zb`） | boss/普通共用掉落池 |
| `Monster31` | boss | `0.3` | `wpqhs2/lssp_1/lssp_2/lssp_3/lssp_4/lssp_5`（`dj`） | 强化石/碎片池 |
| `Monster32` | boss | `0.4` | `sms1/fys1/gjs1/mfs1/lssp_1/lssp_2/lssp_3`（`dj`） | 宝石/碎片池 |
| `Monster33` | boss | `0.3` | `wpqhs1/wpqhs2/lssp_1/lssp_2/lssp_3/lssp_4`（`dj`） | 强化石/碎片池 |
| `Monster34` | boss | `0.2` | `wpqhs2/lssp_1/lssp_2/lssp_3/lssp_4/lssp_5`（`dj`） | 强化石/碎片池 |
| `Monster35` | boss | `0.4` | `xltzzzs/xleyzzs/xlnyzzs`（`dj`） | 特殊材料池 |
| `Monster36` | boss | `0.4` | `xltszzs/xlczzzs/xltqzzs`（`dj`） | 特殊材料池 |
| `Monster37` | boss | `0.4` | `llyzzs`（`dj`） | 特殊材料池 |
| `Monster38` | boss | `0.6` | `rls`（`dj`） | 特殊材料池 |
| `Monster39` | 普通怪 | `0.7` | `wptm/wpxt/wpsc`（`dj`） | 材料池 |
| `Monster40` | 普通怪 | `0.7` | `wptm/wpxt/wpsc`（`dj`） | 材料池 |
| `Monster41` | 普通怪 | `0.7` | `wptm/wpxt/wpsc`（`dj`） | 材料池 |
| `Monster42` | boss | `0.4` | `wpqhs4`（`dj`） | 强化石池 |
| `Monster43` | boss | `0.6` | `wplvdyl`（`dj`） | 特殊材料池 |
| `Monster44` | 普通怪 | `0` | 空 | 不掉装备/道具 |
| `Monster45` | 普通怪 | `0` | 空 | 不掉装备/道具 |
| `Monster46` | 普通怪 | `0` | 空 | 不掉装备/道具 |
| `Monster47` | boss | `0` | 空 | 不掉装备/道具 |
| `Monster53` | boss | `0.4` | `wpdd`（`dj`） | 特殊材料池 |
| `Monster54` | boss | `0.4` | `qljzzs/plpzzs/ylkzzs/jljzzs/clpzzs`（`dj`） | 特殊材料池 |
| `Monster55` | 普通怪 | `0.3` | `wplh`（`dj`） | 特殊材料池 |
| `Monster56` | 普通怪 | `0.3` | `wpxm`（`dj`） | 特殊材料池 |
| `Monster57` | 普通怪 | `0.3` | `wpll`（`dj`） | 特殊材料池 |
| `Monster58` | boss | `0.45` | `qlgzzs/plzzzs/ylfzzs/jlgzzs/jlczzs/_cljzzs`（`dj`） | 特殊材料池；名称含 `_cljzzs` 回退见 `FallEquipObj` |
| `Monster59` | 普通怪 | `0.3` | `wpsg`（`dj`） | 特殊材料池 |
| `Monster60` | boss | `0.05` | 空 | 有正掉率但无有效候选，不掉装备/道具 |
| `Monster61` | 普通怪 | `0.05` | 空 | 有正掉率但无有效候选，不掉装备/道具 |
| `Monster62` | 普通怪 | `0.3` | `wprs`（`dj`） | 特殊材料池 |
| `Monster63` | 普通怪 | `0.05` | 空 | 有正掉率但无有效候选，不掉装备/道具 |
| `Monster64` | boss | `0.6` | `sxzhs`（`dj`） | 特殊材料池 |
| `Monster65` | boss | `0.15` | `zy`（`zb`） | 装备池 |
| `Monster70` | 普通怪 | 默认 `0.15` | 空 | 不掉装备/道具 |
| `Monster71` | 普通怪 | 默认 `0.15` | 空 | 不掉装备/道具 |
| `Monster72` | 普通怪 | 默认 `0.15` | 空 | 不掉装备/道具 |
| `Monster73` | 普通怪 | 默认 `0.15` | 空 | 不掉装备/道具 |
| `Monster74` | 普通怪 | 默认 `0.15` | 空 | 不掉装备/道具 |
| `Monster75` | 普通怪 | 默认 `0.15` | 空 | 不掉装备/道具 |
| `Monster76` | 普通怪 | 默认 `0.15` | 空 | 不掉装备/道具 |
| `Monster77` | 普通怪 | 默认 `0.15` | 空 | 不掉装备/道具 |
| `Monster78` | 普通怪 | 默认 `0.15` | 空 | 不掉装备/道具 |
| `Monster100` | boss | `0.25` | `zsTimerup2`（`dj`） | 特殊道具池 |
| `Monster101` | boss | `0.25` | `zsTimerup2`（`dj`） | 特殊道具池 |
| `Monster102` | boss | `0.25` | `zsTimerup2`（`dj`） | 特殊道具池 |
| `Monster110` | 普通怪 | `0.8` | `wptm/wpxt/wpsc/xhb`（`dj`） | 材料池 |
| `Monster111` | boss | `0.4` | `wpdh`（`dj`） | 特殊材料池 |
| `Monster112` | 普通怪 | 默认 `0.15` | 空 | 不掉装备/道具 |
| `Monster113` | 普通怪 | 默认 `0.15` | 空 | 不掉装备/道具 |
| `Monster115` | boss | 默认 `0.15` | 空 | 构造函数写 `protectedParamsObject.fallList = []`，但掉落逻辑读取 `this.fallList`；需继续确认是否遗留字段 |
| `Monster116` | 普通怪 | `0.8` | `wptm/wpxt/wpsc/xhb`（`dj`） | 材料池 |
| `Monster117` | 普通怪 | `0.8` | `wptm/wpxt/wpsc/xhb`（`dj`） | 材料池 |
| `Monster118` | boss；分身会设为非 boss | `0` | 空 | 不掉装备/道具 |
| `Monster119` | 普通怪 | `0.8` | `wptm/wpxt/wpsc/xhb`（`dj`） | 材料池 |
| `Monster120` | boss | `0.27` | `zltc`（`zb`） | 装备池 |
| `Monster125` | boss | `0.4` | `wpbp`（`dj`） | 特殊材料池 |
| `Monster126` | 普通怪 | `0.8` | `wptm/wpxt/wpsc/xhb`（`dj`） | 材料池 |
| `Monster127` | boss | `0.36` | `wpzty`（`dj`） | 特殊材料池 |
| `Monster128` | boss；`averLevel > 20` 才填表 | `0.3` | `rls/wpccfq`（`dj`） | 平均等级不满足时 `fallList = []`，不掉装备/道具 |
| `Monster129` | boss | `0.3` | `wpxty`（`dj`） | 特殊材料池 |
| `Monster130` | boss | 默认 `0.15` | 空 | 不掉装备/道具 |
| `Monster131` | boss | `0.4` | `kly3/zhhzzzs`（`dj`） | 特殊材料池 |
| `Monster132` | 普通怪 | `0` | 空 | 构造函数写 `protectedParamsObject.fallList = []`；不掉装备/道具 |
| `Monster133` | 普通怪 | `0.8` | `wptm/wpxt/wpsc/xhb`（`dj`） | 材料池 |
| `Monster134` | boss | `0.3` | `wpccfq`（`dj`） | 特殊材料池 |
| `Monster135` | boss | `0.4` | `kly3/kly4/phhlzzs`（`dj`） | 特殊材料池 |
| `Monster136` | 普通飞行怪 | 先 `0.8` 后覆盖为 `0.1` | 最终 `xhb`（`dj`） | 构造函数先设材料池，末尾覆盖为 `xhb` 单项，现代配置应取最终值 |
| `Monster137` | boss | `0.3` | `wpccfq`（`dj`） | 特殊材料池 |
| `Monster139` | boss | `0.2` | `kly3/bxhyzzs`（`dj`） | 特殊材料池 |
| `Monster171` | 普通怪；`curStage == 5 && curLevel == 1` 有属性分支 | `0.15` | 空 | 不掉装备/道具 |
| `Monster172` | boss；`curStage != 4` 与 `curStage == 4` 两分支 | `curStage != 4` 分支 `1`；`curStage == 4` 分支 `0.1` | 非 4 关平均等级 `>= 50` 时 `xhb`（`dj`）；4 关掉 `lssp_6/lssp_7/lssp_8/lssp_9`（`dj`） | 非 4 关平均等级 `< 50` 时 `fallList = []` |
| `Monster181` | 普通怪；`curStage == 5 && curLevel == 1` 有属性分支 | `0.15` | 空 | 不掉装备/道具 |
| `Monster186` | boss | `0.3` | `wpfbyyin`（`dj`） | 特殊材料池 |
| `Monster187` | 普通怪 | `0` | 空 | 不掉装备/道具 |
| `Monster189` | boss | `0.28` | `wpfbyyan`（`dj`） | 特殊材料池 |
| `Monster203` | boss | `0.26` | `wpfbtc`（`dj`） | 特殊材料池 |
| `Monster205` | boss | 默认 `0.15` | 空 | 不掉装备/道具 |
| `Monster206` | 普通怪 | 默认 `0.15` | 空 | 不掉装备/道具 |
| `Monster207` | boss | 默认 `0.15` | `cs_fj_dz/cs_fj_zt/cs_fj_jt/cs_fj_js`（`zb`） | 未显式覆盖概率，按 BaseMonster 默认掉率理解 |
| `Monster208` | boss | 默认 `0.15` | 空 | 不掉装备/道具 |
| `Monster209` | boss | 默认 `0.15` | `wpst_1/wpsh_1/wpst_2/wpsh_2`（`dj`） | 未显式覆盖概率，按 BaseMonster 默认掉率理解 |
| `Monster210` | boss | 默认 `0.15` | `wpst_3/wpsh_3`（`dj`） | 未显式覆盖概率，按 BaseMonster 默认掉率理解 |
| `Monster211` | 普通怪 | 默认 `0.15` | 空 | 不掉装备/道具 |
| `Monster212` | boss | 默认 `0.15` | 空 | 不掉装备/道具 |
| `Monster213` | 未显式设置 | 默认 `0.15` | `wpxt`（`dj`） | 未显式设置 `isBoss`，按 BaseMonster 默认非 boss 理解 |
| `Monster261` | 普通怪 | `0` | 空 | 不掉装备/道具 |
| `Monster262` | 普通怪 | `0` | 空 | 不掉装备/道具 |
| `Monster263` | 普通怪 | `0` | 空 | 不掉装备/道具 |
| `Monster264` | boss | `0.1` | `qpjy`（`dj`） | 特殊材料池 |
| `Monster601` | boss | `0` | `wpycjh`（`dj`） | 有候选但零掉率，不掉装备/道具 |
| `Monster602` | boss | `0` | `wpycjh`（`dj`） | 有候选但零掉率，不掉装备/道具 |
| `Monster603` | boss | `0` | `wpycjh`（`dj`） | 有候选但零掉率，不掉装备/道具 |
| `Monster604` | boss | `0.36` | `wpycjh`（`dj`） | 特殊材料池 |
| `Monster999` | boss | `0` | 空 | 不掉装备/道具 |
| `Monster1000` | boss | `0.5` | `ywyd`（`zb`） | 装备池 |
| `Monster1001` | boss | `0.6` | `xhmt`（`zb`）+ `lxzhs`（`dj`） | 装备/道具混合池 |
| `Monster1002` | boss | `0.65` | `bx`（`dj`） | 特殊材料池 |
| `Monster1003` | boss | 默认 `0.15` | 空 | 不掉装备/道具 |
| `Monster1004` | boss | 默认 `0.15` | 空 | 不掉装备/道具 |
| `Monster1005` | boss | `1` | `zsTimer`（`zb`） | boss 掉率修正后实际必掉 |
| `Monster1006` | 普通怪 | `0` | 空 | 不掉装备/道具 |
| `Monster1007` | boss | `0.9` | `zsTimerup1`（`dj`） | 特殊道具池 |
| `Monster1008` | boss | `1` | `mdhf`（`zb`） | boss 掉率修正后实际必掉 |
| `Monster1111` | boss | `0.55` | `bxg`（`zb`） | 装备池 |
| `Monster2001` | boss | 可见主掉落路径仍是默认 `0.15`；类内另写了未被 `fallEquip()` 读取的 `fallProbability = 0.1` | `protectedParamsObject.fallList` 中写 `p_cykljl`（`cwzb`），但未赋给 `this.fallList` | 唯一发现 `cwzb`；`TASK-SETTINGS-017` 未发现可用入包路径，现代侧继续 unsupported |
| `Monster6001` | boss | `0` | `wpxt`（`dj`） | 有候选但零掉率，不掉装备/道具 |
| `Monster6002` | boss | `0.12` | `wpyh`（`dj`） | 特殊材料池 |
| `Monster6003` | boss | `0.12` | `wpkt`（`dj`） | 特殊材料池 |
| `Monster6004` | boss | `0` | `wpxt`（`dj`） | 有候选但零掉率，不掉装备/道具 |
| `Monster6005` | boss | `0.12` | `wpzh`（`dj`） | 特殊材料池 |
| `Monster6006` | boss | `0.12` | `wpyt`（`dj`） | 特殊材料池 |
| `Monster6007` | 普通怪 | `0` | `wpxt`（`dj`） | 有候选但零掉率，不掉装备/道具 |
| `Monster6008` | boss | `0` | `wpxt`（`dj`） | 有候选但零掉率，不掉装备/道具 |
| `Monster6009` | boss | `0.12` | `wpjh`（`dj`） | 特殊材料池 |
| `Monster6010` | boss | `0.12` | `wpdt`（`dj`） | 特殊材料池 |
| `Monster6011` | 普通怪 | `0` | `wpxt`（`dj`） | 有候选但零掉率，不掉装备/道具 |
| `Monster6012` | boss | `1` | `lwyp`（`dj`） | boss 掉率修正后实际必掉 |
| `Monster11111` | boss | `0` | 空对象 | `fallList = [{}]`，无有效 `name/bigtype`，不掉装备/道具；需确认是否占位/遗留 |
| `MonsterRole4Hit5` | 非标准文件 | 未确认 | 未确认 | 没有 `public function MonsterRole4Hit5()`，疑似技能辅助对象，不纳入标准怪物掉落表 |

完整表可实现所需字段：

- `monsterId` 或 AS3 类名。
- 场景条件：如 `curStage/curLevel`、boss/非 boss 分支。
- `probability` 基础掉率。
- `fallList[]` 的 `name` 和 `bigtype`。
- 是否 boss，用于 `fallEquip()` 中额外 `* 1.5`。
- 是否存在特殊拾取规则，如 `shsjt` 唯一性、`bosslist` 不超时、`probability = -1` 的条件掉落。

仍需拆分 CSV 辅助定位或实测补证：

- `fillName` 对应的中文名、装备部位、等级、属性、合成材料和强化关系。
- 各关卡实际会刷哪些怪、哪些分支会触发 boss/非 boss 版本。
- `FallEquipObj` 原版拾取距离或碰撞体表现。
- `cwzb` 已追踪到 `Monster2001` 的未接通/unsupported 配置；当前资料不支持作为可入包掉落实现。

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
| 后续宠物系统任务 | 宠物数据、捕捉、出战、消耗品和 UI 路径逆向 | `cwzb` 已确认不能直接作为掉落入包依据；宠物系统需从 `User.petsAry/PetInfo/PetInterface` 独立整理 | 不从 `cwzb` 伪造宠物奖励 |

## 后续缺口

- `VS-009` 已完成最小装备/道具掉落和拾取切片；本文新增事实只作为后续扩展任务依据。
- `TASK-SETTINGS-016` 已系统扫描所有 `export/monster/Monster*.as` 的 `probability/fallList`；后续现代配置扩展可直接引用上表，但装备属性、中文名、合成/强化关系仍需后续任务确认。`cwzb` 已由 `TASK-SETTINGS-017` 确认为不可直接入包的 unsupported 遗留/断点配置。
- 如果要校准原版装备/道具拾取距离，需要原版实测，因为 `FallEquipObj` 代码中未看到明确碰撞检查。
- 药品、aura、强化石应拆成后续小任务，避免把掉落切片做成成长系统大杂烩。



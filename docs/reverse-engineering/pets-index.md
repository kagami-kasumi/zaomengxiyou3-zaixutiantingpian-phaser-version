# 宠物系统索引

本文记录 `TASK-SETTINGS-018` 和 `TASK-SETTINGS-019` 对原版宠物系统的基础逆向结果。范围覆盖宠物主数据、存档字段、出战切换、战斗实体创建、捕捉/获得入口、消耗品、UI 快捷键，以及与掉落系统的边界；不展开完整宠物数值平衡、全部宠物技能表现或真实资源接入。

## 资料状态

主要 AS3 证据：

- `extracted_flash/scripts/172845/scripts/user/User.as`
- `extracted_flash/scripts/172845/scripts/petInfo/PetInfo.as`
- `extracted_flash/scripts/172845/scripts/base/BaseHero.as`
- `extracted_flash/scripts/172845/scripts/base/BasePet.as`
- `extracted_flash/scripts/172845/scripts/export/pet/PetInterface.as`
- `extracted_flash/scripts/172845/scripts/export/pet/PetHeadSprite.as`
- `extracted_flash/scripts/172845/scripts/export/pack/PackThings.as`
- `extracted_flash/scripts/172845/scripts/export/RoleInfo.as`
- `extracted_flash/scripts/172845/scripts/my/KeyBoardControl.as`
- `extracted_flash/scripts/172845/scripts/export/magicWeapon/MagicBottle.as`
- `extracted_flash/scripts/172845/scripts/base/BaseMagicWeapon.as`
- `extracted_flash/scripts/172845/scripts/export/monster/Monster70.as` 至 `Monster78.as`
- `extracted_flash/scripts/172845/scripts/export/huodong/ESShopThing.as`
- `extracted_flash/scripts/172845/scripts/export/huodong/ChineseValentinesDay.as`
- `extracted_flash/scripts/172845/scripts/export/huodong/kabu/ReceiveKaBuPacks.as`
- `extracted_flash/scripts/172845/scripts/export/MapMenu.as`
- `extracted_flash/scripts/172845/scripts/export/taskInterface/TaskInterface.as`

相关前置文档：

- `docs/reverse-engineering/drops-index.md`
- `docs/reverse-engineering/skills-input-index.md`
- `docs/reverse-engineering/equipment-index.md`
- `docs/reverse-engineering/magic-weapons-index.md`

## 主数据与容量

玩家宠物列表在 `User.petsAry`，构造时初始化为数组。原版最大宠物栏位来自 `AllConsts.GAME_PET_MAXSEATS = 10`。

`User.catchNewPet(petName, level = 1)` 是通用新增宠物入口：

1. 检查 `petsAry.length >= GAME_PET_MAXSEATS`，满栏时返回 `false`。
2. 创建 `new PetInfo()`。
3. 调用 `PetInfo.setPetNameAndLevel(petName, level)` 初始化。
4. push 到 `petsAry` 并返回 `true`。

`PetInfo.setPetNameAndLevel()` 会按等级归一化宠物形态段位：

- `level <= 15` 时使用 1 阶。
- `15 < level <= 30` 时使用 2 阶。
- `level > 30` 时保留传入宠物名尾号。

随后它设置中文名、特殊技能、等级、经验、寿命、被动加成、品质和初始属性。`level == 1` 时 `quality = 1`，否则 `quality = 2`。

## 存档格式

`User.getSaveObj()` 将 `petSave = getPetSaveString()` 写进顶层存档对象；`setSaveObj()` 读取 `param1.petSave` 后调用 `savePetSaveString()`。

多只宠物之间使用 `}` 分隔。单只宠物由 `PetInfo.getSaveString()` 输出 26 个 `|` 分隔字段：

| 序号 | 字段 |
| --- | --- |
| 0 | `petName` |
| 1 | `hp` |
| 2 | `shp` |
| 3 | `mp` |
| 4 | `smp` |
| 5 | `level` |
| 6 | `curExper` |
| 7 | `atk` |
| 8 | `def` |
| 9 | `moveSpeed` |
| 10 | `mDef` |
| 11 | `crit` |
| 12 | `miss` |
| 13 | `EHp` |
| 14 | `EMp` |
| 15 | `hpQuality` |
| 16 | `mpQuality` |
| 17 | `atkQuality` |
| 18 | `defQuality` |
| 19 | `lifetime` |
| 20 | `quality` |
| 21 | `perception` |
| 22 | `technique` |
| 23 | `warpower` |
| 24 | `isFight` |
| 25 | `skillSaveString` |

`skillSaveString` 内部使用 `~` 分隔技能名。读取时 `setSkillSaveString()` 会重建 `skill` 列表，并从 `allSkill` 池中移除已拥有技能，最后补特殊技能。

读取存档时存在上限修正：

- `level >= GAME_PET_MAXLEVEL` 且首轮加载时降到 `GAME_PET_MAXLEVEL - 1` 并清经验。
- `mDef` 最大 `0.36`。
- `crit` 最大 `0.75`。
- `miss` 最大 `0.48`。
- getter 侧将 `lifetime` 最大夹到 `100`，`perception/technique/warpower` 最大夹到 `8`。

## 出战与战斗实体

`PetInfo.isFight == 1` 表示当前出战宠物。`User.findCurrentPet(includeDead = false)` 倒序查找出战宠物：

- 默认只返回 `isFight == 1` 且 `lifetime > 0` 的宠物。
- `includeDead == true` 时可以返回寿命为 0 的出战宠物，供复活、洗练等道具逻辑使用。

`PetInterface.fightClick()` 负责出战切换：

1. 如果当前选择宠物 `hp <= 0`，拒绝出战。
2. 找到已有出战宠物并设为 `isFight = 0`。
3. 将当前选择宠物设为 `isFight = 1`。
4. 刷新列表，并通知英雄 `changePet()`。

`PetInterface.restClick()` 将当前宠物 `isFight = 0` 并通知英雄刷新；放生逻辑会从 `petsAry` 移除选中宠物，如果被放生宠物正在出战，也会刷新英雄宠物实体。

`BaseHero.initPet()` 是战斗实体创建入口：

- 本地玩家：读取 `getPlayer().findCurrentPet()`。
- 联机玩家：从 `MutiUser.petName/petLevel/petHp/petMp` 重建临时 `PetInfo`。
- 找到宠物后设置升级/形态变化回调，调用 `addPetByPi(PetInfo)` 创建具体 `BasePet` 子类，放到英雄位置上方并加入 `gc.gameSence`。

`BaseHero.addPetByPi()` 按 `petName` 映射具体类，覆盖：

- `monkey1-4`
- `horse1-4`
- `ufo1-3`，实际映射到 `PetKabu1-3`
- `tigress1-4`，实际映射到 `PetTiger1-4`
- `turtle1-4`
- `phoenix1-4`
- `dragon1-4`
- `rabbit1-4`
- `roomhorse1-4`
- `mouse1-4`
- `neat1-4`
- `nian1-5`
- `terribletiger1-4`，实际映射到 `PetYingTiger1/PetYingTiger4`

`BaseHero.updatePet()` 每帧调用 `myPet.step()`。`BaseHero.changePet()` 会 destroy 当前宠物、重新 `initPet()`，并在联机时同步 `MutiUser` 的宠物名、HP、MP。

## BasePet 行为边界

`BasePet` 是宠物战斗实体基类，保存 `sourceRole:BaseHero` 和 `_petInfo:PetInfo`。构造时从 `PetInfo` 取移动速度，后续每帧 `step()` 处理跟随、传送、动作、目标、技能、受击和联机同步。

已确认的基础行为：

- 宠物离来源英雄距离过远时会传送回英雄附近。
- 宠物会按当前状态进入等待、移动、普攻或技能动作。
- 宠物 HP/MP 使用 `PetInfo` 中的数据。
- 宠物可被魔法/攻击命中，会走闪避、扣血、受击提示和联机同步。
- 宠物死亡/扣血分支会把 HP 归零，并在部分死亡处理里降低 `lifetime`。
- `normalHit()` 进入 `hit1`。
- 宠物技能和被动很多，包括 `sxkb/fsnl/smjc/mfjc/gjjc/fyjc/qlfj` 等；首个现代切片不应一次实现完整技能表。

掉落系统已确认会把 `curAttackTarget is BasePet` 映射回来源英雄，保证 aura 归属按宠物主人结算。

## UI 与快捷键

`RoleInfo.btn_cw` 是宠物面板按钮。点击后 `RoleInfo.cwClick()` 创建 `new PetInterface(this.hero.getPlayer())` 并加入 UI；单人模式下会暂停游戏。再次触发或停止状态下会派发 `closePetInterface`。

`KeyBoardControl` 中宠物面板快捷键为：

| 玩家 | 快捷键数组 | 宠物入口 |
| --- | --- | --- |
| P1 | `[C, V, B, N, Esc]` | 第 3 项 `B`，keyCode `66`，派发 `btn_cw.click` |
| P2 | `[num /, num *, num -]` | 第 3 项 `num -`，keyCode `109`，派发 `btn_cw.click` |

`PetInterface` 一页显示 5 只宠物，标题显示 `petsAry.length/10`。面板会展示名称、等级、HP/MP、攻击、防御、悟性、技巧、战力、经验、寿命、四类资质、速度、额外 HP/MP、暴击、闪避、魔防和最多 8 个技能槽。

## 捕捉与获得入口

已确认宠物获得不是通过 `cwzb` 掉落入包，而是直接创建 `PetInfo` 或调用 `catchNewPet()`。

主要入口：

- `MagicBottle.step()`：宣花葫芦法宝命中指定怪物时消耗灵魂值，按怪物类型映射宠物名并调用 `sourceRole.getPlayer().catchNewPet(petName, bm.getLevel())`。成功后销毁怪物，满栏时提示宠物栏已满。
- `ESShopThing.as`：商城/活动购买前检查 `petsAry.length >= GAME_PET_MAXSEATS`，成功后 push 新 `PetInfo`。可获得 `tigress/turtle/phoenix/monkey/horse/dragon/mouse/rabbit` 等。
- `ChineseValentinesDay.as`：活动奖励 push `monkey1`。
- `ReceiveKaBuPacks.as`：卡布礼包 push `ufo1`。
- `MapMenu.as`：部分地图/活动入口 push `ufo1`。
- `TaskInterface.as`：任务奖励 `getroomhorsePet()` 创建并 push `roomhorse1`。

### MagicBottle 捕捉链路

宣花葫芦装备定义来自 `AllEquipment.sutra2`：装备名 `宣花葫芦`、`fillName = "xhhl"`、类型 `zbfb`、说明为有一定概率捕捉宠物。`BaseHero.initMagicWeapon()` 读取当前 `zbfb` 装备；当 `fillName == "xhhl"` 时创建 `new MagicBottle(this)` 并加入场景。背包穿戴、卸下或替换 `zbfb` 后都会调用 `hero.changeMagicWeapon()`，法宝使用中禁止切换。

触发入口是普通技能槽之外的法宝技能：

- `KeyBoardControl.player1SkillArray = [Y, L, U, I, O, Space, H]`，第 7 项 `H` 映射到 `sendSkill(6)`。
- `KeyBoardControl.player2SkillArray = [num8, num3, num4, num5, num6, num0, num7]`，第 7 项小键盘 `7` 映射到 `sendSkill(6)`。
- `BaseHero.sendSkill(6)` 调用 `showSkillFaBao()`。
- `showSkillFaBao()` 只在单人或本地房间的单机分支允许继续；如果当前有 `curMagicWeapon`，调用 `curMagicWeapon.useSkill()`。

`MagicBottle.showSkill()` 的前置条件和发射表现：

- 如果玩家灵魂值 `< 5000`，立刻把葫芦动作设回 `wait`，提示 `灵魂不足5000，无法捕捉！`，不会生成捕捉特效，也不会消耗灵魂。
- 灵魂足够时创建 `SpecialEffectBullet("MagicBottleEffect3")`，按英雄朝向放在英雄左侧或右侧约 70 像素处，`y = hero.y`。
- 特效设置为不可伤害的等待状态，加入 `sourceRole.magicBulletArray` 和 `gc.gameSence`。
- 约 2 秒后葫芦动作回到 `wait`。捕捉判定不等 2 秒结束，而是在后续每帧 `step()` 中检查特效碰撞。

`MagicBottle.step()` 捕捉判定：

- 每帧先执行 `BaseMagicWeapon.step()`，葫芦实体继续跟随英雄并播放自身动画。
- 仅在 `gc.isSingleGame()` 时检查捕捉；联机/非单机不会执行捕捉分支。
- 只遍历 `gc.pWorld.likeMonsterArray`，且只接受 `Monster70` 至 `Monster78`。
- 使用 `HitTest.complexHitTestObject(effect, bm.colipse)` 检查捕捉特效与怪物碰撞。
- 命中首个符合条件的怪物后立即扣除 `5000` 灵魂，再按怪物类型设置宠物名和概率。
- 成功、随机失败、满栏都会清空本次 `effect` 并退出循环；一次投掷最多处理一只怪物。

捕捉反馈：

- 随机成功且 `catchNewPet()` 返回 `true`：约 2 秒后提示 `捕捉成功！` 并销毁原怪物。
- 随机成功但宠物栏已满：立即提示 `宠物栏已满！`，怪物不销毁；灵魂已经扣除。
- 随机失败：立即提示 `捕捉失败！`，怪物不销毁；灵魂已经扣除。
- 命中怪物时会把 `MagicBottleEffect2` 临时加到怪物 `body`，失败或满栏后约 2 秒移除。

可捕捉怪物映射：

| 怪物 | 宠物名 | 捕捉概率 | 怪物资源 | 等级来源 |
| --- | --- | --- | --- | --- |
| `Monster70` | `horse1` | `0.4` | `PetHorseBmd1` | 50% 为 1 级；否则取玩家等级加约 `[-3, +2]` 浮动 |
| `Monster71` | `horse2` | `0.7` | `PetHorseBmd2` | 取玩家等级加约 `[-3, +2]` 浮动 |
| `Monster72` | `monkey1` | `0.4` | `PetMonkeyBmd1` | 50% 为 1 级；否则取玩家等级加约 `[-3, +2]` 浮动 |
| `Monster73` | `monkey2` | `0.7` | `PetMonkeyBmd2` | 取玩家等级加约 `[-3, +2]` 浮动 |
| `Monster74` | `tigress1` | `0.4` | `PetTigerBmd1` | 50% 为 1 级；否则 `2 + Math.random() * 13` |
| `Monster75` | `turtle1` | `0.4` | `PetTurtleBmd1` | 50% 为 1 级；否则 `2 + Math.random() * 13` |
| `Monster76` | `phoenix1` | `0.4` | `PetPhoenixBmd1` | 50% 为 1 级；否则 `2 + Math.random() * 13` |
| `Monster77` | `dragon1` | `0.4` | `PetDragonBmd1` | 50% 为 1 级；否则 `2 + Math.random() * 13` |
| `Monster78` | `rabbit1` | `0.4` | `PetPetRabbitBmd1` | 50% 为 1 级；否则 `2 + Math.random() * 13` |

捕捉成功调用 `catchNewPet(petName, bm.getLevel())`，所以怪物当前等级会直接进入 `PetInfo.setPetNameAndLevel()`，再由宠物初始化逻辑决定中文名、形态段位、品质和初始属性。

## 宠物消耗品

`PackThings.as` 中宠物相关物品都是普通 `AllEquipment`/`zbwp` 道具，走道具背包和使用逻辑，不走 `cwzb`。

已确认使用效果：

| 道具 | 效果 |
| --- | --- |
| `wphhd` | 对当前出战宠物调用 `reSetPetState()`，并刷新英雄宠物实体 |
| `wpcsd` | 当前出战宠物寿命 `+20`，上限 `100` |
| `djyys` | 当前出战宠物经验 `+30000`，通过 `getPet().petInfo.setCurExper()` 写入 |
| `cwzzxld` | 当前出战宠物调用 `refreshTherrAttributeByImmortality()`，重置悟性/技巧/战力相关属性 |
| `cwjnxld` | 当前出战宠物调用 `refreshPetAllSkillByLevel()`，按等级刷新技能 |
| `wphtd` | 当前出战宠物调用 `makePetBecomeChild()`，并刷新英雄宠物实体 |
| `nianqld` | 当前出战宠物 `potential + 100` |
| `nianjhd` | 当前出战宠物非第二形态时调用 `theFourShape(true)` |

这些分支都要求 `findCurrentPet(true) != null`，也就是必须存在被标记为出战的宠物；寿命为 0 的宠物也可被部分道具处理。

## 掉落边界

`TASK-SETTINGS-017` 已确认 `Monster2001` 中的 `cwzb/p_cykljl` 不是可用的宠物入包链路：

- `FallEquipObj.colwho()` 只处理 `zb/dj/sz`，没有 `cwzb` 分支。
- `p_cykljl` 未在 `AllEquipment`、背包、`PetInfo` 或 `PetInterface` 中发现对应定义。
- 可见宠物新增入口直接操作 `petsAry` 或调用 `catchNewPet()`。

现代实现不应新增 `DropBigType = "cwzb"` 来伪装宠物掉落。宠物消耗品可作为普通道具进入背包；宠物本体获得应走独立 `PetInfo`/宠物仓库入口。

## 最小现代模型建议

首个可玩宠物切片已完成出战和跟随。后续捕捉切片可继续复用这个保守模型：

```ts
type PetId = string;

interface PetState {
  id: PetId;
  species: string;
  form: number;
  displayName: string;
  level: number;
  exp: number;
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  atk: number;
  def: number;
  moveSpeed: number;
  lifetime: number;
  quality: number;
  perception: number;
  technique: number;
  warpower: number;
  isActive: boolean;
  skills: string[];
}
```

捕捉切片建议只实现：

- 复用现有 `PetSystem` 的宠物仓库、出战/休息和跟随实体。
- P1 默认可装备一个等价 `xhhl` 宣花葫芦，按 `H` 触发捕捉；P2/联机后置。
- 在测试场景放置 1-2 只 `Monster70-78` 等价可捕捉目标，先用稳定占位资源和碰撞体，不等待真实素材。
- 捕捉需要灵魂值门禁、命中扣除 `5000`、概率判定、满栏反馈、成功入宠物列表并移除怪物。
- 捕捉成功直接调用宠物列表新增入口，不生成 `cwzb` 掉落，不进入背包。

可以后置的内容：

- 完整宠物种族、形态、数值成长和资质公式。
- 全部宠物技能和专属攻击表现。
- 完整法宝系统、法宝强化 UI、所有其他法宝技能。
- 全部可捕捉怪物真实资源和刷怪分布。
- 宠物道具消耗和背包 UI 串联。
- P2/联机同步。

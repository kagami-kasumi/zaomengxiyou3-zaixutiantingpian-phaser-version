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

## 经验、升级和成长

`PetInfo` 保存宠物等级和经验，字段在 `Antiwear` 包装对象 `_anti` 中：

- `level`：当前等级。
- `curExper`：当前等级内经验。
- `hp/shp`：当前 HP / 最大 HP。
- `mp/smp`：当前 MP / 最大 MP。
- `atk/def`：攻击和防御。
- `hpQuality/mpQuality/atkQuality/defQuality`：四类资质，影响 MP、攻击等成长。

### 下级经验

`PetInfo.getPetNextExper()` 是宠物升级曲线：

| 当前等级 | 下级经验 |
| --- | --- |
| `level <= 10` | `level * 50` |
| `level > 10` | `(level + 1) * (level + 1) * (5 + (level - 10) * 2)` |

`AllConsts.GAME_PET_MAXLEVEL = 90`。`PetInfo.petUpdate()` 只在 `getLevel() < GAME_PET_MAXLEVEL` 时尝试升级。存档读取时如果首轮加载发现宠物等级 `>= GAME_PET_MAXLEVEL`，会降到 `GAME_PET_MAXLEVEL - 1` 并清经验。

### 升级触发

`PetInfo.setCurExper(value)` 写入 `_anti.curExper = value` 后立即调用 `petUpdate()`。因此战斗经验、任务奖励和宠物经验道具只要走 `setCurExper()`，都会共用同一个升级入口。

`petUpdate()` 行为：

1. 读取 `_loc1_ = getPetNextExper()`。
2. 如果 `curExper >= _loc1_`，先 `deletePassiveWhenUpdata()`。
3. 等级 +1。
4. 处理形态变化：
   - `16 <= level < 30` 且当前形态尾号为 `1` 时，宠物名尾号变成 `2`，补特殊技能、调用 `doWhenChangeState()`、刷新中文名和技能说明。
   - `level > 30` 且当前形态尾号为 `2` 时，宠物名尾号变成 `3`，同样补技能并触发形态变化回调。
5. 调用 `studySkillSuddenly(level)`，再 `addPassiveAfterUpdata()`。
6. 调用 `reSetPetAttributeValue()` 刷新属性，并 `upPassive()` 刷新额外 HP/MP、暴击、闪避、魔防等被动加成。
7. 如果有 `doWhenLevelUp` 回调，调用它；`BaseHero.doWhenLevelUp()` 会在当前宠物实体上添加 `PetLevelUpMc` 升级表现。
8. `setCurExper(curExper - _loc1_)` 扣除本级经验。因为 `setCurExper()` 会再次触发 `petUpdate()`，一次性获得大量经验时可以连续升级并保留溢出。

`BaseHero.initPet()` 会把 `PetInfo` 的 `doWhenLevelUp` 设为英雄的升级特效回调，把 `doWhenChangeState` 设为 `BaseHero.changePet()`。因此宠物形态变化会销毁并重建当前宠物战斗实体。

### 属性成长

`PetInfo` 构造中内置两条核心数组：

- `hpArr`：按等级索引的最大 HP 表，使用 `hpArr[level - 1]`。
- `defArr`：按等级索引的防御基表，升级/重算时常取 `int(defArr[level - 1] * 0.9)`。

捕捉或创建宠物时，`setPetNameAndLevel()` 会根据初始等级设置宠物形态、等级、经验 0、寿命 100、品质和初始属性。`level == 1` 的宠物为 `quality = 1`，否则 `quality = 2`。初始属性由 `initPetInfoData()` 按宠物种类和品质计算，非 1 级宠物带一定随机资质和初值。

升级后的通用刷新来自 `reSetPetAttributeValue()`：

- `SHp = hpArr[level - 1]`，并把当前 `Hp` 回满到 `SHp`。
- `SMp += mpQuality * 0.08`，并把当前 `Mp` 回满到 `SMp`。
- `Atk += atkQuality * 0.015`。
- `Def = int(defArr[level - 1] * 0.9)`。
- `level >= 60` 时额外增加少量闪避、魔防和暴击随机成长。

存档读取后的 `setPetValue(petName)` 会按当前等级和宠物种类重建基础 HP/MP/攻击/防御。首批现代实现可用 `setPetValue()` 的确定性公式做初始化和读档重建，用 `reSetPetAttributeValue()` 的增量规则做升级：

| 宠物种类 | 最大 MP 基数 | 攻击基数 |
| --- | --- | --- |
| `monkey` | `150` | `20` |
| `horse` | `250` | `25` |
| `ufo` | `150` | `30` |
| `mouse` | `200` | `32` |
| `dragon` | `175` | `25` |
| `turtle` | `150` | `25` |
| `tigress` | `150` | `30` |
| `phoenix` | `200` | `32` |
| `roomhorse` | `800` | `50` |
| `rabbit` | `200` | `30` |

这些 `setPetValue()` 分支统一使用：

- `SHp = hpArr[level - 1]`。
- `SMp = mpBase + mpQuality * 0.08 * (level - 1)`。
- `Atk = atkBase + atkQuality * 0.015 * (level - 1)`。
- `Def = int(defArr[level - 1] * 0.9)`。

`setPetValue()` 当前没有覆盖 `neat/nian/terribletiger` 等后续宠物族，首个现代成长切片不应伪造这些族的完整公式。

### 经验来源

`BaseMonster.reduceHp()` 普通死亡路径：

- 击杀目标是 `BaseHero` 且英雄有当前宠物时：玩家获得 `monster.exp * 0.6`，当前宠物获得 `monster.exp * 0.6`。
- 击杀目标是 `BaseHero` 且无宠物时：玩家获得完整 `monster.exp`。
- 击杀目标是 `BasePet` 时：宠物获得完整 `monster.exp`。

特殊怪 `Monster111` 覆写死亡经验：

- 击杀目标是英雄且有宠物时，玩家和宠物各获得完整 `monster.exp`。
- 击杀目标是英雄且无宠物时，尝试给 P1/P2 英雄都加经验，且以击杀者当前经验为基准；这是特殊/异常路径，不作为普通规则。
- 击杀目标是宠物时，宠物获得完整 `monster.exp`。

`TaskInterface` 的任务奖励类型 `"exp"`：

- P1 有当前宠物时，给该宠物 `curExper += award.value`，否则直接写 `player1.curExp`。
- P2 分支代码也先读取 `player1.findCurrentPet()`，若存在则仍给 `_loc3_` 宠物加经验，否则写 `player2.curExp`；这是原版旁路/疑似 bug，首个现代宠物成长切片不应复刻该异常。

`PackThings` 的宠物经验道具：

- `djyys` 要求 `findCurrentPet(true)` 非空，否则提示“你还没有出战的宠物”并返回。
- 有宠物时调用当前英雄 `getPet().petInfo.setCurExper(getCurExper() + 30000)`，提示“宠物增加经验30000点”。
- 因为走 `setCurExper()`，`djyys` 与自然战斗经验共用升级、形态变化、属性刷新和溢出经验逻辑。

## 现代宠物成长切片建议

推荐后续切片为 `VS-015 宠物经验/升级最小闭环`：

- 只覆盖 P1 当前出战宠物。
- 接入 `Monster30` 击杀时的普通分成：有出战宠物时玩家与宠物各得 `60%`，无宠物时玩家得完整经验。
- 接入 `djyys` 等价测试道具或现有宠物消耗品入口，使它走同一个 `setCurExper()` 等价函数。
- 支持当前出战宠物升级、扣除本级经验、保留溢出、HP/MP 回满、基础属性按当前宠物族首批公式刷新。
- 首批可先覆盖当前现代种子宠物使用的族；未确认 `setPetValue()` 公式的宠物族、60 级后随机暴击/闪避/魔防、形态变化实体重建、任务奖励异常、P2 宠物、存档和全部技能后置。

## 技能、技能槽和战斗触发

`PetInfo` 中 `skill:Array` 保存已学技能，元素结构为 `{sname, sinfo}`；`allSkill:Array` 是当前还可能学到的候选池。构造函数把 `skill` 初始化为空数组，并把基础候选池设为：

| 技能 key | 中文名 | 基础分类 |
| --- | --- | --- |
| `tsml` | 天生蛮力 | 被动属性 |
| `zrsh` | 自然守护 | 被动属性 |
| `smzf` | 生命祝福 | 被动属性 |
| `mfby` | 魔法庇佑 | 被动属性 |
| `qlfj` | 强力反击 | 被动/反击 |
| `sxkb` | 嗜血狂暴 | 自动 buff |
| `fsnl` | 法术能量 | 自动 buff |
| `smjc` | 生命加成 | 自动 buff |
| `mfjc` | 魔法加成 | 自动 buff |
| `gjjc` | 攻击加成 | 自动 buff |
| `fyjc` | 防御加成 | 自动 buff |

`PetInterface.setPetAllSkill()` 明确清理并刷新 `skill1` 到 `skill8` 八个 UI 槽；这只是界面容量。自动学习时的上限来自 `skill.length >= getperception()`，普通悟性上限不是 8。超级进化入口 `AfterSuperRevolution()` 会在悟性 `< 8` 时 +1 并刷新技能 UI，属于后续切片范围。

### 技能存档

原版没有单独命名为 `skillSaveString` 的公开字段，但有等价函数：

- `getSkillSaveString()`：把已学技能的 `sname` 用 `~` 拼接，例如 `xj~tsml`。
- `setSkillSaveString(value)`：清空 `skill`，按 `~` 拆出 `sname`，为每个技能重建 `{sname, sinfo:getIntroByName(sname)}`，并从 `allSkill` 候选池移除已学技能，最后调用 `addSpecialSkill()` 补当前形态候选。
- `getSaveString()` 的单只宠物存档共 26 个 `|` 字段，最后一个字段，也就是索引 `25`，是 `getSkillSaveString()`；索引 `24` 是 `isFight`。

首个现代技能切片可先不接完整存档，但数据模型应保留 `learnedSkills: string[]` 或等价字段，避免后续接 `sname~sname` 时重拆结构。

#### `skillSaveString` 读取边界

证据：

- `extracted_flash/scripts/172845/scripts/petInfo/PetInfo.as`
  - `getSkillSaveString()` 行 2233 附近。
  - `setSkillSaveString(value)` 行 2250 附近。
  - `getSaveString()` 行 2283 附近。
  - `setSaveString(value)` 行 2351 附近。
- `extracted_flash/scripts/172845/scripts/user/User.as`
  - `getPetSaveString()` 行 955 附近。
  - `savePetSaveString(value)` 行 972 附近。

事实：

- `getSkillSaveString()` 只序列化当前 `skill` 数组中已有项目的 `sname`，中间用 `~` 拼接；没有技能时返回空字符串。
- `setSkillSaveString("")` 会保持 `skill = []`，随后仍调用 `addSpecialSkill()` 重建当前形态候选池；不会凭空学会技能。
- `setSkillSaveString(value)` 不校验 `sname` 是否属于当前宠物候选池。未知 key 也会被塞进 `skill`，`sinfo` 由 `getIntroByName(key)` 派生；若候选池里找不到该 key，就不会从 `allSkill` 删除。这意味着现代读取可以选择兼容保留未知 key，但 UI 应显示安全 fallback。
- 单只宠物的 `skillSaveString` 属于 `PetInfo.getSaveString()` 的第 26 个字段，索引 `25`；整组宠物由 `User.getPetSaveString()` 使用 `}` 连接。读取时 `User.savePetSaveString(value)` 对每段非空字符串 new `PetInfo()` 并调用 `setSaveString()`。
- `setSaveString()` 在读取字段 `25` 后调用 `transPetChinaName()` 和 `setPetValue(petName)`。因此技能读取发生在宠物基础字段恢复之后，后续属性刷新可能再根据当前宠物名/等级修正显示和数值。

现代边界：

- 后续最小存档实现应把 `PetState.skills: string[]` 映射为原版 `sname~sname`，并保留空字符串为“无已学技能”。
- 读取未知技能 key 时，建议保留 key、使用 `getIntroByName` 等价 fallback 或显示 `unknown`，不要在读取阶段静默丢弃；但释放技能仍必须走已支持技能白名单，避免未知 key 触发未实现行为。
- `skillSaveString` 只保存已学技能，不保存当前 `allSkill` 候选池；候选池应由宠物种类/形态、已学技能和 `addSpecialSkill()` 等价规则重建。

### 宠物面板 8 槽和技能重置

证据：

- `extracted_flash/scripts/172845/scripts/export/pet/PetInterface.as`
  - 字段 `skill1` 到 `skill8` 行 75 至 89 附近。
  - `reSkills()` 行 172 附近。
  - `setPetInfomation()` 行 359 附近。
  - `setPetAllSkill()` 行 364 附近。
  - `AfterSuperRevolution()` 行 592 附近。
- `extracted_flash/scripts/172845/scripts/export/pack/PackThings.as`
  - 背包道具 `cwjnxld` 分支行 712 附近。
- `extracted_flash/scripts/172845/scripts/my/AllEquipment.as`
  - `cwjnxld` 定义行 2700 附近。

事实：

- `PetInterface` 声明 `skill1` 到 `skill8` 共 8 个显示槽；`setPetAllSkill()` 每次先对 8 个槽调用 `removeSkill()`，再按 `pif.skill` 的顺序把 `{sname,cname,sinfo}` 写入 `skill1..skillN`。
- `PetInterface` 内没有单个技能槽点击学习、遗忘或拖拽绑定逻辑；全局搜索中 `setCurrentSkill/removeSkill` 的宠物路径只出现在 `PetInterface.setPetAllSkill()`。因此 8 槽是展示容量，不是学习入口。
- 自动学习的硬上限不是 8 槽，而是 `PetInfo.studySkillSuddenly()` 中的 `skill.length >= getperception()`。`AfterSuperRevolution()` 会在 `perception < 8` 时 `+1` 并刷新技能 UI，所以现代 UI 上限可以先按 8 槽展示，但学习上限仍应读取悟性。
- `PetInterface.reSkills()` 的按钮 `czjnbtn` 要求玩家背包有 `cwjnxld`，调用当前面板宠物 `refreshPetAllSkillByLevel()`，刷新 8 槽并消耗 `cwjnxld` 1 个，成功提示“重置完成”。
- 背包直接使用 `cwjnxld` 时，`PackThings` 要求 `findCurrentPet(true)` 存在，否则提示“你还没有出战的宠物”；成功时对当前出战宠物调用 `refreshPetAllSkillByLevel()` 并消耗道具。面板按钮和背包道具入口目标不同：面板按钮作用于当前面板选中宠物，背包入口作用于当前出战宠物。
- `AllEquipment` 中 `cwjnxld` 中文名为“宠物技能洗练丹”，说明是“服用后可以重新获得宠物技能”；这不是指定技能书学习入口。

现代边界：

- `TASK-SLICE-048` 可先实现宠物面板中 8 槽展示 `PetState.skills`，显示中文名/说明，空槽显示为空。
- 首版可只实现背包内 `cwjnxld` 对当前出战宠物的等价技能重置，不必实现面板按钮版本、商城来源或完整素材。
- 技能重置应重建候选池并按当前等级回放自动学习窗口；由于原版随机，现代首版应使用可注入随机源保证系统测试可复现。
- 不应实现宠物技能书手动学习，因为当前 AS3 证据显示普通 `jns` 技能书已经提示“技能书不再有用”，宠物技能学习来自升级随机和洗练丹重算。

### 候选池和自动学习

`setPetNameAndLevel()` 会调用 `addSpecialSkill()`，升级重建候选时走 `refreshPetAllSkillByLevel()`：先 `deletePassiveWhenUpdata()`，把 `allSkill` 还原为基础候选池，清空 `skill`，再由 `rePetSkill()` 按宠物种类/形态补候选并回放历史等级的随机学习检查。

`studySkillSuddenly(level)` 的可观察规则：

- 只在 `level == 3 * (n + 1) - 1` 时尝试学习，也就是 2、5、8、11……这些等级。
- 如果已学数量 `>= getperception()`，直接返回。
- 如果 `Math.random() > 0.4`，直接返回；因此命中学习窗口时约 40% 概率学习。
- 真正学习时从 `allSkill` 随机取一个 key，写入 `{sname, sinfo}`，并把该 key 从候选池移除。

升级入口 `petUpdate()` 的顺序是：先移除旧被动，等级 +1，形态阈值可能改 `petName` 并调用 `addSpecialSkill()`/`changePetSkillIntroduce()`，再调用 `studySkillSuddenly(level)`，之后重新添加已学被动、刷新属性和额外被动。形态变化本身不是无条件学会新技能，只是调整候选池和技能说明。

猴子形态的候选池最小表：

| 形态 | 额外候选 |
| --- | --- |
| `monkey1` | `xj` 献祭 |
| `monkey2` | `xj` 献祭、`lj` 连击 |
| `monkey3` | `xj` 献祭、`lj` 连击、`lyq` 烈焰拳 |
| `monkey4` | `xj` 献祭、`lj` 连击、`lyq` 烈焰拳、`jgaoyi` 金刚奥义 |

`addSpecialSkill()` 在形态推进时还会从候选池移除旧形态技能并加入新形态技能：`monkey1 -> monkey2` 时倾向移除 `xj`、加入 `lj`；`monkey2 -> monkey3` 时倾向移除 `lj`、加入 `lyq`。它会检查技能是否已学或已在候选池中，避免重复加入。

### 被动和自动 buff

证据：

- `extracted_flash/scripts/172845/scripts/petInfo/PetInfo.as`
  - 基础候选池行 40 附近，包含 `tsml/zrsh/smzf/mfby/qlfj/sxkb/fsnl/smjc/mfjc/gjjc/fyjc`。
  - `getIntroByName()` 行 843 附近，给出中文说明和持续秒数展示。
  - `getPetHarmObj()` 行 1017 附近，给出被动、自动 buff 和部分主动技能数值公式；函数末尾统一把 `first` 乘以 `1.05`。
  - `deletePassiveWhenUpdata()` / `addPassiveAfterUpdata()` 行 1812 / 1851 附近，负责升级或重算属性前后移除和重加基础被动。
  - `findPetUsedMagic()` 行 1862 附近，给出 MP 消耗：基础被动和 `qlfj` 为 0，六个自动 buff 为 20。
- `extracted_flash/scripts/172845/scripts/base/BasePet.as`
  - `sxkbCount/fsnlCount/smjcCount/mfjcCount/gjjcCount/fyjcCount` 初值均为 300。
  - `checkBuffSkill()` 行 405 附近，每帧递减计数器并在计数归零、已学技能、MP 足够时自动加 buff。
  - `reduceHp()` 行 909 附近，`qlfj` 在受击路径中按概率触发 `normalHit()`。
  - `getCriteValue()` / `getMagicAddValue()` 行 819 / 847 附近，读取 `PET_SXKB` 和 `PET_FSNL` 的宠物自身 buff。
- `extracted_flash/scripts/172845/scripts/base/BaseRoleProperies.as`
  - `addBuff()` / `removeBuff()` 行 365 / 440 附近，读取主人身上的 `PET_SMJC/MFJC/GJJC/FYJC` 并调整 HP/MP 上限、基础攻击或防御。
- `extracted_flash/scripts/172845/scripts/base/BaseAddEffect.as`
  - 行 88 至 98 定义六个宠物自动 buff 名；行 1454 附近负责 buff 结束时隐藏对应表现。

基础属性被动不走 `BasePet.checkBuffSkill()`，而是在 `PetInfo` 刷新属性前后成对移除/重加。`deletePassiveWhenUpdata()` / `addPassiveAfterUpdata()` 负责升级、属性刷新和洗练重算前后的数值一致性：

| 技能 | 效果入口 |
| --- | --- |
| `tsml` 天生蛮力 | `atk += getPetHarmObj("tsml").first`，公式为 `curPetState * 6 * warpower * 1.05` |
| `zrsh` 自然守护 | `def += getPetHarmObj("zrsh").first`，公式为 `curPetState * 4 * technique * 1.05` |
| `smzf` 生命祝福 | `hp/shp += getPetHarmObj("smzf").first`，公式为 `curPetState * 50 * warpower * 1.05` |
| `mfby` 魔法庇佑 | `mp/smp += getPetHarmObj("mfby").first`，公式为 `curPetState * 50 * technique * 1.05` |

`qlfj` 强力反击是受击反击，不是持续 buff：`findPetUsedMagic("qlfj")` 返回 0；`BasePet.reduceHp(damage, true)` 在宠物存活且走受击表现路径时检查已学 `qlfj`，取 `getPetHarmObj("qlfj").first = (0.05 + curPetState / 100) * warpower * 1.05` 作为概率，`Math.random() <= 概率` 时立刻调用 `normalHit()`，失败才继续普通受击动作。它不消耗 MP，不走 `skillCD1..4`，也不进入 `checkBuffSkill()` 计数器。

`BasePet.checkBuffSkill()` 每帧检查六个已学自动 buff，并按 MP 门禁自动释放。每个计数器初值为 300，计数归零后才会尝试第一次释放；释放成功后 `sxkb` 计数设为 4320，其余五个计数设为 5400。成功释放都会消耗 20 MP，添加 `BaseAddEffect`，并以 `getPetHarmObj(skill).second * gc.frameClips` 作为 buff 持续时间。

| 技能 | 目标 | 数值 `first` | 持续 `second` | 重触发计数 | 现代含义 |
| --- | --- | --- | --- | --- | --- |
| `sxkb` 嗜血狂暴 | 宠物自身 `curAddEffect`，`PET_SXKB` | `curPetState * 0.07 * technique * 0.27 * 1.05` | `(30 + curPetState * 5) * warpower / 2 * 0.6` 秒 | 4320 | `BasePet.getCriteValue(true)` 读取该 buff，把值加到宠物暴击率 |
| `fsnl` 法术能量 | 宠物自身 `curAddEffect`，`PET_FSNL` | `curPetState * 30 * technique * 1.05` | 同上 | 5400 | `BasePet.getMagicAddValue()` 返回该 buff 值，作为宠物技能额外伤害加值 |
| `smjc` 生命加成 | 来源英雄 `sourceRole.curAddEffect`，`PET_SMJC` | `curPetState * 70 * technique * 1.05` | 同上 | 5400 | `BaseRoleProperies.addBuff()` 提升主人 HP 上限，并按当前 HP 比例同步当前 HP |
| `mfjc` 魔法加成 | 来源英雄，`PET_MFJC` | `curPetState * 70 * technique * 1.05` | 同上 | 5400 | 提升主人 MP 上限，并按当前 MP 比例同步当前 MP |
| `gjjc` 攻击加成 | 来源英雄，`PET_GJJC` | `curPetState * 6 * technique * 1.05` | 同上 | 5400 | 提升主人 `basePower` |
| `fyjc` 防御加成 | 来源英雄，`PET_FYJC` | `curPetState * 5 * technique * 1.05` | 同上 | 5400 | 提升主人 `defense` |

`findPetUsedMagic()` 给出 MP 消耗边界：基础被动和 `qlfj` 消耗 0；普通主动/自动 buff 多数消耗 20；奥义类消耗 30。`getPetHarmObj()` 给出最小数值来源，其中猴子主动技能为 `xj = 2.6 * atk`、`lj = 4.2 * atk`、`lyq = 6.8 * atk`。

#### 其他宠物技能类别边界

`PetInfo.addSpecialSkill()` 表明除基础候选池外，各宠物形态还会追加形态专属技能。它们大多通过具体 `Pet*.as` 的 `beforeSkillNStart()` / `releSkillN()` 在宠物 AI 中自动释放，不是玩家手动技能书入口。当前现代侧只完成了猴子 `xj/lj/lyq/jgaoyi`，其余专属技能仍未复现。

| 宠物族/形态推进 | 追加技能链 |
| --- | --- |
| 猴子 `monkey1..4` | `xj -> lj -> lyq -> jgaoyi`，现代已覆盖 |
| 马 `horse1..4` | `sp -> bd -> bz -> tmaoyi` |
| UFO `ufo1..3` | `pms -> ss -> kmsk` |
| 白虎/母虎 `tigress1..4` | `hy -> sxhz -> hsqj -> bhaoyi` |
| 玄龟 `turtle1..4` | `sld -> txlj -> sybh -> xwaoyi` |
| 凤凰 `phoenix1..4` | `np -> bshn -> dhly -> zqaoyi` |
| 青龙 `dragon1..4` | `fs -> sdcc -> ltwj -> qlaoyi` |
| 玉兔 `rabbit1..4` | `yg -> jf -> bs -> ysaoyi` |
| 房日兔/坐骑马 `roomhorse1..4` | `hybt -> hhjt` |
| 子鼠 `mouse1..4` | `sc -> hxfb -> zsaoyi` |
| 丑牛 `neat1..4` | `mncz -> mljt -> cnaoyi` |
| 年兽 `nian1..5` | `qxyl -> bhjm -> jhgy` |
| 影虎 `terribletiger1..4` | `hx -> mhxs -> yhaoyi` |

现代 `VS-024` 建议优先实现基础技能中的一个可观察且不依赖新宠物资源的闭环。推荐首个实现目标是 `smjc` 或 `gjjc`：它们只要求当前出战宠物已学对应技能、有 20 MP、计数归零后自动给来源英雄加 HP 上限或攻击，系统测试可用纯数据模型验证 buff 添加、MP 消耗、持续时间和到期移除。`sxkb/fsnl` 作用在宠物自身战斗计算上，也适合作为后续切片；`qlfj` 依赖宠物受击与普攻反击路径，可作为第二批反击切片。继续禁止一次性实现全部宠物专属技能、真实 buff 特效、P2/联机同步和完整资源替换。

### 出战宠物主动技能链路

`BasePet` 初始化 `skillCD1..4 = [-1, 30]`，每帧 `countSkillCD()` 递减冷却。`myIntelligence()` 在有目标、未受伤且未攻击时，按 `skill1 -> skill2 -> skill3 -> skill4` 顺序检查：

1. `beforeSkillNStart()` 返回 true。
2. 对应 `skillCDN[0] == 0`。
3. 调用 `releSkillN()`，再把冷却重置为 `skillCDN[1]`。

`beforeSkillNStart()` 和 `releSkillN()` 默认空实现，具体宠物类覆写。若四个技能都不能释放，宠物才按普攻距离和 `attackRate` 走 `normalHit()`。

猴子首批链路：

| 类 | 技能槽 | 条件 | 动作/伤害 |
| --- | --- | --- | --- |
| `PetMonkey1` | skill1 | 已学 `xj`、MP 足够、`skill1Release == true`、CD1 就绪 | `releSkill1()` 进入 `hit2`，扣 `xj` MP，`doHit2()` 发 `PetMonkey1Bullet2`；`getRealPower("hit2")` 用 `getPetHarmObj("xj") = 2.6 * atk` |
| `PetMonkey2` | skill1 | 已学 `lj`、MP 足够、CD1 就绪 | `hit2`，伤害取 `lj = 4.2 * atk` |
| `PetMonkey2` | skill2 | 已学 `xj`、MP 足够、`skill2Release == true`、CD2 就绪 | `hit3`，伤害取 `xj = 2.6 * atk` |
| `PetMonkey3` | skill1 | 已学 `lyq`、MP 足够、目标距离 `<= 400`、CD1 就绪 | `hit2`，伤害取 `lyq = 6.8 * atk` |
| `PetMonkey3` | skill2 | 已学 `xj`、MP 足够、CD2 就绪 | `hit3`，伤害取 `xj = 2.6 * atk` |
| `PetMonkey3` | skill3 | 已学 `lj`、MP 足够、`skill3Release == true`、CD3 就绪 | `hit4`，伤害取 `lj = 4.2 * atk` |

`PetMonkey1.reduceHp()` 会把 `skill1Release = true`，因此 `monkey1/xj` 是“宠物受击后允许释放”的反击式主动技能，不是空闲自动常驻释放。技能释放后 `doHit2()` 把 `skill1Release` 重新设为 false。

马系首批链路：

`BaseHero.addPetByPi()` 按 `horse1..4` 分别创建 `PetHorse1..4`。`PetInfo.rePetSkill()` 会把马系候选池扩成 `horse1: sp`、`horse2: sp/bd`、`horse3: sp/bd/bz`、`horse4: sp/bd/bz/tmaoyi`；`addSpecialSkill()` 在 `horse1 -> horse2` 时把 `sp` 从候选池移除并追加 `bd`，在 `horse2 -> horse3` 时把 `bd` 移除并追加 `bz`。四阶奥义不是普通技能书入口：`PetInterface.revolution()` 要求 `horse3` 且等级 `>= 50` 后调用 `PetInfo.theFourShape()`，再由 `studyEsoteric()` 直接把 `tmaoyi` 加入已学技能；道具 `nianjhd` 也会对当前出战宠物调用同一四阶入口。普通角色技能书 `jns` 不参与宠物专属技能学习。

`findPetUsedMagic()` 给出马系消耗：`sp/bd/bz` 都消耗 20 MP，`tmaoyi` 消耗 30 MP。`getPetHarmObj()` 给出伤害基数：`sp = 3.6 * atk * 1.05`、`bd = 3.6 * atk * 1.05`、`bz = 6.6 * atk * 1.05`，`tmaoyi` 本身为 0；奥义的实际伤害来自 `hit5_1` 复用 `sp` 伤害和 `hit5_2` 复用 `bz` 伤害。所有这些伤害在宠物类 `getRealPower()` 中还会叠加 `fsnl` 的 `getMagicAddValue()`、`sxkb` 的宠物暴击 2 倍，以及 `isGXP` 的 1.2 倍；`PetHorse4` 额外乘 `hurtBaseEffectRate()`。

| 类 | 技能槽 | 条件 | 动作/伤害 |
| --- | --- | --- | --- |
| `PetHorse1` | skill1 `sp` | 已学 `sp`、MP 足够、目标距离 `50..100`、CD1 就绪 | `hit2`，扣 20 MP；第 4 帧附近生成 `FollowBaseObjectBullet("PetHorse1Bullet2")`，`attackBackInfoDict.hit2` 为 magic、击退 `[5,0]`、`attackInterval = 24`、附加 `PETHORSE_ICE` 2 秒；伤害取 `sp = 3.6 * atk * 1.05` |
| `PetHorse2` | skill1 `bd` | 已学 `bd`、MP 足够、`skill1Release == true`、CD1 就绪；`reduceHp()` 设置触发标记 | `hit2`，扣 20 MP，`doHit2()` 前 `setYourFather(15)`，生成 `FollowBaseObjectBullet("PetHorse2Bullet2")` 且 `setHurtCanCutDownEffect(false)`，命中后清 `skill1Release`；伤害取 `bd = 3.6 * atk * 1.05`，同样附加 2 秒 `PETHORSE_ICE` |
| `PetHorse2` | skill2 `sp` | 已学 `sp`、MP 足够、目标距离 `50..100`、CD2 就绪 | `hit3`，扣 20 MP，生成 `SpecialEffectBullet("PetHorse1Bullet2")`；伤害取 `sp = 3.6 * atk * 1.05` |
| `PetHorse3/4` | skill3 `bz` | 已学 `bz`、MP 足够、目标距离 `<= 250`、CD3 就绪 | `hit4`，扣 20 MP，生成 `SpecialEffectBullet("PetHorse3Bullet4")`；伤害取 `bz = 6.6 * atk * 1.05` |
| `PetHorse4` | skill4 `tmaoyi` | 已学 `tmaoyi`、MP 足够、`curAttackTarget != null`、CD4 就绪 | `releSkill4()` 先 `addAoyiBuff()`、`setYourFather(20)`，进入 `hit5` 并扣 30 MP；`doHit5()` 为当前 `monsterArray` 每只怪生成一个 `EnemyMoveBullet("PetHorse4Bullet5")`，10 秒或 2000 距离销毁 |

`PetHorse3/4` 仍保留 `bd` 与 `sp` 的前两个技能槽：`bd` 是受击触发的 `hit2`，`sp` 是 `50..100` 距离门禁的 `hit3`。四阶奥义的组合技能门槛体现在 `doHit5()`：如果已学 `sp`，`PetHorse4Bullet5` 会 `setMoveTarget(monster)` 追踪目标，否则只按向下加速度落下；如果已学 `bd`，`hit5_1` 命中会附加 2.4 秒 `PETHORSE_ICE`；如果已学 `bz`，命中后生成 `SpecialEffectBullet("PetHorse4Bullet5Explode")` 的 `hit5_2` 爆炸段，且已学 `bd` 时爆炸延迟 1 秒，否则立即爆炸。说明文本“拥有水泡、冰冻、冰锥才能发挥出奥义的最大威力”与这些条件一致。

马系资源键已由 AS3 确认：本体为 `PetHorseBmd1..4`，普攻/技能包括 `PetHorse1Bullet1`、`PetHorse1Bullet2`、`PetHorse2Bullet1`、`PetHorse2Bullet2`、`PetHorse3Bullet1`、`PetHorse3Bullet2`、`PetHorse3Bullet3`、`PetHorse3Bullet4`、`PetHorse4Bullet5`、`PetHorse4Bullet5Explode`，冰冻表现为 `BaseAddEffect.PETHORSE_ICE` / `PetHorseIceEffect`。当前 `resources/` 文件名检索未直接命中 `PetHorse*` 导出资源，因此现代实现先登记资源缺口并使用占位 key，不重新提取。

现代最小切片建议：

| 优先级 | 切片 | 理由与边界 |
| --- | --- | --- |
| 1 | `horse1/sp` | 证据最完整，只有已学、MP、目标距离 `50..100` 和 CD 门禁；可复用现有宠物主动技能、projectile、`fsnl/sxkb` 伤害 helper，并新增一个 Monster30 冰冻最小状态 |
| 2 | `horse2/bd` | 可复用 `sp` 的冰冻状态，但需要接入“宠物受击后允许释放”的触发标记 |
| 3 | `horse3/bz` | 只需主动距离 `<= 250` 和范围占位特效，但建议等 `sp/bd` 的马系资源/冰冻边界稳定后再做 |
| 4 | `horse4/tmaoyi` | 涉及全怪生成、追踪/非追踪差异、冰冻增强、爆炸二段和奥义 buff，适合拆成单独切片，不与 `sp/bd/bz` 同次实现 |

青龙首批链路：

`BaseHero.addPetByPi()` 按 `dragon1..4` 分别创建 `PetDragon1..4`。`PetInfo.rePetSkill()` 会把青龙候选池扩成 `dragon1: fs`、`dragon2: fs/sdcc`、`dragon3: fs/sdcc/ltwj`、`dragon4: fs/sdcc/ltwj/qlaoyi`；`addSpecialSkill()` 在 `dragon1 -> dragon2` 时把 `fs` 从追加候选中替换为 `sdcc`，在 `dragon2 -> dragon3` 时把 `sdcc` 替换为 `ltwj`。四阶说明和四阶学习入口会让 `dragon4` 持有 `qlaoyi`，普通角色技能书 `jns` 不参与宠物专属技能学习。

`findPetUsedMagic()` 给出青龙消耗：`fs/sdcc/ltwj` 都消耗 20 MP，`qlaoyi` 消耗 30 MP。`getPetHarmObj()` 给出伤害基数：`fs = 0`、`sdcc = (0.03 * SHp + 3 * atk) * 1.05`、`ltwj = (0.024 * SHp + 3.6 * 2 * atk) * 1.05`、`qlaoyi = 0`。青龙现代基础属性已按宠物种族给出 `maxMp = 175`、`atk = 25`，后续实现可先沿用现有宠物伤害 helper 接入 `fsnl/sxkb`，但 `fs/qlaoyi` 本体仍保持直接伤害 0。

| 类 | 技能槽 | 条件 | 动作/伤害 |
| --- | --- | --- | --- |
| `PetDragon1` | skill1 `fs` | 已学 `fs`、MP 足够、CD1 就绪；一阶 AS3 未写显式目标门禁 | `hit2`，扣 20 MP；创建同类分身，`type = 1`、透明度约 `0.5`、位置随机偏移、持续 `gc.frameClips * 10`，`getRealPower("hit2")` 为 0 |
| `PetDragon2/3` | skill1 `fs` | 已学 `fs`、MP 足够、CD1 就绪 | 同上；`PetDragon3.releSkill1()` 内扣 MP key 写成 `"sp"`，但门禁和技能池均为 `fs`，按 AS3 旧复制痕迹记录，现代实现以 `fs` 为准 |
| `PetDragon4` | skill1 `fs` | 已学 `fs`、MP 足够、目标存在、CD1 就绪 | 同上；四阶版本额外要求 `curAttackTarget != null` |
| `PetDragon2/3` | skill2 `sdcc` | 已学 `sdcc`、MP 足够、目标存在、距离 `<= 300`、CD2 就绪 | `hit3`，扣 20 MP；生成 `FollowBaseObjectBullet("PetDragon2Bullet2")` / `hit2`，命中造成 `sdcc` 伤害并按 `int(SHp * 0.018 + atk * 0.18 + level * 2)` 治疗宠物 |
| `PetDragon4` | skill2 `sdcc` | 已学 `sdcc`、MP 足够、目标存在、距离 `<= 180`、CD2 就绪 | 同 `sdcc`，四阶距离门禁收窄到 `180` |
| `PetDragon3` | skill3 `ltwj` | 已学 `ltwj`、MP 足够、目标存在、距离 `<= 500`、CD3 就绪 | `hit4`，扣 20 MP；分批生成多个 `SpecialEffectBullet("PetDragon3Bullet3")` / `hit3`，命中造成 `ltwj` 伤害并按 `int(SHp * 0.028 + atk * 0.09 + level * 2)` 治疗宠物 |
| `PetDragon4` | skill3 `ltwj` | 已学 `ltwj`、MP 足够、目标存在、距离 `<= 220`、CD3 就绪 | 同 `ltwj`，四阶距离门禁收窄到 `220` |
| `PetDragon4` | skill4 `qlaoyi` | 已学 `qlaoyi`、MP `>= 30`、目标存在、CD4 就绪 | `hit5`，进入奥义 buff；第 48 帧生成 `FollowBaseObjectBullet("PetDragonBullet4")` / `hit4`，自身直接伤害为 0，实际威力依赖已学 `fs/sdcc/ltwj` 的分身组合 |

青龙 CD 来自 `skillCDN = [初始, 间隔]`：`fs` 约 `10s`、`sdcc` 约 `3.6s`、`ltwj` 约 `5s`、`qlaoyi` 约 `24s`。`qlaoyi` 的 `releSkill4()` 未在已读片段中看到显式 MP 扣除，门禁仍使用 `findPetUsedMagic("qlaoyi") = 30`；现代实现应先按门禁和其他奥义一致性扣 30 MP，并在文档中保留 AS3 片段未见扣 MP 的边界说明。

`fs` 分身边界：`doHit2()` 会创建同类宠物分身并加入 `fenshenArray`，分身复制宠物信息、设 `type = 1`、`alpha = 0.5`，持续 `gc.frameClips * 10` 后销毁；主宠会在分身回收路径中执行一次按 `SHp * 0.036` 的治疗。首个现代切片建议只做分身可见反馈、10 秒持续和直接伤害 0，分身 AI、分身到期治疗和多分身协同后置。

`qlaoyi` 组合边界：如果已学 `fs`，奥义会创建分身；如果已学 `sdcc`，分身会走 `releSkill2WithoutMana()`；否则若已学 `ltwj`，分身进入 `hit6`；都不满足时清掉 `isAoyi`。这说明四阶奥义不是单个高伤害 projectile，而是依赖前置技能链的组合表现，适合等 `fs/sdcc/ltwj` 都有最小实现后再拆独立切片。

青龙资源键已由 AS3 确认：本体为 `PetDragonBmd1..4`，技能/弹体包括 `PetDragon1Bullet1`、`PetDragon2Bullet1`、`PetDragon2Bullet2`、`PetDragon3Bullet1`、`PetDragon3Bullet3`、`PetDragonBullet4`。`attackBackInfoDict` 中 `hit1/hit2` 为 physics，`hit3/hit4` 为 magic，击退大致为 `[3,-5]`、`[7,-5]`、`[2,-5]`、`[1,-5]`；现代首批只登记占位资源 key，不重新提取资源。

青龙现代最小切片建议：

| 优先级 | 切片 | 理由与边界 |
| --- | --- | --- |
| 1 | `dragon1/fs` | 已由 `TASK-SLICE-062` 完成：已学、MP、约 10 秒 CD、10 秒分身占位反馈、无目标释放和直接伤害 0 |
| 2 | `dragon2/sdcc` | 已由 `TASK-SLICE-063` 完成：目标/距离 `<= 300` 门禁、混合伤害公式、`fsnl/sxkb` 兼容和命中治疗记录 |
| 3 | `dragon3/ltwj` | 已由 `TASK-SLICE-064` 完成：距离 `<= 500` 门禁、4 段 `PetDragon3Bullet3` 占位反馈、混合伤害公式、`fsnl/sxkb` 兼容和命中治疗记录 |
| 4 | `dragon4/qlaoyi` | 已由 `TASK-SLICE-065` 完成：目标/距离 `<= 200` 门禁、30 MP、约 24 秒 CD、`PetDragonBullet4` 奥义占位反馈、直接伤害 0，并按已学 `fs/sdcc/ltwj` 记录组合标签 |

玄龟首批链路：

`BaseHero.addPetByPi()` 按 `turtle1..4` 分别创建 `PetTurtle1..4`。`PetInfo.rePetSkill()` 会把玄龟候选池扩成 `turtle1: sld`、`turtle2: sld/txlj`、`turtle3: sld/txlj/sybh`、`turtle4: sld/txlj/sybh/xwaoyi`；`addSpecialSkill()` 在 `turtle1 -> turtle2` 时把 `sld` 替换为 `txlj`，在 `turtle2 -> turtle3` 时把 `txlj` 替换为 `sybh`。四阶奥义 `xwaoyi` 由四阶入口直接加入已学技能，普通角色技能书 `jns` 不参与宠物专属技能学习。

`findPetUsedMagic()` 给出玄龟消耗：`sld/txlj/sybh` 都消耗 20 MP，`xwaoyi` 消耗 30 MP。`getPetHarmObj()` 给出数值基数：`sld = atk`，`txlj.first = 5 * technique`、`txlj.second = 4 * warpower`，`sybh = 5.4 * atk`，`xwaoyi = 0`。`sld` 和 `sybh` 在 `getRealPower()` 中继续叠加 `fsnl` 的 `getMagicAddValue()`、`sxkb` 的宠物暴击 2 倍、`isGXP` 的 1.2 倍；四阶 `PetTurtle4` 还额外乘 `hurtBaseEffectRate()`。

| 类 | 技能槽 | 条件 | 动作/伤害或状态 |
| --- | --- | --- | --- |
| `PetTurtle1..4` | skill1 `sld` | 已学 `sld`、MP 足够、目标距离 `50..200`、CD1 就绪 | `hit2`，扣 20 MP；第 10 帧附近生成 `FollowBaseObjectBullet("PetTurtle1Bullet2")` / `hit2`，魔法命中；按 `sld = atk` 派生伤害，同时宠物按本次 `hit2` 伤害量治疗自身 |
| `PetTurtle2..4` | skill2 `txlj` | 已学 `txlj`、MP 足够、存在目标、CD2 就绪 | 不生成伤害 projectile；给宠物自身和主人同时添加 `BaseAddEffect.PETTURTKE_BUFF`，持续 `txlj.second * gc.frameClips = 4 * warpower` 秒，值为 `5 * technique`，扣 20 MP |
| `PetTurtle3..4` | skill3 `sybh` | 已学 `sybh`、MP 足够、存在目标、CD3 就绪 | `hit3`，扣 20 MP；第 10 帧附近在宠物自身附近生成 `SpecialEffectBullet("PetTurtle3Bullet3")` / `hit3`，三阶和四阶都把表现放大到约 2 倍；按 `sybh = 5.4 * atk` 派生范围伤害 |
| `PetTurtle4` | skill4 `xwaoyi` | 已学 `xwaoyi`、MP `>= 30`、存在目标、CD4 就绪 | 进入 5 秒奥义状态；若已学 `sld`，立刻、2 秒后、4 秒后各免蓝释放一次 `sld`；若已学 `txlj`，免蓝添加同心链接；若已学 `sybh`，生成持续 5 秒、不随末帧销毁的 `PetTurtle3Bullet3` 奥义范围反馈；奥义期间不移动、不转向、受击表现参数被压制 |

玄龟 CD 来自 `skillCDN = [初始, 间隔]`：`sld` 初始约 `3s`、间隔约 `6s`；`txlj` 初始约 `3s`、间隔约 `20s`；`sybh` 初始约 `4s`、间隔约 `5.5s`；`xwaoyi` 初始约 `12s`、间隔约 `18s`。

`PETTURTKE_BUFF` 的可观察战斗边界来自 `BaseHero`：主人受伤时，如果主人和宠物都持有该 buff，会让宠物承受 `ceil(原伤害 * 0.05)`，主人实际伤害变为 `ceil(原伤害 * 0.95)`；主人被治疗时，如果双方都持有该 buff，会先让宠物按 `治疗量 * 1.05` 回血，再把主人治疗量放大到 `ceil(治疗量 * 1.05)`。`PetTurtle2/3/4.doHit2()` 还会在宠物 `sld` 治疗自身后，如果双方存在链接 buff，同步给主人增加同等治疗量。

玄龟资源键已由 AS3 确认：本体为 `PetTurtleBmd1..4`，普通表现为 `PetTurtle2Bullet1`，技能/弹体包括 `PetTurtle1Bullet2`、`PetTurtle3Bullet3`。`attackBackInfoDict` 中 `hit1` 为 physics；`hit2` 在一至三阶为 magic、四阶配置为 physics 但仍用于 `sld`，`hit3` 为 magic；现代首批只登记占位资源 key，不重新提取资源。

玄龟现代最小切片建议：

| 优先级 | 切片 | 理由与边界 |
| --- | --- | --- |
| 1 | `turtle1/sld` | 证据最小且可观察：只需已学、MP、目标距离 `50..200`、约 6 秒 CD、`PetTurtle1Bullet2` 占位 projectile、`atk + skillDamageBonus` 伤害、自身治疗和 `sxkb` 暴击兼容 |
| 2 | `turtle2/txlj` | 不依赖新伤害 projectile，但要接入主人扣血前 5% 转嫁、治疗放大和宠物同步回血，适合在 `sld` 治疗链稳定后做 |
| 3 | `turtle3/sybh` | 主动范围伤害，可复用宠物主动技能和 `fsnl/sxkb` 伤害 helper；只需新增 `PetTurtle3Bullet3` 占位范围反馈 |
| 4 | `turtle4/xwaoyi` | 组合奥义，依赖 `sld/txlj/sybh` 三个前置最小实现；建议单独切片记录免蓝连发、链接刷新、5 秒持续范围反馈和奥义期间移动/受击边界 |

## 现代宠物技能切片建议

推荐后续切片为 `VS-016 宠物技能最小闭环`，首个实现目标固定为 `monkey1` 的 `xj`：

- 数据侧只要求 P1 当前出战宠物支持已学技能列表，测试种子可直接让 `monkey1` 学会 `xj`，不实现随机自动学习。
- 战斗侧只覆盖已学 `xj`、宠物 MP `>= 20`、宠物曾受击或等价触发标记、冷却就绪、存在 `Monster30` 目标时释放。
- 释放时扣 20 MP、重置触发标记和冷却，生成可见占位 projectile/特效，并对 `Monster30` 造成等价 `2.6 * pet.atk` 的一次伤害。
- UI/状态栏只需展示已学技能、MP、冷却或最近释放反馈；完整 8 槽宠物面板、`sname~sname` 存档、自动学习、所有被动/自动 buff、`monkey2/3/4`、P2/联机和真实宠物资源后置。

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

# 宠物系统索引

本文记录 `TASK-SETTINGS-018` 和 `TASK-SETTINGS-019` 对原版宠物系统的基础逆向结果。范围覆盖宠物主数据、存档字段、出战切换、战斗实体创建、捕捉/获得入口、消耗品、UI 快捷键，以及与掉落系统的边界；不展开完整宠物数值平衡、全部宠物技能表现或真实资源接入。

## 资料状态

主要 AS3 证据：

- `extracted_flash/resources_by_swf/[172845].swf/scripts/user/User.as`
- `extracted_flash/resources_by_swf/[172845].swf/scripts/petInfo/PetInfo.as`
- `extracted_flash/resources_by_swf/[172845].swf/scripts/base/BaseHero.as`
- `extracted_flash/resources_by_swf/[172845].swf/scripts/base/BasePet.as`
- `extracted_flash/resources_by_swf/[172845].swf/scripts/export/pet/PetInterface.as`
- `extracted_flash/resources_by_swf/[172845].swf/scripts/export/pet/PetHeadSprite.as`
- `extracted_flash/resources_by_swf/[172845].swf/scripts/export/pack/PackThings.as`
- `extracted_flash/resources_by_swf/[172845].swf/scripts/export/RoleInfo.as`
- `extracted_flash/resources_by_swf/[172845].swf/scripts/my/KeyBoardControl.as`
- `extracted_flash/resources_by_swf/[172845].swf/scripts/export/magicWeapon/MagicBottle.as`
- `extracted_flash/resources_by_swf/[172845].swf/scripts/base/BaseMagicWeapon.as`
- `extracted_flash/resources_by_swf/[172845].swf/scripts/export/monster/Monster70.as` 至 `Monster78.as`
- `extracted_flash/resources_by_swf/[172845].swf/scripts/export/huodong/ESShopThing.as`
- `extracted_flash/resources_by_swf/[172845].swf/scripts/export/huodong/ChineseValentinesDay.as`
- `extracted_flash/resources_by_swf/[172845].swf/scripts/export/huodong/kabu/ReceiveKaBuPacks.as`
- `extracted_flash/resources_by_swf/[172845].swf/scripts/export/MapMenu.as`
- `extracted_flash/resources_by_swf/[172845].swf/scripts/export/taskInterface/TaskInterface.as`

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

### 现代存档闭环（TASK-SLICE-077）

现代版不复制 Flash 的 AMF/compress/XOR 容器，改用带版本号的 localStorage JSON；保留相同的可观察结果：刷新页面后恢复 P1 基础进度和宠物主数据。

- `SaveSystem.ts` 的 `GameSaveV1` 保存 P1 角色等级/经验、装备、五槽技能配置、心法树和被动技能。
- 每只宠物保存稳定 ID、物种/形态、等级/经验、HP/MP、攻击/防御、四类资质、寿命、悟性/技巧/战力、`isActive` 和 `skills[]`。
- `skills[]` 是原版 `skillSaveString` 的现代等价字段；既有 `encodePetSkillSaveString()` 仍可用于原版 `sname~sname` 字段级兼容。
- `skillState/autoBuffState/magicFlowerBuff` 属于瞬时战斗状态，不持久化；读取时由 `createPetSkillState()` 重建，避免冷却、奥义步骤和临时 Buff 跨刷新残留。
- `TestSceneSaveBridge.ts` 创建场景时读取，之后每 2 秒自动保存；损坏 JSON、未知 schema version 和未知装备均安全降级。

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

- `extracted_flash/resources_by_swf/[172845].swf/scripts/petInfo/PetInfo.as`
  - `getSkillSaveString()` 行 2233 附近。
  - `setSkillSaveString(value)` 行 2250 附近。
  - `getSaveString()` 行 2283 附近。
  - `setSaveString(value)` 行 2351 附近。
- `extracted_flash/resources_by_swf/[172845].swf/scripts/user/User.as`
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

- `extracted_flash/resources_by_swf/[172845].swf/scripts/export/pet/PetInterface.as`
  - 字段 `skill1` 到 `skill8` 行 75 至 89 附近。
  - `reSkills()` 行 172 附近。
  - `setPetInfomation()` 行 359 附近。
  - `setPetAllSkill()` 行 364 附近。
  - `AfterSuperRevolution()` 行 592 附近。
- `extracted_flash/resources_by_swf/[172845].swf/scripts/export/pack/PackThings.as`
  - 背包道具 `cwjnxld` 分支行 712 附近。
- `extracted_flash/resources_by_swf/[172845].swf/scripts/my/AllEquipment.as`
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

- `extracted_flash/resources_by_swf/[172845].swf/scripts/petInfo/PetInfo.as`
  - 基础候选池行 40 附近，包含 `tsml/zrsh/smzf/mfby/qlfj/sxkb/fsnl/smjc/mfjc/gjjc/fyjc`。
  - `getIntroByName()` 行 843 附近，给出中文说明和持续秒数展示。
  - `getPetHarmObj()` 行 1017 附近，给出被动、自动 buff 和部分主动技能数值公式；函数末尾统一把 `first` 乘以 `1.05`。
  - `deletePassiveWhenUpdata()` / `addPassiveAfterUpdata()` 行 1812 / 1851 附近，负责升级或重算属性前后移除和重加基础被动。
  - `findPetUsedMagic()` 行 1862 附近，给出 MP 消耗：基础被动和 `qlfj` 为 0，六个自动 buff 为 20。
- `extracted_flash/resources_by_swf/[172845].swf/scripts/base/BasePet.as`
  - `sxkbCount/fsnlCount/smjcCount/mfjcCount/gjjcCount/fyjcCount` 初值均为 300。
  - `checkBuffSkill()` 行 405 附近，每帧递减计数器并在计数归零、已学技能、MP 足够时自动加 buff。
  - `reduceHp()` 行 909 附近，`qlfj` 在受击路径中按概率触发 `normalHit()`。
  - `getCriteValue()` / `getMagicAddValue()` 行 819 / 847 附近，读取 `PET_SXKB` 和 `PET_FSNL` 的宠物自身 buff。
- `extracted_flash/resources_by_swf/[172845].swf/scripts/base/BaseRoleProperies.as`
  - `addBuff()` / `removeBuff()` 行 365 / 440 附近，读取主人身上的 `PET_SMJC/MFJC/GJJC/FYJC` 并调整 HP/MP 上限、基础攻击或防御。
- `extracted_flash/resources_by_swf/[172845].swf/scripts/base/BaseAddEffect.as`
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

UFO/卡布首批链路：

`BaseHero.addPetByPi()` 按 `ufo1..3` 分别创建 `PetKabu1..3`，`PetInfo` 中文名为 `ufo1 = 小飞`、`ufo2 = 裂云`、`ufo3 = 冲霄`。`PetInfo.rePetSkill()` 会把 UFO 候选池扩成 `ufo1: pms`、`ufo2: pms/ss`、`ufo3: pms/ss/kmsk`；`addSpecialSkill()` 在 `ufo1 -> ufo2` 时把 `pms` 替换为 `ss`，在 `ufo2 -> ufo3` 时把 `ss` 替换为 `kmsk`。没有 `ufo4` 奥义形态，普通角色技能书 `jns` 不参与宠物专属技能学习。

技能中文名和说明来自 `PetInfo.getSkillChinaName()` / `getIntroByName()`：`pms = 魔破杀`，说明“撕裂前方怪物”；`ss = 瞬闪`，说明“瞬间闪烁到怪物后面”；`kmsk = 狂魔闪空`，说明“飞到空中对下方怪物造成伤害”。

`findPetUsedMagic()` 给出 `pms/ss/kmsk` 都消耗 20 MP。`getPetHarmObj()` 给出数值基数：`pms = 3.6 * atk`，`ss = 0`，`kmsk = 6 * atk`。`pms` 和 `kmsk` 在 `getRealPower()` 中继续叠加 `fsnl` 的 `getMagicAddValue()`、`sxkb` 的宠物暴击 2 倍、`isGXP` 的 1.2 倍；`ss` 本身不走 `getRealPower("hit3")` 伤害，而是瞬移后调用 `normalHit()` 触发普攻 `hit1`。

| 类 | 技能槽 | 条件 | 动作/伤害或状态 |
| --- | --- | --- | --- |
| `PetKabu1..3` | skill1 `pms` | 已学 `pms`、MP 足够、存在目标、CD1 就绪 | `hit2`，扣 20 MP；第 10 帧附近生成 `FollowBaseObjectBullet("PetKabu1Bullet2")` / `hit2`，魔法命中；按 `pms = 3.6 * atk` 派生伤害 |
| `PetKabu2..3` | skill2 `ss` | 已学 `ss`、MP 足够、存在目标、CD2 就绪 | `hit3`，源码释放时调用 `findPetUsedMagic("pms")` 扣蓝；因 `pms/ss` 都是 20 MP，现代可按 20 MP 等价处理；第 10 帧附近从 `gc.obbsiteArray` 随机取目标，传送到目标朝向背后约 40 像素、`y - 40`，再调用 `normalHit()` |
| `PetKabu3` | skill3 `kmsk` | 已学 `kmsk`、MP 足够、存在目标、CD3 就绪 | `hit4_1`，扣 20 MP，先用 Tween 上升约 100 像素；动作结束转 `hit4_2`，第 10 帧在宠物下方 `y + 30` 生成 `SpecialEffectBullet("PetKabu3Bullet4")` / `hit4`，按 `kmsk = 6 * atk` 派生范围/下方伤害 |

UFO CD 来自 `skillCDN = [初始, 间隔]` 且 `Config.frameClips = 30`：`pms` 初始约 `2s`、间隔约 `2s`；`ss` 初始约 `2s`、间隔约 `4s`；`kmsk` 初始约 `3s`、间隔约 `5s`。`BasePet.myIntelligence()` 的通用目标边界仍适用：需要存在 `curAttackTarget`，目标死亡或距离 `>= 1200` 会清空目标，未受击且未攻击时按 skill1 -> skill2 -> skill3 -> skill4 顺序尝试。

UFO 资源键已由 AS3 确认：本体为 `PetKabuBmd1..3`；技能/弹体包括 `PetKabu1Bullet1`、`PetKabu1Bullet2`、`PetKabu3Bullet4`。`attackBackInfoDict` 中 `hit1` 为 physics，`hit2` 和 `hit4` 为 magic；Kabu1 的 `hit2` 击退为 `[-10,0]`、间隔 24，Kabu2/3 的 `hit2` 击退为 `[8,0]`、间隔 999，Kabu3 的 `hit4` 击退为 `[8,0]`、间隔 999。现代首批只登记占位资源 key，不重新提取资源。

UFO 现代最小切片建议（`TASK-SLICE-070/071/072` 已全部完成）：

| 优先级 | 切片 | 状态 |
| --- | --- | --- |
| 1 | `ufo1/pms` | ✅ 已完成 |
| 2 | `ufo2/ss` | ✅ 已完成 |
| 3 | `ufo3/kmsk` | ✅ 已完成 |

## 白虎/母虎 `tigress1..4` 专属技能链（`TASK-SETTINGS-033` 部分逆向）

`BaseHero.addPetByPi()` 按 `tigress1..4` 分别创建 `PetTiger1..4`（别名 `PetYingTiger1/4`）。`PetInfo` 中文名：`tigress1 = 小虎`、`tigress2..4` 待确认。`PetInfo.rePetSkill()` 把虎候选池扩成 `tigress1: hy`、`tigress2: hy/sxhz`、`tigress3: hy/sxhz/hsqj`、`tigress4: hy/sxhz/hsqj/bhaoyi`。`addSpecialSkill()` 在各形态进化时把前阶技能替换为后阶特殊技能。没有 `tigress4` 以上的奥义形态。

技能中文名和说明来自 `PetInfo.getSkillChinaName()` / `getIntroByName()`：`hy = 虎跃`、`sxhz = 嗜血虎爪`、`hsqj = 虎声咆哮`、`bhaoyi = 白虎奥义`。

`findPetUsedMagic()` 给出 `hy/sxhz/hsqj/bhaoyi` 均消耗 20 MP。

AS3 数据来自 `PetTiger1..4.as`（主参考包 172845）：

| 类 | 技能槽 | 条件 | 动作/伤害或状态 |
| --- | --- | --- | --- |
| `PetTiger1` | skill1 `hy` | 已学 `hy`、MP 足够、目标距离 `50..100`、CD1 就绪 | `hit2`，扣 20 MP；第 10 帧生成 `SpecialEffectBullet("PetTiger1Bullet2")` / `hit2`，魔法命中，击退 `[9,0]`、间隔 6；按 `hy.first + fsnl` 派生伤害，接入 `sxkb` 暴击 2 倍 |
| `PetTiger2..3` | skill1 `hy` | 同上 | 同上 |
| `PetTiger4` | skill1 `hy` | 目标距离 `50..100`、MP 满足 | 同上，但 `hit2` 攻击类型变为 physics |
| `PetTiger2..3` | skill2 `sxhz` | 已学 `sxhz`、MP 足够、目标距离 `≤80`、CD2 就绪 | `hit3`，扣 20 MP；两段 projectile：第 10 帧 `PetTiger2Bullet3_1` / `hit3_1`（附加 `Pet_TIGER_SXHZ` 效果约 2 秒），第 1 帧 `PetTiger2Bullet3_2` / `hit3_2`（魔法、间隔 6、命中时治疗 `sxhz.first`） |
| `PetTiger4` | skill2 `sxhz` | 同上 | 同上，CD2 更长：`[240, 138]` 即初始约 8 秒、间隔约 4.6 秒 |
| `PetTiger3` | skill3 `hsqj` | 已学 `hsqj`、MP 足够、目标距离 `≤450`、CD3 就绪 | `hit4`，扣 20 MP；两段：起手 `PetTiger3Bullet4_1` / `hit4`（disabled 纯视觉），第 10 帧 `PetTiger3Bullet4_2` / `hit4`（魔法、击退 `[-7,0]` 或 `[-15,0]`、间隔 3）；按 `hsqj.first + fsnl` 派生伤害 |
| `PetTiger4` | skill3 `hsqj` | 同上 | 同上，CD3: `[180, 180]` 即初始约 6 秒、间隔约 6 秒 |
| `PetTiger4` | skill4 `bhaoyi` | 已学 `bhaoyi`、MP 足够、存在目标、CD4 就绪 | `hit5`，扣 20 MP；白虎奥义：三段式 combo — 第一步 50% 概率瞬移到目标 `x±80`，若已学 `hy` 则免费释放 `hy`；第二步再次瞬移，若已学 `sxhz` 则免费释放 `sxhz`；第三步延迟约 120 帧后触发 `hit6`，若已学 `hsqj` 则免费释放 `hsqj`，并设置 `isAtkUp=true` 使下段普攻或 `hsqj` 获得 1.3 倍伤害加成。奥义本体直接伤害保持 0 |

CD 参数（`skillCDN = [初始帧, 间隔帧]`，`gc.frameClips = 30`）：

| 形态 | CD1 `hy` | CD2 `sxhz` | CD3 `hsqj` | CD4 `bhaoyi` |
| --- | --- | --- | --- | --- |
| tiger1 | `[120, 60]` ≈ 4s/2s | — | — | — |
| tiger2 | `[120, 90]` ≈ 4s/3s | `[150, 90]` ≈ 5s/3s | — | — |
| tiger3 | `[120, 60]` ≈ 4s/2s | `[150, 150]` ≈ 5s/5s | `[180, 150]` ≈ 6s/5s | — |
| tiger4 | `[120, 60]` ≈ 4s/2s | `[240, 138]` ≈ 8s/4.6s | `[180, 180]` ≈ 6s/6s | `[450, 720]` ≈ 15s/24s |

资源键：本体 `PetTigerBmd1..4`；技能/弹体 `PetTiger1Bullet1`、`PetTiger1Bullet2`、`PetTiger2Bullet1`、`PetTiger2Bullet3_1`、`PetTiger2Bullet3_2`、`PetTiger3Bullet4_1`、`PetTiger3Bullet4_2`。现代占位资源 key 待实现时登记。

虎系现代最小切片建议：

| 优先级 | 切片 | 理由与边界 |
| --- | --- | --- |
| 1 | `tigress1/hy` | 证据最小：只需 P1 可切换出战 `tigress1`，已学 `hy`、MP `>= 20`、目标距离 `50..100` 和约 2 秒 CD 门禁，生成 `PetTiger1Bullet2` 占位 projectile，按 `hy.first` 派生伤害并接入 `fsnl/sxkb` |
| 2 | `tigress2/sxhz` | 两段 projectile + 命中治疗，CD 稍长 |
| 3 | `tigress3/hsqj` | 两段 projectile + 长距离 |
| 4 | `tigress4/bhaoyi` | 白虎奥义三段组合，带瞬移和免费技能释放 |

**注意**：AS3 数值基数 `hy.first`、`sxhz.first`、`hsqj.first` 等来自 `PetInfo.getPetHarmObj()`，仍需从 `PetInfo.as` 确认具体倍率。凤凰 `phoenix1..4`（`np/bshn/dhly/zqaoyi`）、兔 `rabbit1..4`、鼠 `mouse1..4` 的专属技能链仍未逆向，推荐拆分独立 `TASK-SETTINGS-*` 任务继续。

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

### 成长洗练道具精确行为（`TASK-SETTINGS-034`）

共同入口来自 `PackThings.useEquip()`：四种道具都先查找当前出战宠物；未找到时提示“你还没有出战的宠物”并提前返回，因此不消耗道具。成功走完分支后设置使用成功标记，随后由背包统一扣除一件并触发存档。

#### `cwzzxld` 宠物属性洗练丹

调用 `PetInfo.refreshTherrAttributeByImmortality()`，只逐项重投 `perception/technique/warpower`（悟性/技巧/战力）。道具文案写“悟性、根骨、灵力”，但实际字段以代码为准。三个字段各自执行同一套逻辑，并且每个 `else if` 都会重新调用一次 `Math.random()`，不是共用一次随机值：

- 当前值 `< 5`：`quality == 1` 时取 `round(random * 4) + 1`（1..5）；否则取 `round(random * 4)`（0..4）。
- 当前值 `>= 5`：第一次随机 `<= 0.6` 时减 1；否则第二次独立随机 `<= 0.35` 且旧值 `<= 7` 时加 1；否则第三次独立随机 `<= 0.2` 且旧值 `<= 6` 时加 2；其余情况重投为 `round(random * 5) + 3`（3..8）。

该方法不修改等级、经验、形态、`hp/mp/atk/def quality` 四类资质、当前/最大 HP/MP、攻击、防御、寿命、品质、技能或出战标记，也不要求重建场景宠物实体。

#### `wphtd` 宠物还童丹

调用 `PetInfo.makePetBecomeChild()`，顺序如下：

1. 等级设为 1，宠物名最后一位形态数字强制改为 `1`，并刷新中文名。
2. 当前经验设为 0；若 `quality != 1`，品质强制设为 1。
3. 调用 `initPetInfoData()`，按一阶/品质 1 的物种表重投或重设四类资质和基础属性，并把当前 HP/MP 同步为新的最大 HP/MP。
4. 品质 1 的悟性为 `4 + round(random * 3)`（4..7），技巧和战力均为 `4 + round(random * 4)`（4..8）。
5. `PackThings` 随后对对应 P1/P2 英雄调用 `changePet()`，并广播 `CHANGECURRENTPET`，所以出战实体会按一阶种类重建。

一阶品质 1 的固定资质/基础值如下；带随机表达式的物种在还童时重新抽取：

| 物种 | HP/MP/攻击/防御资质 | 1 级基础 HP / MP / ATK / DEF |
| --- | --- | --- |
| monkey | `1040/1040/1040/1040` | `840/150/20/6` |
| horse | `949/1222/1105/520` | `840/200/25/6` |
| ufo | `1170/1040/1170/351` | `840/150/30/8` |
| tigress | `1300/1040/1300/520` | `840/150/30/8` |
| turtle | `1560/910/1170/611` | `840/150/25/10` |
| phoenix | `1170/1170/1300/520` | `840/200/32/6` |
| dragon | `1430/780/1430/520` | `840/200/30/8` |
| rabbit | `(800+round(r*300))*1.3 / (500+round(r*400))*1.3 / (800+round(r*300))*1.3 / (200+round(r*200))*1.3` | `840/200/30/5` |
| roomhorse | `(700+round(r*500))*1.3 / (550+round(r*440))*1.3 / (1000+round(r*300))*1.3 / (200+round(r*200))*1.3` | `840/800/50/10` |
| mouse、neat、nian、terribletiger | `(700+round(r*500))*1.3 / (250+round(r*440))*1.3 / (1000+round(r*300))*1.3 / (200+round(r*200))*1.3` | `840/800/50/10` |

`makePetBecomeChild()` 没有清空或重投 `skill`，也不改寿命、出战标记、闪避/暴击/魔防、移动速度或被动附加值；现代实现不应因为“还童”二字额外删除技能。它也没有显式调用 `upPassive()`，因此原版这里可能保留还童前的 `EHp/EMp`，属于应忠实隔离而不扩大的旧实现边界。

#### `nianqld`

入口唯一已确认行为是动态调用 `setpotential(getpotential() + 100)`。但主参考包的 `PetInfo.as` 没有 `potential` 字段，也没有这两个方法；宠物 26 字段存档同样不包含潜力。备用包只再次出现调用点，未找到可验证的属性公式或持久化字段。因此当前证据只能确认“意图增加 100”，不能证明潜力如何影响资质或战斗数值；该调用应登记为当前版本的悬空/残留入口，现代实现不得猜造换算公式。

#### `nianjhd`

道具入口只拒绝当前形态 `4`，提示“该宠物已经是第二形态”且不消耗；它不检查等级。其他形态都会调用 `theFourShape(true)` 并消耗道具，但 `PetInfo.theFourShape()` 实际只在形态 `3` 时生效：

- 形态 3：移除旧被动加值，将名称改为同物种形态 4，刷新中文名和技能说明，再恢复被动、尝试学习该物种奥义，并通过 `doWhenChangeState()` 让存活的出战实体调用 `BaseHero.changePet()` 重建。
- 形态 1/2：方法不做任何字段变化，但背包入口仍把道具判为成功并消耗。这是原版可观察的空耗边界。
- 形态 4：入口提前返回，不消耗。

进化不修改等级、经验、四类资质、悟性/技巧/战力、寿命、品质或出战标记，但会先按形态 3 移除、再按形态 4 恢复已学的四个基础属性被动：每个 `tsml` 让攻击净增 `6 * warpower`，每个 `zrsh` 让防御净增 `4 * technique`，每个 `smzf` 让最大 HP 净增 `50 * warpower`，每个 `mfby` 让最大 MP 净增 `50 * technique`；当前 HP/MP 还保留原版“仅当大于旧被动值才先扣旧值、随后总是加新值”的边界。没有这四种技能时，HP/MP/攻击/防御不变。奥义仅在技能槽少于 8 时加入；槽位已满时形态仍会变为 4，但 `studyEsoteric()` 返回失败，进化方法不回滚。宠物面板的普通“超进化”按钮另有 `level >= 50` 且必须为指定物种形态 3 的门禁，成功后还会把低于 8 的悟性加 1；`nianjhd` 道具绕过这些 UI 门禁和额外悟性奖励。

现代实现切片应只复现以上已证实行为：精确可注入随机的三属性洗练、还童字段重置与实体重建、三阶到四阶进化及奥义槽位边界。`nianqld` 可保留为明确的“不支持/证据不足”道具反馈，不应连接到任何战斗公式，直到出现包含 `potential` 定义的可靠构建或实测证据。

现代实现（`TASK-SLICE-079`）：

- `PetGrowthSystem.ts` 独立承载可注入随机的三属性洗练、全已知物种一阶还童表、基础被动随三阶到四阶的差值重算、奥义槽位门禁和原版形态 1/2 空耗边界。
- `PetConsumableSystem.ts` 已接入 `cwzzxld/wphtd/nianjhd`；`nianqld` 会明确提示原版字段/公式缺失并拒绝消耗。
- 还童与有效进化返回运行时重建信号，场景背包桥接清除旧 `petRuntime`，后续同步按新的 `species/form` 建立实体。
- 背包种子与物品 registry 已加入四个道具；宠物面板显示四类资质和悟性/技巧/战力，使用结果可观察。
- 独立 `pet-growth-tests.ts` 覆盖随机取样顺序、字段保持/重置、还童物种数值、被动重算、技能满槽、形态空耗/拒绝、背包消耗门禁和运行时重建。

## P2 本地双人宠物链（`TASK-SETTINGS-035`）

### 所有权与运行时隔离

- `Config.initData()` 始终分别创建 `player1 = new User()` 与 `player2 = new User()`；两个 `User` 构造函数各自创建独立 `petsAry`。`player1.init(0)`、`player2.init(1)` 只设置控制位，不共享宠物数据。
- `Config.createHero()` 分别把 `player1` 注入 `hero1`、把 `player2` 注入 `hero2`。`BaseHero.start() -> initPet()` 只调用自身 `getPlayer().findCurrentPet()`，所以每名英雄只从自己的宠物表创建出战实体。
- `BasePet(sourceRole, petInfo)` 保存所属英雄 `sourceRole`；跟随、传送、主人 buff、技能来源、联机 role id 和死亡同步都沿该英雄回溯。因此 P2 宠物必须绑定 P2 英雄，不能只给第二个视图复用 P1 runtime。
- `Config.getPetArray()` 可同时收集 `hero1.getPet()` 和 `hero2.getPet()`，证明本地双人允许两只宠物同时存在。
- `PetInterface` 构造参数是具体 `User`。列表、选择、放生、出战和休息都只读写 `this.player.petsAry`；`sendHeroRefreshPet()` 通过比较 `hero.getPlayer() == this.player` 只重建对应英雄的宠物，随后广播全局 `CHANGECURRENTPET` 供两个 HUD 各自刷新头像。

`User.findCurrentPet(includeExpired = false)` 从自身列表末尾向前查 `isFight == 1`；默认忽略寿命为 0 的宠物，道具传 `true` 时可返回寿命耗尽但仍标记出战的宠物。现代 P1/P2 roster 都应保留“每位玩家最多一只出战”的约束，但两位玩家之间互不排斥。

### 面板入口与交互

| 玩家 | 快捷键数组 | 背包 | 心法 | 宠物 |
| --- | --- | --- | --- | --- |
| P1 | `[C, V, B, N, Esc]` | `C` | `V` | `B` |
| P2 | `[num /, num *, num -]` | 小键盘 `/` | 小键盘 `*` | 小键盘 `-`（keyCode `109`） |

`KeyBoardControl` 根据 P1/P2 的英雄取得各自 `RoleInfo`，再对该 HUD 的 `btn_cw` 派发鼠标点击。`RoleInfo.cwClick()` 创建 `new PetInterface(this.hero.getPlayer())`，所以 P2 小键盘 `-` 打开的就是 P2 `User` 面板。快捷键分支位于 `isStop` 和舞台焦点检查之前（只先过滤 `TextField`），因此同一快捷键在面板暂停游戏后可再次触发全局 `closePetInterface` 关闭。

宠物列表内部没有键盘选择逻辑：每页 5 只、最多 2 页，宠物行通过鼠标 `CLICK -> plClick()` 选择；出战、休息、放生、洗练和进化也都是面板按钮。方向键属于 P2 移动，不是 P1 宠物面板键。现代测试场景当前把 P2 心法面板错误绑定到 `NUMPAD_SUBTRACT`，并用方向键操作唯一的 P1 宠物面板；P2 切片必须把心法恢复为小键盘 `*`、把小键盘 `-` 留给 P2 宠物面板，并以指针 UI 或不抢占另一玩家战斗键的等价交互替代方向键方案。

原版同一时刻只展示一个暂停式宠物面板：任一 `RoleInfo.cwClick()` 在 `gc.isStopGame` 为真时只广播关闭事件，不会再打开第二个面板。现代实现可维护 `activePetPanelSlot: p1 | p2 | null`，不需要叠放两个面板。

### 出战、普通经验与任务经验

- `fightClick()` 只把当前 `User.findCurrentPet()` 设为休息，再把所选宠物设为出战；`restClick()` 只清当前所选宠物。P1/P2 各自可同时拥有一只出战宠物。
- `BaseMonster.reduceHp()` 普通死亡路径不硬编码 P1/P2，而是读取当时的 `curAttackTarget`：若目标是某个 `BaseHero` 且该英雄有宠物实体，该英雄和该宠物各得 `0.6 * monster.exp`；无宠物则该英雄得完整经验；目标本身是 `BasePet` 时，该宠物得完整经验。因此路由天然沿 P2 英雄/P2 宠物工作，但源码依据是怪物当前攻击目标，不是明确的最后伤害来源。
- `TaskInterface` 的 `exp` 奖励是确认的原版 bug：先按 P1 当前宠物/英雄发一次；随后 P2 分支仍错误调用 `player1.findCurrentPet()`。P1 有出战宠物时，同一 P1 宠物会吃到两次奖励且 P2 什么也得不到；P1 无宠物时，P1/P2 英雄各得一次，即使 P2 有宠物也不会给 P2 宠物。该旁路不是普通战斗经验规则，现代 P2 宠物切片应按每位玩家自己的 roster 修正归属，并在文档中明确这是有意修 bug，而不是把 P1 宠物共享给 P2。

### 道具归属

- `RoleInfo.showBackPack()` 对 P2 调用 `BackPack.setpack(2)`；背包保存 `packNum = 2`、`hero = gc.hero2`、`player = hero2.getPlayer()`。
- 每个 `PackThings.setObj(item, who)` 保存 `who`，所有宠物道具通过 `gc["player" + who]` 和 `gc["hero" + who]` 路由。P2 使用 `djyys/cwjnxld/cwzzxld/wphtd/nianqld/nianjhd/wphhd/wpcsd` 时只读取或修改 P2 当前宠物；需要重建实体时通过玩家对象相等判断调用 `hero2.changePet()`。
- 因此现代实现不能让 P2 的宠物道具从 P1 roster 取目标。P2 背包能力尚未实现时，应先保持入口不可用或拆成后续切片，不能静默作用于 P1。

### 宣花葫芦捕捉归属

- P2 装备 `xhhl` 后，`BaseHero.initMagicWeapon()` 创建 `MagicBottle(hero2)`；小键盘 `7` 由 P2 法宝输入触发。
- 捕捉扣除 `sourceRole.getPlayer()` 的 5000 灵魂，并调用同一个玩家的 `catchNewPet()`。因此 P2 捕捉必然进入 `player2.petsAry`，不会进入 P1 列表。
- `MagicBottle.step()` 只要求 `gc.isSingleGame()`；本地双人仍处于 `nodeFloor == 0`，所以 P2 捕捉可用。联机房间不走该捕捉分支，继续后置。

### P2 存档与重建顺序

- `MemoryClass.setStorage()` 保存顶层 `playerNum`；P1/P2 角色存在时分别写 `player1_obj = player1.getSaveObj()`、`player2_obj = player2.getSaveObj()`。
- 每个 `User.getSaveObj()` 都把自身 `petsAry` 编为独立 `petSave`，单只宠物仍使用同一 26 字段格式，包含 `isFight` 和技能串。
- 读取时先分别调用 `player1.setSaveObj(player1_obj)`、`player2.setSaveObj(player2_obj)`，各自 `savePetSaveString()` 重建自己的 `PetInfo` 列表；之后 `Config.createHero()` 注入对应 `User`，`hero.start() -> initPet()` 根据各自 `isFight` 创建实体。
- 原版 `getPetSaveString()` 正序写出，但 `savePetSaveString()` 从分割数组末尾向前 `push()`，所以列表顺序每次读档会反转；出战标记仍跟随宠物字段。现代版应保持稳定列表顺序，不复刻该 UI 排序 bug。
- 当前现代 `SaveSystemV1` 只有 `player1.pets/selectedPetIndex`，尚未保存 P2。P2 实现必须升级 schema 或提供兼容迁移：旧 v1 存档读取为 P2 空 roster，新版本分别保存两位玩家的宠物列表、选中索引和单只出战约束；冷却/Buff 仍不持久化。

### 现代任务拆分建议

首个切片只建立 P2 所有权骨架：两套 roster、两套 runtime、各自跟随主人、P1 `B`/P2 小键盘 `-` 打开带 owner 标识的单实例面板，并修正 P2 心法键冲突。面板选择/出战必须作用于打开面板的玩家；系统测试证明 P1/P2 可同时出战且互不改写。

后续再分别接入：

1. P2 宠物技能、受击触发、主人 buff 和普通击杀经验的 owner 路由。
2. P2 背包宠物道具、宣花葫芦捕捉和版本化双玩家存档。
3. 任务奖励经验按玩家独立修正；等现代任务系统存在时接入，不复制原版双发给 P1 宠物的 bug。

## 掉落边界

`TASK-SETTINGS-017` 已确认 `Monster2001` 中的 `cwzb/p_cykljl` 不是可用的宠物入包链路：

- `FallEquipObj.colwho()` 只处理 `zb/dj/sz`，没有 `cwzb` 分支。
- `p_cykljl` 未在 `AllEquipment`、背包、`PetInfo` 或 `PetInterface` 中发现对应定义。
- 可见宠物新增入口直接操作 `petsAry` 或调用 `catchNewPet()`。

现代实现不应新增 `DropBigType = "cwzb"` 来伪装宠物掉落。宠物消耗品可作为普通道具进入背包；宠物本体获得应走独立 `PetInfo`/宠物仓库入口。

## 最小现代模型建议

**注意**：AS3 数值基数 `hy.first = 2×atk`、`sxhz.first = 4×atk`、`hsqj.first = 6×atk` 等来自 `PetInfo.getPetHarmObj()`，均已确认。凤凰 `phoenix1..4`、兔 `rabbit1..4`、鼠 `mouse1..4` 的专属技能链见下方新增章节。

## 凤凰 `phoenix1..4` 专属技能链（`TASK-SETTINGS-033` 部分逆向）

`BaseHero.addPetByPi()` 按 `phoenix1..4` 分别创建 `PetPhoenix1..4`。`PetInfo` 中文名：`phoenix1 = 雀蛋`、`phoenix2 = 炎皇雀`、`phoenix3 = 朱雀将军`、`phoenix4 = 朱雀女皇`。`PetInfo.rePetSkill()` 候选池：`phoenix1: np`、`phoenix2: np/bshn`、`phoenix3: np/bshn/dhly`、`phoenix4: np/bshn/dhly/zqaoyi`。

技能中文名来自 `PetInfo.getIntroByName()`：`np = 涅槃`（HP ≤ 20% 化成朱雀丹满血复活）、`bshn = 不死火鸟`（前方伤害）、`dhly = 地火燎原`（周围大伤害）、`zqaoyi = 朱雀奥义`。

AS3 数据来自 `PetPhoenix1..4.as`（主参考包 172845）：

| 类 | 技能 | 条件 | 动作/伤害或状态 |
| --- | --- | --- | --- |
| `PetPhoenix1..4` | skill1 `np` | 已学 `np`、MP `>= 20`、HP ≤ 20%、不在 `hit2` 中 | `hit2`，扣 20 MP，持续约 120 帧（AS3 30fps 等价 ~4s）；期间免疫受击（`setAction("hurt")` 被拒绝）、受到伤害降至 1/3；结束时 `setHp(getSHp())` 满血复活并生成 `FollowBaseObjectBullet("PetPhoenix1Bullet2_2")`；`hit2` 直接伤害 = 0 |
| `PetPhoenix2..4` | skill2 `bshn` | 已学 `bshn`、MP `>= 20`、目标距离 `≤400` | `hit3`，扣 20 MP，`SpecialEffectBullet("PetPhoenix2Bullet3")`，魔法命中，击退 `[10,-5]`、间隔 5；按 `3.6 × pet.atk + fsnl` 接入 `sxkb` |
| `PetPhoenix3..4` | skill3 `dhly` | 已学 `dhly`、MP `>= 20`、存在目标 | `hit4`，扣 20 MP，`SpecialEffectBullet`（待确认 projectile 名），魔法，按 `7.4 × pet.atk + fsnl` 接入 `sxkb` |
| `PetPhoenix4` | skill4 `zqaoyi` | 已学 `zqaoyi`、MP `>= 30`、存在目标 | 扣 30 MP，`hit5`；朱雀奥义：启动时若已学 `np` 给 `hit3/4/5` 附加 `PETMONKEY_FIRE` 灼烧效果；奥义本体直接伤害保持 0（`getPetHarmObj("zqaoyi").first = 0`） |

CD 参数（`skillCDN = [初始帧, 间隔帧]`，`gc.frameClips = 30`）：

| 形态 | CD1 `np` | CD2 `bshn` | CD3 `dhly` | CD4 `zqaoyi` |
| --- | --- | --- | --- | --- |
| phoenix1 | `[60, 90]` ≈ 2s/3s | — | — | — |
| phoenix2 | `[60, 90]` ≈ 2s/3s | `[90, 150]` ≈ 3s/5s | — | — |
| phoenix3 | `[60, 90]` ≈ 2s/3s | `[90, 150]` ≈ 3s/5s | `[120, 240]` ≈ 4s/8s | — |
| phoenix4 | `[60, 90]` ≈ 2s/3s | `[90, 150]` ≈ 3s/5s | `[120, 240]` ≈ 4s/8s | `[450, 720]` ≈ 15s/24s |

资源键：本体 `PetPhoenixBmd1..4`；弹体 `PetPhoenix1Bullet1`、`PetPhoenix1Bullet2_1`、`PetPhoenix1Bullet2_2`、`PetPhoenix2Bullet3`。

凤凰现代最小切片建议：

| 优先级 | 切片 | 理由与边界 |
| --- | --- | --- |
| 1 | `phoenix1/np` | 特殊触发技能（HP ≤ 20% 自动涅槃），不同于其他宠物的主动/被动模式 |
| 2 | `phoenix2/bshn` | 主动伤害，模式与 `tigress1/hy` 类似 |
| 3 | `phoenix3/dhly` | 范围大伤害 |
| 4 | `phoenix4/zqaoyi` | 朱雀奥义组合 |

## 兔 `rabbit1..4` 专属技能链（`TASK-SETTINGS-033` 部分逆向）

`BaseHero.addPetByPi()` 按 `rabbit1..4` 创建 `PetRabbit1..4`。`PetInfo` 中文名：`rabbit1 = 月兔`、`rabbit2 = 疾风兔`、`rabbit3 = 寒冰玉兔`、`rabbit4 = 冰霜月神`。`PetInfo.rePetSkill()` 候选池：`rabbit1: yg`、`rabbit2: yg/jf`、`rabbit3: yg/jf/bs`、`rabbit4: yg/jf/bs/ysaoyi`。

技能中文名：`yg = 月光`（攻击概率落月光）、`jf = 疾风`（提高普攻频率和闪避）、`bs = 冰霜`（空中狙击附带冰冻）、`ysaoyi = 月神奥义`（制造明月增加月光触发+持续回复玉兔和主人生命）。

| 类 | 技能 | 条件 | 动作/伤害 |
| --- | --- | --- | --- |
| `PetRabbit1` | skill1 `yg` | 已学 `yg` | 被动：普攻 `EnemyMoveBullet("PetPetRabbitBullet1")` 命中时概率触发 `SpecialEffectBullet("Monster130Bullet2")` 额外月光打击；按 `3.6 × pet.atk`，MP 消耗 = 0 |
| `PetRabbit2..4` | skill1 `jf` | 已学 `jf`、MP `>= 20` | 自身 buff：`SpecialEffectBullet("PetPetRabbitBulletBuff")` 提升普攻频率和闪避；`getPetHarmObj("jf").first = 0`（无直接伤害） |
| `PetRabbit3..4` | skill2 `bs` | 已学 `bs`、MP `>= 20`、存在目标 | `SpecialEffectBullet("PetPetRabbitBullet4")` + 冰冻效果；按 `8 × pet.atk + fsnl` |
| `PetRabbit4` | skill3 `ysaoyi` | 已学 `ysaoyi`、MP 足够 | 月神奥义：创建明月领域，增加月光触发概率，持续回复玉兔和主人生命；本体伤害 = 0 |

CD：`skillCD1 = [60, 198]` ≈ 2s/6.6s，`skillCD2 = [120, 243]` ≈ 4s/8.1s，`skillCD3 = [300, 360]` ≈ 10s/12s。

资源键：本体 `PetPetRabbitBmd1..4`；弹体 `PetPetRabbitBullet1`、`PetPetRabbitBulletBuff`、`PetPetRabbitBullet4`、`Monster130Bullet2`。

## 鼠 `mouse1..4` 专属技能链（`TASK-SETTINGS-033` 部分逆向）

`BaseHero.addPetByPi()` 按 `mouse1..4` 创建 `PetMouse1..4`。`PetInfo` 中文名：`mouse1 = 子鼠元帅`、`mouse2 = ?`、`mouse3 = ?`、`mouse4 = ?`（待确认）。`PetInfo.rePetSkill()` 候选池：`mouse1..3: sc`、`mouse4: sc/hxfb/zsaoyi`。

`PetMouse2` 和 `PetMouse3` 是 `PetMouse1` 的空子类（无新增行为）。`PetMouse4` 继承 `PetMouse1` 并扩展 `hxfb` 和 `zsaoyi`。

技能中文名：`sc = 鼠窜`（冲撞撕咬）、`hxfb = 回旋飞镖`（三叉飞镖回旋）、`zsaoyi = 紫鼠奥义`。

| 类 | 技能 | 条件 | 动作/伤害 |
| --- | --- | --- | --- |
| `PetMouse1..4` | skill1 `sc` | 已学 `sc`、MP `>= 15`、存在目标 | 扣 15 MP；`SpecialEffectBullet("PetMouse1Bullet1")` + `SpecialEffectBullet("PetMouse1Bullet2")`（命中时概率重新触发 `sc`）；按 `1.3 × 2.2 × pet.atk ≈ 2.86×atk + fsnl`，接入 `sxkb` |
| `PetMouse4` | skill2 `hxfb` | 已学 `hxfb`、MP `>= 20`、存在目标 | 扣 20 MP；三枚 `PetMouse4Bullet3("PetMouse1Bullet3")` 飞镖，按 `0.69 × 5 × pet.atk ≈ 3.45×atk + fsnl` |
| `PetMouse4` | skill3 `zsaoyi` | 已学 `zsaoyi`、MP `>= 30`、存在目标 | 扣 30 MP；紫鼠奥义：启动后 `_aoyiStep` 计数器递增，第 4 步免蓝释放 `sc`，第 6+ 步免蓝释放 `hxfb`，步 > 7 后重置；本体伤害 = 0 |

CD（mouse4）：`skillCD1 = [120, 180]` ≈ 4s/6s，`skillCD2 = [120, 210]` ≈ 4s/7s，`skillCD3 = [240, 480]` ≈ 8s/16s。mouse1 的 CD1 = `[120, 300]` ≈ 4s/10s。

资源键：本体 `PetMouseBmd1..4`（待确认）；弹体 `PetMouse1Bullet1`、`PetMouse1Bullet2`、`PetMouse1Bullet3`（`PetMouse4Bullet3` 类）。

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



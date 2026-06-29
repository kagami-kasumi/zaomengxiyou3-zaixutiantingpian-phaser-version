# 等级/经验机制索引

本文记录玩家等级、经验、升级曲线、属性成长、经验来源和存档字段。来源为主参考包 `extracted_flash/resources_by_swf/[172845].swf/scripts`。现代实现只复现可观察行为，不照搬 AS3 的加密拆字段写法。

## 结论

- 玩家等级上限是 90，见 `my/AllConsts.as` 的 `GAME_ROLE_MAXLEVEL = 90`。
- `User` 保存玩家进度字段：`curLevel` 当前等级、`curExp` 当前等级内累计经验。
- `BaseRoleProperies` 运行时字段：`level` 当前等级、`exper` 当前等级内累计经验、`exp` 升到下一级所需经验。
- 初始化时 `BaseHero.initPopertits()` 从 `player.getCurLevel()` 与 `player.getCurExp()` 写入 `roleProperies`，随后调用角色自己的 `upGrade()` 刷新基础属性和本级所需经验。
- 普通升级入口是 `BaseRoleProperies.setExper(newValue)`：当 `exper >= exp` 且 `level < 90` 时进入 `judgeUpGrade()`。
- 升级只升一级，然后扣除本级所需经验；如果一次获得足够多经验，`setExper()` 递归路径会继续判断后续等级。
- 角色升级会回满 HP/MP，并按角色独立公式重算生命、魔法、基础攻击、防御，再调用 `initAll()` 合并装备、被动、buff 等附加属性。
- 普通怪物死亡经验来源在 `BaseMonster.reduceHp()`：击杀目标是玩家时，给 `curAttackTarget.roleProperies` 加怪物 `protectedParamsObject.exp`；如果玩家有当前宠物，则玩家和宠物各获得 `exp * 0.6`。
- 特殊怪物 `Monster111` 覆写死亡经验：玩家带宠物时玩家和宠物各获得完整 `exp`；无宠物时尝试给双人双方加经验，代码以击杀者当前经验为基准，有原版异常风险。
- 任务奖励 `TaskInterface` 直接写 `User.curExp` 或宠物经验，不经过 `roleProperies.setExper()`；首个现代成长切片不应先复现这个旁路。

## 字段和初始化

`user/User.as`：

- 构造默认 `setCurLevel(1)`、`setCurExp(0)`。
- `setCurLevel()` 和 `setCurExp()` 都用两个随机拆分字段保存，`getCurLevel()` / `getCurExp()` 返回两段之和。
- `getSaveObj()` 写出 `curExp`、`curLevel`。
- `setSaveObj()` 读入 `curExp`、`curLevel`；首次读取且存档等级达到上限时，会把经验置 0、等级置为 `GAME_ROLE_MAXLEVEL - 1`，否则按存档值恢复。

`base/BaseHero.as`：

- 构造函数中保留 `levelexp = [135,145,155,165,175,185,625,675,725,775,825,875,1950,2050,2150,2250,2350,2450,5000]`，但实际升级曲线由各 `Role*.upGrade()` 计算。
- `initPopertits()` 调用 `roleProperies.setInitValue()`，再设置等级和经验，最后调用 `upGrade()`。
- 非隐藏调试时会把等级事件发成 `999999`，属于调试路径；现代正式玩法不要继承。

`base/BaseRoleProperies.as`：

- `properiesObj` 初始包含 `level1/level2`、`exper1/exper2`、`exp1/exp2` 等拆分字段。
- `setInitValue()` 清零大量基础属性，并调用 `setexp(0)`。
- `setexp(value)` 只写当前等级所需经验 `exp`，不触发升级。
- `setLevel(value)` 写等级，并同步 `who.getPlayer().setCurLevel(getLevel())`。
- `setExper(value)` 写当前等级内经验，并同步 `who.getPlayer().setCurExp(getExper())`；如果 `value >= exp` 且等级未达上限，则调用 `judgeUpGrade()`。
- `judgeUpGrade()`：保存旧 `exp`，等级 +1，调用 `who.upGrade(false)`，再把经验设为 `oldExper - oldExp`，同步 `User.curExp`，并添加 `RoleLevelUpMc` 升级表现。

## 升级曲线

五个角色使用相同经验曲线。设当前等级为 `L`，`expToNext(L)` 为从 `L` 升到 `L + 1` 所需经验：

| 等级范围 | 公式 |
| --- | --- |
| `1 <= L < 7` | `135 + 10 * (L - 1)` |
| `7 <= L < 13` | `625 + 50 * (L - 7)` |
| `13 <= L < 19` | `1950 + 100 * (L - 13)` |
| `19 <= L < 89` | `5000 + 5000 * (L - 19)` |
| `L >= 89` | `999999999` |

`AllConsts.GAME_ROLE_MAXLEVEL = 90`，UI 在等级 `>= 90` 时显示 `MAX`，经验条固定满或特殊帧。`setExper()` 在等级已经达到 90 后不会继续累加普通击杀经验。

## 角色基础属性成长

各 `export/hero/Role*.as` 的 `upGrade(param1:Boolean = true)` 都先调用 `super.upGrade()`；当 `param1 == false` 时会 `removeAllEquipAndPassive()`，然后重算基础属性、回满 HP/MP、设置下一等级经验、再 `initAll()`。

| 角色 | SHHP 最大生命 | SMMP 最大魔法 | basePower 基础攻击 | defense 防御 |
| --- | --- | --- | --- | --- |
| Role1 悟空 | `80 + 50 * (L - 1)` | `50 + 20 * (L - 1)` | `10 + 5 * (L - 1)` | `2 + 2 * (L - 1)` |
| Role2 唐僧 | `50 + 20 * (L - 1)` | `100 + 40 * (L - 1)` | `12 + 8 * (L - 1)` | `L - 1` |
| Role3 八戒 | `100 + 70 * (L - 1)` | `35 + 15 * (L - 1)` | `15 + 8 * (L - 1)` | `4 + (L - 1)` |
| Role4 沙僧 | `70 + 30 * (L - 1)` | `70 + 30 * (L - 1)` | `9 + 4 * (L - 1)` | `L - 1` |
| Role5 白龙 | `70 + 49 * (L - 1)` | `55 + 24 * (L - 1)` | `9 + 6 * (L - 1)` | `2 + 1.5 * (L - 1)` |

AS3 的 `setDefense()` 接受 `int`，但 Role5 传入 `1.5` 倍公式；现代实现应明确使用数字并在显示/结算时按既有防御系统决定取整边界。

## 经验来源

### 怪物死亡

`base/BaseMonster.as`：

- 默认 `protectedParamsObject.exp = 0`，各 `export/monster/Monster*.as` 在构造或分支中覆盖。
- 困难度影响：`gc.difficulity == 1` 时怪物经验乘 `1.6`；`gc.difficulity == 2` 时经验乘 `0.01`。
- `EndlessModeCreate()` 使用传入 `param5` 作为基础经验，再按波次 `param6` 增加 `10% * (param6 - 1)`。
- 死亡时如果 `curAttackTarget is BaseHero`：
  - 有当前宠物：玩家 `roleProperies.exper += exp * 0.6`，宠物 `curExper += exp * 0.6`。
  - 无当前宠物：玩家 `roleProperies.exper += exp`。
- 如果 `curAttackTarget is BasePet`，则宠物获得完整 `exp`。

首关已实现怪物示例：

- `Monster30.as` 默认 `exp = 4`，在当前为多人或联机相关分支时可被置为 0。
- `Monster3.as` 默认 `exp = 7`。

### 事件和任务

- `BaseMonster.as` 还有 `addExper(param1:BaseHero)`，通过 `roleProperies.dispatchEvent(new CommonEvent("AddExper",[exp]))` 增加经验；这是辅助入口。
- `export/taskInterface/TaskInterface.as` 的奖励类型 `"exp"` 会直接写玩家 `User.curExp` 或当前宠物 `curExper`。这个路径没有直接调用 `BaseRoleProperies.setExper()`，应留到任务系统或存档同步任务里再处理。

## UI 和存档表现

- `export/pack/BackPack.as` 背包界面展示等级、当前经验 / 下级经验；满级显示 `MAX`。
- `export/RoleInfo.as` 角色信息面板展示 HP、MP、等级、经验条；满级显示 `MAX`。
- `User.getSaveObj()` 保存 `curExp`、`curLevel`，角色运行时通过 `BaseHero.initPopertits()` 从 `User` 恢复。

## 现代最小切片建议

推荐下一个切片为 `VS-014 等级/经验最小闭环`：

- 范围：只接入玩家击杀怪物获得经验、自动升级、扣除本级经验、回满 HP/MP、刷新当前角色基础 HP/MP/攻击/防御、状态栏显示等级和经验。
- 首批角色：可先覆盖当前测试场景使用的 Role2 唐僧公式，同时把五角色公式放入配置表，避免后续再迁移。
- 首批经验来源：只用 `Monster30.exp = 4` 和一个可调试高经验入口；不接任务奖励、宠物分成、`Monster111` 特例、存档持久化。
- 双人边界：经验归击杀目标/归属攻击目标对应玩家；P1/P2 各自持有 `curLevel/curExp`。双人经验共享只在特殊怪 `Monster111` 发现，不作为普通规则。
- 待后置：任务奖励经验旁路、宠物经验成长、难度倍率、无尽模式经验、满级存档修正、角色信息/背包完整 UI。



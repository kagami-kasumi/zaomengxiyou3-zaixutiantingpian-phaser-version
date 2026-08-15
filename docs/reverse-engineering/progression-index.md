# 五角色等级/经验/成长索引

本文是 `TASK-SETTINGS-172` 的证据与实现输入合同。机器可消费事实位于
`reference/hero-progression-catalog-1.1.json`，结构约束位于
`reference/hero-progression-catalog.schema.json`，可重复生成与校验入口为
`npm run generate:hero-progression-catalog` 和 `npm run test:hero-progression-catalog`。

## 待证明的可观察问题

1. Role1..Role5 在 1..90 级的 HP、MP、基础攻击、防御和共同升级经验是什么？
2. Role5 `1.5` 防御成长在 AS3 的真实整数边界是什么？
3. 跨级时升级、扣余数、回满 HP/MP、去除/重加 buff、装备、被动和丹药的顺序如何？
4. 89→90 级与 90 级经验 sentinel 的边界是什么？
5. 普通怪、难度倍率、宠物分成、P1/P2 owner、原版 `User.curLevel/curExp` 与当前存档如何连接？
6. 任务奖励直写、宠物成长、`Monster111`、无尽模式和升级特效哪些不属于普通五角色成长？

结论：普通成长实现输入的未知为 0。目录含 5 个角色、90 条共同经验记录与
450 条角色-等级记录，并保留每个源文件的 SHA-256 和 locator。

## 六段证据链

| 行为合同项 | 局部证据 | 共享调用链 | 几何/坐标证据 | 证据等级 | 未知与反证条件 | 验证方式 |
| --- | --- | --- | --- | --- | --- | --- |
| 五角色基础值 | `Role1.as:2484-2526`、`Role2.as:1907-1949`、`Role3.as:1740-1782`、`Role4.as:2762-2804`、`Role5.as:4838-4880` | `BaseHero.initPopertits():318-333` 选定 User 等级后调用角色 `upGrade()`；`BaseRoleProperies` 的四 setter 消费 | 不适用：纯数值，不改 UI/空间 | 交叉确认 | 任一 Role `upGrade` 或 setter 类型/源 hash 改变时重开 | 生成器解析五个函数，校验 450 条记录与边界级 |
| Role5 整数防御 | `Role5.as:4853` 传入 `2 + 1.5*(L-1)` | `BaseRoleProperies.setDefense(param1:int):674-682` 在写入前已执行 AS3 `int` 转换 | 不适用 | 交叉确认 | setter 改为 `Number` 或运行观察反证时重开 | 目录固定正数向 0 截断：Lv2=3、Lv90=135 |
| 共同经验表 | 五个 `Role*.upGrade()` 各自含相同五分段 | `AllConsts.as:14` 固定上限 90；`setexp(int)` 写入门槛 | 不适用 | 交叉确认 | 五个角色分支不再一致时重开 | 生成器比对五份源，校验 1/6/7/12/13/18/19/88/89/90 |
| 跨级/回满/派生顺序 | `setExper:790-809`、`judgeUpGrade:530-545` | `BaseHero.upGrade:1756-1762` 先去 buff；Role `upGrade(false)` 去丹药/装备/被动、重建基础值，`initAll:1105-1114` 再加被动/装备/丹药，`addAllEquip:966-981` 最终回满 | `RoleLevelUpMc` 视觉不适用于本 task，已排除 | 交叉确认 | 任一顺序函数变化时重开 | 7 个纯合同向量覆盖普通、多级、88→89、89→90与 90 级边界 |
| 普通怪经验 owner | `BaseMonster.reduceHp:1433-1467` | `curAttackTarget` 是 BaseHero 时写该 Hero 的 `roleProperies/User`；是 BasePet 时只写该 Pet；难度在 `217-242` 先改 monster exp | 不适用 | 确认事实 | `Monster111`、任务奖励和无尽模式为明确反例 | 目录固定难度/分成合同；下一 task 做 P1/P2 事务回归 |
| 存档/HUD 交接 | `User.getSaveObj:628-656`、`setSaveObj:658-703`；`BackPack.as:135-161`；`RoleInfo.as:271-281` | 原版每个 User 保存 `curLevel/curExp`；当前 `SaveSystem` 每个 player 保存 `level/currentExp`；HUD 消费同 owner snapshot | UI 几何不适用：本 task 不重开显示列表 | 交叉确认 | 当前 schema 或 player owner 形状改变时重开；旧 schema 继续直接拒绝 | 下一 task 以当前 schema 做 P1/P2 往返与正式战斗/HUD 回归 |

## 权威数值合同

设当前等级为 `L`。所有 setter 参数均为 AS3 `int`；Role5 防御不保留 `.5`。

| 角色 | 最大 HP | 最大 MP | 基础攻击 | 基础防御 |
| --- | --- | --- | --- | --- |
| Role1 悟空 | `80 + 50*(L-1)` | `50 + 20*(L-1)` | `10 + 5*(L-1)` | `2 + 2*(L-1)` |
| Role2 唐僧 | `50 + 20*(L-1)` | `100 + 40*(L-1)` | `12 + 8*(L-1)` | `L-1` |
| Role3 八戒 | `100 + 70*(L-1)` | `35 + 15*(L-1)` | `15 + 8*(L-1)` | `4 + (L-1)` |
| Role4 沙僧 | `70 + 30*(L-1)` | `70 + 30*(L-1)` | `9 + 4*(L-1)` | `L-1` |
| Role5 白龙 | `70 + 49*(L-1)` | `55 + 24*(L-1)` | `9 + 6*(L-1)` | `int(2 + 1.5*(L-1))` |

五角色共用下列 `expToNext(L)`：

| 等级 | 门槛 |
| --- | --- |
| `1..6` | `135 + 10*(L-1)` |
| `7..12` | `625 + 50*(L-7)` |
| `13..18` | `1950 + 100*(L-13)` |
| `19..88` | `5000 + 5000*(L-19)` |
| `89..90` | `999999999` sentinel |

关键边界：Lv1=135、Lv6=185、Lv7=625、Lv12=875、Lv13=1950、Lv18=2450、
Lv19=5000、Lv88=350000、Lv89/Lv90=999999999。

## 升级、派生与回满时序

`setExper(proposedTotal)` 在未达门槛时直接写入；达门槛且等级低于 90 时：

1. 快照旧级 `exp` 门槛，等级 +1 并同步到当前 User。
2. `who.upGrade(false)` 先经 `BaseHero.upGrade()` 去除全部 buff。
3. 去除丹药、全装备、全被动；写新级基础值并暂时回满。
4. 设新级门槛，再依次重加被动、装备、丹药；`addAllEquip()` 结尾回满到最终派生上限。
5. 用 `proposedTotal - oldThreshold` 递归 `setExper()`，直到余数低于新门槛或到达满级边界。
6. 递归返回后每级各添加一个 `RoleLevelUpMc`；该特效的帧与几何排除到后续视觉 task。

初始读档不走升级递归：`BaseHero.initPopertits()` 先清属性，写 level，用
`setinitExper()` 写当级经验，再调 `upGrade()` 重建当级属性。

90 级不是“完全不再累加”：新 total 低于 sentinel 时仍写入；新 total 达到或超过
sentinel 时，`setExper()` 两分支均不写入，保持先前余数。UI 在 90 级显示 `MAX`。

## 经验来源、owner 与排除

- 普通怪基础经验先经难度变换：普通 `1`、困难 `1.6`、地狱 `0.01`。
- 死亡时以 `curAttackTarget` 为 owner。Hero 无宠物时经验只写该 Hero/User；有宠物时 Hero
  与该宠物各取 `0.6`；目标是 Pet 时只写该 Pet。
- Hero 经验最终进入 `setExper(int)`，难度或 `0.6` 产生的正小数在 Hero 消费边界向 0 截断。
- P1/P2 分别由各自 Hero→Player/User 链路持有 level/exper，不共享普通怪经验。
- `TaskInterface.as:328-353` 直写 `User.curExp` 而不调用角色 `setExper()`，是明确旁路。
- `Monster111.as:337-361` 存在特殊共享/错用击杀者当前经验的异常分支，明确排除。
- 无尽波次、宠物升级公式、任务奖励宠物分支和升级特效资源均后置。

## 现代映射与已知差异

| owner/消费者 | 当前状态 | 下一 task 合同 |
| --- | --- | --- |
| `ProgressionSystem` | 179 已直接消费成长目录的 450 条角色等级记录与 90 条经验记录，Role5 防御和 7 转换向量均按目录 | 不再维护第二份公式；目录缺项直接报错 |
| `Stage1CombatSystem` / 正式 reward bridge | 升级按各 player 当前 loadout（含实例 override/强化）重建有效 HP/MP/攻击/防御并回满 | 普通怪奖励只写明确 `PlayerSlot`，不建第二 owner |
| `MonsterDefeatRewardSystem` | 奖励带显式 `PlayerSlot`，五关共享 reward bridge 只更新/保存该 owner | P1/P2 击杀、跨级和不串号由专项与全系统回归覆盖 |
| `Stage1CombatHudSystem` / 正式背包 | 消费当前 player progression；满级显示 `MAX`；940×590 1P/2P 数值投影通过 | 未改显示列表、几何或资源 |
| `SaveSystem` V7 | 每 player 的 `heroId/level/currentExp` 与装备实例共同恢复到正式 runtime；奖励后写回同一活动槽 | 唯一当前 schema 保持，旧版、坏类型和越界经验直接拒绝，不生成迁移 |

## 验证和交接

- 生成器从原 AS3 解析四基础属性表达式，对比五份经验分段，记录源 hash/locator。
- `--check` 重放 7 转换向量，覆盖未跨级、单级、多级、88→89、89→90、90 级 sentinel 两分支。
- schema 固定 5 角色、90 经验记录、450 角色-等级记录、关键分段和零未知。
- `TASK-SLICE-179` 已完成现代接入；本目录继续作为唯一普通五角色成长事实源。明确排除项不得因本次实现被补成普通成长事实。

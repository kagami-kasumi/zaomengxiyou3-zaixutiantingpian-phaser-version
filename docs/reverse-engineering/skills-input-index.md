# 正式技能输入索引

本文记录正式技能输入、绑定、学习、升级、拖拽、被动技能、UI 快捷键和存档字段的完整逆向结果。覆盖 `M-016`、`M-041`、`M-044`、`VS-008` 的实现边界。

## 证据入口

- `extracted_flash/scripts/172845/scripts/my/KeyBoardControl.as`
- `extracted_flash/scripts/172845/scripts/base/BaseHero.as`
- `extracted_flash/scripts/172845/scripts/user/User.as`
- `extracted_flash/scripts/172845/scripts/config/Config.as`
- `extracted_flash/scripts/172845/scripts/export/GameInfo.as`
- `extracted_flash/scripts/172845/scripts/export/RoleInfo.as`
- `extracted_flash/scripts/172845/scripts/export/shop/BuySkill.as`
- `extracted_flash/scripts/172845/scripts/export/shop/SkillControl.as`
- `extracted_flash/scripts/172845/scripts/export/shop/SkillSetControl.as`
- `extracted_flash/scripts/172845/scripts/export/shop/PassiveSkillControl.as`
- `extracted_flash/scripts/172845/scripts/export/hero/Role1.as` 至 `Role5.as`
- `extracted_flash/scripts/172845/scripts/storage/MemoryClass.as`
- `extracted_flash/scripts/172845/scripts/export/saveInterface/SaveInter.as`

## 结论

原版技能系统分四个独立子系统：学习（BuySkill → SkillControl）、升级（skillupgradeFunc）、拖拽绑定（SkillSetControl）和被动技能（PassiveSkillControl）。它们共享 `User.isstudyskill` 和 `User.skillbykey` 两个核心数据结构，全部随 `User.getSaveObj()` 持久化。

正式可绑定技能槽只有 `0..4` 五个。槽位 `5` 是 Space/小键盘 0，对应角色特殊能力 `showSkillKongGe()`；槽位 `6` 是 H/小键盘 7，对应法宝 `showSkillFaBao()`。这两个槽不走 `User.skillbykey`。

---

## 1. 按键到槽位

`KeyBoardControl` 的技能数组：

| 槽位 | P1 物理键 | P1 keyCode | P2 物理键 | P2 keyCode | `sendSkill()` 行为 |
| --- | --- | ---: | --- | ---: | --- |
| 0 | Y | 89 | 小键盘 8 | 104 | `showSkill("Y")` 或 `showSkill("8")` |
| 1 | L | 76 | 小键盘 3 | 99 | `showSkill("L")` 或 `showSkill("3")` |
| 2 | U | 85 | 小键盘 4 | 100 | `showSkill("U")` 或 `showSkill("4")` |
| 3 | I | 73 | 小键盘 5 | 101 | `showSkill("I")` 或 `showSkill("5")` |
| 4 | O | 79 | 小键盘 6 | 102 | `showSkill("O")` 或 `showSkill("6")` |
| 5 | Space | 32 | 小键盘 0 | 96 | `showSkillKongGe()` |
| 6 | H | 72 | 小键盘 7 | 103 | `showSkillFaBao()` |

P1 技能键数组：`[89, 76, 85, 73, 79, 32, 72]`
P2 技能键数组：`[104, 99, 100, 101, 102, 96, 103]`

输入过滤沿用战斗输入规则：

- 焦点在 `TextField` 时直接返回。
- `KeyBoardControl.isStop` 为真时返回。
- `gc.stage.focus != gc.stage` 时战斗输入返回。
- 只有 `gc.isInRoomOrSingleGame()` 时 `KeyBoardControl` 才处理普通技能键；`isInHost()` 分支只处理移动/跳跃/上/下。

现代实现建议：

- `InputSystem` 暴露 `skillSlots[0..4]`、`special`、`magicWeapon`，不要把 Space/H 混入普通技能槽。
- `HeroController` 负责把 `skillSlots[n].pressed` 转为 `requestSkillSlot(n)`；角色状态机再根据绑定、MP 和动作状态决定是否释放。

---

## 2. 技能绑定数据

### `User.skillbykey`

`User.skillbykey` 是正式技能槽绑定数组。核心字段：

| 字段 | 含义 |
| --- | --- |
| `skillName` | 技能代号，例如 `sgq`、`smb` |
| `keys` | 绑定显示键，P1 为 `Y/L/U/I/O`，P2 为 `8/3/4/5/6`，未绑定可为 `Not` |
| `needLh` | UI/学习树侧计算出的灵魂/消耗需求，角色释放时通常不会直接把它当 MP 消耗 |
| `slev` | 绑定对象保存的技能等级；异常或大于 18 时会被修正为 1 |

`User.returnSkillNameBySkillKey(key)` 只扫描 `Math.min(skillbykey.length, 5)`，因此正式输入只看前 5 个绑定对象。匹配 `keys` 后返回：

```text
[skillName, needLh, undefined, studiedLevel]
```

`returnSkillLevelBySkillName(skillName)` 遍历整个 `skillbykey` 数组（不限于前 5 个），按 `skillName` 匹配并返回 `slev`。未找到时返回 `1`。若 `slev > 18`，自动修正为 `1`。

`returnSkillNameBySkillKey()` 的第四项来自 `returnSkillIsStudy(param1)`，这里传入的是按键字符串而不是技能名，按源码看通常会回退为 `1`。角色释放时会再次调用 `returnSkillLevelBySkillName(skillName)`，这才是实际 MP 公式使用的等级来源。

### 绑定数组的排序规则

新绑定通过 `unshift()` 放到数组最前面；旧绑定（被替换的键位对象）通过 `push(splice(index,1))` 移到数组末尾。这意味着前 5 个元素是"最近绑定的技能"，逆序扫描时最新绑定优先。

现代实现应直接维护 5 个槽位数据，不保留历史重复键位。

---

## 3. 技能学习

### 入口链

```text
V 键 / 小键盘 * 按下
→ KeyBoardControl 识别 shortcutKeyArray index 1
→ RoleInfo.btn_study.dispatchEvent(MouseEvent.CLICK)
→ RoleInfo.studySkill()
→ 派发 CommonEvent("showBuySkill", {state:"gameing"})
→ 打开 BuySkill 面板（暂停游戏）
→ 玩家点击角色头像 → playerBuy() → activeFun()
→ 创建 SkillControl 实例
```

### 心法树结构

每个角色有两个心法树（`whichxf` = 1 或 2），每个树有 5 个技能槽。心法树按角色不同：

| 角色 | 心法 1 | 心法 1 代号 | 心法 2 | 心法 2 代号 |
| --- | --- | --- | --- | --- |
| 悟空 | 斩系心法 | slz, zz, sx, qsez, hmz | 火系心法 | lys, hytj, lyfb, jdy, hyjj |
| 唐僧 | 愈系心法 | sgq, myhc, jgz, tjgl, jhsj | 水系心法 | blb, xbz, shy, sjt, smb |
| 八戒 | 御系心法 | dj, sd, rj, zznh, syzq | 土系心法 | ssp, jsp, dgq, xgq, tmc |
| 沙僧 | 毒系心法 | zq, mbyj, wdww, jdz, mds | 木系心法 | qlj, tkj, dzj, lybj, mmw |
| 白龙 | 千刀万刃 | xlc, yyb, pkz, tlj, lysh | 龙魂的夜宴 | lxj, lxuanj, xkjz, jrjl, mlsz |

`Config.allSklName` 按 `[roleid*2-2]`（心法 1）和 `[roleid*2-1]`（心法 2）索引。

### 心法升级

`upGradeSkillFunc()` 升级当前心法级别 `isstudyskill[whichxf-1].xflevel`（0-5）：

| 目标 xflevel | 灵魂消耗 |
| --- | --- |
| 1 | 100 |
| 2 | 200 |
| 3 | 500 |
| 4 | 1000 |
| 5 | 2000 |

每升一级解锁一个技能槽。`xflevel >= 5` 时升级按钮隐藏。

### 学习技能

`buy()` 方法（点击技能图标）：

1. 检查 `howMuchSkillHasYouStudy() < getSkillLimt()`（默认上限 10）
2. 在 `isstudyskill[whichxf-1].skillName` 追加 `"skillName~1|"`
3. 调用 `findWhichSkillBtnNoneSet()` 找空槽
4. 有空槽：追加 `{skillName, keys: keyString, needLh, slev: 1}` 到 `skillbykey`
5. 无空槽：追加 `{skillName, keys: "Not", needLh, slev: 1}`，不绑定到任何键

空槽顺序：
- P1：`Y → U → I → O → L`
- P2：`8 → 4 → 5 → 6 → 3`

`findWhichSkillBtnNoneSet()` 从空槽数组中移除 `skillbykey` 前 5 个已占用的键，返回第一个剩余键。

### `isstudyskill` 数据结构

初始值：
```as3
isstudyskill = [
  { xflevel: 0, skillName: "" },
  { xflevel: 0, skillName: "" }
]
```

学习 `sgq`（1 级）和 `myhc`（3 级）后的示例：
```as3
isstudyskill = [
  { xflevel: 3, skillName: "sgq~1|myhc~3|" },
  { xflevel: 0, skillName: "" }
]
```

`skillName` 字段用 `~` 分隔技能名和等级，用 `|` 分隔不同技能。`getSkillStringBySkillName()` 解析该字符串并返回 `[skillName, level]`。

### 技能上限

`getSkillLimt()` 返回 `skillLimit1 + skillLimit2`，初始化为 `setSkillLimit(10)`。存档持久化但加载时强制 `setSkillLimit(10)`（见 `setSaveObj()` 第 711 行），所以玩家实际技能上限恒为 10。

---

## 4. 技能升级

### 入口

`skillupgradeFunc()`（点击心法树中已学技能旁的升级按钮）：

### 等级上限与角色等级限制

| 技能类别 | 技能代号 | 等级上限 | 角色等级要求 |
| --- | --- | --- | --- |
| 特殊 | `sx`, `rj`, `yyb`, `tjgl`, `myhc`, `sd` | 9 | `curLevel / 10 >= currentSkillLevel` |
| 普通 | 所有其他技能 | 18 | `curLevel / 5 >= currentSkillLevel` |
| 例外 | `lybj` | 固定提示"技能等级已达上限" | 不可升级 |

### 灵魂消耗公式

特殊技能（上限 9）：
```text
cost = ceil(200 * 2560^(((currentLevel - 1) / 7)^0.8))
```

普通技能（上限 18）：
```text
cost = ceil(200 * 2560^(((currentLevel - 1) / 16)^0.8))
```

### 升级流程

1. 计算消耗
2. 检查灵魂是否足够、等级是否满足、是否已达上限
3. 同时更新两处：`skillbykey` 中该技能的 `slev` 字段 + `isstudyskill` 中该技能的等级字符串
4. 扣除灵魂并刷新显示

注意 `skillupgradeFunc` 通过 `returnSkillIsInTheSkillAry(skillName)` 找到 `skillbykey` 中的对象直接修改其 `slev`；同时调用 `setSkillLevelInTheAllSkillAry()` 更新 `isstudyskill` 中的 `skillName` 字符串。

### 升级预览

鼠标悬停升级按钮时，通过 `SayInfo` 浮动提示显示"升级需要 X 灵魂"。

---

## 5. 拖拽绑定 UI

### 入口

`skillsetFunc()`（点击心法树中已学技能旁的设置按钮）→ 创建 `SkillSetControl` 实例。

### UI 结构

固定显示五个槽框：`Ymc`, `Umc`, `Imc`, `Omc`, `Lmc`。

P1 时各框显示帧 1（P1 键标），P2 时各框显示帧 2（P2 键标）。但无论 P1/P2，物理位置都使用 Y/U/I/O/L 框。

### 已绑定技能显示

`initHadStudySkill()` 遍历 `skillbykey` 前 5 个对象：
- 取 `skillicon_{skillName}` 图标放在对应键框上
- P2 键值（8→Y, 4→U, 5→I, 6→O, 3→L）先映射到 P1 显示键再定位
- 图标上叠加 `Skill_{keys}` 键标图

### 拖拽交互

1. `mousedown` → 开始拖拽，记录原始位置 `(ox, oy)`
2. `mouseup` → 停止拖拽，hitTest 五个槽框
3. 命中 Y/U/I/O/L 某框时：
   - 设置 `newObj.keys`：P1 用显示键（Y/U/I/O/L），P2 映射为实际键（8/4/5/6/3）
   - 查找旧绑定 `returnSkillObjBySkillKey(key)` 并存为 `oldObj`
   - 更新技能图标上的键标显示（`Skill_{keys}` 图）
4. 未命中任何框 → 回到原位

### 落槽映射

| UI 框 | P1 绑定值 | P2 绑定值 |
| --- | --- | --- |
| `Ymc` | `Y` | `8` |
| `Umc` | `U` | `4` |
| `Imc` | `I` | `5` |
| `Omc` | `O` | `6` |
| `Lmc` | `L` | `3` |

### 提交绑定

`back()` 关闭时：
1. 如果 `newObj.keys` 已设置（拖到了有效槽位）：
   - 移除旧键位的初始化图标
   - 调用 `replaceSkillButton(newObj, oldObj)`
2. `replaceSkillButton`：
   - 如果 `oldObj != null`：将其旧等级写回 `isstudyskill`，把 `oldObj` 移到 `skillbykey` 末尾（`push(splice(index,1))`）
   - `skillbykey.unshift(newObj)`：新绑定置顶

这意味着同一技能如果被拖到已有技能的槽位，被替换的技能会移到数组末尾（不在前 5 个中），但仍保留在 `skillbykey` 中。一个技能名可以在 `skillbykey` 中出现多次（不同键位的历史记录），但 `returnSkillNameBySkillKey()` 只扫描前 5 个。

---

## 6. 被动技能

`PassiveSkillControl` 管理 5 个被动技能槽（`pskill1` 至 `pskill5`）。每个槽调用 `setRole(player)` 初始化。

`User.ispassiveskill` 初始化为 `[0, 0, 0, 0, 0]`。加载存档时：
- 每个被动技能等级上限为 `floor(curLevel / 5)`
- 超出上限的等级会被削减，差额返还灵魂（每级返 `(reducedLevel + 1) * 5000` 灵魂）

被动技能不与 `skillbykey` 或 `isstudyskill` 直接关联。

---

## 7. 存档持久化

### 存档文件

文件路径：`gameData/{0-5}.sav`，共 6 个存档位（`btn_0` 到 `btn_5`）。

文件格式：AMF 序列化 → 随机 1-6 次 `compress()` → XOR 加密（`Config.encrypt`）。

### `User.getSaveObj()` 字段

每个玩家对象的存档字段：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `controlPlayer` | int | 控制位 0/1 |
| `lhValue` | uint | 灵魂值 |
| `myscore` | uint | 分数 |
| `curExp` | uint | 当前经验 |
| `curLevel` | uint | 等级（1-75） |
| `skillLimit` | int | 技能槽上限（恒为 10） |
| `roleid` | uint | 角色 ID 1-5 |
| `isstudyskill` | Array | `[{xflevel, skillName}, ...]` 共 2 个心法树 |
| `skillbykey` | Array | `[{skillName, keys, needLh, slev}, ...]` |
| `immortalitylist` | Array | 修仙加成 `[hp, mp, crit, cHp, cMp]` 各 5 级 |
| `ispassiveskill` | Array | 5 个被动技能等级 |
| `allTask` | - | 所有任务状态（由 `AllTask.saveAllTask()` 产出） |
| `actTask` | - | 当前活跃任务（由 `AllTask.saveActionTask()` 产出） |
| `saveDate` | String | 存档日期 `YYYY-M-D` |
| `petSave` | String | 宠物存档字符串 `}` 分隔 |
| `luckdata` | int | 幸运值（1-20，与等级相关） |
| `bagSaveString` | String | 背包装备序列化 `}` 分隔 |
| `curSaveString` | String | 当前穿戴装备序列化 |
| `bagdjSaveString` | String | 道具序列化 |
| `bagszSaveString` | String | 时装序列化 |
| `bagjnsSaveString` | String | 技能书序列化 |
| `isshowfashion` | Boolean | 是否显示时装 |
| `username` | String | 角色名 |
| `istest` | Boolean | 测试标记 |
| `gameversion` | - | `AllConsts.GAME_CONFIG_VERSION` |

### `MemoryClass.setStorage()` 顶层字段

| 字段 | 说明 |
| --- | --- |
| `luserid` | 本地用户 ID |
| `playerNum` | 玩家数量 |
| `player1_obj` | 玩家 1 的 `User.getSaveObj()` |
| `player2_obj` | 玩家 2 的 `User.getSaveObj()` |
| `hasget`, `hasgetslsorry`, `hasgetsorry` | 领取标记 |
| `gm`, `specialUI`, `whichlastworld` | 游戏进度标记 |
| `canplayturntable`, `turntableScore` | 转盘相关 |
| `curBigStage`, `curBigLevel` | 当前大地图位置 |
| `nymark`, `hdInfo`, `qhsInfo` | 活动/任务标记 |
| `hpUpBuffCount` | HP buff 计数 |
| `isZx`, `isFirst`, `version` | 初始化标记（强制 `isZx=false`, `isFirst=false`, `version=1`） |

### 技能相关存档字段清单

现代版技能系统至少需要持久化以下字段：

1. **`skillbykey` 等价数据**：`skillSlots[0..4] = { skillName, level } | null`（5 槽固定，不含历史对象）
2. **`isstudyskill` 等价数据**：`skillTrees[0..1] = { treeLevel, learnedSkills: Map<skillName, level> }`
3. **`ispassiveskill` 等价数据**：`passiveSkills[0..4] = level`
4. **`skillLimit`**：技能学习上限（恒为 10，可硬编码）
5. **`lhValue`（灵魂值）**：学习/升级技能消耗
6. **`curLevel`**：角色等级（限制技能升级条件）
7. **`roleid`**：角色 ID（决定心法树和可用技能）

---

## 8. UI 快捷键边界

`KeyBoardControl` 的 UI 快捷键派发 `RoleInfo` 面板按钮的 click：

| 功能 | P1 | P1 keyCode | P2 | P2 keyCode | 目标按钮 | 行为 |
| --- | --- | --- | --- | --- | --- | --- |
| 背包 | C | 67 | 小键盘 / | 111 | `btn_bb` | 打开 `BackPack`，暂停游戏 |
| 技能/学习 | V | 86 | 小键盘 * | 106 | `btn_study` | 派发 `showBuySkill` 打开 `BuySkill` |
| 宠物 | B | 66 | 小键盘 - | 109 | `btn_cw` | 打开 `PetInterface`，暂停游戏 |
| 副本/法宝 | N | 78 | 无 | - | `btn_fb` | 检查法宝装备后打开 `SutraInterface` |
| 设置 | Esc | 27 | 无 | - | `btn_set` | 打开 `SetMenu`，暂停游戏 |

P1 快捷键数组：`[67, 86, 66, 78, 27]`（C, V, B, N, Esc）
P2 快捷键数组：`[111, 106, 109]`（小键盘 /, *, -）

只有 `gameInfo` 存在时快捷键才生效。P2 没有副本和设置快捷键。

### 战斗输入屏蔽

- 打开 `BuySkill` 时如果 `state == "gameing"`，调用 `MainGame.stopGame()` 暂停游戏循环
- 关闭 `BuySkill`（`back()`）时如果 `state == "gameing"`，派发 `InGameBuySkillOver` 事件，调用 `MainGame.continueGame()`
- `KeyBoardControl.__keyBoardDown()` 中的 `isStop` 检查会阻止技能键输入
- `gc.stage.focus != gc.stage` 时战斗输入也被屏蔽
- 关闭后 `RoleInfo.refreshShowSkill()` 刷新技能图标

这些快捷键不是技能释放输入。现代实现技能系统时不需要先实现完整 `GameInfo`/`RoleInfo` UI，但不能占用这些键作为战斗技能键。

---

## 9. MP 消耗与冷却模型

原版没有统一的"技能冷却 CD"模型。实际限制主要来自：

- 绑定解析：没有绑定到当前键就不释放。
- MP 门禁：每个 `skill_*()` 开头检查 `roleProperies.getMMP() < needMp`。
- 动作门禁：大多数技能检查 `isAttacking()` 或 `isBeAttacking()`，正在攻击/受击时不允许释放。
- 动作时长：进入 `hit*` 后，`isAttacking()` 返回真，相当于用动作持续时间阻止重入。
- 二段技能例外：少数技能允许在指定动作内再次按同一技能键转入二段（如 `Role2.smb: hit4_1 → hit4_2`）。
- projectile 命中间隔：`attackBackInfoDict[action].attackInterval` 控制同一 projectile 持续命中周期，不是释放冷却。

### `consumeMP` 基础数组

五个角色共享同一基础数组：
```text
[66, 160, 208, 276, 364, 493, 703, 759, 801, 921, 1085, 1133, 1318, 1771, 1884, 1954, 2320, 2667]
```
索引 `levelIndex = skillLevel - 1`。

### 各角色 MP 系数

| 角色 | 额外系数 |
| --- | --- |
| Role1 悟空 | 无（直接乘技能系数） |
| Role2 唐僧 | `* 35173 / 25958` |
| Role3 八戒 | `* 22998 / 25958` |
| Role4 沙僧 | `* 26483 / 25958` |
| Role5 白龙 | 无（直接乘技能系数） |

现代实现下一步不应发明统一 CD UI。首批只需要：
- 每次请求技能时检查绑定、MP、受击状态、当前动作允许性。
- 释放成功后扣 MP、进入动作、生成新的攻击实例。
- 对二段技能写显式 `canReenterFromAction` 或等价规则。

---

## 10. Role2 正式技能输入

### `sgq → hit5`

正式触发链：

```text
P1 Y/L/U/I/O 或 P2 8/3/4/5/6
→ KeyBoardControl.player*SkillArray.indexOf(keyCode)
→ BaseHero.sendSkill(index)
→ showSkill("Y"/"L"/"U"/"I"/"O" 或 "8"/"3"/"4"/"5"/"6")
→ User.returnSkillNameBySkillKey(key)
→ Role2.showSkill() 解析为 "sgq"
→ Role2.skill_sgq(needMp)
```

`Role2.showSkill()` 中 `sgq` 的 MP 公式：
```text
consumeMP[levelIndex] * 0.55 * 35173 / 25958
```
`consumeMP[0] = 66`，1 级 `sgq` 约为 `49.18`，传入 `skill_sgq(param1:uint)` 后按 uint 使用。

### `smb → hit4_1/hit4_2`

`smb` 的 MP 公式：
```text
consumeMP[levelIndex] * 1.2 * 35173 / 25958
```
1 级约为 `107.31`。

关键边界：
- 第一段地面/站立限定（需要 `standInObj` 不为 null）
- 第一段成功释放扣完整 MP
- 当前动作为 `hit4_1` 且第一段 projectile（运行时名 `Role1Bullet4_1`）仍存在时，再次按同一绑定键可转入 `hit4_2`
- 第二段不再次扣 MP，不重新创建第一段 projectile

---

## 11. 现代数据模型建议

以下是最小现代数据模型，足够支撑完整技能学习、绑定、升级和存档闭环：

```ts
// 技能槽 loadout（固定 5 槽，持久化到存档）
type SkillSlot = {
  skillName: string;   // e.g. "sgq", "smb"
  level: number;       // 1-18 (or 1-9 for special skills)
} | null;

type HeroSkillLoadout = {
  slots: [SkillSlot, SkillSlot, SkillSlot, SkillSlot, SkillSlot];
};

// 心法树（持久化到存档）
type SkillTreeEntry = {
  skillName: string;
  level: number;
};

type SkillTree = {
  treeLevel: number;  // 0-5, 每升一级解锁一个技能槽
  learnedSkills: SkillTreeEntry[];  // 已学技能列表
};

// 被动技能（持久化到存档）
type PassiveSkills = [number, number, number, number, number]; // 0-5 各等级

// 技能学习消耗配置
const TREE_UPGRADE_COSTS = [100, 200, 500, 1000, 2000]; // 灵魂

// 技能升级消耗
function getSkillUpgradeCost(currentLevel: number, isSpecial: boolean): number {
  const base = isSpecial ? 7 : 16;
  return Math.ceil(200 * Math.pow(2560, Math.pow((currentLevel - 1) / base, 0.8)));
}

// 技能等级上限
function getSkillMaxLevel(skillName: string): number {
  const SPECIAL_SKILLS = ["sx", "rj", "yyb", "tjgl", "myhc", "sd", "lybj"];
  return SPECIAL_SKILLS.includes(skillName) ? 9 : 18;
}

// 等级条件
function canUpgradeSkill(skillName: string, currentLevel: number, heroLevel: number): boolean {
  const SPECIAL_SKILLS = ["sx", "rj", "yyb", "tjgl", "myhc", "sd"];
  if (SPECIAL_SKILLS.includes(skillName)) {
    return Math.floor(heroLevel / 10) >= currentLevel;
  }
  return Math.floor(heroLevel / 5) >= currentLevel;
}
```

### 核心数据流

```
学习: BuySkill → SkillControl.buy()
  → isstudyskill[tree].skillName += "skillName~1|"
  → skillbykey.push({skillName, keys: firstEmptyKey, needLh, slev:1})

升级: SkillControl.skillupgradeFunc()
  → skillbykey[found].slev++
  → isstudyskill[tree].skillName 中对应技能等级字符串更新

绑定: SkillSetControl.back()
  → skillbykey.unshift({skillName, keys: newKey, needLh, slev})
  → 旧绑定对象移到数组末尾

释放: KeyBoardControl → sendSkill(index) → showSkill(key)
  → returnSkillNameBySkillKey(key) 扫描前5个绑定
  → 角色 showSkill() 解析技能名、计算MP、调用对应 skill_*()
```

### 关键边界

- 技能学习上限恒为 10（`skillLimit` 加载时强制重设为 10）
- 空槽 P1 顺序 Y→U→I→O→L，P2 顺序 8→4→5→6→3
- `skillbykey` 用 `unshift` 置顶新绑定 ≠ `sendSkill` 按固定槽位顺序（0=Y/8, 1=L/3, 2=U/4, 3=I/5, 4=O/6）
- 心法树编号 `whichxf` 决定 `allSklName` 索引：心法 1 用 `[roleid*2-2]`，心法 2 用 `[roleid*2-1]`
- `needLh` 来自 `Config.needMMP` 表，是学习树 UI 显示消耗，不是战斗 MP 消耗
- 同一技能名可在 `skillbykey` 中出现多次（历史绑定），但只有前 5 个参与解析
- `returnSkillNameBySkillKey()` 第四项传 key 而非 skillName，通常回退为 1 — 现代实现不要照搬

---

## 12. 未决问题

- `Role2Bullet5` 等真素材仍缺失于当前导出，属于后续资源任务范围。
- `sjt` 对 `hit5NeedCount` 的联动仍只记录入口，不全量复现。
- 被动技能具体效果（`pskill1` 至 `pskill5` 实际加成）不在本文范围，属于被动技能专题。
- `showSkillKongGe()` 和 `showSkillFaBao()` 的具体动作内容不在本文范围。
- `Config.needMMP` 表的具体数值含义（是 soul 还是其他资源）需在实际实现时交叉验证。

# 角色设定索引

本文记录五个可选角色的第一轮逆向结果。当前版本完成 `TASK-SETTINGS-002A/002B/002C` 范围：角色身份、创建入口、资源/动画前缀线索、输入入口、组合键骨架、`normalHit()` 普攻连段和 `showSkill()` 技能分发。伤害帧、子弹生命周期和完整碰撞窗口留给战斗/子弹任务继续补。

## 证据入口

- `local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts/export/SelectRole.as`
- `local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts/config/Config.as`
- `local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts/user/User.as`
- `local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts/base/BaseHero.as`
- `local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts/my/KeyBoardControl.as`
- `local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts/export/hero/Role1.as` 至 `Role5.as`

## 角色列表

| roleid | AS3 类 | 显示名/身份 | 构造入口 | 资源/动画前缀线索 | 输入入口 |
| --- | --- | --- | --- | --- | --- |
| 1 | `export.hero.Role1` | 孙悟空；类内 `roleName/userType = "悟空"` | `Config.createHero()` 按 `roleid` 创建 | `ROLE1_<clothId>`、`ROLE1_EQUIP_<weaponId>` | 覆写 `myKeyDown(keyStr)`；普攻入口 `normalHit()`；技能入口 `showSkill(key)` |
| 2 | `export.hero.Role2` | 唐僧 | `Config.createHero()` 按 `roleid` 创建 | `ROLE2_<clothId>`、`ROLE2_EQUIP_<weaponId>` | 覆写 `myKeyDown(keyStr)`；普攻入口 `normalHit()`；技能入口 `showSkill(key)` |
| 3 | `export.hero.Role3` | 八戒 | `Config.createHero()` 按 `roleid` 创建 | `ROLE3_<clothId>`、`ROLE3_EQUIP_<weaponId>` | 覆写 `myKeyDown(keyStr)`；普攻入口 `normalHit()`；技能入口 `showSkill(key)` |
| 4 | `export.hero.Role4` | 沙僧 | `Config.createHero()` 按 `roleid` 创建 | 铲形武器：`ROLE4_SHOVEL_<clothId>`；弓/箭形武器：`ROLE4_ARROW_<clothId>`；装备：`ROLE4_EQUIP_<weaponId>` | 覆写 `myKeyDown(keyStr)`；普攻入口 `normalHit()`；技能入口 `showSkill(key)` |
| 5 | `export.hero.Role5` | 白龙 | P1 在 `Config.createHero()` 中显式 `new Role5()`；P2 路径使用 `AUtils.getNewObj("export.hero.Role" + roleid)` | ZM4 分片资源，含 `idle_spear`、`idle_sword`、`walk_*`、`run_*`、`attack*_spear/sword` 等；区分枪/剑形态 | 覆写 `myKeyDown(keyStr)`；普攻入口 `normalHit()`；技能入口 `showSkill(key)` |

补充：

- `SelectRole.onClick()` 从按钮名 `btn1` 到 `btn5` 取第 4 个字符作为 `roleid`。
- `User.getRoleName()` 给出完整显示名：1 孙悟空、2 唐僧、3 八戒、4 沙僧、5 白龙。
- `Config.createHero()` 创建角色后会 `setPlayer()`，加入 `pWorld.heroArray`，并分别交给 `keyboardControl.setRole1/2()` 和 `vControllor.setRole1/2()`。
- `Role5` 的 P1 创建路径和其他角色不同；后续若复现双人白龙，需要确认 `AUtils.getNewObj("export.hero.Role5")` 是否稳定可用。

## 来源差异与解读原则

用户补充的作品背景：

- `Role1` 至 `Role4` 属于原游戏本体角色。
- `Role5` 白龙来自后续同人作者扩展，而不是与前四名角色同一批原始开发。

这会影响后续如何阅读源码，但不直接改变要复现的可观察行为：

- `Role1` 至 `Role4` 与 `Role5` 的编程模型、资源组织和局部命名不同，本来就有来源原因；遇到这种差异时，不把“为何不统一”当成必须追平的逆向缺口。
- 现代重写只需要保留玩家能观察到的行为，不需要为了复刻原作内部来源差异而同时继承两套坏结构。
- 后续若要选一个源码模型作参考，可以有意识地选 `Role1` 至 `Role4` 的共同模式，或选 `Role5` 的后发模式；在决定前，先把两者当成“可比较的设计样本”，不要默认其中一边自动更正统。

## 输入流

键盘输入先进入 `KeyBoardControl.__keyBoardDown()`：

- P1 基础键：`[S, J, K, W]`，左右键为 `A/D`。
- P2 基础键：`[↓, 小键盘1, 小键盘2, ↑]`，左右键为 `←/→`。
- `KeyBoardControl.setRole1/2()` 根据 `User.controlPlayer` 给角色设置 `keyList`。

角色侧在 `BaseHero.__keyBoardDown()` 中：

- 左右方向键不写入 `keyarray`，而是直接 `moveLeft()/moveRight()` 并记录双击跑步。
- 显示动作上，`walk` 与 `run` 是两个独立状态：`Role1` 至 `Role4` 在位图表中使用不同帧行，`Role5` 使用独立的 `walk_*` 与 `run_*` 资源；后续上 CG 时不能只用同一套移动动画改速度。
- `keyList` 中的四个键写入 `keyarray`。
- `BaseHero.executeKeyCode()` 调用 `myKeyDown(this.keyarray.join(""))`。

`keyarray` 四位含义来自 `controls-index.md`：

```text
keyarray[0] = 下/落下
keyarray[1] = 普攻
keyarray[2] = 跳跃
keyarray[3] = 上/进门/交互
```

技能输入不走 `myKeyDown()`，而是 `KeyBoardControl` 识别技能键后调用 `BaseHero.sendSkill(index)`，再映射到 `showSkill(key)`：

- P1 技能显示键：`Y/L/U/I/O`，无双/特殊为 Space，法宝为 H。
- P2 技能显示键：`8/3/4/5/6`，无双/特殊为小键盘 0，法宝为小键盘 7。
- `User.returnSkillNameBySkillKey(key)` 从 `skillbykey` 里解析具体技能名和等级。
- 证据入口：`KeyBoardControl.as:170/201` 调用 `sendSkill(index)`；`BaseHero.as:995` 把 index `0..4` 映射到 P1/P2 的技能键字符串，index `5` 调 `showSkillKongGe()`，index `6` 调 `showSkillFaBao()`。

## 组合键骨架

以下只记录触发入口和条件，不展开技能效果、伤害、帧数据。

| keyStr | 含义 | 角色表现 |
| --- | --- | --- |
| `0100` | 普攻 | 五个角色均在未攻击/未受击时调用 `normalHit()` |
| `1100` | 下 + 普攻 | 五个角色均按普攻处理，调用 `normalHit()` |
| `0010` | 跳跃 | 五个角色均调用 `jump()`；白龙允许在 `hit29` 特例中跳跃 |
| `1010` | 下 + 跳跃 | 五个角色均调用 `getFallDown()` |
| `0110` | 普攻 + 跳跃 | 五个角色均吞掉本次输入，不触发新动作 |
| `0001` | 上/进门/交互/通关 | 五个角色均先检查 `checkTransferDoor()`，再调用关卡监听 `keyBoardDownForW(this)`；满足通关条件时触发 `LevelVictor`/`levelClear()` |
| `0101` | 普攻 + 上 | Role1、Role3、Role5 有特化；Role2、Role4 未见该分支 |

角色特化的 `0101`：

- `Role1`：若已学习 `slz` 且 MP 足够，调用 `skill_slz(needMp)`；否则回退到 `normalHit()`。`0001` 还会在已学习 `lys` 时设置 `tk = true`，具体作用待门/关卡交互任务继续核对。
- `Role3`：要求 `getPlayer().isstudyskill[3] == 1`，MP 至少 20 时设置 `hit8`，否则回退到 `normalHit()`。
- `Role5`：若已拥有 `yyb` 且 MP 足够，会切换 `_invert` 并调用 `skill_yyb(needMp)`。

## 普攻连段索引

证据入口：`Role1.as:2348`、`Role2.as:1845`、`Role3.as:1640`、`Role4.as:2651`、`Role5.as:4605`。五个角色的常规普攻触发键一致：

- `keyStr == "0100"`：普攻。
- `keyStr == "1100"`：下 + 普攻，仍按普攻处理。
- 触发前均先判断正在攻击或正在受击时直接返回；真正的连段选择在各自 `normalHit()` 中完成。

| 角色 | 地面普攻 | 空中普攻 | 跑动普攻 | 连段窗口/冷却 | 第一切片候选 |
| --- | --- | --- | --- | --- | --- |
| Role1 悟空 | `hit1` 至 `hit5` 五段循环，`lastHit` 跟随动作名 | `hit3` | 跑动时优先尝试 `hytj`，未学或 MP 不足则退回 `hit1` | 超过 `25 * 60` ms 重置到第一段；每段 `timers = 9` | 不建议首选，跑动普攻会牵出技能分支 |
| Role2 唐僧 | 固定 `hit1`，无 `hitNum` 连段 | 无空中分支特化；空中触发也走 `hit1` | `runAttack()` 只是清空 `doubleCount` 后调用 `normalHit()` | `normalHit()` 内未设置 `timers`，靠攻击状态阻止重入 | 最简单候选：`Role2 hit1` |
| Role3 八戒 | 三段循环，但动作顺序是第一段 `hit2`、第二段 `hit1`、第三段 `hit3` | `hit1` | 跑动时清空 `doubleCount` 后递归回普攻 | 超过 `25 * 60` ms 重置到第一段；地面 `timers = 13`，空中 `timers = 15` | 近战候选：地面第一段 `hit2` |
| Role4 沙僧 | `hit1` 至 `hit3` 三段循环，铲/弓共用动作名但音效不同 | 非弓/铲形态用 `hit2`；弓形态用 `hit3` | MP 至少 20 时进入 `hit6` 并扣 20 MP，否则退回普攻 | 超过 `25 * 60` ms 重置到第一段；地面 `timers = 10`，空中 `timers = 15` | 不建议首选，武器形态影响资源和表现 |
| Role5 白龙 | 枪形态 `hit1` 至 `hit4`；剑形态 `hit18` 至 `hit21` | 枪形态 `hit5`；剑形态 `hit22` | 枪形态 `hit114`；剑形态 `hit114_1` | 超过 `1200` ms 重置到第一段；`timers` 均设为 0；每次普攻后调用 `addRole5Energy()` | 不建议首选，形态、能量和标记瞬移耦合较多 |

当前第一攻击动作建议：

- 若只为验证输入到攻击状态的最小闭环，首选 `Role2 hit1`。它的 `normalHit()` 只有攻击/受击门禁、`setAction("hit1")`、`lastHit = "hit1"`、`hitNum = 0` 和 `newAttackId()`。
- 若需要更像横版近战的第一段身体攻击，备选 `Role3` 地面第一段，即 `hitNum == 1` 时实际播放的 `hit2`。
- 暂不选 `Role1/Role4/Role5` 作为第一个普攻切片：悟空跑动普攻连技能，沙僧受武器形态影响，白龙同时牵涉枪/剑形态、能量和标记目标瞬移。
- 用户补充决策：现代实现时五个角色的普攻不拆成五个独立任务，应该作为一个 `VS-004` 子任务一起完成，并且每个角色普攻都必须有可见特效。`attack-effects-index.md` 已补齐普攻特效映射、缺资源清单和占位策略；真实资源接入仍要等后续资源索引继续补。

## 普攻特效补充索引

详见 `docs/reverse-engineering/attack-effects-index.md`：

- `Role1` 至 `Role4` 的普攻都不是单纯身体动画，都会在命中帧额外创建 bullet/effect 对象。
- `Role4` 的铲形态和弓形态虽然共用 `hit1/hit2/hit3` 动作名，但普攻附属对象不同，后续实现不能合并资源 key。
- `Role5` 的普攻既依赖独立 ZM4 本体动作资源，也会补附属对象；剑形态映射完整，枪形态 `doSingleHit(...)` 在当前反编译稿中仍缺 helper 定义。
- 当前 `[172845].swf` 的 `symbols.csv` 与 `images/` 导出结果没有给出这些普攻资源，现代实现需要先按文档 key 做占位，再由资源任务补真素材。

## 技能槽与技能效果索引

正式技能槽、技能绑定、MP 门禁和 `Role2.sgq`/`Role2.smb` 的重入边界已在 `docs/reverse-engineering/skills-input-index.md` 细化。本文保留角色技能效果总览；实现正式输入时以 `skills-input-index.md` 的槽位和门禁为准。

证据入口：`User.as:1031`、`Config.as:289/1086`、`Role1.as:2226`、`Role2.as:1560`、`Role3.as:1324`、`Role4.as:2325`、`Role5.as:4427`。

通用规则：

- `User.skillbykey` 保存已绑定技能对象，核心字段是 `{ skillName, keys, needLh, slev }`。
- `User.returnSkillNameBySkillKey(key)` 只扫描前 5 个技能绑定，按 `keys` 匹配 `Y/L/U/I/O` 或 `8/3/4/5/6`，返回 `[skillName, needLh, undefined, studiedLevel]`。
- `showSkill(key)` 忽略返回值里的 `needLh` 作为消耗依据，重新用角色内的 `consumeMP[level - 1]` 和技能系数计算 MP；`consumeMP` 基础数组五个角色相同，为 `[66,160,208,276,364,493,703,759,801,921,1085,1133,1318,1771,1884,1954,2320,2667]`。
- 原版没有统一技能 CD；多数技能靠 `isAttacking()`/`isBeAttacking()` 和动作持续时间阻止重入。二段技能是显式例外，例如 `Role2.smb` 允许在 `hit4_1` 中再次按同一绑定键进入 `hit4_2`。
- `Config.allSklName` 每个角色两行、每行 5 个技能代号，正好对应角色学习树。部分学习树技能没有 `showSkill()` 分支或函数为空，说明它们不是当前可直接释放的动作，或逻辑缺失/被动化。
- 大多数技能入口都先检查 MP、正在攻击、正在受击；通过后设置 `hit*` 动作、`lastHit`、`hitNum = 0`，需要攻击判定的技能会调用 `newAttackId()`。
- 若角色处于 `MONSTER65_AOE` 或 `MONSTER129Buff` debuff，`showSkill()` 末尾会按本次技能消耗量扣自身 HP。

### 技能分发表

| 角色 | 技能代号 | MP 公式 | 入口动作/效果摘要 | 备注 |
| --- | --- | --- | --- | --- |
| Role1 | `slz` | `consumeMP[level-1] * 0.55` | `hit6`，`timers = 15` | 也可由 `0101` 触发 |
| Role1 | `zz` | `* 0.75` | `hit14`，`timers = 20` | 直接攻击动作 |
| Role1 | `qsez` | `* 0.6` | `hit13`，`timers = 20` | 直接攻击动作 |
| Role1 | `hmz` | `* 1.0` | `hit10`，`timers = 30` | 有额外伤害数组和蓄力相关字段 |
| Role1 | `lys` | `* 0.45` | `hit9` | `0001` 会设置 `tk = true`，效果待门/跳跃交互任务核对 |
| Role1 | `hytj` | `* 0.6` | `hit7` | 跑动普攻也会尝试触发 |
| Role1 | `lyfb` | `* 0.65` | `hit8` | 直接攻击动作 |
| Role1 | `jdy` | `* 1.0` | 首次 `hit11_1`，再次可转 `hit11_2` | 二段式 |
| Role1 | `hyjj` | `* 1.1` | `hit12`，`timers = 17` | 地面限定 |
| Role2 | `sgq` | `* 0.55 * 35173 / 25958` | `hit5` | Role2 首个技能候选 |
| Role2 | `myhc` | `* 1.2 * 35173 / 25958` | `hit6`，半径 100 群体持续回血 | 9 级上限的支援技，不造成直接伤害 |
| Role2 | `jgz` | `* 0.6 * 35173 / 25958` | `hit7`，拉拽/浮空半径 240 内目标 | 位移控制，伤害倍率分支本身只返回等级值 |
| Role2 | `tjgl` | `* 1.0 * 35173 / 25958` | `hit8`，半径 150 治疗玩家/宠物并给自身 7 秒盾 | 9 级上限的支援技 |
| Role2 | `jhsj` | `* 1.1 * 35173 / 25958` | `hit9`，在第 45/55 帧生成两类多段特效 | 分身存在时同步生成 0.35 倍变体 |
| Role2 | `xbz` | `* 0.65 * 35173 / 25958` | `hit3`，自身位置固定范围魔法 | 角色静止、失重，分身存在时同步 0.35 倍变体 |
| Role2 | `shy` | `* 0.55 * 35173 / 25958` | `doHit10()` 创建/召回 `Role2Shadow` | 首按创建 8 秒分身，第二次传送到分身并销毁；只有创建成功时扣 MP |
| Role2 | `smb` | `* 1.2 * 35173 / 25958` | `hit4_1`，再次可转 `hit4_2` | 二段式，依赖站立对象/弹体点 |
| Role3 | `dj` | `* 0.6 * 22998 / 25958` | `hit4` | Role3 首个技能候选 |
| Role3 | `sd` | `* 0.5 * 22998 / 25958` | `hit5` | 直接攻击动作 |
| Role3 | `zznh` | `* 0.4 * 22998 / 25958` | `hit6` | 直接攻击动作 |
| Role3 | `syzq` | `* 1.0 * 22998 / 25958` | `hit7` | 直接攻击动作 |
| Role3 | `ssp` | `* 0.55 * 22998 / 25958` | `hit8` | 地面限定 |
| Role3 | `jsp` | `* 0.65 * 22998 / 25958` | `hit9` | 有概率附加眩晕配置 |
| Role3 | `dgq` | `* 0.4 * 22998 / 25958` | `hit10` | 直接攻击动作 |
| Role3 | `xgq` | `* 0.7 * 22998 / 25958` | `hit11` | 直接攻击动作 |
| Role3 | `tmc` | `* 1.2 * 22998 / 25958` | `hit12`，可转 `hit12_2` | 二段式 |
| Role4 | `zq` | `* 0.5 * 26483 / 25958` | `hit4` | Role4 首个技能候选 |
| Role4 | `mbyj` | `* 0.286 * 26483 / 25958` | `hit6` | 直接攻击动作 |
| Role4 | `wdww` | `* 0.55 * 26483 / 25958` | `hit5` | 直接攻击动作 |
| Role4 | `jdz` | `* 0.82 * 26483 / 25958` | `hit7` | 地面限定 |
| Role4 | `qlj` | `* 0.55 * 26483 / 25958` | `hit8` | 额外先扣 15 MP，再扣技能消耗 |
| Role4 | `tkj` | `* 0.55 * 26483 / 25958` | `hit9` | 直接攻击动作 |
| Role4 | `dzj` | `* 0.82 * 26483 / 25958` | `skill_dcj()`，动作 `hit10` | 代码中函数名是 `skill_dcj` |
| Role4 | `lybj` | `SMMP * 0.015` | `hit11`，可转 `hit11_2` | 标记/二段式 |
| Role4 | `mmw` | 铲形 `* 0.64 * 26483 / 25958`；弓形 `* 1.1 * 26483 / 25958` | `hit12` | 受武器形态影响 |
| Role5 | `xlc` | `* 0.5` | `hit6`，`timers = 15` | Role5 最简单技能候选 |
| Role5 | `lxuanj` | `* 0.6` | `hit7`，`timers = 29` | 枪系弹体/特效较多 |
| Role5 | `xkjz` | `* 0.72` | `hit10`，`timers = 24` | 直接攻击动作 |
| Role5 | `yyb` | `* 0.55` | 添加 `ROLE5SKILL4` buff，动作 `hit9` | `0101` 也会触发 |
| Role5 | `tlj` | `* 0.72` | `hit11`，`timers = 9` | 直接攻击动作 |
| Role5 | `pkz` | 剑形 `* 0.62`；非剑形沿用返回的 `needLh` 值 | `hit24_1`，`timers = 15` | 剑形分支更明确 |
| Role5 | `lxj` | 剑形 `* 0.6`；非剑形沿用返回的 `needLh` 值 | `hit26`，`timers = 10` | 剑形分支更明确 |
| Role5 | `lysh` | 剑形 `* 1.1`；非剑形沿用返回的 `needLh` 值 | `hit27_1` 创建 `BLMSkill5`，可转射击/重建 | 依赖额外对象 |
| Role5 | `jrjl` | 剑形 `* 0.7`；非剑形沿用返回的 `needLh` 值 | `hit28`，`timers = 9` | `step()` 中会维护 `JRJL` 对象 |
| Role5 | `mlsz` | 剑形 `* 1.0`；非剑形沿用返回的 `needLh` 值 | `hit29`，`timers = 9` | 白龙 `hit29` 有跳跃特例 |

缺口/异常：

- `Role1` 学习树含 `sx`，但 `showSkill()` 未见对应分支。
- `Role2` 的 `blb` 函数为空，`sjt` 未见 `showSkill()` 分支。
- `Role3` 的 `rj` 未见 `showSkill()` 分支。
- `Role4` 的 `mds` 函数为空。
- `Role5` 有 `skill_xlj()`，但 `Config.allSklName` 与 `showSkill()` 都未见 `xlj` 技能代号；当前按未使用实现看待。

当前切片建议：

- 第一个实现角色：`Role2 唐僧`。理由是身份、输入、普攻和首个技能入口都最直，`normalHit()` 只有 `hit1`，`sgq` 只进入 `hit5` 并扣 MP。
- 第一个普攻动作：`Role2 hit1`。
- 第一个技能候选：`Role2 sgq -> hit5`。VS-003/VS-004/VS-006 已完成；技能切片 VS-008 由 `projectiles-index.md` 中的 `M-034 子弹/技能飞行物` 结论支撑。

## 角色实现线索

### Role1 悟空/孙悟空

- 构造中设置 `roleName = "悟空"`、`userType = "悟空"`、`horizenSpeed = 6`。
- 资源来自 `ROLE1_<clothId>` 和 `ROLE1_EQUIP_<weaponId>`。
- `myKeyDown()` 具备常规动作骨架，并为 `0101` 接入 `slz`。
- `normalHit()` 地面非跑动时循环 `hit1` 至 `hit5`，超出 1500 ms 重置到第一段；五段均设置 `timers = 9`、`lastHit = "hitN"`、`newAttackId()`。
- 空中普攻固定 `hit3`，`timers = 12`，并把 `hitNum` 清零。
- 跑动普攻会检查技能 `hytj` 和 MP，满足时调用 `skill_hytj()`；否则只设置 `hit1`。
- `showSkill()` 支持 `slz/zz/qsez/hmz/lys/hytj/lyfb/jdy/hyjj`，并把 `slz`、`hytj` 和组合键/跑动普攻分支串起来。
- `sx` 已确认是被动而非废弃技能：`BaseRoleProperies` 检测 Role1 已学习 `sx` 后自动挂载 `role1_sx`，增加吸血 `0.8 + (level - 1) / 10` 与暴击 `3 + round(level)`；技能移除时反向扣回。它没有 `showSkill()` 主动分支，按特殊技能规则最高 9 级。
- 九项主动技能的完整动作、结算与恢复边界见下表；伤害统一还会经过 `getRealPower()` 末尾的 `* 1.27`，表中“技能口径”保留函数内、乘 `1.27` 前的主系数。

| 技能 | 触发与 MP | 动作/生效窗口 | 效果与恢复边界 |
| --- | --- | --- | --- |
| `slz` | 五槽绑定，或 `0101`（普攻+上）；`consumeMP[level-1] * 0.55` | `hit6`，`timers=15`；动作第 2 计数、帧点 x=1 生成 `Role1Bullet6` | 单段物理，系数 `0.6`，击退 `[5,-20]`；动作结束按地面/空中回 `wait/jump3`。普通攻击/受击期间拒绝重入。 |
| `zz` | 五槽绑定；`* 0.75` | `hit14`，`timers=20`；第 2 计数生成 `Role1Bullet14_1`，第 16 计数生成 `Role1Bullet14_2` | 两个 `SpecialEffectBullet`，`hit14` 为主物理段；现存 `Role1Shadow` 同步 `hit2`，产生 `hit14` 与 0.437 倍派生 `hit14_1`，随后分身销毁；动作结束回 `wait`。 |
| `sx` | 学习即生效，无按键、无 MP | `BaseRoleProperies` 自动挂/卸 `role1_sx` | 9 级被动：吸血 `+0.8 + (level-1)/10`，暴击 `+3 + round(level)`；无动作、无 projectile、无主动重入问题。 |
| `qsez` | 五槽绑定；`* 0.6` | `hit13`，`timers=20`；动作帧点 x=3 持续以 `±30` 冲刺并做碰撞检查，首次碰撞停帧 1.25 秒 | 在目标点生成 `Role1Bullet13` 单段物理（系数 `0.25`）；命中非 boss 生成 1 个分身并有 50% 再生 1 个，命中 boss 固定 4 个并有 50% 再生 1 个。恢复时显示本体并回 `wait`。 |
| `hmz` | 五槽绑定；`* 1.0` | `hit10`，`timers=30`；角色失重，动作停留至第 99 计数后生成 `Role1Bullet10_2` | `hit10_2` 是前方多段物理连斩，销毁回调生成落地 `hit10_4`，0.5 秒后回 `wait`、0.64 秒后恢复重力；`hit10_3` 只有网络回放分支，主机本地链未调用。`hmzCharge` 增量路径被 `BaseHero` 前置保护判断挡住，现有反编译证据不足以把它当成可用三段蓄力。 |
| `lys` | 五槽绑定；`* 0.45`；`0001` 在已学习时先置 `tk=true` | `hit9`；第 10 计数生成 `Role1Bullet9`，第 12 计数设置短霸体父级 | 普通释放沿面向 `±40` 横冲；由上键协同触发时弹体旋转 90°、角色 `speed.y=-36` 向上腾空。弹体销毁恢复重力，动作结束显示本体、清速度、记录 `lastlys` 并回 `wait/jump3`。源码 `getTimer()-lastlys < 36` 是 36ms 门禁。 |
| `hytj` | 五槽绑定，或跑动普攻自动尝试；`* 0.6` | `hit7`；动作第 15 计数、帧点 x=1 在前方 175 生成 `Role1Bullet7`；角色水平速度随计数线性增至 `±25` | 四段口径魔法冲刺，单段系数 `0.65/4`，击退 `[15,0]`；结束清速度并回 `wait/jump3`。未学习或 MP 不足时跑动普攻退回 `hit1`。 |
| `lyfb` | 五槽绑定；`* 0.65` | `hit8`；第 2 计数同时生成跟随段 `Role1Bullet8_1` 与水平移动段 `Role1Bullet8_2` | 移动段速度 `±15`、距离 600、不按末帧销毁；两段均按 12 段口径，主伤系数 `0.7/12`。现存分身同步 `hit1`，生成 `hit8_1/hit8_2_1` 的 0.3125 倍派生并销毁；动作结束回 `wait/jump3`。 |
| `jdy` | 五槽绑定；首段 `* 1.0`，二段不再扣 MP | 首按 `hit11_1`、`timers=35`；仍在 `hit11_1` 时同键转 `hit11_2`，把二段触发计数改为当前计数 | 首段水平 `±25` 并生成跟随 `Role1Bullet11_1`；二段销毁首段弹体、令角色 `speed.y=-25` 并生成 `Role1Bullet11_2`。两段均为 13 段口径魔法、系数 `0.8/13`；任一动作结束销毁两类弹体、恢复重力并回 `wait/jump3`。 |
| `hyjj` | 五槽绑定；`* 1.1`；仅地面 | `hit12`，`timers=17`；第 1 计数选择面向侧目标，第 17 计数生成两枚纯视觉 MC | 对选中目标立即生成 `Role1Bullet12`，再每 1.2 秒重复，合计 4 次；每段为 15 段口径魔法、系数 `0.9/15`、击退 `[0,0]`。源码按 `huoyan` 索引轮询敌数组且只接受面向侧目标；动作本体结束回 `wait`，延迟爆破链独立继续。 |

Role1 普攻与技能协同的最终结论：地面五段 `hit1..5`、空中固定 `hit3`；`0101` 优先 `slz`，跑动普攻优先 `hytj`；`0001` 本身不是 `lys` 释放键，只为随后通过正式槽位释放的 `lys` 设置向上腾空形态。除 `jdy` 二段外，主动技都由攻击/受击状态阻止重入。

### Role2 唐僧

- 构造中设置 `roleName/userType = "唐僧"`、`horizenSpeed = 6`。
- 资源来自 `ROLE2_<clothId>` 和 `ROLE2_EQUIP_<weaponId>`。
- `myKeyDown()` 只见常规动作骨架；未见 `0101` 特化。
- `normalHit()` 是五个角色里最简单的普攻入口：攻击或受击时返回，否则直接 `setAction("hit1")`、发送位置、设置 `lastHit = "hit1"`、`hitNum = 0`、`newAttackId()`。
- `isNormalHit()` 只承认 `hit1`；`runAttack()` 只清空 `doubleCount` 后回到 `normalHit()`。
- `showSkill()` 支持 `sgq/myhc/jgz/tjgl/jhsj/xbz/shy/smb`；这 8 项都来自普通五槽绑定。`blb` 的槽位函数为空，但学习后会把普攻长按转为 `hit2`；`sjt` 没有释放分支，是缩短蓄力并提高全伤害的被动。
- `blb`：`hit1` 动作首段期间持续按普攻（`keyarray[1]`，P1 J / P2 小键盘 1）累积 `hit2CurrentCount`；默认阈值 48，达到阈值后在第 12 帧以 `hit2` 代替 `hit1` 并扣一次动态 MP。未学习或松键会强制跳到结算帧。
- `sjt`：学习后把 `hit2NeedCount` 和 `hit5NeedCount` 从 48 降到 12，并把对应帧停留从 48/24 调短；`getRealPower()` 还给所有 Role2 攻击乘 `1.1 + 0.005 * (level - 1)`。它不应占用主动技能释放分支。
- `xbz -> hit3`：动作第 2 帧在角色 `y + 10` 触发 `Role2Bullet3`（对象实际再加 `y + 40`），角色静止并失重；`magic`、命中间隔 250、击退 `[4,-4]`。`TASK-SLICE-084` 已完成本体段的正式槽位、原版等级伤害公式、固定范围占位效果和生命周期。
- `myhc -> hit6`：动作第 20 帧在角色 `y - 25` 触发禁用碰撞的 `Role2Bullet6`；0.1 秒后对其 100 距离内所有玩家添加 4 秒 `SLOWLY_ADDHP`，每次值为 `ceil(0.0525 / (1 + 0.28098*8) * (1 + 0.28098*(level-1)) * casterMaxHp) * 2`。
- `jgz -> hit7`：动作第 10 帧在前方约 210、下方 30 生成 `Role2Bullet7`；把特效 240 距离内的合法敌对目标失重并在 0.625 秒内拉到角色前方约 200、上方 100，随后恢复重力。部分 boss 类型显式免疫。
- `tjgl -> hit8`：动作第 30 帧在角色附近生成 `Role2Bullet8`；0.05 秒后治疗半径 150 内玩家及其宠物，自身另获得 7 秒 `tjgl_Shield`。治疗系数为 `0.33/(1+0.28098*8)*(1+0.28098*(level-1))`，GXP 时治疗乘 1.5；盾值另乘等级表 `[4.6,4.7,4.8,5,5.15,5.25,5.4,5.6,6] * 0.2915`。
- `jhsj -> hit9`：第 45 帧先在前方约 150、上方 150 生成 `Role2Bullet9_2`，第 55 帧再在前方约 20、上方 20 生成 `Role2Bullet9_1`；两段分别使用 `attackInterval = 5/999`。分身存在时同步执行 `hit4` 动作并生成 `_2` 变体，伤害系数为本体的 0.35。
- `shy -> hit10`：首次创建 `ROLE2_SHALLDOW` 分身，位置/朝向继承本体，水平速度 `5 + skillLevel`，寿命 8 秒；再次释放会把本体传送到分身并销毁，召回不重复扣 MP。分身会在本体释放 `xbz/myhc/tjgl/jhsj` 时分别同步 `hit1/hit2/hit3/hit4`，产生对应弱化或支援效果。
- 现代复现状态（2026-06-21）：`TASK-SLICE-084..089` 已完成 Role2 全部 10 项技能的行为闭环、正式输入、双玩家隔离与自动化回归；当前剩余缺口仅是真实角色技能视觉/音频资源，不阻塞玩法和数值复现。
- 当前导出资源路径未命中 `Role2Bullet2/3/6/7/8/9`、`ROLE2_SHALLDOW` 或对应 `Role2_hit*` 音效；这些行为事实足够使用稳定占位 key 实现，但真视觉/音频仍需用户补角色资源包或后续重新导出。

### Role3 八戒

- 构造中设置 `roleName/userType = "八戒"`、`horizenSpeed = 6`。
- 资源来自 `ROLE3_<clothId>` 和 `ROLE3_EQUIP_<weaponId>`。
- `myKeyDown()` 常规动作外，`0101` 在学习条件和 MP 条件满足时触发 `hit8`。
- `normalHit()` 地面非跑动时走三段循环，超出 1500 ms 重置到第一段；第一段实际动作是 `hit2`，第二段 `hit1`，第三段 `hit3`，地面 `timers = 13`。
- 空中普攻固定 `hit1`，`timers = 15`，`hitNum = 0`。
- 跑动普攻清空 `doubleCount` 后递归回普通普攻，不额外消耗资源。
- `showSkill()` 支持 `dj/sd/zznh/syzq/ssp/jsp/dgq/xgq/tmc`；`rj` 不进主动释放分支，是学习后自动挂载的被动。
- `dj -> hit4`：MP 系数 `0.6 * 22998 / 25958`；动作第 24 帧在前方约 35、上方 55 生成 `FollowBaseObjectBullet("Role3Bullet4")`，物理、击退 `[7,-3]`，伤害按 2 段口径计算。
- `sd -> hit5`：MP 系数 `0.5 * 22998 / 25958`；动作停留帧生成禁用碰撞的 `Role3Bullet5`，自身盾态按 1→2→3→1 循环，每档持续 10 秒。任一盾态下免击退，并按 `1% * min(level, 8)` 降低受到的伤害；`hit5` 本身不造成伤害。
- `rj`：被动增加防御，等级 1..10 对应 `[10,30,50,90,180,300,350,400,420,450]`；每次由 Role3 造成有效命中时，以 `0.1 + level * 0.005` 概率回复 `hurt * 0.2` HP。技能 UI 将它与其他被动一样禁止绑定普通技能槽。
- `zznh -> hit6`：MP 系数 `0.4 * 22998 / 25958`；第 6 帧生成禁用碰撞的 `Role3Bullet6`，把合法敌对目标失重并在 1.8 秒内拉到角色 `x, y-100`。释放后将 `isHit6Ok` 置真，使下一次伤害乘 `1.1 + 0.005 * (level - 1)`，结算一次后清除。
- `syzq -> hit7`：MP 系数 `1.0 * 22998 / 25958`；先生成无伤害的 `Role3Bullet7_1`，再生成水平速度 `±12`、寿命 2.5 秒、距离 999 的 `EnemyMoveBullet("Role3Bullet7_2")`；后段为 11 段口径物理伤害。
- `ssp -> hit8`：MP 系数 `0.55 * 22998 / 25958`、地面限定；同一动作窗口同时生成无伤害/上挑用 `Role3Bullet8_1` 和 4 段魔法伤害 `Role3Bullet8_2`。`普攻+上 (0101)` 在学习槽标记满足且 MP 至少 20 时也进入完全相同的 `hit8` 动作，但固定扣 20 MP。
- `jsp -> hit9`：MP 系数 `0.65 * 22998 / 25958`；生成 `SpecialEffectBullet("Role3Bullet9")`，3 段口径物理伤害；每次释放有 10% 概率给本次攻击表附加 2 秒眩晕。
- `dgq -> hit10`：MP 系数 `0.4 * 22998 / 25958`；动作中角色按朝向以速度 `±15` 水平突进，生成 `Role3Bullet10`，5 段口径魔法伤害，动作结束强制静止。
- `xgq -> hit11/hit11Frame2`：MP 系数 `0.7 * 22998 / 25958`；首段转入隐藏角色显示的第二帧状态，生成 `Role3Bullet11`，4 段口径魔法伤害，结束恢复显示。
- `tmc -> hit12`：MP 系数 `1.2 * 22998 / 25958`；首次释放进入护体动作并生成 `Role3Bullet12_1`，期间免击退且沿用 `sd` 的等级减伤。动作早期再次释放不重复扣 MP，转为 `hit12_2`，围绕角色生成 10 个 `StabBullet("Role3Bullet12_2")`，共同追踪随机合法目标；若此前 `zznh` 强化尚未消费，每枚附加 `hurtAdd = 0.3`。原版怪物伤害路径另有特殊倍率，现代实现需用独立测试锁定等价最终伤害，避免机械双算。
- 现代拆分：先完成 `dj/sd/rj` 基础攻防被动，再完成 `zznh/syzq` 控制与移动弹体、`ssp/jsp` 双段与眩晕、`dgq/xgq` 位移/隐藏动作，最后完成 `tmc` 二次触发追踪阵列。
- 现代复现状态（2026-06-22）：`TASK-SLICE-090..094` 已完成 Role3 全部 10 项学习树技能、普攻+上组合入口、正式 MP/动作门禁、三档盾、`rj` 防御回血、拉拽与一次性强化、移动 projectile、眩晕、突进、隐藏二段和 `tmc` 十枚追踪阵列；P1/P2 隔离与清理均有自动化回归。剩余缺口仅是真实角色技能视觉/音频资源。

### Role4 沙僧

完整战斗证据与实现边界见 `role4-combat-index.md`；以下保留角色总览。

- 构造中设置 `roleName/userType = "沙僧"`、`horizenSpeed = 6`。
- 资源根据武器分为 `ROLE4_SHOVEL_*` 和 `ROLE4_ARROW_*`，并使用 `ROLE4_EQUIP_*`。
- `myKeyDown()` 只见常规动作骨架；未见 `0101` 特化。
- `normalHit()` 地面非跑动时走 `hit1` 至 `hit3` 三段循环，超出 1500 ms 重置到第一段；地面 `timers = 10`。
- `isNotArrow` 由当前武器决定：武器 id 非 `4/5/9/998` 时使用铲形资源，否则使用弓形资源；普攻动作名相同，但音效分为铲系 `Role4_hitN` 和弓系 `Role4_hit1Arrow/Role4_hit2Arrow`。
- 空中普攻根据形态分支：铲形 `hit2`，弓形 `hit3`，均设置 `timers = 15` 并清零 `hitNum`。
- 私有 `runAttack()` 虽写有“20 MP 进入 `hit6`”，但类内无调用点；本地可达的 `hit6` 入口是 `mbyj`，不能把该死代码当成跑动普攻需求。
- `showSkill()` 支持九项主动；`mds` 的空主动函数对应 `BaseAddEffect` 中毒层超过 2 后触发的被动毒爆，不是废弃项。
- `qlj` 有动态 MP 加固定 15 的双扣；`lybj` 是 10 秒标记/二次传送；`mmw` 按铲/弓形态使用完全不同的结算链。

### Role5 白龙

完整战斗证据与实现拆分见 `role5-combat-index.md`；以下保留角色总览。

- 构造中设置 `roleName/userType = "白龙"`。
- 枪形态速度 `horizenSpeed = 6`、`horizenRunSpeed = 10`；剑形态速度 `horizenSpeed = 7`、`horizenRunSpeed = 11`。
- 资源使用 `BaseBitmapDataPool.build/loadZm4RoleResources()`，按动作和武器形态拆成 `*_spear`、`*_sword`。
- `myKeyDown()` 常规动作外，`0101` 对 `yyb` 做特化，并会切换 `_invert`。
- `normalHit()` 开头会检查带 `ROLE5SKILL5` 标记的怪物；若存在目标，枪形态直接瞬移，剑形态先 `ToSpear()` 再瞬移到目标附近。
- 地面非跑动时按 1200 ms 窗口走四段循环：枪形态 `hit1` 至 `hit4`，剑形态 `hit18` 至 `hit21`；`timers` 均设为 0。
- 空中普攻：枪形态 `hit5`，剑形态 `hit22`；跑动普攻：枪形态 `hit114`，剑形态 `hit114_1`。
- 每次 `normalHit()` 末尾都会调用 `addRole5Energy()`；枪形态下累计 `_role5hitadd`，超过 `AllConsts.ROLE5MAXENERGY` 后添加 `BaseAddEffect.ROLE5HITADD`。
- `showSkill()` 支持 `xlc/lxuanj/xkjz/yyb/tlj/pkz/lxj/lysh/jrjl/mlsz`。其中 `pkz/lxj/lysh/jrjl/mlsz` 的 MP 公式在剑形态最明确，非剑形态沿用 `returnSkillNameBySkillKey()` 返回的 `needLh` 值。
- `lysh` 使用 `BLMSkill5` 四枚随身箭，`jrjl` 使用 `JRJL` 三枚随身箭；`lxj` 的龙魂剑状态会影响普攻/技能资源与伤害，但源码中的 `dolxjfeijian()` 为空函数，现代实现不得猜造额外飞剑。
- 后续重点：白龙资源加载方式特殊，普攻与技能动作数量远多于前四个角色；现代实现已拆为 `TASK-SLICE-105..109`。

## 不确定项

- `Role5` 的 P2 创建路径需要确认 `AUtils.getNewObj("export.hero.Role5")` 在运行时是否与 P1 的 `new Role5()` 等价。
- `0101` 技能入口已记录：Role1 `slz`、Role3 `hit8`、Role5 `yyb`。Role5 完整伤害帧和对象表现见 `role5-combat-index.md`。
- 普攻连段、动作切换和第一切片候选已完成索引；具体伤害帧、碰撞框、攻击窗口仍需战斗/动作帧任务继续确认。
- 五个角色普攻都应有特效；`attack-effects-index.md` 已确认前四名角色和白龙剑形态的映射，且确认当前 `local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf` 导出结果不足以直接提供这些素材。`M-047` 仍保留为部分已扒，因为白龙枪形态 `doSingleHit(...)` 还缺反编译证据。
- `User.skillbykey` 的购买/绑定入口已定位到 `SkillControl`/`SkillSetControl`，但默认存档绑定和完整技能 UI 不是本任务范围。

## 后续建议

优先执行 `TASK-SETTINGS-003`：确认第一个关卡入口、刷怪和通关流程。若转入实现，第一个角色建议使用 Role2，先做移动和 `hit1` 普攻，再考虑 `sgq -> hit5` 技能。



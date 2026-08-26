# TASK-SETTINGS-207 猴系完整家族证据

## 1. 范围与结论

- 证据范围：`BasePet -> PetMonkey1..4`，覆盖 owner、AI、追击/回跟/传送、普通攻击、`xj/lj/lyq/jgaoyi`、CD、受击触发、命中/伤害、动作与 effect、碰撞、死亡/销毁和 P1/P2 生命周期。
- 机器真值：`task-settings-207.pet-monkey-family`，路径 `docs/reverse-engineering/ground-truth/manifests/task-settings-207-pet-monkey-family.json`，状态 `verified`。
- 逐对象视觉真值继续由 `task-settings-193a.pet-monkey-animation` 负责：626 states、20 display objects、626 original baselines、0 unresolved。207 以源哈希锁定并复核它，没有复制第二份坐标事实。
- 完整性结论：41 项声明同时出现在证据范围、207 manifest 和 `TASK-SLICE-208` 的 P1R 输入，影响实现的未知项为 0。
- 现代反证：`PetCombatRuntime` 仍没有正式 Scene 消费者；`MonkeyPetBehavior` 的普通攻击只发事件，技能则直接调用现代 `PetSystem`，没有原版“动作关键帧 -> projectile/effect -> 碰撞 -> 伤害”闭环。此项是 208 的实现输入，不是 207 的原版未知。

## 2. 来源、owner 与装载优先级

| 对象 | 原版 owner / class | 证据 | 等级 |
| --- | --- | --- | --- |
| monkey1 body | `assets/20120203.swf / PetMonkeyBmd1` | 193A manifest `owners` 与恢复 SWF SymbolClass | verified/direct |
| monkey2 body | `assets/20120203.swf / PetMonkeyBmd2` | 同上 | verified/direct |
| monkey3 body | `assets/20120203.swf / PetMonkeyBmd3` | 同上 | verified/direct |
| monkey4 body | `assets/pet1.swf / PetMonkeyBmd4` | 同上；该专属 owner 优先于共享猴系包 | verified/direct |
| hit/projectile effects | `assets/20120203.swf` 中九个猴系 effect class | 193A `displayObjects`、四个 `PetMonkey*.as` 构造路径 | verified/direct |
| collision | `assets/StageCommon.swf / ObjectBaseSprite{,3,4}` | character 101/103/105 的 SymbolClass、selective SVG 导出、`newColipse()` | verified/direct |

源 AS3 使用 `[172845].swf` 提取副本作行为证据，SHA-256 已写入 207 manifest；视觉是否存在与 owner 归属只以 `source/restored-swfs/` 和 193A 恢复源证据为准。任何源哈希变化都会令生成器失败。

## 3. 共享行为链

| 合同 | 原版事实 | 双向 locator | 等级 / 反证条件 |
| --- | --- | --- | --- |
| step 顺序 | projectile step -> passive -> AI -> passive upgrade -> CD decrement -> time count -> 距 owner 1000 的瞬移 -> base step | `BasePet.as:141-215` | verified/code；改变调用顺序即反证 |
| 目标集合与顺序 | `gc.obbsiteArray = gc.pWorld.monsterArray`；顺序扫描并取首个距离不大于 1200 的对象，等价稳定生成/插入顺序，不按最近距离排序 | `BasePet.as:305-397,1075-1086`；`BaseLevelListenering.as:103`；`my/MainGame.as:571` | verified/code；特殊模式重写数组时须另立范围 |
| 丢失目标 | 目标死亡或距离不小于 1200 时清空，本帧不重新搜索 | `BasePet.as:305-397` | verified/code |
| 行为节拍 | 每 `frameClips` 检查一次技能；优先 skill1 -> 2 -> 3 -> 4；技能均失败后每秒才进入普攻/等待/追击分支 | `BasePet.as:305-397` | verified/code |
| 普攻随机 | `random <= attackRate(0.7)` 普攻；否则重新随机，`<0.3` 等待，余下追击 | `BasePet.as:305-397` | verified/code；两个随机数不可合并 |
| 跟随与 warp | owner 跟随阈值 640；目标搜索阈值 1200；距 owner 1000 时直接落到 `owner.x, owner.y-30`，不播放 warp 动作 | `BasePet.as:141-183,1009-1043` | verified/code + 193A 无 warp row |
| CD | AI 先读取当前槽位，之后 `countSkillCD` 才递减正值；初始/间隔 CD 由各形态构造器冻结 | `BasePet.as:185-215`；`PetMonkey1..4.as` constructors | verified/code |
| 受击与死亡 | `beMagicAttack -> defense/countHurt -> reduceHp`；HP 归零进入 dead，single 模式扣 life；猴系 override 在 `super.reduceHp` 后仍置受击释放标志，但死亡阶段优先 | `BasePet.as:566-746,865-934`；各形态 `reduceHp()` | verified/code |
| projectile 命中 | hero/pet bullet 扫描 `monsterArray.concat(likeMonsterArray)`；按 attackId 去重，服从 hitMaxCount/attackInterval，然后调用目标 `beMagicAttack` | `BaseBullet.as:225-371,427-496` | verified/code |
| 伤害入口 | bullet 建立时快照 `sourceRole.getRealPower(curAction)`；BasePet 默认 real power 基线为 `atk*2.8`，再进入目标防御/受伤链 | `BaseBullet.as:427-461`；`BasePet.as:566-746` | verified/code |
| 销毁 | 销毁 body/effects，1 秒淡出移除，销毁并清空自己的 bullets，清 owner pet slot 和保护引用 | `BasePet.as:1150-1189` | verified/code |

自动 buff 只在房间/single 场景按 BasePet 共享流程执行；竖直跳落同属共享 step。它们不改变猴系动作优先级，但 208 必须保留调用位置。

## 4. 四形态动作、技能与伤害

`PetInfo.getPetHarmObj` 先给出 `xj=2.6*atk`、`lj=4.2*atk`、`lyq=6.8*atk`，再统一乘 `1.05`；`xj/lj/lyq` MP 20，`jgaoyi` MP 30。locator：`PetInfo.as:1017-1161,1879-1884,1935-1944,2138-2145`。

| 形态 | 自主优先级与释放门 | 原版命中/伤害 | locator |
| --- | --- | --- | --- |
| monkey1 | skill1=`xj`，必须已学、MP 足且刚受击；CD `2/3s` | normal hit1：frame-count 10，`±45,-25`，`PetMonkey1Bullet1`；xj hit2：frame-count 11，`±45,-80`，跟随宠物 4s 并清受击标志。normal=`(atk+magicAdd)*crit*GXP`；xj=`(2.6*1.05*atk+magicAdd)*crit*GXP` | `PetMonkey1.as:14-44,130-208,209-261,280-330,335-343` |
| monkey2 | skill1=`lj`，已学且 MP 足；skill2=`xj`，另需受击；CD `2/3s`,`2/7s` | normal hit1：count 8，`±65,-30`；lj hit2：count 1，先放 behind/disabled 的 `_1(±15,-15)`，再放伤害 `_2(0,0)`；xj hit3：count 10，`±45,-70`、4s。公式分别为 normal、`lj`、`xj` 的 multiplier + magicAdd + crit + GXP | `PetMonkey2.as:14-51,145-259,260-357,385-451,456-464` |
| monkey3 | skill1=`lyq` 且目标距离 <=400；skill2=`xj`；skill3=`lj` 且受击；CD `2/3s`,`2/7s`,`4/9s` | normal count 8 `±100,-40`；lyq count 2 `±35,-60`；xj count 10 `±45,-50`、4s；lj count 1，disabled prelude `(0,-15)` 后伤害 `±10,-15`。关键差异：xj=`2.6*1.05*atk*GXP`，不加 magicAdd、也不暴击 | `PetMonkey3.as:14-57,159-298,299-427,461-537,542-555` |
| monkey4 | 与 monkey3 三技能门一致，另 skill4=`jgaoyi`；CD `2/3s`,`2/7s`,`4/6s`,`10/24s`，注意 lj 间隔为 6s | normal/lyq/xj/lj 沿用形态 3 视觉与 projectile，并整体乘 `hurtBaseEffectRate`；形态 4 xj 恢复 magicAdd 与 crit；jgaoyi hit5 自身伤害为 0 | `PetMonkey4.as:18-61,172-393,394-511,512-694,699-720` |

### jgaoyi 的不可简化分支

1. 起始设置 hit5 剩余次数 5，消耗 30 MP 并进入 slot4 CD。
2. 每次 hit5 动作结束，只从 `monsterArray` 中取屏幕 x 严格位于 `(20,920)` 的对象，再随机选择，传送至目标 `x±50,y-30`。
3. 中间四次先独立判断 xj：学会则调用 xj；随后再独立判断 lj：学会则立即调用 lj，否则普通攻击。因此同时学会 xj/lj 时不是二选一，后调用的 lj 会覆盖动作调度；该原版怪异分支必须保留为可测合同。
4. 最后一次学会 lyq 则调用 lyq，否则普通攻击；没有可见目标或链结束时回到 `owner.x,owner.y-50` 并 wait。
5. 受击会把 hit5 剩余次数清零。

证据：`PetMonkey4.as:172-283,414-511`，等级 verified/code；把中间分支改为 `else if`、最近目标或少于五次均构成反证。

## 5. 视觉、注册点与碰撞

- 视觉动作行、方向矩阵、hold、命中发射点、effect 生命周期由 193A manifest 的 626 状态及对应 original baseline 全量覆盖；重新执行其生成器 `--check` 与 UI Schema 校验通过后，207 才可 verified。
- `warp` 是根节点位置跳转，不是缺失视觉状态；这解释了 193A 没有 warp 动作行。
- 207 新增碰撞 Symbol 的选择性原始导出，命令只读取 `StageCommon.swf`：`ffdec-cli -selectid 101,103,105 -format sprite:svg -export sprite ...`。

| class / character | 使用形态 | 原始导出 bounds | 注册点 |
| --- | --- | --- | --- |
| `ObjectBaseSprite4 / 101` | monkey2 | `35 x 69.95` | `(17.5,35)` |
| `ObjectBaseSprite3 / 103` | monkey1 | `31.05 x 29.95` | `(15.55,15)` |
| `ObjectBaseSprite / 105` | monkey3/4 | `49.95 x 99.95` | `(25,50)` |

导出位于 `local-resources/regima/task-outputs/task-settings-207-pet-monkey-family/collision-svg/`，可由 manifest 精确回指。矩形来源是原 SWF 的半透明 collision shape，不由现代素材或目测估算。

## 6. P1/P2 owner 与生命周期

- 两名玩家各自的 pet 实例共享 BasePet 行为规则，但 `target`、四槽 CD、受击释放标志、active bullets 和 monkey4 hit5 counter 都是实例私有状态。
- bullet 的 sourceRole/attackId 保留所属玩家攻击身份；目标碰撞不共享去重集合。
- destroy 只遍历该 pet 自己的 bullet array，并只清该 owner 的 pet slot；不得由 P1 销毁影响 P2。
- 208 的正式验收必须分别跑 P1/P2 的 monkey1..4 全生命周期，不能用同一行为单元测试推断双玩家 owner 正确。

## 7. 原版事实到现代消费者矩阵

| 原版合同 | 现代 owner / 消费者 | 当前证据 | 208 gate |
| --- | --- | --- | --- |
| 626 状态视觉 | `PetMonkeyAnimationAssets` -> `FormalPetMonkeyBodyBridge` | 已实现视觉投影；193B 专项测试存在 | 必须接入真实自主动作和 hit event，不能只单独预览 |
| BasePet step/AI/CD 顺序 | `PetCombatRuntime` | LSP 引用只有类声明，无 Scene/正式消费者 | 正式场景每名玩家各有一个 runtime，并观察 update/destroy |
| 技能优先级 | `MonkeyPetBehavior.selectAction` -> `PetCombatRuntime` | 局部结构存在；缺 once-per-second 随机普攻/等待/追击节拍 | deterministic clock 与随机 fixture 覆盖所有分支 |
| 普通攻击 | `MonkeyPetBehavior.execute` | 只发 `{type:'basic-attack'}` | 真 body 动作、命中帧、projectile、碰撞与 HP 变化 |
| 技能 hit 链 | `PetSystem request*` / `TestScenePetMagicBridge` | 当前立即结算，现代 tuning 不是原版公式 | 以关键帧事件驱动原版 projectile/effect 与伤害合同 |
| monkey4 受击 lj | `MonkeyPetBehavior.onDamaged` | 形态 4 未武装原版受击释放状态 | 形态 4 受击后 slot3 可释放，死亡仍优先 |
| jgaoyi | `MonkeyPetBehavior/PetSystem` | 五段选择、传送、动作覆盖链不存在 | 5 次链、屏内边界、无目标、受击取消与回 owner 全测 |
| P1/P2 owner | `PetCombatRuntime` | 无正式双玩家 consumer | 五关 P1/P2 各自生成、战斗、切关、死亡、销毁无串扰 |

`PetSystem` 当前数值若与本证据不同，属于待 208 处理的现代偏差，不可反向覆盖原版真值。

## 8. 完整性与反证入口

`CONTRACT_SET:owner.body|owner.effects|owner.collision|visual.states|visual.baselines|runtime.update-order|runtime.target-order|runtime.target-loss|runtime.follow-owner|runtime.follow-target|runtime.warp|runtime.action-priority|runtime.normal-roll|runtime.cooldown-order|runtime.auto-buff|runtime.hurt|runtime.death|runtime.destroy|runtime.projectile-collision|runtime.attack-id-dedup|runtime.damage-pipeline|runtime.p1-p2|monkey1.normal|monkey1.xj|monkey1.hurt-release|monkey2.normal|monkey2.lj|monkey2.xj|monkey2.hurt-release|monkey3.normal|monkey3.lyq|monkey3.xj|monkey3.lj|monkey3.hurt-release|monkey4.normal|monkey4.lyq|monkey4.xj|monkey4.lj|monkey4.jgaoyi|monkey4.hurt-release|monkey4.jgaoyi-chain`

- manifest 的 `declaredContractIds`、`manifestContractIds`、`p1rContractIds` 和 `p1rAcceptance.contractIds` 由生成器做严格同序等值检查，共 41 项。
- 关键字段变异测试会把 monkey4 lj CD 从 6 改为 9，并要求验证器拒绝；还固定 monkey3 xj 不得出现 crit/magicAdd、jgaoyi 必须五段、形态 4 受击缺口必须保留在现代矩阵。
- 影响实现的未知：无。特殊游戏模式若重写 `obbsiteArray`、后续发现 `[172845].swf` 与恢复主包的行为版本不一致、或原 SWF hash 变化，均须重新打开对应合同，而不是静默沿用 verified。
- 193A 复核结论：它完整覆盖自己声明的“视觉对象/动作/方向/帧/基准”范围，但从未声明自主 AI、普通攻击伤害、CD、P1/P2 owner 或销毁；207 补齐这些层，因此 193A 的 verified 不是完整宠物家族完成声明。

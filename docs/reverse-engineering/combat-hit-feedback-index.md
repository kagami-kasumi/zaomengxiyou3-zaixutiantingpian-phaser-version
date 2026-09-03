# 怪物命中反馈、伤害数字与连击索引

## TASK-SETTINGS-211 范围与结论

本页只闭合“怪物作为伤害目标”的原版命中反馈。玩家/宠物受伤数字、治疗、回蓝和 MP 消耗数字不在本 task；现代实现由 `TASK-SLICE-212` 承担。

权威机器输入为 `task-settings-211.combat-hit-feedback`：

- manifest：`docs/reverse-engineering/ground-truth/manifests/task-settings-211-combat-hit-feedback.json`
- 状态：`verified`
- 状态集：23 个 940×590 fixture，覆盖普通/暴击、Role/宠物/法宝、P1/P2、时间关键点、快速六击、致死、miss、重复 attack id、原版 0 伤害、持续效果反证、2/9/10/99/100 连击与清零
- 显示对象：由恢复源 `OtherMat1.swf` 的 20 个伤害位图、10 个五帧连击数字 MovieClip、`export.Batter` 根和背景递归生成
- 实现影响型未知：`unresolved=[]`

## 待证明问题的回答

| 问题 | 结论 | 等级 |
| --- | --- | --- |
| 什么算一次原版直接可见命中 | `BaseBullet.checkAttack()` 先按 `attackId -> target` 去重，再调用 `BaseMonster.beMagicAttack()`；碰撞/强制命中成立且 Dodge 未返回时进入命中链。miss 与重复 id 均不产生命中数字或连击。 | 交叉确认 |
| 数字显示多少 | 直接命中显示防御、暴击韧性/守护和特殊规则处理后的 `_loc15_`；它在 `reduceHp()` 前传给 `addMonHurtMc()`，所以原版显示的是最终计算伤害，不是目标 HP clamp 后的差值。普通持续效果显示该效果传入 `addMonHurtMc()` 的值。 | 确认事实 |
| 普通与暴击如何区分 | 最终 `isCrit=false` 用 `hurtnum0..9`（30×30）；最终 `isCrit=true` 用 `bnum0..9`（42×42）。韧性把暴击降为普通并将伤害减半时，字形也随最终标志改为普通。 | 交叉确认 |
| 在哪里显示 | 怪物局部锚点为 `(x-20, y-min(300,height)/2)`，对象被加到 `gameSence`；数字位间距 20px。它是怪物/世界坐标，经关卡镜头变换进入舞台，不依赖 P1/P2 HUD 镜像。 | 交叉确认 |
| 哪些来源计入连击 | 经 `BaseMonster.beMagicAttack()` 接受的直接子弹命中先执行 `++User.batterNum`。英雄子弹、宠物以自身作为 `sourceRole` 的子弹、法宝以所属英雄作为 `sourceRole` 的子弹均走此入口。`BaseAddEffect` 的直接持续伤害可扣 HP 并显示普通数字，但不执行该自增，不能算新连击。 | 交叉确认 |
| 连击何时显示与清零 | `User.batterNum >= 2` 时，`GameInfo` 在固定 `(694.95,234.95)` 创建/刷新唯一 `Batter`，每次事件把 alpha 复位为 1 并重新做 2 秒淡出。每 40 个 host tick 比较一次当前值；若与上个检查点相同则清零，否则只更新快照。因此静默窗口由命中相对检查相位决定，而不是固定毫秒常量。 | 确认事实 |
| 最高连击由谁消费 | 每次 40-tick 检查先令 `User.biggestbatterNum=max(biggest,current)`；胜利结果 `GameWin.txt_hight` 直接显示该值。现代 `LevelResultView` 已有 `highestCombo` 字段，但正式入口仍传默认 0。 | 交叉确认 |

## 六段证据链

### 1. 对象局部 producer

- `BaseBullet.as:289-338`：遍历候选目标；`beAttackIdArray.indexOf(attackId) == -1` 才调用 `beMagicAttack`，成功后记录 id 并消耗可命中次数。
- `BaseMonster.as:870-899`：无敌态、碰撞和 Dodge/miss 的提前返回。
- `BaseMonster.as:914-1076`：直接命中先递增 `User.batterNum`，计算 `_loc15_` 和最终 `isCrit`，再调用 `addMonHurtMc(_loc15_, isCrit)`。
- `BaseMonster.as:1146-1153`：数字创建后才进入 `reduceHp(_loc15_)`；致死命中仍有最终数字。
- `BaseMonster.as:1619-1639`：普通/暴击资源路由与怪物相对锚点。
- `BaseAddEffect.as:1213-1239`：持续效果的反证路径会直接扣怪物 HP、调用 `addMonHurtMc(..., false)`，但没有 `++User.batterNum`；它可派发 `MonsterIsBeat` 刷新已有面板，却不是新连击 producer。

### 2. 共享调用链与 owner

```text
BaseBullet.checkAttack
  -> attackId/target 去重
  -> BaseMonster.beMagicAttack
      -> miss: addMissMc + return false
      -> direct success: ++User.batterNum
      -> 计算最终 damage / isCrit
      -> BaseMonster.addMonHurtMc
          -> CureHpQueue.addMonsterHurt / addMonsterCritHurt
      -> BaseMonster.reduceHp
      -> hurt/dead + HP 条 + MonsterIsBeat

BaseObject.step
  -> CureHpQueue.step
      -> queue.length > 5 ? 同 tick 扇出 5 项 : 1 项
      -> ANumber.aNumImage(..., digitStride=20)
          -> gameSence.addChild
          -> 4x -> 1x (0.2s)
          -> delay 0.25s
          -> y -= 100 + alpha -> 0 (1s)
          -> destroy

GameInfo MonsterIsBeat listener
  -> batterNum >= 2 ? create/refresh Batter : no panel
  -> Batter.addBatterNum
      -> ANumber.aNumMC("num", value, xByDigits, 28.3, 50)
  -> panel alpha 1 -> 0 (2s), then remove

GameInfo.step every 40 host ticks
  -> biggest = max(biggest, current)
  -> current unchanged since prior checkpoint ? current=0 : snapshot=current
  -> GameWin.txt_hight / modern LevelResultStats.highestCombo
```

owner 结论：当前连击和最高连击是原版 `User` 的静态战斗会话状态；显示 owner 是全局 `GameInfo`，不是某个玩家 HUD 或某只怪物。P1/P2 的直接命中共同增加同一计数。宠物子弹在 `BasePet` 中把宠物自身设为 `sourceRole`；法宝子弹（例如 `MagicRing`）把所属英雄设为 `sourceRole`，但两者进入怪物后共享同一反馈路径。

### 3. SWF 显示列表、几何与时间线

恢复源：`local-resources/regima/source/restored-swfs/assets/OtherMat1.swf`，SHA-256 `97478e1e03a22c7d06197ffb75ab890d98b084377cbdcf394716cbaf27082126`。

| 对象 | SymbolClass / character | 父对象与 depth | 原始边界/矩阵 | 动态语义 |
| --- | --- | --- | --- | --- |
| 普通数字 0..9 | `hurtnum0..9` / 117,114,110,107,105,103,97,95,93,91 | 动态 `ANumber` child，位序即 addChild 顺序 | 每位 30×30；首位 local `(0,0)`，后续 `x=i*20` | 整个 `ANumber` 从 4× 缩到 1×；随后上浮淡出 |
| 暴击数字 0..9 | `bnum0..9` / 35,34,33,32,31,30,28,27,26,23 | 同上 | 每位 42×42；位距仍为 20，故明显重叠 | 同普通数字 Tween |
| 连击根 | `export.Batter` / 299 | `GameInfo.addChild`，动态顶层 | 根 `(694.95,234.95)`；character 299 frame 1 只含 depth 1 的 character 298；背景 190×60，单位矩阵 | 面板每次命中事件复位 alpha，2 秒淡出后销毁 |
| 连击数字 0..9 | `num0..9` / 296,292,288,284,280,276,271,267,263,259 | 动态 `ANumber` child；位距 50 | 1 位 x=4；2 位 x=-44.6；3 位及以上 x=-95.6；y=28.3 | 每个数字是五帧循环 MovieClip：scale `2.5,2.125,1.75,1.375,1`；平移逐帧到 `(1.4,0.35)`；blur `70,52.5,35,17.5,0` |

伤害队列最多可从 10 项再接收 1 项（判断为 `length <= 10`）。当出队前长度大于 5 时，同 tick 依次使用 `(-20,-20)、(-10,-10)、(0,0)、(10,-10)、(20,-20)` 扇出五项；伤害项设置两 tick 节流。manifest 的 `/states/6` 与对应 displayObjects 固化了六项队列在首个 tick 的五项可见布局。

坐标合同：manifest 采用固定怪物 fixture `x=470,y=350,height=120` 与 identity `gameSence -> stage`，因此基准锚点为 `(450,290)`。正式实现必须先把实际怪物 world point 通过镜头/场景变换换成舞台坐标；不能把 `(450,290)` 当作常量。P1/P2 在同一目标 fixture 下几何相同，连击面板也不镜像。

### 4. 与架构无关的可观察合同

1. 直接攻击只有通过碰撞、Dodge、dead/无敌和 attack-id 去重，并形成一次被接受的怪物命中后，才允许生成直接命中反馈。
2. 原版直接命中数字使用最终伤害计算值；现代 212 按 task 已冻结的更强合同，以实际 HP decrease 的 clamped `DamageEvent.amount` 为显示值。该差异是明确交接裁决，不冒充原版事实。
3. `critical` 必须来自结算后的最终暴击语义，不能从攻击动画或 `attackKind` 推断；韧性取消暴击时必须用普通字形。
4. 普通与暴击只改变字形族/单字尺寸，不改变 20px 位距、怪物锚点、队列、弹出/上浮时序。
5. 直接 Role、宠物、法宝命中共享 target-side 反馈；来源不改变字形、锚点或队列。持续效果允许显示数字，但只有明确属于原版直接命中计数语义的事件才增加连击。
6. 连击从 2 开始显示；所有 P1/P2 的合格直接命中共享一个战斗会话计数、一个全局面板与一个最高值。
7. 连击清零按 40 host tick 的相邻快照无增长规则实现；20/24/30 tick 质量设置下不得硬编码成单一毫秒数。
8. miss、重复 attack id、dead target 和未形成 HP decrease 的现代事件不得生成数字或连击。原版成功但计算为 0 时仍显示 `0`；212 按明确现代收紧合同抑制它。

### 5. 现代实现映射（212 输入）

| 现代接缝 | 当前事实 | 212 必须消费的合同 |
| --- | --- | --- |
| `CombatSystem.DamageEvent` | 已有 source/target/attackId/action/amount/kind/time，无最终 `critical` | 增加结算后的暴击语义或等价字段；稳定事件身份至少为 `attackId -> targetId` |
| `Stage1CombatSystem.resolveStage1HeroHit/resolveStage1PetHit` | 已按 enemy HP clamp `amount`，先扣 HP，再设 hurt/dead，并写 audit | 只有 `hpBefore-hpAfter > 0` 的唯一事件进入共享反馈；复用同一 clamped amount |
| 法宝/技能/持续效果消费者 | 多条 DamageEvent/专项路径，尚无统一可见 producer | 汇入同一成功 HP decrease 接缝；是否增加连击由直接命中语义显式决定，不按 source 名字猜测 |
| 五关怪物 visual systems | 已消费 `hurt/dead` phase 与 HP | 数字以同一怪物 runtime/world anchor 投影；dead 的最后一击仍可显示，dead 后新事件拒绝 |
| `LevelResultView` | 有 `highestCombo` 字段；`createLevelResultStats()` 仍固定 0 | 从同一战斗会话 combo owner 传入最高值，不另建结果页计数 |

允许的现代例外只有两项：稳定事件 id；以及 task 已明确冻结的“实际 HP decrease 才可见/计数”收紧。不得添加现代字体、粒子、震屏、新阈值或按玩家拆分连击。

### 6. 双重验证合同

确定性验证必须覆盖：

- 同 attackId/target 只结算一次；miss、0 decrease、dead target 均无反馈；
- ordinary/critical 最终标志与 glyph family；个位/多位的 20px 与 50px 排版；
- 六项队列首 tick 五项扇出、两 tick 节流和剩余项；
- 2/9/10/99/100、P1/P2 共享计数、40-tick 相邻快照清零与最高值；
- Role/宠物/法宝/持续效果的数字与连击参与矩阵；
- 最后一击先形成可见事件，再进入 dead；重复 dead-target 事件不产生反馈；
- 结果页直接收到战斗会话最高连击。

运行视觉验证必须在 940×590 下以 manifest 的 `/states` 和 `docs/tasks/evidence/TASK-SETTINGS-211/` 基准逐状态比较：怪物/镜头锚点、普通/暴击边缘、4× 弹出、0.2s 收束、0.25s 延迟、100px/1s 上浮淡出、五项扇出、Batter 固定位置、五帧数字 pulse、2 秒 alpha 和 P1/P2 不镜像。字体栅格化不适用：全部数字均为原位图/MovieClip 资源。

## 证据矩阵

| 行为合同项 | 局部证据 | 共享调用链 | 几何/坐标证据 | 等级 | 未知与反证条件 | 验证方式 |
| --- | --- | --- | --- | --- | --- | --- |
| miss/重复 id 不可见 | `BaseMonster.as:870-899`；`BaseBullet.as:301-325` | Bullet -> Monster | 不创建显示对象 | 交叉确认 | 若某非 Bullet producer 绕过此入口，必须单独分类 | source mutation + 零对象断言 |
| 普通/暴击数字值与字形 | `BaseMonster.as:940-1076,1619-1639` | Monster -> Queue -> ANumber | manifest `/displayObjects`；30×30/42×42，stride 20 | 交叉确认 | 原版 overkill 数字不是 HP clamp；212 已明确收紧 | source regex、SymbolClass/PNG hash、逐状态差异 |
| 队列扇出与时序 | `CureHpQueue.as:86-168`；`ANumber.as:38-67` | BaseObject.step -> Queue.step | manifest `rapid-six-hit-p1-t0` 及 t0/t200/t250/t750/t1250 | 交叉确认 | TweenMax easing 由 `Quad.easeOut` 固定；中间连续曲线按该 easing | generator mutation + timeline screenshot |
| 连击阈值/布局/淡出 | `GameInfo.as:475-501`；`Batter.as:16-42` | MonsterIsBeat -> GameInfo -> Batter -> ANumber | character 299/298；num0..9 五帧；固定 HUD anchor | 交叉确认 | 非直接 effect 事件可刷新已有面板但不加值 | 2/9/10/99/100 + effect 反证 |
| 连击清零/最高值 | `GameInfo.as:443-515`；`GameWin.as:214-247` | PhysicsWorld -> GameInfo.step -> result | 纯会话状态；几何不适用 | 确认事实 | 检查相位令静默时长处于 40..80 tick 区间 | 20/24/30 tick 矩阵与结果页断言 |
| 来源与 P1/P2 | `BasePet.as:1045-1055`；`MagicRing.as:45-52`；`BaseAddEffect.as:1213-1239` | 所有接受的直接子弹共享 Monster owner；effect 为反证 | 同目标 world anchor、单全局 Batter；不镜像 | 交叉确认 | 新来源若不经过 DamageEvent 成功 HP decrease，不能自动加入 | Role/pet/magic/effect source matrix |

## 差异与重开信号

- 原资源复用：`hurtnum0..9`、`bnum0..9`、`num0..9`、character 299/298 全部可从恢复源选择性导出；没有现代可见替代层需求。
- 等价重建：动态 `ANumber` child、TweenMax 和队列由现代运行时重建，但必须直接消费 manifest 的资源、矩阵、anchor 和时间合同。
- 明确现代差异：显示/计数只接受实际 HP decrease；原版成功的计算 0 会显示 `0`，现代 212 不显示。
- 未完成：本 task 不含现代截图或叠图；这些属于 212 的双重验证，不影响 211 的原版真值 `verified`。
- 重开信号：恢复 SWF hash、SymbolClass、五帧 num 时间线或 AS3 producer 顺序变化；212 发现法宝/持续效果无法归入上述参与矩阵；用户提供原版运行录屏显示与恢复 SWF/AS3 不一致。

## 212 现代消费结果（2026-09-02）

- `CombatFeedbackSystem` 以 `attackId -> targetId` 为稳定事件身份，只接受与实际 HP decrease 完全一致的 clamped `DamageEvent.amount`；Role、宠物、法宝和 effect 共用 source/owner/target/critical/anchor 轨迹，effect 显示但不增加连击。
- `CombatFeedbackView` 直接消费 211 的 71 个原版资源与锚点/位距/队列/时间合同，以 30fps source host tick 独立于 Phaser 渲染帧推进。连击 PNG 的 315×315 导出滤镜画布按原版 175×175 display bounds 缩放，不引入现代字形或覆盖层。
- 正式五关的共享 `Stage1CombatRuntime` 与 TestScene 的同系统 bridge 均在成功扣血后产生反馈；返回/重试/重载销毁状态，结果页读取同一会话 `highestCombo`。
- 确定性专项覆盖 miss、0、重复、dead、六项扇出、P1/P2 共享计数、普通/暴击、Role/pet/magic/effect 和结果页。940×590 双人 Stage 1-2 运行轨迹达到最高 22 连击，含 P1 Role、P1/P2 horse4，console warning/error 为 0；详见 `docs/tasks/evidence/TASK-SLICE-212/runtime-audit.md`。

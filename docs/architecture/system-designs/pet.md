# 宠物系统类设计

2026-09-21 TASK-SLICE-224C完成：玄龟全32合同通过完整P1T=0（组合A/B及资源全集），四形态×五关×P1/P2正式消费者、休息/替换、真实失败重试/返回/重载通过。修复TestScene同实例重试世界残留、会话释放后的主人链接引用与根宠弹体残留，删除旧玄龟技能分支。原视觉/碰撞精确例外不扩大。TASK-SLICE-226唯一Ready；猴马时序反证仍待重做，其余五家族与旧入口待闭合，204/VS-067/pet all未完成，功能线Active。交接见 `docs/tasks/evidence/TASK-SLICE-224C/handoff.md`。

2026-09-21原版时序反证（当前结论优先于历史通过记录）：猴/马也经BasePet.myIntelligence按连续timeCount取模决策，PetNormalAttackDecision的决策后1000ms重置无此原版依据。此前P1R/P1H=0只证明旧测试通过；两族完整复现状态降为待重做，公共抽取不是原版正确性证明。TASK-SLICE-226在224C后修正共享时序并扩展黑盒相位门禁；不撤销未受反证的资源与伤害证据，不将当前青龙实现自动视为全细节原版真值。

设计状态：当前有效；`TASK-ARCH-206` 已依据 `TASK-SETTINGS-205` 校正。

验收状态：实施中。

验收退出：未退出。

2026-09-21 公共逻辑局部整理：猴/马 Behavior 组合 `PetNormalAttackDecision`，只共享普攻分支间隔和两次条件随机选择；保留家族概率、技能优先级、释放事件和销毁差异。Registry 仍为唯一工厂，不新增 Runtime/动画时钟/技能CD owner。本批 `pet P1R P1H` 联合门禁=0（10组专项），全系统/build通过，本批通过、系统实施中；不代表玄龟或系统 all 完成。

实施 task：`TASK-ARCH-203/204A` 只完成旧 P1/P1B 骨架；206 校正活动时钟、ordered-first 索敌和死亡生命周期，204B 让对应结构 gate=0。207/208 随后接入猴系证据与正式消费者，但 2026-08-26 用户反证其未消费各形态 `attackRange`。PG-017 V2 先让独立行为 verifier/P1R 稳定失败，208A 再闭合范围外追击→范围内攻击→verified hit→pet-source damage/cleanup；当前 P1R=0，继续逐族推进。

## 目标、事实边界与非目标

- 目标：以一个 `PetCombatRuntime` 管理一名玩家当前出战宠物的一次战斗会话，以 `PetBehavior` 表达 35 形态差异，以 `PetBehaviorRegistry` 唯一解析差异实现，以 `PetCombatTargeting` 复现 ordered-first/1200 索敌。
- 权威事实：`PetInfo` 等价数据继续由 `PetState/PetRoster` 持有；玩家/队伍 owner 持有当前 Runtime；Runtime 只持活动会话状态、目标、活动时钟、动作/死亡阶段和清理句柄。
- 现代组合不复制 AS3 的万能 `BasePet` 深继承；原版可观察顺序和差异钩子必须保留。
- 不在本设计中改存档 schema、成长、背包、功能页视觉、动画真值、玩法数值或 Phaser view。

## 205 审计逐项处置

| 审计项 | 206 处置 | 唯一现代 owner |
| --- | --- | --- |
| roster/持久数值 | 保留 | `PetRoster/PetState`；Runtime 只持引用，不复制数值 |
| 活动实体/owner | 收窄 | 每个 `PlayerSlot` 最多一个 `PetCombatRuntime`；Party/正式公共桥负责创建、替换、离场销毁 |
| 跟随/warp | 保留并增加移动许可 | Runtime 复用纯移动算法；Behavior 的 `canMove` 只回答形态/动作是否允许移动 |
| 技能 CD | 替换 | 新 `tickActivePetSkillState(pet, deltaMs)` 只推进当前活动会话，并且位于本帧动作选择/执行之后 |
| 索敌 | 替换 | `PetCombatTargeting.orderedFirstTarget(origin, orderedTargets, 1200)`；不得提供或调用 `nearestTarget` |
| 上游目标顺序 | 明确输入合同 | 关卡公共敌方 Registry 提供稳定 encounter/insertion 顺序；不得声称其已按距离排序，未来运行证据可改变输入排序但不能改写 BasePet 算法事实 |
| 当前目标 | 扩展为 sticky session state | Runtime 保留目标；目标死亡或距离 `>=1200` 时本帧只清空，下帧才从 ordered 集合重新搜索 |
| 普攻 fallback/攻击态 | 扩展 Behavior 接缝 | Runtime 统一优先级和状态转移；Behavior 的 `basicAttack` 返回形态所需普攻命令/无普攻，不能复制 update 骨架 |
| 自动/被动效果 | 扩展 Behavior 接缝 | `updateEffects` 只处理该活动会话的形态效果；公共 CD/生命周期不下放 |
| 受击触发 | 新增差异钩子 | Runtime 先结算共享 HP/阶段，再调用 `onDamaged` 生成反击/表现命令 |
| 移动许可 | 新增差异钩子 | `canMove` 决定公共跟随步骤能否推进；位置算法仍归 Runtime |
| 动画命中事件 | 新增差异钩子 | View 只回传有类型的动画事件；Runtime 路由 `onAnimationEvent`，伤害/投射物仍由 systems 端口执行 |
| hurt/dead | 替换立即卸载 | Runtime 明确 `alive -> dead-playing -> destroy`；HP 归零只发布 dead 表现命令，不释放会话 |
| 私有召唤物/销毁 | 扩展销毁合同 | Behavior `destroy(reason)` 清理形态私有句柄；Runtime 随后统一清理来源 projectile/effect、发布 view release、活动引用清空；现代实现必须幂等 |
| owner/roster/runtime 双人隔离 | 保留并冻结 | P1/P2 各自 roster 与 Runtime；Registry/只读定义可共享；不得用 Scene 单例或另一份数值状态串联 |

以上没有遗留“与证据冲突”或影响 204B 实施的 owner 未定项。未知项只保留 `orderedTargets` 上游是否在原版运行时另行排序；当前现代合同明确使用稳定 encounter/insertion 顺序并把该未知作为可重开信号。

## 选定组合与模式角色

选定方案仍为“运行时 Context + 差异 Strategy + 唯一 Registry + 纯 Targeting + 窄端口/事件适配”，但 Strategy 不再只是技能选择器。

| 角色 | 目标文件/符号 | 职责 | 禁止职责 |
| --- | --- | --- | --- |
| 活动会话 Context | `PetCombatRuntime` | 同步当前出战项、sticky target、公共更新顺序、`alive/dead-playing`、活动 CD、事件与幂等清理 | Phaser、存档、全 roster tick、形态分支 |
| 差异 Strategy | `PetBehavior` | `canMove`、`basicAttack`、`selectAction/executeAction`、`updateEffects`、`onDamaged`、`onAnimationEvent`、私有 `destroy` | 公共跟随/索敌/时钟/死亡阶段、Scene 引用 |
| Factory Registry | `PetBehaviorRegistry` + default factory | `species + form` 唯一映射并为每次活动会话创建实例 | 单局状态、技能算法、fallback |
| 目标服务 | `PetCombatTargeting` | 存活过滤、距离/朝向、ordered-first/1200 搜索 | nearest、排序、施法和状态修改 |
| 数值/效果端口 | `PetCombatPorts` 等价窄合同 | 调用既有伤害、Projectile、Buff、视图命令，不让 Behavior 直接持有 Scene | 第二份数值、Phaser 对象泄漏进 systems |
| 表现适配器 | 共享 Pet view bridge | 消费 snapshot/command，回传 animation hit/complete/dead-complete | 选择技能、推进 CD、决定死亡释放 |

## 冻结公共调用顺序

每个 `update(frame)` 严格按以下顺序执行：

1. 校验输入，按 `PlayerSlot`/roster 同步当前出战引用；换宠或离场按 `replaced/inactive/runtime-destroyed` 幂等清理旧会话。
2. 消费上一 host tick 入队的 damage/animation 事件。HP 首次归零时转为 `dead-playing` 并发布 dead 动画命令；不得在此处卸载。
3. `dead-playing` 只允许处理动画完成与清理事件，不索敌、不行动、不推进战斗 CD。收到匹配会话的 dead-complete 后，依次执行 Behavior 私有清理、来源 projectile/effect 清理、view release、活动引用清空。
4. `alive` 时先校验 sticky target：死亡或距离 `>=1200` 则只清空并结束本帧索敌；没有旧目标时按输入顺序选择首个存活且距离 `<=1200` 的目标。
5. 根据 `canMove` 推进公共 follow/warp；Runtime 统一动作优先级：受击/强制态、形态技能、普攻 fallback、跟随/idle。Behavior 只返回差异命令。
6. 执行动作，推进当前 Behavior 的活动效果并发布只读 snapshot/command/event。
7. 最后仅调用 `tickActivePetSkillState(activePet, deltaMs)`；未出战 roster 项、`dead-playing` 会话和已销毁会话不推进战斗时钟。

动画命中回调带 `runtimeKey + actionToken + eventName`，Runtime 必须拒绝旧会话/旧动作事件。死亡完成也是同一受控事件，不允许 View 自行删除系统状态。

## 扩展点与禁止路径

| 场景 | 允许扩展 | 必须复用 | 禁止路径 |
| --- | --- | --- | --- |
| 新形态 | 一个 Behavior + Registry 映射 + 纯规则测试 | 全部公共 Runtime 顺序 | 继承万能 BasePet、复制 update |
| 特殊受击/移动 | `onDamaged` / `canMove` | Runtime HP 与移动 owner | Scene 分支、Behavior 改 owner 坐标算法 |
| 动画命中/死亡 | `onAnimationEvent` + typed view event | Runtime action token/phase | View 直接扣血或 hp=0 立即销毁 |
| 私有召唤物 | Behavior 会话句柄 + 窄端口 | Runtime destroy 顺序 | 全局匿名对象、离场遗留 |
| 目标选择 | 上游提交稳定 orderedTargets | `orderedFirstTarget(..., 1200)` | nearest、Behavior/技能私有再选目标 |
| 冷却 | 活动宠物 tick helper | Runtime 帧末调用 | 遍历 roster、选择前递减 |

全局禁止：Scene/Bridge 直接导入 `requestPet*Skill`；Scene 按 species/form 分发；systems 依赖 Phaser；`PetRuntimeSystem` 与新 Runtime 双 owner；barrel 暴露具体技能请求；正式五关只画本体不更新战斗 Runtime。

## 消费者全集与所有权

| 消费者 | owner/输入 | 目标接法 | 批次 |
| --- | --- | --- | --- |
| Monkey/Horse 结构接缝 | Registry 创建会话 Behavior | ordered-first、活动 CD、dead-playing 与差异钩子；不等于真实普通攻击或正式消费者 | 204B（结构完成，玩家可见闭合被反证） |
| Monkey1..4 完整证据 | BasePet/具体类/恢复 SWF/现代消费者全集 | 自主 AI、普通攻击、全部技能、命中/伤害、真动画、owner 与生命周期同一证据链 | 207 |
| Monkey1..4 完整正式复现 | P1/P2 各自 roster/runtime，TestScene 与五关共享桥 | 208 已接入但被 `attackRange` 外虚空攻击反证；PG-017 V2 已可自动反证，208A 负责重验追击→攻击→来源隔离伤害 | 208 历史 + `TASK-SLICE-208A` |
| 其余八家族 | 同一 Registry/Runtime，逐族完整任务 | 猴系语义 P1R 重新为 0 并修订 Skill 后，才一次生成一个家族；不得恢复横向 Behavior/视觉/消费者批次 | 猴系整改后按覆盖缺口生成 |
| barrel、旧 Runtime、全部 Scene/Bridge | 无新增 owner | 全部家族完成后清零具体技能出口、重复 targeting 与兼容路径 | 最终逐族任务之后生成 |
| 未来网络/回放 | 记录 Frame 输入顺序与 typed events | 复用 Runtime，不拥有第二套模拟 | 非本轮实现；本设计冻结接口边界 |

214C2实施映射（未完成）：速度单位由公共移动helper消费每实体moveSpeed与Frame.hostFps。可选PetAnimationClock由EntitySession持有，Behavior factory只提供verified定义；时钟驱动的会话按host tick执行既有公共步骤，产生同步typed事件并提供只读动画snapshot。旧猴马适配尚未切换此时钟。PetDragonAnimationClock仅构造初阶定义；纯时钟/接缝测试不代表dragon1生产Behavior或正式画面已完成。

## 迁移 gate 与真实基线

214C1 实现映射：`PetCombatRuntime` 仍是每slot唯一顶层owner；其内部 `PetCombatEntitySession` 统一执行主实体/私有实体的公共步骤，`PetCombatContext` 适配窄端口。主实体引用roster数值，私有召唤物采用隔离的临时数值引用，不写存档。Behavior只持句柄并请求创建/释放，不持另一套公共AI/CD。祖先死亡时子实体只消费事件/清理，不继续AI/CD；这属于现代事件路由，不是青龙完整复现结论。

| Gate | 任务 | 通过合同 | 2026-08-25 基线 |
| --- | --- | --- | --- |
| P1T | 224C | 玄龟全32合同；完整组合P1TB/P1TA/P1TA0及五关生命周期 | `0`：20组双owner、7生命周期变异、20组实战图层与5关真实重试/返回/重载；系统实施中/未退出 |
| P1TB | 224B | SYBH/奥义/受伤及伤害13责任，组合完整P1TA | `0`：60技能组、1,744原生caller、16生产变异及20组双场景；P1T/all仍未完成 |
| P1TA | 224A3/父224A | 父17责任，组合P1TA1/P1TA0与4项链接结算/双owner显示 | `0`：144原生数值、2,904原生buff态、9链接变异及双场景生产结算/视觉；P1TB/P1T/all仍未完成 |
| P1TA1 | 224A2 | 玄龟四形态公共行为、普攻/SLD共13责任；组合P1TA0 | `0`：13责任、332原生caller、15,768世界碰撞、6实现变异、双场景实战及既有家族回归；A3/B/C和P1TA/P1T/all仍未完成 |
| P1TA0 | 224A1 | 玄龟六包/650文件的生产加载、原生逐态只读投影与碰撞位平面消费 | `0`：11,572态、157,704原生case、9类实现变异和真实浏览器；不核销A的17项或整族32行为合同 |
| P1 | 204B | ordered-first/1200、sticky target、选择后活动 CD、`alive/dead-playing`、typed animation completion、完整 Behavior 钩子 | `0`：结构 gate 已通过；不证明 Scene/正式消费者或玩家可见自主战斗 |
| P1G | 214E | 青龙四形态完整44合同、真实分身/继承技能/奥义、source伤害治疗、五关/TestScene P1/P2及345态投影 | `0`：64组trace、60组消费者、20实现变异和正式运行通过；其余六族/旧入口未闭合，系统实施中/未退出 |
| P1GD | 214D | 二三阶normal/fs/sdcc/九对象ltwj、逐帧批准碰撞采样、P1/P2真实伤害治疗/清理与174态投影 | `0`：9实现变异、5视觉变异、6448原版case、12消费者组及浏览器通过；四阶/P1G/all未完成 |
| P1GC | 214C5 | 初阶dragon1正式/TestScene真实战斗、同源本体/分身/弹体投影与生命周期，72原版状态逐像素及生产trace | `0`：P1GS、真实行为/14变异、生产消费者、4视觉变异、正式双人重试/返回；其余形态及all未完成 |
| P1GS | 214C1 | 单顶层Runtime内主/子复用公共步骤；数值/目标/token/来源隔离、旧key拒绝、子事件、失败创建回滚与级联清理；保持猴马全部既有门禁 | `0`：P1/P1B/P1R/P1H、私有会话合同与10类实现mutation通过；只证明接缝，P1GC/P1G仍待214C2/214E |
| P1B | 204B | Monkey/Horse 8 形态适配结构钩子且不复制 Runtime | `0`：结构 gate 已通过；`basicAttack` 仍可能只有事件，不证明动画、命中与伤害闭环 |
| P1R | 208 历史 + PG-017 V2 + `TASK-SLICE-208A`（207 提供冻结机器合同） | Monkey1..4 完整自主战斗；每形态 `attackRange` 外追击、范围内真实普通攻击/全部技能、真动画、命中/来源隔离伤害、P1/P2 TestScene/五关 owner 与生命周期 | `0`：八条范围链、字段覆盖、range/hit/source mutation-kill、家族专项、正式五关旅程均通过；系统仍因其余家族与旧入口保持实施中 |
| P1H | 209/210 | Horse1..4 完整自主战斗；范围外追击、双随机普攻、全部继承技能、冰效/tmaoyi 组合、真实命中伤害、P1/P2 TestScene/五关 owner 与生命周期 | `0`：43 项字段覆盖、八条 P1/P2 范围链、range/hit/source mutation-kill、马系/动画/正式五关旅程及 940×590 双人 Stage 1-2 通过；系统仍因其余七家族与旧入口保持实施中 |
| P1C/P1D | 208 后逐族生成 | 其余家族不得只登记 Behavior；每个家族都复用完整证据→正式运行合同 | `1`：其余家族未完整闭合；旧 204C/204D 撤销 |
| P2/P3 | 208 后逐族推进 | TestScene、五关和功能页消费者随每个家族同批闭合，不再最后集中迁移 | `1`：当前无新 Runtime 正式消费者；旧 204E/204F 撤销 |
| P4/all | 全部家族完成后生成 | Scene/barrel/旧 Runtime/重复 helper 清零并执行全部正式回归 | `1`：兼容入口仍存在 |

门禁命令：`npm run check:system-design -- pet <gate>`。设计阶段允许非 0；失败必须只对应表中未实施项。`tools/pet-combat-runtime-design-tests.ts` 同时拒绝 nearest、全 roster/选择前 CD、HP0 立即卸载和缺失差异钩子。2026-08-27 起，P1R 已强制执行 207 字段覆盖、黑盒 range trace 与 mutation-kill；只有该语义入口和正式路径同时为绿才可宣布闭合。

## 实施与退出合同

- 204B 只证明公共结构接缝；用户反证后不得再把它描述为猴马玩家可见完整闭合。
- 207/208 必须连续完成猴系完整证据与正式复现；208 之前不得切换宠物家族或更新/强制使用 `$pet-family-reverse`。
- 208 的历史执行结果已被虚空攻击反证；只有 PG-017 V2 和猴系整改让语义 P1R 重新为 0 后，才可修订 Skill 并为一个家族生成完整连续任务；不得恢复旧 204C..G 或 193E..R 的横向批处理。
- 每批重复读取本设计与验收协议，运行声明 gate；退出码非 0 时该批不得完成。
- `P1/P1B/P1R`、后续逐族 gate 与最终 `P4/all` 全为 0、全部消费者与兼容路径清零后，最终任务同批将本文标记“已完成/已退出”。退出后普通宠物任务不再读取专项设计验收，除非用户明确重开。

## 验收批次记录

| 日期/Task | 范围 | 结果 | 结论 |
| --- | --- | --- | --- |
| 2026-09-05 / 214C1 | 私有实体公共接缝 | P1GS=0，P1/P1B/P1R/P1H=0，10类mutation-kill、正式五关旅程、全系统/build/LSP通过 | 本批通过，系统实施中；没有青龙Behavior/正式视觉/伤害治疗完成结论，214C2继续P1GC |
| 2026-08-24 / 203 | 旧 P1 骨架 | 当时 gate 0 | 205 后降级：只证明类存在，不证明新合同 |
| 2026-08-25 / 204A | 旧 P1B Monkey/Horse | 当时 gate 0 | 205 后降级：复用了既有规则，但时钟/索敌/死亡与钩子合同不成立 |
| 2026-08-25 / 206 | 设计证据校正 | `pet P1/P1B/P1C/P1D/P2/P3/P4/all` 均为 1（真实失败基线） | 唯一设计已冻结；从 204B 开始实施 |
| 2026-08-25 / 204B | 公共 Runtime + Monkey/Horse 结构接缝 | `pet P1=0`、`pet P1B=0`；专项合同、全系统、build、LSP 通过 | 仅结构通过；用户运行看不到自主攻击，玩家可见/正式消费者结论降级，禁止据此扩族 |
| 2026-08-25 / 用户反证重排 | 完整家族与 Skill 成熟度 | LSP 仅找到 Runtime 声明；`basicAttack` 只发事件；旧 204C..G/193E..R 横向批次已撤销 | 新增 P1R；207/208 先完整闭合猴系，Skill 仅在 208 通过后重写 |
| 2026-08-26 / 208 | Monkey1..4 完整正式复现 | `pet P1R=0`；家族专项、全系统、build、正式 P1/P2 940×590 与零 console 通过 | 首个完整参考家族成立；设计继续实施中，209 起以马系验证 Skill，其他 gate 仍保持 1 |
| 2026-08-26 / 用户虚空攻击反证 | Monkey1..4 攻击距离/追击与 verifier 独立性 | 207 manifest/BasePet 含 `attackRange`，Runtime 只跟 owner且普攻无范围门；测试把敌人放到 projectile 坐标，旧 P1R 仍返回 0 | 覆盖上一行的现行结论：首个完整参考家族不成立，P1R=1；PG-017 V2/猴系整改先行，209 暂停 |
| 2026-08-27 / PG-017 V2 | P1R 独立行为语义 gate | verifier 自测=0；真实四形态 × P1/P2 range trace 与 `pet P1R`=1，逐项报告 `EARLY_ATTACK/NO_CHASE/NO_IN_RANGE`；未修改玩法 | 本批不通过且失败精确对应存量缺口；门禁已不再假绿，唯一 Ready `TASK-SLICE-208A` 负责整改 |
| 2026-08-27 / 208A | Monkey1..4 行为语义整改 | `test:behavior-contract-verifier=0`、八条 P1/P2 range trace=0、`pet P1R=0`、家族/五关/全系统/build 均通过 | 本批通过，系统实施中；Skill 已修订，剩余为马系及其余家族、最终旧入口清零与 all gate |
| 2026-08-31 / 210 | Horse1..4 完整正式复现 | `test:pet-horse-behavior-contract=0`、八条 P1/P2 range trace=0、`pet P1H=0`、马系/动画/五关/全系统/build 均通过；940×590 双人 Stage 1-2 零 console | 第二家族通过；Formal horse body 改由 combat snapshot/action token 驱动，真实 projectile 进入共享 Stage1 HP decrease，设计继续实施中 |

## 反证与重开

- 若原版运行证据证明 `gc.obbsiteArray` 在全部适用关卡具有另一稳定排序，只更新上游 orderedTargets 适配，不把 Targeting 改名为 nearest。
- 若某族真值证明死亡不等 frame-over、存在独立 warp label 或不走公共受击链，只在该 Behavior 钩子中记录例外，不推翻公共默认合同。
- 若实施发现新正式消费者或新 owner，当前批停止并拆同线解除 task，不把逻辑塞回 Scene。

2026-09-05 TASK-SLICE-214C3批次：P1GS=0，本批公共移动通过、系统仍实施中/未退出。PetBehavior新增可选ground事实；Session保持唯一host调度与方向/速度owner，场景仅传217环境。源时序精化：ground路径AI/动作→效果/子会话/CD/计数→warp→动画完成→速度/碰撞/积分/重力，旧猴马路径及gate回归不变。pet-ground-session-tests在20/24/30fps与实际正式updatePets闭包验证本批；freeze来源、精度与C4/C5剩余项见 docs/tasks/evidence/TASK-SLICE-214C3/handoff.md。未运行P1GC或all，不提升完整青龙/系统退出。

2026-09-06 TASK-SLICE-214C4批次：P1GS=0，独立dragon1 Behavior与公共Runtime/Session实现真实normal/fs/expiry-heal；源碰撞861项、P1/P2生产接线和14类变异通过。新增窄端口由Session持有数值/CD/朝向，场景只传Combat与mask；完整证据见 docs/tasks/evidence/TASK-SLICE-214C4/handoff.md。系统仍实施中/未退出，C5继续正式/TestScene/全生命周期与P1GC，未执行all或宣称完整家族通过。

2026-09-13 / 214C5：本批P1GC=0，P1GS保持0；生产presenter不持时钟或技能owner，Monster30适配不持第二HP。72态原版对账、P1/P2实际伤害与分身、rest/replacement/teardown及正式重试/返回通过。初阶父C2/C归档，设计继续实施中/未退出；214D/214E和其他家族/旧入口仍未完成。见214C5/handoff.md。

2026-09-13 / 214D预检：四效果原版碰撞采样缺口由219补证，214D保持Blocked，P1GD未实施/未通过；本次未修改设计或src。P1GC既有结论不变，系统仍实施中/未退出。

2026-09-13 / 219交接：源空间事实已verified，用户批准四效果有记录的碰撞近似（6,448例零命中差异、104像素差异），214D恢复Ready。近似不改变设计角色/所有权或生命周期；P1GD仍未实施/未通过，后续不得用219输入验证替代正式战斗验收。

2026-09-13 / 214D实施映射：Dragon1PetBehavior按form1/2/3复用公共继承行为；PetDragon23ProjectileSystem只持私有效果/波次，PetDragonEffectCollisionSystem只消费219有限相位近似。PetGroundSessionMovement消费可选动作速度事实，不复制移动算法；同一Registry、EntitySession和presenter承接正式/TestScene。P1GD=0，本批通过，系统实施中/未退出；剩余四阶及全家族由214E承接。

2026-09-14 / 214E：Dragon4PetBehavior复用既有公共Session；新增可选initialAction、enterEvent/多hit、动作enter速度事实，不增第二移动/目标/CD owner。PetDragon23ProjectileSystem承接四阶trigger/AoyiBuff，PetDragonEffectCollisionSystem分别消费219批准近似及220 verified输入。P1G=0，44合同及正式双人可见伤害/生命周期通过；系统仍实施中/未退出，未执行all。见214E/handoff.md。

2026-09-18 / 224A1：P1TA0=0，本批生产资源消费通过。PetTurtleAssets/CollisionAssets属于内容查询，既有AssetBundleCoordinator为唯一加载owner；SceneAssetBundleBridge等待解码后发布ready，PetTurtlePresentationBridge只接state/owner/viewport快照，无AI/HP/CD或第二时钟。11,572原生RGBA及真实WebGL显示、61,424相位、157,704case、9实现变异通过。正式Behavior/17责任/P1TA及32合同/P1T仍由A2/A3/B/C完成；设计继续实施中/未退出，未执行all。见224A1/handoff.md及tools/turtle-runtime/README.md。

2026-09-20 / 224A2：P1TA1=0，本批通过、系统实施中/未退出。行为与投影消费同一公共owner及版本化资源，未来TXLJ/SYBH/奥义显式deferred，不假成功。HeroParty接线及TestScene重启视图清理通过；父A剩余4项交A3，完整P1T/all未执行。证据见224A2/handoff.md。

2026-09-20 / 224A3及父A：P1TA=0，本批通过、系统实施中/未退出。HeroCombat和EntitySession分别持有自身瞬态buff，Party只适配实际owner及只读显示，原盾后HP结算消费同一pet session；不新增平行Runtime/HP/CD/目标。A全部17责任同次联合核销；B/C其余15项、全32项/五关、其余六族及旧入口清零仍待。见224A3/handoff.md及tools/turtle-runtime/README.md。

2026-09-20 / 224B：P1TB=0，系统继续实施中/未退出。Behavior只持效果句柄及由宿主tick驱动的奥义回调进度；公共Session仍独占本体时钟、目标、HP、CD和移动，增加可选转向/运动抑制、击退、受击目标与死亡寿命策略，旧家族默认不变。Party原入站resolver承接TestScene真实怪物几何；英雄旧QLFJ入口排除玄龟。A17+B13通过不等于全32：C继续两项生命周期、五关/全族联合与旧路径清理，其余六族/最终all仍待。见224B/handoff.md。

2026-09-21 / 224C：本批通过，系统实施中/未退出。P1T=0完整重验原资源/行为/碰撞、全部32合同与正式五关双owner；同一EntitySession释放源弹体及双向链接，TestScene在SHUTDOWN后重建世界数据，不新增时钟/目标/HP/CD或显示owner。下一批226修复猴马原版相位反证；剩余五家族及最终兼容入口仍待，未运行或宣称all=0。详见224C交接。

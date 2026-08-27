# 宠物系统类设计

设计状态：当前有效；`TASK-ARCH-206` 已依据 `TASK-SETTINGS-205` 校正。

验收状态：实施中。

验收退出：未退出。

实施 task：`TASK-ARCH-203/204A` 只完成旧 P1/P1B 骨架；206 校正活动时钟、ordered-first 索敌和死亡生命周期，204B 让对应结构 gate=0。207/208 随后接入猴系证据与正式消费者，但 2026-08-26 用户再次反证：Runtime 未按各形态 `attackRange` 追击目标，普攻会在距离外虚空播放。2026-08-27 PG-017 V2 已让独立行为 verifier/P1R 对该错误稳定返回 1；当前由 `TASK-SLICE-208A` 整改猴系，再逐族推进。

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

## 迁移 gate 与真实基线

| Gate | 任务 | 通过合同 | 2026-08-25 基线 |
| --- | --- | --- | --- |
| P1 | 204B | ordered-first/1200、sticky target、选择后活动 CD、`alive/dead-playing`、typed animation completion、完整 Behavior 钩子 | `0`：结构 gate 已通过；不证明 Scene/正式消费者或玩家可见自主战斗 |
| P1B | 204B | Monkey/Horse 8 形态适配结构钩子且不复制 Runtime | `0`：结构 gate 已通过；`basicAttack` 仍可能只有事件，不证明动画、命中与伤害闭环 |
| P1R | 208 历史 + PG-017 V2 + `TASK-SLICE-208A`（207 提供冻结机器合同） | Monkey1..4 完整自主战斗；每形态 `attackRange` 外追击、范围内真实普通攻击/全部技能、真动画、命中/来源隔离伤害、P1/P2 TestScene/五关 owner 与生命周期 | `1`：新行为语义 verifier 已接入 gate，当前 8/8 范围链稳定报告提前攻击、不追击、不入围；208A 修复前正确保持非 0 |
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
| 2026-08-24 / 203 | 旧 P1 骨架 | 当时 gate 0 | 205 后降级：只证明类存在，不证明新合同 |
| 2026-08-25 / 204A | 旧 P1B Monkey/Horse | 当时 gate 0 | 205 后降级：复用了既有规则，但时钟/索敌/死亡与钩子合同不成立 |
| 2026-08-25 / 206 | 设计证据校正 | `pet P1/P1B/P1C/P1D/P2/P3/P4/all` 均为 1（真实失败基线） | 唯一设计已冻结；从 204B 开始实施 |
| 2026-08-25 / 204B | 公共 Runtime + Monkey/Horse 结构接缝 | `pet P1=0`、`pet P1B=0`；专项合同、全系统、build、LSP 通过 | 仅结构通过；用户运行看不到自主攻击，玩家可见/正式消费者结论降级，禁止据此扩族 |
| 2026-08-25 / 用户反证重排 | 完整家族与 Skill 成熟度 | LSP 仅找到 Runtime 声明；`basicAttack` 只发事件；旧 204C..G/193E..R 横向批次已撤销 | 新增 P1R；207/208 先完整闭合猴系，Skill 仅在 208 通过后重写 |
| 2026-08-26 / 208 | Monkey1..4 完整正式复现 | `pet P1R=0`；家族专项、全系统、build、正式 P1/P2 940×590 与零 console 通过 | 首个完整参考家族成立；设计继续实施中，209 起以马系验证 Skill，其他 gate 仍保持 1 |
| 2026-08-26 / 用户虚空攻击反证 | Monkey1..4 攻击距离/追击与 verifier 独立性 | 207 manifest/BasePet 含 `attackRange`，Runtime 只跟 owner且普攻无范围门；测试把敌人放到 projectile 坐标，旧 P1R 仍返回 0 | 覆盖上一行的现行结论：首个完整参考家族不成立，P1R=1；PG-017 V2/猴系整改先行，209 暂停 |
| 2026-08-27 / PG-017 V2 | P1R 独立行为语义 gate | verifier 自测=0；真实四形态 × P1/P2 range trace 与 `pet P1R`=1，逐项报告 `EARLY_ATTACK/NO_CHASE/NO_IN_RANGE`；未修改玩法 | 本批不通过且失败精确对应存量缺口；门禁已不再假绿，唯一 Ready `TASK-SLICE-208A` 负责整改 |

## 反证与重开

- 若原版运行证据证明 `gc.obbsiteArray` 在全部适用关卡具有另一稳定排序，只更新上游 orderedTargets 适配，不把 Targeting 改名为 nearest。
- 若某族真值证明死亡不等 frame-over、存在独立 warp label 或不走公共受击链，只在该 Behavior 钩子中记录例外，不推翻公共默认合同。
- 若实施发现新正式消费者或新 owner，当前批停止并拆同线解除 task，不把逻辑塞回 Scene。

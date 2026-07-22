# Stage 1 战斗可读性与通关校准合同

本文是 `TASK-SETTINGS-054` 的落盘证据，范围只覆盖 Stage 1-1/1-2/1-3 的死亡原因、主要攻击时序、受击保护、数值与续航。它为 `TASK-SLICE-130` 提供实现输入，不把现代可玩性目标冒充为原版事实。

## 1. 待证明问题与结论

| 问题 | 结论 | 分级 |
| --- | --- | --- |
| “容易死亡”是否来自单一怪物常量过高 | 否。现代三关使用两套互不兼容的战斗模型；1-2 还允许多怪同帧叠加接触伤害，是可重复的瞬间死亡路径 | 交叉确认 |
| 原版是否只有接触伤害 | 否。怪物进入 `hit*` 动作，在指定动画帧创建带独立碰撞/伤害语义的 bullet；玩家命中后有扣血、受击动作、音效/特效和保护条 | 确认事实 |
| 原版玩家是否有固定的每次受击无敌 | 未发现“每次命中固定 480/700ms 无敌”的证据；确认存在受击条累计超过 19 后的 `3 * frameClips` 保护，以及特定装备/状态保护 | 确认事实（保护条）/ 未知（逐次无敌） |
| Stage 1-1 最低通关目标是什么 | 默认 1P Role1、1 级、无调试生成/无敌/秒杀能力，可以完成四批小怪和巫鹰；允许使用正常掉落、技能与关卡移动 | 现代设计选择 |
| 1-2/1-3 是否应直接调成同样简单 | 否。先统一伤害模型和可读反馈，再记录 TTK、承伤来源和失败分布；没有证据支持把两关整体降难 | 现代设计选择 |

## 2. 六段证据链

### 2.1 关卡与对象局部证据

- `Monster30.as`：150 HP、物防 3、普攻率 0.5、`hit1` 物理威力 15；动作第 0 帧累计到 10 时创建 `Monster30Bullet1`。
- `Monster3.as`：Stage 1-1 为 boss，926 HP、物防 5；`hit1` 物理 40，动作第 3 帧累计到 1 时创建 `Monster3Bullet1`；`hit2` 魔法 18，技能距离小于 200，动作第 3 帧累计到 26 时创建 `Monster3Bullet2`。
- `Monster2/4.as`：Stage 1-2 双 boss 分别为 1500/1481 HP；主要攻击威力分别为 29/28 与 49/42，攻击效果在动作中段生成。
- `Monster7/8.as`：200/300 HP；近战物理均为 18，技能魔法为 11/4。
- `Monster5.as`：Stage 1-3 boss 为 2788 HP，物防 14，普通攻击率 0.8；`hit1` 物理 147，`hit2/3` 魔法 26。
- `Role1.as`：1 级裸装基础 HP 80、MP 50、攻击 10、物防 2；普攻 `hit1..3` 原始伤害为 `int(2.0875 * hurt)`，`hit4` 为 `int(2.155 * hurt)`，`hit5` 为 `int(2.5 * hurt)`；地面连段每段设置 `timers = 9` 并创建独立攻击 ID。

### 2.2 共享运行时调用链

- 怪物攻击玩家：怪物 `enterFrameFunc()` 创建 bullet → `BaseHero` 命中路径读取 `BaseMonster.getRealPower(action).hurt` → `countHurt()` 按物防/魔防修正 → `BaseHero.reduceHp()` 扣血并显示受伤数字，非零伤害可切 `hurt`。
- 玩家攻击怪物：`Role1.normalHit()` 切动作并创建 attack ID → 对应 `Role1Bullet*` 命中 → `Role1.getRealPower()` 得到原始伤害 → `BaseMonster.getRealHurt()` 按物防/魔防修正 → `BaseMonster.reduceHp()` 扣血并进入 `hurt/dead`。
- 原版物理承伤下限为 1：怪物威力大于玩家总物防时做减法，否则为 1。玩家物理伤怪按 `(atk - def) / atk` 缩放，并限制到 `1` 或最多 1.1 倍。
- `BaseHero.beAttackDoing()` 累计受击条；超过 19 时设置约 3 秒保护并清空。`BaseHero.addBeAttackEffect()` 创建 `HeroBeHurt`，角色还播放受击音效。
- `BaseMonster.dropAura()` 在非 Stage 98 死亡时调用 `addMedicine()`；后者存在随机小 HP、大 HP 或小 MP 掉落。现代 `DropSystem` 已定义 25%/50% HP 和 25% MP 恢复，但 Stage 1-2/1-3 gameplay bridge 没有接入这条续航链。

### 2.3 SWF 几何与坐标语义

- Role1 的 `Role1Bullet1/3/4/5` 已从恢复包 `assets/WuKong.swf` 定位并选择性派生；资源标注确认 `Role1Bullet1` 为 8 帧跟随型附属对象，现代 manifest 已接入。
- 怪物本体在 AS3 中使用明确画布与偏移：Monster2/4 为 190×190，Monster3 为 180×180 且偏移 `(20,-5)`，Monster5 为 350×350 且偏移 `(30,-55)`，Monster7/8/30 为 150×150；bullet 的世界生成偏移在各 `doHit*()` 中明确。
- Stage 1-2/1-3 现代 bridge 当前把怪物显示为半径 15–36 的圆，并只比较 X 距离 42/46；这不是原版 MovieClip、碰撞盒或 bullet 的几何等价物。
- 恢复语料库已窄查：`Role1Effect.swf` 与 Role1 真资源可定位；`Monster30/Monster30Bullet1` 标注仍为 `source-corpus-ready + locate-symbol`，尚无可引用的精确恢复包 character id。故本任务不声称怪物攻击像素范围已闭合；`TASK-SLICE-130` 若未完成精确定位，只能把现代预警/碰撞定义标记为现代选择。

### 2.4 可观察行为合同

1. 敌方伤害必须来自有身份的攻击实例，而不是身体接触本身；攻击至少经历 `windup → active → recovery`，伤害只能在 active 窗口发生，同一攻击实例对同一玩家至多结算一次。
2. 伤害前必须有可识别的动作或预警；命中后必须有玩家闪色/受击动作、伤害记录和击退/保护反馈。玩家不能在看不到攻击来源的同一帧被多只怪直接清空。
3. P1/P2 分别持有 HP、保护状态和最近承伤记录；双人失败继续沿用全员死亡后 2.5 秒门禁。
4. 怪物 HP、玩家基础属性和攻防公式必须由共享战斗配置消费；关卡 flow 只决定敌人类型、数量、出生和门禁，不再私有一套“心数/接触伤害”。
5. 普通怪物死亡的恢复品是续航输入，不保证每次掉落；升级回满 HP/MP 是原版确认事实。现代首轮校准允许正常掉落与升级，不允许调试生成。

### 2.5 现代实现映射

| 合同 | 当前 owner | `TASK-SLICE-130` 映射 |
| --- | --- | --- |
| 玩家 HP/受击/保护 | `HeroCombatSystem.ts` | 保留单一 owner；明确每次受击保护是现代选择，补死亡原因分类 |
| 普攻窗口/攻击 ID | `HeroNormalAttackSystem.ts`、`CombatSystem.ts` | 复用现有一次命中和 Role1 真效果，不在关卡 bridge 重造 |
| Monster30/Monster3 攻击 | `Monster30System.ts`、`Monster3System.ts` | 作为共享怪物攻击状态机基线，补预警/active/recovery 可见性 |
| 1-2/1-3 战斗 | `Stage12GameplayBridge.ts`、`Stage13GameplayBridge.ts` | 移除私有 HP/接触伤害规则，改接共享 combat adapter；flow/layout 保持不变 |
| 续航 | `DropSystem.ts`、`LevelSystem.ts` | 只接正常击杀掉落与升级回满，不添加无证据自动回血 |
| 记录与回归 | 新增独立 Stage 1 combat audit 测试/记录 | 输出确定性指标与人工试玩表，不靠最终截图判断 |

### 2.6 双重验证计划

确定性自动验证：

- 同一 `attackId + targetId` 只扣一次；保护期内攻击不扣血；保护结束后下一独立攻击可扣血。
- 1-2 构造 6 只敌人同帧进入范围：不得出现同帧 5 点归零；每次伤害必须可追溯到攻击动作和 source id。
- 三关 enemy type → HP/攻击配置只从一个 registry 读取；关卡 bridge 不再声明 `hp: 5/8`、`playerAttackDamage = 500` 或直接 `target.hp -= 1`。
- Role1 1 级固定种子遭遇记录小怪/巫鹰 TTK、承伤次数、恢复量和死亡来源；随机攻击与掉落使用可注入随机源。

运行时人工验证：

- 1-1 完整流程至少 3 次；1-2/1-3 每个停点各观察一次代表遭遇，并完成 boss 攻击预警、命中、受击和保护恢复观察。
- 1P 与 2P 各验证一次：记录谁被哪类攻击命中、是否看见前摇、同帧承伤数、HP 变化、是否因掉落/升级恢复。
- 检查镜头滚动、持键攻击、上下平台和群怪包围时的实际可读性；自动测试不能替代这部分。

## 3. 现代确定性基线与死亡分类

### 3.1 当前基线

| 关卡 | 当前玩家生命 | 当前敌方伤害 | 保护/节流 | 可重复结论 |
| --- | --- | --- | --- | --- |
| 1-1 | 1 级 Role1 为 80 HP | Monster30 15；巫鹰 40/55（现代 hit2） | `HeroCombat` 每次有效受击后 480ms | 5 次 Monster30 普攻后剩 5 HP，第 6 次死亡；巫鹰 hit1 两次后死亡。现代侧未扣物防，且 hit2 55 高于原版 18 |
| 1-2 | 5 心 | 任意敌人接触均 -1 | 每个敌人各 900ms，无玩家级保护 | 5 个敌人同帧接触可立即死亡；数量越多，瞬时承伤无上限，这是首要死亡根因 |
| 1-3 | 8 心 | 任意敌人接触均 -1 | 玩家全局 700ms + 每怪 900ms | 理论最快约 4.9 秒内承受 8 次后死亡；boss 与小怪伤害完全相同，攻击动作不可读 |

注：1-1 的 Role1 普攻现代固定为 30/30/31/32/34，未按角色攻击、怪物防御计算；1-2/1-3 玩家攻击固定 500，因此普通怪多为一击、boss 约 3–6 击。它们只能作为“当前实现审计”，不能标成原版难度。

### 3.2 死亡原因枚举

每次死亡必须归入以下一种主因，并可附次因：

- `burst-same-frame`：同一更新帧来自多个 source 的伤害累计致死。
- `untelegraphed-contact`：没有攻击动作/active 窗口，仅接触致死。
- `boss-physical` / `boss-magic`：boss 明确攻击致死，记录 action 与伤害。
- `attrition-no-sustain`：多个可读攻击长期累积，期间没有可用恢复。
- `movement-trap`：镜头/平台/停点锁定导致无法脱离攻击范围。
- `input-readability`：攻击已发生但按键、特效、朝向或命中反馈无法辨识。
- `unknown`：证据不足；必须附录像时间点和最后 10 个伤害事件，不得直接归为“太难”。

## 4. 难度目标、指标与反证

### Stage 1-1 最低目标

- 默认 1P Role1、1 级、无调试能力，三次完整流程中至少两次通关；失败必须有完整伤害日志。
- 普通攻击与巫鹰 `hit1/hit2` 在伤害前可辨认；玩家从满血被击杀不得由单帧多 source 爆发完成。
- 不要求无伤，不保证每次掉药；正常掉落与升级回满可以计入通关。

反证：若稳定通关只能依赖调试掉药、敌人不攻击、固定站位卡 AI 或未实现的无敌，则不满足目标。

### Stage 1-2/1-3 观察指标

- 每停点：战斗时长、生成/同时存活数、玩家命中数、承伤次数、同帧最大 source 数、恢复量、死亡主因。
- boss：第一次可识别前摇到 active 的时间、攻击命中率、单次伤害占最大 HP 比例、击杀所需有效命中数。
- 目标不是“必过”：先要求 `burst-same-frame` 和 `untelegraphed-contact` 为 0，再依据用户试玩决定 TTK/伤害校准。

反证：如果降低伤害后仍主要死于不可见攻击/移动锁死，说明问题不是数值；如果攻击可读且恢复可达但无操作也能稳定通关，则校准过度。

## 5. 人工试玩记录模板

```text
版本/提交：
关卡/玩家数/角色/等级：
是否使用调试能力：否（必须）
结果/总时长：
停点或 boss：
敌人类型/同时存活峰值：
玩家有效命中/敌人有效命中：
同一帧最大伤害 source 数：
恢复：HP 掉落__ / MP 掉落__ / 升级回满__
死亡主因：burst-same-frame | untelegraphed-contact | boss-physical |
          boss-magic | attrition-no-sustain | movement-trap |
          input-readability | unknown
最后 10 个伤害事件（time/source/action/amount/hpBefore/hpAfter）：
攻击前摇是否可识别、命中/受击反馈是否可见：
录像/截图时间点与备注：
```

## 6. `TASK-SLICE-130` 收缩合同

必须做：

1. 建立 Stage 1 共用 combat adapter/配置所有权，把 1-2/1-3 的私有心数、固定 500 攻击与接触扣血迁出 bridge。
2. 优先复用 `HeroCombat`、`CombatSystem` 和现有怪物状态机；新增 enemy type adapter 时保留 `windup/active/recovery`、attack id、伤害类型和来源。
3. 接入可见的敌方前摇/active/命中/玩家受击反馈。精确怪物符号未定位时显式标注现代预警表现，不伪称原版几何。
4. 把数值集中为可测试配置；先消除模型分裂和同帧爆发，再按本文指标校准。
5. 增加确定性 Stage 1 战斗审计测试和运行记录；完成至少 1-1 全流程与 1-2/1-3 代表遭遇人工验收。

禁止做：

- 不移除怪物攻击或失败条件；不把所有敌人统一成 Monster30；不为通关添加自动回血、无证据复活或调试掉落。
- 不修改关卡布局、波次数量、门禁、存档或 Stage 2-1。
- 不把 1-2/1-3 当前圆形接触范围、1 心伤害或 500 攻击写成原版事实。

## 7. 未知项与后续搜索

- `未知`：Monster2/3/4/5/7/8/30 与其 bullet 在恢复语料库中的精确源包、character id、显示边界和嵌套矩阵。Slice 130 只要使用现代预警/碰撞即可推进，但真资源接入前不得宣称视觉复现完成。
- `未知`：原版每次普通受击是否还有独立于保护条的短无敌窗口；当前证据只确认 attack id/interval 去重和保护条满后的 3 秒保护。
- `推断`：原版 `frameClips` 是每秒帧数基准；本文只保留相对帧合同，不在证据不足时把所有帧换成固定毫秒。
- `现代设计选择`：Stage 1-1 的 2/3 稳定通关门槛与 1-2/1-3 先消除不可读死亡的分阶段目标。

这些未知不阻塞“统一现代战斗模型并建立可读反馈”，但会阻止使用“像素级原版范围”“原版逐次无敌时长”等结论。

## 8. TASK-SLICE-130 实现与试玩记录（已完成）

实现快照：

- `Stage1CombatSystem.ts` 成为 enemy type 2/3/4/5/7/8/30 的 HP、物防、移动、主攻击威力和现代窗口单一 owner；Stage 1-1 的 `Monster30/Monster3` 与 1-2/1-3 flow/bridge 均消费该注册表。
- 1-2/1-3 已移除 5/8 心、固定 500 玩家攻击、`contactCooldownMs` 和直接接触扣血；三关统一复用 Role1 普攻窗口、`HeroCombat`、`HitRegistry` 和 `DamageEvent`，Stage 1 保护窗口按已知 3 秒证据上限统一为 3000ms。
- Stage 1-1 的玩家/Monster30/Monster3 伤害也统一消费共享物防公式；Monster30 现代可读前摇为 420ms，非停点周期刷新间隔从 6 秒校准为 10 秒，波次数量未变。
- Stage 1-1 非停点刷新在场上仍有 Monster30 时暂停并重置 10 秒间隔，清场后才重新计时；活动停点不会因玩家被击落而丢失，四个停点全部清空后才开放巫鹰，巫鹰和传送门碰撞边界也按实际平台几何完成可达性校正。
- Role1 二段跳初速度校准为 `-1300`，覆盖 Stage 1-1 最大连续平台落差；该项是现代运行时可达性修正，不冒充原版数值。
- `InputSystem` 对动作键与方向键消费 `keydown` 缓冲，避免两帧之间的短按丢失；持键语义保持不变。
- 怪物圆形占位在 windup 显示黄色 `!`、active 显示红色 `*`、受击显示白色；这是 `现代设计选择`，不表示怪物真素材或原版几何已恢复。

确定性验证：

- 六只 Monster30 同帧进入 active 时，只有一个 source 成功结算，`maxSourcesInSameFrame = 1`；保护结束后的下一独立 attack id 可再次结算。
- 接触只会启动 windup，不直接扣血；Role1 `hit1` 在自身 active window 内按共享怪物物防结算，同一 attack/target 只命中一次。
- 死亡日志保留最后 10 个 `time/source/action/attack id/amount` 事件；boss 物理致死可归类为 `boss-physical`。

运行态样本（2026-07-21—2026-07-22，本地 1P Role1、1 级、无调试能力）：

| 关卡/位置 | 峰值敌人 | 结果 | HP | 死亡主因 | 观察 |
| --- | ---: | --- | --- | --- | --- |
| Stage 1-2 首停点 | 8×M8 | 失败 | 80 → 0 | `attrition-no-sustain` | 多轮攻击累计致死；未再出现 `burst-same-frame`/`untelegraphed-contact`，失败页与状态栏显示死亡分类，console 无 warning/error |
| Stage 1-1 完整流程 ×3 | 四停点 Monster30 + 巫鹰 | 3 次通关 | 250 / 250 / 265 | 无死亡 | 默认 1P Role1、1 级、无调试能力；三次均清空四停点、击败巫鹰并进入胜利页，耗时 172.7s / 202.6s / 165.7s；本地证据在 `.tmp/stage11-browser-audit/evidence/acceptance-1..3/` |
| Stage 1-3 第一停点 | 6（M8/M7/M3） | 失败 | 80 → 0 | `boss-physical` | 停点 1/5、生成 6/105；死亡页与状态栏明确显示 `boss-physical`，接触本身不扣血，未出现 `burst-same-frame`/`untelegraphed-contact` |

关闭结论：

- Stage 1-1 三次完整流程全部通关，超过“至少两次”的门槛；`TASK-SLICE-130` 与 VS-050 可以归档，M-048 的本切片校准目标已完成。
- 审计脚本中的 `watchdogMs` 仅用于在自动化卡死时终止本地审计，不属于游戏运行时、校准规则或原版机制。原游戏没有单波超时，本实现也没有新增波次计时或超时失败。

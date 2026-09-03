# TASK-SETTINGS-213 青龙完整家族证据

## 结论与范围

- 家族范围仅为 `dragon1..4`；原版入口为 RegiMA 1.1 正式战斗，舞台 `940×590`。
- 权威机器真值为 `task-settings-213.pet-dragon-family`：`docs/reverse-engineering/ground-truth/manifests/task-settings-213-pet-dragon-family.json`，`status=verified`，`unresolved=[]`。
- 原版基准索引为 `docs/tasks/evidence/TASK-SETTINGS-213/baseline-index.json`，包含 111 个可重复生成的 `940×590` 关键状态；左右方向、本体状态、全部技能关键 tick、六类可见对象与九对象雷霆组合均在集合内。
- 本任务只生成证据与 `TASK-SLICE-214` 交接，不修改 `src/`、不派生现代 atlas，也不宣称现代青龙已复现；合同总数为 44。
- 完整合同集：`CONTRACT_SET:owner.body|owner.effects|owner.collision|visual.states|visual.baselines|runtime.update-order|runtime.target-order|runtime.target-loss|runtime.follow-owner|runtime.follow-target|runtime.warp|runtime.action-priority|runtime.normal-roll|runtime.cooldown-order|runtime.hurt|runtime.death|runtime.destroy|runtime.projectile-collision|runtime.attack-id-dedup|runtime.damage-pipeline|runtime.heal-on-hit|runtime.clone-owner|runtime.p1-p2|dragon1.normal|dragon1.fs|dragon1.fs-expiry-heal|dragon2.normal|dragon2.fs|dragon2.sdcc|dragon3.normal|dragon3.fs|dragon3.sdcc|dragon3.ltwj|dragon3.ltwj-nine-object-wave|dragon4.normal|dragon4.fs|dragon4.sdcc|dragon4.ltwj|dragon4.qlaoyi|dragon4.qlaoyi-trigger|dragon4.qlaoyi-clones|dragon4.qlaoyi-chain|dragon4.qlaoyi-no-mp-debit|dragon4.cleanup`

## G0：冻结的可观察问题

1. 四形态本体的 `wait/walk/hurt/dead`、普攻与已声明技能动作行、帧数、逐 cell host-tick 持帧、方向矩阵和结束转移是什么？
2. `BasePet` 如何选择目标、跟随主人/目标、传送、按优先级释放技能、进行两次随机判定和递减 CD？
3. 四形态普攻的统一范围、真实可见对象、emit tick、命中、attack-id 去重、伤害、治疗和清理是什么？
4. `fs/sdcc/ltwj/qlaoyi` 的门禁、扣蓝键、时序、对象数量、目标/owner、治疗和继承组合是什么？
5. 分身是否是同一 owner 的真实宠物实例，如何复制属性、拥有 projectile、到期治疗与销毁？
6. P1/P2、换宠、休息、死亡、重试、返回和重载时哪些状态必须隔离、幂等清理？

拆分触发未命中：没有读取第二家族，没有新增 SWF owner，没有研发 Flash VM，也没有留下实现影响未知。

## Owner 与原版视觉真值

| 对象 | SymbolClass / character | 原版 owner | 时间轴 / 语义 |
| --- | --- | --- | --- |
| dragon1 本体 | `PetDragonBmd1` / 9 | `assets/pet1.swf` | 150×150 atlas，5 行，offset `(1,-5)` |
| dragon2 本体 | `PetDragonBmd2` / 13 | `assets/pet1.swf` | 200×200 atlas，7 行，offset `(1,-5)` |
| dragon3 本体 | `PetDragonBmd3` / 16 | `assets/pet1.swf` | 250×250 atlas，8 行，offset `(1,-15)` |
| dragon4 本体 | `PetDragonBmd4` / 23 | `assets/pet1.swf` | 300×250 atlas，10 行，offset `(31,-25)` |
| 普攻 | `PetDragon1Bullet1` / 542、`PetDragon2Bullet1` / 547、`PetDragon3Bullet1` / 572 | `assets/pet1.swf` | 分别 11 / 15 / 21 帧；dragon4 复用 572 |
| 闪电冲刺 | `PetDragon2Bullet2` / 563 | `assets/pet1.swf` | 30 帧，`FollowBaseObjectBullet` |
| 雷霆万钧 | `PetDragon3Bullet3` / 603 | `assets/pet1.swf` | 每对象 10 帧，`SpecialEffectBullet` |
| 青龙奥义触发对象 | `PetDragonBullet4` / 539 | `assets/pet1.swf` | 48 帧，`FollowBaseObjectBullet`，动作 `hit4` |
| 奥义光环 | `AoyiBuff` / 120 | `assets/StageCommon.swf` | 14 帧，共享 disabled owner-following 对象 |
| 碰撞 | `ObjectBaseSprite3` / 103；`ObjectBaseSprite4` / 101 | `assets/StageCommon.swf` | dragon1 为 31.05×29.95 / reg `(15.55,15)`；dragon2..4 为 35×69.95 / reg `(17.5,35)` |

恢复 SWF 的 SHA-256、AS3 哈希、逐帧 FFDec 几何（local matrix、注册点、visible bounds）、frame count、mask/filter/blend、基准 hash 与来源 locator 均在 manifest `/sources` 和 `/visualTruth/displayObjects`。选定对象没有额外 mask/filter；分身只改变本体 alpha。左右基准使用同一原始 cell/Sprite，在根对象上按 `BaseBitmapDataClip` / `BaseBullet.setDirect` 镜像；动态状态没有复用静态壳图。

## 本体动作与普通攻击

| 形态 | `attackRange/rate` | 本体动作行（帧数；holds） | 普攻 emit | 可见对象 / 结果 |
| --- | --- | --- | --- | --- |
| dragon1 | `150 / 0.8` | wait+walk r0 (6；`2,2,2,3,2,4`)，hurt r1，dead r2 (4)，normal r3 (4)，fs r4 (5) | normal seq4 hold10，`x±30,y` | `PetDragon1Bullet1`；physics hit1；命中后治疗 |
| dragon2 | `150 / 0.8` | wait r0，walk r1，hurt r2，dead r3 (5)，normal r4 (4)，fs r5 (5)，sdcc r6 (1) | normal seq4 hold10，`x±30,y` | `PetDragon2Bullet1`；physics hit1；命中后治疗 |
| dragon3 | `150 / 0.8` | wait r0，walk r1，hurt r2，dead r3 (5)，normal r4 (6)，fs r5 (5)，sdcc r6，ltwj r7 (3) | normal seq3 hold7，`x±30,y` | `PetDragon3Bullet1`；physics hit1；命中后治疗 |
| dragon4 | `150 / 0.8` | dragon3 行 + qlaoyi r8 (1×48)，link r9 (`2,40`) | normal seq3 hold7，`x±65,y-15` | 复用 `PetDragon3Bullet1`；命中伤害再乘 `hurtBaseEffectRate()` |

`BasePet.myIntelligence()` 的顺序是 skill1 → skill2 → skill3 → skill4 → 每秒普通攻击/跟随。范围内第一次随机 `<=0.8` 才攻击；失败后重新随机 `<0.3` 等待，否则追击。范围外始终追击。目标是 `gc.obbsiteArray` 中首个 `<=1200` 的活目标；死目标或距离 `>=1200` 在当前帧清空而不重选。无目标时每秒检查主人距离，`>640` 跟随，否则等待；距主人 `>=1000` 且非攻击/受击时根坐标瞬移到 `(owner.x, owner.y-30)`，没有 warp 动画行。

普通攻击、sdcc 和 ltwj 都在 `setRole()` 时快照宠物 attack id；目标侧 `beAttackIdArray` 去重。普通攻击和 sdcc 的每次命中回调治疗 `floor(SHp*0.018 + atk*0.18 + level*2)`；ltwj 的每个命中对象治疗 `floor(SHp*0.028 + atk*0.09 + level*2)`，均由 `cureHp` 封顶。

## 技能与家族差异

| 形态/技能 | 门禁与 CD | 原版动作、对象和伤害 | owner / cleanup |
| --- | --- | --- | --- |
| dragon1 `fs` | 已学、MP≥20；2.5s 初始/10s 间隔；不要求目标 | hit2 最后 cell hold2 创建同形态分身；本体直接伤害 0 | 同 `sourceRole`，alpha .5，10s；私有 `fenshenArray`；正常到期给主人治疗 3.6% SHp |
| dragon2 `fs` | 同上 | 同形态分身 | 同上 |
| dragon2 `sdcc` | 已学、MP≥20、目标≤300；3s/3.6s | hit3 hold24，根 `y+10` 发 30 帧跟随对象，projectile action=`hit2`；`(0.03*SHp+3*atk)*1.05` 后叠 magicAdd/crit/GXP | pet-owned projectile；命中回调治疗 |
| dragon3 `fs/sdcc` | 继承，优先级不变 | fs/sdcc 同上；源码扣蓝 lookup 写成 `sp`，但 `sp` 与三技能均为 20，数值等价 | 保留 lookup quirk，不能据此改成别的 MP 值 |
| dragon3 `ltwj` | 已学、MP≥20、目标≤500；5s/5s | hit4 seq3 hold20；0/0.2/0.4/0.6/0.8 秒按 `1+2+2+2+2` 生成 **9** 个 `PetDragon3Bullet3`，每个 action=`hit3`，每个走 `(0.024*SHp+7.2*atk)*1.05` 后叠 magicAdd/crit/GXP | 每对象独立碰撞、命中治疗和末帧 cleanup；主人死亡时延迟回调停止 |
| dragon4 `fs` | 目标存在、已学、MP≥20；2.5s/10s | 分身复制完整技能；HP/MP 采用源码的大倍率复制；alpha .6、12s | 同 slot；到期或提前死亡都治疗主人 3.6% SHp；owner 销毁先置 `isFight=0` 再销毁 |
| dragon4 `sdcc` | 目标≤180 | dragon3 sdcc，伤害乘 `hurtBaseEffectRate()` | hit3 可移动；正常扣 20 MP，奥义链免费 |
| dragon4 `ltwj` | 目标≤220 | dragon3 九对象 ltwj，伤害乘 `hurtBaseEffectRate()` | hit4 地面不可移动；正常扣 20 MP，奥义链免费 |
| dragon4 `qlaoyi` | 已学、目标≤200、MP≥30；15s/24s | hit5 持续 48 ticks；12/24/36/48 各尝试一只分身；tick48 另发 `PetDragonBullet4` hit4；结束后 owner/clone 走 sdcc→ltwj 或 hit6→ltwj | **30 MP 只作门禁，`releSkill4()` 不扣蓝**；AoyiBuff、分身、延迟雷霆、trigger 都必须由本 slot 生命周期清理 |

### 需要推翻的旧结论

- 旧 `pets-index.md`/现代 `PetTuning` 把 ltwj 写为 4 段；AS3 `doHit4()` 直接证明实际是 9 个对象、五批时序。
- 旧文档建议“按一致性扣 30 MP”；原版 `beforeSkill4Start()` 只检查 30，而 `releSkill4()` 不调用 `setMp`。本任务将其冻结为原版 quirk，214 不得自行修正。
- `qlaoyi` 本体 `hit5` 直接伤害为 0，不表示整条奥义无伤害：tick48 的 `PetDragonBullet4` 使用 `hit4`，按 ltwj 公式结算；可选分身还会免费释放 sdcc/ltwj。
- dragon1..3 的 `fs` 不需要目标，dragon4 的 `fs` 明确需要目标；不能用单一泛化门禁覆盖四形态。

## qlaoyi 组合真值

1. `releSkill4()` 设置 `isAoyi=true`、生成 disabled `AoyiBuff`、进入 hit5，不扣 MP。
2. hit5 的 12/24/36/48 tick 都调用 `doHit5()`；只有已学 fs 才生成分身，方向依次 right/left/right/left。
3. tick48 无论是否学 fs 都生成 `PetDragonBullet4`，其 projectile action 为 hit4；它使用 ltwj 伤害公式。
4. 分身和 owner 若学 sdcc，先免费 `releSkill2WithoutMana()`；hit3 动画结束且 `isAoyi` 仍真时，再免费 ltwj。
5. 若没学 sdcc 但学 ltwj，则经 hit6 进入免费 ltwj。若 fs-only，则克隆被创建但 `isAoyi` 清除，不继续伤害链。
6. 延迟 ltwj 回调只有在 pet 未死亡（dragon4 还要求 `isFight==1`）时继续生成对象。

## P1/P2 与生命周期合同

- P1/P2 共享 SymbolClass 和行为规则，但每个 slot 必须有独立 runtime key、target、CD、clone array、clone timer、`isAoyi`、projectile、attack id、damage/heal 和清理原因。
- 普攻/技能只由 single-game 或 `sourceRole.sid==gc.sid` 的 owner 发出；网络镜像经 `setOtherAttack` 重放，不能在现代 formal/TestScene 双重生成。
- owner 销毁时必须清理全部私有分身和 projectile；分身销毁不得清掉 owner 的宠物槽。换宠、休息、死亡完成、retry、return、reload 重复调用仍必须幂等。
- `PetCombatRuntime` 已提供每 slot runtime、sticky target、范围外追击、dead-playing 和 action token 接缝；当前 registry 仅有猴/马 Behavior，正式桥只解析猴/马 projectile。现有 dragon 技能仍从 `PetSystem -> TestScenePetMagicBridge` 走占位即时请求，formal 无 dragon body/effect/damage/heal/clone consumer。

## 六段证据矩阵

| 合同项 | 局部证据 | 共享调用链 | 几何/坐标证据 | 等级 | 未知与反证条件 | 214 验证 |
| --- | --- | --- | --- | --- | --- | --- |
| AI/范围/随机/CD | `BasePet.as:141-215,305-397`；四类构造器 | `step -> myIntelligence -> beforeSkillN/releSkillN/normalHit` | 距离为 root/world 对象距离；attackRange=150 | 确认事实 | BasePet hash 或真实调用入口变化即重开 | 四形态×P1/P2 范围外→入围 trace；range mutation |
| 本体动作 | `PetDragon1..4.initBBDC/setAction/scriptFrameOverFunc` | `BaseBitmapDataClip` host tick | manifest `/visualTruth/displayObjects/0..3`；111 基准 | 交叉确认 | atlas row/hold 与运行态不一致 | body action token、逐 key tick 叠图 |
| 普攻 | 四类 `enterFrameFunc/doHit1/getRealPower` | `SpecialEffectBullet -> BaseBullet.checkAttack -> monster.beMagicAttack` | character 542/547/572；emit matrix 见 `/forms/*/actions/normal` | 交叉确认 | projectile 未形成实际 HP delta | hit-timing/source-owner mutation；damage+heal+cleanup trace |
| fs 分身 | 四类 `doHit2/createFenshen/myIntelligence/destroy` | clone 自身 `step`、sourceRole、private bullets | 同形态 atlas，alpha .5/.6，x 随机±150、y-50 | 确认事实 | 分身错误共享 owner runtime 或提前清槽 | 固定随机 fixture、expiry heal、replacement/rest/death cleanup |
| sdcc | dragon2..4 `enterFrameFunc/doHit3/getRealPower` | `FollowBaseObjectBullet` + hit callback | character 563，root `(0,+10)`，30 帧 | 交叉确认 | 不跟随宠物或 hit2 时机漂移 | P1/P2 body hold24→projectile→damage/heal→cleanup |
| ltwj | dragon3/4 `doHit4/doSingleHit4` | TweenMax delayed callbacks + nine independent bullets | character 603；五批 offsets 在 manifest | 交叉确认 | 对象数≠9、延迟/位置或清理漂移 | count/timing mutation；九 source ids、九 hit/heal/cleanup 链 |
| qlaoyi | dragon4 `beforeSkill4Start/releSkill4/doHit5/scriptFrameOverFunc` | `addAoyiBuff`、clone free-skill chain、Follow bullet | body r8/r9；character 539/120；ticks 12/24/36/48 | 交叉确认 | 扣 MP、少 clone、错误技能串并行均反证 | gate-only MP mutation、组合矩阵、正式 940×590 |
| owner/lifecycle | 四类 `setOtherAttack/destroy`、`BasePet.destroy` | sourceRole/sid、formal/TestScene runtime/bridge | pet1/StageCommon 唯一 SymbolClass owners | 确认事实 | 跨 slot 目标/clone/projectile 或重复 cleanup | P1/P2 + death/replacement/rest/retry/return/reload |
| 现代接受映射 | `PetCombatRuntime.ts`、registry、HeroParty/TestScene bridges、PetSystem/Tuning | public runtime 已有接缝，dragon consumer 缺失 | 当前无 dragon 正式 visual owner | 确认事实 | 214 新增旁路或场景私有 owner | P1G、独立 handoff verifier、全量与人工验收 |

## 214 字段级交接

manifest `/p1rAcceptance/acceptanceMatrix` 对上述 45 个 contract id 逐项给出：expected 字段、正/负 fixture、实际 trace 字段、语义断言和 black-box actual source。214 必须直接消费同一 truth id，不得从本文件抄常量。

强制反证：

- 把任一形态 `attackRange` 从 150 改成其他值，范围链必须失败。
- 把 dragon3/4 ltwj 的 `projectileCount` 从 9 改回 4，必须失败。
- 把 qlaoyi 从 gate-only 30 MP 改成实际扣 30 MP，必须失败。
- 删除 `actionToken/projectileId/attackId/damageSourceId/hpBefore/hpAfter/cleanupReason` 任一关键 trace 连接字段，独立 verifier 必须失败。
- 把 `pet1` effect owner 或 P1/P2 source owner 互换，必须失败。

## 未知、现代例外与关闭判断

- 实现影响 `unresolved=[]`。随机分身 x 只冻结原版范围，214 的确定性 fixture 可以注入固定随机值，但不能把 fixture 值宣称为原版常量。
- 允许的现代可见例外为空；仅可增加稳定 runtime/action/projectile/attack id 作为不可见追踪字段。
- 111 张透明舞台基准来自恢复 SWF 选择性导出和 AS3 矩阵；它们是对象级原版基准，不是现代运行截图。214 仍须给出正式 P1/P2 并排/叠图与 console 零 warning/error。
- 本 task 达到 G0-G4，可归档；青龙家族的玩家可见闭合必须等 `TASK-SLICE-214` 完成。

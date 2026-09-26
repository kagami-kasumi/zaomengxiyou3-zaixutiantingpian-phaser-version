# TASK-SLICE-226 实现进度

2026-09-26 / 226最终验收：扩大P1R/P1H/P1G/P1T=0，新增正式目标投影后的P1R/P1H=0；1404原生联动组、1596现代组/165264态、24猴四实际伤害链及36马多目标组通过。原41/43合同逐项承接，230..235公共责任仍open，本地整改归档、230唯一Ready，完整家族/all/204/194/VS-067不关闭。build与默认全系统分段覆盖通过；失败OOM保留。

2026-09-24；本task仍为唯一Ready，未完成。227/228/229源输入已交付；本记录不降低原84合同、MH-01..07或两族完整验收要求。

## 身体/回调增量（2026-09-24）

- `tools/pet226-body/generate.py`从228/229 verified body和原生callback测量生成受Git跟踪的`src/assets/pet-monkey-horse-body.json`；`--check`通过。运行不依赖忽略的证据目录。
- 公共`PetAnimationClock`增加逻辑keyFrameCount；猴连击两列循环12/20计数、马二三dead截断按源保留。Monkey/Horse已提供createAnimationClock，Session仍是唯一身体时钟owner。
- 普攻在动作开始保存目标、原body hit回调创建；动作忙碌时禁止新的AI攻击/连续追逐，显式reactsToHit=true且非GXP才进hurt，同hurt重启cell。**qlfj反击、stun、完整移动/私有bullet顺序仍未实现完，MH-05未关闭**。
- 57,600原生身体状态与回调对照通过；同一批状态投影实际猴马View函数、每状态重复render两次，无独立显示计时。此为行列/翻转投影验收，不替代Phaser画布逐态视觉验收。
- TestScene与正式场景统一使用FormalPetMonkey/HorseBodyBridge和Session快照；删除TestScene猴马第二身体/效果视图路径，保留既有冰效适配。两个Formal bridge不再反向决定dead-complete。HeroParty大文件仅删除两处TestScene排除条件，未增加import或新职责。
- 72 Runtime相位用227 AI modulus结合228/229原生busy区间与emit tick核对，包含20fps下马二26tick动作占用下一取模点；不能继续沿用227显式body sink得出的全部周期都可攻击预期。
- Session按behavior显式searchIncludesDead保留输入顺序，首个距离合格死亡目标下一tick清除、不即时重选；72组Runtime原生acquire/clear对照通过。**正式五关/TestScene原始数组组装顺序仍待核销，MH-07未关闭**。
- 马技能拆prepare/emit：开始扣MP/CD，body callback创建，90组Runtime/fps/render分帧通过。猴技能从超warning的PetSystem拆至PetMonkeySkillSystem，原伤害数学移至PetSkillDamageMath供旧消费者复用；开始扣MP/CD、callback清相应release标志，81组常规技能通过，lj按原回调产生独立prelude/damage对象，prelude标visualOnly且resolver不结算。
- 猴发射点改为pet当时坐标加源offset，普攻朝向读取身体朝向。马/猴现有弹体伤害预计算、ttl/activeAfter/自然相位、复杂碰撞/完整源去重仍待替换，不能把出生时点通过当命中时点已正确。
- P1/P1B回归通过；伤害触发测试现在证明猴1 release不提前清标志、callback才清并生成弹。龙1Runtime、玄龟四形态P1/P2回归通过；猴马动画资产专项通过。结构warning从9减为8（PetSystem已低于阈值）。
- P1R/P1H已注册身体/目标序/技能释放测试，完整命令仍退出1，停于旧monkey family normal零delta即生弹断言。旧41/43未删，不宣称完整门禁通过。

### 当前准确继续点

1. 猴四奥义已改为hit5完成与normal/lyq/lj完成之间的回调链；xj先选后覆盖不创建效果，成功末击不回owner，空候选/空轮才回。原生身体216例/9720态、目标672例/3108态及7个真实代码变异通过。正式camera→scene.parent投影、QLFJ与完整伤害/清理/视觉仍待联合验收。
2. 猴马QLFJ、受伤/GXP/保护/stun及移动和bullet step顺序；horse技能release标志细节仍须直接核对AS3。当前CD仍为既有毫秒计数，需要覆盖源整数帧边界。
3. 正式几何复用`PetProjectileCombatPort`、`PetProjectileCombatBridge`和已有怪物colipse几何，**不新增平行Stage1敌人碰撞owner**。228/229 geometry-inputs/natural phases转tracked运行数据；当前bridge mask仅支持Dragon，需扩展资源解析或复用已验证相位渲染器。删除tracked绕过必须与真实complexHitTest消费一起完成，不能换点矩形冒充。
4. 双owner/生命周期/奥义/火焰/冰效/延迟TweenMax、原84合同和全部五关/TestScene视觉/变异完整联合验收；完整测试预期按独立源证据更新。

## 首批历史改动与已验范围

- 修改前重新运行旧生产诊断：43/43反例被原227 expected拒绝，含16远距命中、3未学技能抢占和24错相位场景。
- MonkeyPetBehavior选择前检查learned、MP、release和lyq<=400，数值复用现有PetTuning；原227的480组gate矩阵在旧代码328失败，修改后零失败。真实Runtime的未学习技能抢占3例消失；整体43反例当时仍有40失败，未冒充整体验收。
- PetNormalAttackDecision移除重置1000ms倒计时，只读取公共Session已有hostTick/fps相位；获取目标当tick不释放普攻。Monkey/Horse声明usesHostTicks，复用Session原有分帧缓冲；没有新增时钟owner，龙龟原animation路径不变。技能同样不在刚获取目标的tick释放。
- real Runtime四形态×两族×20/24/30fps×1/2/4渲染分帧，共72组错相位获取目标，普攻tick与227源trace一致。没有把该有限检查外推至攻击恢复/受伤/stun/所有移动或伤害顺序。
- 原P1/P1B damage-hook与registry测试已改为实际host输入；零delta不再推进猴马AI，部分render帧不减CD。既有测试不再要求零时间选目标后立即施法。

## 首批检查与失败记录

480源资格、72真实Runtime相位、条件随机边界和P1/P1B公共合同通过。青龙1真实Runtime及玄龟四形态P1/P2 normal/SLD回归通过；两族原时钟专项通过。build与已修改Session/Monkey的LSP诊断通过，9既有结构warning未新增。

`npm run check:system-design -- pet P1R P1H` 当前退出1：公共合同已过，停在旧 `pet-monkey-family-runtime-tests` 的 `testAllFourFormsCreateTrueBasicAttackProjectiles`，仍要求旧时序立即出现普通弹。不得声明P1R/P1H通过，也不得直接删掉失败断言；需在接入真实body回调后按源时序升级完整测试。新480/72检查已加入对应gate，完整gate没有通过前不得关闭226。

## 原始执行顺序（以上准确继续点优先）

1. 接入猴马原body倒计数/动作状态与真实回调，修复MH-05（攻击/受伤/stun/移动与调度先后），保留单Session时钟和typed事件；现有View不得继续另持战斗时钟。
2. 从228/229生成正式受Git跟踪的效果几何/相位数据，替换tracked身份直接命中与旧矩形近似，接入正式目标colipse及伤害/去重/附属效果。
3. 核销原41/43、奥义、双owner/死亡/换宠、正式输入顺序、五关/TestScene逐态视觉及全部相位/生命周期变异。之后运行完整P1R/P1H、全系统/build与收尾审计。

未提交或push。继续当前task；不新建独立任务、不扩到新家族。

## 奥义与碰撞采样增量（2026-09-24）

- 猴四回调链、严格20<colipseLeft<920的完整monsterArray（含dead）选择、两次离散随机、目标指针更新、源twip传送及最终/空候选分支已接入真实Runtime。`PetProjectileCombatPort.monstersInParentSpace`复用正式怪物几何owner，场景adapter投影实际Camera矩阵；fixture中的父变换检查不替代正式场景画布检查。
- `pet-monkey-aoyi-body-tests`覆盖216例/9720原生态；`pet-monkey-aoyi-target-tests`覆盖672例/3108分支态；`pet-monkey-aoyi-mutation-tests`拒绝漏完成、连续位移、过滤dead、包含边界、发出被覆盖XJ、成功回owner、连击重复扣MP共7个真实源码变异。原body fixture没有移动循环，测试显式moveSpeed=0，不将其外推为完整AI移动验收。
- `tools/pet226-body/collision_fields.py`以已验证几何重建采样16个源平移相位、400个目标twip相位。猴349164/马387960个原版HitTest布尔一致。原native测量真实覆盖tick0..121；先前工作摘要的0..30为误记，实际profile不截断。
- `pack_collision.py`交付`public/assets/pets/monkey-horse/collision.json.gz`及hash manifest：3959去重位平面，2715041压缩字节。正式目标位平面复用既有玄龟包中经过验证的2/2/1缩放原字节；不以导出矩形替代像素。`PetMonkeyHorseCollisionAssets/Package`支持压缩和已解压交付、校验SHA-256、拒绝损坏包和未知相位。
- `formal_target_capture.py 228/229`另在原始SWF/AIR/HitTest上测量正式怪物构造缩放；原228/229输入未改动。`pet-monkey-horse-collision-field-tests`由实际TypeScript采样器验证原尺度+正式尺度共1474248个布尔，并独立计算世界包围交集与源>=1像素ROI对照，通过。原hitTestObject粗预检可保留零/负窄矩形，helper将无有效ROI归空，不宣称该无效矩形本身逐值相同。
- **资源和采样器尚未接入正式投射物resolver**；旧tracked身份绕过、旧hitFrame延迟、生命/移动/伤害/附属效果仍未闭合。大样本局部一致不是完整战斗链路通过。下一步先依据原BasePet.step与各形态step的真实顺序接生命周期，再替换正式resolver；不能照fixture构造顺序猜测出生帧。
- 本批采样检查加入P1R/P1H；原84合同不删减。资源在public正式目录，运行不依赖local evidence；源级复验仍需要本地恢复语料。结果报告仅本地`docs/tasks/evidence/TASK-SLICE-226/collision-fields-ts.json`。

本批末检查：build=0、workflow=0、diff=0；P1R/P1H=1，仍停在旧monkey normal零delta断言。正式任务未完成，不做完成提交。

### 资源入口与下一实现约束

`pet-monkey-horse`已接现有AssetBundleCoordinator。`PetProjectileCombatBridge.readyRoster`在猴马资源尚未解压校验时等待，复用HeroPartyRuntimeBridge单入口；不新增Scene运行时。HeroParty文件既有12个system import warning，本次仅增加一行资源ready组合，未添加系统import或战斗算法。缓存owner、关闭时取消、坏包拒绝与不误删已成功共享资源测试通过；asset bundle/catalog/retry、关卡和怪物资源所有权回归通过。最新build=0（415模块，既有大chunk warning）。未做浏览器资源等待/画布验收。

下一步：用行为私有投射物句柄在`beforeActions`执行BasePet私有弹体step顺序；普通弹出生同tick不step。原`BasePet.as:141-181`先已有magicBulletArray.step2，再AI/CD/timeCount，再super.step；`BaseObject.as:165`先BBDC.step（会触发出生回调）后移动。228 joint 24fps `1-hit1-P1--1` tick7出生frame1无calls，tick8首次step仍frame1，tick9到frame2；自然碰撞profile tick0/1都frame1、tick2为frame2，**实际首step应使用age1，不可盲套玄龟的tick索引**。仍需对全部symbol/停帧组合做独立joint比较。

只读核对已由主agent抽查关键缓存链：`BaseBullet.as:486-496`的setAction立即refresh，`:433-460`两次带暴击getRealPower加一次非暴击，`:301-326`目标先消费缓存、接受后refresh。不能把当前差异概括为“必须到命中才初次计算伤害”；真正待修是完整缓存/随机次数与接受后刷新。normal各形态为physics、hitMaxCount99、interval999；猴四击退输入[4,-5]，其他[6,-5]，待接源参数和正式怪物受击链（不能把BasePet作为受害者的公式套给BaseMonster）。SpecialEffectBullet默认hurt cut=false。尚未接入，不作完成声明。

## 普攻正式命中增量（2026-09-24）

- `PetMonkeyHorseNormalProjectileSystem`现由猴/马Behavior持有私有句柄，公共Session.beforeActions推进；身体回调创建时age=0，不再使用旧normal request/resolver进行实际战斗。通用render更新按既有petHostTick规则跳过，旧猴马resolver明确跳过这些host-owned对象，避免二次结算。所有技能仍待迁移，不把普攻完成等同MH-02整体关闭。
- normal物理类型、max99、interval999、各形态发射offset/末帧寿命与源相符；BaseBullet缓存用两次暴击读取、atk*2.8、uint magicAdd、GXP及仅四阶花buff；接受命中后刷新，下一个目标消费新缓存。保护/闪避/接受零伤害仍复用现有正式命中port。normal SpecialEffect不跟随、不因owner hurt切断。
- 96组真实Runtime（两族四形态×P1/P2×20/24/30fps×1/4分帧）验证：出生无伤害、远距锁定目标不扣血、独立native positive ROI中的非锁定目标实际扣血、owner、ID去重、render不重复step、完整寿命。每个存活age的递归phaseFrames、首次销毁age与228/229联合trace比较一致。正例有意用于几何链路隔离，不冒充任意自然追击均可命中。
- 六个实际生产源码变异（碰撞绕过、出生已推进、相位提前、提前销毁、不刷新cache、错误翻转）全部由上述测试拒绝，finally恢复原字节。`normal-mutations.json`仅本地。只读子agent曾在变异窗口读到no-cache-refresh临时版本；实验结束后主agent核对75行实际refreshNormalDamage，不能把临时变异报告当现存bug。
- 普通效果显示读取petHostTick与弹体固定位置，不再随render时间/当前身体位置跑；expired对象立即撤掉。旧frame图片的递归自然相位完整像素与五关/TestScene画布仍待验，不能以此声明视觉完全一致。
- 旧AI/body隔离测试显式注入无伤害目标port或body fixture拒绝命中port；72相位、216奥义身体/9720态、672目标/3108态、81猴/90马释放仍通过。该隔离port仅在tools内，正式路径缺资源直接报错，没有静默旧碰撞回退。
- 最新P1R/P1H仍退出1，停在旧monkey family零delta生弹断言；原41/43未删除。下一步迁移全技能及原native附属效果/生命周期，再升级完整旧验收预期。完整任务仍Ready/未完成。

附：受害者语义已窄查BaseMonster（不是BasePet）：protected不耗ID，dodge耗本目标ID但不refresh/maxhit，接受0仍hurt/refresh；现有sourceBullet port对应此行为。现代成功ID写入时机早于源回调，若加入重入型命中附属效果须复核。正式怪物击退位移消费仍待独立核销，不能只因DamageEvent有knockback数值便判通过。

## 原版伤害算术与击退后续（2026-09-24）

- `tools/pet226-body/generate_normal.py`从228/229 verified输入和三帧率双owner联合测量投影八normal配置；`src/assets/pet-monkey-horse-normal.json`已被生产直接消费，offset、symbol、寿命、击退和命中字典不再手填。`--check`及96 Runtime例通过。
- `tools/pet226-body/damage_capture.py`提取八个原getRealPower及PetInfo.getPetHarmObj原方法，外部stat/buff/critical provider受控，在既有AIR运行2784例；包含uint溢出/负输入、零攻击、GXP/花/暴击。每例执行两次可暴击和一次非暴击调用；不冒充原BaseBullet完整执行或怪物命中验收。原方法、生成probe和输入hash可复核，结果在本地task-outputs/TASK-SLICE-226/damage-air/measurement.json。
- `PetMonkeyHorseDamageSystem`消费生成的公式分支，在原顺序完成加法/暴击/GXP/花和AS3 int。三阶猴hit3不应用magic/crit但仍消耗两次随机，四阶hit3吃crit/花但不加magic；所有技能PetInfo均先乘1.05。2784原生expected全部通过；当前生产只用于normal，技能仍旧resolver，不能宣称技能数值已全部修复。
- 新登记TASK-SETTINGS-230补公共怪物受击运动：实际resolveStage1PetHit扣血200→193，event knockback=(6,-5)，position/velocity不变；下一帧updateMonsterPhysics只产生重力，x=300、y=420.6666666666667、velocityY=40。此为消费缺口反例，不是原版完整轨迹；原速度单位、横向倍数、边界/空中/Boss分支由230核定后生成同线实现项。
- 当前继续点：猴马全部技能的私有host弹体、源缓存接受后刷新、火/冰/延迟爆炸、follow顺序及完整生命周期；先保留原41/43门禁，不删除旧失败断言换取绿色。226未完成，无Git提交。

本批收尾复验：normal96、原AS3算术2784、normal六源码变异、generate_normal --check、build均通过；完整pet P1R P1H仍退出1（旧normal零delta断言），按设计合同判本批不通过。击退诊断已固化tools/pet-monster-knockback-preflight.ts与本地JSON，命令退出0仅表示采集成功。PG-017反证已回写；不标记goal/task complete。

## 猴九技能主弹体接入（2026-09-24）

- `PetMonkeyHorseNormalProjectileSystem.ts`已扩展并改名`PetMonkeyHorseProjectileSystem.ts`；MonkeyBehavior的normal和技能都由同一私有句柄owner在Session.beforeActions推进，Horse目前只normal使用。猴技能prepare仍负责一次MP/CD，body callback调用新emitMonkeySkill，清release的源规则保留，旧manual facade尚未删除。
- `generate_monkey_effects.py`消费228 verified manifest、原形态AS3和20/24/30fps×P1/P2 joint，生成正式`src/assets/pet-monkey-effects.json`。九组字典、发射偏移、disabled/hurtcut、Follow/SpecialEffect以及首次销毁一致；TTL按秒×hostfps，非TTL按末帧age，--check通过。disabled前置先禁用不读cache/RNG，活动对象两读；接受后从当前pet重新计算cache，ID按源interval更新。
- follow在整个base step2命中/末帧/hurt之后应用坐标差和owner根矩阵；新petRenderDirection独立于不可变facingX/攻击方向。FormalPetMonkeyBodyBridge读取该显示sign，host-owned效果销毁不再额外等旧4秒墙钟。画布像素及递归source绘制仍待，不把字段接线等同视觉通过。
- `pet-monkey-skill-projectile-tests`：九技能×P1/P2×三fps×1/4 render分帧=108真实Runtime例，14672原joint phase/lifetime态；独立native ROI中的非锁定怪物实际扣HP、远锁定不伤害、接受后cache随源stats变化刷新、源interval ID更新、disabled和全部效果清理。正例是几何隔离，不是自然移动全场景验收。
- `pet-monkey-effect-follow-tests`：144组、3928原版lifecycle态对账，覆盖四代表效果类型×P1/P2×方向×三fps×natural/move-hurt/explicit-destroy。直接执行私有owner并比较原before-follow调用位置、根矩阵与不变攻击方向；这是owner算法范围，明确不含pause/完整Session调度。
- `skill_mutations.py`八实际变异均被上述测试拒绝：disabled rolls/attacks、忽略hurt、TTL到期仍命中、固定24fps TTL、不更新ID、根翻转改攻击方向、先follow后hit。finally原字节恢复，本地报告skill-mutations.json。normal六变异与奥义七变异也重新通过。
- 原81身体、216奥义身体/9720态、672目标/3108态、72公共相位、90马身体和2784伤害算术均通过。奥义目标源probe只观察body且doHit为stub；新expected使用另一个原callback trace统计活动doHit4_2/doHit2，每个补两次BaseBullet读随机，不从现代弹体数反推。禁用前置不计。P1/P1B增加显式无目标fixture port后通过，正式没有静默fallback。
- build通过（421modules，既有大chunk warning）；structure仅8旧warning。完整P1R/P1H仍退出1于旧monkey family零delta生弹断言，原41/43未删除，系统本批不通过、226未完成。

下一具体工作：目标拥有的PETMONKEY_FIRE与马技能。源BaseMonster.beMagicAttack约914-938克隆sourceRoleAttackInfoObject.addEffect到被击者；BaseAddEffect.add同名仅刷新time/startTime，不覆盖首次hurt；step首次记startTime，count%fps==0直接reduceHp(hurt,false)，到期先remove但本次已选项仍可扣血。count每step++。BaseMonster.reduceHp不重算防御/保护/击退，死亡沿之前curAttackTarget发经验，buff自身无attacker字段，不能按宠物私有弹体清理。构造字典的火伤来自当时petAtk（猴1-3/10、猴4*1.5），不能每次命中无依据重算。正式共享怪物AI入口有Registry、Stage13、Stage21、Stage22；21/22存在holdRecoveryForVisual跳过updateStage1Enemy，因此不能只把buff挂该AI函数就宣称每帧消费。TestScene的Monster30适配与生命周期仍需核对。上述仅下一入口定位，未实现火焰，也未修改怪物运行时。

## 马九技能主弹体与奥义长寿命补证（2026-09-24）

- `generate_skill_effects.py horse` 从229 verified AS3/joint生成正式 `src/assets/pet-horse-effects.json`；猴原入口保留为兼容wrapper并通过 `--check`。HorseBehavior普通sp/bd/bz的实际回调现统一进入 `PetMonkeyHorseProjectileSystem`，使用已验证native碰撞/源伤害cache/ID刷新/末帧寿命；天马奥义仍为旧入口，不能宣称全马完成。
- bd保护15在原doHit回调调用，releaseReady也在回调清除，prepare只扣MP/CD。原90身体用例新增bd标志释放时点断言。horse1 sp为Follow且hurt可截断，horse2 sp虽同名symbol却为Special且不截断；bd的Follow不因hurt销毁；渲染翻转读取petRenderDirection而不重写攻击方向。
- 猴马常规技能Runtime与follow测试分别复用有界fixture，不复制现代算法作expected。马108 Runtime/2220原joint相位寿命态、324 follow/4884原生命周期态通过；猴108/14672与144/3928回归通过。命中正例的目标位置来自独立native ROI，只隔离几何/真实结算，不证明自然追击。follow仍明确排除pause。
- `skill_mutations.py --horse` 六个真实生产源码变异全部拒绝：全部跟随、全部hurt截断、忽略hurt、取消ID换代、翻转改写攻击方向、碰撞前先follow；猴原八变异回归通过，finally字节恢复。P1H注册马三组新门禁；完整P1R/P1H仍退出1，停于旧monkey family零delta正常弹断言，原41/43没有删减。
- 长寿命范围复核发现229 lifecycle fixture在tick9杀死目标，原71..76死亡结果不能外推持续存活目标。新增 `horse_aoyi_lifetime.py <20|24|30> <above|below|alternating>` 在226独立目录复用原EnemyMove方法，仅替换受控target轨迹，288场景/146976原生记录通过既有逐步transition verifier。自然tracking上方目标在20/24/30fps分别200/240/250tick死，下方均200，交替为200/223/223；三tick暂停样本最大253。只证明这些输入，未覆盖任意暂停时长/世界owner清理/真实碰撞伤害。初次并行AIR重复application ID被转发拒绝，已隔离fixture ID重跑；拒绝启动不计玩法结果。
- `horse_aoyi_collision.py source|formal` 在226独立目录采样原PetHorse4Bullet5的0..320自然帧。原尺度及正式怪物尺度各102078 native HitTest记录通过exact-cyan reduction；完整递归phase key均匹配229已验证geometry，不按根frame数猜循环。pack_collision只将这些实测tick映射到已有精确field，未改原plane/229证据；320以外仍抛错，未承诺无限暂停或任意时长循环。运行包仍在public跟踪，源码不依赖local证据。
- 两族普攻96及原AS3算术2784回归通过。尚待：奥义EnemyMove/实时延迟爆炸正式接入、冰/火目标owned效果、pause/死亡/替换和五关/TestScene逐状态画布、旧84合同联合验收；226继续唯一Ready，230保持Planned公共怪物击退后续。

本增量最终检查：正式TS采样/世界ROI共1678404 native case通过（含新增双尺度204156长相位），asset readiness/corrupt-byte与猴马技能回归通过；build、structure（8既有warning）、workflow、audit、diff通过，pack_collision --check一致。完整pet P1R P1H仍为退出1，不作完成或设计退出声明。

## 天马奥义实际链路与旧门禁迁移（2026-09-24）

- `generate_horse_aoyi.py` 从229 verified Horse4源码与EnemyMove源码指纹、原生explosion生命周期投影正式 `src/assets/pet-horse-aoyi.json`，`--check`通过。`PetHorseAoyiProjectiles`负责创建与原hit5Hit回调；`PetHorseAoyiMotion`负责原EnemyMove运动；仍由同一个Behavior私有 `PetMonkeyHorseProjectileSystem` 处理age/native碰撞/cache/ID/清理，没有第二Runtime。
- 实际HorseBehavior的tmaoyi callback已退出旧身份命中resolver：按world完整怪物数组逆序创建，dead也占位，固定y50、source x+(N/2-index)*90、direct=-1/root+1；hasSp才保留移动目标。hit5_1使用doHit5重写后的max1/interval20，不能使用构造器旧max99。先命中、刷新cache、hit5Hit，再减剩余次数，随后即使image已销毁仍执行本次EnemyMove。水平追踪0、竖直±9、下落上限35、加速后按int扣distance。
- `horse_aoyi_targets.py` 复用原doHit5/原body/joint，在226独立目录输入含dead中项的三目标数组；三帧率40320原生记录，96实际Runtime出生/顺序/目标绑定对账通过。比较仅含falling主弹，**AoyiBuff前置可见对象仍待接入**。不修改229旧测量或legacy原提取结果。
- `pet-horse-aoyi-motion-tests` 对229目标死亡场景和226持续活目标场景逐步核对，384例/97792 movement/TTL边界态通过；此项是运动函数而非完整世界命中。`pet-horse-aoyi-runtime-tests` 则实际Runtime+native碰撞+正式Stage1伤害port+生产绝对时间队列，168例覆盖三fps/P1P2/1或4分帧/八技能组合，以及delayed父死亡、活父release、移动弹体引用；命中正例按独立native ROI摆位，不能冒充自然追踪完整证明。
- `pet-horse-aoyi-callback-tests` 另以229原hit5Hit/TweenMax记录对账240技能/死亡/ready-only/移动引用用例；成功命中边界和timer触发显式受控，不替代168实际伤害用例或浏览器时钟验收。`private_array_capture.py` 执行原BasePet未改写的for-each循环，AVM2三例确认append子弹即在本次loop访问、父弹销毁待loop后清理；Runtime验证立即爆炸同一私有步的首次step，未把新弹默认为下一tick才动。
- 延迟不是activeAfterMs占位弹：hasBz且hasBd时一秒后才构造爆炸，读取原bullet活引用坐标；仅检查源宠hp，活父释放不取消。原拟用Phaser.Clock.delayedCall，经本地Clock.js发现其累计平滑/capped delta，已换成 `PetWorldDelayedCalls` 消费现有Game PRE_STEP绝对timestamp。`PetWorldDelayBridge`只转接，不新建Scene时钟；Party.destroy/Scene.shutdown清队列并卸listener。HeroParty已有import warning，此处仅新增一行已有port销毁，不引入新import/算法。world queue与事件桥检查卡顿时间跳跃、一次回调、P1/P2独立注册和幂等销毁；**浏览器暂停/世界退出的原版等价尚未通过**。
- 十个真实源码变异全部拒绝（水平追踪、扣距顺序、销毁后漏移动、数组正序、过滤dead、提前爆炸、错误取消活父、max99、漏hit callback、冻结延迟坐标）。两族normal六变异/猴八技能变异/马六技能变异回归，源文件finally字节恢复。
- 旧monkey family门禁仍保留41合同集合和各项责任：零delta生弹/430ms固定命中改由96 native normal Runtime用例复用，九技能改由108实际Runtime fixture，400ms奥义及错误XJ数量/末尾warp改由216原body+672原target对账。独立双Runtime共存/冷却/伤害release/消费者接线检查保留，HP-only事件推进一个实际host tick后断言release。旧数据207合同未删除。
- 猴/马range adapter已使用实际native碰撞与正式伤害port，在Runtime更新前记录hp/event游标，不再靠旧resolver强制命中；最小命中age取228/229原joint首个attack调用，而非旧root frameCount或身体holdTick。通用verifier将动作事件与后续callback生弹按actionToken关联，允许原max99普攻自然末帧清理；清理必须关联同一projectile，不再把HP下降伪装成清理。新增异帧出生正例、错token和漏清理负例；两族range语义及validator专项通过。旧门禁仍不能替代所有原84合同逐状态清单。
- 剩余：猴火焰和马冰冻目标owned效果、AoyiBuff及嵌套效果原生画布（现Horse falling View仍按旧八帧列表clamp，不能宣称长相位动画已复现）、目标对象离开数组但仍活的引用语义、delayed读取瞬时GXP等live source状态、暂停/父死亡私有弹推进和五关/TestScene全消费者。230继续承担共享怪物击退后续，226仍未完成。

本批联合门禁最终结果：`npm run check:system-design -- pet P1R P1H`退出0，日志`.tmp/pet226-current-design.log`。这只改变门禁状态，不覆盖上列冰火/画布/暂停等未完成项；226仍Ready、设计实施中/未退出。build通过（427模块，既有bundle大小warning）。

## 奥义目标引用增量（2026-09-25）

- 源依据：`PetHorse4.as` doHit5将数组元素直接传给setMoveTarget；`EnemyMoveBullet.as:24,47-51,163`保存BaseObject引用并读取该对象的死亡/ready状态，不按ID重新搜索世界数组。此前正式私有owner每步调用combat.target(id)，数组移除或同ID替换会丢失/替换追踪目标，确认为实现偏差。
- `PetProjectileCombatPort.bindTarget`由已有正式Stage1 port在出生时捕获对象，只暴露实时位置/存活读取；Behavior私有entry持有该读取器，运动仍走原公共私有owner。没有新世界管理器，也未改变碰撞候选数组或伤害目标查找。无绑定能力的受控fixture沿用其显式target输入。
- 实际Runtime新增36例（三帧率×双owner×两分帧×保留/移除/同ID替换）：原对象上移后继续向上追踪；其死亡后清引用并保留加速动量；复活或同ID新对象不重新吸附。原168实际碰撞/回调例同时通过。变异集新增恢复按ID查询反例。
- 本增量只核销上述对象身份缺口。怪物readyToDestroy与现代phase的完整映射仍归生命周期待验；瞬时GXP、冰火附属效果、原生画布、暂停与五关/TestScene验收未完成，不提升226整体状态。
- 下一步GXP核对入口：原`BasePet.as:270-285`由turnToGxp/cancelGxp修改对象字段，取消可由TweenMax延迟触发；现代`gxpRuntimeKeys`目前只出现在PetCombatTypes输入与PetCombatContext读取，正式Scene尚无该字段生产者。因此仅把延迟closure换成最新frame getter不足以证明正式GXP完成，需同时追溯实际buff入口与取消时钟，不能用测试注入冒充正式消费者。

## 延迟伤害读取GXP增量（2026-09-25）

- 修正上一条的推断边界：对现有legacy AS3语料检索turnToGxp/cancelGxp，只发现BasePet开启方法本身、其延迟取消和StageListener81重置时取消，尚未找到宠物开启调用者。英雄/怪物另有大小写不同的turnToGXP入口，不能作为宠物入口证据。故正式Scene没有gxpRuntimeKeys生产者是现状，但是否漏做可达玩法仍未知，不据此凭空实现技能或新增共享task。
- 已确认延迟闭包错误独立于入口可达性：原Horse4.hit5Hit延迟执行时setRole/setAction重新取角色getRealPower；Horse4.as:620从当前isGXP字段计算倍率。现代context此前保存命中frame布尔，后续输入取消或开启都不会改变延迟爆炸伤害。
- PetCombatContext的isGxp改为读取同一Session最新frame；Session仅提供currentGxp读取，不添加buff计时器/新状态机。首次context可用传入frame兜底，正式update仍是唯一输入入口；释放后的GXP独立取消可达性没有因此被证明。
- 原168实际奥义例扩到216：新增48例覆盖三fps/P1P2/分帧与两种追踪组合，命中后开启/取消GXP，爆炸hurt对账既有独立AIR getRealPower算术oracle；36目标引用例保留。新增真实生产变异冻结命中frame的布尔，要求被拒绝。输入GXP显式受控，不宣称源世界自动开启行为或完整正式场景GXP已实现。
- 本批不关闭226；后续优先冰火目标owned效果、AoyiBuff/递归画布及暂停/生命周期。GXP开启入口继续保留未知，不能把仅存在的方法自动当成当前五关可达玩法。

## 目标冰火状态机准备（2026-09-25）

- 新`PetTargetEffects`消费目标自身host step，保存原BaseAddEffect连续count、首次startTime、同名刷新保留hurt、到期null槽后当前fire项仍扣血。cancel调用hide；destroy清状态/断owner但不主动隐藏这两个原版显示对象，最终世界移除仍由外层负责。没有宠物owner引用或独立毫秒时钟。
- 源核对`BaseAddEffect.as:250-278,582-593,748-754,892,1138-1139,1330-1336,1636-1655,2944-2988,3562`。冰冻show仅对BaseHero调用setStatic/键盘锁，所有目标停止BBDC；怪物AI/移动禁止还要消费其效果谓词，不能把英雄键盘锁套到怪物。
- `pet-target-fire-tests`对账228 fire-air全部5950状态；`pet-target-ice-tests`对账229三fps、双目标、三碰撞对象、hero/非hero的17904状态，排除probe直接篡改isFirst的repeat-show。验证buff字段、首次show、hide、取消/销毁差异；sink不是真画布，不声称几何或BBDC实际推进已验证。
- **尚未接线**：模型当前没有正式消费者。下一步在成功命中后克隆原sourceRoleAttackInfoObject.addEffect到目标，以目标自己的host推进处理；需覆盖Registry、Stage13/21/22及TestScene，不能仅在可跳过的AI更新内计时。原宠物初始化火焰hurt seed、冰冻冻结/解冻、死亡奖励归属和实际视觉必须继续验证。旧petHorseIceRemainingMs只有写入没有消费，不能复用其绿色测试作为完成证据。

## 冰火正式命中与目标时钟接线（2026-09-25）

- 覆盖上一节“模型没有消费者”的状态：`MonsterPetTargetEffectSystem`现在由createStage1CombatEnemy创建并归目标持有，目标从出生就计时；Registry和Stage13/21/22在物理之后、AI之前推进，21/22的视觉recovery等待不跳过效果步。正式Scene传既有Game targetFps，按原host步累积，不由宠物存活/替换决定计时。
- 源依据补齐：BaseMonster.as:122创建BaseAddEffect；beMagicAttack:914-938在保护/去重/闪避通过后读取bullet.sourceRoleAttackInfoObject并clone/add效果，之后才扣直接伤害；reduceHp:1433采用int且不重新设curAttackTarget；myIntelligence:532和move:552分别检查PETHORSE_ICE/失控效果。未将普通AI函数当成唯一效果时钟。
- `generate_target_effects.py`逐源hash核对228/229 verified输入，投影九个攻击字典到正式`src/assets/pet-target-effects.json`，`--check`通过。保留hurt的原乘/除运算，不先合并浮点系数。猴Behavior enter保存构造时atk，后续buff/atk变化不重算火焰seed；马奥义仅doHit5的BD分支给hit5_1附2.4秒冰。常规实际弹体和奥义均携带该payload。
- 正式pet port调用既有resolveStage1PetHit，在去重/保护/闪避通过后写目标效果；被拒绝、重复或闪避命中不refresh。效果add克隆输入，refresh保留首次hurt。目标周期扣血使用AS3 int，不再次过防御、不生成第二次bullet命中、不修改lastHitBy；致死转dead，由既有Registry defeat收集/关卡奖励路径继续处理。
- 12正式port/Registry例覆盖三fps、两分帧与P1/P2、出生后7tick才着火的相位、拒绝命中、刷新、最后攻击者、一次defeated及ice AI冻结/到期。Monkey/Horse各108实际native Runtime例增加payload/真实受击目标/源release后效果保留断言；Horse4奥义216例增加BD条件ice断言。原生模型5950/17904状态继续保留。世界测试从明确的碰撞成功边界入手，Runtime测试另证真实native碰撞到目标写入。
- 当前限制：fireVisible/iceVisible还是供后续view消费的目标状态，**尚无实际FireBuff/PetHorseIceEffect画面、BBDC等价冻结验证、TestScene接线、世界remove/destroy与全部死亡清理映射**。ice暂阻止正式AI状态推进；实际怪物动画还需消费冻结状态。当前普通怪物/关卡回归通过不表示这些视觉与生命周期缺口完成。226原84合同仍未齐，不归档。

## TestScene/1-1目标持有与奖励缺口（2026-09-25）

- 源顺序重新核对：BaseObject.as:165-169先bbdc.step，228再curAddEffect.step；BaseBitmapDataClip.as:471的stopFrame门禁不推进计数/回调，566-575只切playing/stop标志。故冻结/解冻必须按效果步前身体状态，不能直接用效果更新后的iceVisible乘本帧delta。现有世界后置View调用尚未等价，未把朴素delta=0补丁写入生产。
- 正式1-1沿TestScene的Monster30路径，不使用1-2的Registry。此前适配每帧生成新Stage1对象，效果可能留在临时对象；如今Monster30创建时持有同一个MonsterPetTargetEffectState，adapter getter/setter转发，updateMonster30消费公共host累积函数。MonsterPetTargetEffectSystem仅抽出创建/推进入口，两种既有怪物模型提供自己的HP/死亡sink，无第二怪物Runtime。
- applyMonster30Hit增加默认true的reactsToHit参数；目标火焰以int伤害且false调用，存活时不改hurt/攻击动作，致死仍走既有dead清理。TestSceneWorldBridge已有大文件warning，本批仅给现有调用补传既有Game targetFps一处参数，无新Scene算法或import。12真实adapter/Monster30例覆盖三fps/两分帧/P1P2、创建后7host步才命中、fresh adapter持久性、非hurt火焰、死亡和ice到期；XP路由/画布明确排除。
- 有界只读子agent核对归属：monster30AuraTargets记录直接命中owner，targetSlot会被最近AI目标覆盖；claimMonsterExperienceForCurrentTarget优先targetSlot。主agent重放`pet-target-owner-preflight`：P1直接命中，P2为AI目标，火焰致死经验给P2。诊断输出在本地`docs/tasks/evidence/TASK-SLICE-226/target-owner-preflight.json`；退出0只证明反例存在。
- 原BaseMonster.reduceHp:1433-1468还区分curAttackTarget为BaseHero（有宠时双方各0.6）与BasePet（该宠全额），现代slot不能表示对象身份/换宠引用；AI合法重选和更多直接伤害消费者仍需补证。独立公共机制按拆分触发登记同线Planned `TASK-SETTINGS-231`，不把火焰来源当奖励owner，不在本批假定所有源入口已闭合。M-040降为部分复现，已证成长公式不撤销。
- 226仍Ready；下一步仍需原顺序的身体冻结消费、FireBuff/PetHorseIceEffect及奥义递归画布、暂停/死亡/移除清理。231与230均不抢占本次执行，也不能用其登记替代当前家族原合同完成证明。

- 本批验收：联合`pet P1R P1H`退出0（`.tmp/pet226-sandbox-effects-design.log`）；共享monster-runtime、13/21/22及独立stage11-flow回归通过；workflow通过，24个未完成定义/唯一Ready仍226。新增TestScene12例单独复验通过。构建通过，原有大chunk提示保留。
- 扩大到旧`system-tests`时发现未迁移合同：先遇到猴facade将“未学习/MP不足/冷却”合成新文字，已恢复各拒绝原因的既有诊断，不改变资格判定；随后停在`testPetMonkey1XjSpawnsProjectileAndDamagesMonster30`，旧断言要求出生矩形直接覆盖目标。当前源出生offset已经改变，且该测试随后手工applyMonster30Hit而不走碰撞。此项仍是失败，不删除断言或倒改源出生位置以求绿；后续须按真实Runtime源期望迁移该旧测试及相关消费者，`test:systems`不可标为通过。该失败独立于本次目标效果接线，仍属于226未完成清单。

## 旧总测试合同迁移（2026-09-25）

- 覆盖上一条未迁移状态：`system-tests`现通过。六个猴技能出生检查改为原宠物相对offset并检查出生不直接扣目标HP，保留原MP、CD、资格和独立HP入口断言；Monkey2/3 LJ分别检查禁用前置体与主弹体，Monkey3 XJ检查清LJ共享释放旗标而LJ自身保留旗标，Monkey4奥义检查不创建伪hit5弹体。实际碰撞/时序不是这些facade断言的声明范围，继续由108 native Runtime与216 body/672 target独立源对账负责，原41/43合同不删减。
- 主agent窄读原PetMonkey1 enterFrame/doHit2、PetMonkey2 doHit2_1/2、PetMonkey3 enterFrame/doHit3/doHit4、PetMonkey4 releSkill4；只读子agent独立核对同一限定范围。Monkey3 XJ用触发动作预置LJ旗标仅为验证清除，不意味着XJ需要该触发。`system-tests.ts`已有warning，本次仅替换相关断言和一处函数命名，不新增机制或扩大大文件职责，故局部修改。
- 完整`test:systems`继续揭示青龙消费者fixture仍把`petProjectileCombat`模拟为裸函数，缺少226新增的readyRoster入口，导致TypeError；生产readyRoster对青龙本来直接返回。两个龙consumer fixture补齐该端口并强制active species为dragon，拒绝让猴马误走免资源检查。Dragon1单独复验通过，剩余全套正在复验；这是测试适配修复，没有改变青龙生产行为。
- 回归结果补齐：`.tmp/pet226-legacy-full-systems.log`保留首次全套运行及Dragon1入口缺失失败；修复后Dragon1（`.tmp/pet226-dragon-consumer.log`）、Dragon23前置collision/runtime（`.tmp/pet226-legacy-systems-remainder.log`）及从Dragon23 consumer至末尾Monster asset ownership的全部剩余注册项（`.tmp/pet226-legacy-systems-remainder2.log`）均通过。成功前缀未重复运行，按同一生产源码/仅修正失败fixture的分段结果覆盖默认清单；不抹除首次命令退出1的记录。
- 后续冰效资源已窄定位到229 verified manifest的`naturalDisplay`：`ice-0/ice-1`均为StageCommon字符40 `PetHorseIceEffect`单帧，基准75×137、crop(-33,-68)、源local bounds74.9×136.55；两native PNG相同SHA256 `9977a34560b6d6ce09fec5dee94acb6b52d6d6e6f620ef0f09937ea14b06ec1a`。显示缩放须按源bounds而不是PNG取整尺寸，目标附着/冻结顺序还需正式view消费，当前未新增假冰图层或宣称视觉完成。
- 本批联合`pet P1R P1H`最终退出0，完整输出`.tmp/pet226-legacy-design.log`；workflow和diff检查通过，7活跃PG已审计，未归档PG。此次仅测试/记录增量，未改生产源码，不无变化地重复build。226仍Ready，下一实施项是目标身体冻结与原生附属显示，保持现有实现合同与未完成生命周期清单。
- 冻结接入只读调查定位：13/21/22 GameplayBridge均为physics→effect→AI→view，12走Registry后置view，11/TestScene也后置updateAllMonsterViews。Stage11/12/21等view已把身体推进与`updateAttackViews`分开，后者不得随目标身体冻结。步前状态只用于重现`BaseBitmapDataClip.step`的stopFrame门禁，不能照搬成“冻结物理/所有AI”：原BaseObject仍执行物理，BaseMonster.step先super、IntelligenceTime另调用myIntelligence，其门禁读取buff存在性而不是显示标志。子agent“步前状态同时冻结AI/移动”的泛化不采纳；分帧和同一render内跨多个host tick仍需主agent验证后实现。

## 原版冰效资源与目标视图接线（2026-09-25）

- `generate_ice_asset.py`从229 verified naturalDisplay的ice-0/ice-1投影，校验恢复StageCommon SWF与native PNG的SHA256，不重画或重渲染源图。运行必需PNG在`public/assets/pets/monkey-horse/PetHorseIceEffect.png`、小型机器投影在`src/assets/pet-horse-target-ice.json`，均不被Git忽略；运行时不读本地证据。原bundle增加该image，随现有猴马资源就绪加载。
- `PetHorseIceAsset`使用源74.9×136.55边界和(-33,-68)裁剪注册点，而非75×137取整PNG尺寸做width/height换算。缩放按原Flash 16.16正数截断；12912条229原生附着矩阵逐项一致，PNG字节hash及尺寸一致。生成器`--check`通过。
- `MonsterPetIceView`只消费目标的iceVisible，首次host效果显示后创建，跟随目标根坐标，不跟随身体朝向翻转；沿用218已验证怪物colipse运行尺寸。图层与自身body同depth并紧邻其上，不把所有冰效统一提升到所有怪物之上。取消时移除，重新附着时新建，世界view销毁幂等清理。Stage11/TestScene、12、13两种复用桥及Monster5、21、22都调用此公共view；13的Stage11包装转发目标效果状态。
- 冰view不推进身体/攻击时钟，已有attack view更新不受影响；Stage11可见性入口同时控制冰view。新增实际helper测试验证首次host前无图、双目标隔离、Monster30缩放、移动/隐藏、cancel/readd与两次destroy。五关既有monster视觉/流程回归、asset bundle回归与build通过。
- 当前仍非视觉结项：缺实际Phaser画布逐状态与原版组合基准对比；边缘采样/缩放微差需如实记录，未宣称像素一致。身体动画的首冻结/到期步顺序、FireBuff、AoyiBuff及全部暂停/死亡/移除生命周期仍待。226保持Ready，原84合同不删减。
- 冰显示接线批`test:systems`完整单次退出0（`.tmp/pet226-ice-display-systems.log`），联合P1R/P1H退出0（`.tmp/pet226-ice-display-design.log`），新增显示测试确已纳入P1H。随后真实浏览器发现启动帧率反例，见下节；上述绿色证据不覆盖该遗漏。

## 真实启动帧率反例与修复（2026-09-25）

- 4174内置浏览器先打开主页，再进入已有`?qaStage=1-1-role1`（画布明确SAVE disabled for DEV）。没有操作存档。默认猴一出战，实时报`Unknown monkey collision phase PetMonkey1Bullet2/122/-1`，调用栈为私有owner→实际Session→TestScene；模块为`index-3u78My7V.js`，日志时间2026-09-25T08:00:16.177Z。尚未成功触发马冰，不能把此次入口观察称冰画布通过。
- main原GameConfig不设置fps，消费者却将game.loop.targetFps直接当源host fps，默认Phaser值超出游戏20/24/30合同。main现从既有loadGlobalSettings读取持久设置并在构造Game时配置fps.target，不改碰撞profile、不夹紧phase、不覆盖用户设置。错误源于真实入口未纳入原先三fps注入测试，已回写PG-017方案不足。
- 新`game-startup-frame-rate-tests`解析并执行实际main的GameConfig初始化表达式，只替换Scene构造器/Phaser常量，验证保存20/24/30、缺省、损坏及非法60的启动值，以及启动不写设置。6例通过，加入默认系统清单及P1R/P1H；测试自身首次直接bundle TypeScript遇ESM动态require错误，改用已有createRequire方式后通过。构建通过，浏览器已重载新构建继续复验。
- 重载后的DOM脚本为`index-DKDEBOcC.js`，实际QA关卡继续运行并显示猴技能消耗MP（150→90）；错误列表仍仅保留旧`index-3u78My7V.js`的08:00:16事件，没有新构建错误。未读取或修改浏览器隐藏游戏状态、存档；这证明该入口反例在观察窗口未复发，不扩张为全家族完整浏览器验收。4174 preview可保持运行，浏览器tab作为后续验收入口保留。
- 最终增量复验：启动修复后的联合`pet P1R P1H`退出0（`.tmp/pet226-startup-fps-design.log`），已实际运行新增main配置和冰显示检查；build、workflow、diff与生成器check通过。冰显示之前的完整系统命令退出0，启动修改另由实际配置专项和联合门禁复验，不声称原整套日志来自后一次main版本。下一步继续226身体冻结/冰画布与其余附属生命周期；不切换230/231，不提交或上传Git。

## 目标身体冰冻时钟消费（2026-09-25）

- 源窄复核BaseBitmapDataClip.as:461-515：step每次推进一次body逻辑，stopFrame门禁包住frame script/hold/advance，类中无frameClips换算；BaseObject.step仍先body后effects。现有五类怪物visual模型均以1000/30为一逻辑tick，不能将20/24 host间隔直接当成相同数量的逻辑body tick。
- 目标既有host累积处在每个effects.step之前检查旧iceVisible，将可推进的body tick计入pendingBodyTicks；未新增第二delta时钟。五个既有view消费这些tick并换算各自VisualTickMs，仅一次取走。首次show步保留一次推进，到期步保持冻结，下一步恢复；partial render不凭空推进，跨多个host步保留每步先后。未进入world时钟的纯view/无目标效果状态消费者仍沿原delta入口；正式目标从首次world推进起消费同一时钟。
- 只换身体模型的delta；原attack view仍接实际delta，既有物理、AI buff谓词与伤害入口未冻结。重复零delta完成查询不会重复消费。每个目标只有一个身体视图消费者的现有约束保持；不支持拿同一状态驱动两个独立身体view。
- `pet-target-ice-body-tests`直接调用五个正式VisualBridge与真实atlas几何，在20/24/30×整步/四分步检验first/expiry/resume、重复零delta及攻击继续推进，再覆盖跨show/expiry的4host批步，共35例通过。基准是源顺序约束下仅在允许步调用未冻结的实际视觉模型，不把它称原生完整怪物运行；原body帧表沿用既有真值。
- build、完整`test:systems`退出0。只读子agent复核未发现冻结计数/攻击推进的新错位；其Monster3入参“Pick变必需”判断经主agent复核为误报，原字段带?且Pick保留可选性，build已覆盖两处Boss调用，不做无证改动。仍须保留完整callback顺序限制：view仍晚于physics/effects/AI，火焰致死或同帧action切换的body帧需要继续独立验证；本批只闭合可推进步数，不宣称全怪物调度重建完成。

本批最终复验：联合 pet P1R P1H 退出0（.tmp/pet226-ice-body-design.log）；四个生产变异 post-effect-freeze、replay-consumed-body、ignore-body-freeze、freeze-emitted-attacks 均被拒绝且原文件恢复。此前build、完整system-tests均退出0。完整回调顺序和画布边界仍按本节保留，226未关闭。

### 身体/效果顺序反例（2026-09-25）
- 实际Monster30模型与Stage11动画consumer的有界诊断：hit1已选中、HP=1、首次fire tick伤害1；20/24/30 fps均先死亡再绘制，当前回调0，而先body比较路径产生1个monster30Hit1，死亡actionTick也提前为1。入口tools/pet-target-body-order-preflight.ts；本地JSON为target-body-order-preflight.json，明确not-acceptance。
- 源依据：BaseObject.as:169/228先body后效果；BaseBitmapDataClip.as:470先enterFrame再减持帧；Monster30.as:154..181在hit1首帧持帧计数10发射；BaseMonster.as:1444..1446致死切dead。当前比较仍借用现代动画consumer，不能替代原AIR组合或实际Scene验证。
- 需在正式目标更新/身体consumer间恢复因果顺序；单纯记录允许身体步或在死亡后补一个显示事件不能证明攻击源位置、存活弹体及伤害回调正确。此边界仍归226，不关闭原84合同。

- 后续消费审计：TestSceneCombatBridge.applyMonster30AttackToPlayers读取monster.activeAttack/getMonster30AttackHitbox，Monster30System.applyMonster30Hit在致死时清空activeAttack；原Monster30.doHi1创建独立SpecialEffectBullet。源死亡与销毁的弹体寿命仍需动态区分，不能仅修绘图调用先后来宣称伤害正确。已建同线Planned TASK-SETTINGS-232补公共怪物顺序/独立攻击合同并生成公共实现；226仍Ready，相关原合同未核销。

### 原生目标火焰资源投影（2026-09-25）
- generate_fire_assets.py从228 verified naturalDisplay提取FireBuff（StageCommon character189）20帧，逐字节核对原PNG/hash、源SWF hash、原timeline长度与帧选择；第21/22原生样本分别与1/2帧字节相同。没有重新绘图或把多帧压成静态。
- 正式public/assets/pets/monkey-horse/FireBuff-01..20.png与src/assets/pet-monkey-target-fire.json进入pet-monkey-horse既有bundle；正式运行不依赖忽略的证据文件。生成器--check及20帧尺寸/hash/bundle检查通过，加入P1R。
- 源BaseAddEffect.show_mpetmonkey_fire直接addChild于sourceRole，不采用冰效果的colipse缩放。原gameSetting把stage.frameRate设为20/24/30；自然MovieClip时钟及暂停/目标清理仍需与正式view共同验证。本批只是资源就绪，尚无火焰view consumer，不宣称火焰画布完成。

### FireBuff普通暂停原生补证（2026-09-25）
- tools/pet226-body/fire_pause_probe.py逐字提取MainGame.stopGame/continueGame和AUtils.stopAllChildren/startAllChildren，运行于现有AIR，加载恢复StageCommon原FireBuff。20/24/30 fps各14态共42态：普通暂停期间世界ENTER_FRAME步数固定、弹体子clip帧固定，目标FireBuff每帧继续播放；恢复后弹体继续。报告docs/tasks/evidence/TASK-SLICE-226/fire-pause-native.json。
- 精确边界：空英雄数组、受控monster/bullet容器、键盘/Tween为stub；不是全游戏UI暂停，也不覆盖OutAndStopGame将stage.frameRate设0的另外路径。原stopGame只递归弹体，continueGame还递归怪物，不能按恢复逻辑推断暂停对称。正式view须分开自然clip播放和效果伤害寿命时钟。
- 资源批次最终联合门禁退出0（.tmp/pet226-fire-assets-design.log），build=0；火焰view与正式画布仍待，226未完成。

### 目标火焰view接线（2026-09-25）
- MonsterPetFireView由五关既有visual bridge创建/销毁，消费fireVisible与原20帧/裁剪注册，不持HP或效果寿命。播放使用Game poststep时间戳，Scene普通pause不停止自然clip；Scene shutdown或目标view销毁解除全局listener。刷新仅同步目标引用/位置，不重建图；原效果直接destroy仍保留显示，正常cancel隐藏。
- pet-target-fire-display-tests对照42原生暂停帧，另覆盖刷新、临时wrapper位置更新、效果destroy与view/Scene清理；35实际bridge冰冻回归通过。仍是Phaser显示替身，实际画布、冰火同时显隐的叠层顺序及同一次render内取消后重加边界尚未覆盖，不关闭视觉合同。

### 冰火附属顺序/同帧重建原生补证（2026-09-25）
- tools/pet226-body/effect_attachment_probe.py逐字提取BaseAddEffect四个show/hide方法，加载恢复StageCommon原生FireBuff/PetHorseIceEffect。8态记录两种插入顺序、重复显示、同回调隐藏重加；重复显示保留对象身份，重加创建新对象并置顶。报告docs/tasks/evidence/TASK-SLICE-226/attachment-native.json。
- 受控Target colipse/BBDC为sink，未验证伤害/正式Scene/组合像素；可证明附属对象身份与显示列表顺序。当前现代仅保留可见boolean，丢失同render重建身份，固定view调用顺序也不能代表源显示列表顺序。后续需目标显示创建序号供view消费；不能用最终可见相同判定正确。

- 正式修复：目标效果show记录单调displaySerial与fire/iceDisplayId，只有不可见→新显示才换身份；刷新与重复show不改变。Fire/Ice view按源对象创建序号重建并排层，保留其他附属身份；不增伤害/寿命时钟。
- pet-target-attachment-tests读取8个原生状态，使用实际两个view consumer对账层级和对象身份，覆盖无中间render的到期重加；8态通过，42火焰暂停和12912冰矩阵/35身体例回归通过。混合效果实际像素仍未验证。上一火焰view批次联合P1R/P1H已退出0（.tmp/pet226-fire-view-design.log）；本批需独立联合复验。

### 马奥义前置显示资源投影（2026-09-25）
- 原BasePet.addAoyiBuff创建FollowBaseObjectBullet，setDirect(0)、setDisable、setAction(null)，归原宠物magicBulletArray持有；不是可伤害弹体，也不是目标FireBuff一类的附属MovieClip。
- generate_aoyi_assets.py核对229 verified naturalDisplay内StageCommon character120的39态，20/24/30三组同帧PNG逐字节一致，投影13个可见帧。原timeline为14帧；12条P1/P2、双向、三fps自然生命轨迹均显示1..13，进入14后dead且不attached，不发布伪末帧停留。
- 正式路径public/assets/pets/monkey-horse/AoyiBuff-01..13.png及src/assets/pet-horse-aoyi-buff.json已生成，--check通过。尚未进入bundle或Behavior/view，不宣称奥义前置已实现；下一步按原创建回调与私有Follow生命周期接入，暂停/受伤/源销毁需各自对账。

### 马奥义前置生产接线（2026-09-25）
- 原PetHorse4.releSkill4先addAoyiBuff，再保护/attackId/身体动作，因此前置在prepare成功释放路径创建，不能延迟到hit5命中回调。新PetHorseAoyiPrelude经既有Behavior私有弹体owner持有，disabled/Follow、固定初始direction0、hurt cut、14终止步；不投递伤害且不消费碰撞field。
- 13原帧进入既有pet-monkey-horse bundle与PetHorseEffectUsage，正式共享视图直接消费petHostTick与私有位置。12 Runtime覆盖三fps/P1P2/拆帧的早于落雷出生、零伤害、MP与14步结束；已有216奥义命中和36目标引用回归通过。旧引用fixture等待任意弹体会被真实前置提前结束，已改为等待指定PetHorse4Bullet5，不更改伤害预期。
- 初次build暴露tuning必需distance字段遗漏，已补undefined后重跑；新用例初次远距目标超索敌范围没有释放，改为原范围内目标后12例通过。原失败日志不作为验收。暂停、受伤/源销毁和实际画布仍待。

- 最终build退出0（.tmp/pet226-aoyi-prelude-build-final.log）；本批联合P1R/P1H已启动，输出.tmp/pet226-aoyi-prelude-design.log，尚未取得终态，不沿用上批结果。

- 奥义前置18组/288原生私有owner状态通过（pet-horse-aoyi-prelude-follow-tests）：实际调用固定direction0，按位移差对账受控fixture初始offset；真实创建位置另断言等于源位置。覆盖三fps、双owner、自然/移动受伤/显式销毁，任何碰撞查询直接失败；普通暂停与完整场景仍未覆盖。
- 初次联合门禁非零来自猴变异脚本恢复OSError22，inclusive-edges残留已按上一aoyi-mutations.json源SHA256 99ba3e98c90c2af43e9e1d2d07947722c648a4e09d49c5796a401a4e66f1a009恢复并核对。脚本原子替换/有界重试后7变异通过且原字节恢复；完整联合已重试，输出.tmp/pet226-aoyi-prelude-design-retry.log，不能计初次为通过。

### 普通暂停与局部step2探针边界（2026-09-25）
- 原MainGame.__enterFrame→PhysicsWorld.step→BaseHero.step/setPet/updatePet→BasePet.step推进私有弹体；stopGame移除world ENTER_FRAME且只递归hero/monster直持弹体，不递归宠物私有数组。BaseBullet.step2虽有isStopGame切换停播逻辑，但停止world后该方法不再被调用。
- 扩展fire_pause_probe以原生AoyiBuff置于独立宠物私有弹体容器，普通pause42态中其帧继续1..14；世界步停止、怪物弹体子clip停止、目标FireBuff继续。受控probe未调用私有step2/终止清理，不证明恢复寿命或完整UI。旧229 pause fixture继续调用step2，不能移作此入口预期。
- 当前正式petHostTick显示随Scene pause冻结，需要继续实现独立显示相位及恢复清理对账；不能只推进视图后仍用旧战斗age碰撞/结束。该边界仍归226。
- 联合retry因disabled-attacks负例得到TypeError而不是AssertionError失败，fixture补明确禁止查询断言后8个生产变异通过；42火焰显示和18/288前置follow回归通过。完整retry2进行中：.tmp/pet226-aoyi-prelude-design-retry2.log。

### 普通长暂停跨末帧补证（2026-09-25）
- fire_pause_probe.py --long-pause在三fps各28帧共84态中暂停3..18，原生AoyiBuff持续经过14并循环1；报告fire-pause-long-native.json及本地逐帧PNG，仍未运行私有step2/恢复终止清理。为避免AIR退出请求后的排队帧污染，探针注销EXIT_FRAME并设终止guard；首次app:/写图拒绝改为已授权工作目录的native文件路径，不改源SWF。
- 新采1..13各帧PNG与已发布资源SHA完全一致，两个14帧周期逐帧字节相同；这补证现有13帧资源在正常路径正确，但普通暂停需支持14帧与循环，不能夹紧13。
- 联合retry2在旧落雷出生测试的总弹体数为0断言失败；现分别断言1个前置与原数量落雷，96原出生例与12前置Runtime例通过，不改原出生坐标/目标序/TTL预期。下一联合复验仍需运行。

### world暂停后的原生私有弹体恢复（2026-09-25）
- aoyi_world_pause_probe.py复制229原BaseBullet/Follow准备产物到独立226目录，保留源方法，仅修改受控调用者在world暂停时不执行step2；双owner、三fps、pauseEnd=5/12/13/18，共1536 enter态。报告docs/tasks/evidence/TASK-SLICE-226/aoyi-world-pause-native.json含复制源码hash、probe hash和全态。
- 暂停期间不碰撞、不调用base step，但clip继续循环。自然及短暂停首次dead在world tick14；pauseEnd18跨过末帧后恢复，首次dead在tick28。现代必须区分显示相位与战斗寿命步，并按恢复时实际显示帧检查清理，不可简单把暂停时长加到TTL或夹紧末帧。受控owner/target/collision仍为sink，不代表现代Scene验收。
- 联合retry3到旧horse body emission任意弹体计数断言失败；现在逐tick断言释放前置数、伤害弹体仅在原callback生成，原MP/时点均保留，90例通过。retry4启动，输出.tmp/pet226-aoyi-prelude-design-retry4.log。

### 奥义前置自然相位正式消费（2026-09-25）
- PetWorldDisplayBridge从既有Game prestep的delta与目标FPS累计自然显示tick，普通Scene pause仍推进；port只提供读取器。PetNativeClipClock按出生点读循环帧，前置私有owner绑定读取器、恢复step时依据真实帧14清理；战斗age/TTL并未加暂停时长。正式horse view在Game poststep只读取自然帧并换图，不负责伤害/销毁判定，destroy解绑listener。
- AoyiBuff运行投影新增nativeFrameRasterIndices，14→13别名经长暂停三fps原PNG hash核定；没有伪造第14图。12普通Runtime例与1536原生相位helper例通过；另1536实际world display bridge→私有owner→formal horse view状态逐项核对原恢复轨迹，覆盖暂停显示、按帧清理与listener释放。显示对象为Phaser替身，不是实际canvas/正式Scene验收。
- 本改动只接奥义前置自然相位，其余猴马私有弹体仍按petHostTick，暂停合同仍未全闭合。正常普攻末步变异anchor随新条件更新，仍应拒绝提早结束。上批联合retry4已退出0（.tmp/pet226-aoyi-prelude-design-retry4.log）；本批须另跑联合门禁。

本批最终验证：build=0（`.tmp/pet226-native-clock-build-final.log`）；联合P1R/P1H=0（`.tmp/pet226-native-clock-design-retry.log`）。初次失败为马奥义变异恢复OSError22，context按先前报告SHA256精确恢复，脚本原子替换与备份后12变异拒绝。浏览器4174的TestScene猴与Stage12马四阶实际启动/移动/战斗已观察，无新error，但未捕获奥义前置/冰冻/暂停逐状态画布，不据此关闭视觉合同。下一步仍为其余私有效果自然显示相位与完整生命周期、84合同及画布。

## 马奥义落雷显示相位（2026-09-25）

- 旧共享view对8张落雷图一律夹紧末帧；229原生递归phase与226长寿命HitTest实测证明tick0/1为子帧1，后续仍切换。不是从根frame=1或帧数自行假设循环。
- `generate_falling_assets.py`从229 verified naturalDisplay投影8张PNG及其逐帧crop/注册点，三fps字节一致；源包SHA及source/formal两份0..320逐tick phase一致，生成正式`src/assets/pet-horse-falling-display.json`。原193c固定158×32图与原生crop不同，正式usage消费新投影，原提取文件不动。
- 既有pet-monkey-horse bundle加载新图；共享horse view消费显式hostFrameIndices，321之外拒绝，不推断无限周期。伤害/运动/TTL未改，普通暂停仍未接入此弹体。
- 1926实际共享view状态对账原phase、原PNG SHA、注册点、位置、销毁与bundle；1536前置暂停状态及旧horse动画回归通过。build=0，联合P1R/P1H=0（`.tmp/pet226-falling-display-design.log`）。全系统日志`.tmp/pet226-falling-display-systems.log`仍待终态。
- 正在采集13种马弹体普通world暂停3..52、观察至128的原生生命周期，入口`horse_world_pause_probe.py`；它不修改229准备产物或legacy。该探针只补原资料，不代表所有现代暂停已修复，也未覆盖落雷128之后的TTL。

### 落雷批次终态与下一处具体反例

完整system-tests退出0（`.tmp/pet226-falling-display-systems.log`）。本批源/实现/测试文件已保存，未提交Git。

`horse_world_pause_probe.py`三fps均退出0，共39936原生enter态，索引`docs/tasks/evidence/TASK-SLICE-226/horse-world-pause-native.json`，分fps数据与PNG位于`local-resources/regima/task-outputs/TASK-SLICE-226/horse-world-pause-air/`。13种构造方式、P1/P2、两个direction，暂停3..52，观察至128；保留受控target在tick9死亡，源在暂停tick4移动翻转。未覆盖falling更晚TTL或完整MainGame画布。

`pet-horse-world-pause-preflight.ts`运行实际私有owner和world display port，13种常规释放配置×三fps×双owner×双direction×两模式=312例；156自然一致，144/156暂停清理反例。该工具是诊断，非P1H通过合同，报告`horse-world-pause-preflight.json`。当前尚未把这些非AoyiBuff弹体接入自然相位：恢复碰撞仍读战斗age，末帧清理同样错误。后续必须同时检查递归子相位/碰撞和显示，不可只修清理或按根frame取模推断子树无限周期。已有native collision profile可用于0..121或落雷0..320的精确相位交叉核对；更长暂停的周期语义仍须源证据，禁止末帧夹紧。

## 马私有弹体普通暂停时钟与sp子树显示（2026-09-25）

- `horse_world_pause_probe.py --long`独立226目录补暂停3..140、观察至192，三fps共59904 ENTER态，并保留每fps EXIT态。旧3..52/128探针不覆盖；完整source/owner/target控制边界见索引`horse-world-pause-native-long.json`。
- `native_phase_model.py`从已经审计为无帧脚本的原SWF时间轴构造有限显示状态，区分普通前进的Shape替换、倒带重建、pending construction和持久子MovieClip。`generate_horse_clocks.py`重新解析原XML拒绝未知action/clipAction，并核对源/脚本/原碰撞oracle哈希。10种马根clip状态循环与1220原生完整递归碰撞相位、41004存活私有暂停状态一致；sp根8帧/子15帧的完整周期为120，不能只按8取模。
- `src/assets/pet-horse-native-clocks.json`进入正式输入；`PetHorseNativeClipClock`仅绑定world display port读取器，原私有owner仍持逻辑age/伤害/销毁。常规马普攻、技能及奥义落雷/爆炸发射接入；碰撞field与实际sample共同使用canonical native phase tick，命中间隔和限时TTL仍用暂停的逻辑age，根末帧清理由自然frame决定。
- 原312例诊断144暂停清理偏差已变0；初次反例日志保留`.tmp/pet226-horse-world-pause-preflight.log`。诊断现抽为fixture，624例硬测试覆盖两种暂停长度、常规13释放配置、双owner/方向/三fps，核对清理与递归碰撞相位选择。它不包含实际target伤害/画布，也不能替代奥义落雷完整暂停运动/延迟爆炸合同。
- 落雷view poststep已改按canonical子相位索引，新增1926只暂停战斗age的显示态；此前1926自然态保留。马常规108实际Runtime/正式伤害用例现提供displayTick，验证新的发射绑定路径。
- clock批build=0、完整P1R/P1H=0（`.tmp/pet226-horse-clock-design.log`），拒绝“恢复用战斗age取碰撞”“按根周期取碰撞”“冻结末帧清理”三新增生产变异。
- sp显示继续补了`task-slice-226-horse-sp-pause-display.json`：363原生完整显示态/1311对象通过UI Schema及三fps字节一致，正式投影仅9张原PNG（约28KB）与122项canonical索引，既有bundle/shared view消费。9216原EXIT态由实际私有owner/Game clock/shared view对账原PNG SHA、原注册点、翻转和清理，非整页画布声明。build=0（`.tmp/pet226-horse-sp-display-build.log`）；最终联合门禁正在`.tmp/pet226-horse-sp-display-design.log`，新增“暂停显示仅取根帧”变异，未以clock批0替代。
- 猴侧初步时间轴模型对九种root与既有原生碰撞相位零差异（`.tmp/pet226-monkey-native-phase-preflight.log`），但尚未绑定现代猴。`monkey_world_pause_probe.py`正在独立目录采集暂停3..140、观察至280，覆盖限时xj；不自动推广马结论。

仍待：猴普通暂停的时钟/碰撞/显示与实际清理，马落雷/延迟爆炸的完整暂停组合，逐状态实际画布与全部原84合同。共享怪物事项仍分别由230/231/232持有；226未完成。

### sp批次终态、实际Phaser注册点反例与猴源补证

sp联合P1R/P1H（`.tmp/pet226-horse-sp-display-design.log`）和完整system-tests（`.tmp/pet226-horse-sp-display-systems.log`）均退出0。之后检查实际渲染发现Phaser flipX绕纹理中心，Flash原clip负scale绕注册点；旧view的sp镜像四边形偏移163坐标单位。`pet-native-image-quad.ts`提取并执行当前安装Phaser的真实batchSprite函数与TransformMatrix，以原PNG尺寸、crop、原root矩阵核对最终顶点；`.tmp/pet226-horse-origin-before-quad.log`是真实语义失败，之前before.log仅为TypeScript动态require的测试装载失败，二者不混淆。

共享马view改用负scale；9216 sp原EXIT态、1926自然及1926暂停落雷显示态、1536前置暂停态通过（`.tmp/pet226-horse-origin-after.log`）。浮点矩阵坐标容差0.0001，不声称GPU像素一致。新增恢复纹理中心flip变异，build已退出0（`.tmp/pet226-horse-origin-build.log`），当前联合门禁位于`.tmp/pet226-horse-origin-design.log`，尚待终态。

猴普通world暂停原生采集已完成：九symbol×P1/P2×两个direction×自然/暂停3..140，观察至280，三fps共60480 ENTER态及对应EXIT态，索引`monkey-world-pause-native.json`。源有限模型对既有0..121递归碰撞相位及18772存活暂停before态均一致（`.tmp/pet226-monkey-native-phase-preflight.log`、`.tmp/pet226-monkey-world-phase-preflight.log`）；猴一普攻根10帧但全子树周期30，不可按根帧循环。现代猴尚未消费该时钟，源补证不算现代修复。

## 猴普通暂停正式消费与马暂停出生（2026-09-25）

- 猴原384实际私有效果诊断中144反例见`.tmp/pet226-monkey-world-pause-before-retry.log`，包括猴一普攻原tick150、现代148清理与141碰撞相位不符。有限源时钟生成器以`--monkey`复用来源验证，1098完整递归碰撞相位和18772存活before态一致；`PetMonkeyHorseNativeClipClock`替代旧仅马helper，两族共同绑定既有world显示port，战斗TTL/ID仍由原private owner持有。384清理/位移/碰撞硬用例及108实际Runtime技能回归通过。
- 显示生成草稿在猴一phase16拒绝pending子节点：原capture按flat frames共用ENTER/EXIT键，使同帧号的未构建Shape污染截图。`monkey_world_pause_probe.py`在独立226目录按created/enter/exit分键重采，旧228数据不改；随后324原生Schema态/1041显示对象/59逐字节原PNG进入正式projection及bundle。107520 EXIT态用实际private owner、Game clock和shared view核原PNG、位移、Phaser真实quad与清理；镜像同样绕注册点。不是GPU/全Scene像素证明。
- 猴build=0（`.tmp/pet226-monkey-pause-build.log`），五新增生产变异拒绝。首次联合在冰冻变异脚本Windows写回OSError22失败，两个生产文件哈希都与上次成功报告完全相同，未残留变异；四冰冻变异单独重跑0。当前五个226生产变异入口统一使用`mutation_io.py`完整临时文件原子替换、有界重试和本地原字节备份。猴最终联合P1R/P1H=0（`.tmp/pet226-monkey-pause-design-retry.log`），首次失败保留。
- 原马`horse_world_pause_probe.py --aoyi above/death-at-9`各三fps采34560 ENTER态，暂停3..140、观察至480，覆盖原活目标耗尽TTL与中途失去目标。96实际私有owner例/46080态对账位置、速度、距离、TTL、目标丢失与碰撞相位通过；出生坐标在此按独立构造fixture对齐，实际body出生另由既有96 Runtime例持有；无碰撞成功或延迟出生声明。
- `horse_explosion_world_pause.py`复制229原hit5Hit/TweenMax准备产物，world暂停7..(2fps+10)跳过body/private step；三fps合计76160 ENTER/EXIT态、60原生wall-clock回调均在暂停中执行。成功命中边界、HP/ready/引用移动是受控输入，不是实际碰撞或完整MainGame；36个实际产生延迟爆炸的轨迹均呈现首帧1、1、2、3。
- 新正式consumer反例`.tmp/pet226-horse-paused-birth-before.log`：模型已在暂停回调中产生爆炸，但view只在Scene.update创建，图像0而原版attached=true。共享horse view现Game poststep同步同一弹体列表，包含暂停期间append的新对象，仍不推进伤害或清理。进一步发现旧port先timer后display导致出生次帧过早到2；正式bridge改先display后timer，AST执行真实bridge函数（仅未用资源加载/读图为硬失败stub）直接核对注册顺序。中间两个real-port日志为Phaser Node打包依赖失败，不算游戏语义反例；此前phase.log是实际两bridge旧顺序的语义反例。
- 60延迟回调例/2388暂停显示态、sp9216、前置1536、落雷1926自然+1926暂停及96运动例通过（`.tmp/pet226-horse-paused-birth-after-real-port.log`）。新view创建遗漏与timer先行两生产变异已加入本批门禁；build=0（`.tmp/pet226-horse-paused-birth-build.log`），联合门禁`.tmp/pet226-horse-paused-birth-design.log`待终态。
- 实际4174无存档TestScene已启动、打开原暂停菜单并恢复，未观察到console error；未捕获全部效果逐状态画布，不能用这一检查关闭视觉合同。

继续点：收齐马暂停出生批联合门禁/全系统/workflow/audit；余下原84合同逐项核销、暂停恢复后的延迟爆炸清理/源释放组合与实际逐状态画布。公共230/231/232仍为独立待办，226保持Ready、未完成。

## 马私有效果实际画布与共享Canvas边界（2026-09-25）

原生 --render 探针完成三fps/59904 enter及exit。generate_horse_sp_display.py --all-horse 产出909 render states、3447对象、94 distinct rasters，Schema verified；八个旧效果改由正式PetHorseAnimationAssets和bundle消费。既有SP复用字节相同的HorseSpNative九图；落雷的规范相位去重顺序不同于旧1..8帧序，错误按index别名被generate_falling_assets.py --check拒绝，已恢复旧落雷原图并保留独立相位投影，不把失败当验证通过。九张本轮多余SP文件经未跟踪清单及SHA相同核验后删除。

实际浏览器运行850个完整canonical EXIT状态/双方向，expected来自独立AIR截图：旧WebGL302态失败（八个马效果），修正后850态零alpha和预乘RGB残差。报告horse-display-webgl-before/after.json保留聚合与源码/bundle/input hash，不能当完整Scene/HP或身体验收。Canvas生产等效roundPixels=true有654态失败；关闭取整的诊断fixture850态零残差，确认Phaser batchSprite的fw/fh+0.5分支；生产main未改变，共享修正独立列Planned TASK-SLICE-233，226仍唯一Ready。

验证：.tmp/pet226-horse-native-build.log、pet226-horse-native-design.log、pet226-horse-native-systems.log均退出0。暂停出生2388、SP9216、落雷显示/暂停各1926态通过。动画旧测试30张爆炸图片假设改为完整32索引映射（含初始/循环首相位）且索引必须有图。首次命令拼错SP测试文件名失败保留；重跑实际测试通过。猴/default SP/falling --check通过，all-horse最终check待收齐。

只读gpt-6-luna子包contract_226_remaining核对剩余runtime.hurt/death/destroy/p1-p2及hurt-release/tmaoyi-cleanup：旧coverage表只是ID完备性，range verifier不执行声明的全部trace；通用RecordingBehavior死亡例不能替代猴马生产链。下一步补真实双slot生产消费者、逐形态受击释放/致死优先级及奥义源释放/恢复后最终清理。未修改原41/43真值，不从全系统绿色外推完成。

## 正式双owner生命周期与寿命反例（2026-09-25）

新增pet-monkey-horse-party-lifecycle-tests直接提取当前HeroPartyRuntimeBridge.updatePets函数体，注入真实两族Behavior/Runtime/伤害port/native碰撞资产，同时驱动P1/P2。24例覆盖两族四形态/三fps的真实身体发射、P1休息、重新激活、替换、旧runtimeKey伤害拒绝、P2致死/死亡动作结束和幂等destroy；检查P2原弹体在P1释放后继续推进，清理只移除源所有物。此测试不包括GPU、所有关卡怪物动态、受击反击技能或马奥义延迟。

首跑.tmp/pet226-party-lifecycle.log确实失败100!=99：猴死亡没有扣寿命。原BasePet.as:887-905单机分支在首次进入dead时setlifetime(getlifetime()-1)，207 verified sharedRuntime.death亦记录single mode decrements life；现代Session已持有该钩子但两族Behavior没有返回true。猴/马接入既有losesLifeOnDeath后24例通过（.tmp/pet226-party-lifecycle-life-fix.log），后续100步与重复destroy未重复扣减。未改存档结构或成长公式，沿用已有死亡消费owner。测试加入P1R和P1H。本批build/联合门禁待终态；前一资源批检查结果不替代本生产改动。

工程收齐：原生horse --all-horse --check=0；资源批workflow首次因226标题CRLF被严格正则拒绝，统一该文件LF后retry=0；audit=0、diff=0。Canvas233已在看板和覆盖台账登记，未推进执行。

### 退休父实例后的奥义回调边界

只读Luna复核229 cleanup-air的4-hit5-P1-7-destroy-live：父tick8 destroy且hp>0，延迟回调仍在tick17创建爆炸，tick28图仍attached。原BasePet.isDead只读HP，BasePet.destroy清旧数组并重新赋空数组，hit5Hit之后可把新爆炸放入退休实例数组并加到gameSence。禁止为了现代清理方便把callback直接取消。

229 CleanupProbe对退休父仍主动遍历magicBulletArray调用step2，因此其tick51末帧destroy不能外推正常宿主已不再step的数组会自动结束。SpecialEffectBullet独立MovieClip自然播放≠BaseBullet对象自然自毁；实际末帧清理在step2。后续需核定BaseHero正常持宠/移除调用链，不能新增无源expiry预期。此未知不以旧探针绿色掩盖，实际source-release保留与跨slot隔离继续核销。

## 捕获身份与受击释放联合补测（2026-09-25）

普通初始化及SaveSystem.decodePetId对P2补前缀，但PetRosterSystem.catchNewPet只按名字/roster.length+1赋ID，PetMagicBottleSystem调用者不传owner，HeroPartyRuntimeBridge.syncPets直接替换roster。pet-capture-owner-preflight使用真实createPlayerPetRosters/catchNewPet及两个真实Runtime，实际ids均pet-monkey1-2，出生两弹体，P1.destroy后零弹体但P2仍活。诊断报告capture-owner-preflight.json及.tmp/pet226-capture-owner-preflight.log；退出0仅采集成功。公共写入/清理边界独立列Planned TASK-SLICE-234，唯一ID24例不能核销该组合。

pet-monkey-horse-hurt-release-tests补84例：猴1..4/马2..4×两slot×三fps×致死/非致死。真实damageEvent进入hurt/dead，源受击旗标即使致死仍置位，致死优先阻止反击/MP消费；非致死需结束hurt再由真实身体回调创建对应效果，伤害输入本身不生成弹体。没有目标HP/GPU声明。首次fixture把猴2旋击错误写成lj图符号，按原PetMonkey2.doHit3的PetMonkey1Bullet2纠正，未改生产实现；retry84例通过。新检查纳入P1R/P1H，.tmp/pet226-hurt-release-design.log运行中。

寿命批最终收齐：.tmp/pet226-life-build.log、pet226-life-design.log、pet226-life-systems.log均0。当前已无生产源码改动，追加的是受击测试/门禁与234记录，需待新联合门禁终态和工程检查。

正常退休调用链窄查补充：BasePet.destroy末尾调用sourceRole.clearPet后置null（1176..1187）；BaseHero.clearPet把myPet=null，updatePet仅在myPet存在时step（982..993）。这支持退休后私有数组不再由英雄正常推进的源码判断；原清理探针仍手动step不能作为该宿主动态复验，尚不宣称完整Scene已证。

## 退休父入口原生补证（2026-09-25）

horse_retired_parent_probe.py复制229已准备的有界fixture到226独立目录，接入原BaseHero.clearPet/updatePet原方法，hero.myPet引用由真实clearPet清空；actor.step仅保留既有child/body推进，不冒充完整BaseHero/Scene。三fps编译与AIR均0（.tmp/pet226-horse-retired-parent-source.log），报告horse-retired-parent-native.json含source/method/report哈希。旧229和原提取均未修改。

12个destroy-live/skills5或7/P1P2样本：20fps延迟出生tick14、最终55帧11；24fps出生15、最终63帧18；30fps出生21、最终75帧24。全部最终爆炸dead=false、attached=true，已跨30帧自然循环。证实这个有界正常英雄持宠入口清除后不会继续step新数组；不能要求自动expiry。仍待实际现代Runtime+world port/view以相对出生相位对账退休回调，并验证世界销毁移除视图/监听；不新增无源定时清理。

受击批最终门禁.tmp/pet226-hurt-release-design.log已退出0（含24 party与84 hurt-release，19马/5猴暂停等变异）；最新workflow/audit/structure/diff全部0（结构8既有warning）。寿命批全系统0可复用：此后生产代码未改，仅新增受击测试、门禁、诊断、源探针和文档。任务仍未完成。推荐继续当前226，不提交或push未授权Git操作。

### 原84合同的其余窄审计待办

Luna只读继续检查runtime.auto-buff、follow-owner/warp与QLFJ：旧coverage的auto-buff/owner-follow/warp名称没有对应family runtime trace；通用system-tests直接helper测试不证明两族真实Runtime整帧顺序和阈值。226下一步需补actual Runtime的原阈值两侧、目标追逐优先与同帧passive顺序。

QLFJ还存在入口差异疑点：BasePet.reduceHp在宠物存活、reactive且已学qlfj时roll成功调用normalHit，失败hurt；现现代onDamaged直接hurt，旧TestScene QLFJ却从主人被怪物攻击路径调用helper。尚未补实际伤害事件反例/完整源调用probe，不将只读发现直接登记为已修复或完整伤害差异；需界定公共QLFJ与猴马分支责任后在226修或独立共享任务交接。

退休父现代消费：pet-horse-retired-parent-tests通过12实际Runtime/collision/world timer/shared view例及584原生相对出生状态。原生英雄持宠入口清空后新爆炸继续自然循环，现代同样petHostTick=0、不伤害、不自动过期；正式world port shutdown与view destroy清监听/图像。源码第一次fixture漏identity camera导致TypeError，补显式单位矩阵后通过，未改生产。已加入P1H，.tmp/pet226-retired-parent-design.log待终态；此测试仍非完整Scene销毁/保存旅程。

上一批继续点：.tmp/pet226-retired-parent-design.log已经0。看板27项未完成定义；226仍唯一Ready，新增233/234均Planned。不得继续要求退休父爆炸自动expiry；原生入口已证明其自然循环而不再私有step。

## QLFJ实际入口与跟随反例（2026-09-25）

`pet-monkey-horse-incoming-preflight.ts`在两族四形态/三fps采集96个实际Runtime样本：已学QLFJ、roll=0却进入hurt；无目标根距离640变follow；根距离950因偏移锚点提前warp；有目标且根距离1100仍不warp。报告`docs/tasks/evidence/TASK-SLICE-226/incoming-follow-preflight.json`和`.tmp/pet226-incoming-follow-preflight.log`保留旧行为，退出0仅为诊断完成。

`incoming_capture.py`摘取原BasePet.reduceHp及完整PetInfo.getPetHarmObj（保留末尾1.05），576个AIR样本覆盖四form、学习/反应/GXP/致死、wait/hurt/hit1及三roll。随机数替换为可控provider；normalHit、UI/network/protection显式sink，只证明受击分支，不冒充原身体/场景。报告`incoming-native.json`记录原文件/方法及生成源哈希。八子类normalHit和BasePet.faceToTarget静态补证：无目标不改方向但照常hit1，等x朝左；猴4加setYourFather(12)。Monkey4.setAction(hurt)清hit5Times，成功normalHit不清连段。

现代修正归既有两族Behavior/PetNormalAttackDecision/private projectile owner：QLFJ成功play basic-attack，保留当前目标朝向；发射不再以normalTarget存在为必要条件，不新增立即HP旁路；猴4普通normal执行补12步保护，QLFJ成功不清奥义计数。source按BasePet→子类override调用顺序的release旗标逻辑不变。

1152个实际Runtime分支与原wait输入逐项对账action/HP/lifetime/RNG；42个无目标反击继续由native身体时钟发射一个hit1弹体，age0、不耗MP，destroy清除。72个现存目标方向例覆盖左右/等x及无关伤害source；既有84 hurt-release回归通过。此批不冒充实际目标伤害/GPU/完整Scene，也尚未对猴4被反击插入奥义的完整原生连段逐态复验。build `.tmp/pet226-incoming-build.log`=0，新增检查已注册P1R/P1H；联合日志`.tmp/pet226-incoming-design.log`待终态。

六段链范围：局部为八normalHit/reduceHp与Monkey4.setAction；共享为BasePet.reduceHp/PetInfo及现代damageEvents→Session→Behavior→body/private owner；本批仅分支/数值，未新增空间或视觉数据，沿用228/229身体与弹体原真值；可观察合同为成功反击/失败hurt/GXP与死亡优先/无目标发射；现代owner如上；确定性已执行，完整浏览器组合待后续，不宣称全复现。

跟随/warp待办仍在226：BasePet.followSource(1023..1040)用root距离>640、否则wait；myIntelligence按旧timeCount%fps调用。BasePet.step在AI/CD/timeCount后每步以root距离>=1000且非attacking/hurt传送到owner.x/y-30，再执行BaseObject.step。227把followSource作为sink，不能证明实际640/1000几何或运动；现代三个实际反例已证，独立原生空间/运动输入和修复仍待，禁止仅将通用64改成640外推完成。

passive新增只读缺口（未动态核销）：BasePet.step在bullets后以tCount++>=fps（fps+1次周期）doPassive，再AI、upPassive、CD/timeCount、warp、BaseObject；checkBuffSkill在AI动作后按sxkb/fsnl/smjc/mfjc/gjjc/fyjc依次检查，同步可触发多项。PetInfo.upPassive每步刷新EHp/EMp，不即时治疗。正式HeroPartyRuntimeBridge只调用PetCombatRuntime，Session缺auto-buff；旧TestScenePetMagicBridge对猴马提前return，所以旧helper调用不可达。helper自身首个成功return也不同。227只证明sink顺序，尚无counter/效果/回复动态oracle，需真实party反例及公共机制范围核定后落实，不将静态审计写成已修复。

被动现代入口补证：`pet-monkey-horse-passive-preflight.ts`复用真实HeroPartyRuntimeBridge.updatePets闭包、P1/P2 Runtime，在两族四形态/三fps、单sxkb或六buff的96个样本中，显式控制全部counterMs=0（原构造默认300，绝不声称默认首帧触发）。更新一帧MP仍1000、active buff未添，报告`passive-party-preflight.json`；诊断exit0不是正确性通过。独立原版counter/effect/passive回复动态仍待。

本批终态：`.tmp/pet226-incoming-design.log`联合P1R/P1H=0；`.tmp/pet226-incoming-systems.log`完整system-tests=0；build=0。QLFJ分支已修但猴4连段组合未全面复验。下一执行项仍226的follow-owner/warp/passive和完整Scene/84合同核销；233/234等共享Planned项不改状态。继续当前对话，不把226按完成提交，未执行commit/push。

## 跟随与底层运动原生补证（2026-09-25）

`follow_capture.py`在226新目录复用227 source runner，保留原两族AI/step/action门禁，替换原先followSource事件sink为原方法；距离采用原AUtils.GetDisBetweenTwoObj，followRange从原uint字段读取。13,824例覆盖八形态、20/24/30fps、两方向、九个root距离（含640/1000边界两侧）、phase0/1/fps-1/59998、目标有无、wait/hit1/hit4/hurt。BaseObject.step仍是显式sink，故只证明跟随指令、root warp及其门禁/顺序，不冒充完整运动。报告`docs/tasks/evidence/TASK-SLICE-226/follow-native.json`；最终`.tmp/pet226-follow-native-retry.log`=0。中途从字段生成followRange时正则误写Number（实际uint）导致准备失败，记录保留，不算生产反例。

Luna只读审计与主agent原方法复核：BaseObject构造speed=(0,4)、isFly=false、gravity1.5；BasePet跳跃-30，八子类构造均覆水平5。BaseObject.step先body，再setSpeed、checkCanMove、move；转向只改方向flags，同步运动随后发生，setStatic不清垂直速度。落地移动锁：M1 hit1；M2/M3/M4 hit1..3；H1 hit1..2、H2 hit1..3、H3 hit1..4、H4 hit1..5。M4.move在hit1/hit2/hit4整步不调用基类move。现有ground模块算法/217轴对齐墙环境可作为复用候选，但不能照抄Dragon配置；当前两族未提供groundMovement，初始位置/速度/身体先后/死亡运动也须整体核定。

`ground_capture.py`摘取原BaseObject.step/setSpeed/checkCanMove/nearToWall/move等共享方法、BasePet.move和八类移动锁/攻击判定、M4.move；真实加载restored `StageCommon.swf`内三个collider。控制六种静态墙情形（air/floor/ceiling/left/right/through）、三方向、verified228/229所有身体动作，各24步，共25,920态。输入动作最终从原verified manifest读取，不依赖现代运行资产；初版使用现代投影列表已由独立版覆盖，最终日志`.tmp/pet226-ground-native-independent.log`=0。原move只加入计数instrumentation，body animation、effect/health服务与setAction/iswor为显式sink，墙为受控轴对齐MovieClip，不声称完整AI/Scene/斜墙/移动墙。原文件/方法、源SWF、原manifest及生成源码哈希写入`ground-native.json`。

重要反证：恢复SWF在AIR的真实getBounds为ObjectBaseSprite3 31.1×30、registration(15.55,15)；Sprite4 35×70/(17.5,35)；Sprite 50×100/(25,50)。旧207/209 SVG派生表的31.05/29.95、69.95、49.95/99.95不能直接用于新运动消费。差异属碰撞输入，不使用轻微视觉误差授权。后续须从原生数据生成可消费几何投影并保留旧表反证，不手抄或擅改旧提取。

`pet-monkey-horse-ground-preflight.ts`以原生profile、原每步action flags及M4实际move调用门禁作为独立控制输入，测试既有shared stepPetGroundMotion：25,920态有1,224失败，仅M3/M4 ceiling，首例modern y=-9.899999999999999，原AIR=-9.85，随后偏差保留。报告`ground-helper-preflight.json`，日志`.tmp/pet226-ground-helper-preflight.log`。设置仅探针使用的PET226_GROUND_QUANTIZE=1，在末坐标按已验证Sprite twip setter截断后全部匹配（`ground-helper-quantized-preflight.json`/`.tmp/pet226-ground-helper-quantized-preflight.log`）。这是诊断，不是生产修复，也未证明只在末尾截断足以覆盖所有中间赋值组合；family配置/正式Session/AI未纳入该helper比较。

六段链边界：局部八子类移动锁与collider选择→BasePet/BaseObject步序→真实restored collider+受控原生墙几何→逐步坐标/速度/四向接触合同→现共享ground候选及缺失的两族consumer→原AIR与现代helper诊断。原版机器几何投影、正式家族接线及浏览器地面组合尚未交付，本批不宣称移动修复。上一QLFJ生产版本未再修改，build/P1R/P1H/全系统结果可复用；新探针未注册为验收通过。下一步先校准原生碰撞外形/坐标赋值、再接两族ground及调整对应独立fixture；被动入口与完整84仍保留。没有运行中编译/测试/AIR进程，继续当前对话，不提交或push未授权Git操作。

## 原生地面坐标修正与独立几何投影（2026-09-25）

共享 PetGroundMovementSystem 已在每次碰撞定位及 x/y 位移赋值使用既有 sourceCoordinate 截断，保留源速度计算与碰撞顺序。新的严格检查 pet-monkey-horse-ground-motion-tests.ts 直接消费原生报告与实际 helper，无诊断后处理，25,920 态全部匹配；加入 P1R/P1H。旧地面 helper/Session 测试的位置预期按源 twip 规则修正，三类 readyRoster 缺失的桥接替身补齐；这些测试适配失败不记为生产反例。build 退出0。公共影响扩大到 P1R/P1H/P1G/P1T；首次因青龙旧替身中止，当前联合重跑日志 .tmp/pet226-ground-coordinate-design-retry.log 尚待终态，不提前判通过。

collider_capture.py 独立加载 restored StageCommon 三个碰撞 MovieClip，采集完整树、矩阵、bounds、尺寸及 PNG；3态/9对象与228独立解码的子树一致，全部25,920运动实例边界也一致。三张原生 PNG 已目视核对。generate_ground_geometry.py 经 Schema 生成 verified task-slice-226-monkey-horse-ground-colliders.json 和正式 src/assets/pet-monkey-horse-ground.json；两者不被 Git 忽略，不依赖运行时读取本地证据。原生采集曾因 applicationDirectory 的 app:/ 写权限失败，改用 nativePath 后成功，失败日志保留；未改原始提取结果。该 verified 结论仅覆盖碰撞几何，不代表家族地面接线或整个 Scene。

旧 helper 诊断报告曾被第一次生产修复复跑覆盖。已将修复结果保存为 ground-helper-after-coordinate-fix.json，并从保留日志恢复旧报告的总数、1,224失败及前三个样本，报告明确标注恢复来源；没有声称恢复旧完整样本或原文件字节。后续普通诊断输出改为 ground-helper-current-preflight.json。

当前猴/马仍未提供 groundMovement，跟随/warp、原初始vy=4、受伤AI wrapper、猴4特定动作禁止move及随机判定所有权尚待接线与完整Runtime验证。被动入口及完整84合同继续保留；本批不宣布226完成。

接线前只读补核：八类 myIntelligence 的 !isBeAttacking wrapper 包含原 BaseObject 的 dead/hurt/afterHurt 等动作，必须在 Session 获取或清理sticky target之前应用，不能只在 selectGroundAction 拦动作。BaseHero.updatePet:982无HP门禁地调用 myPet.step；原地面probe已有dead动作的运动记录，现代dead-playing提前返回未消费ground，死亡显示期间的物理仍待核销。基础速度与hurt集合由原文件/原生flags投影，生成器已补 movement/sourceActions，正式消费尚待。

Luna有界源核对纠正了“所有普通攻击先面向再setAction”的泛化：M1..3/H1..3 normalHit先hit1后本地face；M4/H4本地face后hit1。技能release均在setAction/扣MP前face，但M4/H4部分网络消息在face前；H4 tmaoyi还先addAoyiBuff/保护。body发射/完成回调不通用重转向，M4无MP连段helper按新目标转向。依据为BasePet.faceToTarget:1058、各类normalHit/releSkill、M4:420..510/614..625及H4:364..416/603..613。原网络消息顺序不自动外推成本地已复现结论。

公共被动已按独立机制边界登记同线Planned TASK-SETTINGS-235：源周期/数值/多项触发/生命周期补证后再生成共享实现任务。96例现代入口反例与原默认300/受控0的区别保留；此登记未核销猴马组合合同。workflow=0（28未完成定义，226唯一Ready），audit:problems=0仅完成扫描，当前生产批结论仍等待联合终态。

联合重跑终态：session10526退出1，.tmp/pet226-ground-coordinate-design-retry.log。猴马、青龙及玄龟原生资源/逐状态画布通过；末段玄龟combat browser八个Stage12/TestScene case均零像素差异，随后console[]断言捕获768项猴马ImageFile处理错误。代表PetMonkey3Bullet2Native-21.png在public/dist/HTTP200字节相同，PIL可解码（SHA256 4fc8383a924dbd4be629e8f477caa97b9afd1fe2156881a7d1c4b89dfe2a2dd3）。已给既有runner补phase、executionContext和Network.loadingFailed诊断，保留错误断言；95206单项复跑中，74479完整system-tests并行运行（独立浏览器输出目录，不启动第二system-tests）。未裁决资源错误根因，本批不通过。

原生数据投影已实际生成并--check通过：新增sourceActions与movement含初始(0,4)、重力1.5、跳跃-30、水平5/GXP10、原有效普攻率0.7及hurt/dead智能门禁。生成期间发现原构造反编译有多次attackRate=0.8再0.7赋值，已按构造最后赋值取值，未让错误的首赋值0.8接入生产。geometry仍是已verified的独立几何范围，尚无猴马ground消费。

图片错误根因已从新诊断确认：768项按TestScene四个新文档各192项分布，均在install/battle阶段，Network.loadingFailed为0，不能沿用导航取消猜测。原生帧JSON记录public相对路径assets/...；SceneAssetBundles.image未转成站点根URL，嵌套/__turtle_combat页面请求/__turtle_combat/assets/...，HTTP200返回text/html SPA入口，ImageFile因此处理失败。失败诊断另存226/ground-browser-relative-path-failure.json，代表错误地址与正确PNG地址已实测。现image投影仅规范assets/前缀为/assets/，源JSON路径/PNG字节不动；asset-bundle测试新增根页面/嵌套页面URL解析必须相同及磁盘存在检查，FireBuff旧bundle path预期同步。asset-bundle/fire-assets与身体时钟57,600态通过；浏览器同项复验待build后执行，未过滤console错误。

运动定义准备：PetMonkeyHorseAnimationClock提供唯一动作别名映射，新增PetMonkeyHorseGroundDefinition读取正式投影；PetGroundSessionMovement以可选数据支持初始速度、基础/GXP速度、hurt/dead集合及猴4绝对move抑制，旧家族缺省不变。新ground-definition测试通过25,920原生坐标/速度/站立态，另核M4继承动作别名、hurt/dead门禁与构造最终0.7概率；旧ground helper/Session和身体时钟检查通过，加入P1R/P1H。两族Behavior仍未启用groundMovement，EntitySession AI/死亡物理/概率所有权仍待接线，不声明实际猴马移动已修复。

完整system-tests在坐标批退出0（.tmp/pet226-ground-coordinate-systems.log）；随后动作别名/ground数据能力及URL修正为新增量，当前build运行于.tmp/pet226-ground-definition-build.log。此前联合失败不能被单项通过覆盖。


## 2026-09-25 retained-dead调度反例与修正

2026-09-25 / 226死亡保留调度：原BasePet.step/wrapper的288受控AIR态证明dead仍调用私有child并推进CD/timeCount，AI不运行；真实Runtime192态全部复现冻结。两族声明stepsWhileDying，由现有Session同一host循环继续已有效果/CD，禁止新AI，死亡完成仍按原入口清理；192态及incoming/hurt/party/retired-parent回归通过。地面物理正式接线仍待。此前资源URL修复后八个浏览器case零差异/console0，build和完整system-tests=0；当前扩大联合门禁待终态，不能复用此前失败批为通过。226未完成。

原生生成器`tools/pet226-body/dead_step_capture.py`与`dead-step-native.json`明确child/body/passive sinks，仅证明四次调用的调度，不证明死亡身体时长/伤害/被动效果。`pet-monkey-horse-dead-step-tests.ts`通过原生报告hash校验，真实Runtime两族四形态/三fps/双owner身份共192态对账；原失败保存在`dead-step-modern-preflight.json`，修后`.tmp/pet226-dead-step-regression.log`=0。保持原Registry、Session、私有projectile owner，不新增计时器；此前设计“全部dead冻结CD”的行为描述被独立源证据反证，窄改为两族已验证声明，其他家族不自动推广。原生死亡物理已有ground证据，但正式接线尚未完成。

资源URL修复验证终态：`.tmp/pet226-ground-browser-url-fix.log`=0（8视觉case、console0）；`.tmp/pet226-ground-definition-build.log`和`.tmp/pet226-ground-definition-systems.log`均0。此前失败及诊断保留。

## 2026-09-26 猴四身体与地面联动补证（尚未正式接线）

新增`tools/pet226-body/aoyi_ground_capture.py`及独立`local-resources/regima/task-outputs/TASK-SLICE-226/aoyi-ground-air/`，不改228旧callback/target oracle。精确原BasePet.step、BaseObject.step/运动和猴4wrapper/动作锁，配原BBDC、StageCommon真实collider与受控静态Wall；每host只调actor.step一次，禁止重复body/AI。原地面生成物与源文件hash先核对；callback生成器重定向本task的callback-inputs，保留输入模板hash。bullet、被动/自动增益、网络与MP服务显式sink；常规技能选择关闭，原落地十步后显式进入奥义，不声称完整Scene或伤害。

264例/36,960原生态覆盖三fps、双owner、八学习组合（静态模式全组合），另含dead-first/leave-enter/scene-flip、两目标随机与左右分界。日志`.tmp/pet226-aoyi-ground-native.log`=0。现代`pet-monkey-aoyi-ground-tests.ts`在显式诊断开关下注入拟接的ground定义，实际Registry/Session/Behavior/物理与回调对账，保留初始落地与绝对位置断言；正式验收禁止此注入，要求家族本身提供groundMovement。至首次wait的31,488态有1,320态失败（每例前五步），定位奥义释放入口漏faceToTarget，原版已经左移而现代direction=0；body相位及其余受控状态匹配。诊断exit0不是验收通过，报告`aoyi-ground-prospective.json`；先前96例/480反例保存在`aoyi-ground-prospective-96.json`。两族正式ground、入口转向、单一普攻随机owner与fixture迁移仍待。

另核查原BasePet构造`:96-108`直接`bbdc.turnRight()`，BaseHero出宠`:423-426`只赋owner根坐标与y−100；现代createPetRuntime继承owner朝向不能当原版出生合同。该出生朝向需在地面接线时按原构造补入数据与真实入口断言；不从受控callback fixture的初始方向外推。`bodyGroundFixture`只是水平受控墙；`pet-monkey-horse-ground-runtime-tests.ts`准备以独立follow/physics源切口验证432个真实家族入口，不注册未通过测试为完成证据。旧AIR固定根坐标不等价正式ground，不能禁用生产物理或放宽坐标断言以迁就旧fixture。

## 2026-09-26 地面正式接线与猴四联动对账

两族现在通过groundMovement使用既有Session/ground owner。原BasePet构造turnRight投影为initialFacingX=1；普通攻击相位与随机数仅在共享地面决策消费，Behavior执行时保留原本地face、Horse4前置效果先于face。hurt/dead先阻止目标获取/清理与AI，保留已有效果/身体/物理步。432真实Runtime出生/边界跟随、192普攻两次条件随机边界、192 retained-dead例通过；81/90身体发射、72目标顺序、72phase、1152incoming+42无目标+72朝向、84hurt-release、24party、96normal、两族各108技能以及Horse4出生/前置/退休父等回归通过。build=0（.tmp/pet226-ground-wiring-build.log）。controlled ground-fixture只提供原collider上的水平墙，不宣称完整关卡。

aoyi_ground_capture.py在新独立目录使用原BasePet/BaseObject/Monkey4/body方法与restored collider，自然下落10步后显式释放；1356原生组/189840态覆盖所有技能子集、目标范围/顺序/场景变换/RNG边界、hurt/empty及P1/P2三fps。现代生产hook无注入，1500组/154704态（每条至原wait）严格核对绝对root、速度、站立、body行列/hold、目标、RNG、朝向、动作、弹体出生坐标与MP，.tmp/pet226-aoyi-ground-birth-final.log=0。source的伤害/被动/网络服务为显式sink，不能冒充完整Scene或目标伤害。

出生位置补证曾发现raw Point -4.950000000000003与Sprite -4.95的观测端点不一致；探针现在执行并哈希原doHit的Sprite x/y赋值，记录inputX/Y与实际Sprite x/y，不使用epsilon或手工round掩盖。原228局部body/target oracle保持不变；其旧Runtime入口迁移至包含原分支的更强联动oracle，变异入口保留，门禁只注册一次以避免重复大数据驻留。ground fixture迁移不关闭真实运动，不改变生产速度或碰撞以满足旧固定位置预期。

上一扩大联合P1R/P1H/P1G/P1T退出1：.tmp/pet226-dead-ground-design.log中八个combat browser case/console0后发生Node默认4GB堆OOM，未获得gate通过。后续稳定批次将增加进程堆上限后完整复跑；当前226未完成。共享230..235仍Planned，登记并不等于修复公共缺口。

### 猴四反击插入与两族奥义实际伤害组合

进一步加入原BasePet.reduceHp、Monkey4.reduceHp和PetInfo.getPetHarmObj；counter模式tick9以实际原成功roll触发normalHit，不以setAction替代反击。总1404原生组/196560态，现代1596组/165264态全部匹配，原伤害显示/保护/网络等外围服务仍显式sink。新pet-monkey-aoyi-combat-tests通过24例、2316正式damage event：原body/ground绝对出生序列、全链/链中QLFJ、真实native碰撞→Stage1 HP/owner/attackID去重、MP与所有弹体清理。候选几何与受控伤害靶位分离，绝不宣称真实关卡怪物布局；伤害端口/Session/Behavior均实际生产对象。新增counter-cancels-chain源码变异交最终门禁执行。

pet-horse-aoyi-multi-combat-tests通过36例：3个真实world对象产生3个原序落雷，有/无sp追踪身份，分别接受一次实际命中，3个不同目标HP/owner/条件冰冻、3个条件延迟爆炸及释放清理。与既有96原三目标出生（包含dead占位）、36引用保留/同ID替换、216伤害/延迟、12退休父自然显示等测试合并核销局部奥义组合，不重复新增保存旅程要求。两项均加入既有P1R/P1H。

默认全system-tests首跑仅旧incoming-feedback-runtime缺ground夹具而退出1（.tmp/pet226-ground-full-systems.log）；按当前生产接口补受控墙后，从失败项到末尾所有注册项通过（.tmp/pet226-ground-full-systems-remainder.log），通过前缀不重复执行。P1/P1B设计fixture也补实际出生高度/horse sp 50..100距离，pet-incoming-damage按完整host步投递damage；不改生产入口来迁就delta0旧预期。扩大的最终P1R/P1H/P1G/P1T正在.tmp/pet226-ground-final-design.log运行，进程堆上限8192MB，终态前不判通过。


收尾范围按用户“其他问题加入任务列表或一并解决”及原拆分触发明确：公共230..235独立交付，226本地两族整改不承担全部怪物/捕获/共享被动重构。原84逐项映射见[TASK-SLICE-226-contract-coverage.md](TASK-SLICE-226-contract-coverage.md)，公共组合仍open，绝不宣称猴马完整家族/all/VS-067完成。MH-07补验锁定实际各关/测试场景数组投影与给定创建流的保序；原关卡生成时机/数量不在本项重新逆向或擅自升格verified。目标投影新增门禁后须复跑P1R/P1H，当前正在运行的扩大检查不冒充包含该新增项。

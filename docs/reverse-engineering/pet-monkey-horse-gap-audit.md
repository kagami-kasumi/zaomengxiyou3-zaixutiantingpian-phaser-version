# 猴马原版合同缺口核查（226 预检）

2026-09-26 / TASK-SETTINGS-230完成：原受击运动27000态/432方向、14入口/4去重/4调度及3原生Tween覆盖模式通过，5源变异拒绝、确定性重复生成一致；217/218空间引用与230行为sidecar交接。现代无位移反例仍存在，236唯一Ready实施公共击退，231..235保持Planned；原84组合责任、全族/204/VS-067与功能线均不关闭。合同见 `docs/reverse-engineering/monster-pet-knockback-contract.md`。

2026-09-26 / TASK-SLICE-226本项整改完成：猴马连续host时序、资格/目标/地面/反击、真实碰撞伤害、奥义/冰火/显示及生命周期已补证修正；扩大P1R/P1H/P1G/P1T=0，新增正式目标投影后的P1R/P1H=0。原41/43责任保留于226合同承接矩阵，公共230..235仍未修复，猴马完整家族、204/all/194/VS-067均不关闭。下一执行项TASK-SETTINGS-230（Ready），功能线保持Active。 MH-01..07本项反例及消费入口已核销；公共边界按承接矩阵保留，不外推原关卡生成时机。

2026-09-25 / 运动与碰撞外形：原BaseObject/Pet摘取方法、原restored StageCommon collider及静态控制墙的25,920态表明两族实际应走非飞行运动，而当前Runtime未接ground；初始vy4、重力1.5、构造水平5及各form落地攻击锁/猴4整步锁均需消费。原生Sprite3=31.1×30、Sprite4=35×70、Sprite=50×100，旧207/209宽高部分少0.05；不作为视觉例外豁免。共享ground helper在真实外形下有1,224顶头后坐标态不符，末坐标twip诊断可消除但不是生产修复。13,824原owner-follow/warp分支另保留，详见`ground-native.json`、`follow-native.json`及进度。

2026-09-25 / 受击与移动真实反例：`incoming-follow-preflight.json`的96个实际Runtime样本确认QLFJ成功roll仍hurt、root距离640错误follow、950因偏移锚点提前warp、有目标且root距离1100漏warp。QLFJ按原reduceHp/PetInfo576个AIR分支样本修复，两族1152例/42次无目标原生回调发射及72旧目标朝向通过；猴4成功反击不清奥义计数，完整链组合仍待补验。移动三个差异保留226内未完成项，必须补原followSource/step空间动态证据，不能只改64常量或用227事件sink冒充运动真值。本批联合门禁待终态。

2026-09-25 / 非时序确认偏差：猴马死亡未接Session寿命扣减钩子，已由24例真实party双slot拒绝并修复；同一核查进一步通过真实catchNewPet复现跨slot同ID导致P1释放误删P2弹体，新增TASK-SLICE-234。初始/存档前缀不覆盖即时捕获写入，唯一ID fixture的隔离通过不得外推。

2026-09-25 / 显示及覆盖审计：实际WebGL850态发现马八种旧资源302态不符，替换原生PNG/注册点后零残差；共享Canvas654态差异独立登记TASK-SLICE-233。只读Luna审计指出旧behavior coverage中的hurt/death/destroy等名称仅做ID完整性校验，范围trace不能替代生命周期执行；真实猴马受击链、双slot替换/死亡、释放与恢复清理仍由226补验，不将门禁绿色当全面关闭。

2026-09-25 / TestScene/1-1增量：实际Monster30持有目标冰火状态，fresh adapter不丢效果，火焰直接HP sink不触发hurt。另复现P1命中、AI目标P2、火焰致死经验给P2；原curAttackTarget区分英雄/宠物对象，现代owner map/targetSlot不足以等同原合同。共享归属补证列为Planned TASK-SETTINGS-231，不在226内凭空重写全部奖励。BaseObject先BBDC再effect的顺序也表明简单按更新后iceVisible冻结会错首尾帧；真实身体冻结/画布仍待。MH-02/04/05/07及原84合同不据局部通过关闭。

2026-09-24 / 天马奥义实际接入：真实发射已使用完整数组逆序/dead占位、max1、零水平追踪、命中后移动和独立一秒回调；96出生/384运动/168实际Runtime/240原回调及十真实变异通过。原生数组追加也证实立即爆炸同一步被私有loop访问。pet P1R P1H现为0，原41/43保留；MH-02/04/05/07仍不全面关闭：冰火、完整空间画布/暂停/目标引用/世界生命周期还有明确剩余。

2026-09-24 / 马常规技能进展：sp/bd/bz已迁移到实际native命中/源cache，108 Runtime、324 follow、六变异通过；bd release改为callback清除。同symbol的horse1/horse2 sp分别保留Follow-cut与Special-nocut。持续活目标原生寿命最长253tick，旧121帧碰撞覆盖不足，已补0..320实测profile；天马奥义消费者仍旧路径，冰火/暂停/全场景仍待，MH-02等完整缺口不关闭。

2026-09-24 / 猴技能主弹体进展：旧身份绕碰撞路径已从实际MonkeyBehavior技能发射移除，改走host-owned像素命中、源伤害cache/ID更新、TTL/末帧及follow-after-hit。108实际Runtime、144独立lifecycle对账、8实现变异通过；MH-02仍不关闭，马技能仍旧resolver，火焰/冰效与完整真实消费者尚未齐。

2026-09-24 / 伤害与公共击退增量：原版八形态getRealPower和PetInfo原函数在AIR产生2784组算术oracle，新增计算器全部对齐（含猴三旋击忽略法术/暴击但仍读随机数、猴四旋击受暴击/花buff影响）。目前只接入normal，技能命中刷新尚未迁移。击退从静态疑点升级为最小动态反例：正式resolveStage1PetHit扣血并写(6,-5)，随后updateMonsterPhysics仍只有重力；完整原版速度/边界/顺序交给新增同线Planned TASK-SETTINGS-230，禁止把该局部样本当全场景轨迹真值。226仍唯一Ready、原84合同与MH-01..07保留。
2026-09-24 / normal正式链路增量：两族普攻已按native phase进入真实像素碰撞与sourceBullet伤害缓存，96 Runtime例及6源码变异通过，远距锁定/非锁定实际相交反例已覆盖。MH-02仍不关闭（技能尚走旧resolver）；末帧相位/寿命已按原joint逐age核对。新增受击消费核查项：正式怪物击退不能仅验DamageEvent字段，现有port只产生event/hp/hurt，MonsterRuntimeRegistry未见消费该event速度；先保留静态缺口，正式位移反例及是否需独立公共机制task待核定，不将未验证的数值等价宣称为完整手感。

2026-09-24 / 226生产增量：MH-01/03/04/05/07已有局部修正，身体/释放/目标序新检查通过，范围与未关闭项见`evidence/TASK-SLICE-226-progress.md`。另核实TestScene第二身体时钟、猴发射点取目标坐标、release标志提前清除和lj合并对象偏差，已纳入同一226回调/消费者整改；无需重复开游戏task。完整复杂碰撞/奥义/生命周期/画布验收未完，MH条目均不作全面关闭。下表保留旧实现反证。

2026-09-24 / 229完成：马四形态/十主效果/Aoyi/冰效输入verified，665态/3190对象、387960独立碰撞、158912动态检测，43合同保留；真实TweenMax延迟与父清理已核对。226恢复唯一Ready，MH-01..07仍待生产整改；源完成不提升现代复现完成度。见 `docs/reverse-engineering/evidence/TASK-SETTINGS-229-horse-spatial-progress.md`。 源sp/Follow差异、bd受伤豁免、零水平追踪和存活父销毁后延迟回调仅作对照合同，尚未检查现代路径前不追加已确认bug；MH-01..07仍全部纳入226。

2026-09-21 / 228完成：猴空间/host与继承显示输入已verified并保留41项合同。MH-01..07仍交226实际修复；229马唯一Ready。新增源事实是对照输入，不等同尚未运行的现代反例或已修复。

2026-09-21后续：227代码补证已完成（3,408原生case、10变异、43现代拒绝、84合同保留），详见 `evidence/TASK-SETTINGS-227-monkey-horse-supplement.md`。原版searchTarget不预滤dead的差异已由源fixture确认；现代正式路径是否可观察继续由226验收。228猴空间输入唯一Ready、229马Planned，226仍Blocked。下文保留预检发生时记录，不代表当前仍在执行227。

日期：2026-09-21。范围仅 Monkey1..4 / Horse1..4。结论：除连续 timeCount 相位外，存在已复现的命中和技能选择偏差；226 尚未完成，不能继续把旧 P1R/P1H 绿色解释为完整原版复现。

原版路径前缀：`local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts/`。本次只读原提取结果，未修改 src、生产资源或 207/209 原真值。恢复源视觉事实继续优先使用 `local-resources/regima/source/restored-swfs/`。

## 已确认及待验证清单

| ID | 等级/问题 | 原版局部及共享链 | 现代消费者/反例 | 处置 |
| --- | --- | --- | --- | --- |
| MH-01 | 确认事实：连续 host 帧相位被重置倒计时替代 | `BasePet.as:141-182,305-399`，先 AI 后 CD/timeCount，59999 归零；猴四形态 `myIntelligence` 在 335/456/542/699 行、马在 356/447/534/722 行均调用 super | `PetNormalAttackDecision.ts:5-18` 决策后1000ms；猴马不提供 createAnimationClock，`PetCombatEntitySession.ts:106-124` 按 render update 而非完整 host tick 推进 | 保留226原调度/随机/暂停/恢复/归零全部合同 |
| MH-02 | 原版确认事实 + 现代运行反证：锁定身份绕过空间命中 | 猴1 `doHit1` 创建 SpecialEffectBullet（`PetMonkey1.as:233-243`），马1同类（`PetHorse1.as:259-269`）；`BaseBullet.as:225-305` 调目标 beMagicAttack，`BaseMonster.as:847-879` 必须相交且 complexHitTest；默认 param3=false | `PetMonkeyCombatSystem.ts:129-130`、`PetHorseCombatSystem.ts:186-187` 的 tracked 分支；真实 Runtime 生成普通弹后把同 ID 怪物移至 (100000,100000)，四形态×两族×P1/P2 共16例全部仍扣血 | 必须补真实碰撞输入及消费者负例；不能只删 tracked 后用点落矩形冒充 complexHitTest |
| MH-03 | 原版确认事实 + 现代运行反证：未学习技能仍被优先选择，阻塞普攻 | `PetMonkey2.as:260-267`、`PetMonkey3.as:299-311`、`PetMonkey4.as:394-417` 要求已学习、足够MP以及各自附加条件；`BasePet.as:333-354` 只选 eligible 技能 | `MonkeyPetBehavior.ts:66-95` 只查部分CD/release，不查 learned/MP；猴2/3/4空技能各49个host时长调用，每次选择失败技能，普攻数均0 | 纳入选择门禁与失败 fallback 修复；不是原版家族差异 |
| MH-04 | 确认事实（静态）：猴3/4 lyq 选择缺400距离门禁 | `PetMonkey3.as:304-307`、`PetMonkey4.as:399-402` 距离≤400 | `MonkeyPetBehavior.ts:78-89` 无距离条件；尚未以正式伤害trace证明最终玩家结果，不将“选错动作”等同“已造成远距伤害” | 227补边界源fixture，226实际消费者拒绝400外选择 |
| MH-05 | 确认调度差异；完整影响尚未验证：攻击/受伤/stun与移动顺序 | `BasePet.as:305-313,332`、八形态override先排受伤；`BasePet.as:1009-1024` followTarget转向，`BaseObject.as:165-182` 后续移动 | 猴马无公共animation/ground状态；`PetCombatEntitySession.ts:163-193` 先连续位移再选技能，Horse.canMove恒true，Monkey只拦奥义。尚未完成所有上游effect/正式hurt消费者核对 | 227沿真实来源补状态持续/动作结束/移动边界；禁止直接套青龙物理 |
| MH-06 | 既有证据可复用但此次未重验：来源/去重/换宠/死亡/P1P2 | 原目标保存 beAttackIdArray；BasePet owner门，BaseHero持宠step链 | 旧家族/公共Session/224C测试覆盖部分所有权与清理；本次16例lastHitBy正常只证明该反例来源分派，不证明全生命周期 | 原41/43项不删；226完整联合验收仍需执行 |
| MH-07 | 未知：正式目标输入顺序与原版obbsiteArray全消费者对应 | `BasePet.as:1075-1085` 取首个≤1200目标；死/≥1200清除 | PetCombatTargeting保留传入顺序；尚未核销五关/TestScene组装顺序 | 227冻结输入序，226以真实消费者验证 |

## 可复验反例与边界

228补证增量（尚非现代差异关闭）：`docs/reverse-engineering/evidence/TASK-SETTINGS-228-monkey-spatial-progress.md` 补充FireBuff与HeroBeHurt附属清单、body倒计数与host tick区别、lj循环多对发射、jgaoyi中xj动作覆盖及严格目标边界/无dead过滤/空轮取消。298态独立显示、349164碰撞与672奥义边界已通过；保护先减计数再更新filter的源顺序已校正。它们纳入228输入合同，后交226对照正式消费者；未完成现代反例时不直接断言新增实现bug。MH-01..07及原41/43合同继续有效。

运行 `node tools/run-system-tests.mjs pet-226-preflight-probe`，输出本地 `docs/tasks/evidence/TASK-SLICE-226/preflight-counterexamples.json`。工具是旧实现诊断，不是通过验收的测试；退出0仅表示捕获完成。16例命中均被原版“必须相交”的独立 expected 拒绝；3例猴技能门禁每例49次失败施法且无普攻。采样时刻选择在现有弹体存活且可命中的阶段，不用于证明原版正确时序。第一次固定500ms采样让部分弹体过期，已纠正为各自活动期采样，不能把过期无命中当正确碰撞证据。

源运行调用链：`my/MainGame.as:824-827 → World/PhysicsWorld.as:470-611 → base/BaseHero.as:1679-1698,950-990 → BasePet.step`。Luna只读核查返回全部八形态override与门禁出处，主agent复核实际命中链、猴2/3/4门禁，并用真实 Runtime/正式resolver复现MH-02/03。未把子agent关于完整状态/死亡的未验证推断升级为结论。

几何证据：207/209真值和既有视觉基准保留；209 `sharedRuntime.projectile-collision` 已写复杂碰撞，但当前消费只是点/锁定ID。已读原真值并未给出两族全部效果对正式怪物逐相位的独立HitTest oracle。本次不新造碰撞盒、不扩大青龙/玄龟像素近似。视觉、像素、全部技能碰撞仍需专门验证，16例远距反证不依赖微小像素容差。

## 调度裁决与交接

226原预算是共享调度实现与两族联合验收；独立的碰撞原版输入、状态/空间消费补证不能并入“改1000ms”而省略。按226的独立资料缺口条款和task-generation，226设Blocked，全部原合同保留；新增唯一Ready `TASK-SETTINGS-227` 先将本清单扩为可执行、源独立的补充行为合同，并精确核定碰撞/空间输入缺口。若需视觉真值，227只生成同线有界视觉补证task与唯一方案，不越界生成draft冒充verified；所需输入齐全后才恢复226。非时序问题全部登记在本表与227/226，不丢回“将来审计”。

没有完成任何玩法修复，未运行旧P1R/P1H重报绿色，未提升机制/切片/家族状态，未归档226。

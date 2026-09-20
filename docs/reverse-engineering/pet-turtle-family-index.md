# 玄龟完整家族行为证据（221）

2026-09-20 TASK-SLICE-224A2完成：同一Registry/Runtime/EntitySession接四形态公共行为、真实普攻/SLD共13责任，P1TA1=0（组合P1TA0）。四形态×P1/P2、332原生caller、15,768世界碰撞、6类实现变异及正式/TestScene共304实战图层对照/重入退出通过；显示根与camera各轴各≤0.5px整数对齐按长期授权记录，原像素许可不扩大。A3链接治疗/TXLJ四项唯一Ready，父A仍Split，B/C Planned；玄龟整族/204/VS-067及pet all仍未完成，功能线Active。交接见 `docs/tasks/evidence/TASK-SLICE-224A2/handoff.md`。

2026-09-17 TASK-SETTINGS-222B及父222完成：完整家族真值verified，保留222A全部13符号视觉与221全部32行为合同；94,656静态、31,344绘制后及31,704攻击入口碰撞案例，命中布尔全部一致。静态20案例70像素仅按用户批准的精确列表接受，动态像素零差异。223资源准备唯一Ready，224A/B/C Planned；玄龟现代实现、204、VS-067及功能线仍未完成。见 `docs/tasks/evidence/TASK-SETTINGS-222B/handoff.md`。

范围：`turtle1..4`，代码行为证据；不宣称视觉 verified 或现代完整复现。机器合同为 [behavior-contract.json](../tasks/evidence/TASK-SETTINGS-221/behavior-contract.json)，`truthId=task-settings-221.pet-turtle-behavior`。32 个稳定合同 ID 必须由后续视觉与正式实现共同核销；不能以单技能或 216 的 101 转嫁样本关闭整族。

## 待证明问题与范围

四形态分别如何实例化、选目标、追击、普攻、释放每个可学技能、治疗/转嫁/承伤、受击反击和销毁？哪些事件取决于动画回调、owner、源缓冲伤害或整数转换？现代 TestScene 与正式五关是否共同消费？

输入主包为 `local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts/`（下表 AS3 路径均相对此根）。原始文件只读。恢复 `pet1.swf/StageCommon.swf` 只窄查必需 SymbolClass；13 项来源/hash 见 [visual-inputs.json](../tasks/evidence/TASK-SETTINGS-221/visual-inputs.json)，不推导像素、注册点或帧时间真值。

## 四形态和全部家族技能

四类**全部直接继承 BasePet**，不是 PetTurtle1→2→3→4 的类继承。源码重复的继承行为和各阶差异需分别消费。表中 cell 从 0 起计；countdown 是 `BaseBitmapDataClip.getCurFrameCount()`，不是“影片第10帧”。最终 host-tick 投影须由 222 校验。

| 形态 | 普攻范围 | 普攻出对象回调 | SLD | TXLJ | SYBH | XWAOYI |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 40 | hit1 cell2/count10，PetTurtle1Bullet1 | hit2/cell2/count10 | 无 | 无 | 无 |
| 2 | 120 | hit1 cell3/count10，PetTurtle2Bullet1 | 同，另有链接治疗 | 无动作双buff | 无 | 无 |
| 3 | 150 | 同2 | 同2 | 同2 | hit3/cell2/count10，scale1 | 无 |
| 4 | 150 | 同2 | hit2改为physics | 同2 | scale2，interval=hostFps×.25 | 免费三技能组合 |

- 四形态普攻均 physics、hitMaxCount=99、interval=999、knockback=[6,-5]。一阶 hit2 magic、interval7；二三阶 hit2 magic、interval999；四阶 hit2 physics、interval999、knockback=[6,0]。三阶 hit3 magic、interval999、[5,0]；四阶 hit3 magic、interval=hostFps×.25、[2,0]。power均12。机器声明 `/forms/*/attacksAt24Fps` 保留全部字段，24fps投影不可作为任意hostFps常量。
- CD 初始/复用秒数分别为 `[3,6] [3,20] [4,5.5] [12,18]`；AI 选择后才扣本tick CD。构造赋值链最终 `attackRate=.7`，不是字段初始 `.8`。秒拍范围内首随机 `<=.7` 普攻，失败再独立随机 `<.3` wait，否则追击。
- SLD 需已学、20MP、距离50..200含边界；释放产生新attack id、10tick保护、hit2并扣20MP。创建 `FollowBaseObjectBullet(PetTurtle1Bullet2)` 时立即按 `uint(getRealPower(hit2,false).hurt)` 自疗，与是否命中怪物无关；明确设置 hurt 不截断效果。名称“水疗盾”不证明存在吸收盾。
- TXLJ 需已学、目标、20MP；harm存在才扣MP。`first/second`先转uint，双owner buff携带value及`hostFps*uint(second)`时长；不切换本体动作。hero转嫁并不消费buff.value，而是固定5%/95%。
- SYBH 需已学、目标、20MP；hit3/cell2/count10创建 `SpecialEffectBullet(PetTurtle3Bullet3)`。仅四阶scale2。`isCannotMoveWhenAttackOnFloor`只含hit1/hit2，不能扩大为hit3也锁地面移动。
- XWAOYI 需已学、目标、MP>=30，但原 `releSkill4` **不扣30MP**。已学SLD则立即/2秒/4秒免费释放；已学TXLJ则免费添加；已学SYBH则创建scale2效果、关闭末帧销毁、寿命`hostFps*5`；三个独立if共有8种组合。另创建禁伤害 `AoyiBuff` 跟随效果。奥义5秒状态禁止move/turn/击退，reduceHp仍减HP，仅强制hurt参数false；直接设置hurt会清除isAoyi。
- 技能数值：`PetInfo.getPetHarmObj`在switch结束统一把first乘1.05。因此SLD为atk×1.05，SYBH为atk×5.4×1.05，TXLJ.first为5×technique×1.05，second为4×warpower；QLFJ概率为(.05+形态/100)×warpower×1.05。`getRealPower`再加uint(fsnl.value)、乘可选暴击2、GXP1.2，**四阶才乘魔花**。基础技能不是按现代helper反算。

## 六段证据矩阵

每行精确方法起始行、整源SHA及方法SHA由机器合同 `/contracts/*/source` 提供，避免另抄漂移行号。以下列出共享consumer和反证；“确认事实”指代码合同，运行交叉确认仅限指定探针。

| 合同 ID 组 | 局部/共享证据与实际调用 | 几何/坐标段 | 等级与反证 | 验证/现代映射 |
| --- | --- | --- | --- | --- |
| entry.forms、ai.* | BaseHero.addPetByPi:448；BasePet构造:74、step:141→myIntelligence:305→countSkillCD:185；sourceRole来自构造实参 | 源根坐标距离表达式；源空间投影归222 | 确认事实；首个数组内<=1200目标，不是最近；target死或>=1200清除；无target每秒跟随，followRange640；距owner>=1000且非攻击/受击才warp到owner.x/y-30 | family探针覆盖边界选招/owner/CD；完整地面运动不由stub证明，正式复用公共地面端口后需全trace |
| normal.*、sld.*、txlj.release、sybh.* | 各PetTurtle构造→normal/releSkill→setAction→enterFrameFunc→doHit；BaseBitmapDataClip实际回调是视觉接续输入 | 源发射相对根偏移写在方法，尚无modern原点真值；222全行/持帧/双向展开 | 确认事实；count9不出、count10出；手调cell只验证回调谓词，不能证明实际到达tick | 259族状态；正式必须真实动画→对象→碰撞→HP→清理，不能用字符串event替代 |
| txlj.damage、txlj.heal | BaseHero.reduceHp:795先umbrella/TJGL后双buff转嫁→BasePet.reduceHp:865；BaseHero.cureHp:344→pet.cureHp:936；SLD二三阶直接setHHP，四阶dispatch SetHHp | HP/显示量纯行为，不适用UI Schema；pnum几何复用215 | 原生AIR交叉确认。101承伤：pet6/hero95；101治疗：双方106。int参数及复合赋值先截断，随后ceil不还原小数；单边buff不转嫁 | 144源数值状态，另复用215/216B1盾/保护先后；现代PetBattleOwnershipSystem目前仅TestScene接转嫁 |
| aoyi.* | PetTurtle4.releSkill4:366与四个override；TweenMax.delayedCall捕获本宠实例 | callback秒钟与host帧计数不同；5秒效果末帧/绘制碰撞须222 | 原生AIR交叉确认8组合、2/4/5回调、休息/死亡拒绝。TweenMax在支架按指定time手动触发，不证明真实墙钟排程 | 现代任务必须action token和owner作用域取消回调；不能复用已释放实体 |
| damage.* | BaseBullet.setRole:427→setAction:486→refreshSourceRoleAttackInfoObject:433；step2:105→step:153→checkAttack:225→BaseMonster.beMagicAttack:847→getRealHurt:1369→reduceHp | broad bounds且complexHitTest，imgMc1存在时换取该对象；确切像素oracle归222 | 确认事实；缓存pet atk×2.8；碰撞接受后才刷新下目标的伤害。目标记录同attack id不再碰；interval相等重置id；怪物dodge自行记录id且返回false，不等于几何miss | 108源registry/cache/defense状态只注入collision accept/reject，**没有证明像素命中或整个beMagicAttack**；正式任务须补真实oracle→HP |
| hurt.counter、hurt.death | BasePet.beMagicAttack:566先保护/几何/miss→reduceHp；QLFJ只在本宠存活且param2=true后判断；动画dead结束destroy | hurt/dead本体全行归222；UI显示复用215 | 确认事实；不是主人任意受击反击。GXP/奥义压制hurt不免伤；致死不反击，首次single dead扣一次寿命 | family正负/致死；独立QLFJ随机变异；现代TestScene的owner受伤后QLFJ调用需整改 |
| lifecycle.* | BaseHero.changePet:2561先旧destroy再init；BaseHero.destroy:2386→pet.destroy:1150；Config.initData:306→destroyHero:951依次P1/P2 | 无新增视觉几何；淡出1秒为源码TweenMax声明 | 确认事实。destroy清body/buff/bullets/sourceRole，但未杀奥义delayedCall；活宠destroy后2秒callback在源slice抛1009 | 原版缺陷有负trace。现代取消自身timer为现代设计选择；不把错误复制为玩家行为。返回/重试/换宠/重载均要求现代黑盒清理 |

## 当前现代消费者矩阵

| 路径 | 现有内容 | 221核定缺口 |
| --- | --- | --- |
| PetTurtleSkillSystem.ts:22/109/168/237 | 四技能请求、MP/CD、数值、projectile模型；316转嫁、357治疗 | 奥义请求扣MP与源不同；最近目标选择与源数组优先不同；未绑定实际本体cell/效果像素/完整命中链 |
| PetBattleOwnershipSystem.ts:38 | 按rosters[ownerSlot]，经过HeroCombat保护/盾后的HP阶段再转嫁 | 当前link要求pet.hp>0是现代已有收紧，原BaseHero只查双buff；不能说此guard来自AS3 |
| TestScenePetMagicBridge.ts:338..405、TestSceneP2PetBridge.ts:14 | 旧玄龟技能与P2桥 | 与PetCombatRuntime完整族语义尚未统一；不得把请求success当正式族完成 |
| TestSceneCombatBridge.ts:212、TestSceneBossArena.ts:190 | Monster30/Monster3实际applyOwnedHeroDamage与incoming producer | 216数值证据适用，但不证明本族正常攻击 |
| TestSceneWorldBridge.ts:146..190 | owner承伤后尝试PetSystem.tryPetQlfjCounterAttack | 原版触发源为宠物reduceHp，不可原样保留此owner触发替代 |
| Stage12/Stage13/Stage21/Stage22/Stage22Dev→HeroPartyRuntimeBridge.ts:404 | 同一PetCombatRuntime P1/P2更新与enemy pet-damage/projection端口 | 默认Registry仅猴/马/龙，没有turtle；直接给符合active/lifetime条件的turtle会resolve失败。正式Stage1CombatSystem没有玄龟转嫁入口 |
| PetCombatRuntime.ts:32/76，createDefaultPetBehaviorRegistry.ts | 通用替换/死亡/释放、owner与子实体端口 | 设施存在不等于玄龟Behavior/普攻/技能/显示生命周期已经消费 |

上述是静态消费者核对，不是假装运行了完整正式玄龟场景。后续统一现有公共Runtime，不新增另一套顶层owner。

## 验证边界与交接

- `tools/turtle-source/prepare.py`直接提取四族方法与共享方法，保留AS3计算；只把随机源替换成受控输入，计时器/动画/Buff容器/目标服务为显式支架。`source-trace.json`记录源行/hash和全部调用状态，`settlement-trace.json`复用215数值切片支架，`hit-trace.json`记录原registry及防御函数。**它们不是完整SWF场景运行或视觉基准**。
- independent `verify.py`的expected为冻结源码公式/边界常量，不读现代TS、不从actual反算；`mutations.py`编译真实改动的源slice，拒绝range、owner、timing、mana、gate、free-chain、delay、dead-callback、counter、hurt、魔花、CD变异。源码指纹校验与语义断言是两条检查；mutation保留原记录，靠语义失败拒绝。
- 行持帧声明和13源符号是**视觉任务输入**，不是视觉verified：递归显示列表、原始基准、mask/bitmap、目标colipse与效果像素、body host-tick timing均由222闭合。纯行为Schema单列，不借UI Schema包装“真值完成”。
- 长期保留tools、JSON、简明交接；本地`local-resources/regima/task-outputs/TASK-SETTINGS-221/air/`是可重建支架/编译输出，供222/正式实现重放。原始语料未变，未生成现代atlas。
- 后续`TASK-SETTINGS-222`先闭合整族视觉/碰撞输入；再生成有界资源派生与正式实现任务，全32合同联合视觉合同最终同次核销。玄龟、TASK-ARCH-204、VS-067和Active功能线仍未关闭。

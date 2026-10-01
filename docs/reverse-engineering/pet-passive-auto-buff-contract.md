# 公共宠物被动回复与自动增益合同

任务：`TASK-SETTINGS-235`；2026-10-01完成。状态：共享纯行为输入在声明的受控范围内闭合，正式数值消费待 `TASK-SLICE-242`；增益视觉与完整家族仍未关闭。

行为sidecar：[`pet-passive-auto-buff-contract.json`](reference/pet-passive-auto-buff-contract.json)，`contractId=task-settings-235.pet-passive-auto-buff`，`status=verified-bounded-behavior`。权威数值expected是 `/expectedCases`，源hash/locator在 `/sources` 与 `/staticSources`，46个提取宠物类的静态继承/覆写集合在 `/inheritanceInventory`。这个46类扫描包含活动corpus之外的旧类，不能替代205冻结的9物种35形态全集。

## 待证明问题与结论

- 默认增益计数是否首帧就绪？否。六计数初始化300，AI每次先递减再检查，第300次符合AI条件的调用可以触发。20/24/30fps分别约15/12.5/10秒，不能将12.5秒写成所有帧率的原版常量。受控ready=0只是边界输入。
- 回复是否固定每秒？否。`tCount++ >= frameClips` 从0出发，第fps+1次step触发，并重置0。20/24/30fps均多一个host tick。先HP回复再MP回复，使用上一次 `upPassive` 的数据；AI之后才刷新本次属性。
- `upPassive` 如何算？`int(level/5)` 作为整数商；EHp=商×3、EMp=商。当前轮临界step上改变level时，本轮仍用旧量，下轮使用新量。`cureHp(int)` 对死亡宠物不回复，`cureMp(int)` 没有死亡判断，两者上限裁剪。
- 六项是否只触发一个？否。`sxkb → fsnl → smjc → mfjc → gjjc → fyjc` 六个独立if依次读取学习、当前MP≥20；每次扣20，120MP可同帧全部触发，119MP只能前五项。缺效果对象时仍扣MP并重置计数，不能把展示失败当退款。
- 受伤/stun/暂停是否同义？否。受伤动作不阻止末尾公共增益检查；`isAnyThingElseStun("")` 提前return AI，冻结六计数，但step前面的回复与后面的 `upPassive` 仍执行。暂停不调用宿主step时这些逻辑都冻结。死亡数据样本只证明仍被调用step时的HP/MP差异；死动画何时最终destroy沿用226/现有家族证据，不能无限推进尸体。
- 到期和替换谁持有？计数在BasePet会话；sxkb/fsnl效果在宠物，其他四项在主人BaseAddEffect。休息/换宠调用destroy移除旧宠物、清理其自身效果，但已经加入主人效果的四项仍由主人继续到期。新宠物会话重新300；roster内休息宠物不tick。

## 数值、效果与执行相位

`PetInfo.getPetHarmObj` 各分支后统一将 `first *= 1.05`，只乘一次：sxkb为form×0.07×technique×0.27×1.05；fsnl为form×30×technique×1.05；smjc/mfjc为form×70×technique×1.05；gjjc为form×6×technique×1.05；fyjc为form×5×technique×1.05。原 `gettechnique/getwarpower` 返回int，字段>8时返回4；本批动态输入固定合法technique=3、warpower=1，不把浮点资质替身当原版数值。

时长先把 `(30+form×5)×warpower/2×0.6` 转为uint，再乘host fps。计数重置sxkb=4320，其余=5400，单位是符合AI条件的检查次数；与时长的秒→host帧转换不同。`cooldown/20,24,30` 直接推进5402次step核定再次触发边界。

同名效果 `BaseAddEffect.add` 保留旧value，只刷新time/startTime；不叠加同名第二项。效果首次step设置startTime/isFirst，在 `count-startTime >= time` 时置null，再递增count。无关效果、视觉show/hide及装备分支未纳入动态声明。

主人每轮顺序是 `BaseHero.step → BaseObject.step`（主人效果）→ `stepOther → BaseRoleProperies.step`（四项属性）→ `setPet → updatePet`。刚加入主人效果在下一主人步骤生效。属性step在timeLeft==0时扣回，下一效果step才置null；两步边界不能合成同一毫秒回调。

属性set/get真实方法以int存储，生命/魔法按当前比例增减上限及当前值，攻击/防御直接增减。合法中间数值也会因int赋值而在到期时损失整数尾数；本批form1 fixture从 `[333,77,1000,200,101,39]` 到增益 `[406,161,1220,420,119,54]`，到期 `[332,76,999,199,100,38]`。不得用“精确还原原值”覆盖此已测行为。样本未含拒绝治疗debuff，原setter保留这些判断，其组合另按实际需求验证。

宠物 `getCriteValue` 从sxkb读取概率加值，`getMagicAddValue():uint` 从fsnl读取整数技能加值；本批实际执行这两个源消费者，随机输入固定0.2，基础crit受控0.1，不冒充随机分布实测。

## 六段证据矩阵

源简写均位于只读主包 `local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts/`；具体文件与SHA在sidecar中。

| 合同 | 局部证据 | 共享调用链 | 几何/视觉 | 等级与边界 | 验证/反证 |
| --- | --- | --- | --- | --- | --- |
| PB-01 会话/活动对象 | BasePet字段58..72；destroy1150 | BaseHero.updatePet982、changePet2561、initPet395 | 纯数值不适用 | 交叉确认；完整场景未重放 | active-only、destroy-replace；all-roster变异 |
| PB-02 回复周期/顺序 | BasePet.step141、doPassive399 | PetInfo.upPassive102；cureHp936/cureMp962 | 治疗视觉addCureMc为sink，不宣称已验证 | 交叉确认；合法受控HP/MP | 三帧率period、caps；period/refresh-first变异 |
| PB-03 等级/死亡 | PetInfo整数商；BasePet.isDead1226 | 真cureHp/MP与整数存储输入 | 纯数值不适用 | 交叉确认；不重证死动画完成点 | 六等级、dead、caps |
| PB-04 AI门禁 | BasePet.myIntelligence305 | BaseAddEffect.isAnyThingElseStun/isCannotContrlSkill静态；暂停为宿主无调用 | 动画/世界暂停沿用226 | 交叉确认受控stun；不声称完整世界运行 | hurt/stun/pause；stun变异 |
| PB-05 六项/MP顺序 | BasePet.checkBuffSkill405 | PetInfo.findPetUsedMagic1862 | 数值门禁不适用 | 交叉确认；猴马四形态原覆写实际执行 | 672gate；first-only/learned/mp变异 |
| PB-06 默认/CD/时长 | 字段默认300；重置4320/5400 | host fps与uint时长转换 | 纯计时不适用 | 交叉确认三帧率 | initial/cooldown；immediate变异 |
| PB-07 数值/目标/同名刷新 | getPetHarmObj1017..1161 | checkBuffSkill真实add、getMagicAddValue/getCriteValue | 六符号仅定位 | 交叉确认数值；不宣称视觉真值 | gate/no-effect/refresh；refresh-value变异 |
| PB-08 属性/到期 | BaseRoleProperies.step217、addBuff365、removeBuff440及真实set/get | BaseHero.step1679、stepOther1717→BaseObject.step效果 | 现有HUD可显示属性，特效未验证 | 交叉确认指定四分支；其他hero buffs不适用 | 12effects、expiry；expiry变异 |
| PB-09 destroy/主人残留 | BasePet.destroy1150 | 主人效果拥有独立引用；BaseHero.destroy2410段清主人与宠物 | BBDC/Tween/子弹视觉为sink | 交叉确认同步清理；不重放淡出 | destroy-replace、effects休息后主人独立到期 |
| PB-10 覆写/私有实体 | 46类覆写清单；Dragon1..4.checkBuffSkill仅type0 super | Monkey/Horse gate实际子类；其他类静态 | 不新增家族专属事实 | 确认事实静态，其他家族完整消费仍待 | inventory与源指纹；不得无条件对子实体运行 |

effects循环手动按已静态核定的主人效果→属性顺序执行指定源片段；完整BaseHero.step和同循环宠物step没有端到端重放。720例不等于完整游戏主循环运行。

本批纯数值/行为不套用UI显示列表Schema。六个原版视觉符号位于恢复 `assets/pet1.swf`：sxkb806、fsnl713、smjc805、mfjc778、gjjc761、fyjc738；这是SymbolClass定位，时间轴/独立图层/逐状态视觉未知继续保留，不能写成verified视觉。show方法要求源root/colipse尺寸与原朝向，后续视觉工作必须建立机器真值与原版基准。

## 现代owner与已复现缺口

- `HeroPartyRuntimeBridge.ts:436` 的updatePets负责双方唯一Runtime；现无被动回复/自动增益公共入口。`PetCombatEntitySession` 已有原host tick，不增加第二时钟。各slot hero combat/skill/baseStats仍是主人属性owner。
- `TestScenePetMagicBridge.ts:108` 函数开头对dragon/turtle/monkey/horse四族提前return，发生在149..168旧helper调用之前。旧helper名存在不能证明这四族接入。
- `PetAutoBuffSystem.ts:64..106` 每项成功即return，只能每次触发一项；计数以24fps换算毫秒，effect挂在PetState，休息后主人效果无法继续自然到期。这些与PB-01/05/06/08/09不符，不能直接在party调用旧helper作为修复。
- 五正式入口：Stage11经TestSceneStage11RuntimeAdapter→TestSceneHeroPartyRuntimeBridge，Stage12/13/21/22经各GameplayBridge→同一HeroPartyRuntime；Stage22Dev为额外开发入口。适配应留在共同入口与既有Session/hero效果owner，不逐关复制。
- 226的96个真实party反例显式计时置零，只证明已学习ready增益不触发；已与原默认300边界分别记录。235使用modern-preflight.mjs补现行闭包依赖与ground fixture重跑96例，缺口仍存在，本地报告为235/actual-party-preflight.json；未覆盖完整场景。副agent最初漏读TestScene前置return及helper首成功return，主agent按完整函数纠正后采用，原错误结论不作为证据。

## 验证与后续

复验入口见 [`tools/pet-passive-source/README.md`](../../tools/pet-passive-source/README.md)。720原生case、10编译源变异、4损坏报告及重复一致通过；运行时是游戏包AIR51.1.1.5，不写作当年Flash Player实测。原代码未修改，src/public未修改。源码原方法或指定分支是真实运算，展示/移动/联机/保护/Tween替身边界在sidecar `/sourceFragments`；无完整原游戏或增益视觉复现声明。

同线 `TASK-SLICE-242` 接公共回复与六增益数值/会话、正式P1/P2与五关实际属性和技能消费者；数字/HUD沿用既有已验证资源。六特效视觉完整逆向/投影独立后续，不加入现代占位，也不以本任务或242的数字通过关闭全视觉/整家族。原226的41+43合同保留，runtime.auto-buff在242真实消费通过前仍未核销；其他怪物/人偶、其余家族、204/all/194/VS-067与功能线保持未完成。

# Monster3 实际承伤输入预检

2026-10-03，TASK-SLICE-249 的自然选择输入已由250解除；本次发现另一项影响实际HP的输入缺口，249保留全部合同并Blocked，TASK-SETTINGS-251补齐后恢复。未修改src/public、247/248/250真值或原语料。

## 证据与边界

`node tools/monster3-reception-preflight.mjs`直接调用生产Stage1CombatSystem，P1/P2共6组受控观察。报告：本地`docs/tasks/evidence/TASK-SLICE-249/reception-preflight.json`。预置active攻击只定位接收链，不能代替自然选择、原生HP或正式Scene验收。

| 观察/事实 | 精确出处 | 结论边界 |
| --- | --- | --- |
| 改变英雄missPercent后实际HP相同、随机调用数0 | Stage1CombatSystem.ts:365..394；HeroCombatSystem.ts:130..176 | 生产观察：当前入口未消费闪避。测试值是受控输入，不声明装备可达值或原版HP expected |
| 改变magicDefensePercent后hit2实际HP相同 | Stage1CombatSystem.ts:151..158/384..385 | 生产观察：magic直接floor基础伤害，未消费魔防 |
| 保护中拒绝仍写入hitRegistry，保护结束同ID不伤，换ID才扣HP | Stage1CombatSystem.ts:379..393；CombatSystem.ts:26..39 | 生产观察：Monster3旧路径把尝试当接受；不外推Monster30特判路径 |
| Boss同样先resolveHitOnce后applyOwnedHeroDamage | TestSceneBossArena.ts:168..190；PetBattleOwnershipSystem.ts:48..60 | 静态调用链；本探针未运行Boss Scene |
| 宠物事件入口直接扣HP，没有闪避接受结果 | Stage1CombatSystem.ts:397..418；PetCombatEntitySession.ts:396..418；PetRabbitSkillSystem.ts:69/146 | 静态调用链；兔疾风存在状态字段不等于incoming消费 |
| 原英雄保护拒绝false，怪物来源闪避返回true且写攻击ID，不扣HP | 主包base/BaseHero.as:1225..1259 | 源静态事实：怪物分支是(getTotalMiss()-BaseMonster.Hit)/100；BaseHero来源的deephit分支不用于Monster3 |
| 原宠物兔疾风及getMiss两随机、保护拒绝、闪避接受不扣HP | 主包base/BasePet.as:582..610 | 源静态事实；概率单位、随机顺序及ID/间隔需联合原方法trace冻结 |
| 原攻击强度还经过暴击/魔花、目标countHurt与HP入口 | BaseMonster.as:1990..2023；BaseHero.as:1514；BasePet.as:779 | 待补运行合同；不能把40/18直接认作所有目标的最终HP损失 |

主包根为`local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts/`。源空间继续复用248，两攻击出生/时序复用247，自然选择复用250；不重采这些已verified输入。

## 为什么不能沿用现有验收

247 capture.py:101明确目标collision/HP为acceptance sinks；250合同“明确边界与消费者”排除HP、防御、闪避。`combat-rules-index.md:159..194`是首版静态摘要，并明确简化防御/保护，不能成为本次完整接收oracle。240的210次宠物HP验收证明其固定伤害入口，不提供Monster3 hit2魔法、闪避接受或4步再次命中合同；保留240原有限结论，不自动重开其余类型。

采用Luna只读报告中的消费者和oracle缺口；退回其将英雄来源deephit公式套到Monster3的摘要错误，以上主agent复读的BaseMonster.Hit分支为准。没有把相反方向“英雄/宠物→怪物”的伤害探针当本项输入。

## 决策与交接

命中249第一拆分触发“缺少影响实际HP的原版输入”。新增251仅补Monster3→真实英雄/宠物接收行为与有限expected，随后恢复249，不新增全怪物伤害重设计，不减少原249验收。保护拒绝后重试、闪避接受但无HP、命中接受且扣HP必须分开；不能用boolean HP变化代表全部接受结果。

251需一次核清Monster3源Hit/Critical/魔花、目标闪避/防御/魔防、保护/伤害转移、攻击ID/间隔及当前正式owner所需状态的源链与输入边界。运行实际beMagicAttack/countHurt/getRealPower/HP相关方法；显示、完整Scene、碰撞绘制可复用已证输入并明确服务边界，不能把HP/随机/接受结果继续stub。源级未知未清零不得恢复249。

249仍承担两owner的独立攻击、140880原生命中、30显示态、135实际检测相位、真实HP/P1/P2及宠物、冰火/暂停/死亡保留/显式销毁、生产变异和正式旅程。204/all/194/VS-067及功能线保持未完成。本次按agent-protocol的输入超界规则只完成预检与调度交接，不隐式执行251。

验证：6生产观察通过；check:structure退出0，8项既有warning。收尾workflow与活跃PG审计记录在249定义；无生产修改，不以build或游戏截图冒充本次源接收验收。

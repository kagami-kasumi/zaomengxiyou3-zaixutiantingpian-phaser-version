# Monster3 公共接收 owner 验收（TASK-SLICE-249A）

本项实现251冻结的有限伤害接收域，供249B接入Monster3两攻击。它没有实现Monster3攻击时钟、空间、显示或两Scene旅程，也没有关闭父249。独立预期来自既有 `reference/monster3-reception-contract.json`，本项未修改原语料或真值。

## 生产责任与输入边界

| 入口 | 责任及实际消费者 | 明确保留的边界 |
| --- | --- | --- |
| `MonsterDamageReception` | 来源Hit/暴击/魔花及有序随机；几何、保护、闪避、物理/魔法准备；显式接受、拒绝、returnvoid | 不写HP；几何与已处理属性由调用者提供，不推导完整装备成长 |
| `HeroMonsterDamageReception` → `HeroCombatSystem.applyHeroDamage` | 现有英雄HP、盾、盾溢出二次覆写、玄龟转移、hurt/dead和反馈；Role3/Role5有限动作条件 | live mapper每次读当前player身份、动作、有效属性和sd；GXP/保护效果显式传入。不能把Role5的hit10猜成hit10_1/2，完整动作审计仍属195 |
| `PetCombatRuntime.receiveMonsterDamage` → `PetCombatEntitySession` | 当前动作/保护/GXP、既有HP写入、唯一onDamaged、死亡与一次寿命扣除；实际猴马龙龟行为 | miss/magicDefense/rabbit/counter输入必须显式给出；当前已实现16形态真实Session验证，不声称全部家族AI完成 |
| `PetBattleOwnershipSystem.receiveOwnedPetMonsterDamage` | 兼容路径共享同一HP结算函数，真实PetState寿命及技能标志；返回接收/动作/保护结果 | 19个其他形态以251受控输入覆盖接收；249B须把返回动作/保护接入现有兼容运行owner，不能把返回结果当完整AI已消费 |
| `MonsterAttackReception` | 计数/间隔/ID/max、英雄后其宠物、来源刷新与随机顺序 | 不拥有world时钟、空间或对象生命周期；249B负责接到两个实际攻击owner |

新端口不提供缺失属性的零值默认值。受控fixture设置初值后，HP均由生产owner写入；direct覆盖全部40身份，真实Session只声明其16已实现形态。Role3外向反伤、完整属性生成及域外技能仍沿用251边界。普通宠物原returnvoid不会被转成true；零伤害不等于拒绝。Bingo保留早返回、不重定向宠物目标和不产生普通击退的边界。

## 验证证据

| 批次 | 独立预期与实际执行 | 结果 |
| --- | --- | --- |
| direct | 251全部16,960行、16输出字段；真实英雄及兼容宠物HP owner；盾/链接/保护/随机/身份与动作 | 16,960通过 |
| world | 251完整64条worldExpected；实际生产接收计数器、英雄及宠物owner逐步HP/ID/max/count/随机 | 64通过 |
| hero owner | 5英雄×2slot×7条件，当前Stage1CombatPlayer/effectiveStats替换与实际HP/反馈 | 70通过 |
| pet Session | 16形态×2owner×2攻击×9条件，实际PetCombatRuntime和行为注册表，接受/HP/随机/动作/保护/死亡/销毁 | 576通过 |
| 生产变异 | 忽略魔防、英雄闪避等号、Role5减伤、随机消费、宠物returnvoid、盾递归、保护ID、漏宠物、间隔、重复回调、重复寿命扣除 | 11类均触发行为断言；源文件恢复后direct/world复跑 |

Session首次反击保护断言失败后，窄读原 `PetMonkey4.normalHit`（614..621）确认其额外12帧保护；251受控normalHit只选择动作，本项保留真实行为并单独断言，未改251 expected。死亡回调及技能回调次数在实际行为事件上核对，不用服务sink冒充。变异编译失败不计行为反证。

可复跑入口：

```text
node tools/monster3-receiver-direct-tests.mjs
node tools/monster3-receiver-world-tests.mjs
node tools/run-system-tests.mjs monster3-receiver-owner-tests monster3-receiver-session-tests
node tools/run-monster3-receiver-mutations.mjs
```

本地证据在 `docs/tasks/evidence/TASK-SLICE-249A/` 的direct/world/session verification及mutations报告。预期JSON已随Git保留；新生产代码不读取ignored evidence。复验原源仍需要本地语料，不保证仅拉取仓库可完成源级复验。

相关core、incoming-settlement/environment、Monster30全35形态伤害210例及生命周期66例、猴马正常/技能/奥义、龙行为/消费者、龟链接/技能回归通过。日志在 `.tmp/monster3-249a-regression.log`、`-family.log`、`-session-final.log`。build通过（保留既有大chunk提示），structure通过（8项既有warning）；最终workflow/audit结果见同前缀日志。

## 交接给249B

249B仍须完成父249全部两owner合同：自然选择及有序随机、独立发射和135检测相位、140880空间case、30原生显示态、实际双方英雄宠物HP、暂停/源死亡留弹/destroy清弹及940×590正式旅程。接收测试不能代替这些证据。不得用测试fixture属性充当正式实时属性；效果输入和兼容动作/保护必须接入现有owner后再宣称Scene可达。

# Monster3 接收 owner 消费预检

2026-10-03，TASK-SLICE-249。结论为**现代公共接收机制缺口**，不是缺失原版输入，也不是正式游戏验收。247/248/250/251的有限真值保持。

## 可复验依据

`node tools/monster3-receiver-owner-preflight.mjs`读取251 reference的四个独立fixture：Role1/Role5 × P1/P2，普通Monster3 hit1、40物理输入、无防御/暴击/盾/转移、目标动作hit10_1。初始HP=1000仅用于初始化；实际变化由生产`applyHeroDamage`写入。Role1对照原/现代均960；Role5原970、现代960。预期直接读取reference，不由现代函数反算。报告含reference SHA，位于本地`docs/tasks/evidence/TASK-SLICE-249/receiver-owner-preflight.json`。

| 边界 | 精确证据 | 结论 |
| --- | --- | --- |
| 目标动作减伤 | 原`export/hero/Role5.as:4555` reduceHp；251 M3R-04；`HeroCombatSystem.ts` HeroCombatModel/settleHeroHpDamage | 原hit10_1/2先乘0.75，现代HP owner没有该输入；不能只在Monster3 caller预乘，因为盾溢出可能再次进入覆写 |
| 宠物同步接收 | `PetCombatEntitySession.ts` applyDamageEvents/consumeDamageEvents；`PetCombatRuntime.ts` applyDamageEvents | Session返回void，Runtime返回snapshot，现有入口直接扣amount；无法向bullet返回逐次accepted/missed/protection。需要扩展既有owner端口，不能用新sink或第二HP owner绕过 |
| 两消费者 | `TestSceneBossArena.ts` applyBossAttack；`Stage1CombatSystem.ts` resolveStage1EnemyAttack/resolveStage1EnemyPetAttack | 都需消费同一接收语义；Boss和普通怪独立攻击仍未实现 |

Luna只读核查与主agent复读已归并：Role5SkillMath属于输出攻击数值，没有替代上述接收逻辑。代理初版“源死清弹”笔误已纠正，原合同始终为源死留弹、显式destroy清弹。

## 拆分裁决

251补证揭示的公共HP/宠物接收端口改造具有独立输入和验收边界：构造来源参数、目标状态、随机流即可核对接受值、HP、盾、保护和ID，无需自然AI/攻击显示。这超过原249“已有权威owner结算”的接线前提。按agent-protocol的规模核对和task-generation的新增公共机制规则拆为：

- `TASK-SLICE-249A`：在现有权威owner中实现251有限接收机制，并由原reference验收；唯一Ready。
- `TASK-SLICE-249B`：消费A，保留父249全部两owner、247/248/250/251、真实HP、显示、生命周期、正式旅程与反证合同；Planned。
- 父249标Split，不归档、不核销任何验收。不是因为case数、技能数或compact拆分。本次只重排交接，不执行A；无需再次逆向251。

本预检只验证四个直接HP边界观察，宠物端口为静态核查；未验证角色完整动作转换、两Scene、碰撞、视觉、自然选择或完整接收域。没有改src/public、reference、原语料，也没有关闭204/all/194/VS-067或功能线。

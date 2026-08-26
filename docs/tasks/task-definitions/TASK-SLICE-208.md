# TASK-SLICE-208

任务类型：
- `TASK-SLICE`

任务模型：
- `常规任务`

逆向子类型：
- 不适用

逆向方案：
- 不适用

功能条线：
- `LINE-PRE-STAGE-2-3-PRESENTATION`（Active；Ready；207 完整猴系证据已 verified）

目标机制/切片：
- `M-032`、`M-034`、`M-035`、`M-042`、`M-044`、`VS-012`、`VS-067`

关联具体系统设计：
- `docs/architecture/system-designs/pet.md`（当前有效；验收未退出）

本批设计验收 gate：
- `P1R`（由 207 证据冻结，代表首个完整参考家族；执行时必须在机器 gate 中存在并返回 0）

P1R 合同全集：

`CONTRACT_SET:owner.body|owner.effects|owner.collision|visual.states|visual.baselines|runtime.update-order|runtime.target-order|runtime.target-loss|runtime.follow-owner|runtime.follow-target|runtime.warp|runtime.action-priority|runtime.normal-roll|runtime.cooldown-order|runtime.auto-buff|runtime.hurt|runtime.death|runtime.destroy|runtime.projectile-collision|runtime.attack-id-dedup|runtime.damage-pipeline|runtime.p1-p2|monkey1.normal|monkey1.xj|monkey1.hurt-release|monkey2.normal|monkey2.lj|monkey2.xj|monkey2.hurt-release|monkey3.normal|monkey3.lyq|monkey3.xj|monkey3.lj|monkey3.hurt-release|monkey4.normal|monkey4.lyq|monkey4.xj|monkey4.lj|monkey4.jgaoyi|monkey4.hurt-release|monkey4.jgaoyi-chain`

规模预算：
- 主工作包：2
- 预计上下文压缩：0
- 独立验收批次：2

拆分触发：
- 一旦 207 仍有证据未知、需要处理猴系外物种、修改存档 schema，或正式消费者迁移超出公共宠物桥的有界范围，立即停止并按 207 证据拆同线后续；不得退回横向批量 Behavior。

协作计划：
- 模式：单 agent
- 并行工作包：无
- 写入 owner：主 agent
- 归并检查点：正式运行验收前
- 方法观测：`MO-003`；只有技术和正式运行验收全部通过后的收尾复盘才可成为 Skill 沉淀输入

输入资料：
- 207 完整证据 `docs/reverse-engineering/evidence/TASK-SETTINGS-207-pet-monkey-family.md`、机器真值 `task-settings-207.pet-monkey-family` 的 41 项 `p1rAcceptance.contractIds`、193A verified 626 状态真值/基准、193B 现有资源、`pet.md`、当前 Runtime/Behavior/Targeting/技能/Projectile/伤害/动画桥和正式五关 P1/P2 宠物 owner。

输出产物：
- Monkey1..4 通过同一 `PetCombatRuntime` 自主完成 ordered-first 索敌、追击、技能 1→4 优先级、真实普通攻击 fallback、CD、受击触发、命中/伤害、动作转移、死亡动画完成和私有/公共清理。
- `basicAttack` 必须进入真实命中/伤害与动画事件链，不能只发字符串事件；技能命中帧、Projectile/effect、数值和动作全部直接消费 207 权威证据。
- TestScene 与正式五关使用同一公共宠物桥；P1/P2 各自 roster/runtime，出战、休息、换形态、死亡、重试、返回和重载无第二 owner 或旧路径分叉。
- 猴系范围内删除几何本体、通用 projectile、未渲染动作或仅测试可用的占位；以 940×590 原版/现代对照证明自主战斗对玩家可见。
- 仅在 `P1R=0`、猴系专项、全系统、build 和正式运行全部通过后，复盘完整案例并使用 `$skill-creator` 重写 `$pet-family-reverse`；Skill 必须来源于实际证据/实现/验收产物，不能预写后续物种结论。

完成定义：
- 一个完整宠物进化家族已经从原版证据到现代正式运行闭合：四形态全部自主战斗、技能、真动画、命中、伤害、owner 和生命周期均可观察、可测试、可追溯。
- 更新后的 `$pet-family-reverse` 明确列出从该完整案例证明有效的步骤、失败模式、停止条件和未知处理；在此之前不得用于生成或强制执行其他宠物族任务。

验收标准：
- `npm run check:system-design -- pet P1R`=0；猴系行为/视觉/真值/正式消费者专项、全系统、build、structure、annotations、workflow、problem audit、LSP、diff check 通过。
- 940×590 正式 P1/P2 至少覆盖无目标、目标进入/离开 1200、追击、普通攻击、各形态全部技能、受击触发、目标死亡、宠物死亡、换宠/休息、重试和返回重载；console 零 warning/error。
- Skill 更新前必须形成一次完整复盘，逐条标明哪些步骤来自猴系已完成事实、哪些仍需第二家族验证；不得把单案例直接宣告为跨九族已采纳规则。

禁止范围：
- 不扩其他物种，不预写 Dragon/Turtle/Ufo 或其余族 Behavior，不修改玩法数值或存档 schema，不以专项 mock 代替正式可见自主战斗。

状态更新：
- 归档本 task；更新 pet 设计批次、覆盖台账、机制/切片、MO-003 和个人 Skill。随后只依据已验证 Skill 为下一个单一家族生成“完整逆向 → 完整实现/运行”连续任务，不恢复旧 193E..R 或 204C..G 横向批次。

推荐后续任务：
- 依据 208 完整猴系复盘与经验证 Skill，生成同线下一个单一家族完整任务；家族选择由剩余覆盖缺口和源资料完整性决定，不预先批量编号。

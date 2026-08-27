# TASK-SETTINGS-209

任务类型：
- `TASK-SETTINGS`

任务模型：
- `逆向任务`

逆向子类型：
- `视觉真值逆向`

逆向方案：
- `docs/reverse-engineering/plans/ground-truth-fine-grained-generation.md`

功能条线：
- `LINE-PRE-STAGE-2-3-PRESENTATION`（Active；游戏 Ready，但被全局执行队列的 PG-017 Ready 抢占）

执行前置：
- 2026-08-26 猴系虚空攻击已推翻 208 的“完整案例/P1R=0”现行结论。PG-017 V2 行为合同运行时 verifier 与后续猴系整改必须先完成，猴系重新达到语义 P1R=0，并修订 `$pet-family-reverse`；此前不得执行本 task。

目标机制/切片：
- `M-032`、`M-034`、`M-035`、`M-042`、`M-044`、`VS-067`

规模预算：
- 主工作包：2
- 预计上下文压缩：0
- 独立验收批次：2

拆分触发：
- 一旦 193C 的 716 状态真值出现实现影响型反证、需要新增已声明三包之外的 owner/source family、修改存档 schema、扩到马系外物种，或正式消费者合同超出公共宠物桥，立即停止并拆同线后续，不自行补成马系事实。

协作计划：
- 模式：单 agent
- 并行工作包：无
- 写入 owner：主 agent
- 归并检查点：机器真值生成前、验收前
- 方法观测：`MO-003`（修订中）；只在猴系重验后使用修订版 `$pet-family-reverse`，计第二家族证据阶段样本

输入资料：
- 经 PG-017 V2 与猴系整改重验后修订的 `$pet-family-reverse` 与其 `family-contract.md`；不得使用 208 后、反证前的版本作为执行依据。
- `docs/workflow/reverse-engineering-protocol.md`、`docs/workflow/reverse-engineering-task-protocol.md` 与本 task 唯一链接的细粒度真值方案。
- 193C verified 真值 `task-settings-193c.pet-horse-animation`、证据、716 个原版 baseline、20 个显示对象和 193D 现代动画消费者。
- 原版 `BasePet -> PetHorse1..4`、`sp/bd/bz/tmaoyi`、`BaseBullet`、冰冻/伤害/owner/load chain 的局部 AS3 与 `local-resources/regima/source/restored-swfs/` 中 193C 已声明的三包。
- `pet-animation-corpus.json`、`pets-index.md`、`projectiles-index.md`、`pet-base-class.md`、现代 Horse Behavior/技能/Projectile/动画桥/TestScene/正式五关消费者。

输出产物：
- 一份马系完整六段证据链，覆盖公共更新顺序、双随机/优先级、追击/回跟/warp、四形态普通攻击、`sp/bd/bz/tmaoyi`、共享冰冻、奥义多阶段伤害复用、CD/MP/距离、受击、死亡/销毁与 P1/P2 生命周期。
- 在新 `task-settings-209.pet-horse-family` 机器真值中复核引用 193C 全部视觉状态，并补齐 collision、hit frame、伤害、attack-id dedup、owner、现代消费者和 paired implementation acceptance ids；实现影响型 `unresolved=[]` 才能 verified。
- 形成“原版事实 → 现代 owner/消费者 → 马系正式复现 gate”的同集合同，明确现有真动画/旧技能路径能证明与不能证明的范围。
- 记录 `$pet-family-reverse` 在第二家族证据阶段阻止的遗漏、新增的马系差异、返工和需要修订的步骤；不得提前裁决 MO-003 采纳。

完成定义：
- horse1..4 的完整证据和机器合同已 verified，可无猜测地生成单独的马系正式实现/运行 task；没有把 193C 的视觉 verified、193D 的孤立动画或现有 Behavior 登记误当成正式自主战斗完成。

验收标准：
- 家族生成器 `--check`、Schema 关键字段变异、马系完整合同专项、193C 动画真值/运行专项、corpus、annotations、workflow、problem audit 和 diff check 通过。
- expected/extracted 分离、owner precedence、普通攻击与每个技能的 effect→collision/hit frame→damage→cleanup、P1/P2/正式消费者和未知项均有可定位证据。
- `$pet-family-reverse` 第二家族证据阶段记录已写入 MO-003；只允许结论“证据阶段通过/需修订”，不得宣告跨家族方法已采纳。

禁止范围：
- 不修改 `src/`、不派生现代 atlas、不执行马系正式 Runtime 实现、不扩第三家族、不修改玩法数值或存档 schema、不恢复旧横向批次。

状态更新：
- 归档本 task；更新功能线、覆盖台账、机制/切片、MO-003、corpus 交接与任务历史；依据 verified 结果生成同线马系正式实现/运行 task。

推荐后续任务：
- 依据 209 verified 马系合同生成 `TASK-SLICE-210`，完成 horse1..4 正式 P1/P2 自主战斗并裁决 `$pet-family-reverse` 的第二家族验证结果。

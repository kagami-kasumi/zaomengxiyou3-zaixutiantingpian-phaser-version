# TASK-SLICE-208A

任务类型：
- `TASK-SLICE`

任务模型：
- `常规任务`

逆向子类型：
- 不适用

逆向方案：
- 不适用

功能条线：
- `LINE-PRE-STAGE-2-3-PRESENTATION`（Active；唯一 Ready）

目标机制/切片：
- `M-032`、`M-034`、`M-035`、`M-042`、`M-044`、`VS-067`

关联具体系统设计：
- `docs/architecture/system-designs/pet.md`（当前有效；验收未退出）

本批设计验收 gate：
- `P1R`

规模预算：
- 主工作包：2
- 预计上下文压缩：0
- 独立验收批次：2

拆分触发：
- 一旦需要修改 207 已冻结原版事实、引入猴系之外的家族、改变 roster/save schema、重做视觉真值/atlas，或新增第二套 Scene 专用宠物 Runtime，立即停止并拆同线后续；不得为让 verifier 变绿而放宽 expected、删除负场景或把目标传送到 projectile 位置。

协作计划：
- 模式：单 agent
- 并行工作包：无
- 写入 owner：主 agent
- 归并检查点：运行时语义接入后、P1R/Skill 重验前
- 方法观测：`MO-003`（修订中）；只在独立 verifier 与正式路径均通过后记录首案例重验样本并修订 `$pet-family-reverse`

输入资料：
- `docs/reverse-engineering/ground-truth/manifests/task-settings-207-pet-monkey-family.json` 的 41 项冻结合同，尤其四形态 `attackRange=40/70/150/150`、BasePet 追击、普通攻击 hit frame、projectile/damage、owner 与生命周期事实；不得由现代 helper 反算 expected。
- `docs/workflow/behavior-contract-runtime-verifier.md`、`docs/workflow/schemas/behavior-runtime-trace.schema.json`、`tools/behavior-contract-runtime-verifier.ts`、`tools/pet-monkey-behavior-contract-coverage.ts`、`tools/pet-monkey-behavior-contract-adapter.ts` 与当前稳定失败报告。
- `docs/architecture/system-designs/pet.md`、`docs/workflow/system-design-acceptance-protocol.md`、`docs/architecture/src-boundaries.md`。
- `PetCombatRuntime`、`PetCombatTargeting`、`PetRuntimeSystem`、`MonkeyPetBehavior`、`PetMonkeyCombatSystem`、`ProjectileSystem`、正式 `HeroPartyRuntimeBridge`、TestScene 公共桥及 208 既有运行/视觉消费者。

输出产物：
- 单一生产语义 owner 消费四形态 frozen `attackRange`：目标在范围外时不得创建普通攻击 projectile/hit/damage，宠物必须朝 sticky target 追击；进入范围后才允许普通攻击，并保持 owner-follow、warp、ordered-first/1200、技能优先级与 dead-playing 合同。
- 普通攻击 projectile 的 target/action token、verified hit frame、碰撞/追踪、pet source damage 与 hit/expired/destroy cleanup 形成同一条可观察链；不得继续保留无人消费的 `trackingTargetId` 或测试专用命中注入。
- 四形态 × P1/P2 的结构化黑盒 trace 全部通过；TestScene 与正式五关复用同一 Runtime/命中路径，换宠、死亡、休息、重试、返回后旧 action token、trace 与 projectile 不再生效。
- P1R gate 直接消费行为语义 verifier；现有结构专项只能作为前置。完成后用 `$skill-creator` 将此次反证新增的字段级覆盖、范围外负场景、source-isolated trace 和 mutation-kill 写回 `$pet-family-reverse`，并更新 `MO-003` 样本。

完成定义：
- 当前八条猴系范围链不再出现 `EARLY_ATTACK/NO_CHASE/NO_IN_RANGE`，并继续完成范围内 attack→verified hit→pet-source HP decrease→cleanup；`TASK-SETTINGS-209` 只有在语义 `P1R=0`、正式路径和 Skill 修订全部成立后才恢复 Ready。

验收标准：
- `npm run test:behavior-contract-verifier` 返回 0，Schema/41 项字段覆盖检查通过，`attackRange`、命中帧、source owner 三类 mutation-kill 全部有效。
- `npm run test:pet-monkey-behavior-contract`、`npm run test:pet-monkey-family`、`npm run check:system-design -- pet P1R`、`npm run test:formal-pet-journey`、`npm run test:systems`、`npm run build` 返回 0。
- 受控 trace 记录 frame/time、owner/runtime key、pet/target 坐标与距离、action/action token、projectile/attack id、damage source、HP 前后值和 cleanup reason；P1/P2、TestScene、至少一个正式关卡必须有来源隔离证据，五关共享消费者由旅程回归覆盖。
- `npm run check:structure`、`npm run check:annotations`、`npm run check:workflow`、`npm run audit:problems` 与 `git diff --check` 通过；必要的 940×590 正式 P1/P2 运行观察无虚空攻击、无 console warning/error。

禁止范围：
- 不修改 207 原版 manifest/AS3 事实，不降低 attackRange 或命中/来源断言，不把 enemy 放到 projectile 坐标制造命中，不以源码正则、最终 HP 下降或 mock 自报事件代替 trace；不扩马系/其他家族，不修改存档、宠物页/HUD 真值或可见视觉资产，不恢复旧横向批次。

状态更新：
- 完成后归档本 task；更新宠物设计 P1R 验收记录、功能线/覆盖台账、M-032/M-034/M-035/M-042、VS-067、MO-003、PG-017 审计样本和任务历史；将 `TASK-SETTINGS-209` 恢复为唯一 Ready。

推荐后续任务：
- `TASK-SETTINGS-209`：使用修订后的 `$pet-family-reverse` 执行马系第二家族证据阶段；不得在本 task 同轮续跑。

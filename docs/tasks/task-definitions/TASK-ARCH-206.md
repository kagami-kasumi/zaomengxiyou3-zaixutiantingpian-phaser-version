# TASK-ARCH-206

任务类型：
- `TASK-ARCH`

任务模型：
- `常规任务`

逆向子类型：
- 不适用

逆向方案：
- 不适用

功能条线：
- `LINE-PRE-STAGE-2-3-PRESENTATION`（Active；Ready；前置 `TASK-SETTINGS-205` 已完成，`TASK-ARCH-204B..F` 等待本设计裁决）

目标机制/切片：
- `M-032`、`M-034`、`M-042`、`VS-012`、`VS-067`

规模预算：
- 主工作包：2
- 预计上下文压缩：0
- 独立验收批次：2

拆分触发：
- 一旦需要修改现代 `src/`、实施具体 Behavior/正式消费者迁移、重新逆向任一宠物视觉族，或无法在“角色/调用顺序裁决 + gate/后续 task 重基线”两个工作包内完成，立即停止并拆出同线实现 task；本 task 只确定一套当前设计和可执行验收合同。

协作计划：
- 模式：单 agent
- 并行工作包：无
- 写入 owner：主 agent
- 归并检查点：验收前
- 方法观测：无

设计触发依据：
- 用户 2026-08-25 明确要求先按原版 `BasePet` 属性、继承、生命周期和具体覆写证据形成或修正现代宠物系统设计；`TASK-SETTINGS-205` 已闭合该证据并证明当前方案不能原样继续扩展。

待裁决问题：
- 是否保留 `PetCombatRuntime + PetBehavior + Registry + Targeting` 总体组合；若保留，各角色必须收窄、扩展或更名哪些职责。
- 如何冻结与原版一致的 ordered-first/`1200` 索敌语义，并明确上游 target 集合顺序；不得继续以 nearest 冒充原版事实。
- 如何只推进活动宠物的技能 CD，并保持“动作选择在本帧 CD 递减前”的公共时序；未出战 roster 项不得静默推进战斗时钟。
- 如何表达 `alive -> dead-playing -> destroy`，让 dead 动作完成事件先于 Behavior/View/Projectile 清理；不得继续以 `hp <= 0` 立即卸载替代原版死亡生命周期。
- `PetBehavior` 是否以及如何覆盖普攻 fallback、受击触发、移动许可、攻击态、自动效果、动画命中事件和私有销毁；表现矩阵与伤害/数值 owner 仍必须分离。
- P1/P2 的 owner/roster/runtime、功能页换宠、TestScene、五关正式消费者和未来网络回放分别由谁持有；不得建立第二份宠物数值或 Scene 私有分发。

输入资料：
- `docs/workflow/system-design-protocol.md`、`docs/workflow/system-design-acceptance-protocol.md`、`docs/architecture/src-boundaries.md`。
- `docs/reverse-engineering/pet-base-class.md`，尤其 35 形态覆写矩阵、架构无关行为合同、现代 owner 审计和反证条件。
- `docs/architecture/system-designs/pet.md` 当前方案；本 task 直接修订为唯一当前方案，不保留候选比较或废弃正文。
- 当前 `src/systems/PetCombatRuntime.ts`、`PetBehavior.ts`、`PetBehaviorRegistry.ts`、`PetCombatTargeting.ts`、`PetRuntimeSystem.ts`、`PetSkillTickSystem.ts`、`PetTypes.ts`、`PetTuning.ts`、`src/systems/pet-behaviors/`。
- 当前全部声明消费者、`tools/check-system-design.mjs` 和 `tools/pet-combat-runtime-design-tests.ts`；使用 LSP/确定性搜索核对实际引用，不以旧设计文档代替源码现状。
- `TASK-ARCH-204` 与 204B..F 定义，只用于裁决后重排实施批次；不得在本 task 内执行。

输出产物：
- 更新 `docs/architecture/system-designs/pet.md`，只保留一套当前有效方案，冻结模式/组合角色、源码映射、公共调用顺序、允许扩展点、禁止路径、消费者全集、迁移批次和退出合同。
- 对 `TASK-SETTINGS-205` 的每个现代审计项给出明确处置：保留、收窄、扩展、替换或移出设计范围；不得用“后续再看”跳过 ordered target、活动 CD、死亡生命周期和差异钩子。
- 更新 `tools/check-system-design.mjs` 与系统专用合同测试，使 gate 能检查修订后的角色、调用顺序、禁止路径和批次；设计阶段允许 `all` 保持非 0，但必须记录真实失败基线和剩余项。
- 按裁决结果更新 204B..F：若边界仍成立则修订合同并恢复最小下一批；若不成立则将受影响 task 标为 Split/替换为新的同线小 task。只保留一个 Ready。

完成定义：
- 当前宠物系统只有一套可执行设计；其公共时序、形态差异、受击/死亡、表现事件、owner、Targeting、Registry、消费者和清理边界都与 `pet-base-class.md` 的事实/未知分级一致。
- 设计明确哪些原版职责由现代组合角色承担，哪些原版类结构不复制；不得建立万能 TypeScript `BasePet` 深继承，也不得把全部差异压进只有技能选择的窄 Strategy。
- gate 和专用测试可以在实现前失败，但失败必须精确对应未实施批次；已经完成的 P1/P1B 若与新设计冲突，应降级并由 gate 可见，不能沿用旧 `0` 冒充符合新合同。
- 本 task 不修改 `src/`，不接入其余七族 Behavior，不迁移 Scene/五关，不修改视觉资源、玩法数值、roster 或存档。

验收标准：
- 逐项核对 `pet-base-class.md` 的现代 owner 审计，无未处置的 `与证据冲突` 或影响实施的 owner 未定项。
- `npm run check:system-design -- pet all` 留下真实基线；各声明 gate 的退出码与设计文档“当前结果”一致。
- 系统专用合同测试能够捕获 nearest 回填、全 roster 冷却、HP 归零立即卸载、Scene 具体技能分发和私有清理缺失等关键违约。
- `npm run check:workflow`、`npm run audit:problems`、`git diff --check` 通过。

禁止范围：
- 不修改 `src/` 或实现新公共类；不执行 204B..F；不新增宠物族视觉真值/atlas；不改原版数值；不把 AS3 深继承照搬为现代架构。
- 不并行保留多套候选模式；不以旧 P1/P1B gate 已通过为理由跳过 205 证据冲突。

状态更新：
- 归档本 task 后，按唯一设计裁决更新功能线、覆盖台账、task-board、204 父任务及受影响子任务；激活同线最小实现批次并结束当次 `/goal`。

推荐后续任务：
- 依据设计裁决恢复或替换 `TASK-ARCH-204B`；只有新设计明确证明其范围仍成立时才可直接恢复。


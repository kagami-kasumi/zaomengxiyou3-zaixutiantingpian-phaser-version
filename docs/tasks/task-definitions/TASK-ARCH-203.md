# TASK-ARCH-203

任务类型：
- `TASK-ARCH`

任务模型：
- `常规任务`

逆向子类型：
- 不适用

逆向方案：
- 不适用

功能条线：
- `LINE-PRE-STAGE-2-3-PRESENTATION`（Active；Planned；等待 `TASK-SLICE-202`）

目标机制/切片：
- `M-032`、`M-034`、`M-042`、`VS-012`、`VS-067`

关联具体系统设计：
- `docs/architecture/system-designs/pet.md`（当前有效；验收未退出）

本批设计验收 gate：
- `P1`

规模预算：
- 主工作包：2
- 预计上下文压缩：0
- 独立验收批次：2

拆分触发：
- 一旦范围进入 TestScene P1/P2 消费者迁移、五关正式接入、删除旧 `PetRuntimeSystem`/barrel 出口、逐物种完整 Behavior 迁移或 UI/动画真值修改，立即停止并留给设计 P2-P4 后续 task。

协作计划：
- 模式：单 agent
- 并行工作包：无
- 写入 owner：主 agent
- 归并检查点：实现前
- 方法观测：无

输入资料：
- `docs/architecture/system-designs/pet.md`、`docs/workflow/system-design-acceptance-protocol.md`、`docs/architecture/src-boundaries.md`。
- `PetRuntimeSystem.ts`、`PetTypes.ts`、`PetSystem.ts` 的公共技能接缝、各 `Pet*SkillSystem.ts` 中现有纯算法，以及 `TestScenePetMagicBridge`/正式 Bridge 的消费者矩阵；本 task 只读消费者，不迁移它们。
- 当前 `npm run check:system-design -- pet P1` 失败基线和 `npm run check:structure` 的 `PetSystem.ts` 1267 行 warning。

输出产物：
- `src/systems/PetCombatRuntime.ts`：不依赖 Phaser 的宠物战斗公共运行时类，固定同步、公共跟随/warp、目标快照、Behavior 调用、持续效果推进、只读 snapshot/event 和幂等销毁顺序。
- `src/systems/PetBehavior.ts`：种类/形态差异合同；不复制公共 Runtime 更新骨架，不把存档/UI/Phaser 放入策略。
- `src/systems/PetBehaviorRegistry.ts`：`species + form` 到 Behavior 的唯一解析、重复/缺失拒绝和可测试注册边界。
- `src/systems/PetCombatTargeting.ts`：存活筛选、最近目标、距离、朝向的纯服务；本批只建立唯一公共入口，不批量删除各技能文件旧 helper。
- `tools/system-tests/pet-combat-runtime-design-tests.ts`：生命周期顺序、换宠/死亡、registry 解析、目标选择、事件/快照、错误输入和幂等销毁合同。

完成定义：
- 已冻结设计的 Context/Strategy/Registry/Targeting 四个 P1 角色真实存在、职责与依赖方向一致，不新建深继承 `BasePet` 或把 Scene/Phaser/存档/UI 塞入公共类。
- `npm run check:system-design -- pet P1` 返回 0；设计文档验收状态更新为“实施中”，但 P2-P4 和 `all` 仍保持未完成，不冒充宠物系统迁移完成。
- 现有 `PetSystem.ts` 大文件不新增逻辑；新公共合同放入独立文件，后续消费者迁移有稳定入口。

验收标准：
- 实现前和实现后运行 `npm run check:structure`；不得在 1267 行 `PetSystem.ts` 继续新增基类逻辑。
- `npm run check:system-design -- pet P1` 必须为 0；非 0 时本 task 不通过，不能用 build 或人工评审覆盖。
- 新专项测试、`npm run test:systems`、`npm run build`、`npm run check:workflow`、`npm run audit:problems`、`git diff --check` 通过。
- `npm run check:system-design -- pet all` 预期仍为 1，并由输出精确对应 P2-P4 未迁移项；不得将该预期失败写成系统完成。

禁止范围：
- 不修改 UI/HUD、真值、资源或宠物动画；不迁移 TestScene/五关消费者，不删除旧 Runtime/barrel，不改玩法数值、冷却、伤害、roster 或存档。
- 不脱离 `pet.md` 另选继承体系或万能 `BasePet`；若用户要求重设计，必须另行触发系统设计流程，而不是在本 task 内改方案。

状态更新：
- 归档本 task；更新 `pet.md` 的 P1 gate、验收状态/批次和系统级剩余清单；仅恢复 `TASK-SETTINGS-193E` 为 Ready。

推荐后续任务：
- `TASK-SETTINGS-193E`：继续 UFO 本体/技能对象逐帧视觉真值；宠物类设计 P2-P4 由用户后续调度时再生成有界迁移 task。

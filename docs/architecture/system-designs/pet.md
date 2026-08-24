# 宠物系统类设计

设计状态：当前有效。

验收状态：未开始。

验收退出：未退出。

实施 task：`TASK-ARCH-203` 已生成并排在当前宠物 HUD 真值/实现之后，只实施 P1 公共类与合同；P2-P4 消费者迁移 task 尚未生成。

## 目标与范围

- 目标系统：单/双人正式战斗中的出战宠物跟随、索敌、技能、持续效果、快照和销毁。
- 要消除的重复/开发困难：按宠物种类/形态散落的技能分发、重复最近目标/朝向计算、TestScene 大型分支和正式关卡只接本体不接战斗行为。
- 本设计范围：生成一个 `PetCombatRuntime` 公共类，以 `PetBehavior` 注入种类/形态差异，并由唯一 Registry 选择行为。
- 非目标：不改宠物存档、成长、背包道具、功能页 UI 或动画真值；不把 Phaser 显示对象放进 systems。

## 现状定位

| 重复或困难 | 精确文件/符号 | 影响的消费者 | 本设计要如何收束 |
| --- | --- | --- | --- |
| 跟随 Runtime 只有 create/sync/update 函数，没有完整战斗生命周期 owner | `src/systems/PetRuntimeSystem.ts` | TestScene、Monkey/Horse 正式 BodyBridge | 合并为 `PetCombatRuntime` 类的公共生命周期 |
| 技能按种类/形态暴露大量 `requestPet*Skill` | `PetSystem.ts` 及 `Pet*SkillSystem.ts` | TestScene 两个宠物技能 bridge | 由 `PetBehavior` 实现调用，消费者不直接选择具体技能函数 |
| 最近目标、距离和朝向算法在多个技能文件重复 | Mouse/Phoenix/Rabbit/Tiger 等技能系统 | 多种宠物技能 | 迁入公共 `PetCombatTargeting` 服务，由 Runtime 统一调用 |
| TestScene 持有大型技能分支，正式五关没有同等战斗接法 | `TestScenePetMagicBridge.ts`、`TestSceneAdvancedPetSkillBridge.ts` | P1/P2 TestScene、五个正式关卡 | TestScene 与正式关卡都只提交帧输入给 Runtime |

## 设计前完成度

| 能力 | 已有实现 | 完成判断 | 设计处置 |
| --- | --- | --- | --- |
| 宠物存档/出战选择 | `PetRoster`、`PetState`、ownership/growth 系统 | 已完成且不属于本次重构 | 作为 Runtime 输入，不迁入类 |
| 跟随/warp | `PetRuntimeSystem` | 已有可复用算法 | 迁入公共类或由类独占调用 |
| 种类技能规则 | 多个纯 skill system | 行为规则较完整但入口分裂 | 保留算法，以 Behavior 适配统一调用 |
| 公共战斗类 | 不存在 | 未完成 | 新建 `PetCombatRuntime` |
| 正式五关战斗接入 | 目前以 Monkey/Horse 本体表现为主 | 未完成 | 五关 P1/P2 统一接 Runtime |

结论：宠物数据和单项技能已有积累，但面向对象的公共战斗生命周期完成度低；当前不能视为已经完成类设计。

## 选定设计

- 选定方案：策略注册型宠物战斗运行时类。
- Context：`PetCombatRuntime` 固定同步、跟随、索敌、选择动作、执行技能、推进持续效果、输出快照和销毁顺序。
- Strategy：`PetBehavior` 只表达某种类/形态可选择和执行的技能差异；现有纯技能函数继续作为策略内部协作者。
- Registry：`PetBehaviorRegistry` 按 `species + form` 返回唯一 Behavior，不允许 Scene 写第二套分支。
- 公共服务：`PetCombatTargeting` 统一存活目标筛选、最近目标、距离和朝向。

## 模式角色与源码映射

| 模式角色 | 项目职责 | 目标文件/符号 | 允许依赖 | 禁止职责 | 实施状态 |
| --- | --- | --- | --- | --- | --- |
| Context 公共类 | 单只出战宠物完整战斗生命周期和可变 Runtime 状态 | `src/systems/PetCombatRuntime.ts:class PetCombatRuntime` | PetState/Roster、owner/target snapshot、Projectile、Behavior | Phaser View、存档写盘、宠物 UI | 未实现 |
| Strategy 合同 | 选择宠物动作、执行种类技能、推进种类持续效果 | `src/systems/PetBehavior.ts:interface PetBehavior` | 只读战斗上下文、现有纯 skill systems | 公共跟随、全局选宠、Scene 引用 | 未实现 |
| Registry 类 | `species + form` 到 Behavior 的唯一映射和缺失拒绝 | `src/systems/PetBehaviorRegistry.ts:class PetBehaviorRegistry` | Behavior 实现 | 单局状态、技能算法 | 未实现 |
| 公共目标服务 | 存活筛选、最近目标、距离、朝向 | `src/systems/PetCombatTargeting.ts` | 纯快照 | 技能施放和状态修改 | 未实现，当前重复 |
| 具体 Behavior | Monkey/Horse/Dragon/Turtle/Ufo/Tiger/Phoenix/Rabbit/Mouse 等差异接线 | `src/systems/pet-behaviors/*PetBehavior.ts` | 对应现有技能系统 | 复制 Runtime 更新骨架 | 未实现 |
| 表现适配器 | 把 Runtime snapshot 投影为宠物动画/视图 | `src/scenes/*Pet*Bridge/View.ts` | Phaser、只读 snapshot | 技能选择、伤害或状态算法 | 部分实现 |

## 协作顺序

1. Party/关卡按 `PlayerSlot` 创建一个 `PetCombatRuntime`，传入 Roster、主人快照和共享 `PetBehaviorRegistry`。
2. 每帧 Runtime 同步当前出战宠物；更换、死亡或形态变化时销毁旧 Behavior 会话并从 Registry 解析新 Behavior。
3. Runtime 先执行公共跟随/warp，再由 `PetCombatTargeting` 形成唯一目标快照。
4. Runtime 调用 Behavior 选择并执行动作，统一处理冷却、MP/状态门禁和事件，再调用 Behavior 推进种类持续效果。
5. Runtime 发布只读 snapshot/event 给表现层和关卡；shutdown、换宠或离场时幂等 `destroy()`。

## 扩展规约

| 开发场景 | 允许新增/修改的位置 | 必须复用的入口 | 禁止做法 |
| --- | --- | --- | --- |
| 修改公共跟随/索敌/技能时序 | `PetCombatRuntime`、`PetCombatTargeting` 和合同测试 | Runtime `update(frame)` | 同步修改每个宠物技能文件 |
| 新增宠物种类/形态 | 一个 Behavior 实现 + Registry 一条映射 + 对应只读数据/测试 | `PetBehaviorRegistry.resolve` | Scene 增加 `if/switch species/form` |
| 增加技能特例 | 对应 Behavior 和纯 skill system | Behavior 的声明钩子 | 覆盖/复制完整 Runtime update |

## 消费者与迁移批次

| 消费者 | 正式/测试 | 目标接入方式 | 旧路径 | 迁移批次 | 状态 |
| --- | --- | --- | --- | --- | --- |
| `TestScenePetMagicBridge` P1 | 测试承载 | 只提交 `PetCombatFrame`、消费 snapshot/event | 大型 `requestPet*Skill` 分支 | P2 | 未迁移 |
| `TestSceneP2PetBridge` / Advanced bridge | 测试承载 | 同一 Runtime API | 第二套 P2/高级技能接线 | P2 | 未迁移 |
| Stage 1-1、1-2、1-3、2-1、2-2 P1/P2 | 正式 | 由 `HeroPartyRuntimeBridge`/公共宠物桥创建并更新 Runtime | Monkey/Horse BodyBridge 只做跟随表现，其他战斗行为未接 | P3 | 未迁移 |
| `FeatureUiScene` 的宠物保存同步 | 正式功能页 | 只通知 Roster 变化；不控制战斗 Runtime 内部 | `FormalPetRuntimeBridge` 直接重置 runtime model | P3 | 待改为生命周期通知 |
| 全部具体宠物行为 | 系统消费者 | Registry 唯一解析 | 具体函数由 barrel/Scene 直接导入 | P1/P4 | 未迁移 |

迁移批次：P1 由 `TASK-ARCH-203` 建立 Runtime/Behavior/Registry/Targeting 与公共合同；P2 迁移 TestScene P1/P2；P3 接入五个正式关卡；P4 删除旧分发出口、完成合同和正式旅程。P2-P4 仍待后续生成独立 task。

## 禁止路径

| 禁止行为 | 禁止的文件/符号/模式 | 校验方式 | 允许例外 | 当前结果 |
| --- | --- | --- | --- | --- |
| Scene 选择具体宠物技能 | Scene/Bridge 导入 `requestPet*Skill` | 迁移期 import 负向搜索 | P1/P2 迁移期临时兼容 | 当前大量存在 |
| 第二套种类/形态分支 | Scene/Bridge 的 species/form `if/switch` | AST/源码搜索 + 消费者矩阵 | Registry 内唯一映射 | 当前存在 |
| 重复目标/朝向算法 | 各 `Pet*SkillSystem` 私有 `selectNearest/getFacing/getDistance` | 精确符号搜索 | 技能独有几何计算 | 当前多处存在 |
| Runtime 依赖 Phaser | `src/systems/PetCombatRuntime.ts` 导入 Phaser/Scene/View | import 检查 | 无 | 目标未实现 |
| 正式关卡只投影本体而不更新战斗 Runtime | 五关宠物 bridge | 正式运行断言 | 无 | 当前未闭合 |

## 硬性验证门禁

| Gate | 对应迁移批次 | 静态结构断言 | 必须执行的行为/正式测试 | 命令 | 当前退出码 |
| --- | --- | --- | --- | --- | --- |
| P1 | Runtime/Behavior/Registry/Targeting | 四个目标文件和类/合同存在，systems 不依赖 Phaser | `pet-combat-runtime-design-tests` | `npm run check:system-design -- pet P1` | 1 |
| P2 | TestScene P1/P2 迁移 | 三个测试消费者只引用 Runtime，不再直接请求具体技能或分发 species/form | `pet-combat-runtime-design-tests` | `npm run check:system-design -- pet P2` | 1 |
| P3 | 五关正式接入 | 共享正式桥创建 `PetCombatRuntime`，BodyBridge 不再依赖旧 Runtime 函数 | 专用合同、`formal-pet-tests`、`formal-pet-journey-tests` | `npm run check:system-design -- pet P3` | 1 |
| P4 | 旧入口清零 | Scene 无具体宠物技能请求，barrel 不导出具体请求，旧 `PetRuntimeSystem.ts` 删除 | `pet-combat-runtime-design-tests` | `npm run check:system-design -- pet P4` | 1 |
| all | 系统完成 | 同时执行 P1-P4 全部断言 | 同时执行全部合同与正式回归 | `npm run check:system-design -- pet all` | 1 |

当前失败基线真实来自命令：四个目标角色、专用合同测试和正式入口均不存在，Scene 具体技能分发、重复入口及旧 Runtime 文件仍存在。

## 验收合同

| 规约 | 静态检查/测试/运行步骤 | 系统级完成预期 | 当前结果 |
| --- | --- | --- | --- |
| 角色存在与职责 | `check:system-design pet P1` | 四类角色真实存在且不依赖 Phaser | gate=1 |
| 依赖与唯一入口 | Scene import 负向搜索、Registry 映射完整性测试 | Scene 只依赖 Runtime/快照 | pending |
| 禁止路径清零 | `requestPet*Skill` Scene 导入、species/form 分支、重复 targeting 搜索 | 迁移目标旧路径为零 | pending |
| 模式合同 | 新 Runtime 生命周期、换宠、死亡、冷却、技能与幂等销毁测试 | P1/P2 和全部已恢复宠物行为通过 | pending |
| 正式消费者接入 | 五关 1P/2P 宠物跟随、索敌、释放、换宠/离场旅程 | 全部正式消费者调用同一 Runtime | pending |
| 迁移遗漏清零 | P1-P4 矩阵和 barrel/bridge 旧入口搜索 | 剩余消费者、旧入口、兼容层为零 | pending |

## 系统级剩余清单

- 未迁移消费者：TestScene P1/P2、高级技能桥、五关 P1/P2、功能页到战斗 Runtime 的换宠同步。
- 保留旧路径/兼容层：`PetRuntimeSystem` 函数组、`PetSystem` 大量具体技能出口、Scene 直接分发。
- 失败测试：`pet/all` 当前退出码 1；缺 `pet-combat-runtime-design-tests.ts`，目标类尚未实现。
- 未决偏差：尚未恢复/接入的宠物视觉不阻塞类骨架实施，但对应 Behavior 只有在行为证据明确后才能登记为完成。

## 验收批次记录

| 日期/Task | 本批范围 | 静态检查 | 合同测试 | 正式运行 | 结论 | 系统剩余项 |
| --- | --- | --- | --- | --- | --- | --- |
| 2026-08-19 / 人工设计 | 现状核定和硬门禁基线 | `pet/all` 退出码 1，报告缺类/Registry、Scene 直调、正式接入和旧文件 | 专用合同测试缺失，门禁拒绝通过 | 未运行 | 设计冻结，验收未开始 | P1-P4 全部待实施 |

## 验收退出记录

- 退出日期/Task：未退出。
- 最终证据：未完成。
- 退出条件：P1-P4 均为 0、`pet all` 为 0、所有正式 P1/P2 消费者和旧路径全部清零，并在同批标记 `已完成/已退出`。
- 退出后规则：普通宠物开发不再读取本设计验收机制，不再运行设计模式专项符合性检查；只有用户明确要求时才重开。

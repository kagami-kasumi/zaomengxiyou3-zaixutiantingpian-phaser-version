# 英雄（角色）系统类设计

设计状态：当前有效。

验收状态：未开始。

验收退出：未退出。

实施 task：尚未生成；本设计不并入现有角色视觉完整性/流畅度 task，用户要求实施时再生成独立有界迁移 task。

## 目标与范围

- 目标系统：五个玩家英雄在单/双人正式战斗中的移动、战斗、普攻、角色技能、快照和销毁。
- 要消除的重复/开发困难：公共队伍 Runtime 内直接识别个别英雄，TestScene 按五英雄调用五条技能 pipeline，新增/修改角色时需要在多个入口同步接线。
- 本设计范围：生成 `HeroRuntime` 抽象公共类，五个具体英雄类只实现技能差异钩子，由 `HeroRuntimeFactory` 唯一创建并被 `HeroPartyRuntime` 聚合。
- 非目标：不改角色成长、装备、技能数值或动画真值；不照搬 AS3 `Role*` 继承树；不让 systems 依赖 Phaser View。

## 现状定位

| 重复或困难 | 精确文件/符号 | 影响的消费者 | 本设计要如何收束 |
| --- | --- | --- | --- |
| 队伍公共移动、战斗、普攻已有统一函数，但成员只是数据组合 | `src/systems/HeroPartyRuntimeSystem.ts` | 五关与 TestScene | `HeroPartyRuntime` 改为聚合 `HeroRuntime[]`，保留现有公共算法 |
| 公共队伍 update 直接调用 Hero1 Shadow、普攻命中直接判断 Hero5 | `updateHeroPartyRuntime`、`resolveHeroPartyAttacks` | 所有正式关卡 | 移入 `Hero1Runtime`/`Hero5Runtime` 的差异钩子，Party 不识别具体 HeroId |
| 五英雄技能状态集中在 `HeroSkillModel.roleRuntimes` 和兼容 accessor | `HeroSkillSystem.ts`、`HeroSkillRuntimeAccessors.ts` | 技能系统、TestScene | 每个具体 HeroRuntime 持有自己的角色技能状态，公共模型只保留共享 MP/loadout/action |
| TestScene 明确顺序调用五个角色 bridge | `TestSceneHeroSkillPipeline.ts` | Stage 1-1/TestScene | 改为一次 `HeroPartyRuntime.update`，Scene 不再知道五英雄内部技能管线 |

## 设计前完成度

| 能力 | 已有实现 | 完成判断 | 设计处置 |
| --- | --- | --- | --- |
| 五关共享队伍 Runtime | Stage11 adapter、Stage12/13/21/22 GameplayBridge 均创建 `HeroPartyRuntime` | 已完成 | 保留外部聚合入口 |
| 公共移动/战斗/普攻/快照/销毁 | `HeroPartyRuntimeSystem` 函数组 | 完成度较高 | 下沉单英雄公共步骤到基类，Party 只编排集合 |
| 五英雄技能算法 | 多个 `Role1..5*System` 和 TestScene bridge | 单项实现多，但接线分裂 | 作为具体英雄类的协作者，不复制算法 |
| 公共英雄类与唯一工厂 | 不存在 | 未完成 | 新建 `HeroRuntime`、五具体类和 `HeroRuntimeFactory` |
| 正式五关完整技能调用 | 当前公共 Runtime 只明确接入部分 Hero1/Hero5 路径 | 未完成 | 五具体类统一进入正式 Runtime 更新链 |

结论：老角色系统并非整体面向对象完成。队伍、移动、战斗和普攻公共化较好，但“单英雄公共类 + 五英雄差异钩子 + 正式技能统一入口”完成度不足，因此需要本设计。

## 选定设计

- 选定方案：模板方法式英雄运行时类。
- 抽象基类：`HeroRuntime` 固定 update、resolveAttacks、applyEnvironmentHits、snapshot、destroy 的公共顺序，并拥有单英雄 movement/combat/normalAttack/sharedSkill 状态。
- 具体类：`Hero1Runtime` 至 `Hero5Runtime` 只实现 `createHeroSkillState`、`updateHeroSkills`、`resolveHeroSkillHits`、`destroyHeroSkills` 等受保护钩子。
- 唯一工厂：`HeroRuntimeFactory.create(definition)` 按 `HeroId` 构造具体类；Party 和 Scene 不直接 `new HeroNRuntime`。
- 聚合：`HeroPartyRuntime` 只遍历 `HeroRuntime[]`、处理玩家槽位和共享目标/投射物交换，不判断具体 HeroId。

## 模式角色与源码映射

| 模式角色 | 项目职责 | 目标文件/符号 | 允许依赖 | 禁止职责 | 实施状态 |
| --- | --- | --- | --- | --- | --- |
| 抽象模板类 | 单英雄公共状态和固定生命周期 | `src/systems/hero-runtime/HeroRuntime.ts:abstract class HeroRuntime` | 纯 movement/combat/attack/skill systems、只读 frame | Phaser、关卡波次/结果、按具体 HeroId 分支 | 未实现 |
| 具体实现类 | 五英雄技能状态与差异钩子接线 | `Hero1Runtime.ts` 至 `Hero5Runtime.ts` | 对应既有角色技能纯系统 | 重写整个公共 update、复制移动/战斗/销毁 | 未实现 |
| Factory | HeroId 到具体类的唯一构造入口 | `HeroRuntimeFactory.ts:class HeroRuntimeFactory` | 五具体类 | 单局 update、Scene、第二数据表 | 未实现 |
| Party 聚合 | 按 PlayerSlot 创建、遍历和查询 HeroRuntime | `HeroPartyRuntimeSystem.ts:HeroPartyRuntimeModel.members` | Factory、HeroRuntime 合同、共享 projectile/target snapshots | Hero1..5 具体技能调用或分支 | 现有函数模型部分符合 |
| 技能协作者 | 保留已验证的单技能算法和数值 | 既有 `Role1..5*System.ts`（历史文件名保留） | 纯模型/事件 | Scene 调度、Party 生命周期 | 已有但入口分裂 |
| 表现适配器 | 将 HeroRuntime snapshot/event 投影为动画和 Phaser 对象 | `HeroPartyRuntimeBridge.ts`、`HeroCombatVisualBridge.ts` | Phaser、只读 snapshot/event | 技能规则、伤害结算 | 部分符合 |

## 协作顺序

1. `HeroPartyRuntime` 根据 Party definition 为每个 `PlayerSlot` 调用 `HeroRuntimeFactory.create`。
2. 每帧 Party 形成输入、环境和怪物目标快照，依次调用每个 HeroRuntime 的公共 `update(frame)`。
3. 基类固定移动、公共战斗状态、普攻、角色技能钩子、投射物/事件推进和 previous input 提交顺序。
4. 具体 HeroRuntime 只在声明钩子内调用现有角色技能系统；结果以公共事件/snapshot 返回 Party 和表现层。
5. Party 统一处理集合查询、敌方攻击分发和共享投射物；shutdown 时逐个调用幂等 `destroy()`。

## 扩展规约

| 开发场景 | 允许新增/修改的位置 | 必须复用的入口 | 禁止做法 |
| --- | --- | --- | --- |
| 修改所有英雄公共流程 | `HeroRuntime` 和公共合同测试 | 基类 public 方法 | 在五具体类或五个 Scene 同步修改 |
| 新增一个英雄 | 一个具体 HeroRuntime + Factory 映射 + HeroId/数据/测试 | `HeroRuntimeFactory.create` | Party/Scene 新增具体英雄分支 |
| 增加角色独有技能 | 对应具体类钩子和既有纯 skill system | 基类钩子 | 重写完整 update 或直接由 Scene 调用 |

## 消费者与迁移批次

| 消费者 | 正式/测试 | 目标接入方式 | 旧路径 | 迁移批次 | 状态 |
| --- | --- | --- | --- | --- | --- |
| `HeroPartyRuntimeSystem` | 公共正式 Runtime | 聚合 `HeroRuntime[]`，不识别具体英雄 | 数据组合 + Hero1/Hero5 直接调用 | H1/H2 | 未迁移 |
| Stage 1-1/TestScene | 正式入口、测试承载 | 只调用 Party Runtime | `TestSceneHeroSkillPipeline` 五路分发 | H3/H4 | 未迁移技能入口 |
| Stage 1-2、1-3、2-1、2-2 | 正式 | 继续只调用 Party Runtime，由内部覆盖五英雄技能 | 当前共享 Party，但技能覆盖不完整 | H3 | 部分接入 |
| `HeroPartyRuntimeBridge`/视觉桥 | 正式表现层 | 只消费公共 snapshot/event | 现有桥接和兼容字段 | H3/H4 | 部分符合 |
| Hero1..5 角色技能系统 | 系统协作者 | 仅由对应具体类钩子调用 | TestScene/Party 直接调用 | H2/H3 | 未统一 |

迁移批次：H1 建立基类/五具体类/Factory 并包裹现有状态；H2 移除 Party 内 Hero1/Hero5 特判；H3 让五关 P1/P2 完整使用五具体类技能链；H4 删除 TestScene 五路 pipeline 和兼容 accessor，完成合同与正式旅程。

## 禁止路径

| 禁止行为 | 禁止的文件/符号/模式 | 校验方式 | 允许例外 | 当前结果 |
| --- | --- | --- | --- | --- |
| Party 判断具体 HeroId 或调用具体技能系统 | `HeroPartyRuntimeSystem.ts` 的 Hero1..5 import/branch | 迁移期 import/AST 搜索 | Factory 构造分支 | 当前 Hero1/Hero5 存在 |
| Scene 直接更新具体英雄技能 | `TestSceneHeroSkillPipeline`、`updateRole[1-5]SkillBridge` | import/reference 负向搜索 | H3/H4 迁移期临时兼容 | 当前存在 |
| 具体类复制公共生命周期 | `Hero1Runtime` 至 `Hero5Runtime` 定义完整 public update/snapshot/destroy | 结构测试/符号检查 | 只允许基类声明的 protected hooks | 目标未实现 |
| 现代新类型继续使用 Role 命名 | 新增 `RoleRuntime`/`RoleNRuntime` | glossary/源码检查 | 既有 AS3 证据与历史文件名 | 当前目标使用 Hero 命名 |
| Runtime 依赖 Phaser | `src/systems/hero-runtime/*` 导入 Phaser/Scene/View | import 检查 | 无 | 目标未实现 |

## 硬性验证门禁

| Gate | 对应迁移批次 | 静态结构断言 | 必须执行的行为/正式测试 | 命令 | 当前退出码 |
| --- | --- | --- | --- | --- | --- |
| H1 | 基类/五具体类/Factory | 七个目标类真实存在、继承正确且不依赖 Phaser | `hero-runtime-design-tests` | `npm run check:system-design -- hero H1` | 1 |
| H2 | Party 特判迁移 | Party 依赖 HeroRuntime/Factory，不再导入或调用 Hero1/Hero5 具体系统 | `hero-runtime-design-tests` | `npm run check:system-design -- hero H2` | 1 |
| H3 | 五关 Party→HeroRuntime 接入 | Party 成员为 `HeroRuntime[]`，正式消费者不导入具体角色系统 | 专用合同、`hero-party-runtime-tests` | `npm run check:system-design -- hero H3` | 1 |
| H4 | TestScene/兼容层清零 | Scene 无五路具体技能 update；`roleRuntimes` 和动态 accessor 删除 | 专用合同、`hero-party-runtime-tests` | `npm run check:system-design -- hero H4` | 1 |
| all | 系统完成 | 同时执行 H1-H4 全部断言 | 同时执行全部合同与正式回归 | `npm run check:system-design -- hero all` | 1 |

当前失败基线真实来自命令：公共基类、五具体类、Factory 和专用合同测试不存在；Party 仍有 Hero1/Hero5 特判，TestScene 五路 pipeline 与兼容 accessor 仍存在。

## 验收合同

| 规约 | 静态检查/测试/运行步骤 | 系统级完成预期 | 当前结果 |
| --- | --- | --- | --- |
| 角色存在与职责 | `check:system-design hero H1` | 七类角色存在且边界符合 | gate=1 |
| 依赖与唯一入口 | Party/Scene 具体角色 import 负向搜索 | 具体类只由 Factory 构造，Scene 只依赖 Party | pending |
| 禁止路径清零 | Hero1..5 直接分支、TestScene pipeline、兼容 accessor 搜索 | 迁移目标旧路径为零 | pending |
| 模式合同 | HeroRuntime 生命周期顺序、每个钩子、1P/2P、销毁测试；复跑 `hero-party-runtime-tests` | 五英雄公共与差异行为通过 | pending |
| 正式消费者接入 | 五关分别以五英雄/P1/P2 覆盖移动、普攻、至少一个角色技能与受击死亡 | 所有正式消费者使用同一 Party→HeroRuntime 链 | pending |
| 迁移遗漏清零 | H1-H4 消费者矩阵和旧入口负向搜索 | 剩余消费者、兼容字段和旧 pipeline 为零 | pending |

## 系统级剩余清单

- 未迁移消费者：HeroPartyRuntime、TestScene 五路技能 pipeline、五关完整角色技能接入、表现桥兼容字段。
- 保留旧路径/兼容层：`HeroSkillModel.roleRuntimes`、动态 accessor、Party 内 Hero1/Hero5 直接调用、TestScene Role1..5 bridge。
- 失败测试：`hero/all` 当前退出码 1；缺 `hero-runtime-design-tests.ts`，目标类尚未实现。
- 未决偏差：既有 `Role1..5*System.ts` 文件名属于历史实现/AS3 对照，可在迁移期保留；新类与新文件必须使用 `Hero` 命名。

## 验收批次记录

| 日期/Task | 本批范围 | 静态检查 | 合同测试 | 正式运行 | 结论 | 系统剩余项 |
| --- | --- | --- | --- | --- | --- | --- |
| 2026-08-19 / 人工设计 | 老系统完成度和硬门禁基线 | `hero/all` 退出码 1，报告缺七类、Party 特判、五路 pipeline 和兼容层 | 专用合同测试缺失，门禁拒绝通过 | 未运行 | 设计冻结，验收未开始 | H1-H4 全部待实施 |

## 验收退出记录

- 退出日期/Task：未退出。
- 最终证据：未完成。
- 退出条件：H1-H4 均为 0、`hero all` 为 0、五英雄五关 P1/P2 和兼容路径全部闭合，并在同批标记 `已完成/已退出`。
- 退出后规则：普通英雄开发不再读取本设计验收机制，不再运行设计模式专项符合性检查；只有用户明确要求时才重开。

# 关卡系统类设计

设计状态：当前有效。

验收状态：实施中。

状态依据：现有五关入口和生命周期基类已经统一，但公共 Runtime 类和类入口迁移尚未完成。

验收退出：未退出。

实施 task：尚未生成；本设计不改变当前唯一 Ready `TASK-SETTINGS-193E`，用户要求实施时再按任务生成规则建立有界迁移 task。

## 目标与范围

- 目标系统：五个现有关卡及以后新增的可玩关卡。
- 要消除的重复/开发困难：Scene 重复初始化世界、队伍、镜头、遭遇、结果、路由和销毁；单关重复实现失败、出口、解锁和结果流程。
- 本设计范围：把现有组合式运行框架固化为一个可实例化的公共类，并保留已有 `LevelLifecycle` 模板基类和窄适配器。
- 非目标：不建立万能 `BaseLevel`/`BaseLevelScene`，不把怪物、英雄、地形、UI 或资源算法塞进关卡基类，不改变原版关卡行为。

## 现状定位

| 重复或困难 | 精确文件/符号 | 影响的消费者 | 本设计要如何收束 |
| --- | --- | --- | --- |
| 公共关卡流程已集中，但目前由工厂函数返回闭包对象 | `src/scenes/PlayableLevelRuntime.ts:createPlayableLevelRuntime` | Stage 1-1、1-2、1-3、2-1、2-2 | 固化为 `PlayableLevelRuntime` 类，公共状态和幂等销毁由实例持有 |
| 单关失败、出口和解锁容易重复 | `src/systems/LevelLifecycleSystem.ts:LevelLifecycle` | 五个 `Stage*FlowModel` | 保留既有模板基类，单关只实现内容推进和有证据的完成策略 |
| Scene/Bridge 仍可能绕过统一入口 | 五个 Scene/adapter 与 GameplayBridge | 五个正式关卡 | Scene 只创建、逐帧调用和销毁 Runtime；不得直接显示结果或写解锁 |
| 未来新关卡容易复制旧 Scene | `docs/architecture/playable-level-template.md` | 后续关卡 | 新关卡只增加定义、世界适配器、遭遇和薄 Scene |

## 设计前完成度

| 能力 | 已有实现 | 完成判断 | 设计处置 |
| --- | --- | --- | --- |
| 五关统一入口 | 五关均调用 `createPlayableLevelRuntime` | 已完成 | 保留消费者结构，迁移到类的静态创建入口 |
| 公共失败/通关/解锁模板 | 五个 Flow 均 `extends LevelLifecycle` | 已完成 | 不重写，不创建第二生命周期基类 |
| 公共运行时类 | 只有 `PlayableLevelRuntime` 类型与闭包工厂 | 未完成 | 生成同名公共类，实例持有 create/update/destroy 状态 |
| 五关行为与架构回归 | 已有 lifecycle、flow、result、formal party 和 architecture 测试 | 部分完成 | 类迁移后复跑五关正式链并清零旧工厂入口 |

结论：关卡公共化完成度较高，缺口集中在公共 Runtime 仍是闭包工厂而不是类。设计沿用现有组合边界，不另起一套关卡框架。

## 选定设计

- 选定方案：组合式关卡模板类。
- 公共骨架：`PlayableLevelRuntime` 类固定创建、逐帧调度、结果处理和销毁顺序；`LevelLifecycle` 固定失败、完成和解锁顺序。
- 差异注入：`PlayableLevelDefinition` 提供只读内容，`PlayableLevelWorldAdapter` 跨越 Phaser 世界边界，`PlayableLevelEncounter` 提供单关推进与事件。
- 唯一创建入口：`PlayableLevelRuntime.create(scene, partyRuntime, definition, parts)`；构造函数不对 Scene 暴露。

## 模式角色与源码映射

| 模式角色 | 项目职责 | 目标文件/符号 | 允许依赖 | 禁止职责 | 实施状态 |
| --- | --- | --- | --- | --- | --- |
| 公共模板类 | 固定关卡 create/update/result/destroy 骨架并持有内部状态 | `src/scenes/PlayableLevelRuntime.ts:class PlayableLevelRuntime` | Phaser Scene、Definition、WorldAdapter、Encounter、公共结果/资源桥 | 单关波次、怪物 AI、英雄算法、关卡私有 UI | 待类化；现有闭包已覆盖流程 |
| 生命周期基类 | 固定 playing/failure/failed/cleared、出口和幂等解锁 | `src/systems/LevelLifecycleSystem.ts:LevelLifecycle` | 纯配置、完成策略 | Phaser、波次、Boss、资源 | 已实现 |
| 只读定义 | 声明关卡 id、边界、出生点、资源和路由 | `src/systems/PlayableLevelDefinition.ts:PlayableLevelDefinition` | 只读数据 | 单局状态、Phaser 对象 | 已实现 |
| 世界适配器 | 创建/销毁地形和门视图，暴露窄世界边界 | `PlayableLevelWorldAdapter` 及各关实现 | Phaser 显示对象 | 战斗、结果、解锁 | 已实现 |
| 遭遇接口 | 推进波次/Boss/机关并提交结果 | `PlayableLevelEncounter` 及各关 bridge | Flow、实体 Runtime 快照/命令 | 英雄/怪物内部算法、结果视图、存档路由 | 已实现但怪物 owner 迁移另由既有架构任务处理 |
| 薄消费者 | 只创建 Runtime、转发 update、shutdown 时 destroy | 五个 Scene/Stage11 adapter | Runtime 唯一入口 | 复制公共初始化、直接显示结果 | 已接入旧工厂 |

## 协作顺序

1. 正式 Scene 调用 `PlayableLevelRuntime.create(...)`，传入 Party、Definition 和窄 parts。
2. Runtime 的 `create()` 校验定义，创建世界、英雄视图、遭遇和功能入口，并启动后台资源加载。
3. Scene 的 `update(deltaMs)` 只转发给 Runtime；Runtime 调用 Encounter，Encounter 再调度关卡内容和实体 Runtime。
4. Encounter 只返回 `failed`、`cleared` 或声明过的特殊结果；Runtime 是结果视图、重试、下一关和返回路由的唯一 owner。
5. Scene shutdown 只调用 Runtime 的幂等 `destroy()`；Runtime 按 Encounter、World、Result、View 的固定顺序释放。

## 扩展规约

| 开发场景 | 允许新增/修改的位置 | 必须复用的入口 | 禁止做法 |
| --- | --- | --- | --- |
| 修改公共关卡流程 | `PlayableLevelRuntime` 及其合同测试 | `PlayableLevelRuntime.create` | 在每个 Scene 同步改一遍 |
| 新增关卡 | 新 Definition、WorldAdapter、Encounter、FlowModel、薄 Scene | Runtime 类 + `LevelLifecycle` | 复制旧 Scene 或新建 `BaseLevelScene` |
| 增加关卡特例 | 有证据的窄完成策略或已声明 special result handler | Runtime/Encounter 扩展点 | Scene 直接写终态、解锁或结果路由 |

## 消费者与迁移批次

| 消费者 | 正式/测试 | 目标接入方式 | 旧路径 | 迁移批次 | 状态 |
| --- | --- | --- | --- | --- | --- |
| Stage 1-1 / `TestSceneStage11RuntimeAdapter` | 正式入口、测试承载 | `PlayableLevelRuntime.create` | `createPlayableLevelRuntime` | L1 | 待迁移入口 |
| `Stage12Scene` | 正式 | 同上 | 同上 | L1 | 待迁移入口 |
| `Stage13Scene` | 正式 | 同上 | 同上 | L1 | 待迁移入口 |
| `Stage21Scene` | 正式 | 同上 | 同上 | L1 | 待迁移入口 |
| `Stage22Scene` | 正式 | 同上 | 同上 | L1 | 待迁移入口 |
| 五个 `Stage*FlowModel` | 系统消费者 | 继续继承唯一 `LevelLifecycle` | 无 | L2 | 已符合，需回归 |

## 禁止路径

| 禁止行为 | 禁止的文件/符号/模式 | 校验方式 | 允许例外 | 当前结果 |
| --- | --- | --- | --- | --- |
| 新建万能关卡基类 | `BaseLevel`、`BaseLevelScene`、Stage Scene 继承链 | 迁移期源码搜索 | 无 | 当前无 |
| Scene 直接结果/解锁/路由 | `showLevelResult`、解锁写入、私有 retry/next/back | 五个消费者搜索与 architecture test | Runtime 内部 | 当前公共结果已集中 |
| 保留两套创建入口 | `createPlayableLevelRuntime` 与类入口并存 | L1 完成时负向搜索 | 迁移批次内短期兼容 | 当前旧入口存在 |
| Flow 重写公共终态 | 私有失败倒计时、私有 cleared/failed、直接存档 | lifecycle/flow tests 与源码搜索 | 有证据的窄完成策略 | 当前五 Flow 继承公共类 |

## 硬性验证门禁

| Gate | 对应迁移批次 | 静态结构断言 | 必须执行的行为/正式测试 | 命令 | 当前退出码 |
| --- | --- | --- | --- | --- | --- |
| L1 | Runtime 类化和五关入口迁移 | `PlayableLevelRuntime` 类/static create/create/update/destroy 存在；旧工厂和五关旧调用清零 | `playable-level-class-design-tests` | `npm run check:system-design -- level L1` | 1 |
| L2 | 生命周期、禁止路径和五关结果回归 | 五 Flow 继承 `LevelLifecycle`；无 `BaseLevel*`；Scene 不直接结果/解锁 | `playable-level-class-design-tests`、`level-lifecycle-tests`、`level-result-tests` | `npm run check:system-design -- level L2` | 1 |
| all | 系统完成 | 同时执行 L1/L2 全部断言 | 同时执行全部合同与正式回归 | `npm run check:system-design -- level all` | 1 |

当前失败基线真实来自命令：公共类/static create 不存在、五关仍调用旧工厂、专用行为合同测试尚未建立。任一 gate 非零均不得记为通过。

## 验收合同

| 规约 | 静态检查/测试/运行步骤 | 系统级完成预期 | 当前结果 |
| --- | --- | --- | --- |
| 角色存在与职责 | `check:system-design level L1` | 六类角色存在且职责不交叉 | gate=1 |
| 依赖与唯一入口 | `check:system-design level L1` + 既有关卡架构检查 | 五关只经类入口 | gate=1，旧工厂待删除 |
| 禁止路径清零 | 搜索 `BaseLevel*`、旧工厂、Scene 结果/解锁调用 | 禁止路径为零 | 部分通过 |
| 模式合同 | `level-lifecycle-tests`、五关 flow/result/party tests | 公共顺序、特殊策略和幂等销毁通过 | 既有测试通过基线，类迁移待复验 |
| 正式消费者接入 | 五关 1P/2P 进入、失败、通关、重试/下一关/返回 | 五关完整协作链通过 | 待类迁移后运行 |
| 迁移遗漏清零 | L1/L2 消费者矩阵与旧入口负向搜索 | 剩余消费者和兼容入口为零 | pending |

## 系统级剩余清单

- 未迁移消费者：五关仍调用 `createPlayableLevelRuntime` 工厂函数。
- 保留旧路径/兼容层：闭包工厂和 `PlayableLevelRuntime` 只读方法类型。
- 失败测试：`level/all` 当前退出码 1；缺 `playable-level-class-design-tests.ts`，目标类尚未实施。
- 未决偏差：Stage 1-1 仍由 TestScene adapter 承载，但只要保持薄适配器即可，不要求为类设计另建 Scene。

## 验收批次记录

| 日期/Task | 本批范围 | 静态检查 | 合同测试 | 正式运行 | 结论 | 系统剩余项 |
| --- | --- | --- | --- | --- | --- | --- |
| 2026-08-19 / 人工设计 | 现状核定和硬门禁基线 | `level/all` 退出码 1，精确报告缺类/旧工厂/五关旧调用 | 专用合同测试缺失，门禁拒绝通过 | 未运行 | 设计冻结，系统实施中 | L1/L2、旧入口清零、正式五关回归 |

## 验收退出记录

- 退出日期/Task：未退出。
- 最终证据：未完成。
- 退出条件：L1/L2 均为 0、`level all` 为 0、剩余清单为零，并在同批标记 `已完成/已退出`。
- 退出后规则：普通关卡开发不再读取本设计验收机制，不再运行设计模式专项符合性检查；只有用户明确要求时才重开。

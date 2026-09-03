# TASK-SETTINGS-213

任务类型：
- `TASK-SETTINGS`

任务模型：
- `逆向任务`

逆向子类型：
- `视觉真值逆向`

逆向方案：
- `docs/reverse-engineering/plans/ground-truth-fine-grained-generation.md`

功能条线：
- `LINE-PRE-STAGE-2-3-PRESENTATION`（Active；Ready）

目标机制/切片：
- `M-032`、`M-034`、`M-035`、`M-042`、`M-044`、`VS-067`

规模预算：
- 主工作包：2
- 预计上下文压缩：0
- 独立验收批次：2

拆分触发：
- 若需要读取青龙之外的第二宠物家族、引入未声明 SWF owner、研发新的 Flash 虚拟机能力，或任一实现影响事实仍 unresolved，立即拆成同线后续逆向 task；本 task 不修改 `src/`、不派生现代 atlas。

协作计划：
- 模式：单 agent
- 并行工作包：无；串行完成 AS3/共享运行链与恢复 SWF 真值
- 写入 owner：主 agent
- 归并检查点：行为范围冻结后、实现交接生成前
- 方法观测：`MO-003`（只记录经已采纳方法处理第三家族时的新差异或返工，不重开裁决）

单家族 G0 范围：
- 家族：`dragon1..4`；只覆盖青龙四形态。
- 本体状态：`wait/walk/hurt/dead`、跟随/追击/warp、普通攻击选择与完整动画转移。
- 专属技能：`fs/sdcc/ltwj/qlaoyi` 及四阶对前三技能的真实继承/组合；覆盖分身、冲锋弹、多段雷霆、青龙奥义对象、命中治疗和清理。
- 源资料族：恢复 `local-resources/regima/source/restored-swfs/pet1.swf`，仅在碰撞对象确有引用时窄查恢复 `StageCommon.swf`；AS3 只窄查 `PetDragon1..4`、`BasePet`、实际 bullet/effect 基类、`PetInfo` 和调用链必要消费者。旧提取只作 AS3/历史交叉对照。
- 原版入口与舞台：RegiMA 1.1 正式战斗，940×590；P1/P2 共享资源但 owner/runtime/lifecycle 独立。
- 状态 fixture：四形态 × 左右方向 × 声明动作逐 host tick；范围外追击→入围普攻；每个技能的门禁、释放、effect/projectile、hit/治疗、结束；hurt/dead、换宠/休息、返回/重试/重载。
- paired implementation：`TASK-SLICE-214`；证据轮只生成 verified 合同和独立验收集。

待证明的可观察问题：
- 四形态真实 `attackRange`、目标选择、动作优先级、随机分支、CD/MP/range 顺序以及分身是否改变 owner、碰撞或目标数。
- 普攻与 `fs/sdcc/ltwj/qlaoyi` 的 SymbolClass/character owner、emit tick、矩阵/注册点/边界、移动/跟随、collision/tracking、hit frame、伤害与治疗复用、attack-id dedup、动画转移和 cleanup。
- 四阶继承组合是串行、并行还是条件覆盖；多段雷霆各段身份与命中次数；奥义是否直接伤害、如何组合已学前三技能。
- P1/P2、换宠/休息、dead-complete、retry/return/reload 下 Runtime、分身、projectile/effect 和 damage source 的唯一 owner 与幂等销毁。

输入资料：
- `$pet-family-reverse` 与 `references/family-contract.md`；209/210 只提供流程样本，禁止复制马系事实。
- `docs/workflow/reverse-engineering-protocol.md`、`docs/workflow/reverse-engineering-task-protocol.md`、唯一逆向方案、`docs/reverse-engineering/pet-animation-corpus.md`、`pets-index.md`、现有 `M-042/VS-034/VS-067` 记录。
- 当前 `PetCombatRuntime`、Dragon Behavior/技能最小实现、Projectile、伤害、TestScene 与正式五关消费者清单；只读用于建立接受映射，不反推原版 expected。

输出产物：
- `docs/reverse-engineering/evidence/TASK-SETTINGS-213-pet-dragon-family.md`：六段证据链、owner/source precedence、逐形态 AI/动作/普攻/技能表、现代消费者矩阵、未知和反证。
- `docs/reverse-engineering/ground-truth/manifests/task-settings-213-pet-dragon-family.json` 与适用 Schema：字段级 family contract、递归显示列表、逐帧时序/矩阵/边界、来源 hash/locator、expected/extracted 与 `unresolved`。
- `docs/tasks/evidence/TASK-SETTINGS-213/` 的逐状态 940×590 原版基准，以及可重复 generator、独立 field-level handoff verifier 和 range/hit/source mutation-kill。
- 完整 `TASK-SLICE-214` 交接矩阵：每个 contract id 映射 expected 字段、正/负 fixture、黑盒 trace 字段、语义断言、正式/TestScene 消费者与 gate。

UI 原生化合同：
- 显示列表清单：逐形态本体、普攻、分身、冲锋弹、多段雷霆与奥义对象的根/child、depth、父子、帧、动态 add/remove、矩阵、注册点、bounds、filter/mask 与 owner。
- 原版机器真值 JSON：`task-settings-213.pet-dragon-family`；必须 Schema-valid、来源 hash/locator 可复核、expected/extracted 独立、`status=verified` 且 `unresolved=[]` 后才解除 214 阻塞。
- 原版视觉基准：RegiMA 1.1、940×590；每个声明动作/技能按关键 host tick 与左右方向生成，动态状态不得复用静态壳图。
- 允许的现代视觉例外：空；若发现源能力缺口，保持 unresolved 并阻塞，不自行创建可见替代层。
- 逐状态验收：四形态 wait/walk/hurt/dead/normal、全部技能与继承组合、范围外/入围、P1/P2、换宠/休息/dead/retry/return/reload。
- 差异证据：每个状态的对象/帧/几何/时序清单与原版基准；实现轮必须再给并排/叠图和实际运行 trace。

完成定义：
- 青龙四形态的完整行为、视觉、命中/治疗、owner 与生命周期形成一个 `verified`、零实现影响未知的单家族合同，并生成可直接执行且不依赖阅读历史的 214 交接。

验收标准：
- family generator `--check`、Schema、expected/extracted、字段级覆盖与独立 verifier 通过；range/hit/source 三类 mutation 均被杀死。
- 四形态普攻和每个技能都有 effect/projectile→collision/tracking→hit frame→damage/heal→cleanup 合同，范围外正负场景和 P1/P2 owner 均具备。
- `npm run test:pet-animation-corpus`、`npm run check:annotations`、`npm run check:workflow`、`npm run audit:problems`、`git diff --check` 通过；本 task 不运行或宣告现代复现。

禁止范围：
- 不修改 `src/`、不派生/接入现代资源、不把现有占位行为写成原版事实；不读取或实现玄龟/UFO/虎/凤凰/兔/鼠；不复制猴/马的数值、时序、owner 或技能模型。

状态更新：
- 更新 `mechanics-index.md`、`pets-index.md`、`pet-animation-corpus.md`、当前线覆盖台账、task-board/history；213 完成后激活 `TASK-SLICE-214`，不在同一次 `/goal` 续跑。

推荐后续任务：
- `TASK-SLICE-214`：直接消费 213 verified 青龙完整合同，闭合正式 P1/P2/TestScene 同源 Runtime、真普攻/全部技能、命中治疗、owner/lifecycle 和玩家可见验证。

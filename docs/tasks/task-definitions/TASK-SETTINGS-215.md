# TASK-SETTINGS-215

任务类型：
- `TASK-SETTINGS`

任务模型：
- `逆向任务`

逆向子类型：
- `视觉真值逆向`

逆向方案：
- `docs/reverse-engineering/plans/ground-truth-fine-grained-generation.md`

功能条线：
- `LINE-PRE-STAGE-2-3-PRESENTATION`（Active；Planned，排在 214 之后）

目标机制/切片：
- `M-032`、`M-035`、`M-042`、`M-049`、`M-054`、`VS-072`

规模预算：
- 主工作包：2
- 预计上下文压缩：0
- 独立验收批次：2

拆分触发：
- 若必须同时闭合治疗 `bunum`、回蓝 `bulnum`、蓝耗 `mp_`、`miss` 或第二个未声明资源包，立即拆成同线后续 task；本 task 只处理角色/宠物实际承伤的 `pnum0..9`，不修改 `src/`。

协作计划：
- 模式：单 agent
- 并行工作包：无；串行完成 AS3 调用链与恢复 SWF 真值
- 写入 owner：主 agent
- 归并检查点：状态/fixture 冻结后、216 交接生成前
- 方法观测：无

待证明的可观察问题：
- 怪物、环境与持续效果命中角色/宠物后，最终传给 `addHeroHurtMc`、`addMonHurtMc` 或 `CureHpQueue.addHpLose` 的数字是原始计算值、护盾/转嫁后的值还是实际 HP decrease；0、致死 clamp、无敌、护盾和玄龟转嫁分别是否显示。
- `BaseHero.reduceHp`、`BasePet.reduceHp`、`BaseMutiLevelListenering` 与远端同步路径中，P1/P2/单机/房间的 producer precedence、去重和显示 owner。
- `pnum0..9` 的 SymbolClass、character id、位图 bounds、20px 位距、`(x-20,y-60)` 锚点、4×→1×弹出、延迟、上浮/淡出、depth 和销毁时序。
- 角色与宠物是否共用同一字形/几何；直接 `ANumber` 与队列 `addHpLose` 是否具有可观察时序差异。

输入资料：
- `docs/workflow/reverse-engineering-protocol.md`、`docs/workflow/reverse-engineering-task-protocol.md` 与唯一逆向方案。
- 恢复 `local-resources/regima/source/restored-swfs/assets/OtherMat1.swf`；旧提取只窄查 `BaseHero.as`、`BasePet.as`、`BaseObject.as`、`BaseBullet.as`、`BaseMutiLevelListenering.as`、`CureHpQueue.as`、`ANumber.as` 及必要 Role override/消费者。
- 211/212 的怪物目标数字真值、反馈模型和运行证据只作边界对照，不得把 `hurtnum/bnum` 当作角色/宠物 `pnum`。
- 当前 `Stage1CombatSystem`、`HeroCombatSystem`、`PetCombatRuntime`、环境伤害入口、TestScene 与正式五关消费者只读审计，用于生成 216 映射。

输出产物：
- `docs/reverse-engineering/player-pet-incoming-damage-feedback-index.md`：六段证据链、producer/owner/数值/时序矩阵、现代断链、未知和反证。
- `docs/reverse-engineering/ground-truth/manifests/task-settings-215-player-pet-incoming-damage-feedback.json` 与适用 Schema：`pnum0..9` 显示列表、状态/fixture、来源 hash/locator、expected/extracted、完整性和 `unresolved`。
- `docs/tasks/evidence/TASK-SETTINGS-215/` 的逐状态 940×590 原版基准、显示对象差异清单和可重复 generator/check。
- `TASK-SLICE-216` 的字段→正/负 fixture→黑盒 trace→assertion→正式/TestScene 消费者交接矩阵。

UI 原生化合同：
- 显示列表清单：`pnum0..9`、`ANumber` 根、角色/宠物锚点、直接/队列创建、depth、矩阵、bounds、alpha/scale/tween 与销毁。
- 原版机器真值 JSON：`task-settings-215.player-pet-incoming-damage-feedback`；来源 hash/locator、expected/extracted 独立、Schema-valid、`status=verified` 且 `unresolved=[]` 后才解除 216 阻塞。
- 原版视觉基准：RegiMA 1.1、940×590；角色/宠物、P1/P2、弹出/稳定/上浮/淡出/销毁及适用的 0/致死/护盾/转嫁状态。
- 允许的现代视觉例外：空；若最终显示值或特殊防御语义仍未知，保持 unresolved 并阻塞实现。
- 逐状态验收：角色/宠物、P1/P2、普通/致死/重复/无效命中、护盾/无敌/转嫁、直接/队列和生命周期清理。
- 差异证据：逐状态对象/字形/位距/锚点/scale/alpha/timing 清单与原版基准；216 必须再给正式运行并排/叠图和 HP delta trace。

完成定义：
- 角色与宠物承伤数字的 producer→数值裁决→显示→销毁、P1/P2 owner 和全部实现影响边界形成 `verified`、零 unresolved 的原版合同，并生成可直接执行的 216 交接。

验收标准：
- generator `--check`、Schema、expected/extracted、状态/对象完整性和关键字段 mutation-kill 通过。
- 每个声明 producer 均有正/负 fixture；角色/宠物、P1/P2、0/致死/护盾/转嫁/去重的显示或不显示结论有精确证据。
- `npm run check:annotations`、`npm run check:workflow`、`npm run audit:problems` 与 `git diff --check` 通过；本 task 不运行或宣告现代复现。

禁止范围：
- 不修改 `src/`、不接入现代资源、不重开 211/212 怪物目标数字与连击；不闭合治疗、回蓝、蓝耗、miss 或战斗 HUD 其他控件；不以当前现代行为反推原版 expected。

状态更新：
- 更新 `mechanics-index.md`、`vertical-slices.md`、当前线覆盖台账、task-board/history；215 完成后激活 `TASK-SLICE-216`，不在同一次 `/goal` 续跑。

推荐后续任务：
- `TASK-SLICE-216`：直接消费 215 verified 真值，闭合角色/宠物实际承伤到 `pnum` 的正式 P1/P2/TestScene 可见链路。

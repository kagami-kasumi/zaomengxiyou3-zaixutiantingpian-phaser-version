# 游戏任务看板

本文只记录未完成的游戏复现 task。完整系统范围和激活状态以 `docs/tasks/feature-lines.md` 为准；一次 `/goal` 的边界以 `docs/tasks/goal-board.md` 为准；task 是最小验收单位。完成 task 或 Goal 都不等于完成功能条线。

## 当前推荐

`TASK-ARCH-013A` 是唯一当前推荐，属于唯一 `Active` Goal `GOAL-035` 和 `LINE-FORMAL-GAME-LOOP`。下一次 `/goal` 只建立玩家直属灵魂 owner、V6 schema 和 V1..V5 无损迁移；跨功能全旅程由同线 `GOAL-036` 独立闭合，不进入 Stage 2-3。

## 待完成任务

| Task | 状态 | Goal | 功能条线 | 类型 | 目标 | 目标机制/切片 | 输出 | 下一步 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| TASK-ARCH-013A | Ready | GOAL-035 | LINE-FORMAL-GAME-LOOP | 玩家/存档架构 | 将灵魂提升为玩家直属属性并完成 V6 与 V1..V5 无损迁移 | M-044、VS-055、PG-010 | `player.soulCount` 唯一 owner、V6 codec、旧档迁移与专项回归 | TASK-ARCH-013B |
| TASK-ARCH-013B | Planned | GOAL-036 | LINE-FORMAL-GAME-LOOP | 跨功能事务闭环 | 收敛技能、炼丹炉、法宝等灵魂消费者并完成负向门禁与正式旅程 | M-016、M-041、M-044、VS-055、PG-010 | 统一消费合同、P1/P2 隔离、跨页重载回归与 940×590 证据 | 恢复 TASK-SETTINGS-064 |
| TASK-SETTINGS-064 | Planned | GOAL-025 | LINE-STAGE-2-3 | 关卡/玩法逆向 | 闭合 Stage 2-3 真场景、流程、怪物/机关、结果与存档六段证据 | M-026、M-027、M-030、M-035、M-044、VS-057 | 权威证据矩阵、资源标注、未知/反证与有界实现 Goal | 依据证据生成同线最小实现 Goal |
| TASK-ARCH-010A | Planned | GOAL-026 | LINE-MONSTER-ARCH | 现代怪物架构 | 建立组合式怪物定义、运行状态、Targeting/Brain 接缝并抽离关卡命名的通用 owner | M-030、VS-005、VS-006 | 通用合同、定义目录、策略入口、兼容 facade 与确定性回归 | TASK-ARCH-010B |
| TASK-ARCH-010B | Planned | GOAL-027 | LINE-MONSTER-ARCH | 怪物生命周期治理 | 建立唯一怪物运行时注册表并在普通怪+Boss 正式关卡试点 | M-030、VS-007、VS-056 | 注册表、Flow/bridge 所有权收敛、试点关卡回归与后续迁移清单 | 依据试点生成同线逐关卡迁移 task |

## 任务完成定义

### TASK-ARCH-013A

任务类型：

- `TASK-ARCH`

功能条线：

- `LINE-FORMAL-GAME-LOOP`（Active）

Goal 包：

- `GOAL-035`（Active）

目标机制/切片：

- `M-044`、`VS-055`、`PG-010`

规模预算：

- 主工作包：2（玩家级灵魂合同；V6 codec 与旧档迁移）
- 预计上下文压缩：0
- 独立验收批次：2

拆分触发：

- 若必须同时重构玩家完整数据模型、改动灵魂数值规则或进入浏览器跨功能旅程，立即留给 `TASK-ARCH-013B`；本 Goal 不扩大到 UI/资源修改。

输入资料：

- `PG-010`、`SaveSystem.ts`、`SkillUISystem.ts`、当前玩家运行时与相关保存/技能专项。
- V1..V5 schema 和现有 party/P1/P2 迁移合同。

输出产物：

- 当前现代玩家状态与 V6 存档直接声明 `soulCount`；技能学习状态不再拥有灵魂。
- V1..V5 嵌套灵魂无损迁移到 V6 玩家直属字段，P1/P2 各自保持原值。
- 使现有 TypeScript 运行消费者可编译地读取当前玩家 owner；不保留双写或镜像字段。

完成定义：

- V6 新档、保存、读取和旧档迁移均只输出 `player.soulCount`。
- `HeroSkillLearningState` 不再声明灵魂；旧嵌套路径只允许存在于显式 legacy schema/迁移代码。
- 保存、迁移、技能规则专项与 build 通过。

验收标准：

- 覆盖 V1..V5→V6、V6 round-trip、P1/P2 不同余额和损坏值拒读。
- `npm run check:structure`、相关专项、build、workflow 与 `git diff --check` 通过。

禁止范围：

- 不改灵魂初始值、掉落值、消耗值或技能数值。
- 不修改技能/炼丹炉/法宝视觉、bundle 或原始资源。
- 不提前关闭正式主循环；跨功能门禁与浏览器旅程留给 `TASK-ARCH-013B`。

状态更新：

- 更新 PG-010、正式主循环台账、Goal/task/history 与适用 PG 反馈。

推荐后续任务：

- `TASK-ARCH-013B`

### TASK-ARCH-013B

任务类型：

- `TASK-ARCH`

功能条线：

- `LINE-FORMAL-GAME-LOOP`（Planned，待 GOAL-035 完成后激活）

Goal 包：

- `GOAL-036`（Planned）

目标机制/切片：

- `M-016`、`M-041`、`M-044`、`VS-055`、`PG-010`

规模预算：

- 主工作包：2（跨功能消费接线；全旅程与防复发）
- 预计上下文压缩：0
- 独立验收批次：2

拆分触发：

- 若发现新的灵魂消费者需要独立玩法逆向、数值裁决或新 UI，登记后另拆 task；本 Goal 只闭合仓库中已知消费者。

输入资料：

- `TASK-ARCH-013A` 的 V6/player owner、技能/工坊/法宝运行桥接和现有正式旅程测试。

输出产物：

- 技能、炼丹炉、法宝和已知消费者统一检查/扣减当前 `player.soulCount`。
- 禁止 `skillLearning.soulCount` 回流的静态/运行负向门禁。
- P1/P2 隔离、跨功能连续消费、保存重载与 940×590 正式功能页证据。

完成定义：

- 仓库现代运行代码和当前测试合同不再读取或写入 `skillLearning.soulCount`。
- 同一玩家跨功能余额连续，另一玩家不受影响，重载后保持一致。
- 全系统、build、workflow、diff check 与浏览器旅程通过后关闭 PG-010 存量问题。

验收标准：

- 相关专项、`npm run test:systems`、build、structure、workflow、diff check 通过。
- 940×590 双人 P1/P2 在技能、炼丹炉、法宝代表消费与重载中零串号、零 console warning/error。

禁止范围：

- 不调整消费/掉落平衡，不重做页面视觉，不修改 legacy extraction。

状态更新：

- 更新 PG-010、正式主循环覆盖台账、Goal/task/history 和适用 PG 反馈；关闭后恢复 Stage 2-3。

推荐后续任务：

- `TASK-SETTINGS-064`

### TASK-SETTINGS-064

任务类型：

- `TASK-SETTINGS`

功能条线：

- `LINE-STAGE-2-3`（Planned；等待正式主循环再次关闭）

Goal 包：

- `GOAL-025`（Planned）

目标机制/切片：

- `M-026`、`M-027`、`M-030`、`M-035`、`M-044`、`VS-057`

规模预算：

- 主工作包：2
- 预计上下文压缩：0
- 独立验收批次：2

拆分触发：

- 若目标关卡还要求独立闭合两个以上未恢复资源族、跨入 `level231/232/233` 支线，或六段证据无法在一个关卡主包内清零影响实现的未知，立即拆成同线后续逆向 Goal；本 Goal 不写现代实现。

输入资料：

- `docs/workflow/reverse-engineering-protocol.md`、`docs/reverse-engineering/levels-index.md`、Stage 2-3 覆盖台账。
- `local-resources/regima/source/restored-swfs/assets/levels/level23.swf` 及实际加载到的恢复源共享包；视觉资源存在性以恢复语料库为准。
- `local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts/export/level/StageListener23.as` 与沿调用链窄查到的共享 AS3；legacy extraction 只读。

输出产物：

- 在 `levels-index.md` 建立 Stage 2-3 最小证据矩阵：局部类/实例、共享输入/物理/镜头/状态机/结果/存档、SWF 时间轴/注册点/碰撞盒/矩阵/坐标空间、可观察合同、现代 owner 建议和双重验证计划。
- 在恢复源包中定位场景、机关、怪物、弹体、门与结果所需 SymbolClass/MovieClip，选择性派生到 Git 忽略 task output，并更新独立 asset annotation batch；未知、推断、现代设计选择和反证条件必须显式分级。
- 根据证据把实现拆成一至多个同线 0-compact Goal/task；不得把新资料族逆向、多个 owner 实现和端到端校准重新合并。

完成定义：

- 待证明问题逐项回答：目标关卡身份与进入路由、显示列表/布局、墙/平台/停点/刷怪点、专属机关、怪物与攻击对象、失败/胜利、下一关解锁与当前槽保存。
- 六段证据矩阵完整，所有影响首个实现切片的未知为零；若不能清零则只归档已定位边界并生成同线补证 Goal，不使用“已扒/权威输入”。
- 只产出逆向证据、资源标注和后续任务，不修改 `src/`，不进入 Stage 2-3 实现或 940×590 现代运行验收。

验收标准：

- 恢复源 SWF 与 legacy AS3 交叉确认；视觉/空间结论包含注册点、嵌套矩阵、碰撞边界、坐标语义和现代素材原点。
- 关键结论按确认事实/交叉确认/推断/未知/现代设计选择分级，并列出反证条件；高风险视觉/时序至少达到交叉确认。
- `npm run check:annotations`、`npm run check:workflow` 与 `git diff --check` 通过；新后续 Goal 满足规模预算门禁。

禁止范围：

- 不修改、删除或重新生成 `local-resources/regima/legacy-extraction/`。
- 不因名称相近而把 `level231/232/233.swf` 或 Stage 23-x 支线自动并入主 Stage 2-3。
- 不写现代关卡代码，不用 Stage 2-2 规则类推缺失常量，不把局部关卡类当作完整调用链。

状态更新：

- 更新 `levels-index.md`、`mechanics-index.md`、`vertical-slices.md`、Stage 2-3 覆盖台账、资源标注、Goal/task/history 与适用 PG 反馈。

推荐后续任务：

- 依据闭合证据生成同线最小实现 Goal；若证据未闭合，生成同线最小补证 Goal。

### TASK-ARCH-010A

任务类型：

- `TASK-ARCH`

功能条线：

- `LINE-MONSTER-ARCH`（Planned；不得抢占当前 Active 线）

Goal 包：

- `GOAL-026`（Planned）

目标机制/切片：

- `M-030`、`VS-005`、`VS-006`

规模预算：

- 主工作包：2
- 预计上下文压缩：0
- 独立验收批次：2

拆分触发：

- 若兼容抽取要求同时迁移两个以上正式关卡 bridge、改动怪物视觉 owner，或把 `Monster3` 与 `Monster30` 的全部专属技能一并迁移，立即保留兼容 facade 并把消费者迁移拆成同线下一 Goal。

输入资料：

- `docs/architecture/设计模式.md`、`docs/architecture/src-boundaries.md`、`docs/domain/glossary.md`。
- `Stage1CombatSystem.ts`、`Monster3System.ts`、`Monster30System.ts`、`MonsterPhysicsSystem.ts`、`MonsterDefeatRewardSystem.ts`、`DropSystem.ts`。
- `docs/reverse-engineering/monsters-index.md` 与 `M-030` 已确认行为；AS3 只作行为证据，不作现代类结构模板。

输出产物：

- 建立 `MonsterDefinition`、`MonsterRuntime`、`MonsterBrain`、目标选择合同和只读 `MonsterDefinitionCatalog` 的现代 owner。
- 将 `Stage1CombatSystem` 中跨关卡复用的怪物配置、创建和更新规则迁至无关卡命名模块；保留薄兼容 facade，避免一次迁移所有消费者。
- 把至少一个重复目标选择路径接入参数化 Targeting 策略，支持横向/二维距离、警戒范围和存活过滤，不改变已确认怪物行为。
- 增加确定性测试，证明定义解析、目标选择、状态转换、稳定 ID 和兼容 facade 行为一致。

完成定义：

- 关卡出生数据只需引用怪物类型；怪物静态定义不由具体关卡 Flow 重复声明。
- 普通行为可以通过 `MonsterBrain` 合同替换，特殊怪物无需继承万能 `Monster` 父类。
- 通用 owner 不读取 Phaser 显示对象；动画、物理、伤害、奖励和掉落仍由既有 owner 管理。
- 现有正式关卡与测试切片通过兼容 facade 保持行为，不在本 task 移除 Flow/bridge 双登记。

验收标准：

- 先运行 `npm run check:structure`；目标文件触发 error 时先拆分，warning 按规则处理。
- `npm run test:systems`、涉及的怪物/关卡专项测试、`npm run build`、`npm run check:workflow` 和 `git diff --check` 通过。
- `rg` 复核没有新增第二份怪物定义表、目标选择公式或通用攻击状态转换 owner。

禁止范围：

- 不引入完整 ECS、全局事件总线、服务定位器或依赖注入框架。
- 不修改怪物数值、攻击时序、攻击几何、掉落概率、动画帧或关卡通关条件。
- 不删除兼容 facade，不在一次 task 中迁移全部关卡、Boss 和测试怪物。

状态更新：

- 更新 `LINE-MONSTER-ARCH` 覆盖台账、`src-boundaries.md`、适用机制/切片、Goal/task/history 与 PG 反馈。

推荐后续任务：

- `TASK-ARCH-010B`：建立最小 `MonsterRuntimeRegistry`，在一个普通怪 + Boss 正式关卡试点唯一生命周期 owner。

### TASK-ARCH-010B

任务类型：

- `TASK-ARCH`

功能条线：

- `LINE-MONSTER-ARCH`（Planned；待 `TASK-ARCH-010A` 完成且本线获得 WIP）

Goal 包：

- `GOAL-027`（Planned）

目标机制/切片：

- `M-030`、`VS-007`、`VS-056`

规模预算：

- 主工作包：2
- 预计上下文压缩：0
- 独立验收批次：2

拆分触发：

- 若试点需要同时迁移第二个正式关卡、引入通用掉落/投射物注册表，或改变关卡视觉 bridge 的资源派生与逐帧合同，立即限制为怪物注册表和单关卡生命周期，并将扩展拆成同线下一 Goal。

输入资料：

- `TASK-ARCH-010A` 的通用合同与兼容 facade。
- `docs/architecture/设计模式.md`、`docs/architecture/src-boundaries.md`、`LINE-MONSTER-ARCH` 覆盖台账。
- 一个同时具有普通怪和 Boss、已具备确定性测试与运行验收入口的正式关卡；默认候选为 Stage 2-2，执行前按当前工作树复核。

输出产物：

- 最小 `MonsterRuntimeRegistry`：稳定 ID、创建/查询/按遭遇筛选、幂等死亡登记和安全移除。
- 试点关卡以注册表作为怪物运行状态唯一 owner；Flow 只保留生成计划、遭遇进度和通关所需计数/ID，不复制完整怪物状态。
- scene bridge 继续拥有 Phaser view 适配，但不作为生命、AI、死亡或奖励事实源。
- 形成逐关卡迁移清单、风险和拆分建议，不在本 task 批量迁移其他正式关卡。

完成定义：

- 试点关卡怪物生成、更新、死亡、奖励、Boss 显门和销毁都由同一稳定 ID 串联。
- 重复死亡/移除安全幂等，Flow 与 bridge 不再各持一份完整怪物运行状态。
- 注册表保持轻量，不扩张为完整 ECS；系统仍通过明确输入/输出测试。
- 普通怪与 Boss 的 1P/2P 可玩行为、真视觉和通关结果无回归。

验收标准：

- 先运行 `npm run check:structure`；目标文件触发 error 时先拆分。
- 注册表确定性测试覆盖重复 ID、查询、死亡/移除幂等、空遭遇、普通怪与 Boss 并存和通关计数。
- 试点关卡专项、`npm run test:systems`、`npm run build`、`npm run check:workflow` 和 `git diff --check` 通过。
- 使用 940×590 正式入口复验 1P/2P 生成、战斗、Boss、失败/胜利、返回与重载，console 无 warning/error。

禁止范围：

- 不把掉落、宠物、投射物和场景物件同时纳入注册表。
- 不改变原版已确认流程、数值、视觉资源、动画时序或攻击几何。
- 不在试点未闭合前删除其他关卡的兼容路径。

状态更新：

- 更新 `LINE-MONSTER-ARCH` 覆盖台账、试点关卡覆盖台账、相关机制/切片、Goal/task/history 与适用 PG 反馈。

推荐后续任务：

- 依据试点结果生成同线逐关卡迁移 task；每个 Goal 只迁移一个共享 owner 簇或一个可独立验收的关卡批次。

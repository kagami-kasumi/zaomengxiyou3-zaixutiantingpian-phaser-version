# 游戏任务看板

本文只记录未完成的游戏复现 task。完整系统范围和激活状态以 `docs/tasks/feature-lines.md` 为准；一次 `/goal` 的边界以 `docs/tasks/goal-board.md` 为准；task 是最小验收单位。完成 task 或 Goal 都不等于完成功能条线。

## 当前推荐

`TASK-SLICE-152` 是唯一当前推荐，属于唯一 `Active` Goal `GOAL-031` 和已重开的 `LINE-FORMAL-GAME-LOOP`。下一次 `/goal` 只把技能页 owner/角色可达性收敛到当前存档 `PartyConfiguration`，不提前实现地图直接进关或改动技能数值/树内容；Stage 2-3 逆向继续后移。

## 待完成任务

| Task | 状态 | Goal | 功能条线 | 类型 | 目标 | 目标机制/切片 | 输出 | 下一步 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| TASK-SLICE-152 | Ready | GOAL-031 | LINE-FORMAL-GAME-LOOP | 技能 owner 收敛 | 技能页只显示当前存档 owner 的当前角色技能 | M-041、M-044、M-052、VS-055 | 存档驱动 owner/角色、P1/P2 边界与技能页回归 | TASK-SLICE-153 |
| TASK-SLICE-153 | Planned | GOAL-032 | LINE-FORMAL-GAME-LOOP | 正式进关收敛 | 删除地图逐关人数选择，所有正式关卡/重试/HUD/功能页消费存档队伍 | M-005、M-006、M-044、M-051、VS-053 | 直接进关、跨场景 owner 一致性与端到端回归 | TASK-SETTINGS-064 |
| TASK-SETTINGS-064 | Planned | GOAL-025 | LINE-STAGE-2-3 | 关卡/玩法逆向 | 闭合 Stage 2-3 真场景、流程、怪物/机关、结果与存档六段证据 | M-026、M-027、M-030、M-035、M-044、VS-057 | 权威证据矩阵、资源标注、未知/反证与有界实现 Goal | 依据证据生成同线最小实现 Goal |
| TASK-ARCH-010A | Planned | GOAL-026 | LINE-MONSTER-ARCH | 现代怪物架构 | 建立组合式怪物定义、运行状态、Targeting/Brain 接缝并抽离关卡命名的通用 owner | M-030、VS-005、VS-006 | 通用合同、定义目录、策略入口、兼容 facade 与确定性回归 | TASK-ARCH-010B |
| TASK-ARCH-010B | Planned | GOAL-027 | LINE-MONSTER-ARCH | 怪物生命周期治理 | 建立唯一怪物运行时注册表并在普通怪+Boss 正式关卡试点 | M-030、VS-007、VS-056 | 注册表、Flow/bridge 所有权收敛、试点关卡回归与后续迁移清单 | 依据试点生成同线逐关卡迁移 task |

## 任务完成定义

### TASK-SLICE-152

任务类型：

- `TASK-SLICE`

功能条线：

- `LINE-FORMAL-GAME-LOOP`（Active）

Goal 包：

- `GOAL-031`（Active）

目标机制/切片：

- `M-041`、`M-044`、`M-052`、`VS-055`

规模预算：

- 主工作包：2
- 预计上下文压缩：0
- 独立验收批次：2

拆分触发：

- 若技能页修改要求同时重做技能树业务规则、绑定协议或 HUD 技能同步 owner，立即把业务修正留给同线后续 Goal；本 task 只收敛存档队伍与当前角色可见性。

输入资料：

- `TASK-ARCH-011` 的 `PartyConfiguration` 查询。
- `skill-ui-native-index.md`、`LINE-UI-NATIVE-SKILLS` 已闭合显示列表与 `TASK-SLICE-143` 视觉审计。
- `FormalSkillPageSystem.ts`、`FormalSkillPageView.ts`、`FormalSkillRuntimeBridge.ts`、`FeatureUiHostSystem.ts`。

输出产物：

- 技能页面从当前存档读取活动 owner；单人只允许 P1，双人允许 P1/P2。
- 每个 owner 的主动树、已学技能、绑定槽和被动只读取其存档当前 `heroId`，不得展示或操作其他角色技能。
- 战斗快捷键打开对应 owner；地图入口默认 P1，双人可用原版角色选择器切换 owner；单人不渲染 P2。
- 保存与 HUD 同步继续按稳定 `PlayerSlot` 路由，不能因两位玩家选择同一英雄而串号。

完成定义：

- 单人五角色分别只显示自己的两棵主动树、技能图标、绑定与被动。
- 双人不同/相同角色组合均可切换 owner，数据彼此隔离；非活动 P2 无法通过事件或直接调用写入。
- 页面不再依赖地图硬编码 `playerCount: 2` 或调用方任意传入人数决定 owner 集合。

UI 原生化合同：

- 显示列表清单：继续消费已闭合的 250/868/417/213、五角色选择器两帧、技能三态、P1/P2 键槽与动态字段清单。
- 原版视觉基准：沿用 `TASK-SLICE-143-visual-audit.md`，新增五种单人当前角色和双人同/异角色 owner 切换状态。
- 允许的现代视觉例外：无新增例外；单人隐藏非活动 owner，不新增“当前角色”现代标题或提示框。
- 逐状态验收：五角色主动双树、学习/升级/绑定/被动、单人、双人同角色、双人异角色、P1/P2 selected、关闭与重载。
- 差异证据：更新逐状态截图和对象差异清单，确认只变化 owner 可达性与对应角色内容。

验收标准：

- 修改前运行 `npm run check:structure`。
- 技能专项覆盖五角色、1P/2P、同角色双 owner、非活动 owner 拒绝、保存重载和 HUD 同步。
- `npm run test:systems`、技能/UI 专项、`npm run build`、`npm run check:workflow`、`git diff --check` 与 940×590 运行验收通过，console 无 warning/error。

禁止范围：

- 不改变技能数值、学习成本、等级上限、技能树内容、五槽顺序或快捷键。
- 不重新制作已闭合真 UI，不新增现代可见 owner 按钮。
- 不修改关卡内容或怪物系统。

状态更新：

- 更新本线与技能 UI 覆盖台账、`M-041/M-052`、`VS-055`、Goal/task/history 与适用 PG 反馈。

推荐后续任务：

- `TASK-SLICE-153`：删除逐关人数 chooser，让地图、关卡、HUD、功能页和重试统一消费存档队伍。

### TASK-SLICE-153

任务类型：

- `TASK-SLICE`

功能条线：

- `LINE-FORMAL-GAME-LOOP`（Active 后续）

Goal 包：

- `GOAL-032`（Planned）

目标机制/切片：

- `M-005`、`M-006`、`M-044`、`M-051`、`VS-053`

规模预算：

- 主工作包：2
- 预计上下文压缩：0
- 独立验收批次：2

拆分触发：

- 若正式消费者迁移需要同时重写两个以上关卡玩法 owner，或旧关卡无法通过统一启动参数适配，立即先建立共享 party bootstrap 并只迁移地图与一个代表关卡，其余关卡拆成同线后续 Goal。

输入资料：

- `TASK-ARCH-011` 的队伍查询、`TASK-SLICE-151` 新建存档流程和 `TASK-SLICE-152` owner 规则。
- `HeavenMapScene.ts`、正式 Stage 1/2 scenes、result/retry bridges、HUD 与 FormalFeatureUiEntryBridge。
- `heaven-map-index.md` 既有地图显示列表和原版视觉基准。

输出产物：

- 删除 `HeavenMapScene` 的逐关 1P/2P chooser；点击已解锁且可用节点后直接按当前存档队伍启动。
- 建立共享正式 party bootstrap，使关卡、HUD、功能页、失败重试、胜利返回和重载从存档恢复相同人数与角色。
- 地图不再硬编码双 owner；单人只注册 P1 功能入口，双人才注册 P2。
- URL/scene payload 人数覆盖只保留在明确 DEV/QA 路径，正式路由忽略或拒绝。

完成定义：

- 同一存档从地图进入任一已接入关卡时，人数、P1/P2 角色、HUD、技能和功能页 owner 一致。
- 失败重试、胜利返回、退出地图和整页重载不改变队伍配置。
- 地图没有逐关人数选择可见对象、残留交互或 chooser 生命周期状态。
- 已接入正式关卡的玩法、通关和存档进度无回归。

UI 原生化合同：

- 显示列表清单：消费现有天庭地图节点/菜单清单；删除的现代人数 chooser 单独列入差异，不改变原地图对象。
- 原版视觉基准：沿用天庭地图 940×590 基准，补单人/双人存档点击节点直接进入的运行证据。
- 允许的现代视觉例外：不新增替代确认层；保留既有锁定/未接入安全反馈和当前槽提示。
- 逐状态验收：1P/2P 地图、可用/锁定/未接入节点、直接进入、失败重试、胜利返回、退出和重载。
- 差异证据：证明 chooser 可见对象与交互均已移除，地图原资源、节点和菜单未被现代层替换。

验收标准：

- 修改前运行 `npm run check:structure`。
- 确定性测试覆盖 1P/2P、五角色、同角色双人、直接进关、锁定/未接入、retry、return、reload 和 DEV 隔离。
- 所有受影响关卡专项、`npm run test:systems`、`npm run build`、`npm run check:workflow`、`git diff --check` 与 940×590 端到端运行验收通过，console 无 warning/error。

禁止范围：

- 不逆向或实现 Stage 2-3，不修改关卡波次、Boss、机关、战斗数值或视觉资源。
- 不允许正式场景继续把临时 `playerCount` 当权威事实源。
- 不实现中途改变人数、换角色、联网或账号系统。

状态更新：

- 更新本线、正式主循环/地图覆盖台账、相关机制/切片、Goal/task/history 与适用 PG 反馈；关闭本线后恢复 `LINE-STAGE-2-3` / `GOAL-025`。

推荐后续任务：

- `TASK-SETTINGS-064`：恢复 Stage 2-3 六段逆向；怪物架构线继续保持 Planned，直到 Stage 2-3 功能线关闭或用户再次调整顺序。

### TASK-SETTINGS-064

任务类型：

- `TASK-SETTINGS`

功能条线：

- `LINE-STAGE-2-3`（Planned；等待重开的 `LINE-FORMAL-GAME-LOOP` 关闭）

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

# 游戏任务看板

本文只记录未完成游戏 task 的状态索引。完整系统范围和激活状态以 `docs/tasks/feature-lines.md` 为准；每个 task 的完整执行合同位于 `docs/tasks/task-definitions/TASK-*.md`。`/goal` 先检查 [`execution-queue.md`](execution-queue.md) 的治理执行项，队列无可执行项时才执行本表唯一 `Ready` 游戏 task。task 完成不等于功能条线完成。

## 当前推荐

`TASK-ARCH-203` 是唯一 Ready 游戏 task。202 已让正式 HUD 直接消费 201 的 35 fixture 逐状态头像真值，并删除身体 atlas/联合 bounds 替代；当前只建立已冻结设计的宠物战斗公共类 P1，完成后恢复 193E。

## 待完成任务

| Task | 状态 | 功能条线 | 类型 | 目标 | 目标机制/切片 | 输出 | 下一步 | 定义 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| TASK-ARCH-203 | Ready | LINE-PRE-STAGE-2-3-PRESENTATION | 宠物战斗公共类 P1 | 建立 PetCombatRuntime、PetBehavior、Registry、Targeting | M-032、M-034、M-042、VS-012、VS-067 | 四个类设计角色、生命周期合同测试、pet P1 gate=0 | TASK-SETTINGS-193E | [定义](task-definitions/TASK-ARCH-203.md) |
| TASK-SETTINGS-193E | Planned | LINE-PRE-STAGE-2-3-PRESENTATION | UFO 动画证据 | 冻结 ufo1..3 本体、魔破杀/瞬闪/狂魔闪空逐帧真值 | M-034、M-035、M-042、VS-067 | verified 动作/对象真值、原版基准、注册点/时序/行为矩阵 | TASK-SLICE-193F | [定义](task-definitions/TASK-SETTINGS-193E.md) |
| TASK-SLICE-193F | Planned | LINE-PRE-STAGE-2-3-PRESENTATION | UFO 真动画接入 | 直接消费 193E 真值替换 UFO 本体与技能占位 | M-034、M-035、M-042、VS-067 | UFO 真 atlas/对象、动作联动、P1/P2 正式回归 | TASK-SETTINGS-193G | [定义](task-definitions/TASK-SLICE-193F.md) |
| TASK-SETTINGS-193G | Planned | LINE-PRE-STAGE-2-3-PRESENTATION | 虎系动画证据 | 冻结 tigress1..4 本体、三技能与组合奥义逐帧真值 | M-034、M-035、M-042、VS-067 | verified 动作/对象真值、原版基准、注册点/时序/行为矩阵 | TASK-SLICE-193H | [定义](task-definitions/TASK-SETTINGS-193G.md) |
| TASK-SLICE-193H | Planned | LINE-PRE-STAGE-2-3-PRESENTATION | 虎系真动画接入 | 直接消费 193G 真值替换虎系本体与技能占位 | M-034、M-035、M-042、VS-067 | 虎系真 atlas/对象、动作联动、P1/P2 正式回归 | TASK-SETTINGS-193I | [定义](task-definitions/TASK-SLICE-193H.md) |
| TASK-SETTINGS-193I | Planned | LINE-PRE-STAGE-2-3-PRESENTATION | 玄龟动画证据 | 冻结 turtle1..4 本体、链接/范围/奥义与 20120808 owner | M-034、M-035、M-042、VS-067 | verified 动作/对象真值、原版基准、注册点/时序/行为矩阵 | TASK-SLICE-193J | [定义](task-definitions/TASK-SETTINGS-193I.md) |
| TASK-SLICE-193J | Planned | LINE-PRE-STAGE-2-3-PRESENTATION | 玄龟真动画接入 | 直接消费 193I 真值替换玄龟本体与技能占位 | M-034、M-035、M-042、VS-067 | 玄龟真 atlas/对象、动作联动、P1/P2 正式回归 | TASK-SETTINGS-193K | [定义](task-definitions/TASK-SLICE-193J.md) |
| TASK-SETTINGS-193K | Planned | LINE-PRE-STAGE-2-3-PRESENTATION | 凤凰动画证据 | 冻结 phoenix1..4 本体、涅槃/火鸟/地火/奥义逐帧真值 | M-034、M-035、M-042、VS-067 | verified 动作/对象真值、原版基准、注册点/时序/行为矩阵 | TASK-SLICE-193L | [定义](task-definitions/TASK-SETTINGS-193K.md) |
| TASK-SLICE-193L | Planned | LINE-PRE-STAGE-2-3-PRESENTATION | 凤凰真动画接入 | 直接消费 193K 真值替换凤凰本体与技能占位 | M-034、M-035、M-042、VS-067 | 凤凰真 atlas/对象、动作联动、P1/P2 正式回归 | TASK-SETTINGS-193M | [定义](task-definitions/TASK-SLICE-193L.md) |
| TASK-SETTINGS-193M | Planned | LINE-PRE-STAGE-2-3-PRESENTATION | 青龙动画证据 | 冻结 dragon1..4 本体、分身/冲锋/雷霆/奥义逐帧真值 | M-034、M-035、M-042、VS-067 | verified 动作/对象真值、原版基准、注册点/时序/行为矩阵 | TASK-SLICE-193N | [定义](task-definitions/TASK-SETTINGS-193M.md) |
| TASK-SLICE-193N | Planned | LINE-PRE-STAGE-2-3-PRESENTATION | 青龙真动画接入 | 直接消费 193M 真值替换青龙本体与技能占位 | M-034、M-035、M-042、VS-067 | 青龙真 atlas/对象、动作联动、P1/P2 正式回归 | TASK-SETTINGS-193O | [定义](task-definitions/TASK-SLICE-193N.md) |
| TASK-SETTINGS-193O | Planned | LINE-PRE-STAGE-2-3-PRESENTATION | 玉兔动画证据 | 冻结 rabbit1..4 本体、月光/疾风/冰霜/奥义逐帧真值 | M-034、M-035、M-042、VS-067 | verified 动作/对象真值、原版基准、注册点/时序/行为矩阵 | TASK-SLICE-193P | [定义](task-definitions/TASK-SETTINGS-193O.md) |
| TASK-SLICE-193P | Planned | LINE-PRE-STAGE-2-3-PRESENTATION | 玉兔真动画接入 | 直接消费 193O 真值替换玉兔本体与技能占位 | M-034、M-035、M-042、VS-067 | 玉兔真 atlas/对象、动作联动、P1/P2 正式回归 | TASK-SETTINGS-193Q | [定义](task-definitions/TASK-SLICE-193P.md) |
| TASK-SETTINGS-193Q | Planned | LINE-PRE-STAGE-2-3-PRESENTATION | 子鼠动画证据 | 冻结 mouse1..4 两套本体、鼠窜/飞镖/奥义逐帧真值 | M-034、M-035、M-042、VS-067 | verified 动作/对象真值、原版基准、注册点/时序/行为矩阵 | TASK-SLICE-193R | [定义](task-definitions/TASK-SETTINGS-193Q.md) |
| TASK-SLICE-193R | Planned | LINE-PRE-STAGE-2-3-PRESENTATION | 子鼠真动画接入 | 直接消费 193Q 真值替换子鼠本体与技能占位 | M-034、M-035、M-042、VS-067 | 子鼠真 atlas/对象、动作联动、P1/P2 正式回归 | TASK-SLICE-194 | [定义](task-definitions/TASK-SLICE-193R.md) |
| TASK-SLICE-194 | Planned | LINE-PRE-STAGE-2-3-PRESENTATION | 宠物真动画/UI 最终校准 | 在所有 193 生成子 task 完成后闭合跨物种、P1/P2、页面↔战斗↔存档旅程 | M-034、M-042、M-044、M-052、VS-067 | 宠物全 corpus 完整性、动作/行为绑定、正式旅程与零占位回填 | TASK-SETTINGS-195 | [定义](task-definitions/TASK-SLICE-194.md) |
| TASK-SETTINGS-195 | Planned | LINE-PRE-STAGE-2-3-PRESENTATION | 五角色动作完整性/流畅度审计 | 比较五角色原 SWF 与现代帧时序、持帧、转移、clock、解包/加载/投影完整性并确定根因 | M-018..M-025、M-035、M-047、VS-068 | 可重现跨角色差异矩阵、根因分类、每受影响角色修复子 task | 执行所有生成的单角色子 task，然后 TASK-SLICE-196 | [定义](task-definitions/TASK-SETTINGS-195.md) |
| TASK-SLICE-196 | Planned | LINE-PRE-STAGE-2-3-PRESENTATION | 五角色统一校准 | 统一复验五角色 UI/本体/普攻/技能动作流畅度与正式 Runtime 转移 | M-018..M-025、M-047、M-049、VS-068 | 五角色同标准自动对账、940×590 动作对照与无未解释卡顿 | TASK-SETTINGS-197 | [定义](task-definitions/TASK-SLICE-196.md) |
| TASK-SETTINGS-197 | Planned | LINE-PRE-STAGE-2-3-PRESENTATION | 战斗技能 HUD 逆向 | 闭合原版战斗技能栏显示列表、图标/键位/状态、P1/P2 几何和与技能绑定的可观察合同 | M-015、M-041、M-049、M-052、VS-069 | verified 战斗技能 HUD 真值、原版基准、状态/数据映射与 198/199 合同 | TASK-SLICE-198 | [定义](task-definitions/TASK-SETTINGS-197.md) |
| TASK-SLICE-198 | Planned | LINE-PRE-STAGE-2-3-PRESENTATION | 战斗技能 HUD 原生投影 | 在正式战斗 HUD 中可见显示五槽技能与原生状态 | M-015、M-041、M-049、M-052、VS-069 | manifest 直接消费、P1/P2 几何/图标/键位与逐状态差异 | TASK-SLICE-199 | [定义](task-definitions/TASK-SLICE-198.md) |
| TASK-SLICE-199 | Planned | LINE-PRE-STAGE-2-3-PRESENTATION | 战斗技能 HUD 运行联动 | 技能功能页绑定、战斗五槽、MP/冷却/可用性、P1/P2 与当前存档同源实时更新 | M-015、M-041、M-044、M-049、VS-069 | 页面↔HUD↔释放↔重载确定性与正式双人运行回归 | TASK-SLICE-200 | [定义](task-definitions/TASK-SLICE-199.md) |
| TASK-SLICE-200 | Planned | LINE-PRE-STAGE-2-3-PRESENTATION | Stage 2-3 前最终旅程 | 集中验证装备 hover、宠物 UI/动画、五角色流畅度和战斗技能 HUD 在正式冷启动/P1/P2/重载中一致 | M-036、M-042、M-044、M-047、M-049、M-052、VS-070 | 独立自动旅程、940×590 人工验收、整线关闭与 Stage 2-3 恢复 | 关闭本线并恢复 TASK-SETTINGS-064 | [定义](task-definitions/TASK-SLICE-200.md) |
| TASK-SETTINGS-064 | Planned | LINE-STAGE-2-3 | 关卡/玩法逆向 | 闭合 Stage 2-3 真场景、流程、怪物/机关、结果与存档六段证据 | M-026、M-027、M-030、M-035、M-044、VS-057 | 权威证据矩阵、资源标注、未知/反证与有界实现 task | 依据闭合证据生成同线最小实现或补证 task | [定义](task-definitions/TASK-SETTINGS-064.md) |
| TASK-ARCH-010A | Planned | LINE-MONSTER-ARCH | 现代怪物架构 | 建立组合式怪物定义、运行状态、Targeting/Brain 接缝并抽离关卡命名的通用 owner | M-030、VS-005、VS-006 | 通用合同、定义目录、策略入口、兼容 facade 与确定性回归 | TASK-ARCH-010B | [定义](task-definitions/TASK-ARCH-010A.md) |
| TASK-ARCH-010B | Planned | LINE-MONSTER-ARCH | 怪物定义/行为集成 | 将 DefinitionCatalog、Brain 与 Targeting 接入 PG-013 已建立的唯一怪物注册表，并在普通怪+Boss 关卡验证 | M-030、VS-007、VS-056 | 既有 Registry 的定义/Brain 接缝、兼容回归与后续策略迁移清单 | 依据试点生成同线策略迁移 task | [定义](task-definitions/TASK-ARCH-010B.md) |
| TASK-ARCH-010C | Planned | LINE-MONSTER-ARCH | 正式怪物奖励/掉落闭合 | 让正式 reward bridge 消费配置物品/掉落 profile，补齐 Monster4/5/6 已证掉落与缺表防御 | M-030、VS-005、VS-007、VS-056 | reward/loot profile、正式五关掉落矩阵、容量/幂等/P1/P2 回归 | 依据试点生成同线策略迁移 task | [定义](task-definitions/TASK-ARCH-010C.md) |
| TASK-ARCH-014 | Split | LINE-SHARED-UI-COMPONENTS | 共享 UI 组件化父任务 | 分组件族审计、建立、试点并迁移灵魂余额、原生按钮/关闭和背包/物品展示 | M-035、M-037、M-052、VS-059、VS-064 | TASK-ARCH-014A..F 的独立合同、实现、迁移与回归结果 | 全部子 task 完成后收束父任务与 PG-011 | [定义](task-definitions/TASK-ARCH-014.md) |
| TASK-ARCH-014A | Planned | LINE-SHARED-UI-COMPONENTS | 共享 UI 组件化审计 | 冻结组件分层、消费者迁移矩阵、页面保留项、资源 provenance 与防复发门禁 | M-035、M-037、M-052、VS-059、VS-064 | 组件目录、owner/消费者矩阵、ADR/边界文档与静态校验 | TASK-ARCH-014B | [定义](task-definitions/TASK-ARCH-014A.md) |
| TASK-ARCH-014B | Planned | LINE-SHARED-UI-COMPONENTS | 灵魂余额组件化 | 收敛共享 SoulBalance 组件并迁移全部已知灵魂消费页面 | M-035、M-044、M-052、VS-059 | 唯一视图投影、透明资产/字形门禁、P1/P2 与跨页面回归 | TASK-ARCH-014C | [定义](task-definitions/TASK-ARCH-014B.md) |
| TASK-ARCH-014C | Planned | LINE-SHARED-UI-COMPONENTS | 原生按钮/关闭组件化 | 共享按钮状态、命中和关闭生命周期，同时保留页面原生皮肤与几何 | M-035、M-052、VS-059 | 组件合同、代表性 overlay/整页试点、Escape/销毁回归 | TASK-ARCH-014D | [定义](task-definitions/TASK-ARCH-014C.md) |
| TASK-ARCH-014D | Planned | LINE-SHARED-UI-COMPONENTS | 背包基础组件化 | 建立 item cell/grid/分页/selected/tooltip 的无页面业务基础组件 | M-035、M-037、M-052、VS-064 | 背包视图基础组件、只读 view-model 接缝与确定性测试 | TASK-ARCH-014E | [定义](task-definitions/TASK-ARCH-014D.md) |
| TASK-ARCH-014E | Planned | LINE-SHARED-UI-COMPONENTS | 正式背包组件迁移 | 以正式背包页试点基础组件，保持 431 身份、真图标、双 owner 与 V6 行为 | M-035、M-037、M-044、M-052、VS-064 | 正式背包迁移、逐状态视觉证据与全量目录/事务回归 | TASK-ARCH-014F | [定义](task-definitions/TASK-ARCH-014E.md) |
| TASK-ARCH-014F | Planned | LINE-SHARED-UI-COMPONENTS | 嵌入式物品组件迁移 | 按矩阵迁移炼丹炉、商城、任务奖励等消费者并闭合跨页面回归 | M-035、M-037、M-044、M-046、M-052、VS-059、VS-064 | 消费者迁移结果、静态防回填、正式旅程与 PG-011 关闭审计 | 收束 TASK-ARCH-014 与 LINE-SHARED-UI-COMPONENTS | [定义](task-definitions/TASK-ARCH-014F.md) |
| TASK-ARCH-177A | Planned | LINE-RELEASE-RUNTIME-LOAD | 发布载荷审计 | 复测首屏/场景/目录体积，冻结动态 import、vendor chunk、瘦目录和预算合同 | M-035、VS-000 | 生产基线、依赖图、预算、177B 精确消费者清单 | TASK-ARCH-177B | [定义](task-definitions/TASK-ARCH-177A.md) |
| TASK-ARCH-177B | Planned | LINE-RELEASE-RUNTIME-LOAD | 发布载荷实现 | 延迟加载非首屏场景，拆 vendor，生成并校验运行时瘦目录 | M-035、VS-000 | 场景/vendor/目录 chunks、生成器门禁、预算与正式路由回归 | 满足预算后关闭本线 | [定义](task-definitions/TASK-ARCH-177B.md) |

# 游戏任务看板

本文只记录未完成游戏 task 的状态索引。完整系统范围和激活状态以 `docs/tasks/feature-lines.md` 为准；每个 task 的完整执行合同位于 `docs/tasks/task-definitions/TASK-*.md`。`/goal` 先检查 [`execution-queue.md`](execution-queue.md) 的治理执行项，队列无可执行项时才执行本表唯一 `Ready` 游戏 task。task 完成不等于功能条线完成。

## 当前推荐

`TASK-SLICE-190B1` 是唯一 Ready 游戏 task；190A 已在正式背包闭合共享 tooltip 的真值、实例数值、P1/P2 和刷新生命周期，本 task 只迁移强化页及其共享右侧 grid。

## 待完成任务

| Task | 状态 | 功能条线 | 类型 | 目标 | 目标机制/切片 | 输出 | 下一步 | 定义 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| TASK-SLICE-190B | Split | LINE-PRE-STAGE-2-3-PRESENTATION | 嵌入式装备 hover 父任务 | 汇总 189 确认的工坊消费者迁移；父任务不直接实现 | M-036、M-037、M-052、VS-066 | 190B1..B4 的独立页面合同、实现与回归结果 | 全部子 task 完成后收束父任务 | [定义](task-definitions/TASK-SLICE-190B.md) |
| TASK-SLICE-190B1 | Ready | LINE-PRE-STAGE-2-3-PRESENTATION | 强化页装备 hover | 在强化页复用同一实例 owner 与原版 tooltip 生命周期 | M-036、M-037、M-052、VS-066 | 强化页原生投影、选择/提交/刷新/移出回归 | TASK-SLICE-190B2 | [定义](task-definitions/TASK-SLICE-190B1.md) |
| TASK-SLICE-190B2 | Planned | LINE-PRE-STAGE-2-3-PRESENTATION | 合成页装备 hover | 在合成页复用同一实例 owner 与原版 tooltip 生命周期 | M-036、M-037、M-052、VS-066 | 合成页原生投影、选择/提交/刷新/移出回归 | TASK-SLICE-190B3 | [定义](task-definitions/TASK-SLICE-190B2.md) |
| TASK-SLICE-190B3 | Planned | LINE-PRE-STAGE-2-3-PRESENTATION | 分解页装备 hover | 在分解页复用同一实例 owner 与原版 tooltip 生命周期 | M-036、M-037、M-052、VS-066 | 分解页原生投影、选择/提交/刷新/移出回归 | TASK-SLICE-190B4 | [定义](task-definitions/TASK-SLICE-190B3.md) |
| TASK-SLICE-190B4 | Planned | LINE-PRE-STAGE-2-3-PRESENTATION | 打造页装备 hover | 在打造页复用同一实例 owner，并关闭商城时装禁用 hover 的负向回归 | M-036、M-037、M-052、VS-066 | 打造页原生投影、刷新/移出回归与商城负向门禁 | TASK-SETTINGS-191 | [定义](task-definitions/TASK-SLICE-190B4.md) |
| TASK-SETTINGS-191 | Planned | LINE-PRE-STAGE-2-3-PRESENTATION | 宠物 UI 可见性逆向 | 定位正式路径“无宠物 UI”是入口、宿主、层级、bundle、绘制还是真值消费缺口，并闭合战斗宠物 HUD 证据 | M-016、M-035、M-042、M-052、VS-067 | 页面/战斗 UI 显示列表、verified 真值/基准、正式路由根因与 192A/B 合同 | TASK-SLICE-192A | [定义](task-definitions/TASK-SETTINGS-191.md) |
| TASK-SLICE-192A | Planned | LINE-PRE-STAGE-2-3-PRESENTATION | 宠物页/入口 UI | 修复正式关卡 P1/P2 宠物入口与页面可见/交互链 | M-016、M-042、M-052、VS-067 | 正式宠物页原生投影、owner/存档回归与零遮挡差异 | TASK-SLICE-192B | [定义](task-definitions/TASK-SLICE-192A.md) |
| TASK-SLICE-192B | Planned | LINE-PRE-STAGE-2-3-PRESENTATION | 宠物战斗 UI | 直接投影当前 pet runtime owner 的原生战斗可见对象/HUD | M-042、M-049、M-052、VS-067 | P1/P2 独立宠物状态、技能/休息/死亡更新和逐状态差异 | TASK-SETTINGS-193 | [定义](task-definitions/TASK-SLICE-192B.md) |
| TASK-SETTINGS-193 | Planned | LINE-PRE-STAGE-2-3-PRESENTATION | 宠物动画 corpus 分区 | 盘点九物种/形态/动作/技能对象的恢复源 owner，冻结分族证据与实现批次 | M-034、M-035、M-042、VS-067 | corpus 目录、缺失/占位矩阵、每资源族证据+ 实现子 task | 执行所有生成的宠物资源族子 task，然后 TASK-SLICE-194 | [定义](task-definitions/TASK-SETTINGS-193.md) |
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

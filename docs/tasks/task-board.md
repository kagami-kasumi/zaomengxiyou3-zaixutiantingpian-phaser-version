# 游戏任务看板

本文只记录未完成游戏 task 的状态索引。完整系统范围和激活状态以 `docs/tasks/feature-lines.md` 为准；每个 task 的完整执行合同位于 `docs/tasks/task-definitions/TASK-*.md`。`/goal` 先检查 [`execution-queue.md`](execution-queue.md) 的治理执行项，队列无可执行项时才执行本表唯一 `Ready` 游戏 task。task 完成不等于功能条线完成。

## 当前推荐

`TASK-SLICE-188` 是唯一 Ready 游戏 task；建档/选角已直接消费 175I 真值并删除手写视觉源，当前线最后一个已知 UI 真值缺口为丹药页 manifest 直连。

## 待完成任务

| Task | 状态 | 功能条线 | 类型 | 目标 | 目标机制/切片 | 输出 | 下一步 | 定义 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| TASK-SLICE-188 | Ready | LINE-CORE-PROGRESSION-COMPLETION | 丹药页 manifest 直连 | 直接消费 175E verified 真值，删除 `ImmortalityScene` 手写视觉真值源 | M-035、M-044、M-052、VS-059 | 990/969/1006 投影、26 状态视觉/owner/事务/重载回归 | 完成后审查并按合同关闭当前功能线 | [定义](task-definitions/TASK-SLICE-188.md) |
| TASK-SETTINGS-064 | Planned | LINE-STAGE-2-3 | 关卡/玩法逆向 | 闭合 Stage 2-3 真场景、流程、怪物/机关、结果与存档六段证据 | M-026、M-027、M-030、M-035、M-044、VS-057 | 权威证据矩阵、资源标注、未知/反证与有界实现 task | 待当前成长/UI 完成线关闭后恢复 | [定义](task-definitions/TASK-SETTINGS-064.md) |
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

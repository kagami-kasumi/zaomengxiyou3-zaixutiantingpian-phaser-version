# 游戏任务看板

本文只记录未完成游戏 task 的状态索引。完整系统范围和激活状态以 `docs/tasks/feature-lines.md` 为准；每个 task 的完整执行合同位于 `docs/tasks/task-definitions/TASK-*.md`。`/goal` 直接执行唯一 `Ready` task，不再维护独立 Goal 实体。task 完成不等于功能条线完成。

## 当前推荐

`TASK-SLICE-157D` 是唯一当前推荐，属于唯一 Active 功能线。Stage 1 三关全部实际怪物与攻击对象已接入真视觉，当前只做五关资源 owner、Stage 2 防回归和父任务关闭验收。

## 待完成任务

| Task | 状态 | 功能条线 | 类型 | 目标 | 目标机制/切片 | 输出 | 下一步 | 定义 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| TASK-SETTINGS-069 | Planned | LINE-PRE-STAGE-2-3-COMPLETION | 角色/技能视觉逆向 | 盘清五角色本体、战斗 UI、普攻、技能与附属对象真动画缺口 | M-018..M-025、M-034、M-035、M-047、M-049、VS-062 | 逐角色逐技能全集矩阵、资源标注与逐角色实现 task | 拆分 TASK-SLICE-158 | [定义](task-definitions/TASK-SETTINGS-069.md) |
| TASK-SLICE-157 | Split | LINE-PRE-STAGE-2-3-COMPLETION | 既有关卡怪物动画父任务 | Stage 1-1/1-2/1-3 逐关接入全部怪物/攻击对象真动画，回归 Stage 2-1/2-2 | M-030、M-034、M-035、VS-061 | 由 TASK-SETTINGS-068 生成的逐关子 task | 全部子 task 完成后收束父任务 | [定义](task-definitions/TASK-SLICE-157.md) |
| TASK-SLICE-157D | Ready | LINE-PRE-STAGE-2-3-COMPLETION | 五关怪物视觉回归 | 收敛五关资源 owner，回归 Stage 2-1/2-2 并关闭父任务 | M-030、M-034、M-035、VS-061 | 五关自动/运行证据、bundle 防回归与父任务归档 | TASK-SETTINGS-069 | [定义](task-definitions/TASK-SLICE-157D.md) |
| TASK-ARCH-016 | Split | LINE-PRE-STAGE-2-3-COMPLETION | 通用可玩关卡框架父任务 | 将五关共同运行职责收敛到组合式框架，关卡只声明定义、遭遇和窄差异 | M-014、M-026、M-027、M-029、M-035、M-044、VS-065、PG-013 | `016A..D` 的合同、试点、逐批迁移、门禁与未来关卡模板 | 全部子 task 完成后收束父任务并将 PG-013 转效果观察 | [定义](task-definitions/TASK-ARCH-016.md) |
| TASK-ARCH-016A | Planned | LINE-PRE-STAGE-2-3-COMPLETION | 关卡框架审计与合同 | 冻结五关共性/差异、owner、公共 Runtime/Definition/Encounter/adapter 合同和迁移矩阵 | M-014、M-026、M-027、M-029、VS-065、PG-013 | ADR/边界、消费者矩阵、门视觉定义合同、静态门禁与分批迁移计划 | TASK-ARCH-016B | [定义](task-definitions/TASK-ARCH-016A.md) |
| TASK-ARCH-016B | Planned | LINE-PRE-STAGE-2-3-COMPLETION | 公共框架横向试点 | 建立公共 Runtime 与 TransferDoorView，并迁移 Stage 1-2/1-3 | M-014、M-026、M-027、M-029、M-035、M-044、VS-065、PG-013 | 公共运行骨架、门视觉定义/组件、双关迁移、兼容 adapter 与逐状态证据 | TASK-ARCH-016C | [定义](task-definitions/TASK-ARCH-016B.md) |
| TASK-ARCH-016C | Planned | LINE-PRE-STAGE-2-3-COMPLETION | Stage 2 框架迁移 | 将 Stage 2-1/2-2 接入公共 Runtime，保留冰刺/火焰/Boss 与特殊差异 | M-014、M-026、M-027、M-029、M-035、M-044、VS-065、PG-013 | Stage 2 定义/遭遇/窄 adapter、门/结果/保存回归和重复 owner 删除 | TASK-ARCH-016D | [定义](task-definitions/TASK-ARCH-016C.md) |
| TASK-ARCH-016D | Planned | LINE-PRE-STAGE-2-3-COMPLETION | Stage 1-1 与框架闭合 | 将 Stage 1-1 从 TestScene 私有骨架迁入公共 Runtime，完成五关门禁和未来关卡模板 | M-014、M-026、M-028、M-029、M-035、M-044、VS-007、VS-050、VS-065、PG-013 | 1-1 定义/遭遇/真门视觉、五关回归、未来模板与 PG-013 观察入口 | TASK-SETTINGS-069 | [定义](task-definitions/TASK-ARCH-016D.md) |
| TASK-SLICE-158 | Split | LINE-PRE-STAGE-2-3-COMPLETION | 五角色动画父任务 | 逐角色接入本体、战斗 UI、普攻、技能及附属对象真动画 | M-018..M-025、M-034、M-035、M-047、M-049、VS-062 | 由 TASK-SETTINGS-069 生成的逐角色子 task | 全部子 task 完成后收束父任务 | [定义](task-definitions/TASK-SLICE-158.md) |
| TASK-SLICE-159 | Planned | LINE-PRE-STAGE-2-3-COMPLETION | 本地存档正式旅程 | 复用既有六槽 localStorage/V6，验证所有新增功能跨重启持久化并关闭前置线 | M-044、M-050、VS-052、VS-063 | 自动旅程、940×590 重启读取证据与关闭检查 | 恢复 TASK-SETTINGS-064 | [定义](task-definitions/TASK-SLICE-159.md) |
| TASK-SETTINGS-064 | Planned | LINE-STAGE-2-3 | 关卡/玩法逆向 | 闭合 Stage 2-3 真场景、流程、怪物/机关、结果与存档六段证据 | M-026、M-027、M-030、M-035、M-044、VS-057 | 权威证据矩阵、资源标注、未知/反证与有界实现 task | 依据证据生成同线最小实现 task | [定义](task-definitions/TASK-SETTINGS-064.md) |
| TASK-ARCH-010A | Planned | LINE-MONSTER-ARCH | 现代怪物架构 | 建立组合式怪物定义、运行状态、Targeting/Brain 接缝并抽离关卡命名的通用 owner | M-030、VS-005、VS-006 | 通用合同、定义目录、策略入口、兼容 facade 与确定性回归 | TASK-ARCH-010B | [定义](task-definitions/TASK-ARCH-010A.md) |
| TASK-ARCH-010B | Planned | LINE-MONSTER-ARCH | 怪物生命周期治理 | 建立唯一怪物运行时注册表并在普通怪+Boss 正式关卡试点 | M-030、VS-007、VS-056 | 注册表、Flow/bridge 所有权收敛、试点关卡回归与后续迁移清单 | 依据试点生成同线逐关卡迁移 task | [定义](task-definitions/TASK-ARCH-010B.md) |
| TASK-ARCH-014 | Split | LINE-SHARED-UI-COMPONENTS | 共享 UI 组件化父任务 | 分组件族审计、建立、试点并迁移灵魂余额、原生按钮/关闭和背包/物品展示 | M-035、M-037、M-052、VS-059、VS-064 | TASK-ARCH-014A..F 的独立合同、实现、迁移与回归结果 | 全部子 task 完成后收束父任务与 PG-011 | [定义](task-definitions/TASK-ARCH-014.md) |
| TASK-ARCH-014A | Planned | LINE-SHARED-UI-COMPONENTS | 共享 UI 组件化审计 | 冻结组件分层、消费者迁移矩阵、页面保留项、资源 provenance 与防复发门禁 | M-035、M-037、M-052、VS-059、VS-064 | 组件目录、owner/消费者矩阵、ADR/边界文档与静态校验 | TASK-ARCH-014B | [定义](task-definitions/TASK-ARCH-014A.md) |
| TASK-ARCH-014B | Planned | LINE-SHARED-UI-COMPONENTS | 灵魂余额组件化 | 收敛共享 SoulBalance 组件并迁移全部已知灵魂消费页面 | M-035、M-044、M-052、VS-059 | 唯一视图投影、透明资产/字形门禁、P1/P2 与跨页面回归 | TASK-ARCH-014C | [定义](task-definitions/TASK-ARCH-014B.md) |
| TASK-ARCH-014C | Planned | LINE-SHARED-UI-COMPONENTS | 原生按钮/关闭组件化 | 共享按钮状态、命中和关闭生命周期，同时保留页面原生皮肤与几何 | M-035、M-052、VS-059 | 组件合同、代表性 overlay/整页试点、Escape/销毁回归 | TASK-ARCH-014D | [定义](task-definitions/TASK-ARCH-014C.md) |
| TASK-ARCH-014D | Planned | LINE-SHARED-UI-COMPONENTS | 背包基础组件化 | 建立 item cell/grid/分页/selected/tooltip 的无页面业务基础组件 | M-035、M-037、M-052、VS-064 | 背包视图基础组件、只读 view-model 接缝与确定性测试 | TASK-ARCH-014E | [定义](task-definitions/TASK-ARCH-014D.md) |
| TASK-ARCH-014E | Planned | LINE-SHARED-UI-COMPONENTS | 正式背包组件迁移 | 以正式背包页试点基础组件，保持 431 身份、真图标、双 owner 与 V6 行为 | M-035、M-037、M-044、M-052、VS-064 | 正式背包迁移、逐状态视觉证据与全量目录/事务回归 | TASK-ARCH-014F | [定义](task-definitions/TASK-ARCH-014E.md) |
| TASK-ARCH-014F | Planned | LINE-SHARED-UI-COMPONENTS | 嵌入式物品组件迁移 | 按矩阵迁移炼丹炉、商城、任务奖励等消费者并闭合跨页面回归 | M-035、M-037、M-044、M-046、M-052、VS-059、VS-064 | 消费者迁移结果、静态防回填、正式旅程与 PG-011 关闭审计 | 收束 TASK-ARCH-014 与 LINE-SHARED-UI-COMPONENTS | [定义](task-definitions/TASK-ARCH-014F.md) |

# 游戏任务看板

本文只记录未完成游戏 task 的状态索引。完整系统范围和激活状态以 `docs/tasks/feature-lines.md` 为准；每个 task 的完整执行合同位于 `docs/tasks/task-definitions/TASK-*.md`。`/goal` 直接执行唯一 `Ready` task，不再维护独立 Goal 实体。task 完成不等于功能条线完成。

## 当前推荐

`TASK-SLICE-158B` 是唯一当前推荐，属于唯一 Active 功能线；下一步接入唐僧本体、战斗 UI、普攻、技能、Shadow 与附属对象真动画。

## 待完成任务

| Task | 状态 | 功能条线 | 类型 | 目标 | 目标机制/切片 | 输出 | 下一步 | 定义 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| TASK-SETTINGS-069 | Split | LINE-PRE-STAGE-2-3-COMPLETION | 角色/技能视觉逆向父任务 | 盘清五角色本体、战斗 UI、普攻、技能与附属对象真动画缺口 | M-018..M-025、M-034、M-035、M-047、M-049、VS-062 | 共享矩阵、显示列表门禁与 `069A..E` / `158A..E` 合同 | 全部子 task 完成后收束父任务 | [定义](task-definitions/TASK-SETTINGS-069.md) |
| TASK-SLICE-158B | Ready | LINE-PRE-STAGE-2-3-COMPLETION | Role2 真动画 | 接入唐僧本体、战斗 UI、普攻、全部已实现技能、Shadow 与附属对象真动画 | M-019、M-023..M-025、M-034、M-035、M-047、M-049、VS-062 | Role2 真资源、逐状态与差异证据 | TASK-SETTINGS-069C | [定义](task-definitions/TASK-SLICE-158B.md) |
| TASK-SETTINGS-069C | Planned | LINE-PRE-STAGE-2-3-COMPLETION | Role3 视觉逆向 | 闭合八戒本体、战斗 UI、普攻、技能与附属对象证据 | M-020、M-023..M-025、M-034、M-035、M-047、M-049、VS-062 | Role3 全集矩阵、显示列表、标注与实现输入 | TASK-SLICE-158C | [定义](task-definitions/TASK-SETTINGS-069C.md) |
| TASK-SLICE-158C | Planned | LINE-PRE-STAGE-2-3-COMPLETION | Role3 真动画 | 接入八戒本体、战斗 UI、普攻、全部已实现技能与附属对象真动画 | M-020、M-023..M-025、M-034、M-035、M-047、M-049、VS-062 | Role3 真资源、逐状态与差异证据 | TASK-SETTINGS-069D | [定义](task-definitions/TASK-SLICE-158C.md) |
| TASK-SETTINGS-069D | Planned | LINE-PRE-STAGE-2-3-COMPLETION | Role4 视觉逆向 | 闭合沙僧铲/弓双形态本体、UI、普攻、技能与附属对象证据 | M-021、M-023..M-025、M-034、M-035、M-047、M-049、VS-062 | Role4 全集矩阵、显示列表、标注与实现输入 | TASK-SLICE-158D | [定义](task-definitions/TASK-SETTINGS-069D.md) |
| TASK-SLICE-158D | Planned | LINE-PRE-STAGE-2-3-COMPLETION | Role4 真动画 | 接入沙僧铲/弓双形态本体、UI、普攻、技能与附属对象真动画 | M-021、M-023..M-025、M-034、M-035、M-047、M-049、VS-062 | Role4 真资源、逐状态与差异证据 | TASK-SETTINGS-069E | [定义](task-definitions/TASK-SLICE-158D.md) |
| TASK-SETTINGS-069E | Planned | LINE-PRE-STAGE-2-3-COMPLETION | Role5 视觉逆向 | 闭合白龙枪/剑双形态本体、UI、普攻、技能与附属对象证据 | M-022..M-025、M-034、M-035、M-047、M-049、VS-062 | Role5 全集矩阵、显示列表、标注与实现输入 | TASK-SLICE-158E | [定义](task-definitions/TASK-SETTINGS-069E.md) |
| TASK-SLICE-158E | Planned | LINE-PRE-STAGE-2-3-COMPLETION | Role5 真动画 | 接入白龙枪/剑双形态本体、UI、普攻、技能与附属对象真动画 | M-022..M-025、M-034、M-035、M-047、M-049、VS-062 | Role5 真资源、逐状态、差异证据与父任务收束 | TASK-SLICE-159 | [定义](task-definitions/TASK-SLICE-158E.md) |
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

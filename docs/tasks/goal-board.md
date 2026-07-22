# Goal 包看板

本文是一次 `/goal` 的执行边界和交接状态权威入口。功能条线范围和状态以 `docs/tasks/feature-lines.md` 为准；功能条线 `LINE-*` 仍持有完整系统范围和单线 WIP；Goal 包 `GOAL-*` 把该条线切成可在一次 `/goal` 内完成并交接的有界执行单元；task 仍是最小验收单元。

## 调度硬规则

- 存在未完成功能线时，必须且只能有一个 `Active` Goal，且必须属于唯一 `Active` 功能线。
- 一次 `/goal` 只承诺完成当前 `Active` Goal；Goal 完成后必须停止并交接，不在同一次 `/goal` 中隐式续跑下一 Goal。
- Goal 默认只绑定一个 task。只有两个 task 共用同一产物、同一验证批次，且单独交接反而会丢失语义时，才可在 Goal 定义中说明理由后绑定最多两个 task。
- Goal 的规模预算为最多一次上下文压缩。第一次 compact 后只允许完成当前 task 的实现、验证和文档收尾，不再扩展范围或进入下一 task。如果估计还需第二次 compact，必须在安全检查点停止，回写剩余工作并拆分 Goal。
- Goal 不得同时跨越大量 AS3/资源逆向与完整玩法实现。需读取新资料族、切换明显不同子系统，或具有独立验收边界时，必须拆成下一 Goal。
- Goal 完成只表示一次交接包关闭，不代表功能线完成。下一 Goal 仍须属于当前功能线，直到功能线关闭。

## 状态定义

- `Active`：下一次 `/goal` 唯一可执行的 Goal 包。
- `Planned`：同线后续 Goal，或尚未激活功能线的候选 Goal。
- `Blocked`：Goal 本身有需要用户权限、材料或裁决才能解除的阻塞；不得因此执行其他功能线。
- `Done`：Goal 完成后的历史状态。本看板保留简短记录，详细 task 产物仍归档到 `task-history.md`。

## Goal 总览

| Goal | 状态 | 功能条线 | 绑定 task | 交付边界 | 压缩预算 | 下一 Goal |
| --- | --- | --- | --- | --- | --- | --- |
| GOAL-001 | Done | LINE-FORMAL-GAME-LOOP | TASK-SLICE-138A | 工坊容器、四标签、Fusion 迁入与双 owner 切页/关闭返还 | 最多 1 次 | `GOAL-002` |
| GOAL-002 | Done | LINE-FORMAL-GAME-LOOP | TASK-SLICE-138B | 装备实例 schema/V4 迁移与强化事务 | 最多 1 次 | `GOAL-003` |
| GOAL-003 | Done | LINE-FORMAL-GAME-LOOP | TASK-SLICE-138C | 分解事务、可注入随机与双 owner 库存一致性 | 最多 1 次 | `GOAL-004` |
| GOAL-004 | Active | LINE-FORMAL-GAME-LOOP | TASK-SLICE-138D | 78 本可达制作书、可选宝石与产物实例持久化 | 最多 1 次 | `GOAL-005` |
| GOAL-005 | Planned | LINE-FORMAL-GAME-LOOP | TASK-SLICE-139 | 法宝真页面、装备门禁、强化/重置和保存 | 最多 1 次 | `GOAL-006` |
| GOAL-006 | Planned | LINE-FORMAL-GAME-LOOP | TASK-SLICE-140 | 完整功能 UI 与正式主循环端到端验收 | 最多 1 次 | 关闭本线后激活 `GOAL-007` |
| GOAL-007 | Planned | LINE-STAGE-2-1 | TASK-SETTINGS-053 | Stage 2-1 六段逆向证据与实现任务输入 | 最多 1 次 | 依据逆向结果生成同线 Goal |

## 当前 Goal 完成定义

`GOAL-004` 仅包含 `TASK-SLICE-138D`。完成条件是 78 本可达制作书 registry、必需材料/灵魂/三可选宝石事务、随机实例属性覆写、V4 round-trip、双 owner 一致性、自动验证、必要运行验收和状态文档全部收尾。完成后将 `GOAL-004` 标为 `Done`、`GOAL-005` 标为 `Active`，然后结束当次 `/goal` 并向用户交接；不直接执行 `TASK-SLICE-139`。

## Goal 生成检查

新建或拆分 Goal 时必须确认：

1. 有一个可独立描述、验证和交接的产物边界。
2. 默认只绑定一个 task，且 task 不同时要求新资料族逆向、大范围实现和端到端验收。
3. 预计在零次或一次 compact 后可完成；无法合理估计时宁可先拆小。
4. 输出中包含当前状态、验证、剩余风险和下一 Goal，使新对话无需依赖多次 compact 摘要。

# Goal 包看板

本文是一次 `/goal` 的执行边界和交接状态权威入口。功能条线范围和状态以 `docs/tasks/feature-lines.md` 为准；功能条线 `LINE-*` 仍持有完整系统范围和单线 WIP；Goal 包 `GOAL-*` 把该条线切成可在一次 `/goal` 内完成并交接的有界执行单元；task 仍是最小验收单元。

## 调度硬规则

- 存在未完成功能线时，必须且只能有一个 `Active` Goal，且必须属于唯一 `Active` 功能线。
- 一次 `/goal` 只承诺完成当前 `Active` Goal；Goal 完成后必须停止并交接，不在同一次 `/goal` 中隐式续跑下一 Goal。
- Goal 默认只绑定一个 task。只有两个 task 共用同一产物、同一验证批次，且单独交接反而会丢失语义时，才可在 Goal 定义中说明理由后绑定最多两个 task。
- 新 Goal 默认预计 0 次上下文压缩。执行前必须做规模预检，核对 task 声明的主工作包、独立验收批次和拆分触发；超限时先拆分，不开始实质执行。
- 第一次 compact 即视为规模超限：只允许结束正在运行的检查、回写安全检查点并拆分剩余工作，不再读取新资料族、派生新资源或新增实现。
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
| GOAL-004 | Done | LINE-FORMAL-GAME-LOOP | TASK-SLICE-138D | 78 本可达制作书、可选宝石与产物实例持久化 | 最多 1 次 | `GOAL-005` |
| GOAL-005 | Done | LINE-FORMAL-GAME-LOOP | TASK-SLICE-139 | 法宝真页面、装备门禁、强化/重置和保存 | 最多 1 次 | `GOAL-006` |
| GOAL-006 | Done | LINE-FORMAL-GAME-LOOP | TASK-SETTINGS-060 | 闭合炼丹炉四个原生中文页签按钮的时间轴、几何、命中区与状态证据 | 最多 1 次 | `GOAL-007` |
| GOAL-007 | Done | LINE-FORMAL-GAME-LOOP | TASK-SLICE-141 | 移除炼丹炉现代覆盖导航，按原生位置和原生按钮接回四页交互 | 最多 1 次 | `GOAL-008` |
| GOAL-008 | Done | LINE-FORMAL-GAME-LOOP | TASK-SLICE-140 | 完整功能 UI 与正式主循环端到端验收 | 最多 1 次 | `GOAL-009` |
| GOAL-009 | Done | LINE-STAGE-2-1 | TASK-SETTINGS-053 | Stage 2-1 六段逆向证据与实现任务输入 | 最多 1 次 | `GOAL-013` |
| GOAL-010 | Done | LINE-FORMAL-GAME-LOOP | TASK-SLICE-142 | 工坊原图按钮、左框居中、原生返回与 P1/P2 样式整改 | 最多 1 次 | `GOAL-009` |
| GOAL-011 | Done | LINE-UI-NATIVE-SKILLS | TASK-SETTINGS-061 | 技能四页原生文字、按钮状态、命中区与动态槽位六段证据 | 最多 1 次 | `GOAL-012` |
| GOAL-012 | Done | LINE-UI-NATIVE-SKILLS | TASK-SLICE-143 | 技能总页、主动页、绑定页、被动页 UI 原生化实现与正式流程验收 | 最多 1 次 | 本线已关闭；等待用户调度下一功能线 |
| GOAL-013 | Done | LINE-STAGE-2-1 | TASK-SLICE-144 | Stage 2-1 真场景、五停点 53 怪、38 冰刺、Boss 门与 2-2 保存可玩闭环 | 最多 1 次 | `GOAL-014` |
| GOAL-014 | Done | LINE-STAGE-2-1 | TASK-SLICE-145 | 940×590 1P/2P 运行校准、用户复验与怪物视觉范围/功能线关闭裁决 | 最多 1 次 | `GOAL-015` |
| GOAL-015 | Done | LINE-STAGE-2-1 | TASK-SETTINGS-062 | Monster6/9/10/19 动作、弹体与命中特效真视觉六段证据 | 最多 1 次 | `GOAL-016` |
| GOAL-016 | Done | LINE-STAGE-2-1 | TASK-SLICE-146 | 接入四怪本体/七攻击对象真视觉并完成 940×590 逐状态复验 | 最多 1 次 | 已关闭 `LINE-STAGE-2-1`；下一线 `GOAL-011` |
| GOAL-017 | Done | LINE-STAGE-1-1 | TASK-SLICE-147 | 修复末段镜头、W/↑ 通关结果、遗留调试怪和返回地图后节点失效四项回归 | 最多 1 次 | 已恢复 `GOAL-011` |
| GOAL-018 | Done | LINE-STAGE-1-1 | TASK-SLICE-148 | 复用原版普通门并改为最高层立即触发 Boss | 最多 1 次 | 已恢复 `GOAL-011` |
| GOAL-019 | Done | LINE-STAGE-1-1 | TASK-SLICE-149 | 按原生关卡重做最高层 Boss 镜头构图 | 最多 1 次 | 已恢复 `GOAL-011` |
| GOAL-020 | Done | LINE-STAGE-2-2 | TASK-SETTINGS-063 | Stage 2-2 场景、几何、流程、怪物/机关、结果与存档六段逆向 | 最多 1 次 | `GOAL-021` |
| GOAL-021 | Active | LINE-STAGE-2-2 | TASK-SLICE-150A | Stage 2-2 真场景、layout/traversal 与 9 个火焰机关接入 | 预计 0 次 | `GOAL-022` |
| GOAL-022 | Planned | LINE-STAGE-2-2 | TASK-SLICE-150B | 五停点、25 刷怪点、54 怪与 1P/2P 普通流程 | 预计 0 次 | `GOAL-023` |
| GOAL-023 | Planned | LINE-STAGE-2-2 | TASK-SLICE-150C | Monster16 八动作/六攻击、显门、胜利和 2-3 保存 | 预计 0 次 | `GOAL-024` |
| GOAL-024 | Planned | LINE-STAGE-2-2 | TASK-SLICE-150D | 940×590 1P/2P 全流程校准、重载与功能线关闭裁决 | 预计 0 次 | 依据覆盖差异关闭本线或生成同线最小后续 |

## 最近完成 Goal

`GOAL-020` 仅包含 `TASK-SETTINGS-063`：已从 `level22.swf` / `assets/2.swf`、局部/共享 AS3、时间轴与几何闭合 Stage 2-2 六段证据。关卡为五停点 11/13/13/16/1 共 54 怪，含 9 个 130 帧火焰；Monster16 为 24189 HP Boss，拥有 8 动作、36 个本体关键帧和六攻击对象 104 帧，死亡显门。

完成结果：场景/背景/地面/门、墙/平台/停点/刷怪点、火焰、Boss、失败/胜利和 2-3 保存合同影响实现的未知为零；14 条真资源已选择性派生并标为 `derived-ready`。原 `TASK-SLICE-150` 经 PG-008 规模预检拆为 `150A..150D`；当前只激活同线 `GOAL-021` / `TASK-SLICE-150A`。

## Goal 生成检查

新建或拆分 Goal 时必须确认：

1. 有一个可独立描述、验证和交接的产物边界。
2. 默认只绑定一个 task，且 task 不同时要求新资料族逆向、大范围实现和端到端验收。
3. 规模预算声明主工作包 1..2、预计 compact 为 0、独立验收批次 1..2，并有可操作拆分触发；无法合理估计时先拆小。
4. 不得同时绑定新资料族/资源派生、多个 owner 和端到端运行校准；任意三类同时出现必须拆分。
5. 输出中包含当前状态、验证、剩余风险和下一 Goal，使新对话不依赖 compact 摘要。

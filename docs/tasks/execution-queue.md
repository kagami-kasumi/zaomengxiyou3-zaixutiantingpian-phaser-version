# 全局执行队列

本文是 `/goal` 的第一调度入口，只维护会抢占游戏 Ready task 的活跃治理执行项。游戏任务的状态仍由 `feature-lines.md`、`task-board.md` 和独立 task 定义共同维护；本文件不复制游戏 task 状态。

## 调度规则

1. `/goal` 必须先读取本文件，再决定是否读取游戏功能线和 task 资料。
2. 活跃治理执行项按优先级升序排列；最多一个 `Ready` 或 `Blocked`，其余只能是 `Planned`。
3. 存在 `Ready` 治理项时，本次只执行该 PG 合同，不执行游戏 Ready task。
4. 存在 `Blocked` 治理项时，本次只处理该治理阻塞，不切回游戏功能线。
5. 没有 `Ready` 或 `Blocked` 治理项时，才回退到唯一 Active 游戏功能线和 `task-board.md` 的唯一 Ready task。
6. 用户明确要求绕过或重排时，必须先更新本队列及相关 PG 状态，再执行新的首项；不能只凭聊天临时跳过。
7. 治理执行项完成后从本表移除，完成事实写入对应 PG 和 `docs/workflow/governance-log.md`；同一次 `/goal` 不继续执行游戏 task。

## 活跃治理执行项

| 优先级 | 执行项 | 状态 | 类型 | 目标 | 合同 | 完成后 |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | PG-013 | Ready | 架构治理实现（V2G） | 建立唯一 `MonsterRuntimeRegistry` 并只迁移 Stage 1-2 怪物 owner；遭遇只提交 spawn 命令并消费实体事件，HeroPartyRuntime、五停点、双 Boss、`fbEnter`、奖励数值和视觉保持不变 | [合同](../workflow/problems/PG-013-关卡运行框架按关卡复制.md) | V2G 完成后移除本项；下一次 `/goal` 不跨入游戏 task |

PG-013 V2A..V2F 已完成，五关 Hero 消费者已全部归入共享 Runtime。`TASK-SLICE-163/164` 已分别闭合固定 world effect 与 Role5 龙魂剑移动 projectile，故 V2G 恢复为唯一 `Ready`；本项完成前不进入 `TASK-SLICE-159`。

## 游戏回退

本文件不持有游戏 task id。仅当上表没有 `Ready` 或 `Blocked` 时，才读取 `feature-lines.md` 与 `task-board.md`，并以二者通过自动校验的唯一 Active/Ready 组合为当前执行项。

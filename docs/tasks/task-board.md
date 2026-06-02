# 游戏任务看板

本文只记录未完成的游戏复现任务：玩法逆向、现代架构、纵向切片、资源和实现。
AI 工作流、任务体系、文档职责等脚手架维护不进入本文，记录到 `docs/workflow/governance-log.md`。
已完成游戏任务迁移到 `docs/tasks/task-history.md`。新对话默认不要读取历史，除非用户要求追溯、当前任务依赖历史决策，或需要修改已完成任务。

## 状态定义

- `Ready`：依赖满足，可以作为下一次 prompt 执行。
- `Blocked`：缺前置任务、机制事实或用户材料。
- `Planned`：已经规划，但不是当前优先级。
- `Split`：任务过大，已经拆出子任务，不直接执行。
- `Done`：任务已完成，应从本文移动到 `docs/tasks/task-history.md`。

## 当前推荐

推荐下一次：

- `TASK-SLICE-038`：等级/经验最小闭环。`M-040` 已由 `progression-index.md` 扒清，下一步可实现击杀加经验、自动升级、扣除本级经验、回满 HP/MP 和五角色基础属性表；任务奖励、宠物经验、难度倍率和存档后置。

## 待完成任务

| Task | 状态 | 类型 | 目标 | 目标机制/切片 | 产物 | 下一步 |
| --- | --- | --- | --- | --- | --- | --- |
| TASK-SLICE-038 | Ready | TASK-SLICE | 等级/经验最小闭环 | VS-014、M-040 | ProgressionSystem（待建）、`TestScene.ts`、`system-tests.ts`、`mechanics-index.md`、`vertical-slices.md`、`task-board.md`、`task-history.md` | 按 `progression-index.md` 实现击杀经验、自动升级、基础属性刷新和最小状态显示 |

## 任务完成定义

### TASK-SLICE-038

任务类型：

- `TASK-SLICE`

目标机制/切片：

- `VS-014` 等级/经验最小闭环
- `M-040` 等级/经验

输入资料：

- `docs/reverse-engineering/progression-index.md`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/vertical-slices.md`
- `src/systems/Monster30System.ts`
- `src/systems/HeroCombatSystem.ts`
- `src/scenes/TestScene.ts`
- `tools/system-tests.ts`

输出产物：

- ProgressionSystem 或等价成长系统文件（待实现时按现有边界命名）
- `src/scenes/TestScene.ts`
- `tools/system-tests.ts`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/vertical-slices.md`
- `docs/tasks/task-board.md`
- `docs/tasks/task-history.md`

完成定义：

- 击杀 `Monster30` 后，击杀归属玩家获得怪物经验。
- 经验达到本级需求时自动升级，只扣除本级所需经验，保留溢出经验继续判断。
- 升级后当前角色基础 HP/MP/攻击/防御按 `progression-index.md` 五角色公式刷新，HP/MP 回满。
- P1/P2 等级和经验互不串线；首切片可先用 P1 完整验证，架构保留 P2。
- 测试场景能显示等级、当前经验、下级经验和升级后的关键属性变化。

验收标准：

- 系统测试覆盖经验增加、单次升级、溢出经验、多角色公式至少一个代表、满级边界或近满级边界。
- `npm run test:systems` 通过。
- `npm run build` 通过。

禁止范围：

- 不修改 `extracted_flash/` 原始提取结果。
- 不实现任务奖励经验、宠物经验成长、难度倍率、无尽模式经验、存档持久化或完整角色信息/背包 UI。
- 不重构完整战斗、怪物、装备或存档系统。

状态更新：

- 完成后更新 `docs/reverse-engineering/mechanics-index.md` 的 `M-040` 复现状态。
- 完成后更新 `docs/tasks/vertical-slices.md` 的 `VS-014`。
- 完成后从本文移入 `docs/tasks/task-history.md`。

推荐后续任务：

- `TASK-SLICE-038` 完成后，转向宠物经验成长、任务奖励经验同步、或存档最小闭环。

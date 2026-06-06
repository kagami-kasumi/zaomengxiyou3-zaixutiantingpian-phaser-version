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

- `TASK-SETTINGS-029`：宠物马系 `sp/bd/bz/tmaoyi` 专属技能链边界逆向。猴子主动技能、`fsnl` 技能加值和 `sxkb` 暴击接入已形成闭环，下一步先扒清第一条非猴子专属技能链，支撑后续实现切片。

## 待完成任务

| Task | 状态 | 类型 | 目标 | 目标机制/切片 | 产物 | 下一步 |
| --- | --- | --- | --- | --- | --- | --- |
| TASK-SETTINGS-029 | Ready | TASK-SETTINGS | 宠物马系专属技能链边界逆向 | M-042、VS-033 | `pets-index.md`、`mechanics-index.md`、`vertical-slices.md`、`task-board.md`、`task-history.md` | 扒清 `horse1..4` 的 `sp/bd/bz/tmaoyi` 入口、门禁、数值、投射物/特效和现代最小实现边界 |

## 任务完成定义

### TASK-SETTINGS-029

任务类型：

- `TASK-SETTINGS`

目标机制/切片：

- `M-042` 宠物
- `VS-033` 宠物马系专属技能链最小闭环

输入资料：

- `extracted_flash/README_extract.md`
- `extracted_flash/scripts/172845/scripts`
- `docs/reverse-engineering/pets-index.md`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/vertical-slices.md`

输出产物：

- `docs/reverse-engineering/pets-index.md`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/vertical-slices.md`
- `docs/tasks/task-board.md`
- `docs/tasks/task-history.md`

完成定义：

- 定位 `horse1`、`horse2`、`horse3`、`horse4` 相关 AS3 类和资源键，确认 `sp`、`bd`、`bz`、`tmaoyi` 的学习/释放入口。
- 记录每个技能的 MP 消耗、冷却/触发条件、目标选择、距离/状态门禁、伤害或 buff 公式、投射物/特效资源和结束条件。
- 对比猴子技能现代实现边界，给出每个马系技能可拆成的最小现代实现切片，明确哪些事实足够实现、哪些需要后续实测校准。
- 更新 `docs/reverse-engineering/pets-index.md` 的非猴子专属技能章节，并同步 `mechanics-index.md` 与 `vertical-slices.md`。
- 根据逆向结果在本文留下下一个 Ready 实现任务；如果 `sp` 证据仍不足，则留下更小的补充逆向任务。

验收标准：

- `npm run check:workflow` 通过。
- `pets-index.md` 能让下一个 agent 不读完整 AS3 也知道马系首个可实现切片的入口、数值和边界。

禁止范围：

- 不实现马系技能代码、不改 `src/`，除非用户明确改为实现任务。
- 不实现全部宠物专属技能、真实资源替换、完整全局存档文件读写、AMF/compress/encrypt、超级进化、成长洗练或 P2 宠物。
- 不修改、删除或重新生成 `extracted_flash/` 原始提取结果。
- 不把普通角色技能书 `jns` 当作宠物技能学习入口。

状态更新：

- 完成后更新 `docs/reverse-engineering/pets-index.md`、`docs/reverse-engineering/mechanics-index.md` 和 `docs/tasks/vertical-slices.md`。
- 完成后从本文移入 `docs/tasks/task-history.md`。

推荐后续任务：

- `TASK-SETTINGS-029` 完成后，优先生成并执行马系 `sp` 或已确认最小技能的实现切片。

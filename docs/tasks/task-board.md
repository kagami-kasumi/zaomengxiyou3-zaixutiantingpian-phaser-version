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

- `TASK-SETTINGS-030`：下一组宠物专属技能链边界逆向。马系 `sp/bd/bz/tmaoyi` 已完成最小闭环，下一步先补清 UFO/玄龟/青龙/房日兔/子鼠等宠物链中一个可执行小组的技能门禁、资源、伤害和状态边界，再创建对应实现切片。

## 待完成任务

| Task | 状态 | 类型 | 目标 | 目标机制/切片 | 产物 | 下一步 |
| --- | --- | --- | --- | --- | --- | --- |
| TASK-SETTINGS-030 | Ready | TASK-SETTINGS | 下一组宠物专属技能链边界逆向 | M-042、M-032、VS-033 | `pets-index.md`、`mechanics-index.md`、`vertical-slices.md`、`task-board.md`、`task-history.md` | 从 UFO/玄龟/青龙/房日兔/子鼠等候选中选择证据最清晰的一组，补清技能学习入口、MP/CD/触发/距离门禁、伤害、资源键、附加状态和现代最小切片建议 |

## 任务完成定义

### TASK-SETTINGS-030

任务类型：

- `TASK-SETTINGS`

目标机制/切片：

- `M-042` 宠物
- `M-032` 伤害/受击
- `VS-033` 宠物马系专属技能链最小闭环

输入资料：

- `docs/reverse-engineering/pets-index.md`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/vertical-slices.md`
- `extracted_flash/README_extract.md`
- `extracted_flash/scripts/172845/scripts` 中对应宠物 AS3 类

输出产物：

- `docs/reverse-engineering/pets-index.md`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/vertical-slices.md`
- `docs/tasks/task-board.md`
- `docs/tasks/task-history.md`

完成定义：

- 定位下一组宠物专属技能链的 AS3 类和资源键，优先选择证据完整且能拆成一个小实现切片的一组。
- 在 `pets-index.md` 记录该组宠物的技能候选池、形态学习入口、MP 消耗、CD、触发条件、距离/目标门禁、伤害公式、附加状态和资源键。
- 明确哪些技能适合先做最小闭环，哪些技能需要后置到单独切片。
- 同步 `mechanics-index.md` 的 `M-042` 下一步，并在 `task-board.md` 创建一个 Ready 的实现切片。

验收标准：

- `pets-index.md` 有可执行的下一组宠物技能链事实表。
- `npm run check:workflow` 通过。
- `task-board.md` 中出现一个来自该逆向结果的 Ready 实现任务。

禁止范围：

- 不写现代游戏代码。
- 不实现真实资源替换、完整全局存档文件读写、AMF/compress/encrypt、超级进化、成长洗练或 P2 宠物。
- 不修改、删除或重新生成 `extracted_flash/` 原始提取结果。
- 不把普通角色技能书 `jns` 当作宠物技能学习入口。

状态更新：

- 完成后更新 `docs/reverse-engineering/mechanics-index.md`、`docs/tasks/vertical-slices.md` 和 `docs/tasks/task-board.md`。
- 完成后从本文移入 `docs/tasks/task-history.md`。

推荐后续任务：

- `TASK-SETTINGS-030` 完成后，优先执行它生成的下一组宠物技能实现切片。

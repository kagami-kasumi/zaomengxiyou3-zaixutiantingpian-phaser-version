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

Role3 八戒完整战斗扩展已经交付，当前没有未完成的 Role3 任务。
下一步恢复推荐 `TASK-SETTINGS-037`：完整逆向 Role1 悟空技能链。

## 待完成任务

| Task | 状态 | 类型 | 目标 | 目标机制/切片 | 输出 | 下一步 |
| --- | --- | --- | --- | --- | --- | --- |
| TASK-SETTINGS-037 | Ready | 逆向 | Role1 悟空完整技能链逆向 | M-018、M-024、M-025、M-034 | `roles-index.md`、`skills-input-index.md`、`projectiles-index.md`、状态文档 | 按结果拆分 Role1 可玩纵向切片 |

## 任务完成定义

### TASK-SETTINGS-037

任务类型：

- `TASK-SETTINGS`

目标机制/切片：

- `M-018` Role1 悟空。
- `M-024` 角色组合输入与蓄力。
- `M-025` 角色正式技能。
- `M-034` 子弹/技能飞行物。

输入资料：

- `AGENTS.md`、`TASK_OUTLINE.md`、`docs/workflow/agent-protocol.md`。
- `docs/tasks/task-board.md`、`docs/reverse-engineering/mechanics-index.md`、`docs/tasks/vertical-slices.md`。
- `docs/reverse-engineering/roles-index.md`、`docs/reverse-engineering/skills-input-index.md`、`docs/reverse-engineering/projectiles-index.md`。
- `extracted_flash/README_extract.md`，以及关键词定位后的 `Role1.as`、`BaseHero.as`、输入/技能学习和相关 projectile AS3 小范围上下文。

输出产物：

- 更新 `docs/reverse-engineering/roles-index.md`，补齐 Role1 主动、被动、普攻衍生和状态协同。
- 更新 `docs/reverse-engineering/skills-input-index.md`，记录正式槽位、组合输入、MP、等级、动作和重入门禁。
- 更新 `docs/reverse-engineering/projectiles-index.md`，记录 Role1 技能弹体/特效的类型、位置、时序、命中参数和资源缺口。
- 更新 `docs/reverse-engineering/mechanics-index.md`、`docs/tasks/vertical-slices.md`、`docs/tasks/task-board.md`、`docs/tasks/task-history.md`。

完成定义：

- Role1 技能树中的全部技能均完成主动/被动/废弃分类，`sx` 缺口得到证据化结论。
- 每个可释放技能都有输入入口、MP/等级公式、动作窗口、伤害/支援/控制效果、重入边界和 projectile 映射。
- 普攻五段、空中普攻、`slz` 组合键和 `hytj` 跑动普攻的关系明确。
- 将后续现代实现拆成一个或多个单对话可验收任务，并指定首个 Ready 项。

验收标准：

- 索引可独立回答 Role1 每项技能“如何触发、何时生效、生成什么、如何结算、何时恢复”。
- 关键结论均能追溯到精确 AS3 文件/方法或稳定关键词，不根据角色印象猜测。
- `npm run check:workflow` 通过。

禁止范围：

- 不修改 `extracted_flash/`。
- 不实现 `src/` 代码，不伪造缺失视觉/音频资源。
- 不同时展开 Role3、Role4 或 Role5 技能链。

状态更新：

- `docs/tasks/task-board.md`
- `docs/tasks/task-history.md`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/vertical-slices.md`

推荐后续任务：

- 按逆向结果生成首个 Role1 可玩纵向切片任务。

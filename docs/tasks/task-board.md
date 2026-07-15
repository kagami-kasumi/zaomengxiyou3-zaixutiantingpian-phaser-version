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
Role1 `slz/sx`、`lys/hytj`、`lyfb/jdy`、`qsez/zz` 与 `hmz/hyjj` 已全部交付；当前没有未完成的 Role1 任务。
Role4 毒系、巫毒娃娃、毒链、三项双形态位移攻击、标记传送与终结技已经交付；当前没有未完成的 Role4 任务。
Role5 白龙完整战斗扩展已经交付；当前没有未完成的 Role5 任务。
五角色战斗资源缺口盘点已完成，EVB 原始资源提取也已经完成，Role1/4/5 源包阻塞已解除。
首个真资源族已完成：Role1 普攻 `Role1Bullet1/3/4/5` 已从 `WuKong.swf` 接入。
1.1 合成配方、默认/特殊属性继承及双玩家三槽材料暂存交互均已完成；现代版明确不复现时装生成时间戳。当前推荐执行 `TASK-SETTINGS-044`，建立完整炼丹炉界面的视觉资源与交互证据索引，再决定是否生成视觉实现切片。

## 待完成任务

| Task | 状态 | 类型 | 目标 | 目标机制/切片 | 输出 | 下一步 |
| --- | --- | --- | --- | --- | --- | --- |
| TASK-SETTINGS-044 | Ready | 逆向 | 建立炼丹炉视觉资源与交互索引 | M-039、VS-042 | `crafting-ui-index.md`、界面 symbol/位图/时间轴映射、布局与状态清单、视觉切片边界 | 生成炼丹炉视觉实现切片或确认占位 UI 为长期边界 |

## 任务完成定义

### TASK-SETTINGS-044

任务类型：

- `TASK-SETTINGS`

目标机制/切片：

- `M-039`
- `VS-042`

输入资料：

- `docs/reverse-engineering/crafting-index.md`
- `extracted_flash/resources_by_swf/[172845].swf/scripts/export/strength/StrengthEquipment.as`
- `extracted_flash/resources_by_swf/[172845].swf/scripts/export/strength/Fusion.as`
- `extracted_flash/resources_by_swf/[172845].swf/symbolClass/symbols.csv`
- `extracted_flash/resources_by_swf/[172845].swf/images/`
- `docs/reverse-engineering/assets-index.md`

输出产物：

- 新增 `docs/reverse-engineering/crafting-ui-index.md`，记录炼丹炉容器、页签、三个材料槽、预览、产物、按钮和提示状态的可观察布局与时间轴行为。
- 建立 AS3 类/symbol/位图资源到现代用途的映射，标记可用、缺失或需占位的资源。
- 更新机制、切片和任务状态文档，并据证据决定是否生成视觉实现切片。

完成定义：

- 所有可定位的界面 symbol、位图和关键帧都有精确来源路径或 symbol id；未定位资源明确标记缺失，不凭名称猜图。
- 合成页的打开、玩家选择、材料变化、预览成功/失败、灵魂不足、合成成功、移除和关闭状态均有 AS3 行号证据。
- 文档给出最小视觉切片的资源清单、布局清单、占位策略和可自动/人工验证边界。

验收标准：

- 新对话可仅依赖该索引生成确定性的视觉实现任务，不需要重新全量搜索资源。
- `npm run check:workflow` 通过。

禁止范围：

- 不修改 `extracted_flash/` 或权威 JSON。
- 不写现代 UI 代码，不生成或重提取资源，不实现强化/分解/制作玩法。

状态更新：

- `task-board.md`
- `task-history.md`
- `mechanics-index.md`
- `vertical-slices.md`

推荐后续任务：

- 根据资源结论生成炼丹炉视觉实现切片，或明确保留当前占位 UI。

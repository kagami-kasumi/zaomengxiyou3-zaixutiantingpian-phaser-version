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

- `TASK-SLICE-037`：法宝强化 UI 最小可玩切片。法宝 H 触发能力已覆盖多种代表效果，下一步可把 `SutraInterface` 的强化入口做成现代最小 UI：展示当前 `zbfb`、等级/五行/成长率/灵魂消耗，并完成 1 次可测试升级闭环。

## 待完成任务

| Task | 状态 | 类型 | 目标 | 目标机制/切片 | 产物 | 下一步 |
| --- | --- | --- | --- | --- | --- | --- |
| TASK-SLICE-037 | Ready | TASK-SLICE | 法宝强化 UI 最小可玩切片 | M-043、M-016、M-036、VS-013 | `src/systems/MagicWeaponSystem.ts`、`src/systems/EquipmentSystem.ts`、`src/systems/EquipmentUISystem.ts`、`src/scenes/TestScene.ts`、`tools/system-tests.ts`、`magic-weapons-index.md`、`mechanics-index.md`、`vertical-slices.md`、`task-board.md`、`task-history.md` | 按 `SutraInterface.as` 做最小强化面板：读取当前 `zbfb`，显示等级/五行/成长率/灵魂消耗，消耗测试灵魂把法宝从 1 级升到 2 级并刷新属性/状态 |

## 任务完成定义

### TASK-SLICE-037

任务类型：
- `TASK-SLICE`

目标机制/切片：
- `M-043` 法宝
- `M-016` UI 快捷键
- `M-036` 装备
- `VS-013` 法宝最小可玩切片

输入资料：
- `docs/reverse-engineering/magic-weapons-index.md`
- `docs/reverse-engineering/equipment-index.md`
- `docs/architecture/src-boundaries.md`
- `extracted_flash/scripts/172845/scripts/export/strength/SutraInterface.as`
- `extracted_flash/scripts/172845/scripts/base/BaseHero.as`
- `extracted_flash/scripts/172845/scripts/my/AllEquipment.as`
- `extracted_flash/scripts/172845/scripts/my/MyEquipObj.as`
- `src/systems/EquipmentSystem.ts`
- `src/systems/EquipmentUISystem.ts`
- `src/systems/MagicWeaponSystem.ts`
- `src/scenes/TestScene.ts`

输出产物：
- `src/systems/MagicWeaponSystem.ts`
- `src/systems/EquipmentSystem.ts`
- `src/systems/EquipmentUISystem.ts`
- `src/scenes/TestScene.ts`
- `tools/system-tests.ts`
- `docs/reverse-engineering/magic-weapons-index.md`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/vertical-slices.md`
- `docs/tasks/task-board.md`
- `docs/tasks/task-history.md`

完成定义：
- 测试场景提供一个最小法宝强化面板入口；入口可沿用现有调试/背包 UI 键，不要求复刻完整原版布局。
- 面板读取当前 `zbfb`，显示法宝名、等级、五行、成长率、当前主要属性、下一级灵魂消耗和可升级/不可升级状态。
- 至少支持普通 1 至 2 级升级：消耗测试灵魂，提升法宝等级，按现有现代装备数据刷新 `magicWeapon.level` 和可观察属性/状态；灵魂不足时拒绝升级并给出状态反馈。
- 强化后 `MagicWeaponSystem` 读取到新的等级；至少一个已有等级相关法宝行为由系统测试证明会使用升级后的等级。
- 系统测试覆盖面板状态构建、灵魂消耗、升级成功、灵魂不足拒绝、装备/未装备边界和升级后法宝等级读取。

验收标准：
- `npm run test:systems` 通过。
- `npm run build` 通过。
- `npm run check:workflow` 通过。
- 测试场景可打开最小强化面板并完成一次 `zbfb` 升级反馈。

禁止范围：
- 不修改 `extracted_flash/` 原始提取结果。
- 不实现完整 `SutraInterface` 视觉布局、材料阶段、10 级以后特殊材料、五行重置、真实灵魂存档或联机同步。
- 不重构现有背包/装备 UI，只加本任务必要的最小桥接。

状态更新：

- 完成后更新 `docs/reverse-engineering/mechanics-index.md` 的 `M-043/M-016/M-036` 复现状态/下一步。
- 完成后更新 `docs/tasks/vertical-slices.md` 的 `VS-013` 产物和验收说明。
- 完成后同步 `docs/reverse-engineering/magic-weapons-index.md` 的现代实现结果。
- 完成后从本文移入 `docs/tasks/task-history.md`。

推荐后续任务：
- `TASK-SLICE-037` 完成后，可按宠物成长/技能、成长系统或强化系统继续拆分。

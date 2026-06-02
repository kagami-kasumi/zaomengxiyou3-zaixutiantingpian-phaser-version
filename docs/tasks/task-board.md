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

- `TASK-SETTINGS-023`：`qljfb/MagicBigBottle` 青龙剑/墙船法宝逆向索引。当前法宝实现已推进到 `stlp` 落雪，下一步先补清 `qljfb` 的 `StageBoat`、墙体数组、持续时间、动作窗口和资源缺口，再拆现代切片。

## 待完成任务

| Task | 状态 | 类型 | 目标 | 目标机制/切片 | 产物 | 下一步 |
| --- | --- | --- | --- | --- | --- | --- |
| TASK-SETTINGS-023 | Ready | TASK-SETTINGS | `qljfb/MagicBigBottle` 青龙剑/墙船法宝逆向索引 | M-043、M-034、VS-013 | `magic-weapons-index.md`、`projectiles-index.md`、`mechanics-index.md`、`vertical-slices.md`、`task-board.md`、`task-history.md` | 阅读 `MagicBigBottle.as`、`MagicBigBottleChild/StageBoat.as` 和 `BaseHero.showSkillFaBao()` 入口，补清 `MagicBigSwordBmd`、`StageBoat`、世界墙数组、20 秒持续和动作窗口，再决定现代最小切片 |

## 任务完成定义

### TASK-SETTINGS-023

任务类型：
- `TASK-SETTINGS`

目标机制/切片：
- `M-043` 法宝
- `M-034` 子弹/技能飞行物
- `VS-013` 法宝最小可玩切片

输入资料：
- `docs/reverse-engineering/magic-weapons-index.md`
- `docs/reverse-engineering/projectiles-index.md`
- `extracted_flash/scripts/172845/scripts/base/BaseMagicWeapon.as`
- `extracted_flash/scripts/172845/scripts/base/BaseHero.as`
- `extracted_flash/scripts/172845/scripts/export/magicWeapon/MagicBigBottle.as`
- `extracted_flash/scripts/172845/scripts/export/magicWeapon/MagicBigBottleChild/StageBoat.as`

输出产物：
- `docs/reverse-engineering/magic-weapons-index.md`
- `docs/reverse-engineering/projectiles-index.md`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/vertical-slices.md`
- `docs/tasks/task-board.md`
- `docs/tasks/task-history.md`

完成定义：
- 补清 `qljfb` 在 `BaseHero.showSkillFaBao()` 中的创建入口、是否存在等级/MP/灵魂门禁、动作重入边界和五行动作窗口。
- 补清 `MagicBigBottle.showSkill()` 的资源名、显示对象、位置/朝向、缩放/透明/层级、持续时间和清理方式。
- 补清 `StageBoat` 与 `ThroughWall`/世界墙数组的关系，说明它在原版里更接近临时墙/船对象而不是常规伤害 projectile。
- 明确 `MagicBigSwordBmd`、`StageBoat` 相关资源在当前导出中的可用性或缺口，登记稳定现代占位 key 建议。
- 给出下一步现代最小可玩切片边界：只做 `qljfb` 触发 + 临时平台/墙体占位，还是需要先补通用墙体/碰撞桥。

验收标准：
- `npm run check:workflow` 通过。
- `magic-weapons-index.md` 中 `qljfb/MagicBigBottle` 条目可直接支撑后续 `TASK-SLICE`。
- `mechanics-index.md` 和 `vertical-slices.md` 指向新的后续推荐任务，不留下已完成任务作为当前推荐。

禁止范围：
- 不修改 `extracted_flash/` 原始提取结果。
- 不实现 `qljfb` 现代代码切片。
- 不实现法宝强化 UI、材料消耗、五行重置、真实资源、完整地图碰撞或联机同步。
- 不顺手逆向其他法宝，除非只为确认 `qljfb` 共用基类边界。

状态更新：

- 完成后更新 `docs/reverse-engineering/mechanics-index.md` 的 `M-043/M-034` 逆向状态/下一步。
- 完成后更新 `docs/tasks/vertical-slices.md` 的 `VS-013` 后续队列。
- 完成后同步 `docs/reverse-engineering/magic-weapons-index.md` 与 `docs/reverse-engineering/projectiles-index.md` 的 `qljfb` 事实。
- 完成后从本文移入 `docs/tasks/task-history.md`。

推荐后续任务：
- `TASK-SETTINGS-023` 完成后，可拆 `qljfb` 青龙剑最小可玩切片，或转向法宝强化 UI、宠物成长/技能、成长系统或强化系统。

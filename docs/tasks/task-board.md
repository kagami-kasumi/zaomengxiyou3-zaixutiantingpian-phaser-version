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

- `TASK-SLICE-068`：宠物 `turtle3/sybh` 水湮八荒范围伤害最小闭环。`turtle2/txlj` 已完成，下一步实现玄龟三阶范围伤害。

## 待完成任务

| Task | 状态 | 类型 | 目标 | 目标机制/切片 | 产物 | 下一步 |
| --- | --- | --- | --- | --- | --- | --- |
| TASK-SLICE-068 | Ready | TASK-SLICE | 宠物 `turtle3/sybh` 水湮八荒范围伤害最小闭环 | M-042、M-032、VS-035 | `PetSystem.ts`、`ProjectileSystem.ts`、`AssetManifest.ts`、`TestScene.ts`、`system-tests.ts`、`mechanics-index.md`、`vertical-slices.md`、`task-board.md`、`task-history.md` | P1 种子新增/启用可切换 `turtle3`，按 `sybh` 已学、MP、CD 和目标门禁释放 `PetTurtle3Bullet3` 占位范围 projectile，按 `5.4 * pet.atk + skillDamageBonus` 接入 `sxkb` 暴击造成范围伤害 |

## 任务完成定义

### TASK-SLICE-068

任务类型：

- `TASK-SLICE`

目标机制/切片：

- `M-042` 宠物
- `M-032` 伤害/受击
- `VS-035` 宠物玄龟专属技能链最小闭环

输入资料：

- `docs/reverse-engineering/pets-index.md`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/vertical-slices.md`
- `docs/architecture/src-boundaries.md`
- `src/systems/PetSystem.ts`
- `src/systems/ProjectileSystem.ts`
- `src/assets/AssetManifest.ts`
- `src/scenes/TestScene.ts`
- `tools/system-tests.ts`

输出产物：

- `src/systems/PetSystem.ts`
- `src/systems/ProjectileSystem.ts`
- `src/assets/AssetManifest.ts`
- `src/scenes/TestScene.ts`
- `tools/system-tests.ts`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/vertical-slices.md`
- `docs/tasks/task-board.md`
- `docs/tasks/task-history.md`

完成定义：

- P1 测试宠物种子新增可切换出战的 `turtle3`，并持有已学 `sld/txlj/sybh`；`turtle1/sld`、`turtle2/txlj` 和已有猴、马、青龙宠物技能行为保持不变。
- `turtle3/sybh` 按已学习、宠物 MP `>= 20`、CD3 就绪、存在 `Monster30` 目标门禁释放。
- 释放成功扣 20 MP，重置约 5.5 秒 CD，生成 `PetTurtle3Bullet3` / `hit3` 或等价占位范围 projectile。
- 命中时按 `5.4 * pet.atk + skillDamageBonus` 接入既有 `sxkb` 暴击伤害 helper，对范围内 `Monster30` 造成等价技能伤害；本切片不实现 `xwaoyi` 持续 5 秒奥义范围。
- `AssetManifest.ts` 登记 `PetTurtleBmd3`、`PetTurtle3Bullet3` 真资源缺口或占位 key，`TestScene` 状态栏/宠物面板能观察 `turtle3/sybh` MP、CD、伤害反馈。
- 系统测试覆盖未学习、MP 不足、无目标、CD、扣 MP、projectile 生成、伤害、`fsnl/sxkb` 兼容，以及 `turtle1/sld`、`turtle2/txlj` 兼容。

验收标准：

- `npm run test:systems` 通过。
- `npm run build` 通过。
- `npm run check:workflow` 通过。
- `VS-035` 记录 `turtle3/sybh` 已完成或已完成第三段，并创建后续 Ready 任务或明确下一步。

禁止范围：

- 不实现 `xwaoyi` 玄武奥义、完整全局存档、成长洗练、P2 宠物或真实资源替换。
- 不修改、删除或重新生成 `extracted_flash/` 原始提取结果。
- 不把普通角色技能书 `jns` 当作宠物技能学习入口。

状态更新：

- 完成后更新 `docs/reverse-engineering/mechanics-index.md`、`docs/tasks/vertical-slices.md`、`docs/tasks/task-board.md` 和 `docs/tasks/task-history.md`。
- 完成后从本文移入 `docs/tasks/task-history.md`。

推荐后续任务：

- `TASK-SLICE-068` 完成后，优先执行 `TASK-SLICE-069` 宠物 `turtle4/xwaoyi` 玄武奥义反馈最小闭环，或按看板生成玄龟下一段实现任务。

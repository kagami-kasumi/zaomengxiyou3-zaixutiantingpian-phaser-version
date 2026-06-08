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

- `TASK-SLICE-065`：宠物 `dragon4/qlaoyi` 青龙奥义反馈最小闭环。`dragon3/ltwj` 已完成，下一步实现青龙四阶奥义的前置技能组合反馈。

## 待完成任务

| Task | 状态 | 类型 | 目标 | 目标机制/切片 | 产物 | 下一步 |
| --- | --- | --- | --- | --- | --- | --- |
| TASK-SLICE-065 | Ready | TASK-SLICE | 宠物 `dragon4/qlaoyi` 青龙奥义反馈最小闭环 | M-042、M-032、VS-034 | `PetSystem.ts`、`ProjectileSystem.ts`、`AssetManifest.ts`、`TestScene.ts`、`system-tests.ts`、`mechanics-index.md`、`vertical-slices.md`、`task-board.md`、`task-history.md` | P1 种子新增/启用可切换 `dragon4`，按 `qlaoyi` 已学、MP、CD、目标和距离 `<= 200` 门禁释放 `PetDragonBullet4` 奥义占位反馈，按已学 `fs/sdcc/ltwj` 记录分身/冲刺/多段组合 |

## 任务完成定义

### TASK-SLICE-065

任务类型：

- `TASK-SLICE`

目标机制/切片：

- `M-042` 宠物
- `M-032` 伤害/受击
- `VS-034` 宠物青龙专属技能链最小闭环

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

- P1 测试宠物种子新增可切换出战的 `dragon4`，并持有已学 `fs/sdcc/ltwj/qlaoyi`；`dragon1/fs`、`dragon2/sdcc` 和 `dragon3/ltwj` 既有行为保持不变。
- `dragon4/qlaoyi` 按已学习、宠物 MP `>= 30`、CD4 就绪、存在 `Monster30` 目标且距离 `<= 200` 门禁释放。
- 释放成功扣 30 MP，重置约 24 秒 CD，生成 `PetDragonBullet4` / `hit4` 或等价奥义占位反馈；`qlaoyi` 本体直接伤害保持 0。
- 按已学前置技能记录组合效果：已学 `fs` 时记录分身组合，已学 `sdcc` 时记录分身可走冲刺，已学 `ltwj` 时记录多段/龙腾组合；不要实现完整分身 AI。
- `AssetManifest.ts` 登记 `PetDragonBmd4`、`PetDragonBullet4` 真资源缺口或占位 key，`TestScene` 状态栏能观察 `dragon4/qlaoyi` MP/CD/组合反馈。
- 系统测试覆盖未学习、MP 不足、无目标、距离过远、CD、扣 MP、直接伤害 0、组合记录，以及 `dragon1/fs`、`dragon2/sdcc`、`dragon3/ltwj` 兼容。

验收标准：

- `npm run test:systems` 通过。
- `npm run build` 通过。
- `npm run check:workflow` 通过。
- `VS-034` 记录 `dragon4/qlaoyi` 已完成，并创建后续 Ready 任务或明确下一步。

禁止范围：

- 不实现青龙完整分身 AI、分身协同攻击、真实资源替换或超出 `qlaoyi` 最小组合反馈的完整奥义时间轴。
- 不实现完整全局存档文件读写、AMF/compress/encrypt、超级进化、成长洗练或 P2 宠物。
- 不修改、删除或重新生成 `extracted_flash/` 原始提取结果。
- 不把普通角色技能书 `jns` 当作宠物技能学习入口。

状态更新：

- 完成后更新 `docs/reverse-engineering/mechanics-index.md`、`docs/tasks/vertical-slices.md`、`docs/tasks/task-board.md` 和 `docs/tasks/task-history.md`。
- 完成后从本文移入 `docs/tasks/task-history.md`。

推荐后续任务：

- `TASK-SLICE-065` 完成后，优先执行 `TASK-SETTINGS-031` 逆向下一组宠物专属技能链，或按看板生成下一条非猴/马/青龙宠物链。

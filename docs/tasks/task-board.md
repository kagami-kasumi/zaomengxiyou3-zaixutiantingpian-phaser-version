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

- `TASK-SLICE-060`：宠物 `horse3/bz` 大范围冰锥技能最小闭环。`horse1/sp` 与 `horse2/bd` 已完成，下一步接入三阶马主动 `bz` 的 MP/CD/距离门禁、占位 projectile、伤害和冰冻反馈。

## 待完成任务

| Task | 状态 | 类型 | 目标 | 目标机制/切片 | 产物 | 下一步 |
| --- | --- | --- | --- | --- | --- | --- |
| TASK-SLICE-060 | Ready | TASK-SLICE | 宠物 `horse3/bz` 大范围冰锥技能最小闭环 | M-042、M-032、VS-033 | `PetSystem.ts`、`ProjectileSystem.ts`、`AssetManifest.ts`、`TestScene.ts`、`system-tests.ts`、`mechanics-index.md`、`vertical-slices.md`、`task-board.md`、`task-history.md` | 实现 `horse3` 出战种子、`bz` MP/CD/距离门禁、扣 MP、占位 `PetHorse3Bullet2` projectile、2 秒冰冻和系统测试 |

## 任务完成定义

### TASK-SLICE-060

任务类型：

- `TASK-SLICE`

目标机制/切片：

- `M-042` 宠物
- `M-032` 伤害/受击
- `VS-033` 宠物马系专属技能链最小闭环

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

- P1 宠物种子列表新增可切换出战的 `horse3`，并持有已学 `bz`；不得改变 `horse1/sp` 与 `horse2/bd` 既有行为。
- `bz` 仅在已学习、MP `>= 20`、存在 `Monster30` 目标、目标距离不超过 AS3 对应门禁、CD3 就绪时释放。
- 释放成功扣 20 MP，重置约 6 秒冷却，生成 `PetHorse3Bullet2` / `hit3` 占位 projectile，对目标造成 `6.6 * pet.atk + skillDamageBonus` 后再接入既有宠物暴击倍率。
- 命中附加 2 秒 `pethorse_ice` 等价冰冻/定身最小状态，优先作用于 `Monster30`；真实冰块资源仍登记为缺口。
- 系统测试覆盖未学习、MP 不足、无目标、距离门禁、冷却、伤害、扣 MP、`horse1/sp` 与 `horse2/bd` 兼容、`fsnl/sxkb` 兼容和冰冻状态。

验收标准：

- `npm run test:systems` 通过。
- `npm run build` 通过。
- `npm run check:workflow` 通过。
- 测试场景中可观察到 P1 切换 `horse3` 出战后，满足门禁时释放 `bz` 并对 `Monster30` 造成伤害/冰冻反馈。

禁止范围：

- 不实现 `tmaoyi`、真实资源替换、完整全局存档文件读写、AMF/compress/encrypt、超级进化、成长洗练或 P2 宠物。
- 不修改、删除或重新生成 `extracted_flash/` 原始提取结果。
- 不把普通角色技能书 `jns` 当作宠物技能学习入口。

状态更新：

- 完成后更新 `docs/reverse-engineering/mechanics-index.md` 和 `docs/tasks/vertical-slices.md`。
- 完成后从本文移入 `docs/tasks/task-history.md`。

推荐后续任务：

- `TASK-SLICE-060` 完成后，优先实现 `horse4/tmaoyi` 奥义反馈，或按校准反馈调整 `sp/bd/bz`。

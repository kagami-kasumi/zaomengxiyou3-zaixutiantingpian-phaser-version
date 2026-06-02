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

- `TASK-SETTINGS-022`：套天化雪令/Ling 落雪法宝逆向。`zltc` 震雷天锤已完成，下一步先把 `stlp` 的落雪创建、目标选择、伤害/附加效果和资源缺口扒清，再拆实现切片。

## 待完成任务

| Task | 状态 | 类型 | 目标 | 目标机制/切片 | 产物 | 下一步 |
| --- | --- | --- | --- | --- | --- | --- |
| TASK-SETTINGS-022 | Ready | TASK-SETTINGS | 套天化雪令/Ling 落雪法宝逆向 | M-043、M-034、VS-013 | `magic-weapons-index.md`、`projectiles-index.md`、`mechanics-index.md`、`vertical-slices.md`、`task-board.md`、`task-history.md` | 细读 `Ling.as`、`BaseHero.attackBackInfoDict` 和相关雪花/落雪对象，确认 `stlp` 触发门禁、动作窗口、落雪生成、命中参数、资源缺口和现代最小实现边界 |

## 任务完成定义

### TASK-SETTINGS-022

任务类型：
- `TASK-SETTINGS`

目标机制/切片：
- `M-043` 法宝
- `M-034` 子弹/技能飞行物
- `VS-013` 法宝最小可玩切片

输入资料：
- `docs/reverse-engineering/magic-weapons-index.md`
- `docs/reverse-engineering/projectiles-index.md`
- `docs/reverse-engineering/combat-rules-index.md`
- `extracted_flash/scripts/172845/scripts/export/magicWeapon/Ling.as`
- `extracted_flash/scripts/172845/scripts/base/BaseMagicWeapon.as`
- `extracted_flash/scripts/172845/scripts/base/BaseHero.as`
- `extracted_flash/scripts/172845/scripts/base/BaseBullet.as`
- `extracted_flash/scripts/172845/scripts/base/BaseMonster.as`
- `extracted_flash/scripts/172845/scripts/export/bullet/`

输出产物：
- `docs/reverse-engineering/magic-weapons-index.md`
- `docs/reverse-engineering/projectiles-index.md`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/vertical-slices.md`
- `docs/tasks/task-board.md`
- `docs/tasks/task-history.md`

完成定义：
- 补全 `stlp`/`Ling` 的 AS3 证据：装备入口、`useSkill()` 门禁、`showSkill()`/step 逻辑、雪花/落雪对象创建方式、动作回待机窗口。
- 确认落雪命中参数：`actionName`、`attackBackInfoDict`、伤害公式、击退、`attackInterval`、是否附加冰冻/眩晕等 AddEffect。
- 确认资源名和缺口：`Ling` 本体、雪花/落雪 projectile/effect、box 或碰撞对象；不得重新生成 `extracted_flash/`。
- 在 `magic-weapons-index.md` 写清现代最小实现建议：是全屏随机落雪、目标锁定 projectile，还是持续生成 hitbox；明确首切片不做的范围。
- 在 `projectiles-index.md` 追加 `stlp` 所需 projectile/特殊对象映射，足够支撑后续实现任务。

验收标准：
- `npm run check:workflow` 通过。
- `magic-weapons-index.md` 与 `projectiles-index.md` 能回答后续实现 `TASK-SLICE` 所需的门禁、动作窗口、生成物、命中参数和资源缺口。

禁止范围：
- 不修改 `extracted_flash/` 原始提取结果。
- 不写现代 `src/` 实现；本任务只做逆向和任务边界。
- 不实现真实资源、法宝强化 UI、材料消耗、五行重置或联机同步。
- 不顺手逆向 `qljfb` 或其他剩余法宝。

状态更新：

- 完成后更新 `docs/reverse-engineering/mechanics-index.md` 的 `M-043/M-034` 逆向/下一步。
- 完成后更新 `docs/reverse-engineering/magic-weapons-index.md` 和 `docs/reverse-engineering/projectiles-index.md`。
- 完成后更新 `docs/tasks/vertical-slices.md` 的 `VS-013` 后续队列，并生成或推荐对应实现任务。
- 完成后从本文移入 `docs/tasks/task-history.md`。

推荐后续任务：
- `TASK-SETTINGS-022` 完成后，拆出 `TASK-SLICE-035`：`stlp/Ling` 落雪法宝最小可玩切片。

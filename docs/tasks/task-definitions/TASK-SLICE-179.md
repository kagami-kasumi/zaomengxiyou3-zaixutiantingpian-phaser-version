# TASK-SLICE-179

任务类型：

- `TASK-SLICE`

功能条线：

- `LINE-CORE-PROGRESSION-COMPLETION`（Active；当前唯一 Ready）

目标机制/切片：

- `M-036`、`M-040`、`M-044`、`M-049`、`VS-014`

规模预算：

- 主工作包：2（目录直连/升级合同；正式 runtime/装备派生/双 owner/当前存档）
- 预计上下文压缩：0
- 独立验收批次：2

拆分触发：

- 若需修改当前存档字段形状、引入新的被动/丹药持久 owner、恢复 `RoleLevelUpMc` 视觉、修改 HUD/背包显示列表，或进入任务奖励/`Monster111`/无尽/宠物成长，立即拆出同线后续 task；本 task 只闭合已冻结的普通五角色成长。

协作计划：

- 模式：单 agent
- 并行工作包：无
- 写入 owner：主 agent
- 归并检查点：目录直连与纯升级合同通过后，再接正式 runtime
- 方法观测：无

输入资料：

- `docs/reverse-engineering/progression-index.md`、`reference/hero-progression-catalog-1.1.json` 与 Schema。
- `equipment-data-catalog.md`、`combat-hud-index.md`、`save-slots-index.md`、`docs/architecture/src-boundaries.md`。
- `ProgressionSystem.ts`、`Stage1CombatSystem.ts`、`MonsterDefeatRewardSystem.ts`、`EquipmentSystem.ts`、`SaveSystem.ts` 及五关正式 reward/runtime 消费者。

输出产物：

- `ProgressionSystem` 直接消费 172 机器目录，不再手写第二份角色/经验常量。
- 闭合 Role5 AS3 int 防御、7 转换向量、跨级扣余数、89→90 sentinel 和 90 级写入/忽略边界。
- 升级后按当前 player 的基础值+装备/已有持久加成重建有效 HP/MP/攻击/防御并回满；P1/P2 不串 owner。
- 当前 V7 中五角色/P1/P2 `heroId/level/currentExp` 及装备派生往返；旧版/损坏档仍直接拒绝，不增迁移链。

UI 原生化合同：

- 显示列表清单：不适用；本 task 不改 HUD/背包显示对象，只给既有动态字段提供权威数值。
- 原版机器真值 JSON：视觉真值不适用；纯数值直接消费 `hero-progression-catalog-1.1.json`，不滞用 UI Schema。
- 原版视觉基准：不适用；不改纹理、字体、坐标、按钮或布局。
- 允许的现代视觉例外：空；禁止新增可见替代层。
- 逐状态验收：只验证 P1/P2、跨级、满级和装备派生后的既有 HUD/背包数值投影；不宣称新的 UI 视觉闭合。
- 差异证据：数值 snapshot 与目录 JSON Pointer 逐项对比；无可见对象变更时不生成伪视觉差分。

完成定义：

- 1..90 级五角色和共同经验均直接来自 172 目录，Role5 防御、多级、满级和回满/派生顺序与合同一致。
- 普通怪奖励在已完成五关中只更新明确 PlayerSlot；双 owner 的等级、余数、装备派生和 HP/MP 不串号。
- 当前存档双 owner 往返与损坏/旧版拒绝通过；不生成历史迁移或第二成长 owner。
- 任务奖励旁路、宠物成长、`Monster111`、无尽模式和升级特效仍明确排除。

验收标准：

- `npm run test:hero-progression-catalog`，以及五角色全级、7 转换向量、Role5 整数防御、P1/P2、装备派生、HUD snapshot 和 V7 往返专项。
- 五个已完成关卡的 reward/runtime 共享回归、`npm run test:systems`、`npm run build`、`npm run check:structure`、`npm run check:workflow`、`npm run audit:problems` 与 `git diff --check`。
- 940×590 正式 1P/2P 各一条击杀跨级、HUD/背包数值、保存重载旅程，console warning/error 为 0；不更改既有视觉时无需新的原版像素差分。

禁止范围：

- 不改 HUD/背包/升级特效视觉，不新增成长字段第二 owner。
- 不实现任务奖励旁路、宠物成长、`Monster111`/无尽特例，不重建历史存档迁移。
- 不顺手进入 173/174/175 或 Stage 2-3。

状态更新：

- 更新 progression/mechanics/vertical-slices/功能线覆盖/task-board/task-history；根据完成结果恢复同线下一项。

推荐后续任务：

- 成长和存档覆盖闭合后，恢复同线 `TASK-SETTINGS-173`；若命中拆分触发，先生成同线最小解除任务。

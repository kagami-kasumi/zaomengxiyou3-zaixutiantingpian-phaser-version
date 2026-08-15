# TASK-SETTINGS-172

任务类型：

- `TASK-SETTINGS`

功能条线：

- `LINE-CORE-PROGRESSION-COMPLETION`（Active；当前唯一 Ready）

目标机制/切片：

- `M-036`、`M-040`、`M-044`、`M-049`、`M-052`、`VS-014`

规模预算：

- 主工作包：2（五角色基础值/经验/升级公式；运行时派生/owner/存档消费者）
- 预计上下文压缩：0
- 独立验收批次：2

拆分触发：

- 若需读取新的视觉源包、派生升级特效/UI 资源、修改现代成长/存档代码，或发现任务奖励/宠物/Monster111 特例需要独立事实族，立即拆出同线后续 task；本 task 只冻结普通五角色成长实现输入。

协作计划：

- 模式：单 agent
- 并行工作包：无
- 写入 owner：主 agent
- 归并检查点：五角色静态公式闭合后、共享消费者矩阵定稿前
- 方法观测：无

待证明的可观察问题：

- 五角色在 1..90 级的 HP、MP、基础攻击、防御和共同升级经验分别是什么，Role5 的 `1.5` 防御如何进入整数消费者。
- 一次获得跨级经验时的扣除/递归顺序、90 级边界、升级回满 HP/MP 与装备/被动/buff 重算顺序是什么。
- 普通怪死亡、宠物分成、难度倍率、P1/P2 owner、`User.curLevel/curExp` 保存恢复与现有 HUD/背包字段如何连接；哪些特殊旁路明确排除到后续。

输入资料：

- `docs/reverse-engineering/progression-index.md`、`equipment-data-catalog.md`、`combat-hud-index.md`、`save-slots-index.md`。
- 主参考 `User.as`、`BaseHero.as`、`BaseRoleProperies.as`、`Role1.as`..`Role5.as`、`BaseMonster.as` 及真实成长/HUD/save 消费者。

输出产物：

- 更新 `progression-index.md` 的六段证据矩阵，逐项标记确认事实、现代选择、未知与反证条件。
- 可重复生成并校验的五角色成长机器目录及 schema/locator，覆盖等级 1/关键分段/89/90、经验、四基础属性和升级时序；现代实现与测试下一 task 直接消费。
- P1/P2、装备派生、普通怪经验、HP/MP 回满、当前存档 schema 边界和后续统一 schema 输入合同。

原版机器真值 JSON：

- UI/视觉/空间真值不适用：本 task 不改变 UI 几何、按钮或可见资源，只冻结纯数值/时序行为；使用独立成长目录 schema，不滥用 UI ground-truth schema。若调查扩展到升级特效或 HUD 布局，必须按拆分触发另建视觉证据 task。

完成定义：

- 六段证据链闭合五角色共同/差异公式、经验分段、升级递归/回满/重算、整数边界、P1/P2 owner 与保存消费者；影响普通成长实现的未知为零。
- 目录由一手 locator 可重复生成，schema、计数、关键边界和源哈希校验通过；不得从现代测试常量反推原版事实。
- 任务奖励直写、宠物成长、Monster111 异常、无尽模式及 UI 视觉明确分级为后续或排除，不静默补成普通规则。

验收标准：

- 运行成长目录生成器/check、schema/locator 完整性、关键等级/跨级/满级纯合同测试、`npm run check:workflow`、`npm run audit:problems` 与 `git diff --check`。
- 本证据 task 不以现有 `ProgressionSystem` 测试通过替代 AS3 共享调用链，也不宣称现代五角色成长已经实现。

禁止范围：

- 不修改 `src/`、当前存档 schema、HUD/背包视觉、装备目录、关卡经验奖励或 `legacy-extraction` 原始结果。
- 不实现任务奖励旁路、宠物经验、Monster111/无尽模式特例或成长 UI。

状态更新：

- 更新 progression/mechanics/功能线覆盖/task-board/task-history；完成后生成同线五角色成长实现 task。

推荐后续任务：

- 消费本 task 机器目录，实现五角色基础值、升级时序、P1/P2、装备派生和当前 schema 的同线 `TASK-SLICE-*`；如 schema 变更则直接废弃旧档，不生成迁移任务。

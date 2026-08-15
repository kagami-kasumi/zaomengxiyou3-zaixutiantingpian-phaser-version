# TASK-ARCH-010C

任务类型：

- `TASK-ARCH`

功能条线：

- `LINE-MONSTER-ARCH`（Planned；依赖 `TASK-ARCH-010A/010B`）

目标机制/切片：

- `M-030`、`VS-005`、`VS-007`、`VS-056`

规模预算：

- 主工作包：2
- 预计上下文压缩：0
- 独立验收批次：2

拆分触发：

- 若掉落证据扩展到 Monster4/5/6 以外的未实现关卡，或奖励接入要求重写背包/装备事务，立即保留 formal reward profile 接缝并把内容迁移拆成同线下一 task。

协作计划：

- 模式：单 agent
- 并行工作包：无
- 写入 owner：主 agent
- 归并检查点：不适用
- 方法观测：无

输入资料：

- `TASK-ARCH-010A/010B` 的 DefinitionCatalog、RuntimeRegistry 和正式试点结果。
- `monsters-index.md`、Monster4/5/6 对应 AS3、`MonsterDefeatRewardSystem.ts`、`DropSystem.ts`、`Stage1RewardBridge.ts`。
- 复评确认项 M9、M10。

输出产物：

- 让怪物定义只引用 reward/loot profile，正式关卡 reward bridge 将证据化 `configuredItem`/掉落配置传给既有结算 owner。
- 补齐 Monster4/5/6 的已证掉落表；未知掉落保持显式未知/无掉落，`resolveMonsterDropTable` 对缺表有可观察防御而非静默伪造。
- 增加正式五关普通怪/Boss、有/无 configured item、概率边界、重复死亡幂等、背包容量拒绝和 P1/P2 奖励归属回归。

完成定义：

- TestScene 不再是配置装备掉落的唯一有效路径；正式关卡按定义 profile 进入同一个奖励/掉落 owner。
- Monster4/5/6 与缺表行为均可由一手证据和确定性测试复查，不改变未经证明的概率或内容。

验收标准：

- 修改前运行 `npm run check:structure`；怪物奖励/掉落专项、`npm run test:systems`、`npm run build`、`npm run check:workflow`、`npm run audit:problems`、`git diff --check` 通过。
- 代表正式关卡 940×590 验证普通/Boss 死亡、掉落、容量拒绝、通关与重载，console 无 warning/error。

禁止范围：

- 不建立第二个奖励或背包事务 owner，不凭名称猜掉落表。
- 不迁移未列入证据矩阵的后续关卡，不改变怪物 AI、物理、视觉或战斗数值。

状态更新：

- 更新 `LINE-MONSTER-ARCH` 覆盖台账、task-board/task-history、`M-030`、适用切片和怪物索引。

推荐后续任务：

- 依据 010A/010B 试点和本 task 的 reward profile 结果生成同线逐行为族迁移 task。

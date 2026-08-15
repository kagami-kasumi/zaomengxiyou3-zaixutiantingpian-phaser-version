# TASK-SLICE-171B

任务类型：

- `TASK-SLICE`

功能条线：

- `LINE-CORE-PROGRESSION-COMPLETION`（Active；当前唯一 Ready）

目标机制/切片：

- `M-039`、`M-044`、`VS-063`、`VS-064`

规模预算：

- 主工作包：2
- 预计上下文压缩：0
- 独立验收批次：2

拆分触发：

- 若修复需要重写通用物品序列化模型、同时迁移成长字段，或引入第二套存档 owner，立即只保留 V7 迁移与既有实例 round-trip，并把新增 schema 范围拆成同线下一 task。

协作计划：

- 模式：单 agent
- 并行工作包：无
- 写入 owner：主 agent
- 归并检查点：不适用
- 方法观测：无

输入资料：

- `docs/评审/评审-2026-08-13.md` 的复评处置表，确认项 H1、M14、M15。
- `docs/reverse-engineering/crafting-index.md`、`docs/reverse-engineering/equipment-workshop-index.md` 与 171/171A 已归档事务合同。
- `EquipmentCatalog.ts`、`EquipmentMakingSystem.ts`、`CraftingSystem.ts`、`SaveSystem.ts`、`PlayerSoulSystem.ts` 及现有存档/工坊专项。

输出产物：

- 将 `GameSaveVersion` 升至 V7；对 V6 全量 `baseStatsOverride` 快照按装备定义计算五个比例字段的 delta，只把旧分数增量迁移为百分数点，保持既有基础值和新点数档幂等。
- 打造经书继承属性通过既有实例持久化字段保存，确保保存、载入和再次保存不丢失，不把临时 `definition.stats` 当作唯一事实源。
- 对 `soulCount` 建立非负安全整数 sanitize；非法小数、非有限值和越界值不能形成“能载入但不能消费”的永久坏档。
- 增加真实全量装备快照、五比例字段、继承属性、P1/P2、损坏值和 V6→V7→V7 round-trip 专项。

完成定义：

- 旧 V6 打造装备的基础比例值保持不变，旧分数宝石增量正确变为点数；V7 重载不重复放大。
- 经书继承属性在正式保存回合后与制作瞬间一致，且不会污染静态装备目录。
- 所有已接受的灵魂值都满足消费系统的安全整数前置条件；双方 owner 隔离不变。
- 只关闭复评确认的存档回归，不越级宣称成长 schema 或整条功能线完成。

验收标准：

- 修改 `src/` 前运行 `npm run check:structure`；目标文件触发 error 时先拆分。
- 工坊事务、存档迁移、灵魂消费专项覆盖真实全量快照与负向样本；不得沿用只含 `{ critPercent: 0.01 }` 的稀疏伪兼容样本。
- `npm run test:systems`、`npm run build`、`npm run check:workflow`、`npm run audit:problems` 和 `git diff --check` 通过。
- 940×590 正式工坊完成打造/继承、保存、重载、再次保存与 P1/P2 切换，console 无 warning/error。

禁止范围：

- 不提前实现五角色成长，不顺带迁移未冻结的新成长字段。
- 不改变 171/171A 已确认配方、材料、随机或事务结果，不新建存档 owner。
- 不处理复评已否定的 H3、M1、M2、M3、M12、M18。

状态更新：

- 更新 `feature-lines.md`、本线覆盖台账、`task-board.md`、task-history、`M-039/M-044`、`VS-063/064` 与适用 PG 审计记录。

推荐后续任务：

- `TASK-SETTINGS-172`：恢复五角色成长证据冻结；本 task 不提前实现其范围。

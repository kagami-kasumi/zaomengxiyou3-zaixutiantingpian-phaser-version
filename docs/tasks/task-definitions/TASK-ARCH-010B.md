# TASK-ARCH-010B

任务类型：

- `TASK-ARCH`

功能条线：

- `LINE-MONSTER-ARCH`（Planned；待 `TASK-ARCH-010A` 完成且本线获得 WIP）


目标机制/切片：

- `M-030`、`VS-007`、`VS-056`

规模预算：

- 主工作包：2
- 预计上下文压缩：0
- 独立验收批次：2

拆分触发：

- 若试点需要同时迁移第二个正式关卡、引入通用掉落/投射物注册表，或改变关卡视觉 bridge 的资源派生与逐帧合同，立即限制为怪物注册表和单关卡生命周期，并将扩展拆成同线下一 task。

输入资料：

- `TASK-ARCH-010A` 的通用定义/Brain 合同与兼容 facade。
- `PG-013 V2` 已建立并完成五关迁移的 `MonsterRuntimeRegistry`；本 task 消费该 owner，不再创建第二个注册表或重新迁移关卡生命周期。
- `docs/interview/设计模式.md`、`docs/architecture/src-boundaries.md`、`LINE-MONSTER-ARCH` 覆盖台账。
- 一个同时具有普通怪和 Boss、已具备确定性测试与运行验收入口的正式关卡；默认候选为 Stage 2-2，执行前按当前工作树复核。

输出产物：

- 将 `TASK-ARCH-010A` 的 `MonsterDefinitionCatalog`、`MonsterBrain` 与 Targeting 接缝接入既有 `MonsterRuntimeRegistry`，不改变 Registry 的稳定 ID、创建/查询、死亡登记和安全移除合同。
- 选择一个已迁移关卡验证定义/Brain 接缝；Flow 继续只保留生成计划、遭遇进度和通关所需计数/ID，不复制完整怪物状态。
- scene bridge 继续拥有 Phaser view 适配，但不作为生命、AI、死亡或奖励事实源。
- 形成逐关卡迁移清单、风险和拆分建议，不在本 task 批量迁移其他正式关卡。

完成定义：

- 试点关卡怪物生成、更新、死亡、奖励、Boss 显门和销毁继续由 PG-013 的同一稳定 ID 串联，且定义/Brain 不建立第二份运行状态。
- 重复死亡/移除安全幂等，Flow 与 bridge 不再各持一份完整怪物运行状态。
- 注册表保持轻量，不扩张为完整 ECS；本 task 不重新实现 Registry，系统仍通过明确输入/输出测试。
- 普通怪与 Boss 的 1P/2P 可玩行为、真视觉和通关结果无回归。

验收标准：

- 先运行 `npm run check:structure`；目标文件触发 error 时先拆分。
- 注册表确定性测试覆盖重复 ID、查询、死亡/移除幂等、空遭遇、普通怪与 Boss 并存和通关计数。
- 试点关卡专项、`npm run test:systems`、`npm run build`、`npm run check:workflow` 和 `git diff --check` 通过。
- 使用 940×590 正式入口复验 1P/2P 生成、战斗、Boss、失败/胜利、返回与重载，console 无 warning/error。

禁止范围：

- 不把掉落、宠物、投射物和场景物件同时纳入注册表。
- 不改变原版已确认流程、数值、视觉资源、动画时序或攻击几何。
- 不创建第二个 `MonsterRuntimeRegistry`，不重新迁移 PG-013 已闭合的关卡生命周期或 TestScene 兼容路径。

状态更新：

- 更新 `LINE-MONSTER-ARCH` 覆盖台账、试点关卡覆盖台账、相关机制/切片、task-board/task-history 与适用 PG 反馈。

推荐后续任务：

- 依据试点结果生成同线逐关卡迁移 task；每个 task 只迁移一个共享 owner 簇或一个可独立验收的关卡批次。

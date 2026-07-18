# 游戏任务看板

本文只记录未完成的游戏复现 task。完整系统范围和激活状态以 `docs/tasks/feature-lines.md` 为准；task 是功能条线内部执行单位，完成 task 不等于完成功能条线。

AI 工作流、任务体系和文档职责维护记录到 `docs/workflow/governance-log.md`。已完成游戏 task 迁移到 `docs/tasks/task-history.md`；新对话默认不读历史，除非需要追溯或修改已完成事实。

## 状态定义

- `Ready`：属于唯一 `Active` 功能线，依赖满足，可以立即执行。
- `Blocked`：属于唯一 `Active` 功能线，但当前有明确阻塞；下一步只能解除本线阻塞。
- `Planned`：功能线尚未激活或当前不是同线下一步，不得执行。
- `Split`：任务过大，已拆出同功能线子任务，不直接执行。
- `Done`：task 完成定义已满足，应移入历史；所属功能线保持激活，除非其完整关闭合同也满足。

## 当前推荐

当前唯一激活功能线是 `LINE-CRAFTING`，严格单线 `WIP=1`。当前推荐 `TASK-SETTINGS-047`，先建立 112 个权威配方的完整覆盖矩阵并生成同线连续任务。

`TASK-SETTINGS-047` 完成后不得切换到 Stage 1-1，也不得结束 `LINE-CRAFTING`；必须立即选择或生成覆盖矩阵指出的下一个 `LINE-CRAFTING` task。TASK-SETTINGS-046 保留为 `LINE-STAGE-1-1` 的候选任务，只有当前合成线关闭并正式切线后才能进入 `Ready`。

## 待完成任务

| Task | 状态 | 功能条线 | 类型 | 目标 | 目标机制/切片 | 输出 | 下一步 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| TASK-SETTINGS-047 | Ready | LINE-CRAFTING | 资源/内容盘点 | 建立 112 个合成配方的完整覆盖矩阵 | M-039、VS-042、VS-043、VS-044 | `feature-line-coverage/LINE-CRAFTING.md` 的逐项矩阵与同线缺口 task | 生成并推荐优先级最高的同线实现/资源 task，不得切线 |
| TASK-SETTINGS-046 | Planned | LINE-STAGE-1-1 | 资源逆向 | 定位 Stage 1-1 三个场景真资源符号 | M-035、Stage 1-1 资源合同 | `sl11/bg11/floorBg1` 的精确源包、character/tag/尺寸和标注状态 | 等待 LINE-CRAFTING 完整关闭后再激活 |

## 任务完成定义

### TASK-SETTINGS-047

任务类型：

- `TASK-SETTINGS`

功能条线：

- `LINE-CRAFTING`（当前唯一 `Active`）

目标机制/切片：

- `M-039`
- `VS-042`、`VS-043`、`VS-044`

输入资料：

- `docs/tasks/feature-lines.md`
- `docs/tasks/feature-line-coverage/LINE-CRAFTING.md`
- `docs/reverse-engineering/reference/crafting-recipes-1.1.json`
- `docs/reverse-engineering/crafting-index.md`
- `docs/reverse-engineering/crafting-ui-index.md`
- `docs/reverse-engineering/asset-annotation/`
- `local-resources/regima/source/restored-swfs/` 中按配方 fillName 窄查得到的目标源包
- `src/systems/CraftingRecipeRegistry.ts`
- `src/systems/InventorySystem.ts`
- `src/systems/EquipmentSystem.ts`
- `src/assets/AssetManifest.ts`
- 合成专项测试与相关种子数据

输出产物：

- 从权威 JSON 生成 112 个唯一配方逐项覆盖矩阵，至少记录配方类型、三个材料、产物、现代定义、库存类别、获得/验收入口、真图标、UI 展示和测试状态。
- 分别生成材料 fillName 集合、产物 fillName 集合，并与现代定义、manifest、资源标注和测试引用做集合差异检查。
- 在 `LINE-CRAFTING.md` 中把缺口按可连续执行的最小资源族或实现边界分组。
- 根据真实差异在 `task-board.md` 生成一个或多个 `LINE-CRAFTING` 后续 task，并只把优先级最高的同线 task 标为 `Ready` 和当前推荐。

完成定义：

- 112 个配方全部进入逐项矩阵，计数与 67 + 41 + 3 + 1 一致，没有用两个代表配方代替全集。
- 所有材料和产物 fillName 都能在集合差异中找到明确状态；未知或缺失项保留证据和下一动作，不猜造完成。
- 真图标、正式获得/验收入口、正式 UI 可达性和自动测试分别记录，不能合并成单一“已实现”状态。
- 后续 task 的合集覆盖全部已知缺口，且全部关联 `LINE-CRAFTING`。
- 当前推荐仍属于 `LINE-CRAFTING`；不激活 Stage 1-1 或任何其他功能线。

验收标准：

- 对权威 JSON 和现代 registry 运行集合/计数检查，结果写入覆盖台账。
- `npm run check:workflow` 通过。
- 如只修改文档和盘点脚本，不要求浏览器运行；不得宣称 `LINE-CRAFTING` 完成。

禁止范围：

- 不在盘点 task 中顺手接入大批资源或重构合成、背包、装备系统。
- 不删除或降级 `VS-042..044` 的真实完成事实。
- 不把强化、分解、制作自动并入本条线；它们是否形成独立条线留待后续确认。
- 不切换到 `LINE-STAGE-1-1`，遇到盘点阻塞时只生成同线解除阻塞 task。

状态更新：

- `docs/tasks/feature-lines.md`
- `docs/tasks/feature-line-coverage/LINE-CRAFTING.md`
- `docs/tasks/task-board.md`
- `docs/tasks/task-history.md`
- 必要时更新资源标注项目状态，但不伪造资源接入完成。

推荐后续任务：

- 依据覆盖矩阵生成的最高优先级 `LINE-CRAFTING` task；必须同线连续，不预先指定无证据编号。

### TASK-SETTINGS-046

任务类型：

- `TASK-SETTINGS`

功能条线：

- `LINE-STAGE-1-1`（`Planned`，等待当前合成线关闭）

目标机制/切片：

- `M-035`
- Stage 1-1 场景资源合同

输入资料：

- `docs/reverse-engineering/levels-index.md`
- `docs/reverse-engineering/asset-annotation/batches/stage11.md`
- `docs/reverse-engineering/asset-annotation/annotations/stage11.csv`
- `docs/reverse-engineering/asset-annotation/workflow.md`
- `docs/reverse-engineering/evb-extraction-report.md`
- `local-resources/regima/source/restored-swfs/assets/levels/level11.swf`
- 对应 `MainGame.as`、`BaseGameSence.as` 与 `PhysicsWorld.as` 小范围证据

输出产物：

- 窄查 `level11.swf` 的 SymbolClass、tag 和时间轴，分别定位 `export.gameSence.sl11`、`bg11`、`floorBg1` 的精确 character 或明确其嵌套/别名关系。
- 记录三项资源的 tag 类型、尺寸、帧/时间轴结构和选择性派生可行性；只在需要视觉消歧时导出最小候选证据。
- 更新 `levels-index.md`、Stage 1-1 标注 CSV、批次状态和项目汇总；依据实际符号结构生成同线后续 task。

完成定义：

- `stage.stage1-1.layout`、`stage.stage1-1.background`、`stage.stage1.floor` 三条记录各有可复核的精确源符号结论。
- 场景布局、背景与地面之间的嵌套或复用边界明确。
- 所有结论优先来自恢复源包，旧提取集只作 AS3 和历史对照。

验收标准：

- 激活 `LINE-STAGE-1-1` 后才允许执行。
- `npm run check:annotations` 通过。
- `npm run check:workflow` 通过。

禁止范围：

- `LINE-CRAFTING` 未关闭时不得执行本任务。
- 不修改或重新生成恢复 SWF、旧提取结果。
- 不批量导出 `level11.swf` 全包，不顺带处理其他关卡。
- 不在符号未闭合时猜造 stableKey 来源或生成实现任务。

状态更新：

- `docs/tasks/feature-lines.md`
- `docs/tasks/task-board.md`
- `docs/tasks/task-history.md`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/reverse-engineering/asset-annotation/` 对应批次与项目状态

推荐后续任务：

- 激活后依据三项符号的实际派生成本，生成一个 `LINE-STAGE-1-1` 同线真资源接入 task。

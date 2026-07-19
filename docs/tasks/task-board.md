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

当前唯一激活功能线是 `LINE-STAGE-1-1`，严格单线 `WIP=1`。上一项资源逆向已闭合 `sl11/bg11/floorBg1` 的恢复源包、character、tag、尺寸、时间轴和运行时组合关系。当前推荐 `TASK-SLICE-123`。

## 待完成任务

| Task | 状态 | 功能条线 | 类型 | 目标 | 目标机制/切片 | 输出 | 下一步 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| TASK-SLICE-123 | Ready | LINE-STAGE-1-1 | 资源接入 | 选择性派生并接入 Stage 1-1 真场景资源与布局数据 | M-026、M-027、M-035、VS-007 | 真背景/地面/前景、布局 provenance、manifest 与可验证场景组合 | 按 character 46/141/1 选择性派生并接入 |

## 任务完成定义

### TASK-SLICE-123

任务类型：

- `TASK-SLICE`

功能条线：

- `LINE-STAGE-1-1`（当前唯一 `Active`）

目标机制/切片：

- `M-026`
- `M-027`
- `M-035`
- `VS-007`

输入资料：

- `docs/architecture/src-boundaries.md`
- `docs/reverse-engineering/levels-index.md`
- `docs/reverse-engineering/asset-annotation/batches/stage11.md`
- `docs/reverse-engineering/asset-annotation/annotations/stage11.csv`
- `local-resources/regima/source/restored-swfs/assets/levels/level11.swf`
- `local-resources/regima/source/restored-swfs/assets/1.swf`
- `local-resources/regima/task-outputs/task-settings-046-stage11/`
- `src/assets/AssetManifest.ts`、`src/systems/LevelSystem.ts` 与 Stage 1-1 场景桥接文件

输出产物：

- 只从 `level11.swf` character 46 与 `assets/1.swf` character 141/1 选择性派生 Stage 1-1 所需的前景、背景、地面和布局数据；保留可复核的 sourcePackage、character、tag 与转换记录。
- 将真资源复制/转换到现代资源目录，注册稳定 key 和 provenance，并更新预加载与场景组合，使地面、布局和动态背景保持原版运行时层级边界。
- 把 `sl11` 的 20 个墙体标记和 1 个 transfer door 转为显式布局数据；不得把调试标记烘焙进玩家可见背景。
- 提供自动结束的资源合同或场景专项测试，证明尺寸、关键 marker 数量、manifest 路径和场景实例化成立。

完成定义：

- Stage 1-1 真背景、地面和前景均由精确 character 选择性派生，现代 manifest 具备稳定 key、尺寸和来源追溯。
- 现代布局数据覆盖 `sl11` 的 3 个 `ObsWall`、15 个 `ThroughWall`、1 个 `ThroughUpButDownWall`、1 个 `FallDownWhenStandingWall` 和 1 个 transfer door。
- 现代场景可加载三项真资源并按“根节点地面 → 场景布局 → `bgContainer` 背景”的原版组合边界呈现；现有 VS-007 玩法闭环不得退化。

验收标准：

- 修改现有代码前先运行 `npm run check:structure`，目标文件不得触发 error；warning 目标优先拆分。
- 资源/布局专项测试通过。
- `npm run test:systems` 通过。
- `npm run build` 通过。
- `npm run check:annotations` 通过。
- `npm run check:workflow` 通过。

禁止范围：

- 不修改或重新生成恢复 SWF、旧提取结果，不整包导出两个 SWF。
- 不顺带接入 Monster3、Monster30 或其弹体真素材；本 task 只处理 Stage 1-1 场景资源合同。
- 不用单张截图替代布局 marker 数据，不把碰撞标记作为可见美术烘焙。
- 不回开 `LINE-CRAFTING`，不切换功能线。

状态更新：

- `docs/tasks/feature-lines.md`
- `docs/tasks/task-board.md`
- `docs/tasks/task-history.md`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/reverse-engineering/asset-annotation/` 对应批次与项目状态

推荐后续任务：

- 完成后依据真场景运行时证据，生成同线 Stage 1-1 流程/敌人真资源校准 task；不得推荐其他系统。

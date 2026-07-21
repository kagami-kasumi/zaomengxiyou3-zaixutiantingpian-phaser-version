# 游戏任务看板

本文只记录未完成的游戏复现 task。完整系统范围和激活状态以 `docs/tasks/feature-lines.md` 为准；task 是功能条线内部执行单位，完成 task 不等于完成功能条线。

## 当前推荐

`TASK-SETTINGS-053` 是唯一当前推荐，属于唯一 `Active` 功能线 `LINE-STAGE-2-1`。本次只登记后续入口；Stage 2-1 必须从恢复源包和共享 AS3 证据开始，不从 Stage 1 猜测。

## 待完成任务

| Task | 状态 | 功能条线 | 类型 | 目标 | 目标机制/切片 | 输出 | 下一步 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| TASK-SETTINGS-053 | Ready | LINE-STAGE-2-1 | 关卡逆向 | 闭合 Stage 2-1 真场景、地图标记、怪物/专属机制和结果流程 | M-026、M-027、M-030、M-035、M-044、VS-049 | 六段证据矩阵、资源标注、覆盖台账与最小可玩切片任务 | 证据闭合后生成同线实现 task |

## 任务完成定义

### TASK-SETTINGS-053

任务类型：

- `TASK-SETTINGS`

功能条线：

- `LINE-STAGE-2-1`（当前唯一 `Active`）

目标机制/切片：

- `M-026`
- `M-027`
- `M-030`
- `M-035`
- `M-044`
- `VS-049`

输入资料：

- `local-resources/regima/source/restored-swfs/` 中与 Stage 2-1 对应的窄源包、SymbolClass 和 MovieClip。
- 对应局部 AS3、共享关卡/物理/镜头/刷怪/结果调用链，以及 `docs/workflow/reverse-engineering-protocol.md`。
- `docs/reverse-engineering/levels-index.md`、`mechanics-index.md` 和本线覆盖台账。

输出产物：

- 按六段证据链记录局部配置、共享消费者、SWF 几何/坐标、行为合同、现代映射和双重验证计划。
- 定位真场景资源族并新增/更新资源标注；区分确认事实、推断、未知和现代设计选择。
- 清零影响首切片的未知项后，生成一个同线最小可玩实现 task；若证据缺失则明确阻塞，不补成原版事实。

完成定义：

- Stage 2-1 的场景符号、地图标记、波次/怪物、专属机制、进入/失败/胜利/解锁边界均有可追溯证据或明确未知。
- 视觉/空间结论包含矩阵、注册点、边界和坐标语义；行为结论追踪到共享运行时消费者。
- 覆盖台账和 `VS-049` 可据此生成不扩张范围的可玩切片任务。

验收标准：

- `npm run check:workflow`、`npm run check:annotations` 与 `git diff --check` 通过。
- 六段证据矩阵满足逆向协议；影响实现的推断/未知未清零时不得标记闭合。

禁止范围：

- 不修改或重新生成恢复源包与 `local-resources/regima/legacy-extraction/` 原始提取结果。
- 不提前修改 `src/`，不从 Stage 1 外推 Stage 2-1 的布局、波次、boss、视觉或流程。
- 不推进其他功能线。

状态更新：

- `docs/tasks/feature-lines.md`
- `docs/tasks/feature-line-coverage/LINE-STAGE-2-1.md`
- `docs/tasks/task-board.md`
- `docs/tasks/task-history.md`（完成时）
- `docs/reverse-engineering/levels-index.md`
- `docs/reverse-engineering/mechanics-index.md`
- Stage 2-1 资源标注批次

推荐后续任务：

- 仅在证据闭合后生成 `LINE-STAGE-2-1` 的最小可玩实现 task。

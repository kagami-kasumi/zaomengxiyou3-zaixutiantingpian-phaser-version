# 游戏任务看板

本文只记录未完成的游戏复现 task。完整系统范围和激活状态以 `docs/tasks/feature-lines.md` 为准；一次 `/goal` 的边界以 `docs/tasks/goal-board.md` 为准；task 是最小验收单位。完成 task 或 Goal 都不等于完成功能条线。

## 当前推荐

`TASK-SETTINGS-064` 是唯一当前推荐，属于唯一 `Active` Goal `GOAL-025` 和 `LINE-STAGE-2-3`。下一次 `/goal` 只逆向 Stage 2-3 六段证据并据证据拆分后续实现，不写现代代码。

## 待完成任务

| Task | 状态 | Goal | 功能条线 | 类型 | 目标 | 目标机制/切片 | 输出 | 下一步 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| TASK-SETTINGS-064 | Ready | GOAL-025 | LINE-STAGE-2-3 | 关卡/玩法逆向 | 闭合 Stage 2-3 真场景、流程、怪物/机关、结果与存档六段证据 | M-026、M-027、M-030、M-035、M-044、VS-057 | 权威证据矩阵、资源标注、未知/反证与有界实现 Goal | 依据证据生成同线最小实现 Goal |

## 任务完成定义

### TASK-SETTINGS-064

任务类型：

- `TASK-SETTINGS`

功能条线：

- `LINE-STAGE-2-3`（Active）

Goal 包：

- `GOAL-025`（Active）

目标机制/切片：

- `M-026`、`M-027`、`M-030`、`M-035`、`M-044`、`VS-057`

规模预算：

- 主工作包：2
- 预计上下文压缩：0
- 独立验收批次：2

拆分触发：

- 若目标关卡还要求独立闭合两个以上未恢复资源族、跨入 `level231/232/233` 支线，或六段证据无法在一个关卡主包内清零影响实现的未知，立即拆成同线后续逆向 Goal；本 Goal 不写现代实现。

输入资料：

- `docs/workflow/reverse-engineering-protocol.md`、`docs/reverse-engineering/levels-index.md`、Stage 2-3 覆盖台账。
- `local-resources/regima/source/restored-swfs/assets/levels/level23.swf` 及实际加载到的恢复源共享包；视觉资源存在性以恢复语料库为准。
- `local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts/export/level/StageListener23.as` 与沿调用链窄查到的共享 AS3；legacy extraction 只读。

输出产物：

- 在 `levels-index.md` 建立 Stage 2-3 最小证据矩阵：局部类/实例、共享输入/物理/镜头/状态机/结果/存档、SWF 时间轴/注册点/碰撞盒/矩阵/坐标空间、可观察合同、现代 owner 建议和双重验证计划。
- 在恢复源包中定位场景、机关、怪物、弹体、门与结果所需 SymbolClass/MovieClip，选择性派生到 Git 忽略 task output，并更新独立 asset annotation batch；未知、推断、现代设计选择和反证条件必须显式分级。
- 根据证据把实现拆成一至多个同线 0-compact Goal/task；不得把新资料族逆向、多个 owner 实现和端到端校准重新合并。

完成定义：

- 待证明问题逐项回答：目标关卡身份与进入路由、显示列表/布局、墙/平台/停点/刷怪点、专属机关、怪物与攻击对象、失败/胜利、下一关解锁与当前槽保存。
- 六段证据矩阵完整，所有影响首个实现切片的未知为零；若不能清零则只归档已定位边界并生成同线补证 Goal，不使用“已扒/权威输入”。
- 只产出逆向证据、资源标注和后续任务，不修改 `src/`，不进入 Stage 2-3 实现或 940×590 现代运行验收。

验收标准：

- 恢复源 SWF 与 legacy AS3 交叉确认；视觉/空间结论包含注册点、嵌套矩阵、碰撞边界、坐标语义和现代素材原点。
- 关键结论按确认事实/交叉确认/推断/未知/现代设计选择分级，并列出反证条件；高风险视觉/时序至少达到交叉确认。
- `npm run check:annotations`、`npm run check:workflow` 与 `git diff --check` 通过；新后续 Goal 满足规模预算门禁。

禁止范围：

- 不修改、删除或重新生成 `local-resources/regima/legacy-extraction/`。
- 不因名称相近而把 `level231/232/233.swf` 或 Stage 23-x 支线自动并入主 Stage 2-3。
- 不写现代关卡代码，不用 Stage 2-2 规则类推缺失常量，不把局部关卡类当作完整调用链。

状态更新：

- 更新 `levels-index.md`、`mechanics-index.md`、`vertical-slices.md`、Stage 2-3 覆盖台账、资源标注、Goal/task/history 与适用 PG 反馈。

推荐后续任务：

- 依据闭合证据生成同线最小实现 Goal；若证据未闭合，生成同线最小补证 Goal。

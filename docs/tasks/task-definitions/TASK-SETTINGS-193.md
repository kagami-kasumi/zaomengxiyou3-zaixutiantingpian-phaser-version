# TASK-SETTINGS-193

任务类型：
- `TASK-SETTINGS`

功能条线：
- `LINE-PRE-STAGE-2-3-PRESENTATION`（Active；Planned）

目标机制/切片：
- `M-034`、`M-035`、`M-042`、`VS-067`

规模预算：
- 主工作包：2
- 预计上下文压缩：0
- 独立验收批次：2

拆分触发：
- 本 task 只做 corpus/资源 owner/批次分区；一旦开始对某物种深追全时间轴或派生现代资源，立即停止并生成“单恢复源资源族证据 task -> 对应实现 task”。

协作计划：
- 模式：单 agent
- 并行工作包：无
- 写入 owner：主 agent
- 归并检查点：不适用
- 方法观测：无

输入资料：
- `reverse-engineering-protocol.md`、`pets-index.md`、`projectiles-index.md`、当前 pet systems/bridges/assets 和已记录占位 key。
- `local-resources/regima/source/restored-swfs/` 中按物种、SymbolClass、MovieClip 与原始命名 SWF 窄查的宠物本体/技能包；legacy 只用于 AS3/历史对照。

输出产物：
- 九物种及实际形态的“物种/形态/本体动作/技能对象 -> 恢复源包/SymbolClass/MovieClip -> 现代 key/占位/缺失” corpus 矩阵。
- 按单一恢复源资源族冻结的执行顺序；每族必须生成一个 0-compact `TASK-SETTINGS` 证据 task 和紧随的 `TASK-SLICE` 实现 task，全部插入 194 前。
- 每族子 task 的时间轴、注册点/矩阵、帧时序/持帧、行为触发/销毁、机器真值和双重验证模板。

完成定义：
- corpus 中每个已支持宠物都有恢复源定位或明确“未定位”反证，且不把占位 projectile 写成真视觉；实现顺序已拆成可执行子 task。
- 本 task 不标记任一物种视觉“已闭合”，不修改 `src/` 或派生帧。

验收标准：
- corpus 与 `pets-index.md`/当前 AssetManifest 双向对账；无重复 owner、无未分批的恢复源族；annotations、workflow、diff check 通过，所有新子 task 满足 UI/视觉真值和规模门禁。

禁止范围：
- 不修改/ 重生成 legacy extraction，不用旧提取结果单独判定恢复源缺失；不一次全量派生或接入九物种。

状态更新：
- 更新 `pets-index.md`、资源标注、`mechanics-index.md`、`vertical-slices.md`、本线台账、task-board/history 并插入生成的同线子 task。

推荐后续任务：
- 执行本 task 生成的第一个宠物资源族证据 task；所有族完成后才进入 `TASK-SLICE-194`。

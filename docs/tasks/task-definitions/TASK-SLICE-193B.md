# TASK-SLICE-193B

任务类型：
- `TASK-SLICE`

功能条线：
- `LINE-PRE-STAGE-2-3-PRESENTATION`（Active；Planned）

目标机制/切片：
- `M-034`、`M-035`、`M-042`、`VS-067`

规模预算：
- 主工作包：2
- 预计上下文压缩：0
- 独立验收批次：2

拆分触发：
- 一旦需要改变 猴系 玩法数值、AI、owner、当前存档，或触及其他物种，立即停止并拆分。

协作计划：
- 模式：单 agent
- 并行工作包：无
- 写入 owner：主 agent
- 归并检查点：不适用
- 方法观测：无

输入资料：
- `TASK-SETTINGS-193A` verified 真值/原版基准、pet animation corpus、当前 PetRuntime/Projectile/asset bundle 消费链。

输出产物：
- 从 `assets/pet1.swf`、`assets/20120203.swf` 选择性派生并注册 monkey1..4 本体 atlas 与 xj/lj/lyq/jgaoyi 对象。
- 运行时直接消费真值的动作 clock、转移、注册点、触发/销毁映射；删除 猴系 几何本体和技能占位/未渲染分支。

完成定义：
- P1/P2 五关共享 Runtime 同源消费，全部适用动作与对象逐状态符合真值，猴系 范围无占位且不建立第二业务 owner。

验收标准：
- 物种专项、全系统、build、structure、annotations、workflow、problem audit、940×590 原版/现代对照和 console 零 warning/error 通过。

禁止范围：
- 不修改玩法数值、当前 schema 或其他物种；不从整页截图制作可见资源。

状态更新：
- 归档本 task，并仅激活 `TASK-SETTINGS-193C`。

推荐后续任务：
- `TASK-SETTINGS-193C`。


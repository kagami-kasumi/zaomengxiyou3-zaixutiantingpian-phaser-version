# TASK-ARCH-204D

任务类型：
- `TASK-ARCH`

任务模型：
- `常规任务`

逆向子类型：
- 不适用

逆向方案：
- 不适用

功能条线：
- `LINE-PRE-STAGE-2-3-PRESENTATION`（Active；Planned）

目标机制/切片：
- `M-032`、`M-034`、`M-042`、`VS-012`、`VS-067`

关联具体系统设计：
- `docs/architecture/system-designs/pet.md`（当前有效；验收未退出）

本批设计验收 gate：
- `P1D`

规模预算：
- 主工作包：2
- 预计上下文压缩：0
- 独立验收批次：2

拆分触发：
- 一旦进入 Scene/正式消费者、视觉资源、新玩法或超出 Tiger/Phoenix/Rabbit/Mouse 既有规则，立即停止并留给 204E..G。

协作计划：
- 模式：单 agent
- 并行工作包：无
- 写入 owner：主 agent
- 归并检查点：实现前
- 方法观测：无

输入资料：
- 204B/C 稳定合同、四族既有纯技能系统、205 覆写矩阵和专项测试。

输出产物：
- Tiger/Phoenix/Rabbit/Mouse 全形态 Behavior、35 形态 Registry 全面性与私有清理合同。

完成定义：
- 九物种 35 形态均由默认 Registry 唯一解析，`pet P1D=0`。

验收标准：
- `pet P1D=0`；专项、全系统、build、structure/workflow/problem audit、LSP、diff check 通过；`pet all` 仍为 1。

禁止范围：
- 不迁移消费者，不修改视觉真值、资源、数值、roster 或存档。

状态更新：
- 归档本 task，仅激活 `TASK-ARCH-204E`。

推荐后续任务：
- `TASK-ARCH-204E`。

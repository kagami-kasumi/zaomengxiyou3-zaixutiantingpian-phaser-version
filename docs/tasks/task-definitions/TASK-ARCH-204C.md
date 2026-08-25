# TASK-ARCH-204C

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
- 一旦进入 Scene/正式消费者、视觉资源、新玩法或超过既有 Tiger/Phoenix/Rabbit/Mouse skill systems，立即停止并留给 204D..F 或另行同线拆分。

协作计划：
- 模式：单 agent
- 并行工作包：无
- 写入 owner：主 agent
- 归并检查点：实现前
- 方法观测：无

输入资料：
- 204A/B 稳定 Runtime/Registry；`PetTiger/Phoenix/Rabbit/MouseSkillSystem`、priority/tick/projectile 接缝及既有专项。

输出产物：
- Tiger/Phoenix/Rabbit/Mouse 全当前形态 Behavior、35 形态 Registry 全面性断言和 `P1D` 门禁。

完成定义：
- 九物种全部当前形态均由默认 Registry 唯一解析，具体 Behavior 不复制公共 Runtime，`pet P1D=0`。

验收标准：
- `npm run check:system-design -- pet P1D`=0；专项、全系统、build、structure/workflow/problem audit、LSP、diff check 通过；`pet all` 仍预期为 1。

禁止范围：
- 不迁移消费者，不修改视觉真值、资源、数值、roster 或存档。

状态更新：
- 归档本 task，更新 pet 设计批次记录，仅激活 `TASK-ARCH-204D`。

推荐后续任务：
- `TASK-ARCH-204D`。

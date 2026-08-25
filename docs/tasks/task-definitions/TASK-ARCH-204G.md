# TASK-ARCH-204G

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
- `P4`、`all`

规模预算：
- 主工作包：2
- 预计上下文压缩：0
- 独立验收批次：2

拆分触发：
- 一旦 all 失败来自未声明消费者、新 owner 或新玩法/视觉证据，立即停止并生成同线解除 task，不得用人工结论覆盖。

协作计划：
- 模式：单 agent
- 并行工作包：无
- 写入 owner：主 agent
- 归并检查点：验收前
- 方法观测：无

输入资料：
- 204B..F 产物、PetSystem barrel、旧 PetRuntimeSystem、全部 Scene/Bridge 直接请求与重复 targeting 搜索、pet 设计剩余清单。

输出产物：
- 删除旧 Runtime、barrel 具体技能出口、Scene 直调/分发和重复 targeting；完整正式回归与验收退出记录。

完成定义：
- `pet P4=0`、`pet all=0`，消费者/旧入口/兼容层清零，设计同批标记已完成/已退出。

验收标准：
- 两个声明 gate 为 0；全系统、正式宠物/旅程、build、structure/workflow/problem audit、LSP、diff check 通过。

禁止范围：
- 不修改 UI/动画真值、资源、玩法数值、roster 或存档；不得保留临时第二分发入口。

状态更新：
- 归档 204G 与 Split 父任务 204，退出 pet 设计验收，仅激活 `TASK-SETTINGS-193E`。

推荐后续任务：
- `TASK-SETTINGS-193E`：使用 `$pet-family-reverse` 执行 UFO 单族视觉真值。

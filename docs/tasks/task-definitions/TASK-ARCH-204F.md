# TASK-ARCH-204F

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
- 一旦 `all` 失败来自未声明的新消费者或需要新的玩法/视觉证据，立即停止并生成同线解除 task，不得用人工结论覆盖。

协作计划：
- 模式：单 agent
- 并行工作包：无
- 写入 owner：主 agent
- 归并检查点：验收前
- 方法观测：无

输入资料：
- 204A..E 产物、`PetSystem` barrel、旧 `PetRuntimeSystem`、全部 Scene/Bridge 直接请求搜索和 pet 设计剩余清单。

输出产物：
- 删除旧 Runtime 文件、barrel 具体技能出口和 Scene 直调/分发；迁移遗漏静态门禁与完整正式回归。

完成定义：
- `pet P4=0` 且 `pet all=0`；剩余消费者/旧入口/兼容层清零；设计同批标记 `已完成/已退出`；完整宠物战斗公共类交付成立。

验收标准：
- `npm run check:system-design -- pet P4`=0、`npm run check:system-design -- pet all`=0；全系统、正式宠物/旅程、build、structure/workflow/problem audit、LSP、diff check 通过。

禁止范围：
- 不修改 UI/动画真值、资源、玩法数值、roster 或存档；不得保留“临时”第二分发入口。

状态更新：
- 归档 204F 与 Split 父任务 204，关闭 pet 设计验收并退出；仅激活强制 Skill 的 `TASK-SETTINGS-193E`。

推荐后续任务：
- `TASK-SETTINGS-193E`：使用 `$pet-family-reverse` 执行 UFO 单族视觉真值。

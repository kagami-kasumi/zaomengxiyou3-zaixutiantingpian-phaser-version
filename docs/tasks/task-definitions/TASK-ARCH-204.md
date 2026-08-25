# TASK-ARCH-204

任务类型：
- `TASK-ARCH`

任务模型：
- `常规任务`

逆向子类型：
- 不适用

逆向方案：
- 不适用

功能条线：
- `LINE-PRE-STAGE-2-3-PRESENTATION`（Active；Split）

目标机制/切片：
- `M-032`、`M-034`、`M-042`、`VS-012`、`VS-067`

关联具体系统设计：
- `docs/architecture/system-designs/pet.md`（当前有效；验收未退出）

本批设计验收 gate：
- 父任务不执行；由 204A..F 依次完成 `P1B/P1C/P1D/P2/P3/P4/all`

规模预算：
- 主工作包：0
- 预计上下文压缩：0
- 独立验收批次：0

拆分触发：
- 已触发：具体 Behavior 全集、TestScene、正式五关和旧入口清零具有独立验收边界，必须拆为 204A..F，不允许合并成一次 `/goal`。

协作计划：
- 模式：单 agent
- 并行工作包：无
- 写入 owner：主 agent
- 归并检查点：各子 task 验收前
- 方法观测：无

输入资料：
- `docs/architecture/system-designs/pet.md`、203 的 P1 实现与当前 `pet all` 失败清单。

输出产物：
- 204A..F 的连续实现、迁移、清理和验收结果。

完成定义：
- 204A..F 全部归档，`npm run check:system-design -- pet all` 返回 0，宠物设计标记 `已完成/已退出`；在此之前父任务保持 Split。

验收标准：
- 以 204F 的 `pet all=0`、全系统/build、正式 P1/P2 旅程和旧路径清零为唯一技术完成证据。

禁止范围：
- 不修改 UI/动画真值或资源，不执行 193E，不改宠物玩法数值、roster 或存档结构，不改成深继承万能 `BasePet`。

状态更新：
- 各子 task 逐个归档；204F 完成时收束父任务并仅激活 `TASK-SETTINGS-193E`。

推荐后续任务：
- `TASK-ARCH-204A`。

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
- 父任务不执行；204A 已完成旧方案 `P1B`，205 与现代设计裁决将决定保留或重写剩余 `P1C/P1D/P2/P3/P4/all` 门禁

规模预算：
- 主工作包：0
- 预计上下文压缩：0
- 独立验收批次：0

拆分触发：
- 已触发：205/206 证明旧 P1/P1B 必须先校正；现重拆为 204B 公共 Runtime+猴马、204C 三族、204D 四族、204E TestScene、204F 正式消费者、204G 清理退出。

协作计划：
- 模式：单 agent
- 并行工作包：无
- 写入 owner：主 agent
- 归并检查点：各子 task 验收前
- 方法观测：无

输入资料：
- `docs/architecture/system-designs/pet.md`、203/204A 实现、当前 `pet all` 失败清单，以及 205 待产出的 `pet-base-class.md` 与后续现代设计裁决。

输出产物：
- 205 的原版基类专项证据、后续现代设计裁决，以及经裁决保留或重排后的 204 剩余实现、迁移、清理和验收结果。

完成定义：
- 205、现代设计裁决及其保留/重排后的全部实现 task 均归档，`npm run check:system-design -- pet all` 按届时当前有效设计返回 0，宠物设计标记 `已完成/已退出`；在此之前父任务保持 Split。

验收标准：
- 以裁决后最终迁移 task 的 `pet all=0`、全系统/build、正式 P1/P2 旅程和旧路径清零为唯一技术完成证据。

禁止范围：
- 不修改 UI/动画真值或资源，不执行 193E，不改宠物玩法数值、roster 或存档结构；205/设计裁决完成前不继续 204B，也不预设改成深继承万能 `BasePet`。

状态更新：
- `TASK-SETTINGS-205/TASK-ARCH-206` 已完成；当前按唯一 `pet.md` 串行执行 204B..G，最终迁移 task 完成时收束父任务并仅激活 `TASK-SETTINGS-193E`。

推荐后续任务：
- `TASK-ARCH-204B`。

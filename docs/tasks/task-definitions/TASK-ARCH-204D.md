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
- `P2`

规模预算：
- 主工作包：2
- 预计上下文压缩：0
- 独立验收批次：2

拆分触发：
- 一旦进入正式五关、功能页同步、旧 Runtime/barrel 删除或视觉资源，立即停止并留给 204E/F。

协作计划：
- 模式：单 agent
- 并行工作包：无
- 写入 owner：主 agent
- 归并检查点：实现前
- 方法观测：无

输入资料：
- 204A..C 默认 Registry/Behavior；`TestScenePetMagicBridge`、`TestSceneAdvancedPetSkillBridge`、`TestSceneP2PetBridge` 和双 owner 专项。

输出产物：
- 三个 TestScene P1/P2 消费者只提交 `PetCombatFrame`、消费 snapshot/event，不再直接请求具体技能或按 species/form 分发。

完成定义：
- TestScene 双人/高级技能经同一 Runtime API，具体技能直调和第二分支为零，`pet P2=0`。

验收标准：
- `npm run check:system-design -- pet P2`=0；宠物 P1/P2 专项、全系统、build、structure/workflow/problem audit、LSP、diff check 通过。

禁止范围：
- 不迁移正式五关，不删除旧 Runtime/barrel，不修改 UI/动画/数值/存档。

状态更新：
- 归档本 task，更新 pet 设计批次记录，仅激活 `TASK-ARCH-204E`。

推荐后续任务：
- `TASK-ARCH-204E`。

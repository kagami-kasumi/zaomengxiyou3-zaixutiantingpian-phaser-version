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
- `P3`

规模预算：
- 主工作包：2
- 预计上下文压缩：0
- 独立验收批次：2

拆分触发：
- 一旦需要新玩法/视觉证据、改存档 schema、删除旧出口或发现未声明正式 owner，立即停止并拆同线解除 task。

协作计划：
- 模式：单 agent
- 并行工作包：无
- 写入 owner：主 agent
- 归并检查点：实现前
- 方法观测：无

输入资料：
- 204B..E Runtime/Registry、HeroPartyRuntimeBridge、五关消费者、正式 BodyBridge、FormalPetRuntimeBridge 和正式宠物旅程。

输出产物：
- 五关 P1/P2 共享正式宠物 Runtime 桥；功能页换宠通知同一生命周期 owner；View 只消费命令并回传 typed animation events。

完成定义：
- 五关与功能页同步均经 `PetCombatRuntime`，旧 BodyBridge 不再拥有战斗时钟/生命周期，`pet P3=0`。

验收标准：
- `pet P3=0`；正式宠物/旅程、五关双人、全系统、build、structure/workflow/problem audit、LSP、diff check 与适用运行检查通过。

禁止范围：
- 不修改视觉真值/资源/玩法数值/roster/存档，不删除 P4 旧出口。

状态更新：
- 归档本 task，仅激活 `TASK-ARCH-204G`。

推荐后续任务：
- `TASK-ARCH-204G`。

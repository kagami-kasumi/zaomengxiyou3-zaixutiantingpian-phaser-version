# TASK-SLICE-173A2

任务类型：

- `TASK-SLICE`

功能条线：

- `LINE-CORE-PROGRESSION-COMPLETION`（Active；当前唯一 Ready）

目标机制/切片：

- `M-018`、`M-034`、`VS-062`

规模预算：

- 主工作包：1
- 预计上下文压缩：0
- 独立验收批次：1

拆分触发：

- 若接入要求重写通用英雄生命周期、迁移其他角色技能或补做 173 未冻结的行为，立即停止并生成同线后续 task。

协作计划：

- 模式：单 agent
- 并行工作包：无
- 写入 owner：主 agent
- 归并检查点：不适用
- 方法观测：无

输入资料：

- `TASK-SLICE-173A3` 已验收闭合的影分身模型、共享视觉投射/桥和 verified manifest。
- `HeroPartyRuntimeSystem.ts`、`HeroPartyRuntimeBridge.ts`、正式五关共享 Runtime 与怪物目标结算桥。

输出产物：

- 将 Role1 影分身接入正式英雄 Runtime 的输入、目标、弹体、视觉与销毁生命周期；保持共享 Runtime 为唯一 owner。
- 覆盖 P1/P2 独立 source identity、创建/攻击/朝向/固定位置、销毁/重入，以及五个正式关卡的代表路径。

完成定义：

- 正式关卡可观察到与 173/173A1 合同一致的影分身；主角色与分身状态不双持，TestScene 不成为正式行为事实源。
- hit1/hit2 只有证据支持的输入路径可达；manifest 继续被正式投射或测试直接消费。

验收标准：

- 先运行 `npm run check:structure`；专项、`npm run test:systems`、`npm run build`、`npm run check:workflow`、`npm run audit:problems`、`git diff --check` 通过。
- 940×590 正式 1P/2P 代表关卡逐状态对照 verified 基准，五关加载/重入通过，console 无 warning/error。

禁止范围：

- 不修改 Role2-5，不重写英雄 Runtime，不用猜测动作填补证据未知。

状态更新：

- 完成后归档 173A2 与 Split 父任务 173A，更新本线覆盖台账、task-board/task-history、`M-018/M-034`、`VS-062` 与视觉证据。

推荐后续任务：

- 恢复本线按覆盖台账尚未关闭的成长、存档、五入口或 UI 差异任务。

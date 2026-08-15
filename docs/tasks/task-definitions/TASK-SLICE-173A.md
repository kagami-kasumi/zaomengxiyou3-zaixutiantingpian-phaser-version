# TASK-SLICE-173A

任务类型：

- `TASK-SLICE`

功能条线：

- `LINE-CORE-PROGRESSION-COMPLETION`（Active；Planned，依赖 `TASK-SETTINGS-173`）

目标机制/切片：

- `M-018`、`M-034`、`VS-062`

规模预算：

- 主工作包：1
- 预计上下文压缩：0
- 独立验收批次：2

拆分触发：

- 若正式接入要求改写通用英雄生命周期、补做未在 173 冻结的新技能，或迁移第二个角色，立即停止并生成同线下一 task。

协作计划：

- 模式：单 agent
- 并行工作包：无
- 写入 owner：主 agent
- 归并检查点：不适用
- 方法观测：无

输入资料：

- `TASK-SETTINGS-173` 的 verified 真值、差异矩阵和实现合同。
- `HeroPartyRuntimeBridge.ts`、Role1 视觉/技能 owner、TestScene 兼容 bridge 与正式五关 Runtime。

输出产物：

- 将 Role1 影分身以稳定 identity 和证据化 action/timing 接入正式英雄 Runtime；TestScene 仅保留薄 QA 适配，不成为行为事实源。
- 增加创建、攻击动作、朝向、跟随/位置、销毁、重入、1P/2P 与五关代表路径回归。

完成定义：

- 正式关卡可观察到与 173 合同一致的影分身，主角色与分身状态不双持，hit1/hit2 只在证据支持时可达。
- 真值 manifest 直接被实现或测试消费；无现代可见替代层。

验收标准：

- 先运行 `npm run check:structure`；专项、`npm run test:systems`、`npm run build`、`npm run check:workflow`、`npm run audit:problems`、`git diff --check` 通过。
- 940×590 正式 1P/2P 代表关卡逐状态对照 verified 基准，console 无 warning/error。

禁止范围：

- 不修改 Role2-5，不重写英雄 Runtime，不用猜测动作填补证据未知。

状态更新：

- 更新本线覆盖台账、task-board/task-history、`M-018/M-034`、`VS-062` 与适用视觉证据。

推荐后续任务：

- 恢复本线按覆盖台账尚未关闭的成长、存档、五入口或 UI 差异任务。

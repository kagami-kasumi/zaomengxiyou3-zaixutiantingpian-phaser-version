# TASK-SLICE-192B

任务类型：
- `TASK-SLICE`

功能条线：
- `LINE-PRE-STAGE-2-3-PRESENTATION`（Active；Planned）

目标机制/切片：
- `M-042`、`M-049`、`M-052`、`VS-067`

规模预算：
- 主工作包：2
- 预计上下文压缩：0
- 独立验收批次：2

拆分触发：
- 若 191 证明战斗宠物本体与固定 HUD 为两个独立原版根，或需要新增第二 pet runtime owner，立即拆分/停止；本 task 不接入物种动画 corpus。

协作计划：
- 模式：单 agent
- 并行工作包：无
- 写入 owner：主 agent
- 归并检查点：验收前
- 方法观测：无

输入资料：
- 191 战斗宠物 UI 显示列表/verified manifest/基准与现代 pet runtime owner、正式 HUD/runtime 桥。

输出产物：
- 战斗宠物原生可见对象/HUD，只读投影 P1/P2 当前出战宠物、HP/MP/技能/休息/死亡状态中原版实际存在的子集。
- 五关正式 Runtime 的 P1/P2、生成/切换/休息/死亡/返回生命周期证据。

UI 原生化合同：
- 显示列表清单：仅按 191 已证根/子 Symbol、depth、字段、矩阵、动态 child 和 hit area 投影。
- 原版机器真值 JSON：直接消费 191 的 verified 战斗 pet UI manifest；若 191 证明原版无固定 HUD，本 task 在获得用户现代例外批准前保持 Blocked。
- 原版视觉基准：191 冻结的 940×590 单人/双人战斗基准。
- 允许的现代视觉例外：只允许 191 明记且用户批准的项目；否则空清单。
- 逐状态验收：P1/P2、无宠物/出战/休息/受击/死亡/技能激活、进关/返回/重试。
- 差异证据：逐状态并排/叠图、几何/对象差异和 P1/P2 不串号证据。

完成定义：
- 战斗中宠物相关 UI 按原版证据可见、生命周期正确且无第二 pet owner；不以调试状态文字充当 UI。

验收标准：
- pet HUD/runtime/五关/P1-P2 专项、全系统、build、structure、annotations、workflow、diff check 和 940×590 零 console 通过。

禁止范围：
- 不派生或接入物种帧、技能弹体真动画；不改宠物数值/行为/存档。

状态更新：
- 更新本线台账、宠物/HUD 索引、机制/切片状态、task-board/history 与适用 PG 反馈。

推荐后续任务：
- `TASK-SETTINGS-193`

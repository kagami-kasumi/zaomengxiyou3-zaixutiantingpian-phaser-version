# TASK-SLICE-199

任务类型：
- `TASK-SLICE`

功能条线：
- `LINE-PRE-STAGE-2-3-PRESENTATION`（Active；Planned）

目标机制/切片：
- `M-015`、`M-041`、`M-044`、`M-049`、`VS-069`

规模预算：
- 主工作包：2
- 预计上下文压缩：0
- 独立验收批次：2

拆分触发：
- 若绑定同步和 MP/冷却实时状态需要修改两个以上未声明 owner，或要求存档 schema 变更，立即拆 task；不重做 198 视觉。

协作计划：
- 模式：单 agent
- 并行工作包：无
- 写入 owner：主 agent
- 归并检查点：验收前
- 方法观测：无

输入资料：
- 197 状态/数据映射、198 原生 HUD 投影、`SkillUISystem`、`HeroSkillSystem`、`FormalSkillRuntimeBridge`、战斗 HUD snapshot/bridge 和当前 save owner。

输出产物：
- 技能功能页绑定→战斗五槽→释放/拒绝→MP/冷却/可用性视觉→返回/重载的单一 owner 联动。
- 五角色、P1/P2、绑定交换、MP 不足、冷却、角色切换、关卡重试/存档重载的确定性与运行证据。

UI 原生化合同：
- 显示列表清单：不新增结构；仅更新 197/198 已证动态 child/字段/状态帧。
- 原版机器真值 JSON：直接消费 197 verified manifest 的状态集和数据映射，实测状态反向换算回舞台坐标。
- 原版视觉基准：197/198 基准与新增的连续冷却/绑定运行录制。
- 允许的现代视觉例外：不新增；只保留 197 已批准项。
- 逐状态验收：空槽/绑定、MP 足/不足、冷却启动/递减/完成、释放/拒绝、五角色、P1/P2、页面修改/重载。
- 差异证据：状态并排/叠图、连续帧差异、可见对象差异和 owner 日志对账。

完成定义：
- 战斗 HUD 所见五槽、键位、技能、MP/冷却/可用性与实际释放和技能功能页/存档同源，P1/P2 不串号。

验收标准：
- skill page/HUD/input/save/五角色/P1-P2 专项、全系统、build、structure、annotations、workflow、diff check 与 940×590 零 console 通过。

禁止范围：
- 不改技能数值/触发/存档 schema，不新建第二冷却或 loadout owner，不重做技能功能页。

状态更新：
- 更新 HUD/技能/存档索引、机制/切片状态、本线台账、task-board/history 与适用 PG 反馈。

推荐后续任务：
- `TASK-SLICE-200`

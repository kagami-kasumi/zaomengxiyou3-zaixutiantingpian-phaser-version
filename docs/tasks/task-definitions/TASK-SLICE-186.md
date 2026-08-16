# TASK-SLICE-186

任务类型：
- `TASK-SLICE`
功能条线：
- `LINE-CORE-PROGRESSION-COMPLETION`（Active；Ready）
目标机制/切片：
- `M-044`、`M-046`、`M-052`、`VS-059`
规模预算：
- 主工作包：2
- 预计上下文压缩：0
- 独立验收批次：2
拆分触发：
- 若需修改任务定义/奖励/party owner/存档 schema、新增可见层或进入 85 页面族外资源，立即拆分。
协作计划：
- 模式：单 agent
- 并行工作包：无
- 写入 owner：主 agent
- 归并检查点：不适用
- 方法观测：无
输入资料：
- `task-settings-175h-task-page.json`、`TASK-SETTINGS-175H-task-page.md`、`task-ui-index.md`、现有 `TaskScene` 与 155D 运行证据。
输出产物：
- 85 manifest 只读投影、删除手写视觉真值、28 状态现代差异与运行回归。
UI 原生化合同：
- 显示列表清单：直接消费 175H 的 45 对象、21 根 child、五个 60、四个 73、31/78/83 四态、TextField 与动态已领取/奖励图。
- 原版机器真值 JSON：truthId `task-settings-175h.task-page`；Schema、源哈希、28 状态、完整性与 `unresolved=[]` 已 verified。
- 原版视觉基准：原版 1.1、940×590 `TASK-SETTINGS-175H/original-*-940x590.png`。
- 允许的现代视觉例外：仅既有 P2 EXP owner 修正与显式即时保存；均不新增可见对象。
- 逐状态验收：daily/activity、normal/hover/pressed/selected、完成未领/已领、0..4 奖励、分页/末页/空活动、P1/P2、关闭/重开。
- 差异证据：同尺寸并排/50% 叠图、稳定区域边缘差异、逐对象清单与字体/0.05 px 裁切容差。
完成定义：
- `TaskScene` 直接消费 manifest 或生成投影；手写坐标/命中/按钮与动态 child 视觉真值删除，业务 owner 不分叉。
验收标准：
- 28 状态专项、43 定义/奖励/party/save 回归、940×590 视觉、零 console、build/workflow/标注/diff check 通过。
禁止范围：
- 不复活活动、不改奖励概率/P2 修正/即时保存、不新增页面 chrome，不重写任务业务或存档。
状态更新：
- 更新机制/VS-059、功能线覆盖台账、看板/history 与现代差异证据。
推荐后续任务：
- 按 175A..I 全部完成后的同线实现批次顺序继续。

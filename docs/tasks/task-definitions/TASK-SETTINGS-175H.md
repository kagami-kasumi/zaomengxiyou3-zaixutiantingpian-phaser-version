# TASK-SETTINGS-175H

任务类型：
- `TASK-SETTINGS`
功能条线：
- `LINE-CORE-PROGRESSION-COMPLETION`（Active；Planned）
目标机制/切片：
- `M-046`、`M-052`、`VS-059`
规模预算：
- 主工作包：2
- 预计上下文压缩：0
- 独立验收批次：2
拆分触发：
- 若 character 85 页面族外需新源或进入实现，立即拆分。
协作计划：
- 模式：单 agent
- 并行工作包：无
- 写入 owner：主 agent
- 归并检查点：不适用
- 方法观测：无
输入资料：
- 协议/Schema、175 审计、`task-ui-index.md`；`backpack1.swf` SHA-256 `70C1F1B535EA789AD9C77556F90C7C107084278A4D1773E31471F2B4D7454936`，85/39/44/49/54/60/73/31/78/83。
输出产物：
- `ground-truth/manifests/task-settings-175h-task-page.json`、证据矩阵与回测入口。
UI 原生化合同：
- 显示列表清单：根、页签、五 tile、详情/进度、奖励/领取、分页/关闭、动态已领取图。
- 原版机器真值 JSON：truthId `task-settings-175h.task-page`；daily/activity、selected、完成未领/已领、末页、空活动、关闭/重开；完整性与 `unresolved=[]`。
- 原版视觉基准：原版 1.1、940×590 既有基准。
- 允许的现代视觉例外：空。
- 逐状态验收：normal/hover/pressed/selected、分页/动态奖励、空活动、返回。
- 差异证据：并排/叠图、逐对象差异与字体容差。
完成定义：
- manifest verified；旧瑕疵与现代修正继续分级。
验收标准：
- Schema/哈希/locator/完整性/回测及 workflow/标注/diff check 通过。
禁止范围：
- 不改任务业务/奖励或 `src/`。
状态更新：
- 更新审计、台账、机制/VS-059、看板/history；verified 后生成实现迁移 task。
推荐后续任务：
- `TASK-SETTINGS-175I`。

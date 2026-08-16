# TASK-SETTINGS-175G

任务类型：
- `TASK-SETTINGS`
功能条线：
- `LINE-CORE-PROGRESSION-COMPLETION`（Active；Ready）
目标机制/切片：
- `M-035`、`M-052`、`VS-059`
规模预算：
- 主工作包：2
- 预计上下文压缩：0
- 独立验收批次：2
拆分触发：
- 若 148/134/136..147 外需新源族或进入实现，立即拆分。
协作计划：
- 模式：单 agent
- 并行工作包：无
- 写入 owner：主 agent
- 归并检查点：不适用
- 方法观测：无
输入资料：
- 协议/Schema、175 审计、`settings-ui-index.md`；`StageCommon.swf` SHA-256 `C6FC973D7D606CE4EA177B0AC075844C86A5EE7E493235FA812A029FBE4F29C9`，148/134/136..147。
输出产物：
- `ground-truth/manifests/task-settings-175g-settings-page.json`、证据矩阵与回测入口。
UI 原生化合同：
- 显示列表清单：根、五行 wrapper/字段、关闭按钮、命中区、矩阵与 overlay。
- 原版机器真值 JSON：truthId `task-settings-175g.settings-page`；normal/hover/pressed、五项循环、死控件、关闭/重开；完整性与 `unresolved=[]`。
- 原版视觉基准：原版 1.1、940×590 既有基准。
- 允许的现代视觉例外：仅已批准的独立全局跨重启持久化，不新增可见对象。
- 逐状态验收：五项循环、按钮、overlay 阻挡、关闭/重开/重启。
- 差异证据：并排/叠图、逐对象差异和字体容差。
完成定义：
- manifest verified，现代持久化例外不混入原版对象表。
验收标准：
- Schema/哈希/locator/完整性/回测及 workflow/标注/diff check 通过。
禁止范围：
- 不改设置行为/存储或 `src/`。
状态更新：
- 更新审计、台账、机制/VS-059、看板/history；verified 后生成实现迁移 task。
推荐后续任务：
- `TASK-SETTINGS-175H`。

# TASK-SETTINGS-175E

任务类型：
- `TASK-SETTINGS`
功能条线：
- `LINE-CORE-PROGRESSION-COMPLETION`（Active；Planned）
目标机制/切片：
- `M-035`、`M-052`、`VS-059`
规模预算：
- 主工作包：2
- 预计上下文压缩：0
- 独立验收批次：2
拆分触发：
- 若 990/969/1006 外需要新源族或进入实现，立即拆分。
协作计划：
- 模式：单 agent
- 并行工作包：无
- 写入 owner：主 agent
- 归并检查点：不适用
- 方法观测：无
输入资料：
- 协议/Schema、175 审计、`immortality-ui-index.md`；`OtherMat1.swf` SHA-256 `97478E1E03A22C7D06197FFB75AB890D98B084377CBDCF394716CBAF27082126`，990/969/1006。
输出产物：
- `ground-truth/manifests/task-settings-175e-immortality-page.json`、证据矩阵与回测入口。
UI 原生化合同：
- 显示列表清单：既有根、25 格、五 owner、动态字段/图标、按钮/弹层清单机械复核。
- 原版机器真值 JSON：truthId `task-settings-175e.immortality-page`；normal/hover/pressed/selected、P1/P2、服用/炼制、拒绝/成功、关闭；完整性与 `unresolved=[]`。
- 原版视觉基准：原版 1.1、940×590、既有基准哈希化。
- 允许的现代视觉例外：空。
- 逐状态验收：上述状态及动态内容、进入/返回。
- 差异证据：并排/叠图、逐对象差异与字体容差。
完成定义：
- manifest verified；未修改业务或视图。
验收标准：
- Schema/哈希/locator/完整性/回测与 workflow/标注/diff check 通过。
禁止范围：
- 不重做丹药事务或实现迁移。
状态更新：
- 更新审计、台账、机制/VS-059、看板/history；verified 后生成实现迁移 task。
推荐后续任务：
- `TASK-SETTINGS-175F`。

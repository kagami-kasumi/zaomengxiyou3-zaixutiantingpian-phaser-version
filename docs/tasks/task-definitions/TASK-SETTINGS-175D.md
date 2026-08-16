# TASK-SETTINGS-175D

任务类型：
- `TASK-SETTINGS`
功能条线：
- `LINE-CORE-PROGRESSION-COMPLETION`（Active；Ready）
目标机制/切片：
- `M-041`、`M-052`、`VS-055`
规模预算：
- 主工作包：2
- 预计上下文压缩：0
- 独立验收批次：2
拆分触发：
- 若既有 250/868/417/213 证据无法由同一源机械复核，或需修改实现，立即拆分。
协作计划：
- 模式：单 agent
- 并行工作包：无
- 写入 owner：主 agent
- 归并检查点：不适用
- 方法观测：无
输入资料：
- 协议/Schema、175 审计、`skill-ui-native-index.md`；`OtherMat1.swf` SHA-256 `97478E1E03A22C7D06197FFB75AB890D98B084377CBDCF394716CBAF27082126`，250/868/417/213。
输出产物：
- `ground-truth/manifests/task-settings-175d-skill-pages.json`、完整性生成/回测入口和证据矩阵。
UI 原生化合同：
- 显示列表清单：沿既有四页根/子/动态 child/按钮/字段清单机械复核。
- 原版机器真值 JSON：truthId `task-settings-175d.skill-pages`；四页、按钮态、角色 selected、技能三态、绑定 P1/P2、被动字段、进入/返回；`unresolved=[]`。
- 原版视觉基准：既有可追溯 940×590 基准，逐文件哈希复核。
- 允许的现代视觉例外：空。
- 逐状态验收：normal/hover/pressed/selected、动态技能/绑定/被动、P1/P2、返回。
- 差异证据：同尺寸并排/叠图与逐对象差异入口。
完成定义：
- 旧审计被机械序列化为 verified manifest，不从 TS 常量反向造真值。
验收标准：
- Schema/源/状态/对象完整性及回测、workflow/标注/diff check 通过。
禁止范围：
- 不修改技能业务或 `src/`。
状态更新：
- 更新审计、台账、机制/VS-055、看板/history；verified 后生成消费迁移 task。
推荐后续任务：
- `TASK-SETTINGS-175E`。

# TASK-SLICE-192A

任务类型：
- `TASK-SLICE`

功能条线：
- `LINE-PRE-STAGE-2-3-PRESENTATION`（Active；Planned）

目标机制/切片：
- `M-016`、`M-042`、`M-052`、`VS-067`

规模预算：
- 主工作包：2
- 预计上下文压缩：0
- 独立验收批次：2

拆分触发：
- 若 191 证明入口/宿主与页面绘制为两个独立根因，或需要修改资源 bundle 架构与页面实现两个工作包之外的 owner，立即拆 task。

协作计划：
- 模式：单 agent
- 并行工作包：无
- 写入 owner：主 agent
- 归并检查点：验收前
- 方法观测：无

输入资料：
- 191 正式路由根因、页面显示列表/verified manifest/基准、175A/175C 真值及当前 entry/router/host/page system/view。

输出产物：
- 正式关卡 P1/P2 宠物入口、互斥/暂停/返回、页面显示与 owner/存档更新修复；页面直接消费 verified 真值。
- 正式 P1/P2、分页、selected、出战/休息、skill hover、放生确认、关闭/重开和重载的运行证据。

UI 原生化合同：
- 显示列表清单：只消费 191 确认的 932 根、列表、头像、8 技能、tooltip、按钮/确认层、动态字段与 hit area，不复制坐标。
- 原版机器真值 JSON：直接消费 191/175A 复核后的 verified manifest 并运行断言完整性。
- 原版视觉基准：使用 191 的正式路由、P1/P2、940×590 同版本基准。
- 允许的现代视觉例外：空清单。
- 逐状态验收：无宠物/有宠物、页面/选中/分页、按钮 normal/hover/pressed、skill hover、出战/休息/放生、P1/P2、关闭/重开/重载。
- 差异证据：并排/叠图、可见对象差异、scene graph/depth 与零遮挡证据。

完成定义：
- 用户指出的正式“无宠物 UI”路径已在 P1/P2 可见且可交互，不用调试直达替代证明。

验收标准：
- pet truth/formal pet/entry/router/save/bundle 专项、全系统、build、structure、annotations、workflow、diff check 与 940×590 零 console 通过。

禁止范围：
- 不实现宠物战斗 HUD 或动画，不改 pet 数值/技能/存档 schema。

状态更新：
- 更新本线台账、宠物/入口索引、机制/切片状态、task-board/history 与适用 PG 反馈。

推荐后续任务：
- `TASK-SLICE-192B`

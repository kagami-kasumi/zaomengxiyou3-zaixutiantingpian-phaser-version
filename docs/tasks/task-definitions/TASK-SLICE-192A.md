# TASK-SLICE-192A

任务类型：
- `TASK-SLICE`

功能条线：
- `LINE-PRE-STAGE-2-3-PRESENTATION`（Active；Ready）

目标机制/切片：
- `M-016`、`M-042`、`M-052`、`VS-067`

规模预算：
- 主工作包：2
- 预计上下文压缩：0
- 独立验收批次：2

拆分触发：
- 若非 QA 旅程复现两个以上独立根因，或需要同时修改 bundle 架构和 932 页面实现，立即拆 task；191 已证明当前 QA 正式 Runtime 的页面可见，不允许预设重做页面。

协作计划：
- 模式：单 agent
- 并行工作包：无
- 写入 owner：主 agent
- 归并检查点：验收前
- 方法观测：无

输入资料：
- 191 分层矩阵与“页面链可见、战斗 HUD 缺失”裁决、175A/175C 真值、180/182 运行证据及当前 entry/router/host/page system/view。

输出产物：
- 冷启动正式存档→地图→五关 Runtime→P1/P2 入口→932→关闭返回的可重复自动旅程；bundle/页面资源失败产生可断言信号，不再静默消失。
- 正式 P1/P2、分页、selected、出战/休息、skill hover、放生确认、关闭/重开和重载的运行证据；若页面链继续通过，不做可见页面改写。

UI 原生化合同：
- 显示列表清单：继续只消费 175A 确认的 932 根、列表、头像、8 技能、tooltip、按钮/确认层、动态字段与 hit area，不复制坐标。
- 原版机器真值 JSON：直接消费 `task-settings-175a.pet-page` 与 175C host truth 并运行断言完整性；191 的 character 662 truth 不在本 task 投影。
- 原版视觉基准：使用 191 的正式路由、P1/P2、940×590 同版本基准。
- 允许的现代视觉例外：空清单。
- 逐状态验收：无宠物/有宠物、页面/选中/分页、按钮 normal/hover/pressed、skill hover、出战/休息/放生、P1/P2、关闭/重开/重载。
- 差异证据：并排/叠图、可见对象差异、scene graph/depth 与零遮挡证据。

完成定义：
- 非 QA 冷启动正式旅程能证明 P1/P2 页面可见、可交互并正确返回；资源/绘制失败可由测试和运行证据定位，不用调试直达或静默 `false` 代替证明。

验收标准：
- pet truth/formal pet/entry/router/save/bundle 专项、全系统、build、structure、annotations、workflow、diff check 与 940×590 零 console 通过。

禁止范围：
- 不实现 character 662 战斗 HUD或宠物动画，不改 pet 数值/技能/存档 schema；不因用户反证重做已通过的 932 页面。

状态更新：
- 更新本线台账、宠物/入口索引、机制/切片状态、task-board/history 与适用 PG 反馈。

推荐后续任务：
- `TASK-SLICE-192B`

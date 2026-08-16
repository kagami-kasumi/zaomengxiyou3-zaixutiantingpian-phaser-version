# TASK-SLICE-184

任务类型：
- `TASK-SLICE`
功能条线：
- `LINE-CORE-PROGRESSION-COMPLETION`（Active；Planned）
目标机制/切片：
- `M-046`、`M-052`、`VS-059`
规模预算：
- 主工作包：2
- 预计上下文压缩：0
- 独立验收批次：2
拆分触发：
- 若需改商城业务事务、引入 721/717/624 与既有 49 图标目录外的新资源族，或增加第二条独立运行旅程，立即拆分。
协作计划：
- 模式：单 agent
- 并行工作包：无
- 写入 owner：主 agent
- 归并检查点：不适用
- 方法观测：无
输入资料：
- `docs/reverse-engineering/evidence/TASK-SETTINGS-175F-shop-page.md`
- `docs/reverse-engineering/ground-truth/manifests/task-settings-175f-shop-page.json`
- `docs/reverse-engineering/shop-ui-index.md`
- 现有 `ShopScene`、商城系统、49 项商品目录、共享灵魂余额与存档测试。
输出产物：
- 721/717/624 manifest 只读投影、删除手写视觉真值源、31 状态差异证据和正式 P1/P2 回归。
UI 原生化合同：
- 显示列表清单：直接消费 175F manifest 的 132 对象、父子/depth、矩阵、字段、动态图标、16 按钮和命中区。
- 原版机器真值 JSON：truthId `task-settings-175f.shop-page`；Schema/哈希/locator/31 状态/完整性已 verified，实现不得复制坐标表。
- 原版视觉基准：`docs/tasks/evidence/TASK-SETTINGS-175F/original-*-940x590.png`，940×590 舞台裁切。
- 允许的现代视觉例外：仅用户已批准的共享灵魂余额；投影既有 owner，不增加其他 chrome。
- 逐状态验收：分类 selected、卡/数量/确认/返回 normal-hover-pressed、分页与 5/8/9/4 卡、0/99/100、拒绝/成功、P1/P2、关闭/重开。
- 差异证据：同尺寸并排、50% 叠图、stable-region 像素/边缘差异和逐对象清单；仅字体抗锯齿与 943.15→940 裁切容差。
完成定义：
- `ShopScene` 直接消费 manifest 或其可重复生成投影，手写视觉真值源删除，31 状态及业务/owner/存档回归通过。
验收标准：
- 商城专项、manifest stage 坐标回测、Schema/生成器、全系统/build/structure/workflow/标注/diff check 通过；940×590 P1/P2 与 console 零 warning/error。
禁止范围：
- 不改 49 项商品、价格/折扣、数量/拒绝、库存/灵魂事务、在线边界或存档 owner；不新增未批准可见层。
状态更新：
- 更新商城证据、机制/VS-059、功能线覆盖台账、看板/history；功能线未关闭时只推荐同线下一项。
推荐后续任务：
- 按 175A..I 全部证据完成后的同线实现调度顺序决定。

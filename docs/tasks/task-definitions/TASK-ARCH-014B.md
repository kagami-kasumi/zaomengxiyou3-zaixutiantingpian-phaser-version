# TASK-ARCH-014B

任务类型：

- `TASK-ARCH`

功能条线：

- `LINE-SHARED-UI-COMPONENTS`（Planned；须待本线获得 WIP 且 014A 归档）


目标机制/切片：

- `M-035`、`M-044`、`M-052`、`VS-059`

规模预算：

- 主工作包：2
- 预计上下文压缩：0
- 独立验收批次：2

拆分触发：

- 若 014A 矩阵确认五个以上结构不同的灵魂消费者、需要新增源包派生或修改 `PlayerSoulSystem`/存档 schema，立即把迁移按页面批次拆分；本 task 只建立组件与首批既有消费者。

输入资料：

- 014A 的 SoulBalance 合同/矩阵，PG-007/010/011，现有 `FormalSoulBalanceView`、技能/炼丹炉/商城 views、资源 provenance 与专项。

输出产物：

- 唯一 SoulBalance 视图投影与有类型配置；已知消费者不再私有绘制图标、数字轮廓或余额副本。
- 独立透明图标、嵌入字形/Flash 度量、bundle owner 与 screenshot/stage-background 负向门禁。
- P1/P2、余额刷新、消费后即时显示、切页/返回/重载和销毁回归。

完成定义：

- 全部纳入矩阵的灵魂消费页复用同一组件代码与权威视觉子件，同时保留页面位置和 owner 标签差异。
- 组件只读取当前 player 的 `soulCount` 投影，不持有或扣减余额；消费继续经 `PlayerSoulSystem`。
- 不再出现黑框、遮字、系统字体回退、旧页 model 或页面私有数字渲染。

UI 原生化合同：

- 显示列表清单：逐页核对灵魂图标、动态数字、owner 标签、父层级、矩阵和遮挡关系。
- 原版视觉基准：技能/炼丹炉沿用原 SWF 基准；商城使用用户批准现代例外及无黑底复验基准。
- 允许的现代视觉例外：商城新增同款组件是已批准例外；不得扩大到其他可见层。
- 逐状态验收：P1/P2、0/多位数、消费前后、切页、返回、重复打开和重载。
- 差异证据：逐页并排/叠图、组件边界 alpha 检查与可见对象差异清单。

组件化合同：

- 组件家族：SoulBalance。
- 权威 owner：`PlayerSoulSystem`/V6 玩家直属字段为业务 owner；共享 view 只读投影。
- 共享行为：透明图标、嵌入字形排版、余额刷新、容器生命周期与销毁。
- 页面保留项：位置、层级、页面专属 owner 标签、源显示列表关系和允许例外。
- 消费者迁移矩阵：以 014A 冻结矩阵为准，至少覆盖技能、炼丹炉、商城及当时已知消费者。
- 防复发门禁：禁止页面私有灵魂视图、截图裁片、舞台底色、系统字体和 `skillLearning.soulCount` 回流。

验收标准：

- 先运行 `check:structure`；专项、`test:systems`、`build`、`check:workflow`、`git diff --check` 通过。
- 940×590 逐页/P1/P2/消费/返回/重载复验，console 无 warning/error。

禁止范围：

- 不改变余额、价格、奖励、消费事务或 V6 schema；不迁移按钮/背包组件族。

状态更新：

- 更新本线覆盖、PG-007/010/011、task-board/task-history 与相关视觉审计。

推荐后续任务：

- `TASK-ARCH-014C`。

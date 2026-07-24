# TASK-SLICE-153 视觉与流程验收

日期：2026-07-24。

## 合同与基准

- 原版显示列表继续由 `heaven-map-index.md` 的 940×590 天庭地图、节点、底部菜单与当前槽提示负责。
- 本 task 删除的对象仅是现代追加的逐关 1P/2P chooser、按钮、遮罩及其生命周期状态；没有替换或重做原地图资源。
- 允许的现代视觉例外保持不变：锁定/未接入节点安全反馈与当前槽提示继续存在；没有新增确认层、通用弹窗或替代按钮。

## 自动证据

- `heaven-map-tests.ts` 禁止 `chooser`、`openPlayerCountChooser`、“单人进入/双人进入”和带 `{ playerCount }` 的正式节点路由回流。
- `formal-party-runtime-tests.ts` 覆盖五角色 1P、2P 异角色、重复角色拒绝、正式 payload 忽略、DEV override/retry 隔离，以及五个已接入正式关卡统一解析 party。
- `formal-game-loop-journey-tests.ts` 覆盖 1P/2P owner、地图直入、解锁返回和重载；结果桥统一使用 `retryData`，正式重试重新读取活动槽。

## 940×590 运行证据

1. `TASK-SLICE-153-map-direct-entry.png`
   - 读取 1P 悟空活动槽后进入原生天庭地图。
   - 地图只有既有节点/菜单/状态标记，没有逐关人数 chooser 或替代确认层。
2. `TASK-SLICE-153-single-party-stage.png`
   - 点击当前可用节点后直接进入 Stage 2-2。
   - 只创建 P1 HUD/玩家，HP/MP/经验与技能槽保持单 owner；中间没有人数选择画面。
3. `TASK-SLICE-153-dev-dual-party-stage.png`
   - 本地明确 `qaBossState=door&players=2` 路径创建 DEV party。
   - Stage 2-2 显示 P1/P2 镜像 HUD，证明显式 QA 覆盖仍可用且与正式存档入口分离。

## 差异与结论

- 正式地图节点现在调用 `scene.start(node.routeKey)`；各关卡在 `init` 内从活动槽解析同一 `PartyConfiguration`。
- 五个已接入关卡的玩家视图携带 party hero，Stage 1 共享战斗 runtime 以该 hero 初始化成长、普攻和基础 HP/MP。
- 失败重试只在 DEV/QA 来源保留 `devParty`；正式来源不传人数或角色快照，重新读取活动槽。退出、返回地图和整页重载同样回到活动槽权威事实源。
- 本 task 没有修改地图原图、节点坐标、关卡波次、Boss、机关或视觉资源。


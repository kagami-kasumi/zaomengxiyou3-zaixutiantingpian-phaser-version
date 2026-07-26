# TASK-SLICE-155D 视觉与行为验收

## 基准与显示列表

- 舞台固定为 940×590；原版基准来自 `assets/backpack1.swf` character 85。
- 页面下层重建同一 `SelectPLace` / `MapMenu` host，character 85 的 20% 黑色笔触模态层直接叠加其上。
- 直接消费 44/49 双页签、60 五行 tile、73 四奖励格、54 领取两帧、31/78/83 三态按钮、9 已领取图与 `EIcon1` 512/560/608/623；物品/制作书继续消费权威背包真图标。
- 动态名称、描述、进度、奖励名与页码使用仓库内 `FZCuYuan-M03.ttf`，没有系统字体回退、现代卡片、owner selector 或活动说明层。

## 逐状态证据

| 状态 | 证据 | 结论 |
| --- | --- | --- |
| 地图正式入口 | `TASK-SLICE-155D-map-baseline.png` | 原 MapMenu“任务”透明命中区进入任务页；底层地图显示列表保持 |
| 日常 selected / 奖励 | `TASK-SLICE-155D-daily-selected.png` | 日常 frame 2、tile frame 2、描述/进度、两候选真图标与 disabled 领取均按原坐标 |
| 空活动页 | `TASK-SLICE-155D-activity-empty.png` | frame 2、五 tile 隐藏、`1/1`；四个休眠定义没有伪装成活动内容 |
| 日常末页 | `TASK-SLICE-155D-last-page.png` | `9/9` 只有三项，两个缺失 tile 保持隐藏；分页按钮仍可点击并钳制 |
| 关闭返回 | `TASK-SLICE-155D-close-return.png` | character 31 关闭后回到同一地图与存档槽 |

## 行为与差异

- 43 条日常定义、全部 producer key/数量/候选奖励、端点非均匀随机、普通/困难计数、地狱不计和封顶由 `formal-task-tests.ts` 固定。
- 1P/2P 共享 party 任务状态；物品/灵魂作用于活动 party，炎马只给 P1。
- 原版 P2 经验误查 P1 宠物的串号缺陷在现代版修正为各自 owner，这是唯一数值路由差异。
- 同日重载恢复，跨本地日历日载入清零日常；任务状态只在当前 V6 槽保存一份。现代版在击杀进度和领取成功后即时写当前槽，避免原版必须返回地图手动保存造成离线进度丢失。
- 保留原版空活动页和末页陈旧详情边界；没有复活 101..104、伪造后端或新增可见离线说明。
- 浏览器 normal/selected/活动/末页/关闭全程 console warning/error 为 0。

## 对象差异清单

- 可见现代新增对象：0。
- 用户批准的停服活动边界：活动页为空、四定义休眠。
- 现代行为差异：P2 经验 owner 修正；任务进度/领取即时落当前槽。
- 未解释视觉差异：0。

# TASK-SETTINGS-175H 任务页 85 原版真值

## 结论

`task-settings-175h.task-page` 已达到 `verified`。恢复源 `assets/backpack1.swf` SHA-256 为
`70C1F1B535EA789AD9C77556F90C7C107084278A4D1773E31471F2B4D7454936`。manifest 序列化
45 个 scoped 对象、28 个状态：85 根与 21 个根 child、五个 60 的底图/任务名、四个 73 的底图/奖励名、
31/78/83 四态，以及 AS3 动态加入的 character 9 已领取图和四个奖励图；`unresolved=[]`。

权威入口：

- manifest：`docs/reverse-engineering/ground-truth/manifests/task-settings-175h-task-page.json`
- 生成器：`tools/generate-task-page-ground-truth.mjs`
- 基准生成器：`tools/generate-task-page-baselines.ps1`
- 原版结构基准：`docs/tasks/evidence/TASK-SETTINGS-175H/original-*-940x590.png`
- 关键 JSON Pointer：`/displayObjects`、`/states`、`/completeness/expectedVisibleObjectCountByState`

## 待证明问题与答案

1. 85 的显示列表是否完整？是。生成器逐项断言恢复 SWF 导出的 21 个根 child 的 character、顺序、
   instance 与矩阵，并按旧审计已核对的 PlaceObject depth 固定 5..50；60/73 的嵌套 child 另由逐帧 SVG 核对。
2. hover/pressed/selected 是否被误造？没有。44/49、60、54 都是两帧 MovieClip，只有 normal/selected
   或 disabled/enabled；它们的 hover/pressed 保持当前帧。31/78/83 才拥有独立 up/over/down/hit。
3. 动态列表是否闭合？是。五行数量按 5/3/0 三种状态计数；已领取图为 60 局部 `(150.5,0)` 的
   character 9；奖励图为 73 局部 `(3.5,3.5)` 的 50×50 `EIcon1` 对象，候选数覆盖 0/1/2/3/4。
4. 原版残留是否保留？是。末页仍显示可点分页；selectId 指向隐藏第 4/5 行时右栏陈旧；空活动页
   可保留原日常详情、奖励和领取 listener。它们是确认的原版缺陷，不是活动内容。
5. owner/关闭/重开是否越界？没有。任务状态是 party/slot 共享；双人只改变奖励副作用，不新增 UI；
   关闭移除 85，重开新实例立即派发 daily click，不保持旧选择。

## 六段证据矩阵

| 合同项 | 局部证据 | 共享调用链 | 几何/坐标证据 | 等级 | 未知/反证 | 验证 |
| --- | --- | --- | --- | --- | --- | --- |
| 85 根与模态 | `backpack1.swf` character 85/39 | `MapMenu.rwbtnClick` → `GMain.showTaskInterface` | 21 根 child；940×590 stage；39 全舞台 | 交叉确认 | 源哈希漂移则失效 | SVG 断言 + Schema |
| 页签/行/字段 | `TaskInterface.dailyClick/activityClick/selected` | `GameTask.getdayTask/getactTask` | 44/49 两帧；五个 60；57/64/65/84 嵌入字段 | 交叉确认 | 无独立 hover/down | 逐状态 fixture 与对象计数 |
| 分页与残留 | `prePage/nextPage/setTaskList` | 43 daily / 0 reachable activity | 78/83 四态；9 页、末页 3 行、空页 0 行 | 交叉确认 | 活动 101..104 未 push 是反证 | 末页/钳制/空活动/陈旧右栏 |
| 奖励与已领动态图 | `TaskTile.setReceive`、`AwardList.addImage` | `AUtils.getImageObj`、`EIcon1` | 9 at `(150.5,0)`；奖励图 at `(3.5,3.5)` | 交叉确认 | 无完成 tile 徽章 | 0..4 候选与 claimed 状态 |
| 领取与双 owner | `selected/analyseAward` | party 共享任务状态；奖励遍历玩家 | 不新增可见 owner selector | 交叉确认 | P2 EXP 原缺陷仍属业务合同 | 完成未领/已领/P1+P2 fixture |
| 关闭/重开 | `closed/removed/added` | 地图 host 恢复；新实例 daily click | 31 四态与 40×40 hit | 交叉确认 | 不保留旧 selected | close/reopen states |

## 原版基准与逐状态差异合同

28 张 940×590 结构基准来自同哈希恢复 SWF 的 character 85 帧 1 导出，并统一裁去 FFDec 的 0.05 px
右侧边界。静态导出不执行构造器，故动态文字、selected 帧、隐藏行、已领取图与奖励图由 manifest fixture、
逐帧子 Symbol 和 AS3 动态 child 合同共同校验，不能把同一结构 PNG 误解为每个运行态的像素截图。

后续 `TASK-SLICE-186` 必须以相同舞台尺寸复核并排/50% 叠图、稳定区域边缘差异和逐对象清单：

- 对象、depth、矩阵、命中区、按钮/页签/tile 帧和动态 child 零容差；
- 字体轮廓、抗锯齿与 FFDec 0.05 px 右缘只允许记录化容差；
- 不得新增现代标题、通用列表、owner selector、空活动说明、disabled 分页或额外关闭 chrome；
- party 共享 owner、P2 EXP 修正和即时保存是既有现代行为差异，不生成新的可见对象。

## 实现合同

`TASK-SLICE-186` 应让 `TaskScene` 直接消费 manifest 或只读生成投影，删除 85 页面族的手写坐标、
行/奖励格几何、按钮态和动态 child 真值。43 条任务、奖励事务、party owner 与当前存档继续由既有业务
owner 持有；不得借视觉迁移复活四个活动定义、修改奖励概率或重写任务存档。

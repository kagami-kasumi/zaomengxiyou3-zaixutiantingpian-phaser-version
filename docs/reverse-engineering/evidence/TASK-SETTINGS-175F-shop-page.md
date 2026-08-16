# TASK-SETTINGS-175F 商城页 721/717/624 原版真值

## 结论

`task-settings-175f.shop-page` 已达到 `verified`。恢复源 `assets/backpack1.swf` SHA-256 为
`70C1F1B535EA789AD9C77556F90C7C107084278A4D1773E31471F2B4D7454936`。manifest 序列化
132 个 scoped 对象、31 个状态：721 根及 27 个根 child、九个 717 卡片及各 10 个静态 child、
九个 AS3 动态 `PackThings` 商品图标、624 确认弹层及其 4 个 child；`unresolved=[]`。

权威入口：

- manifest：`docs/reverse-engineering/ground-truth/manifests/task-settings-175f-shop-page.json`
- 生成器：`tools/generate-shop-page-ground-truth.mjs`
- 基准生成器：`tools/generate-shop-page-baselines.ps1`
- 原版结构基准：`docs/tasks/evidence/TASK-SETTINGS-175F/original-*-940x590.png`
- 关键 JSON Pointer：`/displayObjects`、`/states`、`/completeness/expectedVisibleObjectCountByState`

## 待证明问题与答案

1. 721 根、九卡与确认层是否完整？是。本轮 FFDec 26 选择性 SVG/PNG/button 导出和完整 XML
   来自同哈希恢复 SWF；27 个根 child、每卡 10 个静态 child、624 的 4 个 child 全部序列化。
2. 空卡和分类末页是否被误当成九卡常驻？否。manifest 按全部末页 4、时装 8、宠物 5 记录
   逐状态可见对象数；`ShopThing.visible=false` 会隐藏整卡及其 nested child。
3. 商品图标是否从现代坐标反推？否。`ShopThing.setEquipment()` 明确创建 `PackThings`，在卡内
   `(15,20)` 加入；manifest 只以 `runtime-inventory-item:fixture.cards[i].fillName` 引用既有真图标目录。
4. selected、hover、pressed 和 hit 是否完整？是。五分类 selected、P1/P2 selected、卡片购买/
   数量箭头、确认/取消、分页与返回均引用 16 个 DefineButton2 的 up/over/down/hit 导出。
5. 哪些可见层允许现代例外？仅用户已批准的共享灵魂余额；它投影同一 owner，不进入原版
   721 child 清单。共享提示也属于 host，不伪造为 721/624 child。

## 六段证据矩阵

| 合同项 | 局部证据 | 共享调用链 | 几何/坐标证据 | 等级 | 未知/反证 | 验证 |
| --- | --- | --- | --- | --- | --- | --- |
| 721 根与五分类 | `backpack1.swf` 721；`Micropayment` | 地图入口 → `GMain.showShoping` → `added/selectTag` | 27 个根 child、五分类 80×36、940×590 裁切 | 交叉确认 | 源哈希或根清单漂移则失效 | 生成器 `--check` + Schema |
| 九卡与动态图标 | 717；`ShopThing.setEquipment/clearEquipment` | `AllEquipment` → `PackThings` | 九卡三列三行；每卡 10 child；图标局部 `(15,20)`、50×50 | 交叉确认 | 图标 key 缺目录映射会使后续消费失败 | 31 状态对象计数 + fixture 回测 |
| 分类/分页/数量 | `selectTag/upPage/nextPage`；卡数量处理 | 49 项权威注册顺序 | 658/643/636/653/648、685/690、711/716 与 TextField 704 | 交叉确认 | 无 | 5/8/9/4 卡状态、0/99/100 |
| 624 确认与拒绝 | `SumInterface` | `BuySuccess/BUYCHANGLE`、当前 `User` | 全舞台 624；617/622/623；按钮 down 下移 | 交叉确认 | 共享 Tips 不属于弹层 child | 确认/取消/不足/成功状态 |
| P1/P2 与返回 | `play1Click/play2Click/backClick` | 两个 `User`、`ChangePlayer`、地图 host | 675/680 selected；719 越界裁切 | 交叉确认 | 单人 P2 隐藏由 fixture 决定 | P1/P2/hover/pressed/closed |
| 离线与保存边界 | `czClick/buySuccess` | 灵魂 owner；`setStorage` 对比地图 `saveGame` | 原根静态停服/手动保存文字保留 | 交叉确认 | 现代即时保存是既有设计差异 | 旧业务专项；后续运行差异 |

## 显示列表、基准与差异合同

manifest `/displayObjects` 是唯一机器清单。31 张基准由同哈希恢复 SWF 的 721/717/624 与按钮
导出在 940×590 裁切内组合；动态名称、价格、数量、商品图标和共享提示由 fixture/运行时目录驱动，
结构 PNG 的空字段不表示对象缺失。既有 `TASK-SLICE-155B` 并排、50% 叠图和 stable-region diff
只作为迁移前现代基线；后续实现必须以本 manifest 重新生成逐对象差异：

- 必须逐 child 消费 721/717/624、16 组按钮状态、动态字段和 49 项真图标；
- 只允许字体栅格化、抗锯齿和 943.15→940 舞台裁切容差；对象缺失、额外 chrome、depth、状态、
  hit、卡数量和 owner 错误为零容差；
- 唯一批准的现代可见例外是共享灵魂余额，且不得建立第二货币 owner；
- 停服静态文字未经用户批准不得替换，不能据此接入在线支付或网络保存。

## 实现合同

后续 `TASK-SLICE-184` 应让 `ShopScene` 直接消费 manifest 或其只读生成投影；既有商城目录、
折扣、库存、灵魂、P1/P2 和当前存档系统继续是唯一业务 owner。不得在迁移中重写事务、修正原版
静态停服文字、增加网络能力或扩张共享灵魂余额的可见边界。

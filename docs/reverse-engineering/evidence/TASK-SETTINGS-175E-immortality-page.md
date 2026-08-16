# TASK-SETTINGS-175E 丹药页 990/969/1006 原版真值

## 结论

`task-settings-175e.immortality-page` 已达到 `verified`。恢复源 `assets/OtherMat1.swf`
SHA-256 为 `97478E1E03A22C7D06197FFB75AB890D98B084377CBDCF394716CBAF27082126`。
manifest 序列化 132 个 scoped 对象、26 个状态：990 根及 42 个根 child、25 个 969 格及其
底格/服用按钮、五职业选择器、25 个 AS3 动态已服用图、1006 炼制弹层及其 7 个 child；
`unresolved=[]`。

权威入口：

- manifest：`docs/reverse-engineering/ground-truth/manifests/task-settings-175e-immortality-page.json`
- 生成器：`tools/generate-immortality-page-ground-truth.mjs`
- 基准生成器：`tools/generate-immortality-page-baselines.ps1`
- 原版结构基准：`docs/tasks/evidence/TASK-SETTINGS-175E/original-*-940x590.png`
- 关键 JSON Pointer：`/displayObjects`、`/states`、`/completeness/expectedVisibleObjectCountByState`

## 待证明问题与答案

1. 990 根和 25 格是否完整？是。恢复 SWF 选择性 SVG 的 42 个根 `<use>` 与 character
   990/969 的 PlaceObject 身份、矩阵和可见边界逐项序列化；25 格按 grade-major 排列。
2. 构造期隐藏的服用按钮是否被误当作运行态可见对象？否。AS3 `SingleImmortality()` 立即
   `setBtnVisible(false)`；基准生成器从 990 SVG 移除 968，只有连续下一阶且背包持有时才按状态加入。
3. owner 与 selected 是否完整？是。218/223/228/233/871 的帧 1/2 分别表示 normal/selected；
   单人默认 P1，两人按 P1 后 P2 派发点击，最终 P2 selected。manifest 保留 P1/P2 独立实例位置。
4. 动态已服用图是否来自手抄坐标？否。`setImage()` 以 item key 调用 `AUtils.getImageObj()`，
   固定实例名 `showhaseatimmortality`、局部 `(2,2)`；manifest 以 `runtime-image:<itemKey>` 保留原身份。
5. 是否允许现代可见例外？否。即时持久化是既有行为差异，但不改变本页对象表。

## 六段证据矩阵

| 合同项 | 局部证据 | 共享调用链 | 几何/坐标证据 | 等级 | 未知/反证 | 验证 |
| --- | --- | --- | --- | --- | --- | --- |
| 990 根与 25 格 | `OtherMat1.swf` 990/969；`ImmortalityInterface` | `MapMenu -> AUtils.getNewObj -> added/initImmortalityShow` | 42 个根 child；25×969；local matrix 与 940×590 stage bounds | 交叉确认 | 源哈希或显示列表序列漂移则失效 | 生成器 `--check` + Schema |
| 服用按钮与动态图 | 968；`SingleImmortality` | 构造隐藏、连续解锁、`setImage/eatClick` | 968 局部 `(5,5)`、down `+2y`、hit 42×45；图标 `(2,2)` | 交叉确认 | 运行图 key 缺失会使资源消费失败 | 逐状态基准 + fixture 回测 |
| 五 owner / 双玩家 | 218/223/228/233/871 两帧 | `added/playerUse/onWho` | P1 `(50,540)`、P2 `(140,540)` | 交叉确认 | 重复职业的原版字符串碰撞不作为现代需求 | selector 状态集与 AS3 |
| 1006 炼制弹层 | 1006/997/989 | `makeImmortality -> ExchangeImmortality.added` | 全舞台 992 阻挡；7 个 child；按钮原矩阵/命中 | 交叉确认 | 无 | SVG、按钮四帧与 26 状态 |
| 拒绝/成功与刷新 | 两个丹药类 | `User/AllEquipment/TipsManager/RefreshPill` | 共享提示不是 990/1006 child；不伪造为页内对象 | 确认事实 | 原版炼制后根页不即时刷新仍保留 | fixture 合同 + 既有业务测试 |
| 进入/返回/存档 | `back/xClick` | `MapMenu/MemoryClass` | closed 为 0 对象；显式保存时机不改变显示列表 | 交叉确认 | 现代即时保存仅是既有行为差异 | 状态完整性 + 后续实现回测 |

## 显示列表、基准与差异合同

manifest `/displayObjects` 是唯一机器清单。结构基准从同哈希恢复 SWF 选择性导出；为还原真实
运行态，990 基准按构造器隐藏 25 个 968。TextField 值、已服用位图和共享提示由 fixture/AS3
驱动，结构 PNG 不反向宣称它们为空。后续实现任务必须输出同尺寸并排、50% 叠图和逐对象差异：

- 必须复用 990/969/1006、四类按钮状态、五职业 selector 与动态 item key；
- 必须删除手写坐标源或使其由 manifest 可重复生成；
- 只允许字体栅格化与抗锯齿边缘容差；对象缺失、额外覆盖、depth/状态/命中错误为零容差；
- 允许的现代可见例外为空。

## 实现合同

后续单页迁移应让 `ImmortalityScene` 直接消费 manifest 或其只读投影；既有丹药、背包、灵魂、
双 owner、存档和事务系统继续是唯一业务 owner。不得在迁移中重写配方/拒绝顺序、修正原版刷新
瑕疵或新增页面 chrome。

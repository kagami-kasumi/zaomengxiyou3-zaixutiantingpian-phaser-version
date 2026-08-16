# TASK-SETTINGS-175B 法宝页 596 原版真值

## 结论

`task-settings-175b.magic-weapon-page` 已达到 `verified`。恢复源
`assets/backpack1.swf` 的 SHA-256 为
`70C1F1B535EA789AD9C77556F90C7C107084278A4D1773E31471F2B4D7454936`；
character 596 在 940×590、24fps、top-left 舞台上包含 17 个根帧 child。AS3 运行时另按分支
创建 character 200 `updataFBWithLvdyl` 或 character 34 `renewalseThisSZ`；两者各含全舞台遮罩、
`okbtn`、`nobtn` 和动态 `txt`。manifest 共序列化 28 个对象、21 个状态，`unresolved=[]`。

权威入口：

- manifest：`docs/reverse-engineering/ground-truth/manifests/task-settings-175b-magic-weapon-page.json`
- 生成器：`tools/generate-magic-weapon-page-ground-truth.mjs`
- 基准生成器：`tools/generate-magic-weapon-page-baselines.ps1`
- 结构基准：`docs/tasks/evidence/TASK-SETTINGS-175B/original-*-940x590.png`
- 关键 JSON Pointer：`/displayObjects`、`/states`、`/completeness/expectedVisibleObjectCountByState`

## 待证明问题与答案

1. 596 的根显示列表是否完整？是。生成器直接解析恢复 SWF 的 DefineSprite/PlaceObject
   depth、character、instanceName 和 matrix，并与 FFDec 26 的 596 SVG 17 个根 `<use>`
   逐项相等校验。
2. 动态确认层是否属于同一源包且身份明确？是。SymbolClass 将 character 200 映射为
   `updataFBWithLvdyl`、character 34 映射为 `renewalseThisSZ`；`sjMethod/upData*/refreshWX`
   的 `AUtils.getNewObj()` 和 `addChild()` 调用决定分支、实例名和生命周期。
3. 字段与动态时间轴怎样写入？`setTxt()` 写入名称、等级、成长、五行、攻击、防御、HP、MP、
   灵魂九个字段；`lhmc` 是 50 帧进度，`showmc/introducemc` 各为 27 帧并共享 26 个法宝中文标签，
   由 `gotoAndStop(currentSura.ename)` 选择。
4. 未装备/P2 是否存在另一套页面？否。`RoleInfo.fbClick()` 未装备时只走共享 alert，不构造 596；
   原版输入表没有 P2 法宝面板快捷键。两者均是可见对象数 0 的负向原版事实，不得伪造 P2 页面。
5. 是否存在允许的现代可见例外？没有。当前现代标题、面板、摘要和通用按钮均为待删除覆盖层。

## 六段证据矩阵

| 合同项 | 局部证据 | 共享调用链 | 几何/坐标证据 | 等级 | 未知/反证 | 验证 |
| --- | --- | --- | --- | --- | --- | --- |
| 根页与字段 | `backpack1.swf` 596；`SutraInterface` 字段声明与 `setTxt()` | `RoleInfo.fbClick -> AUtils.getNewObj -> setRole(hero)` | SWF PlaceObject 与 596 SVG 17/17 匹配；根约 `940.05×590`、舞台裁 940×590 | 交叉确认 | 源哈希或对象序列漂移则失效 | 生成器 `--check` + Schema |
| 法宝展示/说明/灵魂条 | 595/421 各 27 帧、26 中文标签；375 为 50 帧 | `setRole/setTxt` 的 `ename` 与灵魂公式 | 595 `(244,211.7)`；421 `(507.8,187)`；375 `(318.9,417.75)` | 交叉确认 | 动态文本值由 fixture 写入，不把结构 PNG 空字段解释为空数据 | XML 标签/帧数 + manifest |
| 三个根按钮 | 368/436/31 与其 up/over/down/hit | `added/removed` 绑定升级、重置、关闭 | manifest 保留 local matrix、stage bounds 与 hitArea；down 下沉由原按钮资源表达 | 交叉确认 | 无 | 21 状态与按钮资产回测 |
| 升级确认 | 普通 10..14 级使用 200；特殊材料分支使用 34 | `sjMethod/upDataZSJL/upDataQPJ/upDataGod` | 两确认根均 940×590；ok `(376.3,329)`、no `(463.3,329)` | 交叉确认 | 共享 `ts/alert` 不属于 596 child | 200/34 显示列表与合成基准 |
| 重置确认与拒绝 | `refreshWX/refreshConfirm/refreskCancel` 使用 34，实例名 `refreshWX` | owner 背包 `wpccfq`、装备重建与字段刷新 | 与特殊升级共享 character 34；不足 3 个时 alert 后确认层仍保留 | 交叉确认 | 无 | 确认/取消/拒绝/完成四态 |
| 进入、关闭与 owner | `setRole/close`；未装备负向分支 | P1 `N`/HUD；`stopGame/continueGame`；关闭重算并回写当前 `zbfb` | 未装备、P2 无入口、closed 均为 0 对象 | 交叉确认 | 原版没有 P2 页面；现代不得补成原版事实 | 状态集合 + 既有 owner 专项计划 |

## 显示列表清单

manifest `/displayObjects` 是完整机器清单；文档只作分组导航：

- 596 根：365 全舞台底、368 `resetbtn`、375 `lhmc`、421 `introducemc`、431 左侧底、
  436 `btn_sj`、437..445 九个动态 TextField、31 `btn_close`、595 `showmc`。
- character 200：14 全舞台遮罩、19 `okbtn`、24 `nobtn`、199 `txt`。
- character 34：14 全舞台遮罩、19 `okbtn`、24 `nobtn`、33 `txt`。
- button normal/over/down/hit 的透明导出路径位于各对象的 `render.buttonStateAssets`；
  动态字段来源位于 `render.textStyle`。

所有 root local matrix、stage bounds、depth、父子关系和命中区直接见 manifest；不得在实现文档或
TypeScript 中另存第二套手抄坐标。

## 状态、基准与差异合同

21 个状态覆盖未装备、正常页、三个根按钮的 hover/pressed、灵魂升级成功/拒绝、普通材料确认、
特殊材料确认、确认按钮 hover/pressed、取消、重置确认/取消/材料不足/完成、P2 无入口与关闭。
结构基准由 FFDec 26 从同源 596/200/34 选择性渲染，并以原按钮 over/down 透明资源合成；动态字段
具体值由 fixture 与 AS3 合同验证，不能把结构 PNG 的空 TextField 反解为原版空数据。

后续 `TASK-SLICE-181` 必须冻结同尺寸当前页，再产生原版/现代并排、50% 叠图与逐对象差异：

- 必须删除：现代暗层、矩形面板、Arial 标题/按钮、摘要和通用 chrome。
- 必须复用：596 根、368/436/31 按钮三态/命中、200/34 确认层与原 TextField 几何。
- 等价动态重建：法宝展示/说明帧、灵魂进度和字段值；只能投影既有 owner。
- 容差：只允许字体栅格化/抗锯齿边缘误差；对象缺失、额外覆盖、坐标/depth/状态错误为零容差。
- 现代视觉例外：空。

## 实现合同

`FormalMagicWeaponPageView` 应直接消费 manifest 或由生成器产生的只读投影；
`FormalMagicWeaponPageSystem`、`MagicWeaponSystem`、库存、灵魂、装备和当前存档继续是唯一业务 owner。
实现任务不得重写强化/重置规则，不得伪造 P2 原版面板，不得用整页 PNG 覆盖动态字段，也不得把
原页按钮替换为通用组件皮肤。


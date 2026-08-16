# TASK-SETTINGS-175D 技能四页机器真值迁移

## 结论

`OtherMat1.swf` 的技能总页 250、主动页 868、绑定页 417、被动页 213 已从旧视觉审计升级为当前 Schema 的 `verified` 原版机器真值：

- truthId：`task-settings-175d.skill-pages`
- manifest：`docs/reverse-engineering/ground-truth/manifests/task-settings-175d-skill-pages.json`
- 范围：250 个 scoped display object、32 个状态、15 张 940×590 恢复源结构基准。
- 完整性：四页根、212 五个被动行帧、865 十棵主动树均由 SWF PlaceObject 与本轮 FFDec SVG 逐帧匹配；50 个主动技能图标各自的 locked/unlocked/learned 三帧均重新从同一恢复源导出并纳入生成器检查。
- 影响实现的未知：0；`/completeness/unresolved=[]`。

本任务没有修改技能业务或 `src/`。当前现代页面是否直接消费 manifest 仍由后续实现任务验收，不能由本证据任务反推为已经完成。

## 待证明问题与裁决

| 待证明问题 | 裁决 | 精确入口 |
| --- | --- | --- |
| 四页是否来自任务合同冻结的同一恢复源 | 是；SHA-256 为 `97478E1E03A22C7D06197FFB75AB890D98B084377CBDCF394716CBAF27082126` | manifest `/provenance/0` |
| 250/868/417/213 的根显示列表、depth、实例名和矩阵是否仍与旧审计一致 | 是；分别为 5、14、8、6 个根 child，SWF/SVG 逐项一致 | manifest `/displayObjects`；生成器 `crossCheckedSource` |
| 主动页是否完整覆盖五角色×两心法与 50 个技能三态 | 是；865 的 10 帧分别为 16/17/16×8 个直接 child，50 个技能 sprite 各有 3 帧 | manifest 中 `active-page-root.tree-frame-*`；状态 `active-role*-tree*` |
| 绑定页是否保留 P1/P2 两帧、五个 76×76 槽、拖放/回退与关闭提交 | 是；393/398/403/408/413 两帧与 417 根、动态 source/slot child、AS3 调用链共同闭合 | manifest 状态 `bind-*` 与 `/provenance/3` |
| 被动页是否保留五行帧、四字段、五公式和满级隐藏 | 是；213→212 frame 1..5 与 `PassiveSkill.setTxt/analy/updataSkill` 交叉确认 | manifest 状态 `passive-*` 与 `/provenance/4..5` |
| 是否存在可见现代例外 | 无 | 本文“现代差异与例外” |

## 六段证据链

| 行为合同项 | 局部证据 | 共享调用链 | 几何/坐标证据 | 证据等级 | 未知与反证条件 | 验证方式 |
| --- | --- | --- | --- | --- | --- | --- |
| 总页与子页生命周期 | 250、868、213、417；`BuySkill` | 地图/战斗入口把具体 `User` 交给 `BuySkill`，子页由 `playerControl` remove/add，返回恢复 `maping/gameing` | 250 为 940×590；子页仍使用原舞台坐标，不采用 SVG 裁切平移 | 交叉确认 | 若恢复源 hash、根 child 数或实例名变化则失效 | 生成器 source/hash/PlaceObject/SVG 回测 + 后续运行返回验收 |
| P1/P2 与角色 selected | 218/223/228/233/871 两帧 | `BuySkill.setRole/selectRole` 将当前 owner 传给主动/被动页 | selector 位于 `x=50+(i-1)×90,y=14.85`；frame 2 为 selected | 交叉确认 | 同角色双 owner 不产生额外原版编号；新增可见 P1/P2 文本需用户批准 | manifest selector 对象、P1/P2 状态 + 后续正式入口运行观察 |
| 主动十树与技能三态 | 868→865 frame 1..10、50 个技能 sprite frame 1..3 | `SkillControl.setRole/setMainSkill/showSkill` | 865 根矩阵与每帧 child depth/matrix；learned 动态 `LV.n` 位于局部 `(35,48)` | 交叉确认 | 不允许假设十帧同构或从现代 layout 常量补位置 | 10 帧 SWF/SVG 完整性、150 个源帧存在性、后续 DOM/Canvas stage 坐标回测 |
| 按钮状态 | 240/244/248/337/580/638/207 | 各页面 click/over/out/close handler | up/over/down/hit PNG 均由同源按钮导出；命中区来自 PlaceObject 可见/命中边界 | 交叉确认 | 主动/被动标签无持久 selected；新增 selected 外框即反证 | manifest `buttonStateAssets` + 后续逐按钮 pointer 截图 |
| 绑定拖放与提交 | 417、五槽两帧、source 与槽内动态 child | `SkillSetControl.startDrag/hitTestObject/unshift/close` | 五个 76×76 原槽；图标吸附 `slot+(5,5)`，落空回 `(ox,oy)` | 交叉确认 | 点击/键盘仅可作为不可见输入等价，不能新增可见提交按钮 | `bind-*` 状态、AS3 pattern 门禁 + 后续 P1/P2 拖放/点击等价运行验收 |
| 被动五行与字段 | 213、212 frame 1..5、207 | `PassiveSkillControl.setRole` 与 `PassiveSkill.setTxt/analy/updataSkill` | 五行舞台矩阵、四 TextField 与按钮矩阵由源逐帧提取 | 交叉确认 | 顶部空表头保持；字段不得退回裸数值 | `passive-*` 状态、五帧完整性与后续 940×590 字段验收 |

## 显示列表与状态完整性

生成器 `tools/generate-skill-pages-ground-truth.mjs` 直接解析恢复 SWF 的 DefineSprite/PlaceObject/RemoveObject/ShowFrame，并将结果与 `local-resources/regima/task-outputs/task-settings-175d-skill-pages/exports-svg/` 的本轮 FFDec 导出逐项比较。固定根计数为：

| Symbol | 帧 | 根 child 数 | 动态/嵌套补充 |
| --- | ---: | ---: | --- |
| 250 `BuySkill` | 1 | 5 | 两个 fixture 角色 selector 与 868/213 动态子页 |
| 868 `SkillControl` | 1 | 14 | 865 十帧树；每帧五技能、五设置、五升级与背景 |
| 417 `SkillSetControl` | 1 | 8 | source、五槽绑定技能与键帽动态 child |
| 213 `PassiveSkillControl` | 1 | 6 | 五个 212 行；每行 6 个直接 child |
| 212 `PassiveSkill` | 1..5 | 各 6 | 四 TextField、背景、207 升级按钮 |
| 865 主动树 | 1..10 | 16/17/16×8 | 50 个唯一技能 sprite，各 3 帧 |

32 个状态覆盖总页按钮 normal/hover/pressed、角色 selected、十棵技能树的三态 fixture、绑定 P1/P2/拖动/命中/落空/关闭、被动 P1/P2/动态字段/按钮/满级隐藏和返回。完整枚举位于 manifest `/states`，逐状态可见对象数位于 `/completeness/expectedVisibleObjectCountByState`。

## 原版视觉基准与差异入口

`tools/generate-skill-pages-baselines.ps1` 只组合本轮恢复源 PNG 导出，生成 `docs/tasks/evidence/TASK-SETTINGS-175D/original-*-940x590.png`：十棵主动树、绑定 P1/P2、被动 P1/P2和关闭透明态共 15 张。每张的 SHA-256、940×590 尺寸与裁切写入 manifest `/baselines`。

后续消费任务必须在相同 940×590 舞台下，为代表状态生成现代截图、并排图与 50% 叠图，并以 manifest 对象表输出“原资源复用 / 等价动态字段 / 用户批准例外 / 未完成”差异清单。字体抗锯齿可设容差；对象存在性、层级、矩形、基线、颜色、按钮帧和命中区不容差。

## 现代差异与例外

允许的新增可见现代例外：空。

既有暗层、通用外框、P1/P2 文字按钮、顶部 tabs、通用技能/槽按钮、永久摘要和通用关闭均仍是待删除的现代替代层。不可见的可访问名称、tab order、live region，以及不改变 76×76 命中和 x_btn 提交时机的点击/键盘等价继续允许。

## 实现交接

后续实现 owner 必须直接读取 `task-settings-175d-skill-pages.json` 或消费由它可重复生成的投影；不得继续把 `FormalSkillPageView` 手写常量作为视觉真值。实现前重新运行：

- `npm run test:skill-pages-truth`
- `node tools/validate-ui-ground-truth.mjs docs/reverse-engineering/ground-truth/manifests/task-settings-175d-skill-pages.json`

证据真值已闭合，但 `VS-055` 仍保持“待机制”：只有直接消费、现代覆盖层删除、P1/P2 业务/存档回归和逐状态 940×590 差异证据全部通过后，才能恢复“技能页面 UI 原生化闭环”结论。

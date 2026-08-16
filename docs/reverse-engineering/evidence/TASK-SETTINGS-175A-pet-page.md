# TASK-SETTINGS-175A 宠物页 932 原版真值

## 结论

`task-settings-175a.pet-page` 已达到 `verified`。恢复源 `assets/pet1.swf` 的 SHA-256 为
`0699A5D3A49EA8024D3635B18C6349F5D7F7CF5F1DB869DD18A0A5EE6DE60644`；character 932
在 940×590、24fps、top-left 舞台上包含 50 个根帧 child。AS3 运行时再创建最多 5 个
character 1224 列表行、选中宠物头像、8 个 `skillImage`、character 1228 技能说明和
character 1221 放生确认。manifest 共序列化 74 个对象、16 个状态，`unresolved=[]`。

权威入口：

- manifest：`docs/reverse-engineering/ground-truth/manifests/task-settings-175a-pet-page.json`
- 生成器：`tools/generate-pet-page-ground-truth.mjs`
- 结构基准：`docs/tasks/evidence/TASK-SETTINGS-175A/original-*-940x590.png`
- 关键 JSON Pointer：`/displayObjects`、`/states`、`/completeness/expectedVisibleObjectCountByState`

## 待证明问题与答案

1. 932 的静态显示列表是否完整？是。生成器直接解析恢复 SWF 的 DefineSprite/PlaceObject
   depth、character、instanceName 和 matrix，并与 FFDec 26 的 932 SVG 50 个根 `<use>`
   逐项相等校验。
2. 列表、选中、技能和确认是否只是现代推断？否。它们分别由
   `PetInterface.setPetList/plClick/addPetHead/setPetAllSkill/releaseClick` 与
   `PutPetSkill.setImage/show/hide` 建立，源 character 1224/1228/1221 再由同一恢复 SWF
   选择性导出交叉确认。
3. P1/P2 是否两套页面几何？否。两者都构造同一个 932，差异仅为传入的 `User` owner；
   P1/P2 状态共享同一舞台坐标。
4. 是否存在允许的现代可见例外？没有。当前暗层、矩形面板、Arial 标题/按钮和摘要均为
   待删除覆盖层，不是原版对象。

## 六段证据矩阵

| 合同项 | 局部证据 | 共享调用链 | 几何/坐标证据 | 等级 | 未知/反证 | 验证 |
| --- | --- | --- | --- | --- | --- | --- |
| 根页与静态 child | `pet1.swf` 932、`PetInterface` 声明字段 | `RoleInfo.cwClick -> new PetInterface(User)` | SWF PlaceObject depth/matrix 与 932 SVG 50/50 匹配 | 交叉确认 | 源哈希或对象序列漂移则失效 | 生成器 `--check` + Schema |
| 1..5 行与两页 | `setPetList/setCurPage`；1224 `petlist` | owner 的 `petsAry`，固定 `pageNum=5/allPage=2` | `(349.85, 142.5 + row*26)`；1224 为 112×21 | 交叉确认 | 列表文字由运行态写入，不把结构 PNG 的空字当成空数据 | 状态计数 61 + AS3 fixture |
| selected/出战/休息 | `plClick/fightClick/restClick/addPetHead` | 对应 hero `changePet()` 与 `CHANGECURRENTPET` | 头像根 `(280,220)`；monkey1 fixture 70×70、offset `(-8,-10)`；selected 色 `#fdfcba` | 交叉确认 | 宠物种类只改变同容器内 bitmap fixture | owner/selected 状态回测 |
| 属性/进度/进化 | `setShow/reAttribs/revolution/AfterSuperRevolution` | `PetInfo` getter、背包道具、共享 alert host | 932 原字段矩阵；经验/五进度条各 20 帧，品质 3 帧 | 交叉确认 | alert 不属于 932 child，禁止伪造为页内 toast | JSON 对象 + 行为公式测试计划 |
| 8 技能与 hover | `setPetAllSkill`、`PutPetSkill` | `PetInfo.skill` 与 `AUtils.getImageObj("petskill_"+sname)` | 8 个 57×57 槽；tooltip 1228 为 144×105.55，槽内 `(28.5,28.5)` | 交叉确认 | icon 内容由稳定 skill key 查运行资源，不改变 932 几何 | 8 技能/hover 状态 |
| 放生确认 | `releaseClick/okClick/noClick` | roster mutation、出战 hero refresh | 1221 全舞台；1215/1220 位于 `(376.3,329)` / `(463.3,329)` | 交叉确认 | 无 | 原确认态基准 + Schema |
| 关闭与 P1/P2 | `close/__closePetInterface/removed` | P1 B、P2 num `-`；单机 continueGame | closed 可见对象数 0；P1/P2 几何相同 | 交叉确认 | 原版无 P2 几何变体 | 16 状态集合与 owner fixture |

## 显示列表清单

manifest `/displayObjects` 是完整机器清单；文档只作分组导航：

- 932 根帧：背景 810；8 个 813 技能槽；830 属性底板；835/840/845 出战/放生/休息；
  852/858/863/868/873/878 六个进度 MovieClip；883 关闭；891 品质；21 个动态 TextField；
  915 进化；920/925 分页；1323/1324 属性/技能洗练。
- 动态列表：5×1224，每行含 1222 `petname` 和 1223 行底；selected 只改变文字颜色。
- 动态选中：`PetHeadSprite` 在 releasebtn 之前；monkey1 固定 fixture 证明容器 bounds，
  实现须按 pet key 投影对应同源 bitmap。
- 动态技能：8×`skillImage`；hover 时在对应 813 内加入 1228，其中 1226/1227 为名称/说明。
- 动态确认：1221 全屏 overlay，包含 1215 `okbtn`、1220 `nobtn` 及原按钮状态/命中区。
- button normal/over/down/hit 的 character 映射位于 `render.buttonStateAssets`；`upBtn` down
  状态只在 y 方向增加 2px。

所有 root local matrix、stage bounds、depth、父子关系和命中区直接见 manifest；不得在实现文档或
TypeScript 中再维护一套手抄坐标。

## 状态、基准与差异合同

16 个状态覆盖空 P1/P2、两页五行、selected、出战/休息、8 技能、技能 hover、按钮
hover/pressed、放生确认、属性/技能洗练、进化、selected P2 与关闭。结构基准由 FFDec 26
从同源 character 932/1224/1221 选择性渲染后合成；它们验证原静态皮肤、动态 child 的舞台
位置和确认 overlay。动态姓名、数值、宠物帧、skill icon 和 tooltip 文字由 fixture 及
manifest/AS3 合同验证，不能把结构 PNG 中的空 TextField 反解为原版空数据。

后续 `TASK-SLICE-180` 必须冻结同尺寸当前页，再产生原版/现代并排、50% 叠图与逐对象差异：

- 必须删除：现代暗层、矩形面板、Arial 标题/按钮、摘要、通用 chrome。
- 必须复用：932 根、原按钮三态/命中、1224 行、1228 tooltip、1221 确认与原 TextField 几何。
- 等价动态重建：宠物头像 bitmap、skill icon、动态字段值；只能投影既有 owner。
- 容差：只允许字体栅格化/抗锯齿边缘误差；对象缺失、额外覆盖、坐标/depth/状态错误为零容差。
- 现代视觉例外：空。

## 实现合同

`FormalPetPageView` 应直接消费 manifest 或由生成器产生的只读投影；`PetOwnershipSystem`、
roster、成长、道具、战斗和当前存档继续是唯一业务 owner。实现任务不得重写宠物规则，
不得用整页 PNG 覆盖动态字段，也不得把原页按钮替换为通用组件皮肤。


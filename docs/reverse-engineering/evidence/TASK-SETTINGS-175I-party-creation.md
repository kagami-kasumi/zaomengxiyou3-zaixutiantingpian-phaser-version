# TASK-SETTINGS-175I 建档/选角 1149/901 原版真值

## 结论

`task-settings-175i.party-creation` 已达到 `verified`。恢复源 `assets/OtherMat1.swf` SHA-256 为
`97478E1E03A22C7D06197FFB75AB890D98B084377CBDCF394716CBAF27082126`；`assets/Common1.swf`
SHA-256 `7459555A0D76872F93BCB164079FFF496A9A68730F85FE4015EA0D2C2337CACD` 仅用于 69/18 共享入口交叉对照。
manifest 序列化 20 个 scoped 对象、30 个状态，覆盖人数页、主菜单隐藏对象、五卡、两个文字字段、
空 895、P1/P2 marker、取消/完成/重载流程映射，`unresolved=[]`。

权威入口：

- manifest：`docs/reverse-engineering/ground-truth/manifests/task-settings-175i-party-creation.json`
- 生成器：`tools/generate-party-creation-ground-truth.mjs`
- 基准生成器：`tools/generate-party-creation-baselines.ps1`
- 原版基准：`docs/tasks/evidence/TASK-SETTINGS-175I/original-*-940x590.png`
- 关键 JSON Pointer：`/displayObjects`、`/states`、`/completeness/unresolved`

## 待证明问题与答案

1. 人数页是否仍混入主菜单对象？没有。1149 的 1P/2P/返回回到原矩阵，六个主菜单对象按 `showSelectNum()`
   移到 `x=1110`，在 manifest 中保留为明确不可见对象。
2. 五张卡与 895 是否误认？没有。877/883/888/894/900 是五张可见卡；895 是零尺寸空按钮，只保留身份，
   不计可见/命中对象。
3. 状态与 selected 是否完整？是。五卡 normal/hover/pressed/selected 均枚举；hover/down 共用彩色视觉，
   selected 由 `upState=downState` 持久化，没有现代边框。
4. P1/P2 顺序是否可见且可测？是。`curSelected` 从 1 开始，hover marker 为 card x-50/y=40；双人 P1 点击后
   该卡移除三个 listener，P2 只能选择剩余角色，最终 P2 点击结束选角。
5. 原子建档是否被冒充为原版显示对象？没有。原版最终点击只派发 `SelectOver`；现代最终点击一次写槽是用户确认的
   流程映射。取消、完成和重载均以选角主体移除的 frame 0 状态记录，不新增可见控件。

## 六段证据矩阵

| 合同项 | 局部证据 | 共享调用链 | 几何/坐标证据 | 等级 | 未知/反证 | 验证 |
| --- | --- | --- | --- | --- | --- | --- |
| 1149 人数态 | `GameMenu.showSelectNum/selectNum/backClick` | `newGameClick` → `StartSelectRole` | 1P `(751.15,197.55)`；2P `(751.15,250.75)`；返回 `(800,314.35)` | 交叉确认 | 源哈希漂移则失效 | 7 状态基准、对象计数、Schema |
| 主菜单隐藏 | `showSelectNum()` 六次 `x=1110` | 同一个 1149 时间轴，不创建覆盖层 | 六对象 stage x 在 940 外 | 交叉确认 | 不得用裁图缺失冒充对象不存在 | 不可见 placement 与负向检查 |
| 901 根/五卡 | `SelectRole.added/removed` | `GMain.selectRole`、`Config.createHero` | 五卡注册 x=118.05/306.4/494.2/682/870.2；1081×1067 导出裁为 x0..939/y189..778 | 交叉确认 | 895 是零尺寸空按钮 | 五卡 16 状态与 940×590 基准 |
| 按钮态/命中 | `over/out/onClick` | listener 生命周期 | 五个整高命中列；up 灰度，over/down 彩色无位移 | 交叉确认 | 透明边缘采样不改变对象几何 | manifest hitArea、逐卡状态 |
| selected/P1→P2 | `onClick/newRole` | `playNum/curSelected/roleid` | marker `x=card.x-50,y=40`，84×84 | 交叉确认 | 同角色第二次点击必须不可达 | selected + P2 hover fixture |
| 取消/完成/重载 | `backClick/selectOver`；现代原子 API | 原版晚存盘；现代 `CreateProfileDraft` 最终一次写 | 退出后 1149/901 主体均不可见 | 确认事实 + 用户批准映射 | 新增可见确认/取消需重新批准 | frame 0 基准 + 既有 flow tests |

## 原版基准与差异合同

30 张 940×590 基准来自同哈希恢复 SWF 的既有选择性派生：人数页按 1111/1115/1136 原生帧；角色页从
1081×1067 导出按 `x=0..939,y=189..778` 裁切，逐卡状态和 108/115 marker 按原注册点叠加。退出态透明图只表示
1149/901 选角主体已移除，不代表原版主菜单、现代六槽或地图为空。

后续 `TASK-SLICE-187` 必须让 `SavePartyCreationView` 直接消费 manifest 或其可重复只读投影，并完成：

- 30 状态对象/depth/matrix/bounds/hitArea 的确定性回测；
- 940×590 并排、50% 叠图、稳定边缘和逐对象差异；
- 人数返回、角色 Escape、1P 五种、2P 20 种有序不同组合、最终一次写槽和重载；
- 新增现代标题、角色名、选中框、通用确认/取消或替代按钮零容差。

## 实现边界

`SaveProfileDraftSystem`、`SaveSlotSystem` 与当前单 schema owner 保持不变。本 task 没有修改 `src/`、存档 schema、
建档事务或路由；`TASK-SLICE-187` 只删除 `SavePartyCreationView` 中手写的坐标/命中/状态真值源并接入 manifest。

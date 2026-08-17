# TASK-SETTINGS-189 装备悬停数值原版证据

## 范围与结论

本任务只闭合原版 `ShowObj -> AttributeCon` 装备 tooltip 的触发、动态显示列表、字段格式、舞台定位、实例值来源、刷新生命周期和消费者边界，不修改现代 `src/`。

- 恢复源 `1_MainLoad__main1.swf` 的选择性 FFDec 导出包含 `export.pack.AttributeCon`、`ShowObj`、`PackThings`、`BackPack` 与 `my.MyEquipObj`；其中 `AttributeCon.as` / `ShowObj.as` 与 legacy 主行为包文件 SHA-256 分别完全相同，因此动态显示列表达到交叉确认。
- tooltip 没有独立 SymbolClass、character id 或时间轴。根是代码创建的 `Sprite`；背景、容器、TextField 与分隔线全部由 `AttributeCon` 在 `ADDED_TO_STAGE` 时创建。
- 权威机器真值为 `task-settings-189.equipment-tooltip`，路径 `../ground-truth/manifests/task-settings-189-equipment-tooltip.json`；`/states` 有 12 个状态，`/displayObjects` 有 32 个逻辑对象，`/completeness/unresolved=[]`。
- 940×590 基准位于 `docs/tasks/evidence/TASK-SETTINGS-189/original-source-replay-*.svg`。它们是恢复主 SWF ABC 的确定性 AS3 source replay，不是现代页面截图，也不伪装成 Flash 运行截图。由于对象纯代码生成、没有可供 FFDec 单独渲染的 character，此基准是当前可重复的一手结构基准；190A 仍必须用正式运行态对字体栅格和最终像素做第二重验证。

## 待证明问题

1. 哪个对象触发 tooltip，进入、移动、离开、删除时如何创建、定位与销毁？
2. 原版显示哪些元数据、属性、说明和价值，零值、百分比和强化附加值如何格式化？
3. 随机基础值、强化值、成长字段与当前现代 equipment instance 如何同源？
4. 已穿戴槽、背包格、工坊和商城是否使用同一 tooltip；哪些消费者属于当前装备范围？
5. 页码、穿脱、事务、P1/P2、关闭/重开后是否会留下陈旧 tooltip？

结论：上述问题均已回答，影响 190A 与拆分后的 190B1..190B4 的行为未知为零。

## 六段证据链

| 段 | 局部证据 | 共享调用链 | 几何/可观察合同 | 等级 | 反证与验证 |
| --- | --- | --- | --- | --- | --- |
| 1. 局部对象 | `AttributeCon.as:22-277` | `ShowObj.as:116-203` 创建/移动/删除根 | 根 `Sprite` 下 `bg` 与 `(20,10)` 的 `info`；TextField、分隔线、圆角背景均动态创建 | 交叉确认 | 恢复主 SWF ABC 或 legacy 文件 hash 改变时重开；生成器 `--check` |
| 2. 共享调用链 | `BackPack.as:550-561` 六槽；`BackPackElement.as:181-207` 5×5 格；Making/Fusion/Resolution 的 `new ShowObj` | `PackThings.setObj`、`BackPack.curequip`、工坊四页和 ShopThing/SingleShop | 所有正向消费者都复用 `ShowObj -> AttributeCon`；商城 `Micropayment + zbsz` 明确移除 hover listener | 交叉确认 | 出现第二 tooltip 类或页面私有属性拼装时重开；消费者双向搜索 |
| 3. SWF/坐标 | restored `1_MainLoad__main1.swf` ABC；170B1/167/175F 各页面 manifest | `ShowObj.showattribute/refreshPoint` | 舞台 940×590；若 `mouseX + width > 930` 则左翻 `mouseX-width-10`，否则右移 10；Y 为 `min(mouseY,590-height)` | 交叉确认 | 930/590 常量或页面 stage scale 变化时重开；`#/states/right-edge-flip-hover`、`bottom-edge-clamp-hover` |
| 4. 行为合同 | `AttributeCon.drawInfo/drawAttribute` 与 `MyEquipObj` getters | `task-settings-189.equipment-tooltip#/displayObjects` | 条件元数据、非零 11 属性、说明与价值；hover 创建、move 跟随、out/removal 销毁 | 确认事实 | 新字段或不同零值门禁出现时重开；字段表与 fixture 自动对账 |
| 5. 现代映射 | `EquipmentSystem.ts:64-70,257-278`、权威目录 164 项 tooltip/base/strength/progression | 正式背包、共享 grid 与工坊 operation view | `definition + baseStatsOverride + strengthLevel` 是唯一实例 owner；tooltip 只读投影，不能缓存第二份数值 | 现代设计选择 | 页面自行拼值、复制目录或脱离 `getEquipmentInstanceStats` 时失败 |
| 6. 双重验证 | 生成器、UI Schema、目录生成器、annotations/workflow 检查 | 190A/190B* 正式路由 | 本 task 证明原版结构与行为；实现 task 必须再做自动 fixture 与 940×590 P1/P2/事务视觉运行验证 | 交叉确认 | source replay 不能替代现代正式运行截图；字体差异单列容差 |

## 显示列表与几何

关键 JSON Pointer：

- 根：`/displayObjects/0`，`export.pack.AttributeCon`，无 character id。
- 背景：`/displayObjects/1`；白色 1px 描边、黑色 `alpha=0.7`、圆角 5。
- 信息容器：`/displayObjects/2`；根局部 `(20,10)`。
- 名称：`/displayObjects/3`；16px FZCuYuan，颜色取实例 `color`，强化非零时 `名称(+N)`；`drawInfo()` 随后先执行 `++i`，因此品质从下一个 25px 行开始，不与名称重叠。
- 条件元数据：`/displayObjects/4..18`；每项由黑色粗体白辉光 label、80px 白色渐隐分隔线和 value TextField 组成。
- 属性行：`/displayObjects/19..29`；16px `0xff9933` 粗体，25px 行距。
- 说明/价值：`/displayObjects/30..31`；135px 换行说明与 `价值 : N 灵魂`。
- 边缘定位：`/states/6..7`；退出/刷新/商城时装负状态：`/states/8..11`。

`AttributeCon` 的 child 创建顺序并不等于最终根深度：`drawInfo()` 先加 `info`，`drawbg()` 后加 `bg`，随后若 `bg` 在 `info` 上方则交换，最终背景在下、信息在上。tooltip 直接加到 `GMain.stage`，不是格/槽的局部 child，因此其坐标空间从创建时起就是舞台坐标。

## 字段、格式与实例值

| 可见字段 | 原门禁与格式 | 原值来源 | 现代权威映射 |
| --- | --- | --- | --- |
| 名称 | `strength=0` 显示 `ename`，否则 `ename(+N)` | `ename/getStrengthValue()` | `definition.name + instance.strengthLevel` |
| 品质 | 非空显示 `品质`，value 使用装备颜色 | `quality/color` | `definition.quality/color`，目录 `#/items/*` |
| 类型/角色 | `类型`；限定角色时 `etype·user` | `MyEquipObj.trans(type)` / `user` | 目录 `tooltip.typeLabel` + `definition.user` |
| 法宝等级 | 仅 `type=zbfb && getELevel()!=0`，`Lv.N` | `param21.elevel` | 目录 `progression.equipmentLevel` |
| 成长率 | 非零显示原 Number 字符串 | `param21.eupdata` | 目录 `progression.upgradeRatio` |
| 五行 | 非空时按金木水火土顺序并保留尾空格 | `getWX()` | 目录 `fiveElements`；当前 164 构造态均 false，未来实例变化仍按同一顺序 |
| HP/MP/攻击/防御/回血/回魔/泣血 | `int(getter(false)) != 0` 才显示；正文用基础 getter(true)，强化另写 `(+N)` / `(-N)` | 基础随机实例 + 对应强化 getter | `baseStatsOverride` 覆盖 definition 基础值；`strengthGrowth * strengthLevel` 为后缀 |
| 暴击/闪避/魔抗/命中 | `int(getter(false)*100) != 0`；基础 `changeNumber(base*100,2)%`，强化后缀为 `changeNumber(bonus*100,2)`，后缀不带 `%` | 比例 getter 与强化比例 | 现代目录使用百分数点，投影前必须明确单位，禁止二次乘 100 |
| 说明 | 135px、14px、wordWrap，允许原 HTML/fashion 追加文案 | 构造器 `param20` / `instruction` | 目录新增 `tooltip.instruction` |
| 价值 | `价值 : N 灵魂` | `transValue()` 品质表 | 目录新增 `tooltip.soulValue`；原 `魔 王` 无 switch 分支，确认值 0 |

`drawAttribute()` 使用 `getter(false)`（基础+强化）判断整行是否出现，却用 `getter(true)` 写基础正文、单独用强化 getter 写括号后缀。现代不能把 `getEquipmentInstanceStats()` 的总值直接打印成唯一数字，否则会丢失原版“基础(+强化)”格式。制造/Fusion 的随机或继承结果已经落在当前 `baseStatsOverride`；强化仍由 `strengthLevel` 与 `strengthGrowth` 派生，不新增第二实例数值 owner。

## 生命周期与刷新合同

- `ROLL_OVER`：新建一个 `AttributeCon(instance)` 并直接 `stage.addChild`；按当前 mouse 和 tooltip 实际宽高定位。
- `MOUSE_MOVE`：只要面板存在，每次重新执行相同的 930/590 定位公式。
- `ROLL_OUT`：从当前 parent 移除并将引用置空；若父是 `PackThings`，数量文字恢复可见。
- `PackThings.CLICK`：先移除 tooltip，再打开/关闭操作层。
- `ShowObj.REMOVED_FROM_STAGE`：移除三个 mouse listener 并调用统一销毁；分页、分类、穿脱、事务返还和关闭重建不会保留旧面板。
- P1/P2 只改变传入的 `MyEquipObj` owner，不改变显示列表与几何。
- 商城 `ShowObj` 若祖先为 `Micropayment` 且 `type=zbsz`，创建时即移除 ROLL_OVER/ROLL_OUT；这是一条原版负合同，不得给商城时装补 tooltip。

## 消费者迁移矩阵

| 消费面 | 原版入口 | 当前现代入口 | 装备范围 | 后续任务 |
| --- | --- | --- | --- | --- |
| 正式背包 5×5 装备格 | `BackPackElement.drawgz -> PackThings.setObj -> ShowObj` | `FormalInventoryPageView.ts:102` / `InventoryGridView.ts:22-35` | 正向；当前 equipment entry 无 hover | `TASK-SLICE-190A` |
| 正式背包六个已穿戴槽 | `BackPack.curequip:550-561` | `FormalInventoryPageView.ts:126-154` | 正向；与格共享 tooltip，槽/格皮肤仍各自保留 | `TASK-SLICE-190A` |
| 工坊共享右侧背包 | `StrengthEquipment` 内 `BackPackElement` | `FormalWorkshopPageView.ts:104` | 正向；四 tab 共用 grid 行为，但每 tab 生命周期独立验收 | 190B1..190B4 分页继承 |
| 强化操作槽 | `Strength` 经背包格移动实例 | `FormalWorkshopNativeOperationView.ts:48-53` | 目标装备正向；石/符为非装备排除 | `TASK-SLICE-190B1` |
| 熔合材料/预览/产物 | `Fusion.as:526,545` | `FormalWorkshopNativeOperationView.ts:81-85` | 装备实例/装备产物正向 | `TASK-SLICE-190B2` |
| 分解目标/结果 | `Resolution.as:229` | `FormalWorkshopNativeOperationView.ts:106-108` | 目标装备正向；分解材料结果为非装备排除 | `TASK-SLICE-190B3` |
| 打造需求/产物 | `Making.as:184,353` | `FormalWorkshopNativeOperationView.ts:134-141` | 最终装备产物正向；书/材料/宝石排除 | `TASK-SLICE-190B4` |
| 商城九卡 | `ShopThing -> PackThings` | `ShopScene.ts:163-238` | 当前 49 商品无 `zblist` 装备；时装原版禁用 hover，其余是非装备 tooltip，作为负回归，不生成装备实现 task | 190B4 关闭矩阵时静态/运行负检 |
| 神秘商城/仓库 | `SingleShop -> PackThings`；`BackPackElement.selfSetPlayer -> WareHouse` | 无正式现代路由 | 活动/在线遗留或未建页面，超出本线 | 不生成 task；新增正式路由时按本证据重开 |

工坊存在四个独立 verified 页面真值与事务生命周期，命中原 `TASK-SLICE-190B` 拆分门禁。因此 190B 标记 `Split`，串行子任务为强化、熔合、分解、打造；不得以共享 tooltip 为理由合并页面皮肤或视觉验收。

## 原版基准、现代例外与逐状态验收

- 原版结构基准：`docs/tasks/evidence/TASK-SETTINGS-189/original-source-replay-*.svg`，940×590、transparent stage、FZCuYuan-M03；每张 SHA 在 manifest `/baselines`。
- 170B1 页面基准继续证明正式背包父显示列表；167 四份 workshop manifest 与 175F 商城 manifest 分别证明各父页面，不由 tooltip 基准替代。
- 允许的现代可见例外：空清单。
- 190A/190B* 必须逐状态覆盖 normal/hover/move-out、背包/已穿戴、随机基础/强化、法宝 progression、右翻/底夹、P1/P2、分页/事务刷新、关闭/重开；商城时装必须保持无 tooltip。
- source replay 与 Phaser 的字体栅格、抗锯齿允许单列容差；对象缺失、字段/单位/行距/层级、边缘翻转和生命周期不允许用字体容差掩盖。

## 未知与反证

- 影响实现的未知：0。
- `unresolved=[]` 不代表已有 Flash 运行截图；它表示动态显示列表、字段、公式、状态与源 provenance 已闭合。实现后的像素结果仍由 190A/190B* 双重验证。
- 若出现新现代正式消费者、第二 tooltip 类、商城商品集合新增 `zblist` 装备、实例 owner 新增独立随机/继承字段，或原 source hash 改变，按本矩阵重开并重新分区。

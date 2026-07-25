# 原版 1.1 背包资源全集证据目录

本文先闭合 `TASK-SETTINGS-070 / GOAL-049` 的证据范围，随后由
`TASK-SLICE-160 / GOAL-050` 接入可机器消费的身份、分类、数量、容量、存档、
图标和 owner 合同。逐条记录位于
`reference/inventory-resource-catalog-1.1.json`；本文保存范围定义、六段证据链、
显示列表复核、差异与验收输入。

## 状态与范围

- 权威全集定义：`AllEquipment.findByName()` 可以返回、因而能通过原版四类背包
  存档加载门禁的唯一 `fillName` 集合。
- 注册发生 433 次，按原查找优先级折叠为 431 个唯一身份。
- 四分类为装备 164、道具 235、时装 20、技能书 12；实例 184、堆叠 247。
- 428 项图标已按原 `ShowObj` 请求名/别名与恢复 SWF SymbolClass 交叉定位。
  另有 2 项原查找名错误、1 项原资源缺失；三者均无外部 AS3 生产者，保持
  “目录缺陷、不可提升为可玩内容”，不生成替代图。
- 431 项均已接入统一现代 definition registry；428 项合格图标已接入背包
  懒加载 bundle，三项原版缺陷按证据排除。
- 物品专属使用效果不在本 task 逆向。机器目录逐项登记为“既有专属系统已覆盖”
  或“待实现/待专门复核”，不得因身份和图标已闭合而宣称用途已完成。

## 待证明的可观察问题

1. 原版 1.1 哪些稳定身份能进入四类背包和存档门禁。
2. 每项属于哪个列表，是实例还是按 `fillName` 合并的堆叠，怎样占用容量。
3. 背包实际请求哪个图标 symbol，别名和跨包例外是什么。
4. 合成、商城、任务、丹药、掉落、工坊和存档如何共享同一身份。
5. 现有现代目录覆盖多少，哪些条目仍待统一 owner 接入。
6. 背包 304/246 的静态 child、动态格子、按钮状态、分页和详情字段如何消费目录。

以上问题均已回答；三项原版目录缺陷是已确认反证，不是待搜索未知。

## 权威来源与版本边界

行为与身份主证据：

- `my/AllEquipment.as:909-3400`：五组注册表、25 个动态丹药、反向查找优先级。
- `user/User.as:628-865`：四类列表和 `MyEquipObj` 字符串存档加载门禁。
- `config/Config.as:1221-1253`：道具/技能书按 `fillName` 合并。
- `export/pack/BackPackElement.as:96-299`：四分类、5 页、每页 25 格和删除语义。
- `export/pack/PackThings.as`、`export/pack/ShowObj.as:24-111`：数量覆盖层、
  选择/使用入口和背包图标别名。

视觉主证据：

- `assets/backpack1.swf` character 304 `export.pack.BackPack`、246
  `export.pack.BackPackElement`、628 `export.pack.PackThings`。
- `assets/EIcon1.swf`：411 个目录条目的最终选择源。
- `1_MainLoad__main1.swf`：2 个既有合成跨包条目。
- `assets/MagicWeapon2.swf`：17 个法宝/神装条目。
- 跨包结果复用已闭合的 `crafting-icon-catalog-1.1.json`，并以恢复 SWF
  exact SymbolClass 扫描复核；未从 legacy extraction 推断视觉缺失。

辅助资料边界：

- `再续1.0装备属性合成掉落表.xlsx` 仅作中文名和属性候选索引。
- 捆绑表格运行时可只读打开该旧工作簿；“合成 / 宝石属性 / 掉落”与拆分 CSV
  行级一致，“装备属性”拆分 CSV 比工作簿多 2 行且存在 62 行差异。
- 因版本为 1.0 且后段文本本身存在编码异常，任何冲突均以 1.1
  `AllEquipment.as`、共享消费者和恢复 SWF 为准。

## 机器目录字段合同

| 字段 | 合同 |
| --- | --- |
| `fillName` | 原版稳定身份，也是现代 registry 主键；431 项唯一 |
| `displayName/showId/originalType/user/quality/color` | 由原 `MyEquipObj` 定义恢复 |
| `inventoryCategory/originalList` | `equipment/zblist`、`items/djlist`、`fashion/szlist`、`skillBooks/jnslist` |
| `quantityModel` | 装备/时装为 `instance`；道具/技能书为 `stack` |
| `capacity` | 每类 5×25=125 个可见槽；堆叠按一个 `fillName` 占一槽，实例逐件占槽；原版无硬插入上限 |
| `save` | 原字段 `bagSaveString/bagdjSaveString/bagszSaveString/bagjnsSaveString` 与 `MyEquipObj` 管道记录 |
| `sourceDefinition/shadowedDefinitions` | 权威定义、源行和被原反向查找遮蔽的定义 |
| `reachability` | 有外部引用/动态丹药生产者，或仅为无外部生产者的静态目录项 |
| `knownProducersAndConsumers` | 合成、商城、任务、丹药、掉落/怪物、工坊、活动、背包动作和共享消费者证据 |
| `icon` | 唯一 `inventory-item.<fillName>`、原请求名、别名、源包、character id、证据与接入资格 |
| `implementation` | 现代 definition/icon 和专属用途的已实现/待实现边界 |

现代系统直接消费由生成器产出的该 JSON；不得再维护第二份手抄物品表。

## 分类、容量与存档合同

| 分类 | 原列表 | 判定 | 数量 | 原存档字段 | 现代事务要求 |
| --- | --- | --- | --- | --- | --- |
| 装备 | `zblist` | `zbwq/zbfj/zbsp/zbfb/zbtx` 等 | 实例 | `bagSaveString` | 保留实例 id、属性覆写和装备流 |
| 道具 | `djlist` | `wpqhs/zbwp` 且不含 `jns` | 堆叠 | `bagdjSaveString` | 同 `fillName` 原子增减 |
| 时装 | `szlist` | `zbsz/zbcb` | 实例 | `bagszSaveString` | 保留实例与 `fashionTime` |
| 技能书 | `jnslist` | `fillName` 含 `jns` | 堆叠 | `bagjnsSaveString` | 保留独立分类；原版已提示技能书不再有用 |

原版四类都是每页 25 格、最多显示 5 页。超过 125 后仍可被数组和存档持有，
只是 UI 不可见。现代版本应采用每类 125 槽硬容量和提交前预检，这是防止
不可见溢出的现代可靠性选择；消费与产出必须同一事务，容量失败不部分扣减。
P1/P2 各自拥有四类列表和存档字段，禁止建立全局库存 owner。

## 图标全集与原版缺陷

图标选择顺序为：

1. `ShowObj` 显式别名；
2. 恢复 SWF 中与请求名完全相同的 SymbolClass；
3. 已闭合合成图标目录中的显式预览别名/跨包证据。

所有 431 个 stable key 唯一，跨分类冲突为零。结果为：

| 状态 | 数量 | 处置 |
| --- | ---: | --- |
| `located` | 428 | 已由 `TASK-SLICE-160` 选择性派生并接入 |
| `known-broken-original-lookup` | 2 | `fmtstx` 有 EIcon1/424 `role_title_fmtstx`，`scwpqhs5` 有 EIcon1/576 `wpqhs5`；原 `ShowObj` 未加别名，且两项无外部生产者，默认排除 |
| `missing-original` | 1 | `wc` 无 exact symbol；三条定义共享一个 id，反向查找最终只返回 wpEquip123“3级昆仑玉”，且无外部生产者，默认排除 |

这三项不是允许现代自动补图的理由。若以后产品要把它们变成可玩内容，必须由
用户批准“修复原版死目录/错误查找”的现代视觉例外，并单独定义生产者。

## 全集差异与唯一 owner

| 数据族 | 与 431 项全集的关系 | 结论 |
| --- | --- | --- |
| 现有 crafting 定义/图标 | 201 项；152 个材料、85 个产物，角色重叠后 201 唯一 | 身份和真图已闭合，但只是全集子集 |
| 商城 | 49 项 | 全部复用 `fillName`；购买事务必须写当前 owner，不建 shop inventory |
| 任务 | 机器扫描命中 51 项物品定义/消费者；页面定义包含 47 个唯一奖励图标 | 任务只持奖励引用和进度，不拥有物品定义 |
| 丹药 | 25 个动态丹药 + 6 个材料/消费者命中，共 31 项 | 丹药页只拥有服用标志和配方，不拥有物品目录 |
| 掉落/怪物 | 133 项有明确字符串消费者 | 掉落只引用目录，产出前统一容量预检 |
| 工坊 | 87 项有强化/合成/分解/制作消费者 | 工坊 registry 不再复制显示名、分类或图标 |
| 当前现代目录 | 431 项 definition；428 项可用真图标、3 项缺陷排除 | `TASK-SLICE-160` 已建立唯一全量 registry |
| 无外部字面生产者 | 41 项，其中包含 12 本废弃技能书和三项已确认目录缺陷 | 保留证据但不把“已注册”伪造成“原版可获得” |

唯一 owner 建议属于现代设计选择：

```text
InventoryItemDefinitionRegistry（431 项证据目录）
  -> InventoryStore(P1/P2) 持有实例或堆叠
  -> crafting/shop/task/immortality/drop/workshop 只引用 fillName
  -> SaveSystem V6 只保存 owner 数据，不复制静态定义
  -> InventoryIconBundle 按稳定 key 首次进入背包时加载
```

## 背包显示列表复核

### character 304 根页

- 原舞台可见层是 940×590；组合导出因离台 child 扩成 2095.2×1070.7，
  现代相机仍必须裁为 940×590。
- character 203 是 940.05×590 根命中/底层；`btn_close` 31 位于
  `(809.5,59.85)`，`prePage` 78 位于 `(609,472.45)`，`nextPage` 83
  位于 `(727.2,472.45)`。
- `bpe` 246 位于 `(516.2,114.35)`；动态格子容器在其下方创建。
- 六个 50×50 装备槽为 `zbwq/zbfj/zbsp/zbfb/zbsz/zbtx`，根页还包含
  `txt_name/txt_zdl/txt_hp/txt_mp/txt_att/txt_def/txt_luck/txt_mdef/
  txt_baoji/txt_sb/txt_hx/txt_hl/txt_exp/txt_lh` 与 `nowpage`。
- `sellwhite` 222、经验条、角色头图和时装显示开关属于根页动态状态；
  不得被新物品目录覆盖成现代标题或通用面板。

### character 246 分类页与动态格

| 实例 | character | 坐标/尺寸 | 状态 |
| --- | ---: | --- | --- |
| `btn_zb` | 230 | `(0,0)` / 73×27 | up 227；over/down/hit 229 |
| `btn_dj` | 235 | `(74,0)` / 73×27 | up 232；over/down/hit 234 |
| `btn_rw` | 240 | `(148,0)` / 73×27 | up 237；over/down/hit 239 |
| `btn_jns` | 245 | `(222,0)` / 73×27 | up 242；over/down/hit 244 |

- 分类 selected 由运行时把 `upState` 设为 `downState`，不是新增选中框。
- `drawgz()` 每页创建 5×5 个 `PackThings`；列间距为格宽+11，行间距为
  格高+9，数据索引为 `(page-1)*25 + localIndex`。
- `PackThings` character 628 动态加入 `ShowObj` 图标，数量大于 1 时由
  `txtname` 覆盖显示；图标必须在数量文字下方。
- 空格不创建物品 child；实例不显示数量，堆叠 1 也不显示数量。

### 逐状态结果

`TASK-SLICE-160` 的 940×590 验收与自动门禁覆盖：

- 四分类 normal/hover/pressed/selected；
- 首/中/末页及分页边界；
- 空格、单件实例、数量 1 和数量大于 1 的堆叠；
- 选中、详情、穿戴/卸下、安全拒绝；
- P1/P2 切换和隔离；
- 每类空包、124/125/满包产出与失败原子性；
- 关闭返回、再进入和当前槽 V6 重载。

原版视觉基准继续引用恢复 `backpack1.swf` 304/246 的 940×590 导出与
`TASK-SLICE-135` 既有运行证据。现代对象差异、几何边缘、逐状态截图和运行
限制记录于 `evidence/TASK-SLICE-160-visual-audit.md`。

## 六段证据矩阵

| 合同项 | 局部证据 | 共享调用链 | 几何/视觉 | 等级 | 反证/未知 | 验证 |
| --- | --- | --- | --- | --- | --- | --- |
| 431 唯一身份 | `AllEquipment` 五组与动态丹药 | `findByName` 反向优先级、`User.setSaveObj` 门禁 | 不适用：数据身份 | 交叉确认 | `wc` 三定义按实际优先级折叠 | 生成器数量/唯一性门禁 |
| 四分类与数量 | `BackPackElement`、`Config.putQHsInArray` | `User` 四列表、`PackThings` 增减 | 246 四标签、628 格 | 交叉确认 | 无 | 分类、堆叠/实例矩阵 |
| 容量 | `allPage=5/pageNum=25` 与索引公式 | 原数组/存档无硬限制 | 5×5 格、分页按钮 | 交叉确认 | 现代硬上限是设计选择 | 124/125/满包原子测试 |
| 存档 | `getSaveObj/setSaveObj` | `MemoryClass` 双玩家槽 | 不适用：数据边界 | 确认事实 | 原字符串格式不照搬 | P1/P2 V6 round-trip/损坏保护 |
| 图标 | `ShowObj` exact/别名 | `AUtils.getImageObj` 严格类名查找 | 恢复 SymbolClass 与 character | 交叉确认 | 三项原目录缺陷已显式排除 | 431 映射、stable key 和选择性派生门禁 |
| 生产/消费 | 各物品字面引用、合成/商城/任务/丹药索引 | inventory owner 与保存 | 图标只由共享 bundle 提供 | 确认事实 | 无字面生产者不等于可获得 | 各系统只引用统一 registry |
| 现代映射 | JSON field contract | P1/P2 store、V6、各事务 command | 304/246 + 动态格 | 现代设计选择 | 不实现专属效果 | 自动事务 + 940×590 运行双验收 |

## `TASK-SLICE-160` 确定性测试矩阵

1. 生成器固定得到 433 次注册、431 个唯一 id、四分类
   `164/235/20/12`、实例/堆叠 `184/247`。
2. 431 个 stable key 唯一；428 `located`、2 `known-broken`、1
   `missing-original`，且只有记录的三项不可接入。
3. 201 个既有 crafting 条目与新目录身份、分类、图标 provenance 完全一致。
4. 每分类分别验证空包、同 id 合并、实例不合并、124→125、125 后拒绝、
   消费释放槽位、产出失败无副作用。
5. 装备、时装实例 identity/覆写/时间字段往返；道具、技能书数量往返。
6. crafting、shop、task、immortality、drop/workshop 的代表事务均通过同一
   registry 和当前 owner，P1/P2 不串改。
7. V1..V6 迁移、未知 id 拒读、损坏子域回退、当前槽保存与重载。
8. bundle 首次加载、并发去重、失败重试、关闭再进幂等，不把 431 图标回填
   到 shell 启动 bundle。

## 当前判定

- 身份、分类、图标选择、堆叠/实例、容量和存档字段未知为零。
- 三项原目录缺陷已由精确反证关闭，默认排除而非生成现代替代。
- `TASK-SLICE-160` 已完成统一 registry、428 图标懒加载、原子事务、双
  owner、V6 往返和正式原生背包；专属用途仍由后续玩法切片负责。
- 下一同线 Goal 为 `GOAL-045 / TASK-SLICE-155A`。

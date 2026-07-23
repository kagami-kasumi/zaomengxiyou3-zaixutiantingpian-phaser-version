# 完整功能 UI 覆盖索引

本文是 `TASK-SETTINGS-058` 对背包、装备、宠物、心法/技能和法宝完整 UI 的权威覆盖入口。它盘点页面、入口、所有权、存档、真资源和现代缺口；已有 `TestScene` 最小面板只算行为原型，不等于正式页面。

## 待证明的可观察问题

1. 战斗 HUD 与天庭地图分别能打开哪些功能页，关闭后回到哪里，何时暂停战斗？
2. 背包/装备、技能、宠物和法宝分别有哪些主页面与子页面，关键字段和交互是什么？
3. 本地双人时页面属于 P1 还是 P2，快捷键、运行时数据和存档是否隔离？
4. 哪些真 UI 已在恢复 SWF 中确认，哪些页面已实现行为但仍只有测试面板？
5. 哪些共享基础必须先完成，才能避免每个 Stage scene 重复导航、暂停、保存和 owner 规则？

## 六段证据矩阵

| 行为合同项 | 局部证据 | 共享调用链 | 几何/资源证据 | 证据等级 | 未知与反证条件 | 验证方式 |
| --- | --- | --- | --- | --- | --- | --- |
| 功能页入口与互斥 | `RoleInfo.showBackPack/studySkill/cwClick/fbClick()`；`MapMenu.buySkill()` | `KeyBoardControl` 将 P1 `C/V/B/N`、P2 小键盘 `/ * -` 派发给对应 `RoleInfo`；页面通过全局 close event 互斥 | HUD 入口已由 `RoleInfo` 真资源接入；地图共享菜单为 `OtherMat1.swf` 963 | 交叉确认 | P2 原版无独立法宝面板快捷键；现代不得为方便伪造原版按键 | owner/互斥测试 + 三关/地图运行观察 |
| 暂停与返回 | `BackPack`、`BuySkill`、`PetInterface`、`SutraInterface` 的 added/removed/close | 战斗态调用 `MainGame.stopGame/continueGame`；地图态技能页关闭派发 `SelectOver` | 页面均为 940×590 舞台覆盖层；局部子页嵌入根容器 | 交叉确认 | 地图中背包/宠物/法宝是否可直接打开未由原版 `MapMenu` 证实；现代可提供统一功能入口，但须标现代设计选择 | host 状态机测试 + 暂停/恢复/返回运行观察 |
| 背包与装备 | `BackPack`、`BackPackElement`、`PackThings` | `User.zblist/djlist/szlist/jnslist/curarray`；`BaseRoleProperies.addEquip/removeEquip` | `backpack1.swf` 304/246；根导出被离台子件扩为 2095.2×1070.7，正式相机仍裁 940×590 | 交叉确认 | 完整 1.1 装备静态表和全部道具效果未闭合；首个正式页可使用已有 registry，但必须公开内容范围 | 分类/分页/穿脱/owner/保存测试 + 940×590 页面观察 |
| 技能学习与绑定 | `BuySkill`、`SkillControl`、`SkillSetControl`、`PassiveSkillControl` | `User.isstudyskill/skillbykey/ispassiveskill/lhValue`；关闭后 `RoleInfo.refreshShowSkill` | `OtherMat1.swf` 250/868/417/213；根 940×590，子页 888.05×425 / 506×356 / 746×429 | 交叉确认 | 原版拖拽需转为指针/键盘可访问交互属于现代设计选择；不能改变五槽解析顺序 | 学习/升级/绑定/双玩家/保存测试 + 页面/拖拽等价观察 |
| 宠物页 | `PetInterface`、`PetHeadSprite` | 每页 5、最多 10；选择/出战/休息/放生/洗练/进化只改构造时注入的 `User`；对应英雄重建宠物 | `pet1.swf` 932，940×590；技能区最多 8 槽 | 交叉确认 | 当前现代 P2 roster 已有但正式页与全局场景接线缺失；放生二次确认视觉尚未单独派生 | roster/动作/owner/保存测试 + P1/P2 页面观察 |
| 法宝页 | `SutraInterface` | `RoleInfo.fbClick()` 只在已装备 `zbfb` 时打开；关闭时重算装备；强化消耗灵魂、五行重置有确认框 | `backpack1.swf` 596，940.05×590 | 交叉确认 | 特殊法宝分支的全部材料/上限和五行重置代价仍需实现前窄读；未装备时必须拒绝 | 装备门禁/强化/重置/保存测试 + 页面运行观察 |
| 装备工坊子页 | `StrengthEquipment` 动态切换 `Strength/Fusion/Resolution/Making` | `equipment-workshop-index.md` 已追到 `AllEquipment/MyEquipObj/User/PackThings`；`Fusion` 仍复用已闭合 112 配方 | `backpack1.swf` 119/198/169/177/152；容器与 Fusion ready，198/177/152 已选择性派生并记录实例几何 | 交叉确认 | 影响实现的行为未知已清零；现代装备实例/存档必须增加强化级和制作随机属性覆写 | 工坊专项 + 四标签 P1/P2/重载运行观察 |
| 存档与本地双人 | `User.getSaveObj()` 分别保存两位玩家的技能、背包、装备、宠物 | `MemoryClass.setStorage()` 持有 `player1_obj/player2_obj`；现代 V4 已同构保存双方成长、技能、库存/装备和宠物 | 不适用：数据合同 | 确认事实 + 现代实现 | 库存只保存稳定 fillName/id/quantity，UI、冷却与临时 buff 不入档；V1/V2/V3 缺失域使用安全默认 | `feature-save-v4-tests.ts`、两玩家隔离和重载测试 |

## 页面全集与覆盖矩阵

| 页面 ID | 页面/子页 | 原版入口与退出 | 字段与关键交互 | 双玩家 owner | 存档字段 | 真资源 | 现代现状 | 关闭缺口 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| FUI-01 | 共享功能页 host | HUD 按钮/快捷键；地图技能入口；关闭回原场景 | 单实例、页面路由、暂停/恢复、owner、反馈、Escape/原快捷键关闭 | P1/P2 独立数据，同一时刻只显示一个页 | host 会话不持久化 | 复用 HUD/MapMenu 入口 | 无正式共享 host | 先建跨地图与 Stage 1 三关的统一 owner/暂停/返回协议 |
| FUI-02 | 背包/角色总览 | P1 C、P2 num `/`；再次按或关闭按钮退出 | 角色名/等级/经验/战力/HP/MP/属性、6 装备槽、时装显示、出售白装 | `BackPack.setpack(1/2)` 绑定对应 hero/User | 装备、分类背包、时装显示、角色成长 | 304 | 真 940×590 页、正式入口、P1/P2 六槽穿脱与 V4 保存已完成 | 完整 1.1 物品/出售行为仍明确排除，不阻塞首个正式页 |
| FUI-03 | 背包分类与物品详情 | FUI-02 内嵌 | 装备/道具/时装/技能书；5 页×25 格；选择、预览、穿脱、使用/丢弃/给予门禁 | 跟随 FUI-02 owner | `zblist/djlist/szlist/jnslist/curarray` | 246；物品图标 registry 部分已有 | 四分类、25 格分页、详情、穿脱、安全拒绝和库存持久化已完成 | 未支持物品效果继续显式反馈；不补造完整 1.1 表 |
| FUI-04 | 技能总页 | P1 V、P2 num `*`、地图 `showBuySkill`；返回原场景 | 角色选择、主动/被动切换、灵魂显示 | 原版页可选 P1/P2；战斗快捷键默认打开对应 owner | 技能树、绑定、被动、灵魂 | 250 | 真总页、正式入口、地图双 owner 与 V4 保存已完成；236/240/244/248/249、选择器和动态子页证据已闭合，现代覆盖待移除 | 按 `skill-ui-native-index.md` 实现原生根页，不保留暗层/外框/标题/通用按钮 |
| FUI-05 | 主动心法/技能学习 | FUI-04 主动标签 | 两棵心法、树升级、5×2 技能、学习上限、技能升级/预览 | 当前选中 User | `isstudyskill` 等价结构 | 868 | 865 十帧、50 图标三态、580/638、字段与动态 `LV.n` 已闭合；现代交互待移除 | `TASK-SLICE-143` 逐项消费原时间轴、按钮和槽位 |
| FUI-06 | 五槽技能绑定 | FUI-05 技能设置按钮；关闭提交返回 | source、五槽、拖放/替换、P1/P2 键位映射 | 当前选中 User | `skillbykey` 等价结构 | 417 | 拖放、76×76 hit、回退、替换、P1/P2 两帧和 x_btn 提交已闭合；点击/键盘等价限于原槽 | 删除现代列表/槽按钮/独立提交，按 `skill-ui-native-index.md` 实现 |
| FUI-07 | 被动技能 | FUI-04 被动标签 | 5 个被动等级与说明 | 当前选中 User | `ispassiveskill` | 213 | 五行 frame、字段公式、207 按钮、拒绝反馈和 10 级隐藏已由恢复包 P-code 闭合 | `TASK-SLICE-143` 原生化五行与动态字段 |
| FUI-08 | 宠物管理 | P1 B、P2 num `-`；再次按或关闭 | 每页 5/最多 10、全属性、8 技能、出战/休息/放生、洗练、超进化 | 构造参数绑定具体 User；两玩家可各出战 1 只 | 两套 pet roster、选中/出战、技能与成长字段 | pet1 932 | 真页面、5×2 分页、完整属性/8 槽、出战/休息/二次确认放生、成长/技能重洗、三形态进化、双 owner runtime/V4 已完成 | 浏览器本地重载受 URL 策略限制且未绕过；P1/P2、运行时和重载由确定性专项覆盖 |
| FUI-09 | 法宝强化/五行重置 | P1 N 或 HUD 法宝按钮；已装备 `zbfb` 才打开 | 名称/等级/成长/五行/攻防/HP/MP、灵魂进度、强化、重置确认 | P1 owner；原版 P2 无面板快捷键，现代明确不伪造 | `zbfb` 实例等级/成长/五行/属性、灵魂与材料 | backpack1 596 | 真 596 页、未装备拒绝、常规/特殊材料分支、提交/取消、五行重置、运行时重算与 V4 round-trip 已完成 | 无当前页面缺口；端到端组合旅程由 `TASK-SLICE-140` 验收 |
| FUI-10 | 装备工坊容器 | 地图炼丹炉入口；四标签切换 | 强化、合成、分解、制作书 | 页面角色选择/当前 inventory owner | 装备实例、库存材料 | 119 已 ready | 正式 host、四标签、双 owner 与四类事务已复现 | `138A..138D` 已闭合 |
| FUI-11 | 合成 Fusion | FUI-10 合成标签 | 三材料、预览、合成、关闭返还 | P1/P2 owner 已实现 | inventory 实际事务 | 169 已 ready + 201 图标 | 112 配方/224 事务、正式地图入口、暂存返还与当前槽保存已闭合 | 已完成；保留全量回归 |
| FUI-12 | 强化 Strength | FUI-10 强化标签 | 装备选择、三石概率/灵魂、幸运、保底、成功/失败降级 | 当前 inventory owner | 实例强化级、基础字段与成长表 | 198 ready | 已接入真页、背包分页、5×7 概率、消费/返还、白名单、实例/V4 与双 owner 事务 | `TASK-SLICE-138B` 已完成；专项成功/失败/迁移与浏览器拒绝验收闭合 |
| FUI-13 | 分解 Resolution | FUI-10 分解标签 | 装备选择、100 灵魂、品质/类型/角色产物、最多六槽 | 当前 inventory owner | 销毁实例并增加 owner 库存 | 177 ready | 真页、品质/类型/五角色材料、随机宝石、神器专属概率、返还、原子提交与双 owner 保存已完成 | `TASK-SLICE-138C` 已完成；浏览器受 URL 策略限制，确定性专项覆盖运行合同 |
| FUI-14 | 制作书 Making | FUI-10 制作标签 | 78 本可达书、必需材料、灵魂、三可选宝石、产物实例 | 当前 inventory owner | 书/材料消费与产物随机属性覆写 | 152 ready | 78 本表驱动 registry、1 死分支拒绝、原子事务、实例覆写、双 owner V4 与真页已复现 | 专项/系统/build + 940×590 地图入口/P1-P2/关闭返回浏览器验收 |

## 资源清单与几何

源 SWF 均来自 `local-resources/regima/source/restored-swfs/assets/`；选择性派生位于 Git 忽略的 `local-resources/regima/task-outputs/task-settings-058-ui/`，未修改恢复源或 legacy extraction。

| stableKey | 源包 / character | 导出边界 | 接入要求 |
| --- | --- | --- | --- |
| `full-ui.backpack` | `backpack1.swf` 304 | 2095.2×1070.7（含离台子件） | 舞台裁为 940×590，不把导出全边界当相机 |
| `full-ui.backpack-grid` | `backpack1.swf` 246 | 295×27（静态标签层；格子动态生成） | 与运行时 5×5 格子组合 |
| `full-ui.skill-hub` | `OtherMat1.swf` 250 | 940×590 | 根容器；完整显示列表/状态见 `skill-ui-native-index.md` |
| `full-ui.skill-active` | `OtherMat1.swf` 868 | 888.05×425 | 裁切边界不是父矩阵；865 十帧与动态槽位见 `skill-ui-native-index.md` |
| `full-ui.skill-bind` | `OtherMat1.swf` 417 | 506×356 | 模态/子页；五槽/拖放/x_btn 合同见 `skill-ui-native-index.md` |
| `full-ui.skill-passive` | `OtherMat1.swf` 213 | 746×429 | 嵌入技能根页；五行 P-code/字段合同见 `skill-ui-native-index.md` |
| `full-ui.pet` | `pet1.swf` 932 | 940×590 | 根容器 |
| `full-ui.magic-weapon` | `backpack1.swf` 596 | 940.05×590 | 940×590 舞台裁切 |
| `full-ui.equipment-strength` | `backpack1.swf` 198 | 369.95×350.95 | 嵌入既有 119 容器 |
| `full-ui.equipment-resolution` | `backpack1.swf` 177 | 363×370.6 | 嵌入既有 119 容器 |
| `full-ui.equipment-making` | `backpack1.swf` 152 | 363×385.95 | 嵌入既有 119 容器 |

`crafting-ui.container` 119 与 `crafting-ui.fusion-panel` 169 已在 `LINE-CRAFTING` 标注为 ready，本任务不重复 stableKey。

## 现代共享合同

```text
formal scene/map input
  -> FeatureUiHost.open(page, owner, origin)
       -> close any active page
       -> pause origin for modal input isolation
       -> bind owner-scoped runtime
       -> render true root + dynamic fields
       -> command through system owner
       -> save active slot after committed mutation
       -> close -> resume/return origin and refresh HUD
```

- `FeatureUiHost` 是所有正式页面的唯一会话 owner；各 Stage scene 只提供 pause/resume 与玩家 runtime adapter，不各写一套快捷键和互斥状态。地图 origin 也暂停 scene 以隔离键盘事件，但语义只叫“模态交互冻结”，不冒充战斗暂停。
- `PlayerFeatureState` 必须按 P1/P2 保存成长、技能、库存、装备和宠物。V1/V2/V3 迁移保持 P1 旧数据，P2 缺失域填安全默认值。
- 页面只发 command；`InventorySystem`、`EquipmentSystem`、`SkillUISystem`、`PetSystem`、`MagicWeaponSystem` 继续拥有规则。
- 原版只在地图直接开放技能/工坊；现代若从地图提供统一功能入口，属于明确的现代导航选择，不冒充原版按钮布局。

## 连续任务拆分

1. `TASK-ARCH-008`：建立跨 HeavenMap/Stage 1 三关的 owner-aware 功能页 host、暂停/恢复、互斥、快捷键和回归 harness；只提供共享基础与入口反馈，不伪装页面完成。
2. `TASK-ARCH-009`：升级版本化双玩家功能存档，覆盖 inventory/equipment/skills/pets/progression，完成 V1/V2/V3 迁移和当前槽写回。
3. `TASK-SLICE-135`（已完成）：接入真背包/装备页与格子、正式 P1/P2 owner、分类/分页/穿脱/物品反馈和保存。
4. `TASK-SLICE-136`（已完成）：接入真技能总页、主动/被动/绑定三子页、P1/P2 owner、HUD 刷新和保存。
5. `TASK-SLICE-137`（已完成）：接入真宠物页、分页/属性/8 技能/出战休息/放生/成长操作、P1/P2 runtime 与保存。
6. `TASK-SETTINGS-059`（已完成）：`equipment-workshop-index.md` 闭合 Strength/Resolution/Making 的材料、概率、实例字段、失败/返还、保存和几何语义。
7. `TASK-SLICE-138A..138D`：分四个 Goal 接入工坊容器/Fusion、强化、分解和制作书，避免单次 `/goal` 跨多类事务与存档迁移。
8. `TASK-SLICE-139`：接入真法宝页、装备门禁、强化/重置/特殊分支、P1 owner 与保存；P2 面板入口必须记录为现代选择或明确排除。
9. `TASK-SLICE-140`：完整“读档 → 地图 → 功能页 → 关卡 → 功能页变更 → 结算 → 重载”自动与浏览器旅程，关闭 VS-054 和本功能线前的剩余缺口。

## 现代共享 host 实现（TASK-ARCH-008）

- `FeatureUiHostSystem` 是唯一 session owner，记录 page、P1/P2 owner、origin scene/kind 与玩家数；重复打开返回 busy，单人 P2 请求返回明确反馈。
- `FormalFeatureUiEntryBridge` 统一 HeavenMap、Stage 1-1/1-2/1-3 的 `C/V/B/N` 与 P2 小键盘 `/ * -` 路由；打开 overlay 时暂停 origin，关闭后只恢复原 origin，避免 Escape 传播导致二次导航。
- `FeatureUiScene` 只承载共享导航和“页面待接入”反馈，不把占位内容标记为正式背包、技能、宠物或法宝页面。地图 origin 的暂停只称“模态交互冻结”，不冒充战斗暂停。
- 专项测试覆盖 owner、互斥、非法 P2、四个 origin、键位与生命周期源码合同；浏览器确认地图打开/切页/关闭返回保持原地图、正式节点可进入 Stage 1-1 且控制台无 warning/error。Canvas 自动化无法稳定生成 TestScene 现有轮询键位所需的持续按键，关卡键位由确定性测试覆盖，不伪写为浏览器已证实。

## V4 双玩家功能存档（TASK-ARCH-009）

- `player1/player2` 采用同构 `PlayerFeatureSaveV4`，覆盖成长、技能绑定/学习、库存、装备 loadout 与宠物；正式当前槽写回和恢复均使用该结构。
- inventory 只编码 category、`fillName`、instance/stack id 与 quantity；definition 从现代 registry 恢复，未知定义被安全丢弃，UI、制作 session、冷却和临时 buff 不序列化。
- V1/V2/V3 迁移保留 P1 旧字段与已有双方宠物，缺失库存和 P2 功能域填安全空默认；1P 自动存档保留未上场 P2 的成长/技能快照。
- `feature-save-v4-tests.ts` 覆盖双 owner 全域 round-trip、三个旧版本、损坏 inventory 子域与未知定义；全系统与 build 通过。

## 未知、排除与验收

- `Strength/Resolution/Making` 行为已由 `equipment-workshop-index.md` 闭合；实现必须扩展装备实例强化级、制作随机属性覆写和向后兼容存档，不得退回 definition-only 数据模型。
- 背包完整 1.1 物品/装备内容全集不在现有 registry。正式背包首切片必须显示实际已支持内容，并登记后续内容缺口，不能用几件种子物品宣称全表完成。
- 原版网络、支付/活动、仓库、赠送与 P2 法宝独立快捷键明确排除；本地双人 owner、当前槽存档和正式 Stage 1/地图导航不排除。
- 确定性验证覆盖 host、互斥、owner、暂停、命令、迁移、保存；运行验证覆盖 940×590 真页面、P1/P2 快捷键、指针交互、关卡暂停/恢复、地图返回和重载。

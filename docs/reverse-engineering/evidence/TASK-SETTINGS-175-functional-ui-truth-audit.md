# TASK-SETTINGS-175 功能 UI 真值债务审计

## 结论

本审计只分级证据，不把目录盘点冒充 UI 实现。当前仓库中，工坊左页、工坊右栏和装备页已有 `verified` 原版机器真值；本表所列功能页均没有对应 `verified` manifest。

- **明确现代占位**：宠物页、法宝页、地图态共享功能主机。它们当前可见层含原版不存在且未经批准的暗层、矩形、Arial 标题、通用按钮或摘要，不能称为原生化。
- **旧视觉审计但缺机器真值**：技能、丹药、商城、设置、任务、建档/选角，以及战斗态五入口/设置宿主。既有显示列表、原版基准和逐状态证据仍有效，但缺当前 Schema、source hash/locator 完整性核对和直接消费链。
- **已 verified**：本任务范围内为零；不得用旧文档的“闭合”“真 UI”措辞替代 manifest 状态。
- **证据未知**：宠物页 932 与法宝页 596 的完整嵌套显示列表、动态 child 和逐状态基准尚未形成可机械序列化输入；必须先做独立逆向。

## 一手来源冻结

| 源包 | SHA-256 | 本轮 locator |
| --- | --- | --- |
| `local-resources/regima/source/restored-swfs/assets/OtherMat1.swf` | `97478E1E03A22C7D06197FFB75AB890D98B084377CBDCF394716CBAF27082126` | 技能 250/868/417/213；丹药 990/969/1006；人数 1149；选角 901；关卡 HUD 574/设置 371/帮助 444 |
| `local-resources/regima/source/restored-swfs/assets/backpack1.swf` | `70C1F1B535EA789AD9C77556F90C7C107084278A4D1773E31471F2B4D7454936` | 商城 721/717/624；任务 85；法宝 596 |
| `local-resources/regima/source/restored-swfs/assets/StageCommon.swf` | `C6FC973D7D606CE4EA177B0AC075844C86A5EE7E493235FA812A029FBE4F29C9` | 设置 148/134/136..147 |
| `local-resources/regima/source/restored-swfs/assets/pet1.swf` | `0699A5D3A49EA8024D3635B18C6349F5D7F7CF5F1DB869DD18A0A5EE6DE60644` | 宠物 932 及其列表、属性、技能、操作弹层 |
| `local-resources/regima/source/restored-swfs/assets/Common1.swf` | `7459555A0D76872F93BCB164079FFF496A9A68730F85FE4015EA0D2C2337CACD` | 建档/选角共享入口 69/18 交叉对照 |

旧提取集只用于 AS3 行为和历史对照；视觉存在性、Symbol 和时间轴以以上恢复源为准。

## 逐页状态表

| 顺序 / 后续入口 | 页面 | 当前等级 | 既有证据与可机械升级性 | 目标 truthId / manifest | 必须冻结的状态与完整性 | 实现任务生成条件 |
| --- | --- | --- | --- | --- | --- | --- |
| 1 `TASK-SETTINGS-175A` | 宠物 932 | `verified` 真值；实现仍为明确现代占位 | `TASK-SETTINGS-175A-pet-page.md` 与生成器从恢复 SWF 核对 50 个根 child，并补齐列表/头像/技能/确认动态 child；74 对象、16 状态、`unresolved=[]` | `task-settings-175a.pet-page` / `task-settings-175a-pet-page.json` | 空 P1/P2、两页五行、selected、出战/休息、放生确认、属性/技能洗练、进化、8 技能、hover/pressed、关闭均匹配 | 已生成 `TASK-SLICE-180`（Planned），直接消费真值并删除现代暗层/矩形/Arial 控件 |
| 2 `TASK-SETTINGS-175B` | 法宝 596 | 明确现代占位 + 旧行为证据 | `magic-weapons-index.md` 已闭合强化/重置行为和根边界，但没有完整嵌套显示列表、动态字段和按钮/确认态序列；**不可机械升级** | `task-settings-175b.magic-weapon-page` / `task-settings-175b-magic-weapon-page.json` | 未装备、已装备 normal、升级可用/拒绝、确认/取消、重置确认、反馈、关闭；对象/字段/按钮态/源 locator 完整 | manifest `verified` 后生成单页实现 task，替换 `FormalMagicWeaponPageView` 的现代标题、面板和通用按钮 |
| 3 `TASK-SETTINGS-175C` | 战斗五入口与功能 host | 地图态明确现代占位；战斗态旧视觉审计 | `stage-feature-entry-index.md` 已有 574/371/444 与入口/返回合同，可机械生成战斗宿主真值；原版没有地图态统一五页 chrome，当前 `FeatureUiScene.createMapHostChrome()` 不是原版事实 | `task-settings-175c.stage-feature-host` / `task-settings-175c-stage-feature-host.json` | 574 五按钮 normal/hover/down/hit、P2 镜像、门禁、单页打开/关闭、371/444 设置态；地图态统一 chrome 记为未批准现代例外而非原版对象 | manifest `verified` 后生成宿主实现 task；战斗页直出原页面，地图态必须移除可见 chrome 或先取得用户逐项批准 |
| 4 `TASK-SETTINGS-175D` | 技能 250/868/417/213 | 旧视觉审计，缺 manifest | `skill-ui-native-index.md` 已有 SHA、完整显示列表、状态、动态 child、940×590 基准和差异合同；**可机械升级，但必须由源导出复核，禁止手抄 TS 坐标** | `task-settings-175d.skill-pages` / `task-settings-175d-skill-pages.json` | 总页/主动/绑定/被动；按钮 up/over/down、角色 selected、技能锁定/可学/已学、绑定 P1/P2、被动动态字段、进入/返回 | manifest `verified` 后生成实现迁移 task，使 layout/view 消费 JSON 或可重复生成物 |
| 5 `TASK-SETTINGS-175E` | 丹药 990/969/1006 | 旧视觉审计，缺 manifest | `immortality-ui-index.md` 有完整清单、按钮态、动态格、原基准和差异计划；**可机械升级**，需补 SHA/locator 与完整性脚本 | `task-settings-175e.immortality-page` / `task-settings-175e-immortality-page.json` | normal/hover/pressed/selected、五 owner、25 格、服用/炼制、五类拒绝/成功、余额、关闭 | manifest `verified` 后生成实现迁移 task，使 `ImmortalityScene` 删除手抄坐标源 |
| 6 `TASK-SETTINGS-175F` | 商城 721/717/624 | 旧视觉审计，缺 manifest | `shop-ui-index.md` 有根/商品卡/确认弹层/16 按钮状态和逐态基准；**可机械升级** | `task-settings-175f.shop-page` / `task-settings-175f-shop-page.json` | 分类 selected、卡 hover/pressed、分页、1/99/100/0、确认/取消/不足/成功、P1/P2、返回 | manifest `verified` 后生成实现迁移 task，使 `ShopScene` 消费真值投影；保留已批准共享灵魂余额例外 |
| 7 `TASK-SETTINGS-175G` | 设置 148 | 旧视觉审计，缺 manifest | `settings-ui-index.md` 有完整显示列表、五行状态、关闭四态、原基准和现代差异；**可机械升级** | `task-settings-175g.settings-page` / `task-settings-175g-settings-page.json` | normal/hover/pressed、五项循环、死控件、关闭/重开、overlay 阻挡、跨重启现代例外 | manifest `verified` 后生成实现迁移 task；独立全局存储例外不进入原版对象表 |
| 8 `TASK-SETTINGS-175H` | 任务 85 | 旧视觉审计，缺 manifest | `task-ui-index.md` 有根、页签、五 tile、详情/奖励/领取/分页/关闭、动态已领取图和逐态基准；**可机械升级** | `task-settings-175h.task-page` / `task-settings-175h-task-page.json` | daily/activity、selected、完成未领/已领、末页、空活动、奖励动态 child、关闭/重开 | manifest `verified` 后生成实现迁移 task，使 `TaskScene` 删除手抄坐标源 |
| 9 `TASK-SETTINGS-175I` | 建档人数/选角 1149/901 | 旧视觉审计，缺 manifest | `save-party-flow-index.md` 有 SHA、显示列表、940×590 裁切、五卡状态和现代差异；**可机械升级** | `task-settings-175i.party-creation` / `task-settings-175i-party-creation.json` | 人数 normal/hover/down、1P/2P、五卡 normal/hover/down/selected、单/双人顺序、取消/完成 | manifest `verified` 后生成实现迁移 task，使 `SavePartyCreationView` 消费真值或生成物 |

## 共同 manifest 门禁

每个后续证据 task 均须：

1. 按 `ui-ground-truth.schema.json` 生成独立 manifest，写入上表 truthId、源 SHA-256、character/SymbolClass/frame locator、940×590 舞台与裁切。
2. 从恢复 SWF 可重复提取根/子 Symbol、depth、父子关系、注册点、local matrix、stage bounds、TextField、按钮状态、动态 child、mask/filter 与命中区；不得从现代 TS 常量反向生成。
3. 比较预期/实际状态集、逐状态可见对象数、父子链和基准尺寸；影响实现的 `unresolved` 必须为空才可标 `verified`。
4. 保存原版基准、同尺寸现代并排/叠图入口和逐对象差异合同；实际实现与运行差异证据由后续实现 task 完成。
5. 实现直接消费 JSON 或由其可重复生成的投影，并有 stage 坐标回测；业务测试、路由可用、整页背景或零 console 均不能替代该门禁。

## 现代视觉例外

- 已批准：商城共享灵魂余额；设置跨重启的独立全局持久化。两者只能投影既有 owner，不得扩张页面可见层。
- 未批准：宠物页和法宝页的暗层、矩形面板、Arial 标题/摘要/通用按钮；地图态“正式功能页面主机”chrome、跨页按钮和通用关闭。它们均是待整改，不是现代例外。
- 其余页面默认空清单。新增可见替代层必须先获得用户逐项批准。

## 状态纠正

- `VS-054` 只保留“业务已完成”，状态为待机制；宠物/法宝/host 未 `verified` 前不得称完整功能 UI 原生化闭环。
- `VS-055` 只保留“业务/旧视觉审计已完成”，技能 manifest 与直接消费链完成前不得称 UI 原生化闭环。
- `VS-059` 只保留“四服务页业务/旧视觉审计已完成”，四页 manifest 与直接消费链完成前不得称“真 UI 全部通过”。
- H2 复评为“仍存在并已拆分”；M13 复评为“仍存在，逐页真值回测与逐状态运行证据纳入 175A..I”。

本任务没有生成任何页面 manifest，也没有修改可见实现；以上状态不是页面完成宣称。

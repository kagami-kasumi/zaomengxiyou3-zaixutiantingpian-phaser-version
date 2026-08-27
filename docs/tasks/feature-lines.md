# 功能条线台账

本文是完整玩家系统范围、激活状态和关闭证据的权威入口。功能条线是对用户作出的完整交付承诺；task 是一次 `/goal` 的交接边界和最小验收单位；纵向切片只提供阶段验证。task/切片都不能单独证明条线完成。

## 调度硬规则

- 全项目严格保持单条功能线 `WIP=1`：只要存在未完成条线，就必须且只能有一条 `Active`。
- `Active` 条线关闭前，所有 `Ready`、`Blocked` 和当前推荐 task 都必须属于该条线。
- task 完成后立即归档，但条线保持 `Active`，下一 task 必须继续来自同一条线。
- Goal 完成后结束当次 `/goal` 并激活同线下一 Goal；条线在多个 Goal 间保持 `Active`，不得因交接而切线。
- 遇到阻塞时记录阻塞并生成同线解除阻塞 task；不得激活或推进其他条线。
- 只有范围矩阵、正式流程、真资源和验证证据全部闭合后才能标记 `Done`。
- `Planned` 条线可以保留候选 task，但这些 task 只能是 `Planned`，不能进入当前推荐。

## 状态定义

- `Active`：唯一正在连续推进的功能条线。
- `Planned`：范围已知但尚未获得 WIP，不得推进。
- `Done`：完整关闭合同已满足，并有覆盖台账和关闭证据。

## 功能条线总览

| Line | 状态 | 用户确认范围 | 当前 task | 覆盖台账 | 当前阻塞 | 关闭证据 |
| --- | --- | --- | --- | --- | --- | --- |
| LINE-CRAFTING | Done | 玩家可从正式流程使用带真 UI、覆盖 1.1 权威合成表全部 112 个唯一配方的合成页 | — | `feature-line-coverage/LINE-CRAFTING.md` | 无 | 112 配方、201 定义、201/201 真图标、224 条 P1/P2 事务、正式入口与运行时真 UI 全部闭合 |
| LINE-STAGE-1-1 | Done | Stage 1-1 真场景资源、关卡流程和玩家可见闭环 | — | `feature-line-coverage/LINE-STAGE-1-1.md` | 无 | 原版 W 门与最高层立即出 Boss 已闭合；最高层镜头按原版 420/590 构图、2 秒过渡；Stage 1-1 专项、全系统、build 通过 |
| LINE-STAGE-1-2 | Done | 按内容扩展路线顺延：Stage 1-2 真场景资源、专属流程和玩家可见闭环 | — | `feature-line-coverage/LINE-STAGE-1-2.md` | 无 | 72 张真资源、3+1 墙/5 停点/13 刷怪点、五批 46 怪、双 boss 门、1P/2P 失败/普通胜利/V3 解锁与 `fbEnter -> 5-1` 全部闭合 |
| LINE-STAGE-1-3 | Done | 按 Stage 1 内容扩展路线顺延：Stage 1-3 真场景资源、专属流程和玩家可见闭环 | — | `feature-line-coverage/LINE-STAGE-1-3.md` | 无 | character 13/119/40 真场景、3+1 墙/5 停点/14 刷怪点、五批 105 怪、Monster5 门、1P/2P 失败/胜利、2-1 解锁、专项测试和浏览器验收全部闭合 |
| LINE-FORMAL-GAME-LOOP | Done | 在继续批量复现关卡前，闭合可通关战斗、核心 HUD、启动存档、天庭地图与完整功能 UI；玩家直属持有灵魂，技能/炼丹炉/法宝仅消费当前 owner | — | `feature-line-coverage/LINE-FORMAL-GAME-LOOP.md` | 无 | V6 玩家级 owner/旧档迁移、统一消费、P1/P2 隔离、跨功能重载、全门禁与 940×590 零 console 全部闭合 |
| LINE-STAGE-2-1 | Done | 正式游戏主循环关闭后恢复：先逆向 Stage 2-1，再由证据决定可玩实现范围 | — | `feature-line-coverage/LINE-STAGE-2-1.md` | 无 | 真场景/五停点/53 怪/38 冰刺/Boss 门/2-2 保存、四怪 94 帧与七攻击对象 132 帧、1P/2P 逐状态和零 console 全部闭合 |
| LINE-UI-NATIVE-SKILLS | Done | 将技能总页、主动页、绑定页和被动页重做为直接复用原图片中文字、按钮、状态和布局的原生化 UI，保留既有技能业务与双 owner/存档 | — | `feature-line-coverage/LINE-UI-NATIVE-SKILLS.md` | 无 | 250/868/417/213、按钮三态、角色 selected、技能三态、五键槽、五被动行、动态字段、P1/P2、V4 与 940×590 正式流程闭合 |
| LINE-STAGE-2-2 | Done | 按 Stage 2 内容扩展路线顺延：先逆向 Stage 2-2 真场景、专属流程、怪物/机关与结果保存，再由证据拆分可玩实现范围 | — | `feature-line-coverage/LINE-STAGE-2-2.md` | 无 | 真场景/五停点/54 怪/9 火焰/Monster16 八动作与六攻击/显门/统一失败/2-3 保存全部闭合；专项、全系统、structure、build、annotations、workflow、diff check 与 940×590 1P/2P 返回重载零 console 通过 |
| LINE-PRE-STAGE-2-3-COMPLETION | Done | 在继续 Stage 2-3 逆向前，先闭合原版 1.1 可入包资源全集与正式背包基础，再补齐天庭地图四个服务入口、关卡内五个功能入口、已完成关卡全部小怪真动画、通用关卡生命周期/可玩运行框架、五角色战斗 UI/技能动画，并以既有本地六槽存档完成正式旅程回归 | — | `feature-line-coverage/LINE-PRE-STAGE-2-3-COMPLETION.md` | 无 | 165D 已把炼丹炉右栏闭合为原生 25 格投影；全线关闭合同满足 |
| LINE-CORE-PROGRESSION-COMPLETION | Done | Stage 2-3 前完成炼丹炉左页与四功能、全装备 UI/数值、五角色成长、存档扩展、关卡左下五入口、用户确认的 UI 整改及复评确认的同线纠错 | — | `feature-line-coverage/LINE-CORE-PROGRESSION-COMPLETION.md` | 无 | 188 已让丹药页直接消费 132 对象/26 状态真值；当前线全部范围、专项、正式旅程、全系统、build 与 940×590 零 console 验收闭合 |
| LINE-PRE-STAGE-2-3-PRESENTATION | Active | 在执行 Stage 2-3 前按用户复验闭合装备悬停数值、宠物页/战斗 UI 与真动画、完整宠物战斗公共类、五角色动作流畅度/视觉完整性、战斗技能 HUD 可见与原生化 | TASK-SETTINGS-209 | `feature-line-coverage/LINE-PRE-STAGE-2-3-PRESENTATION.md` | 208 的“完整猴系/P1R=0”被虚空攻击反证；PG-017 Ready 抢占当前游戏 task，先落地行为语义 verifier 并整改猴系，Skill/MO-003 修订中 | PG-017 治理完成后生成猴系整改 task；重新 P1R=0 后才恢复 209 |
| LINE-STAGE-2-3 | Planned | 按 Stage 2 内容扩展路线顺延：先逆向 Stage 2-3 真场景、专属流程、怪物/机关与结果保存，再由证据拆分可玩实现范围 | TASK-SETTINGS-064（Planned） | `feature-line-coverage/LINE-STAGE-2-3.md` | 等待 `LINE-PRE-STAGE-2-3-PRESENTATION` 关闭 | 六段证据尚未开始 |
| LINE-MONSTER-ARCH | Planned | 重构怪物与关卡组织：关卡负责遭遇编排，怪物定义/运行时/AI/物理/战斗/视觉/奖励各有明确 owner，以组合策略替代深继承并消除双运行时登记 | TASK-ARCH-010A（Planned） | `feature-line-coverage/LINE-MONSTER-ARCH.md` | 等待当前 `LINE-STAGE-2-3` 关闭后获得 WIP | 尚未实施；设计合同与两阶段迁移任务已登记 |
| LINE-SHARED-UI-COMPONENTS | Planned | 治理灵魂余额、原生按钮/关闭生命周期和背包/物品展示的共享组件边界，分批迁移已知消费者且保留各页原生 Symbol、几何、皮肤与流程 | TASK-ARCH-014A（Planned） | `feature-line-coverage/LINE-SHARED-UI-COMPONENTS.md` | 等待当前 Active 线关闭或用户重新调度；不得以组件化名义抢占 WIP | `PG-011`、Split 父任务与六个独立 Goal 已登记，尚未开始存量审计或迁移 |
| LINE-RELEASE-RUNTIME-LOAD | Planned | 发布前拆分非首屏场景/Phaser vendor，并让运行时只消费机器真值目录的瘦投影，同时保留完整 provenance 与离线可玩 | TASK-ARCH-177A（Planned） | `feature-line-coverage/LINE-RELEASE-RUNTIME-LOAD.md` | 属发布优化阶段，等待内容线与当前 Active 线关闭后调度 | 177A/177B 已登记；生产基线、预算和实现尚未执行 |

## 当前功能线状态

2026-07-24 用户要求在 Stage 2-3 逆向前先完成两组正式导航、既有关卡怪物真动画、角色/技能动画与本地存档。复核确认：本地六槽 `localStorage`、V6 双 owner、背包/技能/法宝/宠物页面业务已存在，但天庭地图“丹药/商城/设置/任务”未进入 `full-function-ui-index.md` 的 14 页合同；关卡内五入口尚缺“与原版表现一致”的逐状态关闭证据；Stage 1-3 明记怪物为占位外观，Stage 1 其余怪物与五角色技能真动画也没有全集关闭证据。因此新增并激活 `LINE-PRE-STAGE-2-3-COMPLETION`，`LINE-STAGE-2-3 / GOAL-025 / TASK-SETTINGS-064` 暂回 Planned。存档不重复重做，只在最终正式旅程中验证浏览器本地持久化、损坏保护、P1/P2 隔离和跨页/跨关卡重载。

2026-08-03 `TASK-SLICE-159` 已归档并关闭前置体验补全线：新增独立自动旅程串联四地图服务、五战斗入口、双方事务、Stage 1-1→1-2 解锁、设置独立 owner、六槽 V6 重启、运行时临时字段排除与损坏槽保护；940×590 新建唐僧/白龙双人槽，跨重载保持困难设置，进入丹药/商城/任务与 Stage 1-1/P2 背包，console warning/error 为 0，临时槽已清理。全线关闭检查与全门禁通过，现恢复 `LINE-STAGE-2-3 / TASK-SETTINGS-064` 为唯一 Active/Ready。

2026-08-03 用户在进入 Stage 2-3 前复验指出：Role1 本体与普攻对象仍有锚点分离感，关卡五个原生入口需要全部可点击，正式背包动态 UI 过于简陋，地图炼丹炉右侧应显示背包而非文字列表。该反馈立即把相关旧结论降级为待复核，重新激活 `LINE-PRE-STAGE-2-3-COMPLETION`，并按 `TASK-SLICE-165A -> TASK-SETTINGS-165B -> TASK-SLICE-165C -> TASK-SLICE-165D` 串行整改；`LINE-STAGE-2-3 / TASK-SETTINGS-064` 暂回 Planned。

2026-08-03 `TASK-SLICE-165A` 已归档：Role1/2 普攻对象分别继承 `(5,-15)` / `(15,0)` 本体视觉根，Role3..5 保持零角色级偏移；五个 P1 HUD 原生按钮完成真实 pointer 打开/关闭旅程，设置页启动顺序修复为先暂停 origin 再启动 overlay。940×590 Role1 关卡逐页复验与 console 零 warning/error 通过；功能线继续 Active，唯一 Ready 切到 `TASK-SETTINGS-165B`，不提前进入背包实现或 Stage 2-3。

2026-08-04 `TASK-SETTINGS-165B` 已归档：历史 160 审计文件实际存在，但其视觉关闭结论漏查 304 动态角色/等级/字段/装备与 628 原生操作弹层，并误认现代 `43×41` 为原版格距；304/246/628 完整显示列表、`61×60` 格距、940×590 对照、对象差异和零未知 165C 合同已落盘。功能线继续 Active，唯一 Ready 切到 `TASK-SLICE-165C`。

2026-08-04 `TASK-SETTINGS-166A` 已归档：从唯一既有 `backpack1.swf` 选择性派生 358/610 操作条、五类 action 状态、10 个等级数字、30 帧经验条、出售白装与时装开关等 61 张透明 PNG；83 个 inventory UI key 的 provenance/bundle、尺寸/alpha/状态/整页裁片禁止门禁与零像素源帧对照已通过。本 task 未修改正式页面或库存行为，功能线继续 Active，唯一 Ready 切到 `TASK-SLICE-166B`。

2026-08-04 `TASK-SLICE-166B` 已归档：正式背包按 304/246/628 显示列表补齐角色、等级/经验、动态字段、六槽/时装、5×5 精确格阵与 358/610 原生操作层；`InventoryItemCell / InventoryGridProjection` 保持只读，战斗入口消费 HeroParty 即时 HP/MP snapshot，地图回退保存成长。P1/P2 940×590 与零 console、专项/构建通过，唯一 Ready 切到 `TASK-SLICE-165D`。

2026-08-04 用户复验指出正式背包仍有五项可见缺陷：物品格小框不美观、经验黄条错位、装备/给予/出售总操作层被后续对象遮挡、右下分页重叠并出现多余黑字、灵魂数字压框。原 166B 的资源/业务/owner 结论继续有效，视觉关闭结论降级为待复核；新增同线 `TASK-SLICE-166C` 为唯一 Ready，165D 暂回 Planned。关卡内左下背包 pointer 按用户要求暂不进入本 task。

2026-08-04 `TASK-SLICE-166C` 已归档：物品格改为透明命中区并裁去图标自带外框，经验帧按可见边界回到黑槽，358/610 操作层最后绘制，页码移除重复 `/5`，灵魂值在框内右对齐留边。940×590 P1 基础/操作层与零 console、P1/P2 owner 专项、build/workflow 通过；用户明确暂缓的关卡内左下入口未纳入整改。唯一 Ready 恢复为 `TASK-SLICE-165D`。

2026-08-04 用户用局部截图澄清：应保留 628 外层棕色格框，只去除物品图片自身的内层小框；经验 `a/b` 应以整条黑色槽居中；分页应显示 `1/5、2/5`。166C 的操作层、经验黄条、灵魂值与业务结论保留，上述三项视觉结论降级待修；新增 `TASK-SLICE-166D` 为唯一 Ready，165D 暂回 Planned。

2026-08-04 `TASK-SLICE-166D` 已归档：恢复 25 个 628 外层棕色格框，图标裁切从 5px 收紧为 9px 以去除自身内层框；经验文字以黑槽中心 `x=311.6` 独立居中；页码在两按钮间显示 `n/5`。940×590 的 1/5、2/5 证据与 console 零 warning/error、专项/build/workflow 通过；唯一 Ready 恢复为 `TASK-SLICE-165D`。

2026-08-09 `TASK-SLICE-165D` 已归档并重新关闭本线：character 119 右栏删除逐行文字列表，直接消费 `InventoryGridProjection / InventoryGridView`、246 四分类、25 个 628 格、统一真图标/数量与固定五页；格点击直接调用既有强化/合成/分解/打造 session，P1/P2 owner、拒绝、关闭返还与 V6 未分叉。`task-slice-165d.workshop-inventory` verified 真值 JSON、940×590 P1/P2/四页签/分页/暂存/返还与零 console、专项/全系统/build/workflow 门禁通过；Split 父任务 165C 随 166A..D 全部产物完成一并收束。现恢复 `LINE-STAGE-2-3 / TASK-SETTINGS-064` 为唯一 Active/Ready。

2026-08-09 用户重排 Stage 2-3 之前的后续工作：依次关注炼丹炉左侧页面、四个炼丹炉功能、全装备 UI/数值、人物数值与升级、存档、关卡左下五按钮以及部分 UI 重做。因四功能的全量事务依赖完整装备定义/数值，调度拆为“先复核规则，再补全装备，最后收口四事务”。新增并激活 `LINE-CORE-PROGRESSION-COMPLETION / TASK-SETTINGS-167`；`LINE-STAGE-2-3 / TASK-SETTINGS-064` 回到 Planned，不与新线并行。既有 V6 存档是扩展/迁移基础，不重写第二套 owner。

2026-08-09 `TASK-SETTINGS-167` 已归档：198/169/177/152 四页的完整帧 1 显示列表、按钮态、动态 `ShowObj`/TextField 拓扑、反馈边界、四份 verified 机器真值及 940×590 原版/现代差异证据均已闭合，影响首批实现的未知为零。左页实现按同源页面族拆为 `TASK-SLICE-168A`（强化/合成，唯一 Ready）与 `TASK-SLICE-168B`（分解/打造与联合校准，Planned）；功能线继续 Active。

2026-08-09 `TASK-SLICE-168A` 已归档：强化/合成直接消费 198/169 verified manifest，恢复六槽/三材料/预览/产物动态真图标、原 FZCuYuan 字段与 182/184、161/163 原按钮态；两页页底现代摘要删除，提交反馈进入宿主全局层。事务、随机、灵魂、库存、V6 与 165D 右栏 owner 未改；专项、全门禁及 940×590 P1/P2 空态/暂存/预览/拒绝/返还零 console 通过。功能线继续 Active，唯一 Ready 切换为 `TASK-SLICE-168B`。

2026-08-09 `TASK-SLICE-168B` 已归档：分解/打造直接消费 177/152 verified manifest，恢复目标/六产物、制作书/材料/宝石/产物、原字段与 176/139 按钮态；四页根按各自真值边界放置，消除强化/合成重复按钮。工坊右栏继续复用关卡内正式背包投影，仅保留背景自带 `/5` 前的当前页数字；用户逐次截图校准后，左侧暂存图标使用 63×62 投影覆盖白色内沿，仅保留最外层格框。左侧已有物品可再次点击并逐槽退回背包，合成中间退回保留其余槽位。默认/可容纳存档补入测试打造书 `whgzzs`，不覆盖已满背包。专项、全系统及 940×590 四页联合证据通过；功能线继续 Active，唯一 Ready 切换为 `TASK-SETTINGS-169`。

2026-08-09 `TASK-SETTINGS-169` 已归档：四功能共同 owner、暂存/返还、灵魂、原子拒绝、实例字段与 V6 保存链路已形成逐项矩阵；强化、分解、78 本可达打造和现代 112 条 Fusion 事务规则与专项一致。审计同时冻结三项未闭合边界：164 件装备基础值/强化成长全集依赖、原版 9 条时装时戳 Fusion 配方缺失、打造灵珠类 AS3 小数尚未换算为现代百分数点。唯一 Ready 切换为 `TASK-SETTINGS-170A`，先冻结全可穿戴装备权威数据，不提前修改事务或 UI。

2026-08-13 `TASK-SLICE-171` 在首次 compact 前已接入 9 条永久时装例外、121 条 Fusion、打造百分数点/V6 兼容与 164 件强化/分解联合回放；compact 后结束当前检查时，78 配方回放确认统一背包单堆上限使 160..1888 个高阶材料无法装入。按规模门禁将 171 标为 Split，唯一 Ready 切换为 `TASK-SLICE-171A`，只处理该可达性缺口、全量验收和父子归档。

2026-08-13 `TASK-SLICE-171A` 与 Split 父任务 171 已归档：统一背包保持单 fillName 单堆与 V6 形状，只把无权威依据的 99 上限提升为制作表最高需求 1888；材料不足/容量不足保持原子拒绝。164 件强化/分解、121 Fusion、78 打造的 P1/P2/V6 全矩阵、全系统/build 和 940×590 四页拒绝/返还/有效合成/灵魂保存重载均通过，console warning/error 为 0。功能线继续 Active，唯一 Ready 切换为 `TASK-SETTINGS-172`，先冻结五角色成长证据。

2026-08-15 用户要求把评审中经复评确认的 High/Medium 纳入任务流程。H1/M14/M15 直接威胁已完成工坊数据，前插 `TASK-SLICE-171B` 为唯一 Ready，172 暂回 Planned；M4 拆为 173 证据与 173A 正式接入，M5/M7 合并为 174，H2/M13 合并为 175 的逐页证据分级。M8 写入既有怪物 010A/010B 前置合同，M9/M10 进入 010C；H4/M16 与生成链验收进入发布线 177A/177B。H3、M1/M2/M3/M12/M18 等复评否定项和降为 Low 的 M11 不进入游戏任务。全项目仍只有本线 Active、171B Ready。

2026-08-15 `TASK-SLICE-171B` 已归档：存档升级为 V7，V6 全量 `baseStatsOverride` 只按定义基值迁移五个旧分数 delta，V7 再载不重复放大；Fusion 经书继承值进入实例 override 并通过正式工坊两次保存；灵魂统一净化为非负安全整数。真实全量快照、P1/P2、坏值、全系统/build 与 940×590 V6 槽载入/工坊往返零 console 通过。功能线继续 Active，唯一 Ready 恢复为 `TASK-SETTINGS-172`。

2026-08-15 用户裁决本项目不承担线上旧档兼容成本，schema 变化时旧槽直接不可用；“多版本 + 迁移 + 幂等兼容”不符合后续高频变更阶段。前插 `TASK-ARCH-178` 为唯一 Ready，删除全部历史迁移链并建立单一当前 schema 合同；172 暂回 Planned。

2026-08-15 `TASK-ARCH-178` 已归档：`SaveSystem` 只保留一个当前 schema，版本不匹配、旧结构或当前结构损坏均直接拒绝，不迁移、不自动修复且不自动删除 localStorage；经书继承实例属性、非负安全整数灵魂、P1/P2 与六槽当前存档往返保持。唯一 Ready 恢复为 `TASK-SETTINGS-172`。

2026-08-15 `TASK-SETTINGS-172` 已归档：从五个 `Role*.upGrade()`、`BaseRoleProperies`、`BaseHero`、普通怪/User/HUD 消费链生成带 source hash/locator/Schema 的 5×90 权威成长目录，闭合 Role5 `int` 防御、共同经验分段、跨级递归、回满/派生顺序、89/90 sentinel、普通怪 P1/P2 owner 和当前存档交接；普通成长实现未知为 0。功能线继续 Active，唯一 Ready 切换为 `TASK-SLICE-179`。

2026-08-15 `TASK-SLICE-179` 已归档：`ProgressionSystem` 直接消费 172 的 5×90 verified 目录，闭合 Role5 整数防御、7 转换向量与满级 sentinel；五关共享英雄 runtime 从活动 V7 槽恢复双方成长/装备，升级按基础值+实例 override/强化派生回满 HP/MP 并保存明确 owner。损坏成长字段与旧版本直接拒绝；全系统/build、940×590 1P/2P HUD 和零 console 通过。功能线继续 Active，唯一 Ready 切换为 `TASK-SETTINGS-173`。

2026-08-15 `TASK-SETTINGS-173` 已归档：`task-settings-173.role1-shadow` verified 真值以源 hash/locator 锁定 character 1、5×3 atlas、左右矩阵和 24 个逐向状态；证明 row0 是创建时五选一的静态 cell，72 tick 不切换候选，三档寿命均由 `frameClips*3` 保持约 3 秒。`hit1/hit2`、source owner、朝向、位置与销毁调用链闭合；TestScene 400ms 轮换/重复 x offset 与正式 Runtime 缺口已分列。功能线继续 Active，唯一 Ready 切换为 `TASK-SLICE-173A`。

2026-08-15 `TASK-SLICE-173A` 在完成现状与接缝调查后首次 compact，按规模门禁停止新增实现并改为 Split：`173A1` 先闭合 verified 状态机、共享视觉投射与 TestScene 薄适配，`173A2` 再接入正式英雄 Runtime 并验收 P1/P2/五关。无 `src/` 实现被冒充完成；功能线继续 Active，唯一 Ready 切换为 `TASK-SLICE-173A1`。

2026-08-15 `TASK-SLICE-173A1` 已实现 verified 状态机、共享视觉投射与 TestScene 薄 QA 适配，并完成阶段性专项/全量 systems/build 及 940×590 walk/hit2 检查；首次 compact 触发规模门禁后停止新增实现，剩余 hit1 fresh 证据落盘、全量门禁和归档拆为唯一 Ready `TASK-SLICE-173A3`。正式 Runtime `173A2` 仍为 Planned。

2026-08-15 `TASK-SLICE-173A1/173A3` 已归档：verified manifest 由状态机与共享视觉投射直接消费，TestScene 只保留不可见 QA 适配；固定 candidate、90/10/30 tick、hit1/hit2 派生/销毁、左右矩阵、独立 source/reentry 均由专项和 940×590 证据闭合，fresh console warning/error 为 0。功能线继续 Active，唯一 Ready 切换为正式 Runtime `TASK-SLICE-173A2`。

2026-08-15 `TASK-SLICE-173A2` 与 Split 父任务 `TASK-SLICE-173A` 已归档：共享 `HeroPartyRuntime` 成为正式影分身输入、目标、弹体、视觉和销毁 owner，P1/P2 source identity 隔离，`lyfb/zz` 仅由证据输入达到 hit1/hit2；五个正式关卡 940×590 加载/再入与 fresh console 零 warning/error 通过。功能线继续 Active，唯一 Ready 切换为 `TASK-ARCH-174`。

2026-08-15 `TASK-ARCH-174` 已归档：`task-arch-174.normal-attack-spatial` verified 真值单一持有四个 detached 世界特效的 `forward/rootOffsetY/localBounds`，`HeroNormalAttackGeometry` 直接投影并供视觉/碰撞共同消费；Role5 龙魂剑 projectile 恢复 X/Y 命中并把防御、伤害、hurt/dead、`lastHitBy` 与 audit 委托 `resolveStage1HeroHit`。专项、Schema、全系统/build、940×590 单/双人及零 console 通过；功能线继续 Active，唯一 Ready 切换为 `TASK-SETTINGS-175`。

2026-07-25 `TASK-SETTINGS-066` 已确认四入口实际调用链、四页面身份、三个恢复源包、四根 Symbol 与主要事务/存档边界。因跨三源包和四套 owner 且首次 compact，按拆分门禁停止扩张：父任务改为 `Split`，证据拆为 `066A..D`，实现父任务拆为 `155A..D`，公共检查点见 `map-service-ui-index.md`；功能线不关闭，`GOAL-037 / TASK-SETTINGS-066A` 继续唯一 Active。

`TASK-SETTINGS-066C` 已归档：character 148/134/136..147、关闭按钮四态、五行 hover/pressed/循环、全屏 overlay 生命周期、难度/声音/30-24-20 FPS 会话 owner、原版非存档反证和默认音量死控件均已闭合。用户确认的跨应用重启范围作为现代例外落到独立全局 localStorage，不修改 V6/player schema；功能线保持 Active，当前推进 `GOAL-044 / TASK-SETTINGS-066D`。

`TASK-SETTINGS-066D` 与逆向父任务 `TASK-SETTINGS-066` 已归档：character 85 完整显示列表、43 日常、4 个未接入 `actTask` 的活动定义、生产者、奖励分发、共享 owner、同日/跨日恢复、显式保存和原版瑕疵均已闭合，`task-ui-index.md` 使 `155D` 输入未知为零。四页证据阶段收束但功能线不关闭；当前转入 `GOAL-045 / TASK-SLICE-155A`，逐页完成现代实现。

2026-07-25 用户将“完整背包系统、所有可入包资源”提升为丹药实现前置。现有 `TASK-SLICE-135` 只证明正式背包页面、四分类、分页、穿脱、双 owner 与存档闭环，`M-037` 仍明确排除了完整 1.1 物品表，不能据此宣称全量资源基础完成。按证据/实现分离新增 `GOAL-049 / TASK-SETTINGS-070` 与 `GOAL-050 / TASK-SLICE-160`：先建立原版 1.1 四分类物品、真图标、堆叠/实例、容量和存档字段的权威目录，再接入统一背包目录与事务；物品专属使用效果继续按各玩法切片实现。`GOAL-045 / TASK-SLICE-155A` 顺延为 Planned，功能线保持唯一 Active。

2026-07-25 `TASK-SETTINGS-070` 已归档：原版 433 次注册经真实反向查找优先级归并为 431 个有效稳定身份，覆盖装备 164、道具 235、时装 20、技能书 12，以及 184 个实例和 247 个堆叠条目；428 项精确真图标、`wc/fmtstx/scwpqhs5` 三项原版缺陷、容量/存档语义及各共享消费者均落入机器目录。现代覆盖仍为 201/431，功能线不关闭，当前推进 `GOAL-050 / TASK-SLICE-160`。

2026-07-25 `TASK-SLICE-160` 已归档：431 项统一 definition registry、428 项真图标懒加载、3 项原版缺陷排除、四分类 5×25、实例/99 堆叠、满包原子事务、P1/P2 owner、V6 兼容/拒损与正式原生背包均闭合。功能线继续 Active，当前恢复 `GOAL-045 / TASK-SLICE-155A`。

2026-07-25 `TASK-SLICE-155A` 已归档：character 990/969/1006、四类按钮状态、五 owner、25 格与真丹药图标按原显示列表接入；五类五阶服用、五配方炼制、灵魂/材料/容量拒绝、5% 炼制失败、P1/P2 隔离、V6 标志迁移和活动槽即时保存均通过专项与 940×590 逐状态验收。功能线继续 Active，当前激活 `GOAL-046 / TASK-SLICE-155B`。

2026-07-25 `TASK-SLICE-155B` 已归档：商城 character 721/717/624、16 组原按钮三态和 49 个真商品图标接入；分类、分页、0/99/100 数量、确认/取消、Stage 3 后八折例外、灵魂/容量原子拒绝、P1/P2 隔离、V6 活跃槽即时保存与正式往返通过专项和 940×590 逐状态验收。即时保存是现代离线可靠性选择，不改写原 Flash 手动保存事实。功能线继续 Active，当前激活 `GOAL-047 / TASK-SLICE-155C`。

`TASK-SLICE-155C` 已归档：character 148/134/136..147 设置 overlay、五行白/黄 hover、无额外 pressed、144 关闭三态、难度/BGM/技能音效/30-24-20 FPS 循环、默认音量死控件、全屏模态阻挡和关闭重开均已接入。会话级全局 owner 以独立 `zaixu-global-settings-v1` localStorage 持久化，损坏回默认且不修改 V6/player schema；专项、全系统、build 与 940×590 并排/逐状态/重载零 console 通过。功能线继续 Active，当前激活 `GOAL-048 / TASK-SLICE-155D`。

`TASK-SLICE-155D` 与父任务 `TASK-SLICE-155` 已归档：character 85、44/49、54/60/73、31/78/83、9 与四种共享奖励图标进入正式地图任务页；43 日常、4 休眠活动、共享进度、普通/困难计数、地狱不计、非均匀随机、双方奖励、同日重载与跨日重置进入当前槽 V6。专项、全系统、build、标注与 940×590 日常/selected/空活动/末页/关闭零 console 通过，VS-059 完成。功能线继续 Active，当前激活 `GOAL-038 / TASK-SETTINGS-067`。

2026-07-26 `TASK-SETTINGS-067` 已归档：恢复 `OtherMat1.swf` character 574 的五个真 HUD pointer（549/555/561/567/573）、371 关卡 `SetMenu`、444 两帧 `Help`、13 组按钮状态、P2 镜像、快捷键/owner/关卡与死亡门禁、完整暂停、单页互斥和返回合同均已闭合。证据纠正了“P2 `*` 默认 P2 技能 owner”和“Escape 通用关闭”两项旧结论；当前现代 host 仍缺 pointer/settings，并保留原版没有的可见跨页/workshop/通用关闭。实现按 `TASK-SLICE-156A..C / GOAL-057..059` 串行拆分；功能线保持 Active，当前只执行 `GOAL-057 / TASK-SLICE-156A`。

2026-07-26 `TASK-SLICE-156A` 已归档：574 的 549/555/561/567/573 五入口 up/over/down/hit 共 20 个真 PNG 已进入 `combat-common`，P2 按 `920-x` 镜像；共享 router 统一 pointer/key、P2 `*` 默认 P1 技能、死亡/特殊关卡/法宝装备门禁与 settings pending。940×590 双人 Stage 1-1 完成 P1/P2 HUD、P2 pointer 打开原生背包、关闭返回和零 console 验收。功能线保持 Active，当前推进 `GOAL-058 / TASK-SLICE-156B` 接入 371/444 与原版单页会话语义。

2026-07-26 `TASK-SLICE-156B` 已归档：371/444、366 三帧和 11 个设置/帮助按钮四态进入 `combat-common`；新增全局设置会话、声音互斥、x1/x2/x4、帮助两帧和地图/主菜单薄路由。战斗功能页不再绘制现代暗层、标题、边框、跨页/workshop 或通用关闭，只保留当前原生页、同页快捷键关闭与 Escape 仅设置。专项、全系统、build、structure、annotations、workflow、diff check 通过；内置浏览器能进入正式 1-1/1-2，但战斗 canvas 输入自动化未触发，五关逐状态与 console 关闭证据明确交给 `GOAL-059 / TASK-SLICE-156C`。功能线保持 Active。

2026-07-26 `TASK-SLICE-156C` 与父任务 `TASK-SLICE-156` 已归档：五个正式关卡统一纳入入口确定性旅程，闭合 P1/P2 owner、门禁、暂停、单页 busy、同键/Escape 和返回；HUD hit zone 收敛为固定屏幕坐标。运行校准同时修复 Stage 2-2 复用 Monster9/10/19 时遗漏攻击几何的资源回归，以唯一 `stage-2-monsters` bundle 供 2-1/2-2 共享。专项、Stage 2 回归、build 与 940×590 正式节点/HUD 证据通过，VS-060 完成；功能线继续 Active，当前激活 `GOAL-039 / TASK-SETTINGS-068`。

2026-07-25 `TASK-SETTINGS-066A` 已闭合丹药页完整显示列表、按钮状态、五类五阶、五配方、拒绝态、P1/P2 owner 和存档边界，详见 `immortality-ui-index.md`。功能线不关闭，转入 `GOAL-042 / TASK-SETTINGS-066B`。

2026-07-25 `TASK-SETTINGS-066B` 已闭合商城 character 721/717/624 的完整显示列表、16 个按钮四状态、49 商品与权威价格、第三大关折扣例外、数量/拒绝态、P1/P2 owner、离线灵魂事务和保存边界，详见 `shop-ui-index.md`。功能线不关闭，转入 `GOAL-043 / TASK-SETTINGS-066C`。

`LINE-STAGE-2-1` 已关闭：`TASK-SLICE-145` 闭合行为/流程，`TASK-SETTINGS-062` 闭合真视觉证据，`TASK-SLICE-146` 接入 4 个 atlas、132 个攻击帧、100/130 碰撞高、左右镜像、精确触发 tick、死亡播完销毁并完成 940×590 1P/2P 逐状态与最终门复验；新标签页 console 无 warning/error。

`LINE-UI-NATIVE-SKILLS` 已关闭：`TASK-SETTINGS-061` 闭合四页显示列表、原版视觉基准、按钮/命中区和动态槽位；`TASK-SLICE-143` 派生并接入 220 个原生 base/按钮/帧资源，移除替代覆盖层，完成学习、升级、绑定、被动、P1/P2、关闭、重载和 V4 回归。

`LINE-STAGE-2-2` 已关闭：`GOAL-020` 闭合六段证据，`GOAL-021..023` 分别接入真场景/火焰、普通流程与 Monster16/结果，`GOAL-024` 完成 940×590 1P/2P 正式入口、五停点、9/9 火焰代表帧、Monster16 八动作/六攻击、失败、显门胜利、返回和当前槽重载。专项、全系统、structure、build、annotations、workflow、diff check 全部通过，浏览器 console warning/error 为 0。

2026-07-24 用户反馈推翻 `LINE-FORMAL-GAME-LOOP` 的旧队伍关闭合同：关卡内容继续扩展前，必须先把玩家人数与当前角色固定到新建存档，并让技能页、地图、关卡、HUD、功能页和重试统一消费该存档队伍；地图不得逐关重复选择 1P/2P。现重开并激活 `LINE-FORMAL-GAME-LOOP` / `GOAL-028` / `TASK-SETTINGS-065`。`LINE-STAGE-2-3` / `GOAL-025` / `TASK-SETTINGS-064` 降为 Planned，正式主循环再次关闭后恢复，不丢弃原任务定义。

`TASK-SETTINGS-065` 已归档：原版在主菜单人数页写 `playNum`，单人只选 P1、双人按 P1→P2 且不可同角色；`MemoryClass` 保存人数和双方 `roleid`，地图节点直接进关，技能页按活动 User/当前角色建 owner。character 1149 人数页与 character 901 五角色页的显示列表、按钮态、命中列、P1/P2 标记和 940×590 裁切基准已闭合；现代确定采用原子 draft、新版 `PartyConfiguration`、旧 V1..V4 默认 1P 且保留 P2 数据。功能线保持 Active，当前推进 `GOAL-029` / `TASK-ARCH-011`。

`TASK-ARCH-011` 已归档：存档升级为 V5，`PartyConfigurationSystem` 成为无 Phaser 的队伍值对象/查询 owner；V1..V4 与旧单槽统一迁移为 1P 并保留 P2 数据，V5 对人数、角色、重复角色和 party/player hero 不一致严格拒读，原子建槽失败会回滚。功能线保持 Active，当前推进 `GOAL-030` / `TASK-SLICE-151`。

`TASK-SLICE-151` 已归档：空槽现在先进入 character 1149 人数页，再进入 character 901 五角色页；1P 只选 P1，2P 按 P1→P2 且不能重复角色，最终点击一次性创建 V5 存档。人数返回/角色 Escape 不写半档，重复确认幂等，槽摘要重载保持人数与角色；25 条原生资源、专项/系统/build 与 940×590 逐状态零 console 证据闭合。功能线保持 Active，当前推进 `GOAL-031` / `TASK-SLICE-152`。

`TASK-SLICE-152` 已归档：正式技能页入口、owner selector 和所有技能事务现在从活动槽 V5 `PartyConfiguration` 取得 owner/hero；单人 P2 在入口、切换和直接系统调用三层拒绝，双人 P1/P2 按稳定 slot 隔离保存与 HUD 同步。五角色、双人异角色、重复角色非法 V5、保存重载专项与 940×590 单/双人零 console 证据闭合，未改技能数值、树、快捷键或原生显示列表。功能线保持 Active，当前推进 `GOAL-032` / `TASK-SLICE-153`。

`TASK-SLICE-153` 已归档：天庭地图删除现代逐关人数 chooser，已接入 Stage 1-1/1-2/1-3/2-1/2-2、HUD、功能页和重试统一经共享 party bootstrap 读取活动槽；关卡战斗 runtime 使用 party hero，正式路由不再接受 `playerCount` 权威覆盖，显式 DEV/QA 使用隔离 `devParty`。五角色、1P/2P、重复角色拒绝、直入/返回/重载与 940×590 单/双人证据闭合。功能线保持 Active，当前推进 `GOAL-033` / `TASK-ARCH-012`。

2026-07-24 用户确认把冷刷新资源问题同时纳入问题治理和任务流程：新增 `PG-009` 与同线 Planned `GOAL-033` / `TASK-ARCH-012`。它在 `TASK-SLICE-153` 后治理 Boot 全量加载、场景 bundle owner、失败重试与防复发门禁；完成前不恢复 Stage 2-3。

`TASK-ARCH-012` 已归档：Boot 仅排队 `shell`，地图、功能 UI、五个正式关卡和 Stage 2-2 DEV/QA 直达均经稳定 bundle 首次 ensure；并发、失败、重试、销毁和无 owner/Boot 回填负向门禁闭合。940×590 冷刷新首屏从 250 个资源降为 5 个，三次为 1243/788/646ms，地图再进资源总数保持 11，Stage 1-1/Stage 2-2 未串载其他场景族，console 为 0。本线全部关闭合同满足，现关闭并激活 `LINE-STAGE-2-3` / `GOAL-025` / `TASK-SETTINGS-064`。

2026-07-24 用户复验再次推翻技能页面关闭结论：首次打开技能页仍需 3–5 秒；868/213 扁平基准中残留的默认动态 child 与运行时动态 child 重复绘制，造成主动/被动文字交叠，并让不同角色可见上仍像悟空的“斩系/火系”；双人页缺少与炼丹炉一致的明确 `P1技能/P2技能` owner；右下灵魂需要沿用同一 owner UI，且数值必须由当前存档持久化。现重开 `LINE-FORMAL-GAME-LOOP` / `GOAL-034` / `TASK-SLICE-154`，`LINE-STAGE-2-3` / `GOAL-025` 暂回 Planned；整改只复用既有 OtherMat1 派生资源和 V5 数据，不改技能规则。

`TASK-SLICE-154` 已归档：功能 UI 从整包拆为页级 bundle，技能资源再拆为公共资源与五个角色各 30 帧；868/213/250 基底移除会被运行时重复创建的动态 child，五角色分别显示自己的两套心法，双人页增加用户批准的炼丹炉风格 `P1技能/P2技能`，右下灵魂继续由 V5 当前 owner 的 `skillLearning.soulCount` 持久化。专项、全系统、build、structure、workflow、diff check 与 940×590 唐僧/白龙 P1/P2、被动页、约 1.0–1.2 秒首次进入证据闭合。本线重新关闭并恢复 `LINE-STAGE-2-3` / `GOAL-025` / `TASK-SETTINGS-064`。

2026-07-24 用户进一步纠正灵魂领域归属：灵魂不只用于学习技能，炼丹炉、法宝和其他功能同样消费，因此 `player*.skillLearning.soulCount` 不能作为长期 owner。现新增 `PG-010`，重开 `LINE-FORMAL-GAME-LOOP` 并激活 `GOAL-035 / TASK-ARCH-013A`；先完成 `player.soulCount` 与 V6/旧档迁移，再由 `GOAL-036 / TASK-ARCH-013B` 闭合跨功能消费和正式旅程。`LINE-STAGE-2-3 / GOAL-025` 暂回 Planned。

`TASK-ARCH-013A` 已归档：当前存档升级为 V6，`PlayerFeatureSaveV6` 与 `LoadedPlayer1State` 直接持有 `soulCount`，`HeroSkillLearningState` 不再拥有灵魂；V1..V5 嵌套值无损迁移，V6 双 owner round-trip、不同余额、损坏/双源拒读和现有功能保存路径专项均通过。功能线保持 Active，当前推进 `GOAL-036 / TASK-ARCH-013B`，只闭合统一消费合同、负向门禁与正式旅程。

`TASK-ARCH-013B` 已归档：新增玩家级 `PlayerSoulSystem`，技能、工坊四事务与法宝统一通过同一检查/扣减合同；非法/余额不足不变性、P1/P2 隔离、技能→工坊→法宝→另一玩家技能→重载旅程、全系统/build/structure/workflow/diff check 与 940×590 单/双人正式功能页零 console 均通过。`PG-010` 关闭，正式主循环再次关闭；当前恢复 `LINE-STAGE-2-3 / GOAL-025 / TASK-SETTINGS-064`。

2026-07-24 用户反馈技能页与炼丹炉右下角余额不一致：根因是工坊 PNG 保留扁平占位数字，且跨页 host 缓存目标页面旧 model。本次作为 `TASK-ARCH-013B` 窄回归修复，新增技能/工坊共享动态余额组件并在跨页进入时从当前 V6 存档重建 model；专项、正式跨功能旅程、build 与 940×590 双页零 console 通过。正式主循环不重开，`LINE-STAGE-2-3 / GOAL-025` 保持 Active。

2026-07-24 用户继续指出首轮共享组件的黑底侵入技能页“灵魂”标签，且数字样式偏离原版。复核源 SWF 后确认技能 `txtlh` 为 `(805.95,544,135×31.7)`、工坊为 `(801.55,550.15,135×31.05)`，两者均为 `FZCuYuan-M03` 白色无描边 TextField。最终移除黑底/描边/阴影，从 character 119 派生无动态占位的原生工坊 SVG，并以同一组件按源槽位投影实时余额。此窄视觉回归已闭合，Stage 2-3 保持 Active。

2026-07-24 用户再次指出字体、字号和位置仍未对齐；复验确认仅声明 `FZCuYuan-M03` 会回退到浏览器系统字体，Canvas 基线/字宽也不等于 Flash。共享余额现直接使用 DefineEditText 103 的嵌入 0–9 矢量轮廓及原版缩放、基线、advance 和右对齐，技能/工坊 940×590 证据已更新；Stage 2-3 继续保持 Active。

2026-07-24 用户反馈指出五角色两棵心法的 10 张选择器图片全部缺失。复核确认 `TASK-SLICE-154` 只留下 character 597/608 的透明命中区；现已补齐各 5 帧真资源、角色映射、原坐标渲染、bundle 防复发门禁与 940×590 零 console 证据。该窄修复不改技能规则/存档/owner，不重开正式主循环，`LINE-STAGE-2-3 / GOAL-025 / TASK-SETTINGS-064` 继续保持 Active。

2026-07-25 用户指出被动技能页表头为空且效果列只有裸数值。复核 character 213/212 与 `PassiveSkill.analy()` 后确认：原版黑色表头区确无文字，但当前/下级效果原本应显示完整属性说明。首轮补六列表头的现代例外被用户复验否决；最终恢复原版空表头、完整效果文案和 SWF 内嵌 `FZCuYuan-M03`，技能页进入前等待原字体加载。专项、build、workflow 与单人 940×590 零 console 通过；不改变技能规则、存档或当前 Active 功能线。

本线按依赖顺序推进：战斗死亡原因/攻击可读性/数值合同 → 可稳定通关的战斗切片 → 核心战斗 HUD → 启动与存档槽 → 天庭地图/关卡解锁 → 背包、宠物等完整功能 UI。每一步仍拆为小 task；不得用某个最小 HUD 或存档切片越级关闭整线。

`TASK-SLICE-124` 已归档：玩家可见入口、统一 1P/2P 全灭门禁、失败/胜利结果导航、V3 关卡进度迁移和运行时验收全部完成。Stage 1-2/1-3、怪物真素材和全局菜单不属于本线确认范围，后续不得回写为 `LINE-STAGE-1-1` 未完成项。

2026-07-23 用户试玩推翻既有关闭结论后，本线短暂重开并完成 `TASK-SLICE-147`：停点只约束波次/Boss 推进、不再锁死已上行玩家镜头；移除地面 Monster72 调试靶；确定性合同继续保证门内 P1 W/P2 ↑ 才显示通关结果；地图场景重入清空已销毁人数选择引用。专项、全系统、build 与 940×590 1-1 进入/返回/再选 1-2 通过，console 无 warning/error；本线重新关闭并恢复技能 UI 原生化线。

同日二次反馈由 `TASK-SLICE-148` 关闭：不再逆向已有普通门，1-1 直接复用 Stage 1-3 已接入的原版 W 门并删除矩形/辉光/替代文字；Boss 触发只判断任一存活玩家是否到达最高层，不再读取停点清怪状态。专项、全系统与 build 通过，本线再次关闭并恢复技能 UI 原生化线。

同日最高层镜头小修由 `TASK-SLICE-149` 关闭：恢复 `StageListener11` 的明确构图证据，玩家最终位于原版屏幕 `y=420/590`，镜头用 2 秒过渡到 Boss 构图；Boss 仍按前次反馈立即出现。

`TASK-SLICE-125` 已归档：Stage 1-2 的 72 张真资源 PNG、manifest provenance、3+1 墙/5 停点/13 刷怪点布局、原组合层级、解锁门禁与 1P/2P 入口均已接入并通过运行时验收。

`TASK-SLICE-126` 已归档：独立状态机直接消费 13 个布局刷怪点，完成五停点 8/11/12/13/2 共 46 怪、Monster4+Monster2 双 boss 显门、普通胜利/统一 1P/2P 失败、V3 解锁 1-3 与运行时入口验收。

`TASK-SLICE-127` 已归档：可见法宝弹体实际穿过入口碰撞区后计数，五击共享 1 秒防重复，使用 30 张真帧开放，任一/交替玩家共享 72 帧驻留后一次性清理 1-2 并切至 5-1 过渡边界；不触发普通胜利或改写存档，且没有伪造专属返回 1-2。

`TASK-SLICE-129` 已归档：character 13/119/40 真场景、独立 Stage 1-3 模块、正式 1P/2P 入口、五停点、6/8 同屏上限、Monster5 显门、失败/胜利和 2-1 解锁存档闭环均已完成。

`TASK-SETTINGS-054` 与 `TASK-SLICE-130` 已归档。三关共用注册表/combat adapter、Role1 攻击窗口、3 秒保护、输入缓冲和死亡日志；1-2/1-3 的私有心数、固定 500 攻击和接触扣血已移除，1-1 三次完整无调试运行全部通关。功能线保持 Active，当前继续 `TASK-SETTINGS-055` 闭合正式核心战斗 HUD；Stage 2-1 的 `TASK-SETTINGS-053` 保持 `Planned`。

2026-07-22 用户试玩发现 1-1 Boss 未落地、死亡奖励仅 1-1 接入，以及灵魂仍使用占位 UI。当前插入 `TASK-SLICE-134` 作为同线战斗回归修复：建立怪物默认重力/显式飞行例外、共享死亡奖励 owner，并在 Stage 1 三关接入生命、魔法、灵魂与直接经验结算；`TASK-SETTINGS-055` 暂回 `Planned`，修复完成后恢复。

`TASK-SLICE-134` 已完成：1-1 Monster3 与 1-2/1-3 地面怪复用默认重力，Monster30 以显式 `flying` 豁免；三关死亡统一进入共享奖励 owner，正式生命/魔法/灵魂资源、灵魂追踪、战意副收益和直接经验均已接入。功能线保持 Active，当前恢复 `TASK-SETTINGS-055`。

`TASK-SETTINGS-055` 已归档：`combat-hud-index.md` 闭合固定 HUD 层、P1/P2 独立 owner、五槽键位映射、HP/MP/经验/等级、法宝/宠物入口、Boss 即时/0.8 秒追赶条和生命周期六段证据；`OtherMat1` / `bossblood` 共 12 条真资源进入 `export-ready`。功能线保持 Active，当前推进 `TASK-SLICE-131`。

`TASK-SLICE-131` 已归档：新增共享 `Stage1CombatHudSystem` / `Stage1CombatHudBridge`，正式经验奖励进入 `HeroProgressionModel`，三关接入 P1/P2 HP/MP/经验/等级/五槽状态、入口提示和重要敌人条；`RoleInfo` / `BossBlood` 真资源已接入并完成 940×590 的 1-1 单人、1-2 双人镜像、1-3 单人浏览器验收。功能线保持 Active，随后推进启动/存档逆向。

`TASK-SETTINGS-056` 已归档：闭合原版 `GameMenu → 新游戏/继续 → SaveInter`、六槽读写/覆盖、V1 字段、损坏静默边界和地图分流；定位并选择性派生 `GameMenu` 1149、`SaveInter` 69、`IsCover` 18。原版没有已证实删档，正式槽优先/删除/损坏反馈均作为现代合同交给 `TASK-SLICE-132`。

`TASK-SLICE-132` 已归档：真 `GameMenu` / `SaveInter` / `IsCover` 进入正式启动页，六槽独立持久化、当前槽写回、旧单槽导入、V1/V2 原位迁移、损坏拒读和显式删除已闭合；专项/系统/build 与 940×590 浏览器验收通过。功能线保持 Active，当前推进 `TASK-SETTINGS-057` 闭合天庭地图证据。

`TASK-SETTINGS-057` 已归档：`heaven-map-index.md` 闭合第一世界真地图/共享菜单、Stage 1 三节点与 Stage 2-1 边界的注册点、可见边界、frame 1/2/3、单调解锁和结果往返；`OtherMat1.swf` 6 条精确资源已选择性派生。功能线保持 Active，当前推进 `TASK-SLICE-133`。

`TASK-SLICE-133` 已归档：新增集中节点状态 owner 与正式天庭地图场景，接入 940×590 真地图/菜单、锁定/当前/已通关/2-1 未接入状态、现代 1P/2P 选择和 Stage 1 三关结果/退出返回；专项、系统、build 与浏览器初始档/1-1 往返验收通过。功能线保持 Active，当前推进 `TASK-SETTINGS-058`。

`TASK-SETTINGS-058` 已归档：`full-function-ui-index.md` 建立 14 个页面/子页的入口/退出、字段/交互、P1/P2 owner、存档、真资源和现代缺口矩阵；从 restored SWF 选择性派生 11 条新 UI 资源，并按正式导航依赖拆成 `TASK-ARCH-008/009`、`TASK-SLICE-135..140` 与 `TASK-SETTINGS-059`。功能线保持 Active，当前推进 `TASK-ARCH-008`。

`TASK-ARCH-008` 已归档：新增共享 owner-aware `FeatureUiHostSystem`、正式 Phaser overlay 与统一入口 bridge，HeavenMap/Stage 1 三关复用同一单实例互斥、模态冻结、暂停/恢复和关闭合同；未实现页面明确显示待接入，不冒充完整 UI。功能线保持 Active，当前推进 `TASK-ARCH-009` 升级 V4 双玩家功能存档。

`TASK-ARCH-009` 已归档：`SaveSystem` 升级为 V4 同构双玩家功能快照，保存双方成长、技能、库存/装备和宠物；V1/V2/V3 保留已有 P1 与宠物并为缺失域使用安全默认，正式当前槽和 1P 保留未上场 P2 数据均有专项回归。功能线保持 Active，当前推进 `TASK-SLICE-135` 真背包/装备页。

`TASK-SLICE-135` 已归档：真 304/246 背包资源进入 940×590 正式页，四分类、25 格分页、装备槽、P1/P2 owner 穿脱、安全拒绝和 V4 当前槽重载闭合；专项、系统、build 与地图/双人 Stage 1-1 浏览器验收通过。功能线保持 Active，当前推进 `TASK-SLICE-136` 真技能页。

`TASK-SLICE-136` 已归档：真 250/868/417/213 技能总页、主动双树、五槽绑定和被动页进入正式 host，复用权威树/学习/升级/绑定/灵魂门禁；地图管理双持久化 owner，三关在保存后同步 HUD 或从 V4 重载。功能线保持 Active，当前推进 `TASK-SLICE-137` 真宠物页。

`TASK-SLICE-137` 已归档：真 `pet1.swf` 932 宠物页进入正式 host，完成每页 5/最多 10、完整属性、8 技能展示、出战/休息、二次确认放生、成长/技能重洗和三形态进化；P1/P2 当前槽、运行时重建和确定性专项均闭合。浏览器已受 URL 策略限制，未绕过；页面路由、双 owner 与重载由专项/系统/build 覆盖。功能线保持 Active，当前推进 `TASK-SETTINGS-059`。

`TASK-SETTINGS-059` 已归档：`equipment-workshop-index.md` 从三子页追到 `AllEquipment/MyEquipObj/User/PackThings/StrengthEquipment`，闭合强化 5×7 概率、灵魂/降级/保底、实例存档，分解品质/类型/角色随机链，以及 79 个制作书 case（78 可达、1 死分支）、宝石实例加成、关闭返还与 198/177/152 几何。影响实现的未知为零。原 `TASK-SLICE-138` 因跨容器、三类事务和存档迁移过重，已拆成 `138A..138D` 和 `GOAL-001..004`；功能线保持 Active，当前只推进 `GOAL-001` / `TASK-SLICE-138A`。

`TASK-SLICE-138A` 已归档：119 真工坊容器与 169 真 Fusion 已迁入正式功能页 host，四标签、P1/P2 owner、材料暂存/撤回、切页/换人/关闭返还和当前槽持久化均由独立系统 owner 闭合；强化、分解、制作明确保持待接入。浏览器仍受 URL 策略限制且未绕过，专项、全系统与 build 提供确定性替代证据。功能线保持 Active，当前推进 `GOAL-002` / `TASK-SLICE-138B`。

`TASK-SLICE-138B` 已归档：装备实例可保存 `strengthLevel/baseStatsOverride` 并由 definition `strengthGrowth` 派生有效属性，V4 同版本旧字段缺失使用安全默认；真 198 强化页、背包分页、装备/三石/幸运/神恩暂存、5×7 概率、灵魂、成功升级、失败降级、保底、取消/切页/换人/关闭返还和 P1/P2 当前槽持久化均已闭合。浏览器完成真页面、不可强化装备与灵魂不足原子拒绝观察，确定性成功事务由专项覆盖；临时验收槽已删除且控制台无 error/warning。功能线保持 Active，当前推进 `GOAL-003` / `TASK-SLICE-138C`。

`TASK-SLICE-138C` 已归档：真 177 分解页、武器/防具/饰品准入、固定 100 灵魂、品质/类型/五角色材料链、一级宝石后减概率和神器 20.8%/20.4% 分支已由独立 `EquipmentResolutionSystem` 闭合；随机源可注入，提交前容量预检保证装备销毁/灵魂/产物原子性，取消/切页/换人/关闭返还和 P1/P2 当前槽持久化均有专项覆盖。浏览器运行验收受 URL 策略限制且未绕过；专项、全系统、build 和真资源静态接线提供确定性替代证据。功能线保持 Active，当前推进 `GOAL-004` / `TASK-SLICE-138D`。

`TASK-SLICE-138D` 已归档：78 本可达制作书由表驱动 registry 覆盖，`zxqtgzzs` 死分支保持不可达；制作书、最多两类必需材料、灵魂和三可选宝石由独立 `EquipmentMakingSystem` 原子结算，宝石随机加成写入产物实例 `baseStatsOverride` 并通过双 owner V4 round-trip。152 真制作页已接入 119 工坊；专项、全系统、build 与 940×590 地图入口/P1-P2/关闭返回浏览器验收通过且控制台无 warning/error。功能线保持 Active，当前推进 `GOAL-005` / `TASK-SLICE-139`。

`TASK-SLICE-139` 已归档：596 真法宝页已接入正式 P1 `N`/共享导航，未装备拒绝，常规灵魂、龙女眼泪、烛时星魄、昆仑玉与青萍精元分支、提交/取消、3 个传承法器五行重置、属性重算和 V4 法宝等级/五行/成长属性 round-trip 已闭合；原版无 P2 面板快捷键，现代明确不伪造。专项、全系统、build 与地图入口/强化/关闭返回浏览器验收通过，浏览器重载受 URL 策略限制而由确定性专项补证。2026-07-23 用户验收明确要求炼丹炉不得在原容器上另覆现代 UI，必须直接复用左下侧原生位置和原生按钮；因此端到端关闭任务后移，并在同线插入按钮证据 Goal。

`TASK-SETTINGS-060` 已归档：character 119 左下侧四个原生页签被确认是独立 DefineButton2 `95/99/109/113`，左到右原标签为“强化 / 合成 / 分解 / 打造”；白色 up、橙色 over/down、下沉矩阵、透明 hit bounds、940×590 映射和 `StrengthEquipment` 切页/选中调用链均已闭合，影响实现的未知为零。功能线保持 Active，当前推进 `GOAL-007` / `TASK-SLICE-141` 移除现代覆盖导航并接回原生按钮。

`TASK-SLICE-141` 已归档：新增可重生的 119 无按钮背景和 12 个 95/99/109/113 原生 up/over/down SVG，按已闭合命中区接回“强化 / 合成 / 分解 / 打造”；顶部现代标题/四标签和全屏暗罩已移除，P1/P2 选中、切页返还、拒绝事务、关闭返回和 console 已以专项/构建/940×590 浏览器证据闭合。功能线继续 Active，当前激活 `GOAL-008` / `TASK-SLICE-140` 端到端旅程。

`TASK-SLICE-140` 已归档：新增 `formal-game-loop-journey-tests.ts`，把启动新建/读档、地图、P1/P2 五类功能页、Stage 1-1 结算解锁、返回地图和再次选槽重载串成独立自动旅程并纳入全系统测试；`check:all` 与 `git diff --check` 通过。940×590 浏览器完成新建槽、P1/P2 工坊/技能、2P 进入 1-1、退出返回和再次读档，console 无 warning/error，证据保存于 `docs/tasks/evidence/TASK-SLICE-140-*.png`。本线关闭，当前激活 `LINE-STAGE-2-1` / `GOAL-009` / `TASK-SETTINGS-053`。

2026-07-23 用户复验指出工坊页面仍有四项视觉/交互偏差，证明本线关闭门禁对“原图直接承载交互”检查不足。现重新打开本线并激活 `GOAL-010` / `TASK-SLICE-142`；`GOAL-009` / Stage 2-1 暂回 Planned，整改闭合前不切线。

`TASK-SLICE-142` 已归档：页面恢复原始 `container.png`，四页签、翻页、提交、槽位和右上“返回”均由原图透明命中区承载；四操作主体共享左框中心，P1/P2 使用左上 26px 粗体描边文字且无现代底板。派生无字背景、12 个页签 SVG 和生成脚本已删除，恢复 SWF/旧提取结果未动。专项、全门禁、build、workflow 与 940×590 P1/P2/四页/返回复验通过，console 无 warning/error。本线重新关闭，当前切回 `LINE-STAGE-2-1`。

`TASK-SETTINGS-053` 已归档：恢复 `level21.swf` character 49/19/21/48/16 与 `assets/2.swf` character 282/3，闭合 3+1 墙、4 平台、5 停点、25 刷怪点、五批 10/12/14/16/1、Monster6 死亡显门、19+19 冰刺、统一失败和胜利保存 2-2；六段矩阵与 7 条资源标注无影响首切片的未知。功能线保持 Active，当前推进 `GOAL-013` / `TASK-SLICE-144`；怪物/弹体真视觉仍明确后置。

2026-07-26 `TASK-SETTINGS-068` 已归档：五关实际生成全集回溯到 Stage 1 的 Monster2/3/4/5/7/8/30 与 Stage 2 的既有 6/9/10/16/19；恢复 `assets/1.swf` / `StageCommon.swf` 闭合七本体 167 个独立视觉帧、16 攻击/效果对象 171 帧、3 碰撞根、hold/触发 tick、注册点、镜像和生命周期。Stage 2 ready/public/运行证据回归一致，影响逐关实现的原版未知为零。功能线保持 Active，父任务 157 固定拆为 `157A..D / GOAL-060..063`，当前只激活 Stage 1-1 的 `GOAL-060 / TASK-SLICE-157A`。

2026-07-26 `TASK-SLICE-157A` 已归档：Stage 1-1 的 Monster30/3 共 40 个本体独立视觉帧、Monster30Bullet1 与 Monster3Bullet1/2 共 25 帧已接入唯一 `stage-11` bundle；共享只读描述保留原版 hold tick、BBDC offset、注册根、左右镜像、触发 tick 和末帧生命周期。正式路径已移除两怪 Arc/Text/单帧占位及矩形攻击提示，死亡动画在玩法对象移除后仍播放至原末帧；没有修改伤害、AI、门禁、物理或奖励 owner。专项、全系统、build、annotations、bundle 与 940×590 单/双人运行零 console 通过。功能线继续 Active，只激活 `GOAL-061 / TASK-SLICE-157B`。

2026-07-26 用户复验确认 Stage 1-1 再次不能稳定通过“光门 + W”通关，并要求关卡公共行为统一。代码复核发现 1-1 使用独有的 X/Y 精确门矩形与两级完成状态，其余四关分别复制 X 距离、失败倒计时、`tryCompleteStageXX()` 和解锁提交，登记 `PG-012` 与同线 `GOAL-064 / TASK-ARCH-015`。用户进一步确认目标不是只统一现有五关，而是建立全部后续关卡默认复用的生命周期/结果协议；五关仅作为首批迁移与验收样本，特殊关卡通过有证据的窄策略扩展，不得另起整套 Flow。当前 `GOAL-061` 仍为唯一 Active；新 Goal 排在 `157B..D` 怪物视觉链关闭后、角色视觉逆向前。

2026-07-30 用户明确要求立即完成 `TASK-ARCH-015` 的代码实现。该任务与原 `GOAL-061` 同属当前功能线，现将 `GOAL-064 / TASK-ARCH-015` 重排为唯一 Active，`GOAL-061 / TASK-SLICE-157B` 暂回 Planned；本次只治理通用关卡生命周期/结果协议及五关迁移，不夹带怪物视觉实现。

2026-07-30 `TASK-ARCH-015` 已归档：新增纯逻辑 `LevelLifecycle` 作为所有后续关卡默认的通关、全员判负、幂等解锁和终态 owner，普通出口默认采用真实 bounds 重叠 + 对应上键，特殊关卡只能注入窄完成策略。Stage 1-1/1-2/1-3/2-1/2-2 首批迁移完成，原五套 `tryCompleteStageXX`/失败倒计时/解锁提交被删除；专项、全系统、build、structure、workflow、diff check 和 Stage 2-2 940×590 光门 + W 运行验收通过。功能线继续 Active，恢复 `GOAL-061 / TASK-SLICE-157B`。

2026-07-30 用户复验指出 Stage 1-1 通关仍显示黑框。代码确认 `TASK-ARCH-015` 只统一生命周期终态，五关结果 view 仍分别绘制现代全屏 Rectangle/Text，原版公共 `GameWin/GameFail` 未接入；登记并立即激活 `GOAL-065 / TASK-SLICE-161`，`GOAL-061` 暂回 Planned。

2026-07-30 `TASK-SLICE-161` 已归档：恢复 `OtherMat1.swf` character 330/313 的原版 GameWin/GameFail 根视觉、三个按钮三态与四个动态成绩字段，建立唯一 `LevelResultView` 并迁移 Stage 1-1/1-2/1-3/2-1/2-2；删除四个逐关 ResultBridge 及 1-1 私有黑框。专项、全系统、build、structure、annotations、workflow、diff check 与 940×590 成功/失败页零 console 通过。功能线继续 Active，恢复 `GOAL-061 / TASK-SLICE-157B`。

2026-07-31 `TASK-SLICE-157B` 已归档：Stage 1-2 Monster2/4/7/8 的 96 个本体独立视觉帧与九个攻击/效果对象 122 帧已接入 `stage-12` bundle，正式路径移除 Arc/Text 占位；Monster7 hit2 保持不可达，Monster8 hit2 复用四帧完成八 tick，Monster4 hit2 开场对象保持 disabled，Monster2 hit2 在 frame14 自移除。共享物理、战斗、奖励、门禁、`LevelLifecycle` 与 `LevelResultView` owner 未改；专项、全系统、build、structure、annotations、workflow、diff check 与 940×590 单/双人正式路径零 console 通过。功能线继续 Active，只激活 `TASK-SLICE-157C`。

2026-07-31 用户进一步确认“关卡类化”不能停在光门、生命周期或结果页局部抽取，而应治理所有关卡共同运行职责按关复制，并禁止关卡承载英雄/怪物动画、AI、伤害、物理和奖励内部规则。登记 `PG-013` 与同线 Split 父任务 `TASK-ARCH-016`，拆为 `TASK-ARCH-016A..D`：先审计合同，再以 Stage 1-2/1-3 试点、迁移 Stage 2，最后迁移 Stage 1-1/TestScene 并建立未来关卡模板。当前 `TASK-SLICE-157C` 保持唯一 Ready，不抢占 WIP。

2026-07-31 `TASK-SLICE-157C` 已归档：Stage 1-3 新增 Monster5 七动作 31 个本体帧与四对象 24 帧，hit3 保持四帧循环四次；Monster30/3/7/8 直接复用 157A/B 的 stable key、描述层和攻击对象 identity。Stage 1-3 正式路径移除 Arc/Text，占位死亡立即显门与剩余 60 个 Monster30 不阻塞胜利的既有合同保持不变；专项、全系统、build、structure、annotations、workflow、diff check 与 940×590 正式路径零 console 通过。功能线继续 Active，只激活 `TASK-SLICE-157D` 做五关 owner、Stage 2 防回归和父任务关闭。

2026-07-31 `TASK-SLICE-157D` 与父任务 `TASK-SLICE-157` 已归档：七种 Stage 1 怪物、16 个攻击对象及三套几何统一由 `stage-1-monsters` 唯一 bundle 持有，三关不再通过整关 bundle 相互依赖；Stage 1 `167/171`、Stage 2-1 `94/132`、Stage 2-2 `36/104` 帧合同、五关首次/重入加载与 visual bridge 无 Arc/Text 回填均由专项锁定。Stage 2-2 单人布局/火焰与双人 Monster16 hit4 在 940×590 下零 console，既有 Stage 1 A..C 与 Stage 2-1/2-2 逐状态证据继续作为视觉基准。功能线保持 Active，唯一 Ready 切换为 `TASK-SETTINGS-069`。

2026-07-31 `TASK-SETTINGS-069` 命中定义内拆分门禁：恢复资源分散在五角色本体包、`Role1Effect`、四个 `SpecialUI` 包与白龙独立武器包，不能作为一个可机械枚举目录族验收。父任务改为 `Split`，本次只落盘共享逐动作/逐对象矩阵、UI 显示列表与六段证据模板；逆向拆为 `069A..E`，实现拆为 `158A..E`，当前唯一 Ready 为 `TASK-SETTINGS-069A`，只调查 Role1。

2026-07-31 `TASK-SETTINGS-069A` 已归档：确认 `assets/WuKong.swf` 为本体/装备/影分身及主要攻击对象 owner，`Role1Effect.swf` 持有 `lyfb` 两对象，`SpecialUI/WuKong.swf` 只是字节相同副本；本体 24 层、影分身、四普攻与全部已实现技能的 Symbol/id、帧序、hold、注册点 bounds、触发和销毁合同均已落盘。首次 compact 后只用已收集证据收尾，未派生新资源或进入实现；功能线继续 Active，唯一 Ready 切换为 `TASK-SLICE-158A`。

2026-07-31 用户要求同时保留 Stage 1-1 光门缺失纹理的临时兼容修复，并将完整关卡类化提前到当前线最前；若最终框架覆盖临时路径，则由 `016D` 删除兼容借用。现将 `TASK-SLICE-158A` 退回 Planned，`TASK-ARCH-016A` 改为唯一 Ready，按 `016A → 016B → 016C → 016D → 158A` 串行；角色视觉证据不丢失，框架闭合后从 Role1 实现恢复。

2026-07-31 `TASK-ARCH-016A` 已归档：`playable-level-runtime.md` 冻结 `PlayableLevelRuntime / LevelDefinition / LevelWorldAdapter / LevelEncounter / TransferDoorVisualDefinition` 边界、五关逐职责 owner/消费者/显示列表/逐状态矩阵、016B→C→D 迁移顺序和 1-1 character 45/41/44 兼容删除条件。新增增量静态门禁并接入 `check:workflow`：当前遗留只允许显式清单，禁止新建同义 Scene/World/Gameplay/Flow/Result 骨架；本 task 未修改运行时代码，PG-013 仍为待治理。功能线继续 Active，只激活 `TASK-ARCH-016B`。

2026-07-31 `TASK-ARCH-016B` 已归档：新增公共 `PlayableLevelRuntime`、可校验 Definition 与带 provenance 的 `TransferDoorView`；Stage 1-2/1-3 的共同队伍/玩家/镜头/HUD/结果/保存/路由/销毁迁入 Runtime，门显隐与完成 attempt 迁入共享门组件。两关专属波次、Boss、怪物视觉与 1-2 `fbEnter` 仍由窄 adapter 持有；专项、全系统、构建、门禁与 940×590 正式存档进入均通过且零 console。功能线继续 Active，只激活 `TASK-ARCH-016C`。

2026-08-01 `TASK-ARCH-016C` 已归档：Stage 2-1/2-2 新增只读 Definition 并消费同一 `PlayableLevelRuntime` 与 `TransferDoorView`，Scene 私有玩家/HUD/结果/保存/路由/销毁 owner 已删除；冰刺、火焰、Monster16、Boss 展示和正式/QA 差异继续留在窄 adapter。新增 localhost 显式 `qaStage=2-1` 验收入口而不分叉正式 Runtime；专项、全系统、structure、build、架构门禁及 940×590 Stage 2-1 双人 QA、Stage 2-2 正式/双人门 QA 均通过且零 console。功能线继续 Active，只激活 `TASK-ARCH-016D`。

2026-08-01 `TASK-ARCH-016D` 与父任务 `TASK-ARCH-016` 已归档：Stage 1-1 新增 Definition 与窄 Runtime adapter，共同镜头、队伍/玩家、功能入口、结果、保存路由和销毁进入公共 owner；纵向爬升/Boss/技能宠物 sandbox 保留为遭遇差异。level11 character 45→41/44 已组合为 20 帧真门并由 `stage-11` 唯一持有，Stage 1-3 门借用及 `stage-1-common` 临时兼容删除。五关专项、全系统、build、structure、annotations、workflow、diff check 与 940×590 1P W、2P 上键、原版结果、下一关 Stage 1-2、横向 Stage 2-2 均通过且零 console。PG-013 转效果观察，功能线继续 Active，唯一 Ready 恢复 `TASK-SLICE-158A`。

2026-08-01 `TASK-SLICE-158A` 已归档：Role1 本体/装备/影分身 3 atlas、四普攻与 14 个技能 stable key/249 帧接入 `combat-common`；五关公共 Runtime 与 TestScene 共用 `Role1CombatVisualBridge`，Role1 projectile 在通用 ellipse/core/Text 前进入真 image 分支，死亡按原版无 Symbol 的移除合同。专项、全系统、build、structure、annotations、workflow、diff check、正式 940×590 单人/QA 双人路由与零 console 通过；功能线继续 Active，唯一 Ready 切换为 `TASK-SETTINGS-069B`。

2026-08-01 `TASK-SETTINGS-069B` 已归档：确认启动期 Role2 视觉唯一源为 `assets/TangSeng1.swf`，闭合 12 本体、8 装备、Shadow、两普攻与九个技能对象的 Symbol、帧数、几何、显示层级、触发和生命周期；`TangSeng.swf`/`SpecialUI/TangSeng.swf` 保留为动态换装路径而不与启动包混用。功能线继续 Active，唯一 Ready 切换为 `TASK-SLICE-158B`。
2026-08-01 `TASK-SLICE-158B` 首次上下文压缩触发规模门禁：Role2 本体/装备、HUD 肖像、两普攻、九技能对象、Shadow、场景桥与 QA 路由已接入，`test:role2-visuals`、`test:stage1-hud` 和 `build` 通过；未完成的双人视觉验收、全量门禁、标注与归档收束拆为唯一 Ready `TASK-SLICE-162`，不提前进入 Role3。
2026-08-01 `TASK-SLICE-158B / TASK-SLICE-162` 已归档：Role2 本体/装备、唐僧 HUD 头像、两普攻、九技能对象 464 帧与 Shadow atlas 全部由 `combat-common` 接入；修复 PNG 头像误走 SVG loader，并在最终动作审计补齐 `wait→wait2`、蓄力 `hit2` 与 Shadow 五行动作投影。专项/全系统/构建/工作流门禁及 940×590 单人、合法双人、P2 方向镜像零 console 通过。功能线继续 Active，唯一 Ready 切换为 `TASK-SETTINGS-069C`。

2026-08-02 `TASK-SETTINGS-069C` 已归档：确认 BaJie/SpecialUI 两包字节相同，闭合13本体、9装备、三普攻、九主动与盾/拉拽/移动/追踪对象的 Symbol、时间轴、注册 bounds、触发和生命周期；`Role3_hit11` 被纠正为音效而非独立视觉 Symbol。功能线继续 Active，唯一 Ready 切换为 `TASK-SLICE-158C`。

## 关闭与切线

关闭一条功能线时必须同时满足：

1. 详细覆盖台账中没有未解释缺口。
2. 所有关联未完成 task 已归档，且没有同线 `Ready` / `Blocked` / `Planned` task。
3. 真 UI、权威内容、正式可达流程、跨系统集成和验证证据满足该线合同。
4. 排除项已经由用户明确确认。
5. 总览填写具体关闭证据后才可把状态改为 `Done`。

关闭后才能把下一条 `Planned` 线改为 `Active`。切线必须同步更新本表、`task-board.md` 的当前推荐和治理所需的验证记录。

2026-08-16 `TASK-SETTINGS-175` 已归档：九个页面/宿主按证据等级完成审计。宠物 932、法宝 596 和地图态共享 host 是明确现代占位；技能、丹药、商城、设置、任务、建档/选角与战斗 host 是旧视觉审计到当前 machine-truth 的迁移债务。五个恢复源 SHA/locator、逐页 truthId/状态集/完整性要求、现代例外和实现生成条件已冻结；VS-054/055/059 保持降级措辞。功能线继续 Active，唯一 Ready 切换为 `TASK-SETTINGS-175A`，先闭合宠物页真值。

2026-08-16 `TASK-SETTINGS-175A` 已归档：恢复源 `pet1.swf` character 932 的 50 个根 child 与动态列表、头像、8 技能、tooltip、放生确认形成 74 对象/16 状态 `verified` 真值，940×590 基准、P1/P2、两页、selected、按钮态、洗练/进化和关闭均已闭合且 `unresolved=[]`。现代覆盖层仍待已生成的 `TASK-SLICE-180`（Planned）整改；功能线继续 Active，唯一 Ready 切换为 `TASK-SETTINGS-175B`。

2026-08-16 `TASK-SETTINGS-175B` 已归档：恢复源 `backpack1.swf` character 596 的 17 个根 child、九字段、灵魂条、26 法宝展示/说明标签与 character 200/34 动态确认形成 28 对象/21 状态 `verified` 真值，940×590 未装备/按钮态/灵魂成功与拒绝/普通和特殊确认/取消/重置/P2 无入口/关闭均已闭合且 `unresolved=[]`。现代覆盖层仍待已生成的 `TASK-SLICE-181`（Planned）整改；功能线继续 Active，唯一 Ready 切换为 `TASK-SETTINGS-175C`。

2026-08-16 `TASK-SETTINGS-175C` 已归档：恢复源 `OtherMat1.swf` 的 574/371/444 与精确 XML/SVG 显示列表交叉核对，生成 25 对象/42 状态 `task-settings-175c.stage-feature-host` verified 真值，闭合 P1/P2 五按钮四态、非对称门禁、371/444 设置/帮助和单页返回，`unresolved=[]`。原版无共享地图 chrome，当前暗层/标题/跨页/workshop/通用关闭被冻结为未批准差异，整改合同已生成为 `TASK-SLICE-182`（Planned）。功能线继续 Active，唯一 Ready 切换为 `TASK-SETTINGS-175D`。

2026-08-16 `TASK-SETTINGS-175D` 已归档：恢复源 `OtherMat1.swf` 的 250/868/417/213、五角色 selector、212 五行与 865 十树由 SWF PlaceObject 和本轮 FFDec 导出逐帧核对，生成 250 对象/32 状态 `task-settings-175d.skill-pages` verified 真值，闭合 50 图标三态、七类按钮、角色 selected、绑定 P1/P2、被动字段和返回，`unresolved=[]`。现代页面直接消费与逐状态运行回测合同已生成为 `TASK-SLICE-183`（Planned）；功能线继续 Active，唯一 Ready 切换为 `TASK-SETTINGS-175E`。

2026-08-16 `TASK-SETTINGS-175F` 已归档：恢复源 `backpack1.swf` 的 721/717/624 与 16 个按钮由本轮 FFDec SVG/PNG/button/XML 和商城 AS3 调用链交叉核对，生成 132 对象/31 状态 `task-settings-175f.shop-page` verified 真值，闭合 27 个根 child、九卡嵌套显示列表、动态商品图标、分类/分页/数量、确认/拒绝/成功、P1/P2 与返回，`unresolved=[]`。现代页面直接消费与逐状态运行回测合同已生成为 `TASK-SLICE-184`（Planned）；功能线继续 Active，唯一 Ready 切换为 `TASK-SETTINGS-175G`。

2026-08-16 `TASK-SETTINGS-175G` 已归档：恢复源 `StageCommon.swf` character 148 的 12 个根 child、134/133 全舞台 overlay、五组 146/145 和 144 四态由 FFDec XML/SVG 与设置 AS3 调用链交叉核对，生成 19 对象/23 状态 `task-settings-175g.settings-page` verified 真值，闭合四项全循环、默认音量死控件、关闭/重开与现代跨重启例外边界，`unresolved=[]`。现代页面 manifest 直连合同已生成为 `TASK-SLICE-185`（Planned）；功能线继续 Active，唯一 Ready 切换为 `TASK-SETTINGS-175H`。

2026-08-16 `TASK-SETTINGS-175H` 已归档：恢复源 `backpack1.swf` character 85 的 21 个根 child、五个 60、四个 73、31/78/83 四态和动态已领取/奖励 child 由 FFDec SVG、旧审计与任务 AS3 调用链交叉核对，生成 45 对象/28 状态 `task-settings-175h.task-page` verified 真值，闭合 daily/activity、selected、完成未领/已领、末页/空活动残留、P1/P2 与关闭/重开，`unresolved=[]`。现代页面 manifest 直连合同已生成为 `TASK-SLICE-186`（Planned）；功能线继续 Active，唯一 Ready 切换为 `TASK-SETTINGS-175I`。

2026-08-16 `TASK-SETTINGS-175I` 已归档：恢复源 `OtherMat1.swf` character 1149/901 与 `Common1.swf` 69/18 入口交叉核对，生成 20 对象/30 状态 `task-settings-175i.party-creation` verified 真值，闭合人数按钮与隐藏主菜单对象、五卡四态、空 895、P1/P2 marker/顺序、取消/完成/重载及原子建档流程映射，`unresolved=[]`。现代 view 直连合同生成为 `TASK-SLICE-187`（Planned）；175A..I 证据批次全部完成，功能线继续 Active，唯一 Ready 切换为 `TASK-SLICE-180`。

2026-08-16 `TASK-SLICE-180` 已归档：`FormalPetPageView` 直接消费 `task-settings-175a.pet-page` 的 74 对象/16 状态 verified 真值，接入 932 根、原列表/按钮/tooltip/放生确认、恢复源头像与技能图标，删除未经批准的现代深色覆盖、矩形卡片和现代按钮；owner、事务、存档、940×590 逐状态证据与零 console 回归通过。功能线继续 Active，唯一 Ready 切换为 `TASK-SLICE-181`。

2026-08-16 `TASK-SLICE-181` 已归档：`FormalMagicWeaponPageView` 直接消费 `task-settings-175b.magic-weapon-page` 的 28 对象/21 状态 verified 真值，投影 596 根、九字段、368/436/31 原按钮与 200/34 动态确认，删除现代暗层、矩形、Arial 标题/摘要和通用按钮；材料不足确认保留、owner、事务、当前存档、940×590 与零 console 回归通过。功能线继续 Active，唯一 Ready 切换为 `TASK-SLICE-182`。

2026-08-16 `TASK-SLICE-182` 已归档：`FeatureUiScene` 启动时直接断言 `task-settings-175c.stage-feature-host` 的 25 对象/42 状态 verified 真值与 `map-origin-no-shared-chrome=0`；地图暗层、金边、Arial 标题、跨页按钮、workshop 导航和通用关闭全部删除。地图服务与战斗五入口均直出当前页根，页面 session 只允许页内 owner 切换；地图不再注册战斗快捷键，战斗其他页快捷键不切页、同页键关闭，Escape 仍只进入 371 设置链。P1/P2、五关共享 owner、940×590 与零 console 回归通过；功能线继续 Active，唯一 Ready 切换为 `TASK-SLICE-183`。

2026-08-16 `TASK-SLICE-183` 已归档：`FormalSkillPageTruth` 运行断言并供 view 直接消费 `task-settings-175d.skill-pages` 的 250 对象/32 状态 verified 真值；四页根、十树、五行、五角色 selector、50 技能三态、七类按钮与动态字段全部按对象 ID/状态投影，`FormalSkillNativeLayout`、现代 owner 文字、现代 selected 样式和第二坐标表已删除。localhost 内存 fixture 与正式 Stage 1-2 HUD 闭合 P1/P2 主动/绑定、拖放/返回，被动与地图正式入口、owner/存档、940×590 差异和零 console 回归通过。功能线继续 Active，唯一 Ready 切换为 `TASK-SLICE-184`。

2026-08-16 `TASK-SLICE-184` 已归档：`FormalShopPageTruth` 运行导入并断言 `task-settings-175f.shop-page` 的 132 对象/31 状态 verified 真值，`ShopScene` 按对象 ID 读取分类、九卡、动态图标、字段、16 组按钮和 624 确认层 stage bounds；`CardColumns/CardRows` 与全部页面手写视觉坐标已删除。49 项商品、折扣、灵魂、库存、P1/P2 和当前存档 owner 未改；940×590 分类/分页/数量/确认/拒绝/返回/重开、同尺寸差异和 console 零 warning/error 通过。功能线继续 Active，唯一 Ready 切换为 `TASK-SLICE-185`。

2026-08-16 `TASK-SLICE-185` 已归档：`FormalSettingsPageTruth` 运行导入并断言 `task-settings-175g.settings-page` 的 19 对象/23 状态 verified 真值，`FormalSettingsOverlay` 按对象 ID 读取 148/134/133、五组 146/145、144 的 bounds/local matrix/text style；五行坐标、104×34.1 命中和关闭锚点的第二手写真值已删除。四项循环、死控件、全局 owner 与独立跨重启现代例外未改；940×590 的 19 组稳定运行差异、关闭/阻挡/重开/重载和 console 零 warning/error 通过。功能线继续 Active，唯一 Ready 切换为 `TASK-SLICE-186`。

2026-08-16 `TASK-SLICE-186` 已归档：新增 `FormalTaskPageTruth` 运行断言并直接消费 `task-settings-175h.task-page` 的 45 对象/28 状态 verified 真值；`TaskScene` 按对象 ID 投影页签、五行、动态已领取/奖励、文字、31/78/83 按钮与命中，删除 `TileY/AwardPositions`、字体/按钮锚点和现代反馈文字。首次 940×590 验收发现整帧 `root.svg` 回填动态 child，现由可重复生成的 `root-static.svg` 只保留原版静态 shape，空活动页五行已隐藏；43 定义、0..4 奖励、末页残留、P1/P2 经验 owner、即时保存/重载、关闭/重开与零 console 通过。功能线继续 Active，唯一 Ready 切换为 `TASK-SLICE-187`。

2026-08-17 `TASK-SLICE-187` 已归档：新增 `SavePartyCreationTruth` 运行导入并断言 `task-settings-175i.party-creation` 的 20 对象/30 状态 verified 真值；`SavePartyCreationView` 的人数按钮、五角色状态/命中和 P1/P2 marker 全部按对象 ID、state 与 bounds 投影，删除 `RoleImageX/RoleRegistrationX/RoleHitBounds`。视觉回测同时修正 175I 基准生成器的 GDI+ alpha 合成缺陷并重签 baseline SHA；1P/2P 全组合、取消、原子建槽、重载、940×590 对照与 console 零 warning/error 通过。功能线继续 Active，唯一 Ready 切换为最后一个已知 UI 缺口 `TASK-SLICE-188`（丹药页 manifest 直连）。

2026-08-17 `TASK-SLICE-188` 已归档并关闭 `LINE-CORE-PROGRESSION-COMPLETION`：新增 `FormalImmortalityPageTruth` 运行导入并断言 `task-settings-175e.immortality-page` 的 132 对象/26 状态 verified 真值；`ImmortalityScene` 的 990 根、25 个 969 格/服用态/已服用图、五 owner 投影、动态字段、989/968/973/997 按钮与 1006 弹层全部按对象 ID 与 bounds 派生，删除五组手写坐标表。丹药配方、事务、P1/P2、当前 schema 与路由未改；专项、全系统、build、940×590 原版基准对照和 console 零 warning/error 通过。当前线全部关闭检查满足，现激活 `LINE-STAGE-2-3 / TASK-SETTINGS-064` 为唯一 Active/Ready。

2026-08-17 用户在 Stage 2-3 开始前再次复验，指出装备悬停不显示数值、宠物缺少可见 UI 与真动画、五角色动作流畅度/视觉完整度不一，以及战斗中技能未在 UI 中可见。该运行反证优先于 180/183/158 等旧“页面或主体已闭合”结论；新建并激活 `LINE-PRE-STAGE-2-3-PRESENTATION`，唯一 Ready 切为 `TASK-SETTINGS-189`，`LINE-STAGE-2-3 / TASK-SETTINGS-064` 退回 Planned。宠物真动画与角色卡顿不预先归因为解包不全：分别由 `TASK-SETTINGS-193` 和 `TASK-SETTINGS-195` 审计恢复源、时间轴、帧时序/持帧、运行时 clock 与投影完整性后，再生成按资源族/受影响角色拆分的子 task。

2026-08-17 `TASK-SETTINGS-189` 已归档：恢复主包中的 `AttributeCon/ShowObj` 与旧提取脚本 SHA 一致，冻结 12 状态/32 对象、`unresolved=[]` 的 verified tooltip 真值，并把说明、类型和灵魂价值补入 164 件权威目录。消费者矩阵确认正式背包和强化/合成/分解/打造四条独立页面生命周期；商城时装原版禁用 hover，仅保留负向回归。原 190B 因命中拆分触发改为 Split 父任务，生成 190B1..B4；唯一 Ready 切换为 `TASK-SLICE-190A`。

2026-08-17 `TASK-SLICE-190A` 已归档：新增由 189 verified manifest 生成的运行真值投影、`EquipmentTooltipSystem/View` 和正式背包格/六个已穿戴槽 hover 接缝；直接消费当前 `EquipmentInstance` 的基值 override 与强化成长，无第二数值 owner。首轮视觉回测发现 189 生成器漏记名称后 `++i`，已依 `AttributeCon.as` 修正 25px 行距并重生 12 状态基准。P1/P2、随机/+3 实例、右翻/底夹、分页、移出、关闭重开与 fresh console 零 warning/error 通过；唯一 Ready 切换为 `TASK-SLICE-190B1`。

2026-08-17 `TASK-SLICE-190B1` 已归档：强化页共享右侧 5×5 grid 与 198 目标槽复用 190A 的 `EquipmentTooltipSystem/View`；只有装备格与目标槽绑定 hover，强化石、幸运符、神恩符继续排除。`_clj` 随机攻击 234 +3 在目标槽显示同一实例字段，1 级石失败降为 +2 后返回右 grid 并即时刷新；P1/P2、pointerout、关闭重开、940×590 与零 console 通过。未修改强化事务、数值或存档 schema；唯一 Ready 切换为 `TASK-SLICE-190B2`。

2026-08-17 `TASK-SLICE-190B2` 已归档：合成页共享右侧 5×5 grid、三材料槽、preview 与 produce 直接复用 189 tooltip。`CraftingSession` 成功态保存背包中真实 `InventoryEntry`，preview 以相同继承函数构建只读 `EquipmentInstance`，不复制属性或坐标；三件带 override/+3 的装备生成 `_dzj` preview 与成功实例均显示生命 770、魔法 583、攻击 156、防御 184、暴击 3%。P1/P2、移出、成功、关闭重开、940×590 与 fresh console 零 warning/error 通过；唯一 Ready 切换为 `TASK-SLICE-190B3`。

2026-08-17 `TASK-SLICE-190B3` 已归档：分解页共享右侧 5×5 grid 与 167 `material` 目标槽复用 189 tooltip，目标命中 bounds 直接来自 verified resolution manifest；六个 `resu` 结果只投影非装备材料图标，不绑定 tooltip。P1 随机攻击 234 +3 目标成功后面板销毁且灵魂 5000→4900；P2 0 灵魂拒绝保持同一目标实例，pointerout、返还、关闭重开均无残留。专项、全系统、build、940×590 与 fresh console 零 warning/error 通过；唯一 Ready 切换为 `TASK-SLICE-190B4`。

2026-08-17 `TASK-SLICE-190B4` 与 Split 父任务 `TASK-SLICE-190B` 已归档：打造页共享右侧 5×5 grid 继续 equipment-only hover，只有 167 verified `makeObj` 成功产物槽绑定当前 `EquipmentMakingSession.lastProduct`；制作书、需求材料、宝石和空/拒绝状态均不弹层。P1/P2 成功实例、0 灵魂拒绝、返回/C 重开、940×590 与 fresh console 通过；商城 49 项与 `AuthoritativeEquipmentCatalog` 零交集且 `ShopScene` 无 tooltip 接线，时装禁用 hover 负合同保持。VS-066 完成，唯一 Ready 切换为 `TASK-SETTINGS-191`。

2026-08-17 `TASK-SETTINGS-191` 已归档：按入口、owner、bundle、scene/layer、绘制和真值消费分层复核后，940×590 P1/P2 character 573 pointer 均可打开现有 932 页面且零 console；用户反证命中的精确缺口是原版 `RoleInfo` 动态 character 662 `ShowPetInfo` 未被现代 combat HUD 消费，当前只有 `petAvailable` 文字。新增 10 对象/10 状态 `task-settings-191.pet-combat-hud` verified 真值、P1/P2 基准、显示列表和 192A/192B 边界，`unresolved=[]`。功能线继续 Active，唯一 Ready 切换为 `TASK-SLICE-192A`，先固化非 QA 冷启动页面旅程和失败可观察性；不提前实现 192B HUD 或 193 动画。

2026-08-17 `TASK-SLICE-192A` 已归档：新增独立 `formal-pet-journey-tests.ts`，从当前 schema 双人冷启动槽串联地图五个 Runtime route、P1/P2 宠物入口、两页/selected、出战/休息、放生确认取消、关闭/重开与重载；入口 bundle、page-assets 和页面 render 失败统一发出 `feature-ui-failed` 结构化信号，不再静默 `false`。940×590 非 QA 双人槽经启动页→地图→Stage 1-1 的 P1/P2 页面、skill hover、事务、返回与整页重载复验通过，console warning/error 为 0；932 页面及真值投影没有可见改写。功能线继续 Active，唯一 Ready 切换为 `TASK-SLICE-192B`。

2026-08-17 `TASK-SLICE-192B` 已归档：从恢复 `pet1.swf` 选择性导出 character 662 的 605 shell、610/614 各 25 帧 HP/MP，并复用 175A 同源宠物头像；共享 `HeroPartyRuntimeBridge` 只读当前 P1/P2 roster，监听既有 `FormalPetsUpdatedEvent`，没有第二 pet owner。五关 HUD 删除 `petAvailable` 文字替代，按 191 verified 真值恢复 P1/P2 镜像、字段反转、满值/受击/0 HP、休息移除和再次出战重建。专项、bundle、五关旅程、全系统/build 与 940×590 双人正式运行零 console 通过；功能线继续 Active，唯一 Ready 切换为 `TASK-SETTINGS-193`。

2026-08-17 `TASK-SETTINGS-193` 已归档：直接扫描恢复 `pet1/20120203/20120808/mouse/StageCommon.swf` SymbolClass 与 SHA-256，把现代九物种 35 个实际形态、9 个本体族和 38 个技能视觉映射全部定位，未定位数为 0；几何本体与 projectile/字符串 key 仍明确为占位或未渲染。重复 SymbolClass 按 Aloader 补丁顺序冻结候选 owner 并保留 ApplicationDomain 反证条件。按物种生成 `193A..193R` 九组“verified 证据 → 真动画实现”串行 task，全部插入 194 前；唯一 Ready 切换为猴系证据 `TASK-SETTINGS-193A`。

2026-08-18 `TASK-SLICE-193B` 已归档：直接消费 193A 的 626 状态/20 对象 verified 真值，选择性接入四个猴系本体 atlas 和九个唯一对象序列；`combat-common` 唯一加载，Stage 1-1 与其余四关共享 `PetMonkeyAnimationView`，P1/P2 继续读取既有 roster/`PetRuntimeSystem`。monkey2/3 lj 双对象、xj 复用与 4 秒生命周期、jgaoyi 本体 hit5 均按真值投影，玩法伤害/冷却、AI、owner 和存档未改。专项、全系统、build、structure/annotations/workflow、940×590 双人正式运行与零 console 通过；唯一 Ready 切换为马系证据 `TASK-SETTINGS-193C`。

2026-08-18 `TASK-SETTINGS-193C` 已归档：`task-settings-193c.pet-horse-animation` 以 716 状态、20 显示对象与 716 个 SWF-derived 基准闭合 horse1..4 本体、普攻、sp/bd/bz/tmaoyi、共享冰效、hurt/dead、host clock、注册点/边界与销毁合同，`unresolved=[]`。加载时序确认 1..3 阶本体/普通对象选 `20120203.swf`，4 阶本体/奥义选 `pet1.swf`，共享冰效选 `StageCommon.swf`；奥义外层 1 帧下的 8 帧内嵌时间轴已单独冻结。未修改 `src`、玩法数值或现代 atlas；唯一 Ready 切换为马系实现 `TASK-SLICE-193D`。

2026-08-18 `TASK-SLICE-193D` 已归档：直接消费 193C 的 716 状态/20 对象 verified 真值，选择性接入四个马系本体 atlas 与 185 帧普攻/技能/奥义/共享冰效；`combat-common` 唯一加载，五关共享 `PetHorseAnimationView`，P1/P2 继续读取既有 roster/`PetRuntimeSystem`。host clock、注册点、sp/bd/bz、tmaoyi 本体 row8/8 subframes/30 帧爆炸和 60×80 冰效均由真值投影；玩法数值、AI、owner、存档未改。专项、全系统、build、structure/annotations/workflow/problem audit、940×590 双人正式运行与零 console 通过；唯一 Ready 切换为 UFO 证据 `TASK-SETTINGS-193E`。

2026-08-21 用户要求在当前 193E 前插入“重做宠物真值并实践到 UI”和“宠物基类”。现有 PG-017 已把错误实例精确定位为战斗 HUD character 657：旧 191 真值使用 42 帧联合 bounds，现代实现又用身体 atlas 代替头像。按逆向/实现必须分 task 的门禁，将第一项拆为 `TASK-SETTINGS-201 -> TASK-SLICE-202`；第二项按已冻结 `system-designs/pet.md` 落为 `TASK-ARCH-203` P1，只建立 `PetCombatRuntime/PetBehavior/Registry/Targeting` 与硬门禁，不越入 P2-P4 消费者迁移。唯一 Ready 改为 201，193E 暂回 Planned，完成 203 后恢复。

2026-08-24 `TASK-SETTINGS-201` 已归档：新增 `task-settings-201.pet-combat-hud-head` verified 真值，按 corpus + `PetInfo.transPetChinaName()` 的独立声明集执行 character 657 中文目标帧，闭合 35 fixture、70 个 P1/P2 投影、4 个无出战/休息负状态、35 个逐帧 SWF baseline 与 0 unresolved。每个目标帧递归到真实终端 shape，XML child/depth/matrix/twip bounds 与逐帧 SVG/PNG 交叉确认；灵猴确定为 frame 5 / character 619 / 46.75×40，反证旧 104.8×93.6 联合画布。191 仅机器标记动态 head subtree 被 201 取代，605/610/614 与文本静态范围保留；本 task 未修改 `src`。功能线继续 Active，唯一 Ready 切换为 `TASK-SLICE-202`。

2026-08-24 `TASK-SLICE-202` 已归档：新增直接导入 201 verified manifest 的 `PetCombatHudHeadAssets`，33 个唯一终端 child 覆盖 35 fixture，正式 HUD 按 frame/child/matrix/registration/visible bounds 投影并使用专属 bundle；删除宠物页/身体头像路径、`104.8×93.6` 拉伸和硬编码头像定位。关键字段变异、P1/P2、五关旅程、全系统/build 与 940×590 双人运行零 console 通过；九物种 baseline 与 runtime 资源像素差为 0。功能线继续 Active，唯一 Ready 切换为 `TASK-ARCH-203`。

2026-08-24 用户要求把后续宠物进化族的重复逆向/生成流程提炼为内部薄 Skill，并使用 Luna 降低高阶模型上下文和串行等待。`TASK-SETTINGS-193E/193G/193I/193K/193M/193O/193Q` 已补为视觉真值逆向任务，统一链接精细生成方案，并在各自成为唯一 Ready 后以 `$pet-family-reverse` 执行 `MO-001`：两个主工作包分别只读调查 AS3 行为链与恢复 SWF 真值，主 agent 单写归并，独立完整性审查计入既有验收批次。当前 203 的 Ready 和七族证据→实现串行顺序均不改变。

2026-08-24 `TASK-ARCH-203` 已归档：新增无 Phaser 依赖的 `PetCombatRuntime/PetBehavior/PetBehaviorRegistry/PetCombatTargeting`，固定同步出战宠物、跟随/warp、存活目标快照、Behavior 选择/执行、持续效果与销毁顺序；Registry 对重复/缺失映射显式拒绝，快照/事件只读，换宠/死亡与 destroy 幂等。`pet P1`、全系统、build、structure/workflow/problem audit 通过；`PetSystem.ts` 未修改，P2-P4/all 仍显式未完成。功能线继续 Active，唯一 Ready 恢复为 `TASK-SETTINGS-193E`。

2026-08-25 用户确认 203 的 P1 骨架不足以作为完整宠物基类，要求在继续逆向前先闭合全部公共 Runtime。按规模门禁将 `TASK-ARCH-204` 标为 Split，并生成连续 204A..F：三批具体 Behavior/35 形态 Registry、TestScene P1/P2、正式五关/功能页同步、旧入口清零与 `pet all=0`；唯一 Ready 改为 204A，193E 暂回 Planned。全部未来宠物族逆向 193E/G/I/K/M/O/Q 强制使用 `$pet-family-reverse` 并记录 `MO-001`，不允许退化为 planning dry-run。

2026-08-25 `TASK-ARCH-204A` 已归档：公共 Runtime 现在统一推进跟随、索敌、技能 cooldown 和每帧 Behavior 动作，并通过 `castSkill` 能力口调用既有技能/Projectile owner；新增 Monkey/Horse Behavior 与默认 Registry，覆盖 8 个当前形态和既有优先级/触发门禁。`pet P1/P1B`、全系统、build 与 structure 通过，`pet all` 只保留 204B..F 声明的消费者/旧入口缺口；唯一 Ready 切换为 204B。

2026-08-25 用户复核指出宠物公共类应先专项逆向原版 AS3 `BasePet` 的属性、继承、生命周期和具体类覆写，再据此裁决现代系统设计；现有 `pets-index.md` 只有基础行为边界，不能单独支撑继续扩展 `Behavior`。新增代码逆向 `TASK-SETTINGS-205` 为唯一 Ready，输出 `pet-base-class.md`、35 形态继承/覆写矩阵、架构无关行为合同和原版职责→现代 owner 审计；204B 暂回 Planned。205 完成后必须先生成同线现代设计调整/确认 task，不直接恢复旧方案。

2026-08-25 `TASK-SETTINGS-205` 已归档：`pet-base-class.md` 以 `[172845]` 可读主类与 `[25034429]` 混淆副本的 35/35 结构一致性闭合继承、字段/owner、构造/每帧、覆写、受击/死亡/销毁和 P1/P2/联机边界；当前 35 形态为 33 个直继承 `BasePet`、仅 `PetMouse2/3 -> PetMouse1`。现代审计确认 exact Registry/每 slot Runtime 方向可保留，但 nearest、全 roster CD、HP 归零立即卸载与原版冲突，Behavior 也缺受击/移动/动画命中/私有清理接缝。功能线继续 Active，唯一 Ready 切到 `TASK-ARCH-206`，先修订/确认唯一现代设计与硬 gate，再恢复或替换 204B；M-042/VS-067 状态不提升。

2026-08-25 `TASK-ARCH-206` 已归档：唯一 `pet.md` 保留 Runtime + Behavior + Registry + Targeting 组合，但冻结 ordered-first/1200 sticky target、动作选择后仅活动实例 CD、`alive -> dead-playing -> destroy`、typed animation/damage 事件以及普攻/受击/移动/动画命中/私有清理钩子；旧 P1/P1B 降级。硬 gate 的 P1/P1B/P1C/P1D/P2/P3/P4/all 均以退出码 1 形成精确实施基线，队列重排为 204B..G，唯一 Ready 为 204B；未修改 `src`，机制/切片状态不提升。

2026-08-25 `TASK-ARCH-204B` 的结构 gate 虽已通过，但用户正式运行看不到宠物自主攻击；代码定位确认 `PetCombatRuntime` 尚无 Scene/正式消费者，Monkey/Horse `basicAttack` 仅发事件，未形成动画→命中→伤害闭环。旧 204C..G 与 193E..R 横向分片全部撤销；唯一 Ready 改为 `TASK-SETTINGS-207`，先完整逆向 monkey1..4，再由 `TASK-SLICE-208` 完成正式 P1/P2 自主战斗。现有 `$pet-family-reverse` 降为未验证草案，只有完整猴系通过后才用 `$skill-creator` 重写，并以第二家族验证；方法样本归 `MO-003`。

2026-08-26 `TASK-SETTINGS-207` 完成：`task-settings-207.pet-monkey-family` 以 41 项同集合同闭合 BasePet 共享 AI/时钟、四形态全部技能与伤害、三套原始碰撞、视觉真值引用、P1/P2 owner/lifecycle 和现代消费者反证，`unresolved=[]`。唯一 Ready 切换为 `TASK-SLICE-208`；Skill 仍保持未验证草案。

2026-08-26 `TASK-SLICE-208` 完成：正式公共桥现为 P1/P2 各持有一个 `PetCombatRuntime`，monkey1..4 的真普攻/全部技能/动画命中/伤害/死亡与换宠生命周期在 TestScene 和正式关卡同源，`pet P1R=0`；940×590 双人正式运行与零 console 通过。`$pet-family-reverse` 已按完整猴系复盘重写为“单家族已证明、第二家族待验证”，唯一 Ready 切换为马系完整证据 `TASK-SETTINGS-209`。

2026-08-26 用户再次正式运行反证：猴系会在攻击距离外原地播放攻击效果，不追击且不命中。207 manifest 与原版 BasePet 已有 `attackRange`/追击事实，缺口在 208 的 Runtime 语义消费和同源测试/P1R 自证。208 保留为已执行历史 task，但“完整家族/P1R=0/Skill 首例成功”的现行结论撤销，P1R 降为 1；PG-017 V2 Ready 抢占 209，MO-003 转修订中。治理项先落地行为合同运行时 verifier，再生成猴系整改 task，重新闭合后才恢复马系。

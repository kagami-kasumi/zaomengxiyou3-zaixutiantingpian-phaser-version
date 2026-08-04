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
| LINE-PRE-STAGE-2-3-COMPLETION | Active | 在继续 Stage 2-3 逆向前，先闭合原版 1.1 可入包资源全集与正式背包基础，再补齐天庭地图四个服务入口、关卡内五个功能入口、已完成关卡全部小怪真动画、通用关卡生命周期/可玩运行框架、五角色战斗 UI/技能动画，并以既有本地六槽存档完成正式旅程回归 | TASK-SLICE-165D | `feature-line-coverage/LINE-PRE-STAGE-2-3-COMPLETION.md` | 166D 已按用户澄清保留外框、去内框并校正经验文字与页码；仅余炼丹炉右栏整改 | 完成 165D 后重新运行全线关闭检查 |
| LINE-STAGE-2-3 | Planned | 按 Stage 2 内容扩展路线顺延：先逆向 Stage 2-3 真场景、专属流程、怪物/机关与结果保存，再由证据拆分可玩实现范围 | TASK-SETTINGS-064（Planned） | `feature-line-coverage/LINE-STAGE-2-3.md` | 等待本次用户明确要求的前置整改关闭 | 前置线重新关闭后恢复 TASK-SETTINGS-064 |
| LINE-MONSTER-ARCH | Planned | 重构怪物与关卡组织：关卡负责遭遇编排，怪物定义/运行时/AI/物理/战斗/视觉/奖励各有明确 owner，以组合策略替代深继承并消除双运行时登记 | TASK-ARCH-010A（Planned） | `feature-line-coverage/LINE-MONSTER-ARCH.md` | 等待当前 `LINE-STAGE-2-3` 关闭后获得 WIP | 尚未实施；设计合同与两阶段迁移任务已登记 |
| LINE-SHARED-UI-COMPONENTS | Planned | 治理灵魂余额、原生按钮/关闭生命周期和背包/物品展示的共享组件边界，分批迁移已知消费者且保留各页原生 Symbol、几何、皮肤与流程 | TASK-ARCH-014A（Planned） | `feature-line-coverage/LINE-SHARED-UI-COMPONENTS.md` | 等待当前 Active 线关闭或用户重新调度；不得以组件化名义抢占 WIP | `PG-011`、Split 父任务与六个独立 Goal 已登记，尚未开始存量审计或迁移 |

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

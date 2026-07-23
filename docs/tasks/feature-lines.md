# 功能条线台账

本文是完整玩家系统范围、激活状态和关闭证据的权威入口。功能条线是对用户作出的完整交付承诺；`goal-board.md` 的 Goal 是一次 `/goal` 的交接边界；task 是最小验收单位；纵向切片只提供阶段验证。Goal/task/切片都不能单独证明条线完成。

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
| LINE-FORMAL-GAME-LOOP | Done | 在继续批量复现关卡前，用现有 Stage 1 三关闭合可通关战斗、核心 HUD、启动存档、天庭地图与完整功能 UI | — | `feature-line-coverage/LINE-FORMAL-GAME-LOOP.md` | 无 | 端到端旅程保持；工坊原 119 容器透明命中、四操作居中、原图返回和 P1/P2 样式经专项/全门禁/940×590 复验闭合 |
| LINE-STAGE-2-1 | Done | 正式游戏主循环关闭后恢复：先逆向 Stage 2-1，再由证据决定可玩实现范围 | — | `feature-line-coverage/LINE-STAGE-2-1.md` | 无 | 真场景/五停点/53 怪/38 冰刺/Boss 门/2-2 保存、四怪 94 帧与七攻击对象 132 帧、1P/2P 逐状态和零 console 全部闭合 |
| LINE-UI-NATIVE-SKILLS | Done | 将技能总页、主动页、绑定页和被动页重做为直接复用原图片中文字、按钮、状态和布局的原生化 UI，保留既有技能业务与双 owner/存档 | — | `feature-line-coverage/LINE-UI-NATIVE-SKILLS.md` | 无 | 250/868/417/213、按钮三态、角色 selected、技能三态、五键槽、五被动行、动态字段、P1/P2、V4 与 940×590 正式流程闭合 |
| LINE-STAGE-2-2 | Active | 按 Stage 2 内容扩展路线顺延：先逆向 Stage 2-2 真场景、专属流程、怪物/机关与结果保存，再由证据拆分可玩实现范围 | TASK-SLICE-150 | `feature-line-coverage/LINE-STAGE-2-2.md` | 无 | 六段证据与 14 条真资源已闭合；待完成 1P/2P 五停点、54 怪、9 火焰、Monster16、结果与 2-3 保存运行闭环 |

## 当前功能线状态

`LINE-STAGE-2-1` 已关闭：`TASK-SLICE-145` 闭合行为/流程，`TASK-SETTINGS-062` 闭合真视觉证据，`TASK-SLICE-146` 接入 4 个 atlas、132 个攻击帧、100/130 碰撞高、左右镜像、精确触发 tick、死亡播完销毁并完成 940×590 1P/2P 逐状态与最终门复验；新标签页 console 无 warning/error。

`LINE-UI-NATIVE-SKILLS` 已关闭：`TASK-SETTINGS-061` 闭合四页显示列表、原版视觉基准、按钮/命中区和动态槽位；`TASK-SLICE-143` 派生并接入 220 个原生 base/按钮/帧资源，移除替代覆盖层，完成学习、升级、绑定、被动、P1/P2、关闭、重载和 V4 回归。

`GOAL-020` / `TASK-SETTINGS-063` 已闭合 Stage 2-2：`sl22`/character 64、两层场景、背景/地面、3+1 墙、3 平台、5 停点、25 刷怪点、五批 54 怪、9 个 130 帧火焰、Monster16 八动作/六攻击、Boss 显门和胜利保存 2-3 均达到确认或交叉确认；影响实现的原版未知为零。当前激活 `GOAL-021` / `TASK-SLICE-150`，下一次 `/goal` 只执行同线真资源接入、可玩闭环和运行校准。

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

## 关闭与切线

关闭一条功能线时必须同时满足：

1. 详细覆盖台账中没有未解释缺口。
2. 所有关联未完成 task 已归档，且没有同线 `Ready` / `Blocked` / `Planned` task。
3. 真 UI、权威内容、正式可达流程、跨系统集成和验证证据满足该线合同。
4. 排除项已经由用户明确确认。
5. 总览填写具体关闭证据后才可把状态改为 `Done`。

关闭后才能把下一条 `Planned` 线改为 `Active`。切线必须同步更新本表、`task-board.md` 的当前推荐和治理所需的验证记录。

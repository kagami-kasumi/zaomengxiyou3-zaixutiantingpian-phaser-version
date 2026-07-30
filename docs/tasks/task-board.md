# 游戏任务看板

本文只记录未完成的游戏复现 task。完整系统范围和激活状态以 `docs/tasks/feature-lines.md` 为准；一次 `/goal` 的边界以 `docs/tasks/goal-board.md` 为准；task 是最小验收单位。完成 task 或 Goal 都不等于完成功能条线。

## 当前推荐

`TASK-SLICE-157B` 是唯一当前推荐，属于唯一 Active Goal 和唯一 Active 功能线。通用关卡生命周期协议已经归档，现恢复 Stage 1-2 怪物真动画工作。

## 待完成任务

| Task | 状态 | Goal | 功能条线 | 类型 | 目标 | 目标机制/切片 | 输出 | 下一步 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| TASK-SETTINGS-069 | Planned | GOAL-040 | LINE-PRE-STAGE-2-3-COMPLETION | 角色/技能视觉逆向 | 盘清五角色本体、战斗 UI、普攻、技能与附属对象真动画缺口 | M-018..M-025、M-034、M-035、M-047、M-049、VS-062 | 逐角色逐技能全集矩阵、资源标注与逐角色实现 Goal | 拆分 TASK-SLICE-158 |
| TASK-SLICE-157 | Split | — | LINE-PRE-STAGE-2-3-COMPLETION | 既有关卡怪物动画父任务 | Stage 1-1/1-2/1-3 逐关接入全部怪物/攻击对象真动画，回归 Stage 2-1/2-2 | M-030、M-034、M-035、VS-061 | 由 TASK-SETTINGS-068 生成的逐关子 task | 全部子 task 完成后收束父任务 |
| TASK-SLICE-157B | Ready | GOAL-061 | LINE-PRE-STAGE-2-3-COMPLETION | Stage 1-2 怪物真动画 | 接入 Monster7/8/4/2 全部可达动作与八个攻击/效果对象 | M-030、M-034、M-035、VS-061 | 逐怪动画、双 Boss、对象生命周期与逐状态证据 | TASK-SLICE-157C |
| TASK-SLICE-157C | Planned | GOAL-062 | LINE-PRE-STAGE-2-3-COMPLETION | Stage 1-3 怪物真动画 | 接入 Monster5 并复用 30/3/7/8，闭合 105 怪视觉 | M-030、M-034、M-035、VS-061 | Monster5/四对象、共享复用、门禁与逐状态证据 | TASK-SLICE-157D |
| TASK-SLICE-157D | Planned | GOAL-063 | LINE-PRE-STAGE-2-3-COMPLETION | 五关怪物视觉回归 | 收敛五关资源 owner，回归 Stage 2-1/2-2 并关闭父任务 | M-030、M-034、M-035、VS-061 | 五关自动/运行证据、bundle 防回归与父任务归档 | TASK-SETTINGS-069 |
| TASK-SLICE-158 | Split | — | LINE-PRE-STAGE-2-3-COMPLETION | 五角色动画父任务 | 逐角色接入本体、战斗 UI、普攻、技能及附属对象真动画 | M-018..M-025、M-034、M-035、M-047、M-049、VS-062 | 由 TASK-SETTINGS-069 生成的逐角色子 task | 全部子 task 完成后收束父任务 |
| TASK-SLICE-159 | Planned | GOAL-041 | LINE-PRE-STAGE-2-3-COMPLETION | 本地存档正式旅程 | 复用既有六槽 localStorage/V6，验证所有新增功能跨重启持久化并关闭前置线 | M-044、M-050、VS-052、VS-063 | 自动旅程、940×590 重启读取证据与关闭检查 | 恢复 GOAL-025 / TASK-SETTINGS-064 |
| TASK-SETTINGS-064 | Planned | GOAL-025 | LINE-STAGE-2-3 | 关卡/玩法逆向 | 闭合 Stage 2-3 真场景、流程、怪物/机关、结果与存档六段证据 | M-026、M-027、M-030、M-035、M-044、VS-057 | 权威证据矩阵、资源标注、未知/反证与有界实现 Goal | 依据证据生成同线最小实现 Goal |
| TASK-ARCH-010A | Planned | GOAL-026 | LINE-MONSTER-ARCH | 现代怪物架构 | 建立组合式怪物定义、运行状态、Targeting/Brain 接缝并抽离关卡命名的通用 owner | M-030、VS-005、VS-006 | 通用合同、定义目录、策略入口、兼容 facade 与确定性回归 | TASK-ARCH-010B |
| TASK-ARCH-010B | Planned | GOAL-027 | LINE-MONSTER-ARCH | 怪物生命周期治理 | 建立唯一怪物运行时注册表并在普通怪+Boss 正式关卡试点 | M-030、VS-007、VS-056 | 注册表、Flow/bridge 所有权收敛、试点关卡回归与后续迁移清单 | 依据试点生成同线逐关卡迁移 task |
| TASK-ARCH-014 | Split | — | LINE-SHARED-UI-COMPONENTS | 共享 UI 组件化父任务 | 分组件族审计、建立、试点并迁移灵魂余额、原生按钮/关闭和背包/物品展示 | M-035、M-037、M-052、VS-059、VS-064 | TASK-ARCH-014A..F 的独立合同、实现、迁移与回归结果 | 全部子 task 完成后收束父任务与 PG-011 |
| TASK-ARCH-014A | Planned | GOAL-051 | LINE-SHARED-UI-COMPONENTS | 共享 UI 组件化审计 | 冻结组件分层、消费者迁移矩阵、页面保留项、资源 provenance 与防复发门禁 | M-035、M-037、M-052、VS-059、VS-064 | 组件目录、owner/消费者矩阵、ADR/边界文档与静态校验 | TASK-ARCH-014B |
| TASK-ARCH-014B | Planned | GOAL-052 | LINE-SHARED-UI-COMPONENTS | 灵魂余额组件化 | 收敛共享 SoulBalance 组件并迁移全部已知灵魂消费页面 | M-035、M-044、M-052、VS-059 | 唯一视图投影、透明资产/字形门禁、P1/P2 与跨页面回归 | TASK-ARCH-014C |
| TASK-ARCH-014C | Planned | GOAL-053 | LINE-SHARED-UI-COMPONENTS | 原生按钮/关闭组件化 | 共享按钮状态、命中和关闭生命周期，同时保留页面原生皮肤与几何 | M-035、M-052、VS-059 | 组件合同、代表性 overlay/整页试点、Escape/销毁回归 | TASK-ARCH-014D |
| TASK-ARCH-014D | Planned | GOAL-054 | LINE-SHARED-UI-COMPONENTS | 背包基础组件化 | 建立 item cell/grid/分页/selected/tooltip 的无页面业务基础组件 | M-035、M-037、M-052、VS-064 | 背包视图基础组件、只读 view-model 接缝与确定性测试 | TASK-ARCH-014E |
| TASK-ARCH-014E | Planned | GOAL-055 | LINE-SHARED-UI-COMPONENTS | 正式背包组件迁移 | 以正式背包页试点基础组件，保持 431 身份、真图标、双 owner 与 V6 行为 | M-035、M-037、M-044、M-052、VS-064 | 正式背包迁移、逐状态视觉证据与全量目录/事务回归 | TASK-ARCH-014F |
| TASK-ARCH-014F | Planned | GOAL-056 | LINE-SHARED-UI-COMPONENTS | 嵌入式物品组件迁移 | 按矩阵迁移炼丹炉、商城、任务奖励等消费者并闭合跨页面回归 | M-035、M-037、M-044、M-046、M-052、VS-059、VS-064 | 消费者迁移结果、静态防回填、正式旅程与 PG-011 关闭审计 | 收束 TASK-ARCH-014 与 LINE-SHARED-UI-COMPONENTS |

## 任务完成定义

### TASK-SETTINGS-069

任务类型：

- `TASK-SETTINGS`

功能条线：

- `LINE-PRE-STAGE-2-3-COMPLETION`（Planned）

Goal 包：

- `GOAL-040`（Planned）

目标机制/切片：

- `M-018..M-025`、`M-034`、`M-035`、`M-047`、`M-049`、`VS-062`

规模预算：

- 主工作包：2
- 预计上下文压缩：0
- 独立验收批次：2

拆分触发：

- 若五角色资源不属于一个可机械枚举的目录族，立即按角色拆成 `TASK-SETTINGS-069A..E`；当前 Goal 只建立共享字段与覆盖模板。

输入资料：

- `reverse-engineering-protocol.md`、角色/技能/弹体/普攻资源索引、正式 HUD 索引、恢复角色与技能源 SWF、Role1..5 及实际附属对象 AS3。

输出产物：

- 五角色逐动作、逐技能、逐附属对象的 Symbol/帧/原点/朝向/触发/命中/消散矩阵；明确“角色上 UI”对应 HUD/头顶状态/技能槽的原版显示清单；拆分 `TASK-SLICE-158`。

完成定义：

- 行为已实现与视觉已完成分开记录；Role1 已接资源逐项复核，其余四角色不得凭逻辑测试宣称动画完成。

UI 原生化合同：

- 显示列表清单：角色战斗 UI/头顶动态层、HUD 槽与状态对象的父子、depth、矩阵、文字、按钮/动态图层和命中区。
- 原版视觉基准：五角色单人，至少一个合法双人组合，普攻与每个已实现技能的关键状态帧。
- 允许的现代视觉例外：空清单；证据缺失项保持阻塞，除非用户另行批准。
- 逐状态验收：idle/run/jump/attack/hit/death、技能起手/持续/命中/结束、朝向、P1/P2 与 HUD 更新。
- 差异证据：关键帧并排/叠图、对象/帧序/原点差异和容差。

验收标准：

- 恢复源与 AS3 交叉确认；`check:annotations`、`check:workflow`、`git diff --check` 通过。

禁止范围：

- 不一次实现五角色，不以占位 projectile 或状态文字替代真动画，不扩大到宠物动画。

状态更新：

- 更新角色机制、M-034/M-035/M-047/M-049、VS-062、本线覆盖、资源标注、Goal/task/history 与适用 PG 反馈。

推荐后续任务：

- 执行 `TASK-SLICE-158` 拆出的第一个逐角色实现 task。

### TASK-SLICE-157

任务类型：

- `TASK-SLICE`（Split 父任务，不直接执行）

功能条线：

- `LINE-PRE-STAGE-2-3-COMPLETION`（Active）

Goal 包：

- 无；子 task 由 `TASK-SETTINGS-068` 绑定独立 Goal。

目标机制/切片：

- `M-030`、`M-034`、`M-035`、`VS-061`

规模预算：

- 主工作包：0；父任务只聚合子任务
- 预计上下文压缩：0
- 独立验收批次：0

拆分触发：

- 固定拆为 `157A` Stage 1-1、`157B` Stage 1-2、`157C` Stage 1-3、`157D` 五关共享 owner/Stage 2 防回归；任一子 task 触发自身拆分门禁时继续拆。

输入资料：

- `TASK-SETTINGS-068` 的逐关逐怪真动画矩阵。

输出产物：

- 逐关资源接入/校准子 task 与 Stage 2-1/2-2 防回归批次。

完成定义：

- 全部子 task 归档，五个已完成关卡的实际怪物/攻击对象视觉全集无占位缺口。

验收标准：

- 逐关专项、全系统、build、annotations 与 940×590 逐状态证据通过。

禁止范围：

- 不进入 Stage 2-3，不以代表性怪物收束父任务。

状态更新：

- 更新 M-030/M-034、VS-061、本线覆盖并归档父任务。

推荐后续任务：

- 当前执行 `TASK-SLICE-157A`；全部子 task 完成后收束父任务。

### TASK-SLICE-157B

任务类型：

- `TASK-SLICE`

功能条线：

- `LINE-PRE-STAGE-2-3-COMPLETION`（Active；前序完成后）

Goal 包：

- `GOAL-061`（Active）

目标机制/切片：

- `M-030`、`M-034`、`M-035`、`VS-061`

规模预算：

- 主工作包：2
- 预计上下文压缩：0
- 独立验收批次：2

拆分触发：

- 若 Monster7/8 普通怪与 Monster4/2 双 Boss 不能复用同一动画描述/bridge，或任一攻击对象需要新的运行时 owner，则按普通怪与双 Boss 拆为连续同线 Goal。

输入资料：

- `stage1-monster-visuals-index.md`、Stage 1 标注/几何、本关 flow/combat/scene/asset owner、157A 的共享动画描述。

输出产物：

- Monster7/8/4/2 全动作与 8 个攻击/效果对象真资源、Stage 1-2 桥接、双 Boss 与对象生命周期逐状态证据。

完成定义：

- 五批 46 怪正式路径只使用对应真本体/对象；Monster7 hit2 不可达分支不伪造，Monster4 hit2 的 disabled 开场视觉与 Monster2 hit2 frame14 自移除按合同复现。

视觉验收合同：

- 原版基准：恢复源 96 个本体独立视觉帧、8 个对象 122 帧、精确注册/触发/碰撞表。
- 允许的现代视觉例外：空清单。
- 逐状态验收：四怪全部可达动作、左右、对象完整生命周期、双 Boss 同屏与显门。
- 差异证据：940×590 单/双人关键帧、对象差异清单和零 console。

验收标准：

- 实现前 `check:structure`；逐怪专项、五批/双 Boss 回归、全系统、build、annotations、workflow、diff check 与 940×590。

禁止范围：

- 不修改双 Boss 门禁或战斗数值，不进入 Stage 1-3/角色动画。

状态更新：

- 更新 M-030/M-034、VS-061、本线覆盖、标注状态、Goal/task/history 与适用 PG 反馈。

推荐后续任务：

- `TASK-SLICE-157C`。

### TASK-SLICE-157C

任务类型：

- `TASK-SLICE`

功能条线：

- `LINE-PRE-STAGE-2-3-COMPLETION`（Active；前序完成后）

Goal 包：

- `GOAL-062`（Planned）

目标机制/切片：

- `M-030`、`M-034`、`M-035`、`VS-061`

规模预算：

- 主工作包：2
- 预计上下文压缩：0
- 独立验收批次：2

拆分触发：

- 若 Monster5/四攻击对象接入与 30/3/7/8 复用校准形成两个独立运行旅程，先只完成 Monster5/Boss，再生成同线共享怪物校准 Goal。

输入资料：

- `stage1-monster-visuals-index.md`、Stage 1 标注/几何、Stage 1-3 flow/combat/scene/asset owner、157A/B 的共享资源。

输出产物：

- Monster5 七动作/四对象真资源，Monster30/3/7/8 正式复用，105 怪逐批视觉与 Boss 显门证据。

完成定义：

- Stage 1-3 五种实际怪物全部使用真视觉；Monster5 hit3 的 4 帧×4 循环、Monster30 透明 hit1 本体/10 帧对象、Boss 死亡时小怪仍在的显门合同均可观察。

视觉验收合同：

- 原版基准：Monster5 31 个独立视觉帧、4 个对象 24 帧及已接共享怪物基准。
- 允许的现代视觉例外：空清单。
- 逐状态验收：Monster5 全动作/对象、共享四怪代表状态、五批 105 怪、左右与门。
- 差异证据：940×590 单/双人关键帧、复用 identity、对象/帧序差异和零 console。

验收标准：

- 实现前 `check:structure`；Monster5/共享复用专项、105 怪/显门回归、全系统、build、annotations、workflow、diff check 与 940×590。

禁止范围：

- 不要求清完 60 个 Monster30 才显门，不进入 Stage 2 或角色动画。

状态更新：

- 更新 M-030/M-034、VS-061、本线覆盖、标注状态、Goal/task/history 与适用 PG 反馈。

推荐后续任务：

- `TASK-SLICE-157D`。

### TASK-SLICE-157D

任务类型：

- `TASK-SLICE`

功能条线：

- `LINE-PRE-STAGE-2-3-COMPLETION`（Active；前序完成后）

Goal 包：

- `GOAL-063`（Planned）

目标机制/切片：

- `M-030`、`M-034`、`M-035`、`VS-061`

规模预算：

- 主工作包：1
- 预计上下文压缩：0
- 独立验收批次：2

拆分触发：

- 若回归发现 Stage 2 真资源、bundle owner 或运行表现已实际损坏，立即只生成同线窄修复 Goal；不得在本纯回归包内扩大重构。

输入资料：

- 157A..C 完成产物、`stage1-monster-visuals-index.md`、`stage21-monster-visuals-index.md`、`asset-annotation/batches/stage22.md`、五关场景/bundle/旅程测试。

输出产物：

- 五关唯一资源 owner 审计、Stage 2-1/2-2 防回归、五关 940×590 证据、VS-061 与父任务 157 关闭记录。

完成定义：

- 五个已完成关卡的全部实际怪物/攻击对象均无 Arc/Text/单帧占位或重复资源 owner；Stage 2 的 94/132 与 36/104 帧合同不回归，父任务 157 才可归档。

视觉验收合同：

- 原版基准：三关 Stage 1 本索引与 Stage 2 两套既有视觉索引/审计。
- 允许的现代视觉例外：空清单。
- 逐状态验收：五关代表普通怪/Boss/攻击对象、左右、P1/P2、重入/退出。
- 差异证据：五关 940×590 证据清单、stable key/texture owner 审计和零 console。

验收标准：

- 五关确定性旅程、全系统、structure、build、annotations、workflow、diff check；五关 940×590 单/双人/重入证据。

禁止范围：

- 不新增资源或玩法，不进入五角色动画，不以父任务关闭推断整条功能线完成。

状态更新：

- 归档 TASK-SLICE-157A..D 与父任务 157，更新 M-030/M-034/M-035、VS-061、本线覆盖、Goal/task/history 和适用 PG；通用生命周期已先行归档，随后只激活 `GOAL-040 / TASK-SETTINGS-069`。

推荐后续任务：

- `TASK-SETTINGS-069`。

### TASK-SLICE-158

任务类型：

- `TASK-SLICE`（Split 父任务，不直接执行）

功能条线：

- `LINE-PRE-STAGE-2-3-COMPLETION`（Active）

Goal 包：

- 无；子 task 由 `TASK-SETTINGS-069` 绑定独立 Goal。

目标机制/切片：

- `M-018..M-025`、`M-034`、`M-035`、`M-047`、`M-049`、`VS-062`

规模预算：

- 主工作包：0；父任务只聚合子任务
- 预计上下文压缩：0
- 独立验收批次：0

拆分触发：

- 固定按角色或独立资源族拆分；禁止恢复为五角色一次接入。

输入资料：

- `TASK-SETTINGS-069` 的逐角色逐技能资源与时序矩阵。

输出产物：

- 五角色实现/校准子 task、共享动画 owner 回归和父任务收束记录。

完成定义：

- 全部子 task 归档，五角色本体、战斗 UI、普攻、已实现技能及附属对象真动画全集无未解释缺口。

UI 原生化合同：

- 显示列表清单：子 task 继承对应角色战斗 UI、HUD 动态层与技能对象清单。
- 原版视觉基准：五角色与合法双人组合的 940×590 动作/技能关键帧。
- 允许的现代视觉例外：空清单，除非用户另行批准。
- 逐状态验收：本体动作、技能全生命周期、朝向、P1/P2 与 HUD 状态。
- 差异证据：逐角色关键帧并排/叠图和帧序/原点/对象差异。

验收标准：

- 子 task 各自通过专项、全系统、build、annotations 与逐技能运行视觉门禁。

禁止范围：

- 不用占位 projectile、状态文字或单帧代替动画，不扩到宠物视觉。

状态更新：

- 更新角色机制、VS-062、本线覆盖并归档父任务。

推荐后续任务：

- 由 `TASK-SETTINGS-069` 选择首个逐角色子 task。

### TASK-SLICE-159

任务类型：

- `TASK-SLICE`

功能条线：

- `LINE-PRE-STAGE-2-3-COMPLETION`（Planned）

Goal 包：

- `GOAL-041`（Planned；必须在四个 Split 父任务及其全部子 task 归档后才可激活）

目标机制/切片：

- `M-044`、`M-050`、`VS-052`、`VS-063`

规模预算：

- 主工作包：2
- 预计上下文压缩：0
- 独立验收批次：2

拆分触发：

- 若新增页面确实需要 V7 schema，先拆独立迁移 Goal；本任务不得同时做 schema 迁移与完整浏览器旅程。

输入资料：

- `SaveSystem.ts`、六槽/party/功能存档测试、四个父任务的最终产物与本线覆盖台账。

输出产物：

- 自动正式旅程与 940×590 浏览器证据：新建/继续、四地图页、关卡五入口、P1/P2 事务、关卡进度、关闭应用后重开读取、损坏槽保护。

完成定义：

- 复用浏览器 `localStorage` 的六槽 V6；所有应持久字段跨重启保持，动画临时状态/冷却不入档；无新增重复存档 owner。
- 本线关闭检查全部满足后关闭本线并恢复 `LINE-STAGE-2-3 / GOAL-025 / TASK-SETTINGS-064`。

验收标准：

- 专项、全系统、structure、build、annotations、workflow、diff check 与 940×590 重启读取旅程通过，console 无 warning/error。

禁止范围：

- 不把云存档、文件导出或服务端账号系统加入“本地存档”范围，不进入 Stage 2-3 逆向。

状态更新：

- 更新 M-044/M-050、VS-063、本线/Stage 2-3 状态、Goal/task/history 与适用 PG 反馈。

推荐后续任务：

- 恢复 `TASK-SETTINGS-064`。

### TASK-SETTINGS-064

任务类型：

- `TASK-SETTINGS`

功能条线：

- `LINE-STAGE-2-3`（Planned；等待前置体验补全线关闭）

Goal 包：

- `GOAL-025`（Planned）

目标机制/切片：

- `M-026`、`M-027`、`M-030`、`M-035`、`M-044`、`VS-057`

规模预算：

- 主工作包：2
- 预计上下文压缩：0
- 独立验收批次：2

拆分触发：

- 若目标关卡还要求独立闭合两个以上未恢复资源族、跨入 `level231/232/233` 支线，或六段证据无法在一个关卡主包内清零影响实现的未知，立即拆成同线后续逆向 Goal；本 Goal 不写现代实现。

输入资料：

- `docs/workflow/reverse-engineering-protocol.md`、`docs/reverse-engineering/levels-index.md`、Stage 2-3 覆盖台账。
- `local-resources/regima/source/restored-swfs/assets/levels/level23.swf` 及实际加载到的恢复源共享包；视觉资源存在性以恢复语料库为准。
- `local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts/export/level/StageListener23.as` 与沿调用链窄查到的共享 AS3；legacy extraction 只读。

输出产物：

- 在 `levels-index.md` 建立 Stage 2-3 最小证据矩阵：局部类/实例、共享输入/物理/镜头/状态机/结果/存档、SWF 时间轴/注册点/碰撞盒/矩阵/坐标空间、可观察合同、现代 owner 建议和双重验证计划。
- 在恢复源包中定位场景、机关、怪物、弹体、门与结果所需 SymbolClass/MovieClip，选择性派生到 Git 忽略 task output，并更新独立 asset annotation batch；未知、推断、现代设计选择和反证条件必须显式分级。
- 根据证据把实现拆成一至多个同线 0-compact Goal/task；不得把新资料族逆向、多个 owner 实现和端到端校准重新合并。

完成定义：

- 待证明问题逐项回答：目标关卡身份与进入路由、显示列表/布局、墙/平台/停点/刷怪点、专属机关、怪物与攻击对象、失败/胜利、下一关解锁与当前槽保存。
- 六段证据矩阵完整，所有影响首个实现切片的未知为零；若不能清零则只归档已定位边界并生成同线补证 Goal，不使用“已扒/权威输入”。
- 只产出逆向证据、资源标注和后续任务，不修改 `src/`，不进入 Stage 2-3 实现或 940×590 现代运行验收。

验收标准：

- 恢复源 SWF 与 legacy AS3 交叉确认；视觉/空间结论包含注册点、嵌套矩阵、碰撞边界、坐标语义和现代素材原点。
- 关键结论按确认事实/交叉确认/推断/未知/现代设计选择分级，并列出反证条件；高风险视觉/时序至少达到交叉确认。
- `npm run check:annotations`、`npm run check:workflow` 与 `git diff --check` 通过；新后续 Goal 满足规模预算门禁。

禁止范围：

- 不修改、删除或重新生成 `local-resources/regima/legacy-extraction/`。
- 不因名称相近而把 `level231/232/233.swf` 或 Stage 23-x 支线自动并入主 Stage 2-3。
- 不写现代关卡代码，不用 Stage 2-2 规则类推缺失常量，不把局部关卡类当作完整调用链。

状态更新：

- 更新 `levels-index.md`、`mechanics-index.md`、`vertical-slices.md`、Stage 2-3 覆盖台账、资源标注、Goal/task/history 与适用 PG 反馈。

推荐后续任务：

- 依据闭合证据生成同线最小实现 Goal；若证据未闭合，生成同线最小补证 Goal。

### TASK-ARCH-010A

任务类型：

- `TASK-ARCH`

功能条线：

- `LINE-MONSTER-ARCH`（Planned；不得抢占当前 Active 线）

Goal 包：

- `GOAL-026`（Planned）

目标机制/切片：

- `M-030`、`VS-005`、`VS-006`

规模预算：

- 主工作包：2
- 预计上下文压缩：0
- 独立验收批次：2

拆分触发：

- 若兼容抽取要求同时迁移两个以上正式关卡 bridge、改动怪物视觉 owner，或把 `Monster3` 与 `Monster30` 的全部专属技能一并迁移，立即保留兼容 facade 并把消费者迁移拆成同线下一 Goal。

输入资料：

- `docs/architecture/设计模式.md`、`docs/architecture/src-boundaries.md`、`docs/domain/glossary.md`。
- `Stage1CombatSystem.ts`、`Monster3System.ts`、`Monster30System.ts`、`MonsterPhysicsSystem.ts`、`MonsterDefeatRewardSystem.ts`、`DropSystem.ts`。
- `docs/reverse-engineering/monsters-index.md` 与 `M-030` 已确认行为；AS3 只作行为证据，不作现代类结构模板。

输出产物：

- 建立 `MonsterDefinition`、`MonsterRuntime`、`MonsterBrain`、目标选择合同和只读 `MonsterDefinitionCatalog` 的现代 owner。
- 将 `Stage1CombatSystem` 中跨关卡复用的怪物配置、创建和更新规则迁至无关卡命名模块；保留薄兼容 facade，避免一次迁移所有消费者。
- 把至少一个重复目标选择路径接入参数化 Targeting 策略，支持横向/二维距离、警戒范围和存活过滤，不改变已确认怪物行为。
- 增加确定性测试，证明定义解析、目标选择、状态转换、稳定 ID 和兼容 facade 行为一致。

完成定义：

- 关卡出生数据只需引用怪物类型；怪物静态定义不由具体关卡 Flow 重复声明。
- 普通行为可以通过 `MonsterBrain` 合同替换，特殊怪物无需继承万能 `Monster` 父类。
- 通用 owner 不读取 Phaser 显示对象；动画、物理、伤害、奖励和掉落仍由既有 owner 管理。
- 现有正式关卡与测试切片通过兼容 facade 保持行为，不在本 task 移除 Flow/bridge 双登记。

验收标准：

- 先运行 `npm run check:structure`；目标文件触发 error 时先拆分，warning 按规则处理。
- `npm run test:systems`、涉及的怪物/关卡专项测试、`npm run build`、`npm run check:workflow` 和 `git diff --check` 通过。
- `rg` 复核没有新增第二份怪物定义表、目标选择公式或通用攻击状态转换 owner。

禁止范围：

- 不引入完整 ECS、全局事件总线、服务定位器或依赖注入框架。
- 不修改怪物数值、攻击时序、攻击几何、掉落概率、动画帧或关卡通关条件。
- 不删除兼容 facade，不在一次 task 中迁移全部关卡、Boss 和测试怪物。

状态更新：

- 更新 `LINE-MONSTER-ARCH` 覆盖台账、`src-boundaries.md`、适用机制/切片、Goal/task/history 与 PG 反馈。

推荐后续任务：

- `TASK-ARCH-010B`：建立最小 `MonsterRuntimeRegistry`，在一个普通怪 + Boss 正式关卡试点唯一生命周期 owner。

### TASK-ARCH-010B

任务类型：

- `TASK-ARCH`

功能条线：

- `LINE-MONSTER-ARCH`（Planned；待 `TASK-ARCH-010A` 完成且本线获得 WIP）

Goal 包：

- `GOAL-027`（Planned）

目标机制/切片：

- `M-030`、`VS-007`、`VS-056`

规模预算：

- 主工作包：2
- 预计上下文压缩：0
- 独立验收批次：2

拆分触发：

- 若试点需要同时迁移第二个正式关卡、引入通用掉落/投射物注册表，或改变关卡视觉 bridge 的资源派生与逐帧合同，立即限制为怪物注册表和单关卡生命周期，并将扩展拆成同线下一 Goal。

输入资料：

- `TASK-ARCH-010A` 的通用合同与兼容 facade。
- `docs/architecture/设计模式.md`、`docs/architecture/src-boundaries.md`、`LINE-MONSTER-ARCH` 覆盖台账。
- 一个同时具有普通怪和 Boss、已具备确定性测试与运行验收入口的正式关卡；默认候选为 Stage 2-2，执行前按当前工作树复核。

输出产物：

- 最小 `MonsterRuntimeRegistry`：稳定 ID、创建/查询/按遭遇筛选、幂等死亡登记和安全移除。
- 试点关卡以注册表作为怪物运行状态唯一 owner；Flow 只保留生成计划、遭遇进度和通关所需计数/ID，不复制完整怪物状态。
- scene bridge 继续拥有 Phaser view 适配，但不作为生命、AI、死亡或奖励事实源。
- 形成逐关卡迁移清单、风险和拆分建议，不在本 task 批量迁移其他正式关卡。

完成定义：

- 试点关卡怪物生成、更新、死亡、奖励、Boss 显门和销毁都由同一稳定 ID 串联。
- 重复死亡/移除安全幂等，Flow 与 bridge 不再各持一份完整怪物运行状态。
- 注册表保持轻量，不扩张为完整 ECS；系统仍通过明确输入/输出测试。
- 普通怪与 Boss 的 1P/2P 可玩行为、真视觉和通关结果无回归。

验收标准：

- 先运行 `npm run check:structure`；目标文件触发 error 时先拆分。
- 注册表确定性测试覆盖重复 ID、查询、死亡/移除幂等、空遭遇、普通怪与 Boss 并存和通关计数。
- 试点关卡专项、`npm run test:systems`、`npm run build`、`npm run check:workflow` 和 `git diff --check` 通过。
- 使用 940×590 正式入口复验 1P/2P 生成、战斗、Boss、失败/胜利、返回与重载，console 无 warning/error。

禁止范围：

- 不把掉落、宠物、投射物和场景物件同时纳入注册表。
- 不改变原版已确认流程、数值、视觉资源、动画时序或攻击几何。
- 不在试点未闭合前删除其他关卡的兼容路径。

状态更新：

- 更新 `LINE-MONSTER-ARCH` 覆盖台账、试点关卡覆盖台账、相关机制/切片、Goal/task/history 与适用 PG 反馈。

推荐后续任务：

- 依据试点结果生成同线逐关卡迁移 task；每个 Goal 只迁移一个共享 owner 簇或一个可独立验收的关卡批次。

### TASK-ARCH-014

任务类型：

- `TASK-ARCH`（Split 父任务，不直接执行）

功能条线：

- `LINE-SHARED-UI-COMPONENTS`（Planned）

Goal 包：

- 无；六个子 task 分别绑定 `GOAL-051..056`。

目标机制/切片：

- `M-035`、`M-037`、`M-052`、`VS-059`、`VS-064`

规模预算：

- 主工作包：0；父任务只聚合子任务
- 预计上下文压缩：0
- 独立验收批次：0

拆分触发：

- 已固定拆为审计合同、灵魂余额、按钮/关闭、背包基础、正式背包试点和嵌入式消费者迁移，不恢复为一次性全站重构。

输入资料：

- `PG-011`、本线覆盖台账及 `TASK-ARCH-014A..F` 的产物。

输出产物：

- 六个子 task 的组件合同、实现、迁移、逐页面回归与防复发结果全集。

完成定义：

- 只在六个子 task 全部归档、消费者矩阵无缺口且 PG-011 关闭标准满足后收束。

UI 原生化合同：

- 显示列表清单：由各子 task 按消费者页面分别继承。
- 原版视觉基准：由各迁移页面使用自己的 940×590 基准。
- 允许的现代视觉例外：只继承已批准项，父任务不新增例外。
- 逐状态验收：由 B..F 分别覆盖余额、按钮、背包与嵌入式消费者状态。
- 差异证据：逐页面并排/叠图和对象差异清单，不用组件截图代替。

验收标准：

- 子 task 各自通过专项、结构、构建、workflow、逐状态视觉与正式旅程门禁；父任务只核对全集。

禁止范围：

- 父任务不直接修改代码、不合并 Goal、不建立现代万能组件或统一皮肤。

状态更新：

- 子 task 全部完成后收束本任务、本线、覆盖台账和 PG-011。

推荐后续任务：

- 本父任务不直接执行；首次执行 `TASK-ARCH-014A`。

### TASK-ARCH-014A

任务类型：

- `TASK-ARCH`

功能条线：

- `LINE-SHARED-UI-COMPONENTS`（Planned；不得抢占当前 Active 线）

Goal 包：

- `GOAL-051`（Planned）

目标机制/切片：

- `M-035`、`M-037`、`M-052`、`VS-059`、`VS-064`

规模预算：

- 主工作包：2
- 预计上下文压缩：0
- 独立验收批次：2

拆分触发：

- 若审计发现第四个独立组件族、需要读取新的恢复源包，或任一候选同时跨三个以上业务 owner，立即只冻结已知三族合同，并将新增族/补证拆成同线下一 Goal。

输入资料：

- `PG-011`、本线覆盖台账、`task-generation.md`、`src-boundaries.md`、PG-007/009/010。
- feature UI systems/views、asset manifest/bundles、灵魂与 inventory 相关专项；只读审计，不修改页面实现。

输出产物：

- 共享组件目录、命名/分层 ADR、owner/消费者/页面保留项/资源 provenance 矩阵。
- 每个组件族的输入输出、生命周期、错误/空状态、bundle 归属、迁移顺序和防回填搜索。
- 工作流/结构校验的组件合同门禁及正负样例；B..F 执行前置清单。

完成定义：

- 灵魂余额、原生按钮/关闭、背包基础三族的存量实现和已知消费者均有明确归属。
- 共享行为与页面原生视觉的边界可执行；不存在“整页万能组件”或仅凭命名相似合并。
- 审计本身不迁移 `src/` 消费者，不越级宣称组件化完成。

UI 原生化合同：

- 显示列表清单：矩阵逐消费者引用现有根/子 Symbol、按钮态、动态 child、命中区与页面证据。
- 原版视觉基准：登记每个消费者已有 940×590 基准及缺口；缺基准项阻塞其后续迁移。
- 允许的现代视觉例外：只记录已获批准项；组件化不新增可见例外。
- 逐状态验收：为 B..F 定义 normal/hover/pressed/disabled/selected、分页、P1/P2、返回/重开的适用状态。
- 差异证据：冻结逐消费者对象差异模板，不以共享组件截图代替页面差异证据。

组件化合同：

- 组件家族：SoulBalance、NativeButton/CloseLifecycle、Inventory item/grid/selection/tooltip。
- 权威 owner：domain/system 持有业务事实，shared Phaser component 持有只读投影/交互生命周期，page composition 持有原生显示列表。
- 共享行为：审计并冻结刷新、交互状态、选择/分页、关闭/销毁与资源使用合同。
- 页面保留项：源 Symbol、皮肤、矩阵、坐标、命中区、页面字段和专属业务流程。
- 消费者迁移矩阵：列出全部已知消费者、当前 owner、目标组件、迁移 Goal、阻塞与排除理由。
- 防复发门禁：工作流字段校验、重复 owner 窄查、截图裁片/provenance 检查和结构边界测试。

验收标准：

- `npm run check:workflow`、组件合同正负样例、`git diff --check` 通过；审计搜索结果可复查。
- 执行前先运行 `npm run check:structure`；若后续预定目标文件已有 error，必须在矩阵中登记先拆分。

禁止范围：

- 不修改 `src/` 页面实现，不派生视觉资源，不迁移消费者，不改变 UI、业务或存档。
- 不建立 `GenericButton`、`GenericPanel` 或万能背包页。

状态更新：

- 更新本线覆盖、PG-011 测试结果/反馈、Goal/task/history 与涉及的 PG-007/008/009/010 样本。

推荐后续任务：

- `TASK-ARCH-014B`。

### TASK-ARCH-014B

任务类型：

- `TASK-ARCH`

功能条线：

- `LINE-SHARED-UI-COMPONENTS`（Planned；须待本线获得 WIP 且 014A 归档）

Goal 包：

- `GOAL-052`（Planned）

目标机制/切片：

- `M-035`、`M-044`、`M-052`、`VS-059`

规模预算：

- 主工作包：2
- 预计上下文压缩：0
- 独立验收批次：2

拆分触发：

- 若 014A 矩阵确认五个以上结构不同的灵魂消费者、需要新增源包派生或修改 `PlayerSoulSystem`/存档 schema，立即把迁移按页面批次拆分；本 Goal 只建立组件与首批既有消费者。

输入资料：

- 014A 的 SoulBalance 合同/矩阵，PG-007/010/011，现有 `FormalSoulBalanceView`、技能/炼丹炉/商城 views、资源 provenance 与专项。

输出产物：

- 唯一 SoulBalance 视图投影与有类型配置；已知消费者不再私有绘制图标、数字轮廓或余额副本。
- 独立透明图标、嵌入字形/Flash 度量、bundle owner 与 screenshot/stage-background 负向门禁。
- P1/P2、余额刷新、消费后即时显示、切页/返回/重载和销毁回归。

完成定义：

- 全部纳入矩阵的灵魂消费页复用同一组件代码与权威视觉子件，同时保留页面位置和 owner 标签差异。
- 组件只读取当前 player 的 `soulCount` 投影，不持有或扣减余额；消费继续经 `PlayerSoulSystem`。
- 不再出现黑框、遮字、系统字体回退、旧页 model 或页面私有数字渲染。

UI 原生化合同：

- 显示列表清单：逐页核对灵魂图标、动态数字、owner 标签、父层级、矩阵和遮挡关系。
- 原版视觉基准：技能/炼丹炉沿用原 SWF 基准；商城使用用户批准现代例外及无黑底复验基准。
- 允许的现代视觉例外：商城新增同款组件是已批准例外；不得扩大到其他可见层。
- 逐状态验收：P1/P2、0/多位数、消费前后、切页、返回、重复打开和重载。
- 差异证据：逐页并排/叠图、组件边界 alpha 检查与可见对象差异清单。

组件化合同：

- 组件家族：SoulBalance。
- 权威 owner：`PlayerSoulSystem`/V6 玩家直属字段为业务 owner；共享 view 只读投影。
- 共享行为：透明图标、嵌入字形排版、余额刷新、容器生命周期与销毁。
- 页面保留项：位置、层级、页面专属 owner 标签、源显示列表关系和允许例外。
- 消费者迁移矩阵：以 014A 冻结矩阵为准，至少覆盖技能、炼丹炉、商城及当时已知消费者。
- 防复发门禁：禁止页面私有灵魂视图、截图裁片、舞台底色、系统字体和 `skillLearning.soulCount` 回流。

验收标准：

- 先运行 `check:structure`；专项、`test:systems`、`build`、`check:workflow`、`git diff --check` 通过。
- 940×590 逐页/P1/P2/消费/返回/重载复验，console 无 warning/error。

禁止范围：

- 不改变余额、价格、奖励、消费事务或 V6 schema；不迁移按钮/背包组件族。

状态更新：

- 更新本线覆盖、PG-007/010/011、Goal/task/history 与相关视觉审计。

推荐后续任务：

- `TASK-ARCH-014C`。

### TASK-ARCH-014C

任务类型：

- `TASK-ARCH`

功能条线：

- `LINE-SHARED-UI-COMPONENTS`（Planned；须待 014B 归档）

Goal 包：

- `GOAL-053`（Planned）

目标机制/切片：

- `M-035`、`M-052`、`VS-059`

规模预算：

- 主工作包：2
- 预计上下文压缩：0
- 独立验收批次：2

拆分触发：

- 若代表性 overlay 与整页页面存在两套不可兼容 host 生命周期，或迁移需覆盖三个以上额外页面，立即保留两个小组件/adapter，并将额外消费者拆成同线后续 Goal。

输入资料：

- 014A 按钮/关闭矩阵，设置 overlay、炼丹炉、商城、背包等原生按钮 helpers、`FeatureUiHost` 与页面关闭/销毁专项。

输出产物：

- 共享 NativeButton 状态/命中适配与 CloseLifecycle 的 Escape、回调解绑、重复打开和幂等销毁合同。
- 一个 overlay 与一个整页页面试点；页面通过 skin/geometry adapter 提供原生帧、矩阵和命中区。
- 组件状态、host 返回和销毁专项及重复 helper 防回填检查。

完成定义：

- 共享的是交互/生命周期，不是统一皮肤；试点页面可见外观与行为无回归。
- 按钮回调不会因重复打开叠加，Escape/关闭只触发一次，销毁后没有悬挂对象或输入监听。
- 未纳入本 Goal 的页面保留在矩阵，不被顺手批量迁移。

UI 原生化合同：

- 显示列表清单：试点逐按钮记录源 Symbol/帧、矩阵、命中区、depth 与关闭根关系。
- 原版视觉基准：overlay 与整页各使用现有 940×590 normal/hover/pressed/关闭基准。
- 允许的现代视觉例外：无新增可见例外；透明 hit area 仅在原证据支持时使用。
- 逐状态验收：normal/hover/pressed/disabled、Escape、点击关闭、重复打开、返回和销毁。
- 差异证据：逐试点按钮并排/叠图、命中范围和对象差异清单。

组件化合同：

- 组件家族：NativeButton / CloseLifecycle。
- 权威 owner：组件拥有输入状态和监听生命周期；页面/host 拥有业务回调与路由。
- 共享行为：状态切换、命中、单次激活、Escape、解绑、重复打开和幂等销毁。
- 页面保留项：按钮皮肤/Symbol 帧、矩阵、坐标、命中几何、音效和返回语义。
- 消费者迁移矩阵：本 Goal 只迁移 014A 选定的一 overlay + 一整页，其余明确排期或排除。
- 防复发门禁：禁止新页面复制状态/关闭 helper；组件不得内置通用可见皮肤。

验收标准：

- 先运行 `check:structure`；组件/试点专项、`test:systems`、`build`、`check:workflow`、`git diff --check` 通过。
- 940×590 两类试点逐状态及返回/重复打开复验，console 无 warning/error。

禁止范围：

- 不迁移全部页面，不改页面路由/业务动作，不建立现代通用按钮皮肤，不进入 inventory 组件。

状态更新：

- 更新本线覆盖、PG-007/011、Goal/task/history 与试点页面视觉审计。

推荐后续任务：

- `TASK-ARCH-014D`。

### TASK-ARCH-014D

任务类型：

- `TASK-ARCH`

功能条线：

- `LINE-SHARED-UI-COMPONENTS`（Planned；须待 014C 归档）

Goal 包：

- `GOAL-054`（Planned）

目标机制/切片：

- `M-035`、`M-037`、`M-052`、`VS-064`

规模预算：

- 主工作包：2
- 预计上下文压缩：0
- 独立验收批次：2

拆分触发：

- 若 item cell、grid/pagination 与 tooltip/selection 不能在两个工作包内形成稳定无页面合同，立即保留 item cell/grid 核心，把 tooltip/selection 拆为同线下一 Goal；不压缩为万能组件。

输入资料：

- 014A inventory 矩阵、431 项目录、`FormalInventoryPageView/System`、炼丹炉/商城/任务消费者及现有专项。

输出产物：

- 有类型的只读 item view-model、InventoryItemCell、Grid/Pagination、Selection/Tooltip 接缝和生命周期合同。
- 空格、实例/堆叠数量、selected/disabled、页边界、稳定 ID、刷新与销毁的确定性测试。
- 不连接正式页面的组件 harness；页面 skin/geometry 通过 adapter 注入。

完成定义：

- 基础组件不读取存档、不执行物品事务、不决定分类/筛选或页面动作。
- 正式背包与嵌入式消费者所需的共同语义有显式交集；不同语义留给页面 adapter。
- 本 Goal 只建立基础层和 harness，不迁移正式背包或其他消费者。

UI 原生化合同：

- 显示列表清单：以现有消费者矩阵定义 cell/icon/count/selected/tooltip/分页对象，不宣称单一显示列表。
- 原版视觉基准：harness 只验证组件状态；各页面迁移仍绑定自己的 940×590 原版基准。
- 允许的现代视觉例外：harness 可使用仅测试可见容器，不能进入 production 或正式截图。
- 逐状态验收：empty/item、实例/堆叠、selected/disabled、首末页、刷新、清空和销毁。
- 差异证据：本 Goal 提供组件对象/几何断言；页面像素差异留给 014E/F。

组件化合同：

- 组件家族：InventoryItemCell、InventoryGrid/Pagination、Selection/Tooltip 接缝。
- 权威 owner：Inventory catalog/transaction 与页面 system 持有业务；组件只读 view-model。
- 共享行为：稳定 item 投影、空/数量/选中状态、页边界、刷新与生命周期。
- 页面保留项：格子皮肤、行列/间距、图标缩放、文字样式、tooltip 字段和点击业务。
- 消费者迁移矩阵：合同覆盖 014A 证明的交集；迁移分别由 014E/F 执行。
- 防复发门禁：组件禁止 import Save/transaction/page route；禁止 production 万能皮肤和页面业务分支。

验收标准：

- 先运行 `check:structure`；组件确定性专项、类型检查、`test:systems`、`build`、`check:workflow`、`git diff --check` 通过。

禁止范围：

- 不迁移正式页面，不改变 431 目录/事务/V6，不派生新可见资源，不实现物品专属使用效果。

状态更新：

- 更新本线覆盖、PG-011、Goal/task/history 与 `src-boundaries.md`。

推荐后续任务：

- `TASK-ARCH-014E`。

### TASK-ARCH-014E

任务类型：

- `TASK-ARCH`

功能条线：

- `LINE-SHARED-UI-COMPONENTS`（Planned；须待 014D 归档）

Goal 包：

- `GOAL-055`（Planned）

目标机制/切片：

- `M-035`、`M-037`、`M-044`、`M-052`、`VS-064`

规模预算：

- 主工作包：2
- 预计上下文压缩：0
- 独立验收批次：2

拆分触发：

- 若正式背包迁移需要修改 catalog/transaction/V6，或同时重做四分类之外的物品专属效果，立即停止并拆出同线阻塞治理；本 Goal 只做视图组件试点。

输入资料：

- 014D 基础组件、正式背包 304/246/628 显示列表、431 目录/428 真图标、`TASK-SLICE-160` 视觉审计和专项。

输出产物：

- `FormalInventoryPageView` 通过页面 adapter 组合共享基础组件，删除被替代的私有 grid/page/selection 生命周期实现。
- 四分类、5×25、实例/99 堆叠、selected/tooltip、穿脱/使用入口、P1/P2 与 V6 回归。
- 正式背包 940×590 逐状态差异证据和私有重复实现负向门禁。

完成定义：

- 玩家可见外观、布局、按钮状态、图标和业务与迁移前一致；组件替换不改变 inventory owner。
- 431 身份、428 真图标、3 项原版缺陷排除、容量/原子事务和双 owner 全部保持。
- 正式背包成为唯一试点，不在本 Goal 迁移炼丹炉、商城或任务奖励。

UI 原生化合同：

- 显示列表清单：直接继承 304/246/628、22 个原生控件、cell/icon/count/selected/tooltip 与分页层级。
- 原版视觉基准：复用 `TASK-SLICE-160` 的 940×590 四分类/分页/选择基准并补迁移后同状态。
- 允许的现代视觉例外：零新增；3 项缺陷继续按权威目录排除而非占位。
- 逐状态验收：四分类、首/末页、empty/stack/instance、selected、tooltip、P1/P2、返回和重载。
- 差异证据：迁移前后稳定区域叠图、对象差异清单及容差说明。

组件化合同：

- 组件家族：InventoryItemCell、InventoryGrid/Pagination、Selection/Tooltip。
- 权威 owner：catalog/transaction/page system 保持业务 owner；shared view primitives 只读投影。
- 共享行为：cell 刷新、数量/选中、分页、详情投影和销毁。
- 页面保留项：304/246/628 原生皮肤、5×25 几何、四分类筛选、按钮/tooltip 字段和业务动作。
- 消费者迁移矩阵：本 Goal 只关闭正式背包行，嵌入式消费者保持待 014F。
- 防复发门禁：禁止正式背包重新声明私有 grid/page/selection owner；目录/事务/V6 不得迁入 view。

验收标准：

- 先运行 `check:structure`；背包专项、全量目录/事务/V6、`test:systems`、`build`、`check:workflow`、`git diff --check` 通过。
- 940×590 P1/P2 四分类/分页/选择/返回/重载复验，console 无 warning/error。

禁止范围：

- 不改变目录、容量、事务、存档 schema、资源缺陷裁决或物品专属效果；不迁移其他页面。

状态更新：

- 更新本线覆盖、M-037/M-052、VS-064、PG-007/009/011、Goal/task/history。

推荐后续任务：

- `TASK-ARCH-014F`。

### TASK-ARCH-014F

任务类型：

- `TASK-ARCH`

功能条线：

- `LINE-SHARED-UI-COMPONENTS`（Planned；须待 014E 归档）

Goal 包：

- `GOAL-056`（Planned）

目标机制/切片：

- `M-035`、`M-037`、`M-044`、`M-046`、`M-052`、`VS-059`、`VS-064`

规模预算：

- 主工作包：2
- 预计上下文压缩：0
- 独立验收批次：2

拆分触发：

- 若 014A 冻结矩阵中需要迁移三个以上结构不同的页面族，或任一消费者需新增业务 producer/事务/存档字段，立即按页面族拆成同线 Goal；本 Goal 不以关闭整线为由突破预算。

输入资料：

- 014A 消费者矩阵、014D 基础组件、014E 试点结论，炼丹炉/商城/任务奖励等已证实消费者的显示列表、业务专项与视觉基准。

输出产物：

- 按冻结矩阵迁移等价的嵌入式 item/selection/pagination 消费者；不等价项保留页面 adapter 并记录理由。
- 页面私有重复 owner、临时资源裁片和业务状态进入 view 的静态防回填。
- 跨灵魂/背包/按钮组件的正式页面旅程、关闭审计和 PG-011 结果。

完成定义：

- 矩阵全部消费者已迁移或获得用户确认排除；页面业务、原生布局和资源无回归。
- 组件创建/刷新/销毁在跨页、重复打开、P1/P2 和重载旅程中稳定，不串 page model 或 bundle。
- 只有全部关闭检查满足时才收束 `TASK-ARCH-014`、本线和 PG-011。

UI 原生化合同：

- 显示列表清单：每个迁移消费者继续使用自己的 Symbol/depth/矩阵/字段/按钮/命中区清单。
- 原版视觉基准：逐页面使用已闭合 940×590 原 SWF 或获批现代例外基准。
- 允许的现代视觉例外：仅继承既有批准项，不因组件复用增加可见层。
- 逐状态验收：按页面覆盖 item/empty/selected/disabled、分页/确认、P1/P2、返回、重复打开和重载。
- 差异证据：逐页面并排/叠图、对象差异清单和跨页状态污染检查。

组件化合同：

- 组件家族：Inventory 嵌入式消费者，并回归 SoulBalance 与 NativeButton/CloseLifecycle。
- 权威 owner：各业务 system/transaction 保持事实源；组件只读投影与交互适配。
- 共享行为：经 014A/D 冻结的 item、选择/分页、按钮/关闭与余额显示合同。
- 页面保留项：每页原生皮肤/几何、字段、筛选、确认/奖励/购买/炼制语义和 bundle。
- 消费者迁移矩阵：逐行记录 migrated/excluded、证据、测试和剩余风险；无空白消费者。
- 防复发门禁：静态重复搜索、组件 import 边界、provenance/alpha、页面专项和跨页正式旅程。

验收标准：

- 先运行 `check:structure`；各消费者专项、`test:systems`、`build`、`check:workflow`、`git diff --check` 通过。
- 940×590 正式入口跨页面进入/交互/返回/重复打开/P1/P2/重载，console 无 warning/error。

禁止范围：

- 不新增或改变任务 producer、奖励、购买/炼制/背包事务、V6 schema、价格/数值或原版页面表现。
- 不为赶关闭合并语义不同的消费者，不跨入 Stage 2-3 或怪物架构。

状态更新：

- 更新本线覆盖、相关机制/切片、PG-007/008/009/010/011、Goal/task/history；满足全部关闭条件后收束父任务和功能线。

推荐后续任务：

- 若矩阵无缺口则关闭 `TASK-ARCH-014`、`LINE-SHARED-UI-COMPONENTS` 与 PG-011；否则只生成同线最小补迁移 Goal。

# 游戏任务看板

本文只记录未完成的游戏复现 task。完整系统范围和激活状态以 `docs/tasks/feature-lines.md` 为准；一次 `/goal` 的边界以 `docs/tasks/goal-board.md` 为准；task 是最小验收单位。完成 task 或 Goal 都不等于完成功能条线。

## 当前推荐

`TASK-SLICE-155A` 是唯一当前推荐，属于唯一 Active Goal 和唯一 Active 功能线。地图四服务页六段证据已全部归档；下一次 `/goal` 只实现丹药页原生 UI、P1/P2 炼制/服用事务与本地存档，不进入商城、设置或任务页实现。

## 待完成任务

| Task | 状态 | Goal | 功能条线 | 类型 | 目标 | 目标机制/切片 | 输出 | 下一步 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| TASK-SLICE-155A | Ready | GOAL-045 | LINE-PRE-STAGE-2-3-COMPLETION | 丹药页实现 | 接入原生丹药页、P1/P2 炼制/服用与本地存档 | M-044、M-052、VS-059 | 可玩页面、自动门禁与 940×590 逐状态证据 | TASK-SLICE-155B |
| TASK-SLICE-155B | Planned | GOAL-046 | LINE-PRE-STAGE-2-3-COMPLETION | 商城页实现 | 接入原生商城与离线灵魂购买，不伪造在线服务 | M-044、M-046、M-052、VS-059 | 可玩页面、事务/重载门禁与逐状态证据 | TASK-SLICE-155C |
| TASK-SLICE-155C | Planned | GOAL-047 | LINE-PRE-STAGE-2-3-COMPLETION | 设置页实现 | 接入原生设置 overlay 与获批的现代持久化边界 | M-035、M-044、M-052、VS-059 | 可玩 overlay、会话/重载门禁与逐状态证据 | TASK-SLICE-155D |
| TASK-SLICE-155D | Planned | GOAL-048 | LINE-PRE-STAGE-2-3-COMPLETION | 任务页实现 | 接入原生任务页、进度/奖励与跨日存档 | M-044、M-046、M-052、VS-059 | 可玩页面、领取/跨日门禁与逐状态证据 | TASK-SETTINGS-067 |
| TASK-SETTINGS-067 | Planned | GOAL-038 | LINE-PRE-STAGE-2-3-COMPLETION | 关卡功能入口逆向 | 闭合设置、技能、背包、法宝、宠物五入口的原版状态与共享 host 差异 | M-016、M-035、M-043、M-052、VS-060 | 显示列表、暂停/owner/返回合同与实现拆分 | 拆分 TASK-SLICE-156 |
| TASK-SETTINGS-068 | Planned | GOAL-039 | LINE-PRE-STAGE-2-3-COMPLETION | 怪物视觉覆盖逆向 | 盘清所有已完成关卡实际小怪、动作和攻击对象真动画缺口 | M-030、M-034、M-035、VS-061 | 逐关逐怪全集矩阵、资源标注与逐关实现 Goal | 拆分 TASK-SLICE-157 |
| TASK-SETTINGS-069 | Planned | GOAL-040 | LINE-PRE-STAGE-2-3-COMPLETION | 角色/技能视觉逆向 | 盘清五角色本体、战斗 UI、普攻、技能与附属对象真动画缺口 | M-018..M-025、M-034、M-035、M-047、M-049、VS-062 | 逐角色逐技能全集矩阵、资源标注与逐角色实现 Goal | 拆分 TASK-SLICE-158 |
| TASK-SLICE-155 | Split | — | LINE-PRE-STAGE-2-3-COMPLETION | 地图四页实现父任务 | 按证据分别实现丹药、商城、设置、任务 | M-044、M-046、M-052、VS-059 | 由 TASK-SETTINGS-066 生成的逐页子 task | 全部子 task 完成后收束父任务 |
| TASK-SLICE-156 | Split | — | LINE-PRE-STAGE-2-3-COMPLETION | 关卡五入口实现父任务 | 复用既有功能页并补设置、原生按钮状态和正式关卡接线 | M-016、M-043、M-052、VS-060 | 由 TASK-SETTINGS-067 生成的共享接线/校准子 task | 全部子 task 完成后收束父任务 |
| TASK-SLICE-157 | Split | — | LINE-PRE-STAGE-2-3-COMPLETION | 既有关卡怪物动画父任务 | Stage 1-1/1-2/1-3 逐关接入全部怪物/攻击对象真动画，回归 Stage 2-1/2-2 | M-030、M-034、M-035、VS-061 | 由 TASK-SETTINGS-068 生成的逐关子 task | 全部子 task 完成后收束父任务 |
| TASK-SLICE-158 | Split | — | LINE-PRE-STAGE-2-3-COMPLETION | 五角色动画父任务 | 逐角色接入本体、战斗 UI、普攻、技能及附属对象真动画 | M-018..M-025、M-034、M-035、M-047、M-049、VS-062 | 由 TASK-SETTINGS-069 生成的逐角色子 task | 全部子 task 完成后收束父任务 |
| TASK-SLICE-159 | Planned | GOAL-041 | LINE-PRE-STAGE-2-3-COMPLETION | 本地存档正式旅程 | 复用既有六槽 localStorage/V6，验证所有新增功能跨重启持久化并关闭前置线 | M-044、M-050、VS-052、VS-063 | 自动旅程、940×590 重启读取证据与关闭检查 | 恢复 GOAL-025 / TASK-SETTINGS-064 |
| TASK-SETTINGS-064 | Planned | GOAL-025 | LINE-STAGE-2-3 | 关卡/玩法逆向 | 闭合 Stage 2-3 真场景、流程、怪物/机关、结果与存档六段证据 | M-026、M-027、M-030、M-035、M-044、VS-057 | 权威证据矩阵、资源标注、未知/反证与有界实现 Goal | 依据证据生成同线最小实现 Goal |
| TASK-ARCH-010A | Planned | GOAL-026 | LINE-MONSTER-ARCH | 现代怪物架构 | 建立组合式怪物定义、运行状态、Targeting/Brain 接缝并抽离关卡命名的通用 owner | M-030、VS-005、VS-006 | 通用合同、定义目录、策略入口、兼容 facade 与确定性回归 | TASK-ARCH-010B |
| TASK-ARCH-010B | Planned | GOAL-027 | LINE-MONSTER-ARCH | 怪物生命周期治理 | 建立唯一怪物运行时注册表并在普通怪+Boss 正式关卡试点 | M-030、VS-007、VS-056 | 注册表、Flow/bridge 所有权收敛、试点关卡回归与后续迁移清单 | 依据试点生成同线逐关卡迁移 task |

## 任务完成定义

### TASK-SETTINGS-067

任务类型：

- `TASK-SETTINGS`

功能条线：

- `LINE-PRE-STAGE-2-3-COMPLETION`（Planned）

Goal 包：

- `GOAL-038`（Planned）

目标机制/切片：

- `M-016`、`M-035`、`M-043`、`M-052`、`VS-060`

规模预算：

- 主工作包：2
- 预计上下文压缩：0
- 独立验收批次：2

拆分触发：

- 若设置页需要独立源包/业务 owner，或五入口在 HUD 与键盘存在两套不同状态机，立即把设置页证据或 HUD 入口证据拆成同线下一 Goal。

输入资料：

- `reverse-engineering-protocol.md`、`combat-hud-index.md`、`full-function-ui-index.md`、`RoleInfo` / `GameInfo` / `KeyBoardControl` / 设置页实际调用链和恢复源 SWF。

输出产物：

- 五入口显示列表、命中区、按钮状态、owner、互斥、暂停/恢复、关闭返回和既有 `FeatureUiHost` 差异矩阵；拆分 `TASK-SLICE-156`。

完成定义：

- 证明哪些入口是原版 HUD 按钮、哪些只有快捷键、P2/法宝限制、设置页内容和战斗暂停语义；不得把“既有页面可达”写成“原版表现一致”。

UI 原生化合同：

- 显示列表清单：记录 HUD 根/按钮 depth、矩阵、文字/图标、三态/选中态、动态 child、命中区与页面根关系。
- 原版视觉基准：单人/双人 HUD、五入口各一次进入/返回的 940×590 基准。
- 允许的现代视觉例外：仅可访问性输入或原版无 P2 法宝入口等已批准边界；禁止现代按钮覆盖真按钮。
- 逐状态验收：normal/hover/pressed/disabled、P1/P2、暂停、互斥、再次按键关闭、Escape/返回。
- 差异证据：逐入口对象清单、叠图/并排证据和容差说明。

验收标准：

- 六段证据完整；`check:annotations`、`check:workflow`、`git diff --check` 通过。

禁止范围：

- 不重写已闭合的背包/技能/宠物/法宝业务，不在证据 Goal 写现代接线。

状态更新：

- 更新本线覆盖、M-016/M-052、VS-060、Goal/task/history 与适用 PG 反馈。

推荐后续任务：

- 执行 `TASK-SLICE-156` 拆出的第一个共享入口/设置实现 task。

### TASK-SETTINGS-068

任务类型：

- `TASK-SETTINGS`

功能条线：

- `LINE-PRE-STAGE-2-3-COMPLETION`（Planned）

Goal 包：

- `GOAL-039`（Planned）

目标机制/切片：

- `M-030`、`M-034`、`M-035`、`VS-061`

规模预算：

- 主工作包：2
- 预计上下文压缩：0
- 独立验收批次：2

拆分触发：

- 若 Stage 1 三关合计需要两个以上尚未恢复的怪物资源族，按关卡拆为 `TASK-SETTINGS-068A..C`，当前 Goal 只交付全集差异矩阵。

输入资料：

- `reverse-engineering-protocol.md`、`monsters-index.md`、`levels-index.md`、五条已完成关卡覆盖台账、恢复源关卡/怪物/攻击对象 SWF 与对应局部 AS3。

输出产物：

- Stage 1-1/1-2/1-3/2-1/2-2 的实际怪物类型 × idle/run/attack/hit/death/专属动作 × 攻击对象 × 帧数/注册点/触发 tick 全集矩阵和资源标注；拆分 `TASK-SLICE-157`。

完成定义：

- Stage 2-1/2-2 已有证据只做回归核对；Stage 1 每种实际生成的小怪和 Boss 均有真资源存在性、动作映射、碰撞/原点和生命周期结论，缺资源明确阻塞而非继续用占位关闭。

验收标准：

- 恢复源与 AS3 交叉确认，高风险时序至少交叉确认；`check:annotations`、`check:workflow`、`git diff --check` 通过。

禁止范围：

- 不实现动画，不把代表性怪物推成关卡全集，不进入 Stage 2-3。

状态更新：

- 更新 M-030/M-034、VS-061、本线覆盖、资源标注、Goal/task/history 与适用 PG 反馈。

推荐后续任务：

- 执行 `TASK-SLICE-157` 拆出的 Stage 1-1 真动画实现 task。

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

### TASK-SLICE-155

任务类型：

- `TASK-SLICE`（Split 父任务，不直接执行）

功能条线：

- `LINE-PRE-STAGE-2-3-COMPLETION`（Active）

Goal 包：

- 无；子 task 已绑定 `GOAL-045..048`。

目标机制/切片：

- `M-044`、`M-046`、`M-052`、`VS-059`

规模预算：

- 主工作包：0；父任务只聚合子任务
- 预计上下文压缩：0
- 独立验收批次：0

拆分触发：

- 固定按证据中的页面资源族和事务 owner 拆分；禁止恢复为四页一次实现。

输入资料：

- `map-service-ui-index.md`、`TASK-SETTINGS-066A..D` 的逐页证据及资源标注。

输出产物：

- 丹药、商城、设置、任务逐页子 task/Goal 及全部完成后的父任务收束记录。

完成定义：

- 所有子 task 归档且 VS-059 覆盖矩阵无未解释缺口。

UI 原生化合同：

- 显示列表清单：由每个逐页子 task 继承对应证据清单。
- 原版视觉基准：每个子 task 使用对应页面 940×590 基准。
- 允许的现代视觉例外：只允许已批准的停服服务离线边界。
- 逐状态验收：四页各自覆盖按钮态、动态内容、进入/返回。
- 差异证据：逐页并排/叠图与对象差异清单。

验收标准：

- 子 task 各自通过业务、视觉与工作流门禁，父任务只核对全集。

禁止范围：

- 父任务不直接实现，不合并四页，不伪造在线服务。

状态更新：

- 子 task 全部完成后移入历史并更新 VS-059 与本线覆盖。

推荐后续任务：

- 四个证据 task 完成后执行 `TASK-SLICE-155A`。

### TASK-SLICE-155A

任务类型：

- `TASK-SLICE`

功能条线：

- `LINE-PRE-STAGE-2-3-COMPLETION`（Planned）

Goal 包：

- `GOAL-045`（Planned）

目标机制/切片：

- `M-044`、`M-052`、`VS-059`

规模预算：

- 主工作包：2
- 预计上下文压缩：0
- 独立验收批次：2

拆分触发：

- 若丹药事务需要新增独立 inventory/save 架构 owner，先拆架构 task，不在页面 Goal 内扩张。

输入资料：

- `TASK-SETTINGS-066A`、`map-service-ui-index.md` 与 `map-service.immortality`。

输出产物：

- 丹药页原生显示列表、P1/P2 选择、服用/炼制事务与现有 V6 本地存档接线。

完成定义：

- 只消费已闭合的 `TASK-SETTINGS-066A` 证据和 `map-service.immortality` 资源，不在实现期补猜逆向事实。
- 正式地图进入/返回、五类五阶、所有成功/拒绝态、P1/P2 隔离和重载保持通过。

UI 原生化合同：

- 显示列表清单：直接组合原根、按钮、文字与动态 child。
- 原版视觉基准：对应页面 940×590 原 SWF 逐状态基准。
- 允许的现代视觉例外：默认无。
- 逐状态验收：normal/hover/pressed/selected、炼制弹窗、余额、双 owner 与返回。
- 差异证据：并排/叠图和对象差异清单。

验收标准：

- 专项、全系统、structure、build、annotations、workflow、diff check 与浏览器逐状态证据通过。

禁止范围：

- 不修改原配方/概率/数值，不重做存档 schema，不进入商城/设置/任务。

状态更新：

- 完成后归档本 task/Goal，激活 `TASK-SLICE-155B`，更新 VS-059、本线覆盖与适用 PG 反馈。

推荐后续任务：

- `TASK-SLICE-155B`。

### TASK-SLICE-155B

任务类型：

- `TASK-SLICE`

功能条线：

- `LINE-PRE-STAGE-2-3-COMPLETION`（Planned）

Goal 包：

- `GOAL-046`（Planned）

目标机制/切片：

- `M-044`、`M-046`、`M-052`、`VS-059`

规模预算：

- 主工作包：2
- 预计上下文压缩：0
- 独立验收批次：2

拆分触发：

- 若离线购买需要新增独立 commerce/save 架构 owner，先拆架构 task，不伪造网络服务。

输入资料：

- `TASK-SETTINGS-066B`、`map-service-ui-index.md` 与 `map-service.shop`。

输出产物：

- 商城原生显示列表、分类/分页/数量/确认、P1/P2 灵魂购买与 V6 本地保存。

完成定义：

- 只消费 `TASK-SETTINGS-066B` 的 49 商品/价格/状态证据和 `map-service.shop`。
- 正式进入/返回、折扣、成功/拒绝、库存容量、双方隔离和重载保持通过；不伪造在线支付或后端。

UI 原生化合同：

- 显示列表清单：保留原分类、九卡、分页、余额、P1/P2 与返回对象。
- 原版视觉基准：对应页面 940×590 原 SWF 逐状态基准。
- 允许的现代视觉例外：停服静态文字只有用户批准后才能替换。
- 逐状态验收：分类/卡片/分页/数量/确认/P1/P2/余额/返回。
- 差异证据：并排/叠图和对象差异清单。

验收标准：

- 专项、全系统、structure、build、annotations、workflow、diff check 与逐状态证据通过。

禁止范围：

- 不新增人民币、点券、账户、网络或活动服务，不进入其他三页。

状态更新：

- 完成后归档本 task/Goal，激活 `TASK-SLICE-155C`，更新 VS-059、本线覆盖与适用 PG 反馈。

推荐后续任务：

- `TASK-SLICE-155C`。

### TASK-SLICE-155C

任务类型：

- `TASK-SLICE`

功能条线：

- `LINE-PRE-STAGE-2-3-COMPLETION`（Planned）

Goal 包：

- `GOAL-047`（Planned）

目标机制/切片：

- `M-035`、`M-044`、`M-052`、`VS-059`

规模预算：

- 主工作包：2
- 预计上下文压缩：0
- 独立验收批次：2

拆分触发：

- 若获批的现代持久化需要新增 schema/迁移，拆为独立架构 Goal。

输入资料：

- `TASK-SETTINGS-066C`、`map-service-ui-index.md` 与 `map-service.settings`。

输出产物：

- 设置 overlay 的五行原生状态、关闭和会话行为；现代持久化仅按已记录的用户裁决接线。

完成定义：

- 只消费 `TASK-SETTINGS-066C` 和 `map-service.settings`，不把原版死控件擅自改成新事实。
- 难度、BGM、技能音效、FPS、关闭/重复打开通过；若持久化获批，复用现有设置/槽边界并做跨重启验证。

UI 原生化合同：

- 显示列表清单：直接组合原五行、动态值和关闭按钮。
- 原版视觉基准：对应 overlay 940×590 原 SWF 逐状态基准。
- 允许的现代视觉例外：只有已记录的用户裁决。
- 逐状态验收：五行 normal/hover/pressed/value、关闭、重复打开与返回。
- 差异证据：并排/叠图和对象差异清单。

验收标准：

- 专项、全系统、structure、build、annotations、workflow、diff check 与逐状态证据通过。

禁止范围：

- 不重做 V6，不顺手改变音频/难度系统，不进入其他页面。

状态更新：

- 完成后归档本 task/Goal，激活 `TASK-SLICE-155D`，更新 VS-059、本线覆盖与适用 PG 反馈。

推荐后续任务：

- `TASK-SLICE-155D`。

### TASK-SLICE-155D

任务类型：

- `TASK-SLICE`

功能条线：

- `LINE-PRE-STAGE-2-3-COMPLETION`（Planned）

Goal 包：

- `GOAL-048`（Planned）

目标机制/切片：

- `M-044`、`M-046`、`M-052`、`VS-059`

规模预算：

- 主工作包：2
- 预计上下文压缩：0
- 独立验收批次：2

拆分触发：

- 若 47 项进度生产者需要修改两个以上独立系统，拆为数据 owner 与消费者接线 Goal。

输入资料：

- `TASK-SETTINGS-066D`、`map-service-ui-index.md` 与 `map-service.tasks`。

输出产物：

- 任务页原生显示列表、47 项数据、进度/领取事务、同日/跨日与 V6 保存。

完成定义：

- 只消费 `TASK-SETTINGS-066D` 和 `map-service.tasks`；进度生产者只接已证实的正式事件。
- 日常/活动、分页、selected/complete、领取成功/拒绝、奖励、双方数据、同日重载与跨日重置通过。

UI 原生化合同：

- 显示列表清单：直接组合原页签、tile、字段、奖励格、按钮和分页。
- 原版视觉基准：对应页面 940×590 原 SWF 逐状态基准。
- 允许的现代视觉例外：只允许用户批准的停服活动离线边界。
- 逐状态验收：页签/tile/分页/领取/奖励变化/重载/关闭。
- 差异证据：并排/叠图和对象差异清单。

验收标准：

- 专项、全系统、structure、build、annotations、workflow、diff check 与逐状态证据通过。

禁止范围：

- 不伪造停服活动、未知进度来源或在线服务，不进入下一功能组。

状态更新：

- 完成后归档本 task/Goal，检查 `TASK-SLICE-155` 收束条件并激活 `TASK-SETTINGS-067`。

推荐后续任务：

- `TASK-SETTINGS-067`。

### TASK-SLICE-156

任务类型：

- `TASK-SLICE`（Split 父任务，不直接执行）

功能条线：

- `LINE-PRE-STAGE-2-3-COMPLETION`（Active）

Goal 包：

- 无；子 task 由 `TASK-SETTINGS-067` 绑定独立 Goal。

目标机制/切片：

- `M-016`、`M-043`、`M-052`、`VS-060`

规模预算：

- 主工作包：0；父任务只聚合子任务
- 预计上下文压缩：0
- 独立验收批次：0

拆分触发：

- 固定拆为共享入口/设置页接入与正式关卡逐状态校准，不恢复为跨 owner 大任务。

输入资料：

- `TASK-SETTINGS-067` 的五入口差异矩阵。

输出产物：

- 共享 host/设置页与运行校准子 task/Goal 及父任务收束记录。

完成定义：

- 所有子 task 归档，正式关卡五入口的 owner、暂停、互斥、返回和真视觉全闭合。

UI 原生化合同：

- 显示列表清单：子 task 继承 HUD 五入口及页面根清单。
- 原版视觉基准：单/双人正式关卡五入口的 940×590 基准。
- 允许的现代视觉例外：只保留已批准的输入可访问性与 P2 法宝边界。
- 逐状态验收：normal/hover/pressed/disabled、P1/P2、暂停、互斥、关闭返回。
- 差异证据：逐入口并排/叠图和对象差异清单。

验收标准：

- 子 task 各自通过专项、全系统、build、structure 与运行视觉门禁。

禁止范围：

- 不重写既有页面业务，不用现代覆盖按钮替代真 HUD。

状态更新：

- 子 task 全部完成后更新 VS-060、本线覆盖并归档父任务。

推荐后续任务：

- 由 `TASK-SETTINGS-067` 选择首个实现子 task。

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

- 固定至少按 Stage 1-1、1-2、1-3 拆分；任一关卡仍跨两个以上独立资源族时继续拆分。

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

- 由 `TASK-SETTINGS-068` 选择 Stage 1-1 子 task。

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

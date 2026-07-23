# 游戏任务看板

本文只记录未完成的游戏复现 task。完整系统范围和激活状态以 `docs/tasks/feature-lines.md` 为准；一次 `/goal` 的边界以 `docs/tasks/goal-board.md` 为准；task 是最小验收单位。完成 task 或 Goal 都不等于完成功能条线。

## 当前推荐

`TASK-SLICE-150A` 是唯一当前推荐，属于唯一 `Active` Goal `GOAL-021` 和 `LINE-STAGE-2-2`。本 Goal 只接入 Stage 2-2 真场景、layout/traversal 与 9 个火焰机关，不进入波次、Boss、结果保存或完整运行校准。

## 待完成任务

| Task | 状态 | Goal | 功能条线 | 类型 | 目标 | 目标机制/切片 | 输出 | 下一步 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| TASK-SLICE-150 | Split | — | LINE-STAGE-2-2 | 过大父任务 | 原计划一次完成 Stage 2-2 全部实现与校准 | M-026、M-027、M-030、M-035、M-044、VS-056 | 已按 PG-008 拆为 `150A..150D` | 依次执行同线四个子 task |
| TASK-SLICE-150A | Ready | GOAL-021 | LINE-STAGE-2-2 | 场景/机关接入 | 接入真场景、layout/traversal 和 9 火焰 | M-026、M-027、M-035、VS-056 | 7 条场景资源、Stage22 layout/traversal/fire owners 与局部视觉验收 | TASK-SLICE-150B |
| TASK-SLICE-150B | Planned | GOAL-022 | LINE-STAGE-2-2 | 普通流程接入 | 接入五停点、25 点、54 怪定义与 1P/2P 普通流程 | M-027、M-030、M-044、VS-056 | wave/flow、共享普通怪、6/8 上限、失败与正式入口 | TASK-SLICE-150C |
| TASK-SLICE-150C | Planned | GOAL-023 | LINE-STAGE-2-2 | Boss/结果接入 | 接入 Monster16 真视觉/六攻击、显门、胜利和 2-3 保存 | M-030、M-035、M-044、VS-056 | Monster16 behavior/native visual、门/结果 bridge、V4 2-3 | TASK-SLICE-150D |
| TASK-SLICE-150D | Planned | GOAL-024 | LINE-STAGE-2-2 | 运行校准 | 完成 940×590 1P/2P 全流程校准和关闭裁决 | M-026、M-027、M-030、M-035、M-044、VS-056 | 全旅程证据、重载/console、覆盖差异与关线裁决 | 关闭本线或生成同线最小后续 |

## 任务完成定义

### TASK-SLICE-150

任务类型：

- `TASK-SLICE`（Split 父任务，不直接执行）

功能条线：

- `LINE-STAGE-2-2`（Active）

Goal 包：

- `—`（Split 父任务不占 Goal）

目标机制/切片：

- `M-026`、`M-027`、`M-030`、`M-035`、`M-044`、`VS-056`

规模预算：

- 主工作包：0
- 预计上下文压缩：0
- 独立验收批次：0

拆分触发：

- 已触发：原定义同时包含资源/场景、波次/普通怪、Boss/结果和全流程验收四个独立工作包，现拆为 `150A..150D`。

输入资料：

- `PG-008` 与原 `TASK-SLICE-150` 定义。

输出产物：

- 四个同线串行子 task/Goal。

完成定义：

- 父任务只保留拆分追踪，不直接完成实现。

验收标准：

- 工作流校验确认父任务为 `Split`、不占 Goal，只有 `150A` Ready。

UI 原生化合同：

- 显示列表清单：由 `150A/150C/150D` 分别承接。
- 原版视觉基准：由子 task 消费 `level22.swf` / `assets/2.swf`。
- 允许的现代视觉例外：空清单。
- 逐状态验收：由四个子 task 分段完成。
- 差异证据：由 `150D` 汇总。

禁止范围：

- 不直接执行父任务，不把子 task 重新合并。

状态更新：

- 保持 `Split`，直到四个子 task 归档后随功能线历史统一收束。

推荐后续任务：

- `TASK-SLICE-150A`。

### TASK-SLICE-150A

任务类型：

- `TASK-SLICE`

功能条线：

- `LINE-STAGE-2-2`（Active）

Goal 包：

- `GOAL-021`（Active）

目标机制/切片：

- `M-026`、`M-027`、`M-035`、`VS-056`

规模预算：

- 主工作包：2
- 预计上下文压缩：0
- 独立验收批次：2

拆分触发：

- 若需要实现刷怪/Monster16/结果保存，或发现第二种未记录机关资料族，立即拆到后续 Goal，不扩张本 task。

输入资料：

- `levels-index.md` Stage 2-2 场景/墙/平台/火焰合同、`stage22.csv` 的 7 条场景资源、`src-boundaries.md`。
- Stage 2-1 layout/traversal/ice owner 作为共享结构参考；修改既有 `src/` 前运行 `npm run check:structure`。

输出产物：

- 选择性接入 layout、midground、foreground、bg22、floorBg2、door 和 FireThron 资源，注册 manifest/provenance。
- 新增 Stage22 layout/traversal/fire owner；地面顶、3+1 墙、3 平台、5 停点边界和 9 火焰坐标由权威数据驱动。
- 建立不暴露正式空关卡的 DEV-only 场景视觉/遍历验收入口；正式地图入口留给 `150B`。

完成定义：

- 真场景层级、世界坐标、移动/平台和 9 火焰 idle/触发/伤害/循环可独立运行；没有怪物、Boss 或结果占位。
- 本 task 不创建波次状态机，不改变 2-2/2-3 存档。

验收标准：

- Stage22 layout/fire 专项、`test:systems`、build、annotations、workflow 和 diff check 通过。
- 940×590 验收真场景层级、三平台、左右边界与至少三处代表火焰的 idle/触发/循环；console 无 warning/error。

UI 原生化合同：

- 显示列表清单：character 64 根、32 背景容器、36 中景、34 前景/地面、31 火焰和 63 隐藏门；记录父子层级、原点、缩放与可见性。
- 原版视觉基准：恢复 `level22.swf` / `assets/2.swf` 的选择性 SVG/PNG、XML 时间轴与 940×590 舞台。
- 允许的现代视觉例外：仅 DEV-only、默认不可见的验收控制；玩家可见替代层为空。
- 逐状态验收：场景静态、行走/跳跃/单向平台、火焰 idle/trigger/active/loop、销毁重建。
- 差异证据：世界原点/注册点叠图、对象清单与 940×590 截图。

禁止范围：

- 不实现波次、普通怪、Monster16、显门、胜利或保存；不进入 Stage 2-3。
- 不修改 legacy extraction，不全量导出，不复制 Stage 2-1 怪物资源。

状态更新：

- 更新 7 条场景标注、覆盖台账、M-026/027/035、Goal/task/history 和 PG-003/004/005/008 适用样本。

推荐后续任务：

- `TASK-SLICE-150B`。

### TASK-SLICE-150B

任务类型：

- `TASK-SLICE`

功能条线：

- `LINE-STAGE-2-2`（Active）

Goal 包：

- `GOAL-022`（Planned）

目标机制/切片：

- `M-027`、`M-030`、`M-044`、`VS-056`

规模预算：

- 主工作包：2
- 预计上下文压缩：0
- 独立验收批次：2

拆分触发：

- 若普通怪需要新增 Stage 2-1 之外的视觉/战斗 owner，或验收必须进入 Monster16 技能/胜利保存，立即留给 `150C`。

输入资料：

- Stage 2-2 五停点/25 点/54 怪合同；`150A` 的 layout/traversal/fire 产物。
- Stage 2-1 flow/combat/reward/native visual owners 与 Monster9/10/19 真资源。

输出产物：

- 五停点 `11/13/13/16/1`、1P/2P 同屏 6/8、delay/interval、锁屏/放行和普通怪共享战斗/奖励。
- 正式 2-2 地图入口、1P/2P 创建、普通流程失败/返回/重载；末批只建立 Boss 交接边界，不创建占位 Boss。

完成定义：

- 前四停点可用 Monster9/10/19 真视觉完整推进；第五停点稳定进入 `awaiting-boss` 交接态。
- 全员失败不推进存档；场景重建不残留波次、输入、HUD 或奖励状态。

验收标准：

- 波次数量、6/8 上限、定时、奖励幂等、失败/重载专项与全系统/build 通过。
- 940×590 覆盖 1P/2P、前四停点、火焰与普通怪组合、第五停点交接、失败返回；console 无 warning/error。

UI 原生化合同：

- 显示列表清单：复用 `150A` 场景层和既有正式 HUD；Monster9/10/19 只消费 Stage 2-1 真 atlas/攻击对象。
- 原版视觉基准：Stage 2-2 世界坐标与 Stage 2-1 已关闭的三普通怪逐状态证据。
- 允许的现代视觉例外：`awaiting-boss` 仅为内部状态，不显示现代占位；其他可见例外为空。
- 逐状态验收：五停点 pending/active/cleared/awaiting-boss，1P/2P 普通怪动作、失败和重载。
- 差异证据：刷怪坐标快照、对象差异清单和 940×590 各停点截图。

禁止范围：

- 不实现 Monster16、六攻击对象、显门、胜利或 2-3 保存；不复制普通怪资源。

状态更新：

- 更新覆盖台账、VS-056、M-027/030/044、Goal/task/history 和 PG-002/003/004/005/006/008 样本。

推荐后续任务：

- `TASK-SLICE-150C`。

### TASK-SLICE-150C

任务类型：

- `TASK-SLICE`

功能条线：

- `LINE-STAGE-2-2`（Active）

Goal 包：

- `GOAL-023`（Planned）

目标机制/切片：

- `M-030`、`M-035`、`M-044`、`VS-056`

规模预算：

- 主工作包：2
- 预计上下文压缩：0
- 独立验收批次：2

拆分触发：

- 若 Monster16 需要重构共享战斗/弹体库，或全流程验收发现非 Boss 局部问题，停止并留给 `150D` 或同线修复 Goal。

输入资料：

- Monster16 24189 HP、8 动作/36 帧、六攻击/104 帧、技能 tick/注册点、死亡显门和 2-3 保存合同。
- `150A/150B` 产物与 Stage 2-1 native visual/combat/reward owners。

输出产物：

- 接入 Monster16 atlas 与六攻击对象；实现专属动作/技能事件、跟随 Bullet3 生命周期、死亡动画和奖励幂等。
- 接入隐藏门显示、按上胜利、失败/胜利结果、返回和当前槽幂等保存 2-3。

完成定义：

- 第五停点生成真 Monster16；八动作和六攻击对象无占位，死亡后显门，胜利保存 2-3。
- 结果、奖励、攻击对象和 view 销毁均幂等；重载不重复奖励或升级进度。

验收标准：

- Boss 数值、动作 tick、六攻击注册点/生命周期、死亡显门、胜利/失败/保存 round-trip 专项与全系统/build 通过。
- 940×590 覆盖 Monster16 左右向 wait/walk/hurt/hit1..4/dead、六攻击、显门和胜利页；console 无 warning/error。

UI 原生化合同：

- 显示列表清单：Monster16 atlas、六攻击对象、character 63 门与既有结果/HUD owner；记录动态创建、层级、原点和销毁。
- 原版视觉基准：assets/2 character 6/235/229/225/191/160/143、level22 character 63 和 940×590 舞台。
- 允许的现代视觉例外：空清单；不得增加圆、标签、辉光或额外命中特效。
- 逐状态验收：Boss 八动作双朝向、六攻击生命周期、死亡、门 hidden/visible、失败/胜利/返回/重载。
- 差异证据：36/104 帧合同测试、注册点叠图和逐状态截图。

禁止范围：

- 不重构全局怪物/弹体库，不进入 Stage 2-3 场景，不代替 `150D` 做完整五停点校准。

状态更新：

- 更新 7 条 Boss/攻击标注、覆盖台账、VS-056、M-030/035/044、Goal/task/history 和 PG-002/004/005/006/008 样本。

推荐后续任务：

- `TASK-SLICE-150D`。

### TASK-SLICE-150D

任务类型：

- `TASK-SLICE`

功能条线：

- `LINE-STAGE-2-2`（Active）

Goal 包：

- `GOAL-024`（Planned）

目标机制/切片：

- `M-026`、`M-027`、`M-030`、`M-035`、`M-044`、`VS-056`

规模预算：

- 主工作包：1
- 预计上下文压缩：0
- 独立验收批次：2

拆分触发：

- 若校准发现需要新增资料族、重构 owner 或修复两个以上互不相关的根因，只记录反证并生成同线最小修复 Goal，不在验收 task 内扩张。

输入资料：

- `150A..150C` 全部产物、Stage 2-2 覆盖台账和六段证据矩阵。

输出产物：

- 自动全旅程与 940×590 1P/2P 五停点、火焰、Boss、结果、返回、重载和 2-3 保存证据。
- 资源标注 `ready` 裁决、console/生命周期审计、覆盖差异和功能线关闭或后续修复结论。

完成定义：

- 只在全部关闭检查满足时关闭 `LINE-STAGE-2-2`；任何运行反证都退回同线任务，不以自动测试代替玩家可见证据。

验收标准：

- Stage 2-2 专项、全系统、structure、build、annotations、workflow、diff check 全部通过。
- 新鲜标签页完成 1P/2P 正式入口、五停点、九火焰代表状态、Monster16 八动作/六攻击、失败、胜利、返回和重载；console 无 warning/error。

UI 原生化合同：

- 显示列表清单：复核 `150A/150C` 全部静态与动态对象，确认无新增替代层。
- 原版视觉基准：Stage 2-2 六段证据、选择性派生物和 940×590 原舞台。
- 允许的现代视觉例外：仅已登记 DEV QA 控制且正式入口不可见；玩家可见例外为空。
- 逐状态验收：覆盖整关所有关键状态与 1P/2P、返回、重载。
- 差异证据：逐状态截图、对象差异清单、坐标/注册点容差说明和零 console 记录。

禁止范围：

- 不在验收 Goal 内顺手修多个独立系统；不进入 Stage 2-3 或其他功能线。

状态更新：

- 更新覆盖台账、VS-056、机制、资源标注、Goal/task/history 与 PG-002/003/004/005/006/008；据证据关闭本线或生成同线最小后续。

推荐后续任务：

- 覆盖全部闭合则关闭本线；否则只生成同线最小修复 Goal。

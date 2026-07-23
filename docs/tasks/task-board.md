# 游戏任务看板

本文只记录未完成的游戏复现 task。完整系统范围和激活状态以 `docs/tasks/feature-lines.md` 为准；一次 `/goal` 的边界以 `docs/tasks/goal-board.md` 为准；task 是最小验收单位。完成 task 或 Goal 都不等于完成功能条线。

## 当前推荐

`TASK-SLICE-150` 是唯一当前推荐，属于唯一 `Active` Goal `GOAL-021` 和 `LINE-STAGE-2-2`。严格消费已闭合的 Stage 2-2 权威合同，接入真场景、五停点、9 火焰、54 怪、Monster16 真视觉/六攻击对象、结果与 2-3 保存闭环。

## 待完成任务

| Task | 状态 | Goal | 功能条线 | 类型 | 目标 | 目标机制/切片 | 输出 | 下一步 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| TASK-SLICE-150 | Ready | GOAL-021 | LINE-STAGE-2-2 | 可玩关卡/真视觉接入 | 完成 Stage 2-2 1P/2P 正式可玩闭环与运行校准 | M-026、M-027、M-030、M-035、M-044、VS-056 | 14 条真资源、layout/traversal/fire/flow/Monster16 owners、2-3 存档、专项/全系统/build/940×590 证据 | 依据覆盖差异裁决本线关闭或生成同线最小后续 |

## 任务完成定义

### TASK-SLICE-150

任务类型：

- `TASK-SLICE`

功能条线：

- `LINE-STAGE-2-2`（Active）

Goal 包：

- `GOAL-021`（Active）

目标机制/切片：

- `M-026`、`M-027`、`M-030`、`M-035`、`M-044`、`VS-056`

输入资料：

- `docs/reverse-engineering/levels-index.md` 的“Stage 2-2 权威实现输入”、`docs/reverse-engineering/asset-annotation/annotations/stage22.csv` 与批次说明。
- `local-resources/regima/task-outputs/task-settings-063-stage22/` 的选择性 SVG/PNG、Boss/攻击对象几何表；恢复 SWF 只作精确复核。
- Stage 2-1 已完成的 layout/traversal/flow/combat/native-visual owners 与 Monster9/10/19 真资源，作为共享结构和复用边界。
- `docs/architecture/src-boundaries.md`、`docs/workflow/code-quality-gates.md`；修改任何既有 `src/` 文件前先运行 `npm run check:structure`。

输出产物：

- 将 Stage 2-2 的 14 条 `derived-ready` 真资源选择性接入 `public/assets/stage22/`、manifest 与加载场景；复用 Stage 2-1 的 Monster9/10/19，不复制同名资源。
- 新增或扩展独立 Stage 2-2 layout、traversal、fire hazard、flow、Monster16 behavior/native visual 与 scene/result bridge，保持共享 owner 边界。
- 实现五停点 11/13/13/16/1 共 54 怪、1P/2P 6/8 上限、9 火焰、Monster16 八动作/六攻击对象、死亡显门、失败/胜利/返回/重载和 2-3 当前槽保存。
- 产出确定性专项、全系统/build 结果和 940×590 1P/2P 逐状态运行证据。

UI 原生化合同：

- 显示列表清单：按 level22 character 64 根、32 背景容器、36 中景、34 前景/地面、31 火焰、63 门、Monster16 atlas 与六攻击对象记录父子层级、世界原点、注册点、缩放与动态可见性；HUD 继续使用既有正式 owner。
- 原版视觉基准：以恢复 `level22.swf` / `assets/2.swf` 的选择性 SVG/PNG、XML 时间轴和 940×590 主舞台为基准；逐停点、火焰触发、Boss 八动作、六攻击和门显示均需运行截图或逐状态观察。
- 允许的现代视觉例外：空清单；未经用户批准不得叠加现代矩形、圆、标签、辉光、额外命中特效或其他可见替代层。仅 DEV-only、默认不可见的 QA 控制可按现有规则保留。
- 逐状态验收：1P/2P 进入；五停点锁屏/放行；九火焰 idle/触发/命中/循环；Monster9/10/19 既有动作；Monster16 wait/walk/hurt/dead/hit1..4 左右向；六攻击生命周期；Boss 死亡显门；失败、胜利、返回、重载和 2-3 进度。
- 差异证据：以世界原点/注册点叠图、对象差异清单和 940×590 截图记录偏差；允许的数值容差只用于浏览器缩放/抗锯齿说明，不得改写权威世界坐标。

完成定义：

- 正式地图可按存档门禁进入 Stage 2-2；1P/2P 可完整通过五停点、火焰和 Boss，按上进门胜利并幂等保存 2-3。
- 失败不推进；返回地图、重载和再次进入不残留 scene、输入、怪物、攻击对象、火焰或 HUD 生命周期。
- Monster16 八动作、六攻击对象、FireThron 130 帧和 14 条视觉资源直接消费真素材；无玩家可见占位。
- 覆盖台账全部关闭项有自动与运行证据；若仍有缺口，只能生成同线最小后续 task，不得切线。

验收标准：

- `npm run check:structure`、Stage 2-2 专项、`npm run test:systems`、`npm run build`、`npm run check:annotations`、`npm run check:workflow`、`git diff --check` 通过；既有 warning 必须区分于本 task 新增问题。
- 确定性测试覆盖 5 停点/25 点/54 怪、6/8 上限、火焰触发/每玩家去重/伤害范围、Boss 数值/技能 tick/对象生命周期、显门、失败不保存和胜利 2-3 round-trip。
- 内置浏览器 940×590 正式入口覆盖 1P/2P、五停点、至少每类火焰状态、Monster16 八动作/六攻击、失败、胜利、返回、重载；新鲜标签页 console 无 warning/error。

禁止范围：

- 不进入 Stage 2-3、Stage 22-x、其他 UI 或全局怪物库；不借机大重构共享战斗。
- 不修改 `local-resources/regima/legacy-extraction/`，不重新全量导出恢复包，不复制 Stage 2-1 的 Monster9/10/19 资源。
- 不用现代可见层替代已存在的场景、火焰、Boss、攻击对象或门；不把 DEV QA 快捷能力暴露到正式入口。

状态更新：

- 更新 `LINE-STAGE-2-2` 覆盖台账、`VS-056`、M-026/027/030/035/044、资源标注、Goal/task/history 和适用 PG 反馈。

推荐后续任务：

- 若关闭检查全部满足，关闭 `LINE-STAGE-2-2` 并按项目路线激活下一功能线；若有缺口，只生成同线最小修复/运行校准 task。

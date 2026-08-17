# TASK-SETTINGS-193Q

任务类型：
- `TASK-SETTINGS`

功能条线：
- `LINE-PRE-STAGE-2-3-PRESENTATION`（Active；Planned）

目标机制/切片：
- `M-034`、`M-035`、`M-042`、`VS-067`

规模预算：
- 主工作包：2
- 预计上下文压缩：0
- 独立验收批次：2

拆分触发：
- 一旦范围越出 子鼠 单物种族、开始现代接入，或发现两个无法在本 task 内独立验证的恢复 owner，立即停止并拆分。

协作计划：
- 模式：单 agent
- 并行工作包：无
- 写入 owner：主 agent
- 归并检查点：不适用
- 方法观测：无

输入资料：
- `docs/reverse-engineering/pet-animation-corpus.json`、`pets-index.md`、`projectiles-index.md`、mouse1..4（1..3 共用 Bmd1，4 使用 Bmd2） 对应 AS3、恢复源 `assets/mouse.swf`。

输出产物：
- mouse1..4（1..3 共用 Bmd1，4 使用 Bmd2） 的 wait/follow、walk/warp、普攻、sc/hxfb/zsaoyi、hurt、死亡/0 HP 动作行与行为触发/销毁矩阵。
- 精确帧数/持帧、clock、注册点、局部/世界矩阵、可见/碰撞边界及恢复包 load precedence 裁决。
- Schema-valid `task-settings-193q.pet-mouse-animation` 原版机器真值 JSON、原版逐状态基准和六段证据矩阵。

完成定义：
- 真值达到 `verified`、`unresolved=[]`，全部 子鼠 body/技能对象与现代 key 一一映射；本 task 不修改 `src/` 或派生现代 atlas。

验收标准：
- 真值生成器 `--check`、Schema 校验、`npm run test:pet-animation-corpus`、`npm run check:annotations`、`npm run check:workflow`、`git diff --check` 通过。

禁止范围：
- 不处理其他物种，不用现代占位或截图反推原版，不修改 `local-resources/regima/legacy-extraction/`。

状态更新：
- 归档本 task，并仅激活 `TASK-SLICE-193R`。

推荐后续任务：
- `TASK-SLICE-193R`：直接消费本 task verified 真值接入 子鼠 真动画。


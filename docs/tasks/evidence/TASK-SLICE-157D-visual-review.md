# TASK-SLICE-157D 视觉回归记录

验收环境：2026-07-31，preview，940×590。

## 原版/既有基准

- Stage 1-1/1-2/1-3：`TASK-SLICE-157A..C` 的逐状态运行记录与 `stage1-monster-visuals-index.md`。
- Stage 2-1：`TASK-SLICE-146-1p-m9-runtime.png`、`TASK-SLICE-146-2p-m10-showcase.png`、Monster6/9/10/19 与七攻击对象逐状态证据。
- Stage 2-2：`TASK-SLICE-150C-monster16-*.png` 与六攻击对象逐状态证据。
- 允许的现代视觉例外：空清单。

## 本次证据

- `TASK-SLICE-157D-stage22-layout-1p.png`：Stage 2-2 单人正式尺寸，真场景与火焰 frame 65，console warning/error 为 0。
- `TASK-SLICE-157D-stage22-boss-hit4-2p.png`：Stage 2-2 双人 HUD 与 Monster16 hit4/right 真动画，console warning/error 为 0。
- `five-stage-monster-visual-regression-tests.ts`：Stage 1 `167/171`、Stage 2-1 `94/132`、Stage 2-2 `36/104`；全部 atlas/攻击帧唯一 owner；五关首次进入/重入幂等；六个 visual bridge 无 Arc/Text 回填。
- `stage11-resource-tests.ts`、`stage12-monster-visual-tests.ts`、`stage13-monster-visual-tests.ts`、`stage21-tests.ts`、`stage22-tests.ts`：逐动作、左右、触发 tick、死亡末帧和对象生命周期的确定性证据。

本任务是纯回归/owner 收束包，没有重新派生资源或修改玩法。Stage 1 三关和 Stage 2-1 不用入口背景截图替代既有怪物逐状态证据；本次以共享 owner/重入专项重验，并复用已经归档的运行基准。

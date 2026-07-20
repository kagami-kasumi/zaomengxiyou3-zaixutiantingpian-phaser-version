# 游戏任务看板

本文只记录未完成的游戏复现 task。完整系统范围和激活状态以 `docs/tasks/feature-lines.md` 为准；task 是功能条线内部执行单位，完成 task 不等于完成功能条线。

AI 工作流、任务体系和文档职责维护记录到 `docs/workflow/governance-log.md`。已完成游戏 task 迁移到 `docs/tasks/task-history.md`；新对话默认不读历史，除非需要追溯或修改已完成事实。

## 状态定义

- `Ready`：属于唯一 `Active` 功能线，依赖满足，可以立即执行。
- `Blocked`：属于唯一 `Active` 功能线，但当前有明确阻塞；下一步只能解除本线阻塞。
- `Planned`：功能线尚未激活或当前不是同线下一步，不得执行。
- `Split`：任务过大，已拆出同功能线子任务，不直接执行。
- `Done`：task 完成定义已满足，应移入历史；所属功能线保持激活，除非其完整关闭合同也满足。

## 当前推荐

`LINE-STAGE-1-2` 是唯一 `Active` 功能线。资源/流程逆向已闭合恢复源包、完整地图标记、五停点 46 怪普通流程、双 boss 门禁和 `fbEnter -> Stage 5-1` 特殊入口证据；当前推荐执行最小场景/布局接入 `TASK-SLICE-125`。

## 待完成任务

| Task | 状态 | 功能条线 | 类型 | 目标 | 目标机制/切片 | 输出 | 下一步 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| TASK-SLICE-125 | Ready | LINE-STAGE-1-2 | 场景/布局接入 | 接入 Stage 1-2 真场景、完整显式地图数据和已解锁入口 | M-026、M-027、M-035、VS-045 | 真资源 bundle、Stage12Layout/scene bridge、入口路由与专项测试 | 先接布局基础，再生成五停点普通流程切片 |

## 任务完成定义

### TASK-SLICE-125

任务类型：

- `TASK-SLICE`

功能条线：

- `LINE-STAGE-1-2`（当前唯一 `Active`）

目标机制/切片：

- `M-026`
- `M-027`
- `M-035`
- `VS-045`

输入资料：

- `docs/reverse-engineering/levels-index.md` 的 Stage 1-2 资源、矩阵和组合合同
- `docs/reverse-engineering/asset-annotation/annotations/stage12.csv` 与 `batches/stage12.md`
- `local-resources/regima/task-outputs/task-settings-051-stage12/` 的选择性调查派生物
- `docs/architecture/src-boundaries.md`、现有 Stage 1-1 manifest/layout/bridge/entry 与专项测试
- `docs/tasks/feature-line-coverage/LINE-STAGE-1-2.md`、`mechanics-index.md`、`vertical-slices.md`

输出产物：

- 从精确 character 选择性转换 Stage 1-2 character 25 前景、character 135 背景、character 22 `fbEnter` 与 character 52/48/51 普通门视觉；复用已接入的 `floorBg1`，不重复生成。
- 在 manifest 中为 Stage 1-2 资源登记 stable key、源包、character、tag、源尺寸/帧数和现代栅格尺寸，并提供独立 bundle/预加载入口。
- 新增独立 `Stage12Layout` 等价模块，保存 3 个 `ObsWall`、1 个 `FallDownWhenStandingWall`、5 停点、13 刷怪点、普通门和特殊入口的原始坐标/矩阵/属性；不把这些职责堆入现有结构 warning 文件。
- 新增 Stage 1-2 场景桥接，按根地面 → `sl12` 前景/交互 → `bgContainer` 背景的原版组合边界渲染，并让已解锁 1-2 能从现有玩家可见入口进入。
- 增加专项测试，核对资源存在/provenance/尺寸或帧数、标记计数与关键坐标、入口解锁门禁、1P/2P 选择和场景清理。

完成定义：

- 运行时可从现有入口选择已解锁的 1-2，并看到真地面、背景、前景、普通门和特殊入口；1-1 入口和运行时不回归。
- 3+1 墙、5 停点、13 刷怪点及两类入口数据与 `levels-index.md` 完全一致；原始旋转/缩放矩阵保留，不以目测坐标替代。
- 资源标注从 `derived-ready` 更新为 `ready`，manifest provenance 可由专项测试查询。
- 本 task 结束只把 `VS-045` 标为已完成；功能线继续 `Active`，随后生成同线五停点普通流程切片。

验收标准：

- 修改现有代码前先运行 `npm run check:structure`，对命中 warning/error 的目标先按规则拆分。
- Stage 1-2 专项测试、`npm run test:systems`、`npm run build`、`npm run check:annotations`、`npm run check:workflow` 通过。
- 不默认启动开发服务器；运行时验收在自动检查完成后按风险决定是否使用浏览器。

禁止范围：

- 不修改恢复源包或旧提取结果；只从本任务精确 character 派生到 `public/assets`。
- 不实现五停点刷怪状态机、Monster7/8/4/2 行为、双 boss 显门、普通胜利/解锁 1-3 或 `fbEnter` 五击/驻留/切 5-1 行为。
- 不扩张到 Stage 1-3 内容、Stage 5-1 内容、怪物真素材或全局菜单重构。
- 不回开已关闭的 `LINE-STAGE-1-1` / `LINE-CRAFTING`。

状态更新：

- `docs/tasks/feature-lines.md`
- `docs/tasks/feature-line-coverage/LINE-STAGE-1-2.md`
- `docs/tasks/task-board.md`
- `docs/tasks/task-history.md`
- `docs/reverse-engineering/levels-index.md`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/vertical-slices.md`
- `docs/reverse-engineering/asset-annotation/annotations/stage12.csv` 与批次记录
- `src/assets/AssetManifest.ts`、Stage 1-2 layout/bridge/entry 和专项测试

推荐后续任务：

- 依据已接入布局生成一个同线 `TASK-SLICE-*`，实现五停点 46 怪、Monster4+Monster2 双 boss 显门与普通完成/失败流程；特殊入口继续保持后续独立切片。

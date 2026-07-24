# TASK-SLICE-150B Stage 2-2 普通流程视觉验收

## 验收范围

- 940×590 正式存档槽 → 天庭地图 → 1P/2P 选择 → Stage 2-2。
- 验收五停点 `pending / active / cleared / awaiting-boss`、25 个刷怪点、Monster9/10/19 真视觉、9 个 FireThron 组合、失败/返回/重入。
- Monster16、六攻击对象、显门、胜利和 2-3 保存不属于本 Goal；第五停点只进入不可见的 `awaiting-boss` 内部交接态。

## 显示列表与原版基准复用

场景显示列表、世界原点和 FireThron 基准继续以 `TASK-SLICE-150A-visual-review.md` 为准。普通怪直接复用已由 Stage 2-1 关闭的 Monster9/10/19 atlas、攻击对象、左右镜像、动作 hold tick、注册点与脚底映射；本任务没有复制或重画怪物资源。

| 可见对象 | 原版/既有基准 | 现代映射 | 差异裁决 |
| --- | --- | --- | --- |
| Stage 2-2 背景/前中景/火焰 | level22 character 64；assets/2 character 279/3/31 | `Stage22WorldBridge` | 原资源直接复用 |
| Monster9/10/19 | Stage 2-1 已关闭的 20/20/22 帧 atlas 与三攻击对象 | `Stage21MonsterVisualSystem` / `Stage21MonsterVisualBridge` | 原资源与共享 owner 直接复用 |
| P1/P2 HUD | 已关闭的正式共享战斗 HUD | `Stage1CombatHudBridge` | 正式共享 UI 复用 |
| 玩家角色 | 全局玩家真角色素材仍未闭合 | `playerPlaceholder` | 既有公开现代占位；本任务未新增 |
| `awaiting-boss` | 内部交接状态 | 无显示对象 | 不显示 Boss、门或现代占位 |
| 1P/2P 选择、失败结果 | 已批准的现代正式流程 | HeavenMap chooser / `Stage22ResultBridge` | 现代流程例外，未覆盖原场景已有视觉 |

## 刷怪坐标与状态差异

- `Stage22Layout.stage22SpawnPoints` 精确保存 25 个实例的 `id/x/y/stopPointIdx/delay/interval/enemyType/totalNum`；五批定义数为 `11/13/13/16/1`，合计 54。
- 前四停点只创建 Monster9/10/19，共 53 只；1P/2P 同屏上限分别为 6/8，达到上限的 ready spawner 保留。
- 第五停点保留 Monster16 的第 25 个定义及 `3 + 1` 秒首只时序，但在本任务边界只切换为 `awaiting-boss`，不创建任何可见对象。
- 自动测试核对全部坐标、批次数量、时序、上限、53 次幂等击败和 2.5 秒失败门禁；运行态核对首停点三种真怪同屏、火焰组合和第五停点无占位。

## 逐状态运行证据

- 正式 2-2 地图入口：[TASK-SLICE-150B-map-entry.png](./TASK-SLICE-150B-map-entry.png)
- 1P 初始状态：[TASK-SLICE-150B-1p-start.png](./TASK-SLICE-150B-1p-start.png)
- 首停点 Monster9/10/19 真视觉：[TASK-SLICE-150B-first-wave.png](./TASK-SLICE-150B-first-wave.png)
- 第五停点 `awaiting-boss` 无占位：[TASK-SLICE-150B-awaiting-boss.png](./TASK-SLICE-150B-awaiting-boss.png)
- 2P 创建与双 HUD：[TASK-SLICE-150B-2p-start.png](./TASK-SLICE-150B-2p-start.png)
- 2P 普通流程与火焰组合：[TASK-SLICE-150B-2p-fire.png](./TASK-SLICE-150B-2p-fire.png)
- 2P 全灭失败且不推进存档：[TASK-SLICE-150B-failure.png](./TASK-SLICE-150B-failure.png)

运行观察确认：

- 正式 `2/2` 存档在现有 Stage 2 地图注册点进入 `Stage22Scene`，没有虚构第二个可见地图标记。
- 1P/2P 均由共享输入、移动、战斗、怪物物理、奖励和 HUD owner 驱动；方向键只驱动 P2。
- 第一停点可见 Monster9/10/19 真 atlas 与攻击对象；火焰仍使用当前帧真像素命中。
- 快清 QA 穿过前四停点后抵达最右 Boss 区，未出现 Monster16、门或现代占位。
- 2P 全灭 2.5 秒后显示失败页；浏览器存档仍为 `2/2`。
- 最终浏览器 console warning/error 为 0；Phaser 启动信息为普通 info。

## 可见差异清单

| 项目 | 裁决 |
| --- | --- |
| 场景、火焰、Monster9/10/19、攻击对象、HUD | 原资源/既有正式 owner 直接复用 |
| P1/P2 玩家角色 | 既有公开占位，非本任务新增 |
| 1P/2P 选择与失败结果 | 批准的现代正式流程 |
| Monster16、六攻击、门、胜利 | 未完成且无占位，留给 `TASK-SLICE-150C` |

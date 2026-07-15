# 标注批次：stage11

- 状态：已迁移，等待源符号定位
- 关闭日期：2026-07-14

## 范围和证据

- 覆盖 `sl11`、`bg11`、`floorBg1` 和 `StageListener11`。
- 证据来自 `MainGame.as`、`BaseGameSence.as`、`PhysicsWorld.as`、`StageListener11.as`、`levels-index.md` 和现代 manifest。
- 标注表：`../annotations/stage11.csv`。

## 结论

- `sl11`、`bg11`、`floorBg1` 为 `source-corpus-ready + confirmed + locate-symbol`；`levels/level11.swf` 已恢复。
- `StageListener11` 的 AS3 源码已存在，它是行为证据而不是待取得的视觉资产，因此标为 `rejected + confirmed + none`；这不表示关卡监听行为无用。
- 场景布局缺失同时意味着墙体、传送门和碰撞标记坐标缺失。

当前无需人工消歧。下一步从 `levels/level11.swf` 定位场景、背景和碰撞标记，确认精确符号后再评估选择性导出。

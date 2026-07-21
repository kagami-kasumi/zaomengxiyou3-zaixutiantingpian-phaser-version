# Stage 1-3 资源批次

## 范围

- 资源族：`sl13` 前景/布局、`bg13` 背景和普通传送门。
- 目标：为 `LINE-STAGE-1-3` 提供只含本关真场景的最小选择性导出输入。
- 排除：怪物本体、角色本体、弹体、Stage 2-1 和其他关卡资源。
- 人工输入：不需要；源包、符号和组合层级均已有直接证据。

## 证据调查

- `assets/levels/level13.swf` 的 SymbolClass 直接映射 character 41 → `export.gameSence.sl13`；其时间轴含 character 13 前景、3+1 墙、5 停点、14 刷怪点和 character 40 门。
- `assets/1.swf` 的 SymbolClass 直接映射 character 119 → `bg13`；它包裹 character 118 单帧背景。
- `BaseGameSence` 在运行时把 `bg13` 以局部 `x=-20` 加入 `sl13.bgContainer`；本关 `bgContainer` 位于 `(0,0)`。
- `StageListener13` 只提供行为注册列表，不是视觉资源。

## 当前去向

- 3 个真视觉条目均已转为 `ready + none`，接入 `public/assets/stage/stage1-3/` 和 `Stage13AssetKeys`。
- 监听器条目为 `rejected + none`，继续仅作 AS3 行为证据。
- `TASK-SLICE-129` 已只选择性导出并接入这 3 个场景资源族；没有扩张到怪物或角色真素材。

## 批次汇总

- confirmed：4。
- probable / unknown：0。
- 已接入：3；缺原资源：0；需人工消歧：0。

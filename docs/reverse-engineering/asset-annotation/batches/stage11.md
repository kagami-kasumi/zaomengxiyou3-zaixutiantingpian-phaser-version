# 标注批次：stage11

- 状态：已定位，等待选择性派生与接入
- 关闭日期：2026-07-19

## 范围和证据

- 覆盖 `sl11`、`bg11`、`floorBg1` 和 `StageListener11`。
- 证据来自 `MainGame.as`、`BaseGameSence.as`、`PhysicsWorld.as`、`StageListener11.as`、`levels-index.md` 和现代 manifest。
- 标注表：`../annotations/stage11.csv`。

## 结论

- `sl11` 为 `assets/levels/level11.swf` character 46（`DefineSprite` tag 39，1 帧，边界 1297.2×2970.45）。它包含空的 `bgContainer`、20 个墙体标记和 1 个传送门实例；传送门外层是 1 帧容器，内部含 20/19 帧动画子时间轴。
- `bg11` 不在 `level11.swf`，而是 `assets/1.swf` character 141（`DefineSprite` tag 39，1 帧，1132×3051），内部为 character 140 `DefineShape`，再引用 character 139 `DefineBitsJPEG2`。
- `floorBg1` 同样位于 `assets/1.swf`，直接映射到 character 1 `DefineBitsJPEG2`（1440×690），没有 MovieClip 时间轴。
- 三条视觉记录均更新为 `export-ready + confirmed + export-selectively`。本批只生成 SymbolClass CSV 和三个精确 character 的最小 SVG/JPEG 调查证据，未把调查派生物视为现代接入产物。
- `StageListener11` 的 AS3 源码已存在，它是行为证据而不是待取得的视觉资产，因此标为 `rejected + confirmed + none`；这不表示关卡监听行为无用。
- `MainGame.createFloorBg()` 先把 `floorBg1` 包成 Bitmap 加到根节点；随后创建 `sl11`；`BaseGameSence` 再实例化 `bg11` 并以 `x = -20` 动态加入 `sl11.bgContainer`。因此布局、背景和地面是运行时组合关系，不是单 SWF 内的静态嵌套。

当前无需人工消歧。下一步按精确 character 选择性派生前景/背景/地面和布局数据，再注册到现代资源 manifest；不得整包导出两个 SWF。

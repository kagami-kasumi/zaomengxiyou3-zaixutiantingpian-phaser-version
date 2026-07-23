# Stage 2-1 资源批次

## 范围

- 资源族：`sl21` 场景/布局、`bg21` 背景、`floorBg2`、普通传送门和 `IceThron` 冰刺。
- 目标：为 `LINE-STAGE-2-1` 的首个可玩实现 Goal 提供可追溯的真场景、几何和选择性派生输入。
- 排除：Monster6/9/10/19 本体动作图集、角色本体、弹体、Stage 2-2 及其他关卡资源。
- 人工输入：不需要；源包、SymbolClass、时间轴、AS3 行为和组合层级均有直接证据。

## 证据调查

- `assets/levels/level21.swf` 的 SymbolClass 直接映射 character 49 → `export.gameSence.sl21`、character 16 → `export.mapObject.IceThron`。
- character 49 单帧标签为 `2-1`，包含 character 19/21 可见场景层、3 个 `ObsWall`、1 个 `FallDownWhenStandingWall`、4 个 `ThroughWall`、5 个 `StopPoint`、25 个 `MonsterAppearPoint`、38 个 character 16 冰刺和 character 48 普通门。
- `assets/2.swf` 的 SymbolClass 直接映射 character 282 → `bg21`、character 3 → `floorBg2`。`BaseGameSence` 在运行时把 `bg21` 以局部 `x=-20` 加入位于 `(0.25,0)` 的 `bgContainer`；`MainGame.createFloorBg()` 在创建 `sl21` 前创建根地面。
- `StageListener21` 只从直属 child 收集带 `isIceThron` 标记的对象并逐帧调用 `step()`；`IceThron.as` 提供专属伤害与动画触发合同。

## 选择性派生

- 调查产物位于 Git 忽略的 `local-resources/regima/task-outputs/task-settings-053-stage21/`。
- 已派生 character 19/21 SVG、character 48 门首帧、character 16 全 66 帧、character 282 背景首帧和 character 3 地面 PNG。
- `IceThron` 导出画布为 59×588：帧 1 的冰锥位于注册点上端，帧 2..32 向下运动，帧 33..66 透明，播放回帧 1 后由帧脚本停止。
- 门首帧导出为 196×175；无滤镜的嵌套时间轴边界为局部 `x=-83.75..83.25`、`y=-109.15..54.3`，后续现代原点映射必须保留这一区别。

## 当前去向

- `sl21` 根布局保持 `export-ready + export-selectively`：实现时不能把调试标记、碰撞对象和全部动态 child 扁平当作可见背景。
- 两层场景形状、背景、根地面、普通门和冰刺均为 `derived-ready + integrate`。
- Monster6/9/10/19 真动作与弹体不在本批次；首个可玩实现只可明确使用既有怪物占位表现，不能宣称怪物视觉已复现。

## 批次汇总

- confirmed：7。
- probable / unknown：0。
- derived-ready：6；export-ready：1；missing-original：0；需人工消歧：0。

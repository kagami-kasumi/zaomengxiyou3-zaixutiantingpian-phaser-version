# 角色移动索引

本文记录 `TASK-SETTINGS-006` 范围内已经足够支撑首个移动切片的事实：方向输入、跑步判定、跳跃/双跳、`S+K` 下落平台，以及首批实现时应保留和暂缓的边界。

## 证据入口

- `extracted_flash/resources_by_swf/[172845].swf/scripts/base/BaseHero.as`
- `extracted_flash/resources_by_swf/[172845].swf/scripts/base/BaseObject.as`
- `extracted_flash/resources_by_swf/[172845].swf/scripts/World/PhysicsWorld.as`
- `extracted_flash/resources_by_swf/[172845].swf/scripts/export/hero/Role1.as` 至 `Role5.as`
- `extracted_flash/resources_by_swf/[172845].swf/scripts/export/ThroughWall.as`
- `extracted_flash/resources_by_swf/[172845].swf/scripts/export/ThroughUpButDownWall.as`
- `extracted_flash/resources_by_swf/[172845].swf/scripts/export/FallDownWhenStandingWall.as`
- `docs/reverse-engineering/roles-index.md`

## 输入与动作入口

方向键不走 `keyarray`：

- 左右方向在 `BaseHero.__keyBoardDown()` 中直接调用 `moveLeft()` / `moveRight()`。
- P1 方向键仍是 `A/D`，P2 是方向键；这和 `controls-index.md`、当前 `InputSystem.ts` 一致。
- `keyarray[2]` 的跳跃键触发 `keyStr == "0010"`，五个角色都会调 `jump()`。
- `keyarray[0] + keyarray[2]` 的 `S+K` 组合触发 `keyStr == "1010"`，五个角色都会调 `getFallDown()`。

五角色在 `myKeyDown()` 里的移动入口基本一致：

| 组合键 | 入口 | 共同条件 |
| --- | --- | --- |
| `0010` | `jump()` | 正在攻击或受击时不触发 |
| `1010` | `getFallDown()` | 正在攻击或受击时不触发 |
| `0110` | 吞掉本次输入 | 不触发新动作 |

唯一和首批移动实现相关的角色特例是白龙：

- `Role5` 在 `hit29` 中仍允许跳跃。
- 除这个技能态外，白龙的普通跳跃逻辑和 `BaseHero.jump()` 基本相同。

## 行走与跑步

### 速度

基础默认值来自 `BaseObject`：

- 普通横移速度 `horizenSpeed = 5`
- 跑步速度 `horizenRunSpeed = 10`

角色覆写：

| 角色 | 行走速度 | 跑步速度 |
| --- | --- | --- |
| Role1 至 Role4 | `6` | 继承默认 `10` |
| Role5 枪形态 | `6` | `10` |
| Role5 剑形态 | `7` | `11` |

`setSpeed()` 每帧按 `isRunning()` 选择 `horizenSpeed` 或 `horizenRunSpeed`。`iswor()` 则把显示动作切到 `walk` 或 `run`。

### 显示资源约束

后续接真 CG 时，`walk` 和 `run` 不能共用同一套移动动画后只改播放速度：

- `Role1` 至 `Role4` 的 `setAction()` 都把 `walk` 指到位图表第 `2` 行、`run` 指到第 `3` 行，说明它们在同一资源表内也是两套独立动作帧。
- `Role5` 更明确，直接分别加载 `walk_spear/walk_sword` 与 `run_spear/run_sword`。
- 因此现代侧至少要保留 `walk`、`run` 两个独立 animation key；就算占位阶段复用同一张图，真素材接入时也不能把两者合并成“同一 CG + 不同速度”。

### 双击跑步判定

`BaseHero.addDoubleCount(keyCode)` 的规则可以直接落实现：

1. 必须是同一个方向键再次按下。
2. 中间要发生过新的键事件，代码用 `keyId != lastKey.keyId` 排除一直按住不放。
3. 两次按下间隔小于 `500 ms` 时，`doubleCount = 1`。
4. 间隔达到或超过 `500 ms`，或切换到别的键，`doubleCount = 0`。
5. 左右方向键抬起时，`__keyBoardUp()` 也会把 `doubleCount` 清零。

因此原版的“跑”不是持续锁存状态，而是“第二次同向按下后，在该方向仍按住期间进入跑步”。这点对手感很重要：

- 第一次按住：`walk`
- 松开后在 `500 ms` 内同向再按：`run`
- 第二次方向键松开：立刻回到非跑步状态

## 跳跃

### 通用规则

`BaseHero.jump()` 足够直接支持首切片：

1. 只有不在攻击、也不在受击时才响应。
2. `jumpCount < 2` 时允许起跳。
3. 每次跳跃都把 `speed.y` 设为 `jumpPower`，而 `jumpPower = -20`。
4. `jumpCount == 0` 时：
   - 设为 `1`
   - 动作切到 `jump1`
5. `jumpCount == 1` 时：
   - 设为 `2`
   - 动作切到 `jump2`
6. 当 `curAction == "jump1"` 且竖直速度转为向下时，`BaseHero.step()` 会把动作切到 `jump3`，也就是下落态。
7. 落地由 `BaseObject.getDownFloor()` 收束：
   - 若仍有方向输入，回到 `walk` 或 `run`
   - 否则回到 `wait`
   - `jumpCount` 重置为 `0`

这已经把首个现代切片需要的“地面起跳、二段跳、下落态、落地复位”闭合了。

### 水中分支

当 `jumpCount == 2` 且 `gc.isInSea()` 为真时，原版允许再次把 `speed.y` 设为 `jumpPower` 并继续保持 `jump2`。这是水中移动，不属于首个移动切片必须实现的部分。

## 下落平台

### 已确认的平台标记

`PhysicsWorld.addSubObj()` 会把以下带标记对象都归入墙体数组：

| 标记/类 | 已确认行为 |
| --- | --- |
| 普通 `Wall` | 常规实体墙 |
| `ThroughWall` / `isThroughWall` | 可从上方站立；忽略头顶和侧面碰撞；`S+K` 可主动下穿 |
| `ThroughUpButDownWall` / `isThroughUpButDownWall` | 可从下方穿过、从上方落住；不响应 `S+K` 下穿 |
| `FallDownWhenStandingWall` / `isThroughDownButUpWall` | 从 `nearToWall()` 可见它不会作为上方落脚面；当前未看到它被 `getFallDown()` 使用，名字和实际入口不完全一致 |

### `S+K` 的真实条件

`BaseObject.getFallDown()` 的条件非常窄：

- 只有当前 `standInObj` 存在，并且它带 `isThroughWall` 标记时才生效。
- 生效后：
  - `y += 20`
  - 动作切到 `jump1`
  - `jumpCount = 1`

也就是说，首个移动切片里的“下落平台”应该先只实现 `ThroughWall` 这一种，不要把所有单向平台都默认做成可下穿。

## 首切片所需事实

`VS-003` 现在已经有足够依据进入实现，建议首批只覆盖 Role2：

| 目标 | 可直接采用的原版事实 |
| --- | --- |
| 行走 | `A/D`；Role2 横移速度 `6` |
| 跑步 | 同向双击窗口 `< 500 ms`；跑步速度 `10`；第二次按住期间维持 |
| 跳跃 | `K`；`jumpPower = -20`；最多两段 |
| 下落 | `S+K`；仅在 `ThroughWall` 上可触发 |
| 状态 | `wait`、`walk`、`run`、`jump1`、`jump2`、`jump3` |

建议的首批现代实现边界：

- 只做一个可控 Role2 等价角色。
- 只做最小地面和一个 `ThroughWall` 测试平台，不等真实 `1-1` 地图素材。
- 保留 P2 输入结构，但本切片可以先只生成 P1。
- 先不做水中浮力、移动平台、无双加速、白龙剑形态速度差和白龙 `hit29` 特例。

## 仍可后置的点

- `FallDownWhenStandingWall` 的命名与当前已见入口不一致，后续若要完整还原关卡平台库，需要结合实际关卡时间轴或录屏再确认。
- `ThroughWall` 的落地判定在原版里对 `ThroughWall` 有特判，不要求横向重叠分支和普通墙完全一致；首切片可以先按现代碰撞实现稳定行为，后续再用原版实测校准。
- 海中移动、移动平台速度继承和 buff/debuff 对速度的倍率变化已经能在代码里看到，但不应挤进首个移动切片。
- 角色真素材接入时必须校对 `walk` 与 `run` 两套动作帧，而不是只校对速度差。

## 现代实现建议

- 不要复刻 `doubleCount` 这个裸状态名；现代侧更适合记录最近一次方向按下时间和当前方向键边沿。
- 输入层保留结构化 `PlayerInputState`，角色控制器再把它解释成 `walk/run/jump/drop-through` intent。
- 角色状态机至少显式区分 `grounded`、`airborne`、`jumpCount` 和 `dropThroughRequested`，这样后续接普攻、受击和平台逻辑时不会再把 Flash 的字符串状态重新长回来。



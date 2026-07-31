# Role1 悟空战斗视觉索引

本文闭合 `TASK-SETTINGS-069A` 的逆向输入。范围只含 Role1 本体/装备、影分身、普攻、已实现技能及既有战斗 HUD；行为完成与视觉完成分列，现代接入仍由 `TASK-SLICE-158A` 承担。

## 来源与资源 owner

| 来源 | 确认事实 |
| --- | --- |
| `assets/WuKong.swf` | Role1 本体、装备、影分身、普攻和除 `lyfb` 两对象外的技能对象；SHA-256 `61E71B...FDEA3` |
| `assets/SpecialUI/WuKong.swf` | 与 `assets/WuKong.swf` 字节完全相同，不是独立 UI owner |
| `assets/Role1Effect.swf` | `Role1Bullet8_1/8_2`；SHA-256 `743E00...17AD` |
| 战斗 HUD | 复用 `combat-hud-index.md` 已闭合的 `OtherMat1.swf` character 574/505/510 与五入口按钮，不重复归属到角色包 |

所有 14 个 `ROLE1_*` 本体和 10 个 `ROLE1_EQUIP_*` 装备表均为 1200×2800，即 6×14 个 200×200 cell；同一 cell 内身体与装备等深叠放。`ROLE1_SHALLDOW` 为 1000×600，即 5×3 个 200×200 cell。

## 本体动作合同

`Role1.initBBDC()` 以 `BaseBitmapDataClip([body,equip], 200, 200)` 组合两层；普通 offset `(5,-15)`，`hit14` 为 `(5,-30)`。水平翻转由 `BaseBitmapDataPool` 的镜像整表承担：向左 origin `(0.525,0.575)`，向右 `(0.475,0.575)`；`hit14` 的 originY 为 `0.65`。

| 行/动作 | cell/hold tick | 循环或结束 |
| --- | --- | --- |
| 0 `wait` | 6 / `2,2,2,3,2,4`，36 次变化 | 与 `wait2` 交替 |
| 1 `wait2` | 2 / `5,5`，8 次变化 | 回 `wait` |
| 2 `walk` | 4 / `4,4,4,4` | 循环 |
| 3 `run` | 4 / `2,2,2,2` | 循环 |
| 4 | `jump1,jump3,hit9,hit10,hit11_1,hit11_2` / `1,1,13,100,35,35` | 跳跃或技能回调结束 |
| 5 `jump2` | 5 / 每格 2 | 转 `jump3` |
| 6..11 | `hit1/2` 9 tick；`hit3/4` 各 9；`hit5/6` 各 11；`hit8` 10 | 回 wait/jump3 |
| 12 | `hit12,hit7,hurt,hit13` / `17,15,15,10` | 回 wait/jump3 |
| 13 `hit14` | 3 / `2,12,16`，共 30 tick | 回 wait/jump3 |

原版无 Role1 death Symbol：死亡由 `BaseHero` 立即 `destroy()` 并派发 `heroDead`。158A 不得把现代 alpha/tint 占位冒充死亡动画；应按此移除合同实现，除非另有原版反证。

## 普攻、技能与附属对象矩阵

下表 bounds 为所有 SVG 帧相对注册点的并集 `(left,top,right,bottom)`；帧数来自选择性导出的 MovieClip 时间轴。

| 动作 | 本体/创建时机 | 对象（包/id/帧） | bounds / 生命周期 |
| --- | --- | --- | --- |
| `hit1/2` | row6 x2，remaining=1 | `Role1Bullet1`，WuKong/181/8 | `(-40,-25,167,64)`；跟随对象 |
| `hit3` | row7 x0，remaining=1 | `Role1Bullet3`，222/11 | `(-208.45,-53.25,170.75,241.7)`；跟随对象 |
| `hit4` | row8 x0，remaining=1 | `Role1Bullet4`，199/4 | `(-15.95,-18.65,362.15,63.5)`；跟随对象 |
| `hit5` | row9 x2，remaining=1 | `Role1Bullet5`，190/4 | `(-70.5,-6.95,319.2,65.05)`；跟随对象 |
| `slz` | `hit6` | Bullet6，67/6 | `(-83.5,-181.45,166.65,4.05)`；末帧销毁 |
| `hytj` | `hit7` | Bullet7，289/15 | `(-1.35,9.3,288,98.4)`；末帧销毁 |
| `lyfb` | `hit8`，本体与分身复用 | Bullet8_1，Role1Effect/305/12；Bullet8_2，252/13 | `(-127.65,-128.65,131.3,34.35)`；`(-171.5,-304,166,56)`；后者关闭末帧销毁并移动 600 |
| `lys` | `hit9`，本体隐藏 | Bullet9，WuKong/99/10 | `(-109.1,-73.85,335.9,171.15)`；结束恢复本体/重力 |
| `hmz` | `hit10` | Bullet10_2，149/25 → `Role1Bullet10_4_tmp`，164/14 | `(-258.85,-243,278.5,203.7)` → `(-161.8,-227.45,167.2,72.05)`；回调链结束。128/228/235 均非本地 Role1 链 |
| `jdy` | `hit11_1/2` | Bullet11_1，311/35 → Bullet11_2，312/35 | `(-49.1,24.15,187.3,206.4)`；`(-122.75,-52.65,87.1,170.65)`；动作结束统一清理 |
| `hyjj` | `hit12` count17 | Bullet12_1_1，348/14；12_1_2，318/17；命中 Bullet12，42/15×4 | 前两者末帧脚本自移除并 stop；bounds 分别 `(-16.2,-14.55,10.45,13.35)`、`(-596.8,-233.35,746,311.15)`；命中对象 `(-84.9,-81.95,81.1,81.05)`，间隔 1.2s |
| `qsez` | `hit13`，碰撞后本体隐藏并停 1.25s | Bullet13，53/16；影分身 | `(-144.2,-115.55,130.7,138.35)`；末帧销毁 |
| `zz` | `hit14` count2/count16 | Bullet14_1，362/15；14_2，373/7；影分身同对象 | `(-95,-83,90,111)`；`(-55.3,-21.75,220.5,168.05)`；动作末清理分身 |
| `sx` | 被动 | 无可见主动对象 | 禁止补造特效 |

SWF 元数据分别为 24/30 fps，但宿主 `Config.frameClips=30`；现代验收按 30 tick 的 AS3 hold/触发合同验证，不把包元数据直接当作游戏逻辑 tick。

## 影分身与显示列表

`Role1Shadow` 使用 character 1 `ROLE1_SHALLDOW`，offset `(15,-5)`；向左/右 origin 分别 `(0.575,0.525)` / `(0.425,0.525)`。row0 五个静态候选各 hold 72；row1 `hit1` 为 `2,3,2,3`；row2 `hit2` 为 `2,12,16`。分身不移动，生存 `frameClips*3`（3 秒），攻击完成或统一清理时销毁。

角色显示根先添加 `body`，其后添加居中的 `nameTextField`，因此名字位于本体上层；基于 50×100 碰撞根，文字锚点为 `(-55,-80)`。HUD 独立于角色根：P1 位于 `(0,0)`，P2 根位于 `(920,0)` 且 `scaleX=-1`，内部文本反向抵消；头像使用 character 505 的 `悟空` 帧，五槽使用 character 510，五入口仍由 549/555/561/567/573 与共享命中区 418 承担。

## 现代差异与 158A 验收输入

- 行为：Role1 技能系统与普攻窗口已实现；视觉：仅四组普攻对象已接真 PNG，本体仍是 placeholder，技能/分身仍是 ellipse/core/Text，死亡仍是 alpha/tint。`AssetManifest.ts` 的 Role1 skill `missing-original` 结论已过时，158A 必须修正。
- stable key 必须新增/闭合 `hero-animation.hero1.body/equipment/shadow` 及上表技能对象；身体和装备共享相同 cell、hold 与 origin，不能各自漂移。
- 原版基准沿用 940×590 HUD 真背景：分别用 Role1 P1 单人、Role1 P2 的合法非重复双人组合，覆盖 idle/run/jump/attack/hurt/remove、左右朝向、每技能起手/持续/命中/结束、HUD 头像/五槽更新。
- 自动验证锁定 Symbol/id、帧数、hold、触发 tick、自移除与禁止 Arc/Text/单帧回填；视觉验证以同尺寸并排/叠图记录对象、注册点、裁切与 P1/P2 镜像差异。允许的现代可见例外为空。

六段证据已由 `Role1.as/Role1Shadow.as` 局部链、BaseBitmapData 共享链、恢复 SWF Symbol/时间轴/SVG 几何、上述可观察合同、现代 stable-key 差异和双重验证计划组成。影响 158A 的未知为零；其他角色不在本文结论范围内。

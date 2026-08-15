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

`TASK-SETTINGS-173` 已用 `task-settings-173.role1-shadow` 重做本节的机器真值。manifest 位于 `ground-truth/manifests/task-settings-173-role1-shadow.json`，实现和回测必须直接消费：

- `/provenance`：`WuKong.swf` SHA-256、character 1 / `ROLE1_SHALLDOW`、`Role1.as/Role1Shadow.as/BaseMonster.as/BaseBitmapDataClip.as/gameSetting.as` hash 与 locator。
- `/states`：左右朝向各 12 个可达 cell，row0 五个候选、row1 四个 `hit1` cell、row2 三个 `hit2` cell，hold 按宿主 tick 记录。
- `/displayObjects/0/placements`：200×200 cell、左向 `tx=-115`、右向 `tx=-85`、共同 `ty=-105`；这是 `setOffsetXY(15,-5)` 经 `setXYByDirect()` 得到的原版根矩阵。
- `/baselines`：同一原版 1000×600 atlas 的 200×200 逐 cell crop；向右由 `BaseBitmapDataPool` 在运行时选择镜像 BitmapData，不是另一原始帧。

### 173 时序与动作纠错

| 动作 | 可达 cell / hold | 可观察语义 | 销毁/触发 |
| --- | --- | --- | --- |
| `walk` | row0 创建时随机选 0..4 之一；每候选 hold 72 | `frameCount=[[1,1,1,1,1],...]` 使当前候选只有一个关键帧；72 tick 结束后 `scriptFrameOverFunc("walk")` 不切换 cell，因此整个生命期保持创建时选中的静态候选 | 独立 `maxCount=frameClips*3`；20/24/30 tick 质量档均约 3 秒 |
| `hit1` | row1，hold `2,3,2,3`，共 10 tick | 只在 Role1 主体 `hit8` 的 x0/count2 时对存活分身调用；分身 x0/count2 以自己位置产生 `hit8` | 动作 frame-over 销毁分身 |
| `hit2` | row2，hold `2,12,16`，共 30 tick | 只在 Role1 主体 `hit14` 的 x0/count2 时调用；分身 x0/count2 产生第一段，x2/count16 产生第二段 | 动作 frame-over 销毁分身 |

`72` 是宿主逻辑 tick，不是 SWF 的逐帧播放速度；只有在 30 tick 质量档才数学上等于 2400ms，但该时点不切换候选，而分身寿命仍由 90 tick 结束。20/24 tick 档下 72 tick 分别是 3600/3000ms，寿命仍由 `frameClips*3` 保持约 3 秒。因此“每 400ms 切换一帧”和“应直接改成 2400ms 循环”都不是原版事实。

### 创建、identity、owner 与生命周期合同

- `Role1Bullet13` 命中非 boss 创建 1 个且 50% 多 1 个，boss 创建 4 个且 50% 多 1 个；这是 `BaseMonster.beAttack()` 的真实命中消费链，不是 `Role1.doHit13()` 创建。
- 每个分身是独立 `Role1Shadow` 对象，`source` 指回创建它的 `Role1`，加入 `gc.gameSence` 与该 Role1 的 `shallowArray`；所有派生攻击仍以 source Role1 的 role id / owner 发送。
- 创建位置是目标位置周围 `x + (random-0.5)*150, y`；朝向在创建时复制 source 当前 BBDC 方向，之后不跟随 source 转向。`createShallow(param1, param2)` 的 `param1` 在此版未被使用，不得把它补成方向事实。
- `move()` 为空，分身不跟随主角也不自主移动。Role1 的 `step()` 逐个驱动其 `shallowArray`；超时、`hit1/hit2` frame-over 或外部统一 `destroy()` 后从当前可见世界移除，Role1 下一次 step 将数组位置置空。
- 原版层级只有一个 200×200 `body` Bitmap cell，无名字、装备、mask、filter 或额外碰撞显示层；`newColipse()` 创建不可见碰撞 Sprite，不属于玩家可见 display object。

### TestScene / 正式 Runtime 差异矩阵

| 合同项 | 原版/173 真值 | TestScene 现状 | 正式 `HeroPartyRuntime` 现状 | 173A 必须消费的输入 |
| --- | --- | --- | --- | --- |
| identity / owner | source Role1 + 独立 shadow identity，P1/P2 owner 不串 | 173A1 已闭合：model 保持稳定 `id/sourceId`，共享视图 Map 只按 id 投影；专项覆盖 P1/P2 独立 source | skill model 内有 runtime 字段，但正式更新链仍不消费 Role1 shadow skill | 173A2 以 party member slot/combat id 接入正式 owner，视图不反向持有行为状态 |
| 静态候选 | 创建时随机选一个，终生不轮换 | 173A1 已闭合：创建时固定 0..4 candidate，walk 全生命期不轮换 | 无分身视图 | 173A2 复用同一 model/truth，不新增正式侧候选逻辑 |
| action | `walk/hit1/hit2`；后两者只由 source `hit8/hit14` 触发 | 173A1 已闭合：`lyfb` 只进入 hit1；`zz` 只进入 hit2，按 tick 派生弹体且不立即清空 | 无更新/可观察 action | 173A2 只接线既有 action 入口，不从现代总时长倒推新触发点 |
| timing / destroy | 寿命 `frameClips*3`；`hit1=10 tick`、`hit2=30 tick` 后销毁 | 173A1 已闭合：90/10/30 tick、2/3/2/3 与 2/12/16 holds、证据化发射/销毁均由真值投射 | 存在 model 但未更新 | 173A2 在正式更新链复用同一 tick owner |
| space / facing | root 在 shadow world `(x,y)`；左 `(-115,-105)`、右 `(-85,-105)`；创建时锁定朝向 | 173A1 已闭合：共享投射直接消费 placements，940×590 左右 origin 为 `(0.575,0.525)` / `(0.425,0.525)`，无重复 offset | 无分身视图 | 173A2 复用 `Role1ShadowVisualBridge`，不得另写正式坐标 |

现代可见例外为空。影分身不需要全新 SWF 资源族，也不需要重做通用英雄生命周期；173A 只能在上表边界内接入。

### 证据矩阵、未知与反证

| 行为合同项 | 局部证据 | 共享调用链 | 几何/坐标证据 | 证据等级 | 未知与反证条件 | 验证方式 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 创建数与 owner | `BaseMonster.as:973-998`，`Role1.as:1687-1712` | Bullet13 命中 → source Role1 `createShallow` → gameSence + shallowArray → source role id 派生攻击 | 目标 y，x 在 150 宽区间；manifest `/displayObjects/0` | 交叉确认 | 若原版运行观察显示 boss/非 boss 数量不在 4..5/1..2，重开 | 生成器源模式 + 173A 确定性命中回归 |
| 静态候选/72 tick | `Role1Shadow.as:59-60,79-89`，`scriptFrameOverFunc` | `BaseBitmapDataClip.step/frameCount/frameShow` | WuKong character 1 为 5×3 atlas；manifest `/states/0..4` 及左右 placements | 交叉确认 | 若新一手版本的 walk row `frameCount` 不再是五个 1，重开 | `npm run test:role1-shadow-truth` + 运行期 3 秒单 candidate 观察 |
| hit1/hit2 可达性 | `Role1.as:829-836,1060-1069`，`Role1Shadow.enterFrameFunc` | source `hit8/hit14` → shadow action → source Role1 弹体方法 → frame-over destroy | manifest `/states` 的 row1/row2 全 cell 与 hold | 交叉确认 | 未发现第三个 Role1 可达 action；若真实调用链命中 `hit3/4`，重开 | 173A 逐 tick action/触发/销毁测试 + 940×590 |
| 朝向/注册点 | `Role1Shadow.initBBDC/createShallow` | `BaseBitmapDataPool` 预镜像整表，BBDC 按 direct 选对应 cell | manifest `/displayObjects/0/placements`、atlas baselines | 交叉确认 | 若运行截图的源 root 不在计算 stage bounds，以可追溯 Flash 截图重开 | Schema/完整性 + 173A 左右叠图 |
| 寿命 | `Role1Shadow.maxCount/step`，`gameSetting` 三档 | Role1.step 驱动 shadow.step，destroy 后 shallowArray 置空 | 纯时序，几何不适用 | 交叉确认 | 在 30 tick 正式现代运行中约 3s；若项目时基不再 30 tick，必须按 tick 重投影 | 20/24/30 证据模式 + 173A 30 tick 决定性测试 |

影响 173A 的未知为 0；未实施的正式 Runtime 差异是已定位缺口，不是原版未知。

角色显示根先添加 `body`，其后添加居中的 `nameTextField`，因此名字位于本体上层；基于 50×100 碰撞根，文字锚点为 `(-55,-80)`。HUD 独立于角色根：P1 位于 `(0,0)`，P2 根位于 `(920,0)` 且 `scaleX=-1`，内部文本反向抵消；头像使用 character 505 的 `悟空` 帧，五槽使用 character 510，五入口仍由 549/555/561/567/573 与共享命中区 418 承担。

## 现代映射与 158A 验收结果

- 行为数值与窗口保持不变；本体/装备与 image projectile 分支已接入正式流程。173A1 已让 `Role1ShadowTruth` 直接消费 verified manifest，并以共享 `Role1ShadowVisualSystem/Role1ShadowVisualBridge` 闭合固定 candidate、动作 tick、左右矩阵与 TestScene 薄适配；证据见 `docs/tasks/evidence/TASK-SLICE-173A3/visual-audit.md`。正式五关接入仍只由 173A2 负责。Role1 `missing-original` 旧族已删除的资源结论不变。
- stable key 已闭合 `hero-animation.hero1.body/equipment/shadow` 及上表技能对象；身体和装备共享 cell、hold、坐标和 origin。
- 原版基准沿用 940×590 HUD 真背景：分别用 Role1 P1 单人、Role1 P2 的合法非重复双人组合，覆盖 idle/run/jump/attack/hurt/remove、左右朝向、每技能起手/持续/命中/结束、HUD 头像/五槽更新。
- 自动验证锁定 Symbol/id、帧数、hold、触发 tick、自移除与禁止 Arc/Text/单帧回填；视觉验证以同尺寸并排/叠图记录对象、注册点、裁切与 P1/P2 镜像差异。允许的现代可见例外为空。

158A 实际验收记录见 `docs/tasks/evidence/TASK-SLICE-158A/visual-audit.md`。三张角色 atlas、14 个 stable key/249 帧、正式单人运行、合法双人 QA 路由、HUD 复用和零 console 均有可复查落点。

2026-08-03 `TASK-SLICE-165A` 用户反馈校准：现代普攻对象不再只从碰撞脚点投影，而是先继承 Role1 本体视觉根 `(footX + 5, rootY - 15)`，再叠加上表既有局部前向/y offset。该映射直接消费本页确认的 `(5,-15)`，没有修改攻击碰撞、伤害、时间窗或资源；坐标专项覆盖左右向，940×590 Role1 关卡运行复验确认本体与普攻对象锚点改善，console warning/error 为 0。

六段证据已由 `Role1.as/Role1Shadow.as/BaseMonster.as` 局部链、BaseBitmapData 共享链、恢复 SWF character 1/atlas 几何、`task-settings-173.role1-shadow` verified 真值、上述可观察合同、现代差异和双重验证计划组成。影响 173A 的原版未知为零；173A1/TestScene 投射已闭合，正式接入尚未完成，其他角色不在本文结论范围内。

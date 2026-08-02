# Role2 唐僧战斗视觉索引

本文先闭合 `TASK-SETTINGS-069B` 的逆向输入，并由 `TASK-SLICE-158B / TASK-SLICE-162` 闭合现代接入与验收。范围只含 Role2 本体/装备、蓄力条、Shadow、普攻、全部已实现技能及既有战斗 HUD；Role3..5 仍保持独立后续任务。

## 待证明问题与来源 owner

待证明项为：本体逐动作帧与 hold、衣装/装备 depth、蓄力条和名字、两段普攻、`sgq/smb/xbz/myhc/jgz/tjgl/jhsj/shy` 及 `blb/sjt` 被动的可见对象、Shadow 协同、方向与销毁、P1/P2 HUD 映射。

| 来源 | 确认事实 |
| --- | --- |
| `assets/TangSeng1.swf` | 当前 EXE 的 `Aloader.urls` 在启动时加载此包；持有本任务采用的 12 套本体、8 套装备、Shadow 与 11 个攻击/技能 MovieClip；SHA-256 `5A3DEEDD551EBCA5026F04EE2CA75ABECBC5C8B5837CBC615E09E36BD8855187` |
| `assets/TangSeng.swf` | `AssetsLoader` 的普通按需路径；SHA-256 `62BE5A4DCDA6C0617C25656DF46506AEB7BB695BBC790DE8C28DE0B5518EF901`，同名对象帧数一致但除 `Role2Bullet4_1` 外导出像素与 `TangSeng1` 不同 |
| `assets/SpecialUI/TangSeng.swf` | `Objectdata.specialUI` 的按需路径；与 `assets/TangSeng.swf` 字节完全相同，不是第三套独立视觉 |
| 战斗 HUD | 继续复用 `combat-hud-index.md` 已闭合的 `OtherMat1.swf` character 574/505/510 与五入口按钮，不归属到 TangSeng 包 |

`Aloader` 与 `AssetsLoader` 都把代码导入 `ApplicationDomain.currentDomain`。为避免同名类先后加载和 character id 差异造成混帧，158B 的唯一现代 owner 固定为当前启动路径的 `TangSeng1.swf`；另外两包只保留为兼容/反证来源，不得把其 id 或帧混入同一 atlas。

## 本体、装备与动作合同

`TangSeng1` 的本体为 `ROLE2_0/1/2/3/4/9/11/112/113/114/115/222`（character `5/11/14/12/7/2/3/348/349/350/347/351`），装备为 `ROLE2_EQUIP_0/1/2/3/4/8/9/222`（`6/10/9/8/15/1/4/352`）。20 张表均为 1200×2600，即 6×13 个 200×200 cell；`Role2.initBBDC()` 先加入 body、再加入 equip，因此两层同 cell 同深度顺序，装备在本体上层。

普通 offset 为 `(15,0)`。`BaseBitmapDataClip.setXYByDirect()` 给出向左/向右 origin 分别为 `(0.575,0.5)` / `(0.425,0.5)`；素材以角色根的 local 坐标渲染，世界坐标仍由 50×100 `ObjectBaseSprite` 碰撞根持有。所有行按宿主 `Config.frameClips=30` 的 tick 推进；SWF 自身 24 fps 元数据不直接替代游戏逻辑 tick。

| 行 / 动作 | cell 与 hold tick | 循环、触发或结束 |
| --- | --- | --- |
| 0 `wait` | 6 cell，`2,2,2,3,2,4`，36 次关键帧变化 | 与 `wait2` 交替 |
| 1 `wait2` | 4 cell，`2,2,2,14` | 回 `wait` |
| 2 `walk` | 4 cell，各 4 | 循环 |
| 3 `run` | 4 cell，各 2 | 循环 |
| 4 | `jump1/jump3/hit8/hit9/hurt`，hold `1/1/30/55/15` | 跳跃保持；技能/受击结束回 wait 或 jump3；`sjt` 存在时 hurt hold 变 8 |
| 5 `jump2` | 5 cell，各 2 | 转 `jump3` |
| 6 `hit1` / `blb` 蓄力 | 3 cell，`2,4,12`；中格可在持 J 时反复重置 | 末格 count 12 创建 Bullet1；蓄满阈值 48（学 `sjt` 为 12）则创建 Bullet2 |
| 7 `hit3` / `xbz` | 4 cell，`2,10,2,20` | 首格 count 2 创建 Bullet3；结束恢复重力 |
| 8 `hit4_1` / `smb` 首段 | 2 cell，各 2，合计 24 次关键帧变化 | 首格 count 1 创建移动 Bullet4_1；结束回 wait/jump3 |
| 9 `hit4_2` / `smb` 二段 | 3 cell，`2,2,6` | 末格 count 6 在首段记录点上方创建 Bullet4_2 |
| 10 `hit5` / `sgq` | 3 cell，`48,2,15`；学 `sjt` 时首格为 24 | 首格累计蓄力显示；末格 count 15 创建 Bullet5 |
| 11 `hit6` / `myhc` | 3 cell，`2,2,20` | 末格 count 20 创建 Bullet6；Shadow 同步 `hit2` |
| 12 `hit7` / `jgz` | 3 cell，`2,2,10` | 末格 count 10 创建 Bullet7 |

Role2 没有 death Symbol；`BaseHero` 死亡路径销毁显示对象。158B 不得用 tint、alpha 或单帧姿势补造死亡动画。

## 普攻、技能与附属对象矩阵

下表 character id、帧数与 bounds 均来自 `TangSeng1.swf` 的 SymbolClass、选择性 PNG/SVG 导出。bounds 是各 SVG 帧相对 MovieClip 注册点的并集 `(left,top,right,bottom)`；除明确的 Shadow 外，`BaseBullet.step2()` 默认在 MovieClip 末帧 stop 并销毁。

| stable key / 行为 | 创建点与显示层 | Symbol / id / 帧 | bounds 与生命周期 |
| --- | --- | --- | --- |
| `normal-attack-effect.hero2.hit1` | `hit1` 末格；朝向前方 50、`y+10` | `Role2Bullet1` / 274 / 24 | `(-493,-94.95,98.5,84.45)`；末帧销毁；命中耗尽是唯一被 BaseBullet 特判不提前销毁的 Role2 对象 |
| `normal-attack-effect.hero2.hit2` | `blb` 蓄满时替代 Bullet1，同一点 | `Role2Bullet2` / 232 / 24 | `(-1289,-130,125,128.9)`；末帧销毁 |
| `skill-projectile.role2.xbz.hit3` | 本体/Shadow 起点 `y+10`，对象再加 `+40` | `Role2Bullet3` / 74 / 40 | `(-186.45,-132.5,218.65,31.5)`；受击可截断关闭；末帧销毁 |
| `skill-projectile.role2.smb.hit4_1` | 朝向前方 200、`y+10`；以 speed ±10 移动 | `Role2Bullet4_1` / 281 / 48 | `(0,0,163.7,50.25)`；记录二段点；末帧或二段切换销毁 |
| `skill-projectile.role2.smb.hit4_2` | 首段点 `y-320`，视觉 x 再朝角色侧偏 50 | `Role2Bullet4_2` / 325 / 21 | `(-150,-157.65,150,430)`；末帧销毁，0.75s 后恢复角色重力 |
| `skill-projectile.role2.sgq.hit5` | 朝向前方 175、`y-110` | `Role2Bullet5` / 96 / 180 | `(0,0,200,200)`；末帧销毁；长时间线与本体 48/24 tick 蓄力是两个独立时序 |
| `skill-effect.role2.myhc.hit6` | `x` 不变、`y-25`；`addChildAt` 位于角色下层 | `Role2Bullet6` / 123 / 26 | `(-106.15,-168.55,106.1,75.8)`；disabled 纯效果，0.1s 后为附近玩家附加 4s 回血，末帧销毁 |
| `skill-effect.role2.jgz.hit7` | 朝向前方 210、`y+30` | `Role2Bullet7` / 154 / 22 | `(-247,-67,239.6,104.9)`；disabled 纯效果；拉拽移动为 0.625s+0.625s，视觉末帧独立销毁 |
| `skill-effect.role2.tjgl.hit8` | 左向 `x+5` / 右向 `x-5`、`y-60`；角色下层 | `Role2Bullet8` / 346 / 25 | `(-176,-84,169,173)`；本体在 cast count 30 创建；Shadow `hit3` 在 count 20 创建同 Symbol 的 `hit8_2`；末帧销毁 |
| `skill-projectile.role2.jhsj.hit9_1` | 本体/Shadow 在 count 55，朝向前方 20、`y-20` | `Role2Bullet9_1` / 178 / 57 | `(-62.45,-42.7,50.05,66.6)`；受击可截断；末帧销毁 |
| `skill-projectile.role2.jhsj.hit9_2` | 本体/Shadow 在 count 45，朝向前方 150、`y-150`；角色下层 | `Role2Bullet9_2` / 159 / 45 | `(-68,-58,367.9,358)`；受击可截断；末帧销毁 |
| `skill-summon.role2.shy.shadow` | 第一次在角色根创建；第二次把角色传送到 Shadow 并销毁 | `ROLE2_SHALLDOW` / 13 / 800×1000 | 4×5 个 200×200 cell；最长 8s；参与后述四个协同动作时动作结束即销毁 |

`blb` 不创建独立视觉，只决定普通攻击蓄满后使用 Bullet2；`sjt` 不创建独立视觉，只把蓄力阈值降为 12、`sgq` 首格从 48 tick 降为 24，并把 hurt hold 从 15 降为 8。禁止为两个被动补造特效。

## Shadow 合同

Shadow offset 为 `(15,-5)`，左右 origin 为 `(0.575,0.525)` / `(0.425,0.525)`。`Role2Shadow` 构造器把动作字面量写为 `waik`，而 BBDC 初始显示仍停留在 row0；现代使用稳定的 `idle/walk` 描述，不把该拼写错误扩散为资源 key。

| 行 | 动作 / hold | 可见与触发 |
| --- | --- | --- |
| 0 | `walk`：4 cell，各 4 | shy 标记的默认循环；最多 `frameClips*8` |
| 1 | `hit1`：`2,5,2,20` | 主体 `xbz` 触发；x2 count2 创建 Bullet3；结束销毁 Shadow |
| 2 | `hit2`：`2,2,20` | 主体 `myhc` 触发；x2 count20 创建 Bullet6；结束销毁 |
| 3 | `hit3`：单 cell 30 | 主体 `tjgl` 触发；count20 创建 Bullet8 的 `hit8_2`；结束销毁 |
| 4 | `hit4`：单 cell 55 | 主体 `jhsj` 触发；count55/45 创建 Bullet9_1/9_2 的 `_2` action；结束销毁 |

`Role2KK` 在本版 `Role2.as` 只有字段与 destroy 防御性清理，没有创建调用链，也没有现代已实现技能消费者；它不属于 069B/158B，不得因复用 Shadow sheet 而加入本任务。

## 显示列表、HUD 与视觉基准

| 区域 | parent / depth / 几何 / 动态内容 |
| --- | --- |
| 角色根 | `body` 内为 body→equip；200×200 cell 按上述 origin 放置；无 mask/filter/alpha；水平朝向由镜像表/flip 承担 |
| 头顶蓄力条 | `ExceedPower` 在角色根、body 之后创建；共享 50×100 碰撞根下为 `50×9`、局部 `(-25,-70)`；1px 红边、绿色填充，满时在 `0x112233/0xAABBCC` 间闪烁，alpha 0↔1 各 0.5s |
| 名字 | `BaseHero.refreshAlliance()` 通过 `PlayerHonor.getHonorBitmap(roleName)` 生成：FZCuYuan-M03、16px、bold、红色、黑色 GlowFilter，水平按位图宽度居中；默认局部 `y=-90`，有时装时 `y=-120`，位于 body/equip/蓄力条上层 |
| Shadow | 直接加入 `gc.gameSence`，不是角色 root child；方向独立，技能可在其位置生成对象并结束 Shadow 生命周期 |
| HUD 固定层 | P1 `RoleInfo` 根 `(0,0)`；P2 根 `(920,0)` 且 `scaleX=-1`，动态文本反向抵消；character 505 以 `roleName="唐僧"` 选头像帧，HP/MP/EXP/等级及 character 510 五槽沿用既有 HUD 合同 |
| HUD 输入/命中 | P1 `Y/U/I/O/L`，P2 `8/4/5/6/3`；五入口继续使用 549/555/561/567/573 与共享 418 hit；Role2 不新增角色专属按钮 |

原版对象基准来自 `TangSeng1.swf` 的 20 张本体/装备表、Shadow 表和 11 组逐帧 SVG/PNG，以及 `combat-hud-index.md` 已保存的 940×590 HUD 根。158B 使用相同 940×590 舞台建立：Role2 P1 单人、Role2 P2 与任一不重复角色的合法双人组合；覆盖 idle/run/jump/hit1/charged/hurt/remove、左右方向、每个技能起手/持续/命中/结束、Shadow 创建/协同/传送/超时、蓄力条、头像/五槽更新。原版与现代需同尺寸并排或半透明叠图，并逐项记录 cell、注册点、裁切、层级和镜像差异；允许的现代可见例外为空。

## 六段证据矩阵与 158B 输入

| 行为合同项 | 局部证据 | 共享调用链 | 几何/坐标证据 | 等级 | 未知/反证 | 验证 |
| --- | --- | --- | --- | --- | --- | --- |
| 包 owner | `Aloader.as`、`AssetsLoader.as` | currentDomain 启动/按需加载 | 三包 SHA、SymbolClass、像素比较 | 交叉确认 | 若运行证明后加载包覆盖启动类，退回 069B；当前实现禁止混包 | 静态 owner 门禁 + atlas 抽检 |
| 本体/装备 | `Role2.initBBDC/setAction/step` | `BaseBitmapDataPool/Clip` | 20 张 1200×2600、cell、offset/origin | 交叉确认 | 影响实现未知 0 | 资源尺寸/hold 测试 + 940×590 逐状态 |
| 普攻/技能 | `enterFrameFunc/doHit*/showSkill` | `BaseBullet/SpecialEffectBullet/EnemyMoveBullet` | 11 Symbol/id/帧/bounds/世界生成点 | 交叉确认 | 影响实现未知 0 | 触发 tick、销毁、禁止占位 + 逐技能叠图 |
| Shadow | `Role2Shadow.as`、`Role2.doHit10` | game scene、主角色 step/destroy | 800×1000、4×5、offset/origin | 交叉确认 | `waik` 仅为源码拼写事实，不影响可见 row0 | 8s/协同/传送/销毁测试 + 运行观察 |
| 头顶/HUD | `Role2` 构造器、`ExceedPower`、`RoleInfo` | hero properties、player skill slots、GameInfo lifecycle | 50×100 根、蓄力条/名字局部坐标、574/505/510 | 交叉确认 | 允许现代例外 0 | 显示列表门禁 + P1/P2 940×590 |
| 现代映射 | 既有 Role2 systems/manifest stable key | `combat-hero-2` 入场包、`combat-hero-2-skills` 后台技能包与动画/view bridge | 本文为唯一 origin/帧输入 | 现代设计选择 | 行为数值、伤害窗口、存档 owner禁止改动 | 专项、全系统、build、annotations/workflow |

选择性派生物位于 `local-resources/regima/task-outputs/task-settings-069b-role2/`，仅作为 Git 忽略的证据输入。现代 Git owner 已落到 `public/assets/combat/role2/`、`public/assets/ui/combat-hud/portraits/role2.png`、`AssetManifest` 与 Role2 两级 bundle；行为与真视觉现均已复现。影响本角色接入的未知为零，Role3..5 与宠物视觉不在本文结论范围内。

## 158B / 162 现代映射与最终验收

| 对象族 | 现代 owner | 验收结论 |
| --- | --- | --- |
| 本体 / 装备 / 头顶层 | `Role2CombatVisualSystem.ts`、`Role2CombatVisualBridge.ts`、`role2CombatAtlases` | 1200×2600、200×200 cell、13 行 hold（含 `wait→wait2` 循环与蓄力普攻 `hit2` 同行）、body→equip 层级、左右 origin、唐僧姓名与 50×9 红框/48×7 绿填充 ExceedPower 均按合同接入；现代调试标签对 Role2 隐藏，死亡立即移除且无 tint/alpha 占位 |
| 两段普攻 | `role2NormalAttackAssets`、`HeroNormalAttackVisualBridge.createAttackEffectView` | 两个 stable key 共 48 帧由真 image 序列优先于 Arc/Text；恢复帧默认向左，角色朝右时同时翻转纹理并镜像非对称 registration origin；TestScene 与四个后续正式关卡共用帧推进/跟随/销毁生命周期 |
| 九技能 / Shadow | `role2SkillVisualAssets`、`Role2CombatAssetKeys.shadow`、`Role2ShadowAnimations`、`TestSceneViews.createProjectileEffectView` | 九对象 464 帧与 800×1000 Shadow atlas 由 `combat-hero-2-skills` 唯一持有并在关卡可见后后台加载；Shadow row0 循环及 `xbz/myhc/tjgl/jhsj` 对应 row1..4 的 hold/动作结束销毁均有确定性门禁，默认 walk 保持 8s 超时；`blb/sjt` 保持无独立可见对象，未知/现代例外均为 0 |
| HUD | `combatHudAssets.role2Portrait`、`Stage1CombatHudSystem/Bridge` | character 505 frame 2 唐僧头像以 PNG image 加载；P1 正向、P2 镜像，五槽与 HP/MP/EXP owner 未改变 |

940×590 运行验收：

- 单人 `?qaStage=1-1-role2`：Role2 本体/装备、唐僧姓名层/头像、P1 HUD 与舞台层级正常，现代玩家调试标签不再覆盖角色，console warning/error 为 0。
- 合法双人 `?qaStage=1-1-role2&players=2`：P1 Role1、P2 Role2 的本体、左右 HUD/头像和五槽均正常，console warning/error 为 0；P2 `ArrowLeft` 运行观察证明方向键归 P2，位置与真本体镜像同步。
- 首次运行发现 PNG 头像被 `combat-common` 误排入 SVG loader；修正为 image loader 并加入专项防回归断言后，资源包完整加载。
- 浏览器控制面无法注入小键盘数字；P2 普攻/技能并未伪记为手动按键。其闭合证据由 `InputSystem` 的 numpad 映射、全系统行为测试、11 stable key 的真资源优先分支、全部 512 个 effect frame 的 PNG/帧数校验与单/双人资源包实际加载共同承载。
- 159 后续反馈复核：Role2 左右方向均在 940×590 实际按键中显示于人物对应前方；`Stage12/13/21/22GameplayBridge` 均创建、更新并销毁共享普通攻击视觉桥，防止“下一关”后只有本体动画、没有攻击对象。

最终门禁：`test:role2-visuals`、`test:stage1-hud`、`test:systems`、`check:structure`、`build`、`check:annotations`、`check:workflow` 与 `git diff --check` 均通过；structure 仅保留未由本任务新增的既有 warning，Vite 仅保留既有 chunk 大小 warning。

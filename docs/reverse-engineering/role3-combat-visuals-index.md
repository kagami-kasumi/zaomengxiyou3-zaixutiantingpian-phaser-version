# Role3 八戒战斗视觉索引

本文闭合 `TASK-SETTINGS-069C` 的权威实现输入。范围只含 Role3 本体/装备、角色根动态状态、普攻、九项已实现主动技能及既有战斗 HUD；不实现动画，不扩 Role4/Role5 或宠物。

## 待证明问题与来源包

待证明项为：本体动作表与装备叠层、三段普攻、三档盾、拉拽/移动/追踪对象、技能起手与对象时序、Role3 HUD 映射、P1/P2 朝向，以及每个现代 stable key 的唯一来源。

`assets/BaJie.swf` 与 `assets/SpecialUI/BaJie.swf` 的 SHA-256 均为 `23F1AA1DBE93A4F15302543A075AE6673C2118A4168887B0AD7F1C68F224B4D9`，SymbolClass 逐项相同。因此两条加载路径是同一视觉内容的字节副本；158C 应以 `assets/BaJie.swf` 为单一派生 owner，SpecialUI 只保留加载兼容证据，禁止重复打包。

本地选择性派生位于 `local-resources/regima/task-outputs/task-settings-069c-role3/`：两包 XML/SymbolClass、22 张本体/装备源表，以及 16 个对象的逐帧 PNG/SVG。该目录受 Git 忽略，只是可复核证据，不是现代资源目录。

## 本体、装备与动作表

`Role3.initBBDC()` 从 `ROLE3_<clothId>` 与 `ROLE3_EQUIP_<weaponId>` 依次组成 body/equip；`BaseBitmapDataClip` 按数组顺序 copyPixels，所以装备位于本体上层。13 个本体 character 为 `2,4,5,7,8,10,11,12,13,14,16,17,20`，9 个装备 character 为 `1,3,6,9,15,18,19,21,22`。22 张表均为 `1800×2800`，按构造参数切成 `6×14` 个 `300×200` cell。

朝右使用反向帧组，clip 局部位置 `(-165,-100)`，现代 origin 为 `(0.55,0.5)`；朝左使用正向帧组，局部位置 `(-135,-100)`，origin 为 `(0.45,0.5)`。这是 `bmWidth=300`、`bmHeight=200`、`setOffsetXY(-15,0)` 与 `setXYByDirect()` 的直接结果，不是图片外观推断。

| row / cell | 动作 | cell hold tick | 循环/结束 |
| --- | --- | --- | --- |
| 0 / 0..5 | `wait` | `2,2,2,3,2,4` | 6 格后切 `wait2` |
| 1 / 0..5 | `wait2` | `3,3,3,9,5,9` | 6 格后切 `wait` |
| 2 / 0..3 | `walk` | `4,4,4,4` | 4 格循环 |
| 3 / 0..3 | `run` | `2,2,2,2` | 4 格循环 |
| 4 / 0..5 | `jump1`,`jump3`,`hurt`,`hit6`,`hit11`,`hit5/hit11Frame2/hit12` | `1,1,15,6,2,160` | 每个动作使用指定单格；结束按 `scriptFrameOverFunc()` 回 wait 或下一段 |
| 5 / 0..4 | `jump2` | `2,2,2,2,2` | 5 格后进入 jump3 |
| 6 / 0..2 | `hit1` | `2,2,6` | 3 格后 wait |
| 7 / 0..2 | `hit2` | `2,2,6` | 3 格后 wait |
| 8 / 0..3 | `hit3` | `2,2,2,10` | 4 格后 wait |
| 9 / 0..2 | `hit4` | `24,2,8` | 3 格后 wait |
| 10 / 0..2 | `hit7` | `2,2,20` | 3 格后 wait |
| 11 / 0..3 | `hit8` | `2,2,2,20` | 4 格后 wait |
| 12 / 0..3 | `hit9` | `2,2,2,20` | 4 格后 wait |
| 13 / 0..2 | `hit10` | `4,3,25` | 3 格后静止并 wait |

Role3 没有独立 death Symbol；`BaseHero` 的死亡路径移除显示对象。158C 不得用 tint、alpha、文字或单帧姿势补造死亡动画。

## 普攻与技能对象矩阵

下表 bounds 为 SVG 注册坐标 `(xmin,ymin,xmax,ymax)`；帧率来自包根 `24fps`。Follow/SpecialEffect 对象默认随原版 bullet 生命周期在末帧销毁；有明确计时、隐藏、循环或二段切换的行以合同为准。

| stable key | AS3 触发与 world 注册点 | Symbol / id / 帧 | SVG bounds 与生命周期 |
| --- | --- | --- | --- |
| `normal-attack-effect.hero3.hit1` | `hit1` 格1、hold=2；朝向前方130，`y-72` | `Role3Bullet1` / 45 / 11 | `(-24.7,-25.05,207.9,151.05)`；Follow，末帧销毁 |
| `normal-attack-effect.hero3.hit2` | `hit2` 格1、hold=2；前方140，`y-30` | `Role3Bullet2` / 81 / 13 | `(-253,-132,695,221)`；Follow，末帧销毁 |
| `normal-attack-effect.hero3.hit3` | `hit3` 格2、hold=2；前方180，`y-140` | `Role3Bullet3` / 54 / 5 | `(-36,4,259.8,257.7)`；Follow，末帧销毁 |
| `skill-projectile.role3.dj.hit4` | row9 格0、hold=24；前方35，`y-55` | `Role3Bullet4` / 288 / 30 | `(-90.7,12.9,99.05,85.65)`；Follow、伤害对象，末帧销毁 |
| `skill-effect.role3.sd.hit5` | row4 格5、hold=160；前方70，`y-110` | `Role3Bullet5` / 281 / 12；`Role3Bullet5Buff` / 256 / 19 | `(-77.1,-11.05,231.9,194.35)`；cast 纯效果。buff `(-53,-9,99,166)`，角色根局部 `(-20,-80)`，三档共享同一循环视觉，10 秒后移除 |
| `skill-effect.role3.zznh.hit6` | row4 格3、hold=6；前方120，`y-115` | `Role3Bullet6` / 340 / 15 | `(5,6,187,192)`；disabled 纯效果；目标 1.8 秒拉到角色 `y-100`，视觉末帧独立销毁 |
| `skill-effect.role3.syzq.hit7_1` | row10 格2、hold=20；前方140，`y-160` | `Role3Bullet7_1` / 203 / 11 | `(-61,-35,189,265)`；disabled 起手纯效果，末帧销毁 |
| `skill-projectile.role3.syzq.hit7_2` | 同格 hold=8；前方135，`y-145` | `Role3Bullet7_2` / 169 / 12 | `(-42,-79.35,308,241.05)`；水平 speed ±12、距离999、2.5 秒 owner，禁止按12帧提前销毁 |
| `skill-effect.role3.ssp.hit8_1` | row11 格3、hold=20；前方95，`y`不变 | `Role3Bullet8_1` / 144 / 4 | `(-7.25,0,68.45,53.85)`；disabled 抬升效果，末帧销毁 |
| `skill-effect.role3.ssp.hit8_2` | 同 tick；反向偏20，`y-20` | `Role3Bullet8_2` / 134 / 30 | `(-618.7,-16.2,260.4,145.05)`；SpecialEffect 伤害对象，末帧销毁 |
| `skill-effect.role3.jsp.hit9` | row12 格3、hold=20；前方195，`y-160` | `Role3Bullet9` / 238 / 17 | `(-49.7,-38.6,348.3,235.85)`；SpecialEffect，末帧销毁 |
| `skill-projectile.role3.dgq.hit10` | row13 格2、hold=25；前方55，`y-25` | `Role3Bullet10` / 309 / 30 | `(-25,-19,175,101)`；Follow；本体同期 speedX ±15，末帧销毁 |
| `skill-effect.role3.xgq.hit11-cast` | row4 格4进入 `hit11`，随后格5 `hit11Frame2` | 无独立视觉 Symbol；`Role3_hit11` 是 SoundManager key | 起手只使用本体 cell；现代独立 cast 占位应删除，不派生伪素材 |
| `skill-projectile.role3.xgq.hit11` | 第二段格5、hold=160；前方135，`y-90` | `Role3Bullet11` / 93 / 27 | `(-90.2,-180.95,281.65,136.55)`；创建后本体 hold 改28并隐藏，末帧恢复显示 |
| `skill-effect.role3.tmc.hit12_1` | row4 格5、hold=160；角色原点 | `Role3Bullet12_1` / 108 / 160 | `(-99,-111.1,84,68)`；disabled 守护效果；二段触发令其跳到154，hold=150 时隐藏本体 |
| `skill-projectile.role3.tmc.hit12_2` | 二次技能；角色周围半径100生成10枚，随机目标 | `Role3Bullet12_2` / 125 / 1 | `(-35,-36.55,35.25,33.75)`；每枚旋转36°，StabBullet 0.3 秒追踪；原版明确关闭末帧销毁 |

所有对象的朝向都通过 `setDirect()` 进入共享 bullet/BBDC 镜像语义；上表 world 点是 MovieClip 注册点，不是裁切图左上角。158C 必须以 SVG bounds 计算 atlas trim/origin，不得把 FFDec PNG canvas 左上角当 world 点。

## 显示列表与 HUD

| parent/depth | 可见 child | 矩阵、动态状态与现代映射 |
| --- | --- | --- |
| Role3 `body` | `BaseBitmapDataClip` 的 body、equip | 两层在同一 `300×200` cell 合成；equip 后写入、在上层；左右 origin 见上，无 mask/filter/alpha |
| Role3 根 | `nameTextField` | `x=-colipse.width/2-30`、`y=-colipse.height/2-30`，动态玩家名；不得烘焙进 atlas |
| Role3 根动态层 | `Role3Bullet5Buff` | `addChild` 于 `(-20,-80)`，三档盾共享 19 帧循环视觉；buff 结束 removeChild |
| 场景对象层 | 15 个 Bullet Symbol | `gc.gameSence.addChild`；Follow/EnemyMove/SpecialEffect/Stab owner 见矩阵，不属于 HUD |
| HUD 根 | `RoleInfo` 574 | 940×590 固定层；P1 `(0,0)`，P2 `(920,0)` 且根 `scaleX=-1` |
| HUD 头像 | character 505 frame 3 | Role3 帧；局部约 `75.05×112`，注册 `(53.75,35.9)`；P2 随 HUD 根镜像 |
| HUD 状态 | 496、531/534/537、538..541、510、519/526 | HP/MP/EXP/等级/五槽/战意继续消费 `combat-hud-index.md` 的共享显示列表；Role3 不新增专属按钮或命中区 |
| HUD 输入 | P1 `Y/U/I/O/L`；P2 `8/4/5/6/3` | 五槽 510 与既有 549/555/561/567/573/418 命中合同不变 |

## 六段证据矩阵与实现合同

| 合同项 | 局部证据 | 共享调用链 | 几何/坐标证据 | 等级 | 未知/反证 | 验证 |
| --- | --- | --- | --- | --- | --- | --- |
| 本体/装备 | `Role3.initBBDC/setAction/scriptFrameOverFunc` | `BaseBitmapDataPool -> BaseBitmapDataClip -> BaseHero.body` | 22 图表、6×14 cell、左右 offset/origin | 交叉确认 | 影响实现的未知为0；死亡无 Symbol 是明确反证 | atlas 帧/hold 测试 + 940×590 动作对照 |
| 普攻 | `normalHit/enterFrameFunc/doHit1..3` | `HeroNormalAttackSystem` 与共享 Follow bullet | 精确 world 注册点、Symbol/id/帧/bounds | 交叉确认 | 无 | 时间窗测试 + 左右逐段叠图 |
| 盾/拉拽/移动 | `doHit5..8`、`BaseAddEffect.bajie_dunpai_buff` | Role3 Defense/Control/Impact systems + Projectile owner | 根局部 buff 与 world 注册点分列 | 交叉确认 | 无；三档没有三套 Symbol | 生命周期测试 + 全阶段对照 |
| 位移/追踪/终结 | `doHit10..12_2` | Mobility/Ultimate systems + Follow/Stab | 隐藏时序、半径100/10枚/旋转与 bounds | 交叉确认 | `Role3_hit11` 独立视觉被反证 | 时序/数量/方向测试 + 对照 |
| HUD/P1/P2 | `GameInfo/RoleInfo` 共享链 | Stage combat HUD snapshot/bridge | 574/505 frame3/510 与根镜像 | 交叉确认 | 无 Role3 专属控件 | 1P+合法2P 逐状态 |
| 现代映射 | 既有 manifest stable keys | 158C 单一 Role3 combat visual owner | atlas trim 保留注册点；不得改玩法数值 | 现代设计选择 | cast key 删除独立占位 | 资源门禁 + 全系统 + 浏览器 |

## 940×590 基准与差异计划

原版视觉基准由本任务保存的源图表、逐帧 SVG/PNG 与既有 574/505/510 HUD 根共同组成；入口固定 940×590。158C 必须覆盖 Role3 P1 单人、Role3 P2 与任一不重复角色的合法双人组合；逐项覆盖 wait/wait2/walk/run/jump/hurt/remove、三普攻、九技能的起手/持续/命中/结束、三档盾、1.8 秒拉拽、2.5 秒移动对象、xgq 隐藏恢复、tmc 守护/二段十枚追踪、左右方向和 HUD 更新。

同尺寸原版帧与现代帧应并排或半透明叠图，并记录 cell、注册点、裁切、depth、镜像和抗锯齿差异。可见对象差异清单只允许“原资源复用/等价时间轴重建/未完成”；允许的现代可见例外为空。

## 158C 现代接入与差异证据

- 单一现代 owner：`combat-hero-3` 持有入场本体/装备/三普攻/HUD，`combat-hero-3-skills` 持有 12 组技能对象和盾序列；SpecialUI 字节副本没有重复打包，Boot 没有回填战斗资源。
- 动画映射：`Role3CombatVisualSystem.ts` 保存 6×14 cell、wait/wait2、走跑跳、三普攻、九技能与 hurt hold；`Role3CombatVisualBridge.ts` 保存左右 origin `0.55/0.45`、装备上层、动态名字、盾根局部 `(-20,-80)`、xgq/终结二段隐藏和无 death 补造。
- 对象映射：29 帧普攻、349 帧技能对象与 19 帧盾均以 SVG bounds 导出的 registration origin 放置；`Role3_hit11` 计时对象明确不创建 Phaser view；tmc 十枚对象保留 36° 环形 rotation。
- HUD 映射：character 505 frame 3 作为 Role3 头像，由既有 574 HUD 的 P1/P2 镜像、五槽和动态字段 owner 消费，没有新增按钮或现代面板。
- 940×590 现代证据：`local-resources/regima/task-outputs/task-slice-158c-role3/qa/` 保存 P1、普攻、合法 P1 Role1 + P2 Role3、P2 方向四张截图；原版基准继续由本索引引用的源图表、逐帧 PNG/SVG 和 574/505/510 显示列表承载。
- 可见差异清单：本体/装备、普攻、技能对象、盾和 HUD 头像均为“原资源复用”；hold、镜像、隐藏和十枚追踪为“等价时间轴重建”；用户批准的现代可见例外为 0，Role3 范围内未完成项为 0。浏览器 console warning/error 为 0。

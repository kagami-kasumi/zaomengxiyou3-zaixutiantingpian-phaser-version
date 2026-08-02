# Role4 沙僧战斗视觉索引

本文闭合 `TASK-SETTINGS-069D` 的权威实现输入。范围只含 Role4 铲/弓双形态本体与装备、角色根动态状态、普攻、全部已实现技能及附属对象、既有战斗 HUD；不实现动画，不扩 Role5 或宠物。

## 待证明问题与来源包

待证明项为：双形态动作表和装备叠层、三段普攻、`zq/mbyj/wdww/jdz/mds/qlj/tkj/dzj/lybj/mmw` 的全部可见对象、巫毒娃娃、毒爆/加速状态、方向与销毁、Role4 HUD 映射，以及每个现代 stable key 的唯一来源。

`assets/ShaShen.swf` 与 `assets/SpecialUI/ShaShen.swf` 的 SHA-256 均为 `721382AF64A6B12A6D5087D5A05A6A7E577FE4423B666F4E1F16355B59831440`，SymbolClass 内容相同。因此普通包是本体、装备、普攻和技能对象的唯一派生 owner，SpecialUI 只保留加载兼容证据，禁止重复打包。

但 `ShaShen.swf` 不是换装全集。恢复语料库的全量 SymbolClass 精确检索补出以下跨包资源：

| source package | Role4 Symbol | character id |
| --- | --- | --- |
| `assets/20120117.swf` | `ROLE4_SHOVEL_6`、`ROLE4_ARROW_6` | 3、4 |
| `assets/20120119.swf` | `ROLE4_SHOVEL_5/7`、`ROLE4_ARROW_5/7`、`ROLE4_EQUIP_6` | 8/12、14/13、6 |
| `assets/20120203.swf` | `ROLE4_SHOVEL_8`、`ROLE4_ARROW_8` | 4、3 |
| `assets/20120808.swf` | `ROLE4_SHOVEL_10`、`ROLE4_ARROW_10` | 9、8 |
| `assets/MagicWeapon2.swf` | `ROLE4_EQUIP_998` | 19 |

因此权威全集为 18 张铲体、18 张弓体和 14 张装备表：衣装 id `0..11,112..115,222,6666`；装备 id `0..6,9..11,222,998,999,6666`。50 张表全部为 `1200×2800`、`6×14` 个 `200×200` cell。`ROLE4_EQUIP_998` 已由 `MagicWeapon2.swf` 闭合，不能再依据 `ShaShen.swf` 单包把它写成缺失。

本地只读派生位于 `local-resources/regima/task-outputs/task-settings-069d-role4/`：源包 XML/SymbolClass、50 张本体/装备表、27 个 Role4 Sprite 的 875 张逐帧 SVG、`SpeedUp` 16 张 SVG，以及巫毒娃娃表。该目录受 Git 忽略，只是可复核证据，不是现代资源目录。

## 本体、装备与双形态动作表

`Role4.initBBDC()` 先放 `body`，再把 `equip` copyPixels 到同一 `200×200` 输出，因此装备位于本体上层但不是独立场景 child。武器 id `4/5/9/998` 选择弓体，其余选择铲体；装备始终按实际 weapon id 取表。方向 `0` 使用源图，方向 `1` 使用水平镜像图并反向取列。

`BaseBitmapDataClip(200,200)` 配合 `setOffsetXY(15,-13)`：方向 0 的局部位置为 `(-115,-113)`，现代 origin `(0.575,0.565)`；方向 1 为 `(-85,-113)`，origin `(0.425,0.565)`。源图注册点、镜像取列和角色 world 根三者必须保持，不能按非透明 bounds 各帧居中。

下表 `hold` 单位为逻辑 tick。`repeat` 表示 `frameCount` 大于该行可见 cell 数时，AS3 会重播该 cell 序列后才执行动作结束回调。

| 形态 | row / cell | 动作 | hold / repeat | 结束合同 |
| --- | --- | --- | --- | --- |
| 共用 | 0 / 0..5 | `wait` | `2,2,2,3,2,4`；六格序列共推进 36 keyframe，即重复 6 次 | 转 `wait2` |
| 共用 | 1 / 0..5 | `wait2` | `2,2,2,13,2,24` | 转 `wait` |
| 共用 | 2 / 0..3 | `walk` | `4,4,4,4` | 4 格循环 |
| 共用 | 3 / 0..3 | `run` | `2,2,2,2` | 4 格循环 |
| 共用 | 4 / 0,1,2,5 | `jump1/jump3/hurt/hit11` | `1,1,8,4`；换装后的 `hurt` hold 为 15，是原版重载差异 | jump 保持；hurt/hit11 回 wait |
| 共用 | 5 / 0..4 | `jump2` | `2,2,2,2,2` | 转 jump3 |
| 铲 | 6 / 0..2 | `hit1` | `2,2,6` | 回 wait |
| 铲 | 7 / 0..2 | `hit2` | `2,2,11` | 回 wait |
| 铲 | 8 / 0..3 | `hit3` | `1,1,1,2`；四格序列重复 3 次 | 清水平速度并回 wait |
| 铲 | 9 / 0..1 | `hit4`、`hit5` | `2,19` | 回 wait |
| 铲 | 4 / 4 | `hit6` | `10` | 回 wait |
| 铲 | 10 / 0..2 | `hit7`、`hit10` | `2,2,30` | 回 wait；hit10 清速度 |
| 铲 | 11 / 0..3 | `hit8` | `2,2,2,15` | 回 wait |
| 铲 | 12 / 0..2 | `hit9` | `2,2,16` | 清 y 速度并回 wait |
| 铲 | 13 / 0..2 | `hit12` | `2,2,14` | 显示本体并回 wait |
| 弓 | 6 / 0..4 | `hit1`、`hit2` | `2,2,1,1,3` | 回 wait；两动作共用同一 body row 和 `Role4BulletArrow1` |
| 弓 | 7 / 0..5 | `hit3` | `2,2,2,2,2,4` | 回 wait |
| 弓 | 8 / 0..4 | `hit4` | `2,4,1,1,10` | 回 wait |
| 弓 | 4 / 4,3 | `hit5`、`hit6` | `20`、`10` | 回 wait |
| 弓 | 9 / 0..2 | `hit7` | `2,2,30` | 回 wait |
| 弓 | 10 / 0..4 | `hit8` | `2,2,1,1,12` | 清位移并回 wait |
| 弓 | 11 / 0..5 | `hit9` | `2,2,2,2,2,20` | 清 y 速度并回 wait |
| 弓 | 12 / 0..4 | `hit10` | `2,7,1,1,25` | 回 wait |
| 弓 | 13 / 0..5 | `hit12` | `2,18,2,2,2,24` | 分段位移/转向结束后回 wait |

Role4 没有独立死亡 Symbol；`BaseHero` 死亡路径移除角色显示对象。158D 不得以 tint、alpha、文字或单帧姿势补造死亡动画。

## 普攻、技能与附属对象矩阵

下表 bounds 是 FFDec 24fps 逐帧 SVG 相对 Symbol 注册点的 union `(xmin,ymin,xmax,ymax)`。除明确覆盖外，`BaseBullet.isDestroyWhenLastFrame=true`；Follow 对象同步角色位移和水平朝向，SpecialEffect 保持 world 注册点。

| stable key | AS3 触发 / world 注册点 | Symbol / id / 帧 | bounds 与生命周期 |
| --- | --- | --- | --- |
| `normal-attack-effect.hero4.shovel.hit1` | hit1 x1、hold=2；前方20，`y+30` | `Role4Bullet1` / 256 / 7 | `(-104,-51,108,44.7)`；Follow，末帧或角色受击销毁 |
| `normal-attack-effect.hero4.shovel.hit2` | hit2 x1、hold=2；前方15，`y` | `Role4Bullet2` / 286 / 11 | `(-143,-103,71,81)`；Follow，末帧/受击销毁 |
| `normal-attack-effect.hero4.shovel.hit3` | hit3 x0、hold=1；角色 speedX `±8` | `Role4Bullet3` / 265 / 4 | `(-113,-46,114.85,52.8)`；Follow，末帧/受击销毁 |
| `normal-attack-effect.hero4.arrow.hit1` | hit1/2 x2、hold=1；前方90，`y` | `Role4BulletArrow1` / 68 / 12 | `(-374.4,-44,159,64)`；world 特效，末帧销毁 |
| `normal-attack-effect.hero4.arrow.hit3` | hit3 x1、hold=2；前方115，`y-20` | `Role4BulletArrow2` / 71 / 15 | `(-366.1,-150.65,169.8,134.9)`；world 特效，末帧销毁 |
| `skill-projectile.role4.zq.shovel.hit4` | row9 x1、hold=19；前方245，`y-110` | `Role4Bullet4` / 328 / 20 | `(13,10.9,252.95,170.85)`；Follow 伤害，末帧/受击销毁 |
| `skill-projectile.role4.zq.arrow.hit4` | row8 x2、hold=1；前方30，`y` | `Role4BulletArrow4` / 75 / 13 | `(-543.5,-30.85,43.9,34.65)`；world 伤害，末帧销毁 |
| `skill-effect.role4.wdww.hit5` | 铲 row9 x1 hold19 / 弓 row4 x4 hold20；前方115，`y-110` | `Role4Bullet5` / 332 / 15 | `(-648.4,-874.7,950.95,1101.75)`；置于角色下一 depth、Follow、disabled、末帧/受击销毁 |
| `skill-summon.role4.wdww.doll` | hit5 hold14 选中面向侧最近目标；角色 world 点 `y-20` | `Role4Hit5` / bitmap 35 / 6 个有效 `116×120` cell | 源表 `1630×120`；只用首 6 cell、hold `2,2,2,3,2,4` 循环；10 秒、目标死或新娃娃替换时销毁 |
| `skill-projectile.role4.mbyj.hit6` | row4 x4/x3、hold10；前方25，`y-30` | `Role4Bullet6` / 411 / 1 | `(-28,-29,69.2,72.3)`；disabled，不按末帧销毁；最多8跳，按 `distance/500*0.96s` tween，无目标1秒淡出 |
| `skill-effect.role4.jdz.hit7_1` | row10/9 x2、hold20；前方155，`y-50` | `Role4Bullet7_1` / 418 / 238 | `(-41.55,71.6,244.8,126.9)`；置于角色下一 depth、disabled；释放三段时显式销毁 |
| `skill-projectile.role4.jdz.hit7_2` | 同一 body cell hold8；前方150，`y-70` | `Role4Bullet7_2` / 423 / 230 | `(-768,-384,960,576)`；三枚 world 对象位于基点、`±40/-20`、反向 `±40/-10`；新 cast 先清旧对象，末帧销毁 |
| `skill-projectile.role4.qlj.shovel.hit8` | row11 x2、hold2；前方125，`y-30` | `Role4Bullet8` / 373 / 5 | `(-69.05,-8.7,135.9,88.05)`；Follow 伤害，末帧/受击销毁 |
| `skill-effect.role4.qlj.arrow.hit8-1` | row10 x0、hold2；前方75，`y-60` | `Role4BulletArrow8_1` / 157 / 9 | `(0,0,124.2,128.1)`；Follow disabled，末帧/受击销毁 |
| `skill-projectile.role4.qlj.arrow.hit8-2` | 同 tick；前方65，`y-10` | `Role4BulletArrow8_2` / 153 / 17 | `(-91.4,-22.05,59.3,102.25)`；world 伤害，角色同期斜向 `±25/-25`，末帧销毁 |
| `skill-effect.role4.tkj.shovel.hit9-1` | row12 x0、hold2；角色 world 点 | `Role4Bullet9_1` / 366 / 9 | `(-52.55,-22.8,67.2,57.85)`；Follow disabled，末帧/受击销毁 |
| `skill-projectile.role4.tkj.shovel.hit9-2` | row12 x2、hold13；`y-80` | `Role4Bullet9_2` / 347 / 7 | `(-48,-143.2,61.35,127.6)`；Follow 伤害，角色同期上跳，末帧/受击销毁 |
| `skill-effect.role4.tkj.arrow.hit9-1` | row11 x0、hold2；前方80，`y-80` | `Role4BulletArrow9_1` / 137 / 20 | `(-1.65,-1.7,149.25,157.4)`；Follow disabled，末帧/受击销毁 |
| `skill-projectile.role4.tkj.arrow.hit9-2` | row11 x1、hold2；前方60，`y+30` | `Role4BulletArrow9_2` / 123 / 18 | `(-99.95,-125.55,214,436.7)`；Follow 伤害，末帧/受击销毁 |
| `skill-projectile.role4.dzj.shovel.hit10` | row10 x0、hold2；前方150，`y-50` | `Role4Bullet10` / 479 / 37 | `(-130.65,-35.3,222.5,139.4)`；world 伤害，角色同期 speedX `±20`，末帧销毁 |
| `skill-effect.role4.dzj.arrow.hit10-1` | row12 x0、hold2；角色 world 点 | `Role4BulletArrow10_1` / 241 / 13 | `(-145.1,-73,29.3,79)`；Follow disabled，末帧/受击销毁 |
| `skill-projectile.role4.dzj.arrow.hit10-2` | row12 x4、hold24；前方225，`y-80` | `Role4BulletArrow10_2` / 214 / 12 | `(-84.75,15.35,190.95,128.35)`；world 伤害，末帧销毁 |
| `skill-effect.role4.lybj.marker` | row4 x5、hold4；角色 world 点 | `Role4Bullet11` / 414 / 1 | `(-48.05,-21.85,49.6,22.45)`；置于角色下一 depth、disabled、单帧常驻；10秒、离屏、传送或关卡清理销毁 |
| `skill-projectile.role4.mmw.shovel.hit12` | row13 x2、hold14；前方150，`y` | `Role4Bullet12` / 443 / 91 | `(-507.45,-59.5,501.55,71)`；不按末帧销毁，显式 `3.4s` owner，期间跟原技能伤害窗口 |
| `skill-effect.role4.mmw.arrow.hit12-1` | row13 x0/x4、hold2；前方80，`y-100` | `Role4BulletArrow12_1` / 201 / 20 | `(-52,-17,188,201)`；置于角色下一 depth、Follow disabled，末帧/受击销毁 |
| `skill-projectile.role4.mmw.arrow.hit12-2` | 同 tick；角色 world 点 | `Role4BulletArrow12_2` / 171 / 20 | `(-86.95,-64.9,63.55,81.45)`；Follow 伤害，末帧/受击销毁 |
| `skill-projectile.role4.mmw.arrow.hit12-3` | body hold17/12/6 且 x1/x5；角色周围半径100 | `Role4BulletArrow12_3` / 176 / 10 | `(-362.45,-47.65,167.45,285.4)`；每波10枚、36°旋转、三波，world 特效末帧销毁 |
| `skill-effect.role4.mds.bomb` | 毒层刷新超过2时在目标 world 点创建 | `Role4MDS` / 409 / 20 | `(-48,-89,67.2,38.4)`；Follow target、disabled，末帧/目标受击销毁 |
| `skill-buff.role4.mds.speedup` | 同次毒爆给 Role4 `SPEEDUP` 3秒 | `assets/StageCommon.swf` `SpeedUp` / 38 / 16 | `(-46.4,-48.5,66.6,32.85)`；角色根 child `(0,25)`，同名去重，3秒后移除；16帧含8个独立 SVG状态 |

以上共 897 个源时间轴/有效 cell 帧：Role4 包 875 个 Sprite 帧、娃娃 6 个有效 cell、共享 `SpeedUp` 16 帧。`Role4Bullet7_1/7_2` 的 238/230 是实际 SWF 时间轴，不得按 SVG 去重数 10/15 缩短；`Role4Bullet6/11` 单帧也不得因此丢失 tween/10秒 owner。

## 显示列表、HUD 与 P1/P2

| 区域 / depth | 原版 child 与合同 |
| --- | --- |
| 角色动态根 | `BaseHero.body` 内只有一个 `BaseBitmapDataClip`；其内部依次合成本体、装备。无 mask/filter/alpha；朝向由镜像源图与不同 x 原点共同决定 |
| 角色名字 | `nameTextField` 在 body 后加入角色根，50×100 隐藏碰撞根下局部约 `(-55,-80)`；动态文字为“沙僧” |
| 角色状态 | `SpeedUp` 在触发时 `addChild` 到角色根 `(0,25)`，因此位于既有 body/name 上层；同名 child 去重，3秒移除 |
| 场景对象层 | 普攻/技能 Bullet 通常 `gc.gameSence.addChild`；`Role4Bullet5`、`Role4Bullet7_1`、`Role4Bullet11`、`Role4BulletArrow12_1` 明确 `addChildAt(heroIndex)`，位于角色下一 depth；巫毒娃娃进入 likeMonster/world owner |
| HUD 根 | `OtherMat1.swf` `RoleInfo` character 574；P1 `(0,0)`，P2 `(920,0)` 且根 `scaleX=-1`，内部动态文字反向抵消 |
| HUD 头像 | character 505 frame 4，帧标签“沙僧”；P2 随 HUD 根镜像 |
| HUD 状态 | character 496、531/534/537、538..541、510、519/526；HP/MP/EXP/等级/五槽继续消费 `combat-hud-index.md` 的共享显示列表，Role4 不新增专属按钮或命中区 |
| HUD 输入/命中 | P1 `Y/U/I/O/L`，P2 `8/4/5/6/3`；五入口继续使用 549/555/561/567/573 与共享 418 hit |

原版视觉基准由本任务保存的 50 张原始图表、897 个对象/状态帧和既有 574/505 frame4/510 HUD 根共同组成，入口固定 940×590。158D 必须覆盖 Role4 P1 单人、Role4 P2 与任一不重复角色的合法双人组合；逐项覆盖 wait/wait2/walk/run/jump/hurt/remove、铲/弓切换、五段普攻映射、十项技能的起手/持续/命中/结束、巫毒娃娃、毒爆/SpeedUp、左右方向和 HUD 更新。原版与现代需同尺寸并排或半透明叠图，并记录 cell、注册点、裁切、层级、镜像和生命周期差异。

## 六段证据矩阵

| 行为合同项 | 局部证据 | 共享调用链 | 几何/坐标证据 | 等级 | 未知与反证条件 | 验证 |
| --- | --- | --- | --- | --- | --- | --- |
| 双形态/装备 | `Role4.as:248..315` | `BaseHero.getCurWeaponId`、`BaseBitmapDataPool`、`BaseBitmapDataClip` | 5个恢复包；50张 `1200×2800`；`200×200` cell；origin `0.575/0.425,0.565` | 交叉确认 | 影响实现未知0；若 source hash/SymbolClass变化重开 | 资源枚举、动作 cell 测试、左右叠图 |
| 普攻/技能对象 | `Role4.as:658..2097`、`MonsterRole4Hit5.as`、`BaseAddEffect.as` | `BaseBullet`、Follow/SpecialEffect、现代 Role4 systems | 29行 Symbol/id/frame/bounds/world点/depth | 交叉确认 | 影响实现未知0；不得把长时间轴按独立图数压缩 | 帧数/原点/lifetime专项 + 940×590逐状态 |
| 头顶/HUD | `Role4`构造器、`showSpeedUp`、`RoleInfo` | hero effect owner、GameInfo/HUD snapshot/bridge | 角色根 `(0,25)`；574/505 frame4/510；P2根镜像 | 交叉确认 | Role4无专属HUD按钮 | 1P+合法2P HUD/状态叠图 |
| 现代映射 | 既有 stable keys 与 Role4 systems | 158D atlas/view bridge/scene bundle | body、技能对象、SpeedUp、portrait各单一 owner | 现代设计选择 | 允许现代可见例外0 | manifest/annotation/占位防回填门禁 |

## 158D 权威实现输入

- 资源 owner：`ShaShen.swf` 负责本包的 38 张 body/equip 表、巫毒娃娃和全部 27 个 Role4 Sprite；日期包与 `MagicWeapon2.swf` 只补其精确 Symbol；SpecialUI 副本不打包；`StageCommon.swf` 只提供 `SpeedUp`；HUD 头像来自 OtherMat1 character 505 frame4。
- 现代 body view 必须以一个 `200×200` cell 同步合成本体/装备，保持左右 origin 和行内 hold；换装后 hurt hold 8→15 是原版可观察重载差异，不得静默统一。
- 现代对象 view 必须保留 29 行逐对象的 world/local 坐标、depth、Follow/静态、末帧/定时/tween/显式销毁和多实例数量；特别是 jdz 3枚、mmw 每波10枚三波、mbyj 1帧tween、lybj 1帧10秒。
- 当前 `AssetManifest.sourceAssetFamilies.role4NormalAttackEffects/role4FinisherProjectiles` 的 `missing-original` 已被本任务反证；158D 应删除该陈旧状态并把所有 Role4 stable key 改为真资源定义。
- 可见差异清单：本体/装备、普攻、技能、娃娃、MDS/SpeedUp 与 HUD 头像均为“原资源复用”；hold、镜像、Follow/tween、长时间轴和多实例为“等价时间轴重建”；用户批准的现代可见例外为0，Role4范围内待实现项仅为158D现代接入。

影响 Role4 接入的未知为 0。

## TASK-SLICE-158D 现代接入与差异证据

- `public/assets/combat/role4/` 保存50张完整本体/装备图表、875个技能/普攻SVG帧、6个娃娃有效cell与16帧共享 `SpeedUp`；HUD frame4落入 `public/assets/ui/combat-hud/portraits/role4.png`。资源目录和manifest完整保留18铲身、18弓身与14装备身份。
- 当前玩法状态只公开铲/弓模式而未公开任意衣装/装备视觉id，因此 `combat-common` 只预载当前正式装束的铲身0、弓身0、装备0与装备4；其余46张仍由manifest完整编目，待未来换装状态提供明确id后按同一owner选择。这是数据模型映射边界，不是当前装束的可见替代。
- `Role4CombatVisualSystem/Bridge` 以30fps tick投影6×14 body cell，同步本体/装备、左右origin、动作hold和双形态；死亡直接移除，不使用灰色/tint占位。五普攻与全部已实现技能优先走真序列，MDS毒爆播放20帧，SpeedUp在角色根上层跟随并按16帧循环。
- 940×590正式QA入口观察到Role4 P1本体/HUD正确显示且console为0；合法 `Role1 + Role4` 双人组合切到P2后，Role4弓形态、本体与P2 HUD正确显示且console为0。保存证据：`local-resources/regima/task-outputs/task-slice-158d-role4/qa/role4-p2-legal-party-arrow-940x590.png`。
- 确定性门禁核对18+18+14图表、5普攻、22技能序列、MDS、娃娃与SpeedUp共897帧、全部runtime key、origin、hold、HUD与无`missing-original`/Arc/Text回填。用户批准的现代可见例外仍为0。

Role4真视觉已由158D复现；本页继续作为原版证据与现代映射的共同索引，Role5不得从本结论外推。

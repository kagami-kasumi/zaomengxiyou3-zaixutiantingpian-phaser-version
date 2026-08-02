# Role5 白龙战斗视觉索引

本文闭合 `TASK-SETTINGS-069E` 的权威实现输入。范围只含白龙枪/剑双形态本体与换装层、普攻、现代已实现技能及附属对象、标记/阵列对象和既有战斗 HUD；不实现动画，不扩宠物或其他角色。

## 待证明问题与来源包

待证明项为：枪/剑本体与换装层的真实 owner、双形态动作/hold/方向原点、枪形 `doSingleHit` 的对象身份、剑普攻及龙魂剑强化变体、十项已实现技能、随身箭/阵列/状态/瞬移对象、P1/P2 HUD，以及恢复语料库中确实不存在的名称应如何处理。

| source package | SHA-256 | 权威范围 |
| --- | --- | --- |
| `assets/bailong.swf` | `7EEB9C0FD8944585D2CF55E1A404880BC0E42CB8ECF862F7D4D783C4476EF0A0` | 13 张枪形衣装表、12 张装备表、`Role5Bullet1..10`、瞬移/状态/枪系遗留对象 |
| `assets/bailongSword.swf` | `CCF3AAE7376C96787BAA775EFE0B9C2354493EE01AFC4376E3313B3C7D5B9350` | 剑形动作根、9 个衣装层、1 个武器层、剑普攻/技能/随身箭/阵列对象 |

本地只读派生位于 `local-resources/regima/task-outputs/task-settings-069e-role5/`：两个源包 XML/SymbolClass、主程序 `Role5` P-code、25 张枪形表、29 个枪包 Sprite 的 468 帧 SVG、剑包所选 Sprite 的 1104 帧 SVG和全恢复语料库 SymbolClass 精确检索。该目录受 Git 忽略，不是现代资源目录。

全量 SymbolClass 检索只在 `bailong.swf` 命中 `ROLE5_*`/`Role5Bullet*`，只在 `bailongSword.swf` 命中剑形对象；`Role5runattack`、`Role5lmjly1/2`、`fhf*ly*_spear`、`zxcly*_spear` 和 `idle_spear` 均未命中任何恢复包。它们不得用相似 Sprite 猜造。

## 枪/剑本体、换装与动作

枪包 25 张图均为 `2800×5950`：衣装 id `0..7,11,12,14,15,16`，装备 id `0..5,9,12..16`。它们是枪形换装源表；运行时再由 `BaseBitmapDataPool.analysisResourceMC()` 对动作根逐帧合成衣装和武器，并同时产生左右镜像。剑形则由 `bailongSword.swf` 的动作根及 `fashion_yf1..9`、`fashion_wq1` 动态 `gotoAndStop(clothId/weaponId)` 合成；龙魂剑状态把 weapon id 强制为 `17`。

`BaseBitmapDataClip(290,290)` 的 body 是角色动态根内唯一 child；换装已合成进同一帧，不是场景 sibling。枪形 offset `(14,3)`：方向0局部 `(-159,-142)`、origin `(0.5483,0.4897)`，方向1 `(-131,-142)`、origin `(0.4517,0.4897)`。剑形 offset `(13,3)`：origin `(0.5448,0.4897)` / `(0.4552,0.4897)`。禁止按每帧非透明 bounds 重新居中。

| 形态 | 动作 / source | 可见帧与 hold tick | 结束合同 |
| --- | --- | --- | --- |
| 共用 | `wait` / `idle_*` | 6格 `3,3,4,3,3,4`，frameCount 42，重复7次 | 重新进入 wait |
| 枪 | `wait2` / `idle1_spear` | 8格 `6,3,3,3,3,3,3,4` | 回 wait；剑形也沿用枪形 wait2 |
| 双形态 | `walk`、`run` | 4格 `4,4,4,4`；4格 `3,3,3,3` | 循环 |
| 双形态 | `jump1/2/3` | `1`；4格 `2,2,2,2` 且 frameCount 8；`1` | jump1/3保持，jump2转jump3 |
| 枪 | `hit1..4` | 4格 `2,4,2,7`；4格 `2,3,2,8`；5格 `2,5,1,2,8`；11格 `3,4,1,1,1,1,1,1,2,2,6` | 回 wait |
| 枪 | `hit5`、`hit114` | `jumpattack_spear` 3个hold `2,4,6`、frameCount 4；`runattack_spear` 4格 `2,3,2,8` | 空中回 jump3；跑攻回 wait |
| 剑 | `hit18..21` | `jattack1` 4格 `2,3,2,3`；`jattack2` 5格 `2,1,3,2,1`；`jattack3` 4格 `3,2,2,2`；`jattack4` 4格 `2,7,2,8` | 回 wait |
| 剑 | `hit22`、`hit114_1` | `jjumpattack` 3格 `2,4,6`；`jrunattack` 4格 `2,4,2,7` | 空中回 jump3；跑攻回 wait |
| 技能 body | `hit6..11,23..29` | 分别消费 `jskill*`/精确动作根；hold 见 `Role5.setAction()`，不得以外层一帧 wrapper 代替内层 3..7 格 | 地面回 wait，空中回 jump3 |
| 双形态 | `hurt` | 枪 `10`，剑 `7` | 重置重力后回 wait |

白龙没有独立死亡 Symbol；`BaseHero` 死亡路径移除显示对象。158E 不得补 tint、alpha、文字或单帧死亡姿势。

## 普攻与枪形 `doSingleHit` 身份

`Role5.enterFrameFunc()` 的枪形五次调用固定传入 `param3=1..5`，世界点分别为前方 `37/57/187/23/95`、`y+43/49/49/53/47`。恢复枪包同时且仅精确提供 `Role5Bullet1..5`，其 P-code `getRealPower()` 又把这五名归为同一普攻系数。因此 `doSingleHit(...,N,...) -> FollowBaseObjectBullet("Role5Bullet" + N)` 达到交叉确认；旧的“枪形附属对象整体未知”结论作废。当前反编译缺失的是 helper 正文，不是对象身份。

| stable key | Symbol / id / 帧 | union bounds | 创建与生命周期 |
| --- | --- | --- | --- |
| `normal-attack-effect.hero5.spear.hit1` | `Role5Bullet1` / 76 / 8 | `(-102.55,-214.55,153.3,55.15)` | hit1 cell1；前方37、y+43；Follow、末帧/受击清理 |
| `normal-attack-effect.hero5.spear.hit2` | `Role5Bullet2` / 87 / 10 | `(-105.75,-59.5,153.15,19.5)` | hit2 cell1；前方57、y+49；Follow |
| `normal-attack-effect.hero5.spear.hit3` | `Role5Bullet3` / 96 / 8 | `(2.2,-180.9,199.65,27.1)` | hit3 cell1；前方187、y+49；Follow |
| `normal-attack-effect.hero5.spear.hit4` | `Role5Bullet4` / 113 / 16 | `(-164.95,-83.8,188.85,9.2)` | hit4 cell0；前方23、y+53；Follow |
| `normal-attack-effect.hero5.spear.hit5` | `Role5Bullet5` / 175 / 8 | `(-141,-190.7,174,61.25)` | 空中 hit5 cell1；前方95、y+47；Follow |
| `normal-attack-effect.hero5.spear.run-hit` | `Role5runattack` / 未命中 | 未知 | hit114 cell0；前方101.6、y+51.6；两个目标包、主包及恢复语料库 SymbolClass 均无定义，禁止猜造；158E只复用已证实的本体跑攻 |
| `normal-attack-effect.hero5.sword.hit1` | `swordhit1` 807/10；`_1` 467/15 | base `(-88.8,-219.25,148,44.75)`；强化 `(-106,-177,171,60)` | 前方54.8、y+51.6；普通 Follow；强化改为速度8、加速度2.4、距离700的 EnemyMove |
| `normal-attack-effect.hero5.sword.hit2` | 802/9；444/15 | `(-63,-188.65,205,30.35)`；`(-75.05,-158,196.95,68)` | 前方50.2、y+37.35；同上 |
| `normal-attack-effect.hero5.sword.hit3` | 793/9；421/15 | `(-194,-117.75,172,35.25)`；`(-120,-158,201,62)` | 前方43.5、y+52.7；同上 |
| `normal-attack-effect.hero5.sword.hit4` | 786/19；398/19 | `(-256,-98.95,183,23.05)`；`(-271.85,-102.25,174.15,41.75)` | 前方47.1、y+54.2；强化时基础与强化 Follow 同时创建 |
| `normal-attack-effect.hero5.sword.hit5` | 556/15；369/15 | `(-128,-136.25,153,51)`；`(-184.6,-199.1,209.4,93.9)` | 前方42.2、y+54；强化时双对象 |
| `normal-attack-effect.hero5.sword.run-hit` | 563/15；378/20 | `(-163,-56.65,198,1.35)`；`(-229,-97.1,221,49.9)` | 前方35、y+52；Follow；角色同期 speedX ±10 |

## 已实现技能、状态与附属对象

下表 bounds 均相对 Symbol 注册点。除明确覆盖外，Bullet 进入 `gameSence`，Follow 随角色与方向，SpecialEffect 保持 world 点，末帧按 `BaseBullet` 销毁。

| stable key / 行为 | Symbol / id / 帧 / bounds | 创建、层级与生命周期 |
| --- | --- | --- |
| `skill-projectile.role5.xlc.hit6` | `sword_xlc` / 544 / 16 / `(-179,-70,170,13)` | 前方35、y+52；Follow伤害；角色 speedX ±35 |
| `skill-projectile.role5.lxuanj.hit7_1` / `hit8` | `sword_lxuanj1` 359/10、`2` 360/10；均 `(0,0,205,205)` | 起点前方188/548、y+23 后 helper 再 `y-120`；速度 ±36、距离999，第二段反向 |
| `skill-effect.role5.yyb.cast` | `Role5Bullet9` / 166 / 16 / `(-55.05,-133.85,60.95,30.95)` | 前方7、y+47；Follow disabled、末帧 |
| `skill-buff.role5.yyb.status` | `Role5Skill4Effect` / 36 / 15 / `(-41.5,-138.25,46.5,17.25)` | 角色根 child `(0,50)`，名 `yyb`，同名去重，状态到期移除 |
| `skill-effect.role5.yyb.cure/thunder` | `Role5Skill4Cure` 294/22、`Role5Skill4Thunder` 217/13 | 枪/反转两状态命中被动；cure 跟角色 `y+63`，thunder 在怪物底部；现代行为尚未接线，不得由158E单独新增玩法 |
| `skill-projectile.role5.xkjz.hit10` | `sword_xkjz` / 777 / 57 / `(0,0,407,562)` | 默认前方486、`y-465`；面向侧目标时目标旁208、`target.y-465`；SpecialEffect伤害 |
| `skill-effect.role5.tlj.status` | `sword_tlj1` 888/38、`sword_tlj2` 871/38；均 `(-112,-76,95,82)` | 角色根 child `(9,20)`，按 `_invert` 二选一，名 `Role5tlj`；到期/重施移除；`tlj_sword/jtlj` 仅是3格 body动作 |
| `skill-projectile.role5.pkz.hit24_1` | `swordskill2_1` 854/15 / `(-84,-180.7,185.1,91.9)` | Follow伤害；龙魂剑改用 835 `swordqhskill2_1` 15帧 `(-324.4,-195,182.95,91.9)` |
| `skill-projectile.role5.pkz.hit24_2/3` | `swordskill2_2` 853/9 `(-101,-232,50,18)`；`2_3` 846/15 `(-292.5,-169.5,90.55,65.5)` | 二段 Follow 且不按末帧销毁；三段前显式销毁二段，三段为 world SpecialEffect |
| `skill-effect.role5.lxj.hit26` | `swordskill4` / 480 / 20 / `(-71.2,-220.55,61.8,-21.55)` | Follow disabled；添加龙魂剑状态；空 `dolxjfeijian()` 是明确反证，不派生飞剑视觉 |
| `skill-projectile.role5.mlsz.hit29` | `sword_mlsz1..5`：698/11、685/11、672/9、661/11、648/9 | body cell2..6依次在角色旁世界点创建；每个使用各自注册 bounds；全部 SpecialEffect hit29 |
| `skill-projectile.role5.mlsz.hit29.enhanced` | `sword_mlsz1_1..5_1`：827/825/823/821/819，均15帧 | 龙魂剑状态逐项替换；注册 bounds 左侧延展至 `x=-775`，不得按基础版裁切 |
| `skill-effect.role5.lysh.companion` | `swordskill5_3` / 493 / 6 / `(-50.5,-162.55,46.5,53.45)` | `BLMSkill5` 四实例：`(-95,-43)`、`(-48,-77)`×.95、`(0,-77)`×.9、`(45,-54)`×.9；owner置于角色下一 depth、跟随/镜像，逐枚充能隐藏，全部隐藏后 Empty |
| `skill-effect.role5.lysh.release` / shot | `swordskill5_1` 504/15；`swordskill5_2` 511/12 | release 为 Follow disabled；shot 从相对 `±42.2,y+6` 发射，速度22、距离2000、不按末帧销毁 |
| `skill-effect.role5.jrjl.cast` | `sword_jrjlsf` / 589 / 10 / `(-88,-88,93,89)` | Follow disabled cast；添加 JRJL 状态 |
| `skill-effect.role5.jrjl.companion` | `sword_jrjlsxj` / 602 / 6 / `(-169,12,-12,61)` | `JRJL` 三实例 `(96,17)`、`(66,-6)`×.95、`(112,45)`×.9；角色下一 depth、跟随/镜像；旧 manifest 把 companion 写成 cast 名，158E须纠正 |
| `skill-buff.role5.jrjl.status` | `jrjlbuff` / 621 / 27 / `(-108,-100,80,92)` | 角色根 child `(10,20)`，名 `Role5jrjl`，到期移除 |
| `skill-projectile.role5.jrjl.shot` | `sword_jrjljq` / 41 / 20 / `(-171,-20,140,89)` | 相对 `±42.2,y-27`；速度60、距离2000、动作hit30 |
| `normal-attack-effect.hero5.escape.before/after` | `Role5cloneEf2` 263/27 `(-328.55,-231.85,125.5,40.15)`；`Role5escapeEffect` 271/10 `(-112.15,-110.8,113.85,108.2)` | 瞬移前 world 点 `y+58`；瞬移后 Follow at new point，动作hit13；目标 y 钳到450 |

枪包 `Role5Bullet6..8/10_*`、`Role5Skill5Effect`、`Role5HitAdd` 和剑包 `swordskill3_*`、`jianqi`、`swordhit7*` 均已定位并保留逐帧派生，但它们属于当前不可达/未接现代行为或遗留 helper，不得仅因资源存在就由158E新增玩法。

## 显示列表、HUD 与视觉基准

| 区域 / depth | 原版 child 与合同 |
| --- | --- |
| 角色动态根 | `BaseHero.body -> BaseBitmapDataClip body`；枪形由衣装/装备表逐帧合成，剑形由动作根 + 9衣装层 + 1武器层合成；无额外 mask/filter/alpha |
| 名字/碰撞 | 隐藏 `ObjectBaseSprite` 碰撞 child；动态 `nameTextField` 在其后加入角色根，位置 `(-colipse.width/2-30,-colipse.height/2-30)`，文字“白龙” |
| 角色状态层 | `sword_tlj1/2` `(9,20)`、`jrjlbuff` `(10,20)`、`Role5Skill4Effect` `(0,50)` 均动态 addChild 到角色根、位于 body/name 之后；按 name 去重并在状态移除时销毁 |
| 场景对象层 | 普攻/技能 Bullet 进入 `gameSence`；BLMSkill5/JRJL 进入角色 parent 并强制置于角色下一 depth；阵列与瞬移前特效保持 world 注册点 |
| HUD 根 | `OtherMat1.swf` `RoleInfo` character 574；P1 `(0,0)`，P2 `(920,0)` 且根 `scaleX=-1`，内部动态文字反向抵消 |
| HUD 头像/状态 | character 505 frame5“白龙”；HP/MP/EXP/等级、战意、五槽与角色无关，共享 496、531/534/537、538..541、510、519/526 |
| HUD 输入/命中 | P1 `Y/U/I/O/L`，P2 `8/4/5/6/3`；五入口继续使用 549/555/561/567/573 与共享 418 hit |

原版视觉基准固定为 `940×590`。158E 必须覆盖白龙 P1 单人、白龙 P2 与任一不重复角色的合法双人组合：wait/wait2/walk/run/jump/hurt/remove、枪/剑切换、龙魂剑强化、两套普攻、十项技能起手/持续/命中/结束、四箭/三箭、五阵列、状态根 child、瞬移前后、左右方向和 HUD frame5。原版帧来自本任务的源表/1572个时间轴帧与既有574/505/510 HUD；现代版需同尺寸并排或半透明叠图，记录注册点、裁切、层级、镜像、长时间轴和生命周期差异。允许的现代可见例外为空。

## 六段证据矩阵

| 行为合同项 | 局部证据 | 共享调用链 | 几何/坐标证据 | 等级 | 未知与反证条件 | 验证 |
| --- | --- | --- | --- | --- | --- | --- |
| 双形态/换装 | `Role5.as:610..1460` | `BaseBitmapDataPool`、`BaseBitmapDataClip`、装备id与龙魂剑状态 | 两源包；25枪表；剑动作/10换装层；290×290左右origin | 交叉确认 | 影响实现未知0；枪形动作 wrapper 名未进SymbolClass但源表身份、hold与输出原点已闭合 | 资源枚举、hold/origin测试、左右叠图 |
| 枪形doSingleHit | `Role5.as:1680..1835`、P-code调用 | `FollowBaseObjectBullet`、`getRealPower`、现代普攻系统 | Bullet1..5精确id/帧/bounds/生成点 | 交叉确认 | helper正文缺失；若新P-code显示非字符串拼接重开；当前对象身份不再未知 | 五段资源/生成点测试 + 运行叠图 |
| 技能/附属对象 | `Role5.as:1850..4386`、`BLMSkill5/JRJL/BaseAddEffect/BaseMonster` | BaseBullet三类、状态owner、现代Role5 systems | 每对象Symbol/id/frame/bounds/world点/depth/多实例 | 交叉确认 | `dolxjfeijian`空；未达对象不新增玩法；Role5runattack按全语料库反证不猜造 | 帧数/原点/lifetime专项 + 940×590逐状态 |
| HUD/UI | `Role5`构造器、`RoleInfo.as` | GameInfo/HUD snapshot/bridge | 574/505 frame5/510；P2根镜像；状态child坐标 | 交叉确认 | 白龙无专属HUD按钮 | 1P+合法2P HUD/状态叠图 |
| 现代映射 | 既有 Role5 stable keys/systems | 158E atlas/view bridge/scene bundle | body、技能对象、companion、portrait各单一owner | 现代设计选择 | 纠正 tlj/jrjl companion 旧占位名；可见例外0 | manifest/annotation/占位防回填门禁 |

## TASK-SLICE-158E 权威实现输入

- `bailong.swf` 是枪形表、枪普攻与 Role5 状态对象 owner；`bailongSword.swf` 是剑形 body/action/fashion、剑普攻、技能、随身箭和阵列 owner。不得把枪形表当普通 `200×200` atlas，也不得把剑动作外层一帧 wrapper 当完整动画。
- 现代 body view 使用 `290×290` 输出语义和形态专属左右 origin；枪表/剑动态层的 cloth/weapon 选择必须分开，龙魂剑 weapon 17 是状态覆盖。
- `doSingleHit` 五对象身份已闭合为 `Role5Bullet1..5`；158E 应拆掉 `normal-attack-effect.hero5.spear.unresolved` 的旧合并占位。`Role5runattack` 只有调用无恢复定义，必须维持反证，不用 Bullet5/剑跑攻代替。
- 现有 `role5TljHit11` 源名 `role5_tlj/tlj_sword`、`role5JrjlCompanion` 源名 `sword_jrjlsf` 均是占位语义错误：前者应消费 `sword_tlj1/2` 状态，后者应消费 `sword_jrjlsxj` 三箭；cast `sword_jrjlsf` 另列。
- 每个对象保留 Follow/world/角色根/角色下一 depth、末帧/显式销毁、速度/距离、四箭/三箭/五阵列数量与状态去重。`dolxjfeijian()` 空函数和未达遗留对象不得补动画。
- 当前 `AssetManifest.sourceAssetFamilies.role5*` 的 `missing-original` 已被反证；158E 应改为真资源定义并增加 Arc/Text/placeholder projectile/单帧状态防回填门禁。
- 可见差异清单：可恢复的本体、换装、普攻、技能、状态、随身箭、阵列、瞬移与HUD头像均为“原资源复用”；合成、hold、镜像、Follow/移动、多实例为“等价时间轴重建”；`Role5runattack` 为“原代码引用但恢复语料库无定义，禁止猜造”；用户批准的现代可见例外为0。

影响 `TASK-SLICE-158E` 的可实现资源身份未知为 0；明确反证项不得转化为占位或虚构原版事实。

## TASK-SLICE-158E 现代接入结论

- `public/assets/combat/role5/` 现承载25张枪形本体/装备表、归一化290×290剑形动作和枪/剑普攻、技能、状态、随身箭、阵列与瞬移逐帧资源；派生脚本为 `tools/integrate-role5-combat-assets.mjs`。
- `Role5CombatVisualSystem` 保留枪/剑动作格、hold、方向origin和死亡移除；`Role5CombatVisualBridge` 独立持有body/equipment/name、角色根状态、四箭/三箭、五阵列、cast与瞬移显示层，没有tint、状态文字或单帧死亡替代。
- `HeroNormalAttackSystem` 已将枪五段拆为 `Role5Bullet1..5`，剑普攻与龙魂剑强化使用各自真序列；`Role5runattack` 继续解析为空视图，正式路径不显示Arc/Text或相似素材。
- `SceneAssetBundles` 是Role5资源唯一加载owner，HUD使用character 505 frame5头像；`?qaStage=1-1-role5` 与合法Role1+Role5双人入口用于940×590检查。
- 首次冷加载资源族为860文件、约58.5 MiB；专项证明stable key、帧序列与bundle归属，浏览器验收记录该冷加载成本供PG-009继续观察，不把它改写成资源缺失或隐藏占位。

现代可见例外仍为0；158E完成后，Role5与VS-062不再存在未解释视觉缺口。

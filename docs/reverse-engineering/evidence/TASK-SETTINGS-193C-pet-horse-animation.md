# TASK-SETTINGS-193C 马系动画证据

## 待证明问题

1. `horse1..4` 的 wait/follow、walk/warp、普攻、`sp/bd/bz/tmaoyi`、hurt 与 0 HP/dead 分别使用哪一行、多少帧和多少 host tick。
2. `20120203.swf`、`StageCommon.swf` 与关卡期 `pet1.swf` 的重名符号由谁实际提供。
3. 四本体、普攻、水泡/冰冻/冰锥、共享冰效和天马奥义的注册点、局部/世界矩阵、clock 及销毁条件是什么。
4. 现代 stable key 需要一对一接入、复用、补内部对象，还是删除占位。

权威真值为 `task-settings-193c.pet-horse-animation`，路径 `docs/reverse-engineering/ground-truth/manifests/task-settings-193c-pet-horse-animation.json`，关键范围为 `/states`、`/displayObjects`、`/baselines` 和 `/completeness`。

## Owner 裁决

| 对象 | 运行 owner | 交叉证据 | 裁决 |
| --- | --- | --- | --- |
| `PetHorseBmd1..3` | `assets/20120203.swf` characters 17/15/12 | `Aloader` 启动期先载入 20120203；关卡 `AssetsLoader` 之后才添加 `pet1` | 使用补丁 owner，不混用基础包 1/3/5 |
| `PetHorseBmd4` | `assets/pet1.swf` character 19 | 审计包集只有一个精确 SymbolClass | 使用唯一基础包 owner |
| `PetHorse1Bullet1/2`、`2Bullet1/2`、`3Bullet1..4` | `assets/20120203.swf` characters 129/124/118/101/97/93/88/82 | 启动加载时序、SymbolClass、AS3 `AUtils.getNewObj()` 名和 146 个根帧一致 | 全部使用补丁 owner |
| `PetHorse4Bullet5` / `PetHorse4Bullet5Explode` | `assets/pet1.swf` characters 699/695 | 唯一精确候选；699 根为 1 帧但内嵌 character 698 为 8 帧 | 下落物按 8 个 subframe 消费，爆炸为 30 根帧 |
| `PetHorseIceEffect` | `assets/StageCommon.swf` character 40 | `Aloader` 在 20120203 后、关卡 pet1 前载入 StageCommon；pet1 character 1107 是后来重名候选 | 选启动期 StageCommon owner |

三条源包链都进入 `ApplicationDomain.currentDomain`。这个真实时序闭合了 corpus 中原先的 owner 反证条件。

## 本体动作行与 host-tick 时序

`BaseObject.step()` 每个运行 step 调用一次 `BaseBitmapDataClip.step()`；`frameStopCount` 是 host tick，会随 20/24/30 fps 质量设置改变实际秒长。

| 形态 | 画布/偏移 | 动作行（持帧） | 结束行为 |
| --- | --- | --- | --- |
| horse1 | `80×80`，`(1,-10)` | wait/walk row0 `2,2,2,3,2,4`；hurt row1 `8`；dead row2 `2,2,2,2,1,2`；normal row3 `2,2,1,1,8`；sp row4 `2,2,2,8` | wait/walk 循环；hurt 静止后 wait；攻击回 wait；dead 销毁 |
| horse2 | `100×100`，`(1,-3)` | wait 6 格；walk row1 `4,4,4,4`；hurt `8`；dead row3 只消费前 4 格 `2,2,2,2`；normal row4 `2,4,20`；bd row5 `15`；sp row6 `2,2,1,1,8` | 同上；dead 的第 5 张 atlas cell 不在 `frameCount=4` 内 |
| horse3 | `150×150`，`(1,-10)` | wait 6；walk 4；hurt 1；dead row3 前 4 格；normal row4 `2,2,20`；bd row5 `15`；sp row6 `2,2,1,1,10`；bz row7 `2,2,20` | 同上 |
| horse4 | `200×200`，`(1,-25)` | horse3 同类行，dead 为 5 格 `2,2,2,2,10`；新增 tmaoyi row8 `2,2,10` | hit1..5 都回 wait；dead 销毁 |

`BasePet.step()` 在宠物与主人距离 `>=1000` 且双方不处于攻击/受击时直接改写 root `x/y`，没有 `warp` 动作行或独立 clip。

## 对象时序、生成与销毁

| 形态/动作 | 原对象（可见帧） | 生成偏移 | 跟随/销毁 |
| --- | --- | --- | --- |
| horse1 normal / sp | `PetHorse1Bullet1` 5 / `PetHorse1Bullet2` 8 | `±45,-25` / `±40,-15` | normal 末帧；sp 跟随本体且末帧，命中冰效 `frameClips×2` |
| horse2 normal / bd / sp | `PetHorse2Bullet1` 14 / `PetHorse2Bullet2` 45 / 复用 `PetHorse1Bullet2` 8 | `±70,-90` / `±85,-95` / `±60,-25` | bd 跟随本体、命中冰效；其余末帧 |
| horse3/4 normal | `PetHorse3Bullet1` 20 | `±150,-140` | 末帧 |
| horse3/4 bd / sp / bz | `PetHorse3Bullet2` 15 / `3Bullet3` 8 / `3Bullet4` 31 | `±70,-85` / `±80,-45` / `±55,-50` | bd 跟随且命中冰效；其余末帧 |
| horse4 tmaoyi 下落 | `PetHorse4Bullet5` 内嵌 8 帧循环 | 每怪一枚；`x=horse.x+(count/2-index)×90`，`y=50` | 学 sp 时追踪对应怪；距离 2000 或 `frameClips×10` 销毁 |
| horse4 tmaoyi 爆炸 | `PetHorse4Bullet5Explode` 30 | 下落物命中点 | 仅学 bz 时生成；同时学 bd 则延迟 1 秒；末帧销毁 |
| 共享冰效 | `PetHorseIceEffect` 1 | 作为目标 child，width/height 强制匹配 `colipse` | 同名 child 去重；添加时 stop BBDC，到期移除并 continue |

四阶奥义在学会 bd 时还会对 `hit5_1` 命中附加 `frameClips×2.4` 的同一冰效。真值用宠物 root `(470,350)`、3 怪下落首枚 `(605,50)`、命中点 `(605,350)` 与 `60×80` 碰撞体作固定 fixture，逐状态保存注册点、左右矩阵、可见边界和原版基准。总计 716 状态、20 显示对象、716 基准，`unresolved=[]`。

## 现代 key 映射与禁止回填

| 现代 key/范围 | 原版输入 | 193D 必须处置 |
| --- | --- | --- |
| `pet-animation.horse.body-family` | `PetHorseBmd1..4` 的 verified 行/持帧/注册点 | 删除几何本体可见替代层，按形态消费 |
| `pet-skill.horse1.sp` | form1/2 `PetHorse1Bullet2`；form3/4 `PetHorse3Bullet3`；form1 hit2 还附加 `PetHorseIceEffect` | 不能把 stable key 误绑为单一 Symbol；只有 form1 对象跟随本体 |
| `pet-skill.horse2.bd` | form2 `PetHorse2Bullet2`；form3/4 `PetHorse3Bullet2`；共享冰效 | 不能把 stable key 误绑为只有 form2 的视觉 |
| `pet-skill.horse3.bz` | form3/4 `PetHorse3Bullet4` | 一对一接入 31 帧对象 |
| `pet-skill.horse4.tmaoyi` | `PetHorseBmd4` row8 + `PetHorse4Bullet5` 内嵌 8 帧 | 不可把根 1 帧误判为静态图 |
| `pet-skill.horse4.tmaoyi.explode` | `PetHorse4Bullet5Explode` 30 帧 | 保留 bz/bd 组合门禁与延迟 |
| 普攻和共享冰效内部对象 | Bullet1 系列、`PetHorse3Bullet3`、`PetHorseIceEffect` | 注册为真对象；不新建第二业务 owner |

## 六段证据矩阵

| 合同项 | 局部证据 | 共享调用链 | 几何/坐标证据 | 等级 | 反证条件 | 验证 |
| --- | --- | --- | --- | --- | --- | --- |
| 本体动作行/持帧 | `PetHorse1..4.initBBDC/setAction/scriptFrameOverFunc` | `BaseObject.step -> BaseBitmapDataClip.step` | selected-owner atlas cell、alpha bounds、左右矩阵 | 交叉确认 | AS3/图集哈希或行数变化 | generator 源码断言 + Schema |
| follow/walk/warp | `BasePet.myIntelligence/followSource/step` | 主人距离与 `setOtherAction` | warp 无独立对象，只改 root world position | 交叉确认 | 发现实际 warp label/行 | AS3 调用链 + 真值 |
| hurt/dead | `BasePet.reduceHp` + 各类 frame-over | `PetInfo.hp -> setAction -> destroy` | hurt/dead 行逐格基准 | 交叉确认 | 0 HP 不再进入 dead | 真值 + generator |
| 普攻/技能对象 | 四个 PetHorse 类 `enterFrameFunc/doHit*` | `BaseBullet/FollowBaseObjectBullet/EnemyMoveBullet/BaseAddEffect` | FFDec 根帧/subframe、注册点、emit matrix、bounds | 交叉确认 | SymbolClass、帧数或偏移变化 | 716 状态完整性 + Schema |
| owner/clock/销毁 | `Aloader/AssetsLoader`、`BaseBullet.step2` | current ApplicationDomain、20/24/30 stage clock | 补丁/基础/共享包的精确 character id | 交叉确认 | 运行加载顺序或 clock 改变 | 源哈希 + generator `--check` |
| 现代映射 | corpus 五 stable key 与现代占位状态 | 193D 共享 PetRuntime/Projectile 消费链 | 本 task 不改现代视觉 | 确认事实 | 193D 接入后重新审计 | 193D 专项/视觉差异 |

## 现代视觉例外与差异

- 本 task 没有批准任何现代可见例外，也没有修改 `src/` 或生成现代 atlas。
- 当前马系几何本体、projectile fallback/未渲染对象和缺失冰效继续标为未完成，是 193D 的删除/替换清单。
- 原版基准来自只读恢复 SWF 的 FFDec 26 选择性 PNG/SVG/subframe 导出，位于 Git 忽略的 `local-resources/regima/task-outputs/task-settings-193c-pet-horse-animation/`；现代截图未被用作原版基准。

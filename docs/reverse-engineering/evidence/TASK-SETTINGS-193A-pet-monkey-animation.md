# TASK-SETTINGS-193A 猴系动画证据

## 待证明问题

1. `monkey1..4` 的 wait/follow、walk、普攻、`xj/lj/lyq/jgaoyi`、hurt 与 0 HP/dead 分别使用哪一行、多少可见帧、每帧持有多少 host tick。
2. `PetMonkeyBmd1..3` 的 `20120203.swf` / `pet1.swf` 重名候选由谁实际提供，`PetMonkeyBmd4` 是否有第二 owner。
3. 本体与九类可见攻击/技能 MovieClip 的注册点、左右镜像、局部/世界边界、生成位置、clock 和销毁条件是什么。
4. 现有现代 stable key 与原对象是一对一、复用、两段合一，还是行为占位。

权威真值：`task-settings-193a.pet-monkey-animation`，路径 `docs/reverse-engineering/ground-truth/manifests/task-settings-193a-pet-monkey-animation.json`，关键范围为 `/states`、`/displayObjects`、`/baselines` 与 `/completeness`。

## Owner 裁决

| 对象 | 运行 owner | 交叉证据 | 裁决 |
| --- | --- | --- | --- |
| `PetMonkeyBmd1` | `assets/20120203.swf` character 7 | `Aloader` 启动串行列表先装载补丁；关卡 `AssetsLoader.getRolesAndPetsAssets()` 后续才加入 `pet1`；两候选导出 PNG 哈希相同 | 选择补丁 owner；视觉相同不改变加载裁决 |
| `PetMonkeyBmd2` | `assets/20120203.swf` character 14 | 同一加载链；补丁 PNG SHA-256 `E29F…96D5`，基础包 character 2 为 `8A4D…E2B5` | 必须使用补丁版本，禁止混用基础包 |
| `PetMonkeyBmd3` | `assets/20120203.swf` character 11 | 同一加载链；补丁 PNG SHA-256 `89DA…BAD5`，基础包 character 4 为 `8DC8…D2AF` | 必须使用补丁版本，禁止混用基础包 |
| `PetMonkeyBmd4` | `assets/pet1.swf` character 20 | 审计包集中只有一个精确 SymbolClass；图集为 `1200×1800` | 使用唯一基础包 owner |
| 九类攻击/技能对象 | `assets/20120203.swf` characters 136/137/192/200/207/208/212/229/241 | `Aloader` 先加载补丁；FFDec SymbolClass、时间轴帧数和 AS3 `AUtils.getNewObj()` 名称一致 | 全部使用补丁 owner |

两条加载链都使用 `LoaderContext(false, ApplicationDomain.currentDomain)`。`GMain` 构造时先启动 `Aloader`，而 `AssetsLoader.init()` 本身不加载 `pet1`；`pet1` 只在后续关卡资源列表中加入。因此 corpus 的“补丁优先”假设已由真实加载时序闭合，不再保留 unresolved。

## 本体动作行与 host-tick 时序

`BaseObject.step()` 每个游戏 step 调用一次 `bbdc.step()`；`BaseBitmapDataClip.step()` 以 `frameStopCount` 递减，因此下表全部是 host tick，不是毫秒。质量设置把 host/stage clock 调成 20、24 或 30 fps，固定 tick 动作会随质量改变秒长。

| 形态 | 画布/偏移 | 动作行（帧持有；动作总 tick） | 结束行为 |
| --- | --- | --- | --- |
| monkey1 | `70×70`，`setOffsetXY(-8,-10)` | wait/walk row0 `2,2,2,2`（8）；hurt row1 `8`（8）；dead row2 `2,2,2,2,1,1`（10）；normal `hit1` row3 `2,2,2,10`（16）；xj `hit2` row4 `1,1,1,12`（15） | wait/walk 循环；hurt 静止后 wait；攻击回 wait；dead 销毁 |
| monkey2 | `100×100`，`(-8,0)` | wait row0 `2,2,2,3,2,4`（15）；walk row1 `4×4`（16）；hurt row2 `8`；dead row3 `2,2,2,2,10`（18）；normal row4 `2,2,8`（12）；lj row5 两格 `1,1` 循环 6 次（12）；xj row6 `10` | 同上 |
| monkey3 | `150×150`，`(-8,5)` | wait 15；walk 16；hurt 8；dead 18；normal row4 `2,2,8`（12）；lyq row5 `2,9,15`（26）；xj row6 `10`；lj row7 两格 `1,1` 循环 10 次（20） | 同上 |
| monkey4 | `200×200`，`(-8,-5)` | monkey3 各行不变；新增 jgaoyi `hit5` row8 `2,2,2`（6） | hit1/hit2/hit4 可在奥义剩余次数非零时转 hit5；hit5 重选屏内目标并串接已学技能，计数归零后回主人 `y-50` 并 wait |

`BasePet.step()` 在宠物与主人距离 `>=1000` 且双方不处于攻击/受击时直接改写宠物 `x/y`，没有 `warp` 动作名或独立时间轴。故“warp”合同是位置瞬移并保留当时非攻击动作，不得为现代版发明一条原版不存在的 warp 动画。

## 对象时序、生成矩阵与销毁

以下偏移相对宠物运行时根；左向使用负 X，右向使用正 X。MovieClip 根时间轴按 host `stage.frameRate` 每 tick 前进一帧。

| 形态/动作 | 原对象（根帧） | 生成偏移 | 层级/销毁 |
| --- | --- | --- | --- |
| monkey1 normal | `PetMonkey1Bullet1`（10） | `±45,-25` | 默认末帧销毁 |
| monkey1 xj | `PetMonkey1Bullet2`（16） | `±45,-80` | 跟随宠物；不按末帧销毁；循环到 `frameClips×4` tick |
| monkey2 normal | `PetMonkey2Bullet1`（4） | `±65,-30` | 默认末帧销毁 |
| monkey2 lj | `_1`（4）+ `_2`（5） | `_1: ±15,-15`；`_2: 0,0` | `_1` disabled；两段各自末帧销毁 |
| monkey2 xj | `PetMonkey1Bullet2`（16） | `±45,-70` | 同 monkey1 xj |
| monkey3/4 normal | `PetMonkey3Bullet1`（6） | `±100,-40` | 默认末帧销毁 |
| monkey3/4 lyq | `PetMonkey3Bullet2`（25） | `±35,-60` | 默认末帧销毁 |
| monkey3/4 xj | `PetMonkey1Bullet2`（16） | `±45,-50` | 跟随宠物；循环 4 秒 |
| monkey3/4 lj | `_1`（4）+ `_2`（6） | `_1: 0,-15`；`_2: ±10,-15` | `_1` disabled 且插在宠物后；两段末帧销毁 |
| monkey4 jgaoyi | 无独立对象 | 本体 root | 直接消费 body row8；现代 `PetMonkey4Hit5` 只是行为反馈名 |

真值以宠物根 `(470,350)` 固定 fixture，逐状态保存 FFDec SVG 根注册点、PNG/SVG 基准、左右 `localMatrix`、alpha 可见边界及 stage bounds。共 626 个状态、20 个显示对象、626 个原版基准，`unresolved=[]`。

## 现代 key 映射与禁止回填

| 现代 key/运行名 | 原版输入 | 193B 必须处置 |
| --- | --- | --- |
| `pet-animation.monkey.body-family` | `PetMonkeyBmd1..4`，按上述 owner | 删除几何 body/ear/label 本体替代层，按形态消费动作行 |
| `pet-skill.monkey1.xj` / `PetMonkey1Bullet2` | `PetMonkey1Bullet2` | 一对一接入 16 帧循环对象 |
| `pet-skill.monkey2.lj` / `PetMonkey2Bullet2` | `PetMonkey2Bullet2_1 + _2` | 一个 stable key 必须投影两段，不能只接伤害段 |
| `pet-skill.monkey2.xj` / `PetMonkey2Bullet3` | 实际复用 `PetMonkey1Bullet2` | 修正错误来源名，不寻找不存在的 `PetMonkey2Bullet3` 真对象 |
| `pet-skill.monkey3.lyq` | `PetMonkey3Bullet2` | 一对一接入 25 帧对象 |
| `pet-skill.monkey3.xj` | 复用 `PetMonkey1Bullet2` | 共用同一视觉 owner，保留不同生成偏移 |
| `pet-skill.monkey3.lj` | `PetMonkey3Bullet3_1 + _2` | 补回当前现代侧缺失的 disabled 前置视觉 |
| `pet-skill.monkey4.jgaoyi` / `PetMonkey4Hit5` | `PetMonkeyBmd4` row8 | 改为本体动作，不建立独立 projectile 视觉 owner |

## 六段证据矩阵

| 合同项 | 局部证据 | 共享调用链 | 几何/坐标证据 | 等级 | 反证条件 | 验证 |
| --- | --- | --- | --- | --- | --- | --- |
| 本体动作行/持帧 | `PetMonkey1..4.initBBDC/setAction/scriptFrameOverFunc` | `BaseObject.step -> BaseBitmapDataClip.step` | selected-owner atlas cell、alpha bounds、左右镜像矩阵 | 交叉确认 | AS3/图集哈希或行数变化 | generator 源码断言 + Schema |
| follow/walk/warp | `BasePet.myIntelligence/followSource/step` | 主人/目标距离与 `setOtherAction` | warp 无独立对象；只改变 root world position | 交叉确认 | 发现实际 `warp` label/动作行 | AS3 调用链 + 状态全集 |
| hurt/dead | `BasePet.reduceHp` + 各类 frame-over | `PetInfo.hp -> setAction -> destroy` | hurt/dead 行逐帧基准 | 交叉确认 | 0 HP 路径不再进入 dead | 真值 + 生成器断言 |
| 技能对象 | 四个 PetMonkey 类 `doHit*` | `BaseBullet/FollowBaseObjectBullet/SpecialEffectBullet` | FFDec 80 根帧、注册点、emit matrix、visible bounds | 交叉确认 | SymbolClass、帧数或生成偏移变化 | 626 状态完整性 + Schema |
| clock/销毁 | `BaseBitmapDataClip.step`、`BaseBullet.step2` | 20/24/30 stage/frameClips | 本体 host-tick；普通对象末帧；xj 4 秒循环 | 交叉确认 | 运行 clock 不再跟随 stage | generator + 后续运行对照 |
| 现代映射 | `AssetManifest.PetSkillEffectKeys`、`ProjectileSystem`、`TestScenePetViewBridge` | 五关共享宠物 Runtime | 本 task 不改现代视觉 | 确认事实 | 193B 接入后重新审计 | 193B 专项/视觉差异 |

## 现代视觉例外与差异

- 本 task 没有批准任何现代可见例外，也没有修改 `src/` 或生成现代 atlas。
- 当前现代猴系几何本体、projectile fallback、`PetMonkey2Bullet3` 错名、两段对象缺失均继续标记为未完成；它们是 193B 的明确删除/替换清单，不是原版事实。
- 原版逐帧基准来自只读恢复 SWF 的 FFDec 26 选择性 PNG/SVG 导出，位于 Git 忽略的 `local-resources/regima/task-outputs/task-settings-193a-pet-monkey-animation/`；现代截图未被用作原版基准。

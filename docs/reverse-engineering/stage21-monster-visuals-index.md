# Stage 2-1 怪物真视觉索引

本文是 `TASK-SETTINGS-062` 的可交接证据产物，只闭合 Stage 2-1 的 `Monster6/9/10/19` 本体动作、攻击对象和命中可见结果，不实现现代代码，也不扩张 Stage 2-2。

## 待证明的可观察问题

1. Stage 2-1 实际加载哪个怪物资源包，四怪与攻击对象对应哪个 SymbolClass / character id？
2. 本体 atlas 如何切格，wait/walk/hurt/dead/hit 动作分别使用哪一行、多少关键帧、每帧停留多久？
3. 怪物根坐标、碰撞盒中心、脚底、atlas 注册画布与现代世界坐标如何换算？
4. 攻击在动作的哪个 tick 创建，朝向如何翻转，攻击对象从哪个局部点生成？
5. 攻击对象有多少帧、注册点可见边界和滤镜 padding 是什么；命中后是否另建独立特效？
6. 现代 Stage 2-1 应由哪个 owner 消费这些视觉合同，自动测试与 940×590 运行验收如何覆盖？

## 源包与选择性调查

### 权威加载链

- `AssetsLoader.loadByName(stage, level, ...)` 先加入 `levels/level<stage><level>`，再把 `stage` 本身加入加载队列；`AssetsUrl` 把名称解析为 `./assets/<name>.swf`。因此 Stage 2-1 直接加载 `assets/levels/level21.swf` 和 `assets/2.swf`。
- 恢复源 `local-resources/regima/source/restored-swfs/assets/2.swf` 的 SymbolClass 同时包含 `bg21/floorBg2`、四怪本体和七个攻击对象；它是本关权威视觉包。
- `assets/9.swf` 虽重复包含 `Monster9/10/19`，但属于 Stage 9 的加载包，不是 Stage 2-1 的来源。禁止因同名资源改用该包。
- 主 SWF `local-resources/regima/legacy-extraction/swfs/[172845].swf` 为 940×590、30 fps；`assets/2.swf` 自身标头为 24 fps。加载后动作 atlas 由游戏 `step()` 和 `Config.frameClips = 30` 驱动，攻击 MovieClip 也按主舞台 30 fps 验收。

### 本地调查产物

精确、可重新生成的派生产物位于 Git 忽略目录：

`local-resources/regima/task-outputs/task-settings-062-stage21-monsters/`

- `symbols-2/symbols.csv`：权威 SymbolClass。
- `assets-2.xml`：FFDec 26.0.0 `swf2xml` 时间轴、矩阵、滤镜和颜色变换。
- `derived/images-alpha/`：四个 DefineBitsJPEG3 的 JPEG、alpha、合并 RGBA atlas。
- `derived/sprites/`、`derived/sprites-svg/`：七个攻击对象的逐帧 PNG / SVG。
- `monster-frame-geometry.csv`：94 个可达本体关键帧的 atlas cell、30 fps hold tick、alpha 可见边界和左向本地边界。
- `bullet-frame-geometry.csv`：132 个攻击对象帧相对 MovieClip 注册点的精确可见边界。
- `collision-svg/`：`StageCommon.swf` character 105/107 的碰撞盒几何。
- `analyze_geometry.py`：合并 JPEG3 alpha 并重建两份几何表；alpha 边界阈值固定为 8，避免把 JPEG3 透明区的 1..7 噪声当作可见内容。

## 资源与时间轴清单

### 本体 atlas

| 怪物 | character id | 原始尺寸 | cell | BBDC offset | 动作行（关键帧数 / 30 fps ticks） |
| --- | ---: | ---: | ---: | ---: | --- |
| Monster10 | 1 | 1200×1000 | 200×200 | `(22,-17)` | wait `6/15`、walk `4/16`、hurt `1/15`、dead `5/15`、hit1 `4/12` |
| Monster9 | 2 | 1200×1000 | 200×200 | `(9,-15)` | wait `6/15`、walk `4/16`、hurt `1/15`、dead `5/15`、hit1 `4/12` |
| Monster6 | 4 | 2100×2800 | 300×400 | `(0,-55)` | wait `6/15`、walk `4/16`、hurt `1/15`、dead `7/30`、hit1 `4/15`、hit2 `4/73`、hit3 `6/32` |
| Monster19 | 5 | 1200×1000 | 200×200 | `(-35,-30)` | wait `6/15`、walk `4/16`、hurt `1/15`、dead `5/15`、hit1 `6/16` |

动作行固定为 `0 wait / 1 walk / 2 hurt / 3 dead / 4 hit1`；Monster6 另有 `5 hit2 / 6 hit3`。`Monster10.setAction("hit2")` 是不可达残留：源码写 row 5，但 1200×1000 atlas 只有 row 0..4，`frameStopCount` 也只有五行，类中没有 `beforeSkill2Start/releSkill2` 覆盖。Stage 2-1 不得生成或伪造 Monster10 hit2。

逐帧边界不压缩成范围猜测；权威机器表是 `monster-frame-geometry.csv`。下面只列动作联合边界，便于实现审阅。坐标均相对怪物根（碰撞盒中心），为原 atlas 左向：

| 怪物/动作 | 联合可见边界 `minX,minY..maxX,maxY` |
| --- | --- |
| Monster10 wait / walk / hurt / dead / hit1 | `-77,-60..49,56` / `-87,-59..69,56` / `-10,-69..77,57` / `-67,-101..78,83` / `-114,-56..77,56` |
| Monster9 wait / walk / hurt / dead / hit1 | `-60,-59..46,55` / `-69,-58..49,55` / `-25,-61..71,56` / `-60,-92..90,71` / `-71,-77..51,55` |
| Monster6 wait / walk / hurt / dead | `-50,-97..59,80` / `-127,-70..57,85` / `-39,-95..112,77` / `-104,-232..91,107` |
| Monster6 hit1 / hit2 / hit3 | `-89,-136..65,100` / `-43,-75..63,80` / `-88,-123..60,122` |
| Monster19 wait / walk / hurt / dead / hit1 | `-36,-73..65,51` / `-38,-71..67,59` / `-25,-74..84,52` / `-62,-113..80,70` / `-45,-71..43,60` |

### 攻击对象

| SymbolClass | id | 帧数 / 30 fps | 全时间轴注册点可见边界 | 滤镜与 padding |
| --- | ---: | ---: | --- | --- |
| Monster10Bullet1 | 11 | 4 / 0.133s | `-68.5,71.5..78.5,108.5` | 无滤镜，0 |
| Monster19Bullet1 | 15 | 25 / 0.833s | `-336.35,0..120.8,69.3` | 无滤镜，0；21..25 帧为空显示列表但保留生命周期 |
| Monster9Bullet1 | 19 | 4 / 0.133s | `-46.25,-42.6..39.1,122.4` | 无滤镜，0 |
| Monster6Bullet1 | 238 | 5 / 0.167s | `-28.15,-73.9..149.55,138.15` | 无滤镜，0 |
| Monster6Bullet3 | 244 | 21 / 0.700s | `-508.6,-430.75..79.7,168.4` | 内层 character 243 为 `blurX=0/blurY=0`，padding 0 |
| Monster6Bullet2_2 | 261 | 30 / 1.000s | `-136.25,-60.5..103.35,672.65` | 内层 260 为零 blur + color matrix，padding 0 |
| Monster6Bullet2_1 | 271 | 43 / 1.433s | `-52.45,-0.85..117.6,176.9` | 内层 270 为零 blur/零强度 glow + color transform，padding 0 |

逐帧 SVG 宽高与根 `<g>` 平移共同给出相对注册点边界：`min=(-translateX,-translateY)`、`max=min+(width,height)`。精确 132 行见 `bullet-frame-geometry.csv`，不可用裁切后 PNG 左上角代替 MovieClip 注册点。

## 朝向、碰撞盒与 local → world

### 怪物根与脚底

- Monster9/10/19 使用 `StageCommon.swf` character 105 `ObjectBaseSprite`：49.95×99.95，注册点在中心 `(25,50)`；运行时有效碰撞高按 100 处理，脚底为 `rootWorldY + 50`。
- Monster6 使用 character 107 `ObjectBaseSprite2`：59.95×129.95，注册点在中心 `(30,65)`；脚底为 `rootWorldY + 65`。
- `BaseObject.nearToWall()` 落地时执行 `rootY = platformTop - colipse.height / 2`，所以怪物 `x/y` 是碰撞中心，不是脚底或图片左上角。
- 本体 atlas 左向画布：
  - `bbdcLocalX = -cellWidth/2 - offsetX`
  - `bbdcLocalY = -cellHeight/2 + offsetY`
  - `visibleWorld = monsterRootWorld + bbdcLocal + cellVisibleBounds`
- `BaseBitmapDataPool` 先创建整个 atlas 的水平镜像；`BaseBitmapDataClip.direct=1` 再反向选择镜像 cell，并令 `bbdcLocalX = -cellWidth/2 + offsetX`。因此右向不是换原点的独立图集，而是围绕怪物根的水平镜像合同。

现代 Stage 2-1 已把 `MonsterPhysicsModel.y` 定义为中心并按 `platformTop - height/2` 落地。实现时把普通怪 `height` 从占位圆直径改为 100、Monster6 改为 130，即可让原 root/脚底语义与现代 owner 对齐；渲染图必须以怪物根为原点，不能继续以圆半径或 PNG 中心推导。

### 攻击原点与朝向

原 `direct=0` 为左向，使用源图；`direct=1` 通过 `BaseBullet.setDirect()` 以 MovieClip 注册点做 `scaleX=-1`。所有攻击对象都是 `SpecialEffectBullet`，不设置速度，创建后固定在场景世界坐标，逐帧做命中检测并在 MovieClip 末帧销毁。

| 来源动作 | 创建时机（30 fps） | 左/右生成点，相对怪物根 | 攻击对象 | 可见/命中结果 |
| --- | --- | --- | --- | --- |
| Monster9 hit1 | keyframe 4 的首 tick（动作第 7 tick） | `(-85,-82)` / `(85,-82)` | Monster9Bullet1 | 4 帧静态攻击窗口；physics 90，间隔 666 |
| Monster10 hit1 | keyframe 4 的首 tick（动作第 7 tick） | `(-65,-71)` / `(65,-71)` | Monster10Bullet1 | 4 帧静态攻击窗口；physics 90，间隔 666 |
| Monster19 hit1 | keyframe 4 的首 tick（动作第 7 tick） | `(-105,-30)` / `(105,-30)` | Monster19Bullet1 | 25 帧生命周期，前 20 帧可见、后 5 帧空；magic 36，间隔 999 |
| Monster6 hit1 | keyframe 4 的首 tick（动作第 7 tick） | `(-155,-70)` / `(155,-70)` | Monster6Bullet1 | 5 帧窗口；physics 157，间隔 999 |
| Monster6 hit2 起手 | keyframe 1 首 tick | `(-45,-90)` / `(45,-90)` | Monster6Bullet2_1 | 43 帧近身段；magic 112，间隔 999 |
| Monster6 hit2 落击 | keyframe 4 内 `curFrameStopCount=30`，即动作第 44 tick | `(0,-500)`、`(-200,-500)`、`(200,-500)` | 3× Monster6Bullet2_2 | 每个 30 帧；magic 22，间隔 4 |
| Monster6 hit3 | keyframe 6 首 tick（动作第 16 tick） | `(-55,-95)` / `(55,-95)` | Monster6Bullet3 | 21 帧大范围窗口；magic 37，间隔 12 |

`BaseBitmapDataClip.step()` 在递减 hold count 前调用 `enterFrameFunc`，所以上表的“首 tick”与 hit2 延迟 tick 均可由源码精确重放。`BaseBullet.step2()` 默认每帧检测、到显示对象末帧销毁；`attackInterval` 到点时换 attack id，允许持续对象再次命中同一目标。

四怪的直接调用链没有再创建独立命中火花 SymbolClass。玩家实际看到的是上述 `SpecialEffectBullet` 与共享的目标 hurt/伤害反馈；本资源族的“命中特效”即攻击对象本身，后续实现不得凭空新增第二层原版特效。

## 六段证据矩阵

| 行为合同项 | 局部证据 | 共享调用链 | 几何/坐标证据 | 证据等级 | 未知与反证条件 | 验证方式 |
| --- | --- | --- | --- | --- | --- | --- |
| Stage 2-1 源包 | `AssetsLoader.loadByName()` 把 stage `2` 入队；assets/2 SymbolClass 含四怪/七对象 | `AssetsUrl -> URLLoader -> ApplicationDomain.currentDomain -> AUtils.getNewObj` | assets/2 同含 bg21/floorBg2，Stage 9 重复包被加载链排除 | 交叉确认 | 若运行日志显示 Stage 2 未加载 `2.swf` 则复核；当前调用链无此分支 | 资源 provenance 测试 + 940×590 加载 |
| 本体动作/帧序 | 四个 `initBBDC/setAction`、frameCount/frameStopCount | `BaseBitmapDataPool -> BaseBitmapDataClip.step/frameShow` | 4 个 DefineBitsJPEG3 尺寸、94 行 cell/alpha 边界 | 交叉确认 | alpha 阈值只用于几何审阅，不改变原 alpha；实现必须使用合并 RGBA | atlas 计数/边界测试 + 动作逐态观察 |
| 朝向与注册点 | 四类 offset、`setDirect` | BaseBitmapDataPool 生成 atlas 镜像，BBDC 反向选 cell | StageCommon 105/107 中心碰撞盒、BBDC local 公式 | 交叉确认 | 若右向脚底相对左向偏移，检查是否误用图片 origin | 左右叠图 + 同一脚底基线 |
| 攻击触发 | 四怪 `enterFrameFunc/doHi*` | BBDC enter callback 先于 hold 递减；SpecialEffectBullet/BaseBullet | 七个生成偏移和 MovieClip 注册点边界 | 交叉确认 | Monster10 hit2 是不可达坏分支，不得纳入 | tick 精确测试 + 左右攻击观察 |
| 弹体/命中特效 | 七个 SymbolClass 与时间轴 | BaseBullet 每帧命中、末帧销毁、间隔换 id | 132 行 SVG 边界；三类零宽滤镜/颜色变换 | 交叉确认 | 没有独立命中火花；若原版录屏出现第二命名层则降级复核 | 帧数/生命周期/重命中测试 + 逐帧视觉 |
| 现代映射 | `Stage21GameplayBridge` 当前 Arc/Text 占位；Stage1CombatSystem 提供 phase/facing | Stage21 gameplay 更新/销毁和 MonsterPhysics center-y | 普通高 100、boss 高 130；渲染根对齐 combat x/y | 现代设计选择（由原合同约束） | Monster6 hit2/hit3 需 Stage21 专属视觉/攻击事件，不能塞进通用占位色状态 | 专项测试 + 940×590 五波次复验 |

影响下一实现的原版未知为零。剩余风险都是实现与运行验收风险：JPEG3 alpha 合并、右向注册点、Monster6 三动作事件、132 帧生命周期和 53 怪的资源复用/销毁。

## 现代实现映射

下一实现 Goal 应保持现有 Stage21 flow、奖励、门禁和存档 owner，不重构共享战斗：

1. `AssetManifest/BootScene` 只注册本批 11 个 stable key；四本体使用合并 RGBA atlas，七对象使用按注册点保留画布的逐帧序列。
2. 新增 Stage 2-1 专属视觉 model/view owner，消费 `Stage1CombatEnemy.phase/facingX`，映射：
   - approach → walk；无移动等待 → wait；
   - windup/active → 对应 hit 动作；
   - hurt → hurt；dead → dead 播完后销毁。
3. 普通怪使用各自 hit1；Monster6 需要局部三动作调度与攻击事件，不能把 hit2/hit3 伪装成 hit1 换图。行为数值继续来自已闭合 Stage 2-1 合同。
4. 视觉对象原点固定为怪物碰撞中心；普通怪 physics 高 100、Monster6 高 130。攻击 view 原点固定为 MovieClip 注册点，右向只做水平镜像。
5. 删除 Stage21Scene 的怪物/弹体占位声明、Arc/Text 可见层和颜色状态映射；未经用户批准不叠加现代圆、标签或额外命中火花。

## stable key 与选择性接入清单

- `monster.stage2-1.monster6.atlas`
- `monster.stage2-1.monster9.atlas`
- `monster.stage2-1.monster10.atlas`
- `monster.stage2-1.monster19.atlas`
- `projectile.stage2-1.monster6.hit1`
- `projectile.stage2-1.monster6.hit2-start`
- `projectile.stage2-1.monster6.hit2-rain`
- `projectile.stage2-1.monster6.hit3`
- `projectile.stage2-1.monster9.hit1`
- `projectile.stage2-1.monster10.hit1`
- `projectile.stage2-1.monster19.hit1`

全部 11 条已在本地选择性派生为 `derived-ready`；不需要再次全量导出 assets/2.swf。实现只复制这些派生族到 `public/assets/stage21/`，并保留源包、character id、atlas cell、帧数和注册点 provenance。

## 双重验证计划

### 确定性测试

- 4 个 atlas 尺寸、cell、动作行、94 个可达关键帧和 hold tick 完全匹配本表。
- 右向边界严格满足以怪物根/攻击注册点水平镜像；脚底分别保持 `root+50/root+65`。
- 7 个攻击对象帧数为 `4/25/4/5/21/30/43`，Monster19 21..25 空显示但生命周期保留。
- 四个 hit1 与 Monster6 hit2/hit3 的创建 tick、生成数量/偏移、攻击类型、伤害与间隔准确。
- 53 怪重复创建/销毁后无遗留 view/animation；场景关闭清空全部攻击对象。
- 原有五停点、6/8 上限、失败、Monster6 显门和 2-2 保存专项不回归。

### 940×590 运行观察

- 1P 与 2P 各覆盖左右朝向、wait/walk/hurt/dead/hit1；逐项确认脚底不漂、镜像不跳和死亡播完再移除。
- Monster6 单独覆盖 hit1、hit2 起手 + 三落击、hit3；对照注册点和生成偏移，不以现代 hitbox 调试图作为视觉基准。
- 在五停点与镜头滚动中观察攻击对象固定世界坐标、生命周期、滤镜/颜色变化和越屏裁切。
- 保存同尺寸关键状态截图，与本地派生 SVG/atlas 并排或半透明叠图；差异清单只允许“原资源复用”，当前没有用户批准的现代可见例外。
- 最终清除 Stage21 的占位说明，console 无 warning/error，再裁决 `LINE-STAGE-2-1` 是否满足关闭合同。

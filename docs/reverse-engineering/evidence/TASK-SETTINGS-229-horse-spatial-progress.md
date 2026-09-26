# TASK-SETTINGS-229 马系空间与host补证交接

2026-09-24。声明范围内的源输入已通过，机器真值为 `docs/reverse-engineering/ground-truth/manifests/task-settings-229-pet-horse-collision-phase.json`（verified，43合同，unresolved=[]）。本项不代表226生产整改完成；没有修改src、生产资源或原始提取结果。

## 已冻结的范围和证据

`tools/horse-spatial/inventory.py` 从真实创建点冻结16条记录、10个主symbol；另保留AoyiBuff与目标侧PetHorseIceEffect。horse3/4的doHit2是bd、doHit3是sp、doHit4是bz；只读初查中的技能标签错误已由主agent按源码纠正。

恢复SWF闭包：20120203为97个定义，StageCommon为17个，pet1为38个；闭包内17个SymbolClass均只有简单构造函数。冰效沿用已证启动期StageCommon character40，pet1 character1107不覆盖该owner。主效果的原始标签和源码只读，输出位于本地229目录。

| 包 | 当前证据 | 明确边界 |
| --- | --- | --- |
| 原生生命周期 | 13种类/配置×双owner×双向×4状态，20/24/30fps共318448记录；独立状态模型零差异，15字段变异拒绝 | source/target由fixture控制；wall/attack仅记录调用，无结算 |
| 身体回调 | 原BBDC和19段源方法，432组；发射时刻、名称、位置、方向及结束回调通过，3字段变异拒绝 | 此包fps是配置值、step是受控调用，不冒充真实显示时钟 |
| 实际联合创建 | 42组×160host×enter/exit×三fps=40320记录，源doHit与addAoyiBuff创建通过；12字段变异拒绝 | 受控bullet-before-body调度，尚非完整BasePet.step/死亡/命中链 |
| 独立显示重建 | 62形状/56位图，221递归相位×3fps加2冰效静态态=665态，RGBA及bounds零差异 | 十主效果、AoyiBuff、冰效；附着世界矩阵和继承显示另有对应证据 |
| 几何反证 | 实际运行修改后的renderer；origin/phase/mask/pending分别拒绝204/204/54/4态 | 每个变异独立目录和AIR应用ID，失败运行不覆盖正常结果 |
| 原生碰撞 | 10主效果、3正式目标colipse、双向、53坐标×122时间点=387960例，41718次命中；原HitTest与独立像素归约零差异 | 有限坐标/相位对照；不外推任意空间或正式伤害 |
| 独立重建碰撞 | 同一独立几何构建器，1818相位/方向/目标组、387960例，零差异 | 输入只含坐标和相位选择，不向renderer提供expected布尔 |


| 动态碰撞 | 158912次实际host检测、7554次命中、4020次远距负向调用；原HitTest与独立像素归约零差异 | 显式移动的真实colipse；不冒充AI或完整HP结算 |
| 动态程序变异 | identity/after-follow/skip-paused-follow/wrong-class分别拒绝1726/16/32/32条记录 | 实际编译并运行改错后的原fixture；不是翻转expected布尔 |
| 冰效 | 22380态、180例；原挂载/尺寸/去重/刷新/过期/取消/销毁、BBDC暂停恢复及目标对隔离通过 | 冰分支step投影；未装备Hero输入服务为观察sink，完整死亡caller仅源码定位 |
| 奥义目标 | 3072记录、192例；空数组/三目标/重排/死亡目标及全部bd/sp/bz组合通过 | 源反向创建、分布、attackInfo与首次追踪步；命中结算另包 |
| 真实延迟爆炸 | 30880记录、240例、60原TweenMax延迟回调通过 | 成功命中为显式入口；原时间线秒数不换算为固定host数 |
| 原父清理 | 同源destroy+真实TweenMax，11008销毁后状态通过 | 清除body/helper/owner/旧私有弹体，真实淡出；dead/live为入口条件，未执行完整换宠/HP调用者 |
| 递归UI | 665态/3190对象，3145个原生可观测对象逐项核对，Schema通过 | pending子树由源重建；240个零面积哨兵bounds位置及孤立clipDepth表示差异逐项保留，不放宽像素/碰撞 |
| 继承复用 | HeroBeHurt/miss/hpSlip/pnum及保护证据按228精确源hash复用，四Horse无相关重写 | 不迁移猴主效果/火焰/碰撞；旧手动tween证据仍保留手动时钟边界 |

普通/技能的原回调发射host tick：horse1 normal/sp均7；horse2 normal7、bd1、sp5；horse3/4 normal5、bd1、sp5、bz5；horse4 tmaoyi5。来源是原条件与BBDC hold，不是现代毫秒配置。

已确认的源差异：horse1.sp使用Follow且受伤切断，horse2.sp复用同symbol但使用Special；bd的Follow关闭受伤切断。AoyiBuff是disabled Follow。奥义学sp时设置moveTarget但水平speedx仍为0；目标死亡解除追踪，继续下落。上述是226必须消费的源事实，尚不能当作已验证的新增现代bug。

## 失败尝试及修正

- 将完整pet1直接载入fixture当前ApplicationDomain时，其内置游戏类与观察stub冲突，出现BaseHero非法override并超时。现仅将pet1放独立原始ApplicationDomain，显式解析其两个专属symbol；原显示脚本不变，20120203/StageCommon仍按先载入owner。失败启动不是玩法结果。
- 独立重建最初18态出现差异：马3普通弹内容移除后，只剩clipDepth遮罩；该遮罩仍不应显示为实心图形。修正独立构建器的孤立遮罩渲染后663态严格通过，没有放宽像素容差。
- JPEG3使用独立原JPEG字节的AIR解码加源alpha反预乘；不以Pillow JPEG色值替代原运行时解码。
- 联合fixture曾因同名观察目标类编译冲突失败，已将观察目标命名为FixtureTarget；编译失败不计入验证。
- 独立复核指出远距负例被命名为trackedIdentity mutation，已纠正为7320例sentinel负向覆盖；首帧/方向分别为17028/18252例反事实投影差异，不冒充实际程序变异。renderer的四项是实际执行修改后的fixture，二者区分。
- 复核对decoded-vectors依赖的疑问经主agent确认是未执行遗留字段：229构建器的nextVector早已直接进入run，源闭包也不含猴131/202。已删除无效vectorPath及特例分支，正常几何/碰撞重新运行；没有复制228 vector产物。

## 实现交接与证据边界

229的13组证据已通过，原209的43项合同与227行为补充全量保留。226必须消费228/229的独立源几何和host相位，核销MH-01..07；不得仅修取模或删除tracked分支后用矩形代替复杂碰撞。有限坐标样本不外推任意空间，完整现代伤害/去重/技能/死亡/换宠/五关与TestScene双owner仍交226验收。

原版特别边界：BaseAddEffect.destroy不主动隐藏马冰，正常怪物死亡在BaseMonster.beMagicAttack的dead分支调用cancelAllEffect（源码静态证据），该callee的移除/恢复已实测。Horse4.hit5Hit学习bd+bz时用原TweenMax延迟1秒；父死亡取消，ready-only以及仍存活的完整destroy不取消。完整destroy仍会清除已有私有弹体，延迟回调随后可能再次创建爆炸；这是源边界，未验证现代换宠调用者前不登记为新增bug。两个owner、直接/延迟、反序目标和零水平速度合同不得合并简化。

递归UI把全部clipDepth节点标为objectType=mask，禁止作为普通形状直接绘制；可见对象计数统计API属性而非实际着色图元。孤立SWF clipDepth mask保持源API visible=true的真值；等价重建需隐藏没有内容的独立mask节点，差异记录于natural-display-verification，不作为现代视觉例外。原始爆炸第11帧、马3普通弹第4帧和冰效基准已视觉抽查。其余像素由665态严格RGBA检查核对。

复现入口输出是本地证据；源码未来需要消费的数据必须转换到受Git跟踪的正式目录。继承机器真值的局部空间/手动时钟限制保留；本项不证明全BaseMonster伤害方法、任意目标坐标或现代实现。

## 复现入口

本地测量根：`local-resources/regima/task-outputs/TASK-SETTINGS-229/`；小型结果根：`docs/tasks/evidence/TASK-SETTINGS-229/`。二者不作为正式运行依赖。

```powershell
python tools/horse-spatial/source.py
python tools/horse-spatial/inventory.py
python tools/horse-spatial/prepare_lifecycle.py
python tools/horse-spatial/run_lifecycle.py 20
python tools/horse-spatial/run_lifecycle.py 24
python tools/horse-spatial/run_lifecycle.py 30
python tools/horse-spatial/verify_lifecycle.py
python tools/horse-spatial/body_inputs.py
python tools/horse-spatial/prepare_callbacks.py
python tools/horse-spatial/run_callbacks.py
python tools/horse-spatial/verify_callbacks.py
python tools/horse-spatial/geometry_inputs.py
python tools/horse-spatial/run_ice_display.py
python tools/horse-spatial/run_geometry.py
python tools/horse-spatial/run_geometry.py origin
python tools/horse-spatial/run_geometry.py phase
python tools/horse-spatial/run_geometry.py mask
python tools/horse-spatial/run_geometry.py pending
python tools/horse-spatial/verify_geometry.py
python tools/horse-spatial/run_natural_collision.py
python tools/horse-spatial/verify_natural_collision.py
python tools/horse-spatial/run_rebuilt_collision.py
python tools/horse-spatial/body_source.py
python tools/horse-spatial/prepare_joint.py
python tools/horse-spatial/run_joint.py 20
python tools/horse-spatial/run_joint.py 24
python tools/horse-spatial/run_joint.py 30
python tools/horse-spatial/verify_joint.py
python tools/horse-spatial/prepare_ice.py
python tools/horse-spatial/run_ice.py 20
python tools/horse-spatial/run_ice.py 24
python tools/horse-spatial/run_ice.py 30
python tools/horse-spatial/verify_ice.py
python tools/horse-spatial/prepare_explosion.py
python tools/horse-spatial/run_explosion.py 20
python tools/horse-spatial/run_explosion.py 24
python tools/horse-spatial/run_explosion.py 30
python tools/horse-spatial/verify_explosion.py
python tools/horse-spatial/prepare_cleanup.py
python tools/horse-spatial/run_cleanup.py 20
python tools/horse-spatial/run_cleanup.py 24
python tools/horse-spatial/run_cleanup.py 30
python tools/horse-spatial/verify_cleanup.py
python tools/horse-spatial/run_targeting.py 20
python tools/horse-spatial/run_targeting.py 24
python tools/horse-spatial/run_targeting.py 30
python tools/horse-spatial/verify_targeting.py
python tools/horse-spatial/run_dynamic_collision.py 20
python tools/horse-spatial/run_dynamic_collision.py 24
python tools/horse-spatial/run_dynamic_collision.py 30
python tools/horse-spatial/verify_dynamic_collision.py
python tools/horse-spatial/run_geometry_trees.py
python tools/horse-spatial/ui_truth.py
python tools/horse-spatial/inherited_reuse.py
python tools/horse-spatial/generate.py
python tools/horse-spatial/generate.py --check
```

四个geometry变异命令预期exit1；正常命令须exit0。共享源提取/bitmap解码/原HitTest归约沿用228已证机制；马数据、创建点、mask、phase和碰撞全部重新取证，不复用猴的碰撞结果。

动态程序变异复现：对tracked-identity、after-follow、skip-paused-follow、wrong-class分别执行 `run_dynamic_collision.py 20 <mode>` 和 `verify_dynamic_collision.py <mode>`；runner须成功、verifier预期exit1且记录非空差异。正常verifier必须exit0。geometry正常665态需先运行run_ice_display，随后run_geometry及verify_geometry；历史首次663态只作为过程记录。

最终校验：229 generator与--check一致；workflow通过（22未完成/320已完成，唯一Ready226）、structure通过（9既有无关warning）、audit:problems扫描7项并集中回写004/017、diff通过。源码未变，不运行无关生产build或旧P1R/P1H充当本源验收。独立只读复核的mask修复已通过；没有新增现代视觉例外。

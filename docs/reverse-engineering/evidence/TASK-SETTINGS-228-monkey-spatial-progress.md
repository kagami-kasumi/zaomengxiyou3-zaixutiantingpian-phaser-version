# TASK-SETTINGS-228 猴系空间补证交接

状态：本项完成，真值已 verified；226 仍等待229马输入，不代表现代修复完成。记录日期：2026-09-21。

最终交付：`docs/reverse-engineering/ground-truth/manifests/task-settings-228-pet-monkey-collision-phase.json`，truthId=`task-settings-228.pet-monkey-collision-phase`。完整41合同、两份UI Schema共622态/1950递归对象、349164独立重建碰撞、46080连续host步、672奥义目标例及继承附属显示全部核销；根completeness.unresolved为空。有限源fixture与原207/227保留合同组合交付，不声称任意空间外推或现代全场景验收。

## 早期分层采样记录

本节保留各次采样当时的证明边界；最终完整性以本页顶部和后面的汇总为准，旧阶段“尚未”不作为当前未解项。

- `tools/monkey-spatial/source.py` 从恢复的 `20120203.swf` 和 `StageCommon.swf` 复制原始定义字节，闭合 112+52 个定义。15 个关联 SymbolClass 脚本均核对为仅简单构造器，无未解决脚本。九主效果来自补丁包，不以 `pet1` 重名对象覆盖。输出 `docs/tasks/evidence/TASK-SETTINGS-228/source-definitions.json` 保留源/闭包/定义/脚本 hash 和 FFDec 命令。
- 附属显示核对纠正早期采样假设：猴系是 `FireBuff`（StageCommon character 189），没有把 `AoyiBuff` 归入本族的证据。最终 fixtures 已替换并重跑；旧本地 PNG 可能残留，但不在最新 measurement/fixtures 中，不属于证据集合。新增隐藏本体 colipse3/4；目标 colipse 仍为 base/2/7，不能以宠物本体替代目标碰撞。
- 原版 AIR 连续采得九主效果与 FireBuff 共 1,220 状态，逐状态保存递归树、局部 PNG、左右舞台 PNG。放置数量/顺序/矩阵/alpha 与 SWF 时间轴核对通过，四个观测变异被拒绝。此检查不证明所有 mask/filter/像素、宿主阶段或生命周期。
- 四 body 直接保留原 JPEG3/Lossless2 定义，经原 AIR 解码及原 BBDC 方法采样。376 张 P1/P2、双方向 cell 图像 alpha 与独立解压源平面完全一致；866 个 enter/over 倒计数步骤通过。原猴1补丁 bitmap 是 Lossless2，不能强行假设全部 JPEG3。
- `CollisionProbe.as` 执行原 `my.HitTest`，九效果×122时间点×双方向×三目标形状×29位置，共 191,052 样本，34,700 正命中，远距样本全不命中。当前仅为 measured-not-promoted 原生 oracle：还没有完成几何独立重建、完整边界/真实消费者映射和变异门禁，不能据样本数量宣布碰撞真值完成。
- 原四猴 `setAction/enterFrameFunc/scriptFrameOverFunc/normalHit` 及猴4奥义方法与原 BBDC 联合执行，432 个有界 cases 通过独立手工预期，覆盖动作、方向、本地/远程发射抑制、20/24/30 的 frameClips 输入及奥义八技能组合、无候选、受伤。三类回调观测变异被拒绝。`frameClips` 是受控输入，这组同步测试不宣称真实 20/30fps 渲染调度已经验证。
- 原 BaseBullet 生命周期方法、完整 Follow/Special 类及原 AUtils 与原生 symbol 联合采样，真实 stage.frameRate=20/24/30，共 92,592 个创建/ENTER_FRAME/EXIT_FRAME 记录；独立转换 verifier 全部通过，九个暂停跟随/命中顺序/disabled 变异拒绝。覆盖九效果×P1/P2×双方向×自然/移动受伤/暂停/显式销毁。碰撞函数记录调用位置，不在此冒充伤害结算；真实父死亡调用、doHit 创建层级仍由后续联合 sampler 核销。
- 创建链已连接：原16个 doHit 方法替换 callback sink，真实身体位图+BBDC+原弹体类在20/24/30fps运行42场景，共40,320记录/2,436个创建实例。实际创建tick/顺序与独立手工回调预期一致，P1/P2来源、前置层级、创建当帧不step、下一step调用与自然创建的独立弹体相位基准一致。phase/owner/birth/layer四个CLI变异全部退出1拒绝；正常验证退出0。仍不证明伤害结算或父死亡调用。

### 相位基准的必要更正

强制递归 gotoAndStop(1) 再播放的效果闭包，不等于实际原类 doHit 自然创建的宿主相位。首次联合比较出现25,664个差异，失败报告原样保留于本地 `controlled-restart-phase-rejection.json`。原类自然创建的独立生命周期基准与原doHit创建链在三帧率下相位数组完全一致，后者才用于 `joint-verification.json`。这不是容差放宽，未把旧受控基准重新标成宿主真值。

原native ENTER_FRAME可读到尚未构造的子对象槽位，getChildAt返回null；树采集器明确保存 `pendingConstruction`，不伪造二维矩阵或补成已绘制child。自然生命周期每帧率目前保存92个相位键的PNG/递归树（包括此中间态），它们仍是测量资料；相位键尚未作为完整几何合并合同通过。旧纯闭包碰撞测量也只证明其受控相位，后续真实碰撞oracle应以自然构造/实际检查阶段重采。

完整pet1源包直接载入有精简BaseObject的同域会触发 `VerifyError #1053 base.BaseHero.setSpeed`；失败日志仅本地保留。联合采样改为加载已验证的原始bitmap-tag身体包到隔离域，经原AIR解码提供body atlas；保留原像素/原BBDC/原doHit，不加载无关游戏类，也没有借机更改生产资源。

## 必须交给 226 的语义

以动作切换后第一个 BBDC step 为 host tick 1：猴1 normal 首发 tick7、xj tick5；猴2/3/4 normal tick5；猴2 xj、猴3/4 lyq/xj 首发 tick1。`getCurFrameCount()==8/10` 是当前列剩余 hold，不是 host 发射 tick。

猴2 lj 的两列循环在 ticks 1/3/5/7/9/11 各发一对前置/伤害对象；猴3/4 lj 在 ticks 1..19 的奇数 tick 各发一对。每对两个独立对象，前置 disabled。不能用贴图列数替代 12/20 个逻辑 keyFrame。

猴4 jgaoyi 每段 hit5 六个 host step 后选目标/传送。前四段先调用已学 xj，再调用 lj 或普攻；后一个动作覆盖 xj，下一次 BBDC step 不产生 xj 效果。末段为已学 lyq 或普攻。当前固定候选/随机序列下，未学 lj 的普通段首发为 11/29/47/65；已学 lj 的段首发为 7/33/59/85，每段十对。受伤清空链，无候选回 owner 的 y-50。完整随机/目标边界与实际 bullet 生命周期仍待验收。

FireBuff 由 BaseAddEffect `show_mpetmonkey_fire` 挂到 sourceRole、hide 移除。这里 sourceRole 是 buff 持有者，即受击怪物/目标宠物，不是攻击猴；原 BaseBullet.setAction → BaseMonster/BasePet.beMagicAttack → BaseObject.addCurAddEffect 链转移的是 hit2 的 addEffect。不能据攻击宠物销毁推导目标火焰消失。继承 father 是状态项，不是额外 MovieClip；保护的 GlowFilter 路径仍须在宿主状态清单核销，不能据“不是 MovieClip”略过显示过滤器。

生命周期已测事实：Follow 先调用基类 step2（包含命中），再补偿 source 移动/矩阵；暂停冻结 TTL/墙检测/命中，但不阻止基类之后的 Follow 补偿。xj 在 4×fps 个非暂停 step 到期；暂停三步时对应延后三步。source hurt 默认切断 Follow，xj 显式豁免；disabled 前置仍播放但不调用命中。原 TTL 到零销毁后 step 没有立即 return，因此测试保留后续墙/命中函数调用且 owner 已空的顺序，不以理想化的现代早退覆盖源事实。

静态更正：`BaseAddEffect.destroy:1636-1654` 没有调用 `hide_mpetmonkey_fire`；正常移除分支 `1450-1453` 调用该函数。目标正常死亡的 cancelAllEffect 路径与直接 destroy 不等价。只读核对最初关于“暂停不跟随”“destroy 清 FireBuff”的概括均已由主 agent 原函数/原生反例纠正，未升入 verified 真值。

## 父宠物销毁与目标火焰的有界采样

`cleanup-verification.json` 核对原 BasePet.destroy、BBDC.destroy、BaseAddEffect show/hide/destroy：5个销毁状态、22个自然 FireBuff 帧以及4个反例通过。P1销毁立即移除身体、销毁其私有弹体、清空owner；P2不变。父容器在1秒淡出回调才移除，受击目标上的火焰始终独立存在；对目标buff直接destroy只清owner，显式hide才移除火焰。自然帧为1..20、1、2。

边界：身体为空白bitmap，仅证明detach；其他无关buff隐藏服务为不活跃sink；Tween调度使用手动时间与原easeOut/原完成回调，没有执行完整Tween厂商库。easeOut返回比例而非alpha，fixture采用initial+(final-initial)*ratio，半程alpha=.25，错误的.75已被反例拒绝。该cleanup采样未执行目标正常死亡cancelAllEffect、火焰续时和完整buff.step；后续fire采样边界见下文。

## 保护光效与目标火焰增量

`glow-verification.json`：20/24/30帧率、分别激活P1/P2，758个保护状态、36个受击计数状态、18个不同原生RGBA画面通过。原myGlow/cancelGlow/updateFather/getBuffByName/setYourFather完整函数执行，step仅保留原保护分支；第六次受击触发5×fps保护，非目标owner不变。原生画面使用已验证猴1body像素裁片，未用自画占位替代。颜色10092288即0x99ff00；可见半径下降至7，下一步内部到6后立即回7且alpha=.8，随后上升至15；周期17步。倒计时从0再减至-1后才结束保护。4类颜色/半径/owner/提前到期变异被拒绝。身体其他帧与完整beMagicAttack调用仍不由此fixture证明。

`fire-verification.json`：30个case、5,950状态覆盖三帧率、P1/P2目标、自然到期、续时、cancelAllEffect、直接destroy和整秒到期边界。add/remove/cancelAllEffect/destroy及show/hide是完整原函数；step明确只投影首次显示、到期、PETMONKEY_FIRE伤害与count bookkeeping，其他状态分支排除。重复add更新time/startTime但不替换hurt；首次step在count=0即可造成伤害。到期remove将数组条目置null，但本次选中的item仍会执行伤害分支，故整秒到期仍有该tick伤害。cancelAllEffect移除火焰，直接destroy保留target上的显示对象；4个相关变异被拒绝。伤害接收为sink，未执行BaseMonster死亡caller和完整伤害结算链，不能宣称全链完成。

独立几何输入 `geometry-inputs.json` 从XML边/填充/样式切换和原binary lossless ARGB解码69形状、64位图，包含两个带细描边/中途新样式的形状，不能当作全为矩形。独立重建已通过下述有界像素门禁；输入文件尚未作为全族verified manifest晋升。

## 独立几何重建与逐像素门禁

`geometry-verification.json`：九主效果在20/24/30原生基准中的276个自然相位，加目标FireBuff的22个自然帧，共298个状态的完整RGBA和local bounds全部一致，零像素容差。只从原生树取得frame/child构造相位选择器，不复制矩阵、颜色、滤镜或几何；布局/填充/位图/描边/blur均来自独立解码输入。原生裁剪框只用于对齐比较，bounds另与重建结果逐项核对。

位图从原binary解码反预乘后直接setPixels导入，避免PNG Loader额外预乘损失；原PNG导入路径曾产生大量仅RGB差异，没有作为现代视觉许可保留。`pendingConstruction`不是未绘制：原getter暂不可访问的子对象已有source首帧绘制。按该创建相位重建后对齐，不能把null槽位替换为空白。

131/202两个多填充细描边形状：连续Graphics API绘制、按端点重新连接描边、pixelHinting试验均有失败，诊断保存在geometry-air下。最终使用独立解码的twips边、方向、原顺序、MoveTo和样式批次，通过新bit writer重新编码两个形状，再由原AIR渲染；新标签hash与原标签不同，未复制原shape字节冒充独立重建。保留源拓扑操作顺序后298态零差异；未允许轮廓容差。`probe_strokes.py`发现这两个导入shape的readGraphicsData返回空，不能把该API当源几何提取依据。

五个实际重建变异单独目录运行并退出1：origin拒绝88态、filter19态、phase7态、pending12态、vector28态（每项92态）。第一次并行运行因AIR应用ID相同而转发到主实例的启动失败不计变异；已改为每项独立ID重跑，验收读取实际完成的measurement及相同输入/probe hash。正常输出独立保存并复验通过。

后续碰撞交叉检查已完成：同一独立几何输入与原HitTest在349,164例中全部一致，见下节；仍不作任意空间外推。完整合同和Schema汇总已生成草稿，等待继承受击显示及连续host组合最终核销。

## 独立重建碰撞、奥义边界与递归Schema

`rebuilt-collision-verification.json`：原自然oracle新增递归phase选择器，108种自然相位乘双方向和三目标形成648组；同一GeometryProbe构建器仅替换观察driver，不复制原生几何，也不把expected布尔写进fixture。349,164例、65,094命中与原包结果零差异。原oracle、输入、builder、driver及编译源码hash全部绑定。该检查覆盖固定坐标/相位集合，不等于任意空间或完整结算证明。

`aoyi-target-verification.json`：原Monkey4目标回调、原body及原生colipse，共672例，覆盖20/24/30fps、P1/P2、八种目标数组/进出/场景变换状态、七个随机索引边界及两侧随机边界，独立期望零差异。严格20<left<920，无死亡过滤；随机索引为int(random*N)，左右边界为random<.5；空数组轮次取消链，恢复数组不恢复链，回owner时保留curAttackTarget，完整成功不会额外回owner。五个实际编译源变异均完成672例后退出1：inclusive差异2988、alive648、side1806、index360、clear-target252；启动失败不计通过。发弹/完整怪物结算仍沿用既有合同边界。

`natural-display-ui.json` 与 `natural-display-verification.json`：298态、1094个递归对象通过既有UI Schema；989个可读取原生对象逐项核对矩阵、边界、颜色、alpha、滤镜及子对象数。getter暂不可读的子树由已通过严格RGBA的source首帧构造补齐。只有6项宽高均为0的空显示对象rootBounds哨兵位置不同，双方精确值保留在报告；不扩为非空几何或碰撞容差。原生PNG基准和递归source character/tag hash保留。

保护顺序复核已修正：原BaseObject.step先递减fatherCount并在-1清除保护，再执行curAddEffect.step，因此该host步立即cancelGlow。旧采样器先filter后timer的顺序不再作为最终输入；修正后758态、36受击计数和18个像素状态通过，变异改为拒绝延迟到期。

清单复核发现继承的 `BasePet.addBeAttackEffect` 还创建 `HeroBeHurt`（StageCommon character18），附原ColorMatrix.adjustColor(0,0,0,100)，位置来自宠物colipse。它不能由body hurt行或九主效果证明，当前正补有界自然创建/帧/清理；同时核销共享miss/数字/hpSlip来源，不将漏项静默视为已有真值。

最终汇总生成器为 `tools/monkey-spatial/generate.py`，任务专属Schema为同目录 `manifest.schema.json`；manifest已verified并通过重复生成检查，保留全部41项207合同和227来源，不宣称226现代实现完成。以下补强完成后才晋升，初版不足未计通过。

连续动态组合由主agent接管重做：144case×三fps，46080个ENTER_FRAME步骤（连同created/EXIT_FRAME共92592记录），每步用原lifecycle独立预期核对所有字段；三类真实colipse而非自画矩形，实际checkAttack内原HitTest与独立像素归约一致，共4024命中。target两步远离再进入；原pause仍调用step2并保留Follow补偿；12项trace/字段变异拒绝锁定身份、攻击后跟随错序、disabled攻击及暂停跳过跟随。初版synthetic矩形、暂停跳过step2、仅翻hit布尔冒充时序变异及最后一次SWF哈希复用均被退回，不属于最终结果。

HeroBeHurt补证：684自然ENTER_FRAME状态、36次原updateFather/创建顺序，三fps均在第六hit触发5×fps保护。StageCommon character18自身frame8脚本removeChild，下一ENTER_FRAME观察到detached；被fixture保留引用的离树clip继续转帧不代表游戏仍可见。原ColorMatrix的hue=100矩阵以独立三角公式/float32核对，12类字段变异拒绝。114个原生基准与四source形状/位图独立重建RGBA、bounds零差异。JPEG3采用原JPEG流由独立AIR Loader解码后按alpha反预乘；Pillow路径存在RGB解码差异，已保留为诊断，未冒充通过或扩大许可。

共享附属显示：原BasePet.newHpSlip/drawPetHp/showHpSlip/addMissMc及原TweenLite.easeOut在显式手动tween时钟采样，210态与独立矢量/解码miss像素全部一致，5变异拒绝。涵盖双owner、colipse3/4、两方向、负/零/半/满/超满HP和2秒淡出/移除；不声称完整TweenMax调度器。StageCommon miss字符8与OtherMat1字符71除ID外的原tag负载字节相同，不依赖猜测加载优先级。191不含hpSlip、211的miss-p1没有该位图，未以标题复用；pnum则精确复用215。猴四类/基类无addAoyiBuff调用，AoyiBuff排除出猴且保持229马显式输入。

`additional_ui.py`将114+210态的完整递归树纳入第二份UI Schema（324态/856对象），与自然九效果/Fire的298态/1094对象一并嵌入manifest。source-derived几何、nativeTimeline、hudInputs及每项provenance/hash均可由后续226消费；运行必需转换数据必须放正式资源目录，不能让游戏依赖忽略的本地证据。

## 自然碰撞边界继续核对

真实消费者核对补充：Monster16使用ObjectBaseSprite2；Monster30使用ObjectBaseSprite7且scaleX=.5。自然采样覆盖9效果、双方向、3目标、122个创建/host状态、29个常规位置及24个接触边界，共349,164例，65,094例命中，原HitTest与独立像素归约零差异。原HitTest函数保持字节一致；最初临时观察字段仅用于诊断，已从正式运行复制件去掉。

失败的独立二值蒙版模型已保存在 `binary-mask-reference-rejection.json`；混合方式与矩阵路径更正均未消除202例差异。独立小位图实验最终定位到原AIR的getColorBoundsRect行为：只有左上角首像素匹配时返回空。100个单像素位置及1..4宽/高下全部74,954个二值组合都符合“至少有一个非首像素匹配才width!=0”。归约保留该原生行为后完整样本零差异；没有采用碰撞容差。`natural-collision-verification.json` 同时拒绝首帧替代13,878例、翻转错误28,312例、锁定身份绕过空间6,588例。该原生特性必须交给226的消费实现；逐像素归约仍仅是布尔检测交叉检查，不等于独立空间几何重建或任意坐标外推。

## 重现入口

按依赖顺序运行：

```powershell
python tools/monkey-spatial/source.py
python tools/monkey-spatial/run_effects.py
python tools/monkey-spatial/verify_effects.py
python tools/monkey-spatial/body_inputs.py
python tools/monkey-spatial/body_source.py
python tools/monkey-spatial/prepare_body.py
python tools/monkey-spatial/run_body.py
python tools/monkey-spatial/verify_body.py
python tools/monkey-spatial/run_collision.py
python tools/monkey-spatial/prepare_callbacks.py
python tools/monkey-spatial/run_callbacks.py
python tools/monkey-spatial/verify_callbacks.py
python tools/monkey-spatial/prepare_lifecycle.py
python tools/monkey-spatial/run_lifecycle.py 20
python tools/monkey-spatial/run_lifecycle.py 24
python tools/monkey-spatial/run_lifecycle.py 30
python tools/monkey-spatial/verify_lifecycle.py
python tools/monkey-spatial/prepare_joint.py
python tools/monkey-spatial/run_joint.py 20
python tools/monkey-spatial/run_joint.py 24
python tools/monkey-spatial/run_joint.py 30
python tools/monkey-spatial/verify_joint.py
python tools/monkey-spatial/prepare_cleanup.py
python tools/monkey-spatial/run_cleanup.py
python tools/monkey-spatial/verify_cleanup.py
python tools/monkey-spatial/run_glow.py
python tools/monkey-spatial/verify_glow.py
python tools/monkey-spatial/prepare_fire.py
python tools/monkey-spatial/run_fire.py
python tools/monkey-spatial/verify_fire.py
python tools/monkey-spatial/geometry_inputs.py
python tools/monkey-spatial/encode_vectors.py
python tools/monkey-spatial/run_geometry.py
# 以下五个重建变异均须完成采样并退出1；启动失败不算拒绝成功。
python tools/monkey-spatial/run_geometry.py origin
python tools/monkey-spatial/run_geometry.py filter
python tools/monkey-spatial/run_geometry.py phase
python tools/monkey-spatial/run_geometry.py pending
python tools/monkey-spatial/run_geometry.py vector
python tools/monkey-spatial/verify_geometry.py
python tools/monkey-spatial/run_natural_collision.py
python tools/monkey-spatial/probe_color_bounds.py
python tools/monkey-spatial/verify_natural_collision.py
python tools/monkey-spatial/run_rebuilt_collision.py
python tools/monkey-spatial/run_aoyi_targets.py
# 五个实际编译源变异均需采样完成后退出1。
python tools/monkey-spatial/run_aoyi_targets.py inclusive
python tools/monkey-spatial/run_aoyi_targets.py alive
python tools/monkey-spatial/run_aoyi_targets.py side
python tools/monkey-spatial/run_aoyi_targets.py index
python tools/monkey-spatial/run_aoyi_targets.py clear-target
python tools/monkey-spatial/verify_aoyi_targets.py
python tools/monkey-spatial/run_geometry_trees.py
python tools/monkey-spatial/ui_truth.py
python tools/monkey-spatial/run_dynamic_collision.py 20
python tools/monkey-spatial/run_dynamic_collision.py 24
python tools/monkey-spatial/run_dynamic_collision.py 30
python tools/monkey-spatial/verify_dynamic_collision.py
python tools/monkey-spatial/run_hurt_natural.py 20
python tools/monkey-spatial/run_hurt_natural.py 24
python tools/monkey-spatial/run_hurt_natural.py 30
python tools/monkey-spatial/verify_hurt_natural.py
python tools/monkey-spatial/hurt_geometry.py
python tools/monkey-spatial/run_inherited_display.py
python tools/monkey-spatial/verify_inherited_display.py
python tools/monkey-spatial/inherited_inventory.py
python tools/monkey-spatial/additional_ui.py
python tools/monkey-spatial/generate.py --verified
python tools/monkey-spatial/generate.py --verified --check
# 以下四项必须退出1，证明对应错误被拒绝；不得作为正常通过命令。
python tools/monkey-spatial/verify_joint.py phase
python tools/monkey-spatial/verify_joint.py owner
python tools/monkey-spatial/verify_joint.py birth
python tools/monkey-spatial/verify_joint.py layer
```

大测量/PNG/日志在忽略目录 `local-resources/regima/task-outputs/TASK-SETTINGS-228/{effects-air,body-air,collision-air,callback-air}/`。小型输入/验证报告在忽略的 `docs/tasks/evidence/TASK-SETTINGS-228/`。无生产依赖新增，无 src/public/原始提取目录改动。

## 后续消费者边界

1. 猴输入未知已在声明范围清零；保持callback/joint/lifecycle/cleanup各自明确的外部sink和有限样本边界，不宣传整份BaseMonster引擎重新执行。
2. 正式HP/去重、五关/TestScene目标输入序、P1/P2完整生命周期与实际画面仍由226验收；源输入完成不等于现代实现完成。
3. 229成为唯一Ready，马不得复用猴碰撞结果；可按源hash复用公共BBDC、原HitTest归约、共享继承显示方法及工具。
4. 226保持Blocked直到229输入也完成，不关闭PG-017或Active功能线。

中间产物策略：原生基准、独立解码输入及measurement是226/229复验输入，保留在Git忽略目录；错误Pillow、旧controlled-nextFrame及被退回动态fixture仅为历史诊断，不在最终manifest必需证据集合。正式实现完成后按消费者依赖再清理可再生输出。

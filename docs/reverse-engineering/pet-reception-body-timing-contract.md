# 兼容宠物受击身体时序合同

状态：verified（2026-10-04）。TASK-SETTINGS-254有限输入完成；249B与父249全部实现/两Scene验收合同保留。下文早期在制记录按时间保留，以本节最终交接为当前结论。


## 最终交接（2026-10-04）

正式视觉真值：`ground-truth/manifests/task-settings-254-pet-reception-body-timing.json`，truthId `task-settings-254.pet-reception-body-timing`；正式行为真值：`ground-truth/manifests/task-settings-254-pet-reception-behavior.json`，truthId `task-settings-254.pet-reception-behavior`。两者status=verified且unresolved为空，分别通过UI与有界行为Schema。独立只读审查确认19形态的源owner/动作/保护/清理字段足够支持后续有界owner实现，无需扩张完整技能或家族AI。

| 六段证据 | 当前交接字段/证据 | 验证与边界 |
| --- | --- | --- |
| 局部原方法 | behavior `/forms/*/methods`、`/actions`、`/allFrameCounts`、`/allFrameStopCounts`、完整setActionSource | 19形态38动作；继承、数组帧数、Phoenix条件保留旧行不被统一时长覆盖 |
| 共享调用链 | `/sourceMethods`、`/clock`、`/receptions`、`/guards` | 2910原方法case/40362态，114实际reduceHp接收与24hit2守卫；共享方法相对路径以原[172845].swf/scripts为根 |
| 恢复资源与空间 | `/forms/*/selectedOwner`、`/ownerResolution`；visual `/displayObjects`、`/baselines` | 416双方向原池输出状态、786原生节点绑定characterId；三Kabu明确20120203先定义，反序实际改变像素 |
| 原生运行 | behavior `/pause`、`/protection`、`/cleanup` | 228暂停、3保护时钟、8真实清理方法场景；20/24/30为手动host步标签，原生视觉stage实测24，不声称实时调度/一秒Tween插值 |
| 反证与独立对照 | clock/cleanup/visual mutations及owner verification；verify_behavior.py | 7时钟+4清理+3视觉真实编译源变异拒绝，3owner反序有像素差；8正式合同数据损坏拒绝；416态可见RGB/alpha/bounds精确对账 |
| 现代消费交接 | TASK-SLICE-255；behavior源字段/trace与visual状态/placement | 本任务未改src/public。255接既有实际HP owner，运行资产必须导出正式目录；249B继续负责完整两Scene联合验收 |

原始PNG、显示树和运行trace按项目规则本地保存，正式行为JSON已自包含实现/测试所需动作、owner、时钟与生命周期字段，不要求游戏运行读取ignored文件。源包/AS3/证据hash经verify_behavior重新核对，两manifest重复生成字节一致。原始受控坐标不自动意味着全部自然玩法可达；技能执行、Tween插值及完整家族AI仍为明确排除，非本有限输入待补项。

现代视觉例外：本次原生输入未引入现代替代层，原池→舞台对账无新增容差。后续现代投影需按这些原PNG逐态对账，不能沿用其他系统的像素容差。保留原清理语义：pet.bbdc引用保留、保护字典值null而非delete，不以现代“全部引用清空”改写原事实。

复验入口：`python tools/pet-reception-body-clock/verify_behavior.py`、`verify_visual.py`、`verify_owner.py`；再生成入口`behavior.py`与`manifest.py`。本地原始捕获按同目录capture/cleanup/visual/owner工具执行；源输入提取为`node tools/pet-reception-body-source.mjs`。项目Schema使用validate-ui-ground-truth.mjs显式传入上述两JSON。普通Git拉取可以获得正式行为输入，但源级复验仍需本地原语料和AIR，不作仅拉取即可完整逆向复验的承诺。

下一执行项：TASK-SLICE-255兼容受击身体owner实现；之后恢复249B全合同。254完成不关闭249B/249/204/194/VS-067或功能线。

## 范围与当前产物

19形态：卡布3、虎4、凤凰4、兔4、鼠4。tools/pet-reception-body-source.mjs读取目标AS3方法与五个恢复SWF的SymbolClass，输出local-resources/regima/task-outputs/TASK-SETTINGS-254/source-inventory.json，含38个hurt/dead字段记录、源hash、方法行号、继承链、全部候选符号owner及完整进入条件。node tools/pet-reception-body-source.mjs已成功；重复生成字节一致性另验。无现代源码/资源改动。

## 证据矩阵

| 合同项 | 局部证据 | 共享调用链 | 几何/坐标证据 | 等级 | 未知与反证 | 验证 |
| --- | --- | --- | --- | --- | --- | --- |
| 两动作字段 | inventory.forms[].methods/actions，目标initBBDC/setAction/scriptFrameOverFunc | BasePet受击→setAction→BaseBitmapDataClip.step | 恢复SWF SymbolClass候选已提取；cell/offset为AS3字段，尚非完整显示真值 | 确认事实（仅源字段） | owner优先级、实际可达帧、原生显示未闭合 | 静态提取及独立只读核对；运行待做 |
| 鼠2/3继承 | PetMouse2.as:6、PetMouse3.as:6均继承Mouse1且无三方法覆盖 | Mouse1方法实际继承 | 两形态均候选PetMouseBmd1；需运行确认 | 确认事实 | 不得由现代form编号另选atlas | 自动继承提取与只读核对一致 |
| 凤凰hurt特殊入口 | PetPhoenix1.as:60后setAction；四形态frameCount均含[1,1] | BBDC.step在数组count时按curPoint.x取值 | 声明hurt行不保证实际切到该行 | 确认事实（源条件） | hit2期间拒绝hurt；x/y的&&守卫可能保留旧row，必须原生trace | 首轮固定整数count解析失败揭示差异；已保留完整条件，不归一化成8tick |
| frame-over | 19形态hurt为setStatic+wait，dead为destroy | BasePet/BaseObject清理仍须trace | 不适用结束回调本身；其触发帧仍需视觉/时钟证明 | 确认事实（回调分支） | 不代表所有进入路径时长一致 | 独立只读核对全部19形态 |

## 已确认边界与剩余

Phoenix1的hurt守卫为curPoint.x != 0 && curPoint.y != 1；hit2时直接拒绝hurt。不能用固定row表覆盖该分支；其余凤凰须逐项原生运行核对。Tiger4进入hurt/dead清aoyiStep，Phoenix4进入hurt清isAoyi并doWhenAoyiOver，Mouse4进入hurt清_aoyiStep；这里只保留源副作用，不迁移技能。

提取器首轮JSON解析被2 * 60阻止，改为仅允许数字数组与字面乘法，不eval源。第二轮发现Phoenix数组frameCount后删除“统一可达持帧”推导，保留原始数组和完整setActionSource。两次失败不计通过证据，也未改原语料。

下一步：核实加载优先级；以原方法构建独立AIR时钟fixture，覆盖hurt进入前的实际row/x、hit2拒绝、重复hurt、暂停/保护/dead结束；再生成恢复源逐态PNG/显示列表、Schema与反证。当前不创建verified manifest，不解除249B阻塞，不关闭254。


## 原始方法时钟观察（2026-10-04）

新增tools/pet-reception-body-clock/{capture.py,Probe.as,verify.py,mutations.py}。从原AS3逐方法取BaseBitmapDataClip时钟、BaseObject.setAction和19形态完整setAction，在游戏随包AIR runtime（SDK ADL启动）编译运行；只摘取原hurt/dead结束分支。位图刷新、setStatic/destroy及凤凰技能清理是明确观察sink，不声称完整身体渲染/HP/owner释放。源方法hash/locator和适配说明在本地clock/sources.json。

2910个输入、40362条状态捕获；输入为各声明atlas row/x的显式控制组合，不保证全部在正常玩法可达。20/24/30标签表示手动host tick解释，未驱动真实帧率调度，不能充当BaseObject保护倒计时验证。独立verifier覆盖19形态×hurt/dead×三标签的规范wait入口，以及凤凰x1/hit2守卫，共138边界断言；其他输入仅核对全集、连续tick、终态与三标签一致，不声称所有轨迹已独立验证。

已观察：Phoenix1/4从wait row0/x0进入hurt保留row0，15tick后wait；从row0/x1进入hurt切到指定行，8tick后wait；四凤凰hit2拒绝hurt。规范死亡入口下卡布10tick、虎一阶8tick、其他18tick；这是上述控制输入结果，不覆盖重复死亡/任意原位置条件。原setAction仍完整执行，并保留凤凰清理sink计数。

三个真实编译源副本变异（持帧每步减2、凤凰&&改||、hurt结束不setStatic）均由独立行为断言拒绝，编译/运行失败不计拒绝；正向原产物保留且复验通过。报告clock/verification.json与clock/mutations.json，本地变异各独立目录。源库存未修改。

首次夹具包含switch末尾闭括号/default导致编译失败，修正提取边界后重新生成；随后app资源URI写文件受AIR保护拒绝，改为工作目录nativePath并增加异常退出，未改运行算法。早期未捕获异常导致一次60秒超时，原进程已终止后重跑成功；不是原方法死循环结论。Python LSP仍不可用，使用实际Python/AS3编译运行验证，未安装软件。

剩余：完整保护/重复hurt/暂停生命周期trace；真实可达进入状态核对；恢复源owner优先级、逐态视觉基准/显示列表与Schema；更多字段反证。254仍在制且所有机器输入保持draft，不解除249B。


## 暂停、重复受伤与保护补充（2026-10-04）

时钟probe扩展执行原BaseObject.step/setYourFather和完整BasePet.reduceHp。PetInfo仅标量HP/lifetime sink且无qlfj，物理、网络、UI与实际destroy仍为隔离sink；不据此声明完整owner实现。当前新增228暂停case、114规范接收case和20/24/30三条保护计数，verify_lifecycle.py独立断言通过。

暂停case逐态与已有无暂停原方法轨迹比较：进入前pause时hurt保持，dead通过原BaseObject.setAction恢复播放；进入后第3..5tick暂停，第6tick恢复，位图时钟状态只整体延迟3tick。这里是BBDC暂停，不等同于整Scene子树停步。

重复受伤通过原BasePet.reduceHp：规范row0/x0进入hurt后，在第3个host tick前再次扣1HP，原分支只setFramePointX(0)，保留curKeyFrameIndex。普通形态最终tick10回wait；四凤凰保留wait行且关键帧计数不重置，最终tick13回wait。HP99→98、lifetime保持5、关键帧保留及第3tick坐标/hold逐项断言；不能把重复hurt理解为从完整动作起点重播。

致死reduceHp将标量HP归0/lifetime5→4并设置gc.frameClips*5保护，body先于保护在BaseObject.step推进。纯保护时钟在计数减至0当步仍protected，下一步减为-1才解除，三帧率分别验证。death结束的真实destroy会另清保护，probe的destroy仅观察sink，所以不使用最后sink态剩余保护作原版清理事实。

原方法副本变异扩展为6项：持帧、凤凰守卫、hurt结束、死亡不恢复播放、保护在0提前解除、重复hurt不重置帧。全部真实编译/运行成功后由行为断言拒绝，正向产物复验通过。报告仍为clock/verification.json、clock/mutations.json，各变异隔离目录保留。Probe首次误用AS3关键字protected作裸字段名导致编译失败，改观察字段名isProtected后通过；不改原方法。

剩余主要输入：恢复源body owner优先级及原版逐态像素/显示列表、源真实可达进入路径与销毁引用；schema及最终独立复核。254仍Ready、机器输入仍draft，父249合同不关闭。


## 恢复资源原生视觉采样（2026-10-04）

新增visual.py、VisualProbe.as与verify_visual.py。按原启动链先20120203、20120808、StageCommon，再关卡pet1、mouse，向同一ApplicationDomain加载恢复包；保存首次20120203的PetKabuBmd1..3 Class引用，全部加载后逐个===确认仍为原补丁定义。owners.json三项通过；这是实际同名类解析证据，不是仅按corpus排序。

416双方向控制状态来自先前源方法trace的208个form/action/row/x坐标（排除终止后状态），含320 atlas、96 MovieClip路径。兔四形态和鼠两种body symbol实际走MovieClip池；首轮“全是BitmapData”假设被原生运行拒绝，已改为执行原BaseBitmapDataPool.analysisMcToBitmapDataArrayByString/registerData，保留原bounds、双方向矩阵与smoothing=true。取帧及位置执行原BaseBitmapDataClip.getCurFrameBitmapData/setOffsetXY/setXYByDirect；未使用现代实现产生基准。编译仅在未使用的isAnimation=true分支补显式return null，不改变当前false分支。

每态保存940×590原生PNG、原生池像素、实际输出注册位置/alpha/简单显示树及非透明bounds。独立Python从池像素按原声明cell/方向裁切，按独立位置公式组装舞台，与原方法取帧/绘制比较：416态可见RGB差0、alpha完全一致、bounds与注册位置完全一致。报告visual/verification.json；root为(470,350)，整数位置、实际原AIR运行，不声明任意子像素或现代显示等价。ufo1 hurt基准人工查看通过；并非全416态人工查看。

首次输出大量重复atlas PNG触发60秒工具上限，原进程已结束后改为按symbol/direction复用pool文件、无损快速PNG编码并使用180秒有界进程超时，完整采样成功。失败未计通过；旧本地PNG不参与fixture索引，当前验证仅消费明确416个observations及其poolFile。

尚缺：原始MovieClip递归显示列表、完整实际可达路径/源销毁、视觉字段/加载反证、Schema/最终独立复核。当前简单显示树是原池输出后的夹具树，不充当源MovieClip树。所有产物仍draft，本批只证明原生受控取帧/注册与同名类归属，不解除249B或关闭254。


## 源递归显示树与视觉反证（2026-10-04）

VisualProbe对每个MovieClip控制状态另建恢复源实例，定位外层row+1/内层x+1并递归采集实际节点：稳定路径/parent/depth、类与实例名、局部矩阵、local/source bounds、alpha/visible、blend、mask路径、filters及ColorTransform、current/totalFrames、children计数。416态共786条源记录，其中96个MovieClip态466节点，其余320为原BitmapData身份与尺寸；本批实际filters/mask均为空。源节点的characterId还未与SWF时间轴逐项绑定，不以类名代替该字段。

独立verifier检查父子链、child计数、帧位置与mask引用；每个MovieClip状态从新实例直接绘制的像素与顺序池栅格化结果alpha/可见RGB完全一致，排除了当前状态集中“新建goto与原池逐帧推进不同”的疑点。然后416态继续通过池像素→原取帧→940×590舞台的原点、可见RGB、alpha与bounds精确对账。这个树是源MovieClip树，与原池输出后的三层夹具树分别记录。

新增visual_mutations.py：仅在副本中将原getCurFrameBitmapData/setXYByDirect改为原点+1、反方向、下一行。三个变异均编译/运行完整416态后，分别被独立像素/几何断言拒绝，原正向产物复验通过；报告visual/mutations.json，各变异隔离目录。没有改源语料或现代源码。加载owner反证和动作frameCount反证尚未由这三项覆盖，保留缺口。

剩余：Schema规范化及真值字段最终绑定；实际可达转移与真实destroy/source引用；加载owner/frameCount等未覆盖反证；独立收口审计。原定254范围及249B父合同保持不变，仍不晋升verified。


## 真实销毁方法与Phoenix受击入口（2026-10-04）

新增cleanup.py/CleanupProbe.as/verify_cleanup.py，实际编译原BasePet.destroy、BaseBitmapDataClip.destroy、BaseBullet.destroy、BaseHero.clearPet、AUtils.stopAllChildren及完整MyProtectedProperty。8个双owner标识/满附属/空附属/已离树/重复销毁场景检查真实Sprite父子关系和sourceRole等引用；另一owner保持不变。effect.destroy为计数sink；TweenMax仅记录原请求并显式执行原onComplete回调，不声称本探针验证了一秒插值/调度。

断言通过：身体即时离树、bmdArray清空、帧回调清空；附属弹实际destroy后离树，sourceRole/sourceRoleAttackInfoObject/imgMc/帧回调清空；pet的magicBulletArray空、curAddEffect null、sourceRole null、hero.myPet null及ready置位；原保护表getProperty返回0。原请求duration=1、owner参数正确，完成原callback后pet父节点移除。重复destroy不重复作用于已清空附属弹/effect。

必须保留原语义边界：pet.bbdc字段仍指向已销毁身体，不是null；MyProtectedProperty.removeProperty只dict[owner]=null，不delete key，因此这里证明保护值撤销，不宣称字典完全释放owner键。BaseBullet.funcWhenDestroy也不是此次断言的清空目标。不能以现代期望“所有引用归零”覆盖原方法事实。

另新增24个Phoenix hit2→原BasePet.reduceHp入口观察：非致死HP100→99但保持hit2/action/row/x/hold/key/lifetime/cleanup；致死仍进入dead，HP0、lifetime4及fps*5保护。只验证受击入口结果，不扩展hit2技能结束行为。clock/verification.json已加入guardReceptionCases=24，其余2910/228/114/3合同继续通过。

清理反证：source保留、附属弹数组保留、身体destroy遗漏、保护表remove遗漏四个原方法副本均真实编译运行后被独立引用断言拒绝；正向复验通过，见cleanup/mutations.json。未修改源语料。254仍缺Schema/characterId绑定、owner/frameCount反证和最终全集审计，不因这两项补齐而自动完成。


## 来源绑定、加载反证与draft规范化（2026-10-04）

bind_source_tree.py直接解析恢复SWF的DefineSprite/PlaceObject/Remove/ShowFrame，将416态786个原生节点路径绑定characterId、tagCode、SWF depth与源hash；逐层核对实际子节点数量、原生current/totalFrames及类型，全部通过。矩阵/颜色仍取原生观察，不用不完整二进制矩阵解码替代。输出visual/source-bindings.json。

owner.py独立加载20120203、pet1，以及实际/反转两个顺序，共12个类实例。正确顺序像素等于独立补丁包，反转顺序等于独立旧包，三Kabu实际改变21970/24357/76727像素；verify_owner.py通过，证明加载顺序错误确实改变实际图像。源方法frameCount消费边界变异也被独立时钟断言拒绝；当前7个时钟变异已含最新24个受击入口数据重跑。

manifest.py生成ground-truth/manifests/task-settings-254-pet-reception-body-timing.json，416态、19逻辑池输出位图、原生基准hash与来源；完整源树在独立绑定产物中。Schema合法且项目validate-ui-ground-truth显式目标通过。视觉probe重新采样并记录实际stageFrameRate=24，避免猜测采样帧率；这个渲染器帧率不替代20/24/30 host tick合同。首轮缺$schema导致项目分派器拒绝，补显式Schema声明后通过，不改变验收范围。

独立审查尚未放行：UI Schema不承载frameCount/frameStopCount/guard/结束及重复受伤清理字段，当前manifest仅provenance引用它们。下一步新增有限时序/生命周期机器合同及对应Schema，正式保存运行必需字段，并绑定视觉manifest；不在通用UI Schema强塞行为字段。原始PNG/trace继续按项目规则仅本地保存，后续实现必须导出所需运行资产，不能依赖ignored证据。draft与未完成状态继续保留，不把Schema合法等同于合同完成。

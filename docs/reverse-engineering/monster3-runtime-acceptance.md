# Monster3 两场景运行验收（实施中）


## 最终联合验收矩阵（2026-10-04）

以下为当前结论；后文各日期段落保留当时调查/失败过程，早期“缺口”不覆盖本矩阵。

| 父249合同 | 当前证据 | 范围/状态 |
| --- | --- | --- |
| M3-01..08 / 身体效果顺序 / 出生与检测相位 | 247原trace、540态/135检测；Monster3WorldStep与模型世界测试 | 已通过，两模型×20/24/30；出生下一world步检测、末帧先检测 |
| 自然选择/CD/随机/方向 | 250独立expected，27936决策态与21312连续态；两Scene自然双攻击 | 已通过；不猜其他类型AI |
| 实际HP/属性/保护/ID | 249A、253 A迁移；255实际兼容owner；正式当前目标拒绝及三pet碰撞profile经105660原case进入实际HP接收 | 已通过有限输入，GXP/Monster3魔花无生产者边界保留 |
| 空间与原生显示 | 140880布尔零差、42,906,767像素与精确451已批准残差；两Scene各30显示态双底 | 已通过；最大可见RGB差0.498039/255，alpha差0 |
| 兼容19形态 | 255两Scene×三档×19受伤/重复hurt/死亡/暂停、退出重进及416显示态 | 已完成，独立验收见pet-reception-body-runtime-acceptance；不扩成完整家族攻击 |
| 自然真实owner旅程 | 原双人猴系两Scene三帧率；新增UFO30fps两Scene自然承伤、双攻击、暂停/restart/地图重进 | TestScene860步10次HP对账，Stage13修正暴露距离后760步28次；双方英雄/宠物均实际扣血 |
| 源受伤/死亡与退出 | 默认hurt两模型三档保持同一已发弹体；两Scene火伤同帧死亡仍发射/完整五相位/死后实际HP；真实2500ms失败原生按钮重试 | 已通过；退出/重试断开source与parent |
| 生产反证 | 原13核心、249A11接收；新增7当前owner/profile/source、4真实Scene显示、1旧Scene伤害路径 | 当前owner/profile/source与显示通过；旧Stage13路径重新启用被运行断言拒绝(19次)，正向复跑无旧路径调用 |
| 工程与交付 | 499模块build；255相关9组与运行数据再生成通过；完整117组回归通过 | 不依赖ignored运行数据；未commit/push |

新增证据：`docs/tasks/evidence/TASK-SLICE-249B/owner-mutations/`、`display-mutations/`、browser带`--ufo`报告。105660实际adapter profile样本使用248 native cases作expected，并非现代profile自证。旧Scene路径断言观察真正resolveEnemyAttack调用，不通过读源码字符串判断运行是否正确。现代视觉变异在esbuild onLoad中隔离，编译成功并生成60态真实画布后才由独立AIR基准拒绝。

自然UFO旅程失败摘要保留：Stage13旧260距离对飞行兼容宠物暴露不足，7000步只获得P1宠物样本并发生截图CDP超时；不计通过。探针改为通过键盘维持100距离，未移动目标/修改生产命中，760步完整通过。截图已目检；非hurt/dead时蓝色兼容占位体仍是既有未迁移家族范围，不宣称全家族原生化。

全回归首轮发现incoming-feedback-runtime-tests仍用Monster30旧activeAttack造事件，独立弹体迁移后返回undefined。已改用仍走普通入口的Monster2验证原通用feedback合同，伤害99/实际Session HP/来源时间断言保留；Monster30专项210实际接收与Monster3专用合同不降级。专项及完整117组重跑通过。

所属 `TASK-SLICE-249B`。249B及父249于2026-10-04完成；本矩阵核销247/248/250/251有限合同，不关闭其他怪物、未迁移宠物家族或整线。下一执行项TASK-SETTINGS-256。

## 当前生产接线

Stage13类型3与TestScene Boss均调用 `Monster3CombatWorld` → `Monster3WorldStep`，复用现有效果累积时钟；Boss通过访问器保留原HP、目标与奖励owner。旧Scene矩形伤害调用已撤销。独立攻击同步调用当前Hero/Pet Session接收端口，显示桥只投影已推进的身体和攻击。30原生PNG归属于family-3-30资源包，运行不读取本地证据目录。

## 完成审计

| 合同 | 当前证据 | 尚缺 |
| --- | --- | --- |
| 247 M3-01..08、250自然选择 | 135原检测相位/540态、27936决策/21312连续态；两实际模型三帧率自然两攻击及7/6出生 | 完整最终Scene消费与反证归并 |
| 实际HP/保护/闪避/ID | 249A独立原expected及576实际Session；两模型真实双人HP；下述Stage13正式旅程 | 兼容19形态动作/保护消费者、完整两Scene联合矩阵 |
| 源死留弹/冰火/暂停/destroy | 生产模型死后检测、火伤致死阻止AI；Scene暂停与退出清理已接 | Boss浏览器、同帧致死/默认hurt/持帧等最终Scene反证 |
| 140880空间case | 已有全域生产查询及批准451像素精确残差 | 最终代码冻结后复验及归并 |
| 30原生显示态与135相位 | 原PNG已加载；只读显示port及相位通过；Stage13自然两动作纹理可达 | 两Scene各30态WebGL原生整数根投影已对账（见下文）；最终源变异/全回归归并仍待 |
| 生产变异 | 既有核心12类及249A接收变异 | 新Scene接线/目标/current owner/生命周期变异 |
| 正式旅程及工程交付 | Stage13与TestScene均有20/24/30fps普通双人猴一阶样本；既有回归/build及工程检查 | 死后命中及最终全回归（30fps两Scene真实失败重试见下文） |

## Stage13真实浏览器样本

入口：`$env:M3_SCENE='Stage13Scene'; $env:M3_FPS='30'; $env:M3_MODE='normal'; node tools/run-monster3-browser.mjs`。

940×590，QA入口后从正式存档重启（必须验证`active-save`），两名英雄与各自猴一阶。初始生存HP是明确夹具；战斗中不回写HP。固定随机种子`0x249b`，仅通过键盘往返移动进入攻击范围，不移动怪物/宠物到碰撞点，不强制选择攻击或命中。探针编译时注入只读对象观察，未修改磁盘生产源。

2026-10-03最终本样本运行2900步，自然hit1/hit2均出现；9个Monster3命中步骤直接采样当前英雄与PetState HP，并与末次结算HP相等。P1/P2英雄和各自宠物均有实际下降；宠物例包括P2 9148→9130、P1 8104→8070、P2 8170→8136。Scene暂停保持、直接restart清理、正式返回地图及重进通过；没有浏览器error/warning。直接restart不等于失败倒计时旅程。

本地证据：`docs/tasks/evidence/TASK-SLICE-249B/browser/Stage13Scene-30-normal.json`、同名PNG与`verification-Stage13Scene-30-normal.json`。实际截图已检查；它不是全部30态原版差异证据。

失败边界保留：首轮开发配置没有恢复宠物，只证明英雄命中；随后宠物未进入攻击域及缺直接HP采样的失败分别保存为`*-failed-no-pets.json`、`*-failed-pet-not-exposed.json`、`*-failed-no-pet-hp-sample.json`。途中CDP评估/截图超时不计通过。修正正式存档入口、往返路线、固定随机及手动步进delta后，最终以增强断言通过。`initial-hero-only-verification.json`仅为旧的较窄样本，不纳入完整接收通过结论。

## 兼容owner缺口

`PetRuntimeModel`当前只有idle/follow/warp；非Session19形态没有通用当前受击动作、保护倒计时和返回reaction消费者。249A兼容函数虽写真实HP并返回action/protectionTicks，仍不能据此宣称现有Scene消费完成。必须补证并接入当前owner，不能把移动状态猜成hurt/dead/hit2，也不能隐式扩成完整家族AI迁移。GXP及Monster3魔花无现有生产者的边界同样保留，不从怪物奖励gxp或其他类型字段猜当前效果。

## 2026-10-04 增量验证

Stage13普通双人猴一阶新增20fps（660步、15次直接HP对账）和24fps（740步、4次直接HP对账），均覆盖P1/P2英雄及各自宠物实际HP下降、自然hit1/hit2、暂停、直接重启清理、返回地图重进，浏览器errors为空。证据为browser目录下Stage13Scene-20-normal、Stage13Scene-24-normal的JSON/PNG及verification报告；24fps截图已检查。与30fps相同，这些样本不证明30态像素、源死留弹或实际失败倒计时。首轮24fps因4174预览服务已停止而未启动；确认无监听后恢复服务，runner增加HTTP前置检查，并将报告scope改为实际scene/fps/mode字段。

兼容owner只读复核：原[172845] BasePet.as:865..934证明重复hurt重置动画帧、单机死亡设置hostFps×5保护并减寿命；BaseObject.as:165..195逐世界帧递减保护。PetRabbit1.as:111..131在动画结束回调将hurt转wait、dead执行destroy；BaseBitmapDataClip.as:461..515拥有帧推进。251只验证接收结果，明确不覆盖连续保护/动画重放。下一接线必须区分保护时钟与动作结束，不能拿5秒保护或统一猜测tick当19形态死亡/受伤动画时长。既有兼容视图只消费移动状态，该缺口仍未完成。

## Boss路线探针在制（2026-10-04）

编译观察增加Monster3BossCombatAdapter：每个真实boss只登记一次访问器，仍读写原owner，不在生产源落观察代码。TestScene导航从既有stage11-browser-audit路线派生，键盘逐平台跳跃；清除旧场景M30观察对象作为导航目标、保持跳台目标至落地、修复到边缘仍等待的条件。每1000步输出平台/坐标，便于区分未到达Boss与Boss接收失败。

本批浏览器均未通过：初始7000步停底层，随后推进到through-10但长跳失败；最后7000步无Boss命中，截图CDP超时，不能计任何Boss验收成功。原始快照保留browser/TestScene-30-normal-failed-{no-climb,stale-navigation,platform-route,midair-target,edge-wait,long-jump}.json，最后日志在.tmp/monster3-boss-browser.log。当前脚本补了跳台方向释放/再按以触发现有双击奔跑，尚待新一轮实跑，不能声明路线已通过。未改生产游戏行为或移动角色到Boss。

兼容19形态时序调查：generate-pet-animation-corpus只给restored SWF owner，exactBodyActionRows为unresolved-by-design；现有猴/马动画生成器可作为窄取hurt/dead两行模式，其他兼容形态仍缺verified frameCount/frameStopCount/frame-over行为。保护倒计时已有源证，不能替代动作结束时序；继续按249B精确缺口/拆分触发处理，父合同不缩减。

## Boss 30fps正式双人样本通过（2026-10-04）

TestScene-30-normal最终1160步、17次直接HP对账通过，两攻击自然可见，P1/P2英雄及各自猴一阶PetState均实际扣血。例：P2英雄999925→999885，P1英雄999948→999930；P1宠物9964→9946，P2宠物9955→9921。暂停、直接restart清理、正式地图返回/重进通过，errors为空。证据browser/TestScene-30-normal.json、同名PNG、verification-TestScene-30-normal.json；940×590截图已检查。仅键盘登台与Boss近距离往返，未传送角色、强制Boss触发/动作或回写战斗HP；初始生存HP夹具沿用前文边界。

路线诊断使用生产HeroMovementSystem和原Stage11平台，无战斗30fps在280步内登顶；可复跑node tools/run-system-tests.mjs monster3-stage11-navigation-tests。这仅证明测试驱动可行，不替代浏览器。发现并修正落地等待期间走出平台、双击方向未形成两个新按下事件、长跳起点/二段跳时机；20fps诊断仍失败，尚不宣称低帧率Boss路线通过。旧run-route失败与hero-only样本保留，最后将Boss往返距离由260改为100后双方宠物进入攻击范围；此为键盘站位调整，未强制碰撞。

完整父合同仍缺兼容19形态、其他Boss帧率、源死留弹/同帧致死与实际失败倒计时旅程、30态原生像素/注册点/alpha、Scene反证与最终全回归。本样本不关闭249B。

## Boss三帧率补齐（2026-10-04）

新的键盘路线从through-9直接跳through-11，均是现有平台和移动系统可达路径，不要求绕行through-10；长距离先靠边。monster3-stage11-navigation-tests现覆盖20/24/30fps，均通过。未修改生产物理、地图或角色坐标。

正式样本：TestScene-20-normal 460步/12次HP对账；24fps 680步/10次；30fps复跑980步/15次。三者均覆盖双方英雄及宠物实际HP下降、自然双攻击、暂停、直接restart清理、地图返回重进，verification均passed/errors=[]；20/24截图已检查，30此前截图已检查，完整30态像素仍未完成。30fps中途发现P2先触发Boss后P1在下层被全局战斗导航截住，失败快照保存为TestScene-30-normal-failed-partner-climb.json；改成逐成员高度判断是否继续登台后通过。runner开始写running，异常写failed，避免新失败沿用旧passed报告。

下一失败旅程的真实调用链：PlayableLevelRuntime.update接encounter返回failed后showLevelResult；LevelLifecycle默认2500ms，首帧全死只建立pending，后续扣delta。TestScene先flow后战斗，死亡后下一帧进入pending；Stage13战斗后检查，本帧进入pending。原生失败retry左上(305.95,394)，pointerup走scene.restart(retryData)。后续须低HP夹具后由实际怪物伤害致死、验证倒计时与按钮重试及shutdown清理，不调用直接restart冒充。该旅程仍未执行。

## 两Scene真实失败重试通过（2026-10-04）

命令在原三参数外加M3_FAILURE=1；本批TestScene/Stage13Scene均30fps，前置仍要求双方英雄及宠物实际承伤、双攻击，不缩减原普通样本。低HP夹具仅在前置通过后一次性把两英雄当前HP设1，保留各自hpBefore和fixtureHp；之后由实际伤害结算写0，不设置dead或调用失败/重启回调。

TestScene前置2000步85次HP对账，最终P1/P2均由monster3致死；tick2113进入pending=2500，tick2188 failed。Stage13前置2900步9次HP对账，致死来源分别stage13-enemy-2/-3；tick2959进入pending，tick3034 failed。每个后续世界delta逐条扣减对账，双方HP=0、alive=false、致死结算hpBefore>0/amount>0均检查。两Scene通过真实CDP鼠标按下/松开点击原生重新挑战按钮(385,425)，再正常game.step处理SceneManager排队；未调用scene.restart替代按钮。新party创建、旧party destroyed、旧Monster3 runtime destroyed、保留的旧攻击对象source/parentId均undefined，随后地图返回重进通过。重试后的UI观察不再含retry按钮；两张940×590原生失败截图已检查。

本地证据为browser/{TestScene,Stage13Scene}-30-normal--failure的前置JSON/PNG、-defeat.json/-defeat.png、-retry-ui.json及verification报告，均passed/errors=[]。失败原始记录保留mixed-source-first（额外限制双方必须M3最后一击未满足，不是倒计时失败）、pet-below（前置宠物未上平台）、retry-click-first和retry-pending-ui。后者确认按钮已禁用并执行回调，但手动时钟未刷新队列；补正常更新步后成功。宠物只通过英雄走位/跳跃触发现有跟随，不直接移动宠物。此项不证明源死留弹、全30态像素、兼容19形态或最终变异。

## 两Scene同帧火伤致死/留弹（2026-10-04）

M3_MODE=fatal，30fps。受控边界：自然hit1身体tick6且英雄处于实际近距离时，将当前source HP设1、既有效果计数归0并添加1点首次火伤；不调用攻击发射/接收，不移动目标。原身体先于效果推进，实际Scene在出生当步HP归0、body=dead，攻击age0/frame1仍存在；随后age1..4对应frame1..4保持，age5完成后从runtime删除并清source/parent、frame归0。两份原始fatalTrace均逐tick检查，增强的完整五相位断言已回查现有JSON并写入runner。

TestScene-30-fatal 680步/7次HP对账，死后攻击monster3:2:1令P2 999970→999930。Stage13Scene-30-fatal 2380步/6次HP对账，死后攻击令P1 999808→999770。暂停、restart清理、保留对象source/parent释放、地图返回重进通过。browser下对应JSON/PNG/verification报告保存，errors为空。此场景的死后命中只声明上述目标，双方英雄/宠物完整承伤及两攻击覆盖由普通三帧率旅程另证；不要求一发死后弹同时覆盖四个不同根位置。首个Boss已死后扣血但旧探针仍等待全部四目标的失败保留为TestScene-30-fatal-first-dead-hit.json。

仍需默认hurt/其他生命周期最终归并、兼容19形态动作时序与接线、完整30态显示差异及最终生产变异/回归；本批不是源死弹体逐帧截图或所有攻击/效果组合浏览器证明，不关闭249B。

## 两Scene全30态显示对账（2026-10-04）

M3_VISUAL=1通过原正式Scene加载资源，在各Scene调用生产syncMonster3AttackViews，重复paint不改runtime/不重复对象；隔离RenderTexture绘制生产Image。状态、方向和root=(470,295)直接取248原生oracle显示树，expected像素来自248 AIR完整940×590 PNG，不读现代碰撞mask或以现代projection生成expected。两个Scene各30态（hit1五帧/hit2十帧×双方向），每态黑/白底各采一张，共120张，tools/monster3-collision/verify_display.py通过。

结果：60个Scene-state的最大可见通道差0.4980392156862763/255；用黑白差独立恢复alpha后最大差0，非透明bounds与原PNG完全相等，生产Image的x/y/尺寸、origin=0、flipX=false、alpha=1逐态检查。保留既有用户授权颜色舍入边界（验收上限3/255，alpha上限1/255），不宣称原RGBA字节完全相同，也不将视觉阈值用于碰撞。export_runtime.py --check同时通过34碰撞字段/30显示资产。

首轮直接透明RenderTexture.snapshot失败，最大可见差41.12；Phaser WebGLSnapshot将readPixels的预乘颜色直接写Canvas ImageData，不能把导出透明PNG当直通RGBA基准。失败报告visual-verification-transparent-failed.json及透明PNG保留；改用实际黑/白不透明底合成后没有透明编码歧义，且双底恢复alpha与原版完全一致，未放宽阈值。正式报告browser/visual-verification.json；采样及位置元数据位于browser/visual/{TestScene,Stage13Scene}/，两Scene截图样本已检查。Python LSP缺basedpyright，未安装；实际Python校验执行通过。

范围：当前实际WebGL渲染器、原30态整数根、独立绘制层；自然Scene发射和可见路径由普通旅程另证。不是任意分数根采样/整场景遮挡或Canvas声明，不改135相位与248碰撞残差批准。剩余兼容19形态、默认hurt及最终生产反证/全回归仍保留。


## 默认受伤留弹模型反证（2026-10-04）

monster3-combat-world-tests在自然攻击出生后，分别经真实applyMonster3Hit和resolveStage1HeroHit入口令Boss/Stage1模型扣血进入hurt，覆盖20/24/30fps。下一世界步确认同一攻击仍进入接收检测、age增加1、source与parent引用不变，身体读hurt；随后继续验证死亡留弹及destroy清引用。不是浏览器受伤旅程或兼容宠物动作证明。

新增hurt-clears生产变异：在Monster3AttackRuntime身体更新前故意于hurt清弹，模型行为断言拒绝。共13个核心变异全部被AssertionError拒绝，逐次恢复源文件字节，并重跑碰撞、选择、相位、生命周期与模型世界五组正向测试通过。报告docs/tasks/evidence/TASK-SLICE-249B/core-mutations.json。完整Scene/current-owner/display反证与兼容19形态仍未完成，249B保持Ready。


## 兼容19形态补证边界复核（2026-10-04）

只读复核确认：generate-pet-animation-corpus.mjs仅建立restored包owner，exactBodyActionRows仍unresolved-by-design；不能以atlas数量代替动作时序。现有generate-pet-monkey-animation-ground-truth.mjs与generate-pet-horse-animation-ground-truth.mjs可复用提取形式，但不是其余家族的现成输入。最小补证字段为目标body SymbolClass/源包、initBBDC的frameCount/frameStopCount、setAction的hurt/dead行与scriptFrameOverFunc结束行为，并绑定BaseObject/BaseBitmapDataClip/BasePet调用链。

249B的“缺影响实际HP的原版输入”和“A声明外公共owner改造”拆分触发已命中；下一步按task-generation建立有界前置，并保留249B全部合同，不猜统一hurt/dead时长、不迁移家族技能。当前尚未改执行指针或创建新task，249B仍唯一Ready；此记录用于接续调度，不声明前置已经完成。

## 最终工程核销

完整117组system测试全部通过，包含Monster30、青龙/玄龟/猴马既有家族、反馈/存档/关卡/资产归属。第二个旧测试依赖是抽取updatePets的Session-only闭包未提供新增compatibilityPets绑定；公共fixture已显式断言只接受四个已迁移家族并提供其真实无兼容对象分支的no-op，不伪造兼容验收。三个家族消费者专项先通过，随后完整117组通过。两次初次失败均保留于执行记录，不将其计为通过。

新增可重复门禁：run-monster3-owner-mutations.mjs、run-monster3-display-mutations.mjs、run-monster3-scene-mutations.mjs。Scene旧路径变异在Stage13真实调用19次后被断言拒绝，正向UFO旅程复跑为0旧调用。生产核心算法未因测试夹具而回退旧activeAttack路径。

build已通过499模块；check:level-architecture、check:structure（8既有warning）通过，Git diff空白检查通过。运行src/public数据及生成入口随Git交付；docs/tasks/evidence和本地原语料仍为复验材料，不承诺仅拉取可重跑全部源级oracle。未执行commit/push。249B与249归档，下一256只补Monster2行为输入，当次目标不继续执行256。

最终检查补充：测试选择器旧固定计数14/90已同步当前15/117，其4项行为测试通过；最终workflow通过（22未完成/352历史，256唯一Ready），8活跃PG结果已记problem-audit。临时浏览器probe目录递归清理被自动审批拦截（blocked by policy），已保留；正式build与本地实际采样/精简报告保留供交付复核。

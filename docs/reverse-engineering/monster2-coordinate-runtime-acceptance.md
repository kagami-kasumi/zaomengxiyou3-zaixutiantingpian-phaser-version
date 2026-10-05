# Monster2 聚拢坐标实现与验收

2026-10-05，`TASK-SLICE-260A`生产接入与行为/浏览器验收已通过，工程收尾检查见下。261的[正式英雄有限运动输入](hero-gather-motion-contract.md)已由实际movement消费。父260、B及完整功能线保持未完成。

## 当前生产接入和已验证范围

`HeroSourceMovementSystem`将既有movement对象投影为原root（feet-50），沿用唯一静态墙积分函数；公开velocity仍为px/s，适配器向原物理暴露px/host-step。运行参数由`tools/prepare-hero-motion.mjs`从261 verified合同生成到`src/assets/hero-motion-profiles.json`，游戏运行不读取ignored证据。普通Role1..4用6/10、Role5用7/11；受控5px及Role5显式false构造分支只属于对应验收输入。

`HeroPartyRuntime.gather`保留真实movement引用，Scene暂停/恢复平移Tween时间，退出清空；新请求过滤已死亡英雄，已有Tween保留死亡/脱离对象引用。`HeroPartyGatherBridge`在下一实际世界步处理队列恢复，避免使用RAF时间后再减残余时间导致时钟倒退。Stage1-2按配置host步累积delta，依次推进gather、既有Registry、回调中的完整HeroParty。其他Scene不传此接缝时沿用原顺序；未接Monster2自然请求源，留给B。

当前通过的独立证据：

- 原库4832态；实际`updateHeroPartyMovement`消费旧257B的7248英雄态及261的47112英雄态，总计54360态，逐x/y/vx/vy对账，expected不改。
- 18场257B native日志按原观察时间戳重放真实owner：1518 world、1884 EXIT和1234 Tween callback样本通过。这是冻结输入重放，不冒充现代浏览器产生相同AIR时钟或原事件注册。
- Monster3接收端统一feet→root；352200个原几何样本通过五实际角色/P1/P2接收路径。既有接收测试仅校正fixture脚点输入，不改原hit expected。
- 八个隔离编译生产变异被行为断言拒绝：立即捕获起点、忽略覆盖、暂停继续、退出漏清理、死亡误kill、英雄重复移动、movement脚点冒充root、Monster3脚点冒充root。另三种真实Scene编译变异（请求后移、Tween后写、完整英雄重复更新）由独立生产调用顺序断言拒绝。
- 正式Stage1-2的20/24/30fps×P1/P2/both九组通过受控请求、实际坐标数值与暂停恢复；记录真实Registry、HeroParty、英雄投射物、宠物聚合owner各一次。30fps双owner进一步经真实失败按钮完成重试、返回HeavenMap与页面重载，退出旧控制器/旧坐标保持冻结。浏览器使用隔离存档、受控输入和手动Game.step；不是自然Monster2攻击旅程，也不外推宠物各家族完整自然AI。
- 最新核心及上述专项20组通过，退休108+12用例保留；native重放发现destroy残留速度后，已修复既有owner销毁清零。结构超16系统依赖由独立GatherBridge消除，现8warning/0error；剩余15系统依赖warning属于现存聚合桥，本次不扩大重构。

复验：`node tools/prepare-hero-motion.mjs --check`；`node tools/run-system-tests.mjs --core hero-gather-coordinate-tests hero-gather-world-tests hero-gather-native-replay-tests hero-root-reception-tests monster-party-retirement-tests`；`node tools/hero-gather-production-mutations.mjs`。浏览器入口`node tools/run-hero-gather-browser.mjs`，`HG_FPS=20/24/30`、`HG_SLOTS=p1/p2/both`，`HG_LIFECYCLE=0`仅跳过已单独执行的退出旅程；`HG_VARIANT`选择三种场景反证。原始输入及报告在本地`docs/tasks/evidence/TASK-SLICE-260A/`，完整检查日志`.tmp/task260a-*.log`。浏览器最终报告以`*-baseline.json`和`*-<variant>.json`为准；早期`status:observed`文件不是验收结果。

失败与修正：早期probe错误使用request签名、空party关联、非实际Registry hook、暂停后的active查询和丢retryData的restart，均修正而未计通过。新数值断言发现真实恢复时钟倒退，改为世界步内统一恢复；控制器冻结日志重放不受此Scene修复影响。失败返回初次缺隔离存档而走SaveSlot，补正确存档输入后走真实HeavenMap；headless初载/重载曾停在Boot loader（无异常），验收显式泵送Boot Game.step后通过。原expected、原SWF和视觉许可均未改变。

下文为输入阻塞时期的历史诊断，保留失败原因；“尚未接Scene”等描述只指当时状态。

工程收尾：最终`pet P1GS=0`、build（504模块，既有大chunk警告）、核心/坐标20组、五关/结果8组、关卡架构通过；structure为0error/8warning。harness首轮因归档后的旧推荐链接失败，更新为260B后通过。workflow曾因Windows换行及归档内“执行记录”被识别为全局截断标记失败，保存LF并改为260A过程记录后通过（23未完成/359完成，既有PlayerSlot别名warning保留）；未修改校验规则。workflow/audit/diff最终日志为`.tmp/task260a-close-*.log`；PG004/006/012/013/017/019只计本批有限样本。260A完整合同归档于task-history，260B唯一Ready，父260完整联合责任不减。

## 历史：孤立控制器阶段

新增`src/systems/HeroGatherCoordinateSystem.ts`，仅持有既有movement对象引用，实现一秒原ease、twip写入、lazy起点、AUTO覆盖、暂停时间平移及退出清空。尚未从正式Scene引用，不改变现有游戏行为。不得把孤立控制器存在称为正式聚拢复现。

`tools/hero-gather-coordinate-tests.ts`把原257B `controlled.json`全部4832条x/y直接对账生产控制器，使用真实HeroParty movement对象。输入的移动/脱离仍是该原库fixture明确的服务边界，不是共享物理或实际Scene完成证据。4832条通过；原expected未改。

## 实际owner反例

`tools/hero-gather-owner-preflight.ts`调用实际`updateHeroPartyMovement`，在受控平地、Role1、P1/P2、三fps下与257B move tick0比较。诊断输出为`confirmed-production-input-gap`，退出0表示成功复现差异，不是验收通过。

| fps | 原受控每步位移绝对值 | 实际现代每步 | P1位置：原→现代 | P2位置：原→现代 |
| --- | ---: | ---: | --- | --- |
| 20 | 5 | 18 | 105→118 | 695→682 |
| 24 | 5 | 15 | 105→115 | 695→685 |
| 30 | 5 | 12 | 105→112 | 695→688 |

本地机器观察：`docs/tasks/evidence/TASK-SLICE-260A/owner-preflight.json`。这6组只证明显式受控水平移动不能直接映射，**不把5px fixture宣称为全部正式角色速度**。`movement-index.md`和原Role构造另有角色差异，需要261核定有效参数。

静态事实：`HeroMovementSystem.ts:94..103`采用秒制360/600与5400，先加重力再积分；原257B/`BaseHero.move:1941`在每host步先移动再加graity；现代platform脚点落地与原`BaseObject.nearToWall:532`的colipse半高/0.1间隙也不能直接互换。Luna独立核对得到同一差异。尚未执行完整真实物理/原阶段显示证明，不能把坐标差异计为用户允许的抗锯齿或像素例外。

## 后续与验收剩余

命中260A“现有movement/静态墙/屏幕写入不能映射”前置条款。261仅补聚拢所需的实际角色运动参数、原root/现代脚点、有限平墙/屏幕竞争输入；A仍承担5436世界态/7248英雄态、18自然场不变量、生产变异、正式Stage1-2双owner、生命周期/重试以及P1GS/核心/build。A完成再激活B，B保留父260全部M2-01..09、96显示态/176对象、392768碰撞、258接收和自然联合旅程。

不采纳“fixture里替换一个运动循环，再把结果称为真实HeroParty已复现”的捷径；也不直接把现代全局速度常量改成5，因为量纲、角色构造和全部真实消费者尚未核定。Tween候选和测试保留供恢复消费，没有公开自然发起入口，未改变原版资料或正式资源。

复验入口：`node tools/run-system-tests.mjs hero-gather-coordinate-tests`；诊断用esbuild打包`tools/hero-gather-owner-preflight.ts`为Node ESM后运行。全量原始输入仍为257B本地证据，不宣称克隆仓库即可源级复验；游戏运行不依赖该证据。

本批检查记录在`.tmp/task260a-*.log`；未完成正式接入不运行浏览器或宣称pet gate通过。既有259和工作流改动保持原状。新控制器尚未生产消费，测试不计入M-011/M-012或VS-067关闭证据。

实际检查：核心加坐标专项16组通过、build通过（既有大chunk警告）、structure通过（9项既有warning）、audit和diff通过。workflow首轮发现Blocked缺必填原因与表格“阻塞”说明，已补齐后重验；既有PlayerSlot别名warning保留。诊断首次草稿引用不存在的输入工厂，在打包前改为显式PlayerInputState；没有隐藏运行失败或声称已完成未执行的正式矩阵。

261交接：原Role1..4普通6/10、Role5默认7/11每host步；源root=现代feet-50，原root量化后投影。35334世界态/47112英雄态、936轨迹、108自然场（两次）及7源变异已验证；原257B受控5px不能替代这些正式输入。260A继续实际owner接线，Monster3目标root与普通Stage1既有扣50边界须一起核对。本项源输入完成不是现代验收通过。

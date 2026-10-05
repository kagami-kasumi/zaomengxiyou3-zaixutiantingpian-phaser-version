# Monster2 正式运行接入验收

TASK-SLICE-260B，2026-10-05，状态：已完成，父260一并归档，TASK-SETTINGS-262接续。260A坐标输入见 `monster2-coordinate-runtime-acceptance.md`；本文件仅核销Monster2有限合同，不关闭204/all、194、VS-067或Active功能线。

## 生产责任与原版合同

正式Monster2实际消费者只有Stage1-2布局`__id63_`；Stage13/21/22和TestScene当前spawn输入没有type2。复用view不代表另有Monster2 owner。`Stage1CombatEnemy`继续持有HP、坐标和目标，Registry负责移除，Stage12Flow负责门，HeroParty及Pet Session负责真实接收。没有新增第二份HP/坐标/关卡owner。

| 原合同 | 生产消费 | 独立核对与边界 |
| --- | --- | --- |
| M2-01 身体先效果 | Monster2WorldStep调用既有PetTargetEffects宿主时钟：旧弹→身体→效果→选择→同步 | 648 fixture/45360态逐字段对账；受控火伤服务与真实效果样本分开，不用expected驱动输入 |
| M2-02 两独立普攻 | Monster2AttackRuntime在身体第5/20步创建独立hit1对象，29物理、interval999、max99，各自ID | 原3456相位/246检测入口；第6/21首次、第19/40末次，空显示帧仍检测 |
| M2-03 世界与末帧 | 登记弹体由world年龄推进，显示ENTER投影独立；末检测后释放source/parent | 身体全字段、phase及生产变异；原受控goto的首次frame2与原生首次frame1保持各自fixture边界 |
| M2-04 死亡/中断 | 受伤/HP零保留已发弹；dead第17步完成或显式destroy清弹；hurt-cut在本步检测后执行 | hurt/冰冻/火伤/前后destroy、低层暂停全字段；实际combat owner另验第二弹未满20步即随dead完成释放。奖励/UI/淡出不属于原合同关闭范围 |
| M2-05 聚拢 | hit2第7步仅创建raw与HeroPartyGatherControl请求；非伤害弹 | 96原玩家列表、实时P1/P2，dead/absent排除、ready本身不排除；实际坐标终点，宠物不参与 |
| M2-06 裸MC | Monster2RawDisplayBridge消费既有PetWorldDisplayBridge，独立14帧EXIT移除 | 28实际raw逐态与幂等退出；源死/源destroy不提前结束，不持BaseBullet/sourceRole |
| M2-07 暂停/退出 | Scene暂停冻结登记弹/英雄/gather；裸MC继续；shutdown释放所有旧引用 | 九组正式自然旅程与立即重启当前活弹/当前raw、失败重试/返回/重载；260A坐标退出与顺序证据复用 |
| M2-08 自然选择 | MonsterAttackSelection共享策略，M2初始1×fps/重置5×fps、技能严格500、普攻水平250 | 1764例/27936选择态、108连续fixture/21312态；Monster3原2/4×fps及200/150保持回归 |
| M2-09 门与清理 | Registry实际移除时调用removeStage12Monster2，boss且无HP>0的Monster4才开门 | 六原门例含已死仍登记Monster4；既有流程/结果/奖励回归，不把HP零当移除 |

Stage1CombatSystem的type2撤销旧activeAttack伤害与交替技能路径。正式view只读取新body/attack状态。Monster2/3共享当前HeroParty接收适配器，分别提供原生几何；当前party无GXP producer，不虚构正式能力。

## 空间、资源与显示

`tools/monster2-space/export_runtime.py`从257A verified reference、原生oracle及源哈希派生72碰撞字段/400相位字段和96原生crop。正式文件为`src/assets/monster2-collision.json`、`monster2-native-display.json`与`public/assets/monsters/family-2-4-7-8/monster2-native/`；运行不依赖ignored evidence，派生/源级复验仍需本地语料。原始SWF与旧提取未修改。

- 392768碰撞案例、34556398像素：Boolean差异0；234批准单像素残差严格匹配原元组及native/candidate hash，没有扩大许可。
- 96原状态/176对象由257A清单约束；正式68登记态与28raw态通过真实Phaser Image/RenderTexture采集，独立原stage基准严格逐态对比：96/96通过、像素差0、属性差0。见`docs/tasks/evidence/TASK-SLICE-260B/browser/registered-visuals-verification.json`。
- 采集直接读取实际WebGL预乘framebuffer，原native PNG仅转换到相同预乘表示；不使用生产manifest生成expected。crop已包含双方向，Image.flipX均false；原空alpha帧可隐藏Image但仍保留碰撞。根(470,295)、origin0、scale1、裁切偏移、透明区域和源hash逐项检查。结论限已采样域，不宣称任意位置/后端完全一致。

初次导出使用局部bounds，独立碰撞矩阵拒绝后改为原world bounds减注册根。初次PNG snapshot把预乘字节写入straight ImageData导致采集损失，改为readPixels；没有修改原expected、生产颜色或扩大容差。这些失败是适配修正，不计生产变异。

## 接收与实际owner

`tools/monster2-reception-contract-tests.ts`严格对账258全部8480直接案例、162序列/6804世界态，所有预期列通过；日志`.tmp/task260b-reception-full.log`及`.tmp/task260b-final-related.log`。

直接Probe原来调用receiver而非BaseBullet.checkAttack，现代测试因此调用实际Hero/Pet HP结算入口，保留明确的geometry/protection/GXP/Rabbit疾风等受控参数。序列Probe只推进接收与protectionStep，现代不额外推进整只宠物AI；真实bullet接收计数/ID/RNG由生产入口执行，实际死亡回调同步退休。该层不冒充完整Session或像素场景，另由259的108+12真实退休样本、Monster2当前party适配测试和正式浏览器补足。

原hp-above序列揭示真实缺口：英雄致死需先清旧命中ID，再登记致死攻击。HeroCombatSystem两实际致死入口在原数组上清空，保留同次接收持有的引用；完整258与原退休、环境伤害回归通过。测试初稿的15160/13764差异来自输入/服务边界错误，未将其整体归罪生产，也未改原真值。

## 坐标与正式旅程

260A既有同一movement坐标、lazy起点、一秒ease/twip、重叠覆盖、物理/墙/镜头写入竞争、死后继续、暂停/退出合同沿用已完成输入：原Tween4832态、原共享链5436世界态/7248英雄态以及261真实运动输入。八个隔离生产变异与三种实际Scene顺序变异已经拒绝，260B只接自然producer，不重建公共控制器。

20/24/30fps × P1/P2/both九组实际Stage12旅程全部退出0，报告`browser/monster2-*-baseline.json`、日志`.tmp/task260b-lifecycle-*.log`。从受控首领停点、固定random=0.2和HP10000开始，自然AI产生两普攻与聚拢，实际英雄HP下降且记录自然攻击ID；不是完整关卡穿行。暂停20步中英雄/登记弹冻结、raw结束，恢复正常。活弹/活raw立即重启、失败按钮重试、返回地图和页面重载验证旧攻击source/parent、raw Image、Pet party与坐标controller释放及旧引用不再写入。

## 反证与工程收尾

`tools/monster2-production-mutations.mjs`八个正控suite通过、15个隔离编译变异由行为断言拒绝，包括身体顺序、漏第二弹、出生相位、空帧提前结束、聚拢纵坐标、raw末帧不移除、选择CD、hit2错误伤害对象、碰撞恒真、hurt-cut忽略、旧命中ID保留、两门条件、dead等待弹体及旧owner继续接收。结果在`docs/tasks/evidence/TASK-SLICE-260B/mutations/report.json`。另两种真实浏览器生产变异（raw暂停冻结、Registry退出漏清）被对应AssertionError拒绝；显示x偏移1px、方向反转两种实际编译变异分别产生143886/244040不同像素，独立verifier退出1。各变异单独输出，未覆盖正常视觉基准；数据损坏和运行异常不计生产反证。

最新核心+接收/body/world/roster/Monster3 party/退休共21组回归通过，`.tmp/task260b-final-related.log`。最终P1GS 79组与build（518模块、既有大chunk warning）均退出0，临时变异恢复，日志`.tmp/task260b-close-P1GS.log`、`task260b-close-build.log`；共享Monster3原16960直接案例/64序列、70英雄adapter与576真实Pet Session另补验退出0，报告在260B/monster3-receivers，原249A生成报告按备份hash恢复；structure 0 errors/8既有warnings、类型检查通过。audit、收尾workflow（22项测试）和git diff --check均退出0，日志.tmp/task260b-close-audit.log、.tmp/task260b-close-workflow.log。HeroPartyRuntimeBridge的15个system依赖warning来自既有桥的窄接线，新增职责已分离到独立适配器，不在本项重构整个桥。

复验入口：

```text
python tools/monster2-space/export_runtime.py --check
node tools/run-system-tests.mjs monster2-collision-tests monster2-selection-tests monster2-world-selection-tests monster2-attack-phase-tests monster2-body-contract-tests monster2-combat-world-tests monster2-gather-roster-tests monster2-reception-contract-tests monster2-party-reception-tests
node tools/monster2-production-mutations.mjs
node tools/run-monster2-browser.mjs
python tools/monster2-space/verify_runtime_visual.py
npm run check:system-design -- pet P1GS
```

浏览器环境参数：HG_FPS=20/24/30，HG_SLOTS=p1/p2/both，HG_LIFECYCLE=1。宠物增量使用HG_PETS=1、HG_LIFECYCLE=0、HG_REPORT_TAG=natural-pets-only并清除HG_VISUAL_ONLY；只在开场令非Monster2现有敌人死亡，使真实宠物能攻击并承受Monster2自然攻击，不强制宠物接收或写入命中ID。宠物可自然打断聚气，因此该增量不强求聚气/暂停；原九组双Boss基线仍完整要求两弹、聚气、暂停与全部退出旅程。24fps双人初次被聚气断言拒绝后修正测试职责，不修改生产或原真值。HG_VISUAL_ONLY=1仅采集96态，必须另执行独立verifier才算显示通过。大批输入、原报告与采集只在本地保留；Git交付的是运行必需资源、测试及精简合同。

真实宠物增量已覆盖三帧率及P1/P2/both：八组单Monster2场景与30fps双人双Boss场景均退出0。每个实际Session具有自然Monster2攻击ID，并在同次Monster2接收中HP下降；双Boss组两宠物均记录10000→9977、9891→9868，不把其他怪物伤害计入Monster2证明。报告为`browser/monster2-*-baseline-natural-pets-only.json`（不含失败的30/both）及`monster2-30-p1-p2-baseline-natural-pets-dual-boss.json`；后者设置HG_KEEP_OTHER_MONSTERS=1。30/both单Monster2失败（HP10000、空ID）仍保留，未篡改断言；24/both早先gather失败的同名日志被重跑覆盖，仅保留叙述，不声称原始失败报告完整留存，见`browser/fixture-corrections.md`。本增量不重复原九组退出矩阵。临时Edge profiles属可再生采集输出；批量删除被自动审批策略以blocked by policy拒绝，故仍保留，不影响原输入/报告。

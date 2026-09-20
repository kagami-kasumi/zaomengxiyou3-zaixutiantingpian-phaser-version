# 玄龟生产资源消费（224A1）

## 224A2 战斗接线与复验

`PetTurtleCombatBridge` 为原公共 P1/P2 Runtime 注入同一默认 Registry 的资源提供器。等待既有 bundle 就绪后，四形态由 `TurtlePetBehavior` 接管；场景只提交 roster/目标/环境并投影 snapshot。TestScene 同样绕开旧玄龟技能/本体旁路。共享 EntitySession 独占目标、CD、动画、HP、保护计数和 host tick；Behavior 的私有弹体句柄仅在该 host tick 内推进。

本批13责任：entry.forms、ai.priority/range/owner/target/follow、normal.1..4、sld.gates/release/effect。SLD按源根偏移创建、创建即自疗，真实位场碰撞经过既有怪物伤害/去重端口；受伤不删除已存在的SLD。选择顺序保留SLD→TXLJ→SYBH→奥义，未来分支显式deferred，不扣MP、不重置CD、不假成功或落入普攻。链接治疗/TXLJ交A3，SYBH/奥义及完整联合验收交B/C。

源级复验：

- `python tools/turtle-runtime/measure-caller-order.py`：复用本机AIR与222A wrapper，按原BasePet弹体先于本体的顺序补测16场景332碰撞入口；不改旧提取、SWF或222A/B原档。只证明受控源方法调度，不称完整原版AI运行。
- `pet-turtle-combat-clock-tests`：原生body倒计时与原AS3回调，四形态六动作、双方向；`pet-turtle-caller-order-tests`：332条原生阶段/位置/矩阵/寿命，区分body方向与父根矩阵。
- `pet-turtle-world-collision-tests`：15,768原生调用案例经生产世界坐标适配，碰撞布尔与像素摘要核对。世界边界按Flash twip量化；不把视觉整数对齐用于碰撞。
- `pet-turtle-runtime-tests`：真实Runtime/怪物HP四形态×P1/P2，独立221源预期和源哈希，范围/技能门槛、ordered-first/失效、owner、跟随/瞬移、真实命中/miss/去重、自疗、hurt持续、保护窗口与销毁。
- `node tools/turtle-runtime/run-combat-browser.mjs`：940×590正式Stage12/TestScene全部四形态、双人、重启/退出/替换；读取真实生产纹理，与222A原生PNG在同一Phaser后端逐图层比较。参考仅用于测试，游戏不读取截图。全体静态动作/cell/双方向/P1/P2由组合的P1TA0逐态覆盖；本脚本记录实际实战采样，二者不能互相替代。
- `node tools/turtle-runtime/combat-mutations.mjs`：范围、命中列、mask、owner、源偏移等生产变异须被独立断言拒绝；变异子进程不得写正常trace。
- `npm run check:system-design -- pet P1TA1`：组合P1TA0、上述有界语义/实战对照及猴/马/青龙回归；仍不等于P1TA、P1T或pet all。

现代视觉例外：依据用户长期授权，生产视图对宠物/弹体根和camera分别作最近整数对齐（各轴各不超过0.5px，合成屏幕误差上界1px）；只影响光栅位置，保留原图层/注册点/递归相位，游戏坐标和碰撞不改。此项不宣称分数坐标Flash采样完全等价。原225批准28态308像素和222B的20例70碰撞像素边界不扩大。实战比较以明确量化后的同态位置进行，逐状态差异报告保留root/viewport。

旧222B受控fixture在body之后推进bullet，出生帧包含一次检查；本批生产按原BasePet先bullet后body，出生后下一tick首次检查，相位0起，普攻10/12次、SLD30次。几何继续消费同一位场；调用者顺序采用本批独立native-caller-order输入，不能把旧fixture的创建时序直接搬入生产。

本地报告：`docs/tasks/evidence/TASK-SLICE-224A2/`。正式运行仍只依赖版本化src/public；复验需本地原生语料。Hover/pressed不适用于战斗对象。

## 224A1 资源合同

生产入口：`ensureSceneAssetBundle(scene, 'pet-turtle')`。650文件由既有AssetBundleCoordinator独占管理，必须await解码完成；同步preload入口拒绝此包以免create时读取未就绪数据。A1阶段没有注册占位turtle；224A2已通过上节公共Registry接入正式选择路径。

`requireTurtleAssets(scene)`查询同一Phaser CacheManager的只读资源；重复ensure共用已解码数据，失败/退出未完成事务清理binary缓存并允许重试，已加载资源跟随Phaser全局cache寿命。`PetTurtleAssets`保留六包、源显示树/原始trace/完整合同；body/bodyAnimation/effect/state API不持有或推进游戏时间。碰撞`fieldAt(symbol,nativeTick,scale,sign)`消费fixture.phaseMap，不能传出生后host tick而忽略源startup相位；普攻/SLD调用者相位由224A2复验，其余效果仍由B验证。

`PetTurtleCollisionAssets.sample`实现222B有限采样合同；不选择目标，不结算伤害。plane明确拒绝缺相位；tiles128只有完整16相位tile可被查询，记录区域外稀疏tile为空。target完整400相位受控；该有限空间采样不是任意Flash变换的通用模拟器。

`createPetTurtlePresentationBridge`只消费显式stateId和owner新世界位置；没有AI或动画时钟。`turtleDrawParts`按源深度/paintParts顺序合成，components仅保留独立对象查询证据，不额外绘制。每个owner使用新位置减源注册点的整数位移，不重复应用烘焙方向/alpha/scale/filter；当前光栅平移接口显式拒绝分数像素，后续若需要分数像素必须单独证明采样行为。任意父子树和原生root frame并不等于runtime状态选取，普攻/SLD的生产状态选择见上节，其余由后续行为任务承担。

PNG直接以RGBA8/非交错profile解码，避免Canvas读取PNG造成预乘/反预乘量化；production integer compositor使用manifest声明的有限整数公式。Phaser显示层仍会将最终RGBA投到浏览器画布，全部状态另做940×590真实画布逐像素对照。不是整fixture截图资源，也没有替换原版视觉。

presenter的第三个参数是已量化的视口左上角；它从owner世界坐标减去视口坐标后投到固定屏幕层（scrollFactor=0）。不持有或推进camera；场景传入自己的同帧视口快照，不能把超出初始940×590的世界坐标直接裁掉。位移/viewport联合平移不改变原像素的性质已有确定性测试。

HTTP服务器可以原样发送gzip，也可以以Content-Encoding解码后返回JSON。`generate-decoded-hashes.py`生成仅6条解压内容摘要，既绑定原压缩摘要，又核对HTTP解压路径；`--check`拒绝漂移，原223资源不变。

独立验收：

- `python tools/turtle-runtime/prepare_oracle.py`只读取原生PNG/档案及精确批准例外，生成新的native RGBA/bit digest；不调用现代投影或223 Python renderer。例外先核对原RGBA/bit才应用批准candidate，不能放宽成整态/整case许可。
- `node tools/run-system-tests.mjs pet-turtle-resource-tests`执行生产解码、11,572态合成、702原生时钟步、61,424相位和157,704碰撞case；测试独立expected/actual并检查不同owner移动及负例。
- `node tools/turtle-runtime/mutations.mjs`编译真实生产源变异，以冻结原生expected拒绝注册点、scale、owner、重复绘制、depth、alpha、时钟、bit序及源相位错误。原src不修改。
- `node tools/turtle-runtime/run-browser.mjs`在已运行的4174 preview中通过真实Phaser bundle加载，验证scene退出、损坏内容重试、并发/重复进入和全部11,572态production presenter；每态等待真实POST_RENDER后读取Phaser画布，与独立原生PNG在相同背景的像素比较。仅按原批准元组修改28态的参考像素；原生/批准摘要分别保留。采用正式Phaser.AUTO配置并记录实际renderer，保留三组940×590浏览器/原生代表截图。原PNG仅复制到忽略的测试目录`dist/__turtle_probe/native`，不是游戏资源。
- `npm run check:system-design -- pet P1TA0`组合上述源oracle重新生成、生产/加载回归、实现变异与浏览器。运行前先build并开启preview。此gate只验收资源消费，不代表P1TA/P1T或任何行为合同已完成。
- `node tools/turtle-runtime/run-browser.mjs --lifecycle-only`单独复验真实scene停止/重启两次与SHUTDOWN资源释放，输出browser-lifecycle.json；它不能替代默认全量浏览器测试或P1TA0。停止请求发出后必须等待SHUTDOWN，不能把排队期间误判为泄漏。

显示对照中，独立原生PNG与生产投影交替通过同一Phaser后端；WebGL与Canvas2D背景合成存在一色阶舍入差，不能将不同后端混作同态零差异依据。原始RGBA另由独立摘要严格核对，只有原28态308像素许可；`browser-display-states.json`保留11,572项最终画布双方摘要。参考纹理仅存在于验收scene。

运行仅依赖src/public；原生验收需要本地语料和docs/tasks/evidence前置输入。新报告在本地`docs/tasks/evidence/TASK-SLICE-224A1`，可再生浏览器图在`.tmp/verification-images/TASK-SLICE-224A1`，不提交Git。

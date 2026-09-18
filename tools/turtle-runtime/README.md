# 玄龟生产资源消费（224A1）

生产入口：`ensureSceneAssetBundle(scene, 'pet-turtle')`。650文件由既有AssetBundleCoordinator独占管理，必须await解码完成；同步preload入口拒绝此包以免create时读取未就绪数据。224A2才将该依赖接入正式玄龟Behavior选择路径，本批没有注册可战斗的占位turtle。

`requireTurtleAssets(scene)`查询同一Phaser CacheManager的只读资源；重复ensure共用已解码数据，失败/退出未完成事务清理binary缓存并允许重试，已加载资源跟随Phaser全局cache寿命。`PetTurtleAssets`保留六包、源显示树/原始trace/完整合同；body/bodyAnimation/effect/state API不持有或推进游戏时间。碰撞`fieldAt(symbol,nativeTick,scale,sign)`消费fixture.phaseMap，不能传出生后host tick而忽略源startup相位；正确调用者相位仍由224A2/B验证。

`PetTurtleCollisionAssets.sample`实现222B有限采样合同；不选择目标，不结算伤害。plane明确拒绝缺相位；tiles128只有完整16相位tile可被查询，记录区域外稀疏tile为空。target完整400相位受控；该有限空间采样不是任意Flash变换的通用模拟器。

`createPetTurtlePresentationBridge`只消费显式stateId和owner新世界位置；没有AI或动画时钟。`turtleDrawParts`按源深度/paintParts顺序合成，components仅保留独立对象查询证据，不额外绘制。每个owner使用新位置减源注册点的整数位移，不重复应用烘焙方向/alpha/scale/filter；当前光栅平移接口显式拒绝分数像素，后续若需要分数像素必须单独证明采样行为。任意父子树和原生root frame并不等于runtime状态选取，这由后续行为任务承担。

PNG直接以RGBA8/非交错profile解码，避免Canvas读取PNG造成预乘/反预乘量化；production integer compositor使用manifest声明的有限整数公式。Phaser显示层仍会将最终RGBA投到浏览器画布，全部状态另做940×590真实画布逐像素对照。不是整fixture截图资源，也没有替换原版视觉。

presenter的第三个参数是已量化的视口左上角；它从owner世界坐标减去视口坐标后投到固定屏幕层（scrollFactor=0）。不持有或推进camera；后续场景应传入自己的同帧视口快照，不能把超出初始940×590的世界坐标直接裁掉。位移/viewport联合平移不改变原像素的性质已有确定性测试。

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

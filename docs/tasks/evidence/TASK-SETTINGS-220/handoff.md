# 220 奥义trigger碰撞输入交接

本项只闭合PetDragonBullet4的源空间/碰撞输入。四阶战斗、44项全族合同和P1G仍由214E实现与验收。

## 直接消费

- `docs/reverse-engineering/ground-truth/manifests/task-settings-220-dragon4-trigger-collision.json`：verified，48帧×左右=96状态、384个状态内显示对象及96张原版AIR 940×590基准。
- `collision-contract.json`：逐帧原版bounds、方向场引用、214A裁边/注册点映射、218目标引用、独立P1/P2根与生命周期字段。原版getBounds可能包含被遮罩裁掉的贴图部分，不等于实心命中区。
- `runtime-mask-pack.json`：30方向场、480个相位引用、197个去重平面。每场16个四分之一像素相位，`quarterPhasePlaneIds[y*4+x]`；span为row-major `[start,length]`。不要读取PNG首帧或用2700×1500导出画布直接命中。
- `source-fields/measurement.json`与`sampling-verification.json`：字段独立由原始源显示字节生成，不读取oracle用例/命中布尔/输出buffer。11,520个原版HitTest输入、78,373,320个buffer像素全部一致，7,620命中、3,900未命中。

采样合同是有限源输入验证，不声称任意AIR光栅位置均有数学等价保证。本批没有观察到需要许可的残差；没有复用219近似授权，也没有新增近似批准。以后出现差异应保留反证，不能自动扩大精度声明。

## 源事实与现代映射

| 问题 | 一手来源与独立核对 | 合同/反证 |
| --- | --- | --- |
| 依赖闭包 | 恢复pet1.swf的535..539五定义逐字节保留；另七个218目标定义原样保留；source-verification.json | 缺bitmap536、mask535或改变源字节不能通过 |
| 遮罩与帧 | 535为300×300 mask、clipDepth3；537引用1500×900带alpha位图536；538在15帧中移动5×3贴图窗口，539持续48帧 | 全48个native树独立证实15tile循环、144递归节点和48滤镜实例；不是把第一帧复制48次 |
| alpha/filter | 539放置538，alpha108/256与20项ColorMatrixFilter保留；源XML矩阵与native节点一致 | mask对象不单独绘制；manifest中537.maskId指向535，clipDepth仍留在contract显示树 |
| 命中 | 原版自带AIR 51.1.1.5、原始my.HitTest，96方向态×三目标×40冻结fixture | 相交/分离、四边、20分数位置、P1/P2独立根；首帧、翻转、根、crop、相位、实心矩形、末帧先毁共7变异被拒绝 |
| 发射/跟随 | PetDragon4.doHit5:685–742、BaseBullet.step2/checkAttack、FollowBaseObjectBullet.step2；源路径hash在contract | 剩余计数48即第1次enter生成，根偏移0，projectile action=hit4；先碰撞/回调/末帧释放，仍存活再跟随/翻转，hurt不截断 |
| 治疗 | doHit5不设置funcWhenHit，BaseBullet默认null且仅非null时调用 | trigger不自动获得sdcc/九雷对象的命中治疗；hit4伤害公式继续消费213，不能把两者混为一谈 |

消费者应先按原版bounds求目标交集，尺寸截断并拒绝不足1像素；使用本projectile根计算`qx=trunc(round((root.x-intersection.x)*20)/5)`，y同理。相位用规范化模4，整数偏移`origin-floor(q/4)`，然后统计交集中的源位。原版左向/sign+1对应现代facing=-1；右向/sign-1对应现代+1。初阶218和二三阶219仍各用自己的合同。

动作帧48以后立即释放，不能把15tile循环误当整个trigger无限循环。无空白帧，因此空白残留变异在本对象不适用；每个源帧均有命中正例，但通用消费者仍需拒绝零面积。214E还须验证跟随、伤害、owner和清理在正式Runtime中的实际消费。

## 复验

```text
python tools/dragon4-collision-source.py
python tools/run-dragon4-collision-probe.py
python tools/run-dragon4-fields.py
python tools/verify-dragon4-source.py
python tools/verify-dragon4-sampling.py
python tools/generate-dragon4-collision.py
python tools/verify-dragon4-contract.py --promote
```

原版输入未变时复用已经落盘的AIR报告，仅运行source/sampling/contract verifier。只有源、fixture或采样疑点改变才重跑两个AIR入口。generator只生成draft，独立verifier检查通过才能promote。

已验证：48帧/96状态/384对象、480相位编码、11,520命中正负、78,373,320像素、7采样变异及10产物变异；source-display-list、runtime-mask-pack、collision-contract和manifest重复生成后字节一致。213全44合同/345基准/15变异、214A 153资源/345投影/627host ticks、218的861原版例与219的6,448例/原批准104像素差异回归通过。结构、工作流与问题审计结果见本次收尾。

原版基准已查看第8帧左向：可见环状奥义效果与嵌套贴图，未更改原图。用户不要求额外严格坐标对齐，本项没有重新校准美术。

## 证据保留与归并

`air-original/buffers.zip`无损保存10,026张独立oracle输入PNG，原逐项hash仍在measurement.json；`buffer-storage.json`记录打包数量、大小和归档hash，采样verifier直接读取归档。验证归档每个PNG哈希一致后才删除其重复的散文件。`stage-baselines`为96张本对象源基准，`source-fields/*.deflate`是场编码的独立原生输入；保留到214E与全族关闭后按证据生命周期审计。中间SWF/XML/编译PNG在忽略的task-outputs，不改legacy-extraction，不将可再生现代诊断图长期入库。

Luna只读核对闭包、mask/tile/filter和bitmap536依赖，主agent完成原版实测及独立对账。采用其五定义/遮罩结论；其“第48帧创建”的措辞按源getCurFrameCount与213时钟修正为第1次enter，未据此改变真值。主agent初次范围试探漏bitmap536被XML依赖检查拦截，加入后才运行native验证；没有晋升不完整子集。

下一执行项：恢复214E，直接消费本合同，保持其44项/P1G、真实四阶分身与完整正式生命周期验收。220不计完整第三家族成功，不宣称公共pet设计退出。没有修改src、生产PNG或存档，没有commit/push。

收尾检查：structure退出0（9个既有warning）；workflow退出0（16 harness测试、26活跃定义/295历史定义、唯一Ready214E、1250 annotations、level architecture）；保留既有PlayerSlot命名warning。PG扫描7活跃项，PG-004/017本次有界样本通过，长期/存量条件不足不归档；集中记录在problem-audit.md。完整四阶实现尚未开始，未用这些检查代替P1G。

归档后复验：sampling verifier从buffers.zip读取全部输入，退出0；11,520例/78,373,320像素仍为零差异，七项采样变异全部检出。source-fields的deflate与原版日志按现有.gitignore保留本地；跨机器复验须携带这些原生输入，或在具备恢复源包与AIR环境时重跑上述两个AIR入口，不能用现代运行时重建原版基准。

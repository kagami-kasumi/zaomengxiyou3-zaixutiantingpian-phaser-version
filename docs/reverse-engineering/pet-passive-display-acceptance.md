# 六公共宠物增益显示消费验收

TASK-SLICE-245B及父245已完成（2026-10-02）；最终证据索引见本地acceptance.json。范围是sxkb/fsnl与smjc/mfjc/gjjc/fyjc，继承245父合同，不关闭204、194、pet all、VS-067或功能线。

## 原版输入与正式资源

244 verified视觉合同提供384 fixture、65,280原生态及独立舞台PNG；246 verified局部投影提供1,093树/226种栅格。输入出处、源SHA、采样域与不支持语义见[视觉合同](pet-passive-visual-contract.md)和[局部投影合同](pet-passive-local-projection-contract.md)。期望图由原SWF实例生成，没有用现代renderer重画expected。

`export_runtime.py`只把opaque原姿态导为181张透明PNG（1,139,195字节）、2720个姿态；淡出交给既有父root alpha。正式JSON保留完整递归树、characterId、帧、局部/世界矩阵、颜色、滤镜与shape定义，18,144个非淡出原状态逐项与246样本对账。原位图变换和滤镜已烘焙进原生栅格，不用Graphics读写回环替代，也不把恒等滤镜当无效。

资源由combat-common统一加载，运行只读取src/public。大manifest、基准、trace和截图只在本地；Git精确白名单沿用既有规则，新增运行文件无需读取忽略证据。生成/源级复验仍需要本地恢复SWF和原验证产物。

## 生产责任与源生命周期

| 原合同 | 生产消费 | 独立验证 |
| --- | --- | --- |
| 首次owner step才创建，早/晚刷新不重播 | PetPassiveSession与HeroPetBuffSystem发出瞬态显示端口；不增加第二数值owner | 244 cycle/refresh/late-refresh/readd及原1717数值 |
| 宠物100帧，嵌套6帧，数值hide与自然末帧可独立结束 | PetPassiveDisplayBridge挂既有PetAttachedDisplayLifecycle实际root | 全量native状态、parent检查与双后端像素 |
| 新插入下一原生tick仍为第1帧 | 原生首帧保持与重加均由elapsed→frame同一投影 | first-owner-step、tick1、readd125/126 |
| 主人20/25帧独立bullet；zero/short数值到期不能销毁画面 | 主人clip按slot保存，显示step先于数值step | zero/short/hurt/host-destroy/world-pause及数值误清反证 |
| BBDC方向与root方向分开 | 初次取-owner facing；只响应后续rootSign变化；正式hero根保持identity、身体单独翻面 | 两方向、两个owner、显式root翻转全fixture；不把body翻面当root翻面 |
| 暂停时宠物显示继续、主人显示冻结 | Game prestep推进附件，主人检查Scene暂停；poststep在渲染前投影 | 原生暂停3..40/恢复41状态与正式暂停层 |
| 宠物退休不清主人效果，身体立即删除、root附件一秒淡出 | 猴/马真实root；青龙/玄龟独立attachment anchor，不改变身体原坐标 | 正式休息/换宠、6组真实桥控制流、源alpha和退出清理 |
| 退出/重试无残留 | Scene销毁监听解绑、body/texture/root/clip各自幂等清理 | 有活跃主人clip和退休root的中途destroy、正式retry/back/reload、退出泄漏变异 |

Dragon1复用ObjectBaseSprite3→monkey1；Dragon2..4为ObjectBaseSprite4→monkey2。Turtle1/2/3..4分别复用monkey1/2/3；依据213/222 verified owner/colipse构造及222A实际profile，不能从body atlas大小猜测。补充正式Dragon1与Turtle3双owner旅程，不宣称其余未迁移家族完整通过。

## 像素结果与允许的现代例外

Canvas/WebGL各384组、65,280状态全部比较。Canvas最大premultiplied可见通道差2.266667/255，WebGL为2.301961/255；没有大于3的像素。非零残差累计分别1,199,674和37,013,690像素事件（包含逐帧重复，不是不同空间像素数），原始报告全部保留。差异来自后端颜色/alpha量化及原生烘焙后父alpha合成，按长期轻微抗锯齿/颜色舍入授权记录，**不宣称像素完全一致**，不外推碰撞、时序或伤害容差。

244已观察分数相位使用原生相位资源；未观察位置按≤0.5px/轴对齐到原生整数相位，不跨profile缩放。此项是用户长期轻微像素对齐授权范围内的明确现代例外。未知profile、帧、符号方向、旋转或垂直缩放不会静默猜测。PetPassiveImage在单图同步render内关闭Phaser先取整child局部坐标的重复处理，并在finally恢复camera；否则fractional父坐标会造成明显插值差异。

五正式关卡各有两owner六效果；活跃和休息120个实际特效层，加上五关首次/暂停80层、青龙/玄龟补充48层，共248个实际特效层独立贴回原生PNG，有限观察位置零RGB像素差。完整画面保留HUD截图；首次、暂停和结束分别保留状态与逐层验证，不用整页背景、零console或对象计数代替特效视觉。原场景怪物/身体/界面完整像素一致性不属于这次六效果声明。

## 失败、修复与反证

- 源新插入首帧保持曾被现代+1提前，按244原生记录修正。
- 正式roster事件先于combat快照时，新pet曾绑定旧runtimeKey；猴/马adapter等待petId/form/species与快照一致，保留identity唯一约束，不放宽为重复注册。
- 正式camera局部取整导致宠物层最多百余通道差，实际独立原PNG检查拒绝后修正；没有提高容差。
- 青龙独立身体在anchor直接dispose时曾遗漏，补显式body销毁；玄龟外部destroy事件曾递归调用Image.destroy，改为事件只释放texture。
- 测试旧闭包遗漏新端口、ground getter被重复查询、SVG测试服务MIME、reload文档未就绪、暂停恢复队列与background asset事务等待分别纠正；没有删除旧数值/家族/清理断言。原Image.decode等待改为fetch/createImageBitmap，保持Game时钟冻结。旧玄龟支架因扩展欢迎页抢前台暂停，恢复测试页后原门禁继续；补about:blank选择、bringToFront与禁后台节流，不降低断言。其后旧支架在10,200态后出现Image.decode解码异常；11,572参考文件均存在且PNG头完整，改用fetch/createImageBitmap并在绘制后显式close，保留逐态字节hash和像素比较，重跑完整gate；旧失败日志保留。
- 11项生产内存变异分别拒绝错误父级、原点、方向、提前、冻结、刷新重播、数值到期误清、休息误清主人、退出残留、重复局部取整、名单/快照错配。它们运行生产路径，不是修改expected使测试失败。

## 复验与边界

入口见[工具说明](../../tools/pet-passive-assets/README.md)。本地产物根为`docs/tasks/evidence/TASK-SLICE-245B/`：`render-full.json`、`asset-consumption.json`、`formal-browser.json`、`first-phase/`、两家族补充目录、11项mutation、`host-preflight.json`、设计gate/build日志和最终`acceptance.json`。

HeroPartyRuntimeBridge已有15个system导入warning，本批只加入Scene显示适配调用及单份环境转发；显示实现拆在三个小文件，不扩大其数值职责。猴/马/青龙/玄龟及1717原数值、指定pet P1GS/P1R/P1H/P1G/P1T、核心系统15组、五项设计gate共116组、build及工程门禁全部退出0，B与父245同次归档。此批不执行all，不核销原84其余怪物/人偶消费或剩余五家族。

245B门禁重跑环境记录：后续浏览器连接确认4174 preview已停止（connection refused），原参考PNG均存在；因此先前EncodingError不能归因于文件损坏或内存问题。恢复项目已授权preview，当前完整gate浏览器阶段重新导航；fetch响应检查保留以使后续HTTP错误有明确URL，未修改图片或比较阈值。

245B末轮联合门禁：浏览器11,572态及三张940×590原生画面对比已通过，随后同一Node进程在默认约4GB堆上限退出。此为tools/local-validation.md既有242B容量边界；前轮漏带环境设置。保留design-gates-default-heap-failure.log，按既有NODE_OPTIONS=--max-old-space-size=8192仅本次命令环境重跑原116组五gate，未改变测试集合或全局配置。

# Monster30攻击空间与命中合同（241 verified）

状态：verified（有限冻结域），241输入已闭合，240恢复实施。用户2026-09-27明确授权完成241后恢复240；两项验收分别保留。

## 已定位输入

- 原攻击：恢复 `assets/1.swf`，Monster30Bullet1 character21/10帧，子character20/10帧，13个源定义闭包。主agent按XML的Place/Move/Remove继承语义展开，10态树与原包AIR逐节点矩阵/帧/滤镜/child计数一致。character20是编号，不能误读为20帧。
- 原目标：5英雄/35宠物的newColipse经继承解析共4个profile。英雄ObjectBaseSprite有BaseHero构造scaleX=1.2；宠物使用ObjectBaseSprite3/4/无后缀。当前源扫描只有这一项colipse坐标/scale写入。可见身体动画不是碰撞轮廓。
- BaseHero.beMagicAttack使用HitTest；BasePet另先调用AUtils.testIntersects。Monster30不使用imgMc1。原方法与隐藏colipse在自建fixture中原样执行空间谓词；伤害算式/闪避/保护和正式Scene留给240。

## 六段证据链与未解项

| 段 | 当前证据 | 等级/边界 |
| --- | --- | --- |
| 对象局部 | Monster30.doHi1、真实character21/20闭包；40实际目标构造 | 确认事实，原文件只读 |
| 共享调用链 | BaseBullet构造/checkAttack/step2、BaseHero/BasePet谓词、原HitTest和AUtils方法；232原方法world片段 | 确认事实；时钟与空间两份fixture分开，不把HP服务sink算真实结算 |
| SWF空间 | 20左右帧原生基准、源XML显示树、4profile、20×20亚像素字段 | 空间采样已产生，原生基准与辅助字段不是同一来源层级；独立lookup精确残差清单已获用户批准，布尔零差异 |
| 可观察合同 | 首次检测第1帧，下一world tick；第10帧检测后销毁；暂停根/子同停 | 原方法+真实ENTER/EXIT交叉确认，20/24/30fps各normal/pause；不能冒充完整游戏菜单旅程 |
| 现代映射 | 240将替换两条owner的源activeAttack伤害依赖，直接消费独立攻击根和碰撞profile | 尚未实现；src/public未修改 |
| 双重验证 | 原生93920碰撞fixture、324时序观察/60原checkAttack调用、独立phase lookup | 两次原生生成一致，独立复验及8种实际查询变异通过 |

## 原生边界发现

原包AIR 51.1.1.5的getColorBoundsRect在BitmapData仅(0,0)一像素匹配时返回空矩形。64位置的独立8×8最小样本重现；四个第一版碰撞样本触发。不能把任意非空像素直接当作HitTest返回true。该边界属于本次原包AIR证据，不外推旧Flash Player。

14,720初始样本中，补目标字段与sole-origin语义后，quarter查询命中布尔全同，37例40像素不符。单独绘制目标/攻击与最终合成的诊断表明目标字段及合成无差异，40差异全来自攻击对象归一化绘制与intersection直接绘制。它们没有被删除或解释为子帧遗漏。

扩大二维网格后固定为93,920例：10帧×2方向×4目标profile×1174位置fixture。quarter辅助lookup的379例共382像素不符，已观察最终布尔0差异；重复原生生成与24位场字节一致。用户2026-09-27明确“批准该精确清单，继续验收与实现”：仅批准379例382像素清单，命中布尔必须零差异；不能把有限网格等价扩成任意坐标的像素完全一致。

## 工具与产物

- `python tools/monster30-collision/profiles.py`：构造/继承映射及写入扫描。
- `python tools/monster30-collision/capture.py`：固定fixture、原包AIR HitTest/AUtils、recursive trees、原生基准及相位字段。`--repeat`比较全部case与field字节。采样使用既有SDK编译器与原包runtime，不安装软件。
- `python tools/monster30-collision/source.py`：从恢复SWF重导XML、独立展开13定义并比较10原生显示树。
- `python tools/monster30-collision/phase.py`：复用232原方法提取器于独立241输出目录，以真实帧事件推进；不会改写232证据/源文件。HP/目标仍为232显式sink。
- `python tools/monster30-collision/verify.py`：诊断入口，不作验收。
- `python tools/monster30-collision/generate.py --verify`：正式单入口，重新解析源攻击与目标树，再运行accept.py严格门禁，成功才生成verified manifest与sidecar。
- `python tools/monster30-collision/accept.py`：冻结93920例/58411155像素与精确批准SHA，拒绝任何新增/改变的残差、任何布尔差异；校验源hash、重复生成、324相位观察/60原方法调用。
- 本地报告：`docs/tasks/evidence/TASK-SETTINGS-241/`；原生原始输出：`local-resources/regima/task-outputs/task-settings-241-monster30-attack-collision/`。

## 验收与消费边界

- 批准清单：`docs/tasks/evidence/TASK-SETTINGS-241/candidate-pixel-differences.json`，SHA256 `2daffdd281c6f57c3d87330e79a350ca14ba875d1ecbb16454de5372b6889468`；授权单为同目录`approved-pixel-differences.json`。两者保持原字节，不能重新生成后默许新差异。
- 8种可执行查询变异均有原生反例：错误翻转、x/y原点、目标scale、子时钟、透明像素当bounds、twip取代原生quarter舍入、sole-origin漏判。不是篡改报告字段。见同目录`verification.json`逐变异witness。
- 宠物broad-phase省略是等价变异：原AUtils要求bounds正相交，原HitTest内部也求相交且要求宽高至少1；70440宠物例验证pixel与最终hit一致。因此不能捏造省略粗筛会改变布尔的反例。240仍显式先粗筛再像素，不把此结论外推其他攻击副作用。
- 20攻击态/68显示对象的源XML树和24原生基准可追溯；4目标树从恢复StageCommon独立展开，覆盖40实际构造。原生colipse隐藏，诊断基准直接draw不代表游戏应显示碰撞壳。
- 空间采用同父世界注册根，攻击根为出生时Monster30.x/y；source scaleSign与运动facing的映射由240依BaseBullet.setDirect核定，禁止用屏幕矩形中心替换根。目标需用真实英雄/宠物世界colipse注册根，英雄scaleX=1.2仅一次。
- 运行必需字段由240从verified sidecar生成到正式src/资源目录；不得在生产读取本地evidence/native.json或原SWF。原始基准、全oracle、差异和诊断留本地，Git拉取承诺构建运行，不承诺无语料源级复验。
- 241不核销240双owner的真实HP、事件去重、死亡/销毁和正式Scene旅程；这些继续在240完成。232/218不改，其他11类型与原84剩余责任不关闭。



## 240 消费交接

241已批准的精确碰撞残差不变。240将位场发布至`src/assets/monster30-collision.json`，由实际英雄/宠物伤害owner消费；独立原生93920case与生产查询保持零布尔差异。现代实现、真实HP/暂停/清理及显示差异分开记录在[240验收](monster30-runtime-acceptance.md)，不反向扩大241有限采样声明。

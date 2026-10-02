# Monster3 两攻击空间与命中合同

`TASK-SETTINGS-248`，当前 **verified（有限冻结域）**；用户2026-10-02回复“允许”，仅批准428case/451像素精确清单。未修改 `src/`、`public/`、原提取或恢复 SWF；不关闭 Monster3 两 owner、204/all/194/VS-067 或整线。

## 有限结论与六段证据

| 段 | 已核对证据 | 等级与边界 |
| --- | --- | --- |
| 对象局部 | Monster3.doHi1/doHi2 的单参数 SpecialEffectBullet，character70/74 | 确认事实；出生偏移仍由247行为reference消费 |
| 共享调用 | SpecialEffectBullet构造转发→BaseBullet构造；BaseHero.beMagicAttack与BasePet.beMagicAttack；原HitTest/AUtils | 确认事实。单参数调用使imgMc1为空；英雄走pixel、宠物先broad再pixel，不取怪物自身colipse充当受击目标 |
| SWF空间 | 恢复assets/1.swf，5/10帧×双方向30态、190显示对象；XML Place/Move/Remove与原生树矩阵/alpha逐节点核对 | 交叉确认。Bullet1为5个依赖定义，Bullet2为4个；Bullet2内部逐帧旋转和alpha保留，不抹平成总bounds |
| 时序 | 引用247原生1620相位态与135次checkAttack，按三fps×两攻击×normal/lethal/pause绑定本次状态 | 交叉确认。首次第1帧、末帧检测后销毁；非受控goto提前第2帧输入，不宣称完整Scene实测 |
| 现代映射 | TestSceneBossArena/Monster3System与Stage13GameplayBridge/Stage1CombatSystem/Stage13MonsterVisualBridge | 尚未实施。两owner目前矩形/横向范围、activeAttack和显示帧选择都需后续消费 |
| 双重验证 | 原包AIR51.1.1.5原方法oracle、独立位场查询、源XML、编译源/显示子树变异、原生PNG检查与重复 | 有限域布尔一致；候选碰撞像素仅按本次精确批准清单接受，命中布尔零差异 |

原AS3根：`local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts/`。精确入口：`export/monster/Monster3.as:241/272`、`export/bullet/SpecialEffectBullet.as:9`、`base/BaseBullet.as:90/588`、`base/BaseHero.as:1208/1227`、`base/BasePet.as:566/585`、`my/HitTest.as:14/24/40/82`。源码SHA由247 reference和本次native/profiles记录核对。

## 目标、坐标与独立预期

复用241的40实际构造（5英雄、35宠物），4个profile：hero-ObjectBaseSprite、pet-ObjectBaseSprite3、pet-ObjectBaseSprite4、pet-ObjectBaseSprite。逐个核对构造/继承与公共源SHA、StageCommon SHA，重新实例化的原生target tree与241完全相同；英雄colipse横向1.2仅一次。Monster3自己的colipse不构成目标profile适用性的理由。子代理清单已归并，主agent补核实单参数构造排除imgMc1。

两个攻击在与目标同父的世界注册根采样；源setDirect符号通过wrapper的±1矩阵进入，不移动到图片中心。原生默认基准940×590，采样注册根(470,295)，两处P1/P2小数平移输入另列fixture；所有基准有效alpha未触及舞台边界。局部位场保留完整bounds加边界，真实HitTest每case使用其独立intersection ROI，不以可见身体或bounds替代像素。

固定域为每攻击帧×双向×4profile×1174位置（中心、不相交、四边缘、二维网格、小数、双owner平移）。原HitTest实际返回值是expected；现代候选只消费独立20×20相位位场。原AIR getColorBoundsRect的sole-(0,0)行为保留，不把任意非空pixel直接视为true。源可达分数样本包含0.05/0.25/0.5/0.95，不宣称任意坐标等价。

## 精确批准残差

| 攻击 | 原生case | 比較像素 | 候选命中布尔差异 | 碰撞像素差异case/像素 |
| --- | ---: | ---: | ---: | ---: |
| Monster3Bullet1 | 46960 | 14485422 | 0 | 10 / 10 |
| Monster3Bullet2 | 93920 | 28421345 | 0 | 418 / 441 |
| 合计 | 140880 | 42906767 | 0 | 428 / 451 |

残差定位实验对每个差异ROI分别绘制原目标与原攻击：目标差异0、单独攻击差异451、二者合成差异0，故差异来自归一化位场与原HitTest直接ROI绘制的栅格化位置差异，不是目标构造或混合算法。这里只定位来源，不把451个碰撞像素纳入长期视觉例外。

精确元组在本地 `docs/tasks/evidence/TASK-SETTINGS-248/attack1/candidate-pixel-differences.json` 与 `attack2/candidate-pixel-differences.json`；各自SHA保存在同目录verification及机器sidecar。保留每项case、frame/sign/profile、原/目标根、intersection和逐像素原/候选bool。没有删除失败case或增加命中容差；241批准清单不适用于本项。

## 产物与复验

- `tools/monster3-collision/capture.py --attack 1|2 [--repeat]`：现有SDK编译、自带AIR运行、原HitTest/AUtils、原生树/PNG/位场与完整case；不安装软件。重复比较case、显示树、PNG及位场字节。
- `source.py --attack 1|2`：只读恢复SWF重新导XML，独立展开依赖/时间轴并核对原生树。明确拒绝未覆盖的mask、blend及非alpha颜色变换。
- `verify.py --attack 1|2`：诊断twip/quarter候选，不晋升。
- `accept.py --attack 1|2`：原生buffer/构造SHA/候选命中/精确残差及9种查询变异。省略child的查询反例与实际子树变异分开。
- `mutations.py`：两攻击各执行真实编译HitTest谓词变异和原实例remove-child；总4组均改变命中并拒绝，不用JSON损坏冒充源变异。
- `generate.py`：生成draft manifest/sidecar、重新核对247实际相位并绑定135检测，5类Schema反例拒绝；`--verify`还重跑source/accept并要求用户批准文件的精确SHA，否则拒绝晋升。
- 机器真值：`ground-truth/manifests/monster3-attack-collision.json`，truthId=`task-settings-248.monster3-attack-collision`；`/displayObjects`、`/states`、`/completeness`。
- 机器消费索引：`reference/monster3-attack-collision-contract.json`，`/attacks`、`/profiles`、`/targets`、`/phase`、`/unresolved`。完整本地证据仍需语料/AIR/FFDec；未来运行字段必须生成到正式源码/资源，不依赖ignored evidence。

## 后续合同

248已完成并归档，下一唯一Ready为`TASK-SLICE-249`。同线有界实现：同时覆盖TestScene Boss与Stage1-3普通Monster3的独立攻击、实际英雄/宠物HP、出生下一步首帧、hit2间隔4、死亡保留/destroy清理、暂停和真实显示；完整保留247 M3-01..08及226公共剩余责任，不暗中执行下一项。

## 最终验收与授权

用户明确批准后，`generate.py --verify`重新核对源XML、目标构造SHA、全部140880例、精确残差SHA及247相位，再晋升verified；重复生成manifest/sidecar字节一致。30态190对象、135相位绑定、两攻击各9查询反例、4真实编译/子树变异及5类Schema反例通过。原生case/树/PNG/位场重复一致，原生联系图人工检查完成；未运行现代游戏旅程，本项不宣称实际HP已复现。

批准文件：`docs/tasks/evidence/TASK-SETTINGS-248/approved-pixel-differences.json`；攻击1清单SHA `de7ee5a60c9b8750c362e081c459d3bc510995b02b06b4a7bcbb6d5583ca57b7`，攻击2清单SHA `a8969c0a66113ef4834caeeb3bb5f5d6b9a29e87520792c11bdf55b692229e45`。批准事实与SHA同时嵌入可提交sidecar，完整oracle及清单本地保留；任何新差异不得隐式继承本批准。

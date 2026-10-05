# 聚拢英雄运动输入与坐标迁移合同

2026-10-04，`TASK-SETTINGS-261`。范围是 Monster2 聚拢所需的普通英雄构造参数、公共平移和有限竞争输入。原始角色的完整构造、技能与整关物理不在本项内。机器输入为 [行为 sidecar](reference/hero-gather-motion-contract.json)，状态 `verified-bounded-motion-inputs`，复验入口为 `tools/hero-gather-source/`。完成本项不代表 260A 已接入正式 Scene，也不关闭 260B、父260、204/all、194、VS-067 或 Active 功能线。

## 源参数与边界

| 普通构造分支 | 行走/世界步 | 跑步/世界步 | 重力/世界步 | 初始速度 y |
| --- | ---: | ---: | ---: | ---: |
| Role1..4 | 6 | 10 | 1.5 | 4 |
| Role5 默认 `isSword=true` | 7 | 11 | 1.5 | 4 |
| Role5 构造条件 `isSword=false` | 6 | 10 | 1.5 | 4 |

第三行只是显式执行的构造条件分支，不是自然运行中切换长枪就改变速度的证据。`ToSpear/ToSword` 只改布尔值，不改速度；默认实例在无其他写入时仍为 7/11。`jumpPower=-20` 是继承字段，本项只观察初始化，不验完整跳跃/落地动作。

所有数值均以世界 host 步为单位。Config 默认30，设置页允许30/24/20；不得把6或7直接当 px/s，也不能继续用现代360px/s后声称三档逐步匹配。原 `BaseHero.move` 在该有限域先写 x/y，再加重力；Sprite 每次位置写入向零截断到 1/20px。墙检测先于这次移动，平墙落根为 `wallTop-0.1-colipse.height/2`；固定相机的屏幕根边界为20..920。

支架执行相关原构造语句、原公共方法及原 Tween ABC，不执行完整 Role 构造。先采集原参数和原 `ObjectBaseSprite`，再按257B已有试验服务重设速度为0；仅 gravity 模式启用1.5，wall 模式设 vy=10，natural 模式启用普通行走但重力为0。这些是明确输入，不能把静止或自然组误称为未干预的完整原游戏。新增 run 模式使用原 `setSpeed` 跑步分支；257B原5px受控输入和原expected保持不变。

域外：技能、攻击锁、无双、buff/enforceSpeed、海水、动态/旋转斜墙、移动镜头、完整键盘/动画/装备以及完整角色构造。`setLostGraity/resetGraity`、`turnToGXP/turnToNormal` 的改写已定位，但不混入普通构造合同。没有新增 UI 或视觉许可；几何直接引用257A verified profile，217只用于识别正式场景的既有几何边界，不把显式平墙fixture冒充整关墙体。

## 六段证据链

AS3根为 `local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts/`，只读。源文件/方法hash、行号、生成AS3、原日志与工具hash由sidecar绑定。

| 问题 | 局部/共享调用链 | 资源与空间 | 原运行与反证 | 现代消费者/结论 |
| --- | --- | --- | --- | --- |
| 实际普通速度 | BaseObject字段51..57/构造113；BaseHero构造102；Role1:46、2:53、3:36、4:46、5:143；setSpeed:284 | 原角色同种 ObjectBaseSprite | 六profile原初始化观察；speed-unit拒绝 | 交叉确认普通6/10与7/11；现代秒制输入待260A迁移 |
| 有效覆盖 | Role5默认51、切形4528..4539；BaseObject失重1145/恢复1155；BaseHero无双2060/恢复2271 | 无新增视觉事实 | 静态全部参数写入核对；构造false分支单列 | 确认切形本身不改速度；域外效果未知，不称完整角色验证 |
| 位移与重力 | 原BaseObject.step→checkCanMove/nearToWall→setSpeed；BaseHero.move:1941 | 257A `/targets/0` 的原根/碰撞体 | 每步x/y/vx/vy；gravity-first、twip变异拒绝 | 实际movement先加重力/秒制与原输入不等价，不能靠测试替代物理关闭 |
| 平墙与屏幕 | BaseObject.nearToWall:532、getBottom:894；BaseHero.step:1679 | restored StageCommon；固定相机与显式平墙；217正式几何边界引用 | wall-snap、screen-clamp、root-offset拒绝 | root/脚点转换是必要边界；不是完整关卡碰撞许可 |
| Tween竞争与生命周期 | MainGame.__enterFrame:824→PhysicsWorld.step；Monster2.doHi2；原stop/continue/destroy链 | 同父local根；source终点复制 | 原ABC自然时钟及受控时间分别验证；world-before-tween拒绝 | 保留257B lazy/覆盖/暂停/死亡与移除后继续/退出kill全部合同 |
| 正式映射与双验证 | HeroMovementSystem、HeroPartyRuntimeBridge、PlayableLevelRuntime、Stage12GameplayBridge | 现代movement.y/视图原点均为脚点 | 原日志+独立oracle；Luna只读复核现代消费者 | 源输入已能交接；正式HeroParty/Registry、浏览器及生产变异仍由260A验收 |

原方法由257B提取器原文复用，261只重定向输出目录并插入已定位的初始化语句。没有修改257B工具或其原结果。独立数值oracle从257B验算器扩展固定的六组速度和run模式，不读取现代实现或capture结果来生成expected。

## 最小迁移合同

1. 保留 `HeroParty` 的 `member.movement` 为唯一位置owner，HP仍由现有combat持有。不要以另一个物理替身跑通测试后宣称正式接入。
2. `movement.y` 是脚点：HeroMovement着陆写 platform.top，HeroParty以groundY初始化，Phaser视图原点为 `(0.5,1)`。原碰撞根为 `rootY=feetY-50`，Tween终点转回脚点为 `targetRootY+50`。应先在原root空间执行量化，再投影回脚点；不能仅对feet做量化并假设负坐标跨零时总等价。
3. 原参数按世界host步消费，三fps不以秒制乘delta改变每步6/7或10/11。迁移既有movement入口的有限输入与积分顺序，覆盖实际生产调用；必要的配置适配必须显式限定适用域，不复制第二movement循环。现有输入/攻击/技能/其他关卡行为只做受影响回归，未知分支不得冒充已复现。
4. Stage1-2有序接缝必须让 Tween→怪物请求→英雄运动同一步各发生一次。请求同帧的英雄移动影响首次render起点；不能先捕获请求时坐标。宠物、投射物、效果与接收也不得重复推进，259同步退休回归必须保持。
5. 已有 `HeroCombatVisualCoordinates`、普通Stage1接收、经验目标已扣50，不再重复扣。`HeroPartyMonster3Reception.ts:33..39` 直接传movement.y给targetRoot，存在明确语义冲突；260A改动共同边界时必须核对/回归该消费者，但本项不修src，也不把它当新原版事实。Root转换不是整体把movement.y改为root。
6. 260A仍须原257B全部4,832 Tween态、5,436世界态/7,248英雄态和自然不变量，并增加本261正式参数矩阵的实际owner消费。完整两普攻、身体、裸MC、258实际接收及自然联合旅程留260B，不能用本项原AIR成功代替现代验收。

## 验证与复验

受控矩阵为6profile×3fps×3owner×13模式，35,334世界态、47,112英雄态。自然组为6profile×3fps×3owner，每次54场；每场检查初始和恢复后的顺序、lazy起点、活动覆盖、原ease/量化/终点、暂停、死亡/销毁及退出后的冻结。两次受控结果逐字段比较；自然运行分别对独立不变量，不要求真实毫秒采样相等。

七类编译源变异：速度单位、先加重力、round替代twip、错误碰撞root、错误墙落点、屏幕clamp、世界先于Tween。必须先编译/原AIR运行成功，再由独立oracle拒绝；运行失败不计反证。报告x/y/vx/vy损坏负例另计，不冒充源变异。原方法完整性、生成源、日志和repeat绑定由finalize检查，JSON可解析不是通过条件。

```text
python tools/hero-gather-source/audit_inputs.py
python tools/hero-gather-source/capture.py
python tools/hero-gather-source/verify.py
python tools/hero-gather-source/run_mutations.py
python tools/hero-gather-source/capture.py --repeat
python tools/hero-gather-source/verify.py repeat
python tools/hero-gather-source/finalize.py
python tools/hero-gather-source/finalize.py --check
npm run check:workflow
npm run audit:problems
```

capture必须串行；变异prepare会重建公共支架，最后repeat恢复正常生成源。原基准、生成SWF/AS3和trace保留在本地261 evidence/task-outputs，供260A/B复验和差异定位，Monster2完成后再评估清理；游戏运行不依赖这些本地产物。源码工具与行为sidecar随Git交付。Python LSP缺basedpyright，本项未安装软件，实际Python/AS3编译及原AIR执行承担工具验证。

Luna负责源参数/现代坐标只读核对及七项重复变异执行，主agent复核并归并：已修正最初几何profile空引用和Role5分支命名，未采纳把构造false分支当自然长枪速度的外推。此处不宣称模型成本收益已经测量。

本批实际结果：两次受控35,334世界态/47,112英雄态逐字段相等，冻结936条轨迹；自然记录分别13,898与13,884条，每次216个早期运动顺序样本、54场全部不变量通过。7源变异均成功编译/运行后被独立oracle拒绝，4字段损坏负例通过。finalize及check绑定原报告、日志、源hash与生成源，行为sidecar约2.44MiB。源输入闭合后261归档，260A唯一Ready；本次没有修改src/public或扩大原许可。

收尾检查：Python语法、finalize/check、structure（0 error、9项既有warning）、workflow（22条harness测试通过；既有PlayerSlot别名warning）、audit:problems及diff检查通过。首次generate:harness因归档后当前推荐仍链接261旧定义而拒绝，修正派生入口后生成与workflow通过；该失败不计通过。261仅工具/证据/文档增量，未重跑无新src改动的build或浏览器；260A早前已有核心与build检查不能当新正式接入证据。删除本工具新生成的单个verify Python缓存，其他原基准保留待A/B消费。

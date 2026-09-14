# 214D 浏览器与可见链验收

2026-09-13，内置浏览器、既有4174 preview，940×590画布。使用localhost隔离DEV双人party fixture；未读写正式存档，不通过脚本设置命中或HP。

| 场景 | 实际观察 |
| --- | --- |
| 正式Stage1-2 / dragon2 | 实际键盘移动进入遭遇；formal-dragon2.png/json记录P1/P2各一个真实分身、27条hit1/hit2伤害，HP从5000分别升至6870/6308，源动画及半透明私有实体可见 |
| 正式Stage1-2 / dragon3 | formal-dragon3.png/json记录20条hit1/hit2/hit3伤害，包含physics与magic及双owner；HP升至6584/6669。本张采集时分身已到期，未把截图说成九对象同帧录像 |
| TestScene / dragon3 | 最终构建下真实Monster30被ltwj命中，testscene-dragon3.png/json记录36条hit3伤害，P1/P2各一真实私有分身；P1因既有经验/升级链更新至level2/maxHp840，P2仍为原QA数值，不人为改写HP |
| 返回与清理 | 两个场景实际Escape→返回地图后，canvas.petDragonQa均删除，截图与testscene-return.json保留；全slot视图/弹体零残留及休息/替换/重建由12组真实消费者测试验证 |
| console | 浏览器warn/error为0，见browser-console.json和testscene-return.json；构建chunk尺寸提醒另列，不属于浏览器console |

browser-summary.json提供所采JSON的精简索引。逐状态174张940×590原版对象基准与生产presenter的对账在visual-diff.json；独立渲染不同于完整原版游戏录像。九对象延迟/位置/伤害/释放由Runtime黑盒trace与9种源码变异验证，不能从一张截图推断其时序。

TestScene普通弹仍受真实纵向碰撞范围约束；本次确实出现ltwj击中飞行目标，不据此宣称普通弹可以击中所有高度。返回地图截图只证明已离开战斗，本批不对DEV直达地图的整页视觉作新验收结论。

正式五关接线与retry/return/reload沿用共享journey回归；本次手动代表场景是Stage1-2和TestScene，没有声称手动遍历五关。下一项214E继续四阶与全家族合同。

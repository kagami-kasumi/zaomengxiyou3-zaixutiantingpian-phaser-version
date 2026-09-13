# 214C5 浏览器验收

2026-09-13，内置浏览器，`npm run preview`，940×590 canvas。本地DEV party fixture不读写正式存档；`qaPetDragon=1`仅在localhost启用，`qaPetDragonMortal=1`用于实际承伤/失败路径。

| 观察 | 产物/结果 |
| --- | --- |
| 正式Stage1-2 P1/P2进入、移动、追击、normal/fs、伤害数字 | `formal-combat.png/json`、`formal-active.png/json`；生产audit包含两本体及两owner各自summon来源，对真实stage12 enemy的HP decrease；截图可见原生本体/普通弹，分身独立位置与半透明投影 |
| 治疗与到期 | 正式fixture从5000/10000 HP开始，战斗后回满，MP扣除可见；精确命中自疗/到期/早死负分支由C4语义trace持续验证，不从截图反推公式 |
| 主人承伤、全员失败 | `formal-failure.png/json`，关闭QA保护后通过真实怪物攻击进入失败页；没有用QA直接设置失败 |
| 实际点击重新挑战 | `formal-retry.png/json`；P1/P2 runtimeKey从session1/2变为session3/4，damage数组0、summons均0，宠物重回出生位置；旧分身/弹体未遗留 |
| TestScene | `testscene-active.png/json`；P1/P2均为dragon1，真实子实体、原生本体与半透明分身同时存在，没有默认猴/占位宠物并存 |
| TestScene纵向不命中 | 默认飞行怪位于地面普通弹上方，浏览器audit没有伪造伤害；明确地面输入下的实际Monster30 HP/hurt、两个owner、奖励归属由consumer-tests通过生产适配验证 |
| 返回地图与重载 | `testscene-return.png`及`formal-return.png`；返回后canvas的petDragonQa已删除，离场视图释放。页面reload重新走Boot建立本局fixture，不复用前局子实体 |
| console | warn/error采集为0；build的大chunk提醒属于构建输出，不是浏览器console |

逐状态原版对比另见`visual-diff.json`、72张`projections/`与`contact-sheet.png`。这些产物区分源对象对账与正式游戏观察；不把现代整页截图标成原版基准。

允许的现代例外沿用214A透明裁边及C4早死清理语义。未添加美术替身、第二份计时或伤害规则。五关场景入口、当前schema的换宠/休息/return/retry/reload由既有formal-pet-journey/formal-game-loop测试与本批consumer测试共同覆盖；浏览器代表场景为Stage1-2和TestScene，未声称逐关手动跑完五关。

# 214E 实机与清理验收

2026-09-14，内置浏览器、localhost:4174 preview、940×590。使用既有 `qaStage` / `qaPetDragon=1` / `qaPetDragonForm=4` 的隔离双人DEV局，未修改用户存档，也未通过浏览器脚本写HP、伤害或游戏内部状态；只发送键盘/指针输入并读取canvas公开QA属性。

| 场景 | 实际证据与结论 |
| --- | --- |
| 正式 Stage1-2 | `formal-dragon4.png/json`：P1/P2和真实半透明分身；25条hit1/hit2/hit3伤害，分身sourceId与主人分离。实际键盘移动进入遭遇，技能由公共Runtime自主选择 |
| 四阶奥义 | `formal-samples.json`、`formal-qlaoyi.png/json`：连续采样中P2进入qlaoyi，记录动作token、根坐标、分身、MP与CD；截图同时可见雷霆效果和真实分身，不能把一张截图解释成完整奥义录像 |
| 奥义真实命中 | `formal-after.json`：共37条伤害，覆盖hit1/2/3/4；P1 trigger的hit4造成200实际HP损失，attackId含独立projectile/token，P1/P2最终HP为9998/10000，MP均860。hit4时间为195083.5ms，目标stage12-enemy-31 |
| 返回/重载 | `formal-return.png/json`：菜单“返回地图”后data-pet-dragon-qa删除。`formal-reload.json`：再次加载产生P1/P2干净根会话，无分身/伤害，HP5000/MP1000 |
| 最终构建 TestScene | `testscene-dragon4.png/json`：实际Monster30接受12条hit3伤害，P1/P2各一个真实分身，HP6288/7424；普通弹未据此宣称可命中不同高度的飞行目标 |
| TestScene退出 | `testscene-return.png/json`：返回地图后QA属性为null，浏览器warn/error为空 |
| 失败重试 | 本次重跑60组实际生产消费者/五关环境的retry、return、reload，全部零残留；共享Scene失败→重试路由同时由formal journey回归，已有实机失败/新会话证据沿用214C5的`formal-failure`/`formal-retry`。本次四阶未另采集完整双人失败画面，不伪称手动遍历全部路径 |

console warn/error在正式与TestScene采样及退出均为0（返回JSON保留日志）。构建的既有大chunk提醒与structure的9条无关warning另列，不是浏览器console错误。

浏览器输入在单次keydown/up短于游戏帧时可能不推进，连续按键进入遭遇后正常推进；菜单使用小幅指针拖动跨过输入帧后完成返回。一次长键盘批次超时后复用原标签页，不把未完成批次计为验证。本任务没有为自动化改写游戏时钟。

逐状态原版对账见C5/D/E的72+174+99张源对象基准和production presenter投影。Runtime逐host tick、16种奥义继承组合、48帧碰撞及free-chain由独立测试承担；浏览器仅证明真实玩家入口中相同链可见和可结算。用户已认可当前效果、无需严格坐标对齐，219的有限碰撞近似继续明确保留。

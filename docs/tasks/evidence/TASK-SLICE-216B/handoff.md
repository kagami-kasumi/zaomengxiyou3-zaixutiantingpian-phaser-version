# 216B 承伤 producer 交接

状态：完成运行实现与验收；父216仍待216C默认5173入口，不能宣称父合同完成。

## 当前消费者与适用性

| 路径 | 真实producer | 验收边界 |
| --- | --- | --- |
| Stage12 / Stage13 → HeroPartyRuntimeBridge → Stage1CombatSystem / HeroCombatSystem | hero-reduce-hp、PetCombatEntitySession 的 pet-reduce-hp | 共用party incoming model；按真实slot、pet runtime key、attack/source转发，宠物发生时间与下一帧结算时间分别保留 |
| Stage21GameplayBridge.updateIceHazards | environment-reduce-hp | 冰刺source/attack/time、直接结算与保护规则消费216B2；实际双人冰刺扣血/死亡/数字见Stage21报告 |
| Stage22GameplayBridge.updateFire、Stage22DevGameplayBridge.applyDevFireHits | environment-reduce-hp | 正式火刺实际双人数字；DEV真实adapter/像素状态由B2的24状态报告覆盖，不冒充完整DEV旅程 |
| TestSceneWorldBridge → TestSceneCombatBridge，TestSceneBossArena | hero-reduce-hp、已有turtle-transfer | 两个真实碰撞/结算函数216状态携带真实roster/runtime，含双owner、致死、保护/盾/重复命中；完整TestScene截图实际hero数字 |
| 正式Stage1CombatSystem的玄龟重定向 | 当前不存在 | HEAD及当前该入口均直接applyHeroDamage，无turtle重定向；本批不扩展未完成家族，不用TestScene证据冒充正式玄龟行为 |
| GXP显示除二、Pig8显式双producer、英雄毒/火持续效果、CureHpQueue.addHpLose | 当前无对应incoming消费者 | HeroSkill的isGxp不是HeroCombat显示实现；Role4/Monster30现有DOT打怪物；Ice/Fire Thron确实存在并已接，不归入此项。未增造这些producer；environment-explicit仅验证身份协议可区分ordinal，不称实际玩法覆盖 |
| 环境直接打宠物 | 当前不存在 | 现有冰火只生成hero hits；宠物直伤来自真实怪物攻击/既有TestScene转嫁 |

## 事件与显示合同

HP结算处产生不可变事件，保留source/attack/runtime、producer/ordinal、target kind/owner/runtime、结算量、显示整数、HP前后和世界根锚点。复合eventId按producer去重；不按HP差过滤0或致死，不进入怪物queue/combo。直接无盾0显示0；满盾/恰好吸收没有reduceHp producer；溢出数字为到达HP入口的量。既有玄龟0输入不触发pet transfer；非零101为hero95/pet6，pet即使只有3HP仍显示6。

TestScene的攻击/结算时钟独立于Phaser场景时钟。两个战斗时间保持原值，view另记录displayStartedAtMs，用场景delta执行原版动画；不能拿两个时钟的绝对值相减来伪造时序差异。每个scene单独model/view，shutdown清除订阅、对象、seen和trace；重试重建runtime。无新伤害公式、AI、存档schema或家族行为。

## 独立证据与结果

- `testscene-producers.json`：216个实际Monster30/Monster3 adapter/碰撞状态，独立冻结期望比较显示值、owner、attack/time、锚点及producer计数。受控攻击态，不是完整玄龟场景画面。
- `gameplay-verification.json` 与 `gameplay-*.json/png`：实际应用entry、资产、五关场景、输入和逐帧推进，不注入伤害事件。五关均含P1/P2真实trace；1-2同时英雄/宠物扣HP和独立pnum；2-1/2-2为实际冰火。每关重试/返回零对象零trace，最终Page.reload零残留；940×590，warning/error均0。宠物QA采用既有临时dragon mortal fixture，不写存档，自动回血可同时出现，因此不能用跨帧净HP差代替伤害事件。
- 实际对象逐状态按215原ANumber独立参数校验字形、整数锚点、4→1缩放、.25秒延迟/1秒淡出上升与owner。1-2初始放大的pnum可能被既有HUD遮挡；保留实际截图，没有为证据移动数字。
- `../TASK-SLICE-216A/display-comparison.png` / `display-verification.json`：本批重跑68 WebGL/Canvas原版对照、13字段变异与1真实采样变异。允许差异仅既定栅格通道最多2/255；无新现代可见层。实际战斗不声称整张场景像素等同原版，显示组件使用同一已验收view。
- runtime专项覆盖双owner普通/0/致死/盾/保护/转嫁/真实PetCombat死亡、事件重放与不同producer、destroy；`producer-mutations.json` 10类实际代码变异全部拒绝。
- B1十类、B2十三类变异及B2数值/真实环境adapter证据继续成立；215 generator --check --self-test通过。211/212 combat-feedback专项通过。
- 全系统通过（首次既有青龙报告写入遇Windows瞬时UNKNOWN，原样重跑成功，未跳过断言）；build、structure、annotations、workflow、audit与diff检查见任务收尾。

## 工程边界与接续

结构检查9项既有warning，无error。TestSceneWorldBridge只新增一行真实petRuntimes适配；HeroPartyRuntimeBridge只转发模型/时间/slot，不增加公式，保留既有12系统import warning，因此不做无关大文件拆分。

216C只处理已授权localhost:5173可发现全宠物fixture与隔离/槽保护，复用本报告；A/B/C全部完成后才关闭父216/VS-072。未提交Git。

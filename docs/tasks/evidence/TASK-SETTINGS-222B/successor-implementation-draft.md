# 玄龟正式实现接续合同草稿

父222核销后登记为同线 Planned；223资源准备完成前不实施。本文件不宣称系统设计验收通过。

共同约束：沿用 `docs/architecture/system-designs/pet.md` 当前实施中的唯一公共Runtime/EntitySession/Registry/正式bridge；不复制顶层时钟、目标、HP、CD、朝向或移动owner。每批执行时按设计验收协议核定并声明当批机器gate，退出码非0不可结项。已有猴、马、青龙gate必须保持通过；完整宠物all门禁不得提前关闭。

每个任务均属 `TASK-SLICE`、常规任务、`LINE-PRE-STAGE-2-3-PRESENTATION`，覆盖M-032/M-034/M-035/M-042/VS-012/VS-067；预算最多2工作包、2验收批次、预计0次compact。主agent唯一写入，Luna只读检查消费矩阵/独立验收。遇新资料族、额外Runtime owner或第三独立验收批次，执行前拆分且保留完整32合同。资源源头为父222 verified manifest、221源行为合同、223已验收派生资源；不得借本任务修改原始提取、恢复SWF、其他家族或存档格式。

## TASK-SLICE-224A：公共入口与普攻、水灵盾、同心链接

输入：上述共同证据和当前正式宠物消费者。两工作包为公共玄龟行为/形态定义接入，以及SLD/TXLJ与已有伤害/治疗端口集成。

输出：四形态公共初始化与普通攻击，真实范围判断/追击后攻击，SLD释放/follow/hurt不断/自疗，TXLJ双owner效果与盾后伤害转嫁、双向治疗；生产代码直接消费verified资源与碰撞字段，未来技能分支不以占位实现冒充完成。

合同责任：entry.forms、ai.priority、ai.range、ai.owner、ai.target、ai.follow、normal.1..4、sld.gates、sld.release、sld.effect、sld.link-heal、txlj.release、txlj.damage、txlj.heal。ai.priority先保留完整已学技能优先级输入，并明确SYBH/奥义最终由224B验收；不改变原版选择事实。

完成定义与验收：独立源预期验证四形态×P1/P2从范围外追击至范围内才攻击；真实怪物HP变化、miss不计成功、去重/刷新、双方治疗和盾后转嫁顺序，不能只把目标放到弹体中心制造命中。TestScene与正式场景共用生产入口，940×590原版逐态差异、资源/时钟/owner变异拒绝；npm check:structure、build、相关行为/系统回归、check:workflow、check:annotations、audit:problems和diff检查通过。只关闭本批17合同实现责任，完整32合同仍由224C联合验收。

状态更新与下一步：归档224A、激活224B；204/VS-067继续未完成。

## TASK-SLICE-224B：神佑庇护、奥义及受伤结算

输入：224A生产集成、全部源行为与原生动态/碰撞证据。两工作包为三四阶SYBH与奥义8组合，及受伤反击/伤害快照与结算接入。

输出：SYBH scale1/2与原命中间隔；奥义0/2/4/5秒链、跨末帧持续、hurt保护与清理；原始1009缺陷只记录，不复制现代异常。宠物受伤触发QLFJ而非英雄受伤误触发，真实power/快照/去重/防御结算。

合同责任：sybh.release、sybh.effects、aoyi.gate、aoyi.chain、aoyi.damage-window、aoyi.hurt、aoyi.cleanup、damage.power、damage.snapshot、damage.dedup、damage.defense、hurt.counter、hurt.death。与224A的ai.priority、SLD/TXLJ组合同时回归。

完成定义与验收：8种已学组合×P1/P2实际生产时钟/HP/MP/CD/技能顺序和碰撞，最后帧攻击与TTL到期次序，三四阶范围与间隔、反击条件及负例；独立expected不从实现反推，错owner/scale/时点/mask/技能顺序变异必须失败。执行当批设计gate、相关系统回归/build、940×590逐态视觉及项目必需检查。不得以本批技能通过宣布全族生命周期或五关联合完成。

状态更新与下一步：归档224B、激活224C；204/VS-067继续未完成。

## TASK-SLICE-224C：正式五关与完整家族联合验收

输入：224A/B生产代码及父222全32合同/视觉/碰撞矩阵。两工作包为生产全生命周期闭合，以及独立完整家族验收。

输出：lifecycle.destroy、lifecycle.replace在换宠/休息/死亡/重试/返回/重载中资源、子弹、定时回调、owner引用完整清理；全部32合同逐项正式消费者和证据落点，四形态P1/P2在TestScene与五关共用入口，无旧玄龟平行路径。

完成定义与验收：所有32合同集合严格相等且不存在pending或未解释N/A；原版视觉与批准的有限碰撞例外分开对账；范围外负例、实际伤害/治疗/反击、8组合、替换与退出后零残留，独立consumer路径变异拒绝。完整玄龟设计gate必须机器返回0，猴/马/青龙回归、全系统/build/正式940×590与零console错误及workflow/annotations/problem audit/diff通过。机器gate不得仅检查字段存在、类型编译或自回放。

状态更新与下一步：仅此批满足完整证据时关闭玄龟家族；宠物总设计/204/VS-067仍按其余家族与旧入口实际缺口保持未完成。依据当前线覆盖台账生成下一完整家族任务，不提前进入194。

# 214E 青龙四阶与完整家族交接

dragon1..4 已接入同一 PetCombatRuntime / EntitySession、正式伤害端口与生产 presenter。四阶继承 normal/fs/sdcc/ltwj，增加 qlaoyi trigger、真实分身及免费连锁。完整 44 项合同映射见 `family-contract-audit.json`；历史父合同持久保留在 `parent-contract.md`，handoff verifier 不再依赖待归档的任务定义。

## 四阶实际行为

- qlaoyi 初始/后续 CD 为 15/24 秒，30 MP 仅门禁，不扣蓝；第 1/13/25/37 次 enter 回调对应剩余计数 48/36/24/12。首回调无条件生成 trigger；学 fs 才生成四只真实分身，朝向 left/right/left/right。
- 四阶分身复制技能、暴击和移动速度；HP 为主人当时 HP×20，maxHp 再×20，MP 为当前 MP×99，maxMp 再×99。普通 fs 与奥义分身共用私有 Session，12 秒到期或提前死亡均只治疗主人一次 3.6% maxHp。
- 奥义结束优先免费 sdcc，再按继承情况转 ltwj；无 sdcc、有 ltwj 时经 hit6 落地/完成进入雷霆。连锁不扣 MP、不重置继承技能 CD。hurt 中断未发生的回调和主人连锁，已生成 trigger 保留；AoyiBuff 为不造成伤害的原版效果。
- 四阶 normal 根偏移为朝向×65、y−15；主人普攻不治疗，分身普攻治疗。sdcc/ltwj 范围为 180/220，沿用原版伤害、命中自疗与九对象雷霆。trigger 使用 hit4 / magic，无自疗，48 帧逐帧碰撞后再跟随，末帧碰撞先于销毁。
- 四阶 qlaoyi 每次 enter 前赋 y 速度−5；enter 回调切到新动作时，当次 host tick 仍递减新行持帧。公共时钟和地面 Session 消费这些可选事实，Behavior 没有复制移动、目标或 CD 算法。

## 证据与回归

| 合同 | 可重跑证据 |
| --- | --- |
| 44 项范围与证据对应 | `pet-dragon-family-audit-tests`，精确比较213与父合同ID集；64组全形态/P1P2运行trace、60组五关消费者、345态投影与20变异完整性 |
| 四阶动作及16种组合 | `pet-dragon4-runtime-tests`，20/24/30fps，P1/P2×八种继承组合，action/token、出生时刻、坐标、真实HP变化、主人/子来源及释放 |
| 家族共同语义 | `pet-dragon-family-behavior-tests`，范围外600追击到150以内真命中、ordered-first/1200清除后下一tick重选、0.7随机边界、owner跟随/warp、技能优先级/CD、死亡停CD、魔花四阶特例 |
| 原版碰撞消费 | 初阶218的861例；二三阶219的6448例（104像素已批准近似）；四阶220的11520例/78373320像素零残差。有限采样不宣称全空间数学等价 |
| 同源消费者 | `pet-dragon-family-consumer-tests`：4形态×11/12/13/21/22实际环境×retry/return/reload，共60组；实际updatePets闭包/Runtime/presenter/Stage1Combat/Monster30 adapter，均验证P1/P2、换宠/休息/全释放。Scene路由另由formal journey验证 |
| 可见原版投影 | 初阶72态、二三阶174态、四阶99态，总345；生产presenter调用独立渲染对原版对象基准均零差异。四阶增加4类视觉变异，未新增生产PNG |
| 防回归 | pet P1G包含P1GD/P1GC/P1GS及猴马既有门禁；四阶20类实现变异含range/hit/source、MP、分身、连锁、首帧mask、魔花等；全系统与build通过 |
| 实机 | 940×590正式Stage1-2双人normal/fs/sdcc/ltwj/qlaoyi、真实hit1..4与分身来源；TestScene及退出/重载记录详见 `runtime-audit.md` |

## 源语义纠正与边界

- 最终构造 attackRate 为0.7；213早期共享文字中的0.8属于被C2纠正的字段初值，不能重新覆盖生产值。
- PetDragon4.as:801..858 对 hit1..4 乘 BasePet.as:1208..1223 的魔花增伤；前三阶 getRealPower 没有这一乘数。本批补现有 magicFlowerBuff.attackMultiplier，实测1.5倍时四阶普攻145、前三阶仍97。
- PetInfo.as:1017..1162 无已学技能检查，getPetHarmObj 返回公式对象，末尾明确乘1.05。因此未继承ltwj时trigger仍使用其公式。只读审计声称“1.05无来源/未学时伤害为零”的结论经整段源码核对不成立，未采用。
- 普通、sdcc、ltwj 的缓存消费、接受后两次crit读取、去重和治疗沿用C4/D证据。四阶主人普通弹与trigger不治疗的特例有独立断言，不能被共享概述覆盖。
- 219的四旧效果碰撞近似保留用户2026-09-13批准与104像素残差，不外推至220。用户认可现有效果且无需严格坐标对齐；没有用现代替代层覆盖原有可见层。
- 实机截图不冒充原版游戏录像；345态属于源对象基准/生产投影。五关60组是实际生产闭包测试，不声称手动走完五关。
- pet设计仍实施中/未退出：P1G通过只关闭青龙完整家族，六个其他家族及旧入口仍未全部完成，不运行或宣称all通过。

## 报告写入隔离

收尾复现负向first-mask进程在后续碰撞断言失败前覆盖正常D trace，见mutation-write-repro.json。已将三个青龙变异runner的子进程报告写入隔离，运行前后逐字节校验正常报告不变；正常生产测试再生成当前trace。D报告diff不作为生产玩法变化证据，PG-017 V2.4记录本反证与防线。

## 重跑与交接

```powershell
npm run check:system-design -- pet P1G
npm run test:pet-dragon-family-truth
npm run test:pet-dragon-assets
npm run test:systems
npm run build
npm run check:structure
npm run check:workflow
npm run audit:problems
git diff --check
```

保留source-isolated trace、原版输入/哈希与浏览器证据；220原始buffer无损归档的本地依赖见其handoff。next：TASK-SETTINGS-215，先处理角色/宠物承伤数字原版合同，之后216；本次不执行215。完成后建议提交本批改动，未执行commit/push；切到215时可新开对话。

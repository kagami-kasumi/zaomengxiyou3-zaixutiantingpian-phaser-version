# 214E 四阶青龙输入预检

日期：2026-09-14。结论：214E未完成，奥义trigger碰撞输入缺口需独立补证。没有修改src、生产资源或原始提取。

当前进度：220已补齐该缺口，见 `../TASK-SETTINGS-220/handoff.md`；214E恢复Ready。下文是补证前的预检记录，不代表当前仍缺trigger输入。

## 可复查证据

- `collision-preflight.json`记录213真值、214A资源表、219碰撞合同、原版PetDragon4及现代碰撞消费者的哈希。48张PetDragonBullet4图片全部存在且匹配已有哈希；这是输入范围检查，不是战斗验收。
- 213 `/visualTruth`中的PetDragonBullet4为恢复`assets/pet1.swf` character539、48帧；其逐帧视觉矩阵和214A投影继续保留。213没有提供本对象独立HitTest运行oracle。
- `PetDragon4.as:685–702`的doHit5在剩余48时创建FollowBaseObjectBullet("PetDragonBullet4")，根x/y、setRole、setDirect、action="hit4"、hurt不截断；它是有伤害的独立弹体，不能只播放奥义动画。
- `BaseBullet.as:301–325`在目标未去重且beMagicAttack接受后刷新伤害缓存、调用可选funcWhenHit并登记攻击ID；`FollowBaseObjectBullet.as:26–51`先super.step2，再于仍存活时跟随位置/翻转。213的trigger合同保留这条碰撞路径。
- 219 `/scope/symbols`仅PetDragon2Bullet1、PetDragon2Bullet2、PetDragon3Bullet1、PetDragon3Bullet3，共76帧；没有PetDragonBullet4。其handoff与approved-approximation明确只允许这四效果的采样近似。
- `PetDragonEffectCollisionSystem.ts`按symbol/frame查合同，缺项直接抛错。无法把新trigger直接接到219；也不能把213的2700×1500视觉画布用作实心命中矩形。

## 范围裁决

缺口是新对象的源显示/绘制采样及独立命中正负oracle，不是缺美术资源，也不是要求重做严格坐标对齐。用户认可现有效果、无需严格坐标对齐的偏好继续适用。

214E已声明两个包（战斗实现、同源消费者与验收），补trigger原版碰撞是第三独立逆向包，命中其拆分条款。因此本次只完成预检、同线任务重排与交接；不缩减44项/P1G，不执行215，不把原有219近似许可扩展至新对象。

- 214E设Blocked；新增唯一Ready `TASK-SETTINGS-220`，只补一个trigger的48帧/96方向状态及既有三目标碰撞输入。
- 220通过后恢复214E；父214/214B保持Split，功能线仍Active。
- 220与214E均未完成，P1G未运行。当前目标“完成下一任务”未达到，不将预检成功登记成游戏任务完成。

## 协作归并

Luna只读核对213及PetDragon4源调用；主agent核对生产消费者和219范围并负责全部写入。采用其trigger确有碰撞伤害、四次分身时序与219未覆盖的结论。子agent提出trigger治疗未知；主agent复核doHit5未设置funcWhenHit，BaseBullet仅在非null时调用，不把其他弹体的治疗回调自动复制给trigger，也不据该建议扩成第二行为逆向包。214E恢复后仍须以精确源码验证全部命中/治疗合同。

## 复验与恢复

`python tools/check-dragon4-collision-preflight.py --check`复查既有48帧哈希与合同范围，退出0仅表示缺口记录可重复，不表示碰撞已闭合。结构检查退出0，9个既有无关warning。文档调度检查结果在本次收尾记录。

下一具体动作：按220定义读取其唯一链接方案，复用218目标与219源运行工具，仅补PetDragonBullet4输入。未启动preview、无运行中检查或未保存实现。建议本批文档/预检提交后交接220；不执行commit/push。

收尾结果：generate:harness、check:workflow（16个harness测试、27个未完成定义、唯一Ready220、1250条annotations、level architecture）、audit:problems、预检--check与git diff --check均退出0。首次workflow指出三个调度字段缺失，补齐阻塞原因/下一步和逆向协议引用后复验通过；保留既有PlayerSlot命名warning。PG-004通过、PG-017方案不充分，结果已集中记录并回写017；均不归档。未运行build、全系统或P1G，因为没有战斗实现变更且输入未闭合。

# TASK-SLICE-214C4 真实战斗链交接

本批已完成并归档，唯一Ready为214C5。未关闭初阶完整链、P1GC或青龙家族父任务。

## 生产消费与证据

| 合同 | 实现与证据 |
| --- | --- |
| 正常攻击 | 默认注册器的 Dragon1PetBehavior 消费既有公共 ground/animation 时钟；第7 tick发弹，第16 tick完成；PetDragon1ProjectileSystem按实体host tick推进11帧，末帧先碰撞后清理。runtime-traces的20/24/30fps normal及末帧反例验证真实伤害/自疗 |
| 原版碰撞 | PetDragonCollisionSystem直接消费218 verified contract和214A mask；861个原版AIR样本逐项比hit/cyanPixels，共970153非透明交集像素一致。coordinate-runtime额外保存原包15个坐标赋值样本，证明朝零截断至1/20像素 |
| 伤害缓存/治疗 | 先消费旧hurt/atk缓存，再在接受命中后刷新，再治疗实际发弹实体；拒绝不刷新、不治疗，接受0伤害仍治疗。damage-tests核对源整数截断、暴击RNG、保护不耗ID、Dodge耗ID；runtime-tests覆盖实际Combat HP delta |
| fs私有实体 | 初始2.5秒CD、20MP门禁并实际扣除、后续10秒CD，第17 tick生成。新PetInfo等价状态在生成时复制当时HP/MP并作为自身上限、atk/def/level；不继承技能、额外属性、crit或GXP。唯一顶层Runtime持有真实子Session，无第二套Runtime或存档实体 |
| 子实体来源/生命周期 | P1/P2 fs trace记录独立sourceId、真实伤害、等级被动、10秒存续及root到期治疗；提前死亡与root销毁无到期治疗，清理自有弹。共享Session测试覆盖旧key、隔离、失败创建/回调抛错与级联清理 |
| 正式入口 | 测试直接执行生产updatePets闭包，两个真实青龙共享Combat/弹体/敌人，各造成97伤害、各治疗自身38HP；不是复制桥逻辑的替身测试，也不是Phaser画面验收 |

源证据入口沿用218/handoff.md、C4/preflight.md及C3/handoff.md。运行时、伤害、坐标和变异产物均位于本目录。根坐标使用218中心输入合同，实例缩放已在runtimeBounds中，不另加脚点offset。仅有限轴对齐源采样已证实，不扩张为任意旋转/缩放语义。

公共Runtime/Session保持实体、目标、CD和动作owner；Behavior仅持有本家族效果。场景PetProjectileCombatBridge负责alpha读回缓存及转发，实际伤害复用Stage1CombatSystem。ProjectileSystem及TestSceneWorldBridge的大文件改动仅跳过已由petHostTick接管的弹体，避免重复推进/命中，没有放入青龙算法。

## 已执行检查

```text
node tools/run-system-tests.mjs pet-dragon-collision-tests pet-dragon-damage-tests pet-dragon1-runtime-tests
node tools/run-system-tests.mjs pet-dragon1-mutation-tests stage1-combat-tests pet-dragon1-clock-tests
node tools/run-system-tests.mjs pet-ground-movement-tests pet-ground-session-tests pet-animation-session-tests hero-party-runtime-tests level-lifecycle-tests level-result-tests playable-level-runtime-tests formal-game-loop-journey-tests
npm run check:system-design -- pet P1GS
npm run build
npm run check:structure
```

以上退出0。14类青龙实现变异均被语义断言拒绝，P1GS保留猴马及10类私有会话变异。结构保留9项warning，build保留大chunk提醒。变异后已重新运行未变异runtime测试，runtime-traces对应生产源码。

## C5保留合同

- 正式与TestScene使用214A真资源投影真实动作、本体/分身和弹体；提供940×590逐状态原版/现代差异，不以本批无画面的测试替代。
- TestScene需把实际敌人模型交给同一combat port。当前已跳过通用碰撞，但其直接updatePets调用尚未传入combatEnemies，不能宣称TestScene伤害链完成。
- 完整P1/P2换宠、休息、retry、return、reload、主人死亡与重新进入的场景生命周期及可见清理，逐项对照C2/C剩余合同；新增并运行P1GC=0后才能关闭父C2/C，不能仅靠本批P1GS。
- sourceHitProtection是现有敌人状态的显式输入端口；默认false/0对应初始状态，不证明Monster4/6/16等原版技能中的瞬态保护已全部现代实现。不得把端口存在写成怪物技能完成。
- 源clone早死分支移出活动数组而非直接destroy；现代在该移除边界释放Session及弹体，属于明确清理选择，不声称复现了源后续不可观察的deadcomplete调度。

P1GC、全家族P1G、系统all均未由本批证明。后续保持唯一Ready调度，不提前进入214D或提升第三家族完整成功样本。

## 完成审计

主agent与独立只读审计逐项复核C4合同，未发现本批normal/fs/expiry-heal及来源/私有生命周期的剩余实现阻塞。217空间源复验与218缓存原版AIR结果复验均退出0；没有再次启动原版采样。最终workflow通过：30个未完成定义、289个历史定义，C5唯一Ready，1250标注与关卡架构通过。problem audit已执行并集中记录，未归档PG或增加完整家族成功样本。归档时修正了历史定义嵌套标题层级，未修改游戏验收合同；diff check通过。无Git提交或上传，本次goal止于C4。

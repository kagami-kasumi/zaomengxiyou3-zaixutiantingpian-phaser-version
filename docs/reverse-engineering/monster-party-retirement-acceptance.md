# 公共英雄同次致死清宠验收

`TASK-SLICE-259`，2026-10-04。范围为258无复活装备的同步销毁合同；不实现Monster2攻击/聚拢，不声明完整装备复活或完整宠物家族完成。

## 原版输入与现代映射

权威输入为[258合同](monster2-reception-contract.md)及`reference/monster2-reception-contract.json`，`contractId=task-settings-258.monster2-reception`。未修改原expected、视觉或碰撞许可。

| 证据链 | 输入、实际消费与边界 |
| --- | --- |
| 局部/共享调用 | 原`BaseHero.reduceHp:795 → destroy:2386 → getPet().destroy/clearPet:990`；`BaseBullet.checkAttack:225`先hero再实时getPet；`Config.getPlayerArray:1122`滤死亡英雄。258已实际执行原销毁链，本次重新窄读关键片段。 |
| 空间 | 不新增空间事实。受控同次命中用既有Monster3原生profile寻找共同重叠；不是Monster2自然命中/像素验收，也不外推其234像素许可。 |
| 行为 | 真正进入英雄dead时同步释放宠物关联。宠物HP/lifetime不改变，当前弹不再扣宠物的remaining；保护拒绝、闪避、盾/转移非致死仍允许宠物独立接收。 |
| 现代HP owner | `HeroCombatSystem`两个实际致死入口同步调用`onDeath`；`HeroPartyPetRetirement`只绑定既有slot及释放端口，无第二份HP或生命周期状态机。 |
| Session | `PetCombatRuntime.releaseOwner`经原`releaseEntity/inactive`递归释放主/私有Session、Behavior、链接和弹体；原生宠物受击死亡仍走dead-playing并只扣一次寿命。旧端口由现有released/entity身份检查拒绝。 |
| 兼容owner | `HeroPartyCompatibilityPets.clear`和TestScene显式`releaseLegacyPet`复用`releaseCompatibilityPet`，释放body/experience/所属弹体/view并清当前引用。未将持久roster的active标志当临时实体指针清空。 |
| 显示/重建 | monkey/horse只释放当前slot身体，复用附属淡出服务；dragon/turtle同步投影已清snapshot；不额外推进另一slot动画。死亡期间update消费空活动列表，不重建已清Session。真正场景重试按既有owner重新初始化。装备复活不在本域。 |

以上原版事实继承258交叉确认；回调和桥接组织为现代设计选择。子agent只读核对已归并；其“清兼容引用会改成支持形态Session”的推断未采用，因为supports由species/form决定，清引用不会改变形态准入。

## 可执行证据

- `tools/monster-party-retirement-tests.ts`直接读取258冻结序列：P1/P2/双方×20/24/30×6场景×Session/兼容owner，共108案例。含HP1/29/30、保护拒绝、宠物先致死、正常非致死，比较首检测HP、寿命、剩余命中数及实际引用；致死后旧端口/第二弹拒绝。不是完整42步原序列重放。
- 另12个原shield-full/turtle-link输入对照原英雄HP结果，确认未销毁主人不会退休当前宠物、其端口仍独立接受。链接数值目标是受控服务，完整玄龟链接由既有专项回归承担。
- `pet-combat-session-tests`新增主人退休的三层真实私有树释放与幂等/roster不变断言；既有共享Session、真实弹体清理/所有权回归保留。
- `monster-party-retirement-mutations.mjs`隔离esbuild变异，不写生产源：延后一tick、只看HP不清Session、跨slot清理、额外扣寿命、漏兼容释放、英雄拒绝连带拒宠物，6类均编译成功后被断言拒绝。报告在`docs/tasks/evidence/TASK-SLICE-259/mutations/`。
- 旧258双owner诊断保留本地原结果；当前诊断绑定与生产相同的退休接缝，改写到259目录，禁止覆盖原失败证据。

## 正式运行证据与限制

`PARTY_RETIREMENT=1 M3_MODE=normal node tools/run-monster3-browser.mjs`沿用现有真实存档/Scene入口，双slot接收实际生产party端口。monkey与ufo分别代表Session及兼容owner；两个Scene×三档fps，逐次检查同调用HP/lifetime、remaining98、runtime/body清理、旧端口拒绝与另一slot引用保留，然后真实restart/返回天庭。

探针设置共同碰撞位置与英雄1HP，属于明确受控正式接线验收，不冒充自然AI到达。自然Monster3旅程另沿既有`M3_FAILURE=1 M3_FPS=30 M3_MODE=normal`执行，验证实际伤害、原生失败按钮重试、暂停、返回/重进。画面为940×590实际Phaser画布，仅证明宠物身体清理与原有表现保留，不声明新UI或像素完全一致；HUD沿既有持久宠物显示，不被误当作战斗实体仍存在。

浏览器最初CDP截图超时，后改由实际Phaser renderer snapshot返回PNG，受控接收后的零delta渲染避免抓到旧画面。失败记录不计通过。全回归暴露旧青龙消费者“主人dead仍有Session”断言，与258证据冲突；两处fixture仅迁移该断言并增加另一slot保持，原资源/伤害/私有树合同不删减。

## 交付与最终结果

生产资源与真值无新增，运行不依赖ignored证据。`HeroPartyRuntimeBridge`本批只增加同步释放接线与已有presenter输入，603行触发warning（原依赖数量warning保留）；生命周期绑定已独立到`HeroPartyPetRetirement`，该窄修不扩整桥重构。其余旧warning不在本任务范围。

`npm run test:systems -- --full`全量118组、`npm run check:system-design -- pet P1GS`79组、`npm run build`500模块通过；structure为9 warning/0 error（构建保留既有chunk体积warning），workflow与活跃PG审计通过。检查日志保存在259/checks；两Scene×三fps×monkey/ufo共12份受控verification全部passed，每份检查P1/P2。自然TestScene与Stage13的失败按钮重试/暂停/返回重进分别保存为browser/natural-*.json。

浏览器经历截图超时、启动资产尚未ready时restart及Stage13猴地面暴露不足的失败；最终受控测试等待真实生产pet owner就绪，Stage13自然旅程采用既有UFO路线，未放宽命中断言、未更改生产碰撞/伤害。截图只证明声明的身体释放；不扩为新视觉许可。

259归档，下一唯一Ready为`TASK-SLICE-260`，完整承接M2-01..09、257A/257B/258及234像素精确许可；不关闭204/all/194/VS-067、PG-017或Active功能线。

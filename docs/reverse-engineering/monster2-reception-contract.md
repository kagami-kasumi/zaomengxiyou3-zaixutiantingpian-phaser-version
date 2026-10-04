# Monster2 两普攻真实接收与 HP 合同

2026-10-04，`TASK-SETTINGS-258`。行为 sidecar：[monster2-reception-contract.json](reference/monster2-reception-contract.json)，`contractId=task-settings-258.monster2-reception`。最终验收以 sidecar 和本地 `TASK-SETTINGS-258/verification.json` 为准。只证明有限原版接收域，不代表 Monster2 现代实现完成。原运行环境为随游戏包的 **AIR 51.1.1.5**，SDK51.3.4仅编译/启动，不称为旧 Flash Player 实测。

## 可观察结论

1. 两个独立对象 `Monster2Bullet1_1`、`Monster2Bullet1_2` 均调用 `hit1`：原声明 power29、physics、interval999、max99。正常零防御无暴击时两次各扣29；同弹已接受目标不重复接收。不能把第二对象当作字典 hit2 的 power28/magic。
2. 英雄保护/几何拒绝不登记 ID，随后仍可以命中其宠物；宠物分支不以英雄接受为条件。英雄普通命中由 receiver 和 bullet 各追加一次 ID，宠物普通命中只有 bullet 追加；闪避接受但不扣 HP，宠物闪避也会在 receiver 追加 ID。
3. 原 `BaseMonster.Hit` 的 Boss 加6、魔花 getter 写回、getRealPower 的暴击及随机消费均执行原方法。英雄与宠物的随机消费顺序不同；英雄闪避为 `<=`，宠物为 `<`。物理伤害经原整数转换与防御后最少1，再进入实际 Role/Pet 覆写、盾/玄龟转移和原 HP 写入。
4. **无复活装备的英雄在该次命中致死时，原 destroy 同步销毁宠物并清空 myPet。** BaseBullet 随后读取实时 getPet，已为空，故该次不再给宠物伤害，也不减少宠物对应的 maxAttackCount。主人致死不等于宠物受击致死：后者保持 attachment，设置 dead、5×fps保护并扣一次 lifetime。
5. 原 Config 每次 checkAttack 构建未死亡英雄列表。单独置 `isReadyToDestroy=true` 不是该方法或 receiver 的拒绝条件；这是受控边界，不代表正式世界不会先清除 ready 对象。原生死亡状态、正常保护到期、两弹间隔与双 owner 序列分别保留。
6. 难度2 Bingo 仍按原分支执行，英雄返回true、保护fps；宠物原 AVM2 `returnvoid` 在 Boolean caller 得false。若英雄先致死并已清宠，根本不会调用该宠物分支。直接宠物 Bingo 与同场顺序因此必须分开。
7. hit2 聚拢继续没有伤害 producer。其裸 MC 暂停中继续、原 EXIT 移除、Tween 行为全部继承256/257，不因 power 字典增加伤害。

## 六段证据链

源码根为 `local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts/`；sidecar `/sources` 记录原文件/方法 hash、行号与精确片段边界。

| 段/合同 | 原局部与共享证据 | 等级、验证与反证 | 现代消费 |
| --- | --- | --- | --- |
| M2R-01 来源与两对象 | Monster2构造:12、doHi1_1:229/doHi1_2:248；BaseMonster.getRealPower:1990/Hit；BaseBullet.setRole/setAction | 交叉确认：真实构造+两对象接收、power/critical/Hit源变异；M2-01..09完整继承 | 现有Stage1Combat对Monster2仍是单activeAttack，需独立两对象owner |
| M2R-02 门与数值 | BaseHero.beMagicAttack:1208/countHurt:1514；BasePet.beMagicAttack:566/countHurt:779；五Role/35Pet reduceHp覆写 | 交叉确认：8480原生案例、独立expected；保护登记/闪避等号/随机顺序变异拒绝 | 复用HeroMonsterDamageReception/PetMonsterDamageReception及现有HP owner，不能新增sink |
| M2R-03 实际HP与清理 | BaseHero.reduceHp:795/destroy:2386/clearAllBullets:2366/clearPet:990；BasePet.reduceHp:865/destroy:1150；BaseRoleProperies/PetInfo原写入 | 交叉确认：原销毁方法实际执行；致死清宠与keep-retired-pet反证；显示/淡出仍是外围服务 | 原有公共接收结构存在同步清宠缺口，下一259先整改 |
| M2R-04 遍历与保护 | BaseBullet.checkAttack:225；Config.getPlayerArray:1122；BaseHero.isDead:2234；BaseObject.setYourFather及step保护倒计时块 | 交叉确认：162序列/6804世界态，P1/P2/双方×20/24/30；missing-pet/countdown/ready/source-dead等反证 | 每次接收后重新确认当前主人/宠物关联，不能缓存旧pair就持续伤害 |
| 空间与原生相位 | 257A verified manifest、392768碰撞例与10368相位；256原生首末检测 | 已有交叉确认输入。258只注入几何真/假和既定检测步6..19/21..40，不新增视觉或碰撞事实 | 保留234像素精确许可；不得将空显示帧当逻辑结束 |
| 现代映射/双验证 | 实际HeroPartyMonster3Reception、MonsterAttackReception、真实PetCombatRuntime与HP owner | 原源编译/AIR观察+独立Python预期；另两组现代反例是诊断，不是现代验收 | 259必须修同步退休；随后才能实施完整Monster2行为/空间/聚拢 |

本项纯行为不套UI Schema。新显示、空间或完整原场景事实均不从HP trace推导。

## 冻结范围与支架边界

- Stage1-2 Boss构造；40身份（五英雄、35宠物）×双owner×两对象×53输入=8480直接案例。输入包括防御28/29/30、盾28/29/30、HP临界、保护、闪避等号及两侧、暴击、魔花、Role3/5/凤凰动作、盾/转移与qlfj。无用魔防字段在物理两弹下保留为不影响结果的对照。
- Boss有效Hit=6，闪避等号样本显式采用miss56与roll0.5；首轮照用miss50导致阈值变异存活，已修正输入并全部重跑。未把未杀死变异计为通过。
- 162世界序列：三fps×P1/P2/双方×18模式，每组42步。原checkAttack/原Config/原HP/原同步销毁/原保护倒计时片段实际执行；**检测时刻与源死亡后停止第二次发射是256/257已证输入**，不是本项重新执行Monster2身体、PhysicsWorld或原MC的自然时钟。
- `WorldProbe`保留退休对象的观测引用，不让该引用重新参与getPet；英雄致死后的宠物HP不变、ready=true、sourceRole清空，依原同步方法。源死亡后的已发弹仍接受原getRealPower，不把源当前dead动作当伤害动作。
- 复用251的编译支架/原方法提取器/returnvoid恢复工具，**没有复用Monster3的伤害观察表**。所有生成文件位于258目录；旧源、旧251产物不改。258增加真实destroy链，不再沿用251的destroy记录服务。
- 接收输入为处理后的属性、有限技能/效果状态；全装备成长、复活装备、rj/tmc完整联动、多人网络、其他怪物、完整家族AI不在本域。Role3反伤接到外部source HP服务，不外推完整怪物反伤死亡流程。
- 动画、伤害数字、击退、淡出Tween、魔法武器和完整Scene生命周期仍是外部服务。保留已证254/255身体及257坐标合同；不能把本项hurt字符串当作完整原生动画验收。
- 原BasePet两处returnvoid由已安装FFDec对生成SWF恢复并核对，源SWF只读。Python LSP缺basedpyright，未安装；以实际Python/AS3编译、AIR运行与独立验收验证工具。

## 现有owner反证与交接

`tools/monster2-reception-owner-diagnostic.ts` 在实际party adapter、真实PetCombatRuntime和实际HP owner上调用共享checkMonsterAttackReception；以原Monster3已证碰撞场定位受控共同命中点，并显式传入Monster2 power29。这只是同步owner诊断，既不是Monster2像素验证，也不是自然Scene旅程。

P1/P2两例都复现：英雄1→0，宠物1000→977、session仍存在，remaining99→97；原258无复活致死序列要求宠物不再被该次访问，HP保持1000、remaining为98。现有 `heroPartyMonster3Targets` 在遍历前捕获pet/session，`receiveHeroMonsterDamage`只更新英雄HP，宠物端口的valid没有同步主人死亡检查；不能把251受控HP通过外推为这条销毁路径通过。**Monster2原版有限输入已齐；现有共享生命周期尚不适用。** 不修改251原有限域结果，不宣称其无销毁服务的世界序列能替代258。

唯一下一任务为 `TASK-SLICE-259`：先让既有共享owner消费这条同步退出/拒绝合同，并以真实双owner/正式路径证明；完成后再生成Monster2有界实现。此次不实现Monster2，不关闭204/all、194、VS-067或Active功能线。既有Monster3“完整接收生命周期”仅在这条新反例上降级，其他攻击/空间/数值证据保留。

## 联合输入承接

| 责任 | 权威输入 | 258处理 |
| --- | --- | --- |
| M2-01..09 | 256 reference完整9项 | 全部按依赖hash保留，不缩减自然选择、门、身体/源死/显式destroy |
| 三对象显示/实际profile/两弹像素 | 257A manifest与reference | verified保持，234像素精确许可不扩大 |
| 自然首末检测、空帧、裸MC暂停/EXIT | 256+257A | 受控schedule绑定已有合同；不把本项step替代自然时钟 |
| 聚拢lazy起点/世界竞争/twip/覆盖/暂停/退出 | 257B reference | 原hash继承；hit2依然无damage producer |
| 两普攻真实HP/去重/保护/致死清宠 | 258 sidecar `/direct`、`/sequences` | 原版有限域关闭；当前生产同步退休反例交259 |
| 正式两owner与可见旅程 | 未实施Monster2 | 259只关闭公共同步退休，随后生成Monster2实现；整线不关闭 |

已归并Luna只读输入与销毁链核对。主agent纠正初次报告“英雄接受后才打宠物”的概括；第二轮确认原实时getPet、Config仅滤isDead和真实销毁依赖，装备/网络/淡出边界保持。

## 复验与保留

```text
python tools/monster2-reception/validate.py
python tools/monster2-reception/finalize.py --write
python tools/monster2-reception/finalize.py
npx tsx tools/monster2-reception-owner-diagnostic.ts
```

`validate.py --existing`独立复核保存原生结果；`--resume`仅用于输入/工具未变化的中断续跑。首次必须实际编译运行，不能用既有报告跳过源变异。12编译变异中same-object-id是支架运行身份变异，其余为实际提取源方法变异；另有4 trace损坏和4 sidecar重建比对反例，不混计为源变异。baseline/repeat与每个mutant隔离目录，不覆盖正常结果。

Git交付精简sidecar、原方法提取/fixture/verifier与生产诊断入口。完整AS3/SWF/原pcode/日志在 `local-resources/regima/task-outputs/TASK-SETTINGS-258/`，报告在 `docs/tasks/evidence/TASK-SETTINGS-258/`；作为259及Monster2消费输入保留，待其完成再清理可再生中间文件。游戏构建/运行不依赖这些ignored证据，换机器源级复验需本地语料与已安装SDK/FFDec。

# TASK-SETTINGS-227：猴马补充行为输入

2026-09-21。227完成代码补证与后续输入边界交接，**不表示226或猴马完整复现完成**。226继续Blocked，228猴空间补证Ready、229马空间补证Planned；二者交付后恢复226。原207的41项、209的43项合同全部保留。

## 可复验产物

- `tools/monkey-horse-source/run.py` 从只读原AS3抽取方法，在原包AIR runtime执行；入口、命令、源文件/片段hash记录在本地 `docs/tasks/evidence/TASK-SETTINGS-227/source-trace.json`。
- `verify.py` 独立检查3,408个完整case集合，不导入现代代码、tuning或其测试常量。原包runtime由trace实测版本标识，不冒充历史Flash Player。
- `mutations.py` 实际编译并执行10类源变异，全部被verifier拒绝：learned、MP、lyq距离、hurt、phase、stun、随机边界、CD顺序、59999归零、碰撞判定。每个变异独立输出，正常trace前后SHA-256保持一致。
- `node tools/run-system-tests.mjs pet-226-preflight-probe` 采集实际现代Runtime/正式resolver；`compare_modern.py` 与前述源输出比较，**预期退出1**，43/43不符（16空间、3技能抢占、24相位）。这不是通过226验收。
- `generate.py` 生成本地 `behavior-contract.json`：84项原合同的精确JSON Pointer、129个原方法locator/hash、已原生执行与仅静态保留的区别、20个主要显示/效果对象的后续输入边界。该文件是纯行为证据索引，不是UI真值；未被生产源码消费，仍本地保留。

复验顺序：`python tools/monkey-horse-source/run.py` → `verify.py` → `mutations.py`；运行现代probe后执行 `compare_modern.py`（目前应拒绝），最后 `generate.py`。所有路径均从仓库根执行；AIR SDK和原语料是源级复验依赖，不是游戏运行依赖。

## 六段证据与MH逐项核销

原AS3根：`local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts/`。现代映射保持既有Runtime/Session/Behavior/正式桥，不新增owner。

| 项 | 局部及共享证据 | 227验证与结论 | 空间/视觉及后续 |
| --- | --- | --- | --- |
| MH-01 调度 | BasePet.step/AI/CD，八形态myIntelligence；MainGame→PhysicsWorld→BaseHero持宠step链沿207/209复用 | 原AS3实际执行20/24/30fps相位、59998后归零、错相位获取、hurt恢复、技能选择前CD；Math.random仅替换为可数的输入流。24组现代相位全部拒绝 | 226负责公共host tick与正式消费者，不是227已修复 |
| MH-02 命中 | BaseBullet.checkAttack→BaseMonster.beMagicAttack:847-879 | 直接执行原判定前缀，16组受控intersection/complexHit/alternate图层/force布尔组合；普通入口force=false时不相交不得命中。16组现代远距实际HP反例全部拒绝 | **不包含像素采样**。228/229生成源效果逐相位与目标colipse oracle；不能把布尔stub当真实HitTest图像 |
| MH-03/04 资格 | 八形态beforeSkill1..4；PetInfo.findPetUsedMagic | 原资格函数与原MP费用函数实际执行；距离0/49/50/100/101/250/251/399/400/401、MP0/19/20/29/30/1000、已学/未学、受伤flag，以及每形态256技能子集；猴未学抢占3例拒绝 | 本项无新几何；400是源码距离条件，采用受控轴向点，不宣称全空间碰撞 |
| MH-05 状态 | BaseObject.isAttacking/isBeAttacking，八形态override；BasePet.stun返回 | 原方法实际执行wait/hit1..5/hurt/hurt_1/afterHurt/dead；攻击集合随形态扩展，受伤/stun阻断AI。源step先私有bullet、AI、CD，再父step | 移动、动画完成/回调与effect服务在probe是显式sink，**没有验证全部动作持续/物理**。228/229交接原版body/effect时间轴与组合状态，226验正式消费 |
| MH-06 来源/清理 | BaseBullet:105-169,225-371,403-461,486-496；八形态doHit/回调；207/209 lifecycle合同 | 129方法静态inventory保留源hash，原来源/attackId/死亡等84合同未删；本批不声称P1P2生命周期重验。source hurt、disabled前置、延迟爆炸组合仍需后续 | 228/229按各弹体真实类和setter生成host phase/失效输入；226复验真实伤害、去重与释放 |
| MH-07 目标序 | BaseLevelListenering:103-104将obbsiteArray指向monsterArray；MainGame:567-573生成push；BasePet.searchTarget:1075-1085与AI:316-331 | 原生fixture证明先取首个距离合格对象，**不跳过dead**；下一AI清除dead且同tick不重选。子agent初版“first alive”被原函数和新增fixture纠正 | 现代五关/TestScene数据入口已定位为容器插入序，但逐关是否与原版生成顺序相同留给226实际消费者验收，不宣称逐关完整同序 |

探针中的attackRange、目标坐标、技能执行后动作、移动、auto-buff、动画与伤害结算是显式受控输入/sink，仅证上述源分支。真实构造数值、释放数值与动画事实继续引用207/209，不能从probe的默认150或固定24tick冷却推出原版每形态参数。

## 弹体差异与后续有限对象

原公共链：BaseBullet.step2先在非pause下step/checkAttack，再执行帧回调、末帧销毁和可选source-hurt销毁；FollowBaseObjectBullet.step2在super后补偿位置/方向。目标侧按attackId去重；setAction复制hitMaxCount/attackInterval。此处为静态源确认，真实逐相位绘制与清理组合将在228/229补证。

| 家族 | 源对象与特例 | 必须保留的边界 |
| --- | --- | --- |
| 猴 | 9个主要effect：PetMonkey1Bullet1/2、PetMonkey2Bullet1/2_1/2_2、PetMonkey3Bullet1/2/3_1/3_2；monkey4复用 | 普攻/lyq为Special；xj为Follow且关闭末帧销毁/source-hurt切断，4秒生命周期；lj前置disabled与伤害对象独立；jgaoyi五段回调、传送、xj与lj后写动作覆盖不能压为400ms定时 |
| 马 | 10个主要bullet：PetHorse1Bullet1/2、PetHorse2Bullet1/2、PetHorse3Bullet1/2/3/4、PetHorse4Bullet5/Explode；另PetHorseIceEffect | horse1.sp是Follow，horse2.sp为Special（虽复用同symbol）；bd为Follow并关闭source-hurt切断；奥义为EnemyMoveBullet，按学sp决定tracking，学bd加冰、学bz加爆炸且两者共存时延迟；不能按symbol统一推断弹体类 |

继承创建的AoyiBuff等附属对象需在228/229显示列表完整性核对中显式核销（复用既有真值或补取），不因上述“主要对象”清单而遗漏。原body与owner优先级复用193A/193C、207/209；主要恢复源为assets/20120203.swf、assets/pet1.swf、assets/StageCommon.swf。本批未修改这些文件。

现代消费入口：HeroPartyRuntimeBridge.updatePets把monsterTargets送入Runtime与正式resolver；Stage12 combatTargets、Stage13/21/22 Map.values以及TestScene monster30s.map均保持各自容器顺序。Stage1-1经TestScene兼容路径，不能捏造独立Stage11GameplayBridge。上述为实现映射，不是原版生成序oracle；226须分别输入可追溯的原关卡有序fixture。

## 恢复226条件

228与229分别交付本家族全效果/附属对象、完整host相位/失效与正式目标碰撞真值、源基准、独立oracle及变异。所有影响实现的未知项清零或有用户明确认可的精确例外后，才恢复226两族全部41/43合同加MH-01..07联合整改。207/209视觉事实不撤销，已有其他家族碰撞近似不外推。

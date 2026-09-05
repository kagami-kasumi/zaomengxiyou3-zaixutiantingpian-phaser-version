# 217 宠物地面环境真值交接

2026-09-05。环境证据批次完成，未修改src或现代可见资产。恢复 `TASK-SLICE-214C3` 执行公共地面移动接入；C3/C4/C5及父C2/C、青龙全家族合同均未因此完成。

## 权威输入与消费方式

- 几何唯一输入：`docs/reverse-engineering/ground-truth/manifests/task-settings-217-pet-ground-environment.json`，truthId=`task-settings-217.pet-ground-environment`，verified。五个源初始状态，43个墙、134个递归显示对象。`displayObjects` 中 `levelNN-dDEPTH` 为实际wall根，`placements[0].stageBounds` 保存未舍入仿射几何；`parentId/depth/localMatrix`保留完整显示树。
- 行为属性输入：本目录 `environment-properties.json`。以objectId指向同一manifest，附manifestSHA；不复制第二张坐标表。按每关 `collisionOrder` 遍历，分别消费through/throughDown/throughUp、isThroughWallClass、usesWallTolerance；不能只由现代platform.kind猜测。
- `environment-candidates.json`是生成器与独立源验证的审计中间表，**不是生产几何源**。C3不得从中再建立坐标owner。
- `source-contract.json`记录恢复主包与十个共享脚本的哈希、五关root初始化源与哈希、角色碰撞profile/原始变换精度、出生/warp/落地公式及双owner fixture。
- `verification.json`记录最终manifestSHA、独立输入和7类变异；源SVG是几何基准，PNG仅供视觉检查。FFDec PNG自带边缘填充，不能把PNG左上角直接当逻辑原点；manifest baseline.crop来自原SVG的根补偿矩阵，尺寸使用SVG原值，整数画布尺寸向上取整。

## 有限范围与源事实

| 场景 | Wall数量 | 范围/状态 |
| --- | --- | --- |
| sl11 | 20 | 3 ObsWall、15 ThroughWall、1 ThroughUpButDownWall、1 FallDownWhenStandingWall |
| sl12 | 4 | 3 ObsWall、1 FallDownWhenStandingWall |
| sl13 | 4 | 3 ObsWall、1 FallDownWhenStandingWall |
| sl21 | 8 | 3 ObsWall、4 ThroughWall、1 FallDownWhenStandingWall |
| sl22 | 7 | 3 ObsWall、3 ThroughWall、1 FallDownWhenStandingWall |

共6个旋转侧墙，原旋转角均为90°；其他墙为0°，没有本批实际斜坡。43个wall及其子树均为单帧。五关root构造只初始化StopPoint/MonsterAppearPoint参数，不写wall速度或注册frame脚本。四类墙都继承Wall，默认speedX/Y=0；FallDownWhenStandingWall没有下落事件或速度覆写，它的实际语义是isThroughDownButUpWall标记。旧“特殊墙状态可能需要动态模拟”预检在这些初始实例上已核定为静态，不需因类名新增移动墙系统。

`PhysicsWorld.addSubObj`按顶层显示顺序注册，旋转isWall使用unshift，其余墙push。不能把这些墙重新按坐标、距离或现代platform顺序排序。墙bounds必须取完整sprite；本批命名标记均无可见几何，但仍保留空marker对象和局部位置，不能从规则上假设以后标记永远不影响bounds。

本批只证明声明五关的源初始环境及直接初始化/监听器检查；不把未检查的外部技能造墙/任意速度修改列为已覆盖。C3当前静态轴对齐求解器可处理这43个初始wall；未来非0/90°或非零wall速度必须显式拒绝或进入独立实现，不能降格为静态AABB。

## 坐标合同

manifest保存原场景local坐标，没有加FFDec导出裁切补偿或camera scroll。现代Stage11世界使用既有 `STAGE11_SCENE_OFFSET_Y` 归一化；C3适配时给原wall坐标加该现代世界平移即可。其余四关保持现有世界坐标。原场景的相机/tween平移不改变同一gameSence内的碰撞关系；不得把原 `gameSence.y` 或SVG裁切补偿重复相加。

角色 `movement.y` 是现代脚点。原版落地公式为 `wall.top−0.1−colipse.height/2`，宠物初始出生为owner根 `(x,y−100)`，warp为 `(x,y−30)`。这些来自BaseObject/BaseHero/BasePet，并非视觉offset推断。双人使用同一公式、各自owner输入。

精度须分列：207的ObjectBaseSprite profile是FFDec导出49.95×99.95、registration(25,50)；恢复StageCommon二进制串联MATRIX的未舍入几何为49.999542236328125×99.9993896484375。前者对应既有导出profile落地偏移−50.075，后者的仿射公式结果为−50.09969482421875；现代视觉注册根偏移−50是另一合同。不能把三个数称为精确相同，也不能把仿射推导称为Flash实际运行捕获。C3应明确消费所选既有碰撞profile和原落地公式，并在trace保留该精度边界；本项没有更换猴/马/角色既有profile或批准新的现代可见例外。

## C3实现接缝与完整剩余项

1. 由既有关卡环境接口提供墙对象及原碰撞顺序；HeroPartyRuntimeBridge向每owner的PetCombatRuntime转发，TestSceneHeroPartyRuntimeBridge共用同一入口。Stage11/12/13/21/22不复制求解算法，也不拿hero travel bounds当宠物飞行/地面界限。
2. Session为主实体/私有实体各自保存方向、vx/vy及站立对象；AI/动作选择先于动画，动画完成先于setSpeed/碰撞/积分。normal/fs完成保方向、同tick恢复横移；hurt完成static+wait清方向/vx。hurt本身跳过整个setSpeed分支。
3. 普攻/技能/目标与follow每秒节拍仍依C3/preflight与BasePet源条件；出生与warp分开，瞬移后继续当tick物理。垂直owner差触发jump/drop时须用真实站立标记，不能将三类through合并。
4. C3仍必须运行20/24/30fps主子会话生产trace、地面/空中攻击恢复、hurt静止、P1GS与猴马/生产回归、build/structure/workflow/audit/diff。217源检查不能替代这些验收。
5. C4负责真实dragon1普攻/fs伤害治疗与来源链；C5负责正式投影、P1/P2生命周期与P1GC。父C2/C所有未完成标准原样保留。

## 可重跑命令

```text
python tools/generate-pet-ground-environment.py --refresh
python tools/verify-pet-ground-environment.py --promote
python tools/verify-pet-ground-environment.py
npm run check:workflow
npm run check:structure
npm run audit:problems
git diff --check
```

生成器同时选择性导出十个共享class及五个root到同名本地目录；没有FFDec时按项目规则由用户安装，不下载复杂软件。源SVG/PNG、XML和脚本全部从恢复源派生，legacy-extraction未写入。主agent唯一写文档/工具，子代理只读审计并在授权的source-audit目录派生root脚本，已归并为生成器可重跑步骤；其三项验证缺口均已归并修复。

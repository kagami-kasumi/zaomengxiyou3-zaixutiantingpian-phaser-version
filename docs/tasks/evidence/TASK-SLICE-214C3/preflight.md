# 214C3 公共地面移动消费预检

日期：2026-09-05。结论：实现未开始，214C3 Blocked；先执行同线 TASK-SETTINGS-217 补齐地面环境真值，再原样恢复214C3。本次没有修改 src、原始提取物或213/214A产物，没有发生compact。

## 已确认的源条件

源前缀：`local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts/`。主agent与只读subagent分别核对后归并；下列是源码事实，不是已通过的现代运行trace。

| 条件 | 精确证据 | 现代消费差异 |
| --- | --- | --- |
| 初始出生为owner根x、y−100；换宠重新初始化 | BaseHero.as:395,423-426,544-546,2561-2569 | PetRuntimeSystem.ts:11-12使用跟随横偏移和warp纵偏移，不能复用于原生出生 |
| 非攻击/受击时，距离owner根≥1000，warp到x、y−30，再继续当tick物理；无清方向/vy操作 | BasePet.as:174-182 | 当前以desired follow点测距，且没有地面物理 |
| AI→被动/CD→计数→warp→动画→非hurt setSpeed→碰撞→积分→重力→外力 | BasePet.as:160-182；BaseObject.as:165-181,527-529,601-610 | EntitySession当前先移动后动作，动画在末尾 |
| turn只改方向；setAction不清方向；setStatic清方向与vx | BaseObject.as:625-664,999-1008,1041-1043,1088-1092 | ground motion需每实体持久保存，不能由idle/walk每帧重新推导 |
| normal/fs完成仅wait；hurt完成static+wait；地面攻击停横移，空中保留 | PetDragon1.as:159-168,418-420；BaseObject.as:330-337 | 动画完成须在当tick setSpeed前消费；求解器hurt应跳过整个setSpeed约束，direction=0不等于无条件清vx |
| 新search帧不行动；旧目标失效帧不重选；每秒尝试点才follow/普通范围判断 | BasePet.as:314-375,1009-1044 | 搜索与技能分支不能合并；followRange为640，现有followMinDistance=64不是该合同 |
| owner垂直差还触发jump/getFallDown | BasePet.as:381-395,856-862,1133-1143 | 必须核对单向墙标记和站立输入，不能把through布尔当作所有特殊墙语义 |

角色根映射已有交叉证据：`docs/reverse-engineering/hero-combat-visuals-index.md:79` 和 `role1-combat-visuals-index.md:108`说明50×100碰撞根与现代footY−50；BaseObject.as:894-896、565/572说明半高与−0.1落地间隙，HeroMovementSystem.ts:232-240的现代脚点落在平台顶。后续优先复用现有宠物真值中的同名ObjectBaseSprite几何并核定角色调用，不能把BBDC body offset当碰撞根。不能仅因未找到独立hero JSON就声称几何资源缺失。

## 阻塞是环境合同，不是需要重新批准接口

| 生产入口 | 可直接复查的缺口 |
| --- | --- |
| HeroPartyRuntimeSystem.ts:49-52 LevelHeroEnvironmentSnapshot | 仅platforms/bounds；MovementPlatform只有left/right/top，没有原wall bottom、完整墙类型/动态状态 |
| HeroPartyRuntimeBridge.ts:269-282,381-418 | updatePets未转发environmentFor；owner.y仍为脚点 |
| TestSceneHeroPartyRuntimeBridge.ts:127-149 | movement/combat有environment，updatePets没有；P1/P2共享入口应一起补，不能只修legacy桥 |
| Stage12TraversalSystem.ts:16-22 | 单人工延展地面；Stage12Layout.ts:64-86实际还有侧墙/嵌套特殊墙，不能从平台顶猜墙厚或拿hero travel bounds夹宠物 |
| Stage11Layout.ts:109-125 | 创建MovementPlatform时过滤竖墙，并把非ObsWall合为through，丢失ThroughUpButDownWall与FallDownWhenStandingWall区别 |
| PetGroundMovementSystem.ts | 明确仅静态轴对齐分支，不覆盖移动墙/斜坡/enforceSpeed；独立测试通过不能证明上述生产环境完整 |

现有五关Layout和levels-index保存了矩阵/历史事实，但当前213宠物manifest及214A资源交接不提供五关wall完整空间状态真值。需要窄查恢复源 `assets/levels/level11.swf`、`level12.swf`、`level13.swf`、`level21.swf`、`level22.swf` 的原wall对象，并与主包共享墙类消费条件交叉核对；这已超出C3列出的宠物源输入，触发其“新资料族/资源派生先拆分”。这些文件已确认在恢复目录中存在，没有安装软件或请求用户材料的阻塞。

## 调度与保留合同

217只补环境真值/源条件和生产适配handoff，不修改玩法，不重新逆向整关、角色技能或其他宠物家族。完成后恢复C3，C3仍须完成全部公共接入、20/24/30fps主子会话trace、地面/空中攻击恢复、hurt静止、P1GS及生产回归。C4/C5与父C2/C全部合同原样保留；本次不能归档C3、不能激活C4或宣称青龙可玩。

六段证据：宠物局部/共享调用已窄查；空间环境存在上述明确缺环；可观察条件在本表冻结；现代owner维持Session/关卡环境接口；双重验证尚未执行。UI可见层与资源未变，不产生新的视觉完成结论。MO-003只记录实际消费差异，不增加第三家族成功样本。

## 本次验证与交接状态

- npm run check:structure：退出0，原9项warning；未改src。
- node tools/run-system-tests.mjs pet-ground-movement-tests：退出0，只证明原静态求解器基线。
- npm run generate:harness、npm run check:workflow：最终退出0；15项调度测试、annotations和关卡架构通过。首次发现Blocked说明字段/逆向协议引用缺失，修正并重新生成推荐后通过；原PlayerSlot命名warning保留。
- npm run audit:problems、git diff --check：退出0；集中结论见problem-audit.md。
- 未运行build/P1GS/正式浏览器：本次只有预检和任务拆出，无代码或资产变化，不能将未执行项记为本批实现验收通过。
- 下一执行项217，完成后恢复C3；当前功能线仍Active。无运行中的检查或服务、未commit/push。建议提交本次有界文档交接，后续新对话执行独立环境资料族。

# 214C2 公共移动接缝反证与待裁决范围

日期：2026-09-05。结论：214C2及父214C尚未完成；P1GS接缝成功不证明原版移动。未实现dragon1，未启动新任务，未改变原版资源或verified视觉产物。

## 可重跑反证

运行 `node tools/run-system-tests.mjs pet-dragon1-movement-preflight`，实际退出1。报告为同目录 `movement-preflight.json`。该探针不在默认测试链内，是明确保留的预期失败诊断，不能记作通过。

比较条件严格限制为无障碍地面、向右walk、非奔跑/受击/强制速度、范围外目标、一个host tick。213已有speed=5；只读AS3确认BaseObject以speed.x直接积分。现代公共chase在20/24/30fps分别移动22.5/18.75/15px，原版该条件均为5px。24fps差3.75倍。此结果不代表已经验证完整物理、原版运行或视觉差异。

一手路径前缀：`local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts/`。

| 合同 | 一手定位 | 当前缺口 |
| --- | --- | --- |
| 水平速度5，按host tick积分；y受重力/地面/墙约束 | `export/pet/PetDragon1.as:25,418-420`；`base/BaseObject.as:165-181,284-313,417-529,601-610` | `PetRuntimeSystem.chasePetRuntimeTarget`使用moveSpeed×90、二维归一化；Frame没有宠物环境碰撞输入 |
| 已存有效target且timeCount每秒尝试点才随机普攻；首次search帧不释放 | `base/BasePet.as:314-375` | 公共会话搜索后立即选择动作；不能把目标范围测试当作完整AI合同 |
| 分身初始技能/crit/被动字段默认值；随后自身每tick更新被动 | `petInfo/PetInfo.as:33-64,102-106`；`base/BasePet.as:153-160,399-402` | 临时clone需完整自身step，不能只复制根宠物所有字段 |

## 具体修复边界（待批准，尚未改变冻结设计）

1. 保留每slot一个Runtime、内部公共EntitySession、Registry和Behavior角色。向公共Frame提供只读host tick及宠物所在环境表面/墙输入，复用关卡已有碰撞数据；公共移动端口负责水平积分、垂直速度/重力、落地/墙和warp。Behavior只提供原版允许移动的动作约束，不能复制物理算法。
2. 公共会话保留search分支边界及每秒尝试点，青龙使用213的attackRate/speed/range；准确接入已有动作持帧、typed事件及原身/分身完整step顺序。若迁移影响猴马，保留现有成功行为作为回归对照，并逐项解释原版修正，不能靠修改expected维持绿灯。
3. 接着在同一214C原始范围完成dragon1普通弹、真实分身、实际来源伤害/命中治疗/自然到期治疗、P1/P2正式与TestScene视图；P1GC与940×590逐状态差异证据齐全后才归档。D仍不执行。

所需范围裁决：允许扩展公共Frame/环境移动接缝及其回归，纳入214C2承接原目标。当前214C2明确禁止“改变公共设计”，且列“若需要改变公共pet设计…停止新增实现并拆分”。AGENTS的具体系统设计路由也只由用户明确触发；因此这里仅列可审阅修复边界，不擅自冻结新设计或复制一套dragon物理绕过限制。

现有213视觉真值与214A资源没有因这个现代消费者反证失效；不整体降级、不重新提取。当前证据只能证明公共移动近似与源不符，不能证明整族44项已经通过或失败。

2026-09-05 后续裁决更正：用户已允许修正。此前把触及公共Frame/移动接口本身视作必须批准的公共重设计，是agent对自拟任务限制的过度解释；该等待条件撤销。保持既有设计角色，在公共移动owner内修复速度换算及必要实现接缝，继续214C2完整合同。原失败探针事实保留，尚无修复通过结论。

2026-09-05 速度修复结果：原×90已替换为实际hostFps，正式/TestScene P1/P2传入场景帧率；grounded一步探针在20/24/30fps全部5px，退出0。原失败实测保留在movement-preflight-before.json，当前movement-preflight.json为修复后报告。额外运行时钟、每宠物速度、主/子会话和变帧率测试通过。此结果只解除速度单位反证，尚不证明水平追踪、重力/地面/墙或完整dragon1战斗链通过。

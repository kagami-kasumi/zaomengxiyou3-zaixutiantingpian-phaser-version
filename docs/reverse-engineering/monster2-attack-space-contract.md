# Monster2 三对象空间与命中合同

`TASK-SETTINGS-257A`，2026-10-04。当前 **verified：用户明确接受冻结的234个精确碰撞像素例外**。257A完成归档；父257仍Split，257B成为唯一Ready。仅本项有限空间输入通过，不能据此宣称Monster2实现输入全部齐备。未改 `src/`、`public/`、256真值或原始语料。

机器真值：`ground-truth/manifests/monster2-attack-space.json`，`truthId=task-settings-257.monster2-attack-space`。配套 `reference/monster2-attack-space-contract.json` 保存资源、位场、实际目标、全相位映射和未解项。Schema通过与再生成一致不等于解除阻塞。配套JSON的 `emptyExtents` 用objectId/stateId显式标记28个 `emptyExtent=true` / `stageBoundsSentinel=true`；这些空extent的AIR坐标不得用于可见空间定位。

## 有限范围与结果

原版再续天庭1.1，恢复 `assets/1.swf`，AIR **51.1.1.5**；SDK51.3.4只编译/启动，不称为旧Flash Player实测。三个对象：char49/Monster2Bullet1_1/14帧、char34/Monster2Bullet1_2/20帧、char30/Monster2Bullet2/14帧。双向共96原生态、176显示对象，独立源闭包共21定义。

- 第一普攻14帧均保留原显示。第二普攻第6帧alpha为0，第7–20帧无child；它仍有20帧的原弹体生命周期，不能用可见alpha决定提前退场。
- 裸MC没有BaseBullet/checkAttack或伤害producer。原第14帧在ENTER/world仍挂载，在EXIT观测已移除；暂停、源死/销毁不等于停止该裸MC。保留256M2-01..09，不把本项空间数据扩成Tween插值或HP事实。
- 40个实际目标构造归为4个colipse profile；重新核对241构造继承/公共源/StageCommon哈希并原生实例化，目标树与原241一致。旧攻击位场和任何旧碰撞许可不复用。
- 两普攻冻结帧×双向×4profile×1444位置：中心/分离、四边缘13档×3沿边位置、20个twip相位、6个P1/P2平移、固定二维网格及5分数位置。范围在采样前写入fixtures，不按通过率删例；不宣称任意坐标等价。

| 攻击 | 原HitTest例 | 比较像素 | 命中布尔差异 | 候选像素残差 |
| --- | ---: | ---: | ---: | ---: |
| Monster2Bullet1_1 | 161,728 | 27,799,606 | 0 | 234例/234像素，用户精确批准 |
| Monster2Bullet1_2 | 231,040 | 6,756,792 | 0 | 0 |
| 合计 | 392,768 | 34,556,398 | 0 | 234例/234像素，用户精确批准 |

源位场与HitTest相同的独立交集ROI诊断：目标绘制差异0、攻击单独绘制差异234、两个独立绘制合成与原oracle差异0。残差来自攻击位场栅格化位置，不是目标构造或布尔命中差异；这不自动构成接受理由。原AIR `getColorBoundsRect` 的sole-origin规则保留，不能把任意非空像素视为true。

## 六段证据链

AS3根：`local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts/`。文件/方法、恢复SWF、生成物和原生日志哈希分别在256 reference、本项native及phase报告；结构化入口见sidecar `/attacks`、`/profiles`、`/phaseBindings`、`/stateBindings`。

| 段 | 证据、等级与边界 |
| --- | --- |
| 局部对象 | `export/monster/Monster2.as:229/248/267`、SpecialEffectBullet构造与step。两独立普攻、裸MC根复制偏移和原生命周期由256继承，当前真实原方法world采样复核。确认事实/交叉确认；不新增hit2伤害producer |
| 共享调用 | 原PhysicsWorld/Monster2/BaseBullet/SpecialEffectBullet/MainGame方法，原Hero/Pet目标colipse构造、HitTest/AUtils；`phase.py`在256明确服务边界上增加双向/受伤/拒绝与原生pose。真实CHECK入口780次已绑定；HP接收仍是服务，不称为原HP验证 |
| SWF空间 | `source.py`独立解析21定义的Place/Move/Remove、shapeBounds、父子depth/矩阵/alpha，推导逐态根与child边界；与原生树、96双向投影逐字段对账。实际mask/filter为空、blend正常；无按钮/文本。纯字段Schema不替代这些对账 |
| 可观察合同 | 20/24/30 host×hit1/hit2×normal/lethal/pause/destroy-after/hurt-after/reject×双向，10,368条ENTER/world/EXIT观测、6,906次pose比较、780 CHECK、36裸EXIT。出生无CHECK、下一世界步frame1、末帧检测后销毁；空显示帧照常保留生命周期。lethal是源效果伤害注入、hurt是源setAction调用；不证明真实目标承伤 |
| 现代映射 | 8个256消费者文件哈希保持。`Stage12MonsterVisualSystem.ts:142/215`仍有奇偶动作选择与5/20/7显示事件；`Stage1CombatSystem.ts:360/368/399/654`对Monster2仍使用activeAttack和水平范围。它们不是本项真值消费者，后续需与257B及真实HP补证一起交接 |
| 双重验证 | 原包AIR实测、独立XML/几何、原生扩大画布/PNG与重复；4真实编译碰撞/子树变异、2原生暂停/移除变异、18位场查询反例及字段/报告损坏拒绝。没有现代浏览器/正式Scene验收，不称为现代复现 |

## 显示清单与坐标语义

`/states`逐帧双向，`/displayObjects`递归到实际叶节点，保留原字符、父子/depth、局部矩阵、注册点、alpha、边界与资源引用。`/baselines`为原AIR舞台940×590，镜像施加于原wrapper，注册根(470,295)；不是图片中心。动态挂载、出生、暂停/恢复、源hurt/dead/destroy和EXIT由sidecar完整10368条 `/stateBindings` 表达；`stateIds=[]`表示该相位没有挂载显示，不复用最后一帧假装仍显示。

第二弹有两类需要分别保存的原API数据：

1. 24条嵌套观察中，源局部仿射与getBounds使用原小数几何；native `concatenatedMatrix` 平移在本有限域落到最近四分之一像素。二者分别写入 `attack2/source-display-list.json /concatenatedApiDifferences`；不把局部0.2强改为0.25，不由这项有限观察外推任意坐标。
2. 第7–20帧空树的28个双向stageBounds含AIR空范围坐标sentinel，宽高均0。原值在 `/emptyStageBounds`及native保存；它不是可见位置，消费者必须先处理空范围/emptyAlpha，不能把sentinel当对象注册点。

原目标英雄colipse横向1.2仅一次；父根变换、原HitTest独立ROI和目标构造均保存。每次检测的具体stateId在 `/phaseBindings`；不能把普通goto采样frame号直接当实际world tick。

## 视觉基准与差异

直接原生舞台图和独立1880×1180扩大画布直绘全部96态一致，扩大画布在940×590外alpha为0。采用原舞台栅格的alpha裁片生成可交接局部图，保存原点与PNG哈希；裁片还原对独立大画布 **零像素差异**。30个全透明态使用明确的透明裁片，不跳过状态。

曾尝试在另一局部原点重新draw：第一弹28态共494个变化像素，已拒绝该资源转换路径。原始local PNG及 `visual-verification.json /results/*/rejectedLocalRasterDifferentPixels` 保留；这与234个碰撞像素残差是两套不同数据，禁止混写。当前选用舞台裁片不需要现代视觉例外，也不宣称任意分数位置/Phaser重采样已验证。

允许的现代视觉例外：本项采用的裁片路径为空。碰撞例外：2026-10-04用户回复“接受例外”，仅批准冻结234像素；长期轻微视觉授权不用于碰撞。

## 未解项与裁决

2026-10-04用户明确回复“接受例外”。批准记录为 `docs/tasks/evidence/TASK-SETTINGS-257A/approved-pixel-differences.json`，绑定第一弹清单SHA-256 `4b687aee286e23f12ac902e27873d7fdbb7484d421129d5d3fe02384482e2e3d` 与第二弹空清单 `f67d68eb26b36f95b4adac581b318ea42f49fc3f395da9e01c73fc3a04a0fc73`。独立accept重算全部392768例并核对精确hash通过；命中布尔、伤害、时序没有放宽，不允许整fixture或新残差豁免。许可元数据也保存于随Git交付的reference sidecar。

许可获得后，257B仍需补原Tween与公共英雄坐标调度；256真实HP未知仍保留，并由父联合核销时判断同线代码补证。257A完成不能关闭父257、204/all、194、VS-067或Active功能线。

## 复验、反证与交付

```text
python tools/monster2-space-preflight/profiles.py
python tools/monster2-space/capture.py --attack 1|2|3
python tools/monster2-space/source.py --attack 1|2|3
python tools/monster2-space/verify.py --attack 1|2
python tools/monster2-space/capture.py --attack 1|2|3 --repeat
python tools/monster2-space/accept.py --attack 1|2
python tools/monster2-space/capture.py --attack 1|2|3 --visual-only
python tools/monster2-space/verify_visual.py
python tools/monster2-space/phase.py
python tools/monster2-space/phase.py --repeat
python tools/monster2-space/phase.py pause-raw
python tools/monster2-space/phase.py raw-no-remove
python tools/monster2-space/verify_phase.py
python tools/monster2-space/mutations.py
python tools/monster2-space/generate.py --verify
python tools/monster2-space/generate.py --verify --check
npm run check:ui-ground-truth -- docs/reverse-engineering/ground-truth/manifests/monster2-attack-space.json
```

`1|2|3`表示分别传数字，不是shell管道。首次verify产生诊断id，capture --repeat保存对应独立ROI图并验证case/树/PNG/位场一致。所有报告的真实变异与报告损坏区分：source-predicate/remove-child是四次重新编译运行；pause-raw/raw-no-remove是两次原生源调用变异；18查询、12源字段、5phase报告、132显示偏移及30空alpha反例属于独立验收负例，不混称源变异。source被删child、root矩阵/边界/可见性/混合变化、出生提前检测、裸效果提前移除或保留都必须失败。

`generate.py`默认生成blocked；只有存在绑定两份精确清单的用户批准记录时，`--verify`才允许晋升。`--check`比较逐字再生成结果。当前已获明确许可，独立重验及晋升再生成通过；本地 `project-checks.json`保存最终workflow/audit/结构检查。

本地完整原生输入在 `local-resources/regima/task-outputs/TASK-SETTINGS-257A/`，原oracle、phase、残差与报告在 `docs/tasks/evidence/TASK-SETTINGS-257A/`。保留三对象原PNG/扩大画布、源XML、位场、oracle缓冲、变异编译/日志供257B/正式消费复验，待Monster2正式消费后再评估清理；不依赖这些ignored证据运行游戏。工具与两份精简机器合同随Git交付。当前未删除历史输入。

失败与修正记录：初次Pose支架缺闭合括号已修复；本地重新draw并非零差异，改用原舞台裁片；根坐标独立核对识别了concatenatedMatrix量化与空bounds sentinel并分别保留；生成器路径拼接笔误已修复。上述支架/候选失败不计为通过的语义反证。Python LSP不可用，未安装软件；Python/AIR实际执行用于验证。TS消费者通过Codex LSP定位后精读，未修改生产文件。

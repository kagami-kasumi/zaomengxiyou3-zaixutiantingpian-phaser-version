# TASK-SETTINGS-222

任务类型：
- `TASK-SETTINGS`

任务模型：
- `逆向任务`

逆向子类型：
- `视觉真值逆向`

逆向方案：
- `docs/reverse-engineering/plans/ground-truth-fine-grained-generation.md`

功能条线：
- `LINE-PRE-STAGE-2-3-PRESENTATION`（Active）

目标机制/切片：
- `M-032`、`M-034`、`M-035`、`M-042`、`VS-012`、`VS-067`

规模预算：
- 主工作包：2
- 预计上下文压缩：0
- 独立验收批次：2

拆分触发：
- 两包为完整本体/效果逐态真值和相同对象碰撞采样；若新增独立资料族、研发新的Flash采样能力、目标colipse缺口或第三验收批次，执行前保留整族父合同，拆为同线连续补证任务。不得缩成单技能完成，不进入现代资源派生或正式实现。

协作计划：
- 模式：主 agent + subagent
- 模型分工：主agent唯一写入；按agent-protocol由Luna只读核对有限源对象/消费者集合
- 并行工作包：主agent提取时，子agent核对221期望状态和遗漏；独立结果可归并后再晋升
- 写入 owner：主 agent
- 归并检查点：提取范围冻结前、verified晋升前
- 方法观测：无；不自动重开已裁决方法

输入资料：
- `docs/workflow/reverse-engineering-task-protocol.md`、`docs/workflow/reverse-engineering-protocol.md`；视觉子类型与唯一方案的执行合同。
- `docs/reverse-engineering/pet-turtle-family-index.md`；`docs/tasks/evidence/TASK-SETTINGS-221/handoff.md`、`behavior-contract.json`、`coverage.json`、`visual-inputs.json`与源运行trace。
- 原版1.1主包AS3 `PetTurtle1..4`、`BaseBitmapDataClip`、`BaseBullet`、`SpecialEffectBullet`、`FollowBaseObjectBullet`、`BaseAddEffect.show_petturtle_buff`、`AssetsLoader`；仅为221动作/显示caller的精确补读，不重复整族代码逆向。
- 恢复 `assets/pet1.swf` 和 `assets/StageCommon.swf`，按221已定位的13个SymbolClass/character窄查。旧提取只作交叉对照。
- 218现有目标colipse/HitTest输入与219/220已有采样工具：仅核对可复用语义，不继承青龙像素近似许可；若新效果采样差异，显式阻塞相应合同。
- `docs/reverse-engineering/evb-extraction-report.md`、`docs/reverse-engineering/asset-annotation/workflow.md`、ground-truth Schema和上列唯一方案。

待证明的可观察问题：
- 本体每行每cell的真实像素/透明边界、注册点、方向、持帧、初入/退出/同row不重置如何投影为host tick？countdown10回调真正发生在哪个host tick？
- 普攻、SLD、SYBH、双owner链接buff和奥义buff有哪些递归显示对象、mask/filter、末帧/循环和动态follow/scale语义？哪个恢复owner在实际load顺序中获选？
- 四类攻击与原目标colipse在命中/几何miss/边缘/重复及四阶持续范围中的原始绘制交集是什么？不能用联合bounds代替像素命中。

有限范围与fixture：
- 本体 `PetTurtleBmd1..4`；每形态全部声明行/cell（221 `/forms/*/rowFrameCounts` 和 `/rowHolds`），wait/walk/hurt/dead/hit1/hit2及三四阶hit3；双方向/P1-P2源根，940×590原版基准。
- 效果 `PetTurtle1Bullet1`、`PetTurtle2Bullet1`、`PetTurtle1Bullet2`、`PetTurtle3Bullet3`、`PetTurtle2Buff`、`AoyiBuff`：所有帧及嵌套动态帧；三阶SYBH scale1、四阶scale2、奥义5秒跨末帧，SLD follow owner移动/转向、hurt不断。
- `ObjectBaseSprite`、`ObjectBaseSprite3`、`ObjectBaseSprite4`作为宠物碰撞源；目标碰撞优先复用218已verified同源对象，逐项证明适用性。
- 动态组合：TXLJ双方buff、SLD自疗及链接同步表现、奥义8种已学组合的0/2/4/5秒与dead/rest/destroy状态。原生1009缺陷只记录，不制造现代错误。

输出产物：
- `docs/reverse-engineering/ground-truth/manifests/task-settings-222-pet-turtle-family.json`：独立expected/extracted集合、递归显示列表、owner/hash/locator、坐标/矩阵/alpha/mask/filter、逐状态时间线与baseline。
- `docs/tasks/evidence/TASK-SETTINGS-222/`：原版可重放基准、状态/字段覆盖、采样适用矩阵、独立语义/像素verifier和mutation结果；大体积中间文件放忽略的task-outputs。
- 221全部32合同×本批视觉合同×未来Runtime/正式消费者矩阵；为资源准备和正式实现生成有界接续task，不丢弃普通攻击、任何可学技能、P1/P2或生命周期。

完成定义：
- 全声明视觉/碰撞范围verified，影响后续资源/行为消费的unresolved为零；本task仅关闭视觉证据，不宣布玄龟现代复现或P1门禁完成。

验收标准：
- 原SWF二进制/独立运行来源交叉核对；逐状态原版基准、真实时间线和注册点，不用现代截图反充原版。
- Schema、独立完整性与generator重复生成通过；state/source/owner/timing/scale/mask/collision变异必须拒绝；现有近似许可不得跨族沿用。
- UI/视觉显示列表、原版基准、允许现代例外（默认无）和后续逐态差异合同齐全。
- check:workflow、check:annotations、audit:problems、git diff --check及新增专项通过；原始提取不变。

禁止范围：
- 不改src、现代atlas、战斗公式、存档或系统设计；不逆向另一个家族；不提前进入194。

状态更新：
- 完成后归档222，生成同线有界资源准备/正式实现接续任务；TASK-ARCH-204和VS-067继续未完成，整族全部32合同与本批视觉合同最终联合核销。

推荐后续任务：
- 根据实际输出生成玄龟完整资源准备与正式Runtime实现任务；实现须真实五关/TestScene/P1-P2普通攻击和全部技能、盾后转嫁/治疗、反击、换宠/休息/死亡/重试/返回/重载清理，正式运行验收后才关闭整族。

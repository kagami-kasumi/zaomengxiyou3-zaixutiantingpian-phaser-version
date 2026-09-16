# TASK-SETTINGS-222A

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
- 第一包为全部本体/效果/碰撞源的逐态视觉提取；第二包为原生host-tick动态组合采样与验证。若需新资料族、完整虚拟机研发或第三验收批次，保留父222全范围并在实施前再拆；不得以根帧去重或缩减技能绕过未知。

协作计划：
- 模式：主 agent + subagent
- 模型分工：主agent唯一写入；Luna只读核对221期望集合、源映射与采样遗漏
- 并行工作包：主agent提取时，子agent从221独立生成覆盖差异
- 写入 owner：主 agent
- 归并检查点：状态冻结前、视觉晋升前
- 方法观测：无

输入资料：
- 父 `TASK-SETTINGS-222.md` 的完整范围及 `docs/tasks/evidence/TASK-SETTINGS-222/preflight.md`、`source-preflight.json`。
- `docs/reverse-engineering/pet-turtle-family-index.md`；221 `handoff.md`、`behavior-contract.json`、`coverage.json`、`visual-inputs.json`与源trace。
- 恢复 `assets/pet1.swf`、`assets/StageCommon.swf` 的13已定位符号；221声明的本体/效果/AssetsLoader/FollowBaseObjectBullet精确AS3调用。只补读视觉caller，不重做整族代码逆向。
- reverse-engineering-protocol、`docs/workflow/reverse-engineering-task-protocol.md`、evb-extraction-report、asset-annotation/workflow、ground-truth README/Schema和唯一方案。
- 219/220原生采样工具仅作结构参考；不继承其symbol、mask、帧周期、scale或近似许可。

待证明的可观察问题：
- 四本体全行/cell/持帧/初入退出/同row不重置/countdown10如何落到host tick？
- 全部效果当前递归帧、注册点、透明像素、mask/filter/矩阵和实际load owner是什么？
- 18帧根内30帧child在持续五秒时怎样推进/重置？follow移动/转向/hurt和双方buff如何在原生运行投影？

有限范围与fixture：
- 全13符号原样承接父222：PetTurtleBmd1..4；PetTurtle1Bullet1、PetTurtle2Bullet1、PetTurtle1Bullet2、PetTurtle3Bullet3、PetTurtle2Buff、AoyiBuff；ObjectBaseSprite、ObjectBaseSprite3、ObjectBaseSprite4。
- 四本体全部221声明行/cell；双方向/P1-P2根、940×590基准，全部效果帧和递归动态帧，SYBH scale1/2与奥义跨末帧。
- TXLJ双方buff、SLD移动/转向/自疗链接同步/hurt不断；奥义8种已学组合0/2/4/5秒和dead/rest/destroy。逐host-tick记录实际child时钟及增删；不得仅用symbol/rootFrame去重。原生1009缺陷记录为缺陷，不制造现代错误。

输出产物：
- `docs/reverse-engineering/ground-truth/manifests/task-settings-222a-pet-turtle-visual.json`，声明仅视觉范围；expected/extracted独立、递归显示列表、源hash/owner/locator/矩阵/alpha/mask/filter/注册点、host-tick时间线与baseline。
- `docs/tasks/evidence/TASK-SETTINGS-222A/`：原生基准、覆盖、独立verifier、变异结果和交接。大批采样中间物进忽略的task-outputs。
- 221全部32合同×视觉项×222B碰撞待验×未来消费者矩阵，不因视觉不适用而丢弃行为合同。

完成定义：
- 父222全部视觉范围verified、视觉消费unresolved为零；碰撞采样明确留给222B，不晋升父222整体。

验收标准：
- 恢复二进制/独立原生运行交叉核对；完整940×590原版逐态基准，不用现代截图充源。
- Schema、完整性、重复生成通过；state/source/owner/timing/scale/mask变异必须拒绝；同根帧不同child状态能被区分。
- 原版显示列表、现代例外（默认无）、未来逐态差异合同齐全。
- check:workflow、check:annotations、audit:problems、git diff --check及视觉专项通过；原始提取不变。

禁止范围：
- 不改src、现代atlas、公式、存档、设计；不研发碰撞采样算法、不宣布碰撞verified；不逆向其他家族。

状态更新：
- 完成归档222A，激活222B；父222仍Split，204/VS-067/玄龟仍未完成。

推荐后续任务：
- `TASK-SETTINGS-222B`，以本批完整原生视觉时间线为碰撞fixture输入。

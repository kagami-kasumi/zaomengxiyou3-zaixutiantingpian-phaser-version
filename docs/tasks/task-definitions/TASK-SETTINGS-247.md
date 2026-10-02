# TASK-SETTINGS-247

任务类型：`TASK-SETTINGS`

任务模型：`逆向任务`

逆向子类型：`代码逆向`

逆向方案：不适用；沿用代码逆向六段证据链，不加载视觉真值方案。

功能条线：`LINE-PRE-STAGE-2-3-PRESENTATION`（Active）

目标机制/切片：`M-030`、`M-034`、`M-042`、`VS-067`

要解决的问题：204承接的226原84公共责任中，232只动态核实Monster30，240只消费其两条owner；其余11类型与人偶仍未闭合。本项限定Monster3身体及两个独立攻击对象，不能把Monster30顺序、出生、命中和死亡清理规则直接推广。

规模预算：
- 主工作包：2（Monster3局部六段行为链；原方法/恢复SWF动态对账与消费者交接）
- 预计上下文压缩：0
- 独立验收批次：2（源合同及独立动态样本；反证/重复与消费者缺口）

拆分触发：
- 出现其他怪物类型、共享碰撞算法研发、独立视觉/空间真值缺口或生产实现需求时，仅记录确切缺口并生成同线有界后续，不把它们夹带进本项。
- 已有真值不覆盖所需命中几何时，行为trace明确标注受控碰撞服务；禁止以sink冒充真实目标HP或像素碰撞等价。

协作计划：
- 模式：主agent + 有界subagent。
- 模型分工：主agent负责证据结论与唯一写入；Luna只读核对Monster3两个发射路径和正式消费者。
- 并行工作包：局部源码/消费者清单，返回源locator、事实/推断/未知及遗漏；主agent同时推进原生fixture。
- 写入 owner：主agent。
- 归并检查点：动态采样前、验收前。
- 方法观测：无。

输入资料：
- `docs/workflow/reverse-engineering-protocol.md`六段链与`local-resources/regima/legacy-extraction/README_extract.md`。
- `docs/reverse-engineering/monster-body-attack-lifecycle-contract.md`、232 caller-map/消费者矩阵及240验收；仅复用其明确适用的公共输入。
- `docs/reverse-engineering/evidence/TASK-SLICE-226-contract-coverage.md`与204剩余责任。
- 旧AS3窄入口：`local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts/export/monster/Monster3.as`（232记录SHA256 `3e094ce63f532cd906f5262e071fa5c33ddaa7414742d9b502f6dd8ed3774629`）；两发射点Monster3Bullet1/2、magicBulletArray与destroy，沿实际调用窄读BaseObject/BaseBullet/BBDC/World消费者。
- 原始命名SWF、SymbolClass、MovieClip优先在`local-resources/regima/source/restored-swfs/`窄查。真实消费者先核对TestScene/Stage1-1、Stage1-3及232矩阵，不凭名称推断完整关卡覆盖。

输出产物：
- Monster3身体→发射→独立对象→命中/目标效果→死亡/销毁→世界/消费者的六段证据链，逐条标注verified/推断/未知。
- 可重复原方法和恢复SWF动态fixture、独立expected与机器可读行为reference；分别记录两个攻击的出生坐标/方向、首次更新/命中、运动/持帧、HP死亡与destroy、hurt/冰火/暂停及parent/数组清理。
- 正式消费者映射、现代差异和有界下一task合同；几何/视觉输入缺口显式保留。

完成定义：Monster3两个独立攻击的原版行为及适用边界可复验，足以判断下一步是有界补证还是消费；本项不修改src，不声明现代怪物或原84整体完成。

验收标准：
- 源SHA、构造/调用/消费链完整；两个攻击均有原版动态样本，20/24/30fps、双目标owner、同帧致死/非致死、源HP死亡/显式destroy、暂停与重复发射按实际可达分支核验，不自行补事实。
- 恢复SWF时间轴事实与AS3行为分别核对；仅有受控服务时不宣称完整场景、真实碰撞或真实HP验证。
- 原编译方法变异必须拒绝错误身体/效果顺序、提前首次命中、错误源死亡清弹、重复发射或该源实际对应的等价错误；独立reference损坏也应拒绝，保留反例与失败原因。
- 重复生成结果稳定；后续消费者输入、缺失真值和禁止外推范围明确；check:workflow、audit:problems及相应证据校验通过。

禁止范围：不修改原始提取/恢复SWF；不实现生产怪物，不重新设计系统，不扩展其他11类型/人偶或关卡；不把232 Monster30动态证据当Monster3证据；不关闭204/all/194/VS-067或功能线。

状态更新：Ready（2026-10-02；245B及父245完整验收通过，承接204剩余Monster3原版证据缺口）。

推荐后续任务：依据本项结果生成同线Monster3有界输入补证或公共消费task；继续保留其他类型、人偶和原84未完成责任，不预先承诺全部复现。

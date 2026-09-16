# TASK-SETTINGS-222B

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
- 两包为原版HitTest oracle和独立采样器/变异验证；若目标colipse缺失、新增资料族、完整Flash栅格器研发或第三验收批次，保留全族合同并拆出同线补证。非零差异不继承219近似许可，不硬写verified。

协作计划：
- 模式：主 agent + subagent
- 模型分工：主agent唯一写入；Luna只读核对目标适用性及父合同覆盖
- 并行工作包：主agent构造采样时，子agent核对218源映射和222A独立状态集合
- 写入 owner：主 agent
- 归并检查点：fixture冻结前、父222核销前
- 方法观测：无

输入资料：
- 222A已完成：`docs/tasks/evidence/TASK-SETTINGS-222A/handoff.md`、`acceptance.json`、`expected-visual-states.json`、`contract-visual-consumer-matrix.json`；完整视觉manifest为verified。原生24fps，未裁切RGBA及递归child相位必须保留。
- 父222完整合同及 `docs/tasks/evidence/TASK-SETTINGS-222/preflight.md`；222A verified视觉manifest和原生host-tick基准/交接。
- 221行为合同、coverage、家族索引与碰撞/去重/caller精确源切片；恢复pet1/StageCommon同源13对象。
- 218 verified目标colipse/HitTest及219/220 oracle/field工具，仅复用经证明适用部分。
- reverse-engineering-protocol、`docs/workflow/reverse-engineering-task-protocol.md`、evb-extraction-report、asset-annotation/workflow、ground-truth README/Schema及唯一方案。

待证明的可观察问题：
- 两种普攻、SLD和SYBH的原始绘制交集与几何miss、alpha边缘、子像素相位、重复命中及四阶持续范围是什么？
- effect scale1/2、双方向、P1/P2根移动转向、动态child相位与五秒持续如何形成可重放独立碰撞输入？
- 218目标是否与当前正式怪物colipse同源，源根/target scale/坐标空间是否逐项适用？

有限范围与fixture：
- PetTurtle1Bullet1、PetTurtle2Bullet1、PetTurtle1Bullet2、PetTurtle3Bullet3全部222A已证帧/递归相位；四阶SYBH scale2，三阶scale1。
- 复用218原目标的源哈希/定义/消费者映射逐项验证；宠物ObjectBaseSprite、ObjectBaseSprite3、ObjectBaseSprite4保留原几何，不能与怪物目标集合混同。
- 双方向/P1-P2、命中/disjoint/几何miss/四边/子像素/重复，SLD follow轨迹和hurt不断，奥义8组合0/2/4/5秒、dead/rest/destroy。碰撞不适用的buff状态显式列为N/A并保留222A视觉引用。
- expected fixture在采样前冻结；native oracle与候选sampler独立；目标不能只摆在效果中心制造命中。

输出产物：
- `docs/tasks/evidence/TASK-SETTINGS-222B/`：fixture、原生HitTest/像素oracle、独立采样器、适用矩阵、差异与mutation报告、父合同联合核销。
- 父预定 `docs/reverse-engineering/ground-truth/manifests/task-settings-222-pet-turtle-family.json`：引用222A视觉与本批碰撞稳定输入，保留所有溯源/显示列表/基准，满足Schema；不可只写一份链接索引代替完整合同。
- 221全部32合同×222视觉/碰撞合同×未来Runtime/正式消费者联合矩阵与有界资源准备/实现接续task。

完成定义：
- 父222全部声明范围verified、影响资源/行为消费的unresolved为零；不宣布玄龟现代复现或P1完成。

验收标准：
- 原SWF二进制、原版HitTest运行与独立采样交叉核对；非零残差显式阻塞对应合同，未经用户许可不近似。
- 全期望状态/字段覆盖、source/owner/state/timing/scale/mask/collision变异拒绝；Schema及重复生成通过。
- 222A原版视觉基准和逐态差异合同完整引用；视觉与碰撞范围不能互相代替。
- check:workflow、check:annotations、audit:problems、git diff --check和本批专项通过；原始提取不变。

禁止范围：
- 不改src、现代atlas、战斗公式、存档或设计；不逆向其他家族、不进入194；不放宽219/220适用范围。

状态更新：
- 全部核销后同次归档222B与父222，按预算生成唯一Ready资源准备及Planned实现接续task；TASK-ARCH-204、VS-067继续未完成。

推荐后续任务：
- 根据本批全族输出生成玄龟完整资源准备/正式实现；全部32合同及视觉碰撞合同最终联合核销后才关闭家族。

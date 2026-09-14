# TASK-SLICE-214E

任务类型：
- `TASK-SLICE`

任务模型：
- `常规任务`

逆向子类型：
- 不适用

逆向方案：
- 不适用

功能条线：
- `LINE-PRE-STAGE-2-3-PRESENTATION`（Active；Ready，220已解除trigger碰撞输入阻塞）

目标机制/切片：
- `M-032`、`M-034`、`M-035`、`M-042`、`M-044`、`VS-067`

规模预算：
- 主工作包：2（本项战斗链实现；同源消费者与验收）
- 预计上下文压缩：0
- 独立验收批次：2

拆分触发：
- 若需要改变公共 pet 设计/存档 schema、新增逆向资料族、第三独立工作包，停止新增实现并拆分同线承接项；不得削减父级合同。

协作计划：
- 模式：主 agent + subagent（有独立有界验证包时启用；否则串行）
- 并行工作包：由 subagent 只读核对本项原版合同或差异证据，主 agent 同时推进实现；派发前记录精确输入与输出，不增加主工作包总数
- 写入 owner：主 agent
- 归并检查点：战斗链实现后、正式验证前
- 方法观测：`MO-003`；仅记录当前实际差异，最终整家族验收前不计成功样本。

输入资料：
- `docs/tasks/evidence/TASK-SETTINGS-220/handoff.md`、verified trigger collision-contract与runtime-mask-pack：48帧/96方向状态，11520原版case和78373320像素零差异；不继承219近似授权。
- `docs/tasks/task-definitions/TASK-SLICE-214B.md` 的完整 44 项合同、UI 原生化合同、时钟修正和 compact 检查点；父级合同未完成，最终由 214E 全量关闭。
- `docs/tasks/evidence/TASK-SLICE-214D/handoff.md`、source-contracts及P1GD交付；`docs/tasks/evidence/TASK-SLICE-214A/handoff.md`、213 verified 真值和 source evidence。
- `docs/architecture/system-designs/pet.md`（实施中）；当前公共 Runtime/Behavior、Projectile/正式伤害、HeroPartyRuntimeBridge、TestScene 消费者。

输出产物：
- 接入 dragon4 全继承技能、qlaoyi trigger/真实分身/连锁；闭合四形态全部 44 项合同及 pet P1G。
- source-isolated trace、逐状态 940×590 原版/现代差异及可重跑测试，落在 `docs/tasks/evidence/TASK-SLICE-214E/`。

UI 原生化合同：
  - 用户2026-09-13实际观察后认可当前效果，明确无需严格坐标对齐；后续以可见效果与玩法体验为重点，不仅为逐像素/严格坐标一致扩大补证。保留已有差异的真实标注。
- 直接继承 214B 的显示列表清单、verified 机器真值、原版基准与允许例外；只消费 214A 生产查询，不复制坐标表。视图不得拥有另一套战斗状态或场景技能直连。

完成定义：
- 四阶青龙奥义与全家族验收在正式游戏与 TestScene 同源可运行，有真实命中/HP delta/heal/cleanup 证据；只关闭本项覆盖，不提前宣称整家族完成。

验收标准：
- qlaoyi 30 MP 只门禁不扣除，第 1/13/25/37 enter 回调和 left/right/left/right；全家族正式五关/TestScene、P1/P2、换宠/休息/retry/return/reload 与 P1G。
- 消费 213 倒计时时钟与完成路由，持帧/动作/命中对应，不以 isolated mock 或动画播放替代真实链。
- 新增与本项范围相符的设计 gate 并执行 `npm run check:system-design -- pet P1G`；退出码必须 0，范围不覆盖的父级项保持未完成。
- 真值/资源检查、相关行为/动画/正式旅程与反馈回归、build、structure、annotations、workflow、problem audit、diff check 通过；正式 940×590 P1/P2 可见链、清理与 console warning/error 为 0。

禁止范围：
- 不跨宠物家族、不改变原版数值或公共设计、不新增资源派生，不执行 215。不得把真实分身改成视觉假对象，也不得复制公共移动/目标/生命周期算法。

状态更新：
- 更新本项覆盖、设计验收矩阵、机制/切片、任务/功能线记录；激活 `TASK-SETTINGS-215` 后结束本项。

推荐后续任务：
- `TASK-SETTINGS-215`。

执行记录（2026-09-14 输入预检）：
- 主 agent 核对生产碰撞消费者与213/218/219范围；Luna只读核对PetDragon4及共享弹体调用链，主agent为唯一写入owner，归并点在实现前。详见 `docs/tasks/evidence/TASK-SLICE-214E/preflight.md`。
- 48帧PetDragonBullet4视觉文件存在且哈希一致，但219只覆盖二三阶四效果，不含奥义trigger。其原版逐帧碰撞采样是第三独立逆向工作包，命中本项拆分触发；本次不新增战斗实现。
- 本项Blocked，同线TASK-SETTINGS-220唯一Ready补trigger输入，通过后恢复本项。完整44合同、P1G、正式/TestScene及最终归档合同全部保留；215/216不抢占。
- 视觉体验验收沿用用户无需严格坐标对齐的偏好；不把219仅限四效果的碰撞近似授权外推到新对象。尚未运行P1G或证明四阶完成。

阻塞原因：
- 已解除（2026-09-14）：220交付本对象独立原版输入，214E恢复Ready。上方预检为历史事件；本项实现/44合同/P1G仍未完成。

最终关闭合同：
- 必须全量执行 214B 的 44 项合同与全部最终验收，包括全系统检查和 P1G；全部通过后归档 214E、214B 与 214，修复 handoff verifier 的持久合同读取位置，才可激活 215。

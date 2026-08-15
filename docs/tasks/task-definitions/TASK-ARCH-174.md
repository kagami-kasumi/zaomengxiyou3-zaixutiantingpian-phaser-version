# TASK-ARCH-174

任务类型：

- `TASK-ARCH`

功能条线：

- `LINE-CORE-PROGRESSION-COMPLETION`（Active；当前唯一 Ready）

目标机制/切片：

- `M-022`、`M-034`、`VS-062`

规模预算：

- 主工作包：2
- 预计上下文压缩：0
- 独立验收批次：2

拆分触发：

- 若共享几何 owner 需要迁移技能弹体或怪物弹体，或 Role5 修复要求改变两个以上伤害结算系统，立即限制为普通攻击并拆出同线下一 task。

协作计划：

- 模式：单 agent
- 并行工作包：无
- 写入 owner：主 agent
- 归并检查点：不适用
- 方法观测：无

输入资料：

- `docs/workflow/reverse-engineering-protocol.md`、`projectiles-index.md`、Role5 战斗视觉/行为索引及对应 AS3/SWF 局部。
- `HeroNormalAttackGeometry.ts`、`HeroCombatVisualCoordinates.ts`、`Role5NormalAttackProjectileSystem.ts` 与共享敌方伤害结算 owner。
- 复评确认项 M5、M7；M6 不作为本 task 的已证缺陷。

输出产物：

- 为四个世界特效普攻建立唯一前向距离/局部 offset 数据 owner，几何和视觉投影共同消费，并以跨消费者一致性测试防止再次双份声明。
- 按原版二维碰撞/命中语义修正 Role5 龙魂剑移动弹体，移除 X-only 命中；伤害、防御、击退、死亡和奖励继续委托既有共享结算 owner。
- 对适用空间事实生成或消费 verified 机器真值 JSON，并增加 X/Y 边界、重复命中、敌人死亡、P1/P2 和重入回归。

完成定义：

- 普攻几何只存在一个权威常量源，视觉锚点和碰撞投影不能独立漂移。
- Role5 移动弹体不会命中 Y 轴完全分离的目标，也不再复制完整敌方结算逻辑；已确认伤害和时序不变。

验收标准：

- 修改前运行 `npm run check:structure`；目标文件 error 先拆分。
- 共享几何一致性、Role5 二维命中与伤害委托专项、`npm run test:systems`、`npm run build`、`npm run check:workflow`、`npm run audit:problems` 和 `git diff --check` 通过。
- 940×590 代表关卡验证近/远、上下错位、多目标、死亡与重入，console 无 warning/error。

禁止范围：

- 不统一所有角色视觉 origin，不把 M6 的观察直接当 bug 修复。
- 不改变技能弹体、怪物弹体或已确认伤害数值，不建立第二个伤害 owner。

状态更新：

- 更新本线覆盖台账、task-board/task-history、`M-022/M-034`、`VS-062` 与适用 PG 审计。

推荐后续任务：

- 恢复本线覆盖台账中的下一未关闭任务。

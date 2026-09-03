# TASK-SLICE-212 运行验收

日期：2026-09-02。

## 自动语义证据

- `combat-feedback-tests` 证明只有唯一、已接受且形成实际 HP decrease 的 `DamageEvent` 才进入反馈；miss、0、amount/delta 不一致、重复 attack id 和 dead target 均为零输出。
- 同一模型累计 P1/P2 的 Role、宠物与法宝直接命中；持续效果显示普通数字但 `incrementsCombo=false`。六项同时命中按 211 的五项扇出和两 host tick 节流出队。
- 2/9/10/99/100 位数布局、40-host-tick 相邻快照清零、`highestCombo` 保留以及结果页消费均由专项与结果页测试覆盖。
- 运行时断言直接消费 `task-settings-211.combat-hit-feedback` 的 `verified` 状态、23 个状态、53 个显示对象、零 unresolved；71 个选择性导出资源全部存在。原版 30fps host tick 独立于 Phaser 渲染帧推进五帧 pulse、队列节流与 40-tick 清零。

## 940×590 正式 P1/P2 验收

- URL：`http://localhost:4174/?qaStage=1-2&players=2&qaPetHorse=4&qaCombatFeedback=1`。
- 正式 `Stage12Scene` 中 P1 Role 普攻与 P1/P2 horse4 projectile 同时形成原版普通伤害位图；同一固定 HUD Batter 面板累计至 22，未按 owner 镜像或拆分。
- localhost-only 只读轨迹记录 `eventId/source/ownerSlot/targetId/amount/critical/incrementsCombo`。本次可见样本含 `p1-normal-*`、`p1-pet-horse-4-*`、`p2-pet-horse-4-*`，每项 `queuedEventCount=0` 且 amount 与实际目标 HP delta 一致。
- 验收中发现恢复帧 PNG 为 315×315 滤镜画布，而原版显示 bounds 为 175×175；现代 view 已按 `175/315` 缩放，最终数字中心、50px 位距和 Batter 根锚点与 211 基准一致。
- 浏览器 console warning/error 为 `0`。暴击字形、法宝与 effect 参与矩阵由确定性测试及 TestScene 共享命中入口覆盖，未以随机试玩结果替代语义证据。

## 生命周期与边界

- 正式五关共用 `Stage1CombatRuntime.feedback`；TestScene 通过独立 Scene bridge 消费同一纯系统。返回、重试和场景销毁会清理 queue、trace、combo 与 view，不写入存档 schema。
- 结果页只读取战斗会话的 `highestCombo`；没有第二份结果页计数。
- 玩家/宠物承伤、治疗/回蓝、伤害公式、怪物 AI 与攻击范围保持不变。

# TASK-SLICE-208 运行验收

日期：2026-08-26。视口：940×590。入口：`npm run preview` 固定预览端口，非 QA 正式存档路径。

## 原版/现代对照基线

- 原版视觉基准与逐帧事实：`task-settings-193a.pet-monkey-animation` 的 626 个 original baselines、20 个显示对象和 owner/clock/注册点合同。
- 行为/命中基准：`task-settings-207.pet-monkey-family` 的 41 项 P1R 合同与三套 StageCommon collision 真值。
- 允许现代例外：Phaser/Canvas 宿主、现代 Scene 生命周期和公共组合式 Runtime；不得改变玩家可见动作、命中时序、伤害、owner 或状态流。

## 现代正式运行观察

| 场景 | 观察结果 |
| --- | --- |
| P1 单宠正式 Stage 1-1 | monkey 本体、追击、普通攻击真 effect 和命中伤害可见；怪物 HP 实际下降 |
| P1/P2 双宠正式 Stage 1-1 | 两个 owner 各自实体、目标、projectile、伤害源和动画同时可见，无串号 |
| monkey1..4 自动合同 | 专项覆盖普通攻击、全部技能 verified hit frame、受击释放、CD/优先级与清理 |
| monkey4 jgaoyi | 五段移动/中间 xj+lj/最终 lyq、回主人和受击取消由确定性专项覆盖 |
| 生命周期 | 出战/休息/换形态/死亡完成/重试/返回重载由正式公共桥与旅程专项覆盖 |
| 控制台 | 最终 build 重载后 warning=0、error=0 |

结论：现代正式运行直接消费 193A/207 真值；玩家可见链已从 body/action 延伸到 effect→collision/hit frame→damage→cleanup，不能再由孤立动画或字符串事件替代。`pet P1R=0`。

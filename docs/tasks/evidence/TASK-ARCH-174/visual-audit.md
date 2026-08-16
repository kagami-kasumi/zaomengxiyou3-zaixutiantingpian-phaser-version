# TASK-ARCH-174 普攻几何与 Role5 弹体验收

## 原版空间真值

- `task-arch-174.normal-attack-spatial` 为 `verified`，路径为 `docs/reverse-engineering/ground-truth/manifests/task-arch-174-normal-attack-spatial.json`。
- 四个 detached 世界特效的权威字段位于 `/displayObjects/*/placements/0`：AS3 释放点、恢复帧 local bounds、canonical 940×590 stage bounds 与 hitArea 由生成器联合输出。
- verified manifest 是原版几何事实源，`HeroNormalAttackGeometry` 直接读取它并形成唯一运行时投影；系统碰撞与 `HeroCombatVisualCoordinates` 共同消费该投影，场景层不再复制四组常量。
- 允许的现代可见例外：无。本任务没有新增或替换可见资源、显示对象、origin 或角色外观层。

## Role5 二维命中与结算

| 状态 | 原版证据 | 现代结果 | 差异 |
| --- | --- | --- | --- |
| 二维碰撞 | `BaseBullet.checkAttack -> BaseMonster.beMagicAttack -> AUtils.testIntersects + HitTest.complexHitTestObject` | Role5 projectile hitbox 同时检查目标 X/Y；同 X 但上下完全分离不命中 | 矩形/目标点仍为既有现代等价边界；不再退化为 X-only |
| 重复命中 | 原版 `beAttackIdArray` 按 attack id 去重 | 继续使用共享 `HitRegistry`；重复 overlap/重复 resolve 只结算一次 | 无 |
| 伤害/死亡/奖励 owner | `BaseBullet` 只触发目标统一受击链 | `resolveStage1HeroHit` 唯一处理防御、伤害事件、hurt/dead、`lastHitBy` 与审计；Role5 只负责 projectile overlap/remainingHits | 无 |
| P1/P2 | sourceRole 决定攻击归属 | `PlayerSlot` 写入同一共享结算；双方 attack id 与 `lastHitBy` 隔离 | 无 |

## 940×590 代表验收

- `?qaStage=1-1-role5`：Role5 单人正式 TestScene 资源加载完成；龙魂剑技能与 J 动作可见，现有真角色/技能/怪物层保持，无新占位；console warning/error 为 0。
- `?qaStage=1-1-role5&players=2`：合法 Role1 + P2 Role5 双人页面完成加载，两套 HUD/角色/怪物可见；console warning/error 为 0。
- 近/远、上下错位、多目标、死亡、重复 resolve、P1/P2 的确定性边界由 `tools/remote-normal-attack-tests.ts` 覆盖；浏览器验收不以单帧截图替代这些业务断言。
- 结构化观测见同目录 `runtime-observation.json`。

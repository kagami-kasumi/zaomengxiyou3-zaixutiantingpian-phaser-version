# TASK-SLICE-158A 视觉验收

## 显示列表与现代映射

| 层 | 原版 owner | 现代 owner | parent / depth / 矩阵 | 状态 |
| --- | --- | --- | --- | --- |
| 身体 | `WuKong.swf / ROLE1_0 / character 22` | `Role1CombatVisualBridge` body sprite | 玩家碰撞 anchor 的同级动态层；depth 20；200×200 cell；左右 origin `0.525/0.475,0.575` | 原资源复用 |
| 装备 | `ROLE1_EQUIP_0 / character 21` | 同 bridge equipment sprite | 与身体同帧、同方向、同坐标；depth 20.01 | 原资源复用 |
| 影分身 | `ROLE1_SHALLDOW / character 1` | `TestSceneRole1ShadowVisualBridge` | 世界层 depth 19；offset `(15,-5)`；P1/P2 分别消费 source owner | 原资源复用 |
| 普攻对象 | `Role1Bullet1/3/4/5` | 既有 `AttackEffectView` image path | 跟随攻击 source 与朝向；逐帧 key | 原资源复用 |
| 技能对象 | `Role1Bullet6..14`、`Role1Effect` 两对象 | `ProjectileEffectView` image path | projectile 世界坐标、source 朝向、原序列生命周期 | 原资源复用 |
| HUD | `OtherMat1` 574/505/510 | 既有 `Stage1CombatHudBridge` | P1 `(0,0)`；P2 `(920,0), scaleX=-1`；固定层 | 既有真 UI 复用 |

角色死亡没有 Role1 death Symbol，现代实现按原版移除身体/装备，不再使用灰色 alpha/tint 冒充动画。动态姓名与碰撞 anchor 保持既有 owner，不改变玩法几何。允许的现代可见例外：空。

## 资源与逐状态结果

- 身体/装备：两张 `1200×2800`、`6×14` 图集；影分身：`1000×600`、`5×3` 图集。
- 技能：14 个稳定 key、249 帧；`hyjj` 起手连续消费 character 348 的 14 帧与 318 的 17 帧。
- body action 覆盖 `idle/walk/run/jump1..3/hit1..14/hurt/remove`，30 tick hold 由 069A 合同直接投影；技能 action 由 cast event 驱动，不修改 MP、伤害窗或 projectile 生命周期。
- 正式单人 940×590 进入、idle、普攻、HUD 与零 console 已运行检查，证据为 `role1-single-idle-940x590.png`、`role1-single-attack-940x590.png`。
- 合法双人 QA 路由为 `?qaStage=1-1-role1&players=2`，固定 `P1 Role2 + P2 Role1`，用于验证 P2 镜像、独立 HUD 与方向键 owner；自动门禁锁定该组合，不允许重复角色。

## 差异清单

| 对象/状态 | 结论 |
| --- | --- |
| 身体、装备、影分身 | 原表逐 cell 复用；碰撞 anchor 继续不可见，不构成现代覆盖层 |
| 普攻与全部已实现技能对象 | 真 PNG 序列；Role1 路径在通用 ellipse/core/Text 分支之前返回 |
| death | 原版无 death Symbol，采用移除；没有单帧/变灰回填 |
| HUD | 复用已验收 574/505/510；本 task 未重建或覆盖 HUD |
| 字体栅格与抗锯齿 | 仅既有 HUD 文本容差；Role1 图像本身不做现代重绘 |

专项门禁核对三张 atlas 尺寸、249 帧、14 个 runtime stable key、`combat-common` 唯一 owner、无 `missing-original` 回流和 QA 双人组合；全系统、构建、annotations、workflow 与 diff check 作为最终关闭证据。

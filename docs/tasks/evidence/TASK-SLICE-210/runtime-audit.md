# TASK-SLICE-210 运行验收

日期：2026-08-31。

## 自动语义证据

- `pet-horse-behavior-contract` 对 horse1..4 × P1/P2 从各自范围外开始，记录目标距离下降、入围后 action token、projectile、attack id、pet source、HP decrease 与 cleanup；range/hit/source 三类变异均被杀死。
- `pet-horse-family` 覆盖全部继承 `sp/bd/bz`、受击 `bd` 门、`tmaoyi` 无继承/单项/组合/多怪、2.4 秒冰效、二段爆炸与 1 秒延迟，并验证 TestScene/正式五关共享 `PetCombatRuntime`/source snapshot。
- `formal-pet-journey` 覆盖当前 schema 的 P1/P2 五关冷启动、页面切换、返回与重载；`pet P1H=0` 将上述语义、真动画与正式消费者绑定为同一门禁。

## 940×590 玩家可见验收

- URL：`http://127.0.0.1:4174/?qaStage=1-2&players=2&qaPetHorse=4`。
- 正式 `Stage12Scene` 中 P1/P2 均显示 horse4 原版本体与独立 HUD；正式桥从 QA roster 进入和保存档相同的 P1/P2 `PetCombatRuntime`、投射物、伤害与 body bridge。
- 另验 TestScene 双人入口 `?qaStage=1-1-role1&players=2`；公共场景加载、战斗与 HUD 正常。
- 两次验收的浏览器 warning/error 均为 `0`。攻击表现不作为命中证明；命中与实际 HP decrease 以独立 structured trace、formal damage test 和 P1H gate 为裁判。

## 生命周期与边界

- P1/P2 target、CD、hurt flag、projectile、damage source、ice、延迟爆炸互不共享。
- dead-complete、换宠、休息、重试、返回与重载使用 Runtime 幂等销毁；`FormalPetHorseBodyBridge` 不再拥有第二套 `PetRuntimeSystem`。
- TestScene 的马系具体技能直连已移除；Scene/Bridge 只消费公共 Runtime snapshot。未提前实现 211/212 的伤害数字或连击反馈。

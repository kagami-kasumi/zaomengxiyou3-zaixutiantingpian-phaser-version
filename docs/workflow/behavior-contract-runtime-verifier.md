# 行为合同到运行时语义 verifier

状态：治理设计中，由 PG-017 V2 调度。

关联问题：`PG-017 真值表不管用`。

## 1. 目标与边界

本 verifier 回答一个窄问题：已经由原版证据冻结的行为合同，是否真的成为现代运行时的可观察语义。它不重新判断视觉真值是否全面，也不监督实现内部采用了哪些函数或类；视觉产物全面性继续由 `ground-truth-completeness-validator.md` 独立负责。

“独立”指 expected 与 actual 的数据流隔离，不等于让另一个 AI 再生成一份测试：

- expected 在现代实现前由 AS3/恢复 SWF/manifest 冻结，测试不得调用现代实现 helper 反算 expected；
- actual 来自受控黑盒运行的结构化 trace，而不是源码正则、mock 自报事件或测试直接摆放出的命中结果；
- 每个 contract id 必须映射到具体语义字段、受控场景和运行事件，只有 id 被 import 不算消费；
- verifier 和实现可以由同一任务维护，但 oracle 来源、场景构造和结果采集必须分离并可被 mutation-kill 反证。

## 2. 最小验证层

| 层 | 必须证明 | 失败示例 |
| --- | --- | --- |
| G0 语义覆盖 | 每个 contract id 的关键字段都有字段级断言和场景映射 | 只比较 41 个 id 数量或 `verified` |
| G1 前置/负场景 | 条件不满足时行为不会提前发生 | 目标在攻击范围外仍创建 projectile/播放攻击 |
| G2 正向运行链 | 条件满足后出现完整的选择→移动/动作→命中→伤害→清理链 | 只看到特效或最终 HP 下降 |
| G3 关键变异 | 修改攻击距离、命中帧、冷却、owner、伤害源等任一关键字段时 verifier 必须失败 | 变异只覆盖一个技能 CD |
| G4 正式路径 | P1/P2、TestScene 与正式关卡使用同一语义合同且来源隔离 | 专项绿，但正式桥走另一套路径 |

结构化 trace 至少包含：时间/帧、owner/runtime key、pet 与 target 坐标、距离、当前 action、projectile id/位置、attack id、damage source、目标 HP 前后值、清理原因。视觉动画可作为事件之一，但不得单独代表命中或伤害。

## 3. 猴系首个反例场景

猴系整改与 P1R 重新验收必须至少覆盖：

1. 为每个形态把目标放在其 manifest `attackRange` 外、1200 搜索范围内。
2. 断言进入攻击范围前没有攻击 projectile、hit 或 pet-source damage，宠物距离持续收敛并表现为追击。
3. 进入攻击范围后才允许普通攻击；projectile/命中事件必须关联当前目标和当前 action token。
4. 断言目标 HP 的下降由对应 pet attack id/source 产生，而不是玩家、环境、测试注入或把敌人传送到效果坐标。
5. 分别在 P1、P2、TestScene 与至少一个正式关卡复跑，并验证换宠/死亡/重试后旧 trace 与 projectile 不再生效。
6. 对每形态 `attackRange`、普攻命中条件和 source owner 做变异，确认 verifier 能杀死错误实现。

## 4. 实施产物

- 行为合同字段级覆盖矩阵：contract id → expected 字段 → 场景 → actual trace 字段 → assertion。
- 可复用的黑盒 trace Schema 与采集适配器，不把 Scene/Phaser 对象泄漏进领域 expected。
- 猴系基准场景和关键字段 mutation-kill 套件。
- 新 P1R gate：结构 gate 可保留为前置，但只有语义 verifier 与正式路径证据同时通过时，P1R 才能返回 0。
- 失败报告必须指出未消费字段、缺失场景或断裂事件，不能只输出测试文件失败。

## 5. 非目标与调度

- 本文不实施猴系追击/攻击修复，不改 207 已冻结的原版事实。
- 不把视觉全面性校验器扩成行为 verifier，也不以行为 verifier 重新审判视觉生成步骤。
- 不因 verifier 尚未实现而批量降级其他家族真值；只在命中同类自证模式时有界复盘。
- PG-017 治理项完成后生成独立猴系整改 task；猴系重新达到 P1R=0 之前，`TASK-SETTINGS-209` 和 `$pet-family-reverse` 不进入第二家族执行验证。

## 6. 本轮治理完成标准

- verifier 的 Schema、字段覆盖检查、受控场景和 mutation-kill 入口落地，并能对当前猴系错误实现稳定报错。
- 旧 `pet P1R` 即使结构检查和原专项仍为绿，也会因语义链失败返回非 0。
- 形成猴系整改 task 的精确输入；治理项完成后由该游戏 task 修实现，而不是在治理脚手架中顺手修改玩法。

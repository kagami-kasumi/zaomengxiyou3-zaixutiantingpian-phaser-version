# TASK-SETTINGS-215 → TASK-SLICE-216

唯一输入为 [源证据索引](../../../reverse-engineering/player-pet-incoming-damage-feedback-index.md) 和 [manifest](../../../reverse-engineering/ground-truth/manifests/task-settings-215-player-pet-incoming-damage-feedback.json)。本任务未改src，未接入生产图片，未验证现代复现。

## 必须修正的原任务假设

源事实不支持全局“有效HP decrease才显示且必定一个数字”：本地致死显示传入伤害，Role3 GXP缩小显示值，Pig8/毒/火有额外producer，零值直接调用也显示0。满盾只阻断 reduceHp 的主体；显式额外producer仍可能显示。216必须保存 `settledDamage`、`displayValue`、`hpBefore/hpAfter` 和 `producerKind/ordinal` 的区别。这里是源合同纠正，不授权重写既有伤害公式或把未实现家族一并实现。

## 字段到验收的映射

| JSON Pointer / 正负fixture | 黑盒trace与assertion | 正式/TestScene消费者 |
| --- | --- | --- |
| `/glyphs`、`/visualTruth/displayObjects`；十glyph、value-0/10/1234567890 | 实际texture指向同源pnum；原bitmap identity/alpha/尺寸一致，不用文本或hurtnum | combat-common单一资源入口，CombatFeedbackView |
| `/animation/anchorOffset`、`digitStride`；hero/pet×P1/P2 | target根→worldAnchor→camera→stage，按child矩阵测量；翻面不翻字形，错误owner负例 | HeroPartyRuntimeBridge、TestSceneCombatFeedbackBridge |
| `/animation` pop/delay/fade/destroy；七时间点及explicit-destroy | trace create/show/destroy时间，scale/alpha/bounds对比原native状态；返回/重试/重载无残留 | 共用view生命周期；五关与TestScene |
| `/behavior/fixtures` 普通/零值/致死 | accepted→settledDamage→displayValue→反馈序号与HP前后值分别断言；拒绝事件无该producer反馈 | HeroCombatSystem.applyHeroDamage:122；Stage1CombatSystem:305 |
| pet ordinary/lethal/remote；P1/P2 | 使用runtimeKey与owner；只消费匹配实体，dead后的新伤害不重发旧事件；数字值不能用夹紧后HP差代替 | PetCombatEntitySession.consumeDamageEvents:283；HeroPartyRuntimeBridge:338 |
| 护盾满吸收/溢出、玄龟、Role3 GXP/non-GXP | 源fixture核定display值；已有现代能力用最终settled值发布。尚未实现的防御能力登记为消费者缺口，禁止把模拟trace当正式旅程 | 原有Hero shield/Role3结算点；不新实现宠物家族行为 |
| 碰撞无敌/重复attackId vs显式Pig8/毒/火 | event identity去除同producer重放；保留不同producer ordinal。原版已声明额外数字不可被合并掉 | Stage1CombatSystem/TestSceneCombatBridge；实际已有持续效果消费者 |
| 环境入口、保护/无命中负例 | 环境源id与攻击轮次保留到反馈，不凭每帧当前HP差猜测来源 | Stage21GameplayBridge:354、Stage22GameplayBridge:344 → HeroPartyRuntimeSystem.applyHeroPartyEnvironmentHits:264 |
| room old→new/same/not-started/pet-name-change | 单机P1/P2不借用room远端差分；联网source contract保留，当前没有room实现时标明不适用，不能伪造现代联网trace | 正式本地双人是216必验；联网仅证据对照 |
| queue capacity/stage98/burst/wait | 原API可复验；正式直接数字不默认入队，无调用者不造新producer | CureHpQueue仅源API对照，当前incoming不依赖它 |

216还需完成本来已声明的5173可发现QA存档入口，保持4174与正式槽位隔离。源真值不授权额外改动存档、角色伤害公式、未实现防御技能、联网或宠物家族。若其严格验收确实要求这些尚不存在的能力，按216拆分触发明确拆任务，不能把缺口伪装成已覆盖。

## 复验与产物保留

```powershell
python tools/run-incoming-number-probe.py
python tools/run-incoming-behavior-probe.py
python tools/generate-incoming-number-truth.py --check --self-test
npm run check:annotations
npm run check:workflow
npm run audit:problems
git diff --check
```

只有改变源/fixture/运行参数或遇到反证才重跑前两行；平常检查复用native测量、源哈希和PNG。`native/images` 是原运行基准和216的独立输入，需保留；本地 `local-resources/regima/task-outputs/task-settings-215/air` 的构建副本可重生，216结束后再按生命周期清理。现代显示层测试不能反过来重生成这里的原版基准。

允许的现代可见例外：无。216给出每个对象的原资源复用/差异及并排或叠图；215不填写虚假的现代差异通过结果。

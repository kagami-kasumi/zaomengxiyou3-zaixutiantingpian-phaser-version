# 现代实现资源元数据发现

本文件记录标注过程中发现的“现代占位 sourceSymbol 与 AS3 原版资源来源不一致”或“stableKey 尚未真正接入”的事项。它是后续代码整改输入，不在标注批次中直接修改玩法系统。

## 已确认差异

| stableKey | 现代侧当前值/状态 | AS3 证据结论 | 影响与建议 |
| --- | --- | --- | --- |
| `skill-effect.role5.tlj.hit11` | `Role5SkillTuning.ts` 使用 `role5_tlj` | `Role5.as` 的 `hit11` 通过 `loadZm4RoleResources("tlj_sword", ...)` 加载本体动作 | 后续把来源元数据改为 `tlj_sword`；不改变技能行为。 |
| `pet-skill.monkey2.lj` | `ProjectileSystem.ts` 使用 `PetMonkey2Bullet2` | `PetMonkey2.as` 创建 `PetMonkey2Bullet2_1` 和 `PetMonkey2Bullet2_2` 两段 | 后续拆清或同时记录两段，避免真素材只接一半。 |
| `pet-skill.monkey2.xj` | 使用 `PetMonkey2Bullet3` | `PetMonkey2.as` 的 `doHit3()` 实际复用 `PetMonkey1Bullet2` | 后续修正来源元数据。 |
| `pet-skill.monkey3.lj` | 只使用 `PetMonkey3Bullet3_2` | `PetMonkey3.as` 先创建 disabled 的 `_1` 起手段，再创建 `_2` 伤害段 | 后续补起手视觉 stableKey 或把两段登记为同一资源族。 |
| `pet-skill.monkey4.jgaoyi` | 使用行为式占位名 `PetMonkey4.hit5` | 奥义主要复用 `PetMonkeyBmd4` 本体 `hit5` 动作 | 真素材接入应从宠物本体 atlas 取动作，不寻找不存在的独立 bullet。 |
| `pet-skill.dragon1.fs` | 使用 `PetDragon1Bullet1` | `PetDragon1.as` 的 `doHit2()` 创建半透明同类分身，视觉来自 `PetDragonBmd1` | 真素材接入应复用本体资源。 |
| `pet-skill.turtle4.xwaoyi` | 使用占位名 `PetTurtle4Hit5` | `PetTurtle4.as` 复用本体 `hit5`，满足前置时再创建 `PetTurtle3Bullet3` | 后续把本体动作和范围特效分开登记。 |

## 覆盖与分类发现

| 项目 | 当前事实 | 建议 |
| --- | --- | --- |
| `skill-projectile.role5.lxuanj.hit8` | `AssetManifest.ts` 已定义，AS3 已确认 `sword_lxuanj2`，但现代系统没有实际引用 | 后续实现反向段时复用现有 key；当前不删除。 |
| `stage.stage1-1.listener` | `sourceAssetFamilies.stage11` 把 `StageListener11` 与视觉资源并列 | 它是已有 AS3 行为证据，不是缺失视觉资产；后续可从素材 family 元数据中移出。 |
| `normal-attack-effect.hero5.spear.unresolved` | 一个 stableKey 同时承接跑攻 `Role5runattack` 和未恢复的 `doSingleHit(...)` | 取得更完整 P-code/角色包后拆分；当前维持 `unknown`，禁止猜造。 |

## 整改边界

- 上述事项不影响本轮“每个资源都有状态、证据和下一步”的标注完成定义。
- 修改 `AssetManifest.ts` 或各系统的 `sourceSymbol` 时，应按正式代码任务流程执行结构检查、系统测试和构建。
- 真素材到手前，修正元数据不会让视觉自动变成原版，因此代码整改和资源获取应分开验收。

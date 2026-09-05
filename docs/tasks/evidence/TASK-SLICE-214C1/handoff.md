# TASK-SLICE-214C1 公共实体接缝交接

日期：2026-09-05。结果：接缝批次完成；原214C及青龙完整家族未完成。下一项214C2。

## 实际入口

| 入口/文件 | 合同与消费者 |
| --- | --- |
| `src/systems/PetCombatRuntime.ts` | 每slot一个顶层owner；同步活动roster引用、注册私有实体、通过同一stepEntity入口调度与级联清理；现有正式/TestScene入口不变 |
| `src/systems/PetCombatEntitySession.ts` | 共用damage→animation→死亡阶段→sticky target→移动→动作→effects→子实体→当前实体CD；不把公共AI/CD下放Behavior |
| `src/systems/PetCombatContext.ts` | 现有castSkill/castSkillAt/castBasicAttack/relocate/emit；新增spawnSummon、releaseSummon、summonSnapshots、parentRuntimeKey/sourcePetId |
| `src/systems/PetCombatTypes.ts` | typed私有句柄、实体快照和来源事件；旧Runtime类型路径通过re-export兼容 |

- `spawnSummon({pet,x,y,facingX})` 经唯一Registry解析Behavior，深复制临时数值，生成不可重用key，返回冻结句柄；不会把子实体加入持久roster。`enter`失败回滚自身及已创建后代。
- 主/子实体key包含Runtime实例与实体代次。即使P1/P2使用相同业务pet id，也不能互相消费damage/animation；休息后重新激活不能接受旧key事件。来源projectile的业务sourceId保持原身原值，子实体使用私有petId。
- `releaseSummon(handle, reason)` 仅接受调用实体直接拥有的句柄；可用dismissed/expired，重复或旧/外来句柄无副作用。Behavior.destroy先执行私有清理，再由Runtime兜底释放后代；子实体释放清理其sourceId子弹，不释放原身槽位。
- `snapshot().summons` 提供扁平只读子实体快照：runtimeKey、parentRuntimeKey、sourcePetId、hp/mp、阶段、目标和token。父处于dead-playing时子实体仍消费完成/清理事件，但不继续AI/CD；父完成后全部释放。
- 旧动作顺序保持：execute前token递增，updateEffects仍接收动作前context。C2不得从该context旧token推导新攻击身份。

## 验证与独立反证

- `npm run check:system-design -- pet P1GS` 通过，组合P1/P1B/P1R/P1H现有语义/家族/动画/正式五关旅程和新增私有会话测试；四个原gate还分别运行并通过。
- `tools/pet-combat-session-tests.ts` 覆盖主+两子实体不同目标/CD/token、真实现有普攻端口/sourceId、独立HP、非活动roster引用不变、旧key/P1P2事件、子死父活/父死子完成、嵌套清理、创建失败和过期context。
- `tools/pet-combat-session-mutation-tests.ts` 对生产源码内存变异再独立编译执行上述测试；10类错误均由合同断言拒绝。机器结果见 `mutation-results.json`。不修改工作区实现，不以编译失败或进程错误代替变异被杀死。
- P1GS消费者负向守卫拒绝Behavior/Scene私建实体、公共跟随/索敌/CD和死亡阶段赋值；原 `TestScenePetMagicBridge` 对未迁移家族的一次legacy follow调用保留精确路径/次数基线，第二次或新消费者调用会失败。该旧入口最终仍由全家族all gate清零，不在本批偷报完成。
- `npm run test:systems`、`npm run build`、LSP、structure通过；build保留既有大chunk警告，structure保留9项既有warning。workflow/annotations、problem audit和diff check结果记录于任务归档。

## 214C2 必须继续完成

本项没有Dragon Behavior、原版动作时钟、真实fs创建/到期计数、命中治疗、正式子实体视图或P1GC。C2须完整消费213真值/214A资源，并将实际projectile→怪物HP decrease回传到正确实体治疗；不能用animation hit或普通字符串事件无条件治疗。

现有 `castBasicAttack()` 只适配猴/马旧入口。青龙应通过typed技能请求端口接入自己的普通攻击规则，不得调用该旧fallback冒充青龙普攻。clone临时数值复制、技能限制、到期治疗与淡出仍由213源合同决定；C1不会自动推定每个summon都遵守青龙规则。

事件/快照源映射、额外动作字段和生命期计数可在C2按确切合同扩展现有窄端口；不得为分身创建第二顶层Runtime、在Behavior复制公共目标/移动/CD/死亡算法，或把私有pet写入存档。214C2完成并通过原214C全合同/P1GC后才归档214C，接着214D/214E。

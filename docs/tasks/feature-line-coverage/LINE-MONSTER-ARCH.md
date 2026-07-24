# LINE-MONSTER-ARCH 覆盖台账

## 当前范围

- 用户确认目标：重构怪物与关卡的组织方式，使关卡负责遭遇编排，怪物定义、运行状态、AI、物理、战斗、视觉和奖励各有明确 owner。
- 现代实现采用组合式怪物架构，不建立承载全部职责的深继承 `Monster` 树。
- 首批只建立通用合同与一个正式关卡试点；全关卡迁移必须依据试点结果继续拆分。
- 本线当前为 `Planned`，不得抢占 `LINE-STAGE-2-3` 的唯一 Active Goal。

## 权威设计输入

- `docs/architecture/设计模式.md`
- `docs/architecture/src-boundaries.md`
- `docs/domain/glossary.md`
- `docs/reverse-engineering/monsters-index.md`
- `docs/reverse-engineering/mechanics-index.md` 的 `M-030`
- 当前现代 owner：`Stage1CombatSystem.ts`、`Monster3System.ts`、`Monster30System.ts`、`MonsterPhysicsSystem.ts`、`MonsterDefeatRewardSystem.ts`、`DropSystem.ts`、Stage 1/2 Flow 与 gameplay bridge

## 覆盖矩阵

| 维度 | 当前状态 | 关闭要求 |
| --- | --- | --- |
| 静态定义 | 分散 | `MonsterDefinitionCatalog` 成为数值、profile 引用和跨关卡怪物类型的唯一现代入口 |
| 运行状态 | 类型分裂 | 建立最小 `MonsterRuntime` 合同，保留特殊怪物扩展数据但不复制共同字段语义 |
| AI / 索敌 | 部分共用、部分重复 | 至少地面近战行为族复用统一 `MonsterBrain` / Targeting 合同；特殊行为通过策略组合 |
| 物理 | 已有共享 owner | `MonsterPhysicsSystem` 继续唯一拥有 grounded/flying 物理，不进入关卡或基类 |
| 战斗 | 通用 owner 带 Stage1 命名 | 通用怪物创建、更新和攻击合同迁至无关卡命名 owner，兼容期行为不变 |
| 生命周期 | Flow 与 bridge 双登记 | `MonsterRuntimeRegistry` 成为试点关卡唯一实体登记点，Flow 只保留遭遇进度 |
| 动画 / 视图 | 已有视觉 owner 与 bridge | Phaser bridge 只适配状态和显示，不成为 AI、伤害或生命周期事实源 |
| 奖励 / 掉落 | 已有共享 owner | 怪物定义只引用 reward/loot profile，结算继续由现有共享系统负责 |
| 回归验证 | 尚未建立重构专项 | 系统测试、structure、build、试点关卡 1P/2P 运行行为和零 console 回归 |

## 调度

1. `GOAL-026` / `TASK-ARCH-010A`：Planned；建立组合式怪物合同、通用定义目录、Targeting/Brain 接缝和兼容 facade。
2. `GOAL-027` / `TASK-ARCH-010B`：Planned；建立最小运行时注册表，并在一个同时具有普通怪和 Boss 的正式关卡试点唯一生命周期 owner。
3. 试点完成后依据重复实例和回归风险生成逐关卡迁移 task；不得预先合并成一次全工程改写。

## 明确排除

- 不复刻 AS3 `BaseMonster` 类结构。
- 不引入完整 ECS、全局事件总线或依赖注入框架。
- 不改变原版已确认数值、动作时序、攻击几何、掉落概率和关卡通关行为。
- 不在首批 task 中迁移所有 Stage 1/2 关卡、全部 Boss 和全部测试场景怪物。
- 不用占位视觉替换已经接入的原版怪物素材。

## 关闭检查

- [ ] `MonsterDefinition`、`MonsterRuntime`、`MonsterBrain`、`MonsterRuntimeRegistry` 的统一语言和代码 owner 已落地。
- [ ] 通用怪物规则不再以单一关卡命名作为权威 owner。
- [ ] 至少一个普通 AI 行为族完成统一策略复用。
- [ ] 一个普通怪 + Boss 正式关卡完成唯一运行时注册表试点。
- [ ] Flow 与 scene bridge 在所有纳入迁移范围的关卡中不再双持完整怪物状态。
- [ ] 特殊怪物差异通过策略/能力组合表达，没有形成万能父类。
- [ ] 自动测试、构建、代表关卡 1P/2P 运行回归和 console 检查通过。
- [ ] 试点后生成的逐批迁移 task 全部完成，或剩余排除项获得用户确认。
- [ ] 无未完成同线 task。


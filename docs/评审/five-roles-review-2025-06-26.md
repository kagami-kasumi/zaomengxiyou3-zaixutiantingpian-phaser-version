# 五角色战斗技能代码评审

## 评审对象

- **范围**: Role1..Role5 全部战斗技能系统文件（24 个系统文件 + 6 个桥接文件）+ 共享 `HeroSkillSystem.ts`
- **基准**: `docs/workflow/review-protocol.md`、`docs/workflow/code-quality-gates.md`、`docs/architecture/src-boundaries.md`
- **校验结果**: `npm run test:systems` ✅ 通过 | `npm run build` ✅ 通过 | `npm run check:workflow` ✅ 通过 | `npm run check:structure` ⚠ 9 warnings（无 Role* 文件）

---

## 结论摘要

- **总体判断**: 五角色战斗技能实现行为正确、系统测试全部通过、TypeScript 编译和 Vite 构建均成功。未发现会导致构建/测试失败的问题。
- **是否阻塞继续扩展**: 存在 2 个阻塞项——Role3 RJ 防御加成未生效、Role5 sword 技能桥接缺失 jrjl 增伤。另有 Role1 `_tmp` 后缀残留可能导致运行时资产查找失败。其余问题为可维护性/重复代码类。

---

## 跨角色共同问题

### Common-High

**CH1. `consumeMpByLevel` 数组在 15+ 个文件中逐字重复**
- 位置: `Role1BasicSkillSystem.ts:16-19`、`Role1ShadowSkillSystem.ts:15-18`、`Role1FinisherSkillSystem.ts:18-21`、`Role2XbzSkillSystem.ts:10-13`、`Role2PassiveSkillSystem.ts:3-6`、`Role2JhsjSkillSystem.ts:15-18`、`HeroSkillSystem.ts:151-154`、Role3/4/5 各文件
- 影响: 全局法力消耗调整需要编辑 15+ 个文件，极易遗漏。该数组在原版中为共享基表。
- 建议: 抽取到 `src/systems/SkillTuning.ts` 作为单一数据源。

**CH2. 伤害公式常量(`skillFactorBase`/`skillFactorPerLevel`/`fixedDamageCount`)跨文件重复**
- 位置: 每个计算技能伤害的文件都独立定义 `skillFactorBase = 0.3407 * 8 + 2.075` 和 `skillFactorPerLevel = 0.0135 * 10 * 8 + 0.075 * 10`
- 影响: 数值校准需多文件同步修改。`check:structure` 不检测跨文件重复。
- 建议: 抽取共享伤害公式模块。

**CH3. `clampLevel` / `findJustPressedSkillSlot` 每个文件独立实现且签名不一致**
- `clampLevel` 实现变体: `Math.min(18, Math.max(1, Math.floor(level)))` vs `Math.min(Math.max(Math.floor(level), 1), consumeMpByLevel.length)` vs 接收 `max` 参数 vs 不接收
- `findJustPressedSkillSlot`: `for` 循环 vs `findIndex`
- 建议: 提取到 `src/systems/SkillInputUtils.ts` 和 `src/systems/SkillMathUtils.ts`。

**CH4. `HeroSkillModel` 携带全部 5 角色的 11 个 runtime 字段**
- 位置: `HeroSkillSystem.ts:112-135`
- 每次 `createHeroSkillModel` / `resetHeroSkill` 初始化全部 11 个 runtime，无论当前激活哪个角色
- `HeroSkillSystem.ts` 已达 802 行（warning 阈值 800），是所有角色类型和 Role2 管道的耦合点
- 建议: 将 role-specific runtime 拆为按 heroId 索引，或改为鉴别联合。

**CH5. 测试配装不完整**
- Role1 默认配装: 5/11 技能（缺 lyfb, jdy, sx, hmz, hyjj）
- Role2 默认配装: 5/8 技能（缺 myhc, tjgl, jhsj）
- Role3 默认配装: 5/10 技能（缺 jsp, dgq, xgq, tmc, rj）
- Role4 默认配装: 5/9 技能（缺 zq, jdz, lybj, mmw）
- Role5 默认配装: 5/10 技能
- 测试文件各自构造独立配装绕过此问题，因此系统测试仍通过。但集成场景下大量技能不可用。

---

## Role1 (悟空) 专项发现

### High

**R1-H1. `Role1BasicSkillSystem.ts` 798 行，紧贴 warning 阈值**
- 文件: `src/systems/Role1BasicSkillSystem.ts`（798 lines，warn 800）
- 承载了 slz/lys/hytj/lyfb/jdy 5 个技能 + 位移系统 + sx 吸血。任何新增技能或位移增强都会触发 warning。
- 建议: 在添加功能前先拆分 mobility 逻辑到独立文件。

**R1-H2. hmzZaDi 投射物 `sourceSymbol` 残留 `_tmp` 占位后缀**
- `Role1FinisherSkillSystem.ts:94-95`: `sourceSymbol: 'Role1Bullet10_4_tmp'`、`runtimeName: 'Role1Bullet10_4_tmp'`
- `_tmp` 后缀是开发占位未清理。若 AssetManifest 中实际资产键不匹配，可能导致运行时资产查找失败。
- 建议: 去掉 `_tmp` 后缀改为 `Role1Bullet10_4`，同步确认 AssetManifest 对应键。

**R1-H3. `lockRole1Movement`（BasicSystem）与 `lockHeroMovementForSkill`（FinisherSystem）行为不一致**
- `Role1BasicSkillSystem.ts:732-742`: 私有 `lockRole1Movement` 不清零 velocity，靠 `activeMobility` 手动设置速度
- `Role1FinisherSkillSystem.ts:264`: 使用 `lockHeroMovementForSkill`（导入自 HeroMovementSystem），会清零 velocityX/velocityY
- 影响: 同一角色的移动锁定策略在两个子系统中行为不同。
- 建议: 统一使用 `lockHeroMovementForSkill`；对于 lys/hytj/jdy 等需自驱动的位移，锁定后再重写 velocity。

### Medium

**R1-M1. 伤害公式使用硬编码 `* 1.27` 尾乘数，无注释说明来源**
- `Role1BasicSkillSystem.ts:332`: `Math.floor(multiplier * (fixedPart + powerPart) / divisor) * 1.27`
- `Role1ShadowSkillSystem.ts:398`: 同样的 `* 1.27`
- `Role1FinisherSkillSystem.ts:193,201,210`: 同样有 `* 1.27`
- 建议: 提取为命名常量并标注来源。

**R1-M2. qsez 冲刺未设置 `skillMovementLockedUntilMs`**
- `Role1ShadowSkillSystem.ts:222`: `castQsez` 直接设置 `params.movement.velocityX`，不设置 `skillMovementLockedUntilMs`
- 如果场景层的 `updateHeroMovement` 在 qsez 之后运行并用输入覆盖 velocityX，冲刺可能被打断
- 建议: 添加 `movement.skillMovementLockedUntilMs` 设置以防止输入系统覆盖

**R1-M3. lys 的 `upward` 分支配 `reentered: upward`**
- `Role1BasicSkillSystem.ts:574`: 向上 lys 的 `reentered` 设为 `true`（因为 `upward` 是布尔值）
- 语义不准确——向上 lys 不是"重入"，而是方向变体。
- 建议: 使用独立的 `direction: 'horizontal' | 'upward'` 字段。

### Low

**R1-L1. jdy 二段不消耗 MP（`mpCost: 0`），但无注释**
- `Role1BasicSkillSystem.ts:705`: jdy 二段 `mpCost: 0`
- 可能是原版设计（一段已付 MP），但缺少注释说明。

**R1-L2. jdy 二段 gate 检查分散**
- `Role1BasicSkillSystem.ts:398-400`: jdy stage 2 判定发生在 combat state/attack/actionRemaining 统一 gate 之前
- `castJdyStage2` 内部有独立的 `combat.state !== 'ready'` 检查，但 gate 责任分散
- 建议: 整合进统一 gate 检查块

**R1-L3. 影子技能测试文件缺失**
- 仅有 `role1-basic-skill-tests.ts` 和 `role1-finisher-skill-tests.ts`
- 缺少独立的 `role1-shadow-skill-tests.ts`

---

## Role2 (唐僧) 专项发现

### Medium

**R2-M1. `updateRole2ChargedAttack` 就地变异 `activeAttack` 对象**
- `Role2PassiveSkillSystem.ts:123-146`: 充电期间每帧修改 `hitboxActiveFromMs`/`hitboxActiveUntilMs`/`endsAtMs`；充电完成时改写 `actionName`/`effectKey`/`sourceSymbol`/`damage`/`attackKind`
- 同一个可变引用在不同时间点代表不同攻击状态，调试困难
- 建议: 返回新的攻击描述对象而非就地变异

**R2-M2. SMB 二段无 ground 检查**
- `HeroSkillSystem.ts:340-343`: 一段 smb 要求 `movement.grounded`
- `HeroSkillSystem.ts:384`: 二段 `tryCastRole2SmbSecondStage` 无 ground 检查
- 可能符合原版（二段弹射不需要落地），但无注释

**R2-M3. JHSJ shadow 快照在影子被召回后不更新**
- `Role2JhsjSkillSystem.ts:96-100`: JHSJ 施展时快照影子坐标，影子被召回后不取消 JHSJ shadow 阶段
- 需逆向确认是否符合原版行为

### Low

**R2-L1. myhc 和 tjgl 半径边界检查不一致**
- `Role2SupportSkillSystem.ts:107` 用 `>=`，line 132 用 `>`

**R2-L2. `distance()` 辅助函数仅本地定义**
- `Role2SupportSkillSystem.ts:171-173`

---

## Role3 (八戒) 专项发现

### High

**R3-H1. 🔴 RJ 肉甲防御加成从未在伤害结算中生效**
- `Role3DefenseSkillSystem.ts:178-183`: 计算并写入 `combat.role3DefenseBonus`（10-450 防御值）
- `HeroCombatSystem.ts:121-164` (`applyHeroDamage`): 完全未从伤害中扣除 `role3DefenseBonus`
- 该值仅在 `TestSceneFormatters.ts:208` 被读取用于 UI 展示
- **影响**: RJ 1-10 级的投入提供 0 实际防御效果——八戒比预期脆。这是游戏性 bug。

### Medium

**R3-M1. DJ 伤害倍率在桥接层消费而非系统层**
- `TestSceneRole3SkillBridge.ts:70-72`: 桥接层调用 `consumeRole3NextDamageMultiplier`
- `Role3DefenseSkillSystem.ts:254-256`: 系统函数 DJ 分支未自行消费
- 影响: `requestRole3DefenseSkillFromInput` 不能独立于桥接层使用

**R3-M2. 数据表在 5 个系统文件中完全重复**
- `consumeMpByLevel`、`skillFixedDamage`、`fixedDamageCount`、`clampLevel`、`findSlot` 各重复 5 次

---

## Role4 (毒系/沙僧) 专项发现

### High

**R4-H1. `TestSceneRole4DollCombatBridge.ts` 使用 `this: any` 完全绕过类型检查**
- 位置: `src/scenes/test-scene/TestSceneRole4DollCombatBridge.ts:13`
- `updateRole4DollCombat(this: any, time: number)` 直接访问 `this.playerViews`、`this.monster30s`、`this.hitRegistry` 等
- 若 TestScene 属性重命名，编译期零报错，运行时静默失败

### Medium

**R4-M1. 毒蔓链传播的 poison 等级使用 mbyjLevel**
- `TestSceneRole4SkillBridge.ts:191-198`: 借用 mbyj 技能等级确定 poison 强度
- `applyRole4PoisonStack` 使用 `Math.max(state.damagePerSecond, params.damagePerSecond)` 保留最高值，行为正确但路径间接

**R4-M2. `createVirtualEventProjectile` 生成零生命周期投射物**
- `Role4FinisherSkillSystem.ts:496-509`: lybj 传送事件创建 `lifetimeMs: 0, width: 0, height: 0` 的投射物
- 增加投射物系统噪音实体

### Low

**R4-L1. 巫毒娃娃初始 Y 位置可能存在双倍偏移**
- `Role4VoodooDollSystem.ts:160`: `y: params.movement.y - 20`
- `Role4VoodooDollSystem.ts:281`: `offsetY: -20`
- 同一帧内被同步纠正，理论上正确但存在极端条件下一帧偏移风险

**R4-L2. Bridge 首技能成功后不短路**
- `TestSceneRole4SkillBridge.ts:115-175`: 依次调用 5 个 request 函数，首个成功后剩余 4 个必定因 attacking 门禁失败
- 建议首个成功时 `break`

---

## Role5 (白龙) 专项发现

### High

**R5-H1. 🔴 桥接层未向 sword 技能传递 `jrjlLevel`，龙剑增伤缺失**
- `TestSceneRole5SkillBridge.ts:91-101`: 调用 `requestRole5SwordSkillFromInput` 时未传 `jrjlLevel`（默认为 0）
- `Role5SkillMath.ts:63-71`: `getRole5LoongSwordDamageMultiplier` 中 `jrjlMultiplier` 始终为 1
- **影响**: pkz/mlsz 在龙剑状态下缺少 `1.045 + level * 0.0036` 倍率加成
- 测试直接调用 system 函数时同样未传 jrjlLevel，未覆盖此交互

**R5-H2. `role5Runtime.active` 与 `skill.activeAction` 生命周期解耦**
- `Role5SkillSystem.ts:463-474`: `updateRole5SkillRuntime` 到期后只清除 `runtime.active`，不清除 `activeAction`
- 清除 `activeAction` 的逻辑仅在桥接层手动同步（`TestSceneRole5SkillBridge.ts:51-53`）
- 桥接层外调用路径可能出现 `activeAction` 泄露

### Medium

**R5-M1. 4 个 `requestRole5*SkillFromInput` 函数存在 ~70% 结构重复**
- `Role5SkillSystem.ts:97-428`: spear/status/sword/companion 四条路径共享门控逻辑（heroId 检查->slot 解析->combat 状态->MP 门->MP 扣除->返回事件）
- 约 330 行中含 ~230 行共享逻辑
- 建议: 抽取共享门控中间件

**R5-M2. pkz/mlsz 多段伤害均分在两个位置各自计算**
- `Role5SkillSystem.ts:502-510, 526-532`: 伤害除以 tunings 数组长度
- 若有人直接调用 `calculateRole5SwordSkillDamage` 而不除以数组长度会得到总伤害而非单段伤害

**R5-M3. 内联三元链可读性差且重复**
- `Role5SkillSystem.ts:141-150`: spear 分支和 sword 分支各有 3-4 行的 `a ? b : c ? d : e` 三元链
- 建议: 使用 `Record<Role5SkillName, { actionName; durationMs }>` 查找表

## 文件级发现汇总

| 文件 | 行数 | 状态 |
|------|------|------|
| `Role1BasicSkillSystem.ts` | 798 | ⚠ 紧贴 800 warning |
| `Role1ShadowSkillSystem.ts` | 418 | ✅ 正常 |
| `Role1FinisherSkillSystem.ts` | 417 | ✅ 正常 |
| `Role1SkillProjectileFactory.ts` | 114 | ✅ 正常 |
| `TestSceneRole1SkillBridge.ts` | 108 | ✅ 正常 |
| `Role2XbzSkillSystem.ts` | ~80 | ✅ 正常 |
| `Role2PassiveSkillSystem.ts` | ~160 | ✅ 正常 |
| `Role2ControlSkillSystem.ts` | ~100 | ✅ 正常 |
| `Role2JhsjSkillSystem.ts` | ~160 | ✅ 正常 |
| `Role2ShadowSkillSystem.ts` | ~120 | ✅ 正常 |
| `Role2SupportSkillSystem.ts` | ~180 | ✅ 正常 |
| `Role2SkillRuntimeSystem.ts` | ~80 | ✅ 正常 |
| `TestSceneRole2SkillBridge.ts` | ~160 | ✅ 正常 |
| `Role3DefenseSkillSystem.ts` | 316 | ✅ 正常 |
| `Role3ControlSkillSystem.ts` | 204 | ✅ 正常 |
| `Role3ImpactSkillSystem.ts` | 196 | ✅ 正常 |
| `Role3MobilitySkillSystem.ts` | 206 | ✅ 正常 |
| `Role3UltimateSkillSystem.ts` | 194 | ✅ 正常 |
| `TestSceneRole3SkillBridge.ts` | 149 | ✅ 正常 |
| `Role4FinisherSkillSystem.ts` | 574 | ✅ 正常 |
| `Role4MobilitySkillSystem.ts` | 396 | ✅ 正常 |
| `Role4PoisonSkillSystem.ts` | 389 | ✅ 正常 |
| `Role4PoisonChainSystem.ts` | 308 | ✅ 正常 |
| `Role4VoodooDollSystem.ts` | 295 | ✅ 正常 |
| `TestSceneRole4SkillBridge.ts` | 246 | ✅ 正常 |
| `TestSceneRole4DollCombatBridge.ts` | 78 | ⚠ `this: any` |
| `Role5SkillSystem.ts` | 742 | ✅ 正常 |
| `Role5SkillTuning.ts` | 354 | ✅ 正常 |
| `Role5SkillMath.ts` | 115 | ✅ 正常 |
| `Role5SkillTypes.ts` | 59 | ✅ 正常 |
| `TestSceneRole5SkillBridge.ts` | 166 | ✅ 正常（但含 R5-H1 bug） |
| `HeroSkillSystem.ts` | 802 | ⚠ warning（800 阈值） |

---

## 测试覆盖评估

| 角色 | 测试文件 | 覆盖技能 | 缺口 |
|------|----------|----------|------|
| Role1 | 2 文件 | basic (slz/lys/hytj/lyfb/jdy/sx)、finisher (hmz/hyjj) | 缺独立的 shadow skill 测试文件 |
| Role2 | 3 文件 | xbz/sgq/smb、passive (blb/sjt)、complete (myhc/tjgl/jgz/jhsj/shy) | 覆盖较好 |
| Role3 | 1 文件 (430 行) | 全部 10 技能 | RJ 伤害减免未验证、bridge 集成测试缺失 |
| Role4 | 5 文件 | poison/mds、voodoo doll、poison chain、mobility (qlj/tkj/dzj)、finisher (lybj/mmw) | 默认配装完整性未测试、doll combat bridge 无测试 |
| Role5 | 2 文件 | 普攻/武器模式、spear 技能 (xlc/lxuanj/xkjz/yyb/tlj) 和 sword/companion/lysh/jrjl | **jrjl-sword 交互完全未覆盖**、bridge 集成测试缺失 |

---

## 评分

| 维度 | 评分 | 说明 |
|------|------|------|
| 行为一致性 | 7/10 | 核心行为正确；2 个已确认的功能缺陷（R3-H1, R5-H1）-2；部分边界行为未确认（R2-M2/M3/M4）-1 |
| 架构边界 | 7/10 | 领域规则在 systems/ 中，桥接层基本只做编排；R3-M1 + R4-H2 桥接层侵入 -2；HeroSkillModel 承载全部角色 runtime -1 |
| 代码质量 | 6/10 | TypeScript 严格模式通过；大面积跨文件重复（CH1-CH3）-2；部分函数 ~70% 重复（R5-M1）-1；`this: any`（R4-H2）-1 |
| 测试覆盖 | 7/10 | 系统测试全部通过，覆盖核心路径；2 个功能缺陷未被测试发现 -1；bridge 集成测试缺失 -1；部分配装/测试文件缺失 -1 |
| 功能完整度 | 8/10 | 全部 5 角色 40+ 技能已实现；2 个 High 缺陷 -2 |
| 可持续性 | 6/10 | 跨文件重复 — 修改一个数值需编辑 15+ 文件 -2；HeroSkillSystem 持续膨胀 -1；clampLevel 等签名不一致 -1 |

---

## 后续任务建议

### 可直接修复（建议同一 PR）

1. **R3-H1**: 在 `HeroCombatSystem.applyHeroDamage` 中添加 `role3DefenseBonus` 减法 → 1-2 行改动
2. **R5-H1**: `TestSceneRole5SkillBridge.ts:91` 追加 `jrjlLevel: player.skill.role5Runtime.jrjlLevel` → 1 行改动
3. **R1-H2**: 去掉 `Role1FinisherSkillSystem.ts:94-95` 的 `_tmp` 后缀 → 2 行改动
4. **R4-H2**: 为 `TestSceneRole4DollCombatBridge.ts` 定义 `Role4DollCombatContext` 接口 → ~15 行
5. **R2-L1**: 统一 myhc/tjgl 半径边界 `>=` / `>` → 1 行
6. **R4-L2**: Bridge 首技能成功后 `break` → 2 行
7. **R1-H3**: 统一 `lockRole1Movement` 使用 `lockHeroMovementForSkill` → 涉及 3 个 cast 函数

### 建议拆 task

| 优先级 | 建议 task | 预估工作量 |
|--------|-----------|-----------|
| 高 | 抽取共享技能数值表 (`SkillTuning.ts`) — 解决 CH1/CH2 | Medium（影响 15+ 文件，不改行为） |
| 高 | 补充 RJ 防御减免测试 + jrjl-sword 交互测试 | Small |
| 中 | 拆分 `HeroSkillSystem.ts` — 类型/工厂/管道分离 | Medium |
| 中 | 统一 `clampLevel`/`findJustPressedSkillSlot` 到工具模块 — 解决 CH3 | Small |
| 中 | Role5 抽取共享门控中间件 — 解决 R5-M1 | Medium |
| 低 | 补充各角色默认配装缺失的技能 | Small（需产品决策 5 槽 vs 多槽） |
| 低 | 拆分 `Role1BasicSkillSystem.ts` mobility 逻辑 | Small |
| 低 | 重构 `updateRole2ChargedAttack` 为不可变返回 | Small |

---

## 一句话总结

五角色战斗技能实现在行为层面完成度高、构建和测试全部通过，但存在 2 个需立即修复的功能缺陷（八戒 RJ 防御不生效、白龙 sword 技能桥接路径缺龙剑增伤），以及跨 15+ 文件的大面积伤害公式/法力消耗表/C 函数重复——建议在继续扩展前优先抽取共享数值模块，避免后续校准时的维护雪崩。

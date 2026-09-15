# TASK-SLICE-216B1 结算前置修复

2026-09-14；范围仅为现有承伤路径的整数边界及保护/盾/转嫁顺序。216B历史失败JSON保持原样；本项未接pnum producer，不关闭父216、VS-072或完整玄龟家族。

## 生产结果与源依据

- `PetTurtleSkillSystem.applyPetTurtleTxljOwnerDamage` 把owner乘0.95改为整数截断：101→95，pet仍ceil(101×0.05)=6，HP200→105/194。依据215 verified manifest的 `hero-petturtle-transfer`，原版 `BaseHero.as:795..823` 的int赋回。
- `HeroCombatSystem.applyHeroDamage` 在原有dead/无敌拒绝后处理减伤、盾，再调用可选转嫁函数，最后修改hero HP。Role3比例结果先截断；sd1的101→99。`BaseAddEffect.as:2711..2755` 的umbrella/TJGL只有负余额才递归，==0不继续；溢出重新执行已实现Role3比例/int，再转嫁。sd1 + shield50：101→99→49→48→45，hero HP155、pet HP197。
- `PetBattleOwnershipSystem.applyOwnedHeroDamage` 只选择P1/P2 roster，并把转嫁交给上述共享结算的落HP阶段。TestScene Monster30与Monster3保留真实碰撞/重复hit拒绝，传入原始计算伤害，不再提前改pet HP。正式已有 `applyHeroDamage` 三参调用保持可用。
- 既有 `isPetTurtleTxljLinkActive` 已含 `pet.hp > 0`，死亡/失效link不转嫁。只读审查曾提出缺少死亡判定，经helper精确源码和实际测试反证排除，未添加重复guard。

原版路径均位于 `local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts/`，仅作为AS3行为参考；未更改源语料。215原始verified真值保持原状，新增测试期望不是新视觉真值。

## 兼容边界与后续接线

当前 `Role3DefenseSkillSystem.syncRole3DefenseState` 写入的flat defense仍只扣一次；它不是 `Role3.as:1201..1222` 的比例override。本项保留现代已有行为，不宣称其为原版承伤公式。`role4Mds` 仍保留既有盾溢出语义，不扩张为本项未验证的源盾能力；未添加GXP、装备或其他家族能力。

`DamageEvent.amount` 在两个TestScene桥现在明确是转嫁前输入；它仍不是最终HP变化或pnum display值。216B必须在真实结算owner记录settledDamage/displayValue/HP trace，不得拿该输入或HP差替代producer值。可选转嫁函数属于同步结算接缝，不是视图回调；完整事件与显示生命周期仍由216B实施。

## 验收证据

- `tools/incoming-settlement-cases.ts`：18组冻结源边界，两个owner共36组共享入口测试；覆盖101、sd1/sd8、零、致死、死宠/失效link、普通/恰好耗尽/溢出盾、TJGL及Role3盾组合。独立读取215的95+6期望，另有正式三参入口及modern flat-defense兼容断言。
- [browser-settlement.json](browser-settlement.json)：216组实际TestScene Monster30/Monster3函数及真实Phaser矩形碰撞执行（18×2owner×2caller×命中/未碰撞/重复攻击）。对账hero/pet/另一owner HP、接受状态、盾余额；零浏览器错误。攻击状态受测试控制，**不是完整场景旅程或视觉验收**，也不证明原攻击几何复原。
- [settlement-mutations.json](settlement-mutations.json)：10类内存变异被断言杀死：owner ceil、去int、拒绝前转嫁、盾前转嫁、丢失溢出、跳过溢出重入、错误owner、错误来源数值、跳过怪物碰撞、跳过boss重复hit裁决。负运行不覆盖正常JSON，不修改生产文件。
- 旧大测试文件只修两条96→95错误断言，新增逻辑全部位于独立测试文件，避免扩大已有结构warning文件。

复验命令（4174 preview已运行则复用）：

```powershell
npm run test:systems
npm run build
npm run preview
npm run test:incoming-settlement
npm run check:structure
npm run check:annotations
npm run check:workflow
npm run audit:problems
git diff --check
```

浏览器runner使用本机既有headless Edge与ignored dist测试页，无用户存档。专项最后一次变异留下负测试页；运行 `node tools/run-incoming-settlement-browser.mjs` 恢复正常页，正常build也会清除临时页。已有复杂软件无需安装。全系统/生产build/专项均通过；结构仍为9项既存warning，build仍提示既有大chunk。

归档后216B恢复唯一Ready；父216/功能线覆盖合同不缩减。PG-004/001/006/017增量审计通过，PG-017本次已定位结算反证解除但完整正式消费者/全面性/存量关闭合同不足，保持复盘，不归档PG。未执行Git提交或上传。

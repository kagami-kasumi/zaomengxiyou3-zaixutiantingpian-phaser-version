# TASK-SLICE-216B2 环境结算修复

2026-09-14。已修复216B环境预检的5项数值冲突。原始失败 `216B/environment-preflight.json` 保持不变；216B恢复唯一Ready。这里不接pnum，也不关闭父216/VS-072。

## 生产变化

- `HeroCombatSystem.settleHeroHpDamage` 成为怪物与环境共用的HP结算：先把调用值转int，再执行已有Role3比例并转int、现有modern flatdef一次扣除、盾与溢出重入、可选既有转嫁。既有 `applyHeroDamage` 保留怪物接受/保护/动作策略。
- 新 `applyHeroDirectDamage` 专用于现有环境 `reduceHp(..., true)`：不使用普通怪物受击时间窗；显式magic immunity或dead拒绝；落HP后按源非零/Role3 param2规则hurt，满盾/恰好耗尽不设置hurt，死亡仍归同一英雄模型。
- `HeroPartyRuntimeSystem.applyHeroPartyEnvironmentHits` 使用该共享结算，保留机关来源/攻击/类型/时间、owner、死亡原因；外层击退继续按原有边界约束，Role3盾/hit12免击退时不位移。受盾保护但来源外层调用setAttackBack的行为不被误删。
- 正式Stage21冰/Stage22火及DEV火桥转发真实hazard/attack/time。冰刺补已有显式保护入口；两个火桥改掉固定false。保护在hazard消耗hit ID前拒绝，解除后同一attack可命中。`environmentProtected` 仅映射当前magic-ring的 `magicInvulnerability`，不是普通 `invulnerableUntilMs`，也不宣称全部原版isYourFather来源已实现。
- DEV火的目标映射和命中适配提为同文件可测试函数，实际update闭包消费它们；未新增第二套结算或像素算法。

源依据：215已冻结的 `IceThron.as:68..87` / `FireThron.as:65..87`、`BaseHero.as:795..865`、`Role3.as:1201..1222`、`BaseAddEffect.as:2711..2755`。所有路径位于既有172845主包AS3语料，未改源或215真值。

## 验证与边界

| 输入（初始HP200） | 实际修复结果 |
| --- | --- |
| 冰16.5 | HP184 |
| 火46.5 | HP154 |
| 冰16.5、盾100 | HP200、盾84、无hurt |
| 火46.5、盾30 | HP184、盾0 |
| 冰16.5、sd8、无flatdef | HP186、无hurt/击退 |

`tools/incoming-environment-tests.ts`：10组×P1/P2共20数值/动作/身份断言，含入参int前后次序、exact/full/overflow、Role3、零、致死、modern flatdef兼容、正常受击时间窗不吞环境命中；4组真实冰火保护→解除→重复attack序列，另验同时不同hazard使用相同attack编号仍独立。

[browser-environment.json](browser-environment.json)：24组Edge实际正式冰/火函数与DEV目标/命中adapter执行；使用真实hazard函数、真实共享party结算及实际加载的火frame2像素，覆盖保护、盾、重复attack、另一来源、P1/P2及另一owner HP。英雄目标由测试控制；这不是完整场景旅程、原版碰撞几何校准或pnum视觉验收。现有火像素/冰碰撞范围没有被修改。

[environment-mutations.json](environment-mutations.json)：13类内存生产变异失败，包括去入参int/去全部int、绕盾/丢overflow、错误普通hit时间窗、错误owner/source/time、Role3强制hurt、保护后才消费ID、正式冰/正式火/DEV火固定false。变异不覆盖正常报告或改生产文件。

216B1的36组入口、216组真实TestScene caller状态和10变异再次通过；旧怪物/转嫁接缝维持有效。全量系统测试、tsc/Vite build、结构/标注/工作流、问题审计与diff检查通过。保留9项原有结构warning、PlayerSlot词汇warning和既有大chunk提示。

复验：

```powershell
npm run test:systems
npm run build
npm run preview
npm run test:incoming-environment
npm run test:incoming-settlement
npm run check:structure
npm run check:annotations
npm run check:workflow
npm run audit:problems
git diff --check
```

preview复用4174。两个浏览器脚本使用本机已有headless Edge与ignored dist测试页；专项末尾负变异页不能充当正常人工预览，重新执行对应browser脚本可恢复正常页。未安装软件、未改用户存档。

## 216B接线要求

环境hit的 `source` 在正式冰/火/DEV火均提供真实身份，`lastDamageEvent.amount` 仍是输入值，可能是16.5/46.5；不能拿它直接作settledDamage或pnum。216B必须在共用HP结算落点产生int结算/HP trace，full/exact shield不得凭accepted=true冒造普通producer。旧无source的直接测试/QA调用仍有明确 `environment-direct` 身份与runtime局部序号，不能伪装成原版冰火producer。

本项不扩展正式玄龟家族或新增其环境转嫁能力，不补原版多次受击保护计量器/GXP/其他father来源；modern flatdef继续维持216B1披露的一次兼容扣除。完整承伤producer矩阵、正式数字视觉和5173入口仍由216B/C完成。

PG-001/004/006/012/013/017增量审计通过：同一共享结算、真实adapter与来源负测、既有关卡结果/物理奖励/五关旅程回归均通过；PG-017环境反证解除但完整正式消费者/全面性/存量关闭合同仍不足，保持复盘。未执行Git提交或上传。

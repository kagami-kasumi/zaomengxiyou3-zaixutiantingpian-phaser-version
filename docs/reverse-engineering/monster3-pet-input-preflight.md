# Monster3 正式宠物接收输入预检（249B）

249A已证明251显式处理后输入下的生产接收。249B连接正式owner时，发现现代PetState及恢复存档没有原版独立保存的miss/mDef，不能把测试fixture值或默认0接入正式游戏。另有兔疾风当前效果状态未映射。此为B声明外的属性生产/持久化及有限效果输入缺口，非251原接收公式反证、非A接收能力缺陷，也不是按测试数量拆分。

## 可复查证据

原源码根：`local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts/`，只读。

| 输入 | 原版事实定位 | 现代状态及结论 |
| --- | --- | --- |
| petMiss | `petInfo/PetInfo.as:42..64`初值0；`:1576..1589`等级≥60重算时消费随机并累计；`:2281..2338`存档索引12、读取封顶0.48 | `PetTypes.ts`无字段；`PetProgressionSystem.refreshPetStatsForLevel`未更新；`SaveSystem.decodePet`未恢复。等级不足以反推历史随机 |
| petMagicDefense | 同上重算含独立随机调用，存档索引10、读取封顶0.36 | 同上缺字段；不能用读取上限充当当前值，也不能由def换算 |
| rabbitDodgeActive | `export/pet/PetRabbit2.as:183..197`释放添加`PET_RABBIT_JIFENG`，时长5×fps；`base/BasePet.as:588`按当前效果判定 | 现代`rabbit2Jf.cooldownMs`只是冷却/释放输入，未证明效果现存；不得由拥有jf或冷却非0替代 |
| QLFJ/GXP | 原处理后概率/效果条件已由251冻结 | `PetNormalAttackDecision`已有QLFJ公式；Session从`gxpRuntimeKeys`读当前GXP。B可复用，不能仅凭技能拥有当当前增益 |

主agent已窄读并归并Luna报告。代码定位只证明缺口，未把这些片段晋升为完整成长/效果合同；252必须补实际原方法、独立expected与反证。

`node tools/run-system-tests.mjs monster3-pet-input-preflight-tests`通过：真实种子及59→60升级均没有两个字段；将明确非零受控字段送入生产encodePet后，P1/P2真实restoreGameState均丢失。报告在本地 `docs/tasks/evidence/TASK-SLICE-249B/pet-input-preflight.json`。值0.23/0.17是诊断输入，不是原版成长值或迁移政策。

## 本轮保留的实现与已证范围

- `Monster3AttackRuntime`：独立攻击、身体7/6步出生、首帧/末帧、暂停显示、源死亡留弹及destroy释放引用的共享机制；尚未接入两正式Scene。
- `Monster3Selection`：1764组27936决策态，另21312连续body+selection态对250独立预期通过；目标获取/真实移动仍由正式owner接缝负责。
- `Monster3CollisionSystem`：140880原case、42906767像素，命中布尔零差异，残差逐元组严格等于248批准的451像素；Monster30原93920布尔case回归通过。
- 初次生产碰撞两例失败：local bounds相加形成573.0500000000001，1px ROI被截成0。Monster3启用原world twip边界换算，完整域复验；不扩大坐标域或残差许可。共享查询默认路径不变。
- `Monster3AttackProjection` / `Monster3AttackView`准备30原生双方向资源的只读投影；尚未完成浏览器、Scene或逐像素显示验收，不作视觉完成声明。资源导出`--check`通过34位场/30pose；本轮未改原资源或真值。
- 540 after-world状态与全部135真实检测phase通过；12生产变异被行为断言拒绝并恢复后重跑。它们只覆盖共享机制，不冒充HP/正式Scene联合验收。

复跑：`node tools/run-system-tests.mjs monster3-collision-tests monster3-selection-tests monster3-attack-phase-tests monster3-attack-lifetime-tests`；`node tools/run-monster3-attack-mutations.mjs`。日志在`.tmp/monster3-249b-*`及本地B证据目录。

## 调度与恢复合同

249B保留全部原合同并Blocked；252已完成宠物两个持久接收属性及疾风效果的有界来源合同，253唯一Ready实现正式属性owner/存档及当前效果映射，再恢复249B。不得回填缺失历史随机、删去非零/高等级/兔状态或把原版初始化0当旧存档当前值；若历史数据不可恢复，必须保留未知并形成具体可审核迁移方案，不能暗中把现代决定写成原版事实。

两正式Scene、真实HP/宠物反馈、英雄后宠物顺序、自然移动、暂停/退出/失败重试及原生显示尚未实施验收。父249、204/all/194/VS-067和整线均未完成；共享代码保留供恢复消费，禁止以测试通过关闭父任务。

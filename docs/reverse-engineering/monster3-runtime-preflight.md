# Monster3 正式消费输入预检

当前说明（2026-10-03）：下列自然选择阻塞已由250解除；本次新发现的实际HP/接收输入缺口见[接收预检](monster3-reception-preflight.md)，下一项为251。本页保留历史观察。

历史预检：2026-10-02，`TASK-SLICE-249` **Blocked**，`TASK-SETTINGS-250` 为同线唯一 Ready。仅完成输入预检与调度，不宣称249完成；未修改src/public、247/248原真值或原语料。

## 可复跑证据

`node tools/monster3-input-preflight.mjs`直接调用生产 `createMonster3/updateMonster3` 与 `createStage1CombatEnemy/updateStage1Enemy`，P1/P2共8例，退出0。报告在本地 `docs/tasks/evidence/TASK-SLICE-249/input-preflight.json`。受控输入包括归零CD和预置攻击中状态，不能冒充自然原生trace或正式Scene旅程。

| 观察 | 一手依据 | 等级与边界 |
| --- | --- | --- |
| Boss在(200,0)、(150,150)两目标位置均选择hit2 | `Monster3System.ts:173..178`只用absXDistance<=200；源`Monster3.as:260..262`调用GetDisBetweenTwoObj<200 | 生产观察+源静态差异；原生完整决策相位仍未知 |
| Boss hit1中CD从2000保持2000 | `Monster3System.ts:141..151`返回早于`:173`减CD；源`BaseMonster.as:305..352/407..420`的step/countCD | 生产观察；源真实busy/CD顺序待250，不把静态推导当动态oracle |
| Stage13第二次攻击伤害action=hit1，显示静态映射=hit2 | `Stage1CombatSystem.ts:341..349/651..667`固定config；`Stage13MonsterVisualBridge.ts:78`奇偶显示 | 实际生产系统动作与静态显示映射的分裂；未运行Phaser截图 |
| 247源探针直接指定动作，无自然选择入口 | `tools/monster3-source/capture.py:46..63`方法清单/构造setAction；reference `/scope` | 确认事实；247身体、独立攻击与248空间结论继续有效 |

旧`levels-index.md:657..670`与`monsters-index.md:127..179`有技能/CD静态摘要，未给自然选择的原方法逐步trace。239 `monster-target-selection-contract.json`只覆盖目标选择/输入，scope明确不含完整AI；不将其扩写成Monster3技能选择证据。

## 决策与承接

249第一拆分触发明确要求：缺少影响自然技能选择的原版输入时，先生成同线有界补证。250只闭合Monster3自然hit1/hit2选择、CD/状态/随机消费到247身体入口，复用239目标与247/248已证输入；不重做碰撞、完整身体视觉或其他怪物。

Luna只读审查已归并：两owner均未接独立攻击，Boss矩形/Stage13横向判定、hit2显示猜测、死亡/暂停与宠物独立承伤均属249原实现责任；这些不另拆任务。只有缺少独立自然选择oracle触发250。主agent复读源Monster3、BaseMonster和两生产system，复跑8例确认输入缺口。

249继续保留全140880命中、30显示态、135原生检测相位、真实英雄/宠物HP、两owner正式旅程与原有全部反证。250完成后恢复249；204/all/194/VS-067及功能线保持未关闭。

验证：`check:structure`退出0（8项既有warning，无生产目标修改）；上述预检退出0。工作流和PG审计结果见本次249执行记录。未运行build或游戏回归，因为没有生产代码变更；诊断通过不等于游戏验收。

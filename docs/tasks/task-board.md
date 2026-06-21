# 游戏任务看板

本文只记录未完成的游戏复现任务：玩法逆向、现代架构、纵向切片、资源和实现。
AI 工作流、任务体系、文档职责等脚手架维护不进入本文，记录到 `docs/workflow/governance-log.md`。
已完成游戏任务迁移到 `docs/tasks/task-history.md`。新对话默认不要读取历史，除非用户要求追溯、当前任务依赖历史决策，或需要修改已完成任务。

## 状态定义

- `Ready`：依赖满足，可以作为下一次 prompt 执行。
- `Blocked`：缺前置任务、机制事实或用户材料。
- `Planned`：已经规划，但不是当前优先级。
- `Split`：任务过大，已经拆出子任务，不直接执行。
- `Done`：任务已完成，应从本文移动到 `docs/tasks/task-history.md`。

## 当前推荐

推荐下一次：

- Role2 全技能树逆向已完成。当前推荐执行 `TASK-SLICE-084`，先复现依赖最少的 `xbz -> hit3` 固定范围魔法切片。

## 待完成任务

| Task | 状态 | 类型 | 目标 | 目标机制/切片 | 产物 | 下一步 |
| --- | --- | --- | --- | --- | --- | --- |
| TASK-SLICE-084 | Ready | TASK-SLICE | Role2 `xbz -> hit3` 固定范围魔法 | M-019、M-025、VS-037 | `HeroSkillSystem.ts`、`ProjectileSystem.ts`、测试与占位资源 | `TASK-SLICE-085` |
| TASK-SLICE-085 | Planned | TASK-SLICE | Role2 `blb/sjt` 普攻蓄力与被动 | M-019、M-024、M-025、VS-037 | 普攻输入/蓄力/伤害修正与测试 | `TASK-SLICE-086` |
| TASK-SLICE-086 | Planned | TASK-SLICE | Role2 `myhc/tjgl` 治疗与护盾 | M-019、M-025、VS-037 | 群体治疗、宠物目标、护盾与测试 | `TASK-SLICE-087` |
| TASK-SLICE-087 | Planned | TASK-SLICE | Role2 `jgz -> hit7` 拉拽控制 | M-019、M-025、VS-037 | 范围拉拽/失重/免疫与测试 | `TASK-SLICE-088` |
| TASK-SLICE-088 | Planned | TASK-SLICE | Role2 `jhsj -> hit9` 双窗口多段技能 | M-019、M-025、M-034、VS-037 | 两类 projectile、动作窗口与测试 | `TASK-SLICE-089` |
| TASK-SLICE-089 | Planned | TASK-SLICE | Role2 `shy` 分身协同闭环 | M-019、M-025、M-034、VS-037 | 分身生命周期、传送、技能同步与测试 | 转入下一角色技能逆向 |

## 任务完成定义

### TASK-SLICE-084

任务类型：

- `TASK-SLICE`

目标机制/切片：

- `M-019`、`M-025`、`VS-037`

输入资料：

- `roles-index.md`、`skills-input-index.md`、`projectiles-index.md`
- `src/systems/HeroSkillSystem.ts`、`ProjectileSystem.ts` 与相关测试/场景桥接

输出产物：

- `xbz -> hit3` 的技能配置、固定范围占位 projectile、伤害结算和自动化测试

完成定义：

- 普通技能槽绑定 `xbz` 后按原公式扣 MP，攻击/受击中拒绝释放。
- 进入 `hit3` 等价动作并在角色附近生成 `Role2Bullet3` 占位效果，使用 `magic`、命中间隔 250、击退 `[4,-4]` 与已确认伤害公式。
- 有可观察反馈并覆盖绑定、MP、重入、生成位置、伤害和生命周期测试。

验收标准：

- `npm run check:structure`、`npm run test:systems`、`npm run build`、`npm run check:workflow` 通过。

禁止范围：

- 不修改 `extracted_flash/`；不同时实现分身同步或其他 Role2 技能；真素材缺失时使用稳定占位 key。

状态更新：

- 完成后更新 `mechanics-index.md`、`vertical-slices.md`、`task-board.md`、`task-history.md`。

推荐后续任务：

- `TASK-SLICE-085`

### TASK-SLICE-085

任务类型：`TASK-SLICE`。

目标机制/切片：`M-019`、`M-024`、`M-025`、`VS-037`。

输入资料：Role2 的 `hit1/hit2`、`step()`、`getRealPower()` 索引，现代普攻/输入/技能系统。

输出产物：`blb` 持续普攻蓄力、`sjt` 阈值与伤害被动、占位反馈和测试。

完成定义：学习 `blb` 后持续按普攻可按 48 阈值转 `hit2` 并扣动态 MP；`sjt` 将阈值降为 12 并应用等级伤害系数；松键、未学习、MP 不足和重入边界可测。

验收标准：结构、系统测试、构建和 workflow 检查通过。

禁止范围：不修改原始提取；不扩展其他角色或主动技能。

状态更新：四份正式任务状态文档。

推荐后续任务：`TASK-SLICE-086`。

### TASK-SLICE-086

任务类型：`TASK-SLICE`。

目标机制/切片：`M-019`、`M-025`、`VS-037`。

输入资料：Role2 `hit6/hit8`、治疗/护盾索引，现代玩家、宠物和战斗系统。

输出产物：`myhc` 半径 100 持续回血、`tjgl` 半径 150 群疗/宠物治疗和 7 秒自身护盾，以及测试。

完成定义：两技能按原 MP、动作门禁、等级公式和目标距离工作；无目标、宠物、GXP 倍率、护盾吸收/到期边界可测。

验收标准：结构、系统测试、构建和 workflow 检查通过。

禁止范围：不实现完整分身同步或通用团队系统重构。

状态更新：四份正式任务状态文档。

推荐后续任务：`TASK-SLICE-087`。

### TASK-SLICE-087

任务类型：`TASK-SLICE`。

目标机制/切片：`M-019`、`M-025`、`VS-037`。

输入资料：Role2 `hit7/doHit7()` 索引，现代怪物移动/控制状态。

输出产物：前方控制 effect、240 半径目标筛选、拉拽/失重/恢复与测试。

完成定义：技能按原 MP 和动作门禁触发；合法敌人被拉向目标点并恢复，死亡/免疫/范围外目标不受影响；下一次伤害增幅边界可测。

验收标准：结构、系统测试、构建和 workflow 检查通过。

禁止范围：不为单技能重构全怪物物理；不猜真动画。

状态更新：四份正式任务状态文档。

推荐后续任务：`TASK-SLICE-088`。

### TASK-SLICE-088

任务类型：`TASK-SLICE`。

目标机制/切片：`M-019`、`M-025`、`M-034`、`VS-037`。

输入资料：Role2 `hit9`、四个 `doHit9*()` 与 projectile 索引。

输出产物：第 45/55 帧等价的 `hit9_2/hit9_1` 多段占位 projectile、伤害与测试。

完成定义：技能按原 MP/动作门禁触发，两窗口位置、命中间隔、失重恢复和生命周期可观察可测；本任务先不接分身变体。

验收标准：结构、系统测试、构建和 workflow 检查通过。

禁止范围：不实现 `shy`；不修改原始提取。

状态更新：四份正式任务状态文档。

推荐后续任务：`TASK-SLICE-089`。

### TASK-SLICE-089

任务类型：`TASK-SLICE`。

目标机制/切片：`M-019`、`M-025`、`M-034`、`VS-037`。

输入资料：`Role2Shadow.as`、Role2 的 `shy/doHit10()` 与已完成 Role2 技能系统。

输出产物：8 秒分身、创建/召回传送、`xbz/myhc/tjgl/jhsj` 同步变体、占位资源和测试。

完成定义：首按创建且扣 MP，次按传送/销毁且不重复扣 MP，超时清理；分身同步四种动作并使用已确认弱化/支援边界，双玩家来源不串扰。

验收标准：结构、系统测试、构建和 workflow 检查通过。

禁止范围：不复刻 AS3 继承架构，不实现联机同步，不猜真素材。

状态更新：四份正式任务状态文档。

推荐后续任务：为下一角色完整技能扩展建立逆向任务。

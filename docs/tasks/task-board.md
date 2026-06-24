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

Role3 八戒完整战斗扩展已经交付，当前没有未完成的 Role3 任务。
Role1 `slz/sx` 与组合输入基础已经交付；当前推荐恢复 `TASK-SLICE-096`：实现 Role1 `lys/hytj` 位移协同。
Role4 毒系、巫毒娃娃、毒链、三项双形态位移攻击、标记传送与终结技已经交付；当前没有未完成的 Role4 任务。

## 待完成任务

| Task | 状态 | 类型 | 目标 | 目标机制/切片 | 输出 | 下一步 |
| --- | --- | --- | --- | --- | --- | --- |
| TASK-SLICE-096 | Ready | 切片 | Role1 `lys/hytj` 位移协同 | VS-039、M-018、M-024、M-025、M-034 | Role1 位移技能系统、projectile、独立测试 | `TASK-SLICE-097` |
| TASK-SLICE-097 | Planned | 切片 | Role1 `lyfb/jdy` 多段与二段链 | VS-039、M-018、M-025、M-034 | Role1 多段技能系统、projectile、独立测试 | `TASK-SLICE-098` |
| TASK-SLICE-098 | Planned | 切片 | Role1 `qsez/zz` 分身协同 | VS-039、M-018、M-025、M-034 | Role1 分身系统、projectile、独立测试 | `TASK-SLICE-099` |
| TASK-SLICE-099 | Planned | 切片 | Role1 `hmz/hyjj` 终结技能 | VS-039、M-018、M-025、M-034 | Role1 终结技能系统、projectile、独立测试 | 后续 Role4/Role5 逆向任务 |

## 任务完成定义

### TASK-SLICE-096

任务类型：
- `TASK-SLICE`

目标机制/切片：
- `VS-039`、`M-018`、`M-024`、`M-025`、`M-034`。

输入资料：
- 正式代码任务必读集、三份 Role1 逆向索引、`Role1.as` 的 `lys/hytj` 小范围证据。

输出产物：
- Role1 位移技能系统、projectile/场景桥接/占位资源和独立测试。

完成定义：
- 完成 `lys` 横冲与上键腾空形态、36ms 门禁、重力恢复；完成 `hytj` 正式槽位、跑动普攻入口、四段冲刺和 MP 不足回退。

验收标准：
- 输入、MP/等级伤害、移动/重力、动作恢复与 P1/P2 隔离有自动测试；结构、系统、构建、工作流检查通过。

禁止范围：
- 不修改提取结果，不实现其他 Role1 技能，不伪造真素材。

状态更新：
- `task-board.md`、`task-history.md`、`mechanics-index.md`、`vertical-slices.md`。

推荐后续任务：
- `TASK-SLICE-097`。

### TASK-SLICE-097

任务类型：
- `TASK-SLICE`

目标机制/切片：
- `VS-039`、`M-018`、`M-025`、`M-034`。

输入资料：
- 正式代码任务必读集、三份 Role1 逆向索引、`Role1.as`/`Role1Shadow.as` 的 `lyfb/jdy` 小范围证据。

输出产物：
- Role1 多段/二段技能系统、projectile/场景桥接/占位资源和独立测试。

完成定义：
- 完成 `lyfb` 跟随+移动双段及分身派生接口；完成 `jdy` 首段扣 MP、同键二段免 MP、弹体替换和重力恢复。

验收标准：
- 时序、段数、伤害/击退、重入、清理和 P1/P2 隔离有自动测试；结构、系统、构建、工作流检查通过。

禁止范围：
- 不修改提取结果，不提前实现分身生成或其他技能，不伪造真素材。

状态更新：
- `task-board.md`、`task-history.md`、`mechanics-index.md`、`vertical-slices.md`。

推荐后续任务：
- `TASK-SLICE-098`。

### TASK-SLICE-098

任务类型：
- `TASK-SLICE`

目标机制/切片：
- `VS-039`、`M-018`、`M-025`、`M-034`。

输入资料：
- 正式代码任务必读集、三份 Role1 逆向索引、`Role1.as`/`Role1Shadow.as` 与 `BaseMonster.as` 的分身小范围证据。

输出产物：
- Role1 分身协同系统、projectile/场景桥接/占位资源和独立测试。

完成定义：
- 完成 `qsez` 冲刺碰撞、1.25 秒恢复、非 boss 1~2/boss 4~5 个三秒分身；完成 `zz` 本体两窗口与分身同步后销毁。

验收标准：
- 目标分类、随机边界、分身时限/同步/清理、伤害和 P1/P2 隔离有自动测试；结构、系统、构建、工作流检查通过。

禁止范围：
- 不修改提取结果，不扩展分身到源码未支持的技能，不伪造真素材。

状态更新：
- `task-board.md`、`task-history.md`、`mechanics-index.md`、`vertical-slices.md`。

推荐后续任务：
- `TASK-SLICE-099`。

### TASK-SLICE-099

任务类型：
- `TASK-SLICE`

目标机制/切片：
- `VS-039`、`M-018`、`M-025`、`M-034`。

输入资料：
- 正式代码任务必读集、三份 Role1 逆向索引、`Role1.as` 的 `hmz/hyjj` 小范围证据。

输出产物：
- Role1 终结技能系统、projectile/场景桥接/占位资源和独立测试。

完成定义：
- 完成本地可达的 `hmz hit10_2 -> hit10_4` 链，不实现证据不足的 `hit10_3/hmzCharge`；完成 `hyjj` 面向侧目标轮询、4 次 1.2 秒爆破和动作后延迟链。

验收标准：
- 时序、选敌、伤害/击退、动作后生命周期、证据拒绝边界和 P1/P2 隔离有自动测试；结构、系统、构建、工作流检查通过。

禁止范围：
- 不修改提取结果，不猜补 `hit10_3/hmzCharge`，不伪造真素材。

状态更新：
- `task-board.md`、`task-history.md`、`mechanics-index.md`、`vertical-slices.md`。

推荐后续任务：
- 按机制表生成 Role4 或 Role5 逆向任务。

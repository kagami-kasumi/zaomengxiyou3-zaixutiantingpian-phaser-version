# TASK-SLICE-216

任务类型：
- `TASK-SLICE`

任务模型：
- `常规任务`

逆向子类型：
- 不适用

逆向方案：
- 不适用

功能条线：
- `LINE-PRE-STAGE-2-3-PRESENTATION`（Active；Planned，等待 215 verified）

目标机制/切片：
- `M-032`、`M-035`、`M-042`、`M-049`、`M-054`、`VS-072`

规模预算：
- 主工作包：2
- 预计上下文压缩：0
- 独立验收批次：2

拆分触发：
- 若 215 留下实现影响 unresolved，或需要同时实现治疗/回蓝/蓝耗/miss、新存档字段、第二套战斗 Runtime 或新的共享 UI 组件族，先拆同线解除项；不得用 `hurtnum` 或现代文本代替 `pnum`。
- 允许把 210A 已有的 localhost-only 全宠物 QA fixture 接入 5173 可发现入口；若必须改变正式存档 schema、生产槽位规则或非本地环境可见性，立即拆分，不在本 task 扩权。

协作计划：
- 模式：单 agent
- 并行工作包：无
- 写入 owner：主 agent
- 归并检查点：共享事件/显示链完成后、正式运行验收前
- 方法观测：无

输入资料：
- 215 的 verified manifest、证据矩阵、逐状态原版基准、generator/check 和完整 acceptance handoff。
- 当前 `HeroCombatSystem`、`Stage1CombatSystem`、`PetCombatRuntime`、环境伤害、`CombatFeedbackSystem/View`、TestScene 与正式五关消费者。

输出产物：
- 角色/宠物承伤经 215 冻结的成功与数值语义生成 typed incoming-damage feedback；怪物攻击、声明的环境/持续伤害入口共用稳定 event id、target kind/owner、HP before/after、world anchor 和生命周期。
- `pnum0..9` 由 combat-common 唯一加载，显示层直接消费 215 真值投影；不得影响 211/212 的怪物 `hurtnum/bnum`、连击计数、最高连击或结果页。
- TestScene 与正式五关 P1/P2 使用同一 producer/view；角色与出战宠物的受击数字、hurt/dead、返回/重试/重载清理同链。
- 5173 默认本地验收入口可发现并创建/刷新 210A 已有全宠物 QA 存档，不再要求用户预先知道 `?qaPetSave=all`；4174、非 localhost 与正式存档 schema/普通槽位规则保持隔离。
- source-isolated 黑盒 trace、负场景、专项测试、runtime audit 与 940×590 逐状态差异证据。

UI 原生化合同：
- 显示列表清单：直接消费 215 冻结的 `ANumber/pnum` 对象树、字形、位距、锚点、矩阵、动画和销毁。
- 原版机器真值 JSON：运行时和测试断言 `task-settings-215.player-pet-incoming-damage-feedback` 的 truthId/status/完整性并消费其投影；禁止复制坐标表。
- 原版视觉基准：使用 215 的角色/宠物、P1/P2 和逐时间点 940×590 基准。
- 允许的现代视觉例外：只允许稳定 event/runtime id；不新增可见替代层。
- 逐状态验收：角色/宠物、P1/P2、普通/致死/无效/重复命中、215 判定适用的护盾/无敌/转嫁/环境状态，以及重试/返回/重载。
- 差异证据：逐状态并排/叠图、对象/字形/几何/时序差异及 attack→accepted HP delta→feedback→destroy 一一对应 trace。

完成定义：
- 怪物及 215 声明的其他 incoming-damage producer 对角色/宠物造成有效承伤时，正式五关与 TestScene 均以原版 `pnum` 给出正确、唯一、可清理的 P1/P2 数字反馈；无效命中无假数字，现有怪物伤害数字和连击语义不回归。

验收标准：
- 215 generator/check、Schema/完整性、字段级 verifier 与关键值/owner/timing mutation-kill 通过。
- incoming-damage 专项覆盖角色/宠物、P1/P2、正式五关/TestScene、0/致死/无敌/护盾/转嫁/去重及生命周期；原 211/212 战斗反馈专项保持通过。
- 5173 无隐藏知识旅程能看到并使用全宠物 QA 存档入口，刷新后 fixture 保持可复验；无查询参数误触发、非 localhost 暴露或正式槽位污染。
- `npm run test:systems`、`npm run build`、`npm run check:structure`、`npm run check:annotations`、`npm run check:workflow`、`npm run audit:problems` 与 `git diff --check` 通过。
- 940×590 正式双人至少一关观察到角色和宠物 HP decrease 与各自头顶 `pnum` 一一对应，返回/重试/重载无残留，console warning/error 为 0。

禁止范围：
- 不修改伤害公式、怪物 AI、宠物家族行为、存档 schema、治疗/MP/miss；不把受击数字计入连击；不重做 211/212 资源或结果页。

状态更新：
- 更新机制/切片、当前线覆盖台账、task-board/history；完成后恢复按完整家族方法生成下一未闭合宠物家族，全部家族完成后再进入 194。

推荐后续任务：
- 继续下一未闭合宠物家族；九家族全部完成后执行 `TASK-SLICE-194`。

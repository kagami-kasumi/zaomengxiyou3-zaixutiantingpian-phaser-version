# TASK-SETTINGS-197

任务类型：
- `TASK-SETTINGS`

功能条线：
- `LINE-PRE-STAGE-2-3-PRESENTATION`（Active；Planned）

目标机制/切片：
- `M-015`、`M-041`、`M-049`、`M-052`、`VS-069`

规模预算：
- 主工作包：2
- 预计上下文压缩：0
- 独立验收批次：2

拆分触发：
- 若 P1/P2 技能 HUD 来自两个独立恢复源根，或原版 HUD 还包含需独立逆向的冷却/遮罩时间轴，立即拆补证 task；本 task 不修改 `src/`。

协作计划：
- 模式：单 agent
- 并行工作包：无
- 写入 owner：主 agent
- 归并检查点：不适用
- 方法观测：无

输入资料：
- `reverse-engineering-protocol.md`、`combat-hud-index.md`、`skills-input-index.md`、`skill-ui-native-index.md`、175D/183 技能功能页证据、131 战斗 HUD 证据与当前 snapshot/bridge。
- 恢复 HUD/role UI SWF 中的技能槽、图标、键位、不可用/冷却状态，以及 `User.skillbykey` / `sendSkill` 到 HUD 的动态调用链。

输出产物：
- 战斗技能 HUD 六段证据矩阵，明确与技能功能页是两个显示列表，列出五槽、图标、键位、空槽、不可用/MP/冷却与 P1/P2 几何/生命周期。
- 战斗 HUD 独立 `verified` 原版机器真值 JSON、940×590 基准、完整性/反证和 198/199 无未知合同。

UI 原生化合同：
- 显示列表清单：技能 HUD 根、五槽、图标、键位、遮罩/边框/字段、depth、P1/P2 父子链、矩阵和动态 child。
- 原版机器真值 JSON：新建独立 truthId/Schema/源 hash/locator/状态集，对象/父子链/基准尺寸完整且 `unresolved=[]`。
- 原版视觉基准：记录版本、角色、P1/P2、绑定/MP/冷却状态、舞台 940×590 和裁切。
- 允许的现代视觉例外：空清单；若原版无冷却视觉，不自行添加。
- 逐状态验收：五角色、P1/P2、空槽/已绑定、可用/MP 不足/冷却/释放、进关/返回/重试/重载。
- 差异证据：并排/叠图、边缘/几何差异、对象差异与字体容差。

完成定义：
- 能明确回答用户“角色技能在哪个战斗 UI 中显示、显示什么、如何从绑定 owner 更新”，198/199 影响实现的未知为零。

验收标准：
- 恢复 SWF/时间轴、AS3 绑定/释放链和现代 HUD owner 交叉；manifest Schema/完整性、annotations、workflow、diff check 通过。

禁止范围：
- 不重做 175D/183 技能功能页，不改技能数值/释放规则/存档，不用文本技能名占位真 HUD。

状态更新：
- 更新 `combat-hud-index.md`、`skills-input-index.md`、机制/切片状态、本线台账、task-board/history 与适用 PG 反馈。

推荐后续任务：
- `TASK-SLICE-198`

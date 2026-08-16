# TASK-SETTINGS-175A

任务类型：
- `TASK-SETTINGS`

功能条线：
- `LINE-CORE-PROGRESSION-COMPLETION`（Active；Ready）

目标机制/切片：
- `M-035`、`M-042`、`M-052`、`VS-054`

规模预算：
- 主工作包：2
- 预计上下文压缩：0
- 独立验收批次：2

拆分触发：
- 若 932 之外还需读取第二个新视觉源包，或进入 `src/` 可见实现，立即停止并拆分；本 task 只闭合宠物页真值。

协作计划：
- 模式：单 agent
- 并行工作包：无
- 写入 owner：主 agent
- 归并检查点：不适用
- 方法观测：无

输入资料：
- `reverse-engineering-protocol.md`、ground-truth Schema、`TASK-SETTINGS-175-functional-ui-truth-audit.md`、`pets-index.md`、`full-function-ui-index.md`。
- 恢复源 `assets/pet1.swf`，SHA-256 `0699A5D3A49EA8024D3635B18C6349F5D7F7CF5F1DB869DD18A0A5EE6DE60644`，根 character 932；对应 `PetInterface`/`PetHeadSprite` AS3 只作行为交叉确认。

输出产物：
- 宠物页完整显示列表、六段证据矩阵、原版逐状态基准与 `docs/reverse-engineering/ground-truth/manifests/task-settings-175a-pet-page.json`。
- 冻结后续单页实现合同；不修改 `FormalPetPageView.ts`。

UI 原生化合同：
- 显示列表清单：932 根及列表行、属性/技能区、分页、操作/确认、TextField、按钮态、动态 child、命中区、注册点和嵌套矩阵。
- 原版机器真值 JSON：truthId `task-settings-175a.pet-page`；状态集覆盖空/有宠、两页、selected、出战/休息、放生确认、洗练/进化、8 技能、P1/P2、关闭；Schema、源 SHA/locator、对象数、父子链和 `unresolved=[]` 全部核对。
- 原版视觉基准：原版 1.1、940×590、932 各状态；只从恢复 SWF/可追溯运行态生成。
- 允许的现代视觉例外：空；现有暗层、矩形、Arial 标题/按钮均记待整改。
- 逐状态验收：normal/hover/pressed/selected、分页、动态内容、P1/P2、进入/返回。
- 差异证据：冻结原版/当前同尺寸并排、叠图和逐对象差异入口；实际整改证据由后续实现 task 完成。

完成定义：
- 932 的显示列表和状态集无影响实现的未知，manifest 达 `verified`；实现 task 才可解除阻塞。

验收标准：
- Schema、源哈希、locator、状态/对象完整性、基准尺寸与自动回测通过；`npm run check:workflow`、适用标注检查、`git diff --check` 通过。

禁止范围：
- 不修改 `src/`，不读取其他页面源包，不把业务/owner 测试当视觉完成。

状态更新：
- 更新审计、覆盖台账、mechanics/vertical slices、task-board/history；manifest verified 后生成宠物单页实现 task。

推荐后续任务：
- `TASK-SETTINGS-175B`；宠物实现 task 由本页 manifest verified 后另行生成并排入同线。

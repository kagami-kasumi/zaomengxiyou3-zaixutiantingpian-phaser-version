# TASK-SLICE-171

任务类型：

- `TASK-SLICE`

功能条线：

- `LINE-CORE-PROGRESSION-COMPLETION`（Active；170D 已闭合全装备正式 UI）

目标机制/切片：

- `M-036`、`M-037`、`M-044`、`M-051`、`M-052`、`VS-064`

规模预算：

- 主工作包：2（Fusion 9 条时装与打造百分数/V6 兼容；164 件四事务联合重放）
- 预计上下文压缩：0
- 独立验收批次：2

拆分触发：

- 若 9 条时装需要新视觉资源/新 UI manifest、百分数兼容必须升级存档 schema，或 164 件重放暴露 170A 权威数据错误，立即拆出同线证据/存档前置任务；本 task 不私建 V7、不重做页面。

协作计划：

- 模式：单 agent
- 并行工作包：无
- 写入 owner：主 agent
- 归并检查点：三项已知缺口闭合后、四事务联合重放前
- 方法观测：无

输入资料：

- `docs/reverse-engineering/workshop-rules-completeness-audit.md`、`equipment-workshop-index.md`、`crafting-index.md`。
- 170A 164 件权威数据、170C 唯一目录、现有强化/合成/分解/打造 systems、`FormalWorkshopPageSystem` 与 V6 codec。

输出产物：

- Fusion 9 条原版时装时戳配方的证据内实现或经用户批准的显式永久时装现代例外。
- 打造 `wptlz/wpllz/wpflz` 小数比例到现代百分数点适配，以及既有 V6 制作实例兼容裁决。
- 164 件装备在强化准入/成长、分解品质/类型/角色、Fusion 属性继承、打造静态产物/宝石叠加上的 P1/P2 联合重放。

完成定义：

- 审计登记的 9 条 Fusion、三类打造百分数和全装备依赖全部关闭；成功/拒绝/失败/返还、灵魂/材料、容量、实例字段、双 owner 与保存重载保持单一事务 owner。
- 不改变 168A/168B 四页 verified UI、170D 正式装备页或 170A/170C 权威目录；本 task 只宣称四功能事务闭合，不越级完成人物成长、存档整线、左下入口或 UI 整改。

验收标准：

- 执行前 `npm run check:structure`；按目标文件 warning/error 门禁处理。
- 运行强化、crafting、分解、打造、正式 workshop、soul/V6、equipment data/catalog、systems、build、workflow、problem audit 与 `git diff --check`。
- P1/P2 正式四页提交/拒绝/返还/关闭/重载旅程 console warning/error 为 0。

禁止范围：

- 不修改 `legacy-extraction`，不建立第二 inventory/equipment/soul/save owner，不重做四页或装备页视觉。
- 不处理五角色成长、统一存档扩展、关卡左下五入口或用户 UI 整改清单。

状态更新：

- 更新 workshop 审计、mechanics、功能线覆盖、task-board/task-history；完成后生成同线五角色成长证据 task。

推荐后续任务：

- 同线五角色基础值、经验表、成长与升级时序证据任务。


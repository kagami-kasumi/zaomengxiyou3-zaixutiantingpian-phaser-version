# TASK-SETTINGS-169

任务类型：

- `TASK-SETTINGS`

功能条线：

- `LINE-CORE-PROGRESSION-COMPLETION`（Ready；`TASK-SLICE-168B` 已归档）

目标机制/切片：

- `M-036`、`M-039`、`M-044`、`VS-064`

规模预算：

- 主工作包：2
- 预计上下文压缩：0
- 独立验收批次：2

拆分触发：

- 如果审计需要新派生装备视觉资源、实现业务修复或展开完整 1.1 装备数值表，立即只登记缺口并拆给同线后续 task；本 task 只冻结规则证据和实现差异。

协作计划：

- 模式：单 agent
- 并行工作包：无
- 写入 owner：主 agent
- 归并检查点：四功能证据矩阵完成后、缺口裁决前
- 方法观测：无

输入资料：

- `docs/workflow/reverse-engineering-protocol.md`、`equipment-workshop-index.md`、`crafting-index.md`、`crafting-ui-index.md` 与现有装备/合成权威表。
- `local-resources/regima/source/restored-swfs/` 中的目标源包，以及 `StrengthEquipment.as`、`Fusion.as`、`Resolution.as`、`Making.as`、`AllEquipment.as` 与实际共享消费者；恢复 SWF 优先，`legacy-extraction` 只读对照。
- `EquipmentStrengtheningSystem.ts`、`CraftingSystem.ts`、`EquipmentResolutionSystem.ts`、`EquipmentMakingSystem.ts`、四份 verified UI manifest 与 168A/168B 联合回归结果。

输出产物：

- 强化、合成、分解、打造逐功能的准入、输入、费用、随机、成功/失败/拒绝、返还、库存容量、实例字段、P1/P2 owner、V6 往返证据矩阵。
- 每项规则标注原版事实、当前实现、状态（闭合/缺失/推断/未知）、证据等级、反证条件与责任 owner。
- 明确区分可在现有目录闭合的缺口、依赖完整装备数据的缺口和需要独立实现/迁移 task 的缺口，并形成后续全装备 task 的有界输入。

完成定义：

- 四功能所有可观察规则均有原版证据与现代实现的逐项映射；无证据项保持推断/未知，不补成原版事实。
- 当前规则覆盖、可复现缺陷、全装备依赖和存档影响均有可执行关闭标准；不得用 UI 已原生化推出业务规则已完整。
- 形成同线下一全装备数据/UI task 的输入边界，并保留全装备就绪后的四事务收口阶段。

UI 原生化合同：

- 显示列表清单：不适用；本 task 不修改 UI，四页显示列表沿用 167/168A/168B 已验证合同。
- 原版机器真值 JSON：不新增；继续引用四份 `task-settings-167-workshop-*.json`，只用于确认 UI 字段与业务反馈边界。
- 原版视觉基准：不新增；沿用 167/168B 的 940×590 原版/现代证据，不以视觉通过替代规则证明。
- 允许的现代视觉例外：不新增可见例外。
- 逐状态验收：仅将既有四页状态映射到规则矩阵；不做页面实现改动。
- 差异证据：规则差异表替代新像素差异；如发现新视觉缺口则登记并拆分，不在本 task 修复。

验收标准：

- 遵循六段证据链，覆盖局部 AS3、共享调用方、现代消费者、确定性测试与正式运行观察；每个结论可回溯到具体 locator。
- 运行四功能专项及适用静态/数据检查，确认审计描述与当前代码一致；运行 workflow、structure、problem audit 与 `git diff --check`。
- 审计文档通过 `npm run check:annotations` 与 `npm run check:workflow`，未知和反证条件不得为空泛。

禁止范围：

- 不新增配方、装备数值、制作书、掉落或可穿戴定义，不修改四功能事务代码。
- 不重新生成 `legacy-extraction`，不建立第二套 inventory、transaction、random 或 save owner。
- 不因发现缺口而顺手进入完整装备提取、UI 实现、人物成长或 schema 升级。

状态更新：

- 更新 mechanics、功能线覆盖、task-board/task-history 和适用 PG 反馈；完成后生成同线全装备数据与 UI task。

推荐后续任务：

- 依据审计矩阵生成原版 1.1 全装备数据与 UI 的同线 task；装备全集就绪后再生成四功能事务收口 task。

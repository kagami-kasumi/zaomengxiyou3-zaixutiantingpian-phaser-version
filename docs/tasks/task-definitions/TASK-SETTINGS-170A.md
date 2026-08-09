# TASK-SETTINGS-170A

任务类型：

- `TASK-SETTINGS`

功能条线：

- `LINE-CORE-PROGRESSION-COMPLETION`（Ready；`TASK-SETTINGS-169` 已归档）

目标机制/切片：

- `M-036`、`M-037`、`M-044`、`VS-064`

规模预算：

- 主工作包：2
- 预计上下文压缩：0
- 独立验收批次：2

拆分触发：

- 如果 164 件可穿戴装备的基础字段和强化成长不能在一个可重复生成的数据管线内闭合，立即按来源族拆成 170A1/170A2；发现需要派生穿戴视觉、修改现代 registry/页面、修复四功能事务或升级存档 schema 时只登记并拆给后续 task。

协作计划：

- 模式：单 agent
- 并行工作包：无
- 写入 owner：主 agent
- 归并检查点：权威字段 schema 冻结后、164 项完整性核对前
- 方法观测：无

输入资料：

- `docs/workflow/reverse-engineering-protocol.md`、`workshop-rules-completeness-audit.md`、`equipment-index.md`、`inventory-resource-catalog.md` 与现有 1.0/1.1 装备表。
- `local-resources/regima/source/restored-swfs/` 的原始命名装备/UI 源包；`AllEquipment.as`、`MyEquipObj.as`、`BackPack.as`、装备共享消费者与恢复 SWF 优先证据。
- 当前 431 身份目录、164 equipment 子集、`EquipmentSystem.ts`/`InventoryResourceCatalog.ts` 只读映射与 V6 字段单位约定。

输出产物：

- 原版 1.1 的 164 件可穿戴装备权威数据集：身份、显示、类型、槽位、角色、品质、基础 12 属性、强化成长、实例/堆叠语义、原字段单位、精确 locator、证据等级和反证条件。
- 与 431 入包目录的一对一覆盖报告；重复注册按 `AllEquipment.findByName` 实际优先级裁决，未知值保持空缺而非补成 0。
- 供后续全装备 UI 证据、现代数据接入与四事务全量重放直接消费的 schema/生成或校验入口。

完成定义：

- 164 件 equipment 身份均有唯一记录并与现有 431 stable key 对齐；字段覆盖率、未知列表和来源优先级可自动复查。
- 基础数值、百分数单位、强化成长和角色/品质/槽位门禁均区分确认事实、推断、未知与现代设计选择；不得从现有种子 definition 反推原版。
- 数据范围可作为强化、Fusion、分解、打造和 V6 的共同输入，但本 task 不据此宣称现代 UI/事务已经全量完成。

UI 原生化合同：

- 显示列表清单：本 task 不逆向装备页面显示列表；只记录后续 UI 证据所需的资源身份与动态字段输入。
- 原版机器真值 JSON：纯装备数据使用独立数据 schema，不滥用 UI schema；后续 UI task 必须另生成 verified UI manifest。
- 原版视觉基准：本 task 不新增页面基准；只引用可追溯真图标/穿戴资源 provenance，不能以图标存在证明装备 UI 完成。
- 允许的现代视觉例外：不新增。
- 逐状态验收：不适用；后续 UI task 覆盖背包、装备栏、角色切换、P1/P2、穿脱与动态属性。
- 差异证据：本 task 输出数据覆盖/字段差异，不做像素差异。

验收标准：

- 遵循六段证据链；纯数据几何标记不适用并说明，任何穿戴空间结论必须回到恢复 SWF。
- 自动核对 164 唯一身份、431 子集关系、字段 schema、locator、未知/反证非空规则和来源优先级。
- 运行适用的 inventory catalog、annotation、workflow、problem audit 与 `git diff --check`；不得为通过检查填造未知数值。

禁止范围：

- 不修改四功能事务、现代装备数值、正式背包/装备 UI、穿戴角色视觉或存档 schema。
- 不重新生成 `legacy-extraction`，不以 1.0 表覆盖 1.1 AS3，不建立第二套 equipment/inventory identity owner。
- 不在同一 task 派生全量穿戴资源或执行 164 件现代页面回放。

状态更新：

- 更新 mechanics、功能线覆盖、task-board/task-history；完成后生成同线全装备 UI 证据 task。

推荐后续任务：

- `TASK-SETTINGS-170B`：冻结全装备背包/穿戴 UI、角色资源与动态字段的显示列表、verified 真值和逐状态基准；数据与 UI 证据闭合后再生成现代全集接入 task。

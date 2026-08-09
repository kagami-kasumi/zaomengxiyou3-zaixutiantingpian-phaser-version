# TASK-SLICE-168B

任务类型：

- `TASK-SLICE`

功能条线：

- `LINE-CORE-PROGRESSION-COMPLETION`（Ready；`TASK-SLICE-168A` 已归档）

目标机制/切片：

- `M-036`、`M-039`、`M-052`、`VS-064`

规模预算：

- 主工作包：2
- 预计上下文压缩：0
- 独立验收批次：2

拆分触发：

- 如果分解或打造需要 `backpack1.swf` 外的新视觉资源族，或四页联合校准暴露事务规则/完整装备数据缺口，立即把规则问题留给下一审计 task；本 task 不借 UI 名义扩展业务。

协作计划：

- 模式：单 agent
- 并行工作包：无
- 写入 owner：主 agent
- 归并检查点：两页原生层完成后、四页联合验收前
- 方法观测：无

输入资料：

- `docs/reverse-engineering/evidence/TASK-SETTINGS-167-workshop-left-pages.md` 的 resolution/making 与共用差异章节。
- `ground-truth/manifests/task-settings-167-workshop-resolution.json`、`task-settings-167-workshop-making.json`，以及 168A 已消费的两份 manifest。
- `Resolution.as`、`Making.as`、`StrengthEquipment.as`、character 177/152 与同源按钮记录；恢复 SWF 优先，旧提取只读。
- 168A 的共享原生左页组件/测试接缝、当前分解/打造 systems 与正式 host。

输出产物：

- 分解页按 177 的目标、六结果 child、费用和 176 按钮态组合；打造页按 152 的制作书、需求材料、三宝石、产物、六文字字段和 139 按钮态组合。
- 删除 Arial 槽名和页底现代摘要；原版静默/全局反馈边界得到明确保留，现代安全拒绝不冒充页内原版字段。
- 四页共同完成 P1/P2、切页返还、关闭/返回、原按钮态、动态 child 层级与 165D 右栏联合校准。
- 实现和专项测试直接读取四份 verified manifest；留下下一“炼丹炉四功能规则完整性审计”task 的缺口输入。

完成定义：

- 分解空/暂存/六结果/拒绝和打造空书/有书/材料/宝石/产物/拒绝逐状态闭合；normal/hover/pressed/selected 有原生状态。
- 四页在同一正式 host 中没有现代文字/SVG 占位替代，右侧 25 格背包、owner、事务和 V6 不回归。
- 原版/现代逐页对象差异清零或逐项记录获准例外；当前允许例外只有宿主安全反馈和 P1/P2 selector。

UI 原生化合同：

- 显示列表清单：`TASK-SETTINGS-167-workshop-left-pages.md#resolution/#making`，联合合同包含该文档全部四页。
- 原版机器真值：四份 `task-settings-167-workshop-*.json` 均须为 `verified`，实现和测试直接消费。
- 原版视觉基准：`docs/tasks/evidence/TASK-SETTINGS-167/original-resolution-940x590.png`、`original-making-940x590.png` 及 strength/fusion 基准。
- 允许的现代视觉例外：宿主安全拒绝反馈、P1/P2 selector；没有其他可见例外。
- 逐状态验收：分解空/目标/六结果/拒绝；打造空书/有书/需求材料/三宝石/产物/拒绝；四页 normal/hover/pressed/selected、P1/P2、返还和关闭返回。
- 差异证据：四页逐状态并排、50% 叠图和逐对象差异表。

组件化合同：

- 复用 168A 的 manifest 投影、原生按钮状态和动态物品 child 接缝，以及 165D grid/余额/关闭生命周期；不得为 177/152 复制第二套 helper 或状态 owner。
- 共用组件只负责显示对象投影与生命周期，四页面的字段集合、槽位 identity、事务命令和原生几何仍由各 manifest/页面配置拥有。
- 联合验收必须覆盖四页重复打开/切换/销毁、P1/P2、右栏刷新和暂存返还，确认共享层没有引入统一现代皮肤。

验收标准：

- 修改现有文件前先运行 `npm run check:structure`；触发 error 时先拆分。
- 分解/打造/强化/合成/host/grid/asset-bundle 专项、全系统、build、structure、annotations、workflow、problem audit 与 `git diff --check` 通过。
- 内置浏览器 940×590 验证 P1/P2、四页逐状态、暂存/提交/拒绝/返还、关闭返回和 console 零 warning/error。

禁止范围：

- 不扩展四功能规则、全装备数值、人物成长或存档 schema；只登记下一审计输入。
- 不修改 `legacy-extraction`，不新增第二套坐标、inventory、transaction 或 save owner。
- 不用整页背景、业务可用或零 console 单独关闭 UI。

状态更新：

- 更新 mechanics、功能线覆盖、纵向切片、资源标注、task-board/task-history 和适用 PG 反馈；完成后生成同线四功能规则完整性审计 task。

推荐后续任务：

- 依据四页联合验收结果生成炼丹炉四功能规则完整性审计 task；不得提前宣称四功能全量完成。

# TASK-SETTINGS-167

任务类型：

- `TASK-SETTINGS`

功能条线：

- `LINE-CORE-PROGRESSION-COMPLETION`（Active；本 task 为唯一 Ready）

目标机制/切片：

- `M-036`、`M-039`、`M-052`、`VS-064`

规模预算：

- 主工作包：2
- 预计上下文压缩：0
- 独立验收批次：2

拆分触发：

- 如果 198/169/177/152 中任一页需要跨入新的共享资源包，或四页合计出现两个以上无法在当前资料族闭合的动态 owner，立即按页面族拆成同线补证 task；本 task 不写现代页面。

协作计划：

- 模式：单 agent
- 并行工作包：无
- 写入 owner：主 agent
- 归并检查点：验收前
- 方法观测：无

输入资料：

- `docs/workflow/reverse-engineering-protocol.md`、`docs/reverse-engineering/equipment-workshop-index.md`、`docs/reverse-engineering/crafting-ui-index.md` 与本线覆盖台账。
- `local-resources/regima/source/restored-swfs/assets/backpack1.swf` 中 character 119/198/169/177/152 及其实际依赖 Symbol；视觉资源存在性以恢复语料库为准。
- `StrengthEquipment.as`、`Strength.as`、`Fusion.as`、`Resolution.as`、`Making.as` 及沿显示列表/动态字段调用链窄查到的共享 AS3；`legacy-extraction` 只读。
- 当前 `FormalWorkshopPageView` 和 940×590 运行样本，只用于建立差异清单，不反推原版事实。

输出产物：

- 在 `equipment-workshop-index.md` 补齐四页根/子 Symbol、depth、父子关系、注册点、嵌套矩阵、文字字段、按钮状态、动态 child、槽位和命中区的完整清单。
- 按 Schema 生成四页 `verified` 原版机器真值 JSON，记录源 hash/locator、状态集、完整性核对、证据矩阵和实现/测试直接消费入口。
- 建立可追溯原版视觉基准与当前现代页面逐状态差异清单，显式指出现代文字/SVG 占位、缺失 Symbol 和未知。
- 依据证据把左页实现拆成一至两个 0-compact 同线 task，不在同一 task 合并新资源族、四页大范围实现和端到端校准。

完成定义：

- 四页的静态背景、操作槽、材料/产物槽、按钮、费用/成功率/名称/反馈文字、动态物品 child、选择/拒绝/成功/失败状态均有可复查证据。
- 每页 verified manifest 通过 Schema、溯源与完整性检查；只有到达 verified 后，对应实现 task 才可 Ready。
- 所有影响首批左页实现的视觉/几何/状态未知为零；不能清零时只生成同线补证 task，不伪造原版事实。

UI 原生化合同：

- 显示列表清单：`equipment-workshop-index.md` 的 198/169/177/152 四页章节，须补齐根/子 Symbol、depth、父子关系、注册点/矩阵、文字、按钮、动态 child、槽位和命中区。
- 原版机器真值 JSON：依据 `docs/reverse-engineering/ground-truth/schema/` 选择适用 Schema，以 `task-settings-167.workshop-left-pages` 为 truthId 前缀生成 `docs/reverse-engineering/ground-truth/manifests/` 下 manifest；未达 `verified` 时阻塞实现。
- 原版视觉基准：940×590 舞台，从原始 character 119 入口分别覆盖强化/合成/分解/打造的空态、有材料态和交易反馈态；记录来源、帧/状态和裁切。
- 允许的现代视觉例外：空清单；如确有证据缺口，必须在后续实现前单独获得用户批准。
- 逐状态验收：四页 normal/hover/pressed/selected，空槽/已选材料/预览/成功/失败/拒绝，P1/P2，切页返还，关闭与返回。
- 差异证据：每页原版/现代并排与 50% 叠图、可见对象差异清单、必要的边缘/几何容差解释。

验收标准：

- 恢复源 SWF、局部 AS3 与实际显示消费者交叉确认；空态整页根不得单独代替动态显示列表证据。
- 关键结论分级为确认事实/交叉确认/推断/未知/现代设计选择，并列出反证条件。
- `npm run check:annotations`、`npm run check:workflow` 和 `git diff --check` 通过；新实现 task 满足 0-compact 规模门禁。

禁止范围：

- 不修改、删除或重新生成 `local-resources/regima/legacy-extraction/`。
- 不修改 `src/`，不在证据任务内派生全量页面资源或执行 940×590 现代视觉关闭。
- 不同时扩展四功能规则、全装备数值、人物成长或存档 schema。
- 不以当前 SVG/文字占位、旧现代截图或单张整页背景补成原版事实。

状态更新：

- 更新 `equipment-workshop-index.md`、`mechanics-index.md`、本线覆盖台账、资源标注、task-board/task-history 与适用 PG 反馈。

推荐后续任务：

- 依据 verified 真值生成同线左侧四页原生化实现 task；若证据未闭合，只生成最小补证 task。

# TASK-SLICE-165C

任务类型：`TASK-SLICE`

功能条线：`LINE-PRE-STAGE-2-3-COMPLETION`（Active；本 task 已 Split）

目标机制/切片：`M-035`、`M-036`、`M-037`、`M-052`、`VS-064`

规模预算：
- 主工作包：0
- 预计上下文压缩：0
- 独立验收批次：0

拆分触发：
- 若 165B 要求新资源派生或第二个页面消费者迁移，立即拆分；本 task 只整改正式背包。

拆分结果：
- 2026-08-04 执行前窄查确认 `public/assets/ui/inventory/native/` 与其他现代资源中没有 character 358/610、等级/经验及原生状态控件派生物；恢复语料库只有既有源 `local-resources/regima/source/restored-swfs/assets/backpack1.swf`。
- 因此本父任务不再直接执行，串行拆为 `TASK-SETTINGS-166A`（单一源包动态子资源派生与 provenance）和 `TASK-SLICE-166B`（正式背包唯一消费者实现与视觉验收）。

输入资料：[`TASK-SETTINGS-165B-backpack-review.md`](../../reverse-engineering/evidence/TASK-SETTINGS-165B-backpack-review.md)、统一目录/事务/V6、正式背包 model/view、现有英雄视觉族与入口 runtime snapshot。

输出产物：对齐原版的正式背包动态 UI、确定性测试、四分类/双 owner/穿脱/原生操作弹层/重载与 940×590 差异证据。

完成定义：保持 431 身份、428 真图标、原子事务、P1/P2 与 V6；补齐 165B 指定动态显示对象，不新增现代可见替代层。

UI 原生化合同：
- 显示列表清单：完全消费 165B 的 304/246/628、358/610 清单，包括角色、等级、字段、经验、六槽、时装、格子与操作弹层。
- 原版视觉基准：完全消费 165B 的 940×590 静态、并排、稳定面板差分和对象差异表。
- 允许的现代视觉例外：空，除非用户另行批准。
- 逐状态验收：四分类、首/中/末页、空/堆叠/实例、选择/弹层、穿脱/disabled、P1/P2、战斗即时值/地图回退、关闭/再入/V6。
- 差异证据：同尺寸并排/叠图、边缘差和对象差异清单。

组件化合同：
- 组件家族：`InventoryItemCell / InventoryGridProjection` 首个正式背包试点。
- 权威 owner：`InventoryStore` 与 `FormalInventoryPageModel`；视图组件不持有库存副本。
- 共享行为：只读图标/数量/实例/selected/empty、分页与销毁生命周期。
- 页面保留项：304/246/628 的皮肤、坐标、装备槽、详情、属性、穿脱与反馈全部留在正式背包 composition。
- 消费者迁移矩阵：本 task 只迁正式背包；炼丹炉留给 165D；其余消费者不迁。
- 防复发门禁：静态检查组件无 inventory mutation/页面皮肤，正式背包仍通过全量目录、事务和逐状态视觉专项。

数据投影合同：
- 25 格固定为 5×5、50×51、step `61×60`，不得沿用当前 `43×41`。
- 战斗入口通过只读 presentation snapshot 提供即时 HP/MP；地图入口回退保存成长与 `EquipmentSystem` 有效属性，不新增第二套 owner。
- 当前无权威 nickname owner，角色名暂以英雄名作显式现代映射；不得伪造昵称存档字段。
- 角色容器复用现有 body/equipment 视觉族或 origin runtime snapshot；若证明缺少必要视觉族，按拆分触发停止补证。
- 删除现代右栏详情/owner/message 和 selected tint；未实现专属用途使用原生 disabled 控件与宿主安全反馈，不伪造用途。
- 分类、分页、owner、穿脱、动作提交、重入与销毁必须清理并重建动态 child、弹层和监听。

验收标准：正式背包/目录/存档专项、全系统、build、workflow、diff check 与 940×590 双 owner 通过。

禁止范围：不迁移炼丹炉或其他消费者，不改物品专属用途。

状态更新：更新背包证据、M-052/VS-064、本线覆盖、看板/history 与适用 PG 反馈。

推荐后续任务：`TASK-SETTINGS-166A`；其后依次为 `TASK-SLICE-166B`、`TASK-SLICE-165D`。

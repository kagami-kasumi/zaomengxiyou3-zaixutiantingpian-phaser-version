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

推荐下一次：

- `TASK-SLICE-048`：宠物技能存档/面板最小闭环。前置逆向已补清 `sname~sname` 存档、8 槽展示和 `cwjnxld` 洗练丹边界，下一步把现代 `PetState.skills` 接入字段级编码/解码、面板 8 槽展示和当前出战宠物技能洗练丹重算。

## 待完成任务

| Task | 状态 | 类型 | 目标 | 目标机制/切片 | 产物 | 下一步 |
| --- | --- | --- | --- | --- | --- | --- |
| TASK-SLICE-048 | Ready | TASK-SLICE | 宠物技能存档/面板最小闭环 | VS-023、M-042 | `PetSystem.ts`、`InventorySystem.ts`、`EquipmentSystem.ts`、`TestScene.ts`、`system-tests.ts`、`mechanics-index.md`、`vertical-slices.md`、`task-board.md`、`task-history.md` | 实现宠物技能 `sname~sname` 编解码、面板 8 槽展示和 `cwjnxld` 当前出战宠物技能洗练丹最小链路 |

## 任务完成定义

### TASK-SLICE-048

任务类型：

- `TASK-SLICE`

目标机制/切片：

- `M-042` 宠物
- `VS-023` 宠物技能存档/面板最小闭环

输入资料：

- `docs/reverse-engineering/pets-index.md`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/vertical-slices.md`
- `src/systems/PetSystem.ts`
- `src/systems/InventorySystem.ts`
- `src/systems/EquipmentSystem.ts`
- `src/scenes/TestScene.ts`
- `tools/system-tests.ts`

输出产物：

- `src/systems/PetSystem.ts`
- `src/systems/InventorySystem.ts`
- `src/systems/EquipmentSystem.ts`
- `src/scenes/TestScene.ts`
- `tools/system-tests.ts`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/vertical-slices.md`
- `docs/tasks/task-board.md`
- `docs/tasks/task-history.md`

完成定义：

- `PetSystem.ts` 提供 `PetState.skills` 到原版 `sname~sname` 的字段级编码/解码函数；空技能保存为空字符串，未知 key 读取后安全保留但不会触发未实现释放。
- 宠物面板按原版 8 槽展示当前选中宠物技能：已学技能显示 key/中文名或安全 fallback，空槽显示为空；技能展示不承担点学、遗忘或拖拽绑定。
- 背包/测试入口新增 `cwjnxld` 宠物技能洗练丹：要求当前出战宠物存在，成功后消耗 1 个并按当前宠物种类/形态/等级重算技能；随机学习使用可注入随机源，系统测试可固定结果。
- 保持已有 `monkey1/xj`、`monkey2/lj/xj`、`monkey3/lyq/xj/lj`、`monkey4/jgaoyi` 技能释放、宠物经验/升级、形态变化、出战跟随和法宝宠物增益不回退。

验收标准：

- `npm run test:systems` 通过，覆盖 `sname~sname` 编码/解码、空技能、未知 key 保留、8 槽展示、无出战宠物不消耗 `cwjnxld`、成功洗练消耗道具和固定随机学习结果。
- `npm run build` 通过。
- `npm run check:workflow` 通过。

禁止范围：

- 不实现完整全局存档文件读写、AMF/compress/encrypt、完整宠物面板视觉布局、面板按钮版 `czjnbtn`、超级进化、成长洗练、全部宠物技能、全部被动/自动 buff、P2 宠物或真实资源。
- 不修改、删除或重新生成 `extracted_flash/` 原始提取结果。
- 不把普通角色技能书 `jns` 当作宠物技能学习入口。

状态更新：

- 完成后更新 `docs/reverse-engineering/mechanics-index.md` 的 `M-042/M-044` 和 `docs/tasks/vertical-slices.md`。
- 完成后从本文移入 `docs/tasks/task-history.md`。

推荐后续任务：

- `TASK-SLICE-048` 完成后，再决定继续完整宠物存档，还是扩展其他宠物主动技能/被动 buff。

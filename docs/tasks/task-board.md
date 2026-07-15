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

Role3 八戒完整战斗扩展已经交付，当前没有未完成的 Role3 任务。
Role1 `slz/sx`、`lys/hytj`、`lyfb/jdy`、`qsez/zz` 与 `hmz/hyjj` 已全部交付；当前没有未完成的 Role1 任务。
Role4 毒系、巫毒娃娃、毒链、三项双形态位移攻击、标记传送与终结技已经交付；当前没有未完成的 Role4 任务。
Role5 白龙完整战斗扩展已经交付；当前没有未完成的 Role5 任务。
五角色战斗资源缺口盘点已完成，EVB 原始资源提取也已经完成，Role1/4/5 源包阻塞已解除。
首个真资源族已完成：Role1 普攻 `Role1Bullet1/3/4/5` 已从 `WuKong.swf` 接入。
1.1 合成配方、默认/特殊属性继承及双玩家三槽材料暂存交互均已完成；炼丹炉完整容器、合成页、角色选择器和首配方图标也已在 RegiMA 源包中精确定位。当前推荐执行 `TASK-SLICE-117`，选择性派生必要视觉并接入 1000×600 炼丹炉最小视觉闭环。

## 待完成任务

| Task | 状态 | 类型 | 目标 | 目标机制/切片 | 输出 | 下一步 |
| --- | --- | --- | --- | --- | --- | --- |
| TASK-SLICE-117 | Ready | 切片 | 接入炼丹炉最小视觉闭环 | M-039、M-035、M-037、VS-043 | 选择性派生资源、稳定资源键、1000×600 炼丹炉界面、交互接线与视觉/系统验证 | 评估扩展全部配方图标或切换其他 UI 资源族 |

## 任务完成定义

### TASK-SLICE-117

任务类型：

- `TASK-SLICE`

目标机制/切片：

- `M-039`
- `M-035`
- `M-037`
- `VS-043`

输入资料：

- `docs/reverse-engineering/crafting-ui-index.md`
- `docs/reverse-engineering/crafting-index.md`
- `docs/reverse-engineering/asset-annotation/workflow.md`
- `docs/architecture/src-boundaries.md`
- `local-resources/regima/source/restored-swfs/assets/backpack1.swf`
- `local-resources/regima/source/restored-swfs/assets/OtherMat1.swf`
- `local-resources/regima/source/restored-swfs/assets/EIcon1.swf`
- `src/systems/CraftingSystem.ts`
- `src/systems/PlayerInventoryOwnershipSystem.ts`
- `src/scenes/test-scene/TestSceneUIHandlers.ts`
- `src/assets/AssetManifest.ts`

输出产物：

- 从三个已确认源包中仅派生 character 119/169、可见角色选择器和 `tlzsp`/`wptlz` 首配方所需素材，并在资源标注台账记录源包、character id、派生方式和 stableKey。
- 接入炼丹炉视觉资源清单、加载配置和独立视图/布局模块；现有超限文件不得继续堆叠 UI 逻辑。
- 让现有 `CraftingSession` 驱动 P1/P2 选择、三材料槽、预览、无配方、灵魂不足、合成成功、单槽退回和关闭全退的可观察状态。
- 更新机制、切片、任务与资源标注文档。

完成定义：

- 1000×600 基准画布按 `crafting-ui-index.md` 固定坐标呈现容器、合成页、角色选择器、三槽、预览/产物、灵魂值、按钮和背包区；其他尺寸只等比缩放居中。
- P1/P2 使用显式 `PlayerSlot`，选中态可辨；切换玩家不串背包或槽位。
- `tlzsp × 3 -> wptlz` 能用真实派生图标完成放入、预览、1000 灵魂门禁、成功清槽和产物回包；无配方、灵魂不足、移除、关闭退回均有自动测试。
- 资源 manifest/标注可从 stableKey 追溯到源包和 character id；源 SWF 与本地原始语料保持只读。
- 强化、分解、制作和帮助不形成可达玩法入口；视觉层不复制配方或库存事务。

验收标准：

- `npm run check:structure` 在修改现有源码前通过，目标文件若触发 warning/error 则先拆分。
- `npm run test:systems`、合成专项测试、`npm run build`、`npm run check:annotations` 和 `npm run check:workflow` 通过。
- 人工在 1000×600 基准画布对照 character 119/169，确认整体比例、透明边缘、按钮状态和选择器两帧；记录截图或明确的人工验收结果。

禁止范围：

- 不修改或重生成 `local-resources/regima/source/`、`local-resources/regima/legacy-extraction/` 或权威配方 JSON。
- 不全量导出 UI 源包，不顺带接入全部配方图标。
- 不实现强化、分解、制作、帮助、幻兵或点击领取产物流程。
- 不在视觉层改写 `CraftingSystem` 的配方、所有权、容量预检或原子事务。

状态更新：

- `task-board.md`
- `task-history.md`
- `mechanics-index.md`
- `vertical-slices.md`
- `asset-annotation/` 对应批次与项目状态

推荐后续任务：

- 完成后依据派生资源成本，决定扩展全部配方图标或切换其他 UI 资源族。

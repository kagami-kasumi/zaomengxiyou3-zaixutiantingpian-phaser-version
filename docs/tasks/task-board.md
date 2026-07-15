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
1.1 合成配方、属性继承、双玩家三槽事务与炼丹炉 1000×600 真资源视觉闭环均已交付。
下一步继续用同一炼丹炉资源管线扩展一个最窄配方族。当前推荐执行 `TASK-SETTINGS-045`，只定位 `kyg + kyz + kys -> kyl` 四个图标的权威源包、character 和 stableKey，为第二个真图标配方切片建立证据。

## 待完成任务

| Task | 状态 | 类型 | 目标 | 目标机制/切片 | 输出 | 下一步 |
| --- | --- | --- | --- | --- | --- | --- |
| TASK-SETTINGS-045 | Ready | 逆向 | 定位枯叶灵配方四图标资源 | M-035、VS-044 | `kyg/kyz/kys/kyl` 精确源包、character、图标别名与资源标注 | `TASK-SLICE-118` 选择性派生并接入第二配方真图标 |

## 任务完成定义

### TASK-SETTINGS-045

任务类型：

- `TASK-SETTINGS`

目标机制/切片：

- `M-035`
- `VS-044`

输入资料：

- `docs/reverse-engineering/crafting-ui-index.md`
- `docs/reverse-engineering/crafting-index.md`
- `docs/reverse-engineering/reference/crafting-recipes-1.1.json`
- `docs/reverse-engineering/asset-annotation/workflow.md`
- `local-resources/regima/source/restored-swfs/assets/EIcon1.swf`
- `local-resources/regima/source/restored-swfs/assets/EIcon2.swf`
- `src/assets/AssetManifest.ts`

输出产物：

- 在恢复 SWF 中窄查 `kyg/kyz/kys/kyl` 的 SymbolClass、character id、帧、尺寸和图标别名。
- 更新 `crafting-ui-index.md`，为四个图标分配唯一 stableKey 和选择性派生要求。
- 新建或更新炼丹炉资源标注批次/CSV；只记录证据，不导出或接入现代图片。
- 若任一图标不在候选包中，按恢复语料库继续窄查并记录唯一 `nextAction`，不得直接判为缺失。

完成定义：

- 四个 fillName 均有可追溯的权威源包与 character id，或有经过恢复语料库检索后可执行的明确缺口结论。
- 明确槽内/掉落态差异与 `Fusion.previewFun()` 别名边界；stableKey 不与现有炼丹炉资源冲突。
- 输出足以直接生成一个只选择性派生四图标的 `TASK-SLICE-118`，不需要下一对话重新全量搜索。

验收标准：

- FFDec `-dumpSWF` / `symbolClass` 窄查结果与标注 CSV 一致。
- `npm run check:annotations`、`npm run check:workflow` 通过。

禁止范围：

- 不导出图片、不修改 `src/` 或 `public/assets`。
- 不全量扫描或导出全部合成配方图标。
- 不修改恢复 SWF、旧提取集或权威配方 JSON。
- 不扩展合成规则、背包事务或强化/分解/制作玩法。

状态更新：

- `task-board.md`
- `task-history.md`
- `mechanics-index.md`
- `vertical-slices.md`
- `asset-annotation/` 对应批次与项目状态

推荐后续任务：

- `TASK-SLICE-118`：选择性派生并接入 `kyg + kyz + kys -> kyl` 第二配方真图标。

# TASK-ARCH-016D

任务类型：

- `TASK-ARCH`

功能条线：

- `LINE-PRE-STAGE-2-3-COMPLETION`（Active，当前为 Planned）


目标机制/切片：

- `M-014`、`M-026`、`M-028`、`M-029`、`M-035`、`M-044`、`VS-007`、`VS-050`、`VS-065`、`PG-013`

规模预算：

- 主工作包：2
- 预计上下文压缩：0
- 独立验收批次：2

拆分触发：

- 若从 TestScene 分离 1-1 需要同时迁移与关卡无关的宠物/技能/调试系统，保留窄兼容 adapter 并另拆，不把 TestScene 全量清空塞入本 task。

输入资料：

- 016A..C 公共框架、Stage 1-1 Layout/Flow/Boss/镜头/门/正式入口与 TestScene bridges、level11 character 45/41/44。

输出产物：

- Stage 1-1 Definition/Encounter/窄 TestScene adapter、自己的真门视觉定义、五关消费者矩阵闭合。
- 后续关卡模板、静态防回填、完整五关旅程和 PG-013 效果观察入口。

完成定义：

- 1-1 共同职责进入公共 Runtime；TestScene 不再作为正式关卡共同生命周期 owner。
- 1-1 门使用自身 character 45 动画定义，门行为仍与全部关卡共享；英雄/怪物动画与算法不进入关卡。
- 五关全部迁移且没有私有共同 Runtime；新增关卡模板默认要求 LevelDefinition/Encounter/adapter。

UI 原生化合同：

- 显示列表清单：消费 016A 的 1-1 场景/镜头/门/HUD/结果清单，补齐 character 45→41/44 时间轴、矩阵、注册点与命中区。
- 原版视觉基准：恢复 level11.swf 940×590 Boss 死亡显门、门动画与 W 状态。
- 允许的现代视觉例外：TestScene 调试能力只留 DEV/测试路径；正式关卡不得显示现代调试层。
- 逐状态验收：爬升/镜头/Boss、门 hidden/show/animated/overlap/W与P2上键、失败、胜利、重试、返回。
- 差异证据：1-1 原版/现代和迁移前后并排/叠图、五关对象差异与 console。

组件化合同：

- 组件家族：PlayableLevelRuntime、TransferDoorView、Stage 1-1 adapter 与未来关卡模板。
- 权威 owner：公共 Runtime 持有共同流程，Stage11 Encounter 持有爬升/Boss，实体系统持有英雄/怪物规则。
- 共享行为：五关初始化、队伍/玩家、镜头/HUD、调度、生命周期、出口、结果/保存/路由和销毁。
- 页面保留项：1-1 纵向场景、420/590 镜头、2 秒过渡、Boss/波次、character 45 视觉。
- 消费者迁移矩阵：五关全部 migrated；任何 excluded 项需证据和用户确认。
- 防复发门禁：新增 Stage Scene/World/Gameplay 同义骨架、私有门/结果/保存和关卡内实体算法均失败。

验收标准：

- 1-1 专项、五关架构/流程/正式旅程、全系统、structure、build、annotations、workflow、diff check；940×590 1-1 单/双人及一个横向关卡零 console。

禁止范围：

- 不重构与正式 1-1 无关的 TestScene 全部功能，不改 Boss/波次/镜头/战斗数值，不进入 Stage 2-3。

状态更新：

- 收束 TASK-ARCH-016；更新 PG-013 为“方案落地，效果观察中”、机制/切片、本线覆盖、task-board/task-history；恢复 TASK-SETTINGS-069。

推荐后续任务：

- `TASK-SETTINGS-069`。

# LINE-STAGE-1-1 覆盖台账

本文是 `LINE-STAGE-1-1` 的初始范围入口。该线在 `LINE-CRAFTING` 完整关闭后获得唯一 `Active` WIP；本次仅完成调度激活，不执行 Stage 1-1 资源逆向或实现。

## 当前范围

- 玩家可见目标：Stage 1-1 真场景资源、关卡流程和可玩的进入/完成闭环。
- 当前权威资源候选：`local-resources/regima/source/restored-swfs/assets/levels/level11.swf`。
- 当前待确认符号：`export.gameSence.sl11`、`bg11`、`floorBg1`。
- 旧提取集只作 AS3/历史对照，不作为视觉资源缺失依据。

## 覆盖维度

| 维度 | 当前事实 | 状态 | 下一证据 |
| --- | --- | --- | --- |
| 场景布局 | `sl11` 名称已知，精确 character/tag/嵌套未确认 | 待调查 | `TASK-SETTINGS-046` |
| 背景 | `bg11` 名称已知，精确来源未确认 | 待调查 | `TASK-SETTINGS-046` |
| 地面 | `floorBg1` 名称已知，复用/嵌套关系未确认 | 待调查 | `TASK-SETTINGS-046` |
| 关卡流程 | 范围待资源边界闭合后拆分 | 待调查 | 后续同线 task |
| 运行时闭环 | 尚未开始 | 未覆盖 | 后续纵向切片 |

## 当前 task

`TASK-SETTINGS-046`：窄查恢复源包，确认 `sl11/bg11/floorBg1` 的精确源包、character、tag、尺寸、时间轴和标注状态，并据实际结构生成同线下一 task。

## 关闭检查

- [ ] 场景布局、背景和地面真资源可追溯且已接入。
- [ ] Stage 1-1 进入、推进和完成流程可玩。
- [ ] 玩家、敌人、碰撞和镜头与场景资源形成可见闭环。
- [ ] 自动检查和运行时验收通过。
- [ ] 无未完成的 `LINE-STAGE-1-1` task。

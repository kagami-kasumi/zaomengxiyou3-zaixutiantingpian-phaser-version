# LINE-STAGE-1-1 覆盖台账

本文是 `LINE-STAGE-1-1` 的权威覆盖入口。该线在 `LINE-CRAFTING` 完整关闭后获得唯一 `Active` WIP；`TASK-SETTINGS-046` 已闭合首批场景资源符号，当前进入选择性派生与现代接入。

## 当前范围

- 玩家可见目标：Stage 1-1 真场景资源、关卡流程和可玩的进入/完成闭环。
- 权威布局源包：`local-resources/regima/source/restored-swfs/assets/levels/level11.swf`，`export.gameSence.sl11` = character 46。
- 权威 Stage 1 公共源包：`local-resources/regima/source/restored-swfs/assets/1.swf`，`bg11` = character 141，`floorBg1` = character 1。
- 旧提取集只作 AS3/历史对照，不作为视觉资源缺失依据。

## 覆盖维度

| 维度 | 当前事实 | 状态 | 下一证据 |
| --- | --- | --- | --- |
| 场景布局 | `sl11` = level11 character 46；1 帧、1297.2×2970.45，含 20 个墙体标记与 1 个传送门 | 已定位，待接入 | `TASK-SLICE-123` |
| 背景 | `bg11` = assets/1 character 141；1 帧、1132×3051，运行时加入空 `bgContainer` | 已定位，待接入 | `TASK-SLICE-123` |
| 地面 | `floorBg1` = assets/1 character 1；1440×690 JPEG BitmapData，独立挂到根节点 | 已定位，待接入 | `TASK-SLICE-123` |
| 关卡流程 | 范围待资源边界闭合后拆分 | 待调查 | 后续同线 task |
| 运行时闭环 | 尚未开始 | 未覆盖 | 后续纵向切片 |

## 当前 task

`TASK-SLICE-123`：按已确认的 character 选择性派生 Stage 1-1 前景/背景/地面和布局数据，注册真资源 provenance，并在现代场景中建立可验证的组合边界。

## 关闭检查

- [ ] 场景布局、背景和地面真资源可追溯且已接入。
- [ ] Stage 1-1 进入、推进和完成流程可玩。
- [ ] 玩家、敌人、碰撞和镜头与场景资源形成可见闭环。
- [ ] 自动检查和运行时验收通过。
- [ ] 无未完成的 `LINE-STAGE-1-1` task。

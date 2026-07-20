# LINE-STAGE-1-1 覆盖台账

本文是 `LINE-STAGE-1-1` 的权威覆盖入口。该线已由 `TASK-SLICE-123`、`TASK-SETTINGS-050` 与 `TASK-SLICE-124` 完整关闭为 `Done`。

## 当前范围

- 玩家可见目标：Stage 1-1 真场景资源、关卡流程和可玩的进入/完成闭环。
- 权威布局源包：`local-resources/regima/source/restored-swfs/assets/levels/level11.swf`，`export.gameSence.sl11` = character 46。
- 权威 Stage 1 公共源包：`local-resources/regima/source/restored-swfs/assets/1.swf`，`bg11` = character 141，`floorBg1` = character 1。
- 旧提取集只作 AS3/历史对照，不作为视觉资源缺失依据。

## 覆盖维度

| 维度 | 当前事实 | 状态 | 下一证据 |
| --- | --- | --- | --- |
| 场景布局 | character 18 前景已接入；3/15/1/1 墙标记和 character 45 门为显式数据 | 已接入 | `Stage11Layout.ts`、专项测试 |
| 背景 | character 141 的 1132×3051 真背景已按 `bgContainer x=-20` 边界接入 | 已接入 | `AssetManifest.ts`、`TestSceneStage11Bridge.ts` |
| 地面 | character 1 的 1440×690 真地面以固定根层接入 | 已接入 | `AssetManifest.ts`、`TestSceneStage11Bridge.ts` |
| 关卡流程 | 正式入口、2.5 秒全灭失败、胜利取数/清理/解锁/保存顺序和双人源码缺口均已索引 | 已确认 | `levels-index.md`、`TASK-SETTINGS-050` |
| 运行时闭环 | 入口页、1P/2P 全灭失败、结果导航和 V3 进度持久化均已实现；重玩/返回、胜利和刷新后解锁浏览器验收通过 | 已验收 | `TASK-SLICE-124` 运行时记录与自动检查 |

## 当前 task

无。`TASK-SLICE-124` 已归档，本线没有未完成 task。

## 关闭检查

- [x] 场景布局、背景和地面真资源可追溯且已接入。
- [x] Stage 1-1 进入、推进和完成流程可玩。
- [x] 玩家、敌人、碰撞和镜头与场景资源形成可见闭环。
- [x] 自动检查和运行时验收通过。
- [x] 无未完成的 `LINE-STAGE-1-1` task。

## 关闭证据

- 真资源：`sl11`、`bg11`、`floorBg1` 和 20 墙体/1 门均有恢复源包、character、现代 key 与专项测试追溯。
- 关卡内：纵向爬升、刷怪、停点、Monster3、门通关与真场景组合已完成。
- 正式流程：启动入口可选 1P/2P；统一全灭延迟、失败/胜利结果、重玩全新实例和返回入口已完成。
- 持久化：V3 保存最高解锁 1-2，V1/V2 迁移默认 1-1；浏览器刷新后仍显示解锁。
- 运行时：单人/双人进入、1P/2P 全灭、结果页交互、胜利返回和刷新持久化均目检通过，无应用控制台 error/warn。
- 范围排除：Stage 1-2/1-3 内容、怪物/弹体真素材和全局菜单/存档槽 UI 均未纳入本线用户确认的 Stage 1-1 闭环范围。

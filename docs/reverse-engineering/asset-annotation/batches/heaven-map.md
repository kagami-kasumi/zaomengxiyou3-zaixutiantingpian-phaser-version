# 标注批次：heaven-map

## 范围

- 资源族：第一世界天庭地图、共享地图菜单、Stage 1 三节点和 Stage 2-1 边界节点。
- 影响：`TASK-SETTINGS-057`、`TASK-SLICE-133`、`VS-053`。
- 排除：第二/第三世界、活动副本、完整菜单功能和 Stage 2-1 战斗内容。

## 输入和证据

- AS3：`SelectPLace.as`、`MapMenu.as`、`GMain.as`、`MainGame.as`、`GameWin.as`、`GameFail.as`、`MemoryClass.as`。
- 恢复源包：`assets/OtherMat1.swf`。
- SymbolClass：`export.SelectPLace` 1343、`export.MapMenu` 963；四个节点为 character 1311/1297/1304/1290。
- FFDec：使用 `-selectid` 选择性导出组合 SVG/PNG 与四组三帧节点到 `local-resources/regima/task-outputs/task-settings-057-heaven-map/`。
- 人工证据：无；地图、菜单和 12 张节点帧已逐项目检。

## Agent 调查结论

- 6 条资源均确认精确源包、character id、用途与舞台语义。
- 完整 `SelectPLace` 导出被离台 hover 子件扩到 1139.95×972.95，游戏可见舞台仍为 940×590；正式接入必须裁切。
- 节点 frame 1 为静止、frame 2 为最高进度、frame 3 为 hover；锁定节点不是隐藏，而是没有事件。
- `s1_3` hover 导出含离台绝对子件，现代不能把整幅 frame 3 当局部贴图；base map、注册点和标签语义仍已确认。
- 对应标注表：`../annotations/heaven-map.csv`。

## 去向

- 6 条均已裁切/复制到 `public/assets/ui/heaven-map/`、注册 manifest 并接入正式 `HeavenMapScene`，状态为 `ready`。
- 异常 `s1_3` hover 由现代可访问性高亮替代并明确标为现代选择；Stage 2-1 只提供未接入反馈。

## 关闭检查

- [x] 每条记录有唯一 stableKey、精确源包、symbol id、状态和去向。
- [x] 恢复 SWF 是视觉存在性的最终依据。
- [x] 注册点、可见边界、舞台裁切和离台异常均已记录。
- [x] 派生物只写入新 task-output，未修改源语料库与 legacy extraction。
- [x] 已说明后续正式实现 task 为 `TASK-SLICE-133`。
- [x] `TASK-SLICE-133` 已完成真资源接入、节点状态、三关路由与 940×590 运行验收。

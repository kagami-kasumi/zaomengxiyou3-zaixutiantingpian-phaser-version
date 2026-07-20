# 标注批次：stage12

- 状态：现代资源与场景布局接入完成
- 关闭日期：2026-07-20

## 范围和证据

- 覆盖 `sl12` character 53、前景 character 25、`bg12` character 135、Stage 1 公共 `floorBg1`、`fbEnter` character 22 和普通门 character 52。
- 行为证据来自 `StageListener12.as`、恢复 `sl12.as`、`MainGame.as`、`PhysicsWorld.as`、`ViewControllor.as`、`StopPoint.as`、`MonsterAppearPoint.as`、`Monster2.as` 与 `Monster4.as`。
- 视觉权威源为 `local-resources/regima/source/restored-swfs/assets/levels/level12.swf` 和 `assets/1.swf`；旧提取集只用于 AS3 对照。
- 标注表：`../annotations/stage12.csv`。

## 调查与派生结果

- `level12.swf` SymbolClass 直接确认 `export.gameSence.sl12` = 53、`MonsterAppearPoint` = 5、`StopPoint` = 7、`FallDownWhenStandingWall` = 9、`ObsWall` = 10；恢复脚本提供 5 停点和 13 刷怪点的全部实例属性。
- `sl12` 是单帧 character 53；独立可见前景为 character 25，地图标记、`fbEnter` 和门保持显式对象，不应烘焙为碰撞逻辑。
- `bg12` 是 `assets/1.swf` character 135，单帧包裹 character 134；`floorBg1` 复用已接入的 Stage 1 公共 character 1，不新增重复标注。
- `fbEnter` character 22 共 30 帧；普通门 character 52 外层 1 帧，子时间轴 48/51 分别为 20/19 帧。
- 精确 SymbolClass、XML、脚本和选择性 SVG 调查派生物位于 `local-resources/regima/task-outputs/task-settings-051-stage12/`。FFDec 报告无法写用户日志锁文件，但各选择性导出均返回 `OK`，产物和帧数已复核。

## 去向

- 4 条视觉记录均已转为 `ready + confirmed + none`；监听器为 `rejected + confirmed + none`，表示它是行为证据而非视觉资产。
- `TASK-SLICE-125` 将前景/背景/特殊入口/普通门共 72 张 PNG 接入 `public/assets/stage/stage1-2/`，manifest 保留 character 25/135/22/52/48/51、tag、源尺寸、帧数和现代栅格尺寸；`floorBg1` 继续复用 Stage 1-1 资源。
- `Stage12Layout.ts` 保存全部 3+1 墙、5 停点、13 刷怪点及两入口数据，`Stage12WorldBridge.ts` 保留根地面 → `sl12` → `bgContainer` 的组合边界。
- 无推测、未知、缺源或人工消歧项。
- 下一正式 task 为同线 `TASK-SLICE-126`：实现五停点 46 怪、双 boss 普通门门禁与普通完成/失败；特殊入口仍留给后续独立切片。

## 关闭检查

- [x] 每条记录都有 `status`、`confidence` 和 `nextAction`。
- [x] 已填写精确源包、character、tag、时间轴和尺寸。
- [x] 没有把“尚未现代接入”误写为 `missing-original`。
- [x] 没有把旧提取集当作视觉资源是否存在的最终依据。
- [x] 当前不需要人工输入。

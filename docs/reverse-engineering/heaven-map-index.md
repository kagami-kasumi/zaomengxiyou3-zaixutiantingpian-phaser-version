# 天庭地图选关证据索引

本文是 `TASK-SETTINGS-057` 的权威实现输入，只闭合第一世界天庭地图、Stage 1-1/1-2/1-3 节点、Stage 2-1 边界和关卡往返。关卡内墙体/停点坐标属于 `M-027`，不能替代本页的地图舞台坐标。

## 待证明的可观察问题

1. 读档后进入哪张地图，地图与共享菜单来自哪个恢复源符号？
2. Stage 1 三节点在哪里、叫什么、何时可点击，静止/当前/悬停分别使用哪一帧？
3. 点击节点怎样进入关卡，胜利怎样推进最高进度，失败/胜利怎样返回地图？
4. 完成 1-3 后如何表达 Stage 2-1；现代未实现 Stage 2-1 时怎样避免伪造内容？
5. 原版持久化的玩家人数与现代现状不同，正式地图怎样保留 1P/2P 可达性？

## 六段证据矩阵

| 行为合同项 | 局部证据 | 共享调用链 | 几何/坐标证据 | 证据等级 | 未知与反证条件 | 验证方式 |
| --- | --- | --- | --- | --- | --- | --- |
| 第一世界地图创建 | `SelectPLace.as:added()`；`GMain.showStageMap()` 创建 `export.SelectPLace` | 读档/选角完成 → `GMain.switchSence("showStageMap")`；结果返回也按 `whichlastworld == 0` 回此场景 | `assets/OtherMat1.swf` character 1343；舞台可见区 940×590，完整导出因离台子件扩到 1139.95×972.95 | 交叉确认 | 离台 hover 子件不得扩大现代相机 | 裁切后的组合 SVG 运行验收 |
| 共享地图菜单 | `SelectPLace.added()` 移除时间轴旧 `MapMenu` 后 `new MapMenu()`，位置 `(-1,0)` | `MapMenu` 负责保存、商店、炼丹炉、技能、设置、任务和返回主菜单 | `OtherMat1.swf` character 963；可见区约 940×590，底部按钮注册 x 为 -1/66/131.95/197.95/263.95/329.95/396.95，y 约 506—508 | 交叉确认 | 完整功能 UI 仍归 `TASK-SETTINGS-058` | 真资源叠层 + 返回/存档窄交互验收 |
| 解锁与静止状态 | `SelectPLace.added()` 只为早于或等于 `curBigStage/curBigLevel` 的节点注册 click/roll 事件；所有节点本身已在时间轴可见 | `MemoryClass` 读写 `curBigStage/curBigLevel`；新档默认 1/1 | 锁定节点仍显示 frame 1；最高进度节点 `gotoAndStop(2)`；已过节点保持 frame 1 | 交叉确认 | 原版没有独立锁图标或“已通关”徽章证据 | 状态表测试 + 运行时不可点/可点观察 |
| 悬停与点击 | `mOver()` → frame 3；`mOut()` → 最高节点 frame 2，否则 frame 1；`onSelected()` 从 `s1_1` 名称解析关卡 | `selectStageOver` → `GMain.selectStageOver()` → `startFighting` | frame 3 真标签分别为“九重天 / 天宫路 / 南天门”；命中区使用节点 frame 1 可见边界，不从关卡场景外推 | 交叉确认 | `s1_3` frame 3 含原始离台绝对坐标子件，不能直接当局部贴图叠加 | 节点 hover/click 运行验收 |
| 胜利推进 | `MainGame.levelClear()` 仅当游玩关卡等于当前最高进度时推进；1-1→1-2→1-3→2-1 | 胜利先建结果页，再推进/保存当前槽；重复旧关不会倒退或越级 | 不适用：纯状态与存档合同 | 确认事实 | 无 | 单调推进、重复通关、重载测试 |
| 失败/胜利返回 | `GameFail.backToMap()`、`GameWin.backClick()` 在第一世界调用 `showStageMap` | 失败不推进；胜利已保存后返回地图；“下一关”直接更新当前关卡并进入战斗 | 结果页坐标不属于本任务；返回目标是同一地图舞台 | 确认事实 | Stage 1 现有结果桥都仍指向临时 `Stage11EntryScene` | 三关失败/胜利/退出路由测试 + 浏览器往返 |
| Stage 2-1 边界 | 最高进度由 1-3 推进到 2/1；`SelectPLace.added()` 此时会给 `s2_1` 注册事件 | 原版点击会进入 2-1；现代功能线明确排除 Stage 2-1 内容 | `s2_1` 注册点 `(507.95,341.5)`；character 1290 frame 3 标签“南天王殿” | 交叉确认 + 现代设计选择 | 现代必须显示“已解锁但内容未接入”，不得路由占位关卡 | 2-1 可见但拒绝进入的测试/运行反馈 |
| 1P/2P 选择 | 原版 `GameMenu` 在新游戏时写 `gc.playNum`，地图节点不再询问人数 | 原版存档包含玩家身份；现代 V3 尚未保存人数，现有三关入口按每次选择 1P/2P | 不适用：现代交互 | 现代设计选择 | 不能假称地图弹出人数选择是原版行为 | 节点点击后的 1P/2P 选择与取消测试 |

## 源资源、注册点和可见边界

源包统一为 `local-resources/regima/source/restored-swfs/assets/OtherMat1.swf`。FFDec 26.0.0 使用 `-selectid` 选择性导出到 `local-resources/regima/task-outputs/task-settings-057-heaven-map/`，未修改恢复 SWF 或 legacy extraction。

| stableKey | SymbolClass / symbol | character | 实例 | 注册点（stage） | frame 1 局部可见边界 / 含义 | frame 3 |
| --- | --- | ---: | --- | --- | --- | --- |
| `heaven-map.world` | `export.SelectPLace` | 1343 | 地图根 | `(0,0)` | 可见舞台 940×590 | 不适用 |
| `heaven-map.menu` | `export.MapMenu` | 963 | 运行时叠加于 `(-1,0)` | `(-1,0)` | 底部与活动入口组合层 | 不适用 |
| `heaven-map.stage-1-1` | `OtherMat_fla.Timeline_188` | 1311 | `s1_1` | `(703.45,524.95)` | 约 `[-74.75,-110.05]..[76.25,56.95]`；九重天柱 | 发光“九重天” |
| `heaven-map.stage-1-2` | `OtherMat_fla.Timeline_194` | 1297 | `s1_2` | `(596.5,541.95)` | 约 `[-75.5,-42.55]..[88.5,37.45]`；天宫路阶梯 | 发光“天宫路” |
| `heaven-map.stage-1-3` | `OtherMat_fla.Timeline_191` | 1304 | `s1_3` | `(525.45,458.45)` | 实际 frame 1 约 `[-68.5,-58.05]..[68.5,26.95]`；南天门 | 发光“南天门”；导出含离台绝对子件，现代不用整幅 frame 3 |
| `heaven-map.stage-2-1` | `OtherMat_fla.Timeline_197` | 1290 | `s2_1` | `(507.95,341.5)` | 塔形节点；统一导出画布 139×132 | 发光“南天王殿” |

PlaceObject2 MATRIX 的 translation 以 twip/20 解码为舞台注册点。节点的现代命中区以 frame 1 可见边界映射到舞台，不把注册点误当左上角。组合 SVG 正式接入时必须裁为 940×590；导出画布的离台范围不是游戏相机范围。

## 可观察状态机

```text
读当前槽
  └─> map(progress)
       ├─ locked node: visible(frame 1), no activation
       ├─ earlier unlocked node: frame 1, hover frame 3, click
       ├─ highest unlocked node: frame 2, hover frame 3, click
       └─ Stage 2-1 boundary: visible status only in modern build

Stage 1 node click
  └─> modern 1P/2P chooser
       ├─ cancel -> map unchanged
       └─ confirm -> matching Stage scene
            ├─ failure/exit -> map, progress unchanged
            └─ victory -> monotonic unlock + save active slot -> map/next level
```

## 现代实现映射

- 新建纯 `HeavenMapSystem`：从 `LevelUnlockProgress` 生成 Stage 1-1/1-2/1-3 与 Stage 2-1 的 `locked | current | completed | unavailable` 快照，集中拥有坐标、命中区、标题和 route key。
- 新建 `HeavenMapScene`：显示裁切后的真地图与共享菜单；使用透明命中区、可读状态/焦点环和 1P/2P 选择覆盖层。锁图标、完成标记、键盘焦点和人数覆盖层均是现代可访问性选择。
- `SaveSlotScene` 成功创建/读取后进入地图；Stage 1 三关失败、胜利、退出及 5-1 过渡返回统一进入地图。旧 `Stage11EntryScene` 不再是正式入口，可保留为非正式兼容壳或移除注册。
- Stage 2-1 在进度达到 2/1 时显示“已解锁 · 内容未接入”，点击只给反馈，不启动伪关卡。
- `MapMenu` 的保存/背包/装备/宠物等完整交互仍由 `TASK-SETTINGS-058` 盘点；本切片只需可靠提供返回存档与当前槽保存反馈，不越级宣布完整 UI。

## 未知、排除与实现验收

- 未知：`s1_3` frame 3 离台绝对子件是否是原发布局缺陷或 FFDec 组合导出特性。它不影响已确认的 base node、注册点、点击和标签语义；现代只用 base map + 可访问性高亮，不能把异常大画布带入运行时。
- 排除：Stage 2-1 战斗内容、第二/第三世界、活动副本、完整 MapMenu 功能、云存档与角色选择重做。
- 确定性验证：四节点顺序/坐标/命中区、锁定与当前状态、单调解锁、锁定拒绝、2-1 不路由、1P/2P 选择、当前槽重载、三关结果/退出返回。
- 运行时验证：940×590 初始档、解锁 1-2、解锁 1-3、推进 2-1 四种地图状态；鼠标 hover/click、键盘焦点、人数选择、三关至少各一次地图往返；真地图与菜单不得遮挡状态和命中反馈。

## 现代接入结果

- `TASK-SLICE-133` 已新增 `HeavenMapSystem` / `HeavenMapScene`，按本页坐标和命中边界集中生成四节点快照；锁定节点拒绝激活，Stage 2-1 只显示内容未接入反馈。
- 六条资源已接入 `public/assets/ui/heaven-map/` 并登记 manifest provenance；地图/菜单裁为 940×590，未把 `s1_3` 离台 hover 子件带入相机。
- `SaveSlotScene` 正式进入地图；Stage 1 三关的失败、胜利、退出以及 5-1 过渡统一返回地图，当前槽仍由既有单调进度/保存 owner 写回。
- `heaven-map-tests.ts` 覆盖四档进度、坐标/边界、锁定与 2-1 拒绝、资源和各场景路由合同；940×590 浏览器确认初始档、hover、1P 进入 1-1、Escape 返回地图且无 warning/error。其余三档像素状态由确定性快照测试覆盖，未将受浏览器本地审计页安全策略中断的样本宣称为人工验收。

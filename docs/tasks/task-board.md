# 游戏任务看板

本文只记录未完成的游戏复现 task。完整系统范围和激活状态以 `docs/tasks/feature-lines.md` 为准；一次 `/goal` 的边界以 `docs/tasks/goal-board.md` 为准；task 是最小验收单位。完成 task 或 Goal 都不等于完成功能条线。

## 当前推荐

`TASK-SETTINGS-062` 是唯一当前推荐，属于唯一 `Active` Goal `GOAL-015` 和 `LINE-STAGE-2-1`。Stage 2-1 行为与正式流程已在 940×590 下验收；当前只闭合 Monster6/9/10/19、弹体和命中特效真视觉证据，不扩张 Stage 2-2。

## 待完成任务

| Task | 状态 | Goal | 功能条线 | 类型 | 目标 | 目标机制/切片 | 输出 | 下一步 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| TASK-SETTINGS-062 | Ready | GOAL-015 | LINE-STAGE-2-1 | 视觉资源逆向 | 闭合 Monster6/9/10/19 动作、弹体与命中特效的恢复源包、时间轴、几何和现代映射证据 | M-030、M-035、VS-049 | 四怪视觉六段矩阵、资源标注、选择性导出/实现计划 | 依据证据生成同线真视觉实现 Goal |
| TASK-SETTINGS-061 | Planned | GOAL-011 | LINE-UI-NATIVE-SKILLS | UI 原生化逆向 | 闭合技能四页原生文字、按钮状态、命中区、布局和动态槽位 | M-016、M-041、M-052、VS-055 | 四页六段证据矩阵、资源/坐标合同、现代例外清单和实现门禁 | `TASK-SLICE-143` |
| TASK-SLICE-143 | Planned | GOAL-012 | LINE-UI-NATIVE-SKILLS | UI 原生化整改 | 移除技能四页现代外层 UI，直接复用原图片中文字、按钮、状态和布局 | M-016、M-041、M-052、VS-055 | 四页原生化 view、业务回归、P1/P2/V4 与 940×590 逐状态证据 | 关闭本线并回写 PG-007 |

## 任务完成定义

### TASK-SETTINGS-062

任务类型：

- `TASK-SETTINGS`

功能条线：

- `LINE-STAGE-2-1`（Active）

Goal 包：

- `GOAL-015`（Active）

目标机制/切片：

- `M-030`、`M-035`、`VS-049`

输入资料：

- `docs/workflow/reverse-engineering-protocol.md`、`docs/reverse-engineering/levels-index.md`、`monsters-index.md`、`projectiles-index.md`、`attack-effects-index.md` 与 `evb-extraction-report.md`。
- `local-resources/regima/source/restored-swfs/` 中按 `Monster6`、`Monster9`、`Monster10`、`Monster19`、对应 Bullet/Effect SymbolClass 和 MovieClip 做窄查的源包；视觉存在性不得由旧提取集单独裁决。
- `local-resources/regima/legacy-extraction/README_extract.md` 与主包中的四怪、`BaseMonster`、`BaseBullet`、攻击触发和位图池 AS3 只读证据。
- `TASK-SLICE-145` 的 940×590 占位运行证据与 `LINE-STAGE-2-1.md` 的视觉缺口。

输出产物：

- 在 `monsters-index.md` 或同目录独立 Stage 2-1 视觉文档中记录四怪的 wait/walk/hit/hurt/death、朝向翻转、攻击帧、弹体/命中特效和玩家可见结果六段证据矩阵。
- 精确记录恢复源 SWF、SymbolClass、character id、时间轴、嵌套矩阵、注册点、逐帧可见边界、滤镜 padding、脚底/攻击点 local→world 映射和弹体原点。
- 更新资源标注/批次；给出只选择性导出目标资源族的 stable key、帧范围、缺失/复用结论和现代实现 owner，不在本 task 内接入代码。
- 影响实现的未知与反证条件、确定性测试计划、940×590 动作/弹体逐状态视觉验证计划，以及同线实现 task/Goal 输入。

完成定义：

- 四怪全部可见动作和直接/间接弹体、命中特效逐项回答“源包/符号/帧序/注册点/世界映射/触发结果”，不能用类名或 AS3 位图池名代替恢复源证据。
- 从局部怪物/弹体类追到共享 `BaseMonster`、`BaseBullet`、位图池、攻击窗口、物理世界与现代 Stage21 gameplay 消费者；每项标记确认事实、交叉确认、推断、未知或现代设计选择。
- 影响下一实现的未知为零；若源包确实缺失，必须留下已穷尽的窄查集合、反证条件和经用户批准前仍不可替代的边界。
- 完成资源标注、证据矩阵、选择性导出计划和双重验证计划后，生成单独的同线真视觉实现 Goal；不得在本 Goal 越界实现或关闭功能线。

验收标准：

- 恢复源包、SymbolClass/character/time line 与 AS3 触发链的精确引用可复查；视觉/空间结论至少达到交叉确认。
- 标注 CSV 无重复 stable key，`npm run check:annotations`、`npm run check:workflow` 与 `git diff --check` 通过。
- 证据矩阵完整覆盖六段链、未知/反证条件和自动+940×590 运行验证；只定位文件或只导出帧图不能归档为“已闭合”。

禁止范围：

- 不进入 Stage 2-2，不修改恢复源包或旧提取结果，不重构 Stage21 gameplay 或共享怪物系统。
- 不全量导出恢复 SWF；先完成 manifest/SymbolClass 窄查，再按精确 character/帧选择性派生。
- 不从 Stage 1 怪物外推四怪的尺寸、注册点、动作帧或弹体视觉；不把现代圆形占位当作原版基准。
- 不在逆向 Goal 同时实现资源接入，不用自动测试替代动作/弹体运行视觉验收。

状态更新：

- `docs/tasks/feature-lines.md`、`LINE-STAGE-2-1.md`、`goal-board.md`、`task-board/history`、`M-030/M-035`、`VS-049`、资源标注和 PG-002/004/005 效果样本。

推荐后续任务：

- 依据闭合证据生成同线 `TASK-SLICE-*`，只接入 Monster6/9/10/19 与其弹体/命中特效真视觉并做 940×590 逐状态复验。

### TASK-SETTINGS-061

任务类型：

- `TASK-SETTINGS`

功能条线：

- `LINE-UI-NATIVE-SKILLS`（Planned）

Goal 包：

- `GOAL-011`（Planned）

目标机制/切片：

- `M-016`、`M-041`、`M-052`、`VS-055`

输入资料：

- `local-resources/regima/source/restored-swfs/` 中 `OtherMat1.swf` 的技能总页 character 250、主动页 868、绑定页 417、被动页 213 及其 SymbolClass/MovieClip/按钮子对象。
- 对应 `BuySkill`、`SkillControl`、`SkillSetControl`、`PassiveSkillControl`、`RoleInfo`、`KeyBoardControl`、`User` 局部与共享 AS3 调用链。
- `docs/reverse-engineering/full-function-ui-index.md`、`skills-input-index.md`、`docs/workflow/reverse-engineering-protocol.md` 和 `PG-007`。

UI 原生化合同：

- 显示列表清单：四页逐项记录根/子 Symbol、depth、父子关系、注册点、嵌套矩阵、mask/filter、TextField、按钮四态、动态 child 和命中区。
- 原版视觉基准：为四页默认态和适用交互态保存可追溯 Flash/SWF 基准，记录入口、舞台尺寸、帧和裁切；无法取得的状态必须记为阻塞或未知。
- 允许的现代视觉例外：本证据 task 不批准任何新增可见替代层；只允许把证据无法决定的候选例外列出，交由用户裁决。
- 逐状态验收：normal/hover/pressed/selected、分页/动态内容、P1/P2 和返回路径。
- 差异证据：规划同尺寸并排/叠图、像素或边缘差异及可见对象差异清单，说明字体栅格化容差。

输出产物：

- 为四页分别记录根/子页时间轴、中文字、按钮实例与 up/over/down/selected、透明 hit bounds、注册点、嵌套矩阵、940×590 坐标、动态文本/图标/列表槽位和返回路径。
- 形成原版可观察合同、现代 view 映射、允许的最小现代例外清单、证据等级、未知/反证条件和自动+浏览器双重验证计划。

完成定义：

- 四页所有会影响实现的文字、按钮、导航、状态反馈和动态槽位均有一手证据或明确未知；影响 `TASK-SLICE-143` 的未知项为零后才能标记完成。
- 明确哪些现有 `scene.add.rectangle/text` 和通用按钮是替代覆盖层、哪些动态文本可继续使用但必须落在原生槽位。
- 绑定页的原版拖放与现代可访问等价边界被单独证明，不用现有实现反推原版事实。

验收标准：

- 六段证据矩阵、坐标语义、证据分级、未知与反证条件齐全。
- 资源/按钮状态/命中区可由确定性测试验证，四页 940×590 运行观察计划覆盖 normal/hover/pressed/selected。
- `npm run check:workflow`、`npm run check:annotations` 与 `git diff --check` 通过。

禁止范围：

- 不修改 `src/`；不重新生成恢复源包或旧提取结果。
- 不把整页图片尺寸当按钮坐标，不把现有现代按钮布局写成原版事实。
- 不在证据阶段顺带修改技能业务规则、宠物、法宝、背包或 Stage 2-1。

状态更新：

- 更新技能 UI 逆向文档、本线覆盖台账、`M-052`、`VS-055`、Goal/task 状态和 PG-007 效果样本。

推荐后续任务：

- `TASK-SLICE-143`。

### TASK-SLICE-143

任务类型：

- `TASK-SLICE`

功能条线：

- `LINE-UI-NATIVE-SKILLS`（Planned）

Goal 包：

- `GOAL-012`（Planned）

目标机制/切片：

- `M-016`、`M-041`、`M-052`、`VS-055`

输入资料：

- `TASK-SETTINGS-061` 闭合的四页 UI 原生化证据矩阵。
- `FormalSkillPageView.ts`、`FormalSkillPageSystem.ts`、`FeatureUiScene.ts`、技能业务 systems、四页真资源及正式入口 bridge。

UI 原生化合同：

- 显示列表清单：实现必须逐项消费 `TASK-SETTINGS-061` 闭合的根/子 Symbol、depth、矩阵、文字字段、按钮状态、动态 child 和命中区映射。
- 原版视觉基准：以证据 task 落盘的四页基准为唯一视觉比较源，不用现有现代页面截图反推原版。
- 允许的现代视觉例外：默认空清单；任何新增可见文字、面板、矩形、暗层或通用按钮都必须先记录证据缺口、最小边界并取得用户批准。
- 逐状态验收：normal/hover/pressed/selected、主动/被动/绑定、动态状态、P1/P2、关闭与重载。
- 差异证据：940×590 同尺寸并排/半透明叠图、稳定区域像素或边缘差异、可见对象逐项差异和容差说明。

输出产物：

- 移除四页全屏暗层、外层现代面板、现代标题和通用替代按钮。
- 直接复用原图片中的中文字、按钮、按钮状态和页面布局；透明命中区只绑定事件，不绘制替代视觉。
- 将灵魂、等级、技能说明、学习/升级状态、已学列表和五槽等动态内容放入原版槽位；现代例外严格使用已批准清单。
- 保持既有技能学习、升级、五槽绑定、被动、P1/P2、HUD 同步和 V4 保存系统 owner。

完成定义：

- 250/868/417/213 四页均完成原生化，不再把真资源当背景后覆盖一套外层 UI。
- 正式入口、P1/P2 owner、主动/被动切换、学习/升级、绑定、关闭、HUD 同步和保存/重载无回归。
- PG-007 存量矩阵将技能页标为已原生化，并留下可供后续宠物/法宝任务复用的实现样本。

验收标准：

- 实现前运行 `npm run check:structure`；目标文件 warning/error 按门禁处理。
- 原生资源/状态/命中区专项、技能专项、`npm run test:systems`、`npm run build`、`npm run check:workflow` 和 `git diff --check` 通过。
- 从地图与 Stage 正式入口完成 P1/P2 四页 normal/hover/pressed/selected、成功/拒绝、关闭、HUD 同步与重载；940×590 截图齐全且 console 无 error/warning。

禁止范围：

- 不重写技能数值、MP、冷却、学习成本、等级上限、五槽顺序或存档 schema。
- 不以现代文字、矩形、通用按钮覆盖原图片中文字；不顺带整改其他功能页或 Stage 2-1。
- 不用单页静态截图替代正式流程、按钮状态和双 owner 运行验收。

状态更新：

- 更新本线覆盖台账、`M-052`、`VS-055`、Goal/task/history、PG-007 效果样本；关闭合同满足后才关闭 `LINE-UI-NATIVE-SKILLS`。

推荐后续任务：

- 关闭本线后按用户批准的调度恢复内容线；宠物/法宝原生化另行生成 Planned 功能线，不在本 task 顺带执行。

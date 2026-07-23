# 游戏任务看板

本文只记录未完成的游戏复现 task。完整系统范围和激活状态以 `docs/tasks/feature-lines.md` 为准；一次 `/goal` 的边界以 `docs/tasks/goal-board.md` 为准；task 是最小验收单位。完成 task 或 Goal 都不等于完成功能条线。

## 当前推荐

`TASK-SLICE-146` 是唯一当前推荐，属于唯一 `Active` Goal `GOAL-016` 和 `LINE-STAGE-2-1`。四怪与七个攻击对象的真视觉证据已闭合；当前只按证据接入并完成 940×590 逐状态复验，不扩张 Stage 2-2。

## 待完成任务

| Task | 状态 | Goal | 功能条线 | 类型 | 目标 | 目标机制/切片 | 输出 | 下一步 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| TASK-SLICE-146 | Ready | GOAL-016 | LINE-STAGE-2-1 | 真视觉接入/运行复验 | 接入 Monster6/9/10/19 本体 atlas 与七攻击对象，移除占位并完成逐状态视觉复验 | M-030、M-034、M-035、VS-049 | 11 条真资源、Stage21 视觉 owner、注册点/触发专项、940×590 1P/2P 证据 | 裁决并关闭 `LINE-STAGE-2-1` |
| TASK-SETTINGS-061 | Planned | GOAL-011 | LINE-UI-NATIVE-SKILLS | UI 原生化逆向 | 闭合技能四页原生文字、按钮状态、命中区、布局和动态槽位 | M-016、M-041、M-052、VS-055 | 四页六段证据矩阵、资源/坐标合同、现代例外清单和实现门禁 | `TASK-SLICE-143` |
| TASK-SLICE-143 | Planned | GOAL-012 | LINE-UI-NATIVE-SKILLS | UI 原生化整改 | 移除技能四页现代外层 UI，直接复用原图片中文字、按钮、状态和布局 | M-016、M-041、M-052、VS-055 | 四页原生化 view、业务回归、P1/P2/V4 与 940×590 逐状态证据 | 关闭本线并回写 PG-007 |

## 任务完成定义

### TASK-SLICE-146

任务类型：

- `TASK-SLICE`

功能条线：

- `LINE-STAGE-2-1`（Active）

Goal 包：

- `GOAL-016`（Active）

目标机制/切片：

- `M-030`、`M-034`、`M-035`、`VS-049`

输入资料：

- `docs/reverse-engineering/stage21-monster-visuals-index.md` 的六段矩阵、现代映射和双重验证计划。
- `docs/reverse-engineering/asset-annotation/annotations/stage21-monsters.csv` 与 `batches/stage21-monsters.md`。
- `local-resources/regima/task-outputs/task-settings-062-stage21-monsters/` 中四个合并 RGBA atlas、七攻击对象逐帧序列、94/132 行几何表和碰撞盒 SVG。
- `Stage21GameplayBridge.ts`、`Stage1CombatSystem.ts`、`MonsterPhysicsSystem.ts`、`AssetManifest.ts`、`BootScene.ts` 与 Stage 2-1 专项测试。

输出产物：

- 只复制/转换本批 11 条 `derived-ready` 资源到 `public/assets/stage21/`，在 manifest/loader 保留源包、character id、atlas cell、帧数与注册点 provenance。
- 新增 Stage 2-1 专属怪物/攻击视觉 owner：wait/walk/hurt/dead/hit、左右镜像、死亡播完销毁和场景清理；Monster6 覆盖 hit1/hit2/hit3 与三个落击。
- 普通怪按 100 高、Monster6 按 130 高落地；渲染根使用碰撞中心，攻击 view 使用 MovieClip 注册点。
- 移除 Arc/Text、颜色状态映射和“现代占位表现”声明，不叠加未经用户批准的现代圆、标签或额外命中火花。
- 新增精确资源/动作/注册点/触发/lifecycle 测试，并保存 940×590 1P/2P 逐状态运行证据。

完成定义：

- 四怪 94 个可达本体关键帧和七对象 132 帧按原 tick/生命周期播放；Monster10 不生成不可达 hit2。
- 左右朝向不跳根，普通怪/Monster6 脚底分别保持 `root+50/root+65`；攻击对象位置和翻转以注册点为原点。
- Monster9/10/19 hit1 和 Monster6 hit1/hit2/hit3 在证据指定 tick、数量和偏移创建；攻击对象结束或场景销毁后无残留。
- Stage 2-1 五停点、53 怪、6/8 上限、失败、冰刺、Monster6 显门、胜利与 2-2 当前槽保存全部不回归。
- 940×590 1P/2P 逐状态证据无现代怪物可见替代层，console 无 warning/error；随后按覆盖台账裁决功能线关闭。

验收标准：

- 实现前先运行 `npm run check:structure`；目标文件触发 error 必须先拆分。
- Stage 2-1 专项覆盖资源数量/尺寸、动作/tick、root/脚底、镜像、攻击生成和 destroy；`npm run test:stage21`、`npm run test:systems`、`npm run build` 通过。
- `npm run check:annotations`、`npm run check:workflow` 与 `git diff --check` 通过；11 条标注在实际接入后更新为 `ready`。
- 940×590 运行覆盖 1P/2P、四怪左右向 wait/walk/hurt/dead/hit1、Monster6 hit2/hit3、镜头滚动与最终门流程，保存并排/叠图和可见差异清单。

禁止范围：

- 不进入 Stage 2-2，不修改恢复源包或旧提取结果，不全量导出 `assets/2.swf`。
- 不重构共享战斗/奖励/存档，不顺手补其他怪物或全局 projectile 库。
- 不新增现代可见标签、轮廓、圆、通用 hit spark；调试信息必须不可见或仅 DEV 显式开启。
- 不用自动测试替代动作/弹体的 940×590 运行视觉验收。

状态更新：

- `feature-lines.md`、`LINE-STAGE-2-1.md`、`goal-board.md`、`task-board/history`、`M-030/M-034/M-035`、`VS-049`、资源标注和 PG-002/004/005 效果样本。

推荐后续任务：

- 本 task 完成后先按完整关闭检查裁决并关闭 `LINE-STAGE-2-1`；只有关闭成功才由用户调度下一条线。

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

# TASK-SLICE-202

任务类型：
- `TASK-SLICE`

任务模型：
- `常规任务`

逆向子类型：
- 不适用

逆向方案：
- 不适用

功能条线：
- `LINE-PRE-STAGE-2-3-PRESENTATION`（Active；Ready；`TASK-SETTINGS-201` 已完成）

目标机制/切片：
- `M-035`、`M-042`、`M-049`、`M-052`、`VS-067`

规模预算：
- 主工作包：2
- 预计上下文压缩：0
- 独立验收批次：2

拆分触发：
- 一旦 201 未达到 `verified/unresolved=[]`、需要修改宠物业务 owner/存档/战斗数值、进入 character 662 之外的 HUD、批量审计其他真值或新增第二个正式渲染 owner，立即停止并保持本 task 阻塞或拆分。

协作计划：
- 模式：单 agent
- 并行工作包：无
- 写入 owner：主 agent
- 归并检查点：实现前
- 方法观测：无

输入资料：
- `TASK-SETTINGS-201` 的 `task-settings-201.pet-combat-hud-head` verified manifest、逐 fixture 原版 baseline 和差异证据。
- `task-settings-191.pet-combat-hud` 中仍被 201 保留的 character 605/610/614 壳体、HP/MP 条和文本静态真值。
- `src/scenes/stage1/Stage1PetCombatHudView.ts`、`FormalPetRuntimeBridge`、宠物 HUD bundle/原生资源加载与五关共享 HUD 消费者。

输出产物：
- character 657 各目标帧实际递归 child 的可选择原生头像资源/描述，以及由新 truth 驱动的唯一运行时投影。
- `Stage1PetCombatHudView` 删除身体 atlas 拉伸、657 联合 bounds 和硬编码头像偏移；按 201 的 frame/child/matrix/registration/visible bounds 投影，壳体和条继续消费 191 保留范围。
- 35 头像 fixture、P1/P2、满/半/0 HP、出战/休息/换宠/形态变化、五关共享 Runtime 和 truth 关键字段变异测试。
- 940×590 正式 P1/P2 并排/叠图/差异证据；正式页面、宠物战斗 owner、数值、存档和动画行为不分叉。

UI 原生化合同：
- 显示列表清单：运行时严格投影 191 保留的 662 壳体层和 201 的 657 目标帧递归头像层；不创建现代头像容器几何或身体 atlas 替代层。
- 原版机器真值 JSON：静态壳体读取 `task-settings-191.pet-combat-hud` 的保留范围，动态头像读取 `task-settings-201.pet-combat-hud-head`；201 非 verified、有 unresolved 或关键 fixture 缺失时本 task 阻塞。
- 原版视觉基准：201 的逐头像正式 baseline + 191 的壳体/HP/MP 基准；P1/P2 均在 940×590 正式关卡入口复验。
- 允许的现代视觉例外：空；不得用身体 atlas、通用裁片或 Graphics 补头像。
- 逐状态验收：35 个实际头像 fixture、P1/P2、出战/休息、换宠/进化、满/半/0 HP/MP、五关进入/返回/重载。
- 差异证据：逐 fixture 对账 source character/frame/matrix/bounds；代表九物种与灵猴 character 619 生成并排/50% overlay/差异清单，解释仅允许抗锯齿类容差。

完成定义：
- 正式宠物战斗 HUD 的头像内容、位置、注册和尺寸直接由 201 真值决定；不存在 657 联合 bounds 或身体 atlas 替代路径。
- 修改/移除 201 的关键 frame、child、matrix、registration 或 bounds 时测试失败；只导入 truthId 不算消费证明。
- P1/P2、五关、换宠/形态、休息/再出战与重载均显示正确头像，console 零 warning/error；本 task 不提前实施宠物基类。

验收标准：
- 先运行 `npm run check:structure`；`Stage1PetCombatHudView.ts` 若仅保持当前轻量规模可局部修改，任何触及 `PetSystem.ts` 的实现必须先按结构门禁拆分。
- 定向 truth/runtime 变异测试、`npm run test:pet-combat-hud`、`npm run test:formal-pets`、`npm run test:formal-pet-journey`、`npm run test:systems`、`npm run build` 通过。
- `npm run check:structure`、`npm run check:annotations`、`npm run check:workflow`、`npm run audit:problems`、`git diff --check` 通过；940×590 正式 P1/P2 视觉证据和零 console 记录落盘。

禁止范围：
- 不修改宠物成长、技能数值、AI、roster/save owner、宠物页 932 或本体/技能动画；不实施 `PetCombatRuntime`。
- 不批量降级其他 verified manifest，不以 CSS/Graphics/身体 atlas 替代原版头像 child。

状态更新：
- 归档本 task，更新 PG-017 的首个正式消费者样本，并仅激活 `TASK-ARCH-203`。

推荐后续任务：
- `TASK-ARCH-203`：按已冻结宠物系统类设计建立 `PetCombatRuntime` 公共类与 P1 合同。

# LINE-PRE-STAGE-2-3-PRESENTATION 覆盖台账

## 用户确认范围

- 所有玩家可见的装备格与已穿戴槽在悬停时显示该实例的有效数值，包含基础值、强化/随机/继承影响及原版字段格式；不另建装备数值 owner。
- 宠物从正式关卡入口可打开真 UI，页面、P1/P2 owner、出战/休息/选择/技能与存档可见；战斗中宠物实体、必要 HUD 与技能对象使用恢复源真动画。
- 五角色的本体、装备/形态、普攻、技能对象与战斗 HUD 按同一审计标准核对，重点比较原 SWF 帧率、帧数、持帧、动作转移、注册点/嵌套矩阵、解包完整性、资源加载与现代动画 clock；不预设“卡顿就是解包不全”。
- 正式战斗 HUD 显示当前角色已绑定的技能与原生技能 UI，与技能功能页、P1/P2、当前存档、MP/可用性/冷却状态同步。
- 全部整改在正式建档→地图→关卡→功能页→返回→重载旅程中验证后，才能恢复 Stage 2-3。
- 用户 2026-08-17 追加反馈：正式背包与炼丹炉必须明确为同一背包，底部分页使用同一套原生按钮状态和 `n/5` 表现；各自宿主原版坐标仍保留。
- 用户 2026-08-21 要求在 193E 前先重做宠物真值并把新真值实践到 UI，再建立宠物基类；第一项按逆向/实现门禁拆为 201/202，第二项按既有宠物类设计落为 203 的 P1 公共类，不越入 P2-P4 迁移。

## 证据原则

- 2026-08-17 用户运行复验是对 158/180/183 及 `M-036/M-047/M-049/M-052` 部分关闭措辞的反证；相关结论立即降级为待复核。
- 175A 的宠物单页 verified 真值和 175D 的技能功能页 verified 真值仍作为可用证据，但不能代替正式路由可见、战斗实体动画或战斗技能 HUD 证据。
- UI/HUD 证据与实现默认拆 task；没有显示列表、`verified` 原版机器真值 JSON、原版基准和逐状态差异时，实现 task 不得闭合。
- 宠物动画和角色卡顿的子 task 只能由 193/195 的证据分区生成；每个子 task 只处理一个恢复源资源族或一个受影响角色。
- PG-017 的正式运行反证只否定 191 中 character 657 动态头像的联合 bounds/身体 atlas 假设；201 已以 `task-settings-201.pet-combat-hud-head` 给出有界裁决并保留 605/610/614 壳体、条和文本静态事实，禁止因此批量判废全部旧 manifest。

## 覆盖矩阵

| 维度 | 已有基础 | 当前缺口 | 关闭证据 |
| --- | --- | --- | --- |
| 装备悬停数值 | 189 已冻结 12 状态/32 对象 verified 真值；190A/190B1..B4 已闭合正式背包和工坊四页全部原版装备消费者 | 无；商城 49 项与权威装备目录零交集，时装原版禁用 hover 负合同保持 | 190A 正式背包；190B1 强化、B2 合成、B3 分解、B4 打造；P1/P2、拒绝/成功/移出/返回重开和商城负门禁均通过 |
| 背包分页一致性 | 正式背包与炼丹炉共享 `InventoryGridView`、同一 inventory owner 和两份 verified 页面真值 | 无；190C 已移除工坊静态 `/5`、背景按钮和透明分页命中分叉 | 两页共同消费 `createInventoryPagerObjects`、原生三态按钮与完整 `n/5`；各自 truth 几何、第一页/第二页和 940×590 运行对照通过 |
| 宠物页/入口 | 175A 的 74 对象/16 状态真值、180 页面投影、191 正式可见性矩阵；192A 已固化非 QA 当前 schema 双人冷启动→地图→五关 Runtime→P1/P2 932→返回/重载旅程 | 无；bundle、page-assets、render 失败均发出统一 `feature-ui-failed` 结构化信号 | `formal-pet-journey-tests.ts`；`TASK-SLICE-192A/runtime-audit.md`；P1/P2/五关/重载与 940×590 零 console |
| 宠物战斗 UI | 宠物 owner、出战状态和技能 runtime 已有；191 的 662 壳体、605/610/614、条和三字段保留；201 已生成 35 fixture/70 P1-P2 投影/4 负状态 verified 头像真值 | 无；202 已删除身体 atlas、联合 bounds 拉伸和硬编码头像定位 | 202 的 33 唯一终端 child/35 fixture 专属 bundle、关键字段变异、P1/P2/五关旅程、九物种零像素差和 940×590 零 console |
| 宠物战斗公共类 | `PetCombatRuntime/PetBehavior/Registry/Targeting` 四个 P1 角色、同步跟随/目标/策略/效果/销毁顺序和专项合同已存在 | 本线要求的 P1 无缺口；TestScene/五关消费者与旧入口仍属于设计 P2-P4 后续范围 | 203 的 `npm run check:system-design -- pet P1`=0；全系统/build 通过；`pet all` 仍按合同为 1，不冒充全部迁移关闭 |
| 宠物真动画 | 九物种技能行为与部分占位 projectile 已有；193 已冻结 35 形态/38 技能映射；193A..193D 已闭合猴系、马系真值与运行投影 | 其余七族逐帧证据/实现未闭合 | 猴系 4 本体 atlas/9 唯一对象序列与马系 4 本体 atlas/185 帧对象均直连 verified 真值；193E..193R 继续其余七族；194 最终跨族校准 |
| 五角色动作流畅度 | 069/158 视觉索引/桥、163/164/173/174 几何与行为证据 | 用户观察到角色间卡顿与流畅度不一；根因可能在资源完整性、帧时序/持帧、clock、动作转移、加载或投影 | 195 跨角色可测对照与根因分类；只为受影响角色生成单角色修复 task；196 五角色统一校准 |
| 战斗技能 HUD | 技能功能页 175D/183、五槽绑定数据、HUD snapshot/bridge 已有 | 用户在战斗 UI 中未看到角色技能；旧 M-049/VS-051 关闭结论待复核，不得用技能功能页替代 | 197 战斗 HUD 显示列表/verified 真值；198 可见原生投影；199 绑定/MP/冷却/P1-P2/存档联动 |
| 正式旅程 | 当前单 schema、五关 Runtime、功能页 router 和旧 159 旅程 | 新 UI/动画组合后的冷启动、跨页/跨关/双人/重载尚未证明 | 200 独立自动旅程 + 940×590 人工视觉/手感验收 |

## 任务调度与拆分点

1. `TASK-SETTINGS-189`：Done；已闭合装备 hover 证据和消费者矩阵。
2. `TASK-SLICE-190A`、`TASK-SLICE-190B1..B4` 与 Split 父任务 `TASK-SLICE-190B`：Done；正式背包、工坊四页与商城负合同已闭合，VS-066 完成。
3. `TASK-SLICE-190C`：Done；用户插入的背包分页视觉回归已关闭，两页共用原生三态分页投影与完整 `n/5`，未提前执行完整共享 UI 组件线。
4. `TASK-SETTINGS-191`、`TASK-SLICE-192A/192B`：Done；页面入口链、非 QA 五关冷启动/返回/重载旅程、失败信号及独立战斗 character 662 的 P1/P2 原生投影均已闭合。
5. `TASK-SETTINGS-193`：Done；`pet-animation-corpus.json` 已闭合 9 物种、35 形态、38 技能映射与五恢复包 owner，生成 193A..193R 九组串行证据→实现 task。
6. `TASK-SETTINGS-193A`：Done；`task-settings-193a.pet-monkey-animation` 以 626 状态、20 显示对象、626 SWF-derived 基准闭合 monkey1..4 本体、普攻、xj/lj/lyq/jgaoyi、hurt/dead、补丁 owner、host-tick clock、注册点/边界与销毁矩阵，`unresolved=[]`。
7. `TASK-SLICE-193B`：Done；四本体与九唯一对象序列由 `combat-common` 唯一加载，Stage 1-1 与其余四关共享同一真值消费者，P1/P2/Retry 和 940×590 零 console 通过；未改玩法、AI、owner 或存档。
8. `TASK-SETTINGS-193C`：Done；`task-settings-193c.pet-horse-animation` 以 716 状态、20 对象和 716 个 SWF-derived 基准闭合 horse1..4 本体、普攻、sp/bd/bz/tmaoyi、共享冰效、三包 owner、host clock、注册点/边界和销毁矩阵，`unresolved=[]`。
9. `TASK-SLICE-193D`：Done；直接消费 193C 真值，四本体与 185 帧对象由 `combat-common` 唯一加载，五关/P1-P2 共享 Runtime，玩法数值、AI、owner、存档不变。
10. `TASK-SETTINGS-201`：Done；`task-settings-201.pet-combat-hud-head` 已闭合 35 个 `gotoAndStop` fixture、70 个 P1/P2 投影、4 个负状态、逐帧 baseline、独立全面性结论与 191 有界裁决，`unresolved=[]`，未修改 `src/`。
11. `TASK-SLICE-202`：Done；正式 HUD 直接消费 201 新真值，33 个唯一终端 child 覆盖 35 fixture；删除身体 atlas/657 联合 bounds 替代，关键字段变异、九物种零像素差与 940×590 双人运行通过。
12. `TASK-ARCH-203`：Done；已按冻结宠物类设计建立 `PetCombatRuntime/PetBehavior/Registry/Targeting` 和 P1 合同；未迁移 TestScene/五关或删除旧入口，P2-P4 后续另行生成。
13. `TASK-SETTINGS-193E -> ... -> TASK-SETTINGS-193Q -> TASK-SLICE-193R`：完成 203 后恢复，对其余七族按 verified 证据→实现串行；七个证据 task 分别使用 `$pet-family-reverse` 和 `MO-001`，在单 task 内以 Luna A/B 并行只读调查、主 agent 单写归并、Luna 独立完整性复核，不并行 task 状态；证据未闭合时配对实现不得 Ready。
14. `TASK-SLICE-194`：所有宠物资源族子 task 完成后，做 P1/P2、跨物种、页面↔战斗↔存档的最终校准。
15. `TASK-SETTINGS-195`：建立五角色同一帧时序/转移/加载对照，按证据生成“每受影响角色一 task”并插入 196 之前。
16. `TASK-SLICE-196`：五角色统一动作流畅度、UI 完整度和正式 Runtime 校准；不代替单角色修复。
17. `TASK-SETTINGS-197 -> TASK-SLICE-198 -> TASK-SLICE-199`：技能功能页保持独立已有证据；本批只闭合战斗技能 HUD 真值、可见投影和运行联动。
18. `TASK-SLICE-200`：集中正式旅程与整线关闭；通过后才恢复 `LINE-STAGE-2-3 / TASK-SETTINGS-064`。

## 明确排除

- Stage 2-3 及更后关卡逆向/实现。
- 新宠物、新角色、新技能、新装备数值，以及网络/活动/商业系统。
- 未经原版证据或用户批准的现代面板、占位动画、通用按钮或可见替代层。
- 借本线顺手执行 `LINE-SHARED-UI-COMPONENTS`、怪物架构或发布载荷重构。
- 借 203 顺手迁移设计 P2-P4、删除旧 Runtime/barrel 或把宠物类改成未冻结的深继承体系。

## 关闭检查

- [ ] 装备格/已穿戴槽及 189 证明的其他消费者在 hover 时显示同一实例的权威有效数值。
- [ ] 宠物页与战斗 UI 在正式 P1/P2 路径可见、可操作，不被宿主/层级/加载问题隐藏。
- [x] character 657 的 35 个声明头像已按中文名目标帧递归到真实 child；P1/P2 投影、负状态、逐帧 baseline、全面性与 child/frame/matrix 变异门禁通过。
- [x] 正式 HUD 直接消费 201，删除联合 bounds/身体 atlas 头像替代，并以五关 P1/P2 逐状态差异证明消费有效。
- [x] 宠物战斗公共类 P1 gate 为 0，`PetSystem.ts` 不新增基类逻辑；P2-P4/all 未完成范围保持显式，不被本线局部任务越级关闭。
- [ ] 宠物 corpus 无未解释资源族，本体/移动/攻击/技能/受击/死亡中适用动作的真时间轴与行为一致，占位 projectile/字样回填清零。
- [ ] 五角色共用同一动作质量标准；每个用户可见卡顿/丢帧/错转移都有根因、修复或原版证据解释。
- [ ] 战斗 HUD 可见显示当前角色五槽技能，技能图标/键位/不可用/MP/冷却/绑定和 P1/P2 状态与功能页、存档同源。
- [ ] 所有 UI/HUD 具有显示列表、`verified` 原版机器真值 JSON、原版基准、许可现代例外和逐状态差异证据。
- [ ] 自动专项、全系统、structure、annotations、workflow、build 与 940×590 正式冷启动/P1/P2/重载旅程通过，console 零 warning/error。
- [ ] 无未完成同线 task，所有用户反证都有新证据、处置与可重开信号。

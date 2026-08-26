# LINE-PRE-STAGE-2-3-PRESENTATION 覆盖台账

## 用户确认范围

- 所有玩家可见的装备格与已穿戴槽在悬停时显示该实例的有效数值，包含基础值、强化/随机/继承影响及原版字段格式；不另建装备数值 owner。
- 宠物从正式关卡入口可打开真 UI，页面、P1/P2 owner、出战/休息/选择/技能与存档可见；战斗中宠物实体、必要 HUD 与技能对象使用恢复源真动画。
- 五角色的本体、装备/形态、普攻、技能对象与战斗 HUD 按同一审计标准核对，重点比较原 SWF 帧率、帧数、持帧、动作转移、注册点/嵌套矩阵、解包完整性、资源加载与现代动画 clock；不预设“卡顿就是解包不全”。
- 正式战斗 HUD 显示当前角色已绑定的技能与原生技能 UI，与技能功能页、P1/P2、当前存档、MP/可用性/冷却状态同步。
- 全部整改在正式建档→地图→关卡→功能页→返回→重载旅程中验证后，才能恢复 Stage 2-3。
- 用户 2026-08-17 追加反馈：正式背包与炼丹炉必须明确为同一背包，底部分页使用同一套原生按钮状态和 `n/5` 表现；各自宿主原版坐标仍保留。
- 用户 2026-08-21 要求先重做宠物真值并实践到 UI，再建立宠物基类；201/202 已完成头像真值/UI，203 只完成 P1 骨架。2026-08-25 曾据此安排 204A..G 横向批次，但该安排已被下述正式运行反证取代。
- 用户 2026-08-25 进一步要求先专项逆向原版 AS3 `BasePet`；205/206 已完成继承、owner、生命周期证据与设计裁决。206 生成的 204B..G 串行合同同样已被后续“完整单家族优先”裁决取代，不再作为当前计划。
- 用户 2026-08-25 运行反证：正式游戏中看不到宠物对怪物自主攻击；`PetCombatRuntime` 没有 Scene/正式消费者，猴/马 `basicAttack` 只发事件而没有真实动画、命中和伤害。用户进一步裁决：不得继续按物种 Behavior/视觉/消费者横向批处理，也不得在完整完成一个宠物家族前沉淀 Skill。先完整闭合猴系，再从实际经验重写 Skill，并用第二家族验证复用性。

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
| 宠物战斗公共类 | 203/204A 建立旧骨架；205 闭合 35 形态基类证据；206 冻结组合设计；204B 让结构 P1/P1B gate=0；207/208 让猴系 41 项合同进入正式 Runtime，P1R=0 | 其余八家族尚未完成同样的证据→正式运行闭环，兼容入口仍后置 | 209 起以第二家族验证后的 Skill 逐族生成，最终 all=0 |
| 宠物真动画 | 193 已冻结 35 形态/38 技能映射；193A..193D 已闭合猴/马局部视觉真值与投影；207/208 已把猴系视觉、AI、技能、命中伤害、owner/lifecycle 合为正式闭环 | Skill 只有猴系单案例；马系虽有 193C/193D 视觉与投影，尚无完整家族行为/命中/正式 Runtime 合同 | 209 闭合马系完整证据，随后单独正式复现并裁决第二家族验证；其后继续逐族，194 最终跨族校准 |
| 五角色动作流畅度 | 069/158 视觉索引/桥、163/164/173/174 几何与行为证据 | 用户观察到角色间卡顿与流畅度不一；根因可能在资源完整性、帧时序/持帧、clock、动作转移、加载或投影 | 195 跨角色可测对照与根因分类；只为受影响角色生成单角色修复 task；196 五角色统一校准 |
| 战斗技能 HUD | 技能功能页 175D/183、五槽绑定数据、HUD snapshot/bridge 已有 | 用户在战斗 UI 中未看到角色技能；旧 M-049/VS-051 关闭结论待复核，不得用技能功能页替代 | 197 战斗 HUD 显示列表/verified 真值；198 可见原生投影；199 绑定/MP/冷却/P1-P2/存档联动 |
| 正式旅程 | 当前单 schema、五关 Runtime、功能页 router 和旧 159 旅程 | 新 UI/动画组合后的冷启动、跨页/跨关/双人/重载尚未证明 | 200 独立自动旅程 + 940×590 人工视觉/手感验收 |

## 任务调度与拆分点

1. `TASK-SETTINGS-189`：Done；已闭合装备 hover 证据和消费者矩阵。
2. `TASK-SLICE-190A`、`TASK-SLICE-190B1..B4` 与 Split 父任务 `TASK-SLICE-190B`：Done；正式背包、工坊四页与商城负合同已闭合，VS-066 完成。
3. `TASK-SLICE-190C`：Done；用户插入的背包分页视觉回归已关闭，两页共用原生三态分页投影与完整 `n/5`，未提前执行完整共享 UI 组件线。
4. `TASK-SETTINGS-191`、`TASK-SLICE-192A/192B`：Done；页面入口链、非 QA 五关冷启动/返回/重载旅程、失败信号及独立战斗 character 662 的 P1/P2 原生投影均已闭合。
5. `TASK-SETTINGS-193`：Done；`pet-animation-corpus.json` 已闭合 9 物种、35 形态、38 技能映射与五恢复包 owner；其当时生成的 193E..R 分片任务已在本轮撤销，但 corpus 事实继续保留。
6. `TASK-SETTINGS-193A`：Done；`task-settings-193a.pet-monkey-animation` 以 626 状态、20 显示对象、626 SWF-derived 基准闭合 monkey1..4 本体、普攻、xj/lj/lyq/jgaoyi、hurt/dead、补丁 owner、host-tick clock、注册点/边界与销毁矩阵，`unresolved=[]`。
7. `TASK-SLICE-193B`：Done；四本体与九唯一对象序列由 `combat-common` 唯一加载，Stage 1-1 与其余四关共享同一真值消费者，P1/P2/Retry 和 940×590 零 console 通过；未改玩法、AI、owner 或存档。
8. `TASK-SETTINGS-193C`：Done；`task-settings-193c.pet-horse-animation` 以 716 状态、20 对象和 716 个 SWF-derived 基准闭合 horse1..4 本体、普攻、sp/bd/bz/tmaoyi、共享冰效、三包 owner、host clock、注册点/边界和销毁矩阵，`unresolved=[]`。
9. `TASK-SLICE-193D`：Done；直接消费 193C 真值，四本体与 185 帧对象由 `combat-common` 唯一加载，五关/P1-P2 共享 Runtime，玩法数值、AI、owner、存档不变。
10. `TASK-SETTINGS-201`：Done；`task-settings-201.pet-combat-hud-head` 已闭合 35 个 `gotoAndStop` fixture、70 个 P1/P2 投影、4 个负状态、逐帧 baseline、独立全面性结论与 191 有界裁决，`unresolved=[]`，未修改 `src/`。
11. `TASK-SLICE-202`：Done；正式 HUD 直接消费 201 新真值，33 个唯一终端 child 覆盖 35 fixture；删除身体 atlas/657 联合 bounds 替代，关键字段变异、九物种零像素差与 940×590 双人运行通过。
12. `TASK-ARCH-203`：Done；已按冻结宠物类设计建立 `PetCombatRuntime/PetBehavior/Registry/Targeting` 和 P1 合同；未迁移 TestScene/五关或删除旧入口，P2-P4 后续另行生成。
13. `TASK-ARCH-204`：Split；204A 的旧 P1/P1B 结论经 205/206 降级，204B 又被用户运行反证为只闭合结构门禁。旧“公共校正→批量物种→最后迁消费者”路线撤销，改由 207/208 先闭合一个完整参考家族。
14. `TASK-SETTINGS-205`：Done；`pet-base-class.md` 已闭合原版 `BasePet` 继承树、字段/owner、生命周期、35 形态覆写矩阵、架构无关行为合同和现代 owner 审计；没有修改 `src` 或设计文档。
15. `TASK-ARCH-206`：Done；保留组合总体方向但扩展 Behavior，冻结 ordered-first/1200 sticky 目标、活动实例帧末 CD、`alive -> dead-playing -> destroy`、typed animation/damage 事件、私有清理、owner/消费者和 204B..G gate；未修改 `src`。
16. `TASK-ARCH-204B`：Done，但结论收窄为结构 gate；ordered-first/活动 CD/dead-playing/typed event 接缝存在，不再声称玩家可见自主战斗或猴马完整闭合。
17. `TASK-SETTINGS-207`：Done；未使用现有宠物 Skill，以 `task-settings-207.pet-monkey-family` 闭合 41 项自主 AI、普通攻击、全部技能、命中/伤害、626 状态视觉引用、三套碰撞、owner 和 P1/P2 生命周期合同，`unresolved=[]`，并冻结 P1R 同集输入。
18. `TASK-SLICE-208`：Done；猴系四形态正式 P1/P2 自主战斗、真普攻/技能/命中伤害/生命周期和 940×590 验收通过，`pet P1R=0`；已用 `$skill-creator` 从完整案例重写 `$pet-family-reverse`。
19. `TASK-SETTINGS-209`：Ready；选择已有 193C/193D 完整视觉源和消费者基础的马系作为第二家族，使用更新后的 Skill 闭合完整证据，再依据 verified 结果生成单独正式实现 task。
20. 旧 `TASK-ARCH-204C..G` 与 `TASK-SETTINGS-193E..TASK-SLICE-193R` 全部撤销；只为当前家族生成连续完整任务，完成前不切换家族。
21. `TASK-SLICE-194`：所有按新方法生成的完整家族任务完成后，做 P1/P2、跨物种、页面↔战斗↔存档的最终校准。
22. `TASK-SETTINGS-195`：建立五角色同一帧时序/转移/加载对照，按证据生成“每受影响角色一 task”并插入 196 之前。
23. `TASK-SLICE-196`：五角色统一动作流畅度、UI 完整度和正式 Runtime 校准；不代替单角色修复。
24. `TASK-SETTINGS-197 -> TASK-SLICE-198 -> TASK-SLICE-199`：技能功能页保持独立已有证据；本批只闭合战斗技能 HUD 真值、可见投影和运行联动。
25. `TASK-SLICE-200`：集中正式旅程与整线关闭；通过后才恢复 `LINE-STAGE-2-3 / TASK-SETTINGS-064`。

## 明确排除

- Stage 2-3 及更后关卡逆向/实现。
- 新宠物、新角色、新技能、新装备数值，以及网络/活动/商业系统。
- 未经原版证据或用户批准的现代面板、占位动画、通用按钮或可见替代层。
- 借本线顺手执行 `LINE-SHARED-UI-COMPONENTS`、怪物架构或发布载荷重构。
- 绕过 206 设计直接扩展旧 `Behavior`，或未经证据和明确设计 task 把现代实现改成深继承体系。

## 关闭检查

- [ ] 装备格/已穿戴槽及 189 证明的其他消费者在 hover 时显示同一实例的权威有效数值。
- [ ] 宠物页与战斗 UI 在正式 P1/P2 路径可见、可操作，不被宿主/层级/加载问题隐藏。
- [x] character 657 的 35 个声明头像已按中文名目标帧递归到真实 child；P1/P2 投影、负状态、逐帧 baseline、全面性与 child/frame/matrix 变异门禁通过。
- [x] 正式 HUD 直接消费 201，删除联合 bounds/身体 atlas 头像替代，并以五关 P1/P2 逐状态差异证明消费有效。
- [x] 204B 的结构 P1 gate 为 0；只证明 ordered-first/1200 sticky、活动实例帧末 CD、dead-playing 和 typed event 接缝存在，不证明正式自主战斗。
- [x] 首个完整参考家族 monkey1..4 从原版证据、普通攻击/全部技能、真动画、命中/伤害、owner/生命周期到正式 P1/P2 运行全部闭合，`P1R=0`。
- [x] 205 已闭合原版 `BasePet` 专项证据，206 已冻结唯一现代设计和真实失败基线；其 204B..G 横向串行安排已由用户运行反证撤销。
- [ ] 已从完整猴系案例重写 `$pet-family-reverse`；仍须由 209 及其配对马系正式实现完成第二家族验证，再逐族完成差异接缝、TestScene/正式五关/功能页迁移和旧入口清零，最终 `all=0` 并退出设计验收。
- [ ] 宠物 corpus 无未解释资源族，本体/移动/攻击/技能/受击/死亡中适用动作的真时间轴与行为一致，占位 projectile/字样回填清零。
- [ ] 五角色共用同一动作质量标准；每个用户可见卡顿/丢帧/错转移都有根因、修复或原版证据解释。
- [ ] 战斗 HUD 可见显示当前角色五槽技能，技能图标/键位/不可用/MP/冷却/绑定和 P1/P2 状态与功能页、存档同源。
- [ ] 所有 UI/HUD 具有显示列表、`verified` 原版机器真值 JSON、原版基准、许可现代例外和逐状态差异证据。
- [ ] 自动专项、全系统、structure、annotations、workflow、build 与 940×590 正式冷启动/P1/P2/重载旅程通过，console 零 warning/error。
- [ ] 无未完成同线 task，所有用户反证都有新证据、处置与可重开信号。

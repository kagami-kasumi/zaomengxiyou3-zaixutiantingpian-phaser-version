# TASK-SETTINGS-211

任务类型：
- `TASK-SETTINGS`

任务模型：
- `逆向任务`

逆向子类型：
- `视觉真值逆向`

逆向方案：
- `docs/reverse-engineering/plans/ground-truth-fine-grained-generation.md`

功能条线：
- `LINE-PRE-STAGE-2-3-PRESENTATION`（Active；Ready）

执行前置：
- `TASK-SLICE-210` 已完成马系正式伤害链与 `pet P1H=0`；本 task 是当前唯一 Ready，证据轮不修改 `src/`。

目标机制/切片：
- `M-032`、`M-035`、`M-049`、`M-053`、`VS-071`

规模预算：
- 主工作包：2
- 预计上下文压缩：0
- 独立验收批次：2

拆分触发：
- 若怪物伤害数字、暴击数字和连击面板来自 `OtherMat1.swf` 之外的独立 owner，或原版还存在独立的玩家受伤/治疗/MP 数字系统，立即拆补证 task；本 task 只闭合“怪物作为伤害目标”的命中反馈。

协作计划：
- 模式：单 agent
- 并行工作包：无
- 写入 owner：主 agent
- 归并检查点：机器真值生成前、验收前
- 方法观测：无

输入资料：
- `docs/workflow/reverse-engineering-protocol.md`、`docs/workflow/reverse-engineering-task-protocol.md` 与本 task 唯一链接的细粒度真值方案。
- 原版 `BaseMonster.as`、`CureHpQueue.as`、`GameInfo.as`、`Batter.as` 的局部调用链，以及恢复源 `local-resources/regima/source/restored-swfs/assets/OtherMat1.swf`。
- `OtherMat1.swf` 中 `hurtnum0..9`、`bnum0..9`、`num0..9`、`export.Batter` 的 SymbolClass、时间轴、矩阵、注册点和导出资源。
- 当前 `DamageEvent`、英雄/宠物/法宝命中结算、五关怪物 hurt/dead visual systems、战斗 HUD、结果页最高连击消费者与正式 Runtime 调度链。

输出产物：
- `combat-hit-feedback-index.md` 六段证据链：成功扣血到怪物 hurt/HP 条、普通数字、暴击数字、连击累计/显示/超时重置和最高连击的完整调用顺序与 owner。
- 新 `task-settings-211.combat-hit-feedback` verified 机器真值，覆盖显示列表、字符资源、数字排版、舞台/目标锚点、缩放/位移/透明度时间线、队列节流、连击阈值与 P1/P2 几何；实现影响型 `unresolved=[]`。
- 940×590 原版基准：Role/宠物来源的普通/暴击/连续命中、2/9/10/99/100 连击、超时重置、怪物 hurt/dead 边界和 P1/P2；若来源不参与原版连击，必须以反证明确记录。
- 212 的同集合同：只有已形成实际 HP decrease 的 `DamageEvent` 才能派生命中反馈；miss、0 伤害、重复 attack id 和 dead target 不得生成可见数字或连击。

UI 原生化合同：
- 显示列表清单：怪物普通/暴击数字容器、逐位 child、`Batter` 根/背景/数字 child、depth、父子链、矩阵、注册点、目标锚点和动态创建/销毁顺序。
- 原版机器真值 JSON：独立 truthId/Schema/源 hash/locator/状态集，对象、字符映射、时间线和完整性均可机器校验，`unresolved=[]`。
- 原版视觉基准：固定版本、940×590、怪物/来源/伤害类型/连击值/P1-P2/时间点和裁切。
- 允许的现代视觉例外：只允许为现代多来源结算补稳定事件 id；不得改变玩家可见字形、布局、节奏或连击语义。
- 逐状态验收：普通/暴击、个位/多位、快速多击、Role/宠物/法宝来源、hurt/dead、2/9/10/99/100 连击、超时清零、P1/P2、首次/重入/重试。
- 差异证据：逐帧并排/叠图、对象差异、舞台与目标锚点误差、缩放/位移/alpha 曲线及字形边缘差异。

完成定义：
- 能确定回答“什么才算一次可见命中、数字显示多少、在哪里显示、暴击如何区分、哪些来源计入连击、连击何时清零”，212 不需要猜测即可实现。

验收标准：
- 恢复 SWF/SymbolClass/时间轴与 AS3 producer→queue→view→reset 链交叉；manifest Schema/关键字段变异、资源标注、workflow、problem audit 和 diff check 通过。

禁止范围：
- 不修改 `src/`，不重做怪物 AI/Definition/Registry，不处理玩家/宠物受伤数字、治疗/回蓝数字，不自行增加现代字体、粒子、震屏或新连击规则。

状态更新：
- 归档本 task；更新战斗反馈索引、机制/切片、本线覆盖台账、task-board/history 与适用 PG 反馈。

推荐后续任务：
- `TASK-SLICE-212`

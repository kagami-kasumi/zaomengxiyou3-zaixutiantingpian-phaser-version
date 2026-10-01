# TASK-SETTINGS-244

任务类型：`TASK-SETTINGS`

任务模型：`逆向任务`

逆向子类型：`视觉真值逆向`

逆向方案：`docs/reverse-engineering/plans/ground-truth-fine-grained-generation.md`

功能条线：`LINE-PRE-STAGE-2-3-PRESENTATION`（Active）

目标机制/切片：`M-032`、`M-034`、`M-042`、`VS-067`

待证明问题：六项公共自动增益的原版可见对象、播放时序、朝向/尺寸/父级投影、同名刷新与销毁显示合同。242B只完成数值，235的SymbolClass定位不能证明这些视觉事实。

规模预算：
- 主工作包：1（同一pet1资源族的六公共效果）
- 预计上下文压缩：0
- 独立验收批次：1

拆分触发：
- 需要未声明资源族、新增数值/碰撞机制或完整运行时研发时，冻结已知范围并生成同线有界补证；不扩大到各家族专属技能。

输入资料：
- `docs/workflow/reverse-engineering-task-protocol.md`及唯一链接的视觉方案。
- `docs/reverse-engineering/pet-passive-auto-buff-contract.md`及`pet-passive-runtime-acceptance.md`，235/243数值真值只作状态驱动，不重解释公式。
- 原版舞台940×590，恢复`local-resources/regima/source/restored-swfs/assets/pet1.swf`；先核实路径和hash，不使用旧提取结果裁决视觉缺失。
- 目标Symbol：sxkb/806、fsnl/713、smjc/805、mfjc/778、gjjc/761、fyjc/738；以恢复包实际SymbolClass复核身份。
- 只窄读BasePet.checkBuffSkill、BaseAddEffect及六项show/step/destroy调用链；必要的BaseHero/BaseSprite root/colipse定位。旧AS3只作行为对照。
- fixture：六项各首次添加、活跃完整周期、同名刷新、自然到期、零时长、宿主移动/转向/销毁；宠物端/英雄端按实际源目标分别覆盖P1/P2、两朝向与猴马四形态/已知英雄尺寸。相同原生显示可复用资源，但不能省略实例矩阵/父级/depth证明。

输出产物：
- `docs/reverse-engineering/pet-passive-visual-contract.md`，六段证据链、有限入口/替身、未知项与反证。
- `docs/reverse-engineering/ground-truth/manifests/task-settings-244-pet-passive-effects.json`：Schema合规、verified递归显示树、逐帧/显示序列、矩阵/注册点/颜色/滤镜/遮罩与父级清理事实；未解释字段不得晋升verified。
- 本地`docs/tasks/evidence/TASK-SETTINGS-244/`原生逐状态基准、差异/重放报告及`local-resources/regima/task-outputs/TASK-SETTINGS-244/`可再生原生probe。
- 依据明确资源消费边界生成同线最小视觉实现任务；运行必需产物移正式资源目录，不能依赖忽略证据。

完成定义：六效果声明状态均有独立原生机器真值及基准，来源/显示列表/时序/目标挂接/移除闭合，后续实现无需猜补；不是现代特效完成。

验收标准：
- 按方案提取当前帧递归可见树，完整周期及动态add/remove；不使用根联合bounds或整fixture截图代替对象真值。
- 原生入口独立捕获expected，重复生成一致；至少以错误方向、错父级/注册点、时间轴提前/冻结、刷新重复对象、销毁残留实施反证。
- 数值时间与视觉帧区分，world暂停/显示推进按真实调用者证明；零时长不能从数值直接推断无视觉帧。
- Schema、hash、状态完整性分别报告；未知进入unresolved；差异仅沿用明确许可，不扩大旧视觉/碰撞白名单。
- workflow、structure、audit:problems及适用真值专项通过，覆盖台账/任务调度同次交接。

禁止范围：不改现代src，不改原提取结果，不重做235/243数值，不核销204/all/194/VS-067或原84其余责任，不加入现代可见占位。

状态更新：Ready（2026-10-01；242B与父242数值联合完成，开始六效果独立视觉补证）。

推荐后续任务：依据本项verified真值生成同线六增益视觉投影与五关联合消费任务；其他公共怪物类型/人偶与剩余家族继续由204承接。

# TASK-SLICE-245

任务类型：`TASK-SLICE`

任务模型：`常规任务`

功能条线：`LINE-PRE-STAGE-2-3-PRESENTATION`（Active）

目标机制/切片：`M-032`、`M-034`、`M-042`、`VS-067`

要解决的问题：242完成公共数值，但六效果尚无正式可见投影；244现已证明不同宿主、播放寿命、暂停及清理，不能统一按buff数值time显示/隐藏。

关联具体系统设计：`docs/architecture/system-designs/pet.md`（当前有效、实施中）。本批设计验收gate：`npm run check:system-design -- pet P1GS`、`P1R`、`P1H`、`P1G`、`P1T`；分别按同一命令替换gate执行，退出非0不通过。本项不得核销all。

规模预算：
- 主工作包：2（六效果正式资源/投影；既有公共效果owner接线及正式五关联合）
- 预计上下文压缩：0
- 独立验收批次：2（全部244视觉消费；正式生命周期/旅程联合）

拆分触发：
- 原生原点/缩放/滤镜转换出现不可解释像素差异或声明外宿主profile，先有界补证，不自行扩大视觉例外。
- 若必须新增数值owner、共享渲染机制研发或改造家族行为，保留全部合同并拆出同线前置；不逐关复制，不以略过状态减少验收。

协作计划：
- 模式：主agent + 有界subagent；主agent承担资源/运行时决策与唯一实现写入，Luna独立核对244源合同和消费差异。
- 并行工作包：只读原生矩阵/生命周期核查；不能改task状态或共享核心文件。
- 写入 owner：主agent；子agent只读。
- 归并检查点：接线前及验收前；方法观测：无。

输入资料：
- `docs/reverse-engineering/pet-passive-visual-contract.md`与244 verified manifest，及`tools/pet-passive-visual/README.md`；必须先核验本地完整真值与原生baseline，不能用现代图重建expected。
- 235/243数值合同与`pet-passive-runtime-acceptance.md`、`hero-pet-buff-owner-acceptance.md`；保持原1717 expected。
- `docs/architecture/src-boundaries.md`、当前pet设计/验收协议及实际Session/主人owner/presenter/asset bundle消费者。
- 原猴马四形态、五英雄显示profile；对其他已迁移家族仅能在既有verified profile适用性确认后复用公共路径，声明外状态先补证，不假称完整家族覆盖。

输出产物：
- 六原效果可重复生成的正式透明资源、帧/注册点/尺寸/颜色滤镜数据，运行数据进入正式src/public目录；Git拉取安装依赖即可运行，不能依赖244忽略文件。
- 既有主人效果owner/PetPassiveSession到共同presenter的生命周期接缝：身份、首次创建、刷新不重播、显示帧独立推进、场景层/宠物层、暂停和销毁。
- 全部244适用状态独立消费结果与差异、真实五关P1/P2场景证据和精简验收文档。

完成定义：六效果按244源合同在正式共享路径可见，并以原生expected验证实际渲染和生命周期；不是仅资源存在，也不关闭204/all/194/VS-067。

验收标准：
- 消费六原符号与全部声明显示状态/矩阵；直接比较真实Canvas/WebGL输出，按实际后端保留差异，不用renderer自绘参考冒充原生。
- sxkb/fsnl的100帧自移除、嵌套6帧、早/晚刷新、重加、zero/short、宠物淡出；四主人效果20/25帧独立完成、零时长仍显示、hurt中断、world暂停、原数组/parent清理全部独立对账。
- 宠物BBDC方向与root矩阵分开；休息/替换后主人四效果继续由主人拥有，场景退出/失败重试无残留，双owner不串状态。
- 至少反证错误父级/原点/方向、时间提前/冻结、刷新重复、数值到期误销毁、宠物休息误清主人效果与退出残留。
- 五正式入口双人可见首次/活跃/结束、暂停/恢复、换宠/休息、实际失败重试/返回/重载；保留既有HUD，零console不能单独证明视觉通过。
- 原1717数值、猴马及青龙/玄龟回归、指定设计gate、适用系统测试/build、workflow/structure/audit:problems全部退出0；文件交付不依赖本地大manifest或证据。

禁止范围：不改原语料，不重写235/243公式，不替换为现代占位，不新增第二宠物Runtime或逐关规则，不宣称其他未验宿主/完整家族/原84其余责任已经闭合。

状态更新：Ready（244视觉真值完成后激活；本次不执行）。

推荐后续任务：六效果共享消费闭合后，按204剩余公共责任与当前线覆盖缺口生成同线下一任务；保持唯一Ready，不提前关闭完整家族或切换功能线。

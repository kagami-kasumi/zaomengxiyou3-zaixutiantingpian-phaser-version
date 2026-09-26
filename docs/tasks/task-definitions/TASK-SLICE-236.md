# TASK-SLICE-236

任务类型：`TASK-SLICE`

任务模型：`常规任务`

功能条线：`LINE-PRE-STAGE-2-3-PRESENTATION`（Active；本任务 Ready）

目标机制/切片：`M-030`、`M-032`、`M-042`、`VS-067`

要解决的问题：230已证实宠物命中只记击退event、实际怪物不运动；现代pet命中又早于怪物物理，不能直接按当前帧写速度。以230有界原合同接入现有真实模型，不执行怪物架构线重构。

规模预算：
- 主工作包：1
- 预计上下文压缩：0
- 独立验收批次：1

拆分触发：
- 若现有217/218空间输入不能覆盖所需原怪物/墙，或必须重做身体回调/死亡/奖励，保留本合同并转同线补证；不得猜几何或把231/232问题一起重构。

协作计划：
- 模式：主 agent + subagent
- 模型分工：主agent处理共享运动/结算相位；Luna只读独立核对实际五关/TestScene消费者和轨迹。
- 并行工作包：原生expected与现代轨迹独立比对，同属一份击退合同。
- 写入 owner：主 agent
- 归并检查点：验收前
- 方法观测：无

输入资料：
- `docs/reverse-engineering/monster-pet-knockback-contract.md`（六段证据及完整分支/排除矩阵）。
- `docs/reverse-engineering/ground-truth/manifests/behavior/task-settings-230-monster-knockback.json`；直接消费其`/motion`、`/entryAndScheduler`与217/218引用，不复制手写expected。
- `tools/monster-knockback-source/{capture.py,verify.py,generate.py}`；完整本地原生报告和源级重放依赖本地语料，正式运行不可依赖忽略的证据目录。
- `tools/pet-monster-knockback-preflight.ts`；现有Stage1Combat/PetProjectileCombat/PetMonkeyCombat/PetHorseCombat/MonsterPhysics、Registry与五关/TestScene真实模型/adapter。
- 226原41/43承接矩阵中的公共击退责任；231/232仍各自承担归属与身体/死亡时序。

输出产物：
- 原速度单位、Tween覆盖/边缘早退、下一host步消费、真实坐标写回的共享实现；现有每实体owner和去重入口保留。
- 正式五关与TestScene实际可达宠物目标消费；飞行/普通/Boss、P1/P2、重复/拒绝/0伤害、冻结/恢复、边界/落地和释放清理证据。
- 原oracle与实际模型轨迹对账、真正生产变异门禁、940×590实际可见运动和重试/返回清理证据；如实列出未覆盖身体/死亡组合。

完成定义：230已证范围由真实生产消费者完整消费，HP/event绿灯不能替代坐标/速度/timing通过；击退公共责任可回填，不提升猴马全族或整线完成度。

验收标准：
- 原生速度/轨迹比较区分Point和Sprite赋值，不用视觉容差放宽物理；20/24/30源host与不同render delta核对实际相位，不沿用2400重力或硬编码24作无证据换算。
- 保护/闪避/去重、新id覆盖、边界旧tween、P1/P2顺序必须由真实结算端口验证；不以遍历audit事件重放；区分原生host早入口和跳过petHostTick的旧猴/马晚入口，不能给晚入口额外延迟。
- 五关/TestScene实际x/y、碰撞/目标投影及显示同步；明确TestScene只读facade到真实Monster30接缝，怪物类型/原点来自既有真值。Monster3 arena只核销实际可达路径。
- 无消费、错误单位、错误命中/物理顺序、重复应用及漏清理的生产变异被拒绝；同时保持原伤害/经验/奖励回归。
- 当前hurt180ms、Boss反击/身体恢复等未证现代差异不伪称原版；不得用本项关闭231/232。
- `npm run check:structure`、相关系统/五关测试、`npm run build`、`npm run check:workflow`、`npm run audit:problems`及有界可见验收通过。

禁止范围：不改原提取结果、不重做宠物资源、不新增怪物架构设计、不改死亡奖励归属、不降低226原84合同；运行不得依赖本地证据目录。

状态更新：Ready，230完成后的同线唯一执行项；公共击退尚未修复。

推荐后续任务：完成后激活 `TASK-SETTINGS-231`，继续公共责任队列；232身体生命周期与其后233..235仍保留。

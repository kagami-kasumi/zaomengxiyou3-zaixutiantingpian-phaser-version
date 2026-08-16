# TASK-SLICE-183

任务类型：
- `TASK-SLICE`
功能条线：
- `LINE-CORE-PROGRESSION-COMPLETION`（Active；Planned）
目标机制/切片：
- `M-041`、`M-052`、`VS-055`
规模预算：
- 主工作包：2
- 预计上下文压缩：0
- 独立验收批次：2
拆分触发：
- 若 manifest 直连需要改动技能业务/存档 owner，或四页无法在一个 layout/view 消费批次内完成，先拆为同线子任务，不在本 task 扩大范围。
协作计划：
- 模式：单 agent
- 并行工作包：无
- 写入 owner：主 agent
- 归并检查点：不适用
- 方法观测：无
输入资料：
- `task-settings-175d.skill-pages` verified manifest、`TASK-SETTINGS-175D-skill-pages.md`、`skill-ui-native-index.md`、现有 `FormalSkillPageSystem/View` 与技能 owner/存档专项。
输出产物：
- 技能四页 layout/view 的 manifest 直连或可重复生成投影、手写视觉常量防回填门禁、逐状态现代差异证据。
UI 原生化合同：
- 显示列表清单：直接消费 175D 的 250/868/417/213、212、865、selector、按钮、动态 child 与 hit 清单，不重建第二份手抄表。
- 原版机器真值 JSON：truthId `task-settings-175d.skill-pages`；实现与测试直接读取 manifest 或消费可重复生成物，并将实际 Canvas 坐标回测到 940×590 stage。
- 原版视觉基准：`docs/tasks/evidence/TASK-SETTINGS-175D/original-*-940x590.png`，RegiMA 1.1 恢复源，十树/绑定双 owner/被动双 owner/返回。
- 允许的现代视觉例外：空；不可见可访问元数据及不改变原槽几何/提交时机的点击、键盘等价除外。
- 逐状态验收：按钮 normal/hover/pressed、角色 selected、十树/技能三态、绑定 P1/P2/拖放/回退/提交、被动字段/拒绝/满级、进入/返回与保存重载。
- 差异证据：同尺寸并排/50% 叠图、稳定区域像素或边缘差、逐对象“复用/等价动态/例外/未完成”清单和零 console。
完成定义：
- 删除技能页的现代可见覆盖与手写视觉真值源；四页直接消费 175D manifest，同时保持既有技能事务、当前活动 owner、HUD 与当前存档行为。
验收标准：
- 技能真值/业务/owner/存档专项、静态防回填、structure/build/workflow/annotation/diff/problem audit 与 940×590 逐状态正式入口回归通过。
禁止范围：
- 不修改技能数值、学习/绑定规则、存档 schema、其他功能页或功能宿主；不新增可见现代控件。
状态更新：
- 更新 `skill-ui-native-index.md`、机制/VS-055、功能线台账、看板/history；只有直接消费与逐态回归闭合后才提升 VS-055。
推荐后续任务：
- 按 175A..I 全部 manifest 的调度结果进入同线实现批次；不得抢占当前 `TASK-SETTINGS-175E`。

# TASK-SLICE-214C4

任务类型：
- `TASK-SLICE`

任务模型：
- `常规任务`

逆向子类型：
- 不适用

逆向方案：
- 不适用

功能条线：
- `LINE-PRE-STAGE-2-3-PRESENTATION`（Active；Planned）

目标机制/切片：
- `M-032`、`M-034`、`M-035`、`M-042`、`M-044`、`VS-067`

规模预算：
- 主工作包：2（初阶青龙真实战斗链；本批验证与交接）
- 预计上下文压缩：0
- 独立验收批次：2

拆分触发：
- 新资料族、资源派生、未声明 owner、第三工作包或第二次 compact 时停止新增实现，保留完整父级合同并拆分交接；不能因同属青龙而合并多批。

协作计划：
- 模式：主 agent + subagent（存在独立有界验证包且主 agent 可推进实现时启用）
- 并行工作包：只读核对本批精确源条件与生产 trace；输出差异和未覆盖项，不扩大来源范围
- 写入 owner：主 agent
- 归并检查点：正式验证前
- 方法观测：MO-003；只记录实际差异，不提前计完整家族成功

输入资料：
- `docs/tasks/evidence/TASK-SLICE-214C2/handoff.md`、本地已保存源检查产物。
- `docs/tasks/task-definitions/TASK-SLICE-214C2.md` 全部父级合同与未完成项；C1 handoff、214A 生产查询、213 verified 真值。
- `docs/architecture/system-designs/pet.md`（实施中）和本批直接消费者；不重新设计模式或职责归属。

输出产物：
- 在 A 的公共移动与现有时钟上注册 dragon1 Behavior，实现正常弹真实碰撞/来源伤害、自身命中治疗、fs 私有实体独立数值/CD/普攻、自然到期治疗及提前死亡清理。
- source-isolated normal/fs/expiry-heal trace、实际 HP/MP delta、root/clone 来源与生命周期负向验证；不能使用猴系攻击回退或视觉假分身。
- 本批证据保存到 `docs/tasks/evidence/TASK-SLICE-214C4/`，提供后续消费者、风险和可重跑命令。

UI 原生化合同：
- 继承 C2/214B 的显示列表、verified 真值、原版基准和允许例外；只消费 214A 查询，不复制视觉坐标或在视图新增战斗 owner。A/B 不宣称正式可见链完成，C 必须全量验收。

完成定义：
- 本批产物及测试成立且同线交接完整；不把公共接缝通过等同青龙或整家族完成。

验收标准：
- source-isolated normal/fs/expiry-heal trace、实际 HP/MP delta、root/clone 来源与生命周期负向验证；不能使用猴系攻击回退或视觉假分身。
- 执行 `npm run check:system-design -- pet P1GS` 保持既有公共接缝及猴马回归；C 批还必须新增并执行 `npm run check:system-design -- pet P1GC`，退出码 0 才能关闭初阶完整链。
- 相关生产系统测试、build、structure、workflow、problem audit 和 diff check 通过；涉及真值/资源时执行相应真值/资源/annotations 检查。剩余父级标准逐项转交，不静默删除。

禁止范围：
- 不跨家族、不新增存档 schema，不以视觉替身代替真实实体；用户已授权速度换算、既有职责内修正和必要窄接口，不将触及公共文件自动当成需审批的重设计。

状态更新：
- 通过后归档本项、更新覆盖台账与机制/切片、激活 TASK-SLICE-214C5。A/B 结束当次 goal；C 完成时必须同时归档 Split C2/C，未完成任何父级标准则不得激活 214D。

推荐后续任务：
- `TASK-SLICE-214C5`。

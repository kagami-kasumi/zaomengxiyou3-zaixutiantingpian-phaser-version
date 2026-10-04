# TASK-SETTINGS-256

任务类型：`TASK-SETTINGS`

任务模型：`常规任务`

功能条线：`LINE-PRE-STAGE-2-3-PRESENTATION`（Active）

目标机制/切片：`M-030`、`M-034`、`M-042`、`VS-067`

要解决的问题：232 BA-08仅静态映射其余怪物，Monster3/30完成不能覆盖Stage1-2的Monster2。特别是doHi2创建纯MovieClip并控制玩家Tween，不进入magicBulletArray；现有普通activeAttack路径不能作为原伤害/清理事实。先冻结这一单类型的行为输入，再据真实缺口生成空间/显示补证或现代消费任务。

规模预算：
- 主工作包：2（Monster2局部与共享调用链；原方法受控动态验证和实现交接）
- 预计上下文压缩：0
- 独立验收批次：2（行为oracle与源变异；现代消费者/输入缺口映射）

拆分触发：
- 缺少攻击像素、显示树或Tween视觉事实且超出本行为合同，明确未知并另建同线视觉补证，不以Monster3/30已批准残差外推。
- 出现需要独立公共接收机制的新分支时，只冻结该分支输入和消费者，后续另设实现任务，不扩成其他类型批量逆向。

协作计划：
- 模式：主agent + 有界subagent。
- 模型分工：主agent冻结合同与原动态样本；Luna只读审计调用链/纯视觉与伤害边界。
- 并行工作包：主agent采样时独立核对Monster2到Stage12/Registry/party实际消费者。
- 写入 owner：主agent。
- 归并检查点：验收前。
- 方法观测：无。

输入资料：
- `docs/reverse-engineering/monster-body-attack-lifecycle-contract.md`及reference，BA-01..08；BA-08对Monster2仅静态证据。
- `docs/reverse-engineering/monster3-runtime-acceptance.md`、`monster30-runtime-acceptance.md`只供现代接缝与已完成范围参考，不能代替Monster2原事实。
- 只读`local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts/export/monster/Monster2.as`及确有调用的BaseMonster/BaseObject/BaseBullet、对应bullet与PhysicsWorld；先窄查源命名与调用点。
- 视觉symbol/原命名资源优先窄查`local-resources/regima/source/restored-swfs/`；本项不新增视觉像素完成声明。
- Stage12、MonsterRuntimeRegistrySystem/Bridge、Stage1CombatSystem、HeroPartyRuntimeBridge中的实际消费者。

输出产物：`docs/reverse-engineering/monster2-body-attack-contract.md`、对应reference行为JSON、可重复原动态probe/verifier与源变异；消费者/未证输入清单和唯一同线后续任务。

完成定义：Monster2身体回调、实际攻击对象或纯视觉对象、首次/末次检测、源hurt/dead/destroy、暂停、Tween控制与清理的六段证据链明确；可执行部分有独立原oracle和负向反证，未证空间/视觉不猜补。

验收标准：
- 按源方法区分每种攻击和doHi2纯MovieClip/Tween分支，记录当前伤害producer、引用与target归属；不得把可见效果等同伤害弹体。
- 核对身体先效果、出生/新对象下一world步、末帧处理与源死亡/显式销毁/暂停分支；20/24/30按原host步或明确计时单位采样，不把手动步进当实时时钟。
- 自然选择/CD/概率若是后续消费者必需输入则纳入有界源调用链；不能复用Monster3概率或现代奇偶猜测。
- 使用原方法/原类执行或明确标注接受服务；HP、碰撞与Tween插值未经验证时列unknown，不以sink证明真实伤害/视觉。
- 原source/hash、重复一致、关键源行为变异被实际样本拒绝；编译失败不计反证。
- 交接保留232其他10类型、Role4人偶、未迁移家族与完整公共责任；运行check:workflow与audit:problems，不修改生产玩法或原语料。

禁止范围：不实现Monster2，不扩成其他怪物/完整家族，不关闭204/all/194/VS-067或整线；不改原提取结果，不新增视觉容差。

状态更新：Ready（2026-10-04；249A/B与父249完成，按232剩余责任承接单类型有界补证）。

推荐后续任务：按本项实际输入缺口生成唯一同线Monster2空间/显示补证或实现任务；资料未verified时不得直接实现，不跨类型批量扩张。

# TASK-SETTINGS-258

任务类型：`TASK-SETTINGS`

任务模型：`逆向任务`

逆向子类型：`代码逆向`

逆向方案：不适用；沿用通用六段证据链，不新增方案。

功能条线：`LINE-PRE-STAGE-2-3-PRESENTATION`（Active）

目标机制/切片：`M-030`、`M-034`、`M-042`、`VS-067`

要解决的问题：256已闭合Monster2身体/攻击producer，257A空间与257B原Tween/必要公共坐标已完成；真实BaseBullet→英雄/宠物接收仍是服务边界，不能用命中次数、字典power或现代HP下降推导原版伤害。补齐后才判断Monster2有界实现输入是否完整。

规模预算：
- 主工作包：2（原两普攻真实接收数值/守卫；必要HP/hurt/dead/保护与双owner联合交接）
- 预计上下文压缩：0
- 独立验收批次：2（原接收入口有限矩阵；独立重放/反证与现有合同联合核销）

拆分触发：
- 接收路径发现此前未闭合且影响当前两普攻的完整成长/装备/法宝/家族技能或独立视觉输入时，冻结具体调用与输入缺口，生成同线有界补证；不扩全人物/全家族或同时实现。
- 现有真实HP owner合同不适用时先记录反证；不得用服务HP sink、现代公式或复制其他怪物伤害表绕过。

协作计划：
- 模式：主agent + 有界subagent。
- 模型分工：主agent执行原接收链与数值判断；Luna只读核对256/257合同与既有真实HP输入适用性。
- 并行工作包：只审两普攻实际被调入口、目标profile/owner、未知/反证与源码locator，主agent同时建立原生fixture。
- 写入 owner：主agent。
- 归并检查点：行为sidecar晋升与实现任务生成前。
- 方法观测：无。

待证明的可观察问题：
- 两个hit1独立SpecialEffectBullet如何从原checkAttack/getRealPower进入BaseHero/BasePet？真实攻击类型、power、防御、随机/暴击和接受/拒绝的顺序是什么？
- 同弹重复/两弹接续、无敌/保护、主人与宠物存活/ready、HP临界及致死分别怎样改变真实HP、hurt/dead、受击去重和弹体生命周期？
- 既有英雄/宠物接收owner合同是否完全适用？Monster2聚拢自身无damage producer如何在联合矩阵中保持？

有限范围、入口与fixture：
- 再续天庭1.1 Stage1-2 Monster2的两hit1普攻；20/24/30 host，P1/P2/双方，五角色共享接收及实际出战宠物profile只沿可达直接接收链采样。
- 复用256真实发射/首末检测/动作合同与257A实际命中oracle；新fixture冻结有限HP、防御、保护、随机输入及正负边界，不依据现代通过率缩域。
- 257B聚拢合同只引用，不重做Tween；hit2原始无伤害producer必须保留为负例。完整装备/宠物技能联动、其他怪物和全角色动作不在本次范围。

输入资料：
- `docs/workflow/reverse-engineering-protocol.md`、`docs/workflow/air-runtime-verification.md`。
- `docs/reverse-engineering/monster2-body-attack-contract.md`及`reference/monster2-body-attack-contract.json`。
- `docs/reverse-engineering/monster2-attack-space-contract.md`、verified `ground-truth/manifests/monster2-attack-space.json`及对应reference sidecar。
- `docs/reverse-engineering/monster2-gather-coordinate-contract.md`及对应reference sidecar。
- `tools/monster2-source/`、`tools/monster2-space/`和`tools/monster2-gather/`仅按输入适用性复用。
- 原Monster2/BaseBullet/SpecialEffectBullet/BaseObject/BaseHero/BasePet/Config/保护属性与两普攻直接依赖；既有英雄/宠物真实接收合同按实际命中入口窄查，不扫描无关家族。
- Stage12/Registry/Stage1Combat/HeroParty和当前PetSession仅作现代消费者映射，不修改src。

输出产物：`docs/reverse-engineering/monster2-reception-contract.md`、`docs/reverse-engineering/reference/monster2-reception-contract.json`（纯行为sidecar）；可重复原源fixture、独立预期、真实HP轨迹及源/运行变异；全部M2-01..09与空间/坐标责任承接矩阵、唯一后续任务。原始产物 `local-resources/regima/task-outputs/TASK-SETTINGS-258/`，报告 `docs/tasks/evidence/TASK-SETTINGS-258/`。

完成定义：两普攻真实HP/接收有限域关键未知清零，原源与独立验证一致，保留全部既有空间、自然相位和聚拢合同；基于证据决定同线有界实现或必要补证。纯行为不滥用UI Schema，新增空间/视觉事实必须另交同线视觉真值补证。

验收标准：
- 执行真实接收入口/计算与HP owner，不以回调sink或现代公式冒充原生结果；明确服务边界、源hash/locator与原ABC/运行时版本。
- 正负/临界、两弹去重/保护、P1/P2/宠物、hurt/dead及源生命周期逐项有独立预期与可复验trace；重复稳定、实际源/运行变异拒绝。
- 六段证据矩阵、现代消费映射和未知/反证完整；256M2-01..09、257空间与坐标、裸MC暂停继续/EXIT和hit2无damage producer均保留。
- 运行sidecar独立验证、`check:workflow`和`audit:problems`；Git交付精简数据/工具，游戏不依赖ignored trace。

禁止范围：不实现Monster2、不改src/public或原提取/恢复包、不扩其他怪物或全角色/家族、不更改257A精确碰撞许可，不关闭204/all/194/VS-067或整线。

状态更新：Ready（2026-10-04；257B及父257已完成，真实HP接收是唯一下一输入缺口）。

推荐后续任务：只有Monster2实现所需输入未知清零才生成同线有界实现；若命中拆分条件，先生成明确的同线补证。

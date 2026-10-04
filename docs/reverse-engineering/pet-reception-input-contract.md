# 宠物接收属性与疾风当前效果输入合同

状态：verified（TASK-SETTINGS-252，有界代码输入合同）。本页及`reference/pet-reception-input-contract.json`已通过原方法/独立预期与反证；不关闭249B或父249。

## 来源与范围

主源是`local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts/`下的`petInfo/PetInfo.as`、`base/BaseAddEffect.as`和`export/pet/PetRabbit2.as`至`PetRabbit4.as`。本项为代码逆向，不新增视觉/空间事实。原接收消费合同继续沿用251；本项补其输入生产者。

`tools/pet-reception-input-source/`保存独立预期、原方法编译执行和真实源变异入口。原始文件SHA及明确适配落在本地252证据目录。原语料未改。AIR服务与分支裁剪边界见工具README。

## 属性生产与存取

| 入口 | 两属性行为 | 来源位置 |
| --- | --- | --- |
| 构造 | miss、mDef均为0 | PetInfo:33–64 |
| 新建/捕获后setPetNameAndLevel | 不重新写两属性；高等级新捕获也保持构造值 | PetInfo:67–100、115起；User:1302、BaseHero:410 |
| petUpdate | 一次调用最多升一级；小于90才尝试；升级后调用重算 | PetInfo:1364–1416 |
| reSetPetAttributeValue | 新等级≥60时依次抽三次随机：miss增`0.01*floor(r*2)`，mDef增`0.01+0.01*floor(r*1)`，crit增`0.01+0.01*floor(r*2)` | PetInfo:1576–1589 |
| 返童 | 改等级/形态/基础属性，但保留miss、mDef | PetInfo:544–556 |
| 保存 | 管道字符串索引10为mDef，12为miss，不封顶 | PetInfo:2281–2284 |
| 读取 | mDef大于0.36才截到0.36；miss大于0.48才截到0.48；无下限截断 | PetInfo:2286–2354 |
| setter | Number写入，无增长或封顶 | PetInfo:2526–2543 |

两个值是比例，不是百分数整数。mDef随机项在合法随机区间恒为0，但该抽样仍消耗随机。成长本身没有读档上限；返童再成长及直接重算可超过上限，不能把读档封顶移入setter或成长。当前升级探针以perception=0明确排除技能学习抽样；不声称任意技能状态下一次升级只有三个随机调用。

跨完整AS3语料窄查，未发现PetInfo外的额外两属性生产者。英雄BaseRoleProperies、怪物保护字段和装备同名字段不是宠物来源。形态切换不重置两值。

## 疾风当前效果

兔2/3/4的技能门均要求已学jf且MP≥20。释放扣20MP并添加`PET_RABBIT_JIFENG`（值`jifeng`）。二阶持续`5*frameClips`，三四阶`10*frameClips`；二阶本机拥有时才face/send，三四阶face无条件、send仍受sid相等限制。

add后curDebuff立即为true；首个step才设置startTime。count从0开始时，第duration+1次step移除效果。重复添加刷新time和startTime，不叠加条目；首次step前刷新仍保留isFirst。暂停不调用step时不推进时间。destroy清空数组、重置计数并断开sourceRole；本证据不证明疾风图像的清理像素。

接收门读取当前效果，不读取已学技能或技能冷却。三四阶在二阶的5秒边界仍然有效。原消耗和网络服务不是现代所有权实现的替代证据。

## 现代缺口与接入边界

现代PetTypes.PetState缺少两持久字段。SaveSystem.encodePet保留其余字段，但decodePet未恢复这两个字段；249B实际P1/P2恢复preflight已证明假设显式字段也会丢失。PetProgression/Growth及Session最终映射还需归并成后继有界合同。

旧现代存档没有历史随机，不能根据等级逆推miss，也不能把缺失写成“原值0”。0.36/0.48是原读档上限，不是迁移默认值。必须区分已知新宠初值、明确保存值和旧档未知值；现代迁移决定单列，不能篡改原真值。本项不清空或重置用户存档。

现代兔效果并非只有冷却：`PetRabbitSkillSystem.ts:53`已经写入`rabbit2Jf.activeRemainingMs/attackRate/dodgeBonusRate`，`:132`按deltaMs推进；`PetTuning.ts:153`所有形态共用10000ms，二阶与原5秒不符。LSP引用定位目前由`TestSceneAdvancedPetSkillBridge.ts:33`推进。`PetCombatEntitySession.ts:401`的原版接收端口仍依赖外部显式输入，没有从该状态读取。后继应复用当前效果状态/owner，补原帧边界、暂停/清理及两owner调用，不另造第二效果状态，也不得用cooldownMs代替active。

`PetProgressionSystem.ts:38`一次经验添加可循环升多级，`:102`按等级重建基础HP/MP/ATK/DEF，没有两属性增量。后继必须按每个实际升级事件累计两值，普通refresh不重复抽样。`PetGrowthSystem.ts:63`返童改基础属性并重建瞬态技能状态，未来两持久字段须保留；不借本项改造完整成长节奏。

当前424项原生属性用例覆盖13个原家族的高低等级创建、受控重算/升级、59到90连续升级、返童再升60、重复初始化、存取封顶和异常字段。空数字字段转换为0；非数字字段进入NaN；截断至缺属性/技能字段时，原加载中途留下NaN并抛1009，不能当作有效现代迁移行为。读档探针固定isFirst=false；首次启动对满级level的回退不属于两个接收属性的迁移政策。162条疾风时间线共35996态通过，13个原生源变异被独立行为预期拒绝，含把当前效果查询换成实际skillCD1的反例。CD由原countSkillCD推进，但测试不冒充完整AI技能启动调度。修正家族名称和AIR同application id并发冲突后全套重新通过；这些探针修复不算生产代码修复。

## 后继有限接入合同与迁移选择

后继只增加PetInfo对应的两个持久比例字段、来源标记及疾风接收映射。新种子/捕获明确初始化0；逐级增长消费既有随机源，保留mDef的无数值作用抽样及crit占位的顺序，不因普通统计刷新/读档/进化重复增长。返童保留两值。显式保存值按原上限读取，非法数字作为现代无效数据处理，不复制原NaN/半加载异常。P1/P2分别恢复、分别映射到249A端口。

疾风复用`rabbit2Jf`现有当前效果状态；二阶5秒、三四阶10秒，对20/24/30fps按原step序列验边界。技能门/CD继续独立。只读视图不推进效果；暂停、休战、替换宠物、返童/进化重建、场景销毁/重入各由已有owner清理一次。正式Scene联合与原视觉仍交249B，不扩大为兔完整AI重写。

旧现代档缺字段没有唯一正确的原版恢复值，候选政策如下，尚未批准/实施：

1. **推荐：兼容基线**。只对缺失字段设现代运算基线0，并持久标记`legacy-missing-baseline`，明确历史原值未知；此后真实成长增量在该基线上累计。保留旧存档原始备份，不清空等级、装备、技能、寿命或其他属性；再次读档不重复迁移。显式有效字段保持其值/原读档上限。此决定不能标成“恢复原版历史属性”。
2. **严格保留未知**。缺失字段保持未知，不进入要求确切接收属性的宠物战斗，直到用户提供值或选择迁移政策；其他存档数据保留。

本项只提供原始事实、信息损失证据与可审核政策；后继实施须获得所选政策后才写旧档迁移逻辑。新宠已知字段和无关的两Scene接入准备不依赖这项选择。

## 验收交付与剩余责任

`python tools/pet-reception-input-source/check.py`验证源SHA、工具/fixture/编译SWF/运行日志/完整输出绑定及行为预期，重新检查每个实际变异输出确实不符原预期。`--freeze`在全量证据成立后发布精简reference；报告状态/覆盖/Scene声明/缺文件/错误哈希五类破坏均拒绝。完整35996态本地保存，Git中的178KB reference携带424属性case及1134个生命周期边界见证，不把边界数当完整原观察数。

两属性/疾风生产到接收的来源链、单位、随机、存取、片段边界与未知已交付。跨族创建覆盖13个PetInfo家族；形态相关效果覆盖兔2/3/4，其他家族AI/视觉不在本项。Luna独立只读复核已归并，主agent补足CD替代的真实源变异。

后继`TASK-SLICE-253`实现正式字段/存取及现有效果owner映射，旧档政策等待用户选择；它是现代实现决定，不是原版证据未知。253完成后恢复249B两Scene全部实际接入、生命周期和视觉验收，不由252交付代替。

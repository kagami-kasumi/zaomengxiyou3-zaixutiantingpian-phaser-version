# Monster3 目标接收与 HP 合同

`TASK-SETTINGS-251`。当前 **verified-bounded-behavior（有限接收域）**；验收结果以 `reference/monster3-reception-contract.json` 和本地 `docs/tasks/evidence/TASK-SETTINGS-251/verification.json` 为准。此合同补齐249的接收输入，不是现代生产实现或完整原版 Scene 重放。

## 六段证据链

源码根：`local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts/`。机器 reference 的 `sources` 保存逐文件 SHA、方法 SHA 和行号；`inputs/expected` 为同序字段表，预期由独立 Python oracle 计算，不导入现代实现或生成的 AS3。

| 合同 | 局部源 → 共享调用 | 原版可观察事实 | 现代消费与反证 |
| --- | --- | --- | --- |
| M3R-01 来源参数 | Monster3 构造 → BaseMonster.getRealPower/Hit/ReduceMagicDef | hit1=40物理、hit2=18魔法；每次 getRealPower 都消费随机，包括 `param2=false`；暴击使用≤；魔花乘0.925。Boss普通Hit=基础+6；魔花/魔旗状态下getter会写回基础/2+3，普通怪写回基础/2 | 两owner消费相同来源参数；wrong-hit/wrong-critical/random-order拒绝。自然选择/added仍复用250 |
| M3R-02 接收门 | BaseBullet.checkAttack → BaseHero/BasePet.beMagicAttack | 几何或保护拒绝返回false，不登记ID。英雄闪避≤(miss−Hit)/100；宠物普通闪避严格<miss−Hit/100；兔疾风先抽一次，随后仍抽普通闪避。闪避返回true且不掉HP | 249必须区分拒绝、闪避接受、HP命中；dodge-reject/protection-register/threshold拒绝 |
| M3R-03 伤害与HP | getRealPower → countHurt → 五Role/35Pet reduceHp → BaseRoleProperies/PetInfo真实写入 | 物理最少1；英雄魔防≥100%伤害1，负魔防最多1.1倍；宠物魔防=1伤害0，>1会归零魔防。英雄普通命中3次随机（闪避、未使用随机、伤害）；宠物也是3次（闪避、伤害、非暴击比较），顺序不同 | 处理后的属性作为明确输入；不能沿用现代固定18/40或只核对事件。ignore-magic/random-order拒绝 |
| M3R-04 覆写及结算 | Role1..5/BaseHero.reduceHp → 原盾方法/玄龟 → 原HP方法；各Pet覆写 → BasePet.reduceHp | Role3 sd最高8级，GXP减0.125；Role5 hit10_1减25%；凤凰hit2除3。盾溢出会再次调用动态reduceHp，因此适用减伤可再次生效。玄龟宠物ceil(5%)、英雄先int(95%)，单侧buff不转移；死亡、hurt、猴马skillRelease、qlfj随机保留 | 既有HeroCombatSystem/settleHeroHpDamage/PetBattleOwnershipSystem继续唯一结算；249对照接收合同适配，不能新增第二HP owner |
| M3R-05 ID与检测顺序 | BaseBullet.setRole/setAction/checkAttack/newAttackId | source构造→setAction先3次随机；英雄后其宠物。普通英雄方法登记一次，bullet再登记一次；普通宠物仅bullet登记。英雄接受后刷新来源多3次随机，宠物无刷新。保护/几何拒绝后同ID重试；接受后直到新ID再检测；999/4分别在第1000/5次检测换ID | hit2间隔与遗漏宠物源变异拒绝；64世界序列同时核对HP/ID/max/count/随机/Hit/保护，不只看最终HP |
| M3R-06 难度2/字节码 | BaseBullet.setBingoRate(100) → 原receiver Bingo分支 → 原HP/保护 | 每次check额外抽随机；英雄扣最大HP×99后true并保护30帧。宠物扣最大HP×99后原AVM2 `returnvoid`，Boolean调用方得到false；已死亡宠物设置150帧保护、lifetime−1，bullet不因该次结果登记ID | 原提取源码的裸return不能直接编译；只对生成SWF恢复两个原returnvoid，并重导出核验。绝不能把编译用临时return false说成原代码 |

几何/显示段仅消费248已有碰撞布尔与247相位。本项不新增显示列表、坐标或颜色事实；行为sidecar不使用UI Schema。当前原生是AIR 51.1.1.5，编译器为现有AIR SDK51.3.4，不是当年Flash Player实测。

## 冻结输入与服务边界

- 40种身份（五英雄、35宠物）×P1/P2×普通/Boss×两攻击×53场景，共16,960例。完整输入在reference `inputs`；包括拒绝、致死、闪避等号两侧、魔防临界、非零Hit、暴击等号、混合随机、兔疾风、Role3 sd8/9、GXP、Role5/凤凰动作、hmz/lys保护、三盾及溢出、链接与qlfj。Mouse2/3通过Mouse1继承原reduceHp，未假定直接继承BasePet。
- 64世界序列（初始来源ID=1、弹体name=`attack-`）：P1/P2×两构造×两攻击×8场景；hit1运行1001次check，hit2运行7次，冻结首三/末三状态；包含正常、拒绝重试、闪避、难度1/2、魔花连续Hit写回及混合随机顺序。P1/P2在单机输入下分别验证，正式同场双人旅程留给249。
- 真正执行原接收、countHurt、HP写入、受击、死亡、盾吸收和转移方法；目标处理后的miss/defense/magicDefense、技能sd、qlfj概率为显式状态输入，不宣称完成全装备/属性构造逆向。Monster3的added不改变本项Hit/Critical/两攻击power；难度初始化的完整合同继续引用250。
- `Config`玩家数组、当前时钟1000ms/上次−1000ms、受控随机及几何布尔为输入服务。世界序列保留原循环；显式释放预先保护及难度2保留保护不等于完整保护倒计时重放。原`setYourFather`执行，显示与Tween为无输出服务。`updateFather`仅周期buff计数，本域不放入周期father效果。
- 全装备复活、多人同步、rj回血、完整家族AI与技能构造不在当前接收冻结域。相关原分支保留，输入明确为空；249不得据此宣称这些功能已复现。Role3 hit12对来源的反伤调用保留为外部请求服务，当前只验证目标接收HP，不验证怪物被反伤后的HP/AI。反伤后的独立弹体生命周期仍按247/249原合同处理。
- Knockback投影、damage-number显示、场景移除、完整对象构造为外围服务，不从其sink产生HP expected。源/目标HP不能互相冒充；实际目标HP来自原BaseRoleProperies/PetInfo方法。

## 复跑与反证

1. `python tools/monster3-reception-source/mutations.py`：正常源、重复源、九类真实AS3变异分别编译运行。已有局部中断可用`--resume`恢复；最终核验仍检查原始数据。
2. `python tools/monster3-reception-source/finalize.py --write-reference`：全部正常观察、重复、源SHA和变异通过后才写verified reference。
3. `python tools/monster3-reception-source/finalize.py`：只回读核对reference；六类报告损坏及四类reference字段损坏另计，不作为源码变异。

原始SWF、AS3不修改。编译先暂用false占位，`restore_returnvoid.py`从原SWF精确导出BasePet pcode，确认两处returnvoid；生成SWF中仅等长替换对应debugline后的pushfalse/returnvalue为nop/returnvoid，重导出检查。原/生成字节码SHA、完整命令、日志及证明保存在本地 `local-resources/regima/task-outputs/TASK-SETTINGS-251/<variant>/`；汇总在 `docs/tasks/evidence/TASK-SETTINGS-251/`。

工具开发期间出现过默认GBK读取源文件、变异定位字符串不匹配和阶段变量遮蔽输出标签，均属探针失败，未计为变异通过；修复后以最终命令和verification为准。未知/未冻结范围在上文保留，不将有限域扩成全战斗合同。

## 249消费交接

| 消费者 | 必须接入/保留 |
| --- | --- |
| Monster3System/TestSceneBossArena；Stage13GameplayBridge/Stage1CombatSystem | 共用247/248/250/251输入；真实接收后才决定ID和max，保护拒绝不得先resolveHitOnce；攻击体不得读取死源当前action替代自身action |
| HeroCombatSystem/settleHeroHpDamage | 目标属性、保护、闪避、魔防和有序随机明确接入；既有HP/盾/减伤/转移owner保持。接收结果须表达“接受但不扣HP”，不能只传damage amount |
| HeroPartyRuntimeBridge/PetBattleOwnershipSystem/PetCombatEntitySession及兼容宠物入口 | 同owner宠物在英雄后处理，原宠物miss/魔防/兔疾风/返回值及死亡反应均有独立预期；玄龟转移继续已有权威owner |
| 生产测试/正式旅程 | 消费reference独立expected；实际HP/ID/随机/保护核对与生产变异，之后再完成249的140880碰撞case、30状态显示、源死留弹、退出重试及双场景双人旅程 |

运行时必需数据将由249放进正式源码/资源；本项reference用于合同/测试，游戏启动不依赖ignored证据。251完成不关闭249、204/all、194、VS-067或整线。

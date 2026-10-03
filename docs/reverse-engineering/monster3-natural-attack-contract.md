# Monster3 自然攻击选择与 CD 合同

`TASK-SETTINGS-250`。当前 **verified-bounded-behavior（有限冻结域）**；仅补249缺失的自然选择输入，247身体/独立攻击与248空间结论保持。产物为 `reference/monster3-natural-attack-contract.json`，合同ID `task-settings-250.monster3-natural-attack`。未改现代游戏实现。

## 六段证据链

源码根为 `local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts/`；精确文件与方法SHA、locator由机器reference `/sources`保存。

| 合同 | 局部/共享源链 | 可观察事实及证据等级 | 现代消费与反证 |
| --- | --- | --- | --- |
| M3N-01 初始化 | `Monster3.as:11..102`构造；`BaseMonster.as:148..261` __added | 实际构造与added方法执行，普通/Boss及difficulty0/1/2；CD1保留2fps/4fps；普通攻击率分别为普通0.366/Boss0.423、难度1均0.85、难度2均0.89。交叉确认于冻结域 | 两owner不可沿用统一0.42；normal-rate变异必须拒绝。该概率不是所有模式通用值 |
| M3N-02 世界顺序 | `BaseObject.step`→`BaseMonster.step:305..367`→`addcount/IntelligenceTime/countCD` | 身体先运行，count增加，再选择，最后减CD。CD1从1到0的当步仍不能走零CD技能；新释放hit2当步回填4fps后减成4fps−1。交叉确认 | cd-first拒绝；247出生与检测相位保持 |
| M3N-03 状态门槛 | `Monster3.myIntelligence:295`、`BaseMonster.myIntelligence:532/hasAttackTarget:564`、`BaseObject.isAttacking/isBeAttacking:1046/1051` | hit1/2/3、hurt系列阻断选择但不阻断CD；死亡跳过AI，ready对象被世界移除；冻结阻断AI，注入效果阶段解冻后本步AI可继续。交叉确认 | busy-cd拒绝；冻结服务合并四谓词，不证明逐类持续时间或优先级 |
| M3N-04 自然技能 | `Monster3.beforeSkill1Start:260/releSkill1:265`、`AUtils.GetDisBetweenTwoObj:316`、`BaseMonster.hasAttackTarget:572` | 技能1先于普攻；两点欧氏距离严格<200、CD=0；新ID→hit2→lastHit，**不会自动朝目标转向**。交叉确认 | horizontal/inclusive/normal-first/skill-facing拒绝；199/200/201与纵差分别有例 |
| M3N-05 普攻与随机 | `BaseMonster.hasAttackTarget:570..639/attackTarget:642/faceToTarget:1902` | 可决策调用先消耗一次未使用的ceil(random*4)；count%fps=0才按水平≤150及第二次随机≤rate决定hit1；hit1新ID并朝目标，相同x朝左。交叉确认 | random-consumption/alternating拒绝；Stage13奇偶显示不是行为输入 |
| M3N-06 目标接缝 | 原`Config.getPlayerArray/AUtils.GetNearestObj/BaseMonster.selectTarget`与239同源；step尾清理 | 无目标先normalWalk再selectTarget，不在同次选择攻击；dead目标当步清除不重选；ready目标可在AI阶段被消费，随后尾清理。交叉确认 | 复用239候选排序/警戒域；本批两目标等坐标，不扩大239全集。normalWalk平台为null，不宣称随机巡逻/寻路复现 |
| M3N-07 自然动作到身体 | 本次实际attackTarget/releSkill1→247源Monster3/BBDC方法→恢复`assets/1.swf`两攻击 | 自然选择后hit1第7个身体步、hit2第6个身体步出生；同父偏移/方向、下一world步首帧检测。受控帧输入与247真实ENTER/EXIT相位分开保留 | natural/normal/pause长轨迹核对出生、重入与首次检测；不重采248像素 |

几何/视觉段只消费248 `task-settings-248.monster3-attack-collision`及247 `/nativePhase`，本次不新增显示列表事实。固定根(300,200)与目标差仅为决策输入，不能推导任意地图路径、墙体或碰撞；纯数值/选择sidecar不使用UI Schema。

## 执行范围与验证

入口：`python tools/monster3-selection-source/capture.py`、`python tools/monster3-selection-source/verify.py --mutations`、`python tools/monster3-selection-source/verify.py --write-reference --check-reference`。

3fps×2构造×2方向×3owner，每组25普通场景及3难度×8概率边界，共1,764组。自然、纯普攻与暂停轨迹运行8秒，其余每组4步；总27,936态。实际源算法只将Math.random替换为受控输入，首随机0.97、第二随机按fixture，记录每次消费。计数/CD/target的身体前后不变性、逐步连续性及全部决策由独立Python oracle核对，不导入生成器或现代system。

源对象观察与独立预期区分：`body`为身体后/AI前的原方法观察边界，用于条件决策核对；不将该观察自身作为已证明的完整身体oracle。自然出生另按选择tick、247的7/6步合同核对；恢复clip首帧由受控输入驱动，真实原生时钟结论继续引用247已有135检测相位。

最终验收：1764组27936态、1644次决策、744自然发射通过；九类真实AS3编译源变异全部成功运行并改变观察后被拒，正常源重复rows完全一致。六类报告损坏和四类reference损坏另计，全部拒绝，不充当源变异。reference约1MiB，直接由独立oracle生成预期，已通过完整性回读，不依赖现代system。补强fixture初态/几何、解冻当步技能及目标搜索调用序后，九变异与正常重复全部重新运行。所有原始日志和汇总在本地 `docs/tasks/evidence/TASK-SETTINGS-250/`、`local-resources/regima/task-outputs/TASK-SETTINGS-250/`。

## 明确边界与消费者

- 编译使用现有AIR SDK51.3.4，运行使用游戏解包AIR51.1.1.5；不是当年Flash Player实测。
- 原Monster3构造/added与决策原方法真实执行，但BaseObject/Monster的外围初始化是明确服务壳；固定非飞行、rehp=0、回调/效果连接由fixture设置。未覆盖特殊模式、Boss受击条反击、完整物理/寻路/奖励/HP防御闪避。
- 移动末端只记录转向/walk状态，根位置保持固定；无目标normalWalk的standInObj=null。不能从此宣称完整巡逻或自然关卡旅程。
- 冻结使用合并阻断服务，身体停/续用原Horse ice方法，效果到期在第二步注入；不证明四类效果本身的数值/持续时间。暂停为已证世界不步进边界，正式菜单/子树暂停仍归249。
- 目标承伤是247接受服务，真实英雄/宠物HP、保护/闪避/去重仍由249结算验收；受控hit1/hit2忙态只用于门槛检查，自然两攻击轨迹没有手动setAction。
- TestScene Boss的Monster3System与Stage13的Stage1CombatSystem必须共同消费选择/CD与动作身份；Stage13MonsterVisualBridge只能投影真实动作，不能继续按serial奇偶猜测。独立攻击、140880命中、30显示态、135相位、两owner正式旅程及全部249原合同保持。

Luna三轮只读审查已归并：补显式stage输入、不同首/次随机，保留冻结合并、ready目标两阶段和移动服务边界；没有将239扩成完整AI，也没有将247直接指定动作当自然选择证明。

## 收尾与交接

250已完成，恢复249唯一Ready；功能线仍Active。`check:structure`退出0（8项既有warning），`check:workflow`与`audit:problems`的收尾结果记录在250历史定义。原生首次写报告遇app路径SecurityError已保留失败并改本地路径后重跑；Python LSP未安装，使用实际Python/verifier及AIR编译执行，未安装软件。完整Scene/HP/显示仍未执行，不据此关闭249、204/all/194/VS-067或整线。

本地250原始trace、编译fixture和基准供249消费/复验，暂不清理；249完成后按产物生命周期评估。可提交工具、本文及精简reference；原级复验仍需本地语料/AIR，游戏运行不得依赖ignored evidence。

最终版本复核：Luna末轮关于random仍返回同值的疑点与当前源码不符；capture.py:98已使用首值0.97/次值roll，baseline的harnessSha256与当前文件一致，实际首态记录[0.97]。该过期结论退回，不以代理意见覆盖当前源码证据。工作流归档推荐旧链接校验失败后已刷新，通过；完整失败日志保留。

# 宠物接收输入正式接入验收

状态：TASK-SLICE-253 Done（2026-10-03）。用户在本对话明确回复“A”，批准兼容基线政策；全部本项输入owner合同通过。249B恢复Ready，父249及两Scene联合接入仍未完成。

## 持久字段与成长

PetState组合PetReceptionAttributes，保存missRate、magicDefenseRate及来源。新种子/捕获（含高等级）从同一factory创建已知0，P1/P2独立。每个真实升级事件在新等级≥60时消费原三个随机并累计两值；第三次crit抽样不误写现代critBonusRate，mDef恒零随机项仍消费。经验石复用random；普通refresh/读档/进化不重复成长，返童保留值。成长不封顶，读取显式字段才按原miss≤0.48/mDef≤0.36截上限，负值保留。

252的124捕获/12存取预期、268成长预期、连续59→90、返童后再升级、P1/P2真实道具/保存路径通过。14持久/成长生产变异拒绝，未改252独立expected或源语料。

## 用户选择A与正式存储迁移

裁决来源：2026-10-03用户直接回复“A”；不是把推荐项或持续/goal当批准。只在现有支持的save schema中为缺失/非法非有限字段补现代运算基线0；历史随机总值仍未知。显式有限值不被迁移覆盖，其他存档字段保留。

PetReceptionSaveMigration由SaveSystem.loadGame/saveGame调用；selectSaveSlot先加载迁移成功，再设置active slot。inspect/list保持只读。纯parse/restore仍不回填缺项，不在无原始存储上下文时伪造备份。已有版本拒绝规则保持，非有效存档不迁移。

迁移前原始raw字符串按字节备份到`<storageKey>.pet-reception-baseline-v1.backup`。相同raw复用；槽删除再创建或原内容不同则递增`.1/.2`，不覆盖已有备份。备份写入后读回核实，成功后才写主key。备份失败不覆写原档、不切active slot；主写失败保留原档和备份，重试不重复备份。saveGame也覆盖“只inspect后直接save”的路径。

来源持久标记为`legacy-missing-baseline`，`receptionBaselineFields`记录具体补过的字段。后续升级增量在基线上累计，读档、保存、返童、进化均保留来源与字段列表，不晋升为已恢复历史原值，也不再次清零。

真实load/select/save/default key及slot0/5、双owner、完整原raw/未知扩展字段、备份/主写失败重试、槽复用、非法值、显式值免迁移、来源和成长保留通过。9个迁移生产变异被AssertionError拒绝；首轮“跳过save迁移”由测试直接访问空备份产生TypeError，补显式备份存在断言后重跑全9项，不把异常启动当行为验收。

## 当前效果、接收与生命周期

复用rabbit2Jf状态，以remainingHostTicks/pendingHostTicks/refreshPending推进，毫秒值仅为既有消费者投影。二阶5秒、三四阶10秒；每次刷新后下一step elapsed=0，D+1步失效。162原时间线/1134边界和20/24/30fps分段delta通过。接收读取当前active，不由技能拥有或CD代替，不在接收时推进时钟。

receiveCurrentOwnedPetMonsterDamage与PetCombatRuntime.currentMonsterReceptionTarget复用原算法和唯一HP owner。真实双owner读取、捕获target后升级即时生效、兔疾风/失效接收通过。保留低层显式输入端口用于251固定fixture。已销毁target先核定destroyed/released/entity identity，不读取失效属性或counter callback、不写HP；受保护/死亡Session先拒绝。兼容世界target在249B仍须绑定实际owner/runtime及action/protected/gxp，不能缓存旧对象继续命中。

休战/换宠/释放清理，返童/进化重建状态；owner死亡、Session释放、TestScene退出、Party退出、reset均使用同一清理规则。实际TestScene二/三/四阶×20/24/30fps九组双owner验证单次推进、暂停、各主人死亡恢复、stop/start重入。另测帧间换roster后立即退出，分别清理Scene新对象与Party旧对象。9输入/时钟变异及3浏览器生产变异拒绝，恢复正常源码/编译后通过。

浏览器首轮重入缺devParty导致转存档页，改用正式createFormalPartyRetryData后通过；scene-exit变异首次被每帧同步后另一清理入口掩盖，增加帧间换roster反例后拒绝；party-exit后缀误匹配造成编译失败，改精确basename后重跑。失败日志保留，不计通过。此浏览器结果只证明本项生命周期，不证明完整兔AI/原生视觉或249B两Scene攻击旅程。

## 最终检查与交接

- 16组相关回归通过：system、迁移、两属性组、疾风/current-input、Monster3碰撞/选择/相位/销毁/576接收Session、formal-pet/五关宠物页旅程、party/schema/双owner保存。
- Monster3保持140880碰撞/42906767像素与精确451许可残差、27936决策/21312连续态、540世界态/135检测phase；不据此宣称Scene已接入。24猴马和20龟生命周期另已回归。
- 14属性成长+9输入时钟+9迁移生产变异恢复后通过；3浏览器生命周期变异及9组正常基线通过。
- LSP无error；源文件恢复后的独立build通过。首次build与磁盘变异并发读取到半写文件而失败，保留日志，不计通过；随后串行重跑成功。
- workflow/structure/audit完成于归档收尾；保留8项既有结构warning、PlayerSlot别名warning和bundle大小提示。

本地报告位于`docs/tasks/evidence/TASK-SLICE-253/`（migration.json、migration-mutations、jifeng-mutations、browser及属性报告）；最终命令日志`.tmp/pet-input-253-final-regression.log`、`.tmp/pet-input-253-migration-build-restored.log`与收尾门禁日志。运行不依赖ignored evidence。原249B输入预检保留历史观察，不覆写为成功。

下一执行项TASK-SLICE-249B：两个真实Scene攻击/HP/显示/暂停/死亡保留/退出重试全合同继续，父249/204/all/194/VS-067及整线不关闭。用户原goal范围不缩减。未执行commit/push，继续当前对话。

# 兼容宠物受击身体运行验收

状态：255完成。兼容19形态实际HP接收/身体/保护/清理、两Scene受控双owner与416态显示合同通过；249B恢复原完整自然旅程与联合验收，父任务和整线不关闭。

## 已验证的生产组件（2026-10-04）

`tools/generate-pet-reception-body.mjs`从254 verified行为JSON生成`src/assets/pet-reception-body.json`，冻结19形态selectedOwner、cell、各行counts/holds、hurt/dead条件行、Phoenix hit2守卫和有界清理信号。生成器拒绝未支持的行守卫/结束分支，并保存正式源JSON hash；`--check`通过。游戏无需读取本地trace或8MB完整证据JSON。

`PetReceptionBodyClock`组合既有`PetAnimationClock`，没有第二套HP或技能owner。共享游标新增按当前列选择keyframe上限、setColumn只重载该格持帧而保留key、显式completion清key；既有家族默认行为不变。条件路由保留Phoenix x0原行与hit2拒绝hurt；dead恢复暂停，hurt结束setStatic/wait，dead发送销毁信号。类当前只推进hurt/dead，非受击动作仅是已观测进入游标；不声称实现闲置、普攻或技能；实际销毁由PetReceptionBodyOwner接收完成信号。

`pet-reception-body-clock-tests.ts`直接读取254正式原生trace，对比2910进入/结束、228暂停、114重复接收的45,675状态：action/state、row/column、hold/key、dead/setStatic/Phoenix清理回调。HP、保护与真实清理不包含在这个时钟比较中，另由下述owner测试覆盖。

7个隔离生产变异（列上限、持帧递减、Phoenix进入条件、重复hurt清key、忽略pause、dead不恢复、漏setStatic）均编译成功后被原trace断言拒绝；源文件不被变异工具改写。报告位于`.tmp/pet-reception-body-clock-mutations/report.json`。猴/马动画、青龙1时钟、公共动画会话回归通过，TypeScript检查通过。

`tools/export-pet-reception-body.py`从254 verified视觉基准裁出416个完整原生格，保存正式`public/assets/pets/reception-body/`及`src/assets/pet-reception-body-display.json`；每个原PNG hash、格像素、注册位置和双方向记录可复验，`--check`通过。`PetReceptionBodyAssets`查询已烘焙方向，不二次翻转；新`pet-reception-body` bundle通过资产目录/协调器测试，已作为combat-common依赖预载，原生hurt/dead通过现有PetView即时投影；非受击占位显示仍属既有兼容实现，不声明完整家族原生化。

## 当前接线合同

- 兼容当前HP写入已有`PetBattleOwnershipSystem.receiveCurrentOwnedPetMonsterDamage`，不能另建PetState镜像或重复扣血。
- TestScene复用updateOwnedPetSystem，正式关卡通过HeroPartyCompatibilityPets调用同一入口；HeroPartyMonster3Reception保留Session优先，再读取当前兼容owner，按实际runtime/roster对象身份拒绝旧目标。
- 原保护是body推进之后的host步倒计时；count0仍保护，下一步撤销。Scene暂停不推进世界，单独BBDC暂停不停止保护。
- 受击返回reaction必须区分miss/accepted/returnVoid、已有hurt重复、Phoenix hit2、致死和反击分支；不把全部结果强制映射成hurt。
- 换宠、owner死亡、退出/重进必须使旧target及身体/附属失效；原生dead结束时清理需要接真实owner，不能继续使用测试回调代替。
- 已完成：两Scene三档实际世界推进矩阵、显示生产反证、暂停/退出重进与相关工程回归。反击hit1仅保留接收入口元数据和可选攻击owner交接，当前兼容层无完整反击攻击执行；不能宣称255实现家族普攻/技能。Monster30既有独立兼容伤害路径也不作为本次Monster3接收覆盖。

收尾检查：`npm run build`通过（494模块，保留既有大chunk警告）；check:workflow、check:structure与audit:problems通过，结构仍为8项无关旧warning。416运行PNG及两个生成运行JSON均不被Git忽略，未执行commit/push。独立只读复核未发现新增时钟语义错误；它不代替实际owner与Scene验收。

255已归档，249B恢复唯一Ready。249/整线范围不变。

## 实际owner与投影增量（2026-10-04）

PetReceptionBodyOwner调用既有PetBattleOwnershipSystem单次写入实际PetState；1644原生接收状态、24凤凰守卫与三档完整保护倒计时通过。PetReceptionCompatibilitySystem按已有experienceSource对象身份退休自身投射物并断开source；不会因双方同petId/runtimeKey清理另一方。投射物实际运动/删除仍归既有world更新，当前测试明确区分过期标记和world移除。

pet-reception-compatibility-tests覆盖57个原生死亡截止帧组合、双方同名实际roster、正式party的兼容目标适配与碰撞，以及共享更新入口的最后寿命/剩余寿命、保持退场、显式HP恢复后新runtime和主人死亡释放。首帧显示回调同步发生。7个owner生产变异均成功编译后被行为断言拒绝；第一次double-hp变异只跑致死clamp样本会存活，已改由包含非致死原trace的owner测试拒绝，未把存活报告算通过。

两个真实加载Scene中分别调用生产PetView，416态各采黑白两底，共1664捕获；独立254 AIR完整基准逐像素合成对账通过，最大可见RGB差0.498039/255。允许1/255颜色舍入沿用用户长期授权；注册点、原点、scale与双方向不重复翻转通过。工具为pet-reception-visual-probe.ts、verify-pet-reception-visual.py，证据位于docs/tasks/evidence/TASK-SLICE-255/visual/。这是受控游标显示验收，不替代自然战斗到达证据。

构建通过499模块，保留既有大chunk警告。TypeScript通过；结构仍8项旧warning。HeroPartyRuntimeBridge本次只增加兼容适配调用/读口，规则与显示已放独立组件，因此保留其现有import数量warning作窄接线，不进行无关整桥重构。TestScenePetMagicBridge及AdvancedPetSkillBridge改为精确系统导入，使实际共享更新入口可直接在Node测试，不由广域barrel拉入Phaser。

## 最终有限合同验收

TestScene/Stage13Scene ×20/24/30fps各19形态，共114组合：实际当前PetState受非致死hurt、重复hurt保留key，实际Scene暂停两步不推进身体/保护；双方先后由正式Monster3目标端口致死，228次死亡截止帧与254原trace一致，最后寿命为0。每次指定接收瞬间另一owner HP不变；随后真实世界推进允许其他怪物正常伤害，未把所有HP变化归因给当前攻击。每档再恢复两个活owner并真实restart，旧目标拒绝接收且不读取counter，旧HP不变、body已released。受控放置仅验证正式接线，不宣称自然到达或完整家族AI。

6份browser矩阵及6份exit报告位于docs/tasks/evidence/TASK-SLICE-255/browser/。显示变异direction/registration均编译并实际捕获后被独立原生像素拒绝；报告位于visual/mutations/，源文件未被改写。时钟7、owner7、显示2共16项生产反证通过。

最终9组相关系统回归、运行输入再生成检查、416正式PNG hash/像素检查、TypeScript/build通过；结构8既有warning，workflow通过且保留既有治理日期/PlayerSlot提示，活跃8个PG已按触发合同记录。独立复核确认死亡后保持released；其初次“自动alive”疑点已撤回。无commit/push。运行不依赖ignored证据，正式PNG/索引随Git交付；现代采样暂供249B联合复验，本次前置完成不删除父任务仍用的证据。

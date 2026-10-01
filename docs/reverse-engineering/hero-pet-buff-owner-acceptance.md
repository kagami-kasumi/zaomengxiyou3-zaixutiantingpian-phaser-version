# 242A 主人当前属性与宿主相位验收

范围：仅完成四项已加入主人效果的公共接缝；宠物回复、六项自动检查、资源与特效由242B及后续任务承担。父242、原84、204/all、194和VS-067保持未闭合。

## 原版输入与边界

- 独立expected来自 `reference/pet-passive-auto-buff-contract.json` 的12条effects及refresh/expiry；对应源locator、捕获入口及替身边界见 `pet-passive-auto-buff-contract.md`。不修改235真值。
- BaseAddEffect先处理首次/到期，再增加count；BaseRoleProperies消费更新后的count。timeLeft=0时扣回属性，下一效果step才置null。同名刷新保留value与首次标志。
- AS3 int分别用于当前HP/MP及上限：以旧当前值/旧上限算浮点比例，再分别截断；不是先截断上限再乘比例。form1依次为 `[333,77,1000,200,101,39]`、`[406,161,1220,420,119,54]`、`[332,76,999,199,100,38]`。
- 源235未包含增益期间成长/换装备重算的组合。本批只验证未加效果的基础输入及受控已加入效果，不猜测该组合原版语义。242B遇到该组合须按合同补证。

## 生产归属与后续接入

- `Stage1CombatPlayer.petBuffs`拥有瞬时状态；`HeroPetBuffSystem.addHeroPetBuff(player, name, value, time)`为四项主人效果入口，`stepPetBuffs`为世界host入口。状态不挂PetState，也不进入存档producer。
- `PetCombatRuntime`原有slot调度接收ownerStep，使用同一host accumulator先推进主人效果/属性，再推进主宠及private实体；EntitySession在此路径消费显式hostTicks，旁路自身累积。没有活跃宠物也推进主人，delta=0不推进。
- 五关复用 `HeroPartyRuntimeBridge.updatePets`；不复制逐关效果算法。单独Session测试未提交ownerStep时保留既有入口。
- TestScene兼容 `currentStats`是成员effectiveStats的实时getter，`baseStats`仅作成长/装备基础输入；更新基础计算结果通过updateCurrentStats写回成员。`HeroCurrentStats`的baseStats fallback仅兼容未迁移的独立旧fixture，正式party提供currentStats。
- 五角色技能、世界技能、法宝source与承伤防御读取currentStats；正式Stage1Combat消费者及现有HUD沿用同一combat/skill/effectiveStats。MP上限变化同步既有skill与镜像字段。
- 更换/休息/释放宠物保留主人效果。HeroCombat实际死亡及reset、HeroParty退出清理主人效果；清理不会复活死亡主人。

## 验证入口与证据解释

- `tools/hero-pet-buff-tests.ts`：12原effects跨20/24/30fps逐指定行对账；refresh/expiry；5角色×P1/P2实际技能发射伤害；P1/P2真实Monster30碰撞/防御扣血；五关共同生产closure的暂停、分帧、批量tick与退出；实际Session观察主人先于宠物及休息/替换保留。
- 承伤fixture消费241本地native命中记录，明确这是独立原碰撞输入加实际现代结算，不是本批新增原版采样。
- `tools/hero-pet-buff-mutation-tests.ts`：生产源码内存变异，要求实际验收AssertionError拒绝；不回写生产文件。涵盖早/晚移除、刷新换值、浮点攻击、错误HP比例、旧属性读取、无宠不推进、暂停推进、宠物先于主人及退出泄漏。
- `tools/pet-passive-owner-preflight.ts`修复后验证10组实际映射身份，输出242A/owner-binding.json。父242旧负向诊断保留，不能拿旧gap复现当通过。
- 实际五关Scene/browser、完整自动技能与六特效不由共同closure代替；这些保持242B及视觉任务责任。没有新增可见层、布局或现代视觉例外。
- check:structure先行通过；TestScene大文件仅添加一次当前属性同步及两个debug进度当前值读取，WorldBridge仅替换两个读取，避免在本批重构无关场景，已有warning保留说明。
- 子agent只读expected报告的tick199误述由主agent根据JSON与源代码纠正；采用修正后的timeLeft=0扣回、tick200置null，未采用误述。
- 公共设计gate补入本批生产测试与变异。旧P1TB静态检查改为240已迁移的实际resolvePetEnemyAttack及adapter路径；既有真实伤害回归保留。冰冻回归的弱断言改为逐步比较独立攻击时钟，以拒绝freeze-emitted-attacks，未删除变异。
- 240后Monster30绕过旧view步进，因此补入仍执行该分支的Monster3；四冰冻变异均拒绝。旧child-projectile-cleanup定位已因runtimeKey所有权迁移过时，改为当前清理谓词，十私有会话变异均拒绝；保留此前定位失败记录。
- 青龙公共consumer fixture缺失238已有experience依赖绑定导致ReferenceError；复用既有pet-experience-closure-fixture补齐，不添加XP自证模型。该fixture仍不覆盖进度/存档，保留真实XP专项边界；60组家族/五关/重入生命周期检查恢复通过。
- 玄龟旧承伤fixture仍期待240已删除的外部accepts谓词和activeAttack字段，改用241独立原生命中输入、实际独立攻击detections/colipse、远处拒绝、去重与反击；未删除原伤害/后坐/反击断言，依赖加入本地复验清单。
- 浏览器先因4174缺服务失败，按项目授权启动preview。后续状态证明手动Game时钟恢复后RAF未调度（scene队列仍待处理、无console异常），测试支架改为同一手动时钟推进ready与零delta处理场景队列，保留真实pointerup重试/返回、旧对象/纹理释放和重载断言。CDP代表截图另有compositor超时，改导出实际Game Canvas；940×590、非空彩色图已目检，逐层独立原图比较保持不变，报告明确captureMethod。未改生产场景生命周期。

最终命令、退出码与调度归档记录见242A本地handoff及task-history的242A完成段。游戏运行不消费本地证据；源级复验仍需要本地语料。

静态视觉复验同样遇到POST_RENDER等待停在第300态；静态probe使用零delta显式Game.step读取实际Phaser画布，保留11,572态的全部独立原图哈希/像素比较与精确批准清单，不修改生产展示或原生基准。旧PetAutoBuffSystem与未迁移家族兼容分支仍未核销，不以242A证明六项自动增益或其他家族完成。

连携专项曾在形态3原图 Image.decode 等待处超时；改为显式 fetch/createImageBitmap 解码，来源 SHA 与所有原生像素断言保留。技能/连携代表截图同样导出零 delta 实际 Game 画布；完整验收状态以最终联合门禁为准。

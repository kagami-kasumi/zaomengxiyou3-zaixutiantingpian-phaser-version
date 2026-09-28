# Monster30 双路径消费验收（240）

240于2026-09-28完成。输入是232 BA-01..08与241 verified攻击/目标真值。仅覆盖1-1/TestScene及1-3的Monster30→实际英雄/宠物，其他11怪物、Role4人偶、完整家族和VS-067均不据此关闭。用户明确授权241后继续240，并只批准241精确379例/382像素残差，93920命中布尔必须零差异。

## 生产责任与证据

| 合同 | 实际消费者 | 独立验收 |
| --- | --- | --- |
| BA-01 身体先效果 | Monster30System / MonsterPetTargetEffectSystem调用同一Monster30AttackRuntime | 原三fps致死反例已转为通过；非致死99HP、死亡动作选中tick0 |
| BA-02/03 独立出生、下一世界步检测 | 实体附属runtime持有attackId/sourceId、固定出生根、独立age；view只投影 | 66个双owner/三fps边界；移动源不拖弹，重复调用不重发 |
| BA-04/05 死亡保留、destroy清理和真实命中 | Stage1CombatSystem / TestSceneCombatBridge；formal PetCombatRuntime与既有legacy pet HP入口 | 实际英雄P1/P2不同defense、保护后末帧首次命中、去重；35形态×双slot×三fps=210次宠物真实HP1000→987 |
| BA-06 冰冻 | 身体步读取效果步之前的iceVisible；既有攻击照常检测 | 首show先回调、已有冰阻止出生、expiry本步仍停止、下一步恢复 |
| BA-07 暂停 | Scene既有pause事件交系统选择已进入的MovieClip显示帧；不推进age/身体/检测 | 两owner216个AIR EXIT相位，含世界停止/恢复；浏览器实际Scene暂停。源低层step2门禁仍是独立诊断语义，现代无等价公开API，不用delta=0冒充它 |
| 实际空间 | Monster30CollisionSystem查询241位场；英雄根movement.y-50、宠物实际root及35构造映射 | 93920独立原生case全部布尔一致；生产数据只读src/assets/monster30-collision.json |
| 显示 | Stage11/13只读runtime、既有十帧SVG、原注册根 | 20个940×590原AIR/实际WebGL图；暂停实际phase另由216态验收 |

纯系统报告是`docs/tasks/evidence/TASK-SLICE-240/{lifecycle,pet-hp,native-phase,body-order-preflight,mutations}.json`。七个真实生产源码变异分别破坏效果顺序、只有显示、死亡清弹、重发、destroy留弹、同帧检测、暂停显示，均被独立expected断言拒绝；编译/支架错误不算拒绝。

## 可见差异与边界

逐态差异见本地`browser/visual-verification.json`及20对原图/现代图。修复空SVG filter使1/5/6/10帧透明、反向注册点偏116px；没有替换原版图形或新增可见层。保留既有SVG的亚像素画布取整、边缘抗锯齿和模糊插值残差，visible bounds差异不超过2px，按用户长期轻微视觉差异授权记录，**不宣称像素完全一致**。这些显示差异不进入碰撞算法或241批准清单。Canvas回退仍由233处理。

实际浏览器使用生产模块与现有场景，观察注入只收集实体/HP/view，按键移动、跳跃和攻击，不重写目标坐标或碰撞。1-3自然走到第四遭遇点。存活HP/经验夹具只让旅程持续；fatal在真实hit1回调前将效果计数器设为源232夹具的首tick（0）再注入致死火焰，并预载既有FireBuff bundle。事件保留真实扣血前后、sourceId、attackId、ownerSlot、sourceDead，明确这不是完整原游戏Scene重放。纯visual fixture另行隔离，不把它当自然碰撞正例。

宠物210例中16形态走正式PetCombatRuntime/Session，19形态走现有兼容受击owner；只核对本次Monster30来袭的HP/身份/去重，不称完整家族AI/动作/技能已复现。Role4人偶仍使用旧矩形与activeAttack，空间真值不在241内，登记为未消费目标，不能声称所有Monster30消费者清零。其他11类型按232消费者矩阵与226原84责任保留，后续在204公共责任中逐项生成有界实现，不泛化本代表合同。

## 可复验与交付

入口见`tools/local-validation.md`的241/240节。运行所需位场已经放入正式src资产，不读被忽略的evidence；原生复验依赖本机恢复语料/AIR，不能承诺仅拉取即可源级复验。Monster30System原warning通过提取Model消除；TestSceneWorldBridge只增加一行调度，HeroPartyRuntimeBridge窄加实际profile/即时结算桥接，既有warning保留且不扩大为规则owner。

浏览器、工程门禁和最终状态由本地`handoff.md`与`project-checks.json`记录；task-board已在门禁完成后归档240并激活233。

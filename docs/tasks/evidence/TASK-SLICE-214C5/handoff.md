# 初阶青龙正式投影交接

本批范围为 dragon1；二三阶、四阶及全44项家族合同继续由214D/214E承担。

## 生产实现

- `PetDragonPresentationBridge`直接消费公共Runtime的root/summons动画snapshot和普通弹`petHostTick`，使用214A的frame/placement查询。没有视图时钟、技能选择或伤害owner。分身alpha直接取213的`actions.fs.cloneAlpha`。
- 正式五关与TestScene在同一个`updatePets`末尾投影相同快照及本次弹体存储；按runtimeKey区分本体、分身和P1/P2，移除/休息/换宠/销毁时释放对应显示对象。
- TestScene使用实际Monster30的读写访问器适配共享伤害端口。HP写回走`applyMonster30Hit`，保留其hurt/dead时长及攻击清理；经验/掉落owner复用既有归属入口。适配对象不拥有另一份HP。
- TestScene每帧通过既有`FormalPetsUpdatedEvent`共享其真实roster，初阶青龙不再进入旧移动/技能/占位视图路径；通用弹体视图跳过`petHostTick`。DEV QA初始化也使用同一roster，已修正独立审查发现的默认猴/青龙重复显示风险。
- `HeroPartyRuntimeBridge`原结构仅有import-count warning。本批只作创建/转发/销毁及隔离QA接线；家族视图和敌人适配放在新小文件，未向共享桥回填战斗算法。

## 父C2/C逐项覆盖

| 合同 | 证据 |
| --- | --- |
| normal/fs/到期治疗、真实子实体攻击与来源 | C4的runtime-traces与14类实现变异继续由P1GC执行；本批consumer-traces运行真实生产updatePets、Combat、Session、Monster30适配与presenter |
| 原版时钟/范围/地面与完成路由 | C3地面trace、C4时序trace、pet-dragon1-clock-tests、P1GS和P1GC；不在视图重新计时 |
| 本体/分身/普通弹及全部适用视觉状态 | 213的verified显示列表/基准与214A资源；72个初阶状态由实际生产presenter捕获调用，940×590独立渲染逐像素差0，位置/alpha/帧/翻转4类变异拒绝；view-projections、visual-diff、projections与contact-sheet |
| P1/P2及换宠/休息/释放/重新进入 | consumer-traces对两种实际敌人消费者各运行独立会话，测试保留另一slot、旧key失效、分身及弹体清理、新会话重新创建；共享正式五关journey覆盖路由与当前schema |
| 正式和TestScene可见链 | formal-active.png/json记录两slot及各自真实summon伤害来源；testscene-active.png/json显示真实子实体及同源动作，testscene-return.png记录离场；浏览器验收详见runtime-audit.md |
| 架构与质量门禁 | `pet P1GC=0`包含P1GS、猴马回归、青龙真实行为/14变异、72态原版视觉差异及生产消费者；build、全系统、真值、资源、structure/workflow/annotations/架构与problem audit |

## 明确边界

- 72态对账是原版离屏源对象基准与生产presenter输出，不是完整原版游戏录像。正式浏览器截图另作组合路径证据；保留214A既有透明裁边/栅格化规则，没有新增可见替身。
- TestScene默认飞行Monster30高于地面普通弹的有效纵向范围；该运行态没有假HP decrease。生产consumer测试在明确地面输入下验证真实Monster30 HP/hurt及双owner；不把地面攻击所有飞行目标宣称为已支持。
- 主人死亡沿用既有共享桥语义：宠物会话仍存在，新的敌人输入为空；场景离场统一销毁。未另造死亡策略。
- `sourceHitProtection`仍是既有显式端口，不代表所有怪物的原版瞬态保护技能已实现。分身早死时释放Session/弹体仍为C4已说明的现代清理边界。
- 仅初阶通过；`pet all`及全家族P1G没有通过，VS-067和M-042保持部分复现。不得据此计第三完整家族成功样本。

## 重跑

```powershell
npm run check:system-design -- pet P1GC
npm run check:system-design -- pet P1GS
npm run test:pet-dragon-family-truth
npm run test:pet-dragon-assets
npm run test:systems
npm run build
npm run check:structure
npm run check:workflow
npm run audit:problems
git diff --check
```

后续214D复用同一presenter/Runtime，仅扩展dragon2/3和对应效果，补P1GD；214E仍承担qlaoyi与全44项。不得恢复TestScene具体技能直连或在视图添加第二时钟。

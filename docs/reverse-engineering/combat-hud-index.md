# 正式战斗 HUD 逆向索引

本文是 `TASK-SETTINGS-055` 的权威实现输入，只覆盖 Stage 1 正式关卡的核心战斗 HUD：P1/P2 HP、MP、经验、等级、五个技能槽、法宝/宠物入口提示和重要敌人状态。完整背包、宠物、心法/技能、法宝页面不在本任务范围。

## 1. 待证明的可观察问题

1. HUD 是跟随关卡世界还是固定在视口上，何时创建和销毁？
2. P1/P2 的字段、屏幕锚点、镜像规则和技能槽顺序是什么？
3. HP、MP、经验和等级显示哪些值，何时更新，满级如何表示？
4. 五个普通技能槽如何从绑定数据映射到屏幕位置，空槽如何显示？
5. 法宝/宠物在核心 HUD 中只提供什么入口提示，哪些完整页面必须后置？
6. 哪些敌人显示顶部状态条，多个 Boss 如何排列，伤害追赶层如何更新？
7. 恢复源包中有哪些可选择性导出的真 UI，哪些文本应由现代运行时生成？
8. 现代 Stage 1 当前缺哪些只读数据，下一实现 task 的 owner 和验证边界是什么？

## 2. 结论摘要

| 问题 | 结论 | 分级 |
| --- | --- | --- |
| 层级与生命周期 | `PhysicsWorld.pWorldStart()` 在英雄创建后新建 `GameInfo` 并加到主场景；关卡场景移动时 HUD 保持固定。换图会销毁并重建，结束游戏会销毁 | 交叉确认 |
| 玩家所有权 | `GameInfo.refreshRoleInfo()` 按 `playNum` 创建独立 `RoleInfo(1/2)`；每个实例只读取 `gc.hero1/hero2`，不存在共享当前玩家指针 | 确认事实 |
| 更新频率 | `PhysicsWorld.step()` 每帧调用 `GameInfo.step()`，再调用每个 `RoleInfo.step()`；`Config.frameClips = 30` 是原版逻辑帧基准 | 确认事实 |
| 基础字段 | 每帧显示 `当前 HP/最大 HP`、`当前 MP/最大 MP`、`当前经验/升级所需经验`、等级；满级经验文本为 `MAX` | 确认事实 |
| 五槽布局 | 屏幕从左到右是 `Y/U/I/O/L`，但现代输入槽索引是 `Y/L/U/I/O`；必须按键位映射，禁止直接按数组下标排版 | 交叉确认 |
| P2 语义 | P2 绑定值为 `8/3/4/5/6`，显示位置先映射到 `Y/L/U/I/O` 槽，再通过局部重排和整个 `RoleInfo` 水平镜像落到右下 | 交叉确认 |
| 入口提示 | `btn_fb` 打开已装备法宝的强化页，P1 `N` 可触发；`btn_cw` 打开宠物页，P1 `B`、P2 小键盘 `-` 可触发。首个核心 HUD 只接入口提示，不实现完整页面 | 确认事实 / 现代范围选择 |
| Boss 状态 | `isBoss` 怪物创建时以 `monsterName` 建条，受击/回血时更新；每条固定 `x=465`，按创建顺序从 `y=50` 起每 50px 堆叠 | 确认事实 |
| Boss 追赶层 | `hpMask.scaleX` 立即更新到 HP 比例，`effectMask` 用 0.8 秒线性 tween 追赶；死亡更新到 0，换图/显式清理时移除 | 确认事实 |
| 真资源 | 玩家面板及子件位于恢复包 `assets/OtherMat1.swf`；Boss 条位于恢复包 `assets/bossblood.swf`。主包 `GameInfo` 只作组合/调用链交叉对照 | 交叉确认 |

## 3. 六段证据链

### 3.1 关卡/对象局部证据

- `export/GameInfo.as:166-188`：按 `gc.playNum` 创建 `RoleInfo(_loc2_ + 1)`；P1 `x=0`，P2 `x=920` 后整个实例 `scaleX=-1`。
- `export/RoleInfo.as:105-133`：P2 重排五槽、按钮、文本、顶栏和战意件，并对文本二次反转保证可读。
- `export/RoleInfo.as:136-219`：最多读取 `skillbykey` 前五项；P2 的 `8/4/5/6/3` 映射到 `Y/U/I/O/L` 显示位置；技能图为 `ss_<skillName>`，键标为 `Skill_<keys>`。
- `export/RoleInfo.as:259-291`：每帧刷新 HP、MP、经验、等级、战意和当前宠物摘要；三条进度时间轴都使用 `round(100 * (1-current/max)) + 1`，即第 1 帧为满、第 101 帧为空。
- `export/RoleInfo.as:398-451`：`btn_fb` 与 `btn_cw` 分别进入法宝强化和宠物页；死亡或特殊关卡存在入口门禁。
- `export/GameInfo.as:518-606`：Boss 条的创建、堆叠、即时比例、0.8 秒追赶层和清理逻辑。
- `base/BaseMonster.as:150-160, 340-357`：只有 `isBoss` 怪物在创建、回血和受击状态更新 Boss 条；Stage 1 的巫鹰、千里眼/顺风耳、巨灵神由各怪物类设置 `isBoss`。

### 3.2 共享运行时调用链

```text
PhysicsWorld.pWorldStart()
→ createHero()
→ new GameInfo()
→ GameInfo.refreshRoleInfo()
→ new RoleInfo(1/2)

PhysicsWorld.step()
→ GameInfo.step()
→ 每个 RoleInfo.step()
→ 对应 hero.roleProperies / User.skillbykey / 当前宠物

BaseMonster.__added()/reduceHp()/周期回血
→ GameInfo.addBossBlood(monsterName, ..., hp/maxHp)
→ 即时 hpMask + 0.8s effectMask
```

`PhysicsWorld.mapChange()` 在关卡场景替换后销毁旧 `GameInfo` 并创建新实例；`MainGame.destroyGame()` 同样调用 `gameInfo.destroy()`。因此现代 HUD 必须由场景生命周期 owner 创建和释放，不能挂在跨场景全局单例上。

### 3.3 SWF 几何与坐标语义

坐标基准为原版固定 `940×590` 视口。以下均是 MovieClip 局部注册坐标，不是导出图片左上角；实现时应按注册点重建组合，不能把整张导出 SVG 的 bounding box 当作屏幕尺寸。

| 对象 | 源包 / character | 局部几何与放置 |
| --- | --- | --- |
| 玩家 HUD 组合 | `assets/OtherMat1.swf` / `RoleInfo` 574 | P1 父级 `(0,0)`；P2 父级 `(920,0)` 且整体 `scaleX=-1` |
| 顶栏底图 | character 496 | `226×86`，放置 `(1,2)` |
| 头像 | character 505 | 显示边界约 `75.05×112`，注册放置 `(53.75,35.9)`，按角色名切帧 |
| HP / MP / EXP | 531 / 534 / 537 | 各 101 帧、显示高约 `12.1`；放置 `(85.45,16.3)`、`(86.7,35.1)`、`(86.7,54.8)` |
| 数字文本 | 538 / 539 / 540 / 541 | HP/MP/EXP 文本宽 71；等级文本宽 27；运行时文字，不作为位图导出 |
| 五槽框 | character 510 | 每槽 `45×45`；P1 注册中心 x 为 `130.5/170.5/210.5/250.45/290.45`，y=`518.15`，对应 `Y/U/I/O/L` |
| P2 五槽 | character 510 + 镜像 | 局部重排后 x 为 `289.5/250.5/210.5/170.45/131.45`，整体镜像到屏幕约 `630.5/669.5/709.5/749.55/788.55` |
| 战意/特殊就绪 | 519 / 526 | 战意 100 帧，注册 `(100,542.75)`；就绪指示 2 帧，注册 `(39.9,486.35)` |
| 法宝/宠物按钮 | 567 / 573 | 约 `47×41` / `47×46`，注册 `(55.15,475.4)` / `(91.35,472.65)`；P2 随父级镜像并对子按钮反转 |
| Boss 条 | `assets/bossblood.swf` / `BossBlood` 110 | 父级固定 `x=465`；首条 `y=50`，后续每条 `+50`；主体约 339px 宽，名称子件 109 位于局部 `x=-181.45,y=-1` |
| Boss 即时/追赶层 | `Hp` 13 / `Effect` 8 | 两层均受局部 mask 裁切；比例从注册点按 `scaleX=hp/maxHp` 更新 |

本地选择性调查产物位于 `local-resources/regima/task-outputs/task-settings-055-hud/`：`RoleInfo` 574、`BossBlood` 110、主包 `GameInfo` 142 / `beattacktimes` 302 的 SVG，以及 Boss SymbolClass。该目录是 Git 忽略的只读派生证据，不进入现代资源目录。

### 3.4 可观察行为合同

#### 玩家快照

每个活动玩家独立提供：

```text
slot
hp / maxHp
mp / maxMp
level
currentExp / expToNext / isMaxLevel
skillSlots[5]: binding | empty, displayKey, usableState
warriorEnergy / specialReady（有 owner 时显示）
magicWeaponHint / petHint（首切片只显示入口和可用性，不展开页面）
```

- 比例统一 clamp 到 `[0,1]`；数值文本仍显示实际整数。最大值为 0 的异常快照显示空条，不产生 `NaN`。
- 满级显示 `MAX` 且经验条保持满；非满级显示 `currentExp/expToNext`。
- 五槽必须按键位落位：P1 `Y/U/I/O/L`，P2 `8/4/5/6/3`；无绑定时保留真槽框，不伪造默认技能。
- 1P 只创建 P1 HUD；2P 同时创建两份独立快照和视图。死亡玩家的 HUD 保留并显示 0 HP，直到结果流程或场景销毁。

#### 重要敌人快照

```text
enemyId
displayName
hp / maxHp
spawnOrder
isBoss
```

- 只显示当前关卡活动的 `isBoss` 敌人；普通怪不进入顶部条。
- 创建顺序决定垂直顺序；即时层同帧到达真实比例，追赶层在 800ms 内线性到达。
- 原版用 `monsterName` 去重；现代以稳定 `enemyId` 持有生命周期、以 `displayName` 展示，避免同名实例串状态。这是明确的现代健壮性选择。
- 敌人死亡时先显示 0，再由关卡/实体销毁事件移除；场景退出必须清空全部条。

### 3.5 现代实现映射

| 合同 | 当前事实 | `TASK-SLICE-131` 的 owner |
| --- | --- | --- |
| HP/MP | `Stage1CombatPlayer.combat.hp/maxHp` 与 `mp/maxMp` 已在三关共享 | 只读 HUD snapshot adapter；HUD 不直接改战斗模型 |
| 等级/经验 | 正式 Stage 1 目前只有裸 `experience:number`，测试系统另有 `HeroProgressionModel` | 把正式玩家 runtime 接到 `HeroProgressionModel`，奖励通过 `addHeroExperience()` 结算；禁止 HUD 自算升级 |
| 技能 | `HeroSkillModel.loadout` 已存在，但正式 Stage 1 尚未持有 | 正式玩家 runtime 持有/暴露只读五槽状态；未绑定显示空槽，HUD 不负责释放技能 |
| 玩家视图 | 三关 bridge 仍各自创建临时状态文本 | 新建共享 `Stage1CombatHudBridge` 或等价场景 helper；三关只传模型与敌人集合，不复制布局 |
| Boss 状态 | `Stage1CombatEnemy` 已有 `id/hp/maxHp`，boss 标记来自集中 config | snapshot adapter 从共享 enemy config 读取 `isBoss` 和显示名；不在各关硬编码 Boss 条 |
| 真资源 | 12 条资源标注均为 `export-ready` | 下一 task 只选择性导出并注册 HUD 壳、槽框、入口按钮和 Boss 条；运行时文本保持 Phaser 文本 |
| 生命周期 | Stage 1-1/1-2/1-3 各有 gameplay handle `destroy()` | HUD bridge 同 handle 创建、每帧更新、`destroy()` 释放；所有对象 `setScrollFactor(0)` |

现代 HUD 只消费归一化快照。Phaser 显示对象留在 scene bridge，比例、顺序和 owner 映射可下沉为无 Phaser 的纯系统，以便确定性测试。

### 3.6 双重验证计划

确定性测试：

1. P1/P2 同时修改 HP、MP、经验和槽位时，只更新自己的快照；交换输入顺序不串号。
2. 验证 `slotIndex → displayKey → screenPosition` 映射，特别覆盖 slot 1=`L/3` 不能误放到第二个可视槽。
3. HP/MP/EXP 的 0、半值、满值、最大值 0、满级 `MAX` 均输出稳定比例和文本。
4. 两个不同 Boss 按 spawnOrder 堆叠；同名不同 enemyId 不互相覆盖；800ms 追赶层按线性插值收敛。
5. 三关均只调用共享 HUD 工厂；destroy 后视图、定时/tween 和敌人条集合为空。
6. 奖励经验进入 `HeroProgressionModel`，升级与回满仍由成长 owner 处理，HUD 不产生状态写入。

运行时人工/浏览器验证：

1. Stage 1-1 1P：从入口到巫鹰死亡，检查固定 HUD 不随纵向镜头移动、HP/MP/经验更新和 Boss 条即时/追赶层。
2. Stage 1-2 2P：两名玩家分别受伤、拾取、获得经验，检查左右 HUD 与键标不串号；千里眼/顺风耳两条按生成顺序同时可读。
3. Stage 1-3：镜头移动、第一停点和巨灵神阶段检查 HUD 不遮挡核心路径，失败/胜利/退出后无残留。
4. 检查 940×590 基准与当前响应式画布的等比缩放；不得用固定 DOM 像素破坏 Phaser 缩放。

## 4. 资源标注与选择性导出边界

- 批次：`asset-annotation/batches/combat-hud.md`
- 标注：`asset-annotation/annotations/combat-hud.csv`
- 12 条均已定位精确源包和 character id，状态为 `export-ready + export-selectively`。
- 技能图 `ss_<skillName>` 与键标 `Skill_<key>` 的符号目录已在 `OtherMat1.swf` 确认；首个正式 Stage 1 runtime 没有默认绑定，因此下一 task 先接空槽真框和运行时键标，不批量导出全部角色技能图标。出现实际绑定时按绑定集合窄导出，不能用一个巨型全量 UI 导出替代。
- 数值、等级、键位和 Boss 名称是运行时数据，现代使用文本渲染；这不是缺失原素材。Boss 条底图、填充/追赶层和玩家 HUD 壳必须使用已定位真资源。

## 5. 未知、推断与反证条件

- `未知但不阻塞首切片`：`ShowPetInfo` 的完整皮肤 SymbolClass 未从当前窄查中定位；AS3 已确认其等级、HP、MP字段。首切片只承诺宠物入口提示，不显示宠物完整摘要或页面。
- `现代设计选择`：使用 `enemyId` 而非原版 `monsterName` 持有 Boss 条；若运行对照证明原版同名多 Boss 的合并是玩家可感知且必须保留，再降级此选择。
- `现代设计选择`：技能键标与动态数值使用清晰文本重建；真槽框和 HUD 壳仍从恢复源导出。
- `反证条件`：若原版录屏显示 Stage 1 的 HUD 被关卡镜头带动、P2 技能顺序不同、Boss 条在死亡前消失，或存在本任务未覆盖的正式核心字段，应把相应结论降级为待复核并重新追踪。

以上未知不影响 `TASK-SLICE-131` 的 HP/MP/经验/等级、五槽、入口提示和重要敌人条实现；它们禁止把宠物完整 HUD 或全部技能图标宣称为已闭合。

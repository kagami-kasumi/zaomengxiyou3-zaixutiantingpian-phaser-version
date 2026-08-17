# TASK-SETTINGS-191 宠物 UI 正式可见性证据

## 1. 待证明问题与裁决

| 问题 | 裁决 | 等级 |
| --- | --- | --- |
| 正式关卡是否安装宠物入口 | `PlayableLevelRuntime` 为五关统一安装 `FormalFeatureUiEntryBridge`；P1 character 573 pointer/`B` 与 P2 镜像 pointer/小键盘 `-` 都进入同一 router | 交叉确认 |
| 932 页面是否因 owner、bundle、scene、depth 或真值投影不可见 | 否。`feature-ui-pets` 完整加载 932/1224/按钮/头像/技能资源，`FeatureUiScene` 被 bring-to-top，932 容器 depth 20；940×590 P1/P2 pointer 运行均打开页面，console warning/error 为 0 | 交叉确认 |
| 用户所见“无宠物 UI”的精确缺口 | 原版战斗 HUD 会在 `RoleInfo` 上动态 `addChild(new ShowPetInfo())`；现代 `Stage1CombatHudSnapshot` 只有 `petAvailable:boolean`，view 只写“宠物/宠物—”，没有宠物头像、等级、HP/MP 条和数值消费者 | 交叉确认 |
| 原版是否不存在宠物战斗 HUD、需要现代例外 | 否。恢复 `pet1.swf` character 662 `export.pet.ShowPetInfo` 是独立原版 HUD 根，7 个直接 child、HP/MP 各 25 帧，并有完整 AS3 创建/更新/移除链；不需要用户批准现代替代层 | 交叉确认 |
| 宠物实体真动画是否同根 | 否。character 662 只负责战斗状态 HUD；宠物本体/技能动作属于独立恢复源资源族，继续由 193 分区 | 确认事实 |

结论：页面入口链没有复现用户反证；反证命中的精确层是 **战斗宠物 HUD 消费缺失**。175A/180 的单页结论保留，不能再用它代替 character 662；现代 `petAvailable` 文字也不能充当原版战斗 HUD。

## 2. 正式路由分层矩阵

| 层 | 一手/现代证据 | P1 | P2 | 结论 |
| --- | --- | --- | --- | --- |
| 入口安装 | `PlayableLevelRuntime.ts:118`；`FormalFeatureUiEntryBridge.ts:78-95` | `B` + 573 pointer | numpad `-` + `920-x` pointer | 已安装 |
| owner 与门禁 | `StageFeatureEntryRouterSystem.ts:83-111`；175C `gate-pets-dead-allowed` | owner=`p1` | owner=`p2` | 宠物页不因角色死亡被拦截 |
| bundle | `FormalFeatureUiEntryBridge.ts:152-153`；`SceneAssetBundles.ts:436-448,615` | `feature-ui-pets` | 同 bundle | 932、行、tooltip、确认、按钮、头像、技能均在 bundle |
| scene/layer | `FormalFeatureUiEntryBridge.ts:158-178` | launch + bringToTop + pause origin | 同 | 无 scene/depth 遮挡 |
| 页面绘制 | `FeatureUiScene.ts:150-156,242-260`；`FormalPetPageView.ts:56-73` | 932 容器 depth 20 | 同几何、owner 切换 | 直接消费 175A truthId |
| 运行复现 | `/?qaStage=1-1-role1`，940×590，点击 `(91,473)` | 页面显示小猴/出战/两技能 | — | 0 warning/error |
| 双人运行复现 | `/?qaStage=1-1-role1&players=2`，加载完成后点击 `(829,473)` | — | 页面显示 P2 owner 小猴/出战/两技能 | 0 warning/error |
| 战斗常驻宠物 HUD | `Stage1CombatHudSystem.ts:27,54,114`；`Stage1CombatHudBridge.ts:109-144` | 仅 `petAvailable` 文本 | 仅 `petAvailable` 文本 | character 662 完全未消费 |

运行复现沿用当前正式 `PlayableLevelRuntime` 和活动存档，不以 180 的孤立页面 fixture 否定用户反馈。P1/P2 页面截图基准继续引用 `docs/tasks/evidence/TASK-SLICE-180/`；双 HUD 返回态引用 `docs/tasks/evidence/TASK-SLICE-182/modern-combat-dual-hud-return-940x590.png`。

## 3. 原版战斗宠物 HUD 显示列表

真值：`task-settings-191.pet-combat-hud`，路径 `docs/reverse-engineering/ground-truth/manifests/task-settings-191-pet-combat-hud.json`，状态 `verified`，10 个序列化对象、10 状态、每个可见状态 8 对象，`unresolved=[]`。

character 662 在 `RoleInfo` 静态 64 depth 之后通过 `addChild` 成为动态最上层（归一化 depth 65），其根在 RoleInfo 局部 `(0,94)`；P2 的 RoleInfo 父级为 `(920,0), scaleX=-1`，只有三个 TextField 再按 `flipHorizontalTxt(2)` 反转回来保持可读。

| 对象 | character | depth | 实例 | character 662 局部矩阵/边界 | 动态写入 |
| --- | ---: | ---: | --- | --- | --- |
| shell | 605 | 1 | — | `(0,0)`；`178×56` | 静态 |
| HP 时间轴 | 610 | 2 | `hpmc` | `scale=.84; (118.3,15.35)`；25 帧 | `25-round(25*hp/maxHp)`，0 帧由 Flash 夹到 1 |
| MP 时间轴 | 614 | 7 | `mpmc` | `scale=.84; (117,31)`；25 帧 | `25-round(25*mp/maxMp)` |
| 宠物头像 | 657 | 12 | `headmc` | `(7.8,-11.3)`；黑色 glow | `gotoAndStop(PetInfo.getPetChinaName())` |
| 等级 | 659 | 26 | `txtlevel` | P1 `(5.5,36.55)`；P2 `scaleX=-1,x=25` | `getLevel()` |
| MP 数值 | 660 | 27 | `txtmp` | P1 `(79,24.15)`；P2 `scaleX=-1,x=140` | `getMp()/getSMp()` |
| HP 数值 | 661 | 28 | `txthp` | P1 `(78,7.5)`；P2 `scaleX=-1,x=140` | `getHp()/getSHp()` |

原始可见根边界为 `[-87.2,-29.55,273.7,93.6]`。组合到舞台后：P1 `[-87.2,64.45,273.7,93.6]`；P2 `[733.5,64.45,273.7,93.6]`。P2 截出右边缘是原父级镜像结果，不得另造“更美观”坐标。

## 4. 六段证据链

1. **局部证据**：`ShowPetInfo.as:48-72` 冻结字段、头像和 HP/MP 帧公式；`BasePet.reduceHp()` 冻结受击、0 HP 与死亡动作。
2. **共享调用链**：`GameInfo -> RoleInfo.added -> addPetHead -> ShowPetInfo`；每帧 `RoleInfo.step -> petHead.show`；`PetInterface.fight/rest/release -> CHANGECURRENTPET -> RoleInfo.addPetHead/removePetHead`。
3. **几何**：恢复 `pet1.swf` character 662、605/610/614/657/659/660/661；FFDec XML 与选择性 SVG 逐 child identity/depth/matrix 一致。P1/P2 stage 变换直接写入 manifest。
4. **可观察合同**：无出战宠物/休息时 0 对象；出战时 8 对象；受击和 MP 消耗逐帧刷新；HP=0 且 lifetime 仍大于 0 时 HUD 保留并显示 0；休息/放生事件移除；P1/P2 各读自己的当前宠物。
5. **现代映射**：192B 扩展共享 combat HUD snapshot/bridge，直接消费同一 `PetRuntime/PetRoster` owner；HUD 只读，不写宠物数值、技能或存档。
6. **双重验证**：机器真值 Schema/完整性校验；192B 必须在 940×590 P1/P2 的无宠物、出战、受击、0 HP、休息/重开和返回重载状态对原 baseline/对象清单回测。

## 5. 原版基准、差异与现代例外

- 原版结构基准：`docs/tasks/evidence/TASK-SETTINGS-191/original-*-940x590.png`，由恢复 character 662 的 FFDec PNG 按原 `RoleInfo` 变换生成；透明态代表无宠物/休息。
- 动态 HP 帧 1/12/25、头像标签和 TextField 不能由静态 FFDec 根帧自动驱动，故精确状态差异由同一 manifest 的分帧对象与 AS3 fixture 承载；不得把静态基准误当成数值写入证据。
- 现代差异：现有正式 HUD 缺少原版 8 个可见对象，只存在 `petAvailable` 现代文字摘要；这不是批准的视觉例外。
- 允许的新增可见现代例外：无。若为可访问性增加不可见语义命中，不得改变 character 662 可见几何。

## 6. 192A / 192B 精确边界

### TASK-SLICE-192A

- 保留 175A/180 的 932 页面、owner、事务、存档和现有原生资产，不重做页面。
- 只补正式冷启动存档→地图→五关 Runtime→P1/P2 573 pointer/键盘→932→关闭返回的可重复旅程与失败可观察性；当前 bundle `catch { return false }` 不得继续让失败完全静默。
- 不新增 host chrome、标题、通用关闭、现代面板或第二套页面坐标；若正式旅程仍全部通过，允许以“无可见实现改动 + 回归门禁”关闭。

### TASK-SLICE-192B

- 直接消费 `task-settings-191.pet-combat-hud`；把同一 owner 的 active pet 只读快照接到共享 combat HUD。
- 恢复 character 662 shell/head/level/HP/MP，P1/P2 镜像和 TextField 反转；逐帧同步受击、MP、死亡，响应出战/休息/放生。
- 删除 `petAvailable` 可见文字替代，不以现代矩形或通用血条覆盖原 HUD；宠物实体动画和技能特效严格留给 193 生成的资源族任务。

影响 192A/192B 的未知为零。

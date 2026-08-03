# 关卡内五功能入口逆向索引

本文是 `TASK-SETTINGS-067` 对正式关卡内“设置 / 技能 / 背包 / 法宝 / 宠物”五入口的权威实现输入。范围只覆盖入口显示列表、快捷键、owner、门禁、暂停、互斥、关闭返回、设置页及其帮助子页；既有背包、技能、宠物和法宝页面内部业务不在本任务重复逆向。

## 1. 待证明的可观察问题

1. 五个入口是否都存在于原版 HUD，还是部分只有快捷键？
2. P1/P2 的按钮、快捷键、默认 owner 和法宝限制分别是什么？
3. 五入口在关卡/死亡/装备状态下有哪些门禁，门禁是否有独立 disabled 视觉？
4. 打开页面后是否暂停，能否跨页切换，再次按键、Escape 和关闭按钮分别做什么？
5. 关卡设置页与天庭地图 `gameSetting` 是否为同一页面和同一 owner？
6. 原版显示列表、按钮 up/over/down/hittest、P2 镜像和 940×590 视觉基准是什么？
7. 现有 `FeatureUiHost` 与原版合同有哪些必须整改的差异？

## 2. 结论摘要

| 问题 | 结论 | 分级 |
| --- | --- | --- |
| 五入口身份 | 五个入口都是 `RoleInfo` 574 的真 HUD `SimpleButton`：`btn_set/btn_study/btn_bb/btn_fb/btn_cw`，不是“只有快捷键”的现代补造入口 | 交叉确认 |
| P1/P2 HUD | `GameInfo` 为每位本地玩家各建一个 `RoleInfo`；P2 父实例位于 `(920,0)` 且整体 `scaleX=-1`，按钮子件再局部反转以保持图形可读 | 交叉确认 |
| 快捷键 | P1 为 `C/V/B/N/Esc`；P2 只有 num `/ * -`，分别对应背包/技能/宠物。P2 没有独立法宝或设置快捷键，但 P2 HUD 上仍有可点击的法宝和设置按钮 | 确认事实 |
| owner | 背包绑定点击 HUD 的 `rn`；宠物绑定该 HUD hero 的 `User`；法宝绑定该 HUD hero 且要求其已装备 `zbfb`；设置为全局 owner；技能页不接收 `rn`，无论 P1 V 或 P2 `*` 都先选 P1，再允许页内选择 P1/P2 | 确认事实 |
| 暂停 | 本地模式的五页最终都会调用 `MainGame.stopGame()`；该方法移除主循环、停止键盘、暂停 tween/子弹并设置 `isStopGame=true`。关闭恢复原主循环和键盘 | 交叉确认 |
| 互斥/切换 | `isStopGame` 是全局单页门；已有页打开时，其他入口不会切页。再次触发同一入口派发该页专属 close event；Escape 只派发 `closesetmenu`，不是通用关闭 | 确认事实 |
| disabled | HUD 五按钮没有独立 disabled 帧；不可用状态仍显示原按钮，点击后由关卡、死亡或装备门禁拒绝/提示 | 交叉确认 |
| 设置页身份 | 关卡设置是 `OtherMat1.swf` character 371 `export.setmenu.SetMenu`；天庭地图设置是 `StageCommon.swf` character 148 `gameSetting`，两者内容、入口和 owner 不同 | 交叉确认 |
| 设置页内容 | 371 含继续、声音开关、返回地图、游戏帮助、出怪速度 `x1/x2/x4`、返回主菜单和右上关闭；帮助打开 940×590 character 444，两帧分别为操作指南和捕捉宠物 | 交叉确认 |
| 现代差异 | 当前现代 host 没有 settings page/HUD 指针入口，却有原版不存在的通用标题、暗层、五个跨页按钮、通用 Escape 关闭和战斗内 workshop 导航；P2 技能 owner 也被现代直接设为 P2 | 确认事实 |

## 3. 六段证据链

### 3.1 局部对象证据

- `export/RoleInfo.as:232-253`：五按钮在 `added/removed` 对称绑定和解绑。
- `export/RoleInfo.as:337-451`：
  - 背包：`setpack(this.rn)`，关卡/死亡门禁，打开后暂停；
  - 设置：创建 `export.setmenu.SetMenu`，本地模式暂停；
  - 技能：只派发 `showBuySkill({state:"gameing"})`，没有传入 `rn`；
  - 法宝：关卡/死亡/已装备 `zbfb` 门禁，`setRole(this.hero)`；
  - 宠物：关卡门禁，构造参数为 `this.hero.getPlayer()`。
- `my/KeyBoardControl.as:59-148`：P1 `[67,86,66,78,27]` 与 P2 `[111,106,109]` 都通过对应 `RoleInfo` 按钮的 click 事件进入同一调用链。
- `export/shop/BuySkill.as:42-94`：页面动态生成双方角色选择器，但 `added()` 固定执行 `player1.dispatchEvent(click)`，因此 P2 `*` 不改变默认选择。
- `export/setmenu/SetMenu.as:36-196`：设置页按钮、声音可见性、出怪速度三值循环、帮助、返回地图/主菜单及关闭生命周期。
- `export/Help.as:20-55`：帮助页固定两帧，默认操作指南；“捕捉宠物”切到 frame 2，返回只移除帮助页并露出下层设置页。

### 3.2 共享运行时调用链

```text
KeyBoardControl keydown 或 RoleInfo HUD pointer
→ 对应 RoleInfo.btn_* click
→ RoleInfo.showBackPack/setClick/studySkill/fbClick/cwClick
→ 直接 addChild 或 GMain event router
→ 页面绑定 player/global owner
→ MainGame.stopGame()
→ isStopGame=true + keyboard/tween/world loop 停止

同一入口再次触发
→ isStopGame 分支
→ page-specific close event
→ 页面 close/remove
→ MainGame.continueGame()
→ 只恢复原战斗
```

`MainGame.stopGame()` 位于 `my/MainGame.as:621-672`，`continueGame()` 位于 `674-718`。`Config.isSingleGame()` 只判断 `nodeFloor == 0`，不判断 `playNum`，所以本地双人仍属于会完整暂停的本地模式。

技能页是例外路由：`RoleInfo.studySkill()` → `GMain.showBuySkill()` → `BuySkill.added()`；入口按钮属于对应 HUD，但默认页面 owner 仍由 `BuySkill` 固定选 P1，随后才允许页内切人。

### 3.3 SWF 显示列表、几何与按钮状态

源包：`local-resources/regima/source/restored-swfs/assets/OtherMat1.swf`。FFDec 26.0.0 只读派生位于 `local-resources/regima/task-outputs/task-settings-067-stage-feature-entry/`。舞台基准为 940×590；XML 坐标为 twip，表中已除以 20。

#### `RoleInfo` 574 的五入口

| 实例 | character | depth | P1 注册坐标 | 导出边界 | visible state | hittest |
| --- | ---: | ---: | ---: | ---: | --- | --- |
| `btn_set` | 549 | 52 | `(63.65,563.15)` | 47×43 | up=546；over/down=548 | 共享 418，缩放 `0.5050×0.5639`、偏移 `(-15.15,-17.2)` |
| `btn_bb` | 555 | 55 | `(32.9,540.5)` | 47×44 | up=552；over/down=554 | 同 418 |
| `btn_study` | 561 | 58 | `(28.5,504.85)` | 47×40 | up=558；over/down=560 | 同 418 |
| `btn_fb` | 567 | 61 | `(55.15,475.4)` | 47×41 | up=564；over/down=566 | 同 418 |
| `btn_cw` | 573 | 64 | `(91.35,472.65)` | 47×46 | up=570；over/down=572 | 同 418 |

五按钮都没有独立 disabled character。P2 舞台坐标由 `RoleInfo` 父级 `x=920, scaleX=-1` 与 `RoleInfo.as:105-133` 的子件水平反转共同导出；实现不得简单复制 P1 左下坐标，也不得把方向键交给 P1。

#### `SetMenu` 371 显示列表

| 实例 | character | depth | 注册坐标 | 状态/动态规则 |
| --- | ---: | ---: | ---: | --- |
| 全屏底层 | 332 | 2 | `(0,0)` | 940×590 覆盖层 |
| `btn_x` | 337 | 3 | `(597.95,102.95)` | up/down/hit=334；over=336 |
| `btn_continue` | 342 | 5 | `(415.05,139.1)` | 338/339/340/341 = up/over/down/hit |
| `btn_back_selectmap` | 347 | 8 | `(415.5,221.95)` | 343/344/345/346 |
| `btn_help` | 351 | 11 | `(415.35,263.7)` | up=348；over/down=349；hit=350；over 上移 2px |
| `btn_back_menu` | 355 | 14 | `(402.6,345.15)` | up=352；over/down=353；hit=354 |
| `btn_sound_open` | 359 | 17 | `(414.85,180.3)` | up=356；over/down=357；hit=358 |
| `btn_sound_close` | 362 | 20 | `(414.85,180.2)` | up=360；over/down/hit=361 |
| `huazhi` | 366 | 22 | `(521.1,303.9)` | frame 1/2/3 显示 `x1/x2/x4` |
| `btn_huazhi` | 370 | 24 | `(402.6,303.65)` | up=367；over/down=368；hit=369 |

声音开/关按钮占同一位置，由 `SoundManager.soundStay` 决定互斥可见。`SummonMonsterSpeed` 只允许 `1 → 2 → 4 → 1`。

#### `Help` 444 动态 child

| frame | 底层 | 动态/按钮 |
| --- | --- | --- |
| 1 | character 432，940×590“操作指南” | `actionHelp` 436 depth 2 `(104.1,558.7)`；`achivePet` 440 depth 5 `(223.05,558.95)`；`btnback` 441 depth 8 `(848.7,11.35)` |
| 2 | depth 1 替换为 character 443，“捕捉宠物”图解 | 三按钮保留；返回只移除 Help，不关闭 SetMenu |

#### 页面根关系

| 入口 | 页面根 | 添加位置 | owner |
| --- | --- | --- | --- |
| 设置 | OtherMat1 371 `SetMenu` | `RoleInfo.parent` | 全局设置/关卡路由 |
| 技能 | OtherMat1 250 `BuySkill` | `GMain.mainSence` | 默认 P1，页内可选 P1/P2 |
| 背包 | backpack1 304 `BackPack` | `RoleInfo.parent` | 点击 HUD 的 `rn` |
| 法宝 | backpack1 596 `SutraInterface` | `RoleInfo.parent` | 点击 HUD 的 hero |
| 宠物 | pet1 932 `PetInterface` | `RoleInfo.parent` | 点击 HUD hero 的 `User` |

### 3.4 可观察行为合同

| 入口 | pointer | shortcut | owner | 打开门禁 | 再次触发 | 关闭返回 |
| --- | --- | --- | --- | --- | --- | --- |
| 设置 | P1/P2 HUD 都有 | P1 Esc；P2 无 | 全局 | 无关卡/死亡门禁 | `closesetmenu` | 继续/×回原战斗；返回地图销毁战斗并按 `whichlastworld` 路由；返回主菜单销毁模式 |
| 技能 | P1/P2 HUD 都有 | P1 V；P2 num `*` | 默认 P1，页内选择 | `stage 0 level 2` 禁止 | `closeBuySkill(state=gameing)` | 返回原战斗并刷新 HUD 技能 |
| 背包 | P1/P2 HUD 都有 | P1 C；P2 num `/` | 对应 `rn` | `stage 0 level 2`、stage 16、hero dead 禁止 | `closeBackpack` | 返回原战斗 |
| 法宝 | P1/P2 HUD 都有 | P1 N；P2 无 | 对应 hero | 与背包相同；另要求已装备 `zbfb` | `closefb` | 先重算该 hero 法宝装备，再回原战斗 |
| 宠物 | P1/P2 HUD 都有 | P1 B；P2 num `-` | 对应 User | `stage 0 level 2`、stage 16 禁止；无 hero dead 检查 | `closePetInterface` | 返回原战斗 |

全局互斥合同：

- 同一时刻只允许一个功能页；打开时不会显示原版跨页导航。
- 已暂停时按“其他页”快捷键只派发那个其他页的 close event，当前页没有监听者，因此不切页。
- Escape 在背包/技能/宠物/法宝打开时不会通用关闭当前页；它只尝试关闭 `SetMenu`。
- 各页面自己的关闭按钮和同页快捷键才是确定返回路径。
- 原版没有独立 disabled 帧、busy 提示或现代通用 toast；拒绝反馈只保留 AS3 明确存在的死亡/未装备法宝提示。

### 3.5 现代实现映射与差异矩阵

| 合同 | 当前现代事实 | 必须整改 |
| --- | --- | --- |
| settings | `FeatureUiPages` 不含 settings | 建立独立全局 settings session/page，复用已批准的全局设置持久化 owner，但不得冒充地图 `gameSetting` 148 |
| HUD pointer | 正式关卡仅安装键盘 bridge；没有 574 五按钮 pointer 层 | 接入 549/555/561/567/573 原状态和共享 hit，P2 按 920 镜像 |
| 页面外壳 | `FeatureUiScene` 画现代暗层、标题、边框、五个通用页按钮和通用关闭 | 删除关卡内可见通用 host；直接呈现各页原根，不用现代层覆盖真 UI |
| 跨页 | overlay 内快捷键和通用按钮调用 `switchFeatureUi()` | 改为原版单页门：其他快捷键不切页，同页快捷键关闭 |
| Escape | 当前关闭任意功能页 | 只负责 settings toggle；其他页按原关闭按钮/同页快捷键 |
| 技能 owner | P2 `*` 直接创建 owner=p2 session | 原版默认 P1；页内 selector 才切 owner。若保留现代直接 P2 作为可访问性例外，须先取得用户批准 |
| P2 法宝 | 无 P2 键，符合原版；但无 P2 HUD pointer | 保留“无 P2 快捷键”，补 P2 HUD pointer 与 P2 装备门禁 |
| workshop | 现代关卡 host 可见 workshop 页按钮 | 从关卡五入口移除；地图工坊入口不受影响 |
| 门禁 | bridge 不检查特殊关卡、死亡或 `zbfb` | 按五入口合同集中检查，不在各 Stage 复制 |
| 暂停 | 统一 pause origin scene | 战斗 origin 保留完整暂停；设置返回地图/主菜单必须走明确销毁/路由，不得无条件 resume |

现代设置状态可复用 `TASK-SLICE-155C` 已批准的 `zaixu-global-settings-v1`，但这是“跨应用重启”的现代例外；原版 `SetMenu.doSaveGame()` 未被调用，`soundStay/SummonMonsterSpeed` 在本证据中只证明为会话级全局值。

### 3.6 双重验证计划

确定性测试：

1. 五入口 key/pointer 共用同一 router；P1/P2 owner 不串线。
2. P2 `*` 的默认技能选择、P2 无法宝/设置快捷键、P2 HUD 法宝 pointer 分别覆盖。
3. 特殊关卡、死亡、无 `zbfb` 和宠物“死亡不拦截”的非对称门禁逐项覆盖。
4. 单页 busy、同页 toggle、其他页不切换、Escape 只切 settings、关闭只恢复原 origin。
5. settings 声音互斥、出怪速度三值循环、帮助两帧、继续/返回地图/返回主菜单路由覆盖。
6. Stage 1-1/1-2/1-3、Stage 2-1/2-2 只调用共享入口 owner，不复制状态机。

运行观察：

1. 940×590 单人 P1 与双人 P1/P2 HUD，五按钮 normal/hover/pressed 和 P2 镜像并排或叠图。
2. 五入口逐一打开/同键关闭；打开后世界、怪物、projectile 与玩家输入保持暂停，关闭后只恢复原关卡。
3. 背包/技能/宠物/法宝直接显示各自原生根，无现代 host 标题、边框、页按钮或 workshop。
4. settings 371 normal、声音开/关、x1/x2/x4、Help frame 1/2、继续/地图/主菜单逐状态验收。
5. 记录字体栅格化容差、按钮边缘差异和每个可见对象的“原资源复用 / 等价动态字段 / 已批准现代例外 / 未完成”。

## 4. 原版视觉基准与现代例外

原版基准：

- `.../sprites/DefineSprite_574_export.RoleInfo/1.png`：P1 574 默认 HUD，940×590。
- `.../sprites/DefineSprite_371_export.setmenu.SetMenu/1.png`：371 设置 normal，940×590。
- `.../buttons/DefineButton2_<id>/1_up..4_hittest.png`：13 个入口/设置按钮四状态。
- `.../help/DefineSprite_444_export.Help/1.png` 与 `2.png`：帮助两帧，940×590。
- 背包/技能/宠物/法宝根基准继续引用 `full-function-ui-index.md` 和各专项 UI 索引。

允许的现代视觉例外：

- 已批准：全局设置跨应用重启；原版不保存该页值。
- 已批准：键盘可访问性可以补焦点语义，但不得新增可见通用按钮或改变原键位。
- 已确认原版边界：P2 没有法宝/设置快捷键；这不是需要“修复”的缺陷。
- 未批准：P2 `*` 直接默认 P2、通用 Escape 关闭、关卡跨页导航、现代 host 暗层/标题/边框、战斗 workshop 入口。实现不得默认保留。

## 5. 未知、反证与关闭判断

- 原版运行 EXE 未在本任务执行；P2 最终合成画面由 `GameInfo/RoleInfo` 矩阵与原 SWF 574 渲染交叉确认。实现时仍须在同舞台按公式生成 P2 基准并做叠图。
- 原版联机 room/host 的“不暂停”分支不属于用户要求的本地双人范围，不进入现代实现。
- `SetMenu` 私有 `intoStopGame()` 与 `doSaveGame()` 都没有调用点，不能据函数名伪造额外保存或暂停时序。
- Help 444 已闭合两帧根与三个按钮；不要求在本 task 逆向其画面中每一段静态美术的内部 shape，因为现代实现应选择性复用整帧并保留三按钮独立命中。
- 影响本地正式关卡实现的 owner、暂停、门禁、互斥、返回和 Symbol 未知为零；运行像素差异属于后续实现/校准 task 的双重验证，不反向冒充本逆向已复现。

## 6. 2026-08-03 pointer 运行校准

`TASK-SLICE-165A` 保留 574 的 549/555/561/567/573 独立皮肤、418 固定命中区、P1/P2 镜像和原门禁，只把五个可见按钮与透明命中区统一接到场景级 pointer-up 路由。确定性测试逐项锁定 P1 五坐标、P2 `920 - x` 镜像、对象名、命中范围和关闭时 listener 清理。

940×590 `?qaStage=1-1-role1` 运行验收真实点击设置、背包、技能、法宝、宠物五个 P1 HUD 按钮；四功能页和 371 设置均可见，原关闭控件返回同一关卡，console warning/error 为 0。运行中额外发现设置入口先 `launch` 再暂停 origin 会让 `StageSettingsScene.create()` 的会话检查自停并留下透明冻结；现代映射现改为先暂停 origin 再 launch，顺序防回归已加入专项测试。允许的现代视觉例外仍为空。

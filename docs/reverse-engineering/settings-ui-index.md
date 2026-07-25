# 天庭地图设置 overlay 逆向索引

本文闭合 `TASK-SETTINGS-066C` / `GOAL-043`。目标是为 `TASK-SLICE-155C` 提供 character 148 设置 overlay 的权威实现输入；不实现现代页面，不把现代跨重启持久化写成原版事实。

## 待证明的可观察问题

1. 五行标签、动态值和关闭按钮分别由哪些原 Symbol、depth、坐标、字体与命中区组成。
2. normal、hover、pressed 和循环后的值如何变化；“恢复默认”是否真正修改状态。
3. overlay 如何进入、阻挡底层、关闭、重复打开并恢复当前会话值。
4. 难度、背景音乐、技能音效和画面质量由谁持有，是否按 P1/P2 分 owner，是否进入原版存档。
5. 现代版在用户已确认“浏览器本地、跨重启正式旅程”的范围下，如何保存设置而不污染 V6 玩家存档 owner。

## 证据入口

- 恢复视觉源：`local-resources/regima/source/restored-swfs/assets/StageCommon.swf`。
- 根视觉基准：`local-resources/regima/task-outputs/task-settings-066-map-services/png|svg/settings/DefineSprite_148_export.setmenu.gameSetting/1.*`。
- 深层派生：`local-resources/regima/task-outputs/task-settings-066-map-services/deep-settings/StageCommon.xml` 与 `buttons/DefineButton2_144/combined.svg`。
- 页面局部：`[172845].swf/scripts/export/setmenu/gameSetting.as`。
- 共享运行时：`config/Config.as`、`manager/SoundManager.as`、`base/BaseEffect.as`、`export/MapMenu.as`。
- 存档反证：`user/User.as#getSaveObj()`；其字段全集不包含设置、难度或声音字段。

`[25034429].swf` 仅保留备份版本；本页视觉存在性、character、显示列表与几何只以恢复的 `StageCommon.swf` 为准。

## 原版视觉基准

- 舞台与裁切：940×590。
- 根 Symbol：character 148，`export.setmenu.gameSetting`，1 帧。
- character 134 提供 940×590 overlay：中央 `(320.05,122.65)`、326×341 为原面板图；面板外仍有全舞台透明填充，Flash 命中测试会使 overlay 成为底层地图之上的模态层。
- 原根 PNG 是未执行 AS3 的时间轴基准，所以五个动态值都显示 character 145 的占位文字“示 例”；运行时 `ADDED_TO_STAGE` 会把前四项刷新为真实值，但不会刷新第五项。
- 当前没有现代设置页，因此本 task 保存原 SWF normal/按钮状态和可组合的动态文字状态。原版/现代同尺寸并排、叠图、像素/边缘差异和最终对象差异清单由 `TASK-SLICE-155C` 完成；现代截图不得反向充当原版基准。

## 根显示列表

character 148 无 mask、filter、blend、alpha、rotation 例外。坐标均为 940×590 舞台坐标；动态值 wrapper character 146 为 104×34.1，内含 `txt` character 145，局部 `(2,2)`。

| depth | 实例 / character | 坐标与边界 | 状态 / 数据来源 |
| --- | --- | --- | --- |
| 1 | overlay 背景 134 | `(0,0)`，940×590；中央面板 326×341 | 面板外透明填充仍属于原显示对象命中面 |
| 3 | 静态“游戏难度：” 136 | `(364.85,196.8)`，约 139.6×36.4（x scale 1.019455） | 方正粗圆_GBK、22px、白色、居中 |
| 4 | 静态“背景音效：” 137 | `(384.05,244.3)`，129×36.4 | 同上；原图文字是“背景音效”，代码字段名为 `bgmStay` |
| 5 | 静态“技能音效：” 138 | `(352.85,290.1)`，123.3×36.4 | 同上 |
| 6 | 静态“画面质量：” 139 | `(352.85,339.05)`，123.3×36.4 | 同上 |
| 7 | `xClick` 144 | `(590,131.95)`，组合边界 40×42 | 原 DefineButton2，详见下节 |
| 9 | `difficulty` 146 | `(501.4,192.8)`，104×34.1 | `gc.difficulity` → 普通/困难/地狱 |
| 11 | `bgmStay` 146 | `(501.4,237.9)`，104×34.1 | `SoundManager.bgmStay` → 开启/关闭 |
| 13 | `skillStay` 146 | `(501.4,286.1)`，104×34.1 | `SoundManager.skillStay` → 开启/关闭 |
| 15 | `quality` 146 | `(501.4,334.9)`，104×34.1 | `gc.frameClips` 30/24/20 → 高/中/低 |
| 17 | 静态“默认音量：” 147 | `(352.55,387.65)`，123.3×36.4 | 方正粗圆_GBK、22px、白色、居中 |
| 18 | `defaultVol` 146 | `(500.4,383.65)`，104×34.1 | 保持时间轴占位“示 例”；原代码没有对应状态值 |

### 动态值 character 146

- `txt` 为 character 145，局部 `(2,2)`；字段原边界 `(-2,-2)..(102,32.1)`，因此 wrapper 命中/可见边界为 104×34.1。
- 字体为方正粗圆_GBK、25px、白色、左对齐、嵌入轮廓；`ADDED_TO_STAGE` 再把字体改为 `AllConsts.GAME_CONFIG_FONT`。
- 五个 wrapper 都设 `buttonMode=true`，监听 `ROLL_OVER`、`ROLL_OUT` 和 `CLICK`。
- hover 只把 `txt` 从白色 `#ffffff` 改为黄色 `#ffff00`；roll out 恢复白色。
- 没有 `MOUSE_DOWN/MOUSE_UP`、独立 pressed frame、scale 或位移，因此按住时视觉与当时 hover 状态相同；click 后只刷新文字，指针仍在上方时保持黄色。
- 没有 selected/disabled 状态，也没有额外动态 child。

### 关闭按钮 character 144

| 状态 | 原 child | 局部矩阵 / 边界 | 可见合同 |
| --- | --- | --- | --- |
| up | shape 141 | `(0,-2)`；shape 原 bounds `(0,2)..(40,42)` | 可见 40×40，较 down 上移 2px |
| over | shape 143 | `(0,0)`；bounds `(0,0)..(40,40)` | 独立红叉 hover 图 |
| down | shape 141 | `(0,0)` | 原 up 图下移 2px |
| hittest | shape 141 | `(0,0)`；有效 bounds `(0,2)..(40,42)` | 40×40 命中形状，舞台约 `(590,133.95)..(630,173.95)` |

按钮没有 action tag；实际关闭行为来自 `gameSetting.xClickHandler()`。

## 可观察行为合同

### 进入、overlay 与关闭

- `MapMenu.huodongClick()` 每次创建新的 `export.setmenu::gameSetting`，命名为 `gameSetting`，直接 `gc.stage.addChild()`；不经过 `GMain.mainSence`，也不切换地图场景。
- character 134 的全舞台透明填充使 overlay 位于地图之上并拦截底层指针；设置页本身没有暗罩、暂停标志或 P1/P2 owner。
- 加入舞台时绑定关闭和五行事件、统一字体并调用 `refreshTxt()`；移除时解除全部监听，并移除自身的 added/removed 监听。
- 点击右上红叉只从父级移除当前 overlay；不保存、不重置、不切场景，也不发业务事件。
- 关闭后地图仍是原实例。再次点击地图入口会创建新 overlay；`refreshTxt()` 从共享会话 owner 读回前四项当前值，因此关闭/重开不丢会话修改。由于 overlay 覆盖全舞台，正常指针路径不能在它打开时再次点击底层设置入口叠加第二份。

### 五项点击与循环

| 行 | 初始值 | 点击循环 / 副作用 | 提示 |
| --- | --- | --- | --- |
| 难度 | `gc.difficulity=0` → “普 通” | `0→1→2→0`，显示“困 难/地 狱/普 通” | “关卡难度已改变” |
| 背景音效 | `SoundManager.bgmStay=true` → “开 启” | true→false 时停止 loop、清空 `playing`；false→true 时播放 `begin` 并设音量 1 | “已关闭/已开启背景音乐” |
| 技能音效 | `SoundManager.skillStay=true` → “开 启” | `true↔false`；`SoundManager.play()` 的技能音效分支据此门禁 | “已开启/已关闭技能音效” |
| 画面质量 | `gc.frameClips=30` → “  高” | `30→24→20→30`，同时立即写 `gc.stage.frameRate` | “画质设置为：高/中/低” |
| 默认音量 | 时间轴“示 例” | click 只执行 `refreshTxt()`；该函数不写本字段，也不改任何声音状态 | “开启游戏时默认 示例 音量” |

“恢复默认”在该版本并不存在可达的恢复逻辑：字段名 `defaultVol`、标签“默认音量”和提示文字都与“恢复默认”不一致，但它确实是无状态死控件。现代实现不得擅自把它改成“恢复所有默认值”并称为原版行为。

### 共享消费者与会话边界

- 难度是全局 `Config.difficulity`，不是玩家字段。怪物、玩家、宠物和弹体的多个共享战斗分支读取 1/2；地图返回主菜单与读取/新建槽流程会显式把它重置为 0。
- `frameClips` 是全局逻辑帧率基准；怪物刷新、Buff/技能计时等共享系统按它换算时长。设置页同步写 Stage `frameRate`，`BaseEffect.stopSlowDown()` 也恢复到当前 `frameClips`。
- `bgmStay/skillStay` 是 `SoundManager` 静态会话字段，默认 true。背景开关还控制当前循环声道；技能开关控制 `SoundManager.play()` 的技能/动作音分支。
- 四项都没有 P1/P2 切换，双方共享同一会话设置。
- `User.getSaveObj()` 字段全集没有 `difficulity/frameClips/bgmStay/skillStay/defaultVol`；原版设置不进入玩家存档，重启进程回到类/字段默认值。

## 现代持久化裁决与映射

- **原版事实**：设置是会话级、全局、非 P1/P2、非存档字段。
- **用户已确认的现代例外**：当前功能线明确要求浏览器本地存档和最终跨应用重启正式旅程；设置页实现因此可以跨重启保持用户选择，但必须在交付中标为现代例外。
- **现代设计选择**：设置应使用单独的全局 localStorage key/codec，而不是写入 V6 六槽或 `player1/player2`。这保持“全局会话 owner”语义，也避免修改既有 V6 玩家 schema；清除/损坏时回退为普通、BGM 开、技能音效开、30 FPS。
- 第五个死控件默认必须保留原显示与无状态行为。若产品希望把它修成真正的“恢复默认”，需要新的用户批准、可见文案/行为例外和独立实现验收，不能由 `155C` 静默扩张。
- 默认零新增可见现代覆盖层。不得添加现代标题、暗罩、通用按钮、额外存档提示、P1/P2 选择器或替换文字。

## 六段证据矩阵

| 行为合同项 | 局部证据 | 共享调用链 | 几何/坐标证据 | 等级 | 未知 / 反证 | 验证 |
| --- | --- | --- | --- | --- | --- | --- |
| 入口/overlay/关闭 | `gameSetting.__added/__removed/xClickHandler` | `MapMenu.huodongClick` → `gc.stage` | 148/134/144，940×590 与全屏透明命中面 | 交叉确认 | 无 | 正式入口、底层阻挡、关闭/重开专项 + 940×590 往返 |
| 五行显示列表 | `list` 与 `refreshTxt` | `Config` / `SoundManager` | 136..139/147 静态文字，146/145 动态字段、depth/矩阵/字体 | 交叉确认 | 无 | child/depth/几何静态门禁 + normal 截图 |
| hover/pressed | `react()` 只监听 roll over/out | 五个 wrapper 共用同一处理器 | 146 wrapper 104×34.1；白/黄嵌入文字 | 交叉确认 | 无独立 pressed/selected 图 | hover、按住、移出逐状态截图/叠图 |
| 难度循环 | `__setProp_difficulty_` | 战斗共享消费者读取 `gc.difficulity` | `difficulty` 字段槽位 | 交叉确认 | 无 | 0→1→2→0 值/提示测试 |
| 背景音效 | `__setProp_bgmStay_` | `SoundManager.loopChannel/play/clearLoop` | `bgmStay` 字段槽位 | 交叉确认 | 真音频内容不属于本 UI task | 开/关/重开状态与循环声道测试 |
| 技能音效 | `__setProp_skillStay_` | `SoundManager.play()` 门禁 | `skillStay` 字段槽位 | 交叉确认 | 无 | 开/关/重开状态与音效门禁测试 |
| 画面质量 | `__setProp_quality_` | `Config.frameClips`、Stage.frameRate、`BaseEffect` | `quality` 字段槽位 | 交叉确认 | 浏览器不必复制 Flash 全局逻辑 tick 架构 | 30→24→20→30 与有效渲染档测试 |
| 默认音量死控件 | `__setProp_defaultVol_` 与 `refreshTxt` 反证 | 没有共享状态写入 | 147 + `defaultVol` 146，原导出“示 例” | 交叉确认 | 若改成恢复默认属于新产品裁决 | 点击前后状态不变 + 原提示测试 |
| 会话/存档 | 四个运行时 owner | `User.getSaveObj` 字段全集反证；主菜单/读档重置难度 | 不适用：数据边界 | 交叉确认 | 原版重启运行观察缺失，但字段默认与存档反证一致 | 会话关闭重开保持；原版/现代重启边界分别测试 |
| 现代跨重启 | 不适用 | 当前线用户确认范围 + 现有 V6/player owner | 不新增可见对象 | 现代设计选择 | 必须保持独立全局 key，不改 V6/player schema | codec 损坏回退 + 六槽互不串改 + 应用重启 |

## 实现验收输入

`TASK-SLICE-155C` 至少验证：

1. 940×590 normal，前四项使用真实值、第五项保持原死控件显示。
2. 五行各自 white/yellow hover、按住无额外 pressed 图、移出恢复白色。
3. 难度 3 态、两声音 2 态、质量 3 态的完整循环和提示。
4. 关闭、返回原地图、再次打开保持值；打开时底层地图按钮不可穿透。
5. 会话设置全局共享、与 P1/P2 和六槽 V6 数据隔离。
6. 用户批准的全局本地设置跨应用重启保持，损坏数据安全回默认；不把此行为写成原版存档事实。
7. 原版/现代同尺寸并排或叠图、稳定区域像素/边缘差异、字体栅格容差和逐对象差异清单。

## 当前判定

- character 148/134/136..147 的完整显示列表、关闭按钮四状态、五行命中/hover/pressed、全部循环、副作用、死控件、overlay 生命周期、会话 owner 和原版非存档边界均已闭合。
- 影响 `TASK-SLICE-155C` 的原版事实未知为零。
- 跨重启保存是用户已确认范围下的现代例外；采用独立全局 localStorage owner，不新增 V6/player schema。把死控件改成真正恢复默认仍未获批准，默认禁止。

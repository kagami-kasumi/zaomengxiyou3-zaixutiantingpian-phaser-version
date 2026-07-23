# 技能四页原生 UI 证据索引

本文是 `TASK-SETTINGS-061` 的权威交接产物，供 `TASK-SLICE-143` 直接消费。范围只含：

- 技能总页 `export.shop.BuySkill` / character 250。
- 主动技能页 `export.shop.SkillControl` / character 868。
- 五槽绑定页 `export.shop.SkillSetControl` / character 417。
- 被动技能页 `export.shop.PassiveSkillControl` / character 213。

目标是闭合原版显示列表、按钮状态、命中区、动态槽位、owner/返回和现代实现差异，不在本任务修改 `src/` 或重做技能业务。

## 1. 证据源与可信边界

视觉源包：

- `local-resources/regima/source/restored-swfs/assets/OtherMat1.swf`
- SHA-256：`97478E1E03A22C7D06197FFB75AB890D98B084377CBDCF394716CBAF27082126`
- 原舞台：940×590。
- 调查工具：FFDec 26.0.0；只读 `dumpSWF`、SymbolClass、选择性 SVG/脚本导出。

行为源：

- `local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts/export/shop/BuySkill.as`
- 同目录 `SkillControl.as`、`SkillSetControl.as`、`PassiveSkillControl.as`
- 同包 `scripts/export/RoleInfo.as`、`scripts/my/KeyBoardControl.as`、`scripts/user/User.as`
- 恢复包补导出的 `export.shop.PassiveSkill` AS3/P-code；本地派生路径见下方基准清单。

证据等级：

| 等级 | 含义 | 本文用法 |
| --- | --- | --- |
| A | 恢复 SWF 的 tag、SymbolClass、选择性帧/按钮导出或同包 P-code | 几何、depth、时间轴、按钮态、TextField、被动行公式 |
| B | 与目标版本对应的反编译 AS3，共享 owner/入口/保存消费者可交叉确认 | 动态 addChild、切页、拖放、升级、返回 |
| C | 现代实现或既有文档，仅用于差异/映射，不证明原版 | `FormalSkillPageView/System`、现有 public SVG |

反证边界：

- public 下四张技能 SVG 是当前帧的扁平导出，不包含按钮四态、角色选择器两帧、主动图标三帧或动态 addChild；不能单独证明页面原生化。
- FFDec SVG 为内容边界裁切时会加负向平移。本文记录的坐标均为 SWF 舞台坐标；实现不得把裁切平移当运行时父级矩阵。
- 原版没有现代的全屏暗层、900×548 外框、顶部 P1/P2 文字按钮、四个顶部 tab、永久摘要或“绑定到选中槽”按钮。

## 2. 可复现的原版视觉基准

四页默认态的精确 SWF 帧基准：

| 页面 | 入口 / 帧 | 原舞台与内容边界 | 基准 |
| --- | --- | --- | --- |
| 总页 250 | 地图 `showBuySkill`、P1 `V`、P2 num `*`；frame 1 | 940×590，根不裁切 | `local-resources/regima/task-outputs/task-settings-058-ui/svg/skill-page/DefineSprite_250_export.shop.BuySkill/1.svg` |
| 主动页 868 | 总页默认加入；frame 1 | 舞台坐标内容约 `x=34..922, y=84..509` | `local-resources/regima/task-outputs/task-settings-058-ui/svg/skill-subpages/DefineSprite_868_export.shop.SkillControl/1.svg` |
| 绑定页 417 | 已学习技能的“设置”按钮；frame 1 | 舞台坐标内容约 `x=208..714, y=110..466` | `local-resources/regima/task-outputs/task-settings-058-ui/svg/skill-subpages/DefineSprite_417_export.shop.SkillSetControl/1.svg` |
| 被动页 213 | 总页底部被动标签；frame 1 | 舞台坐标内容约 `x=116..862, y=83..512` | `local-resources/regima/task-outputs/task-settings-058-ui/svg/skill-subpages/DefineSprite_213_export.shop.PassiveSkillControl/1.svg` |

逐状态基准位于 Git 忽略的
`local-resources/regima/task-outputs/task-settings-061-skill-native/`：

- `sprites/`：196 个 SVG，覆盖 212 被动行 frame 1..5、五种角色选择器 frame 1..2、五个绑定键槽 frame 1..2、50 个主动技能图标 frame 1..3、主动主时间轴 865 frame 1..10。
- `buttons/`：7 个 `DefineButton2` combined SVG，character 207/240/244/248/337/580/638。
- `as3/scripts/export/shop/PassiveSkill.as` 与 `pcode/.../PassiveSkill.pcode`：从恢复 `OtherMat1.swf` 定向补导，证明被动行帧与动态字段规则。

这些基准固定来自上述 SHA-256 源包；重新生成时只允许写新 task-output，不覆盖恢复源或 legacy extraction。

## 3. 六段证据链

| 链段 | 原版事实 | 现代实现输入 | 证据 |
| --- | --- | --- | --- |
| 入口 | 地图 `showBuySkill`；战斗 P1 `V`、P2 num `*` | 保留现有 `FeatureUiHost` 和 owner 路由 | `KeyBoardControl`、地图入口、现有正式 host |
| 局部对象 | 250 容纳 868/213，868 可打开 417；四页及按钮/图标均在 `OtherMat1.swf` | 以原 Symbol/帧族重建，而非只放四张扁平背景 | SymbolClass、dumpSWF、选择性 SVG |
| 共享 owner | `BuySkill` 创建角色选择器并把具体 `User` 传给子页；字段/事务都写该 User | 继续由现有 model 的 P1/P2 owner 提供数据，视觉改用原角色选择器 | `BuySkill`、各 `setRole`、`User` |
| 几何/坐标 | 下列 display list、嵌套矩阵、注册点、hitTestObject 均为 940×590 舞台坐标 | Phaser 根容器保持 `(0,0)`；不可按导出裁切中心重排 | SWF PlaceObject / SVG transform |
| 可观察状态 | 按钮 up/over/down、角色 selected、图标锁定/可学/已学、P1/P2 键槽、拖放/升级反馈 | 使用对应原帧；透明交互只绑定原命中边界 | Button2、MovieClip 帧、AS3 事件 |
| 生命周期/保存 | 子页在总页内 remove/add；绑定关闭时才提交；升级立即改 User/灵魂；总页返回恢复来源 | 保留现有 V4 owner/save，提交时机按原版可观察合同 | `BuySkill`、`SkillSetControl`、`PassiveSkill`、现有 system |

所有影响 `TASK-SLICE-143` 可见实现的链段均有 A/B 级证据；无阻塞性未知。

## 4. 技能总页 250 显示列表

根容器 940×590，单帧；根/子对象无额外 scale、alpha、blend、filter 或 mask。

| depth | character / 名称 | 舞台矩阵与边界 | 类型 / 合同 |
| ---: | --- | --- | --- |
| 2 | 236 | `(0,0)`，940×590 | 静态整页底图与烘焙中文字 |
| 3 | 240 `btnback` | `(853.3,23.35)`，hit 84×31 | 返回按钮 |
| 5 | 244 `activebtn` | `(62.4,555.95)`，hit 81×25 | 主动页标签 |
| 8 | 248 `passivebtn` | `(163.25,555.95)`，hit 79×24 | 被动页标签 |
| 11 | 249 `txtlh` | `(805.95,544)`，约 135×31.7 | 动态灵魂值；初始占位 `9999999999`，运行时写当前 User 灵魂 |
| 动态 | `SelectWK/TS/SS/BJ/BL` | `x=50+(i-1)×90, y=14.85` | 按玩家实际角色创建；frame 1 普通、frame 2 选中；当前 owner 自动选中 |
| 动态 | `playerControl` | `(0,0)` | 868 或 213；切页前按 name 移除旧子页 |

`txtlh` 使用源 SWF 的嵌入字形/`FZCuYuan-M03` TextField 格式。实现可用现代文字渲染数值，但必须限制在 249 的原矩形、层级和颜色/对齐基准中，不能另画摘要。

角色选择器不是“P1/P2”通用文本按钮；视觉由所选英雄对应的 218/223/228/233/871 两帧资源承担。双人同角色仍由两个 owner 会话决定数据，原视觉不提供额外编号。

返回：

- 来源为 `gameing`：恢复游戏并派发 `InGameBuySkillOver`。
- 来源为 `maping`：派发 `SelectOver`。
- 随后从父容器移除技能页。

## 5. 主动页 868 显示列表

868 为单帧子页；其 PlaceObject 已处于 940×590 舞台坐标，不需要把导出裁切平移加回运行时。

| depth | character / 名称 | 舞台位置与边界 | 运行时内容 |
| ---: | --- | --- | --- |
| 7 | 576 | 静态底图 | 烘焙标题/装饰 |
| 8 | 577 | `(837,91.65)`，约 87.05×28.1 | 源页静态文字对象；不得用现代标题覆盖 |
| 9 | 580 `upGradebtn` | 树一 `(136.95,191.35)`；树二 y=`391.35`；48×28 | 心法升级；心法到 5 隐藏 |
| 11 | 581 | 静态形状 | 原页装饰 |
| 12 | 582 `leveltxt1` | `(129.95,228.2)`，约 55.05×20.85 | 心法一等级 |
| 13 | 583 `lhtxt1` | `(162.95,255.2)`，约 78.05×20.85 | 下一级灵魂成本 |
| 14 | 584 | 静态形状 | 原页装饰 |
| 15 | 585 `leveltxt2` | `(130.95,427.15)`，约 55.05×20.85 | 心法二等级 |
| 16 | 586 `lhtxt2` | `(163.95,454.15)`，约 78.05×20.85 | 下一级灵魂成本 |
| 17 | 597 `xf1mc` | `(57.65,151)`，65×65 | 心法一选择器 |
| 19 | 608 `xf2mc` | `(57.65,351)`，65×65 | 心法二选择器 |
| 21 | 865 `mainskillmc` | `(648.45,317.2)` | 10 帧主技能树 |
| 62 | 866 `xfname1` | `(130.95,161.2)`，约 88.1×22.05 | 心法一名称 |
| 63 | 867 `xfname2` | `(129.95,361.2)`，约 83.1×22.05 | 心法二名称 |

字段由 `setRole` 写入：两心法等级、树名称以及下一等级成本
`100 / 200 / 500 / 1000 / 2000`。`xf1mc/xf2mc` 切换角色名对应的 selected label；`mainskillmc` 跳到 `${角色名}-${心法序号}` 标签。

### 5.1 主时间轴和技能映射

865 的 10 帧是五角色×两心法的稳定枚举：

| frame | 角色 / 心法 | skill1..5 |
| ---: | --- | --- |
| 1 | 悟空 / 1 | `slz`、`zz`、`sx`、`qsez`、`hmz` |
| 2 | 悟空 / 2 | `lys`、`hytj`、`lyfb`、`jdy`、`hyjj` |
| 3 | 唐僧 / 1 | `sgq`、`myhc`、`jgz`、`tjgl`、`jhsj` |
| 4 | 唐僧 / 2 | `blb`、`xbz`、`shy`、`sjt`、`smb` |
| 5 | 沙僧 / 1 | `dj`、`sd`、`rj`、`zznh`、`syzq` |
| 6 | 沙僧 / 2 | `ssp`、`jsp`、`dgq`、`xgq`、`tmc` |
| 7 | 八戒 / 1 | `zq`、`mbyj`、`wdww`、`jdz`、`mds` |
| 8 | 八戒 / 2 | `qlj`、`tkj`、`dzj`、`lybj`、`mmw` |
| 9 | 白龙 / 1 | `xlc`、`yyb`、`pkz`、`tlj`、`lysh` |
| 10 | 白龙 / 2 | `lxj`、`lxuanj`、`xkjz`、`jrjl`、`mlsz` |

frame 1 的完整嵌套基准：

- 609 背景位于 865 内 depth 6。
- `skill1..5` 舞台 x=`375.5`，y=`125.55 / 204.2 / 280.15 / 356.15 / 436.2`，边界约 65/66×65。
- `skillset1..5` character 638，舞台 x=`784.4`，y 约
  `145.65 / 227.65 / 299.65 / 379.7 / 455.5`，41×25。
- `upgrade1..5` character 580，舞台 x=`855.5`，y 约
  `145.65 / 224.65 / 299.65 / 376.7 / 455.5`，48×28。

其余帧的技能资源和细微矩阵以 `sprites/DefineSprite_865*/1..10.svg` 为直接实现输入；不得假设十帧完全同构后自行均分。

### 5.2 主动技能可见状态与动态 child

每个 `skillN` MovieClip 有三帧：

1. locked：未开放。
2. unlocked：心法等级已覆盖，可点击学习。
3. learned：已学习，显示稳定 `skillicon_*` 图标。

`SkillControl` 先把全部技能重置到 frame 1，再把索引不超过心法等级的槽切到 frame 2 并绑定点击；已学习技能切到 frame 3。已学习图标动态 `addChild(TextField)`：

- name 与所在 slot 相同。
- 局部坐标 `(35,48)`。
- 文本 `LV.n`。

每个已学习技能旁的 638 打开绑定页；未学习时点击无效。每个 580 执行技能升级；roll-over 会在该按钮 `localToGlobal` 位置向 stage 添加共享 `SayInfo`，文字为“升级需要 X 灵魂”，roll-out 移除。树升级和技能升级的成功/拒绝反馈同样使用共享瞬时提示层，不存在页面底部永久摘要。

## 6. 绑定页 417 显示列表与拖放合同

| depth | character / 名称 | 舞台位置 | 合同 |
| ---: | --- | --- | --- |
| 3 | 388 | 静态背景 | 506×356 原模态视觉 |
| 4 | 337 `x_btn` | 注册点 `(680.45,137.05)`，可见/命中约 40×44 | 关闭、提交并返回主动页 |
| 6 | 393 `Ymc` | `(230.95,339)`，76×76 | P1 Y / P2 8 |
| 8 | 398 `Umc` | `(324.95,339)`，76×76 | P1 U / P2 4 |
| 10 | 403 `Imc` | `(416.95,339)`，76×76 | P1 I / P2 5 |
| 12 | 408 `Omc` | `(509.95,339)`，76×76 | P1 O / P2 6 |
| 14 | 413 `Lmc` | `(602.95,339)`，76×76 | P1 L / P2 3 |
| 16 | 416 `sourcemc` | `(416.95,228)`，76×76 | 当前待绑定技能 |

P1 键槽显示 frame 1，P2 显示 frame 2；显示位置仍是 Y/U/I/O/L 五槽，实际 P2 键值是 8/4/5/6/3。

动态显示列表：

- source：在 `sourcemc + (5,5)` 添加技能 `imgSprite`，并添加 character 422 `highlight`。
- 当前绑定：每槽在 `slot + (5,5)` 添加 `initsprite${key}` 技能图标；其内部再添加对应 `Skill_${实际键}` 键帽，位置为技能图标 `width/2+12, height/2+12`。
- 拖动：source `startDrag()`；mouseup 用 `hitTestObject` 与五个 76×76 槽检测。命中后吸附到 `slot + (5,5)` 并记录键；未命中回到 `(ox,oy)`。
- 放置后在技能图标内部添加 `ShowSkillKey`，位置约 `width/2+8`。
- `x_btn` 才提交：移除旧槽显示，已有占用者向后移动，当前技能 `unshift` 到目标键；随后移除绑定页。没有独立“提交”或“绑定到选中槽”按钮。

现代可访问等价边界：

- 保留拖放是最接近原版的指针路径。
- 可以同时支持“选中技能后点击原 76×76 键槽完成放置”和键盘 focus/Enter；这是非视觉输入等价，不改变绑定顺序、提交时机或原命中几何。
- 不得为等价路径新增可见按钮、现代槽标签或外框。可访问名称、focus 语义、屏幕阅读器 live region 可为不可见元数据；若要显示 focus outline，属于候选可见例外，须先获用户批准。

## 7. 被动页 213 显示列表与字段

根静态背景 character 198。五个 character 212 行分别为：

| depth | 实例 | 舞台位置 | MovieClip frame |
| ---: | --- | --- | ---: |
| 2 | `pskill1` | `(124,144.95)` | 1 |
| 9 | `pskill2` | `(122,221.95)` | 2 |
| 16 | `pskill3` | `(122,304.95)` | 3 |
| 23 | `pskill4` | `(122,381.95)` | 4 |
| 30 | `pskill5` | `(122,460.95)` | 5 |

`PassiveSkill.added/setRole` 从实例名 `pskillN` 取第 7 个字符并 `gotoAndStop(N)`，所以行→帧不是推断。每帧使用不同的 199/208/209/210/211 背景，内部共同显示列表：

| depth | character / 名称 | 行内坐标 | 内容 |
| ---: | --- | --- | --- |
| 1 | 199/208/209/210/211 | 原点 | 对应五种被动的烘焙名称/装饰 |
| 2 | 201 `wantlh` | `(652.95,-0.95)`，约 79.95×30 | 下一等级灵魂：`skilllevel × 5000` |
| 3 | 202 `curslevel` | `(89,2.1)`，约 58×30 | 当前等级：`skilllevel - 1` |
| 4 | 203 `attvalue` | `(355.95,4.75)`，约 180×30 | 下一等级效果 |
| 5 | 204 `lastvalue` | `(172,4.1)`，约 166.95×30 | 当前等级效果 |
| 6 | 207 `btn` | `(567.95,-3.6)`，48×28 | 升级；到 10 级隐藏 |

五帧效果依次为：

1. 生命上限增加 `level×100`
2. 魔法上限增加 `level×100`
3. 暴击率增加 `level×1 %`
4. 每秒回血增加 `int(level×3)`
5. 每秒回魔增加 `int(level×1)`

等级不在 1..10 时效果字段显示 `----`。升级要求灵魂不少于
`skilllevel×5000` 且玩家等级/5 不小于 `skilllevel`；等级不足使用共享瞬时提示“需要 N 级才能升级”，灵魂不足只写 trace。达到 10 级后升级按钮隐藏。

## 8. 按钮与 selected 状态矩阵

| character / 用途 | up | over | down | hit / selected |
| --- | --- | --- | --- | --- |
| 240 返回 | 237，局部 y=-2，白 | 238，y=0，橙 | 237，y=0 | 239，84×31；无 selected |
| 244 主动标签 | 241，y=-2 | 242，y=0，橙 | 241，y=0 | 243，81×25；无 selected |
| 248 被动标签 | 245，y=-2 | 246，y=0，橙 | 245，y=0 | 247，79×24；无 selected |
| 580 心法/技能升级 | 579，y=-2 | 579，y=-2 | 579，y=0 | 可见边界 48×26；无额外透明 hit |
| 638 技能设置 | 637，y=-2 | 637，y=-2 | 637，y=0 | 可见边界 41×23 |
| 207 被动升级 | 206，y=-2 | 206，y=-2 | 206，y=0 | 可见边界约 48×26 |
| 337 绑定关闭 | 334/335/334 | over 图像局部向下约 6px | 同 up | 334 可见边界约 40×44 |
| 218/223/228/233/871 角色 | frame 1 | 无独立 hover/down | 无独立 pressed | frame 2 是持久 selected |
| 主动技能图标 | frame 1 locked | frame 2 unlocked 可点击 | 无独立 pressed | frame 3 learned |
| 393/398/403/408/413 键槽 | frame 1=P1 | 无 hover/down | 无 pressed | frame 2=P2，不是 selected |

因此总页主动/被动标签没有持久 selected 帧；页面内容本身表达当前子页。实现不得自行给它们添加现代选中框。selected 只适用于角色选择器和现代可访问状态元数据。

## 9. 现代 view 差异与逐项去向

当前 `FormalSkillPageView.ts` 的以下对象是替代覆盖层，`TASK-SLICE-143` 必须删除或改为不可见命中/语义：

| 当前对象 | 原版反证 | 原生映射 |
| --- | --- | --- |
| hub `setAlpha(0.7)`、940×590 暗矩形、900×548 描边面板 | 250 已是完整不透明根页 | 250 根页 alpha=1，不再画两矩形 |
| `${owner} 正式心法与技能` | 原版无该顶部标题 | 删除；owner 由原角色选择器 frame 2 表达 |
| `P1 技能` / `P2 技能` 通用按钮 | 原版动态创建英雄头像选择器 | 使用 218/223/228/233/871；内部 owner 仍显式 |
| 顶部“心法一/心法二/五槽绑定/被动技能” | 原导航位于 xf1/xf2、技能行 set 按钮和底部主动/被动按钮 | 按原入口拆回 |
| 子页 `setAlpha(0.34)` | 原子页直接显示 | 原帧 alpha=1，保持舞台坐标 |
| 主动页现代树标题、5 个通用技能按钮、3 个动作按钮 | 868/865 已含两树、技能图标三帧、580/638 | 写原 TextField/图标帧并绑定原 hit |
| 绑定页“已学主动技能”、10 个文字按钮、五槽文字按钮、“绑定到选中槽” | 417 只有一个 source、五个槽和关闭提交 | 使用原图标 addChild、拖放/点击等价和 x_btn 提交 |
| 被动五个大按钮、“升级选中被动” | 213 有五行 212 与各自 207 | 写行内字段并绑定各行 207 |
| `(120,455)` 永久摘要 | 原版只用原字段和共享瞬时提示 | 删除；反馈落到原共享瞬时提示或不可见 live region |
| `关闭返回` 通用按钮 | 原版 240 位于右上 | 使用 240 三态和 239 hit |

可继续使用的现代内容只有业务值与事件：灵魂、心法等级/名称、技能锁定/学习/等级、绑定数组、被动等级、P1/P2 owner、HUD 同步、V4 保存。它们必须投影到上述原版槽位，不能继续保留现有可见控件。

## 10. 现代视觉例外

本证据任务批准的新增可见例外：**无**。

不需要用户批准的非可见等价：

- DOM/Phaser 可访问名称、role、tab order、屏幕阅读器 live region。
- 绑定页“选技能后点击原槽”与键盘 Enter，前提是仍使用原 76×76 hit、原吸附结果和 x_btn 提交。
- 为测试添加 data/name 标识，前提是运行时不可见。

候选但尚未批准的可见例外：

- 键盘 focus outline。
- 双人同角色时额外显示 P1/P2 文本。
- 原嵌入字体不可用时改变字体或字号。

实现遇到候选项必须先停下记录差异并取得用户裁决，不得默认加入。

## 11. `TASK-SLICE-143` 验证合同

自动层：

- 断言四页根/子资源全 alpha、根坐标和原 hit bounds。
- 断言 240/244/248/337/580/638/207 的 up/over/down 资源与按压位移。
- 断言五角色 selector 两帧、主动 10 树×5 技能×3 状态、P1/P2 五键槽帧。
- 断言动态 TextField/addChild 坐标、被动五帧/字段公式、绑定吸附/回退/x_btn 提交。
- 静态拒绝 `FormalSkillPageView` 新增全屏 rectangle、现代标题、通用可见按钮或永久摘要。
- 保留技能业务、owner、HUD、V4 专项，运行 `test:systems`、build、workflow 与 diff 检查。

940×590 浏览器层：

1. 从地图与 Stage 正式入口分别开 P1/P2，总页对照 250 基准。
2. 观察返回、主动、被动按钮 normal/hover/pressed；观察角色普通/selected。
3. 五角色各切两心法，至少覆盖 locked/unlocked/learned、心法满级隐藏、技能升级提示。
4. 绑定页覆盖 P1/P2 键槽、拖动成功、拖动落空回退、点击等价、已有占用替换、x_btn 提交/返回。
5. 被动页覆盖五行、可升级、等级/灵魂拒绝、10 级按钮隐藏。
6. 关闭后确认来源恢复；保存/重载后 HUD 与五槽一致；console 无 warning/error。

差异产物：

- 原版基准与现代截图均固定 940×590；不得用裁切后的 888×425/506×356/746×429 画布直接比较。
- 每一代表状态保留并排图、50% alpha 叠图和可见对象差异清单。
- 稳定静态区域做像素或边缘差异；动态数值区单独 mask。允许字体抗锯齿/栅格化容差，但文字矩形、基线、颜色、对齐和是否存在不容差。
- 任一现代矩形、标题、通用按钮、错误 selected 帧或错误层级都记为失败，不能以路由/业务测试通过替代。

## 12. 未知与实现门禁结论

非阻塞事实边界：

- 原版共享瞬时提示对象的完整视觉族不属于四页自身 symbol；实现可复用项目已有原提示等价，但不得保留永久摘要。若当前项目没有原提示资源，先用不可见 live region 保持可访问反馈，不新增可见层。
- 浏览器的字体栅格化可能与 Flash 不逐像素一致；这是验收容差，不改变 TextField 几何和样式合同。

影响 `TASK-SLICE-143` 的未知项：**0**。

下一任务可以开始实现，但必须逐项消费本文显示列表与原版基准；四张扁平 public SVG 只能作为静态根层，所有交互态和动态 child 必须从本文列出的源帧族派生。

# 天庭地图任务页逆向索引

本文闭合 `TASK-SETTINGS-066D` / `GOAL-044`。目标是为 `TASK-SLICE-155D` 提供 character 85 任务页、43 个日常任务、4 个活动定义、进度、奖励与跨日存档的权威实现输入；不实现现代页面，也不把当前版本不可达的活动定义伪装成可用原版功能。

## 待证明的可观察问题

1. 日常/活动页签、五个 tile、描述/进度、四奖励格、领取、分页和关闭分别由哪些 Symbol、depth、坐标、TextField、状态与命中区组成。
2. 43 个日常和 4 个活动定义的名称、目标、奖励候选、分页与完成条件是什么。
3. 怪物死亡如何推进任务，领取如何随机选奖、修改 P1/P2、拒绝重复领取并更新存档。
4. 日常同日恢复、跨日重置与活动持续恢复的真实调用链是什么。
5. 当前版本的 4 个活动为何不可达，现代离线版最多能复现到什么边界。

## 证据入口与版本边界

- 恢复视觉源：`local-resources/regima/source/restored-swfs/assets/backpack1.swf`。
- 共享奖励图标源：`local-resources/regima/source/restored-swfs/assets/EIcon1.swf`。
- 根视觉基准：`local-resources/regima/task-outputs/task-settings-066-map-services/png|svg/shop-task/DefineSprite_85_export.taskInterface.TaskInterface/1.*`。
- 深层派生：`local-resources/regima/task-outputs/task-settings-066-map-services/deep-task*`，包含 39/44/49/54/60/73/85、31/78/83、TextField、按钮四态、`hasReceive` 与四种共享奖励图标。
- 页面局部：`export/taskInterface/TaskInterface.as`、`TaskTile.as`、`AwardList.as`。
- 任务数据与状态：`task/GameTask.as`、`task/Task.as`。
- 进度生产者：`base/BaseMonster.as#fallEquip()` 与 `export/monster/Monster172.as#fallEquip()`。
- 共享奖励/存档：`user/User.as`、`storage/MemoryClass.as`、`config/Config.as`、`GMain.as`、`export/MapMenu.as`。

恢复的 `backpack1.swf` 自带较旧 `GameTask` 字节码，只含更早的任务表；它在当前任务中只作为 character 85 视觉与嵌入资源证据。行为数据以主程序 `[172845].swf` 的 43+4 定义为准，备份 `[25034429].swf` 交叉确认相同定义与“活动只构造、不入数组”的当前版本边界。

## 原版视觉基准

- 舞台与裁切：940×590。
- 根 Symbol：character 85，`export.taskInterface.TaskInterface`，1 帧。
- character 39 提供 940×590、约 20% 黑色的全舞台模态层，并在中央绘制任务双栏面板。
- 原根 PNG/SVG 是未执行 AS3 的时间轴基准：页签均停在 frame 1、五个 tile 和四奖励格为空、领取停在 frame 1。运行时 `ADDED_TO_STAGE` 会立即触发日常页签并填入第一页，但不会自动选择第一项。
- 当前没有现代任务页。原版/现代同尺寸并排、叠图、稳定区域像素/边缘差异与最终对象差异清单由 `TASK-SLICE-155D` 完成；本 task 已保存全部原状态资源，现代截图不得反向充当原版基准。

## 根显示列表

character 85 无 mask、filter、blend、rotation 或缩放例外。坐标均为 940×590 舞台坐标。

| depth | 实例 / character | 坐标与边界 | 状态 / 数据来源 |
| --- | --- | --- | --- |
| 5 | 根背景 39 | `(0,0)`，940.05×590 | 全舞台半透明模态层与中央双栏面板 |
| 6 | `dailymc` 44 | `(182.3,138)`，110×44 | frame 1 normal；frame 2 selected |
| 8 | `activitymc` 49 | `(289.3,138)`，110×44 | frame 1 normal；frame 2 selected |
| 10 | `getaward` 54 | `(492.45,397.8)`，141×49 | frame 1 disabled；frame 2 enabled |
| 12 | `btn_close` 31 | `(690.95,79.45)`，40×42 | DefineButton2 四态 |
| 14/17/20/23/26 | `t1..t5` 60 | x `186/186/186/186/187.45`；y `182.35/228.35/273.35/320.35/365.95`；204×40 | frame 1 normal；frame 2 selected；动态任务名与已领取图 |
| 30 | 描述区底图 63 | 原位，270×253.35 的组合范围 | 静态“任务描述/当前进度”区域 |
| 31 | `txtinstr` 64 | `(442,158)`，244×28.1 | 任务描述 |
| 32 | `txtcur` 65 | `(442,193.8)`，242.95×29.25 | `名称 cur/need` 进度串 |
| 35 | 奖励区底图 69 | 原位，247.95×132.35 的组合范围 | 静态“活动奖励（以下物品随机领取一个）”区域 |
| 36/39/42/50 | `alist1/3/2/4` 73 | `(431.45,268.35)`、`(431.45,324.35)`、`(560.95,268.35)`、`(561,325.35)`；131×59 | 2×2 奖励格；运行时图标与名称 |
| 45 | `prepage` 78 | `(187.45,414.8)`，86×34 | 上一页 DefineButton2 |
| 47 | `nextpage` 83 | `(307.45,414.8)`，86×34 | 下一页 DefineButton2 |
| 49 | `txtpage` 84 | `(272,421.5)`，40×22.05 | `curPage/allPage` |

### TextField

| character | 用途 | 原字段 / 字体 |
| --- | --- | --- |
| 57 | tile 名称 | 160.95×30.5，tile 局部 `(35,6.5)`；FZCuYuan-M03、22px、白色、左对齐 |
| 64 | 描述 | 244×28.1；FZCuYuan-M03、15px、白色、左对齐 |
| 65 | 进度 | 242.95×29.25；FZCuYuan-M03、15px、白色、左对齐 |
| 72 | 奖励名 | 70×34.9，奖励格局部 `(57,14.75)`；FZCuYuan-M03、12px、白色、左对齐 |
| 84 | 页码 | 40×22.05；FZCuYuan-M03、15px、白色、左对齐 |

所有字段使用嵌入轮廓；实现不得以浏览器系统字体回退冒充原版文字。`txtinstr/txtcur/txtpage` 没有额外现代背景或标签。

## 状态、动态 child 与命中区

### 页签、tile 与领取

- 日常/活动页签都是两帧 MovieClip，没有 hover/down 独立帧；整个 110×44 可见范围监听 click。选中页签停 frame 2，另一页签停 frame 1。
- tile character 60 是 204×40 两帧 MovieClip：frame 1 normal、frame 2 selected。整个可见范围监听 click，没有 hover/down/disabled 独立帧。
- “完成但未领取”不会改变 tile 图；只有选中后，领取 character 54 才按 `judgeComplete()` 切到 frame 2。
- 已领取时 `TaskTile.setReceive()` 动态创建 `hasReceive` bitmap（`backpack1.swf` character 9，63×47），命名 `hasReceiveIcon`，局部 `(150.5,0)`；换页/重建列表前移除。
- 领取 character 54 的 frame 1 为灰色不可领图，frame 2 为亮色可领图；141×49 整体监听 click。已领取、未完成或尚未选择时均停 frame 1。
- `AwardList` character 73 的底图 131×59；运行时图标固定局部 `(3.5,3.5)`，通用奖励图标为 50×50，名称写入 character 72。
- `exp/bs/lh/roomhorse` 分别映射 `rw_exp/rw_bs/rw_lh/rw_roomhorse`；四者由恢复 `EIcon1.swf` 的 623/608/560/512 提供。`dj/zzs` 直接按奖励 `value` 查 `EIcon1.swf`；当前 47 个定义涉及的 47 个唯一物品 stable class 均已在该包中定位，无缺失。

### 关闭与分页按钮

| character | 状态 | 原 child / 位移 | 命中合同 |
| --- | --- | --- | --- |
| 31 关闭 | up / over / down / hit | 28 at y=-2 / 30 at y=0 / 28 at y=0 / 28 at y=0 | 40×40 实形；组合边界 40×42 |
| 78 上一页 | up / over / down / hit | 75 y=0 / 77 y=0 / 77 y=2 / 77 y=0 | 86×32 实形；组合边界 86×34 |
| 83 下一页 | up / over / down / hit | 80 y=0 / 82 y=0 / 82 y=2 / 82 y=0 | 86×32 实形；组合边界 86×34 |

分页按钮在第一页/末页仍保持可见和可点击；点击只把页码钳制在边界，不存在 disabled 图。关闭只移除当前页面。

### 分页与状态残留

- 43 个日常固定为 9 页，每页 5 条，最后一页只有 3 条；活动数组在当前版本长度为 0，页码显示 `1/1`。
- 切页前五个 tile 统一回 frame 1，再装入新页；系统会按上一页的 `selectId` 自动选择新页相同行。
- 最后一页若原 `selectId` 为 4/5，对应 tile 被隐藏且没有 click listener，右侧会保留上一项描述/奖励，这是原版可观察残留。
- 从已选日常切到空活动页时五个 tile 隐藏，但 `selectTask`、右侧描述/奖励和领取 listener 不被清空；因此可能显示并领取先前日常。这是原版状态清理缺陷，不得写成“活动任务内容”。

## 43 个日常任务权威数据表

`候选奖励`表示页面展示的全部候选；领取时只随机得到其中一个。

| ID | 名称 | 目标（显示名 / producer key × 数量） | 候选奖励（type:value） |
| ---: | --- | --- | --- |
| 1 | 袭天的妖怪1 | 黑龟 / `Monster8` ×20 | 尾火棍制作书 `zzs:whgzzs` / 灵魂 `lh:250` |
| 2 | 袭天的妖怪2 | 黑虎 / `Monster7` ×20 | 角木铲制作书 `zzs:jmczzs` / 灵魂 `lh:250` |
| 3 | 袭天的妖怪3 | 黑龟 / `Monster8` ×25；巫鹰 / `Monster3` ×10 | 壁水袍制作书 `zzs:bspzzs` / 灵魂 `lh:250` |
| 4 | 袭天的妖怪4 | 黑虎 / `Monster7` ×25；巫鹰 / `Monster3` ×10 | 氐土铠制作书 `zzs:dtkzzs` / 灵魂 `lh:250` |
| 5 | 反叛的天兵1 | 天兵(斧) / `Monster18` ×25；天兵(刀) / `Monster9` ×25 | 胃土耙制作书 `zzs:wtpzzs` / 经验 `exp:600` |
| 6 | 反叛的天兵2 | 天兵(棒) / `Monster17` ×25；天兵(枪) / `Monster10` ×25 | 翼火甲制作书 `zzs:yhjzzs` / 经验 `exp:600` |
| 7 | 反叛的天兵3 | 天兵(斧) / `Monster18` ×25；天兵(弓) / `Monster19` ×25 | 井木衣制作书 `zzs:jmyzzs` / 经验 `exp:600` |
| 8 | 梅山的余党1 | 牛妖 / `Monster1` ×30；蛇妖 / `Monster13` ×30 | 红莲教皇制作书 `zzs:hljhzzs` / 经验 `exp:2000` |
| 9 | 梅山的余党2 | 狗妖 / `Monster11` ×35；蜈蚣精 / `Monster14` ×35 | 顽石金刚制作书 `zzs:wsjgzzs` / 经验 `exp:2000` |
| 10 | 梅山的余党3 | 羊妖 / `Monster12` ×35；蜈蚣精 / `Monster14` ×35 | 银弹金弓制作书 `zzs:ydjgzzs` / 经验 `exp:2000` |
| 11 | 挑战心魔1 | 邪·沙僧 / `Monster32` ×5 | 流石碎片1/2/3 `dj:lssp_1/2/3` |
| 12 | 挑战心魔2 | 邪·八戒 / `Monster33` ×5 | 流石碎片2/3/4 `dj:lssp_2/3/4` |
| 13 | 挑战心魔3 | 邪·唐僧 / `Monster31` ×5 | 流石碎片5/6/7 `dj:lssp_5/6/7` |
| 14 | 挑战心魔4 | 邪·悟空 / `Monster34` ×6 | 流石碎片6/7/8 `dj:lssp_6/7/8` |
| 15 | 挑战心魔5 | 邪·后羿 / `Monster172` ×7 | 流石碎片7/8/9 `dj:lssp_7/8/9` |
| 16 | 大闹凌霄 | 二郎神 / `Monster22` ×5 | 风灵珠 `dj:wpflz` / 灵魂 `lh:10000` |
| 17 | 冲上宝塔1 | 土行孙 / `Monster35` ×6 | 天残制作书 `zzs:xltczzs` / 经验 `exp:2000` |
| 18 | 冲上宝塔2 | 土行孙 / `Monster35` ×6 | 犹绝制作书 `zzs:xlyjzzs` / 经验 `exp:2000` |
| 19 | 冲上宝塔3 | 雷震子 / `Monster36` ×5 | 天荒制作书 `zzs:xlthzzs` / 经验 `exp:2000` |
| 20 | 冲上宝塔4 | 雷震子 / `Monster36` ×5 | 如狱制作书 `zzs:xlryzzs` / 经验 `exp:2000` |
| 21 | 冲上宝塔5 | 哪吒 / `Monster38` ×5 | 熔炼石 `dj:rls` / 经验 `exp:2000` |
| 22 | 冲上宝塔6 | 李靖 / `Monster37` ×5 | 天枢石 `dj:tss` / 玉衡石 `dj:yhs` / 经验 `exp:2000` |
| 23 | 铲除凶兽 | 梼杌 / `Monster47` ×2 | 龙女的眼泪 `dj:wplvdyl` |
| 24 | 勇闯兜率宫1 | 银角大王 / `Monster53` ×4 | 毒丹 `dj:wpdd` |
| 25 | 勇闯兜率宫2 | 金角大王 / `Monster54` ×4 | 虬龙甲/蟠龙袍/应龙凯/蛟龙甲制作书 `zzs:qljzzs/plpzzs/ylkzzs/jljzzs` |
| 26 | 勇闯兜率宫3 | 青牛精 / `Monster58` ×4 | 虬龙棍/蟠龙杖/应龙斧/蛟龙铲制作书 `zzs:qlgzzs/plzzzs/ylfzzs/jlczzs` |
| 27 | 九龙汇元 | 花豹圣者 / `Monster118` ×1 | 4级昆仑玉 `dj:kly4` |
| 28 | 兽藏龙脊 | 狻猊圣者 / `Monster120` ×1 | 4级昆仑玉 `dj:kly4` |
| 29 | 匿隐尾妖 | 狴犴圣者 / `Monster125` ×1 | 4级昆仑玉 `dj:kly4` |
| 30 | 仙音渺渺 | 碧霄 / `Monster131` ×1 | 5级昆仑玉 `dj:kly5` |
| 31 | 仙幻扑朔 | 琼霄 / `Monster135` ×1 | 5级昆仑玉 `dj:kly5` |
| 32 | 仙树万丈 | 云霄 / `Monster139` ×1 | 5级昆仑玉 `dj:kly5` |
| 33 | 寒暑易节 | 毗摩智多罗 / `Monster1008` ×5 | 5级昆仑玉 `dj:kly5` |
| 34 | 镬汤地狱 | 罗宣 / `Monster111` ×5 | 炎马 `roomhorse:1` |
| 35 | 玉石俱焚·壹 | 飞鹰 / `Monster30` ×1000 | 4级昆仑玉 `dj:kly4` |
| 36 | 玉石俱焚·贰 | 飞鹰 / `Monster30` ×1000 | 5级昆仑玉 `dj:kly5` |
| 37 | 勇闯兜率宫6 | 太上老君 / `Monster65` ×5 | 紫炎 `dj:zy` |
| 38 | 真假六耳猕猴 | 六耳猕猴 / `Monster1007` ×3 | 六耳衫 `dj:les` / 六耳棍 `dj:leg` |
| 39 | 通天赦令 | 蚊妖 / `Monster186` ×1；蝉妖 / `Monster189` ×1；千年蜈蚣 / `Monster203` ×1 | 通天赦令 `dj:ttsl` |
| 40 | 头衔升级1 | 雷震子 / `Monster36` ×1 | 优秀七曜战神头衔 `dj:yxqyzstx` |
| 41 | 头衔升级2 | 六耳猕猴 / `Monster1007` ×1 | 精良七曜战神头衔 `dj:jlqyzstx` |
| 42 | 头衔升级3 | 太白金星 / `Monster64` ×1 | 史诗七曜战神头衔 `dj:ssqyzstx` |
| 43 | 头衔升级4 | 花豹圣者 / `Monster118` ×1 | 传说七曜战神头衔 `dj:csqyzstx` |

ID 27/28/29 的可见描述分别写“高友乾/杨森/王魔”，但进度行与真实 producer key 是“花豹圣者/狻猊圣者/狴犴圣者”；实现应保留两套原文，不要擅自统一。

## 4 个活动定义与不可达边界

| ID | 名称 / 描述 | 构造出的完成判定 | 候选奖励 | 当前版本可达性 |
| ---: | --- | --- | --- | --- |
| 101 | 参悟阴阳 / 拥有法宝：太极八卦 | 仅查 P1 背包四类列表是否有 `tjbg` | 5级昆仑玉 `dj:kly5` | 不可达：未 push 到 `actTask` |
| 102 | 我不入地狱 / 存活在最后的魔，做了救世主 | 仅查 P1 是否同时有 `lxfb/sxfb/yxfb` | 七曜战神头衔 `dj:yxqyzstx` | 不可达：未 push 到 `actTask` |
| 103 | 天庭守护者 / 通关天庭主线关卡 | `judgeAtask()` 没有 case 3 | 经验 `exp:4000` / 灵魂 `lh:50000` | 不可达且永不完成 |
| 104 | 截教使者 / 通关截教天境 | `judgeAtask()` 没有 case 4 | 七曜战神头衔 `dj:yxqyzstx` | 不可达且永不完成 |

`newAllTask()` 构造四个局部变量后直接结束，没有任何 `actTask.push(...)`。因此当前版本活动页的原版正常状态是空列表 `1/1`，不是四项可领取列表。

允许的离线边界：

- `TASK-SLICE-155D` 默认复现空活动页和四项“已知但休眠”的数据定义，不伪造后端、活动时间、通关 producer 或领取事实。
- 若产品以后明确批准“复活离线活动”，101/102 可用已证实的 P1 背包条件；103/104 仍必须另行定义现代 producer 和可见例外，不能由名称猜测。
- 不允许仅把四项 push 进数组并宣称原版活动恢复；这会改变当前版本的可观察行为和奖励经济。

## 进度、完成与奖励事务

### 日常进度生产者

- 普通怪物死亡进入 `BaseMonster.fallEquip()`，用 `getQualifiedClassName(this).split("::")[1]` 得到 `Monster*` key，再调用全局 `GameTask.killMonster(key)`。
- 地狱难度 `gc.difficulity == 2` 明确不推进任何任务；普通/困难会推进。
- `Monster172` 覆盖 `fallEquip()`，只有 `monsterName` 含“邪”时才上报 `Monster172`，对应邪·后羿任务。
- `killMonster()` 遍历全部日常与活动；每个匹配 need 在 `curhas < neednum` 时加 1，达到上限后不溢出。
- `judgeComplete()` 要求 `player1` 已存在；日常全部 need 达标后把 `isComplete=true`。任务页选择项时才刷新领取按钮，因此战斗中完成不会产生独立弹窗或 tile 完成图。

### 随机候选与领取

- 奖励区始终展示 `allaward` 的全部候选；点击领取后 `Math.round(Math.random() * (n - 1))` 只选一个并加入临时 `rwaward`。
- 该随机法对 3/4 候选并非均匀：3 项权重为 1:2:1，4 项权重为 1:2:2:1。现代忠实实现应使用同一离散规则；若改成均匀随机属于需明确批准的数值例外。
- `dj/zzs/bs` 先从 `AllEquipment` 取定义，再对每个活动玩家发放；`zbwp/wpqhs` 走可堆叠背包，其余进入装备列表。原版没有容量预检。
- `lh` 给 P1/P2 各加完整数值，不分摊。
- `exp` 给每个玩家的当前宠物，否则给玩家本人；原版 P2 分支错误地再次查询 P1 当前宠物，因此 P1 有宠物时会给同一只 P1 宠物加两次、P2 不得经验。该可观察缺陷必须进专项；若现代版修为“各自宠物”需单列现代行为差异。
- `roomhorse` 只给 P1 增加一只随机资质炎马；P2 不获得。
- 成功后显示提示、设置 `hasGetAward=true`、移除领取 listener、领取按钮回 frame 1、列表追加 63×47 已领取图。正常 UI 路径阻止未完成和重复领取。
- 生产配置 `isHideDebug=true` 时，装备写入后调用 `MemoryClass.setStorage(saveId)`；该方法只重建内存快照，不调用 `saveGame()` 落盘。返回地图后的正式保存才持久化。

## owner、同日恢复与跨日重置

- `Config.allTask` 是全局单实例；任务进度不是 P1/P2 独立 owner。双人共享进度、完成与领取状态。
- 原版保存却把同一 `allTask/actTask` 串分别写进 P1/P2 的 `User.getSaveObj()`；载入顺序为 P1 后 P2，正常快照内容相同。现代实现不应复制双源，而应在当前槽保存一份 party 级任务状态。
- 每个 Task 保存 `id|curhas...|isComplete|hasGetAward`；日常串与活动串分别以 `}` 连接。临时随机结果 `rwaward` 不保存。
- `Config.initData()` 先 `newAllTask()` 建立全零状态。`User.setSaveObj()` 只有 `gc.curdate == saveDate` 时恢复 `allTask` 与当天幸运值；日期不同就保留全零日常。`actTask` 无条件恢复，因此设计意图是活动跨日保留。
- 日期格式为本地 `year-month-date`。同日关闭/重载恢复日常；跨本地日历日重载清零全部日常进度、完成与已领标记。原版只有载档时判断，不在午夜在线热重置。
- 当前活动数组为空，所以活动保存串为空、跨日恢复无实际内容；这不能证明四个构造定义曾可用。

## 现代实现映射

- 建立一份 party/slot 级任务状态 owner，消费现有稳定怪物死亡事件；不要把 43 个 producer 分散写入关卡。
- 进度只接受已存在的正式怪物 key；当前现代关卡尚未覆盖的 Monster key 保持 0，不用调试按钮、路由进入或关卡完成冒充击杀。
- P1/P2 共享任务状态；奖励按上述原版规则作用于活动 party。P2 经验缺陷和炎马仅 P1 是必须显式选择的行为差异，默认先进入专项并按忠实行为实现。
- 日常状态进入当前六槽存档的一份 slot 级字段，并保存最后日历日；首次加载或日期变化时重置。不要把同一任务串重复嵌入两个玩家，也不要建立独立全局 localStorage。
- 默认零新增可见现代覆盖层；不添加 owner 选择器、在线/离线活动说明面板、任务完成徽章、统一随机概率提示或 disabled 分页样式。
- 当前批准边界只允许对停服活动保持离线空页/休眠定义；任何活动复活都需要新的产品裁决。

## 六段证据矩阵

| 行为合同项 | 局部证据 | 共享调用链 | 几何/坐标证据 | 等级 | 未知 / 反证 | 验证 |
| --- | --- | --- | --- | --- | --- | --- |
| 入口/模态/关闭 | `TaskInterface.added/removed/closed` | `MapMenu.rwbtnClick` → `GMain.showTaskInterface` | 85/39/31，940×590 全屏层与关闭四态 | 交叉确认 | 无 | 正式入口、底层阻挡、关闭/重开专项 + 940×590 |
| 页签/分页 | `dailyClick/activityClick/prePage/nextPage` | `GameTask.getdayTask/getactTask` | 44/49 两帧、78/83 四态、84 TextField | 交叉确认 | 无 | 9 页日常、1 页空活动、边界钳制逐状态 |
| tile/字段 | `setTaskList/selected/TaskTile` | `Task.getrwname/getrwdict/getTaskPro` | 60 两帧、57/64/65 嵌入字体、五行矩阵 | 交叉确认 | 完成无独立 tile 图是确认反证 | selected/完成/已领/末页残留专项 |
| 奖励格/图标 | `setAwardList/AwardList` | `AUtils.getImageObj` / `EIcon1` | 73、72、图标 `(3.5,3.5)`；四共享图 50×50 | 交叉确认 | 47 个物品 class 均已定位 | 1/2/3/4 候选布局与资源存在门禁 |
| 43 日常定义 | `GameTask.newAllTask` | `Task.judgeNeed/judgeComplete` | 不适用：数据合同 | 交叉确认 | 27..29 描述/producer 名称差异保留 | 47 定义快照、key/数量/奖励表测试 |
| 怪物进度 | `Task.judgeNeed` | `BaseMonster/Monster172.fallEquip` | 不适用：死亡事件 | 交叉确认 | 地狱不计数；无其他 producer | 普通/困难/地狱、上限、Monster172 专项 |
| 领取随机/拒绝 | `analyseAward/taskAwardAryById` | `AllEquipment/User/MemoryClass` | 54 两帧、9 已领图 | 交叉确认 | 原随机有端点权重；无容量拒绝 | 未完成/重复拒绝、固定 RNG、四奖励类型 |
| 双玩家 owner | `analyseAward` | 全局 `Config.allTask` 与 P1/P2 User | 不适用：数据边界 | 交叉确认 | P2 宠物经验 bug、炎马仅 P1 | 1P/2P、宠物/本人、灵魂/物品隔离专项 |
| 同日/跨日 | `Task.getSave/setSave` | `User.getSaveObj/setSaveObj`、`Config.initData`、`MemoryClass` | 不适用：存档边界 | 交叉确认 | 仅载档判断，不在线午夜重置 | 同日 round-trip、跨日清零、活动持续意图 |
| 4 活动不可达 | `newAllTask/judgeAtask` | `actTask` 无 push、103/104 无 case | 活动页 frame 2 与空列表 1/1 | 交叉确认 | 复活属于新产品行为 | 静态无 push 门禁 + 空活动页运行 |
| 现代离线边界 | 不适用 | 当前线批准范围与六槽 owner | 不新增可见对象 | 现代设计选择 | 新增活动 producer 必须重新批准 | 空活动页、无伪后端/伪奖励、存档损坏回退 |

## `TASK-SLICE-155D` 实现验收输入

1. 940×590 根模态、日常/活动 selected、五 tile、描述/进度、2×2 奖励格、领取、翻页和关闭全部直接消费原资源与嵌入字体轮廓。
2. 日常 9 页、最后 3 条、分页边界仍可点击；活动默认空页 `1/1`，不显示四个休眠定义。
3. selected、完成未领、领取成功、已领取、末页行缺失、空活动和关闭/重开逐状态覆盖。
4. 43 条定义、全部 producer key/数量/候选奖励与非均匀随机规则由确定性快照/注入 RNG 测试固定。
5. 正式怪物死亡统一生产进度；普通/困难计数、地狱不计数、计数封顶，未接入怪物保持 0。
6. 1P/2P 共享进度；物品、灵魂、经验、宠物和炎马奖励按明确 owner 合同测试，P2 经验 bug 若修正必须列为现代差异。
7. 同日保存重载保持，跨日载档重置日常；任务状态只保存一份 slot owner，不污染其他槽或全局设置。
8. 原版/现代同尺寸并排或叠图、稳定区域像素/边缘差异、嵌入字体容差和逐对象差异清单；零 console error/warning。

## 当前判定

- character 85/39/44/49/54/60/73、31/78/83、全部 TextField、命中区、动态已领取/奖励图标和逐状态原资源已闭合。
- 43 个日常的目标、producer、候选奖励、完成、随机领取、双玩家副作用、同日恢复和跨日重置已闭合。
- 4 个活动是“构造但未入数组”的休眠定义；103/104 还缺完成分支。当前版本可忠实离线复现的活动页是空页，不是四个可领取任务。
- 影响 `TASK-SLICE-155D` 的原版事实未知为零；活动复活和 P2 经验 bug 修正属于未来产品裁决，不伪装成原版事实。

## TASK-SETTINGS-175H 机器真值迁移

2026-08-16 将上述旧审计机械升级为 `task-settings-175h.task-page` verified manifest：

- 恢复源仍为 SHA-256 `70C1F1B535EA789AD9C77556F90C7C107084278A4D1773E31471F2B4D7454936` 的
  `assets/backpack1.swf` character 85；生成器断言 21 个根 child，并逐帧核对 60/73 嵌套显示列表。
- 45 个 scoped 对象覆盖五个 tile 的底图/任务名、四个奖励格的底图/名称、31/78/83 四态、
  character 9 已领取图和 0..4 个运行时奖励图；28 个状态覆盖 daily/activity、selected、完成未领/已领、
  末页三行、隐藏 selectId 陈旧右栏、空活动陈旧领取、P1/P2、关闭/重开。
- 940×590 原版结构基准统一裁去 FFDec 的 0.05 px 右缘；动态文字、帧切换、隐藏行和动态 child
  由 AS3 fixture 与逐帧 Symbol 交叉确认，静态 PNG 不冒充运行态截图。
- manifest、证据矩阵和回测入口分别位于
  `ground-truth/manifests/task-settings-175h-task-page.json`、
  `evidence/TASK-SETTINGS-175H-task-page.md` 与 `npm run test:task-page-truth`；`unresolved=[]`。

这只解除任务页现代直连的证据债务。`TaskScene` 删除手写视觉真值、同尺寸逐态差异和正式运行验收
由 `TASK-SLICE-186` 完成；本次未修改任务定义、奖励、party owner、存档或 `src/`。

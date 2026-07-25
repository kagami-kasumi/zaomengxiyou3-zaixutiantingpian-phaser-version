# 天庭地图四服务页逆向检查点

本文记录 `TASK-SETTINGS-066` 首次 compact 前已经交叉确认的公共入口、页面身份、根显示列表、视觉基准、事务 owner 与存档边界。四页跨三个恢复源包和四套独立业务 owner，已触发任务拆分；因此本文是可续接检查点，不把尚未逐页闭合的按钮三态、动态内容全集或实现差异写成已完成事实。

## 入口与页面身份矩阵

| 地图按钮 | `MapMenu` 入口 | `GMain` / 直接创建 | 页面类 | 恢复源与根 Symbol | 关闭路线 |
| --- | --- | --- | --- | --- | --- |
| 丹药 | `eatPillsClick` 发出 `showImmortality("maping")` 与 `ShowOtherScene` | `showImmortality` 创建页面并加入 `mainSence` | `export.immortality.ImmortalityInterface` | `assets/OtherMat1.swf` / 990 | 页面 `btnback` 返回地图 host |
| 商城 | `scgmClick` 发出 `showShoping` 与 `ShowOtherScene` | `showShoping` 创建页面并加入 `mainSence` | `export.microshop.Micropayment` | `assets/backpack1.swf` / 721 | 页面 `btnback` 返回地图 host |
| 设置 | `huodongClick` 直接创建并加入 `gc.stage` | 无 `GMain` 中转；舞台 overlay | `export.setmenu.gameSetting` | `assets/StageCommon.swf` / 148 | 右上关闭按钮移除 overlay |
| 任务 | `rwbtnClick` 发出 `ShowTaskInterface` | `showTaskInterface` 创建页面并加入 `mainSence` | `export.taskInterface.TaskInterface` | `assets/backpack1.swf` / 85 | 右上关闭按钮返回地图 host |

证据链：

- 行为调用链：`local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts/export/MapMenu.as` 与同根 `GMain.as`。
- 页面局部：同根 `export/immortality/`、`export/microshop/`、`export/setmenu/`、`export/taskInterface/` 和 `task/`。
- 视觉存在性：只以 `local-resources/regima/source/restored-swfs/assets/` 中三个恢复 SWF 为准；legacy extraction 仅作行为对照。
- 选择性派生：`local-resources/regima/task-outputs/task-settings-066-map-services/`；未修改恢复源与 legacy extraction。

## 原版视觉基准与根显示列表

四个根页面均以 940×590 原舞台为坐标语义。商城组合导出边界为约 943.15×590，是右侧子件超出舞台造成的导出范围，不代表现代页面应扩宽。

### 丹药：character 990

- 根背景 character 972，`depth 2`，`(0,0)`，940×590。
- 返回按钮 character 973，`depth 3`，约 `(853.3,23.35)`，84×31。
- 灵魂字段 character 974，`depth 5`，约 `(805.95,544)`，135×31.7。
- 25 个 `SingleImmortality` character 969 组成 5×5 网格；列 x 约为 196.85/299.85/406.85/517.85/622.85，行 y 约为 150.85/218.35/287.85/357.85/430.35。
- 五个效果字段 character 978..982 位于 x 约 750；五个炼制按钮 character 989 位于 x 约 80.7。
- 运行时另创建 P1/P2 owner 选择器；双人路径当前 AS3 顺序最终选中 P2，此为原版可观察代码事实，不自动视为现代设计要求。
- `TASK-SETTINGS-066A` 已把 character 969/1006、四个按钮、五职业选择器、TextField、命中区和逐状态基准全部闭合，详见 [`immortality-ui-index.md`](immortality-ui-index.md)。

### 商城：character 721

- 根背景 character 631，`depth 3`。
- 五分类按钮：全部/宝石/道具/时装/宠物，位于 x 约 131.3/207.3/283.3/359.3/435.25，y 99。
- 3×3 商品卡 character 717，列 x 约 137.8/362.3/585.8，行 y 约 156/247/339。
- 充值按钮 character 668、P1/P2 character 675/680、上一页/下一页 character 685/690、页码 character 691、返回 character 719。
- 原图包含网络保存失败说明和“1人民币=1游币=100点券”等停服时代静态文字；当前 AS3 单机路径实际以灵魂购买，静态文案与事务必须分开记录。

### 设置：character 148

- 根背景 character 134，`depth 1`，940×590；页面作为透明舞台 overlay 使用。
- 游戏难度、背景音效、技能音效、画面质量、默认音量五行标签位于 y 约 196.8/244.3/290.1/339.05/387.65。
- 四个动态值 character 146 位于 x 约 501.4、y 约 192.8/237.9/286.1/334.9；默认音量占位值位于约 `(500.4,383.65)`。
- 关闭 character 144，`depth 7`，约 `(590,131.95)`，40×42。
- `TASK-SETTINGS-066C` 已把 character 134/136..147、五行 TextField/命中区、关闭四态、hover/pressed/循环、overlay 生命周期、会话 owner、原版非存档和现代全局持久化例外全部闭合，详见 [`settings-ui-index.md`](settings-ui-index.md)。

### 任务：character 85

- 根背景 character 39，`depth 5`；页面主体居中于 940×590 舞台。
- 日常/活动页签 character 44/49，约 `(182.3,138)` / `(289.3,138)`。
- 五条任务 tile character 60，x 约 186，y 约 182.35/228.35/273.35/320.35/365.95。
- 描述/进度字段 character 64/65；四个奖励格 character 73 形成 2×2；领取 character 54。
- 上一页/下一页 character 78/83、页码 character 84、关闭 character 31。
- `TASK-SETTINGS-066D` 已把 character 39/44/49/54/60/73、31/78/83、TextField、动态已领取/奖励图标、43 日常、4 个休眠活动、进度/奖励/双玩家/跨日存档和逐状态基准全部闭合，详见 [`task-ui-index.md`](task-ui-index.md)。

四个根导出最初只证明 normal 可达画面与静态/当前帧层次；现 `TASK-SETTINGS-066A/B/C/D` 已分别在逐页索引中闭合 `up/over/down/selected`、动态 child、命中区和业务 owner。

## 页面内容与事务合同

| 页面 | 已确认的内容与操作 | owner / 事务 | 原版存档影响 |
| --- | --- | --- | --- |
| 丹药 | 五种效果、每种五阶；服用每颗消耗 1000 灵魂；每行有炼制弹窗与固定配方 | 当前 P1/P2 的背包、灵魂、`immortalitylist` | `immortalitylist`、背包与玩家灵魂进入存档 |
| 商城 | 全部/宝石/道具/时装/宠物；49 件商品、每页 9 件；箭头数量 1..100，手输 0..99；第三大关起除 `zylhys` 外八折 | 当前 P1/P2 的背包与灵魂；成功后更新运行态并重建内存快照 | 原版不在确认时落盘，需返回地图显式保存；49 项与精确价格已由 `shop-ui-index.md` 闭合 |
| 设置 | 难度普通/困难/地狱；BGM、技能音效开关；30/24/20 FPS；“默认音量”点击在该版本不修改状态 | 会话级 `gc.difficulity`、`SoundManager` 与 `stage.frameRate` | 原版 `User.getSaveObj` 未保存这些字段；现代持久化只能作为明确的现代选择 |
| 任务 | 日常/活动两页签、每页五条、描述/进度、四奖励槽与领取；43 日常可达，4 活动只构造未入数组 | 全局 `GameTask` / `Task` 共享进度；奖励作用于双方但保留 P2 经验与炎马仅 P1 的原缺陷 | `allTask`、`actTask` 入内存快照并在正式保存时落盘；日常仅同日恢复，活动设计为持续恢复但当前数组为空 |

商城不是必须联网才能运行的页面：该版本确认按钮以玩家灵魂结算。“充值”、人民币/游币/点券和网络保存提示属于保留的旧静态表现，不得据此伪造在线支付、账户余额或后端服务。`TASK-SETTINGS-066B` 进一步确认购买成功只调用 `setStorage()` 重建内存快照，真正落盘仍需返回地图后显式保存；详见 `shop-ui-index.md`。

## 逐页剩余未知与拆分边界

| 子 task | 独立资料/owner | 必须清零后才能实现的未知 |
| --- | --- | --- |
| `TASK-SETTINGS-066A`（完成） | 丹药 `ImmortalityInterface` / `SingleImmortality` / `ExchangeImmortality` | 已在 `immortality-ui-index.md` 清零；等待 `TASK-SLICE-155A` 消费 |
| `TASK-SETTINGS-066B`（完成） | 商城 `Micropayment` / `ShopThing` / `SumInterface` | 已在 `shop-ui-index.md` 清零；等待 `TASK-SLICE-155B` 消费 |
| `TASK-SETTINGS-066C`（完成） | 设置 `gameSetting` | 已在 `settings-ui-index.md` 清零；等待 `TASK-SLICE-155C` 消费 |
| `TASK-SETTINGS-066D`（完成） | 任务 `TaskInterface` / `TaskTile` / `AwardList` / `GameTask` | 已在 `task-ui-index.md` 清零；等待 `TASK-SLICE-155D` 消费 |

每个证据 task 只允许读取自身页面族及必要共享 owner；完成后由对应 `TASK-SLICE-155A..D` 独立实现与验收，不在一个 Goal 横跨四页。

## 允许的现代视觉例外与差异门禁

- 默认零新增可见现代覆盖层；禁止用现代面板、标题、通用按钮或整页截图代替原显示列表。
- 商城停服支付/网络能力只能做离线边界处理，不得伪造原版在线事实；任何静态文案替换均需用户批准。
- 设置是否跨重启持久化不是原版事实；用户确认的本线跨应用重启范围现明确作为现代例外，使用独立全局 localStorage owner，不写入 V6/player schema。
- 后续实现必须按 940×590 对照 normal/hover/pressed/selected、分页/列表、动态余额/进度、进入/返回及适用的 P1/P2。
- 组合 SVG/PNG 只作为视觉基准和静态子件来源；动态 TextField、按钮状态与运行时 child 必须按显示列表重建，避免扁平底图与运行 child 重复。

## 当前判定

- 已确认：四入口实际调用链、四页面身份、四个恢复视觉源包、四根 Symbol、逐页完整显示列表/几何、主要内容与事务 owner、原版存档边界；四页完整六段证据均已闭合。
- 任务页确认 43 日常可达；4 个活动定义只构造不入 `actTask`，103/104 也没有完成分支。当前版本活动页正常态是空页 `1/1`，不得伪造活动后端或奖励。
- 结论：父任务继续保持 `Split`；`TASK-SETTINGS-066A/B/C/D` 全部完成，后续按 `TASK-SLICE-155A..D` 逐页实现，不把四页证据闭合等同于四页已复现。

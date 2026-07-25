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
- 难度、背景音乐、技能音效、画面质量、恢复默认五行标签位于 y 约 196.8/244.3/290.1/339.05/387.65。
- 四个动态值 character 146 位于 x 约 501.4、y 约 192.8/237.9/286.1/334.9；恢复默认值位于约 `(500.4,383.65)`。
- 关闭 character 144，`depth 7`，约 `(590,131.95)`，40×42。

### 任务：character 85

- 根背景 character 39，`depth 5`；页面主体居中于 940×590 舞台。
- 日常/活动页签 character 44/49，约 `(182.3,138)` / `(289.3,138)`。
- 五条任务 tile character 60，x 约 186，y 约 182.35/228.35/273.35/320.35/365.95。
- 描述/进度字段 character 64/65；四个奖励格 character 73 形成 2×2；领取 character 54。
- 上一页/下一页 character 78/83、页码 character 84、关闭 character 31。

除丹药页已由独立深证据闭合外，其余根导出只证明 normal 可达画面与静态/当前帧层次；商城、设置、任务的 `up/over/down/selected` 子定义、动态 child 与命中区仍由对应逐页证据 task 关闭。

## 页面内容与事务合同

| 页面 | 已确认的内容与操作 | owner / 事务 | 原版存档影响 |
| --- | --- | --- | --- |
| 丹药 | 五种效果、每种五阶；服用每颗消耗 1000 灵魂；每行有炼制弹窗与固定配方 | 当前 P1/P2 的背包、灵魂、`immortalitylist` | `immortalitylist`、背包与玩家灵魂进入存档 |
| 商城 | 全部/宝石/道具/时装/宠物；49 件商品、每页 9 件；箭头数量 1..100，手输 0..99；第三大关起除 `zylhys` 外八折 | 当前 P1/P2 的背包与灵魂；成功后更新运行态并重建内存快照 | 原版不在确认时落盘，需返回地图显式保存；49 项与精确价格已由 `shop-ui-index.md` 闭合 |
| 设置 | 难度普通/困难/地狱；BGM、技能音效开关；30/24/20 FPS；恢复默认点击在该版本不修改状态 | 会话级 `gc.difficulty`、`SoundManager` 与 `stage.frameRate` | 原版 `User.getSaveObj` 未保存这些字段；现代持久化只能作为明确的现代选择 |
| 任务 | 日常/活动两页签、每页五条、描述/进度、四奖励槽与领取 | `GameTask` / `Task` 进度和奖励事务 | `allTask`、`actTask` 入档；日常仅同日恢复，活动持续恢复；完整 47 项奖励表仍由逐页 task 闭合 |

商城不是必须联网才能运行的页面：该版本确认按钮以玩家灵魂结算。“充值”、人民币/游币/点券和网络保存提示属于保留的旧静态表现，不得据此伪造在线支付、账户余额或后端服务。`TASK-SETTINGS-066B` 进一步确认购买成功只调用 `setStorage()` 重建内存快照，真正落盘仍需返回地图后显式保存；详见 `shop-ui-index.md`。

## 逐页剩余未知与拆分边界

| 子 task | 独立资料/owner | 必须清零后才能实现的未知 |
| --- | --- | --- |
| `TASK-SETTINGS-066A`（完成） | 丹药 `ImmortalityInterface` / `SingleImmortality` / `ExchangeImmortality` | 已在 `immortality-ui-index.md` 清零；等待 `TASK-SLICE-155A` 消费 |
| `TASK-SETTINGS-066B`（完成） | 商城 `Micropayment` / `ShopThing` / `SumInterface` | 已在 `shop-ui-index.md` 清零；等待 `TASK-SLICE-155B` 消费 |
| `TASK-SETTINGS-066C` | 设置 `gameSetting` | 五行 hover/pressed/循环状态、overlay 命中/关闭、session 与现代持久化裁决、恢复默认死控件处理 |
| `TASK-SETTINGS-066D` | 任务 `TaskInterface` / `TaskTile` / `AwardList` / `GameTask` | 43 日常+4 活动的目标/奖励全集、进度生产者、领取拒绝/完成态、跨日与双 owner 行为 |

每个证据 task 只允许读取自身页面族及必要共享 owner；完成后由对应 `TASK-SLICE-155A..D` 独立实现与验收，不在一个 Goal 横跨四页。

## 允许的现代视觉例外与差异门禁

- 默认零新增可见现代覆盖层；禁止用现代面板、标题、通用按钮或整页截图代替原显示列表。
- 商城停服支付/网络能力只能做离线边界处理，不得伪造原版在线事实；任何静态文案替换均需用户批准。
- 设置是否跨重启持久化不是原版事实；如现代实现需要保存，必须单独标为现代例外并保持现有 V6/player owner 边界。
- 后续实现必须按 940×590 对照 normal/hover/pressed/selected、分页/列表、动态余额/进度、进入/返回及适用的 P1/P2。
- 组合 SVG/PNG 只作为视觉基准和静态子件来源；动态 TextField、按钮状态与运行时 child 必须按显示列表重建，避免扁平底图与运行 child 重复。

## 当前判定

- 已确认：四入口实际调用链、四页面身份、三个恢复源包、四根 Symbol、normal 视觉基准、根层次/几何、主要内容与事务 owner、原版存档边界；丹药与商城完整六段证据已闭合。
- 仍为未知：设置、任务两页的深层按钮/动态显示列表，以及任务完整奖励与进度生产者、设置现代持久化产品裁决。
- 结论：父任务继续保持 `Split`；`TASK-SETTINGS-066A/B` 已完成，功能线转入 `GOAL-043 / TASK-SETTINGS-066C`，不能把两页闭合当成四页完成。

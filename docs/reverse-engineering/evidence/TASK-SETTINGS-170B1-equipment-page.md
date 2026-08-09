# TASK-SETTINGS-170B1 正式背包/穿戴 UI 原版证据

## 范围与拆分裁决

`TASK-SETTINGS-170B` 执行前确认存在三个彼此独立的恢复源族：

- 正式页面、格子、动态字段与操作层来自 `assets/backpack1.swf`；
- 164 件图标来自 `EIcon1.swf`、`MagicWeapon2.swf`、`1_MainLoad__main1.swf`；
- 角色穿戴资源分散于五角色主包与 `20120117/20120119/20120203/20120808/MagicWeapon2` 等补丁包。

因此命中父任务“不能由同一恢复源族和可重复生成管线闭合即拆分”的门禁。170B1 只关闭 character 304 正式页面；170B2 负责 164 件视觉 provenance。本文件不修改现代 UI、装备事务、数值或存档。

## 待证明问题与结论

1. character 304 的固定显示列表、25 格、六槽、角色预览、字段、按钮和操作层均已定位。
2. `setpack(1/2)` 选择 owner；P1/P2 使用相同显示列表但读取各自 `User/hero/curarray`，视图不拥有装备状态。
3. `BackPack.added()` 创建 `HeadSprite(roleid,zbfj,zbwq,zbtx)`；`curequip()` 向六槽加入名为 `curzb` 的 `ShowObj`，局部 `y=-2`。
4. 分类/页码重建 5×5 character 628；装备/时装选择创建 character 610，物品/技能书选择创建 character 358。
5. `showszmc` frame 1/2 表达隐藏/显示时装；关闭时移除监听、预览、格子与操作层动态 child。
6. 对后续页面接入有影响的 UI 拓扑未知为零；164 图标和角色穿戴身份不在本子任务内越级下结论。

## 六段证据链

| 段 | 局部证据 | 共享消费者/调用链 | 几何与可观察合同 | 等级 | 反证条件与验证 |
| --- | --- | --- | --- | --- | --- |
| 1. 局部对象 | restored `backpack1.swf` character 304/246/628/610/358/210/219/222/297 | `BackPack.as`、`BackPackElement.as`、`PackThings.as` | 304 固定根；246 四分类/25 格；628 动态图标；610/358 选择层 | 交叉确认 | character/depth 或 AS3 创建路径变化时重开；Schema/对象测试 |
| 2. 共享调用链 | `BackPack.setpack/added/setInfoTxt/curequip/removed` | `User.getEquipNum()`、hero properties、`ShowObj`、`HeadSprite` | owner 只决定动态值和资源身份，不改变 304 几何；关闭销毁动态 child | 交叉确认 | 若出现第二个 UI owner 或 P1/P2 不同根则重开；逐 owner fixture |
| 3. SWF/坐标 | character 304 舞台、246/628 嵌套、六槽与字段 placement | `task-settings-170b1.equipment-page` `/displayObjects` | 940×590 top-left stage；25 格 50×51、step 61×60；六槽 `ShowObj y=-2` | 交叉确认 | XML/源 hash 变化时生成器失败；Schema + parent/state/count 测试 |
| 4. 行为合同 | 九个 owner/page/selection/fashion/lifecycle fixture | 真值 `/states` 与 `/completeness` | P1/P2、空/已穿戴、page 1/2、两操作层、时装显隐、关闭均显式枚举 | 确认事实 | 新状态改变可见对象集时必须增补；状态完整性测试 |
| 5. 现代映射 | 既有 `FormalInventoryPageModel/View`、唯一 inventory/equipment owner | 166B..166D 与 165D 既有消费者 | 后续 170C 直接消费 manifest；不得复制坐标表或建立第二 owner | 现代设计选择 | 实现不直接/生成消费真值时不得宣称接入闭合 |
| 6. 双重验证 | 原 304 940×590、165B 并排/差分、166B..D 运行证据 | `validate-ui-ground-truth`、`test:equipment-page-truth` | 自动验证 Schema、hash、父子链、状态计数；运行证据复核 P1/P2/操作层/分页 | 交叉确认 | 现代截图不反向充当原版基准；170C 仍需重新跑正式旅程 |

## 显示列表与动态字段

权威机器清单为：

- truthId：`task-settings-170b1.equipment-page`
- manifest：`docs/reverse-engineering/ground-truth/manifests/task-settings-170b1-equipment-page.json`
- 根对象：`/displayObjects/0` character 304
- 状态：`/states` 的 9 个 fixture
- 完整性：`/completeness`，63 个 scoped 对象，`unresolved=[]`

动态字段由 `BackPack.setInfoTxt()` 写入：名称、战力、HP/MP、攻击、防御、魔防、幸运/深度命中、暴击、闪避、回血、回蓝、经验、灵魂和等级。经验条使用 30 帧；满级文字为 `MAX`。这些运行值不固化成某一张伪原版截图，manifest 记录 TextField 身份、位置和写入语义。

六槽为 `zbfb/zbfj/zbsp/zbwq/zbtx/zbsz`；`HeadSprite` 只让防具、武器和称号改变角色预览，法宝/饰品不改变预览合成，时装显示由 `showszmc` 与运行态决定。具体 164 件资源映射由 170B2 单独闭合。

## 原版基准、状态与差异

- 原版稳定根：[original-static-304-940x590.png](../../tasks/evidence/TASK-SETTINGS-165B/original-static-304-940x590.png)
- 原版/现代并排：[original-modern-side-by-side.png](../../tasks/evidence/TASK-SETTINGS-165B/original-modern-side-by-side.png)
- 稳定面板差分：[stable-panel-difference.png](../../tasks/evidence/TASK-SETTINGS-165B/stable-panel-difference.png)
- P1/P2、操作层和字段运行证据继续引用 `TASK-SLICE-166B`，格框/经验/分页最终裁决引用 `166C/166D`。

九个状态共用同一张可追溯 SWF 304 稳定根基准。动态值和物品身份没有唯一原版像素 fixture，故按 167 的既有裁决由 AS3 状态拓扑与独立原子资源证明，不伪造运行截图。并排/叠图只说明现代差异，不提升为原版来源。

允许的现代可见例外为空。原版 nickname 无现代独立 owner 的既有英雄名映射、用户对格框/经验/页码的后续裁决仍是已记录现代差异，不改变本 task 的原版事实。

## 后续接入合同

1. 170B2 必须把 164 个 `fillName` 与图标、适用 `HeadSprite` 资源、源 SWF hash、SymbolClass/character id、注册/边界、缺陷及反证条件一对一闭合。
2. 170C 同时消费 170A 数据目录、170B1 UI manifest 和 170B2 视觉目录；不得维护第二套 identity、slot 或坐标 owner。
3. 逐状态验收至少覆盖五角色、P1/P2、空/已穿戴、page 1/2、610/358、穿上/卸下、时装显隐、关闭/再入；资源全集通过自动目录覆盖，不靠代表性截图替代。
4. 170B1 不证明 164 件现代穿脱、属性事务或 V6 已完成。


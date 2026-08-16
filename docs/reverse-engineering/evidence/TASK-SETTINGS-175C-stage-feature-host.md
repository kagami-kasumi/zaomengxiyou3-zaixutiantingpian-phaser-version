# TASK-SETTINGS-175C 战斗功能宿主机器真值

## 结论

`task-settings-175c.stage-feature-host` 已按当前 UI Schema 标记为 `verified`：25 个 scoped 对象、42 个状态，显示列表、状态集、源哈希和 940×590 基准均已核对，`unresolved=[]`。本真值只冻结以下宿主边界：

- 574 `export.RoleInfo` 的设置、背包、技能、法宝、宠物五个 `SimpleButton`，包括 P1/P2、normal/over/down/hit 和共享命中区。
- 371 `export.setmenu.SetMenu` 及 444 `export.Help` 两帧、声音互斥、出怪速度三态、进入/返回层级。
- 特殊关卡、死亡、未装备法宝和宠物死亡不拦截的非对称门禁。
- 原版战斗态和地图态都没有“正式功能页面主机”统一 chrome；当前 `FeatureUiScene.createMapHostChrome()` 是未获批准的现代可见层，不得伪造原版 locator。

背包、技能、宠物、法宝页内对象继续由各页 manifest 持有；175C 的“单页打开”状态只证明宿主 chrome 为空，不把外部页根重复序列化。

## 待证明的可观察问题

| 问题 | 答案 | 等级 |
| --- | --- | --- |
| 五入口是 HUD 真按钮还是键盘便利层 | 574 的 549/555/561/567/573 真 `SimpleButton` | 交叉确认 |
| P2 是复制 P1 坐标还是镜像 | 父级 `x=920, scaleX=-1`，五按钮子件再 `scaleX=-1`保持可读 | 交叉确认 |
| 按钮是否有 disabled 美术帧 | 无；拒绝由 AS3 门禁处理，共享 418 hittest | 确认事实 |
| 设置是否与地图 148 同页 | 否；战斗是 OtherMat1 371/444，地图是 StageCommon 148 | 交叉确认 |
| 原版是否存在统一五页 chrome | 不存在；各入口直接添加各页原根 | 确认事实（负向证据） |
| 当前地图 chrome 能否作为允许例外 | 不能；用户未批准暗层、标题、通用按钮、跨页和通用关闭 | 现代差异，待整改 |

## 一手来源与可重复提取

| 证据 | 哈希 / locator | 用途 |
| --- | --- | --- |
| `local-resources/regima/source/restored-swfs/assets/OtherMat1.swf` | SHA-256 `97478e1e03a22c7d06197ffb75ab890d98b084377cbdcf394716cbaf27082126`；574/371/444 及各按钮 character | 视觉、显示列表、矩阵、按钮帧 |
| `task-settings-067-stage-feature-entry/sprite-574.xml` | 574 首帧 27 个 child；五按钮 depth 52/55/58/61/64 | XML 与本轮 SVG 27/27 交叉核对 |
| `sprite-371.xml` | 全屏底层、8 按钮、366 速度子件 | 371 完整 scoped 显示列表 |
| `sprite-444.xml` | frame 1 的 432 + 3 按钮；frame 2 depth 1 替换为 443 | 帮助两帧完整性 |
| 本轮 FFDec 26 SVG/PNG/button 派生 | `local-resources/regima/task-outputs/task-settings-175c-stage-feature-host/` | 与旧 XML 独立比较，生成 940×590 scoped 基准 |
| `RoleInfo.as` / `GameInfo.as` | `setPos`、`added/removed`、五 click 路径、`refreshRoleInfo` | P1/P2、owner、门禁、父子矩阵 |
| `SetMenu.as` / `Help.as` | 进入、移除、声音互斥、`1→2→4→1`、帮助两帧 | 动态状态与返回层级 |

生成命令：

```text
npm run generate:stage-feature-host-baselines
npm run generate:stage-feature-host-truth
npm run test:stage-feature-host-truth
```

## 显示列表与状态完整性

| 根 | scoped child | 状态 |
| --- | --- | --- |
| 574 `RoleInfo` | 549 `btn_set`、555 `btn_bb`、561 `btn_study`、567 `btn_fb`、573 `btn_cw` | P1 normal/over/down/hit；P2 normal/五 over；4 个拒绝门禁 |
| 371 `SetMenu` | 332 底层；337/342/347/351/355/359/362/370；366 frame 1/2/3 | 声音开/关互斥，x1/x2/x4，关闭 over/down |
| 444 `Help` | 432/443 互斥底层；436/440/441 | frame 1/2，返回 over/down |
| 负向 host scope | 无原版对象 | 四功能单页打开/返回，地图态无共享 chrome |

JSON 关键路径：

- `/displayObjects/0`：574 根和 P1/P2 父矩阵。
- `/displayObjects/1..5`：五入口、按钮四帧、P2 `920-x` 和 31×35 命中区。
- `/displayObjects/6..18`：371 根、互斥声音和速度三帧。
- `/displayObjects/19..24`：444 根、两帧底层和三按钮。
- `/completeness`：42/42 状态，逐态可见对象计数，零未解项。

P2 基准使用原 SWF 574 父镜像作结构参考，并按 `RoleInfo.setPos()` 将本任务范围内的五个按钮子件再反转为可读方向。其他 P2 HUD 文字/技能格不是 175C 的可见对象范围；它们的实现校准不由本 manifest 声称。

## 六段证据矩阵

| 行为合同项 | 局部证据 | 共享调用链 | 几何/坐标证据 | 等级 | 未知与反证条件 | 验证 |
| --- | --- | --- | --- | --- | --- | --- |
| 五 HUD 入口 | 574 的 549/555/561/567/573 | `RoleInfo.added -> click handler -> page root` | XML/SVG depth 和矩阵 27/27；按钮四帧 | 交叉确认 | 若恢复 SWF 哈希改变或子列表不再 27/27，重开 | 生成器 + Schema + 哈希 |
| P2 镜像 | `RoleInfo.setPos()` 子反转 | `GameInfo.refreshRoleInfo()` 父 `x=920, scaleX=-1` | 合成 `stageX=920-p1X`，子/ 父两次水平反转 | 交叉确认 | 若 `AUtils.flipHorizontal` 改变 tx 而非仅 matrix.a，重开 | 源码 + 生成基准 |
| 非对称门禁 | `showBackPack/studySkill/fbClick/cwClick` | 键盘与 pointer 共用 RoleInfo click 路径 | 拒绝不改显示列表 | 确认事实 | 若发现额外 disabled Symbol，重开 | 状态集 + AS3 locator |
| 371/444 层级 | 371 首帧；444 两帧 | `SetMenu.helpClick -> GameHelp -> Help`; 各自 remove | 940×590，444 depth 1 从 432 替换 443 | 交叉确认 | 若帮助页出现第三帧或动态 child，重开 | XML/SVG + AS3 + 基准 |
| 声音/速度 | 359/362 同位；366 三帧 | `soundStay`、`SummonMonsterSpeed` | `(414.85,180.x)` 互斥；`(521.1,303.9)` frame 1/2/3 | 交叉确认 | 私有未调用函数不作反证 | 三状态基准 + AS3 |
| 无统一 chrome | 各 click 分别构造 371/250/304/596/932 | 各页自有 close event，无共享跨页宿主 | 负向状态可见对象计数为 0 | 确认事实 | 若在原 1.1 调用链找到共享宿主 Symbol/addChild，重开 | AS3 全入口矩阵 + 负向差异 |

## 现代映射与差异裁决

| 对象/行为 | 原版 | 当前现代事实 | 分类 |
| --- | --- | --- | --- |
| 战斗五入口 | 574 五按钮，P1/P2 pointer，原门禁 | 已有独立按钮、共享 router 和去重层 | 原资源复用；实现回测继承 165A/176 |
| 战斗功能页外壳 | 直接显示各页原根 | `originKind=stage` 已不创建 map chrome，但页内现代覆盖分页待整改 | 宿主方向正确；不代表各页原生化完成 |
| 地图功能页外壳 | 无统一 chrome；四服务有独立入口/页根 | `createMapHostChrome()` 绘制暗层、金色边框、Arial 标题、五跨页按钮和通用关闭 | 未批准现代覆盖，必须整改 |
| 跨页与 Escape | 其他页快捷键不切页；Escape 只切设置 | map host 为所有 page 注册快捷键，Escape 通用关闭 | 未批准行为差异 |
| workshop | 不在战斗五入口/通用 host | `FeatureUiPages` 包含 workshop，map chrome 展示五页 | 未批准可见差异 |
| P2 技能默认 owner | P2 `*` 仍先选 P1，页内再选 owner | 现代 map host 可直接以 P2 打开 | 未批准行为差异 |

已批准的现代例外仅保留全局设置跨应用重启和非可见键盘可访问性；它们不允许新增 chrome。

## 验收与交接

- 自动：生成器 `--check`、UI Schema、源/基准哈希、27/27 RoleInfo SVG/XML、10/10 SetMenu SVG/XML、444 的 432→443 深度替换、42/42 状态与逐态对象计数。
- 视觉抽查：P1 五按钮、P2 scoped 按钮可读镜像、371 关闭 hover、444 捕捉宠物帧均为 940×590；原字体栅格、透明边缘保留不做现代重绘。
- 本 task 未修改 `src/`，不宣称地图 host 已整改，不宣称各功能页已全部原生化。
- 实现任务必须直接消费本 manifest 或其可重复投影，删除地图态可见共享 chrome，并完成原版/现代同尺寸并排/叠图和逐对象差异。

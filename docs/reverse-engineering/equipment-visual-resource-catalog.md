# 原版 1.1 全装备视觉资源目录

本文是 `TASK-SETTINGS-170B2` 的证据与消费合同。机器真值位于
`reference/equipment-visual-resource-catalog-1.1.json`，Schema 位于
`reference/equipment-visual-resource-catalog.schema.json`，生成与复查入口为
`npm run generate:equipment-visual-catalog` 和
`npm run test:equipment-visual-catalog`。

页面显示列表、六槽、动态字段、操作层与九个正式状态继续直接消费
`ground-truth/manifests/task-settings-170b1-equipment-page.json`；本目录只补全
`ShowObj` 图标和 `HeadSprite` 动态预览资源，不复制 170B1 页面坐标。

## 待证明的可观察问题

1. 170A 的 164 个 `fillName` 是否各有可追溯图标，别名与原查找缺陷是什么？
2. 武器、防具、称号分别如何改变五角色正式背包预览；饰品和法宝是否参与？
3. 默认/特殊 `showId`、Role4 双分支、Role5 动态帧和 2012/`cs_zb` 跨包资源是否完整？
4. 每个资源是否记录源 SWF hash、SymbolClass/character id、时间轴、注册原点、可见边界与反证条件？
5. 哪些事实可直接交给 170C，哪些是必须保留的原版缺陷？

结论：上述问题已经结构化回答，影响 170C 的未知为 0。164 件装备图标为
163 个正常查找加 `fmtstx` 一个已确认原查找缺陷；127 件装备会改变预览，形成
138 条逐项资源记录和 111 个唯一已定位 character；17 饰品与 20 法宝明确不改变
`HeadSprite`。唯一缺失的预览 Symbol 是 `role_title_mksddf`，这是原版缺陷而不是
待搜索资源。

## 六段证据链

| 段 | 本任务证据 | 结论与边界 |
| --- | --- | --- |
| 局部证据 | 170A 164 项目录；`ShowObj.as:24-111`；`HeadSprite.as:32-142`；Role1..5 `initBBDC`/动态换装 | 图标请求、角色、槽位、`showId` 与预览 lookup 一一对应 |
| 共享调用链 | `BackPack.curequip/HeadSprite.refreshEquip`；`BaseBitmapDataPool.getBitmapDataArrayByName/loadZm4RoleResources/changeFashion`；`Aloader/AssetsLoader` | 追到实际资源查找、BitmapData 化、加载顺序和动态 frame 消费 |
| SWF 几何 | 完整 restored corpus 的 SymbolClass 扫描；生成器解析 DefineBits/Shape/Sprite、嵌套 matrix 与时间轴联合边界；TangSeng1 两个 JPEG3 由 FFDec 选择性导出复核 | 每个已定位资源保存注册原点 `(0,0)`、local aggregate bounds、frame count、源 hash 和 locator |
| 可观察合同 | JSON 每项 `icon`、`preview.mode/resources`、Role4 `branch`、Role5 `dynamicLayer/selectedFrame` | 170C 不需重抄别名、跨包路径或 frame 选择 |
| 现代映射 | 后续唯一装备/背包 owner 消费目录；页面几何继续消费 170B1 verified manifest | 本 task 不建立现代 bundle、第二装备 owner 或替代视觉层 |
| 双重验证 | 生成器数量/唯一性/hash/SymbolClass/边界门禁；FFDec 代表性图标、520/521、Role4 双分支、Role5 与称号接触表 | 当前为源资源证据闭合；现代逐状态叠图和正式旅程留给 170C |

反证总条件：1.1 装备目录、`ShowObj`/`HeadSprite`/Role1..5 消费者、加载顺序、
恢复 SWF hash、SymbolClass、character id、时间轴或动态 frame 结构发生变化时，
必须重新生成并复核。

## 图标合同

- 164 项均直接复用 `inventory-resource-catalog-1.1.json` 已裁决的请求名、别名、
  源包和 character id，不建立第二套图标选择规则。
- 163 项 `located`；`fmtstx` 的实际位图为 `EIcon1` character 424
  `role_title_fmtstx`，但原 `ShowObj` 请求 `fmtstx` 且无别名，因此目录状态保持
  `known-broken-original-lookup`。这条仍有一对一 provenance，但不得伪装成原版
  可正常显示。
- 每项 JSON 记录源 hash、定义 tag、帧数、注册原点、可见边界、候选包和精确
  消费 locator。

## 五角色预览合同

| 角色/槽位 | 原版 lookup | 已确认边界 |
| --- | --- | --- |
| Role1–3 防具 | `ROLE<n>_<showId>` | 主包、`TangSeng1` 与 `20120119` 补丁按 exact SymbolClass 定位 |
| Role1–3 武器 | `ROLE<n>_EQUIP_<showId>` | 与 body 分层进入同一 `BaseBitmapDataClip` |
| Role4 防具 | `ROLE4_SHOVEL_<showId>` + `ROLE4_ARROW_<showId>` | 武器 id `4/5/9/998` 走 arrow，其余走 shovel；11 件防具两支均闭合 |
| Role4 武器 | `ROLE4_EQUIP_<showId>` | body 分支不改变武器层 lookup |
| Role5 防具 | `idle_sword` 内 `fashion_yf.gotoAndStop(frame)` | `115→18`、`112→19`、`113→20`、`114→21`；当前九件为 1/3/4/5/7/9/11/16/17 |
| Role5 武器 | `idle_sword` 内 `fashion_wq.gotoAndStop(frame)` | 当前九件为 1/3/4/5/7/9/11/16/18；showId 0 才回退到 1 |
| 称号 | `role_title_<fillName>`，位置 `(-38,-66)` | 与角色无关；13 条正常，`mksddf` 为原缺陷 |
| 饰品/法宝 | 不进入 `refreshEquip(clothId, weaponId, txname)` | 37 项明确标记“不改变角色预览” |

### 520/521 跨包事实

`520/521` 不是缺失 id。完整语料库 exact 扫描定位到：

- `cs_fj_dz/js/jt/zt`：`assets/cs_zb/wk_fj.swf`、`ss_fj_c.swf`、
  `ss_fj_g.swf`、`bj_fj.swf`、`ts_fj.swf` 的 `ROLE*_521`；沙僧仍保持
  shovel/arrow 两包双分支。
- `cs_wq_ll/qs/rc/yt`：`assets/cs_zb/ss_wq.swf`、`wk_wq.swf`、
  `ts_wq.swf`、`bj_wq.swf` 的 `ROLE*_EQUIP_520`。

因此 170C 必须按目录跨包接入，不能因五角色主包里没有 520/521 就补占位或
把它们判为缺失。

## 原版缺陷、未知与反证

- `mksddf`：`ShowObj` 把背包图标别名到 `lly`，但 `HeadSprite` 仍请求
  `role_title_mksddf`。完整 restored corpus 无 exact SymbolClass；原 try/catch
  会留下不可见称号覆盖层。170C 必须保留缺陷，除非用户另行批准现代修复。
- `fmtstx`：称号 overlay `role_title_fmtstx` 实际存在并可由 `HeadSprite` 显示；
  缺陷只在背包 `ShowObj` 请求名。这两个消费面不能合并成“资源完全缺失”。
- 影响接入的未知：0；推断：0；允许的现代视觉例外：0。

## 原版视觉基准与逐状态输入

- 代表性 source-derived 940×590 接触表：
  `docs/tasks/evidence/TASK-SETTINGS-170B2/representative-original-resources-940x590.png`。
- 它由 restored SWF 的 FFDec 选择性导出构成，覆盖真图标、`fmtstx` 候选称号、
  正常称号、520 武器、521 Role4 shovel/arrow 和 Role5 动态组合，不是现代截图。
- 选择性导出原文件与 SymbolClass CSV 保存在 Git 忽略的
  `local-resources/regima/task-outputs/task-settings-170b2/`。
- 页面 940×590 静态根、显示列表、P1/P2、分页、时装、操作层和关闭状态继续引用
  `task-settings-170b1.equipment-page`；170C 的现代叠图必须同时消费两份真值。

## 170C 直接消费合同

1. 以 170A `fillName` 为唯一身份，不复制装备表。
2. 图标直接消费本目录 `icon`；保留 `fmtstx` lookup defect，不造替代图。
3. 武器/防具/称号只消费 `preview.mode/resources`；相同 package/character 必须
   复用派生资产，Role5 复用 `idle_sword` 并选择目录 frame。
4. Role4 同时接入 shovel/arrow body，按目录列出的四个 arrow 武器 id 切换。
5. 饰品/法宝不得为了“六槽都变化”而给角色预览新增原版不存在的可见层。
6. `mksddf` 默认保持标题 overlay 缺失；任何修复都属于需用户批准的现代例外。
7. 逐状态验收覆盖五角色、默认/特殊 showId、Role4 双分支、Role5 动态换装、
   13 个正常称号、两个原查找缺陷和 37 个不改变预览的槽位项。

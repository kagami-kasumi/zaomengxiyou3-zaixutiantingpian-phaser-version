# 炼丹炉视觉资源与交互索引

本文记录 `TASK-SETTINGS-044` 对炼丹炉界面的 RegiMA 视觉源包、Flash symbol、布局、时间轴状态和交互证据。后续视觉实现任务应直接使用本文，不再全量搜索资源。

## 资料边界

行为证据：

- `local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts/GMain.as`
- `local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts/export/MapMenu.as`
- `local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts/export/strength/StrengthEquipment.as`
- `local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts/export/strength/Fusion.as`
- `docs/reverse-engineering/crafting-index.md`

视觉权威源：

- `local-resources/regima/source/restored-swfs/assets/backpack1.swf`
- `local-resources/regima/source/restored-swfs/assets/OtherMat1.swf`
- `local-resources/regima/source/restored-swfs/assets/EIcon1.swf`

本任务只使用 FFDec `-dumpSWF` 和内存解析做只读调查，没有导出图片、重生成资源或修改源 SWF。旧提取集只提供 AS3 行为证据，不能覆盖 RegiMA 视觉结论。

源包 SHA-256：

| 源包 | SHA-256 |
| --- | --- |
| `assets/backpack1.swf` | `70C1F1B535EA789AD9C77556F90C7C107084278A4D1773E31471F2B4D7454936` |
| `assets/OtherMat1.swf` | `97478E1E03A22C7D06197FFB75AB890D98B084377CBDCF394716CBAF27082126` |
| `assets/EIcon1.swf` | `A205BD0D5FDB4F2734B0ED6BE018F3AC482ADE52C16A40E2D0C80D07BB2BB224` |

## 顶层 symbol 映射

| 现代用途 | 源包 | Character ID / SymbolClass | 帧 | 结论 |
| --- | --- | --- | ---: | --- |
| 炼丹炉完整容器 | `backpack1.swf` | `119` / `export.strength.StrengthEquipment` | 1 | 可用；包含背景、返回、四页签、灵魂值、页码和翻页控件 |
| 合成页内容 | `backpack1.swf` | `169` / `export.strength.Fusion` | 1 | 可用；包含三材料槽、预览、产物、合成按钮和文本 |
| 悟空选择器 | `OtherMat1.swf` | `218` / `export.shop.SelectWK` | 2 | 可用；第 1 帧未选，第 2 帧选中 |
| 唐僧选择器 | `OtherMat1.swf` | `223` / `export.shop.SelectTS` | 2 | 同上 |
| 沙僧选择器 | `OtherMat1.swf` | `228` / `export.shop.SelectSS` | 2 | 同上 |
| 八戒选择器 | `OtherMat1.swf` | `233` / `export.shop.SelectBJ` | 2 | 同上 |
| 白龙选择器 | `OtherMat1.swf` | `871` / `export.shop.SelectBL` | 2 | 同上 |
| 合成帮助面板 | `OtherMat1.swf` | `375` / `export.strength.FusionHelp` | 1 | 源资源可用；当前 `Fusion.as` 只有未绑定的 `helpClick()`，不进入最小可达交互 |

`StrengthEquipment` 和 `Fusion` 均为单帧复合 MovieClip，不存在“炼丹动画”或页内状态关键帧。页签通过 `SimpleButton.upState = downState` 保持选中视觉，角色选择器才使用显式的 1/2 帧切换。

## 现代资源键契约

下列 key 是后续选择性派生与 manifest 接入的固定合同。复合 symbol 的内部矢量、位图、字体轮廓和按钮状态属于该 symbol 的依赖闭包，不拆成业务 key；导出工具必须随父 symbol 保留依赖，不能因内部位图没有 SymbolClass 名称而标记资源缺失。

| Stable key | 权威源 | Symbol / 帧 | 当前状态 | 派生要求 |
| --- | --- | --- | --- | --- |
| `crafting-ui.container` | `backpack1.swf` | `119 StrengthEquipment` / 1 | `export-ready` | 保留完整 1000×600 容器、按钮四态和透明边缘 |
| `crafting-ui.fusion-panel` | `backpack1.swf` | `169 Fusion` / 1 | `export-ready` | 保留三槽、预览/产物槽、合成按钮和文本底图 |
| `crafting-ui.selector.role1` | `OtherMat1.swf` | `218 SelectWK` / 1、2 | `export-ready` | 分别派生未选/选中帧 |
| `crafting-ui.selector.role2` | `OtherMat1.swf` | `223 SelectTS` / 1、2 | `export-ready` | 同上 |
| `crafting-ui.selector.role3` | `OtherMat1.swf` | `233 SelectBJ` / 1、2 | `export-ready` | 同上 |
| `crafting-ui.selector.role4` | `OtherMat1.swf` | `228 SelectSS` / 1、2 | `export-ready` | 同上 |
| `crafting-ui.selector.role5` | `OtherMat1.swf` | `871 SelectBL` / 1、2 | `export-ready` | 同上 |
| `crafting-item.tlzsp` | `EIcon1.swf` | `813 tlzsp` / 1 | `export-ready` | 槽内材料图标；不使用 character 787 掉落态 |
| `crafting-item.wptlz` | `EIcon1.swf` | `807 wptlz` / 1 | `export-ready` | 预览与成功产物共用 |

`crafting-ui.help` 暂不分配运行时 key：character 375 虽可导出，但入口在原脚本中不可达。强化、分解、制作页签也只属于容器视觉依赖，不在该切片创建对应业务视图。

## 容器布局

以下坐标来自 `backpack1.swf` 的 `PlaceObject2` 矩阵，单位为 Flash 像素。Character 119 作为完整界面根坐标系。

| 实例 | Character ID | Depth | X | Y | 现代用途 |
| --- | ---: | ---: | ---: | ---: | --- |
| `btnback` | 91 | 2 | 854.00 | 15.05 | 关闭/返回 |
| `strengthbtn` | 95 | 5 | 71.55 | 555.80 | 强化页签；非本切片内容 |
| `mixturebtn` | 99 | 8 | 148.80 | 556.80 | 合成页签 |
| `txtlh` | 103 | 13 | 802.00 | 550.15 | 当前玩家灵魂值 |
| `resolutionbtn` | 109 | 15 | 226.20 | 556.45 | 分解页签；非本切片内容 |
| `makingbtn` | 113 | 18 | 302.10 | 557.45 | 制作页签；非本切片内容 |
| `nowpage` | 117 | 23 | 694.65 | 471.95 | 背包页码 |
| `nextPage` | 83 | 24 | 726.85 | 465.55 | 背包下一页 |
| `prePage` | 78 | 27 | 608.65 | 465.55 | 背包上一页 |

运行时补充布局：

- 玩家选择器：`x = 42 + (playerIndex - 1) * 90`、`y = 14.85`，见 `StrengthEquipment.as:90-124`。
- 背包：`x = 512.8`、`y = 130`，见 `StrengthEquipment.as:228-241`。
- 合成页 character 169：`x = 175.6`、`y = 128.45`，见 `StrengthEquipment.as:290-301`。

## 合成页布局

以下是 character 169 的局部坐标；“界面绝对坐标”已加上合成页运行时偏移 `(175.6, 128.45)`。

| 实例 | Character ID | Depth | 局部 X/Y | 界面绝对 X/Y | 现代用途 |
| --- | ---: | ---: | --- | --- | --- |
| `material1` | 168 | 19 | `8.00 / 93.95` | `183.60 / 222.40` | 材料槽 1；点击退回 |
| `material2` | 168 | 17 | `105.85 / 14.00` | `281.45 / 142.45` | 材料槽 2；点击退回 |
| `material3` | 168 | 11 | `203.85 / 93.95` | `379.45 / 222.40` | 材料槽 3；点击退回 |
| `preview` | 142 | 15 | `13.00 / 244.90` | `188.60 / 373.35` | 配方预览图标 |
| `produce` | 142 | 13 | `107.85 / 169.95` | `283.45 / 298.40` | 产物暂存显示；成功路径中同调用栈回包 |
| `rlbtn` | 164 | 8 | `83.00 / 312.95` | `258.60 / 441.40` | 合成按钮 |
| `txt_name` | 156 | 4 | `126.85 / 247.00` | `302.45 / 375.45` | 预览产物中文名 |
| `txt_success` | 157 | 5 | `257.55 / 247.00` | `433.15 / 375.45` | 固定 `100%` |
| `txt_needlh` | 158 | 6 | `166.85 / 283.00` | `342.45 / 411.45` | 固定 `1000` |

Character 142 和 168 都是单帧槽位 Sprite。各按钮是 `DefineButton2` 的 up/over/down/hit 状态，不应伪造成业务状态动画。

## 首个配方图标

`VS-042` 的最小视觉验收使用 `tlzsp + tlzsp + tlzsp -> wptlz`：

| 用途 | 源包 | Character ID / SymbolClass | 状态 |
| --- | --- | --- | --- |
| 槽内土灵珠碎片 | `EIcon1.swf` | `813` / `tlzsp` | 可用 |
| 掉落态土灵珠碎片 | `EIcon1.swf` | `787` / `fall_tlzsp` | 可用，但炼丹炉槽位不使用掉落态 |
| 预览/产物土灵珠 | `EIcon1.swf` | `807` / `wptlz` | 可用 |

其他配方图标继续按 `productFillName` 从 `EIcon1.swf` / `EIcon2.swf` 定位。`Fusion.previewFun()` 的别名分支见 `Fusion.as:231-302`；现代实现不能假定所有产物名都等于图标 symbol 名。

## 可观察状态与 AS3 证据

| 状态 | 可观察行为 | AS3 证据 |
| --- | --- | --- |
| 从地图打开 | `MapMenu.ldlClick()` 派发 `showStrengthEquip(state=maping)`；`GMain` 创建容器并加入主场景 | `MapMenu.as:191-194`；`GMain.as:384-389` |
| 初始玩家 | 按 `playNum` 创建角色选择器，全部停第 1 帧，然后自动点击 P1；被选角色停第 2 帧 | `StrengthEquipment.as:90-133` |
| 切换玩家 | 先复位 P1/P2 选中帧，再选当前目标；重建背包并派发强化页点击，因此离开合成页时槽内材料会退回 | `StrengthEquipment.as:202-225`、`:265-312`、`:362-377`；`Fusion.as:63-73`、`:553-580` |
| 进入合成页 | 移除原 `playerControl`，创建当前玩家的 `Fusion`，放到 `(175.6,128.45)`，页签保持 downState 视觉 | `StrengthEquipment.as:290-312` |
| 放入材料 | `SimpleClick` 后依次填第一个空槽，并从对应背包列表扣一个；随后刷新预览并清空旧产物显示 | `Fusion.as:52-61`、`:136-206` |
| 移除材料 | 点击非空材料槽，按类型退回对应列表，然后刷新预览与背包 | `Fusion.as:80-118` |
| 预览成功 | 清空旧名称/图标，读取三个槽并无序匹配；有产物时添加图标和中文名 | `Fusion.as:208-218`、`:229-306` |
| 预览失败 | `produceEquipName == ""`，不添加预览图标或名称；源码仍无条件把消耗/成功率文本写成 `1000` / `100%` | `Fusion.as:208-228`、`:229-306` |
| 无有效配方点击 | `doFusion()` 外层条件不成立，不扣灵魂、不清材料；按钮在方法末恢复 enabled | `Fusion.as:466-471`、`:534-540` |
| 灵魂不足 | 显示“灵魂值不够”，恢复按钮并 return；材料和灵魂不变 | `Fusion.as:470-480` |
| 合成成功 | 扣 1000 灵魂，生成 `ShowObj`，显示“合成成功”，清三个槽并立即将产物路由回背包 | `Fusion.as:481-533`、`:542-550`；回包路由 `:360-380` |
| 产物槽点击 | `produceClick()` 只移除 `produce.curzb`；正常成功路径已在同调用栈回包，故该槽不是稳定的“待领取”状态 | `Fusion.as:120-134`、`:448-452` |
| 切页/关闭 | `Fusion` 被移除时退回三个材料槽、清预览产物并刷新背包；容器返回按 `gameing/maping` 恢复游戏或派发选择结束 | `Fusion.as:63-73`、`:553-580`；`StrengthEquipment.as:362-377`、`:404-418` |

## 原版缺陷与现代边界

- `StrengthEquipment.onWho()` 以角色中文名反查玩家；双玩家选择相同角色时可能命中高编号玩家。现代实现必须使用显式 `PlayerSlot`，不复刻名称串号。
- 切换玩家会回到强化页，而不是保持合成页。最小视觉切片可以保留该可观察流程；若为易用性保持当前页，必须记录为现代差异。
- 无配方时原版仍显示 `1000 / 100%`。现代实现建议保留槽位布局，但把预览状态明确显示为“无配方”；这是视觉可读性差异，不改变合成规则。
- `FusionHelp` 源 symbol 存在，但当前脚本没有绑定帮助按钮；最小切片不增加不可达入口。
- `produce` 在成功路径中是瞬时容器，不设计“点击领取”流程。

## 最小视觉实现切片

资源清单：

- `backpack1.swf`：character 119、169，以及其直接子按钮/槽位复合视觉。
- `OtherMat1.swf`：218、223、228、233、871 五个两帧角色选择器；375 帮助面板暂不接入。
- `EIcon1.swf`：813 `tlzsp` 与 807 `wptlz`；787 仅作掉落态对照。
- 字体优先使用现代可再分发中文字体；若必须追原版，`backpack1.swf` 内嵌 `FZCuYuan-M03`，需单独核对授权后才导出。

实现清单：

- 1000×600 基准坐标布局；响应式只做等比缩放和居中，不重排槽位。
- P1/P2 角色选择器与选中态。
- 合成页签、三材料槽、预览、产物、灵魂消耗、成功率、合成按钮、背包区和翻页控件。
- 复用现有 `CraftingSession`、玩家所有权和原子事务，不在视觉层重写配方逻辑。

占位策略：

- 在 character 119/169 尚未完成选择性导出前，可用同尺寸 Phaser 容器占位，但 stableKey 和坐标必须按本索引固定。
- 单个无法直接导出的复合按钮允许用九宫格/文字近似；不得因某个内部位图未单独命名而宣告整个界面资源缺失。
- `FusionHelp`、强化、分解、制作和幻兵只保留禁用页签或不显示，不实现对应玩法。

验证边界：

- 自动验证：stableKey/sourcePackage/character id 映射、坐标常量、P1/P2 隔离、三槽状态、无配方/灵魂不足/成功/关闭退回状态、1000 灵魂和首配方图标映射。
- 人工验证：与 FFDec 中 character 119/169 的完整界面截图对比整体比例、颜色、按钮四态、选择器两帧和透明边缘。
- 不要求自动测试像素级相等；视觉验收只覆盖 1000×600 基准画布和一个首配方闭环。

## 结论

炼丹炉完整视觉源并不缺失，且已定位到确定的 RegiMA 源包、Character ID、帧数和布局。应生成一个窄的视觉实现切片，而不是把当前占位 UI 定义为长期边界。

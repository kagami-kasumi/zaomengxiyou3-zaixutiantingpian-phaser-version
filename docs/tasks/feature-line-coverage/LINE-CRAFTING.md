# LINE-CRAFTING 合成页完整覆盖台账

本文是 `LINE-CRAFTING` 的详细范围和关闭证据。当前状态为已关闭；112 个唯一配方、201 个物品定义、201/201 真图标、正式流程与 P1/P2 全量事务验证均已闭合。

## 用户确认合同

交付玩家可见、带原版真 UI、覆盖 1.1 权威合成表中全部合成的炼丹炉合成页。允许拆成多个 task，但 task 必须连续；遇到阻塞时解决本线阻塞，不切换到其他系统。

当前合同中的“炼丹炉”指 `Fusion` 合成页：强化、分解、制作是同一容器中的其他业务页签，暂作为独立候选功能线，不以它们阻塞本条线；容器中对应页签的视觉存在不能被写成功能已完成。

## 权威范围

- 权威行为与配方：`AllEquipment.mixProduce()`、`Fusion.as`、`StrengthEquipment.as`。
- 现代权威配方数据：`docs/reverse-engineering/reference/crafting-recipes-1.1.json`。
- 已确认唯一配方：67 个 `direct_static`、41 个默认继承、3 个 `get_sun_sutra_value`、1 个 `get_mingding_huayan`，共 112 个。
- 真 UI 权威源：`assets/backpack1.swf`、`assets/OtherMat1.swf`、`assets/EIcon1.swf` 及后续按配方定位的恢复源包。

## 覆盖维度

| 维度 | 当前事实 | 状态 | 关闭要求 |
| --- | --- | --- | --- |
| 配方注册 | 112 个唯一配方已进入现代 registry | 已覆盖 | 与权威 JSON 集合完全一致 |
| 合成事务 | 三槽、无序匹配、1000 灵魂、成功/失败、P1/P2 隔离已实现 | 已覆盖 | 全部规则类别复用同一原子事务 |
| 属性继承 | 默认继承和 4 个特殊继承配方已实现 | 已覆盖 | 每一规则类别有代表测试且全集分类无遗漏 |
| 真 UI | 容器、合成页、角色选择器已接入 | 已覆盖 | 从正式游戏流程可达并完成视觉验收 |
| 配方材料/产物定义 | 201 个唯一 fillName 均有 1.1 权威名称、类型与现代定义 | 已覆盖 | 112 配方涉及的全部 fillName 均有现代定义和正确类别 |
| 材料获得/测试入口 | P1/P2 明确验收库存覆盖 201 项，每项材料至少 3 件/份 | 已覆盖 | 每个配方材料都有正式获得方式或明确验收入口 |
| 真图标 | 201/201 权威 fillName 全部接入真资源 | 已覆盖 | 全部玩家可见材料、预览和产物有正确真资源或经用户确认的例外 |
| 正式流程 | 地图菜单可点击进入炼丹炉，支持 P1/P2 切换与关闭退还 | 已覆盖 | 从正式地图菜单/玩家流程进入、操作和退出 |
| 自动验证 | 112 配方 × P1/P2 共 224 条完整事务矩阵，另含失败、隔离、切换和关闭路径 | 已覆盖 | 全集、规则类别、库存类别、双玩家与失败路径均被覆盖 |
| 人工验收 | 201 图标逐批目检；正式地图入口和完整真 UI 运行时截图已留档，页面无 error/warn | 已覆盖 | 真 UI 运行画面、交互和代表配方完成验收 |

## 关闭 task

`TASK-SLICE-122` 已完成：112 配方 × P1/P2 共 224 条事务全部通过；混合装备实例与 `zbwp` 堆叠材料的默认继承缺口已修正；正式入口生命周期自动验证和运行时截图证据齐备。

## 112 配方逐项覆盖矩阵

矩阵由 `npm run audit:crafting-coverage -- --write-doc` 从权威 JSON、现代 registry、物品定义、验收库存和 `CraftingItemTextureKeys` 机械生成。字段解释：

- “现代定义”按当前唯一 fillName 数量记录 `命名定义/占位定义/缺失`；占位定义指只有 fillName 名称和空属性的掉落表占位，不能作为内容完成证据。
- “库存类别”是现代定义当前导出的分类；`missing` 表示尚不能判定，不能猜造。
- “获得/验收入口”只统计测试场景的验收库存；当前 112 条均无正式获得入口，因此每行明确记录“正式 0”。
- “真图标”只统计已经进入 manifest、标注表和现代资源目录的图标；当前为 201/201 ready。
- `registry-set+full-p1-p2-transaction-matrix` 表示该配方已在 P1/P2 两个独立库存上完成实际事务验证。

<!-- crafting-coverage-matrix:start -->

recipes=112; behaviors={"get_sutra_value":41,"direct_static":67,"get_sun_sutra_value":3,"get_mingding_huayan":1}
fillNames={"materials":152,"products":85,"union":201}; definitions={"named":201}; acceptance=201; icons=201

| 源分支 | 行为 | 材料 | 产物 | 现代定义（命名/占位/缺失） | 库存类别（材料→产物） | 获得/验收入口 | 真图标 | UI | 自动测试 |
| ---: | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | get_sutra_value | `kyg + kyz + kys` | `kyl` 枯叶灵 | 4/0/0 | equipment/equipment/equipment→equipment | 验收库存 4/4；正式 0 | 4/4 | true-icons | registry-set+full-p1-p2-transaction-matrix |
| 2 | get_sutra_value | `xhz + xhc + xhp` | `xhhl` 宣花葫芦 | 4/0/0 | equipment/equipment/equipment→equipment | 验收库存 4/4；正式 0 | 4/4 | true-icons | registry-set+full-p1-p2-transaction-matrix |
| 3 | get_sutra_value | `qybd + qyfp + qysz` | `qyj` 青云剑 | 4/0/0 | equipment/equipment/equipment→equipment | 验收库存 4/4；正式 0 | 4/4 | true-icons | registry-set+full-p1-p2-transaction-matrix |
| 4 | direct_static | `hylk + hylc + hylz` | `hyzzs` 混元珍珠伞 | 4/0/0 | equipment/equipment/equipment→equipment | 验收库存 4/4；正式 0 | 4/4 | true-icons | registry-set+full-p1-p2-transaction-matrix |
| 5 | get_sutra_value | `zjksf + zjqj + zjbtg` | `zjld` 紫金铃铛 | 4/0/0 | equipment/equipment/equipment→equipment | 验收库存 4/4；正式 0 | 4/4 | true-icons | registry-set+full-p1-p2-transaction-matrix |
| 6 | get_sutra_value | `kyl + wplvdyl + gjrls` | `syl` 神叶灵 | 4/0/0 | equipment/items/items→equipment | 验收库存 4/4；正式 0 | 4/4 | true-icons | registry-set+full-p1-p2-transaction-matrix |
| 7 | get_sutra_value | `qyj + wplvdyl + gjyhs` | `lxj` 戮仙剑 | 4/0/0 | equipment/items/items→equipment | 验收库存 4/4；正式 0 | 4/4 | true-icons | registry-set+full-p1-p2-transaction-matrix |
| 8 | get_sutra_value | `hyzzs + wplvdyl + gjtss` | `hywjs` 混元无极伞 | 4/0/0 | equipment/items/items→equipment | 验收库存 4/4；正式 0 | 4/4 | true-icons | registry-set+full-p1-p2-transaction-matrix |
| 9 | direct_static | `wpqhs1 + wpqhs1 + wpqhs1` | `wpqhs2` 2级强化石 | 2/0/0 | items/items/items→items | 验收库存 2/2；正式 0 | 2/2 | true-icons | registry-set+full-p1-p2-transaction-matrix |
| 10 | direct_static | `wpqhs4 + wpqhs4 + wpqhs4` | `wpqhs5` 5级强化石 | 2/0/0 | items/items/items→items | 验收库存 2/2；正式 0 | 2/2 | true-icons | registry-set+full-p1-p2-transaction-matrix |
| 11 | direct_static | `wpqhs2 + wpqhs2 + wpqhs2` | `wpqhs3` 3级强化石 | 2/0/0 | items/items/items→items | 验收库存 2/2；正式 0 | 2/2 | true-icons | registry-set+full-p1-p2-transaction-matrix |
| 12 | direct_static | `scwpqhs2 + scwpqhs2 + scwpqhs2` | `wpqhs3` 3级强化石 | 2/0/0 | items/items/items→items | 验收库存 2/2；正式 0 | 2/2 | true-icons | registry-set+full-p1-p2-transaction-matrix |
| 13 | direct_static | `wpqhs2 + scwpqhs2 + scwpqhs2` | `wpqhs3` 3级强化石 | 3/0/0 | items/items/items→items | 验收库存 3/3；正式 0 | 3/3 | true-icons | registry-set+full-p1-p2-transaction-matrix |
| 14 | direct_static | `wpqhs2 + wpqhs2 + scwpqhs2` | `wpqhs3` 3级强化石 | 3/0/0 | items/items/items→items | 验收库存 3/3；正式 0 | 3/3 | true-icons | registry-set+full-p1-p2-transaction-matrix |
| 15 | direct_static | `wpqhs3 + wpqhs3 + wpqhs3` | `wpqhs4` 4级强化石 | 2/0/0 | items/items/items→items | 验收库存 2/2；正式 0 | 2/2 | true-icons | registry-set+full-p1-p2-transaction-matrix |
| 16 | direct_static | `scwpqhs3 + scwpqhs3 + scwpqhs3` | `wpqhs4` 4级强化石 | 2/0/0 | items/items/items→items | 验收库存 2/2；正式 0 | 2/2 | true-icons | registry-set+full-p1-p2-transaction-matrix |
| 17 | direct_static | `wpqhs3 + scwpqhs3 + scwpqhs3` | `wpqhs4` 4级强化石 | 3/0/0 | items/items/items→items | 验收库存 3/3；正式 0 | 3/3 | true-icons | registry-set+full-p1-p2-transaction-matrix |
| 18 | direct_static | `wpqhs3 + wpqhs3 + scwpqhs3` | `wpqhs4` 4级强化石 | 3/0/0 | items/items/items→items | 验收库存 3/3；正式 0 | 3/3 | true-icons | registry-set+full-p1-p2-transaction-matrix |
| 19 | direct_static | `sms1 + sms1 + sms1` | `sms2` 2级生命石 | 2/0/0 | items/items/items→items | 验收库存 2/2；正式 0 | 2/2 | true-icons | registry-set+full-p1-p2-transaction-matrix |
| 20 | direct_static | `sms2 + sms2 + sms2` | `sms3` 3级生命石 | 2/0/0 | items/items/items→items | 验收库存 2/2；正式 0 | 2/2 | true-icons | registry-set+full-p1-p2-transaction-matrix |
| 21 | direct_static | `scsms2 + scsms2 + scsms2` | `sms3` 3级生命石 | 2/0/0 | items/items/items→items | 验收库存 2/2；正式 0 | 2/2 | true-icons | registry-set+full-p1-p2-transaction-matrix |
| 22 | direct_static | `sms2 + scsms2 + scsms2` | `sms3` 3级生命石 | 3/0/0 | items/items/items→items | 验收库存 3/3；正式 0 | 3/3 | true-icons | registry-set+full-p1-p2-transaction-matrix |
| 23 | direct_static | `sms2 + sms2 + scsms2` | `sms3` 3级生命石 | 3/0/0 | items/items/items→items | 验收库存 3/3；正式 0 | 3/3 | true-icons | registry-set+full-p1-p2-transaction-matrix |
| 24 | direct_static | `mfs1 + mfs1 + mfs1` | `mfs2` 2级魔法石 | 2/0/0 | items/items/items→items | 验收库存 2/2；正式 0 | 2/2 | true-icons | registry-set+full-p1-p2-transaction-matrix |
| 25 | direct_static | `mfs2 + mfs2 + mfs2` | `mfs3` 3级魔法石 | 2/0/0 | items/items/items→items | 验收库存 2/2；正式 0 | 2/2 | true-icons | registry-set+full-p1-p2-transaction-matrix |
| 26 | direct_static | `scmfs2 + scmfs2 + scmfs2` | `mfs3` 3级魔法石 | 2/0/0 | items/items/items→items | 验收库存 2/2；正式 0 | 2/2 | true-icons | registry-set+full-p1-p2-transaction-matrix |
| 27 | direct_static | `mfs2 + scmfs2 + scmfs2` | `mfs3` 3级魔法石 | 3/0/0 | items/items/items→items | 验收库存 3/3；正式 0 | 3/3 | true-icons | registry-set+full-p1-p2-transaction-matrix |
| 28 | direct_static | `mfs2 + mfs2 + scmfs2` | `mfs3` 3级魔法石 | 3/0/0 | items/items/items→items | 验收库存 3/3；正式 0 | 3/3 | true-icons | registry-set+full-p1-p2-transaction-matrix |
| 29 | direct_static | `gjs1 + gjs1 + gjs1` | `gjs2` 2级攻击石 | 2/0/0 | items/items/items→items | 验收库存 2/2；正式 0 | 2/2 | true-icons | registry-set+full-p1-p2-transaction-matrix |
| 30 | direct_static | `gjs2 + gjs2 + gjs2` | `gjs3` 3级攻击石 | 2/0/0 | items/items/items→items | 验收库存 2/2；正式 0 | 2/2 | true-icons | registry-set+full-p1-p2-transaction-matrix |
| 31 | direct_static | `scgjs2 + scgjs2 + scgjs2` | `gjs3` 3级攻击石 | 2/0/0 | items/items/items→items | 验收库存 2/2；正式 0 | 2/2 | true-icons | registry-set+full-p1-p2-transaction-matrix |
| 32 | direct_static | `gjs2 + scgjs2 + scgjs2` | `gjs3` 3级攻击石 | 3/0/0 | items/items/items→items | 验收库存 3/3；正式 0 | 3/3 | true-icons | registry-set+full-p1-p2-transaction-matrix |
| 33 | direct_static | `gjs2 + gjs2 + scgjs2` | `gjs3` 3级攻击石 | 3/0/0 | items/items/items→items | 验收库存 3/3；正式 0 | 3/3 | true-icons | registry-set+full-p1-p2-transaction-matrix |
| 34 | direct_static | `fys1 + fys1 + fys1` | `fys2` 2级防御石 | 2/0/0 | items/items/items→items | 验收库存 2/2；正式 0 | 2/2 | true-icons | registry-set+full-p1-p2-transaction-matrix |
| 35 | direct_static | `fys2 + fys2 + fys2` | `fys3` 3级防御石 | 2/0/0 | items/items/items→items | 验收库存 2/2；正式 0 | 2/2 | true-icons | registry-set+full-p1-p2-transaction-matrix |
| 36 | direct_static | `scfys2 + scfys2 + scfys2` | `fys3` 3级防御石 | 2/0/0 | items/items/items→items | 验收库存 2/2；正式 0 | 2/2 | true-icons | registry-set+full-p1-p2-transaction-matrix |
| 37 | direct_static | `fys2 + scfys2 + scfys2` | `fys3` 3级防御石 | 3/0/0 | items/items/items→items | 验收库存 3/3；正式 0 | 3/3 | true-icons | registry-set+full-p1-p2-transaction-matrix |
| 38 | direct_static | `fys2 + fys2 + scfys2` | `fys3` 3级防御石 | 3/0/0 | items/items/items→items | 验收库存 3/3；正式 0 | 3/3 | true-icons | registry-set+full-p1-p2-transaction-matrix |
| 39 | get_sutra_value | `tlzsp + tlzsp + tlzsp` | `wptlz` 土灵珠 | 2/0/0 | items/items/items→items | 验收库存 2/2；正式 0 | 2/2 | true-icons | registry-set+full-p1-p2-transaction-matrix |
| 40 | get_sutra_value | `llzsp + llzsp + llzsp` | `wpllz` 雷灵珠 | 2/0/0 | items/items/items→items | 验收库存 2/2；正式 0 | 2/2 | true-icons | registry-set+full-p1-p2-transaction-matrix |
| 41 | get_sutra_value | `hlzsp + hlzsp + hlzsp` | `wphlz` 火灵珠 | 2/0/0 | items/items/items→items | 验收库存 2/2；正式 0 | 2/2 | true-icons | registry-set+full-p1-p2-transaction-matrix |
| 42 | get_sutra_value | `flzsp + flzsp + flzsp` | `wpflz` 风灵珠 | 2/0/0 | items/items/items→items | 验收库存 2/2；正式 0 | 2/2 | true-icons | registry-set+full-p1-p2-transaction-matrix |
| 43 | get_sutra_value | `slzsp + slzsp + slzsp` | `wpslz` 水灵珠 | 2/0/0 | items/items/items→items | 验收库存 2/2；正式 0 | 2/2 | true-icons | registry-set+full-p1-p2-transaction-matrix |
| 44 | get_sutra_value | `xley + rls + rls` | `yhs` 玉衡石 | 3/0/0 | equipment/items/items→items | 验收库存 3/3；正式 0 | 3/3 | true-icons | registry-set+full-p1-p2-transaction-matrix |
| 45 | get_sutra_value | `xlcz + rls + rls` | `yhs` 玉衡石 | 3/0/0 | equipment/items/items→items | 验收库存 3/3；正式 0 | 3/3 | true-icons | registry-set+full-p1-p2-transaction-matrix |
| 46 | get_sutra_value | `xlry + rls + rls` | `yhs` 玉衡石 | 3/0/0 | equipment/items/items→items | 验收库存 3/3；正式 0 | 3/3 | true-icons | registry-set+full-p1-p2-transaction-matrix |
| 47 | get_sutra_value | `xlny + rls + rls` | `yhs` 玉衡石 | 3/0/0 | equipment/items/items→items | 验收库存 3/3；正式 0 | 3/3 | true-icons | registry-set+full-p1-p2-transaction-matrix |
| 48 | get_sutra_value | `xlyj + rls + rls` | `yhs` 玉衡石 | 3/0/0 | equipment/items/items→items | 验收库存 3/3；正式 0 | 3/3 | true-icons | registry-set+full-p1-p2-transaction-matrix |
| 49 | get_sutra_value | `xlth + rls + rls` | `tss` 天枢石 | 3/0/0 | equipment/items/items→items | 验收库存 3/3；正式 0 | 3/3 | true-icons | registry-set+full-p1-p2-transaction-matrix |
| 50 | get_sutra_value | `xltq + rls + rls` | `tss` 天枢石 | 3/0/0 | equipment/items/items→items | 验收库存 3/3；正式 0 | 3/3 | true-icons | registry-set+full-p1-p2-transaction-matrix |
| 51 | get_sutra_value | `xltc + rls + rls` | `tss` 天枢石 | 3/0/0 | equipment/items/items→items | 验收库存 3/3；正式 0 | 3/3 | true-icons | registry-set+full-p1-p2-transaction-matrix |
| 52 | get_sutra_value | `xltz + rls + rls` | `tss` 天枢石 | 3/0/0 | equipment/items/items→items | 验收库存 3/3；正式 0 | 3/3 | true-icons | registry-set+full-p1-p2-transaction-matrix |
| 53 | get_sutra_value | `xlts + rls + rls` | `tss` 天枢石 | 3/0/0 | equipment/items/items→items | 验收库存 3/3；正式 0 | 3/3 | true-icons | registry-set+full-p1-p2-transaction-matrix |
| 60 | direct_static | `ptsmsrsz + ptsmsrsz + ptsmsrsz` | `yxsmsrsz` 神秘商人装 | 2/0/0 | fashion/fashion/fashion→fashion | 验收库存 2/2；正式 0 | 2/2 | true-icons | registry-set+full-p1-p2-transaction-matrix |
| 61 | direct_static | `yxsmsrsz + yxsmsrsz + yxsmsrsz` | `jlsmsrsz` 神秘商人装 | 2/0/0 | fashion/fashion/fashion→fashion | 验收库存 2/2；正式 0 | 2/2 | true-icons | registry-set+full-p1-p2-transaction-matrix |
| 62 | direct_static | `jlsmsrsz + jlsmsrsz + jlsmsrsz` | `sssmsrsz` 神秘商人装 | 2/0/0 | fashion/fashion/fashion→fashion | 验收库存 2/2；正式 0 | 2/2 | true-icons | registry-set+full-p1-p2-transaction-matrix |
| 66 | get_sun_sutra_value | `mgzh + tflj + tdlzj` | `_dzj` 地藏戒 | 4/0/0 | equipment/equipment/equipment→equipment | 验收库存 4/4；正式 0 | 4/4 | true-icons | registry-set+full-p1-p2-transaction-matrix |
| 67 | get_sun_sutra_value | `shsjt + _dzj + lly` | `dzjj` 地藏金戒 | 4/0/0 | equipment/equipment/equipment→equipment | 验收库存 4/4；正式 0 | 4/4 | true-icons | registry-set+full-p1-p2-transaction-matrix |
| 68 | get_sun_sutra_value | `bxhy + zhhz + phhl` | `hy` 花宴 | 4/0/0 | equipment/equipment/equipment→equipment | 验收库存 4/4；正式 0 | 4/4 | true-icons | registry-set+full-p1-p2-transaction-matrix |
| 69 | get_mingding_huayan | `hy + wpxih + wpjt` | `mdhy` 命定花宴 | 4/0/0 | equipment/items/items→equipment | 验收库存 4/4；正式 0 | 4/4 | true-icons | registry-set+full-p1-p2-transaction-matrix |
| 70 | get_sutra_value | `wpyh + wpzh + wpjh` | `wpxih` 羲火 | 4/0/0 | items/items/items→items | 验收库存 4/4；正式 0 | 4/4 | true-icons | registry-set+full-p1-p2-transaction-matrix |
| 71 | get_sutra_value | `wpkt + wpyt + wpdt` | `wpjt` 钧铁 | 4/0/0 | items/items/items→items | 验收库存 4/4；正式 0 | 4/4 | true-icons | registry-set+full-p1-p2-transaction-matrix |
| 72 | get_sutra_value | `bxg + bxg + bxg` | `hxg` 含羞狗 | 2/0/0 | equipment/equipment/equipment→equipment | 验收库存 2/2；正式 0 | 2/2 | true-icons | registry-set+full-p1-p2-transaction-matrix |
| 73 | get_sutra_value | `hxg + bxg + yxqyzstx` | `ssg` 色色狗 | 4/0/0 | equipment/equipment/equipment→equipment | 验收库存 4/4；正式 0 | 4/4 | true-icons | registry-set+full-p1-p2-transaction-matrix |
| 74 | get_sutra_value | `ssg + bxg + jlqyzstx` | `lsg` 蓝瘦狗 | 4/0/0 | equipment/equipment/equipment→equipment | 验收库存 4/4；正式 0 | 4/4 | true-icons | registry-set+full-p1-p2-transaction-matrix |
| 75 | get_sutra_value | `lsg + bxg + ssqyzstx` | `yng` 怨念狗 | 4/0/0 | equipment/equipment/equipment→equipment | 验收库存 4/4；正式 0 | 4/4 | true-icons | registry-set+full-p1-p2-transaction-matrix |
| 76 | get_sutra_value | `yng + bxg + csqyzstx` | `dgg` 独孤狗 | 4/0/0 | equipment/equipment/equipment→equipment | 验收库存 4/4；正式 0 | 4/4 | true-icons | registry-set+full-p1-p2-transaction-matrix |
| 77 | get_sutra_value | `rls + rls + rls` | `gjrls` 高级熔炼石 | 2/0/0 | items/items/items→items | 验收库存 2/2；正式 0 | 2/2 | true-icons | registry-set+full-p1-p2-transaction-matrix |
| 78 | get_sutra_value | `yhs + yhs + yhs` | `gjyhs` 高级玉衡石 | 2/0/0 | items/items/items→items | 验收库存 2/2；正式 0 | 2/2 | true-icons | registry-set+full-p1-p2-transaction-matrix |
| 79 | get_sutra_value | `tss + tss + tss` | `gjtss` 高级天枢石 | 2/0/0 | items/items/items→items | 验收库存 2/2；正式 0 | 2/2 | true-icons | registry-set+full-p1-p2-transaction-matrix |
| 80 | get_sutra_value | `ttlpsp1 + ttlpsp2 + ttlpsp3` | `ttlp` 通天令牌 | 4/0/0 | items/items/items→items | 验收库存 4/4；正式 0 | 4/4 | true-icons | registry-set+full-p1-p2-transaction-matrix |
| 81 | get_sutra_value | `kly3 + kly3 + kly3` | `kly4` 4级昆仑玉 | 2/0/0 | items/items/items→items | 验收库存 2/2；正式 0 | 2/2 | true-icons | registry-set+full-p1-p2-transaction-matrix |
| 82 | get_sutra_value | `kly4 + kly4 + kly4` | `kly5` 5级昆仑玉 | 2/0/0 | items/items/items→items | 验收库存 2/2；正式 0 | 2/2 | true-icons | registry-set+full-p1-p2-transaction-matrix |
| 83 | direct_static | `xhjxj + wpdh + wpbp` | `cs_wq_glzzs` 广力制作书 | 4/0/0 | equipment/items/items→items | 验收库存 4/4；正式 0 | 4/4 | true-icons | registry-set+full-p1-p2-transaction-matrix |
| 84 | direct_static | `xhmlp + wpdh + wpbp` | `cs_fj_tlzzs` 天龙制作书 | 4/0/0 | equipment/items/items→items | 验收库存 4/4；正式 0 | 4/4 | true-icons | registry-set+full-p1-p2-transaction-matrix |
| 85 | direct_static | `ryjgb + wpdh + wpbp` | `cs_wq_qszzs` 祁水制作书 | 4/0/0 | equipment/items/items→items | 验收库存 4/4；正式 0 | 4/4 | true-icons | registry-set+full-p1-p2-transaction-matrix |
| 86 | direct_static | `mdcqg + wpdh + wpbp` | `cs_wq_llzzs` 琉璃制作书 | 4/0/0 | equipment/items/items→items | 验收库存 4/4；正式 0 | 4/4 | true-icons | registry-set+full-p1-p2-transaction-matrix |
| 88 | direct_static | `mdflc + wpdh + wpbp` | `cs_wq_llzzs` 琉璃制作书 | 4/0/0 | equipment/items/items→items | 验收库存 4/4；正式 0 | 4/4 | true-icons | registry-set+full-p1-p2-transaction-matrix |
| 89 | direct_static | `lhz + wpdh + wpbp` | `cs_wq_rczzs` 若禅制作书 | 4/0/0 | equipment/items/items→items | 验收库存 4/4；正式 0 | 4/4 | true-icons | registry-set+full-p1-p2-transaction-matrix |
| 90 | direct_static | `jcdp + wpdh + wpbp` | `cs_wq_ytzzs` 夷图制作书 | 4/0/0 | equipment/items/items→items | 验收库存 4/4；正式 0 | 4/4 | true-icons | registry-set+full-p1-p2-transaction-matrix |
| 91 | direct_static | `dszk + wpdh + wpbp` | `cs_fj_dzzzs` 斗战制作书 | 4/0/0 | equipment/items/items→items | 验收库存 4/4；正式 0 | 4/4 | true-icons | registry-set+full-p1-p2-transaction-matrix |
| 92 | direct_static | `mdys + wpdh + wpbp` | `cs_fj_jszzs` 金身制作书 | 4/0/0 | equipment/items/items→items | 验收库存 4/4；正式 0 | 4/4 | true-icons | registry-set+full-p1-p2-transaction-matrix |
| 93 | direct_static | `jljs + wpdh + wpbp` | `cs_fj_ztzzs` 旃檀制作书 | 4/0/0 | equipment/items/items→items | 验收库存 4/4；正式 0 | 4/4 | true-icons | registry-set+full-p1-p2-transaction-matrix |
| 94 | direct_static | `tpzy + wpdh + wpbp` | `cs_fj_jtzzs` 净坛制作书 | 4/0/0 | equipment/items/items→items | 验收库存 4/4；正式 0 | 4/4 | true-icons | registry-set+full-p1-p2-transaction-matrix |
| 95 | get_sutra_value | `lssp_1 + lssp_2 + lssp_3` | `lxfs_1` 流邪符石1 | 4/0/0 | items/items/items→items | 验收库存 4/4；正式 0 | 4/4 | true-icons | registry-set+full-p1-p2-transaction-matrix |
| 96 | get_sutra_value | `lssp_4 + lssp_5 + lssp_6` | `lxfs_2` 流邪符石2 | 4/0/0 | items/items/items→items | 验收库存 4/4；正式 0 | 4/4 | true-icons | registry-set+full-p1-p2-transaction-matrix |
| 97 | get_sutra_value | `lssp_7 + lssp_8 + lssp_9` | `lxfs_3` 流邪符石3 | 4/0/0 | items/items/items→items | 验收库存 4/4；正式 0 | 4/4 | true-icons | registry-set+full-p1-p2-transaction-matrix |
| 98 | get_sutra_value | `lxfs_1 + lxfs_2 + lxfs_3` | `lxfb` 流邪 | 4/0/0 | items/items/items→equipment | 验收库存 4/4；正式 0 | 4/4 | true-icons | registry-set+full-p1-p2-transaction-matrix |
| 99 | get_sutra_value | `lxfb + lxzhs + lxzhs` | `sxfb` 沙邪 | 3/0/0 | equipment/items/items→equipment | 验收库存 3/3；正式 0 | 3/3 | true-icons | registry-set+full-p1-p2-transaction-matrix |
| 100 | direct_static | `sxfb + sxzhs + sxzhs` | `yxfb` 渊邪 | 3/0/0 | equipment/items/items→equipment | 验收库存 3/3；正式 0 | 3/3 | true-icons | registry-set+full-p1-p2-transaction-matrix |
| 101 | direct_static | `wpfbyyin + wpfbyyan + wpfbtc` | `tjbg` 太极八卦 | 4/0/0 | items/items/items→equipment | 验收库存 4/4；正式 0 | 4/4 | true-icons | registry-set+full-p1-p2-transaction-matrix |
| 102 | direct_static | `wpxih + wpjt + qpjy` | `fbqpj` 青萍剑 | 4/0/0 | items/items/items→equipment | 验收库存 4/4；正式 0 | 4/4 | true-icons | registry-set+full-p1-p2-transaction-matrix |
| 103 | direct_static | `xlthzzs + wphlz + wphlz` | `lyrzzs` 烈焰刃制作书 | 3/0/0 | items/items/items→items | 验收库存 3/3；正式 0 | 3/3 | true-icons | registry-set+full-p1-p2-transaction-matrix |
| 104 | direct_static | `xleyzzs + wphlz + wphlz` | `ylkjzzs` 炎龙铠甲制作书 | 3/0/0 | items/items/items→items | 验收库存 3/3；正式 0 | 3/3 | true-icons | registry-set+full-p1-p2-transaction-matrix |
| 105 | direct_static | `cs_wq_qs + wpxty + wpycjh` | `zxstgzzs` 诛邪弑天棍制作书 | 4/0/0 | equipment/items/items→items | 验收库存 4/4；正式 0 | 4/4 | true-icons | registry-set+full-p1-p2-transaction-matrix |
| 106 | direct_static | `cs_fj_dz + wpzty + wpycjh` | `zxstjzzs` 诛邪弑天甲制作书 | 4/0/0 | equipment/items/items→items | 验收库存 4/4；正式 0 | 4/4 | true-icons | registry-set+full-p1-p2-transaction-matrix |
| 107 | direct_static | `cs_wq_rc + wpxty + wpycjh` | `zxptzzzs` 诛邪破天杖制作书 | 4/0/0 | equipment/items/items→items | 验收库存 4/4；正式 0 | 4/4 | true-icons | registry-set+full-p1-p2-transaction-matrix |
| 108 | direct_static | `cs_fj_zt + wpzty + wpycjh` | `zxptyzzs` 诛邪破天衣制作书 | 4/0/0 | equipment/items/items→items | 验收库存 4/4；正式 0 | 4/4 | true-icons | registry-set+full-p1-p2-transaction-matrix |
| 109 | direct_static | `cs_wq_yt + wpxty + wpycjh` | `zxztpzzs` 诛邪震天耙制作书 | 4/0/0 | equipment/items/items→items | 验收库存 4/4；正式 0 | 4/4 | true-icons | registry-set+full-p1-p2-transaction-matrix |
| 110 | direct_static | `cs_fj_jt + wpzty + wpycjh` | `zxztkzzs` 诛邪震天铠制作书 | 4/0/0 | equipment/items/items→items | 验收库存 4/4；正式 0 | 4/4 | true-icons | registry-set+full-p1-p2-transaction-matrix |
| 111 | direct_static | `cs_wq_ll + wpzty + wpycjh` | `sqmdcqgzzs` 神摩多苍穹弓制作书 | 4/0/0 | equipment/items/items→items | 验收库存 4/4；正式 0 | 4/4 | true-icons | registry-set+full-p1-p2-transaction-matrix |
| 112 | direct_static | `cs_wq_ll + wpxty + wpycjh` | `zxqtczzs` 诛邪擎天铲制作书 | 4/0/0 | equipment/items/items→items | 验收库存 4/4；正式 0 | 4/4 | true-icons | registry-set+full-p1-p2-transaction-matrix |
| 113 | direct_static | `cs_fj_js + wpzty + wpycjh` | `zxqtszzs` 诛邪擎天衫制作书 | 4/0/0 | equipment/items/items→items | 验收库存 4/4；正式 0 | 4/4 | true-icons | registry-set+full-p1-p2-transaction-matrix |
| 114 | direct_static | `cs_wq_gl + wpxty + wpycjh` | `zxztjzzs` 诛邪斩天剑制作书 | 4/0/0 | equipment/items/items→items | 验收库存 4/4；正式 0 | 4/4 | true-icons | registry-set+full-p1-p2-transaction-matrix |
| 115 | direct_static | `cs_fj_tl + wpzty + wpycjh` | `zxttpzzs` 诛邪托天袍制作书 | 4/0/0 | equipment/items/items→items | 验收库存 4/4；正式 0 | 4/4 | true-icons | registry-set+full-p1-p2-transaction-matrix |
| 116 | get_sutra_value | `dgg + wpycjh + wpxty` | `hsmwtx` 混世魔王 | 4/0/0 | equipment/items/items→equipment | 验收库存 4/4；正式 0 | 4/4 | true-icons | registry-set+full-p1-p2-transaction-matrix |
| 117 | direct_static | `xlczzzs + wpslz + wpslz` | `hxkjzzs` 黑犀铠甲制作书 | 3/0/0 | items/items/items→items | 验收库存 3/3；正式 0 | 3/3 | true-icons | registry-set+full-p1-p2-transaction-matrix |
| 118 | direct_static | `xltczzs + wpslz + wpslz` | `lxqzzs` 流星枪制作书 | 3/0/0 | items/items/items→items | 验收库存 3/3；正式 0 | 3/3 | true-icons | registry-set+full-p1-p2-transaction-matrix |
| 119 | direct_static | `xlryzzs + wptlz + wptlz` | `xakjzzs` 雪獒铠甲制作书 | 3/0/0 | items/items/items→items | 验收库存 3/3；正式 0 | 3/3 | true-icons | registry-set+full-p1-p2-transaction-matrix |
| 120 | direct_static | `xltzzzs + wptlz + wptlz` | `zlfzzs` 震雷斧制作书 | 3/0/0 | items/items/items→items | 验收库存 3/3；正式 0 | 3/3 | true-icons | registry-set+full-p1-p2-transaction-matrix |
| 121 | direct_static | `xlyjzzs + wpflz + wpflz` | `fykjzzs` 风鹰铠甲制作书 | 3/0/0 | items/items/items→items | 验收库存 3/3；正式 0 | 3/3 | true-icons | registry-set+full-p1-p2-transaction-matrix |
| 122 | direct_static | `xltszzs + wpflz + wpflz` | `fljzzs` 风轮剑制作书 | 3/0/0 | items/items/items→items | 验收库存 3/3；正式 0 | 3/3 | true-icons | registry-set+full-p1-p2-transaction-matrix |

<!-- crafting-coverage-matrix:end -->

## TASK-SETTINGS-047 差异结论

- 权威集合：112 个唯一配方，分类严格为 `67 direct_static + 41 get_sutra_value + 3 get_sun_sutra_value + 1 get_mingding_huayan`；与现代 registry 的 112 个签名双向无差异。
- fillName 集合：152 个材料、85 个产物、合并后 201 个唯一 fillName。
- 初始现代定义快照：15 个命名定义、53 个掉落表占位定义、133 个缺失定义；该差异已在后续 `TASK-SLICE-119` 消除。
- 初始入口快照：201 个 fillName 中只有 14 个进入测试种子；该验收缺口已在后续 `TASK-SLICE-119` 补为 201/201，但正式获得入口仍为 0。
- 真图标：仅 6/201 已接入，即 `tlzsp/wptlz` 与 `kyg/kyz/kys/kyl`；其余 195 个保持 `source-corpus-ready + locate-symbol`，不得写成 `missing-original`。
- 自动验证：全集 registry 签名已覆盖；只有 8 个配方有显式事务证据，其余 104 个只有集合级验证。规则类别虽有代表测试，但这不等于逐配方事务覆盖。

## TASK-SETTINGS-048 权威物品目录结论

- `tools/generate-crafting-item-catalog.mjs` 从 1.1 `AllEquipment.as` 的 `new MyEquipObj(...)` 静态定义生成 `reference/crafting-item-catalog-1.1.json`，与 112 配方的材料/产物并集严格核对为 201 项。
- 201/201 均有唯一直接 AS3 定义，`confirmed=201`、`conflict=0`、`unresolved=0`；没有使用 1.0 表格补造 1.1 结论。
- 原版类型计数：`zbwq 24`、`zbfj 20`、`zbsp 14`、`zbfb 13`、`zbtx 11`、`zbsz 4`、`zbwp 108`、`wpqhs 7`。
- 现代库存类别映射：`equipment 82`、`items 115`、`fashion 4`、`skillBooks 0`；配方产物中文名与静态目录冲突为 0。
- 该结论关闭的是“定义证据”缺口；当时尚存的现代占位/缺失定义已由后续 `TASK-SLICE-119` 处理。

## TASK-SLICE-119 现代定义与验收库存结论

- 新增独立 `CraftingItemDefinitionRegistry.ts`，从权威目录生成 201/201 个 `EquipmentDefinition`；权威名称、`showId/type/user/quality/color` 覆盖临时身份字段，同时保留既有已校准 stats、description 和 magicWeapon 数据。
- 当前矩阵的现代定义为 `named 201`、`placeholder 0`、`missing 0`；库存类别严格为 82 equipment、115 items、4 fashion、0 skillBooks。
- P1/P2 测试场景各自获得独立验收库存：每个材料 fillName 至少 3 件/3 份，其余产物至少 1 件/1 份，可直接覆盖重复材料配方；该入口明确不是正式掉落或商店来源。
- 合成专项测试覆盖 201 fillName 集合、无临时描述、类别计数、六个已接真图标物品的名称/类型、验收库存数量和 P1/P2 隔离；生产构建通过。

## TASK-SETTINGS-049 真图标全集定位结论

- `reference/crafting-icon-catalog-1.1.json` 覆盖 201/201 个 fillName：既有 6 个 `ready`，其余 195 个全部为 `export-ready`；ambiguous、unresolved 和 missing-original 均为 0。
- `Fusion.as:229-301` 的 17 条产物预览别名已逐项记录；材料槽继续使用自身 fillName 的直接 symbol。
- 资源用途映射以 `assets/EIcon1.swf` 为主；跨包例外为主包 `fbqpj/qpjy` 和 `MagicWeapon2.swf` 的 `mdcqg/wpxty/wpycjh/wpzty`，均有精确 character id。
- 195 个未接 stableKey 已进入 `crafting-items-remaining.csv`，状态均为 `export-ready + export-selectively`；标注校验总计 367 条通过。
- 按首次配方分支和跨包例外拆为 7 个窄批次：30、16、21、34、42、46、6 项；从 `TASK-SLICE-120A` 起逐批接入。

## TASK-SLICE-120A 首批真图标接入结论

- 从恢复源包 `assets/EIcon1.swf` 只选择性导出 `crafting-icons-b001-018` 的 30 个精确 character，没有导出其他批次或全包资源；24 张为 50×50，6 张为 51×51，透明原尺寸保持不变。
- 30 个 PNG 已进入 `public/assets/ui/crafting/items/`，`AssetManifest` 从权威图标目录机械生成 per-item texture key 和精确 provenance；现有视图继续复用同一 `CraftingItemTextureKeys` 映射。
- 标注目录将本批 30 项更新为 `ready`；当前真图标累计 36/201，剩余 165 项为 `export-ready`，批次集合差异为 0。
- 联系表逐张目检通过，未发现错位、重复或损坏；专项测试、系统测试、构建、标注校验和覆盖审计通过。

## TASK-SLICE-120B 宝石图标接入结论

- 从恢复源包 `assets/EIcon1.swf` 只选择性导出 `crafting-icons-b019-038` 的 16 个精确 character，全部为 50×50 透明 PNG；没有导出其他批次或全包资源。
- 16 个生命/魔法/攻击/防御石及商城变体已进入同一 manifest/视图映射管线，目录生成器将对应稳定行机械更新为 `ready`。
- 当前真图标累计 52/201，剩余 149 项为 `export-ready`；联系表逐张目检与命名一致，未发现错位、重复或损坏。
- 专项测试验证 16 个 fillName、EIcon1 provenance 和代表 character 231/244/306；系统测试、构建、标注校验和覆盖审计通过。

## TASK-SLICE-120C 灵珠与升级材料图标接入结论

- 从 `assets/EIcon1.swf` 只选择性导出本批尚未接入的 21 个精确 character；批次内既有 `tlzsp/wptlz` 两项继续复用，不重复导出。
- 21 张 50×50 PNG 覆盖流邪/天字装备、升级石、四种灵珠与碎片和逆渊，联系表逐张目检与权威名称一致。
- 当前真图标累计 73/201，剩余 128 项为 `export-ready`；专项 provenance 测试、系统测试、构建、标注校验和覆盖审计通过。

## TASK-SLICE-120D 高级装备与制作材料图标接入结论

- 从 `assets/EIcon1.swf` 只选择性导出本批 34 个精确 character，保持 50×50 至 52×55 的源图原尺寸。
- 图标覆盖高级装备、特殊继承产物、神秘商人装和铁/火制作材料；联系表逐张目检与权威名称一致。
- 当前真图标累计 107/201，剩余 94 项为 `export-ready`；专项测试、系统测试、构建、标注校验和覆盖审计通过。

## TASK-SLICE-120E 时装、制作书与流邪链图标接入结论

- 42 个 fillName 对应 40 个唯一 EIcon1 character；两组制作书共享 character 163/225，按权威目录复用同源 PNG 并由测试锁定。
- 40 张源图为 50×50 或 51×51，联系表逐张目检覆盖通天令牌、昆仑玉、流邪链、制作书、装备和锻魂材料。
- 当前真图标累计 149/201，剩余 52 项为 `export-ready`；专项测试、系统测试、构建、标注校验和覆盖审计通过。

## TASK-SLICE-120F 后期法宝与诛邪制作书图标接入结论

- 46 个 fillName 对应 37 个唯一 EIcon1 character；10 本诛邪/神摩多制作书共同使用 character 566，按权威目录复用同源 PNG。
- 37 张源图全部为 50×50，联系表逐张目检覆盖转换石、成品装备、法宝和制作书。
- 当前真图标累计 195/201，只剩 6 个跨包项；专项测试锁定共享 566，系统测试、构建、标注校验和覆盖审计通过。

## TASK-SLICE-120G 跨包图标接入结论

- 主包只选择性导出 `qpjy/fbqpj` character 2/3，MagicWeapon2 只导出 `wpxty/wpycjh/wpzty/mdcqg` character 4/6/17/18。
- 6 张均为 50×50，联系表逐张目检与权威名称一致；专项测试锁定源包和 character provenance。
- 图标合同达到 201/201 ready、remaining 0；系统测试、构建、结构、标注校验和覆盖审计通过。

## 同线缺口分组与连续任务

1. `TASK-SETTINGS-048`（已完成）：201 fillName 的权威名称、原版类型和现代库存类别已全部确认。
2. `TASK-SLICE-119`（已完成）：201 个权威现代定义和 P1/P2 验收库存已接入。
3. `TASK-SETTINGS-049`（已完成）：195 个未接图标、17 条预览别名和 7 个窄批次已全部确认。
4. `TASK-SLICE-120A..120G`（已完成）：7 个批次完成 195 个新增图标接入，201/201 图标合同闭合。
5. `TASK-SLICE-121`（已完成）：地图菜单到炼丹炉的进入/退出流程已建立，保留显式 `PlayerSlot` 与关闭退还语义。
6. `TASK-SLICE-122`（已完成）：112 配方的 P1/P2 全事务矩阵、失败路径、正式入口生命周期和运行时真 UI 验收全部闭合。

以上连续任务已全部归档，`LINE-CRAFTING` 无剩余 Ready/Blocked/Planned task。

## 已完成证据

- `VS-042`：合成事务与全部配方注册切片。
- `VS-043`：炼丹炉真 UI 和首个视觉配方族。
- `VS-044`：枯叶灵第二视觉配方族。
- `TASK-SLICE-118`：第二配方真图标接入；其局部完成事实保留，旧的整线关闭结论已撤回。
- `TASK-SLICE-120A`：分支 1-18 的 30 个 EIcon1 真图标已选择性派生、接入、标注和目检。
- `TASK-SLICE-120B`：分支 19-38 的 16 个宝石真图标已选择性派生、接入、标注和目检。
- `TASK-SLICE-120C`：分支 39-58 中尚未接入的 21 个灵珠/升级材料真图标已选择性派生、接入、标注和目检。
- `TASK-SLICE-120D`：分支 59-78 的 34 个高级装备/制作材料真图标已选择性派生、接入、标注和目检。
- `TASK-SLICE-120E`：分支 79-98 的 42 个时装/制作书/流邪链 stableKey 已选择性派生、接入、标注和目检。
- `TASK-SLICE-120F`：分支 99-122 的 46 个后期法宝/制作书 stableKey 已选择性派生、接入、标注和目检。
- `TASK-SLICE-120G`：主包/MagicWeapon2 的 6 个跨包真图标已选择性派生、接入、标注和目检，图标合同 201/201 闭合。
- `TASK-SLICE-121`：新增可点击地图菜单炼丹炉入口；P1/P2 切换会退还旧 owner 材料，关闭会退还所有暂存并回到地图菜单，无需调试键。
- `TASK-SLICE-122`：112 配方 × P1/P2 共 224 条真实事务通过；修复混合装备实例/普通物品堆叠的继承材料事务；运行时入口截图为 `local-resources/regima/task-outputs/task-slice-122-runtime/crafting-map-menu.jpg`，面板截图为同目录 `crafting-panel.jpg`。

## 关闭检查

- [x] 112 配方逐项覆盖矩阵完成。
- [x] 所有材料和产物有正确现代定义与库存类别。
- [x] 所有玩家可见材料和产物完成真图标接入，无例外。
- [x] 合成页从正式地图菜单可达，P1/P2 切换与关闭退还已验证。
- [x] 全规则类别、全库存类别和双玩家路径通过自动验证（224 条事务）。
- [x] 运行时真 UI、入口可见性、资源加载与代表规则事务通过验收。
- [x] 无未完成的 `LINE-CRAFTING` task。
- [x] 用户 `/goal` 明确要求持续推进至功能线完整关闭；强化、分解、制作页签排除项按既定合同保留为独立候选线。

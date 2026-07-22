# 装备工坊行为与几何索引

本文是 `TASK-SETTINGS-059` 对炼丹炉 `Strength / Resolution / Making` 三个未实现子页的权威实现输入。既有 `Fusion` 合成页仍以 `crafting-index.md` 和 `crafting-ui-index.md` 为准，不在本文重复 112 个配方。

## 待证明的可观察问题

1. 强化允许放入哪些装备和材料，成功率、灵魂、失败降级、幸运符与神恩符如何结算？
2. 强化等级如何改变实例属性并进入存档？关闭、切页和切换 owner 时暂存物品如何返还？
3. 分解允许哪些装备，固定灵魂、品质/类型/角色如何决定产物与随机概率？
4. 制作书如何映射基础产物、必需材料、灵魂和最多三个可选宝石；成功、关闭和切页分别消费或返还什么？
5. 三页在 119 容器中的局部坐标、运行时偏移、注册点和可见边界是什么？
6. 现代 P1/P2 inventory owner、装备实例与 V4 存档需要扩展哪些字段？

## 资料与已读调用链

局部 AS3：

- `export/strength/Strength.as:44-589`
- `export/strength/Resolution.as:44-245`
- `export/strength/Making.as:57-510`
- `export/strength/StrengthEquipment.as:62-418`

共享消费者：

- `my/AllEquipment.as:3413-3492`：强化概率和灵魂。
- `my/AllEquipment.as:4242-4390`：分解产物与随机宝石。
- `my/AllEquipment.as:4392-5058`：79 个制作书材料分支。
- `my/MyEquipObj.as:482-618`：强化等级重算实例属性。
- `my/MyEquipObj.as:1007-1134`：实例字段与 `strengthValue` 存取。
- `user/User.as:306-335,490-507`：owner 背包按 fillName 查询/计数。
- `export/pack/PackThings.as:330-339`：119 容器内格子点击统一派发 `SimpleClick`。
- `StrengthEquipment.as:202-360`：显式选择当前 `User` 后构造对应子页和背包。

视觉权威源：

- `local-resources/regima/source/restored-swfs/assets/backpack1.swf`
- character 119 `export.strength.StrengthEquipment`
- character 198 `export.strength.Strength`
- character 177 `export.strength.Resolution`
- character 152 `export.strength.Making`

旧提取集仅用于 AS3 行为；视觉、SymbolClass 和 MovieClip 以恢复 SWF 及其选择性派生 SVG 为准。

## 六段证据矩阵

| 行为合同项 | 局部证据 | 共享调用链 | 几何/坐标证据 | 证据等级 | 未知与反证条件 | 验证方式 |
| --- | --- | --- | --- | --- | --- | --- |
| owner 与四标签 | `StrengthEquipment.equipStrength/strMethod/resMethod/makeMethod` | `PackThings -> SimpleClick -> 当前子页`；每个子页只读写构造时注入的 `User` | 119 根；角色选择器 `(42+(n-1)*90,14.85)`；背包 `(512.8,130)` | 交叉确认 | 原版按角色中文名反查 owner 会在同角色双人时串号；现代必须使用显式 player slot | P1/P2 隔离测试 + 四标签运行观察 |
| 标签/关闭返还 | 子页 `REMOVED_FROM_STAGE` 清理；强化/制作返还槽中物品，分解返还未提交装备 | `removeEquipCont()` 切标签触发子页 removed；容器 back 恢复游戏或 `SelectOver` | 198/177 偏移 `(175.6,128.45)`；152 偏移 `(175.6,110.45)` | 交叉确认 | 切换玩家强制回强化页是原版流程；现代若保持当前标签须标设计选择 | 各页放入后切页/关闭/换 owner 事务测试 + 页面观察 |
| 强化准入 | `Strength.receiveObj()` | 装备来自 owner `zblist/szlist`；材料来自 `djlist` | 198：装备槽、3 强化石槽、幸运/神恩槽均为 67×66 | 确认事实 | 标题 `zbtx` 拒绝；等级 7 拒绝；普通武器/防具/饰品/时装/空 type 可用；特定神器白名单见下文 | 准入矩阵测试 |
| 强化概率与灵魂 | `Strength.changeLuck/doStrength/afterReadStore` | `AllEquipment.getStrengthNumber/transLevelTNeedlh` | 成功率/灵魂文本位于 198 局部 `(250.55,270.05)` / `(86,270)` | 确认事实 | 必须注入随机源；不得把 UI 百分比取整当实际概率 | 每级×石级×三槽概率测试 + 运行文本观察 |
| 强化成功/失败 | `afterReadStore()` 成功 `+1`；失败且当前 `>=3` 时 `-1`，神恩符阻止降级 | `MyEquipObj.upStrengthValue -> strengthenEquip`；提交后所有材料消耗，装备回 owner 背包 | 结果通过提示层显示；没有结果时间轴 | 确认事实 | 原代码点击无装备会先解引用，是缺陷；现代应安全拒绝 | 确定性成功/失败/保底/返还测试 |
| 强化实例与存档 | `MyEquipObj.strengthenEquip/getEquipSaveObj/setEquipSaveObj` | 基础属性与 `strengthLevel * aStrengthen[field]` 相加；存档第 24 段为 `strengthValue` | 不适用：数据合同 | 确认事实 | 现代 `EquipmentInstance`/V4 尚无强化级和实例属性覆写，`TASK-SLICE-138B` 必须升级并迁移旧档 | 属性纯函数、V4 round-trip 和旧档迁移测试 |
| 分解准入与提交 | `Resolution.receiveObj/fjClick` | 只接收 `zbwq/zbfj/zbsp`；从 owner `zblist` 暂存；提交固定消耗 100 灵魂 | 177：材料槽 `(127.35,10.35)`；6 结果槽两行 | 确认事实 | 灵魂不足原版无提示；现代可安全反馈，不改变消费规则 | 类型/灵魂/关闭返还测试 |
| 分解产物 | `AllEquipment.findResolution` | 品质给基础材料次数与宝石循环；神器还有专属概率产物 | 结果最多写入 `resu1..6`；当前可达分支最多 6 个 | 确认事实 | `优秀` 的宝石循环因后减变量实际为 0%；必须保留此可观察缺陷，除非用户明确要求修正 | 固定随机序列产物矩阵 + 六槽观察 |
| 制作书与必需材料 | `Making.receiveObj/findNeedMaterialByName/dzClick` | showId 分类 `zzs`；最多两种必需材料，提交时从 owner 背包按 count 扣除 | 152：书槽、2 需求槽、3 宝石槽、产物槽 | 确认事实 | `zxqtgzzs` 只有 switch 分支、`AllEquipment` 无静态定义，因此原版不可达；不纳入现代 registry | 78 个可达书分支数据测试 + 不可达拒绝测试 |
| 制作灵魂与产物 | `needLHValueByQuality/achieveWhichProduce` | 产物 fillName = 书 fillName 去掉末尾 `zzs`；基础定义从 `AllEquipment` 取得 | 灵魂/名称文本和产物槽见几何表 | 确认事实 | `Math.random()` 加在整数后再转 `uint`，所以六种已处理品质费用实际固定；邪灵/魂器/神器默认 0 | 品质费用、产物 id、旧书缺失测试 |
| 制作可选宝石 | `Making.randomGemAttributeByGemName` | 最多三个 `bs` 宝石；放槽即暂存，成功消费，关闭返还；属性直接写入产物实例 | 三宝石槽为 67×66 | 确认事实 | 当前现代实例只有 definition stats，必须保存每件产物的随机属性覆写 | 每个宝石边界随机、三槽累计、V4 重载测试 |
| 双重验证 | 三子页与共享 119 调用链均已闭合 | 现代应由 inventory transaction owner 命令并写当前槽 | 真 SVG 可直接组合，不从离台全边界推断舞台 | 现代设计选择 | 本逆向 task 不修改运行时；实现完成前不得标“已复现” | 专项确定性测试 + 940×590 P1/P2 四标签/关闭/重载观察 |

影响实现的未知项为零。`zxqtgzzs` 被证实为不可达死分支，不是待猜的配方；帮助按钮和幻兵明确排除。

## 强化合同

### 准入与消费

- 目标最高强化等级为 7；当前等级 `>=7` 拒绝。
- `zbtx` 拒绝。常规准入类型为 `zbwq/zbfj/zbsp/zbsz/空 type`。
- `hy/_dzj/dzjj` 或品质“神器”的目标默认拒绝；仅 `sqmdcqg/zxstg/zxstj/zxptz/zxpty/zxztk/zxztp/zxqtc/zxqts/zxztj/zxttp` 白名单可强化。
- 三个强化石槽各消费 1 个任意 `wpqhs`。至少有一个石头才可提交。
- `wpxyf` 幸运符把当前累计概率增加 25%，即 `p := min(1, p * 1.25)`；只允许 1 个。
- `wpbdf` 神恩符只在失败且目标当前等级 `>=3` 时阻止 `-1`；只允许 1 个。
- 一次有效提交先扣灵魂，再判定；成功或失败都消费所有强化石、幸运符和神恩符，目标装备回 owner 背包。

### 单颗强化石概率

行是强化石等级 `elevel`，列是目标当前强化等级 0..6；三颗概率相加后封顶 1。

| 石级 | +0 | +1 | +2 | +3 | +4 | +5 | +6 |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | 0.375 | 0.0937 | 0.0234 | 0.0058 | 0 | 0 | 0 |
| 2 | 1 | 0.375 | 0.0937 | 0.0234 | 0.0058 | 0 | 0 |
| 3 | 1 | 1 | 0.375 | 0.0937 | 0.0234 | 0.0058 | 0 |
| 4 | 1 | 1 | 1 | 0.375 | 0.1 | 0.04 | 0.01 |
| 5 | 1 | 1 | 1 | 1 | 0.375 | 0.15 | 0.05 |

UI 显示 `floor(p*100)%`，实际比较仍使用未取整的 `p`。

### 灵魂与实例属性

| 当前强化等级 | 0 | 1 | 2 | 3 | 4 | 5 | 6 |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 灵魂 | 200 | 500 | 1000 | 4000 | 8000 | 13000 | 20000 |

成功 `strengthLevel += 1`；失败在当前等级 0..2 不降级，在 3..6 降 1，神恩符阻止该降级。每个可强化字段的可观察值为：

```text
effectiveField = persistedBaseField + strengthLevel * aStrengthen[field]
```

适用字段：攻击、防御、HP、MP、暴击、闪避、回血、回蓝、魔抗、吸血、穿透、护盾。存档保存基础字段和 `strengthValue`，加载静态定义的 `aStrengthen` 后重新计算增量。

## 分解合同

### 基础材料映射

- `wpEquip18 = wpsc / 丝绸`
- `wpEquip19 = wpxt / 玄铁`
- `wpEquip20 = wptm / 檀木`
- `wpEquip71 = yhs / 玉衡石`
- `wpEquip72 = tss / 天枢石`
- `wpEquip130 = wpzty / 照天印`
- `wpEquip131 = wpxty / 形天印`
- `wpEquip132 = wpycjh / 原初精华`

### 品质产物

| 品质 | 基础材料次数 | 一级宝石循环 | 额外/特殊 |
| --- | ---: | ---: | --- |
| 普通 | 1 | 0 | 无 |
| 优秀 | 2 | 1，但实际 0 次命中 | 原代码后减后阈值为 `0` |
| 精良 | 3 | 2 | 第一次 30%，第二次 0% |
| 史诗 / 邪灵 | 4 | 2 | 第一次 30%，第二次 0% |
| 传说武器 | 1 | 2 | 先固定 3×`tss` |
| 传说防具 | 1 | 2 | 先固定 3×`yhs` |
| 传说饰品 | 0 | 6 | 概率依次 100%、100%、90%、60%、30%、0% |
| 神器 `sq*` 武器 | 1 | 2 | 固定 `wpycjh`；20.8% 额外 `wpxty` |
| 神器 `sq*` 防具 | 1 | 2 | 固定 `wpycjh`；20.4% 额外 `wpzty` |
| 其他神器 | 0 | 6 | 与传说饰品宝石概率相同 |

每次基础材料选择：

- 武器或饰品：`wpxt` / `wptm` 各 50%。
- 防具且 owner 限定为悟空/白龙：`wpxt` / `wpsc` 各 50%。
- 防具且 owner 限定为唐僧/沙僧：固定 `wpsc`。
- 防具且 owner 限定为八戒：固定 `wpxt`。

一级宝石候选为 `sms1/mfs1/gjs1/fys1`，由 `1 + round(random*3)` 选择，概率约为 `1/6, 1/3, 1/3, 1/6`。提交固定扣 100 灵魂并销毁装备；产物同调用栈进入 owner 背包，结果槽只展示、不可领取。

## 制作书合同

### 灵魂、产物与可选宝石

- 可达书必须 `findUsedByShowId() == "zzs"`。
- 产物 id 为 `bookFillName.slice(0,-3)`；制作书本体在成功时消耗。
- 品质费用：粗糙 50、普通 100、优秀 200、精良 400、史诗 800、传说 1600；邪灵、魂器、神器和未知品质走 default 0。这是原版代码事实，不补收现代费用。
- 必需材料最多两种，只检查/扣除 `djlist` 堆叠；不足时不消费。
- 三个可选槽只接受 `findUsedByShowId() == "bs"`。成功消费，关闭/切页返还。

宝石实例加成：

| fillName | 属性 | 原版随机值 |
| --- | --- | --- |
| `sms1/sms2/scsms2/sms3/scsms3` | HP | round(20+U×15) / round(145+U×15) / round(245+U×15) |
| `mfs1/mfs2/scmfs2/mfs3/scmfs3` | MP | round(15+U×5) / round(105+U×5) / round(195+U×5) |
| `gjs1/gjs2/scgjs2/gjs3/scgjs3` | 攻击 | round(9+U) / round(15+U×5) / round(35+U×5) |
| `fys1/fys2/scfys2/fys3/scfys3` | 防御 | round(14+U) / round(49+U) / round(89+U) |
| `wptlz` | 魔抗 | `0.01 + U×0.01` |
| `wpllz` | 暴击 | `0.01 + U×0.01` |
| `wphlz` | 回血 | `8 + round(U)` |
| `wpflz` | 闪避 | `0.01` |
| `wpslz` | 回蓝 | `4 + round(U)` |

`U` 是 `[0,1)` 随机源。多个宝石直接累加到产物实例基础字段。

### 79 个 switch 分支材料表

材料别名：`SC=丝绸(wpsc)`、`XT=玄铁(wpxt)`、`TM=檀木(wptm)`、`YH=玉衡石(yhs)`、`TS=天枢石(tss)`、`GYH=高级玉衡石(gjyhs)`、`GTS=高级天枢石(gjtss)`、`ZTY=照天印(wpzty)`、`XTY=形天印(wpxty)`、`YC=原初精华(wpycjh)`。

| 制作书 fillName | 必需材料 |
| --- | --- |
| `whgzzs` | TM×20 |
| `jmczzs` | TM×10 + XT×10 |
| `bspzzs` | SC×20 |
| `dtkzzs` | XT×20 |
| `wtpzzs` | TM×20 + XT×20 |
| `yhjzzs` | SC×20 + XT×20 |
| `jmyzzs` | SC×40 |
| `tfljzzs` | SC×20 + XT×20 |
| `mgzhzzs` | TM×20 + XT×40 |
| `hljhzzs` | SC×80 |
| `wsjgzzs` | XT×80 |
| `ydjgzzs` | TM×40 + XT×40 |
| `tdlzjzzs` | TM×40 + XT×80 |
| `xleyzzs`, `xlnyzzs` | SC×80 + XT×80 |
| `xlczzzs`, `xlyjzzs` | SC×160 |
| `xlryzzs`, `xltzzzs` | XT×160 |
| `xlthzzs`, `xltqzzs`, `xltszzs` | TM×80 + XT×80 |
| `xltczzs` | TM×160 |
| `llyzzs` | YH×3 + TS×3 |
| `qlgzzs`, `plzzzs`, `_cljzzs`, `ylfzzs`, `jlczzs`, `jlgzzs` | YH×3 + XT×300 |
| `qljzzs`, `plpzzs`, `clpzzs`, `ylkzzs`, `jljzzs` | TS×3 + SC×300 |
| `ryjgbzzs`, `xhjxjzzs`, `lhzzzs`, `jcdpzzs`, `mdflczzs`, `mdcqgzzs` | YH×7 + XT×999 |
| `dszkzzs`, `xhmlpzzs`, `jljszzs`, `tpzyzzs`, `mdyszzs` | TS×7 + SC×999 |
| `bxhyzzs` | ZTY×3 + SC×1888 |
| `zhhzzzs` | XTY×3 + XT×1888 |
| `phhlzzs` | YC×3 + TM×1888 |
| `cs_fj_dzzzs`, `cs_fj_tlzzs`, `cs_fj_jszzs`, `cs_fj_jtzzs`, `cs_fj_ztzzs` | YH×7 + SC×888 |
| `cs_wq_llzzs`, `cs_wq_qszzs`, `cs_wq_glzzs`, `cs_wq_rczzs`, `cs_wq_ytzzs` | TS×7 + XT×888 |
| `zxstgzzs`, `zxptzzzs`, `zxztpzzs`, `zxqtczzs`, `sqmdcqgzzs`, `zxqtgzzs`（不可达）, `zxztjzzs` | GTS×5 + XT×999 |
| `zxstjzzs`, `zxptyzzs`, `zxztkzzs`, `zxqtszzs`, `zxttpzzs` | GYH×5 + SC×999 |
| `ylkjzzs`, `hxkjzzs`, `xakjzzs`, `fykjzzs` | SC×80 + XT×80 |
| `lyrzzs`, `lxqzzs`, `zlfzzs`, `fljzzs` | XT×160 |

这里列出 switch 的全部 79 个 case；其中 78 个在 `AllEquipment` 静态目录可达，`zxqtgzzs` 无定义。实现使用表驱动 registry，不复制 AS3 switch。

## 几何与坐标语义

所有子页坐标都是自身 MovieClip 局部左上注册空间；现代在 119 根内加运行时偏移，不把 SVG 导出边界当舞台坐标。119 最终显示仍裁为 940×590。

### 强化 198（369.95×350.95，根偏移 175.6/128.45）

| 实例 | 局部 X/Y | 尺寸 |
| --- | --- | --- |
| `qhmc1/qhmc2/qhmc3` | 113/13；204.85/103；113/190.95 | 67×66 |
| `zbmc` | 113/103 | 67×66 |
| `luckmc/baodimc` | 14/53；13/143 | 67×66 |
| `txt_needlh/txt_success` | 86/270；250.55/270.05 | 101×22.05；72.4×22.05 |
| `qhbtn` | 77/299.8 | 139×49 |

### 分解 177（363×370.6，根偏移 175.6/128.45）

| 实例 | 局部 X/Y | 尺寸 |
| --- | --- | --- |
| `material` | 127.35/10.35 | 67×66 |
| `resu1..3` | 30/128.35；129.35/128.35；225.5/128.35 | 各 67×66 |
| `resu4..6` | 30/206.95；128.5/206.95；225.5/206.95 | 各 67×66 |
| `txt_needlh` | 99.5/285.65 | 106.45×22.05 |
| `fjbtn` | 84/316.05 | 139×49 |

### 制作 152（363×385.95，根偏移 175.6/110.45）

| 实例 | 局部 X/Y | 尺寸 |
| --- | --- | --- |
| `makingbook` | 115.95/13 | 67×66 |
| `needmaterial1/2` | 15/91.45；170.95/90.45 | 67×66 |
| `material1/2/3` | 16/162.45；128/162.45；245/163.85 | 67×66 |
| `makeObj` | 16/281.45 | 67×66 |
| `txt_needlh/txt_name` | 170.95/312；170.95/281 | 105×22.05 |
| `dzbtn` | 83/333.8 | 139×49 |

## 现代实现映射与门禁

`TASK-SLICE-138A..138D` 按 Goal 边界逐步建立 owner-aware workshop transaction system：`138A` 先闭合容器/四标签/Fusion 与暂存返还，`138B` 接强化实例/V4，`138C` 接分解，`138D` 接制作书。页面只渲染和发命令，随机源、库存扣除、装备实例创建/销毁和持久化全部由系统 owner 完成。

必须先扩展现代装备实例：

- `strengthLevel: 0..7`
- `baseStatsOverride` 或等价实例属性快照，用于制作书宝石随机值
- 可选的 `strengthGrowth` 仍来自 definition，不重复写入每个存档
- Save schema 新版本或向后兼容的 V4 可选字段；旧档默认 `strengthLevel=0`、无实例覆写

原子性要求：验证 owner、槽位、数量、灵魂和目标后一次提交；失败不得产生半扣库存。强化随机失败仍是成功提交并消费材料。关闭/切页只返还尚未提交的暂存对象，不写随机结果。

## 验收矩阵

自动验证：

- 强化 5×7 概率表、三槽累加/封顶、幸运 1.25、灵魂、成功、失败降级、神恩保底、等级 7 和准入白名单。
- 分解各品质/类型/角色、宝石后减概率、神器 20.8%/20.4%、100 灵魂、关闭返还。
- 78 个可达制作书、1 个不可达死分支、材料/灵魂、三宝石随机边界、产物实例、关闭返还。
- P1/P2 inventory/soul/实例隔离；当前槽保存、重载和旧档迁移。
- Fusion 既有 112×P1/P2 事务完整回归。

运行验证：

- 940×590 正式地图入口打开 119 真容器，四标签均显示 198/169/177/152 真子页。
- P1/P2 选择器、背包分页、暂存/撤回、切标签返还、关闭返回地图。
- 各页至少一条成功事务和一条拒绝/失败事务；重载后强化等级、制作随机属性和库存一致。
- console 无 error/warning。只有自动测试或单页截图均不足以标记 FUI-10..14 已复现。

## 排除项

- `FusionHelp` / 三页 `btn_help` 没有可达绑定，不新增帮助流程。
- `skinClick` 原版固定提示“暂不开放”，幻兵不在本切片实现。
- 不扩展 78 本可达制作书之外的现代配方，不把 1.0 表覆盖 1.1 AS3。
- 不复刻中文角色名反查导致的双人串号、无装备点击空引用或灵魂不足静默；安全拒绝属于现代兼容，不改变事务规则。

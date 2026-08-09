# TASK-SETTINGS-167 炼丹炉左侧四页证据

结论：198/169/177/152 的帧 1 是稳定的原生槽位骨架；物品、配方名称、费用、成功率与产物由四个页面类写入既有实例或动态 `ShowObj` child。强化成功/失败、合成成功和大多数拒绝反馈由全局 `gc.ts` 显示，打造条件不满足则静默。页面内部没有当前现代实现的页底多行状态区。

## 证据等级与来源

| 等级 | 本任务证据 |
| --- | --- |
| 确认事实 | 恢复源 `assets/backpack1.swf` SHA-256 `70C1F1B535EA789AD9C77556F90C7C107084278A4D1773E31471F2B4D7454936`；FFDec XML SHA-256 `7D98F09D0921778BD775AC0199E921C99796C2CAB4DBE75AAC6898984C046D7C`；四页选择性 PNG/SVG 导出。 |
| 交叉确认 | `StrengthEquipment.as` 的根位置与四个页面类的实例写入/动态 child/提交路径，对照 XML depth、instanceName 和 SVG 几何一致。 |
| 推断 | 无影响首批实现的推断。FFDec `<use>` 的 width/height 记作导出包络，不宣称等同逐像素 alpha bounds。 |
| 未知 | 零。运行时物品身份是输入 fixture，不是页面固定视觉；因此不伪造唯一“有材料截图”。 |
| 现代设计选择 | 安全拒绝可保留，但必须走原版全局反馈层；不得继续显示页底多行摘要。P1/P2 selector 属于 character 119 宿主，不纳入四个子页 manifest。 |

四页 truth 均只把可重复的帧 1 骨架作为像素 baseline；有材料、产物和反馈由下方状态拓扑与 AS3 证据定义。这样避免把任意现代库存 fixture 冒充原版固定画面。

## strength

根：character 198 / `export.strength.Strength`，宿主位置 `(175.6,128.45)`，可见包络 `369.95×350.95`。

| depth | character / 实例 | 类型 | 局部 x/y | 导出包络 |
| ---: | --- | --- | --- | --- |
| 2 | 178 / 匿名 | shape | 0/0 | 247.55×30.4 |
| 3 | 179 / `txt_needlh` | text | 86/270 | 101×22.05 |
| 4 | 180 / `txt_success` | text | 250.55/270.05 | 72.4×22.05 |
| 5 | 159 / 匿名 | shape | -4/-12 | 363×48 |
| 6 | 185 / `qhbtn` | button | 77/299.8 | 139×49 |
| 8/10/14 | 188 / `qhmc3/2/1` | slot sprite | 113/190.95；204.85/103；113/13 | 各 67×66 |
| 12 | 191 / `zbmc` | slot sprite | 113/103 | 67×66 |
| 16 | 194 / `baodimc` | slot sprite | 13/143 | 67×66 |
| 18 | 197 / `luckmc` | slot sprite | 14/53 | 67×66 |

- `qhbtn`：up=182，over/down/hit=184；down 相对 y `+2`。
- `txt_needlh` 写下一等级灵魂费用；`txt_success = floor(probability*100) + "%"`。
- `zbmc/qhmc1..3/baodimc/luckmc` 在槽容器原点附加所选对象的 `ShowObj`。空态无 child；暂存态增加 child；提交后清空材料并返还或更新目标装备。
- 强化成功、失败、灵魂不足均是全局提示；失败可能降级，神恩符分支保底。页面骨架本身不切换帧。

## fusion

根：character 169 / `export.strength.Fusion`，宿主位置 `(175.6,128.45)`，可见包络 `374×361.95`。

| depth | character / 实例 | 类型 | 局部 x/y | 导出包络 |
| ---: | --- | --- | --- | --- |
| 3 | 155 / 匿名 | shape | 0/0 | 172.55×65.05 |
| 4/5/6 | 156/157/158 / `txt_name/txt_success/txt_needlh` | text | 126.85/247；257.55/247；166.85/283 | 71×22.05；73.45×22.05；163.15×22.05 |
| 7 | 159 / 匿名 | shape | 0/0 | 363×48 |
| 8 | 164 / `rlbtn` | button | 83/312.95 | 139×49 |
| 10 | 165 / 匿名 | shape | 0/0 | 50×50 |
| 11/17/19 | 168 / `material3/2/1` | slot sprite | 203.85/93.95；105.85/14；8/93.95 | 各 67×66 |
| 13/15 | 142 / `produce/preview` | slot sprite | 107.85/169.95；13/244.9 | 各 67×66 |

- `rlbtn`：up=161，over/down/hit=163；down 相对 y `+2`。
- 三个 material 容器附加 `ShowObj`；命中配方后 `preview` 加名为 `view` 的图像，`txt_name` 写配方名，费用固定 `1000`，成功率固定 `100%`。
- 成功后 `produce` 获得产物 child；“合成成功”和灵魂不足走全局提示，不在页面新增文字。

## resolution

根：character 177 / `export.strength.Resolution`，宿主位置 `(175.6,128.45)`，可见包络 `363×370.6`。

| depth | character / 实例 | 类型 | 局部 x/y | 导出包络 |
| ---: | --- | --- | --- | --- |
| 1 | 170 / 匿名 | shape | 0/0 | 82×29 |
| 2 | 171 / `txt_needlh` | text | 99.5/285.65 | 106.45×22.05 |
| 3 | 159 / 匿名 | shape | 0/5 | 363×48 |
| 4 | 176 / `fjbtn` | button | 84/316.05 | 139×49 |
| 6/8/10 | 142 / `resu6/5/4` | slot sprite | 225.5/206.95；128.5/206.95；30/206.95 | 各 67×66 |
| 12/14/16 | 142 / `resu3/2/1` | slot sprite | 225.5/128.35；129.35/128.35；30/128.35 | 各 67×66 |
| 18 | 165 / 匿名 | shape | 23.15/-24.55 | 50×50 |
| 19 | 168 / `material` | slot sprite | 127.35/10.35 | 67×66 |

- `fjbtn`：up=173，over/down/hit=175；down 相对 y `+2`。
- 只接收武器、防具、饰品；material 加目标 `ShowObj`，费用固定 `100`。
- 提交后 `resu1..6` 依次附加产物 `ShowObj`，child 局部 y 为 `-2`；无页内成功文字。类型不匹配等拒绝走全局提示。

## making

根：character 152 / `export.strength.Making`，宿主位置 `(175.6,110.45)`，可见包络 `363×385.95`。

| depth | character / 实例 | 类型 | 局部 x/y | 导出包络 |
| ---: | --- | --- | --- | --- |
| 3/8/14 | 123/127/134 / 匿名 | shape | 0/0 | 90×250.45；45×63；363×174.5 |
| 4/5 | 124/125 / `txthas1/txtneed1` | text | 121/88；121/124 | 各 41×22.05 |
| 6 | 126 / `txt_needlh` | text | 170.95/312 | 105×22.05 |
| 9/10 | 128/129 / `txthas2/txtneed2` | text | 275.95/88；275.95/124 | 38×22.05；39×22.05 |
| 11 | 130 / `txt_name` | text | 170.95/281 | 105×22.05 |
| 15 | 139 / `dzbtn` | button | 83/333.8 | 139×49 |
| 17 | 142 / `makeObj` | slot sprite | 16/281.45 | 67×66 |
| 19/21/23 | 145 / `material3/2/1` | slot sprite | 245/163.85；128/162.45；16/162.45 | 各 67×66 |
| 25/27 | 148 / `needmaterial2/1` | slot sprite | 170.95/90.45；15/91.45 | 各 67×66 |
| 29 | 151 / `makingbook` | slot sprite | 115.95/13 | 67×66 |

- `dzbtn`：up=136，over/down/hit=138；down 相对 y `+2`。
- 制作书、两类需求材料图、三个宝石和产物分别进入既定容器；四个数量字段、灵魂费用与产物名按书籍/库存变化。
- 没有制作书时提交无操作；条件不满足为静默；成功填充 `makeObj` 并清空已提交暂存项。现代安全反馈可以保留在全局层，不得变成页面原版事实。

## 共用文字与坐标语义

12 个 TextField 全部使用 fontId 25 `FZCuYuan-M03`、15px、白色、leading 2px；字体已存在于 `public/assets/fonts/FZCuYuan-M03.ttf`。上述 x/y 是子页注册点坐标，舞台坐标由 `(175.6,128.45)` 或打造的 `(175.6,110.45)` 组合。SVG 根矩阵只用于把负可见边界归一到导出画布，不能再次加到运行时实例矩阵。

## 视觉基准与当前差异

可复现命令：`npm run generate:workshop-left-baselines` 和 `npm run generate:workshop-left-truth`。四个 940×590 原版基准、左 500px 并排图和 50% 叠图位于 `docs/tasks/evidence/TASK-SETTINGS-167/`。现代侧使用 TASK-SLICE-142 的 940×590 逐页样本；165D 只改变右侧背包，故左侧子树仍是当前有效对照。

| 当前现代可见项 | 原版证据 | 后续动作 |
| --- | --- | --- |
| `(303,86)/(424,86)` 的 26px “P1/P2工坊” | 原版 owner selector 由 119 宿主创建，不属于四子页；现字形、尺寸和命名不是本任务证明的原版子页内容 | 168B 校准宿主 selector，子页不得依赖它承载状态 |
| `(180,482)` 的 9px 多行 `statusText` | 四页无对应 TextField；反馈为全局 toast 或静默 | 168A 删除页底现代摘要，接回原字段/全局反馈 |
| 分解/打造槽位内 Arial 名称 | 原版在容器原点添加 `ShowObj` 图像，页面文字仅为列出的 FZCuYuan 字段 | 168B 用原生物品图/数量投影替换 |
| 当前静态整页 SVG/PNG | 骨架本身来自原版，但动态 child、原字段和按钮态没有完整消费 | 168A/168B 以 verified manifest 分层组合，不再把整页图当完整状态 |

按钮 normal/hover/pressed/selected 由相应 DefineButton2 up/over/down 记录闭合；selected 是现代输入映射，应显示原版 down，而不是新增皮肤。切页/换 owner/关闭会返还未提交暂存物，P1/P2 只改变数据 owner，不改变四页几何。

## 机器真值与完整性

- `task-settings-167-workshop-strength.json`：根 + 11 个帧 1 对象，共 12。
- `task-settings-167-workshop-fusion.json`：根 + 12 个帧 1 对象，共 13。
- `task-settings-167-workshop-resolution.json`：根 + 12 个帧 1 对象，共 13。
- `task-settings-167-workshop-making.json`：根 + 17 个帧 1 对象，共 18。

四份 manifest 均为 `verified`、`displayListMatched=true`、`stateSetMatched=true`、`unresolved=[]`。静态对象集合来自 XML depth 清单；几何来自 XML/SVG；动态拓扑来自页面 AS3。任何实现测试若绕过 manifest 自写槽位坐标，应失败。

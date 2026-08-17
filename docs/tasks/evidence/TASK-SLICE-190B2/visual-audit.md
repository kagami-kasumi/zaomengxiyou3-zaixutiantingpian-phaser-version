# TASK-SLICE-190B2 合成页装备 tooltip 视觉验收

## 验收环境

- 现代运行：`npm run preview`，`http://localhost:4174/`，940×590，2026-08-17。
- 可重复入口：`?qaEquipmentPage=workshop&qaEquipmentRole={1|2}&qaEquipmentOwner={p1|p2}&qaEquipmentCase=fusion-tooltip&qaEquipmentSoul=5000`；仅 localhost QA 生效。
- tooltip 真值：`task-settings-189.equipment-tooltip`，12 状态 / 32 对象，`verified`，`unresolved=[]`。
- 合成页真值：`task-settings-167.workshop-left-pages.fusion`；右栏真值：`task-slice-165d.workshop-inventory`。
- 允许的现代可见例外：无。

## 原版基准与现代状态

| 状态 | 原版 source replay / 显示列表基准 | 现代正式 view/model 运行结果 |
| --- | --- | --- |
| 空态 | [`original-source-replay-normal-hidden-940x590.svg`](../TASK-SETTINGS-189/original-source-replay-normal-hidden-940x590.svg) + 167 fusion empty | 无 tooltip；三材料、preview、produce 保持原槽位空态 |
| 右 grid / 装备材料 | [`original-source-replay-inventory-random-strength-hover-940x590.svg`](../TASK-SETTINGS-189/original-source-replay-inventory-random-strength-hover-940x590.svg) + 167 material1..3 | grid 与当前 material 装备实例显示同一字段、随机基值与强化后缀 |
| 继承 preview | 189 tooltip + 167 `preview` bounds | `_dzj` 只读 preview 显示生命 770、魔法 583、攻击 156、防御 184、暴击 3% |
| 成功 produce | 189 tooltip + 167 `produce` bounds | 提交后真实背包产物显示与 preview 相同数值，灵魂 5000→4000 |
| P2 / 移出 / 重开 | [`original-source-replay-p2-hover-940x590.svg`](../TASK-SETTINGS-189/original-source-replay-p2-hover-940x590.svg)、[`original-source-replay-move-out-hidden-940x590.svg`](../TASK-SETTINGS-189/original-source-replay-move-out-hidden-940x590.svg)、[`original-source-replay-reopened-hover-940x590.svg`](../TASK-SETTINGS-189/original-source-replay-reopened-hover-940x590.svg) | P2 同值；移出立即隐藏；关闭后 C 重开无陈旧 tooltip/材料/preview/produce |

## 生命周期与差异

- 右侧 5×5 grid 继续由 `InventoryGridView` 投影，只给 `entry.kind === 'equipment'` 绑定 hover。
- 三个材料槽、preview、produce 的 hit bounds 直接读取 167 verified manifest；stack 材料不扩张装备 tooltip。
- 材料槽使用原 `EquipmentInstance` 引用；preview 只读实例与正式合成共同调用同一继承函数；produce 使用事务实际加入背包的 `InventoryEntry`。页面不缓存第二份属性或手写 tooltip 坐标。
- P1/P2 均完成空态→三材料→preview→成功→pointerout→关闭/C 重开。fresh 有效 QA tab 的 console warning/error 为 0。
- 首次错误 QA URL（P1 role2 与默认 P2 role2 重复）触发既有 DEV party 合同错误，已改用合法 P1 role1/P2 role2 固定入口；该错误不属于有效验收页，fresh 有效 tab 为零 console。

## 字体与对象差异

- tooltip 的背景、名称、品质/类型/条件、非零属性、说明和灵魂价值继续由 189 运行投影生成；fusion 的 169 Symbol、三个材料槽、preview/produce、字段、按钮、右栏几何和皮肤未替换。
- Phaser Canvas 与 Flash 的字体栅格化、抗锯齿和 GlowFilter 边缘属于既有容差；字段内容、25px 行距、单位、对象层级、根边界与实例刷新不纳入容差。

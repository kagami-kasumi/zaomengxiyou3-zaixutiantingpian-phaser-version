# 标注批次：stage1-pickups

## 范围

- 资源族：Stage 1 生命恢复、魔法恢复、灵魂与战意拾取表现。
- 影响的现代切片/代码：`TASK-SLICE-134`、`AssetManifest.ts`、Stage 1 三关奖励 bridge。
- 本轮包含：`SmallHP`、`BigHP`、`SmallMP`、`auraRed`、`auraWhile` 的符号定位、选择性导出与接入。
- 本轮排除：装备/道具图标、经验地面球（原版经验直接结算）、未被 `BaseMonster.dropAura()` 创建的 `auraBlue/auraGreen`。

## 输入和证据

- 现代 stableKey 入口：`pickup.health.small`、`pickup.health.big`、`pickup.mana.small`、`pickup.soul.primary`、`pickup.soul.bonus`。
- AS3 / SymbolClass：`BaseMonster.addMedicine()/dropAura()`、`BaseAura.step()`、`RoleInfo.addWarriors()`；选择性导出的 `symbols.csv`。
- EVB 源包 / 候选包：`assets/OtherMat1.swf`、`assets/Common1.swf`。
- FFDec 定位命令与结果：`OtherMat1` character `426/428/430`；`Common1` character `102/106`；输出在 `local-resources/regima/task-outputs/stage1-monster-runtime/`。
- 现有图片、shape 或报告：选择性 sprite PNG 与 `public/assets/combat/pickups/` 接入结果。
- 人工证据：用户试玩确认现有颜色占位不是正式 UI，并要求按生命、魔法、灵魂、经验语义命名。

## Agent 调查结论

- 已确认：5 个运行时资源均有恢复 SWF SymbolClass 直接映射；`auraRed` 增加灵魂，`auraWhile` 增加战意；经验不生成地面资源。
- 推测：0。
- 未知：精确逐帧播放速率未见独立常量；现代暂按 50ms/帧循环，属于现代显示选择，不宣称原版帧率。
- 对应标注表：`../annotations/stage1-pickups.csv`

## 人工动作

无；用户可在三关运行时复验尺寸与观感，后续仅做视觉校准。

## 去向

- 可直接接入：5 条，已接入。
- 待定位符号：0。
- 可选择性导出：0。
- 继续使用占位：0。
- 等待来源：0。
- 需要人工消歧：0。
- 进入拆分评估：0。

## 关闭检查

- [x] 每条记录都有 `status`、`confidence` 和 `nextAction`。
- [x] 源包与 character id 由 SymbolClass 直接确认。
- [x] 没有把“尚未选择性导出”误写为 `missing-original`。
- [x] 所有记录均有证据路径。
- [x] 未把颜色俗称写成领域事实。
- [x] 无需额外人工动作。
- [x] 不需要拆分评估。
- [x] 正式接入由 `TASK-SLICE-134` 承担。

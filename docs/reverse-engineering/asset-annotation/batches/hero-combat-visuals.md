# 标注批次：hero-combat-visuals

- 状态：已拆分，等待逐角色定位
- 建立日期：2026-07-31

## 范围与排除

- 本批只建立五角色本体、战斗 UI、普攻、已实现技能及附属对象的共享字段和拆分边界。
- 宠物视觉、未接入的停用技能和现代实现不在本批执行范围。
- 既有 `hero-normal-attacks-remaining.csv`、`hero-skill-effects.csv` 与 `role1-normal-attack.csv` 由逐角色子任务原位更新；本批不复制 stable key，也不把候选包名写成已确认 Symbol。

## 调查结论

- 恢复源分散在五个角色本体包、`Role1Effect`、四个 `SpecialUI` 包，以及白龙独立剑包；不属于单一可机械枚举目录族。
- 因此触发 `TASK-SETTINGS-069` 的固定拆分门禁，调查拆为 `069A..E`，实现拆为 `158A..E`。
- 共享矩阵、显示列表、六段证据和逐状态验收字段见 `../../hero-combat-visuals-index.md`。

## 汇总与去向

- 已确认：5 个角色级候选包族存在，既有两份总标注和 Role1 专项标注可复用。
- 推测：0；包与具体 Symbol 的映射不在父批次猜测。
- 未知：所有逐动作/逐技能 Symbol、帧序、原点、触发和 UI child，转交逐角色子任务。
- 人工动作：当前不需要；子任务先使用 FFDec CLI 窄查与选择性导出。
- 唯一下一步：`TASK-SETTINGS-069A` 定位 Role1，并更新既有标注行。


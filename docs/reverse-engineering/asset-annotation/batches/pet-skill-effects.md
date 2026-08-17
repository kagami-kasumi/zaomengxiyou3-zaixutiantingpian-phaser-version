# 标注批次：pet-skill-effects

- 状态：恢复源已分区，等待逐物种选择性导出
- 首次关闭日期：2026-07-14
- TASK-SETTINGS-193 更新：2026-08-17

## 范围和证据

- 覆盖当前九物种 38 个已实现技能视觉 stableKey；既包含 `PetSkillEffectKeys` 的 24 个旧 key，也补齐虎/凤凰/兔/鼠及 body-action 型技能。
- 证据来自 `AssetManifest.ts`、现代宠物/投射物系统、对应宠物 AS3、`pets-index.md` 和恢复 SWF 的精确 SymbolClass 扫描。
- 标注表：`../annotations/pet-skill-effects.csv`。
- 机器可查 corpus：`../../pet-animation-corpus.json`。

## 结论

- 38 条均已达到 `export-ready + confirmed + export-selectively`；所有精确符号至少命中一个恢复包，不再以旧提取集缺失声明 `missing-original`。
- 重复 SymbolClass 暂按 `20120203 -> 20120808 -> StageCommon` 顺序冻结候选 owner，并把运行时 ApplicationDomain/load precedence 留给对应物种证据 task 交叉确认；这不是视觉已闭合声明。
- `dragon1.fs` 原版视觉是半透明 `PetDragon1` 分身，资源归到 `PetDragonBmd1`，不是现代占位记录中的 `PetDragon1Bullet1`。
- `monkey4.jgaoyi` 主要复用 `PetMonkey4` 本体 `hit5` 动作，归到 `PetMonkeyBmd4`，不是独立 bullet。
- `turtle4.xwaoyi` 复用本体 `hit5` 和 `PetTurtle3Bullet3`；现代 `PetTurtle4Hit5` 只是占位来源名，不应写成原版事实。
- `monkey2.lj` 原版为 `PetMonkey2Bullet2_1/2_2` 两段，`monkey2.xj` 复用 `PetMonkey1Bullet2`，`monkey3.lj` 还包含 `_1` 起手段；现代 sourceSymbol 对这三项不完整或不一致。

这些差异已记录在 CSV，不在标注批次中修改现代战斗代码。九物种已拆为 `TASK-SETTINGS-193A..193Q`（奇数字母证据 task）与 `TASK-SLICE-193B..193R`（偶数字母实现 task）的串行配对；当前无需人工消歧。

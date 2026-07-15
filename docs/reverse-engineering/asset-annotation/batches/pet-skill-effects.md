# 标注批次：pet-skill-effects

- 状态：已迁移，等待源符号定位
- 关闭日期：2026-07-14

## 范围和证据

- 覆盖 `PetSkillEffectKeys` 的 24 个 stableKey。
- 证据来自 `AssetManifest.ts`、现代宠物/投射物系统、对应宠物 AS3 调查结论和 `pets-index.md`。
- 标注表：`../annotations/pet-skill-effects.csv`。

## 结论

- 24 条均为 `source-corpus-ready + confirmed + locate-symbol`。
- `dragon1.fs` 原版视觉是半透明 `PetDragon1` 分身，资源归到 `PetDragonBmd1`，不是现代占位记录中的 `PetDragon1Bullet1`。
- `monkey4.jgaoyi` 主要复用 `PetMonkey4` 本体 `hit5` 动作，归到 `PetMonkeyBmd4`，不是独立 bullet。
- `turtle4.xwaoyi` 复用本体 `hit5` 和 `PetTurtle3Bullet3`；现代 `PetTurtle4Hit5` 只是占位来源名，不应写成原版事实。
- `monkey2.lj` 原版为 `PetMonkey2Bullet2_1/2_2` 两段，`monkey2.xj` 复用 `PetMonkey1Bullet2`，`monkey3.lj` 还包含 `_1` 起手段；现代 sourceSymbol 对这三项不完整或不一致。

这些差异已记录在 CSV，不在标注批次中修改现代战斗代码。恢复语料库可用于定位本体动作与 bullet；当前无需人工消歧，也没有拆分候选。

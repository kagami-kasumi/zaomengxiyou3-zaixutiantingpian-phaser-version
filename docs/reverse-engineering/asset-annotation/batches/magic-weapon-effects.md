# 标注批次：magic-weapon-effects

- 状态：已迁移，等待源符号定位
- 关闭日期：2026-07-14

## 范围和证据

- 覆盖 `MagicWeaponEffectKeys` 的 10 个 stableKey。
- 证据来自 `AssetManifest.ts`、`ProjectileSystem.ts`、`MagicWeaponSystem.ts` 和 `magic-weapons-index.md`。
- 标注表：`../annotations/magic-weapon-effects.csv`。

## 结论

- 10 条均为 `source-corpus-ready + confirmed + locate-symbol`；优先检查恢复的 `MagicWeapon.swf`、`MagicWeapon2.swf` 和相关公共包。
- 青龙剑的 `MagicBigBottleData` 是临时可站平台视觉，不应误归为伤害 projectile。
- `LingPaiEffect` 是起手表现，`ef_snow` 是实际批量落雪 projectile。

当前无需人工消歧，也没有拆分候选。

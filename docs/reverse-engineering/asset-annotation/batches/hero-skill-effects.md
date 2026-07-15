# 标注批次：hero-skill-effects

- 状态：已迁移，等待源符号定位
- 关闭日期：2026-07-14

## 范围和证据

- 覆盖 `SkillProjectileEffectKeys` 的 76 个现代英雄技能 stableKey。
- 证据来自 `AssetManifest.ts`、实际技能系统的 `sourceSymbol`、五个 `Role*.as`、`projectiles-index.md` 和 `role5-combat-index.md`。
- 标注表：`../annotations/hero-skill-effects.csv`。

## 结论

- 76 条均为 `source-corpus-ready + confirmed + locate-symbol`。
- Role2 `jhsj` 起手与第一段共用一个现代 stableKey；标注以原版 `Role2Bullet9_1` 为资源来源。
- Role5 `lxuanj.hit8` 的 `sword_lxuanj2` 已由 AS3/逆向表确认，但该 stableKey 当前只登记在 manifest，尚未被现代系统引用。
- Role5 多龙杀阵的单个 stableKey 对应 `sword_mlsz1..5` 资源族，增强 key 对应 `_1` 变体族。
- Role5 `tlj` 的原版视觉来自本体动作资源 `tlj_sword`；现代 `role5_tlj` sourceSymbol 只是占位名。

## 人工动作和去向

当前不需要人工消歧。对应角色包已恢复；现有稳定 key 和占位行为继续使用，直到精确 MovieClip 定位、选择性导出并通过视觉验收。

# 标注批次：hero-skill-effects

- 状态：Role1..3 已接入，Role4 证据已闭合并等待158D
- 关闭日期：2026-07-14

## 范围和证据

- 覆盖原 `SkillProjectileEffectKeys` 的 76 个现代英雄技能 stableKey，并补录 Role4 已实现但原清单漏记的 `Role4MDS` 与共享 `SpeedUp` 两个可见对象，共 78 条。
- 证据来自 `AssetManifest.ts`、实际技能系统的 `sourceSymbol`、五个 `Role*.as`、`projectiles-index.md` 和 `role5-combat-index.md`。
- 标注表：`../annotations/hero-skill-effects.csv`。

## 结论

- Role4 24 条均已转为 `derived-ready + confirmed + integrate`；其余 54 条沿用各角色当前接入/定位状态。
- Role2 `jhsj` 起手与第一段共用一个现代 stableKey；标注以原版 `Role2Bullet9_1` 为资源来源。
- Role5 `lxuanj.hit8` 的 `sword_lxuanj2` 已由 AS3/逆向表确认，但该 stableKey 当前只登记在 manifest，尚未被现代系统引用。
- Role5 多龙杀阵的单个 stableKey 对应 `sword_mlsz1..5` 资源族，增强 key 对应 `_1` 变体族。
- Role5 `tlj` 的原版视觉来自本体动作资源 `tlj_sword`；现代 `role5_tlj` sourceSymbol 只是占位名。

## 人工动作和去向

当前不需要人工消歧。Role4 精确 MovieClip、帧序、注册 bounds、生命周期与显示层级见 `../../role4-combat-visuals-index.md`，由 `TASK-SLICE-158D` 选择性派生、接入并完成视觉验收；Role5 继续保持待定位。

# 标注批次：hero-normal-attacks

- 状态：已迁移，等待源符号定位
- 关闭日期：2026-07-14

## 范围和证据

- 覆盖 Role2 至 Role5 普攻附属对象，以及 Role1 至 Role5 本体动作族；Role1 四个附属对象见独立批次 `role1-normal-attack.md`。
- 证据来自 `attack-effects-index.md`、`assets-index.md`、五个 `Role*.as`、现代 `HeroNormalAttackSystem.ts` 和 `AssetManifest.ts`。
- 标注表：`../annotations/hero-normal-attacks-remaining.csv`。

## 结论

- 本批 34 条：33 条 `source-corpus-ready + confirmed + locate-symbol`，1 条 `needs-annotation + unknown`。
- Role1 至 Role4 动态服装/武器资源族和 Role5 十二个枪/剑本体动作名称均已确认；角色源包已恢复但尚未逐条定位符号。
- Role5 剑形态 `swordhit1..6` 及增强变体映射已确认。
- Role5 枪形态 `doSingleHit(...)` helper 未恢复；跑攻可见 `Role5runattack`，其余附属对象名不得猜造。

## 人工动作和去向

当前不需要人工判断。`WuKong`、`TangSeng`、`BaJie`、`ShaShen`、`bailongSword` 和 `SpecialUI/*` 包已恢复；后续按角色重开窄批次并定位符号。

尚未定位精确 MovieClip，因此没有条目进入拆分评估。

# 标注批次：hero-normal-attacks

- 状态：Role1..3 已接入，Role4 证据已闭合并等待158D
- 关闭日期：2026-07-14

## 范围和证据

- 覆盖 Role2 至 Role5 普攻附属对象，以及 Role1 至 Role5 本体动作族；Role1 四个附属对象见独立批次 `role1-normal-attack.md`。
- 证据来自 `attack-effects-index.md`、`assets-index.md`、五个 `Role*.as`、现代 `HeroNormalAttackSystem.ts` 和 `AssetManifest.ts`。
- 标注表：`../annotations/hero-normal-attacks-remaining.csv`。

## 结论

- 本批 34 条；Role4 的五个普攻对象与铲/弓本体族已转为 `derived-ready + confirmed + integrate`，Role5 枪形态1条仍为 `needs-annotation + unknown`。
- Role4 已确认18铲身、18弓身、14装备及完整动作 cell 映射；Role5 十二个枪/剑本体动作名称已确认但尚未逐条定位符号。
- Role5 剑形态 `swordhit1..6` 及增强变体映射已确认。
- Role5 枪形态 `doSingleHit(...)` helper 未恢复；跑攻可见 `Role5runattack`，其余附属对象名不得猜造。

## 人工动作和去向

当前不需要人工判断。Role4 精确来源、注册点与生命周期见 `../../role4-combat-visuals-index.md`，交由 `TASK-SLICE-158D` 接入；Role5 后续按独立窄批次定位。

Role4 已完成精确 MovieClip 定位且无需继续拆分；Role5 尚未进入本轮拆分评估。

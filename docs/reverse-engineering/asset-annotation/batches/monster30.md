# 标注批次：monster30

- 状态：已迁移，等待源符号定位
- 关闭日期：2026-07-14

## 范围和证据

- 覆盖怪物本体 `Monster30` 和普攻效果 `Monster30Bullet1`。
- AS3 直接确认 `BaseBitmapDataPool.getBitmapDataArrayByName("Monster30")` 和 `SpecialEffectBullet("Monster30Bullet1")`。
- 现代 manifest 已登记资源族，`monsters-index.md` 已记录动作行和攻击时序。
- 标注表：`../annotations/monster30.csv`。

## 结论

2 条均为 `source-corpus-ready + confirmed + locate-symbol`。AS3 足够完成名称、用途和行为标注；下一步在恢复语料库定位 `Monster30` 与 `Monster30Bullet1`。无需人工消歧，不进入拆分评估。

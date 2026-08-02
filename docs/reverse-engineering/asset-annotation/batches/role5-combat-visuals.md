# 标注批次：Role5 战斗视觉全集

- 状态：已标注并由 `TASK-SLICE-158E` 接入
- 更新日期：2026-08-02

## 范围与证据

- `assets/bailong.swf` 提供13张枪形衣装表、12张装备表、枪普攻1..5和状态/瞬移对象；`assets/bailongSword.swf` 提供剑形动作/换装层、剑普攻、十项已实现技能、随身箭和五阵列对象。
- 主程序 `Role5` P-code、两个目标包及恢复语料库 SymbolClass 精确检索共同解决 `doSingleHit(...,1..5,...) -> Role5Bullet1..5` 身份。
- Symbol/id、帧数、union bounds、hold、生成点、方向、depth、销毁与多实例合同见 `../../role5-combat-visuals-index.md`。
- `Role5runattack` 和枪系若干 helper 名在全部恢复 SymbolClass 中均无定义；它们保持明确反证，不用相似素材猜造。

## 结论与唯一去向

- 确认：双形态本体/换装、枪普攻五对象、剑普攻及强化变体、十项已实现技能、状态/瞬移/四箭/三箭/五阵列和 HUD frame5。
- 推测：0。
- 影响实现的未知：0；`Role5runattack` 是禁止猜造的反证边界。
- 既有 Role5 标注已升级为 `ready + none`，并补齐现代资源目录、manifest与运行bridge去向。
- 允许的现代可见例外为空；`Role5runattack` 保持不可见且不显示现代Arc/Text替代。

## 关闭检查

- [x] 两包及全恢复语料库精确检索、Symbol/id/帧序/几何可追溯。
- [x] 枪/剑动作、换装合成、方向原点和龙魂剑覆盖已冻结。
- [x] 显示列表、940×590 单/双人基准和逐状态差异计划已定义。
- [x] `doSingleHit` 身份已解决；空函数/不可达/无定义引用均有反证，未猜造。
- [x] 行为完成与视觉完成分列；Role5真视觉、HUD与运行bridge已完成接入并由专项门禁覆盖。

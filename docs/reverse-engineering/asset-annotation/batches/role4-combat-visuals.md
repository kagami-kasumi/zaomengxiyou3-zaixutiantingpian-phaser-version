# 标注批次：Role4 战斗视觉全集

- 状态：已接入并关闭（`TASK-SLICE-158D`）
- 更新日期：2026-08-02

## 范围与证据

- `assets/ShaShen.swf` 与 `assets/SpecialUI/ShaShen.swf` 字节相同；普通包为唯一派生 owner，SpecialUI 只作加载兼容。
- 跨恢复包检索闭合 18 张铲体、18 张弓体、14 张装备表；缺于主包的衣装 5/6/7/8/10 来自日期包，装备 998 来自 `MagicWeapon2.swf`。
- 五个普攻、22 个主动技能/附属对象、`Role4MDS`、`SpeedUp` 和巫毒娃娃均已定位；Symbol/id、帧数、hold、SVG bounds、创建 tick/点、显示 depth 与销毁条件见 `../../role4-combat-visuals-index.md`。
- AS3 局部证据为 `Role4.as/MonsterRole4Hit5.as/BaseAddEffect.as`；共享镜像、合成与销毁证据为 `BaseBitmapDataClip/BaseBitmapDataPool/BaseBullet`。

## 结论与唯一去向

- 确认：Role4 双形态本体/装备、五个普攻对象、十技能的全部可见对象、娃娃、毒爆/SpeedUp 和 HUD frame4 映射。
- 推测：0。
- 影响实现的未知：0。
- 29 条可见对象和2条本体资源族标注均已更新为 `ready + none`；现代资源统一位于 `public/assets/combat/role4/`。
- 允许的现代可见例外为空；原图表、逐帧SVG、SpeedUp与HUD frame4均由正式运行路径消费。

## 关闭检查

- [x] 跨包全集、Symbol/id、帧序、几何与 ShaShen/SpecialUI 字节同一性可追溯。
- [x] 铲/弓动作表、装备合成、方向原点和换装 hurt hold 差异已冻结。
- [x] 显示列表、940×590 单/双人基准和逐状态差异计划已定义。
- [x] 行为完成与视觉完成分列；未读取或推断 Role5 与宠物视觉。
- [x] 影响158D的未知为0；专项门禁、构建、940×590单人观察及合法双人P2截图通过，下一步为 `TASK-SETTINGS-069E`。

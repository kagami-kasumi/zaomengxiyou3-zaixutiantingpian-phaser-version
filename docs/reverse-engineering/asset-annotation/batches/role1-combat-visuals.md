# 标注批次：Role1 战斗视觉全集

- 状态：精确来源已确认，待 `TASK-SLICE-158A` 接入
- 更新日期：2026-07-31

## 范围与证据

- 本体/装备/影分身与除 `lyfb` 外对象来自 `assets/WuKong.swf`；`SpecialUI/WuKong.swf` 是其字节相同副本。
- `lyfb` 的 `Role1Bullet8_1/8_2` 来自 `assets/Role1Effect.swf`。
- Symbol、character id、帧数、hold、SVG 注册点 bounds、创建 tick 与销毁条件见 `../../role1-combat-visuals-index.md`。
- AS3 局部证据为 `Role1.as`、`Role1Shadow.as`；共享切片/镜像证据为 `BaseBitmapDataClip/BaseBitmapDataPool`。

## 结论

- 确认：Role1 本体 14、装备 10、影分身 1、普攻 4、主动技能/附属对象 16 组映射；`sx` 无主动视觉对象。
- 推测：0。
- 影响实现的未知：0。
- 现代状态：四组普攻对象 ready；其余为 `derived-ready`，下一动作 `integrate`。

## 关闭检查

- [x] 包 owner、Symbol/id、帧序与几何可追溯。
- [x] 行为完成与视觉完成分列。
- [x] 显示列表、940×590 单/双人基准及差异计划已定义。
- [x] 未读取或推断 Role2..5 与宠物视觉。
- [x] 首次 compact 后未派生新资源或进入实现，只回写既有证据与检查点。

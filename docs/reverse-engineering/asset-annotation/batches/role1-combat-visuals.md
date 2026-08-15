# 标注批次：Role1 战斗视觉全集

- 状态：资源已接入；影分身 verified 状态机/TestScene 投射已由 173A1/173A3 闭合，正式 Runtime 待 173A2
- 更新日期：2026-08-15

## 范围与证据

- 本体/装备/影分身与除 `lyfb` 外对象来自 `assets/WuKong.swf`；`SpecialUI/WuKong.swf` 是其字节相同副本。
- `lyfb` 的 `Role1Bullet8_1/8_2` 来自 `assets/Role1Effect.swf`。
- Symbol、character id、帧数、hold、SVG 注册点 bounds、创建 tick 与销毁条件见 `../../role1-combat-visuals-index.md`。
- AS3 局部证据为 `Role1.as`、`Role1Shadow.as`；共享切片/镜像证据为 `BaseBitmapDataClip/BaseBitmapDataPool`。

## 结论

- 确认：Role1 本体 14、装备 10、影分身 1、普攻 4、主动技能/附属对象 16 组映射；`sx` 无主动视觉对象。
- 推测：0。
- 影响实现的未知：0。
- 现代状态：本体、装备、四组普攻对象与全部已实现技能对象为 `ready`。影分身资源本身 `ready`；173A1 已移除 TestScene 每 400ms 换候选和重复 `(15,-5)` offset，直接消费 verified placements/tick 并复用共享视觉桥。正式 Runtime 仍无消费链，由 173A2 收口。

## 关闭检查

- [x] 包 owner、Symbol/id、帧序与几何可追溯。
- [x] 行为完成与视觉完成分列。
- [x] 显示列表、940×590 单/双人基准及差异计划已定义。
- [x] 未读取或推断 Role2..5 与宠物视觉。
- [x] 首次 compact 后未派生新资源或进入实现，只回写既有证据与检查点。
- [x] 158A 已把 3 张角色 atlas 与 249 帧技能序列接入唯一 `combat-common` owner。
- [x] 173 生成 `task-settings-173.role1-shadow` verified 真值，纠正五个静态候选/72 tick/3 秒寿命语义，并将正式运行验收显式交给 173A。
- [x] 173A1/173A3 直接消费真值闭合状态机、共享投射与 940×590 左右 walk/hit1/hit2/销毁/重入证据；现代可见例外为空，正式五关未越级宣称。

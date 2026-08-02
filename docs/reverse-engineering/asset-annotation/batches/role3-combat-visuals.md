# 标注批次：Role3 战斗视觉全集

- 状态：选择性派生完成，等待 `TASK-SLICE-158C` 接入
- 更新日期：2026-08-02

## 范围与证据

- `assets/BaJie.swf` 与 `assets/SpecialUI/BaJie.swf` 字节相同；以普通包为唯一派生 owner，SpecialUI 仅作加载兼容。
- 本体 13、装备 9、普攻 3、主动技能/附属对象 13 组均已定位；其中 `sd` 同时含 cast 与盾 buff，`xgq` cast 没有独立视觉 Symbol。
- Symbol、character id、帧数、hold、SVG 注册 bounds、创建 tick、显示 depth 与销毁条件见 `../../role3-combat-visuals-index.md`。
- AS3 局部证据为 `Role3.as/BaseAddEffect.as`；共享切片、镜像与销毁证据为 `BaseBitmapDataClip/BaseBitmapDataPool/BaseBullet`。

## 结论与唯一去向

- 确认：Role3 本体/装备、三普攻、九主动、盾 buff、拉拽/移动/追踪对象和 HUD 映射。
- 推测：0。
- 影响实现的未知：0。
- 16 条可派生标注均为 `derived-ready + integrate`；`xgq` cast 行为为 `ready + none`，后续删除独立视觉占位而不是导出伪素材。
- 允许的现代可见例外为空；本批次不进入现代实现。

## 关闭检查

- [x] 两包职责、Symbol/id、帧序、几何与字节同一性可追溯。
- [x] 行为完成与视觉完成分列。
- [x] 显示列表、940×590 单/双人基准和逐状态差异计划已定义。
- [x] 未读取或推断 Role4/Role5 与宠物视觉。


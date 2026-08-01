# 标注批次：Role2 战斗视觉全集

- 状态：选择性派生完成，等待 `TASK-SLICE-158B` 接入
- 更新日期：2026-08-01

## 范围与证据

- 当前 EXE 启动 owner 为 `assets/TangSeng1.swf`；`assets/TangSeng.swf` 与 `assets/SpecialUI/TangSeng.swf` 字节相同，但大部分同名视觉与 TangSeng1 像素不同，只作为兼容/反证来源。
- 本体 12、装备 8、Shadow 1、普攻 2、主动技能/附属对象 9 组均已选择性导出。
- Symbol、character id、帧数、hold、SVG 注册 bounds、创建 tick、显示 depth 与销毁条件见 `../../role2-combat-visuals-index.md`。
- AS3 局部证据为 `Role2.as/Role2Shadow.as`；共享切片、镜像和销毁证据为 `BaseBitmapDataClip/BaseBitmapDataPool/BaseBullet`。

## 结论与唯一去向

- 确认：Role2 本体/装备、蓄力条、名字、Shadow、两普攻、九技能对象和 HUD 映射。
- 推测：0。
- 影响实现的未知：0。
- 当前 13 条既有标注均为 `derived-ready + integrate`；不得另建重复 stable key。
- `blb/sjt` 没有独立主动视觉，`Role2KK` 没有当前创建调用链，均不补造素材。

## 关闭检查

- [x] 三包职责、Symbol/id、帧序、几何和像素差异可追溯。
- [x] 行为完成与视觉完成分列。
- [x] 显示列表、940×590 单/双人基准和逐状态差异计划已定义。
- [x] 允许的现代可见例外为空。
- [x] 未读取或推断 Role3..5 与宠物视觉，未进入现代实现。

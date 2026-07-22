# 资源标注工程状态

## 当前结论

第一批标注范围已完成语义调查，并已迁移到 EVB 恢复后的分阶段台账。Role1 四组普攻附属对象、炼丹炉完整 UI、201/201 个权威合成图标以及 Stage 1-1/1-2/1-3 真场景视觉资源已完成接入。

## 范围覆盖

| 范围 | 标注数 | 结果 | 批次 |
| --- | ---: | --- | --- |
| 五角色普攻附属对象和本体动作 | 38 | Role1 4 条已接入；33 条待定位；Role5 枪形态 1 条保持 unknown | `role1-normal-attack.md`、`hero-normal-attacks.md` |
| 已实现英雄技能效果 key | 76 | 语义映射已确认，待按角色包定位和选择性导出 | `hero-skill-effects.md` |
| 已实现法宝效果 key | 10 | 语义映射已确认，待检查 `MagicWeapon*.swf` 等恢复包 | `magic-weapon-effects.md` |
| 已实现宠物技能效果 key | 24 | 语义映射已确认，待定位源符号；6 条保留现代占位名差异 | `pet-skill-effects.md` |
| `Monster30` | 2 | 映射确认，待在恢复语料库定位本体和攻击符号 | `monster30.md` |
| Stage 1-1 | 4 | 3 项精确符号已选择性派生并接入；listener 是行为证据 | `stage11.md` |
| Stage 1-2 | 5 | 4 项精确符号/时间轴已转换并接入；listener 是行为证据 | `stage12.md` |
| Stage 1-3 | 4 | 前景/布局、背景和普通门已转换接入；listener 是行为证据 | `stage13.md` |
| UI 与配方图标 | 245 | 炼丹炉 UI、201/201 个配方图标、正式战斗 HUD 12 条、启动/存档 3 条与天庭地图 6 条均已接入；完整功能 UI 11 条已选择性派生 | `crafting-ui.md`、`crafting-kyl-icons.md`、`crafting-items-remaining.md`、`combat-hud.md`、`save-slots.md`、`heaven-map.md`、`full-function-ui.md`、`../crafting-ui-index.md`、`../combat-hud-index.md`、`../save-slots-index.md`、`../heaven-map-index.md`、`../full-function-ui-index.md` |

总计 413 条标注：253 条 `ready`、11 条 `derived-ready`、145 条 `source-corpus-ready`、1 条 `needs-annotation`、3 条 `rejected`；412 条 `confirmed`、1 条 `unknown`。当前没有 `export-ready` 或 `needs-splitting` 条目。

## 人工待办

当前没有必须立即执行的人工标注或视觉消歧。

原版角色包、怪物包、UI 包和关卡包等源 SWF 已恢复到 `local-resources/regima/source/restored-swfs/`，证据见 [`../evb-extraction-report.md`](../evb-extraction-report.md)。Stage 1-1 的 character 46/141/1、Stage 1-2 的 character 25/135/22/52/48/51，以及 Stage 1-3 的 character 13/119/40 均已转换、注册并通过运行时验收。

正式战斗 HUD 已把 `OtherMat1.swf` 的玩家面板/进度条/技能槽/入口按钮与 `bossblood.swf` 的 Boss 条作为两个保留内部子件的组合 SVG 选择性接入；12 条标注均为 `ready`。

启动与存档槽已把 `OtherMat1.swf` 的 `GameMenu` 1149、`Common1.swf` 的 `SaveInter` 69 / `IsCover` 18 选择性接入正式页面；3 条标注均为 `ready`，并通过 940×590 浏览器验收。

天庭地图已把 `OtherMat1.swf` 的 `SelectPLace` 1343、`MapMenu` 963 与 Stage 1-1/1-2/1-3、Stage 2-1 四个三帧节点 1311/1297/1304/1290 裁切并接入 `public/assets/ui/heaven-map/`；6 条标注均为 `ready`。

完整功能 UI 已从 `backpack1/OtherMat1/pet1.swf` 选择性派生背包/格子、技能总页/主动/绑定/被动、宠物、法宝和装备强化/分解/制作共 11 条组合 SVG；均为 `derived-ready`。`BackPack` 离台边界与其余根页 940×590 语义已记录在 `full-function-ui-index.md`。

Role5 枪形态 `doSingleHit(...)` 是唯一语义未闭合项，需要更完整 P-code、角色资源包或运行画面才能确认。它已按 `unknown` 保留，不阻塞本轮标注数据关闭。

标注中发现的现代 sourceSymbol 差异、manifest-only key 和资源/行为分类问题见 [`implementation-findings.md`](implementation-findings.md)。这些发现已有明确后续落点，不在本轮顺手修改战斗代码。

## 后续边界

- 新增现代 stableKey 时，必须同步新增标注或明确不属于原版资源。
- 定位到源包/符号后更新原 CSV 行为 `export-ready` 并填写 `sourcePackage`；不要新增重复 stableKey。
- 炼丹炉已完成完整界面和 201/201 个权威图标的 stableKey、选择性派生与现代接入。
- 后续真素材转换、复制到 `public/assets`、manifest 注册和场景验收继续按窄资源族单独生成正式游戏 task。
- 只有拿到源 MovieClip 且轻量重建明显不足时，才进入拆分必要性评估。

## 验证

运行：

```bash
npm run check:annotations
npm run check:workflow
```

校验覆盖 CSV 字段和枚举、stableKey 唯一性、证据路径存在性，以及四组 `AssetManifest` 效果 key 和本轮固定范围是否全部入表。

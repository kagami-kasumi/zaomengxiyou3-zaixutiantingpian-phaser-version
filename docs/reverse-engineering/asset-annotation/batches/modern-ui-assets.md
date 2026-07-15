# 标注批次：modern-ui-assets

- 状态：已关闭，现代 key 为空；炼丹炉源 UI 映射已就绪
- 关闭日期：2026-07-14

## 调查范围

- 检查 `AssetManifest.ts`、`public/assets/`、Phaser 加载调用和 `TestSceneSetup.ts` 中已实现面板/状态栏。
- 当前唯一可加载文件是 `player-placeholder.svg`，它属于 scaffold 玩家占位，不是原版 UI。
- 当前面板、按钮背景、状态栏和标签由 Phaser Graphics/Text 动态绘制，没有 UI 图片 stableKey。

## 结论

当前没有“已进入现代实现的 UI 图片、图标或按钮”可进入原版资源标注表，因此本批仍为 0 条，不创建空 CSV，也不把程序化 UI 误标为原版素材。

RegiMA 恢复语料已提供 `backpack1.swf`、`Common1.swf`、`EIcon1.swf`、`EIcon2.swf`、`fonts.swf`、`shop.swf`、`MagicWeapon*.swf` 等 UI 候选包。`TASK-SETTINGS-044` 已在 [`../../crafting-ui-index.md`](../../crafting-ui-index.md) 为第一个完整界面建立炼丹炉 stableKey、源包、character、帧和布局映射：容器/合成页来自 `backpack1.swf`，角色选择器来自 `OtherMat1.swf`，首配方图标来自 `EIcon1.swf`。

这些条目当前是源端 `export-ready` 合同，尚未派生到 `public/assets/`，因此不计入“已实现 UI 图片”CSV。`TASK-SLICE-117` 应选择性导出该窄资源族，并在实际生成现代资源 key 时新建 UI 标注行；不要全量导出所有 UI，也不要把源包可用误写成已经接入。

# 标注批次：crafting-ui

- 状态：真资源已接入
- 更新日期：2026-07-15

## 范围

- 资源族：炼丹炉 character 119/169、五角色选择器两帧、`tlzsp`/`wptlz` 首配方图标。
- 影响的现代切片/代码：`VS-043`、`TestSceneCraftingView.ts`、`AssetManifest.ts`。
- 本轮包含：9 个资源合同对应的 14 个运行时图片 key、选择性派生、加载与交互接入。
- 本轮排除：帮助、强化、分解、制作、幻兵和其他配方图标。

## 输入和证据

- 现代 stableKey 入口：`src/assets/AssetManifest.ts`。
- AS3 / SymbolClass：`docs/reverse-engineering/crafting-ui-index.md` 已确认 character、帧与坐标。
- EVB 源包：`assets/backpack1.swf`、`assets/OtherMat1.swf`、`assets/EIcon1.swf`。
- FFDec：用 `-selectid` 和 `-select` 仅导出 119、169、218、223、228、233、871、807、813；派生输出位于 `local-resources/regima/task-outputs/task-slice-117-crafting-ui/`。
- 人工证据：检查导出 PNG，character 119 为 940×594、169 为 374×362，选择器两帧透明边缘保留，物品图标均为 50×50。

## Agent 调查结论

- 已确认：14 条，均已接入 `public/assets/ui/crafting/`。
- 推测：0 条。
- 未知：0 条。
- 对应标注表：`../annotations/crafting-ui.csv`。

## 人工动作

当前无资源消歧动作。运行时截图因本次会话没有可用浏览器后端而未生成；构建、布局常量和系统交互均已自动验证。

## 去向

- 可直接接入：14 条，已完成。
- 待定位符号、继续占位、等待来源、人工消歧、拆分评估：均为 0。

## 关闭检查

- [x] 每条记录都有 `status`、`confidence` 和 `nextAction`。
- [x] 精确填写 `sourcePackage`、character id 和帧。
- [x] 没有把未导出项误写为缺失。
- [x] 只派生当前最小闭环所需资源。
- [x] 源 SWF 与旧提取语料保持只读。

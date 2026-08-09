# 标注批次：equipment-visual-resources

## 范围

- 资源族：原版 1.1 的 164 件装备图标，以及武器、防具、称号在正式背包 `HeadSprite` 中消费的角色预览资源。
- 影响的现代切片/代码：后续 `TASK-SLICE-170C` 全装备数据与 UI 接入。
- 本轮包含：五角色、默认/特殊 `showId`、Role4 shovel/arrow 双分支、Role5 `fashion_yf/fashion_wq` 动态换装、跨包资源与原版缺陷。
- 本轮排除：现代 bundle、`src/`、选择性派生接入、装备事务、数值和存档。

## 输入和证据

- 现代 stableKey 入口：`inventory-item.<fillName>`；预览标注使用 `equipment-preview.<fillName>`。
- AS3 / SymbolClass：`ShowObj.as`、`HeadSprite.as`、Role1..5 装备消费者、`BaseBitmapDataPool.as`。
- EVB 源包 / 候选包：完整 restored SWF corpus；最终主要落在 `EIcon1`、`MagicWeapon2`、`1_MainLoad__main1`、五角色主包、`TangSeng1`、`20120119`、`cs_zb/*` 与 `bailongSword`。
- FFDec 定位命令与结果：对五角色主包、2012 补丁包和代表性 `520/521`/Role5/title 资源执行 `-export symbolClass`、`-selectid ... -export image|sprite`；原始派生保存在 `local-resources/regima/task-outputs/task-settings-170b2/`。
- 现有图片、shape 或报告：`docs/tasks/evidence/TASK-SETTINGS-170B2/representative-original-resources-940x590.png`。
- 人工证据：无。

## Agent 调查结论

- 已确认：164 个唯一 `fillName`；163 个正常图标查找和 1 个 `fmtstx` 原查找缺陷；127 个会改变预览的装备语义；138 条逐项预览资源记录对应 111 个唯一已定位 SWF character；37 个饰品/法宝明确不改变角色预览。
- 推测：0。
- 未知：0 个影响 170C 接入的未知。
- 原版缺陷：`mksddf` 的背包图标别名为 `lly`，但 `role_title_mksddf` 不存在；保持称号预览不可见，不生成替代层。
- 对应标注表：`../annotations/equipment-preview-resources.csv`。
- 权威机器目录：`../../reference/equipment-visual-resource-catalog-1.1.json`。

## 人工动作

无。CLI、恢复语料库、AS3 消费链和代表性选择性导出已经闭合当前任务。

## 去向

- 可直接接入：163 个既有真图标继续复用；已定位的 111 个唯一穿戴/称号 character 可由 170C 选择性派生或运行时映射。
- 待定位符号：0。
- 可选择性导出：除原缺陷外的 126 条预览语义；共享 character 必须复用，不重复派生。
- 继续使用占位：0。
- 等待来源：0。
- 需要人工消歧：0。
- 进入拆分评估：0。
- 后续正式游戏 task：`TASK-SLICE-170C` 负责接入；本批次不提前修改现代资源。

## 关闭检查

- [x] 每条记录都有 `status`、`confidence` 和 `nextAction`。
- [x] `export-ready` 已填写 `sourcePackage`，且不是仅凭文件名猜测。
- [x] 没有把“尚未选择性导出”误写为 `missing-original`。
- [x] `confirmed` 均有证据路径。
- [x] 未把猜测写成事实。
- [x] 无需人工动作。
- [x] 未触发拆分判定门。
- [x] 已说明后续由 170C 接入。

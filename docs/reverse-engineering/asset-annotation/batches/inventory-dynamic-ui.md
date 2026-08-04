# 标注批次：inventory-dynamic-ui

## 范围

- 资源族：`backpack1.swf` 中 character 358/610 操作条、304 等级/经验/出售白装/时装状态子资源。
- 影响的现代切片/代码：`TASK-SETTINGS-166A`、`InventoryUiAssets.ts`与场景资源 bundle。
- 本轮包含：61 个可独立消费的透明 PNG/stable key。
- 本轮排除：正式页面消费、库存交易、其他源包与整页裁片。

## 输入和证据

- 现代 stableKey 入口：`src/assets/InventoryUiAssets.ts`。
- AS3 / SymbolClass：`BackPack.as`、`PackThings.as`；`simplebtn` 358、`threebtn` 610、`levelnum0..9`。
- EVB 源包 / 候选包：`local-resources/regima/source/restored-swfs/assets/backpack1.swf`（唯一）。
- FFDec 定位命令与结果：对 2..12 数字位图、210/219/297/347/352/357/358/604/609/610 MovieClip、222 按钮和 342/597 shape 选择性导出；输出位于 `local-resources/regima/task-outputs/task-settings-166a-inventory-dynamic/`。
- 现有图片、shape 或报告：`public/assets/ui/inventory/native/`、`docs/reverse-engineering/evidence/TASK-SETTINGS-165B-backpack-review.md`。
- 人工证据：无。

## Agent 调查结论

- 已确认：61；全部可追溯到单一恢复 SWF 的精确 character/frame/button state。
- 推测：0。
- 未知：0。
- 对应标注表：`../annotations/inventory-dynamic-ui.csv`。

## 人工动作

无。CLI 可完成原 Symbol 帧导出，状态语义由 AS3 和时间轴交叉确认。

## 去向

- 可直接接入：61；已登记为 `ready` / `none`。
- 待定位符号、可选择性导出、占位、等待来源、人工消歧、拆分评估：均为 0。
- 后续正式游戏 task：`TASK-SLICE-166B` 仅消费本批 key。

## 关闭检查

- [x] 每条记录都有 `status`、`confidence` 和 `nextAction`。
- [x] 精确源包与 character/frame 均已确认。
- [x] 没有把尚未导出误写为 `missing-original`。
- [x] `confirmed` 均有已接入文件和 manifest 路径。
- [x] 未把命名推测写成原版事实。
- [x] 不需要人工动作或新的拆分。

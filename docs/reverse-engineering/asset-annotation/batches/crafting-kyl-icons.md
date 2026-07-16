# 标注批次：crafting-kyl-icons

- 状态：真资源已接入
- 更新日期：2026-07-16

## 范围

- 资源族：`kyg + kyz + kys -> kyl` 四个炼丹炉图标。
- 影响的现代切片/代码：`VS-044`；`TASK-SLICE-118` 已接入现有 crafting asset bundle 和视图。
- 本轮包含：四个直接图标的源包、character、tag、尺寸、掉落态差异、预览别名和 stableKey。
- 排除：`fall_*` 掉落态、其他配方与 `EIcon` 全包。

## 输入和证据

- 现代 stableKey 入口：`src/assets/AssetManifest.ts` 的 `crafting-item.*` 命名族；四个合同均已注册运行时资源。
- AS3：`AllEquipment.mixProduce()` 的首分支；`Fusion.previewFun()` 默认图标分支；`ShowObj` 默认按 `fillName` 取图标。
- EVB 源包：`assets/EIcon1.swf`；SHA-256 `A205BD0D5FDB4F2734B0ED6BE018F3AC482ADE52C16A40E2D0C80D07BB2BB224`。
- 排除包：`assets/EIcon2.swf`；SHA-256 `FE67CF769954A146981B22F906A4A4FD1AE28CBE3581DC683B1B9D00753FE02D`；SymbolClass 仅有 `gfcstx` 相关两项，没有本批名称。
- FFDec：调查阶段只导出 SymbolClass 元数据并用 `-dumpSWF` 核对 tag；接入阶段只选择性派生 character 332、342、323、809 到 `local-resources/regima/task-outputs/task-slice-118-crafting-kyl/`，再复制到 `public/assets/ui/crafting/items/`。
- 尺寸核对：只读解析 CWS tag；332/342/809 为 50×50 `DefineBitsLossless2`，323 为 50×50 `DefineBitsJPEG3`。
- 人工证据：四张 50×50 PNG 已逐张原尺寸检查，材料外观彼此可区分，`kyl` 产物图标清晰。

## Agent 调查结论

- 已确认：4 条，均为 `ready`。
- 推测：0 条。
- 未知：0 条。
- 掉落态对照：`fall_kyg` 202、`fall_kyz` 214、`fall_kys` 196；不进入炼丹炉资源合同。
- 对应标注表：`../annotations/crafting-ui.csv`。

## 人工动作

无。名称、SymbolClass、合成映射、图标选择路径和尺寸证据一致，不需要视觉消歧。

## 接入结果

- `CraftingItemTextureKeys` 统一映射背包、材料槽、预览和成功产物。
- P1/P2 种子背包各有独立 `kyg/kyz/kys` 装备实例；第二配方失败保留、成功清槽、1000 灵魂扣除和产物回包均由既有事务负责。
- 系统测试、生产构建通过；浏览器控制后端无法访问工作区本地 Vite 地址，因此没有运行时截图。

## 关闭检查

- [x] 每条记录都有 `status`、`confidence` 和 `nextAction`。
- [x] `ready` 已填写现代资源路径、精确 `sourcePackage` 和 character id。
- [x] 直接图标与 `fall_*` 掉落态已区分。
- [x] `kyl` 已确认不走预览别名。
- [x] 只派生四个直接图标，没有导出 `fall_*` 或修改源 SWF。
- [x] manifest、背包入口、视图映射和事务测试已闭合。

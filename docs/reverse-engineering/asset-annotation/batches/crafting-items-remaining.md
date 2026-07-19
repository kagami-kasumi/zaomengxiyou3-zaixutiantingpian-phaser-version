# 标注批次：crafting-items-remaining

- 状态：七个批次全部接入，201/201 图标合同闭合
- 更新日期：2026-07-18

## 范围

- 资源族：`LINE-CRAFTING` 权威目录中除既有 `tlzsp/wptlz/kyg/kyz/kys/kyl` 外的 195 个玩家可见合成材料/产物图标。
- 影响的现代任务：`TASK-SETTINGS-049` 与 `TASK-SLICE-120A...120G` 均已完成。
- 本轮包含：fillName、中文名、材料/产物角色、预览别名、源 SWF、SymbolClass、character id、stableKey 与唯一下一动作。
- 排除：图片导出、现代 manifest/视图接入、运行时视觉验收。

## 输入和证据

- 权威物品集合：`docs/reverse-engineering/reference/crafting-item-catalog-1.1.json`。
- 预览别名：`Fusion.as:229-301`，共 17 条。
- 恢复语料库：`local-resources/regima/source/restored-swfs/`；只读扫描 SymbolClass tag。
- FFDec 交叉检查：`EIcon1.swf`、`EIcon2.swf` 与 `1_MainLoad__main1.swf` 的 symbolClass CSV，位于 `local-resources/regima/task-outputs/task-settings-049-crafting-icons/`。
- 完整机器可读矩阵：`docs/reverse-engineering/reference/crafting-icon-catalog-1.1.json`。
- 标注表：`../annotations/crafting-items-remaining.csv`。

## Agent 调查结论

- 当前 ready：201 项；`export-ready=0`、`ambiguous=0`、`unresolved=0`、`missing-original=0`。
- 195 项均有唯一 stableKey 和选择性导出动作；同一 fillName 同时作为材料与产物时，矩阵分别记录直接材料 symbol 与预览 alias symbol。
- 资源引用共 237 个用途映射：`EIcon1.swf` 231、`1_MainLoad__main1.swf` 2、`MagicWeapon2.swf` 4。`EIcon2.swf` 只有 `gfcstx` 相关类，不参与本范围。
- 跨包 6 项：`fbqpj/qpjy` 位于主包 character 3/2；`mdcqg/wpxty/wpycjh/wpzty` 位于 `MagicWeapon2.swf` character 18/4/6/17。

## 预览别名

`Fusion.previewFun()` 的 17 条别名已机械写入图标目录。代表项：9 个诛邪制作书产物共用 `zxstgzzs`；`sqmdcqg -> sqcqg`；`cs_wq_glzzs -> cs_wq_qszzs`；`cs_fj_tlzzs -> cs_fj_dzzzs`；`xlnyzzs/xltqzzs -> xlthzzs`；`_cljzzs -> qlgzzs`；`clpzzs -> qljzzs`。材料槽仍按自身 fillName 的直接 symbol，不套用产物预览别名。

## 窄资源批次

| 批次 | 剩余 fillName | 范围 |
| --- | ---: | --- |
| `crafting-icons-b001-018` | 0（30 已接入） | 首次出现于配方分支 1-18；基础装备/法宝链与强化石；`TASK-SLICE-120A` 完成 |
| `crafting-icons-b019-038` | 0（16 已接入） | 分支 19-38；生命/魔法/攻击/防御石；`TASK-SLICE-120B` 完成 |
| `crafting-icons-b039-058` | 0（21 已接入） | 分支 39-58；灵珠碎片、灵珠和首批升级材料；`TASK-SLICE-120C` 完成 |
| `crafting-icons-b059-078` | 0（34 已接入） | 分支 59-78；高级装备、特殊继承与制作材料；`TASK-SLICE-120D` 完成 |
| `crafting-icons-b079-098` | 0（42 已接入） | 分支 79-98；时装、制作书和流邪链；`TASK-SLICE-120E` 完成 |
| `crafting-icons-b099-122` | 0（46 已接入） | 分支 99-122；后期法宝与诛邪制作书；`TASK-SLICE-120F` 完成 |
| `crafting-icons-special-sources` | 0（6 已接入） | 主包/MagicWeapon2 跨包例外；`TASK-SLICE-120G` 完成 |

批次按 fillName 的首次权威配方分支唯一归属；共享 symbol 和预览别名在导出时按 character 去重。后续每个 task 只处理一行，不全量导出 EIcon 包。

## 人工动作

不需要人工消歧。全部 201 个 stableKey 已接入并按 7 张联系表完成目检；共享 character 按权威目录复用，跨包 6 项与源包命名一致。

## 关闭检查

- [x] 201 项图标合同计数闭合。
- [x] 195 个未接 stableKey 均为 `export-ready + export-selectively`。
- [x] 17 条预览别名有 `Fusion.as` 行号证据。
- [x] 恢复语料库已覆盖 EIcon、主包和 MagicWeapon2 例外。
- [x] 已拆成 7 个窄资源批次。
- [x] 各批次选择性导出、现代接入与视觉目检由 `TASK-SLICE-120A...120G` 连续完成，201/201 ready。

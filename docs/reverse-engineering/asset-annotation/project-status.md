# 资源标注工程状态

## 当前结论

第一批标注范围已完成语义调查，并已迁移到 EVB 恢复后的分阶段台账。Role1 四组普攻附属对象已完成首个真资源接入，其余资源继续按恢复语料库定位精确包和符号。

## 范围覆盖

| 范围 | 标注数 | 结果 | 批次 |
| --- | ---: | --- | --- |
| 五角色普攻附属对象和本体动作 | 38 | Role1 4 条已接入；33 条待定位；Role5 枪形态 1 条保持 unknown | `role1-normal-attack.md`、`hero-normal-attacks.md` |
| 已实现英雄技能效果 key | 76 | 语义映射已确认，待按角色包定位和选择性导出 | `hero-skill-effects.md` |
| 已实现法宝效果 key | 10 | 语义映射已确认，待检查 `MagicWeapon*.swf` 等恢复包 | `magic-weapon-effects.md` |
| 已实现宠物技能效果 key | 24 | 语义映射已确认，待定位源符号；6 条保留现代占位名差异 | `pet-skill-effects.md` |
| `Monster30` | 2 | 映射确认，待在恢复语料库定位本体和攻击符号 | `monster30.md` |
| Stage 1-1 | 4 | 3 项待从 `levels/level11.swf` 定位；listener 是行为证据 | `stage11.md` |
| 已实现 UI 图片 | 0 | 现代 UI 尚无图片 key；源 UI 包已恢复，可启动按界面的源资源盘点 | `modern-ui-assets.md` |

总计 154 条标注：4 条 `ready`、148 条 `source-corpus-ready`、1 条 `needs-annotation`、1 条 `rejected`；153 条 `confirmed`、1 条 `unknown`。当前没有 `export-ready`、`derived-ready` 或 `needs-splitting` 条目。

## 人工待办

当前没有必须立即执行的人工标注或视觉消歧。

原版角色包、怪物包、UI 包和 `levels/level11` 等源 SWF 已恢复到 `D:\flash-restored-swfs`，证据见 [`../evb-extraction-report.md`](../evb-extraction-report.md)。下一阶段调用 FFDec CLI 先定位精确符号，再只导出将要接入的窄资源族。

Role5 枪形态 `doSingleHit(...)` 是唯一语义未闭合项，需要更完整 P-code、角色资源包或运行画面才能确认。它已按 `unknown` 保留，不阻塞本轮标注数据关闭。

标注中发现的现代 sourceSymbol 差异、manifest-only key 和资源/行为分类问题见 [`implementation-findings.md`](implementation-findings.md)。这些发现已有明确后续落点，不在本轮顺手修改战斗代码。

## 后续边界

- 新增现代 stableKey 时，必须同步新增标注或明确不属于原版资源。
- 定位到源包/符号后更新原 CSV 行为 `export-ready` 并填写 `sourcePackage`；不要新增重复 stableKey。
- UI 先以一个完整界面建立 stableKey 和源包映射，不做“全部 UI”总批次。
- 真素材转换、复制到 `public/assets`、manifest 注册和场景验收属于后续正式游戏 task。
- 只有拿到源 MovieClip 且轻量重建明显不足时，才进入拆分必要性评估。

## 验证

运行：

```bash
npm run check:annotations
npm run check:workflow
```

校验覆盖 CSV 字段和枚举、stableKey 唯一性、证据路径存在性，以及四组 `AssetManifest` 效果 key 和本轮固定范围是否全部入表。

# 资源标注工程

本目录把旧 AS3 证据、EVB 新恢复源 SWF 和现代工程 stableKey 串成可以查询、导出和接入的资产台账。它不重新抽取资源，不修改 `local-resources/regima/legacy-extraction/`，也不要求人工给所有文件逐个命名。

## 先看结论

“标注”不是给图片写自然语言说明，而是为一个当前需要的资源族建立可追溯映射：

```text
现代 stableKey
-> 原版 AS3 / SymbolClass 名称
-> EVB 源 SWF / SymbolClass / MovieClip
-> 选择性导出物与现代可用文件
-> 用途、可信度和下一步
```

例如，Agent 可以从现代 manifest 和 AS3 证据确认：

```text
normal-attack-effect.hero1.hit1
-> Role1Bullet1
-> EVB 资源语料库已恢复，精确符号尚待定位
-> source-corpus-ready / locate-symbol
```

完成这一条并不需要人工寻找或重命名几万张图片，也不意味着应把整个 SWF 目录复制进现代项目。

## 当前阶段

`TASK-ASSET-003` 已恢复 RegiMA 资源语料库，并统一放入 Git 忽略的项目内本地根：

- 原始解包目录：`local-resources/regima/source/unpacked/`
- 174 个可解析 SWF：`local-resources/regima/source/restored-swfs/`
- 清单与审计：`local-resources/regima/manifests/`
- 提取与验证报告：[`../evb-extraction-report.md`](../evb-extraction-report.md)

因此默认问题已从“源包在哪里”改为“目标符号在哪个源包、应如何选择性导出和接入”。只有经过检索仍确认源包不存在时，才允许使用 `missing-original / request-source`。

## 谁做什么

| 工作 | Agent | 人工 |
| --- | --- | --- |
| 搜索现代代码、AS3、旧 `symbols.csv`、恢复 SWF 和现有图片 | 独立完成 | 不需要参与 |
| 生成候选 stableKey、来源链和状态 | 独立完成 | 只审阅有争议命名 |
| 判断文件是否存在、路径是否有效、证据是否相互冲突 | 独立完成 | 不需要参与 |
| 从截图判断两个候选是否为同一动作 | 先整理候选和差异 | 在证据不足时做最终判断 |
| 判断“现代效果是否像原版” | 提供对照项和可观察差异 | 提供原版录屏/截图并验收 |
| 调用本机已安装的 FFDec CLI 做只读检查或选择性导出 | 从 `local-resources/regima/source/restored-swfs/` 执行，输出到 `local-resources/regima/task-outputs/<batch>/` | 不需要参与命令执行 |
| 安装 FFDec，或执行 CLI 无法完成的 GUI 视觉操作 | 写清最小操作目标后停止 | 手工安装/操作并把结果放回约定的新资料目录 |
| 决定是否值得逐帧近似 | 提交成本、替代方案和建议 | 对高感知对象作产品取舍 |
| 修改 `local-resources/regima/legacy-extraction/` 原始提取结果 | 禁止 | 只有明确发起重新提取任务时才允许 |

人工通常只会在一个批次的两个位置介入：证据无法消歧时，以及视觉验收时。如果 Agent 能从仓库证据确认，人工只需要看批次结论。

## 工程产物

每个资源族最终产生三类产物：

1. 标注记录：stableKey、原版名称、源包、来源、获取阶段、可信度和下一步。
2. 批次记录：本轮范围、证据、未决问题、人工审阅点和关闭条件。
3. 拆分评估：仅当现有素材或 Phaser 参数化方案明显不足时产生。

实际标注表放在本目录的 `annotations/`；每个资源族一个 CSV，避免形成无法审阅的总表。CSV 规范见 [`annotation-schema.md`](annotation-schema.md)。开始新批次时复制 [`batch-template.md`](batch-template.md)，批次记录放在 `batches/`。

建议目录形态：

```text
asset-annotation/
├── README.md                 # 本入口：概念、边界、人与 Agent 分工
├── workflow.md               # 单个资源族如何执行和交接
├── annotation-schema.md      # CSV 字段、枚举、证据要求
├── splitting-policy.md       # 是否拆帧、由谁操作、如何验收
├── batch-template.md         # 单批工作记录模板
├── project-status.md         # 当前范围、统计、人工待办和完成状态
├── implementation-findings.md # 现代 sourceSymbol/分类差异交接
├── annotations/              # 按资源族保存标注 CSV
└── batches/                  # 保存进行中或已关闭的批次记录
```

## 当前范围和优先级

第一批只处理会影响近期现代复现质量的资源族：

1. 五角色普攻附属对象和本体动作族。
2. 已进入现代实现并在 `AssetManifest.ts` 登记的英雄技能、法宝和宠物效果 key。
3. `Monster30` 与 `Monster30Bullet1`。
4. `sl11`、`bg11`、`floorBg1`、`StageListener11` 等首关资源。
5. 已进入现代实现的 UI 面板、图标和按钮；如果 UI 仍由 Phaser 图形和文本生成，则记录“当前无图片标注项”。

不做：

- 全目录数字图片命名。
- 无现代入口、无 AS3 引用、无 SymbolClass、无视觉上下文的孤立资源。
- 已确认损坏或 0 byte 的图片。
- 尚未证明完整的音频库。
- 默认拆分整个 SWF 或几十万帧。

具体缺口事实仍由 `../assets-index.md` 和 `../combat-assets-gap-plan.md` 维护；本目录维护的是如何把这些事实变成可执行标注和审阅批次，不复制大型缺口清单。

第一批完成状态和统计见 [`project-status.md`](project-status.md)。

## 如何启动一批工作

用户只需指定一个资源族，或者允许 Agent 从上述优先级选择一个。推荐提示词：

```text
请按 docs/reverse-engineering/asset-annotation/README.md 启动一个资源标注批次。
本轮只处理 <资源族>。先从 local-resources/regima/source/restored-swfs/ 定位精确源包和符号，再选择性导出到 local-resources/regima/task-outputs/<batch>/；只有遇到必须由我判断的歧义或视觉验收时再列出人工动作。
不要重新提取 EVB，不要全量导出或拆全量帧。
```

如果没有指定资源族，Agent 应选择与当前可玩切片直接相关、且能在一次对话中完成证据闭环的最小资源族。资源接入现代代码是后续游戏 task，不在标注批次中顺手完成。

## 完成标准

一个标注批次只有在以下条件满足时才算关闭：

- 范围中的每个条目都有状态和可信度。
- 每个 `confirmed` / `probable` 结论都有仓库路径或人工证据。
- 不确定项明确写成 `unknown`，没有用猜测填空。
- 每个条目都有唯一下一步，或明确说明无需动作。
- 需要人工参与的内容已压缩成可回答的具体问题。
- 如建议拆分，已经通过 [`splitting-policy.md`](splitting-policy.md) 的判定门。

标注记录本身不表示素材已经接入 Phaser，也不表示对应玩法 task 已完成。

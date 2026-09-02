# 标注批次：TASK-SETTINGS-211-combat-hit-feedback

## 范围

- 资源族：怪物普通/暴击伤害数字与连击面板。
- 影响的现代切片/代码：`VS-071`、后续 `TASK-SLICE-212`。
- 本轮包含：`OtherMat1.swf` 中 `hurtnum0..9`、`bnum0..9`、`num0..9` 和 `export.Batter` 的精确映射及已验收派生输出。
- 本轮排除：玩家/宠物受伤数字、治疗数字、现代运行时接入。

## 输入和证据

- 现代 stableKey 入口：`combat-hit-feedback.damage.*`、`combat-hit-feedback.combo.*`。
- AS3 / SymbolClass：`BaseMonster.as`、`CureHpQueue.as`、`ANumber.as`、`GameInfo.as`、`Batter.as` 与 `OtherMat1` SymbolClass。
- EVB 源包 / 候选包：已确认 `assets/OtherMat1.swf`，无候选冲突。
- FFDec 定位命令与结果：character `23/26-35`、`91-117`、`259-299`；选择性输出在 `local-resources/regima/task-outputs/task-settings-211-combat-hit-feedback*/`。
- 现有图片、shape 或报告：[`../../combat-hit-feedback-index.md`](../../combat-hit-feedback-index.md) 与 [`../../ground-truth/manifests/task-settings-211-combat-hit-feedback.json`](../../ground-truth/manifests/task-settings-211-combat-hit-feedback.json)。
- 人工证据：无。

## Agent 调查结论

- 已确认：普通/暴击各十枚位图、连击十枚五帧 MovieClip、`export.Batter` 根、源 character、位距和时间轴矩阵均有恢复源与脚本交叉证据。
- 推测：无。
- 未知：无。
- 对应标注表：`../annotations/combat-hit-feedback.csv`。

## 人工动作

无。

## 去向

- 可直接接入：四个资源单元均为 `derived-ready + integrate`，交给 `TASK-SLICE-212` 消费。
- 待定位符号：无。
- 可选择性导出：已完成。
- 继续使用占位：无。
- 等待来源：无。
- 需要人工消歧：无。
- 进入拆分评估：无。

## 关闭检查

- [x] 每条记录都有 `status`、`confidence` 和 `nextAction`。
- [x] `export-ready` 已填写 `sourcePackage`，且不是仅凭文件名猜测。
- [x] 没有把“尚未选择性导出”误写为 `missing-original`。
- [x] `confirmed` / `probable` 均有证据路径。
- [x] 未把猜测写成事实。
- [x] 人工动作已压缩为具体问题。
- [x] 如建议拆分，已通过拆分判定门。
- [x] 已说明后续正式游戏 task 为 `TASK-SLICE-212`。

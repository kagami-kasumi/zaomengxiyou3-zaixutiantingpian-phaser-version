# 标注批次：role1-normal-attack

- 状态：真资源已接入
- 更新日期：2026-07-15

## 范围

- 资源族：`Role1Bullet1/3/4/5`。
- 影响的现代切片/代码：Role1 普攻视觉附属对象；stableKey 已在 `src/assets/AssetManifest.ts` 登记。
- 本轮包含：AS3 动作映射、现代 stableKey、现有导出可用性和唯一下一步。
- 本轮排除：Role1 本体动作、技能 `Role1Bullet6+`、音效、真素材接入和帧拆分。

## 输入和证据

- 现代 stableKey 入口：`src/assets/AssetManifest.ts`。
- AS3：`local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts/export/hero/Role1.as` 的 `doHit1/doHit3/doHit4/doHit5`。
- 符号映射：`local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/symbolClass/symbols.csv`，未包含本批四个名称。
- 既有逆向结论：`docs/reverse-engineering/attack-effects-index.md`。
- 既有缺口结论：`docs/reverse-engineering/combat-assets-gap-plan.md`。
- 人工证据：无。

## Agent 调查结论

- 已确认：4 条。AS3 直接创建对应 `FollowBaseObjectBullet`，动作、原版资源名与现代 stableKey 可以一一映射。
- 推测：0 条。
- 未知：0 条。
- 素材状态：4 条均为 `ready`。已确认位于 `assets/WuKong.swf`，Character ID 分别为 181、222、199、190，并选择性导出 8、11、4、4 帧透明 PNG。
- 对应标注表：`../annotations/role1-normal-attack.csv`。

四组 PNG 已注册到 `AssetManifest.ts` 并在测试场景按原攻击持续窗口逐帧播放；玩法数值、命中时序和流程未改变。

## 人工动作

当前无人工消歧或视觉验收动作。

Agent 可从 `local-resources/regima/source/restored-swfs/assets/WuKong.swf`、`Role1Effect.swf` 等候选包开始窄查；只有 CLI 无法消歧或需要视觉验收时才请求人工。

## 去向

- 可直接使用：4 条。
- 继续使用占位：现代玩法可以继续，不因本批阻塞。
- 待定位符号：0 条。
- 需要人工消歧：0 条。
- 进入拆分评估：0 条。精确 MovieClip 尚未定位，暂不提前拆分。

## 关闭检查

- [x] 每条记录都有 `status`、`confidence` 和 `nextAction`。
- [x] `confirmed` 均有证据路径。
- [x] 未把猜测写成事实。
- [x] 当前没有需要人工回答的歧义。
- [x] 未在缺少源素材时提前建议拆分。
- [x] 只接入 Role1 普攻四个符号，没有扩大到 Role1 技能或其他角色。

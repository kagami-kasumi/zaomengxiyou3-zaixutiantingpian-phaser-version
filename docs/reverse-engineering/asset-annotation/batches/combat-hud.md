# 标注批次：combat-hud

## 范围

- 资源族：正式战斗 HUD 的玩家顶栏、三条数值条、五槽框、战意提示、法宝/宠物入口和 Boss 条。
- 影响的现代切片/代码：`TASK-SLICE-131`、Stage 1 三关 gameplay bridge、后续 HUD manifest。
- 本轮包含：精确源包、SymbolClass/character id、注册坐标、时间轴帧数和选择性导出去向。
- 本轮排除：完整背包/宠物/心法/法宝页面、全部 50 个技能图标批量导出、宠物完整摘要皮肤。

## 输入和证据

- 现代 stableKey 入口：`combat-hud.*`。
- AS3 / SymbolClass：`GameInfo.as`、`RoleInfo.as`、`BaseMonster.as`、`PhysicsWorld.as`、`KeyBoardControl.as`；`OtherMat1` 与 `bossblood` SymbolClass。
- EVB 源包 / 候选包：已确认 `assets/OtherMat1.swf`、`assets/bossblood.swf`，无候选冲突。
- FFDec 定位命令与结果：只导出 `RoleInfo` 574、`BossBlood` 110、主包 `GameInfo` 142 / `beattacktimes` 302 的 SVG 和 Boss SymbolClass；派生证据位于 `local-resources/regima/task-outputs/task-settings-055-hud/`。
- 现有图片、shape 或报告：`combat-hud-index.md` 的几何表和本地 SVG。
- 人工证据：无。

## Agent 调查结论

- 已确认：12 条资源均有精确源包、character id、AS3 用途与几何/时间轴证据。
- 推测：0。
- 未知：宠物完整摘要 `ShowPetInfo` 的皮肤符号未定位；它不属于首个核心 HUD 实现承诺。
- 对应标注表：`../annotations/combat-hud.csv`

## 人工动作

已完成：`TASK-SLICE-131` 将 `RoleInfo` 574 与 `BossBlood` 110 的选择性 SVG 接入现代 manifest，并完成 1-1 单人、1-2 双人镜像、1-3 单人运行态尺寸与遮挡验收。

## 去向

- 可直接接入：12（通过两个保留内部子件的组合 SVG 接入）。
- 待定位符号：0（首切片范围）。
- 可选择性导出：0。
- 继续使用占位：运行时数字/键标使用现代文本，不属于占位素材。
- 等待来源：0。
- 需要人工消歧：0。
- 进入拆分评估：0。

技能 `ss_<skillName>` 和 `Skill_<key>` 已在 `OtherMat1.swf` 目录确认，但正式 Stage 1 当前无默认绑定。后续只按实际绑定集合窄导出，不在本批次复制全部技能 UI。

## 关闭检查

- [x] 每条记录都有 `status`、`confidence` 和 `nextAction`。
- [x] 12 条记录已转为 `ready`；组合 SVG、manifest provenance 和运行态验收均已落盘。
- [x] 没有把“尚未选择性导出”误写为 `missing-original`。
- [x] 所有记录均有证据路径。
- [x] 未把运行时文本或现代 enemy id 选择写成原版资源事实。
- [x] 无需人工动作。
- [x] 不需要拆分评估。
- [x] 正式接入已由 `TASK-SLICE-131` 完成。

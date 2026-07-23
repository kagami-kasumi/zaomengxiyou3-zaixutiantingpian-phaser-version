# Stage 2-1 怪物真视觉资源批次

## 范围

- 资源族：Monster6/9/10/19 本体 atlas、七个直接攻击对象和命中可见结果。
- 影响的现代切片/代码：`VS-049`、`Stage21GameplayBridge`、Stage 2-1 真视觉实现 Goal。
- 本轮包含：源包/SymbolClass、atlas 行列、动作 tick、碰撞根、朝向、攻击点、逐帧边界、滤镜和选择性派生。
- 本轮排除：Stage 2-2、其他怪物、共享战斗重构和不存在于调用链的额外命中火花。

## 输入和证据

- 现代 stableKey 入口：`Stage21GameplayBridge` 当前 Arc/Text 占位与 `Stage21Scene` 占位声明。
- AS3 / SymbolClass：`Monster6/9/10/19.as`、`BaseBitmapDataPool.as`、`BaseBitmapDataClip.as`、`BaseBullet.as`、`SpecialEffectBullet.as`、`BaseObject.as`、`AssetsLoader.as`。
- EVB 源包 / 候选包：权威 `assets/2.swf`；`assets/9.swf` 仅作同名交叉对照，已由 Stage 加载链排除。
- FFDec 定位命令与结果：SymbolClass、swf2xml、精确 `-selectid` image/sprite 导出均位于 `local-resources/regima/task-outputs/task-settings-062-stage21-monsters/`。
- 现有图片、shape 或报告：4 个合并 RGBA atlas、132 个攻击对象 PNG/SVG、94/132 行几何表、碰撞盒 105/107 SVG。
- 人工证据：无；源包、调用链、时间轴和几何已交叉确认。

## Agent 调查结论

- 已确认：11 条 stable key；四怪 94 个可达本体关键帧；七对象 132 帧；碰撞中心/脚底、左右镜像和七个攻击触发点。
- 推测：0。
- 未知：0 个影响实现项。
- 对应标注表：`../annotations/stage21-monsters.csv`
- 完整六段证据：`../../stage21-monster-visuals-index.md`

## 人工动作

无。`TASK-SLICE-146` 已完成 940×590 1P/2P 逐状态视觉复验。

## 去向

- 已接入：11 条 `ready`，位于 `public/assets/stage21/` 并由 `AssetManifest.ts` / `BootScene.ts` 加载。
- 待定位符号：0。
- 可选择性导出：0；已完成窄派生。
- 继续使用占位：0。
- 等待来源：0。
- 需要人工消歧：0。
- 进入拆分评估：0。

## 关闭检查

- [x] 每条记录都有 `status`、`confidence` 和 `nextAction`。
- [x] `ready` 均有精确 `sourcePackage`、character id、本地派生路径与现代 manifest 入口。
- [x] 没有把“尚未接入”误写为 `missing-original`。
- [x] 11 条 `confirmed` 均有恢复 SWF、SymbolClass、AS3 或时间轴证据。
- [x] Monster10 hit2 明确记为不可达坏分支，没有猜成原版可见动作。
- [x] 940×590 1P/2P、四怪逐状态、最终门和零 console 复验已完成。
- [x] 正式游戏 task `TASK-SLICE-146` 已归档。

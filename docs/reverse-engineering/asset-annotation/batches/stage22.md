# Stage 2-2 真场景、机关与 Boss 视觉资源批次

## 范围

- 资源族：Stage 2-2 场景两层、背景、地面、普通门、130 帧火焰、Monster16 本体 atlas 与六个攻击对象。
- 影响的现代切片：`VS-056` 与 `LINE-STAGE-2-2` 的首个可玩实现 Goal。
- 本轮排除：Stage 2-3、Stage 22-x、共享战斗重构和不存在于调用链的额外可见效果。

## 输入和证据

- 权威关卡包：`assets/levels/level22.swf`；Stage 2 共享视觉包：`assets/2.swf`。
- 加载链：`AssetsLoader.getAssetsMap("2","2")`、`MainGame.newGame()`、`BaseGameSence`、`PhysicsWorld.pWorldInit()`。
- 局部行为：`sl22`、`StageListener22`、`FireThron`、`Monster16` 与六个攻击 SymbolClass。
- 选择性派生：`local-resources/regima/task-outputs/task-settings-063-stage22/`，包含 XML、局部脚本、SVG/PNG、36 行 Boss 几何和 104 行攻击对象几何。
- 人工证据：无；源包、SymbolClass、调用链、时间轴、注册点和矩阵已交叉确认。

## Agent 调查结论

- 已确认：14 条 stable key；其中 7 条场景/机关、1 条 Boss atlas、6 条攻击对象。
- 推测：0。
- 未知：0 个影响首个实现的原版事实。
- 对应标注表：`../annotations/stage22.csv`。
- 完整六段证据：`../../levels-index.md` 的“Stage 2-2 权威实现输入”。

## 去向

- 14 条均为 `derived-ready`；同线实现 Goal 选择性复制到 `public/assets/stage22/` 并注册 manifest。
- Monster9/10/19 直接复用已接入的 Stage 2-1 真资源，禁止重复导出或复制。
- 不保留 Monster16、六攻击对象、火焰或场景的现代可见占位。

## 关闭检查

- [x] 每条记录都有 `status`、`confidence` 和 `nextAction`。
- [x] 所有 `derived-ready` 条目都有恢复 SWF、精确 character id 和本地派生路径。
- [x] Stage 2-2 与 Stage 22-x 已消歧。
- [x] 36 个 Boss 关键帧、104 个攻击帧、130 帧火焰和 MovieClip 注册点已记录。
- [x] 未把“尚未接入”误写为 `missing-original`。
- [x] 940×590 1P/2P 运行验收已转入同线实现 Goal。

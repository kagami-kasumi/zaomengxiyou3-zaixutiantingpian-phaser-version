# Stage 1 怪物真视觉资源批次

## 范围

- 资源族：Stage 1-1 / 1-2 / 1-3 实际使用的 Monster2/3/4/5/7/8/30 本体、16 个攻击/效果对象和 3 个碰撞根。
- 影响切片：`VS-061`、`TASK-SLICE-157A..D`。
- 排除：现代动画接入、角色/宠物、Stage 2-3、怪物架构重构。

## 输入和证据

- 实际生成：StageListener11/12/13、恢复 sl12/sl13 刷怪点与 `levels-index.md`。
- 行为：7 个 Monster AS3、BaseBitmapDataClip、BaseBullet、SpecialEffectBullet、PhysicsWorld。
- 恢复源：`assets/1.swf` 与 `assets/StageCommon.swf`。
- 选择性派生：`local-resources/regima/task-outputs/task-settings-068-stage1-monsters/` 的 SymbolClass、XML、scripts、7 个 atlas、16 个对象时间轴、3 个碰撞根和两份逐帧几何 CSV。
- 完整六段证据：`../../stage1-monster-visuals-index.md`。

## 调查结论

- 已确认：26 条 stable key；其中 24 条位于 `stage1-monsters.csv`，Monster30 既有 2 条在 `monster30.csv` 原位升级；覆盖 7 个本体 atlas、16 个攻击/效果对象、3 个碰撞根。
- 本体：167 个独立视觉帧；Monster5 hit3 与 Monster8 hit2 分别循环复用 4 帧。
- 攻击对象：16 个对象共 171 帧；触发 tick、生成点、注册边界、命中与生命周期闭合。
- 推测：0。
- 未知：0 个影响逐关实现项。
- 对应标注表：`../annotations/stage1-monsters.csv`。

## 去向

- `157A/B` 已将 Stage 1-1/1-2 的 18 条升级为 `ready + none`；Stage 1-2 的权威对象数为九个而非旧任务文案的八个。
- 余 8 条保持 `derived-ready + integrate`，由 `157C` 接入 Monster5 新资源、`157D` 审计三个碰撞根/五关共享 owner 与 Stage 2 防回归。
- 不继续使用 Arc/Text、单帧或代表性怪物作为关闭证据。

## 关闭检查

- [x] 每条记录都有唯一 stableKey、精确源包、character id、可信度和 nextAction。
- [x] 恢复源、AS3 调用链、时间轴、注册点和碰撞根交叉确认。
- [x] Stage 1 实际生成全集与 Listener 预注册数组的差异已解释。
- [x] Monster30 hit1 透明本体帧与 Monster2Bullet2 frame14 自移除已闭合。
- [x] Stage 2-1/2-2 既有 ready 标注、public 资产与运行证据无回归。
- [x] 正式现代接入已拆为四个连续 Goal。

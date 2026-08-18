# TASK-SLICE-193B 猴系真动画视觉审计

## 机器真值与资源来源

- 运行时直接导入 `task-settings-193a.pet-monkey-animation`；入口断言 `status=verified`、626 状态、20 显示对象和 `unresolved=[]`。
- monkey1..3 本体及九类攻击/技能对象来自恢复 `20120203.swf` 补丁 owner，monkey4 本体来自恢复 `pet1.swf`；派生脚本只把所需的 4 张本体 atlas 和 80 张对象帧复制到公开资源目录。
- `combat-common` 是四本体图集与九个唯一对象序列的唯一 bundle owner；Stage 1-1 与其余四个正式关卡共用同一 `PetMonkeyAnimationView`，P1/P2 只读取现有 roster 与 `PetRuntimeSystem`。

## 显示列表与状态投影

| 层级 | 原版对象 | 现代投影 | 状态/生命周期 |
| --- | --- | --- | --- |
| 宠物本体 | `PetMonkeyBmd1..4` | 四形态 spritesheet | wait/walk/hurt/dead、normal、xj/lj/lyq/jgaoyi；逐行 cell、持帧、20/24/30 host clock、左右注册点直接来自真值 |
| 普攻 | `PetMonkey1/2/3Bullet1` | 三个逐帧对象序列 | 素材、生成矩阵和动作已注册；当前现代业务没有通用宠物普攻触发 owner，本 task 按禁止 AI 变更合同不新增触发链 |
| xj | `PetMonkey1Bullet2` | 四形态复用同一 16 帧序列 | 跟随宠物位置/朝向，循环并按原合同保留 4 秒 |
| monkey2 lj | `PetMonkey2Bullet2_1/_2` | 两个同时可见序列 | 真值偏移、深度和末帧销毁 |
| monkey3/4 lj | `PetMonkey3Bullet3_1/_2` | 两个同时可见序列 | 真值偏移、深度和末帧销毁 |
| lyq | `PetMonkey3Bullet2` | 25 帧序列 | 真值偏移、朝向与末帧销毁 |
| jgaoyi | monkey4 本体 hit5 row8 | 无独立 projectile 图层 | 原现代伪 `PetMonkey4Hit5` 可见对象已移除，碰撞/伤害合同不变 |

## 原版基准、现代例外与差异

- 原版基准：193A 的 626 个 SWF-derived 状态基准及注册/alpha 边界；193B 未从整页截图制造资源。
- 允许的现代例外：宠物世界位置继续由既有 `PetRuntimeSystem` 的跟随/远距传送模型决定；本 task 只替换可见投影，不改变该业务行为。
- 已关闭差异：猴系几何本体、单图 projectile 占位、monkey2 xj 错名、lj 缺少第二段、jgaoyi 独立伪对象。
- 保留边界：非猴系仍沿用原有表现并由后续 193C..193R 逐族闭合；没有现存业务触发的 normal 动作不被冒充为已新增 AI 功能。

## 940×590 运行证据

- 正式双人存档进入 Stage 1-1，P1/P2 同时显示 monkey 真本体；Retry 后同源重建。
- 浏览器 viewport 为 940×590；console warning/error 为 0。
- 证据图：[stage11-p1-p2-monkey-wait.png](stage11-p1-p2-monkey-wait.png)。

## 验证

- `npm run test:pet-monkey-animation-runtime`
- `npm run test:pet-monkey-animation-truth`
- `npm run test:pet-animation-corpus`
- `npm run test:asset-bundles`
- `npm run test:systems`
- `npm run build`
- `npm run check:structure`
- `npm run check:annotations`
- `npm run check:workflow`
- `npm run audit:problems`
- `git diff --check`


# TASK-SLICE-202 视觉与运行验收

## 显示列表与 truth 消费

- character 662 壳体继续消费 `task-settings-191.pet-combat-hud`：605 shell、610/614 各 25 帧 HP/MP 条、659/660/661 文本和 P1/P2 根镜像不变。
- 动态 `headmc` 只消费 `task-settings-201.pet-combat-hud-head`：35 个实际 pet fixture、70 个 P1/P2 可见状态、4 个无出战/休息负状态，`verified/unresolved=[]`。
- `PetCombatHudHeadAssets.ts` 逐 fixture 解析目标 frame、终端 child、child matrix、registration、visible bounds 与 baseline；33 个唯一终端 child 覆盖 35 fixture，mouse1/2/3 有证据地共享 character 648。
- 正式 `Stage1PetCombatHudView` 不再调用宠物页 `getPetNativeHeadAsset`，不再使用身体 atlas，也不再把头像拉伸到 `104.8×93.6` 联合 bounds。运行时只装载 `pet-combat-hud-heads` 专属 bundle。
- 允许的现代可见例外：空。character 662 的黑色 Glow 使用 Phaser pre-FX 等价投影；其余可见资源来自恢复 `pet1.swf`。

## 自动差异证据

- `representative-head-runtime-comparison.svg`：九物种代表 fixture 的原版 baseline、运行 bundle 和 50% overlay。
- `representative-head-runtime-diff.json`：九项原版 baseline SHA-256 与运行资源 SHA-256 完全一致，资源像素差为 0；包含 monkey2 frame 5 / character 619。
- `stage1-hud-tests.ts`：35 fixture、33 唯一 child、P1/P2 根镜像、满/半/0 HP/MP、休息隐藏及 frame/child/matrix/registration/visible-bounds 变异门禁。
- `formal-pet-journey-tests.ts` 与全系统测试：五关共享 Runtime、P1/P2 出战/休息/换宠/重开/重载继续消费同一 roster owner。

## 940×590 正式运行

- URL：`http://localhost:4174/?qaStage=1-1-role1&players=2`（localhost 正式双人关卡 QA 入口；无第二 HUD owner）。
- 截图：`modern-active-dual-monkey1-940x590.png`。
- 结果：P1/P2 character 662 均可见；monkey1 头像保持目标帧真实大小/注册位置，未被拉伸；P2 根镜像和文字反转保持；console warning/error 为 0。
- 五关正式冷启动、返回和重载由 `npm run test:formal-pet-journey` 与 `npm run test:systems` 确定性覆盖；本 task 未修改业务 owner、战斗数值、存档、宠物页或宠物动画行为。

## 可见对象差异清单

| 对象 | 处置 | 差异 |
| --- | --- | --- |
| 605 shell | 保留 191 原资源 | 无 |
| 610/614 HP/MP | 保留 191 的 25 帧序列 | 无 |
| 657 目标帧 child | 201 verified baseline 直接进入专属 runtime bundle | 删除身体 atlas、联合 bounds 拉伸和硬编码头像偏移 |
| 657 headmc Glow | 等价 pre-FX | 仅允许浏览器/WebGL 抗锯齿容差 |
| 659/660/661 文本 | 保留 191 动态投影 | 仅字体栅格化容差 |

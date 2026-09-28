# TASK-SLICE-233 Canvas 回退验收

状态：Completed（2026-09-28）。只完成共享 Canvas 尺寸修正；完整宠物家族、234/235、其他怪物类型与 VS-067 仍未关闭。

## 实现与证据链

- 现代缺陷：Phaser 3.90.0 `CanvasRenderer.batchSprite` 的 roundPixels 分支将 `frameWidth / resolution`、`frameHeight / resolution` 各加 0.5；实际 850 态中 654 态与原生 EXIT 不符。
- `src/core/PhaserCanvasSprite.ts` 保留该版本的裁切、flip、parent matrix、mask、alpha、blend、取整逻辑，移除目标宽高扩张。许可证随文件保留。`src/main.ts` 在 postBoot 对 Canvas 实例统一安装；AUTO、roundPixels、WebGL、战斗/碰撞/时钟不改。Phaser 升级须复验此兼容实现。
- 原版输入沿用 verified 的 `task-slice-226-monkey-pause-display.json` / `task-slice-226-horse-pause-display.json`（truthId 分别为 `task-slice-226.monkey-pause-display` / `task-slice-226.horse-pause-display`）。原显示列表/嵌套相位/来源/基准未改。`prepare_display_browser.py` 校验三帧率 EXIT 采样 hash 与光栅一致后，按原生 crop/方向独立构造 expected；不从现代画布生成 expected。
- 现代显示消费者仍为 FormalPetMonkeyBodyBridge / FormalPetHorseBodyBridge。六段链沿用226；本批是其共享后端消费纠错，不重新宣称 AS3 或 SWF 真值。

## 实际浏览器结果

| 检查 | 结果 |
| --- | --- |
| Canvas 未安装修正，850 态双向效果 | 准确复现654态失败；3,642,369残差像素，最大alpha165、预乘RGB145.98823529411766 |
| Canvas 正式同一安装函数，850 态 | 0失败、0残差、alpha/RGB最大误差均0 |
| WebGL，850 态 | 0失败、0残差、alpha/RGB最大误差均0 |
| 正式main AUTO关闭WebGL能力后回退Stage12，双人 | renderer=CANVAS；roundPixels=true；63纹理对象 |
| 正式场景身体/地形/HUD，12组位置及滚动输入 | 528次绘制；仅目标宽高移除0.5，其余源裁切、矩阵、alpha/blend/smoothing完全不变 |
| 额外8组绘制边界 | round开/关、crop、flipXY、rotation、父容器缩放、resolution=2、GeometryMask组合通过；连同场景共888次绘制，708次移除扩张，其余180次不变 |
| 正式WebGL Stage12 | 12组截图，AUTO选择WebGL，身体、地形、双人HUD目检无新增布局偏移 |

位置输入为0/.25/.5/.75小数偏移，camera.scrollX输入0/123.25/345.75；Phaser原roundPixels在camera preRender后得到0/123/345，保持其现有语义。显示层整数取整沿用已有规则；不量化游戏状态。场景检查是冻结真实Scene的工程几何回归及目检，**不是原版整场景逐像素基准**，两次启动也不保证身体动画相位一致。已有抗锯齿/舍入例外不扩大；850效果本次无需像素例外。不宣称所有场景或全部浏览器像素一致。

实际逐态报告、本次反例、draw命令及摘要在本地 `docs/tasks/evidence/TASK-SLICE-233/`：`canvas-before.json`、`canvas-after.json`、`webgl-after.json`、`canvas-scene.json`、`webgl-scene.json`、`summary.json`。226原654态证据完整保留。代表截图 `canvas-scene-0.png` / `webgl-scene-0.png` 为初始视口，`*-scene-11.png` 为小数位置和滚动组；HUD布局和地形完整，原有QA提示与HUD的重叠不是本批新改。

## 复验

先 `npm run build`，使用已有或 `npm run preview` 的4174端口。然后：

```text
node tools/build-pet226-display-probe.mjs
node tools/run-canvas233-effects.mjs
node tools/run-canvas233-scene.mjs canvas
node tools/run-canvas233-scene.mjs webgl
npm run test:systems -- --core
npm run test:systems -- pet-monkey-pause-display-tests pet-horse-sp-display-tests pet-horse-falling-display-tests stage12-resource-tests stage1-hud-tests five-stage-monster-visual-regression-tests
npm run check:workflow
npm run audit:problems
git diff --check
```

浏览器脚本使用本机Edge和隔离临时profile，无新增软件；效果复验依赖226本地原生语料。正式构建不依赖evidence。升级Phaser时，场景测试还将兼容实现与当前upstream实际draw命令对照，不能只看构建或零console。

首次探针将未修正postBoot设为undefined导致加载未完成，改为no-op后重跑；首次正式探针误把启动后renderType当AUTO，依据CreateRenderer的实际解析行为修正断言；旧启动fps测试需注入新增callback依赖，保留原fps断言。上述失败未计通过。

清理限制：自动审批以“blocked by policy”拒绝删除命令，未提供细分原因；24张截图与两个dist探针目录均保留，20张候选重复截图/约23.3MB及159个探针文件/约46.3MB清单见本地cleanup.json。原始基准不在删除范围；未绕过审批。

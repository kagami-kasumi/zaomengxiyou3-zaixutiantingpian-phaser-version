# TASK-SLICE-173A3 视觉验收

## 验收范围

- 路由：`/?qaStage=1-1-role1&qaRole1Shadow=1`
- 视口：940×590；与 verified manifest 的 `stage.width/height`、`noScale`、top-left 对齐一致。
- 原版机器真值：`task-settings-173.role1-shadow`（`verified`）；实现直接消费 `states` 与 `displayObjects[0].placements`。
- 本批只证明 TestScene 薄 QA 适配及共享投射；正式五关 Runtime 明确保留给 `TASK-SLICE-173A2`。

## 显示列表与现代例外

每个活跃 shadow 的可见显示列表只有一个 `role1-shadow-bitmap`：源身份 `WuKong.swf` character 1 / `ROLE1_SHALLDOW`，200×200 atlas cell，深度为 shadow bridge 的单一 sprite。行为模型、碰撞和 QA `data-*` 观测均不可见，不新增文字、面板、占位图或现代可见叠层。

允许的现代可见例外：无。QA 路由的确定性目标、MP/无敌设置和 `data-role1-shadow-qa*` 属性均不可见且不进入默认路由。TestScene 原有开发 HUD/关卡对象不作为影分身原版显示列表的一部分，也不用于证明正式 Runtime 已接入。

## 逐状态证据

| 状态 | 机器观测 | 截图 | 对照结论 |
| --- | --- | --- | --- |
| walk right | `walk-1-right`，frame/candidate 1，origin `(0.425, 0.525)`，`flipX=true`，固定 candidate | [walk-right.jpg](walk-right.jpg) | 与 verified right placement 和静态候选一致 |
| walk left | `walk-3-left`/`walk-1-left`，origin `(0.575, 0.525)`，`flipX=false` | [walk-left.jpg](walk-left.jpg) | 与 verified left placement 一致；无额外 `(+15,-5)` 双补偿 |
| hit1 | `hit1-0-right`，frame 5，action tick 0；仅在 qsez busy gate 清零后由 `lyfb` 进入 | [hit1-right-frame-0.jpg](hit1-right-frame-0.jpg) | 行为专项覆盖 2/3/2/3 holds、tick 2 发射和 tick 10 销毁 |
| hit1 destroy | shadow dataset `[]` | [hit1-destroyed.jpg](hit1-destroyed.jpg) | frame-over 后销毁，无 walk 回退 |
| hit2 frame 0 | `hit2-0-right`，frame 10，tick 1 | [hit2-right-frame-0.jpg](hit2-right-frame-0.jpg) | 2 tick hold 内 |
| hit2 frame 1 | `hit2-1-right`，frame 11，tick 6 | [hit2-right-frame-1.jpg](hit2-right-frame-1.jpg) | 12 tick hold 内 |
| hit2 frame 2 | `hit2-2-right`，frame 12，tick 15 | [hit2-right-frame-2.jpg](hit2-right-frame-2.jpg) | 16 tick hold 内；未被 `zz` 立即清空 |
| hit2 destroy | shadow dataset `[]` | [hit2-destroyed.jpg](hit2-destroyed.jpg) | 30 tick frame-over 后销毁 |
| reentry | 销毁后新建 `p1-shadow-2` / `walk-0-right`，source 仍为 `p1` | [reentry-right.jpg](reentry-right.jpg) | identity 新建且 source owner 稳定 |

完整机器观测见 [runtime-observation.json](runtime-observation.json)。所有截图均为 940×590 JPEG；fresh tab 日志只有 Phaser 普通 `log`，warning=0、error=0。

## 差异闭环

- 已移除 TestScene 每 400ms 循环 walk candidate；candidate 只在创建时选定。
- 已移除视觉 bridge 的重复位置补偿；左右 origin 直接来自 verified placements。
- `lyfb` 只触发 hit1；`zz` 只触发 hit2，且按证据时点产生分身弹体，不再同步生成后立即清空。
- 异步 atlas 未就绪时 bridge 暂不创建 sprite，避免 Phaser `__MISSING` 纹理竞态；真纹理就绪后才创建 `hero-animation.hero1.shadow`。
- 正式 P1/P2、五关生命周期与正式输入/目标 owner 尚未验收，不在本批结论内。

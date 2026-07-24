# TASK-SLICE-150C Monster16、显门与结果验收

## 验收范围

- 940×590，本地显式 `qaBossState/qaBossTick/qaBossFacing` 入口只用于冻结可复查帧；远程生产主机不接受 QA 参数。
- 验收 Monster16 八动作、六攻击对象、左右镜像、死亡显门、按上胜利与 2-3 保存结果。
- 不代替 `TASK-SLICE-150D` 做 1P/2P 五停点全流程、返回地图与重载校准。

## 原版视觉基准与显示列表

权威源为恢复 `assets/2.swf` character `6/235/229/225/191/160/143`、`assets/levels/level22.swf` character 63 和 `levels-index.md` 的 Stage 2-2 六段矩阵。

| 原显示对象 | depth / 父级 | 原点、边界与生命周期 | 现代映射 |
| --- | --- | --- | --- |
| Monster16 character 6 | 18 / `sl22` 动态怪物层 | 300×300 cell，6×8 atlas，offset `(0,-20)`，36 个可达关键帧 | `monster16.png` + `Stage22Monster16VisualSystem/Bridge` |
| Bullet1 char 235 | 19 / 动态攻击层 | 注册边界 `11.55,-59.2..268.05,113.5`，20 帧 | `monster16Hit1` |
| Bullet2_1 char 229 | 19 / 动态攻击层 | 注册边界 `0,0..247,182`，4 帧 | `monster16Hit2Start` |
| Bullet2_2 char 225 | 19 / 动态攻击层 | 注册边界 `-120.5,-123.15..120.5,148.3`，29 帧 | `monster16Hit2Followup` |
| Bullet3 char 191 | 19 / 动态攻击层 | 注册边界 `0,0..304,304`，15 帧循环并跟随 Boss，固定 7 秒 | `monster16Hit3` |
| Bullet4_1 char 160 | 19 / 动态攻击层 | 注册边界 `0,0..100,100`，16 帧 | `monster16Hit4Start` |
| Bullet4_2 char 143 | 19 / 动态攻击层 | 注册边界 `-427.25,0..200,200`，20 帧 | `monster16Hit4Followup` |
| 普通门 character 63 | 84 / `sl22` | 原点 `(4316.75,450.75)`；Boss 死亡前隐藏，之后显示 | `Stage22WorldBridge.transferDoor` |

HUD 和结果页继续复用既有正式共享 owner。本 task 没有增加圆、标签、辉光或额外命中特效；本地冻结参数是不可进入正式远程流程的验收控制。

## 时序、注册点与自动证据

- 本体 hold tick 为 wait 15、walk 16、hurt 15、dead 15、hit1 20、hit2 36、hit3 30、hit4 31。
- 六攻击帧数为 `20/4/29/15/16/20`，总计 104；生成 tick 和左右偏移由 `levels-index.md` 矩阵驱动。
- `test:stage22` 覆盖 24189 HP、34 物防、四攻击循环、伤害类型/数值/范围、六事件、36 帧本体、幂等死亡显门、2-3 保存 round-trip。
- 所有攻击图片以 CSV 的 MovieClip 注册点计算 Phaser origin；没有把裁切图左上角当作对象原点。

## 逐状态运行证据

左向：

- [wait](./TASK-SLICE-150C-monster16-wait.png)、[walk](./TASK-SLICE-150C-monster16-walk.png)、[hurt](./TASK-SLICE-150C-monster16-hurt.png)、[dead](./TASK-SLICE-150C-monster16-dead.png)
- [hit1 / Bullet1](./TASK-SLICE-150C-monster16-hit1.png)
- [hit2 / Bullet2_1](./TASK-SLICE-150C-monster16-hit2-start.png)、[hit2 / Bullet2_2](./TASK-SLICE-150C-monster16-hit2-followup.png)
- [hit3 / Bullet3](./TASK-SLICE-150C-monster16-hit3.png)
- [hit4 / Bullet4_1 + Bullet4_2](./TASK-SLICE-150C-monster16-hit4.png)

右向：

- [wait](./TASK-SLICE-150C-monster16-wait-right.png)、[walk](./TASK-SLICE-150C-monster16-walk-right.png)、[hurt](./TASK-SLICE-150C-monster16-hurt-right.png)、[dead](./TASK-SLICE-150C-monster16-dead-right.png)
- [hit1](./TASK-SLICE-150C-monster16-hit1-right.png)、[hit2](./TASK-SLICE-150C-monster16-hit2-right.png)、[hit3](./TASK-SLICE-150C-monster16-hit3-right.png)、[hit4](./TASK-SLICE-150C-monster16-hit4-right.png)

流程：

- [Boss 死亡后 character 63 显门](./TASK-SLICE-150C-door-visible.png)
- [按上后的 Stage 2-2 胜利与“已解锁并保存 2-3”](./TASK-SLICE-150C-victory.png)

全部新鲜导航的 console warning/error 为 0。真资源冷启动约需 10—12 秒，冻结入口仅在资源完成后记录画布。

## 可见差异清单

| 项目 | 裁决 |
| --- | --- |
| Monster16 本体 36 关键帧 | 原 RGBA atlas 直接复用 |
| 六攻击对象 104 帧 | 原 SVG 时间轴直接复用 |
| 左右方向 | 围绕同一 MovieClip 根水平镜像 |
| Bullet3 | 原 15 帧视觉循环、跟随 Boss、7 秒销毁 |
| character 63 门 | 原资源直接复用，死亡前隐藏/死亡后显示 |
| 结果/HUD | 复用既有正式共享 owner；未新增本 task 可见替代层 |
| QA tick/facing 控制 | 本地显式验收控制，正式远程入口不可达 |

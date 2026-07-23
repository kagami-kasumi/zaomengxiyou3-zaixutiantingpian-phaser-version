# TASK-SLICE-146 视觉复验

复验日期：2026-07-23

## 基准与显示列表

- 原版基准：恢复源 `local-resources/regima/source/restored-swfs/assets/2.swf`，以及 `TASK-SETTINGS-062` 从同一源包选择性派生的四个 RGBA atlas、七类攻击逐帧 PNG/SVG 和几何 CSV。
- 现代显示列表：`Stage21MonsterVisualBridge` 只创建怪物 atlas sprite 与攻击 MovieClip 帧序列；`Stage21GameplayBridge` 不再创建怪物 Arc/Text、颜色状态层或额外命中火花。
- 资源一致性：public 中 4 个 atlas 与 132 个攻击帧直接复制自上述派生目录；专项测试逐项核对尺寸、帧数、atlas cell、注册点和原始 character id。
- 允许的现代可见例外：无。画面中的简化玩家角色、HUD 与 QA 顶部提示不属于本 task 的怪物/攻击显示列表。

## 940×590 状态证据

| 状态 | 证据 | 观察结论 |
| --- | --- | --- |
| 1P M9 wait/walk/hit1 | `TASK-SLICE-146-1p-m9-runtime.png` | 真 atlas 动作与四帧斩击对象可见，怪物根未跳动 |
| M9 hurt | `TASK-SLICE-146-1p-m9-hurt.png` | 单帧 hurt 行与碰撞脚底一致 |
| 2P M10 hurt | `TASK-SLICE-146-2p-m10-showcase.png` | 双 HUD 存在；M10 使用自己的 atlas，无 Monster9 复用或 hit2 伪动作 |
| M19 hit1 | `TASK-SLICE-146-1p-m19-burst-13.png` | 25 帧攻击对象从 MovieClip 注册点发出；空尾帧按原生命周期销毁 |
| M6 hit2 | `TASK-SLICE-146-1p-m6-cycle-10.png` | 起手对象与三处雨阵同时可见，触发数量和落点不漂移 |
| M6 hit3 | `TASK-SLICE-146-1p-m6-cycle-85.png` | 大范围纵向效果按独立对象播放；第一段完成后 recovery 正常释放并进入后续攻击 |
| M6 dead | `TASK-SLICE-146-1p-m6-dead.png` | 130 高碰撞根保持，死亡动作播到可见倒地帧后才允许销毁 |
| 五停点与门胜利 | `TASK-SLICE-146-1p-clear-door.png`、`TASK-SLICE-146-1p-clear-result.png` | 自动清怪只用于开发验收；真实停点、镜头、Boss 门、胜利和保存 2-2 流程保持 |

左右向对照由 `TASK-SLICE-146-1p-m9-runtime.png` 中朝右追击与定点展示中朝左攻击共同覆盖；sprite 使用同一碰撞根做 `flipX`，未观察到脚底或攻击注册点跳变。

## 可见差异清单

- 怪物本体：未见与原派生 atlas 的可见差异。
- 攻击对象：未见额外现代圆、文字、色块或命中火花；零 padding 滤镜边界按导出画布保留。
- 生命周期：运行取证发现并修正一次 M6 已完成攻击仍锁定 recovery 的问题；修正后 hit1/hit2/hit3 可连续循环。
- console：修正 QA 取证钩子的作用域错误后，在新浏览器标签页重新进入 M19 运行态，error/warn 均为 0；证据为 `TASK-SLICE-146-clean-console-m19.png`。

结论：四怪本体、七攻击对象、左右镜像、碰撞脚底、注册点、触发 tick、死亡与清理均满足本 task 的双重验证合同。

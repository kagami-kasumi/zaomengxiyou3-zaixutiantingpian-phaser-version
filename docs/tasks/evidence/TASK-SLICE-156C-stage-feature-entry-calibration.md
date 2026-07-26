# TASK-SLICE-156C 关卡五入口校准证据

## 确定性旅程

- `tools/stage-feature-entry-tests.ts` 将 `TestScene`、`Stage12Scene`、`Stage13Scene`、`Stage21Scene`、`Stage22Scene` 纳入同一批次，逐关断言只安装一次共享 `installFormalFeatureUiEntries`，并消费正式 `PartyConfiguration`。
- 五关逐一覆盖 P1 背包打开、P2 宠物 owner、单页 busy 互斥、关闭恢复原 origin、P2 `*` 默认 P1 技能、P2 pointer 设置归全局 P1 owner。
- 共享 router 继续覆盖单人拒绝 P2、死亡拒绝背包/法宝但不拒绝宠物、特殊关卡限制、未装备法宝拒绝，以及 P2 无法宝/设置快捷键。
- 战斗 `FeatureUiScene` 只绑定当前页原快捷键；其他页键不能切页，Escape 不关闭背包/技能/宠物/法宝。设置页单独消费 Escape，并按继续/关闭、返回地图、返回主菜单三条路由处理 origin。
- 五个 HUD 命中区与可见按钮统一为固定屏幕坐标 `scrollFactor=0`，不再把相机滚动手工叠加到透明 hit zone。
- Stage 2-2 复用的 Monster9/10/19 图集、攻击帧和几何归入唯一 `stage-2-monsters` 共享资源包；Stage 2-1/2-2 共同依赖，正式地图进入 Stage 2-2 不再因几何缺失中断。

## 940×590 运行证据

| 关卡 | 证据 | 结论 |
| --- | --- | --- |
| Stage 1-1 | `TASK-SLICE-156C-stage11-hud.png`、`TASK-SLICE-156C-stage11-p1-hover.png` | 正式存档进入；P1 HUD 五入口在固定层，命中区悬停返回 pointer，世界相机滚动不改变 HUD 命中 |
| Stage 1-2 | `TASK-SLICE-156C-stage12-hud.png` | 正式地图节点进入；五入口复用同一 HUD/路由，无关卡私有 host |
| Stage 1-3 | `TASK-SLICE-156C-stage13-hud.png` | 正式地图节点进入；五入口复用同一 HUD/路由，无关卡私有 host |
| Stage 2-1 | `TASK-SLICE-145-1p-entry.png`、`TASK-SLICE-145-2p-entry.png` | 既有正式 1P/2P 入口基准继续有效；本次专项静态门禁确认共享入口唯一安装 |
| Stage 2-2 | `TASK-SLICE-156C-stage22-hud.png` | 正式地图当前节点进入；修复共享怪物资源 owner 后场景与五入口正常出现 |

内置浏览器对 Phaser canvas 的瞬时 click/keypress 无法稳定产生跨帧 `pointerup`/键盘事件；本批次没有把工具限制伪装成页面截图。运行态用于确认正式路由、五关画面、HUD normal/hover 命中和 Stage 2-2 资源修复，页面打开、owner、暂停/互斥、同键/Escape 与返回由同一批确定性旅程覆盖。

## 可见对象差异

- 原资源复用：574 的 549/555/561/567/573 五按钮四态、371 设置、444 帮助、四个既有原生功能页根。
- 等价动态字段：P1/P2 owner、存活/特殊关卡/法宝装备门禁、设置声音与出怪速度会话值。
- 用户批准现代例外：全局设置跨应用重启、不可见键盘可访问性语义。
- 未出现：战斗现代暗层、现代标题/边框、跨页按钮、workshop、通用 Escape 关闭、P2 法宝/设置快捷键、P2 `*` 默认 P2 owner。

## Console

- 修复前正式 Stage 2-2 暴露 `Stage 2-1 attack geometry was not loaded`，随后首次直接重复归属尝试触发 bundle owner 冲突；最终通过独立 `stage-2-monsters` owner 关闭。
- 最终构建后的 Stage 1-1/1-2/1-3/2-2 运行没有新增 warning/error；Stage 2-1 复用 `TASK-SLICE-145` 的零 console 运行证据。

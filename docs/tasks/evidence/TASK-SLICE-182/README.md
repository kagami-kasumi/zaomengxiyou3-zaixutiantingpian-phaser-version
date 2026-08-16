# TASK-SLICE-182 功能宿主运行差异证据

## 验收范围

- 原版真值：`task-settings-175c.stage-feature-host`，`verified`，25 对象、42 状态、`unresolved=[]`。
- 负向宿主状态：`map-origin-no-shared-chrome` 的可见对象计数为 0。
- 现代入口：940×590 天庭地图工坊与正式战斗 P1/P2 背包 pointer。
- 允许的新增可见现代例外：空。

## 视觉产物

- `modern-map-workshop-direct-root-no-shared-chrome-940x590.png`：地图服务直接显示工坊页根，无暗层、金边、标题、跨页按钮或通用关闭。
- `modern-combat-p1-backpack-direct-root-940x590.png`：P1 pointer 直出背包原页根。
- `modern-combat-p2-backpack-direct-root-940x590.png`：P2 镜像 pointer 直出 P2 owner 背包原页根。
- `modern-combat-p1-backpack-other-key-no-switch-940x590.png`：背包打开时按宠物键仍保持背包，未跨页。
- `modern-combat-p1-backpack-same-key-return-940x590.png`：同页键关闭后恢复原战斗。
- `modern-combat-dual-hud-return-940x590.png`：双人页关闭后恢复同一关卡与两侧 574 入口。
- `comparison-map-no-shared-host-side-by-side.png` / `comparison-map-no-shared-host-overlay-50.png`：175C 负向空 host scope 与现代运行态对照；现代页根属于外部页面 manifest，不计入共享 host 对象。

## 逐对象与行为差异

| 对象/行为 | 现代投影 | 差异结论 |
| --- | --- | --- |
| 175C verified 真值 | `FormalStageFeatureHostTruth.ts` 运行时直接导入并断言 25/42、零 unresolved、负向状态 0 对象 | 直接消费；漂移立即失败 |
| 地图共享 chrome | `FeatureUiScene` 不再创建任何宿主 rectangle/text/button | 与原版负向事实一致；可见差异为 0 |
| 地图服务入口 | 入口只启动当前页 root；地图不注册战斗五快捷键 | 原页面独立宿主；无跨页导航 |
| 战斗五入口 | 继续消费 574 原按钮与 router 门禁，P1/P2 pointer 共用固定 hit | 原资源/几何复用；owner 不串线 |
| 单页门 | session 只允许页内 owner 切换；其他页快捷键不切换 | 恢复原全局单页互斥 |
| 关闭 | 战斗同页键或页面原关闭返回；地图只走页面原返回 | 删除通用 Escape/关闭按钮 |
| Escape | 仅由战斗入口 router 打开/关闭 371 设置链 | 不再关闭任意功能页 |

## 验证

- `npm run test:stage-feature-host-truth`、`npm run test:stage-feature-host-runtime`、`npm run test:stage-feature-entry`、`npm run test:feature-ui-host`、`npm run test:systems`。
- `npm run build`、`npm run check:structure`、`npm run check:workflow`、`npm run check:annotations`、`npm run audit:problems`、`git diff --check`。
- 浏览器 940×590：地图工坊、战斗 P1/P2 背包、其他键不切页、同键返回；双人关卡 Escape 打开 371 设置页，帮助入口切到 444 双人操作指南；console warning/error 为 0。

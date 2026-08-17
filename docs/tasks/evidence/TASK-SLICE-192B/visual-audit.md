# TASK-SLICE-192B 视觉与运行验收

## 范围

- 原版机器真值：`task-settings-191.pet-combat-hud`（verified；10 对象/10 状态；`unresolved=[]`）。
- 现代投影：`Stage1CombatHudSystem -> HeroPartyRuntimeBridge -> Stage1CombatHudBridge -> Stage1PetCombatHudView`。
- 只读 owner：当前活动存档的 P1/P2 `PetRoster`；宠物页提交后由既有 `FormalPetsUpdatedEvent` 替换同一 roster 引用，没有第二宠物 runtime 或数值副本。
- 可见对象：605 shell、610/614 的 25 帧 HP/MP、当前宠物原生头像、等级/HP/MP 三字段；原版 662 不含技能子层。

## 940×590 基准与差异

| 状态 | 原版基准 | 现代证据 | 结果 |
| --- | --- | --- | --- |
| P1/P2 出战 | `TASK-SETTINGS-191/original-active-full-p1/p2-940x590.png` | `modern-active-dual-940x590.png`、`comparison-active-dual-overlay.png` | P1 根 `(0,94)`、P2 `(920,94), scaleX=-1`；P2 三字段反转保持可读；双方 MP 值独立（30/150 与 90/150） |
| P2 休息 | `original-rested-p2-940x590.png`（0 对象） | `modern-p2-rested-940x590.png` | P2 662 全部移除，P1 仍保留；再次出战即时重建 |
| 受击/死亡 | manifest `active-hit-*` / `active-dead-*` | `stage1-hud-tests.ts` | 公式 `max(1, 25-round(25*current/max))`；半血 frame 12，0 HP frame 25；lifetime 仍正时 HUD 保留 |
| 技能激活 | 原版 662 无技能 child | snapshot/view 静态门禁 | 不新增图标、文字或现代技能层，HUD 只随 HP/MP 数值刷新 |

`comparison-active-dual-overlay.png` 左侧是正式双人运行截图，右侧是在同一 940×590 画面上叠加 50% 原版 P1/P2 character 662 基准。原版基准的静态头像/文字只用于结构对齐；动态值与 25 帧状态以 manifest 和确定性测试为准。

## 可见对象差异清单

| 对象 | 处置 | 差异 |
| --- | --- | --- |
| shell 605 | 原资源复用 | 无现代矩形/通用血条 |
| HP 610 / MP 614 | 原 25 帧逐帧导出 | 运行按原 AS3 公式选帧 |
| headmc 657 | 复用 175A 已恢复的同源宠物头像 | 由 `species + form` 选择当前头像；不进入宠物本体动画族 |
| 659/660/661 TextField | 等价动态 Text 投影 | 浏览器字体栅格化是唯一渲染容差；位置、宽高、字号、颜色和 P2 反转按真值 |
| `petAvailable` 文本 | 删除未批准现代替代 | 仅保留既有法宝快捷提示 |

允许的新增可见现代例外：空。正式双人建档→地图→关卡、P2 休息→失败/重试、再次出战均无 console warning/error。

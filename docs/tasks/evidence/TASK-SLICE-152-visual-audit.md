# TASK-SLICE-152 技能 owner / 当前角色视觉验收

## 验收边界

- 舞台固定为 940×590，入口均来自正式存档槽与天庭地图。
- 显示列表、原版视觉基准和按钮/动态槽位合同继续引用 `skill-ui-native-index.md` 与 `TASK-SLICE-143-visual-audit.md`；本 task 不派生或重做任何技能 UI 资源。
- 唯一可见变化是 owner selector 的可达集合和每个 selector 对应的存档当前角色内容。
- 新增可见现代例外：无。

## 状态证据

| 状态 | 运行截图 / 自动证据 | 结果 |
| --- | --- | --- |
| 单人当前角色 | `TASK-SLICE-152-single-owner.png`；`formal-skill-tests.ts` 遍历 hero 1..5 | 只创建 P1 当前角色 selector；五角色分别读取自己的两棵树、技能、绑定与被动；P2 创建、切换和直接写入均拒绝 |
| 双人 P1 唐僧 | `TASK-SLICE-152-dual-p1-tang.png` | 两个 selector 可见，P1 selector 为 selected；主动树读取 P1 唐僧存档状态 |
| 双人 P2 白龙 | `TASK-SLICE-152-dual-p2-bailong.png` | 同一页面切到 P2 后 selected 与主动树一起切换，P1 数据不变 |
| 双人同角色 | `party-save-tests.ts`、`save-party-flow-tests.ts`、`formal-skill-tests.ts` | 原版选角合同禁止 P1/P2 同角色；V5 在技能页之前拒绝该非法状态，不为验收放宽存档合同 |
| 保存 / HUD | `formal-skill-tests.ts` | P2 技能保存重载不修改 P1；运行时同步按稳定 `PlayerSlot` 只更新对应玩家并发送 owner 事件 |

## 可见对象差异清单

| 对象 | 结果 |
| --- | --- |
| character 250/868/417/213 根页与子页 | 原资源复用，无变化 |
| 五角色 selector 218/223/228/233/871 | 原 frame 1/2 复用；实例集合改由 V5 `PartyConfiguration` 决定 |
| 主动 10 树、50 技能三态、绑定五槽、被动五行 | 原资源与动态字段映射不变；数据改为 selector 对应 owner 的 party hero |
| P1/P2 现代文字按钮、当前角色标题、提示框 | 未新增 |
| 单人非活动 P2 | 不创建 selector，入口、页内快捷键和直接系统调用均拒绝 |

## 运行结果

- 双人正式新档使用唐僧 / 白龙，P1/P2 selector、selected 帧和不同角色主动树切换正常。
- 单人正式新档只显示一个当前角色 selector；触发 P2 技能快捷键后页面仍保持 P1。
- 三个状态的浏览器 console warning/error 均为 0。
- 本次创建的临时 3 号验收槽在截图后删除。


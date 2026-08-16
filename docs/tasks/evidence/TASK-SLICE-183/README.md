# TASK-SLICE-183 运行差异证据

## 范围

- 真值：`task-settings-175d.skill-pages`，250 对象、32 状态、`unresolved=[]`。
- 舞台：全部运行截图固定为 940×590；原版基准来自 `TASK-SETTINGS-175D` 的同尺寸恢复源组合图。
- 正式入口：当前槽天庭地图技能按钮；隔离 fixture 使用正式 Stage 1-2 HUD 技能按钮和仅 localhost 生效的内存存储，不读取或改写用户槽。

## 运行证据

| 状态 | 现代截图 | 差异产物 | 结论 |
| --- | --- | --- | --- |
| Role1 主动树 1 / P1 | `modern-active-role1-tree1-p1-940x590.png` | `comparison/overlay-50/difference-active-role1-tree1-p1-*` | 250/868/865、心法字段、五技能三态、原设置/升级按钮和灵魂余额均按 manifest 投影；fixture 数值与原结构基准数值不同，矩形/层级保持 |
| 被动 P1 | `modern-passive-p1-940x590.png` | `comparison/overlay-50/difference-passive-p1-*` | 213/212 五行、四动态字段和 207 按钮直接使用真值 bounds；无现代表头/摘要 |
| 绑定 P1 | `modern-bind-p1-940x590.png`、`modern-bind-dropped-p1-940x590.png` | `comparison/overlay-50/difference-bind-p1-*` | 417、五个 76×76 槽、source `+5,+5` 吸附、拖放落空回退和 337 原关闭提交保持；P1 键帽为 Y/U/I/O/L |
| 绑定 P2 | `modern-bind-p2-940x590.png` | `comparison/overlay-50/difference-bind-p2-*` | 同一页面 owner 切换后使用 P2 4/5/6/3 键帽帧，技能/槽不串 P1 |
| 返回 | `modern-closed-return-940x590.png` | 正式天庭地图稳定态 | 240 返回恢复来源场景；console warning/error 为 0 |

## 对象差异清单

- 原资源复用：250/868/865/417/213/212、218/223/228/233/871、240/244/248/337/580/638/207 及 50 个技能 sprite 三帧。
- 等价动态：心法名、等级、灵魂需求、`LV.n`、五个被动字段、绑定 source/slot 技能图标。
- 允许的现代可见例外：空；共享 `FormalSoulBalanceView` 是已批准的同源投影，不新增现代皮肤。
- 删除项：`FormalSkillNativeLayout.ts`、P1/P2 现代文字标签、现代 selected 文字样式和第二份技能/按钮/槽位坐标表。
- 未完成：无。字体栅格化差异只按证据合同容差，不改变文字 bounds、基线、颜色或存在性。

## 可重复入口

- `npm run generate:skill-pages-runtime-evidence`
- `npm run test:formal-skills`
- `npm run test:skill-pages-truth`
- localhost fixture：`?qaStage=1-2&players=2&qaSkillFixture=ready`，只在正式 HUD 点击后创建内存槽。

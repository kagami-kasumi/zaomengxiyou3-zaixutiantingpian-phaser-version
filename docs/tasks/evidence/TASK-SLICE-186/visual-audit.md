# TASK-SLICE-186 任务页运行差异证据

## 已完成的运行检查

- 2026-08-16 在 940×590 viewport 从现有 1P 存档进入天庭地图与任务页；页面正常加载，console
  warning/error 为零。
- 初次切换 `daily -> activity` 暴露反证：旧 `root.svg` 是 character 85 整帧导出，仍烘焙页签、
  五个任务行、奖励格与按钮；动态层清空后，空活动页仍显示整帧副本。
- 四张 `pre-fix-*-duplicate-root-940x590.png` 只作为上述反证保留，不是通过证据。

## 反证修复与自动证明

- 新增 `generate-task-native-assets.mjs`，从同一恢复 SWF 的 character 85 SVG 可重复生成
  `root-static.svg`，只保留三个无实例名静态 shape，剥离 18 个动态根 child。
- `TaskScene` 继续逐项投影页签、领取、关闭、五行、说明/进度、四个奖励格、分页和页码；空活动、
  末页隐藏行与动态 child 不再可能从静态根回填。
- `formal-task-tests` 对 `root-static.svg` 增加负向门禁，并对 45 对象、28 状态、五行/奖励/按钮命中/
  字体投影和旧坐标删除执行专项断言；28 个状态 ID 逐项锁定，双人任务 6 的经验奖励对 P1/P2 各自
  出战宠物生效并在重载后保留。
- `post-fix-static-root-940x590.png` 是用 Sharp 对修正后 SVG 的 940×590 直接渲染：可见对象只剩原版
  标题、左右面板及静态标签，不含页签、任务行、奖励格、按钮或动态文字。重新启动的 preview 对
  `/assets/ui/map-services/tasks/root-static.svg` 返回文件与工作区 SHA-256 一致
  （`033B4AEDBE22F8F6C3750CE4CCC180AD764CB9AC47D21AEE6B2EE87C2E2E08AB`）。
- `test:task-page-truth`、`test:tasks`、全系统、build、structure、annotations、workflow 与问题审计均已通过。

## 运行门禁关闭

2026-08-16 用户在修正后的 `http://localhost:4174/` 完成人工复验并确认通过：daily 初始态只有一套
页签、五行、奖励格和按钮；活动页五行全部隐藏且页码为 `1/1`；末页、关闭/重开和原版允许的陈旧
详情边界正常；全过程 console warning/error 为零。结合 28 状态专项、P1/P2 奖励/存档回归、静态根
直接渲染和 preview 文件哈希一致性，`TASK-SLICE-186` 的运行门禁已关闭。

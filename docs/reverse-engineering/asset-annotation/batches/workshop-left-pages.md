# 炼丹炉左侧四页标注批次

- Task：`TASK-SETTINGS-167`
- 源包：`local-resources/regima/source/restored-swfs/assets/backpack1.swf`
- 根：character 119；子页：198 强化、169 合成、177 分解、152 打造。
- 结果：四个既有页面资源继续为 `ready/confirmed`；新增四份 `verified` 机器真值，闭合帧 1 显示列表、按钮态、动态 child 拓扑、原版基准和当前差异。
- 限定：本批次没有派生新的产品视觉资源；`docs/tasks/evidence/TASK-SETTINGS-167/` 中 PNG 仅为原版/现代验收证据。
- 证据：`docs/reverse-engineering/evidence/TASK-SETTINGS-167-workshop-left-pages.md`。

## TASK-SLICE-168A 接入

- 从 198 的 character 182/184 与 169 的 character 161/163 派生六个 up/over/down 运行资产；down 保持原 over character 的 `y+2` 记录。
- 六个 stable key 已进入 `full-function-ui.csv`、`AssetManifest` 与 `feature-ui-workshop` bundle；实现直接读取两份 verified manifest，不复制按钮或槽位坐标。
- P1/P2、normal/hover/pressed、动态槽、预览、拒绝和返回证据见 `docs/tasks/evidence/TASK-SLICE-168A/visual-difference.md`。

# inventory-items

- Task：`TASK-SLICE-160`
- 状态：Integrated
- 范围：431 个权威稳定身份；428 个可接入真图标，3 个已确认原版缺陷。
- 源包：`assets/EIcon1.swf`、`1_MainLoad__main1.swf`、
  `assets/MagicWeapon2.swf`、`assets/backpack1.swf`。
- 产物：`public/assets/ui/inventory/items/` 428 张 PNG；
  `public/assets/ui/inventory/native/` 22 张原生格子/按钮状态 PNG。
- 标注：`annotations/inventory-items.csv`，逐项保存 stable key、源包、
  symbol、character id、接入资格和原版缺陷处置。

选择性导出只读取 `local-resources/regima/source/restored-swfs/`，没有修改
恢复包或 `legacy-extraction`。`fmtstx/scwpqhs5/wc` 不生成替代图；其余资源
已由 `feature-ui-backpack` 首次进入时懒加载，next action 为 none。

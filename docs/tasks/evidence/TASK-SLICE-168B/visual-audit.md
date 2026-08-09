# TASK-SLICE-168B 视觉验收

- 视口：940×590；入口：存档 1 → 天庭地图 → 炼丹炉；owner：P1。
- 原版基准：`../TASK-SETTINGS-167/original-{strength,fusion,resolution,making}-940x590.png`。
- 现代截图：`modern-{strength,fusion,resolution,making}-940x590.png`。
- 点击退回截图：`modern-fusion-return-middle-940x590.png`；上方槽变空，左右槽保持原位，退回数量由事务专项验证。
- 对照：`side-by-side-{strength,fusion,resolution,making}-940x590.png`；50% 叠图：`overlay-50-{strength,fusion,resolution,making}-940x590.png`。

逐对象结论：

- 四页根使用各自 verified page-root 边界；强化、合成仅有一个原生交互按钮，不再与背景按钮形成双层重叠。
- 分解恢复目标槽、六结果槽、费用和原生分解按钮；打造恢复制作书、两材料、三宝石、产物、六字段和原生打造按钮。
- 右栏继续使用与正式/关卡内背包相同的 25 格、四分类、五页投影；动态层只写当前页数字，背景原有 `/5` 保留，因此显示为单一 `n/5`。
- 用户连续截图确认 50×50 未填满、67×66 覆盖外框而溢出、57×56 留有白色内边；最终左侧暂存物使用 63×62 投影、相对机器包围盒向左上校准 7 px，覆盖白色内沿并仅保留最外层格框。右栏仍使用正式背包 32×32 图标规格。
- 左侧已有物品再次点击时只退回对应槽；合成中间槽退回后左右材料保持原位，下一次放入优先填补中间空槽。
- 宿主安全反馈与 P1/P2 selector 是既有允许例外；未新增现代可见替代层。
- 本轮正式浏览器复核未观察到 console warning/error。

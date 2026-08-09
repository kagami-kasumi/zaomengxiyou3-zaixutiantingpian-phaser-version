# TASK-SLICE-168A 强化/合成逐状态视觉证据

验收环境：2026-08-09，内置浏览器，固定 `940×590`，正式存档 1（P1）与存档 3（P1/P2），`npm run preview`。

## 基准与差异

| 页面/状态 | 原版基准 | 现代证据 | 结论 |
| --- | --- | --- | --- |
| 强化空态 | `TASK-SETTINGS-167/original-strength-940x590.png` | `modern-strength-p1-empty-940x590.png`、`strength-original-modern-side-by-side.png`、`strength-original-modern-overlay-50.png` | 198 骨架、六槽、原字段、185 up 态与左页几何一致；空态不再写 `0%` 或页底摘要。 |
| 强化 hover/pressed/拒绝 | 185：182 up、184 over/down，down `y+2` | `modern-strength-p1-normal-940x590.png`、`modern-strength-p1-hover-940x590.png`、`modern-strength-p1-rejected-feedback-940x590.png` | 指针态直接使用原字符；拒绝文案只出现在宿主全局反馈层，页内无新增可见层。 |
| 强化 P2 暂存 | 198 动态 `ShowObj` 拓扑 | `modern-strength-p2-staged-940x590.png` | 目标装备进入 `zbmc`，费用写入 `txt_needlh`；切换 owner 会返还暂存。 |
| 合成空态 | `TASK-SETTINGS-167/original-fusion-940x590.png` | `modern-fusion-p1-empty-940x590.png`、`fusion-original-modern-side-by-side.png`、`fusion-original-modern-overlay-50.png` | 169 骨架、三材料/预览/产物槽、原字段、164 up 态一致；未触发 `previewFun` 时费用/成功率为空。 |
| 合成 P2 三材料/预览/拒绝 | 169 动态 `ShowObj` 与全局反馈 | `modern-fusion-p2-staged-940x590.png` | 三材料逐槽显示真图标，命中配方后显示预览、名称、`1000`、`100%`；灵魂不足保留暂存并只显示全局反馈。 |

## 允许差异与排除

- 119 宿主的 `P1工坊/P2工坊` selector 继续由既有 host 持有；其最终字形/几何按任务合同留给 168B 四页联合校准，不属于 198/169 子页真值。
- 右侧背包内容、页码和灵魂值是运行 fixture；其几何与资源由 165D verified 真值和共享 `InventoryGridView`/`FormalSoulBalanceView` 持有，不复制进左页。
- 字体抗锯齿和 SVG/Canvas 栅格化允许像素级差异；对象身份、bounds、层级与动态写入没有未解释缺口。
- pressed/selected 均映射到原 down 字符，不新增皮肤；自动测试锁定 184/163 down 资源及 `y+2` 生成合同。

浏览器全过程 console：零 warning/error。关闭返回天庭地图、P1/P2 owner 切换、暂存返还与重新打开均通过。

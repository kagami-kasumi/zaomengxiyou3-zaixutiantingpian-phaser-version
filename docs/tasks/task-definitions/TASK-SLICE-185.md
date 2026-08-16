# TASK-SLICE-185

任务类型：
- `TASK-SLICE`
功能条线：
- `LINE-CORE-PROGRESSION-COMPLETION`（Active；Ready）
目标机制/切片：
- `M-035`、`M-052`、`VS-059`
规模预算：
- 主工作包：2
- 预计上下文压缩：0
- 独立验收批次：2
拆分触发：
- 若需修改设置业务 owner、玩家存档 schema、新增可见层或进入 148 页面族外资源，立即拆分。
协作计划：
- 模式：单 agent
- 并行工作包：无
- 写入 owner：主 agent
- 归并检查点：不适用
- 方法观测：无
输入资料：
- `task-settings-175g-settings-page.json`、`TASK-SETTINGS-175G-settings-page.md`、`settings-ui-index.md`、现有 `FormalSettingsOverlay` 与 155C 运行证据。
输出产物：
- 148 manifest 只读投影、删除手写视觉真值、23 状态现代差异与运行回归。
UI 原生化合同：
- 显示列表清单：直接消费 175G 的 19 对象、depth/矩阵、五组 146/145、134/133 overlay、144 四态与命中区。
- 原版机器真值 JSON：truthId `task-settings-175g.settings-page`；Schema、源哈希、23 状态、完整性与 `unresolved=[]` 已 verified。
- 原版视觉基准：原版 1.1、940×590 `TASK-SETTINGS-175G/original-*-940x590.png`。
- 允许的现代视觉例外：仅已批准的独立全局跨重启持久化；不新增可见对象、不写玩家槽。
- 逐状态验收：normal/hover/pressed、四项全循环、死控件、关闭按钮、overlay 阻挡、关闭/重开/重启。
- 差异证据：同尺寸并排/50% 叠图、稳定区域边缘差异、逐对象清单与字体容差。
完成定义：
- `FormalSettingsOverlay` 直接消费 manifest 或生成投影；手写坐标/命中/按钮视觉真值删除，业务 owner 不分叉。
验收标准：
- 23 状态专项、设置 owner/持久化回归、940×590 视觉、零 console、build/workflow/标注/diff check 通过。
禁止范围：
- 不重写设置循环、声音系统、玩家存档，不把死控件改成恢复默认，不新增页面 chrome。
状态更新：
- 更新机制/VS-059、功能线覆盖台账、看板/history 与现代差异证据。
推荐后续任务：
- 按 175A..I 全部完成后的同线实现批次顺序继续。

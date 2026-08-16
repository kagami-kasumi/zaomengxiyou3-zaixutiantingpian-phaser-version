# TASK-SETTINGS-175G 设置页 148 原版真值

## 结论

`task-settings-175g.settings-page` 已达到 `verified`。恢复源 `assets/StageCommon.swf` SHA-256 为
`C6FC973D7D606CE4EA177B0AC075844C86A5EE7E493235FA812A029FBE4F29C9`。manifest 序列化
19 个 scoped 对象、23 个状态：148 根、12 个根 child、134 的全舞台命中 shape、五个 146 wrapper
各自嵌套的 145 动态字段；`unresolved=[]`。

权威入口：

- manifest：`docs/reverse-engineering/ground-truth/manifests/task-settings-175g-settings-page.json`
- 生成器：`tools/generate-settings-page-ground-truth.mjs`
- 基准生成器：`tools/generate-settings-page-baselines.ps1`
- 原版结构基准：`docs/tasks/evidence/TASK-SETTINGS-175G/original-*-940x590.png`
- 关键 JSON Pointer：`/displayObjects`、`/states`、`/completeness/expectedVisibleObjectCountByState`

## 待证明问题与答案

1. 148 的显示列表是否完整？是。生成器把同哈希恢复 SWF 的 FFDec XML 与 SVG 逐 child 核对，
   12 个根 child 的 character、instance、depth 与矩阵一致；134/133 与五组 146/145 嵌套关系也进入清单。
2. 五行是否有独立 pressed/selected？没有。五个 wrapper 只监听 roll over/out/click；pressed 保持当时
   hover 的黄色文字，selected/disabled 均不存在。144 关闭按钮单独拥有 up/over/down/hit。
3. 循环与死控件是否混淆？没有。难度 3 态、两声音各 2 态、质量 30/24/20 三态分别建 state；
   `defaultVol` 点击只 refresh/alert，仍显示时间轴“示 例”，不产生设置写入。
4. overlay/关闭/重开是否完整？是。134/133 的 940×590 命中面阻挡底图；关闭只移除 148；重开
   新实例从共享会话 owner 读回前四项，未引入 P1/P2 owner。
5. 跨重启保存是否是原版对象？不是。它是用户批准的现代行为例外，继续由独立全局存储 owner
   承担，不进入 `/displayObjects`，也不写玩家存档 schema。

## 六段证据矩阵

| 合同项 | 局部证据 | 共享调用链 | 几何/坐标证据 | 等级 | 未知/反证 | 验证 |
| --- | --- | --- | --- | --- | --- | --- |
| 148 根与五行 | `StageCommon.swf` 148；`gameSetting.refreshTxt` | `MapMenu.huodongClick` → `gc.stage` | 12 根 child、19 scoped 对象、940×590 | 交叉确认 | 源哈希或根清单漂移则失效 | 生成器 XML/SVG 双核对 + Schema |
| wrapper/字段状态 | `react` 与五个 click handler | 五个 146 共用处理器；145 写文字 | wrapper 104×34.1；txt 局部 `(2,2)`；白/黄 | 交叉确认 | 无 pressed/selected/disabled | hover/pressed/roll-out states |
| 设置循环 | 四个 `__setProp_*` 与 `refreshTxt` | `Config`、`SoundManager`、Stage.frameRate | 146 的四个原槽位 | 交叉确认 | 真音频内容不属于本页真值 | 3/2/2/3 全循环 fixtures |
| 默认音量死控件 | `__setProp_defaultVol_` | 无共享写入；仅 alert | 147 标签 + 第五个 146/145 | 交叉确认 | 若改成恢复默认须用户另批 | hover/pressed/dead-click fixture |
| 模态/关闭/重开 | `__added/__removed/xClickHandler` | 148 直接加入 stage；共享会话 owner | 134/133 全舞台 hit；144 四态 | 交叉确认 | 无 P1/P2 分支 | blocked/close/reopen states |
| 存档与现代例外 | `User.getSaveObj` 反证 | 原版非存档；现代独立 global codec | 不新增原版可见对象 | 现代设计选择 | 例外不得进入玩家槽或对象表 | 既有 155C 重启/损坏专项；185 回测 |

## 原版基准与逐状态差异合同

23 张 940×590 结构基准来自同哈希恢复 SWF 的 148 帧 1 导出。帧 1 中五个 145 是未执行构造器的
“示 例”占位，因此循环值、hover 色与提示由 manifest fixture 和 AS3 状态合同校验，不能把静态 PNG
误解为运行态文字。`closed` 基准为空透明舞台；底层地图属于 host，不是 148 child。

后续 `TASK-SLICE-185` 必须以相同舞台尺寸复核并排/50% 叠图、稳定区域边缘差异和逐对象清单：

- 对象、depth、矩阵、命中区、按钮状态和循环值零容差；
- 字体栅格化、嵌入轮廓与浏览器抗锯齿允许记录化容差；
- 不得新增现代标题、暗罩、通用按钮、P1/P2 selector 或额外存档提示；
- 唯一批准例外是独立全局跨重启持久化，且它不产生新的可见对象或第二设置 owner。

## 实现合同

`TASK-SLICE-185` 应让 `FormalSettingsOverlay` 直接消费 manifest 或只读生成投影，删除五行坐标、
命中区和按钮状态的手写视觉真值。`GlobalSettingsSystem`、声音/帧率应用、提示与独立全局持久化继续
持有既有行为；不得借迁移重写设置循环、玩家存档或死控件。

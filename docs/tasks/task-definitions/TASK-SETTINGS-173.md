# TASK-SETTINGS-173

任务类型：

- `TASK-SETTINGS`

功能条线：

- `LINE-CORE-PROGRESSION-COMPLETION`（Active；Planned，待成长/存档主链轮到本项）

目标机制/切片：

- `M-018`、`M-034`、`VS-062`

规模预算：

- 主工作包：2
- 预计上下文压缩：0
- 独立验收批次：2

拆分触发：

- 若 Role1 影分身证据涉及新的 SWF 资源族、两个以上尚未实现的技能行为，或需要同时重做英雄运行时生命周期，立即把额外动作/架构范围拆成同线下一 task。

协作计划：

- 模式：单 agent
- 并行工作包：无
- 写入 owner：主 agent
- 归并检查点：不适用
- 方法观测：无

输入资料：

- `docs/workflow/reverse-engineering-protocol.md`、Role1 战斗视觉索引、`Role1.as` 与恢复 SWF 中的 Role1/Shadow 局部。
- `TestSceneRole1ShadowVisualBridge.ts`、`HeroPartyRuntimeBridge.ts`、Role1 visual bridge 及现有专项。
- 复评确认项 M4；“400ms 应直接改成 2400ms”不作为已证事实。

输出产物：

- 冻结影分身在正式战斗中的创建、身份、owner、动作选择、朝向、触发、销毁以及与主角色技能状态的可观察合同。
- 生成适用 Schema 的 `verified` 原版机器真值 JSON，记录源 hash/locator、五个静态候选、每候选 72 tick 的时间轴语义、注册点/矩阵和 hit1/hit2 可达性；区分“候选保持时长”和“逐帧播放速度”。
- 形成 TestScene 与正式 Runtime 差异矩阵、未知/反证清单和不依赖现代架构的实现合同。

完成定义：

- 不再用单个总时长数字替代原版静态候选/动作语义，M4 的成立部分与误读部分可由证据自动复查。
- 正式接入所需的 identity、action、timing、space 与生命周期输入均闭合；证据不足项明确保持未知。
- 本 task 只交付证据，不修改正式战斗实现。

验收标准：

- 真值 manifest 通过 Schema、源哈希、locator、状态完整性与自动回测；时间轴结论由 SWF 与 AS3/运行观察交叉确认。
- `npm run check:workflow`、适用资源标注检查和 `git diff --check` 通过。

禁止范围：

- 不把五张静态候选误做成 2400ms 循环动画，不凭 TestScene 常量补成原版事实。
- 不在证据 task 中顺带接入正式 Runtime，不修改其他角色视觉。

状态更新：

- 更新本线覆盖台账、task-board、Role1 视觉索引、`M-018/M-034`、`VS-062` 与 task-history。

推荐后续任务：

- `TASK-SLICE-173A`：只按本 task 的 verified 合同把影分身接入正式 Runtime。

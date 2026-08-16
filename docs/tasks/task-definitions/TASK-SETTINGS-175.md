# TASK-SETTINGS-175

任务类型：

- `TASK-SETTINGS`

功能条线：

- `LINE-CORE-PROGRESSION-COMPLETION`（Active；Ready）

目标机制/切片：

- `M-035`、`M-052`、`VS-054`、`VS-055`、`VS-059`

规模预算：

- 主工作包：2
- 预计上下文压缩：0
- 独立验收批次：2

拆分触发：

- 若任何一页需要读取新的 SWF 资源族或进入可见实现，立即停止在该页的证据清单，按页面生成独立逆向/实现 task；本 task 不跨入批量 UI 重做。

协作计划：

- 模式：单 agent
- 并行工作包：无
- 写入 owner：主 agent
- 归并检查点：不适用
- 方法观测：无

输入资料：

- `docs/workflow/reverse-engineering-protocol.md`、`docs/workflow/review-protocol.md`、`docs/reverse-engineering/ground-truth/README.md`。
- 既有 full-function/skill/pet/magic-weapon/party/settings/shop/task/immortality 索引、视觉审计与对应正式页面。
- 复评确认项 H2、M13；区分宠物/法宝/功能 host 的可见占位与 2026-08-08 前旧任务的 manifest 迁移债务。

输出产物：

- 建立逐页状态表：`verified`、旧视觉审计但缺机器真值、明确现代占位、证据未知；立即纠正 VS-054/055/059 的越级完成措辞。
- 为宠物、法宝和功能 host 冻结显示列表/原版基准/现代例外缺口，并为其余页面登记现有证据可否机械升级为 verified manifest。
- 产出按页拆分顺序、每页 truthId/源 hash/locator/状态集/完整性要求与独立实现 task 生成条件；不在一个 task 承诺八类页面全部实现。

UI 原生化合同：

- 显示列表清单：逐页登记根/子 Symbol、depth、父子关系、注册点、矩阵、文字、按钮态、动态 child 与命中区；缺失项标未知。
- 原版机器真值 JSON：本 task 只生成可由既有一手证据完整证明的 manifest；目标路径/truthId 在逐页清单中冻结，未达 `verified` 的页面阻塞实现闭合。
- 原版视觉基准：逐页记录原 SWF/Flash 入口、版本、状态、940×590 舞台与裁切；缺失即保持待证。
- 允许的现代视觉例外：默认空；现存占位只记为待整改，除非获得用户逐项批准。
- 逐状态验收：normal/hover/pressed/selected、分页/动态内容、P1/P2、进入/返回按页面适用性登记。
- 差异证据：逐页输出可见对象差异、并排/叠图入口、坐标差异与容差理由。

完成定义：

- “业务可用/资源已接入/旧视觉审计”与“满足当前原生化门禁”不再混写，切片状态与证据等级一致。
- 每个成立缺口都有有界的页面级后续入口；没有用本 task 的目录盘点替代 UI 实现。

验收标准：

- manifest 通过 Schema、源哈希、locator、状态完整性与自动回测；未生成 manifest 的页面有明确阻塞原因。
- `npm run check:workflow`、适用标注检查与 `git diff --check` 通过。

禁止范围：

- 不批量重做八类页面，不用整页背景、业务测试或零 console 代替显示列表/逐状态证据。
- 不把旧任务缺少 2026-08-08 新格式自动解释为视觉错误；只对明确占位与证据缺口分别处置。

状态更新：

- 更新本线覆盖台账、task-board/task-history、`vertical-slices.md`、相关 UI 索引和 review 处置状态。

推荐后续任务：

- 依据逐页清单生成同线单页逆向 task；其 verified manifest 完成后再生成对应单页实现 task。

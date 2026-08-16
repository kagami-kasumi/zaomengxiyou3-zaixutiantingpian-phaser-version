# TASK-SETTINGS-175I

任务类型：
- `TASK-SETTINGS`
功能条线：
- `LINE-CORE-PROGRESSION-COMPLETION`（Active；Ready）
目标机制/切片：
- `M-005`、`M-006`、`M-050`、`M-052`、`VS-052`
规模预算：
- 主工作包：2
- 预计上下文压缩：0
- 独立验收批次：2
拆分触发：
- 若 1149/901 与既有 Common1 交叉对照外需新视觉族或进入实现，立即拆分。
协作计划：
- 模式：单 agent
- 并行工作包：无
- 写入 owner：主 agent
- 归并检查点：不适用
- 方法观测：无
输入资料：
- 协议/Schema、175 审计、`save-party-flow-index.md`；`OtherMat1.swf` SHA-256 `97478E1E03A22C7D06197FFB75AB890D98B084377CBDCF394716CBAF27082126` 的 1149/901，`Common1.swf` SHA-256 `7459555A0D76872F93BCB164079FFF496A9A68730F85FE4015EA0D2C2337CACD` 的 69/18 交叉对照。
输出产物：
- `ground-truth/manifests/task-settings-175i-party-creation.json`、证据矩阵与回测入口。
UI 原生化合同：
- 显示列表清单：人数页、主菜单隐藏对象、五角色卡、按钮/滤镜/selected、命中区、裁切与矩阵。
- 原版机器真值 JSON：truthId `task-settings-175i.party-creation`；人数 normal/hover/down、1P/2P、五卡 normal/hover/down/selected、单/双人顺序、取消/完成；完整性与 `unresolved=[]`。
- 原版视觉基准：原版 1.1、940×590，明确 1081×1067 导出裁切语义。
- 允许的现代视觉例外：空；原子建档是流程映射，不新增可见控件。
- 逐状态验收：人数/选角、P1/P2 顺序、selected、取消/完成/重载。
- 差异证据：并排/叠图、逐对象差异与裁切容差。
完成定义：
- manifest verified，流程现代选择与原版视觉分层记录。
验收标准：
- Schema/哈希/locator/完整性/回测及 workflow/标注/diff check 通过。
禁止范围：
- 不改存档 schema、建档业务或 `src/`。
状态更新：
- 更新审计、台账、机制/切片、看板/history；verified 后生成实现迁移 task。
推荐后续任务：
- 依据 175A..I manifest 和实现迁移完成度生成同线下一页实现 task；不得提前切到 Stage 2-3。

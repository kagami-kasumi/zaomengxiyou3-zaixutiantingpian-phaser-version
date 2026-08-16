# TASK-SETTINGS-175C

任务类型：
- `TASK-SETTINGS`
功能条线：
- `LINE-CORE-PROGRESSION-COMPLETION`（Active；Planned）
目标机制/切片：
- `M-016`、`M-035`、`M-052`、`VS-060`
规模预算：
- 主工作包：2
- 预计上下文压缩：0
- 独立验收批次：2
拆分触发：
- 若需超出既有 574/371/444 资源族或进入宿主实现，立即拆分。
协作计划：
- 模式：单 agent
- 并行工作包：无
- 写入 owner：主 agent
- 归并检查点：不适用
- 方法观测：无
输入资料：
- 协议/Schema、175 审计、`stage-feature-entry-index.md`；恢复源 `assets/OtherMat1.swf` SHA-256 `97478E1E03A22C7D06197FFB75AB890D98B084377CBDCF394716CBAF27082126` 的 574/371/444 与既有入口/返回证据。
输出产物：
- `ground-truth/manifests/task-settings-175c-stage-feature-host.json`、宿主显示列表/差异矩阵；冻结地图态 chrome 去留合同。
UI 原生化合同：
- 显示列表清单：574 五按钮、P2 镜像、371/444 设置/帮助、按钮态、命中区、页面打开/关闭层级。
- 原版机器真值 JSON：truthId `task-settings-175c.stage-feature-host`；五入口 normal/hover/down/hit、P1/P2、门禁、设置、单页进入/返回；完整性和 `unresolved=[]`。
- 原版视觉基准：原版 1.1、940×590、五入口/设置逐态。
- 允许的现代视觉例外：地图态统一 host chrome 未获批准，记待整改；其余为空。
- 逐状态验收：五按钮、P1/P2、允许/拒绝、页面互斥、暂停/返回。
- 差异证据：战斗态逐对象对照；地图态明确“原版无统一 chrome”的负向差异。
完成定义：
- 战斗宿主 manifest verified；地图态当前 chrome 被准确分类，不伪造原版 locator。
验收标准：
- Schema/哈希/locator/完整性/负向证据、`check:workflow`、标注、diff check 通过。
禁止范围：
- 不修改 `FeatureUiScene`，不把现代导航便利性当用户批准的可见例外。
状态更新：
- 更新审计、台账、机制/切片、看板/history；verified 后生成宿主整改 task。
推荐后续任务：
- `TASK-SETTINGS-175D`。

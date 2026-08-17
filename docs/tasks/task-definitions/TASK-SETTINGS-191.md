# TASK-SETTINGS-191

任务类型：
- `TASK-SETTINGS`

功能条线：
- `LINE-PRE-STAGE-2-3-PRESENTATION`（Active；Ready）

目标机制/切片：
- `M-016`、`M-035`、`M-042`、`M-049`、`M-052`、`VS-067`

规模预算：
- 主工作包：2
- 预计上下文压缩：0
- 独立验收批次：2

拆分触发：
- 若宠物功能页和战斗 HUD 之外还有第三个独立 UI 根/恢复源，或正式不可见包含两个以上独立根因，立即拆补证 task；本 task 不修改 `src/`。

协作计划：
- 模式：单 agent
- 并行工作包：无
- 写入 owner：主 agent
- 归并检查点：不适用
- 方法观测：无

输入资料：
- `reverse-engineering-protocol.md`、`pets-index.md`、`stage-feature-entry-index.md`、`combat-hud-index.md`、175A/175C verified manifests 与 180/182 运行证据。
- 恢复 `pet1.swf`、`StageCommon/Common1/OtherMat1` 中窄查命中的宠物页/战斗 UI Symbol，以及 `PetInterface/PetInfo/BaseHero.initPet/KeyBoardControl` 实际调用链。
- 现代 `StageFeatureEntryRouterSystem`、`FormalFeatureUiEntryBridge`、`FeatureUiScene`、`FormalPetPage*`、pet runtime/bundle/HUD 消费者。

输出产物：
- 可重现“无 UI”的正式路由矩阵，把入口、owner 选择、scene/layer 生命周期、bundle 加载、对象 visible/alpha/depth 和真值投影分层定位。
- 宠物功能页与战斗宠物 HUD/可见对象两份显示列表、verified 真值/基准或对“原版无该 HUD”的交叉反证。
- 192A/192B 的精确实现边界、允许例外、状态集与自动/运行验收入口。

UI 原生化合同：
- 显示列表清单：分别列出页面根/动态列表/头像/技能/tooltip/确认层与战斗 HUD 的 Symbol、depth、矩阵、字段、动态 child/hit area。
- 原版机器真值 JSON：复核 175A/175C 是否足以支撑正式路由；对战斗 HUD 新增独立 truthId/Schema/源 hash/locator/状态集和 verified 完整性。
- 原版视觉基准：页面与战斗态分别记录版本、入口、owner、舞台 940×590 和裁切。
- 允许的现代视觉例外：只允许证据明确显示原版无对应战斗 HUD 时，将最小现代可见性需求列为“待用户批准”；未批准前不进实现。
- 逐状态验收：正式入口、P1/P2、无宠物/有宠物、selected、分页、出战/休息/技能 hover/释放确认、关闭/返回/重开，战斗中生成/受击/死亡/休息。
- 差异证据：逐根并排/叠图/边缘差异与可见对象差异清单；路由不可见还需 scene graph/depth 证据。

完成定义：
- 用证据定位用户未看到宠物 UI 的精确根因，页面与战斗 UI 实现输入无影响闭合的未知；不用 180 测试通过否定用户正式路径反证。

验收标准：
- 恢复 SWF/显示列表、AS3 调用链、现代正式路由三方交叉；manifest Schema/完整性/`unresolved=[]`、annotations、workflow 和 diff check 通过。

禁止范围：
- 不实现宠物动画，不修 pet 数值/技能/存档 owner，不修改 legacy extraction 或使用现代页截图反充原版基准。

状态更新：
- 更新 `pets-index.md`、功能入口/HUD 索引、`mechanics-index.md`、`vertical-slices.md`、本线台账、task-board/history 与适用 PG 反馈。

推荐后续任务：
- `TASK-SLICE-192A`

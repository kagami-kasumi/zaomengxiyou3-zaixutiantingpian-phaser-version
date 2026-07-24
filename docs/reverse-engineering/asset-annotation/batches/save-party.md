# 标注批次：save-party

## 范围

- 资源族：新建存档人数页、五角色页、五卡 up/over/down 与 P1/P2 marker。
- 影响：`TASK-SETTINGS-065`、`TASK-SLICE-151`、`VS-052`。
- 排除：六槽主体、删除确认、开场动画、技能页、地图与正式关卡消费者。

## 输入和证据

- 权威合同：`save-party-flow-index.md`。
- 恢复源包：`local-resources/regima/source/restored-swfs/assets/OtherMat1.swf`。
- 既有选择性派生：`local-resources/regima/task-outputs/task-settings-065-save-party/`。
- 现代资源：`public/assets/ui/save-party/`。
- 人工证据：无；根图、人数逐态、五卡逐态和 marker 已逐张目检。

## Agent 调查结论

- 人数页与角色页属于同一个 `OtherMat1.swf` 资源族，不触发拆分。
- character 1149 的 `showSelectNum()` 等价状态由原 SVG 内 1111/1115/1136 与其原生按钮帧机械派生；没有现代文字或矩形可见替代层。
- character 901 按证据裁出 940×590 舞台；877/883/888/894/900 的 up/over/down 与 115/108 marker 保持原注册点语义。
- character 895 是空按钮，未进入现代 manifest。
- 对应标注表：`../annotations/save-party.csv`。

## 去向

- 25 条资源全部注册为 `ready + none`，由 `SavePartyCreationView` 直接消费。
- 无待消歧、缺源、占位或拆分评估项。

## 关闭检查

- [x] 每条记录有唯一 stableKey、精确源包、symbol id、状态和去向。
- [x] 恢复 SWF 是视觉存在性的最终依据，legacy extraction 未被修改。
- [x] 人数与角色逐态均直接使用原生派生物。
- [x] 正式选择主体没有现代可见标题、标签、边框、确认或取消控件。
- [x] 940×590 正式流程逐状态、取消、确认、重载与零 console warning/error 已回写到 `docs/tasks/evidence/TASK-SLICE-151-visual-audit.md`。

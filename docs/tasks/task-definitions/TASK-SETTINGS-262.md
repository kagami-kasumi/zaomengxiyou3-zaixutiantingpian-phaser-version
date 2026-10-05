# TASK-SETTINGS-262

任务类型：`TASK-SETTINGS`

任务模型：`逆向任务`

逆向子类型：`代码逆向`

逆向方案：不适用；沿用 `docs/workflow/reverse-engineering-protocol.md`。

功能条线：`LINE-PRE-STAGE-2-3-PRESENTATION`（Active）

目标机制/切片：`M-030`、`M-034`、`M-042`、`VS-067`

要解决的问题：232的BA-08仅静态映射12类怪物，Monster30、Monster3、Monster2已有各自有限生产闭环；Monster4仍使用通用activeAttack，且原doHi2_1存在setDisable纯视觉分支。必须先核定其身体、自然选择、全部攻击producer及生命周期，不能从已有图片或其他怪物实现推定伤害。

规模预算：
- 主工作包：1（单一Monster4行为资料族与独立有限源回放）
- 预计上下文压缩：0
- 独立验收批次：1（身体/自然选择/攻击/生命周期联合源证据）

拆分触发：
- 出现本Monster4局部及已知共享BaseMonster/BaseBullet/BBDC/PhysicsWorld之外的新公共机制或资料族，先界定独立输入；不把视觉/碰撞全集、真实接收和现代实现合并进本项。
- 有源调用尚未闭合时保留未知并补齐当前行为链，不能删去专属攻击或以Monster2/3默认规则替代。

协作计划：
- 模式：主agent + 有界subagent。
- 模型分工：主agent处理证据裁决与源回放边界；Luna负责独立locator/消费者清单和重复验证。
- 并行工作包：原Monster4专属producer与当前正式消费者对应关系，只读返回。
- 写入 owner：主agent；可明确委派不重叠的测试工具文件。
- 归并检查点：冻结有限fixture输入及最终证据分级前。
- 方法观测：无。

输入资料：
- `docs/reverse-engineering/monster-body-attack-lifecycle-contract.md`的BA-08与232 source-caller-map，仅复用已证共享顺序。
- `docs/reverse-engineering/monster2-runtime-acceptance.md`作为已完成相邻消费者边界，不作为Monster4原版事实。
- `local-resources/regima/legacy-extraction/README_extract.md`；只读`resources_by_swf/[172845].swf/scripts/export/monster/Monster4.as`及其实际调用到的局部/共享方法。
- 原生MovieClip/时间轴如为相位结论必需，优先窄查`local-resources/regima/source/restored-swfs/assets/1.swf`；沿用现有AIR工具，不安装复杂软件。
- 当前Stage12Layout、Stage12MonsterVisualSystem/Bridge、Stage1CombatSystem和MonsterRuntimeRegistry的type4局部消费者。

输出产物：`docs/reverse-engineering/monster4-body-attack-contract.md`、有源hash/locator/有限域的`reference/monster4-body-attack-contract.json`、独立源执行/验证工具及本地`docs/tasks/evidence/TASK-SETTINGS-262/`原始报告；生成下一同线空间/接收或实现任务所需的明确输入边界。

完成定义：Monster4从原身体回调到每个攻击/纯视觉对象、真实注册/检测/结束路径、自然选择及源死亡/destroy的六段证据链闭合；独立有限源回放与编译行为反证可以重现。输出明确区分行为根运算、原生时序、未证像素/真实HP/完整关卡，不修改现代游戏。

验收标准：
- 枚举全部身体动作/持帧/enter-exit回调和自然AI/CD/随机/转向条件；20/24/30fps与边界输入独立对账，不由expected反推fixture。
- 每个producer明确伤害对象还是禁用接收的纯视觉；登记数组、初次/末次检测、间隔/max/ID、power/攻击类别/根复制及跟随关系可追溯。setDisable分支不能生成假伤害。
- 受伤、冰冻首尾、同帧火伤、HP死亡、dead动作完成、显式destroy、普通暂停/低层暂停、退出与幂等清理覆盖适用分支；源死亡和对象销毁不混同。
- P1/P2目标枚举与真实消费者完整列明；HP和像素若仍是受控服务，明确标为后续输入，不冒充正式联合通过。
- 至少保留身体/效果反序、纯视觉误伤害、相位/漏producer、HP死过早清理或destroy遗漏等适用生产源变异；所有计数必须编译后由行为拒绝，正常重复一致，源hash与报告绑定。
- `check:workflow`、`audit:problems`及相关源验证通过；不因schema/hash通过代替行为证据。

禁止范围：不修改src/public，不逆向其他怪物全技能，不扩完整宠物家族、角色人偶、装备/复活、全部UI或关卡流程；不改原提取结果，不扩大原视觉/碰撞许可，不关闭204/all、194、VS-067或Active功能线。

状态更新：Ready（260B及父260完成后接续同线BA-08的Monster4未覆盖责任）。

推荐后续任务：依据本项结果生成同线Monster4空间/显示/碰撞或接收输入任务；所需原版输入齐备后才生成有界实现。不在本次请求执行下一项。

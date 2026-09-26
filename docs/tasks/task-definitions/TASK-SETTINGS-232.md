# TASK-SETTINGS-232

任务类型：`TASK-SETTINGS`

任务模型：`逆向任务`

逆向子类型：`代码逆向`

逆向方案：不适用。

功能条线：`LINE-PRE-STAGE-2-3-PRESENTATION`（Active；本任务 Planned）

目标机制/切片：`M-030`、`M-032`、`M-042`、`VS-067`

要解决的问题：226火焰致死检查发现公共怪物身体、效果与攻击对象的顺序缺口。实际Monster30与Stage11动画consumer在20/24/30 fps下先执行致死火焰再推进身体，丢失已准备的hit1显示回调；伤害consumer又依赖死亡时立即清空的activeAttack。原BaseObject先身体再效果，Monster30帧回调创建独立SpecialEffectBullet；仅提前绘图不能证明攻击正确。

范围：核定Monster30代表的身体回调→独立攻击创建→目标效果→死亡/移除顺序及正式五关同类消费者映射。明确原弹体在源死亡、销毁、受伤、冰冻与世界暂停时的保留/清理边界；不假定所有怪物完全相同，不扩大为全部怪物技能重做。

规模预算：
- 主工作包：1
- 预计上下文压缩：0
- 独立验收批次：1

拆分触发：
- 若需新视觉资源全集或声明外怪物的专属行为资料，保留未知并另列有界任务；本项只交付公共顺序与独立攻击生命周期合同，再生成最小消费实现任务。

输入资料：
- `tools/pet-target-body-order-preflight.ts`与本地`docs/tasks/evidence/TASK-SLICE-226/target-body-order-preflight.json`；这是受控现代诊断，不是源动态或正式Scene验收。
- 原`BaseObject.step`、`BaseBitmapDataClip.step`、`BaseMonster.reduceHp/beMagicAttack/destroy`、`export/monster/Monster30.enterFrameFunc/doHi1`及`SpecialEffectBullet`真实调用者。
- `Monster30System.ts`、`Stage11MonsterVisualSystem.ts`、`TestSceneCombatBridge.ts`、`TestSceneWorldBridge.ts`、`MonsterRuntimeRegistrySystem.ts`与五关既有视觉/伤害consumer。

输出产物：
- 六段证据链及原版独立动态样本，记录身体回调、弹体对象身份、出生位置、首次命中、源死亡/销毁与弹体结束的先后。
- 正式五关消费者矩阵，区分显示事件、伤害对象和目标效果；不得把可见攻击图等同可伤害弹体。
- 根据原版合同生成同线公共消费实现任务；明确226仍待回填的组合验收。

完成定义：原版公共顺序与独立攻击生命周期可复验，现代反例及后续修复边界明确；不以补证完成宣称猴马或怪物复现完成。

验收标准：
- 对比20/24/30 fps、同帧致死与非致死火焰、冰冻首尾、源直接死亡/销毁及暂停，区分实际源记录与推断。
- 独立expected拒绝“效果先于身体”“死亡后补一个纯显示事件”“源死亡立即删除所有攻击”“每次绘图重复发射”；源分支不同则分别保留。
- 实际伤害消费者必须在后续实现合同中有独立验证，不只检查事件数量；不凭当前现代动画比较路径充当原AIR真值。
- `npm run check:workflow`、`npm run audit:problems`与相应源证据校验通过。

禁止范围：不修改原始提取结果，不重新设计宠物系统，不把公共怪物攻击职责搬进宠物Behavior或Phaser视图，不凭本任务登记删除226原84合同。

状态更新：Planned，当前唯一Ready为TASK-SETTINGS-230；226本地整改已归档，本项公共机制尚未修复，须继续核销原84承接矩阵中的相关责任。

推荐后续任务：依据结果生成同线公共怪物攻击顺序/生命周期实现task，随后回填猴马目标效果组合验收。

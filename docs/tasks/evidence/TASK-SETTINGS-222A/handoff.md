# TASK-SETTINGS-222A 视觉交接

2026-09-15：13符号视觉范围完成并晋升 `verified`，视觉 unresolved 为零。父222保持 Split，下一项222B承接碰撞与父合同联合核销；玄龟现代实现、TASK-ARCH-204、VS-067未完成。

## 可消费产物

- 真值：`docs/reverse-engineering/ground-truth/manifests/task-settings-222a-pet-turtle-visual.json`，11,572状态、20,215显示对象、1,389份被引用基准。全部原生图像及遮罩变异见 `native-corpus.json`，共1,450张SHA去重PNG、88,810,318字节。
- `expected-visual-states.json` 从源行/cell与冻结的 `task-contract.md` 独立生成期望集合；372本体投影、2,440效果投影、5,856动态状态、2,904 buff状态全部对应。
- `contract-visual-consumer-matrix.json` 保留221全部32合同、视觉关系、222B碰撞责任及未来正式消费者。derived-only行为决策引用已有动作视觉；例如 aoyi.hurt 未声称单独执行过原生奥义受伤fixture。
- `acceptance.json` 保存重复生成一致性、13项冻结输入SHA与晋升前报告SHA；`manifest-verification.json` 保存最终manifest SHA、193源码方法指纹、状态/显示列表及变异验收。
- 原始二进制与AS3未修改；`source-definitions.json`、`symbol-script-audit.json`、`body-methods.json`、`dynamic-source-methods.json`、`owner-verification.json` 提供源→caller→原生记录→规范化字段的追溯。

## 时间、几何与运行边界

- 原生采样为24fps、940×590、双owner与双方向；20/30fps预算仅为源码公式推导。受控支架调用已记录的原AS3方法，不等同完整游戏运行；碰撞、共享英雄/HUD/伤害数字不在本批13符号视觉范围。
- BBDC原方法702步；四本体93cell及持帧/回调顺序覆盖。源构造向右、永久father buff、保护倒计时与buff step顺序均保留。
- 新建实例出生及首个EXIT_FRAME保持frame1；已加载reset后的free-play首个EXIT_FRAME进入frame2。对齐公式 `max(0, hostTick-birthTick-1)` 后2,916条递归时钟签名一致。18帧根/30帧child独立推进，不按根帧去重。
- registration `(0,0)` 表示Flash符号坐标原点，不是导出像素左上角。parentBounds为local AABB经仿射矩阵映射的包围盒；stageBounds、原始crop、alpha像素分别存证，不能混用。
- SWF clipDepth遮罩可在原生 `DisplayObject.mask` 为null时生效。原包与FFDec往返control像素一致；去遮罩变异在192原生状态中被拒绝。filter、颜色变换、递归child、矩阵、source/owner/state/timing/scale及注册点均有独立校验或变异证据。
- SYBH scale2超出舞台，另保留未裁切RGBA；222B不能把舞台截图作为完整碰撞输入。SLD本体turn与根矩阵flip分别采样；follow、hurt不断、双方buff首次出现/刷新/到期/无重复均已核对。
- 双owner奥义8已学组合及rest/dead/destroy已采样。alive-destroy后2/4秒各发生原版1009（共4次），保留缺陷事实；未来现代实现不要求复制崩溃。BaseAddEffect.destroy未主动清buff/glow的残留与父容器fade按源保留。

## 重放与差异合同

有已保存语料时，在项目根执行 `python tools/turtle-visual/manifest.py --verified`，再执行 `python tools/turtle-visual/verify_manifest.py`、`python tools/turtle-visual/pack.py --check`。`--verified`要求acceptance中全部输入SHA一致。默认manifest命令生成draft；修改冻结输入后必须重新运行各独立检查、draft verifier和accept，再晋升，不能直接改status。

原生重采入口为 `run_body.py`、`run_effects.py`、`run_owner.py`、`prepare_dynamic.py`、`run_dynamic.py`及其 `--buff` 模式；源码准备及具体依赖见同目录工具与各报告provenance。使用已安装FFDec与AIR SDK，原始中间物在忽略目录。

现代视觉例外为 `[]`。未来消费者必须按同owner/form/action/host tick逐状态对比完整递归显示列表和原版PNG，保留独立child相位；本批无现代输出，现代逐态差异待实现task执行。碰撞真值不得由视觉通过推定。

`manifest-verification.json` 的历史状态名 `passed-draft-normalization` 表示同一规范化检查器通过；是否已晋升以manifest status、acceptance和该报告核对的最终SHA为准。各局部报告的remaining描述其单项边界，汇总完成状态以本交接与最终门禁为准。

## 项目门禁

专项与Schema、重复生成已通过。项目workflow、annotations、problem audit及diff检查结果见 `closure-checks.json`；structure为0错误、9项无关既有warning。未修改src/public或原始提取，不运行现代玩法build冒充视觉验收。

# TASK-SETTINGS-221 交接

本批交付玄龟四形态代码行为证据。权威解释见 [家族索引](../../../reverse-engineering/pet-turtle-family-index.md)，32个有限合同见 [behavior-contract.json](behavior-contract.json)，分项执行边界见 [coverage.json](coverage.json)。尚未实现玄龟正式Runtime，也未生成视觉verified真值。

## 关键结果

- 四类均直接继承BasePet；范围40/120/150/150；最终attackRate=.7；AI技能1→2→3→4优先。四阶SLD改physics，SYBH scale2及hostFps×.25重复间隔。
- getPetHarmObj.first统一乘1.05，四阶另乘魔花。SLD创建效果立即自疗；双buff时二三四阶直接同步hero HP。名称“盾”不能推导吸收盾。
- 奥义MP>=30门禁但不扣MP，8种已学组合、0/2/4秒免费链、5秒停止。仍受伤，只压制hurt/反击/击退。活宠destroy后延迟回调1009是原版缺陷；现代须取消自身回调，作为明确现代生命周期选择。
- 同心伤害101为hero95/pet6；治疗101为双方106；0、1、19/20/21、99/100/101、致死、单边/双边buff、P1/P2均在源AS3数值运行中验证。盾/保护先后复用215/216B1证据，不外推完整盾能力。
- TestScene已有旧技能/转嫁/反击桥；正式五关共享Runtime未注册turtle，Stage1转嫁未接。QLFJ原版从宠物reduceHp触发，不能用旧TestScene主人受伤触发替代。

## 验证与证据分级

- 259家族状态、144双向结算状态、108共享缓存/去重/防御状态，共511。原版自带AIR `WIN 51,1,1,5`运行源码切片；现代TS未参与expected。支架提供固定属性/技能输入、动画cell/countdown、RNG、回调时钟、buff容器和碰撞接受值；不是完整原版场景或像素命中实测。
- 全部三份trace验证原始路径、文件SHA和sliceSHA。32合同独立ID集合与source/case/现代文件检查；29项含受控源执行，entry.forms/ai.follow/lifecycle.replace三项是静态源码调用链，不伪称已执行。确认事实只指AS3可定位事实，所有modernExecution均未完成。
- 12类源代码语义变异覆盖range/owner/timing/MP/门禁/免费链/延迟/死亡回调/反击/hurt/魔花/CD；不声称每个诊断字段或所有32合同的全排列均被mutation覆盖。正常输出不被负运行覆盖。
- 恢复双包定位13个必需符号，来源见visual-inputs；没有使用旧提取判断资源缺失，没有视觉verified或原版基准完成声明。
- 独立只读复核发现的三trace指纹缺口、合同映射缺口已修复，并新增伤害缓存、目标优先、学习/MP边界与链接自疗样本。复核提出的三四阶普攻对象疑问经原始doHit1核实确实复用PetTurtle2Bullet1；“确认事实等于现代已实现”的解释未采用，改由coverage明确分层。

复验：

```text
python tools/turtle-source/run.py
python tools/turtle-source/run.py --settlement
python tools/turtle-source/run.py --hit
python tools/turtle-source/verify.py
python tools/turtle-source/mutations.py
python tools/turtle-source/generate.py --check
python tools/turtle-source/coverage.py
python tools/turtle-source/visual_inputs.py --check
npm run check:workflow
npm run check:annotations
npm run audit:problems
git diff --check
```

三个AIR批次顺序执行，避免相同application id启动转发；某次并行运行曾收到“invocation forwarded to primary instance”，该失败不计样本，已串行重跑。仅支架输出在`local-resources/regima/task-outputs/TASK-SETTINGS-221/air/`，可重建；无需提交这些本地编译物。原始提取不变，未改src。

最终结果：上述专项、Schema/再生成、coverage、workflow（含16个harness测试和level architecture）、annotations、audit:problems、diff检查均通过。check:structure无error，保留9项既有warning；workflow保留既有PlayerSlot别名warning。本批无生产变更，未运行build/全系统/现代浏览器旅程，不把它们列为已通过。PG-004/017本增量审计通过，其他5项无生产触发，长期关闭条件不齐，均未归档。

## 接续合同

下一项222：13对象全部行/帧/持帧、owner优先、递归显示列表、mask/filter、双方向/双owner、动态TXLJ/SLD/奥义8组合、碰撞源与独立像素oracle。现有219的青龙近似许可不可沿用。

222之后先按预算准备资源，再生成正式实现：单slot单PetCombatRuntime，完整普攻远→近追击、真实动画→效果→collision→hit→HP、全部技能/整数显示/同心/反击、P1/P2来源与destroy/rest/retry/return/reload。旧入口迁移矩阵必须清零；32合同和222视觉合同联合核销才关闭玄龟。TASK-ARCH-204、VS-067及当前功能线仍未关闭。

本批建议commit；未执行Git提交或上传。下一任务改为视觉资料族，建议新开对话承接222。

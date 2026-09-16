# TASK-SETTINGS-222 规模预检与交接

2026-09-15：222 标为 Split；222A 唯一 Ready，222B Planned。玄龟完整视觉/碰撞证据尚未完成，不生成现代资源或实现任务。

## 可复查证据

- [source-preflight.json](source-preflight.json) 从恢复 pet1/StageCommon 二进制重新读取13个已定位符号，核对221源SHA；记录sprite帧数和放置引用。复验：`python tools/turtle-source/visual_preflight.py --check`。它只是范围证据，不是当前帧递归显示列表或verified真值。
- pet1 character 534（PetTurtle3Bullet3）根18帧，子533为18帧、孙532为30帧；character 504（PetTurtle1Bullet2）根30帧，内部498为20帧、503为15帧。原生播放是否重置、复用child及各时刻真实帧仍须运行核对，不能由帧数直接宣称循环周期。
- 221 `behavior-contract.json` 的 `sybh.effects` / `aoyi.damage-window`，以及原AS3 `PetTurtle4.doHit3/doHit3InAoyi` 明确effect scaleX/scaleY=2；奥义关闭末帧销毁并以hostFps×5销毁。SLD还需FollowBaseObjectBullet逐tick的owner移动、转向及hurt不断。
- `tools/air-collision/Dragon23Probe.as` capture按symbol/currentFrame去重并在根末帧stop；sample将effect矩阵固定为sign/1。targetIndex对应的scale不是effect scale。独立P1/P2根fixture也不是follow轨迹。
- `tools/air-collision/Dragon4FieldsProbe.as` 固定读取第一个child的第一个child作为mask，15帧后退出；`tools/verify-dragon4-sampling.py` 固定(frame-1)%15、方向与单位缩放场。219 sampler只处理单bitmap fill，没有完整动态host-tick/scale2输入合同。因此不能只换symbol和帧数继承其正确性；219的批准像素近似不外推。

## 范围裁决

普通symbol/路径参数替换本身不构成拆分理由。本批实质新增的是：以host tick和递归当前帧为身份的原生动态组合采样，以及scale2/嵌套相位碰撞场的独立验证；二者尚无玄龟适用证据。原222将完整视觉和碰撞各计一包，未计入这一采样能力研发，触发其显式拆分条款及agent-protocol执行前超限规则。

- 222A：全部13对象视觉输入，完整本体逐cell与效果逐帧，再完成TXLJ/SLD/奥义动态组合和原生host-tick采样；两包/两验收。只晋升视觉范围，不宣布碰撞verified。
- 222B：四攻击scale1/2、相位与跟随轨迹的原生HitTest oracle及独立采样验证；两包/两验收；最后联合核销父222全部范围及221的32合同交接映射。
- 父222原全文保留。222B通过之前，不得生成无阻塞的玄龟资源准备/正式实现任务，不提升TASK-ARCH-204、VS-067或家族完成度。

## 独立复核

Luna只读核对221合同/coverage与219/220工具，主agent唯一写入。采用其effect scale与target scale区分、静态根fixture不能证明follow的结论；未把四个攻击对象误称为四种普攻（分别为两种普攻、SLD、SYBH）。主agent另以恢复二进制确认18/30嵌套时钟，未推断原生child生命周期。

## 验证与剩余工作

源预检生成/重复检查通过；structure为0 errors、9项既有warning。check:workflow（含16项harness测试及关卡架构）、check:annotations、audit:problems、git diff --check最终通过；workflow保留既有PlayerSlot别名warning。首次workflow指出父Split预算应为0、协议需精确路径及文件换行问题，已修正后重跑通过。未改src、现代资源、已有真值或原始提取；未执行build、游戏浏览器或原生像素采样，不声称这些通过。

下一执行项为222A。保留该预检JSON及脚本供A/B直接复验；没有新增大批可清理图片或本地编译物。此处是规模重排交接，不是222完成归档。

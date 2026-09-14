# 215 验证记录

## 范围与独立性

- 原视觉源：恢复 `assets/OtherMat1.swf`，仅 `pnum0..9`；二进制解析 SymbolClass 与 DefineBitsLossless2，不用现代资源目录决定预期对象集。
- 原显示执行：原 ANumber、CureHpQueue、ANumberManager、Greensock 文件原样复制到隔离构建目录；Config和AUtils只适配外部服务/资源查找。使用原版随包 AIR 51.1.1.5，940×590、24fps、透明未裁切舞台。
- 109个原生渲染状态：53个直接数字/队列/销毁/数值边界状态，另56个为28组已证行为的最终显示值在P1/P2锚点上的原ANumber重放。后56态的metadata明确 `sourceBehaviorExecuted=false`，不能当成盾、网络或持续伤害源码已执行的证明。
- 34组源行为正负fixture的数值、owner与入口由精确AS3片段提供；integer敏感的玄龟与Role3显示运算另执行原片段验证。源码断言只用于锁定来源，不代替独立数值执行或后续216现代黑盒trace。
- `behavior-native/measurement.json`另有22组真正的原数值/producer片段执行结果：21组对应已冻结fixture，另1组补充远端宠物reduce不显示。编译16个源片段，覆盖HP setter clamp、Hero/Pet扣血到显示前缀、盾残余递归、玄龟、Role3显示、Pig8与完整远端refresh方法。外部Config/player/场景是固定服务fixture；ANumber只是参数捕获sink，其实际渲染由独立native显示probe覆盖。死亡/复活后续动作、上游碰撞/效果调度与网络传输不冒称在此执行。

## 显示对象差异清单

| 对象/维度 | 原版验证结果 | 216消费要求 |
| --- | --- | --- |
| pnum0..9 | 十个Symbol身份、character、30×30 bitmap与原ARGB像素匹配；alpha逐像素相同，预乘RGB反解误差≤1 | 复用原bitmap；禁用系统字体、hurtnum、bnum |
| ANumber根 | 原native状态与独立缓动公式、创建/销毁/队列输入一致 | 逐时间点复验root matrix、alpha、生命周期 |
| 数字child | digit身份由BitmapData.compare反查；depth/位距/局部与stage bounds逐项比对 | 依父子矩阵组合投影；不能只比整图外框 |
| mask/filter/blend | 无mask、无filter、normal；Bitmap smoothing=false、pixelSnapping=auto | 不增加现代描边/滤镜或额外皮肤 |
| owner/kind | 同字形规则，fixture目标根分别注入；数字不会跟随人物翻转 | 校验P1/P2目标所有权及摄像机变换 |
| queue | 第一次step显示，隔2tick继续；>5的五路偏移；12项未被截掉；stage98拒绝入队 | 当前无addHpLose caller，不把直接producer改为队列 |
| 零值/负值/销毁 | 直接0仍是1glyph；-12原生转换为012；1.25秒离开父容器 | 输入合法性与显示规则分层；明确退出清理 |
| 现代差异 | 未执行现代复现，本批无src或生产资源修改 | 216必须补正式运行并排/叠图及每producer trace |

## 检查结果

`python tools/generate-incoming-number-truth.py --check --self-test`：源哈希、原生状态集合、递归显示列表、字形像素、原生图片尺寸/哈希、Schema、再次生成一致、10项结构/数值/资源/状态变异拒绝通过。变异采用可解析但错误的位距、锚点、scale、delay、duration、队列tick、character及删除fixture/object/state，不能只靠文件存在性通过。

`npm run check:annotations`、`npm run check:workflow`、`git diff --check`通过。工作流已有 `PlayerSlot` 命名warning；本任务没有修改该领域代码。`check:structure`无error，9个既有warning均为未修改文件。`audit:problems`扫描7个活跃合同，实际命中PG-004/017；集中判定见 `docs/workflow/problem-audit.md`。

基准图片与原生measurement保留为216输入；SDK编译副本只保存在Git忽略的local-resources任务目录。未运行build或现代系统测试，本任务不以这些命令证明原版真值。

收尾已核定可再生编译副本为 `local-resources/regima/task-outputs/task-settings-215/air`（161文件）和 `air-behavior`（15文件），后续checker不依赖它们。自动审批拒绝了临时目录删除操作，仅返回“blocked by policy”，因此未继续删除，副本仍保留在Git忽略目录。原始语料和216所需native基准未动。

同一生成检查命令还独立比对22组数值/producer实测与冻结输入预期，并拒绝6项实测字段变异：显示值、重复次数、目标锚点/owner、致死HP夹紧、盾残余值、玄龟分配值。`python tools/run-incoming-behavior-probe.py`可重建源片段并在原AIR执行。最初子agent返回的单纯字形探针未被采纳为行为证据，主agent替换为此批实际数值执行后才通过；未将缺失的角色对象图当成已验证。

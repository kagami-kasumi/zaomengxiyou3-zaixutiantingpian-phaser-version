# TASK-SETTINGS-222B 当前证据与交接

状态：222B与父222证据任务已完成并归档。完整 family manifest 已verified，223资源准备为唯一Ready，224A/B/C为Planned。玄龟现代复现、204及VS-067尚未完成。

## 已验证范围

- 静态完整递归相位：94,656 案例、464 fields、488 原生树记录。两种普攻、SLD、SYBH scale 1/2，双方向、P1/P2、三个已核定原版目标、边缘及子像素 placement；命中布尔全部一致。
- 静态采样剩余 20 案例、70 像素差异仅按 `sampling-approval.json` 与 `sampling-exception.md` 中用户批准的精确列表接受。`residual-cases.json` 保留批准前冻结的原始差异；其历史 status 不代表批准未生效。无全局像素容差，原版像素不被改写。
- 绘制后观察：31,344 案例、109,371,992 像素全部一致。
- 原版 step/step2 调用链的 checkAttack 入口观察：31,704 案例、110,725,560 像素全部一致。5,856 caller 状态与 222A 原生观测逐项一致；2,954 个 step 输入用于独立枚举应有/不应有的碰撞调用。
- 原版命中注册代码受控回放：三个目标 × 四个 placement 共 840 序列、31,704 callback、1,194 次接受命中。每个序列是独立单目标回放，不能外推为完整游戏多目标调度。
- 八类采样变异与八类批准白名单变异均被拒绝；覆盖验证另含六类 fixture/相位变异。

## 证据边界

原生运行环境为原游戏 WIN 51,1,1,5、24fps、HIGH。观察器插入 222A 有界 source-method harness 中原本为空的 checkAttack stub；图形判定实际运行未改写的原版 HitTest。命中注册另运行源切片；伤害与结算仍消费 221 独立行为证据。这里不声称运行了完整旧版游戏或现代 Runtime。

TTL 到期、disabled buff 与清理状态必须按源调用顺序解释：没有攻击调用的状态不应生成碰撞正例。复核结果须在父合同联合矩阵中给出 N/A 原因，不以碰撞数代替生命周期证明。222A 的视觉真值、显示列表、逐态基准及未裁切 RGBA 原样保留。

## 重放入口

工具位于 `tools/turtle-collision/`。原始 expanded 输入位于 Git 忽略的 `local-resources/regima/task-outputs/TASK-SETTINGS-222B/`。原版 source 与 restored SWF 只读。

```text
python tools/turtle-collision/run.py --full
python tools/turtle-collision/coverage.py
python tools/turtle-collision/verify.py --full
python tools/turtle-collision/run_dynamic.py
python tools/turtle-collision/verify_dynamic.py
python tools/turtle-collision/run_dynamic.py --call-site
python tools/turtle-collision/verify_dynamic.py --call-site
python tools/turtle-collision/registry.py
python tools/turtle-collision/mutations.py
python tools/turtle-collision/approval_mutations.py
```

`native-corpus.zip` 是内容寻址的原生基准归档；`pack.py --check` 校验 blob，`--restore` 只恢复缺失且路径受限的文件。2026-09-17 已纳入最新 call-site 与 registry：160,572 个逻辑文件、6,649 个独立 blob、18,017,750 字节；归档哈希和所有 blob 校验通过。不删除 expanded 基准。

`docs/reverse-engineering/ground-truth/manifests/task-settings-222-pet-turtle-family.json` 已嵌入完整222A视觉文档、221行为合同、本批碰撞fields/递归时钟以及218目标合同/12怪物映射。`contract-family-consumer-matrix.json` 保留全部32合同及未来消费者。`verify_family.py` 对照原输入、Schema与13类变异；`family-acceptance.json`记录重复组装一致与正式manifest哈希。临时整族草稿已移除，原生基准保留。

## 接续与边界

223只准备完整资源；224A负责公共入口/普攻/SLD/TXLJ，224B负责SYBH/奥义/受伤结算，224C负责全32合同与正式五关/P1-P2生命周期联合验收。对应定义已登记，设计仍实施中。所有现代消费者保持pending；本批没有修改src或现代atlas，没有执行未来设计gate或宣布其通过。

补充重放：`python tools/turtle-collision/inventory.py`核对151,474个必需源相位/目标相位/oracle文件；`python tools/turtle-collision/family.py --promote`重复组装并运行最终核销，`python tools/turtle-collision/verify_family.py`独立复验正式manifest。所有输出状态受精确有限fixture约束，不外推到任意Flash几何。

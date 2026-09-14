# TASK-SETTINGS-219 → TASK-SLICE-214D

219 完成原版空间输入补证；214D 可恢复实现。原版显示事实已验证，碰撞算法使用用户于 2026-09-13 明确批准的近似，不宣称复现 AIR 的每个光栅像素。二三阶战斗链和 P1GD 尚未实现/通过。

## 直接消费

- `docs/reverse-engineering/ground-truth/manifests/task-settings-219-dragon23-effect-collision.json`：verified 源显示事实，四对象76帧、152左右状态、414个状态内显示对象、152张原版940×590基准。
- `collision-contract.json`：逐帧原版 bounds、blank、左右 field id、214A PNG/crop/注册点映射、218目标合同引用、P1/P2根与生命周期顺序。
- `runtime-mask-pack.json`：54个方向场、16个四分之一像素相位引用/场、505个去重平面；span 是一维 row-major 位图中的 `[start,length]` 对。首次使用时解码并缓存，不要每tick重新解码，也不要再从首帧生产PNG读取碰撞alpha。
- `approved-approximation.json`、`approved-buffer-differences.json`：用户原话“允许记录近似后实现”及固定差异清单。只适用于这四个效果的碰撞采样，不改变技能数值、原图、生命周期或其他家族。

原版空白帧的 `getBounds` 含巨大 sentinel 坐标，这是零面积对象的原版观测。消费者必须先检查 `blank` 并返回未命中，不能先把 sentinel 投射进战斗空间。

目标继续复用218三Sprite/12 monster映射及其 `runtimeBounds`；不要重复乘实例scale。每个projectile从自己的combat root映射source root，禁止取共享P1根。当前Port仅按symbol缓存首帧mask，需要扩展为按symbol/frame/direction选择219场；初阶218采样保留。

## 验证结果与近似范围

原版AIR源字节独立核对：61个pet定义逐字节保留，另7个既有目标定义；76帧、131递归节点、40颜色滤镜实例均与原生时间轴对齐。

| 原版运行输入 | 案例 | buffer像素 | 命中布尔差异 | 像素差异 |
| --- | ---: | ---: | ---: | ---: |
| 76帧/左右/三目标/相位 | 4,864 | 23,028,552 | 0 | 4 |
| 独立边缘接触 | 1,280 | 624,708 | 0 | 0 |
| P1/P2独立根，含空白帧 | 304 | 2,001,740 | 0 | 100 |
| 合计 | 6,448 | 25,655,000 | 0 | 104 |

104个像素分布于6个案例。四个旋转帧案例各差1像素；P1分数根的两个案例各有50个目标边缘非完全覆盖像素。这个统计是有限输入的实测，不是任意位置的最大误差保证。原版整数平移反例、候选推导和逐像素明细保留在 `geometry-probe/`、`progress.md`、`sampling-verification.json`。直接使用214A PNG alpha在原始4,864例中有51个命中布尔差异，故本方案使用源AIR编译的场。

八类变异均检测到：首帧mask复用、实心矩形、错误翻转、根偏移、crop混用、相位丢失、空白帧残留与末帧先销毁。原版事实/场编码验证不使用近似豁免；只有运行时平移采样的已记录偏差被允许。

## 生命周期交接

`BaseBullet.step2` 先执行step/碰撞，再callback、末帧stop/destroy、来源hurt清理；`FollowBaseObjectBullet.step2` 在super返回且仍存活后才移动/翻转跟随。末帧碰撞不能被提前销毁吞掉。`setRole` 复制来源role的attack id，九个ltwj对象是独立对象，但不能据此发明九个互异的来源attack id。精确源码路径/hash/行范围见contract；214D继续消费213的技能数值、44项父合同和时钟。

## 可重跑

```text
python tools/dragon23-collision-source.py
python tools/run-dragon23-collision-probe.py
python tools/run-dragon23-collision-probe.py --edge-only
python tools/run-dragon23-collision-probe.py --roots-only
python tools/generate-dragon23-collision.py
python tools/verify-dragon23-collision.py
python tools/verify-dragon23-contract.py --promote
node tools/validate-ui-ground-truth.mjs docs/reverse-engineering/ground-truth/manifests/task-settings-219-dragon23-effect-collision.json
```

`verify-dragon23-collision.py --strict` 仍预期退出1，证明没有把近似伪称完全等价；日常命令检查用户批准清单、零命中布尔差异与变异门禁。不要自动重新冻结差异来消除新失败。

213家族真值、214A全部153资源/345投影/627ticks、218原版861案例/1,604,322像素回归均通过；structure现有9个无关warning，workflow仍有既有PlayerSlot命名warning。未修改原始提取、生产PNG或游戏src，原有C5测试/trace改动保持原归属。

下一执行项为214D：接入dragon2/3 normal/fs、sdcc与九对象ltwj，完成正式/TestScene双人可见HP/heal/cleanup证据及P1GD。214E完整家族44项/P1G合同保持未完成。用户本次已明确选择记录近似后实现，继续原目标，不停在这份前置交接上。

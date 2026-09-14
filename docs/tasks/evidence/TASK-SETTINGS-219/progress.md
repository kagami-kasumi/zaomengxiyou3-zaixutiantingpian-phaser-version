# TASK-SETTINGS-219：源运行补证进度

以下为用户批准近似之前的诊断快照，不是当前状态。用户随后明确选择“允许记录近似后实现”，已补充边缘/P1P2根测试并完成输入验收；当前结论以 `handoff.md` 为准。严格AIR像素等价仍未成立，没有修改生产资源来掩盖这一点。

## 已验证的源事实

- 四对象 15/30/21/10，共 76 帧、152 个方向状态；原版 AIR 原生播放，没有用逐帧根 `gotoAndStop` 代替子时间轴。
- 独立二进制解析核对原包与最小 fixture：61 个 pet1 定义逐字节相同；另复用 218 的 7 个 StageCommon 定义。
- XML 提取与原版 AIR 逐状态核对 131 个递归节点、局部矩阵、alpha、子帧、40 次颜色矩阵滤镜实例，均通过。见 `source-verification.json`。这个结论不包含碰撞采样等价性。
- 4,864 个原版 HitTest 案例、3,016 个交集 buffer、152 张 940×590 原版基准已保存于 `air-original/`。直接用 214A 生产 PNG 进行相同 HitTest 有 51 个布尔差异，因此不能把生产 PNG alpha 当作精确原版碰撞输入。

## 被原版反例否定的方案

`verify-dragon23-collision.py` 当前是候选验证器，退出码为 1，不能作为通过门禁引用。

候选将 27 种源显示状态编译成左右方向的 20×20 相位场，再以整数平移查询。4,864 个案例的命中布尔一致，但 23,028,552 个 buffer 像素中仍有 4 个差异：`PetDragon3Bullet1` 第 3/4 帧右向、target0、phase-3/10，每例 1 像素。

`geometry-probe/translation-experiment.json` 给出独立的原版反例：对同一源 MovieClip，只改变绘制的整数平移量，然后裁回同一 100×100 区域；平移 0/1/2/5/10/14 像素时该诊断为 0 差异，20/50/100 时为 1 差异。诊断源图与原始 HitTest 案例 buffer 逐像素相同。故不能把剩余误差当作 PNG、目标遮罩、错误帧或单纯 phase 索引问题，也不能通过调整一个固定相位声明问题解决。

另一个单案例实验表明，嵌套局部矩阵与直接相乘后的单层矩阵并不自动等价：原始相乘矩阵有 78 个差异；原版绘制平移取 `112.75,33.25` 的单层形状在该案例为 0 差异。此实验只约束这个诊断，尚不是通用取整规则。原版 `concatenatedMatrix` 在部分滤镜节点还采用不同的相对根，不能直接以它替换所有源局部矩阵。

## 尚未闭合

- 旋转 bitmap 的逆矩阵/扫描线采样精度仍未知。当前相位场和解析 alpha 实验均不得进入正式运行时。
- 全部允许根输入、P1/P2 独立根、跟随前后与末帧顺序的消费测试、变异测试和生产碰撞映射尚待采样规则闭合后完成。
- 未运行并宣称完整任务验收；源码树核对通过不覆盖以上缺口。

## 可重跑命令

```text
python tools/dragon23-collision-source.py
python tools/run-dragon23-collision-probe.py
python tools/verify-dragon23-source.py
python tools/verify-dragon23-collision.py
python tools/run-dragon23-collision-probe.py --geometry-only
```

第 4 条预期失败并报告上述 4 例；第 5 条用于独立定位，不改变第 4 条的裁决。全部使用现有 AIR SDK 编译、恢复包原版 AIR DLL 运行，没有安装或替换原版引擎。

下一步只处理这个有限采样缺口：先建立能解释原版整数平移反例的候选，再用未参与推导的原版位置案例检验。若需要扩大为公共 Flash 光栅实现或新的独立工作包，必须按本任务拆分触发另行承接，不得在 214D 中默默补写假设。

# 六公共增益局部资源投影方案

仅用于TASK-SETTINGS-246。任务定义持有状态、预算和验收，本方案描述原生分離采样方法，不扩大245B或244范围。

## 有限输入与输出

输入：244完整原生trace/PNG、verified manifest、source-definitions、恢复pet1六效果闭包；源哈希必须逐项复核。输出：本地TASK-SETTINGS-246归档和`task-settings-246-pet-passive-projection.json`，状态先draft，未知清零且独立验证通过后verified。

## 六段证据链

1. 对象局部：六根713/738/761/778/805/806、子712及50矩形shape/bitmap；读取bitmapMatrix、矩形边缘、重复填充、颜色与两处identity filter。
2. 调用与输入：沿244固定show尺寸赋值、FollowBaseObjectBullet、host原点及方向输入，不改owner调度或原source方法。
3. 空间与显示：先区分原位图解码、shape本地栅格、滤镜子树栅格、最终舞台裁切；每层记录原点/整数包络/矩阵及绘制边界，不能把Graphics.readGraphicsData回读的舍入矩阵自动当原SWF矩阵。
4. 生命周期：原样引用244首次/刷新/暂停/淡出/清理，不借新增采样重建第二套时钟。源状态必须维持原根和嵌套帧，禁止gotoAndStop后尚未刷新就读取bitmap。
5. 结果：相同输入独立重放，局部产物组合与原stage PNG比较；mfjc单独作为无滤镜对照，防止把所有残差归因于filter。
6. 消费与反证：用与采样实现独立的对账器检查完整384fixture/65,280状态、源树/局部归档/原stage PNG。B后续消费同一字段和资源入口，不读取本地报告作为运行依赖。

## 采样和停止边界

先在既有profile中选首次、move分数平移、双方向、代表JPEG3/无损bitmap和712滤镜作原因分离；只有解释清楚后扩到完整状态集。原始基准不得被候选图覆盖，不把减少状态或修改source phase当修复。若局部资源足以重建，直接冻结；不默认进行无界分数网格、任意alpha/任意SWF枚举。

轻微像素差可按项目长期授权记录，但必须说明原因、最大偏移/通道差、受影响精确状态及未解释项。诊断包络不是许可。无法证明时保持draft/blocked；出现其他资源族或玩法问题按task拆分触发处理，不扩张本方案。

## 产物检查

记录源SWF/AS3 locator及hash、runtime/生成器hash、原状态到局部层映射、重复结果、PNG/透明alpha完整性和差异清单。Schema同时检查状态集、递归对象/矩阵、原基准引用；矩阵/bitmap/原点/filter/帧/方向/遗漏状态变体须失败。大manifest及中间文件仅本地，正式文档保留生成入口及边界。

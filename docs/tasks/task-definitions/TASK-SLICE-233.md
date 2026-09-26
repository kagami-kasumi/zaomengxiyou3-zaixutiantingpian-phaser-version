# TASK-SLICE-233

任务类型：`TASK-SLICE`

任务模型：`常规任务`

功能条线：`LINE-PRE-STAGE-2-3-PRESENTATION`（Active；本任务 Planned）

目标机制/切片：`M-035`、`M-042`、`VS-067`

要解决的问题：226实际画布对照中，猴马私有效果WebGL的850态全通过，Canvas回退654态不符。Phaser CanvasRenderer.batchSprite在camera.roundPixels=true时把绘制宽高各加0.5，引起透明边缘重采样。正式main使用AUTO和roundPixels=true；这是共享回退渲染规则，独立于家族时间轴。

范围：复用226原图与相位，修正共享Canvas绘制尺寸/整数对齐；核验猴马双向效果和一个正式关卡的身体、地形、HUD。保留WebGL、碰撞、伤害及播放时钟。

规模预算：
- 主工作包：1
- 预计上下文压缩：0
- 独立验收批次：1

拆分触发：
- 若需重做相机、全场景缩放或新增原版资料，先交接独立边界；不把单fixture关闭取整通过当正式场景完成。

协作计划：
- 模式：单 agent
- 模型分工：共享配置和实际浏览器证据紧密依赖，由主agent连续处理。
- 并行工作包：无
- 写入 owner：主 agent
- 归并检查点：验收前
- 方法观测：无

输入资料：
- `tools/pet226-display-browser-probe.ts`、`tools/build-pet226-display-probe.mjs`、`tools/pet226-body/prepare_display_browser.py`。
- 本地`docs/tasks/evidence/TASK-SLICE-226/horse-display-webgl-after.json`与`effect-display-canvas-before.json`，观察来自实际浏览器可见报告。
- verified的`task-slice-226-monkey-pause-display.json`、`task-slice-226-horse-pause-display.json`及原生EXIT基准。
- `src/main.ts`、当前Phaser的`CanvasRenderer.js`和正式场景相机消费者。

输出产物：共享Canvas尺寸/取整修正、双渲染器逐状态差异报告、正式场景回归与必要的精确视觉例外。

完成定义：正式Canvas回退不再出现本反例，WebGL和代表性场景无新增偏移，结果可复验；不宣称所有场景像素一致。

验收标准：
- 保留654态失败证据；expected使用原生独立采样，不能来自现代输出。
- 实际浏览器复验850态双向效果，记录alpha及预乘RGB残差，不能只看零console error。
- 核验正式AUTO回退、相机滚动及小数位置，不用fixture配置替代生产接线。
- build、相关系统测试、workflow、problem audit和diff检查通过。

禁止范围：不修改node_modules作为交付方案，不改原始提取，不全局放宽像素阈值掩盖几何差异，不改战斗合同。

状态更新：Planned，当前唯一Ready为TASK-SETTINGS-230；226本地整改已归档，本项公共机制尚未修复，须继续核销原84承接矩阵中的相关责任。

推荐后续任务：回填同线Canvas视觉验收后，按覆盖台账选择未完成项。

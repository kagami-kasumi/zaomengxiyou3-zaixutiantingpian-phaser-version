# 六公共增益资源投影预检（245B）

后续：246原生局部采样已完成，245B恢复Ready。见[局部投影合同](pet-passive-local-projection-contract.md)。下文保留失败候选的历史事实，不再表示当前调度阻塞。

2026-10-02：245B未完成。244原生真值保持verified；当前Canvas候选不合格，正式src/public试改已撤回。246先补有限原生投影输入，完成后恢复245B全部合同，不关闭245/204/all/194/VS-067。

## 已确认与未确认

- 244的384 fixture / 65,280状态、107定义、50个矩形Shape及50个位图是有效输入。源矩阵、注册点、滤镜、生命周期没有被本次反证。
- 恢复pet1的六效果均为单一矩形重复位图填充（FillStyle66）；sxkb/fsnl共同子712挂恒等ColorMatrixFilter。滤镜数值恒等不证明其原生中间栅格与浏览器直接绘制相同。
- 原包AIR通过GraphicsBitmapFill读取73条位图观察、50个唯一bitmap，避免以通用JPEG解码冒充原生解码。生成器只写本地TASK-SLICE-245B目录，候选不是verified新真值。
- 候选直接消费全部244的72个profile/方向clip，未把horse或hero2..5简化成另一个profile。使用源shape bounds、bitmapMatrix、最近邻重复填充及逐态root输入。保留identity filter元数据，但**没有模拟Flash滤镜中间栅格**，这是明确的候选限制。
- 实际Canvas全65,280态已测；原始通道差异与一像素邻域逐通道min/max加3的诊断包络均保留。包络不是新批准的视觉容差，也不是玩法容差。无包络外差异亦不等于完整视觉验收。
- 最终72clip版本：sxkb 3,548态/56,284像素、fsnl 3,560态/56,464像素、mfjc 188态/5,492像素在包络外，共7,296态/118,240像素。原始结果见本地`projection-full.json`及`projection-summary.json`。mfjc无滤镜，不能把全部残差归因于identity filter。
- 未完成WebGL、正式资源加载、显示事件接线、五关或运行时生命周期验收；没有用零console作为视觉通过证明。

## 补证边界

需要区分位图原生解码、shape矩形边缘覆盖、bitmapMatrix分数采样/重复、滤镜中间层原点与合成顺序，形成可由消费者直接使用的独立局部投影。现有244是最终原生舞台裁切与树，不能自动证明把该PNG再平移/缩放后的像素等价性。Pillow整帧平移12候选合计28,578像素超过诊断阈值3、最大通道差255，只作为失败路线记录，不声称所有路线失败。

这次触发的是245B“原点/缩放/滤镜不可解释差异先有界补证”，不是“新增公共root机制”。不得研发任意SWF通用渲染器，不扩大至其他家族/技能，不重做244生命周期。轻微像素、抗锯齿和舍入差异仍可按长期授权记录；当前残差尚未完成原因和范围归因，不能整体作为轻微差异放行。

## 接线调查的归并结论

实际Dragon/Turtle桥各rest/replace/exit共6个闭包诊断确认当前直接销毁身体显示；显式Scene/renderer替身只证明控制流，不证明原生画面。两族可用独立定位Container复用245A的register(root,body)/retire，无需新公共owner或重写整幅龟Canvas。龙龟colipse可沿既有verified来源映射244三种profile，未来接线仍需消费证明；这不是新尺寸逆向任务。

子agent早期“不同桥即新机制”方向未被采纳；最终建议保留有限六效果转换、禁止把一次候选失败推成通用渲染不可行。全量实际Canvas残差暴露后，仅将原生局部采样归因作为246范围。

最终只读复核已检查72clip生成器、候选和结果摘要：未发现可直接修正的明显平铺/矩阵实现错误；mfjc无滤镜的残差不能由profile归并或滤镜省略解释。采样/舍入、局部原点与合成顺序仍待原生实验归因，不据此断言Canvas不可实现。

## 复验与保留

入口见`tools/pet-passive-assets/README.md`。本地报告：`docs/tasks/evidence/TASK-SLICE-245B/host-preflight.json`、`translation-preflight.json`、`projection-full.json`、`projection-summary.json`。早期`browser.json`、`direct-bitmap-preflight.json`及`.tmp/pet245b-*.py`仅诊断历史，不作为最终通过证据。

全量报告、原生位图、候选JSON和截图只在本地；Git只交付诊断/生成入口与说明。生产代码不引用这些被忽略文件。未修改244或原提取集，未执行commit/push。

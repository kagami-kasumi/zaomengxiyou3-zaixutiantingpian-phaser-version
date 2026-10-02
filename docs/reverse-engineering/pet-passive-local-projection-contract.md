# 六公共增益原生局部投影合同

TASK-SETTINGS-246：原生采样域已 verified。244 的 384 fixture、65,280 状态全部保留；1,093 个不同局部显示树生成 226 种 PNG 内容，两次独立实例化、逐树核对及独立舞台基准像素比较均通过。245B 可恢复，但现代渲染和正式五关尚未验收。

## 来源与采样单位

输入仍是原始恢复 `assets/pet1.swf`，SHA-256 为 `0699a5d3a49ea8024d3635b18c6349f5d7f7cf5f1db869dd18a0a5ee6de60644`；源闭包保持 50 Shape、50 Bitmap、7 MovieClip。244 原生记录 SHA-256 为 `f93eb12a80ce07f2a547983beec506bd79703ff4e875708e26cf43b2a0839139`。未改原包、244 基准、数值或生命周期。

`LocalProjection.as` 在原包 AIR `WIN 51,1,1,5` 中实例化原六符号，保留原子树、帧、矩阵、颜色、滤镜和可见性。包装宿主只提供显示容器；不执行第二套行为时钟。采样循环用 60fps 加速处理静止输入，输入相位仍全部来自 244 的 24fps 原生记录。两次运行均在 EXIT_FRAME 后捕获，重新读取真实显示树核对，未把 gotoAndStop 同步后的未完成位图当样本。

局部化只从世界直属节点扣除 `floor(host.x/y)`，保留原来的分数部分、源 bitmapMatrix 和所有子级变换。局部栅格在原生整数包络加 2px 处采样，并记录局部 crop；回放只按整数宿主原点贴回，不能再次缩放、翻转、叠乘透明度或重采样。原始尺寸、朝向和 alpha 已包含在对应样本中。

## 结果与残差归因

| 检查 | 结果与含义 |
| --- | --- |
| 局部资源 → 独立244舞台PNG | 全 65,280 状态可见像素差为 0；同时检查局部图落在原 crop 外的非零 alpha，结果为 0 |
| 独立重复 | 1,093 树的属性、crop 和 PNG 字节一致；原始65,280文件逐项重算SHA |
| 无滤镜对照 | 1,432 状态不同，最大预乘可见通道差4；identity ColorMatrixFilter仍改变原生栅格，不得省略 |
| 错误原点/方向 | 各16,912状态被独立像素比较检出 |
| 错误滤镜/帧 | 分别12,568/344状态被检出 |
| 错误局部位图 | 将一个mfjc资源替换为透明图，真实比较器检出102状态，不是只测哈希变化 |
| 状态与源字段反证 | 遗漏hero5、子节点、矩阵/原点/filter层、错误bitmapId/bitmapMatrix/repeat字段被状态集、实测树或原XML合同拒绝 |

245B 失败候选直接把50原位图交给 Canvas 重新执行矩形裁切、填充矩阵和混合。246 使用原生完整局部栅格，消除了该重新栅格化步骤，因而无需猜测浏览器如何复制 Flash 的采样/边缘/中间层。无滤镜 mfjc 的188个包络外状态也全部恢复为原像素。这里冻结的是**原生局部透明产物和对应变换域**，没有声称已推导出通用 Flash 像素采样公式。

`Graphics.readGraphicsData` 再建对照本身已有16,456状态不同，不能把其输出当原对象的等价表示；基于该再建的 no-repeat/wrong-fill 仅为诊断，不用其差异单独证明重复或采样算法。直接替换原生 GraphicsBitmapFill 的早期负向实验曾令旧 AIR 退出，未计作成功反证，现改用独立 PNG 消费变体。失败记录保留于246本地目录。

## 机器产物与B消费

- Schema 真值：`docs/reverse-engineering/ground-truth/manifests/task-settings-246-pet-passive-projection.json`，`truthId=task-settings-246.pet-passive-projection`，`status=verified`、`unresolved=[]`。保留244原显示列表及独立舞台基准，新增局部投影 provenance。
- 消费合同：`local-resources/regima/task-outputs/TASK-SETTINGS-246/projection-contract.json`。`states` 给出原状态id、整数宿主原点、局部key及独立原基准；`samples` 给出原生树、PNG、SHA和局部crop；`shapes/bitmaps` 给出50项源矩阵/填充/边界及原生解码资源。路径相对仓库；生成器、编译器和原runtime哈希均冻结。
- 接线规则：从原尺寸/帧/方向/分数位置/透明度状态选择局部样本，以 `origin + sample.crop.left/top` 原大小放置；不能对已烘焙变换再变换。无显示的透明4×4只表示没有像素，不证明屏外几何。
- 验收：`docs/tasks/evidence/TASK-SETTINGS-246/acceptance.json`、`baseline-comparison.json`、`repeat-comparison.json`及负向报告。大manifest、资源与报告仅本地；B必须将运行必需数据导出至正式目录，不能使游戏依赖忽略文件。

采样域包含244实测的分数位置和分数bitmapMatrix，不等于任意新分数位置、缩放、alpha或滤镜组合。超域输入不能静默选近似样本或假称精确；B的现代转换、允许的轻微差异和双后端测试仍按完整原合同执行。本项没有批准新的视觉容差、改变碰撞/伤害/时序，也没有关闭245/204/all/194/VS-067或功能线。

## 复验入口

使用已有工具链，不安装软件：

```powershell
python -X utf8 tools/pet-passive-assets/local_projection.py baseline
python -X utf8 tools/pet-passive-assets/local_projection.py repeat
python -X utf8 tools/pet-passive-assets/local_projection.py no-filter
python -X utf8 tools/pet-passive-assets/verify_local.py no-filter
python -X utf8 tools/pet-passive-assets/local_projection.py wrong-origin
python -X utf8 tools/pet-passive-assets/local_projection.py wrong-filter
python -X utf8 tools/pet-passive-assets/local_projection.py wrong-frame
python -X utf8 tools/pet-passive-assets/local_projection.py wrong-direction
python -X utf8 tools/pet-passive-assets/accept_projection.py
node tools/validate-ui-ground-truth.mjs docs/reverse-engineering/ground-truth/manifests/task-settings-246-pet-passive-projection.json
```

50原位图生成入口沿用 `tools/pet-passive-assets/README.md`。不需要重生成244；原基准必须保留。子agent只读复核状态集合及消费边界，主agent负责写入和晋升。

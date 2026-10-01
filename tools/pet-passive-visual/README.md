# TASK-SETTINGS-244 六公共增益视觉复验

输入只读：恢复pet1.swf、已知StageCommon colipse、legacy AS3、已安装FFDec与AIR SDK，以及原包AIR51.1.1.5。输出只写244本地目录；不修改src/public或原提取结果。主合同见 `docs/reverse-engineering/pet-passive-visual-contract.md`。

在项目根目录执行：

```powershell
python tools/pet-passive-visual/source.py
python tools/pet-passive-visual/run.py
python tools/pet-passive-visual/repeat_mutations.py
python tools/pet-passive-visual/verify_lifecycle.py
python tools/pet-passive-visual/verify_display.py
python tools/pet-passive-visual/verify_display.py --mutations
```

`repeat_mutations.py` 重跑完整原生基准并执行七个编译/运行变体。基准384 fixture × 170时点=65,280态；变体各170态。该命令也重复source.py并核对产物SHA，写入source-repeat.json；只复验静态来源可加 `--source-repeat-only`。

```powershell
python tools/pet-passive-visual/accept.py
python tools/pet-passive-visual/manifest.py --verified
node tools/validate-ui-ground-truth.mjs docs/reverse-engineering/ground-truth/manifests/task-settings-244-pet-passive-effects.json
```

accept校验源文件/片段、SWF、生成AS3、运行DLL、重复结果、七运行变体、十字段变异、生命周期与显示树报告。manifest生成器继续校验Schema与独立source/lifecycle对象计数；`--verified`不能绕过accept哈希。修改probe/source/fixture后必须重跑受影响采样与重复，不以旧哈希报告晋升。

原生程序加载完整pet1，保留两个frame100脚本；source.py的byte closure用于独立结构核对，不能替代动态原包。MainGame暂停是原方法+有界调度，不是完整游戏。宠物淡出只在确定elapsed下执行原Tween ratio与插值，不宣称完整Tween机制。

长运行ADL使用隐藏舞台、原包runtime及有界900秒超时；不使用无display list的-cmd。正常运行通常数分钟，日志与退出码位于task-outputs/244/air相应变体目录。smoke可用 `run.py --smoke`（30态），不计完整验收。

逐态基准、trace、失败记录、完整超过200MB manifest仅本地保存。游戏不依赖本工具/这些证据；后续生产消费必须生成正式资源与必要数据并提交。`contact-sheet.png`是六效果阅读索引，不能替代逐态原生PNG。取舍说明及文件清单在本地handoff/retention报告。

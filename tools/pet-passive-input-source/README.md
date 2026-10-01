# 243 正式资质与零时长补证

- `node tools/pet-passive-input-domain.mjs`：真实捕获/洗练/还童输入见证和既有存档codec；不产生原版expected。
- `python tools/pet-passive-input-source/check.py`：原生997例、五种编译源变异、七种损坏报告、重复一致，并验证235原720文件字节不变。
- `python tools/pet-passive-input-source/verify.py`：仅复验已有本地原生报告，不重新采样。
- `python tools/pet-passive-input-source/generate.py`：核验后序列化独立`reference/pet-passive-input-contract.json`，不重生成235。

捕获复用235只读原方法提取入口，另用243输出目录；SDK编译，游戏包AIR51.1.1.5运行。生产和原生输出分别位于`docs/tasks/evidence/TASK-SETTINGS-243/`，SWF/源壳在`local-resources/regima/task-outputs/TASK-SETTINGS-243/air/`。这些仅作本地源级复验输入，游戏运行不依赖。完整宠物功能收束前保留。

972例是整数0..8两轴笛卡尔×四形态×三fps；getter和setter各8个异常/转换探针另列；9个同名刷新组合含0时长。只重放局部BasePet检查、BaseAddEffect与四项主人属性，沿用235的移动/视觉/网络服务sink，不声明完整BaseHero场景或六特效视觉。原版setter转换与现代宽松decoder明确分开。

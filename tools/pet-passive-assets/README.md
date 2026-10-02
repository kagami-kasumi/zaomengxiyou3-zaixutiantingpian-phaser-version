# 245B 有限投影诊断

后续246已完成原生局部采样，入口、采样域和复验命令见 `docs/reverse-engineering/pet-passive-local-projection-contract.md`。`local_projection.py`/`LocalProjection.as`/`verify_local.py`/`accept_projection.py`只写246本地产物；这些通过结果不改变下文245B旧候选失败事实，也不替代B的现代渲染验收。

这些工具是失败候选的可复验入口，不是正式渲染器。只写`local-resources/regima/task-outputs/TASK-SLICE-245B/`、`.tmp/pet-passive-browser/`和`docs/tasks/evidence/TASK-SLICE-245B/`，生产src/public不消费任何输出。

在项目根目录，使用已有AIR SDK和原包runtime：

```powershell
node tools/pet-passive-host-preflight.mjs
python tools/pet-passive-visual/translation_preflight.py
python -X utf8 tools/pet-passive-assets/extract.py
python -X utf8 tools/pet-passive-assets/pack.py
node tools/pet-passive-browser.mjs --full
```

`extract.py`从恢复pet1读取GraphicsBitmapFill原生bitmap，73条观察/50个位图；异步EXIT_FRAME后采样，不能在gotoAndStop后同步读取未完成的bitmap。首次实验曾因显式AS3 cast、app资源URI写入和过早读取失败，已修正；仅在已有SDK可用时运行，不安装复杂软件。

`pack.py`用244原生cycle树与源XML生成72个profile/方向clip，保留所有滤镜字段；候选只断言恒等滤镜，未实现Flash滤镜中间栅格。`candidate.ts`只服务六效果的矩形位图实验，不是通用SWF渲染器。

browser runner使用已安装Edge headless和临时本机HTTP服务，比较实际Canvas像素与原始PNG，记录源PNG SHA和候选SHA；全量65,280态，默认无`--full`只跑12态诊断。输出`projection-full.json`或`projection-smoke.json`，`status=diagnostic`不等于通过，退出0仅表示测量完成。输入显示frame和owner由原生oracle提供，故本工具不证明现代时钟、事件、刷新或正式五关。

原始差异与包络外像素都保留；一像素邻域/通道3只作定位，不构成批准的现代视觉例外。见`docs/reverse-engineering/pet-passive-projection-preflight.md`及TASK-SETTINGS-246。


## 245B正式消费入口

246验收后，`python -X utf8 tools/pet-passive-assets/export_runtime.py` 将原生局部栅格投影为 `public/assets/pet-passive/` 的181张透明PNG和 `src/assets/pet-passive.generated.json`。后者含2720姿态及完整递归显示树、characterId、矩阵、颜色/滤镜和50个shape定义；运行不读取local-resources或docs/tasks/evidence。

- `node tools/run-system-tests.mjs pet-passive-display-assets-tests`：18,144个非淡出原生态的资源与完整元数据对账、PNG SHA、域外小数≤0.5px/轴对齐和不支持变换拒绝。
- `node tools/pet-passive-render.mjs`：两个真实Phaser后端各384组65,280状态。期望直接来自244原生PNG，生产Session/主人数值owner发出显示命令；不是由oracle指定现代帧。
- `node tools/pet-passive-formal.mjs`：五正式入口的P1/P2首次/活跃/结束、暂停、休息/替换、实际失败重试/返回/重载；只观察现有party和display，临时HTTP端点提供同一生产入口及public资源，受控名单注入不称完整原游戏重放。
- `node tools/pet-passive-formal.mjs --first-only`：额外首次四宠物层与暂停十二层逐原生PNG对账。
- `--family=dragon` / `--family=turtle`：补充已迁移家族的正式附属层/退休/纹理清理；不外推其余未迁移家族。
- `node tools/pet-passive-render.mjs --mutant=<name>` 与 formal runner 的同名参数：内存替换生产源码；11个负向变体见`tools/pet-passive-display-mutations.mjs`，命中对应失败才算拒绝，源码不落盘修改。
- `node tools/pet-passive-host-preflight.mjs`：现已跟随实际Dragon/Turtle桥复核6组身体即时释放/附件独立退休；显示spy不能替代上面正式像素证据。

`candidate.ts`和本页前述projection诊断保留为被拒绝候选；生产只使用246原生局部PNG。完整原生复验仍依赖本地语料与已安装AIR工具；Git交付只承诺安装npm依赖后构建、运行，不承诺源级逆向复验。颜色舍入、位置对齐及证据范围见`docs/reverse-engineering/pet-passive-display-acceptance.md`。

245B五项联合设计门禁复验需沿用`tools/local-validation.md`的单次8GB Node堆配置（默认约4GB在116组合中可耗尽）；测试集合不变。浏览器门禁所需4174 preview必须保持运行，runner会先检查入口响应。

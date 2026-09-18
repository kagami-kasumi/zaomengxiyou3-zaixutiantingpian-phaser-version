# 玄龟资源准备（TASK-SLICE-223）

`python tools/turtle-assets/build.py` 从本地 verified 222/225 输入派生资源；`python tools/turtle-assets/check.py` 重复生成并执行全部独立解码、逐态像素、碰撞与变异检查。源级复验需要本地 RegiMA 和原生证据归档；普通构建和未来资源消费只需要 Git 中的 `public/assets/pets/turtle/`。

生产入口是 `/assets/pets/turtle/manifest.json`。四份视觉 JSON、碰撞 JSON 和显示树 JSON 使用标准 gzip；浏览器可将 fetch 的 body 经过 `DecompressionStream('gzip')`，再用 `Response(...).json()` 解码。PNG 不经过重采样。此任务准备资源，不创建正式战斗 Runtime 或新增场景加载 owner。

- `bodyAnimations` 保存四形态动作行、cell、持帧和时钟；四视觉包的 state ID 对应 verified 原状态，`timing` 与 `sourceTrace` 保留原 tick、方向、动作和生命周期观察。不能将静态 root frame 当作递归动画时钟。
- `groups` 按源深度排列；每个 owner 的 `paintParts` 依次合成，`components` 仅供独立子对象消费，不能再叠画一遍。滤镜/clipDepth 绘制单元必须保持原子性，不能换成整个 fixture 截图。
- `origin` 是原 fixture 舞台中的裁切位置。移动 owner 时，仅加上 owner 新位置与原位置的差；源方向、scale、alpha、mask/filter 已烘入 PNG，不重复应用。`display.json.gz` 保留原版与投影的完整注册点、矩阵、遮罩和父子树；通过 state ID、projectionLinks 的 objectId/sourcePath/ownerPath 查找。
- 像素合成遵循 manifest 的有限整数合同，不能用未经对账的 Canvas 默认混合代替并宣称零差异；运行集成在 224A/B/C 验证。
- 碰撞包的 `mapping` 将 `fields/<field>-<phase>`、`tiles/<field>-<cx>-<cy>-<phase>`、`targets/t<index>-<phase>` 映射到去重的 `planes`。base64 解码后按行优先、MSB first 解包；只取 width×height 位，尾部补零。相位分别为源 4×4、目标 20×20；tile 为 128×128。缺失应有相位必须报错，不能静默透明。
- `profiles[].fixture` 保留 phaseMap/lastTick、sourceHashes、目标映射和源 scale；`petColipse` 与 `monsterTargets` 分离。视觉透明边界不是碰撞边界。
- 32 项合同原样保留，9 项有攻击 mask，23 项明确 N/A；N/A 不免除后续行为或生命周期验收。视觉仅 225 的 28 状态/308 个精确 RGBA 元组，碰撞仅 222B 的 20 案例/70 像素，不能互相外推。

验证报告写入本地 `docs/tasks/evidence/TASK-SLICE-223/`。原生输入归档保留供 224A/B/C 复验；生成的逐态诊断不作为运行依赖。

`npm run build` 后运行 `node tools/turtle-assets/verify-delivery.mjs` 可在不读取原生证据的情况下独立解码交付包，并逐文件核对 dist 副本。少量可见对照图用 `python tools/turtle-assets/diagnostics.py --write-images` 生成在忽略的 `.tmp/verification-images/TASK-SLICE-223/`；不是正式场景的运行验收。

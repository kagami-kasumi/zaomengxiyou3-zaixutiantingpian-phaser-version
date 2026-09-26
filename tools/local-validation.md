# 日常回归与本地原版复验

普通开发使用 `npm run test:systems` 的14组核心，加受影响专项并构建；同批不变成功结果直接复用。明确需要完整审计时用 `npm run check:all`，包含 workflow、结构、版本化真值 Schema/负向测试、88组完整系统回归（含玄龟生命周期）和构建。测试触发与复用以 `docs/workflow/code-quality-gates.md` 为准。原始截图、AS3、本机 AIR 和忽略的采样报告不属于这项承诺。Schema 检查只证明数据结构，不证明原版行为或现代游戏完全一致。

## 玄龟

`npm run test:pet-turtle` 独立运行 `pet-turtle-lifecycle-tests`，默认 `test:systems` 同样执行它。测试的报告写入 evidence 是输出，不是干净副本的前置输入。

其余测试可用 `node tools/run-system-tests.mjs <测试名>` 执行；完整家族使用 `npm run check:system-design -- pet P1T`。该命令属于仍在实施中的宠物设计验收，不接入普通 `check:all`，也不重开已退出设计。`requireTest` 已经把测试加入实际执行集合，不另加重复执行登记。

下表路径以 `docs/tasks/evidence/` 为前缀。机器清单在 `turtle-test-registry.mjs`；启动各组前检查输入，允许前面的测试生成后面的输入。缺少本地文件输出 `LOCAL_INPUT_MISSING`，退出 2、该组未覆盖；断言失败仍为失败。设计门禁外层可能转为退出 1，但保留原因文本。清单只列主要前置，报告引用的全部源文件/截图仍须存在。

| 测试名（省略 `pet-turtle-`） | 主要前置 |
| --- | --- |
| resource-tests | `TASK-SETTINGS-222A/body-native.json.gz` |
| combat-clock-tests | 上述 body、`TASK-SETTINGS-221/behavior-contract.json` 及所引用原 AS3 |
| caller-order-tests | `TASK-SLICE-224A2/native-caller-order.json`、原 BasePet |
| world-collision-tests | `TASK-SLICE-224A1/dynamic-call-oracle.jsonl` |
| runtime-tests | `TASK-SETTINGS-221/source-trace.json`、A2 native-caller-order、原 AS3 |
| link-tests | `TASK-SETTINGS-221/settlement-trace.json`、`TASK-SETTINGS-222A/buff-native.json.gz`、原 AS3 |
| skill-runtime-tests | 221 source-trace、`TASK-SLICE-224B/native-caller-order.json`、原 AS3 |
| oracle-tests | 222A body/effects/dynamic/buff-native、222B native-corpus-index/native-corpus.zip、报告引用的本地 PNG、Python numpy/Pillow |
| acceptance-tests | A1 visual/plane/dynamic/full oracle、Python numpy/Pillow、浏览器条件 |
| combat-acceptance-tests | A2 runtime-trace、浏览器条件 |
| link-acceptance-tests | A3 link-trace、浏览器条件 |
| skill-acceptance-tests | B skill-runtime-trace、浏览器条件 |
| family-acceptance-tests | 前述联合语义输入、生命周期变异、浏览器条件；自行生成 C/combat-browser.json 再核验 |

原 AS3 位于 `local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts/`，包括 BasePet、PetTurtle1..4 及 trace 引用的 BaseHero、BaseRoleProperies、BaseAddEffect、PetInfo、Role3。这里只读取原提取结果。

浏览器条件：先 `npm run build`，在另一终端运行 `npm run preview`（4174），按现有 `turtle-runtime` 脚本准备 Edge、本地参考图与 Python。完整 P1T 不与另一 system-tests/设计门禁并行，两者共用 `.tmp/system-tests`。大批资源/画布验收曾达到默认堆上限，可在 PowerShell 中临时设置并自动恢复：

```powershell
$previousNodeOptions = $env:NODE_OPTIONS
try {
  $env:NODE_OPTIONS = (($previousNodeOptions + ' --max-old-space-size=8192').Trim())
  npm run check:system-design -- pet P1T
} finally {
  $env:NODE_OPTIONS = $previousNodeOptions
}
```

OOM 是资源失败，不算通过；分段通过不能代替声明为完整的聚合验收。

## 击退

`npm run test:monster-knockback-truth` 顺序执行 `verify.py --mutations`、`generate.py --check`，需 Python/jsonschema、Java、现有 `D:/AIRsdkmanager/sdk/AIRSDK_51.3.4`、原 AIR runtime、恢复 SWF、原 AS3，以及 `TASK-SETTINGS-230/native.json`。入口预检缺输入时输出 `LOCAL_INPUT_MISSING` 并退出 2；真正的复验失败非零退出，不伪装跳过。不会安装 SDK 或重新提取原资源。

默认 `check:all` 校验 tracked 击退 Schema，包括入口/去重/调度的字段类型、运动元组和自然 Tween 结果；原 AIR 重放单独执行，不强迫普通构建机器安装逆向工具。

击退 manifest 的 `counts` 是原采样规模（1080 组运动），`motion` 是核验等价后发布的 270 组代表轨迹。`directionObservations` 指明原 native 文件、方向行筛选和规范化 SHA-256：哈希针对 432 条方向记录，不是含非确定性自然时间采样的整个文件。重新生成必须走生成器，不手改真值。

## 真值扫描

`npm run check:ground-truth` 只扫描 Git 在册 JSON（递归含 behavior）；`npm run check:ui-ground-truth -- --local` 额外扫描本机忽略文件。显式路径使用相同分派规则。未登记且不声明已支持 `$schema` 的文件会失败；每个错误含文件名。新增文件应先显式验证，进入 Git 后纳入默认扫描。

228/229 的新 Schema 验证交接结构和嵌套 UI，原行为反例和生产语义仍由原专项负责；不能凭这个绿色结果宣布 PG-017 或整个家族关闭。

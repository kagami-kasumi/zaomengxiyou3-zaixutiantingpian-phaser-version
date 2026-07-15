# 单资源族标注流程

本流程一次只处理一个资源族，例如 `Role1Bullet1/3/4/5`，而不是“所有角色资源”或“整个 SWF”。

## 0. 建立批次

Agent 复制 `batch-template.md` 的结构，在 `batches/<batch-id>.md` 记录：

- 本轮资源族和排除范围。
- 为什么它影响当前切片或现代实现。
- 预计读取的最小资料。
- 当前是否需要人工输入；默认写“不需要，先由 Agent 调查”。

批次 id 使用可读短名，例如 `role1-normal-attack`，不建立新的 `TASK-*` 编号体系。

## 1. Agent 先完成证据调查

Agent 依次检查：

1. 现代 manifest、代码或逆向文档中已经使用的 stableKey。
2. 相关 AS3 中的资源名、创建位置、用途和动作关系。
3. 旧 `local-resources/regima/legacy-extraction/` 的 `symbolClass/symbols.csv`、图片、SVG shape 和报告。
4. `assets-index.md`、相关机制索引和已有缺口计划中是否已有结论。
5. `local-resources/regima/source/restored-swfs/` 中的原始命名 SWF；用 FFDec `-dumpSWF`、`-dumpAS3` 或 `-export symbolClass` 窄查目标名称。视觉资源是否缺失以这一步为最终依据，不能停在旧 `local-resources/regima/legacy-extraction/`。

`local-resources/regima/legacy-extraction/` 和恢复 SWF 都按只读证据处理。关键词定位和 UTF-8 读取仍遵守 `AGENTS.md`；不得执行恢复目录中的 EXE/DLL。

## 2. 写候选标注

Agent 按 `annotation-schema.md` 新建或更新 `annotations/<scope>.csv`：

- 有直接证据：写 `confirmed`。
- 多条线索一致但缺直接映射：写 `probable`，并列出缺失的确认条件。
- 无法判断：写 `unknown`，不得靠文件外观或命名猜测。
- EVB 语料库已恢复但尚未定位精确包/符号：写 `source-corpus-ready + locate-symbol`。
- 已定位源 SWF 和符号、尚未导出：写 `export-ready + export-selectively`。
- 已在 `local-resources/regima/task-outputs/` 得到 PNG/SVG/atlas 等派生物、尚未接入：写 `derived-ready + integrate`。
- 经过恢复语料库检索仍确认源文件不存在：才写 `missing-original + request-source`。

同一资源不要因为存在多个证据路径而重复成多行；证据路径用 `;` 分隔。

## 3. 判断是否需要人工

只有以下情况才请求人工：

- 两个或多个候选都符合代码证据，需要看原版画面消歧。
- 仓库没有原版运行画面，但验收依赖“是否像原版”。
- 必须使用 FFDec GUI 做视觉选择且 CLI 无法完成；FFDec CLI 已安装，不再把普通导出转交人工。
- 需要在“参数化重建”和“高成本逐帧近似”之间做产品取舍。

请求必须是最小动作，写清：对象、要观察的位置、需要用户返回什么、没有该输入时 Agent 能完成到什么程度。不要笼统要求用户“把素材都标一下”或“再研究一下原版”。

人工可以返回三类证据：

- 文件或目录：补充资源包、截图、录屏、FFDec 导出结果。
- 判断：候选 A/B、动作名称、是否接受近似方案。
- 验收：接受、拒绝，并指出最明显差异。

人工证据写入批次记录；若是本地文件，标注其路径，不复制到 `local-resources/regima/legacy-extraction/`。

如果本机已有 FFDec CLI，且用户已经明确授权本次选择性导出，Agent 可以从 `local-resources/regima/source/restored-swfs/` 调用 CLI。输入使用只读源文件，输出写入新的 `local-resources/regima/task-outputs/<batch>/`；审阅完成后再决定哪些派生资料进入现代资源目录。不得直接覆盖源语料库或重新生成现有 `local-resources/regima/legacy-extraction/`。

## 4. 给出唯一去向

每条标注只能有一个当前 `nextAction`：

- `locate-symbol`：在恢复 SWF 中定位精确源包、SymbolClass/MovieClip 和 character id。
- `export-selectively`：精确符号已确认，只导出当前资源族。
- `integrate`：本地 RegiMA 派生素材已就绪，可生成后续资源接入 task。
- `use-placeholder`：玩法可继续，视觉缺口保留。
- `request-source`：恢复语料库检索后仍确认缺原始资源，需要新的合法来源。
- `review-candidate`：只差人工消歧。
- `evaluate-splitting`：进入拆分必要性判定。
- `none`：记录完整且当前无需动作。

不能用“以后再看”“待处理”等不可执行描述。

## 5. 关闭或暂停批次

Agent 在批次记录中汇总：

- 已确认、推测、未知各多少条。
- 目前可接入、可用占位、缺原资源各多少条。
- 是否存在人工动作；若有，只列用户现在能执行的最小动作。
- 后续是否需要创建游戏资源接入 task。

源语料库已恢复不等于资源已接入。批次可以在“已标注，等待定位”“已定位，等待选择性导出”或“派生物就绪，等待接入”阶段关闭；后续更新原行，不重复新增 stableKey。

## 与正式游戏 task 的边界

标注工程可以独立维护批次，不把每次调查写入 `task-board.md`。只有以下工作才进入正式游戏 task：

- 将 ready 真素材复制、转换或注册到现代资源目录。
- 修改 manifest、加载器、动画或场景代码。
- 为现代实现制作并验收一个可玩的资源替换切片。

如果一次工作同时包含调查和代码接入，应先完成标注结论，再按 `docs/workflow/task-generation.md` 建立一个窄的 `TASK-ASSET-*` 或 `TASK-SLICE-*`。

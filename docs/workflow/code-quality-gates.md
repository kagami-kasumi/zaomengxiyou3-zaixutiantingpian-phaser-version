# Code Quality Gates

This document records harness-level rules for AI agents that edit game code. It is not a game task board.

## Required Gates

- Source edits under `src/` require daily core regression (`npm run test:systems`), tests for the affected behavior, and `npm run build` once against the final relevant inputs. Successful unchanged results from the same batch may be reused; this does not require a full regression on every task.
- Workflow, task, domain, or harness document edits must run `npm run check:workflow` (harness plus legacy document validation).
- `npm run check:harness` is the independent fast check for harness routes, links, scheduling snapshots and PG contracts. `npm run check:workflow:full` adds asset annotations and level architecture checks; run these when their inputs change. After editing board status, run `npm run generate:harness` to refresh its derived recommendation.
- Mixed code and workflow edits run only their required constituents once. `npm run check:all` is an explicit full audit, not the default closing ritual. Use it for a release, broadly coupled/unknown impact, or an explicit full-audit requirement. Do not rerun successful constituents through a wrapper when their inputs have not changed.
- Before adding new logic to any file, run `npm run check:structure`. If the target file appears in errors, splitting is mandatory before adding logic. If the target file appears only in warnings, split it first for feature work; for a small local fix, document the reason and keep the edit narrow. Warnings in unrelated files do not block the current task.
- Visual testing is useful, but it is not enough for completion. A visual pass must be paired with a deterministic command whenever the changed behavior can be represented as a system invariant.
- Do not start `npm run dev` by default. For automated visual inspection, build first and then use the user-approved `npm run preview` endpoint on `0.0.0.0:4174`. The preview may remain running between inspections and should only be stopped for a port conflict, an explicit user request, or another concrete need.

## Daily core, affected tests and full audit

用户于 2026-09-26 明确要求减少重复验证、日常只保留核心。命令职责如下：

- `npm run test:systems`：14 组核心，覆盖启动节奏、基础战斗/成长、存档与双人隔离、关卡终态、受击/环境结算、共享英雄/怪物/宠物生命周期和玩家流程。清单唯一 owner 为 `tools/system-test-suites.mjs`。
- `npm run test:systems -- --core <专项名...>`：核心与受影响专项合并，同名组只执行一次。只传专项名则只执行指定项，保留现有设计门禁的显式清单语义。
- `npm run test:systems -- --list` / `--full --list`：只看计划，不执行测试。
- `npm run check:code`：日常核心与构建；已分别通过就不再补跑本命令。
- `npm run test:systems:full`：原 88 组完整系统回归；`check:code:full` 额外含全部在册真值校验和构建，`check:all` 再含完整 workflow 与结构检查。全量语义保留，不用核心结果冒充全量。

日常移出的 74 组保留原断言。它们按改动触发，不是取消验证；核心 14 组也不是彼此完全不重叠。旧 `system-tests` 仍含独有基础合同，未证明被替代前保留。后续新增测试优先覆盖新行为/边界/真实反例；多个参数仅在能区分不同行为分支时保留，纯重复排列可在证明等价后合并。不得仅为减少用例数删掉失败反例或缩小宣称的原版一致性范围。

| 改动范围 | 核心以外应选择的验证 |
| --- | --- |
| 文档/状态说明 | workflow；源码输入未变不重跑游戏测试和 build |
| 测试调度/runner | `test:test-selection`、harness 与受改动工具测试；纯清单变更可复用同批不变的测试执行结果 |
| 某关刷怪、门、遍历、Boss | 对应 stage flow/traversal/专项目标；不默认重扫全部资源 |
| 共享宠物 AI/移动/时钟/碰撞/结算 | 相应 decision/clock/runtime 专项及受影响家族；不能只用玄龟生命周期代表所有家族 |
| 商店、技能、背包、工坊等具体业务 | 对应 formal/transaction 专项；完整 journey 不能替代该业务边界 |
| 纹理、atlas、catalog、bundle、资源路径 | 对应 resource/presentation/ownership 专项及受影响状态视觉检查 |
| 真值、Schema、生成器或源输入 | 对应 Schema、坏数据反例及必要源复验；普通业务修改不重放全部原版采样 |
| 首次交付、跨系统大改、影响不清或任务明确要求完整验收 | 对应完整回归/设计/浏览器验收；同批相同输入成功结果仍只取得一次 |

“只测一次”的单位是同一批次中未变化的相关代码、测试、fixture、资源、配置与环境。改了其中一项就重测受影响项；失败或未运行结果不能复用。跨命令是否复用由执行者核对已有日志/结果，工具不提供永久免检缓存，也不新增检查台账。计划好一条包含核心与专项的命令，执行后不再为了收尾格式追加 `check:all`。

## 校验结果读取

### 检查范围与失败收敛

- **按风险分层，不逐层重复矩阵。** 执行前在已有任务记录或进度说明中简述“本次风险、对应检查、复用结果”，不新增计划表或门禁。确定性规则优先由系统测试证明；浏览器验证实际接线及必须观察的表现。同步调用顺序已在底层覆盖时，不默认再做场景×帧率×角色×宠物的完整浏览器组合；只有该维度存在不同生产路径、时序/渲染风险或明确合同要求时才展开。必须保留真实反例和适用视觉状态；不得静默缩减已明确的验收合同，也不自动继承无关历史全量验收。
- **跨命令先去重，再补缺项。** 先核对必需门禁的测试清单，优先运行必需的设计门禁，再补未覆盖的核心/受影响专项；不默认叠加全量回归。相同测试仅在相关代码、测试、fixture、资源、配置与环境均未变且已有成功证据时复用。工具不支持结果复用时，必需硬门禁仍须取得真实退出码，不能手工宣称跳过部分后的门禁通过；减少可选的重叠命令，不为此在功能任务中建设缓存框架。
- **同类失败第二次出现后，停止重跑完整旅程，转最小诊断。** 先定位失败阶段，区分产品断言、测试驱动和环境问题；用最小复现验证原因及修复，再恢复受影响验收。单次偶发故障可原样重试一次；之后不得仅换等待时长、重复截图或重新启动整套矩阵。只有相关输入变化、具体环境恢复或新诊断证据才能支持再次执行；保留失败记录，不以重试次数耗尽判通过，也不因此停止整个任务。
- **验收工具维修显式有界。** 等待资源就绪、修正探针和截图等直接阻塞本次验收的局部修复可继续，但须说明工具故障与产品结果的区别，先用一个失败样本验证工具恢复。若需要新增框架、重建资源加载/导航机制或扩大到无关场景，按现有规模与拆分规则处理，不隐式并入小功能；保留已通过结果及精确未验收项，不靠降低断言关闭任务。

完整日志本地保存，读取摘要时保留真实退出码、范围、重要告警/跳过及路径；失败按错误窄读，证据不足则展开。已核对且相关输入未变的同批结果可引用，不降低断言、合同或人工视觉要求。[MO-004](methods/MO-004-校验摘要与按需诊断.md)第三批因指标不足停止量化试验，不再要求常规任务统计字符或采样；上述质量规则不代表已证明token节省。[PG-019](problems/PG-019-校验结果模型读取成本缺少约束.md)保持复盘中。

## System Test Triggers

Add or update `tools/system-tests.ts` when a change touches any of these areas:

- hit de-duplication, damage events, target identity, or projectile hit cadence;
- monster spawning, level gates, stop points, boss triggers, or clear conditions;
- player input mapping, skill slots, skill binding, MP gates, or combo state;
- state machines where an empty frame, multiple entities, or repeated key press can alter the result.

## Problem Governance Feedback Gate

- Before handing off any code, architecture, game-task, or workflow change, run `npm run audit:problems` and inspect the generated packet against the current diff.
- Each `PG-*` owns explicit applicability triggers and a closing contract. Record normal results once in `docs/workflow/problem-audit.md`; the same evidence may count as both an MO sample and a PG closing sample.
- A `复发` or `方案不充分` result must change the problem status and remediation plan; a closed problem must be reopened.
- A `通过` result must immediately evaluate every remaining closing gate. Archive the PG in the same handoff when all gates pass; method success alone is not enough.
- Effectiveness review must cover both remaining legacy instances and new-code recurrence. Passing system tests alone is not evidence that a governance solution worked.
- Handoffs must report which `PG-*` records were applicable, the centralized record location, and any archive decision, or state that the applicability scan found no matching problem.

## Task Size Budget Gate

- Every unfinished task definition must declare `规模预算` and an actionable `拆分触发`; new tasks must expect 0 context compactions.
- A task may contain at most two main work packages and two independently closable acceptance batches. A task that exceeds either cap must be split before activation.
- Compaction is not a stopping or splitting condition. Count independently deliverable work packages and acceptance batches, not skills, test commands, states, player slots or individual contracts. Follow `task-generation.md` for family-sized delivery and actual scope changes.
- `npm run check:workflow` validates these fields, rejects embedded definitions in the lightweight board, and rejects missing, orphaned, or mislinked task-definition files.

## Reverse Engineering Evidence Gate

Validation frequency and reuse:

- During implementation, run affected tests. At delivery, run the daily core plus affected specialized tests and build once against the final relevant inputs; use full regression only for the triggers above. Later document-only edits do not invalidate code results.
- Before invoking a composite gate, inspect its constituents and choose one invocation covering the required set. Reuse only successful results for unchanged code, tests, fixtures, resources, configuration and environment; changed or uncertain inputs require rerunning affected checks. Failed checks never count as passed dependencies.
- Browser comparisons against `dist` require a build of current source; mutations must be restored before accepting a normal run. This is same-batch reuse, not a new permanent cache or per-check report.
- Unchanged source truth and visual baselines may be referenced. Changes to animation, collision, damage, lifecycle or presentation require affected-state regression; family integration still covers the complete declared contract set.
- Save long command output locally and report exit codes, useful counts and failures. Do not reload successful logs or unchanged documents merely to narrate a handoff.
- For turtle development, prefer the explicit pet gate `--iteration` mode or a focused behavior test while editing; use the full gate once when closing the batch. Full source/resource/browser evidence is required on its first delivery and after relevant changes, not after every small behavior edit. Iteration results are never acceptance results.
- Report test groups, visual states, host-tick phases, collision cases and pixels as different units. Large automatic sample counts are not independent reviews; return one summary and a few failing examples, not per-state logs. A high count cannot establish coverage of an untested semantic dimension such as decision phase.

- Any implementation claiming original-game parity must cite an on-disk evidence matrix governed by `docs/workflow/reverse-engineering-protocol.md`; chat summaries are not implementation evidence.
- Level-local AS3 is insufficient when shared input, physics, camera, state-machine, save, or result systems consume the data. The real shared call path must be traced before implementation.
- Visual and spatial claims must identify coordinate space, registration point, collision bounds, nested transforms, and the modern asset origin. Raw `x/y` values cannot be assumed to mean feet, center, or top-left.
- Applicable UI, visual, and spatial implementation must consume a schema-valid, provenance-backed **original machine-truth JSON** from `docs/reverse-engineering/ground-truth/`, or a reproducible generated artifact derived from it. Hand-copied coordinates in prose, TypeScript, and CSS are not three independent truths.
- Inference, unknowns, and modern design choices must remain visibly distinct from confirmed original facts. Unsupported convenience thresholds or constants are rejected.
- `已复现` requires both deterministic contract tests and runtime observation for applicable visuals, held input, camera motion, timing, and combined paths.

## UI Native Fidelity Gate

- UI/HUD/menu implementation must consume an on-disk **显示列表清单**, `verified` **原版机器真值 JSON**, and **原版视觉基准** governed by `reverse-engineering-protocol.md`.
- A flattened page image is not a complete UI reconstruction. Nested children, depth, transforms, masks, filters, TextFields, dynamic `addChild` content, button states, and hit areas must be mapped or explicitly marked unknown.
- New visible rectangles, panels, titles, labels, generic buttons, dim layers, or status copy are rejected when the original already provides that visual, unless the task's **允许的现代视觉例外** lists the exact element and user approval.
- Visual completion requires same-size reference comparison, applicable normal/hover/pressed/selected and dynamic states, and a reviewable object-level difference list. Route tests, zero console errors, and business tests prove function but do not prove UI fidelity.
- Position and size checks must measure the rendered DOM/Canvas result, normalize it back to original stage coordinates, and compare it to the machine-truth objects and states; validating only literals or resource counts is insufficient.
- Static searches for `rectangle` or `text` are only risk locators; reviewers must distinguish original dynamic slots from unauthorized replacement visuals.

## Architecture Gates

- When the user explicitly invokes concrete-system design, the design task must follow `docs/workflow/system-design-protocol.md`, create/link one current `docs/architecture/system-designs/<system>.md`, freeze its roles, entry paths, consumers, extensions, forbidden bypasses, and acceptance contract, then hand implementation conformance to the separate acceptance protocol. This gate must not self-trigger from code shape alone.
- Once a task is linked to a concrete design whose acceptance status is not complete and has not exited, every implementation/review batch must follow `docs/workflow/system-design-acceptance-protocol.md`, record batch evidence and remaining consumers/legacy paths, and keep repeating until all system-level conformance gates pass. The completion batch must mark the acceptance as exited; later ordinary work must not keep design-pattern-specific checks in the default gate or reopen the acceptance automatically.
- Concrete-system conformance is hard-gated by `npm run check:system-design -- <system> <gate>`: the tool checks required classes/methods, dependency and consumer paths, forbidden legacy code, then runs the system-specific behavior contract and formal regression tests. A nonzero exit cannot be overridden by prose. Completion requires the `all` gate to return zero; this command is intentionally not part of `check:all`, so exited systems are no longer checked automatically.
- Every damageable or interactable runtime entity must have a stable ID. Array index, display object identity, and localized label text are not valid IDs.
- `src/scenes/` may create Phaser objects and schedule systems, but complex combat, level, skill, inventory, save, or AI rules belong in `src/systems/`.
- If a scene method begins to coordinate more than one domain rule, extract a system function before adding the next feature on top of it.
- Avoid marking a vertical slice complete when the only verification is screenshot or manual play.

## Structural Gates

Enforced by `npm run check:structure` (`tools/check-structure.mjs`). Agents must consult this check before adding logic to an existing file.

### File size limits

| Location | Warn at | Error at | Rule |
|---|---|---|---|
| `src/systems/*.ts` | 800 lines | 1,500 lines | Split before adding features. Error = must split first. |
| `src/scenes/*.ts` | 600 lines | 1,200 lines | Split before adding features. Error = must split first. |
| `src/scenes/test-scene/*Bridge.ts` | 800 lines | 1,200 lines | Transitional scene bridges get a higher warning threshold, but must not absorb domain rules. |
| `tools/*.ts` | 6,000 lines | 10,000 lines | Test files are more tolerant but still subject to splitting. |

### Code duplication

- When three or more code blocks within a single file share the same structural fingerprint, the check flags them.
- A "structural fingerprint" normalizes identifiers, string literals, and numeric constants — identical logic with different variable names still counts.
- Resolution: extract a shared helper function or parameterize the repeated pattern.

### Shared definition ownership

Before defining shared data tables, formulas, or pure helper functions, agents must search for an existing owner module.

- Shared definitions include cross-role or cross-system data tables, damage formulas, MP tables, level clamps, skill-slot input helpers, distance helpers, and any business rule that already has a modern definition elsewhere.
- If an owner already exists, reuse or extend it instead of copying the definition into the current file.
- If no owner exists but two or more consumers are expected, create an owner module first and import from it.
- Keep single-skill or single-role definitions local only when they are genuinely local; names or comments should make that locality clear.
- Review must reject new duplicate definitions of shared rules. Passing `npm run test:systems` is not enough for this class of issue; use targeted `rg` searches or review evidence.

### Scene import coupling

- A scene importing more than 10 system files triggers a warning (God-object risk).
- A scene importing more than 15 system files is an error (must extract orchestration or view factories).

### Scene boundary documentation

- Any scene file over 300 lines must document what it does NOT own in a top-of-file comment.

### How to resolve structural warnings

1. Run `npm run check:structure` before starting a task.
2. If the file you plan to edit has an error, split it first — extract one responsibility cluster into a new file under `src/systems/` or `src/scenes/test-scene/`.
3. If the file has only a warning, prefer splitting before feature work. For typo fixes, comments, or narrow bug fixes, keep the edit local and mention why no split was needed.
4. Keep `npm run build` green throughout the split.
5. Re-run `npm run check:structure` to confirm errors are cleared and warnings are understood.

## Git Gates

- Keep the project in a Git repository before substantial AI edits.
- Before large edits, check `git status --short`.
- After verification, review `git diff --stat` and the focused diff before committing or pushing.
- Do not commit `node_modules/`, `dist/`, `.tmp/`, or local log files.

# `src/` 模块边界约定

本文约束现代 TypeScript/Phaser 代码的模块边界。它补充 `docs/reverse-engineering/modern-architecture.md`，不替代具体实现任务。

## 目录职责

现代代码命名必须遵循 `docs/domain/glossary.md`。如果需要新增核心领域类型、系统、实体或数据模型，先按 `docs/domain/ubiquitous-language-process.md` 更新统一语言。

- `src/main.ts`
  - 只负责创建 Phaser `Game`，注册场景和全局配置。
  - 不写玩法逻辑。

- `src/scenes/`
  - Phaser 场景层。
  - 负责生命周期、显示对象创建、调试 UI 和系统调度。
  - 不直接承载复杂战斗规则、伤害结算、存档或角色 AI。

- `src/systems/`
  - 可测试的游戏系统。
  - 负责输入、战斗、移动、碰撞、资源调度等相对独立逻辑。
  - 系统应尽量暴露明确输入/输出，避免直接依赖全局单例。

- `src/core/`
  - 共享基础配置、常量、轻量上下文和跨系统类型。
  - 不放具体角色、怪物或关卡内容。

- `src/assets/`
  - 现代资源 manifest 和资源键。
  - 不直接复制或重生成 `extracted_flash/` 原始提取结果。

## `TestScene` / sandbox 增长约束

- `TestScene.ts` 是集成验证场景，不作为最终正式游戏架构承载点。
- 新增切片如果预计会在 `TestScene.ts` 增加超过约 150 行代码，先判断是否应抽到 `src/scenes/test-scene/` helper 或 `src/systems/`。
- 同一类职责第二次出现时优先抽 helper：视图创建、调试键、命中桥接、UI 面板桥接、运行时查询、系统调度。
- 不为“彻底架构化”做大重构；每次只拆一个职责簇，并保持 `npm run build` 通过。
- `src/scenes/test-scene/` helper 仍属于场景桥接层，可以依赖 Phaser；不要把 Phaser 显示对象传入 `src/systems/`。

## 逆向与实现边界

- AS3 类名可以写入注释或映射文档，但不要照搬 AS3 类结构。
- 原版全局状态、时间轴耦合、重复创建对象和手写内存管理只作为反面参考。
- 新代码保留可观察行为：键位、流程、动作、数值、手感和外观。
- 复杂规则先在 `docs/reverse-engineering/*.md` 确认，再进入 `src/`。

## 输入系统约束

- 正式输入必须支持 P1/P2 两套玩家输入。
- 方向键归 P2，不得驱动 P1。
- 当前 `InputSystem.ts` 仍是技术验证遗留，正式修正由 `TASK-ARCH-001` 完成。

## TypeScript 与 Phaser 约定

- 保持 `strict`、`noUnusedLocals`、`noUnusedParameters`。
- Phaser 生命周期中暂时不用的参数使用 `_` 前缀，例如 `_time`。
- 如果一个生命周期参数长期不需要，可以省略参数；只有 Phaser 签名或可读性需要时才保留 `_` 参数。
- 不通过关闭 TypeScript 严格项来规避未使用参数问题。

## 校验

- 修改任务、工作流或模块边界文档后，运行 `npm run check:workflow`。
- 修改 `src/` 后，优先运行 `npm run build`；如果依赖未安装或无法运行，需要说明原因。

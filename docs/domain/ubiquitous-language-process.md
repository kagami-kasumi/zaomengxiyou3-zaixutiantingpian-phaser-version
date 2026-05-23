# 统一语言维护流程

本文维护轻量 DDD/统一语言的更新规则。目标是让自然语言概念、文档术语和现代代码命名保持一致，降低跨对话漂移。

## 适用范围

需要遵循本文的情况：

- 新增 `src/` 中的实体、系统、配置、数据模型或核心类型。
- 新增逆向文档中的现代命名建议。
- 新增任务时需要引入新的领域概念。
- 发现同一概念在文档或代码中出现多个名称。

不需要遵循本文的情况：

- 只记录 AS3 原始类名、字段名或方法名。
- 引用原版资源文件名。
- 临时说明文字，不会进入现代代码或任务定义。

## 更新流程

1. 先查 `docs/domain/glossary.md`。
2. 如果概念已存在，使用“推荐代码名”，不要新增同义词。
3. 如果概念不存在，判断它属于哪个上下文：`Input`、`Runtime`、`Combat`、`Progression`、`Save`、`Content`。
4. 在 `glossary.md` 新增一行，填写中文概念、推荐代码名、类型、上下文、说明和禁止别名。
5. 如果新概念会影响代码边界，同步更新 `docs/architecture/src-boundaries.md`。
6. 如果新概念会影响任务或机制，任务中使用已有 `M-*` / `VS-*`，必要时先更新 `mechanics-index.md`。
7. 修改后运行 `npm run check:workflow`。
8. 如果这是脚手架/语言体系维护，更新 `docs/workflow/governance-log.md`。

## 命名规则

- 实体、值对象、系统、配置和数据模型使用英文 PascalCase。
- 变量和函数使用 camelCase。
- 文件名遵循现有 TypeScript 风格；一个核心领域类型通常一个文件。
- 现代代码名以 `glossary.md` 的“推荐代码名”为准。
- 中文文档可以保留中文概念，但第一次出现时建议写明推荐代码名。

## 禁止规则

- 不要因为 AS3 原名叫 `Role`，就在现代代码中继续使用 `Role` 表示玩家角色；现代推荐名是 `Hero`。
- 不要把 `Enemy`、`Mob`、`Monster` 混用；现代推荐名是 `Monster`。
- 不要把 `Ability`、`Spell`、`Skill` 混用；现代推荐名是 `Skill`。
- 不要把 `Bag`、`Backpack`、`Inventory` 混用；现代推荐名是 `Inventory`。
- 不要把 AS3 `BaseObject` 直接变成现代 `BaseObject` 基类；现代推荐名是 `GameObjectModel`，且是否需要基类要由实现任务判断。

## 例外处理

允许出现禁止别名的情况：

- AS3 证据引用，例如 `Role1.as`、`BaseObject.as`、`Bullet` 类。
- 解释为什么不用某个旧名。
- `glossary.md` 的“禁止别名”列。
- `ubiquitous-language-process.md` 的规则说明。

如果现代代码确实需要使用禁止别名，必须先更新 `glossary.md`，说明原因，并运行校验。

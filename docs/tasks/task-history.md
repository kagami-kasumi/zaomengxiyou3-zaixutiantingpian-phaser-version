# 游戏任务历史

本文记录已完成的游戏复现任务和执行记录。新对话默认不读取本文。

只有以下情况需要读取：

- 用户要求回看历史任务。
- 当前任务要修改以前完成的内容。
- 需要确认某个任务为什么完成或当时做了什么。
- 当前任务的依赖或冲突需要追溯历史决策。

## 已完成任务

| Task | 类型 | 目标 | 目标机制/切片 | 产物 |
| --- | --- | --- | --- | --- |
| TASK-001 | 逆向 | AS3 入口和运行时索引 | 主流程、世界主循环、BaseObject | `runtime-index.md` |
| TASK-002 | 工程 | Phaser + TypeScript 技术脚手架 | VS-000 | `package.json`、`src/`、`modern-architecture.md` |
| TASK-SETTINGS-001 | 逆向 | 操作和玩法总览 | 双人、键位、keyarray、主流程 | `controls-index.md`、`gameplay-index.md` |
| TASK-ARCH-001 | 架构 | 双玩家输入系统修正 | VS-001、M-008、M-009 | `InputSystem.ts`、`TestScene.ts`、`vertical-slices.md`、`mechanics-index.md` |
| TASK-SETTINGS-002 | 逆向 | 五个角色动作和技能索引 | VS-002、M-017、M-023、M-024、M-025 | `roles-index.md` |
| TASK-SETTINGS-002A | 逆向 | 五个角色基础身份和输入入口索引 | VS-002、M-017、M-024 | `roles-index.md`、`mechanics-index.md`、`vertical-slices.md`、`task-board.md` |
| TASK-SETTINGS-002B | 逆向 | 五个角色普攻连段索引 | VS-002、M-023 | `roles-index.md`、`mechanics-index.md`、`vertical-slices.md`、`task-board.md` |
| TASK-SETTINGS-002C | 逆向 | 五个角色技能槽和技能效果索引 | VS-002、M-015、M-025 | `roles-index.md`、`mechanics-index.md`、`vertical-slices.md`、`task-board.md` |
| TASK-SETTINGS-003 | 逆向 | 第一个关卡和刷怪流程索引 | VS-007、M-014、M-026、M-027、M-028 | `levels-index.md`、`mechanics-index.md`、`vertical-slices.md`、`task-board.md` |
| TASK-SETTINGS-004A | 逆向 | `BaseMonster` 基础索引 | VS-005、M-030 | `monsters-index.md`、`mechanics-index.md`、`vertical-slices.md`、`task-board.md` |
| TASK-SETTINGS-004B | 逆向 | 扫描怪物候选并选简单怪物 | VS-005、M-030、M-031 | `monsters-index.md`、`mechanics-index.md`、`vertical-slices.md`、`task-board.md` |
| TASK-SETTINGS-004C | 逆向 | `Monster30` 详细索引 | VS-005、M-031、M-032 | `monsters-index.md`、`mechanics-index.md`、`vertical-slices.md`、`task-board.md` |
| TASK-SETTINGS-004 | 逆向 | 怪物基础索引 | VS-005、M-030、M-031 | `monsters-index.md` |
| TASK-SLICE-002 | 切片 | 第一只怪物受击死亡切片 | VS-005、M-030、M-031、M-032 | `Monster30System.ts`、`TestScene.ts`、`vertical-slices.md`、`mechanics-index.md` |
| TASK-SETTINGS-005 | 逆向 | 五角色普攻特效资源索引 | VS-004、M-023、M-035、M-047 | `attack-effects-index.md`、`roles-index.md`、`mechanics-index.md`、`vertical-slices.md` |
| TASK-ARCH-002 | 架构 | 资源索引和加载策略 | M-035 | `assets-index.md`、`AssetManifest.ts`、`mechanics-index.md`、`vertical-slices.md` |
| TASK-SETTINGS-006 | 逆向 | 首个角色移动细节索引 | VS-003、M-011、M-012、M-013 | `movement-index.md`、`mechanics-index.md`、`vertical-slices.md` |
| TASK-SLICE-003 | 切片 | 第一个角色移动切片 | VS-003、M-011、M-012、M-013 | `HeroMovementSystem.ts`、`TestScene.ts`、`vertical-slices.md`、`mechanics-index.md` |
| TASK-SLICE-001 | 切片 | 五角色普攻与特效切片 | VS-004、M-023、M-047 | `HeroNormalAttackSystem.ts`、`TestScene.ts`、`AssetManifest.ts`、`vertical-slices.md`、`mechanics-index.md` |
| TASK-SETTINGS-007 | 逆向 | 基础互伤规则索引 | VS-006、M-032、M-033 | `combat-rules-index.md`、`mechanics-index.md`、`vertical-slices.md`、`task-board.md` |
| TASK-SLICE-004 | 切片 | 基础伤害闭环实现 | VS-006、M-032、M-033 | `CombatSystem.ts`、`HeroCombatSystem.ts`、`Monster30System.ts`、`TestScene.ts`、`vertical-slices.md`、`mechanics-index.md` |
| TASK-SETTINGS-008 | 逆向 | 子弹/技能飞行物规则索引 | VS-008、M-034 | `projectiles-index.md`、`combat-rules-index.md`、`roles-index.md`、`mechanics-index.md`、`vertical-slices.md` |
| TASK-SLICE-005 | 切片 | 第一个技能/子弹切片 | VS-008、M-025、M-034 | `ProjectileSystem.ts`、`TestScene.ts`、`AssetManifest.ts`、`vertical-slices.md`、`mechanics-index.md` |
| TASK-SETTINGS-009 | 逆向 | 技能资源/弹体素材定位 | M-034、M-035、VS-008 | `projectiles-index.md`、`assets-index.md`、`mechanics-index.md`、`vertical-slices.md`、`task-board.md` |
| TASK-SLICE-006 | 切片 | 第二个技能/移动 projectile 切片 | M-025、M-034、M-035、VS-008 | `ProjectileSystem.ts`、`TestScene.ts`、`AssetManifest.ts`、`vertical-slices.md`、`mechanics-index.md` |
| TASK-SLICE-007 | 切片 | Role2 `smb` 二段 projectile 切片 | M-025、M-034、M-035、VS-008 | `ProjectileSystem.ts`、`TestScene.ts`、`AssetManifest.ts`、`vertical-slices.md`、`mechanics-index.md` |
| TASK-SETTINGS-010 | 逆向 | 正式技能输入、MP 与重入边界索引 | M-015、M-016、M-025、M-041、VS-008 | `skills-input-index.md`、`roles-index.md`、`projectiles-index.md`、`mechanics-index.md`、`vertical-slices.md`、`task-board.md` |
| TASK-SLICE-008 | 切片 | 正式技能槽驱动 Role2 首批技能 | M-015、M-025、M-041、VS-008 | `HeroSkillSystem.ts`、`TestScene.ts`、`mechanics-index.md`、`vertical-slices.md`、`task-board.md` |
| TASK-SETTINGS-011 | 逆向 | 完整技能 UI、学习绑定和存档字段索引 | M-016、M-041、M-044、VS-008 | `skills-input-index.md`、`mechanics-index.md`、`vertical-slices.md`、`task-board.md` |
| TASK-SLICE-009 | 切片 | 最小正式技能 UI/技能槽显示与可配置 loadout | M-016、M-041、VS-008 | `SkillUISystem.ts`、`TestScene.ts`、`mechanics-index.md`、`vertical-slices.md`、`task-board.md` |
| TASK-SETTINGS-012 | 逆向 | 补 VS-007 前置资源/地图索引 | M-026、M-027、M-028、VS-007 | `levels-index.md`、`assets-index.md`、`mechanics-index.md`、`vertical-slices.md`、`task-board.md` |
| TASK-SLICE-011 | 切片 | VS-007 boss 区 + Monster3 + 传送门通关闭环 | M-014、M-028、M-030、VS-007 | `Monster3System.ts`、`LevelSystem.ts`、`TestScene.ts`、`mechanics-index.md`、`vertical-slices.md`、`task-board.md` |
| TASK-SLICE-010 | 切片 | 扩展完整技能学习/升级 UI（心法树、升级、拖拽绑定、被动技能） | M-041、M-016、VS-008 | `SkillUISystem.ts`、`HeroSkillSystem.ts`、`TestScene.ts`、`mechanics-index.md`、`vertical-slices.md` |
| TASK-SLICE-012 | 切片 | 扩展 VS-007 完整纵向爬升关（云层、周期刷 Monster30、停点系统、多波次） | M-027、M-028、VS-007 | `LevelSystem.ts`（扩展）、`TestScene.ts`、`mechanics-index.md`、`vertical-slices.md` |

## 已完成任务定义

### TASK-001

完成定义：

- 找到 AS3 主入口、核心运行时对象和世界更新链路。
- 记录 `BaseObject` 级别的生命周期、更新入口和现代重写建议。
- 标注原代码中不应照搬的低质量结构。

已完成产物：

- `docs/reverse-engineering/runtime-index.md`

### TASK-002

完成定义：

- 建立 Phaser + TypeScript 工程骨架。
- 建立基础 scene、资源 manifest、测试输入显示。
- 文档说明当前脚手架只是技术验证，不代表正式玩法。
- 不执行复杂依赖安装；需要用户手工安装时说明。

已完成产物：

- `package.json`
- `tsconfig.json`
- `vite.config.ts`
- `index.html`
- `src/`
- `docs/reverse-engineering/modern-architecture.md`

### TASK-SETTINGS-001

完成定义：

- 确认原版支持单人和本地双人。
- 确认方向键属于玩家 2。
- 确认 P1/P2 基础键位、技能键和 UI 快捷键。
- 确认 `keyarray = [下, 普攻, 跳跃, 上]`。
- 更新机制表和纵向切片表。

已完成产物：

- `docs/reverse-engineering/controls-index.md`
- `docs/reverse-engineering/gameplay-index.md`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/vertical-slices.md`

### TASK-ARCH-001

完成定义：

- 将现代输入系统改成显式双玩家结构。
- P1 默认使用原版 P1 键位，不占用方向键。
- P2 默认使用方向键和数字键区/原版 P2 键位。
- `TestScene` 能同时显示 P1/P2 输入状态，且方向键只影响 P2。

已完成产物：

- `src/systems/InputSystem.ts`
- `src/scenes/TestScene.ts`
- `docs/tasks/vertical-slices.md`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/task-board.md`

### TASK-SETTINGS-002A

完成定义：

- 建立 `docs/reverse-engineering/roles-index.md` 初版。
- 列出五个角色的 AS3 类名、显示名或可识别身份。
- 记录每个角色的构造入口、资源/动画前缀线索、`myKeyDown()` 或等价输入入口。
- 汇总每个角色支持的组合键骨架，只记录入口和触发条件，不展开完整技能效果。
- 标注不确定项和需要后续细读的类/方法。

已完成产物：

- `docs/reverse-engineering/roles-index.md`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/vertical-slices.md`
- `docs/tasks/task-board.md`

### TASK-SETTINGS-002

完成定义：

- 该任务拆为 `TASK-SETTINGS-002A`、`TASK-SETTINGS-002B`、`TASK-SETTINGS-002C` 分阶段执行。
- 子任务覆盖五个角色身份、输入入口、组合键、普攻连段和技能分发。
- `roles-index.md` 能推荐第一个实现角色、第一个普攻动作和第一个技能候选。

已完成产物：

- `docs/reverse-engineering/roles-index.md`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/vertical-slices.md`
- `docs/tasks/task-board.md`

### TASK-SETTINGS-002B

完成定义：

- 基于 `roles-index.md` 初版继续细读五个角色的 `normalHit()` 或等价普攻入口。
- 记录每个角色普攻连段、触发键、状态切换、冷却/间隔、可作为第一切片的攻击动作。
- 将 `TASK-SETTINGS-002C` 标为可执行或说明仍阻塞的原因。

已完成产物：

- `docs/reverse-engineering/roles-index.md`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/vertical-slices.md`
- `docs/tasks/task-board.md`

### TASK-SETTINGS-002C

完成定义：

- 基于 `roles-index.md` 继续细读 `showSkill()`、技能槽、技能名、消耗和角色技能入口。
- 记录每个角色至少一个可作为最小战斗切片候选的技能。
- 给后续 `TASK-SLICE` 推荐第一个角色和第一个攻击动作。

已完成产物：

- `docs/reverse-engineering/roles-index.md`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/vertical-slices.md`
- `docs/tasks/task-board.md`

### TASK-SETTINGS-003

完成定义：

- 读取关卡、地图、`StageListener` 或等价流程入口。
- 建立 `docs/reverse-engineering/levels-index.md` 初版。
- 找到第一个适合现代最小战斗切片的地图或场景。
- 记录进入战斗、刷怪、通关/失败的关键入口。

已完成产物：

- `docs/reverse-engineering/levels-index.md`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/vertical-slices.md`
- `docs/tasks/task-board.md`

### TASK-SETTINGS-004A

完成定义：

- 建立 `docs/reverse-engineering/monsters-index.md` 初版。
- 记录怪物基础字段、生命周期、AI 更新、受击、死亡、掉落触发入口。
- 记录与 `BaseObject`、碰撞、主循环的关系。

已完成产物：

- `docs/reverse-engineering/monsters-index.md`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/vertical-slices.md`
- `docs/tasks/task-board.md`

### TASK-SETTINGS-004B

完成定义：

- 扫描主参考源码中的怪物候选。
- 选出 3-5 个依赖少、适合作为第一个现代切片怪物的候选。
- 在 `monsters-index.md` 记录候选类名、依赖复杂度、攻击方式、推荐排序。
- 更新本看板，把 `TASK-SETTINGS-004C` 指向最推荐的第一个怪物。

已完成产物：

- `docs/reverse-engineering/monsters-index.md`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/vertical-slices.md`
- `docs/tasks/task-board.md`

### TASK-SETTINGS-004C

完成定义：

- 细读 `Monster30.as`。
- 记录移动、索敌、攻击、碰撞、受击、死亡、掉落或清理入口。
- 给后续最小战斗切片提供怪物侧验收依据。

已完成产物：

- `docs/reverse-engineering/monsters-index.md`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/vertical-slices.md`
- `docs/tasks/task-board.md`

### TASK-SETTINGS-004

完成定义：

- 通过 `TASK-SETTINGS-004A`、`TASK-SETTINGS-004B`、`TASK-SETTINGS-004C` 分阶段完成怪物基础索引。
- 子任务覆盖怪物基类、候选选择和首选怪物 `Monster30` 详细索引。

已完成产物：

- `docs/reverse-engineering/monsters-index.md`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/vertical-slices.md`
- `docs/tasks/task-board.md`

### TASK-SLICE-002

完成定义：

- 在现代测试场景中生成一只可见的 `Monster30` 等价怪物，初始 HP 为 150。
- 怪物具备最小 AI：选择玩家目标、向玩家靠近、接近后进入攻击/暂停攻击状态。
- 玩家调试攻击能命中怪物，命中后扣 HP 并显示受击反馈。
- HP 归零后进入死亡状态，死亡延时结束后从显示和更新列表中移除。
- `npm run build` 通过，并同步更新切片表与机制表。

已完成产物：

- `src/systems/Monster30System.ts`
- `src/scenes/TestScene.ts`
- `docs/tasks/vertical-slices.md`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/task-board.md`

### TASK-SETTINGS-005

完成定义：

- 逐个确认五个角色普攻动作 `hit*` 是否生成普攻特效、残影、弹体或额外显示对象。
- 建立五角色普攻动作到特效资源、类名和 `BitmapDataPool` 名称的映射。
- 检查现有 `extracted_flash/resources` 是否已有可用 CG/位图资源；若缺失，列出明确缺口和需要用户手工补提取的资源名或符号名。
- 明确 `TASK-SLICE-001` 实现时角色普攻特效的临时占位策略。

已完成产物：

- `docs/reverse-engineering/attack-effects-index.md`
- `docs/reverse-engineering/roles-index.md`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/vertical-slices.md`
- `docs/tasks/task-board.md`

### TASK-ARCH-002

完成定义：

- 建立 `docs/reverse-engineering/assets-index.md`。
- 记录资源命名、角色/怪物/场景资源线索和现代加载策略。
- 明确现有导出的 CG/位图资源是否足够支持五角色普攻特效；不足时列出需用户手工补提取的资源类型。
- 更新现代 asset manifest 的结构建议；若实现代码，只做加载策略骨架。

已完成产物：

- `docs/reverse-engineering/assets-index.md`
- `src/assets/AssetManifest.ts`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/vertical-slices.md`
- `docs/tasks/task-board.md`

### TASK-SETTINGS-006

完成定义：

- 细读双击跑步、跳跃、`S+K` 下落和平台穿透判定入口。
- 记录首个移动切片需要的时间窗、速度/状态切换、角色差异、平台类型与不确定项。
- 明确 `VS-003` 是否已经可以进入实现；若仍不够，列出具体缺口而不是笼统写“继续研究”。

已完成产物：

- `docs/reverse-engineering/movement-index.md`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/vertical-slices.md`

### TASK-SLICE-003

完成定义：

- 在现代测试场景中生成一个可控的 Role2 等价角色。
- 使用原版 P1 键位实现行走、同向双击跑步、双跳和 `S+K` 下落平台。
- 至少提供一个可验证的普通地面和一个 `ThroughWall` 等价测试平台。
- 输入结构继续保留 P1/P2；本切片可以只生成 P1。
- `npm run build` 通过，并同步更新切片表与机制表。

已完成产物：

- `src/systems/HeroMovementSystem.ts`
- `src/scenes/TestScene.ts`
- `docs/tasks/vertical-slices.md`
- `docs/reverse-engineering/mechanics-index.md`

### TASK-SLICE-001

完成定义：

- 五个角色的普攻作为同一个实现子任务完成，不拆成五个角色任务。
- 每个角色 J 普攻能触发与 `roles-index.md` 一致的普攻动作、连段、冷却和状态切换。
- 每个角色普攻都有可见特效；缺原始资源时使用文档认可的临时占位，并保留缺资源清单。
- 攻击窗口可调试显示，后续可接入怪物受击。
- `npm run build` 通过，并同步更新切片表与机制表。

已完成产物：

- `src/systems/HeroNormalAttackSystem.ts`
- `src/assets/AssetManifest.ts`
- `src/scenes/TestScene.ts`
- `docs/tasks/vertical-slices.md`
- `docs/reverse-engineering/mechanics-index.md`

### TASK-SETTINGS-007

完成定义：

- 建立 `combat-rules-index.md`，记录玩家攻击怪物、怪物攻击玩家的 AS3 调用链和关键字段。
- 明确 `BaseBullet.checkAttack()`、`beMagicAttack()`、`beAttackIdArray`、`setAttackBack()`、`beAttackDoing()` 等入口在首个互伤切片中的取舍。
- 给出 `VS-006` 所需的最小现代实现边界：伤害事件、命中去重、受击反馈、死亡/保护或硬直的首批规则。
- 如果某个细节仍需后续任务，必须写成明确缺口，不能只写“继续研究”。
- `npm run check:workflow` 通过，并同步更新切片表与机制表。

已完成产物：

- `docs/reverse-engineering/combat-rules-index.md`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/vertical-slices.md`
- `docs/tasks/task-board.md`

### TASK-SLICE-004

完成定义：

- 在现代测试场景中为玩家加入可观察 HP、受击状态、短保护或等价命中去重。
- 玩家普攻命中 `Monster30` 时走统一伤害事件或等价结算路径，不再只是临时直接扣血。
- `Monster30 hit1` 生成占位攻击窗口，命中玩家时造成 `power = 15` 的物理伤害、触发受击反馈和可观察 HP 变化。
- 玩家和怪物死亡状态都可观察；首批不接复活/失败 UI。
- 命中去重避免同一攻击实例同一帧或短时间内重复扣同一目标。
- `npm run build` 通过，并同步更新切片表、机制表和任务历史。

已完成产物：

- `src/systems/CombatSystem.ts`
- `src/systems/HeroCombatSystem.ts`
- `src/systems/HeroNormalAttackSystem.ts`
- `src/systems/Monster30System.ts`
- `src/scenes/TestScene.ts`
- `docs/tasks/vertical-slices.md`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/task-board.md`

### TASK-SETTINGS-008

完成定义：

- 建立 `projectiles-index.md`，记录 `BaseBullet` 生命周期、来源绑定、目标选择、命中检测、命中去重和 `attackInterval` 重复命中规则。
- 细扒 `Role2.sgq -> hit5` 的技能入口、动作、`SpecialEffectBullet("Role2Bullet5")` 创建点和攻击参数。
- 明确 `VS-008` 首个技能/子弹切片的现代实现边界：固定位置 projectile、`DamageEvent` 复用、16 帧命中周期和真实资源缺口。
- 同步更新 `mechanics-index.md`、`vertical-slices.md` 和 `task-board.md`，把下一步推荐切到首个实现切片。
- `npm run check:workflow` 通过。

已完成产物：

- `docs/reverse-engineering/projectiles-index.md`
- `docs/reverse-engineering/combat-rules-index.md`
- `docs/reverse-engineering/roles-index.md`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/vertical-slices.md`
- `docs/tasks/task-board.md`

### TASK-SLICE-005

完成定义：

- 用现代系统实现一个 `Role2.sgq -> hit5` 等价调试释放入口，不接正式技能 UI。
- 创建 `skill-projectile.role2.sgq.hit5` 占位特效，生成点约为角色前方 175、上方 110。
- projectile 生命周期独立于一帧 hitbox，并在结束、来源受击/死亡或场景清理时释放。
- projectile 命中 `Monster30` 时通过 `DamageEvent` 结算，标记 `attackKind = magic`、击退 `[5,-2]`。
- 支持 `hitIntervalFrames = 16` 的重复命中去重：同一命中周期同一目标只结算一次，下一周期可再次结算。
- `npm run build` 与 `npm run check:workflow` 通过，并同步更新切片表、机制表和任务历史。

已完成产物：

- `src/systems/ProjectileSystem.ts`
- `src/scenes/TestScene.ts`
- `src/assets/AssetManifest.ts`
- `docs/domain/glossary.md`
- `docs/reverse-engineering/projectiles-index.md`
- `docs/tasks/vertical-slices.md`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/task-board.md`

### TASK-SETTINGS-009

完成定义：

- 定位并记录 `Role2Bullet5` 与 `Role2_hit5` 在当前导出资源中的状态；若不存在，写明已查证范围和缺口原因。
- 从 `export/bullet/` 与已导出资源中补一批下一步有价值的弹体/技能飞行物映射，至少包含类名、资源名、运动类型、来源动作或使用方、首批是否适合实现。
- 更新 `assets-index.md` 中技能 projectile 资源族的真实资源/缺失状态，使后续资源接入任务不用重新翻查同一批目录。
- 更新 `mechanics-index.md` 的 `M-034`、`M-035` 逆向/复现状态和下一步建议。
- 归档本任务并推荐下一个可执行任务。

已完成产物：

- `docs/reverse-engineering/projectiles-index.md`
- `docs/reverse-engineering/assets-index.md`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/vertical-slices.md`
- `docs/tasks/task-board.md`

### TASK-SLICE-006

完成定义：

- 在现代测试场景中为 Role2 等价角色增加一个可调试释放的第二技能入口，对应原版 `skill_smb()` 的第一段 `hit4_1`。
- 实现 `EnemyMoveBullet("Role2Bullet4_1")` 的首批等价行为：按角色朝向以水平速度约 `10` 移动，距离上限按原版 `9999` 处理为足够长的生命周期，使用 `hit4` 攻击参数。
- 生成 projectile 时保留原版关键差异：素材来源名是 `Role2Bullet4_1`，但实例名/兼容标记为 `Role1Bullet4_1`，以便后续二段 `hit4_2` 查找。
- projectile 命中 `Monster30` 时通过现有 `DamageEvent` 结算，标记 `attackKind = magic`，击退 `[0,-3]`，并按现有命中去重规则避免同一攻击周期重复扣血。
- 在 `AssetManifest.ts` 登记稳定占位 key `skill-projectile.role2.smb.hit4_1`，状态标为缺真资源或占位。
- 更新 `vertical-slices.md` 与 `mechanics-index.md` 的复现状态和下一步建议。

已完成产物：

- `src/systems/ProjectileSystem.ts`
- `src/scenes/TestScene.ts`
- `src/assets/AssetManifest.ts`
- `docs/tasks/vertical-slices.md`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/task-board.md`

### TASK-SLICE-007

完成定义：

- 在现代测试场景中支持 `Role2.smb` 二段调试释放：第一段 `hit4_1` projectile 存在时，再按对应技能键可触发 `hit4_2`，而不是重新生成第一段。
- `ProjectileSystem` 为 `hit4_1` 保留可供二段读取的位置，等价于 AS3 中查找运行时名 `Role1Bullet4_1` 并写入 `hit4_2Point`。
- 二段生成 `SpecialEffectBullet("Role2Bullet4_2")` 的占位 projectile，位置以第一段记录点为基准，纵向上移约 `320`，横向按朝向偏移约 `50`，使用 `hit4` 攻击参数和当前 `DamageEvent`/命中去重模型。
- 在 `AssetManifest.ts` 登记稳定占位 key `skill-projectile.role2.smb.hit4_2`。
- 更新 `vertical-slices.md` 与 `mechanics-index.md` 的复现状态和下一步建议。

已完成产物：

- `src/systems/ProjectileSystem.ts`
- `src/scenes/TestScene.ts`
- `src/assets/AssetManifest.ts`
- `docs/reverse-engineering/projectiles-index.md`
- `docs/reverse-engineering/assets-index.md`
- `docs/tasks/vertical-slices.md`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/task-board.md`

### TASK-SETTINGS-010

完成定义：

- 建立正式技能输入索引，说明 `KeyBoardControl` 如何把 P1/P2 技能键映射到 `BaseHero.sendSkill(index)` 与 `showSkill(key)`。
- 记录 `User.skillbykey`、`returnSkillNameBySkillKey()`、技能学习/绑定 UI 的最小字段和边界，明确调试释放如何过渡到正式技能槽。
- 记录 MP 消耗、技能重入门禁、冷却或可再次触发的依据；若原版没有统一冷却模型，要按角色/技能写明证据。
- 明确 `Role2.sgq` 与 `Role2.smb` 在正式输入中的技能槽、MP、重入规则，以及现代实现下一步最小改造范围。
- 更新 `M-015`、`M-016`、`M-025`、`M-041` 和 `VS-008` 的状态或下一步。

已完成产物：

- `docs/reverse-engineering/skills-input-index.md`
- `docs/reverse-engineering/roles-index.md`
- `docs/reverse-engineering/projectiles-index.md`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/vertical-slices.md`
- `docs/tasks/task-board.md`

### TASK-SLICE-008

完成定义：

- 为测试场景中的 Role2 等价角色建立最小正式技能 loadout：槽 0 绑定 `sgq`，槽 1 绑定 `smb`，槽 2..4 为空。
- 技能释放必须从双玩家输入的普通技能槽 `0..4` 进入；Space/小键盘 0 与 H/小键盘 7 不接普通技能。
- `sgq` 只有在绑定、MP 足够、未攻击且未受击时释放；成功释放扣 MP 并复用现有 `hit5` projectile。
- `smb` 第一段只有在绑定、MP 足够、站立/落地条件满足、未受击且不处于其他攻击时释放；成功释放扣 MP 并复用现有 `hit4_1` projectile。
- `smb` 在 `hit4_1` 内再次按同一绑定槽时，如第一段 projectile 仍活跃且未触发二段，应释放 `hit4_2` 且不再次扣 MP。
- 空槽、MP 不足、受击、死亡或不允许的攻击状态下按技能键无效果。
- 更新 `M-015`、`M-025`、`M-041` 与 `VS-008` 的复现状态或下一步。

已完成产物：

- `src/systems/HeroSkillSystem.ts`
- `src/scenes/TestScene.ts`
- `docs/domain/glossary.md`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/vertical-slices.md`
- `docs/tasks/task-board.md`
- `docs/tasks/task-history.md`

### TASK-SETTINGS-011

完成定义：

- 确认技能学习 UI 如何写入 `User.isstudyskill`、`User.skillbykey`、技能等级和绑定键。
- 确认拖拽绑定 UI 如何替换五个普通技能槽，并记录 P1/P2 显示键与实际键值转换。
- 确认 `GameInfo` 技能相关快捷键、按钮派发和战斗输入屏蔽边界。
- 从存档相关源码中定位技能学习、技能槽绑定、MP 或角色属性的持久化字段；若字段仍不够，列出明确缺口。
- 给后续实现任务写清楚最小现代数据模型建议，但不实现 UI 或存档代码。

已完成产物：

- `docs/reverse-engineering/skills-input-index.md`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/vertical-slices.md`
- `docs/tasks/task-board.md`
- `docs/tasks/task-history.md`

### TASK-SLICE-009

任务类型：

- `TASK-SLICE`

目标机制/切片：

- `M-016` UI 快捷键
- `M-041` 技能学习/绑定
- `VS-008` 一个技能/子弹（扩展 UI 侧）

完成定义：

- 实现五槽技能 UI 可视化（显示绑定技能和键位标签）。
- 实现可配置 loadout：按键轮换切换槽位绑定。
- 保留 V 键打开技能面板的快捷键（占住键位，不实现完整 SkillControl UI）。
- 技能 UI 刷新与 `HeroSkillSystem` 的 loadout 保持同步。

已完成产物：

- `src/systems/SkillUISystem.ts`
- `src/scenes/TestScene.ts`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/vertical-slices.md`
- `docs/tasks/task-board.md`

### TASK-SETTINGS-012

任务类型：

- `TASK-SETTINGS`

目标机制/切片：

- `M-026` 关卡类命名
- `M-027` 地图标记
- `M-028` 第一个关卡
- `VS-007` 第一个关卡闭环

完成定义：

- 确认 `1-1` boss 区（Monster3）的 SWF 时间轴对象位置、传送门显示条件和碰撞区域。
- 确认地图背景资源在 `extracted_flash/` 中的实际路径或标记为缺口。
- 标记 `1-1` 实现的最小数据需求（出生点、平台标记、刷怪触发、通关条件）。

已完成产物：

- `docs/reverse-engineering/levels-index.md`
- `docs/reverse-engineering/assets-index.md`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/vertical-slices.md`
- `docs/tasks/task-board.md`

### TASK-SLICE-011

任务类型：

- `TASK-SLICE`

目标机制/切片：

- `M-014` 上/交互/通关
- `M-028` 第一个关卡
- `M-030` 怪物系统
- `VS-007` 第一个关卡闭环

完成定义：

- 实现 Monster3 boss 行为：追踪最近玩家、hit1 普攻（power=40 physics）、hit2 技能（power=18 magic，CD 2s/4s，距离 < 200 触发）。
- 实现 boss 区触发：玩家到达触发区 → boss 激活。
- 实现传送门通关：boss HP 归零 → 传送门可见 → 玩家碰撞 + 按上 → 显示通关。
- 使用手工作标和占位图形，不等待真实 SWF 场景资源。

已完成产物：

- `src/systems/Monster3System.ts`
- `src/systems/LevelSystem.ts`
- `src/scenes/TestScene.ts`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/vertical-slices.md`
- `docs/tasks/task-board.md`

### TASK-SLICE-010

任务类型：

- `TASK-SLICE`

目标机制/切片：

- `M-041` 技能学习/绑定
- `M-016` UI 快捷键
- `VS-008` 一个技能/子弹

完成定义：

- 实现心法树 UI 面板（5 角色 × 2 心法树 × 5 技能，共 50 技能完整配置）。
- 实现技能学习流程（心法树解锁机制、技能上限 10、自动分配空槽绑定）。
- 实现技能升级流程（双消耗公式：特殊技能上限 9 级/普通 18 级、角色等级门禁、灵魂消耗）。
- 实现键盘驱动绑定交互（五槽分配、面板选技绑定，等价于拖拽操作）。
- 实现被动技能五槽 UI（等级上限 floor(heroLevel/5)、消耗公式）。

已完成产物：

- `src/systems/SkillUISystem.ts` — 完整数据模型和逻辑：50 技能联合类型、5 角色心法树配置、技能学习/升级/绑定/被动技能状态管理与函数、面板 UI 状态类型。
- `src/systems/HeroSkillSystem.ts` — `SkillName` 类型扩展为全 50 技能联合类型；未实现技能返回 "not implemented" 结果。
- `src/scenes/TestScene.ts` — 心法树面板 overlay（460×470）、键盘驱动交互（Tab 切树/1-5 选技/B 绑定/U 升级/L 学习/G 升树/P 被动）、双玩家独立技能学习状态。
- `docs/reverse-engineering/mechanics-index.md` — 更新 M-041、M-016 复现状态。
- `docs/tasks/vertical-slices.md` — 更新 VS-008 实现记录。

验证：

- `npm run build` 通过。
- `npm run check:workflow` 通过。

### TASK-SLICE-012

任务类型：

- `TASK-SLICE`

目标机制/切片：

- `M-027` 地图标记（停点、刷怪点）
- `M-028` 第一个关卡
- `VS-007` 第一个关卡闭环

完成定义：

- 实现纵向爬升（镜头跟随玩家上移、云层/背景视差）。
- 实现周期刷怪（单人每 6s 刷 2 只 Monster30、双人 4 只）。
- 实现停点系统（到达停点暂停刷怪、清完当前波次后解锁继续上移）。
- 保留 boss 区触发和通关闭环（VS-007 现有功能）。

已完成产物：

- `src/systems/LevelSystem.ts`（扩展）
- `src/scenes/TestScene.ts`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/vertical-slices.md`
- `docs/tasks/task-board.md`
- `docs/tasks/task-history.md`

验证：

- `npm run build` 通过。
- `npm run check:workflow` 通过。

## 执行记录

### TASK-SLICE-009

完成时间：

- 2026-05-23

完成内容：

- 新增 `src/systems/SkillUISystem.ts`，提供 `SkillUIState`（`skillPanelOpen`、`selectedSlotIndex`）、`cycleSlotBinding()` 轮换绑定函数和 `SkillSlotKeyLabels`（P1 Y/L/U/I/O、P2 8/3/4/5/6）。
- 更新 `src/scenes/TestScene.ts`，接入五槽技能栏 `SkillBarView`：每槽显示键位标签和绑定技能名（含等级），高亮选中槽位；P1 技能栏位于左下 (x=44, y=540)，P2 技能栏位于右下 (x=488, y=540)。
- Z 键（P1）/ 小键盘 +（P2）轮换当前选中槽位的绑定（null → sgq → smb → null），然后自动移到下一槽。
- V 键（P1）/ 小键盘 -（P2）切换技能面板占位开关，显示 `[V] panel open` 指示器。
- 技能栏每帧与 `HeroSkillModel.loadout` 同步刷新；切角色时重置 loadout 后自动反映在技能栏上。
- `npm run build` 和 `npm run check:workflow` 均通过。

更新文件：

- `src/systems/SkillUISystem.ts`
- `src/scenes/TestScene.ts`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/vertical-slices.md`
- `docs/tasks/task-board.md`
- `docs/tasks/task-history.md`

验证：

- `npm run build` 通过。
- `npm run check:workflow` 通过。

### TASK-SETTINGS-012

完成时间：

- 2026-05-23

完成内容：

- 细读 `Monster3.as` 全源码，记录完整 boss 数据：HP 926/400（boss/非boss）、horizenSpeed 4、attackRange 150、def 5、mDef 0.2。
- 记录 Monster3 攻击数据：hit1（power=40 physics，子弹 Monster3Bullet1，x±105, y-60，帧3/count1）、hit2（power=18 magic，子弹 Monster3Bullet2，x±155, y-30，帧3/count26）、skillCD1 [48,96] 帧（2s/4s）。
- 记录 Monster3 动画行：wait(0)/walk(1)/hurt(2)/dead(3)/hit1(4)/hit2(5)，帧大小 180x180，偏移 (20,-5)。
- 确认 `destroy()` override：如果 `isBoss == true`，遍历 `gc.pWorld.getTransferDoorArray()` 全部设为 `visible = true`。
- 细读 `StageListener11.as` 全源码，记录 boss 区触发条件：任一玩家 `y <= -1900` → 其他玩家/宠物传送 `y = -1950` → 镜头 tween 到 `y = 2370`（2s）→ `callBoss()` 生成 Monster3 在 `(750, -2050)`。
- 确认传送门机制：`PhysicsWorld.addSubObj()` 读取 SWF 场景中 `isTransferDoor` 子节点，非 `curStage == 0` 时初始隐藏，boss 死亡后显示。
- 检索 `extracted_flash/resources` 全部 76 个 SWF 导出目录：`sl11`/`bg11`/`floorBg1`/`Monster3` 位图和子弹资源均不在当前导出中；`assets-index.md` 新增 VS-007 资源缺口确认表。
- `levels-index.md` 新增「Monster3 详细数据」和「VS-007 实现数据汇总」两个完整章节，标记资源缺口和最小实现策略（手工坐标 + 占位图形）。
- 更新 `M-026`（关卡类命名）、`M-027`（地图标记）、`M-028`（第一个关卡）的下一步为已确认状态；VS-007 从「待机制」更新为「可开始」。

更新文件：

- `docs/reverse-engineering/levels-index.md`
- `docs/reverse-engineering/assets-index.md`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/vertical-slices.md`
- `docs/tasks/task-board.md`
- `docs/tasks/task-history.md`

验证：

- `npm run check:workflow` 通过。

### TASK-SLICE-011

完成时间：

- 2026-05-23

完成内容：

- 新增 `src/systems/Monster3System.ts`，实现 Monster3 boss 完整数据模型：HP 926、地面追踪 AI、hit1（physics 40 dmg，hitbox x±105 y-60，120×90，500ms）和 hit2（magic 18 dmg，hitbox x±155 y-30，140×100，800ms）、skill CD（CD1=2s、interval=4s）、hit1 决策率 42%/1s、受击（250ms 硬直）、死亡（1s → removed）。
- Monster3 攻击通过 `Monster3ActiveAttack` 携带 `attackId`、`damage`、`attackKind`、`knockbackX/Y`，hitbox 通过 `getMonster3AttackHitbox()` 按攻击帧窗口暴露给 `CombatSystem`。
- 新增 `src/systems/LevelSystem.ts`，实现 boss 区状态机：`inactive → active → cleared`。`checkBossArenaTrigger()` 检测玩家到达触发区 Y，`activateBossArena()` 生成 Monster3，`tryClearArena()` 检查传送门碰撞 + 按上判定通关，`revealTransferDoor()` 在 boss 死亡后显示传送门。
- `src/scenes/TestScene.ts` 新增完整 boss 区切片：arena 平台（step1 y=280 solid、floor y=200 solid）、触发区（y=180 line）、boss 激活后追踪玩家并执行 hit1/hit2、boss 受击/死亡/removed、传送门（黄色矩形 120×140）、按上通关显示 `[CLEAR!]` 覆盖层。
- `applyBossAttack()` 在 Monster3 hit1/hit2 的攻击窗口内对范围内玩家生成 `DamageEvent`，走 `CombatSystem` 统一命中去重；`applyPlayerHitOnBoss()` 让玩家普攻和技能 projectile 也可命中 boss。
- `applyProjectileHits()` 扩展为同时检测 Monster30 和 boss 命中（修复了 boss 命中检测错误嵌套在 Monster30 if 块内的 bug）。
- 所有坐标和图形均使用手工作标和占位矩形/文本，不依赖真实 SWF 场景资源。
- 未实现：完整纵向爬升、云层、周期刷 Monster30、停点系统、掉落、难度修正、暴击、闪避、存档。

更新文件：

- `src/systems/Monster3System.ts`
- `src/systems/LevelSystem.ts`
- `src/scenes/TestScene.ts`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/vertical-slices.md`
- `docs/tasks/task-board.md`
- `docs/tasks/task-history.md`

验证：

- `npm run build` 通过。
- `npm run check:workflow` 通过。

### TASK-SETTINGS-001

完成内容：

- 确认原版支持单人和本地双人。
- 确认方向键属于玩家 2。
- 确认 P1/P2 基础键位、技能键和 UI 快捷键。
- 确认 `keyarray = [下, 普攻, 跳跃, 上]`。

更新文件：

- `docs/reverse-engineering/controls-index.md`
- `docs/reverse-engineering/gameplay-index.md`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/vertical-slices.md`

### TASK-ARCH-001

完成时间：

- 2026-05-13

完成内容：

- 新增 `PlayerSlot`、`PlayerInputState`、`InputState` 和 `InputBindings`，输入系统每帧返回 `p1`/`p2` 两套状态。
- P1 绑定 A/D/S/W/J/K、Y/L/U/I/O、Space、H；P2 绑定方向键、小键盘 1/2/8/3/4/5/6/0/7。
- `TestScene` 改为双玩家输入状态显示场景，不再用方向键驱动 P1 占位角色。
- `VS-001` 标为已完成，`M-008`、`M-009` 标为已复现。

更新文件：

- `src/systems/InputSystem.ts`
- `src/scenes/TestScene.ts`
- `docs/tasks/task-board.md`
- `docs/tasks/vertical-slices.md`
- `docs/reverse-engineering/mechanics-index.md`

验证：

- `npm run build` 通过。

### TASK-SETTINGS-002A

完成时间：

- 2026-05-13

完成内容：

- 建立五个角色索引：`Role1` 孙悟空/悟空、`Role2` 唐僧、`Role3` 八戒、`Role4` 沙僧、`Role5` 白龙。
- 确认角色选择从 `SelectRole` 的 `btn1` 至 `btn5` 写入 `player1/player2.roleid`。
- 确认角色创建入口在 `Config.createHero()`，并记录 `keyboardControl.setRole1/2()` 接入输入控制。
- 记录 `BaseHero.executeKeyCode()` 使用 `keyarray.join("")` 调用各角色 `myKeyDown()`。
- 汇总 `0100`、`1100`、`0010`、`1010`、`0110`、`0001`、`0101` 的组合键骨架。
- 将 `TASK-SETTINGS-002B` 改为 `Ready`，作为下一推荐任务。

更新文件：

- `docs/reverse-engineering/roles-index.md`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/vertical-slices.md`
- `docs/tasks/task-board.md`
- `docs/tasks/task-history.md`

验证：

- `npm run check:workflow` 通过。

### TASK-SLICE-008

完成时间：

- 2026-05-19

完成内容：

- 新增 `src/systems/HeroSkillSystem.ts`，把 Role2 首批技能从场景调试入口收敛为固定五槽技能模型：槽 0 绑定 `sgq`，槽 1 绑定 `smb`，槽 2..4 为空。
- 按 `skills-input-index.md` 记录的 1 级公式实现 MP 门禁：`sgq` 消耗 49 MP，`smb` 消耗 107 MP；测试角色初始 MP 160，成功释放才扣 MP。
- `src/scenes/TestScene.ts` 改为扫描 `InputSystem` 的普通技能槽 `0..4`，Space/小键盘 0 与 H/小键盘 7 不触发普通技能。
- `sgq` 只有在已绑定、MP 足够、未死亡/受击、未普攻且没有技能动作/projectile 活跃时释放，继续复用 `Role2Bullet5` 等价 projectile。
- `smb` 第一段要求绑定、MP 足够、站立落地、未死亡/受击、未普攻且没有其他技能动作；成功后扣 MP 并生成 `hit4_1`。
- `smb` 第二段只允许在同一绑定槽、`hit4_1` 动作中、第一段 projectile 仍活跃且未触发二段时重入，生成 `hit4_2` 且不重复扣 MP、不重建第一段。
- 测试场景状态文本显示 MP、五槽 loadout、当前技能动作、最近技能释放和拦截原因，便于观察空槽、MP 不足、受击/死亡或攻击状态下无效果。
- 更新 `M-015` 为已复现，`M-041` 为部分复现；`VS-008` 记录正式技能槽、MP 门禁和二段重入已完成。
- 新增下一推荐任务 `TASK-SETTINGS-011`，用于继续逆向完整技能 UI、学习/拖拽绑定和存档字段。

更新文件：

- `src/systems/HeroSkillSystem.ts`
- `src/scenes/TestScene.ts`
- `docs/domain/glossary.md`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/vertical-slices.md`
- `docs/tasks/task-board.md`
- `docs/tasks/task-history.md`

验证：

- `npm run build` 通过；Vite 仍提示现有 chunk 超过 500 kB。
- `npm run check:workflow` 通过。

### TASK-SLICE-006

完成时间：

- 2026-05-19

完成内容：

- 扩展 `src/systems/ProjectileSystem.ts`，把 projectile 模型从固定位置特效推进到可水平移动：新增速度、剩余距离、运行时兼容名等字段，并新增 `spawnRole2SmbProjectile()`。
- 实现 `Role2.smb -> hit4_1` 的首批等价行为：生成点按角色前方约 200、下方约 10，朝面向以每帧约 10 像素移动，攻击参数为 `magic`、击退 `[0,-3]`、`hitMaxCount = 100`、`attackInterval = 999`。
- 保留 AS3 关键差异：资源来源名为 `Role2Bullet4_1`，运行时兼容名为 `Role1Bullet4_1`，为后续 `hit4_2` 查找第一段 projectile 位置留钩子。
- 扩展 `src/scenes/TestScene.ts`，Role2 等价角色按第二技能键可在地面释放 `smb hit4_1` 占位移动 projectile；命中 `Monster30` 时继续走 `DamageEvent` 和现有命中去重。
- 扩展 `src/assets/AssetManifest.ts`，登记 `skill-projectile.role2.smb.hit4_1`，并把 Role2 技能 projectile 缺口族扩到 `Role2Bullet4_1/Role1Bullet4_1/Role2Bullet4_2/Role2_hit4`。
- 更新 `VS-008`、`M-025/M-034/M-035` 状态说明，并新增后续 Ready 任务 `TASK-SLICE-007`。

更新文件：

- `src/systems/ProjectileSystem.ts`
- `src/scenes/TestScene.ts`
- `src/assets/AssetManifest.ts`
- `docs/tasks/vertical-slices.md`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/task-board.md`
- `docs/tasks/task-history.md`

验证：

- `npm run build` 通过；Vite 提示 chunk 超过 500 kB，为现有打包体积提示。
- `npm run check:workflow` 通过。

### TASK-SETTINGS-004B

完成时间：

- 2026-05-13

完成内容：

- 静态扫描 `export/monster/Monster*.as`，按文件长度、boss 分支、技能入口、召唤、飞行、销毁覆写和弹体复杂度筛选候选。
- 重点阅读 `Monster7`、`Monster8`、`Monster30`、`Monster55`、`Monster56`、`Monster57`、`Monster61`、`Monster76`、`Monster77`、`Monster78`、`Monster113` 等短文件或早期关卡相关怪物。
- 在 `monsters-index.md` 记录候选推荐排序：首选 `Monster30`，地面备选 `Monster7`，其后为 `Monster8`、`Monster78`、`Monster77`。
- 说明不推荐 `Monster2/4/5/55/56/57/35/36/37/38` 作为首个现代怪物的原因。
- 将 `M-031` 标为部分已扒，并把 `TASK-SETTINGS-004C` 指向 `Monster30.as`。

更新文件：

- `docs/reverse-engineering/monsters-index.md`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/vertical-slices.md`
- `docs/tasks/task-board.md`
- `docs/tasks/task-history.md`

验证：

- `npm run check:workflow` 通过。

### TASK-SETTINGS-002B

完成时间：

- 2026-05-13

完成内容：

- 细读 `Role1.as` 至 `Role5.as` 的 `normalHit()`、`isNormalHit()` 和相关跑动/空中普攻入口。
- 记录五个角色的普攻触发键、地面连段、空中普攻、跑动普攻、连段窗口和冷却。
- 将 `Role2 hit1` 标为最小输入到攻击状态候选，将 `Role3` 地面第一段 `hit2` 标为近战候选。
- 将 `M-023` 标为已扒，并将 `TASK-SETTINGS-002C` 改为 `Ready`。

更新文件：

- `docs/reverse-engineering/roles-index.md`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/vertical-slices.md`
- `docs/tasks/task-board.md`
- `docs/tasks/task-history.md`

验证：

- `npm run check:workflow` 通过。

### TASK-SETTINGS-002C

完成时间：

- 2026-05-13

完成内容：

- 细读 `BaseHero.sendSkill()`、`KeyBoardControl` 技能键数组、`User.returnSkillNameBySkillKey()`、`Config.allSklName/findLhValueBySkillName()`。
- 细读 `Role1.as` 至 `Role5.as` 的 `showSkill()` 和对应 `skill_*()` 入口。
- 记录五个角色的技能代号、MP 消耗公式、入口动作/效果摘要，以及未实现或疑似被动/废弃的技能代号。
- 推荐 `Role2 唐僧` 作为第一个实现角色，`Role2 hit1` 作为第一个普攻动作，`Role2 sgq -> hit5` 作为第一个技能候选。
- 将 `VS-002` 标为已完成，`M-025` 标为部分已扒，并将 `TASK-SETTINGS-003` 改为当前推荐 Ready 任务。
- `TASK-SETTINGS-002` 的三个子任务已全部完成，同步归档父任务。

更新文件：

- `docs/reverse-engineering/roles-index.md`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/vertical-slices.md`
- `docs/tasks/task-board.md`
- `docs/tasks/task-history.md`

验证：

- `npm run check:workflow` 通过。

### TASK-SETTINGS-002

完成时间：

- 2026-05-13

完成内容：

- 通过 `TASK-SETTINGS-002A/002B/002C` 完成五个角色动作和技能索引拆分任务。
- 角色索引已覆盖身份、创建入口、资源线索、输入入口、组合键骨架、普攻连段、技能分发和第一切片候选。

更新文件：

- `docs/reverse-engineering/roles-index.md`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/vertical-slices.md`
- `docs/tasks/task-board.md`
- `docs/tasks/task-history.md`

验证：

- `npm run check:workflow` 通过。

### TASK-SETTINGS-003

完成时间：

- 2026-05-13

完成内容：

- 确认默认新档第一主线关是 `curStage = 1`、`curLevel = 1`，对应 `StageListener11/sl11/bg11`。
- 记录场景加载链路：`MainGame.GameStart()`、`MainGame.newGame()`、`BaseGameSence`、`PhysicsWorld.pWorldInit()`、`BaseLevelListenering.start()`。
- 记录 `PhysicsWorld.addSubObj()` 的墙体、传送门、停点、怪物出现点等地图标记识别方式。
- 确认 `1-1` 的刷怪和 boss 流程：周期性按玩家位置刷 `Monster30`，到顶部后 `callBoss()` 生成 `Monster3`。
- 确认 `Monster3` 在 `1-1` 中死亡后显示传送门，角色按上/交互通过 `LevelVictor` 和 `MainGame.levelClear()` 通关。
- 推荐后续第一个现代关卡切片先做 `1-1` boss 区窄切片，完整纵向爬升和随机飞行怪后续扩展。
- 将 `M-014`、`M-026`、`M-027`、`M-028` 标为已扒，并将下一推荐任务改为 `TASK-SETTINGS-004A`。

更新文件：

- `docs/reverse-engineering/levels-index.md`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/vertical-slices.md`
- `docs/tasks/task-board.md`
- `docs/tasks/task-history.md`

验证：

- `npm run check:workflow` 通过。

### TASK-SETTINGS-004A

完成时间：

- 2026-05-13

完成内容：

- 建立 `docs/reverse-engineering/monsters-index.md` 初版，记录 `BaseMonster` 字段、初始化、AI、受击、死亡、销毁和掉落入口。
- 确认怪物创建入口是 `MainGame.createMonster(kind, x, y)`，运行时由 `PhysicsWorld.step()` 更新 `monsterArray` 和怪物自己的 `magicBulletArray`。
- 确认 `BaseMonster.step()` 在 `BaseObject.step()` 基础上追加目标选择、追踪、普攻/技能触发、回血、技能冷却和 boss 受击条。
- 确认怪物受击入口是 `BaseMonster.beMagicAttack()`，由 `BaseBullet.checkAttack()` 命中后调用，并用 `beAttackIdArray` 避免同一攻击重复命中。
- 确认 HP 归零时先进入 `dead` 动作，具体怪物通常在死亡动画结束后调用 `dropAura()` 和 `destroy()`。
- 将 `M-030` 标为已扒，并把下一推荐任务改为 `TASK-SETTINGS-004B`。

更新文件：

- `docs/reverse-engineering/monsters-index.md`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/vertical-slices.md`
- `docs/tasks/task-board.md`
- `docs/tasks/task-history.md`

验证：

- `npm run check:workflow` 通过。

### TASK-SETTINGS-004C

完成时间：

- 2026-05-13

完成内容：

- 细读 `Monster30.as`、`StageListener11.as`、`BaseMonster.as`、`BaseObject.as`、`BaseBullet.as` 和 `SpecialEffectBullet.as`。
- 确认 `Monster30` 是第一主线关过程飞行怪：HP 150、水平速度 7、攻击范围 250、警戒范围 1000、普通攻击率 0.5。
- 记录 `StageListener11` 的刷怪规则：单人每轮 2 只、双人每轮 4 只，约每 6 秒在玩家上方生成。
- 记录 `Monster30` 动作映射：`wait/walk` 共用动画行，`hurt` 结束回 `wait`，`hit1` 在停顿计数 10 创建 `Monster30Bullet1`，`dead` 结束后 `dropAura()` 和 `destroy()`。
- 记录 `Monster30` 使用基类索敌、飞行追踪、受击、扣血、死亡和清理链路。
- 将 `M-031` 标为已扒，将 `VS-005` 标为可开始。
- 新增 `TASK-SLICE-002`，作为下一推荐任务。
- `TASK-SETTINGS-004A/004B/004C` 已覆盖父任务 `TASK-SETTINGS-004`，同步归档父任务。

更新文件：

- `docs/reverse-engineering/monsters-index.md`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/vertical-slices.md`
- `docs/tasks/task-board.md`
- `docs/tasks/task-history.md`

验证：

- `npm run check:workflow` 通过。

### TASK-SETTINGS-004

完成时间：

- 2026-05-13

完成内容：

- 通过三个子任务完成怪物基础索引：`004A` 确认基类和运行链路，`004B` 筛选首个怪物候选，`004C` 细扒 `Monster30`。
- `monsters-index.md` 已能支撑第一个怪物受击死亡切片的怪物侧验收。

更新文件：

- `docs/reverse-engineering/monsters-index.md`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/vertical-slices.md`
- `docs/tasks/task-board.md`
- `docs/tasks/task-history.md`

验证：

- `npm run check:workflow` 通过。

### TASK-SLICE-002

完成时间：

- 2026-05-15

完成内容：

- 新增 `src/systems/Monster30System.ts`，把 `Monster30.as` 的首切片事实整理成独立模型：HP 150、飞行追踪、攻击范围 250、受击、死亡和移除。
- 将 `src/scenes/TestScene.ts` 从纯输入验证扩展成怪物切片调试场景：保留 P1/P2 输入显示，生成一只占位 `Monster30`，显示目标、状态和 HP。
- 接入玩家临时攻击窗口；攻击命中时怪物进入 `hurt`，HP 归零后进入 `dead`，死亡延时后切到 `removed` 并从显示中移除。
- 保留本任务边界：怪物 `hit1` 只表现为状态，不提前实现对玩家造成伤害；掉落、经验、药品和 aura 继续后置。
- 将 `M-030` 标为部分复现，`M-031` 标为已复现，`M-032` 标为部分复现，`VS-005` 标为已完成。
- 将下一推荐任务切换为 `TASK-SETTINGS-005`。

更新文件：

- `src/systems/Monster30System.ts`
- `src/scenes/TestScene.ts`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/vertical-slices.md`
- `docs/tasks/task-board.md`
- `docs/tasks/task-history.md`

验证：

- `npm run build` 通过。
- `npm run check:workflow` 通过。

### TASK-SLICE-007

完成时间：

- 2026-05-19

完成内容：

- 扩展 `src/systems/ProjectileSystem.ts`，新增 `Role2.smb -> hit4_2` 等价二段 projectile：使用 `skill-projectile.role2.smb.hit4_2` 占位 key、来源符号和运行时名 `Role2Bullet4_2`，攻击参数沿用 `hit4` 的 `magic` 与 `[0,-3]` 击退。
- 为 `hit4_1` projectile 保留二段触发状态；第一段运行时名 `Role1Bullet4_1` 仍活跃且尚未触发二段时，第二技能键会读取第一段当前位置作为记录点。
- 扩展 `src/scenes/TestScene.ts` 的 Role2 技能门禁：第二技能键第一次生成 `hit4_1`，第一段存在时再次按键生成 `hit4_2`，不重建第一段。
- 在 `src/assets/AssetManifest.ts` 登记 `skill-projectile.role2.smb.hit4_2` 稳定 key；真资源仍按 `assets-index.md` 记录为缺失，需要后续补 `TangSeng` / `SpecialUI/TangSeng` 角色包。
- 更新 `projectiles-index.md`、`assets-index.md`、`VS-008` 与 `M-025/M-034/M-035` 状态说明，并把下一推荐任务切到 `TASK-SETTINGS-010`。

更新文件：

- `src/systems/ProjectileSystem.ts`
- `src/scenes/TestScene.ts`
- `src/assets/AssetManifest.ts`
- `docs/reverse-engineering/projectiles-index.md`
- `docs/reverse-engineering/assets-index.md`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/vertical-slices.md`
- `docs/tasks/task-board.md`
- `docs/tasks/task-history.md`

验证：

- `npm run build` 通过；Vite 仍提示现有 chunk 超过 500 kB。
- `npm run check:workflow` 通过。

### TASK-SETTINGS-009

完成时间：

- 2026-05-19

完成内容：

- 查证主包 `[172845].swf` 与备用包 `[25034429].swf` 的 `symbols.csv`、图片导出和全 `resources/` 路径/文本，确认 `Role2Bullet5` 与 `Role2_hit5` 当前没有可直接接入的真资源。
- 结合 `AssetsLoader.getRoleNameByID(2)`，确认 Role2 技能素材更可能来自运行时角色包 `TangSeng` 或 `SpecialUI/TangSeng`，不是当前主包导出的遗漏命名。
- 在 `projectiles-index.md` 补充 `Role2` 技能 projectile 映射：`sgq/hit5`、`xbz/hit3`、`smb/hit4_1/hit4_2`、`myhc/hit6`、`jgz/hit7`、`tjgl/shy/hit8`、`jhsj/hit9_*` 等，并标注运动类型和首批实现价值。
- 补充 Role1、Role3、Role4、Role5 的高价值 projectile 线索，记录 `EnemyMoveBullet`、`SpecialEffectBullet`、`StabBullet` 等可作为后续实现参考的资源名。
- 更新 `assets-index.md` 的技能 projectile 资源族状态，新增 `skill-projectiles-role2` 方向和稳定 key 建议。
- 将下一推荐任务切到 `TASK-SLICE-006`，目标是实现 `Role2.smb -> hit4_1` 的 `EnemyMoveBullet("Role2Bullet4_1")` 等价移动 projectile 占位切片。

更新文件：

- `docs/reverse-engineering/projectiles-index.md`
- `docs/reverse-engineering/assets-index.md`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/vertical-slices.md`
- `docs/tasks/task-board.md`
- `docs/tasks/task-history.md`

验证：

- `npm run check:workflow` 通过。

### TASK-SETTINGS-005

完成时间：

- 2026-05-15

完成内容：

- 细读 `Role1.as` 至 `Role5.as` 的普攻 `enterFrameFunc()`、`doHit*()`、`normalHit()` 路径，并对照 `BaseBullet`、`BaseBitmapDataPool`、`SpecialEffectBullet`、`FollowBaseObjectBullet`、`EnemyMoveBullet`。
- 新建 `attack-effects-index.md`，落表前四名角色的普攻附属对象、沙僧两种武器形态差异，以及白龙枪/剑两套普攻本体动作资源与附属对象。
- 确认 `[172845].swf` 当前导出的 `symbols.csv` 和 `images/` 不含这些普攻关键素材；把需要补提取的资源名整理成显式缺口清单。
- 识别白龙枪形态 `doSingleHit(...)` 为当前 AS3 反编译缺口：调用存在，但 helper 定义未恢复，因此 `M-047` 暂时只能从“未扒”推进到“部分已扒”。
- 为 `TASK-SLICE-001` 明确占位策略：保持稳定 key、区分角色/武器形态、先替换素材后替换代码。
- 将下一推荐任务切换为 `TASK-ARCH-002`，因为接下来最该做的是把已知缺口变成真实资源索引和加载方案。

更新文件：

- `docs/reverse-engineering/attack-effects-index.md`
- `docs/reverse-engineering/roles-index.md`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/vertical-slices.md`
- `docs/tasks/task-board.md`
- `docs/tasks/task-history.md`

验证：

- `npm run check:workflow` 通过。

### TASK-ARCH-002

完成时间：

- 2026-05-15

完成内容：

- 梳理 `AssetsLoader`、`BaseBitmapDataPool`、`BaseGameSence`、`PhysicsWorld` 和当前导出目录，确认原版按关卡、角色、特效分散加载，当前主包导出不足以直接承接首批战斗美术。
- 新建 `assets-index.md`，记录角色、首怪、首关的运行时命名族，明确五角色普攻资源、`Monster30` 和 `sl11/bg11/floorBg1` 仍缺真实素材。
- 将 `AssetManifest.ts` 扩展为状态化骨架：区分 `placeholder` 与 `missing-original`，登记首批缺失资源族，并保留当前唯一可执行的 `scaffold` bundle。
- 将 `M-035` 推进到“已扒/部分复现”，并把 `VS-004` 的资源前置从“还没策略”收束为“可先按稳定 key 占位，真素材后补”。
- 新增后续 Ready 任务 `TASK-SETTINGS-006`，转向补齐 `VS-003` 所需的移动细节。

更新文件：

- `docs/reverse-engineering/assets-index.md`
- `src/assets/AssetManifest.ts`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/vertical-slices.md`
- `docs/tasks/task-board.md`
- `docs/tasks/task-history.md`

验证：

- `npm run build` 通过。
- `npm run check:workflow` 通过。

### TASK-SETTINGS-006

完成时间：

- 2026-05-15

完成内容：

- 细读 `BaseHero.__keyBoardDown()`、`addDoubleCount()`、`jump()`、`BaseObject.getFallDown()`、`nearToWall()` 以及五角色移动入口。
- 新建 `movement-index.md`，明确原版跑步是 `< 500 ms` 同向双击、第二次按住期间维持；普通移动使用 `walk/run`，Role2 首切片速度可取 `6/10`。
- 记录双跳闭环：`jumpPower = -20`，`jump1 -> jump2 -> jump3`，落地后把 `jumpCount` 重置为 `0`。
- 确认 `S+K` 只会在 `ThroughWall` 上触发主动下穿；`ThroughUpButDownWall` 和 `FallDownWhenStandingWall` 不应在首切片里被一股脑当成同类平台。
- 将 `M-011/M-012/M-013` 都推进到“已扒”，把 `VS-003` 推进到“可开始”。
- 新增后续 Ready 任务 `TASK-SLICE-003`，让首个角色移动切片可以直接进入实现。

更新文件：

- `docs/reverse-engineering/movement-index.md`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/vertical-slices.md`
- `docs/tasks/task-board.md`
- `docs/tasks/task-history.md`

验证：

- `npm run check:workflow` 通过。

### TASK-SLICE-003

完成时间：

- 2026-05-15

完成内容：

- 新增 `src/systems/HeroMovementSystem.ts`，把首个角色移动切片整理成独立模型：Role2 等价速度、`wait/walk/run/jump1/jump2/jump3`、同向双击跑步、双跳、落地和 `ThroughWall` 下穿。
- 在 `src/scenes/TestScene.ts` 中生成可控 P1/P2 角色，加入普通地面和一个 `ThroughWall` 等价测试平台，并继续保留既有 `Monster30` 调试切片。
- 为角色移动加入测试场景横向边界，避免玩家离开画面后无法返回。
- 按原版事实处理关键手感：跑步只在 `< 500 ms` 同向双击后的第二次按住期间维持，`S+K` 下穿时把 `jumpCount` 置为 `1`。
- 将 `M-011/M-012/M-013` 标为已复现，`VS-003` 标为已完成，并把下一推荐任务切换为 `TASK-SLICE-001`。

更新文件：

- `src/systems/HeroMovementSystem.ts`
- `src/scenes/TestScene.ts`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/vertical-slices.md`
- `docs/tasks/task-board.md`
- `docs/tasks/task-history.md`

验证：

- `npm run build` 通过。
- `npm run check:workflow` 通过。

### TASK-SLICE-001

完成时间：

- 2026-05-19

完成内容：

- 新增 `src/systems/HeroNormalAttackSystem.ts`，实现五角色普攻状态：悟空五段、唐僧固定 `hit1`、八戒三段、沙僧铲/弓形态三段、白龙枪/剑形态四段，并覆盖跑动/空中普攻入口。
- 在 `src/assets/AssetManifest.ts` 登记五角色普攻占位特效稳定 key，保持与 `attack-effects-index.md` 的资源缺口清单可追踪。
- 扩展 `src/scenes/TestScene.ts`，P1/P2 可切换 Role1 至 Role5，普攻显示动作名、可见占位特效和攻击窗口，并能继续命中当前 `Monster30` 调试怪。
- 保留白龙枪形态 `doSingleHit(...)` 反编译缺口，不伪造原始资源名；现代侧使用 `normal-attack-effect.hero5.spear.unresolved` 占位。
- 将 `VS-004` 标为已完成，`M-023` 标为已复现，`M-047` 标为部分复现。
- 新增下一推荐任务 `TASK-SETTINGS-007`，用于逆向基础互伤规则并支撑后续 `VS-006`。

更新文件：

- `src/systems/HeroNormalAttackSystem.ts`
- `src/assets/AssetManifest.ts`
- `src/scenes/TestScene.ts`
- `docs/domain/glossary.md`
- `docs/tasks/task-board.md`
- `docs/tasks/vertical-slices.md`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/task-history.md`

验证：

- `npm run build` 通过。
- `npm run check:workflow` 通过。

### TASK-SETTINGS-007

完成时间：

- 2026-05-19

完成内容：

- 细读 `BaseBullet.checkAttack()`、`BaseObject.setAttackBack()/setYourFather()`、`BaseHero.beMagicAttack()/reduceHp()/beAttackDoing()`、`BaseMonster.beMagicAttack()/getRealHurt()/reduceHp()` 和 `Monster30` 攻击帧。
- 新建 `docs/reverse-engineering/combat-rules-index.md`，记录原版互伤链路：攻击 id、目标选择、命中去重、`attackBackInfoDict`、玩家/怪物受击、扣血、击退和保护。
- 明确首个 `VS-006` 实现边界：保留 `DamageEvent` 或等价结构、命中去重、玩家 HP/受击/短保护、`Monster30 hit1` 对玩家造成 `power = 15` 物理伤害；后置完整子弹系统、暴击、闪避、装备、boss 受击条、复活和联网/PK。
- 将 `M-032` 逆向状态标为已扒，`M-033` 逆向状态标为已扒。
- 将 `VS-006` 从待机制推进到可开始，并新增下一推荐 `TASK-SLICE-004`。

更新文件：

- `docs/reverse-engineering/combat-rules-index.md`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/vertical-slices.md`
- `docs/tasks/task-board.md`
- `docs/tasks/task-history.md`

验证：

- `npm run check:workflow` 通过。

### TASK-SLICE-004

完成时间：

- 2026-05-19

完成内容：

- 新增 `src/systems/CombatSystem.ts`，提供首批统一伤害事件 `DamageEvent`、`AttackKind`、`HitRegistry` 和按 `attackId -> targetId` 的命中去重函数。
- 新增 `src/systems/HeroCombatSystem.ts`，为玩家建立 HP、`ready/hurt/dead`、短保护、最近伤害事件和占位击退模型。
- 扩展 `src/systems/HeroNormalAttackSystem.ts`，让普攻实例携带 `attackKind`，玩家普攻命中 `Monster30` 时不再走临时直接扣血，而是先生成伤害事件。
- 扩展 `src/systems/Monster30System.ts`，让 `Monster30 hit1` 生成占位攻击窗口，命中玩家时造成 `power = 15`、`attackKind = physics`、击退 `[6, -5]` 的首批等价伤害。
- 扩展 `src/scenes/TestScene.ts`，显示玩家 HP/受击/死亡、怪物 HP/状态和最近伤害事件；死亡玩家不再移动、攻击或参与怪物目标选择。
- 将 `VS-006` 标为已完成，`M-032` 标为已复现，`M-033` 标为部分复现，并把下一推荐任务切换为 `TASK-SETTINGS-008`。

更新文件：

- `src/systems/CombatSystem.ts`
- `src/systems/HeroCombatSystem.ts`
- `src/systems/HeroNormalAttackSystem.ts`
- `src/systems/Monster30System.ts`
- `src/scenes/TestScene.ts`
- `docs/domain/glossary.md`
- `docs/tasks/task-board.md`
- `docs/tasks/vertical-slices.md`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/task-history.md`

验证：

- `npm run build` 通过。
- `npm run check:workflow` 通过。

### TASK-SETTINGS-008

完成时间：

- 2026-05-19

完成内容：

- 细读 `BaseBullet.as`、`export/bullet/`、`World/PhysicsWorld.as` 和 `Role2.as` 中 `sgq -> hit5` 的创建链。
- 新建 `docs/reverse-engineering/projectiles-index.md`，记录原版 projectile 生命周期、目标选择、命中检测、`attackInterval` 重复命中、命中去重和主要 `BaseBullet` 派生类。
- 确认首个技能切片依据：`Role2.showSkill()` 解析 `sgq` 后进入 `skill_sgq()`，动作 `hit5` 在角色前方约 175、上方约 110 创建 `SpecialEffectBullet("Role2Bullet5")`。
- 记录 `Role2 hit5` 攻击参数：`attackKind = magic`、`attackInterval = 16`、`hitMaxCount = 999`、击退 `[5,-2]`；现代侧应复用 `DamageEvent`，但需要 projectile 生命周期和按命中周期刷新的去重 key。
- 将 `M-034` 逆向状态推进为部分已扒，`VS-008` 推进为可开始。
- 把下一推荐任务切换为 `TASK-SLICE-005`，用于实现第一个技能/子弹切片。

更新文件：

- `docs/reverse-engineering/projectiles-index.md`
- `docs/reverse-engineering/combat-rules-index.md`
- `docs/reverse-engineering/roles-index.md`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/vertical-slices.md`
- `docs/tasks/task-board.md`
- `docs/tasks/task-history.md`

验证：

- `npm run check:workflow` 通过。

### TASK-SLICE-005

完成时间：

- 2026-05-19

完成内容：

- 新增 `src/systems/ProjectileSystem.ts`，实现 `Role2.sgq -> hit5` 等价的首个固定位置 projectile：生成点约为角色前方 175、上方 110，生命周期独立推进，并在来源受击/死亡或持续时间结束时清理。
- 在 `src/assets/AssetManifest.ts` 登记 `skill-projectile.role2.sgq.hit5` 占位 key 和 `Role2Bullet5`/`Role2_hit5` 真实资源缺口。
- 扩展 `src/scenes/TestScene.ts`，让 Role2 等价角色可通过第一技能键释放占位 `sgq hit5`，命中 `Monster30` 时通过 `DamageEvent` 造成 `attackKind = magic`、击退 `[5,-2]` 的伤害。
- 支持 `hitIntervalFrames = 16` 的重复命中周期：同一 projectile 在同一命中周期内不会对同一目标重复扣血，下一周期可再次结算。
- 更新 `VS-008` 为已完成，推进 `M-025/M-034/M-035` 的现代复现状态，并新增后续 Ready 任务 `TASK-SETTINGS-009` 用于继续定位真资源和更多弹体映射。

更新文件：

- `src/systems/ProjectileSystem.ts`
- `src/scenes/TestScene.ts`
- `src/assets/AssetManifest.ts`
- `docs/domain/glossary.md`
- `docs/reverse-engineering/projectiles-index.md`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/vertical-slices.md`
- `docs/tasks/task-board.md`
- `docs/tasks/task-history.md`

验证：

- `npm run build` 通过。
- `npm run check:workflow` 通过。

### TASK-SETTINGS-010

完成时间：

- 2026-05-19

完成内容：

- 细读 `KeyBoardControl.as`、`BaseHero.as`、`User.as`、`Config.as`、`SkillControl.as`、`SkillSetControl.as` 和 `Role2.as`，建立 `docs/reverse-engineering/skills-input-index.md`。
- 确认正式普通技能槽只有 5 个：P1 为 `Y/L/U/I/O`，P2 为小键盘 `8/3/4/5/6`；`sendSkill(5)` 是 Space/小键盘 0 的角色特殊，`sendSkill(6)` 是 H/小键盘 7 的法宝，不走 `User.skillbykey`。
- 记录 `User.skillbykey` 最小字段 `{ skillName, keys, needLh, slev }`，以及 `SkillControl` 学习后自动绑定空槽、`SkillSetControl` 拖拽替换绑定的边界。
- 确认原版没有统一技能释放 CD；技能释放主要靠绑定解析、MP 门禁、`isAttacking()`/`isBeAttacking()` 和动作持续时间限制，`attackInterval` 是 projectile 持续命中间隔，不是释放冷却。
- 细化 `Role2.sgq`：正式槽解析到 `sgq` 后，按 `consumeMP[level] * 0.55 * 35173 / 25958` 扣 MP，未攻击/未受击时进入 `hit5` 并生成现有 `Role2Bullet5` 等价 projectile。
- 细化 `Role2.smb`：第一段按 `consumeMP[level] * 1.2 * 35173 / 25958` 扣 MP 并进入 `hit4_1`；`hit4_1` 中再次按同一绑定槽且第一段 projectile 仍活跃时可进入 `hit4_2`，第二段不再扣 MP。
- 更新 `roles-index.md`、`projectiles-index.md`、`mechanics-index.md`、`vertical-slices.md`，并把下一推荐任务切到 `TASK-SLICE-008`。

更新文件：

- `docs/reverse-engineering/skills-input-index.md`
- `docs/reverse-engineering/roles-index.md`
- `docs/reverse-engineering/projectiles-index.md`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/vertical-slices.md`
- `docs/tasks/task-board.md`
- `docs/tasks/task-history.md`

验证：

- `npm run check:workflow` 通过。

### TASK-SETTINGS-011

完成时间：

- 2026-05-22

完成内容：

- 细读 `BuySkill.as`、`SkillControl.as`、`SkillSetControl.as`、`PassiveSkillControl.as`、`User.as`、`MemoryClass.as`、`SaveInter.as`、`RoleInfo.as`、`GameInfo.as`、`KeyBoardControl.as` 和 `Config.as` 中与技能学习、升级、绑定和存档相关的所有代码。
- 大幅更新 `skills-input-index.md`，新增 6 个章节：技能学习（心法树、buy、空槽顺序、isstudyskill 格式）、技能升级（双公式、等级限制、灵魂消耗曲线）、拖拽绑定 UI（五框 hitTest、P1/P2 键值映射、unshift 置顶）、被动技能（五槽、curLevel/5 上限）、存档持久化（User.getSaveObj 全字段、MemoryClass 顶层结构、文件格式）和现代数据模型建议（TypeScript 类型、核心数据流、关键边界）。
- 确认技能学习上限恒为 10（加载时强制 setSkillLimit(10)），心法升级消耗为 100/200/500/1000/2000 灵魂，空槽顺序 P1 为 Y→U→I→O→L、P2 为 8→4→5→6→3。
- 确认绑定排序规则：新绑定 unshift 到数组最前，旧绑定移到末尾；只有前 5 个参与 returnSkillNameBySkillKey 解析。
- 确认 UI 快捷键 C/V/B/N/Esc（P1）和 小键盘 / * -（P2）在 GameInfo 存在时才生效，打开技能面板时会暂停游戏并屏蔽战斗输入。
- 在 `skills-input-index.md` 第 11 节给出了含具体类型和公式的最小现代数据模型。
- 更新 `M-016`（UI 快捷键）逆向状态、`M-041`（技能学习/绑定）逆向状态、`M-044`（存档）逆向状态。
- 更新 `VS-008` 后续边界说明，明确下一实现任务 `TASK-SLICE-009` 可直接按现代数据模型搭建完整技能 UI。

更新文件：

- `docs/reverse-engineering/skills-input-index.md`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/vertical-slices.md`
- `docs/tasks/task-board.md`
- `docs/tasks/task-history.md`

验证：

- `npm run check:workflow` 通过。

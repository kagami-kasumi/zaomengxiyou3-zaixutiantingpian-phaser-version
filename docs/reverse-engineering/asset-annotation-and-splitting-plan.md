# 资源标注与帧拆分工程审阅稿

本文是后续“标注工程”和“拆分工程”的对话入口。它不重新抽取资源，也不修改 `extracted_flash/`；目标是把已经到手的资料转化成可审阅、可接入、可暂停和可恢复的资产工作流。

## 当前结论

已完成的事实：

- `再续天庭1.1.exe` 的二次抽取已完成，最终资料目录是 `extracted_flash/resources_by_swf/`。
- 可靠核心图片只有 144 张，另有 3 张坏图。
- FFDec 导出的声音容器不可直接当作完整音乐/音效库。
- Role1、Role4、Role5 的关键战斗真素材名只在 AS3 中出现，没有在当前非脚本资源中命中。
- 不完整的 `-export all` 派生帧目录不再保留，也不再作为最终资源来源。

因此后续不应再围绕“同一个 EXE 继续抽取”展开。真正要做的是两个不同工程：

- 标注工程：把现有资源、AS3 资源名、现代稳定 key、用途和缺口关系整理成可接入清单。
- 拆分工程：只在确实需要逐帧视觉还原时，针对少量目标符号或动作做选择性拆分。

## 标注工程目标

标注工程要回答四个问题：

1. 这个资源在原版里是什么。
2. 现代工程应该用哪个稳定 key 引用它。
3. 当前工作区有没有可用素材。
4. 后续是直接接入、继续缺失登记，还是需要进入拆分决策。

标注工程不负责：

- 重新导出整个 Flash。
- 把所有数字图片人工命名一遍。
- 在事实不足时猜测资源用途。
- 直接改玩法、数值或战斗系统。

## 推荐标注表

后续可以新增 CSV 或 Markdown 表，建议字段如下：

| 字段 | 含义 |
| --- | --- |
| `stableKey` | 现代工程使用的稳定资源 key，例如 `normal-attack-effect.hero1.hit1`。 |
| `as3Name` | AS3 或运行时资源名，例如 `Role1Bullet1`。 |
| `sourceKind` | `script-reference`、`symbol-class`、`image`、`svg-shape`、`frame-capture`、`manual`。 |
| `sourcePath` | 当前证据路径，例如 AS3 文件、图片、SVG 或 `symbols.csv`。 |
| `symbolId` | 若来自 Flash character id，记录数字 id；无法确认则留空。 |
| `scope` | `hero`、`monster`、`projectile`、`effect`、`ui`、`scene`、`audio`。 |
| `usage` | 普攻、技能、地图背景、碰撞标记、UI 图标等用途。 |
| `status` | `ready`、`placeholder`、`missing-original`、`needs-annotation`、`needs-splitting`、`rejected`。 |
| `confidence` | `confirmed`、`probable`、`unknown`。 |
| `nextAction` | 直接接入、人工复核、等待补资源、进入拆分必要性评估。 |

标注的核心原则是“少而准”。优先从现代代码已经需要的 key 和 AS3 已确认的资源名开始，不做全目录无差别命名。

## 标注优先级

第一批只标注会影响当前现代复现质量的资源：

1. 五角色普攻附属对象和本体动作。
2. 已实现技能 projectile 和命中特效占位 key。
3. `Monster30`、`Monster30Bullet1`。
4. `sl11`、`bg11`、`floorBg1`、`StageListener11` 等首关视觉和碰撞线索。
5. UI 中已进入现代实现的面板、图标和按钮。

暂不标注：

- 当前现代实现还没有入口的远期关卡。
- 无 AS3 引用、无 SymbolClass、无视觉上下文的孤立数字图。
- 已确认损坏或 0 byte 的图片。
- 当前 EXE 未恢复出的完整音频库。

## 拆分工程的默认立场

默认不拆几十万帧。

原因：

- 全量帧拆分会制造海量重复图片，目录体积、检索成本和人工心智负担都会失控。
- Phaser 不需要 Flash 的时间轴结构才能实现接近原版的 2D 动作表现。
- 当前现代工程的目标是外观、玩法、数值、手感和流程尽量接近原版，不是复刻 Flash 内部资产组织方式。
- 大部分战斗表现可以用 Phaser 的 spritesheet、atlas、tween、particle、blend、bitmap font、camera shake 和短寿命 effect object 达到接近观感。

所以拆分工程必须先证明“必要”，不能因为存在几十万帧就默认要拆完。

## Phaser 能达到时的方案

如果视觉目标可以用 Phaser 达到，就不做逐帧拆分。推荐路线：

1. 使用现代稳定 key 保留资源接口。
2. 用已有图片、SVG、占位图或手工绘制小图做 atlas/spritesheet。
3. 用 Phaser 动画、tween、粒子和混合模式重建运动、缩放、透明度、拖尾、闪烁和命中反馈。
4. 用 AS3 只校准行为事实：生成时机、方向、跟随对象、持续帧数、命中窗口、伤害段数。
5. 视觉差异通过原版录屏或人工审阅逐步调参，而不是一次性拆全量帧。

适合不拆的对象：

- 简单斩击、光效、弹体、命中闪光。
- 可由少量贴图加 tween 复现的技能特效。
- UI 面板、按钮、图标等静态或低帧率资源。
- 地图背景中可以直接用图片或分层 tile 还原的部分。

## 必须评估拆分的场景

只有出现以下情况，才进入拆分必要性评估：

- 角色本体动作的姿态和帧间变化无法用现有素材或简单补绘接近。
- 某个 MovieClip 含复杂 timeline、嵌套动画、mask、filter、morph shape 或逐帧手绘变化。
- 某个特效的视觉识别度很高，Phaser 参数化重建后明显不像原版。
- 地图或 UI 依赖 Flash 时间轴中的精确层级、遮罩或关键帧。
- 用户明确要求某个对象达到“视觉近似原版录屏”的高标准。

拆分评估必须针对一个对象或一个动作族，例如 `Role1Bullet1/3/4/5`，不能把整个 EXE 或整个 SWF 当作拆分对象。

## 拆分必要性判定表

每个候选对象先填这个表，再决定是否拆：

| 问题 | 通过条件 |
| --- | --- |
| 是否有明确 AS3 资源名或 SymbolClass 链路？ | 有稳定名字或可追踪 id。 |
| 是否影响当前可玩切片？ | 影响当前角色、怪物、关卡或 UI。 |
| Phaser 重建是否已经试过？ | 已有占位或参数化方案，并能指出差距。 |
| 差距是否影响用户感知？ | 动作读感、技能识别或场景辨识明显受损。 |
| 是否能选择性拆分？ | 可以限定到一个符号、动作或短帧段。 |
| 是否有验收方式？ | 有原版截图、录屏、AS3 帧数证据或人工审阅标准。 |

只有这些问题大多通过，才把状态标为 `needs-splitting`。

## 如果 Phaser 不能直接达到

如果确认 Phaser 参数化重建无法接近原版，优先使用以下方法，按从轻到重排序：

1. 选择性导出单个符号或动作族为 PNG 序列，再打成 atlas。
2. 从原版运行画面录制目标动作，只截取少量关键动作帧，用于人工临摹、对齐或 atlas 制作。
3. 复用 FFDec 已导出的 SVG shape，手工组合成 Phaser 可加载的 SVG/PNG 图层。
4. 对复杂角色动作使用少量关键帧 atlas，加 Phaser tween 补过渡。
5. 对极高识别度特效使用帧动画，其他低识别度光效仍用 Phaser 粒子和 tween。

仍然禁止：

- 全量导出几十万帧作为默认方案。
- 把未完整导出的派生帧目录重新变成主资料来源。
- 因一个资源问题重新打开“资源获取工程”。
- 为拆分引入需要从 GitHub 下载和安装的复杂软件；如确实需要，按 `AGENTS.md` 规则交给用户手工处理。

## 最小拆分产物

每次真正拆分最多交付一个最小资源族：

- 一组 PNG 序列或 atlas。
- 一份 manifest 注册建议。
- 一份来源说明：来自哪个 SWF、哪个符号、哪个动作、多少帧、帧率或持续时间。
- 一份验收说明：现代场景中如何观察它，和原版差异还剩什么。

文件命名建议：

```text
public/assets/original/<scope>/<stableKey>.atlas.png
public/assets/original/<scope>/<stableKey>.atlas.json
docs/reverse-engineering/asset-annotations/<scope>.csv
```

只有用户审阅同意后，再把具体资源接入任务写入 `docs/tasks/task-board.md`。

## 后续对话入口

如果要重开“标注工程”对话，可以从这段开始：

```text
请按 docs/reverse-engineering/asset-annotation-and-splitting-plan.md 启动标注工程。
本轮只处理一个资源族，优先从五角色普攻或首关资源里选。
先读取 extracted_flash/reports/EXTRACTION_REPORT.md、docs/reverse-engineering/assets-index.md、docs/reverse-engineering/combat-assets-gap-plan.md 和相关 AS3。
不要重新抽取资源，不要拆全量帧。
输出标注表和下一步接入/拆分建议。
```

如果要重开“拆分必要性评估”对话，可以从这段开始：

```text
请按 docs/reverse-engineering/asset-annotation-and-splitting-plan.md 对一个具体资源族做拆分必要性评估。
先判断 Phaser 参数化重建能否达到接近原版视觉；能达到就不拆。
如果不能达到，只给选择性拆分方案，限定到一个符号或动作族，不处理几十万帧。
```

## 用户审阅点

请优先审阅以下决策：

1. 是否接受“默认不拆几十万帧，只做选择性拆分”的原则。
2. 标注工程第一批是否以五角色普攻、已实现技能 projectile、`Monster30` 和首关资源为优先。
3. 是否允许后续新增 `docs/reverse-engineering/asset-annotations/` 存放 CSV 标注表。
4. 视觉验收是以“接近原版观感”为准，还是对某些对象要求“逐帧近似”。


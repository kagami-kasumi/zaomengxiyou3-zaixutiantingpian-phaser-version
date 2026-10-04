# Monster2 聚拢与公共英雄坐标合同

2026-10-04，`TASK-SETTINGS-257B`。本项完成原 Tween 和必要公共坐标链的有限行为补证，并与已完成的 257A 联合核销父 257。纯行为输入为 [sidecar](reference/monster2-gather-coordinate-contract.json)，`contractId=task-settings-257b.monster2-gather-coordinate`，状态 `verified-bounded-coordinate`。没有修改 `src/`、`public/` 或原语料；Monster2 的真实承伤/HP 仍交 `TASK-SETTINGS-258`，不宣称实现就绪或现代复现完成。

## 结论与有限域

- 正常 Stage1-2 路径先运行地图淡入 Tween，后注册世界监听。因此每个自然广播先执行 Tween，再执行 MainGame 世界；世界内部先怪物、后英雄。聚拢请求发生后，英雄同一世界步仍可移动；Tween 延迟到首次 render 才捕获起点。不能把请求时坐标直接当插值起点。
- `doHi2` 复制源的同父 local 根坐标为终点，持续一秒。原库默认 ease 是 `1-(1-t)^2`，时钟为原库 `getTimer()*0.001`；20/24/30 是世界 host 档位，不是每秒必定获得相同样本数的 Tween 固定帧时钟。
- 原 Sprite 的 x/y 写入向零截断到 1/20 像素。浮点运算顺序先于 twip 转换，`tick/fps-startTime` 不能任意改写成代数等价表达式后宣称逐值相同。此处是原运行坐标语义，不是新批准的误差容差。
- 先 Tween、后世界意味着移动、重力、墙体和屏幕修正可叠加或覆盖该帧 Tween 坐标；Tween 结束后的世界步仍可继续移动。独立顺序探针还证明移除并重注册监听会改变广播先后，不能从受控 preflight 两种顺序中任选一种。
- 原 `stopGame` 移除世界监听并调用 `pauseAll(true,true)`；恢复先重注册世界监听，再 `resumeAll()`，暂停时间移入 `cachedStartTime`。正常入口及恢复后的真实广播均保持 Tween→世界。
- 同一目标再次请求采用 TweenMax 的 AUTO/2 属性覆盖；新请求首次初始化时替换旧 x/y，并以当时坐标重新开始一秒。自然运行额外执行活动第二请求被第三请求覆盖，避免只测已结束 Tween。
- 原 Config 只按是否死亡过滤请求，ready 本身不排除（沿用 256）。已有 Tween 不因之后的 HP 死亡、真实英雄 destroy、真实源 destroy 自动取消；英雄离开显示树和世界数组后，原 Tween 仍持有对象并写到终点。源 destroy 的 alpha 淡出独立于英雄 x/y。
- 原 `MainGame.destroyGame` 调用真实 `PhysicsWorld.destroy`、英雄清理，最后 `killAll(false)`。退出冻结当前值，不强制跳终点；退出之后继续采样六个自然广播，断言不受测试 dispose 的额外清理掩盖。

有限 fixture：20/24/30 × P1/P2/双方；静止、移动、重力、屏幕两边、静态平墙、暂停恢复、覆盖、HP 死亡、英雄 destroy、源 destroy、Scene 退出共 12 模式。共享链使用原 StageCommon `ObjectBaseSprite`；形状、scale 和 bounds 引用 257A `/profiles/0`、`/targets/0`，不是新手抄视觉真值。原 BaseObject/英雄/world/暂停/清理方法原文执行；完整键盘/五角色动作、宠物/装备/法宝更新、网络、动态/斜墙、海水/buff/enforceSpeed 和移动镜头不在此有限域。相机与其他服务固定，不把这些样本称为完整关卡物理或正式游戏旅程。HP 是显式属性输入，未执行真实承伤 producer。

## 六段证据链

AS3 根：`local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts/`。逐文件/方法 SHA-256、原 DoABC 标签 hash 和 locator 在 sidecar `/sources`；实际生成 AS3、SWF、原始日志与报告绑定在 `/evidence`。

| 合同项 | 局部与共享证据 | 几何/坐标 | 等级与反证 | 验证/消费者 |
| --- | --- | --- | --- | --- |
| 请求与起点 | Monster2.doHi2:267；Config.getPlayerArray:1122；TweenLite/TweenMax 初始化和 renderTime | 源、英雄同父 local 根；终点复制，不是屏幕位置 | 交叉确认；duration、world-before-tween 拒绝；HP producer 未知 | 原方法+原 ABC，144 共享轨迹；Stage12/Registry 将来消费 |
| 正式注册顺序 | GMain.showStageMap:434..451 → selectStageOver/startFighting → startGame:595..598；MainGame.nextDoAfterLoad:786..820；TweenCore 首次构造 → TweenLite.initClass:130 | 独立 Shape 广播，不依赖图像层排序 | 静态路径与自然原库交叉确认；直接绕过地图的任意启动顺序不外推 | 18 场自然运行；初始化坐标与上一 EXIT 独立匹配 |
| 世界竞争写入 | MainGame.__enterFrame:824；PhysicsWorld.step:470..646；BaseObject.step/checkCanMove/nearToWall；BaseHero.step:1679/move:1941 | 257A 实际英雄碰撞体，原 localToGlobal/globalToLocal 屏幕修正；平墙为显式试验输入 | 交叉确认；move-sign、screen-clamp、wall-snap 拒绝；上述排除分支不冒充已测 | 每 tick x/y/vx/vy/生命周期独立数值对照；HeroParty 的 movement 仍是现代位置 owner |
| 时钟/量化/覆盖 | TweenLite.updateAll:211、easeOut:193、原 TweenMax AUTO 初始化与 PropTween 写入 | Sprite 原生 twip 量化；纯行为 sidecar 不套 UI Schema | 交叉确认；受控根时间、自然时间分别记录；不允许手写 ease 替换执行库 | 原 ABC 4,832 状态、自然每次 callback 数值/起点/终点检查 |
| 暂停与死亡 | MainGame.stopGame:620/continueGame:674；BaseHero.isDead:2234/destroy:2386 | 实际目标对象保留；无新的视觉许可 | 交叉确认；pause-tween、hero-kills 拒绝；HP 置零不是承伤计算 | 逐段 cachedTime/paused、移除数组与显示树、恢复后广播顺序 |
| 源/Scene 生命周期 | Monster2.destroy:305；BaseMonster.destroy:751；PhysicsWorld.destroy:716；MainGame.destroyGame:721 | 登记对象清理与坐标引用生命周期；不验退出页面外观 | 交叉确认；source-kills、exit-tween 拒绝；M2-09 门合同复用 256 | 真实源/世界/英雄方法；退出后先采样再 dispose |
| 现代映射与双验证 | Stage12Scene/MonsterRuntimeRegistryBridge/Stage1CombatSystem/HeroPartyRuntimeBridge | 257A 空间另行 verified，234 碰撞像素精确许可不扩大 | 确认消费缺口；没有现代运行验收 | 现有 Stage1Combat 仍通用 activeAttack/承伤，HeroParty 仍投影 member.movement；不能把 Phaser 默认 Tween 当原合同 |

源级数学预期与自然 callback 的 `cachedTime`、PropTween 起点、原生 Sprite 写入交叉比较；自然起点必须匹配前一 EXIT 的实际位置，不能只拿库内 ratio 自证。两次自然运行分别验证不变量，保留真实计时抖动，不要求天然日志逐毫秒相等。两份共享受控结果逐字段一致。

## 验收与反证

- 原库受控 4,832 状态，两次相等，独立 ease/量化/暂停/覆盖/脱离/kill 预期零差异。
- 原共享链 108 组/5,436 世界态/7,248 英雄态，规范化为 144 条 owner 轨迹；独立 x/y/vx/vy/死亡/ready/parent/暂停/数组清理对照零差异，两次相等。
- 20/24/30 × P1/P2/双方 × 两次自然运行，共 18 场；每次报告 2,318 采样记录。逐 callback 验证起点、ease、量化、两个完整一秒终点、活动覆盖；逐场验证暂停冻结/恢复顺序、死亡和移除后继续、真实 Scene 退出冻结。自然时钟范围在 sidecar `/acceptance/nativeRuns`。
- 9 类编译源/运行变异均拒绝：移动符号、屏幕 clamp、墙体落点、漏停 Tween、退出漏 kill、英雄销毁误杀 Tween、源销毁误杀 Tween、两秒时长、世界先于 Tween。另有独立数据损坏负例，明确不计为编译源变异。
- 支架调试中修复了未初始化根时间线、缺少原动态字段和错误重设自然时间原点；这些失败不计通过。最终保留原自然时钟，不从 host `getTimer` 强行改原库 epoch。Python LSP 缺 basedpyright，未安装；实际 Python、AS3 编译/原 AIR 执行与独立 verifier 为本批工具验证。

## 父 257 联合核销与剩余输入

| 父责任 | 完成证据 | 边界 |
| --- | --- | --- |
| 三对象14/20/14帧、双向显示树、屏外完整性 | 257A verified manifest、96显示态/176对象及独立原生投影 | 不重生成、不改原图 |
| 两普攻实际英雄/宠物像素命中 | 257A 392,768案例；精确234像素许可及hash已绑定，命中布尔零差异 | 不外推容差 |
| 原自然出生/首末检测/裸MC EXIT | 256 + 257A 10,368相位/780检测绑定 | 裸MC暂停继续、源destroy不清裸MC的合同保持 |
| Tween默认曲线、量化、时间、实际世界竞争 | 本项 `/rules`、`/trajectories`、`/acceptance` | 仅上述有限坐标域 |
| 暂停/覆盖/移动/死亡/英雄与源destroy/Scene退出 | 本项原方法+原ABC和18场自然运行 | 不替代真实HP接收或完整角色/关卡系统 |
| M2-01..09、自身无伤害producer | 原256 sidecar完整引用 `/references/inheritedContracts` | hit2不能因字典有power28就增加伤害 |
| 真实HP未知 | **仍未知**，唯一后续 `TASK-SETTINGS-258` | 父空间/控制完成不等于Monster2实现就绪 |

Luna 只读核对了初始注册路径及源/英雄/世界清理；主 agent 采纳其要求补真实 PhysicsWorld.destroy、自然数值与恢复后顺序的意见并执行复验。未采纳将这些仍在两工作包内的补充另拆任务的建议；无新增完整角色/网络/全关卡重建要求。257B 与父257归档，Active 功能线、204/all、194、VS-067 均保持未完成。

## 复验与交付

```text
python tools/monster2-gather/controlled.py
python tools/monster2-gather/verify_controlled.py
python tools/monster2-gather/capture_shared.py
python tools/monster2-gather/capture_shared.py --repeat
python tools/monster2-gather/verify_shared.py
python tools/monster2-gather/capture_shared.py <mutation-id>
python tools/monster2-gather/finalize.py
python tools/monster2-gather/finalize.py --check
npm run check:workflow
npm run audit:problems
```

9 个 mutation-id 见上表或 `finalize.py` 的 `MUTATIONS`。`ordering.py` 是保留的独立广播顺序调查，不作为完整世界完成证据。`finalize --check` 核对原日志与报告、生成源 hash、原 AS3/ABC/空间引用和所有独立验收后比较 sidecar，不能仅用 JSON 可解析冒充 verified。

源码工具、约1.4MiB精简行为 sidecar 和本合同随 Git 交付。原生生成源、SWF、trace 与报告保留在 `local-resources/regima/task-outputs/TASK-SETTINGS-257B/`、`docs/tasks/evidence/TASK-SETTINGS-257B/`，供258及正式消费复验；不依赖它们运行游戏。没有新 PNG/视觉 manifest 或现代视觉例外。原生基准保留到 Monster2 正式验收后再评估；本次 Python cache 的递归清理被自动审批拒绝，未删除；两个生成缓存目录仅加入本地 Git exclude，工具已禁用后续 bytecode 生成。

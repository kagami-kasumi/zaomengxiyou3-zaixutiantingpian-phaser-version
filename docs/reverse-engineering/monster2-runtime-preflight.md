# Monster2 联合实现前置核对

2026-10-04，`TASK-SLICE-260` 执行前预检。结论为 **生产顺序冲突，拆分公共坐标前置**，不是 Monster2 实现完成。没有修改本批 `src/`、`public/` 或任何原版 expected。

## 证据与边界

| 事实 | 精确入口 | 等级与含义 |
| --- | --- | --- |
| 原自然入口先 Tween，世界内怪物回调先于英雄移动/墙/屏幕修正 | `reference/monster2-gather-coordinate-contract.json#/rules/originalOrder`、`/rules/initialization`，257B 合同六段矩阵与18场原生运行 | 交叉确认；聚拢请求之后同世界步英雄仍移动，首次 render 才捕获起点 |
| 正式 Stage1-2 先完整英雄更新，后怪物更新 | `src/scenes/stage12/Stage12GameplayBridge.ts:121` 调用 `heroes.update`，`:152` 调用 `monsters.update` | 确认事实，静态生产链；不是本批浏览器运行结果 |
| 前者实际写英雄坐标并推进战斗、投射物、宠物和视图 | `src/scenes/HeroPartyRuntimeBridge.ts:334` → `src/systems/HeroPartyRuntimeSystem.ts:146` 的 `updateHeroPartyMovement`；bridge `:335` 更新宠物，`:349` 同步显示 | 确认事实；不能简单追加一个请求后再调用第二次英雄更新，否则重复推进 |
| 后者合并怪物物理/效果/AI、显示、敌方接收、英雄攻击与清理 | `src/scenes/MonsterRuntimeRegistryBridge.ts:66`；`src/systems/MonsterRuntimeRegistrySystem.ts:98` 起的循环 | 确认事实；Monster2 自然回调直接插入该入口会晚于英雄移动 |
| 旧攻击显示独立于伤害且交替选技 | `src/systems/Stage12MonsterVisualSystem.ts:152`、`:215`；`src/systems/Stage1CombatSystem.ts:294` | 确认事实；后续B必须撤销Monster2旧生产路径，其他怪物不随之重写 |
| 已存在暂停外 Game 显示时钟 | `src/scenes/PetWorldDisplayBridge.ts:4`；`PetAttachedDisplayLifecycle.ts:20` | 确认事实；前者可复用/适配，后者要求宠物root/body。不能仅因名字含Pet宣布需新公共时钟 |

原版坐标仍是257B已定义的同父local根，现代位置权威仍为现有HeroParty movement；257A负责显示注册点/位场。预检不重新推导坐标、不扩展234碰撞像素许可。源真值未改，不重复执行原AIR。尚未证明重排后的实际伤害、物理或角色帧行为；这些是前置与最终联合任务的验收，不得由静态调用顺序冒充。

## 拆分裁决

命中260第二条拆分触发“与已证物理顺序冲突”：需要先交付现有HeroParty/Registry之间的有序调用接缝及真实坐标Tween控制，再接完整Monster2 producer。它是公共owner调度变更，不能只在View增加聚拢动画解决。

- `TASK-SLICE-260A`：唯一Ready；公共坐标聚拢与Stage1-2有序接缝。保持一个坐标/HP owner；消费257B全部有限坐标输入，验证暂停、覆盖、移除后引用、退出和原物理竞争。允许受控请求调用真实owner，必须明确尚无Monster2自然producer。
- `TASK-SLICE-260B`：Planned；A完成后自然发起聚拢，接入身体/两弹/裸MC，并重验父260全部M2-01..09、257A/257B/258和正式双owner旅程。A的局部通过不能豁免B联合验收。
- 父260保持Split与原验收全文；204/all、194、VS-067及功能线均未关闭。

Luna只读审计确认调用顺序冲突与旧消费者；采纳这一证据。未把“资源导出需支持空帧”作为独立工具链拆分理由。其建议将全部两弹检测放到postStep尚无原相位依据，**不采纳为调度合同**；A/B必须依据256/257/258真实检测相位决定具体切口，不冻结猜测的pre/post API。

## 验证与交付

本批只有静态生产链核对、任务拆分和文档更新。`check:structure`为0、9项已有warning；未在warning文件新增逻辑。收尾运行`generate:harness`、`check:workflow`、`audit:problems`及定向`git diff --check`；日志位于本地`.tmp/task260-*.log`。不运行未改生产代码的build/系统或pet gate，不把259既有结果称为260新结果。实际命令退出码见本次交接。

Git现存259及协作规则改动保留；本批仅新增此预检、A/B合同及同步父合同/任务索引/覆盖/集中审计。原基准及中间输入仍由A/B消费，不做清理。

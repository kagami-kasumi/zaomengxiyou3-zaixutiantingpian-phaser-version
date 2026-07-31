# 可玩关卡运行框架 ADR

状态：Accepted（`TASK-ARCH-016A` 冻结合同；运行时代码由 `016B..D` 分批落地）

## 1. 决策

五个现有关卡与后续正式关卡统一消费组合式 `PlayableLevelRuntime`。公共 Runtime 是共同初始化、队伍/玩家、镜头/HUD、移动/战斗调度、失败、出口、结果、保存、路由和销毁的唯一 owner；关卡只提供 `LevelDefinition`、`LevelEncounter` 与有证据的窄 `LevelWorldAdapter`。

本决策不建立万能 `BaseLevel`，不把 Phaser 显示对象传入纯系统，也不把原 SWF 的打包位置解释为现代行为 owner。英雄/怪物的动画、AI、物理、伤害、奖励和掉落仍由实体系统持有；关卡只能引用稳定类型、视觉 id、出生计划和遭遇事件。

原版共同门行为有直接证据：`PhysicsWorld.addSubObj()` 将带 `isTransferDoor` 子对象的对象统一加入 `transferDoorArray`，`BaseHero.checkTransferDoor()` 统一检查可见门与英雄碰撞。各关 SWF 内嵌不同门 Symbol 只证明视觉 provenance，不证明行为需要逐关 owner。

## 2. 合同边界

以下是实现合同，不是本 task 的运行时代码：

```ts
type PlayableLevelRuntime = Readonly<{
  create(): void;
  update(deltaMs: number): void;
  destroy(): void; // 幂等
}>;

type LevelDefinition = Readonly<{
  id: string;
  sceneKey: string;
  assetBundle: string;
  worldBounds: Readonly<{ left: number; top: number; width: number; height: number }>;
  heroSpawns: readonly Readonly<{ slot: PlayerSlot; x: number; y: number }>[];
  transferDoor: Readonly<{
    visualId: string;
    bounds: Readonly<{ left: number; top: number; right: number; bottom: number }>;
  }>;
  unlockTarget: Readonly<{ unlockedStage: number; unlockedLevel: number }>;
  routes: Readonly<{ retry: string; next: string; back: string }>;
}>;

type LevelWorldAdapter = Readonly<{
  createWorld(): Readonly<{ platforms: readonly unknown[] }>;
  createTransferDoor(definition: TransferDoorVisualDefinition): TransferDoorView;
  setTransferDoorVisible(visible: boolean): void;
  destroy(): void;
}>;

type LevelEncounter = Readonly<{
  start(): void;
  update(deltaMs: number): readonly LevelEncounterEvent[];
  destroy(): void;
}>;

type TransferDoorVisualDefinition = Readonly<{
  id: string;
  textureKey: string;
  sourcePackage: string;
  sourceSymbol: string;
  sourceCharacterIds: readonly number[];
  origin: Readonly<{ x: number; y: number }>;
  frames?: readonly string[];
}>;
```

- `PlayableLevelRuntime` 编排既有 `LevelLifecycle` 与唯一 `LevelResultView`，但不重新定义终态、成绩或按钮规则。
- `LevelDefinition` 是只读内容配置；不保存 Phaser 对象、怪物 HP、当前波次或存档实例。
- `LevelWorldAdapter` 只跨越 Phaser/世界显示对象边界；地形矩阵、平台、机关视图和门视图属于它，玩法算法不属于它。
- `LevelEncounter` 只拥有停点、生成计划、波次、Boss、机关和特殊入口编排；怪物运行状态最终来自实体运行时 owner。
- `TransferDoorVisualDefinition` 只表达皮肤、原点、帧与来源；门显隐、碰撞、上键和完成提交属于公共 Runtime/Lifecycle。
- adapter 只能返回明确事件或快照。不得以回调把完整 Scene、Runtime 或存档 owner 反向交给关卡内容。

## 3. 权威 owner

| 职责 | 当前消费者/重复点 | 唯一目标 owner | 关卡可保留 |
| --- | --- | --- | --- |
| 队伍恢复、1P/2P、缺存档回退 | 四个 `Stage*Scene.init/create`；1-1 的 TestScene setup | `PlayableLevelRuntime` + 既有 `FormalPartyRuntime` 查询 | `LevelDefinition.heroSpawns` |
| 镜头 bounds/初始 scroll | 四个正式 Scene；1-1 TestScene | `PlayableLevelRuntime` | world bounds、窄镜头 adapter（仅有证据的纵向 1-1） |
| 玩家创建与销毁 | 四个正式 Scene 重复 image map/destroy；1-1 私有系统 | Runtime 的 player-view adapter | 出生点、英雄视觉 id；不得保留角色内部动画算法 |
| 战斗 HUD/五功能入口 | 各 Scene 安装；1-1 私有桥接 | Runtime 调用既有公共 HUD/feature owner | 无页面私有 owner |
| 移动/战斗帧调度 | 四个 GameplayBridge；`TestSceneUpdatePipeline` | Runtime scheduler 调用既有系统 facade | 动态平台、特殊机关的窄 adapter |
| 失败/通关终态 | 五个 `Stage*FlowModel` 已继承 `LevelLifecycle` | `LevelLifecycle` | 遭遇完成事件；不得定义同义 phase/倒计时/解锁提交 |
| 门显隐、碰撞与上键 | 四个 GameplayBridge 的 `setVisible(flow.doorVisible)`；1-1 bridge | Runtime + `LevelLifecycleBridge` + `TransferDoorView` | visual id、bounds、位置 |
| 结果页 | 四个 Scene 与 1-1 flow bridge 调用公共 presenter | `LevelResultView`，由 Runtime 唯一调用 | routes 与有证据的结果字段输入 |
| 保存、解锁与路由 | Scene 回调、1-1 save bridge | Runtime 调用既有 Save/party/asset-bundle facade | unlock target、retry/next/back route id；1-2 `fbEnter` 为窄特殊路由事件 |
| 销毁 | Scene、World、Gameplay 各自手工串联 | Runtime 幂等销毁栈 | adapter/encounter 自身幂等资源释放 |
| 英雄/怪物内部规则 | GameplayBridge/TestSceneWorldBridge 中仍有遗留接线 | Hero/Monster/Combat/Physics/Reward 系统 | 只引用 type/visual/reward profile id 与遭遇事件 |

## 4. 五关消费者与迁移矩阵

| 关卡 | 当前 Scene/World/Gameplay/Flow | 必须保留的内容差异 | 迁移 task | 兼容 facade 与删除条件 | 回归入口 |
| --- | --- | --- | --- | --- | --- |
| Stage 1-1 | `TestScene`、`TestSceneStage11Bridge`、`TestSceneStage11FlowBridge`、`TestSceneUpdatePipeline`、`Stage11FlowSystem` | 940×2970.45 纵向世界、四停点、巫鹰 Boss、纵向镜头、Boss 死亡显门、P1 W/P2 上键 | `016D` | 迁移前保留 TestScene bridges；接入 level11 character 45/41/44 后删除 `Stage13AssetKeys.transferDoor` 与 `stage-1-common` 门纹理兼容 | stage11 flow/resource、正式旅程、940×590 进入/战斗/Boss/门/结果 |
| Stage 1-2 | `Stage12Scene`、`Stage12WorldBridge`、`Stage12GameplayBridge`、`Stage12FlowSystem` | 五停点、双 Boss、普通门、`fbEnter` 特殊入口及 5-1 路由 | `016B` | 先由 Stage12 adapter 包装既有 world/gameplay；等专项与旅程通过后删除 Scene 公共骨架和私有门/结果 owner | stage12 flow/traversal/fb/resource、单/双人结果 |
| Stage 1-3 | `Stage13Scene`、`Stage13WorldBridge`、`Stage13GameplayBridge`、`Stage13FlowSystem` | 五停点、最大同屏 6/8、Monster5 Boss、普通门皮肤 | `016B` | 与 1-2 共用 Runtime/TransferDoorView；通过后删除 Scene 公共骨架，保留 encounter/visual adapter | stage13 flow/traversal/resource、单/双人结果 |
| Stage 2-1 | `Stage21Scene`、`Stage21WorldBridge`、`Stage21GameplayBridge`、`Stage21FlowSystem` | 五停点、冰刺/中景、Monster6 Boss、DEV QA 仅开发路径 | `016C` | adapter 保留冰刺视图和 QA 注入；公共初始化/门/结果/销毁不得留在 adapter | stage21、怪物视觉、正式旅程、940×590 |
| Stage 2-2 | `Stage22Scene`、`Stage22WorldBridge`、`Stage22GameplayBridge`、`Stage22FlowSystem` | 54 配置敌人、Monster16 Boss、火焰、Boss 阶段、DEV showcase | `016C` | adapter 保留火焰视图更新和 QA 注入；公共门/结果/保存/路由迁出 | stage22、五关怪物回归、正式旅程、940×590 |

迁移顺序固定为：016B 横向双关试点 → 016C Stage 2 → 016D Stage 1-1/TestScene 与未来模板。每批先建立公共 owner，再把消费者切到 facade，最后删除该批重复实现；不得一次性重写五关。

## 5. 显示列表与视觉基线

下表冻结迁移前必须保持的显示对象结构。矩阵和命中区的数值权威仍为各 `Stage*Layout`；迁移不得把世界坐标、图片裁剪原点和 SWF 注册点合并成一个坐标。

| 关卡 | 根/层级与矩阵 | 动态 child / 命中区 | door provenance | HUD/result |
| --- | --- | --- | --- | --- |
| 1-1 | `TestScene` 下独立 floor(-30)、background(-20)、foreground(-10)；世界宽 940、高 2970.45 | 四停点、纵向平台/镜头、巫鹰；门命中区=`stage11TransferDoor.bounds` | 目标必须回到 level11 character 45 容器及 41/44 两段动画；当前借用 level13 character 40 只是临时兼容 | 既有正式战斗 HUD；唯一 `LevelResultView` |
| 1-2 | floor 固屏；`stage12-root > sl12 > bgContainer(60.75,0) > bg12(-70,11)`；foreground(-200,494) | `fbEnter`、五停点/刷怪点、门=`stage12TransferDoor` | level12 `Stage12AssetKeys.transferDoor`，精确 Symbol/character 由 manifest/视觉索引持有 | 公共功能 HUD + 既有标题债；唯一结果 presenter |
| 1-3 | floor 固屏；`stage13-root > sl13 > bgContainer(0,0) > bg13(-90,0)`；foreground(-30,494) | 五停点/刷怪点、门=`stage13TransferDoor` | level13 character 40；child 36/39（20/19 帧） | 同上 |
| 2-1 | floor 固屏；`stage21-root > sl21 > bgContainer(0.25,0) > bg21(-20,0)`；midground/foreground 保持原顺序 | 冰刺动态视图、五停点、门=`stage21TransferDoor` | level21 专属 transfer-door asset/manifest provenance | 同上，DEV QA 文本不得进入正式模式 |
| 2-2 | floor 固屏；`stage22-root > sl22 > bgContainer(-25,0) > bg22(-20,0)`；foreground 后创建火焰与 midground，门最后加入 | 火焰动态视图、五波/Boss、门=`stage22TransferDoor` | level22 专属 transfer-door asset/manifest provenance | 公共功能 HUD；唯一结果 presenter |

迁移逐状态基线：

| 状态 | 必须保持 |
| --- | --- |
| 进入 | bundle 完成后创建；无正式队伍回存档页；1P/P2 owner、出生点、镜头和 HUD 正确 |
| 战斗 | floor/background/foreground 层级与矩阵不漂移；移动/战斗/怪物视觉继续由既有 owner 更新 |
| 波次/Boss/机关 | 只由对应 Encounter/adapter 表达；1-2 `fbEnter`、2-1 冰刺、2-2 火焰/Boss 阶段保持 |
| 门隐藏 | 未满足遭遇条件时不可见、不可交互 |
| 门显示 | Boss/末波条件只发出门可见事件；公共门视图显示，不创建现代占位层 |
| 门交互 | 可见、碰撞且对应玩家上键边沿才提交；完成幂等 |
| 失败 | 全员死亡与既有延迟进入公共失败终态；不保存解锁 |
| 结果 | 只显示原版 `GameWin`/`GameFail` 投影与既有成绩字段/按钮态 |
| 重试/下一关/返回 | 保持当前 party、bundle 路由、解锁和保存语义；按钮不可重复提交 |
| 销毁 | Runtime/adapter/encounter/view 可重复销毁；无残留输入、HUD、门或结果层 |

本 ADR 不批准任何新的现代可见例外。现存 placeholder hero、正式场景标题/QA 文本和 Stage 1-1 借用门纹理均是待迁移或既有视觉债，不因本合同升级为获批差异。016B..D 的视觉证据必须沿用各关既有 940×590 原 SWF/现代对照；未经用户批准不得新增暗层、标题、边框、现代门或结果页。

## 6. 静态防回填门禁

`npm run check:level-architecture` 维护显式遗留例外并执行自测：

- 禁止新增 `Stage*WorldBridge`、`Stage*GameplayBridge`、`Stage*FlowSystem` 和 `Stage*ResultBridge` 同义骨架。
- 新增正式 `Stage*Scene` 必须消费 `PlayableLevelRuntime`，不得直接调用结果 presenter、门显隐或场景路由。
- 当前五关遗留文件只能出现在脚本的显式 allowlist；016B..D 每迁移一批必须收缩 allowlist，不能新增例外。
- ADR 必须持续包含五个合同、五关矩阵、Stage 1-1 临时兼容删除条件和逐状态基线。

该门禁只阻止增量回填，不声称当前遗留已经治理。`PG-013` 只有在 016D 完成五关迁移后进入效果观察，并在首个后续新关卡直接消费公共 Runtime 后才满足关闭样本。

## 7. 证据索引

- 原版共同门登记/碰撞：`World/PhysicsWorld.as::addSubObj`、`base/BaseHero.as::checkTransferDoor`。
- 现代关卡证据：五关 `Stage*Layout`、四个正式 Scene/World/Gameplay/Flow，以及 Stage 1-1 TestScene bridges。
- 公共 owner：`LevelLifecycleSystem.ts`、`LevelLifecycleBridge.ts`、`LevelResultView.ts`、`LevelHeroMovementSystem.ts`、`FormalPartyRuntimeSystem.ts`。
- 视觉 provenance：`AssetManifest.ts` 与各关已有视觉/资源专项测试；Stage 1-1 真门目标为 level11 character 45/41/44。
- 问题与迁移治理：`PG-013`、`LINE-PRE-STAGE-2-3-COMPLETION`、`TASK-ARCH-016A..D`。

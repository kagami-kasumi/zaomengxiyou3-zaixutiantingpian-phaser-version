# 后续可玩关卡模板

新增正式关卡必须从本模板开始，不复制既有 `Stage*Scene/World/Gameplay/Flow` 骨架。

## 最小文件组

1. `StageNNLevelDefinition.ts`：只读 `PlayableLevelDefinition`，声明 identity、bundle、world bounds、P1/P2 出生点、门、解锁和路由。
2. 一个窄 world adapter：只创建地形、背景、机关视图与本关 `TransferDoorView`；必须幂等 `destroy()`。
3. 一个 encounter adapter：只编排停点、波次、Boss、机关和特殊入口，并向 Runtime 返回 `failed / cleared / 特殊结果`。
4. `StageNNScene.ts`：只恢复 `FormalPartyRuntime`、创建 `PlayableLevelRuntime`、转发 `update(delta)` 和在 shutdown 时幂等销毁。

```ts
export class StageNNScene extends Phaser.Scene {
  private partyRuntime?: FormalPartyRuntime;
  private runtime?: PlayableLevelRuntime;

  public init(data?: FormalPartySceneData): void {
    this.partyRuntime = resolveFormalPartyScene(data, import.meta.env.DEV);
  }

  public create(): void {
    this.shutdownLevel();
    if (!this.partyRuntime) return void this.scene.start('SaveSlotScene');
    this.runtime = createPlayableLevelRuntime(this, this.partyRuntime, stageNNLevelDefinition, {
      createWorld: createStageNNWorld,
      createEncounter: createStageNNEncounter,
    });
    this.runtime.create();
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.shutdownLevel, this);
  }

  public update(_time: number, delta: number): void { this.runtime?.update(delta); }
}
```

禁止把功能 HUD、全员失败、门完成提交、原版结果页、保存、下一关/返回路由、英雄/怪物算法或重复销毁栈写回关卡 Scene/World/Gameplay bridge。特殊关卡只能通过有证据、可测试的窄 adapter 或 `handleSpecialResult` 扩展。
